namespace Animate {
	/**
	* A simple class to define portal behaviour.
	*/
    export class PortalTemplate {
        public type: HatcheryRuntime.PortalType;
        public property: Prop<any>;

		/**
        * @param property The property associated with this portal
		* @param type The type of portal this represents
		*/
        constructor( property: Prop<any>, type: HatcheryRuntime.PortalType ) {
            this.type = type;
            this.property = property;
        }
    }
}