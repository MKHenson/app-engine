namespace Animate {

    /**
     * A behaviour for representing container portals
     */
    export class BehaviourPortal extends Behaviour {
        public portalType: HatcheryRuntime.PortalType;
        private _property: Prop<any> | null;

        /**
         * Creates an instance
         */
        constructor( property: Prop<any>, portalType: HatcheryRuntime.PortalType ) {
            super( PluginManager.getSingleton().getTemplate( 'Portal' ) ! );

            this.alias = property.name;
            this.portalType = portalType;
            this._property = property;

            if ( property ) {
                if ( this.portalType === 'output' )
                    this.addPortal( 'input', property );
                else if ( this.portalType === 'input' )
                    this.addPortal( 'output', property );
                else if ( this.portalType === 'parameter' )
                    this.addPortal( 'product', property );
                else if ( this.portalType === 'product' )
                    this.addPortal( 'parameter', property );
            }
        }

        /**
         * Clones the canvas item
         */
        clone( clone?: BehaviourPortal ): BehaviourPortal {
            if ( !clone )
                clone = new BehaviourPortal( this._property!.clone(), this.portalType );

            super.clone( clone );
            return clone;
        }

        /**
         * Serializes the data into a JSON.
         */
        serialize( id: number ): IBehaviourPortal {
            const toRet = <IBehaviourPortal>super.serialize( id );
            toRet.portal = { name: this._property!.name, custom: true, type: this.portalType, property: this._property!.tokenize() };
            toRet.type = 'portal';
            return toRet;
        }

        /**
         * De-Serializes data from a JSON.
         * @param data The data to import from
         */
        deSerialize( data: IBehaviourPortal ) {
            super.deSerialize( data );
            this.portalType = data.portal.type;
            this._property = Utils.createProperty( data.portal.property.name, data.portal.property.type );
            this._property.deTokenize( data );
        }

		/**
         * This will cleanup the component.
         */
        dispose() {
            this._property = null;
            super.dispose();
        }

        get property(): Prop<any> { return this._property!; }
    }
}