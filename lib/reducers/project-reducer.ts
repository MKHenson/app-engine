import { IProjectAction, IProjectPluginAction } from '../actions/project-actions';

const defaultState: HatcheryEditor.IProject = {
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
export function projectReducer( state: HatcheryEditor.IProject = defaultState, action: IProjectAction ) {
    let toReturn = state;

    switch ( action.type ) {
        case 'PROJECT_REQUEST_PENDING':
            toReturn = Object.assign<HatcheryEditor.IProject>( {}, state, { loading: true });
        case 'PROJECT_REQUEST_REJECTED':
        case 'PROJECT_CREATED':
        case 'PROJECT_LOADED':
            toReturn = Object.assign<HatcheryEditor.IProject>( {}, state, { loading: false }, action.project! );
            break;
        case 'PROJECT_PLUGIN_LOADED':
            toReturn = Object.assign<HatcheryEditor.IProject>( {}, state, { loading: false }, { plugins: state.plugins!.concat(( action as IProjectPluginAction ).plugin ) });
            break;
        default:
            toReturn = state;
    }

    return toReturn;
}