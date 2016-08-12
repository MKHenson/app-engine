module Animate {
	export enum LogType {
		MESSAGE,
		WARNING,
		ERROR
	}

	/**
	 * The Logger is a singleton class used to write message's to Animate's log window.
	 */
	export class Logger extends List  {
		private static _singleton : Logger;
		private _context: ContextMenu;
		private mContextProxy: any;

		constructor( props: IListProps ) {
			super( props );

			Logger._singleton = this;

			this._context = new ContextMenu();
            this._context.addItem(new ContextMenuItem("Clear", "media/cross.png" ) );

			//Add listeners
			this.mContextProxy =  this.onContext.bind( this );
			jQuery( document ).on( "contextmenu", this.mContextProxy );
			// TODO: Needs to be implemented when context menu is implemented in TSX
			//=========================================================
			// this._context.on( ContextMenuEvents.ITEM_CLICKED, this.onContextSelect, this );
			// ==========================================================
		}

		/**
         * Creates the component elements
         * @returns {JSX.Element}
         */
        render(): JSX.Element {
			return <div className="logger">
				{super.render()}
			</div>
		}

		// TODO: Needs to be implemented when context menu is implemented in TSX
		//=========================================================
		// /**
		// * Called when the context menu is about to open
		// */
		// onContextSelect( response: ContextMenuEvents, event: ContextMenuEvent, sender? : EventDispatcher ) {
		// 	if ( event.item.text == "Clear" ) {
		// 		//Unselect all other items
		// 		this.clear();
		// 	}
		// }
		//=========================================================


		// TODO: Needs to be implemented when context menu is implemented in TSX
		//=========================================================
		/**
		* Called when the context menu is about to open
		*/
		onContext( e : any ) {
			// //Now hook the context events
			// var targ : JQuery = jQuery( e.target );
			// if ( targ.is( jQuery( ".menu-list-item" ) ) || targ.is( jQuery( ".menu-list" ) ) ) {
			// 	if ( targ.is( jQuery( ".menu-list-item" ) ) && targ.parent().data( "component" ) != this )
			// 		return;
			// 	else if ( targ.is( jQuery( ".menu-list" ) ) && targ.data( "component" ) != this )
			// 		return;

			// 	e.preventDefault();

			// 	this._context.show( null, e.pageX,  e.pageY, false, true );
			// 	throw new Error("Not implemented");
			// }
		}
		//=========================================================

		/**
		 * Logs a message to the logger
		 * @param {string} val The text to show on the logger.
		 * @param {any} tag An optional tag to associate with the log.
		 * @param {string} type The type of icon to associate with the log. By default its Logger.MESSAGE
		 */
		static logMessage( val: string, tag: any, type: LogType = LogType.MESSAGE) {
            let logger = Logger.getSingleton();
			let icon: JSX.Element;

			if ( type == LogType.MESSAGE )
				icon = <i className="fa fa-check" aria-hidden="true"></i>;
			else if ( type == LogType.ERROR )
				icon = <i className="fa fa-exclamation-circle" aria-hidden="true"></i>;
			else
				icon = <i className="fa fa-exclamation-triangle" aria-hidden="true"></i>;

			let prefix = <span>
				{icon}<span className='date'>{new Date(Date.now()).toLocaleDateString()} {new Date(Date.now()).toLocaleTimeString()}</span>
			</span>

            let toAdd = logger.addItem( { prefix: prefix, label: val } );
			return toAdd;
		}

		/**
		 * Gets logger global instance
		 * @param {Component} parent
		 * @returns {Logger}
		 */
		static getSingleton( parent? : Component ): Logger {
			return Logger._singleton;
		}
	}
}