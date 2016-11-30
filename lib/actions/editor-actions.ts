/**
 * Describes the different types of editor action types
 */
export type EditorActionType =
    'EA_TOGGLE_SPLASH' |
    'EA_TOGGLE_LOGIN_STATE';

/**
 * An interface for describing  editor actions
 */
export interface IEditorAction extends Redux.Action, HatcheryEditor.IEditorState {
    type: EditorActionType;
    editorState: HatcheryEditor.IEditorState;
};

/**
 * Creates an action that toggles the splash screen visiblility
 */
export function toggleLoginState( state: 'login' | 'register' ): IEditorAction {
    return {
        type: 'EA_TOGGLE_LOGIN_STATE',
        editorState: { loginState: state }
    }
}