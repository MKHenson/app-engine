var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Animate;
(function (Animate) {
    /**
    * A small component that represents a text - value pair
    */
    var LabelVal = (function (_super) {
        __extends(LabelVal, _super);
        /**
        * @param {Component} parent The parent component
        * @param {string} text The label text
        * @param {Component} val The component we are pairing with the label
        * @param {any} css An optional css object to apply to the val component
        */
        function LabelVal(parent, text, val, css) {
            if (typeof css === "undefined") { css = null; }
            // Call super-class constructor
            _super.call(this, "<div class='label-val'></div>", parent);

            this.label = new Animate.Label(text, this);
            this._val = val;
            this.element.append(this._val.element);
            this.element.append("<div class='fix'></div>");

            if (css)
                this._val.element.css(css);
        }
        /**This will cleanup the component.*/
        LabelVal.prototype.dispose = function () {
            this.label.dispose();
            this.val.dispose();

            this.label = null;
            this._val = null;

            //Call super
            _super.prototype.dispose.call(this);
        };

        Object.defineProperty(LabelVal.prototype, "val", {
            get: function () {
                return this._val;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(LabelVal.prototype, "text", {
            get: /**Gets the label text*/
            function () {
                return this.label.text;
            },
            enumerable: true,
            configurable: true
        });
        return LabelVal;
    })(Animate.Component);
    Animate.LabelVal = LabelVal;
})(Animate || (Animate = {}));
//# sourceMappingURL=LabelVal.js.map
