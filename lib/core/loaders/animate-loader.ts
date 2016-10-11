namespace Animate {

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
            let fullURL: string;

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
                //this.emit<LoaderEvents, AnimateLoaderEvent>( 'failed', { message: errorThrown.message, return_type: 'error', data : null  } );
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
            // let e: AnimateLoaderEvent;

            // if ( this.dataType === 'text' )
            //     e = { message: 'Script Loaded', return_type: 'success', data: null };
            // else if ( this.dataType === 'json' )
            //     e = { message: data.message, return_type: data.return_type, data: data };
            // else
            //     e = { message: 'Loaded', return_type: 'success', data: data };

            this.emit<LoaderEvents, AnimateLoaderEvent>( 'complete', null );
            this.dispose();
        }

		/**
		* Cleans up the object
		*/
        dispose() {
            super.dispose();
            this._curCall = null;
        }
    }
}