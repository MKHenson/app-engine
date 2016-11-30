/**
 * Describes each of the project action types
 */
export type LoggerActionType =
    'LOGGER_ADD_ITEM' |
    'LOGGER_CLEAR_ITEMS';

/**
 * A base interface for describing logger related actions
 */
export interface ILoggerAction extends Redux.Action {
    type: LoggerActionType;
    item?: HatcheryEditor.ILogMessage;
};


function createMessage( msg: string, type: HatcheryEditor.LogType ): HatcheryEditor.ILogMessage {
    return {
        message: msg,
        type: type,
        tag: null
    }
}

/**
 * Creates an action to clear all log items
 */
export function clear(): ILoggerAction {
    return {
        type: 'LOGGER_CLEAR_ITEMS'
    }
}

/**
 * Creates an action for adding a log message in the log window
 */
export function message( message: string ): ILoggerAction {
    return {
        type: 'LOGGER_ADD_ITEM',
        item: createMessage( message, 'message' )
    }
}

/**
 * Creates an action for adding a warning log message in the log window
 */
export function warning( message: string ): ILoggerAction {
    return {
        type: 'LOGGER_ADD_ITEM',
        item: createMessage( message, 'warning' )
    }
}

/**
 * Creates an action for adding an error log message in the log window
 */
export function error( message: string ): ILoggerAction {
    return {
        type: 'LOGGER_ADD_ITEM',
        item: createMessage( message, 'error' )
    }
}