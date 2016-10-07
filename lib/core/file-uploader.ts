namespace Animate {
    export type ProgressCallback = ( percent: number ) => void;
    export type CompleteCallback = ( err?: Error, files?: Array<UsersInterface.IUploadToken> ) => void;

    /*
    * A class that assembles data & files into a form and sends it as an XHR request to a server
    */
    export class FileUploader {
        private _dCount: number;
        private _downloads: Array<{ id: number; total: number; loaded: number; }>;
        public percent: number;

        private _onProg: ProgressCallback;
        private _onComplete: CompleteCallback;

        /*
         * Creates an instance of the class
         * @param onComp Called when all uploads are complete
         * @param onProg Called when progress is made in the upload
         */
        constructor( onComp?: CompleteCallback, onProg?: ProgressCallback ) {
            this.percent = 0;
            this._dCount = 0;
            this._onProg = onProg;
            this._onComplete = onComp;
            this._downloads = [];
        }

        /*
        * Returns the number of active downloads
        */
        get numDownloads(): number {
            return this._downloads.length;
        }

        /*
        * Uploads a file to the users storage api
        * @param files An array of files to upload
        * @param url The URL to use
        * @param meta [Optional] Any additional meta to be associated with the upload
        * @param parentFile [Optional] Sets the parent file of the upload. If the parent file is deleted - then this file is deleted as well
        */
        uploadFile( files: File[], meta?: any, parentFile?: string ) {
            const formData = new FormData();

            // Attaching meta
            if ( meta )
                formData.append( 'meta', JSON.stringify( meta ) );

            for ( let file of files )
                formData.append( file.name, file );

            this.upload( formData, null, parentFile );
        }

        /*
         * Uploads an image or canvas as a png or jpeg
         * @param img The image or canvas to upload
         * @param name The name to give it
         * @param meta [Optional] Any additional meta to be associated with the upload
         * @param parentFile [Optional] Sets the parent file of the upload. If the parent file is deleted - then this file is deleted as well
         */
        upload2DElement( img: HTMLImageElement | HTMLCanvasElement, name: string, meta?: HatcheryServer.IFileMeta, parentFile?: string ) {
            let canvas: HTMLCanvasElement;

            if ( img instanceof HTMLImageElement ) {
                // Create an empty canvas element
                canvas = document.createElement( 'canvas' );
                canvas.width = img.width;
                canvas.height = img.height;

                // Copy the image contents to the canvas
                const ctx = canvas.getContext( '2d' );
                ctx.drawImage( img, 0, 0 );
            }
            else
                canvas = <HTMLCanvasElement>img;

            // Get the data-URL formatted image
            // Firefox supports PNG and JPEG. You could check img.src to
            // guess the original format, but be aware the using 'image/jpg'
            // will re-encode the image.
            const dataURL = canvas.toDataURL();

            // Convert the dataURL to pure base 64
            // var byteString = dataURL.replace(/^data:image\/(png|jpg);base64,/, '');

            // convert base64 to raw binary data held in a string
            // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
            const byteString = atob( dataURL.split( ',' )[ 1 ] );

            // separate out the mime component
            const mimeString = dataURL.split( ',' )[ 0 ].split( ':' )[ 1 ].split( ';' )[ 0 ];

            // Write the bytes of the string to an ArrayBuffer
            const ab = new ArrayBuffer( byteString.length );
            const ia = new Uint8Array( ab );
            for ( let i = 0; i < byteString.length; i++ )
                ia[ i ] = byteString.charCodeAt( i );

            // Create the blob and set the buffer
            let blob: Blob;
            if ( dataURL.indexOf( 'png' ) )
                blob = new Blob( [ ab ], { type: mimeString });
            else
                blob = new Blob( [ ab ], { type: mimeString });

            const formData = new FormData();

            // Attaching meta
            if ( meta )
                formData.append( 'meta', JSON.stringify( meta ) );

            formData.append( name, blob );
            this.upload( formData, null, parentFile );
        }

        /*
       * Uploads a file to the users storage api
       * @param array The array we are uploading
       * @param name The name to give it
       * @param meta [Optional] Any additional meta to be associated with the upload
       * @param parentFile [Optional] Sets the parent file of the upload. If the parent file is deleted - then this file is deleted as well
       */
        uploadArrayBuffer( array: ArrayBuffer, name: string, meta?: any, parentFile?: string ) {
            const formData = new FormData();

            // Attaching meta
            if ( meta )
                formData.append( 'meta', JSON.stringify( meta ) );

            formData.append( name, new Blob( [ array ], { type: 'application/octet-stream' }) );
            return this.upload( formData, null, parentFile );
        }

        /*
        * Uploads text and saves it as a file on the server
        * @param text The text to upload
        * @param name The name to give it
        * @param meta [Optional] Any additional meta to be associated with the upload
        * @param parentFile [Optional] Sets the parent file of the upload. If the parent file is deleted - then this file is deleted as well
        */
        uploadTextAsFile( text: string, name: string, meta?: any, parentFile?: string ) {
            const formData = new FormData();

            // Attaching meta
            if ( meta )
                formData.append( 'meta', JSON.stringify( meta ) );

            // Attaching text
            formData.append( name, new Blob( [ text ], { type: 'text/plain' }) );
            return this.upload( formData, null, parentFile );
        }

        /*
        * Uploads a file to the users storage api
        * @param file The file we are uploading
        * @param url The URL to use
        * @param parentFile [Optional] Sets the parent file of the upload. If the parent file is deleted - then this file is deleted as well
        */
        upload( form: FormData, url: string, parentFile?: string ) {
            if ( !url ) {
                const details = User.get.entry;
                url = `${DB.USERS}/buckets/${details.username}-bucket/upload` + ( parentFile ? '/' + parentFile : '' );
            }

            const that = this;
            const xhr = new XMLHttpRequest();
            const id = that._dCount++;
            const cb = that._onProg;
            const comp = that._onComplete;
            let errorMsg: string = null;

            // Add the download token
            that._downloads.push( { id: id, loaded: 0, total: 0 });

            const calcProgress = function () {
                if ( !cb )
                    return;

                // Calculate the percentages
                let total = 0;
                let loaded = 0;

                for ( let i = 0, l = that._downloads.length; i < l; i++ ) {
                    total += that._downloads[ i ].total;
                    loaded += that._downloads[ i ].loaded;
                }

                if ( total === 0 )
                    that.percent = 100;
                else
                    that.percent = Math.floor( loaded / total * 1000 ) / 10;

                cb( that.percent );
            }

            xhr.onerror = function ( ev ) {
                // Remove the download from the array
                for ( let i = 0, l = that._downloads.length; i < l; i++ )
                    if ( that._downloads[ i ].id === id ) {
                        that._downloads.splice( i, 1 );
                        break;
                    }

                errorMsg = `An error occurred while uploading your files : `;
                calcProgress();
            };

            if ( cb && xhr.upload ) {
                xhr.upload.onprogress = function ( e ) {
                    for ( let i = 0, l = that._downloads.length; i < l; i++ )
                        if ( that._downloads[ i ].id === id ) {
                            that._downloads[ i ].total = e.total;
                            that._downloads[ i ].loaded = e.loaded;
                            break;
                        }

                    calcProgress();
                };
            }

            xhr.onreadystatechange = function () {
                // Every thing ok, file uploaded
                if ( xhr.readyState === 4 ) {
                    // Remove the download from the array
                    for ( let i = 0, l = that._downloads.length; i < l; i++ )
                        if ( that._downloads[ i ].id === id ) {
                            that._downloads.splice( i, 1 );
                            break;
                        }

                    // Re-calc percentages
                    calcProgress();

                    if ( xhr.status !== 200 ) {
                        errorMsg = 'XHR returned response code : ' + xhr.status;

                        if ( that._downloads.length === 0 && comp )
                            comp( new Error( errorMsg ), null );
                    }
                    else {
                        const data: UsersInterface.IUploadResponse = JSON.parse( xhr.responseText );

                        if ( data.error ) {
                            errorMsg = 'The following files were not uploaded: ';
                            for ( let token of data.tokens )
                                errorMsg += ( token.error ? `${token.errorMsg} \r\n` : '' );

                            comp( new Error( errorMsg ), null );
                        }
                        else {
                            if ( that._downloads.length === 0 ) {
                                if ( comp ) {
                                    if ( errorMsg )
                                        comp( new Error( errorMsg ), null );
                                    else
                                        comp( null, data.tokens );
                                }
                            }
                        }
                    }
                }
            };

            xhr.withCredentials = true;
            xhr.open( 'post', url, true );
            xhr.setRequestHeader( 'X-Requested-With', 'XMLHttpRequest' );
            xhr.setRequestHeader( 'Cache-Control', 'no-cache' );
            xhr.send( form );
        }
    }
}