import http = require( "http" );
import BaseController = require( "./BaseController" );
import ErrorController = require( "./ErrorController" );
import viewJSON = require( "../views/JSONRenderer" );
import viewJade = require( "../views/JadeRenderer" );
import utils = require( "../Utils" );
import validator = require( "../Validator" );
import Model = require( "../models/Model" );
import userModel = require( "../models/UserModel" );
import projectModel = require( "../models/ProjectModel" );
import behaviourModel = require( "../models/BehaviourModel" );
import assetModel = require( "../models/AssetModel" );
import groupModel = require( "../models/GroupModel" );
import fileModel = require( "../models/FileModel" );
import buildModel = require( "../models/BuildModel" );
import scriptModel = require( "../models/ScriptModel" );
import mongodb = require( "mongodb" );
import UserController = require( "./UserController" );
import BuildController = require( "./BuildController" );
import logger = require( "../Logger" );
import sanitizeHtml = require( "sanitize-html" );
import fs = require( "fs" );

/**
* Controlls all project related functions
*/
class ProjectController extends BaseController
{
	private static _singleton: ProjectController;


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
		logger.log( "Processing project request '" + functionName + "'");

		this.processQueryData( function ( options: any )
		{
			switch ( functionName )
			{
				case "rename":
					var tags: Array<string> = ( typeof ( options["tags[]"] ) == "string" ? [options["tags[]"]] : options["tags[]"] );
					that.rename( options["name"], options["description"], tags, options["cat"], options["subCat"], options["visibility"], options["projectId"], null, request, response );
					break;
				case "rename-object":
					that.renameObject( options["name"], options["objectId"], options["type"], options["projectId"], null, request, response );
					break;
				case "select-build":
					that.selectBuild( options["major"], options["mid"], options["minor"], options["projectId"], null, request, response );
					break;
				case "get-user-projects":
					that.getUserProjects( options["limit"], options["index"], null, request, response );
					break;
				case "print":
					that.print( parseInt( options["limit"] ), parseInt( options["index"] ), request, response );
					break;

				case "print-groups":
					that.printGeneric( "groups", __dirname + "/../views/admin/projects/print-groups.jade", parseInt( options["limit"] ), parseInt( options["index"] ), request, response );
					break;
				case "print-files":
					that.printGeneric( "files", __dirname + "/../views/admin/projects/print-files.jade", parseInt( options["limit"] ), parseInt( options["index"] ), request, response );
					break;
				case "get-files":
					that.getFiles( options["projectId"], options["mode"], null, request, response );
					break;
				case "save-file":
					var tags: Array<string> = ( typeof ( options["tags[]"] ) == "string" ? [options["tags[]"]] : options["tags[]"] );

					that.saveFile( options["projectId"], options["fileId"], options["name"], tags, utils.toBool( options["favourite"] ), utils.toBool( options["global"] ), null, request, response );
					break;
				case "import-files":
					var ids: Array<string> = ( typeof ( options["ids[]"] ) == "string" ? [options["ids[]"]] : options["ids[]"] );

					that.importFiles( options["projectId"], ids, null, request, response );
					break;
				case "print-builds":
					that.printGeneric( "builds", __dirname + "/../views/admin/projects/print-builds.jade", parseInt( options["limit"] ), parseInt( options["index"] ), request, response );
					break;
				case "print-assets":
					that.printGeneric( "assets", __dirname + "/../views/admin/projects/print-assets.jade", parseInt( options["limit"] ), parseInt( options["index"] ), request, response );
					break;
				case "print-behaviours":
					that.printGeneric( "behaviours", __dirname + "/../views/admin/projects/print-behaviours.jade", parseInt( options["limit"] ), parseInt( options["index"] ), request, response );
					break;
				case "print-scripts":
					that.printGeneric( "scripts", __dirname + "/../views/admin/projects/print-scripts.jade", parseInt( options["limit"] ), parseInt( options["index"] ), request, response );
					break;
				case "create":
					that.createProject( options["name"], options["description"], null, request, response );
					break;
				case "implement-plugins":
					that.implementPlugins( options["projectId"], ( options["plugins[]"] instanceof Array ? options["plugins[]"] : [options["plugins[]"]] ), request, response );
					break;
				case "delete":
					that.deleteProject( options["id"], null, request, response );
					break;
				case "check-user-privileges":
					that.checkPrivileges( options["userId"], options["projectId"], parseFloat( options["access"] ), null, request, response );
					break;
				case "set-users-access":
					var ids: Array<string> = ( typeof ( options["ids[]"] ) == "string" ? [options["ids[]"]] : options["ids[]"] );
					var access: Array<string> = ( typeof ( options["access[]"] ) == "string" ? [options["access[]"]] : options["access[]"] );
					var accessNum: Array<projectModel.PrivilegeType> = [];
					for ( var i = 0, l = access.length; i < l; i++ )
						accessNum.push( parseInt( access[i] ) );

					that.setPrivileges( ids, accessNum, options["projectId"], null, request, response );
					break;
				case "set-user-access":
					that.setPrivileges( [options["userId"]], [options["access"]], options["projectId"], null, request, response );
					break;
				case "get-user-privileges":
					that.getUserPrivileges( parseInt( options["index"] ), parseInt( options["limit"] ), options["projectId"], null, request, response );
					break;
				case "get-behaviours":
					that.getBehaviours( options["projectId"], null, request, response );
					break;
				case "get-assets":
					that.getAssets( options["projectId"], null, request, response );
					break;
				case "get-groups":
					that.getProjectGroups( options["projectId"], null, request, response );
					break;
				case "delete-groups":
				case "delete-behaviours":
				case "delete-assets":
					var ids: Array<string> = ( typeof ( options["ids[]"] ) == "string" ? [options["ids[]"]] : options["ids[]"] );

					if ( functionName == "delete-groups" )
						that.deleteProjectObjects( "groups", options["projectId"], ids, null, request, response );
					if ( functionName == "delete-assets" )
						that.deleteProjectObjects( "assets", options["projectId"], ids, null, request, response );
					else if ( functionName == "delete-behaviours" )
						that.deleteBehaviours( options["projectId"], ids, null, request, response );

					break;
				case "delete-scripts":
					var idsStr: Array<string> = ( typeof ( options["ids[]"] ) == "string" ? [options["ids[]"]] : options["ids[]"] );
					var localIds: Array<number> = [];
					for ( var i = 0, l = idsStr.length; i < l; i++ )
						localIds.push( parseInt( idsStr[i] ) );

					that.deleteScripts( options["projectId"], localIds, null, request, response );
					break;
				case "delete-files":
					var ids: Array<string> = ( typeof ( options["ids[]"] ) == "string" ? [options["ids[]"]] : options["ids[]"] );
					that.deleteFiles( options["projectId"], ids, null, request, response );
					break;
				case "save-groups":
				case "save-behaviours":
				case "save-assets":
					var ids: Array<string> = ( typeof ( options["ids[]"] ) == "string" ? [options["ids[]"]] : options["ids[]"] );
					var datums: Array<string> = ( typeof ( options["data[]"] ) == "string" ? [options["data[]"]] : options["data[]"] );

					if ( !ids || !datums )
					{
						new ErrorController( utils.ErrorCodes.INVALID_INPUT, "No ids or datums for " + functionName ).processRequest( request, response, functionName );
						break;
					}

					var queries: Array<any> = [];
					for ( var i = 0, l = datums.length; i < l; i++ )
						queries.push( { $set: { json: JSON.parse( datums[i] ) } });

					var collection: string = null;
					if ( functionName == "save-groups" )
						collection = "groups";
					else if ( functionName == "save-behaviours" )
						collection = "behaviours";
					else
						collection = "assets";

					that.saveData( collection, options["projectId"], ids, queries, null, request, response );
					break;
				case "save-build":
					that.saveBuild( options["projectId"], options["buildId"], options["notes"], options["visibility"], options["html"], options["css"], null, request, response );
					break;
				case "save-html":
					that.saveHTML( options["projectId"], options["html"], null, request, response );
					break;
				case "save-css":
					that.saveCSS( options["projectId"], options["css"], null, request, response )
				break;
				case "update-groups":
				case "update-assets":
				case "update-behaviours":
					var ids: Array<string> = ( typeof ( options["ids[]"] ) == "string" ? [options["ids[]"]] : options["ids[]"] );

					var collection: string = null;
					if ( functionName == "update-groups" )
						collection = "groups";
					else if ( functionName == "update-behaviours" )
						collection = "behaviours";
					else
						collection = "assets";

					that.getObjectsID( collection, options["projectId"], ids, null, request, response );
					break;
				case "create-group":
					that.createGroup( options["name"], options["projectId"], null, request, response );
					break;
				case "create-asset":
					that.createAsset( options["name"], parseInt( options["shallowId"] ), options["className"], options["projectId"], null, request, response );
					break;
				case "copy-asset":
					that.copyAsset( options["projectId"], options["assetId"], parseInt( options["shallowId"] ), null, request, response );
					break;
				case "create-behaviour":
					that.createBehaviour( options["name"], parseInt( options["shallowId"] ), options["projectId"], null, request, response );
					break;
				case "initialize-behaviour-script":
					that.initializeBehaviourScript( parseInt( options["containerId"] ), options["behaviourId"], options["projectId"], null, request, response );
					break;
				case "copy-script":
					that.copyBehaviourScript( options["projectId"], parseInt( options["originalId"] ), null, request, response );
					break;
				case "save-behaviour-script":
					that.saveBehaviourScript( parseInt( options["shallowId"]), options["onEnter"], options["onInitialize"], options["onDispose"], options["onFrame"], options["projectId"], null, request, response );
					break;
				case "get-behaviour-scripts":
					that.getBehaviourScript( parseInt( options["shallowId"] ), options["projectId"], null, request, response );
					break;
				case "open":
					that.open( options["id"], null, request, response );
					break;
				case "copy":
					that.copy( options["id"], null, request, response );
					break;
				default:
					new ErrorController( utils.ErrorCodes.INVALID_INPUT, "No function specified" ).processRequest( request, response, functionName );
					break;
			}
		}, request, response );
	}

	/**
	* Creates a behaviour for a project
	* @param {string} name The name of the new behaviour
	* @param {number} shallowId The local id of the behaviour
	* @param {string} projectId The ID of the project
	* @param {(behaviour: behaviourModel.Behaviour) => void} callback The callback function
	* @param {http.ServerRequest} request
	* @param {http.ServerResponse} response
	*/
	createBehaviour( name: string, shallowId: number, projectId: string, callback?: ( behaviour: behaviourModel.Behaviour ) => void, request?: http.ServerRequest, response?: http.ServerResponse )
	{
		if ( !name || !projectId )
		{
			if ( callback )
				return callback( null );
			else
				return new ErrorController( utils.ErrorCodes.INVALID_INPUT, "invalid input detected" ).processRequest( request, response, "" );
		}


		projectId = projectId.trim();
		name = name.trim();
		var that = this;

		logger.log( "Creating behaviour '" + name + "' for project '" + projectId + "'...", logger.LogType.ADMIN );

		UserController.singleton.loggedIn( function ( loggedIn: boolean, user: userModel.User )
		{
			// If not logged in then do nothing
			if ( !loggedIn )
			{
				if ( callback )
					return callback( null );
				else
					return new ErrorController( utils.ErrorCodes.AUTHENTICATION_REQUIRED, "Authentication is required to call this function" ).processRequest( request, response, "" );
			}

			// Check for rights
			that.checkPrivileges( user._id.toString(), projectId, projectModel.PrivilegeType.WRITE, function( hasRights: boolean )
			{
				if ( hasRights )
				{
					that.getProject( projectId, function ( proj: projectModel.Project )
					{
						if ( !proj )
						{
							if ( callback )
								return callback( null );
							else
								return new ErrorController( utils.ErrorCodes.INVALID_INPUT, "Could not find the project with the id '" + projectId + "'" ).processRequest( request, response, "" );
						}

						// Make sure the name is safe
						if ( name == "" || !validator.isSafeCharacters( name ) )
						{
							if ( callback )
								return callback( null );
							else
								return new ErrorController( utils.ErrorCodes.INVALID_INPUT, "Please specify a valid name" ).processRequest( request, response, "" );
						}

						//Check if the behaviour already exists
						Model.collections( "behaviours" ).findOne( { $and: [{ name: name }, { project_id: proj._id }] }, function ( err: any, behaviour: behaviourModel.Behaviour )
						{
							if ( err )
							{
								if ( callback )
									return callback( null );
								else
									return new ErrorController( utils.ErrorCodes.DATABASE_ERROR, err ).processRequest( request, response, "" );
							}

							// Only create one if its name is unique. i.e nothing should be found
							if ( !behaviour )
							{
								Model.collections( "behaviours" ).save( new behaviourModel.Behaviour( name, shallowId, proj._id, user._id ),
									function ( err: any, behaviour: behaviourModel.Behaviour )
									{
										if ( err )
										{
											if ( callback )
												return callback( null );
											else
												return new ErrorController( utils.ErrorCodes.DATABASE_ERROR, err ).processRequest( request, response, "" );
										}

										logger.log( "Behaviour '" + name + "' (" + behaviour._id + ") has been created", logger.LogType.SUCCESS );

										if ( callback )
											callback( behaviour );
										else
											return viewJSON.render( { shallowId : shallowId, name: name, id: behaviour._id, message: "Behaviour '" + name + "' has been created" }, request, response, viewJSON.ReturnType.SUCCESS );
									});
							}
							else
							{
								if ( callback )
									return callback( null );
								else
									return new ErrorController( utils.ErrorCodes.INVALID_INPUT, "A behaviour with the name '" + name + "' already exists" ).processRequest( request, response, "" );
							}
						});

					}, request, response );
				}
				else
				{
					if ( callback )
						return callback( null );
					else
						return new ErrorController( utils.ErrorCodes.AUTHENTICATION_REQUIRED, "Write authentication is required to call this function" ).processRequest( request, response, "" );
				}
			}, request, response );
		}, request, response );
	}


	/**
	* Creates a script behaviour for a project
	* @param {number} containerId The local ID of the container this script is attached to
	* @param {string} behaviourId The ID of the behaviour this script is attached to
	* @param {string} projectId The ID of the project
	* @param {(script: scriptModel.Script) => void} callback The callback function
	* @param {http.ServerRequest} request
	* @param {http.ServerResponse} response
	*/
	initializeBehaviourScript( containerId: number, behaviourId: string, projectId: string, callback?: ( script: scriptModel.Script) => void, request?: http.ServerRequest, response?: http.ServerResponse )
	{
		if ( !behaviourId || containerId === undefined || !projectId || isNaN( containerId ) )
		{
			if ( callback )
				return callback( null );
			else
				return new ErrorController( utils.ErrorCodes.INVALID_INPUT, "invalid input detected" ).processRequest( request, response, "" );
		}

		var that = this;

		logger.log( "Creating script behaviour for project '" + projectId + "'...", logger.LogType.ADMIN );

		UserController.singleton.loggedIn( function ( loggedIn: boolean, user: userModel.User )
		{
			// If not logged in then do nothing
			if ( !loggedIn )
			{
				if ( callback )
					return callback( null );
				else
					return new ErrorController( utils.ErrorCodes.AUTHENTICATION_REQUIRED, "Authentication is required to call this function" ).processRequest( request, response, "" );
			}

			// Check for rights
			that.checkPrivileges( user._id.toString(), projectId, projectModel.PrivilegeType.WRITE, function ( hasRights: boolean )
			{
				if ( hasRights )
				{
					that.getProject( projectId, function ( proj: projectModel.Project )
					{
						if ( !proj )
						{
							if ( callback )
								return callback( null );
							else
								return new ErrorController( utils.ErrorCodes.INVALID_INPUT, "Could not find the project with the id '" + projectId + "'" ).processRequest( request, response, "" );
						}

						Model.collections( "scripts" ).count( { project_id : proj._id }, function( err : any, count : number )
						{
							Model.collections( "scripts" ).save( new scriptModel.Script( count, containerId, behaviourId, proj._id, user._id ), function ( err: any, script: scriptModel.Script )
							{
								if ( err )
								{
									if ( callback )
										return callback( null );
									else
										return new ErrorController( utils.ErrorCodes.DATABASE_ERROR, err ).processRequest( request, response, "" );
								}

								logger.log( "New Script behaviour (" + script._id + ") has been created", logger.LogType.SUCCESS );

								if ( callback )
									callback( script );
								else
									return viewJSON.render( { id: script._id, shallowId: count, message: "New script behaviour has been created" }, request, response, viewJSON.ReturnType.SUCCESS );
							});
						});

					}, request, response );
				}
				else
				{
					if ( callback )
						return callback( null );
					else
						return new ErrorController( utils.ErrorCodes.AUTHENTICATION_REQUIRED, "Write authentication is required to call this function" ).processRequest( request, response, "" );
				}
			}, request, response );
		}, request, response );
	}


	/**
	* Copies a script behaviour
	* @param {string} projectId The ID of the project
	* @param {number} originalId The local ID of the original script we are copying from
	* @param {(script: scriptModel.Script) => void} callback The callback function
	* @param {http.ServerRequest} request
	* @param {http.ServerResponse} response
	*/
	copyBehaviourScript( projectId: string, originalId : number, callback?: ( script: scriptModel.Script ) => void, request?: http.ServerRequest, response?: http.ServerResponse )
	{
		var that = this;

		logger.log( "Copying script behaviour '" + originalId + "'...", logger.LogType.ADMIN );

		UserController.singleton.loggedIn( function ( loggedIn: boolean, user: userModel.User )
		{
			// If not logged in then do nothing
			if ( !loggedIn )
			{
				if ( callback )
					return callback( null );
				else
					return new ErrorController( utils.ErrorCodes.AUTHENTICATION_REQUIRED, "Authentication is required to call this function" ).processRequest( request, response, "" );
			}

			// Check for rights
			that.checkPrivileges( user._id.toString(), projectId, projectModel.PrivilegeType.WRITE, function ( hasRights: boolean )
			{
				if ( hasRights )
				{
					that.getProject( projectId, function ( proj: projectModel.Project )
					{
						if ( !proj )
						{
							if ( callback )
								return callback( null );
							else
								return new ErrorController( utils.ErrorCodes.INVALID_INPUT, "Could not find the project with the id '" + projectId + "'" ).processRequest( request, response, "" );
						}

						that.getBehaviourScript( originalId, projectId, function( originalScript : scriptModel.Script )
						{
							if ( !originalScript )
							{
								if ( callback )
									return callback( null );
								else
									return new ErrorController( utils.ErrorCodes.INVALID_INPUT, "Could not find the script with the local id '" + originalId + "'" ).processRequest( request, response, "" );
							}

							Model.collections( "scripts" ).count( { project_id: proj._id }, function ( err: any, count: number )
							{
								var copiedScript = new scriptModel.Script( count, originalScript.container_id, originalScript.behaviour_id, proj._id, user._id );
								copiedScript.onFrame = originalScript.onFrame;
								copiedScript.onDispose = originalScript.onDispose;
								copiedScript.onInitialize = originalScript.onInitialize;
								copiedScript.onEnter = originalScript.onEnter;

								Model.collections( "scripts" ).save( copiedScript, function ( err: any, script: scriptModel.Script )
								{
									if ( err )
									{
										if ( callback )
											return callback( null );
										else
											return new ErrorController( utils.ErrorCodes.DATABASE_ERROR, err ).processRequest( request, response, "" );
									}

									logger.log( "New Script behaviour (" + script._id + ") has been created", logger.LogType.SUCCESS );

									if ( callback )
										callback( script );
									else
										return viewJSON.render( { shallowId: count, message: "New script behaviour has been created" }, request, response, viewJSON.ReturnType.SUCCESS );
								});
							});

						}, request, response );


					}, request, response );
				}
				else
				{
					if ( callback )
						return callback( null );
					else
						return new ErrorController( utils.ErrorCodes.AUTHENTICATION_REQUIRED, "Write authentication is required to call this function" ).processRequest( request, response, "" );
				}
			}, request, response );
		}, request, response );
	}


	/**
	* Saves behaviour script data
	* @param {number} shallowId The local ID of the script
	* @param {string} onEnter The on enter code
	* @param {string} onInitialize The on initialize code
	* @param {string} onDispose The on dispose code
	* @param {string} onFrame The on frame code
	* @param {string} projectId The ID of the project
	* @param {(numAffected : number) => void} callback The callback function
	* @param {http.ServerRequest} request
	* @param {http.ServerResponse} response
	*/
	saveBehaviourScript( shallowId: number, onEnter: string, onInitialize: string, onDispose: string, onFrame: string, projectId: string, callback?: ( numAffected : number ) => void, request?: http.ServerRequest, response?: http.ServerResponse )
	{
		if ( !shallowId || isNaN( shallowId ) )
		{
			if ( callback )
				return callback( 0 );
			else
				return new ErrorController( utils.ErrorCodes.INVALID_INPUT, "invalid input detected" ).processRequest( request, response, "" );
		}

		var that = this;

		logger.log( "Saving script behaviour '" + shallowId + "'...", logger.LogType.ADMIN );

		UserController.singleton.loggedIn( function ( loggedIn: boolean, user: userModel.User )
		{
			// If not logged in then do nothing
			if ( !loggedIn )
			{
				if ( callback )
					return callback( 0 );
				else
					return new ErrorController( utils.ErrorCodes.AUTHENTICATION_REQUIRED, "Authentication is required to call this function" ).processRequest( request, response, "" );
			}

			// Check for rights
			that.checkPrivileges( user._id.toString(), projectId, projectModel.PrivilegeType.WRITE, function ( hasRights: boolean )
			{
				if ( hasRights )
				{
					that.getProject( projectId, function ( proj: projectModel.Project )
					{
						if ( !proj )
						{
							if ( callback )
								return callback( 0 );
							else
								return new ErrorController( utils.ErrorCodes.INVALID_INPUT, "Could not find the project with the id '" + projectId + "'" ).processRequest( request, response, "" );
						}

						var updateToken: any = { $set: {} };
						if ( onEnter )
							updateToken.$set.onEnter = onEnter;
						if ( onDispose )
							updateToken.$set.onDispose = onDispose;
						if ( onInitialize )
							updateToken.$set.onInitialize = onInitialize;
						if ( onFrame )
							updateToken.$set.onFrame = onFrame;

						// Update the script
						Model.collections( "scripts" ).update( { shallowId: shallowId, project_id : proj._id }, updateToken, function ( err: any, numAffected: number )
						{
							if ( err )
							{
								if ( callback )
									return callback( 0 );
								else
									return new ErrorController( utils.ErrorCodes.DATABASE_ERROR, err ).processRequest( request, response, "" );
							}

							logger.log( "Script behaviour " + shallowId + " has been saved", logger.LogType.SUCCESS );

							if ( callback )
								callback( numAffected );
							else
								return viewJSON.render( { message: "Script behaviour " + shallowId + " has been saved" }, request, response, viewJSON.ReturnType.SUCCESS );
						});

					}, request, response );
				}
				else
				{
					if ( callback )
						return callback( null );
					else
						return new ErrorController( utils.ErrorCodes.AUTHENTICATION_REQUIRED, "Write authentication is required to call this function" ).processRequest( request, response, "" );
				}
			}, request, response );
		}, request, response );
	}


	/**
	* Gets behaviour script by ID
	* @param {number} shallowId The local ID of the script top get
	* @param {string} projectId The ID of the project
	* @param {(script: scriptModel.Script) => void} callback The callback function
	* @param {http.ServerRequest} request
	* @param {http.ServerResponse} response
	*/
	getBehaviourScript( shallowId: number, projectId: string, callback?: ( script: scriptModel.Script ) => void, request?: http.ServerRequest, response?: http.ServerResponse )
	{
		if ( !shallowId || isNaN( shallowId ) )
		{
			if ( callback )
				return callback( null );
			else
				return new ErrorController( utils.ErrorCodes.INVALID_INPUT, "invalid input detected" ).processRequest( request, response, "" );
		}

		var that = this;

		logger.log( "Getting script behaviour '" + shallowId + "'...", logger.LogType.ADMIN );

		UserController.singleton.loggedIn( function ( loggedIn: boolean, user: userModel.User )
		{
			// If not logged in then do nothing
			if ( !loggedIn )
			{
				if ( callback )
					return callback( null );
				else
					return new ErrorController( utils.ErrorCodes.AUTHENTICATION_REQUIRED, "Authentication is required to call this function" ).processRequest( request, response, "" );
			}

			// Check for rights
			that.checkPrivileges( user._id.toString(), projectId, projectModel.PrivilegeType.READ, function ( hasRights: boolean )
			{
				if ( hasRights )
				{
					that.getProject( projectId, function ( proj: projectModel.Project )
					{
						if ( !proj )
						{
							if ( callback )
								return callback( null );
							else
								return new ErrorController( utils.ErrorCodes.INVALID_INPUT, "Could not find the project with the id '" + projectId + "'" ).processRequest( request, response, "" );
						}

						// Update the script
						Model.collections( "scripts" ).findOne( { shallowId: shallowId, project_id : proj._id }, function ( err: any, script: scriptModel.Script )
						{
							if ( err )
							{
								if ( callback )
									return callback( null);
								else
									return new ErrorController( utils.ErrorCodes.DATABASE_ERROR, err ).processRequest( request, response, "" );
							}

							if ( !script )
							{
								if ( callback )
									return callback( null );
								else
									return new ErrorController( utils.ErrorCodes.INVALID_INPUT, "Could not find script with the local ID " + shallowId ).processRequest( request, response, "" );
							}

							logger.log( "Script behaviour " + shallowId + " has fetched", logger.LogType.SUCCESS );

							if ( callback )
								callback( script );
							else
								return viewJSON.render( { script: script, message: "Script behaviour " + shallowId + " has been fetched" }, request, response, viewJSON.ReturnType.SUCCESS );
						});

					}, request, response );
				}
				else
				{
					if ( callback )
						return callback( null );
					else
						return new ErrorController( utils.ErrorCodes.AUTHENTICATION_REQUIRED, "Read authentication is required to call this function" ).processRequest( request, response, "" );
				}
			}, request, response );
		}, request, response );
	}


	/**
	* Creates a new group
	* @param {string} name The name of the group
	* @param {string} projectId The ID of the project
	* @param {(group: groupModel.Group) => void} callback The callback function
	* @param {http.ServerRequest} request
	* @param {http.ServerResponse} response
	*/
	createGroup( name: string, projectId: string, callback?: ( project: groupModel.Group) => void, request?: http.ServerRequest, response?: http.ServerResponse )
	{
		if ( !name || !projectId )
		{
			if ( callback )
				return callback( null );
			else
				return new ErrorController( utils.ErrorCodes.INVALID_INPUT, "invalid input detected" ).processRequest( request, response, "" );
		}

		projectId = projectId.trim();
		name = name.trim();

		if ( name == "" || !validator.isSafeCharacters( name ) )
		{
			if ( callback )
				return callback( null );
			else
				return new ErrorController( utils.ErrorCodes.INVALID_INPUT, "Please specify a valid name" ).processRequest( request, response, "" );
		}

		var that = this;

		logger.log( "Creating group '" + name + "' for project '" + projectId + "'...", logger.LogType.ADMIN );

		UserController.singleton.loggedIn( function ( loggedIn: boolean, user: userModel.User )
		{
			// If not logged in then do nothing
			if ( !loggedIn )
			{
				if ( callback )
					return callback( null );
				else
					return new ErrorController( utils.ErrorCodes.AUTHENTICATION_REQUIRED, "Authentication is required to call this function" ).processRequest( request, response, "" );
			}

			// Check for rights
			that.checkPrivileges( user._id.toString(), projectId, projectModel.PrivilegeType.WRITE, function( hasRights: boolean )
			{
				if ( hasRights )
				{
					that.getProject( projectId, function( proj: projectModel.Project )
					{
						if ( !proj )
						{
							if ( callback )
								return callback( null );
							else
								return new ErrorController( utils.ErrorCodes.INVALID_INPUT, "Could not find the project with the id '" + projectId + "'" ).processRequest( request, response, "" );
						}


						// Create the group and return the new object
						Model.collections( "groups" ).save( new groupModel.Group( name, proj._id, user._id ),
							function ( err: any, group : groupModel.Group )
							{
								if ( err )
								{
									if ( callback )
										return callback( null );
									else
										return new ErrorController( utils.ErrorCodes.DATABASE_ERROR, err ).processRequest( request, response, "" );
								}

								// Add group reference to project
								Model.collections( "projects" ).update( { _id: proj._id }, { $push: { groups: group._id.toString() } }, function ( err: any, result: number )
								{
									if ( err )
									{
										if ( callback )
											return callback( null );
										else
											return new ErrorController( utils.ErrorCodes.DATABASE_ERROR, err ).processRequest( request, response, "" );
									}

									logger.log( "Group '" + name + "' (" + group._id + ") has been created", logger.LogType.SUCCESS );
									if ( callback )
										callback( group );
									else
										return viewJSON.render( group, request, response, viewJSON.ReturnType.SUCCESS );
								});
							}
						);

					}, request, response );
				}
				else
				{
					if ( callback )
						return callback( null );
					else
						return new ErrorController( utils.ErrorCodes.AUTHENTICATION_REQUIRED, "Write authentication is required to call this function" ).processRequest( request, response, "" );
				}
			}, request, response );
		}, request, response );
	}


	/**
	* Create a new asset
	* @param {string} name The name of the asset
	* @param {number} shallowId The ID assigned to the asset for local identification
	* @param {string} className The class to which the asset belongs to
	* @param {string} projectId The ID of the project
	* @param {(asset: assetModel.Asset) => void} callback The callback function
	* @param {http.ServerRequest} request
	* @param {http.ServerResponse} response
	*/
	createAsset( name: string, shallowId : number, className: string, projectId: string, callback?: ( asset: assetModel.Asset ) => void, request?: http.ServerRequest, response?: http.ServerResponse )
	{
		if ( !name || !className || !projectId || shallowId === undefined || isNaN( shallowId ))
		{
			if ( callback )
				return callback( null );
			else
				return new ErrorController( utils.ErrorCodes.INVALID_INPUT, "invalid input detected" ).processRequest( request, response, "" );
		}

		projectId = projectId.trim();
		className = className.trim();
		name = name.trim();

		if ( name == "" || !validator.isSafeCharacters( name ) )
		{
			if ( callback )
				return callback( null );
			else
				return new ErrorController( utils.ErrorCodes.INVALID_INPUT, "Please specify a valid name" ).processRequest( request, response, "" );
		}

		if ( className == "" || !validator.isSafeCharacters( className ) )
		{
			if ( callback )
				return callback( null );
			else
				return new ErrorController( utils.ErrorCodes.INVALID_INPUT, "Please specify a valid name" ).processRequest( request, response, "" );
		}


		var that = this;

		logger.log( "Creating asset '" + name + "' of type '" + className + "' for project '" + projectId + "'...", logger.LogType.ADMIN );

		UserController.singleton.loggedIn( function ( loggedIn: boolean, user: userModel.User )
		{
			// If not logged in then do nothing
			if ( !loggedIn )
			{
				if ( callback )
					return callback( null );
				else
					return new ErrorController( utils.ErrorCodes.AUTHENTICATION_REQUIRED, "Authentication is required to call this function" ).processRequest( request, response, "" );
			}

			// Check for rights
			that.checkPrivileges( user._id.toString(), projectId, projectModel.PrivilegeType.WRITE, function ( hasRights: boolean )
			{
				if ( hasRights )
				{
					that.getProject( projectId, function ( proj: projectModel.Project )
					{
						if ( !proj )
						{
							if ( callback )
								return callback( null );
							else
								return new ErrorController( utils.ErrorCodes.INVALID_INPUT, "Could not find the project with the id '" + projectId + "'" ).processRequest( request, response, "" );
						}

						// Create the group and return the new object
						Model.collections( "assets" ).save( new assetModel.Asset( shallowId, name, className, proj._id, user._id ),
							function ( err: any, asset: assetModel.Asset )
							{
								if ( err )
								{
									if ( callback )
										return callback( null );
									else
										return new ErrorController( utils.ErrorCodes.DATABASE_ERROR, err ).processRequest( request, response, "" );
								}

								logger.log( "Asset '" + name + "' (" + asset._id + ") has been created", logger.LogType.SUCCESS );
								if ( callback )
									callback( asset );
								else
									return viewJSON.render( asset, request, response, viewJSON.ReturnType.SUCCESS );
							}
							);

					}, request, response );
				}
				else
				{
					if ( callback )
						return callback( null );
					else
						return new ErrorController( utils.ErrorCodes.AUTHENTICATION_REQUIRED, "Write authentication is required to call this function" ).processRequest( request, response, "" );
				}
			}, request, response );
		}, request, response );
	}


	/**
	* Use this function to copy a project asset
	* @param {string} projectId The ID of the project
	* @param {string} assetId The ID of the asset
	* @param {number} shallowId The local ID of the asset assigned by Animate
	* @param {(asset: assetModel.Asset) => void} callback The callback function
	* @param {http.ServerRequest} request
	* @param {http.ServerResponse} response
	*/
	copyAsset( projectId: string, assetId: string, shallowId : number, callback?: ( asset: assetModel.Asset ) => void, request?: http.ServerRequest, response?: http.ServerResponse )
	{
		if ( !assetId || !projectId || shallowId === undefined || isNaN( shallowId ) )
		{
			if ( callback )
				return callback( null );
			else
				return new ErrorController( utils.ErrorCodes.INVALID_INPUT, "invalid input detected" ).processRequest( request, response, "" );
		}

		projectId = projectId.trim();
		assetId = assetId.trim();

		if ( !validator.isValidObjectID( assetId ) )
		{
			if ( callback )
				return callback( null );
			else
				return new ErrorController( utils.ErrorCodes.INVALID_INPUT, "Please specify a valid asset ID" ).processRequest( request, response, "" );
		}

		var that = this;

		logger.log( "Copying asset '" + assetId + "' for project '" + projectId + "'...", logger.LogType.ADMIN );

		UserController.singleton.loggedIn( function ( loggedIn: boolean, user: userModel.User )
		{
			// If not logged in then do nothing
			if ( !loggedIn )
			{
				if ( callback )
					return callback( null );
				else
					return new ErrorController( utils.ErrorCodes.AUTHENTICATION_REQUIRED, "Authentication is required to call this function" ).processRequest( request, response, "" );
			}

			// Check for rights
			that.checkPrivileges( user._id.toString(), projectId, projectModel.PrivilegeType.WRITE, function ( hasRights: boolean )
			{
				if ( hasRights )
				{
					that.getProject( projectId, function ( proj: projectModel.Project )
					{
						if ( !proj )
						{
							if ( callback )
								return callback( null );
							else
								return new ErrorController( utils.ErrorCodes.INVALID_INPUT, "Could not find the project with the id '" + projectId + "'" ).processRequest( request, response, "" );
						}

						Model.collections( "assets" ).findOne( { project_id: proj._id, _id: new mongodb.ObjectID(assetId) }, function( err : any, origAsset : assetModel.Asset )
						{
							if ( err )
							{
								if ( callback )
									return callback( null );
								else
									return new ErrorController( utils.ErrorCodes.DATABASE_ERROR, err ).processRequest( request, response, "" );
							}

							if ( !origAsset )
							{
								if ( callback )
									return callback( null );
								else
									return new ErrorController( utils.ErrorCodes.INVALID_INPUT, "Could not find the asset '"+ assetId +"'").processRequest( request, response, "" );
							}

							// Create the group and return the new object
							Model.collections( "assets" ).save( new assetModel.Asset( shallowId, origAsset.name, origAsset.className, proj._id, user._id, origAsset.json ),
								function ( err: any, asset: assetModel.Asset )
								{
									if ( err )
									{
										if ( callback )
											return callback( null );
										else
											return new ErrorController( utils.ErrorCodes.DATABASE_ERROR, err ).processRequest( request, response, "" );
									}

									// Add group reference to project
									Model.collections( "projects" ).update( { _id: proj._id }, { $push: { assets: asset._id.toString() } }, function ( err: any, result: number )
									{
										if ( err )
										{
											if ( callback )
												return callback( null );
											else
												return new ErrorController( utils.ErrorCodes.DATABASE_ERROR, err ).processRequest( request, response, "" );
										}

										logger.log( "Asset '" + origAsset.name + "' (" + asset._id + ") has been created", logger.LogType.SUCCESS );
										if ( callback )
											callback( asset );
										else
											return viewJSON.render( asset, request, response, viewJSON.ReturnType.SUCCESS );
									});
								}
								);
						});
					}, request, response );
				}
				else
				{
					if ( callback )
						return callback( null );
					else
						return new ErrorController( utils.ErrorCodes.AUTHENTICATION_REQUIRED, "Write authentication is required to call this function" ).processRequest( request, response, "" );
				}
			}, request, response );
		}, request, response );
	}


	/**
	* Gets a project from the database by ID as well its current build
	* @param {string} projectId The ID of the project
	* @param {(project: projectModel.Project, build: buildModel.Build) => void} callback The callback function
	* @param {http.ServerRequest} request
	* @param {http.ServerResponse} response
	*/
	open( projectId: string, callback?: ( project: projectModel.Project, build: buildModel.Build ) => void, request?: http.ServerRequest, response?: http.ServerResponse )
	{
		if ( !projectId )
		{
			if ( callback )
				return callback( null, null );
			else
				return new ErrorController( utils.ErrorCodes.INVALID_INPUT, "invalid input detected" ).processRequest( request, response, "" );
		}

		var that = this;

		logger.log( "Opening project '" + projectId + "'", logger.LogType.ADMIN );

		UserController.singleton.loggedIn( function ( loggedIn: boolean, user: userModel.User )
		{
			// If not logged in then do nothing
			if ( !loggedIn )
			{
				if ( callback )
					return callback( null, null );
				else
					return new ErrorController( utils.ErrorCodes.AUTHENTICATION_REQUIRED, "Authentication is required to call this function" ).processRequest( request, response, "" );
			}

			// Check for rights
			that.checkPrivileges( user._id.toString(), projectId, projectModel.PrivilegeType.READ, function ( hasRights: boolean )
			{
				if ( hasRights )
				{
					that.getProject( projectId, function ( proj: projectModel.Project )
					{
						if ( !proj )
						{
							if ( callback )
								return callback( null, null );
							else
								return new ErrorController( utils.ErrorCodes.INVALID_INPUT, "Could not find the project with the id '" + projectId + "'" ).processRequest( request, response, "" );
						}

						// Get the current build
						Model.collections( "builds" ).find( { _id: proj.buildId }, function ( err: any, cursor: mongodb.Cursor )
						{
							if ( err )
							{
								if ( callback )
									return callback( null, null );
								else
									return new ErrorController( utils.ErrorCodes.DATABASE_ERROR, err ).processRequest( request, response, "" );
							}

							cursor.toArray( function ( err: any, builds: Array<buildModel.Build> )
							{
								if ( err )
								{
									if ( callback )
										return callback( null, null );
									else
										return new ErrorController( utils.ErrorCodes.DATABASE_ERROR, err ).processRequest( request, response, "" );
								}

								if ( builds.length == 0 )
								{
									if ( callback )
										return callback( null, null );
									else
										return new ErrorController( utils.ErrorCodes.DATABASE_ERROR, "Could not find build" ).processRequest( request, response, "" );
								}

								logger.log( "Opened project '" + projectId + "'", logger.LogType.SUCCESS );

								if ( callback )
									callback( proj, builds[0] );
								else
									return viewJSON.render( { project : proj, build : builds[0] }, request, response, viewJSON.ReturnType.SUCCESS );
							});
						});

					}, request, response );
				}
				else
				{
					if ( callback )
						return callback( null, null );
					else
						return new ErrorController( utils.ErrorCodes.AUTHENTICATION_REQUIRED, "Read authentication is required to call this function" ).processRequest( request, response, "" );
				}
			}, request, response );
		}, request, response );
	}


	/**
	* Copies a project
	* @param {string} projectId The ID of the project to copy from
	* @param {( project: projectModel.Project, build : buildModel.Build) => void} callback The callback function
	* @param {http.ServerRequest} request
	* @param {http.ServerResponse} response
	*/
	copy( projectId: string, callback?: ( project: projectModel.Project, build : buildModel.Build ) => void, request?: http.ServerRequest, response?: http.ServerResponse )
	{
		var that = this;

		logger.log( "Copying project '" + projectId + "'", logger.LogType.ADMIN );

		UserController.singleton.loggedIn( function ( loggedIn: boolean, user: userModel.User )
		{
			// If not logged in then do nothing
			if ( !loggedIn )
			{
				if ( callback )
					return callback( null, null );
				else
					return new ErrorController( utils.ErrorCodes.AUTHENTICATION_REQUIRED, "Authentication is required to call this function" ).processRequest( request, response, "" );
			}

			// Check for rights
			that.checkPrivileges( user._id.toString(), projectId, projectModel.PrivilegeType.READ, function ( hasRights: boolean )
			{
				if ( hasRights )
				{
					that.getProject( projectId, function ( proj: projectModel.Project )
					{
						if ( !proj )
						{
							if ( callback )
								return callback( null, null );
							else
								return new ErrorController( utils.ErrorCodes.INVALID_INPUT, "Could not find the project with the id '" + projectId + "'" ).processRequest( request, response, "" );
						}

						// Keep a copy of all original asset ids / new ids
						var tempAssets: Array<assetModel.Asset> = [];
						var tempBehaviours: Array<behaviourModel.Behaviour>= [];
						var tempScripts: Array<scriptModel.Script>= [];
						var tempGroups: Array<groupModel.Group> = [];

						var newProject: projectModel.Project;
						var newBuild: buildModel.Build;

						// We do not copy the ID of the original. Everything else we do...
						var originalId = proj._id;
						delete proj._id;

						// Create the new project
						that.createProject( "Copy of " + proj.name, proj.description, function ( copiedProject: projectModel.Project, build: buildModel.Build )
						{
							if ( !copiedProject )
							{
								if ( callback )
									return callback( null, null );
								else
									return new ErrorController( utils.ErrorCodes.DATABASE_ERROR, "Could not copy the original project" ).processRequest( request, response, "" );
							}

							newProject = copiedProject;
							newBuild = build;


							// Update it to match the original
							Model.collections( "projects" ).update( { _id: copiedProject._id }, {
								$set: {
									category: proj.category, cur_file: proj.cur_file, description: proj.description,
									files: proj.files, image: proj.image, imagePath: proj.imagePath, plugins: proj.plugins, sub_category: proj.sub_category,
									suspicious: proj.suspicious, tags: proj.tags, type: proj.type, visibility: proj.visibility, website_category: proj.website_category,
									website_img: proj.website_img
								}
							}, function ( err: any, numUpdated: number )
							{
								if ( err )
								{
									if ( callback )
										return callback( null, null );
									else
										return new ErrorController( utils.ErrorCodes.DATABASE_ERROR, err ).processRequest( request, response, "" );
								}

								logger.log( "Project copied, duplicating project assets..." );

								// Get all assets
								Model.collections( "assets" ).find( { project_id: originalId }, function ( err: any, cursor: mongodb.Cursor )
								{
									cursor.toArray( function ( err: any, assets: Array<assetModel.Asset> )
									{
										tempAssets = assets;

										// Get all behaviours
										Model.collections( "behaviours" ).find( { project_id: originalId }, function ( err: any, cursor: mongodb.Cursor )
										{
											cursor.toArray( function ( err: any, behaviours: Array<behaviourModel.Behaviour> )
											{
												tempBehaviours = behaviours;

												// Get all scripts
												Model.collections( "scripts" ).find( { project_id: originalId }, function ( err: any, cursor: mongodb.Cursor )
												{
													cursor.toArray( function ( err: any, scripts: Array<scriptModel.Script> )
													{
														tempScripts = scripts;

														// Get all groups
														Model.collections( "groups" ).find( { project_id: originalId }, function ( err: any, cursor: mongodb.Cursor )
														{
															cursor.toArray( function ( err: any, groups: Array<groupModel.Group> )
															{
																tempGroups = groups;

																// Call copy
																duplicateAssets( copiedProject );
															});
														});
													});
												});
											});
										});
									});
								});


							});
						}, request, response );


						// Copy each of the assets
						function duplicateAssets( copy : projectModel.Project )
						{
							if ( tempAssets.length == 0 )
							{
								logger.log( "Assets copied..." );
								duplicateBehaviours(copy);
								return;
							}

							var asset: assetModel.Asset = tempAssets.pop();
							delete asset._id;
							asset.project_id = copy._id;

							// Copy the asset
							Model.collections( "assets" ).save( asset, function ( err: any, copiedAsset: assetModel.Asset )
							{
								duplicateAssets( copy );
							});
						}

						// Copy each of the behaviours
						function duplicateBehaviours( copy: projectModel.Project )
						{
							if ( tempBehaviours.length == 0 )
							{
								logger.log( "Behaviours copied..." );
								duplicateScripts( copy );
								return;
							}

							var behaviour: behaviourModel.Behaviour = tempBehaviours.pop();
							delete behaviour._id;
							behaviour.project_id = copy._id;

							// Copy the asset
							Model.collections( "behaviours" ).save( behaviour, function ( err: any, copiedBehaviour: behaviourModel.Behaviour )
							{
								duplicateBehaviours( copy )
							});
						}

						// Copy each of the scripts
						function duplicateScripts( copy: projectModel.Project )
						{
							if ( tempScripts.length == 0 )
							{
								logger.log( "Scripts copied..." );
								duplicateGroups( copy );
								return;
							}

							var script: scriptModel.Script = tempScripts.pop();
							delete script._id;
							script.project_id = copy._id;

							// Copy the asset
							Model.collections( "scripts" ).save( script, function ( err: any, copiedScript: scriptModel.Script )
							{
								duplicateScripts( copy )
							});
						}


						// Copy each of the groups
						function duplicateGroups( copy: projectModel.Project )
						{
							if ( tempGroups.length == 0 )
							{
								logger.log( "Groups copied..." );


								logger.log( "Project '" + projectId + "' successfully copied", logger.LogType.SUCCESS );

								if ( callback )
									callback( newProject, newBuild );
								else
									return viewJSON.render( { project: newProject, build: newBuild, message: "Project '" + projectId + "' successfully copied" }, request, response, viewJSON.ReturnType.SUCCESS );

								return;
							}

							var group: groupModel.Group = tempGroups.pop();
							delete group._id;
							group.project_id = copy._id;

							// Copy the asset
							Model.collections( "groups" ).save( group, function ( err: any, copiedGroup: groupModel.Group )
							{
								duplicateGroups( copy )
							});
						}


					}, request, response );
				}
				else
				{
					if ( callback )
						return callback( null, null );
					else
						return new ErrorController( utils.ErrorCodes.AUTHENTICATION_REQUIRED, "Read authentication is required to call this function" ).processRequest( request, response, "" );
				}
			}, request, response );
		}, request, response );
	}


	/**
	* Renames an object owned by a project.  Can be either 'behaviour', 'group' or 'asset'
	* @param {string} name The new name of the object
	* @param {string} description The project description
	* @param {Array<string>} tags The array of tag descriptions
	* @param {string} category The category of the project
	* @param {string} sub_category The sub category of the project
	* @param {string} visibility The visibility of the project (who can see it on the website)
	* @param {string} projectId The ID of the project
	* @param {( result : number ) => void} callback The callback function
	* @param {http.ServerRequest} request
	* @param {http.ServerResponse} response
	*/
	rename( name: string, description: string, tags: Array<string>, category: string, sub_category:string, visibility : string, projectId: string, callback?: ( result: number ) => void, request?: http.ServerRequest, response?: http.ServerResponse )
	{
		var that = this;

		logger.log( "Renaming project '" + projectId + "'...", logger.LogType.ADMIN );

		UserController.singleton.loggedIn( function ( loggedIn: boolean, user: userModel.User )
		{
			// If not logged in then do nothing
			if ( !loggedIn )
			{
				if ( callback )
					return callback( null );
				else
					return new ErrorController( utils.ErrorCodes.AUTHENTICATION_REQUIRED, "Authentication is required to call this function" ).processRequest( request, response, "" );
			}

			// Check for rights
			that.checkPrivileges( user._id.toString(), projectId, projectModel.PrivilegeType.WRITE, function ( hasRights: boolean )
			{
				if ( hasRights )
				{
					that.getProject( projectId, function ( proj: projectModel.Project )
					{
						if ( !proj )
						{
							if ( callback )
								return callback( null );
							else
								return new ErrorController( utils.ErrorCodes.INVALID_INPUT, "Could not find the project with the id '" + projectId + "'" ).processRequest( request, response, "" );
						}


						var updateToken : any = { $set: {} };
						updateToken.$set.name = ( name === undefined ? proj.name : sanitizeHtml( name, { allowedTags: [] }) );
						updateToken.$set.description = ( description === undefined ? proj.description : sanitizeHtml( description, { allowedTags: ["b", "strong", "ul", "ol", "li", "i", "pre"] }) );
						updateToken.$set.tags = ( tags === undefined ? proj.tags : tags );
						updateToken.$set.category = ( category === undefined ? proj.category : category );
						updateToken.$set.sub_category = ( sub_category === undefined ? proj.sub_category : sub_category );
						updateToken.$set.visibility = ( visibility === undefined ? proj.visibility : visibility );
						updateToken.$set.lastModified = Date.now();

						proj.name = updateToken.$set.name;
						proj.description = updateToken.$set.description;
						proj.tags = updateToken.$set.tags;
						proj.category = updateToken.$set.category;
						proj.sub_category = updateToken.$set.sub_category;
						proj.visibility = updateToken.$set.visibility;
						proj.lastModified = updateToken.$set.lastModified;

						Model.collections( "projects" ).update( { _id: proj._id }, updateToken, function( err: any, numAffected: number )
						{
							if ( err )
							{
								if ( callback )
									return callback( null );
								else
									return new ErrorController( utils.ErrorCodes.DATABASE_ERROR, err ).processRequest( request, response, "" );
							}

							logger.log( "Successfully upated project '" + projectId + "'...", logger.LogType.SUCCESS );

							if ( callback )
								callback( numAffected );
							else
								return viewJSON.render( proj, request, response, viewJSON.ReturnType.SUCCESS );
						});

					}, request, response );
				}
				else
				{
					if ( callback )
						return callback( null );
					else
						return new ErrorController( utils.ErrorCodes.AUTHENTICATION_REQUIRED, "Write authentication is required to call this function" ).processRequest( request, response, "" );
				}
			}, request, response );
		}, request, response );
	}


	/**
	* Selects or creates a build by selecting its version
	* @param {string} major The major version
	* @param {string} mid The major version
	* @param {string} minor The major version
	* @param {string} projectId The ID of the project
	* @param {(build: buildModel.Build) => void} callback The callback function
	* @param {http.ServerRequest} request
	* @param {http.ServerResponse} response
	*/
	selectBuild( major: number, mid: number, minor: number, projectId: string, callback?: ( build: buildModel.Build ) => void, request?: http.ServerRequest, response?: http.ServerResponse )
	{
		if ( !major || !mid || !minor )
		{
			if ( callback )
				return callback( null );
			else
				return new ErrorController( utils.ErrorCodes.INVALID_INPUT, "invalid input detected" ).processRequest( request, response, "" );
		}

		var that = this;

		logger.log( "Selecting build v" + major + "." + mid + "." + minor +" for project (" + projectId + ")...", logger.LogType.ADMIN );

		UserController.singleton.loggedIn( function ( loggedIn: boolean, user: userModel.User )
		{
			// If not logged in then do nothing
			if ( !loggedIn )
			{
				if ( callback )
					return callback( null );
				else
					return new ErrorController( utils.ErrorCodes.AUTHENTICATION_REQUIRED, "Authentication is required to call this function" ).processRequest( request, response, "" );
			}

			// Check for rights
			that.checkPrivileges( user._id.toString(), projectId, projectModel.PrivilegeType.ADMIN, function ( hasRights: boolean )
			{
				if ( hasRights )
				{
					that.getProject( projectId, function ( proj: projectModel.Project )
					{
						if ( !proj )
						{
							if ( callback )
								return callback( null );
							else
								return new ErrorController( utils.ErrorCodes.INVALID_INPUT, "Could not find the project with the id '" + projectId + "'" ).processRequest( request, response, "" );
						}

						var version: string =  major + "." + mid + "." + minor;

						Model.collections( "builds" ).findOne( { version: version }, function ( err: any, b: buildModel.Build )
						{
							if ( err )
							{
								if ( callback )
									return callback( null );
								else
									return new ErrorController( utils.ErrorCodes.DATABASE_ERROR, err ).processRequest( request, response, "" );
							}

							// We have a build
							if ( b )
							{
								logger.log( "Build found. Updating project..." );
								Model.collections( "projects" ).update( { _id: proj._id }, { $set: { buildId: b._id } }, function ( err: any, numAffected: number )
								{
									logger.log( "Existing build has been selected.", logger.LogType.SUCCESS );



									if ( callback )
										callback( b );
									else
										return viewJSON.render( { build: b, message: "Build selected" }, request, response, viewJSON.ReturnType.SUCCESS );
								});

							}
							else
							{
								// No build - so create it
								logger.log( "No build found - creating one..." );



								Model.collections( "builds" ).findOne( { _id: proj.buildId }, function (err : any, curBuild : buildModel.Build  )
								{
									if ( err )
									{
										if ( callback )
											return callback( null );
										else
											return new ErrorController( utils.ErrorCodes.DATABASE_ERROR, err ).processRequest( request, response, "" );
									}

									var temp: buildModel.Build = new buildModel.Build( proj._id, version );
									temp.html = curBuild.html;
									temp.css = curBuild.css;

									Model.collections( "builds" ).save( temp, function ( err: any, newBuild: buildModel.Build )
									{
										if ( err )
										{
											if ( callback )
												return callback( null );
											else
												return new ErrorController( utils.ErrorCodes.DATABASE_ERROR, err ).processRequest( request, response, "" );
										}

										// New build created - now update project
										logger.log( "New build created. Updating project..." );
										Model.collections( "projects" ).update( { _id: proj._id }, { $set: { buildId: newBuild._id } }, function ( err: any, numAffected: number )
										{
											logger.log( "New build has been selected.", logger.LogType.SUCCESS );

											if ( callback )
												callback( newBuild );
											else
												return viewJSON.render( { build: newBuild, message: "New build selected" }, request, response, viewJSON.ReturnType.SUCCESS );
										});
									});
								});
							}
						});

					}, request, response );
				}
				else
				{
					if ( callback )
						return callback( null );
					else
						return new ErrorController( utils.ErrorCodes.AUTHENTICATION_REQUIRED, "Admin authentication is required to call this function" ).processRequest( request, response, "" );
				}
			}, request, response );
		}, request, response );
	}


	/**
	* Removes all builds associated with a project
	* @param {string} projectId The ID of the project
	* @param {( numRemoved: number ) => void} callback The callback function
	* @param {http.ServerRequest} request
	* @param {http.ServerResponse} response
	*/
	removeBuilds( projectId: string, callback?: ( numRemoved: number ) => void, request?: http.ServerRequest, response?: http.ServerResponse )
	{
		var that = this;

		logger.log( "Removing builds from project (" + projectId + ")...", logger.LogType.ADMIN );

		UserController.singleton.loggedIn( function ( loggedIn: boolean, user: userModel.User )
		{
			// If not logged in then do nothing
			if ( !loggedIn )
			{
				if ( callback )
					return callback( 0 );
				else
					return new ErrorController( utils.ErrorCodes.AUTHENTICATION_REQUIRED, "Authentication is required to call this function" ).processRequest( request, response, "" );
			}

			// Check for rights
			that.checkPrivileges( user._id.toString(), projectId, projectModel.PrivilegeType.ADMIN, function ( hasRights: boolean )
			{
				if ( hasRights )
				{
					that.getProject( projectId, function ( proj: projectModel.Project )
					{
						if ( !proj )
						{
							if ( callback )
								return callback( 0 );
							else
								return new ErrorController( utils.ErrorCodes.INVALID_INPUT, "Could not find the project with the id '" + projectId + "'" ).processRequest( request, response, "" );
						}

						Model.collections( "builds" ).find( { projectId: proj._id }, function ( err: any, cursor : mongodb.Cursor )
						{
							if ( err )
							{
								if ( callback )
									return callback( 0 );
								else
									return new ErrorController( utils.ErrorCodes.DATABASE_ERROR, err ).processRequest( request, response, "" );
							}

							cursor.toArray( function ( err: any, builds: Array<buildModel.Build> )
							{
								if ( err )
								{
									if ( callback )
										return callback( 0 );
									else
										return new ErrorController( utils.ErrorCodes.DATABASE_ERROR, err ).processRequest( request, response, "" );
								}



								// Remove any files
								for ( var i = 0, l = builds.length; i < l; i++ )
								{
									// Get the output directory ready
									var projDir: string = __dirname + "/../../../projects/" + projectId + "/";
									var buildDir: string = projDir + builds[i].version + "/";

									// If the directory already exists, then remove it
									if ( fs.existsSync( projDir ) )
									{
										logger.log( "Removing build directory (" + buildDir + ")..." );
										utils.deleteFolderRecursive( buildDir );
									}
								}


								Model.collections( "builds" ).remove( { projectId: proj._id }, function ( err: any, numDeleted : number )
								{
									if ( err )
									{
										if ( callback )
											return callback( 0 );
										else
											return new ErrorController( utils.ErrorCodes.DATABASE_ERROR, err ).processRequest( request, response, "" );
									}

									logger.log( "[" + numDeleted + "] Builds have been removed", logger.LogType.SUCCESS );

									if ( callback )
										return callback( numDeleted );
									else
										return viewJSON.render( { message : "["+ numDeleted +"] Builds have been removed" }, request, response, viewJSON.ReturnType.SUCCESS );
								});
							});
						});

					}, request, response );
				}
				else
				{
					if ( callback )
						return callback( null );
					else
						return new ErrorController( utils.ErrorCodes.AUTHENTICATION_REQUIRED, "Admin authentication is required to call this function" ).processRequest( request, response, "" );
				}
			}, request, response );
		}, request, response );
	}


	/**
	* Renames an object owned by a project.  Can be either 'behaviour', 'group' or 'asset'
	* @param {string} name The new name of the object
	* @param {string} objectId The ID of the object we are renaming
	* @param {string} type The type of object we are renaming. Can be either 'behaviour', 'group' or 'asset'
	* @param {string} projectId The ID of the project
	* @param {( result : number ) => void} callback The callback function
	* @param {http.ServerRequest} request
	* @param {http.ServerResponse} response
	*/
	renameObject( name: string, objectId: string, type: string, projectId: string, callback?:( result: number ) => void, request?: http.ServerRequest, response?: http.ServerResponse )
	{
		if ( !name || !projectId || !objectId || !type )
		{
			if ( callback )
				return callback( null );
			else
				return new ErrorController( utils.ErrorCodes.INVALID_INPUT, "invalid input detected" ).processRequest( request, response, "" );
		}

		projectId = projectId.trim();
		name = name.trim();
		objectId = objectId.trim();
		type = type.trim();
		var that = this;

		logger.log( "Renaming '" + objectId + "' to '" + name + "' for project (" + projectId + ")...", logger.LogType.ADMIN );

		UserController.singleton.loggedIn( function ( loggedIn: boolean, user: userModel.User )
		{
			// If not logged in then do nothing
			if ( !loggedIn )
			{
				if ( callback )
					return callback( null );
				else
					return new ErrorController( utils.ErrorCodes.AUTHENTICATION_REQUIRED, "Authentication is required to call this function" ).processRequest( request, response, "" );
			}

			// Check for rights
			that.checkPrivileges( user._id.toString(), projectId, projectModel.PrivilegeType.WRITE, function ( hasRights: boolean )
			{
				if ( hasRights )
				{
					that.getProject( projectId, function ( proj: projectModel.Project )
					{
						if ( !proj )
						{
							if ( callback )
								return callback( null );
							else
								return new ErrorController( utils.ErrorCodes.INVALID_INPUT, "Could not find the project with the id '" + projectId + "'" ).processRequest( request, response, "" );
						}

						if ( name == "" || !validator.isSafeCharacters( name ) )
							return new ErrorController( utils.ErrorCodes.INVALID_INPUT, "Please specify a valid name" ).processRequest( request, response, "" );
						if ( type == "" || !validator.isSafeCharacters( type ) )
							return new ErrorController( utils.ErrorCodes.INVALID_INPUT, "Please specify a valid type" ).processRequest( request, response, "" );
						if ( objectId == "" || !validator.isValidObjectID( objectId ) )
							return new ErrorController( utils.ErrorCodes.INVALID_INPUT, "Please specify a valid object ID" ).processRequest( request, response, "" );

						var collection: string = "";
						if ( type == "behaviour" )
							collection = "behaviours";
						else if ( type == "group" )
							collection = "groups";
						else if ( type == "asset" )
							collection = "assets";

						Model.collections( collection ).update( { _id: new mongodb.ObjectID( objectId ) }, { $set: { name : name } }, function ( err: any, result: number )
						{
							if ( err )
							{
								if ( callback )
									return callback( null );
								else
									return new ErrorController( utils.ErrorCodes.DATABASE_ERROR, err ).processRequest( request, response, "" );
							}

							if ( result == 0 )
							{
								if ( callback )
									return callback( null );
								else
									return new ErrorController( utils.ErrorCodes.INVALID_INPUT, "Could not find object to be named" ).processRequest( request, response, "" );
							}

							logger.log( "Successfully named '" + objectId + "' to '" + name + "' for project (" + projectId + ")...", logger.LogType.SUCCESS );

							if ( callback )
								callback( result );
							else
								return viewJSON.render( {
									message: type + " successfully renamed to " + name,
									id: objectId,
									type: type,
									name: name
								}, request, response, viewJSON.ReturnType.SUCCESS );
						});

					}, request, response );
				}
				else
				{
					if ( callback )
						return callback( null );
					else
						return new ErrorController( utils.ErrorCodes.AUTHENTICATION_REQUIRED, "Write authentication is required to call this function" ).processRequest( request, response, "" );
				}
			}, request, response );
		}, request, response );
	}



	/**
	* Gets a project from an ID
	* @param {string} id The ID of the project
	* @param {( project: projectModel.Project ) => void} callback The callback function
	* @param {http.ServerRequest} request
	* @param {http.ServerResponse} response
	*/
	getProject( id: string, callback?: ( project: projectModel.Project ) => void, request?: http.ServerRequest, response?: http.ServerResponse )
	{
		if ( !id )
		{
			if ( callback )
				return callback( null );
			else
				return new ErrorController( utils.ErrorCodes.INVALID_INPUT, "invalid input detected" ).processRequest( request, response, "" );
		}

		id = id.trim();

		logger.log( "Getting project " + id, logger.LogType.ADMIN );


		if ( id == "" || !validator.isValidObjectID( id ) )
			return new ErrorController( utils.ErrorCodes.INVALID_INPUT, "Please specify a valid project" ).processRequest( request, response, "" );

		// First get the project
		Model.collections( "projects" ).find( { _id: new mongodb.ObjectID( id ) }, function ( err, result: mongodb.Cursor )
		{
			if ( err )
			{
				if ( callback )
					return callback( null );
				else
					return new ErrorController( utils.ErrorCodes.DATABASE_ERROR, err ).processRequest( request, response, "" );
			}

			result.nextObject( function ( err: any, project: projectModel.Project )
			{
				if ( err )
				{
					if ( callback )
						return callback( null );
					else
						return new ErrorController( utils.ErrorCodes.DATABASE_ERROR, err ).processRequest( request, response, "" );
				}

				callback( project );
			});
		});
	}


	/**
	* Gets an array of files that are associated with a project
	* @param {string} projectId The ID of the project
	* @param {string} mode Which files to get - either 'user', 'project' or 'global'
	* @param {( behaviours: Array<fileModel.File> ) => void} callback The callback function
	* @param {http.ServerRequest} request
	* @param {http.ServerResponse} response
	*/
	getFiles( projectId: string, mode: string, callback?: ( behaviours: Array<fileModel.File> ) => void, request?: http.ServerRequest, response?: http.ServerResponse )
	{
		if ( !projectId )
		{
			if ( callback )
				return callback( null );
			else
				return new ErrorController( utils.ErrorCodes.INVALID_INPUT, "invalid input detected" ).processRequest( request, response, "" );
		}

		var that = this;

		logger.log( "Getting files for project '" + projectId + "' on mode '" + mode +"'", logger.LogType.ADMIN );

		UserController.singleton.loggedIn( function ( loggedIn: boolean, user: userModel.User )
		{
			// If not logged in then do nothing
			if ( !loggedIn )
			{
				if ( callback )
					return callback( null );
				else
					return new ErrorController( utils.ErrorCodes.AUTHENTICATION_REQUIRED, "Authentication is required to call this function" ).processRequest( request, response, "" );
			}

			// Check for rights
			that.checkPrivileges( user._id.toString(), projectId, projectModel.PrivilegeType.READ, function ( hasRights: boolean )
			{
				if ( hasRights )
				{
					that.getProject( projectId, function ( proj: projectModel.Project )
					{
						if ( !proj )
						{
							if ( callback )
								return callback( null );
							else
								return new ErrorController( utils.ErrorCodes.INVALID_INPUT, "Could not find the project with the id '" + projectId + "'" ).processRequest( request, response, "" );
						}

						// If no files - then return empty array
						if ( mode == "project" && proj.files.length == 0 )
							return viewJSON.render( [], request, response, viewJSON.ReturnType.SUCCESS );

						// Create the file query by getting each of the file ID's associated with the project
						var query;
						if ( mode == "project" )
						{
							query = { $or: [] };
							for ( var i = 0, l = proj.files.length; i < l; i++ )
								query.$or.push( { _id: new mongodb.ObjectID( proj.files[i] ) });
						}
						else if ( mode == "global" )
							query = { global: true };
						else if( mode == "user" )
							query = { user: user._id };

						console.log( JSON.stringify( query ) );

						Model.collections( "files" ).find( query, function ( err: any, cursor: mongodb.Cursor )
						{
							if ( err )
							{
								if ( callback )
									return callback( null );
								else
									return new ErrorController( utils.ErrorCodes.DATABASE_ERROR, err ).processRequest( request, response, "" );
							}

							cursor.toArray( function ( err: any, files: Array<fileModel.File> )
							{
								if ( err )
								{
									if ( callback )
										return callback( null );
									else
										return new ErrorController( utils.ErrorCodes.DATABASE_ERROR, err ).processRequest( request, response, "" );
								}

								if ( callback )
									callback( files );
								else
									return viewJSON.render( files, request, response, viewJSON.ReturnType.SUCCESS );
							});
						});

					}, request, response );
				}
				else
				{
					if ( callback )
						return callback( null );
					else
						return new ErrorController( utils.ErrorCodes.AUTHENTICATION_REQUIRED, "Read authentication is required to call this function" ).processRequest( request, response, "" );
				}
			}, request, response );
		}, request, response );
	}


	/**
	* Gets an array of assets that are associated with a project
	* @param {string} projectId The ID of the project
	* @param {( behaviours: Array<assetModel.Asset> ) => void} callback The callback function
	* @param {http.ServerRequest} request
	* @param {http.ServerResponse} response
	*/
	getAssets( projectId: string, callback?: ( behaviours: Array<assetModel.Asset> ) => void, request?: http.ServerRequest, response?: http.ServerResponse )
	{
		if ( !projectId )
		{
			if ( callback )
				return callback( null );
			else
				return new ErrorController( utils.ErrorCodes.INVALID_INPUT, "invalid input detected" ).processRequest( request, response, "" );
		}

		var that = this;

		logger.log( "Getting assets for project '" + projectId + "'", logger.LogType.ADMIN );

		UserController.singleton.loggedIn( function ( loggedIn: boolean, user: userModel.User )
		{
			// If not logged in then do nothing
			if ( !loggedIn )
			{
				if ( callback )
					return callback( null );
				else
					return new ErrorController( utils.ErrorCodes.AUTHENTICATION_REQUIRED, "Authentication is required to call this function" ).processRequest( request, response, "" );
			}

			// Check for rights
			that.checkPrivileges( user._id.toString(), projectId, projectModel.PrivilegeType.READ, function ( hasRights: boolean )
			{
				if ( hasRights )
				{
					that.getProject( projectId, function ( proj: projectModel.Project )
					{
						if ( !proj )
						{
							if ( callback )
								return callback( null );
							else
								return new ErrorController( utils.ErrorCodes.INVALID_INPUT, "Could not find the project with the id '" + projectId + "'" ).processRequest( request, response, "" );
						}

						Model.collections( "assets" ).find( { project_id : proj._id }, function ( err: any, cursor: mongodb.Cursor )
						{
							if ( err )
							{
								if ( callback )
									return callback( null );
								else
									return new ErrorController( utils.ErrorCodes.DATABASE_ERROR, err ).processRequest( request, response, "" );
							}

							cursor.toArray( function ( err: any, assets: Array<assetModel.Asset> )
							{
								if ( err )
								{
									if ( callback )
										return callback( null );
									else
										return new ErrorController( utils.ErrorCodes.DATABASE_ERROR, err ).processRequest( request, response, "" );
								}

								if ( callback )
									callback( assets );
								else
									return viewJSON.render( assets, request, response, viewJSON.ReturnType.SUCCESS );
							});
						});

					}, request, response );
				}
				else
				{
					if ( callback )
						return callback( null );
					else
						return new ErrorController( utils.ErrorCodes.AUTHENTICATION_REQUIRED, "Read authentication is required to call this function" ).processRequest( request, response, "" );
				}
			}, request, response );
		}, request, response );
	}



	/**
	* Gets an array of groups that are associated with a project
	* @param {string} projectId The ID of the project
	* @param {( behaviours: Array<groupModel.Group> ) => void} callback The callback function
	* @param {http.ServerRequest} request
	* @param {http.ServerResponse} response
	*/
	getProjectGroups( projectId: string, callback?: ( behaviours: Array<groupModel.Group> ) => void, request?: http.ServerRequest, response?: http.ServerResponse )
	{
		if ( !projectId )
		{
			if ( callback )
				return callback( null );
			else
				return new ErrorController( utils.ErrorCodes.INVALID_INPUT, "invalid input detected" ).processRequest( request, response, "" );
		}

		var that = this;

		logger.log( "Getting groups for project '" + projectId + "'", logger.LogType.ADMIN );

		UserController.singleton.loggedIn( function ( loggedIn: boolean, user: userModel.User )
		{
			// If not logged in then do nothing
			if ( !loggedIn )
			{
				if ( callback )
					return callback( null );
				else
					return new ErrorController( utils.ErrorCodes.AUTHENTICATION_REQUIRED, "Authentication is required to call this function" ).processRequest( request, response, "" );
			}

			// Check for rights
			that.checkPrivileges( user._id.toString(), projectId, projectModel.PrivilegeType.READ, function ( hasRights: boolean )
			{
				if ( hasRights )
				{
					that.getProject( projectId, function ( proj: projectModel.Project )
					{
						if ( !proj )
						{
							if ( callback )
								return callback( null );
							else
								return new ErrorController( utils.ErrorCodes.INVALID_INPUT, "Could not find the project with the id '" + projectId + "'" ).processRequest( request, response, "" );
						};

						Model.collections( "groups" ).find( { project_id : proj._id }, function ( err: any, cursor: mongodb.Cursor )
						{
							if ( err )
							{
								if ( callback )
									return callback( null );
								else
									return new ErrorController( utils.ErrorCodes.DATABASE_ERROR, err ).processRequest( request, response, "" );
							}

							cursor.toArray( function ( err: any, groups: Array<groupModel.Group> )
							{
								if ( err )
								{
									if ( callback )
										return callback( null );
									else
										return new ErrorController( utils.ErrorCodes.DATABASE_ERROR, err ).processRequest( request, response, "" );
								}

								if ( callback )
									callback( groups );
								else
									return viewJSON.render( groups, request, response, viewJSON.ReturnType.SUCCESS );
							});
						});

					}, request, response );
				}
				else
				{
					if ( callback )
						return callback( null );
					else
						return new ErrorController( utils.ErrorCodes.AUTHENTICATION_REQUIRED, "Read authentication is required to call this function" ).processRequest( request, response, "" );
				}
			}, request, response );
		}, request, response );
	}


	/**
	* Removes project objects
	* @param {string} collection The collection name of which objects we are deleting
	* @param {string} projectId The ID of the project
	* @param {Array<string>} ids An array of ID's that need to be removed
	* @param {( numDeleted : number ) => void} callback The callback function
	* @param {http.ServerRequest} request
	* @param {http.ServerResponse} response
	*/
	deleteProjectObjects( collection : string, projectId: string, ids: Array<string>, callback?: ( numDeleted: number ) => void, request?: http.ServerRequest, response?: http.ServerResponse )
	{
		if ( !collection || !projectId )
		{
			if ( callback )
				return callback( null );
			else
				return new ErrorController( utils.ErrorCodes.INVALID_INPUT, "invalid input detected" ).processRequest( request, response, "" );
		}

		var that = this;

		logger.log( "Deleting " + collection + " for project '" + projectId + "'", logger.LogType.ADMIN );

		UserController.singleton.loggedIn( function ( loggedIn: boolean, user: userModel.User )
		{
			// If not logged in then do nothing
			if ( !loggedIn )
			{
				if ( callback )
					return callback( 0 );
				else
					return new ErrorController( utils.ErrorCodes.AUTHENTICATION_REQUIRED, "Authentication is required to call this function" ).processRequest( request, response, "" );
			}

			// Check for rights
			that.checkPrivileges( user._id.toString(), projectId, projectModel.PrivilegeType.WRITE, function ( hasRights: boolean )
			{
				if ( hasRights )
				{
					that.getProject( projectId, function ( proj: projectModel.Project )
					{
						if ( !proj )
						{
							if ( callback )
								return callback( 0 );
							else
								return new ErrorController( utils.ErrorCodes.INVALID_INPUT, "Could not find the project with the id '" + projectId + "'" ).processRequest( request, response, "" );
						}

						// Make sure all the IDs are ok
						for ( var i = 0, l = ids.length; i < l; i++ )
							if ( !validator.isValidObjectID( ids[i] ) )
								return new ErrorController( utils.ErrorCodes.INVALID_INPUT, "Some of the ID's provided are not in the correct format" ).processRequest( request, response, "" );

						// Create the group query by getting each of the group ID's associated with the project
						var query = { $or: [] };
						for ( var i = 0, l = ids.length; i < l; i++ )
							query.$or.push( { _id: new mongodb.ObjectID( ids[i] ) });

						Model.collections( collection ).remove( query, function ( err: any, numdeleted: number )
						{
							if ( err )
							{
								if ( callback )
									return callback( 0 );
								else
									return new ErrorController( utils.ErrorCodes.DATABASE_ERROR, err ).processRequest( request, response, "" );
							}

							logger.log( collection + " [" + ids.join(",") + "] for project '" + projectId + "' have been deleted", logger.LogType.SUCCESS );

							if ( callback )
								callback( numdeleted );
							else
								return viewJSON.render( ids, request, response, viewJSON.ReturnType.SUCCESS );
						});

					}, request, response );
				}
				else
				{
					if ( callback )
						return callback( 0 );
					else
						return new ErrorController( utils.ErrorCodes.AUTHENTICATION_REQUIRED, "Write authentication is required to call this function" ).processRequest( request, response, "" );
				}
			}, request, response );
		}, request, response );
	}



	/**
	* Removes project objects
	* @param {string} projectId The ID of the project
	* @param {Array<number>} localIds An array of ID's that need to be removed
	* @param {( numDeleted : number ) => void} callback The callback function
	* @param {http.ServerRequest} request
	* @param {http.ServerResponse} response
	*/
	deleteScripts( projectId: string, localIds: Array<number>, callback?: ( numDeleted: number ) => void, request?: http.ServerRequest, response?: http.ServerResponse )
	{
		var that = this;

		logger.log( "Deleting scripts for project '" + projectId + "'", logger.LogType.ADMIN );

		UserController.singleton.loggedIn( function ( loggedIn: boolean, user: userModel.User )
		{
			// If not logged in then do nothing
			if ( !loggedIn )
			{
				if ( callback )
					return callback( 0 );
				else
					return new ErrorController( utils.ErrorCodes.AUTHENTICATION_REQUIRED, "Authentication is required to call this function" ).processRequest( request, response, "" );
			}

			// Check for rights
			that.checkPrivileges( user._id.toString(), projectId, projectModel.PrivilegeType.WRITE, function ( hasRights: boolean )
			{
				if ( hasRights )
				{
					that.getProject( projectId, function ( proj: projectModel.Project )
					{
						if ( !proj )
						{
							if ( callback )
								return callback( 0 );
							else
								return new ErrorController( utils.ErrorCodes.INVALID_INPUT, "Could not find the project with the id '" + projectId + "'" ).processRequest( request, response, "" );
						}

						// Make sure all the IDs are ok
						for ( var i = 0, l = localIds.length; i < l; i++ )
							if ( isNaN( localIds[i] ) )
								return new ErrorController( utils.ErrorCodes.INVALID_INPUT, "Some of the ID's provided are not in the correct format" ).processRequest( request, response, "" );

						// Create the group query by getting each of the group ID's associated with the project
						var query = { $or: [] };
						for ( var i = 0, l = localIds.length; i < l; i++ )
							query.$or.push( { $and: [{ shallowId: localIds[i] }, { project_id: proj._id } ] });

						Model.collections( "scripts" ).remove( query, function ( err: any, numdeleted: number )
						{
							if ( err )
							{
								if ( callback )
									return callback( 0 );
								else
									return new ErrorController( utils.ErrorCodes.DATABASE_ERROR, err ).processRequest( request, response, "" );
							}

							logger.log( "Scripts [" + localIds.join( "," ) + "] for project '" + projectId + "' have been deleted", logger.LogType.SUCCESS );

							if ( callback )
								callback( numdeleted );
							else
								return viewJSON.render( localIds, request, response, viewJSON.ReturnType.SUCCESS );
						});

					}, request, response );
				}
				else
				{
					if ( callback )
						return callback( 0 );
					else
						return new ErrorController( utils.ErrorCodes.AUTHENTICATION_REQUIRED, "Write authentication is required to call this function" ).processRequest( request, response, "" );
				}
			}, request, response );
		}, request, response );
	}


	/**
	* Removes project behaviours
	* @param {string} projectId The ID of the project
	* @param {Array<string>} ids An array of ID's that need to be removed
	* @param {( numDeleted : number ) => void} callback The callback function
	* @param {http.ServerRequest} request
	* @param {http.ServerResponse} response
	*/
	deleteBehaviours( projectId: string, ids: Array<string>, callback?: ( numDeleted: number ) => void, request?: http.ServerRequest, response?: http.ServerResponse )
	{
		var that = this;

		logger.log( "Deleting behaviours for project '" + projectId + "'", logger.LogType.ADMIN );

		UserController.singleton.loggedIn( function ( loggedIn: boolean, user: userModel.User )
		{
			// If not logged in then do nothing
			if ( !loggedIn )
			{
				if ( callback )
					return callback( 0 );
				else
					return new ErrorController( utils.ErrorCodes.AUTHENTICATION_REQUIRED, "Authentication is required to call this function" ).processRequest( request, response, "" );
			}

			// Check for rights
			that.checkPrivileges( user._id.toString(), projectId, projectModel.PrivilegeType.WRITE, function ( hasRights: boolean )
			{
				if ( hasRights )
				{
					that.getProject( projectId, function ( proj: projectModel.Project )
					{
						if ( !proj )
						{
							if ( callback )
								return callback( 0 );
							else
								return new ErrorController( utils.ErrorCodes.INVALID_INPUT, "Could not find the project with the id '" + projectId + "'" ).processRequest( request, response, "" );
						}

						// Make sure all the IDs are ok
						for ( var i = 0, l = ids.length; i < l; i++ )
							if ( !validator.isValidObjectID( ids[i] ) )
								return new ErrorController( utils.ErrorCodes.INVALID_INPUT, "Some of the ID's provided are not in the correct format" ).processRequest( request, response, "" );

						// Delete all scripts associated with a behaviour
						var tempIds = ids.slice( 0, ids.length );
						function deleteScript()
						{
							if ( tempIds.length == 0 )
							{
								finishDeleteBehaviours();
								return;
							}

							var tempId : string = tempIds.pop();

							Model.collections( "behaviours" ).findOne( { _id: new mongodb.ObjectID(tempId) }, function ( err : any, b : behaviourModel.Behaviour )
							{
								if ( !b )
									if ( callback )
										return callback( 0 );
									else
										return new ErrorController( utils.ErrorCodes.INVALID_INPUT, "Could not find behaviour " + tempId ).processRequest( request, response, "" );

								that.deleteScriptsByContainer( b.shallowId, projectId, function ( numDeleted: number )
								{
									deleteScript();
								}, request, response );
							});
						}

						deleteScript();

						// Finish off the operation by deleting the behaviours
						function finishDeleteBehaviours()
						{
							// Create the group query by getting each of the group ID's associated with the project
							var query = { $or: [] };
							for ( var i = 0, l = ids.length; i < l; i++ )
								query.$or.push( { _id: new mongodb.ObjectID( ids[i] ) });

							Model.collections( "behaviours" ).remove( query, function ( err: any, numdeleted: number )
							{
								if ( err )
								{
									if ( callback )
										return callback( 0 );
									else
										return new ErrorController( utils.ErrorCodes.DATABASE_ERROR, err ).processRequest( request, response, "" );
								}

								logger.log( "Behaviours [" + ids.join( "," ) + "] for project '" + projectId + "' have been deleted", logger.LogType.SUCCESS );

								if ( callback )
									callback( numdeleted );
								else
									return viewJSON.render( ids, request, response, viewJSON.ReturnType.SUCCESS );
							});
						}

					}, request, response );
				}
				else
				{
					if ( callback )
						return callback( 0 );
					else
						return new ErrorController( utils.ErrorCodes.AUTHENTICATION_REQUIRED, "Write authentication is required to call this function" ).processRequest( request, response, "" );
				}
			}, request, response );
		}, request, response );
	}


	/**
	* Removes scipt objects
	* @param {number} containerId The local ID of the container this script belongs to
	* @param {string} projectId The ID of the project
	* @param {Array<string>} ids An array of ID's that need to be removed
	* @param {( numDeleted : number ) => void} callback The callback function
	* @param {http.ServerRequest} request
	* @param {http.ServerResponse} response
	*/
	deleteScriptsByContainer( containerId: number, projectId: string, callback?: ( numDeleted: number ) => void, request?: http.ServerRequest, response?: http.ServerResponse )
	{
		if ( !containerId || !projectId )
		{
			if ( callback )
				return callback( null );
			else
				return new ErrorController( utils.ErrorCodes.INVALID_INPUT, "invalid input detected" ).processRequest( request, response, "" );
		}

		var that = this;

		logger.log( "Deleting scripts for project '" + projectId + "' and container '" + containerId +"'", logger.LogType.ADMIN );

		UserController.singleton.loggedIn( function ( loggedIn: boolean, user: userModel.User )
		{
			// If not logged in then do nothing
			if ( !loggedIn )
			{
				if ( callback )
					return callback( 0 );
				else
					return new ErrorController( utils.ErrorCodes.AUTHENTICATION_REQUIRED, "Authentication is required to call this function" ).processRequest( request, response, "" );
			}

			// Check for rights
			that.checkPrivileges( user._id.toString(), projectId, projectModel.PrivilegeType.WRITE, function ( hasRights: boolean )
			{
				if ( hasRights )
				{
					that.getProject( projectId, function ( proj: projectModel.Project )
					{
						if ( !proj )
						{
							if ( callback )
								return callback( 0 );
							else
								return new ErrorController( utils.ErrorCodes.INVALID_INPUT, "Could not find the project with the id '" + projectId + "'" ).processRequest( request, response, "" );
						}

						Model.collections( "scripts" ).remove( { container_id : containerId }, function ( err: any, numdeleted: number )
						{
							if ( err )
							{
								if ( callback )
									return callback( 0 );
								else
									return new ErrorController( utils.ErrorCodes.DATABASE_ERROR, err ).processRequest( request, response, "" );
							}

							logger.log( "Scripts for project '" + projectId + "' and container '"+ containerId +"' have been deleted", logger.LogType.SUCCESS );

							if ( callback )
								callback( numdeleted );
							else
								return viewJSON.render( "Scripts for project '" + projectId + "' and container '" + containerId + "' have been deleted", request, response, viewJSON.ReturnType.SUCCESS );
						});

					}, request, response );
				}
				else
				{
					if ( callback )
						return callback( 0 );
					else
						return new ErrorController( utils.ErrorCodes.AUTHENTICATION_REQUIRED, "Write authentication is required to call this function" ).processRequest( request, response, "" );
				}
			}, request, response );
		}, request, response );
	}

	/**
	* Removes project files
	* @param {string} projectId The ID of the project
	* @param {Array<string>} ids An array of ID's that need to be removed
	* @param {( idsDeleted: Array<string> ) => void} callback The callback function
	* @param {http.ServerRequest} request
	* @param {http.ServerResponse} response
	*/
	deleteFiles( projectId: string, ids: Array<string>, callback?: ( idsDeleted: Array<string> ) => void, request?: http.ServerRequest, response?: http.ServerResponse )
	{
		var that = this;
		logger.log( "Deleting files from project '" + projectId + "'", logger.LogType.ADMIN );

		UserController.singleton.loggedIn( function ( loggedIn: boolean, user: userModel.User )
		{
			// If not logged in then do nothing
			if ( !loggedIn )
			{
				if ( callback )
					return callback( null );
				else
					return new ErrorController( utils.ErrorCodes.AUTHENTICATION_REQUIRED, "Authentication is required to call this function" ).processRequest( request, response, "" );
			}

			// Check for rights
			that.checkPrivileges( user._id.toString(), projectId, projectModel.PrivilegeType.WRITE, function ( hasRights: boolean )
			{
				if ( hasRights )
				{
					that.getProject( projectId, function ( proj: projectModel.Project )
					{
						if ( !proj )
						{
							if ( callback )
								return callback( null );
							else
								return new ErrorController( utils.ErrorCodes.INVALID_INPUT, "Could not find the project with the id '" + projectId + "'" ).processRequest( request, response, "" );
						}

						// Make sure all the IDs are ok
						for ( var i = 0, l = ids.length; i < l; i++ )
							if ( !validator.isValidObjectID( ids[i] ) )
							{
								if ( callback )
									return callback( null );
								else
									return new ErrorController( utils.ErrorCodes.INVALID_INPUT, "Some of the ID's provided are not in the correct format" ).processRequest( request, response, "" );
							}

						var tempIds: Array<string> = ids.slice( 0, ids.length );
						var idsToDelete: Array<string> = [];

						// Remove the reference of the files in the project
						function removeFromProjects()
						{
							if ( tempIds.length == 0 )
							{
								// Reset the ids
								tempIds = ids.slice( 0, ids.length );
								checkExternalUsage();
								return;
							}

							Model.collections( "projects" ).update( { _id: proj._id }, { $pull: { files: tempIds.pop() } }, function ( err: any, result : any)
							{
								if ( err )
								{
									if ( callback )
										return callback( null );
									else
										return new ErrorController( utils.ErrorCodes.INVALID_INPUT, err ).processRequest( request, response, "" );
								}

								removeFromProjects();
							});
						}

						logger.log( "Removing the references of the files in the project" );
						removeFromProjects();



						// Since the files are removed from this project, we check if its used anywhere else.
						// If it is, then don't delete it
						function checkExternalUsage()
						{
							logger.log( "Checking external usage of file..." );



							if ( tempIds.length == 0 )
							{
								deleteFloatingFiles();
								return;
							}

							var idToCheck: string = tempIds.pop();
							Model.collections( "projects" ).count( { files: idToCheck }, function ( err: any, count: number )
							{
								if ( count == 0 )
								{
									idsToDelete.push( idToCheck );
									logger.log( "'" + idToCheck + "' isolated and must be deleted" );
								}
								else
									logger.log( "'" + idToCheck + "' still in use" );

								checkExternalUsage();
							});
						}

						// Now remove the files that have no more references
						function deleteFloatingFiles()
						{
							logger.log( "Deleting [" + idsToDelete.length + "] files..." );

							// Create the group query by getting each of the group ID's associated with the project
							var query = { $or: [] };
							for ( var i = 0, l = idsToDelete.length; i < l; i++ )
								query.$or.push( { _id: new mongodb.ObjectID( idsToDelete[i] ) });

							Model.collections( "files" ).find( query, function ( err: any, cursor: mongodb.Cursor )
							{
								if ( err )
								{
									if ( callback )
										return callback( null );
									else
										return new ErrorController( utils.ErrorCodes.DATABASE_ERROR, err ).processRequest( request, response, "" );
								}

								cursor.toArray( function ( err: any, files: Array<fileModel.File> )
								{
									if ( err )
									{
										if ( callback )
											return callback( null );
										else
											return new ErrorController( utils.ErrorCodes.DATABASE_ERROR, err ).processRequest( request, response, "" );
									}

									for ( var i = 0, l = files.length; i < l; i++ )
									{
										logger.log( "Deleting [" + files[i].name + "]..." );

										if ( fs.existsSync( files[i].path ) )
										{
											fs.unlinkSync( files[i].path );
											logger.log( "Deleted [" + files[i].path + "]..." );
										}

										if ( fs.existsSync( files[i].previewPath ) )
										{
											fs.unlinkSync( files[i].previewPath );
											logger.log( "Deleted [" + files[i].previewPath + "]..." );
										}
									}

									Model.collections( "files" ).remove( query, function( err: any, numRemoved: number )
									{
										if ( err )
										{
											if ( callback )
												return callback( null );
											else
												return new ErrorController( utils.ErrorCodes.DATABASE_ERROR, err ).processRequest( request, response, "" );
										}


										logger.log( "All ["+ numRemoved +"] files have removed", logger.LogType.SUCCESS );

										if ( callback )
											return callback( idsToDelete );
										else
											return viewJSON.render( idsToDelete, request, response, viewJSON.ReturnType.SUCCESS );
									});
								});
							});
						}

					}, request, response );
				}
				else
				{
					if ( callback )
						return callback( null );
					else
						return new ErrorController( utils.ErrorCodes.AUTHENTICATION_REQUIRED, "Write authentication is required to call this function" ).processRequest( request, response, "" );
				}
			}, request, response );
		}, request, response );
	}


	/**
	* Saves the HTML of the project
	* @param {string} projectId The ID of the project
	* @param {string} html The html of the project
	* @param {( numUpdated: number ) => void} callback The callback function
	* @param {http.ServerRequest} request
	* @param {http.ServerResponse} response
	*/
	saveHTML( projectId: string, html: string, callback?: ( numUpdated: number ) => void, request?: http.ServerRequest, response?: http.ServerResponse )
	{
		html = html.trim();
		var that = this;
		logger.log( "Saving html for project '" + projectId + "'", logger.LogType.ADMIN );


		UserController.singleton.loggedIn( function ( loggedIn: boolean, user: userModel.User )
		{
			// If not logged in then do nothing
			if ( !loggedIn )
			{
				if ( callback )
					return callback( 0 );
				else
					return new ErrorController( utils.ErrorCodes.AUTHENTICATION_REQUIRED, "Authentication is required to call this function" ).processRequest( request, response, "" );
			}

			// Check for rights
			that.checkPrivileges( user._id.toString(), projectId, projectModel.PrivilegeType.WRITE, function ( hasRights: boolean )
			{
				if ( hasRights )
				{
					that.getProject( projectId, function ( proj: projectModel.Project )
					{
						if ( !proj )
						{
							if ( callback )
								return callback( 0 );
							else
								return new ErrorController( utils.ErrorCodes.INVALID_INPUT, "Could not find the project with the id '" + projectId + "'" ).processRequest( request, response, "" );
						}

						logger.log( "Getting the build associated with the project..." );

						Model.collections( "builds" ).findOne( { _id : proj.buildId }, function ( err: any, build: buildModel.Build )
						{
							if ( err )
							{
								if ( callback )
									return callback( 0 );
								else
									return new ErrorController( utils.ErrorCodes.DATABASE_ERROR, err ).processRequest( request, response, "" );
							}


							if ( !build )
							{
								if ( callback )
									return callback( 0 );
								else
									return new ErrorController( utils.ErrorCodes.INVALID_INPUT, "No build found" ).processRequest( request, response, "" );
							}

							html = sanitizeHtml( html, {
								allowedTags: ( <any>sanitizeHtml ).defaults.allowedTags.concat( ["img", "h2"] ),
								allowedAttributes: { div: ["class"], img: ["class", "src"], span: ["class"], p: ["class"], a: ["class"], ul: ["class"], ol: ["class"], li: ["class"], table: ["class"], pre: ["class"], code: ["class"], h1: ["class"], h2: ["class"], h3: ["class"], h4: ["class"], h5: ["class"], h6: ["class"], b: ["class"], i: ["class"], em: ["class"], strong: ["class"]  }
							});

							Model.collections( "builds" ).update( { _id: build._id }, { $set: { html: html } }, function ( err: any, result: number )
							{
								if ( err )
								{
									if ( callback )
										return callback( null );
									else
										return new ErrorController( utils.ErrorCodes.INVALID_INPUT, err ).processRequest( request, response, "" );
								}

								logger.log( "HTML updated for project '" + projectId + " and build "+ build._id +" '...(" + html + ")", logger.LogType.SUCCESS );

								if ( callback )
									return callback( result );
								else
									return viewJSON.render( { message: "HTML updated" }, request, response, viewJSON.ReturnType.SUCCESS );
							});
						});

					}, request, response );
				}
				else
				{
					if ( callback )
						return callback( null );
					else
						return new ErrorController( utils.ErrorCodes.AUTHENTICATION_REQUIRED, "Write authentication is required to call this function" ).processRequest( request, response, "" );
				}
			}, request, response );
		}, request, response );
	}


	/**
	* Saves the CSS of the project
	* @param {string} projectId The ID of the project
	* @param {string} css The css of the project
	* @param {( numAffected: number ) => void} callback The callback function
	* @param {http.ServerRequest} request
	* @param {http.ServerResponse} response
	*/
	saveCSS( projectId: string, css: string, callback?: ( numAffected: number ) => void, request?: http.ServerRequest, response?: http.ServerResponse )
	{
		css = css.trim();
		var that = this;
		logger.log( "Saving css for project '" + projectId + "'", logger.LogType.ADMIN );


		UserController.singleton.loggedIn( function ( loggedIn: boolean, user: userModel.User )
		{
			// If not logged in then do nothing
			if ( !loggedIn )
			{
				if ( callback )
					return callback( null );
				else
					return new ErrorController( utils.ErrorCodes.AUTHENTICATION_REQUIRED, "Authentication is required to call this function" ).processRequest( request, response, "" );
			}

			// Check for rights
			that.checkPrivileges( user._id.toString(), projectId, projectModel.PrivilegeType.WRITE, function ( hasRights: boolean )
			{
				if ( hasRights )
				{
					that.getProject( projectId, function ( proj: projectModel.Project )
					{
						if ( !proj )
						{
							if ( callback )
								return callback( null );
							else
								return new ErrorController( utils.ErrorCodes.INVALID_INPUT, "Could not find the project with the id '" + projectId + "'" ).processRequest( request, response, "" );
						}

						logger.log( "Getting the build associated with the project..." );

						Model.collections( "builds" ).findOne( { _id: proj.buildId }, function ( err: any, build: buildModel.Build )
						{
							if ( err )
							{
								if ( callback )
									return callback( 0 );
								else
									return new ErrorController( utils.ErrorCodes.DATABASE_ERROR, err ).processRequest( request, response, "" );
							}


							if ( !build )
							{
								if ( callback )
									return callback( 0 );
								else
									return new ErrorController( utils.ErrorCodes.INVALID_INPUT, "No build found" ).processRequest( request, response, "" );
							}

							css = sanitizeHtml( css, { allowedTags: ( <any>sanitizeHtml ).defaults.allowedTags });
							Model.collections( "builds" ).update( { _id: build._id }, { $set: { css: css } }, function ( err: any, result: number )
							{
								if ( err )
								{
									if ( callback )
										return callback( null );
									else
										return new ErrorController( utils.ErrorCodes.INVALID_INPUT, err ).processRequest( request, response, "" );
								}

								logger.log( "CSS updated for project '" + projectId + "'...(" + css + ")", logger.LogType.SUCCESS );

								if ( callback )
									return callback( result );
								else
									return viewJSON.render( { message: "CSS updated" }, request, response, viewJSON.ReturnType.SUCCESS );
							});
						});

					}, request, response );
				}
				else
				{
					if ( callback )
						return callback( null );
					else
						return new ErrorController( utils.ErrorCodes.AUTHENTICATION_REQUIRED, "Write authentication is required to call this function" ).processRequest( request, response, "" );
				}
			}, request, response );
		}, request, response );
	}


	/**
	* Saves data into a collection based on an array of object ID's
	* @param {string} collection The collection we are saving to
	* @param {string} projectId The ID of the project
	* @param {Array<string>} ids An array of ID's that need to be saved
	* @param {Array<any>} updateQueries An array of mongo queries that will be updated - the index of each query must be the same as the ids array
	* @param {( ids: Array<mongodb.ObjectID> ) => void} callback The callback function
	* @param {http.ServerRequest} request
	* @param {http.ServerResponse} response
	*/
	saveData( collection: string, projectId: string, ids: Array<string>, updateQueries: Array<any>, callback?: ( ids: Array<mongodb.ObjectID> ) => void, request?: http.ServerRequest, response?: http.ServerResponse )
	{
		if ( !collection || !projectId )
		{
			if ( callback )
				return callback( null );
			else
				return new ErrorController( utils.ErrorCodes.INVALID_INPUT, "invalid input detected" ).processRequest( request, response, "" );
		}

		var that = this;

		logger.log( "Saving " + collection +" for project '" + projectId + "'", logger.LogType.ADMIN );

		// Make sure arrays match
		if ( ids.length != updateQueries.length )
		{
			if ( callback )
				return callback( null );
			else
				return new ErrorController( utils.ErrorCodes.INVALID_INPUT, "Arrays do not match" ).processRequest( request, response, "" );
		}

		UserController.singleton.loggedIn( function ( loggedIn: boolean, user: userModel.User )
		{
			// If not logged in then do nothing
			if ( !loggedIn )
			{
				if ( callback )
					return callback( null );
				else
					return new ErrorController( utils.ErrorCodes.AUTHENTICATION_REQUIRED, "Authentication is required to call this function" ).processRequest( request, response, "" );
			}

			// Check for rights
			that.checkPrivileges( user._id.toString(), projectId, projectModel.PrivilegeType.WRITE, function ( hasRights: boolean )
			{
				if ( hasRights )
				{
					that.getProject( projectId, function ( proj: projectModel.Project )
					{
						if ( !proj )
						{
							if ( callback )
								return callback( null );
							else
								return new ErrorController( utils.ErrorCodes.INVALID_INPUT, "Could not find the project with the id '" + projectId + "'" ).processRequest( request, response, "" );
						}

						var shallowIds

						// Make sure all the IDs are ok
						for ( var i = 0, l = ids.length; i < l; i++ )
							if ( !validator.isValidObjectID( ids[i] ) )
								return new ErrorController( utils.ErrorCodes.INVALID_INPUT, "Some of the ID's provided are not in the correct format" ).processRequest( request, response, "" );


						var numAffected: number = 0;
						var items = [];

						// Recursively call update for each of the IDs
						function update()
						{
							if ( ids.length == 0 )
							{
								logger.log( "Objects ["+ items.join(",") +"] for project '" + projectId + "' has been updated", logger.LogType.SUCCESS );

								if ( callback )
									callback( items );
								else
									return viewJSON.render( items, request, response, viewJSON.ReturnType.SUCCESS );
							}

							var id: string = ids.pop();
							var query: any = updateQueries.pop();

							// Get each object by its id
							Model.collections( collection ).findOne( { _id: new mongodb.ObjectID( id ) }, function ( err: any, item: any )
							{
								// Error - do nothing
								if ( err )
								{
									if ( callback )
										return callback( null );
									else
										return new ErrorController( utils.ErrorCodes.DATABASE_ERROR, err ).processRequest( request, response, "" );
								}

								if ( item )
								{
									items.push( item._id );

									console.log( JSON.stringify( query ) );

									// Get each object by its id
									Model.collections( collection ).update( { _id: item._id }, query, function ( err: any, result: number )
									{
										numAffected += result;
										update();
									});
								}
								else
									update();
							});
						}

						// Update each record
						update();

					}, request, response );
				}
				else
				{
					if ( callback )
						return callback( null );
					else
						return new ErrorController( utils.ErrorCodes.AUTHENTICATION_REQUIRED, "Write authentication is required to call this function" ).processRequest( request, response, "" );
				}
			}, request, response );
		}, request, response );
	}


	/**
	* Saves build data
	* @param {string} projectId The id of the project
	* @param {string} buildId The build we are updating
	* @param {string} notes Any release notes for this build
	* @param {string} visibility If the build is public or not
	* @param {string} html The html associated with the build
	* @param {string} css The CSS associated with the build
	* @param {(numAffected : number) => void} callback The callback function
	* @param {http.ServerRequest} request
	* @param {http.ServerResponse} response
	*/
	saveBuild( projectId: string, buildId: string, notes?: string, visibility?: string, html?: string, css?: string, callback?: ( numAffected : number ) => void, request?: http.ServerRequest, response?: http.ServerResponse )
	{
		var that = this;

		buildId = buildId.trim();

		logger.log( "Saving build for project '" + projectId + "'", logger.LogType.ADMIN );

		UserController.singleton.loggedIn( function ( loggedIn: boolean, user: userModel.User )
		{
			// If not logged in then do nothing
			if ( !loggedIn )
			{
				if ( callback )
					return callback( null );
				else
					return new ErrorController( utils.ErrorCodes.AUTHENTICATION_REQUIRED, "Authentication is required to call this function" ).processRequest( request, response, "" );
			}

			// Check for rights
			that.checkPrivileges( user._id.toString(), projectId, projectModel.PrivilegeType.WRITE, function ( hasRights: boolean )
			{
				if ( hasRights )
				{
					that.getProject( projectId, function ( proj: projectModel.Project )
					{
						if ( !proj )
						{
							if ( callback )
								return callback( null );
							else
								return new ErrorController( utils.ErrorCodes.INVALID_INPUT, "Could not find the project with the id '" + projectId + "'" ).processRequest( request, response, "" );
						}

						logger.log( "Checking build id '" + buildId + "'..." );

						if ( !validator.isValidObjectID( buildId ) )
						{
							if ( callback )
								return callback( null );
							else
								return new ErrorController( utils.ErrorCodes.INVALID_INPUT, "Please provide a valid build ID" ).processRequest( request, response, "" );
						}

						logger.log( "Check if build exists and ready it for update..." );

						// Get the file
						Model.collections( "builds" ).findOne( { _id: new mongodb.ObjectID( buildId ) }, function ( err: any, build: buildModel.Build )
						{
							if ( err )
							{
								if ( callback )
									return callback( null );
								else
									return new ErrorController( utils.ErrorCodes.INVALID_INPUT, err ).processRequest( request, response, "" );
							}

							if ( !build )
							{
								if ( callback )
									return callback( null );
								else
									return new ErrorController( utils.ErrorCodes.INVALID_INPUT, "Could not find a build with that ID" ).processRequest( request, response, "" );
							}

							logger.log( "Build exists, updating..." );

							html = sanitizeHtml( html );

							var updateToken: any = { $set: {} };
							updateToken.$set.build_notes = ( notes === undefined ? build.build_notes : sanitizeHtml( notes, { allowedTags: [] }) );
							updateToken.$set.css = ( css === undefined ? build.css : css );
							updateToken.$set.html = ( html === undefined ? build.html : html );
							updateToken.$set.visibility = ( visibility === undefined ? build.visibility : visibility );

							Model.collections( "builds" ).update( { _id: build._id }, updateToken, function ( err: any, numAffected: number )
							{
								if ( callback )
									return callback( numAffected );
								else
									return viewJSON.render( { message : "Build updated" }, request, response, viewJSON.ReturnType.SUCCESS );
							});
						});

					}, request, response );
				}
				else
				{
					if ( callback )
						return callback( null );
					else
						return new ErrorController( utils.ErrorCodes.AUTHENTICATION_REQUIRED, "Write authentication is required to call this function" ).processRequest( request, response, "" );
				}
			}, request, response );
		}, request, response );
	}


	/**
	* Saves file data
	* @param {string} projectId The id of the project
	* @param {string} fileId The file we are updating
	* @param {string} name The new name of the file.
	* @param {Array<string>} tags The new comma separated tags of the file.
	* @param {bool} favourite If this file is a favourite
	* @param {bool} global True or false if this file is shared globally
	* @param {(file : fileModel.File) => void} callback The callback function
	* @param {http.ServerRequest} request
	* @param {http.ServerResponse} response
	*/
	saveFile( projectId: string, fileId: string, name?: string, tags?: Array<string>, favourite?: boolean, global?: boolean, callback?: ( file : fileModel.File) => void, request?: http.ServerRequest, response?: http.ServerResponse )
	{
		var that = this;

		fileId = fileId.trim();

		logger.log( "Saving file for project '" + projectId + "'", logger.LogType.ADMIN );

		UserController.singleton.loggedIn( function ( loggedIn: boolean, user: userModel.User )
		{
			// If not logged in then do nothing
			if ( !loggedIn )
			{
				if ( callback )
					return callback( null );
				else
					return new ErrorController( utils.ErrorCodes.AUTHENTICATION_REQUIRED, "Authentication is required to call this function" ).processRequest( request, response, "" );
			}

			// Check for rights
			that.checkPrivileges( user._id.toString(), projectId, projectModel.PrivilegeType.WRITE, function ( hasRights: boolean )
			{
				if ( hasRights )
				{
					that.getProject( projectId, function ( proj: projectModel.Project )
					{
						if ( !proj )
						{
							if ( callback )
								return callback( null );
							else
								return new ErrorController( utils.ErrorCodes.INVALID_INPUT, "Could not find the project with the id '" + projectId + "'" ).processRequest( request, response, "" );
						}

						logger.log( "Check file id '" + fileId + "'...");

						if ( !validator.isValidObjectID( fileId ) )
						{
							if ( callback )
								return callback( null );
							else
								return new ErrorController( utils.ErrorCodes.INVALID_INPUT, "Please provide a valid file ID" ).processRequest( request, response, "" );
						}

						logger.log( "Check if file exists and ready it for update..." );

						// Get the file
						Model.collections( "files" ).findOne( { _id : new mongodb.ObjectID(fileId) }, function ( err: any, file: fileModel.File )
						{
							if ( err )
							{
								if ( callback )
									return callback( null );
								else
									return new ErrorController( utils.ErrorCodes.INVALID_INPUT, err ).processRequest( request, response, "" );
							}

							if ( !file )
							{
								if ( callback )
									return callback( null );
								else
									return new ErrorController( utils.ErrorCodes.INVALID_INPUT, "Could not find a file with that ID" ).processRequest( request, response, "" );
							}

							logger.log( "File exists, update..." );

							var updateToken : any = { $set: {} };
							updateToken.$set.name = ( name === undefined ? file.name : sanitizeHtml( name, { allowedTags : [] } ) );
							updateToken.$set.tags = ( tags === undefined ? file.tags : tags );
							updateToken.$set.favourite = ( favourite === undefined ? file.favourite : favourite );
							updateToken.$set.global = ( global === undefined ? file.global : global );

							file.name = updateToken.$set.name;
							file.tags = updateToken.$set.tags;
							file.favourite = updateToken.$set.favourite;
							file.global = updateToken.$set.global;

							Model.collections( "files" ).update( { _id: file._id }, updateToken, function ( err: any, numAffected : number )
							{
								if ( callback )
									return callback( file );
								else
									return viewJSON.render( file, request, response, viewJSON.ReturnType.SUCCESS );
							});
						});

					}, request, response );
				}
				else
				{
					if ( callback )
						return callback( null );
					else
						return new ErrorController( utils.ErrorCodes.AUTHENTICATION_REQUIRED, "Write authentication is required to call this function" ).processRequest( request, response, "" );
				}
			}, request, response );
		}, request, response );
	}



	/**
	* Imports a global file into a project
	* @param {string} projectId The id of the project
	* @param {Array<string>} ids The id's of the files to import
	* @param {(numAfected : number) => void} callback The callback function
	* @param {http.ServerRequest} request
	* @param {http.ServerResponse} response
	*/
	importFiles( projectId: string, ids?: Array<string>, callback?: ( numAffected : number ) => void, request?: http.ServerRequest, response?: http.ServerResponse )
	{
		var that = this;

		logger.log( "Importing files for project '" + projectId + "'", logger.LogType.ADMIN );

		UserController.singleton.loggedIn( function ( loggedIn: boolean, user: userModel.User )
		{
			// If not logged in then do nothing
			if ( !loggedIn )
			{
				if ( callback )
					return callback( 0 );
				else
					return new ErrorController( utils.ErrorCodes.AUTHENTICATION_REQUIRED, "Authentication is required to call this function" ).processRequest( request, response, "" );
			}

			// Check for rights
			that.checkPrivileges( user._id.toString(), projectId, projectModel.PrivilegeType.WRITE, function ( hasRights: boolean )
			{
				if ( hasRights )
				{
					that.getProject( projectId, function ( proj: projectModel.Project )
					{
						if ( !proj )
						{
							if ( callback )
								return callback( 0 );
							else
								return new ErrorController( utils.ErrorCodes.INVALID_INPUT, "Could not find the project with the id '" + projectId + "'" ).processRequest( request, response, "" );
						}

						logger.log( "Checking file ids..." );

						var findToken = { $or : [] }

						for ( var i = 0, l = ids.length; i < l; i++ )
						{
							if ( !validator.isValidObjectID( ids[i] ) )
							{
								if ( callback )
									return callback( 0 );
								else
									return new ErrorController( utils.ErrorCodes.INVALID_INPUT, "Please provide valid file ID's" ).processRequest( request, response, "" );
							}

							findToken.$or.push( { $and: [{ _id: new mongodb.ObjectID( ids[i] ) }, { global: true }] });
							findToken.$or.push( { $and: [{ _id: new mongodb.ObjectID( ids[i] ) }, { user: user._id }] });
						}

						console.log( JSON.stringify( findToken )  );

						// Get the file
						Model.collections( "files" ).find( findToken, function ( err: any, cursor: mongodb.Cursor )
						{
							if ( err )
							{
								if ( callback )
									return callback( 0 );
								else
									return new ErrorController( utils.ErrorCodes.DATABASE_ERROR, err ).processRequest( request, response, "" );
							}

							cursor.toArray( function ( err: any, files: Array<fileModel.File> )
							{
								if ( err )
								{
									if ( callback )
										return callback( 0 );
									else
										return new ErrorController( utils.ErrorCodes.DATABASE_ERROR, err ).processRequest( request, response, "" );
								}

								// Make sure files exist
								if ( files.length != ids.length )
								{
									if ( callback )
										return callback( 0 );
									else
										return new ErrorController( utils.ErrorCodes.INVALID_INPUT, "Could not find files specified" ).processRequest( request, response, "" );
								}

								// Update the projects files array
								var updateToken = { $addToSet: { files: { $each: [] } } }
								for ( var i = 0, l = ids.length; i < l; i++ )
									updateToken.$addToSet.files.$each.push( ids[i] );

								Model.collections( "projects" ).update( { _id: proj._id }, updateToken, function ( err: any, numResults: number )
								{
									if ( err )
									{
										if ( callback )
											return callback( 0 );
										else
											return new ErrorController( utils.ErrorCodes.DATABASE_ERROR, err ).processRequest( request, response, "" );
									}

									logger.log( "[" + numResults + "] files imported", logger.LogType.SUCCESS );

									if ( callback )
										return callback( numResults );
									else
										return viewJSON.render( { message: "[" + numResults + "] files imported" }, request, response, viewJSON.ReturnType.SUCCESS );

								});
							});

						});

					}, request, response );
				}
				else
				{
					if ( callback )
						return callback( null );
					else
						return new ErrorController( utils.ErrorCodes.AUTHENTICATION_REQUIRED, "Write authentication is required to call this function" ).processRequest( request, response, "" );
				}
			}, request, response );
		}, request, response );
	}


	/**
	* Fetches objects by specifying a collection and list of ID's
	* @param {string} collection The collection from where the objects need to be fetched
	* @param {string} projectId The ID of the project
	* @param {Array<string>} ids An array of ID's that need to be removed
	* @param {( items : Array<any> ) => void} callback The callback function
	* @param {http.ServerRequest} request
	* @param {http.ServerResponse} response
	*/
	getObjectsID( collection : string, projectId: string, ids: Array<string>, callback?: ( items: Array<any> ) => void, request?: http.ServerRequest, response?: http.ServerResponse )
	{
		if ( !collection || !projectId )
		{
			if ( callback )
				return callback( null );
			else
				return new ErrorController( utils.ErrorCodes.INVALID_INPUT, "invalid input detected" ).processRequest( request, response, "" );
		}

		var that = this;

		logger.log( "Getting objects for project '" + projectId + "' using collection " + collection, logger.LogType.ADMIN );

		UserController.singleton.loggedIn( function ( loggedIn: boolean, user: userModel.User )
		{
			// If not logged in then do nothing
			if ( !loggedIn )
			{
				if ( callback )
					return callback( null );
				else
					return new ErrorController( utils.ErrorCodes.AUTHENTICATION_REQUIRED, "Authentication is required to call this function" ).processRequest( request, response, "" );
			}

			// Check for rights
			that.checkPrivileges( user._id.toString(), projectId, projectModel.PrivilegeType.READ, function ( hasRights: boolean )
			{
				if ( hasRights )
				{
					that.getProject( projectId, function ( proj: projectModel.Project )
					{
						if ( !proj )
						{
							if ( callback )
								return callback( null );
							else
								return new ErrorController( utils.ErrorCodes.INVALID_INPUT, "Could not find the project with the id '" + projectId + "'" ).processRequest( request, response, "" );
						}

						// Make sure all the IDs are ok
						for ( var i = 0, l = ids.length; i < l; i++ )
							if ( !validator.isValidObjectID( ids[i] ) )
								return new ErrorController( utils.ErrorCodes.INVALID_INPUT, "Some of the ID's provided are not in the correct format" ).processRequest( request, response, "" );

						// Create the file query by getting each of the file ID's associated with the project
						var query = { $or: [] };
						for ( var i = 0, l = ids.length; i < l; i++ )
							query.$or.push( { _id: new mongodb.ObjectID( ids[i] ) });


						Model.collections( collection ).find( query, function( err: any, cursor: mongodb.Cursor )
						{
							if ( err )
							{
								if ( callback )
									return callback( null );
								else
									return new ErrorController( utils.ErrorCodes.DATABASE_ERROR, err ).processRequest( request, response, "" );
							}

							cursor.toArray( function ( err: any, items: Array<any> )
							{
								if ( err )
								{
									if ( callback )
										return callback( null );
									else
										return new ErrorController( utils.ErrorCodes.DATABASE_ERROR, err ).processRequest( request, response, "" );
								}

								logger.log( "Objects [" + ids.join( "," ) + "] for project '" + projectId + "' and collection '"+ collection +"' have been fetched", logger.LogType.SUCCESS );

								if ( callback )
									callback( items );
								else
									return viewJSON.render( items, request, response, viewJSON.ReturnType.SUCCESS );
							});
						});

					}, request, response );
				}
				else
				{
					if ( callback )
						return callback( null );
					else
						return new ErrorController( utils.ErrorCodes.AUTHENTICATION_REQUIRED, "Read authentication is required to call this function" ).processRequest( request, response, "" );
				}
			}, request, response );
		}, request, response );
	}


	/**
	* Gets an array of behaviours that are associated with a project
	* @param {string} projectId The ID of the project
	* @param {( behaviours: Array<behaviourModel.Behaviour> ) => void} callback The callback function
	* @param {http.ServerRequest} request
	* @param {http.ServerResponse} response
	*/
	getBehaviours( projectId: string, callback?: ( behaviours: Array<behaviourModel.Behaviour> ) => void, request?: http.ServerRequest, response?: http.ServerResponse )
	{
		if ( !projectId )
		{
			if ( callback )
				return callback( null );
			else
				return new ErrorController( utils.ErrorCodes.INVALID_INPUT, "invalid input detected" ).processRequest( request, response, "" );
		}

		var that = this;

		logger.log( "Getting behaviour list for project '" + projectId + "'", logger.LogType.ADMIN );

		UserController.singleton.loggedIn( function( loggedIn: boolean, user: userModel.User )
		{
			// If not logged in then do nothing
			if ( !loggedIn )
			{
				if ( callback )
					return callback( null );
				else
					return new ErrorController( utils.ErrorCodes.AUTHENTICATION_REQUIRED, "Authentication is required to call this function" ).processRequest( request, response, "" );
			}

			// Check for rights
			that.checkPrivileges( user._id.toString(), projectId, projectModel.PrivilegeType.READ, function ( hasRights: boolean )
			{
				if ( hasRights )
				{
					that.getProject( projectId, function ( proj: projectModel.Project )
					{
						if ( !proj )
						{
							if ( callback )
								return callback( null );
							else
								return new ErrorController( utils.ErrorCodes.INVALID_INPUT, "Could not find the project with the id '" + projectId + "'" ).processRequest( request, response, "" );
						}

						Model.collections( "behaviours" ).find( { project_id: proj._id }, function ( err: any, cursor: mongodb.Cursor )
						{
							if ( err )
							{
								if ( callback )
									return callback( null );
								else
									return new ErrorController( utils.ErrorCodes.DATABASE_ERROR, err ).processRequest( request, response, "" );
							}

							cursor.toArray( function ( err: any, behaviours : Array<behaviourModel.Behaviour>)
							{
								if ( err )
								{
									if ( callback )
										return callback( null );
									else
										return new ErrorController( utils.ErrorCodes.DATABASE_ERROR, err ).processRequest( request, response, "" );
								}

								if ( callback )
									callback( behaviours );
								else
									return viewJSON.render( behaviours, request, response, viewJSON.ReturnType.SUCCESS );
							});
						});

					}, request, response );
				}
				else
				{
					if ( callback )
						return callback( null );
					else
						return new ErrorController( utils.ErrorCodes.AUTHENTICATION_REQUIRED, "Read authentication is required to call this function" ).processRequest( request, response, "" );
				}
			}, request, response );
		}, request, response);
	}


	/**
	* Checks a project to see if a user has rights act on it. A reference 'access' is passed to test the level of rights.
	* @param {string} userID The user id of the user we are getting privileges for
	* @param {string} projectID The id of the project
	* @param {projectModel.PrivilegeType} access The type of access we are checking for
	* @param {( hasRights: boolean ) => void} callback Callback function called with a true or false answer
	* @param {http.ServerRequest} request
	* @param {http.ServerResponse} response
	*/
	checkPrivileges( userID: string = "", projectID: string = "", access: projectModel.PrivilegeType = projectModel.PrivilegeType.READ, callback?: ( hasRights: boolean ) => void, request?: http.ServerRequest, response?: http.ServerResponse )
	{
		if ( userID.toString().trim() == "" || !validator.isValidObjectID( userID.toString().trim() ) ) return new ErrorController( utils.ErrorCodes.INVALID_INPUT, "Please specify a valid user" ).processRequest( request, response, "" );
		if ( projectID.toString().trim() == "" || !validator.isValidObjectID( projectID.toString().trim() ) ) return new ErrorController( utils.ErrorCodes.INVALID_INPUT, "Please specify a valid project" ).processRequest( request, response, "" );
		if ( access.toString().trim() == "" ) return new ErrorController( utils.ErrorCodes.INVALID_INPUT, "Please specify a valid access type" ).processRequest( request, response, "" );

		logger.log( "Getting user " + userID + "'s access on project " + projectID + "...", logger.LogType.ADMIN );

		if ( userID == userModel.User.adminId.toString() )
		{
			logger.log( "Admin user has access...", logger.LogType.SUCCESS );

			if ( callback )
				callback( true );
			else
				return viewJSON.render( { hasRights: true, message: "User has rights" }, request, response, viewJSON.ReturnType.SUCCESS );
		}

		// First get the user
		Model.collections( "users" ).findOne( { _id: new mongodb.ObjectID( userID.trim() ) }, function ( err: any, user: userModel.User )
		{
			if ( err )
			{
				logger.log( "User does not have access..." );

				if ( callback )
					return callback( false );
				else
					return new ErrorController( utils.ErrorCodes.DATABASE_ERROR, err ).processRequest( request, response, "" );
			}

			if ( !user )
			{
				logger.log( "User does not have access..." );

				if ( callback )
					return callback( false );
				else
					return new ErrorController( utils.ErrorCodes.DATABASE_ERROR, "Could not find the user '"+ userID +"'" ).processRequest( request, response, "" );
			}

			checkAccess( user );
		});

		function checkAccess( user: userModel.User )
		{
			if ( user.userType == userModel.UserType.ADMIN )
			{
				logger.log( "User has access...", logger.LogType.SUCCESS );

				if ( callback )
					return callback( true );
				else
					return viewJSON.render( { hasRights: true, message: "User has rights" }, request, response, viewJSON.ReturnType.SUCCESS );
			}

			Model.collections( "projects" ).findOne( { _id: new mongodb.ObjectID( projectID.trim() ) }, function ( err: any, project: projectModel.Project)
			{
				if ( err )
				{
					logger.log( "User does not have access..." );

					if ( callback )
						return callback( false );
					else
						return new ErrorController( utils.ErrorCodes.DATABASE_ERROR, err ).processRequest( request, response, "" );
				}

				if ( !project )
				{
					logger.log( "User does not have access..." );

					if ( callback )
						return callback( false );
					else
						return new ErrorController( utils.ErrorCodes.INVALID_INPUT, "Project found" ).processRequest( request, response, "" );
				}

				var hasAccess: boolean = false;
				if ( user._id.toString() == userModel.User.adminId.toString() )
					hasAccess = true;
				else if ( access == projectModel.PrivilegeType.ADMIN )
				{
					if ( project.admin_privileges.indexOf( userID ) != -1 )
						hasAccess = true;
				}
				else if ( access == projectModel.PrivilegeType.WRITE )
				{
					if ( project.admin_privileges.indexOf( userID ) != -1 )
						hasAccess = true;
					else if ( project.write_privileges.indexOf( userID ) != -1 )
						hasAccess = true;
				}
				else
				{
					if ( project.admin_privileges.indexOf( userID ) != -1 )
						hasAccess = true;
					else if ( project.write_privileges.indexOf( userID ) != -1 )
						hasAccess = true;
					else if ( project.read_privileges.indexOf( userID ) != -1 )
						hasAccess = true;
				}

				logger.log( "User has access...", logger.LogType.SUCCESS );

				if ( callback )
					return callback( hasAccess );
				else
					return new viewJSON.render( { hasPrivileges: hasAccess, message: ( hasAccess ? "User has rights" : "User does not have rights" ) }, request, response, viewJSON.ReturnType.SUCCESS );
			});
		}
	}


	/**
	* Gives a user privileges to a project
	* @param {Array<string>} ids An array of user ID's to set the
	* @param {Array<projectModel.PrivilegeType>} access The type of access we are checking for
	* @param {string} projectId The id of the project
	* @param {( hasRights: boolean ) => void} callback Callback function called with a true or false answer
	* @param {http.ServerRequest} request
	* @param {http.ServerResponse} response
	*/
	setPrivileges( ids: Array<string>, access: Array<projectModel.PrivilegeType>, projectId: string = "", callback?: ( hasRights: boolean ) => void, request?: http.ServerRequest, response?: http.ServerResponse ): void
	{
		if ( ids.length != access.length )
			return new ErrorController( utils.ErrorCodes.INVALID_INPUT, "Number of users do not mactch number of privileges" ).processRequest( request, response, "" );

		// Check ids
		for ( var i = 0, l = ids.length; i < l; i++)
			if ( !validator.isValidObjectID( ids[i] ) )
				return new ErrorController( utils.ErrorCodes.INVALID_INPUT, "Please only use valid object ID's" ).processRequest( request, response, "" );

		var that = this;

		UserController.singleton.loggedIn( function ( loggedIn: boolean, user: userModel.User )
		{
			// If not logged in then do nothing
			if ( !loggedIn )
			{
				if ( callback )
					return callback( null );
				else
					return new ErrorController( utils.ErrorCodes.AUTHENTICATION_REQUIRED, "Authentication is required to call this function" ).processRequest( request, response, "" );
			}

			// Get the project
			that.getProject( projectId, function ( proj: projectModel.Project )
			{
				if ( !proj )
				{
					if ( callback )
						return callback( null );
					else
						return new ErrorController( utils.ErrorCodes.AUTHENTICATION_REQUIRED, "Could not find the project with the id '" + projectId + "'" ).processRequest( request, response, "" );
				}

				// Make sure they have admin access
				that.checkPrivileges( user._id.toString(), projectId, projectModel.PrivilegeType.ADMIN, function ( hasRights: boolean )
				{
					var totalNumAffected: number = 0;

					if ( !hasRights )
					{
						if ( callback )
							return callback( false );
						else
							return new ErrorController( utils.ErrorCodes.AUTHENTICATION_REQUIRED, "You must be an admin to set privileges" ).processRequest( request, response, "" );
					}

					function setPrivilege()
					{
						if ( ids.length == 0 )
						{
							logger.log( "Updated [" + totalNumAffected + "] user privileges for project " + projectId, logger.LogType.SUCCESS );
							return viewJSON.render( { message: "Updated [" + totalNumAffected + "] user privileges for project " + projectId }, request, response, viewJSON.ReturnType.SUCCESS );
						}

						var curID: string = ids.pop();
						var curPriv: projectModel.PrivilegeType = access.pop();

						// Get the target user
						UserController.singleton.getUser( curID, function ( targetUser: userModel.User )
						{
							// If not logged in then do nothing
							if ( !targetUser )
							{
								if ( callback )
									return callback( false );
								else
									return new ErrorController( utils.ErrorCodes.INVALID_INPUT, "Could not find user '" + curID + "'" ).processRequest( request, response, "" );
							}

							// First pull the user's current privileges
							var pullToken = {
								$pull: { admin_privileges: curID, write_privileges: curID, read_privileges: curID }
							};

							Model.collections( "projects" ).update( { _id: proj._id }, pullToken, function ( err: any, numAffected: number )
							{
								console.log( "Pull update " + numAffected );

								if ( err )
								{
									if ( callback )
										return callback( false );
									else
										return new ErrorController( utils.ErrorCodes.DATABASE_ERROR, err ).processRequest( request, response, "" );
								}

								var pushToken = {
									$push: {  }
								};

								if ( curPriv == projectModel.PrivilegeType.ADMIN )
									( <any>pushToken.$push ).admin_privileges = curID;
								else if ( curPriv == projectModel.PrivilegeType.READ )
									( <any>pushToken.$push ).read_privileges = curID;
								else if ( curPriv == projectModel.PrivilegeType.WRITE )
									( <any>pushToken.$push ).write_privileges = curID;

								Model.collections( "projects" ).update( { _id: proj._id }, pushToken, function ( err: any, numAffected: number )
								{
									console.log( "Push update " + numAffected );

									if ( err )
									{
										if ( callback )
											return callback( false );
										else
											return new ErrorController( utils.ErrorCodes.DATABASE_ERROR, err ).processRequest( request, response, "" );
									}

									totalNumAffected += numAffected;
									setPrivilege();
								});
							});

						}, request, response );
					}

					// Set privileges for each user in the array
					setPrivilege();

				}, request, response );

			}, request, response );

		}, request, response );
	}


	/**
	* Gets an array of projects that are owned by the logged in user. This function will only worked for users who are logged in.
	* @param {number} limit The number of projects to fetch
	* @param {number} startIndex The starting index from where we are fetching projects from
	* @param {( users: Array<projectModel.Project> ) => void} callback Callback function with an array of all projects
	* @param {http.ServerRequest} request
	* @param {http.ServerResponse} response
	*/
	public getUserProjects( limit: number = 0, startIndex: number = 0, callback?: ( users: Array<projectModel.Project> ) => void, request?: http.ServerRequest, response?: http.ServerResponse )
	{
		logger.log( "Getting " + limit.toString() + " projects from index " + startIndex.toString() + "...", logger.LogType.ADMIN );

		UserController.singleton.loggedIn( function ( loggedIn: boolean, user: userModel.User )
		{
			// If not logged in then do nothing
			if ( !loggedIn )
			{
				if ( callback )
					return callback( null );
				else
					return new ErrorController( utils.ErrorCodes.AUTHENTICATION_REQUIRED, "Authentication is required to call this function" ).processRequest( request, response, "" );
			}


			// Find all projects for the given user
			Model.collections( "projects" ).find(
				{
					$or: [
						{ user: user._id },
						{ admin_privileges: user._id.toString() },
						{ write_privileges: user._id.toString() },
						{ read_privileges: user._id.toString() }
					],
				}, {}, startIndex, limit, function ( err: any, result: mongodb.Cursor )
			{

				var token: any;
				if ( err || !result )
				{
					if ( callback )
						return callback( null );
					else
						return new ErrorController( utils.ErrorCodes.DATABASE_ERROR, err ).processRequest( request, response, "" );
					return;
				}

				result.toArray( function ( err: any, results: Array<projectModel.Project> )
				{
					if ( callback )
						return callback( results );
					else
						new viewJSON.render( results, request, response, viewJSON.ReturnType.SUCCESS );
				});
			});
		}, request, response);
	}



	/**
	* This function is used to implement plugins in a project.
	* @param {string} projectId The id of the project
	* @param {Array<string>} plugins An array of plugin ID's in string format
	* @param {http.ServerRequest} request
	* @param {http.ServerResponse} response
	*/
	public implementPlugins( projectId : string, plugins : Array<string>, request?: http.ServerRequest, response?: http.ServerResponse )
	{
		if ( !projectId )
			return new ErrorController( utils.ErrorCodes.INVALID_INPUT, "invalid input detected" ).processRequest( request, response, "" );


		var that = this;

		UserController.singleton.loggedIn( function( loggedIn: boolean, user: userModel.User )
		{
			// If not logged in then do nothing
			if ( !loggedIn )
				return new ErrorController( utils.ErrorCodes.AUTHENTICATION_REQUIRED, "Authentication is required to call this function" ).processRequest( request, response, "" );

			// Check for rights
			that.checkPrivileges( user._id.toString(), projectId, projectModel.PrivilegeType.WRITE, function( hasRights: boolean )
			{
				if ( hasRights )
				{
					that.getProject( projectId, function ( proj: projectModel.Project )
					{
						if ( !proj )
							return new ErrorController( utils.ErrorCodes.AUTHENTICATION_REQUIRED, "Could not find the project with the id '"+ projectId +"'" ).processRequest( request, response, "" );

						implement( user, proj );

					}, request, response);
				}
				else
					return new ErrorController( utils.ErrorCodes.AUTHENTICATION_REQUIRED, "Write authentication is required to call this function" ).processRequest( request, response, "" );

			}, request, response );
		}, request, response);

		// We have everything we need - start implementing
		function implement( user: userModel.User, project: projectModel.Project )
		{
			logger.log( "Implementing plugins for project '" + projectId + "'", logger.LogType.ADMIN )

			Model.collections( "projects" ).update( { _id: project._id }, { $set: { plugins: plugins } }, function ( err: any, result: number )
			{
				if ( err )
					return new ErrorController( utils.ErrorCodes.DATABASE_ERROR, err ).processRequest( request, response, "" );

				if ( result === 0 )
					return new ErrorController( utils.ErrorCodes.AUTHENTICATION_REQUIRED, "Could not implement plugins" ).processRequest( request, response, "" );

				new viewJSON.render( { message: "Successfully implemented plugins" }, request, response, viewJSON.ReturnType.SUCCESS );
			});
		}
	}


	/**
	* Creates a new Project for the user that is currently logged in.
	* @param {string} name The name of the project
	* @param {string} description The An optional short description
	* @param {(project: projectModel.Project, build : buildModel.Build) => void} callback Callback function with an array of all projects
	* @param {http.ServerRequest} request
	* @param {http.ServerResponse} response
	*/
	public createProject( name: string = "", description: string = "", callback?:( project: projectModel.Project, build : buildModel.Build ) => void, request?: http.ServerRequest, response?: http.ServerResponse ): void
	{
		// Trim the fields
		name = validator.trim( name );
		description = validator.trim( description );

		if ( !name || name == "" )
			return new ErrorController( utils.ErrorCodes.INVALID_OPTION, "Project name cannot be null or empty" ).processRequest( request, response, "" );


		// Check if the user is logged in
		function isUserLoggedIn( loggedIn: boolean, user: userModel.User )
		{
			// If not logged in then do nothing
			if ( !loggedIn )
				return new ErrorController( utils.ErrorCodes.AUTHENTICATION_REQUIRED, "Authentication is required to call this function" ).processRequest( request, response, "" );

			logger.log( "Creating a new project '" + name + "'...", logger.LogType.ADMIN );

			// Check if the user has reached the max project limit of projects
			Model.collections( "projects" ).count( { user: user._id },
				function ( err: any, result: number )
				{
					if ( err )
					{
						if ( callback )
							return callback( null, null );
						else
							return new ErrorController( utils.ErrorCodes.DATABASE_ERROR, err ).processRequest( request, response, "" );
					}

					if ( result >= user.maxProjects )
						return new ErrorController( utils.ErrorCodes.UPGRADE_PLAN, "You cannot create anymore projects on this plan. To upgrade please visit http://webinate.net/my-account/" ).processRequest( request, response, "" );

					// Seems to all check out - lets create that project!
					// First we add the build entry
					BuildController.singleton.createBuild( function ( build: buildModel.Build )
					{
						onBuildCreated( build, user );
					}, request, response );
				});
		};

		// Once the build has been created
		function onBuildCreated( build: buildModel.Build, user: userModel.User )
		{
			// Sanitize the fields
			var sanitizedName = sanitizeHtml( name, { allowedTags: [] });
			var sanitizedDescription = sanitizeHtml( description, { allowedTags: ["b", "strong", "ul", "ol", "li", "i", "pre"] });

			if ( sanitizedName != name )
			{
				if ( callback )
					return callback( null, null );
				else
					return new ErrorController( utils.ErrorCodes.INVALID_INPUT, "You cannot enter html tags, please only use alphanemeric characters." ).processRequest( request, response, "" );
			}

			if ( sanitizedDescription != description )
			{
				if ( callback )
					return callback( null, null );
				else
					return new ErrorController( utils.ErrorCodes.INVALID_INPUT, "You have illegal html elements in your description" ).processRequest( request, response, "" );
			}

			// Create the project
			var project = new projectModel.Project( user._id, build._id );
			project.description = sanitizedDescription;
			project.name = sanitizedName;

			//Now add the new project
			Model.collections( "projects" ).save( project, function( err: any, result: projectModel.Project )
			{
				var token: any;
				if ( err || !result )
				{
					if ( callback )
						return callback( null, null );
					else
						return new ErrorController( utils.ErrorCodes.DATABASE_ERROR, err).processRequest( request, response, "" );
				}

				onProjectCreated( project, build, user );
			});
		}

		// Once the project has been created
		function onProjectCreated( project: projectModel.Project, build : buildModel.Build, user : userModel.User )
		{
			logger.log( "Project '" + name + "' created, updating build...", logger.LogType.SUCCESS );

			Model.collections( "builds" ).update( { _id: build._id }, { $set: { projectId: project._id } },
				function ( err: any, result: buildModel.Build )
				{
					if ( err || !result )
					{
						if ( callback )
							return callback( null, null );
						else
							return new ErrorController( utils.ErrorCodes.DATABASE_ERROR, err ).processRequest( request, response, "" );
					}

					if ( callback )
						return callback( project, build );
					else
						new viewJSON.render( { project: project, build: build, message: "Successfully created project '" + name + "'" }, request, response, viewJSON.ReturnType.SUCCESS );
				});
		};

		// Check if user is logged in
		UserController.singleton.loggedIn( isUserLoggedIn, request, response );
	}


	/**
	* Gets project related objects from the database
	* @param {string} collection The collection we are fetching objects from
	* @param {number} limit The number of objects to fetch
	* @param {number} startIndex The starting index from where we are fetching objectss from
	* @param {( projects: Array<any> ) => void} callback The function to call when objects are downloaded
	* @param {http.ServerRequest} request
	* @param {http.ServerResponse} response
	*/
	public getObjects( collection: string, limit: number = 0, startIndex: number = 0, callback?: ( projects: Array<any> ) => void, request?: http.ServerRequest, response?: http.ServerResponse )
	{
		if ( !collection )
		{
			if ( callback )
				return callback( null );
			else
				return new ErrorController( utils.ErrorCodes.INVALID_INPUT, "invalid input detected" ).processRequest( request, response, "" );
		}

		logger.log( "Getting " + limit.toString() + " objects from collection '" + collection + "' from index " + startIndex.toString() + "...", logger.LogType.ADMIN );

		Model.collections( collection ).find( {}, {}, startIndex, limit, function ( err: any, result: mongodb.Cursor )
		{
			var token: any;
			if ( err || !result )
			{
				if ( callback )
					return callback( null );
				else
					return new ErrorController( utils.ErrorCodes.BAD_METHOD, err ).processRequest( request, response, "" );
			}

			result.toArray( function ( err: any, results: Array<any> )
			{
				if ( callback )
					return callback( results );
				else
					return viewJSON.render( results, request, response, viewJSON.ReturnType.SUCCESS );
			});
		});
	}


	/**
	* Prints project objects from the database
	* @param {number} limit The number of projects to fetch
	* @param {number} startIndex The starting index from where we are fetching projects from
	* @param {http.ServerRequest} request
	* @param {http.ServerResponse} response
	*/
	public print( limit: number = 0, startIndex: number = 0, request?: http.ServerRequest, response?: http.ServerResponse ): void
	{
		logger.log( "Printing projects...", logger.LogType.ADMIN );
		var that = this;

		UserController.singleton.loggedIn( function( val, user: userModel.User )
		{
			if ( !user )
				return viewJade.render( __dirname + "/../views/messages/error.jade", { message: "Authentication required" }, response );

			if ( !user || user.userType != userModel.UserType.ADMIN )
				return viewJade.render( __dirname + "/../views/messages/error.jade", { message: "You do not have permissions to view this content" }, response );

			that.getObjects( "projects", limit, startIndex, function ( projects: Array<projectModel.Project> )
			{
				for ( var i = 0, l = projects.length; i < l; i++ )
				{
					// Before sending data to jade, we need to get a nicely formatted html of the privileges
					var privileges = "<table>";

					// Admin
					privileges += "<tr><td>Admin: </td><td>";
					for ( var ps = 0, psl = projects[i].admin_privileges.length; ps < psl; ps++ )
						privileges += projects[i].admin_privileges[ps] + ( ps < psl ? ", " : "" );

					if ( projects[i].admin_privileges.length > 0 )
						privileges = privileges.substr( 0, privileges.length - 2 );
					privileges += "</td></tr>";

					// Write
					privileges += "<tr><td>Write: </td><td>";
					for ( var ps = 0, psl = projects[i].write_privileges.length; ps < psl; ps++ )
						privileges += projects[i].write_privileges[ps] + ( ps < psl ? ", " : "" );

					if ( projects[i].write_privileges.length > 0 )
						privileges = privileges.substr( 0, privileges.length - 2 );
					privileges += "</td></tr>";

					// Read
					privileges += "<tr><td>Read: </td><td>";
					for ( var ps = 0, psl = projects[i].read_privileges.length; ps < psl; ps++ )
						privileges += projects[i].read_privileges[ps] + ( ps < psl ? ", " : "" );

					if ( projects[i].read_privileges.length > 0 )
						privileges = privileges.substr( 0, privileges.length - 2 );
					privileges += "</td></tr>";


					privileges += "</table>";

					( <any>projects[i] ).privilegesStr = privileges;
				}
				return viewJade.render( __dirname + "/../views/admin/projects/print-projects.jade", { projects: projects }, response );
			}, null, null );

		}, request, response );
	}


	/**
	* Fetches models from the DB and calls its respective jade template
	* @param {number} collection The name of the collection to use
	* @param {number} jadePath The path of the jade file we are using to draw the objects
	* @param {number} limit The number of groups to fetch
	* @param {number} startIndex The starting index from where we are fetching groups from
	* @param {http.ServerRequest} request
	* @param {http.ServerResponse} response
	*/
	public printGeneric( collection: string = "", jadePath: string = "", limit: number = 0, startIndex: number = 0, request?: http.ServerRequest, response?: http.ServerResponse ): void
	{
		logger.log( "Printing " + collection +"..." );
		var that = this;

		if ( !collection || collection.trim() == "" )
			return viewJade.render( __dirname + "/../views/messages/error.jade", { message: "Please specify a collection" }, response );
		if ( !jadePath || jadePath.trim() == "" )
			return viewJade.render( __dirname + "/../views/messages/error.jade", { message: "Please specify a template" }, response );


		UserController.singleton.loggedIn( function ( val, user: userModel.User )
		{
			if ( !user )
				return viewJade.render( __dirname + "/../views/messages/error.jade", { message: "Authentication required" }, response );

			if ( !user || user.userType != userModel.UserType.ADMIN )
				return viewJade.render( __dirname + "/../views/messages/error.jade", { message: "You do not have permissions to view this content" }, response );

			that.getObjects( collection, limit, startIndex, function ( datums: Array<any> )
			{
				return viewJade.render( jadePath, { datums: datums }, response );
			}, null, null );

		}, request, response );
	}


	/**
	* Gets a chunk of users and their access to the project
	* @param {number} index The index of where to fetch users from
	* @param {number} limit The number of users to fetch
	* @param {string} projectId The ID of the project
	* @param {data : Array<{ userId: string; username: string; privilege: projectModel.PrivilegeType; }>) => void} callback The callback function
	* @param {http.ServerRequest} request
	* @param {http.ServerResponse} response
	*/
	getUserPrivileges( index: number = 0, limit: number = 0, projectId: string = "", callback?: ( data : Array<{ userId: string; username: string; privilege: projectModel.PrivilegeType; }> ) => void, request: http.ServerRequest = null, response: http.ServerResponse = null ): void
	{
		var that = this;

		// Check if user is logged in
		UserController.singleton.loggedIn( function ( loggedIn: boolean, user: userModel.User )
		{
			// If not logged in then do nothing
			if ( !loggedIn )
			{
				if ( callback )
					return callback( null );
				else
					return new ErrorController( utils.ErrorCodes.AUTHENTICATION_REQUIRED, "Authentication is required to call this function" ).processRequest( request, response, "" );
			}

			logger.log( "Getting user privileges for project " + projectId + "...", logger.LogType.ADMIN );

			that.checkPrivileges( user._id.toString(), projectId, projectModel.PrivilegeType.READ, function ( hasRights: boolean )
			{
				if ( hasRights )
				{
					that.getProject( projectId, function ( proj: projectModel.Project )
					{
						if ( !proj )
						{
							if ( callback )
								return callback( null );
							else
								return new ErrorController( utils.ErrorCodes.AUTHENTICATION_REQUIRED, "Could not find the project with the id '" + projectId + "'" ).processRequest( request, response, "" );
						}

						// Get the users
						UserController.singleton.getUsers( limit, index, request, response, function ( users: Array<userModel.User> )
						{
							if ( !users )
							{
								if ( callback )
									return callback( null );
								else
									return new ErrorController( utils.ErrorCodes.AUTHENTICATION_REQUIRED, "Could not find any users" ).processRequest( request, response, "" );
							}

							var toReturn: Array<{ userId: string; username: string; privilege: projectModel.PrivilegeType; }> = [];



							var read: string = projectModel.PrivilegeType.READ.toString();
							var write: string = projectModel.PrivilegeType.WRITE.toString();
							var admin: string = projectModel.PrivilegeType.ADMIN.toString();

							for ( var i = 0, l = users.length; i < l; i++ )
							{
								console.log( JSON.stringify( proj.read_privileges ) );
								console.log( JSON.stringify( proj.write_privileges ) );
								console.log( JSON.stringify( proj.admin_privileges ) );
								console.log( users[i].username + " has the id " + users[i]._id.toString() );

								if ( proj.read_privileges.indexOf( users[i]._id.toString() ) != -1 )
									toReturn.push( { userId: users[i]._id.toString(), username: users[i].username, privilege: projectModel.PrivilegeType.READ });
								else if ( proj.write_privileges.indexOf( users[i]._id.toString() ) != -1 )
									toReturn.push( { userId: users[i]._id.toString(), username: users[i].username, privilege: projectModel.PrivilegeType.WRITE });
								else if ( proj.admin_privileges.indexOf( users[i]._id.toString() ) != -1 )
									toReturn.push( { userId: users[i]._id.toString(), username: users[i].username, privilege: projectModel.PrivilegeType.ADMIN });
								else
									toReturn.push( { userId: users[i]._id.toString(), username: users[i].username, privilege: projectModel.PrivilegeType.NONE });
							}


							if ( callback )
								return callback( toReturn );
							else
								return viewJSON.render( toReturn, request, response, viewJSON.ReturnType.SUCCESS );
						});

					}, request, response );
				}
				else
				{
					if ( callback )
						return callback( null );
					else
						return new ErrorController( utils.ErrorCodes.INSUFFICIENT_ACCESS, "Insufficient access to get user rights" ).processRequest( request, response, "" );
				}
			}, request, response );

		}, request, response );
	}


	/**
	* Use this function to delete a project
	* @param {string} id The ID of the project
	* @param {(success : boolean ) => void} callback An optional callback function
	* @param {http.ServerRequest} request
	* @param {http.ServerResponse} response
	*/
	deleteProject( id: string = "", callback? : (success : boolean ) => void, request: http.ServerRequest = null, response: http.ServerResponse = null ): void
	{
		var that = this;

		if ( !id || id.trim() == "" || !validator.isValidObjectID( id ) )
		{
			if ( callback )
				callback( false );
			else
				return new ErrorController( utils.ErrorCodes.INVALID_OPTION, "Project ID cannot be null or empty" ).processRequest( request, response, "" );
		}

		// Check if user is logged in
		UserController.singleton.loggedIn( function ( loggedIn: boolean, user: userModel.User )
		{
			// If not logged in then do nothing
			if ( !loggedIn )
			{
				if ( callback )
					callback( false );
				else
					return new ErrorController( utils.ErrorCodes.AUTHENTICATION_REQUIRED, "Authentication is required to call this function" ).processRequest( request, response, "" );
			}

			logger.log( "Removing project " + id + "...", logger.LogType.ADMIN );

			that.checkPrivileges( user._id.toString(), id, projectModel.PrivilegeType.ADMIN, function( hasRights: boolean )
			{
				if ( hasRights )
				{
					that.getProject( id, function ( proj: projectModel.Project )
					{
						if ( !proj )
						{
							if ( callback )
								callback( false );
							else
								return new ErrorController( utils.ErrorCodes.AUTHENTICATION_REQUIRED, "Could not find the project with the id '" + id + "'" ).processRequest( request, response, "" );
						}

						// Remove the groups
						Model.collections( "groups" ).remove( { project_id: proj._id }, function ( err: any, result: number )
						{
							logger.log( "[" + result + "] groups removed for project " + id + "...", logger.LogType.SUCCESS );

							// Remove the behaviours
							Model.collections( "behaviours" ).remove( { project_id: proj._id }, function ( err: any, result: number )
							{
								logger.log( "[" + result + "] behaviours removed for project " + id + "...", logger.LogType.SUCCESS );

								// Remove the behaviours
								Model.collections( "assets" ).remove( { project_id: proj._id }, function ( err: any, result: number )
								{
									logger.log( "[" + result + "] assets removed for project " + id + "...", logger.LogType.SUCCESS );

									// Remove all project buids
									that.removeBuilds( id, function( numDeleted : number )
									{
										// Remove the behaviours
										Model.collections( "scripts" ).remove( { project_id: proj._id }, function ( err: any, result: number )
										{
											logger.log( "[" + result + "] scripts removed for project " + id + "...", logger.LogType.SUCCESS );

											// Remove all project files
											that.deleteFiles( id, proj.files, function ( ids: Array<string> )
											{
												logger.log( "files removed for project " + id + "...", logger.LogType.SUCCESS );

												// Cleanup project image
												if ( fs.existsSync( proj.imagePath ) )
													fs.unlinkSync( proj.imagePath );

												// Remove the project
												Model.collections( "projects" ).remove( { _id: new mongodb.ObjectID( id.trim() ) }, function ( err: any, result: number )
												{
													if ( err )
													{
														if ( callback )
															callback( false );
														else
															return new ErrorController( utils.ErrorCodes.DATABASE_ERROR, err ).processRequest( request, response, "" );
													}
													else
													{
														logger.log( "Project " + id + " has been removed", logger.LogType.SUCCESS );
														if ( callback )
															callback( true );
														else
															viewJSON.render( { message: "Project has been deleted" }, request, response, viewJSON.ReturnType.SUCCESS );
													}
												});
											}, request, response );
										});
									}, request, response);
								});
							});
						});

					}, request, response );


				}
				else
					return new ErrorController( utils.ErrorCodes.INSUFFICIENT_ACCESS, "Insufficient access to delete project" ).processRequest( request, response, "" );
			}, request, response );

		}, request, response );
	}


	/**
	* Gets an instance of the project controller
	* @returns {ProjectController}
	*/
	static get singleton(): ProjectController
	{
		if ( !ProjectController._singleton )
			ProjectController._singleton = new ProjectController();

		return ProjectController._singleton;
	}
}


export = ProjectController;