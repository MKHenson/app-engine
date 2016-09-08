namespace Animate {
	/**
	* A simple Percentile layout. Changes a component's dimensions to be a
	* percentage of its parent width and height.
	*/
    export class Percentile implements ILayout {
        public widthPercent: number;
        public heightPercent: number;

        constructor( widthPercent: number = 1, heightPercent: number = 1 ) {
            this.widthPercent = widthPercent;
            this.heightPercent = heightPercent;
        }

		/**
		* Sets the component width and height to its parent.
		* @param {Component} component The {Component} we are setting dimensions for.
		*/
        update( component: Component ) {
            const e: JQuery = component.element;
            const parent: JQuery = e.parent();

            if ( parent !== null && parent.length !== 0 ) {
                const parentOverflow = parent.css( "overflow" );
                parent.css( "overflow", "hidden" );

                const w = parent.width();
                const h = parent.height();

                e.css( {
                    width: ( this.widthPercent * w ) + "px",
                    height: ( this.heightPercent * h ) + "px"
                });

                parent.css( "overflow", parentOverflow );
            }
        }
    }
}