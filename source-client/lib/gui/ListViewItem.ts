module Animate
{
	/**
	* The ListViewItem class is used in the ListView class. These represent the items you can select.
	*/
	export class ListViewItem
	{
		private _fields: Array<string>;
		private _components: Array<Component>;
		private _smallImg: string;
		private _largeIMG: string;
		private _rowNum: number;
		public tag : any;
		
		/**
		* @param {Array<string>} fields An array of strings. These strings will be evenly distributed between columns of a list view.
		* @param {string} smallImg The URL of an image to use that can represent the small image of this item when in Image mode of the list view
		* @param {string} largeIMG The URL of an image to use that can represent the large image of this item when in Image mode of the list view
		*/
		constructor(fields:Array<string>, smallImg: string = "", largeIMG:string = "" )
		{
			this._fields = fields;
			this._smallImg = smallImg;
			this._largeIMG = largeIMG;
			this._rowNum = 0;
			this.tag = null;

			this._components = [];
		}

		/**
		* This function clears the field's components
		*/
		clearComponents()
		{
			var i = this._components.length;
			while (i--)
				this._components[i].dispose();

			this._components = [];
		}

		/**
		* This function is used to cleanup the object before its removed from memory.
		*/
		dispose()
		{
			var i = this._components.length;
			while (i--)
				this._components[i].dispose();

			this._fields = null;
			this._smallImg = null;
			this._largeIMG = null;
			this._rowNum = null;
			this._components = null;
			this.tag = null;
		}

		/**
		* Creates a preview component for the list view.
		* @param {string} text Text to show under the preview
		* @param {number} imgSize The size of the image
		* @returns <Component> 
		*/
		preview(text : string, imgSize : number )
		{
			var toRet = new Component("<div class='list-view-preview' style='width:" + (imgSize) + "px; height:" + (imgSize + 30) + "px;'><div class='image' style='width:" + imgSize + "px; height:" + imgSize + "px;'><img src='" + this.largeIMG + "' /></div><div class='info'>" + text + "</div></div>", null);
			this.components.push(toRet);

			toRet.element.data("item", this);
			return toRet;
		}

		/**
		* Creates a field component
		* @param string content The text to show inside of the field
		* @returns {Component}
		*/
		field(content: string): Component
		{
			var toRet = new Component("<div class='list-view-field unselectable'>" + content + "</div>", null);
			this.components.push(toRet);

			toRet.element.data("item", this);
			return toRet;
		}

		get components(): Array<Component> { return this._components; }
		get fields(): Array<string> { return this._fields; }
		get smallImg(): string { return this._smallImg; }
		get largeIMG(): string { return this._largeIMG; }
	}
}