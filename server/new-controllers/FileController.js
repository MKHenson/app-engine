var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var express = require("express");
var bodyParser = require("body-parser");
var modepress_api_1 = require("modepress-api");
var ResourceController_1 = require("./ResourceController");
var winston = require("winston");
var FileModel_1 = require("../new-models/FileModel");
/**
* A controller that deals with project models
*/
var FileController = (function (_super) {
    __extends(FileController, _super);
    function FileController(server, config, e) {
        var r = express.Router();
        r.use(bodyParser.urlencoded({ 'extended': true }));
        r.use(bodyParser.json());
        r.use(bodyParser.json({ type: 'application/vnd.api+json' }));
        r.delete("/:user/:project/:ids?", [modepress_api_1.canEdit, this.removeResources.bind(this)]);
        r.put("/:user/:project/:id?", [modepress_api_1.canEdit, this.editResource.bind(this)]);
        r.get("/:user/:project/:id?", [modepress_api_1.canEdit, this.getResources.bind(this)]);
        r.post("/:user/:project/:bucket", [modepress_api_1.canEdit, this.create.bind(this)]);
        modepress_api_1.EventManager.singleton.on("FilesUploaded", this.onFilesUploaded.bind(this));
        _super.call(this, "/app-engine/files", new FileModel_1.FileModel(), server, config, e, r);
    }
    /**
    * Called whenever a user has uploaded files
    * @param {UsersInterface.SocketEvents.IFileEvent} event
    */
    FileController.prototype.onFilesUploaded = function (event) {
        console.log("Uploaded files: " + event.tokens.);
    };
    /**
    * Attempts to upload a file to the server
    * @param {express.Request} req
    * @param {express.Response} res
    * @param {Function} next
    */
    FileController.prototype.create = function (req, res, next) {
        var that = this;
        var thatFunc = _super.prototype.create;
        var bucket = req.params.bucket;
        modepress_api_1.UsersService.getSingleton().uploadFile(bucket, req).then(function (data) {
            if (data.error) {
                winston.error(data.message, { process: process.pid });
                return res.end(JSON.stringify({
                    error: true,
                    message: "Could not upload files' : " + data.message
                }));
            }
            thatFunc(req, res, next);
        }).catch(function (err) {
            winston.error(err.message, { process: process.pid });
            return res.end(JSON.stringify({
                error: true,
                message: "Could not upload files : '" + err.message + "'"
            }));
        });
    };
    return FileController;
})(ResourceController_1.ResourceController);
exports.FileController = FileController;
