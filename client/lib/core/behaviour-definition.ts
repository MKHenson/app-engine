module Animate
{
	/**
	*  A simple class to define the behavior of a behaviour object.
	*/
	export class BehaviourDefinition
	{
		private _behaviourName: string;
		private _canBuildOutput: boolean;
		private _canBuildInput: boolean;
		private _canBuildParameter: boolean;
		private _canBuildProduct: boolean;
		private _portalTemplates: Array<PortalTemplate>;
		private _plugin: IPlugin;

		/**
		* @param {string} behaviourName The name of the behaviour
        * @param {Array<PortalTemplate>} portalTemplates
		* @param {IPlugin} plugin The plugin this is associated with
		* @param {boolean} canBuildInput
		* @param {boolean} canBuildOutput
		* @param {boolean} canBuildParameter
		* @param {boolean} canBuildProduct
		*/
        constructor(behaviourName: string, portalTemplates: Array<PortalTemplate>, plugin: IPlugin, canBuildInput: boolean = false, canBuildOutput: boolean = false, canBuildParameter: boolean = false, canBuildProduct: boolean = false )
        {
            for (var i = 0; i < portalTemplates.length; i++)
                for (var ii = 0; ii < portalTemplates.length; ii++)
                    if (ii != i && portalTemplates[i].property.name == portalTemplates[ii].property.name)
                        throw new Error(`You cannot have more than 1 property with the name ${portalTemplates[i].property.name}`);

			this._behaviourName = behaviourName;
			this._canBuildOutput = canBuildOutput;
			this._canBuildInput = canBuildInput;
			this._canBuildParameter = canBuildParameter;
			this._canBuildProduct = canBuildProduct;
			this._portalTemplates = portalTemplates;
			this._plugin = plugin;
		}

		/*
        * This function is called by Animate to get an array of
		* TypeConverters. TypeConverter objects define if one type can be translated to another. They
		* also define what the process of conversion will be.
        */
		dispose()
		{
			this._behaviourName = null;
			this._canBuildOutput = null;
			this._canBuildInput = null;
			this._canBuildParameter = null;
			this._canBuildProduct = null;
			this._portalTemplates = null;
			this._plugin = null;
		}

		/*
        * This function is called by Animate to see if a behaviour can build output portals.
		* @return {boolean} Return true if you want Animate to allow for building outputs.
        */
        canBuildOutput(behaviour: Behaviour): boolean
        {
            return this._canBuildOutput;
        }

		/*
        * This function is called by Animate to see if a behaviour can build input portals.
		* @return {boolean} Return true if you want Animate to allow for building inputs.
        */
        canBuildInput(behaviour: Behaviour): boolean
        {
            return this._canBuildInput;
        }

		/*
        * This function is called by Animate to see if a behaviour can build product portals.
		* @return {boolean} Return true if you want Animate to allow for building products.
        */
        canBuildProduct(behaviour: Behaviour): boolean
        {
            return this._canBuildProduct;
        }

		/*
        * This function is called by Animate to see if a behaviour can build parameter portals.
		* @return {boolean} Return true if you want Animate to allow for building parameters.
        */
        canBuildParameter(behaviour: Behaviour): boolean
        {
            return this._canBuildParameter;
        }

		/*
        * This function is called by Animate When a new behaviour is being created. The definition
		* has to provide the behaviour with an array of PortalTemplates.
		* @returns {Array<PortalTemplate>}
        */
        portalsTemplates(): Array<PortalTemplate>
        {
            return this._portalTemplates;
        }

		get behaviourName(): string { return this._behaviourName; }
		get plugin(): IPlugin { return this._plugin; }
	}
}