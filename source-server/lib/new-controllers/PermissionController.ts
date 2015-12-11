import * as mongodb from "mongodb";
import * as express from "express";
import * as bodyParser from "body-parser";
import {Controller, IServer, IConfig, IResponse, isAuthenticated, IAuthReq, Model} from "modepress-api";
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
    * Checks if the logged in user has the allowance to create a new project
    * @param {IUserEntry} user
    */
    projectsWithinLimits(user: UsersInterface.IUserEntry): Promise<boolean>
    {        
        // If an admin - then the user can create a new projec regardless
        if (user.privileges < 3)
            return Promise.resolve(true);
        
        var that = this;

        // Get the details
        return new Promise<boolean>(function (resolve, reject)
        {
            var userModel = that.getModel("en-user-details");
            var projModel = that.getModel("en-projects");
            var username = user.username;
            var maxProjects = 0;

            userModel.findOne<Engine.IUserMeta>(<Engine.IUserMeta>{ user: username }).then(function (instance)
            {
                if (!instance)
                    return Promise.reject(new Error("Not found"));

                maxProjects = instance.dbEntry.maxProjects;

                // get number of projects
                return projModel.count(<Engine.IProject>{ user: username });

            }).then(function (numProjects)
            {
                // TODO: Check if project is allowed certain plugins?

                // If num projects + 1 more is less than max we are ok
                if (numProjects < maxProjects)
                    return resolve(true);
                else
                    return Promise.reject(new Error(`You cannot create more projects on this plan. Please consider upgrading your account`));

            }).catch(function (err: Error)
            {
                return reject(err);
            });
        });
    }
}