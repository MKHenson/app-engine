import http = require( "http" );
import querystring = require( "querystring" );
import logger = require( "../Logger" );
import url = require( "url" );

/**
* Base interface for all controllers
*/
class BaseController
{
	public commandOptions: any;

	constructor()
	{
		this.commandOptions = null;
	}

	/** 
	* Called whenever we need to process a request
	*/
	processRequest( request: http.ServerRequest, response: http.ServerResponse, functionName: string )
	{
		throw "Must be imlpemented";
	}


	/** 
	* Call this function to extract  GET variables from a client request
	* @param {( options: any ) => void} callback The function to call once data has been processed
	* @param {http.ServerResponse} response 
	* @returns {boolean} Returns true if the request was handled
	*/
	processGETData( callback: ( options: any ) => void, request: http.ServerRequest, response: http.ServerResponse )
	{
		if ( this.commandOptions )
			return callback( this.commandOptions );

		callback( url.parse( request.url, true ).query );
	}

	/** 
	* Call this function to extract  POST variables from a client request
	* @param {( options: any ) => void} callback The function to call once data has been processed
	* @param {http.ServerResponse} response 
	* @returns {boolean} Returns true if the request was handled
	*/
	processPOSTData( callback: ( options: any ) => void, request: http.ServerRequest, response: http.ServerResponse )
	{
		var queryData: string = "";

		request.on( 'data', function ( data: string )
		{
			queryData += data;

			// People can try to break your server by using huge query URLS. This
			// checks for that.
			if ( queryData.length > 1e6 )
			{
				logger.log( "Connection closed - URL too long", logger.LogType.ERROR );
				queryData = "";
				response.writeHead( 413, { 'Content-Type': 'text/plain' });
				response.end();
				request.connection.destroy();
			}
		});

		// Called when the request is fully downloaded.
		request.on( 'end', function ()
		{
			callback( querystring.parse( queryData ) );
		});
	}


	/** 
	* Call this function to extract  POST or GET variables from a client request
	* @param {( options: any ) => void} callback The function to call once data has been processed
	* @param {http.ServerResponse} response 
	* @returns {boolean} Returns true if the request was handled
	*/
	processQueryData( callback:( options: any ) => void, request: http.ServerRequest, response: http.ServerResponse )
	{
		if ( this.commandOptions )
			return callback( this.commandOptions );

		if ( request.method == "POST" )
			this.processPOSTData( callback, request, response );
		else if ( request.method == 'GET' )
			this.processGETData( callback, request, response );
	}
}

export = BaseController;