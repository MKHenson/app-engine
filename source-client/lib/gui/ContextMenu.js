var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Animate;
(function (Animate) {
    var ContextMenuEvents = (function (_super) {
        __extends(ContextMenuEvents, _super);
        function ContextMenuEvents(v) {
            _super.call(this, v);
        }
        ContextMenuEvents.ITEM_CLICKED = new ContextMenuEvents("context_munu_item_clicked");
        return ContextMenuEvents;
    })(Animate.ENUM);
    Animate.ContextMenuEvents = ContextMenuEvents;

    var ContextMenuEvent = (function (_super) {
        __extends(ContextMenuEvent, _super);
        function ContextMenuEvent(eventName, item) {
            _super.call(this, eventName, item);

            this.text = item;
        }
        return ContextMenuEvent;
    })(Animate.Event);
    Animate.ContextMenuEvent = ContextMenuEvent;

    /**
    * A ContextMenu is a popup window which displays a list of items that can be selected.
    */
    var ContextMenu = (function (_super) {
        __extends(ContextMenu, _super);
        /**
        * @param {number} The width of the menu.
        */
        function ContextMenu(width) {
            // Call super-class constructor
            _super.call(this, width, 100);
            /**
            * Removes an item from the ContextMenu
            * @param {string} val The text of the item we are removing
            * @returns {JQuery} The jQuery representation of the item
            */
            this.removeItem = function (val) {
                var len = this.items.length;
                for (var i = 0; i < len; i++) {
                    var v = this.items[i].text();
                    if (v == val) {
                        v = this.items[i];
                        this.items.splice(i, 1);
                        v.remove();
                        return v;
                    }
                }

                return null;
            };

            this.element.addClass("context-menu");

            this.element.addClass("reg-gradient-static");
            this.element.addClass("curve-small");

            this.element.css("height", "");
            this.items = [];
            this.selectedItem = null;

            this.content.element.css({ width: "100%" });
        }
        /**
        * Cleans up the context menu
        */
        ContextMenu.prototype.dispose = function () {
            this.items = null;
            this.selectedItem = null;
            Animate.Window.prototype.dispose.call(this);
        };

        /**
        * Shows the window by adding it to a parent.
        * @param {Component} parent The parent Component we are adding this window to
        * @param {number} x The x coordinate of the window
        * @param {number} y The y coordinate of the window
        * @param {boolean} isModal Does this window block all other user operations?
        * @param {boolean} isPopup If the window is popup it will close whenever anything outside the window is clicked
        */
        ContextMenu.prototype.show = function (parent, x, y, isModal, isPopup) {
            if (typeof parent === "undefined") { parent = null; }
            if (typeof x === "undefined") { x = NaN; }
            if (typeof y === "undefined") { y = NaN; }
            if (typeof isModal === "undefined") { isModal = false; }
            if (typeof isPopup === "undefined") { isPopup = false; }
            //Get the width of the item
            var len = this.items.length;
            var body = jQuery("body");
            var clone = null;
            var currentWidth = 0;

            for (var i = 0; i < len; i++) {
                clone = this.items[i].clone();
                clone.css({ "float": "left", "display": "", "width": "auto", "position": "absolute", "left": "0px", "top": "0px" });
                body.append(clone);
                var w = clone.outerWidth();
                clone.remove();

                if (w > currentWidth)
                    currentWidth = w;
            }

            currentWidth += 5;

            this.element.css({ width: currentWidth + "px" });

            var height = jQuery(window).height();
            var width = jQuery(window).width();

            if (x + currentWidth > width)
                x = width - currentWidth;
            if (y + currentWidth > width)
                x = width - currentWidth;

            if (ContextMenu.currentContext)
                ContextMenu.currentContext.hide();

            ContextMenu.currentContext = this;
            Animate.Window.prototype.show.call(this, parent, x, y, isModal, isPopup);

            //Check if nothing is visible - if so then hide it.
            var somethingVisible = false;
            var i = this.items.length;
            while (i--) {
                if (this.items[i].is(":visible")) {
                    somethingVisible = true;
                    break;
                }
            }

            if (!somethingVisible)
                this.hide();
        };

        /**
        * Adds an item to the ContextMenu
        * @param {any} val The html (image + text) we are adding
        * @returns {JQuery} The jQuery representation of the item
        */
        ContextMenu.prototype.addItem = function (val) {
            var toAdd = jQuery("<div class='context-item'>" + val + "</div>");

            this.items.push(toAdd);
            this.content.element.append(toAdd);
            return toAdd;
        };

        /** Checks if we selected an item - if so it closes the context and dispatches the ITEM_CLICKED event.*/
        ContextMenu.prototype.onStageClick = function (e) {
            var targ = jQuery(e.target);
            if (targ.is(jQuery(".context-item"))) {
                this.onItemClicked(targ.text(), targ);
                this.dispatchEvent(new ContextMenuEvent(ContextMenuEvents.ITEM_CLICKED, targ.text()));
                this.hide();
                e.preventDefault();
                return;
            }

            _super.prototype.onStageClick.call(this, e);
        };

        /**
        * @description Called when we click an item
        * @param {string} item The text of the selected item
        * @param {JQuery} jqueryItem The jquery item
        */
        ContextMenu.prototype.onItemClicked = function (item, jqueryItem) {
        };

        Object.defineProperty(ContextMenu.prototype, "numItems", {
            get: /**
            * Gets the number of items
            * @returns {number}
            */
            function () {
                return this.items.length;
            },
            enumerable: true,
            configurable: true
        });

        /**
        * Gets an item from the menu
        * @param {string} val The text of the item we need to get
        * @returns {JQuery} jQuery object of the item
        */
        ContextMenu.prototype.getItem = function (val) {
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
        ContextMenu.prototype.clear = function () {
            var len = this.items.length;
            for (var i = 0; i < len; i++)
                this.items[i].remove();

            this.items.splice(0, len);
        };
        return ContextMenu;
    })(Animate.Window);
    Animate.ContextMenu = ContextMenu;
})(Animate || (Animate = {}));
//# sourceMappingURL=ContextMenu.js.map
