// module Animate {
// 	export class BehaviourAsset extends Behaviour {
// 		public asset : Asset;

// 		constructor( data?: IBehaviour ) {
// 			super( data );

// 			this.element.addClass("behaviour-asset");
// 			this.asset = null;
// 		}

// 		/**
// 		 * Clean up
// 		 */
// 		dispose() {
// 			this.asset = null;
// 			super.dispose();
//         }

//         /**
//          * Serializes the data into a JSON.
//          * @returns {IBehaviour}
//          */
//         serialize(): IBehaviour {
//             let toRet = <IBehaviour>super.serialize();
//             toRet.type = 'asset';
//             return toRet;
//         }

// 		/**
// 		 * Adds a portal to this behaviour.
// 		 * @param {PortalType} type The type of portal we are adding. It can be either 'input', 'output', 'parameter' & 'product'
// 		 * @param {Prop<any>} property
// 		 * @returns {Portal}
// 		 */
//         addPortal(type: PortalType, property: Prop<any> ): Portal {
//             var portal = super.addPortal(type, property, false);

//             if (type == 'parameter')
//                 this.asset = property.getVal() as Asset;

// 			return portal;
// 		}
// 	}
// }