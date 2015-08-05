var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Animate;
(function (Animate) {
    /**
    * This is an implementation of the tab class
    */
    var SceneTab = (function (_super) {
        __extends(SceneTab, _super);
        /**
        * @param {Component} parent The parent of the button
        */
        function SceneTab(parent) {
            _super.call(this, parent);

            if (SceneTab._singleton != null)
                throw new Error("The SceneTab class is a singleton. You need to call the SceneTab.get() function.");

            SceneTab._singleton = this;

            this.element.css({ width: "100%", height: "100%" });
            this.mDocker = null;

            //Add the main tabs
            this.assetPanel = this.addTab("Assets", false).page;

            new Animate.TreeViewScene(this.assetPanel);
        }
        /**This is called by a controlling ScreenManager class. An image string needs to be returned
        * which will act as a preview of the component that is being viewed or hidden.*/
        SceneTab.prototype.getPreviewImage = function () {
            return "media/world_48.png";
        };

        /*Each IDock item needs to implement this so that we can keep track of where it moves.*/
        SceneTab.prototype.getDocker = function () {
            return this.mDocker;
        };

        /*Each IDock item needs to implement this so that we can keep track of where it moves.*/
        SceneTab.prototype.setDocker = function (val) {
            this.mDocker = val;
        };

        /*This is called by a controlling Docker class when the component needs to be shown.*/
        SceneTab.prototype.onShow = function () {
        };

        /*This is called by a controlling Docker class when the component needs to be hidden.*/
        SceneTab.prototype.onHide = function () {
        };

        SceneTab.getSingleton = /** Gets the singleton instance. */
        function (parent) {
            if (!SceneTab._singleton)
                new SceneTab(parent);

            return SceneTab._singleton;
        };
        return SceneTab;
    })(Animate.Tab);
    Animate.SceneTab = SceneTab;
})(Animate || (Animate = {}));
//# sourceMappingURL=SceneTab.js.map
