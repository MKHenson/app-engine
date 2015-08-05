var Animate;
(function (Animate) {
    /**
    * The ListViewItem class is used in the ListView class. These represent the items you can select.
    */
    var ListViewItem = (function () {
        /**
        * @param {Array<string>} fields An array of strings. These strings will be evenly distributed between columns of a list view.
        * @param {string} smallImg The URL of an image to use that can represent the small image of this item when in Image mode of the list view
        * @param {string} largeIMG The URL of an image to use that can represent the large image of this item when in Image mode of the list view
        */
        function ListViewItem(fields, smallImg, largeIMG) {
            if (typeof smallImg === "undefined") { smallImg = ""; }
            if (typeof largeIMG === "undefined") { largeIMG = ""; }
            this._fields = fields;
            this._smallImg = smallImg;
            this._largeIMG = largeIMG;
            this._rowNum = 0;
            this.tag = null;

            this._components = [];
        }
        /**
        * This function clears the field's components
        */
        ListViewItem.prototype.clearComponents = function () {
            var i = this._components.length;
            while (i--)
                this._components[i].dispose();

            this._components = [];
        };

        /**
        * This function is used to cleanup the object before its removed from memory.
        */
        ListViewItem.prototype.dispose = function () {
            var i = this._components.length;
            while (i--)
                this._components[i].dispose();

            this._fields = null;
            this._smallImg = null;
            this._largeIMG = null;
            this._rowNum = null;
            this._components = null;
            this.tag = null;
        };

        /**
        * Creates a preview component for the list view.
        * @param {string} text Text to show under the preview
        * @param {number} imgSize The size of the image
        * @returns <Component>
        */
        ListViewItem.prototype.preview = function (text, imgSize) {
            var toRet = new Animate.Component("<div class='list-view-preview' style='width:" + (imgSize) + "px; height:" + (imgSize + 30) + "px;'><div class='image' style='width:" + imgSize + "px; height:" + imgSize + "px;'><img src='" + this.largeIMG + "' /></div><div class='info'>" + text + "</div></div>", null);
            this.components.push(toRet);

            toRet.element.data("item", this);
            return toRet;
        };

        /**
        * Creates a field component
        * @param string content The text to show inside of the field
        * @returns {Component}
        */
        ListViewItem.prototype.field = function (content) {
            var toRet = new Animate.Component("<div class='list-view-field'>" + content + "</div>", null);
            this.components.push(toRet);

            toRet.element.data("item", this);
            return toRet;
        };

        Object.defineProperty(ListViewItem.prototype, "components", {
            get: function () {
                return this._components;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ListViewItem.prototype, "fields", {
            get: function () {
                return this._fields;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ListViewItem.prototype, "smallImg", {
            get: function () {
                return this._smallImg;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ListViewItem.prototype, "largeIMG", {
            get: function () {
                return this._largeIMG;
            },
            enumerable: true,
            configurable: true
        });
        return ListViewItem;
    })();
    Animate.ListViewItem = ListViewItem;
})(Animate || (Animate = {}));
//# sourceMappingURL=ListViewItem.js.map
