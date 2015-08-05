var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Animate;
(function (Animate) {
    var BehaviourPickerEvents = (function (_super) {
        __extends(BehaviourPickerEvents, _super);
        function BehaviourPickerEvents(v) {
            _super.call(this, v);
        }
        BehaviourPickerEvents.BEHAVIOUR_PICKED = new BehaviourPickerEvents("behaviour_picker_picked");
        return BehaviourPickerEvents;
    })(Animate.ENUM);
    Animate.BehaviourPickerEvents = BehaviourPickerEvents;

    var BehaviourPickerEvent = (function (_super) {
        __extends(BehaviourPickerEvent, _super);
        function BehaviourPickerEvent(eventName, behaviourName) {
            _super.call(this, eventName, behaviourName);
            this.behaviourName = behaviourName;
        }
        return BehaviourPickerEvent;
    })(Animate.Event);
    Animate.BehaviourPickerEvent = BehaviourPickerEvent;

    var BehaviourPicker = (function (_super) {
        __extends(BehaviourPicker, _super);
        function BehaviourPicker() {
            if (BehaviourPicker._singleton != null)
                throw new Error("The BehaviourPicker class is a singleton. You need to call the BehaviourPicker.get() function.");

            BehaviourPicker._singleton = this;

            // Call super-class constructor
            _super.call(this, 200, 250);

            this.element.addClass("reg-gradient-static");
            this.element.addClass("behaviour-picker");

            this._input = new Animate.InputBox(this, "Behaviour Name");
            this._list = new Animate.List(this);
            this._X = 0;
            this._Y = 0;

            //Hook listeners
            this._list.selectBox.element.on("click", this.onListClick.bind(this));
            this._list.selectBox.element.on("dblclick", this.onListDClick.bind(this));
            this._input.textfield.element.on("keyup", this.onKeyDown.bind(this));
        }
        /**
        * Shows the window by adding it to a parent.
        * @param {Component} parent The parent Component we are adding this window to
        * @param {number} x The x coordinate of the window
        * @param {number} y The y coordinate of the window
        * @param {boolean} isModal Does this window block all other user operations?
        * @param {boolean} isPopup If the window is popup it will close whenever anything outside the window is clicked
        */
        BehaviourPicker.prototype.show = function (parent, x, y, isModal, isPopup) {
            if (typeof parent === "undefined") { parent = null; }
            if (typeof x === "undefined") { x = 0; }
            if (typeof y === "undefined") { y = 0; }
            if (typeof isModal === "undefined") { isModal = false; }
            if (typeof isPopup === "undefined") { isPopup = false; }
            this._list.sort();

            if (y + this.element.height() > jQuery("body").height())
                y = jQuery("body").height() - this.element.height();
            if (x + this.element.width() > jQuery("body").width())
                x = jQuery("body").width() - this.element.width();

            _super.prototype.show.call(this, parent, x, y, isModal, isPopup);

            this._input.focus(true);
        };

        /**
        * Called when we click the list.
        * @param {any} e
        * @returns {any}
        */
        BehaviourPicker.prototype.onListClick = function (e) {
            this._input.text = this._list.selectedItem;
        };

        /**
        * Called when we double click the list.
        * @param {any} e
        * @returns {any}
        */
        BehaviourPicker.prototype.onListDClick = function (e) {
            this.dispatchEvent(new BehaviourPickerEvent(BehaviourPickerEvents.BEHAVIOUR_PICKED, this._list.selectedItem));
            this.hide();
        };

        /**
        * When the input text changes we go through each list item
        * and select it.
        * @param {any} e
        * @returns {any}
        */
        BehaviourPicker.prototype.onKeyDown = function (e) {
            if (e.keyCode == 38 || e.keyCode == 40) {
                e.preventDefault();

                //Get the selected item and move it up and down
                var selected = this._list.selectedIndex;
                if (selected != -1) {
                    var items = this._list.numItems();

                    if (e.keyCode == 38) {
                        if (selected - 1 < 0)
                            this._list.selectedIndex = items - 1;
else
                            this._list.selectedIndex = selected - 1;
                    } else {
                        if (selected + 1 < items)
                            this._list.selectedIndex = selected + 1;
else
                            this._list.selectedIndex = 0;
                    }

                    this._input.text = this._list.selectedItem;
                }

                return;
            }

            if (e.keyCode == 13) {
                this.dispatchEvent(new BehaviourPickerEvent(BehaviourPickerEvents.BEHAVIOUR_PICKED, this._list.selectedItem));
                this.hide();
            }

            var len = this._list.items.length;
            for (var i = 0; i < len; i++) {
                var v1 = this._list.items[i].text().toLowerCase();
                var v2 = this._input.text.toLowerCase();
                if (v1.indexOf(v2) != -1) {
                    this._list.selectedItem = this._list.items[i].text();
                    return;
                }
            }
        };

        BehaviourPicker.getSingleton = /**
        * Gets the singleton instance.
        * @returns {BehaviourPicker}
        */
        function () {
            if (!BehaviourPicker._singleton)
                new BehaviourPicker();

            return BehaviourPicker._singleton;
        };

        Object.defineProperty(BehaviourPicker.prototype, "list", {
            get: function () {
                return this._list;
            },
            enumerable: true,
            configurable: true
        });
        return BehaviourPicker;
    })(Animate.Window);
    Animate.BehaviourPicker = BehaviourPicker;
})(Animate || (Animate = {}));
//# sourceMappingURL=BehaviourPicker.js.map
