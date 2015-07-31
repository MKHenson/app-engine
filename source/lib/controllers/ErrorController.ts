import http = require( "http" );
import BaseController = require( "./BaseController" );
import utils = require( "../Utils" );
import viewJSON = require( "../views/JSONRenderer" );
import logger = require( "../Logger" );

/**
* Controlls all error reporting
*/
class ErrorController extends BaseController
{
	public code: utils.ErrorCodes;
	public message: string;
	public token: any;

	/**
	* Creates an instance of the Controller class
	*/
	constructor( code: utils.ErrorCodes, message : string )
	{
		super();
		this.code = code;
		this.message = message;
		this.token = {
			message: this.message,
			errorCode: this.code.toString()
		};
	}

	/** 
	* Called whenever we need to process 
	*/
	processRequest( request: http.ServerRequest, response: http.ServerResponse, functionName: string )
	{
		logger.log( this.token.message, logger.LogType.ERROR );
		viewJSON.render( this.token, request, response, viewJSON.ReturnType.ERROR );
	}
}

export = ErrorController;