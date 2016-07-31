module Animate {
	/**
	* A simple class to define portal behaviour.
	*/
	export class PortalTemplate	{
        public type: PortalType;
        public property: Prop<any>;

		/**
        * @param {Prop<any>} property The property associated with this portal
		* @param {PortalType} type The type of portal this represents
		*/
        constructor(property: Prop<any>, type: PortalType) {
			this.type = type;
            this.property = property;
		}
	}
}