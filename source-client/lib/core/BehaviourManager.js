var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Animate;
(function (Animate) {
    var BehaviourManagerEvents = (function (_super) {
        __extends(BehaviourManagerEvents, _super);
        function BehaviourManagerEvents(v) {
            _super.call(this, v);
        }
        BehaviourManagerEvents.CONTAINER_SAVED = new BehaviourManagerEvents("behaviour_manager_container_saved");
        BehaviourManagerEvents.SUCCESS = new BehaviourManagerEvents("behaviour_manager_success");
        return BehaviourManagerEvents;
    })(Animate.ENUM);
    Animate.BehaviourManagerEvents = BehaviourManagerEvents;

    var BehaviourManagerEvent = (function (_super) {
        __extends(BehaviourManagerEvent, _super);
        function BehaviourManagerEvent(eventName, name) {
            _super.call(this, eventName, name);
            this.name = name;
        }
        return BehaviourManagerEvent;
    })(Animate.Event);
    Animate.BehaviourManagerEvent = BehaviourManagerEvent;

    var BehaviourManager = (function (_super) {
        __extends(BehaviourManager, _super);
        function BehaviourManager() {
            if (BehaviourManager._singleton != null)
                throw new Error("The BehaviourManager class is a singleton. You need to call the BehaviourManager.getSingleton() function.");

            BehaviourManager._singleton = this;

            // Call super-class constructor
            _super.call(this);
        }
        BehaviourManager.getSingleton = /**
        * Gets the singleton instance.
        */
        function () {
            if (!BehaviourManager._singleton)
                new BehaviourManager();

            return BehaviourManager._singleton;
        };
        return BehaviourManager;
    })(Animate.EventDispatcher);
    Animate.BehaviourManager = BehaviourManager;
})(Animate || (Animate = {}));
//# sourceMappingURL=BehaviourManager.js.map
