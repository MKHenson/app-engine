module Animate
{
	/**
	*  A tree node class for behaviour container objects.
	*/
	export class TreeNodeBehaviour extends TreeNode
	{
		public saved: boolean;
		public behaviour: Container;

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
			this.saved = true;
			this.behaviour = container;

			this.element.draggable( { opacity: 0.7, helper: "clone", appendTo: "body", containment: "body" });
			PropertyGrid.getSingleton().on( PropertyGridEvents.PROPERTY_EDITED, this.onPropertyGridEdited, this );
		}

		/**
		* Called when the node is selected
		*/
		onSelect()
		{
			PropertyGrid.getSingleton().editableObject( this.behaviour.properties, this.text, this, "media/variable.png" );
		}

		/**
		* When we click ok on the portal form
		*/
		onPropertyGridEdited( response: PropertyGridEvents, event : PropertyGridEvent, sender? : EventDispatcher )
		{
			if ( event.id == this )
			{
				this.save( false );
				this.behaviour.properties.updateValue(event.propertyName, event.propertyValue);
			}
		}

		/** 
        * Notifies if this node is saved or unsaved. 
        */
		save( val : boolean )
		{
			this.saved = val;
			this.behaviour.saved = val;
            //this.text = this.originalText;
            this.modified = !val;
		}

		/**
		* Sets the text of the node
		* @param {string} val The text to set
		*/
		set text( val: string )
		{
			//First we try and get the tab
            var tabPair: TabPair = CanvasTab.getSingleton().getTab(this.text);

            this.mText = val;
            jQuery(".text:first", this.element).text(val);

			//Tab was not found - check if its because its unsaved
			//if ( tabPair == null )
			//	tabPair = CanvasTab.getSingleton().getTab( "*" + this.originalText );

			//If we have a tab then rename it to the same as the node
			if ( tabPair )
			{
				//this.originalText = val;
                //jQuery(".text:first", this.element).text((this.behaviour.saved ? "" : "*") + this.originalText);
                tabPair.text = val;
                tabPair.name = val;
				//jQuery( ".text", tabPair.tabSelector.element ).text( ( this.behaviour.saved ? "" : "*" ) + this.originalText );
				//tabPair.name = ( this.behaviour.saved ? "" : "*" ) + this.originalText;
			}
			//else
			//{
				//this.originalText = val;
			//	jQuery( ".text:first", this.element ).text( ( this.behaviour.saved ? "" : "*" ) + this.originalText );
			//}

            //this.behaviour.entry.name = this.originalText;
            this.behaviour.entry.name = val;
		}

		/**
		* Gets the text of the node
		* @returns {string} The text of the node
		*/
		get text(): string
		{
            return this.mText;
		}


		/**
        * This will cleanup the component
        */
		dispose()
		{
			if ( this.element.hasClass( "draggable" ) )
				this.element.draggable( "destroy" );

			PropertyGrid.getSingleton().off( PropertyGridEvents.PROPERTY_EDITED, this.onPropertyGridEdited, this );
			this.behaviour = null;

			//Call super
			super.dispose();
		}
	}
}