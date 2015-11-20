module Animate
{
	

	/**
	* Base class for all custom enums
	*/
	export class ENUM
	{
		private static allEnums: any;

		public value: string;
		constructor( v: string )
		{
			this.value = v;
		}
		
		toString() { return this.value; }
    }

    export type EventType = ENUM | string;
    export type EventCallback = (response: EventType, event: Event, sender?: EventDispatcher) => void;

	/**
	* Internal class only used internally by the {EventDispatcher}
	*/
	export class EventListener 
	{
        type: EventType;
		func: EventCallback;
		context: any;

        constructor(type: EventType, func: EventCallback, context?: any) 
		{
			this.type = type;
			this.func = func;
			this.context = context;
		}
	}

	/**
	* The base class for all events dispatched by the {EventDispatcher}
	*/
	export class Event
	{
        public type: EventType;
		public tag: any;

		/**
		* Creates a new event object
		* @param {EventType} eventType The type event
		*/
        constructor(eventType: EventType, tag?: any)
		{
            this.type = eventType;
			this.tag = tag;
		}
	}

    /**
    * A simple class that allows the adding, removing and dispatching of events.
    */
	export class EventDispatcher 
	{
        private _listeners: Array<EventListener>;
		public disposed: boolean;

		constructor()
		{
			this._listeners = [];
			this.disposed = false;
        }

       
        /**
        * Returns the list of {EventListener} that are currently attached to this dispatcher.
        */
		get listeners(): Array<EventListener>
		{
            return this._listeners;
        }

        /**
        * Adds a new listener to the dispatcher class.
        */
        on(type: EventType, func: EventCallback, context?: any) 
		{
			if ( !func )
				throw new Error("You cannot have an undefined function.");

            this._listeners.push(new EventListener(type, func, context) );
        }

        /**
        * Adds a new listener to the dispatcher class.
        */
        off(type: EventType, func: EventCallback, context?: any ) 
		{
            var listeners: Array<EventListener> = this.listeners;

            if (!listeners)
				return;

			if ( !func )
				throw new Error( "You cannot have an undefined function." );
            
			for (var i = 0, li = listeners.length; i < li; i++)
			{
                var l: EventListener = listeners[i];
                if (l.type == type && l.func == func && l.context == context ) 
				{
                    listeners.splice(i, 1);
                    return;
                }
            }
        }

        /**
        * Sends a message to all listeners based on the eventType provided.
        * @param {String} The trigger message
        * @param {Event} event The event to dispatch
		* @returns {any}
        */
		emit( event: Event | ENUM, tag?: any ): any 
		{
			var e: Event = null;
			if (event instanceof ENUM)
				e = new Event( event, tag );
			else if (event instanceof Event)
				e = event;

			if ( this._listeners.length == 0 )
				return null;

			//Slice will clone the array
            var listeners: Array<EventListener> = this._listeners.slice(0);

            if (!listeners)
				return null;

			var toRet: any = null;
			for (var i = 0, li = listeners.length; i < li; i++)
			{
                var l: EventListener = listeners[i];
				if ( l.type == e.type) 
				{
                    if (!l.func)
						throw new Error( "A listener was added for " + e.type + ", but the function is not defined.");

					toRet = l.func.call( l.context || this, l.type, e, this);
                }
			}

			return toRet;
		}

		/**
		* This will cleanup the component by nullifying all its variables and clearing up all memory.
		*/
		dispose() : void
		{
			this._listeners = null;
			this.disposed = true;
		}
	}

    
}