module Animate
{
	export class BehaviourPortal extends Behaviour
	{
		private _portalType: PortalType;
        private _property: Prop<any>;

        constructor(parent: Component, property: Prop<any>, portalType: PortalType = PortalType.INPUT)
		{
			this._portalType = portalType;
            this._property = property;

			// Call super-class constructor
            super(parent, property.name);

			this.element.addClass("behaviour-portal");
            this.addPortal(this._portalType, property, true );
        }

        /**
        * Tokenizes the data into a JSON. 
        * @param {boolean} slim If true, only the core value is exported. If false, additional data is exported so that it can be re-created at a later stage
        * @returns {IBehaviourPortal}
        */
        tokenize(slim: boolean = false): IBehaviourPortal
        {
            var toRet = <IBehaviourPortal>{};
            toRet.portal = { name: this._property.name, custom: true, type: this._portalType, property: this._property.tokenize(slim) };
            return toRet;
        }

        /**
        * De-Tokenizes data from a JSON. 
        * @param {IBehaviourPortal} data The data to import from
        */
        deTokenize(data: IBehaviourPortal)
        {
            super.deTokenize(data);
            this._portalType = data.portal.type;
            this._property = createProperty( data.portal.property, null );
        }

		/**
        * This will cleanup the component.
        */
		dispose()
		{
			this._portalType = null;
            this._property = null;

			// Call super
			super.dispose();
		}

		get portaltype(): PortalType { return this._portalType; }
        get property(): Prop<any> { return this._property; }
	}
}