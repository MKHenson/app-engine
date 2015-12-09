module Animate
{
	/**
	*  A tree node class for behaviour container objects.
	*/
	export class TreeNodeBehaviour extends TreeNode
	{
		private _container: Container;

		/**
		* @param {Container} behaviour The container we are associating with this node
		*/
		constructor( container: Container )
		{
			// Call super-class constructor
            super(container.entry.name, "media/variable.png", false );

			this.element.addClass( "behaviour-to-canvas" );
			this.canDelete = true;
			this.canUpdate = true;
            this._container = container;
			this.element.draggable( { opacity: 0.7, helper: "clone", appendTo: "body", containment: "body" });

            this._container.on("modified", this.onContainerModified, this);
            PropertyGrid.getSingleton().on(PropertyGridEvents.PROPERTY_EDITED, this.onPropertyGridEdited, this);
        }

        /**
		* Whenever the container is modified, we show this with a *
		*/
        onContainerModified(type: string, event: Event, sender: EventDispatcher)
        {
            this.modified = !this._container.saved;
        }

		/**
		* Called when the node is selected
		*/
		onSelect()
        {
            PropertyGrid.getSingleton().editableObject(this._container.properties, this.text, this._container, "media/variable.png");
		}

		/**
		* Whenever a container property is changed by the editor
		*/
		onPropertyGridEdited( response: PropertyGridEvents, event : PropertyGridEvent, sender? : EventDispatcher )
		{
            if (event.id == this._container)
			{
                this._container.saved = false;
                this._container.properties.updateValue(event.propertyName, event.propertyValue);
			}
        }

        /**
        * Gets the container of this node
        * @returns {Container}
        */
        public get container(): Container { return this._container; }
        
		/**
        * This will cleanup the component
        */
		dispose()
        {
            this._container.off("modified", this.onContainerModified, this);

			if ( this.element.hasClass( "draggable" ) )
				this.element.draggable( "destroy" );

			PropertyGrid.getSingleton().off( PropertyGridEvents.PROPERTY_EDITED, this.onPropertyGridEdited, this );
            this._container = null;

			//Call super
			super.dispose();
		}
	}
}