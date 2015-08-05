/// <reference path="MenuList.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Animate;
(function (Animate) {
    var LogType = (function (_super) {
        __extends(LogType, _super);
        function LogType(v) {
            _super.call(this, v);
        }
        LogType.MESSAGE = new LogType("message");
        LogType.WARNING = new LogType("warning");
        LogType.ERROR = new LogType("error");
        return LogType;
    })(Animate.ENUM);
    Animate.LogType = LogType;

    /**
    * The Logger is a singleton class used to write message's to Animate's log window.
    */
    var Logger = (function (_super) {
        __extends(Logger, _super);
        function Logger(parent) {
            if (Logger._singleton != null)
                throw new Error("The Logger class is a singleton. You need to call the Logger.getSingleton() function.");

            Logger._singleton = this;

            // Call super-class constructor
            _super.call(this, parent);

            this.element.addClass("logger");

            this.context = new Animate.ContextMenu(150);
            this.context.addItem("<img src='media/cross.png' />Clear");
            this.mDocker = null;

            this.warningFlagger = jQuery("<img class='logger-warning fade-animation' src='media/warning-button.png' />");

            //Add listeners
            this.mContextProxy = this.onContext.bind(this);

            jQuery(document).on("contextmenu", this.mContextProxy);
            this.context.addEventListener(Animate.ContextMenuEvents.ITEM_CLICKED, this.onContextSelect, this);

            this.element.disableSelection(true);

            this.warningFlagger.on("click", jQuery.proxy(this.onIconClick, this));
        }
        /**
        * @type public mfunc onIconClick
        * When we click the error warning
        * @extends <Logger>
        */
        Logger.prototype.onIconClick = function () {
            this.mDocker.setActiveComponent(this, true);
            this.warningFlagger.detach();
        };

        /**
        * @type public mfunc getPreviewImage
        * This is called by a controlling ScreenManager class. An image string needs to be returned
        * which will act as a preview of the component that is being viewed or hidden.
        * @extends <Logger>
        * @returns <string>
        */
        Logger.prototype.getPreviewImage = function () {
            return "media/logger.png";
        };

        /**
        * This is called by a controlling Docker class when the component needs to be shown.
        */
        Logger.prototype.onShow = function () {
            this.warningFlagger.detach();
            this.element.data("preview").removeClass("fade-animation");
        };

        /**
        * This is called by a controlling Docker class when the component needs to be hidden.
        */
        Logger.prototype.onHide = function () {
        };

        /**
        * Each IDock item needs to implement this so that we can keep track of where it moves.
        * @returns {Docker}
        */
        Logger.prototype.getDocker = function () {
            return this.mDocker;
        };

        /**
        * Each IDock item needs to implement this so that we can keep track of where it moves.
        * @param {Docker} val
        */
        Logger.prototype.setDocker = function (val) {
            this.mDocker = val;
        };

        /**
        * Called when the context menu is about to open
        */
        Logger.prototype.onContextSelect = function (response, event, sender) {
            if (event.text == "Clear") {
                //Unselect all other items
                this.clearItems();
            }
        };

        /**
        * Called when the context menu is about to open
        */
        Logger.prototype.onContext = function (e) {
            //Now hook the context events
            var targ = jQuery(e.target);
            if (targ.is(jQuery(".menu-list-item")) || targ.is(jQuery(".menu-list"))) {
                if (targ.is(jQuery(".menu-list-item")) && targ.parent().data("component") != this)
                    return;
else if (targ.is(jQuery(".menu-list")) && targ.data("component") != this)
                    return;

                e.preventDefault();
                this.context.show(Animate.Application.getInstance(), e.pageX, e.pageY, false, true);
            }
        };

        /**
        * Adds an item to the Logger
        * @param {string} val The text to show on the logger.
        * @param {any} tag An optional tag to associate with the log.
        * @param {string} type The type of icon to associate with the log. By default its Logger.MESSAGE
        */
        Logger.prototype.logMessage = function (val, tag, type) {
            if (typeof type === "undefined") { type = LogType.MESSAGE; }
            var img = null;
            if (type == LogType.MESSAGE)
                img = "media/tick.png";
else if (type == LogType.ERROR)
                img = "media/cross.png";
else
                img = "media/warning-20.png";

            if (type != LogType.MESSAGE && this.element.data("preview") != this.mDocker.activePreview) {
                var offset = this.mDocker.element.offset();
                jQuery("body").append(this.warningFlagger);
                this.warningFlagger.css({ left: offset.left, top: offset.top - this.warningFlagger.height() });

                this.element.data("preview").addClass("fade-animation");
            }

            var toAdd = this.addItem(img, val);
            toAdd.data("tag", tag);
            return toAdd;
        };

        /**
        * Clears all the log messages
        */
        Logger.prototype.clearItems = function () {
            this.warningFlagger.detach();
            this.element.data("preview").removeClass("fade-animation");

            var len = this.items.length;
            for (var i = 0; i < len; i++)
                this.items[i].data("tag", null);

            _super.prototype.clearItems.call(this);
        };

        Logger.getSingleton = /**
        * Gets the singleton instance.
        * @param {Component} parent
        * @returns {Logger}
        */
        function (parent) {
            if (!Logger._singleton)
                new Logger(parent);

            return Logger._singleton;
        };
        return Logger;
    })(Animate.MenuList);
    Animate.Logger = Logger;
})(Animate || (Animate = {}));
//# sourceMappingURL=Logger.js.map
