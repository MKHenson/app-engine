namespace Animate {

    export namespace Actions {

        /**
         * An action for when a selection is moved in a container schema
         */
        export class SelectionMoved extends EditorAction {

            positions: { index: number; x: number; y: number; }[];
            previousPositions: { index: number; x: number; y: number; }[];

            constructor( positions: { index: number; x: number; y: number; }[] ) {
                super();
                this.positions = positions;
                this.previousPositions = [];
            }

            /**
             * Undo the last history action
             */
            undo( editor: Animate.ContainerSchema ) {
                const editorItems = editor.getItems();
                const positions = this.previousPositions;

                // Go back to previous positions
                for ( const position of positions ) {
                    editorItems[ position.index ].left = position.x;
                    editorItems[ position.index ].top = position.y;
                }
            }

            /**
             * Redo the next action
             */
            redo( editor: Animate.ContainerSchema ) {
                const editorItems = editor.getItems();
                const positions = this.positions;
                this.previousPositions.splice( 0, this.previousPositions.length );

                // Make a backup of the previous positions
                for ( const position of positions ) {
                    this.previousPositions.push( {
                        index: position.index,
                        x: editorItems[ position.index ].left,
                        y: editorItems[ position.index ].top
                    });

                    editorItems[ position.index ].left = position.x;
                    editorItems[ position.index ].top = position.y;
                }
            }
        }

    }
}