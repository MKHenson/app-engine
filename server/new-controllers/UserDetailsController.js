var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var express = require("express");
var bodyParser = require("body-parser");
var modepress_api_1 = require("modepress-api");
var UserDetailsModel_1 = require("../new-models/UserDetailsModel");
var winston = require("winston");
/**
* A controller that deals with project models
*/
var UserDetailsController = (function (_super) {
    __extends(UserDetailsController, _super);
    /**
    * Creates a new instance of the controller
    * @param {IServer} server The server configuration options
    * @param {IConfig} config The configuration options
    * @param {express.Express} e The express instance of this server
    */
    function UserDetailsController(server, config, e) {
        _super.call(this, [new UserDetailsModel_1.UserDetailsModel()]);
        UserDetailsController.singleton = this;
        var router = express.Router();
        router.use(bodyParser.urlencoded({ 'extended': true }));
        router.use(bodyParser.json());
        router.use(bodyParser.json({ type: 'application/vnd.api+json' }));
        router.get("/:user", [modepress_api_1.isAuthenticated, this.getDetails.bind(this)]);
        router.post("/create/:target", [modepress_api_1.isAdmin, this.createDetails.bind(this)]);
        // Register the path
        e.use("/app-engine/user-details", router);
        modepress_api_1.EventManager.singleton.on("Activated", this.onActivated.bind(this));
        modepress_api_1.EventManager.singleton.on("Removed", this.onRemoved.bind(this));
    }
    /**
    * Called whenever a user has had their account removed
    * @param {UserEvent} event
    */
    UserDetailsController.prototype.onRemoved = function (event) {
        var model = this.getModel("en-user-details");
        model.deleteInstances({ user: event.username }).then(function () {
            winston.info("User details for " + event.username + " have been deleted", { process: process.pid });
        }).catch(function (err) {
            winston.error("An error occurred while deleteing user details for " + event.username + " : " + err.message, { process: process.pid });
        });
    };
    /**
    * Called whenever a user has activated their account. We setup their app engine specific details
    * @param {UserEvent} event
    */
    UserDetailsController.prototype.onActivated = function (event) {
        var model = this.getModel("en-user-details");
        model.createInstance({ user: event.username }).then(function (instance) {
            winston.info("Created user details for " + event.username, { process: process.pid });
        }).catch(function (err) {
            winston.error("An error occurred while creating creating user details for " + event.username + " : " + err.message, { process: process.pid });
        });
    };
    /**
    * Gets user details for a target 'user'. By default the data is santized, but you can use the verbose query to get all data values.
    * @param {express.Request} req
    * @param {express.Response} res
    * @param {Function} next
    */
    UserDetailsController.prototype.getDetails = function (req, res, next) {
        var that = this;
        res.setHeader('Content-Type', 'application/json');
        var model = that.getModel("en-user-details");
        var target = req.params.user;
        model.findOne({ user: target }).then(function (instance) {
            if (!instance)
                return Promise.reject(new Error("User does not exist"));
            return res.end(JSON.stringify({
                error: false,
                message: "Found details for user '" + target + "'",
                data: instance.schema.generateCleanData(!req._verbose, instance._id)
            }));
        }).catch(function (err) {
            winston.error(err.message, { process: process.pid });
            return res.end(JSON.stringify({
                error: true,
                message: "Could not find details for target '" + target + "' : " + err.message
            }));
        });
    };
    /**
    * Creates user details for a target user
    * @param {express.Request} req
    * @param {express.Response} res
    * @param {Function} next
    */
    UserDetailsController.prototype.createDetails = function (req, res, next) {
        var that = this;
        res.setHeader('Content-Type', 'application/json');
        modepress_api_1.UsersService.getSingleton().getUser(req.params.target, req).then(function (getReq) {
            if (getReq.error)
                return res.end(JSON.stringify({ error: true, message: getReq.message }));
            var user = getReq.data;
            if (!user)
                return res.end(JSON.stringify({ error: true, message: "No user exists with the name '" + req.params.target + "'" }));
            var model = that.getModel("en-user-details");
            // User exists and is ok - so lets create their details
            model.createInstance({ user: user.username }).then(function (instance) {
                return res.end(JSON.stringify({
                    error: false,
                    message: "Created user details for target " + user.username
                }));
            }).catch(function (err) {
                winston.error(err.message, { process: process.pid });
                return res.end(JSON.stringify({
                    error: true,
                    message: "Could not create user details for target " + user.username + " : " + err.message
                }));
            });
        }).catch(function (err) {
            winston.error(err.message, { process: process.pid });
            res.end(JSON.stringify({
                error: true,
                message: err.message
            }));
        });
    };
    return UserDetailsController;
})(modepress_api_1.Controller);
exports.UserDetailsController = UserDetailsController;
