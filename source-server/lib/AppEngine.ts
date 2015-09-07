import * as mongodb from "mongodb";
import * as express from "express";
import {Controller, IServer, IConfig} from "modepress-api";
import {ProjectController} from "./new-controllers/ProjectController";
import {PluginController} from "./new-controllers/PluginController";
import {AssetController} from "./new-controllers/AssetController";
import {UserDetailsController} from "./new-controllers/UserDetailsController";
import {PermissionController} from "./new-controllers/PermissionController";
import {BuildController} from "./new-controllers/BuildController";

/**
* A plugin that loads the app engine controllers for use in Modepress
*/
export default class AppEngine extends Controller
{
    private _controllers: Array<Controller>;

	/**
	* Creates a new instance of the email controller
	* @param {IServer} server The server configuration options
    * @param {IConfig} config The configuration options
    * @param {express.Express} e The express instance of this server	
	*/
    constructor(server: IServer, config: IConfig, e: express.Express)
    {
        super(null);

        this._controllers = [
            new UserDetailsController(server, config, e),
            new PluginController(server, config, e),
            new AssetController(server, config, e),
            new ProjectController(server, config, e),
            new PermissionController(server, config, e),
            new BuildController(server, config, e)
        ];
    }

    /**
    * Called to initialize this controller and its related database objects
    * @param {mongodb.Db} db The mongo database to use
    * @returns {Promise<Controller>}
    */
    initialize(db: mongodb.Db): Promise<Controller>
    {
        var promises: Array<Promise<Controller>> = [];
        var that = this;

        for (var i = 0, ctrls = this._controllers, l = ctrls.length; i < l; i++)
            promises.push(ctrls[i].initialize(db));

        return new Promise<Controller>(function (resolve, reject)
        {
            Promise.all(promises).then(function ()
            {
                resolve(that);

            }).catch(function (err)
            {
                resolve(err);
            });
        }) 
    }

}