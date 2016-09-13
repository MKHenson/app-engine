namespace Animate {

    export namespace Resources {

        /**
         * Each project has a list of containers. These are saved into the database and retrieved when we work with Animate. A container is
         * essentially a piece of code that executes behaviour nodes and plugin logic when activated. It acts as a 'container' for logic.
         */
        export class Container extends ProjectResource<Engine.IContainer> {
            public canvas: Canvas;
            public workspace: ContainerWorkspace;

            /**
             * @param {Engine.IContainer} entry The data associated with this container resource
             */
            constructor( entry?: Engine.IContainer ) {
                super( entry );

                this.workspace = new ContainerWorkspace(this);
                this.canvas = null;
                this._properties.addVar( new PropBool( 'Start On Load', true, 'Container Properties' ) );
                this._properties.addVar( new PropBool( 'Unload On Exit', true, 'Container Properties' ) );
            }

            /**
            * This function is called just before the entry is saved to the database.
            */
            onSaving(): any {
                // TODO: Update with new React Canvas
                // =======================================
                // // Make sure the container is fully serialized before saving if there is an open canvas
                // if (this.canvas) {
                //     var token: IContainerToken = this.canvas.tokenize(false);
                //     this.entry.json = token;
                // }
                // =======================================
            }

            /**
             * Use this function to initialize the resource. This called just after the resource is created and its entry set.
             */
            initialize() {
                const containerToken = this.entry.json;
                this.workspace.deserialize( containerToken );
                if ( containerToken.properties )
                    this._properties.deTokenize( containerToken.properties );
            }

            /**
             * This will cleanup the behaviour.
             */
            dispose() {
                this.emit( new ContainerEvent( EventTypes.CONTAINER_DELETED, this ) );
                super.dispose();
                this.canvas = null;
            }
        }

    }
}