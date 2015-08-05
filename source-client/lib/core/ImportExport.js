var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Animate;
(function (Animate) {
    var ImportExportEvents = (function (_super) {
        __extends(ImportExportEvents, _super);
        function ImportExportEvents(v) {
            _super.call(this, v);
        }
        ImportExportEvents.COMPLETE = new ImportExportEvents("import_export_complete");
        return ImportExportEvents;
    })(Animate.ENUM);
    Animate.ImportExportEvents = ImportExportEvents;

    var ImportExportEvent = (function (_super) {
        __extends(ImportExportEvent, _super);
        function ImportExportEvent(eventName, live_link) {
            _super.call(this, eventName, live_link);
            this.live_link = live_link;
        }
        return ImportExportEvent;
    })(Animate.Event);
    Animate.ImportExportEvent = ImportExportEvent;

    /**
    * A class to help with importing and exporting a project
    */
    var ImportExport = (function (_super) {
        __extends(ImportExport, _super);
        function ImportExport() {
            // Call super-class constructor
            _super.call(this);

            if (ImportExport._singleton != null)
                throw new Error("The ImportExport class is a singleton. You need to call the ImportExport.getSingleton() function.");

            ImportExport._singleton = this;

            this.mRequest = null;

            //this.mServerProxy = this.onServer.bind( this );
            this.runWhenDone = false;
        }
        /**
        * @type public mfunc run
        * This function will first export the scene and then attempt to create a window that runs the application.
        * @extends <ImportExport>
        */
        ImportExport.prototype.run = function () {
            this.exportScene();
            this.runWhenDone = true;
        };

        /**
        * @type public mfunc exportScene
        * This function is used to exort the Animae scene. This function creates an object which is exported as a string. Plugins
        * can hook into this process and change the output to suit the plugin needs.
        * @extends <ImportExport>
        */
        ImportExport.prototype.exportScene = function () {
            this.runWhenDone = false;
            var project = Animate.User.getSingleton().project;

            var data = {};
            data["category"] = "builds";
            data["command"] = "build";
            data["projectID"] = project.id;

            var dataToken = {};
            dataToken.assets = {};
            dataToken.groups = {};
            dataToken.containers = {};
            dataToken.converters = {};
            dataToken.data = {};

            var objectToken = null;
            var behaviourCount = 0;
            var assetCount = 0;
            var linkCount = 0;

            //Get all the behaviours and build them into the export object
            var i = project.behaviours.length;
            while (i--) {
                var behaviour = project.behaviours[i];
                if (behaviour.json == "")
                    continue;

                objectToken = JSON.parse(behaviour.json);

                if (objectToken && objectToken.items) {
                    var item = null;

                    dataToken.containers[behaviour.name] = {};
                    dataToken.containers[behaviour.name].name = behaviour.name;
                    dataToken.containers[behaviour.name].id = behaviour.id;
                    dataToken.containers[behaviour.name].behaviours = {};
                    dataToken.containers[behaviour.name].links = {};
                    dataToken.containers[behaviour.name].assets = {};
                    dataToken.containers[behaviour.name].properties = {};

                    //Set each of the properties
                    var props = behaviour.properties.tokenize();
                    for (var pi in props) {
                        var propType = Animate.ENUM.fromString(props[pi].type);
                        var propVal = props[pi].value;
                        dataToken.containers[behaviour.name].properties[props[pi].name] = ImportExport.getExportValue(propType, propVal);
                    }

                    //Let the plugins export their data
                    dataToken.containers[behaviour.name].plugins = objectToken.plugins;
                    Animate.PluginManager.getSingleton().exportContainer(dataToken.containers[behaviour.name].plugins, behaviour);

                    //Create tokens and fill each with data. First create either a behaviour
                    //or link objct
                    var counter = 0;
                    while (objectToken.items[counter]) {
                        if (objectToken.items[counter].type == "BehaviourAsset" || objectToken.items[counter].type == "BehaviourScript" || objectToken.items[counter].type == "BehaviourPortal" || objectToken.items[counter].type == "Behaviour" || objectToken.items[counter].type == "BehaviourInstance") {
                            behaviourCount++;
                            dataToken.containers[behaviour.name].behaviours[behaviourCount] = {};
                            item = dataToken.containers[behaviour.name].behaviours[behaviourCount];

                            item.id = objectToken.items[counter].id;
                            item.name = objectToken.items[counter].name;
                            item.type = objectToken.items[counter].type;

                            if (objectToken.items[counter].type == "BehaviourPortal") {
                                item.portalType = objectToken.items[counter].portalType.toString();
                                item.dataType = objectToken.items[counter].dataType.toString();
                                item.value = ImportExport.getExportValue(objectToken.items[counter].dataType, objectToken.items[counter].value);
                            } else {
                                if (objectToken.items[counter].type == "BehaviourInstance")
                                    item.originalContainerID = objectToken.items[counter].behaviourID;

                                if (objectToken.items[counter].type == "BehaviourScript")
                                    item.databaseID = objectToken.items[counter].databaseID;

                                item.portals = new Array();
                                var portalsArr = item.portals;

                                var counterPortal = 0;
                                while (objectToken.items[counter].portals[counterPortal]) {
                                    portalsArr[counterPortal] = {};

                                    portalsArr[counterPortal].name = objectToken.items[counter].portals[counterPortal].name;
                                    portalsArr[counterPortal].type = objectToken.items[counter].portals[counterPortal].type.toString();
                                    portalsArr[counterPortal].dataType = objectToken.items[counter].portals[counterPortal].dataType.toString();

                                    portalsArr[counterPortal].value = ImportExport.getExportValue(objectToken.items[counter].portals[counterPortal].dataType, objectToken.items[counter].portals[counterPortal].value);

                                    if (portalsArr[counterPortal].dataType == "asset") {
                                        if (portalsArr[counterPortal].value != null && portalsArr[counterPortal].value != "") {
                                            var dataSplit = portalsArr[counterPortal].value.split(":");
                                            var assetID = dataSplit[0];
                                            if (assetID != "") {
                                                var assetsContainer = dataToken.containers[behaviour.name].assets;

                                                //First check if the asset was added to the container
                                                var assetFound = false;
                                                for (var propName in assetsContainer)
                                                    if (assetsContainer[propName].assetID == assetID) {
                                                        assetFound = true;
                                                        break;
                                                    }

                                                if (assetFound == false) {
                                                    assetsContainer[assetID] = {};
                                                    assetsContainer[assetID].assetID = assetID;

                                                    //It can also the be case that assets reference other assets. In those
                                                    //situations you will want the container to keep adding to all the assets
                                                    this.assetRefCheck(project.getAsset(assetID), assetsContainer);
                                                }
                                            }
                                        }
                                    }

                                    counterPortal++;
                                }
                            }
                        } else if (objectToken.items[counter].type == "Link") {
                            linkCount++;
                            dataToken.containers[behaviour.name].links[linkCount] = {};
                            item = dataToken.containers[behaviour.name].links[linkCount];

                            //fill in the sub properties
                            item.id = objectToken.items[counter].id;
                            item.type = objectToken.items[counter].type;
                            item.startPortal = objectToken.items[counter].startPortal;
                            item.endPortal = objectToken.items[counter].endPortal;
                            item.startBehaviour = objectToken.items[counter].targetStartBehaviour;
                            item.endBehaviour = objectToken.items[counter].targetEndBehaviour;
                            item.frameDelay = objectToken.items[counter].frameDelay;
                        }

                        counter++;
                    }
                }
            }

            assetCount = 0;

            //Get all the assets and build them into the export object
            i = project.assets.length;
            while (i--) {
                var asset = project.assets[i];

                if (objectToken) {
                    var item = null;
                    assetCount++;
                    dataToken.assets[assetCount] = {};
                    dataToken.assets[assetCount].name = asset.name;
                    dataToken.assets[assetCount].id = asset.id;
                    dataToken.assets[assetCount].properties = {};
                    dataToken.assets[assetCount].className = asset.className;

                    var aprops = asset.properties.tokenize();
                    for (var assetPropName in aprops) {
                        var propType = Animate.ENUM.fromString(aprops[assetPropName].type.toString());
                        var propVal = aprops[assetPropName].value;

                        dataToken.assets[assetCount].properties[aprops[assetPropName].name] = ImportExport.getExportValue(propType, propVal);
                    }
                }
            }

            var groupCount = 0;

            //Get all the groups and build them into the export object
            var groups = Animate.TreeViewScene.getSingleton().getGroups();
            i = groups.length;
            while (i--) {
                var group = groups[i];

                if (group) {
                    var item = null;
                    groupCount++;
                    dataToken.groups[groupCount] = {};
                    dataToken.groups[groupCount].name = group.text;
                    dataToken.groups[groupCount].id = group.groupID;
                    dataToken.groups[groupCount].items = [];

                    for (var ii = 0; ii < group.children.length; ii++) {
                        dataToken.groups[groupCount].items.push((group.children[ii]).instanceID);
                    }
                }
            }

            //Send the object to the plugins
            Animate.PluginManager.getSingleton().sceneBuilt(dataToken);

            var sceneStr = JSON.stringify(dataToken);

            //Now save the build to the database
            this.mRequest = "updateBuild";
            var loader = new Animate.Loader();
            loader.addEventListener(Animate.LoaderEvents.COMPLETE, this.onServer, this);
            loader.addEventListener(Animate.LoaderEvents.FAILED, this.onServer, this);
            loader.load(Animate.DB.HOST, {
                category: "build",
                command: this.mRequest,
                json: sceneStr,
                projectID: project.id,
                buildID: project.buildID
            }, true);
        };

        ImportExport.prototype.assetRefCheck = function (asset, assetsContainer) {
            if (asset == null)
                return;

            for (var i in asset.vars)
                if (asset.vars[i].type == "asset") {
                    var assetID = ImportExport.getExportValue(asset.vars[i].type, asset.vars[i].value);
                    if (assetID != null && assetID != "") {
                        //Check if the asset was added to the container
                        var assetFound = false;
                        for (var propName in assetsContainer)
                            if (assetsContainer[propName].assetID == assetID) {
                                assetFound = true;
                                break;
                            }

                        if (assetFound == false) {
                            assetsContainer[assetID] = {};
                            assetsContainer[assetID].assetID = assetID;

                            //It can also the be case that assets reference other assets. In those
                            //situations you will want the container to keep adding to all the assets
                            var project = Animate.User.getSingleton().project;
                            this.assetRefCheck(project.getAsset(assetID), assetsContainer);
                        }
                    }
                } else if (asset.vars[i].type == "group") {
                    var groupID = ImportExport.getExportValue(asset.vars[i].type, asset.vars[i].value);
                    if (groupID != null && groupID != "") {
                        var groupNode = Animate.TreeViewScene.getSingleton().findNode("groupID", groupID);
                        for (var ii = 0; ii < groupNode.children.length; ii++)
                            if ((groupNode.children[ii]).instanceID) {
                                var assetID = (groupNode.children[ii]).instanceID;

                                //Check if the asset was added to the container
                                var assetFound = false;
                                for (var propName in assetsContainer)
                                    if (assetsContainer[propName].assetID == assetID) {
                                        assetFound = true;
                                        break;
                                    }

                                if (assetFound == false) {
                                    assetsContainer[assetID] = {};
                                    assetsContainer[assetID].assetID = assetID;

                                    //It can also the be case that assets reference other assets. In those
                                    //situations you will want the container to keep adding to all the assets
                                    var project = Animate.User.getSingleton().project;
                                    this.assetRefCheck(project.getAsset(assetID), assetsContainer);
                                }
                            }
                    }
                }
        };

        ImportExport.getExportValue = /**
        * Gets the value of an object without any of the additional data associated with it.
        * @param {ParameterType} propType the object type
        * @param {any} value Its current value
        * @returns {object}
        */
        function (propType, value) {
            if (propType == Animate.ParameterType.NUMBER) {
                if (!value)
                    value = "0";

                var dataSplit = value.toString().split(":");
                return parseFloat(dataSplit[0]);
            } else if (propType == Animate.ParameterType.STRING || propType == Animate.ParameterType.BOOL || propType == Animate.ParameterType.INT)
                return value;
else if (propType == Animate.ParameterType.ASSET)
                return value.split(":")[0];
else if (propType == Animate.ParameterType.GROUP)
                return value;
else if (propType == Animate.ParameterType.FILE) {
                var parts = value.split("|");
                var path = parts[2];
                path = path.replace(/\.\.\//g, "");
                path = path.replace(/\.\//g, "");
                path = "./" + path;
                return path;
            } else if (propType == Animate.ParameterType.ENUM) {
                var parts = value.split(":");
                var value = parts[1];
                return value;
            } else if (propType == Animate.ParameterType.ASSET) {
                var parts = value.split(":");
                var value = parts[1];
                return value;
            } else if (propType == Animate.ParameterType.COLOR) {
                return parseInt(value.split(":")[0], 16);
            } else if (propType == Animate.ParameterType.OBJECT) {
                var test = parseFloat(value);
                if (isNaN(test) == false)
                    return test;

                test = parseInt(value);
                if (isNaN(test) == false)
                    return test;

                return value.toString();
            } else if (propType == Animate.ParameterType.HIDDEN)
                return value.toString();
        };

        /**
        * This is the resonse from the server
        */
        ImportExport.prototype.onServer = function (response, event, sender) {
            if (response == Animate.LoaderEvents.COMPLETE) {
                if (event.return_type == Animate.ServerResponses.SUCCESS) {
                    if (this.mRequest == "updateBuild") {
                        Animate.Logger.getSingleton().clearItems();
                        var now = new Date();
                        Animate.Logger.getSingleton().logMessage("Build complete at " + (now).format(), null, Animate.LogType.MESSAGE);
                        Animate.Logger.getSingleton().logMessage("External link: " + event.tag.live_link, null, Animate.LogType.MESSAGE);

                        if (this.runWhenDone)
                            window.open(event.tag.live_link, 'Webinate Live!', 'width=900,height=860,menubar=1,resizable=1,scrollbars=1,status=1,titlebar=1,toolbar=1');

                        this.dispatchEvent(new ImportExportEvent(ImportExportEvents.COMPLETE, event.tag.live_link));
                    }
                } else {
                    Animate.MessageBox.show(event.message, Array("Ok"), null, null);
                    this.dispatchEvent(new Animate.ProjectEvent(Animate.ProjectEvents.FAILED, event.message, Animate.ServerResponses.ERROR, event.tag));
                }
            } else
                this.dispatchEvent(new Animate.ProjectEvent(Animate.ProjectEvents.FAILED, event.message, Animate.ServerResponses.ERROR, event.tag));
        };

        ImportExport.getSingleton = /**
        * Gets the singleton instance.
        * @extends <ImportExport>
        */
        function () {
            if (!ImportExport._singleton)
                new ImportExport();

            return ImportExport._singleton;
        };
        return ImportExport;
    })(Animate.EventDispatcher);
    Animate.ImportExport = ImportExport;
})(Animate || (Animate = {}));
//# sourceMappingURL=ImportExport.js.map
