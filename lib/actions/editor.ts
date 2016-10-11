namespace Animate {

    /**
     * Describes the different types of editor action types
     */
    export type EditorActionType =
        'EA_TOGGLE_SPLASH' |
        'EA_ADD_LOG_MESSAGE' |
        'EA_CLEAR_LOG_MESSAGES';

    /**
     * An interface for describing  editor actions
     */
    export interface IEditorAction extends Redux.Action, IEditorState {
        type: EditorActionType;
    };

    /**
     * Creates an action that toggles the splash screen visiblility
     */
    export function toggleSplash( visible: boolean ): IEditorAction {
        return {
            type: 'EA_TOGGLE_SPLASH',
            showSplash: visible
        }
    }
}