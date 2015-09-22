var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var BaseController = require("./BaseController");
var ErrorController = require("./ErrorController");
var viewJSON = require("../views/JSONRenderer");
var viewJade = require("../views/JadeRenderer");
var utils = require("../Utils");
var Model = require("../models/Model");
var modelUser = require("../models/UserModel");
var modelPlugin = require("../models/PluginModel");
var mongodb = require("mongodb");
var UserController = require("./UserController");
var logger = require("../Logger");
var validator = require("../Validator");
/**
* Controlls all plugin related functions
*/
var PluginController = (function (_super) {
    __extends(PluginController, _super);
    /**
    * Creates an instance of the Controller class
    */
    function PluginController() {
        _super.call(this);
    }
    /**
    * Called whenever we need to process
    */
    PluginController.prototype.processRequest = function (request, response, functionName) {
        logger.log("Processing plugin request '" + functionName + "'");
        var that = this;
        this.processQueryData(function (options) {
            switch (functionName) {
                case "get-plugins":
                    return that.getPlugins(null, request, response);
                    break;
            }
            // Check if the user is logged in
            var isUserLoggedIn = function (loggedIn, user) {
                // If not logged in then do nothing
                if (!loggedIn)
                    return new ErrorController(utils.ErrorCodes.AUTHENTICATION_REQUIRED, "Authentication is required to call this function").processRequest(request, response, "");
                // Check an admin
                if (user.userType != modelUser.UserType.ADMIN)
                    return new ErrorController(utils.ErrorCodes.AUTHENTICATION_REQUIRED, "Admin authentication is required to call this function").processRequest(request, response, "");
                switch (functionName) {
                    case "create":
                        that.create(options, null, request, response);
                        break;
                    case "get-plugins":
                        that.getPlugins(null, request, response);
                        break;
                    case "delete":
                        that.delete(options["id"], null, request, response);
                        break;
                    case "update":
                        that.update(options, null, request, response);
                        break;
                    case "add-deployable":
                        that.addDeployable(options["file"], options["pluginId"], null, request, response);
                        break;
                    case "remove-deployable":
                        that.removeDeployable(options["file"], options["pluginId"], null, request, response);
                        break;
                    case "print":
                        that.printPlugins(parseInt(options["limit"]), parseInt(options["index"]), request, response);
                        break;
                    default:
                        new ErrorController(utils.ErrorCodes.INVALID_INPUT, "No function specified").processRequest(request, response, functionName);
                        break;
                }
            };
            UserController.singleton.loggedIn(isUserLoggedIn, request, response);
        }, request, response);
    };
    /**
    * Deletes a plugin by ID
    * @param {string} id The ID of the plugin
    * @param {( result: number ) => void} callback Callback function with the model result
    * @param {http.ServerRequest} request
    * @param {http.ServerResponse} response
    */
    PluginController.prototype.delete = function (id, callback, request, response) {
        logger.log("Deleteing plugin " + id + "...", logger.LogType.ADMIN);
        if (!id || id.toString().trim() == "" || !validator.isValidObjectID(id))
            return new ErrorController(utils.ErrorCodes.AUTHENTICATION_REQUIRED, "You must provide a valid plugin id").processRequest(request, response, "");
        // Validation passed - create user in database
        Model.collections("plugins").remove({ _id: new mongodb.ObjectID(id.trim()) }, function (err, result) {
            if (err) {
                if (callback)
                    return callback(null);
                else
                    return new ErrorController(utils.ErrorCodes.AUTHENTICATION_REQUIRED, err).processRequest(request, response, "");
            }
            logger.log("Plugin deleted...", logger.LogType.SUCCESS);
            if (callback)
                callback(result);
            else
                viewJSON.render({ message: "Plugin deleted - [" + result + "] documents affected" }, request, response, viewJSON.ReturnType.SUCCESS);
        });
    };
    /**
    * Creates a new plugin. Only allowed users who have admin access
    * @param {( users: modelPlugin.Plugin ) => void} callback Callback function with the plugin instance
    * @param {http.ServerRequest} request
    * @param {http.ServerResponse} response
    */
    PluginController.prototype.create = function (options, callback, request, response) {
        if (!options.name || options.name.toString().trim() == "")
            return new ErrorController(utils.ErrorCodes.AUTHENTICATION_REQUIRED, "You must provide a plugin name").processRequest(request, response, "");
        var plugin = new modelPlugin.Plugin();
        plugin.author = options.author || plugin.author;
        plugin.css = options.css || plugin.css;
        plugin.description = options.description || plugin.description;
        plugin.image = options.image || plugin.image;
        plugin.name = options.name || plugin.name;
        plugin.path = options.path || plugin.path;
        plugin.plan = options.plan || plugin.plan;
        plugin.shortDescription = options.shortDescription || plugin.shortDescription;
        plugin.version = options.version || plugin.version;
        // Validation passed - create user in database
        Model.collections("plugins").save(plugin, function (err, result) {
            if (err || !result) {
                if (callback)
                    return callback(null);
                else
                    return new ErrorController(utils.ErrorCodes.AUTHENTICATION_REQUIRED, err).processRequest(request, response, "");
            }
            logger.log("Plugin created...", logger.LogType.SUCCESS);
            if (callback)
                callback(result);
            else
                viewJSON.render(result, request, response, viewJSON.ReturnType.SUCCESS);
        });
    };
    /**
    * Updates a new plugin. Only allowed users who have admin access
    * @param {( users: modelPlugin.Plugin ) => void} callback Callback function with the build instance
    * @param {http.ServerRequest} request
    * @param {http.ServerResponse} response
    */
    PluginController.prototype.update = function (options, callback, request, response) {
        if (!options.id || options.id.toString().trim() == "" || !validator.isValidObjectID(options.id))
            return new ErrorController(utils.ErrorCodes.INVALID_INPUT, "You must provide a valid plugin id").processRequest(request, response, "");
        var id = options["id"];
        delete options["id"];
        // Validation passed - create user in database
        Model.collections("plugins").update({ _id: new mongodb.ObjectID(id.trim()) }, { $set: options }, function (err, result) {
            if (err) {
                if (callback)
                    return callback(null);
                else
                    return new ErrorController(utils.ErrorCodes.AUTHENTICATION_REQUIRED, err).processRequest(request, response, "");
            }
            logger.log("Plugin updated...", logger.LogType.SUCCESS);
            if (callback)
                callback(result);
            else
                viewJSON.render({ message: "Plugin updated - [" + result + "] documents affected" }, request, response, viewJSON.ReturnType.SUCCESS);
        });
    };
    /**
    * Adds a new file to be deployed for a plugin
    * @param {string} file The file to add
    * @param {string} plugin The file to add
    * @param {( numUpdated: number  ) => void} callback Callback function with the build instance
    * @param {http.ServerRequest} request
    * @param {http.ServerResponse} response
    */
    PluginController.prototype.addDeployable = function (file, pluginId, callback, request, response) {
        logger.log("Adding plugin deployable[" + file + "]...", logger.LogType.ADMIN);
        if (!pluginId || pluginId.toString().trim() == "" || !validator.isValidObjectID(pluginId))
            return new ErrorController(utils.ErrorCodes.INVALID_INPUT, "You must provide a valid plugin id").processRequest(request, response, "");
        if (!file || file.toString().trim() == "")
            return new ErrorController(utils.ErrorCodes.INVALID_INPUT, "You must provide a valid file").processRequest(request, response, "");
        // Validation passed - create user in database
        Model.collections("plugins").findOne({ _id: new mongodb.ObjectID(pluginId) }, function (err, plugin) {
            if (err) {
                if (callback)
                    return callback(0);
                else
                    return new ErrorController(utils.ErrorCodes.AUTHENTICATION_REQUIRED, err).processRequest(request, response, "");
            }
            if (!plugin) {
                if (callback)
                    return callback(0);
                else
                    return new ErrorController(utils.ErrorCodes.INVALID_INPUT, "Could not find plugin").processRequest(request, response, "");
            }
            var updateToken;
            if (!plugin.deployables)
                updateToken = { $set: { deployables: [file] } };
            else
                updateToken = { $push: { deployables: file } };
            Model.collections("plugins").update({ _id: plugin._id }, updateToken, function (err, numUpdated) {
                logger.log("Plugin updated - [" + numUpdated + "] documents affected", logger.LogType.SUCCESS);
                if (callback)
                    callback(numUpdated);
                else
                    viewJSON.render({ message: "Plugin updated - [" + numUpdated + "] documents affected" }, request, response, viewJSON.ReturnType.SUCCESS);
            });
        });
    };
    /**
    * Removes a file to be deployed from a plugin
    * @param {string} file The file to add
    * @param {string} plugin The file to add
    * @param {( numUpdated: number  ) => void} callback Callback function with the build instance
    * @param {http.ServerRequest} request
    * @param {http.ServerResponse} response
    */
    PluginController.prototype.removeDeployable = function (file, pluginId, callback, request, response) {
        logger.log("Removing plugin deployable[" + file + "]...", logger.LogType.ADMIN);
        if (!pluginId || pluginId.toString().trim() == "" || !validator.isValidObjectID(pluginId))
            return new ErrorController(utils.ErrorCodes.INVALID_INPUT, "You must provide a valid plugin id").processRequest(request, response, "");
        if (!file || file.toString().trim() == "")
            return new ErrorController(utils.ErrorCodes.INVALID_INPUT, "You must provide a valid file").processRequest(request, response, "");
        // Validation passed - create user in database
        Model.collections("plugins").findOne({ _id: new mongodb.ObjectID(pluginId) }, function (err, plugin) {
            if (err) {
                if (callback)
                    return callback(0);
                else
                    return new ErrorController(utils.ErrorCodes.AUTHENTICATION_REQUIRED, err).processRequest(request, response, "");
            }
            if (!plugin) {
                if (callback)
                    return callback(0);
                else
                    return new ErrorController(utils.ErrorCodes.INVALID_INPUT, "Could not find plugin").processRequest(request, response, "");
            }
            if (!plugin.deployables) {
                if (callback)
                    return callback(0);
                else
                    return viewJSON.render({ message: "No deployables found" }, request, response, viewJSON.ReturnType.SUCCESS);
            }
            var updateToken = { $pull: { deployables: file } };
            Model.collections("plugins").update({ _id: plugin._id }, updateToken, function (err, numUpdated) {
                logger.log("Plugin updated - [" + numUpdated + "] documents affected", logger.LogType.SUCCESS);
                if (callback)
                    callback(numUpdated);
                else
                    viewJSON.render({ message: "Plugin updated - [" + numUpdated + "] documents affected" }, request, response, viewJSON.ReturnType.SUCCESS);
            });
        });
    };
    /**
    * Prints the plugins currently stored in the database
    * @param {number} limit The number of builds to fetch
    * @param {number} startIndex The starting index from where we are fetching builds from
    * @param {http.ServerRequest} request
    * @param {http.ServerResponse} response
    */
    PluginController.prototype.printPlugins = function (limit, startIndex, request, response) {
        if (limit === void 0) { limit = 0; }
        if (startIndex === void 0) { startIndex = 0; }
        logger.log("Printing plugins...");
        var that = this;
        Model.collections("plugins").find({}, {}, startIndex, limit, function (err, result) {
            result.toArray(function (err, plugins) {
                return viewJade.render(__dirname + "/../views/admin/plugins/print.jade", { plugins: plugins }, response);
            });
        });
    };
    /**
    * Fetches an array of plugins
    * @param {( plugins: Array<modelPlugin.Plugin>) => void} callback The function to call when plugins have been collated
    * @param {http.ServerRequest} request
    * @param {http.ServerResponse} response
    */
    PluginController.prototype.getPlugins = function (callback, request, response) {
        Model.collections("plugins").find({}, {}, 0, 0, function (err, result) {
            result.toArray(function (err, plugins) {
                if (callback)
                    callback(plugins);
                else
                    return viewJSON.render({ plugins: plugins }, request, response, viewJSON.ReturnType.SUCCESS);
            });
        });
    };
    Object.defineProperty(PluginController, "singleton", {
        /**
        * Gets an instance of the plugin controller
        * @returns {PluginController}
        */
        get: function () {
            if (!PluginController._singleton)
                PluginController._singleton = new PluginController();
            return PluginController._singleton;
        },
        enumerable: true,
        configurable: true
    });
    return PluginController;
})(BaseController);
module.exports = PluginController;
