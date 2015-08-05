var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Animate;
(function (Animate) {
    var OkCancelFormEvents = (function (_super) {
        __extends(OkCancelFormEvents, _super);
        function OkCancelFormEvents(v) {
            _super.call(this, v);
        }
        OkCancelFormEvents.CONFIRM = new OkCancelFormEvents("ok_cancel_confirm");
        return OkCancelFormEvents;
    })(Animate.ENUM);
    Animate.OkCancelFormEvents = OkCancelFormEvents;

    var OkCancelFormEvent = (function (_super) {
        __extends(OkCancelFormEvent, _super);
        function OkCancelFormEvent(eventName, text) {
            _super.call(this, eventName, text);
            this.text = text;
        }
        return OkCancelFormEvent;
    })(Animate.Event);
    Animate.OkCancelFormEvent = OkCancelFormEvent;

    /**
    * A simple form which holds a heading, content and OK / Cancel buttons.
    */
    var OkCancelForm = (function (_super) {
        __extends(OkCancelForm, _super);
        /**
        * @param {number} width The width of the form
        * @param {number} height The height of the form
        * @param {boolean} autoCenter Should this window center itself on a resize event
        * @param {boolean} controlBox Does this window have a draggable title bar and close button
        * @param {string} title The text for window heading. Only applicable if we are using a control box.
        */
        function OkCancelForm(width, height, autoCenter, controlBox, title, hideCancel) {
            if (typeof width === "undefined") { width = 400; }
            if (typeof height === "undefined") { height = 400; }
            if (typeof autoCenter === "undefined") { autoCenter = true; }
            if (typeof controlBox === "undefined") { controlBox = false; }
            if (typeof title === "undefined") { title = ""; }
            if (typeof hideCancel === "undefined") { hideCancel = false; }
            // Call super-class constructor
            _super.call(this, width, height, autoCenter, controlBox, title);
            this.element.addClass("curve-med");

            this.element.css("height", "");

            //this.heading = new Label( this.content, "OkCancelForm" );
            this.okCancelContent = new Animate.Component("<div class='content'></div>", this.content);
            this.mButtonContainer = new Animate.Component("<div class='button-container'></div>", this.content);
            this.mOk = new Animate.Button("Ok", this.mButtonContainer);
            this.mCancel = new Animate.Button("Cancel", this.mButtonContainer);

            //Set button height and width
            this.mOk.css({ width: "70px", height: "30px", "margin-right": "3px" });
            this.mCancel.css({ width: "70px", height: "30px" });

            if (hideCancel)
                this.mCancel.element.hide();

            this.mOk.element.on("click", this.OnButtonClick.bind(this));
            this.mCancel.element.on("click", this.OnButtonClick.bind(this));

            this.keyProxy = this.onKeyDown.bind(this);
        }
        /**
        * Called when we click one of the buttons. This will dispatch the event OkCancelForm.CONFIRM
        * and pass the text either for the ok or cancel buttons.
        * @param {any} e The jQuery event
        */
        OkCancelForm.prototype.OnButtonClick = function (e) {
            this.dispatchEvent(new OkCancelFormEvent(OkCancelFormEvents.CONFIRM, jQuery(e.target).text()));
            this.hide();
        };

        /**
        * Hides the window
        */
        OkCancelForm.prototype.hide = function () {
            _super.prototype.hide.call(this);

            jQuery("body").off("keydown", this.keyProxy);
        };

        /**
        * This function is used to cleanup the object before its removed from memory.
        */
        OkCancelForm.prototype.dispose = function () {
            this.mOk.element.off();
            this.mCancel.element.off();
            jQuery("body").off("keydown", this.keyProxy);

            this.content = null;
            this.mButtonContainer = null;
            this.mOk = null;
            this.mCancel = null;
            this.keyProxy = null;
            this.okCancelContent = null;

            //Call super
            _super.prototype.dispose.call(this);
        };

        /**
        * Shows the window by adding it to a parent.
        * @param {Component} parent The parent Component we are adding this window to
        * @param {number} x The x coordinate of the window
        * @param {number} y The y coordinate of the window
        * @param {boolean} isModal Does this window block all other user operations?
        * @param {boolean} isPopup If the window is popup it will close whenever anything outside the window is clicked
        */
        OkCancelForm.prototype.show = function (parent, x, y, isModal, isPopup) {
            if (typeof parent === "undefined") { parent = null; }
            if (typeof x === "undefined") { x = NaN; }
            if (typeof y === "undefined") { y = NaN; }
            if (typeof isModal === "undefined") { isModal = true; }
            if (typeof isPopup === "undefined") { isPopup = false; }
            var x = jQuery("body").width() / 2 - this.element.width() / 2;
            var y = jQuery("body").height() / 2 - this.element.height() / 2;

            if (y + this.element.height() > jQuery("body").height())
                y = jQuery("body").height() - this.element.height();
            if (x + this.element.width() > jQuery("body").width())
                x = jQuery("body").width() - this.element.width();

            _super.prototype.show.call(this, null, x, y, true, false);

            jQuery("body").on("keydown", this.keyProxy);

            this.onWindowResized(null);
        };

        /**
        * Catch the key down events.
        * @param {any} e The jQuery event object
        */
        OkCancelForm.prototype.onKeyDown = function (e) {
            if (e.keyCode == 13)
                this.mOk.element.trigger("click");
        };
        return OkCancelForm;
    })(Animate.Window);
    Animate.OkCancelForm = OkCancelForm;
})(Animate || (Animate = {}));
//# sourceMappingURL=OkCancelForm.js.map
