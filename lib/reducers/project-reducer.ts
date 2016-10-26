import { IProjectAction } from '../actions/project-actions';
import { IProject } from 'hatchery-editor';

const defaultState: IProject = {
    activeEditor: null,
    curBuild: null,
    error: null,
    entry: null,
    loading: false,
    openEditors: [],
    restPaths: {}
}

/**
 * A reducer for processing project actions
 */
export function projectReducer( state: IProject = defaultState, action: IProjectAction ) {
    switch ( action.type ) {
        case 'PROJECT_REQUEST_PENDING':
            return Object.assign<IProject>( {}, state, { loading: true });
        case 'PROJECT_REQUEST_REJECTED':
        case 'PROJECT_CREATED':
        case 'PROJECT_OPENED':
            return Object.assign<IProject>( {}, state, { loading: false }, action.project );
        default:
            return state;
    }
}