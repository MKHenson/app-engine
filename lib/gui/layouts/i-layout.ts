namespace Animate {
	/**
	* The interface for all layout objects.
	*/
    export interface ILayout {
		/**
		* Sets the component offsets based the layout algorithm
		* @param {Component} component The {Component} we are setting dimensions for.
		*/
        update( component: Component ): void;
    }
}