var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Animate;
(function (Animate) {
    /**
    * The ListViewHeader class is used in the ListView class. It acts as the first selectable item row in the list view.
    */
    var ListViewHeader = (function (_super) {
        __extends(ListViewHeader, _super);
        /**
        * @param {string} text The text of the header
        * @param {string} image The optional image of the header
        */
        function ListViewHeader(text, image) {
            // Call super-class constructor
            _super.call(this, "<div class='list-view-header light-gradient'><span class='inner'>" + (image && image != "" ? "<img src='" + image + "'/>" : "") + text + "</span><div class='dragger light-gradient'></div></div>", null);

            this.text = text;
        }
        return ListViewHeader;
    })(Animate.Component);
    Animate.ListViewHeader = ListViewHeader;
})(Animate || (Animate = {}));
//# sourceMappingURL=ListViewHeader.js.map
