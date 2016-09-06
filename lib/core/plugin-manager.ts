module Animate {
	/**
	* The plugin manager is used to load and manage external Animate plugins.
	*/
	export class PluginManager extends EventDispatcher {
		private static _singleton: PluginManager;

		private _plugins: Array<Animate.IPlugin>;
		private _loadedPlugins: Array<IPlugin>;
		private _behaviourTemplates: Array<BehaviourDefinition>;
		private _assetTemplates: Array<AssetTemplate>;
		private _converters: Array<TypeConverter>;
		//private _dataTypes: Array<string>;
        private _previewVisualizers: Array<IPreviewFactory>;

		constructor() {
			// Call super-class constructor
			super();

			if ( PluginManager._singleton != null )
				throw new Error( "PluginManager is singleton, you must call the getSingleton() property to get its instance. " );

			// Set this singleton
			PluginManager._singleton = this;

			this._plugins = new Array<IPlugin>();
			this._behaviourTemplates = new Array<BehaviourDefinition>();
			this._assetTemplates = new Array<AssetTemplate>();
			this._converters = new Array<TypeConverter>();
            //this._dataTypes = new Array<string>("asset", "number", "group", "file", "string", "object", "bool", "int", "color", "enum");

			// Create some standard templates
			this._behaviourTemplates.push( new BehaviourDefinition( "Asset",
                [
                    new PortalTemplate(new PropAsset("Asset In", null), 'parameter'),
                    new PortalTemplate(new PropAsset("Asset Out", null), 'product' )
                ], null, false, false, false, false));

            this._behaviourTemplates.push(new BehaviourDefinition("Script",
                [
                    new PortalTemplate(new PropBool("Execute", false), 'input'),
                    new PortalTemplate(new PropBool("Exit", false), 'output')
                ], null, true, true, true, true));

			this._behaviourTemplates.push(new BehaviourDefinition("Portal", [], null, false, false, false, false));
            this._behaviourTemplates.push(new BehaviourDefinition("Instance", [], null, true, true, true, true));
			this._loadedPlugins = [];
			// TODO: This must be refactored from updates to TSX
			// ==================================================
			// BehaviourPicker.getSingleton().list.addItem( "Asset" );
            // BehaviourPicker.getSingleton().list.addItem("Script");
			// ==================================================
            this._previewVisualizers = [new ImageVisualizer()];
        }

        //onResourceCreated(type: string, event: ProjectEvent)
        //{
         //   var resource = event.resouce;
              //this.emit(new ResourceCreated(asset));
           // if (resource instanceof Asset)
           // {
                //Notify the creation of an asset
                //this.assetCreated(resource.entry.name, resource);

                //Now that the asset is loaded we notify the plugins of each of its variables incase they need to initialize / set something.
               // var eSet: EditableSet = resource.properties;
                //var variables: Array<Prop<any>> = eSet.variables;
                //for (var ii: number = 0, len = variables.length; ii < len; ii++)
                //    this.assetEdited(resource, variables[ii].name, variables[ii].value, variables[ii].value, variables[ii].type);
            //}
        //}

		///**
		//* Updates an assets value as well as any components displaying the asset.
		//* For example the property grid or scene view.
		//* @param {Asset} asset The asset we are editing
		//* @param {string} propName The name of the asset's property
		//* @param {any} propValue The new value
		//* @param {boolean} notifyEditor If true, the manager will send out a notify event of the new value
		//*/
		//updateAssetValue( asset: Asset, propName: string, propValue : any, notifyEditor: boolean = false )
		//{
		//	var pGrid: PropertyGrid = Animate.PropertyGrid.getSingleton();
		//	var pVar : Prop = asset.properties.getVar( propName );
		//	var oldVal = pVar.value;

		//	asset.properties.updateValue( propName, propValue );

  //          if (pGrid.idObject == asset || (pGrid.idObject && (<TreeNodeAssetInstance>pGrid.idObject).resource == asset ) )
		//		pGrid.updateProperty( propName, propValue );

		//	//var node: TreeNodeAssetInstance = <TreeNodeAssetInstance>TreeViewScene.getSingleton().findNode( "asset", asset );
		//	//node.save( false );

		//	if (notifyEditor)
		//		this.assetEdited( asset, propName, propValue, oldVal, pVar.type )
		//}

        /**
		* Attempts to download a plugin by its URL and insert it onto the page.
        * Each plugin should then register itself with the plugin manager by setting the __newPlugin variable. This variable is set in the plugin that's downloaded.
        * Once downloaded - the __newPlugin will be set as the plugin and is assigned to the plugin definition.
		* @param {IPlugin} pluginDefinition The plugin to load
        * @returns {Promise<Engine.IPlugin>}
		*/
        loadPlugin(pluginDefinition: Engine.IPlugin): Promise<Engine.IPlugin> {
            if (pluginDefinition.$loaded)
                return Promise.resolve(null);

            return new Promise<Engine.IPlugin>(function (resolve, reject) {
                var script = document.createElement('script');
                script.onerror = function (ev) {
                    pluginDefinition.$loaded = false;
                    return reject(new Error(`'${pluginDefinition.name}' could not be downloaded`));
                }
                script.onload = function (ev) {
					if (!__newPlugin)
						return reject(new Error(`'${pluginDefinition.name}' could not be downloaded or __newPlugin not set`));

                    pluginDefinition.$loaded = true;
                    pluginDefinition.$instance = __newPlugin;
					__newPlugin = null;
                    return resolve(pluginDefinition);
                }

                script.async = true;
                script.src = pluginDefinition.url;
                document.head.appendChild(script);
            });
        }

		/**
		* This funtcion is used to load a plugin.
		* @param {IPlugin} pluginDefinition The IPlugin constructor that is to be created
		* @param {boolean} createPluginReference Should we keep this constructor in memory? The default is true
		*/
		preparePlugin( pluginDefinition : Engine.IPlugin, createPluginReference : boolean = true ) {
            var plugin: Animate.IPlugin = pluginDefinition.$instance;
			this._plugins.push( plugin );

			// Get behaviour definitions
			var btemplates: Array<BehaviourDefinition> = plugin.getBehaviourDefinitions();
			if ( btemplates ) {

				// TODO: This must be refactored from updates to TSX
				// ==================================================
				for ( let template of btemplates ) {
				 	this._behaviourTemplates.push( template );
				// 	BehaviourPicker.getSingleton().list.addItem( btemplates[i].behaviourName );
				// 	TreeViewScene.getSingleton().addPluginBehaviour( btemplates[i] );
					this.emit( new Event("template-created", template ));
				}
				// ===================================================
			}

			// Get converters
			let converters: Array<TypeConverter> = plugin.getTypeConverters();
			if ( converters ) {
				let i = converters.length;
				while ( i-- )
					this._converters.push( converters[i] );
			}

			// Get asset templates
			let atemplates :Array<AssetTemplate> = plugin.getAssetsTemplate();
			if ( atemplates ) {
				let i = atemplates.length;
				while ( i-- )
					this._assetTemplates.push( atemplates[i] );
			}

			return;
		}

		/**
		* Call this function to unload a plugin
		* @param {IPlugin} plugin The IPlugin object that is to be loaded
		*/
		unloadPlugin( plugin: IPlugin ) {
			// Get converters
			var toRemove : Array<BehaviourDefinition> = new Array();
			var i = this._behaviourTemplates.length;
			while ( i-- )
				if ( this._behaviourTemplates[i].plugin == plugin )
					toRemove.push( this._behaviourTemplates[i] );

			// Get behaviour definitions
			var i = toRemove.length;
			// TODO: This must be refactored from updates to TSX
			// ==================================================
			 while ( i-- ) {
			// 	BehaviourPicker.getSingleton().list.removeItem( toRemove[i].behaviourName );
			// 	TreeViewScene.getSingleton().removePluginBehaviour( toRemove[i].behaviourName );

			 	this._behaviourTemplates.splice( this._behaviourTemplates.indexOf( toRemove[i] ), 1 );
				this.emit( new Event("template-removed", toRemove[i]) );
			 }
			// ==================================================

			// Get converters
			var toRemove2 : Array<TypeConverter> = [];
			var i = this._converters.length;
			while ( i-- )
				if ( this._converters[i].plugin == plugin )
					toRemove2.push( this._converters[i] );

			var i = toRemove2.length;
			while ( i-- )
				this._converters.splice( jQuery.inArray( toRemove2[i], this._converters ), 1 );

			this._assetTemplates.splice( 0, this._assetTemplates.length );

			plugin.unload();
		}

		/**
		* Loops through each of the converters to see if a conversion is possible. If it is
		* it will return an array of conversion options, if not it returns false.
		* @param {any} typeA The first type to check
		* @param {any} typeB The second type to check
		*/
		getConverters( typeA: any, typeB: any) {
			var toRet = null;

			var i = this._converters.length;
			while ( i-- ) {
				if ( this._converters[i].canConvert( typeA, typeB ) ) {
					if ( toRet == null )
						toRet = [];

					var ii = this._converters[i].conversionOptions.length;
					while ( ii-- )
						toRet.push( this._converters[i].conversionOptions[ii] );
				}
			}

			return toRet;
		}

		/**
		* Gets a behaviour template by its name.
		* @param {string} behaviorName The name of the behaviour template
		*/
		getTemplate( behaviorName : string )
		{
			var len = this._behaviourTemplates.length;
			while ( len-- )
				if ( this._behaviourTemplates[len].behaviourName == behaviorName )
					return this._behaviourTemplates[len];

			return null;
		}

		/**
		* Use this function to select an asset in the tree view and property grid
		* @param {Resources.Asset} asset The Asset object we need to select
		* @param {boolean} panToNode When set to true, the treeview will bring the node into view
		* @param {boolean} multiSelect When set to true, the treeview not clear any previous selections
		*/
		selectAsset( asset: Resources.Asset, panToNode : boolean = true, multiSelect : boolean = false ) {
			Animate.TreeViewScene.getSingleton().selectNode(
                Animate.TreeViewScene.getSingleton().findNode( "resource", asset ) );
		}

		///**
		//* Gets the currently selected asset from the PropertyGrid
		//* @returns {Asset} asset The Asset object we need to select
		//*/
		//getSelectedAsset() : Asset
		//{
		//	var pgrid: PropertyGrid = PropertyGrid.getSingleton();
		//	if ( pgrid.idObject && pgrid.idObject instanceof TreeNodeAssetInstance )
  //              return (<TreeNodeAssetInstance>pgrid.idObject).resource;

		//	return null
		//}

		///**
		//* This is called when the scene is built. The object passed to this function represents
		//* the scene as an object.
		//* @param {Asset} asset The asset that was edited
		//* @param {string} propertyNam The name of the property that was edited
		//* @param {any} newValue The new value of the property
		//* @param {any} oldValue The old value of the property
		//* @param {ParameterType} propertyType The type of property
		//*/
		//assetEdited( asset: Asset, propertyNam: string, newValue: any, oldValue: any, propertyType: ParameterType )
		//{
		//	var project: Project = User.get.project;

		//	if ( propertyType == ParameterType.NUMBER )
		//		newValue = newValue.selected;
  //          else if (propertyType == ParameterType.ASSET)
  //              newValue = project.getResourceByShallowID<Asset>(ImportExport.getExportValue(ParameterType.ASSET, newValue), ResourceType.ASSET);
		//	else if ( propertyType == ParameterType.FILE )
		//		newValue = newValue.path || null;
		//	else if ( propertyType == ParameterType.ENUM )
		//		newValue = newValue.selected;
		//	else if ( propertyType == ParameterType.ASSET_LIST )
		//	{
		//		var assets: Array<Asset> = [];
		//		if ( newValue && newValue.selectedAssets )
		//			for ( var i = 0, l = newValue.selectedAssets.length; i < l; i++ )
  //                  {
  //                      var a: Asset = project.getResourceByShallowID<Asset>(newValue.selectedAssets[i], ResourceType.ASSET);
		//				if ( a )
		//					assets.push( a );
		//			}

		//		newValue = assets;
		//	}

		//	// Send event
		//	this.emit( new AssetEditedEvent( EditorEvents.ASSET_EDITED, asset, propertyNam, newValue, oldValue, propertyType ) );
		//}

		///**
		//* Gets an asset by its ID
		//* @param {string} id The id of the asset
		//* @returns {Asset}
		//*/
		//getAssetById( id: string ): Asset
		//{
		//	var toRet: Asset = null;
  //          toRet = User.get.project.getAssetByID( id );
		//	return toRet;
		//}

		///**
		//* Gets an asset by its local ID
		//* @param {string} id The local id of the asset
		//* @returns {Asset}
		//*/
		//getAssetByShallowId( id: number ): Asset
		//{
		//	var toRet: Asset = null;
		//	toRet = User.get.project.getAssetByShallowId( id );
		//	return toRet;
		//}

		/**
		* Gets an asset class by its name
		* @param {string} name The name of the asset class
		* @param {AssetClass}
		*/
		getAssetClass( name: string ) : AssetClass {
			// Assign any of the options / missing variables for classes that are updated in code but not in the DB
			var assetTemplates: Array<AssetTemplate> = this._assetTemplates;
			var classFound: boolean = false;
			for ( var i = 0, l = assetTemplates.length; i < l; i++ ) {
				var assetClass: AssetClass = assetTemplates[i].findClass( name );
				if ( assetClass )
					return assetClass;
			}

			return null;
		}

		/**
		* When an asset is created this function will notify all plugins of its existance
		* @param {string} name The name of the asset
		* @param {Asset} asset The asset itself
		*/
		//assetCreated( name : string, asset : Asset )
		//{
			//var template: AssetTemplate = null;

			//// Assign any of the options / missing variables for classes that are updated in code but not in the DB
   //         var aClass: AssetClass = this.getAssetClass(asset.entry.className);

			//// Get all the variables for this class
   //         var topClass = aClass;
   //         var variables: Array<Prop<any>> = [];
			//while ( topClass != null )
			//{
			//	//Add all the variables to the object we are returning
			//	for ( var i = 0; i < topClass.variables.length; i++ )
			//		variables.push( topClass.variables[i] );

			//	topClass = topClass.parentClass;
			//}

			//// Go through all the variables and make sure that the asset has the variable (They can get lost as new ones are added over time)
			//// Also re-assign the options as they

			//for ( var vi = 0, vl = variables.length; vi < vl; vi++ )
			//{
			//	var variable: VariableTemplate = variables[vi];

			//	if ( !asset.properties.getVar( variable.name ) )
			//		asset.properties.addVar( variable.name, variable.value, ParameterType.fromString( variable.type.toString() ), variable.category, variable.options );
			//	else
			//		asset.properties.getVar( variable.name ).options = variable.options;
			//}

			//this.emit( new AssetCreatedEvent( asset, name ) );
		//}

        /**
		* Called when the project is reset by either creating a new one or opening an older one.
		*/
        projectReset(project: Project) {
            // Cleanup all the previous plugins
            for (var i = 0; i < this._plugins.length; i++)
                this.unloadPlugin(this._plugins[i]);

            this._plugins.splice(0, this._plugins.length);
            this._loadedPlugins.splice(0, this._loadedPlugins.length);
        }

		/**
		* This function is called by Animate when everything has been loaded and the user is able to begin their session.
		*/
        projectReady(project: Project) {
            this.emit(new Event(EditorEvents.EDITOR_READY, null));
		}

		 /**
         * Creates a thumbnail preview of the file
         * @param {Engine.IFile} file
         * @returns {Promise<HTMLCanvasElement>}
         */
        thumbnail(file: Engine.IFile): Promise<HTMLCanvasElement> {
			var toRet;
            var factories = this._previewVisualizers;
            for (var i = 0, l = factories.length; i < l; i++) {
                toRet = factories[i].thumbnail(file);
                if (toRet)
                    return toRet;
            }

            return null;
		}


		/**
        * This function generates a React Element that is used to preview a file
        * @param {Engine.IFile} file The file we are looking to preview
        * @returns {JSX.Element} If a React Element is returned is added in the File viewer preview
        */
        displayPreview(file: Engine.IFile): JSX.Element {
            var toRet;
            var factories = this._previewVisualizers;
            for (var i = 0, l = factories.length; i < l; i++) {
                toRet = factories[i].generate(file);
                if (toRet)
                    return toRet;
            }

            return null;

   //         var firstChild = previewComponent.element.children(":first");
   //         var firstComp = <Component>firstChild.data("component");

			//if ( firstComp )
			//	firstComp.dispose();

			//previewComponent.element.empty();
			//previewComponent.element.css( { "min-width": "" });
			//var w : number = previewComponent.element.width();

			//if ( file )
			//{
			//	var i = this._plugins.length;
			//	while ( i-- )
			//	{
			//		var handled = this._plugins[i].onDisplayPreview( file, previewComponent );
			//		if ( handled )
			//		{

			//			var childW : number = firstChild.outerWidth( true );

			//			previewComponent.element.css( { "min-width": ( childW > w ? childW.toString() : "" ) + "px" });
			//			break;
			//		}
			//	}
			//}
		}

		//get dataTypes(): Array<string> { return this._dataTypes; }
		get assetTemplates(): AssetTemplate[] { return this._assetTemplates; }
		get loadedPlugins(): IPlugin[] { return this._loadedPlugins; }
		get behaviourTemplates(): BehaviourDefinition[] { return this._behaviourTemplates; }

		/**
		* Gets the singleton instance.
		*/
		static getSingleton() {
			if ( !PluginManager._singleton )
				new PluginManager();

			return PluginManager._singleton;
		}
	}
}