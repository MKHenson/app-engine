import * as mongodb from "mongodb";
import * as express from "express";
import * as bodyParser from "body-parser";
import {Controller, IServer, IConfig, IResponse} from "modepress-api";
import {IGetPlugins} from "modepress-engine";
import {PluginModel} from "../new-models/PluginModel";
import {IPlugin} from "engine";

/**
* A controller that deals with plugin models
*/
export class PluginController extends Controller
{
	/**
	* Creates a new instance of the email controller
	* @param {IServer} server The server configuration options
    * @param {IConfig} config The configuration options
    * @param {express.Express} e The express instance of this server	
	*/
    constructor(server: IServer, config: IConfig, e: express.Express)
    {
        super([new PluginModel()]);

        var router = express.Router();
        router.use(bodyParser.urlencoded({ 'extended': true }));
        router.use(bodyParser.json());
        router.use(bodyParser.json({ type: 'application/vnd.api+json' }));

        router.get("/:id?", <any>[this.getPlugins.bind(this)]);

        // Register the path
        e.use("/app-engine/plugins", router);
    }

    /**
    * Gets plugins based on the format of the request
    * @param {express.Request} req 
    * @param {express.Response} res
    * @param {Function} next 
    */
    private getPlugins(req: express.Request, res: express.Response, next: Function)
    {
        res.setHeader('Content-Type', 'application/json');
        var model = this.getModel("en-plugins");
        var that = this;
        var count = 0;

        var findToken = {};

        var getContent: boolean = true;
        if (req.query.minimal)
            getContent = false;

        // Check for keywords
        if (req.query.search)
            (<IPlugin>findToken).name = <any>new RegExp(req.query.search, "i");
        
        // First get the count
        model.count(findToken).then(function (num)
        {
            count = num;
            return model.findInstances<IPlugin>(findToken, [], parseInt(req.query.index), parseInt(req.query.limit), (getContent == false ? { html: 0 } : undefined));

        }).then(function (instances)
        {
            var sanitizedData = that.getSanitizedData(instances, Boolean(req.query.verbose));
            res.end(JSON.stringify(<IGetPlugins>{
                error: false,
                count: count,
                message: `Found ${count} plugins`,
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