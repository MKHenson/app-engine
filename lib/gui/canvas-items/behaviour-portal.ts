module Animate {

    /**
     * A behaviour for representing container portals
     */
	export class BehaviourPortal extends Behaviour {
		private _portalType: PortalType;
        private _property: Prop<any>;

        /**
         * Creates an instance
         */
        constructor( property: Prop<any>, portalType: PortalType = 'input' ) {
            super('Portal');

            this.alias = property.name;
            this._portalType = portalType;
            this._property = property;
            this.className = 'behaviour-portal ' + portalType;

            if (property) {
                if (this._portalType == 'output')
                    this.addPortal('input', property);
                else if (this._portalType == 'input')
                    this.addPortal('output', property);
                else if (this._portalType == 'parameter')
                    this.addPortal('product', property);
                else if (this._portalType == 'product')
                    this.addPortal('parameter', property);
            }
        }

        /**
         * Serializes the data into a JSON.
		 * @param {number} id
         * @returns {IBehaviourPortal}
         */
        serialize(id: number): IBehaviourPortal {
            var toRet = <IBehaviourPortal>super.serialize(id);
            toRet.portal = { name: this._property.name, custom: true, type: this._portalType, property: this._property.tokenize() };
            toRet.type = 'portal';
            return toRet;
        }

        /**
         * De-Serializes data from a JSON.
         * @param {IBehaviourPortal} data The data to import from
         */
        deSerialize(data: IBehaviourPortal) {
            super.deSerialize(data);
            this._portalType = data.portal.type;
            this.className = 'behaviour-portal ' + this._portalType;
            this._property = Utils.createProperty(data.portal.property.name, data.portal.property.type);
            this._property.deTokenize(data);
        }

		/**
         * This will cleanup the component.
         */
		dispose() {
            this._property = null;
			super.dispose();
		}

		get portaltype(): PortalType { return this._portalType; }
        get property(): Prop<any> { return this._property; }
	}
}