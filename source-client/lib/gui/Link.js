var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Animate;
(function (Animate) {
    /**
    * The link class are the lines drawn from behavior portals
    */
    var Link = (function (_super) {
        __extends(Link, _super);
        /**
        * @param {Canvas} parent The parent {Canvas} of the link
        */
        function Link(parent) {
            // Call super-class constructor
            _super.call(this, "<canvas class='link' style='pointer-events:none'></canvas>", parent);

            this.element.data("dragEnabled", false);
            this.startPortal = null;
            this.endPortal = null;
            this.mMouseMoveProxy = this.onMouseMove.bind(this);
            this.mMouseUpProxy = this.onMouseUpAnchor.bind(this);
            this.mMouseUpAnchorProxy = this.onMouseUpAnchor.bind(this);
            this.mPrevPortal = null;
            this.frameDelay = 1;

            this.canvas = document.getElementById(this.id);
            this.graphics = this.canvas.getContext("2d");
            this.graphics.font = "14px arial";
            this.linePoints = [];
        }
        /**
        * This is called when we need a link to start drawing. This will
        * follow the mouse and draw a link from the original mouse co-ordinates to an
        * end portal.
        * @param {Portal} startPortal
        * @param {any} e
        */
        Link.prototype.start = function (startPortal, e) {
            this.startPortal = startPortal;

            //Attach events
            this.parent.element.on("mousemove", this.mMouseMoveProxy);
            this.parent.element.on("mouseup", this.mMouseUpProxy);
            jQuery(".portal", this.parent.element).on("mouseup", this.mMouseUpAnchorProxy);

            //Get the start coords
            var positionOnCanvas = startPortal.positionOnCanvas();
            this.mStartClientX = e.clientX;
            this.mStartClientY = e.clientY;
            this.delta = (startPortal.element.width() / 2);
            this.mStartX = positionOnCanvas.left + this.delta;
            this.mStartY = positionOnCanvas.top + this.delta;

            this.element.css({
                left: this.mStartX + "px",
                top: this.mStartY + "px"
            });

            if (this.startPortal.type == Animate.PortalType.PRODUCT)
                jQuery(".parameter").addClass("green-glow");
else if (this.startPortal.type == Animate.PortalType.OUTPUT)
                jQuery(".input").addClass("green-glow");

            this.onMouseMove(e);
        };

        /**
        * Check if a point is actually selecting the link
        * @param {any} e
        */
        Link.prototype.hitTestPoint = function (e) {
            var mouse = Animate.Utils.getMousePos(e, this.id);

            // get image data at the mouse x,y pixel
            var imageData = this.graphics.getImageData(mouse.x - 4, mouse.y - 4, 8, 8);
            var index = (mouse.x + mouse.y * imageData.width) * 4;

            for (var i = 0; i < imageData.data.length; i++)
                if (imageData.data[i] > 0)
                    return true;

            return false;
        };


        Object.defineProperty(Link.prototype, "selected", {
            get: /**
            * Get or Set if the component is selected. When set to true a css class of 'selected' is added to the {Component}
            */
            function () {
                return this.element.data("selected");
            },
            set: /**
            * Get or Set if the component is selected. When set to true a css class of 'selected' is added to the {Component}
            */
            function (val) {
                if (val)
                    this.element.data("selected", true);
else
                    this.element.data("selected", false);

                this.updatePoints();
            },
            enumerable: true,
            configurable: true
        });

        /**
        * Builds the dimensions of link based on the line points
        */
        Link.prototype.buildDimensions = function () {
            var linePoints = this.linePoints;
            var canvas = this.canvas;

            var length = linePoints.length;

            var left = 99999;
            var top = 99999;
            var right = 0;
            var bottom = 0;

            for (var i = 0; i < length; i++) {
                var x = linePoints[i].x;
                var y = linePoints[i].y;

                if (x < left)
                    left = x;
else if (x > right)
                    right = x;

                if (y < top)
                    top = y;
else if (y > bottom)
                    bottom = y;
            }

            var w = (right - left) + 4 + 20;
            var h = (bottom - top) + 4 + 20;
            if (w <= 4)
                w = 4 + 20;
            if (h <= 4)
                h = 4 + 20;

            canvas.width = w;
            canvas.height = h;

            //Set the element size and location
            this.element.css({
                left: (left - 5) + "px",
                top: (top - 5) + "px",
                width: w + "px",
                height: h + "px"
            });

            for (var i = 0; i < length; i++) {
                var lp = linePoints[i];
                lp.x = (lp.x - left) + 10;
                lp.y = (lp.y - top) + 10;
            }
        };

        /**
        * Use this function to build the line points that define the link
        */
        Link.prototype.buildLinePoints = function (e) {
            var linePoints = this.linePoints;

            //We create a list of array points that define the link
            //Clear all points
            linePoints.splice(0, linePoints.length);

            //Get the start coords
            var positionOnCanvas = this.startPortal.positionOnCanvas();
            this.delta = (this.startPortal.element.width() / 2);
            var delta = this.delta;
            this.mStartX = positionOnCanvas.left + this.delta;
            this.mStartY = positionOnCanvas.top + this.delta;
            var pPosition = this.parent.element.offset();

            var startX = this.mStartX;
            var startY = this.mStartY;
            var endX = 0;
            var endY = 0;

            if (this.endPortal != null) {
                var endPositionOnCanvas = this.endPortal.positionOnCanvas();
                endX = endPositionOnCanvas.left + delta;
                endY = endPositionOnCanvas.top + delta;
            } else {
                if (e == null)
                    return;

                endX = startX + e.clientX - this.mStartClientX + delta;
                endY = startY + e.clientY - this.mStartClientY + delta;
            }

            if (this.endPortal != null) {
                if (this.startPortal.behaviour == this.endPortal.behaviour && this.startPortal != this.endPortal) {
                    //First the start points
                    linePoints.push({ x: startX, y: startY });
                    if (this.startPortal.type == Animate.PortalType.OUTPUT)
                        linePoints.push({ x: startX + 10, y: startY });
else
                        linePoints.push({ x: startX, y: startY + 20 });

                    var behaviourLeft = parseFloat((this.endPortal.behaviour.element.css("left").split("px"))[0]);
                    var behaviourTop = parseFloat((this.endPortal.behaviour.element.css("top").split("px"))[0]);
                    var behaviourWidth = this.endPortal.behaviour.element.width();
                    var behaviourHeight = this.endPortal.behaviour.element.height();

                    if (this.startPortal.type == Animate.PortalType.PRODUCT)
                        linePoints.push({ x: behaviourLeft + behaviourWidth + 20, y: startY + 20 });

                    linePoints.push({ x: behaviourLeft + behaviourWidth + 20, y: startY });
                    linePoints.push({ x: behaviourLeft + behaviourWidth + 20, y: behaviourTop - 20 });

                    if (this.endPortal.type == Animate.PortalType.INPUT) {
                        linePoints.push({ x: behaviourLeft - 20, y: behaviourTop - 20 });
                        linePoints.push({ x: behaviourLeft - 20, y: endY });
                    }

                    if (this.endPortal.type == Animate.PortalType.PARAMETER || this.endPortal.type == Animate.PortalType.INPUT) {
                        if (this.endPortal.type == Animate.PortalType.INPUT)
                            linePoints.push({ x: endX - 10, y: endY });
else
                            linePoints.push({ x: endX, y: endY - 10 });
                    }
                } else if (this.endPortal.type == Animate.PortalType.PARAMETER || this.endPortal.type == Animate.PortalType.INPUT) {
                    //First the start points
                    linePoints.push({ x: startX, y: startY });
                    if (this.startPortal.type == Animate.PortalType.OUTPUT)
                        linePoints.push({ x: startX + 20, y: startY });
else
                        linePoints.push({ x: startX, y: startY + 30 });

                    if (this.endPortal.type == Animate.PortalType.INPUT)
                        linePoints.push({ x: endX - 20, y: endY });
else
                        linePoints.push({ x: endX, y: endY - 20 });
                }
            } else {
                //First the start points
                linePoints.push({ x: startX, y: startY });
                if (this.startPortal.type == Animate.PortalType.OUTPUT)
                    linePoints.push({ x: startX + 20, y: startY });
else
                    linePoints.push({ x: startX, y: startY + 30 });

                linePoints.push({ x: endX - 20, y: endY });
            }

            //Finally set the end point
            linePoints.push({ x: endX, y: endY });
        };

        /**
        * Updates the link points (should they have been moved).
        */
        Link.prototype.updatePoints = function () {
            //First build the points
            this.buildLinePoints(null);

            //Set the dimensions
            this.buildDimensions();

            var graphics = this.graphics;

            //graphics.beginPath();
            graphics.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.draw();
        };

        /**
        * When the mouse moves we resize the stage.
        * @param {any} e
        */
        Link.prototype.onMouseMove = function (e) {
            var curTarget = this.mCurTarget;

            if (curTarget != null)
                curTarget.element.css("cursor", "");

            var target = jQuery(e.target);
            this.endPortal = null;
            if (target.hasClass("portal")) {
                this.mCurTarget = target.data("component");
                curTarget = this.mCurTarget;
                this.endPortal = curTarget;

                if ((curTarget).checkPortalLink(this.startPortal))
                    curTarget.element.css("cursor", "");
else
                    curTarget.element.css("cursor", "no-drop");
            } else {
                target.css("cursor", "crosshair");
                this.mCurTarget = target.data("component");
            }

            //First build the points
            this.buildLinePoints(e);

            //Set the dimensions
            this.buildDimensions();

            var graphics = this.graphics;

            //graphics.beginPath();
            graphics.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.draw();
        };

        /**
        * Draws a series of lines
        */
        Link.prototype.draw = function () {
            var points = this.linePoints;
            var len = points.length;

            if (len == 0)
                return;

            var prevMidpt = null;
            var pt1 = null;
            var pt2 = null;
            var graphics = this.graphics;
            var element = this.element;
            var startPortal = this.startPortal;
            var endPortal = this.endPortal;
            var startPortalBehaviour = startPortal.behaviour;
            var endPortalBehaviour = (endPortal ? endPortal.behaviour : null);
            var loops = false;

            graphics.lineCap = 'round';
            graphics.lineJoin = 'round';

            if (startPortal.type != Animate.PortalType.OUTPUT) {
                if (graphics.setLineDash !== undefined)
                    graphics.setLineDash([5]);
                //if ( graphics.mozDash !== undefined ) graphics.mozDash = [5];
            }

            graphics.beginPath();

            if (endPortal && startPortalBehaviour == endPortalBehaviour && startPortal != endPortal)
                loops = true;

            for (var i = 1; i < len; i++) {
                pt1 = { x: points[i - 1].x, y: points[i - 1].y };
                pt2 = { x: points[i].x, y: points[i].y };

                var midpt = { x: pt1.x + (pt2.x - pt1.x) * 0.5, y: pt1.y + (pt2.y - pt1.y) / 2 };

                if (!loops) {
                    if (prevMidpt) {
                        graphics.moveTo(prevMidpt.x, prevMidpt.y);
                        if (!loops)
                            graphics.quadraticCurveTo(pt1.x, pt1.y, midpt.x, midpt.y);
else
                            graphics.lineTo(pt1.x, pt1.y);
                    } else {
                        // draw start segment:
                        graphics.moveTo(pt1.x, pt1.y);
                        graphics.lineTo(midpt.x, midpt.y);
                    }
                } else {
                    // draw start segment:
                    graphics.moveTo(pt1.x, pt1.y);
                    graphics.lineTo(pt2.x, pt2.y);
                }

                prevMidpt = midpt;
            }

            if (pt2)
                graphics.lineTo(pt2.x, pt2.y - 1);

            if (startPortal.type == Animate.PortalType.OUTPUT) {
                //Draw pipe lines
                //graphics.lineWidth = 5;
                //graphics.strokeStyle="#333333";
                //graphics.stroke();
                graphics.lineWidth = 3;
                if (element.data("selected"))
                    graphics.strokeStyle = "#84FF00";
else
                    graphics.strokeStyle = "#A41CC9";
                graphics.stroke();

                //Now draw the line text
                var canvas = this.canvas;
                var frameDelay = this.frameDelay;
                var canvasW = canvas.width * 0.5 - 5;
                var canvasH = canvas.height * 0.5 + 3;

                graphics.lineWidth = 5;
                graphics.strokeStyle = "#ffffff";
                graphics.strokeText(frameDelay.toString(), canvasW, canvasH);
                graphics.fillText(frameDelay.toString(), canvasW, canvasH);
            } else {
                //Draw pipe lines
                graphics.lineWidth = 2;
                if (element.data("selected"))
                    graphics.strokeStyle = "#84FF00";
else
                    graphics.strokeStyle = "#E2B31F";

                graphics.stroke();
            }
        };

        /**
        * Remove listeners.
        * @param {any} e
        */
        Link.prototype.onMouseUpAnchor = function (e) {
            if (this.mCurTarget)
                this.mCurTarget.element.css("cursor", "");

            this.parent.element.css("cursor", "");
            this.startPortal.element.css("cursor", "");

            if (this.startPortal.type == Animate.PortalType.PRODUCT)
                jQuery(".parameter").removeClass("green-glow");
else if (this.startPortal.type == Animate.PortalType.OUTPUT)
                jQuery(".input").removeClass("green-glow");

            var elm = jQuery(e.target);
            if (elm.hasClass("portal")) {
                this.mCurTarget = elm.data("component");

                if (this.mCurTarget.type == Animate.PortalType.PRODUCT || this.mCurTarget.type == Animate.PortalType.OUTPUT)
                    this.dispose();
else {
                    if ((this.startPortal.type == Animate.PortalType.OUTPUT && this.mCurTarget.type == Animate.PortalType.INPUT) || (this.startPortal.type == Animate.PortalType.PRODUCT && this.mCurTarget.type == Animate.PortalType.PARAMETER)) {
                        if (this.mCurTarget.checkPortalLink(this.startPortal)) {
                            //Drop is ok
                            this.parent.element.off("mousemove", this.mMouseMoveProxy);
                            this.parent.element.off("mouseup");
                            jQuery(".portal", this.parent.element).off("mouseup", this.mMouseUpAnchorProxy);
                            this.endPortal = this.mCurTarget;
                            this.startPortal.addLink(this);
                            this.endPortal.addLink(this);

                            this.element.css("pointer-events", "");

                            //Notify of change
                            this.parent.element.data("component").dispatchEvent(new Animate.CanvasEvent(Animate.CanvasEvents.MODIFIED, this.parent));
                        }

                        this.mCurTarget.element.css("cursor", "");
                    } else
                        this.dispose();
                }
            } else {
                this.dispose();
            }

            this.mCurTarget = null;
        };

        /**
        * Cleanup the link
        */
        Link.prototype.dispose = function () {
            if (this.startPortal && this.startPortal instanceof Animate.Portal)
                this.startPortal.removeLink(this);
            if (this.endPortal && this.endPortal instanceof Animate.Portal)
                this.endPortal.removeLink(this);

            //Unbind
            this.parent.element.off("mousemove", this.mMouseMoveProxy);
            this.parent.element.off("mouseup");
            jQuery(".portal", this.parent.element).off("mouseup", this.mMouseUpAnchorProxy);
            this.element.off();
            this.element.data("dragEnabled", null);

            //Nullify
            this.startPortal = null;
            this.endPortal = null;
            this.mMouseMoveProxy = null;
            this.mMouseUpProxy = null;
            this.mMouseUpAnchorProxy = null;
            this.mPrevPortal = null;
            this.canvas = null;
            this.graphics = null;
            this.linePoints = null;
            this.mCurTarget = null;
            this.frameDelay = null;

            //Call parent
            _super.prototype.dispose.call(this);
        };
        return Link;
    })(Animate.Component);
    Animate.Link = Link;
})(Animate || (Animate = {}));
//# sourceMappingURL=Link.js.map
