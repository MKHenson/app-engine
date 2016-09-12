namespace Animate {

    export type LinkMap = {
        [ shallowId: number ]: { item: CanvasItem; token: Engine.Editor.ICanvasItem; }
    };

    /**
     * The base class for all canvas items
     */
    export class CanvasItem extends EventDispatcher {
        public top: number;
        public left: number;
        public className: string;
        public store: ContainerWorkspace;
        public id: number;
        private _selected: boolean;

        /**
         * Creates an instance
         */
        constructor() {
            super();
            this.id = -1;
            this.top = 0;
            this.left = 0;
            this._selected = false;
            this.className = '';
        }

        /**
         * Called when we activate the context menu on the behaviour
         */
        onContext( e: React.MouseEvent ) {

        }

        /**
         * Gets or sets if the item is selected
         * @param {boolean} val
         * @returns {boolean}
         */
        selected( val?: boolean ): boolean {

            if ( val === undefined )
                return this._selected;

            this._selected = val;
            this.invalidate();
            return val;
        }

        /**
         * Serializes the data into a JSON.
         * @param {number} id
         * @returns {ICanvasItem}
         */
        serialize( id: number ): Engine.Editor.ICanvasItem {
            this.id = id;
            const toRet: Engine.Editor.ICanvasItem = {
                id: id,
                type: 'behaviour',
                left: this.left,
                top: this.top
            };

            return toRet;
        }

        /**
         * De-serialize data from a JSON.
         * @param {ICanvasItem} data The data to import from
         */
        deSerialize( data: Engine.Editor.ICanvasItem ) {
            this.top = data.top;
            this.left = data.left;
        }

        /**
         * Called after de-tokenization. This is so that the items can link up to any other items that might have been created in the process.
         * @param {number} originalId The original shallow ID of the item when it was tokenized.
         * @param {LinkMap} items The items loaded from the detokenization process. To get this item you can do the following: items[originalId].item
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