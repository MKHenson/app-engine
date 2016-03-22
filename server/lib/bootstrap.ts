// Imports
import utils = require( "./Utils" );
import server = require( "./Server" );
import fs = require( "fs" );

var createServer: boolean = true;
var host: string = "";
var port: number = 0;
var dbport: number = 0;


var options = {};
for ( var i = 2, l = process.argv.length; i < l; i++ )
{
	var split : Array<string> = process.argv[i].split( ":" );
	if ( split.length == 1 )
	{
		console.log( utils.ConsoleStyles.red[0] + "Invalid syntax for command '" + split[0] +"'" + utils.ConsoleStyles.red[1] );
		process.exit();
	}

	if ( split[0].trim() == "" || split[1].trim() == "" )
	{
		console.log( utils.ConsoleStyles.red[0] + "Invalid syntax for command '" + split[0] + "'" + utils.ConsoleStyles.red[1] );
		process.exit();
	}

	options[split[0]] = split[1];
}

//if ( process.argv.length < 5 )
//{
//	console.log( utils.ConsoleStyles.red[0] + "You need to pass in the IP, server port and database port command line arguements" + utils.ConsoleStyles.red[1] );
//	console.log( utils.ConsoleStyles.red[0] + "Eg. node Bootstrap.js 127.0.0.1 7000 8000" + utils.ConsoleStyles.red[1] );
//	process.exit();
//	createServer = false;
//}

if ( !options["host"] || options["host"].trim() == "" )
{
	console.log( utils.ConsoleStyles.red[0] + "Please specify a host" + utils.ConsoleStyles.red[1] );
	process.exit();
}

if ( !options["portHttp"] || options["portHttp"].trim() == "" )
{
	console.log( utils.ConsoleStyles.red[0] + "Please specify a listening port for http requests using the portHttp option" + utils.ConsoleStyles.red[1] );
	process.exit();
}

if ( !options["portDb"] || options["portDb"].trim() == "" )
{
	console.log( utils.ConsoleStyles.red[0] + "Please specify a listening port for database requests using the portDB option" + utils.ConsoleStyles.red[1] );
	process.exit();
}

host = options["host"];
port = parseInt( options["portHttp"] );
dbport = parseInt( options["portDb"] );

// Setup universal constants
utils.config.host = host;
utils.config.port = port;
utils.config.database_port = dbport;
utils.config.privateKey = options["privateKey"];
utils.config.certificate = options["certificate"];
utils.config.ca = options["ca"];
utils.config.secure = options["secure"];

utils.config.version = options["version"] || "trunk";

// Check if the private key and certificate are provided. If so, then load them in
if ( utils.config.privateKey && !fs.existsSync( utils.config.privateKey ) )
{
	console.log( utils.ConsoleStyles.red[0] + "Cannot find the private key file '" + utils.config.privateKey + "'" + utils.ConsoleStyles.red[1] );
	process.exit();
}

if ( utils.config.certificate && !fs.existsSync( utils.config.certificate ) )
{
	console.log( utils.ConsoleStyles.red[0] + "Cannot find the certificate file '" + utils.config.certificate + "'" + utils.ConsoleStyles.red[1] );
	process.exit();
}

if ( utils.config.ca && !fs.existsSync( utils.config.ca ) )
{
	console.log( utils.ConsoleStyles.red[0] + "Cannot find the ca file '" + utils.config.ca + "'" + utils.ConsoleStyles.red[1] );
	process.exit();
}


utils.config.privateKey = fs.readFileSync( utils.config.privateKey ).toString();
utils.config.certificate = fs.readFileSync( utils.config.certificate ).toString();
utils.config.ca = fs.readFileSync( utils.config.ca ).toString();
utils.config.sslPassPhrase = options["sslPassPhrase"];


if ( createServer )
	var s: server.Server = new server.Server( port, host, dbport ); 