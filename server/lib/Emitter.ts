class Emitter
{
	private _listeners: Array<{ name: string; f: Function; context: any; }>;
	public disposed: boolean;

	constructor()
	{
		this._listeners = [];
		this.disposed = false;
	}


	/**
	* Returns the list of {Array<{ name: string; f: Function; }>} that are currently attached to this dispatcher.
	*/
	get listeners(): Array<{ name: string; f: Function; context: any; }>
	{
		return this._listeners;
	}

	/**
	* Adds a new listener to the dispatcher class.
	*/
	addListener( name: string, f: Function, context?: any ) 
	{
		if ( !f )
			throw new Error( "You cannot have an undefined function." );

		this._listeners.push( { name: name, f: f, context: context });
	}

	/**
	* Adds a new listener to the dispatcher class.
	*/
	removeListener( name: string, f: Function, context?: any ) 
	{
		var listeners: Array<{ name: string; f: Function; context: any; }> = this.listeners;

		if ( !f )
			throw new Error( "You cannot have an undefined function." );

		var i = listeners.length;
		while ( i-- )
		{
			var l: { name: string; f: Function; context: any; } = listeners[i];
			if ( l.name == name && l.f == f && l.context == context ) 
			{
				listeners.splice( i, 1 );
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
	emit( name: string, ...argArray: any[] ): any 
	{
		if ( this._listeners.length == 0 )
			return null;

		//Slice will clone the array
		var listeners: Array<{ name: string; f: Function; context: any; }> = this._listeners.slice( 0 );

		if ( !listeners )
			return null;

		var toRet: any = null;
		var i = listeners.length;
		while ( i-- ) 
		{
			var l: { name: string; f: Function; context: any; } = listeners[i];
			if ( l.name == name ) 
			{
				if ( !l.f )
					throw new Error( "A listener was added for " + name + ", but the function is not defined." );

				toRet = l.f.call( l.context || this, argArray );
			}
		}

		return toRet;
	}

	/**
	* This will cleanup the component by nullifying all its variables and clearing up all memory.
	*/
	dispose(): void
	{
		this._listeners = null;
		this.disposed = true;
	}
}

export = Emitter;