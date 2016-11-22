import { IProjectAction } from '../actions/project-actions';
import { IProject } from 'hatchery-editor';

const defaultState: IProject = {
    activeEditor: null,
    curBuild: null,
    error: null,
    entry: null,
    loading: false,
    openEditors: [],
    restPaths: {},
    plugins: [],
    serverResponse: null
}

/**
 * A reducer for processing project actions
 */
export function projectReducer( state: IProject = defaultState, action: IProjectAction ) {
    let toReturn = state;

    switch ( action.type ) {
        case 'PROJECT_REQUEST_PENDING':
            toReturn = Object.assign<IProject>( {}, state, { loading: true });
        case 'PROJECT_REQUEST_REJECTED':
        case 'PROJECT_CREATED':
        case 'PROJECT_OPENED':
        case 'PROJECT_PLUGIN_LOADED':
            toReturn = Object.assign<IProject>( {}, state, { loading: false }, action.project );
        default:
            toReturn = state;
    }

    return toReturn;
}