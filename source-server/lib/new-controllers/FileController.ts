import * as mongodb from "mongodb";
import * as express from "express";
import * as bodyParser from "body-parser";
import {IServer, IConfig, IResponse, isValidID, ModelInstance, EventManager, Controller, IAuthReq, canEdit} from "modepress-api";
import {UserDetailsModel} from "../new-models/UserDetailsModel";
import {ResourceController} from "./ResourceController";
import {IProject} from "engine";
import * as winston from "winston";
import {FileModel} from "../new-models/FileModel";
import * as request from "request"

/**
* A controller that deals with project models
*/
export class FileController extends Controller
{
    constructor(server: IServer, config: IConfig, e: express.Express)
    {
        super([new FileModel()]);

        var router = express.Router();
        router.use(bodyParser.urlencoded({ 'extended': true }));
        router.use(bodyParser.json());
        router.use(bodyParser.json({ type: 'application/vnd.api+json' }));

        //router.delete("/:user/:project/:ids?", <any>[canEdit, this.removeResources.bind(this)]);
        //router.put("/:user/:project/:id?", <any>[canEdit, this.editResource.bind(this)]);
        router.get("/:user/:project", <any>[canEdit, this.getByProject.bind(this)]);
        router.get("/:user", <any>[canEdit, this.getByUser.bind(this)]);
        //router.post("/:user/:project/", <any>[canEdit, this.create.bind(this)]);

        EventManager.singleton.on("FilesUploaded", this.onFilesUploaded.bind(this));
        EventManager.singleton.on("FilesRemoved", this.onFilesRemoved.bind(this));
        
        // Register the path
        e.use("/app-engine/files", router);
    }

    protected getFiles(query: any, index: number, limit: number, verbose: boolean = true ): Promise<ModepressAddons.IGetFiles>
    {
        var model = this._models[0];
        var that = this;
        var count = 0;

        return new Promise<ModepressAddons.IGetFiles>(function (resolve, reject)
        {
            // First get the count
            model.count(query).then(function (num)
            {
                count = num;
                return model.findInstances<Engine.IFile>(query, [], index, limit);

            }).then(function (instances)
            {
                resolve({
                    error: false,
                    count: count,
                    message: `Found ${count} files`,
                    data: that.getSanitizedData<Engine.IFile>(instances, verbose)
                });

            }).catch(function (error: Error)
            {
                reject(error);
            });
        });
    }

    /**
    * Gets the files from the project
    * @param {express.Request} req 
    * @param {express.Response} res
    * @param {Function} next 
    */
    protected getByProject(req: IAuthReq, res: express.Response, next: Function)
    {
        res.setHeader('Content-Type', 'application/json');
        var query: Engine.IFile = {};
        var project = req.params.project;

        if (!isValidID(project))
            return res.end(JSON.stringify(<IResponse>{ error: true, message: "Please use a valid project ID" }));
        
        query.projectId = new mongodb.ObjectID(project);
        query.user = req._user.username;

        // Check for keywords
        if (req.query.search)
            query.name = <any>new RegExp(req.query.search, "i");

        // Check for bucket ID
        if (req.query.bucket)
            query.bucketId = req.query.bucket;

        this.getFiles(query, parseInt(req.query.index), parseInt(req.query.limit)).then(function (data)
        {
            return res.end(JSON.stringify(data));

        }).catch(function (err: Error)
        {
            winston.error(err.message, { process: process.pid });
            return res.end(JSON.stringify(<IResponse>{
                error: true,
                message: `An error occurred while fetching the files : ${err.message}`
            }));
        });
    }

    /**
    * Gets the files from just the user
    * @param {express.Request} req 
    * @param {express.Response} res
    * @param {Function} next 
    */
    protected getByUser(req: IAuthReq, res: express.Response, next: Function)
    {
        res.setHeader('Content-Type', 'application/json');
        var query: Engine.IFile = { user : req._user.username };
        
        // Check for keywords
        if (req.query.search)
            query.name = <any>new RegExp(req.query.search, "i");

        // Check for bucket ID
        if (req.query.bucket)
            query.bucketId = req.query.bucket;

        this.getFiles(query, parseInt(req.query.index), parseInt(req.query.limit)).then(function (data)
        {
            return res.end(JSON.stringify(data));

        }).catch(function (err: Error)
        {
            winston.error(err.message, { process: process.pid });
            return res.end(JSON.stringify(<IResponse>{
                error: true,
                message: `An error occurred while fetching the files : ${err.message}`
            }));
        });
    }

    /**
    * Called whenever a user has uploaded files
    * @param {UsersInterface.SocketEvents.IFileEvent} event
    */
    private onFilesUploaded(event: UsersInterface.SocketEvents.IFilesAddedEvent)
    {
        var model = this._models[0];
        var tokens = event.tokens;
        var promises: Array<Promise<ModelInstance<Engine.IFile>>> = [];

        // TODO: Finish this
        for (var i = 0, l = tokens.length; i < l; i++)
            promises.push(model.createInstance<Engine.IFile>(<Engine.IFile>{
                
            }))

        // Save it in the DB
        model.createInstance<Engine.IResource>(newResource).then(function (instance)
        {
            winston.info(`[${event.tokens.length}] Files have been added`, { process: process.pid });

        }).catch(function (err: Error)
        {
            winston.error(`Could not remove file instance : ${err.message}`, { process: process.pid });
        });
    }

    /**
    * Called whenever a user has uploaded files
    * @param {UsersInterface.SocketEvents.IFileEvent} event
    */
    private onFilesRemoved(event: UsersInterface.SocketEvents.IFilesRemovedEvent)
    {
        winston.info(`[${event.files.length}] Files have been removed`, { process: process.pid });
    }
}