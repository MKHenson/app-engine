// namespace Animate {

// 	/**
// 	 * A behaviour used to ghost - or act as a shortcut - for an existing behaviour. This is created when you hold shift and
// 	 * move a behaviour on the canvas. The ghost can then be used as if it were the original node.
// 	 */
// 	export class BehaviourShortcut extends Behaviour {
//         private _originalNode: Behaviour;
//         public originalNodeId: number;

// 		/**
// 		 * @param {Behaviour} originalNode The original node we are copying from
// 		 */
// 		constructor( originalNode : Behaviour, data? : IBehaviourShortcut ) {
// 			super(data);

// 			this.element.addClass("behaviour-shortcut");
//             this._originalNode = originalNode;
//             this.originalNodeId = 0;

// 			if (originalNode)
//                 this.setOriginalNode(originalNode, true);

//             this.tooltip = "Press C to focus on source";
//         }

//         /**
//          * Serializes the data into a JSON.
//          * @returns {IBehaviourResource}
//          */
//         serialize(): IBehaviourShortcut {
//             var toRet = <IBehaviourShortcut>super.serialize();
//             toRet.originalId = this._originalNode.shallowId;
//             toRet.type = 'shortcut';
//             return toRet;
//         }

//         /**
//          * De-Serialize data from a JSON.
//          * @param {IBehaviourResource} data The data to import from
//          */
//         deSerialize(data: IBehaviourShortcut) {
//             super.deSerialize(data);
//             this.originalNodeId = data.originalId;
//         }

//         /**
//          * Called after de-tokenization. This is so that the items can link up to any other items that might have been created in the process.
//          * @param {number} originalId The original shallow ID of the item when it was tokenized.
//          * @param {LinkMap} items The items loaded from the detokenization process. To get this item you can do the following: items[originalId].item
//          * or to get the token you can use items[originalId].token
//          */
//         link(originalId: number, items: LinkMap) {
//             var exportedToken = <IBehaviourShortcut>items[originalId].token;

//             // This link was probably copied - but not with both of the end behavours - so remove it
//             if (!items[exportedToken.originalId]) {
//                 this.alias = "NOT FOUND";
//                 Logger.logMessage(`Could not find original node for shortcut ${originalId}`, null, LogType.ERROR);
//                 return;
//             }

//             this.setOriginalNode(<Behaviour>items[exportedToken.originalId].item, false);
//         }

// 		setOriginalNode( originalNode : Behaviour, buildPortals : boolean ) {
// 			this._originalNode = originalNode;
// 			if (originalNode instanceof BehaviourAsset)
// 				this.element.addClass("behaviour-asset");

// 			else if (originalNode instanceof BehaviourPortal)
// 				this.element.addClass("behaviour-portal");

// 			// Copy each of the portals
// 			if ( buildPortals )
// 			{
//                 for (var i = 0, l = originalNode.portals.length; i < l; i++)
//                     this.addPortal(originalNode.portals[i].type, originalNode.portals[i].property, false);
// 			}
// 		}

// 		/**
// 		 * Clean up
// 		 */
// 		dispose() {
// 			this._originalNode = null;
//             super.dispose();
// 		}

// 		get originalNode(): Behaviour { return this._originalNode; }
// 	}
// }