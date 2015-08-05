var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Animate;
(function (Animate) {
    var Toolbar = (function (_super) {
        __extends(Toolbar, _super);
        function Toolbar(parent) {
            if (Toolbar._singleton != null)
                throw new Error("The Toolbar class is a singleton. You need to call the TooltipManager.getSingleton() function.");

            Toolbar._singleton = this;

            _super.call(this, "<div class='toolbar'></div>", parent);

            this._topMenu = this.addChild("<div class='tool-bar-top'></div>");
            this._bottomMenu = this.addChild("<div class='tool-bar-bottom'></div>");

            //Create the containers
            this._tabHomeContainer = this.createTab("Animate", true);

            //Create buttons
            var group = this.createGroup(this._tabHomeContainer);
            this._home = this.createGroupButton("Home", "media/animate-home.png", group);

            //group = this.createGroup( this.tabHomeContainer );
            this._save = this.createGroupButton("Save", "media/save.png", group);

            //this.open = this.createGroupButton( "Open", "media/open.png", group );
            group = this.createGroup(this._tabHomeContainer);
            this._copy = this.createGroupButton("Copy", "media/copy.png", group);
            this._cut = this.createGroupButton("Cut", "media/cut.png", group);
            this._paste = this.createGroupButton("Paste", "media/paste.png", group);
            this._deleteBut = this.createGroupButton("Delete", "media/delete.png", group);

            //Grid related
            group = this.createGroup(this._tabHomeContainer);
            this._snapping = this.createGroupButton("Snapping", "media/snap.png", group);

            group = this.createGroup(this._tabHomeContainer);
            this._run = this.createGroupButton("Run", "media/play.png", group);
            this._build = this.createGroupButton("Settings", "media/build.png", group);
            this._htmlBut = this.createGroupButton("HTML", "media/html.png", group);
            this._cssBut = this.createGroupButton("CSS", "media/css.png", group);

            group = this.createGroup(this._tabHomeContainer);
            this._addBehaviour = this.createGroupButton("New Behaviour", "media/add-behaviour.png", group);

            //Create plugin button
            group = this.createGroup(this._tabHomeContainer);
            this._privileges = this.createGroupButton("Privileges", "media/privaledges.png", group);

            group = this.createGroup(this._tabHomeContainer);
            this._files = this.createGroupButton("File Manager", "media/plug-detailed.png", group);

            this._copy.enabled = false;
            this._cut.enabled = false;
            this._paste.enabled = false;
            this._deleteBut.enabled = false;
            this._save.enabled = false;
            this._addBehaviour.enabled = false;
            this._run.enabled = false;
            this._htmlBut.enabled = false;
            this._cssBut.enabled = false;
            this._build.enabled = false;
            this._privileges.enabled = false;
            this._files.enabled = false;

            this._copyPasteToken = null;

            this.element.on("click", jQuery.proxy(this.onClick, this));
            this.element.disableSelection(true);

            this._currentContainer = this._tabHomeContainer;
            this._currentTab = this._tabHomeContainer.element.data("tab").element.data("component");
            this._topMenu.element.on("click", jQuery.proxy(this.onMajorTab, this));

            //This plugin does not yet work with 'on' so we have to still use bind
            jQuery(document).bind('keydown', 'Ctrl+s', this.onKeyDown.bind(this));
            jQuery(document).bind('keydown', 'Ctrl+c', this.onKeyDown.bind(this));
            jQuery(document).bind('keydown', 'Ctrl+x', this.onKeyDown.bind(this));
            jQuery(document).bind('keydown', 'Ctrl+v', this.onKeyDown.bind(this));

            this.element.disableSelection(true);
        }
        /**
        * This is called when an item on the canvas has been selected
        * @param {Component} item
        */
        Toolbar.prototype.itemSelected = function (item) {
            if (this._copyPasteToken)
                this._paste.enabled = true;
else
                this._paste.enabled = false;

            if (item instanceof Animate.Behaviour || item instanceof Animate.Link) {
                this._copy.enabled = true;
                this._cut.enabled = true;
                this._deleteBut.enabled = true;
            } else {
                this._copy.enabled = false;
                this._cut.enabled = false;
                this._deleteBut.enabled = false;
            }
        };

        /**
        * This is called when we have loaded and initialized a new project.
        */
        Toolbar.prototype.newProject = function () {
            this._addBehaviour.enabled = true;
            this._save.enabled = true;
            this._run.enabled = true;
            this._files.enabled = true;
            this._htmlBut.enabled = true;
            this._cssBut.enabled = true;
            this._build.enabled = true;
            this._privileges.enabled = true;
        };

        /**
        * Called when we click one of the top toolbar tabs.
        * @param {any} e
        */
        Toolbar.prototype.onMajorTab = function (e) {
            var container = jQuery(e.target).data("container");
            if (container != null && container != this._currentContainer) {
                this._currentContainer.element.slideUp("fast", function () {
                    jQuery(this).hide();
                    jQuery(this).css({ left: "0px", top: "0px" });

                    var parent = jQuery(this).parent();
                    jQuery(this).detach();
                    parent.append(jQuery(this));
                });

                this._currentContainer = container;
                this._currentContainer.element.show();
                this._currentContainer.element.css({ left: "0px", top: "0px" });

                this._currentTab.element.removeClass("tool-tab-selected");
                jQuery(e.target).addClass("tool-tab-selected");
                this._currentTab = jQuery(e.target).data("component");
            }
        };

        /**
        * Called when the tool bar is clicked.
        * @param {any} e The jQuery event object
        */
        Toolbar.prototype.onClick = function (e) {
            var comp = jQuery(e.target).data("component");

            if (comp == this._addBehaviour)
                Animate.NewBehaviourForm.getSingleton().show();
else if (comp == this._home) {
                Animate.Splash.getSingleton().reset();
                Animate.Splash.getSingleton().show();
            } else if (comp == this._snapping) {
                if (this._snapping.element.hasClass("selected")) {
                    this._snapping.element.removeClass("selected");
                    Animate.Canvas.snapping = false;
                } else {
                    this._snapping.element.addClass("selected");
                    Animate.Canvas.snapping = true;
                }
            } else if (comp == this._privileges)
                Animate.UserPrivilegesForm.getSingleton().show();
else if (comp == this._save)
                Animate.User.getSingleton().project.saveAll();
else if (comp == this._build)
                Animate.BuildOptionsForm.getSingleton().show();
else if (comp == this._run) {
                Animate.PluginManager.getSingleton().callRun();
                Animate.ImportExport.getSingleton().run();
            } else if (comp == this._files) {
                Animate.FileViewerForm.getSingleton().showForm(null, null);
            } else if (comp == this._htmlBut)
                Animate.CanvasTab.getSingleton().addSpecialTab("HTML", Animate.CanvasTabType.HTML);
else if (comp == this._cssBut)
                Animate.CanvasTab.getSingleton().addSpecialTab("CSS", Animate.CanvasTabType.CSS);

            if (Animate.CanvasTab.getSingleton().currentCanvas instanceof Animate.Canvas) {
                var canvas = Animate.CanvasTab.getSingleton().currentCanvas;
                if (this._copyPasteToken && comp == this._paste) {
                    canvas.openFromDataObject(this._copyPasteToken, false, true);
                    canvas.dispatchEvent(new Animate.CanvasEvent(Animate.CanvasEvents.MODIFIED, canvas));
                } else if (Animate.Canvas.lastSelectedItem != null && comp == this._copy) {
                    var toCopy = [];

                    var i = canvas.children.length;
                    while (i--)
                        if (canvas.children[i].selected)
                            toCopy.push(canvas.children[i]);

                    this._copyPasteToken = canvas.buildDataObject(toCopy);
                    canvas.buildDataObject(toCopy);
                    this._paste.enabled = true;
                } else if (Animate.Canvas.lastSelectedItem != null && comp == this._cut) {
                    var toCopy = [];

                    var i = canvas.children.length;
                    while (i--)
                        if (canvas.children[i].selected)
                            toCopy.push(canvas.children[i]);

                    this._copyPasteToken = canvas.buildDataObject(toCopy);
                    Animate.Canvas.lastSelectedItem.dispose();

                    canvas.dispatchEvent(Animate.CanvasEvents.MODIFIED, canvas);

                    this._paste.enabled = true;
                } else if (comp == this._deleteBut) {
                    var i = canvas.children.length;
                    while (i--)
                        if (canvas.children[i].disposed != null && canvas.children[i].selected)
                            canvas.children[i].onDelete();

                    canvas.removeItems();
                }
            }
        };

        /**
        * This function is used to create a new group on the toolbar
        * @param {string} text The text of the new tab
        * @param {boolean} text The text of the new tab
        * @returns {Component} Returns the {Component} object representing the tab
        */
        Toolbar.prototype.createTab = function (text, isSelected) {
            if (typeof isSelected === "undefined") { isSelected = false; }
            var topTab = this._topMenu.addChild("<div class='tool-tab " + (isSelected ? "tool-tab-selected" : "") + "'>" + text + "</div>");

            var btmContainer = this._bottomMenu.addChild("<div class='tab-container'></div>");

            if (!isSelected)
                btmContainer.element.hide();

            topTab.element.data("container", btmContainer);
            btmContainer.element.data("tab", topTab);

            return btmContainer;
        };

        /**
        * Called when the key is pushed down
        * @param {any} event
        */
        Toolbar.prototype.onKeyDown = function (event) {
            if (event.data == 'Ctrl+s')
                this._save.element.trigger("click");
else if (event.data == 'Ctrl+c')
                this._copy.element.trigger("click");
            if (event.data == 'Ctrl+x')
                this._cut.element.trigger("click");
            if (event.data == 'Ctrl+v')
                this._paste.element.trigger("click");

            return false;
        };

        /**
        * Removes a tab by its name
        * @param {string} text The name of the tab
        */
        Toolbar.prototype.removeTab = function (text) {
            var children = this._topMenu.children;
            var i = children.length;

            while (i--)
                if (children[i].element.text() == text) {
                    children[i].element.data("container").dispose();
                    children[i].dispose();
                    return;
                }
        };

        /**
        * This function is used to create a new group on the toolbar
        * @param {Component} tab The {Component} tab object which represents the parent of this group.
        * @returns {Component} Returns the {Component} object representing the group
        */
        Toolbar.prototype.createGroup = function (tab) {
            return tab.addChild("<div class='tool-bar-group'></div>");
        };

        /**
        * Use this function to create a group button for the toolbar
        * @param <string> text The text for the button
        * @param <string> image An image URL for the button icon
        * @param <jQuery> group The jQuery object representing the group
        * @param <string> html If set this html will replace the image.
        * @returns {Component} Returns the Component object representing the button
        */
        Toolbar.prototype.createGroupButton = function (text, image, group, html) {
            if (typeof image === "undefined") { image = null; }
            if (typeof group === "undefined") { group = null; }
            if (typeof html === "undefined") { html = null; }
            return group.addChild("<div class='tab-button'><div>" + (html ? html : "<img src='" + image + "' />") + "</div><div class='tool-bar-text'>" + text + "</div></div>");
        };

        /**
        * Use this function to create a group button for the toolbar
        * @param {Component} parent The parent that will contain the drop down
        * @param {Array<ToolbarItem>} items An array of items to list
        * @returns {Component} Returns the Component object representing the button
        */
        Toolbar.prototype.createDropDownButton = function (parent, items) {
            var toRet = new Animate.ToolbarDropDown(parent, items);
            return toRet;
        };

        /**
        * Use this function to create a group button for the toolbar
        * @param {Component} parent The parent that will contain the drop down
        * @param {string} text The under the button
        * @param {string} color The hex colour as a string
        * @returns {Component} Returns the Component object representing the button
        */
        Toolbar.prototype.createColorButton = function (parent, text, color) {
            var toRet = new Animate.ToolbarColorPicker(parent, text, color);
            return toRet;
        };

        Toolbar.getSingleton = /**
        * Gets the singleton instance
        */
        function (parent) {
            if (Toolbar._singleton === undefined)
                Toolbar._singleton = new Toolbar(parent);

            return Toolbar._singleton;
        };

        Object.defineProperty(Toolbar.prototype, "save", {
            get: function () {
                return this._save;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Toolbar.prototype, "copy", {
            get: function () {
                return this._copy;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Toolbar.prototype, "paste", {
            get: function () {
                return this._paste;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Toolbar.prototype, "cut", {
            get: function () {
                return this._cut;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Toolbar.prototype, "deleteBut", {
            get: function () {
                return this._deleteBut;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Toolbar.prototype, "snapping", {
            get: function () {
                return this._snapping;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Toolbar.prototype, "run", {
            get: function () {
                return this._run;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Toolbar.prototype, "build", {
            get: function () {
                return this._build;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Toolbar.prototype, "htmlBut", {
            get: function () {
                return this._htmlBut;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Toolbar.prototype, "cssBut", {
            get: function () {
                return this._cssBut;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Toolbar.prototype, "addBehaviour", {
            get: function () {
                return this._addBehaviour;
            },
            enumerable: true,
            configurable: true
        });
        return Toolbar;
    })(Animate.Component);
    Animate.Toolbar = Toolbar;
})(Animate || (Animate = {}));
//# sourceMappingURL=Toolbar.js.map
