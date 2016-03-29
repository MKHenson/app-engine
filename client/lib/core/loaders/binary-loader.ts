module Animate
{
	/**
	* Valid response codes for xhr binary requests
	*/
	export class BinaryLoaderResponses extends ENUM
	{
		constructor( v: string ) { super( v ); }
		static SUCCESS: BinaryLoaderResponses = new BinaryLoaderResponses( "binary_success" );
		static ERROR: BinaryLoaderResponses = new BinaryLoaderResponses( "binary_error" );
	}


	/**
	* Events associated with xhr binary requests
	*/
	export class BinaryLoaderEvent extends Event
	{
		public buffer: ArrayBuffer;
		public message: string;

		constructor( binaryResponse: BinaryLoaderResponses, buffer: ArrayBuffer, message: string = "" )
		{
			super( binaryResponse, buffer );
			this.buffer = buffer;
			this.message = message;
		}
	}


	/**
	* Class used to download contents from a server into an ArrayBuffer
	*/
	export class BinaryLoader extends LoaderBase
	{
		private _xhr: XMLHttpRequest;
		private _onBuffers: any;
		private _onError: any;

		/**
		* Creates an instance of the Loader
		* @param {string} domain [Optional] Specify the base domain of this call. By default it uses DB.HOST.
		*/
		constructor( domain?: string )
		{
			super( domain );

			this._xhr = null;
			this._onBuffers = this.onBuffersLoaded.bind(this);
			this._onError = this.onError.bind( this );
		}

		/**
		* This function will make a GET request and attempt to download a file into binary data
		* @param {string} url The URL we want to load
		* @param {number} numTries The number of attempts allowed to make this load
		*/
		load( url: string, numTries: number = 3 )
		{
			super.load( url, null, numTries );
			LoaderBase.showLoader();

			this._xhr = new XMLHttpRequest();
			this._xhr.addEventListener( 'load', this._onBuffers, false );
			this._xhr.addEventListener( 'error', this._onError, false );
			this._xhr.withCredentials = true;

			if ( this._xhr.overrideMimeType )
				this._xhr.overrideMimeType( "text/plain; charset=x-user-defined" );

			var fullURL: string = this.domain + this.url + this._getQuery;
			this._xhr.open("GET", fullURL, true);

			// Must be called after open
			this._xhr.responseType = "arraybuffer";

			this._xhr.send( null );
		}

		/**
		* If an error occurs
		*/
		onError( event )
		{
			if ( this.numTries > 0 )
			{
				if ( this.numTries > 0 )
					this.numTries--;

				var fullURL: string = this.domain + this.url + this._getQuery;
				this._xhr.open( "GET", fullURL, true );
				this._xhr.send( null );
			}
			else
			{
				LoaderBase.hideLoader();
				this.emit( new BinaryLoaderEvent( BinaryLoaderResponses.ERROR, null, "Could not download data from '" + fullURL + "'" ) );
				this.dispose();
			}
		}

		/**
		* Cleans up and removes references for GC
		*/
		dispose()
		{
			this._xhr.removeEventListener( 'load', this._onBuffers, false );
			this._xhr.removeEventListener( 'error', this._onError, false );
			this._xhr = null;
			super.dispose();
		}

		/**
		* Called when the buffers have been loaded
		*/
		onBuffersLoaded()
		{
			var xhr = this._xhr;
			var buffer: ArrayBuffer = xhr.response;

			// IEWEBGL needs this
			if ( buffer === undefined )
				buffer = ( new Uint8Array( xhr.responseBody ) ).buffer;

			// Buffer not loaded, so manually fill it by converting the string data to bytes
			if ( buffer.byteLength == 0 )
			{
				// iOS and other XMLHttpRequest level 1
				buffer = new ArrayBuffer( xhr.responseText.length );
				var bufView = new Uint8Array( buffer );

				for ( var i = 0, l = xhr.responseText.length; i < l; i++ )
					bufView[i] = xhr.responseText.charCodeAt( i ) & 0xff;
			}

			// Array buffer now filled
			LoaderBase.hideLoader();

			var e: BinaryLoaderEvent = new BinaryLoaderEvent( BinaryLoaderResponses.SUCCESS, buffer );
			this.emit( e );
			this.dispose();
		}
	}
}