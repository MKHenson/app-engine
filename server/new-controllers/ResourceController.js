var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var express = require("express");
var bodyParser = require("body-parser");
var modepress_api_1 = require("modepress-api");
var winston = require("winston");
var mongodb = require("mongodb");
/**
* An abstract controller that deals with a general set of resources. This is usually sub-classed
* to a higer level controller
*/
var ResourceController = (function (_super) {
    __extends(ResourceController, _super);
    /**
    * Creates a new instance of the controller
    * @param {IServer} server The server configuration options
    * @param {IConfig} config The configuration options
    * @param {express.Express} e The express instance of this server
    */
    function ResourceController(restUrl, model, server, config, e, r) {
        _super.call(this, [model]);
        var router = r;
        if (!r) {
            router = express.Router();
            router.use(bodyParser.urlencoded({ 'extended': true }));
            router.use(bodyParser.json());
            router.use(bodyParser.json({ type: 'application/vnd.api+json' }));
            router.delete("/:user/:project/:ids?", [modepress_api_1.canEdit, this.removeResources.bind(this)]);
            router.put("/:user/:project/:id?", [modepress_api_1.canEdit, this.editResource.bind(this)]);
            router.get("/:user/:project/:id?", [modepress_api_1.canEdit, this.getResources.bind(this)]);
            router.post("/:user/:project/", [modepress_api_1.canEdit, this.create.bind(this)]);
        }
        // Register the path
        e.use(restUrl, router);
    }
    /**
    * Creates a new resource item
    * @param {express.Request} req
    * @param {express.Response} res
    * @param {Function} next
    */
    ResourceController.prototype.create = function (req, res, next) {
        res.setHeader('Content-Type', 'application/json');
        var model = this._models[0];
        var that = this;
        var newResource = req.body;
        // Set the user parameter
        newResource.user = req.params.user;
        // Check for the project and verify its valid
        var project = req.params.project;
        if (!modepress_api_1.isValidID(project))
            return res.end(JSON.stringify({ error: true, message: "Please use a valid project ID" }));
        // Valid project
        newResource.projectId = new mongodb.ObjectID(project);
        // Save it in the DB
        model.createInstance(newResource).then(function (instance) {
            return res.end(JSON.stringify({
                error: false,
                message: "New resource '" + newResource.name + "' created",
                data: instance.schema.generateCleanData(false, instance._id)
            }));
        }).catch(function (err) {
            winston.error(err.message, { process: process.pid });
            return res.end(JSON.stringify({
                error: true,
                message: "An error occurred while creating the resource '" + newResource.name + "' : " + err.message
            }));
        });
    };
    /**
    * Attempts to update a single resource
    * @param {express.Request} req
    * @param {express.Response} res
    * @param {Function} next
    */
    ResourceController.prototype.editResource = function (req, res, next) {
        res.setHeader('Content-Type', 'application/json');
        var model = this._models[0];
        var that = this;
        var project = req.params.project;
        var id = req.params.id;
        var updateToken = {};
        var token = req.body;
        // Verify the resource ID
        if (!modepress_api_1.isValidID(id))
            return res.end(JSON.stringify({ error: true, message: "Please use a valid resource ID" }));
        // Verify the project ID
        if (!modepress_api_1.isValidID(project))
            return res.end(JSON.stringify({ error: true, message: "Please use a valid project ID" }));
        updateToken._id = new mongodb.ObjectID(id);
        updateToken.projectId = new mongodb.ObjectID(project);
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
                message: "[" + instance.tokens.length + "] Resources updated"
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
    * Removes a single/array of resource items
    * @param {express.Request} req
    * @param {express.Response} res
    * @param {Function} next
    */
    ResourceController.prototype.removeResources = function (req, res, next) {
        res.setHeader('Content-Type', 'application/json');
        var model = this._models[0];
        var that = this;
        var project = req.params.project;
        var ids = req.params.ids;
        var deleteToken = {};
        // Check for the project and verify its valid
        if (!modepress_api_1.isValidID(project))
            return res.end(JSON.stringify({ error: true, message: "Please use a valid project ID" }));
        // Set the user parameter
        deleteToken.user = req.params.user;
        // If ids are provided - go through and remove each one
        if (ids) {
            var idsArray = ids.split(",");
            if (idsArray.length > 0) {
                deleteToken.$or = [];
                for (var i = 0, l = idsArray.length; i < l; i++)
                    if (!modepress_api_1.isValidID(idsArray[i]))
                        return res.end(JSON.stringify({ error: true, message: "ID '" + idsArray[i] + "' is not a valid ID" }));
                    else
                        deleteToken.$or.push(new mongodb.ObjectID(idsArray[i]));
            }
        }
        // Delete the instances based onthe token
        model.deleteInstances(deleteToken).then(function (numRemoved) {
            res.end(JSON.stringify({
                error: false,
                message: "Resources have been successfully removed"
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
    * Returns a single/array of resource items
    * @param {express.Request} req
    * @param {express.Response} res
    * @param {Function} next
    */
    ResourceController.prototype.getResources = function (req, res, next) {
        res.setHeader('Content-Type', 'application/json');
        var model = this._models[0];
        var that = this;
        var count = 0;
        var findToken = {};
        var project = req.params.project;
        var id = req.params.id;
        if (!modepress_api_1.isValidID(project))
            return res.end(JSON.stringify({ error: true, message: "Please use a valid project ID" }));
        if (id && modepress_api_1.isValidID(id))
            findToken._id = new mongodb.ObjectID(id);
        findToken.projectId = new mongodb.ObjectID(project);
        // Check for keywords
        if (req.query.search)
            findToken.name = new RegExp(req.query.search, "i");
        // First get the count
        model.count(findToken).then(function (num) {
            count = num;
            return model.findInstances(findToken, [], parseInt(req.query.index), parseInt(req.query.limit));
        }).then(function (instances) {
            return res.end(JSON.stringify({
                error: false,
                count: count,
                message: "Found " + count + " resources",
                data: that.getSanitizedData(instances, !req._verbose)
            }));
        }).catch(function (error) {
            winston.error(error.message, { process: process.pid });
            return res.end(JSON.stringify({
                error: true,
                message: error.message
            }));
        });
    };
    return ResourceController;
})(modepress_api_1.Controller);
exports.ResourceController = ResourceController;
