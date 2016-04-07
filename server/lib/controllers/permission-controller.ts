import * as mongodb from "mongodb";
import * as express from "express";
import * as bodyParser from "body-parser";
import * as modepress from "modepress-api";
import {UserDetailsModel} from "../models/user-details-model";
import {ProjectModel} from "../models/project-model";
import {IProject} from "engine";

/**
* A controller that deals with project models
*/
export class PermissionController extends modepress.Controller
{
    public static singleton: PermissionController;

	/**
	* Creates a new instance of the controller
	* @param {IServer} server The server configuration options
    * @param {IConfig} config The configuration options
    * @param {express.Express} e The express instance of this server
	*/
    constructor(server: modepress.IServer, config: modepress.IConfig, e: express.Express)
    {
        super([new ProjectModel(), new UserDetailsModel()]);
        PermissionController.singleton = this;
    }

    /**
    * Checks if the logged in user has read access to a project's data
    * @param {modepress.IAuthReq} req
    * @param {express.Response} res
    * @param {Function} next
    */
    canReadProject(req: modepress.IAuthReq, res : express.Response, next: Function )
    {
         var query = {
            $or : [
                { readPrivileges: { $in: [ req._user.username ] } },
                { writePrivileges: { $in: [ req._user.username ] } },
                { adminPrivileges: { $in: [ req._user.username ] } }
            ]
         };

        this.checkProjectPrivilege( query, req, res, next );
    }

    /**
    * Checks if the logged in user has write access to a project's data
    * @param {modepress.IAuthReq} req
    * @param {express.Response} res
    * @param {Function} next
    */
    canWriteProject(req: modepress.IAuthReq, res : express.Response, next: Function )
    {
        var query = {
            $or : [
                { writePrivileges: { $in: [ req._user.username ] } },
                { adminPrivileges: { $in: [ req._user.username ] } }
            ]
         };

        this.checkProjectPrivilege( query, req, res, next );
    }

    /**
    * Checks if the logged in user has admin access to a project's data
    * @param {modepress.IAuthReq} req
    * @param {express.Response} res
    * @param {Function} next
    */
    canAdminProject(req: modepress.IAuthReq, res : express.Response, next: Function )
    {
        var query = {
            adminPrivileges: { $in: [ req._user.username ] }
         };

        this.checkProjectPrivilege( query, req, res, next );
    }

    /**
    * Checks if the logged in user has rights to a project
    * @param {any} query
    * @param {modepress.IAuthReq} req
    * @param {express.Response} res
    * @param {Function} next
    */
    private checkProjectPrivilege( query: any, req: modepress.IAuthReq, res : express.Response, next: Function )
    {
        var project = req.params.project;
        var user = req.params.user;

        if (!project)
        {
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify(<modepress.IResponse>{
                error: true,
                message: `Project not specified`
            }));
        }

        if (!modepress.isValidID(project))
        {
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify(<modepress.IResponse>{
                error: true,
                message: "Please use a valid project ID"
            }));
        }

        // If an admin - then the user can manage the project
        if (req._user.privileges < 3)
            return next();

        var projectModel = this.getModel("en-projects");
        var that = this;

        projectModel.count( <Engine.IProject>{ _id : new mongodb.ObjectID(project), user: user }).then(function(count)
        {
            if (count == 0)
                throw new Error("No project exists with that ID");

            return projectModel.count(query)

        }).then(function(count)
        {
            if (count == 0)
                throw new Error("User does not have permissions for project");
            else
                next();

        }).catch(function( err : Error )
        {
            res.setHeader('Content-Type', 'application/json');
            return res.end(JSON.stringify(<modepress.IResponse>{
                error: true,
                message: err.message
            }));
        });
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