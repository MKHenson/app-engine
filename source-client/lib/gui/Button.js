var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Animate;
(function (Animate) {
    /**
    * A simple button class
    */
    var Button = (function (_super) {
        __extends(Button, _super);
        /**
        * @param {string} The button text
        * @param {Component} parent The parent of the button
        * @param {number} width The width of the button (optional)
        * @param {number} height The height of the button (optional)
        */
        function Button(text, parent, html, width, height) {
            if (typeof html === "undefined") { html = "<div class='button reg-gradient curve-small'></div>"; }
            if (typeof width === "undefined") { width = 70; }
            if (typeof height === "undefined") { height = 30; }
            _super.call(this, text, parent, html);

            var h = this.element.height();
            var th = this.textfield.element.height();
            this.textfield.element.css("top", h / 2 - th / 2);
            this.element.disableSelection(true);
            this.element.css({ width: width + "px", height: height + "px", margin: "3px" });
        }
        /**
        * A shortcut for jQuery's css property.
        */
        Button.prototype.css = function (propertyName, value) {
            //Call super
            var toRet = this.element.css(propertyName, value);

            var h = this.element.height();
            var th = this.textHeight;

            this.textfield.element.css("top", h / 2 - th / 2);

            return toRet;
        };

        /**This will cleanup the component.*/
        Button.prototype.dispose = function () {
            //Call super
            Animate.Label.prototype.dispose.call(this);

            this.textfield = null;
        };

        Object.defineProperty(Button.prototype, "selected", {
            get: /**
            * Get or Set if the component is selected. When set to true a css class of 'selected' is added to the {Component}
            */
            function () {
                if (this.element.hasClass("button-selected"))
                    return true;
else
                    return false;
            },
            set: /**
            * Get or Set if the component is selected. When set to true a css class of 'selected' is added to the {Component}
            */
            function (val) {
                if (val)
                    this.element.addClass("button-selected");
else
                    this.element.removeClass("button-selected");
            },
            enumerable: true,
            configurable: true
        });

        return Button;
    })(Animate.Label);
    Animate.Button = Button;
})(Animate || (Animate = {}));
//# sourceMappingURL=Button.js.map
