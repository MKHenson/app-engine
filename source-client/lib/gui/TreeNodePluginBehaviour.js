var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Animate;
(function (Animate) {
    /**
    * This node represents a behaviour created by a plugin.
    */
    var TreeNodePluginBehaviour = (function (_super) {
        __extends(TreeNodePluginBehaviour, _super);
        function TreeNodePluginBehaviour(template) {
            // Call super-class constructor
            _super.call(this, template.behaviourName, "media/variable.png", false);

            this._template = template;
            this.canDelete = false;
            this.element.addClass("behaviour-to-canvas");
            this.element.draggable({ opacity: 0.7, helper: "clone", appendTo: "body", containment: "body" });
        }
        /**This will cleanup the component.*/
        TreeNodePluginBehaviour.prototype.dispose = function () {
            this._template.dispose();
            this.template = null;
            this.canDelete = null;

            //Call super
            _super.prototype.dispose.call(this);
        };

        Object.defineProperty(TreeNodePluginBehaviour.prototype, "template", {
            get: function () {
                return this._template;
            },
            enumerable: true,
            configurable: true
        });
        return TreeNodePluginBehaviour;
    })(Animate.TreeNode);
    Animate.TreeNodePluginBehaviour = TreeNodePluginBehaviour;
})(Animate || (Animate = {}));
//# sourceMappingURL=TreeNodePluginBehaviour.js.map
