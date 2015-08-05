var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="Logger.ts" />
var Animate;
(function (Animate) {
    /**
    * A Docker is used in Animate so that we can divide up screen real estate. A box is added to a parent component
    * which, when hovered or dragged, will enabled the user to move components around or explore hidden sections
    * of the application.
    */
    var Docker = (function (_super) {
        __extends(Docker, _super);
        function Docker(parent) {
            // Call super-class constructor
            _super.call(this, "<div class='screen-manager light-gradient shadow-small curve-small'></div>", parent);

            this.activeComponent = null;
            this._activePreview = null;

            this.rollout = jQuery("<div class='roll-out animate-all light-gradient shadow-small curve-small'></div>");

            this.mComponents = [];
            this.mPreviews = [];

            this.element.on("mouseenter", jQuery.proxy(this.onEnter, this));
            this.element.on("mouseleave", jQuery.proxy(this.onOut, this));

            this.startProxy = this.onStart.bind(this);
            this.stopProxy = this.onStop.bind(this);
            this.clickPreview = this.onClick.bind(this);
            this.dropProxy = this.onObjectDropped.bind(this);

            this.element.droppable({ drop: this.dropProxy, hoverClass: "hover-over" });
        }
        /** When we click on a preview.*/
        Docker.prototype.onClick = function (e) {
            var comp = jQuery(e.target).data("component");
            if (comp) {
                this.removeComponent(comp);
                this.addComponent(comp, true);
            }
        };

        /** When we start draggin.*/
        Docker.prototype.onStart = function (e) {
            var managers = jQuery(".screen-manager");
            managers.removeClass("light-gradient");
            managers.addClass("drag-targets");
            managers.css({ opacity: 1 });
        };

        /** When we stop draggin.*/
        Docker.prototype.onStop = function (e) {
            var managers = jQuery(".screen-manager");
            managers.addClass("light-gradient");
            managers.removeClass("drag-targets");
            managers.css({ opacity: "" });
        };

        /** Called when the mouse is over this element.*/
        Docker.prototype.onEnter = function (e) {
            if (this.mComponents.length > 1)
                this.element.append(this.rollout);

            this.rollout.css({ left: -(this.rollout.width() + 5) + "px" });

            this.rollout.stop();
            this.rollout.show();
            this.rollout.css("opacity", 1);
        };

        /** Called when the mouse leaves this element.*/
        Docker.prototype.onOut = function (e) {
            this.rollout.stop();
            this.rollout.fadeOut();
        };

        /**Called when a draggable object is dropped onto the canvas.*/
        Docker.prototype.onObjectDropped = function (event, ui) {
            var comp = jQuery(ui.draggable).data("component");
            var manager = jQuery(ui.draggable).data("Docker");
            if (comp && manager) {
                var parent = this.parent;

                manager.removeComponent(comp);
                this.addComponent(comp, true);

                Animate.Application.getInstance().update();
                //this.onEnter(null);
            }
        };

        /** Call this function to update the manager.*/
        Docker.prototype.update = function () {
            //Call super
            Animate.Component.prototype.update.call(this, false);

            var parent = this.parent.element;
            if (parent.length != 0) {
                var w = parent.width();
                var h = parent.height();

                this.element.css({ left: (w - this.element.width() - 15) + "px", top: 6 + "px" });
            }
        };

        /** Gets the singleton instance. */
        Docker.prototype.setActiveComponent = function (comp, attach) {
            if (typeof attach === "undefined") { attach = false; }
            if (this.activeComponent) {
                var parent = this.activeComponent.parent;

                if (parent)
                    parent.removeChild(this.activeComponent);
            }
            if (this._activePreview) {
                this._activePreview.detach();
                this.rollout.append(this._activePreview);
            }
            this.activeComponent = comp;
            this._activePreview = comp.element.data("preview");

            if (attach) {
                this.parent.addChild(comp);
                comp.onShow();
            }

            this.element.append(this._activePreview);
        };

        /** Removes an IDockItem from the manager */
        Docker.prototype.removeComponent = function (comp, completeRemoval) {
            if (typeof completeRemoval === "undefined") { completeRemoval = false; }
            comp.setDocker(null);
            var preview = comp.element.data("preview");
            this.mComponents.splice(jQuery.inArray(comp, this.mComponents), 1);
            this.mPreviews.splice(jQuery.inArray(preview, this.mPreviews), 1);

            if (completeRemoval)
                preview.remove();
else
                preview.detach();

            comp.onHide();

            if (this._activePreview == comp.element.data("preview"))
                this._activePreview = null;

            if (comp == this.activeComponent && this.mComponents.length > 0)
                this.setActiveComponent(this.mComponents[0]);
else if (comp == this.activeComponent)
                this.activeComponent = null;
        };

        /** Adds a IDockItem to the manager */
        Docker.prototype.addComponent = function (comp, attach) {
            if (jQuery.inArray(comp, this.mComponents) != -1)
                return;

            this.mComponents.push(comp);

            comp.setDocker(this);

            //Create the preview jquery object
            var toAdd = null;
            if (!comp.element.data("preview")) {
                toAdd = jQuery("<div class='screen-manager-preview'><img src='" + comp.getPreviewImage() + "'></div>");
                toAdd.draggable({ start: this.startProxy, stop: this.stopProxy, opacity: 0.7, cursor: "move", helper: "clone", revert: "invalid", appendTo: "body", containment: "body", zIndex: 9999 });
            } else
                toAdd = comp.element.data("preview");

            comp.element.data("preview", toAdd);
            toAdd.data("component", comp);
            toAdd.data("Docker", this);

            //Attach the click event
            toAdd.off("click");
            toAdd.on("click", this.clickPreview);

            this.mPreviews.push(toAdd);

            this.setActiveComponent(comp, attach);
        };

        Object.defineProperty(Docker.prototype, "activePreview", {
            get: function () {
                return this._activePreview;
            },
            enumerable: true,
            configurable: true
        });
        return Docker;
    })(Animate.Component);
    Animate.Docker = Docker;
})(Animate || (Animate = {}));
//# sourceMappingURL=Docker.js.map
