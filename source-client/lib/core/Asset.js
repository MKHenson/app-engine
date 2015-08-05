var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Animate;
(function (Animate) {
    var Asset = (function (_super) {
        __extends(Asset, _super);
        /**
        * @param {string} name The name of the asset
        * @param {string} className The name of the "class" or "template" that this asset belongs to
        * @param {string} json The JSON string, unparsed, with all the asset properties
        */
        function Asset(name, className, json) {
            if (typeof name === "undefined") { name = ""; }
            if (typeof className === "undefined") { className = ""; }
            if (typeof json === "undefined") { json = ""; }
            // Call super-class constructor
            _super.call(this);

            this._options = {};
            this.id = null;
            this.name = name;
            this.saved = true;
            this._properties = new Animate.EditableSet();

            if (json)
                this.properties = JSON.parse(json);

            this._className = className;
        }
        /** Writes this assset to a readable string */
        Asset.prototype.toString = function () {
            return this.name + "(" + this.id + ")";
        };

        /**
        * Use this function to reset the asset properties
        * @param {string} name The name of the asset
        * @param {string} className The "class" or "template" name of the asset
        * @param {string} json The unparsed JSON data of the asset.
        */
        Asset.prototype.update = function (name, className, json) {
            this.name = name;
            this.saved = true;
            if (json == "")
                this._properties = null;
else
                this.properties = json;

            this._className = className;
        };

        /**
        * Disposes and cleans up the data of this asset
        */
        Asset.prototype.dispose = function () {
            //Call super
            _super.prototype.dispose.call(this);

            this.id = null;
            this.name = null;
            this.json = null;
            this._className = null;
            this._options = null;
        };

        /** Creates an option which is associated with this asset. The name of the option must be unique. Use this to add your own custom data */
        Asset.prototype.createOption = function (name, val) {
            this._options[name] = val;
        };

        /**  Update the value of an option */
        Asset.prototype.updateOption = function (name, val) {
            this._options[name] = val;
        };

        /** Returns the value of an option */
        Asset.prototype.getOption = function (name) {
            return this._options[name];
        };

        Object.defineProperty(Asset.prototype, "className", {
            get: function () {
                return this._className;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Asset.prototype, "properties", {
            get: function () {
                return this._properties;
            },
            set: function (val) {
                this._properties.variables.splice(0, this._properties.variables.length);

                if (val instanceof Animate.EditableSet)
                    this._properties = val;
else {
                    for (var i in val)
                        this._properties.addVar(val[i].name, val[i].value, Animate.ParameterType.fromString(val[i].type), val[i].category);
                }
            },
            enumerable: true,
            configurable: true
        });
        return Asset;
    })(Animate.EventDispatcher);
    Animate.Asset = Asset;
})(Animate || (Animate = {}));
//# sourceMappingURL=Asset.js.map
