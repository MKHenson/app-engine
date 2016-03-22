import * as mongodb from "mongodb";
import * as express from "express";
import * as bodyParser from "body-parser";
import {Controller, IServer, IConfig, IResponse, isAdmin, getUser, IAuthReq, isValidID} from "modepress-api";
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

        router.get("/:id?", <any>[getUser, this.getPlugins.bind(this)]);
        router.delete("/:id", <any>[isAdmin, this.remove.bind(this)]);
        router.post("/create", <any>[isAdmin, this.create.bind(this)]);
        router.put("/:id", <any>[isAdmin, this.update.bind(this)]);

        // Register the path
        e.use("/app-engine/plugins", router);
    }

    /**
    * Attempts to remove a plugin by ID
    * @param {express.Request} req 
    * @param {express.Response} res
    * @param {Function} next 
    */
    private remove(req: express.Request, res: express.Response, next: Function)
    {
        res.setHeader('Content-Type', 'application/json');
        var plugins = this.getModel("en-plugins");

        plugins.deleteInstances(<IPlugin>{ _id: new mongodb.ObjectID(req.params.id) }).then(function (numRemoved)
        {
            if (numRemoved == 0)
                return Promise.reject(new Error("Could not find a plugin with that ID"));

            res.end(JSON.stringify(<IResponse>{
                error: false,
                message: "Plugin has been successfully removed"
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

        pluginToken.author = req._user.username;

        // Create the new plugin
        model.createInstance<ModepressAddons.ICreatePlugin>(pluginToken).then(function (instance)
        {
            res.end(JSON.stringify(<ModepressAddons.ICreatePlugin>{
                error: false,
                message: `Created new plugin '${pluginToken.name}'`,
                data: instance.schema.generateCleanData(false, instance._id)
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
    private getPlugins(req: IAuthReq, res: express.Response, next: Function)
    {
        res.setHeader('Content-Type', 'application/json');
        var model = this.getModel("en-plugins");
        var that = this;
        var count = 0;

        var findToken: IPlugin = {};

        if (!req._isAdmin)
            findToken.isPublic = true;

        var getContent: boolean = true;
        if (req.query.minimal)
            getContent = false;


        if (req.params.id)
        {
            if (!isValidID(req.params.id))
                return res.end(JSON.stringify(<IResponse>{ error: true, message: "Please use a valid object ID" }));

            findToken._id = new mongodb.ObjectID(req.params.id);
        }

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