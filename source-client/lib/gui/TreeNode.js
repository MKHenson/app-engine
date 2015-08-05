var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Animate;
(function (Animate) {
    /**
    * This is the base class for all tree node classes
    */
    var TreeNode = (function (_super) {
        __extends(TreeNode, _super);
        /**
        * @param {string} text The text to use for this node
        * @param {string} img An optional image to use (image src text)
        * @param {boolean} hasExpandButton A bool to tell the node if it should use the expand button
        */
        function TreeNode(text, img, hasExpandButton) {
            if (typeof img === "undefined") { img = null; }
            if (typeof hasExpandButton === "undefined") { hasExpandButton = true; }
            if (img != null && img != "")
                img = "<img src='" + img + "' />";
else
                img = "";

            this.mText = text;
            this.img = img;
            this._expanded = false;
            this.hasExpandButton = hasExpandButton;

            // Call super-class constructor
            _super.call(this, "<div class='tree-node'><div class='selectable'>" + (this.hasExpandButton ? "<div class='tree-node-button'>+</div>" : "") + this.img + "<span class='text'>" + this.mText + "</span><div class='fix'></div></div></div>", null);
            this.element.disableSelection(true);

            this.treeview = null;
            this.canDelete = false;
            this.canFocus = true;
        }
        /**
        * @type public mfunc dispose
        * This will cleanup the component.
        * @extends {TreeNode}
        */
        TreeNode.prototype.dispose = function () {
            if (this.treeview) {
                if (this.treeview.selectedNodes.indexOf(this) != -1)
                    this.treeview.selectedNodes.splice(this.treeview.selectedNodes.indexOf(this), 1);

                if (this.treeview.selectedNode == this)
                    this.treeview.selectedNode = null;
            }

            this.mText = null;
            this.img = null;
            this._expanded = null;
            this.hasExpandButton = null;
            this.treeview = null;
            this.canDelete = null;

            //Call super
            _super.prototype.dispose.call(this);
        };

        /**
        * Called when the node is selected
        */
        TreeNode.prototype.onSelect = function () {
        };

        /**
        * This function will rturn an array of all its child nodes
        * @param {Function} type This is an optional type object. You can pass a function or class and it will only return nodes of that type.
        * @param Array<TreeNode> array This is the array where data will be stored in. This can be left as null and one will be created
        * @returns Array<TreeNode>
        */
        TreeNode.prototype.getAllNodes = function (type, array) {
            if (typeof array === "undefined") { array = null; }
            var toRet = null;
            if (array)
                toRet = array;
else
                toRet = [];

            var children = this.children;
            var len = children.length;
            for (var i = 0; i < len; i++) {
                children[i].getAllNodes(type, toRet);

                if (type == null)
                    toRet.push(children[i]);
else if (children[i] instanceof type)
                    toRet.push(children[i]);
            }

            return toRet;
        };

        /**
        * This function will expand this node and show its children.
        */
        TreeNode.prototype.expand = function () {
            if (this.hasExpandButton == false)
                return;

            var children = this.children;
            var len = children.length;
            for (var i = 0; i < len; i++)
                children[i].element.show();

            jQuery(".tree-node-button", this.element).first().text("-");

            this._expanded = true;
        };

        /**
        * This function will collapse this node and hide its children.
        */
        TreeNode.prototype.collapse = function () {
            if (this.hasExpandButton == false)
                return;

            var children = this.children;
            var len = children.length;
            for (var i = 0; i < len; i++)
                children[i].element.hide();

            jQuery(".tree-node-button", this.element).first().text("+");

            this._expanded = false;
        };

        /**
        * This will recursively look through each of the nodes to find a node with
        * the specified name.
        * @param {string} property The Javascript property on the node that we are evaluating
        * @param {any} value The value of the property we are comparing.
        * @returns {TreeNode}
        */
        TreeNode.prototype.findNode = function (property, value) {
            if (this[property] == value)
                return this;

            var children = this.children;
            var len = children.length;
            for (var i = 0; i < len; i++) {
                if (children[i] instanceof TreeNode == false)
                    continue;

                var n = children[i].findNode(property, value);
                if (n != null)
                    return n;
            }
        };

        /**
        * This will clear and dispose of all the nodes
        */
        TreeNode.prototype.clear = function () {
            var children = this.children;

            while (children.length > 0) {
                if (children[0].treeview && children[0].treeview.selectedNodes.indexOf(children[0]) != -1)
                    children[0].treeview.selectedNodes.splice(children[0].treeview.selectedNodes.indexOf(children[0]), 1);

                children[0].dispose();
            }
        };


        Object.defineProperty(TreeNode.prototype, "selected", {
            get: /**
            * Get if the component is selected
            * @returns {boolean} If the component is selected or not.
            */
            function () {
                if (this.element.hasClass("tree-node-selected"))
                    return true;
else
                    return false;
            },
            set: /**
            * Set if the component is selected
            * @param {boolean} val Pass a true or false value to select the component.
            */
            function (val) {
                if (val)
                    jQuery(" > .selectable", this.element).addClass("tree-node-selected").addClass("tree-node-selected");
else
                    jQuery(" > .selectable", this.element).removeClass("tree-node-selected").removeClass("tree-node-selected");
            },
            enumerable: true,
            configurable: true
        });


        Object.defineProperty(TreeNode.prototype, "text", {
            get: /**
            * Gets the text of the node
            * @returns {string} The text of the node
            */
            function () {
                return this.mText;
            },
            set: /**
            * Sets the text of the node
            * @param {string} val The text to set
            */
            function (val) {
                this.mText = val;
                jQuery(".text:first", this.element).text(this.mText);
            },
            enumerable: true,
            configurable: true
        });

        /**
        * This will add a node to the treeview
        * @param {TreeNode} node The node to add
        * @param {boolean} collapse True if you want to make this node collapse while adding the new node. The default is true
        * @returns {TreeNode}
        */
        TreeNode.prototype.addNode = function (node, collapse) {
            if (typeof collapse === "undefined") { collapse = true; }
            node.treeview = this.treeview;
            var toRet = Animate.Component.prototype.addChild.call(this, node);

            if (collapse)
                this.collapse();
else
                this.expand();

            return toRet;
        };

        Object.defineProperty(TreeNode.prototype, "nodes", {
            get: /**
            * The nodes of this treeview.
            * @returns {Array<TreeNode>}
            */
            function () {
                return this.children;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(TreeNode.prototype, "expanded", {
            get: /**
            * Gets if this treenode is expanded or not
            * @returns {boolean}
            */
            function () {
                return this._expanded;
            },
            enumerable: true,
            configurable: true
        });

        /**
        * This removes a node from the treeview
        * @param {TreeNode} node The node to remove
        * @returns {TreeNode}
        */
        TreeNode.prototype.removeNode = function (node) {
            if (this.treeview.selectedNodes.indexOf(node) != -1)
                this.treeview.selectedNodes.splice(this.treeview.selectedNodes.indexOf(node), 1);

            if (this.treeview.selectedNode == node)
                this.treeview.selectedNode = null;

            node.treeview = null;
            return Animate.Component.prototype.removeChild.call(this, node);
        };

        Object.defineProperty(TreeNode.prototype, "originalText", {
            get: function () {
                return this.mText;
            },
            set: function (val) {
                this.mText = val;
            },
            enumerable: true,
            configurable: true
        });
        return TreeNode;
    })(Animate.Component);
    Animate.TreeNode = TreeNode;
})(Animate || (Animate = {}));
//# sourceMappingURL=TreeNode.js.map
