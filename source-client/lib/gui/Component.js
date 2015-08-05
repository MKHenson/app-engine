var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Animate;
(function (Animate) {
    var ComponentEvents = (function (_super) {
        __extends(ComponentEvents, _super);
        function ComponentEvents(v) {
            _super.call(this, v);
        }
        ComponentEvents.UPDATED = new ComponentEvents("component_updated");
        return ComponentEvents;
    })(Animate.ENUM);
    Animate.ComponentEvents = ComponentEvents;

    /**
    * The base class for all visual elements in the application. The {Component} class
    * contains a reference of a jQuery object that points to the {Component}'s DOM representation.
    */
    var Component = (function (_super) {
        __extends(Component, _super);
        function Component(html, parent) {
            if (typeof html === "undefined") { html = "<div class='Component'><div>"; }
            if (typeof parent === "undefined") { parent = null; }
            _super.call(this);
            //This is used in the saving process. Leave alone.
            this._savedID = null;
            this._tooltip = null;
            this._enabled = true;

            if (html == null)
                html = "<div class='Component'><div>";

            //Increment the ID's
            Component.idCounter++;

            //Create the jQuery wrapper
            this._element = jQuery(html);
            this._children = [];
            this._layouts = [];
            this._id = "i" + Component.idCounter;
            this._savedID = null;
            this._tooltip = null;
            this._enabled = true;
            this.tag = null;
            this._parent = parent;

            //Associate the id and component
            this._element.attr("id", this._id);
            this._element.data("component", this);

            if (parent)
                parent.addChild(this);
        }
        /**
        * Diposes and cleans up this component and all its child {Component}s
        */
        Component.prototype.dispose = function () {
            if (this.disposed)
                return;

            this._tooltip = null;

            var children = this._children;
            var i = children.length;
            while (i--)
                children[i].dispose();

            this._layouts = null;
            this.tag = null;
            this._children = null;
            this._savedID = null;

            if (this._parent != null)
                this._parent.removeChild(this);

            this.element.data("id", null).data("component", null).remove();

            this.element = null;

            //Call super
            Animate.EventDispatcher.prototype.dispose.call(this);
        };

        /**
        * This function is called to update this component and its children.
        * Typically used in sizing operations.
        * @param {boolean} updateChildren Set this to true if you want the update to proliferate to all the children components.
        */
        Component.prototype.update = function (updateChildren) {
            if (typeof updateChildren === "undefined") { updateChildren = true; }
            var layouts = this._layouts;
            var i = layouts.length;
            while (i--)
                layouts[i].update(this);

            if (updateChildren) {
                var children = this._children;
                i = children.length;
                while (i--)
                    children[i].update();
            }

            _super.prototype.dispatchEvent.call(this, new Animate.Event(ComponentEvents.UPDATED));
        };

        /**
        * Add layout algorithms to the {Component}.
        * @param {ILayout} layout The layout object we want to add
        * @returns {ILayout} The layout that was added
        */
        Component.prototype.addLayout = function (layout) {
            this._layouts.push(layout);
            return layout;
        };

        /**
        * Removes a layout from this {Component}
        * @param {ILayout} layout The layout to remove
        * @returns {ILayout} The layout that was removed
        */
        Component.prototype.removeLayout = function (layout) {
            if (jQuery.inArray(layout, this._layouts) == -1)
                return null;

            this._layouts.splice(jQuery.inArray(layout, this._layouts), 1);
            return layout;
        };

        Component.prototype.addChild = function (child) {
            //Remove from previous parent
            var parent = child.parent;
            if (parent)
                parent.removeChild(child);

            var toAdd = null;

            if (jQuery.inArray(child, this._children) != -1)
                return child;
else if (typeof child === "string")
                toAdd = new Component(child);
else if (child instanceof Component === false) {
                throw new Error("You can only add HTML strings or Component classes");
                return null;
            } else
                toAdd = child;

            toAdd._parent = this;
            this._children.push(toAdd);
            this._element.append(toAdd._element);
            return toAdd;
        };

        /**
        * Use this function to remove a child from this component.
        * It uses the {JQuery} detach function to achieve this functionality.
        * @param {IComponent} child The {IComponent} to remove from this {IComponent}'s children
        * @returns {IComponent} The {IComponent} we have removed
        */
        Component.prototype.removeChild = function (child) {
            if (jQuery.inArray(child, this._children) == -1)
                return child;

            child.parent = null;
            child.element.detach();
            this._children.splice(jQuery.inArray(child, this._children), 1);
            return child;
        };

        /**
        * Removes all child nodes
        */
        Component.prototype.clear = function () {
            var children = this._children;
            var i = children.length;
            while (i--)
                children[i].dispose();
        };

        Component.prototype.onDelete = function () {
        };

        Object.defineProperty(Component.prototype, "children", {
            get: /**
            * Returns the array of Child {Component}s
            * @returns {Array{IComponent}} An array of child {IComponent} objects
            */
            function () {
                return this._children;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(Component.prototype, "element", {
            get: /**
            * Gets the jQuery wrapper
            */
            function () {
                return this._element;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(Component.prototype, "parent", {
            get: /**
            * Gets the jQuery parent
            */
            function () {
                return this._parent;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(Component.prototype, "tooltip", {
            get: /**
            * Gets the tooltip for this {Component}
            */
            function () {
                return this._tooltip;
            },
            set: /**
            * Sets the tooltip for this {Component}
            */
            function (val) {
                this._tooltip = val;
            },
            enumerable: true,
            configurable: true
        });


        Object.defineProperty(Component.prototype, "enabled", {
            get: /**
            * Get or Set if the component is enabled and recieves mouse events
            */
            function () {
                return this._enabled;
            },
            set: /**
            * Get or Set if the component is enabled and recieves mouse events
            */
            function (val) {
                if (this._enabled == val)
                    return;

                if (!val)
                    this.element.addClass("disabled");
else
                    this.element.removeClass("disabled");

                this._enabled = val;
            },
            enumerable: true,
            configurable: true
        });


        Object.defineProperty(Component.prototype, "id", {
            get: /**
            * Gets the ID of thi component
            */
            function () {
                return this._id;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(Component.prototype, "selected", {
            get: /**
            * Get or Set if the component is selected. When set to true a css class of 'selected' is added to the {Component}
            */
            function () {
                if (this._element.hasClass("selected"))
                    return true;
else
                    return false;
            },
            set: /**
            * Get or Set if the component is selected. When set to true a css class of 'selected' is added to the {Component}
            */
            function (val) {
                if (val)
                    this._element.addClass("selected");
else
                    this._element.removeClass("selected");
            },
            enumerable: true,
            configurable: true
        });

        Component.idCounter = 0;
        return Component;
    })(Animate.EventDispatcher);
    Animate.Component = Component;
})(Animate || (Animate = {}));
//# sourceMappingURL=Component.js.map
