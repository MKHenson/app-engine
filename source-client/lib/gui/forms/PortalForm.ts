module Animate
{
	/**
	* This form is used to create or edit Portals.
	*/
	export class PortalForm extends OkCancelForm
	{
		private static _singleton: PortalForm;

		private _typeCombo: ComboBox;
		private _assetClassCombo: ComboBox;
		private _assetType: LabelVal;		
		private _name: LabelVal;
		private _type: LabelVal;
		private _warning: Label;
		private _portalType: PortalType;
		private _item: Component;
		private _value: any;

		constructor()
		{
			if ( PortalForm._singleton != null )
				throw new Error( "The PortalForm class is a singleton. You need to call the PortalForm.getSingleton() function." );

			PortalForm._singleton = this;

			// Call super-class constructor
			super( 400, 250, true, true, "Window" );
			this.element.addClass( "portal-form" );

			this._typeCombo = new ComboBox();
			this._assetClassCombo = new ComboBox();
			this._name = new LabelVal( this.okCancelContent, "Name", new InputBox( null, "" ) );
			this._type = new LabelVal( this.okCancelContent, "Type", this._typeCombo );
			this._assetType = new LabelVal( this.okCancelContent, "Class", this._assetClassCombo );
			this._assetType.element.hide();

			this._portalType = null;
			this._item = null;
			this._value = null;

			this._warning = new Label( "Please enter a behaviour name.", this.okCancelContent );

			this._typeCombo.on( ListEvents.ITEM_SELECTED,  this.onTypeSelect.bind( this ) );
			this.onTypeSelect(ListEvents.ITEM_SELECTED, new ListEvent( ListEvents.ITEM_SELECTED, "asset" ) );
		}

		/** When the type combo is selected*/
		onTypeSelect(responce: ListEvents, event: ListEvent )
		{
			if ( event.item == "asset" )
			{
				this._assetClassCombo.clearItems();
				var classes : Array<AssetClass> = TreeViewScene.getSingleton().getAssetClasses();

				classes = classes.sort( function ( a: AssetClass, b: AssetClass)
				{
					var textA = a.name.toUpperCase();
					var textB = b.name.toUpperCase();
					return ( textA < textB ) ? -1 : ( textA > textB ) ? 1 : 0;
				});

				for ( var i = 0; i < classes.length; i++ )
					this._assetClassCombo.addItem( classes[i].name );

				this._assetType.element.show();
				this._assetType.element.fadeIn( "fast" );
			}
			else
			{
				this._assetType.element.hide();
			}
		}


		/**
		* Shows the window by adding it to a parent.
		* @param {Component} item The item we are editing
		* @param {PortalType} type The items current portal type
		* @param {string} caption The caption of the form
		*/
		showForm( item: Portal, type: PortalType, caption: string )
		showForm( item: Behaviour, type: PortalType, caption: string )
		showForm( item: Canvas, type: PortalType, caption: string )
		showForm( item : any, type : PortalType, caption : string )
		{
			var types :Array<string> = PluginManager.getSingleton().dataTypes;

			if ( item instanceof Portal )
			{
                type = (<Portal>item).type;
                caption = "Edit " + (<Portal>item).property.name;
			}

            this._portalType = type;
            (<Label>this._name.val).text = (item instanceof Portal ? (<Portal>item).property.name : "");
			this._item = item;

			this._warning.textfield.element.css( "color", "" );
			this._warning.text = "";
			
			//Fill types
			( <ComboBox>this._type.val ).clearItems();
			for ( var i = 0; i < types.length; i++ )
				( <ComboBox>this._type.val ).addItem( types[i] );

			(<Label>this._name.val).textfield.element.removeClass( "red-border" );
			( <ComboBox>this._type.val).selectBox.element.removeClass( "red-border" );

			if ( type == PortalType.OUTPUT || type == PortalType.INPUT )
			{
				this._type.element.hide();
				this._assetType.element.hide();
				this._value = true;
			}
			else
			{
				this._type.element.show();

                if (item instanceof Portal)
                    this._typeCombo.selectedItem = ((<Portal>item).property.type).toString();

				this.onTypeSelect(ListEvents.ITEM_SELECTED, new ListEvent( ListEvents.ITEM_SELECTED, ( <ComboBox>this._type.val).selectedItem ) );
			}

			if ( item instanceof Portal )
				this.headerText = caption;
			else if ( item instanceof Behaviour )
				this.headerText = (<Behaviour>item).text;
			else if ( item instanceof Canvas )
				this.headerText = caption;
			else
				this.headerText = item.toString();

			super.show();

			(<Label>this._name.val).textfield.element.focus();
		}

		/**Called when we click one of the buttons. This will dispatch the event OkCancelForm.CONFIRM
		and pass the text either for the ok or cancel buttons. */
		OnButtonClick( e )
		{
			if ( jQuery( e.target ).text() == "Ok" )
			{
				//Check if the values are valid
				(<Label>this._name.val).textfield.element.removeClass( "red-border" );
				( <ComboBox>this._type.val).selectBox.element.removeClass( "red-border" );

				var newName = jQuery.trim( (<Label>this._name.val).text );

				//Check if the portal name already exists in the item if its a behaviour
				if ( this._item instanceof Behaviour || this._item instanceof Portal )
				{
					var behaviour: Behaviour = <Behaviour>this._item;
					if ( this._item instanceof Portal )
						behaviour = (<Portal>this._item).behaviour;


					for ( var i = 0; i < behaviour.portals.length; i++ )
                    {
                        if (behaviour.portals[i].property.name == newName && (this._item instanceof Portal && (<Portal>this._item).property.name != behaviour.portals[i].property.name))
						{
							( <Label>this._name.val).textfield.element.addClass( "red-border" );
							this._warning.textfield.element.css( "color", "#FF0000" );
							this._warning.text = "A portal with the name " + ( <Label>this._name.val).text + " is already being used on this behaviour. Portal names must be unique.";
							return;
						}
					}
				}
				//Check for the portals on the canvas
				else if ( this._item instanceof Canvas )
				{
					for ( var i = 0; i < this._item.children.length; i++ )
					{
						if ( this._item.children[i] instanceof BehaviourPortal )
						{
							var portal: BehaviourPortal = <BehaviourPortal>this._item.children[i];
							if ( portal.text == newName )
							{
								( <Label>this._name.val).textfield.element.addClass( "red-border" );
								this._warning.textfield.element.css( "color", "#FF0000" );
								this._warning.text = "A portal with the name " + (<Label>this._name.val).text + " is already being used on the canvas. Portal names must be unique.";
								return;
							}
						}
					}
				}

				//Check for special chars
				var message = Utils.checkForSpecialChars( ( <Label>this._name.val).text );
				if ( message != null )
				{
					( <Label>this._name.val).textfield.element.addClass( "red-border" );
					this._warning.textfield.element.css( "color", "#FF0000" );
					this._warning.text = message;
					return;
				}

				//Check combo
				if ( ( this._portalType != PortalType.OUTPUT && this._portalType != PortalType.INPUT ) && jQuery.trim( (<ComboBox>this._type.val).selectedItem ) == "" )
				{
					( <ComboBox>this._type.val ).element.addClass( "red-border" );
					return;
				}
			}

			//Set the default value based on the type
			var type = jQuery.trim( ( <ComboBox>this._type.val ).selectedItem );
			if ( type == "" )
				this._value = "";
			else if ( type == "number" )
				this._value = 0;
			else if ( type == "boolean" )
				this._value = true;
			else if ( type == "asset" )
				this._value = ":" + jQuery.trim( ( <ComboBox>this._assetType.val).selectedItem );
			else if ( type == "object" )
				this._value = "";
			else if ( type == "color" )
				this._value = "ffffff:1";
			else if ( type == "object" )
				this._value = "";

			super.OnButtonClick( e )
		}


		get name(): string { return (<InputBox>this._name.val).text; }
		get portalType(): PortalType { return this._portalType; }
        get value(): any { return this._value; }
        get parameterType(): PropertyType
		{
			if ( this._typeCombo.selectedItem )
                return PropertyType.fromString( this._typeCombo.selectedItem );
			else
                return PropertyType.BOOL;
		}



		/** Gets the singleton instance. */
		static getSingleton(): PortalForm
		{
			if ( !PortalForm._singleton )
				new PortalForm();

			return PortalForm._singleton;
		}
	}
}