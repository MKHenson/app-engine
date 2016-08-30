// module Animate {
// 	/**
// 	* A behaviour node that represents a Behaviour Container
// 	*/
// 	export class BehaviourInstance extends Behaviour {
// 		private _container: Container;

// 		constructor( parent : Component, container : Container ) {
//             var text: string = (container.entry.name !== undefined ? container.entry.name : "Instance" );

// 			// Call super-class constructor
// 			super( parent, text );

//             this._container = container;

// 			this.element.addClass( "behaviour-instance" );

//    //         if (container)
// 			//{
// 				//// Now that its created we need to create the starting portals. If the canvas exists we use that as a
// 				//// reference, otherwise we use the json
// 				//var children = this._container.canvas.children;
//     //            for ( var ci = 0, cl = children.length; ci < cl; ci++ )
// 				//	if ( children[ci] instanceof BehaviourPortal )
//     //                {
//     //                    var bPortal = <BehaviourPortal>children[ci];
//     //                    var portals: Array<Portal> = bPortal.portals;
//     //                    for (var pi = 0, l = portals.length; pi < l; pi++ )
//     //                        this.addPortal(bPortal.portaltype, portals[pi].property.clone(), false );
//     //                }

//                 // TODO: What to do here??
//     //            else if (this._container.entry.json != null )
// 				//{
// 				//	// Parse the saved object and get the portal data
//     //                var jsonObj: CanvasToken = this._container.entry.json;

// 				//	if ( jsonObj && jsonObj.items )
// 				//	{
// 				//		for ( var i in jsonObj.items )
// 				//		{
// 				//			var item = null;

// 				//			//Create the portals only if its a Behaviour portal
// 				//			if ( jsonObj.items[i].type == "BehaviourPortal" )
// 				//			{
// 				//				this.addPortal( jsonObj.items[i].portalType,
// 				//					jsonObj.items[i].name,
// 				//					jsonObj.items[i].value,
// 				//					jsonObj.items[i].dataType, false );
// 				//			}
// 				//		}
// 				//	}
// 				//}
// 			//}

//             this.container = container;
// 			this.updateDimensions();

// 			//PluginManager.getSingleton().on( EditorEvents.PORTAL_ADDED, this.onPortalChanged, this );
// 			//PluginManager.getSingleton().on( EditorEvents.PORTAL_REMOVED, this.onPortalChanged, this );
// 			//PluginManager.getSingleton().on( EditorEvents.PORTAL_EDITED, this.onPortalChanged, this );
// 			//PluginManager.getSingleton().on( EditorEvents.CONTAINER_DELETED, this.onContainerDeleted, this );
//         }

//         /**
//         * Tokenizes the data into a JSON.
//         * @param {boolean} slim If true, only the core value is exported. If false, additional data is exported so that it can be re-created at a later stage
//         * @returns {IBehaviourResource}
//         */
//         tokenize(slim: boolean = false): IBehaviourShortcut {
//             var toRet = <IBehaviourShortcut>super.tokenize(slim);
//             toRet.type = CanvasItemType.BehaviourInstance;
//             return toRet;
//         }

//         /**
//         * De-Tokenizes data from a JSON.
//         * @param {IBehaviourResource} data The data to import from
//         */
//         deTokenize(data: IBehaviourShortcut) {
//             super.deTokenize(data);
//         }

// 		/**
// 		* Called when a behaviour is disposed
// 		*/
//         onContainerDeleted(type: string, event: ContainerEvent, sender?: EventDispatcher) {
//             if (<Container>event.container == this._container)
//             {
//                 var canvas: Canvas = this._container.canvas;
//                 if (canvas)
//                     canvas.removeItem( this );
// 			}
// 		}

// 		/**
// 		* This is called when a Canvas reports a portal being added, removed or modified.
// 		*/
//         onPortalChanged(type: string, event: PortalEvent, sender? : EventDispatcher ) {
// 			var curParent: JQuery = this.element.parent();
//             var portals = this.portals;

//             if (type == EventTypes.PORTAL_ADDED) {
// 				var pType: PortalType = null;
// 				if ( event.portal.type == PortalType.INPUT )
//                     pType = PortalType.OUTPUT;
// 				else if ( event.portal.type == PortalType.OUTPUT )
//                     pType = PortalType.INPUT;
// 				else if ( event.portal.type == PortalType.PARAMETER )
//                     pType = PortalType.PRODUCT;
// 				else if ( event.portal.type == PortalType.PRODUCT )
//                     pType = PortalType.PARAMETER;

//                 this.addPortal(pType, event.portal.property.clone(), true);
// 			}
//             else if (type == EventTypes.PORTAL_REMOVED ) {
//                 for ( var i = 0, l = portals.length; i < l; i++)
//                     if (portals[i].property.name == event.oldName) {
// 						this.removePortal( portals[i], true );
// 						break;
// 					}
// 			}
//             else if (type == EventTypes.PORTAL_EDITED )	{
//                 for (var i = 0, l = portals.length; i < l; i++)
//                     if (portals[i].property.name == event.oldName ) {
//                         var portal = portals[i];
//                         portal.edit(event.portal.property.clone());
// 						break;
// 					}
// 			}


// 			//jQuery( "body" ).append( this.element ); //We need this for size calculations
// 			this.updateDimensions();
// 			//curParent.append( this.element );
// 		}

// 		/**
// 		* Diposes and cleans up this component and all its child Components
// 		*/
// 		dispose() {
// 			//PluginManager.getSingleton().off( EditorEvents.PORTAL_ADDED, this.onPortalChanged, this );
// 			//PluginManager.getSingleton().off( EditorEvents.PORTAL_REMOVED, this.onPortalChanged, this );
// 			//PluginManager.getSingleton().off( EditorEvents.PORTAL_EDITED, this.onPortalChanged, this );
// 			//PluginManager.getSingleton().off( EditorEvents.CONTAINER_DELETED, this.onContainerDeleted, this );

// 			this.container = null;

// 			// Call super
// 			super.dispose();
// 		}

//         /**
// 		* Gets the container this instance represents
//         * @returns {Container}
// 		*/
//         get container(): Container {
//             return this._container;
//         }

//         /**
// 		* Sets the container this instance represents
//         * @param {Container} val
// 		*/
//         set container(val: Container) {
//             // Remove all existing portals
//             while (this.portals.length > 0)
//                 this.removePortal(this.portals[0]);

//             // Remove events
//             if (this._container) {
//                 this._container.off(EventTypes.PORTAL_ADDED, this.onPortalChanged, this);
//                 this._container.off(EventTypes.PORTAL_REMOVED, this.onPortalChanged, this);
//                 this._container.off(EventTypes.PORTAL_EDITED, this.onPortalChanged, this);
//                 this._container.off(EventTypes.CONTAINER_DELETED, this.onContainerDeleted, this);
//             }

//             this._container = val;

//             if (!val)
//                 return;

//             val.on(EventTypes.PORTAL_ADDED, this.onPortalChanged, this);
//             val.on(EventTypes.PORTAL_REMOVED, this.onPortalChanged, this);
//             val.on(EventTypes.PORTAL_EDITED, this.onPortalChanged, this);
//             val.on(EventTypes.CONTAINER_DELETED, this.onContainerDeleted, this);

//             // Now that its created we need to create the starting portals. If the canvas exists we use that as a
//             // reference, otherwise we use the json
//             var children = this._container.canvas.children;
//             for (var ci = 0, cl = children.length; ci < cl; ci++)
//                 if (children[ci] instanceof BehaviourPortal) {
//                     var bPortal = <BehaviourPortal>children[ci];
//                     var portals: Array<Portal> = bPortal.portals;
//                     for (var pi = 0, l = portals.length; pi < l; pi++)
//                         this.addPortal(bPortal.portaltype, portals[pi].property.clone(), false);
//                 }
//         }
// 	}
// }