var Animate;
(function (Animate) {
    /**
    * A simple class to define portal behaviour.
    */
    var PortalTemplate = (function () {
        /**
        * @param {string} name This is the name of the template
        * @param {PortalType} type The type of portal this represents. Defined in the Portal class.
        * @param {ParameterType} dataType The portal value type (see value types)
        * @param {any} value The default value of the portal
        */
        function PortalTemplate(name, type, dataType, value) {
            if (!dataType)
                dataType = Animate.ParameterType.OBJECT;
            if (!value)
                value = "";

            this.name = name;
            this.type = type;
            this.dataType = dataType;
            this.value = value;
        }
        return PortalTemplate;
    })();
    Animate.PortalTemplate = PortalTemplate;
})(Animate || (Animate = {}));
//# sourceMappingURL=PortalTemplate.js.map
