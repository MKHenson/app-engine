var Animate;
(function (Animate) {
    /**
    *  A simple class to define the behavior of a behaviour object.
    */
    var BehaviourDefinition = (function () {
        /**
        * @param <string> behaviourName The name of the behaviour
        * @param <bool> canBuildInput
        * @param <bool> canBuildOutput
        * @param <bool> canBuildParameter
        * @param <bool> canBuildProduct
        * @param <array> portalTemplates
        * @param <IPlugin> plugin The plugin this is associated with
        */
        function BehaviourDefinition(behaviourName, canBuildInput, canBuildOutput, canBuildParameter, canBuildProduct, portalTemplates, plugin) {
            if (typeof canBuildInput === "undefined") { canBuildInput = true; }
            if (typeof canBuildOutput === "undefined") { canBuildOutput = true; }
            if (typeof canBuildParameter === "undefined") { canBuildParameter = true; }
            if (typeof canBuildProduct === "undefined") { canBuildProduct = true; }
            if (typeof portalTemplates === "undefined") { portalTemplates = null; }
            if (typeof plugin === "undefined") { plugin = null; }
            this._behaviourName = behaviourName;
            this._canBuildOutput = canBuildOutput;
            this._canBuildInput = canBuildInput;
            this._canBuildParameter = canBuildParameter;
            this._canBuildProduct = canBuildProduct;
            this._portalTemplates = portalTemplates;
            this._plugin = plugin;
        }
        /* This function is called by Animate to get an array of
        TypeConverters. TypeConverter objects define if one type can be translated to another. They
        also define what the process of conversion will be. */
        BehaviourDefinition.prototype.dispose = function () {
            this._behaviourName = null;
            this._canBuildOutput = null;
            this._canBuildInput = null;
            this._canBuildParameter = null;
            this._canBuildProduct = null;
            this._portalTemplates = null;
            this._plugin = null;
        };

        /* This function is called by Animate to see if a behaviour can build output portals.
        @return {boolean} Return true if you want Animate to allow for building outputs.*/
        BehaviourDefinition.prototype.canBuildOutput = function (behaviour) {
            return this._canBuildOutput;
        };

        /* This function is called by Animate to see if a behaviour can build input portals.
        @return {boolean} Return true if you want Animate to allow for building inputs.*/
        BehaviourDefinition.prototype.canBuildInput = function (behaviour) {
            return this._canBuildInput;
        };

        /* This function is called by Animate to see if a behaviour can build product portals.
        @return {boolean} Return true if you want Animate to allow for building products.*/
        BehaviourDefinition.prototype.canBuildProduct = function (behaviour) {
            return this._canBuildProduct;
        };

        /* This function is called by Animate to see if a behaviour can build parameter portals.
        @return {boolean} Return true if you want Animate to allow for building parameters.*/
        BehaviourDefinition.prototype.canBuildParameter = function (behaviour) {
            return this._canBuildParameter;
        };

        /* This function is called by Animate When a new behaviour is being created. The definition
        has to provide the behaviour with an array of PortalTemplates.
        @return {boolean} Return an array of PortalTemplates objects.*/
        BehaviourDefinition.prototype.createPortalsTemplates = function () {
            return this._portalTemplates;
        };

        Object.defineProperty(BehaviourDefinition.prototype, "behaviourName", {
            get: function () {
                return this._behaviourName;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BehaviourDefinition.prototype, "plugin", {
            get: function () {
                return this._plugin;
            },
            enumerable: true,
            configurable: true
        });
        return BehaviourDefinition;
    })();
    Animate.BehaviourDefinition = BehaviourDefinition;
})(Animate || (Animate = {}));
//# sourceMappingURL=BehaviourDefinition.js.map
