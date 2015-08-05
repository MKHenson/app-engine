var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Animate;
(function (Animate) {
    /**
    * Use this class to create a drop down box of items.
    */
    var ComboBox = (function (_super) {
        __extends(ComboBox, _super);
        function ComboBox(parent) {
            if (typeof parent === "undefined") { parent = null; }
            _super.call(this, parent, "<div class='combo-box'></div>", "<select class='combo'></select>");
        }
        return ComboBox;
    })(Animate.List);
    Animate.ComboBox = ComboBox;
})(Animate || (Animate = {}));
//# sourceMappingURL=ComboBox.js.map
