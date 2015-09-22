import * as mongodb from "mongodb";
import * as express from "express";
import * as bodyParser from "body-parser";
import {Controller, IServer, IConfig, IResponse, isAdmin, IAuthReq} from "modepress-api";
import {PluginModel} from "../new-models/PluginModel";
import {IPlugin} from "engine";
import * as winston from "winston";

/**
* A controller that deals with plugin models
*/
export class PluginController extends Controller
{
	/**
	* Creates a new instance of the controller
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
        router.post("/create", <any>[isAdmin, this.create.bind(this)]);
        router.put("/update/:id", <any>[isAdmin, this.update.bind(this)]);

        // Register the path
        e.use("/app-engine/plugins", router);
    }

    /**
    * Updates a plugin with new details
    * @param {IAuthReq} req 
    * @param {express.Response} res
    * @param {Function} next 
    */
    private update(req: IAuthReq, res: express.Response, next: Function)
    {
        res.setHeader('Content-Type', 'application/json');
        var model = this.getModel("en-plugins");
        var that = this;
        var pluginToken = <IPlugin>req.body;
        model.update<IPlugin>(<IPlugin>{ _id: new mongodb.ObjectID(req.params.id) }, pluginToken).then(function (data)
        {
            res.end(JSON.stringify(<IResponse>{
                error: false,
                message: "Plugin Updated"
            }));

        }).catch(function (error: Error)
        {
            winston.error(error.message, { process: process.pid });
            res.end(JSON.stringify(<IResponse>{
                error: true,
                message: error.message
            }));
        });
    }

    /**
    * Gets plugins based on the format of the request
    * @param {IAuthReq} req 
    * @param {express.Response} res
    * @param {Function} next 
    */
    private create(req: IAuthReq, res: express.Response, next: Function)
    {
        res.setHeader('Content-Type', 'application/json');
        var model = this.getModel("en-plugins");
        var that = this;
        var pluginToken = <IPlugin>req.body;

        // Create the new plugin
        model.createInstance<IPlugin>(pluginToken).then(function(instance)
        {
            res.end(JSON.stringify(<ModepressAddons.ICreatePlugin>{
                error: false,
                message: `Created new plugin '${pluginToken.name}'`,
                data: that.getSanitizedData(instance.schema.generateCleanData(false, instance._id), false)
            }));

        }).catch(function (error: Error)
        {
            winston.error(error.message, { process: process.pid });
            res.end(JSON.stringify(<IResponse>{
                error: true,
                message: error.message
            }));
        });
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
            res.end(JSON.stringify(<ModepressAddons.IGetPlugins>{
                error: false,
                count: count,
                message: `Found ${count} plugins`,
                data: that.getSanitizedData(instances, true)
            }));

        }).catch(function (error: Error)
        {
            winston.error(error.message, { process: process.pid });
            res.end(JSON.stringify(<IResponse>{
                error: true,
                message: error.message
            }));
        });
    }
}