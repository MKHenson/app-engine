module Animate {
	export class BehaviourAsset extends Behaviour {
		public asset : ProjectResource<Engine.IResource>;

        /**
         * Creates an instance of the behaviour
         */
		constructor(asset? : ProjectResource<Engine.IResource>) {
			super( PluginManager.getSingleton().getTemplate( 'Asset' ) );
            this.className = 'behaviour-asset';
			this.asset = asset || null;

            // Set the property if the asset was provided
            this.parameters[0].property.setVal( asset );

            if (asset) {
                this.alias = asset.entry.name;
            }
		}

		/**
		 * Clean up
		 */
		dispose() {
			this.asset = null;
			super.dispose();
        }

        /**
         * Serializes the data into a JSON.
         * @returns {IBehaviour}
         */
        serialize(id: number): IBehaviour {
            let toRet = <IBehaviour>super.serialize(id);
            toRet.type = 'asset';
            return toRet;
        }

		/**
		 * Adds a portal to this behaviour.
		 * @param {PortalType} type The type of portal we are adding. It can be either 'input', 'output', 'parameter' & 'product'
		 * @param {Prop<any>} property
		 * @returns {Portal}
		 */
        addPortal(type: PortalType, property: Prop<any> ): Portal {
            var portal = super.addPortal(type, property);
            if (type == 'parameter')
                this.asset = property.getVal() as Resources.Asset;

			return portal;
		}
	}
}