namespace Animate {
	/**
	* This small class is used to group property grid elements together
	*/
    export class PropertyGridGroup extends Component {
        public name: string;
        public content: JQuery;

        constructor( name: string ) {
            // Call super-class constructor
            super( '<div class=\'property-grid-group background-view-light\'></div>', null );

            this.name = name;
            this.element.append( '<div class=\'property-grid-group-header tooltip-text-bg\'>' + name + '</div>' );
            this.content = jQuery( '<div class=\'content\'></div>' );
            this.element.append( this.content );
        }

		/**
		* This function is used to clean up the PropertyGridGroup
		*/
        dispose() {
            //Call super
            super.dispose();
        }
    }
}