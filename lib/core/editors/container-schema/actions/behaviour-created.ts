namespace Animate {

    export namespace Actions {

        /**
         * An action for the creation of behaviours within a container
         */
        export class BehaviourCreated extends EditorAction {

            definition: BehaviourDefinition;
            instance: Behaviour | null;
            options: IBehaviour;
            resource: ProjectResource<HatcheryServer.IResource> | null;

            constructor( definition: BehaviourDefinition, options: IBehaviour, resource?: ProjectResource<HatcheryServer.IResource> ) {
                super();
                this.definition = definition;
                this.resource = resource || null;
                this.options = options;
            }

            /**
             * Undo the last history action
             */
            undo( editor: Animate.ContainerSchema ) {
                editor.removeItem( this.instance! );
                this.instance = null;
            }

            /**
             * Redo the next action
             */
            redo( editor: Animate.ContainerSchema ) {

                switch ( this.definition.behaviourName ) {
                    case 'Asset':
                        this.instance = new BehaviourAsset( this.resource! );
                        break;
                    default:
                        this.instance = new Behaviour( this.definition );
                        break;
                }
                const instance = this.instance!;
                instance.left = this.options.left!;
                instance.top = this.options.top!;
                instance.alias = this.options.alias ? this.options.alias : instance.alias;
                editor.addItem( instance );
            }
        }

    }
}