module Animate
{	
	export class ImportExportEvents extends ENUM
	{
		constructor(v: string) { super(v); }
		static COMPLETE: ImportExportEvents = new ImportExportEvents("import_export_complete");		
	}

	export class ImportExportEvent extends Event
	{
		live_link: any;

		constructor(eventName: ImportExportEvents, live_link : any )
		{
			super(eventName, live_link);
			this.live_link = live_link;
		}
	}

	/**
	* A class to help with importing and exporting a project
	*/
	export class ImportExport extends EventDispatcher
	{
		private static _singleton: ImportExport;

		private runWhenDone: boolean;
		private mRequest: string;

		constructor()
		{
			// Call super-class constructor
			super();

			if ( ImportExport._singleton != null )
				throw new Error( "The ImportExport class is a singleton. You need to call the ImportExport.getSingleton() function." );

			ImportExport._singleton = this;

			this.mRequest = null;
			this.runWhenDone = false;
		}


		/**
		* @type public mfunc run
		* This function will first export the scene and then attempt to create a window that runs the application.
		* @extends <ImportExport>
		*/
		run()
		{
			this.exportScene();
			this.runWhenDone = true;
		}

		/**
		* @type public mfunc exportScene
		* This function is used to exort the Animae scene. This function creates an object which is exported as a string. Plugins
		* can hook into this process and change the output to suit the plugin needs. 
		* @extends <ImportExport>
		*/
		exportScene()
		{
			this.runWhenDone = false;
			var project = User.get.project;

			var data = {};
			data["category"] = "builds";
            data["command"] = "build";
            data["projectID"] = project.entry._id;

			var dataToken: ExportToken = <ExportToken>{};
			dataToken.assets = [];
			dataToken.groups = [];
			dataToken.containers = [];
			dataToken.converters = {};
			dataToken.data = {};

			var canvasToken: CanvasToken= null;

			//Get all the behaviours and build them into the export object
			var i = project.behaviours.length;
			while ( i-- )
			{
				var behaviour : BehaviourContainer = project.behaviours[i];
				if ( behaviour.json === null )
					continue;

				canvasToken = behaviour.json;

				//Check if we have valid json and items saved
				if ( canvasToken && canvasToken.items )
				{
					var containerToken: ContainerToken = <ContainerToken>{};
					dataToken.containers.push( containerToken );
					containerToken.name = behaviour.name;
					containerToken.id = behaviour.shallowId;
					containerToken.behaviours = [];
					containerToken.links = [];
					containerToken.assets = [];
					containerToken.groups = [];
					containerToken.properties = {};

					//Set each of the properties
					var props = behaviour.properties.tokenize();
					for ( var pi in props )
					{
						var propType: ParameterType = ParameterType.fromString( props[pi].type );
						var propVal = props[pi].value;
						containerToken.properties[props[pi].name] = ImportExport.getExportValue( propType, propVal );
					}

					//Let the plugins export their data
					containerToken.plugins = canvasToken.plugins;	

					PluginManager.getSingleton().dispatchEvent( new ContainerDataEvent( EditorEvents.CONTAINER_EXPORTING, behaviour, containerToken.plugins ) );

					//Create tokens and fill each with data. First create either a behaviour
					//or link objct
					for ( var cti = 0, ctl = canvasToken.items.length; cti < ctl; cti++ )
					{
						var canvasTokenItem: CanvasTokenItem = canvasToken.items[cti];
						if ( canvasTokenItem.type == "BehaviourAsset" ||
							canvasTokenItem.type == "BehaviourScript" ||
							canvasTokenItem.type == "BehaviourPortal" ||
							canvasTokenItem.type == "Behaviour" ||
							canvasTokenItem.type == "BehaviourInstance" )
						{
							var behaviourToken: BehaviourToken = <BehaviourToken>{};
							containerToken.behaviours.push( behaviourToken );
							
							behaviourToken.id = canvasTokenItem.id;
							behaviourToken.name = canvasTokenItem.name;
							behaviourToken.type = canvasTokenItem.type;

							//Check the type and fill in the sub properties
							if ( canvasTokenItem.type == "BehaviourPortal" )
							{
								behaviourToken.portalType = canvasTokenItem.portalType.toString();
								behaviourToken.dataType = canvasTokenItem.dataType.toString();
								behaviourToken.value = ImportExport.getExportValue( canvasTokenItem.dataType, canvasTokenItem.value );
							}
							else
							{
								if ( canvasTokenItem.type == "BehaviourInstance" )
									behaviourToken.originalContainerID = canvasTokenItem.containerId;

								if ( canvasTokenItem.type == "BehaviourScript" )
									behaviourToken.shallowId = canvasTokenItem.shallowId;

								// Create each of the portals 

								behaviourToken.portals = [];
								for ( var ci = 0, cl = canvasTokenItem.portals.length; ci < cl; ci++ )// objectToken.items[counter].portals[counterPortal] )
								{
									var portalToken: PortalToken = <PortalToken>{};
									behaviourToken.portals.push( portalToken );

									portalToken.name = canvasTokenItem.portals[ci].name;
									portalToken.type = canvasTokenItem.portals[ci].type.toString();
									portalToken.dataType = canvasTokenItem.portals[ci].dataType.toString();
									portalToken.value = ImportExport.getExportValue( canvasTokenItem.portals[ci].dataType, canvasTokenItem.portals[ci].value );

									//Check for assets, and if so, add the asset to the assets 
									if ( canvasTokenItem.portals[ci].dataType == ParameterType.ASSET )
									{
										if ( portalToken.value != null && portalToken.value != "" )
										{
											var assetID: number = portalToken.value;
											if ( !isNaN( assetID ) && assetID != 0 && containerToken.assets.indexOf( assetID ) == -1 )
											{
												containerToken.assets.push( assetID );

												//It can also the be case that assets reference other assets. In those
												//situations you will want the container to keep adding to all the assets
												this.referenceCheckAsset( project.getAssetByShallowId( assetID ), containerToken );
											}
										}
									}
									else if ( canvasTokenItem.portals[ci].dataType == ParameterType.ASSET_LIST )
									{
										if ( portalToken.value != null && portalToken.value.selectedAssets.length != 0 )
										{
											for ( var a = 0, al = portalToken.value.selectedAssets.length; a < al; a++ )
											{
												var assetID: number = portalToken.value.selectedAssets[a];
												if ( !isNaN( assetID ) && assetID != 0 && containerToken.assets.indexOf( assetID ) == -1 )
												{
													containerToken.assets.push( assetID );

													//It can also the be case that assets reference other assets. In those
													//situations you will want the container to keep adding to all the assets
													this.referenceCheckAsset( project.getAssetByShallowId( assetID ), containerToken );
												}
											}
										}
									}
									else if ( canvasTokenItem.portals[ci].dataType == ParameterType.GROUP )
									{
										if ( portalToken.value != null && portalToken.value != "" )
										{
											var groupID: string = ImportExport.getExportValue( ParameterType.GROUP, portalToken.value );
											if ( groupID != null && groupID != "" )
											{
												//It can also the be case that groups reference other groups. In those
												//situations you will want the container to keep adding to all the groups
												this.referenceCheckGroup( <TreeNodeGroup>TreeViewScene.getSingleton().findNode( "groupID", groupID ), containerToken );
											}
										}
									}
								}
							}
						}
						else if ( canvasTokenItem.type == "Link" )
						{
							var linkToken: LinkToken = <LinkToken>{};
							containerToken.links.push( linkToken );

							//fill in the sub properties
							linkToken.id = canvasTokenItem.id;
							linkToken.type = canvasTokenItem.type;
							linkToken.startPortal = canvasTokenItem.startPortal;
							linkToken.endPortal = canvasTokenItem.endPortal;
							linkToken.startBehaviour = canvasTokenItem.targetStartBehaviour;
							linkToken.endBehaviour = canvasTokenItem.targetEndBehaviour;
							linkToken.frameDelay = canvasTokenItem.frameDelay;
						}
					}
				}
			}

			//Get all the assets and build them into the export object			
			for ( var i = 0, l = project.assets.length; i < l; i++ )
			{
				var asset : Asset = project.assets[i];

				//Check if we have valid json and items saved
				if ( canvasToken )
				{
					var assetToken: AssetToken = <AssetToken>{};
					dataToken.assets.push( assetToken );
					assetToken.name = asset.name;
					assetToken.id = asset.shallowId;
					assetToken.properties = {};
					assetToken.className = asset.className;

					var aprops = asset.properties.tokenize();
					for ( var assetPropName in aprops )
					{
						var propType: ParameterType = ParameterType.fromString( aprops[assetPropName].type.toString() );
						var propVal: any = aprops[assetPropName].value;
						assetToken.properties[aprops[assetPropName].name] = ImportExport.getExportValue( propType, propVal );
					}
				}
			}

			//Get all the groups and build them into the export object
			var groups : Array<TreeNodeGroup> = TreeViewScene.getSingleton().getGroups();
			for ( var i = 0, l = groups.length; i < l; i++ )
			{
				var group: TreeNodeGroup = groups[i];

				//Check if we have valid json and items saved
				if ( group )
				{
					var groupToken: GroupToken = <GroupToken > {};
					dataToken.groups.push( groupToken );
					groupToken.name = group.text;
					groupToken.id = group.groupID;
					groupToken.items = [];

					for ( var ii = 0; ii < group.children.length; ii++ )
						groupToken.items.push( (<TreeNodeGroupInstance>group.children[ii]).instanceID );
				}
			}

			//Send the object to the plugins
			PluginManager.getSingleton().dispatchEvent( new EditorExportingEvent( dataToken ) );

			var sceneStr = JSON.stringify( dataToken );
			var loader = new AnimateLoader();
			loader.addEventListener( LoaderEvents.COMPLETE, this.onServer, this );
			loader.addEventListener( LoaderEvents.FAILED, this.onServer, this );
            loader.load("/export/compile", { projectId: project.entry._id, json: sceneStr });
		}

		/**
		* Adds asset references to a container token during the export.
		* @param {Asset} asset the asset object to check
		* @param {ContainerToken} container The container to add refernces on
		* @returns {any} 
		*/
		referenceCheckAsset( asset: Asset, container : ContainerToken )
		{
			if ( asset == null )
				return;

			var assetVars = asset.properties.variables;
            var project = User.get.project;

			//Check all the assets properties. If it contains another assest, then we need to make sure its added to the container
			for ( var i = 0, l = assetVars.length; i < l; i++ )
			{
				if ( assetVars[i].type == ParameterType.ASSET )
				{
					var assetID: number = ImportExport.getExportValue( assetVars[i].type, assetVars[i].value );
					if ( !isNaN( assetID ) && assetID != 0 && container.assets.indexOf( assetID ) == -1 )
					{
						container.assets.push( assetID );

						//It can also the be case that assets reference other assets. In those
						//situations you will want the container to keep adding to all the assets							
						this.referenceCheckAsset( project.getAssetByShallowId( assetID ), container );
					}
				}
				else if ( assetVars[i].type == ParameterType.ASSET_LIST )
				{
					if ( assetVars[i].value.selectedAssets )
					{
						for ( var a = 0, al = assetVars[i].value.selectedAssets.length; a < al; a++ )
						{
							var assetID: number = assetVars[i].value.selectedAssets[a];
							if ( !isNaN( assetID ) && assetID != 0 && container.assets.indexOf( assetID ) == -1 )
							{
								container.assets.push( assetID );

								//It can also the be case that assets reference other assets. In those
								//situations you will want the container to keep adding to all the assets							
								this.referenceCheckAsset( project.getAssetByShallowId( assetID ), container );
							}
						}
					}
				}
				else if ( assetVars[i].type == ParameterType.GROUP )
				{
					var groupID: string = ImportExport.getExportValue( assetVars[i].type, assetVars[i].value );

					if ( groupID != null && groupID != "" )
					{
						var groupNode: TreeNodeGroup = <TreeNodeGroup>TreeViewScene.getSingleton().findNode( "groupID", groupID );
						this.referenceCheckGroup( groupNode, container );
					}
				}
			}
		}


		/**
		* Adds group references to a container token during the export.
		* @param {TreeNodeGroup} group the group object to check
		* @param {ContainerToken} container The container to add refernces on
		* @returns {any} 
		*/
		referenceCheckGroup( group: TreeNodeGroup, container: ContainerToken )
		{
			if ( group == null )
				return;

			var project = User.get.project;

			// Add the group
			if ( container.groups.indexOf( group.groupID ) == -1 )
				container.groups.push( group.groupID );
			

			//Check all the group properties. If it contains another group, then we need to make sure its added to the container		
			for ( var ii = 0; ii < group.children.length; ii++ )
				if ( ( <TreeNodeGroupInstance>group.children[ii] ).instanceID )
				{
					var assetID: number = ( <TreeNodeGroupInstance>group.children[ii] ).instanceID;

					//Check if the asset was added to the container
					if ( container.assets.indexOf( assetID ) == -1 )
					{
						container.assets.push( assetID );

						//It can also the be case that assets reference other assets. In those
						//situations you will want the container to keep adding to all the assets
						this.referenceCheckAsset( project.getAssetByShallowId( assetID ), container );
					}
				}
		}


		/**
		* Gets the value of an object without any of the additional data associated with it.
		* @param {ParameterType} propType the object type
		* @param {any} value Its current value
		* @returns {any} 
		*/
		static getExportValue( propType : ParameterType, value : any ) : any
		{
			if ( propType == ParameterType.NUMBER )
				return value.selected || ( isNaN( parseFloat( value ) ) ? 0 : parseFloat( value ) );
			else if ( propType == ParameterType.STRING || propType == ParameterType.BOOL || propType == ParameterType.INT )
				return value;
			else if ( propType == ParameterType.ASSET )
			{
				var shallowId: number = 0;
				shallowId = parseInt( value.selected );
				if ( isNaN( shallowId ) )
					shallowId = 0;

				return shallowId;
			}
			else if ( propType == ParameterType.ASSET_LIST )
			{
				return value.selectedAssets || [];
			}
			else if ( propType == ParameterType.GROUP )
				return value;
			else if ( propType == ParameterType.FILE )
			{
				var path :string = value.path;
				var urlParts = path.split( "/" );
				return "{{url}}uploads/" + urlParts[urlParts.length -1];
			}
			else if ( propType == ParameterType.HIDDEN_FILE )
			{
                var file: File = Animate.User.get.project.getFile( value );
				if ( file )
				{
					var urlParts = file.path.split( "/" );
					return "{{url}}uploads/" + urlParts[urlParts.length - 1];
				}

				return "";
			}
			else if ( propType == ParameterType.ENUM )
				return value.selected;
			else if ( propType == ParameterType.COLOR )
				return value.color;
			else if ( propType == ParameterType.OBJECT )
			{
				var test = parseFloat( value );
				if ( isNaN( test ) == false )
					return test;

				test = parseInt( value );
				if ( isNaN( test ) == false )
					return test;

				return value.toString();
			}
			else if ( propType == ParameterType.HIDDEN )
				return value.toString();
		}

		/**
		* This is the resonse from the server
		*/
		onServer( response: LoaderEvents, event: AnimateLoaderEvent, sender? : EventDispatcher )
		{
			var loader: AnimateLoader = <AnimateLoader>sender;
			if ( response == LoaderEvents.COMPLETE )
			{
				if ( event.return_type == AnimateLoaderResponses.SUCCESS )
				{
					if ( loader.url == "/export/compile" )
					{
						Logger.getSingleton().clearItems();
						var now: Date = new Date();
						Logger.getSingleton().logMessage( "Build complete at " + new Date( Date.now() ).toDateString(), null, LogType.MESSAGE );
						Logger.getSingleton().logMessage( "External link: " + event.tag.liveLink, null, LogType.MESSAGE );

						if ( this.runWhenDone )
							window.open( event.tag.liveLink, 'Webinate Live!', 'width=900,height=860' ); //'width=900,height=860,menubar=1,resizable=1,scrollbars=1,status=1,titlebar=1,toolbar=1'

						this.dispatchEvent(new ImportExportEvent(ImportExportEvents.COMPLETE, event.tag.liveLink) );
					}
				}
				else
				{
					MessageBox.show(event.message, Array<string>("Ok"), null, null );
					this.dispatchEvent( new ProjectEvent( ProjectEvents.FAILED, event.message, AnimateLoaderResponses.ERROR, event.tag ));
				}
			}
			else
				this.dispatchEvent( new ProjectEvent( ProjectEvents.FAILED, event.message, AnimateLoaderResponses.ERROR, event.tag));
		}

		/**
		* Gets the singleton instance.
		* @extends <ImportExport>
		*/
		static getSingleton() : ImportExport
		{
			if ( !ImportExport._singleton )
				new ImportExport();

			return ImportExport._singleton;
		}
	}
}