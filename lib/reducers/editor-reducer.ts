import { IEditorAction } from '../actions/editor-actions';

const defaultEditorState: HatcheryEditor.IEditorState = {
    loginState: 'login'
}

/**
 * A reducer that processes state changes of the editor
 */
export function editorReducer( state: HatcheryEditor.IEditorState = defaultEditorState, action: IEditorAction ): HatcheryEditor.IEditorState {
    switch ( action.type ) {
        case 'EA_TOGGLE_SPLASH':
        case 'EA_TOGGLE_LOGIN_STATE':
            return Object.assign<HatcheryEditor.IEditorState>( {}, state, action.editorState );
        default:
            return state;
    }
}