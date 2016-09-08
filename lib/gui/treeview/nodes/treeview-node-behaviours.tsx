namespace Animate {

    /**
     * A root node that contains the visual representations of project containers
     */
    export class TreeViewNodeBehaviours extends TreeNodeModel {

        /**
         * Creates an instance of the node
         */
        constructor() {
            super( 'Behaviours', <i className="fa fa-plug" aria-hidden="true"></i> );
            PluginManager.getSingleton().on( 'template-created', this.onTemplateCreated, this );
            this.expanded( false );
        }

        /**
         * Clean up
         */
        dispose() {
            super.dispose();
            PluginManager.getSingleton().off( 'template-created', this.onTemplateCreated, this );

        }

        /**
         * Show context menu items
         */
        onContext( e: React.MouseEvent ) {
            e.preventDefault();
        }

        /**
         * If a template is created, then add its node representation
         */
        onTemplateCreated( type: string, event: Event ) {
            let r = event.tag as BehaviourDefinition;
            this.addNode( new TreeNodePluginBehaviour( r ) );
        }
    }
}