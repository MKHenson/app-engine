module Animate {

	/**
	 * Describes the type of log message
	 */
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

		/**
		 * Creates an instance of the logger
		 */
		constructor( props: IListProps ) {
			super( props );

			Logger._singleton = this;
		}

		/**
         * Creates the component elements
         * @returns {JSX.Element}
         */
        render(): JSX.Element {
			return <div onContextMenu={(e) => {
					e.preventDefault();
					ReactContextMenu.show({ x: e.pageX, y : e.pageY, items : [{
						label: 'Clear',
						prefix:  <i className="fa fa-times" aria-hidden="true"></i>,
						onSelect: (item) => { this.clear(); }
					}] });
				}}
				className="logger"
			>
				{super.render()}
			</div>
		}

		/**
		 * Logs an error message
		 * @param {string} msg
		 */
		static error( msg: string ) {
			Logger.logMessage(msg, null, LogType.ERROR);
		}

		/**
		 * Logs a warning message
		 * @param {string} msg
		 */
		static warn( msg: string ) {
			Logger.logMessage(msg, null, LogType.WARNING);
		}

		/**
		 * Logs a success message
		 * @param {string} msg
		 */
		static success( msg: string ) {
			Logger.logMessage(msg, null, LogType.MESSAGE);
		}

		/**
		 * Logs a message to the logger
		 * @param {string} val The text to show on the logger.
		 * @param {any} tag An optional tag to associate with the log.
		 * @param {string} type The type of icon to associate with the log. By default its Logger.MESSAGE
		 */
		static logMessage( val: string, tag: any, type: LogType = LogType.MESSAGE) {
            let logger = Logger.getSingleton();
			let icon: JSX.Element;
			let iconClass : string;

			if ( type == LogType.MESSAGE ) {
				icon = <span className="success"><i className="fa fa-check" aria-hidden="true"></i></span>;
				iconClass = 'success';
			}
			else if ( type == LogType.ERROR ) {
				icon = <span className="error"><i className="fa fa-exclamation-circle" aria-hidden="true"></i></span>;
				iconClass = 'error';
			}
			else {
				icon = <span className="warning"><i className="fa fa-exclamation-triangle" aria-hidden="true"></i></span>;
				iconClass = 'warning';
			}

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