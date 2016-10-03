namespace Animate {

    export namespace Actions {

        /**
         * An action for the creation of links within a container
         */
        export class LinkCreated extends EditorAction {

            instance: Link;
            options: Engine.Editor.ILinkItem;

            constructor( options: Engine.Editor.ILinkItem ) {
                super();
                this.options = options;
            }

            /**
             * Undo the last history action
             */
            undo( editor : Animate.ContainerSchema ) {

                const items = editor.getItems();
                const start = items[this.options.startBehaviour] as Behaviour;
                const end = items[this.options.endBehaviour] as Behaviour;
                start.getPortal( this.options.startPortal ).removeLink( this.instance );
                end.getPortal( this.options.endPortal ).removeLink( this.instance );

                editor.removeItem( this.instance );
                this.instance = null;
            }

            /**
             * Redo the next action
             */
            redo( editor : Animate.ContainerSchema ) {
                this.instance = new Link(
                    this.options
                );
                // this.instance.left = this.options.left;
                // this.instance.top = this.options.top;
                // this.instance.width = this.options.width;
                // this.instance.height = this.options.height;
                // this.instance.startBehaviour = this.options.startBehaviour;
                // this.instance.endBehaviour = this.options.endBehaviour;
                // this.instance.startPortal = this.options.startPortal;
                // this.instance.endPortal = this.options.endPortal;

                const items = editor.getItems();
                const start = items[this.options.startBehaviour] as Behaviour;
                const end = items[this.options.endBehaviour] as Behaviour;
                start.getPortal( this.options.startPortal ).addLink( this.instance );
                end.getPortal( this.options.endPortal ).addLink( this.instance );

                editor.addItem( this.instance );
            }
        }

    }
}