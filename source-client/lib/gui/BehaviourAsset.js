var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Animate;
(function (Animate) {
    var BehaviourAsset = (function (_super) {
        __extends(BehaviourAsset, _super);
        function BehaviourAsset(parent, text) {
            if (typeof text === "undefined") { text = "Asset"; }
            // Call super-class constructor
            _super.call(this, parent, text);

            //this.element.removeClass("behaviour");
            this.element.addClass("behaviour-asset");
            this._asset = null;
        }
        /**
        * Diposes and cleans up this component and all its child <Component>s
        */
        BehaviourAsset.prototype.dispose = function () {
            this._asset = null;

            //Call super
            _super.prototype.dispose.call(this);
        };

        /**
        * Adds a portal to this behaviour.
        * @param {PortalType} type The type of portal we are adding. It can be either PortalType.INPUT, PortalType.OUTPUT, Portal.PARAMETER & PortalType.PRODUCT
        * @param {string} name The unique name of the Portal
        * @param {any} value The default value of the Portal
        * @param {ParameterType} dataType The data type that the portal represents. See the default data types.
        * @returns {Portal} The portal that was added to this node
        */
        BehaviourAsset.prototype.addPortal = function (type, name, value, dataType) {
            var portal = Animate.Behaviour.prototype.addPortal.call(this, type, name, value, dataType);

            if (type == Animate.PortalType.PARAMETER) {
                var id = value.split(":")[0];
                this._asset = Animate.User.getSingleton().project.getAsset(id);
            }

            return portal;
        };

        Object.defineProperty(BehaviourAsset.prototype, "asset", {
            get: function () {
                return this._asset;
            },
            enumerable: true,
            configurable: true
        });
        return BehaviourAsset;
    })(Animate.Behaviour);
    Animate.BehaviourAsset = BehaviourAsset;
})(Animate || (Animate = {}));
//# sourceMappingURL=BehaviourAsset.js.map
