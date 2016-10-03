namespace Animate {

    export namespace Actions {

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
            undo( editor: Animate.ContainerSchema ) {
                const item = editor.getItems()[ this.index ] as Comment;
                //item.label = this.prevLabel;
                item.update({
                    label: this.prevLabel
                } as Engine.Editor.IComment );
            }

            /**
             * Redo the next action
             */
            redo( editor: Animate.ContainerSchema ) {
                const item = editor.getItems()[ this.index ] as Comment;
                // this.prevLabel = item.label;
                // item.label = this.label;

                this.prevLabel = item.serializer.get('label');
                item.update({
                    label: this.label
                } as Engine.Editor.IComment);
            }
        }

    }
}