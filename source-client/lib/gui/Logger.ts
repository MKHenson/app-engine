/// <reference path="MenuList.ts" />

module Animate
{
	export class LogType extends ENUM
	{
		constructor(v: string) { super(v); }

		static MESSAGE: LogType = new LogType("message");
		static WARNING: LogType = new LogType("warning");
		static ERROR: LogType = new LogType("error");
	}

	/**
	* The Logger is a singleton class used to write message's to Animate's log window. 
	*/
	export class Logger extends MenuList
	{
		private static _singleton : Logger;
		private context: ContextMenu;
		private mDocker: Docker;
		private warningFlagger: JQuery;
		private mContextProxy: any;

		constructor( parent: Component )
		{
			if ( Logger._singleton != null )
				throw new Error( "The Logger class is a singleton. You need to call the Logger.getSingleton() function." );

			Logger._singleton = this;

			// Call super-class constructor
			super( parent );

			this.element.addClass( "logger" );

			this.context = new ContextMenu();
            this.context.addItem(new ContextMenuItem("Clear", "media/cross.png" ) );
			this.mDocker = null;

			this.warningFlagger = jQuery( "<img class='logger-warning fade-animation' src='media/warning-button.png' />" );

			//Add listeners
			this.mContextProxy =  this.onContext.bind( this );

			jQuery( document ).on( "contextmenu", this.mContextProxy );
			this.context.on( ContextMenuEvents.ITEM_CLICKED, this.onContextSelect, this );

			//this.element.disableSelection( true );

			this.warningFlagger.on( "click", jQuery.proxy( this.onIconClick, this ) );
		}

		/**
		* @type public mfunc onIconClick
		* When we click the error warning
		* @extends <Logger>
		*/
		onIconClick()
		{
			this.mDocker.setActiveComponent( this, true );
			this.warningFlagger.detach();
		}

		/**
		* @type public mfunc getPreviewImage
		* This is called by a controlling ScreenManager class. An image string needs to be returned
		* which will act as a preview of the component that is being viewed or hidden.
		* @extends <Logger>
		* @returns <string> 
		*/
		getPreviewImage() : string
		{
			return "media/logger.png";
		}

		/**
		* This is called by a controlling Docker class when the component needs to be shown.
		*/
		onShow() : void
		{
			this.warningFlagger.detach();
			this.element.data( "preview" ).removeClass( "fade-animation" );
		}

		/**
		* This is called by a controlling Docker class when the component needs to be hidden.
		*/
		onHide() : void { }

		/**
		* Each IDock item needs to implement this so that we can keep track of where it moves.
		* @returns {Docker}
		*/
		getDocker() : Docker { return this.mDocker; }

		/**
		* Each IDock item needs to implement this so that we can keep track of where it moves.
		* @param {Docker} val 
		*/
		setDocker( val : Docker ) { this.mDocker = val; }

		/**
		* Called when the context menu is about to open
		*/
		onContextSelect( response: ContextMenuEvents, event: ContextMenuEvent, sender? : EventDispatcher )
		{
			if ( event.item.text == "Clear" )
			{
				//Unselect all other items
				this.clearItems();
			}
		}

		/**
		* Called when the context menu is about to open
		*/
		onContext( e : any )
		{
			//Now hook the context events
			var targ : JQuery = jQuery( e.target );
			if ( targ.is( jQuery( ".menu-list-item" ) ) || targ.is( jQuery( ".menu-list" ) ) )
			{
				if ( targ.is( jQuery( ".menu-list-item" ) ) && targ.parent().data( "component" ) != this )
					return;
				else if ( targ.is( jQuery( ".menu-list" ) ) && targ.data( "component" ) != this )
					return;

				e.preventDefault();
				this.context.show( Application.getInstance(), e.pageX,  e.pageY, false, true );
			}
		}

		/**
		* Adds an item to the Logger
		* @param {string} val The text to show on the logger.
		* @param {any} tag An optional tag to associate with the log.
		* @param {string} type The type of icon to associate with the log. By default its Logger.MESSAGE
		*/
		logMessage( val: string, tag: any, type: LogType = LogType.MESSAGE)
		{
			var img = null;
			if ( type == LogType.MESSAGE )
				img = "media/tick.png";
			else if ( type == LogType.ERROR )
				img = "media/cross.png";
			else
				img = "media/warning-20.png";

			//Add a border glow to the messages dock items
			if ( type != LogType.MESSAGE && this.element.data( "preview" ) != this.mDocker.activePreview )
			{
				var offset = this.mDocker.element.offset();
				jQuery( "body" ).append( this.warningFlagger );
				this.warningFlagger.css( { left: offset.left, top: offset.top - this.warningFlagger.height() });

				this.element.data( "preview" ).addClass( "fade-animation" );
            }
            val = `<span class='date'>${new Date(Date.now()).toLocaleDateString() }</span>` + val;
			var toAdd = this.addItem( img, val, true );
			toAdd.data( "tag", tag );
			return toAdd;
		}

		/**
		* Clears all the log messages
		*/
		clearItems() : void
		{
			this.warningFlagger.detach();
			this.element.data( "preview" ).removeClass( "fade-animation" );

			var len = this.items.length;
			for ( var i = 0; i < len; i++ )
				this.items[i].data( "tag", null );

			super.clearItems();
		}

		/**
		* Gets the singleton instance.
		* @param {Component} parent 
		* @returns {Logger}
		*/
		static getSingleton( parent? : Component ): Logger
		{
			if ( !Logger._singleton )
				new Logger( parent );

			return Logger._singleton;
		}
	}
}