namespace Animate {

	/**
	 * A project is the logical container of all resources and functions related
     * to a user's hatchery editor project.
	 */
    export class Project extends EventDispatcher {

        public openEditors: Editor[];
        public activeEditor: Editor | null;
        public curBuild: Build;
        private _restPaths: { [ type: number ]: { url: string; array: Array<ProjectResource<HatcheryServer.IResource>> }; }
        private _entry: HatcheryServer.IProject;

		/**
		 * @param id The database id of this project
		 */
        constructor() {
            super();

            this.openEditors = [];
            this.activeEditor = null;
            this._restPaths = {};
            this._restPaths[ ResourceType.FILE ] = { url: `files`, array: [] };
            this._restPaths[ ResourceType.ASSET ] = { url: `assets`, array: [] };
            this._restPaths[ ResourceType.CONTAINER ] = { url: `containers`, array: [] };
            this._restPaths[ ResourceType.GROUP ] = { url: `groups`, array: [] };
            this._restPaths[ ResourceType.SCRIPT ] = { url: `scripts`, array: [] };
        }

        activateEditor( editor: Editor ) {
            if ( this.activeEditor )
                this.activeEditor.active = false;

            this.activeEditor = editor;
            this.activeEditor.active = true;
            this.invalidate();
        }

		/**
		 * Gets the DB entry associated with this project
		 */
        get entry(): HatcheryServer.IProject {
            return this._entry;
        }

		/**
		 * Sets the DB entry associated with this project
		 */
        set entry( val: HatcheryServer.IProject ) {
            this._entry = val;
            if ( typeof ( this._entry.tags ) === 'string' )
                this._entry.tags = [];
        }

        /**
		 * Gets a resource by its ID
		 * @param id The ID of the resource
		 * @returns The resource whose id matches the id parameter or null
		 */
        getResourceByID<T extends ProjectResource<HatcheryServer.IResource>>( id: string, type?: ResourceType ): { resource: T, type: ResourceType } | null {
            const types = this._restPaths;
            if ( type ) {
                for ( let i = 0, arr: Array<ProjectResource<HatcheryServer.IResource>> = types[ type ].array, l = arr.length; i < l; i++ )
                    if ( arr[ i ].entry._id === id )
                        return { resource: <T>arr[ i ], type: type };
            }
            else {
                for ( const t in types )
                    for ( let i = 0, arr: Array<ProjectResource<HatcheryServer.IResource>> = types[ t ].array, l = arr.length; i < l; i++ )
                        if ( arr[ i ].entry._id === id )
                            return { resource: <T>arr[ i ], type: <ResourceType>parseInt( t ) };
            }

            return null;
        }

        /**
		 * Gets a resource by its shallow ID
		 * @param id The shallow ID of the resource
		 * @returns The resource whose shallow id matches the id parameter or null
		 */
        getResourceByShallowID<T extends ProjectResource<HatcheryServer.IResource>>( id: number, type?: ResourceType ): T | null {
            const types = this._restPaths;
            if ( type ) {
                for ( let i = 0, arr = types[ type ].array, l = arr.length; i < l; i++ )
                    if ( arr[ i ].entry.shallowId === id )
                        return <T>arr[ i ];
            }
            else {
                for ( const t in types )
                    for ( let i = 0, arr = types[ t ].array, l = arr.length; i < l; i++ )
                        if ( arr[ i ].entry.shallowId === id )
                            return <T>arr[ i ];
            }

            return null;
        }

        /**
		 * Attempts to update the project details base on the token provided
         * @returns The project token
		 */
        updateDetails( token: HatcheryServer.IProject ): Promise<UsersInterface.IResponse> {
            const entry = this._entry;
            return new Promise<UsersInterface.IResponse>(( resolve, reject ) => {
                Utils.put<UsersInterface.IResponse>( `${DB.API}/users/${this._entry.user}/projects/${this._entry._id}`, token ).then(( data ) => {
                    if ( data.error )
                        return reject( new Error( data.message ) );
                    else {
                        for ( const i in token )
                            if ( entry.hasOwnProperty( i ) )
                                entry[ i ] = token[ i ];

                        if ( typeof ( entry.tags ) === 'string' )
                            entry.tags = [];
                    }

                    this.invalidate();
                    return resolve( data );

                }).catch(( err: IAjaxError ) => {
                    return reject( new Error( `An error occurred while connecting to the server. ${err.status}: ${err.message}` ) );
                });
            });
        }

        /**
		 * Loads a previously selected build, or creates one if none are selected
		 */
        loadBuild(): Promise<Build> {
            const username = User.get.entry.username;
            return new Promise<Build>(( resolve, reject ) => {
                let promise: Promise<any>;

                // If the project has a build then load it - otherwise create a new one
                if ( this._entry.build && this._entry.build !== '' )
                    promise = Utils.get( `${DB.API}/users/${username}/projects/${this._entry._id}/builds/${this._entry.build}?verbose=true` );
                else
                    promise = Utils.post( `${DB.API}/users/${username}/projects/${this._entry._id}/builds?set-current=true`, null );

                promise.then(( data: ModepressAddons.IGetBuilds ) => {
                    if ( data.error )
                        return reject( new Error( data.message ) );

                    this.curBuild = new Build( data.data[ 0 ] );
                    this.invalidate();
                    return resolve( this.curBuild );

                }).catch(( err: IAjaxError ) => {
                    return reject( new Error( `An error occurred while connecting to the server. ${err.status}: ${err.message}` ) );
                });
            });
        }

        /**
		 * Internal function to create a resource wrapper
		 * @param entry The database entry
         * @param type The type of resource to create
		 */
        private createResourceInstance<T extends HatcheryServer.IResource>( entry: T, type?: ResourceType ): ProjectResource<T> {
            let resource: ProjectResource<any>;

            if ( type === ResourceType.ASSET ) {
                const className = ( <HatcheryServer.IAsset>entry ).className!;
                const aClass = PluginManager.getSingleton().getAssetClass( className );
                if ( !aClass )
                    throw new Error( `Could not find asset class ${className}` );

                resource = new Resources.Asset( aClass, entry );
                this._restPaths[ type ].array.push( <Resources.Asset>resource );
            }
            else if ( type === ResourceType.SCRIPT ) {
                resource = new Resources.Script( entry );
                this._restPaths[ type ].array.push( resource );
            }
            else if ( type === ResourceType.CONTAINER ) {
                resource = new Resources.Container( entry );
                this._restPaths[ type ].array.push( <Resources.Container>resource );
            }
            else if ( type === ResourceType.GROUP ) {
                resource = new Resources.GroupArray( entry );
                this._restPaths[ type ].array.push( <Resources.GroupArray>resource );
            }
            else {
                resource = new Resources.File( entry );
                this._restPaths[ ResourceType.FILE ].array.push( resource );
            }

            resource.initialize();
            return resource;
        }

        /**
		 * This function is used to fetch the project resources associated with a project.
		 * @param type [Optional] You can specify to load only a subset of the resources (Useful for updating if someone else is editing)
	 	 */
        loadResources( type?: ResourceType ): Promise<Array<ProjectResource<HatcheryServer.IResource>>> {

            const arr: Array<Promise<Modepress.IGetArrayResponse<HatcheryServer.IResource>>> = [];
            const paths = this._restPaths;

            if ( !type ) {

                // Dispose each of the resources saved
                for ( const t in paths ) {
                    for ( const resource of paths[ t ].array ) {
                        this.emit<ProjectEvents, IResourceEvent>( 'resource-removed', { resource: resource });
                        resource.dispose();
                    }

                    paths[ t ].array.splice( paths[ t ].array.length );
                }

                arr.push( Utils.get( `${DB.API}/users/${this._entry.user}/projects/${this._entry._id}/${paths[ ResourceType.FILE ].url}?verbose=true` ) );
                arr.push( Utils.get( `${DB.API}/users/${this._entry.user}/projects/${this._entry._id}/${paths[ ResourceType.ASSET ].url}?verbose=true` ) );
                arr.push( Utils.get( `${DB.API}/users/${this._entry.user}/projects/${this._entry._id}/${paths[ ResourceType.CONTAINER ].url}?verbose=true` ) );
                arr.push( Utils.get( `${DB.API}/users/${this._entry.user}/projects/${this._entry._id}/${paths[ ResourceType.GROUP ].url}?verbose=true` ) );
                arr.push( Utils.get( `${DB.API}/users/${this._entry.user}/projects/${this._entry._id}/${paths[ ResourceType.SCRIPT ].url}?verbose=true` ) );
            }
            else {
                // Dispose each of the resources for that type
                for ( const resource of paths[ type ].array ) {
                    this.emit<ProjectEvents, IResourceEvent>( 'resource-removed', { resource: resource });
                    resource.dispose();
                }


                arr.push( Utils.get( `${DB.API}/users/${this._entry.user}/projects/${this._entry._id}/${paths[ type ].url}?verbose=true` ) );
                paths[ type ].array.splice( 0, paths[ type ].array.length );
            }

            return new Promise<Array<ProjectResource<HatcheryServer.IResource>>>(( resolve, reject ) => {
                Promise.all<Modepress.IGetArrayResponse<HatcheryServer.IResource>>( arr ).then(( data ) => {
                    // Check for any errors
                    for ( let i = 0, l = data.length; i < l; i++ )
                        if ( data[ i ].error )
                            return reject( new Error( data[ i ].message ) );

                    const createdResources: Array<ProjectResource<any>> = [];

                    if ( !type ) {
                        for ( let i = 0, l = data[ 0 ].data.length; i < l; i++ )
                            createdResources.push( this.createResourceInstance<HatcheryServer.IFile>( data[ 0 ].data[ i ], ResourceType.FILE ) );
                        for ( let i = 0, l = data[ 1 ].data.length; i < l; i++ )
                            createdResources.push( this.createResourceInstance<HatcheryServer.IAsset>( data[ 1 ].data[ i ], ResourceType.ASSET ) );
                        for ( let i = 0, l = data[ 2 ].data.length; i < l; i++ )
                            createdResources.push( this.createResourceInstance<HatcheryServer.IContainer>( data[ 2 ].data[ i ], ResourceType.CONTAINER ) );
                        for ( let i = 0, l = data[ 3 ].data.length; i < l; i++ )
                            createdResources.push( this.createResourceInstance<HatcheryServer.IGroup>( data[ 3 ].data[ i ], ResourceType.GROUP ) );
                        for ( let i = 0, l = data[ 4 ].data.length; i < l; i++ )
                            createdResources.push( this.createResourceInstance<HatcheryServer.IScript>( data[ 4 ].data[ i ], ResourceType.SCRIPT ) );
                    }
                    else {
                        if ( type === ResourceType.FILE )
                            for ( let i = 0, l = data[ 0 ].data.length; i < l; i++ )
                                createdResources.push( this.createResourceInstance<HatcheryServer.IFile>( data[ 0 ].data[ i ], ResourceType.FILE ) );
                        else if ( type === ResourceType.ASSET )
                            for ( let i = 0, l = data[ 0 ].data.length; i < l; i++ )
                                createdResources.push( this.createResourceInstance<HatcheryServer.IAsset>( data[ 0 ].data[ i ], ResourceType.ASSET ) );
                        else if ( type === ResourceType.CONTAINER )
                            for ( let i = 0, l = data[ 0 ].data.length; i < l; i++ )
                                createdResources.push( this.createResourceInstance<HatcheryServer.IContainer>( data[ 0 ].data[ i ], ResourceType.CONTAINER ) );
                        else if ( type === ResourceType.GROUP )
                            for ( let i = 0, l = data[ 0 ].data.length; i < l; i++ )
                                createdResources.push( this.createResourceInstance<HatcheryServer.IGroup>( data[ 0 ].data[ i ], ResourceType.GROUP ) );
                        else if ( type === ResourceType.SCRIPT )
                            for ( let i = 0, l = data[ 0 ].data.length; i < l; i++ )
                                createdResources.push( this.createResourceInstance<HatcheryServer.IScript>( data[ 0 ].data[ i ], ResourceType.SCRIPT ) );
                    }

                    let event = {} as IResourceEvent;
                    for ( let resource of createdResources ) {
                        event.resource = resource;
                        this.emit<ProjectEvents, IResourceEvent>( 'resource-created', event );
                    }

                    this.invalidate();
                    return resolve( createdResources );

                }).catch(( err: IAjaxError ) => {
                    return reject( new Error( `An error occurred while connecting to the server. ${err.status}: ${err.message}` ) );
                });
            });
        }

        /**
         * This function is used to fetch a project resource by Id
         * @param id the Id of the resource to update
         * @param type You can specify to load only a subset of the resources (Useful for updating if someone else is editing)
         */
        refreshResource<T extends ProjectResource<HatcheryServer.IResource>>( id: string, type?: ResourceType ): Promise<T | Error> {
            const paths = this._restPaths;

            const r = this.getResourceByID<T>( id, type );
            if ( !r )
                return Promise.reject<Error>( new Error( 'Could not find a resource with that ID' ) );

            return new Promise<T>(( resolve, reject ) => {
                Utils.get<Modepress.IGetArrayResponse<T>>( `${DB.API}/users/${this._entry.user}/projects/${this._entry._id}/${paths[ r.type ].url}/${id}?verbose=true` ).then(( response ) => {
                    if ( response.error )
                        return reject( new Error( response.message ) );

                    if ( response.data.length === 0 )
                        return resolve( r.resource );

                    for ( const t in response.data[ 0 ] )
                        if ( r.resource.entry.hasOwnProperty( t ) )
                            r.resource.entry[ t ] = response.data[ 0 ][ t ];

                    r.resource.emit<ResourceEvents, IResourceEvent>( 'refreshed', { resource: r.resource });
                    r.resource.saved = true;
                    this.invalidate();
                    return resolve( r.resource );

                }).catch(( err: IAjaxError ) => {
                    return reject( new Error( `An error occurred while connecting to the server. ${err.status}: ${err.message}` ) );
                });
            });
        }

        /**
		 * Use this to edit the properties of a resource
		 * @param id The id of the object we are editing.
         * @param data The new data for the resource
		 */
        editResource<T>( id: string, data: T ): Promise<Modepress.IResponse | Error> {
            const details = User.get.entry;
            const projId = this._entry._id;
            const paths = this._restPaths;
            let url: string;
            let resource: ProjectResource<HatcheryServer.IResource> | undefined;

            for ( const p in paths )
                for ( const r of paths[ p ].array )
                    if ( r.entry._id == id ) {
                        resource = r;
                        url = `${DB.API}/users/${details.username}/projects/${projId}/${paths[ p ].url}/${id}`;
                        break;
                    }

            if ( resource === undefined )
                return Promise.reject<Error>( new Error( 'No resource with that ID exists' ) );

            return new Promise<UsersInterface.IResponse>(( resolve, reject ) => {
                Utils.put<Modepress.IResponse>( url, data ).then(( response ) => {
                    if ( response.error )
                        return reject( new Error( response.message ) );

                    for ( const t in data )
                        if ( resource!.entry.hasOwnProperty( t ) )
                            resource!.entry[ t ] = data[ t ];

                    resource!.emit<ResourceEvents, IResourceEvent>( 'refreshed', { resource: resource! });
                    this.invalidate();
                    return resolve( response );

                }).catch(( err: IAjaxError ) => {
                    reject( new Error( `An error occurred while connecting to the server. ${err.status}: ${err.message}` ) );
                });
            });
        }

        /**
		 * Use this to save the properties of a resource
		 * @param id The id of the object we are saving.
         * @param type [Optional] The type of resource we are saving
		 */
        saveResource( id: string, type?: ResourceType ): Promise<boolean> {
            const paths = this._restPaths;
            const details = User.get.entry;
            const projId = this._entry._id;
            const r = this.getResourceByID( id, type );

            if ( !r )
                throw new Error( `Could not find the resource ${id}` );

            const url: string = `${DB.API}/users/${details.username}/projects/${projId}/${paths[ r.type ].url}/${id}`;
            const resource: ProjectResource<HatcheryServer.IResource> = r.resource;
            resource.onSaving();

            return new Promise<boolean>(( resolve, reject ) => {
                Utils.put<Modepress.IResponse>( url, resource.entry ).then(( response ) => {
                    if ( response.error )
                        return reject( new Error( `Could not save resource [${resource.entry._id}]: '${response.message}'` ) );

                    resource.saved = true;
                    this.invalidate();
                    return resolve( true );

                }).catch(( err: IAjaxError ) => {
                    reject( new Error( `An error occurred while connecting to the server. ${err.status}: ${err.message}` ) );
                });
            });
        }

        /**
		 * Use this to edit the properties of a resource
         * @param type The type of resource we are saving
		 */
        saveResources( type: ResourceType ): Promise<boolean> {
            const paths = this._restPaths;
            const promises: Array<Promise<boolean>> = [];

            for ( let i = 0, arr = paths[ type ].array, l = arr.length; i < l; i++ )
                promises.push( this.saveResource( arr[ i ].entry._id, type ) );

            return new Promise<boolean>(( resolve, reject ) => {
                Promise.all( promises ).then(( data ) => {
                    resolve( true );
                }).catch( function( err: Error ) {
                    reject( err );
                });
            });
        }

        /**
		 * Use this to delete a resource by its Id
		 * @param id The id of the object we are deleting
         * @param type The type of resource we are renaming
		 */
        deleteResource( id: string, type: ResourceType ): Promise<boolean | Error> {
            const details = User.get.entry;
            const projId = this._entry._id;
            const paths = this._restPaths;
            const url: string = `${DB.API}/users/${details.username}/projects/${projId}/${paths[ type ].url}/${id}`;
            const array = paths[ type ].array;
            let resource: ProjectResource<HatcheryServer.IResource> | undefined;

            for ( let i = 0, l = array.length; i < l; i++ )
                if ( array[ i ].entry._id === id ) {
                    resource = array[ i ];
                    break;
                }

            if ( !resource )
                return Promise.reject<Error>( new Error( 'No resource with that ID exists' ) );

            return new Promise<boolean>(( resolve, reject ) => {
                Utils.delete<Modepress.IResponse>( url ).then(( response ) => {
                    if ( response.error )
                        return reject( new Error( response.message ) );

                    array.splice( array.indexOf( resource! ), 1 );
                    this.emit<ProjectEvents, IResourceEvent>( 'resource-removed', { resource: resource! });
                    resource!.dispose();

                    const editor = this.getEditorByResource( resource! );
                    if ( !editor )
                        throw new Error( `Could not find editor for resource ${resource!.entry._id}` );

                    this.removeEditor( editor );
                    return resolve( true );

                }).catch(( err: IAjaxError ) => {
                    reject( new Error( `An error occurred while connecting to the server. ${err.status}: ${err.message}` ) );
                });
            });
        }

        /**
         * Copies an existing resource and assigns a new ID to the cloned item
         * @param id The id of the resource we are cloning from
         * @param type [Optional] The type of resource to clone
         */
        copyResource<T extends HatcheryServer.IResource>( id: string, type: ResourceType ): Promise<ProjectResource<T>> {
            const r = this.getResourceByID( id, type );
            if ( !r )
                throw new Error( `Could not find the resource ${id}` );

            const resource: ProjectResource<HatcheryServer.IResource> = r.resource;

            // Clone the resource and assign a new id
            const dataClone: T = JSON.parse( JSON.stringify( resource ) );
            dataClone.shallowId = Utils.generateLocalId();

            // Create a new resource with the data
            return this.createResource<T>( type, dataClone );
        }

        /**
		 * Deletes several resources in 1 function call
         * @param ids The ids An array of resource Ids
		 */
        deleteResources( ids: Array<string> ): Promise<boolean> {
            const promises: Array<Promise<boolean>> = [];
            const paths = this._restPaths;

            for ( const t in paths )
                for ( let k = 0, arr = paths[ t ].array, kl = arr.length; k < kl; k++ )
                    for ( let id of ids ) {
                        if ( arr[ k ].entry._id === id ) {
                            promises.push( this.deleteResource( arr[ k ].entry._id, <ResourceType>parseInt( t ) ) );
                            break;
                        }
                    }

            return new Promise<boolean>(( resolve, reject ) => {
                Promise.all( promises ).then(( data ) => {
                    resolve( true );

                }).catch(( err: Error ) => {
                    reject( err );
                });
            });
        }

        /**
		 * This function is used to all project resources
		 */
        saveAll() {
            const promises: Array<Promise<boolean>> = [];
            for ( const i in this._restPaths )
                promises.push( this.saveResources( <ResourceType>parseInt( i ) ) );

            return new Promise<boolean>(( resolve, reject ) => {
                Promise.all( promises ).then(( data ) => {
                    resolve( true );
                }).catch(( err: Error ) => {
                    reject( err );
                });
            });
        }

        /**
         * Creates a new project resource.
         * @param type The type of resource we are renaming
         */
        createResource<T extends HatcheryServer.IResource>( type: ResourceType, data: T ): Promise<ProjectResource<T>> {
            const details = User.get.entry;
            const projId = this._entry._id;
            const paths = this._restPaths;
            const url: string = `${DB.API}/users/${details.username}/projects/${projId}/${paths[ type ].url}`;

            if ( data.shallowId === undefined )
                data.shallowId = Utils.generateLocalId();

            return new Promise<ProjectResource<T>>(( resolve, reject ) => {
                Utils.post<ModepressAddons.ICreateResource<T>>( url, data ).then(( data ) => {
                    if ( data.error )
                        return reject( new Error( data.message ) );

                    let resource: ProjectResource<T>;
                    if ( type === ResourceType.ASSET )
                        resource = this.createResourceInstance<T>( data.data, ResourceType.ASSET );
                    else if ( type === ResourceType.CONTAINER )
                        resource = this.createResourceInstance<T>( data.data, ResourceType.CONTAINER );
                    else if ( type === ResourceType.GROUP )
                        resource = this.createResourceInstance<T>( data.data, ResourceType.GROUP );
                    else
                        resource = this.createResourceInstance<T>( data.data, ResourceType.SCRIPT );

                    this.emit<ProjectEvents, IResourceEvent>( 'resource-created', { resource: resource });
                    this.invalidate();
                    return resolve( resource );

                }).catch(( err: IAjaxError ) => {
                    return reject( new Error( `An error occurred while connecting to the server. ${err.status}: ${err.message}` ) );
                });
            });
        }

        /**
         * This function is used to assign a new editor to a project resource. Editors are used by
         * GUI components to interact with the resource the editor wraps.
         * @param resource The resource we are creating an editor for
         */
        assignEditor( resource: ProjectResource<HatcheryServer.IResource> ): Editor | null {
            for ( const editor of this.openEditors )
                if ( editor.resource == resource )
                    return editor;

            let editor: Editor | null = null;
            if ( resource instanceof Resources.Container )
                editor = new ContainerSchema( resource, this );

            if ( editor ) {
                this.openEditors.push( editor );
                this.emit<ProjectEvents, IEditorEvent>( 'editor-created', { editor: editor });
                this.invalidate();
            }

            return editor;
        }

        /**
         * Gets an editor by its resource
         */
        getEditorByResource( resource: ProjectResource<HatcheryServer.IResource> ): Editor | null {
            for ( const editor of this.openEditors )
                if ( editor.resource === resource )
                    return editor;

            return null;
        }

        /**
         * Removes an editor from the active editor array
         */
        removeEditor( editor: Editor ) {
            this.openEditors.splice( this.openEditors.indexOf( editor ), 1 );
            this.emit<ProjectEvents, IEditorEvent>( 'editor-removed', { editor: editor });
            this.invalidate();
        }

        /**
         * Triggers a change event
         */
        invalidate() {
            this.emit<ProjectEvents, void>( 'change' );
        }

        get containers(): Resources.Container[] { return this._restPaths[ ResourceType.CONTAINER ].array as Resources.Container[]; }
        get files(): Resources.File[] { return this._restPaths[ ResourceType.FILE ].array as Resources.File[]; }
        get scripts(): Resources.Script[] { return this._restPaths[ ResourceType.SCRIPT ].array as Resources.Script[]; }
        get assets(): Resources.Asset[] { return this._restPaths[ ResourceType.ASSET ].array as Resources.Asset[]; }
        get groups(): Resources.GroupArray[] { return this._restPaths[ ResourceType.GROUP ].array as Resources.GroupArray[]; }

		/**
		 * This will cleanup the project and remove all data associated with it.
		 */
        reset() {
            // Dispose each of the resources saved
            const paths = this._restPaths;
            for ( const t in paths ) {
                for ( const resource of paths[ t ].array ) {
                    this.emit<ProjectEvents, IResourceEvent>( 'resource-removed', { resource: resource });
                    resource.dispose();
                }

                paths[ t ].array.splice( 0, paths[ t ].array.length );
            }
        }

        get plugins(): Array<HatcheryServer.IPlugin> { return this._entry.$plugins!; }
    }
}