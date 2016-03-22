import http = require( 'http' );
import mongodb = require( 'mongodb' );
import events = require( 'events' );
import Model = require( '../models/Model' );
import utils = require( '../Utils' );
import validator = require( '../Validator' );
import logger = require( "../Logger" );
import JadeRenderer = require( "../views/JadeRenderer" );

/**
* Checks if the object o has the property p
* @returns {boolean}
*/
function ownProp( o : any, p : string )
{
	return Object.prototype.hasOwnProperty.call( o, p );
}

/**
* Manages each of the sessions
*/
export class SessionManager
{
	private static _singleton: SessionManager;

	public sessions: any;

	private _sessionCollection: mongodb.Collection;
	private _timeout : any;

	constructor()
	{
		this.sessions = {};
		this._sessionCollection = Model.getSingleton().collection("sessions");
	}


	/**
	* Creates or fetches a session object by looking at the headers of a request
	* @returns {Session}
	*/
	lookupOrCreate( request: http.ServerRequest, opts: { path?: string; domain?: string; secure?:boolean; lifetime?: number; persistent?: boolean; sessionID?: string; }, callback: ( err: string, session : Session ) => void )
	{
		var that = this;
		var id: string;
		var session: Session;
		var that = this;

		opts = opts || {};
		
		var sessionCreated = function( session: Session, dbEntry? : any )
		{
			if (!session)
				session = new Session(opts.sessionID ? opts.sessionID : that.createID(), opts);

			// If it was loaded in the DB, then set its properties from the saved results
			if ( dbEntry )
				session.open( dbEntry );

			// Reset the expiration date for the session
			session.expiration = ( new Date( Date.now() + session.lifetime * 1000 ) ).getTime();
			
			callback( null, session );

			if ( !session.data )
			{
				// Adds / updates the DB with the new session
				that._sessionCollection.remove( { id: session.id }, function ( err: any, result: any )
				{
					if ( err )
						console.log( utils.ConsoleStyles.red[0] + "Could not remove session : '" + err + "'" + utils.ConsoleStyles.red[1] );
					else if ( result === 0 )
						console.log( utils.ConsoleStyles.red[0] + "No Sessions were deleted" + utils.ConsoleStyles.red[1] );					
				});
			}
			else
			{
				// Adds / updates the DB with the new session
				that._sessionCollection.update( { id: session.id }, session.save(), { upsert: true }, function ( err: any, result: any )
				{
					if ( err || !result )
						callback( "Could not save session to the model: '" + err + "'", null );
					else
					{
						// make sure a timeout is pending for the expired session reaper
						if ( !that._timeout )
							that._timeout = setTimeout( that.cleanup.bind( that ), 60000 );
					}
				});
			}
		}

		// See if the client has a session id - then get the session data stored in the model
		id = this.getIDFromRequest( request );

		if ( id != "" )
		{
			this._sessionCollection.find( { id : id }, function( err: any, result: mongodb.Cursor )
			{
				// Cant seem to find any session - so create a new one
				if ( err || !result )
					sessionCreated( null );
				else
				{
					result.nextObject( function( err: any, sessionEntry: any )
					{
						if ( err || !result )
							sessionCreated( null );
						else
							sessionCreated( new Session( id, opts ), sessionEntry );
					});
				}
			});
		}
		else
			sessionCreated( null );
	}

	
	/**
	* Each time a session is created, a timer is started to check all sessions in the DB. 
	* Once the lifetime of a session is up its then removed from the DB and we check for any remaining sessions. 
	*/
	public cleanup( force : boolean = false )
	{
		var that = this;
		var id, now, next
		now = +new Date
        next = Number.MAX_VALUE
		this._timeout = null;

		that._sessionCollection.find( function( err: any, result: mongodb.Cursor )
		{
			result.toArray( function( err: any, sessions: Array<any> )
			{
				// Remove query
				var toRemoveQuery: any = { $or: [] };

				for ( var i = 0, l = sessions.length; i < l; i++ )
				{
					var exp: number = parseFloat( sessions[i].expiration );

					if ( exp < now || force )
						toRemoveQuery.$or.push( { _id: sessions[i]._id });
					else
						next = next < exp ? next : exp;
				}

				// Check if we need to remove sessions - if we do, then remove them :)
				if ( toRemoveQuery.$or.length > 0 )
				{
					that._sessionCollection.remove( toRemoveQuery, function ( err: any, result: any )
					{
						if ( err )
							console.log( utils.ConsoleStyles.red[0] + "Could not remove session : '" + err + "'" + utils.ConsoleStyles.red[1] );
						else if ( result === 0 )
							console.log( utils.ConsoleStyles.red[0] + "No Sessions were deleted" + utils.ConsoleStyles.red[1] );
					});
				}
			});
		});

        if (next < Number.MAX_VALUE )
			this._timeout = setTimeout( this.cleanup.bind(this), next - ( +new Date ) + 1000 );
	}


	/**
	* Looks at the headers from the HTTP request to determine if a session cookie has been asssigned and returns the ID.
	* @param {http.ServerRequest} req
	* @returns {string}
	*/
	getIDFromRequest( req: http.ServerRequest ): string
	{
		var m: RegExpExecArray;

		// look for an existing SID in the Cookie header for which we have a session
		if ( req.headers.cookie && ( m = /SID=([^ ,;]*)/.exec( req.headers.cookie ) ) )
			return m[1];
		else
			return "";
	}


	/**
	* Creates a random session ID unless one is given
	* @returns {string}
	*/
	createID(): string
	{
		// otherwise a 64 bit random string is used
		return this.randomString( 64 );
	}


	/**
	* Creates a pseude-random ASCII string which contains at least the specified number of bits of entropy
	* the return value is a string of length ⌈bits/6⌉ of characters from the base64 alphabet
	* @param {number} bits The number of bits for this random string
	* @returns {string}
	*/
	randomString(bits: number): string
	{
		var chars, rand, i, ret;
		chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
		ret = '';

		// in v8, Math.random() yields 32 pseudo-random bits (in spidermonkey it gives 53)
		while ( bits > 0 )
		{
			rand = Math.floor( Math.random() * 0x100000000 ); // 32-bit integer

			// base 64 means 6 bits per character, so we use the top 30 bits from rand to give 30/6=5 characters.
			for ( i = 26; i > 0 && bits > 0; i -= 6, bits -= 6 )
				ret += chars[0x3F & rand >>> i];
		}

		return ret
	}


	/**
	* Gets the SessionManager singleton
	* @returns {SessionManager}
	*/
	public static get singleton(): SessionManager
	{
		if ( !SessionManager._singleton )
			SessionManager._singleton = new SessionManager();

		return SessionManager._singleton;
	}
}


/**
* A class to represent session data
*/
export class Session
{
	public id: string;
	public data: any;

	/*
	* If set, the session will be restricted to URLs underneath the given path.
	* By default the path is "/", which means that the same sessions will be shared across the entire domain.
	*/
	public path: string;

	/**  
	* If present, the cookie (and hence the session) will apply to the given domain, including any subdomains.
	* For example, on a request from foo.example.org, if the domain is set to '.example.org', then this session will persist across any subdomain of example.org.
	* By default, the domain is not set, and the session will only be visible to other requests that exactly match the domain.
	*/
	public domain: string;
	public persistent: boolean;

	/**  
	* If true, the cookie will be encrypted
	*/
	public secure: boolean;

	/**
	* If you wish to create a persistent session (one that will last after the user closes the window and visits the site again) you must specify a lifetime as a number of seconds.
	* Common values are 86400 for one day, and 604800 for one week.
	* The lifetime controls both when the browser's cookie will expire, and when the session object will be freed by the sessions module.
	* By default, the browser cookie will expire when the window is closed, and the session object will be freed 24 hours after the last request is seen.
	*/
	public lifetime: number;

	public expiration: number;

	constructor( id: string, opts: { path?: string; domain?: string; lifetime?: number; persistent?: boolean; secure?: boolean; } )
	{
		this.id = id;
		this.data = {};
		this.path = opts.path || '/';
		this.domain = opts.domain;
		this.expiration = 0;
		this.secure = opts.secure;

		// if the caller provides an explicit lifetime, then we use a persistent cookie
		// it will expire on both the client and the server lifetime seconds after the last use
		// otherwise, the cookie will exist on the browser until the user closes the window or tab,
		// and on the server for 24 hours after the last use
		if ( opts.lifetime )
		{
			this.persistent = opts.persistent;
			this.lifetime = opts.lifetime;
		}
		else
		{
			this.persistent = false;
			this.lifetime = 86400;
		}
	}

	public open( data: any )
	{
		this.id = data.id;
		this.data = data.data;
		this.path = data.path;
		this.domain = data.domain;
		this.expiration = data.expiration;
	}

	public save() : any
	{
		var data: any = {};
		data.id = this.id;
		data.data = this.data;
		data.path = this.path;
		data.domain = this.domain;
		data.expiration = this.expiration;
		return data;
	}

	/**
	* This method returns the value to send in the Set-Cookie header which you should send with every request that goes back to the browser, e.g.
	* response.setHeader('Set-Cookie', session.getSetCookieHeaderValue());
	*/
	public getSetCookieHeaderValue()
	{
		var parts;
		parts = ['SID=' + this.id];

		if ( this.path )
			parts.push( 'path=' + this.path );

		if ( this.domain )
			parts.push( 'domain=' + this.domain );

		if ( this.persistent )
			parts.push( 'expires=' + this.dateCookieString( this.expiration ) );

		if ( this.secure )
			parts.push( "secure" );

		return parts.join( '; ' );
	}

	/**
	* Converts from milliseconds to string, since the epoch to Cookie 'expires' format which is Wdy, DD-Mon-YYYY HH:MM:SS GMT
	*/
	dateCookieString( ms: number ): string
	{
		var d, wdy, mon
		d = new Date( ms )
		wdy = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
		mon = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
		return wdy[d.getUTCDay()] + ', ' + this.pad( d.getUTCDate() ) + '-' + mon[d.getUTCMonth()] + '-' + d.getUTCFullYear()
			+ ' ' + this.pad( d.getUTCHours() ) + ':' + this.pad( d.getUTCMinutes() ) + ':' + this.pad( d.getUTCSeconds() ) + ' GMT';
	}

	/**
	* Pads a string with 0's
	*/
	pad( n: number ): string
	{
		return n > 9 ? '' + n : '0' + n;
	}
}