import { EditorAction } from '../../editor-action';
import { ContainerSchema } from '../container-schema';
import { Comment } from '../items/comment';

/**
 * An action for when comments are resized in a container schema
 */
export class CommentResized extends EditorAction {
    index: number;
    width: number;
    height: number;
    prevWidth: number;
    prevHeight: number;

    constructor( index: number, width: number, height: number ) {
        super();
        this.width = width;
        this.height = height;
        this.index = index;
    }

    /**
     * Undo the last history action
     */
    undo( editor: ContainerSchema ) {
        const item = editor.getItems()[ this.index ] as Comment;
        item.height = this.prevHeight;
        item.width = this.prevWidth;
    }

    /**
     * Redo the next action
     */
    redo( editor: ContainerSchema ) {
        const item = editor.getItems()[ this.index ] as Comment;
        this.prevWidth = item.width;
        this.prevHeight = item.height;
        item.width = this.width;
        item.height = this.height;
    }
}