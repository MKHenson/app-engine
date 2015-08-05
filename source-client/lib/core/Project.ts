module Animate
{
	export class ProjectAssetTypes extends ENUM
	{
		constructor(v: string) { super(v); }

		static BEHAVIOUR: ProjectAssetTypes = new ProjectAssetTypes("behaviour");
		static ASSET: ProjectAssetTypes = new ProjectAssetTypes("asset");
		static GROUP: ProjectAssetTypes = new ProjectAssetTypes("group");

		/**
		* Returns an enum reference by its name/value
		* @param {string} val
		* @returns ENUM
		*/
		static fromString(val: string): ProjectAssetTypes
		{
			switch (val)
			{
				case "behaviour":
					return ProjectAssetTypes.BEHAVIOUR;
				case "asset":
					return ProjectAssetTypes.ASSET;
				case "group":
					return ProjectAssetTypes.GROUP;
			}

			return null;
		}
	}

	export class ProjectEvents
	{
		public value: string;
		constructor(v: string) { this.value = v; }
		toString() { return this.value; }

		static SAVED: ProjectEvents = new ProjectEvents("saved");
		static SAVED_ALL: ProjectEvents = new ProjectEvents("saved_all");
		static OPENED: ProjectEvents = new ProjectEvents("opened");
		static FAILED: ProjectEvents = new ProjectEvents("failed");
		static BUILD_SELECTED: ProjectEvents = new ProjectEvents("build_selected");
		static HTML_SAVED: ProjectEvents = new ProjectEvents( "html_saved" );
		static CSS_SAVED: ProjectEvents = new ProjectEvents( "css_saved" );
		static BUILD_SAVED: ProjectEvents = new ProjectEvents( "build_saved" );
		static BEHAVIOUR_DELETING: ProjectEvents = new ProjectEvents("behaviour_deleting");
		static BEHAVIOURS_LOADED: ProjectEvents = new ProjectEvents("behaviours_loaded");
		static BEHAVIOUR_CREATED: ProjectEvents = new ProjectEvents("behaviour_created");
		static BEHAVIOUR_UPDATED: ProjectEvents = new ProjectEvents("behaviour_updated");
		static BEHAVIOURS_UPDATED: ProjectEvents = new ProjectEvents("behaviours_updated");
		static BEHAVIOURS_SAVED: ProjectEvents = new ProjectEvents("behaviours_saved");
		static BEHAVIOUR_SAVED: ProjectEvents = new ProjectEvents("behaviour_saved");
		static ASSET_CREATED: ProjectEvents = new ProjectEvents("asset_created");
		static ASSET_SAVED: ProjectEvents = new ProjectEvents("asset_saved");
		static ASSET_UPDATED: ProjectEvents = new ProjectEvents("asset_updated");
		static ASSETS_UPDATED: ProjectEvents = new ProjectEvents("assets_updated");
		static ASSET_DELETING: ProjectEvents = new ProjectEvents("asset_deleting");
		static ASSETS_LOADED: ProjectEvents = new ProjectEvents("assets_deleted");
		static GROUP_UPDATED: ProjectEvents = new ProjectEvents("group_updated");
		static GROUPS_UPDATED: ProjectEvents = new ProjectEvents("groups_updated");
		static GROUP_SAVED: ProjectEvents = new ProjectEvents("group_saved");
		static GROUPS_SAVED: ProjectEvents = new ProjectEvents("groups_saved");
		static GROUP_DELETING: ProjectEvents = new ProjectEvents("group_deleting");
		static GROUP_CREATED: ProjectEvents = new ProjectEvents("group_created");
		static GROUPS_LOADED: ProjectEvents = new ProjectEvents("groups_loaded");
		static FILE_CREATED: ProjectEvents = new ProjectEvents("file_created");
		static FILE_IMPORTED: ProjectEvents = new ProjectEvents("file_imported");
		static FILE_DELETED: ProjectEvents = new ProjectEvents("file_deleted");
		static FILES_DELETED: ProjectEvents = new ProjectEvents("files_deleted");
		static FILES_CREATED: ProjectEvents = new ProjectEvents("files_created");
		static FILE_UPDATED: ProjectEvents = new ProjectEvents( "file_updated" );
		static FILE_IMAGE_UPDATED: ProjectEvents = new ProjectEvents("file_image_updated");
		static FILES_LOADED: ProjectEvents = new ProjectEvents("files_loaded");
		//static FILES_FETCHED: ProjectEvents = new ProjectEvents("files_fetched");
		static OBJECT_RENAMED: ProjectEvents = new ProjectEvents("object_renamed");
	}

	export class ProjectEvent extends AnimateLoaderEvent
	{
		constructor(eventName: ProjectEvents, message: string, return_type: LoaderEvents, data?: any)
		{
			super(eventName, message, return_type, data);
		}
	}

	/**
	* The build class defined in the database
	*/
	export declare class Build
	{
		public name: string;
		public projectId: string;
		public state: string;
		public html: string;
		public css: string;
		public file: string;
		public filePath: string;
		public visibility: string;
		public rating: number;
		public build_notes: string;
		public version: string;
		public createdOn: number;
		public lastModified: number;
		public _id: string;
	}


	export enum PrivilegeType
	{
		NONE = 0,
		READ,
		WRITE,
		ADMIN,
	}

	/**
	* A project class is an object that is owned by a user. 
	* The project has functions which are useful for comunicating data to the server when 
	* loading and saving data in the scene.
	*/
	export class Project extends EventDispatcher
	{
		public _id: string;
		public buildId: string;
		public mSaved: boolean;
		public mName: string;
		public mDescription: string;
		public mTags: string;
		//public mRequest: string;
		public mCurBuild: Build;
		private _plugins: Array<IPluginDefinition>;
		public created: number;
		public lastModified: number;
		public mCategory: string;
		public mSubCategory: string;
		public mRating: number;
		public mImgPath: string;
		public mVisibility: string;
		private _behaviours: Array<BehaviourContainer>;
		private _assets: Array<Asset>;
		private _files: Array<File>;

		/**
		* @param{string} id The database id of this project
		*/
		constructor( id: string, name: string, build: Build )
		{
			// Call super-class constructor
			super();

			this._id = id;
			this.buildId = "";
			this.mSaved = true;
			this.mName = name;
			this.mDescription = "";
			this.mTags = "";
			//this.mRequest = "";
			this.mCurBuild = build;
			this._plugins = [];
			this.created = Date.now();
			this.lastModified = Date.now();
			this.mCategory = "";
			this.mSubCategory = "";
			this.mRating = 0;
			this.mImgPath = "";
			this.mVisibility = "";
			this._behaviours = [];
			this._assets = [];
			this._files = [];
		}

		/**
		* Gets an asset by its ID
		* @param {string} id The ID of the asset id
		* @returns {Asset} The asset whose id matches the id parameter or null
		*/
		getAssetByID( id: string ): Asset
		{
			for ( var i = 0; i < this._assets.length; i++ )
				if ( this._assets[i].id == id )
					return this._assets[i];

			return null;
		}

		/**
		* Gets an asset by its shallow ID
		* @param {string} id The shallow ID of the asset id
		* @returns {Asset} The asset whose id matches the id parameter or null
		*/
		getAssetByShallowId( id: number ): Asset
		{
			for ( var i = 0; i < this._assets.length; i++ )
				if ( this._assets[i].shallowId == id )
					return this._assets[i];

			return null;
		}

		/**
		* Gets a file by its ID
		* @param {string} id The ID of the file
		* @returns {File} The file whose id matches the id parameter or null
		*/
		getFile( id: string ): File
		{
			for ( var i = 0; i < this._files.length; i++ )
				if ( this._files[i].id == id )
					return this._files[i];

			return null;
		}


		/**
		* Gets a {BehaviourContainer} by its ID
		* @param {string} id The ID of the BehaviourContainer
		* @returns {BehaviourContainer} The BehaviourContainer whose id matches the id parameter or null
		*/
		getBehaviourById( id: string ): BehaviourContainer
		{
			for ( var i = 0; i < this._behaviours.length; i++ )
				if ( this._behaviours[i].id == id )
					return this._behaviours[i];

			return null;
		}

		/**
		* Gets a {BehaviourContainer} by its shallow or local ID
		* @param {string} id The local ID of the BehaviourContainer
		* @returns {BehaviourContainer} The BehaviourContainer whose id matches the id parameter or null
		*/
		getBehaviourByShallowId( id: number ): BehaviourContainer
		{
			for ( var i = 0; i < this._behaviours.length; i++ )
				if ( this._behaviours[i].shallowId == id )
					return this._behaviours[i];

			return null;
		}


		/**
		* Use this to rename a behaviour, group or asset.
		* @param {string} name The new name of the object
		* @param {string} id The id of the asset or behaviour.
		* @param {ProjectAssetTypes} type The type of object we are renaming. this can be either 'group', 'asset' or 'behaviour'
		*/
		renameObject( name: string, id: string, type: ProjectAssetTypes )
		{
			var loader = new AnimateLoader();
			loader.addEventListener( LoaderEvents.COMPLETE, this.onServer, this );
			loader.addEventListener( LoaderEvents.FAILED, this.onServer, this );
			loader.load( "/project/rename-object", {
				projectId: this._id,
				name: name,
				objectId: id,
				type: type.toString()
			} );
		}


		/**
		* This function is used to create an entry for this project on the DB. 
		*/
		selectBuild( major: string, mid: string, minor: string ): void
		{
			var loader = new AnimateLoader();
			loader.addEventListener( LoaderEvents.COMPLETE, this.onServer, this );
			loader.addEventListener( LoaderEvents.FAILED, this.onServer, this );
			loader.load( "/project/select-build", { projectId: this._id, major: major, mid: mid, minor: minor } );
		}

		/**
		* This function is used to update the current build data
		*/
		saveBuild( notes: string, visibility: string, html: string, css: string ): void
		{
			var loader = new AnimateLoader();
			loader.addEventListener( LoaderEvents.COMPLETE, this.onServer, this );
			loader.addEventListener( LoaderEvents.FAILED, this.onServer, this );
			loader.load( "/project/save-build", { projectId: this._id, buildId: this.mCurBuild._id, notes: notes, visibility: visibility, html: html, css: css } );
		}
		

		/**
		* This function is used to save an array of behaviors to the DB
		* @param { Array<string>} behavioursIds This is the array behaviour ids we are saving. 
		*/
		saveBehaviours( behavioursIds: Array<string> ): void
		{
			if ( behavioursIds.length == 0 )
				return;

			var ids: Array<string> = [];
			var jsons: Array<string> = [];

			var behaviours: Array<BehaviourContainer> = this._behaviours;

			// Create a multidimension array and pass each of the behaviours
			for ( var i = 0, l = behavioursIds.length; i < l; i++ )
				for ( var ii = 0, l = behaviours.length; ii < l; ii++ )
					if ( behavioursIds[i] == behaviours[ii].id )
					{
						var json: CanvasToken = null;
						var canvas : Canvas = CanvasTab.getSingleton().getTabCanvas( behavioursIds[i] );
						if ( canvas )
							json = canvas.buildDataObject();
						else
						{
							json = behaviours[ii].json;
							json.properties = behaviours[ii]._properties.tokenize();
						}

						var jsonStr: string = json.toString();
						ids.push( behaviours[ii].id );
						jsons.push( jsonStr );
					}

			var loader = new AnimateLoader();
			loader.addEventListener( LoaderEvents.COMPLETE, this.onServer, this );
			loader.addEventListener( LoaderEvents.FAILED, this.onServer, this );
			loader.load( "/project/save-behaviours", { projectId: this._id, ids: ids, data : jsons } );
		}

		/**
		* This function is used to save the behaviors, groups and _assets or the DB
		*/
		saveAll()
		{
			// Behaviours
			var ids: Array<string> = [];
			var behaviours: Array<BehaviourContainer> = this._behaviours;
			for ( var i = 0, l = behaviours.length; i < l; i++ )
				if ( !behaviours[i].saved )
					ids.push( behaviours[i].id );
			this.saveBehaviours( ids );

			// Assets
			ids.splice( 0, ids.length );
			var assets: Array<Asset> = this._assets;
			for ( var i = 0, l = assets.length; i < l; i++ )
				if ( !assets[i].saved )
					ids.push( assets[i].id );
			this.saveAssets( ids );

			// Groups
			ids.splice( 0, ids.length );
			var groups: Array<TreeNodeGroup> = TreeViewScene.getSingleton().getGroups();
			for ( var i = 0, l = groups.length; i < l; i++ )
				if ( !groups[i].saved )
					ids.push( groups[i].groupID );
			this.saveGroups( ids );

			// TODO - save 
			Animate.CanvasTab.getSingleton().saveAll();
			this.saveHTML();
			this.saveCSS();
		}

		/**
		* This function is used to create a new behaviour. This will make
		* a call the server. If the server sends a fail message no new behaviour
		* will be created. You can use the event BEHAVIOUR_CREATED to hook into
		* @param {string} name The proposed name of the behaviour.
		*/
		createBehaviour( name: string )
		{
			for ( var i = 0; i < this._behaviours.length; i++ )
				if ( this._behaviours[i].name == name )
				{
					this.dispatchEvent( new ProjectEvent( ProjectEvents.FAILED, "A behaviour with that name already exists.", LoaderEvents.FAILED ) );
					return;
				}

			var loader = new AnimateLoader();
			loader.addEventListener( LoaderEvents.COMPLETE, this.onServer, this );
			loader.addEventListener( LoaderEvents.FAILED, this.onServer, this );
			loader.load( "/project/create-behaviour", { projectId: this._id, name : name, shallowId : BehaviourContainer.getNewLocalId() } );
		}


		/**
		* Saves the HTML from the HTML tab to the server
		*/
		saveHTML()
		{
			var html: string = ( HTMLTab.singleton ? HTMLTab.singleton.editor.getValue() : this.mCurBuild.html );
			var loader = new AnimateLoader();
			this.mCurBuild.html = html;
			loader.addEventListener( LoaderEvents.COMPLETE, this.onServer, this );
			loader.addEventListener( LoaderEvents.FAILED, this.onServer, this );
			loader.load( "/project/save-html", { projectId: this._id, html: html } );
		}


		/**
		* Saves the HTML from the HTML tab to the server
		*/
		saveCSS()
		{
			var css: string = ( CSSTab.singleton ? CSSTab.singleton.editor.getValue() : this.mCurBuild.css );
			var loader = new AnimateLoader();
			this.mCurBuild.css = css;
			loader.addEventListener( LoaderEvents.COMPLETE, this.onServer, this );
			loader.addEventListener( LoaderEvents.FAILED, this.onServer, this );
			loader.load( "/project/save-css", { projectId: this._id, css: css } );
		}


		/**
		* This function is used to delete behaviours.
		* @param {Array<string>} behavioursIds The behaviour Ids we need to delete
		*/
		deleteBehaviours( behavioursIds: Array<string> )
		{
			var ids: Array<string> = [];

			//Create a multidimension array and pass each of the _behaviours
			for ( var i = 0, l = behavioursIds.length; i < l; i++ )
				ids.push( behavioursIds[i] );

			var loader = new AnimateLoader();
			loader.addEventListener( LoaderEvents.COMPLETE, this.onServer, this );
			loader.addEventListener( LoaderEvents.FAILED, this.onServer, this );
			loader.load( "/project/delete-behaviours", { projectId: this._id, ids: ids } );
		}


		/**
		* This function is used to fetch the _files associated with a project.
		* @param {string} mode Which files to fetch - this can be either 'global', 'project' or 'user'
		*/
		loadFiles( mode: string = "project" )
		{
			var loader = new AnimateLoader();
			loader.addEventListener( LoaderEvents.COMPLETE, this.onServer, this );
			loader.addEventListener( LoaderEvents.FAILED, this.onServer, this );
			loader.load( "/project/get-files", { projectId: this._id, mode : mode } );
		}

		/**
		* This function is used to import a user's file from another project or from the global _assets base
		*/
		importFile( ids: Array<string> )
		{
			var loader = new AnimateLoader();
			loader.addEventListener( LoaderEvents.COMPLETE, this.onServer, this );
			loader.addEventListener( LoaderEvents.FAILED, this.onServer, this );
			loader.load( "/project/import-files", { projectId: this._id, ids: ids, });
		}

		

		/**
		* This function is used to delete files from a project and the database. The file asset will
		* not be deleted if another project has a reference to it. The reference of this project to the file will be 
		* removed either way. 
		* @param {Array<string>} ids An array of file IDs to delete
		*/
		deleteFiles( ids: Array<string> )
		{
			var loader = new AnimateLoader();
			loader.addEventListener( LoaderEvents.COMPLETE, this.onServer, this );
			loader.addEventListener( LoaderEvents.FAILED, this.onServer, this );
			loader.load( "/project/delete-files", { projectId: this._id, ids: ids, } );
		}

		/**
		* Use this function to create an empty data file for the user
		* @param {string} name The name of file we are creating. Please note this is not a file name. 
		*/
		createEmptyFile( name: string )
		{
			var loader = new AnimateLoader();
			loader.addEventListener( LoaderEvents.COMPLETE, this.onServer, this );
			loader.addEventListener( LoaderEvents.FAILED, this.onServer, this );
			loader.load( "/file/create-empty-file", { projectId: this._id, name: name });
		}

		/**
		* Fills a data file with the contents of an XHR request
		* See https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Sending_and_Receiving_Binary_Data
		* @param {string} id The id of the file we are 
		* @param {ArrayBufferView} view The data to fill the file with
		*/
		fillFile( id: string, view : ArrayBufferView )
		{
			var loader = new AnimateLoader();
			loader.addEventListener( LoaderEvents.COMPLETE, this.onServer, this );
			loader.addEventListener( LoaderEvents.FAILED, this.onServer, this );
			loader.contentType = "application/octet-stream";
			loader.processData = false;
			loader.getVariables = { id: id, projectId: this._id };

			loader.load( "/file/fill-file", view);
		}

		/**
		* Use this function to update file properties
		* @param {string} fileId The file we are updating
		* @param {string} name The new name of the file.
		* @param {Array<string>} tags The new comma separated tags of the file.
		* @param {bool} favourite If this file is a favourite
		* @param {bool} global True or false if this file is shared globally
		*/
		saveFile( fileId: string, name: string, tags: Array<string>, favourite: boolean, global: boolean )
		{
			var loader = new AnimateLoader();
			loader.addEventListener( LoaderEvents.COMPLETE, this.onServer, this );
			loader.addEventListener( LoaderEvents.FAILED, this.onServer, this );
			loader.load( "/project/save-file", { projectId: this._id, fileId: fileId, name: name, tags: tags, favourite: favourite, global: global } );
		}


		/**
		* This function is used to fetch the beaviours of a project. 
		*/
		loadBehaviours()
		{
			var loader = new AnimateLoader();
			loader.addEventListener( LoaderEvents.COMPLETE, this.onServer, this );
			loader.addEventListener( LoaderEvents.FAILED, this.onServer, this );
			loader.load( "/project/get-behaviours", { projectId: this._id } );
		}

		/**
		* This function is used to create a new group. This will make
		* a call the server. If the server sends a fail message then no new group
		* will be created. You can use the event GROUP_CREATED to hook into
		* a successful DB entry created.
		* @param {string} name The proposed name of the group.
		*/
		createGroup( name: string )
		{
			var loader = new AnimateLoader();
			loader.addEventListener( LoaderEvents.COMPLETE, this.onServer, this );
			loader.addEventListener( LoaderEvents.FAILED, this.onServer, this );
			loader.load( "/project/create-group", { projectId: this._id, name: name } );
		}

		/**
		* This function is used to fetch the groups of a project. 
		*/
		loadGroups()
		{
			var loader = new AnimateLoader();
			loader.addEventListener( LoaderEvents.COMPLETE, this.onServer, this );
			loader.addEventListener( LoaderEvents.FAILED, this.onServer, this );
			loader.load( "/project/get-groups", { projectId: this._id } );
		}

		/**
		* This will save the current state of the groups to the server
		* @param {Array<string>} groupIds The array of group ID's we are trying to save.
		*/
		saveGroups( groupIds: Array<string> )
		{
			if ( groupIds.length == 0 )
				return;

			var group: TreeNodeGroup = null;
			var ids : Array<string> = [];
			var jsons: Array<string> = [];
			for ( var i = 0, l = groupIds.length; i < l; i++ )
			{
				group = TreeViewScene.getSingleton().getGroupByID( groupIds[i] );
				jsons.push( JSON.stringify( group.json ) );
				ids.push( group.groupID );
			}

			var loader = new AnimateLoader();
			loader.addEventListener( LoaderEvents.COMPLETE, this.onServer, this );
			loader.addEventListener( LoaderEvents.FAILED, this.onServer, this );
			loader.load( "/project/save-groups", { projectId: this._id, ids: ids, data : jsons } );
		}

		/**
		* Deletes groups from the project
		* @param {Array<string>} groupIds The array of group IDs to delete
		*/
		deleteGroups( groupIds: Array<string> )
		{
			var loader = new AnimateLoader();
			loader.addEventListener( LoaderEvents.COMPLETE, this.onServer, this );
			loader.addEventListener( LoaderEvents.FAILED, this.onServer, this );
			loader.load( "/project/delete-groups", { projectId: this._id, ids: groupIds } );
		}

		/**
		* This will download all group variables from the server. If successful, the function will also get
		* the asset treeview to update its contents
		* @param {Array<string>} groupIds  groupIds The array of group IDs to update
		*/
		updateGroups( groupIds: Array<string> )
		{
			var loader = new AnimateLoader();
			loader.addEventListener( LoaderEvents.COMPLETE, this.onServer, this );
			loader.addEventListener( LoaderEvents.FAILED, this.onServer, this );
			loader.load( "/project/update-groups", { projectId: this._id, ids: groupIds } );
		}

		/**
		* This function is used to create a new asset on the server. 
		* If the server sends a fail message then no new asset
		* will be created. You can use the event <Project.ASSET_CREATED> to hook into
		* a successful DB entry created.
		* @param {string} name The proposed name of the asset.
		* @param {string} className The class of the asset.
		*/
		createAsset( name: string, className: string )
		{
			var loader = new AnimateLoader();
			loader.addEventListener( LoaderEvents.COMPLETE, this.onServer, this );
			loader.addEventListener( LoaderEvents.FAILED, this.onServer, this );
			loader.load( "/project/create-asset", { projectId: this._id, name: name, className: className, shallowId: Asset.getNewLocalId() } );
		}

		/**
		* This will save a group of asset's variables to the server in JSON.
		* @param {Array<string>} assetIds An array of asset ids of the assets we want to save
		*/
		saveAssets( assetIds : Array<string> )
		{
			if ( assetIds.length == 0 )
				return;

			var pm: PluginManager = PluginManager.getSingleton();
			var ev: AssetEvent = new AssetEvent( EditorEvents.ASSET_SAVING, null );
			var asset: Asset = null;
			var ids: Array<string> = [];
			var shallowIds: Array<number> = [];
			var jsons: Array<string> = [];
			for ( var i = 0, l = assetIds.length; i < l; i++ )
			{
				asset = this.getAssetByID( assetIds[i] );

				// Tell plugins about asset saving
				ev.asset = asset;
				pm.dispatchEvent( ev );

				jsons.push( JSON.stringify( asset.properties.tokenize() ) );
				ids.push( asset.id );
				shallowIds.push( asset.shallowId );
			}

			var loader = new AnimateLoader();
			loader.addEventListener( LoaderEvents.COMPLETE, this.onServer, this );
			loader.addEventListener( LoaderEvents.FAILED, this.onServer, this );
			loader.load( "/project/save-assets", { projectId: this._id, ids: ids, data: jsons } );
		}

		/**
		* This will download an asset's variables from the server.
		* @param {Array<string>} assetIds An array of assets we are updating
		*/
		updateAssets( assetIds : Array<string> )
		{
			var loader = new AnimateLoader();
			loader.addEventListener( LoaderEvents.COMPLETE, this.onServer, this );
			loader.addEventListener( LoaderEvents.FAILED, this.onServer, this );
			loader.load( "/project/update-assets", { projectId: this._id, ids: assetIds } );
		}

		/**
		* This will download all asset variables from the server.
		* @param {Array<string>} behaviourIDs An array of behaviour ID's that need to be updated
		*/
		updateBehaviours( behaviourIDs: Array<string> )
		{
			var loader = new AnimateLoader();
			loader.addEventListener( LoaderEvents.COMPLETE, this.onServer, this );
			loader.addEventListener( LoaderEvents.FAILED, this.onServer, this );
			loader.load( "/project/update-behaviours", { projectId: this._id, ids: behaviourIDs } );
		}

		/**
		* This function is used to copy an asset.
		* @param {string} assetId The asset object we are trying to copy
		*/
		copyAsset( assetId : string )
		{
			var loader = new AnimateLoader();
			loader.addEventListener( LoaderEvents.COMPLETE, this.onServer, this );
			loader.addEventListener( LoaderEvents.FAILED, this.onServer, this );
			loader.load( "/project/copy-asset", { projectId: this._id, assetId: assetId, shallowId: Asset.getNewLocalId() } );
		}

		/**
		* This function is used to delete assets.
		* @param {Array<string>} assetIDs The asset objects we are trying to delete
		*/
		deleteAssets( assetIDs: Array<string> )
		{
			var loader = new AnimateLoader();
			loader.addEventListener( LoaderEvents.COMPLETE, this.onServer, this );
			loader.addEventListener( LoaderEvents.FAILED, this.onServer, this );
			loader.load( "/project/delete-assets", { projectId: this._id, ids: assetIDs } );
		}

		/**
		* This function is used to fetch the _assets of a project. 
		*/
		loadAssets()
		{
			var loader = new AnimateLoader();
			loader.addEventListener( LoaderEvents.COMPLETE, this.onServer, this );
			loader.addEventListener( LoaderEvents.FAILED, this.onServer, this );
			loader.load( "/project/get-assets", { projectId: this._id } );
		}


		/**
		* Loads the project from data sent from the server
		* @param {any} data The data sent from the server
		*/
		loadFromData( data : any )
		{
			this.mSaved = true;
			this.buildId = data.project.buildId;
			this.created = data.project.createdOn;
			this.lastModified = data.project.lastModified;

			this.mName = data.project.name;
			this.mRating = data.project.rating;
			this.mCategory = data.project.category;
			this.mSubCategory = data.project.sub_category;
			this.mImgPath = data.project.image;
			this.mVisibility = data.project.visibility;
			
			var pluginIds = data.project.plugins;

			if ( !pluginIds )
				this._plugins = [];
			else
			{
				this._plugins = [];
				var i = __plugins.length;
				while ( i-- )
				{
					var ii: number = pluginIds.length;
					while ( ii-- )
						if ( pluginIds[ii] == __plugins[i]._id )
						{
							this._plugins.push( __plugins[i] );
							break;
						}
				}
			}

			this.mCurBuild = data.build;
			this.mDescription = data.project.description;
			this.mTags = data.project.tags;
		}


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
						this.mCurBuild = data.build;
						this.dispatchEvent( new ProjectEvent( ProjectEvents.BUILD_SELECTED, data.message, LoaderEvents.fromString( data.return_type ),  this.mCurBuild ) );
					}
					//Updates the current build
					else if ( loader.url == "/project/save-build" )
					{
						//this.mCurBuild = data.build;
						this.dispatchEvent( new ProjectEvent( ProjectEvents.BUILD_SAVED, "Build saved", LoaderEvents.fromString( data.return_type ), this.mCurBuild ) );
					}
					//Delete a new Behaviour
					else if ( loader.url == "/project/delete-behaviours" )
					{
						//Update behaviours ids which we fetched from the DB.
						for ( var i = 0, l = data.length; i < l; i++ )
						{
							var len = this._behaviours.length;
							for ( var ii = 0; ii < len; ii++ )
								if ( this._behaviours[ii].id == data[i] )
								{
									var behaviour : BehaviourContainer = this._behaviours[ii];
									behaviour.dispose();									
									this._behaviours.splice( ii, 1 );
									this.dispatchEvent( new ProjectEvent( ProjectEvents.BEHAVIOUR_DELETING, "Deleting Behaviour", LoaderEvents.COMPLETE, behaviour ) );
									break;
								}
						}							
					}
					//Create a new Behaviour
					else if ( loader.url == "/project/create-behaviour" )
					{
						var behaviour: BehaviourContainer = new BehaviourContainer( data.name, data.id, data.shallowId );
						this._behaviours.push( behaviour );

						//Create the GUI elements
						var node: TreeNodeBehaviour = TreeViewScene.getSingleton().addContainer( behaviour );
						node.save( false );
						var tabPair = CanvasTab.getSingleton().addSpecialTab(behaviour.name, CanvasTabType.CANVAS, behaviour );
						jQuery( ".text", tabPair.tabSelector.element ).text( node.element.text() );
						tabPair.name = node.element.text();

						this.dispatchEvent( new ProjectEvent( ProjectEvents.BEHAVIOUR_CREATED, "Behaviour created", LoaderEvents.COMPLETE, behaviour ) );
					}
					else if ( loader.url == "/project/get-behaviours" )
					{
						//Cleanup behaviourssaveAll
						for ( var i = 0; i < this._behaviours.length; i++ )
							this._behaviours[i].dispose();

						this._behaviours.splice( 0, this._behaviours.length );

						//Create new behaviours which we fetched from the DB.
						for ( var i = 0, l = data.length; i < l; i++ )
						{
							var dbEntry = data[i];
							var b: BehaviourContainer = new BehaviourContainer( dbEntry["name"], dbEntry["_id"], dbEntry["shallowId"] );
							b.json = CanvasToken.fromDatabase( dbEntry["json"], dbEntry["_id"]  );
							b.setProperties( dbEntry.json.properties );
							this._behaviours.push( b );

							//Create the GUI elements
							TreeViewScene.getSingleton().addContainer( b );

							//Update the GUI elements
							TreeViewScene.getSingleton().updateBehaviour( b );
							this.dispatchEvent(new ProjectEvent(ProjectEvents.BEHAVIOUR_UPDATED, "Behaviour updated", LoaderEvents.COMPLETE, b ) );
						}
						this.dispatchEvent(new ProjectEvent(ProjectEvents.BEHAVIOURS_LOADED, "Behaviours loaded", LoaderEvents.COMPLETE, null ) );
					}
					else if ( loader.url == "/project/save-behaviours" )
					{
						for ( var i = 0; i < this._behaviours.length; i++ )
							for ( ii = 0, l = data.length; ii < l; ii++ )
								if ( this._behaviours[i].id == data[ii] )
								{
									// Make sure the JSON is updated in the behaviour
									var canvas: Canvas = CanvasTab.getSingleton().getTabCanvas( data[ii] );
									if ( canvas )
										this._behaviours[i].json = canvas.buildDataObject();

									this.dispatchEvent( new ProjectEvent( ProjectEvents.BEHAVIOUR_SAVED, "Behaviour saved", LoaderEvents.COMPLETE, this._behaviours[i] ) );
									break;
								}

						this.dispatchEvent(new ProjectEvent(ProjectEvents.BEHAVIOURS_SAVED, "Behaviours saved", LoaderEvents.COMPLETE, null ) );
					}
					else if ( loader.url == "/project/save-html" )
					{
						this.dispatchEvent( new ProjectEvent( ProjectEvents.HTML_SAVED, "HTML saved", LoaderEvents.fromString( data.return_type ), this.mCurBuild ) );
						if ( HTMLTab.singleton )
							HTMLTab.singleton.save();
					}
					else if ( loader.url == "/project/save-css" )
					{
						this.dispatchEvent( new ProjectEvent( ProjectEvents.CSS_SAVED, "CSS saved", LoaderEvents.fromString( data.return_type ), this.mCurBuild ) );
						if ( CSSTab.singleton )
							CSSTab.singleton.save();
					}
					//Delete an asset
					else if ( loader.url == "/project/delete-assets" )
					{
						dispatchEvent = new AssetEvent( EditorEvents.ASSET_DESTROYED, null );
						var ev = new AssetEvent( ProjectEvents.ASSET_DELETING, null );

						for ( var i = 0, l = data.length; i < l; i++ )
						{
							var len = this._assets.length;
							for ( var ii = 0; ii < len; ii++ )
								if ( this._assets[ii].id == data[i] )
								{
									ev.asset = this._assets[ii];
									this.dispatchEvent( ev );

									//Notify the destruction of an asset
									( <AssetEvent>dispatchEvent).asset = this._assets[ii];
									pManager.dispatchEvent( dispatchEvent );

									this._assets[ii].dispose();
									this._assets.splice( ii, 1 );
									break;
								}
						}							
					}
					//Creates each of the _files and notify they were loaded.
					else if ( loader.url == "/project/get-files" )
					{
						var i = this._files.length;
						while ( i-- )
							this._files[i].dispose();

						this._files.splice( 0, this._files.length );

						//Create each of the files
						for ( var i = 0, l = data.length; i < l; i++ )
						{
							var dbEntry = data[i];
							var file = new File( dbEntry["name"], dbEntry["url"], dbEntry["tags"], dbEntry["_id"], dbEntry["createdOn"], dbEntry["lastModified"], dbEntry["size"], dbEntry["favourite"], dbEntry["previewUrl"], dbEntry["global"] );

							this._files.push( file );
							this.dispatchEvent(new ProjectEvent(ProjectEvents.FILE_CREATED, "File created", LoaderEvents.COMPLETE, file ) );
						}
						this.dispatchEvent(new ProjectEvent(ProjectEvents.FILES_CREATED, "Files created", LoaderEvents.COMPLETE, this ) );
						this.dispatchEvent(new ProjectEvent(ProjectEvents.FILES_LOADED, "Files loaded", LoaderEvents.COMPLETE, this ) );
					}
					//Create the file and notifies it was loaded.
					else if ( loader.url == "/project/import-files" )
					{
						//Create new _assets which we fetched from the DB.
						this.dispatchEvent( new ProjectEvent( ProjectEvents.FILE_CREATED, event.message, LoaderEvents.COMPLETE, file ) );
						this.dispatchEvent( new ProjectEvent(ProjectEvents.FILE_IMPORTED, event.message, LoaderEvents.COMPLETE, file ) );
					}
					//Delets a file
					else if ( loader.url == "/project/delete-files" )
					{
						for ( var ii = 0, l = data.length; ii < l; ii++ )
							for ( var i = 0, len = this._files.length; i < len; i++ )
								if ( this._files[i].id == data[ii] )
								{
									this._files[i].dispose();
									this.dispatchEvent(new ProjectEvent(ProjectEvents.FILE_DELETED, "File deleted", LoaderEvents.COMPLETE, this._files[i] ) );
									this._files.splice( i, 1 );
									break;
								}

						this.dispatchEvent(new ProjectEvent(ProjectEvents.FILES_DELETED, "Files deleted", LoaderEvents.COMPLETE, data ) );
					}
					// Creates an empty file on the server
					else if ( loader.url == "/file/create-empty-file" )
					{
						var file = new File( data["name"], data["url"], [], data["_id"], data["createdOn"], data["lastModified"], 0, false, data["previewUrl"], false );
						this.dispatchEvent( new ProjectEvent( ProjectEvents.FILE_CREATED, "File created", LoaderEvents.COMPLETE, file ) );
					}
					// Fills a file with data
					else if ( loader.url == "/file/fill-file" )
					{
						for ( var i = 0, len = this._files.length; i < len; i++ )
							if ( this._files[i].id == data.id )
								{
									this.dispatchEvent( new ProjectEvent( ProjectEvents.FILE_UPDATED, "File updated", LoaderEvents.COMPLETE, this._files[i] ) );
									return;
								}
					}
					// Saves the details of an uploaded file
					else if ( loader.url == "/project/save-file" )
					{
						for ( var i = 0, len = this._files.length; i < len; i++ )
							if ( this._files[i].id == data._id )
							{
								this._files[i].name = data.name;
								this._files[i].tags = data.tags;
								this._files[i].lastModified = data.lastModified;
								this._files[i].favourite = data.favourite;
								this._files[i].global = data.global;

								if ( loader.url == "/project/save-file" )
									this.dispatchEvent(new ProjectEvent(ProjectEvents.FILE_UPDATED, "File updated", LoaderEvents.COMPLETE,  this._files[i] ) );
								else
									this.dispatchEvent(new ProjectEvent(ProjectEvents.FILE_IMAGE_UPDATED, "File image updated", LoaderEvents.COMPLETE, this._files[i] ) );

								return;
							}
					}

					//Create a new group
					else if ( loader.url == "/project/create-group" )
						this.dispatchEvent( new ProjectEvent( ProjectEvents.GROUP_CREATED, "Group created", LoaderEvents.COMPLETE, { id: data._id, name: data.name, json: data.json } ) );
					//Creates each of the groups and notify they were loaded.
					else if ( loader.url == "/project/get-groups" )
					{
						//Create new _assets which we fetched from the DB.
						for ( var i = 0, l = data.length; i < l; i++ )
						{
							var dbEntry = data[i];
							this.dispatchEvent(new ProjectEvent(ProjectEvents.GROUP_CREATED, "Group created", LoaderEvents.COMPLETE, { id: dbEntry["_id"], name: dbEntry["name"], json: dbEntry["json"] } ));
						}
						this.dispatchEvent(new ProjectEvent(ProjectEvents.GROUPS_LOADED, "Groups loaded", LoaderEvents.COMPLETE, this ) );
					}
					//Delete a new group
					else if ( loader.url == "/project/delete-groups" )
					{
						for ( var i = 0, l = data.length; i < l; i++ )
						{
							var grpID = data[i];
							this.dispatchEvent( new ProjectEvent( ProjectEvents.GROUP_DELETING, "Group deleting", LoaderEvents.COMPLETE, grpID ) );
						}
					}
					//Update / download group details
					else if ( loader.url == "/project/update-groups" )
					{
						//Update _assets which we fetched from the DB.
						for ( var i = 0, l = data.length; i < l; i++ )
						{
							var grp = data[i];
							this.dispatchEvent( new ProjectEvent( ProjectEvents.GROUP_UPDATED, "Group updated", LoaderEvents.COMPLETE, grp ) );
						}

						this.dispatchEvent( new ProjectEvent( ProjectEvents.GROUPS_UPDATED, "Groups updated", null ) );
					}
					//Entered if we have saved some groups
					else if ( loader.url == "/project/save-groups" )
					{
						for ( var i = 0, l = data.length; i < l; i++ )
							this.dispatchEvent(new ProjectEvent(ProjectEvents.GROUP_SAVED, "Group saved", LoaderEvents.COMPLETE, data[i] ) );

						this.dispatchEvent(new ProjectEvent(ProjectEvents.GROUPS_SAVED, "Groups saved", LoaderEvents.COMPLETE, null ) );
					}
					//Create a new Behaviour
					else if ( loader.url == "/project/create-asset" || loader.url == "/project/copy-asset" )
					{
						var asset = new Asset( data.name, data.className, data.json, data._id, data.shallowId );
						this._assets.push( asset );

						//Create the GUI elements
						TreeViewScene.getSingleton().addAssetInstance( asset, false );

						//Notify the creation of an asset
						pManager.assetCreated( asset.name, asset );

						//Now that the asset is loaded we notify the plugins of each of its variables incase they need to initialize / set something.						
						var eSet: EditableSet = asset.properties;
						var variables: Array<PropertyGridVariable> = eSet.variables;
						for ( var ii: number = 0, len = variables.length; ii < len; ii++ )
							pManager.assetEdited( asset, variables[ii].name, variables[ii].value, variables[ii].value, variables[ii].type );

						//pManager.assetLoaded( asset );
						pManager.dispatchEvent( new AssetEvent( EditorEvents.ASSET_LOADED, asset ) );

						this.dispatchEvent(new ProjectEvent(ProjectEvents.ASSET_CREATED, "Asset created", LoaderEvents.COMPLETE, asset ) );
					}
					//Save the asset
					else if ( loader.url == "/project/save-assets" )
					{
						for ( var ii = 0; ii < data.length; ii++ )
							for ( var i = 0; i < this._assets.length; i++ )							
								if ( this._assets[i].id == data[ii] )
									this.dispatchEvent( new AssetEvent( ProjectEvents.ASSET_SAVED, this._assets[i] ) );

						this.dispatchEvent(new ProjectEvent(ProjectEvents.ASSET_SAVED, "Asset saved", LoaderEvents.COMPLETE, null  ));
					}
					//Update / download asset details
					else if ( loader.url == "/project/update-assets" )
					{
						for ( var ii = 0; ii < data.length; ii++ )
							for ( var i = 0; i < this._assets.length; i++ )
								if ( this._assets[i].id == data[ii]._id )
								{
									this._assets[i].update( data[ii].name, data[ii].className, data[ii].json );
									this.dispatchEvent( new AssetEvent(ProjectEvents.ASSET_UPDATED, this._assets[i] )) ;
								}

						this.dispatchEvent(new ProjectEvent(ProjectEvents.ASSET_SAVED, "Asset saved", LoaderEvents.COMPLETE, null ));
					}
					//Update / download behaviour details
					else if ( loader.url == "/project/update-behaviours" )
					{
						//Update behaviours which we fetched from the DB.
						for ( var ii = 0, l = data.length; ii < l; ii++ )
						{
							for ( var i = 0, len = this._behaviours.length; i < len; i++ )
								if ( this._behaviours[i].id == data[ii]._id )
								{
									this._behaviours[i].update( data[ii].name, CanvasToken.fromDatabase( data[ii].json, data[ii]._id ) );
									
									//Update the GUI elements
									TreeViewScene.getSingleton().updateBehaviour( this._behaviours[i] );
									this.dispatchEvent(new ProjectEvent(ProjectEvents.BEHAVIOUR_UPDATED, "Behaviour updated", LoaderEvents.COMPLETE, this._behaviours[i] ) );
									break;
								}
						}

						this.dispatchEvent(new ProjectEvent(ProjectEvents.BEHAVIOURS_UPDATED, "Behaviours updated", LoaderEvents.COMPLETE, null ) );
					}
					else if ( loader.url == "/project/get-assets" )
					{
						//Cleanup _assets
						for ( var i = 0; i < this._assets.length; i++ )
							this._assets[i].dispose();

						this._assets.splice( 0, this._assets.length );

						//Create new _assets which we fetched from the DB.
						for ( var i = 0, l = data.length; i < l; i++ )
						{
							var dbEntry = data[i];
							var asset = new Asset( dbEntry["name"], dbEntry["className"], dbEntry["json"], dbEntry["_id"], dbEntry["shallowId"] );
						
							//Create the GUI elements
							if ( TreeViewScene.getSingleton().addAssetInstance( asset ) )
								this._assets.push( asset );
							else
								asset.dispose();
						}

						//Notify the creation of an asset
						var len = this._assets.length;
						for ( var i = 0; i < len; i++ )
							pManager.assetCreated( this._assets[i].name, this._assets[i] );

						//Now that the asset is loaded we notify the plugins of each of its variables incase they need to initialize / set something.
						for ( var i = 0; i < len; i++ )
						{
							var eSet: EditableSet = this._assets[i].properties;
							var variables: Array<PropertyGridVariable> = eSet.variables;
							for ( var ii: number = 0, len2 = variables.length; ii < len2; ii++ )
								pManager.assetEdited( this._assets[i], variables[ii].name, variables[ii].value, variables[ii].value, variables[ii].type );
						}

						var eventCreated: AssetEvent = new AssetEvent( EditorEvents.ASSET_CREATED, null );
						for ( var i = 0; i < len; i++ )
						{
							//pManager.assetLoaded( this._assets[i] );
							eventCreated.asset = this._assets[i];
							pManager.dispatchEvent( eventCreated );
						}

						this.dispatchEvent(new ProjectEvent(ProjectEvents.ASSETS_LOADED, "Assets loaded", LoaderEvents.COMPLETE, this ) );
					}
					//Handle renaming
					else if ( loader.url == "/project/rename-object" )
					{
						var obj = null;
						var dataType: ProjectAssetTypes = ProjectAssetTypes.fromString( data.type );
						if ( dataType.toString() == ProjectAssetTypes.BEHAVIOUR.toString() )
						{
							var len = this._behaviours.length;
							for ( var i = 0; i < len; i++ )
								if ( data.id == this._behaviours[i].id )
								{
									obj = this._behaviours[i];
									break;
								}
						}
						//We need to do it like this because there is also a ParameterType.ASSET
						else if ( dataType.toString() == ProjectAssetTypes.ASSET.toString() )
						{
							var len = this._assets.length;
							for ( var i = 0; i < len; i++ )
								if ( data.id == this._assets[i].id )
								{
									obj = this._assets[i];
									break;
								}
						}
						else
							obj = TreeViewScene.getSingleton().getGroupByID( data.id )

						//Send event
						this.dispatchEvent(new ProjectEvent(ProjectEvents.OBJECT_RENAMED, "Object Renamed", LoaderEvents.COMPLETE, { object: obj, type: data.type, name: data.name, id: data.id }));
					}
				}
				else
				{
					MessageBox.show(event.message, Array<string>("Ok"), null, null );
					this.dispatchEvent( new ProjectEvent( ProjectEvents.FAILED, event.message, data ) );
				}
			}
			else
				this.dispatchEvent(new ProjectEvent(ProjectEvents.FAILED, "Could not connec to the server.", LoaderEvents.FAILED, null ));
        }

        get behaviours(): Array<BehaviourContainer> { return this._behaviours; }
        get files(): Array<File> { return this._files; }
        get assets(): Array<Asset> { return this._assets; }
        
		/**
		* This will cleanup the project and remove all data associated with it.
		*/
		dispose()
		{
			var pManager: PluginManager = PluginManager.getSingleton();
			var event: Event;

			//Cleanup behaviours
			var i = this._behaviours.length;
			while ( i-- )
			{
				this.dispatchEvent(new ProjectEvent(ProjectEvents.BEHAVIOUR_DELETING, "Behaviour deleting", LoaderEvents.COMPLETE, this._behaviours[i])  );
				this._behaviours[i].dispose();
			}

			i = this._assets.length;
			event = new AssetEvent( EditorEvents.ASSET_DESTROYED, null );
			while ( i-- )
			{
				( <AssetEvent>event).asset = this._assets[i];
				//Notify the destruction of an asset
				pManager.dispatchEvent( event );			
				this._assets[i].dispose();
			}

			i = this._files.length;
			while ( i-- )
				this._files[i].dispose();

			this._plugins = null;
			this.created = null;
			this.lastModified = null;
			this._id = null;
			this.mSaved = null;
			this.mName = null;
			this.mDescription = null;
			this._behaviours = null;
			this._assets = null;
			this.buildId = null;
			this._files = null;

			//Call super
			super.dispose();
		}

		get plugins(): Array<IPluginDefinition> { return this._plugins; }
	}
}