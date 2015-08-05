import http = require( "http" );
import path = require( "path" );
import fs = require( "fs" ); 
import utils = require( "../Utils" ); 
import jade = require( "jade" );


/** 
* Renders a jade file
* @param {string} path The path the jade file
* @param {any} jadeOptions Pass in an options object that can be potentially used by jade templates
*/
export function render( path: string, jadeOptions: any, response: http.ServerResponse )
{
	var str: string = fs.readFileSync( path, { encoding:'utf8' } );
	var fn = jade.compile( str, { filename: path, pretty: true });

	// Set some of the common options
	jadeOptions.host = "//" + utils.config.host + ":" + utils.config.port;
	jadeOptions.version = utils.config.version;

	var html: string = fn( jadeOptions );
	
	if ( response )
	{
		response.setHeader( "Content-Length", html.length.toString() );
		response.setHeader( "Content-Type", "text/html" );
		response.statusCode = 200;
		response.end( html );
	}
	else
		console.log( utils.ConsoleStyles.yellow[0] + html + utils.ConsoleStyles.yellow[1] );
	return;
}