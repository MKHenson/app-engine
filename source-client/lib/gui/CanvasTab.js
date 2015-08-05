var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Animate;
(function (Animate) {
    var CanvasTabType = (function (_super) {
        __extends(CanvasTabType, _super);
        function CanvasTabType(v) {
            _super.call(this, v);
        }
        CanvasTabType.CANVAS = new CanvasTabType("canvas");
        CanvasTabType.HTML = new CanvasTabType("html");
        CanvasTabType.CSS = new CanvasTabType("css");
        CanvasTabType.SCRIPT = new CanvasTabType("script");
        CanvasTabType.BLANK = new CanvasTabType("blank");
        return CanvasTabType;
    })(Animate.ENUM);
    Animate.CanvasTabType = CanvasTabType;

    /**
    * This is an implementation of the tab class that deals with the canvas
    */
    var CanvasTab = (function (_super) {
        __extends(CanvasTab, _super);
        function CanvasTab(parent) {
            _super.call(this, parent);

            if (CanvasTab._singleton != null)
                throw new Error("The CanvasTab class is a singleton. You need to call the CanvasTab.getSingleton() function.");

            CanvasTab._singleton = this;

            this.element.css({ width: "100%", height: "100%" });

            this._currentCanvas = null;

            this.welcomeTab = null;
            this.closingTabPair = null;
            this.mDocker = null;

            //Add the main tab
            Animate.BehaviourManager.getSingleton().addEventListener(Animate.BehaviourManagerEvents.CONTAINER_SAVED, this.removeTabConfirmed, this);
        }
        /**
        * This is called by a controlling ScreenManager class. An image string needs to be returned
        * which will act as a preview of the component that is being viewed or hidden.
        * @return {string}
        */
        CanvasTab.prototype.getPreviewImage = function () {
            return "media/canvas.png";
        };

        /**
        * Each IDock item needs to implement this so that we can keep track of where it moves.
        * @returns {Docker}
        */
        CanvasTab.prototype.getDocker = function () {
            return this.mDocker;
        };

        /**
        * Each IDock item needs to implement this so that we can keep track of where it moves.
        * @param {Docker} val
        */
        CanvasTab.prototype.setDocker = function (val) {
            this.mDocker = val;
        };

        /**
        * This is called by a controlling Docker class when the component needs to be shown.
        */
        CanvasTab.prototype.onShow = function () {
        };

        /**
        * Called when sall all is returned from the DB
        */
        CanvasTab.prototype.saveAll = function () {
            var i = this.tabs.length;
            while (i--)
                this.tabs[i].onSaveAll();
        };

        /**
        * This is called by a controlling Docker class when the component needs to be hidden.
        */
        CanvasTab.prototype.onHide = function () {
        };

        /**
        * Called just before a tab is closed. If you return false it will cancel the operation.
        * @param {TabPair} tabPair An object that contains both the page and label of the tab
        * @returns {boolean} Returns false if the tab needs to be saved. Otherwise true.
        */
        CanvasTab.prototype.onTabPairClosing = function (tabPair) {
            var canvas = tabPair.page.children[0];
            if (canvas instanceof Animate.Canvas) {
                var node = Animate.TreeViewScene.getSingleton().sceneNode.findNode("behaviour", canvas.behaviourContainer);

                //Set the context node to be this node
                Animate.TreeViewScene.getSingleton().contextNode = node;

                if (node && node.saved == false) {
                    this.closingTabPair = tabPair;
                    Animate.MessageBox.show("Do you want to save this node before you close it?", ["Yes", "No"], this.onMessage, this);
                    return false;
                } else {
                    //We tell the plugins we've selected a behaviour container
                    Animate.PluginManager.getSingleton().containerSelected(null);
                }
            }

            return true;
        };

        /**
        *  The response of the message box.
        * @param {string} choice The choice of the message box. It can be either Yes or No
        */
        CanvasTab.prototype.onMessage = function (choice) {
            var canvas = (this.closingTabPair).canvas;

            if (choice == "Yes") {
                //We need to build an array of the canvas objects we are trying to save.
                var saveDataObj = canvas.buildDataObject();
                var saveToken = {};
                saveToken[canvas.behaviourContainer.id] = saveDataObj;

                //Now get the project to save it.
                Animate.User.getSingleton().project.addEventListener(Animate.ProjectEvents.BEHAVIOUR_SAVED, this.onBehaviourSaved, this);
                Animate.User.getSingleton().project.saveBehaviours(saveToken);
            } else {
                var node = Animate.TreeViewScene.getSingleton().sceneNode.findNode("behaviour", canvas.behaviourContainer);
                node.save(true);
                this.removeTab(this.closingTabPair, true);
                this.closingTabPair = null;
            }
        };

        /**
        * We use this function to remove any assets from the tabs
        * @param {Asset} asset The asset we are removing
        */
        CanvasTab.prototype.removeAsset = function (asset) {
            var i = this.tabs.length;
            while (i--)
                if (this.tabs[i].page.children.length > 0) {
                    var canvas = this.tabs[i].page.children[0];
                    if (canvas instanceof Animate.Canvas)
                        canvas.removeAsset(asset);
                }
        };

        /**
        * When the behaviour was saved on request of the message box - we close the tab that represents it.
        * @param <string> response
        * @param <object> behaviour
        */
        CanvasTab.prototype.onBehaviourSaved = function (response, event, sender) {
            Animate.User.getSingleton().project.removeEventListener(Animate.ProjectEvents.BEHAVIOUR_SAVED, this.onBehaviourSaved, this);
            if (response == Animate.ProjectEvents.BEHAVIOUR_SAVED) {
                var canvas = (this.closingTabPair).canvas;
                if (canvas.behaviourContainer == event.tag) {
                    var node = Animate.TreeViewScene.getSingleton().sceneNode.findNode("behaviour", canvas.behaviourContainer);
                    if (node)
                        node.save(true);

                    this.removeTab(this.closingTabPair, true);
                    this.closingTabPair = null;
                }
            }
        };

        /**
        * You can use this function to fetch a tab's canvas.
        * @param {string} text The text of the tab
        * @returns {Canvas} The returned tab's canvas or null
        */
        CanvasTab.prototype.getTabCanvas = function (text) {
            var tabPair = _super.prototype.getTab.call(this, text);

            if (tabPair != null) {
                var canvas = tabPair.page.children[0];
                return canvas;
            }

            return null;
        };

        /**
        * When we click the tab
        * @param {TabPair} tab The tab pair object which contains both the label and page components
        */
        CanvasTab.prototype.onTabSelected = function (tab) {
            if (this._currentCanvas) {
                var project = Animate.User.getSingleton().project;

                for (var id in this._currentCanvas.sceneAssets) {
                    var asset = project.getAsset(id);
                    Animate.PluginManager.getSingleton().assetRemovedFromContainer(asset, this._currentCanvas.behaviourContainer);
                }
            }

            this._currentCanvas = tab.page.children[0];

            if (this._currentCanvas != null && this._currentCanvas.element.data("component") instanceof Animate.Canvas) {
                var canvas = this._currentCanvas.element.data("component");
                canvas.onSelected();

                var node = Animate.TreeViewScene.getSingleton().sceneNode.findNode("behaviour", canvas.behaviourContainer);
                if (node)
                    Animate.TreeViewScene.getSingleton().selectNode(node);

                //Now we need to notify the plugins of added or removed assets
                canvas.buildSceneAssets();

                //We tell the plugins we've selected a behaviour container
                Animate.PluginManager.getSingleton().containerSelected(canvas.behaviourContainer);
            } else
                //We tell the plugins we've selected a behaviour container
                Animate.PluginManager.getSingleton().containerSelected(null);

            Animate.Tab.prototype.onTabSelected.call(this, tab);
        };

        /**
        * @type public mfunc projectReady
        * When we start a new project we load the welcome page.
        * @extends <CanvasTab>
        */
        CanvasTab.prototype.projectReady = function () {
            var loader = new Animate.Loader();
            loader.addEventListener(Animate.LoaderEvents.COMPLETE, this.onNewsLoaded, this);
            loader.addEventListener(Animate.LoaderEvents.FAILED, this.onNewsLoaded, this);

            loader.load(Animate.DB.HOST, {
                category: "misc",
                command: "getNewsTab"
            }, true);
        };

        /**
        * @type public mfunc projectReset
        * Called when the project is reset by either creating a new one or opening an older one.
        * @extends <CanvasTab>
        */
        CanvasTab.prototype.projectReset = function () {
            this._currentCanvas = null;
            this.welcomeTab = null;
            this.clear();
        };

        /**
        * @type public mfunc onNewsLoaded
        * When the news has been loaded from webinate.
        */
        CanvasTab.prototype.onNewsLoaded = function (response, event, sender) {
            if (response == Animate.LoaderEvents.COMPLETE) {
                if (event.return_type == Animate.ServerResponses.SUCCESS) {
                    if (this.welcomeTab)
                        this.removeTab(this.welcomeTab.name, true);

                    this.welcomeTab = this.addSpecialTab("Welcome to Animate!", CanvasTabType.BLANK);

                    var comp = new Animate.Component(event.tag.html, this.welcomeTab.page);
                    comp.element.css({ width: "100%", height: "100%" });
                    comp.addLayout(new Animate.Fill());
                }
            }
        };

        CanvasTab.getSingleton = /**
        * Gets the singleton instance.
        * @param {Component} parent The parent component of this tab
        * @returns {CanvasTab}
        */
        function (parent) {
            if (!CanvasTab._singleton)
                new CanvasTab(parent);

            return CanvasTab._singleton;
        };

        /**
        * Renames a tab and its container
        * @param {string} oldName The old name of the tab
        * @param {string} newName The new name of the tab
        * @returns {TabPair} Returns the tab pair
        */
        CanvasTab.prototype.renameTab = function (oldName, newName) {
            var toRet = this.getTab(oldName);
            toRet.tabSelector.element.text(newName);
            (toRet).canvas.name = newName;
            return toRet;
        };

        CanvasTab.prototype.removeTab = function (val, dispose) {
            var canvas = this.getTabCanvas(val);

            if (canvas instanceof Animate.Canvas) {
                //Remove prev we need to notify the plugins of added or removed assets
                var project = Animate.User.getSingleton().project;

                for (var id in canvas.sceneAssets) {
                    var asset = project.getAsset(id);
                    Animate.PluginManager.getSingleton().assetRemovedFromContainer(asset, canvas.behaviourContainer);
                }

                canvas.behaviourContainer.canvas = null;
                canvas.removeEventListener(Animate.CanvasEvents.MODIFIED, this.onCanvasModified, this);
            }

            return _super.prototype.removeTab.call(this, val, dispose);
        };

        /**
        * When a canvas is modified we change the tab name, canvas name and un-save its tree node.
        */
        CanvasTab.prototype.onCanvasModified = function (response, event, sender) {
            var node = Animate.TreeViewScene.getSingleton().sceneNode.findNode("behaviour", event.canvas.behaviourContainer);

            if (node)
                node.save(false);
        };

        /**
        * Removes an item from the tab
        */
        CanvasTab.prototype.removeTabConfirmed = function (response, event) {
            if (event.tag.result == Animate.BehaviourManagerEvents.SUCCESS) {
                _super.prototype.removeTab.call(this, event.name, true);
            }
        };

        /**
        * Adds an item to the tab
        * @param {string} text The text of the new tab
        * @param {CanvasTabType} type The type of tab to create
        * @param {any} tabContent Data associated with the tab
        * @returns {TabPair} The tab pair object
        */
        CanvasTab.prototype.addSpecialTab = function (text, type, tabContent) {
            if (typeof type === "undefined") { type = CanvasTabType.CANVAS; }
            if (typeof tabContent === "undefined") { tabContent = null; }
            var toRet = null;
            if (type == CanvasTabType.CANVAS) {
                toRet = _super.prototype.addTab.call(this, new Animate.CanvasTabPair(new Animate.Canvas(null, tabContent), text), true);
                var canvas = (toRet).canvas;
                tabContent.canvas = canvas;
                toRet.page.addChild(canvas);

                canvas.addEventListener(Animate.CanvasEvents.MODIFIED, this.onCanvasModified, this);

                this._currentCanvas = canvas;
                (canvas.children[0]).updateDimensions();

                Animate.PluginManager.getSingleton().containerCreated(tabContent);
                Animate.PluginManager.getSingleton().containerSelected(tabContent);
                return toRet;
            } else if (type == CanvasTabType.BLANK) {
                toRet = _super.prototype.addTab.call(this, text, true);
                return toRet;
            } else {
                if (type == CanvasTabType.HTML) {
                    if (!Animate.HTMLTab.singleton)
                        toRet = _super.prototype.addTab.call(this, new Animate.HTMLTab("HTML"), true);
else
                        toRet = this.selectTab(Animate.HTMLTab.singleton);
                } else if (type == CanvasTabType.CSS) {
                    if (!Animate.CSSTab.singleton)
                        toRet = _super.prototype.addTab.call(this, new Animate.CSSTab("CSS"), true);
else
                        toRet = this.selectTab(Animate.CSSTab.singleton);
                } else if (type == CanvasTabType.SCRIPT) {
                    toRet = Animate.Tab.prototype.addTab.call(this, new Animate.ScriptTab(tabContent));
                }
                return toRet;
            }
        };

        Object.defineProperty(CanvasTab.prototype, "currentCanvas", {
            get: function () {
                return this._currentCanvas;
            },
            enumerable: true,
            configurable: true
        });
        return CanvasTab;
    })(Animate.Tab);
    Animate.CanvasTab = CanvasTab;
})(Animate || (Animate = {}));
//# sourceMappingURL=CanvasTab.js.map
