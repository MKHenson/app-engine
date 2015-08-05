var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Animate;
(function (Animate) {
    /**
    * This form is used to create or edit Portals.
    */
    var PortalForm = (function (_super) {
        __extends(PortalForm, _super);
        function PortalForm() {
            if (PortalForm._singleton != null)
                throw new Error("The PortalForm class is a singleton. You need to call the PortalForm.getSingleton() function.");

            PortalForm._singleton = this;

            // Call super-class constructor
            _super.call(this, 400, 250, true, true, "Window");
            this.element.addClass("portal-form");

            this._typeCombo = new Animate.ComboBox();
            this._assetClassCombo = new Animate.ComboBox();
            this._name = new Animate.LabelVal(this.okCancelContent, "Name", new Animate.InputBox(null, ""));
            this._type = new Animate.LabelVal(this.okCancelContent, "Type", this._typeCombo);
            this._assetType = new Animate.LabelVal(this.okCancelContent, "Class", this._assetClassCombo);
            this._assetType.element.hide();

            this._portalType = null;
            this._item = null;
            this._value = null;

            this._warning = new Animate.Label("Please enter a behaviour name.", this.okCancelContent);

            this._typeCombo.addEventListener(Animate.ListEvents.ITEM_SELECTED, this.onTypeSelect.bind(this));
            this.onTypeSelect(Animate.ListEvents.ITEM_SELECTED, new Animate.ListEvent(Animate.ListEvents.ITEM_SELECTED, "asset"));
        }
        /** When the type combo is selected*/
        PortalForm.prototype.onTypeSelect = function (responce, event) {
            if (event.item == "asset") {
                this._assetClassCombo.clearItems();
                var classes = Animate.TreeViewScene.getSingleton().getAssetClasses();

                classes = classes.sort(function (a, b) {
                    var textA = a.name.toUpperCase();
                    var textB = b.name.toUpperCase();
                    return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
                });

                for (var i = 0; i < classes.length; i++)
                    this._assetClassCombo.addItem(classes[i].name);

                this._assetType.element.show();
                this._assetType.element.fadeIn("fast");
            } else {
                this._assetType.element.hide();
            }
        };

        PortalForm.prototype.showForm = function (item, type, caption) {
            var types = Animate.PluginManager.getSingleton().dataTypes;

            if (item instanceof Animate.Portal) {
                type = (item).type;
                caption = "Edit " + (item).name;
            }

            this._portalType = type;
            (this._name.val).text = (item instanceof Animate.Portal ? (item).name : "");
            this._item = item;

            this._warning.textfield.element.css("color", "");
            this._warning.text = "";

            //Fill types
            (this._type.val).clearItems();
            for (var i = 0; i < types.length; i++)
                (this._type.val).addItem(types[i]);

            (this._name.val).textfield.element.removeClass("red-border");
            (this._type.val).selectBox.element.removeClass("red-border");

            if (type == Animate.PortalType.OUTPUT || type == Animate.PortalType.INPUT) {
                this._type.element.hide();
                this._assetType.element.hide();
                this._value = true;
            } else {
                this._type.element.show();

                if (item instanceof Animate.Portal)
                    this._typeCombo.selectedItem = ((item).dataType).toString();

                this.onTypeSelect(Animate.ListEvents.ITEM_SELECTED, new Animate.ListEvent(Animate.ListEvents.ITEM_SELECTED, (this._type.val).selectedItem));
            }

            if (item instanceof Animate.Portal)
                this.headerText = caption;
else if (item instanceof Animate.Behaviour)
                this.headerText = (item).text;
else if (item instanceof Animate.Canvas)
                this.headerText = caption;
else
                this.headerText = item.toString();

            _super.prototype.show.call(this);

            (this._name.val).textfield.element.focus();
        };

        /**Called when we click one of the buttons. This will dispatch the event OkCancelForm.CONFIRM
        and pass the text either for the ok or cancel buttons. */
        PortalForm.prototype.OnButtonClick = function (e) {
            if (jQuery(e.target).text() == "Ok") {
                //Check if the values are valid
                (this._name.val).textfield.element.removeClass("red-border");
                (this._type.val).selectBox.element.removeClass("red-border");

                var newName = jQuery.trim((this._name.val).text);

                if (this._item instanceof Animate.Behaviour || this._item instanceof Animate.Portal) {
                    var behaviour = this._item;
                    if (this._item instanceof Animate.Portal)
                        behaviour = (this._item).behaviour;

                    for (var i = 0; i < behaviour.portals.length; i++) {
                        if (behaviour.portals[i].name == newName && (this._item instanceof Animate.Portal && (this._item).name != behaviour.portals[i].name)) {
                            (this._name.val).textfield.element.addClass("red-border");
                            this._warning.textfield.element.css("color", "#FF0000");
                            this._warning.text = "A portal with the name " + (this._name.val).text + " is already being used on this behaviour. Portal names must be unique.";
                            return;
                        }
                    }
                } else if (this._item instanceof Animate.Canvas) {
                    for (var i = 0; i < this._item.children.length; i++) {
                        if (this._item.children[i] instanceof Animate.BehaviourPortal) {
                            var portal = this._item.children[i];
                            if (portal.text == newName) {
                                (this._name.val).textfield.element.addClass("red-border");
                                this._warning.textfield.element.css("color", "#FF0000");
                                this._warning.text = "A portal with the name " + (this._name.val).text + " is already being used on the canvas. Portal names must be unique.";
                                return;
                            }
                        }
                    }
                }

                //Check for special chars
                var message = Animate.Utils.checkForSpecialChars((this._name.val).text);
                if (message != null) {
                    (this._name.val).textfield.element.addClass("red-border");
                    this._warning.textfield.element.css("color", "#FF0000");
                    this._warning.text = message;
                    return;
                }

                if ((this._portalType != Animate.PortalType.OUTPUT && this._portalType != Animate.PortalType.INPUT) && jQuery.trim((this._type.val).selectedItem) == "") {
                    (this._type.val).element.addClass("red-border");
                    return;
                }
            }

            //Set the default value based on the type
            var type = jQuery.trim((this._type.val).selectedItem);
            if (type == "")
                this._value = "";
else if (type == "number")
                this._value = 0;
else if (type == "boolean")
                this._value = true;
else if (type == "asset")
                this._value = ":" + jQuery.trim((this._assetType.val).selectedItem);
else if (type == "object")
                this._value = "";
else if (type == "color")
                this._value = "ffffff:1";
else if (type == "object")
                this._value = "";

            _super.prototype.OnButtonClick.call(this, e);
        };

        Object.defineProperty(PortalForm.prototype, "name", {
            get: function () {
                return (this._name.val).text;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PortalForm.prototype, "portalType", {
            get: function () {
                return this._portalType;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PortalForm.prototype, "value", {
            get: function () {
                return this._value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PortalForm.prototype, "parameterType", {
            get: function () {
                if (this._typeCombo.selectedItem)
                    return Animate.ENUM.fromString(this._typeCombo.selectedItem);
else
                    return Animate.ParameterType.BOOL;
            },
            enumerable: true,
            configurable: true
        });

        PortalForm.getSingleton = /** Gets the singleton instance. */
        function () {
            if (!PortalForm._singleton)
                new PortalForm();

            return PortalForm._singleton;
        };
        return PortalForm;
    })(Animate.OkCancelForm);
    Animate.PortalForm = PortalForm;
})(Animate || (Animate = {}));
//# sourceMappingURL=PortalForm.js.map
