module Animate {
	/**
	* A wrapper class for checkboxes
	*/
	export class Checkbox extends Component {
		private checkbox: Component;
		private textfield: Component;

		/**
		* A wrapper class for checkboxes
		*/
		constructor( parent: Component, text : string, checked : boolean, html: string = "<div class='checkbox'></div>" ) {
			// Call super-class constructor
			super( html, parent );

			this.checkbox = <Component>this.addChild( "<input type='checkbox'></input>" );
			this.textfield = <Component>this.addChild( "<div class='text'>" + text + "</div>" );

			if ( checked )
				this.checkbox.element.prop( "checked", checked );
		}

		/**Sets if the checkbox is checked.*/
		set checked( val : boolean ) {
			this.checkbox.element.prop( "checked", val );
		}

		/**Gets if the checkbox is checked.*/
		get checked(): boolean {
			return this.checkbox.element.prop( "checked" );
		}

		/**Sets the checkbox label text*/
		set text( val: string ) {
			this.textfield.element.val( val );
		}

		/**Gets the checkbox label text*/
		get text() : string {
			return this.textfield.element.val();
		}

		/**This will cleanup the component.*/
		dispose() {
			this.textfield = null;
			this.checkbox = null;

			//Call super
			super.dispose();
		}
	}
}