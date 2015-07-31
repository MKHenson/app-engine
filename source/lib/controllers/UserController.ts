import http = require( "http" );
import fs = require( "fs" );
import BaseController = require( "./BaseController" );
import ErrorController = require( "./ErrorController" );
import viewJSON = require( "../views/JSONRenderer" );
import viewJade = require( "../views/JadeRenderer" );
import utils = require( "../Utils" );
import validator = require( "../Validator" );
import Model = require( "../models/Model" );
import userModel = require( "../models/UserModel" );
import projectModel = require( "../models/ProjectModel" );
import mongodb = require( "mongodb" );
import session = require( "../session/Session" );
import recaptcha = require( "../Captcha" );
import bcrypt = require( "../bcrypt" );
import Mailer = require( "../models/Mailer" );
import logger = require( "../Logger" );
import sanitizeHtml = require( "sanitize-html" );

/**
* Controlls all user related functions
*/
class UserController extends BaseController
{
	private static _singleton: UserController;
	private static _sessionTimout: number = 60 * 30; //30 minutes


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
		logger.log( "Processing user request '" + functionName + "'" );
		var that = this;

		

		this.processQueryData( function ( options: any )
		{
			switch ( functionName )
			{
				case "register":
					that.register( options["user"], options["password"], options["email"], options["captcha"], options["captha_challenge"], request, response );
					break;
				case "remove":
					that.remove( options["user"], request, response );
					break;
				case "logged-in":
					that.loggedIn( null, request, response );
					break;
				case "log-in":
					that.logIn( options["user"], options["password"], options["rememberMe"], request, response );
					break;
				case "log-out":
					that.logOut( request, response );
					break;
				case "activate-account":
					that.activateAccount( options["user"], options["key"], request, response );
					break;
				case "reset-password":
					that.resetPassword( options["user"], request, response );
					break;
				case "reset-password-form":
					that.resetPasswordForm( options["user"], options["tag"], options["password"], options["passwordValidation"], request, response );
					break;
				case "resend-activation":
					that.resendActivation( options["user"], request, response );
					break;
				case "print": 
					that.print( parseInt( options["limit"] ), parseInt( options["index"] ), request, response );
					break;
				case "update":
					that.update( options, null, request, response );
					break;
				case "print-sessions":
					that.printSessions( parseInt( options["limit"] ), parseInt( options["index"] ), request, response );
					break;
				case "update-details":
					that.updateUserDetails( options["bio"], null, request, response );
					break;
				default:
					new ErrorController( utils.ErrorCodes.INVALID_INPUT, "No function specified" ).processRequest( request, response, functionName );
					break;
			}
		}, request, response );
	}

	
	/**
	* Removes the  register key for users so they can log into Animate
	* @param {string} username The username or email of the user
	* @param {string} key The registration key sent out when they create their account
	* @returns {ErrorController} [Optional]
	*/
	public activateAccount( username: string = "", key: string = "", request?: http.ServerRequest, response?: http.ServerResponse )
	{
		// Trim the fields
		username = validator.trim( username );
		key = validator.trim( key );

		if ( !username || username == "" )
			return viewJade.render( __dirname + "/../views/messages/error.jade", { message: "Username cannot be null or empty" }, response );

		if ( !key || key == "" )
			return viewJade.render( __dirname + "/../views/messages/error.jade", { message: "Tag cannot be null or empty" }, response );
			
		var onFindUser = function ( error: any, result: mongodb.Cursor )
		{
			// Do nothing if error
			if ( error || !result )
				return viewJade.render( __dirname + "/../views/messages/error.jade", { message: "An error has occurred: " + error }, response );
			
			// check for empties
			if ( username.trim() == "" || key.trim() == "" )
				return viewJade.render( __dirname + "/../views/messages/error.jade", { message: "No username or key detected" }, response );
						
			// Get the user and update its register-key
			result.toArray( function ( error: any, results: Array<userModel.User> )
			{
				if ( results.length == 0 )
					return viewJade.render( __dirname + "/../views/messages/error.jade", { message: "No user exists with that username" }, response );
				else
				{
					if ( results[0].registerKey != key )
						return viewJade.render( __dirname + "/../views/messages/error.jade", { message: "Key does not match. Please try resend your activation link or email support@webinate.net" }, response );
		
					Model.collections( "users" ).update( { _id: results[0]._id }, { $set: { registerKey: "" } }, function ( err: any, result: number )
					{
						if ( err || result === 0 )
							return viewJade.render( __dirname + "/../views/messages/error.jade", { message: "An error occurred updating your details. Please try again later." }, response );
						else
							return viewJade.render( __dirname + "/../views/messages/success.jade", { message: "Thank you for activating your account" }, response );
					});
				}
			});
		}

		// Search the collection for the user
		logger.log("User validating...");
		Model.collections("users").find( { $or: [{ email: username }, { username: username }] }, { limit: 1 }, onFindUser );

		return null;
	}


	/**
	* Use this function to resend an activation code.
	* @param {string} username The username or email of the user
	* @param {http.ServerRequest} request 
	* @param {http.ServerResponse} response
	*/
	resendActivation( username: string = "", request: http.ServerRequest = null, response: http.ServerResponse = null )
	{
		if ( request && request.method != "POST" )
			return new ErrorController( utils.ErrorCodes.BAD_METHOD, "Only POST requests are allowed for this function" ).processRequest( request, response, "" );

		// Trim the fields
		username = validator.trim( username );

		if ( !username || username == "" )
			return new ErrorController( utils.ErrorCodes.INVALID_OPTION, "Username cannot be null or empty" ).processRequest( request, response, "" );

		var onFindUser = function ( error: any, result: mongodb.Cursor )
		{
			// Get the user and update its register-key
			result.toArray( function ( error: any, results: Array<userModel.User> )
			{
				if ( results.length == 0 )
					return new ErrorController( utils.ErrorCodes.INVALID_INPUT, "No user with that username or email exists" ).processRequest( request, response, "" );
				else
				{
					if ( results[0].registerKey == "" )
						return viewJSON.render( { message: "You have already activated this account" }, request, response, viewJSON.ReturnType.SUCCESS );

					logger.log( "Attempting to re-send activation email to " + results[0].email );

					// Send email to welcome the user
					Mailer.getSingleton().sendEmail(
						{
							from: "Webinate Support Team<support@webinate.net>",
							to: results[0].email,
							subject: "Activate your account",
							text: "Thank you for registering with Webinate!\nTo activate your account please click the link below:\n\n" + ( utils.config.secure ? "https://" : "http://" ) + utils.config.host + ":" + utils.config.port + "/user/activate-account?key=" + results[0].registerKey + "&user=" + results[0].username + "\n\nThanks\nThe Webinate Team",
							html: "Thank you for registering with Webinate!<br/>To activate your account please click the link below:<br/><br/>" + ( utils.config.secure ? "https://" : "http://" ) + utils.config.host + ":" + utils.config.port + "/user/activate-account?key=" + results[0].registerKey + "&user=" + results[0].username + "<br/><br/>Thanks<br/>The Webinate Team"
						},
						function ( err: Error, resp?: any )
						{
							if ( err )
							{
								logger.log( err.message, logger.LogType.ERROR );
								return viewJSON.render( { message: err.message }, request, response, viewJSON.ReturnType.ERROR );
							}
							else
							{
								logger.log( "Welcome email re-sent to user " + results[0].username + " on the " + ( new Date() ).toDateString() );
								return viewJSON.render( { message: "The activation link has been re-sent to your email address." }, request, response, viewJSON.ReturnType.SUCCESS );
							}
						}
					);
				}
			});
		}

		// Search the collection for the user
		logger.log( "Resending activation code. Checking for user '" + username +"'" );
		Model.collections("users").find( { $or: [{ email: username }, { username: username }] }, { limit: 1 }, onFindUser );
	}


	/** 
	* Updates a user's details. Only allowed users who have admin access
	* @param {any} options A key value pair of user options to update
	* @param {( result: number ) => void} callback Callback function with the model result
	* @param {http.ServerRequest} request
	* @param {http.ServerResponse} response
	*/
	public update( options: any, callback?: ( result: number ) => void, request?: http.ServerRequest, response?: http.ServerResponse )
	{
		if ( !options.id || options.id.toString().trim() == "" || !validator.isValidObjectID( options.id ) )
			return new ErrorController( utils.ErrorCodes.INVALID_INPUT, "You must provide a valid user id" ).processRequest( request, response, "" );

		var id = options["id"];
		delete options["id"];

		// Validation passed - create user in database
		Model.collections( "users" ).update( { _id: new mongodb.ObjectID( id.trim() ) }, { $set: options }, function ( err: any, result: number )
		{
			if ( err )
			{
				if ( callback )
					return callback( null );
				else
					return new ErrorController( utils.ErrorCodes.AUTHENTICATION_REQUIRED, err ).processRequest( request, response, "" );
			}

			logger.log( "User details updated...", logger.LogType.SUCCESS );

			if ( callback )
				callback( result );
			else
				viewJSON.render( { message: "User details updated - [" + result + "] documents affected" }, request, response, viewJSON.ReturnType.SUCCESS );
		});
	}


	/**
	* This function renders a page that users can use to reset their password
	* @param {string} username The username or email of the user
	* @param {string} tag The temp password sent to the user email address
	* @param {string} password The new password - must be sent as a POST request
	* @param {string} passwordValidation Must match the password exactly
	* @param {http.ServerRequest} request 
	* @param {http.ServerResponse} response
	* @returns {ErrorController} [Optional]
	*/
	resetPasswordForm( username: string = "", tag: string = "", password: string = "", passwordValidation: string = "", request: http.ServerRequest = null, response: http.ServerResponse = null ): void
	{
		// Trim the fields
		username = validator.trim( username );
		tag = validator.trim( tag );

		if ( !username || username == "" )
			return viewJade.render( __dirname + "/../views/messages/error.jade", { message: "Username cannot be null or empty" }, response );


		if ( !tag || tag == "" )
			return viewJade.render( __dirname + "/../views/messages/error.jade", { message: "Tag cannot be null or empty" }, response );
	
		var onFindUser = function( error: any, result: mongodb.Cursor )
		{
			// Do nothing if error
			if ( error || !result )
				return viewJade.render( __dirname + "/../views/messages/error.jade", { message: "An error has occurred: " + error }, response );
			
			// check for empties
			if ( username.trim() == "" || tag.trim() == "" )
				return viewJade.render( __dirname + "/../views/messages/error.jade", { message: "No username or tag detected" }, response );
		
			// Get the user and update its register-key
			result.toArray( function ( error: any, results: Array<userModel.User> )
			{
				if ( results.length == 0 )
					return viewJade.render( __dirname + "/../views/messages/error.jade", { message: "No user exists with that username" }, response );				
				else
				{
					if ( results[0].tag != tag )
						return viewJade.render( __dirname + "/../views/messages/error.jade", { message: "Tags does not match - please try reset your password again or email support@webinate.net" }, response );
			
					// Show the form
					if ( request && request.method != "POST" )
						return viewJade.render( __dirname + "/../views/password-reset/index.jade", { message: "", user: username, tag: results[0].tag }, response );
					
					// Make sure passwords match
					if (  password.trim() != passwordValidation.trim() )
						return viewJade.render( __dirname + "/../views/password-reset/index.jade", { message: "Your passwords don't match - please try again", user: username, tag: results[0].tag }, response );
					
					// Make sure passwords are not blank
					if ( password.trim() == "" || passwordValidation.trim() == "" )
						return viewJade.render( __dirname + "/../views/password-reset/index.jade", { message: "You cannot have a blank password", user: username, tag: results[0].tag }, response );
					
					// Make sure passwords are safe
					if ( !validator.isSafeCharacters( password ) || !validator.isSafeCharacters( passwordValidation ) )
						return viewJade.render( __dirname + "/../views/password-reset/index.jade", { message: "Please only use alpha numeric characters", user: username, tag: results[0].tag }, response );
										
					var encryptedPassword = bcrypt.hashSync( password );
					Model.collections("users").update( { _id: results[0]._id }, { $set: { tag: "", password: encryptedPassword } }, function ( err: any, result: number )
					{
						if ( err || result === 0 )
							return viewJade.render( __dirname + "/../views/password-reset/index.jade", { message: "An error occurred updating your details. Please try again later.", user: username, tag: results[0].tag }, response );
						else
							return viewJade.render( __dirname + "/../views/messages/success.jade", { message: "Your password is now set!", user: username, tag: results[0].tag }, response );						
					});
				}
			});
		}

		// Search the collection for the user
		logger.log( "User '"+ username +"' is resetting their password..." );
		Model.collections("users").find( { $or: [{ email: username }, { username: username }] }, { limit: 1 }, onFindUser );
	}

	
	/**
	* Use this function to reset a users password
	* @param {string} username The username or email of the user
	* @param {http.ServerRequest} request 
	* @param {http.ServerResponse} response
	* @returns {ErrorController} [Optional]
	*/
	resetPassword( username: string = "", request: http.ServerRequest = null, response: http.ServerResponse = null ): void
	{
		if ( request && request.method != "POST" )
			return new ErrorController( utils.ErrorCodes.BAD_METHOD, "Only POST requests are allowed for this function" ).processRequest( request, response, "" );

		// Trim the fields
		username = validator.trim( username );

		if ( !username || username == "" )
			return new ErrorController( utils.ErrorCodes.INVALID_OPTION, "Username cannot be null or empty" ).processRequest( request, response, "" );

		var onFindUser = function ( error: any, result: mongodb.Cursor )
		{
			// Get the user and update its register-key
			result.toArray( function ( error: any, results: Array<userModel.User> )
			{
				if ( results.length == 0 )
					return new ErrorController( utils.ErrorCodes.INVALID_INPUT, "No user with that username or email exists" ).processRequest( request, response, "" );
				else
				{
					logger.log( "Resetting user " + username + "'s password in the DB" );
					
					// Update the database with a temp password
					var newPass: string = generatePassword( 6 );
					Model.collections("users").update( { _id: results[0]._id }, { $set: { tag: newPass } }, function ( e: any, result: number )
					{
						if ( e || result === 0 )
						{
							logger.log( "An error occurred while resetting the user password for'" + username + "' : " + e, logger.LogType.ERROR );
							var err: ErrorController = new ErrorController( utils.ErrorCodes.DATABASE_ERROR, e );
							err.processRequest( request, response, "" );
							return;
						}
						else
						{
							logger.log( "Emailing user new password." );

							// Send email to the user with instructions on how to reset
							Mailer.getSingleton().sendEmail(
								{
									from: "Webinate Support Team<support@webinate.net>",
									to: results[0].email,
									subject: "Reset password request",
									text: "A request was recently made to reset your Webinate password. \nIf this was in error, please igore this email. \n\nIf however you would like your password reset, then please click on the link below:\n" + ( utils.config.secure ? "https://" : "http://" ) + utils.config.host + ":" + utils.config.port + "/user/reset-password-form?tag=" + newPass + "&user=" + results[0].username + "\n\nThanks\nThe Webinate Team",									
									html: "A request was recently made to reset your Webinate password. <br/>If this was in error, please igore this email. <br/><br/>If however you would like your password reset, then please click on the link below:<br/>" + ( utils.config.secure ? "https://" : "http://" ) + utils.config.host + ":" + utils.config.port + "/user/reset-password-form?tag=" + newPass + "&user=" + results[0].username + "<br/><br/>Thanks<br/>The Webinate Team",
								},
								function ( err: Error, resp?: any )
								{
									if ( err )
									{
										logger.log( err.message, logger.LogType.ERROR );
										viewJSON.render( { message : err.message }, request, response, viewJSON.ReturnType.ERROR );
									}
									else
									{
										logger.log( "Welcome email re-sent to user " + results[0].username + " on the " + ( new Date() ).toDateString() );
										viewJSON.render( { message: "A reset password link has been sent to your email address" }, request, response, viewJSON.ReturnType.SUCCESS );
										return;
									}
								}
							);
						}
					});
				}
			});
		}

		// Search the collection for the user
		logger.log( "Resetting password for user '" + username + "'" );
		Model.collections( "users" ).find( { $or: [{ email: username }, { username: username }] }, { limit: 1 }, onFindUser );
	}


	/**
	* Attempts to log the user in. 
	* @param {string} username The username or email of the user
	* @param {string} pass The password of the user
	* @param {boolean} rememberMe True if the cookie persistence is required
	* @param {http.ServerRequest} request 
	* @param {http.ServerResponse} response
	* @returns {ErrorController} [Optional]
	*/
	public logIn( username: string = "", pass: string = "", rememberMe: boolean = true, request?: http.ServerRequest, response?: http.ServerResponse ): void
	{
		// Trim the fields
		username = validator.trim( username );
		pass = validator.trim( pass );

		if ( !username || username == "" ) return new ErrorController( utils.ErrorCodes.INVALID_OPTION, "Username cannot be null or empty" ).processRequest( request, response, "" );
		if ( !pass || pass == "" ) return new ErrorController( utils.ErrorCodes.INVALID_OPTION, "Password cannot be null or empty" ).processRequest( request, response, "" );
		if ( !validator.isSafeCharacters( username ) ) return new ErrorController( utils.ErrorCodes.INVALID_INPUT, "Please only use alpha numeric and '_!@£$' characters for your username" ).processRequest( request, response, "" );

		//this.logout();

		// Check if the user already exists
		var onFindUser = function ( error: any, result: mongodb.Cursor )
		{
			if ( error || !result )
				return new ErrorController( utils.ErrorCodes.DATABASE_ERROR, error ).processRequest( request, response, "" );

			result.toArray( function( error: any, results: Array<userModel.User> )
			{
				if ( results.length == 0 )
					return new ErrorController( utils.ErrorCodes.INVALID_INPUT, "The username or password is incorrect." ).processRequest( request, response, "" );

				// Check if the register key has been removed yet
				if ( results[0].registerKey != "" )
				{
					var err: ErrorController = new ErrorController( utils.ErrorCodes.INVALID_INPUT, "Please authorise your account. Click on the link that was sent to your email" );
					err.token["show-resend"] = true;
					err.processRequest( request, response, "" );
					return;
				}


				// Check the password
				if ( !bcrypt.compareSync( pass, results[0].password ) )
					return new ErrorController( utils.ErrorCodes.INVALID_INPUT, "The username or password is incorrect." ).processRequest( request, response, "" );


				// remove any sensitive data before sending the token back
				var token: any = results[0];
				delete token.password;
				token.message = "Logged into Animate!";

				if ( rememberMe.toString().toLowerCase() != "true" )
				{
					viewJSON.render( results[0], request, response, viewJSON.ReturnType.SUCCESS );
					logger.log( "User '" + username + "' logged in @" + new Date().toDateString() );
				}
				else
				{
					if ( request )
					{
						session.SessionManager.singleton.lookupOrCreate( request, { lifetime: UserController._sessionTimout, persistent: true, secure: ( utils.config.secure ? true : false ) }, function ( e: string, s: session.Session )
						{
							response.setHeader( 'Set-Cookie', s.getSetCookieHeaderValue() );
							s.data.username = username;
							logger.log( "Setting user session for '" + username + "'..." );
							viewJSON.render( token, request, response, viewJSON.ReturnType.SUCCESS );
							logger.log( "User '" + username + "' logged in" );
						});
					}
					else
						viewJSON.render( token, request, response, viewJSON.ReturnType.SUCCESS );
				}
			});
		}

		// Search the collection for the user
		Model.collections( "users" ).find( { $or: [{ email: username }, { username: username }] }, { limit: 1 }, onFindUser );
	}


	/**
	* Attempts to log the user out
	* @param {http.ServerRequest} request 
	* @param {http.ServerResponse} response
	*/
	logOut( request: http.ServerRequest, response?: http.ServerResponse ) : void
	{
		logger.log( "User attempting to logout - checking for session...." );

		if ( request )
		{
			session.SessionManager.singleton.lookupOrCreate( request, { lifetime: -1, persistent: false, secure: ( utils.config.secure ? true : false ) }, function ( e: string, s: session.Session )
			{
				if ( s )
				{
					logger.log( "Session detected, removing cookie." );
					response.setHeader( 'Set-Cookie', s.getSetCookieHeaderValue() );

					var user = s.data.username;
					s.data = null;

					viewJSON.render( { loggedIn: false, message: "User logged out" }, request, response );
					logger.log( "User '" + user + "' logged out" );
				}
				else
				{
					logger.log( "Could not find session" );
					viewJSON.render( { loggedIn: false, message: "No active users" }, request, response );
				}
			});
		}
		else
			viewJSON.render( { loggedIn: false, message: "No active users" }, request, response );
	}


	/**
	* Checks to see if a user is logged in
	* @param {(val: boolean, id : userModel.User) => void} callback Function calls with either true or false if a user is logged in
	* @param {http.ServerRequest} request 
	* @param {http.ServerResponse} response
	*/
	public loggedIn( callback?: ( val: boolean, id: userModel.User) => void, request?: http.ServerRequest, response?: http.ServerResponse )
	{
		logger.log( "Checking for user session..." );

		// If no request or response, then assume its an admin user
		if ( !request && !response )
		{
			logger.log( "Admin command...creating super user..." );

			var user: userModel.User = new userModel.User(true);
			user.userType = userModel.UserType.ADMIN;

			if ( callback )
				return callback( true, user );
			else
			{
				user["loggedIn"] = true;
				user["message"] = "User logged in";
				return viewJSON.render( user, request, response );
			}
		}

		session.SessionManager.singleton.lookupOrCreate( request, { lifetime: UserController._sessionTimout, persistent: true, secure: (utils.config.secure ? true : false) }, function( e: string, s: session.Session )
		{
			if ( s )
			{
				logger.log( "Session detected - check if user exists" );
				response.setHeader( 'Set-Cookie', s.getSetCookieHeaderValue() );
				
				if ( s.data.username )
				{
					// Check if the user already exists
					var onFindUser = function ( error: any, result: mongodb.Cursor )
					{
						if ( error || !result )
						{
							if ( callback )
								return callback( false, null );
							else
								return viewJSON.render( { loggedIn: false, message: "User not logged in" }, request, response );
						}

						result.toArray( function ( error: any, results: Array<userModel.User> )
						{
							if ( results.length == 0 )
							{
								if ( callback )
									return callback( false, null );
								else
									return viewJSON.render( { loggedIn: false, message: "User not logged in" }, request, response );
							}
							else
							{
								logger.log( "Fetching user " + results[0].username );
								delete results[0].password;
								( <any>results[0] ).message = "User not logged in";
								( <any>results[0] ).loggedIn = true;
								
								if ( callback )
									return callback( true, results[0] );
								else
									return viewJSON.render( results[0], request, response );
							}
						});
					}

					// Search the collection for the user
					Model.collections( "users" ).find( { username: s.data.username }, { limit: 1 }, onFindUser );
				}
				else
				{
					logger.log( "No user session detected" );
					if ( callback )
						return callback( false, null );
					else
						return viewJSON.render( { loggedIn: false, message: "User not logged in" }, request, response );
				}
			}
			else
			{

				logger.log( "Could not create session" );				
				if ( callback )
					return callback( false, null );
				else
					return viewJSON.render( { loggedIn: false, message: "User not logged in" }, request, response );
			}
		});
	}


	/**
	* Gets a user by a username or email
	* @param {(user : userModel.User) => void} callback Function calls with a user or null
	* @param {http.ServerRequest} request 
	* @param {http.ServerResponse} response
	*/
	public getUser( user : string, callback?: ( user: userModel.User ) => void, request?: http.ServerRequest, response?: http.ServerResponse )
	{
		logger.log( "Getting user '" + user + "'..." );

		// Check if the user already exists
		var onFindUser = function ( err: any, user: userModel.User )
		{
			if ( err )
			{
				if ( callback )
					return callback( null );
				else
					return new ErrorController( utils.ErrorCodes.INVALID_INPUT, err ).processRequest( request, response, "" );
			}

			if ( !user )
			{
				if ( callback )
					return callback( null );
				else
					return new ErrorController( utils.ErrorCodes.INVALID_INPUT, "Could not find user" ).processRequest( request, response, "" );
			}

			if ( callback )
				return callback( user );
			else
				viewJSON.render( user, request, response );
		}

		var target = [];		
		if ( validator.isValidObjectID( user ) )
			target.push( { _id: new mongodb.ObjectID( user ) });
		else
		{
			target.push( { email: user });
			target.push( { username: user });
		}

		// Search the collection for the user
		Model.collections( "users" ).findOne( { $or: target }, onFindUser );
	}


	/**
	* Removes a user by his email or username
	* @param {string} user The user of the user
	* @param {http.ServerRequest} request 
	* @param {http.ServerResponse} response
	*/
	public remove( username: string = "", request?: http.ServerRequest, response?: http.ServerResponse ) : void
	{
		if ( !username || username.trim() == "" ) return new ErrorController( utils.ErrorCodes.INVALID_OPTION, "Username cannot be null or empty" ).processRequest( request, response, "" );

		logger.log( "Removing user " + username + "..." );
		var that = this;
		
		this.loggedIn( function ( loggedIn: boolean, user: userModel.User )
		{
			// If not logged in then do nothing
			if ( !loggedIn )
				return new ErrorController( utils.ErrorCodes.AUTHENTICATION_REQUIRED, "Authentication is required to call this function" ).processRequest( request, response, "" );

			// Check an admin
			if ( user.userType != userModel.UserType.ADMIN )
				return new ErrorController( utils.ErrorCodes.AUTHENTICATION_REQUIRED, "Admin authentication is required to call this function" ).processRequest( request, response, "" );

			// Get the user
			that.getUser( username, function ( user: userModel.User )
			{
				if ( !user )
					return new ErrorController( utils.ErrorCodes.DATABASE_ERROR, "Could not find user '" + username + "'" ).processRequest( request, response, "" );

				// Remove avatar
				if ( fs.existsSync( user.imagePath ) )
					fs.unlinkSync( user.imagePath )


				// delete projects
				Model.collections( "projects" ).find( { user: user._id }, function ( err: any, cursor: mongodb.Cursor )
				{
					if ( err )
						return new ErrorController( utils.ErrorCodes.DATABASE_ERROR, err ).processRequest( request, response, "" );

					cursor.toArray( function ( err: any, projects: Array<projectModel.Project> )
					{
						var projectIds : Array<string> = [];
						for ( var i = 0, l = projects.length; i < l; i++ )
							projectIds.push( projects[i]._id.toString() );

						function deleteProject()
						{
							if ( projectIds.length == 0 )
							{
								onProjectsDeleted();
								return;
							}

							// Delete the projects
							require( "./ProjectController" ).singleton.deleteProject( projectIds.pop(), function ( success: boolean )
							{
								if ( !success )
									return new ErrorController( utils.ErrorCodes.INVALID_INPUT, "Could not delete a project. Returning...'" ).processRequest( request, response, "" );

								deleteProject();

							}, request, response );
						}

						deleteProject();
					});
				});
			});
		});

		function onProjectsDeleted()
		{
			// Remove the user from 
			Model.collections( "users" ).remove( { $or: [{ email: username }, { username: username }] }, function ( err: any, result: number )
			{
				if ( err )
					return new ErrorController( utils.ErrorCodes.DATABASE_ERROR, err ).processRequest( request, response, "" );
				else if ( result === 0 )
					return new ErrorController( utils.ErrorCodes.INVALID_INPUT, "User '" + username + "' could not be found" ).processRequest( request, response, "" );

				viewJSON.render( { message: "User '" + username + "' has been removed", count: result }, request, response );
				logger.log( "User '" + username + "' has been removed" );
			});
		}
	}


	/** 
	* Prints user objects from the database
	* @param {number} limit The number of users to fetch
	* @param {number} startIndex The starting index from where we are fetching users from
	* @param {http.ServerRequest} request 
	* @param {http.ServerResponse} response
	*/
	public print( limit: number = 0, startIndex: number = 0, request?: http.ServerRequest, response?: http.ServerResponse ) : void
	{
		logger.log( "Printing users..." );
		var that = this;

		this.loggedIn( function( val, user: userModel.User )
		{
			if ( !user )
				return viewJade.render( __dirname + "/../views/messages/error.jade", { message: "Authentication required" }, response );

			if ( !user || user.userType != userModel.UserType.ADMIN )
				return viewJade.render( __dirname + "/../views/messages/error.jade", { message: "You do not have permissions to view this content" }, response );
				
			that.getUsers( limit, startIndex, null, null, function ( users: Array<any> )
			{
				return viewJade.render( __dirname + "/../views/admin/users/print.jade", {users : users }, response );
			});

		}, request, response );
	}


	/** 
	* Prints each of the active sessions
	* @param {number} limit The number of sessions to fetch
	* @param {number} startIndex The starting index from where we are fetching sessions from
	* @param {http.ServerRequest} request 
	* @param {http.ServerResponse} response
	*/
	printSessions( limit: number = 0, startIndex: number = 0, request?: http.ServerRequest, response?: http.ServerResponse ) : void
	{
		logger.log( "Printing sessions..." );
		var that = this;
		
		this.loggedIn( function ( val, user: userModel.User )
		{
			if ( !user || user.userType != userModel.UserType.ADMIN )
				return viewJade.render( __dirname + "/../views/messages/error.jade", { message: "You do not have permissions to view this content" }, response );

			Model.collections("sessions").find( {}, {}, startIndex, limit, function ( err: any, result: mongodb.Cursor )
			{
				result.toArray( function ( err: any, sessions: Array<session.Session> )
				{
					return viewJade.render( __dirname + "/../views/admin/sessions/print.jade", { sessions: sessions }, response );
				});
			});

		}, request, response );
	}


	/** 
	* Gets user objects from the database
	* @param {number} limit The number of users to fetch
	* @param {number} startIndex The starting index from where we are fetching users from
	* @param {http.ServerRequest} request 
	* @param {http.ServerResponse} response
	*/
	public getUsers( limit: number = 0, startIndex: number = 0, request?: http.ServerRequest, response?: http.ServerResponse, callback?: ( users: Array<any>) => void )
	{
		logger.log( "Getting " + limit.toString() + " users from index " + startIndex.toString() + "..." );
		
		Model.collections( "users" ).find( {}, {}, startIndex, limit, function ( err: any, result: mongodb.Cursor )
		{
			var token : any;
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
	* Attempts to register a new user
	* @param {string} username The username of the user
	* @param {string} pass The users secret password
	* @param {string} email The users email address
	* @param {string} captcha The captcha value the user guessed
	* @param {string} captchaChallenge The captcha challenge
	* @param {http.ServerRequest} request 
	* @param {http.ServerResponse} response
	* @returns {ErrorController} [Optional]
	*/
	private register( username: string = "", pass: string = "", email: string = "", captcha: string = "", captchaChallenge: string = "", request?: http.ServerRequest, response?: http.ServerResponse ): void
	{
		if ( request && request.method != "POST" )
			return new ErrorController( utils.ErrorCodes.BAD_METHOD, "Only valid with POST requests" ).processRequest( request, response, "" );

		// Trim the fields
		username = validator.trim( username );
		pass = validator.trim( pass );
		email = validator.trim( email );
		captcha = validator.trim( captcha );
		captchaChallenge = validator.trim( captchaChallenge );

		

		// Validate
		if ( !username || username == "" ) return new ErrorController( utils.ErrorCodes.INVALID_OPTION, "Username cannot be null or empty" ).processRequest( request, response, "" );
		if ( !pass || pass == "" ) return new ErrorController( utils.ErrorCodes.INVALID_OPTION, "Password cannot be null or empty" ).processRequest( request, response, "" );
		if ( !email || email == "" ) return new ErrorController( utils.ErrorCodes.INVALID_OPTION, "Email cannot be null or empty" ).processRequest( request, response, "" );
		if ( request && ( !captcha || captcha == "" ) ) return new ErrorController( utils.ErrorCodes.INVALID_OPTION, "Captcha cannot be null or empty" ).processRequest( request, response, "" );
		if ( request && ( !captchaChallenge || captchaChallenge == "" ) ) return new ErrorController( utils.ErrorCodes.INVALID_OPTION, "Challenge cannot be null or empty" ).processRequest( request, response, "" );
		if ( !validator.isEmail( email ) ) return new ErrorController( utils.ErrorCodes.USER_BAD_EMAIL, "Please use a valid email adress" ).processRequest( request, response, "" );
		if ( !validator.isSafeCharacters( username ) ) return new ErrorController( utils.ErrorCodes.INVALID_INPUT, "Please only use alpha numeric and '_!@£$' characters for your username" ).processRequest( request, response, "" );

		// Create the captcha checker
		var onCaptha = function ( captchaObj: any )
		{
			if ( !captchaObj.is_valid )
				return new ErrorController( utils.ErrorCodes.INVALID_CAPTCHA, "Your captcha code seems to be wrong. Please try another." ).processRequest( request, response, "" );
			else
			{
				var user: userModel.User = new userModel.User();
				user.username = username;
				user.password = bcrypt.hashSync( pass );
				user.email = email;
				user.registerKey = generatePassword( 10 );

				// Validation passed - create user in database
				Model.collections( "users" ).save( user, function ( err: any, result: any )
				{
					var token: any;
					if ( err || !result )
					{
						token = {};
						token.message = err;
					}
					else
					{
						token = result;
						token.message = err;
						logger.log( utils.ConsoleStyles.green[0] + "User ['" + username + "'] created..." + utils.ConsoleStyles.green[1] );
					}

					// Sent 
					token.message = "You have successfully created a new user account. Please check your email for instructions.";
					viewJSON.render( token, request, response, ( err || !result ? viewJSON.ReturnType.ERROR : viewJSON.ReturnType.SUCCESS ) );

					logger.log( "Attempting to send welcome email to " + email );

					// Send email to welcome the user
					Mailer.getSingleton().sendEmail(
						{
							from: "Webinate Support Team<support@webinate.net>",
							to: email,
							subject: "Activate your account",
							text: "Thank you for registering with Webinate!\nTo activate your account please click the link below:\n\n" + ( utils.config.secure ? "https://" : "http://" ) + utils.config.host + ":" + utils.config.port + "/user/activate-account?key=" + user.registerKey + "&user=" + user.username + "\n\nThanks\nThe Webinate Team",
							html: "Thank you for registering with Webinate!<br/>To activate your account please click the link below:<br/><br/>" + ( utils.config.secure ? "https://" : "http://" ) + utils.config.host + ":" + utils.config.port + "/user/activate-account?key=" + user.registerKey + "&user=" + user.username + "<br/><br/>Thanks<br/>The Webinate Team"
						},
						function ( err: Error, response?: any )
						{
							if ( err )
								logger.log( utils.ConsoleStyles.red[0] + err.message + utils.ConsoleStyles.red[1] );
							else
								logger.log( "Welcome email sent to user " + user.username + " on the " + ( new Date() ).toDateString() );
						}
					);
				});
			}
		};

		// Check if the user already exists
		var onDupeSearch = function ( e: any, result: mongodb.Cursor )
		{
			if ( e || !result )
				return new ErrorController( utils.ErrorCodes.DATABASE_ERROR, utils.ConsoleStyles.red[0] + e + utils.ConsoleStyles.red[1] ).processRequest( request, response, "" );

			result.toArray( function ( err: any, results:Array<any> )
			{
				if ( results.length === 0 )
				{
					if ( request )
					{
						// Create the captcha checker
						var remoteIP: string = request.headers['x-forwarded-for'] || request.connection.remoteAddress;
						var privatekey: string = "6LdiW-USAAAAABtyOJMi8UQGn1kG_v8DzYQOHTbV"; //https://www.google.com/recaptcha/admin/site?siteid=317021026
						var captchaChecker: recaptcha.reCaptcha = new recaptcha.reCaptcha();
						captchaChecker.on( "data", onCaptha );

						// Check for valid captcha		
						captchaChecker.checkAnswer( privatekey, remoteIP, captchaChallenge, captcha );
					}
					else
						onCaptha( { is_valid : true } );
				}
				else
				{
					var token: any = {};
					token.message = "That username or email is already in use; please choose another or login.";
					viewJSON.render( token, request, response, viewJSON.ReturnType.ERROR );
					logger.log( "Register attempt failed for user '" + username + "' - " + token.message );
				}		
			});
		}
			

		var checkDuplicates = function()
		{
			Model.collections( "users" ).find( {
				$or: [{ email: email }, { username: username } ]
				 }, { limit: 1 }, onDupeSearch );
		}

		// Start the chain
		checkDuplicates();
	}
	

	updateUserDetails( bio: string = "", callback?: ( numAffected : number ) => void, request?: http.ServerRequest, response?: http.ServerResponse ) : void
	{
		logger.log( "Updating user details...", logger.LogType.ADMIN );

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

			// Clean bio
			bio = sanitizeHtml( bio, { allowedTags: [] });

			Model.collections( "users" ).update( { _id: user._id }, { $set: { bio: bio } }, function ( err: any, numAffected: number )
			{
				// If not logged in then do nothing
				if ( err )
				{
					if ( callback )
						return callback( 0 );
					else
						return new ErrorController( utils.ErrorCodes.DATABASE_ERROR, err ).processRequest( request, response, "" );
				}

				logger.log( "User " + user._id + " details updated.", logger.LogType.SUCCESS );

				if ( callback )
					return callback( numAffected );
				else
					return viewJSON.render( { message : "User details updated" }, request, response, viewJSON.ReturnType.SUCCESS );
			});

		}, request, response );
	}



	/**
	* Gets an instance of the user controller
	* @returns {UserController}
	*/
	static get singleton(): UserController
	{
		if ( !UserController._singleton )
			UserController._singleton = new UserController();

		return UserController._singleton;
	}
}

/**
* Use this function to generate a random password
* @param {number} length The length of the password. 
* @returns {string}
*/
function generatePassword( length : number ) : string
{
	var text = "";
	var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

	for ( var i = 0; i < length; i++ )
		text += possible.charAt( Math.floor( Math.random() * possible.length ) );

	return text;
}

export = UserController;