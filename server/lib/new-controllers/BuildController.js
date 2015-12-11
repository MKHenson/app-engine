var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var mongodb = require("mongodb");
var express = require("express");
var bodyParser = require("body-parser");
var modepress_api_1 = require("modepress-api");
var BuildModel_1 = require("../new-models/BuildModel");
var winston = require("winston");
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
        router.use(bodyParser.urlencoded({ 'extended': true }));
        router.use(bodyParser.json());
        router.use(bodyParser.json({ type: 'application/vnd.api+json' }));
        // Define the routes
        router.get("/:user/:project/:id?", [modepress_api_1.canEdit, this.getBuilds.bind(this)]);
        router.post("/:user/:project", [modepress_api_1.canEdit, this.create.bind(this)]);
        router.put("/:user/:project/:id", [modepress_api_1.canEdit, this.edit.bind(this)]);
        // Register the path
        e.use("/app-engine/builds", router);
    }
    /**
    * Gets all builds associated with a particular user & project
    * @param {express.Request} req
    * @param {express.Response} res
    * @param {Function} next
    */
    BuildController.prototype.getBuilds = function (req, res, next) {
        var that = this;
        res.setHeader('Content-Type', 'application/json');
        var target = req.params.user;
        var project = req.params.project;
        var model = that.getModel("en-builds");
        var totalMatches = 0;
        if (!modepress_api_1.isValidID(project))
            return res.end(JSON.stringify({ error: true, message: "Please use a valid project ID" }));
        var findToken = { user: target, projectId: new mongodb.ObjectID(project) };
        if (req.params.id && modepress_api_1.isValidID(req.params.id))
            findToken._id = new mongodb.ObjectID(req.params.id);
        model.count(findToken).then(function (total) {
            totalMatches = total;
            return model.findInstances(findToken, [], parseInt(req.query.index), parseInt(req.query.limit));
        }).then(function (instances) {
            return res.end(JSON.stringify({
                error: false,
                message: "Found [" + totalMatches + "] builds for user '" + target + "'",
                count: totalMatches,
                data: that.getSanitizedData(instances, !req._verbose)
            }));
        }).catch(function (err) {
            winston.error(err.message, { process: process.pid });
            return res.end(JSON.stringify({
                error: true,
                message: "Could not get builds for '" + target + "' : " + err.message
            }));
        });
    };
    /**
    * Creates a new build
    * @returns {Promise<Modepress.ModelInstance<Engine.IBuild>>}
    */
    BuildController.prototype.createBuild = function (username, project) {
        var that = this;
        var model = that.getModel("en-builds");
        return new Promise(function (resolve, reject) {
            model.createInstance({ user: username, projectId: project }).then(function (instance) {
                return resolve(instance);
            }).catch(function (err) {
                winston.error(err.message, { process: process.pid });
                return reject(err);
            });
        });
    };
    /**
    * Removes a build by its id
    * @param {Array<string>} ids
    * @param {string} user The username of the user
    * @returns {Promise<number>}
    */
    BuildController.prototype.removeByIds = function (ids, user) {
        var that = this;
        var model = that.getModel("en-builds");
        var findToken = { user: user };
        var $or = [];
        for (var i = 0, l = ids.length; i < l; i++)
            $or.push({ _id: new mongodb.ObjectID(ids[i]) });
        if ($or.length > 0)
            findToken["$or"] = $or;
        return new Promise(function (resolve, reject) {
            model.deleteInstances(findToken).then(function (numDeleted) {
                return resolve(numDeleted);
            }).catch(function (err) {
                winston.error(err.message, { process: process.pid });
                return reject(err);
            });
        });
    };
    /**
    * Removes a build by its user
    * @param {string} user The username of the user
    * @returns {Promise<number>}
    */
    BuildController.prototype.removeByUser = function (user) {
        var that = this;
        var model = that.getModel("en-builds");
        return new Promise(function (resolve, reject) {
            model.deleteInstances({ user: user }).then(function (instance) {
                return resolve(instance);
            }).catch(function (err) {
                winston.error(err.message, { process: process.pid });
                return reject(err);
            });
        });
    };
    /**
    * Removes a build by its project ID
    * @param {ObjectID} project The id of the project
    * @param {string} user The username of the user
    * @returns {Promise<number>}
    */
    BuildController.prototype.removeByProject = function (project, user) {
        var that = this;
        var model = that.getModel("en-builds");
        return new Promise(function (resolve, reject) {
            model.deleteInstances({ projectId: project, user: user }).then(function (instance) {
                return resolve(instance);
            }).catch(function (err) {
                winston.error(err.message, { process: process.pid });
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
                winston.error(err.message, { process: process.pid });
                return reject(err);
            });
        });
    };
    /**
    * Attempts to update a build's data
    * @param {express.Request} req
    * @param {express.Response} res
    * @param {Function} next
    */
    BuildController.prototype.edit = function (req, res, next) {
        res.setHeader('Content-Type', 'application/json');
        var that = this;
        var model = that.getModel("en-builds");
        var project = req.params.project;
        var id = req.params.id;
        var search = {};
        var token = req.body;
        // Verify the resource ID
        if (!modepress_api_1.isValidID(id))
            return res.end(JSON.stringify({ error: true, message: "Please use a valid resource ID" }));
        // Verify the project ID
        if (!modepress_api_1.isValidID(project))
            return res.end(JSON.stringify({ error: true, message: "Please use a valid project ID" }));
        search._id = new mongodb.ObjectID(id);
        search.projectId = new mongodb.ObjectID(project);
        model.update(search, token).then(function (instance) {
            if (instance.error) {
                winston.error(instance.tokens[0].error, { process: process.pid });
                return res.end(JSON.stringify({
                    error: true,
                    message: instance.tokens[0].error
                }));
            }
            res.end(JSON.stringify({
                error: false,
                message: "[" + instance.tokens.length + "] Build updated"
            }));
        }).catch(function (error) {
            winston.error(error.message, { process: process.pid });
            res.end(JSON.stringify({
                error: true,
                message: error.message
            }));
        });
    };
    /**
    * Creates a new build for a user in a specific project.
    * @param {express.Request} req
    * @param {express.Response} res
    * @param {Function} next
    */
    BuildController.prototype.create = function (req, res, next) {
        var that = this;
        res.setHeader('Content-Type', 'application/json');
        var target = req.params.user;
        var project = req.params.project;
        var model = that.getModel("en-builds");
        var setAsCurrent = (req.query["set-current"] ? true : false);
        if (!modepress_api_1.isValidID(project))
            return res.end(JSON.stringify({ error: true, message: "Please use a valid project ID" }));
        var newBuild;
        that.createBuild(target, new mongodb.ObjectID(project)).then(function (instance) {
            newBuild = instance;
            if (setAsCurrent)
                return that.getModel("en-projects").update({ _id: new mongodb.ObjectID(project) }, { build: instance._id });
            else
                return Promise.resolve();
        }).then(function (updateToken) {
            if (updateToken.error)
                return Promise.reject(new Error(updateToken.tokens[0].error.toString()));
            return res.end(JSON.stringify({
                error: false,
                message: "Created new build for user '" + target + "'",
                count: 1,
                data: that.getSanitizedData([newBuild], true)
            }));
        }).catch(function (err) {
            winston.error(err.message, { process: process.pid });
            return res.end(JSON.stringify({
                error: true,
                message: "Could not create build for '" + target + "' : " + err.message
            }));
        });
    };
    return BuildController;
})(modepress_api_1.Controller);
exports.BuildController = BuildController;
