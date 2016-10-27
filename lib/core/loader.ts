// namespace Animate {
//     export class LoaderEvents extends ENUM {
//         constructor( v: string ) { super( v ); }

//         static COMPLETE: LoaderEvents = new LoaderEvents( 'complete' );
//         static FAILED: LoaderEvents = new LoaderEvents( 'failed' );
//     }

//     export class ServerResponses extends ENUM {
//         constructor( v: string ) { super( v ); }
//         static SUCCESS: ServerResponses = new ServerResponses( 'success' );
//         static ERROR: ServerResponses = new ServerResponses( 'error' );

//         public static fromString( val: string ): ENUM {
//             switch ( val ) {
//                 case ServerResponses.ERROR.toString():
//                     return ServerResponses.ERROR;
//                     break;
//                 case ServerResponses.SUCCESS.toString():
//                 default:
//                     return ServerResponses.SUCCESS;
//                     break;
//             }

//             return null;
//         }
//     }

//     export class AnimateServerEvent extends Event {
//         message: string;
//         return_type: ServerResponses;
//         data: any;

//         constructor( eventName: LoaderEvents, message: string, return_type: ServerResponses, data?: any ) {
//             super( eventName, data );
//             this.message = message;
//             this.return_type = return_type;
//             this.data = data;
//         }
//     }

// 	/**
// 	* This class acts as an interface to our server. It also helps with displaying a mouse blocking loader.
// 	*/
//     export class Loader extends EventDispatcher {
//         private static loaderBackdrop: JQuery;
//         private static showCount: number = 0;

//         public url: string;
//         public postVars: any;
//         public numTries: number;
//         private curCall: any;
//         public dataType: string;
//         public domain: string;
//         public contentType: any;
//         public processData: boolean;
//         public getVariables: any;
//         public returnType: string;

// 		/**
// 		* Creates an instance of the Loader
// 		* @param {string} domain [Optional] Specify the base domain of this call. By default it uses DB.HOST.
// 		*/
//         constructor( domain?: string ) {
//             // Call super-class constructor
//             super();

//             if ( !Loader.loaderBackdrop )
//                 Loader.loaderBackdrop = Loader.createLoaderModal();

//             this.domain = ( domain !== undefined ? domain : DB.HOST );
//             this.url = null
//             this.postVars = null;
//             this.numTries = null;
//             this.curCall = null;
//             this.getVariables = null;
//             this.dataType = 'json';
//             this.contentType = 'application/x-www-form-urlencoded; charset=UTF-8';
//             this.processData = true;
//             this.returnType = null;
//         }

// 		/**
// 		* Call this function to create a jQuery object that acts as a loader modal window (the window with the spinning cog)
// 		*/
//         static createLoaderModal(): JQuery {
//             if ( !Loader.loaderBackdrop ) {
//                 const str = '<div class='modal-backdrop dark-color'><div class='logo-container'>' +
//                     '<div class='logo-1 animated-logo loader-cog-slow'><img src='media/logo-1.png'/></div>' +
//                     '<div class='logo-2 animated-logo loader-cog'><img src='media/logo-2.png'/></div>' +
//                     '<div class='logo-3 animated-logo loader-cog-slow'><img src='media/logo-3.png'/></div>' +
//                     '<div class='logo-4 animated-logo'><img src='media/logo-4.png'/></div>' +
//                     '<div class='logo-5 animated-logo'><span class='loader-text'>LOADING</span></div>' +

//                     '</div></div>';

//                 //return jQuery('<div style='background-color:#FFF' class='modal-backdrop dark-color'><img class='loader-cog' style='margin-left:30%; margin-top:30%;' src='media/cog.png' /></div>');
//                 Loader.loaderBackdrop = jQuery( str );
//             }

//             return Loader.loaderBackdrop;
//         }

// 		/**
// 		* Shows the loader backdrop which prevents the user from interacting with the application. Each time this is called a counter
// 		* is incremented. To hide it call the hideLoader function. It will only hide the loader if the hideLoader is called the same
// 		* number of times as the showLoader function. I.e. if you call showLoader 5 times and call hideLoader 4 times, it will not hide
// 		* the loader. If you call hideLoader one more time - it will.
// 		*/
//         public static showLoader(): void {
//             if ( !Loader.loaderBackdrop )
//                 Loader.createLoaderModal();

//             Loader.loaderBackdrop.show();
//             jQuery( 'body' ).append( Loader.loaderBackdrop );
//             Loader.showCount++;

//             jQuery( '.loader-text', Loader.loaderBackdrop ).text( 'LOADING: ' + Loader.showCount + '%...' );
//         }

// 		/**
// 		* see showLoader for information on the hideLoader
// 		*/
//         public static hideLoader() {
//             Loader.showCount--;

//             jQuery( '.loader-text', Loader.loaderBackdrop ).text( 'LOADING: ' + Loader.showCount + '%...' );

//             if ( Loader.showCount === 0 )
//                 Loader.loaderBackdrop.remove();
//         }

// 		/**
// 		* This function will call a post URL
// 		* @param url The URL we want to load
// 		* @param postVars The object post variables
// 		* @param numTries The number of attempts allowed to make this load
// 		*/
//         load( url: string, postVars: any, numTries: number = 3 ) {
//             this.url = url;
//             this.postVars = postVars;
//             this.numTries = numTries;

//             Loader.loaderBackdrop.show();
//             Application.getInstance().element.append( Loader.loaderBackdrop );

//             let getVars: string = '';
//             if ( this.getVariables ) {
//                 getVars = '?';
//                 for ( let i in this.getVariables )
//                     getVars += ( getVars.length !== 1 ? '&' : '' ) + i + '=' + this.getVariables[ i ];
//             }

//             this.curCall = jQuery.ajax( {
//                 url: this.domain + this.url + getVars,
//                 type: 'POST',
//                 dataType: this.dataType,
//                 crossDomain: true,
//                 cache: true,
//                 processData: this.processData,
//                 contentType: this.contentType,
//                 accepts: 'text/plain',
//                 data: this.postVars,
//                 success: this.onData.bind( this ),
//                 error: this.onError.bind( this ),
//                 xhrFields: {
//                     withCredentials: true
//                 }
//             });
//         }

// 		/**
// 		* Called when we the ajax response has an error.
// 		* @param {any} e
// 		* @param {string} textStatus
// 		* @param {any} errorThrown
// 		*/
//         onError( e, textStatus, errorThrown ) {
//             if ( this.numTries > 0 ) {
//                 if ( this.numTries > 0 )
//                     this.numTries--;

//                 this.curCall = jQuery.ajax( {
//                     url: this.domain + this.url,
//                     type: 'POST',
//                     dataType: this.dataType,
//                     crossDomain: true,
//                     cache: true,
//                     processData: this.processData,
//                     contentType: this.contentType,
//                     accepts: 'text/plain',
//                     data: this.postVars,
//                     success: this.onData.bind( this ),
//                     error: this.onError.bind( this ),
//                     xhrFields: {
//                         withCredentials: true
//                     }
//                 });
//             }
//             else {
//                 if ( Loader.showCount === 0 )
//                     Loader.loaderBackdrop.remove();

//                 this.url = null
//                 this.postVars = null;
//                 this.numTries = null;
//                 this.curCall = null;
//                 const ev: AnimateServerEvent = new AnimateServerEvent( LoaderEvents.FAILED, errorThrown.message, ServerResponses.ERROR, null );
//                 this.dispatchEvent( ev );
//                 this.dispose();
//             }
//         }

// 		/**
// 		* Called when we get an ajax response.
// 		* @param {any} data
// 		* @param {any} textStatus
// 		* @param {any} jqXHR
// 		*/
//         onData( data, textStatus, jqXHR ) {
//             if ( Loader.showCount === 0 )
//                 Loader.loaderBackdrop.remove();

//             let e: AnimateServerEvent = null;
//             if ( this.dataType === 'text' )
//                 e = new AnimateServerEvent( LoaderEvents.COMPLETE, 'Script Loaded', ServerResponses.SUCCESS, null );
//             else if ( this.dataType === 'json' )
//                 e = new AnimateServerEvent( LoaderEvents.COMPLETE, data.message, ServerResponses.fromString( data.return_type ), data );
//             else
//                 e = new AnimateServerEvent( LoaderEvents.COMPLETE, 'Loaded', ServerResponses.SUCCESS, data );

//             this.dispatchEvent( e );


//             this.url = null
//             this.postVars = null;
//             this.numTries = null;
//             this.curCall = null;
//             this.dispose();
//         }

// 		/**
// 		* Cleans up the object
// 		*/
//         dispose() {
//             //Call super
//             super.dispose();

//             this.url = null
//             this.postVars = null;
//             this.numTries = null;
//             this.curCall = null;
//             this.dataType = null;
//         }
//     }
// }