var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Animate;
(function (Animate) {
    /**
    * A wrapper class for checkboxes
    */
    var Checkbox = (function (_super) {
        __extends(Checkbox, _super);
        /**
        * A wrapper class for checkboxes
        */
        function Checkbox(parent, text, checked, html) {
            if (typeof html === "undefined") { html = "<div class='checkbox'></div>"; }
            // Call super-class constructor
            _super.call(this, html, parent);

            this.checkbox = this.addChild("<input type='checkbox'></input>");
            this.textfield = this.addChild("<div class='text'>" + text + "</div>");

            if (checked)
                this.checkbox.element.prop("checked", checked);
        }

        Object.defineProperty(Checkbox.prototype, "checked", {
            get: /**Gets if the checkbox is checked.*/
            function () {
                return this.checkbox.element.prop("checked");
            },
            set: /**Sets if the checkbox is checked.*/
            function (val) {
                this.checkbox.element.prop("checked", val);
            },
            enumerable: true,
            configurable: true
        });


        Object.defineProperty(Checkbox.prototype, "text", {
            get: /**Gets the checkbox label text*/
            function () {
                return this.textfield.element.val();
            },
            set: /**Sets the checkbox label text*/
            function (val) {
                this.textfield.element.val(val);
            },
            enumerable: true,
            configurable: true
        });

        /**This will cleanup the component.*/
        Checkbox.prototype.dispose = function () {
            this.textfield = null;
            this.checkbox = null;

            //Call super
            _super.prototype.dispose.call(this);
        };
        return Checkbox;
    })(Animate.Component);
    Animate.Checkbox = Checkbox;
})(Animate || (Animate = {}));
//# sourceMappingURL=Checkbox.js.map
