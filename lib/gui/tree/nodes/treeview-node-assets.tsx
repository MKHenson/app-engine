module Animate {

    /**
     * A root node that contains the visual representations of project assets
     */
    export class TreeViewNodeAssets extends TreeNodeModel {

        /**
         * Creates an instance of the node
         */
        constructor() {
            super('Assets', <i className="fa fa-leaf" aria-hidden="true"></i> );

            // Add all the asset nodes
			let assetTemplates = PluginManager.getSingleton().assetTemplates;

			for ( let template of assetTemplates )
				for ( let assetClass of template.classes )
					this.addNode( new TreeNodeAssetClass( assetClass ) );


            User.get.project.on("resource-created", this.onResourceCreated, this);
        }

        /**
         * Clean up
         */
        dispose() {
            super.dispose();
            User.get.project.off("resource-created", this.onResourceCreated, this);
        }

        /**
        * If a container is created, then add its node representation
        */
        onResourceCreated(type: string, event: ProjectEvent<ProjectResource<Engine.IResource>>) {
            let r = event.resource;
            if (r instanceof Container)
                this.addNode(new TreeViewNodeResource(r));
        }
    }
}