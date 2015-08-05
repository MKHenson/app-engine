var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Animate;
(function (Animate) {
    /**
    * This node represents a group asset. Goups are collections of objects - think of them as arrays.
    */
    var TreeNodeGroup = (function (_super) {
        __extends(TreeNodeGroup, _super);
        function TreeNodeGroup(id, name, json, treeview) {
            // Call super-class constructor
            _super.call(this, name, "media/array.png", true);

            this.groupID = id;
            this.canDelete = true;
            this.saved = true;
            this.canUpdate = true;
            this.json = null;
            this.treeview = treeview;

            this.element.addClass("tree-node-group");

            if (json != null && jQuery.trim(json) != "") {
                var project = Animate.User.getSingleton().project;
                this.json = jQuery.parseJSON(json);

                for (var i in this.json.assets) {
                    this.addNode(new Animate.TreeNodeGroupInstance(this.json.assets[i].id, this.json.assets[i].name));
                }
            } else
                this.json = { assets: [] };

            this.dropProxy = this.onObjectDropped.bind(this);
            this.element.draggable({ opacity: 0.7, helper: "clone", appendTo: "body", containment: "body" });
            this.element.droppable({ drop: this.dropProxy, accept: ".tree-node-asset,.tree-node-group" });
        }
        /** This is called when we update the group with new data from the server.*/
        TreeNodeGroup.prototype.updateGroup = function (name, json) {
            while (this.children.length > 0)
                this.children[0].dispose();

            var project = Animate.User.getSingleton().project;

            this.saved = true;
            this.text = this.originalText;
            this.name = name;

            if (json != null && jQuery.trim(json) != "") {
                this.json = jQuery.parseJSON(json);

                for (var i in this.json.assets) {
                    this.addNode(new Animate.TreeNodeGroupInstance(this.json.assets[i].id, this.json.assets[i].name));
                }
            }
        };

        /**This function is called when a child node is removed. We have to update
        the json object and make its no longer part of the data.
        @param id The ID of the object we need to remove.*/
        TreeNodeGroup.prototype.removeInstance = function (id) {
            for (var i = 0; i < this.json.assets.length; i++)
                if (this.json.assets[i].id == id) {
                    this.json.assets.splice(i, 1);
                    this.save(false);
                    return;
                }
        };


        Object.defineProperty(TreeNodeGroup.prototype, "text", {
            get: /**
            * Gets the text of the node
            * @returns {string} The text of the node
            */
            function () {
                return this.originalText;
            },
            set: /**
            * Sets the text of the node
            * @param {string} val The text to set
            */
            function (val) {
                this.originalText = val;
                jQuery(".text:first", this.element).text((this.saved ? "" : "*") + this.originalText);
            },
            enumerable: true,
            configurable: true
        });

        /** Notifies if this node is saved or unsaved. */
        TreeNodeGroup.prototype.save = function (val) {
            this.saved = val;
            this.text = this.text;
        };

        /**Called when a draggable object is dropped onto the canvas.*/
        TreeNodeGroup.prototype.onObjectDropped = function (event, ui) {
            var comp = jQuery(ui.draggable).data("component");
            if (comp instanceof Animate.TreeNodeAssetInstance || comp instanceof TreeNodeGroup) {
                var added = null;
                if (comp instanceof Animate.TreeNodeAssetInstance)
                    added = this.addNode(new Animate.TreeNodeGroupInstance((comp).asset.id, (comp).asset.name));
else
                    added = this.addNode(new Animate.TreeNodeGroupInstance((comp).groupID, comp.text));

                this.expand();
                this.treeview.selectNode(added);

                this.save(false);

                var identifier = this.json.assets.length;
                this.json.assets[identifier] = {};
                this.json.assets[identifier].id = added.instanceID;
                this.json.assets[identifier].name = (comp instanceof Animate.TreeNodeAssetInstance ? (comp).asset.name : comp.text);
            }
        };

        /**This will cleanup the component.*/
        TreeNodeGroup.prototype.dispose = function () {
            this.element.droppable("destroy");

            //Call super - must be called here in this case
            _super.prototype.dispose.call(this);

            this.treeview = null;
            this.dropProxy = null;
            this.groupID = null;
            this.canDelete = null;
            this.saved = null;
            this.canUpdate = null;
            this.json = null;
        };
        return TreeNodeGroup;
    })(Animate.TreeNode);
    Animate.TreeNodeGroup = TreeNodeGroup;
})(Animate || (Animate = {}));
//# sourceMappingURL=TreeNodeGroup.js.map
