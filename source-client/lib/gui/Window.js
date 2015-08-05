/// <reference path="Component.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Animate;
(function (Animate) {
    var WindowEvents = (function (_super) {
        __extends(WindowEvents, _super);
        function WindowEvents(v) {
            _super.call(this, v);
        }
        WindowEvents.HIDDEN = new WindowEvents("window_hidden");
        WindowEvents.SHOWN = new WindowEvents("window_shown");
        return WindowEvents;
    })(Animate.ENUM);
    Animate.WindowEvents = WindowEvents;

    var WindowEvent = (function (_super) {
        __extends(WindowEvent, _super);
        function WindowEvent(eventName, window) {
            _super.call(this, eventName, window);
            this.window = window;
        }
        return WindowEvent;
    })(Animate.Event);
    Animate.WindowEvent = WindowEvent;

    /**
    * This class is the base class for all windows in Animate
    */
    var Window = (function (_super) {
        __extends(Window, _super);
        /**
        * @param {number} width The width of the window in pixels
        * @param {number} height The height of the window in pixels
        * @param {boolean} autoCenter Should this window center itself on a resize event
        * @param {boolean} controlBox Does this window have a draggable title bar and close button
        * @param {string} title The text for window heading.Only applicable if we are using a control box.
        */
        function Window(width, height, autoCenter, controlBox, title) {
            if (typeof autoCenter === "undefined") { autoCenter = true; }
            if (typeof controlBox === "undefined") { controlBox = false; }
            if (typeof title === "undefined") { title = ""; }
            // Call super-class constructor
            _super.call(this, "<div class='window shadow-med' style='width:" + width + "px; height:" + height + "px;'></div>", null);
            /**
            * When we click on the close button
            * @param {any} e The jQuery event object
            */
            this.onCloseClicked = function (e) {
                this.hide();
            };

            this._autoCenter = autoCenter;
            this._controlBox = controlBox;

            if (this._controlBox) {
                this._header = this.addChild("<div class='window-control-box'></div>");
                this._headerText = this._header.addChild("<div class='window-header'>" + title + "</div>");
                this._headerCloseBut = this._header.addChild("<div class='close-but'>X</div>");
                this.addChild("<div class='fix'></div>");
                this._content = this.addChild("<div class='window-content' style='position:relative; width:" + width + "px;'></div>");
            } else
                this._content = this.addChild("<div class='window-content' style='position:relative; width:" + width + "px;'></div>");

            this._modalBackdrop = jQuery("<div class='modal-backdrop dark-color'></div>");

            //Proxies
            this._externalClickProxy = this.onStageClick.bind(this);
            this._isVisible = false;

            if (this._autoCenter) {
                this._resizeProxy = this.onWindowResized.bind(this);
                jQuery(window).on('resize', this._resizeProxy);
            }

            if (this._controlBox) {
                this._closeProxy = this.onCloseClicked.bind(this);
                this._headerCloseBut.element.on('click', this._closeProxy);
            }

            this._modalBackdrop.on('click', this.onModalClicked.bind(this));
        }
        /**
        * When the stage move event is called
        * @param {any} e The jQuery event object
        */
        Window.prototype.onStageMove = function (e) {
            this.element.css({ left: (e.pageX - e.offsetX) + "px", top: (e.pageY - e.offsetY) + "px" });
        };

        /**
        * Removes the window and modal from the DOM.
        */
        Window.prototype.hide = function () {
            if (this._isVisible == false)
                return;

            this._isVisible = false;
            jQuery("body").off("click", this._externalClickProxy);
            this._modalBackdrop.detach();
            if (this.element.parent().length != 0)
                this.element.parent().data("component").removeChild(this);

            if (this._controlBox)
                this.element.draggable("destroy");

            this.dispatchEvent(new WindowEvent(WindowEvents.HIDDEN, this));
        };

        /**
        * Shows the window by adding it to a parent.
        * @param {Component} parent The parent Component we are adding this window to
        * @param {number} x The x coordinate of the window
        * @param {number} y The y coordinate of the window
        * @param {boolean} isModal Does this window block all other user operations?
        * @param {boolean} isPopup If the window is popup it will close whenever anything outside the window is clicked
        */
        Window.prototype.show = function (parent, x, y, isModal, isPopup) {
            if (typeof parent === "undefined") { parent = null; }
            if (typeof x === "undefined") { x = NaN; }
            if (typeof y === "undefined") { y = NaN; }
            if (typeof isModal === "undefined") { isModal = false; }
            if (typeof isPopup === "undefined") { isPopup = false; }
            this._isVisible = true;
            parent = (parent === undefined || parent == null ? Animate.Application.getInstance() : parent);

            if (isNaN(x) || x === undefined) {
                this.element.css({
                    left: (jQuery("body").width() / 2 - this.element.width() / 2),
                    top: (jQuery("body").height() / 2 - this.element.height() / 2)
                });
            } else
                this.element.css({ left: x + "px", top: y + "px" });

            if (isModal) {
                parent.element.append(this._modalBackdrop);
                var bod = jQuery("body");
                this._modalBackdrop.css({ width: bod.width() + "px", height: bod.height() + "px" });
            }

            if (isPopup) {
                jQuery("body").off("click", this._externalClickProxy);
                jQuery("body").on("click", this._externalClickProxy);
            }

            parent.addChild(this);

            this.dispatchEvent(new WindowEvent(WindowEvents.SHOWN, this));

            if (this._controlBox)
                this.element.draggable({ handle: ".window-control-box", containment: "parent" });
        };

        /**
        * When we click the modal window we flash the window
        * @param {object} e The jQuery event object
        */
        Window.prototype.onModalClicked = function (e) {
            var prevParent = this.element.parent();
            this.element.detach();
            this.element.addClass("anim-shadow-focus");
            prevParent.append(this.element);
        };

        /**
        * Updates the dimensions if autoCenter is true.
        * @param {object} val
        */
        Window.prototype.onWindowResized = function (val) {
            var bod = jQuery("body");
            if (this._isVisible) {
                this._modalBackdrop.css({ width: bod.width() + "px", height: bod.height() + "px" });

                this.element.css({
                    left: (jQuery("body").width() / 2 - this.element.width() / 2),
                    top: (jQuery("body").height() / 2 - this.element.height() / 2)
                });
            }
        };

        /**
        * Hides the window if its show property is set to true
        * @param {any} e The jQuery event object
        */
        Window.prototype.onStageClick = function (e) {
            var parent = jQuery(e.target).parent();

            while (typeof (parent) !== "undefined" && parent.length != 0) {
                var comp = parent.data("component");
                if (comp == this || jQuery(e.target).is(this._modalBackdrop))
                    return;

                parent = parent.parent();
            }

            this.hide();
        };

        Object.defineProperty(Window.prototype, "content", {
            get: /** Gets the content component */
            function () {
                return this._content;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Window.prototype, "visible", {
            get: function () {
                return this._isVisible;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(Window.prototype, "headerText", {
            get: function () {
                return this._headerText.element.text();
            },
            set: function (value) {
                this._headerText.element.text(value);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Window.prototype, "modalBackdrop", {
            get: function () {
                return this._modalBackdrop;
            },
            enumerable: true,
            configurable: true
        });

        /**
        * This will cleanup the component.
        */
        Window.prototype.dispose = function () {
            if (this._closeProxy) {
                this._headerCloseBut.element.off('click', this._closeProxy);
                this._closeProxy = null;
                //this.element.draggable("destroy");
            }

            this._externalClickProxy = null;
            jQuery(window).off('resize', this._resizeProxy);
            this._modalBackdrop.off();

            this._modalBackdrop.detach();
            this._resizeProxy = null;
            this._modalBackdrop = null;
            this._headerText = null;
            this._headerCloseBut = null;
            this._header = null;

            //Call super
            _super.prototype.dispose.call(this);
        };
        return Window;
    })(Animate.Component);
    Animate.Window = Window;
})(Animate || (Animate = {}));
//# sourceMappingURL=Window.js.map
