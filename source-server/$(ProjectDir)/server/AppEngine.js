var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var modepress_api_1 = require("modepress-api");
var ProjectController_1 = require("./new-controllers/ProjectController");
var PluginController_1 = require("./new-controllers/PluginController");
var ResourceController_1 = require("./new-controllers/ResourceController");
var UserDetailsController_1 = require("./new-controllers/UserDetailsController");
var PermissionController_1 = require("./new-controllers/PermissionController");
var BuildController_1 = require("./new-controllers/BuildController");
var AssetModel_1 = require("./new-models/AssetModel");
/**
* A plugin that loads the app engine controllers for use in Modepress
*/
var AppEngine = (function (_super) {
    __extends(AppEngine, _super);
    /**
    * Creates a new instance of the email controller
    * @param {IServer} server The server configuration options
    * @param {IConfig} config The configuration options
    * @param {express.Express} e The express instance of this server
    */
    function AppEngine(server, config, e) {
        _super.call(this, null);
        this._controllers = [
            new UserDetailsController_1.UserDetailsController(server, config, e),
            new PermissionController_1.PermissionController(server, config, e),
            new PluginController_1.PluginController(server, config, e),
            new ResourceController_1.ResourceController("/app-engine/assets", "en-assets", new AssetModel_1.AssetModel(), server, config, e),
            new ResourceController_1.ResourceController("/app-engine/files", "en-files", new AssetModel_1.AssetModel(), server, config, e),
            new ResourceController_1.ResourceController("/app-engine/groups", "en-groups", new AssetModel_1.AssetModel(), server, config, e),
            new ResourceController_1.ResourceController("/app-engine/behaviours", "en-behaviours", new AssetModel_1.AssetModel(), server, config, e),
            new ProjectController_1.ProjectController(server, config, e),
            new BuildController_1.BuildController(server, config, e)
        ];
    }
    /**
    * Called to initialize this controller and its related database objects
    * @param {mongodb.Db} db The mongo database to use
    * @returns {Promise<Controller>}
    */
    AppEngine.prototype.initialize = function (db) {
        var promises = [];
        var that = this;
        for (var i = 0, ctrls = this._controllers, l = ctrls.length; i < l; i++)
            promises.push(ctrls[i].initialize(db));
        return new Promise(function (resolve, reject) {
            Promise.all(promises).then(function () {
                resolve(that);
            }).catch(function (err) {
                resolve(err);
            });
        });
    };
    return AppEngine;
})(modepress_api_1.Controller);
exports.default = AppEngine;
