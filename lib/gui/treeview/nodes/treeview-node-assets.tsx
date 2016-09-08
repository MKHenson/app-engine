namespace Animate {

    /**
     * A root node that contains the visual representations of project assets
     */
    export class TreeViewNodeAssets extends TreeNodeModel {

        /**
         * Creates an instance of the node
         */
        constructor() {
            super( 'Assets', <i className="fa fa-leaf" aria-hidden="true"></i> );

            // Add all the asset nodes
            let assetTemplates = PluginManager.getSingleton().assetTemplates;

            for ( let template of assetTemplates )
                for ( let assetClass of template.classes )
                    this.addNode( new TreeNodeAssetClass( assetClass ) );
        }

        /**
         * Called whenever the node receives a context event
         * @param {React.MouseEvent} e
         */
        onContext( e: React.MouseEvent ) {
            e.preventDefault();
            e.stopPropagation();
        }
    }
}