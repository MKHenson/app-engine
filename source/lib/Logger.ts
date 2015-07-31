import utils = require( "./Utils" );



/**
* The type of message to log
*/
export enum LogType
{
	MESSAGE,
	ERROR,	
	SUCCESS,
	WARNING,
	SYS_ERROR,
	ADMIN,
}

/**
* This class is used to log messages and occassionally saves the log to the database
*/
export class Logger
{
	private static _singleton: Logger;
	private startupMessages: Array<any>;
	public busySaving: boolean;

	/**
	* Creates a new Logger instance
	*/
	constructor()
	{
		this.startupMessages = [];
		this.busySaving = false;
	}

	/**
	* Logs a message to the console and saves the messages to the database
	* @param {any} message The message to print
	* @param {LogType} type The type of message to print
	*/
	log( message: any, type: LogType = LogType.MESSAGE )
	{
		switch ( type )
		{
			case LogType.ERROR:
			case LogType.SYS_ERROR:
				console.log( utils.ConsoleStyles.red[0] + message + utils.ConsoleStyles.red[1] );
				break;
			case LogType.WARNING:
				console.log( utils.ConsoleStyles.yellow[0] + message + utils.ConsoleStyles.yellow[1] );
				break;
			case LogType.ADMIN:
				console.log( utils.ConsoleStyles.cyan[0] + message + utils.ConsoleStyles.cyan[1] );
				break;
			case LogType.MESSAGE:
				console.log( message );
				break;
			case LogType.SUCCESS:
				console.log( utils.ConsoleStyles.green[0] + message + utils.ConsoleStyles.green[1] );
				break;
		}

		var that = this;

		// If its an error - we show it regardless if whether or not we save the log
		if ( type == LogType.ERROR || type == LogType.SYS_ERROR )
			console.log( utils.ConsoleStyles.red[0] + message + utils.ConsoleStyles.red[1] );
		
		var now = Date.now();		
		var model = require( "./models/Model" );

		// If the model is not yet loaded, then store the messages in RAM until it is
		if ( !model.getSingleton() || !model.collections("logs") )
		{
			that.startupMessages.push( { date: now, message: message, type: type });
			return;
		}

		that.startupMessages.push( { date: now, message: message, type: type });

		if ( that.busySaving )
			return;

		function saveMessage()
		{
			that.busySaving = true;
			
			// Saves the console message to the database 
			model.collections("logs").save( that.startupMessages[0], function ( err: any, result: any )
			{
				that.busySaving = false;

				if ( err )
					console.log( utils.ConsoleStyles.red[0] + "ERROR:" + err + utils.ConsoleStyles.red[1] );
				
				//switch ( result.type )
				//{
				//	case LogType.ERROR:
				//	case LogType.SYS_ERROR:
				//		console.log( utils.ConsoleStyles.red[0] + result.message + utils.ConsoleStyles.red[1] );
				//		break;
				//	case LogType.WARNING:
				//		console.log( utils.ConsoleStyles.yellow[0] + result.message + utils.ConsoleStyles.yellow[1] );
				//		break;
				//	case LogType.ADMIN:
				//		console.log( utils.ConsoleStyles.cyan[0] + result.message + utils.ConsoleStyles.cyan[1] );
				//		break;
				//	case LogType.MESSAGE:
				//		console.log( result.message );
				//		break;
				//	case LogType.SUCCESS:
				//		console.log( utils.ConsoleStyles.green[0] + result.message + utils.ConsoleStyles.green[1] );
				//		break;
				//}

				
				if ( that.startupMessages.length > 0 )
					saveMessage();
			});

			that.startupMessages.splice( 0, 1 );
		}

		// Try to save the message
		if ( that.startupMessages && that.startupMessages.length > 0 )
			saveMessage();
	}

	/**
	* Gets the singleton logger instance
	* @returns {Logger}
	*/
	public static get singleton(): Logger
	{
		if ( !Logger._singleton )
			Logger._singleton = new Logger();

		return Logger._singleton;
	}
}

/**
* Logs a message to the console and saves the messages to the database
* @param {any} message The message to print
* @param {LogType} type The type of message to print
*/
export function log( message: any, type: LogType = LogType.MESSAGE )
{
	Logger.singleton.log( message, type );
}