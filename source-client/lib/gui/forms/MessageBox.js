var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Animate;
(function (Animate) {
    var MessageBoxEvents = (function (_super) {
        __extends(MessageBoxEvents, _super);
        function MessageBoxEvents(v) {
            _super.call(this, v);
        }
        MessageBoxEvents.BUTTON_CLICKED = new MessageBoxEvents("message_box_button_clicked");
        return MessageBoxEvents;
    })(Animate.ENUM);
    Animate.MessageBoxEvents = MessageBoxEvents;

    /**
    * A window to show a blocking window with a message to the user.
    */
    var MessageBox = (function (_super) {
        __extends(MessageBox, _super);
        function MessageBox() {
            _super.call(this, 400, 200, true, false, null);

            if (MessageBox._singleton != null)
                throw new Error("The MessageBox class is a singleton. You need to call the MessageBox.getSingleton() function.");

            MessageBox._singleton = this;

            this.element.addClass("message-box");

            this.element.css({ height: "" });
            this.mCaption = this.addChild(new Animate.Label("", null));
            this.element.append("<div class='fix'></div>");
            this.buttonsDiv = new Animate.Component("<div class='buttons'></div>", this);

            this.mButtons = null;
            this.mButtonComps = [];
            this.mCallback = null;
            this.mContext = null;

            //Hook events
            jQuery(window).on('resize', this.onResize.bind(this));
        }
        /**
        * Hide the window when ok is clicked.
        * @param {any} e The jQuery event object
        */
        MessageBox.prototype.onButtonClick = function (e) {
            this.hide();
            this.dispatchEvent(MessageBoxEvents.BUTTON_CLICKED, jQuery(e.target).data("component").text);
            if (this.mCallback)
                this.mCallback.call(this.mContext ? this.mContext : this, jQuery(e.target).data("component").text);
        };

        /**
        * When the window resizes we make sure the component is centered
        * @param {any} e The jQuery event object
        */
        MessageBox.prototype.onResize = function (e) {
            if (this.visible) {
                this.element.css({
                    left: (jQuery("body").width() / 2 - this.element.width() / 2),
                    top: (jQuery("body").height() / 2 - this.element.height() / 2)
                });
            }
        };

        MessageBox.show = /**
        * Static function to show the message box
        * @param {string} caption The caption of the window
        * @param {Array<string>} buttons An array of strings which act as the forms buttons
        * @param { ( text : string ) => void} callback A function to call when a button is clicked
        * @param {any} context The function context (ie the caller object)
        */
        function (caption, buttons, callback, context) {
            var box = MessageBox.getSingleton();
            box.mCaption.text = caption;
            box.mCallback = callback;
            box.mContext = context;

            for (var i = 0; i < box.mButtonComps.length; i++)
                box.mButtonComps[i].dispose();
            box.mButtonComps.splice(0, box.mButtonComps.length);
            box.buttonsDiv.element.empty();

            if (!buttons) {
                buttons = new Array();
                buttons.push("Ok");
            }

            box.mButtons = buttons;

            for (var i = 0; i < box.mButtons.length; i++) {
                var button = new Animate.Button(box.mButtons[i], box.buttonsDiv);
                button.element.css({ width: "80px", height: "30px", margin: "0 auto", "float": "left", "margin": "5px 5px 5px 0" });
                button.textfield.element.css({ top: "6px" });
                button.element.on('click', jQuery.proxy(box.onButtonClick, box));
                box.mButtonComps.push(button);
            }

            box.buttonsDiv.element.css({ "width": (box.mButtons.length * 90) + "px", "margin": "0 auto" });

            //Center and show the box
            box.show(Animate.Application.getInstance(), (jQuery("body").width() / 2 - box.element.width() / 2), (jQuery("body").height() / 2 - box.element.height() / 2), true);
        };

        MessageBox.getSingleton = /**
        * Gets the message box singleton
        * @returns {MessageBox}
        */
        function () {
            if (!MessageBox._singleton)
                new MessageBox();

            return MessageBox._singleton;
        };
        return MessageBox;
    })(Animate.Window);
    Animate.MessageBox = MessageBox;
})(Animate || (Animate = {}));
//# sourceMappingURL=MessageBox.js.map
