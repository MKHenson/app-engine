module Animate
{
	/**
	* A node for displaying comments
	*/	
	export class BehaviourComment extends Behaviour
	{
		private isInInputMode: boolean;
		private input: JQuery;
		private stageClickProxy: any;
		private mStartX: string;
		private mStartY: string;
		private mOffsetX: number;
		private mOffsetY: number;

		constructor( parent : Component, text : string )
		{
			// Call super-class constructor
			super( parent, text );

			this.canGhost = false;

			this.element
				.removeClass( "reg-gradient" )
				.addClass( "behaviour-comment" )
				.addClass( "comment" )
				.addClass( "shadow-small" );
			

			this.isInInputMode = false;
			this.stageClickProxy = jQuery.proxy( this.onStageClick, this );
			this.input = jQuery( "<textarea rows='10' cols='30'></textarea>" );

			this.textfield.element.css( { width: "95%", height: "95%", left: 0, top: 0 });
			this.textfield.element.text( text );

			this.element.on( "mousedown", jQuery.proxy( this.onResizeStart, this ) );
			this.mStartX = null;
            this.mStartY = null;
            this.element.resizable(<JQueryUI.ResizableOptions>{
				minHeight: 50,
				minWidth: 50,
				helper: "ui-resizable-helper",
				resize: jQuery.proxy( this.onResizeUpdate, this ),
				stop: jQuery.proxy( this.onResizeStop, this )
			});
		}

		/** Does nothing...*/
		updateDimensions()
		{
			return;
		}

		/** When the mouse enters the behaviour*/
		onIn( e )
		{
			this.element.css( "opacity", 1 );
		}

		/**
		* A shortcut for jQuery's css property. 
		*/
		css( propertyName: any, value?: any ): any
		{
			//Call super
			var toRet = super.css( propertyName, value );

			return toRet;
		}

		/** When the mouse enters the behaviour*/
		onOut( e )
		{
			this.element.css( "opacity", 0.3 );
		}

		/** When the resize starts.*/
		onResizeStart( event, ui )
		{
			this.mStartX = this.element.css( "left" );
			this.mStartY = this.element.css( "top" );

			this.mOffsetX = this.element.offset().left;
			this.mOffsetY = this.element.offset().top;
		}

		/** When the resize updates.*/
		onResizeUpdate( event, ui )
		{
			this.element.css( { left: this.mStartX, top: this.mStartY });

			var helper = jQuery( ui.helper );
			helper.css( { left: this.mOffsetX, top: this.mOffsetY });
		}

		/** When the resize stops.*/
		onResizeStop( event, ui )
		{
			this.onStageClick( null );
			this.element.css( { left: this.mStartX, top: this.mStartY });
		}

		/** Call this to allow for text editing in the comment.*/
		enterText()
		{
			if ( this.isInInputMode )
				return false;

			this.input.data( "dragEnabled", false );

			jQuery( "body" ).on( "click", this.stageClickProxy );
			this.isInInputMode = true;
			this.input.css( { width: this.textfield.element.width(), height: this.textfield.element.height() });

			jQuery( "body" ).append( this.input );
			this.input.css( {
				position: "absolute", left: this.element.offset().left + "px",
				top: this.element.offset().top + "px", width: this.element.width() + "px",
				height: this.element.height() + "px", "z-index": 9999
			});

			this.textfield.element.detach();
			this.input.val( this.textfield.element.text() );
			this.input.focus();
			this.input.select();
		}

		/** When we click on the stage we go out of edit mode.*/
		onStageClick( e )
		{
			if ( this.isInInputMode == false )
				return;

			if ( e != null && jQuery( e.target ).is( this.input ) )
				return;

			this.isInInputMode = false;
			jQuery( "body" ).off( "click", this.stageClickProxy );

			this.element.css( { width: this.input.width() + "px", height: this.input.height() + "px" });

			this.input.detach();
			this.element.append( this.textfield.element );

			this.input.data( "dragEnabled", true );

			this.text = this.input.val();
			//this.textfield.element.text( this.input.val() );
			this.textfield.element.css( { width: "95%", height: "95%", top: 0, left: 0 });


		}

		/**This will cleanup the component.*/
		dispose()
		{
			jQuery( "body" ).off( "click", this.stageClickProxy );
			this.input.remove();

			this.stageClickProxy = null;
			this.isInInputMode = null;

			//Call super
			super.dispose();
		}
	}
}