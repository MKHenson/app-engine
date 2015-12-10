module Animate
{
	export class BehaviourAsset extends Behaviour
	{
		private _asset : Asset;

		constructor(parent : Canvas, text :string = "Asset" )
		{
			// Call super-class constructor
			super( parent, text);

			//this.element.removeClass("behaviour");
			this.element.addClass("behaviour-asset");
			this._asset = null;
		}

		/**
		* Diposes and cleans up this component and all its child <Component>s
		*/
		dispose()
		{
			this._asset = null;

			//Call super
			super.dispose();
		}

		/**
		* Adds a portal to this behaviour.
		* @param {PortalType} type The type of portal we are adding. It can be either PortalType.INPUT, PortalType.OUTPUT, Portal.PARAMETER & PortalType.PRODUCT
		* @param {string} name The unique name of the Portal
		* @param {any} value The default value of the Portal
		* @param {ParameterType} dataType The data type that the portal represents. See the default data types.
		* @returns {Portal} The portal that was added to this node
		*/
		addPortal(type:PortalType, name: string, value : any, dataType : ParameterType): Portal
		{
			var portal = Behaviour.prototype.addPortal.call(this, type, name, value, dataType);

			if (type == PortalType.PARAMETER)
			{
                var id = parseInt(value.selected);
                this._asset = User.get.project.getResourceByShallowID<Asset>(id, ResourceType.ASSET);
			}

			return portal;
		}

		get asset(): Asset { return this._asset; }
		set asset(val: Asset) { this._asset = val; }
	}
}