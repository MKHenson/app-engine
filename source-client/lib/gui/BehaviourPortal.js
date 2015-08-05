var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Animate;
(function (Animate) {
    var BehaviourPortal = (function (_super) {
        __extends(BehaviourPortal, _super);
        function BehaviourPortal(parent, text, portalType, dataType, value) {
            if (typeof portalType === "undefined") { portalType = Animate.PortalType.INPUT; }
            if (typeof dataType === "undefined") { dataType = Animate.ParameterType.BOOL; }
            if (typeof value === "undefined") { value = false; }
            this._portalType = portalType;
            this._dataType = dataType;
            this._value = value;

            // Call super-class constructor
            _super.call(this, parent, text);

            //this.element.removeClass("behaviour");
            this.element.addClass("behaviour-portal");

            if (this._portalType == Animate.PortalType.OUTPUT)
                this.addPortal(Animate.PortalType.INPUT, text, this._value, this._dataType);
else if (this._portalType == Animate.PortalType.INPUT)
                this.addPortal(Animate.PortalType.OUTPUT, text, this._value, this._dataType);
else if (this._portalType == Animate.PortalType.PARAMETER)
                this.addPortal(Animate.PortalType.PRODUCT, text, this._value, this._dataType);
else
                this.addPortal(Animate.PortalType.PARAMETER, text, this._value, this._dataType);
        }
        /**This will cleanup the component.*/
        BehaviourPortal.prototype.dispose = function () {
            this._portalType = null;
            this._dataType = null;
            this._value = null;

            //Call super
            _super.prototype.dispose.call(this);
        };

        Object.defineProperty(BehaviourPortal.prototype, "portaltype", {
            get: function () {
                return this._portalType;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BehaviourPortal.prototype, "dataType", {
            get: function () {
                return this._dataType;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BehaviourPortal.prototype, "value", {
            get: function () {
                return this._value;
            },
            enumerable: true,
            configurable: true
        });
        return BehaviourPortal;
    })(Animate.Behaviour);
    Animate.BehaviourPortal = BehaviourPortal;
})(Animate || (Animate = {}));
//# sourceMappingURL=BehaviourPortal.js.map
