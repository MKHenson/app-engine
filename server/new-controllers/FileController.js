var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var mongodb = require("mongodb");
var express = require("express");
var bodyParser = require("body-parser");
var modepress_api_1 = require("modepress-api");
var winston = require("winston");
var FileModel_1 = require("../new-models/FileModel");
/**
* A controller that deals with project models
*/
var FileController = (function (_super) {
    __extends(FileController, _super);
    function FileController(server, config, e) {
        _super.call(this, [new FileModel_1.FileModel()]);
        var router = express.Router();
        router.use(bodyParser.urlencoded({ 'extended': true }));
        router.use(bodyParser.json());
        router.use(bodyParser.json({ type: 'application/vnd.api+json' }));
        //router.delete("/:user/:project/:ids?", <any>[canEdit, this.removeResources.bind(this)]);
        router.put("/:user/:id", [modepress_api_1.canEdit, this.editFileDetails.bind(this)]);
        router.get("/:user/:project", [modepress_api_1.canEdit, this.getByProject.bind(this)]);
        router.get("/:user", [modepress_api_1.canEdit, this.getByUser.bind(this)]);
        //router.post("/:user/:project/", <any>[canEdit, this.create.bind(this)]);
        modepress_api_1.EventManager.singleton.on("FilesUploaded", this.onFilesUploaded.bind(this));
        modepress_api_1.EventManager.singleton.on("FilesRemoved", this.onFilesRemoved.bind(this));
        // Register the path
        e.use("/app-engine/files", router);
    }
    /**
    * Attempts to update a single file's details
    * @param {express.Request} req
    * @param {express.Response} res
    * @param {Function} next
    */
    FileController.prototype.editFileDetails = function (req, res, next) {
        res.setHeader('Content-Type', 'application/json');
        var model = this._models[0];
        var that = this;
        // Verify the resource ID
        if (!modepress_api_1.isValidID(req.params.id))
            return res.end(JSON.stringify({ error: true, message: "Please use a valid resource ID" }));
        var searchToken = { _id: new mongodb.ObjectID(req.params.id) };
        var token = req.body;
        model.update(searchToken, token).then(function (instance) {
            if (instance.error) {
                winston.error(instance.tokens[0].error, { process: process.pid });
                return res.end(JSON.stringify({
                    error: true,
                    message: instance.tokens[0].error
                }));
            }
            res.end(JSON.stringify({
                error: false,
                message: "[" + instance.tokens.length + "] Files updated"
            }));
        }).catch(function (error) {
            winston.error("Could not update file details: " + error.message, { process: process.pid });
            res.end(JSON.stringify({ error: true, message: "Could not update file details: " + error.message }));
        });
    };
    /**
    * Fetches files by a given query
    * @param {any} query A mongo DB style query
    * @param {number} index The index start
    * @param {number} limit The limit
    * @param {number} verbose Weather or not to use verbose
    */
    FileController.prototype.getFiles = function (query, index, limit, verbose) {
        if (verbose === void 0) { verbose = true; }
        var model = this._models[0];
        var that = this;
        var count = 0;
        return new Promise(function (resolve, reject) {
            // First get the count
            model.count(query).then(function (num) {
                count = num;
                return model.findInstances(query, [], index, limit);
            }).then(function (instances) {
                resolve({
                    error: false,
                    count: count,
                    message: "Found " + count + " files",
                    data: that.getSanitizedData(instances, verbose)
                });
            }).catch(function (error) {
                reject(error);
            });
        });
    };
    /**
    * Checks for and adds any optional file queries
    * @param {Engine.IFile} query
    * @param {any} params
    */
    FileController.prototype.appendOptionalQueries = function (query, params) {
        // Check for keywords
        if (params.search) {
            query.name = new RegExp(params.search, "i");
            query.tags = { $in: [new RegExp(params.search, "i")] };
        }
        // Check for favourites
        if (params.favourite && params.favourite.toLowerCase() == "true")
            query.favourite = true;
        // Check for bucket ID
        if (params.bucket)
            query.bucketId = params.bucket;
    };
    /**
    * Gets the files from the project
    * @param {express.Request} req
    * @param {express.Response} res
    * @param {Function} next
    */
    FileController.prototype.getByProject = function (req, res, next) {
        res.setHeader('Content-Type', 'application/json');
        var project = req.params.project;
        if (!modepress_api_1.isValidID(project))
            return res.end(JSON.stringify({ error: true, message: "Please use a valid project ID" }));
        // Create the query
        var query = { projectId: new mongodb.ObjectID(project), user: req._user.username };
        this.appendOptionalQueries(query, req.query);
        this.getFiles(query, parseInt(req.query.index), parseInt(req.query.limit)).then(function (data) {
            return res.end(JSON.stringify(data));
        }).catch(function (err) {
            winston.error(err.message, { process: process.pid });
            return res.end(JSON.stringify({
                error: true,
                message: "An error occurred while fetching the files : " + err.message
            }));
        });
    };
    /**
    * Gets the files from just the user
    * @param {express.Request} req
    * @param {express.Response} res
    * @param {Function} next
    */
    FileController.prototype.getByUser = function (req, res, next) {
        res.setHeader('Content-Type', 'application/json');
        // Create the query
        var query = { user: req._user.username };
        this.appendOptionalQueries(query, req.query);
        this.getFiles(query, parseInt(req.query.index), parseInt(req.query.limit)).then(function (data) {
            return res.end(JSON.stringify(data));
        }).catch(function (err) {
            winston.error(err.message, { process: process.pid });
            return res.end(JSON.stringify({
                error: true,
                message: "An error occurred while fetching the files : " + err.message
            }));
        });
    };
    /**
    * Called whenever a user has uploaded files
    * @param {UsersInterface.SocketEvents.IFileEvent} event
    */
    FileController.prototype.onFilesUploaded = function (event) {
        var model = this._models[0];
        var files = event.files;
        var promises = [];
        // Add an IFile reference for each file thats added
        for (var i = 0, l = files.length; i < l; i++)
            promises.push(model.createInstance({
                bucketId: files[i].bucketId,
                user: files[i].user,
                url: files[i].publicURL,
                extension: files[i].name.split(".").pop(),
                name: files[i].name,
                identifier: files[i].identifier,
                size: files[i].size
            }));
        // Save it in the DB
        Promise.all(promises).then(function (instances) {
            winston.info("[" + instances.length + "] Files have been added", { process: process.pid });
        }).catch(function (err) {
            winston.error("Could not add file instances : " + err.message, { process: process.pid });
        });
    };
    /**
    * Called whenever a user has uploaded files
    * @param {UsersInterface.SocketEvents.IFileEvent} event
    */
    FileController.prototype.onFilesRemoved = function (event) {
        var model = this._models[0];
        // Add an IFile reference for each file thats added
        var removeQuery = [];
        for (var i = 0, l = event.files.length; i < l; i++)
            removeQuery.push({ identifier: event.files[i] });
        // Save it in the DB
        model.deleteInstances({ $or: removeQuery }).then(function (numRemoved) {
            winston.info("[" + numRemoved + "] Files have been removed", { process: process.pid });
        }).catch(function (err) {
            winston.error("Could not remove file instances : " + err.message, { process: process.pid });
        });
    };
    return FileController;
})(modepress_api_1.Controller);
exports.FileController = FileController;
