var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var mongodb = require("mongodb");
var express = require("express");
var bodyParser = require("body-parser");
var modepress_api_1 = require("modepress-api");
var PermissionController_1 = require("./PermissionController");
var BuildModel_1 = require("../new-models/BuildModel");
/**
* A controller that deals with build models
*/
var BuildController = (function (_super) {
    __extends(BuildController, _super);
    /**
    * Creates a new instance of the  controller
    * @param {IServer} server The server configuration options
    * @param {IConfig} config The configuration options
    * @param {express.Express} e The express instance of this server
    */
    function BuildController(server, config, e) {
        _super.call(this, [new BuildModel_1.BuildModel()]);
        BuildController.singleton = this;
        var router = express.Router();
        var permissions = PermissionController_1.PermissionController.singleton;
        router.use(bodyParser.urlencoded({ 'extended': true }));
        router.use(bodyParser.json());
        router.use(bodyParser.json({ type: 'application/vnd.api+json' }));
        // Define the routes
        router.post("/create", [modepress_api_1.isAuthenticated, permissions.canCreateProject, this.create.bind(this)]);
        // Register the path
        e.use("/app-engine/projects", router);
    }
    /**
    * Creates a new build
    * @returns {Promise<Modepress.ModelInstance<Engine.IBuild>>}
    */
    BuildController.prototype.createBuild = function (username, project) {
        var that = this;
        var model = that.getModel("en-builds");
        return new Promise(function (resolve, reject) {
            model.createInstance({ user: username, projectId: project }).then(function (instance) {
                return instance;
            }).catch(function (err) {
                return reject(err);
            });
        });
    };
    /**
    * Removes a build by its id
    * @returns {Promise<number>}
    */
    BuildController.prototype.removeBuild = function (id) {
        var that = this;
        var model = that.getModel("en-builds");
        return new Promise(function (resolve, reject) {
            model.deleteInstances({ _id: new mongodb.ObjectID(id) }).then(function (instance) {
                return instance;
            }).catch(function (err) {
                return reject(err);
            });
        });
    };
    /**
    * Removes a build by its id
    * @returns {Promise<any>}
    */
    BuildController.prototype.linkProject = function (buildId, projId) {
        var that = this;
        var model = that.getModel("en-builds");
        return new Promise(function (resolve, reject) {
            model.update({ _id: new mongodb.ObjectID(buildId) }, { projectId: new mongodb.ObjectID(projId) }).then(function (instances) {
                if (instances.error)
                    return Promise.reject(new Error("An error has occurred while linking the build with a project"));
                return resolve();
            }).catch(function (err) {
                return reject(err);
            });
        });
    };
    /**
    * Creates a new build instance for the logged in user
    * @param {express.Request} req
    * @param {express.Response} res
    * @param {Function} next
    */
    BuildController.prototype.create = function (req, res, next) {
        var that = this;
        res.setHeader('Content-Type', 'application/json');
        var username = req._user.username;
        var model = that.getModel("en-builds");
        return new Promise(function (resolve, reject) {
            that.createBuild(username).then(function (instance) {
                return res.end(JSON.stringify({
                    error: false,
                    message: "Created new build for user '" + username + "'"
                }));
            }).catch(function (err) {
                return res.end(JSON.stringify({
                    error: true,
                    message: "Could not create build for '" + username + "' : " + err.message
                }));
            });
        });
    };
    return BuildController;
})(modepress_api_1.Controller);
exports.BuildController = BuildController;
