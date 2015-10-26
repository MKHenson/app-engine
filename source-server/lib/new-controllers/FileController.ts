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
        super("files", new FileModel(), server, config, e);
    }

    /**
    * Attempts to upload a file to the server
    * @param {express.Request} req 
    * @param {express.Response} res
    * @param {Function} next 
    */
    create(req: IAuthReq, res: express.Response, next: Function)
    {
    }
}