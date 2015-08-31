import * as mongodb from "mongodb";
import * as express from "express";
import * as bodyParser from "body-parser";
import {Controller, IServer, IConfig, IResponse, UsersService} from "modepress-api";
import {IGetPlugins} from "modepress-engine";
import {UserDetailsModel} from "../new-models/UserDetailsModel";
import {IPlugin} from "engine";


export interface IUserRequest extends express.Request
{
    _user: UsersInterface.IUserEntry;
}

/**
* A controller that deals with user permissions
*/
export class PermissionController extends Controller
{
    static singleton: PermissionController;

	/**
	* Creates a new instance of the email controller
	* @param {IServer} server The server configuration options
    * @param {IConfig} config The configuration options
    * @param {express.Express} e The express instance of this server	
	*/
    constructor(server: IServer, config: IConfig, e: express.Express)
    {
        super([new UserDetailsModel()]);
        PermissionController.singleton = this;
    }

    /**
    * This funciton checks if user is logged in and throws an error if not
    * @param {string} user The username of the user we want to get details for
    */
    getUserDetails(user: string): Promise<Engine.IUserDetails>
    {
        var model = this.getModel("en-user-details");
        return new Promise<Engine.IUserDetails>(function( resolve, reject )
        {
            
        });
    }

    /**
    * This funciton checks if user is logged in and throws an error if not
    * @param {express.Request} req 
    * @param {express.Response} res
    * @param {Function} next 
    */
    authenticated(req: IUserRequest, res: express.Response, next: Function)
    {
        var users = UsersService.getSingleton();
        users.authenticated(req, res).then(function (auth: UsersInterface.IAuthenticationResponse)
        {
            if (!auth.authenticated)
            {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(<IResponse>{
                    error: true,
                    message: auth.message
                }));
                return;
            }

            req._user = auth.user;
            next();

        }).catch(function (error: Error)
        {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(<IResponse>{
                error: true,
                message: error.message
            }));
        });
    }
}
