var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Animate;
(function (Animate) {
    /**
    * This represents a combo property for assets that the user can select from a list.
    */
    var PropComboAsset = (function (_super) {
        __extends(PropComboAsset, _super);
        function PropComboAsset(grid) {
            _super.call(this, grid);
        }
        /**
        * Called when a property grid is editing an object. The property name, value and type are passed.
        * If this editor can edit the property it returns a valid JQuery object which is responsible for editing
        * the object. The property grid makes no effort to maintain this. It is up to the Editor to watch the JQuery through
        * events to see when its been interacted with. Once its been edited, the editor must notify the grid - to do this
        * call the notify method.
        * @param {string} propertyName The name of the property we are creating an HTML element for
        * @param {any} propertyValue The current value of that property
        * @param {ParameterType} objectType The type of property we need to create
        * @returns {JQuery} A valid jQuery object or null if this editor does not support this property.
        */
        PropComboAsset.prototype.edit = function (propertyName, propertyValue, objectType) {
            if (objectType != Animate.ParameterType.ASSET)
                return null;

            //Create HTML
            var editor = this.createEditorJQuery(propertyName, "<select class='prop-combo' style = 'width:90%;'></select><div class='eye-picker'><img src='media/eye.png'/></div>", propertyValue);

            var selector = jQuery("select", editor);
            var eye = jQuery(".eye-picker", editor);
            var parts = propertyValue.split(":");

            var selectedID = parts[0];
            var className = parts[1];
            var nodes = Animate.TreeViewScene.getSingleton().getAssets(className);

            //Create the blank
            selector.append("<option value='' " + (selectedID == "" ? "selected='selected'" : "") + "></option>");

            //Sort alphabetically
            nodes = nodes.sort(function (a, b) {
                var textA = a.asset.name.toUpperCase();
                var textB = b.asset.name.toUpperCase();
                return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
            });

            var len = nodes.length;
            for (var i = 0; i < len; i++)
                selector.append("<option title='" + nodes[i].asset.id + " : " + nodes[i].asset.className + "' value='" + nodes[i].asset.id + "' " + (selectedID == nodes[i].asset.id ? "selected='selected'" : "") + ">" + nodes[i].asset.name + "</option>");

            var that = this;

            //Functions to deal with user interactions with JQuery
            var onSelect = function (e) {
                var val = selector.val();
                that.notify(propertyName, val + ":" + parts[1], objectType);
            };
            var onEye = function (e) {
                var val = selector.val();
                var parts = propertyValue.split(":");
                var asset = Animate.User.getSingleton().project.getAsset(val);

                if (asset)
                    Animate.TreeViewScene.getSingleton().selectNode(Animate.TreeViewScene.getSingleton().findNode("asset", asset), true);
else
                    Animate.TreeViewScene.getSingleton().selectNode(Animate.TreeViewScene.getSingleton().findNode("className", parts[1]), true);
            };

            //Add listeners
            eye.on("mouseup", onEye);
            selector.on("change", onSelect);

            //Finall return editor as HTML to be added to the page
            return editor;
        };

        /**
        * Updates the value of the editor object  because a value was edited externally.
        * @param {any} newValue The new value
        * @param {JQuery} editHTML The JQuery that was generated by this editor that needs to be updated because something has updated the value externally.
        */
        PropComboAsset.prototype.update = function (newValue, editHTML) {
            //TODO
        };
        return PropComboAsset;
    })(Animate.PropertyGridEditor);
    Animate.PropComboAsset = PropComboAsset;
})(Animate || (Animate = {}));
//# sourceMappingURL=PropComboAsset.js.map
