var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Animate;
(function (Animate) {
    var PluginBrowserEvents = (function (_super) {
        __extends(PluginBrowserEvents, _super);
        function PluginBrowserEvents(v) {
            _super.call(this, v);
        }
        PluginBrowserEvents.UPDATED = new PluginBrowserEvents("plugin_browser_updated");
        PluginBrowserEvents.PLUGINS_IMPLEMENTED = new PluginBrowserEvents("plugin_browser_implemented");
        PluginBrowserEvents.FAILED = new PluginBrowserEvents("plugin_browser_failed");
        return PluginBrowserEvents;
    })(Animate.ENUM);
    Animate.PluginBrowserEvents = PluginBrowserEvents;

    var PluginBrowserEvent = (function (_super) {
        __extends(PluginBrowserEvent, _super);
        function PluginBrowserEvent(eventName, message, data) {
            _super.call(this, eventName, data);
            this.message = message;
            this.data = data;
        }
        return PluginBrowserEvent;
    })(Animate.Event);
    Animate.PluginBrowserEvent = PluginBrowserEvent;

    /**
    * A small class for browsing the available plugins
    */
    var PluginBrowser = (function (_super) {
        __extends(PluginBrowser, _super);
        /**
        * @param {Component} parent The parent of the button
        */
        function PluginBrowser(parent) {
            // Call super-class constructor
            _super.call(this, "<div class='project-explorer'></div>", parent);

            //Create left and right panels
            var leftComp = this.addChild("<div class='project-explorer-section project-explorer-left'></div>");
            var rightComp = this.addChild("<div class='project-explorer-section project-explorer-right'></div>");
            this.element.append("<div class='fix'></div>");

            this.leftTop = leftComp.addChild("<div></div>");

            this.pluginList = leftComp.addChild("<div class='plugin-list'></div>");
            var pluginHelp = leftComp.addChild("<div class='plugin-help'></div>");
            var comp = new Animate.Label("Plugin Description", pluginHelp);
            comp.element.addClass("heading");
            this.help = pluginHelp.addChild("<div class='info-clock'></div>");

            //Heading - right
            var comp = new Animate.Label("Add Plugins", rightComp);
            comp.element.addClass("heading");
            comp.textfield.element.prepend("<img src='media/add-behaviour.png' />");

            this.projectNext = new Animate.Button("Done", rightComp);
            this.projectNext.css({ width: 120, height: 40, "float": "right", position: "absolute", left: "265px", top: "4px" });
            this.projectNext.element.on("click", jQuery.proxy(this.onNextClick, this));

            var newPlugs = rightComp.addChild("<div class='new-plugins'></div>");
            var newPlugsHeader = newPlugs.addChild("<div class='new-plugins-header'></div>");
            this.newPlugsLower = newPlugs.addChild("<div class='new-plugins-lower'></div>");

            newPlugsHeader.element.disableSelection(true);
            newPlugsHeader.addChild("<div class='filter-item' style='pointer-events:none;'>Filters</div>");
            this.selectedFilter = newPlugsHeader.addChild("<div class='filter-item filter-item-selected'>Name</div>").element;
            newPlugsHeader.addChild("<div class='filter-item'>version</div>");
            newPlugsHeader.addChild("<div class='filter-item'>Author</div>");

            newPlugsHeader.element.on("click", jQuery.proxy(this.onFilterClick, this));

            //Server related
            //this.mServerProxy = this.onServer.bind( this );
            this.mRequest = "";
        }
        /**
        * When we click a filter button
        * @param {any} e The jQuery event object
        */
        PluginBrowser.prototype.onFilterClick = function (e) {
            var t = jQuery(e.target);

            if (!t.hasClass("filter-item"))
                return;

            if (this.selectedFilter != null)
                this.selectedFilter.removeClass("filter-item-selected");

            this.selectedFilter = t;
            this.selectedFilter.addClass("filter-item-selected");

            //Now create each of the plugin items for the actual plugins we can load.
            this.resetAvailablePlugins();
        };

        /**
        * Resets the component and its data
        */
        PluginBrowser.prototype.reset = function () {
            this.leftTop.clear();
            this.leftTop.addChild("<div><div class='proj-info-left'><img src='media/project-item.png'/></div>" + "<div class='proj-info-right'>" + "<div class='name'>Name: " + Animate.User.getSingleton().project.mName + "</div>" + "<div class='owner'>User: " + Animate.User.getSingleton().username + "</div>" + "<div class='created-by'>Last Updated: " + Animate.User.getSingleton().project.lastModified + "</div>" + "</div></div><div class='fix'></div>");

            this.pluginList.clear();

            var comp = new Animate.Label("Project Plugins", this.pluginList);
            comp.element.addClass("heading");
            comp.element.css({ "pointer-events": "none" });

            var plugins = Animate.User.getSingleton().project.plugins;
            var i = (plugins ? plugins.length : 0);
            var user = Animate.User.getSingleton();

            while (i--) {
                if (plugins[i].plan == "basic")
                    this.addProjectPluginComp(plugins[i]);
                if (plugins[i].plan != "basic" && user.planLevel > 1)
                    this.addProjectPluginComp(plugins[i]);
            }

            //Now create each of the plugin items for the actual plugins we can load.
            this.resetAvailablePlugins();
        };

        /**
        * Adds a plugin component
        * @param {IPluginDefinition} plugin
        */
        PluginBrowser.prototype.addProjectPluginComp = function (plugin) {
            var item = this.pluginList.addChild("<div class='plugin-item'><div class='inner'><img src='" + plugin.smallImage + "'>" + plugin.name + "</div><div class='close-but'>X</div><div class='fix'></div></div>");

            item.element.insertAfter(jQuery(".heading", this.pluginList.element));
            item.element.on("mouseover", jQuery.proxy(this.onOverProject, this));
            item.element.data("plugin", plugin);
            item.element.disableSelection(true);

            jQuery(".close-but", item.element).click(jQuery.proxy(this.onRemoveProject, this));

            //Remove any duplicates
            var userPlugins = Animate.User.getSingleton().project.plugins;
            var i = userPlugins.length;
            while (i--)
                if (userPlugins[i].name == plugin.name) {
                    userPlugins.splice(i, 1);
                    break;
                }
            Animate.User.getSingleton().project.plugins.push(plugin);

            return item;
        };

        /**
        * Resets the component and fills it with user plugin data
        */
        PluginBrowser.prototype.resetAvailablePlugins = function () {
            var userPlugins = Animate.User.getSingleton().project.plugins;
            this.projectNext.enabled = true;

            this.newPlugsLower.clear();
            var selectedFilter = this.selectedFilter;

            //Sort based on the filter
            __plugins.sort(function (a, b) {
                var nameA = a.name.toLowerCase();
                var nameB = b.name.toLowerCase();

                if (selectedFilter.text() == "Name") {
                    nameA = a.name.toLowerCase();
                    nameB = b.name.toLowerCase();
                } else if (selectedFilter.text() == "Version") {
                    nameA = a.version.toLowerCase();
                    nameB = b.version.toLowerCase();
                } else if (selectedFilter.text() == "Author") {
                    nameA = a.author.toLowerCase();
                    nameB = b.author.toLowerCase();
                }

                if (nameA < nameB)
                    return -1;

                if (nameA > nameB)
                    return 1;

                return 0;
            });

            var userPlan = Animate.User.getSingleton().plan;

            var len = __plugins.length;
            for (var i = 0; i < len; i++) {
                if (userPlan != Animate.UserPlanType.PLAN_GOLD && userPlan != Animate.UserPlanType.PLAN_PLATINUM && __plugins[i].plan == "premium")
                    continue;

                var alreadyAdded = false;
                var ii = (userPlugins ? userPlugins.length : 0);
                while (ii--)
                    if (userPlugins[ii].name == __plugins[i].name) {
                        alreadyAdded = true;
                        break;
                    }

                if (alreadyAdded)
                    continue;

                var item = this.newPlugsLower.addChild("<div class='plugin-item'>" + "<div class='inner'><div class='left'><img src='" + __plugins[i].smallImage + "' /></div>" + "<div class='right'>" + "<div class='name'>" + __plugins[i].name + "</div>" + "<div class='owner'>Created by " + __plugins[i].author + "</div>" + "<div class='created-by'>Version: " + __plugins[i].version + "</div>" + "<div class='desc'>" + __plugins[i].short_description + "</div>" + "</div>" + "<div class='fix'></div></div><div class='fix'></div>");

                item.element.on("mouseover", jQuery.proxy(this.onOverProject, this));
                item.element.on("click", jQuery.proxy(this.onClickProject, this));
                item.element.data("plugin", __plugins[i]);
                item.element.disableSelection(true);
            }
        };

        /**
        * When we hover over a project
        * @param {any} e The jQuery event object
        */
        PluginBrowser.prototype.onOverProject = function (e) {
            var plugin = jQuery(e.currentTarget).data("plugin");
            if (plugin)
                this.help.element.html(plugin.description);
        };

        /**
        * When we click the X on a project's plugin
        * @param {any} e The jQuery event object
        */
        PluginBrowser.prototype.onRemoveProject = function (e) {
            var comp = jQuery(e.currentTarget).parent().data("component");
            var parent = this.pluginList;

            var plugin = comp.element.data("plugin");
            var userPlugins = Animate.User.getSingleton().project.plugins;
            var i = userPlugins.length;
            while (i--)
                if (userPlugins[i].name == plugin.name) {
                    userPlugins.splice(i, 1);
                    break;
                }

            //Remove left item
            comp.element.fadeOut("slow", function () {
                parent.removeChild(comp);
                comp.dispose();
            });

            //Reset the available plugins
            var browser = this;
            this.newPlugsLower.element.fadeOut("slow", function () {
                browser.resetAvailablePlugins();
                browser.newPlugsLower.element.fadeIn("slow");
            });
        };

        /**
        * When we click on a projects plugin
        * @param {any} e The jQuery event object
        */
        PluginBrowser.prototype.onClickProject = function (e) {
            var parent = this.newPlugsLower;
            var comp = jQuery(e.currentTarget).data("component");
            var plugin = jQuery(e.currentTarget).data("plugin");
            if (plugin) {
                var addedComp = this.addProjectPluginComp(plugin);

                addedComp.element.hide();
                addedComp.element.fadeIn("slow");
                comp.element.css("pointer-events", "none");
                comp.element.fadeOut("slow", function () {
                    parent.removeChild(comp).dispose();
                });
            }
        };

        /**
        * When we click the next button
        * @param {any} e The jQuery event object
        */
        PluginBrowser.prototype.onNextClick = function (e) {
            var userPlugins = Animate.User.getSingleton().project.plugins;
            var i = userPlugins.length;

            if (i == 0) {
                Animate.MessageBox.show("You must select at least 1 plugin before you can continue.", ["Ok"], null, null);
                return;
            }

            this.projectNext.enabled = false;

            //Implement changes into DB
            var projectStr = "";
            var data = {};
            data["category"] = "plugins";
            data["command"] = "implementPlugins";
            data["projectID"] = Animate.User.getSingleton().project.id;

            while (i--)
                data["plugins[" + i + "][name]"] = userPlugins[i].name;

            this.mRequest = "implementPlugins";
            var loader = new Animate.Loader();
            loader.addEventListener(Animate.LoaderEvents.COMPLETE, this.onServer, this);
            loader.addEventListener(Animate.LoaderEvents.FAILED, this.onServer, this);
            loader.load(Animate.DB.HOST, data, false);
        };

        /**
        * This is the resonse from the server
        */
        PluginBrowser.prototype.onServer = function (response, event, sender) {
            if (response == Animate.LoaderEvents.COMPLETE) {
                if (this.mRequest == "implementPlugins") {
                    if (event.return_type == Animate.ServerResponses.ERROR) {
                        this.dispatchEvent(new PluginBrowserEvent(PluginBrowserEvents.FAILED, event.message, event.tag));
                        Animate.MessageBox.show(event.message, ["Ok"], null, null);
                        this.projectNext.enabled = true;
                    } else {
                        //Say we're good to go!
                        this.dispatchEvent(new PluginBrowserEvent(PluginBrowserEvents.PLUGINS_IMPLEMENTED, event.message, event.tag));
                    }
                }
            } else {
                //Failed - so we don't show anything
                this.dispatchEvent(new PluginBrowserEvent(PluginBrowserEvents.FAILED, event.message, event.tag));
                this.projectNext.enabled = true;
            }
        };
        return PluginBrowser;
    })(Animate.Component);
    Animate.PluginBrowser = PluginBrowser;
})(Animate || (Animate = {}));
//# sourceMappingURL=PluginBrowser.js.map
