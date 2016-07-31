module Animate {
	/**
	* The ListViewHeader class is used in the ListView class. It acts as the first selectable item row in the list view.
	*/
	export class ListViewHeader extends Component {
		public text: string;

		/**
		* @param {string} text The text of the header
		* @param {string} image The optional image of the header
		*/
		constructor( text : string, image  : string) {
			// Call super-class constructor
			super( "<div class='list-view-header light-gradient'><span class='inner'>" + (image && image != "" ? "<img src='" + image + "'/>" : "") + text + "</span><div class='dragger light-gradient'></div></div>", null);

			this.text = text;
		}
	}
}