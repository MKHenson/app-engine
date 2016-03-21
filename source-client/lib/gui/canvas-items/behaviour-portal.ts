module Animate
{
	export class BehaviourPortal extends Behaviour
	{
		private _portalType: PortalType;
        private _property: Prop<any>;

        constructor(parent: Component, property: Prop<any>, portalType: PortalType = PortalType.INPUT)
		{
			// Call super-class constructor
            super(parent, (property ? property.name : "Portal"));

            this._portalType = portalType;
            this._property = property;

            this.element.addClass("behaviour-portal");


            if (property)
            {
                if (this._portalType == PortalType.OUTPUT)
                    this.addPortal(PortalType.INPUT, property, true);
                else if (this._portalType == PortalType.INPUT)
                    this.addPortal(PortalType.OUTPUT, property, true);
                else if (this._portalType == PortalType.PARAMETER)
                    this.addPortal(PortalType.PRODUCT, property, true);
                else if (this._portalType == PortalType.PRODUCT)
                    this.addPortal(PortalType.PARAMETER, property, true);

                this.element.addClass(PortalType[this._portalType].toLowerCase());
            }
        }

        /**
        * Tokenizes the data into a JSON.
        * @param {boolean} slim If true, only the core value is exported. If false, additional data is exported so that it can be re-created at a later stage
        * @returns {IBehaviourPortal}
        */
        tokenize(slim: boolean = false): IBehaviourPortal
        {
            var toRet = <IBehaviourPortal>super.tokenize(slim);
            toRet.portal = { name: this._property.name, custom: true, type: this._portalType, property: this._property.tokenize(slim) };
            toRet.type = CanvasItemType.BehaviourPortal;
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
            this.element.addClass(PortalType[this._portalType].toLowerCase());
            this._property = Utils.createProperty(data.portal.property.name, data.portal.property.type);
            this._property.deTokenize(data);
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