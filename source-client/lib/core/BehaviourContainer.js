var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Animate;
(function (Animate) {
    /**
    * Each project has a list of behaviours. These are saved into the
    * database and retrieved when we work with Animate. A behaviour is
    * essentially a piece of code that executes script logic.
    */
    var BehaviourContainer = (function (_super) {
        __extends(BehaviourContainer, _super);
        /**
        * {string} name The name of the container
        */
        function BehaviourContainer(name, id) {
            // Call super-class constructor
            _super.call(this);

            this._id = id;
            this._options = {};
            this._name = name;
            this.json = "";
            this.canvas = null;
            this.saved = true;

            this._properties = new Animate.EditableSet();
            this._properties.addVar("Start On Load", true, Animate.ParameterType.BOOL, "Container Properties");
            this._properties.addVar("Unload On Exit", true, Animate.ParameterType.BOOL, "Container Properties");
        }
        /**
        * This will download and update all data of the asset.
        * @param {string} name The name of the behaviour
        * @param {string} json Its data object
        */
        BehaviourContainer.prototype.update = function (name, json) {
            this._name = name;
            this.saved = true;
            this.json = json;
        };

        /**
        * This will cleanup the behaviour.
        */
        BehaviourContainer.prototype.dispose = function () {
            Animate.PluginManager.getSingleton().dispatchEvent(new Animate.PluginContainerEvent(Animate.PluginContainerEvents.CONTAINER_DELETED, this));

            //Call super
            _super.prototype.dispose.call(this);

            this._properties = null;
            this._id = null;
            this._name = null;
            this.json = null;
            this.canvas = null;
            this.saved = null;
            this._options = null;
        };

        Object.defineProperty(BehaviourContainer.prototype, "id", {
            get: function () {
                return this._id;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BehaviourContainer.prototype, "name", {
            get: function () {
                return this._name;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(BehaviourContainer.prototype, "properties", {
            get: function () {
                return this._properties;
            },
            set: function (val) {
                if (val instanceof Animate.EditableSet)
                    this._properties = val;
else {
                    this._properties.variables.splice(0, this._properties.variables.length);
                    for (var i in val)
                        this._properties.addVar(val[i].name, val[i].value, Animate.ParameterType.fromString(val[i].type), val[i].category);
                }
            },
            enumerable: true,
            configurable: true
        });

        /** Creates an option which is associated with this asset. The name of the option must be unique. Use this to add your own custom data */
        BehaviourContainer.prototype.createOption = function (name, val) {
            this._options[name] = val;
        };

        /**  Update the value of an option */
        BehaviourContainer.prototype.updateOption = function (name, val) {
            this._options[name] = val;
        };

        /** Returns the value of an option */
        BehaviourContainer.prototype.getOption = function (name) {
            return this._options[name];
        };
        return BehaviourContainer;
    })(Animate.EventDispatcher);
    Animate.BehaviourContainer = BehaviourContainer;
})(Animate || (Animate = {}));
//# sourceMappingURL=BehaviourContainer.js.map
