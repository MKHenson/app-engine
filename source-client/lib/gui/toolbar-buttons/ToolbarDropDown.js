var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Animate;
(function (Animate) {
    /**
    * The interface for all layout objects.
    */
    var ToolbarItem = (function () {
        /**
        * @param {string} img The image path.
        * @param {string} text The text to use in the item.
        */
        function ToolbarItem(img, text) {
            this.img = img;
            this.text = text;
        }
        return ToolbarItem;
    })();
    Animate.ToolbarItem = ToolbarItem;

    var ToolbarDropDownEvent = (function (_super) {
        __extends(ToolbarDropDownEvent, _super);
        function ToolbarDropDownEvent(v) {
            _super.call(this, v);
        }
        ToolbarDropDownEvent.ITEM_CLICKED = new ToolbarDropDownEvent("toolbar_dropdown_item_clicked");
        return ToolbarDropDownEvent;
    })(Animate.ENUM);
    Animate.ToolbarDropDownEvent = ToolbarDropDownEvent;

    /**
    *  A toolbar button for selection a list of options
    */
    var ToolbarDropDown = (function (_super) {
        __extends(ToolbarDropDown, _super);
        /**
        * @param {Component} parent The parent of this toolbar
        * @param {Array<ToolbarItem>} items An array of items to list e.g. [{img:"./img1.png", text:"option 1"}, {img:"./img2.png", text:"option 2"}]
        */
        function ToolbarDropDown(parent, items) {
            _super.call(this, "<div class='tab-button'></div>", parent);
            /**
            * Called when the mouse is down on the DOM
            * @param {any} e The jQuery event
            */
            this.onStageUp = function (e) {
                var body = jQuery("body");
                body.off("mousedown", this.stageDownProxy);

                var comp = jQuery(e.target).data("component");
                this.popupContainer.element.detach();

                if (comp) {
                    var i = this.items.length;
                    var item = comp.element.data("item");

                    while (i--) {
                        if (item == this.items[i]) {
                            this.setItem(item);
                            return;
                        }
                    }
                }
            };

            this.activeComp = this.addChild("<div><img src='" + items[0].img + "' /></div><div class='tool-bar-text'>" + items[0].text + "</div>");

            this.items = items;

            this.popupContainer = new Animate.Component("<div class='tool-bar-dropdown shadow-med'></div>");

            var i = items.length;
            while (i--) {
                var comp = this.popupContainer.addChild("<div class='tab-button'><div><img src='" + items[i].img + "' /></div><div class='tool-bar-text'>" + items[i].text + "</div></div>");
                comp.element.data("item", items[i]);
                items[i].comp = comp;
            }

            this.selectedItem = items[0];
            this.stageDownProxy = this.onStageUp.bind(this);
            this.clickProxy = this.onClick.bind(this);

            this.element.on("click", this.clickProxy);
        }
        /**
        * Adds an item the drop down. The item must be an object with both img and text vars. eg: { img:"", text:"" }
        * @param {any} item The item to add.
        * @returns {Component}
        */
        ToolbarDropDown.prototype.addItem = function (item) {
            var comp = this.popupContainer.addChild("<div class='tab-button'><div><img src='" + item.img + "' /></div><div class='tool-bar-text'>" + item.text + "</div></div>");
            comp.element.data("item", item);
            item.comp = comp;

            this.items.push(item);
            return comp;
        };

        /**
        * Adds an item the drop down. The item must be an object with both img and text vars. eg: { img:"", text:"" }
        * @param {any} val This can be either the item object itself, its text or its component.
        * @param {boolean} dispose Set this to true if you want delete the item
        * @returns {Component} Returns the removed item component or null
        */
        ToolbarDropDown.prototype.removeItem = function (val, dispose) {
            if (typeof dispose === "undefined") { dispose = true; }
            var i = this.items.length;
            var items = this.items;
            while (i--)
                if (items[i] == val || items[i].text == val || items[i].comp == val) {
                    if (dispose)
                        items[i].comp.dispose();
else
                        items[i].element.detach();

                    items.splice(i, 1);
                    return items[i];
                }

            return null;
        };

        /**
        * Clears all the items
        * @param {boolean} dispose Set this to true if you want to delete all the items from memory
        */
        ToolbarDropDown.prototype.clear = function (dispose) {
            if (typeof dispose === "undefined") { dispose = true; }
            var i = this.items.length;
            var items = this.items;
            while (i--) {
                if (dispose)
                    items[i].comp.dispose();
else
                    items[i].element.detach();
            }

            items.splice(0, items.length);
        };

        /**
        * Sets the selected item
        * @param {any} item
        */
        ToolbarDropDown.prototype.setItem = function (item) {
            this.element.html("<div><img src='" + item.img + "' /></div><div class='tool-bar-text'>" + item.text + "</div>");
            this.dispatchEvent(new Animate.Event(ToolbarDropDownEvent.ITEM_CLICKED));
            this.selectedItem = item;
            return;
        };

        /**
        * When we click the main button
        * @param {any} e The jQuery event oject
        */
        ToolbarDropDown.prototype.onClick = function (e) {
            var comp = jQuery(e.target).data("component");
            var offset = comp.element.offset();

            var body = jQuery("body");
            body.off("mousedown", this.stageDownProxy);
            body.on("mousedown", this.stageDownProxy);

            this.popupContainer.element.css({ top: offset.top + this.element.height(), left: offset.left });
            body.append(this.popupContainer.element);
        };

        /**
        * Cleans up the component
        */
        ToolbarDropDown.prototype.dispose = function () {
            var i = this.items.length;
            while (i--)
                this.items[i].comp.dispose();

            this.popupContainer.dispose();
            this.element.off("click", this.clickProxy);
            this.clickProxy = null;
            this.items = null;
            this.popupContainer = null;
            this.selectedItem = null;

            //Call super
            _super.prototype.dispose.call(this);
        };
        return ToolbarDropDown;
    })(Animate.Component);
    Animate.ToolbarDropDown = ToolbarDropDown;
})(Animate || (Animate = {}));
//# sourceMappingURL=ToolbarDropDown.js.map
