import http = require( "http" );
import formidable = require( "formidable" );
import ProjectController = require( "./ProjectController" );
import BaseController = require( "./BaseController" );
import ErrorController = require( "./ErrorController" );
import viewJSON = require( "../views/JSONRenderer" );
import viewJade = require( "../views/JadeRenderer" );
import util = require( "util" );
import utils = require( "../Utils" );
import validator = require( "../Validator" );
import Model = require( "../models/Model" );
import userModel = require( "../models/UserModel" );
import projectModel = require( "../models/ProjectModel" );
import fileModel = require( "../models/FileModel" );
import mongodb = require( "mongodb" );
import UserController = require( "./UserController" );
import logger = require( "../Logger" );
import url = require( "url" );
import fs = require( "fs" );
import path = require( "path" );

/**
* Controlls all project related functions
*/
class FileController extends BaseController
{
	private static _singleton: FileController;

	private static _MAX_FILE_SIZE: number = 10 * 1024 * 1024; //10 megabytes

	// TODO - expose file types to admin
	static allowedFilesTypes = {
		".jpeg": true,
		".jpg": true,
		".png": true,
		".gif": true,
		".js": true,
		".obj": true,
		".adf": true // Animate Data File
	};


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
		logger.log( "Processing file request '" + functionName + "'" );
		var that = this;

		logger.log( "Request Method '" + request.method + "'", logger.LogType.ADMIN );


		// We do the processing slightly differently on the file controller. This is because the upload
		// process creates more fringe cases when uploading


		if ( functionName == "fill-file" )
		{
			this.processGETData( function ( options: any )
			{
				return that.fillFile( options["id"], options["projectId"], null, request, response );

			}, request, response );
		}
		else if ( functionName == "create-empty-file" )
		{
			this.processPOSTData( function ( options: any )
			{
				switch ( functionName )
				{
					case "create-empty-file":
						return that.createEmptyFile( options["name"], options["projectId"], null, request, response );
						break;
				}
			}, request, response );
		}
		else
		{
			// The file uploader can use both post and get variables at the same time. Its typically a post - so we get the query vars
			//if ( request.
			this.processGETData( function ( options: any )
			{
				switch ( functionName )
				{
					case "upload-file":
						return that.uploadFile( options["projectId"], null, request, response );
						break;
					case "upload-user-avatar":
						return that.uploadUserAvatar( null, request, response );
						break;
					case "upload-project-image":
						return that.uploadProjectImage( options["projectId"], null, request, response );
						break;
					case "upload-thumb":
						return that.uploadFileThumbnail( options["projectId"], options["fileId"], null, request, response );
						break;
					default:
						return new ErrorController( utils.ErrorCodes.INVALID_INPUT, "No function specified" ).processRequest( request, response, functionName );
						break;
				}

			}, request, response );
		}

		// No response
		//return new ErrorController( utils.ErrorCodes.INVALID_INPUT, "Could not recognise File command" ).processRequest( request, response, functionName );
	}

	/* Fills a file with data from the application
	* See https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Sending_and_Receiving_Binary_Data
	* @param {string} id The ID of the file we are filling
	* @param {string} projectId The id of the project creating this file
	* @param {( file: fileModel.File ) => void} callback The function to call when the file is created
	* @param {http.ServerRequest} request
	* @param {http.ServerResponse} response
	*/
	public fillFile( id: string, projectId: string, callback?: ( projects: fileModel.File ) => void, request?: http.ServerRequest, response?: http.ServerResponse )
	{
		logger.log( "Create file for project '" + projectId + "'...", logger.LogType.ADMIN );

		var projController: ProjectController = ProjectController.singleton;
		var userController: UserController = UserController.singleton;
		var that = this;


		if ( id == "" || !validator.isValidObjectID( id ) )
		{
			if ( callback )
				return callback( null );
			else
				return new ErrorController( utils.ErrorCodes.INVALID_INPUT, "Please specify a valid file ID" ).processRequest( request, response, "" );
		}

		// Is the user logged in
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
			projController.checkPrivileges( user._id.toString(), projectId, projectModel.PrivilegeType.WRITE, function ( hasRights: boolean )
			{
				if ( hasRights )
				{
					projController.getProject( projectId, function ( proj: projectModel.Project )
					{
						if ( !proj )
						{
							if ( callback )
								return callback( null );
							else
								return new ErrorController( utils.ErrorCodes.INVALID_INPUT, "Could not find the project with the id '" + projectId + "'" ).processRequest( request, response, "" );
						}

						Model.collections( "files" ).findOne( { _id: new mongodb.ObjectID( id ) }, function ( err, file: fileModel.File )
						{
							if ( !file )
							{
								if ( callback )
									return callback( null );
								else
									return new ErrorController( utils.ErrorCodes.INVALID_INPUT, "Could not find file" ).processRequest( request, response, "" );
							}

							// For each file thats loaded, write it to a file and make sure its not too big
							var onData = function ( chunk )
							{
								// Check num bytes loaded
								if ( chunk.length > FileController._MAX_FILE_SIZE )
								{
									request.removeListener( "end", fileLoaded );
									request.removeListener( "data", onData );
									logger.log( "File size too large for project '"+ projectId +"'", logger.LogType.ERROR );

									if ( callback )
										return callback( null );
									else
										return new ErrorController( utils.ErrorCodes.INVALID_INPUT, "File too large." ).processRequest( request, response, "" );
								}

								wStream.write( chunk );
							};

							// Once the file is loaded, update its size in the DB
							var fileLoaded = function ()
							{
								// Check num bytes loaded
								wStream.end();

								request.removeListener( "end", fileLoaded );
								request.removeListener( "data", onData );

								var stats: fs.Stats = fs.statSync( file.path );
								var fileSizeInBytes = stats["size"];

								logger.log( "Updating file size for project '" + projectId + "'" );

								Model.collections( "files" ).update( { _id: file._id }, { $set: { size : fileSizeInBytes } }, function ( err, numAffected: number )
								{
									if ( err )
									{
										if ( callback )
											return callback( null );
										else
											return new ErrorController( utils.ErrorCodes.DATABASE_ERROR, "Could not update file size" ).processRequest( request, response, "" );
									}

									logger.log( "File updated for '" + projectId + "'", logger.LogType.SUCCESS );

									if ( callback )
										return callback( file );
									else
										return viewJSON.render( [file._id], request, response, viewJSON.ReturnType.SUCCESS );
								});
							};

							var wStream: fs.WriteStream = fs.createWriteStream( file.path );
							request.on( "end", fileLoaded );
							request.on( "data", onData );
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
	* Use this function to generate a random file name
	* @param {number} length The length of the name.
	* @returns {string}
	*/
	generateFileName( length: number ): string
	{
		var text = "";
		var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

		for ( var i = 0; i < length; i++ )
			text += possible.charAt( Math.floor( Math.random() * possible.length ) );

		return text;
	}

	/**
	* Creates a blank data file for a given user
	* @param {string} name The name of the new file (This is not a file name - filenames are automatically generated)
	* @param {string} projectId The id of the project creating this file
	* @param {( file: fileModel.File ) => void} callback The function to call when the file is created
	* @param {http.ServerRequest} request
	* @param {http.ServerResponse} response
	*/
	public createEmptyFile( name: string, projectId: string, callback?: ( projects: fileModel.File ) => void, request?: http.ServerRequest, response?: http.ServerResponse )
	{
		logger.log( "Create file for project '" + projectId + "'...", logger.LogType.ADMIN );

		var projController: ProjectController = ProjectController.singleton;
		var userController: UserController = UserController.singleton;
		var that = this;

		// Is the user logged in
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
			projController.checkPrivileges( user._id.toString(), projectId, projectModel.PrivilegeType.WRITE, function ( hasRights: boolean )
			{
				if ( hasRights )
				{
					projController.getProject( projectId, function ( proj: projectModel.Project )
					{
						if ( !proj )
						{
							if ( callback )
								return callback( null );
							else
								return new ErrorController( utils.ErrorCodes.INVALID_INPUT, "Could not find the project with the id '" + projectId + "'" ).processRequest( request, response, "" );
						}

						// Create the user directory and an empty file
						var userDir: string = that.getUserDirectory( user );
						var path: string = null, temp : string = "";
						while ( !path )
						{
							temp = userDir + "/" + that.generateFileName( 10 ) + ".adf"; // (animate data file)
							if ( !fs.existsSync( temp ) )
							{
								path = temp;
								try
								{
									var fd: number = fs.openSync( path, 'w' );
									fs.closeSync( fd );
								}
								catch ( e )
								{
									if ( callback )
										return callback( null );

									if ( e instanceof Error )
										return new ErrorController( utils.ErrorCodes.DATABASE_ERROR, ( <Error>e ).message ).processRequest( request, response, "" );
									else
										return new ErrorController( utils.ErrorCodes.DATABASE_ERROR, "Could not create file on the server. ['"+ e +"']" ).processRequest( request, response, "" );
								}

								break;
							}
						}

						// Create the file
						var file: fileModel.File = new fileModel.File( user._id );
						file.name = name;
						file.path = path;
						file.size = 0;
						file.url = ( utils.config.secure ? "https://" : "http://" ) + utils.config.host + ":" + utils.config.port + "/" + ( ( path.split( "/" ).slice( 11 ) ).join( "/" ) );

						// Create a new file
						Model.collections( "files" ).save( file, function ( err: any, result: fileModel.File )
						{
							if ( !result )
							{
								if ( callback )
									return callback( null );
								else
									return new ErrorController( utils.ErrorCodes.DATABASE_ERROR, "Could not save file in the database" ).processRequest( request, response, "" );
							}

							// File created - update project file count
							Model.collections( "projects" ).update( { _id: proj._id }, { $push: { files: result._id.toString() } }, function()
							{
								if ( callback )
									return callback( result );
								else
									return viewJSON.render( result, request, response, viewJSON.ReturnType.SUCCESS );
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
	* Gets the files stored in the database
	* @param {number} limit The number of files to fetch
	* @param {number} startIndex The starting index from where we are fetching files from
	* @param {( files: Array<fileModel.File> ) => void} callback The function to call when objects are downloaded
	* @param {http.ServerRequest} request
	* @param {http.ServerResponse} response
	*/
	public getFiles( limit: number = 0, startIndex: number = 0, callback?: ( projects: Array<fileModel.File> ) => void, request?: http.ServerRequest, response?: http.ServerResponse )
	{
		logger.log( "Getting files from index " + startIndex.toString() + "...", logger.LogType.ADMIN );

		Model.collections( "files" ).find( {}, {}, startIndex, limit, function ( err: any, result: mongodb.Cursor )
		{
			var token: any;
			if ( err || !result )
			{
				if ( callback )
					return callback( null );
				else
					return new ErrorController( utils.ErrorCodes.BAD_METHOD, err ).processRequest( request, response, "" );
			}

			result.toArray( function ( err: any, results: Array<fileModel.File> )
			{
				if ( callback )
					return callback( results );
				else
					return viewJSON.render( results, request, response, viewJSON.ReturnType.SUCCESS );
			});
		});
	}


	/**
	* Gets, or creates if neccessary, the user's upload directory
	* @param {userModel.User} user The user we are getting the directory for
	* @returns {string}
	*/
	public getUserDirectory( user: userModel.User ): string
	{
		var directory = __dirname + "/../../../uploads/users/" + user._id.toString();

		logger.log( "Checking for user upload directory (" + directory + ") and creating one if not present" );

		// Create the user directory if it doesnt exist
		if ( !fs.existsSync( directory ) )
		{
			logger.log( "Making directory (" + directory + ")..." );
			fs.mkdirSync( directory, 509 );
		}

		return directory;
	}


	/**
	* Helper function. Looks at the request and uploads the files to the user's personal file directory.
	* @param {userModel.User} user The user associated with this upload
	* @param {(err: any, files : Array<formidable.IFormidableFile>) => void} callback The function to call when objects are downloaded
	* @param {http.ServerRequest} request
	* @param {http.ServerResponse} response
	*/
	public uploadUserFile( mulitUploader : boolean, user: userModel.User, callback: ( err: any, files : Array<formidable.IFormidableFile> ) => void, request: http.ServerRequest, response: http.ServerResponse )
	{
		try
		{
			// User Directory
			var userUploadDir: string = this.getUserDirectory( user );
			var form = new formidable.IncomingForm( { multiples: mulitUploader, uploadDir: userUploadDir, keepExtensions: true });
			var files: Array<formidable.IFormidableFile> = [];

			form
				.on( "aborted", function ()
				{
					logger.log( "File upload aborted", logger.LogType.ERROR );
					callback( "File upload aborted", null );
				})
				.on( "error", function ( err )
				{
					logger.log( "File upload error occurred :" + JSON.stringify( err ), logger.LogType.ERROR );
					callback( err, null );
				})
				.on( "file", function ( field, file )
				{
					logger.log( 'File uploaded ' + JSON.stringify( file ) + '...', logger.LogType.ADMIN );
					files.push( file );
				})
				.on( 'end', function ()
				{
					logger.log( 'Uploads complete...' );
					callback( null, files );
				});

			logger.log( "Parsing upload..." );
			form.parse( request );
		}
		catch ( e )
		{
			if ( e instanceof Error )
				return new ErrorController( utils.ErrorCodes.INVALID_INPUT, ( <Error>e ).message ).processRequest( request, response, "" );
			else
				return new ErrorController( utils.ErrorCodes.INVALID_INPUT, "Could not upload file to the server" ).processRequest( request, response, "" );
		}
	}



	/**
	* Uploads a project image
	* @param {string} projectId The ID of the project
	* @param {(numUpdated : number) => void} callback The callback function
	* @param {http.ServerRequest} request
	* @param {http.ServerResponse} response
	*/
	uploadProjectImage( projectId : string, callback?: ( numUpdated: number ) => void, request?: http.ServerRequest, response?: http.ServerResponse )
	{
		var projController: ProjectController = ProjectController.singleton;
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

			logger.log( "Uploading project image for project '" + projectId, logger.LogType.ADMIN );

			// Check for rights
			projController.checkPrivileges( user._id.toString(), projectId, projectModel.PrivilegeType.WRITE, function ( hasRights: boolean )
			{
				if ( hasRights )
				{
					projController.getProject( projectId, function( proj: projectModel.Project )
					{
						if ( !proj )
						{
							if ( callback )
								return callback( null );
							else
								return new ErrorController( utils.ErrorCodes.INVALID_INPUT, "Could not find the project with the id '" + projectId + "'" ).processRequest( request, response, "" );
						}

						// Upload the files to the user directory
						that.uploadUserFile( false, user, onFilesLoaded, request, response );

						// Once each of the files has been uploaded.
						function onFilesLoaded( err: any, files: Array<formidable.IFormidableFile> )
						{
							if ( err )
							{
								if ( callback )
									return callback( null );
								else
									return new ErrorController( utils.ErrorCodes.DATABASE_ERROR, err ).processRequest( request, response, "" );
							}

							logger.log( "[" + files.length + "] Files uploaded - updating file entry..." );

							var url = ( utils.config.secure ? "https://" : "http://" ) + utils.config.host + ":" + utils.config.port + "/" + ( ( files[0].path.split( "/" ).slice( 5 ) ).join( "/" ) );
							var path = files[0].path;

							// Delete any current thumbnails
							if ( fs.existsSync( proj.imagePath ) )
								fs.unlinkSync( proj.imagePath );

							// Get the current thumbnail
							Model.collections( "projects" ).update( { _id: proj._id }, { $set: { imagePath: path, image: url } }, function ( err: any, numAffected: number )
							{
								if ( err )
								{
									if ( callback )
										return callback( null );
									else
										return new ErrorController( utils.ErrorCodes.DATABASE_ERROR, err ).processRequest( request, response, "" );
								}


								logger.log( "File uploaded and project updated!", logger.LogType.SUCCESS );

								if ( callback )
									return callback( numAffected );
								else
									return viewJSON.render( { message: "Files successfully uploaded", imageUrl : url }, request, response, viewJSON.ReturnType.SUCCESS );
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
	* Uploads a user avatar image
	* @param {(numUpdated : number) => void} callback The callback function
	* @param {http.ServerRequest} request
	* @param {http.ServerResponse} response
	*/
	uploadUserAvatar( callback?: ( numUpdated: number ) => void, request?: http.ServerRequest, response?: http.ServerResponse )
	{
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

			logger.log( "Uploading avatar for user '" + user._id.toString(), logger.LogType.ADMIN );


			// Upload the files to the user directory
			that.uploadUserFile( false, user, onFilesLoaded, request, response );

			// Once each of the files has been uploaded.
			function onFilesLoaded( err: any, files: Array<formidable.IFormidableFile> )
			{
				if ( err )
				{
					if ( callback )
						return callback( null );
					else
						return new ErrorController( utils.ErrorCodes.DATABASE_ERROR, err ).processRequest( request, response, "" );
				}

				logger.log( "[" + files.length + "] Files uploaded - updating file entry..." );

				var url = ( utils.config.secure ? "https://" : "http://" ) + utils.config.host + ":" + utils.config.port + "/" + ( ( files[0].path.split( "/" ).slice( 5 ) ).join( "/" ) );
				var path = files[0].path;

				// Delete the current avatar
				if ( fs.existsSync( user.imagePath ) )
					fs.unlinkSync( user.imagePath );

				// Update the file entry
				Model.collections( "users" ).update( { _id: user._id }, { $set: { imagePath: path, image: url } }, function( err: any, numAffected: number )
				{
					if ( err )
					{
						if ( callback )
							return callback( null );
						else
							return new ErrorController( utils.ErrorCodes.DATABASE_ERROR, err ).processRequest( request, response, "" );
					}

					logger.log( "Avatar uploaded and updated!", logger.LogType.SUCCESS );

					if ( callback )
						return callback( numAffected );
					else
						return viewJSON.render( { imageUrl: url, message: "Avatar successfully uploaded" }, request, response, viewJSON.ReturnType.SUCCESS );
				});
			}

		}, request, response );
	}



	/**
	* Uploads a file thumbnail
	* @param {string} projectId The ID of the project
	* @param {string} fileId The ID of the file
	* @param {(numUpdated : number) => void} callback The callback function
	* @param {http.ServerRequest} request
	* @param {http.ServerResponse} response
	*/
	uploadFileThumbnail( projectId: string, fileId: string, callback?: ( numUpdated : number ) => void, request?: http.ServerRequest, response?: http.ServerResponse )
	{
		var projController: ProjectController = ProjectController.singleton;
		var that = this;

		if ( !fileId || fileId.trim() == "" || !validator.isValidObjectID( fileId ) )
		{
			if ( callback )
				return callback( null );
			else
				return new ErrorController( utils.ErrorCodes.INVALID_INPUT, "Please use a valid file ID" ).processRequest( request, response, "" );
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
			projController.checkPrivileges( user._id.toString(), projectId, projectModel.PrivilegeType.WRITE, function ( hasRights: boolean )
			{
				if ( hasRights )
				{
					projController.getProject( projectId, function ( proj: projectModel.Project )
					{
						if ( !proj )
						{
							if ( callback )
								return callback( null );
							else
								return new ErrorController( utils.ErrorCodes.INVALID_INPUT, "Could not find the project with the id '" + projectId + "'" ).processRequest( request, response, "" );
						}

						logger.log( "Uploading thumbnail for user '" + user._id.toString() + "' and file '"+ fileId +"'", logger.LogType.ADMIN );


						// Upload the files to the user directory
						that.uploadUserFile( false, user, onFilesLoaded, request, response );

						// Once each of the files has been uploaded.
						function onFilesLoaded( err: any, files: Array<formidable.IFormidableFile> )
						{
							if ( err )
							{
								if ( callback )
									return callback( null );
								else
									return new ErrorController( utils.ErrorCodes.DATABASE_ERROR, err ).processRequest( request, response, "" );
							}

							logger.log( "[" + files.length + "] Files uploaded - updating file entry..." );

							var url = ( utils.config.secure ? "https://" : "http://" ) + utils.config.host + ":" + utils.config.port + "/" + ( ( files[0].path.split( "/" ).slice( 5 ) ).join( "/" ) );
							var path = files[0].path;

							// Get the current thumbnail
							Model.collections( "files" ).findOne( { _id: new mongodb.ObjectID( fileId ) }, function ( err: any, file: fileModel.File )
							{
								if ( err )
								{
									if ( callback )
										return callback( null );
									else
										return new ErrorController( utils.ErrorCodes.DATABASE_ERROR, err ).processRequest( request, response, "" );
								}

								if ( !file )
								{
									if ( callback )
										return callback( null );
									else
										return new ErrorController( utils.ErrorCodes.DATABASE_ERROR, "No file could be found" ).processRequest( request, response, "" );
								}

								// Delete any current thumbnails
								if ( fs.existsSync( file.previewPath ) )
									fs.unlinkSync( file.previewPath );

								// Update the file entry
								Model.collections( "files" ).update( { _id: file._id }, { $set: { previewUrl: url, previewPath: path } }, function ( err: any, numAffected: number )
								{
									if ( err )
									{
										if ( callback )
											return callback( null );
										else
											return new ErrorController( utils.ErrorCodes.DATABASE_ERROR, err ).processRequest( request, response, "" );
									}

									logger.log( "File uploaded and updated!", logger.LogType.SUCCESS );

									if ( callback )
										return callback( numAffected );
									else
										return viewJSON.render( { message: "Files successfully uploaded" }, request, response, viewJSON.ReturnType.SUCCESS );
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
	* Uploads a series of files for a user
	* @param {string} projectId The ID of the project
	* @param {(files: Array<fileModel.File>)=>void} callback The callback function
	* @param {http.ServerRequest} request
	* @param {http.ServerResponse} response
	*/
	uploadFile( projectId: string, callback?: ( files: Array<fileModel.File> ) => void, request?: http.ServerRequest, response?: http.ServerResponse )
	{
		var projController: ProjectController = ProjectController.singleton;
		var that = this;


		logger.log( "Uploading file for project '" + projectId + "'", logger.LogType.ADMIN );

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
			projController.checkPrivileges( user._id.toString(), projectId, projectModel.PrivilegeType.WRITE, function ( hasRights: boolean )
			{
				if ( hasRights )
				{
					projController.getProject( projectId, function ( proj: projectModel.Project )
					{
						if ( !proj )
						{
							if ( callback )
								return callback( null );
							else
								return new ErrorController( utils.ErrorCodes.INVALID_INPUT, "Could not find the project with the id '" + projectId + "'" ).processRequest( request, response, "" );
						}

						logger.log( "Uploading file for user '" + user._id.toString() + "'", logger.LogType.ADMIN );

						// Upload the files to the user directory
						that.uploadUserFile( true, user, onFilesLoaded, request, response );


						// Once each of the files has been uploaded.
						function onFilesLoaded( err : any, files: Array<formidable.IFormidableFile> )
						{
							if ( err )
							{
								if ( callback )
									return callback( null );
								else
									return new ErrorController( utils.ErrorCodes.DATABASE_ERROR, err ).processRequest( request, response, "" );
							}

							logger.log( "[" + files.length + "] Files loaded", logger.LogType.SUCCESS );

							// The actual file models we store in the DB
							var fileModels: Array<fileModel.File> = [];

							for ( var i = 0, l = files.length; i < l; i++ )
							{
								var filePath: string = path.extname( files[i].path ).toLowerCase().trim();

								// Lets verify the file stats are ok
								if (
									!FileController.allowedFilesTypes[filePath] ||
									files[i].size > FileController._MAX_FILE_SIZE // 10 Meg
									)
								{
									logger.log( "File was dissallowed [" + filePath + ", " + ( files[i].size / 1024 / 1024 ).toString() + "]", logger.LogType.ERROR );
									fs.unlinkSync( files[i].path );
									break;
								}

								// File seems ok, so create the files
								var newFile: fileModel.File = new fileModel.File( user._id );
								newFile.url = ( utils.config.secure ? "https://" : "http://" ) + utils.config.host + ":" + utils.config.port + "/" + ( ( files[i].path.split( "/" ).slice( 5 ) ).join("/") );
								newFile.path = files[i].path;
								newFile.name = files[i].name;
								newFile.size = files[i].size;

								// Add model to arr
								fileModels.push( newFile );
							}

							var savedFiles: Array<fileModel.File> = [];

							// Called each time a file is saved
							function onFileSaved()
							{
								if ( fileModels.length == 0 )
								{
									logger.log( "All files have been uploaded", logger.LogType.SUCCESS );

									if ( callback )
										callback( savedFiles )
									else
										return viewJSON.render( { message : "Files successfully uploaded" }, request, response, viewJSON.ReturnType.SUCCESS );
									return;
								}

								var saveToken = fileModels.pop();
								logger.log( 'Saving file ' + JSON.stringify( saveToken ) + '...' );

								// try to save the file...
								Model.collections( "files" ).save( saveToken, function ( err: any, savedFile: fileModel.File )
								{
									if ( err )
									{
										if ( callback )
											return callback( null );
										else
											return new ErrorController( utils.ErrorCodes.DATABASE_ERROR, err ).processRequest( request, response, "" );
									}

									logger.log( 'File saved ' + JSON.stringify( savedFile ) + '...' );

									// Update the project so that it refers to this file
									Model.collections( "projects" ).update( { _id: proj._id }, { $push: { files: savedFile._id.toString() } }, function ()
									{
										if ( err )
										{
											if ( callback )
												return callback( null );
											else
												return new ErrorController( utils.ErrorCodes.DATABASE_ERROR, err ).processRequest( request, response, "" );
										}

										logger.log( 'project updated with new file...' );

										savedFiles.push( savedFile );
										onFileSaved();
									});
								});
							}

							// Save array to the DB
							onFileSaved();
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
	* Gets an instance of the file controller
	* @returns {FileController}
	*/
	static get singleton(): FileController
	{
		if ( !FileController._singleton )
			FileController._singleton = new FileController();

		return FileController._singleton;
	}
}


export = FileController;