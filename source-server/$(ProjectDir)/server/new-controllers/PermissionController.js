var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var modepress_api_1 = require("modepress-api");
var UserDetailsModel_1 = require("../new-models/UserDetailsModel");
/**
* A controller that deals with user permissions
*/
var PermissionController = (function (_super) {
    __extends(PermissionController, _super);
    /**
    * Creates a new instance of the email controller
    * @param {IServer} server The server configuration options
    * @param {IConfig} config The configuration options
    * @param {express.Express} e The express instance of this server
    */
    function PermissionController(server, config, e) {
        _super.call(this, [new UserDetailsModel_1.UserDetailsModel()]);
        PermissionController.singleton = this;
    }
    /**
    * This funciton checks if user is logged in and throws an error if not
    * @param {string} user The username of the user we want to get details for
    */
    PermissionController.prototype.getUserDetails = function (user) {
        var model = this.getModel("en-user-details");
        return new Promise(function (resolve, reject) {
        });
    };
    /**
    * This funciton checks if user is logged in and throws an error if not
    * @param {express.Request} req
    * @param {express.Response} res
    * @param {Function} next
    */
    PermissionController.prototype.authenticated = function (req, res, next) {
        var users = modepress_api_1.UsersService.getSingleton();
        users.authenticated(req, res).then(function (auth) {
            if (!auth.authenticated) {
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({
                    error: true,
                    message: auth.message
                }));
                return;
            }
            req._user = auth.user;
            next();
        }).catch(function (error) {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({
                error: true,
                message: error.message
            }));
        });
    };
    return PermissionController;
})(modepress_api_1.Controller);
exports.PermissionController = PermissionController;
