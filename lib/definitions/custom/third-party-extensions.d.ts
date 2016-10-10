// ===============================
// JS COLOR
// - TODO:  This might be removed from
//          conversion to react
// ===============================
interface JSColor {
    color( elm: any, options?: any ): void;
    fromString( val: string ): void;
}

declare var jscolor: JSColor;

// ===============================
// ES6 Objecy.assign
// - TODO:  This might be removed from
//          conversion to es6
// ===============================
declare interface ObjectConstructor {
    assign( target: any, ...sources: any[] ): any;
}

// ===============================
// ACE EDITOR
// -    Adds the remove functions that appear to be missing from the official definition file
// ===============================
declare namespace AceAjax {
    export interface CommandManager {
        removeCommand(command:EditorCommand | string): void;
    }

    export interface Editor {
        removeEventListener(ev: 'change', callback: (ev: EditorChangeEvent) => any): void;
        removeEventListener(ev: string, callback: Function): void;
        removeAllListeners(ev: string): void;
    }
}



// ===============================
// REDUX
// -    Bug fix: The redux definition doesnt seem to support the Thunk middleware
//      method of dispatching actions. So we extend the existing definition with the
//      below
// ===============================
declare namespace Redux {
    interface Dispatch<S> {
        <A extends Action>( callback:( dispatch: Dispatch<S>, getState: Function ) => void ): void;
    }
}