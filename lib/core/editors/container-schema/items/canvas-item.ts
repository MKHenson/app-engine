namespace Animate {

    export type LinkMap = {
        [ shallowId: number ]: { item: CanvasItem; token: Engine.Editor.ICanvasItem; }
    };

    /**
     * The base class for all canvas items
     */
    export class CanvasItem extends EventDispatcher {
        public store: ContainerSchema;
        protected _serializable: Serializable<Engine.Editor.ICanvasItem>

        /**
         * Creates an instance
         */
        constructor( options: Engine.Editor.ICanvasItem ) {
            super();

            this._serializable = new Serializable<Engine.Editor.ICanvasItem>( {
                id: -1,
                top: 0,
                left: 0,
                width: 0,
                height: 0,
                selected: false,
                type: 'behaviour'
            } as Engine.Editor.ICanvasItem );

            if (options)
                this._serializable.update(options);
        }

        get serializer() {
            return this._serializable;
        }

        /**
         * Updates the properties of the item and calls for an invalidation
         */
        update( options: Engine.Editor.ICanvasItem ) {
            this._serializable.update( options );
            this.invalidate();
        }

        /**
         * Clones the canvas item
         */
        clone( clone?: CanvasItem ): CanvasItem {
            if ( !clone )
                clone = new CanvasItem( this._serializable.toObject() );

            //clone._immutable = clone._immutable.mergeDeep( this._immutable.toJS() );
            return clone;
        }

        /**
         * Called when we activate the context menu on the behaviour
         */
        onContext( e: React.MouseEvent ) {

        }

        /**
         * Serializes the data into a JSON.
         */
        serialize( id: number ): Serializable<Engine.Editor.ICanvasItem> {
            this.serializer.update( { id: id } as Engine.Editor.ICanvasItem );
            return this.serializer;
        }

        /**
         * Called after de-tokenization. This is so that the items can link up to any other items that might have been created in the process.
         * @param originalId The original shallow ID of the item when it was tokenized.
         * @param items The items loaded from the detokenization process. To get this item you can do the following: items[originalId].item
         * or to get the token you can use items[originalId].token
         */
        link( originalId: number, items: LinkMap ) {
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
}