var Animate;
(function (Animate) {
    var ENUM = (function () {
        function ENUM(v) {
            this.value = v;

            if (ENUM.allEnums == null)
                ENUM.allEnums = [];

            ENUM.allEnums.push({ name: v, theEnum: this });
        }
        ENUM.prototype.toString = function () {
            return this.value;
        };

        ENUM.fromString = function (val) {
            var enums = ENUM.allEnums;
            var i = ENUM.allEnums.length;
            while (i--)
                if (enums[i].name == val)
                    return enums[i].theEnum;

            throw (new Error("Could not find enum '" + val + "'"));
            return null;
        };
        return ENUM;
    })();
    Animate.ENUM = ENUM;

    /**
    * Internal class only used internally by the {EventDispatcher}
    */
    var EventListener = (function () {
        function EventListener(eventType, func, context) {
            this.eventType = eventType;
            this.func = func;
            this.context = context;
        }
        return EventListener;
    })();
    Animate.EventListener = EventListener;

    /**
    * The base class for all events dispatched by the {EventDispatcher}
    */
    var Event = (function () {
        /**
        * Creates a new event object
        * @param {String} eventName The name of the trigger which dispatched this {Event}
        */
        function Event(eventName, tag) {
            this._eventType = eventName;
            this.tag = tag;
        }
        Object.defineProperty(Event.prototype, "eventType", {
            get: /**
            * Gets the event type
            */
            function () {
                return this._eventType;
            },
            enumerable: true,
            configurable: true
        });
        return Event;
    })();
    Animate.Event = Event;

    /**
    * A simple class that allows the adding, removing and dispatching of events.
    */
    var EventDispatcher = (function () {
        function EventDispatcher() {
            this._listeners = [];
            this.disposed = false;
        }
        Object.defineProperty(EventDispatcher.prototype, "listeners", {
            get: /**
            * Returns the list of {EventListener} that are currently attached to this dispatcher.
            */
            function () {
                return this._listeners;
            },
            enumerable: true,
            configurable: true
        });

        /**
        * Adds a new listener to the dispatcher class.
        */
        EventDispatcher.prototype.addEventListener = function (eventType, func, context) {
            this._listeners.push(new EventListener(eventType, func, context));
        };

        /**
        * Adds a new listener to the dispatcher class.
        */
        EventDispatcher.prototype.removeEventListener = function (eventType, func, context) {
            var listeners = this.listeners;

            if (!listeners)
                return;

            var i = listeners.length;
            while (i--) {
                var l = listeners[i];
                if (l.eventType == eventType && l.func == func && l.context == context) {
                    listeners.splice(i, 1);
                    return;
                }
            }
        };

        EventDispatcher.prototype.dispatchEvent = function (event, tag) {
            var e = null;
            if (event instanceof Event === false)
                e = new Event(event, tag);
else
                e = event;

            if (this._listeners.length == 0)
                return;

            //Slice will clone the array
            var listeners = this._listeners.slice(0);

            if (!listeners)
                return;

            var i = listeners.length;
            while (i--) {
                var l = listeners[i];
                if (l.eventType == e.eventType) {
                    if (!l.func)
                        throw new Error("A listener was added for " + e.eventType + ", but the function is not defined.");

                    l.func.call(l.context || this, l.eventType, e, this);
                }
            }
        };

        /**
        * This will cleanup the component by nullifying all its variables and clearing up all memory.
        */
        EventDispatcher.prototype.dispose = function () {
            this._listeners = null;
            this.disposed = true;
        };
        return EventDispatcher;
    })();
    Animate.EventDispatcher = EventDispatcher;
})(Animate || (Animate = {}));
//# sourceMappingURL=EventDispatcher.js.map
