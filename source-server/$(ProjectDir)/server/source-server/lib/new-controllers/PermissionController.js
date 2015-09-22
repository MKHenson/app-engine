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
        PermissionController.singleton = this;
        _super.call(this, [new ProjectModel_1.ProjectModel(), new UserDetailsModel_1.UserDetailsModel()]);
    }
    /**
    * Checks if the logged in user has the allowance to create a new project
    * @param {IUserEntry} user
    */
    PermissionController.prototype.projectsWithinLimits = function (user) {
        // If an admin - then the user can create a new projec regardless
        if (user.privileges < 3)
            return Promise.resolve(true);
        var that = this;
        // Get the details
        return new Promise(function (resolve, reject) {
            var userModel = that.getModel("en-user-details");
            var projModel = that.getModel("en-projects");
            var username = user.username;
            var maxProjects = 0;
            userModel.findOne({ user: username }).then(function (instance) {
                if (!instance)
                    return Promise.reject(new Error("Not found"));
                maxProjects = instance.dbEntry.maxProjects;
                // get number of projects
                return projModel.count({ user: username });
            }).then(function (numProjects) {
                // TODO: Check if project is allowed certain plugins?
                // If num projects + 1 more is less than max we are ok
                if (numProjects < maxProjects)
                    return resolve(true);
                else
                    return Promise.reject(new Error("You cannot create more projects on this plan. Please consider upgrading your account"));
            }).catch(function (err) {
                return reject(err);
            });
        });
    };
    return PermissionController;
})(modepress_api_1.Controller);
exports.PermissionController = PermissionController;
