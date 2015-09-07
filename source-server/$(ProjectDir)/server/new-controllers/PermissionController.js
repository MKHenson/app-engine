var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var modepress_api_1 = require("modepress-api");
var UserDetailsModel_1 = require("../new-models/UserDetailsModel");
var ProjectModel_1 = require("../new-models/ProjectModel");
/**
* A controller that deals with project models
*/
var PermissionController = (function (_super) {
    __extends(PermissionController, _super);
    /**
    * Creates a new instance of the controller
    * @param {IServer} server The server configuration options
    * @param {IConfig} config The configuration options
    * @param {express.Express} e The express instance of this server
    */
    function PermissionController(server, config, e) {
        _super.call(this, [new ProjectModel_1.ProjectModel(), new UserDetailsModel_1.UserDetailsModel()]);
        PermissionController.singleton = this;
    }
    /**
    * Checks if the logged in user has the allowance to create a new project. This assumes the user is already logged in.
    * @param {express.Request} req
    * @param {express.Response} res
    * @param {Function} next
    */
    PermissionController.prototype.canCreateProject = function (req, res, next) {
        res.setHeader('Content-Type', 'application/json');
        var that = this;
        var userModel = that.getModel("en-user-details");
        var projModel = that.getModel("en-projects");
        var username = req._user.username;
        var maxProjects = 0;
        // If an admin - then the user can create a new projec regardless
        if (req._user.privileges < 3)
            return next();
        // Get the details
        userModel.findOne({ user: username }).then(function (instance) {
            if (!instance)
                return Promise.reject(new Error("Not found"));
            maxProjects = instance.dbEntry.maxProjects;
            // get number of projects
            return projModel.count({ user: username });
        }).then(function (numProjects) {
            // If num projects + 1 more is less than max we are ok
            if (numProjects + 1 < maxProjects)
                return next();
            else
                return Promise.reject(new Error("You cannot create more projects on this plan. Please consider upgrading your account."));
        }).catch(function (err) {
            return res.end(JSON.stringify({
                error: true,
                message: "Could not create new project : " + err.message
            }));
        });
    };
    return PermissionController;
})(modepress_api_1.Controller);
exports.PermissionController = PermissionController;
