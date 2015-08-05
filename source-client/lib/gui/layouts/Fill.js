var Animate;
(function (Animate) {
    /**
    * A simple fill layout. Fills a component to its parent width and height. Optional
    * offsets can be used to tweak the fill.
    */
    var Fill = (function () {
        function Fill(offsetX, offsetY, offsetWidth, offsetHeight, resrtictHorizontal, resrtictVertical) {
            if (typeof offsetX === "undefined") { offsetX = 0; }
            if (typeof offsetY === "undefined") { offsetY = 0; }
            if (typeof offsetWidth === "undefined") { offsetWidth = 0; }
            if (typeof offsetHeight === "undefined") { offsetHeight = 0; }
            if (typeof resrtictHorizontal === "undefined") { resrtictHorizontal = false; }
            if (typeof resrtictVertical === "undefined") { resrtictVertical = false; }
            this.offsetX = offsetX;
            this.offsetY = offsetY;
            this.offsetWidth = offsetWidth;
            this.offsetHeight = offsetHeight;
            this.resrtictHorizontal = resrtictHorizontal;
            this.resrtictVertical = resrtictVertical;
        }
        /**
        * Sets the component width and height to its parent.
        * @param {Component} component The {Component} we are setting dimensions for.
        */
        Fill.prototype.update = function (component) {
            var e = component.element;
            var parent = e.parent();

            if (parent != null && parent.length != 0) {
                var parentOverflow = parent.css("overflow");
                parent.css("overflow", "hidden");

                var w = parent.width();
                var h = parent.height();

                e.css({
                    width: (this.resrtictHorizontal === false ? (w + this.offsetWidth).toString() : ""),
                    height: (this.resrtictVertical === false ? (h + this.offsetHeight).toString() : ""),
                    left: this.offsetX,
                    top: this.offsetY
                });

                parent.css("overflow", parentOverflow);
            }
        };
        return Fill;
    })();
    Animate.Fill = Fill;
})(Animate || (Animate = {}));
//# sourceMappingURL=Fill.js.map
