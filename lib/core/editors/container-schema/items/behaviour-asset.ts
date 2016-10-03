namespace Animate {

    /**
     * A behaviour that contains an asset/resource reference
     */
    export class BehaviourAsset extends Behaviour {
        public asset: ProjectResource<Engine.IResource>;

        /**
         * Creates an instance of the behaviour
         */
        constructor( asset?: ProjectResource<Engine.IResource> ) {
            super( PluginManager.getSingleton().getTemplate( 'Asset' ), {
                type : 'asset',
                alias : ( asset ? asset.entry.name : 'Asset' )
             } );
            this.asset = asset || null;

            // Set the property if the asset was provided
            this.parameters[ 0 ].property.setVal( asset );

            // if ( asset )
            //     this.alias = asset.entry.name;
        }

        /**
         * Clones the canvas item
         */
        clone( clone?: BehaviourAsset ) : BehaviourAsset {
            if ( !clone )
                clone = new BehaviourAsset( this.asset );

            super.clone(clone);
            return clone;
        }

		/**
		 * Clean up
		 */
        dispose() {
            this.asset = null;
            super.dispose();
        }

        // /**
        //  * Serializes the data into a JSON.
        //  */
        // serialize( id: number ): Engine.Editor.IBehaviour {
        //     let toRet = <Engine.Editor.IBehaviour>super.serialize( id );
        //     toRet.type = 'asset';
        //     return toRet;
        // }

		/**
		 * Adds a portal to this behaviour.
		 * @param type The type of portal we are adding. It can be either 'input', 'output', 'parameter' & 'product'
		 * @param property
		 */
        addPortal( type: HatcheryRuntime.PortalType, property: Prop<any> ): Portal {
            const portal = super.addPortal( type, property );
            if ( type === 'parameter' )
                this.asset = property.getVal() as Resources.Asset;

            return portal;
        }
    }
}