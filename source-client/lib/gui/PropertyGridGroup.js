var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Animate;
(function (Animate) {
    /**
    * This small class is used to group property grid elements together
    */
    var PropertyGridGroup = (function (_super) {
        __extends(PropertyGridGroup, _super);
        function PropertyGridGroup(name) {
            // Call super-class constructor
            _super.call(this, "<div class='property-grid-group curve-small'></div>", null);

            this.name = name;
            this.element.append("<div class='property-grid-group-header'>" + name + "</div>");
            this.content = jQuery("<div class='content'></div>");
            this.element.append(this.content);
        }
        /**
        * This function is used to clean up the PropertyGridGroup
        */
        PropertyGridGroup.prototype.dispose = function () {
            this.name = null;
            this.content = null;

            //Call super
            _super.prototype.dispose.call(this);
        };
        return PropertyGridGroup;
    })(Animate.Component);
    Animate.PropertyGridGroup = PropertyGridGroup;
})(Animate || (Animate = {}));
//# sourceMappingURL=PropertyGridGroup.js.map
