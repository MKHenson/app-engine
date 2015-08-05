var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Animate;
(function (Animate) {
    var PluginPortalEvents = (function (_super) {
        __extends(PluginPortalEvents, _super);
        function PluginPortalEvents(v) {
            _super.call(this, v);
        }
        PluginPortalEvents.PORTAL_ADDED = new PluginPortalEvents("portal_added");
        PluginPortalEvents.PORTAL_REMOVED = new PluginPortalEvents("portal_removed");
        PluginPortalEvents.PORTAL_EDITED = new PluginPortalEvents("portal_edited");
        return PluginPortalEvents;
    })(Animate.ENUM);
    Animate.PluginPortalEvents = PluginPortalEvents;

    var PluginContainerEvents = (function (_super) {
        __extends(PluginContainerEvents, _super);
        function PluginContainerEvents(v) {
            _super.call(this, v);
        }
        PluginContainerEvents.CONTAINER_DELETED = new PluginContainerEvents("plugin_container_deleted");
        return PluginContainerEvents;
    })(Animate.ENUM);
    Animate.PluginContainerEvents = PluginContainerEvents;

    var PluginContainerEvent = (function (_super) {
        __extends(PluginContainerEvent, _super);
        function PluginContainerEvent(eventName, container) {
            _super.call(this, eventName, null);
            this.container = container;
        }
        return PluginContainerEvent;
    })(Animate.Event);
    Animate.PluginContainerEvent = PluginContainerEvent;

    var PluginPortalEvent = (function (_super) {
        __extends(PluginPortalEvent, _super);
        function PluginPortalEvent(eventName, oldName, container, portal, canvas) {
            _super.call(this, eventName, null);
            this.oldName = oldName;
            this.container = container;
            this.portal = portal;
            this.canvas = canvas;
        }
        return PluginPortalEvent;
    })(Animate.Event);
    Animate.PluginPortalEvent = PluginPortalEvent;

    /**
    * The plugin manager is used to load and manage external Animate plugins.
    */
    var PluginManager = (function (_super) {
        __extends(PluginManager, _super);
        function PluginManager() {
            // Call super-class constructor
            _super.call(this);
            /**
            * This function is called when an asset is removed from a behaviour container.
            * @param {Asset} asset The asset that was removed
            * @param {BehaviourContainer} behaviourContainer The behaviour container to which the asset was removed.
            */
            this.assetRemovedFromContainer = function (asset, behaviourContainer) {
                var i = this.plugins.length;
                while (i--)
                    this.plugins[i].onAssetRemovedFromContainer(asset, behaviourContainer);
            };

            if (PluginManager._singleton != null)
                throw new Error("PluginManager is singleton, you must call the getSingleton() property to get its instance. ");

            PluginManager._singleton = this;

            this.plugins = [];
            this.behaviourTemplates = [];
            this._assetTemplates = [];
            this._converters = [];
            this._dataTypes = new Array("asset", "number", "group", "file", "string", "object", "bool", "int", "color", "enum");

            //Create some standard templates
            this.behaviourTemplates.push(new Animate.BehaviourDefinition("Asset", false, false, false, false, [
                new Animate.PortalTemplate("Asset In", Animate.PortalType.PARAMETER, Animate.ParameterType.ASSET, ":"),
                new Animate.PortalTemplate("Asset Out", Animate.PortalType.PRODUCT, Animate.ParameterType.ASSET, ":")
            ], null));

            //Script nodes
            this.scriptTemplate = new Animate.BehaviourDefinition("Script", true, true, true, true, [
                new Animate.PortalTemplate("Execute", Animate.PortalType.INPUT, Animate.ParameterType.BOOL, false),
                new Animate.PortalTemplate("Exit", Animate.PortalType.OUTPUT, Animate.ParameterType.BOOL, false)
            ], null);
            this.behaviourTemplates.push(this.scriptTemplate);

            //Instance nodes
            this.behaviourTemplates.push(new Animate.BehaviourDefinition("Instance", true, true, true, true, [], null));

            this._loadedPlugins = [];

            Animate.BehaviourPicker.getSingleton().list.addItem("Asset");
            Animate.BehaviourPicker.getSingleton().list.addItem("Script");
        }
        /**
        * Gets a plugin by its class name.
        * @param {string} name The name of the plugin
        * @returns {IPlugin}
        */
        PluginManager.prototype.getPluginByName = function (name) {
            var i = this.plugins.length;
            while (i--)
                if (this.plugins[i].name == name)
                    return this.plugins[i];

            return null;
        };

        /**
        * This will create an object from a constructor
        * @param {any} Constructor The constructor we are instansiating
        * @returns {any} The created instance
        */
        PluginManager.prototype.createInstance = function (Constructor) {
            var Temp = function () {
            }, inst, ret;

            // Give the Temp constructor the Constructor's prototype
            Temp.prototype = Constructor.prototype;

            // Create a new instance
            inst = new Temp();

            // Call the original Constructor with the temp
            // instance as its context (i.e. its 'this' value)
            ret = Constructor.apply(inst, []);

            Temp.prototype = null;
            Temp = null;

            // If an object has been returned then return it otherwise
            // return the original instance.
            // (consistent with behaviour of the new operator)
            return Object(ret) === ret ? ret : inst;
        };

        /**
        * This funtcion is used to load a plugin.
        * @param {IPlugin} plugin The IPlugin constructor that is to be created
        * @param {boolean} createPluginReference Should we keep this constructor in memory? The default is true
        */
        PluginManager.prototype.loadPlugin = function (plugin, createPluginReference) {
            if (typeof createPluginReference === "undefined") { createPluginReference = true; }
            if (createPluginReference)
                this._loadedPlugins.push(plugin);

            plugin = this.createInstance(plugin);

            //Load external script
            var i = this.plugins.length;
            while (i--)
                if (this.plugins[i].name == plugin.name)
                    Animate.Logger.getSingleton().logMessage("A plugin with the name '" + plugin.name + "' already exists - this may cause conflicts in the application.", null, Animate.LogType.MESSAGE);

            this.plugins.push(plugin);

            //Get behaviour definitions
            var btemplates = plugin.getBehaviourDefinitions();
            if (btemplates) {
                var len = btemplates.length;
                for (var i = 0; i < len; i++) {
                    this.behaviourTemplates.push(btemplates[i]);
                    Animate.BehaviourPicker.getSingleton().list.addItem(btemplates[i].behaviourName);

                    Animate.TreeViewScene.getSingleton().addPluginBehaviour(btemplates[i]);
                }
            }

            //Get converters
            var converters = plugin.getTypeConverters();
            if (converters) {
                var i = converters.length;
                while (i--) {
                    this._converters.push(converters[i]);
                }
            }

            //Get asset templates
            var atemplates = plugin.getAssetsTemplate();

            if (atemplates) {
                var i = atemplates.length;
                while (i--) {
                    this._assetTemplates.push(atemplates[i]);
                }
            }

            return;
        };

        /**
        * Call this function to unload all the plugins.
        */
        PluginManager.prototype.unloadAll = function () {
            for (var i = 0; i < this.plugins.length; i++)
                this.unloadPlugin(this.plugins[i]);

            this.plugins.splice(0, this.plugins.length);
            this._loadedPlugins.splice(0, this._loadedPlugins.length);
        };

        /**
        * Call this function to unload a plugin
        * @param {IPlugin} plugin The IPlugin object that is to be loaded
        */
        PluginManager.prototype.unloadPlugin = function (plugin) {
            //Get converters
            var toRemove = new Array();
            var i = this.behaviourTemplates.length;
            while (i--)
                if (this.behaviourTemplates[i].plugin == plugin)
                    toRemove.push(this.behaviourTemplates[i]);

            //Get behaviour definitions
            var i = toRemove.length;
            while (i--) {
                Animate.BehaviourPicker.getSingleton().list.removeItem(toRemove[i].behaviourName);
                Animate.TreeViewScene.getSingleton().removePluginBehaviour(toRemove[i].behaviourName);

                this.behaviourTemplates.splice(this.behaviourTemplates.indexOf(toRemove[i]), 1);
            }

            //Get converters
            var toRemove2 = [];
            var i = this._converters.length;
            while (i--)
                if (this._converters[i].plugin == plugin)
                    toRemove2.push(this._converters[i]);

            var i = toRemove2.length;
            while (i--)
                this._converters.splice(jQuery.inArray(toRemove2[i], this._converters), 1);

            this._assetTemplates.splice(0, this._assetTemplates.length);

            plugin.unload();
        };

        /**
        * Loops through each of the converters to see if a conversion is possible. If it is
        * it will return an array of conversion options, if not it returns false.
        * @param {any} typeA The first type to check
        * @param {any} typeB The second type to check
        */
        PluginManager.prototype.getConverters = function (typeA, typeB) {
            var toRet = null;

            var i = this._converters.length;
            while (i--) {
                if (this._converters[i].canConvert(typeA, typeB)) {
                    if (toRet == null)
                        toRet = [];

                    var ii = this._converters[i].conversionOptions.length;
                    while (ii--)
                        toRet.push(this._converters[i].conversionOptions[ii]);
                }
            }

            return toRet;
        };

        /**
        * Gets a behaviour template by its name.
        * @param {string} behaviorName The name of the behaviour template
        */
        PluginManager.prototype.getTemplate = function (behaviorName) {
            var len = this.behaviourTemplates.length;
            while (len--)
                if (this.behaviourTemplates[len].behaviourName == behaviorName)
                    return this.behaviourTemplates[len];

            return null;
        };

        ///==============================================
        /// Plugin dispatch functions
        ///==============================================
        /**
        * This is called when the scene is built. The object passed to this function represents
        * the scene as an object.
        * @param {Asset} asset The asset that was edited
        * @param {string} propertyNam The name of the property that was edited
        * @param {any} newValue The new value of the property
        * @param {any} oldValue The old value of the property
        * @param {ParameterType} propertyType The type of property
        */
        PluginManager.prototype.assetEdited = function (asset, propertyNam, newValue, oldValue, propertyType) {
            if (propertyType == Animate.ParameterType.NUMBER) {
                var dataSplit = newValue.split(":");
                newValue = parseFloat(dataSplit[0]);
            }

            //Cleanup all the previous plugins
            var i = this.plugins.length;
            while (i--)
                this.plugins[i].onAssetEdited(asset, propertyNam, newValue, oldValue, propertyType);
        };

        /**
        * When an asset is created this function will notify all plugins of its existance
        * @param {string} name The name of the asset
        * @param {Asset} asset The asset itself
        */
        PluginManager.prototype.assetCreated = function (name, asset) {
            //Cleanup all the previous plugins
            var i = this.plugins.length;
            while (i--)
                this.plugins[i].onAssetCreated(name, asset);
        };

        /**
        * When an asset is destroyed this function will notify all plugins of its destruction
        * @param {Asset} asset The asset being destroyed
        */
        PluginManager.prototype.assetDestroyed = function (asset) {
            //Cleanup all the previous plugins
            var i = this.plugins.length;
            while (i--)
                this.plugins[i].onAssetDestroyed(asset);
        };

        /**
        * When an asset is copied this function will notify all plugins
        * @param {Asset} original The original asset.
        * @param {Asset} newAsset The new asset.
        */
        PluginManager.prototype.assetCopied = function (original, newAsset) {
            //Cleanup all the previous plugins
            var i = this.plugins.length;
            while (i--)
                this.plugins[i].onAssetCopied(original, newAsset);
        };

        /**
        * Called when an asset is selected in the asset tree
        * @param {Asset}  asset The selected asset
        */
        PluginManager.prototype.assetSelected = function (asset) {
            //Cleanup all the previous plugins
            var i = this.plugins.length;
            while (i--)
                this.plugins[i].onAssetSelected(asset);
        };

        /**
        * This is called when the scene is built. The object passed to this function represents
        * the scene as an object
        * @param {any} scene
        * @extends <PluginManager>
        */
        PluginManager.prototype.sceneBuilt = function (scene) {
            //Cleanup all the previous plugins
            var i = this.plugins.length;
            while (i--)
                this.plugins[i].sceneBuilt(scene);
        };

        /**
        * This function is called by Animate when everything has been loaded and the user is able to begin their session.
        */
        PluginManager.prototype.callReady = function () {
            var i = this.plugins.length;
            while (i--)
                this.plugins[i].ready();

            if (Animate.User.getSingleton().plan == Animate.UserPlanType.PLAN_FREE) {
                if (this.behaviourTemplates.indexOf(this.scriptTemplate) != -1) {
                    this.behaviourTemplates.splice(this.behaviourTemplates.indexOf(this.scriptTemplate), 1);
                    Animate.BehaviourPicker.getSingleton().list.removeItem(this.scriptTemplate.behaviourName);
                }
            } else {
                if (this.behaviourTemplates.indexOf(this.scriptTemplate) == -1) {
                    this.behaviourTemplates.push(this.scriptTemplate);
                    Animate.BehaviourPicker.getSingleton().list.addItem(this.scriptTemplate.behaviourName);
                }
            }
        };

        /**
        * This function is called by Animate when the run button is pushed.
        */
        PluginManager.prototype.callRun = function () {
            var i = this.plugins.length;
            while (i--)
                this.plugins[i].run();
        };

        /**
        * This function is called when an asset is added to a behaviour container.
        * @param {Asset} asset The asset that was added
        * @param {BehaviourContainer} behaviourContainer The behaviour container to which the asset was added.
        */
        PluginManager.prototype.assetAddedToContainer = function (asset, behaviourContainer) {
            var i = this.plugins.length;
            while (i--)
                this.plugins[i].onAssetAddedToContainer(asset, behaviourContainer);
        };

        /**
        * This is called by Animate when we a container is created.
        * @param {BehaviourContainer} container The container we are creating.
        */
        PluginManager.prototype.containerCreated = function (container) {
            var i = this.plugins.length;
            while (i--)
                this.plugins[i].onContainerCreated(container);
        };

        /**
        * This is called by Animate when we select a container.
        * @param {BehaviourContainer} container The container we are saving.
        */
        PluginManager.prototype.containerSelected = function (container) {
            var i = this.plugins.length;
            while (i--)
                this.plugins[i].onContainerSelected(container);
        };

        /**
        * This is called by Animate when we are exporting a container. The token that gets passed should be used to store any optional
        * data with a container.
        * @param {any} token The data object you can save your data to.
        * @param {BehaviourContainer} container The container we are saving.
        */
        PluginManager.prototype.exportContainer = function (token, container) {
            var i = this.plugins.length;
            while (i--)
                this.plugins[i].onExportContainer(token, container);
        };

        /**
        * This is called by Animate when we are saving a container. The token that gets passed should be used to store any optional
        * data with a container. This can be later, re-associated with the container when onOpenContainer is called.
        * @param {any} token The data object you can save your data to.
        * @param {BehaviourContainer} container The container we are saving.
        * @param {Array<string>} sceneAssets An array of the asset ID's associated with the container
        */
        PluginManager.prototype.saveContainer = function (token, container, sceneAssets) {
            var i = this.plugins.length;
            while (i--)
                this.plugins[i].onSaveContainer(token, container, sceneAssets);
        };

        /**
        * This function is called by animate just before we create all the assets. It gives you a list
        * of the assets to be created in an array. You can sort this array if you need to load the assets in a given order.
        * @param {Array<Asset>} assets The array of assets to be sorted.
        */
        PluginManager.prototype.sortAssets = function (assets) {
            var i = this.plugins.length;
            while (i--)
                this.plugins[i].onSortAssets(assets);
        };

        /**
        * Called when an asset is renamed
        * @param {Asset} asset The asset that was renamed
        * @param {string} oldName The name before being renamed
        */
        PluginManager.prototype.assetRenamed = function (asset, oldName) {
            var i = this.plugins.length;
            while (i--)
                this.plugins[i].onAssetRenamed(asset, oldName);
        };

        /**
        * This is called by Animate when we are opening a container. The token that gets passed is filled with optional
        * data when onSaveContainer is called.
        * @param {any} token The data object you can open your data from.
        * @param {BevaiourContainer} container The container we are opening.
        */
        PluginManager.prototype.openContainer = function (token, container) {
            var i = this.plugins.length;
            while (i--)
                this.plugins[i].onOpenContainer(token, container);
        };

        /**
        * This function is called when we need to create a preview for a file that is associated with a project
        * @param {File} file The file that needs to be previewed
        * @param {Component} previewComponent The component which will act as the parent div of the preview.
        */
        PluginManager.prototype.displayPreview = function (file, previewComponent) {
            var firstChild = previewComponent.element.children(":first");
            var firstComp = firstChild.data("component");

            if (firstComp)
                firstComp.dispose();

            previewComponent.element.empty();
            previewComponent.element.css({ "min-width": "" });
            var w = previewComponent.element.width();

            if (file) {
                var i = this.plugins.length;
                while (i--) {
                    var handled = this.plugins[i].onDisplayPreview(file, previewComponent);
                    if (handled) {
                        var childW = firstChild.outerWidth(true);

                        previewComponent.element.css({ "min-width": (childW > w ? childW.toString() : "") + "px" });
                        break;
                    }
                }
            }
        };

        Object.defineProperty(PluginManager.prototype, "dataTypes", {
            get: function () {
                return this._dataTypes;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PluginManager.prototype, "assetTemplates", {
            get: function () {
                return this._assetTemplates;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PluginManager.prototype, "loadedPlugins", {
            get: function () {
                return this._loadedPlugins;
            },
            enumerable: true,
            configurable: true
        });

        PluginManager.getSingleton = /**
        * Gets the singleton instance.
        */
        function () {
            if (!PluginManager._singleton)
                new PluginManager();

            return PluginManager._singleton;
        };
        return PluginManager;
    })(Animate.EventDispatcher);
    Animate.PluginManager = PluginManager;
})(Animate || (Animate = {}));
//# sourceMappingURL=PluginManager.js.map
