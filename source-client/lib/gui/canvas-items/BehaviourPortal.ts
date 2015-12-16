module Animate
{
	export class BehaviourPortal extends Behaviour
	{
		private _portalType: PortalType;
        private _dataType: PropertyType;
		private _value: any;

        constructor(parent: Component, text: string, portalType: PortalType = PortalType.INPUT, dataType: PropertyType = PropertyType.BOOL, value : any = false)
		{
			this._portalType = portalType;
			this._dataType = dataType;
			this._value = value;

			// Call super-class constructor
			super( parent, text);

			//this.element.removeClass("behaviour");
			this.element.addClass("behaviour-portal");

			if (this._portalType == PortalType.OUTPUT)
				this.addPortal( PortalType.INPUT, text, this._value, this._dataType, true );
			else if ( this._portalType == PortalType.INPUT)
				this.addPortal( PortalType.OUTPUT, text, this._value, this._dataType, true );
			else if ( this._portalType == PortalType.PARAMETER)
				this.addPortal( PortalType.PRODUCT, text, this._value, this._dataType, true );
			else
				this.addPortal( PortalType.PARAMETER, text, this._value, this._dataType, true );
		}

		/**This will cleanup the component.*/
		dispose()
		{
			this._portalType = null;
			this._dataType = null;
			this._value = null;

			//Call super
			super.dispose();
		}

		get portaltype(): PortalType { return this._portalType; }
        get dataType(): PropertyType { return this._dataType; }
		get value(): any { return this._value; }
	}
}