namespace Animate {

    /**
	 * Describes the type of log message
	 */
    export enum LogType {
        MESSAGE,
        WARNING,
        ERROR
    }

    export interface ILogMessage {
        type: LogType;
        message: string;
        tag: any;
    }

    export class LoggerStore extends EventDispatcher {
        private static _singleton: LoggerStore;
        private _logs: ILogMessage[];

        /**
         * Creates an instance of the logger store
         */
        constructor() {
            super();
            LoggerStore._singleton = this;
            this._logs = [];
        }

        /**
         * Gests all currently logged messages
         * @returns {ILogMessage[]}
         */
        getLogs(): ILogMessage[] {
            return this._logs;
        }

        /**
		 * Gets global logger store instance
		 * @returns {LoggerStore}
		 */
        static get get(): LoggerStore {
            return LoggerStore._singleton;
        }

        /**
		 * Logs an error message
		 * @param {string} msg
		 */
        static error( msg: string ) {
            LoggerStore.logMessage( msg, null, LogType.ERROR );
        }

		/**
		 * Logs a warning message
		 * @param {string} msg
		 */
        static warn( msg: string ) {
            LoggerStore.logMessage( msg, null, LogType.WARNING );
        }

		/**
		 * Logs a success message
		 * @param {string} msg
		 */
        static success( msg: string ) {
            LoggerStore.logMessage( msg, null, LogType.MESSAGE );
        }

        /**
         * Adds a new log item
         */
        add( message: string, type: LogType, tag: any ) {
            this._logs.push( { message: message, type: type, tag: tag });
            this.emit<LoggerEvents, any>( 'change', null );
        }

        /**
         * Removes all logs
         */
        clear() {
            this._logs.splice( 0, this._logs.length );
            this.emit<LoggerEvents, any>( 'change', null );
        }

		/**
		 * Logs a message to the logger
		 * @param {string} val The text to show on the logger.
		 * @param {any} tag An optional tag to associate with the log.
		 * @param {string} type The type of icon to associate with the log. By default its Logger.MESSAGE
		 */
        static logMessage( val: string, tag: any, type: LogType = LogType.MESSAGE ) {
            LoggerStore._singleton.add( val, type, tag );
        }
    }
}