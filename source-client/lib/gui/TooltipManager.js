var Animate;
(function (Animate) {
    /**
    * A singleton class that manages displaying the tooltips of various components.
    */
    var TooltipManager = (function () {
        function TooltipManager() {
            /**
            * @description Called when we hover over an element.
            * @param {any} e The JQUery event object
            */
            this.onMove = function (e) {
                var comp = jQuery(e.target).data("component");
                if (!comp)
                    return;

                var label = this.label;

                var tt = comp.tooltip;
                var elm = label.element;

                if (tt && tt != "") {
                    label.text = tt;

                    var h = label.element.height();
                    var w = label.element.width();

                    elm.show();
                    var y = (e.clientY - h - 20 < 0 ? 0 : e.clientY - h - 20 - 20);
                    var x = (e.clientX + w + 20 < jQuery("body").width() ? e.clientX + 20 : jQuery("body").width() - w);
                    elm.css({ left: x + "px", top: y + "px" });
                } else
                    elm.hide();
            };
            if (TooltipManager._singleton != null)
                throw new Error("The TooltipManager class is a singleton. You need to call the TooltipManager.getSingleton() function.");

            TooltipManager._singleton = this;

            this.label = new Animate.Label("tooltip", Animate.Application.getInstance(), "<div class='label tooltip shadow-small'></div>");
            this.label.element.hide();

            jQuery("body").on("mousemove", this.onMove.bind(this));
        }
        TooltipManager.create = /**
        * Gets the singleton instance
        */
        function () {
            if (TooltipManager._singleton === undefined)
                TooltipManager._singleton = new TooltipManager();

            return TooltipManager._singleton;
        };
        return TooltipManager;
    })();
    Animate.TooltipManager = TooltipManager;
})(Animate || (Animate = {}));
//# sourceMappingURL=TooltipManager.js.map
