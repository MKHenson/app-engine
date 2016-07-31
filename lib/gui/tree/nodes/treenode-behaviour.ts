module Animate {
	/**
	*  A tree node class for behaviour container objects.
	*/
    export class TreeNodeBehaviour extends TreeNodeResource<Container> {
		/**
		* @param {Container} behaviour The container we are associating with this node
		*/
		constructor( container: Container ) {
			// Call super-class constructor
            super(container, container.entry.name, "media/variable.png", false );
			this.element.addClass( "behaviour-to-canvas" );
            container.on("edited", this.onPropertyGridEdited, this);
        }

		/**
		* Called when the node is selected
		*/
		onSelect() {
            PropertyGrid.getSingleton().editableObject(this.resource.properties, this.text, "media/variable.png");
		}

		/**
		* Whenever a container property is changed by the editor
		*/
        onPropertyGridEdited(type: string, event: EditEvent, sender?: EventDispatcher) {
            this.resource.saved = false;
            //this.resource.properties.updateValue(event.propertyName, event.prop.getVal());
        }

		/**
        * This will cleanup the component
        */
		dispose() {
            this.resource.off("edited", this.onPropertyGridEdited, this);

			//Call super
			super.dispose();
		}
	}
}