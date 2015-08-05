var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Animate;
(function (Animate) {
    var ListViewEvents = (function (_super) {
        __extends(ListViewEvents, _super);
        function ListViewEvents(v) {
            _super.call(this, v);
        }
        ListViewEvents.ITEM_CLICKED = new ListViewEvents("list_view_item_clicked");
        ListViewEvents.ITEM_DOUBLE_CLICKED = new ListViewEvents("list_view_item_double_clicked");
        return ListViewEvents;
    })(Animate.ENUM);
    Animate.ListViewEvents = ListViewEvents;

    var ColumnItem = (function () {
        function ColumnItem(text, image) {
            if (typeof image === "undefined") { image = ""; }
            this.text = text;
            this.image = image;
        }
        return ColumnItem;
    })();
    Animate.ColumnItem = ColumnItem;

    var ListViewType = (function () {
        function ListViewType(v) {
            this.value = v;
        }
        ListViewType.prototype.toString = function () {
            return this.value;
        };

        ListViewType.DETAILS = new ListViewType("details");
        ListViewType.IMAGES = new ListViewType("images");
        return ListViewType;
    })();
    Animate.ListViewType = ListViewType;

    var ListViewEvent = (function (_super) {
        __extends(ListViewEvent, _super);
        function ListViewEvent(eventType, item) {
            _super.call(this, eventType);
            this.item = item;
        }
        return ListViewEvent;
    })(Animate.Event);
    Animate.ListViewEvent = ListViewEvent;

    /**
    * The ListView class is used to display a series of {ListViewItem}s. Each item can
    * organised by a series of columns
    */
    var ListView = (function (_super) {
        __extends(ListView, _super);
        function ListView(parent) {
            // Call super-class constructor
            _super.call(this, "<div class='list-view'></div>", parent);

            this._mode = ListViewType.DETAILS;

            this._selectedItem = null;
            this._lists = [];
            this._items = [];
            this._columns = [];

            this._sortableColumn = 0;

            this._multiSelect = false;

            this._fix = this.addChild("<div class='fix'></div>");

            this._divider = this.addChild("<div class='divider'></div>");
            this._divider.element.detach();

            this._selectedColumn = null;
            this._imgSize = 100;

            //Events
            this._dClickProxy = this.onDoubleClick.bind(this);
            this._clickProxy = this.onClick.bind(this);
            this._downProxy = this.onDown.bind(this);
            this._upProxy = this.onUp.bind(this);
            this._moveProxy = this.onMove.bind(this);

            this.element.on("dblclick", this._dClickProxy);
            this.element.on("click", this._clickProxy);
            this.element.on("mousedown", this._downProxy);
        }

        Object.defineProperty(ListView.prototype, "displayMode", {
            get: /**
            * @returns {ListViewType} Either ListViewType.DETAILS or ListViewType.IMAGES
            */
            function () {
                return this._mode;
            },
            set: /**
            * Toggle between the different modes
            * @param {ListViewType} mode Either DETAILS or IMAGES mode
            */
            function (mode) {
                if (mode === undefined)
                    return;

                for (var i = 0; i < this._items.length; i++) {
                    for (var ii = 0; ii < this._items[i].components.length; ii++)
                        this._items[i].components[ii].dispose();

                    this._items[i].components.splice(0, this._items[i].components.length);
                }

                this._mode = mode;
                this.updateItems();
                return;
            },
            enumerable: true,
            configurable: true
        });

        /**
        * Called when we hold down on this component
        * @param {any} e The jQuery event object
        */
        ListView.prototype.onDown = function (e) {
            var target = jQuery(e.target);
            if (target.hasClass("dragger")) {
                this._selectedColumn = target.parent().parent();

                if (this._selectedColumn.length > 0) {
                    e.preventDefault();
                    this.element.append(this._divider.element);
                    jQuery(document).on("mousemove", this._moveProxy);
                    jQuery(document).on("mouseup", this._upProxy);

                    this._divider.element.css({
                        left: (target.position().left + (target.width() / 2)) + "px"
                    });

                    return false;
                }
            }
        };

        /**
        * Called when we move over this componeny
        * @param {any} e The jQuery event object
        */
        ListView.prototype.onMove = function (e) {
            var position = this.element.offset();
            var dividerSize = 5;

            var w = this.element.width();
            var dist = e.clientX - position.left;

            if (dist < dividerSize)
                dist = 0;
            if (dist > w - dividerSize)
                dist = w - dividerSize;

            this._divider.element.css({
                left: dist + "px"
            });
        };

        /**
        * Called when the mouse up event is fired
        * @param {any} e The jQuery event object
        */
        ListView.prototype.onUp = function (e) {
            var position = this._selectedColumn.offset();

            //var dividerSize = 5;
            var dist = e.clientX - position.left;

            this._selectedColumn.css({ width: dist + "px" });

            var newWidth = 0;
            var i = this._lists.length;
            while (i--)
                newWidth += this._lists[i].element.outerWidth();

            this.element.css({ "min-width": newWidth + "px" });

            this._divider.element.detach();
            jQuery(document).off("mousemove", this._moveProxy);
            jQuery(document).off("mouseup", this._upProxy);
        };

        ListView.prototype.onDoubleClick = function (e) {
            var listViewItem = jQuery(e.target).data("item");
            if (listViewItem) {
                //Select all components of the item we clicked on
                var i = listViewItem.components.length;
                while (i--) {
                    var comp = listViewItem.components[i];
                    comp.element.removeClass("selected");
                }

                i = listViewItem.components.length;
                while (i--) {
                    var comp = listViewItem.components[i];
                    comp.element.addClass("selected");
                }

                this.dispatchEvent(new ListViewEvent(ListViewEvents.ITEM_DOUBLE_CLICKED, listViewItem));
            }

            e.preventDefault();
            return false;
        };

        /**
        * Called when we click this component
        * @param {any} e The jQuery event object
        */
        ListView.prototype.onClick = function (e) {
            var comp = jQuery(e.target).data("component");

            if (comp instanceof Animate.ListViewHeader) {
                var i = this._lists.length;
                while (i--)
                    if (this._lists[i].children[0] == comp) {
                        this._sortableColumn = i;
                        this.updateItems();
                        return;
                    }
            } else {
                //Check if we selected an item. If we did we need to make all the items on that row selected.
                var listViewItem = jQuery(e.target).data("item");
                if (listViewItem) {
                    if (!e.ctrlKey && jQuery(e.target).hasClass("selected")) {
                        //Select all components of the item we clicked on
                        i = listViewItem.components.length;
                        while (i--) {
                            var comp = listViewItem.components[i];
                            comp.element.removeClass("selected");
                        }

                        this.dispatchEvent(new ListViewEvent(ListViewEvents.ITEM_CLICKED, null));
                        return;
                    }

                    if (this._multiSelect == false || !e.ctrlKey) {
                        var selectedItems = jQuery(".selected", this.element);
                        selectedItems.each(function () {
                            jQuery(this).removeClass("selected");
                        });
                    }

                    if (jQuery(e.target).hasClass("selected")) {
                        //Select all components of the item we clicked on
                        i = listViewItem.components.length;
                        while (i--) {
                            var comp = listViewItem.components[i];
                            comp.element.removeClass("selected");
                            this.dispatchEvent(new ListViewEvent(ListViewEvents.ITEM_CLICKED, null));
                        }
                    } else {
                        //Select all components of the item we clicked on
                        i = listViewItem.components.length;
                        while (i--) {
                            var comp = listViewItem.components[i];
                            comp.element.addClass("selected");
                        }

                        this.dispatchEvent(new ListViewEvent(ListViewEvents.ITEM_CLICKED, listViewItem));
                    }
                }
            }
        };

        /**
        * Gets all the items that are selected
        * @returns {Array<ListViewItem>}
        */
        ListView.prototype.getSelectedItems = function () {
            var items = [];
            var selectedItems = jQuery(".selected", this.element);
            selectedItems.each(function () {
                var listViewItem = jQuery(this).data("item");
                if (items.indexOf(listViewItem) == -1)
                    items.push(listViewItem);
            });

            return items;
        };

        /**
        * Sets which items must be selected. If you specify null then no items will be selected.
        */
        ListView.prototype.setSelectedItems = function (items) {
            if (items == null) {
                var selectedItems = jQuery(".selected", this.element);
                selectedItems.each(function () {
                    jQuery(this).removeClass("selected");
                });
            }
        };

        /**
        * This function is used to clean up the list
        */
        ListView.prototype.dispose = function () {
            this._selectedColumn = null;

            var i = this._lists.length;
            while (i--)
                this._lists[i].dispose();

            i = this._items.length;
            while (i--)
                this._items[i].dispose();

            this.element.off("dblclick", this._dClickProxy);
            this.element.off("click", this._clickProxy);
            jQuery(document).off("mousemove", this._moveProxy);
            jQuery(document).off("mouseup", this._upProxy);

            this._selectedItem = null;
            this._items = null;
            this._columns = null;
            this._lists = null;
            this._dClickProxy = null;
        };

        /**
        * Redraws the list with the items correctly synced with the column names
        * @returns {any}
        */
        ListView.prototype.updateItems = function () {
            this._fix.element.detach();
            var widths = [];

            //Clean up the fields
            i = this._items.length;
            while (i--)
                this._items[i].clearComponents();

            for (var i = 0; i < this._lists.length; i++) {
                widths.push(this._lists[i].element.width());
                this._lists[i].dispose();
            }

            this._lists = [];

            if (this._mode == ListViewType.DETAILS) {
                var sortableColumn = this._sortableColumn;
                var totalW = 0;

                for (var i = 0; i < this._columns.length; i++) {
                    var list = this.addChild("<div class='list' " + (widths.length > 0 ? "style='width:" + widths[i] + "px;'" : "") + "></div>");
                    this._lists.push(list);

                    if (i == this._columns.length - 1)
                        list.element.css({ "border-right": "1px solid #ccc" });

                    var header = new Animate.ListViewHeader(this._columns[i].text + (i == sortableColumn ? "   ▼" : ""), this._columns[i].image);
                    list.addChild(header);

                    var w = 0;

                    //If the list is not on the DOM we need to add to get its real width
                    var clone = header.element.clone();
                    clone.css({ "float": "left" });
                    jQuery("body").append(clone);
                    w = clone.width() + 10;
                    clone.remove();

                    if (widths.length > 0 && widths[i] > w)
                        w = widths[i];

                    totalW += w;
                    list.element.css({ "min-width": (w) + "px", "width": (w) + "px" });
                }

                this.element.append(this._fix.element);
                this.element.css({ "min-width": (totalW + 1) + "px" });

                //Sort the items based on the sortable column
                this._items.sort(function (a, b) {
                    if (sortableColumn < a.fields.length && sortableColumn < a.fields.length) {
                        var fieldA = a.fields[sortableColumn].toString().toLowerCase();
                        var fieldB = b.fields[sortableColumn].toString().toLowerCase();

                        if (fieldA < fieldB)
                            return -1;
else if (fieldB < fieldA)
                            return 1;
else
                            return 0;
                    } else
                        return 1;
                });

                for (var i = 0; i < this._items.length; i++)
                    for (var ii = 0; ii < this._items[i].fields.length; ii++)
                        if (ii < this._lists.length) {
                            var comp = this._items[i].field(this._items[i].fields[ii]);

                            this._lists[ii].addChild(comp);
                        }
            } else {
                this.element.css({ "min-width": "" });

                for (var i = 0; i < this._items.length; i++) {
                    var comp = this._items[i].preview(this._items[i].fields[1], this._imgSize);
                    this.addChild(comp);
                }
            }
        };

        /**
        * Adds a column
        * @param {string} name The name of the new column
        * @param {string} image The image of the column
        */
        ListView.prototype.addColumn = function (name, image) {
            if (typeof image === "undefined") { image = ""; }
            this._columns.push(new ColumnItem(name, image));
            this.updateItems();
        };

        /**
        * Removes a column
        * @param {string} name The name of the column to remove
        */
        ListView.prototype.removeColumn = function (name) {
            if (this._columns.indexOf(name) != -1)
                this._columns.splice(this._columns.indexOf(name, 1));

            this.updateItems();
        };

        /**
        * Adds a {ListViewItem} to this list
        * @param {ListViewItem} item The item we are adding to the list
        * @returns {ListViewItem}
        */
        ListView.prototype.addItem = function (item) {
            var toRet = item;
            this._items.push(toRet);
            item.rowNum = this._items.length;

            if (this._mode == ListViewType.DETAILS) {
                for (var i = 0; i < item.fields.length; i++)
                    if (i < this._lists.length) {
                        var comp = item.field(item.fields[i]);
                        this._lists[i].addChild(comp);
                    }
            } else {
                var comp = item.preview(item.fields[1], this._imgSize);
                this.addChild(comp);
            }

            return toRet;
        };

        /**
        * Sets the length of a column by its index
        * @param <int> columnIndex The index of the column
        * @param {string} width A CSS width property. This can be either % or px
        * @returns {ListViewItem}
        */
        ListView.prototype.setColumnWidth = function (columnIndex, width) {
            if (this._lists.length > columnIndex)
                this._lists[columnIndex].element.css("width", width);

            this.updateItems();
        };

        /**
        * Removes a {ListViewItem} from this list
        * @param {ListViewItem} item The {ListViewItem} to remove.
        * @param {boolean} dispose If set to true the item will be disposed
        * @returns {ListViewItem}
        */
        ListView.prototype.removeItem = function (item, dispose) {
            if (typeof dispose === "undefined") { dispose = true; }
            this._items.splice(this._items.indexOf(item), 1);
            if (dispose)
                item.dispose();

            return item;
        };

        /**
        * This function is used to remove all items from the list.
        * @param {boolean} dispose If set to true the item will be disposed
        */
        ListView.prototype.clearItems = function (dispose) {
            if (typeof dispose === "undefined") { dispose = true; }
            var i = this._items.length;
            while (i--)
                if (dispose)
                    this._items[i].dispose();

            this._items.splice(0, this._items.length);
        };

        Object.defineProperty(ListView.prototype, "items", {
            get: function () {
                return this._items;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ListView.prototype, "lists", {
            get: function () {
                return this._lists;
            },
            enumerable: true,
            configurable: true
        });
        return ListView;
    })(Animate.Component);
    Animate.ListView = ListView;
})(Animate || (Animate = {}));
//# sourceMappingURL=ListView.js.map
