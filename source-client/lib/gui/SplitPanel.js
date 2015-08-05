var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Animate;
(function (Animate) {
    var SplitOrientation = (function (_super) {
        __extends(SplitOrientation, _super);
        function SplitOrientation(v) {
            _super.call(this, v);
        }
        SplitOrientation.VERTICAL = new SplitOrientation("vertical");
        SplitOrientation.HORIZONTAL = new SplitOrientation("horizontal");
        return SplitOrientation;
    })(Animate.ENUM);
    Animate.SplitOrientation = SplitOrientation;

    /**
    * A Component that holds 2 sub Components and a splitter to split between them.
    */
    var SplitPanel = (function (_super) {
        __extends(SplitPanel, _super);
        /**
        * @param {Component} parent The parent to which this component is attached
        * @param {SplitOrientation} orientation The orientation of the slitter. It can be either SplitOrientation.VERTICAL or SplitOrientation.HORIZONTAL
        * @param {number} ratio The ratio of how far up or down, top or bottom the splitter will be. This is between 0 and 1.
        * @param {number} dividerSize The size of the split divider.
        */
        function SplitPanel(parent, orientation, ratio, dividerSize) {
            if (typeof orientation === "undefined") { orientation = SplitOrientation.VERTICAL; }
            if (typeof ratio === "undefined") { ratio = 0.5; }
            if (typeof dividerSize === "undefined") { dividerSize = 6; }
            _super.call(this, "<div class='split-panel' style='width:100px; height:100px;'></div>", parent);

            this.offsetLeft = 0;
            this.offsetTop = 0;

            //Private vars
            this.mPercent = ratio;
            this.mDividerSize = dividerSize;
            this.mPanel1 = this.addChild("<div class='panel1'></div>");
            this.mDivider = this.addChild("<div class='split-panel-divider reg-color' style='width:" + this.mDividerSize + "px;'></div>");
            this.mDividerDragging = new Animate.Component("<div class='split-panel-divider-dragging' style='width:" + this.mDividerSize + "px;'></div>");
            this.mPanel2 = this.addChild("<div class='panel2'></div>");
            this.addChild("<div class='fix'></div>");

            this.orientation = orientation;

            this.mPanelOverlay1 = jQuery("<div class='panel-input'></div>");
            this.mPanelOverlay2 = jQuery("<div class='panel-input'></div>");

            //Proxies
            this.mMouseDownProxy = this.onDividerMouseDown.bind(this);
            this.mMouseUpProxy = this.onStageMouseUp.bind(this);
            this.mMouseMoveProxy = this.onStageMouseMove.bind(this);

            //Hook the resize event
            this.mDivider.element.on('mousedown', this.mMouseDownProxy);
        }
        /**
        * This function is called when the mouse is down on the divider
        * @param {any} e The jQuery event object
        */
        SplitPanel.prototype.onDividerMouseDown = function (e) {
            //reset orientation
            this.orientation = this.orientation;

            //Add the dragger and move it to the same place.
            this.addChild(this.mDividerDragging);
            this.mDividerDragging.element.css({
                width: this.mDivider.element.css("width"),
                height: this.mDivider.element.css("height"),
                left: this.mDivider.element.css("left"),
                top: this.mDivider.element.css("top")
            });

            this.mPanel1.element.prepend(this.mPanelOverlay1);
            this.mPanel2.element.prepend(this.mPanelOverlay2);

            //jQuery("body").disableSelection( true );
            jQuery("body").on('mouseup', this.mMouseUpProxy);
            jQuery("body").on('mousemove', this.mMouseMoveProxy);

            e.preventDefault();
        };

        /**
        * This function is called when the mouse is up from the body of stage.
        * @param {any} e The jQuery event object
        */
        SplitPanel.prototype.onStageMouseUp = function (e) {
            this.mPanelOverlay1.remove();
            this.mPanelOverlay2.remove();

            jQuery("body").off('mouseup', this.mMouseUpProxy);
            jQuery("body").off('mousemove', this.mMouseMoveProxy);

            //Remove the dragger.
            this.removeChild(this.mDividerDragging);

            //jQuery("body").disableSelection( false );
            //Get the new ratio
            var left = parseFloat(this.mDividerDragging.element.css("left").split("px")[0]);
            var top = parseFloat(this.mDividerDragging.element.css("top").split("px")[0]);
            var w = this.element.width();
            var h = this.element.height();
            var ratio = 0;

            if (this.mOrientation == SplitOrientation.VERTICAL)
                ratio = left / w;
else
                ratio = top / h;

            this.ratio = ratio;

            var prevOverdlow1 = this.mPanel1.element.css("overflow");
            var prevOverdlow2 = this.mPanel2.element.css("overflow");
            this.mPanel1.element.css("overflow", "hidden");
            this.mPanel2.element.css("overflow", "hidden");

            var children = this.mPanel1.children;
            for (var i = 0; i < children.length; i++)
                children[i].update();

            var children = this.mPanel2.children;
            for (var i = 0; i < children.length; i++)
                children[i].update();

            this.mPanel1.element.css("overflow", prevOverdlow1);
            this.mPanel2.element.css("overflow", prevOverdlow2);
            //jQuery(window).trigger( 'resize' );
            //jQuery(window).trigger( 'resize' );
        };

        /**
        * Call this function to update the panel.
        */
        SplitPanel.prototype.update = function () {
            //Call super
            _super.prototype.update.call(this, false);

            var prevOverdlow1 = this.mPanel1.element.css("overflow");
            var prevOverdlow2 = this.mPanel2.element.css("overflow");
            this.mPanel1.element.css("overflow", "hidden");
            this.mPanel2.element.css("overflow", "hidden");

            //Reset orientation
            this.orientation = this.orientation;

            var children = this.mPanel1.children;
            if (children.length > 0)
                for (var i = 0; i < children.length; i++)
                    children[i].update();

            children = this.mPanel2.children;
            if (children.length > 0) {
                for (var i = 0; i < children.length; i++)
                    children[i].update();
            }

            this.mPanel1.element.css("overflow", prevOverdlow1);
            this.mPanel2.element.css("overflow", prevOverdlow2);
        };

        /**
        * This function is called when the mouse is up from the body of stage.
        * @param {any} e The jQuery event object
        */
        SplitPanel.prototype.onStageMouseMove = function (e) {
            var position = this.mDividerDragging.parent.element.offset();

            if (this.mOrientation == SplitOrientation.VERTICAL) {
                var w = this.element.width();
                var dist = e.clientX - position.left;

                if (dist < this.mDividerSize)
                    dist = this.mDividerSize;
                if (dist > w - this.mDividerSize)
                    dist = w - this.mDividerSize;

                this.mDividerDragging.element.css({
                    left: dist + "px"
                });
            } else {
                var h = this.element.height();
                var dist = e.clientY - position.top;

                if (dist < this.mDividerSize)
                    dist = this.mDividerSize;
                if (dist > h - this.mDividerSize)
                    dist = h - this.mDividerSize;

                this.mDividerDragging.element.css({
                    top: dist + "px"
                });
            }

            e.preventDefault();
            return false;
        };

        Object.defineProperty(SplitPanel.prototype, "ratio", {
            get: /**
            * Call this function to get the ratio of the panel. Values are from 0 to 1.
            */
            function () {
                return this.mPercent;
            },
            set: /**
            * Call this function to set the ratio of the panel. Values are from 0 to 1.
            * @param {number} val The ratio from 0 to 1 of where the divider should be
            */
            function (val) {
                if (val > 1)
                    val = 1;
else if (val < 0)
                    val = 0;

                this.mPercent = val;

                //Resets the orientation
                this.orientation = this.orientation;
            },
            enumerable: true,
            configurable: true
        });



        Object.defineProperty(SplitPanel.prototype, "orientation", {
            get: /**
            * gets the orientation of this split panel
            */
            function () {
                return this.mOrientation;
            },
            set: /**
            * Use this function to change the split panel from horizontal to vertcal orientation.
            * @param val The orientation of the split. This can be either SplitPanel.VERTICAL or SplitPanel.HORIZONTAL
            */
            function (val) {
                if (val == SplitOrientation.VERTICAL || val == SplitOrientation.HORIZONTAL) {
                    this.mOrientation = val;

                    var w = this.element.width();
                    var h = this.element.height();

                    if (val == SplitOrientation.VERTICAL) {
                        this.mPanel1.element.css({
                            width: this.mPercent * w - this.mDividerSize * 0.5,
                            top: "0px",
                            left: "0px",
                            height: h + "px"
                        });
                        this.mDivider.element.css({
                            width: this.mDividerSize + "px",
                            left: this.mPanel1.element.width() + "px",
                            top: "0px",
                            height: h + "px"
                        });
                        this.mPanel2.element.css({
                            width: (1 - this.mPercent) * w - (this.mDividerSize * 0.5),
                            left: ((this.mPercent * w) + (this.mDividerSize / 2)) + "px",
                            top: "0px",
                            height: h + "px"
                        });
                    } else {
                        this.mPanel1.element.css({
                            height: this.mPercent * h - this.mDividerSize * 0.5,
                            left: "0px",
                            top: "0px",
                            width: w + "px"
                        });
                        this.mDivider.element.css({
                            height: this.mDividerSize + "px",
                            top: this.mPanel1.element.height() + "px",
                            left: "0px",
                            width: w + "px"
                        });
                        this.mPanel2.element.css({
                            height: (1 - this.mPercent) * h - (this.mDividerSize * 0.5),
                            top: ((this.mPercent * h) + (this.mDividerSize / 2)) + "px",
                            left: "px",
                            width: w + "px"
                        });
                    }
                }
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(SplitPanel.prototype, "top", {
            get: /**
            * Gets the top panel.
            */
            function () {
                return this.mPanel1;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(SplitPanel.prototype, "bottom", {
            get: /**
            * Gets the bottom panel.
            */
            function () {
                return this.mPanel2;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(SplitPanel.prototype, "left", {
            get: /**
            * Gets the left panel.
            */
            function () {
                return this.mPanel1;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(SplitPanel.prototype, "right", {
            get: /**
            * Gets the right panel.
            */
            function () {
                return this.mPanel2;
            },
            enumerable: true,
            configurable: true
        });

        /**
        * This will cleanup the component.
        */
        SplitPanel.prototype.dispose = function () {
            this.mOrientation = null;
            this.mDivider.element.off('mousedown', this.mMouseDownProxy);
            jQuery("body").off('mouseup', this.mMouseUpProxy);
            jQuery("body").off('mousemove', this.mMouseMoveProxy);
            this.mMouseDownProxy = null;

            //Call super
            _super.prototype.dispose.call(this);
        };
        return SplitPanel;
    })(Animate.Component);
    Animate.SplitPanel = SplitPanel;
})(Animate || (Animate = {}));
//# sourceMappingURL=SplitPanel.js.map
