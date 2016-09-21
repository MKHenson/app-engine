namespace Animate {

    export namespace Actions {

        /**
         * An action for when the selection changes on a container schema
         */
        export class SelectionChanged extends EditorAction {

            selectionIds: number[];
            previousSelection: number[];

            constructor( selectionIds: number[] ) {
                super();
                this.selectionIds = selectionIds;
                this.previousSelection = [];

                for ( const id of selectionIds )
                    if (id === -1)
                        throw new Error("Cannot have -1")
            }

            /**
             * Undo the last history action
             */
            undo( editor: Animate.ContainerSchema ) {
                const editorItems = editor.getItems();
                const prevSelection = this.previousSelection;

                for ( const item of editorItems )
                    item.selected = false;

                for ( let i = 0, l = prevSelection.length; i < l; i++ )
                    editorItems[ prevSelection[ i ] ].selected = true;
            }

            /**
             * Redo the next action
             */
            redo( editor: Animate.ContainerSchema ) {
                const editorItems = editor.getItems();
                this.previousSelection.splice( 0, this.previousSelection.length );

                for ( let i = 0, l = editorItems.length; i < l; i++ ) {
                    let item = editorItems[ i ];
                    if ( item.selected )
                        this.previousSelection.push( i );

                    item.selected = false;
                }

                for ( const index of this.selectionIds )
                    editorItems[ index ].selected = true;
            }
        }

    }
}