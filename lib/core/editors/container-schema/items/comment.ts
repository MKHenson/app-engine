import { CanvasItem } from './canvas-item';
import { IComment } from '../../../../setup/models';

/**
 * A user comment within the workspace
 */
export class Comment extends CanvasItem {
    public label: string;
    public width: number;
    public height: number;

    /**
     * Creates an instance
     */
    constructor( label: string = 'Type a message' ) {
        super();
        this.label = label;
        this.width = 150;
        this.height = 50;
    }

    /**
     * Clones the canvas item
     */
    clone( clone?: Comment ): Comment {
        if ( !clone )
            clone = new Comment( this.label );

        clone.width = this.width;
        clone.height = this.height;

        super.clone( clone );
        return clone;
    }

    /**
     * Serializes the data into a JSON.
     */
    serialize( id: number ): IComment {
        let toRet = <IComment>super.serialize( id );
        toRet.type = 'comment';
        toRet.label = this.label;
        toRet.width = this.width;
        toRet.height = this.height;
        return toRet;
    }

    /**
     * De-Serializes data from a JSON.
     * @param data The data to import from
     */
    deSerialize( data: IComment ) {
        super.deSerialize( data );
        this.width = data.width!;
        this.height = data.height!;
        this.label = data.label;
    }
}