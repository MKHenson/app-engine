import fs = require( "fs" );

declare function unescape( s: string ): string;

export enum RenderType
{
	HTML,
	JSON
}

export enum ErrorCodes
{
	NO_EXTENSION,
	BAD_QUERY,
	COMMAND_UNRECOGNISED,
	INVALID_CAPTCHA,
	INVALID_OPTION,
	INVALID_INPUT,
	BAD_METHOD,
	USER_BAD_EMAIL,
	AUTHENTICATION_REQUIRED,
	INSUFFICIENT_ACCESS,
	UPGRADE_PLAN,
	DATABASE_ERROR
}

/**
* Gets an instance of the export controller
* @param {string} path The directory path to remove
*/
export function deleteFolderRecursive( path : string )
{
	var that = this;
	var files = [];
	if ( fs.existsSync( path ) )
	{
		files = fs.readdirSync( path );
		files.forEach( function ( file, index )
		{
			var curPath = path + "/" + file;
			if ( fs.lstatSync( curPath ).isDirectory() )
			{
				// recurse
				that.deleteFolderRecursive( curPath );
			}
			else
			{
				// delete file
				fs.unlinkSync( curPath );
			}
		});
		fs.rmdirSync( path );
	}
}

export function toBool( str: string ): any
{
	if ( str === undefined )
		return undefined;

	if ( str.toString() == "true" )
		return true;
	else
		return false;
}

export class serverCommands
{
	static EXIT: string = "exit";
	static CLEAR: string = "clear";
	static HELP: string = "help";
}

export class urlControllers
{
	static USER: string = "user";
	static PROJECT: string = "project";
	static BUILD: string = "build";
	static PLUGIN: string = "plugin";
	static MISC: string = "misc";
	static FILE: string = "file";
	static EXPORT: string = "export";
}

export class ConsoleStyles
{
	//styles
	static bold: Array<string> = ['\x1B[1m', '\x1B[22m'];
	static italic: Array<string> = ['\x1B[3m', '\x1B[23m'];
	static underline: Array<string> = ['\x1B[4m', '\x1B[24m'];
	static inverse: Array<string> = ['\x1B[7m', '\x1B[27m'];
	static strikethrough: Array<string> = ['\x1B[9m', '\x1B[29m'];
	
	//text colors
	static white: Array<string> = ['\x1B[37m', '\x1B[39m'];
	static grey: Array<string> = ['\x1B[90m', '\x1B[39m'];
	static black: Array<string> = ['\x1B[30m', '\x1B[39m'];
	static blue: Array<string> = ['\x1B[34m', '\x1B[39m'];
	static cyan: Array<string> = ['\x1B[36m', '\x1B[39m'];
	static green: Array<string> = ['\x1B[32m', '\x1B[39m'];
	static magenta: Array<string> = ['\x1B[35m', '\x1B[39m'];
	static red: Array<string> = ['\x1B[31m', '\x1B[39m'];
	static yellow: Array<string> = ['\x1B[33m', '\x1B[39m'];

	//background colors
	static whiteBG: Array<string> = ['\x1B[47m', '\x1B[49m'];
	static greyBG: Array<string> = ['\x1B[49;5;8m', '\x1B[49m'];
	static blackBG: Array<string> = ['\x1B[40m', '\x1B[49m'];
	static blueBG: Array<string> = ['\x1B[44m', '\x1B[49m'];
	static cyanBG: Array<string> = ['\x1B[46m', '\x1B[49m'];
	static greenBG: Array<string> = ['\x1B[42m', '\x1B[49m'];
	static magentaBG: Array<string> = ['\x1B[45m', '\x1B[49m'];
	static redBG: Array<string> = ['\x1B[41m', '\x1B[49m'];
	static yellowBG: Array<string> = ['\x1B[43m', '\x1B[49m'];
}

/**
* Parses a request object to get the cookie into an object of key value pairs
*/
export function parseCookies( request : any ) : any
{
	var list = {},
		rc = request.headers.cookie;

	rc && rc.split( ';' ).forEach( function ( cookie )
	{
		var parts = cookie.split( '=' );
		list[parts.shift().trim()] = unescape( parts.join( '=' ) );
	});

	return list;
}

/**
* Sets an object of key value pairs to the response cookie. You must call this before you end the response
*/
export function setCookies( data : any, response: any ): any
{
	var cookieString: string = "";
	for ( var i in data )
		cookieString += i + "=" + data[i].toString() + ";";

	// To Write a Cookie
	response.writeHead( 200, {
		'Set-Cookie': 'mycookie=test',
		'Content-Type': 'text/plain'
	});
}

export var config = {
	host: "",
	version: "trunk",
	port: 0,
	database_port: 0,
	privateKey: "",
	config: "",
	sslPassPhrase: "",
	ca: "",
	secure: undefined,
	certificate: undefined
}