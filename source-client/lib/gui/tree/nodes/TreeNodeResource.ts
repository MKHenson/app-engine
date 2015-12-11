module Animate
{
	/**
	* This node represents a project resource
	*/
    export class TreeNodeResource<T extends ProjectResource<Engine.IResource>> extends TreeNode
    {
        public resource: T;
        private _dropProxy: any;

        constructor(resource: T, text: string, img: string, hasExpand: boolean)
		{
            // Call super-class constructor
            super(text, img, hasExpand);

            this.resource = resource;
			this.canDelete = true;
            this.canUpdate = true;
            
            this._dropProxy = this.onDropped.bind( this );
            this.element.draggable(<JQueryUI.DroppableOptions>{ opacity: 0.7, helper: "clone", appendTo: "body", containment: "body" });
            this.element.droppable(<JQueryUI.DroppableOptions>{ drop: this._dropProxy, accept: ".tree-node-asset,.tree-node-group" });

            resource.on("modified", this.onModified, this);
            resource.on("deleted", this.onDeleted, this);
            resource.on("refreshed", this.onRefreshed, this);
        }

        /** 
        * Called whenever the resource is re-downloaded
        */
        protected onRefreshed(type: string, event: Event, sender: EventDispatcher)
        {
            this.text = this.resource.entry.name;
        }

        /** 
        * Called whenever the resource is modified
        */
        protected onDeleted(type: string, event: Event, sender: EventDispatcher)
        {
            this.dispose();
        }

        /** 
		* Called whenever the resource is modified
		*/
        protected onModified(type: string, event: Event, sender: EventDispatcher)
        {
            this.modified = !this.resource.saved;
        }
                    
		/**
		* Called when a draggable object is dropped onto the node
		*/
        protected onDropped(event, ui)
		{
			var comp : TreeNode = jQuery( ui.draggable ).data( "component" );
		}

		/**
		* This will cleanup the component.
		*/
		dispose()
        {
            this.resource.on("refreshed", this.onRefreshed, this);
            this.resource.off("modified", this.onModified, this);
            this.resource.on("deleted", this.onDeleted, this);

            this.element.draggable("destroy");
            this.element.droppable("destroy");

			//Call super - must be called here in this case
			super.dispose();
            this._dropProxy = null;
            this.resource = null;
		}
	}
}