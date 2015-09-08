import * as mongodb from "mongodb";
import * as express from "express";
import * as bodyParser from "body-parser";
import {Controller, IServer, IConfig, IResponse, isAuthenticated, IAuthReq} from "modepress-api";
import {UserDetailsModel} from "../new-models/UserDetailsModel";
import {ProjectModel} from "../new-models/ProjectModel";
import {IProject} from "engine";

/**
* A controller that deals with project models
*/
export class PermissionController extends Controller
{
    public static singleton: PermissionController;

	/**
	* Creates a new instance of the controller
	* @param {IServer} server The server configuration options
    * @param {IConfig} config The configuration options
    * @param {express.Express} e The express instance of this server	
	*/
    constructor(server: IServer, config: IConfig, e: express.Express)
    {
        PermissionController.singleton = this;
        super([new ProjectModel(), new UserDetailsModel()]);
    }

    /**
    * Checks if the logged in user has the allowance to create a new project. This assumes the user is already logged in.
    * @param {express.Request} req 
    * @param {express.Response} res
    * @param {Function} next 
    */
    canCreateProject(req: IAuthReq, res: express.Response, next: Function)
    {
        res.setHeader('Content-Type', 'application/json');
        var that = this;
        var userModel = that.getModel("en-user-details");
        var projModel = that.getModel("en-projects");
        var username = req._user.username;
        var maxProjects = 0;

        // If an admin - then the user can create a new projec regardless
        if (req._user.privileges < 3)
            return next();

        // Get the details
        userModel.findOne<Engine.IUserDetails>(<Engine.IUserDetails>{ user: username }).then(function (instance)
        {
            if (!instance)
                return Promise.reject(new Error("Not found"));

            maxProjects = instance.dbEntry.maxProjects;

            // get number of projects
            return projModel.count(<Engine.IProject>{ user: username });

        }).then(function (numProjects)
        {
            // If num projects + 1 more is less than max we are ok
            if (numProjects + 1 < maxProjects)
                return next();
            else
                return Promise.reject(new Error(`You cannot create more projects on this plan. Please consider upgrading your account.`));

        }).catch(function (err: Error)
        {
            return res.end(JSON.stringify(<IResponse>{
                error: true,
                message: `Could not create new project : ${err.message}`
            }));
        });
    }
}