import * as mongodb from "mongodb";
import * as express from "express";
import * as bodyParser from "body-parser";
import {Controller, IServer, IConfig, IGetAssets, IResponse} from "modepress-api";
import {AssetModel} from "../models/AssetModel";
import {IAsset} from "app-engine";

/**
* A controller that deals with asset models
*/
export default class AssetController extends Controller
{
	/**
	* Creates a new instance of the email controller
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

        router.get("/get/:id?", <any>[this.getRenders.bind(this)]);

        // Register the path
        e.use("/assets", router);
    }

    /**
    * Returns an array of IPost items
    * @param {express.Request} req 
    * @param {express.Response} res
    * @param {Function} next 
    */
    private getRenders(req: express.Request, res: express.Response, next: Function)
    {
        res.setHeader('Content-Type', 'application/json');
        var assets = this.getModel("assets");
        var that = this;
        var count = 0;

        var findToken = {};       

        // Set the default sort order to ascending
        var sortOrder = -1;
        if (req.query.sortOrder)
        {
            if ((<string>req.query.sortOrder).toLowerCase() == "asc")
                sortOrder = 1;
            else
                sortOrder = -1;
        }
        
        // Sort by the date created
        var sort: IAsset = { created_on: sortOrder };

        var getContent: boolean = true;
        if (req.query.minimal)
            getContent = false;

        // Check for keywords
        if (req.query.search)
            (<IAsset>findToken).name = <any>new RegExp(req.query.search, "i");
        
        // First get the count
        assets.count(findToken).then(function (num)
        {
            count = num;
            return assets.findInstances(findToken, [sort], parseInt(req.query.index), parseInt(req.query.limit), (getContent == false ? { html: 0 } : undefined));

        }).then(function (instances)
        {
            var sanitizedData: Array<IAsset> = that.getSanitizedData<IAsset>(instances, Boolean(req.query.verbose));
            res.end(JSON.stringify(<IGetAssets>{
                error: false,
                count: count,
                message: `Found ${count} renders`,
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