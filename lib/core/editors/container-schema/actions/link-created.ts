import { EditorAction } from '../../editor-action';
import { ContainerSchema } from '../container-schema';

/**
 * An action for the creation of links within a container
 */
export class LinkCreated extends EditorAction {

    instance: Link | null;
    options: ILinkItem;

    constructor( options: ILinkItem ) {
        super();
        this.options = options;
    }

    /**
     * Undo the last history action
     */
    undo( editor: ContainerSchema ) {
        editor.removeItem( this.instance! );
        this.instance = null;
    }

    /**
     * Redo the next action
     */
    redo( editor: ContainerSchema ) {
        this.instance = new Link();
        this.instance.left = this.options.left!;
        this.instance.top = this.options.top!;
        this.instance.width = this.options.width!;
        this.instance.height = this.options.height!;
        this.instance.startBehaviour = this.options.startBehaviour!;
        this.instance.endBehaviour = this.options.endBehaviour!;
        this.instance.startPortal = this.options.startPortal!;
        this.instance.endPortal = this.options.endPortal!;
        editor.addItem( this.instance );
    }
}