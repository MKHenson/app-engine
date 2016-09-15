namespace Animate {

	/**
	* A project class is an object that is owned by a user.
	* The project has functions which are useful for comunicating data to the server when
	* loading and saving data in the scene.
	*/
    export class Project extends EventDispatcher {
        private _entry: Engine.IProject;

        public saved: boolean;
        public curBuild: Build;
        private _containers: Array<Resources.Container>;
        private _assets: Array<Resources.Asset>;
        private _files: Array<Resources.File>;
        private _scripts: Array<Resources.Script>;
        private _groups: Array<Resources.GroupArray>;
        private _restPaths: { [ type: number ]: { url: string; array: Array<ProjectResource<Engine.IResource>> }; }

        public openEditors: Editor[];

		/**
		* @param{string} id The database id of this project
		*/
        constructor() {
            super();

            this.saved = true;
            this._containers = [];
            this._assets = [];
            this._files = [];
            this._scripts = [];
            this._groups = [];
            this.openEditors = [];

            this._restPaths = {};
            this._restPaths[ ResourceType.FILE ] = { url: `files`, array: this._files };
            this._restPaths[ ResourceType.ASSET ] = { url: `assets`, array: this._assets };
            this._restPaths[ ResourceType.CONTAINER ] = { url: `containers`, array: this._containers };
            this._restPaths[ ResourceType.GROUP ] = { url: `groups`, array: this._groups };
            this._restPaths[ ResourceType.SCRIPT ] = { url: `scripts`, array: this._scripts };
        }

		/**
		 * Gets the DB entry associated with this project
		 * @returns {Engine.IProject}
		 */
        get entry(): Engine.IProject {
            return this._entry;
        }

		/**
		 * Sets the DB entry associated with this project
		 * @param {Engine.IProject}
		 */
        set entry( val: Engine.IProject ) {
            this._entry = val;
            if ( typeof ( this._entry.tags ) === 'string' )
                this._entry.tags = [];
        }

        /**
		* Gets a resource by its ID
		* @param {string} id The ID of the resource
		* @returns {ProjectResource<Engine.IResource>} The resource whose id matches the id parameter or null
		*/
        getResourceByID<T extends ProjectResource<Engine.IResource>>( id: string, type?: ResourceType ): { resource: T, type: ResourceType } {
            const types = this._restPaths;
            if ( type ) {
                for ( let i = 0, arr: Array<ProjectResource<Engine.IResource>> = types[ type ].array, l = arr.length; i < l; i++ )
                    if ( arr[ i ].entry._id === id )
                        return { resource: <T>arr[ i ], type: type };
            }
            else {
                for ( const t in types )
                    for ( let i = 0, arr: Array<ProjectResource<Engine.IResource>> = types[ t ].array, l = arr.length; i < l; i++ )
                        if ( arr[ i ].entry._id === id )
                            return { resource: <T>arr[ i ], type: <ResourceType>parseInt( t ) };
            }

            return null;
        }

        /**
		* Gets a resource by its shallow ID
		* @param {string} id The shallow ID of the resource
		* @returns {ProjectResource<Engine.IResource>} The resource whose shallow id matches the id parameter or null
		*/
        getResourceByShallowID<T extends ProjectResource<Engine.IResource>>( id: number, type?: ResourceType ): T {
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
        * @returns {Engine.IProject} The project token
        * @returns {Promise<UsersInterface.IResponse>}
		*/
        updateDetails( token: Engine.IProject ): Promise<UsersInterface.IResponse> {
            const entry = this._entry;
            const that = this;
            return new Promise<UsersInterface.IResponse>( function ( resolve, reject ) {
                Utils.put<UsersInterface.IResponse>( `${DB.API}/users/${that._entry.user}/projects/${that._entry._id}`, token ).then( function ( data ) {
                    if ( data.error )
                        return reject( new Error( data.message ) );
                    else {
                        for ( const i in token )
                            if ( entry.hasOwnProperty( i ) )
                                entry[ i ] = token[ i ];

                        if ( typeof ( entry.tags ) === 'string' )
                            entry.tags = [];
                    }

                    return resolve( data );

                }).catch( function ( err: IAjaxError ) {
                    return reject( new Error( `An error occurred while connecting to the server. ${err.status}: ${err.message}` ) );
                });
            });
        }

        /**
		* Loads a previously selected build, or creates one if none are selected
        * @returns {Promise<Build>}
		*/
        loadBuild(): Promise<Build> {
            const that = this;
            const username = User.get.entry.username;
            return new Promise<Build>( function ( resolve, reject ) {
                let promise: Promise<any>;

                // If the project has a build then load it - otherwise create a new one
                if ( that._entry.build && that._entry.build !== '' )
                    promise = Utils.get( `${DB.API}/users/${username}/projects/${that._entry._id}/builds/${that._entry.build}?verbose=true` );
                else
                    promise = Utils.post( `${DB.API}/users/${username}/projects/${that._entry._id}/builds?set-current=true`, null );

                promise.then( function ( data: ModepressAddons.IGetBuilds ) {
                    if ( data.error )
                        return reject( new Error( data.message ) );

                    that.curBuild = new Build( data.data[ 0 ] );
                    return resolve( that.curBuild );

                }).catch( function ( err: IAjaxError ) {
                    return reject( new Error( `An error occurred while connecting to the server. ${err.status}: ${err.message}` ) );
                });
            });
        }

        /**
		* Internal function to create a resource wrapper
		* @param {T} entry The database entry
        * @param {ResourceType} type The type of resource to create
        * @returns {ProjectResource<T>}
		*/
        private createResourceInstance<T extends Engine.IResource>( entry: T, type?: ResourceType ): ProjectResource<T> {
            let resource: ProjectResource<any>;

            if ( type === ResourceType.ASSET ) {
                const aClass = PluginManager.getSingleton().getAssetClass(( <Engine.IAsset>entry ).className );
                resource = new Resources.Asset( aClass, entry );
                this._assets.push( <Resources.Asset>resource );
            }
            else if ( type === ResourceType.SCRIPT ) {
                resource = new Resources.Script( <any>entry );
                this._scripts.push( resource );
            }
            else if ( type === ResourceType.CONTAINER ) {
                resource = new Resources.Container( entry );
                this._containers.push( <Resources.Container>resource );
            }
            else if ( type === ResourceType.GROUP ) {
                resource = new Resources.GroupArray( entry );
                this._groups.push( <Resources.GroupArray>resource );
            }
            else if ( type === ResourceType.FILE ) {
                resource = new Resources.File( entry );
                this._files.push( resource );
            }

            resource.initialize();
            return resource;
        }

        /**
		* This function is used to fetch the project resources associated with a project.
		* @param {ResourceType} type [Optional] You can specify to load only a subset of the resources (Useful for updating if someone else is editing)
        * @returns {Promise<Array<ProjectResource<Engine.IResource>>}
		*/
        loadResources( type?: ResourceType ): Promise<Array<ProjectResource<Engine.IResource>>> {

            const arr: Array<Promise<Modepress.IGetArrayResponse<Engine.IResource>>> = [];
            const paths = this._restPaths;

            if ( !type ) {

                // Dispose each of the resources saved
                for ( const t in paths )
                    for ( const resource of paths[ t ].array ) {
                        this.emit<ProjectEvents, IResourceEvent>( 'resource-removed', { resource: resource });
                        resource.dispose();
                    }

                this._assets.splice( 0, this._assets.length );
                this._files.splice( 0, this._files.length );
                this._scripts.splice( 0, this._scripts.length );
                this._containers.splice( 0, this._containers.length );
                this._groups.splice( 0, this._groups.length );

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

            return new Promise<Array<ProjectResource<Engine.IResource>>>(( resolve, reject ) => {
                Promise.all<Modepress.IGetArrayResponse<Engine.IResource>>( arr ).then(( data ) => {
                    // Check for any errors
                    for ( let i = 0, l = data.length; i < l; i++ )
                        if ( data[ i ].error )
                            return reject( new Error( data[ i ].message ) );

                    const createdResources: Array<ProjectResource<any>> = [];

                    if ( !type ) {
                        for ( let i = 0, l = data[ 0 ].data.length; i < l; i++ )
                            createdResources.push( this.createResourceInstance<Engine.IFile>( data[ 0 ].data[ i ], ResourceType.FILE ) );
                        for ( let i = 0, l = data[ 1 ].data.length; i < l; i++ )
                            createdResources.push( this.createResourceInstance<Engine.IAsset>( data[ 1 ].data[ i ], ResourceType.ASSET ) );
                        for ( let i = 0, l = data[ 2 ].data.length; i < l; i++ )
                            createdResources.push( this.createResourceInstance<Engine.IContainer>( data[ 2 ].data[ i ], ResourceType.CONTAINER ) );
                        for ( let i = 0, l = data[ 3 ].data.length; i < l; i++ )
                            createdResources.push( this.createResourceInstance<Engine.IGroup>( data[ 3 ].data[ i ], ResourceType.GROUP ) );
                        for ( let i = 0, l = data[ 4 ].data.length; i < l; i++ )
                            createdResources.push( this.createResourceInstance<Engine.IScript>( data[ 4 ].data[ i ], ResourceType.SCRIPT ) );
                    }
                    else {
                        if ( type === ResourceType.FILE )
                            for ( let i = 0, l = data[ 0 ].data.length; i < l; i++ )
                                createdResources.push( this.createResourceInstance<Engine.IFile>( data[ 0 ].data[ i ], ResourceType.FILE ) );
                        else if ( type === ResourceType.ASSET )
                            for ( let i = 0, l = data[ 0 ].data.length; i < l; i++ )
                                createdResources.push( this.createResourceInstance<Engine.IAsset>( data[ 0 ].data[ i ], ResourceType.ASSET ) );
                        else if ( type === ResourceType.CONTAINER )
                            for ( let i = 0, l = data[ 0 ].data.length; i < l; i++ )
                                createdResources.push( this.createResourceInstance<Engine.IContainer>( data[ 0 ].data[ i ], ResourceType.CONTAINER ) );
                        else if ( type === ResourceType.GROUP )
                            for ( let i = 0, l = data[ 0 ].data.length; i < l; i++ )
                                createdResources.push( this.createResourceInstance<Engine.IGroup>( data[ 0 ].data[ i ], ResourceType.GROUP ) );
                        else if ( type === ResourceType.SCRIPT )
                            for ( let i = 0, l = data[ 0 ].data.length; i < l; i++ )
                                createdResources.push( this.createResourceInstance<Engine.IScript>( data[ 0 ].data[ i ], ResourceType.SCRIPT ) );
                    }

                    let event: IResourceEvent = { resource: null };
                    for ( let resource of createdResources ) {
                        event.resource = resource;
                        this.emit<ProjectEvents, IResourceEvent>( 'resource-created', event );
                    }

                    return resolve( createdResources );

                }).catch(( err: IAjaxError ) => {
                    return reject( new Error( `An error occurred while connecting to the server. ${err.status}: ${err.message}` ) );
                });
            });
        }

        /**
        * This function is used to fetch a project resource by Id
        * @param {string} id the Id of the resource to update
        * @param {ResourceType} type You can specify to load only a subset of the resources (Useful for updating if someone else is editing)
        * @returns {Promise<T | Error>}
        */
        refreshResource<T extends ProjectResource<Engine.IResource>>( id: string, type?: ResourceType ): Promise<T | Error> {
            const that = this;
            const paths = this._restPaths;

            const r = this.getResourceByID<T>( id, type );
            if ( !r )
                return Promise.reject<Error>( new Error( 'Could not find a resource with that ID' ) );

            return new Promise<T>( function ( resolve, reject ) {
                Utils.get<Modepress.IGetArrayResponse<T>>( `${DB.API}/users/${that._entry.user}/projects/${that._entry._id}/${paths[ r.type ].url}/${id}?verbose=true` ).then( function ( response ) {
                    if ( response.error )
                        return reject( new Error( response.message ) );

                    if ( response.data.length === 0 )
                        return resolve( r.resource );

                    for ( const t in response.data[ 0 ] )
                        if ( r.resource.entry.hasOwnProperty( t ) )
                            r.resource.entry[ t ] = response.data[ 0 ][ t ];

                    r.resource.emit<ResourceEvents, IResourceEvent>( 'refreshed', { resource: r.resource });
                    r.resource.saved = true;
                    return resolve( r.resource );

                }).catch( function ( err: IAjaxError ) {
                    return reject( new Error( `An error occurred while connecting to the server. ${err.status}: ${err.message}` ) );
                });
            });
        }

        /**
		* Use this to edit the properties of a resource
		* @param {string} id The id of the object we are editing.
        * @param {T} data The new data for the resource
        * @returns {Promise<Modepress.IResponse | Error>}
		*/
        editResource<T>( id: string, data: T ): Promise<Modepress.IResponse | Error> {
            const that = this;
            const details = User.get.entry;
            const projId = this._entry._id;
            const paths = this._restPaths;
            let url: string;
            let resource: ProjectResource<Engine.IResource>;

            for ( const p in paths )
                for ( const r of paths[p].array )
                    if ( r.entry._id == id ) {
                        resource = r;
                        url = `${DB.API}/users/${details.username}/projects/${projId}/${paths[p].url}/${id}`;
                        break;
                    }

            if ( !resource )
                return Promise.reject<Error>( new Error( 'No resource with that ID exists' ) );

            return new Promise<UsersInterface.IResponse>( function ( resolve, reject ) {
                Utils.put<Modepress.IResponse>( url, data ).then( function ( response ) {
                    if ( response.error )
                        return reject( new Error( response.message ) );

                    for ( const t in data )
                        if ( resource.entry.hasOwnProperty( t ) )
                            resource.entry[ t ] = data[ t ];

                    resource.emit<ResourceEvents, IResourceEvent>( 'refreshed', { resource: resource });
                    return resolve( response );

                }).catch( function ( err: IAjaxError ) {
                    reject( new Error( `An error occurred while connecting to the server. ${err.status}: ${err.message}` ) );
                });
            });
        }

        /**
		* Use this to save the properties of a resource
		* @param {string} id The id of the object we are saving.
        * @param {ResourceType} type [Optional] The type of resource we are saving
        * @returns {Promise<boolean>}
		*/
        saveResource( id: string, type?: ResourceType ): Promise<boolean> {
            const paths = this._restPaths;
            const that = this;
            const details = User.get.entry;
            const projId = this._entry._id;
            const r = this.getResourceByID( id, type );
            const url: string = `${DB.API}/users/${details.username}/projects/${projId}/${paths[ r.type ].url}/${id}`;
            const resource: ProjectResource<Engine.IResource> = r.resource;
            resource.onSaving();

            return new Promise<boolean>( function ( resolve, reject ) {
                Utils.put<Modepress.IResponse>( url, resource.entry ).then( function ( response ) {
                    if ( response.error )
                        return reject( new Error( `Could not save ${ResourceType[ type ].toLowerCase()} resource [${resource.entry._id}]: '${response.message}'` ) );

                    resource.saved = true;
                    return resolve( true );

                }).catch( function ( err: IAjaxError ) {
                    reject( new Error( `An error occurred while connecting to the server. ${err.status}: ${err.message}` ) );
                });
            });
        }

        /**
		* Use this to edit the properties of a resource
        * @param {ResourceType} type The type of resource we are saving
        * @returns {Promise<boolean>}
		*/
        saveResources( type: ResourceType ): Promise<boolean> {
            const paths = this._restPaths;
            const promises: Array<Promise<boolean>> = [];

            for ( let i = 0, arr = paths[ type ].array, l = arr.length; i < l; i++ )
                promises.push( this.saveResource( arr[ i ].entry._id, type ) );

            return new Promise<boolean>( function ( resolve, reject ) {
                Promise.all( promises ).then( function ( data ) {
                    resolve( true );

                }).catch( function ( err: Error ) {
                    reject( err );
                });
            });
        }

        /**
		* Use this to delete a resource by its Id
		* @param {string} id The id of the object we are deleting
        * @param {ResourceType} type The type of resource we are renaming
        * @returns {Promise<boolean | Error>}
		*/
        deleteResource( id: string, type: ResourceType ): Promise<boolean | Error> {
            const that = this;
            const details = User.get.entry;
            const projId = this._entry._id;
            const paths = this._restPaths;
            const url: string = `${DB.API}/users/${details.username}/projects/${projId}/${paths[ type ].url}/${id}`;
            const array = paths[ type ].array;
            let resource: ProjectResource<Engine.IResource>;

            for ( let i = 0, l = array.length; i < l; i++ )
                if ( array[ i ].entry._id === id ) {
                    resource = array[ i ];
                    break;
                }

            if ( !resource )
                return Promise.reject<Error>( new Error( 'No resource with that ID exists' ) );

            return new Promise<boolean>( function ( resolve, reject ) {
                Utils.delete<Modepress.IResponse>( url ).then( function ( response ) {
                    if ( response.error )
                        return reject( new Error( response.message ) );

                    array.splice( array.indexOf( resource ), 1 );
                    that.emit<ProjectEvents, IResourceEvent>( 'resource-removed', { resource: resource });
                    resource.dispose();
                    return resolve( true );

                }).catch( function ( err: IAjaxError ) {
                    reject( new Error( `An error occurred while connecting to the server. ${err.status}: ${err.message}` ) );
                });
            });
        }

        /**
        * Copies an existing resource and assigns a new ID to the cloned item
        * @param {string} id The id of the resource we are cloning from
        * @param {ResourceType} type [Optional] The type of resource to clone
        * @returns {Promise<ProjectResource<T>>}
        */
        copyResource<T extends Engine.IResource>( id: string, type?: ResourceType ): Promise<ProjectResource<T>> {
            const r = this.getResourceByID( id, type );
            const resource: ProjectResource<Engine.IResource> = r.resource;

            // Clone the resource and assign a new id
            const dataClone: T = JSON.parse( JSON.stringify( resource ) );
            dataClone.shallowId = Utils.generateLocalId();

            // Create a new resource with the data
            return this.createResource<T>( type, dataClone );
        }

        /**
		* Deletes several resources in 1 function call
        * @param {Array<string>} ids The ids An array of resource Ids
        * @returns {Promise<boolean>}
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

            return new Promise<boolean>( function ( resolve, reject ) {
                Promise.all( promises ).then( function ( data ) {
                    resolve( true );

                }).catch( function ( err: Error ) {
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

            return new Promise<boolean>( function ( resolve, reject ) {
                Promise.all( promises ).then( function ( data ) {
                    resolve( true );

                }).catch( function ( err: Error ) {
                    reject( err );
                });
            });
        }

        /**
        * Creates a new project resource.
        * @param {ResourceType} type The type of resource we are renaming
        * @returns { Promise<ProjectResource<any>>}
        */
        createResource<T extends Engine.IResource>( type: ResourceType, data: T ): Promise<ProjectResource<T>> {
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
                    else if ( type === ResourceType.SCRIPT )
                        resource = this.createResourceInstance<T>( data.data, ResourceType.SCRIPT );

                    this.emit<ProjectEvents, IResourceEvent>( 'resource-created', { resource: resource });
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
        assignEditor( resource: ProjectResource<Engine.IResource> ): Editor {
            for ( const editor of this.openEditors )
                if ( editor.resource == resource )
                    return editor;

            let editor: Editor;
            if ( resource instanceof Resources.Container )
                editor = new ContainerSchema( resource );

            this.openEditors.push( editor );
            this.emit<ProjectEvents, IEditorEvent>( 'editor-created', { editor: editor });
        }

        removeEditor( editor : Editor ) {
            this.openEditors.splice( this.openEditors.indexOf(editor), 1 );
            this.emit<ProjectEvents, IEditorEvent>( 'editor-removed', { editor: editor });
        }

        get containers(): Array<Resources.Container> { return this._containers; }
        get files(): Array<Resources.File> { return this._files; }
        get scripts(): Array<Resources.Script> { return this._scripts; }
        get assets(): Array<Resources.Asset> { return this._assets; }
        get groups(): Array<Resources.GroupArray> { return this._groups; }

		/**
		* This will cleanup the project and remove all data associated with it.
		*/
        reset() {
            this._entry = null;
            const pManager: PluginManager = PluginManager.getSingleton();
            //let event: AssetEvent;

            // Dispose each of the resources saved
            const paths = this._restPaths;
            for ( const t in paths ) {
                for ( const resource of paths[ t ].array ) {
                    this.emit<ProjectEvents, IResourceEvent>( 'resource-removed', { resource: resource });
                    resource.dispose();
                }


                paths[ t ].array.splice( 0, paths[ t ].array.length );
            }

            this._assets.splice( 0, this._assets.length );
            this._files.splice( 0, this._files.length );
            this._scripts.splice( 0, this._scripts.length );
            this._containers.splice( 0, this._containers.length );
            this._groups.splice( 0, this._groups.length );

            // // Cleanup behaviours
            // let i = this._containers.length;
            // while ( i-- )
            //     this._containers[ i ].dispose();

            // i = this._assets.length;

            // event = new AssetEvent( EditorEvents.ASSET_DESTROYED, null );
            // while ( i-- ) {
            //     event.asset = this._assets[ i ];

            //     // Notify the destruction of an asset
            //     pManager.emit( event );
            //     this._assets[ i ].dispose();
            // }

            this.saved = true;
            this._containers.splice( 0, this._containers.length );
            this._assets.splice( 0, this._assets.length );
            this._groups.splice( 0, this._groups.length );
            this._files.splice( 0, this._files.length );
            this._scripts.splice( 0, this._scripts.length );
        }

        get plugins(): Array<Engine.IPlugin> { return this._entry.$plugins; }
    }
}