import * as mongodb from "mongodb";
import * as express from "express";
import * as bodyParser from "body-parser";
import {Controller, IServer, IConfig, IResponse, isAuthenticated, IAuthReq} from "modepress-api";
import {IGetProjects, ICreateProject} from "modepress-engine";
import {PermissionController} from "./PermissionController";
import {BuildController} from "./BuildController";
import {ProjectModel} from "../new-models/ProjectModel";
import {IProject} from "engine";

/**
* A controller that deals with project models
*/
export class ProjectController extends Controller
{
	/**
	* Creates a new instance of the controller
	* @param {IServer} server The server configuration options
    * @param {IConfig} config The configuration options
    * @param {express.Express} e The express instance of this server	
	*/
    constructor(server: IServer, config: IConfig, e: express.Express)
    {
        super([new ProjectModel()]);

        var router = express.Router();
        router.use(bodyParser.urlencoded({ 'extended': true }));
        router.use(bodyParser.json());
        router.use(bodyParser.json({ type: 'application/vnd.api+json' }));
        
        var permissions = PermissionController.singleton;

        router.get("/:id?", <any>[this.getProjects.bind(this)]);
        router.post("/create", <any>[isAuthenticated, permissions.canCreateProject, this.createProject.bind(this)]);

        // Register the path
        e.use("/app-engine/projects", router);
    }

    

    /**
    * Gets projects based on the format of the request
    * @param {express.Request} req 
    * @param {express.Response} res
    * @param {Function} next 
    */
    createProject(req: IAuthReq, res: express.Response, next: Function)
    {
        // Check logged in + has rights to do request ✔
        // Check if project limit was reached ✔
        // Create a build  ✔
        // Sanitize details 
        // Create a project
        // Associate build with project and vice-versa

        res.setHeader('Content-Type', 'application/json');
        var token: Engine.IProject = req.body;
        var projects = this.getModel("en-projects");
        var buildCtrl = BuildController.singleton;
        var newBuild: Modepress.ModelInstance<Engine.IBuild>;
        var newProject: Modepress.ModelInstance<Engine.IProject>;

        // User is passed from the authentication function
        token.user = req._user.username;

        // Create build
        buildCtrl.createBuild(req._user.username).then(function (build)
        {
            newBuild = build;
            token.build = newBuild._id;
            return projects.createInstance(token);

        }).then(function(project)
        {
            newProject = project;

            // Link build with new project
            return buildCtrl.linkProject(newBuild._id, newProject._id); 

        }).then(function ()
        {
            // Finished
            res.end(JSON.stringify(<ICreateProject>{
                error: false,
                message: `Created project '${token.name}'`,
                data: newProject.schema.generateCleanData(true, newProject._id)
            }));

        }).catch(function (err: Error)
        {
            // Make sure any builds were removed if an error occurred
            if (newBuild)
                buildCtrl.removeBuild(newBuild._id).then(function () {
                    res.end(JSON.stringify(<IResponse>{ error: true, message: err.message }));
                });
            else
                res.end(JSON.stringify(<IResponse>{ error: true, message: err.message }));

        });
    }

    /**
    * Gets projects based on the format of the request
    * @param {express.Request} req 
    * @param {express.Response} res
    * @param {Function} next 
    */
    getProjects(req: express.Request, res: express.Response, next: Function)
    {
        res.setHeader('Content-Type', 'application/json');
        var model = this.getModel("en-projects");
        var that = this;
        var count = 0;

        var findToken = {};
        
        // Check for keywords
        if (req.query.search)
            (<IProject>findToken).name = <any>new RegExp(req.query.search, "i");
        
        // First get the count
        model.count(findToken).then(function (num)
        {
            count = num;
            return model.findInstances<IProject>(findToken, [], parseInt(req.query.index), parseInt(req.query.limit));

        }).then(function (instances)
        {
            var sanitizedData = that.getSanitizedData(instances, Boolean(req.query.verbose));
            res.end(JSON.stringify(<IGetProjects>{
                error: false,
                count: count,
                message: `Found ${count} projects`,
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