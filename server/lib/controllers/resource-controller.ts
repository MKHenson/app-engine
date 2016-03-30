import * as express from "express";
import {IServer, IConfig, IResponse, IAuthReq, isValidID, canEdit, Model} from "modepress-api";
import * as winston from "winston";
import * as mongodb from "mongodb";
import {EngineController} from "./engine-controller"

/**
* An abstract controller that deals with a general set of resources. This is usually sub-classed
* to a higer level controller
*/
export class ResourceController extends EngineController
{
    private _model: Model;

	/**
	* Creates a new instance of the controller
    * @param {string} restUrl The url to represent this resource
    * @param {Model} model The model to associate with this resource
	* @param {IServer} server The server configuration options
    * @param {IConfig} config The configuration options
    * @param {express.Express} e The express instance of this server
	*/
    constructor(restUrl: string, model: Model, server: IServer, config: IConfig, e: express.Express)
    {
        super([model], server, config, e );

        this._model = model;
        this.router.delete(restUrl + "/:user/:project/:ids", <any>[canEdit, this.removeResources.bind(this)]);
        this.router.put(restUrl + "/:user/:project/:id", <any>[canEdit, this.editResource.bind(this)]);
        this.router.get(restUrl + "/:user/:project/:id?", <any>[canEdit, this.getResources.bind(this)]);
        this.router.post(restUrl + "/:user/:project/", <any>[canEdit, this.create.bind(this)]);
    }

    /**
    * Creates a new resource item
    * @param {express.Request} req
    * @param {express.Response} res
    * @param {Function} next
    */
    protected create(req: IAuthReq, res: express.Response, next: Function)
    {
        res.setHeader('Content-Type', 'application/json');
        var model = this._model;
        var that = this;

        var newResource: Engine.IResource = req.body;

        // Set the user parameter
        newResource.user = req.params.user;

        // Check for the project and verify its valid
        var project = req.params.project;
        if (!isValidID(project))
            return res.end(JSON.stringify(<IResponse>{ error: true, message: "Please use a valid project ID" }));

        // Valid project
        newResource.projectId = new mongodb.ObjectID(project);

        // Save it in the DB
        model.createInstance<Engine.IResource>(newResource).then(function(instance)
        {
            return res.end(JSON.stringify(<ModepressAddons.ICreateResource<any>>{
                error: false,
                message: `New resource '${newResource.name}' created`,
                data: instance.schema.generateCleanData(false, instance._id)
            }));

        }).catch(function (err: Error)
        {
            winston.error(err.message, { process: process.pid });
            return res.end(JSON.stringify(<IResponse>{
                error: true,
                message: `An error occurred while creating the resource '${newResource.name}' : ${err.message}`
            }));
        });
    }

    /**
    * Attempts to update a single resource
    * @param {express.Request} req
    * @param {express.Response} res
    * @param {Function} next
    */
    protected editResource(req: IAuthReq, res: express.Response, next: Function)
    {
        res.setHeader('Content-Type', 'application/json');
        var model = this._model;
        var that = this;
        var project: string = req.params.project;
        var id: string = req.params.id;
        var updateToken: Engine.IResource = {};
        var token: Engine.IResource = req.body;

        // Verify the resource ID
        if (!isValidID(id))
            return res.end(JSON.stringify(<IResponse>{ error: true, message: "Please use a valid resource ID" }));

        // Verify the project ID
        if (!isValidID(project))
            return res.end(JSON.stringify(<IResponse>{ error: true, message: "Please use a valid project ID" }));

        updateToken._id = new mongodb.ObjectID(id);
        updateToken.projectId = new mongodb.ObjectID(project);
        model.update(updateToken, token).then(function (instance)
        {
            if (instance.error)
            {
                winston.error(<string>instance.tokens[0].error, { process: process.pid });
                return res.end(JSON.stringify(<IResponse>{
                    error: true,
                    message: <string>instance.tokens[0].error
                }));
            }

            res.end(JSON.stringify(<IResponse>{
                error: false,
                message: `[${instance.tokens.length}] Resources updated`
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
    * Removes a single/array of resource items
    * @param {express.Request} req
    * @param {express.Response} res
    * @param {Function} next
    */
    protected removeResources(req: IAuthReq, res: express.Response, next: Function)
    {
        res.setHeader('Content-Type', 'application/json');
        var model = this._model;
        var that = this;
        var project : string = req.params.project;
        var ids : string = req.params.ids;
        var deleteToken: Engine.IResource = {};

        // Check for the project and verify its valid
        if (!isValidID(project))
            return res.end(JSON.stringify(<IResponse>{ error: true, message: "Please use a valid project ID" }));

        // Set the user parameter
        deleteToken.user = req.params.user;

        // If ids are provided - go through and remove each one
        if (ids)
        {
            var idsArray = ids.split(",");

            if (idsArray.length > 0)
            {
                (<any>deleteToken).$or = [];

                for (var i = 0, l = idsArray.length; i < l; i++)
                    if (!isValidID(idsArray[i]))
                        return res.end(JSON.stringify(<IResponse>{ error: true, message: `ID '${idsArray[i]}' is not a valid ID` }));
                    else
                        (<any>deleteToken).$or.push(<Engine.IResource>{ _id : new mongodb.ObjectID(idsArray[i]) });
            }
        }

        // Delete the instances based onthe token
        model.deleteInstances(deleteToken).then(function (numRemoved)
        {
            res.end(JSON.stringify(<IResponse>{
                error: false,
                message: "Resources have been successfully removed"
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
    * Returns a single/array of resource items
    * @param {express.Request} req
    * @param {express.Response} res
    * @param {Function} next
    */
    protected getResources(req: IAuthReq, res: express.Response, next: Function)
    {
        res.setHeader('Content-Type', 'application/json');
        var model = this._model;
        var that = this;
        var count = 0;

        var findToken: Engine.IResource = {};
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
            return model.findInstances<Engine.IResource>(findToken, [], parseInt(req.query.index), parseInt(req.query.limit));

        }).then(function (instances)
        {
            return res.end(JSON.stringify(<ModepressAddons.IGetResources>{
                error: false,
                count: count,
                message: `Found ${count} resources`,
                data: that.getSanitizedData<Engine.IResource>(instances, !req._verbose)
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