var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Animate;
(function (Animate) {
    var ProjectLoaderEvents = (function (_super) {
        __extends(ProjectLoaderEvents, _super);
        function ProjectLoaderEvents(v) {
            _super.call(this, v);
        }
        ProjectLoaderEvents.READY = new ProjectLoaderEvents("project_loader_ready");
        ProjectLoaderEvents.FAILED = new ProjectLoaderEvents("project_loader_failed");
        return ProjectLoaderEvents;
    })(Animate.ENUM);
    Animate.ProjectLoaderEvents = ProjectLoaderEvents;

    var ProjectLoaderEvent = (function (_super) {
        __extends(ProjectLoaderEvent, _super);
        function ProjectLoaderEvent(eventType, message) {
            _super.call(this, eventType, message);
            this.message = message;
        }
        ProjectLoaderEvent.READY = new ProjectLoaderEvents("ready");
        ProjectLoaderEvent.FAILED = new ProjectLoaderEvents("failed");
        return ProjectLoaderEvent;
    })(Animate.Event);
    Animate.ProjectLoaderEvent = ProjectLoaderEvent;

    /**
    * The Project loader is a small component that is used to show the downloading and loading
    * of projects/plugins into the current workspace.
    */
    var ProjectLoader = (function (_super) {
        __extends(ProjectLoader, _super);
        /**
        * @param {Component} parent The parent of the button
        */
        function ProjectLoader(parent) {
            _super.call(this, "<div class='project-loader'></div>", parent);

            this._buildEntries = [];

            //this._loaderProxy = jQuery.proxy(this.onData, this);
            this._reloadProxy = jQuery.proxy(this.onButtonClick, this);
            this._loadedCount = 0;
            this._errorOccured = false;
        }
        /** Use this function to get a list of the dependencies the project has associated with itself.*/
        ProjectLoader.prototype.updateDependencies = function () {
            //Add new entries
            var componentCounter = 0;

            var children = this.children;
            var i = children.length;
            while (i--) {
                children[i].element.off("click", this._reloadProxy);
                children[i].dispose();
            }

            var plugins = Animate.User.getSingleton().project.plugins;

            for (var i = 0; i < plugins.length; i++) {
                var comp = new Animate.Component("<div class='build-entry'><img class='loader-cog-slow' src='media/cog-small-tiny.png' />" + plugins[i].name + "<span class='loading fade-animation'> - loading...</span></div>", this);
                this._buildEntries[componentCounter] = comp;
                comp.element.data("url", plugins[i].path);

                var reloadButton = new Animate.Button("Reload", comp);
                reloadButton.css({ "margin": "5px 10px 0 0", "width": "50px", "height": "18px", "float": "right" });
                reloadButton.element.hide();

                reloadButton.element.on("click", this._reloadProxy);

                comp.element.data("button", reloadButton);

                componentCounter++;
            }
        };

        /** When we click a reload button we reload the build. */
        ProjectLoader.prototype.onButtonClick = function (e) {
            var comp = jQuery(e.currentTarget).data("component");
            var url = comp.element.parent().data("url");
            var loader = new Animate.Loader();
            loader.addEventListener(Animate.LoaderEvents.COMPLETE, this.onData, this);
            loader.addEventListener(Animate.LoaderEvents.FAILED, this.onData, this);

            loader.dataType = "text";
            comp.element.parent().data("loader", loader);
            comp.enabled(false);
            jQuery(".loading", comp.element.parent()).show();
            loader.load(url, null, true, 1);
        };

        /** Gets the loader to load the individual projects. */
        ProjectLoader.prototype.startLoading = function () {
            this._loadedCount = 0;
            this._errorOccured = false;
            var manager = Animate.PluginManager.getSingleton();

            for (var i = 0; i < this._buildEntries.length; i++) {
                var url = this._buildEntries[i].element.data("url");

                var loader = new Animate.Loader();
                this._buildEntries[i].element.data("loader", loader);

                //Check if we have already loaded this script before
                var ii = manager.loadedPlugins.length;
                var loadedScript = null;
                while (ii--)
                    if (manager.loadedPlugins[ii].url == url) {
                        loadedScript = manager.loadedPlugins[ii];
                        break;
                    }

                if (loadedScript) {
                    var button = this._buildEntries[i].element.data("button");

                    // Remove the loading text
                    jQuery(".loading", this._buildEntries[i].element).hide();
                    button.element.fadeOut();

                    //Make the row image a tick
                    jQuery("img", this._buildEntries[i].element).attr("src", "media/tick-20.png");
                    jQuery("img", this._buildEntries[i].element).removeClass("loader-cog-slow");

                    manager.loadPlugin(loadedScript.plugin, false);

                    this._loadedCount++;
                    if (this._loadedCount >= this._buildEntries.length)
                        this.dispatchEvent(new ProjectLoaderEvent(ProjectLoaderEvents.READY, "Plugins loaded."));
                } else if (jQuery.trim(url) != "") {
                    loader.dataType = "script";
                    loader.addEventListener(Animate.LoaderEvents.COMPLETE, this.onData, this);
                    loader.addEventListener(Animate.LoaderEvents.FAILED, this.onData, this);
                    loader.load(url, null, true, 1);
                } else
                    this.onData(Animate.LoaderEvents.COMPLETE, null, loader);
            }
        };

        /** When one of the loaders returns from its request.*/
        ProjectLoader.prototype.onData = function (response, event, sender) {
            this._loadedCount++;

            if (response == Animate.LoaderEvents.COMPLETE) {
                for (var i = 0; i < this._buildEntries.length; i++) {
                    var loader = this._buildEntries[i].element.data("loader");
                    var button = this._buildEntries[i].element.data("button");
                    if (sender == loader || loader == null) {
                        // Remove the loading text
                        jQuery(".loading", this._buildEntries[i].element).hide();
                        button.element.fadeOut();

                        //Make the row image a tick
                        jQuery("img", this._buildEntries[i].element).attr("src", "media/tick-20.png");
                        jQuery("img", this._buildEntries[i].element).removeClass("loader-cog-slow");

                        var manager = Animate.PluginManager.getSingleton();
                        manager.loadedPlugins[manager.loadedPlugins.length - 1].url = (sender).url;

                        //Now we have some text loaded - lets add it to the DOM and run it.
                        jQuery("body").append("<script type='text/javascript'>" + event.tag + "</script>");
                    }
                }
            } else {
                this._errorOccured = true;

                for (var i = 0; i < this._buildEntries.length; i++) {
                    var loader = this._buildEntries[i].element.data("loader");
                    var button = this._buildEntries[i].element.data("button");

                    button.enabled(true);
                    if (sender == loader) {
                        jQuery("img", this._buildEntries[i].element).attr("src", "media/cross-20.png");
                        jQuery("img", this._buildEntries[i].element).removeClass("loader-cog-slow");
                        jQuery(".loading", this._buildEntries[i].element).hide();
                        button.element.fadeIn();
                        break;
                    }
                }
            }

            if (this._loadedCount >= this._buildEntries.length)
                this.dispatchEvent(new ProjectLoaderEvent(ProjectLoaderEvents.READY, "Plugins loaded."));
        };

        Object.defineProperty(ProjectLoader.prototype, "errorOccured", {
            get: function () {
                return this._errorOccured;
            },
            enumerable: true,
            configurable: true
        });
        return ProjectLoader;
    })(Animate.Component);
    Animate.ProjectLoader = ProjectLoader;
})(Animate || (Animate = {}));
//# sourceMappingURL=ProjectLoader.js.map
