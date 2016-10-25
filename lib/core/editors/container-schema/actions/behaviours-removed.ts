import { EditorAction } from '../../editor-action';
import { CanvasItem } from '../items/canvas-item';
import { ContainerSchema } from '../container-schema';

/**
 * An action for removing behaviours from a container
 */
export class BehavioursRemoved extends EditorAction {

    instances: CanvasItem[];
    clones: CanvasItem[];

    constructor( instances: CanvasItem[] ) {
        super();
        this.instances = instances;
        this.clones = [];
    }

    /**
     * Undo the last history action
     */
    undo( editor: ContainerSchema ) {
        for ( const item of this.clones )
            editor.addItem( item );

        this.instances = this.clones;
        this.clones.splice( 0, this.clones.length );
    }

    /**
     * Redo the next action
     */
    redo( editor: ContainerSchema ) {
        this.clones.splice( 0, this.clones.length );
        for ( const item of this.instances ) {
            this.clones.push( item.clone() );
            editor.removeItem( item );
        }
    }
}