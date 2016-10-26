// TODO : Remove this class

import { EventDispatcher } from '../event-dispatcher';
import { DB } from '../../setup/db';

/**
* Abstract base loader class. This should not be instantiated, instead use the sub class loaders. Keeps track of loading
* variables as well as functions for showing or hiding the loading dialogue
*/
export class LoaderBase extends EventDispatcher {
    private static loaderBackdrop: JQuery;
    private static showCount: number = 0;

    public url: string;
    public numTries: number;
    public data: any;
    public dataType: string;
    public domain: string;
    public contentType: any;
    public processData: boolean;
    public getVariables: any;

    // Protected
    public _getQuery: string;

    /**
    * Creates an instance of the Loader
    * @param {string} domain [Optional] Specify the base domain of this call. By default it uses DB.HOST.
    */
    constructor( domain?: string ) {
        // Call super-class constructor
        super();

        if ( !LoaderBase.loaderBackdrop )
            LoaderBase.loaderBackdrop = LoaderBase.createLoaderModal();

        this.domain = ( domain !== undefined ? domain : DB.HOST );
        this.data = null;
        this.numTries = 0;

        this._getQuery = '';
        this.getVariables = null;
        this.dataType = 'json';
        this.contentType = 'application/x-www-form-urlencoded; charset=UTF-8';
        this.processData = true;
    }

    /**
    * Starts the loading process
    * @param {string} url The URL we want to load
    * @param {any} data The data associated with this load
    * @param {number} numTries The number of attempts allowed to make this load
    */
    load( url: string, data: any, numTries: number = 3 ) {
        this.url = url;
        this.data = data;
        this.numTries = numTries;

        if ( this.getVariables ) {
            this._getQuery = '?';
            for ( const i in this.getVariables )
                this._getQuery += ( this._getQuery.length !== 1 ? '&' : '' ) + i + '=' + this.getVariables[ i ];
        }
    }

    /**
    * Call this function to create a jQuery object that acts as a loader modal window (the window with the spinning cog)
    * @returns {JQuery}
    */
    static createLoaderModal(): JQuery {
        if ( !LoaderBase.loaderBackdrop ) {
            const str = '<div class=\'modal-backdrop dark-modal\'><div class=\'logo-container\'>' +
                '<div class=\'logo-1 animated-logo rotate-360-slow\'><img src=\'media/logo-1.png\'/></div>' +
                '<div class=\'logo-2 animated-logo rotate-360\'><img src=\'media/logo-2.png\'/></div>' +
                '<div class=\'logo-3 animated-logo rotate-360-slow\'><img src=\'media/logo-3.png\'/></div>' +
                '<div class=\'logo-4 animated-logo\'><img src=\'media/logo-4.png\'/></div>' +
                '<div class=\'logo-5 animated-logo\'><span class=\'loader-text\'>LOADING</span></div>' +

                '</div></div>';

            // return jQuery('<div style='background-color:#FFF' class='modal-backdrop dark-modal'><img class='rotate-360' style='margin-left:30%; margin-top:30%;' src='media/cog.png' /></div>');
            LoaderBase.loaderBackdrop = jQuery( str );
        }

        return LoaderBase.loaderBackdrop;
    }

    /**
    * Shows the loader backdrop which prevents the user from interacting with the application. Each time this is called a counter
    * is incremented. To hide it call the hideLoader function. It will only hide the loader if the hideLoader is called the same
    * number of times as the showLoader function. I.e. if you call showLoader 5 times and call hideLoader 4 times, it will not hide
    * the loader. If you call hideLoader one more time - it will.
    */
    public static showLoader(): void {
        if ( !LoaderBase.loaderBackdrop )
            LoaderBase.createLoaderModal();

        LoaderBase.loaderBackdrop.show();
        jQuery( 'body' ).append( LoaderBase.loaderBackdrop );
        LoaderBase.showCount++;

        jQuery( '.loader-text', LoaderBase.loaderBackdrop ).text( 'LOADING: ' + LoaderBase.showCount + '%...' );
    }

    /**
    * see showLoader for information on the hideLoader
    */
    public static hideLoader() {
        LoaderBase.showCount--;

        jQuery( '.loader-text', LoaderBase.loaderBackdrop ).text( 'LOADING: ' + LoaderBase.showCount + '%...' );

        if ( LoaderBase.showCount === 0 )
            LoaderBase.loaderBackdrop.remove();
    }

    /**
   * Cleans up the object
   */
    dispose() {
        super.dispose();
        this.data = null;
    }
}