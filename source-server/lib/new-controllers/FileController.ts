import * as mongodb from "mongodb";
import * as express from "express";
import * as bodyParser from "body-parser";
import {IServer, IConfig, IResponse, EventManager, UserEvent, IAuthReq, isAdmin, canEdit, isAuthenticated, getUser, UsersService} from "modepress-api";
import {UserDetailsModel} from "../new-models/UserDetailsModel";
import {IProject} from "engine";
import {ResourceController} from "./ResourceController";
import * as winston from "winston";
import {FileModel} from "../new-models/FileModel";
import * as request from "request"

/**
* A controller that deals with project models
*/
export class FileController extends ResourceController
{
    constructor(server: IServer, config: IConfig, e: express.Express)
    {
        var r = express.Router();
        r.use(bodyParser.urlencoded({ 'extended': true }));
        r.use(bodyParser.json());
        r.use(bodyParser.json({ type: 'application/vnd.api+json' }));

        r.delete("/:user/:project/:ids?", <any>[canEdit, this.removeResources.bind(this)]);
        r.put("/:user/:project/:id?", <any>[canEdit, this.editResource.bind(this)]);
        r.get("/:user/:project/:id?", <any>[canEdit, this.getResources.bind(this)]);
        r.post("/:user/:project/:bucket", <any>[canEdit, this.create.bind(this)]);

        super("files", new FileModel(), server, config, e, r);
    }

    /**
    * Attempts to upload a file to the server
    * @param {express.Request} req 
    * @param {express.Response} res
    * @param {Function} next 
    */
    create(req: IAuthReq, res: express.Response, next: Function)
    {
        var that = this;
        var thatFunc = super.create;
        var bucket = req.params.bucket;
        Modepress.UsersService.getSingleton().uploadFile(bucket, req).then(function (data)
        {
            if (data.error)
            {
                winston.error(data.message, { process: process.pid });
                return res.end(JSON.stringify(<IResponse>{
                    error: true,
                    message: `Could not upload files' : ${data.message}`
                }));
            }
            
            thatFunc(req, res, next);

        }).catch(function (err: Error)
        {
            winston.error(err.message, { process: process.pid });
            return res.end(JSON.stringify(<IResponse>{
                error: true,
                message: `Could not upload files : '${err.message}'`
            }));
        });
    }
}