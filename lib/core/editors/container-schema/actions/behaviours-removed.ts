namespace Animate {

    export namespace Actions {

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
            undo( editor: Animate.ContainerSchema ) {
                for ( const item of this.clones )
                    editor.addItem( item );

                this.instances = this.clones;
                this.clones = null;
            }

            /**
             * Redo the next action
             */
            redo( editor: Animate.ContainerSchema ) {
                this.clones.splice( 0, this.clones.length );
                for ( const item of this.instances ) {
                    this.clones.push( item.clone() );
                    editor.removeItem( item );
                }
            }
        }

    }
}