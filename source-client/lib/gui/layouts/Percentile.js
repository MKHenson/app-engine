var Animate;
(function (Animate) {
    /**
    * A simple Percentile layout. Changes a component's dimensions to be a
    * percentage of its parent width and height.
    */
    var Percentile = (function () {
        function Percentile(widthPercent, heightPercent) {
            if (typeof widthPercent === "undefined") { widthPercent = 1; }
            if (typeof heightPercent === "undefined") { heightPercent = 1; }
            this.widthPercent = widthPercent;
            this.heightPercent = heightPercent;
        }
        /**
        * Sets the component width and height to its parent.
        * @param {Component} component The {Component} we are setting dimensions for.
        */
        Percentile.prototype.update = function (component) {
            var e = component.element;
            var parent = e.parent();

            if (parent != null && parent.length != 0) {
                var parentOverflow = parent.css("overflow");
                parent.css("overflow", "hidden");

                var w = parent.width();
                var h = parent.height();

                e.css({
                    width: (this.widthPercent * w) + "px",
                    height: (this.heightPercent * h) + "px"
                });

                parent.css("overflow", parentOverflow);
            }
        };
        return Percentile;
    })();
    Animate.Percentile = Percentile;
})(Animate || (Animate = {}));
//# sourceMappingURL=Percentile.js.map
