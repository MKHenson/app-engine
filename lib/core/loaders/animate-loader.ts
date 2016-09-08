namespace Animate {
	/**
	* Valid response codes for requests made to the Animate server
	*/
    export class AnimateLoaderResponses extends ENUM {
        constructor( v: string ) { super( v ); }
        static SUCCESS: AnimateLoaderResponses = new AnimateLoaderResponses( 'success' );
        static ERROR: AnimateLoaderResponses = new AnimateLoaderResponses( 'error' );

        public static fromString( val: string ): ENUM {
            switch ( val ) {
                case AnimateLoaderResponses.ERROR.toString():
                    return AnimateLoaderResponses.ERROR;
                case AnimateLoaderResponses.SUCCESS.toString():
                default:
                    return AnimateLoaderResponses.SUCCESS;
            }
        }
    }


	/**
	* Events associated with requests made to the animate servers
	*/
    export class AnimateLoaderEvent extends Event {
        message: string;
        return_type: AnimateLoaderResponses;
        data: any;

        constructor( eventName: LoaderEvents, message: string, return_type: AnimateLoaderResponses, data?: any ) {
            super( eventName, data );
            this.message = message;
            this.return_type = return_type;
            this.data = data;
        }
    }

	/**
	* This class acts as an interface loader for the animate server.
	*/
    export class AnimateLoader extends LoaderBase {
        private _curCall: any;

		/**
		* Creates an instance of the Loader
		* @param {string} domain [Optional] Specify the base domain of this call. By default it uses DB.HOST.
		*/
        constructor( domain?: string ) {
            // Call super-class constructor
            super( domain );

            this._curCall = null;
        }


		/**
		* This function will make a POST request to the animate server
		* @param {string} url The URL we want to load
		* @param {any} data The post variables to send off to the server
		* @param {number} numTries The number of attempts allowed to make this load
		*/
        load( url: string, data: any, numTries: number = 3, type: string = 'POST' ) {
            super.load( url, data, numTries );
            LoaderBase.showLoader();
            let fullURL : string;

            if ( url.match( /http/g ) )
                fullURL = url;
            else
                fullURL = this.domain + this.url + this._getQuery;

            this._curCall = jQuery.ajax( {
                url: fullURL,
                type: type,
                dataType: this.dataType,
                crossDomain: true,
                cache: true,
                processData: this.processData,
                contentType: this.contentType,
                accepts: 'text/plain',
                data: data,
                success: this.onData.bind( this ),
                error: this.onError.bind( this ),
                xhrFields: {
                    withCredentials: true
                }
            });
        }

		/**
		* Called when we the ajax response has an error.
		* @param {any} e
		* @param {string} textStatus
		* @param {any} errorThrown
		*/
        onError( e, textStatus, errorThrown ) {
            if ( this.numTries > 0 ) {
                if ( this.numTries > 0 )
                    this.numTries--;

                const fullURL: string = this.domain + this.url + this._getQuery;

                this._curCall = jQuery.ajax( {
                    url: fullURL,
                    type: 'POST',
                    dataType: this.dataType,
                    crossDomain: true,
                    cache: true,
                    processData: this.processData,
                    contentType: this.contentType,
                    accepts: 'text/plain',
                    data: this.data,
                    success: this.onData.bind( this ),
                    error: this.onError.bind( this ),
                    xhrFields: {
                        withCredentials: true
                    }
                });
            }
            else {
                LoaderBase.hideLoader();
                this.emit( new AnimateLoaderEvent( LoaderEvents.FAILED, errorThrown.message, AnimateLoaderResponses.ERROR, null ) );
                this.dispose();
            }
        }

		/**
		* Called when we get an ajax response.
		* @param {any} data
		* @param {any} textStatus
		* @param {any} jqXHR
		*/
        onData( data, textStatus, jqXHR ) {
            LoaderBase.hideLoader();

            let e: AnimateLoaderEvent = null;
            if ( this.dataType === 'text' )
                e = new AnimateLoaderEvent( LoaderEvents.COMPLETE, 'Script Loaded', AnimateLoaderResponses.SUCCESS, null );
            else if ( this.dataType === 'json' )
                e = new AnimateLoaderEvent( LoaderEvents.COMPLETE, data.message, AnimateLoaderResponses.fromString( data.return_type ), data );
            else
                e = new AnimateLoaderEvent( LoaderEvents.COMPLETE, 'Loaded', AnimateLoaderResponses.SUCCESS, data );

            this.emit( e );
            this.dispose();
        }

		/**
		* Cleans up the object
		*/
        dispose() {
            //Call super
            super.dispose();
            this._curCall = null;
        }
    }
}