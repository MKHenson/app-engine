namespace Animate {

    /**
     * A root node that contains the visual representations of project containers
     */
    export class TreeViewNodeContainers extends TreeNodeModel {

        private _context: IReactContextMenuItem[];
        private _project: Project;

        /**
         * Creates an instance of the node
         */
        constructor( project: Project ) {
            super( 'Containers', <i className="fa fa-cubes" aria-hidden="true"></i> );
            this._context = [
                { label: 'New Container', prefix: <i className="fa fa-cube" aria-hidden="true"></i> }
            ];

            this._project = project;
            this._project.on<ProjectEvents, IResourceEvent>( 'resource-created', this.onResourceCreated, this );
        }

        /**
         * Clean up
         */
        dispose() {
            super.dispose();
            this._project.off<ProjectEvents, IResourceEvent>( 'resource-created', this.onResourceCreated, this );
            this._project = null;
        }

        /**
         * Show context menu items
         */
        onContext( e: React.MouseEvent ) {
            e.preventDefault();
            ReactContextMenu.show({ x: e.pageX, y: e.pageY, items: this._context });
        }

        /**
         * If a container is created, then add its node representation
         */
        onResourceCreated( type: ProjectEvents, event: IResourceEvent ) {
            let r = event.resource;
            if ( r instanceof Resources.Container )
                this.addNode( new TreeNodeContainerInstance( r, this._project ) );
        }
    }
}