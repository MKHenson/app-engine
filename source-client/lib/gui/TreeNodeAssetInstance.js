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
    var TreeNodeAssetInstance = (function (_super) {
        __extends(TreeNodeAssetInstance, _super);
        //public pGridProxy: any;
        /**
        * @param {AssetClass} assetClass The name of the asset's template
        * @param {Asset} asset The asset itself
        */
        function TreeNodeAssetInstance(assetClass, asset) {
            // Call super-class constructor
            _super.call(this, (jQuery.trim(asset.name) == "" ? "New " + assetClass.name : asset.name), "media/variable.png", false);

            this.asset = asset;
            this.canDelete = true;
            this.canCopy = true;
            this.saved = true;
            this.canUpdate = true;
            this.assetClass = assetClass;

            //this.pGridProxy = this.onPropertyGridEdited.bind( this );
            this.element.draggable({ opacity: 0.7, helper: "clone", appendTo: "body", containment: "body" });
            this.element.addClass("behaviour-to-canvas");
            this.element.addClass("tree-node-asset");

            if (this.asset.properties == null || this.asset.properties.variables.length == 0)
                this.asset.properties = assetClass.buildVariables();

            //else
            //{
            //	var classProperties : EditableSet = assetClass.buildVariables();
            //	for ( var propName in classProperties )
            //		if ( !this.asset.properties[propName] )
            //			this.asset.properties[propName] = classProperties[propName];
            //}
            Animate.PropertyGrid.getSingleton().addEventListener(Animate.PropertyGridEvents.PROPERTY_EDITED, this.onPropertyGridEdited, this);
        }
        /**
        * Called when the node is selected
        */
        TreeNodeAssetInstance.prototype.onSelect = function () {
            Animate.PropertyGrid.getSingleton().editableObject(this.asset.properties, this.text, this, "media/variable.png");
            Animate.PluginManager.getSingleton().assetSelected(this.asset);
        };

        /**
        * When we click ok on the portal form
        * @param <object> response
        * @param <object> data
        */
        TreeNodeAssetInstance.prototype.onPropertyGridEdited = function (response, data, sender) {
            if (data.id == this) {
                this.asset.saved = false;
                this.saved = this.asset.saved;

                var oldValue = this.asset.properties.getVar(data.propertyName).value;
                this.asset.properties.updateValue(data.propertyName, data.propertyValue);

                Animate.PluginManager.getSingleton().assetEdited(this.asset, data.propertyName, data.propertyValue, oldValue, data.propertyType);

                this.text = this.text;
            }
        };


        Object.defineProperty(TreeNodeAssetInstance.prototype, "text", {
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
                jQuery(".text:first", this.element).text((this.asset.saved ? "" : "*") + this.originalText);
            },
            enumerable: true,
            configurable: true
        });

        /**
        * When we click ok on the portal form
        */
        TreeNodeAssetInstance.prototype.save = function (val) {
            if (typeof val === "undefined") { val = true; }
            if (!val) {
                this.saved = val;
                this.asset.saved = val;
                this.text = this.text;
                return;
            }

            if (this.saved)
                return;

            this.asset.saved = true;
            this.saved = this.asset.saved;

            this.text = this.text;

            if (this.asset.properties == null)
                this.asset.properties = this.assetClass.buildVariables();
        };

        /**
        * This will cleanup the component.
        */
        TreeNodeAssetInstance.prototype.dispose = function () {
            this.element.draggable("destroy");
            Animate.PropertyGrid.getSingleton().removeEventListener(Animate.PropertyGridEvents.PROPERTY_EDITED, this.onPropertyGridEdited, this);

            //this.pGridProxy = null;
            this.asset = null;
            this.saved = null;
            this.assetClass = null;

            //Call super
            _super.prototype.dispose.call(this);
        };
        return TreeNodeAssetInstance;
    })(Animate.TreeNode);
    Animate.TreeNodeAssetInstance = TreeNodeAssetInstance;
})(Animate || (Animate = {}));
//# sourceMappingURL=TreeNodeAssetInstance.js.map
