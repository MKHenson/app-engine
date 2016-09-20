namespace Animate {

    export namespace Actions {

        /**
         * An action for the creation of a user comment in a container schema
         */
        export class CommentCreated extends EditorAction {
            instance: Comment;
            left: number;
            top: number;

            constructor( left: number, top: number ) {
                super();
                this.left = left;
                this.top = top;
            }

            /**
             * Undo the last history action
             */
            undo( editor : Animate.ContainerSchema ) {
                editor.removeItem( this.instance );
            }

            /**
             * Redo the next action
             */
            redo( editor : Animate.ContainerSchema ) {
                this.instance = new Comment();
                this.instance.left = this.left;
                this.instance.top = this.top;
                editor.addItem( this.instance );
            }
        }

    }
}