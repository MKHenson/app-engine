var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Animate;
(function (Animate) {
    /**
    * Behaviours are the base class for all nodes placed on a <Canvas>
    */
    var Behaviour = (function (_super) {
        __extends(Behaviour, _super);
        function Behaviour(parent, text, html) {
            if (typeof html === "undefined") { html = "<div class='behaviour reg-gradient'></div>"; }
            // Call super-class constructor
            _super.call(this, text, parent, html);

            var th = this.textfield.element.height();
            var tw = this.textfield.element.width();
            this.element.css({ width: (tw + 20) + "px", height: (th + 20) + "px" });

            this._originalName = text;
            this._alias = text;
            this._canGhost = true;
            this._parameters = [];
            this._products = [];
            this._outputs = [];
            this._inputs = [];
            this._portals = [];

            this._requiresUpdated = true;
        }
        /**
        * Adds a portal to this behaviour.
        * @param {PortalType} type The type of portal we are adding. It can be either Portal.INPUT, Portal.OUTPUT, Portal.PARAMETER & Portal.PRODUCT
        * @param {string} name The unique name of the <Portal>
        * @param {any} value The default value of the <Portal>
        * @param {ParameterType} dataType The data type that the portal represents. See the default data types.
        * @returns {Portal} The portal that was added to this node
        */
        Behaviour.prototype.addPortal = function (type, name, value, dataType) {
            var portal = new Animate.Portal(this, name, type, value, dataType);

            this._requiresUpdated = true;

            if (type == Animate.PortalType.PARAMETER)
                this._parameters.push(portal);
else if (type == Animate.PortalType.PRODUCT)
                this._products.push(portal);
else if (type == Animate.PortalType.OUTPUT)
                this._outputs.push(portal);
else
                this._inputs.push(portal);

            this._portals.push(portal);
            var portalSize = portal.element.width();
            portal.behaviour = this;

            //Update the dimensions
            this.updateDimensions();

            return portal;
        };

        /**
        * Removes a portal from this behaviour
        * @param {Portal} toRemove The portal object we are removing
        * @param {any} dispose Should the portal be disposed. The default is true.
        * @returns {Portal} The portal we have removed. This would be disposed if dispose was set to true.
        */
        Behaviour.prototype.removePortal = function (toRemove, dispose) {
            if (typeof dispose === "undefined") { dispose = true; }
            this._requiresUpdated = true;

            this.removeChild(toRemove);

            //Remove from arrays
            var index = jQuery.inArray(toRemove, this._parameters);
            if (index != -1) {
                this._parameters.splice(index, 1);
                toRemove.behaviour = null;
            }

            index = jQuery.inArray(toRemove, this._products);
            if (index != -1)
                this._products.splice(index, 1);

            index = jQuery.inArray(toRemove, this._outputs);
            if (index != -1)
                this._outputs.splice(index, 1);

            index = jQuery.inArray(toRemove, this._inputs);
            if (index != -1)
                this._inputs.splice(index, 1);

            index = jQuery.inArray(toRemove, this._portals);
            if (index != -1)
                this._portals.splice(index, 1);

            if (dispose)
                toRemove.dispose();

            //Update the dimensions
            this.updateDimensions();
            return toRemove;
        };

        /**
        * Called when the behaviour is renamed
        * @param {string} name The new name of the behaviour
        */
        Behaviour.prototype.onRenamed = function (name) {
        };

        /**
        * A shortcut for jQuery's css property.
        */
        Behaviour.prototype.css = function (propertyName, value) {
            //Call super
            var toRet = this.element.css(propertyName, value);

            var h = this.element.height();
            var th = this.textfield.element.height();
            this._requiresUpdated = true;

            this.textfield.element.css("top", h / 2 - th / 2);

            return toRet;
        };

        /**
        * Updates the behavior width and height and organises the portals
        */
        Behaviour.prototype.updateDimensions = function () {
            if (this._requiresUpdated == false)
                return;

            this._requiresUpdated = false;

            //First get the size of a portal.
            var portalSize = (this._portals.length > 0 ? this._portals[0].element.width() : 10);
            var portalSpacing = 5;

            this.element.css({ width: "1000px", height: "1000px" });
            this.textfield.element.css({ width: "auto", "float": "left" });

            var th = this.textfield.element.height();
            var tw = this.textfield.element.width();

            var topPortals = (this._products.length > this._parameters.length ? this._products.length : this._parameters.length);
            var btmPortals = (this._inputs.length > this._outputs.length ? this._inputs.length : this._outputs.length);
            var totalPortalSpacing = portalSize + 5;
            var padding = 10;

            tw = tw + padding > totalPortalSpacing * topPortals ? tw + padding : totalPortalSpacing * topPortals;
            th = th + padding > totalPortalSpacing * btmPortals ? th + padding : totalPortalSpacing * btmPortals;

            //Round off to the nearest 10 and minus border. This is so that they line up nicely to the graph
            tw = Math.ceil((tw + 1) / 10) * 10;
            th = Math.ceil((th + 1) / 10) * 10;
            this.css({ width: tw + "px", height: th + "px" });
            this.textfield.element.css({ width: "100%", height: "auto", "float": "none" });

            var width = this.element.width();
            var height = this.element.height();

            for (var i = 0; i < this._parameters.length; i++)
                this._parameters[i].element.css({ left: ((portalSize + portalSpacing) * i) + "px", top: -portalSize - 1 + "px" });
            for (var i = 0; i < this._outputs.length; i++)
                this._outputs[i].element.css({ top: ((portalSize + portalSpacing) * i) + "px", left: width + "px" });
            for (var i = 0; i < this._inputs.length; i++)
                this._inputs[i].element.css({ top: ((portalSize + portalSpacing) * i) + "px", left: -portalSize + "px" });
            for (var i = 0; i < this._products.length; i++)
                this._products[i].element.css({ left: ((portalSize + portalSpacing) * i) + "px", top: height + "px" });
        };


        Object.defineProperty(Behaviour.prototype, "text", {
            get: /** Gets the text of the behaviour */
            function () {
                return this._originalName;
            },
            set: /**
            * sets the label text
            */
            function (value) {
                //Call super
                this._originalName = value;
                this.textfield.element.html(value);
                this._requiresUpdated = true;

                if (value !== undefined)
                    this.updateDimensions();
            },
            enumerable: true,
            configurable: true
        });

        /**
        * Diposes and cleans up this component and all its child components
        */
        Behaviour.prototype.dispose = function () {
            //The draggable functionality is added in the Canvas addChild function because we need to listen for the events.
            //To make sure its properly removed however we put it here.
            this.element.draggable("destroy");

            for (var i = 0; i < this._parameters.length; i++)
                this._parameters[i].dispose();
            for (var i = 0; i < this._products.length; i++)
                this._products[i].dispose();
            for (var i = 0; i < this._outputs.length; i++)
                this._outputs[i].dispose();
            for (var i = 0; i < this._inputs.length; i++)
                this._inputs[i].dispose();

            this._parameters = null;
            this._products = null;
            this._outputs = null;
            this._inputs = null;
            this._portals = null;
            this._alias = null;

            //Call super
            Animate.Button.prototype.dispose.call(this);
        };

        //===================================================
        // SERIALIZATION - WRITE, BUILD AND READ
        //===================================================
        /* This function is called when animate is creating an export
        file. The export file is used by implementations of Animate in
        other languages. Only the most vital data should be exported here;
        things like gui information in Animate should be used in the
        read and write functions.
        */
        Behaviour.prototype.build = function (data) {
        };

        /* This function is called when animate is reading in saved
        data. This is the case when we need to open saved information.
        Particularly data related to the running of Animate or its GUI.
        Essentially you should override this function if you want to
        open data from saved content.
        */
        Behaviour.prototype.read = function (data) {
        };

        /* This function is called when animate is writing or
        'saving' data to a string format. This is
        particularly data related to the running of Animate or its GUI.
        Essentially you should override this function if you want to
        save data from the editor and open it at a later date.
        */
        Behaviour.prototype.write = function (data) {
            data.name = this._originalName;
            data.id = this.id;
        };

        Object.defineProperty(Behaviour.prototype, "originalName", {
            get: function () {
                return this._originalName;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Behaviour.prototype, "alias", {
            get: function () {
                return this._alias;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Behaviour.prototype, "canGhost", {
            get: function () {
                return this._canGhost;
            },
            set: function (val) {
                this._canGhost = val;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Behaviour.prototype, "requiresUpdated", {
            get: function () {
                return this._requiresUpdated;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Behaviour.prototype, "parameters", {
            get: function () {
                return this._parameters;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Behaviour.prototype, "products", {
            get: function () {
                return this._products;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Behaviour.prototype, "outputs", {
            get: function () {
                return this._outputs;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Behaviour.prototype, "inputs", {
            get: function () {
                return this._inputs;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Behaviour.prototype, "portals", {
            get: function () {
                return this._portals;
            },
            enumerable: true,
            configurable: true
        });
        return Behaviour;
    })(Animate.Button);
    Animate.Behaviour = Behaviour;
})(Animate || (Animate = {}));
//# sourceMappingURL=Behaviour.js.map
