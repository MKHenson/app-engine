var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Animate;
(function (Animate) {
    /**
    * A simple {Component} that you can use to get user input by using the text function
    */
    var InputBox = (function (_super) {
        __extends(InputBox, _super);
        /**
        * @param {Component} parent The parent <Component> to which we add this box
        * @param {string} text The text of the input box
        * @param {boolean} isTextArea True if this is a text area (for larger text)
        * @param {boolean} isPassword True if this needs to be obscured for passwords
        * @param {string} html
        */
        function InputBox(parent, text, isTextArea, isPassword, html) {
            if (typeof isTextArea === "undefined") { isTextArea = false; }
            if (typeof isPassword === "undefined") { isPassword = false; }
            if (typeof html === "undefined") { html = "<div class='input-box'></div>"; }
            // Call super-class constructor
            _super.call(this, html, parent);

            if (isTextArea)
                this._textfield = this.addChild("<textarea></textarea>");
else if (isPassword)
                this._textfield = this.addChild("<input type='password' />");
else
                this._textfield = this.addChild("<input type='text' />");

            this.text = text;
            return this._limit = null;
        }
        /**
        * Called when the text property is changed. This function will only fire if a limit has been
        * set with the limitCharacters(val) function.
        * @param {any} e
        */
        InputBox.prototype.onTextChange = function (e) {
            var text = this._textfield.element.val();
            if (text.length > this._limit)
                this._textfield.element.val(text.substring(0, this._limit));
        };


        Object.defineProperty(InputBox.prototype, "limitCharacters", {
            get: /**
            * Use this function to get a limit on how many characters can be entered in this input
            * @returns {number} val The integer limit of characters
            */
            function () {
                return this._limit;
            },
            set: /**
            * Use this function to set a limit on how many characters can be entered in this input
            * @param {number} val The integer limit of characters
            */
            function (val) {
                this._limit = val;
                if (isNaN(this._limit) || this._limit == 0 || this._limit == null)
                    this._textfield.element.off();
else
                    this._textfield.element.on("input", jQuery.proxy(this.onTextChange, this));
            },
            enumerable: true,
            configurable: true
        });


        Object.defineProperty(InputBox.prototype, "text", {
            get: /**
            * @returns {string}
            */
            function () {
                return this._textfield.element.val();
            },
            set: /**
            * @param {string} val
            */
            function (val) {
                this._textfield.element.val(val);
            },
            enumerable: true,
            configurable: true
        });

        /**
        * Highlights and focuses the text of this input
        * @param {boolean} focusInView If set to true the input will be scrolled to as well as selected. This is not
        * always desireable because the input  might be off screen on purpose.
        */
        InputBox.prototype.focus = function (focusInView) {
            if (typeof focusInView === "undefined") { focusInView = false; }
            if (focusInView)
                this._textfield.element.focus();

            this._textfield.element.select();
            Animate.Application.getInstance().focusObj = this;
        };

        /**
        * This will cleanup the component.
        */
        InputBox.prototype.dispose = function () {
            this._textfield = null;

            //Call super
            _super.prototype.dispose.call(this);
        };

        Object.defineProperty(InputBox.prototype, "textfield", {
            get: function () {
                return this._textfield;
            },
            enumerable: true,
            configurable: true
        });
        return InputBox;
    })(Animate.Component);
    Animate.InputBox = InputBox;
})(Animate || (Animate = {}));
//# sourceMappingURL=InputBox.js.map
