var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Animate;
(function (Animate) {
    /**
    * A node used to ghost - or act as a shortcut - for an existing node. This node is created when you hold shift and
    * move a node on the canvas. The ghost can then be as if it were the original node.
    */
    var BehaviourShortcut = (function (_super) {
        __extends(BehaviourShortcut, _super);
        /**
        * @param {Canvas} parent The parent canvas
        * @param {Behaviour} originalNode The original node we are copying from
        */
        function BehaviourShortcut(parent, originalNode, text) {
            // Call super-class constructor
            _super.call(this, parent, text);

            this.element.addClass("behaviour-shortcut");
            this._originalNode = originalNode;

            if (originalNode)
                this.setOriginalNode(originalNode, true);
        }
        BehaviourShortcut.prototype.setOriginalNode = function (originalNode, buildPortals) {
            this._originalNode = originalNode;
            if (originalNode instanceof Animate.BehaviourAsset)
                this.element.addClass("behaviour-asset");
else if (originalNode instanceof Animate.BehaviourPortal)
                this.element.addClass("behaviour-portal");

            if (buildPortals)
                var i = originalNode.portals.length;
            while (i--)
                this.addPortal(originalNode.portals[i].type, originalNode.portals[i].name, originalNode.portals[i].value, originalNode.portals[i].dataType);
        };

        /**
        * This will cleanup the component.
        */
        BehaviourShortcut.prototype.dispose = function () {
            this._originalNode = null;

            //Call super
            Animate.Behaviour.prototype.dispose.call(this);
        };

        Object.defineProperty(BehaviourShortcut.prototype, "originalNode", {
            get: function () {
                return this._originalNode;
            },
            enumerable: true,
            configurable: true
        });
        return BehaviourShortcut;
    })(Animate.Behaviour);
    Animate.BehaviourShortcut = BehaviourShortcut;
})(Animate || (Animate = {}));
//# sourceMappingURL=BehaviourShortcut.js.map
