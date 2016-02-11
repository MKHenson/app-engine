module Animate
{
	/**
	* Behaviours are the base class for all nodes placed on a <Canvas>
	*/
    export class Behaviour extends CanvasItem implements IRenamable
	{
		private _originalName: string;
		private _alias: string;
		private _canGhost: boolean;
		private _requiresUpdated: boolean;
		private _parameters: Array<Portal>;
		private _products: Array<Portal>;
		private _outputs: Array<Portal>;
		private _inputs: Array<Portal>;
        private _portals: Array<Portal>;
        private _fontSize: number;
        private _properties: EditableSet;

        constructor(parent: Component, text: string, html: string = `<div class='behaviour reg-gradient'><div class='text'>${text}</div></div>` )
		{
            // Call super-class constructor
            super(html, parent);
            this._fontSize = 5;
            var tw = this._fontSize * text.length + 20;
            var th = this._fontSize + 20;
            
            this.element.css({ width: tw + "px", height: th + "px", margin: "" });

			this._originalName = text;
			this._alias = text;
			this._canGhost = true;
			this._parameters = [];
			this._products = [];
			this._outputs = [];
			this._inputs = [];
            this._portals = [];
            this._properties = new EditableSet(this);

			this._requiresUpdated = true;
		}

        /**
		* Gets a portal by its name
		* @param {string} name The portal name
		* @returns {Portal}
		*/
        getPortal(name: string): Portal
        {
            for (var i = 0, portals = this.portals, l = portals.length; i < l; i++)
                if (portals[i].property.name == name)
                    return portals[i];

            return null;
        }

		/**
		* Adds a portal to this behaviour.
		* @param {PortalType} type The type of portal we are adding. It can be either Portal.INPUT, Portal.OUTPUT, Portal.PARAMETER & Portal.PRODUCT
		* @param {Prop<any>} property 
		* @returns {Portal}
		*/
        addPortal(type: PortalType, property: Prop<any>, update: boolean, custom: boolean = false): Portal
		{
            var portal = new Portal(this, type, property, custom);

			this._requiresUpdated = true;

			// Add the arrays
            if (type == PortalType.PARAMETER)
                this._parameters.push(portal);
			else if (type == PortalType.PRODUCT )
				this._products.push( portal );
			else if (type == PortalType.OUTPUT )
				this._outputs.push( portal );
			else
				this._inputs.push( portal );

			this._portals.push( portal );
			var portalSize = portal.element.width();
			portal.behaviour = this;

			// Update the dimensions
			if ( update )
				this.updateDimensions();

			return portal;
		}

		/**
		* Removes a portal from this behaviour
		* @param {Portal} toRemove The portal object we are removing
		* @param {any} dispose Should the portal be disposed. The default is true.
		* @returns {Portal} The portal we have removed. This would be disposed if dispose was set to true.
		*/
		removePortal(toRemove: Portal, dispose : boolean = true): Portal
		{
			this._requiresUpdated = true;

			this.removeChild( toRemove );

            // Remove from arrays
            var index = this._parameters.indexOf(toRemove)
			if ( index != -1 )
            {
                this._properties.removeVar(toRemove.property.name);
				this._parameters.splice( index, 1 );
				toRemove.behaviour = null;
			}

            index = this._products.indexOf(toRemove);
			if ( index != -1 )
				this._products.splice( index, 1 );

            index = this._outputs.indexOf(toRemove);
			if ( index != -1 )
				this._outputs.splice( index, 1 );

            index = this._inputs.indexOf(toRemove); 
			if ( index != -1 )
				this._inputs.splice( index, 1 );

            index = this._portals.indexOf(toRemove); 
			if ( index != -1 )
				this._portals.splice( index, 1 );

			if ( dispose )
				toRemove.dispose();

			// Update the dimensions
			this.updateDimensions();
			return toRemove;
		}

		/**
		* Called when the behaviour is renamed
		* @param {string} name The new name of the behaviour
		*/
		onRenamed( name : string ) { }
		
		/**
		* A shortcut for jQuery's css property. 
		*/
		css( propertyName : any, value? : any ) : any
		{
			//Call super
			var toRet = this.element.css( propertyName, value );
			this._requiresUpdated = true;            
            var tw = this._fontSize * this.text.length + 20;
            var th = this._fontSize + 20;

            var portalSpacing = 5;
            var portalSize = (this._portals.length > 0 ? this._portals[0].element.outerWidth() : 10);
            var maxHorPortals = (this._products.length > this._parameters.length ? this._products.length : this._parameters.length);
            var maxVertPortals = (this._inputs.length > this._outputs.length ? this._inputs.length : this._outputs.length);
            var totalPortalSpacing = portalSize + portalSpacing;
            var maxHorSize = totalPortalSpacing * maxHorPortals;
            var maxVertSize = totalPortalSpacing * maxVertPortals;
            var padding = 10;

            // If the portals increase the size - the update the dimensions
            tw = tw + padding > maxHorSize ? tw + padding : maxHorSize;
            th = th + padding > maxVertSize ? th + padding : maxVertSize;
            

            // Keep the sizes big enough so they fit nicely in the grid (i.e. round off to 10)
            tw = Math.ceil((tw) / 10) * 10;
            th = Math.ceil((th) / 10) * 10;

            this.element.css({ width: tw + "px", height: th + "px", margin: "" });
			return toRet;
		}

		/**
		* Updates the behavior width and height and organises the portals
		*/
		updateDimensions() 
		{
			if (this._requiresUpdated == false )
				return;

			this._requiresUpdated = false;
            
            // First get the size of a portal.
            var portalSize = (this._portals.length > 0 ? this._portals[0].element.outerWidth() : 10);
			var portalSpacing = 5;
            var tw = this._fontSize * this.text.length + 20;
            var th = this._fontSize + 20;
            
			var maxHorPortals = (this._products.length > this._parameters.length ? this._products.length : this._parameters.length );
			var maxVertPortals = (this._inputs.length > this._outputs.length ? this._inputs.length : this._outputs.length );
            var totalPortalSpacing = portalSize + portalSpacing;
            var maxHorSize = totalPortalSpacing * maxHorPortals;
            var maxVertSize = totalPortalSpacing * maxVertPortals;
			var padding = 10;

            // If the portals increase the size - the update the dimensions
            tw = tw + padding > maxHorSize ? tw + padding : maxHorSize;
            th = th + padding > maxVertSize ? th + padding : maxVertSize;

			// Round off to the nearest 10 and minus border. This is so that they line up nicely to the graph
			tw = Math.ceil( ( tw ) / 10 ) * 10;
			th = Math.ceil( ( th ) / 10 ) * 10;
            this.css({ width: tw + "px", height: th + "px" });

            var width = this.element.outerWidth();
            var height = this.element.outerHeight();

			// Position the portals
            for (var i = 0; i < this._parameters.length; i++)
                this._parameters[i].element.css({ left: ((portalSize + portalSpacing) * i ) + "px", top: -portalSize + "px"});
            for (var i = 0; i < this._outputs.length; i++)
                this._outputs[i].element.css({ top: ((portalSize + portalSpacing) * i ) + "px", left: width + "px" });
            for (var i = 0; i < this._inputs.length; i++)
                this._inputs[i].element.css({ top: ((portalSize + portalSpacing) * i ) + "px", left: -portalSize + "px" });
            for (var i = 0; i < this._products.length; i++)
                this._products[i].element.css({ left: ((portalSize + portalSpacing) * i ) + "px", top: height + "px" });
		}

		/**
		* sets the label text
		*/
		set text( value : string ) 
		{
            jQuery(".text", this.element).text(value);
			this._requiresUpdated = true;

			if ( value !== undefined )
				this.updateDimensions();	
        }
        
        /**
		* Get or Set if the component is selected. When set to true a css class of 'selected' is added to the {Component}
		*/
        get selected(): boolean
        {
            if (this.element.hasClass("selected"))
                return true;
            else
                return false;
        }

		/**
		* Get or Set if the component is selected. When set to true a css class of 'selected' is added to the {Component}
		*/
        set selected(val: boolean)
        {
            if (val)
                this.element.addClass("selected");
            else
                this.element.removeClass("selected");

            this.updateDimensions();
        }

        /**
        * Tokenizes the data into a JSON. 
        * @param {boolean} slim If true, only the core value is exported. If false, additional data is exported so that it can be re-created at a later stage
        * @returns {IBehaviour}
        */
        tokenize(slim: boolean = false): IBehaviour
        {
            var toRet = <IBehaviour>super.tokenize(slim);
            toRet.portals = <Array<IPortal>>[];

            for (var i = 0, portals = this.portals, l = portals.length; i < l; i++)
            {
                var portal = <IPortal>{ name: portals[i].property.name, property: portals[i].property.tokenize(slim), type: portals[i].type };
                if (!slim)
                    portal.custom = portals[i].customPortal;

                toRet.portals.push(portal);
            }

            if (!slim)
            {
                toRet.alias = this.alias;
                toRet.text = this.text;
            }

            return toRet;
        }

        /**
        * De-Tokenizes data from a JSON. 
        * @param {IBehaviour} data The data to import from
        */
        deTokenize(data: IBehaviour)
        {
            super.deTokenize(data);
            
            this.alias = data.alias;
            this.text = data.text;

            // Remove all existing portals
            while (this.portals.length > 0)
                this.portals.pop().dispose();
            
            for (var i = 0, portals = data.portals, l = portals.length; i < l; i++)
            {
                //var portal = new Portal(this, portals[i].type, Utils.createProperty(portals[i].property, null));
                //this.portals.push(portal);
                var prop: Prop<any> = Utils.createProperty(portals[i].property.name, portals[i].property.type);
                prop.deTokenize(portals[i].property);

                var portal = this.addPortal(portals[i].type, prop, false);
                portal.customPortal = portals[i].custom;
            }

            this.updateDimensions();
        }

		/** 
        * Gets the text of the behaviour 
        */
        get text(): string { return jQuery(".text", this.element).text(); }

		/**
		* Diposes and cleans up this component and all its child components
		*/
		dispose()
		{
			// The draggable functionality is added in the Canvas addChild function because we need to listen for the events. 
			// To make sure its properly removed however we put it here.
			this.element.draggable( "destroy" );

			for (var i = 0; i < this._parameters.length; i++ )
				this._parameters[i].dispose();
			for (var i = 0; i < this._products.length; i++ )
				this._products[i].dispose();
			for (var i = 0; i < this._outputs.length; i++ )
				this._outputs[i].dispose();
			for (var i = 0; i < this._inputs.length; i++ )
				this._inputs[i].dispose();

			this._parameters = null;
			this._products = null;
			this._outputs = null;
			this._inputs = null;
			this._portals = null;
			this._alias = null;

			// Call super
			super.dispose();
		}

        get name(): string { return this._alias; }
        get properties(): EditableSet { return this._properties; }
		get originalName(): string { return this._originalName; }
		get alias(): string { return this._alias; }
		set alias( val: string ) { this._alias = val; }
		get canGhost(): boolean { return this._canGhost; }
		set canGhost( val: boolean ) { this._canGhost = val; }
		get requiresUpdated(): boolean { return this._requiresUpdated; }
		get parameters(): Array<Portal> { return this._parameters; }
		get products(): Array<Portal> { return this._products; }
		get outputs(): Array<Portal> { return this._outputs; }
		get inputs(): Array<Portal> { return this._inputs; }
		get portals(): Array<Portal> { return this._portals; }
	}
}