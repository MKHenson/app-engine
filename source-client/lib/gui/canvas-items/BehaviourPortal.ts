module Animate
{
	export class BehaviourPortal extends Behaviour
	{
		private _portalType: PortalType;
        private _property: Prop<any>;

        constructor(parent: Component, text: string, portalType: PortalType = PortalType.INPUT, property: Prop<any>)
		{
			this._portalType = portalType;
            this._property = property;

			// Call super-class constructor
            super(parent, text);

			this.element.addClass("behaviour-portal");
            this.addPortal(this._portalType, property, true );
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