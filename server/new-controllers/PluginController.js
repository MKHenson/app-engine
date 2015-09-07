var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var express = require("express");
var bodyParser = require("body-parser");
var modepress_api_1 = require("modepress-api");
var PluginModel_1 = require("../new-models/PluginModel");
/**
* A controller that deals with plugin models
*/
var PluginController = (function (_super) {
    __extends(PluginController, _super);
    /**
    * Creates a new instance of the controller
    * @param {IServer} server The server configuration options
    * @param {IConfig} config The configuration options
    * @param {express.Express} e The express instance of this server
    */
    function PluginController(server, config, e) {
        _super.call(this, [new PluginModel_1.PluginModel()]);
        var router = express.Router();
        router.use(bodyParser.urlencoded({ 'extended': true }));
        router.use(bodyParser.json());
        router.use(bodyParser.json({ type: 'application/vnd.api+json' }));
        router.get("/:id?", [this.getPlugins.bind(this)]);
        // Register the path
        e.use("/app-engine/plugins", router);
    }
    /**
    * Gets plugins based on the format of the request
    * @param {express.Request} req
    * @param {express.Response} res
    * @param {Function} next
    */
    PluginController.prototype.getPlugins = function (req, res, next) {
        res.setHeader('Content-Type', 'application/json');
        var model = this.getModel("en-plugins");
        var that = this;
        var count = 0;
        var findToken = {};
        var getContent = true;
        if (req.query.minimal)
            getContent = false;
        // Check for keywords
        if (req.query.search)
            findToken.name = new RegExp(req.query.search, "i");
        // First get the count
        model.count(findToken).then(function (num) {
            count = num;
            return model.findInstances(findToken, [], parseInt(req.query.index), parseInt(req.query.limit), (getContent == false ? { html: 0 } : undefined));
        }).then(function (instances) {
            var sanitizedData = that.getSanitizedData(instances, Boolean(req.query.verbose));
            res.end(JSON.stringify({
                error: false,
                count: count,
                message: "Found " + count + " plugins",
                data: sanitizedData
            }));
        }).catch(function (error) {
            res.end(JSON.stringify({
                error: true,
                message: error.message
            }));
        });
    };
    return PluginController;
})(modepress_api_1.Controller);
exports.PluginController = PluginController;
