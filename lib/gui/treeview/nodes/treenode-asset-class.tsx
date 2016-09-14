namespace Animate {

	/**
	 * A node that represents an Asset Class
	 */
    export class TreeNodeAssetClass extends TreeNodeModel {
        public assetClass: AssetClass;

		/**
		 * Creates an instance of node
		 */
        constructor( assetClass: AssetClass ) {
            super( assetClass.name, <i className="fa fa-leaf" aria-hidden="true"></i> );

            this.selectable( false );
            this.assetClass = assetClass;

            // Add the sub-class nodes
            for ( let ii = 0; ii < assetClass.classes.length; ii++ ) {
                const c = assetClass.classes[ ii ];
                const toRet = new TreeNodeAssetClass( c );
                this.addNode( toRet );
            }

            User.get.project.on<ResourceEvents, IResourceEvent>( "created", this.onResourceCreated, this );
        }

		/**
         * Clean up
         */
        dispose() {
            User.get.project.off<ResourceEvents, IResourceEvent>( "created", this.onResourceCreated, this );
            this.assetClass = null;
            super.dispose();
        }

		/**
         * If a container is created, then add its node representation
         */
        onResourceCreated( type: ResourceEvents, event: IResourceEvent ) {
            let r = event.resource;
            if ( r instanceof Resources.Asset ) {

                if ( r.class === this.assetClass )
                    return;

                const instanceNode = new TreeNodeAssetInstance( this.assetClass, r );
                this.addNode( instanceNode );
            }
        }

		/**
		 * This will get all instance nodes of a particular class name(s)
		 * @param {string | string[]} classNames The class name of the asset, or an array of class names
		 * @returns {TreeNodeAssetInstance[]}
		 */
        getInstances( classNames: string | string[] ): TreeNodeAssetInstance[] {
            let toRet: TreeNodeAssetInstance[] = null;
            let children = this.children;
            let names: string[];

            if ( !classNames )
                names = [ null ];
            else if ( typeof ( classNames ) === 'string' )
                names = [ classNames as string ];
            else
                names = classNames as string[];

            toRet = [];

            for ( let name of names ) {

                // If name matches this classs
                if ( name === null || name === this.assetClass.name || name === '' ) {
                    for ( let node of children ) {
                        if ( node instanceof TreeNodeAssetInstance )
                            toRet.push( node );
                        else if ( node instanceof TreeNodeAssetClass ) {
                            let instances = node.getInstances( null );
                            for ( let instance of instances )
                                toRet.push( instance );
                        }
                    }
                }
                else {
                    // Name does not match - so search for deeper matches
                    for ( let node of children ) {
                        if ( node instanceof TreeNodeAssetClass ) {
                            let instances = node.getInstances( names );
                            for ( let instance of instances )
                                if ( toRet.indexOf( instance ) === -1 )
                                    toRet.push( instance );
                        }
                    }
                }
            }

            return toRet;
        }
    }
}