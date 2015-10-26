var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var ResourceController_1 = require("./ResourceController");
var FileModel_1 = require("../new-models/FileModel");
/**
* A controller that deals with project models
*/
var FileController = (function (_super) {
    __extends(FileController, _super);
    function FileController(server, config, e) {
        _super.call(this, "files", new FileModel_1.FileModel(), server, config, e);
    }
    /**
    * Attempts to upload a file to the server
    * @param {express.Request} req
    * @param {express.Response} res
    * @param {Function} next
    */
    FileController.prototype.create = function (req, res, next) {
    };
    return FileController;
})(ResourceController_1.ResourceController);
exports.FileController = FileController;
