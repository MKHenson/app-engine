var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Animate;
(function (Animate) {
    /**
    *  A tree node class for behaviour container objects.
    */
    var TreeNodeBehaviour = (function (_super) {
        __extends(TreeNodeBehaviour, _super);
        /**
        * @param {BehaviourContainer} behaviour The container we are associating with this node
        */
        function TreeNodeBehaviour(behaviour) {
            // Call super-class constructor
            _super.call(this, behaviour.name, "media/variable.png", false);

            this.element.addClass("behaviour-to-canvas");

            this.canDelete = true;
            this.canUpdate = true;
            this.saved = true;
            this.behaviour = behaviour;

            this.element.draggable({ opacity: 0.7, helper: "clone", appendTo: "body", containment: "body" });
            Animate.PropertyGrid.getSingleton().addEventListener(Animate.PropertyGridEvents.PROPERTY_EDITED, this.onPropertyGridEdited, this);
        }
        /**
        * Called when the node is selected
        */
        TreeNodeBehaviour.prototype.onSelect = function () {
            Animate.PropertyGrid.getSingleton().editableObject(this.behaviour.properties, this.text, this, "media/variable.png");
        };

        /**
        * When we click ok on the portal form
        */
        TreeNodeBehaviour.prototype.onPropertyGridEdited = function (response, event, sender) {
            if (event.id == this) {
                this.save(false);
                this.behaviour.properties.updateValue(event.propertyName, event.propertyValue);
            }
        };

        /** Notifies if this node is saved or unsaved. */
        TreeNodeBehaviour.prototype.save = function (val) {
            this.saved = val;
            this.behaviour.saved = val;
            this.text = this.originalText;
        };


        Object.defineProperty(TreeNodeBehaviour.prototype, "text", {
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
                //First we try and get the tab
                var tabPair = Animate.CanvasTab.getSingleton().getTab(this.originalText);

                if (tabPair == null)
                    tabPair = Animate.CanvasTab.getSingleton().getTab("*" + this.originalText);

                if (tabPair) {
                    this.originalText = val;
                    jQuery(".text:first", this.element).text((this.behaviour.saved ? "" : "*") + this.originalText);

                    jQuery(".text", tabPair.tabSelector.element).text((this.behaviour.saved ? "" : "*") + this.originalText);
                    tabPair.name = (this.behaviour.saved ? "" : "*") + this.originalText;
                } else {
                    this.originalText = val;
                    jQuery(".text:first", this.element).text((this.behaviour.saved ? "" : "*") + this.originalText);
                }

                this.behaviour.name = this.originalText;
            },
            enumerable: true,
            configurable: true
        });

        /**This will cleanup the component.*/
        TreeNodeBehaviour.prototype.dispose = function () {
            if (this.element.hasClass("draggable"))
                this.element.draggable("destroy");

            Animate.PropertyGrid.getSingleton().removeEventListener(Animate.PropertyGridEvents.PROPERTY_EDITED, this.onPropertyGridEdited, this);
            this.behaviour = null;

            //Call super
            _super.prototype.dispose.call(this);
        };
        return TreeNodeBehaviour;
    })(Animate.TreeNode);
    Animate.TreeNodeBehaviour = TreeNodeBehaviour;
})(Animate || (Animate = {}));
//# sourceMappingURL=TreeNodeBehaviour.js.map
