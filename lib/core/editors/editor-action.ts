import { Editor } from './editor';

/**
 * The base class for all editor actions
 */
export abstract class EditorAction {

    /**
     * Undo the last history action
     */
    abstract undo( editor: Editor );

    /**
     * Redo the next action
     */
    abstract redo( editor: Editor );
}