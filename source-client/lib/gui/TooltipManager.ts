module Animate
{
	/**
	* A singleton class that manages displaying the tooltips of various components.
	*/
	export class TooltipManager
	{
		private static _singleton: TooltipManager;
		private label: Label;

		constructor()
		{
			if ( TooltipManager._singleton != null )
				throw new Error( "The TooltipManager class is a singleton. You need to call the TooltipManager.getSingleton() function." );

			TooltipManager._singleton = this;

			this.label = new Label( "tooltip", Application.getInstance(), "<div class='label tooltip shadow-small'></div>" );
			this.label.element.hide();

			jQuery( "body" ).on( "mousemove", this.onMove.bind(this) );
		}

		/**
		* @description Called when we hover over an element.
		* @param {any} e The JQUery event object
		*/
		onMove = function ( e )
		{
			var comp : Component = jQuery( e.target ).data( "component" );
			if ( !comp )
				return;

			var label: Label = this.label;

			var tt = comp.tooltip;
			var elm: JQuery = label.element;

			if ( tt && tt != "" )
			{
				label.text = tt;

				var h: number = label.element.height();
				var w: number = label.element.width();

				elm.show();
				var y = ( e.clientY - h - 20 < 0 ? 0 : e.clientY - h - 20 - 20 );
				var x = ( e.clientX + w + 20 < jQuery( "body" ).width() ? e.clientX + 20 : jQuery( "body" ).width() - w );
				elm.css( { left: x + "px", top: y + "px" });

			}
			else
				elm.hide();
		}

		/**
		* Gets the singleton instance
		*/
		public static create(): TooltipManager
		{
			if ( TooltipManager._singleton === undefined )
				TooltipManager._singleton = new TooltipManager();

			return TooltipManager._singleton;
		}
	}
}