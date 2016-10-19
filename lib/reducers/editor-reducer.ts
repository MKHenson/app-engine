namespace Animate {

    const defaultState: IEditorState = {
        showSplash: true,
        loginState: 'login'
    }

    /**
     * A reducer that processes state changes of the editor
     */
    export function editorReducer( state: IEditorState = defaultState, action: IEditorAction ): IEditorState {
        switch ( action.type ) {
            case 'EA_TOGGLE_SPLASH':
            case 'EA_TOGGLE_LOGIN_STATE':
                return Object.assign<IEditorState>( {}, state, action.editorState );
            default:
                return state;
        }
    }
}