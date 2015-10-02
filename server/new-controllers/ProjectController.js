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
var BuildController_1 = require("./BuildController");
var ProjectModel_1 = require("../new-models/ProjectModel");
var winston = require("winston");
/**
* A controller that deals with project models
*/
var ProjectController = (function (_super) {
    __extends(ProjectController, _super);
    /**
    * Creates a new instance of the controller
    * @param {IServer} server The server configuration options
    * @param {IConfig} config The configuration options
    * @param {express.Express} e The express instance of this server
    */
    function ProjectController(server, config, e) {
        _super.call(this, [new ProjectModel_1.ProjectModel()]);
        var router = express.Router();
        router.use(bodyParser.urlencoded({ 'extended': true }));
        router.use(bodyParser.json());
        router.use(bodyParser.json({ type: 'application/vnd.api+json' }));
        router.get("/:user/:id?", [modepress_api_1.getUser, this.getProjects.bind(this)]);
        router.put("/:user/:id", [modepress_api_1.canEdit, this.updateProject.bind(this)]);
        router.delete("/:user/:ids", [modepress_api_1.canEdit, this.remove.bind(this)]);
        router.post("/create", [modepress_api_1.isAuthenticated, this.createProject.bind(this)]);
        // Register the path
        e.use("/app-engine/projects", router);
        modepress_api_1.EventManager.singleton.on("Removed", this.onUserRemoved.bind(this));
    }
    /**
    * Called whenever a user has had their account removed
    * @param {UserEvent} event
    */
    ProjectController.prototype.onUserRemoved = function (event) {
        this.removeByUser(event.username);
    };
    /**
    * Removes projects by a given query
    * @param {any} selector
    * @returns {Promise<IRemoveResponse>}
    */
    ProjectController.prototype.removeByQuery = function (selector) {
        var toRet = { error: false, message: "0 items have been removed", itemsRemoved: [] };
        var model = this.getModel("en-projects");
        var buildCtrl = BuildController_1.BuildController.singleton;
        var numRemoved = 0;
        return new Promise(function (resolve, reject) {
            model.findInstances(selector).then(function (instances) {
                if (instances.length == 0)
                    return resolve(toRet);
                instances.forEach(function (val, index) {
                    buildCtrl.removeByProject(val._id, val.dbEntry.user).then(function (numDeleted) {
                        return model.deleteInstances({ _id: val._id });
                    }).then(function (numDeleted) {
                        numRemoved++;
                        toRet.itemsRemoved.push({ id: val._id, error: false, errorMsg: "" });
                        if (index == instances.length - 1) {
                            toRet.message = numRemoved + " items have been removed";
                            return resolve(toRet);
                        }
                    }).catch(function (err) {
                        toRet.itemsRemoved.push({ id: val._id, error: true, errorMsg: err.message });
                        toRet.error = true;
                        toRet.message = "An error occurred when deleting project " + val._id;
                        winston.error(toRet.message + " : " + err.message, { process: process.pid });
                    });
                });
            }).catch(function (err) {
                toRet.error = true;
                toRet.message = "An error occurred when deleting projects by query : " + err.message;
                winston.error(toRet.message, { process: process.pid });
                return resolve(toRet);
            });
        });
    };
    /**
    * Removes a project by user
    * @param {string} user
    * @returns {Promise<IRemoveResponse>}
    */
    ProjectController.prototype.removeByUser = function (user) {
        return this.removeByQuery({ user: user });
    };
    /**
    * Removes a project by its id
    * @param {Array<string>} ids
    * @returns {Promise<IRemoveResponse>}
    */
    ProjectController.prototype.removeByIds = function (ids, user) {
        var findToken = { user: user };
        var $or = [];
        for (var i = 0, l = ids.length; i < l; i++)
            $or.push({ _id: new mongodb.ObjectID(ids[i]) });
        if ($or.length > 0)
            findToken["$or"] = $or;
        return this.removeByQuery(findToken);
    };
    /**
    * Attempts to update a project
    * @param {express.Request} req
    * @param {express.Response} res
    * @param {Function} next
    */
    ProjectController.prototype.updateProject = function (req, res, next) {
        res.setHeader('Content-Type', 'application/json');
        var model = this.getModel("en-projects");
        var that = this;
        var project = req.params.id;
        var updateToken = {};
        var token = req.body;
        // Verify the project ID
        if (!modepress_api_1.isValidID(project))
            return res.end(JSON.stringify({ error: true, message: "Please use a valid project ID" }));
        updateToken._id = new mongodb.ObjectID(project);
        updateToken.user = req._user.username;
        model.update(updateToken, token).then(function (instance) {
            if (instance.error) {
                winston.error(instance.tokens[0].error, { process: process.pid });
                return res.end(JSON.stringify({
                    error: true,
                    message: instance.tokens[0].error
                }));
            }
            res.end(JSON.stringify({
                error: false,
                message: "[" + instance.tokens.length + "] Projects updated"
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
    * Removes all projects by ID
    * @param {express.Request} req
    * @param {express.Response} res
    * @param {Function} next
    */
    ProjectController.prototype.remove = function (req, res, next) {
        res.setHeader('Content-Type', 'application/json');
        var that = this;
        var target = req.params.user;
        var projectIds = req.params.ids.split(",");
        for (var i = 0, l = projectIds.length; i < l; i++)
            if (!modepress_api_1.isValidID(projectIds[i]))
                return res.end(JSON.stringify({ error: true, message: "Please use a valid object id" }));
        that.removeByIds(projectIds, target).then(function (response) {
            res.end(JSON.stringify(response));
        }).catch(function (error) {
            winston.error(error.message, { process: process.pid });
            res.end(JSON.stringify({
                error: true,
                message: error.message
            }));
        });
    };
    /**
    * Gets projects based on the format of the request
    * @param {express.Request} req
    * @param {express.Response} res
    * @param {Function} next
    */
    ProjectController.prototype.createProject = function (req, res, next) {
        // ✔ Check logged in + has rights to do request
        // ✔ Create a build 
        // ✔ Sanitize details 
        // ✔ Create a project
        // ✔ Associate build with project and vice-versa
        // ✔ Check if project limit was reached - if over then remove project
        res.setHeader('Content-Type', 'application/json');
        var token = req.body;
        var projects = this.getModel("en-projects");
        var buildCtrl = BuildController_1.BuildController.singleton;
        var newBuild;
        var newProject;
        var that = this;
        // User is passed from the authentication function
        token.user = req._user.username;
        // Create build
        buildCtrl.createBuild(req._user.username).then(function (build) {
            newBuild = build;
            token.build = newBuild._id;
            return projects.createInstance(token);
        }).then(function (project) {
            newProject = project;
            // Link build with new project
            return buildCtrl.linkProject(newBuild._id, newProject._id);
        }).then(function () {
            // Make sure we're still in the limit
            PermissionController_1.PermissionController.singleton.projectsWithinLimits(req._user).then(function () {
                // Finished
                res.end(JSON.stringify({
                    error: false,
                    message: "Created project '" + token.name + "'",
                    data: newProject.schema.generateCleanData(false, newProject._id)
                }));
            }).catch(function (err) {
                // Not in the limit - so remove the project and tell the user to upgrade 
                that.removeByIds([newProject._id], req._user.username);
                res.end(JSON.stringify({ error: true, message: err.message }));
            });
        }).catch(function (err) {
            winston.error(err.message, { process: process.pid });
            // Make sure any builds were removed if an error occurred
            if (newBuild) {
                buildCtrl.removeByIds([newBuild._id.toString()], req._user.username).then(function () {
                    res.end(JSON.stringify({ error: true, message: err.message }));
                }).catch(function (err) {
                    winston.error(err.message, { process: process.pid });
                    res.end(JSON.stringify({ error: true, message: err.message }));
                });
            }
            else
                res.end(JSON.stringify({ error: true, message: err.message }));
        });
    };
    /**
    * Gets projects based on the format of the request. You can optionally pass a 'search', 'index' and 'limit' query parameter.
    * @param {IAuthReq} req
    * @param {express.Response} res
    * @param {Function} next
    */
    ProjectController.prototype.getProjects = function (req, res, next) {
        res.setHeader('Content-Type', 'application/json');
        var model = this.getModel("en-projects");
        var that = this;
        var count = 0;
        var findToken = {};
        findToken.user = req.params.user;
        // Check for valid ID
        if (req.params.id)
            if (modepress_api_1.isValidID(req.params.id))
                findToken._id = new mongodb.ObjectID(req.params.id);
            else
                return res.end(JSON.stringify({ error: true, message: "Please use a valid object id" }));
        // Check for keywords
        if (req.query.search)
            findToken.name = new RegExp(req.query.search, "i");
        // First get the count
        model.count(findToken).then(function (num) {
            count = num;
            return model.findInstances(findToken, [], parseInt(req.query.index), parseInt(req.query.limit));
        }).then(function (instances) {
            res.end(JSON.stringify({
                error: false,
                count: count,
                message: "Found " + count + " projects",
                data: that.getSanitizedData(instances, req._verbose)
            }));
        }).catch(function (error) {
            winston.error(error.message, { process: process.pid });
            res.end(JSON.stringify({
                error: true,
                message: error.message
            }));
        });
    };
    return ProjectController;
})(modepress_api_1.Controller);
exports.ProjectController = ProjectController;
