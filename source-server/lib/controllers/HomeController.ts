import http = require( "http" );
import path = require( "path" );
import BaseController = require("./BaseController");
import ErrorController = require( "./ErrorController" );
import UserController = require( "./UserController" );
import ProjectController = require( "./ProjectController" );
import BuildController = require( "./BuildController" );
import PluginController = require( "./PluginController" );
import ExportController = require( "./ExportController" );
import FileController = require( "./FileController" );
import MiscController = require( "./MiscController" );
import utils = require( "../Utils" );
import session = require( "../session/Session" );
import logger = require( "../Logger" );

/**
* The main router controller. This will delegate the creation of all subsequent requests.
*/
export class HomeController extends BaseController
{
	private static _singleton: HomeController;

	/**
	* Creates an instance of the Controller class
	*/
	constructor()
	{
		super();
	}


	/** 
	* Called whenever we need to process 
	*/
	processRequest( request: http.ServerRequest, response: http.ServerResponse, functionName?: string )
	{
		var urlCommands: string = request.url.substr( 1, request.url.length - 1 ); 
		urlCommands = urlCommands.split( "?" )[0];

		var urlParts: Array<string> = urlCommands.split( "/" );
		
		logger.log( "Processing request '" + request.url.substr( 1, request.url.length - 1 ) + "'..." );
		
		
		if ( !urlParts[0] || urlParts[0] == "" )
			this.processCommand( "", "", request, response );
		else if ( urlParts.length == 1 )
			this.processCommand( urlParts[0], "", request, response );
		else
			this.processCommand( urlParts[0], urlParts[1], request, response );
	}


	/**
	* The request being made to Animate seems to be an API command. Try to process it.
	*/
	processCommand( command: string, func: string, request: http.ServerRequest, response: http.ServerResponse )
	{
		var controller: BaseController = null;

		logger.log( "[" + command + "] : "+ func +"..." );

		if ( !command || command == "" )
			controller = new ErrorController( utils.ErrorCodes.BAD_QUERY, "No command specified" );
		else if ( !func || func == "" )
			controller = new ErrorController( utils.ErrorCodes.BAD_QUERY, "No function specified" );
		else
		{
			switch ( command )
			{
				// Create the controller based on what represents the first part of the URL
				case utils.urlControllers.USER:
					controller = UserController.singleton;
					break;
				case utils.urlControllers.PROJECT:
					controller = ProjectController.singleton;
					break;
				case utils.urlControllers.BUILD:
					controller = BuildController.singleton;
					break;
				case utils.urlControllers.PLUGIN:
					//controller = PluginController.singleton;
					break;
				case utils.urlControllers.MISC:
					controller = MiscController.singleton;
					break;
				case utils.urlControllers.FILE:
					controller = FileController.singleton;
					break;
				case utils.urlControllers.EXPORT:
					controller = ExportController.singleton;
					break;
			}
		}

		if ( !controller )
			controller = new ErrorController( utils.ErrorCodes.COMMAND_UNRECOGNISED, "The command was not recognised" );

		// Process the response
		controller.commandOptions = this.commandOptions;
		controller.processRequest( request, response, func );
		controller.commandOptions = null;
	}


	/**
	* Gets an instance of the user controller
	* @returns {HomeController}
	*/
	static get singleton(): HomeController
	{
		if ( !HomeController._singleton )
			HomeController._singleton = new HomeController();

		return HomeController._singleton;
	}
}