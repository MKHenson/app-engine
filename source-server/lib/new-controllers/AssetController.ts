import * as express from "express";
import * as bodyParser from "body-parser";
import {Controller, IServer, IConfig, IResponse, IAuthReq, isValidID, canEdit} from "modepress-api";
import {AssetModel} from "../new-models/AssetModel";
import {IAsset} from "engine";
import * as winston from "winston";
import * as mongodb from "mongodb";

/**
* A controller that deals with asset models
*/
export class AssetController extends Controller
{
	/**
	* Creates a new instance of the controller
	* @param {IServer} server The server configuration options
    * @param {IConfig} config The configuration options
    * @param {express.Express} e The express instance of this server	
	*/
    constructor(server: IServer, config: IConfig, e: express.Express)
    {
        super([new AssetModel()]);

        var router = express.Router();
        router.use(bodyParser.urlencoded({ 'extended': true }));
        router.use(bodyParser.json());
        router.use(bodyParser.json({ type: 'application/vnd.api+json' }));

        router.get("/get/:user/:project/:id?", <any>[canEdit, this.getAssets.bind(this)]);
        router.post("/create/:user/:project/", <any>[canEdit, this.createAsset.bind(this)]);

        // Register the path
        e.use("/app-engine/assets", router);
    }

    /**
    * Returns an array of IAsset items
    * @param {express.Request} req 
    * @param {express.Response} res
    * @param {Function} next 
    */
    private createAsset(req: IAuthReq, res: express.Response, next: Function)
    {
        res.setHeader('Content-Type', 'application/json');
        var model = this.getModel("en-assets");
        var that = this;

        var newAsset: Engine.IAsset = req.body;
        newAsset.user = req.params.user;

        var project = req.params.project;
        if (!isValidID(project))
            return res.end(JSON.stringify(<IResponse>{ error: true, message: "Please use a valid project ID" }));

        newAsset.projectId = new mongodb.ObjectID(project);

        model.createInstance<Engine.IAsset>(newAsset).then(function (instance)
        {
            return res.end(JSON.stringify(<ModepressAddons.ICreateAsset>{
                error: true,
                message: `New asset created`,
                data: instance.schema.generateCleanData(false, instance._id)
            }));

        }).catch(function (err: Error)
        {
            winston.error(err.message, { process: process.pid });
            return res.end(JSON.stringify(<IResponse>{
                error: true,
                message: `An error occurred while creating the asset : ${err.message}`
            }));
        });
    }

    /**
    * Returns an array of IAsset items
    * @param {express.Request} req 
    * @param {express.Response} res
    * @param {Function} next 
    */
    private getAssets(req: IAuthReq, res: express.Response, next: Function)
    {
        res.setHeader('Content-Type', 'application/json');
        var model = this.getModel("en-assets");
        var that = this;
        var count = 0;

        var findToken: Engine.IAsset = {};
        var project = req.params.project;
        var id = req.params.id;

        if (!isValidID(project))
            return res.end(JSON.stringify(<IResponse>{ error: true, message: "Please use a valid project ID" }));

        if (id && isValidID(id))
            findToken._id = new mongodb.ObjectID(id);

        findToken.projectId = new mongodb.ObjectID(project);
        
        // Check for keywords
        if (req.query.search)
            findToken.name = <any>new RegExp(req.query.search, "i");
        
        // First get the count
        model.count(findToken).then(function (num)
        {
            count = num;
            return model.findInstances<IAsset>(findToken, [], parseInt(req.query.index), parseInt(req.query.limit));

        }).then(function (instances)
        {
            return res.end(JSON.stringify(<ModepressAddons.IGetAssets>{
                error: false,
                count: count,
                message: `Found ${count} assets`,
                data: that.getSanitizedData<IAsset>(instances, !req._verbose)
            }));

        }).catch(function (error: Error)
        {
            winston.error(error.message, { process: process.pid });
            return res.end(JSON.stringify(<IResponse>{
                error: true,
                message: error.message
            }));
        });
    }
}