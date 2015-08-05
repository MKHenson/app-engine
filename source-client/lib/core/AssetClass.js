var Animate;
(function (Animate) {
    /**
    * Describes an asset variable
    */
    var VariableTemplate = (function () {
        function VariableTemplate(name, value, type, category) {
            this.name = name;
            this.category = category;
            this.type = type;
            this.value = value;
        }
        return VariableTemplate;
    })();
    Animate.VariableTemplate = VariableTemplate;

    /**
    * This class describes a template. These templates are used when creating assets.
    */
    var AssetClass = (function () {
        function AssetClass(name, parent, imgURL, abstractClass) {
            if (typeof abstractClass === "undefined") { abstractClass = false; }
            this._abstractClass = abstractClass;
            this._name = name;
            this.parentClass = parent;
            this._imgURL = imgURL;
            this.variables = [];
            this.classes = [];
        }
        /**
        * Creates an object of all the variables for an instance of this class.
        * @returns {EditableSet} The variables we are editing
        */
        AssetClass.prototype.buildVariables = function () {
            var toRet = new Animate.EditableSet();

            var topClass = this;
            while (topClass != null) {
                for (var i = 0; i < topClass.variables.length; i++) {
                    var variable = topClass.variables[i];
                    toRet.addVar(variable.name, variable.value, Animate.ENUM.fromString(variable.type.toString()), variable.category);
                }

                topClass = topClass.parentClass;
            }

            return toRet;
        };

        /**
        * Adds a variable to the class.
        * @param {string} name The name of the variable
        * @param {any} value The variables default value
        * @param {string} type A string that defines what type of variable it can be.
        * @param {string} category An optional category tag for this variable. This is used for organisational purposes.
        * @returns {AssetClass} A reference to this AssetClass
        */
        AssetClass.prototype.addVar = function (name, value, type, category) {
            category = (category == null || category === undefined ? "" : category);

            this.variables.push({ name: name, value: value, type: type, category: category });
            return this;
        };

        /**
        * This will clear and dispose of all the nodes
        */
        AssetClass.prototype.dispose = function () {
            var len = this.classes.length;
            for (var i = 0; i < len; i++)
                if (this.classes[i].name == name)
                    this.classes[i].dispose();

            this._abstractClass = null;
            this._name = null;
            this.parentClass = null;
            this.variables = null;
            this._imgURL = null;
            this.classes = null;
        };

        Object.defineProperty(AssetClass.prototype, "imgURL", {
            get: function () {
                return this._imgURL;
            },
            enumerable: true,
            configurable: true
        });

        /**
        * Adds a class
        * @param {string} name The name of the class
        * @param {string} img The optional image of the class
        * @param {boolean} abstractClass A boolean to define if this class is abstract or not. I.e. does this class allow for creating assets or is it just the base for others.
        * @returns {AssetClass}
        */
        AssetClass.prototype.addClass = function (name, img, abstractClass) {
            var toAdd = new AssetClass(name, this, img, abstractClass);
            this.classes.push(toAdd);
            return toAdd;
        };

        Object.defineProperty(AssetClass.prototype, "name", {
            get: function () {
                return this._name;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AssetClass.prototype, "abstractClass", {
            get: function () {
                return this._abstractClass;
            },
            enumerable: true,
            configurable: true
        });
        return AssetClass;
    })();
    Animate.AssetClass = AssetClass;
})(Animate || (Animate = {}));
//# sourceMappingURL=AssetClass.js.map
