namespace Animate {
    export class ImportExportEvents extends ENUM {
        constructor( v: string ) { super( v ); }
        static COMPLETE: ImportExportEvents = new ImportExportEvents( 'import_export_complete' );
    }

	/**
	* A class to help with importing and exporting a project
	*/
    export class ImportExport extends EventDispatcher {
        private static _singleton: ImportExport;

        private runWhenDone: boolean;
        private mRequest: string;

        constructor() {
            // Call super-class constructor
            super();

            if ( ImportExport._singleton !== null )
                throw new Error( 'The ImportExport class is a singleton. You need to call the ImportExport.getSingleton() function.' );

            ImportExport._singleton = this;

            this.mRequest = null;
            this.runWhenDone = false;
        }


		/**
		* @type public mfunc run
		* This function will first export the scene and then attempt to create a window that runs the application.
		* @extends <ImportExport>
		*/
        run() {
            this.exportScene();
            this.runWhenDone = true;
        }

		/**
		* @type public mfunc exportScene
		* This function is used to exort the Animae scene. This function creates an object which is exported as a string. Plugins
		* can hook into this process and change the output to suit the plugin needs.
		* @extends <ImportExport>
		*/
        exportScene() {
            //this.runWhenDone = false;
            //var project = User.get.project;

            //var data = {};
            //data['category'] = 'builds';
            //         data['command'] = 'build';
            //         data['projectID'] = project.entry._id;

            //var dataToken: ExportToken = <ExportToken>{};
            //dataToken.assets = [];
            //dataToken.groups = [];
            //dataToken.containers = [];
            //dataToken.converters = {};
            //dataToken.data = {};

            //var canvasToken: CanvasToken = null;

            //// Get all the behaviours and build them into the export object
            //         for (var i = 0, l = project.containers.length; i < l; i++ )
            //{
            //             var behaviour: Container = project.containers[i];
            //             if (behaviour.entry.json === null)
            //		continue;

            //             canvasToken = behaviour.entry.json;

            //	// Check if we have valid json and items saved
            //	if ( canvasToken && canvasToken.items )
            //	{
            //		var containerToken = <ContainerToken>{};
            //		dataToken.containers.push( containerToken );
            //                 containerToken.name = behaviour.entry.name;
            //                 containerToken.id = behaviour.entry.shallowId;
            //		containerToken.behaviours = [];
            //		containerToken.links = [];
            //		containerToken.assets = [];
            //		containerToken.groups = [];
            //		//containerToken.properties = {};

            //		// Set each of the properties
            //		//var props = behaviour.properties.tokenize(true);
            //                 containerToken.properties = behaviour.properties.tokenize(true);
            //		//for ( var pi in props )
            //		//{
            //  //                   var propType: PropertyType = PropertyType.fromString( props[pi].type );
            //		//	var propVal = props[pi].value;
            //		//	containerToken.properties[props[pi].name] = ImportExport.getExportValue( propType, propVal );
            //		//}

            //		// Let the plugins export their data
            //		containerToken.plugins = canvasToken.plugins;

            //		PluginManager.getSingleton().emit( new ContainerDataEvent( EditorEvents.CONTAINER_EXPORTING, behaviour, containerToken.plugins ) );

            //		// Create tokens and fill each with data. First create either a behaviour
            //		// or link objct
            //		for ( var cti = 0, ctl = canvasToken.items.length; cti < ctl; cti++ )
            //		{
            //			var canvasTokenItem: CanvasTokenItem = canvasToken.items[cti];
            //			if ( canvasTokenItem.type === 'BehaviourAsset' ||
            //				canvasTokenItem.type === 'BehaviourScript' ||
            //				canvasTokenItem.type === 'BehaviourPortal' ||
            //				canvasTokenItem.type === 'Behaviour' ||
            //				canvasTokenItem.type === 'BehaviourInstance' )
            //			{
            //				var behaviourToken: BehaviourToken = <BehaviourToken>{};
            //				containerToken.behaviours.push( behaviourToken );

            //				behaviourToken.id = canvasTokenItem.id;
            //				behaviourToken.name = canvasTokenItem.name;
            //				behaviourToken.type = canvasTokenItem.type;

            //				// Check the type and fill in the sub properties
            //				if ( canvasTokenItem.type === 'BehaviourPortal' )
            //				{
            //					behaviourToken.portalType = canvasTokenItem.portalType.toString();
            //					behaviourToken.dataType = canvasTokenItem.dataType.toString();
            //					behaviourToken.value = ImportExport.getExportValue( canvasTokenItem.dataType, canvasTokenItem.value );
            //				}
            //				else
            //				{
            //					if ( canvasTokenItem.type === 'BehaviourInstance' )
            //						behaviourToken.originalContainerID = canvasTokenItem.containerId;

            //					if ( canvasTokenItem.type === 'BehaviourScript' )
            //						behaviourToken.shallowId = canvasTokenItem.shallowId;

            //					// Create each of the portals

            //					behaviourToken.portals = [];
            //					for ( var ci = 0, cl = canvasTokenItem.portals.length; ci < cl; ci++ )// objectToken.items[counter].portals[counterPortal] )
            //					{
            //						var portalToken: PortalToken = <PortalToken>{};
            //						behaviourToken.portals.push( portalToken );

            //						portalToken.name = canvasTokenItem.portals[ci].name;
            //						portalToken.type = canvasTokenItem.portals[ci].type.toString();
            //						portalToken.dataType = canvasTokenItem.portals[ci].dataType.toString();
            //						portalToken.value = ImportExport.getExportValue( canvasTokenItem.portals[ci].dataType, canvasTokenItem.portals[ci].value );

            //						//Check for assets, and if so, add the asset to the assets
            //                                 if (canvasTokenItem.portals[ci].dataType === PropertyType.ASSET )
            //						{
            //							if ( portalToken.value !== null && portalToken.value !== '' )
            //							{
            //								var assetID: number = portalToken.value;
            //								if ( !isNaN( assetID ) && assetID !== 0 && containerToken.assets.indexOf( assetID ) === -1 )
            //								{
            //									containerToken.assets.push( assetID );

            //									//It can also the be case that assets reference other assets. In those
            //                                             //situations you will want the container to keep adding to all the assets
            //                                             this.referenceCheckAsset(project.getResourceByShallowID<Asset>(assetID, ResourceType.ASSET), containerToken);
            //								}
            //							}
            //						}
            //                                 else if (canvasTokenItem.portals[ci].dataType === PropertyType.ASSET_LIST )
            //						{
            //							if ( portalToken.value !== null && portalToken.value.selectedAssets.length !== 0 )
            //							{
            //								for ( var a = 0, al = portalToken.value.selectedAssets.length; a < al; a++ )
            //								{
            //									var assetID: number = portalToken.value.selectedAssets[a];
            //									if ( !isNaN( assetID ) && assetID !== 0 && containerToken.assets.indexOf( assetID ) === -1 )
            //									{
            //										containerToken.assets.push( assetID );

            //										//It can also the be case that assets reference other assets. In those
            //                                                 //situations you will want the container to keep adding to all the assets
            //                                                 this.referenceCheckAsset(project.getResourceByShallowID<Asset>(assetID, ResourceType.ASSET), containerToken);
            //									}
            //								}
            //							}
            //						}
            //                                 else if (canvasTokenItem.portals[ci].dataType === PropertyType.GROUP )
            //						{
            //							if ( portalToken.value !== null && portalToken.value !== '' )
            //							{
            //                                         var groupID: string = ImportExport.getExportValue(PropertyType.GROUP, portalToken.value );
            //								if ( groupID !== null && groupID !== '' )
            //								{
            //									//It can also the be case that groups reference other groups. In those
            //									//situations you will want the container to keep adding to all the groups
            //									this.referenceCheckGroup( <TreeNodeGroup>TreeViewScene.getSingleton().findNode( 'resource', groupID ), containerToken );
            //								}
            //							}
            //						}
            //					}
            //				}
            //			}
            //			else if ( canvasTokenItem.type === 'Link' )
            //			{
            //				var linkToken: LinkToken = <LinkToken>{};
            //				containerToken.links.push( linkToken );

            //				//fill in the sub properties
            //				linkToken.id = canvasTokenItem.id;
            //				linkToken.type = canvasTokenItem.type;
            //				linkToken.startPortal = canvasTokenItem.startPortal;
            //				linkToken.endPortal = canvasTokenItem.endPortal;
            //				linkToken.startBehaviour = canvasTokenItem.targetStartBehaviour;
            //				linkToken.endBehaviour = canvasTokenItem.targetEndBehaviour;
            //				linkToken.frameDelay = canvasTokenItem.frameDelay;
            //			}
            //		}
            //	}
            //}

            //// Get all the assets and build them into the export object
            //for ( var i = 0, l = project.assets.length; i < l; i++ )
            //{
            //	var asset : Asset = project.assets[i];

            //	// Check if we have valid json and items saved
            //	if ( canvasToken )
            //	{
            //		var assetToken: AssetToken = <AssetToken>{};
            //                 dataToken.assets.push(assetToken);
            //                 assetToken.name = asset.entry.name;
            //                 assetToken.id = asset.entry.shallowId;
            //		assetToken.properties = {};
            //                 assetToken.className = asset.entry.className;

            //		var aprops = asset.properties.tokenize();
            //		for ( var assetPropName in aprops )
            //		{
            //                     var propType: PropertyType = PropertyType.fromString( aprops[assetPropName].type.toString() );
            //			var propVal: any = aprops[assetPropName].value;
            //			assetToken.properties[aprops[assetPropName].name] = ImportExport.getExportValue( propType, propVal );
            //		}
            //	}
            //}

            //         // Get all the groups and build them into the export object
            //         var groups: Array<GroupArray> = project.groups;
            //for ( var i = 0, l = groups.length; i < l; i++ )
            //{
            //	var group = groups[i];
            //	var groupToken: GroupToken = <GroupToken>{};
            //             dataToken.groups.push(groupToken);
            //             groupToken.name = group.entry.name;
            //             groupToken.id = group.entry._id;
            //             groupToken.items = group.entry.items.slice(0, group.entry.items.length);
            //}

            //// Send the object to the plugins
            //PluginManager.getSingleton().emit( new EditorExportingEvent( dataToken ) );

            //var sceneStr = JSON.stringify( dataToken );
            //var loader = new AnimateLoader();
            //loader.on( LoaderEvents.COMPLETE, this.onServer, this );
            //loader.on( LoaderEvents.FAILED, this.onServer, this );
            //         loader.load('/export/compile', { projectId: project.entry._id, json: sceneStr });
        }

		/**
		* Adds asset references to a container token during the export.
		* @param {Resources.Asset} asset the asset object to check
		* @param {ContainerToken} container The container to add refernces on
		* @returns {any}
		*/
        referenceCheckAsset( asset: Resources.Asset, container: any ) {
            if ( asset === null )
                return;

            const assetVars = asset.properties.variables;
            const project = User.get.project;

            //Check all the assets properties. If it contains another assest, then we need to make sure its added to the container
            for ( let i = 0, l = assetVars.length; i < l; i++ ) {
                if ( assetVars[ i ].type === PropertyType.ASSET ) {
                    const asset = <Resources.Asset>assetVars[ i ].getVal();
                    if ( asset ) {
                        container.assets.push( asset.entry.shallowId );

                        //It can also the be case that assets reference other assets. In those
                        //situations you will want the container to keep adding to all the assets
                        this.referenceCheckAsset( asset, container );
                    }
                }
                else if ( assetVars[ i ].type === PropertyType.ASSET_LIST ) {
                    const aList = <Array<Resources.Asset>>assetVars[ i ].getVal();

                    for ( let a = 0, al = aList.length; a < al; a++ ) {
                        const asset = <Resources.Asset>aList[ a ];
                        container.assets.push( asset.entry.shallowId );

                        //It can also the be case that assets reference other assets. In those
                        //situations you will want the container to keep adding to all the assets
                        this.referenceCheckAsset( asset, container );
                    }
                }
                else if ( assetVars[ i ].type === PropertyType.GROUP ) {
                    const group = <Resources.GroupArray>assetVars[ i ].getVal();

                    if ( group ) {
                        // TODO: This needs to be checked with update to TSX
                        // ================================================
                        // const groupNode: any = TreeViewScene.getSingleton().findNode( 'resource', group );
                        // this.referenceCheckGroup( groupNode, container );
                        // ================================================
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
        referenceCheckGroup( group: TreeNodeGroup, container: any ) {
            if ( group === null )
                return;

            const project = User.get.project;

            // Add the group
            if ( container.groups.indexOf( group.resource.entry._id ) )
                container.groups.push( group.resource.entry._id );


            //Check all the group properties. If it contains another group, then we need to make sure its added to the container
            for ( let ii = 0; ii < group.children.length; ii++ )
                if ( ( <TreeNodeGroupInstance>group.children[ ii ] ).shallowId ) {
                    const assetID: number = ( <TreeNodeGroupInstance>group.children[ ii ] ).shallowId;

                    //Check if the asset was added to the container
                    if ( container.assets.indexOf( assetID ) === -1 ) {
                        container.assets.push( assetID );

                        //It can also the be case that assets reference other assets. In those
                        //situations you will want the container to keep adding to all the assets
                        this.referenceCheckAsset( project.getResourceByShallowID<Resources.Asset>( assetID, ResourceType.ASSET ), container );
                    }
                }
        }


        ///**
        //* Gets the value of an object without any of the additional data associated with it.
        //* @param {ParameterType} propType the object type
        //* @param {any} value Its current value
        //* @returns {any}
        //*/
        //      static getExportValue(propType: PropertyType, value: any): any
        //{
        //          if (propType === PropertyType.NUMBER )
        //		return value.selected || ( isNaN( parseFloat( value ) ) ? 0 : parseFloat( value ) );
        //          else if (propType === PropertyType.STRING || propType === PropertyType.BOOL || propType === PropertyType.INT )
        //		return value;
        //          else if (propType === PropertyType.ASSET )
        //	{
        //		var shallowId: number = 0;
        //		shallowId = parseInt( value.selected );
        //		if ( isNaN( shallowId ) )
        //			shallowId = 0;

        //		return shallowId;
        //	}
        //          else if (propType === PropertyType.ASSET_LIST )
        //	{
        //		return value.selectedAssets || [];
        //	}
        //          else if (propType === PropertyType.GROUP )
        //		return value;
        //          else if (propType === PropertyType.FILE )
        //	{
        //		var path :string = value.path;
        //		var urlParts = path.split( '/' );
        //		return '{{url}}uploads/' + urlParts[urlParts.length -1];
        //	}
        //          else if (propType === PropertyType.HIDDEN_FILE )
        //          {
        //              var file: Engine.IFile = Animate.User.get.project.getResourceByShallowID(value, ResourceType.FILE);
        //		if ( file )
        //              {
        //                  var urlParts = file.url.split('/');
        //			return '{{url}}uploads/' + urlParts[urlParts.length - 1];
        //		}

        //		return '';
        //	}
        //          else if (propType === PropertyType.ENUM )
        //		return value.selected;
        //          else if (propType === PropertyType.COLOR )
        //		return value.color;
        //          else if (propType === PropertyType.OBJECT )
        //	{
        //		var test = parseFloat( value );
        //		if ( isNaN( test ) === false )
        //			return test;

        //		test = parseInt( value );
        //		if ( isNaN( test ) === false )
        //			return test;

        //		return value.toString();
        //	}
        //          else if (propType === PropertyType.HIDDEN )
        //		return value.toString();
        //}

		/**
		* This is the resonse from the server
		*/
        onServer( response: LoaderEvents, event: AnimateLoaderEvent, sender?: EventDispatcher ) {
            const loader: AnimateLoader = <AnimateLoader>sender;
            // if ( response === LoaderEvents.COMPLETE ) {
            //     if ( event.return_type === AnimateLoaderResponses.SUCCESS ) {
            //         if ( loader.url === '/export/compile' ) {
            //             LoggerStore.get.clear();
            //             const now: Date = new Date();
            //             LoggerStore.success( 'Build complete at ' + new Date( Date.now() ).toDateString() );
            //             LoggerStore.success( 'External link: ' + event.tag.liveLink );

            //             if ( this.runWhenDone )
            //                 window.open( event.tag.liveLink, 'Webinate Live!', 'width=900,height=860' ); //'width=900,height=860,menubar=1,resizable=1,scrollbars=1,status=1,titlebar=1,toolbar=1'

            //             this.emit( new ImportExportEvent( ImportExportEvents.COMPLETE, event.tag.liveLink ) );
            //         }
            //     }
            //     else {
            //         // TODO: This should be a pure function - no gui calls allowed
            //         // MessageBox.show(event.message, Array<string>('Ok'), null, null );
            //         //this.emit( new ProjectEvent( ProjectEvents.FAILED, event.message, AnimateLoaderResponses.ERROR, event.tag ));
            //     }
            // }
            //else
            //	this.emit( new ProjectEvent( ProjectEvents.FAILED, event.message, AnimateLoaderResponses.ERROR, event.tag));
        }

		/**
		* Gets the singleton instance.
		* @extends <ImportExport>
		*/
        static getSingleton(): ImportExport {
            if ( !ImportExport._singleton )
                new ImportExport();

            return ImportExport._singleton;
        }
    }
}