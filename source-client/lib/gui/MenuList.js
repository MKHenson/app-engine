var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Animate;
(function (Animate) {
    var MenuListEvents = (function (_super) {
        __extends(MenuListEvents, _super);
        function MenuListEvents(v) {
            _super.call(this, v);
        }
        MenuListEvents.ITEM_CLICKED = new MenuListEvents("menu_list_item_clicked");
        return MenuListEvents;
    })(Animate.ENUM);
    Animate.MenuListEvents = MenuListEvents;

    /**
    * A specially designed type of list
    */
    var MenuList = (function (_super) {
        __extends(MenuList, _super);
        function MenuList(parent) {
            // Call super-class constructor
            _super.call(this, "<div class='menu-list'></div>", parent);

            this._items = [];
            this.element.on("click", jQuery.proxy(this.onClick, this));
            this.selectedItem = null;
        }
        /**
        * Adds an HTML item
        * @returns {JQuery} A jQuery object containing the HTML.
        */
        MenuList.prototype.addItem = function (img, val) {
            var toRet = jQuery("<div class='menu-list-item'>" + (img ? "<img src='" + img + "' />" : "") + "<span class='menu-list-text'>" + val + "</span></div>");
            this._items.push(toRet);
            this.element.append(toRet);
            return toRet;
        };

        /**
        * Removes an  item from this list
        * @param {JQuery} item The jQuery object we are removing
        */
        MenuList.prototype.removeItem = function (item) {
            if (item == this.selectedItem)
                this.dispatchEvent(MenuListEvents.ITEM_CLICKED, "");

            this._items.splice(jQuery.inArray(item, this.items), 1);
            item.remove();
        };

        /**
        * Clears all the items added to this list
        */
        MenuList.prototype.clearItems = function () {
            var len = this.items.length;
            for (var i = 0; i < len; i++) {
                this._items[i].off();
                this._items[i].detach();
            }

            this._items.splice(0, len);
        };

        /**
        * Checks if we selected an item - if so it closes the context and dispatches the ITEM_CLICKED event.
        * @param {any} e The jQuery event object
        */
        MenuList.prototype.onClick = function (e) {
            if (this.selectedItem)
                this.selectedItem.removeClass("menu-item-selected");

            this.selectedItem = null;

            var targ = jQuery(e.target);
            if (targ.is(jQuery(".menu-list-item"))) {
                this.selectedItem = targ;
                this.selectedItem.addClass("menu-item-selected");
                this.dispatchEvent(MenuListEvents.ITEM_CLICKED, targ.text());

                e.preventDefault();
                return;
            } else
                this.dispatchEvent(MenuListEvents.ITEM_CLICKED, "");
        };

        Object.defineProperty(MenuList.prototype, "items", {
            get: function () {
                return this._items;
            },
            enumerable: true,
            configurable: true
        });
        return MenuList;
    })(Animate.Component);
    Animate.MenuList = MenuList;
})(Animate || (Animate = {}));
//# sourceMappingURL=MenuList.js.map
