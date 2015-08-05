var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Animate;
(function (Animate) {
    /**
    * A small holder div that emulates C# style grids. Use the content variable instead of the group directly
    */
    var Group = (function (_super) {
        __extends(Group, _super);
        function Group(text, parent) {
            _super.call(this, "<div class='group'></div>", parent);

            this.heading = new Animate.Label(text, this);
            this.heading.element.addClass("group-header");
            this.content = this.addChild("<div class='group-content'></div>");
        }
        /**
        * Gets or sets the label text
        * @param {string} val The text for this label
        * @returns {string} The text for this label
        */
        Group.prototype.text = function (val) {
            return this.heading.element.text(val);
        };

        /**
        * This will cleanup the <Group>.
        */
        Group.prototype.dispose = function () {
            this.heading = null;
            this.content = null;

            //Call super
            _super.prototype.dispose.call(this);
        };
        return Group;
    })(Animate.Component);
    Animate.Group = Group;
})(Animate || (Animate = {}));
//# sourceMappingURL=Group.js.map
