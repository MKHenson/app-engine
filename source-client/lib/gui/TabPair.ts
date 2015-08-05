module Animate
{
	/**
	* This class is a small container class that is used by the Tab class. It creates TabPairs
	* each time a tab is created with the addTab function. This creates a TabPair object that keeps a reference to the
	* label and page as well as a few other things.
	*/
	export class TabPair
	{
		public tabSelector: Component;
		public page: Component;
		public name: string;

		constructor( tab: Component, page : Component, name : string )
		{
			this.tabSelector = tab;
			this.page = page;
			this.name = name;
		}

		/**
		* Called when the editor is resized
		*/
		 onResize () { }

		/**
		* Called by the tab class when the pair is to be removed. 
		* @param {TabEvent} data An object that can be used to cancel the operation. Simply call data.cancel = true to cancel the closure.
		*/
		onRemove( data: TabEvent ) { }

		/**
		* Called by the tab when the save all button is clicked
		*/
		onSaveAll() { }

		/**
		* Called when the pair has been added to the tab
		*/
		 onAdded () { }

		/**
		* Called when the pair has been selected
		*/
		 onSelected () { }

		/**
		* Sets the label text of the pair
		*/
		set text( text: string ) { jQuery( ".text", this.tabSelector.element ).text( text ); }

		/**
		* Gets the label text of the pair
		*/
		get text(): string { return jQuery( ".text", this.tabSelector.element ).text(); }

	

		/**
		* Cleans up the references 
		*/
		dispose() : void
		{
			this.tabSelector.dispose();
			this.page.dispose();

			this.tabSelector = null;
			this.page = null;
			this.name = null;
		}
	}
}