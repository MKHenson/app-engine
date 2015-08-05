var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Animate;
(function (Animate) {
    var CanvasTabPair = (function (_super) {
        __extends(CanvasTabPair, _super);
        function CanvasTabPair(canvas, name) {
            _super.call(this, null, null, name);
            this.canvas = canvas;
        }
        CanvasTabPair.prototype.dispose = function () {
            this.canvas = null;
            _super.prototype.dispose.call(this);
        };
        return CanvasTabPair;
    })(Animate.TabPair);
    Animate.CanvasTabPair = CanvasTabPair;
})(Animate || (Animate = {}));
//# sourceMappingURL=CanvasTabPair.js.map
