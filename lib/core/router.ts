import { EventDispatcher } from './event-dispatcher';

export interface IState {
    name: string;
    title?: string;
    path: string;
    queries: any;
}

/**
 * A manager for handling the push states of the window
 */
export class Router extends EventDispatcher {
    private static _singleton: Router;

    /**
     * Creates a state manager
     */
    constructor() {
        super();
    }

    init() {

        window.addEventListener( 'popstate', this.onPopState.bind( this ) );

        const path = window.location.pathname;



        this.push( {
            name: '',
            path: path,
            queries: this.getQueryParams()
        });
    }

    /**
     * Removes begining and trailing slashes
     */
    clearSlashes( path : string ): string {
        return path.toString().replace(/\/$/, '').replace(/^\//, '');
    }

    /**
     * Returns the queries as an object
     */
    getQueryParams() {
        var match,
            pl = /\+/g,  // Regex for replacing addition symbol with a space
            search = /([^&=]+)=?([^&]*)/g,
            query = window.location.search.substring( 1 ),
            decode = ( s ) => decodeURIComponent( s.replace( pl, " " ) );

        const urlParams = {};
        while ( match = search.exec( query ) )
            urlParams[ decode( match[ 1 ] ) ] = decode( match[ 2 ] );

        return urlParams;
    }

    /**
     * Called whenever the state pops
     */
    protected onPopState( ev: PopStateEvent ) {
        const state = ev.state as IState;

        if ( state && state.name )
            this.emit<string, IState>( state.name, ev.state as IState );
    }

    /**
     * Add a history entry using push state
     */
    push( data: IState ) {
        history.pushState( data, data.title, data.path );
    }

    /**
     * Gets the instance of the state manager
     */
    static get get(): Router {
        if ( !Router._singleton )
            Router._singleton = new Router();

        return Router._singleton;
    }
}