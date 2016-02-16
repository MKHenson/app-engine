module Animate
{
	export class BehaviourAsset extends Behaviour
	{
		private _asset : Asset;

		constructor(parent : Canvas, text :string = "Asset" )
		{
			// Call super-class constructor
			super( parent, text);

			this.element.addClass("behaviour-asset");
			this._asset = null;
		}

		/**
		* Diposes and cleans up this component and all its child <Component>s
		*/
		dispose()
		{
			this._asset = null;

			// Call super
			super.dispose();
        }

        /**
        * Tokenizes the data into a JSON.
        * @param {boolean} slim If true, only the core value is exported. If false, additional data is exported so that it can be re-created at a later stage
        * @returns {IBehaviour}
        */
        tokenize(slim: boolean = false): IBehaviour
        {
            var toRet = <IBehaviour>super.tokenize(slim);
            toRet.type = CanvasItemType.BehaviourAsset;
            return toRet;
        }

		/**
		* Adds a portal to this behaviour.
		* @param {PortalType} type The type of portal we are adding. It can be either Portal.INPUT, Portal.OUTPUT, Portal.PARAMETER & Portal.PRODUCT
		* @param {Prop<any>} property
		* @returns {Portal}
		*/
        addPortal(type: PortalType, property: Prop<any>, update: boolean): Portal
		{
            var portal = super.addPortal(type, property, update);

            if (type == PortalType.PARAMETER)
                this._asset = <Asset>property.getVal();

			return portal;
		}

		get asset(): Asset { return this._asset; }
		set asset(val: Asset) { this._asset = val; }
	}
}