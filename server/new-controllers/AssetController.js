var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var express = require("express");
var bodyParser = require("body-parser");
var modepress_api_1 = require("modepress-api");
var AssetModel_1 = require("../new-models/AssetModel");
var winston = require("winston");
var mongodb = require("mongodb");
/**
* A controller that deals with asset models
*/
var AssetController = (function (_super) {
    __extends(AssetController, _super);
    /**
    * Creates a new instance of the controller
    * @param {IServer} server The server configuration options
    * @param {IConfig} config The configuration options
    * @param {express.Express} e The express instance of this server
    */
    function AssetController(server, config, e) {
        _super.call(this, [new AssetModel_1.AssetModel()]);
        var router = express.Router();
        router.use(bodyParser.urlencoded({ 'extended': true }));
        router.use(bodyParser.json());
        router.use(bodyParser.json({ type: 'application/vnd.api+json' }));
        router.get("/get/:user/:project/:id?", [modepress_api_1.canEdit, this.getAssets.bind(this)]);
        router.post("/create/:user/:project/", [modepress_api_1.canEdit, this.createAsset.bind(this)]);
        // Register the path
        e.use("/app-engine/assets", router);
    }
    /**
    * Returns an array of IAsset items
    * @param {express.Request} req
    * @param {express.Response} res
    * @param {Function} next
    */
    AssetController.prototype.createAsset = function (req, res, next) {
        res.setHeader('Content-Type', 'application/json');
        var model = this.getModel("en-assets");
        var that = this;
        var newAsset = req.body;
        newAsset.user = req.params.user;
        var project = req.params.project;
        if (!modepress_api_1.isValidID(project))
            return res.end(JSON.stringify({ error: true, message: "Please use a valid project ID" }));
        newAsset.projectId = new mongodb.ObjectID(project);
        model.createInstance(newAsset).then(function (instance) {
            return res.end(JSON.stringify({
                error: true,
                message: "New asset created",
                data: instance.schema.generateCleanData(false, instance._id)
            }));
        }).catch(function (err) {
            winston.error(err.message, { process: process.pid });
            return res.end(JSON.stringify({
                error: true,
                message: "An error occurred while creating the asset : " + err.message
            }));
        });
    };
    /**
    * Returns an array of IAsset items
    * @param {express.Request} req
    * @param {express.Response} res
    * @param {Function} next
    */
    AssetController.prototype.getAssets = function (req, res, next) {
        res.setHeader('Content-Type', 'application/json');
        var model = this.getModel("en-assets");
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
                message: "Found " + count + " assets",
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
    return AssetController;
})(modepress_api_1.Controller);
exports.AssetController = AssetController;
