import * as mongodb from "mongodb";
import * as express from "express";
import * as bodyParser from "body-parser";
import {Controller, IServer, IConfig, IResponse, isAuthenticated, IAuthReq} from "modepress-api";
import {ICreateBuild} from "modepress-engine";
import {PermissionController} from "./PermissionController";
import {BuildModel} from "../new-models/BuildModel";
import {IProject} from "engine";

/**
* A controller that deals with build models
*/
export class BuildController extends Controller
{
    public static singleton: BuildController;

	/**
	* Creates a new instance of the  controller
	* @param {IServer} server The server configuration options
    * @param {IConfig} config The configuration options
    * @param {express.Express} e The express instance of this server	
	*/
    constructor(server: IServer, config: IConfig, e: express.Express)
    {
        super([new BuildModel()]);
        BuildController.singleton = this;

        var router = express.Router();
        var permissions = PermissionController.singleton;
        router.use(bodyParser.urlencoded({ 'extended': true }));
        router.use(bodyParser.json());
        router.use(bodyParser.json({ type: 'application/vnd.api+json' }));        
        
        // Define the routes
        router.post("/create", <any>[isAuthenticated, permissions.canCreateProject, this.create.bind(this)]);

        // Register the path
        e.use("/app-engine/projects", router);
    }

    /**
    * Creates a new build
    * @returns {Promise<Modepress.ModelInstance<Engine.IBuild>>}
    */
    createBuild(username: string, project?: string): Promise<Modepress.ModelInstance<Engine.IBuild>>
    {
        var that = this;
        var model = that.getModel("en-builds");

        return new Promise<Modepress.ModelInstance<Engine.IBuild>>(function (resolve, reject)
        {
            model.createInstance(<Engine.IBuild>{ user: username, projectId: project }).then(function (instance)
            {
                return instance;

            }).catch(function (err: Error)
            {
                return reject(err);
            });
        });
    }

    /**
    * Removes a build by its id
    * @returns {Promise<number>}
    */
    removeBuild(id: string): Promise<number>
    {
        var that = this;
        var model = that.getModel("en-builds");

        return new Promise<number>(function (resolve, reject)
        {
            model.deleteInstances(<Engine.IBuild>{ _id: new mongodb.ObjectID(id) }).then(function (instance)
            {
                return instance;

            }).catch(function (err: Error)
            {
                return reject(err);
            });
        });
    }

    /**
    * Removes a build by its id
    * @returns {Promise<any>}
    */
    linkProject(buildId: string, projId: string): Promise<any>
    {
        var that = this;
        var model = that.getModel("en-builds");

        return new Promise<any>(function (resolve, reject)
        {
            model.update(<Engine.IBuild>{ _id: new mongodb.ObjectID(buildId) }, <Engine.IBuild>{ projectId: new mongodb.ObjectID(projId) }).then(function (instances)
            {
                if (instances.error)
                    return Promise.reject(new Error("An error has occurred while linking the build with a project"));

                return resolve();

            }).catch(function (err: Error)
            {
                return reject(err);
            });
        });
    }

    /**
    * Creates a new build instance for the logged in user
    * @param {express.Request} req 
    * @param {express.Response} res
    * @param {Function} next 
    */
    create(req: IAuthReq, res: express.Response, next: Function)
    {
        var that = this;
        res.setHeader('Content-Type', 'application/json');
        var username = req._user.username;
        var model = that.getModel("en-builds");

        return new Promise<Engine.IBuild>(function (resolve, reject)
        {
            that.createBuild( username ).then(function (instance)
            {
                return res.end(JSON.stringify(<IResponse>{
                    error: false,
                    message: `Created new build for user '${username}'`
                }));

            }).catch(function (err: Error)
            {
                return res.end(JSON.stringify(<IResponse>{
                    error: true,
                    message: `Could not create build for '${username}' : ${err.message}`
                }));
            });
        });
    }
}