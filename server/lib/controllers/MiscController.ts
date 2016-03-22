import http = require( "http" );
import BaseController = require( "./BaseController" );
import ErrorController = require( "./ErrorController" );
import viewJSON = require( "../views/JSONRenderer" );
import utils = require( "../Utils" );
import logger = require( "../Logger" );

/**
* Controlls all miscellaneous related functions
*/
class MiscController extends BaseController
{
	private static _singleton: MiscController;


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
	processRequest( request: http.ServerRequest, response: http.ServerResponse, functionName: string )
	{
		var that = this;

		logger.log( "Processing misc request '" + functionName + "'" );
		this.processQueryData( function ( options: any )
		{
			switch ( functionName )
			{
				case "get-news-tab":
					return that.getNewsTab( request, response );
				default:
					new ErrorController( utils.ErrorCodes.INVALID_INPUT, "No function specified" ).processRequest( request, response, functionName );
					break;
			}
		}, request, response );
	}


	/**
	* Fetches the Iframe HTML for displaying news in Animate
	* @param {http.ServerRequest} request
	* @param {http.ServerResponse} response
	*/
	public getNewsTab( request?: http.ServerRequest, response?: http.ServerResponse )
	{
		viewJSON.render( { message: "News loaded", "html" : "<iframe src='https://webinate.net/tutorials-minimal/'></iframe>" }, request, response, viewJSON.ReturnType.SUCCESS );
	}


	/**
	* Gets an instance of the controller
	* @returns {MiscController}
	*/
	static get singleton(): MiscController
	{
		if ( !MiscController._singleton )
			MiscController._singleton = new MiscController();

		return MiscController._singleton;
	}
}


export = MiscController;