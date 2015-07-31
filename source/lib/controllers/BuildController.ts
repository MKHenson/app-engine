import http = require( "http" );
import BaseController = require( "./BaseController" );
import ErrorController = require( "./ErrorController" );
import ProjectController = require( "./ProjectController" );
import viewJSON = require( "../views/JSONRenderer" );
import viewJade = require( "../views/JadeRenderer" );
import viewHTML = require( "../views/HTMLRenderer" );
import utils = require( "../Utils" );
import Model = require( "../models/Model" );
import userModel = require( "../models/UserModel" );
import projectModel = require( "../models/ProjectModel" );
import buildModel = require( "../models/BuildModel" );
import mongodb = require( "mongodb" );
import UserController = require( "./UserController" );
import logger = require( "../Logger" );
import validator = require( "../Validator" );

/**
* Controlls all project related functions
*/
class BuildController extends BaseController
{
	private static _singleton: BuildController;


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

		this.processQueryData( function ( options: any )
		{
			logger.log( "Processing build request '" + functionName + "'" );

			switch ( functionName )
			{
				case "create-build":
					that.createBuild( null, request, response );
					break;
				case "print-builds":
					that.printBuilds( parseInt( options["limit"] ), parseInt( options["index"] ), request, response );
					break;
				case "execute":
					that.execute( options["buildId"], options["token"], request, response );
					break;
				default:
					new ErrorController( utils.ErrorCodes.INVALID_INPUT, "No function specified" ).processRequest( request, response, functionName );
					break;
			}
		}, request, response );
	}


	/** 
	* Creates a new Project for the user that is currently logged in.
	* @param {( users: buildModel.Build ) => void} callback Callback function with the build instance
	* @param {http.ServerRequest} request
	* @param {http.ServerResponse} response
	*/
	public createBuild( callback?:( project: buildModel.Build ) => void, request?: http.ServerRequest, response?: http.ServerResponse )
	{
		// Check if the user is logged in
		var isUserLoggedIn = function( loggedIn: boolean, user: userModel.User )
		{
			logger.log( "Creating a new build...", logger.LogType.ADMIN );

			// If not logged in then do nothing
			if ( !loggedIn )
				return new ErrorController( utils.ErrorCodes.AUTHENTICATION_REQUIRED, "Authentication is required to call this function" ).processRequest( request, response, "" );

			var build = new buildModel.Build();

			// Validation passed - create user in database
			Model.collections("builds").save( build, function ( err: any, result: buildModel.Build )
			{
				if ( err || !result )
				{
					if ( callback )
						return callback( null );
					else
						return new ErrorController( utils.ErrorCodes.AUTHENTICATION_REQUIRED, err ).processRequest( request, response, "" );
				}

				logger.log( "Build created...", logger.LogType.SUCCESS );				
				
				if ( callback )
					callback( result );
				else
					viewJSON.render( result, request, response, viewJSON.ReturnType.SUCCESS ); 
			});			
		};

		UserController.singleton.loggedIn( isUserLoggedIn, request, response );
	}


	/** 
	* Executes the build based on the URL and token provided
	* @param {string} buildId The id of the build we want to run
	* @param {string} token The token key for viewing the content
	* @param {http.ServerRequest} request
	* @param {http.ServerResponse} response
	*/
	execute( buildId: string, token: string, request?: http.ServerRequest, response?: http.ServerResponse )
	{
		var that = this;

		if ( !buildId || !token || !validator.isValidObjectID( buildId ) )
			return viewJade.render( __dirname + "/../views/messages/error.jade", { message: "Invalid input" }, response );

		logger.log( "Executing build " + buildId + "...", logger.LogType.ADMIN );

		UserController.singleton.loggedIn( function ( loggedIn: boolean, user: userModel.User )
		{
			Model.collections( "builds" ).findOne( { _id: new mongodb.ObjectID(buildId) }, function ( err: any, build: buildModel.Build )
			{
				if ( err )
					return viewJade.render( __dirname + "/../views/messages/error.jade", { message: "A database error has occurred" }, response );
						
				if ( !build )
					return viewJade.render( __dirname + "/../views/messages/error.jade", { message: "Could not find build" }, response );

				if ( build.liveToken != token )
					return viewJade.render( __dirname + "/../views/messages/error.jade", { message: "Invalid token" }, response );

				function render()
				{
					logger.log( "Valid build (" + buildId + ") execute request - updating token..." );

					// All seems good - update the database token
					Model.collections( "builds" ).update( { _id: build._id }, { $set: { liveToken: buildModel.Build.generateToken( 7 ) } }, function ( err: any, numAffected: number )
					{
						logger.log( "Build " + buildId + " has been executed", logger.LogType.SUCCESS );

						return new viewHTML().renderString( build.liveHTML, response );
					});
				}

				// Not logged and private, do nothing
				if ( loggedIn == false && build.visibility == buildModel.BUILD_VISIBILITY.PRIVATE )				
					return viewJade.render( __dirname + "/../views/messages/error.jade", { message: "Build is not public" }, response );
							
				// logged and private - so check if they can see it
				else if ( loggedIn && build.visibility == buildModel.BUILD_VISIBILITY.PRIVATE )
				{
					var projectController: ProjectController = require( "./ProjectController" ).singleton;
					projectController.checkPrivileges( user._id.toString(), build.projectId.toString(), projectModel.PrivilegeType.READ, function ( hasRights: boolean )
					{
						if ( hasRights )
							render();
						else
							return viewJade.render( __dirname + "/../views/messages/error.jade", { message: "You do not have permission to view this build" }, response );

					}, request, response );
				}
				// Public 
				else
					render();				
						
			});

		}, request, response );
	}


	/** 
	* Prints the builds currently stored in the database
	* @param {number} limit The number of builds to fetch
	* @param {number} startIndex The starting index from where we are fetching builds from
	* @param {http.ServerRequest} request 
	* @param {http.ServerResponse} response
	*/
	printBuilds( limit: number = 0, startIndex: number = 0, request?: http.ServerRequest, response?: http.ServerResponse )
	{
		logger.log( "Printing builds...", logger.LogType.ADMIN );
		var that = this;

		UserController.singleton.loggedIn( function ( val, user: userModel.User )
		{
			if ( !user || user.userType != userModel.UserType.ADMIN )
				return viewJade.render( __dirname + "/../views/messages/error.jade", { message: "You do not have permissions to view this content" }, response );

			Model.collections( "builds" ).find( {}, {}, startIndex, limit, function ( err: any, result: mongodb.Cursor )
			{
				result.toArray( function ( err: any, builds: Array<buildModel.Build> )
				{
					return viewJade.render( __dirname + "/../views/admin/builds/print.jade", { builds: builds }, response );
				});
			});

		}, request, response );
	}


	/**
	* Gets an instance of the project controller
	* @returns {ProjectController}
	*/
	static get singleton(): BuildController
	{
		if ( !BuildController._singleton )
			BuildController._singleton = new BuildController();

		return BuildController._singleton;
	}
}


export = BuildController;