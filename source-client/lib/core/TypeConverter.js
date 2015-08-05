var Animate;
(function (Animate) {
    var TypeConverter = (function () {
        function TypeConverter(typeA, typeB, conversionOptions, plugin) {
            this.typeA = typeA;
            this.typeB = typeB;
            this.conversionOptions = conversionOptions;
            this.plugin = plugin;
        }
        /** Checks if this converter supports a conversion. */
        TypeConverter.prototype.canConvert = function (typeA, typeB) {
            if (this.typeA == typeA && this.typeB == typeB)
                return true;
else
                return false;
        };

        /** Cleans up the object. */
        TypeConverter.prototype.dispose = function () {
            this.typeA = null;
            this.typeB = null;
            this.conversionOptions = null;
            this.plugin = null;
        };
        return TypeConverter;
    })();
    Animate.TypeConverter = TypeConverter;
})(Animate || (Animate = {}));
//# sourceMappingURL=TypeConverter.js.map
