module Animate
{
	/** A very simple class to represent tool bar buttons */
	export class ToolBarButton extends Component
	{
		private _radioMode: boolean;
		private _pushButton: boolean;
		private _proxyDown: any;

		constructor( text : string, image : string, pushButton : boolean = false, parent?: Component )
		{
            super("<div class='toolbar-button tooltip'><div><img src='" + image + "' /></div><div class='tooltip-text tooltip-text-bg'>" + text + "</div></div>", parent );

			this._pushButton = pushButton;
			this._radioMode = false;
			this._proxyDown = this.onClick.bind( this );

			this.element.on( "click", this._proxyDown );
		}

		/** Cleans up the button */
		dispose()
		{
			this.element.off( "mousedown", this._proxyDown );
			this._proxyDown = null;

			super.dispose();
		}

		onClick( e )
		{
			var element: JQuery = this.element;

			if ( this._pushButton )
			{
				if ( !element.hasClass( "selected" ) )
					this.selected = true;
				else
					this.selected = false;
			}
		}

		/**
		* Set if the component is selected. When set to true a css class of 'selected' is added to the {Component}
		*/
		set selected( val: boolean )
		{
			if ( val )
				this.element.addClass( "selected" );
			else
				this.element.removeClass( "selected" );

			if ( this._radioMode && val && this.parent )
			{
				var pChildren: Array<IComponent> = this.parent.children;
				for ( var i = 0, len = pChildren.length; i < len; i++ )
					if ( pChildren[i] != this && pChildren[i] instanceof ToolBarButton )
						( <ToolBarButton>pChildren[i] ).selected = false;
			}
		}

		/**
		* Get if the component is selected. When set to true a css class of 'selected' is added to the {Component}
		*/
		get selected(): boolean { return this.element.hasClass("selected"); }

		/**
		* If true, the button will act like a radio button. It will deselect any other ToolBarButtons in its parent when its selected.
		*/
		set radioMode( val: boolean )
		{
			this._radioMode = val;
		}
		get radioMode(): boolean { return this._radioMode; }
	}
}