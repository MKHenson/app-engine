import { ISplashAction } from '../actions/splash-actions';
import { ISplashScreen } from 'hatchery-editor';

const defaultSplashState: ISplashScreen = {
    error: null,
    loading: false,
    projects: [],
    numProjects: 0,
    serverResponse: null,
    selectedProject: null,
    screen: 'welcome'
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
        case 'SPLASH_GET_PROJECTS':
        case 'SPLASH_PROJECT_CREATED':
            toReturn = Object.assign<ISplashScreen>( {}, toReturn, { loading: false }, action.data! );
            break;
        case 'SPLASH_SET_SCREEN':
            toReturn = Object.assign<ISplashScreen>( {}, toReturn, action.data! );
            break;
        default:
            toReturn = defaultSplashState;
            break;
    }
    return toReturn;
}