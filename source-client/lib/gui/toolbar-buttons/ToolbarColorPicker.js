var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Animate;
(function (Animate) {
    /**
    *  Use this tool bar button to pick a colour.
    */
    var ToolbarColorPicker = (function (_super) {
        __extends(ToolbarColorPicker, _super);
        function ToolbarColorPicker(parent, text, color) {
            _super.call(this, "<div class='tab-button'></div>", parent);

            this.numberInput = this.addChild("<input class='toolbar-color' value='#ff0000'></input>");
            this.addChild("<div class='tool-bar-text'>" + text + "</div>");

            this.picker = new jscolor.color(document.getElementById(this.numberInput.id));
            this.picker.fromString(color);
        }
        Object.defineProperty(ToolbarColorPicker.prototype, "color", {
            get: /**
            * Gets or sets the colour of the toolbar button
            */
            function () {
                return parseInt(this.numberInput.element.val(), 16);
            },
            set: /**
            * Gets or sets the colour of the toolbar button
            */
            function (color) {
                this.picker.fromString(color);
            },
            enumerable: true,
            configurable: true
        });


        /**
        * Disposes of and cleans up this button
        */
        ToolbarColorPicker.prototype.dispose = function () {
            this.picker = null;
            this.numberInput = null;
        };
        return ToolbarColorPicker;
    })(Animate.Component);
    Animate.ToolbarColorPicker = ToolbarColorPicker;
})(Animate || (Animate = {}));
//# sourceMappingURL=ToolbarColorPicker.js.map
