module Animate
{
	/**
	*  A tree node class for behaviour container objects.
	*/
    export class TreeNodeBehaviour extends TreeNodeResource<Container>
	{
		/**
		* @param {Container} behaviour The container we are associating with this node
		*/
		constructor( container: Container )
		{
			// Call super-class constructor
            super(container, container.entry.name, "media/variable.png", false );
			this.element.addClass( "behaviour-to-canvas" );
            PropertyGrid.getSingleton().on(PropertyGridEvents.PROPERTY_EDITED, this.onPropertyGridEdited, this);
        }

		/**
		* Called when the node is selected
		*/
		onSelect()
        {
            PropertyGrid.getSingleton().editableObject(this.resource.properties, this.text, this.resource, "media/variable.png");
		}

		/**
		* Whenever a container property is changed by the editor
		*/
		onPropertyGridEdited( response: PropertyGridEvents, event : PropertyGridEvent, sender? : EventDispatcher )
		{
            if (event.id == this.resource)
			{
                this.resource.saved = false;
                this.resource.properties.updateValue(event.propertyName, event.propertyValue);
			}
        }
        
		/**
        * This will cleanup the component
        */
		dispose()
        {
			PropertyGrid.getSingleton().off( PropertyGridEvents.PROPERTY_EDITED, this.onPropertyGridEdited, this );

			//Call super
			super.dispose();
		}
	}
}