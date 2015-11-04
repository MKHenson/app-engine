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
        router.put("/:user/:id", <any>[canEdit, this.editFileDetails.bind(this)]);
        router.get("/:user/:project", <any>[canEdit, this.getByProject.bind(this)]);
        router.get("/:user", <any>[canEdit, this.getByUser.bind(this)]);
        //router.post("/:user/:project/", <any>[canEdit, this.create.bind(this)]);

        EventManager.singleton.on("FilesUploaded", this.onFilesUploaded.bind(this));
        EventManager.singleton.on("FilesRemoved", this.onFilesRemoved.bind(this));
        
        // Register the path
        e.use("/app-engine/files", router);
    }

    /**
    * Attempts to update a single file's details
    * @param {express.Request} req 
    * @param {express.Response} res
    * @param {Function} next 
    */
    protected editFileDetails(req: IAuthReq, res: express.Response, next: Function)
    {
        res.setHeader('Content-Type', 'application/json');
        var model = this._models[0];
        var that = this;
        
        // Verify the resource ID
        if (!isValidID(req.params.id))
            return res.end(JSON.stringify(<IResponse>{ error: true, message: "Please use a valid resource ID" }));

        var searchToken: Engine.IFile = { _id: new mongodb.ObjectID(req.params.id) };
        var token: Engine.IResource = req.body;
        
        model.update(searchToken, token).then(function (instance)
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
                message: `[${instance.tokens.length}] Files updated`
            }));

        }).catch(function (error: Error)
        {
            winston.error("Could not update file details: " + error.message, { process: process.pid });
            res.end(JSON.stringify(<IResponse>{ error: true, message: "Could not update file details: " + error.message }));
        });
    }

    /**
    * Fetches files by a given query
    * @param {any} query A mongo DB style query
    * @param {number} index The index start
    * @param {number} limit The limit
    * @param {number} verbose Weather or not to use verbose 
    */
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
        var files = event.files;
        var promises: Array<Promise<ModelInstance<Engine.IFile>>> = [];

        // Add an IFile reference for each file thats added
        for (var i = 0, l = files.length; i < l; i++)
            promises.push(model.createInstance<Engine.IFile>(<Engine.IFile>{
                bucketId: files[i].bucketId,
                user: files[i].user,
                url: files[i].publicURL,
                extension: files[i].name.split(".").pop(),
                name: files[i].name,
                identifier: files[i].identifier,
                size: files[i].size
            }))

        // Save it in the DB
        Promise.all(promises).then(function(instances)
        {
            winston.info(`[${instances.length}] Files have been added`, { process: process.pid });

        }).catch(function (err: Error)
        {
            winston.error(`Could not add file instances : ${err.message}`, { process: process.pid });
        });
    }

    /**
    * Called whenever a user has uploaded files
    * @param {UsersInterface.SocketEvents.IFileEvent} event
    */
    private onFilesRemoved(event: UsersInterface.SocketEvents.IFilesRemovedEvent)
    {
        var model = this._models[0];

        // Add an IFile reference for each file thats added
        var removeQuery = [];
        for (var i = 0, l = event.files.length; i < l; i++)
            removeQuery.push(<Engine.IFile>{ identifier : event.files[i] });
        
        // Save it in the DB
        model.deleteInstances({ $or: removeQuery }).then(function (numRemoved: number)
        {
            winston.info(`[${numRemoved}] Files have been removed`, { process: process.pid });

        }).catch(function (err: Error)
        {
            winston.error(`Could not remove file instances : ${err.message}`, { process: process.pid });
        });
    }
}