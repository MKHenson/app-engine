var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Animate;
(function (Animate) {
    /**
    * Treenodes are added to the treeview class. This treenode contains a reference to the
    * AssetClass object defined by plugins.
    */
    var TreeNodeAssetClass = (function (_super) {
        __extends(TreeNodeAssetClass, _super);
        /**
        * @param {AssetClas} assetClass The asset class this node represents
        * @param {TreeView} treeview The treeview to which this is added
        */
        function TreeNodeAssetClass(assetClass, treeview) {
            // Call super-class constructor
            _super.call(this, assetClass.name, assetClass.imgURL, true);

            this.canDelete = false;
            this.assetClass = assetClass;
            this.treeview = treeview;
            this.className = assetClass.name;
            this.canUpdate = true;

            for (var ii = 0; ii < assetClass.classes.length; ii++) {
                var c = assetClass.classes[ii];
                var toRet = new TreeNodeAssetClass(c, treeview);
                this.addNode(toRet);
            }
        }
        /**
        * This will get all TreeNodeAssetInstance nodes of a particular class name
        * @param {string} className The asset class name
        * @returns Array<TreeNodeAssetInstance>
        */
        TreeNodeAssetClass.prototype.getInstances = function (className) {
            var toRet = null;
            var children = this.children;

            if (className == null || className == this.assetClass.name || className == "") {
                toRet = [];

                //Add the sub - class nodes
                var len = children.length;
                for (var i = 0; i < len; i++) {
                    if (children[i] instanceof Animate.TreeNodeAssetInstance)
                        toRet.push(children[i]);
else if (children[i] instanceof TreeNodeAssetClass) {
                        var instances = (children[i]).getInstances(null);
                        if (instances != null) {
                            for (var ii = 0; ii < instances.length; ii++)
                                toRet.push(instances[ii]);
                        }
                    }
                }
            } else {
                //Add the sub - class nodes
                var len = children.length;
                for (var i = 0; i < len; i++) {
                    if (children[i] instanceof TreeNodeAssetClass) {
                        var instances = (children[i]).getInstances(className);
                        if (instances != null)
                            return instances;
                    }
                }
            }

            return toRet;
        };

        /**
        * This will get all sub TreeNodeAssetClass nodes
        * @returns Array<AssetClass>
        */
        TreeNodeAssetClass.prototype.getClasses = function () {
            var toRet = [];
            var children = this.children;

            //Add the sub - class nodes
            var len = this.children.length;
            for (var i = 0; i < len; i++) {
                if (children[i] instanceof TreeNodeAssetClass) {
                    toRet.push(((children[i]).assetClass));

                    var instances = (children[i]).getClasses();
                    if (instances != null)
                        for (var ii = 0; ii < instances.length; ii++)
                            toRet.push(instances[i]);
                }
            }

            return toRet;
        };

        /**
        * This will cleanup the component.
        */
        TreeNodeAssetClass.prototype.dispose = function () {
            this.canDelete = null;
            this.assetClass = null;
            this.treeview = null;
            this.className = null;

            //Call super
            _super.prototype.dispose.call(this);
        };
        return TreeNodeAssetClass;
    })(Animate.TreeNode);
    Animate.TreeNodeAssetClass = TreeNodeAssetClass;
})(Animate || (Animate = {}));
//# sourceMappingURL=TreeNodeAssetClass.js.map
