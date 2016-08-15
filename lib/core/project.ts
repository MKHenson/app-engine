module Animate {

	//export class ProjectAssetTypes extends ENUM
	//{
	//	constructor(v: string) { super(v); }

	//	static BEHAVIOUR: ProjectAssetTypes = new ProjectAssetTypes("behaviour");
	//	static ASSET: ProjectAssetTypes = new ProjectAssetTypes("asset");
 //       static GROUP: ProjectAssetTypes = new ProjectAssetTypes("group");

	//	/**
	//	* Returns an enum reference by its name/value
	//	* @param {string} val
	//	* @returns ENUM
	//	*/
	//	static fromString(val: string): ProjectAssetTypes
	//	{
	//		switch (val)
	//		{
	//			case "behaviour":
	//				return ProjectAssetTypes.BEHAVIOUR;
	//			case "asset":
	//				return ProjectAssetTypes.ASSET;
	//			case "group":
	//				return ProjectAssetTypes.GROUP;
	//		}

	//		return null;
	//	}
	//}

	export class ProjectEvents {
		public value: string;
		constructor(v: string) { this.value = v; }
		toString() { return this.value; }

		static SAVED: ProjectEvents = new ProjectEvents("saved");
		static SAVED_ALL: ProjectEvents = new ProjectEvents("saved_all");
		//static OPENED: ProjectEvents = new ProjectEvents("opened");
		static FAILED: ProjectEvents = new ProjectEvents("failed");
		static BUILD_SELECTED: ProjectEvents = new ProjectEvents("build_selected");
		//static HTML_SAVED: ProjectEvents = new ProjectEvents( "html_saved" );
		//static CSS_SAVED: ProjectEvents = new ProjectEvents( "css_saved" );
		static BUILD_SAVED: ProjectEvents = new ProjectEvents( "build_saved" );
		//static BEHAVIOUR_DELETING: ProjectEvents = new ProjectEvents("behaviour_deleting");
		//static BEHAVIOURS_LOADED: ProjectEvents = new ProjectEvents("behaviours_loaded");
		//static BEHAVIOUR_CREATED: ProjectEvents = new ProjectEvents("behaviour_created");
		//static BEHAVIOUR_UPDATED: ProjectEvents = new ProjectEvents("behaviour_updated");
		//static BEHAVIOURS_UPDATED: ProjectEvents = new ProjectEvents("behaviours_updated");
		//static BEHAVIOURS_SAVED: ProjectEvents = new ProjectEvents("behaviours_saved");
		//static BEHAVIOUR_SAVED: ProjectEvents = new ProjectEvents("behaviour_saved");
		//static ASSET_CREATED: ProjectEvents = new ProjectEvents("asset_created");
		//static ASSET_SAVED: ProjectEvents = new ProjectEvents("asset_saved");
		//static ASSET_UPDATED: ProjectEvents = new ProjectEvents("asset_updated");
		//static ASSETS_UPDATED: ProjectEvents = new ProjectEvents("assets_updated");
		//static ASSET_DELETING: ProjectEvents = new ProjectEvents("asset_deleting");
		//static ASSETS_LOADED: ProjectEvents = new ProjectEvents("assets_deleted");
		//static GROUP_UPDATED: ProjectEvents = new ProjectEvents("group_updated");
		//static GROUPS_UPDATED: ProjectEvents = new ProjectEvents("groups_updated");
		//static GROUP_SAVED: ProjectEvents = new ProjectEvents("group_saved");
		//static GROUPS_SAVED: ProjectEvents = new ProjectEvents("groups_saved");
		//static GROUP_DELETING: ProjectEvents = new ProjectEvents("group_deleting");
		//static GROUP_CREATED: ProjectEvents = new ProjectEvents("group_created");
		//static GROUPS_LOADED: ProjectEvents = new ProjectEvents("groups_loaded");
		//static FILE_CREATED: ProjectEvents = new ProjectEvents("file_created");
		//static FILE_IMPORTED: ProjectEvents = new ProjectEvents("file_imported");
		//static FILE_DELETED: ProjectEvents = new ProjectEvents("file_deleted");
		//static FILES_DELETED: ProjectEvents = new ProjectEvents("files_deleted");
		//static FILES_CREATED: ProjectEvents = new ProjectEvents("files_created");
		//static FILE_UPDATED: ProjectEvents = new ProjectEvents( "file_updated" );
		//static FILE_IMAGE_UPDATED: ProjectEvents = new ProjectEvents("file_image_updated");
		//static FILES_LOADED: ProjectEvents = new ProjectEvents("files_loaded");
		//static FILES_FETCHED: ProjectEvents = new ProjectEvents("files_fetched");
		//static OBJECT_RENAMED: ProjectEvents = new ProjectEvents("object_renamed");
	}



	/**
	* A wrapper for project builds
	*/
	export class Build {
        public entry: Engine.IBuild;

        /**
	    * Creates an intance of the build
        * @param {Engine.IBuild} entry The entry token from the DB
	    */
        constructor(entry: Engine.IBuild) {
            this.entry = entry;
        }

        /**
	    * Attempts to update the build with new data
        * @param {Engine.IBuild} token The update token data
	    */
        update(token: Engine.IBuild): Promise<boolean> {
            var entry = this.entry;
            var that = this;
            return new Promise<boolean>(function (resolve, reject) {
                Utils.put<UsersInterface.IResponse>(`${DB.API}/users/${that.entry.user}/projects/${that.entry.projectId}/builds/${that.entry._id}`, token).then(function (data) {
                    if (data.error)
                        return reject(new Error(data.message));
                    else {
                        for (var i in token)
                            if (entry.hasOwnProperty(i))
                                entry[i] = token[i];
                    }

                    return resolve(true);

                }).catch(function (err: IAjaxError) {
                    return reject(new Error(`An error occurred while connecting to the server. ${err.status}: ${err.message}`));
                });
            });
        }
	}

	/**
	* A project class is an object that is owned by a user.
	* The project has functions which are useful for comunicating data to the server when
	* loading and saving data in the scene.
	*/
	export class Project extends EventDispatcher {
        public entry: Engine.IProject;

		//public _id: string;
		//public buildId: string;
		public saved: boolean;
		//public mName: string;
		//public mDescription: string;
		//public mTags: string;
        public curBuild: Build;
        //private _plugins: Array<Engine.IPlugin>;
		//public created: number;
		//public lastModified: number;
		//public mCategory: string;
		//public mSubCategory: string;
		//public mRating: number;
		//public mImgPath: string;
		//public mVisibility: string;
		private _containers: Array<Container>;
        private _assets: Array<Asset>;
        private _files: Array<FileResource>;
        private _scripts: Array<ScriptResource>;
        private _groups: Array<GroupArray>;
        private _restPaths: { [type: number]: { url: string; array: Array<ProjectResource<Engine.IResource>> }; }

		/**
		* @param{string} id The database id of this project
		*/
        constructor() {
            // Call super-class constructor
            super();

            //this._id = id;
            //this.buildId = "";
            this.saved = true;
            //this.mName = name;
            //this.mDescription = "";
            //this.mTags = "";
            //this.mRequest = "";
            //this.mCurBuild = build;
            //this._plugins = [];
            //this.created = Date.now();
            //this.lastModified = Date.now();
            //this.mCategory = "";
            //this.mSubCategory = "";
            //this.mRating = 0;
            //this.mImgPath = "";
            //this.mVisibility = "";
            this._containers = [];
            this._assets = [];
            this._files = [];
            this._scripts = [];
            this._groups = [];

            this._restPaths = {};
            this._restPaths[ResourceType.FILE] = { url: `files`, array: this._files };
            this._restPaths[ResourceType.ASSET] = { url: `assets`, array: this._assets };
            this._restPaths[ResourceType.CONTAINER] = { url: `containers`, array: this._containers };
            this._restPaths[ResourceType.GROUP] = { url: `groups`, array: this._groups };
            this._restPaths[ResourceType.SCRIPT] = { url: `scripts`, array: this._scripts };
        }

        /**
		* Gets a resource by its ID
		* @param {string} id The ID of the resource
		* @returns {ProjectResource<Engine.IResource>} The resource whose id matches the id parameter or null
		*/
        getResourceByID<T extends ProjectResource<Engine.IResource>>(id: string, type?: ResourceType): { resource: T, type: ResourceType } {
            var types = this._restPaths;
            if (type) {
                for (var i = 0, arr: Array<ProjectResource<Engine.IResource>> = types[type].array, l = arr.length; i < l; i++)
                    if (arr[i].entry._id == id)
                        return { resource: <T>arr[i], type: type };
            }
            else {
                for (var t in types)
                    for (var i = 0, arr: Array<ProjectResource<Engine.IResource>> = types[t].array, l = arr.length; i < l; i++)
                        if (arr[i].entry._id == id)
                            return { resource: <T>arr[i], type: <ResourceType>parseInt(t) };
            }

            return null;
        }

        /**
		* Gets a resource by its shallow ID
		* @param {string} id The shallow ID of the resource
		* @returns {ProjectResource<Engine.IResource>} The resource whose shallow id matches the id parameter or null
		*/
        getResourceByShallowID<T extends ProjectResource<Engine.IResource>>(id: number, type?: ResourceType): T {
            var types = this._restPaths;
            if (type) {
                for (var i = 0, arr = types[type].array, l = arr.length; i < l; i++)
                    if (arr[i].entry.shallowId == id)
                        return <T>arr[i];
            }
            else {
                for (var t in types)
                    for (var i = 0, arr = types[t].array, l = arr.length; i < l; i++)
                        if (arr[i].entry.shallowId == id)
                            return <T>arr[i];
            }

            return null;
        }

		///**
		//* Gets an asset by its ID
		//* @param {string} id The ID of the asset id
		//* @returns {Asset} The asset whose id matches the id parameter or null
		//*/
		//getAssetByID( id: string ): Asset
		//{
		//	for ( var i = 0; i < this._assets.length; i++ )
  //              if (this._assets[i].entry._id == id )
		//			return this._assets[i];

		//	return null;
		//}

		///**
		//* Gets an asset by its shallow ID
		//* @param {string} id The shallow ID of the asset id
		//* @returns {Asset} The asset whose id matches the id parameter or null
		//*/
		//getAssetByShallowId( id: number ): Asset
		//{
		//	for ( var i = 0; i < this._assets.length; i++ )
  //              if (this._assets[i].entry.shallowId == id )
		//			return this._assets[i];

		//	return null;
		//}

		///**
		//* Gets a file by its ID
		//* @param {string} id The ID of the file
		//* @returns {FileResource} The file whose id matches the id parameter or null
		//*/
  //      getFile(id: string): FileResource
		//{
  //          for (var i = 0; i < this._files.length; i++)
  //              if (this._files[i].entry._id == id)
		//			return this._files[i];

		//	return null;
  //      }

  //      /**
		//* Gets a group by its ID
		//* @param {string} id The ID of the group
		//* @returns {GroupArray} The group whose id matches the id parameter or null
		//*/
  //      getGroup(id: string): GroupArray
  //      {
  //          for (var i = 0; i < this._groups.length; i++)
  //              if (this._groups[i].entry._id == id)
  //                  return this._groups[i];

  //          return null;
  //      }


		///**
		//* Gets a {Container} by its ID
		//* @param {string} id The ID of the Container
		//* @returns {Container} The Container whose id matches the id parameter or null
		//*/
		//getBehaviourById( id: string ): Container
		//{
		//	for ( var i = 0; i < this._containers.length; i++ )
  //              if (this._containers[i].entry._id == id )
		//			return this._containers[i];

		//	return null;
		//}

		///**
		//* Gets a {Container} by its shallow or local ID
		//* @param {string} id The local ID of the Container
		//* @returns {Container} The Container whose id matches the id parameter or null
		//*/
		//getBehaviourByShallowId( id: number ): Container
		//{
		//	for ( var i = 0; i < this._containers.length; i++ )
  //              if (this._containers[i].entry.shallowId == id )
		//			return this._containers[i];

		//	return null;
  //      }

        /**
		* Attempts to update the project details base on the token provided
        * @returns {Engine.IProject} The project token
        * @returns {Promise<UsersInterface.IResponse>}
		*/
        updateDetails(token: Engine.IProject): Promise<UsersInterface.IResponse> {
            var entry = this.entry;
            var that = this;
            return new Promise<UsersInterface.IResponse>(function(resolve, reject) {
                Utils.put<UsersInterface.IResponse>(`${DB.API}/users/${that.entry.user}/projects/${that.entry._id}`, token).then(function (data) {
                    if (data.error)
                        return reject(new Error(data.message));
                    else {
                        for (var i in token)
                            if (entry.hasOwnProperty(i))
                                entry[i] = token[i];
                    }

                    return resolve(data);

                }).catch(function (err: IAjaxError) {
                    return reject(new Error(`An error occurred while connecting to the server. ${err.status}: ${err.message}`));
                });
            });
        }

        /**
		* Loads a previously selected build, or creates one if none are selected
        * @returns {Promise<Build>}
		*/
        loadBuild(): Promise<Build> {
            var that = this;
            var username = User.get.entry.username;
            return new Promise<Build>(function (resolve, reject) {
                var promise: Promise<any>;

                // If the project has a build then load it - otherwise create a new one
                if (that.entry.build && that.entry.build != "")
                    promise = Utils.get(`${DB.API}/users/${username}/projects/${that.entry._id}/builds/${that.entry.build}`);
                else
                    promise = Utils.post(`${DB.API}/users/${username}/projects/${that.entry._id}/builds?set-current=true`, null);

                promise.then(function (data: ModepressAddons.IGetBuilds) {
                    if (data.error)
                        return reject(new Error(data.message));

                    that.curBuild = new Build(data.data[0]);
                    return resolve(that.curBuild);

                }).catch(function (err: IAjaxError) {
                    return reject(new Error(`An error occurred while connecting to the server. ${err.status}: ${err.message}`));
                });
            });
        }

        /**
		* Internal function to create a resource wrapper
		* @param {T} entry The database entry
        * @param {ResourceType} type The type of resource to create
        * @returns {ProjectResource<T>}
		*/
        private createResourceInstance<T extends Engine.IResource>(entry: T, type?: ResourceType): ProjectResource<T> {
            var resource: ProjectResource<any>;

            if (type == ResourceType.ASSET) {
                var aClass = PluginManager.getSingleton().getAssetClass((<Engine.IAsset>entry).className);
                resource = new Asset(aClass, entry);
                this._assets.push(<Asset>resource);
            }
            else if (type == ResourceType.SCRIPT) {
                resource = new ScriptResource(<any>entry);
                this._scripts.push(resource);
            }
            else if (type == ResourceType.CONTAINER) {
                resource = new Container(entry);
                this._containers.push(<Container>resource);
            }
            else if (type == ResourceType.GROUP) {
                resource = new GroupArray(entry);
                this._groups.push(<GroupArray>resource);
            }
            else if (type == ResourceType.FILE) {
                resource = new FileResource(entry);
                this._files.push(resource);
            }

            resource.initialize();

            this.emit(new ProjectEvent("resource-created", resource));
            return resource;
        }

        /**
		* This function is used to fetch the project resources associated with a project.
		* @param {ResourceType} type [Optional] You can specify to load only a subset of the resources (Useful for updating if someone else is editing)
        * @returns {Promise<Array<ProjectResource<any>>}
		*/
        loadResources(type?: ResourceType): Promise<Array<ProjectResource<any>>> {
            var that = this;
            var arr: Array<Promise<Modepress.IGetArrayResponse<Engine.IResource>>> = [];
            var paths = this._restPaths;

            if (!type) {
                // Send delete events for all existing resources
                for (var t in paths)
                    for (var i = 0, pArr = paths[t].array, l = pArr.length; i < l; i++)
                        pArr[i].emit(new Event("deleted"));

                this._assets.splice(0, this._assets.length);
                this._files.splice(0, this._files.length);
                this._scripts.splice(0, this._scripts.length);
                this._containers.splice(0, this._containers.length);
                this._groups.splice(0, this._groups.length);

                arr.push(Utils.get(`${DB.API}/users/${this.entry.user}/projects/${this.entry._id}/${paths[ResourceType.FILE].url}`));
                arr.push(Utils.get(`${DB.API}/users/${this.entry.user}/projects/${this.entry._id}/${paths[ResourceType.ASSET].url}`));
                arr.push(Utils.get(`${DB.API}/users/${this.entry.user}/projects/${this.entry._id}/${paths[ResourceType.CONTAINER].url}`));
                arr.push(Utils.get(`${DB.API}/users/${this.entry.user}/projects/${this.entry._id}/${paths[ResourceType.GROUP].url}`));
                arr.push(Utils.get(`${DB.API}/users/${this.entry.user}/projects/${this.entry._id}/${paths[ResourceType.SCRIPT].url}`));
            }
            else {
                // Send delete events for all existing resources
                for (var i = 0, pArr = paths[type].array, l = pArr.length; i < l; i++)
                    pArr[i].emit(new Event("deleted"));

                arr.push(Utils.get(`${DB.API}/users/${this.entry.user}/projects/${this.entry._id}/${paths[type].url}`));
                paths[type].array.splice(0, paths[type].array.length);
            }

            return new Promise<Array<ProjectResource<Engine.IResource>>>(function (resolve, reject) {
                Promise.all<Modepress.IGetArrayResponse<Engine.IResource>>(arr).then(function (data) {
                    // Check for any errors
                    for (var i = 0, l = data.length; i < l; i++)
                        if (data[i].error)
                            return reject(new Error(data[i].message));

                    var createdResources: Array<ProjectResource<any>> = [];

                    if (!type) {
                        for (var i = 0, l = data[0].data.length; i < l; i++)
                            createdResources.push( that.createResourceInstance<Engine.IFile>(data[0].data[i], ResourceType.FILE) );
                        for (var i = 0, l = data[1].data.length; i < l; i++)
                            createdResources.push(that.createResourceInstance<Engine.IAsset>(data[1].data[i], ResourceType.ASSET));
                        for (var i = 0, l = data[2].data.length; i < l; i++)
                            createdResources.push(that.createResourceInstance<Engine.IContainer>(data[2].data[i], ResourceType.CONTAINER));
                        for (var i = 0, l = data[3].data.length; i < l; i++)
                            createdResources.push(that.createResourceInstance<Engine.IGroup>(data[3].data[i], ResourceType.GROUP));
                        for (var i = 0, l = data[4].data.length; i < l; i++)
                            createdResources.push(that.createResourceInstance<Engine.IScript>(data[4].data[i], ResourceType.SCRIPT));
                    }
                    else {
                        if (type == ResourceType.FILE)
                            for (var i = 0, l = data[0].data.length; i < l; i++)
                                createdResources.push(that.createResourceInstance<Engine.IFile>(data[0].data[i], ResourceType.FILE));
                        else if (type == ResourceType.ASSET)
                            for (var i = 0, l = data[0].data.length; i < l; i++)
                                createdResources.push(that.createResourceInstance<Engine.IAsset>(data[0].data[i], ResourceType.ASSET));
                        else if (type == ResourceType.CONTAINER)
                            for (var i = 0, l = data[0].data.length; i < l; i++)
                                createdResources.push(that.createResourceInstance<Engine.IContainer>(data[0].data[i], ResourceType.CONTAINER));
                        else if (type == ResourceType.GROUP)
                            for (var i = 0, l = data[0].data.length; i < l; i++)
                                createdResources.push(that.createResourceInstance<Engine.IGroup>(data[0].data[i], ResourceType.GROUP));
                        else if (type == ResourceType.SCRIPT)
                            for (var i = 0, l = data[0].data.length; i < l; i++)
                                createdResources.push(that.createResourceInstance<Engine.IScript>(data[0].data[i], ResourceType.SCRIPT));
                    }

                    return resolve(createdResources);

                }).catch(function (err: IAjaxError) {
                    return reject(new Error(`An error occurred while connecting to the server. ${err.status}: ${err.message}`));
                });
            });
        }

        /**
        * This function is used to fetch a project resource by Id
        * @param {string} id the Id of the resource to update
        * @param {ResourceType} type You can specify to load only a subset of the resources (Useful for updating if someone else is editing)
        * @returns {Promise<T | Error>}
        */
        refreshResource<T extends ProjectResource<Engine.IResource>>(id: string, type?: ResourceType): Promise<T | Error> {
            var that = this;
            var paths = this._restPaths;

            var r = this.getResourceByID<T>(id, type);
            if (!r)
                return Promise.reject<Error>(new Error("Could not find a resource with that ID"));

            return new Promise<T>(function (resolve, reject) {
                Utils.get<Modepress.IGetArrayResponse<T>>(`${DB.API}/users/${that.entry.user}/projects/${that.entry._id}/${paths[r.type].url}/${id}`).then(function (response) {
                    if (response.error)
                        return reject(new Error(response.message));

                    if (response.data.length == 0)
                        return resolve(r.resource);

                    for (var t in response.data[0])
                        if (r.resource.entry.hasOwnProperty(t))
                            r.resource.entry[t] = response.data[0][t];

                    r.resource.emit(new Event("refreshed"));
                    r.resource.saved = true;
                    return resolve(r.resource);

                }).catch(function (err: IAjaxError) {
                    return reject(new Error(`An error occurred while connecting to the server. ${err.status}: ${err.message}`));
                });
            });
        }

        /**
		* Use this to edit the properties of a resource
		* @param {string} id The id of the object we are editing.
        * @param {T} data The new data for the resource
		* @param {ResourceType} type The type of resource we are editing
        * @returns {Promise<Modepress.IResponse | Error>}
		*/
        editResource<T>(id: string, data: T, type: ResourceType): Promise<Modepress.IResponse | Error> {
            var that = this;
            var details = User.get.entry;
            var projId = this.entry._id;
            var paths = this._restPaths;
            var url: string = `${DB.API}/users/${details.username}/projects/${projId}/${paths[type].url}/${id}`;
            var array = paths[type].array;
            var resource: ProjectResource<Engine.IResource>;

            for (var i = 0, l = array.length; i < l; i++)
                if (array[i].entry._id == id) {
                    resource = array[i];
                    break;
                }

            if (!resource)
                return Promise.reject<Error>(new Error("No resource with that ID exists"));

            return new Promise<UsersInterface.IResponse>(function (resolve, reject) {
                Utils.put<Modepress.IResponse>(url, data).then(function (response) {
                    if (response.error)
                        return reject(new Error(response.message));

                    for (var t in data)
                        if (resource.entry.hasOwnProperty(t))
                            resource.entry[t] = data[t];

                    resource.emit(new Event("refreshed"));
                    return resolve(response);

                }).catch(function (err: IAjaxError) {
                    reject(new Error(`An error occurred while connecting to the server. ${err.status}: ${err.message}`));
                });
            });
        }

        /**
		* Use this to save the properties of a resource
		* @param {string} id The id of the object we are saving.
        * @param {ResourceType} type [Optional] The type of resource we are saving
        * @returns {Promise<boolean>}
		*/
        saveResource(id: string, type?: ResourceType): Promise<boolean> {
            var paths = this._restPaths;
            var that = this;
            var details = User.get.entry;
            var projId = this.entry._id;
            var r = this.getResourceByID(id, type);
            var url: string = `${DB.API}/users/${details.username}/projects/${projId}/${paths[r.type].url}/${id}`;
            var resource: ProjectResource<Engine.IResource> = r.resource;
            resource.onSaving();

            return new Promise<boolean>(function (resolve, reject) {
                Utils.put<Modepress.IResponse>(url, resource.entry).then(function (response) {
                    if (response.error)
                        return reject(new Error(`Could not save ${ResourceType[type].toLowerCase()} resource [${resource.entry._id}]: '${response.message}'`));

                    resource.saved = true;
                    return resolve(true);

                }).catch(function (err: IAjaxError) {
                    reject(new Error(`An error occurred while connecting to the server. ${err.status}: ${err.message}`));
                });
            });
        }

        /**
		* Use this to edit the properties of a resource
        * @param {ResourceType} type The type of resource we are saving
        * @returns {Promise<boolean>}
		*/
        saveResources(type: ResourceType): Promise<boolean> {
            var paths = this._restPaths;
            var promises: Array<Promise<boolean>> = [];

            for (var i = 0, arr = paths[type].array, l = arr.length; i < l; i++)
                promises.push(this.saveResource(arr[i].entry._id, type));

            return new Promise<boolean>(function (resolve, reject) {
                Promise.all(promises).then(function (data) {
                    resolve(true);

                }).catch(function (err: Error) {
                    reject(err);
                });
            });
        }

        /**
		* Use this to delete a resource by its Id
		* @param {string} id The id of the object we are deleting
        * @param {ResourceType} type The type of resource we are renaming
        * @returns {Promise<boolean | Error>}
		*/
        deleteResource(id: string, type: ResourceType): Promise<boolean | Error> {
            var that = this;
            var details = User.get.entry;
            var projId = this.entry._id;
            var paths = this._restPaths;
            var url: string = `${DB.API}/users/${details.username}/projects/${projId}/${paths[type].url}/${id}`;
            var array = paths[type].array;
            var resource: ProjectResource<Engine.IResource>;

            for (var i = 0, l = array.length; i < l; i++)
                if (array[i].entry._id == id) {
                    resource = array[i];
                    break;
                }

            if (!resource)
                return Promise.reject<Error>(new Error("No resource with that ID exists"));

            return new Promise<boolean>(function (resolve, reject) {
                Utils.delete<Modepress.IResponse>(url).then(function (response) {
                    if (response.error)
                        return reject(new Error(response.message));

                    array.splice(array.indexOf(resource), 1);
                    resource.emit(new Event("deleted"));
                    return resolve(true);

                }).catch(function (err: IAjaxError) {
                    reject(new Error(`An error occurred while connecting to the server. ${err.status}: ${err.message}`));
                });
            });
        }

        /**
        * Copies an existing resource and assigns a new ID to the cloned item
        * @param {string} id The id of the resource we are cloning from
        * @param {ResourceType} type [Optional] The type of resource to clone
        * @returns {Promise<ProjectResource<T>>}
        */
        copyResource<T extends Engine.IResource>(id: string, type?: ResourceType): Promise<ProjectResource<T>> {
            var r = this.getResourceByID(id, type);
            var resource: ProjectResource<Engine.IResource> = r.resource;

            // Clone the resource and assign a new id
            var dataClone: T = JSON.parse(JSON.stringify(resource));
            dataClone.shallowId = Utils.generateLocalId();

            // Create a new resource with the data
            return this.createResource<T>(type, dataClone);
        }

        /**
		* Deletes several resources in 1 function call
        * @param {Array<string>} ids The ids An array of resource Ids
        * @returns {Promise<boolean>}
		*/
        deleteResources(ids: Array<string>): Promise<boolean> {
            var promises: Array<Promise<boolean>> = [];
            var paths = this._restPaths;

            for (var t in paths)
                for (var k = 0, arr = paths[t].array, kl = arr.length; k < kl; k++)
                    for (var i = 0, l = ids.length; i < l; i++) {
                        if (arr[k].entry._id == ids) {
                            promises.push(this.deleteResource(arr[k].entry._id, <ResourceType>parseInt(t) ));
                            break;
                        }
                    }

            return new Promise<boolean>(function(resolve, reject) {
                Promise.all(promises).then(function (data) {
                    resolve(true);

                }).catch(function(err: Error) {
                    reject(err);
                });
            });
        }

        /**
		* This function is used to all project resources
		*/
        saveAll() {
            var promises: Array<Promise<boolean>> = [];
            for (var i in this._restPaths)
                promises.push(this.saveResources( <ResourceType>parseInt(i) ));

            return new Promise<boolean>(function (resolve, reject) {
                Promise.all(promises).then(function (data) {
                    resolve(true);

                }).catch(function (err: Error) {
                    reject(err);
                });
            });
        }

        /**
        * Creates a new project resource.
        * @param {ResourceType} type The type of resource we are renaming
        * @returns { Promise<ProjectResource<any>>}
        */
        createResource<T>(type: ResourceType, data: T): Promise<ProjectResource<T>> {
            var that = this;
            var details = User.get.entry;
            var projId = this.entry._id;
            var paths = this._restPaths;
            var url: string = `${DB.API}/users/${details.username}/projects/${projId}/${paths[type].url}`;

            return new Promise<ProjectResource<T>>(function (resolve, reject) {
                Utils.post<ModepressAddons.ICreateResource<T>>(url, data).then(function (data) {
                    if (data.error)
                        return reject(new Error(data.message));

                    var resource : ProjectResource<T>;
                    if (type == ResourceType.ASSET)
                        resource = that.createResourceInstance<T>(data.data, ResourceType.ASSET);
                    else if (type == ResourceType.CONTAINER)
                        resource = that.createResourceInstance<T>(data.data, ResourceType.CONTAINER);
                    else if (type == ResourceType.GROUP)
                        resource = that.createResourceInstance<T>(data.data, ResourceType.GROUP);
                    else if (type == ResourceType.SCRIPT)
                        resource = that.createResourceInstance<T>(data.data, ResourceType.SCRIPT);

                    return resolve(resource);

                }).catch(function (err: IAjaxError) {
                    return reject(new Error(`An error occurred while connecting to the server. ${err.status}: ${err.message}`));
                });
            });
        }




















		///**
		//* Use this to rename a behaviour, group or asset.
		//* @param {string} name The new name of the object
		//* @param {string} id The id of the asset or behaviour.
		//* @param {ProjectAssetTypes} type The type of object we are renaming. this can be either 'group', 'asset' or 'behaviour'
		//*/
		//renameObject( name: string, id: string, type: ProjectAssetTypes )
		//{
		//	var loader = new AnimateLoader();
		//	loader.on( LoaderEvents.COMPLETE, this.onServer, this );
		//	loader.on( LoaderEvents.FAILED, this.onServer, this );
  //          loader.load("/project/rename-object", {
  //              projectId: this.entry._id,
		//		name: name,
		//		objectId: id,
		//		type: type.toString()
		//	} );
		//}


		/**
		* This function is used to create an entry for this project on the DB.
		*/
		selectBuild( major: string, mid: string, minor: string ): void
		{
			var loader = new AnimateLoader();
			loader.on( LoaderEvents.COMPLETE, this.onServer, this );
			loader.on( LoaderEvents.FAILED, this.onServer, this );
            loader.load("/project/select-build", { projectId: this.entry._id, major: major, mid: mid, minor: minor } );
		}

		/**
		* This function is used to update the current build data
		*/
		saveBuild( notes: string, visibility: string, html: string, css: string ): void
		{
			var loader = new AnimateLoader();
			loader.on( LoaderEvents.COMPLETE, this.onServer, this );
            loader.on(LoaderEvents.FAILED, this.onServer, this);
            loader.load("/project/save-build", { projectId: this.entry._id, buildId: this.entry.build, notes: notes, visibility: visibility, html: html, css: css });
		}


		///**
		//* This function is used to save an array of behaviors to the DB
		//* @param { Array<string>} behavioursIds This is the array behaviour ids we are saving.
		//*/
		//saveBehaviours( behavioursIds: Array<string> ): void
		//{
		//	if ( behavioursIds.length == 0 )
		//		return;

		//	var ids: Array<string> = [];
		//	var jsons: Array<string> = [];

		//	var behaviours: Array<Container> = this._containers;

		//	// Create a multidimension array and pass each of the behaviours
		//	for ( var i = 0, l = behavioursIds.length; i < l; i++ )
		//		for ( var ii = 0, l = behaviours.length; ii < l; ii++ )
  //                  if (behavioursIds[i] == behaviours[ii].entry._id )
		//			{
		//				var json: CanvasToken = null;
		//				var canvas : Canvas = CanvasTab.getSingleton().getTabCanvas( behavioursIds[i] );
		//				if ( canvas )
		//					json = canvas.buildDataObject();
		//				else
		//				{
  //                          json = behaviours[ii].entry.json;
		//					json.properties = behaviours[ii].properties.tokenize();
		//				}

		//				var jsonStr: string = json.toString();
  //                      ids.push(behaviours[ii].entry._id );
		//				jsons.push( jsonStr );
		//			}

		//	var loader = new AnimateLoader();
		//	loader.on( LoaderEvents.COMPLETE, this.onServer, this );
		//	loader.on( LoaderEvents.FAILED, this.onServer, this );
  //          loader.load("/project/save-behaviours", { projectId: this.entry._id, ids: ids, data : jsons } );
		//}

		///**
		//* This function is used to save the behaviors, groups and _assets or the DB
		//*/
		//saveAll()
  //      {
			//// Behaviours
			//var ids: Array<string> = [];
			//var behaviours: Array<Container> = this._containers;
			//for ( var i = 0, l = behaviours.length; i < l; i++ )
			//	if ( !behaviours[i].saved )
   //                 ids.push(behaviours[i].entry._id );
			//this.saveBehaviours( ids );

			//// Assets
			//ids.splice( 0, ids.length );
			//var assets: Array<Asset> = this._assets;
			//for ( var i = 0, l = assets.length; i < l; i++ )
			//	if ( !assets[i].saved )
   //                 ids.push(assets[i].entry._id );
			//this.saveAssets( ids );

			//// Groups
			//ids.splice( 0, ids.length );
			//var groups: Array<TreeNodeGroup> = TreeViewScene.getSingleton().getGroups();
			//for ( var i = 0, l = groups.length; i < l; i++ )
			//	if ( !groups[i].saved )
			//		ids.push( groups[i].groupID );
			//this.saveGroups( ids );

			// Animate.CanvasTab.getSingleton().saveAll();

            // TODO: Make sure these are saved
            //this.saveHTML();
			//this.saveCSS();
		//}

		///**
		//* This function is used to create a new behaviour. This will make
		//* a call the server. If the server sends a fail message no new behaviour
		//* will be created. You can use the event BEHAVIOUR_CREATED to hook into
		//* @param {string} name The proposed name of the behaviour.
		//*/
		//createBehaviour( name: string )
		//{
		//	for ( var i = 0; i < this._behaviours.length; i++ )
		//		if ( this._behaviours[i].name == name )
		//		{
		//			this.emit( new ProjectEvent( ProjectEvents.FAILED, "A behaviour with that name already exists.", LoaderEvents.FAILED ) );
		//			return;
		//		}

		//	var loader = new AnimateLoader();
		//	loader.on( LoaderEvents.COMPLETE, this.onServer, this );
		//	loader.on( LoaderEvents.FAILED, this.onServer, this );
  //          loader.load("/project/create-behaviour", { projectId: this.entry._id, name : name, shallowId : Container.getNewLocalId() } );
		//}


		///**
		//* Saves the HTML from the HTML tab to the server
		//*/
		//saveHTML()
		//{
  //          var html: string = (HTMLTab.singleton ? HTMLTab.singleton.editor.getValue() : this.curBuild.entry.html );
  //          var loader = new AnimateLoader();
  //          this.curBuild.entry.html = html;
		//	loader.on( LoaderEvents.COMPLETE, this.onServer, this );
		//	loader.on( LoaderEvents.FAILED, this.onServer, this );
  //          loader.load("/project/save-html", { projectId: this.entry._id, html: html } );
		//}


		///**
		//* Saves the HTML from the HTML tab to the server
		//*/
		//saveCSS()
  //      {
  //          var css: string = (CSSTab.singleton ? CSSTab.singleton.editor.getValue() : this.curBuild.entry.css);
  //          var loader = new AnimateLoader();
  //          this.curBuild.entry.css = css;
		//	loader.on( LoaderEvents.COMPLETE, this.onServer, this );
		//	loader.on( LoaderEvents.FAILED, this.onServer, this );
  //          loader.load("/project/save-css", { projectId: this.entry._id, css: css } );
		//}


		///**
		//* This function is used to delete behaviours.
		//* @param {Array<string>} behavioursIds The behaviour Ids we need to delete
		//*/
		//deleteBehaviours( behavioursIds: Array<string> )
		//{
		//	var ids: Array<string> = [];

		//	//Create a multidimension array and pass each of the _behaviours
		//	for ( var i = 0, l = behavioursIds.length; i < l; i++ )
		//		ids.push( behavioursIds[i] );

		//	var loader = new AnimateLoader();
		//	loader.on( LoaderEvents.COMPLETE, this.onServer, this );
		//	loader.on( LoaderEvents.FAILED, this.onServer, this );
  //          loader.load("/project/delete-behaviours", { projectId: this.entry._id, ids: ids } );
		//}


		///**
		//* This function is used to fetch the files associated with a project.
		//* @param {string} mode Which files to fetch - this can be either 'global', 'project' or 'user'
		//*/
		//loadFiles( mode: string = "project" )
		//{
		//	var loader = new AnimateLoader();
		//	loader.on( LoaderEvents.COMPLETE, this.onServer, this );
		//	loader.on( LoaderEvents.FAILED, this.onServer, this );
  //          loader.load("/project/get-files", { projectId: this.entry._id, mode : mode } );
		//}

		///**
		//* This function is used to import a user's file from another project or from the global _assets base
		//*/
		//importFile( ids: Array<string> )
		//{
		//	var loader = new AnimateLoader();
		//	loader.on( LoaderEvents.COMPLETE, this.onServer, this );
		//	loader.on( LoaderEvents.FAILED, this.onServer, this );
  //          loader.load("/project/import-files", { projectId: this.entry._id, ids: ids, });
		//}



		///**
		//* This function is used to delete files from a project and the database. The file asset will
		//* not be deleted if another project has a reference to it. The reference of this project to the file will be
		//* removed either way.
		//* @param {Array<string>} ids An array of file IDs to delete
		//*/
		//deleteFiles( ids: Array<string> )
		//{
		//	var loader = new AnimateLoader();
		//	loader.on( LoaderEvents.COMPLETE, this.onServer, this );
		//	loader.on( LoaderEvents.FAILED, this.onServer, this );
  //          loader.load("/project/delete-files", { projectId: this.entry._id, ids: ids, } );
		//}

		///**
		//* Use this function to create an empty data file for the user
		//* @param {string} name The name of file we are creating. Please note this is not a file name.
		//*/
		//createEmptyFile( name: string )
		//{
		//	var loader = new AnimateLoader();
		//	loader.on( LoaderEvents.COMPLETE, this.onServer, this );
		//	loader.on( LoaderEvents.FAILED, this.onServer, this );
  //          loader.load("/file/create-empty-file", { projectId: this.entry._id, name: name });
		//}

		///**
		//* Fills a data file with the contents of an XHR request
		//* See https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Sending_and_Receiving_Binary_Data
		//* @param {string} id The id of the file we are
		//* @param {ArrayBufferView} view The data to fill the file with
		//*/
		//fillFile( id: string, view : ArrayBufferView )
		//{
		//	var loader = new AnimateLoader();
		//	loader.on( LoaderEvents.COMPLETE, this.onServer, this );
		//	loader.on( LoaderEvents.FAILED, this.onServer, this );
		//	loader.contentType = "application/octet-stream";
		//	loader.processData = false;
  //          loader.getVariables = { id: id, projectId: this.entry._id };

		//	loader.load( "/file/fill-file", view);
		//}

		///**
		//* Use this function to update file properties
		//* @param {string} fileId The file we are updating
		//* @param {string} name The new name of the file.
		//* @param {Array<string>} tags The new comma separated tags of the file.
		//* @param {bool} favourite If this file is a favourite
		//* @param {bool} global True or false if this file is shared globally
		//*/
		//saveFile( fileId: string, name: string, tags: Array<string>, favourite: boolean, global: boolean )
		//{
		//	var loader = new AnimateLoader();
		//	loader.on( LoaderEvents.COMPLETE, this.onServer, this );
		//	loader.on( LoaderEvents.FAILED, this.onServer, this );
  //          loader.load("/project/save-file", { projectId: this.entry._id, fileId: fileId, name: name, tags: tags, favourite: favourite, global: global } );
		//}


		///**
		//* This function is used to fetch the beaviours of a project.
		//*/
		//loadBehaviours()
		//{
		//	var loader = new AnimateLoader();
		//	loader.on( LoaderEvents.COMPLETE, this.onServer, this );
		//	loader.on( LoaderEvents.FAILED, this.onServer, this );
  //          loader.load("/project/get-behaviours", { projectId: this.entry._id } );
		//}

		///**
		//* This function is used to create a new group. This will make
		//* a call the server. If the server sends a fail message then no new group
		//* will be created. You can use the event GROUP_CREATED to hook into
		//* a successful DB entry created.
		//* @param {string} name The proposed name of the group.
		//*/
		//createGroup( name: string )
		//{
		//	var loader = new AnimateLoader();
		//	loader.on( LoaderEvents.COMPLETE, this.onServer, this );
		//	loader.on( LoaderEvents.FAILED, this.onServer, this );
  //          loader.load("/project/create-group", { projectId: this.entry._id, name: name } );
		//}

		///**
		//* This function is used to fetch the groups of a project.
		//*/
		//loadGroups()
		//{
		//	var loader = new AnimateLoader();
		//	loader.on( LoaderEvents.COMPLETE, this.onServer, this );
		//	loader.on( LoaderEvents.FAILED, this.onServer, this );
  //          loader.load("/project/get-groups", { projectId: this.entry._id } );
		//}

		///**
		//* This will save the current state of the groups to the server
		//* @param {Array<string>} groupIds The array of group ID's we are trying to save.
		//*/
		//saveGroups( groupIds: Array<string> )
		//{
		//	if ( groupIds.length == 0 )
		//		return;

		//	var group: TreeNodeGroup = null;
		//	var ids : Array<string> = [];
		//	var jsons: Array<string> = [];
		//	for ( var i = 0, l = groupIds.length; i < l; i++ )
		//	{
		//		group = TreeViewScene.getSingleton().getGroupByID( groupIds[i] );
		//		jsons.push( JSON.stringify( group.json ) );
		//		ids.push( group.groupID );
		//	}

		//	var loader = new AnimateLoader();
		//	loader.on( LoaderEvents.COMPLETE, this.onServer, this );
		//	loader.on( LoaderEvents.FAILED, this.onServer, this );
  //          loader.load("/project/save-groups", { projectId: this.entry._id, ids: ids, data : jsons } );
		//}

		///**
		//* Deletes groups from the project
		//* @param {Array<string>} groupIds The array of group IDs to delete
		//*/
		//deleteGroups( groupIds: Array<string> )
		//{
		//	var loader = new AnimateLoader();
		//	loader.on( LoaderEvents.COMPLETE, this.onServer, this );
		//	loader.on( LoaderEvents.FAILED, this.onServer, this );
  //          loader.load("/project/delete-groups", { projectId: this.entry._id, ids: groupIds } );
		//}

		///**
		//* This will download all group variables from the server. If successful, the function will also get
		//* the asset treeview to update its contents
		//* @param {Array<string>} groupIds  groupIds The array of group IDs to update
		//*/
		//updateGroups( groupIds: Array<string> )
		//{
		//	var loader = new AnimateLoader();
		//	loader.on( LoaderEvents.COMPLETE, this.onServer, this );
		//	loader.on( LoaderEvents.FAILED, this.onServer, this );
  //          loader.load("/project/update-groups", { projectId: this.entry._id, ids: groupIds } );
		//}

		///**
		//* This function is used to create a new asset on the server.
		//* If the server sends a fail message then no new asset
		//* will be created. You can use the event <Project.ASSET_CREATED> to hook into
		//* a successful DB entry created.
		//* @param {string} name The proposed name of the asset.
		//* @param {string} className The class of the asset.
		//*/
		//createAsset( name: string, className: string )
		//{
		//	var loader = new AnimateLoader();
		//	loader.on( LoaderEvents.COMPLETE, this.onServer, this );
  //          loader.on(LoaderEvents.FAILED, this.onServer, this);
  //          loader.load("/project/create-asset", { projectId: this.entry._id, name: name, className: className, shallowId: ProjectResource.generateLocalId() });
		//}

		///**
		//* This will save a group of asset's variables to the server in JSON.
		//* @param {Array<string>} assetIds An array of asset ids of the assets we want to save
		//*/
		//saveAssets( assetIds : Array<string> )
		//{
		//	if ( assetIds.length == 0 )
		//		return;

		//	var pm: PluginManager = PluginManager.getSingleton();
		//	var ev: AssetEvent = new AssetEvent( EditorEvents.ASSET_SAVING, null );
		//	var asset: Asset = null;
		//	var ids: Array<string> = [];
		//	var shallowIds: Array<number> = [];
		//	var jsons: Array<string> = [];
		//	for ( var i = 0, l = assetIds.length; i < l; i++ )
		//	{
		//		asset = this.getAssetByID( assetIds[i] );

		//		// Tell plugins about asset saving
		//		ev.asset = asset;
		//		pm.emit( ev );

  //              jsons.push(JSON.stringify(asset.properties.tokenize()));
  //              ids.push(asset.entry._id);
  //              shallowIds.push(asset.entry.shallowId );
		//	}

		//	var loader = new AnimateLoader();
		//	loader.on( LoaderEvents.COMPLETE, this.onServer, this );
		//	loader.on( LoaderEvents.FAILED, this.onServer, this );
  //          loader.load("/project/save-assets", { projectId: this.entry._id, ids: ids, data: jsons } );
		//}

		///**
		//* This will download an asset's variables from the server.
		//* @param {Array<string>} assetIds An array of assets we are updating
		//*/
		//updateAssets( assetIds : Array<string> )
		//{
		//	var loader = new AnimateLoader();
		//	loader.on( LoaderEvents.COMPLETE, this.onServer, this );
		//	loader.on( LoaderEvents.FAILED, this.onServer, this );
  //          loader.load("/project/update-assets", { projectId: this.entry._id, ids: assetIds } );
		//}

		///**
		//* This will download all asset variables from the server.
		//* @param {Array<string>} behaviourIDs An array of behaviour ID's that need to be updated
		//*/
		//updateBehaviours( behaviourIDs: Array<string> )
		//{
		//	var loader = new AnimateLoader();
		//	loader.on( LoaderEvents.COMPLETE, this.onServer, this );
		//	loader.on( LoaderEvents.FAILED, this.onServer, this );
  //          loader.load("/project/update-behaviours", { projectId: this.entry._id, ids: behaviourIDs } );
		//}

		///**
		//* This function is used to copy an asset.
		//* @param {string} assetId The asset object we are trying to copy
		//*/
		//copyAsset( assetId : string )
		//{
		//	var loader = new AnimateLoader();
		//	loader.on( LoaderEvents.COMPLETE, this.onServer, this );
  //          loader.on(LoaderEvents.FAILED, this.onServer, this);
  //          loader.load("/project/copy-asset", { projectId: this.entry._id, assetId: assetId, shallowId: ProjectResource.generateLocalId() });
		//}

		///**
		//* This function is used to delete assets.
		//* @param {Array<string>} assetIDs The asset objects we are trying to delete
		//*/
		//deleteAssets( assetIDs: Array<string> )
		//{
		//	var loader = new AnimateLoader();
		//	loader.on( LoaderEvents.COMPLETE, this.onServer, this );
		//	loader.on( LoaderEvents.FAILED, this.onServer, this );
  //          loader.load("/project/delete-assets", { projectId: this.entry._id, ids: assetIDs } );
		//}

		///**
		//* This function is used to fetch the _assets of a project.
		//*/
		//loadAssets()
		//{
		//	var loader = new AnimateLoader();
		//	loader.on( LoaderEvents.COMPLETE, this.onServer, this );
		//	loader.on( LoaderEvents.FAILED, this.onServer, this );
  //          loader.load("/project/get-assets", { projectId: this.entry._id } );
		//}


		///**
		//* Loads the project from data sent from the server
		//* @param {any} data The data sent from the server
		//*/
		//loadFromData( data : any )
		//{
		//	this.saved = true;
			//this.buildId = data.project.buildId;
			//this.created = data.project.createdOn;
			//this.lastModified = data.project.lastModified;

			//this.mName = data.project.name;
			//this.mRating = data.project.rating;
			//this.mCategory = data.project.category;
			//this.mSubCategory = data.project.sub_category;
			//this.mImgPath = data.project.image;
			//this.mVisibility = data.project.visibility;

			//var pluginIds = data.project.plugins;

			//if ( !pluginIds )
			//	this._plugins = [];
			//else
			//{
   //             this._plugins = [];
   //             for (var i = 0, l = pluginIds.length; i < l; i++)
   //                 this._plugins.push(getPluginByID[pluginIds[i]]);

			//	//var i = __plugins.length;
			//	//while ( i-- )
			//	//{
			//	//	var ii: number = pluginIds.length;
			//	//	while ( ii-- )
			//	//		if ( pluginIds[ii] == __plugins[i]._id )
			//	//		{
			//	//			this._plugins.push( __plugins[i] );
			//	//			break;
			//	//		}
			//	//}
			//}

			//this.curBuild = data.build;
			//this.mDescription = data.project.description;
			//this.mTags = data.project.tags;
		//}


		/**
		* This function is called whenever we get a resonse from the server
		*/
		onServer( response : LoaderEvents, event : AnimateLoaderEvent, sender?: EventDispatcher )
		{
			var data: any = event.tag;
			var pManager: PluginManager = PluginManager.getSingleton();
			var dispatchEvent: Event;

			var loader = <AnimateLoader>sender;

			if ( response == LoaderEvents.COMPLETE )
			{
				if (event.return_type == AnimateLoaderResponses.SUCCESS )
				{
					//Sets the current build
					if ( loader.url == "/project/select-build" )
					{
						this.curBuild = data.build;
						//this.emit( new ProjectEvent( ProjectEvents.BUILD_SELECTED, data.message, LoaderEvents.fromString( data.return_type ),  this.mCurBuild ) );
					}
					//Updates the current build
					else if ( loader.url == "/project/save-build" )
					{
						//this.mCurBuild = data.build;
						//this.emit( new ProjectEvent( ProjectEvents.BUILD_SAVED, "Build saved", LoaderEvents.fromString( data.return_type ), this.mCurBuild ) );
					}
					////Delete a new Behaviour
					//else if ( loader.url == "/project/delete-behaviours" )
					//{
					//	//Update behaviours ids which we fetched from the DB.
					//	for ( var i = 0, l = data.length; i < l; i++ )
					//	{
					//		var len = this._containers.length;
					//		for ( var ii = 0; ii < len; ii++ )
     //                           if (this._containers[ii].entry._id == data[i] )
					//			{
					//				var behaviour : Container = this._containers[ii];
					//				behaviour.dispose();
					//				this._containers.splice( ii, 1 );
					//				//this.emit( new ProjectEvent( ProjectEvents.BEHAVIOUR_DELETING, "Deleting Behaviour", LoaderEvents.COMPLETE, behaviour ) );
					//				break;
					//			}
					//	}
					//}
					////Create a new Behaviour
					//else if ( loader.url == "/project/create-behaviour" )
					//{
					//	var behaviour: Container = new Container( data.name, data.id, data.shallowId );
					//	this._behaviours.push( behaviour );

					//	//Create the GUI elements
					//	var node: TreeNodeBehaviour = TreeViewScene.getSingleton().addContainer( behaviour );
					//	node.save( false );
					//	var tabPair = CanvasTab.getSingleton().addSpecialTab(behaviour.name, CanvasTabType.CANVAS, behaviour );
					//	jQuery( ".text", tabPair.tabSelector.element ).text( node.element.text() );
					//	tabPair.name = node.element.text();

					//	this.emit( new ProjectEvent( ProjectEvents.BEHAVIOUR_CREATED, "Behaviour created", LoaderEvents.COMPLETE, behaviour ) );
					//}
					//else if ( loader.url == "/project/get-behaviours" )
					//{
					//	//Cleanup behaviourssaveAll
					//	for ( var i = 0; i < this._behaviours.length; i++ )
					//		this._behaviours[i].dispose();

					//	this._behaviours.splice( 0, this._behaviours.length );

					//	//Create new behaviours which we fetched from the DB.
					//	for ( var i = 0, l = data.length; i < l; i++ )
					//	{
     //                       var dbEntry = data[i];
     //                       var b: Container = new Container({ name: dbEntry["name"], _id: dbEntry["_id"], shallowId: dbEntry["shallowId"] });
     //                       b.entry.json = CanvasToken.fromDatabase( dbEntry["json"], dbEntry["_id"]  );
					//		b.setProperties( dbEntry.json.properties );
					//		this._behaviours.push( b );

					//		//Create the GUI elements
					//		TreeViewScene.getSingleton().addContainer( b );

					//		//Update the GUI elements
					//		TreeViewScene.getSingleton().updateBehaviour( b );
					//		//this.emit(new ProjectEvent(ProjectEvents.BEHAVIOUR_UPDATED, "Behaviour updated", LoaderEvents.COMPLETE, b ) );
					//	}
					//	//this.emit(new ProjectEvent(ProjectEvents.BEHAVIOURS_LOADED, "Behaviours loaded", LoaderEvents.COMPLETE, null ) );
					//}
					//else if ( loader.url == "/project/save-behaviours" )
					//{
					//	for ( var i = 0; i < this._containers.length; i++ )
					//		for ( ii = 0, l = data.length; ii < l; ii++ )
     //                           if (this._containers[i].entry._id == data[ii] )
					//			{
					//				// Make sure the JSON is updated in the behaviour
					//				var canvas: Canvas = CanvasTab.getSingleton().getTabCanvas( data[ii] );
					//				if ( canvas )
     //                                   this._containers[i].entry.json = canvas.buildDataObject();

					//				//this.emit( new ProjectEvent( ProjectEvents.BEHAVIOUR_SAVED, "Behaviour saved", LoaderEvents.COMPLETE, this._behaviours[i] ) );
					//				break;
					//			}

					//	//this.emit(new ProjectEvent(ProjectEvents.BEHAVIOURS_SAVED, "Behaviours saved", LoaderEvents.COMPLETE, null ) );
					//}
					//else if ( loader.url == "/project/save-html" )
					//{
					//	//this.emit( new ProjectEvent( ProjectEvents.HTML_SAVED, "HTML saved", LoaderEvents.fromString( data.return_type ), this.mCurBuild ) );
					//	if ( HTMLTab.singleton )
					//		HTMLTab.singleton.save();
					//}
					//else if ( loader.url == "/project/save-css" )
					//{
					//	//this.emit( new ProjectEvent( ProjectEvents.CSS_SAVED, "CSS saved", LoaderEvents.fromString( data.return_type ), this.mCurBuild ) );
					//	if ( CSSTab.singleton )
					//		CSSTab.singleton.save();
					//}
					////Delete an asset
					//else if ( loader.url == "/project/delete-assets" )
					//{
					//	dispatchEvent = new AssetEvent( EditorEvents.ASSET_DESTROYED, null );
					//	var ev = new AssetEvent( ProjectEvents.ASSET_DELETING, null );

					//	for ( var i = 0, l = data.length; i < l; i++ )
					//	{
					//		var len = this._assets.length;
					//		for ( var ii = 0; ii < len; ii++ )
     //                           if (this._assets[ii].entry._id == data[i] )
					//			{
					//				ev.asset = this._assets[ii];
					//				this.emit( ev );

					//				//Notify the destruction of an asset
					//				( <AssetEvent>dispatchEvent).asset = this._assets[ii];
					//				pManager.emit( dispatchEvent );

					//				this._assets[ii].dispose();
					//				this._assets.splice( ii, 1 );
					//				break;
					//			}
					//	}
					//}
					////Creates each of the _files and notify they were loaded.
					//else if ( loader.url == "/project/get-files" )
					//{
					//	var i = this._files.length;
					//	while ( i-- )
					//		this._files[i].dispose();

					//	this._files.splice( 0, this._files.length );

					//	//Create each of the files
					//	for ( var i = 0, l = data.length; i < l; i++ )
					//	{
					//		var dbEntry = data[i];
					//		var file = new File( dbEntry["name"], dbEntry["url"], dbEntry["tags"], dbEntry["_id"], dbEntry["createdOn"], dbEntry["lastModified"], dbEntry["size"], dbEntry["favourite"], dbEntry["previewUrl"], dbEntry["global"] );

					//		this._files.push( file );
					//		this.dispatchEvent(new ProjectEvent(ProjectEvents.FILE_CREATED, "File created", LoaderEvents.COMPLETE, file ) );
					//	}
					//	this.dispatchEvent(new ProjectEvent(ProjectEvents.FILES_CREATED, "Files created", LoaderEvents.COMPLETE, this ) );
					//	this.dispatchEvent(new ProjectEvent(ProjectEvents.FILES_LOADED, "Files loaded", LoaderEvents.COMPLETE, this ) );
					//}
					//Create the file and notifies it was loaded.
					//else if ( loader.url == "/project/import-files" )
					//{
					//	//Create new _assets which we fetched from the DB.
					//	this.dispatchEvent( new ProjectEvent( ProjectEvents.FILE_CREATED, event.message, LoaderEvents.COMPLETE, file ) );
					//	this.dispatchEvent( new ProjectEvent(ProjectEvents.FILE_IMPORTED, event.message, LoaderEvents.COMPLETE, file ) );
					//}
					////Delets a file
					//else if ( loader.url == "/project/delete-files" )
					//{
					//	for ( var ii = 0, l = data.length; ii < l; ii++ )
					//		for ( var i = 0, len = this._files.length; i < len; i++ )
					//			if ( this._files[i].id == data[ii] )
					//			{
					//				this._files[i].dispose();
					//				this.dispatchEvent(new ProjectEvent(ProjectEvents.FILE_DELETED, "File deleted", LoaderEvents.COMPLETE, this._files[i] ) );
					//				this._files.splice( i, 1 );
					//				break;
					//			}

					//	this.dispatchEvent(new ProjectEvent(ProjectEvents.FILES_DELETED, "Files deleted", LoaderEvents.COMPLETE, data ) );
					//}
					// Creates an empty file on the server
					//else if ( loader.url == "/file/create-empty-file" )
					//{
					//	var file = new File( data["name"], data["url"], [], data["_id"], data["createdOn"], data["lastModified"], 0, false, data["previewUrl"], false );
					//	this.dispatchEvent( new ProjectEvent( ProjectEvents.FILE_CREATED, "File created", LoaderEvents.COMPLETE, file ) );
					//}
					//// Fills a file with data
					//else if ( loader.url == "/file/fill-file" )
					//{
					//	for ( var i = 0, len = this._files.length; i < len; i++ )
					//		if ( this._files[i].id == data.id )
					//			{
					//				this.dispatchEvent( new ProjectEvent( ProjectEvents.FILE_UPDATED, "File updated", LoaderEvents.COMPLETE, this._files[i] ) );
					//				return;
					//			}
					//}
					//// Saves the details of an uploaded file
					//else if ( loader.url == "/project/save-file" )
					//{
					//	for ( var i = 0, len = this._files.length; i < len; i++ )
					//		if ( this._files[i].id == data._id )
					//		{
					//			this._files[i].name = data.name;
					//			this._files[i].tags = data.tags;
					//			this._files[i].lastModified = data.lastModified;
					//			this._files[i].favourite = data.favourite;
					//			this._files[i].global = data.global;

					//			if ( loader.url == "/project/save-file" )
					//				this.dispatchEvent(new ProjectEvent(ProjectEvents.FILE_UPDATED, "File updated", LoaderEvents.COMPLETE,  this._files[i] ) );
					//			else
					//				this.dispatchEvent(new ProjectEvent(ProjectEvents.FILE_IMAGE_UPDATED, "File image updated", LoaderEvents.COMPLETE, this._files[i] ) );

					//			return;
					//		}
					//}

					//Create a new group
					//else if ( loader.url == "/project/create-group" )
					//	this.emit( new ProjectEvent( ProjectEvents.GROUP_CREATED, "Group created", LoaderEvents.COMPLETE, { id: data._id, name: data.name, json: data.json } ) );
					//Creates each of the groups and notify they were loaded.
					else if ( loader.url == "/project/get-groups" )
					{
						//Create new _assets which we fetched from the DB.
						for ( var i = 0, l = data.length; i < l; i++ )
						{
							var dbEntry = data[i];
							//this.emit(new ProjectEvent(ProjectEvents.GROUP_CREATED, "Group created", LoaderEvents.COMPLETE, { id: dbEntry["_id"], name: dbEntry["name"], json: dbEntry["json"] } ));
						}
						//this.emit(new ProjectEvent(ProjectEvents.GROUPS_LOADED, "Groups loaded", LoaderEvents.COMPLETE, this ) );
					}
					////Delete a new group
					//else if ( loader.url == "/project/delete-groups" )
					//{
					//	for ( var i = 0, l = data.length; i < l; i++ )
					//	{
					//		var grpID = data[i];
					//		//this.emit( new ProjectEvent( ProjectEvents.GROUP_DELETING, "Group deleting", LoaderEvents.COMPLETE, grpID ) );
					//	}
					//}
					////Update / download group details
					//else if ( loader.url == "/project/update-groups" )
					//{
					//	//Update _assets which we fetched from the DB.
					//	for ( var i = 0, l = data.length; i < l; i++ )
					//	{
					//		var grp = data[i];
					//		//this.emit( new ProjectEvent( ProjectEvents.GROUP_UPDATED, "Group updated", LoaderEvents.COMPLETE, grp ) );
					//	}

					//	//this.emit( new ProjectEvent( ProjectEvents.GROUPS_UPDATED, "Groups updated", null ) );
					//}
					//Entered if we have saved some groups
					//else if ( loader.url == "/project/save-groups" )
					//{
						//for ( var i = 0, l = data.length; i < l; i++ )
							///this.emit(new ProjectEvent(ProjectEvents.GROUP_SAVED, "Group saved", LoaderEvents.COMPLETE, data[i] ) );

						//this.emit(new ProjectEvent(ProjectEvents.GROUPS_SAVED, "Groups saved", LoaderEvents.COMPLETE, null ) );
					//}
					//Create a new Behaviour
					//else if ( loader.url == "/project/create-asset" || loader.url == "/project/copy-asset" )
                    //{
      //                  var asset = new Asset({ name: data.name, className: data.className, json: data.json, _id: data._id, shallowId: data.shallowId });
						//this._assets.push( asset );

						////Create the GUI elements
						//TreeViewScene.getSingleton().addAssetInstance( asset, false );

						////Notify the creation of an asset
      //                  pManager.assetCreated(asset.entry.name, asset );

						////Now that the asset is loaded we notify the plugins of each of its variables incase they need to initialize / set something.
						//var eSet: EditableSet = asset.properties;
						//var variables: Array<PropertyGridVariable> = eSet.variables;
						//for ( var ii: number = 0, len = variables.length; ii < len; ii++ )
						//	pManager.assetEdited( asset, variables[ii].name, variables[ii].value, variables[ii].value, variables[ii].type );

						////pManager.assetLoaded( asset );
						//pManager.emit( new AssetEvent( EditorEvents.ASSET_LOADED, asset ) );

						//this.emit(new ProjectEvent(ProjectEvents.ASSET_CREATED, "Asset created", LoaderEvents.COMPLETE, asset ) );
					//}
					////Save the asset
					//else if ( loader.url == "/project/save-assets" )
					//{
					//	for ( var ii = 0; ii < data.length; ii++ )
					//		for ( var i = 0; i < this._assets.length; i++ )
     //                           if (this._assets[i].entry._id == data[ii] )
					//				this.emit( new AssetEvent( ProjectEvents.ASSET_SAVED, this._assets[i] ) );

					//	//this.emit(new ProjectEvent(ProjectEvents.ASSET_SAVED, "Asset saved", LoaderEvents.COMPLETE, null  ));
					//}
					//Update / download asset details
					else if ( loader.url == "/project/update-assets" )
					{
						for ( var ii = 0; ii < data.length; ii++ )
							for ( var i = 0; i < this._assets.length; i++ )
                                if (this._assets[i].entry._id == data[ii]._id )
								{
									this._assets[i].update( data[ii].name, data[ii].className, data[ii].json );
									//this.emit( new AssetEvent(ProjectEvents.ASSET_UPDATED, this._assets[i] )) ;
								}

						//this.emit(new ProjectEvent(ProjectEvents.ASSET_SAVED, "Asset saved", LoaderEvents.COMPLETE, null ));
					}
					////Update / download behaviour details
					//else if ( loader.url == "/project/update-behaviours" )
					//{
					//	//Update behaviours which we fetched from the DB.
					//	for ( var ii = 0, l = data.length; ii < l; ii++ )
					//	{
					//		for ( var i = 0, len = this._containers.length; i < len; i++ )
     //                           if (this._containers[i].entry._id == data[ii]._id )
					//			{
					//				this._containers[i].update( data[ii].name, CanvasToken.fromDatabase( data[ii].json, data[ii]._id ) );

					//				//Update the GUI elements
					//				//TreeViewScene.getSingleton().updateBehaviour( this._containers[i] );
					//				//this.emit(new ProjectEvent(ProjectEvents.BEHAVIOUR_UPDATED, "Behaviour updated", LoaderEvents.COMPLETE, this._behaviours[i] ) );
					//				break;
					//			}
					//	}

					//	//this.emit(new ProjectEvent(ProjectEvents.BEHAVIOURS_UPDATED, "Behaviours updated", LoaderEvents.COMPLETE, null ) );
					//}
					//else if ( loader.url == "/project/get-assets" )
					//{
					//	//Cleanup _assets
					//	for ( var i = 0; i < this._assets.length; i++ )
					//		this._assets[i].dispose();

					//	this._assets.splice( 0, this._assets.length );

					//	//Create new _assets which we fetched from the DB.
					//	for ( var i = 0, l = data.length; i < l; i++ )
					//	{
     //                       var dbEntry = data[i];
     //                       var asset = new Asset({ name: dbEntry["name"], className: dbEntry["className"], json: dbEntry["json"], _id: dbEntry["_id"], shallowId: dbEntry["shallowId"] });

					//		//Create the GUI elements
					//		if ( TreeViewScene.getSingleton().addAssetInstance( asset ) )
					//			this._assets.push( asset );
					//		else
					//			asset.dispose();
					//	}

					//	//Notify the creation of an asset
					//	var len = this._assets.length;
					//	for ( var i = 0; i < len; i++ )
     //                       pManager.assetCreated(this._assets[i].entry.name, this._assets[i] );

					//	//Now that the asset is loaded we notify the plugins of each of its variables incase they need to initialize / set something.
					//	for ( var i = 0; i < len; i++ )
					//	{
					//		var eSet: EditableSet = this._assets[i].properties;
					//		var variables: Array<Prop> = eSet.variables;
					//		for ( var ii: number = 0, len2 = variables.length; ii < len2; ii++ )
					//			pManager.assetEdited( this._assets[i], variables[ii].name, variables[ii].value, variables[ii].value, variables[ii].type );
					//	}

					//	var eventCreated: AssetEvent = new AssetEvent( EditorEvents.ASSET_CREATED, null );
					//	for ( var i = 0; i < len; i++ )
					//	{
					//		//pManager.assetLoaded( this._assets[i] );
					//		eventCreated.asset = this._assets[i];
					//		pManager.emit( eventCreated );
					//	}

					//	//this.emit(new ProjectEvent(ProjectEvents.ASSETS_LOADED, "Assets loaded", LoaderEvents.COMPLETE, this ) );
					//}
					////Handle renaming
					//else if ( loader.url == "/project/rename-object" )
					//{
					//	var obj = null;
					//	var dataType: ProjectAssetTypes = ProjectAssetTypes.fromString( data.type );
					//	if ( dataType.toString() == ProjectAssetTypes.BEHAVIOUR.toString() )
					//	{
					//		var len = this._behaviours.length;
					//		for ( var i = 0; i < len; i++ )
					//			if ( data.id == this._behaviours[i].id )
					//			{
					//				obj = this._behaviours[i];
					//				break;
					//			}
					//	}
					//	//We need to do it like this because there is also a ParameterType.ASSET
					//	else if ( dataType.toString() == ProjectAssetTypes.ASSET.toString() )
					//	{
					//		var len = this._assets.length;
					//		for ( var i = 0; i < len; i++ )
					//			if ( data.id == this._assets[i].id )
					//			{
					//				obj = this._assets[i];
					//				break;
					//			}
					//	}
					//	else
					//		obj = TreeViewScene.getSingleton().getGroupByID( data.id )

					//	//Send event
					//	this.emit(new ProjectEvent(ProjectEvents.OBJECT_RENAMED, "Object Renamed", LoaderEvents.COMPLETE, { object: obj, type: data.type, name: data.name, id: data.id }));
					//}
				}
				else
				{
					// TODO: This should be removed
					// MessageBox.show(event.message, Array<string>("Ok"), null, null );
					//this.emit( new ProjectEvent( ProjectEvents.FAILED, event.message, data ) );
				}
			}
			//else
			//	this.emit(new ProjectEvent(ProjectEvents.FAILED, "Could not connec to the server.", LoaderEvents.FAILED, null ));
        }

        get containers(): Array<Container> { return this._containers; }
        get files(): Array<FileResource> { return this._files; }
        get scripts(): Array<ScriptResource> { return this._scripts; }
        get assets(): Array<Asset> { return this._assets; }
        get groups(): Array<GroupArray> { return this._groups; }

		/**
		* This will cleanup the project and remove all data associated with it.
		*/
		reset()
        {
            this.entry = null;
			var pManager: PluginManager = PluginManager.getSingleton();
            var event: AssetEvent;

			//Cleanup behaviours
			var i = this._containers.length;
			while ( i-- )
				this._containers[i].dispose();

            i = this._assets.length;

			event = new AssetEvent( EditorEvents.ASSET_DESTROYED, null );
			while ( i-- )
			{
                event.asset = this._assets[i];

				//Notify the destruction of an asset
				pManager.emit( event );
				this._assets[i].dispose();
			}

			this.saved = true;
            this._containers.splice(0, this._containers.length);
            this._assets.splice(0, this._assets.length);
            this._groups.splice(0, this._groups.length);
            this._files.splice(0, this._files.length);
            this._scripts.splice(0, this._scripts.length);
		}

        get plugins(): Array<Engine.IPlugin> { return this.entry.$plugins; }
	}
}