var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Animate;
(function (Animate) {
    /**
    * The main GUI component of the application.
    */
    var Application = (function (_super) {
        __extends(Application, _super);
        function Application(domElement) {
            _super.call(this, domElement, null);

            if (Application._singleton != null)
                throw new Error("The Application class is a singleton. You need to call the Application.getSingleton() function.");

            Application._singleton = this;

            this._canvasContext = new Animate.CanvasContext(200);

            this._focusObj = null;

            //Start the tooltip manager
            Animate.TooltipManager.create();

            this._resizeProxy = this.onWindowResized.bind(this);
            this._downProxy = this.onMouseDown.bind(this);

            var comp = jQuery(document.activeElement).data("component");

            //Create each of the main components for the application.
            var stage = new Animate.Component("#stage");
            var toolbar = Animate.Toolbar.getSingleton(new Animate.Component("#toolbar"));

            this.addChild(toolbar);
            this.addChild(stage);

            toolbar.addLayout(new Animate.Fill(0, 0, 0, 0, false, true));
            stage.addLayout(new Animate.Fill(0, 0, 0, -100));

            //Create each of the main split panels
            var mainSplit = new Animate.SplitPanel(stage, Animate.SplitOrientation.VERTICAL, 0.75);
            mainSplit.element.css({ width: "100%", height: "100%" });

            var leftSplit = new Animate.SplitPanel(mainSplit.left, Animate.SplitOrientation.HORIZONTAL, 0.85);
            var rightSplit = new Animate.SplitPanel(mainSplit.right, Animate.SplitOrientation.HORIZONTAL, 0.5);
            leftSplit.element.css({ width: "100%", height: "100%" });
            rightSplit.element.css({ width: "100%", height: "100%" });
            var grid = new Animate.PropertyGrid(rightSplit.top);

            var scenetab = Animate.SceneTab.getSingleton(rightSplit.bottom);
            var canvastab = Animate.CanvasTab.getSingleton(leftSplit.top);
            var logger = Animate.Logger.getSingleton(leftSplit.bottom);
            logger.logMessage("let's get animated!", null, Animate.LogType.MESSAGE);

            //now set up the dockers
            this._dockerlefttop = new Animate.Docker(leftSplit.top);
            this._dockerlefttop.addComponent(canvastab, false);
            this._dockerleftbottom = new Animate.Docker(leftSplit.bottom);
            this._dockerleftbottom.addComponent(logger, false);
            this._dockerrightbottom = new Animate.Docker(rightSplit.bottom);
            this._dockerrightbottom.addComponent(scenetab, false);
            this._dockerrighttop = new Animate.Docker(rightSplit.top);
            this._dockerrighttop.addComponent(grid, false);

            Animate.BuildOptionsForm.getSingleton().addSettingPage(new Animate.UserPreferences("User Options"));

            this.update();

            //Hook the resize event
            jQuery(window).on('resize', this._resizeProxy);
            jQuery(document).on('mousedown', this._downProxy);
        }
        /**
        * Deals with the focus changes
        * @param {object} e The jQuery event object
        */
        Application.prototype.onMouseDown = function (e) {
            var elem = jQuery(e.target);
            var comp = elem.data("component");

            while (!comp && elem.length != 0) {
                elem = jQuery(elem).parent();
                comp = elem.data("component");
            }

            this.setFocus(comp);
        };

        /**
        * Sets a component to be focused.
        * @param {Component} comp The component to focus on.
        */
        Application.prototype.setFocus = function (comp) {
            if (this._focusObj)
                this._focusObj.element.data("focus", false);

            if (comp != null) {
                comp.element.data("focus", true);
                this._focusObj = comp;
            }
        };

        /**
        * Updates the dimensions of the application
        * @param {object} val The jQuery event object
        */
        Application.prototype.onWindowResized = function (val) {
            _super.prototype.update.call(this);
        };

        /**
        * This will cleanup the component.
        */
        Application.prototype.dispose = function () {
            jQuery(window).off('resize', this._resizeProxy);
            jQuery(document).off('mousedown', this._downProxy);

            this._resizeProxy = null;
            this._downProxy = null;

            //Call super
            _super.prototype.dispose.call(this);
        };

        /**
        *  This is called when a project is unloaded and we need to reset the GUI.
        */
        Application.prototype.projectReset = function () {
            Animate.PropertyGrid.getSingleton().projectReset();

            //DragManager.getSingleton().projectReset();
            Animate.Logger.getSingleton().clearItems();
            Animate.TreeViewScene.getSingleton().projectReset();
            Animate.CanvasTab.getSingleton().projectReset();

            //Must be called after reset
            var user = Animate.User.getSingleton();
            if (user.project) {
                user.project.dispose();
                user.project = null;
            }

            //Unload all the plugins
            Animate.PluginManager.getSingleton().unloadAll();
        };

        /**
        * This is called when a project is created. This is used
        * so we can orgaise all the elements that need to be populated.
        */
        Application.prototype.projectReady = function () {
            Animate.Toolbar.getSingleton().newProject();

            Animate.CanvasTab.getSingleton().projectReady();

            var project = Animate.User.getSingleton().project;
            project.addEventListener(Animate.ProjectEvents.BEHAVIOURS_LOADED, this.onBehavioursLoaded, this);
            project.loadBehaviours();

            //Create the page title
            document.title = 'Animate: p' + project.id + " - " + project.mName;

            Animate.TreeViewScene.getSingleton().projectReady();
        };

        /**
        * This is called when a project has loaded all its behaviours.
        */
        Application.prototype.onBehavioursLoaded = function (response, event, sender) {
            var project = Animate.User.getSingleton().project;
            project.removeEventListener(Animate.ProjectEvents.BEHAVIOURS_LOADED, this.onBehavioursLoaded, this);

            project.addEventListener(Animate.ProjectEvents.FILES_LOADED, this.onFilesLoaded, this);
            project.loadFiles();
        };

        /**
        * This is called when a project has loaded all its assets.
        */
        Application.prototype.onAssetsLoaded = function (response, event, sender) {
            var project = Animate.User.getSingleton().project;
            project.removeEventListener(Animate.ProjectEvents.ASSETS_LOADED, this.onAssetsLoaded, this);

            project.addEventListener(Animate.ProjectEvents.GROUPS_LOADED, this.onGroupsLoaded, this);
            project.loadGroups();
        };

        /**
        * This is called when a project has loaded all its files.
        */
        Application.prototype.onFilesLoaded = function (response, event, sender) {
            var project = Animate.User.getSingleton().project;
            project.removeEventListener(Animate.ProjectEvents.FILES_LOADED, this.onFilesLoaded, this);

            project.addEventListener(Animate.ProjectEvents.ASSETS_LOADED, this.onAssetsLoaded, this);
            project.loadAssets();
        };

        /**
        * This is called when a project has loaded all its groups.
        */
        Application.prototype.onGroupsLoaded = function (response, event, sender) {
            var project = Animate.User.getSingleton().project;
            project.removeEventListener(Animate.ProjectEvents.GROUPS_LOADED, this.onGroupsLoaded, this);

            project.removeEventListener(Animate.ProjectEvents.SAVED_ALL, this.onSaveAll, this);
            project.addEventListener(Animate.ProjectEvents.SAVED_ALL, this.onSaveAll, this);

            Animate.PluginManager.getSingleton().callReady();
        };

        /**
        * When the project data is all saved to the DB
        */
        Application.prototype.onSaveAll = function (event, data) {
            Animate.CanvasTab.getSingleton().saveAll();
        };

        Application.getInstance = /**
        * Gets the singleton instance
        */
        function (domElement) {
            if (Application._singleton === undefined)
                Application._singleton = new Application(domElement);

            return Application._singleton;
        };

        Object.defineProperty(Application.prototype, "focusObj", {
            get: function () {
                return this._focusObj;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Application.prototype, "canvasContext", {
            get: function () {
                return this._canvasContext;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Application.prototype, "dockerLeftTop", {
            get: function () {
                return this._dockerlefttop;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Application.prototype, "dockerLeftBottom", {
            get: function () {
                return this._dockerleftbottom;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Application.prototype, "dockerRightTop", {
            get: function () {
                return this._dockerrighttop;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Application.prototype, "dockerRightBottom", {
            get: function () {
                return this._dockerrightbottom;
            },
            enumerable: true,
            configurable: true
        });
        return Application;
    })(Animate.Component);
    Animate.Application = Application;
})(Animate || (Animate = {}));
//# sourceMappingURL=Application.js.map
