var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Animate;
(function (Animate) {
    /**
    * A node for displaying comments
    */
    var BehaviourComment = (function (_super) {
        __extends(BehaviourComment, _super);
        function BehaviourComment(parent, text) {
            // Call super-class constructor
            _super.call(this, parent, text);

            this.canGhost = false;

            this.element.removeClass("reg-gradient").addClass("behaviour-comment").addClass("comment").addClass("shadow-small");

            this.isInInputMode = false;
            this.stageClickProxy = jQuery.proxy(this.onStageClick, this);
            this.input = jQuery("<textarea rows='10' cols='30'></textarea>");

            this.textfield.element.css({ width: "95%", height: "95%", left: 0, top: 0 });
            this.textfield.element.text(text);

            this.element.on("mousedown", jQuery.proxy(this.onResizeStart, this));
            this.mStartX = null;
            this.mStartY = null;
            this.element.resizable({
                minHeight: 50,
                minWidth: 50,
                helper: "ui-resizable-helper",
                //start:jQuery.proxy(this.onResizeStart, this),
                resize: jQuery.proxy(this.onResizeUpdate, this),
                stop: jQuery.proxy(this.onResizeStop, this)
            });
        }
        /** Does nothing...*/
        BehaviourComment.prototype.updateDimensions = function () {
            return;
        };

        /** When the mouse enters the behaviour*/
        BehaviourComment.prototype.onIn = function (e) {
            this.element.css("opacity", 1);
        };

        /**
        * A shortcut for jQuery's css property.
        */
        BehaviourComment.prototype.css = function (propertyName, value) {
            //Call super
            var toRet = _super.prototype.css.call(this, propertyName, value);

            return toRet;
        };

        /** When the mouse enters the behaviour*/
        BehaviourComment.prototype.onOut = function (e) {
            this.element.css("opacity", 0.3);
        };

        /** When the resize starts.*/
        BehaviourComment.prototype.onResizeStart = function (event, ui) {
            this.mStartX = this.element.css("left");
            this.mStartY = this.element.css("top");

            this.mOffsetX = this.element.offset().left;
            this.mOffsetY = this.element.offset().top;
        };

        /** When the resize updates.*/
        BehaviourComment.prototype.onResizeUpdate = function (event, ui) {
            this.element.css({ left: this.mStartX, top: this.mStartY });

            var helper = jQuery(ui.helper);
            helper.css({ left: this.mOffsetX, top: this.mOffsetY });
        };

        /** When the resize stops.*/
        BehaviourComment.prototype.onResizeStop = function (event, ui) {
            this.onStageClick(null);
            this.element.css({ left: this.mStartX, top: this.mStartY });
        };

        /** Call this to allow for text editing in the comment.*/
        BehaviourComment.prototype.enterText = function () {
            if (this.isInInputMode)
                return false;

            this.input.data("dragEnabled", false);

            jQuery("body").on("click", this.stageClickProxy);
            this.isInInputMode = true;
            this.input.css({ width: this.textfield.element.width(), height: this.textfield.element.height() });

            jQuery("body").append(this.input);
            this.input.css({
                position: "absolute",
                left: this.element.offset().left + "px",
                top: this.element.offset().top + "px",
                width: this.element.width() + "px",
                height: this.element.height() + "px",
                "z-index": 9999
            });

            this.textfield.element.detach();
            this.input.val(this.textfield.element.text());
            this.input.focus();
            this.input.select();
        };

        /** When we click on the stage we go out of edit mode.*/
        BehaviourComment.prototype.onStageClick = function (e) {
            if (this.isInInputMode == false)
                return;

            if (e != null && jQuery(e.target).is(this.input))
                return;

            this.isInInputMode = false;
            jQuery("body").off("click", this.stageClickProxy);

            this.element.css({ width: this.input.width() + "px", height: this.input.height() + "px" });

            this.input.detach();
            this.element.append(this.textfield.element);

            this.input.data("dragEnabled", true);

            this.text = this.input.val();

            //this.textfield.element.text( this.input.val() );
            this.textfield.element.css({ width: "95%", height: "95%", top: 0, left: 0 });
        };

        /**This will cleanup the component.*/
        BehaviourComment.prototype.dispose = function () {
            jQuery("body").off("click", this.stageClickProxy);
            this.input.remove();

            this.stageClickProxy = null;
            this.isInInputMode = null;

            //Call super
            _super.prototype.dispose.call(this);
        };
        return BehaviourComment;
    })(Animate.Behaviour);
    Animate.BehaviourComment = BehaviourComment;
})(Animate || (Animate = {}));
//# sourceMappingURL=BehaviourComment.js.map
