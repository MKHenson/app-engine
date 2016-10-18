namespace Animate {

    /**
     * A reducer that processes state changes of the editor
     */
    export function loggerReducer( state: ILogMessage[] = [], action: ILoggerAction ): ILogMessage[] {
        switch ( action.type ) {
            case 'LOGGER_ADD_ITEM':
                return state.concat( action.item! );
            case 'LOGGER_CLEAR_ITEMS':
                return [];
            default:
                return state;
        }
    }
}