var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var express = require("express");
var bodyParser = require("body-parser");
var modepress_api_1 = require("modepress-api");
var ProjectModel_1 = require("../new-models/ProjectModel");
var PermissionController_1 = require("./PermissionController");
/**
* A controller that deals with project models
*/
var ProjectController = (function (_super) {
    __extends(ProjectController, _super);
    /**
    * Creates a new instance of the email controller
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
        router.get("/:id?", [this.getProjects.bind(this)]);
        router.post("/create", [PermissionController_1.authenticated, this.createProject.bind(this)]);
        // Register the path
        e.use("/app-engine/projects", router);
    }
    /**
    * Gets projects based on the format of the request
    * @param {express.Request} req
    * @param {express.Response} res
    * @param {Function} next
    */
    ProjectController.prototype.createProject = function (req, res, next) {
        // Check logged in + has rights to do request
        // Check if project limit was reached
        // Create a build
        // Sanitize details
        // Create a project
        // Associate build with project and vice-versa
        res.setHeader('Content-Type', 'application/json');
        var token = req.body;
        var projects = this.getModel("en-projects");
        // User is passed from the authentication function
        token.user = req._user.username;
        projects.count({ user: req._user._id }).then(function (num) {
        });
        projects.createInstance(token).then(function (instance) {
            var data = instance.schema.generateCleanData(true);
            data._id = instance._id;
            res.end(JSON.stringify({
                error: false,
                message: "Created project '" + token.name + "'",
                data: data
            }));
        }).catch(function (error) {
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
    ProjectController.prototype.getProjects = function (req, res, next) {
        res.setHeader('Content-Type', 'application/json');
        var model = this.getModel("en-projects");
        var that = this;
        var count = 0;
        var findToken = {};
        // Check for keywords
        if (req.query.search)
            findToken.name = new RegExp(req.query.search, "i");
        // First get the count
        model.count(findToken).then(function (num) {
            count = num;
            return model.findInstances(findToken, [], parseInt(req.query.index), parseInt(req.query.limit));
        }).then(function (instances) {
            var sanitizedData = that.getSanitizedData(instances, Boolean(req.query.verbose));
            res.end(JSON.stringify({
                error: false,
                count: count,
                message: "Found " + count + " projects",
                data: sanitizedData
            }));
        }).catch(function (error) {
            res.end(JSON.stringify({
                error: true,
                message: error.message
            }));
        });
    };
    return ProjectController;
})(modepress_api_1.Controller);
exports.ProjectController = ProjectController;
