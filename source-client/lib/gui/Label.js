var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Animate;
(function (Animate) {
    /**
    * A simple label wrapper. This creates a div that has a textfield sub div. the
    * subdiv is the DOM element that actually contains the text.
    */
    var Label = (function (_super) {
        __extends(Label, _super);
        function Label(text, parent, html) {
            if (typeof html === "undefined") { html = "<div class='label'></div>"; }
            _super.call(this, html, parent);
            this._text = text;
            this.textfield = this.addChild("<div class='textfield'>" + text + "</div>");
        }
        Object.defineProperty(Label.prototype, "text", {
            get: /**
            * Gets the text of the label
            */
            function () {
                return this._text;
            },
            set: /**
            * Sets the text of the label
            */
            function (val) {
                this._text = val;
                this.textfield.element.html(val);
            },
            enumerable: true,
            configurable: true
        });


        /**
        * This will cleanup the {Label}
        */
        Label.prototype.dispose = function () {
            this.textfield = null;

            //Call super
            _super.prototype.dispose.call(this);
        };

        Object.defineProperty(Label.prototype, "textHeight", {
            get: /**
            * Returns the text height, in pixels, of this label. Use this function sparingly as it adds a clone
            * of the element to the body, measures the text then removes the clone. This is so that we get the text even if
            * the <Component> is not on the DOM
            * @extends <Label>
            * @returns <number>
            */
            function () {
                var clone = this.textfield.element.clone();
                clone.css({ width: this.element.width() });
                jQuery("body").append(clone);
                var h = clone.height();
                clone.remove();
                return h;
            },
            enumerable: true,
            configurable: true
        });
        return Label;
    })(Animate.Component);
    Animate.Label = Label;
})(Animate || (Animate = {}));
//# sourceMappingURL=Label.js.map
