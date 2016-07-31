module Animate {
	/**
	* This node represents a group asset. Goups are collections of objects - think of them as arrays.
	*/
    export class TreeNodeGroup extends TreeNodeResource<GroupArray> {
        constructor(group: GroupArray)
		{
            // Call super-class constructor
            super(group, group.entry.name, "media/array.png", true);

            this.element.addClass("tree-node-group");
            var project = User.get.project;

            //Add each of the node references
            for (var i = 0, items = group.entry.items, l = items.length; i < l; i++) {
                var resource = project.getResourceByShallowID<ProjectResource<Engine.IResource>>(items[i]);
                this.addNode(new TreeNodeGroupInstance(resource.entry._id, resource.entry.name, group));
            }
        }

        /**
        * Called whenever the resource is re-downloaded
        */
        protected onRefreshed(type: string, event: Event, sender: EventDispatcher) {
            super.onRefreshed(type, event, sender);

            //Remove all current nodes
            while (this.children.length > 0)
                this.children[0].dispose();

            var project: Project = User.get.project;
            var group = this.resource;

            //Add each of the node references
            for (var i = 0, items = group.entry.items, l = items.length; i < l; i++) {
                var resource = project.getResourceByShallowID<ProjectResource<Engine.IResource>>(items[i]);
                this.addNode(new TreeNodeGroupInstance(resource.entry._id, resource.entry.name, group));
            }
        }

		/**
		* Called when a draggable object is dropped onto the canvas.
		*/
		protected onDropped( event, ui ) {
			var comp : TreeNode = jQuery( ui.draggable ).data( "component" );
			if ( comp instanceof TreeNodeAssetInstance || comp instanceof TreeNodeGroup )
			{
                var added = null;
                var entry: Engine.IResource;

                if (comp instanceof TreeNodeAssetInstance)
                {
                    entry = comp.resource.entry;
                    added = this.addNode(new TreeNodeGroupInstance(entry.shallowId, entry.name, this.resource));
                }
                else if (comp instanceof TreeNodeGroup)
                {
                    entry = comp.resource.entry;
                    added = this.addNode(new TreeNodeGroupInstance(entry.shallowId, entry.name, this.resource));
                }

				this.expand();
                this.treeview.selectNode(added);
                this.resource.addReference(entry.shallowId);
			}
		}
	}
}