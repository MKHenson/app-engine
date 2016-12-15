import { EventDispatcher } from './event-dispatcher';

export interface IState {
    name: string;
    path: string;
    queries: any;
    params: any;
}

export interface IRoute {
    name: string;
    path: string;
    title?: string;
    isIndex?: boolean;
    onStateEnter: ( route: IState ) => void;
}

/**
 * A manager for handling the push states of the window
 */
export class Router extends EventDispatcher {
    private static _singleton: Router;
    private mode: 'history' | 'hash';
    private root: string;
    private _routes: IRoute[];

    /**
     * Creates a state manager
     */
    constructor() {
        super();
        this.mode = 'history';
        this.root = '/';
    }

    /**
     * Initializes the router and its routes
     */
    init( routes: IRoute[] ) {
        this._routes = routes;

        window.addEventListener( 'popstate', this.onPopState.bind( this ) );
        this.check();
    }

    /**
     * Triggers the events when a route path has been matched
     */
    triggerStateChange( route: IRoute, path: string ) {
        const queries = this.getQueryParams();
        const params = {};
        const routeParts = route.path.match( /([^\/]+)/g );
        const pathParts = path.match( /([^\/]+)/g );

        if ( routeParts ) {
            for ( let i = 0, l = routeParts.length; i < l; i++ ) {
                if ( routeParts![ i ][ 0 ] === ':' )
                    params[ routeParts![ i ].replace( ':', '' ) ] = pathParts![ i ];
            }
        }

        route.onStateEnter( {
            name: route.name,
            params: params,
            path: path,
            queries: queries
        });
    }

    /**
     * Checks the path and triggers any state changes if they match the path
     */
    check( pathToCheck?: string ) {
        const path: string = pathToCheck || this.getPath();
        const pathParts = path.match( /([^\/]+)/g );

        if ( pathParts ) {

            const numPathParts = pathParts.length;

            for ( const route of this._routes ) {

                if ( route.path === '*' ) {
                    this.triggerStateChange( route, path );
                    return route;
                }

                const routeParts = route.path.match( /([^\/]+)/g );

                if ( routeParts ) {

                    const numRouteParts = routeParts.length;
                    let pathMatches = true;

                    if ( numPathParts > numRouteParts )
                        continue;

                    for ( let i = 0; i < numRouteParts; i++ ) {

                        let isVariable = routeParts[ i ][ 0 ] === ':' ? true : false;
                        let isOptional = routeParts[ i ][ routeParts[ i ].length - 1 ] === '?' ? true : false;

                        if ( !pathParts[ i ] && !isOptional ) {
                            pathMatches = false;
                            break;
                        }


                        if ( pathParts[ i ] !== routeParts[ i ] && !isVariable ) {
                            pathMatches = false;
                            break;
                        }
                    }

                    if ( pathMatches ) {
                        this.triggerStateChange( route, path );
                        return route;
                    }
                }
            }
        }
        else {
            for ( const route of this._routes )
                if ( route.isIndex ) {
                    this.triggerStateChange( route, path );
                    return route;
                }
        }
    }

    /**
     * Removes begining and trailing slashes
     */
    clearSlashes( path: string ): string {
        return path.toString().replace( /\/$/, '' ).replace( /^\//, '' );
    }

    /**
     * A function that gets the path section of a url.
     * The returned result is stripped of any trailing slashes.
     */
    getPath() {
        let fragment = '';
        if ( this.mode === 'history' ) {
            fragment = this.clearSlashes( decodeURI( location.pathname + location.search ) );
            fragment = fragment.replace( /\?(.*)$/, '' );
            fragment = this.root !== '/' ? fragment.replace( this.root, '' ) : fragment;

        } else {
            const match = window.location.href.match( /#(.*)$/ );
            fragment = match ? match[ 1 ] : '';
        }
        return this.clearSlashes( fragment );
    }

    /**
     * Returns the queries of a url as an object
     */
    getQueryParams() {
        let match;
        const pl = /\+/g,  // Regex for replacing addition symbol with a space
            search = /([^&=]+)=?([^&]*)/g,
            query = window.location.search.substring( 1 ),
            decode = ( s ) => decodeURIComponent( s.replace( pl, ' ' ) );

        const urlParams = {};
        while ( match = search.exec( query ) )
            urlParams[ decode( match[ 1 ] ) ] = decode( match[ 2 ] );

        return urlParams;
    }

    /**
     * Called whenever the state changes either by the user
     * or from a manual call to push
     */
    protected onPopState( ev: PopStateEvent ) {
        this.check( this.getPath() );
        this.emit<string, IRoute>( 'onStateChange', ev.state as IRoute );
    }

    /**
     * Gets the history to go back a state
     */
    back() {
        history.back();
    }

    /**
     * Triggers a history route update
     * @param path The path to change the url to
     */
    push( path: string ) {
        let route = this.check( path );
        if ( route )
            history.pushState( undefined, route.title!, path );
        else
            history.pushState( undefined, '', path );
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