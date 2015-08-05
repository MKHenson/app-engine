var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Animate;
(function (Animate) {
    var ProjectBrowserEvents = (function (_super) {
        __extends(ProjectBrowserEvents, _super);
        function ProjectBrowserEvents(v) {
            _super.call(this, v);
        }
        ProjectBrowserEvents.COMBO = new ProjectBrowserEvents("project_browser_combo");
        return ProjectBrowserEvents;
    })(Animate.ENUM);
    Animate.ProjectBrowserEvents = ProjectBrowserEvents;

    var ProjectBrowserEvent = (function (_super) {
        __extends(ProjectBrowserEvent, _super);
        function ProjectBrowserEvent(eventName, command) {
            _super.call(this, eventName, command);
            this.command = command;
        }
        return ProjectBrowserEvent;
    })(Animate.Event);
    Animate.ProjectBrowserEvent = ProjectBrowserEvent;

    /**
    * This class is used to do administrative tasks on projects
    */
    var ProjectBrowser = (function (_super) {
        __extends(ProjectBrowser, _super);
        /**
        * @param {Component} parent The parent of the button
        */
        function ProjectBrowser(parent) {
            _super.call(this, "<div class='project-browser'></div>", parent);

            var top = this.addChild("<div></div>");
            this.element.append("<div class='fix'></div>");
            var bottom = this.addChild("<div class='project-browser-bottom'></div>");

            this._list = new Animate.ListView(bottom);

            this._list.addColumn("ID");
            this._list.addColumn("Name");
            this._list.addColumn("Description");
            this._list.addColumn("Tags");
            this._list.addColumn("Created On");
            this._list.addColumn("Last Modified");

            this._select = new Animate.ComboBox(top);
            this._select.element.addClass("light-gradient");
            this._select.addItem("Start");
            this._select.addItem("Copy");
            this._select.addItem("Create New");
            this._select.addItem("Delete");
            this._select.addItem("Open");

            this._list.setColumnWidth(1, "90px");

            this._search = top.addChild("<div class='project-browser-search'><input type='text'></input><img src='media/search.png' /><div>");
            this._selectedItem = null;
            this._selectedName = null;
            this._selectedID = null;

            this._list.addEventListener(Animate.ListViewEvents.ITEM_CLICKED, this.onItemClick, this);
            this._list.addEventListener(Animate.ListViewEvents.ITEM_DOUBLE_CLICKED, this.onDblClick, this);
            this._select.addEventListener(Animate.ListEvents.ITEM_SELECTED, this.onSelectClick, this);
        }
        /**
        * When we double click a project item
        */
        ProjectBrowser.prototype.onDblClick = function (response, event) {
            this._selectedItem = event.item;
            if (event.item) {
                this._selectedName = event.item.fields[1];
                this._selectedID = event.item.fields[0];

                this.dispatchEvent(new ProjectBrowserEvent(ProjectBrowserEvents.COMBO, "Open"));
                this._select.selectedItem = "Start";
            }
        };

        /**
        * when we select an option from the combo
        */
        ProjectBrowser.prototype.onSelectClick = function (response, event, sender) {
            if (event.item != "Start") {
                this.dispatchEvent(new ProjectBrowserEvent(ProjectBrowserEvents.COMBO, event.item));
                this._select.selectedItem = "Start";
            }
        };

        /**
        * Clears all the projects
        */
        ProjectBrowser.prototype.clearItems = function () {
            this._list.clearItems();
        };

        /**
        * When we click on one of the project items
        * @param {JQuery} e The jQuery event object
        * @param {any} item The ListViewItem that was selected.
        */
        ProjectBrowser.prototype.onItemClick = function (response, event, sender) {
            this._selectedItem = event.item;

            if (event.item) {
                this._selectedID = event.item.fields[0];
                this._selectedName = event.item.fields[1];
            }
        };

        /**
        * Fills the browser with project items
        * @param {any} data The data object sent from the server
        */
        ProjectBrowser.prototype.fill = function (data) {
            this._selectedItem = null;

            this._list.clearItems();

            var count = parseInt(data.count);
            for (var i = 0; i < count; i++) {
                var item = new Animate.ListViewItem([data[i].id, data[i].name, data[i].description, data[i].tags, data[i].created_on, data[i].last_modified], 'media/project-item.png', 'media/project-item.png');
                this._list.addItem(item);
            }
        };

        Object.defineProperty(ProjectBrowser.prototype, "selectedItem", {
            get: function () {
                return this._selectedItem;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProjectBrowser.prototype, "selectedName", {
            get: function () {
                return this._selectedName;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProjectBrowser.prototype, "selectedID", {
            get: function () {
                return this._selectedID;
            },
            enumerable: true,
            configurable: true
        });
        return ProjectBrowser;
    })(Animate.Component);
    Animate.ProjectBrowser = ProjectBrowser;
})(Animate || (Animate = {}));
//# sourceMappingURL=ProjectBrowser.js.map
