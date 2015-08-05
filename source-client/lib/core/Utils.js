var Animate;
(function (Animate) {
    var Utils = (function () {
        function Utils() {
        }
        Utils.getMousePos = /*Gets the local mouse position of an event on a given dom element.*/
        function (evt, id) {
            // get canvas position
            var obj = document.getElementById(id);
            var top = 0;
            var left = 0;

            while (obj && obj.tagName != 'BODY') {
                top += obj.offsetTop;
                left += obj.offsetLeft;
                obj = obj.offsetParent;
            }

            var p = jQuery("#" + id).parent().parent();
            var scrollX = p.scrollLeft();
            var scrollY = p.scrollTop();

            // return relative mouse position
            var mouseX = evt.clientX - left + scrollX;
            var mouseY = evt.clientY - top + scrollY;

            return { y: mouseY, x: mouseX };
        };

        Utils.checkForSpecialChars = /**
        * Use this function to check if a value contains characters that break things.
        * @param {string} text The text to check
        * @param {boolean} allowSpace If this is true, empty space will be allowed
        * @returns {string} Returns null or string. If it returns null then everything is fine. Otherwise a message is returned with what's wrong.
        */
        function (text, allowSpace) {
            if (typeof allowSpace === "undefined") { allowSpace = false; }
            if (allowSpace === false && jQuery.trim(text) === "")
                return "Text cannot be an empty string";

            var boxText = text;
            var origLength = boxText.length;
            var boxText = boxText.replace(/[^a-zA-Z 0-9'!£$&+-=_]+/g, '');
            if (boxText.length != origLength)
                return "Please enter safe characters. We do not allow for HTML type characters.";

            return null;
        };

        Utils.validateEmail = /**
        Tells us if a string is a valid email address
        */
        function (email) {
            var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(email);
        };

        Utils.getObjectClass = /* Returns the class name of the argument or undefined if
        *  it's not a valid JavaScript object. */
        function (obj) {
            if (obj && obj.constructor && obj.constructor.toString) {
                var arr = obj.constructor.toString().match(/function\s*(\w+)/);
                if (arr && arr.length == 2)
                    return arr[1];
            }

            return undefined;
        };
        return Utils;
    })();
    Animate.Utils = Utils;
})(Animate || (Animate = {}));
//# sourceMappingURL=Utils.js.map
