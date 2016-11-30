import { ContainerSchema } from '../container-schema';
import { EventDispatcher } from '../../../event-dispatcher';

export type LinkMap = {
    [ shallowId: number ]: { item: CanvasItem; token: HatcheryEditor.ICanvasItem; }
};

/**
 * The base class for all canvas items
 */
export class CanvasItem extends EventDispatcher {
    public top: number;
    public left: number;
    public width: number;
    public height: number;
    public store: ContainerSchema | null;
    public id: number;
    public selected: boolean;

    /**
     * Creates an instance
     */
    constructor() {
        super();
        this.id = -1;
        this.top = 0;
        this.left = 0;
        this.selected = false;
    }

    /**
     * Clones the canvas item
     */
    clone( clone?: CanvasItem ): CanvasItem {
        if ( !clone )
            clone = new CanvasItem();

        clone.id = -1;
        clone.top = this.top;
        clone.left = this.left;
        clone.selected = this.selected;
        return clone;
    }

    /**
     * Called when we activate the context menu on the behaviour
     */
    onContext( e: React.MouseEvent ) {
        e; // Supresses unused param error
    }

    /**
     * Serializes the data into a JSON.
     */
    serialize( id: number ): HatcheryEditor.ICanvasItem {
        this.id = id;
        const toRet: HatcheryEditor.ICanvasItem = {
            id: id,
            type: 'behaviour',
            left: this.left,
            top: this.top,
            selected: this.selected,
            width: this.width,
            height: this.height
        };

        return toRet;
    }

    /**
     * De-serialize data from a JSON.
     * @param data The data to import from
     */
    deSerialize( data: HatcheryEditor.ICanvasItem ) {
        this.top = data.top!;
        this.left = data.left!;
        this.width = data.width!;
        this.height = data.height!;
    }

    /**
     * Called after de-tokenization. This is so that the items can link up to any other items that might have been created in the process.
     * @param originalId The original shallow ID of the item when it was tokenized.
     * @param items The items loaded from the detokenization process. To get this item you can do the following: items[originalId].item
     * or to get the token you can use items[originalId].token
     */
    link( originalId: number, items: LinkMap ) {
        originalId; // Supresses unused param error
        items;
    }

    /**
     * Causes the store to refresh its state
     */
    invalidate() {
        if ( this.store )
            this.store.invalidate();
    }

    /**
     * Clean up
     */
    dispose() {
        this.store = null;
        super.dispose();
    }
}
