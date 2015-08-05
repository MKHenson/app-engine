var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Animate;
(function (Animate) {
    var ListEvents = (function (_super) {
        __extends(ListEvents, _super);
        function ListEvents(v) {
            _super.call(this, v);
        }
        ListEvents.ITEM_SELECTED = new ListEvents("list_item_selected");
        return ListEvents;
    })(Animate.ENUM);
    Animate.ListEvents = ListEvents;

    var ListEvent = (function (_super) {
        __extends(ListEvent, _super);
        function ListEvent(eventName, item) {
            _super.call(this, eventName, item);

            this.item = item;
        }
        return ListEvent;
    })(Animate.Event);
    Animate.ListEvent = ListEvent;

    /**
    * Use this class to create a select list.
    */
    var List = (function (_super) {
        __extends(List, _super);
        /**
        * @param {Component} parent The parent component of this list
        * @param {string} html An optional set of HTML to use. The default is <div class='list-box'></div>
        * @param {string} selectHTML
        * @param {boolean} isDropDown
        */
        function List(parent, html, selectHTML, isDropDown) {
            if (typeof html === "undefined") { html = "<div class='list-box'></div>"; }
            if (typeof selectHTML === "undefined") { selectHTML = "<select class='list' size='6'></select>"; }
            if (typeof isDropDown === "undefined") { isDropDown = false; }
            if (isDropDown)
                selectHTML = "<select></select>";

            // Call super-class constructor
            _super.call(this, html, parent);

            this.selectBox = this.addChild(selectHTML);
            this.selectProxy = this.onSelection.bind(this);
            this.selectBox.element.on("change", this.selectProxy);
            this.items = [];
        }
        /**
        * Called when a selection is made
        * @param <object> val Called when we make a selection
        */
        List.prototype.onSelection = function (val) {
            this.dispatchEvent(new ListEvent(ListEvents.ITEM_SELECTED, this.selectedItem));
        };

        /**
        * Adds an item to the list
        * @param {string} val The text of the item
        * @returns {JQuery} The jQuery object created
        */
        List.prototype.addItem = function (val) {
            var toAdd = jQuery("<option value='" + this.items.length + "'>" + val + "</option>");
            this.items.push(toAdd);
            this.selectBox.element.append(toAdd);
            return toAdd;
        };

        /**
        * Sorts  the  list alphabetically
        */
        List.prototype.sort = function () {
            var items = this.items;
            var i = items.length;
            while (i--)
                items[i].detach();

            //jQuery( "option", this.element ).each( function ()
            //{
            //	jQuery( this ).detach();
            //	items.push( jQuery( this ) );
            //});
            //items.sort( function ( a, b )
            //{
            //	var textA = a.text().toUpperCase();
            //	var textB = b.text().toUpperCase();
            //	return ( textA < textB ) ? -1 : ( textA > textB ) ? 1 : 0;
            //});
            this.items = items.sort(function (a, b) {
                var textA = a.text().toUpperCase();
                var textB = b.text().toUpperCase();
                return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
            });

            var len = items.length;
            for (var i = 0; i < len; i++)
                this.selectBox.element.append(items[i]);
        };

        /**
        * Removes an item from the list
        * @param <object> val The text of the item to remove
        * @returns <object> The jQuery object
        */
        List.prototype.removeItem = function (val) {
            var len = this.items.length;
            for (var i = 0; i < len; i++) {
                var text = this.items[i].text();
                if (text == val) {
                    var item = this.items[i];
                    this.items.splice(i, 1);
                    item.detach();
                    return item;
                }
            }

            return null;
        };

        /**
        * Gets the number of list items
        * @returns {number} The number of items
        */
        List.prototype.numItems = function () {
            return this.items.length;
        };


        Object.defineProperty(List.prototype, "selectedItem", {
            get: /**
            * Gets thee selected item from the list.
            * @returns {JQuery} The selected jQuery object
            */
            function () {
                //Return selected list item
                var len = this.items.length;
                for (var i = 0; i < len; i++)
                    if (this.items[i].prop("selected"))
                        return this.items[i].text();

                return null;
            },
            set: /**
            * Sets thee selected item from the list.
            * @param {string} val The text of the item
            */
            function (val) {
                jQuery("select option", this.element).filter(function () {
                    //may want to use $.trim in here
                    return jQuery(this).text() == val;
                }).prop('selected', true);
            },
            enumerable: true,
            configurable: true
        });


        Object.defineProperty(List.prototype, "selectedIndex", {
            get: /**
            * Gets the selected item index from the list by its
            * index.
            * @returns {number} The selected index or -1 if nothing was found.
            */
            function () {
                //Return selected list item by index
                var len = this.items.length;
                for (var i = 0; i < len; i++)
                    if (this.items[i].prop("selected") === true)
                        return i;

                return -1;
            },
            set: /**
            * Sets the selected item index from the list by its index.
            * @param {number} val The text of the item
            */
            function (val) {
                if (typeof (val) !== "undefined") {
                    //Remove any previously selected items
                    var len = this.items.length;
                    for (var i = 0; i < len; i++)
                        this.items[i].prop("selected", false);

                    this.items[val].prop("selected", true);
                }
            },
            enumerable: true,
            configurable: true
        });

        /**
        * Gets item from the list by its value
        * @param {string} val The text of the item
        * @returns {JQuery} The jQuery object
        */
        List.prototype.getItem = function (val) {
            var len = this.items.length;
            for (var i = 0; i < len; i++) {
                var v = this.items[i].text();
                if (v == val)
                    return this.items[i];
            }

            return null;
        };

        /**
        * Removes all items
        */
        List.prototype.clearItems = function () {
            var len = this.items.length;
            for (var i = 0; i < len; i++)
                this.items[i].remove();

            this.items.splice(0, len);
        };

        /**
        * Diposes and cleans up this component and all its child <Component>s
        */
        List.prototype.dispose = function () {
            this.selectProxy = null;
            this.selectBox.element.off();
            this.items = null;
            this.selectBox = null;

            //Call super
            _super.prototype.dispose.call(this);
        };
        return List;
    })(Animate.Component);
    Animate.List = List;
})(Animate || (Animate = {}));
//# sourceMappingURL=List.js.map
