var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Animate;
(function (Animate) {
    /**
    * This node represents a group instance. Goups are collections of objects - think of them as arrays.
    */
    var TreeNodeGroupInstance = (function (_super) {
        __extends(TreeNodeGroupInstance, _super);
        function TreeNodeGroupInstance(instanceID, name) {
            // Call super-class constructor
            _super.call(this, name, "media/instance_ref.png", false);

            this._instanceID = instanceID;
            this.canDelete = true;
        }
        /**This will cleanup the component.*/
        TreeNodeGroupInstance.prototype.dispose = function () {
            var parentGroupNode = this.parent;
            if (parentGroupNode)
                parentGroupNode.removeInstance(this.instanceID);

            this._instanceID = null;

            //Call super
            _super.prototype.dispose.call(this);
        };

        Object.defineProperty(TreeNodeGroupInstance.prototype, "instanceID", {
            get: function () {
                return this._instanceID;
            },
            enumerable: true,
            configurable: true
        });
        return TreeNodeGroupInstance;
    })(Animate.TreeNode);
    Animate.TreeNodeGroupInstance = TreeNodeGroupInstance;
})(Animate || (Animate = {}));
//# sourceMappingURL=TreeNodeGroupInstance.js.map
