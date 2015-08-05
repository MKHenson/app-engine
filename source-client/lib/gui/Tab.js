var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Animate;
(function (Animate) {
    var TabEvents = (function (_super) {
        __extends(TabEvents, _super);
        function TabEvents(v) {
            _super.call(this, v);
        }
        TabEvents.SELECTED = new TabEvents("tab_selected");
        TabEvents.REMOVED = new TabEvents("tab_removed");
        return TabEvents;
    })(Animate.ENUM);
    Animate.TabEvents = TabEvents;

    var TabEvent = (function (_super) {
        __extends(TabEvent, _super);
        function TabEvent(eventName, pair) {
            _super.call(this, eventName, pair);
            this.cancel = false;
            this._pair = pair;
        }
        Object.defineProperty(TabEvent.prototype, "pair", {
            get: function () {
                return this._pair;
            },
            enumerable: true,
            configurable: true
        });
        return TabEvent;
    })(Animate.Event);
    Animate.TabEvent = TabEvent;

    /**
    * The Tab component will create a series of selectable tabs which open specific tab pages.
    */
    var Tab = (function (_super) {
        __extends(Tab, _super);
        function Tab(parent) {
            // Call super-class constructor
            _super.call(this, "<div class='tab'></div>", parent);

            this._tabsDiv = new Animate.Component("<div class='tabs-div'></div>", this);
            this.pagesDiv = new Animate.Component("<div class='pages-div'></div>", this);
            this.pagesDiv.addLayout(new Animate.Fill(0, 0, 0, -25));

            this._tabs = [];
            this.selectedTab = null;
            this.element.on("click", jQuery.proxy(this.onClick, this));

            this.dropButton = new Animate.Component("<div class='tabs-drop-button'>&#x21E3;</div>", this._tabsDiv);

            if (!Tab.contextMenu)
                Tab.contextMenu = new Animate.ContextMenu(100);

            this.element.disableSelection(true);
            Tab.contextMenu.addEventListener(Animate.ContextMenuEvents.ITEM_CLICKED, this.onContext.bind(this));

            this.addLayout(new Animate.Fill());
        }
        /**
        * When we click the tab
        * @param {TabPair} tab The tab pair object containing both the label and page <Comonent>s
        */
        Tab.prototype.onTabSelected = function (tab) {
            var event = new TabEvent(TabEvents.SELECTED, tab);
            this.dispatchEvent(event);
            if (event.cancel === false)
                tab.onSelected();
        };

        /**
        * @description When the context menu is clicked.
        */
        Tab.prototype.onContext = function (response, event) {
            var len = this._tabs.length;
            for (var i = 0; i < len; i++)
                if (this._tabs[i].name == event.text) {
                    var p = this._tabs[i].tabSelector.element.parent();
                    this._tabs[i].tabSelector.element.detach();
                    p.prepend(this._tabs[i].tabSelector.element);

                    this.selectTab(this._tabs[i]);
                    return;
                }
        };

        /**
        * Get the tab to select a tab page
        * @param {TabPair} tab
        */
        Tab.prototype.selectTab = function (tab) {
            var len = this._tabs.length;
            for (var i = 0; i < len; i++) {
                if (tab == this._tabs[i] || this._tabs[i].name == tab.name) {
                    if (this.selectedTab != null) {
                        this.selectedTab.tabSelector.element.removeClass("tab-selected");
                        this.selectedTab.page.element.detach();
                    }

                    this.selectedTab = this._tabs[i];
                    this.selectedTab.tabSelector.element.addClass("tab-selected");
                    this.pagesDiv.element.append(this.selectedTab.page.element);
                    this.onTabSelected(this.selectedTab);
                    return this.selectedTab;
                }
            }

            return null;
        };

        /**
        * Called just before a tab is closed. If you return false it will cancel the operation.
        * @param {TabPair} tabPair
        * @returns {boolean}
        */
        Tab.prototype.onTabPairClosing = function (tabPair) {
            return true;
        };

        /**
        * When we click the tab
        * @param {any} e
        */
        Tab.prototype.onClick = function (e) {
            var targ = jQuery(e.target);
            if (targ.is(jQuery(".tab-close"))) {
                var text = targ.parent().text();
                text = text.substring(0, text.length - 1);

                var tabPair = this.getTab(text);
                if (this.onTabPairClosing(tabPair))
                    this.removeTab(tabPair, true);

                return;
            } else if (targ.is(jQuery(".tabs-drop-button"))) {
                Tab.contextMenu.clear();

                var len = this._tabs.length;
                for (var i = 0; i < len; i++)
                    Tab.contextMenu.addItem(this._tabs[i].name);

                e.preventDefault();

                Tab.contextMenu.show(Animate.Application.getInstance(), e.pageX, e.pageY, false, true);
                return false;
            } else if (targ.is(jQuery(".tab-selector"))) {
                var len = this._tabs.length;
                for (var i = 0; i < len; i++) {
                    var text = "";
                    if (targ.data("canClose")) {
                        text = targ.text();
                        text = text.substring(0, text.length - 1);
                    } else
                        text = targ.text();

                    if (this._tabs[i].name == text) {
                        if (this.selectedTab != null) {
                            this.selectedTab.tabSelector.element.removeClass("tab-selected");
                            this.selectedTab.page.element.detach();
                        }

                        this.selectedTab = this._tabs[i];
                        this.selectedTab.tabSelector.element.addClass("tab-selected");
                        this.pagesDiv.element.append(this.selectedTab.page.element);
                        this.onTabSelected(this.selectedTab);
                        return;
                    }
                }
            }
        };

        /**
        * When we update the tab - we move the dop button to the right of its extremities.
        */
        Tab.prototype.update = function () {
            this.element.css("overflow", "hidden");
            Animate.Component.prototype.update.call(this);

            this.dropButton.element.css({
                left: (this.dropButton.element.parent().width() - this.dropButton.element.width()) + "px",
                top: "0px"
            });

            var tabs = this._tabs;
            var len = tabs.length;
            for (var i = 0; i < len; i++)
                tabs[i].onResize();
        };

        Tab.prototype.addTab = function (val, canClose) {
            canClose = (canClose === undefined ? true : canClose);

            if (this.selectedTab != null) {
                this.selectedTab.tabSelector.element.removeClass("tab-selected");
                this.selectedTab.page.element.detach();
            }

            var page = new Animate.Component("<div class='tab-page'></div>", this.pagesDiv);
            var tab = new Animate.Component("<div class='tab-selector tab-selected'><span class='text'>" + (val instanceof Animate.TabPair ? val.name : val) + "</span></div>", this._tabsDiv);
            if (canClose) {
                new Animate.Component("<div class='tab-close'>X</div>", tab);
                tab.element.data("canClose", true);
            }

            var toAdd = null;
            if (val instanceof Animate.TabPair) {
                toAdd = val;
                toAdd.tabSelector = tab;
                toAdd.page = page;
            } else
                toAdd = new Animate.TabPair(tab, page, val);

            this.selectedTab = toAdd;
            this._tabs.push(toAdd);
            this.onTabSelected(this.selectedTab);

            tab.element.trigger("click");

            toAdd.onAdded();

            return toAdd;
        };

        /**
        * Gets a tab pair by name.
        * @param {string} val The label text of the tab
        * @returns {TabPair} The tab pair containing both the label and page {Component}s
        */
        Tab.prototype.getTab = function (val) {
            var i = this._tabs.length;
            while (i--)
                if (this._tabs[i].name == val)
                    return this._tabs[i];

            return null;
        };

        /**
        * This will cleanup the component.
        */
        Tab.prototype.dispose = function () {
            this._tabsDiv = null;
            this.pagesDiv = null;

            var len = this._tabs.length;
            for (var i = 0; i < len; i++)
                this._tabs[i].dispose();

            this.pagesDiv = null;
            this._tabs = null;
            this.selectedTab = null;

            //Call super
            _super.prototype.dispose.call(this);
        };

        /**
        * Removes all items from the tab. This will call dispose on all components.
        */
        Tab.prototype.clear = function () {
            while (this._tabs.length > 0)
                this.removeTab(this._tabs[0], true);
        };

        Tab.prototype.removeTab = function (val, dispose) {
            dispose = (dispose === undefined ? true : dispose);
            var len = this._tabs.length;
            for (var i = 0; i < len; i++) {
                if (this._tabs[i] == val || this._tabs[i].name == val) {
                    var event = new TabEvent(TabEvents.REMOVED, this._tabs[i]);
                    this._tabs[i].onRemove(event);
                    if (event.cancel)
                        return;

                    var v = this._tabs[i];
                    this._tabs.splice(i, 1);

                    this.onTabPairClosing(v);
                    this._tabsDiv.removeChild(v.tabSelector);
                    this.pagesDiv.removeChild(v.page);

                    if (dispose)
                        v.dispose();

                    if (this.selectedTab == v) {
                        this.selectedTab = null;
                        if (len > 1)
                            this._tabs[0].tabSelector.element.trigger("click");
                    }
                    return v;
                }
            }

            return null;
        };

        Object.defineProperty(Tab.prototype, "tabs", {
            get: function () {
                return this._tabs;
            },
            enumerable: true,
            configurable: true
        });
        return Tab;
    })(Animate.Component);
    Animate.Tab = Tab;
})(Animate || (Animate = {}));
//# sourceMappingURL=Tab.js.map
