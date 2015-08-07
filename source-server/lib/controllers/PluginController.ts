//import http = require( "http" );
//import BaseController = require( "./BaseController" );
//import ErrorController = require( "./ErrorController" );
//import viewJSON = require( "../views/JSONRenderer" );
//import viewJade = require( "../views/JadeRenderer" );
//import utils = require( "../Utils" );
//import Model = require( "../models/Model" );
//import modelUser = require( "../models/UserModel" );
//import modelPlugin = require( "../models/PluginModel" );
//import mongodb = require( "mongodb" );
//import UserController = require( "./UserController" );
//import logger = require( "../Logger" );
//import validator = require( "../Validator" );

///**
//* Controlls all plugin related functions
//*/
//class PluginController extends BaseController
//{
//	private static _singleton: PluginController;


//	/**
//	* Creates an instance of the Controller class
//	*/
//	constructor()
//	{
//		super();
//	}


//	/** 
//	* Called whenever we need to process 
//	*/
//	processRequest( request: http.ServerRequest, response: http.ServerResponse, functionName: string )
//	{
//		logger.log( "Processing plugin request '" + functionName + "'" );
//		var that = this;

//		this.processQueryData( function ( options: any )
//		{
//			switch ( functionName )
//			{
//				case "get-plugins":
//					return that.getPlugins( null, request, response );
//					break;
//			}

//			// Check if the user is logged in
//			var isUserLoggedIn = function ( loggedIn: boolean, user: modelUser.User )
//			{
//				// If not logged in then do nothing
//				if ( !loggedIn )
//					return new ErrorController( utils.ErrorCodes.AUTHENTICATION_REQUIRED, "Authentication is required to call this function" ).processRequest( request, response, "" );

//				// Check an admin
//				if ( user.userType != modelUser.UserType.ADMIN )
//					return new ErrorController( utils.ErrorCodes.AUTHENTICATION_REQUIRED, "Admin authentication is required to call this function" ).processRequest( request, response, "" );

//				switch ( functionName )
//				{
//					case "create":
//						that.create( options, null, request, response );
//						break;
//					case "get-plugins":
//						that.getPlugins( null, request, response );
//						break;
//					case "delete":
//						that.delete( options["id"], null, request, response );
//						break;
//					case "update":
//						that.update( options, null, request, response );
//						break;
//					case "add-deployable":
//						that.addDeployable( options["file"], options["pluginId"], null, request, response );
//						break;
//					case "remove-deployable":
//						that.removeDeployable( options["file"], options["pluginId"], null, request, response );
//						break;
//					case "print":
//						that.printPlugins( parseInt( options["limit"] ), parseInt( options["index"] ), request, response );
//						break;
//					default:
//						new ErrorController( utils.ErrorCodes.INVALID_INPUT, "No function specified" ).processRequest( request, response, functionName );
//						break;
//				}
//			}

//			UserController.singleton.loggedIn( isUserLoggedIn, request, response );
//		}, request, response );
//	}


//	/** 
//	* Deletes a plugin by ID
//	* @param {string} id The ID of the plugin
//	* @param {( result: number ) => void} callback Callback function with the model result
//	* @param {http.ServerRequest} request
//	* @param {http.ServerResponse} response
//	*/
//	public delete( id: any, callback?: ( result : number ) => void, request?: http.ServerRequest, response?: http.ServerResponse )
//	{
//		logger.log( "Deleteing plugin " + id + "...", logger.LogType.ADMIN );

//		if ( !id || id.toString().trim() == "" || !validator.isValidObjectID( id ) )
//			return new ErrorController( utils.ErrorCodes.AUTHENTICATION_REQUIRED, "You must provide a valid plugin id" ).processRequest( request, response, "" );

//		// Validation passed - create user in database
//		Model.collections( "plugins" ).remove( { _id: new mongodb.ObjectID( id.trim() ) }, function ( err: any, result: any )
//		{
//			if ( err )
//			{
//				if ( callback )
//					return callback( null );
//				else
//					return new ErrorController( utils.ErrorCodes.AUTHENTICATION_REQUIRED, err ).processRequest( request, response, "" );
//			}

//			logger.log( "Plugin deleted...", logger.LogType.SUCCESS );

//			if ( callback )
//				callback( result );
//			else
//				viewJSON.render( { message: "Plugin deleted - [" + result + "] documents affected" }, request, response, viewJSON.ReturnType.SUCCESS );
//		});
//	}


//	/** 
//	* Creates a new plugin. Only allowed users who have admin access
//	* @param {( users: modelPlugin.Plugin ) => void} callback Callback function with the plugin instance
//	* @param {http.ServerRequest} request
//	* @param {http.ServerResponse} response
//	*/
//	public create( options : any, callback?: ( project: modelPlugin.Plugin ) => void, request?: http.ServerRequest, response?: http.ServerResponse )
//	{
//		if ( !options.name || options.name.toString().trim() == "" )
//			return new ErrorController( utils.ErrorCodes.AUTHENTICATION_REQUIRED, "You must provide a plugin name" ).processRequest( request, response, "" );

//		var plugin = new modelPlugin.Plugin();
//		plugin.author = options.author || plugin.author;
//		plugin.css = options.css || plugin.css;
//		plugin.description = options.description || plugin.description;
//		plugin.image = options.image || plugin.image;
//		plugin.name = options.name || plugin.name ;
//		plugin.path = options.path || plugin.path;
//		plugin.plan = options.plan || plugin.plan;
//		plugin.shortDescription = options.shortDescription || plugin.shortDescription;
//		plugin.version = options.version || plugin.version;

//		// Validation passed - create user in database
//		Model.collections( "plugins" ).save( plugin, function ( err: any, result: modelPlugin.Plugin )
//		{
//			if ( err || !result )
//			{
//				if ( callback )
//					return callback( null );
//				else
//					return new ErrorController( utils.ErrorCodes.AUTHENTICATION_REQUIRED, err ).processRequest( request, response, "" );
//			}

//			logger.log( "Plugin created...", logger.LogType.SUCCESS );
				
//			if ( callback )
//				callback( result );
//			else
//				viewJSON.render( result, request, response, viewJSON.ReturnType.SUCCESS ); 
//		});
//	}

//	/** 
//	* Updates a new plugin. Only allowed users who have admin access
//	* @param {( users: modelPlugin.Plugin ) => void} callback Callback function with the build instance
//	* @param {http.ServerRequest} request
//	* @param {http.ServerResponse} response
//	*/
//	public update( options: any, callback?:( result: any ) => void, request?: http.ServerRequest, response?: http.ServerResponse )
//	{
//		if ( !options.id || options.id.toString().trim() == "" || !validator.isValidObjectID( options.id ) )
//			return new ErrorController( utils.ErrorCodes.INVALID_INPUT, "You must provide a valid plugin id" ).processRequest( request, response, "" );

//		var id = options["id"];
//		delete options["id"];

//		// Validation passed - create user in database
//		Model.collections( "plugins" ).update( { _id: new mongodb.ObjectID( id.trim() ) }, { $set: options }, function ( err: any, result: number )
//		{
//			if ( err )
//			{
//				if ( callback )
//					return callback( null );
//				else
//					return new ErrorController( utils.ErrorCodes.AUTHENTICATION_REQUIRED, err ).processRequest( request, response, "" );
//			}			

//			logger.log( "Plugin updated...", logger.LogType.SUCCESS );

//			if ( callback )
//				callback( result );
//			else
//				viewJSON.render( { message: "Plugin updated - [" + result +"] documents affected" }, request, response, viewJSON.ReturnType.SUCCESS );
//		});
//	}


//	/** 
//	* Adds a new file to be deployed for a plugin
//	* @param {string} file The file to add
//	* @param {string} plugin The file to add
//	* @param {( numUpdated: number  ) => void} callback Callback function with the build instance
//	* @param {http.ServerRequest} request
//	* @param {http.ServerResponse} response
//	*/
//	public addDeployable( file: string, pluginId: string, callback?: ( numUpdated: number ) => void, request?: http.ServerRequest, response?: http.ServerResponse )
//	{
//		logger.log( "Adding plugin deployable["+ file +"]...", logger.LogType.ADMIN );

//		if ( !pluginId || pluginId.toString().trim() == "" || !validator.isValidObjectID( pluginId ) )
//			return new ErrorController( utils.ErrorCodes.INVALID_INPUT, "You must provide a valid plugin id" ).processRequest( request, response, "" );
		
//		if ( !file || file.toString().trim() == "" )
//			return new ErrorController( utils.ErrorCodes.INVALID_INPUT, "You must provide a valid file" ).processRequest( request, response, "" );

//		// Validation passed - create user in database
//		Model.collections( "plugins" ).findOne( { _id: new mongodb.ObjectID( pluginId ) }, function ( err: any, plugin: modelPlugin.Plugin )
//		{
//			if ( err )
//			{
//				if ( callback )
//					return callback( 0 );
//				else
//					return new ErrorController( utils.ErrorCodes.AUTHENTICATION_REQUIRED, err ).processRequest( request, response, "" );
//			}

//			if ( !plugin )
//			{
//				if ( callback )
//					return callback( 0 );
//				else
//					return new ErrorController( utils.ErrorCodes.INVALID_INPUT, "Could not find plugin" ).processRequest( request, response, "" );
//			}

//			var updateToken : any;
//			if ( !plugin.deployables )
//				updateToken = { $set: { deployables: [file] } };
//			else
//				updateToken = { $push: { deployables: file } };

//			Model.collections( "plugins" ).update( { _id: plugin._id }, updateToken, function ( err: any, numUpdated: number )
//			{
//				logger.log( "Plugin updated - [" + numUpdated + "] documents affected", logger.LogType.SUCCESS );

//				if ( callback )
//					callback( numUpdated );
//				else
//					viewJSON.render( { message: "Plugin updated - [" + numUpdated + "] documents affected" }, request, response, viewJSON.ReturnType.SUCCESS );
//			});
//		});
//	}


//	/** 
//	* Removes a file to be deployed from a plugin
//	* @param {string} file The file to add
//	* @param {string} plugin The file to add
//	* @param {( numUpdated: number  ) => void} callback Callback function with the build instance
//	* @param {http.ServerRequest} request
//	* @param {http.ServerResponse} response
//	*/
//	public removeDeployable( file: string, pluginId: string, callback?: ( numUpdated: number ) => void, request?: http.ServerRequest, response?: http.ServerResponse )
//	{
//		logger.log( "Removing plugin deployable[" + file + "]...", logger.LogType.ADMIN );

//		if ( !pluginId || pluginId.toString().trim() == "" || !validator.isValidObjectID( pluginId ) )
//			return new ErrorController( utils.ErrorCodes.INVALID_INPUT, "You must provide a valid plugin id" ).processRequest( request, response, "" );

//		if ( !file || file.toString().trim() == "" )
//			return new ErrorController( utils.ErrorCodes.INVALID_INPUT, "You must provide a valid file" ).processRequest( request, response, "" );

//		// Validation passed - create user in database
//		Model.collections( "plugins" ).findOne( { _id: new mongodb.ObjectID( pluginId ) }, function ( err: any, plugin: modelPlugin.Plugin )
//		{
//			if ( err )
//			{
//				if ( callback )
//					return callback( 0 );
//				else
//					return new ErrorController( utils.ErrorCodes.AUTHENTICATION_REQUIRED, err ).processRequest( request, response, "" );
//			}

//			if ( !plugin )
//			{
//				if ( callback )
//					return callback( 0 );
//				else
//					return new ErrorController( utils.ErrorCodes.INVALID_INPUT, "Could not find plugin" ).processRequest( request, response, "" );
//			}

			
//			if ( !plugin.deployables )
//			{
//				if ( callback )
//					return callback( 0 );
//				else
//					return viewJSON.render( { message: "No deployables found" }, request, response, viewJSON.ReturnType.SUCCESS );
//			}
		
//			var updateToken = { $pull: { deployables: file } };

//			Model.collections( "plugins" ).update( { _id: plugin._id }, updateToken, function ( err: any, numUpdated: number )
//			{
//				logger.log( "Plugin updated - [" + numUpdated + "] documents affected", logger.LogType.SUCCESS );

//				if ( callback )
//					callback( numUpdated );
//				else
//					viewJSON.render( { message: "Plugin updated - [" + numUpdated + "] documents affected" }, request, response, viewJSON.ReturnType.SUCCESS );
//			});
//		});
//	}


//	/** 
//	* Prints the plugins currently stored in the database
//	* @param {number} limit The number of builds to fetch
//	* @param {number} startIndex The starting index from where we are fetching builds from
//	* @param {http.ServerRequest} request 
//	* @param {http.ServerResponse} response
//	*/
//	printPlugins( limit: number = 0, startIndex: number = 0, request?: http.ServerRequest, response?: http.ServerResponse )
//	{
//		logger.log( "Printing plugins..." );
//		var that = this;

//		Model.collections( "plugins" ).find( {}, {}, startIndex, limit, function ( err: any, result: mongodb.Cursor )
//		{
//			result.toArray( function ( err: any, plugins: Array<modelPlugin.Plugin> )
//			{
//				return viewJade.render( __dirname + "/../views/admin/plugins/print.jade", { plugins: plugins }, response );
//			});
//		});
//	}


//	/** 
//	* Fetches an array of plugins
//	* @param {( plugins: Array<modelPlugin.Plugin>) => void} callback The function to call when plugins have been collated
//	* @param {http.ServerRequest} request 
//	* @param {http.ServerResponse} response
//	*/
//	getPlugins( callback: ( plugins: Array<modelPlugin.Plugin>) => void, request?: http.ServerRequest, response?: http.ServerResponse )
//	{
//		Model.collections( "plugins" ).find( {}, {}, 0, 0, function ( err: any, result: mongodb.Cursor )
//		{
//			result.toArray( function ( err: any, plugins: Array<modelPlugin.Plugin> )
//			{
//				if ( callback )
//					callback( plugins );
//				else
//					return viewJSON.render( { plugins: plugins }, request, response, viewJSON.ReturnType.SUCCESS );
//			});
//		});
//	}


//	/**
//	* Gets an instance of the plugin controller
//	* @returns {PluginController}
//	*/
//	static get singleton(): PluginController
//	{
//		if ( !PluginController._singleton )
//			PluginController._singleton = new PluginController();

//		return PluginController._singleton;
//	}
//}


//export = PluginController;


import * as mongodb from "mongodb";
import * as express from "express";
import * as bodyParser from "body-parser";
import {Controller, IServer, IConfig, IResponse} from "modepress-api";
import {IGetPlugins} from "modepress-engine";
import {PluginModel} from "../models/PluginModel";
import {IPlugin} from "engine";

/**
* A controller that deals with plugin models
*/
export class PluginController extends Controller
{
	/**
	* Creates a new instance of the email controller
	* @param {IServer} server The server configuration options
    * @param {IConfig} config The configuration options
    * @param {express.Express} e The express instance of this server	
	*/
    constructor(server: IServer, config: IConfig, e: express.Express)
    {
        super([new PluginModel()]);

        var router = express.Router();
        router.use(bodyParser.urlencoded({ 'extended': true }));
        router.use(bodyParser.json());
        router.use(bodyParser.json({ type: 'application/vnd.api+json' }));

        router.get("/:id?", <any>[this.getPlugins.bind(this)]);

        // Register the path
        e.use("/plugins", router);
    }

    /**
    * Gets plugins based on the format of the request
    * @param {express.Request} req 
    * @param {express.Response} res
    * @param {Function} next 
    */
    private getPlugins(req: express.Request, res: express.Response, next: Function)
    {
        res.setHeader('Content-Type', 'application/json');
        var plugins = this.getModel("plugins");
        var that = this;
        var count = 0;

        var findToken = {};

        var getContent: boolean = true;
        if (req.query.minimal)
            getContent = false;

        // Check for keywords
        if (req.query.search)
            (<IPlugin>findToken).name = <any>new RegExp(req.query.search, "i");
        
        // First get the count
        plugins.count(findToken).then(function (num)
        {
            count = num;
            return plugins.findInstances(findToken, [], parseInt(req.query.index), parseInt(req.query.limit), (getContent == false ? { html: 0 } : undefined));

        }).then(function (instances)
        {
            var sanitizedData: Array<IPlugin> = that.getSanitizedData<IPlugin>(instances, Boolean(req.query.verbose));
            res.end(JSON.stringify(<IGetPlugins>{
                error: false,
                count: count,
                message: `Found ${count} plugins`,
                data: sanitizedData
            }));

        }).catch(function (error: Error)
        {
            res.end(JSON.stringify(<IResponse>{
                error: true,
                message: error.message
            }));
        });
    }
}