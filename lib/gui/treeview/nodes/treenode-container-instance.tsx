namespace Animate {

	/**
	 * Treenode that contains a reference to an asset
	 */
    export class TreeNodeContainerInstance extends TreeViewNodeResource<Resources.Container> {

		/**
		 * Creates an instance of the node
		 */
        constructor( container: Resources.Container ) {
            super( container );
        }

        /**
         * Called whenever the node is double clicked
         */
        onDoubleClick( e: React.MouseEvent ) {
            User.get.project.openContainerWorkspace( this.resource, true );
        }
    }
}