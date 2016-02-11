module Animate
{
	/**
	* This form is used to create or edit Portals.
	*/
    export class PortalForm extends Window
	{
		private static _singleton: PortalForm;

		private _typeCombo: ComboBox;
		private _assetClassCombo: ComboBox;
		//private _assetType: LabelVal;		
		//private _name: LabelVal;
		//private _type: LabelVal;
		//private _warning: Label;
		private _portalType: PortalType;
		//private _item: Component;
        private _value: any;
        private _fromOk: boolean;
        private _newProperty: Prop<any>;

        private _formElm: JQuery;
        private _nameVerifier: (name : string) => boolean;
        private $name: string;
        private $class: string;
        private $errorMsg: string;


		constructor()
        {
            PortalForm._singleton = this;

			// Call super-class constructor
			super( 400, 250, true, true, "Portal Editor" );
            this.element.addClass("portal-form");
            this.element.css("height", "");

			this._typeCombo = new ComboBox();
            this._assetClassCombo = new ComboBox();
            this.$name = "";
            this.$class = "";
            this.$errorMsg = "";
            this._fromOk = false;
			
			//this._type = new LabelVal( this.okCancelContent, "Type", this._typeCombo );
			//this._assetType = new LabelVal( this.okCancelContent, "Class", this._assetClassCombo );
			//this._assetType.element.hide();

			this._portalType = null;
			//this._item = null;
            this._value = null;
            this._nameVerifier = null;

			//this._warning = new Label( "Please enter a behaviour name.", this.okCancelContent );

            this._typeCombo.on(ListEvents.ITEM_SELECTED, this.onTypeSelect.bind(this));
            this.onTypeSelect(ListEvents.ITEM_SELECTED, new ListEvent(ListEvents.ITEM_SELECTED, PropertyType.ASSET.toString()));

            // Fetch & compile the HTML
            this._formElm = jQuery("#portal-editor").remove().clone();
            this.content.element.append(this._formElm);
            Compiler.build(this._formElm, this, false); 

            jQuery("#portal-types", this._formElm).append(this._typeCombo.element);
            jQuery("#asset-classes", this._formElm).append(this._assetClassCombo.element);
        }

        /**
        * Generates all the available classes to select for asset property types
        */
        generateClasses()
        {
            // Clear cobos
            this._assetClassCombo.clearItems();
            this._typeCombo.clearItems();

            this._typeCombo.addItem("Select Property Type");
            this._assetClassCombo.addItem("Select Asset Class");
            this._assetClassCombo.addItem("All");

            // Get and sort all asset classes
            var classes: Array<AssetClass> = TreeViewScene.getSingleton().getAssetClasses();

            classes = classes.sort(function (a: AssetClass, b: AssetClass)
            {
                var textA = a.name.toUpperCase();
                var textB = b.name.toUpperCase();
                return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
            });

            // Add each class to the combo
            for (var i = 0; i < classes.length; i++)
                this._assetClassCombo.addItem(classes[i].name);

            // Add the different portal types
            for (var p in PropertyType)
                if (isNaN(parseFloat(p)))
                    this._typeCombo.addItem(p);
        }

		/** 
        * When the type combo is selected
        */
		onTypeSelect(responce: ListEvents, event: ListEvent )
        {
            if (event.item == Animate.PropertyType[Animate.PropertyType.ASSET] )
            {
    //            // Get and sort all asset classes
				//this._assetClassCombo.clearItems();
				//var classes : Array<AssetClass> = TreeViewScene.getSingleton().getAssetClasses();

				//classes = classes.sort( function ( a: AssetClass, b: AssetClass)
				//{
				//	var textA = a.name.toUpperCase();
				//	var textB = b.name.toUpperCase();
				//	return ( textA < textB ) ? -1 : ( textA > textB ) ? 1 : 0;
				//});

    //            // Add each class to the combo
				//for ( var i = 0; i < classes.length; i++ )
				//	this._assetClassCombo.addItem( classes[i].name );

                this._assetClassCombo.element.show();
                this._assetClassCombo.element.fadeIn( "fast" );
			}
			else
                this._assetClassCombo.element.hide();
		}

        /**
		* Creates a new property from the data chosen
		* @param {Prop<any>}
		*/
        getProperty(): Prop<any>
        {
            return new Prop(this.$name, this._value);   
        }

		/**
		* Shows the window by adding it to a parent.
		* @param {Component} item The item we are editing
		* @param {PortalType} type The items current portal type
		* @param {string} caption The caption of the form
		*/
		//showForm( item: Portal, type: PortalType, caption: string )
		//showForm( item: Behaviour, type: PortalType, caption: string )
		//showForm( item: Canvas, type: PortalType, caption: string )
        //showForm( item : any, type : PortalType, caption : string )
        editPortal(property: Prop<any>, type: PortalType, nameVerifier : (name: string) => boolean)
        {
            this.generateClasses();
			//var types :Array<string> = PluginManager.getSingleton().dataTypes;

			//if ( item instanceof Portal )
			//{
   //             type = (<Portal>item).type;
   //             caption = "Edit " + (<Portal>item).property.name;
			//}
            this.$errorMsg = "";
            this._portalType = type;
            //(<Label>this._name.val).text = (item instanceof Portal ? (<Portal>item).property.name : "");
            this.$name = (property ? property.name : "");
			//this._item = item;

            this._typeCombo.selectedIndex = 0;
            this._assetClassCombo.selectedIndex = 0;
            this._nameVerifier = nameVerifier;

			//this._warning.textfield.element.css( "color", "" );
			//this._warning.text = "";
			
			// Fill types
            //( <ComboBox>this._type.val ).clearItems();
            //for (var i = 0; i < types.length; i++)
            //    (<ComboBox>this._type.val).addItem(types[i]);

            //this._typeCombo.clearItems();
            //for (var i = 0; i < types.length; i++)
            //    this._typeCombo.addItem(types[i]);

			//(<Label>this._name.val).textfield.element.removeClass( "red-border" );
			//( <ComboBox>this._type.val).selectBox.element.removeClass( "red-border" );

			if ( type == PortalType.OUTPUT || type == PortalType.INPUT )
			{
				//this._type.element.hide();
                //this._assetType.element.hide();
                this._typeCombo.element.hide();
                this._assetClassCombo.element.hide();
				this._value = true;
			}
			else
			{
				//this._type.element.show();
                this._typeCombo.element.show();

                //if (item instanceof Portal)
                //    this._typeCombo.selectedItem = ((<Portal>item).property.type).toString();
                
                this.onTypeSelect(ListEvents.ITEM_SELECTED, new ListEvent(ListEvents.ITEM_SELECTED, this._typeCombo.selectedItem ) );
			}

			//if ( item instanceof Portal )
			//	this.headerText = caption;
			//else if ( item instanceof Behaviour )
			//	this.headerText = (<Behaviour>item).text;
			//else if ( item instanceof Canvas )
			//	this.headerText = caption;
			//else
			//	this.headerText = item.toString();

            super.show();

            this._fromOk = false;

            Compiler.digest(this._formElm, this);

            //(<Label>this._name.val).textfield.element.focus();
            jQuery("#portal-name", this._formElm).focus();

            var that = this;
            return new Promise<{ prop: Prop<any>, cancel: boolean }>(function (resolve, reject)
            {
                var onEvent = function (type, event: RenameFormEvent)
                {
                    if (type == "property-created")
                        resolve({ prop: that._newProperty, cancel: false });
                    else
                        resolve({ prop: null, cancel: true });

                    that.off("property-created", onEvent);
                    that.off("cancelled", onEvent);
                }

                that.on("property-created", onEvent);
                that.on("cancelled", onEvent);
            });
        }

        /**
        * Hides the window from view
        */
        hide()
        {
            if (!this._fromOk)
                this.emit(new Event("cancelled"));

            this._fromOk = false;
            return super.hide();
        }

		/**
        * Called when we click one of the buttons. This will dispatch the event OkCancelForm.CONFIRM
		* and pass the text either for the ok or cancel buttons. 
        */
        ok()
		{
			//if ( jQuery( e.target ).text() == "Ok" )
			//{
				//Check if the values are valid
				//(<Label>this._name.val).textfield.element.removeClass( "red-border" );
				//( <ComboBox>this._type.val).selectBox.element.removeClass( "red-border" );

            var newName = this.$name;// jQuery.trim( (<Label>this._name.val).text);
            this.$errorMsg = "";

            if (newName.trim() == "")
            {
                this.$errorMsg = "Name cannot be empty";
                return Compiler.digest(this._formElm, this);
            }

            if (this._typeCombo.selectedIndex == 0 && (this._portalType == PortalType.PARAMETER || this._portalType == PortalType.PRODUCT) )
            {
                this.$errorMsg = "Please select a valid property type";
                return Compiler.digest(this._formElm, this);
            }

            if (this._typeCombo.selectedItem == PropertyType[PropertyType.ASSET] && this._assetClassCombo.selectedIndex == 0)
            {
                this.$errorMsg = "Please select a valid asset sub-class";
                return Compiler.digest(this._formElm, this);
            }

				////Check if the portal name already exists in the item if its a behaviour
				//if ( this._item instanceof Behaviour || this._item instanceof Portal )
				//{
				//	var behaviour: Behaviour = <Behaviour>this._item;
				//	if ( this._item instanceof Portal )
				//		behaviour = (<Portal>this._item).behaviour;


				//	for ( var i = 0; i < behaviour.portals.length; i++ )
    //                {
    //                    if (behaviour.portals[i].property.name == newName && (this._item instanceof Portal && (<Portal>this._item).property.name != behaviour.portals[i].property.name))
				//		{
				//			( <Label>this._name.val).textfield.element.addClass( "red-border" );
				//			this._warning.textfield.element.css( "color", "#FF0000" );
				//			this._warning.text = "A portal with the name " + ( <Label>this._name.val).text + " is already being used on this behaviour. Portal names must be unique.";
				//			return;
				//		}
				//	}
				//}
				////Check for the portals on the canvas
				//else if ( this._item instanceof Canvas )
				//{
				//	for ( var i = 0; i < this._item.children.length; i++ )
				//	{
				//		if ( this._item.children[i] instanceof BehaviourPortal )
				//		{
				//			var portal: BehaviourPortal = <BehaviourPortal>this._item.children[i];
				//			if ( portal.text == newName )
				//			{
				//				( <Label>this._name.val).textfield.element.addClass( "red-border" );
				//				this._warning.textfield.element.css( "color", "#FF0000" );
				//				this._warning.text = "A portal with the name " + (<Label>this._name.val).text + " is already being used on the canvas. Portal names must be unique.";
				//				return;
				//			}
				//		}
				//	}
				//}

    //            //Check for special chars
    //            var message = Utils.checkForSpecialChars(newName);
				//if ( message != null )
				//{
				//	( <Label>this._name.val).textfield.element.addClass( "red-border" );
				//	this._warning.textfield.element.css( "color", "#FF0000" );
				//	this._warning.text = message;
				//	return;
				//}

				////Check combo
    //            if ((this._portalType != PortalType.OUTPUT && this._portalType != PortalType.INPUT) && jQuery.trim(_typeCombo.selectedItem ) == "" )
				//{
				//	( <ComboBox>this._type.val ).element.addClass( "red-border" );
				//	return;
				//}
            //}

            if (this._portalType == PortalType.INPUT || this._portalType == PortalType.OUTPUT)
                this._newProperty = new PropBool(this.$name, false);
            else
                this._newProperty = Utils.createProperty(this.$name, PropertyType[this._typeCombo.selectedItem]);

            if (this._newProperty instanceof PropAsset && this._newProperty.type == PropertyType.ASSET)
            {
                if (this._assetClassCombo.selectedIndex < 2)
                    (<PropAsset>this._newProperty).classNames = [];
                else
                    (<PropAsset>this._newProperty).classNames = [this._assetClassCombo.selectedItem];
            }

            if (!this._nameVerifier(this.$name))
            {
                this.$errorMsg = `The name ${this.$name} is already in use, please choose another`;
                return Compiler.digest(this._formElm, this);
            }

            this.emit(new Event("property-created"));

            this._fromOk = true;
            this.hide();
            return;

			////Set the default value based on the type
   //         var type = jQuery.trim(_typeCombo.selectedItem );
			//if ( type == "" )
			//	this._value = "";
			//else if ( type == "number" )
			//	this._value = 0;
			//else if ( type == "boolean" )
			//	this._value = true;
			//else if ( type == "asset" )
			//	this._value = ":" + jQuery.trim( ( <ComboBox>this._assetType.val).selectedItem );
			//else if ( type == "object" )
			//	this._value = "";
			//else if ( type == "color" )
			//	this._value = "ffffff:1";
			//else if ( type == "object" )
			//	this._value = "";

			//super.OnButtonClick( e )
		}


        //get name(): string { return (<InputBox>this._name.val).text; }
        get name(): string { return this.$name; }
		get portalType(): PortalType { return this._portalType; }
        //get value(): any { return this._value; }
        get value(): any { return this._newProperty.getVal(); }
        get parameterType(): PropertyType
        {
            if (this._portalType != PortalType.INPUT && this._portalType != PortalType.OUTPUT)
                //    return <PropertyType>parseInt(this._typeCombo.selectedItem);
                this._newProperty.type;
			else
                return PropertyType.BOOL;
		}
        
		/** 
        * Gets the singleton instance. 
        * @returns {PortalForm}
        */
		static getSingleton(): PortalForm
		{
			if ( !PortalForm._singleton )
				new PortalForm();

			return PortalForm._singleton;
		}
	}
}