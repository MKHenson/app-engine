import { EditorAction } from '../../editor-action';
import { ContainerSchema } from '../container-schema';

/**
 * An action for when comment text is editted
 */
export class CommentEditted extends EditorAction {
    index: number;
    prevLabel: string;
    label: string;

    constructor( index: number, label: string ) {
        super();
        this.prevLabel = '';
        this.label = label;
        this.index = index;
    }

    /**
     * Undo the last history action
     */
    undo( editor: ContainerSchema ) {
        const item = editor.getItems()[ this.index ] as Comment;
        item.label = this.prevLabel;
    }

    /**
     * Redo the next action
     */
    redo( editor: ContainerSchema ) {
        const item = editor.getItems()[ this.index ] as Comment;
        this.prevLabel = item.label;
        item.label = this.label;
    }
}