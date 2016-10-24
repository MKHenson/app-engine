namespace Animate {

    const defaultState: ISplashScreen = {
        error: null,
        loading: false,
        projects: [],
        numProjects: 0,
        serverResponse: null
    }

    /**
     * A reducer for processing splash screen actions
     */
    export function splashReducer( state: ISplashScreen, action: ISplashAction ): ISplashScreen {
        let toReturn = state;

        switch ( action.type ) {
            case 'SPLASH_REQUEST_PENDING':
                toReturn = Object.assign<ISplashScreen>( {}, toReturn, { loading: true, error: null });
                break;
            case 'SPLASH_REQUEST_REJECTED':
            case 'SPLASH_REQUEST_FULFILLED':
                toReturn = Object.assign<ISplashScreen>( {}, toReturn, { loading: false }, action.data! );
                break;
            default:
                toReturn = defaultState;
                break;
        }
        return toReturn;
    }
}