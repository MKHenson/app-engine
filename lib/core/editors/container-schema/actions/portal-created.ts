namespace Animate {

    export namespace Actions {

        /**
         * An action for the creation of portals
         */
        export class PortalCreated extends EditorAction {
            target: Behaviour;
            instance: BehaviourPortal;
            portal: Portal;
            left: number;
            top: number;

            constructor( portal: Portal, target: Behaviour, left: number, top: number ) {
                super();
                this.target = target;
                this.portal = portal;
                this.left = left;
                this.top = top;
            }

            /**
             * Undo the last history action
             */
            undo( editor : Animate.ContainerSchema ) {
                if (this.target)
                    this.target.removePortal( this.target.getPortal( this.portal.property.name ) );
                else {
                    editor.removeItem( this.instance );
                }
            }

            /**
             * Redo the next action
             */
            redo( editor : Animate.ContainerSchema ) {
                if (this.target)
                    this.target.addPortal( this.portal.type, this.portal.property );
                else {
                    this.instance = new BehaviourPortal( this.portal.property.clone(), this.portal.type );
                    // this.instance.left = this.left;
                    // this.instance.top = this.top;
                    // this.instance.alias = this.portal.property.name;
                    this.instance.update({
                        left: this.left,
                        top: this.top,
                        alias: this.portal.property.name
                    } as Engine.Editor.IBehaviour);
                    editor.addItem( this.instance );
                }
            }
        }

    }
}