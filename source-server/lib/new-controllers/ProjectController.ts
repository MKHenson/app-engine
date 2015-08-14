import * as mongodb from "mongodb";
import * as express from "express";
import * as bodyParser from "body-parser";
import {Controller, IServer, IConfig, IResponse} from "modepress-api";
import {IGetProjects} from "modepress-engine";
import {ProjectModel} from "../new-models/ProjectModel";
import {IProject} from "engine";

/**
* A controller that deals with project models
*/
export class ProjectController extends Controller
{
	/**
	* Creates a new instance of the email controller
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

        router.get("/:id?", <any>[this.getProjects.bind(this)]);

        // Register the path
        e.use("/app-engine/projects", router);
    }

    /**
    * Gets projects based on the format of the request
    * @param {express.Request} req 
    * @param {express.Response} res
    * @param {Function} next 
    */
    private getProjects(req: express.Request, res: express.Response, next: Function)
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
            return model.findInstances(findToken, [], parseInt(req.query.index), parseInt(req.query.limit));

        }).then(function (instances)
        {
            var sanitizedData: Array<IProject> = that.getSanitizedData<IProject>(instances, Boolean(req.query.verbose));
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