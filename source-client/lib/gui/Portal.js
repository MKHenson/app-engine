var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Animate;
(function (Animate) {
    var PortalType = (function (_super) {
        __extends(PortalType, _super);
        function PortalType(v) {
            _super.call(this, v);
        }
        PortalType.PARAMETER = new PortalType("parameter");
        PortalType.PRODUCT = new PortalType("product");
        PortalType.INPUT = new PortalType("input");
        PortalType.OUTPUT = new PortalType("output");
        return PortalType;
    })(Animate.ENUM);
    Animate.PortalType = PortalType;

    var ParameterType = (function (_super) {
        __extends(ParameterType, _super);
        function ParameterType(v) {
            _super.call(this, v);
        }
        ParameterType.ASSET = new ParameterType("asset");
        ParameterType.NUMBER = new ParameterType("number");
        ParameterType.GROUP = new ParameterType("group");
        ParameterType.FILE = new ParameterType("file");
        ParameterType.STRING = new ParameterType("string");
        ParameterType.OBJECT = new ParameterType("object");
        ParameterType.BOOL = new ParameterType("bool");
        ParameterType.INT = new ParameterType("int");
        ParameterType.COLOR = new ParameterType("color");
        ParameterType.ENUM = new ParameterType("enum");
        ParameterType.HIDDEN = new ParameterType("hidden");
        return ParameterType;
    })(Animate.ENUM);
    Animate.ParameterType = ParameterType;

    /**
    * A portal class for behaviours. There are 4 different types of portals -
    * INPUT, OUTPUT, PARAMETER and PRODUCT. Each portal acts as a gate for a behaviour.
    */
    var Portal = (function (_super) {
        __extends(Portal, _super);
        /**
        * @param {Behaviour} parent The parent component of the Portal
        * @param {string} name The name of the portal
        * @param {PortalType} type The portal type. This can be either Portal.INPUT, Portal.OUTPUT, Portal.PARAMETER or Portal.PRODUCT
        * @param {any} value The default value of the portal
        * @param {ParameterType} dataType The type of value this portal represents - eg: asset, string, number, file...etc
        */
        function Portal(parent, name, type, value, dataType) {
            if (typeof type === "undefined") { type = PortalType.PARAMETER; }
            if (typeof value === "undefined") { value = null; }
            if (typeof dataType === "undefined") { dataType = ParameterType.OBJECT; }
            // Call super-class constructor
            _super.call(this, "<div class='portal " + type + "'></div>", parent);

            this.edit(name, type, value, dataType);

            this.element.data("dragEnabled", false);
            this._links = [];
            this.behaviour = parent;
            this._customPortal = true;

            if (type == PortalType.PRODUCT || type == PortalType.OUTPUT)
                this.element.on("mousedown", jQuery.proxy(this.onPortalDown, this));
        }
        /**
        * Edits the portal variables
        * @param {string} name The name of the portal
        * @param {PortalType} type The portal type. This can be either Portal.INPUT, Portal.OUTPUT, Portal.PARAMETER or Portal.PRODUCT
        * @param {any} value The default value of the portal
        * @param {ParameterType} dataType The type of value this portal represents - eg: asset, string, number, file...etc
        * @extends <Portal>
        */
        Portal.prototype.edit = function (name, type, value, dataType) {
            this._name = name;
            this.value = value;
            this._type = type;
            this._dataType = dataType;

            var valText = "";
            if (type == PortalType.INPUT || type == PortalType.OUTPUT)
                this._dataType = dataType = ParameterType.BOOL;
else
                valText = Animate.ImportExport.getExportValue(dataType, value);

            var typeName = "Parameter";
            if (type == PortalType.INPUT)
                typeName = "Input";
else if (type == PortalType.OUTPUT)
                typeName = "Output";
else if (type == PortalType.PRODUCT)
                typeName = "Product";

            //Set the tooltip to be the same as the name
            this.tooltip = name + " : " + typeName + " - <b>" + valText + "</b>";
        };

        /**
        * This function will check if the source portal is an acceptable match with the current portal.
        * @param source The source panel we are checking against
        */
        Portal.prototype.checkPortalLink = function (source) {
            if (source.type == PortalType.OUTPUT && this.type == PortalType.INPUT)
                return true;
else if (source.type == PortalType.PRODUCT && this.type == PortalType.PARAMETER) {
                if (this._dataType == null || this._dataType == ParameterType.OBJECT)
                    return true;
else if (this._dataType == this._dataType)
                    return true;
else if (Animate.PluginManager.getSingleton().getConverters(source._dataType, this._dataType) == null)
                    return false;
else
                    return true;
            } else
                return false;
        };

        /**
        * This function will check if the source portal is an acceptable match with the current portal.
        */
        Portal.prototype.dispose = function () {
            var len = this._links.length;
            while (len > 0) {
                this._links[0].dispose();
                len = this._links.length;
            }

            this.element.data("dragEnabled", null);
            this._links = null;
            this.value = null;
            this.behaviour = null;
            this._type = null;
            this._dataType = null;
            this._name = null;

            //Call super
            _super.prototype.dispose.call(this);
        };

        /**
        * When the mouse is down on the portal.
        * @param {object} e The jQuery event object
        */
        Portal.prototype.onPortalDown = function (e) {
            var newLink = new Animate.Link(this.parent.parent.element.data("component"));
            newLink.start(this, e);
        };

        /**
        * Adds a link to the portal.
        * @param {Link} link The link we are adding
        */
        Portal.prototype.addLink = function (link) {
            if (jQuery.inArray(link, this._links) == -1)
                this._links.push(link);

            if (this.type == PortalType.PARAMETER || this.type == PortalType.PRODUCT)
                this.element.css("background-color", "#E2B31F");
else
                this.element.css("background-color", "#A41CC9");
        };

        /**
        * Removes a link from the portal.
        * @param {Link} link The link we are removing
        */
        Portal.prototype.removeLink = function (link) {
            if (this._links.indexOf(link) == -1)
                return link;

            this._links.splice(this._links.indexOf(link), 1);

            if (this._links.length == 0)
                this.element.css("background-color", "");

            return link;
        };

        /**
        * Makes sure the links are positioned correctly
        */
        Portal.prototype.updateAllLinks = function () {
            var links = this._links;
            var i = links.length;

            while (i--)
                links[i].updatePoints();
        };

        /**
        * Returns this portal's position on the canvas.
        */
        Portal.prototype.positionOnCanvas = function () {
            //Get the total parent scrolling
            var p = this.parent.element;
            var p_ = p;

            //var offset = p.offset();
            var startX = 0;
            var startY = 0;
            var sL = 0;
            var sT = 0;
            while (p.length != 0) {
                sL = p.scrollLeft();
                sT = p.scrollTop();

                startX += sL;
                startY += sT;

                p = p.parent();
            }

            var position = this.element.position();
            var pPosition = p_.position();

            return {
                left: startX + position.left + pPosition.left,
                top: startY + position.top + pPosition.top
            };
        };

        Object.defineProperty(Portal.prototype, "type", {
            get: //get behaviour() { return this._behaviour; }
            function () {
                return this._type;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Portal.prototype, "name", {
            get: function () {
                return this._name;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Portal.prototype, "dataType", {
            get: function () {
                return this._dataType;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Portal.prototype, "customPortal", {
            get: function () {
                return this._customPortal;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Portal.prototype, "links", {
            get: function () {
                return this._links;
            },
            enumerable: true,
            configurable: true
        });
        return Portal;
    })(Animate.Component);
    Animate.Portal = Portal;
})(Animate || (Animate = {}));
//# sourceMappingURL=Portal.js.map
