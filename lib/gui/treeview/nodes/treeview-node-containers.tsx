namespace Animate {

    /**
     * A root node that contains the visual representations of project containers
     */
    export class TreeViewNodeContainers extends TreeNodeModel {

        private _context: IReactContextMenuItem[];

        /**
         * Creates an instance of the node
         */
        constructor() {
            super( 'Containers', <i className="fa fa-cubes" aria-hidden="true"></i> );
            this._context = [
                { label: 'New Container', prefix: <i className="fa fa-cube" aria-hidden="true"></i> }
            ];

            User.get.project.on<ResourceEvents, IResourceEvent>( 'created', this.onResourceCreated, this );
        }

        /**
         * Clean up
         */
        dispose() {
            super.dispose();
            User.get.project.off<ResourceEvents, IResourceEvent>( 'created', this.onResourceCreated, this );
        }

        /**
         * Show context menu items
         */
        onContext( e: React.MouseEvent ) {
            e.preventDefault();
            ReactContextMenu.show( { x: e.pageX, y: e.pageY, items: this._context });
        }

        /**
         * If a container is created, then add its node representation
         */
        onResourceCreated( type: ResourceEvents, event: IResourceEvent ) {
            let r = event.resource;
            if ( r instanceof Resources.Container )
                this.addNode( new TreeViewNodeResource( r ) );
        }
    }
}