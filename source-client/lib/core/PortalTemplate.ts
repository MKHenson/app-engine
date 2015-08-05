module Animate
{
	/**
	* A simple class to define portal behaviour.
	*/
	export class PortalTemplate
	{
		public name: string;
		public type: PortalType;
		public dataType: ParameterType;
		public value: any;
		
		/**
		* @param {string} name This is the name of the template
		* @param {PortalType} type The type of portal this represents. Defined in the Portal class.
		* @param {ParameterType} dataType The portal value type (see value types)
		* @param {any} value The default value of the portal
		*/
		constructor( name: string, type: PortalType, dataType: ParameterType, value: string )
		constructor( name: string, type: PortalType, dataType: ParameterType, value: boolean )
		constructor( name: string, type: PortalType, dataType: ParameterType, value: { min?: number; max?: number; interval?: number; selected?: number; })
		constructor( name: string, type: PortalType, dataType: ParameterType, value: { color?: string; opacity?: number })
		constructor(name: string, type: PortalType, dataType: ParameterType, value: { className?: string; selected?: string; })
		constructor(name: string, type: PortalType, dataType: ParameterType, value: { classNames?: Array<string>; selected?: string; })
		constructor( name: string, type: PortalType, dataType: ParameterType, value: { choices: Array<string>; selected: string; })
		constructor( name: string, type: PortalType, dataType: ParameterType, value: { extensions?: Array<string>; path?: string; id?: string; selectedExtension?: string; } )
		constructor( name: string, type: PortalType, dataType: ParameterType, value: any)
		constructor( name: string, type : PortalType, dataType : ParameterType, value: any )
		{
			if ( !dataType )
				dataType = ParameterType.OBJECT;
			if ( !value )
				value = "";

			this.name = name;
			this.type = type;
			this.dataType = dataType;
			this.value = value;
		}
	}
}