module Animate {
	/**
	* A simple fill layout. Fills a component to its parent width and height. Optional
	* offsets can be used to tweak the fill.
	*/
	export class Fill implements ILayout {
		public offsetX: number;
		public offsetY: number;
		public offsetWidth: number;
		public offsetHeight: number;
		public resrtictHorizontal: boolean;
		public resrtictVertical: boolean;

		constructor(
			offsetX: number = 0,
			offsetY: number = 0,
			offsetWidth: number = 0,
			offsetHeight: number = 0,
			resrtictHorizontal: boolean = false,
			resrtictVertical: boolean = false ) {
			this.offsetX = offsetX;
			this.offsetY = offsetY;
			this.offsetWidth = offsetWidth;
			this.offsetHeight = offsetHeight;
			this.resrtictHorizontal = resrtictHorizontal;
			this.resrtictVertical = resrtictVertical;
		}

		/**
		* Sets the component width and height to its parent.
		* @param {Component} component The {Component} we are setting dimensions for.
		*/
		update( component : Component ) {
			var e: JQuery = component.element;
			var parent : JQuery = e.parent();

			if (parent != null && parent.length != 0) {
				var parentOverflow : string = parent.css("overflow");
				parent.css("overflow", "hidden");

				var w : number = parent.width();
				var h : number = parent.height();

				e.css({
					width: ( this.resrtictHorizontal === false ? (w + this.offsetWidth).toString() : ""),
					height: (this.resrtictVertical === false ? (h + this.offsetHeight).toString() : ""),
					left: this.offsetX,
					top: this.offsetY
				});

				parent.css("overflow", parentOverflow);
			}
		}
	}
}