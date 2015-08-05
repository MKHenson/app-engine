var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Animate;
(function (Animate) {
    /**
    * This is the implementation of the context menu on the canvas.
    */
    var CanvasContext = (function (_super) {
        __extends(CanvasContext, _super);
        function CanvasContext(width) {
            // Call super-class constructor
            _super.call(this, width);

            //Add the items
            this.mDel = this.addItem("<img src='media/cross.png' />Delete");
            this.mCreate = this.addItem("<img src='media/behavior_20.png' />Create Behaviour");
            this.mCreateComment = this.addItem("<img src='media/comment.png' />Create Comment");
            this.mCreateInput = this.addItem("<img src='media/portal.png' />Create Input");
            this.mCreateOutput = this.addItem("<img src='media/portal.png' />Create Output");
            this.mCreateParam = this.addItem("<img src='media/portal.png' />Create Parameter");
            this.mCreateProduct = this.addItem("<img src='media/portal.png' />Create Product");
            this.mEditPortal = this.addItem("<img src='media/portal.png' />Edit Portal");
            this.mDelEmpty = this.addItem("<img src='media/cross.png' />Remove Empty Assets");
        }
        /**
        * Shows the window by adding it to a parent.
        */
        CanvasContext.prototype.showContext = function (x, y, item) {
            this.mCreateInput.show();
            this.mCreateOutput.show();
            this.mCreateParam.show();
            this.mCreateProduct.show();
            this.mEditPortal.hide();
            this.mDelEmpty.hide();

            if (item == null) {
                this.mDel.hide();
                this.mCreate.show();
                this.mCreateComment.show();
                this.mDelEmpty.show();
            } else if (item instanceof Animate.Portal) {
                this.mCreateInput.hide();
                this.mCreateOutput.hide();
                this.mCreateParam.hide();
                this.mCreateProduct.hide();
                this.mDel.hide();

                if ((item).customPortal) {
                    this.mEditPortal.show();
                    this.mDel.show();
                    this.mCreate.hide();
                    this.mCreateComment.hide();
                } else
                    return;
            } else if (item instanceof Animate.Behaviour || item instanceof Animate.BehaviourPortal) {
                this.mDel.show();
                this.mCreate.hide();
                this.mCreateComment.hide();

                this.mCreateInput.hide();
                this.mCreateOutput.hide();
                this.mCreateParam.hide();
                this.mCreateProduct.hide();

                if (item instanceof Animate.BehaviourPortal == false) {
                    var template = Animate.PluginManager.getSingleton().getTemplate((item).text);
                    if (template) {
                        if (template.canBuildOutput)
                            this.mCreateOutput.show();
                        if (template.canBuildInput)
                            this.mCreateInput.show();
                        if (template.canBuildParameter)
                            this.mCreateParam.show();
                        if (template.canBuildProduct)
                            this.mCreateProduct.show();
                    }
                }
            }

            _super.prototype.show.call(this, null, x, y, false, true);
        };
        return CanvasContext;
    })(Animate.ContextMenu);
    Animate.CanvasContext = CanvasContext;
})(Animate || (Animate = {}));
//# sourceMappingURL=CanvasContext.js.map
