module Animate
{
	/**
	* Behaviours are the base class for all nodes placed on a <Canvas>
	*/
	export class Behaviour extends Button implements ICanvasItem
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
		
		constructor( parent : Component, text : string, html : string = "<div class='behaviour reg-gradient'></div>" )
		{
			// Call super-class constructor
			super( text, parent, html );

			var th = this.textfield.element.height();
			var tw = this.textfield.element.width();
			this.element.css( { width: ( tw + 20 ) + "px", height: ( th + 20 ) + "px", margin : "" });

			this._originalName = text;
			this._alias = text;
			this._canGhost = true;
			this._parameters = [];
			this._products = [];
			this._outputs = [];
			this._inputs = [];
			this._portals = [];

			this._requiresUpdated = true;
		}

		/**
		* Adds a portal to this behaviour.
		* @param {PortalType} type The type of portal we are adding. It can be either Portal.INPUT, Portal.OUTPUT, Portal.PARAMETER & Portal.PRODUCT
		* @param {string} name The unique name of the <Portal>
		* @param {any} value The default value of the <Portal>
		* @param {ParameterType} dataType The data type that the portal represents. See the default data types.
		* @returns {Portal} The portal that was added to this node
		*/
		addPortal(type: PortalType, name : string, value : any, dataType : ParameterType, update : boolean ) 
		{
			var portal = new Portal( this, name, type, value, dataType );

			this._requiresUpdated = true;

			//Add the arrays
			if ( type == PortalType.PARAMETER )
				this._parameters.push( portal );
			else if (type == PortalType.PRODUCT )
				this._products.push( portal );
			else if (type == PortalType.OUTPUT )
				this._outputs.push( portal );
			else
				this._inputs.push( portal );

			this._portals.push( portal );
			var portalSize = portal.element.width();
			portal.behaviour = this;

			//Update the dimensions
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

			//Remove from arrays
			var index = jQuery.inArray(toRemove, this._parameters )
			if ( index != -1 )
			{
				this._parameters.splice( index, 1 );
				toRemove.behaviour = null;
			}

			index = jQuery.inArray(toRemove, this._products )
			if ( index != -1 )
				this._products.splice( index, 1 );

			index = jQuery.inArray(toRemove, this._outputs )
			if ( index != -1 )
				this._outputs.splice( index, 1 );

			index = jQuery.inArray(toRemove, this._inputs )
			if ( index != -1 )
				this._inputs.splice( index, 1 );

			index = jQuery.inArray(toRemove, this._portals )
			if ( index != -1 )
				this._portals.splice( index, 1 );

			if ( dispose )
				toRemove.dispose();

			//Update the dimensions
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

			var h = this.element.height();
			var th = this.textfield.element.height();
			this._requiresUpdated = true;

			this.textfield.element.css( "top", h / 2 - th / 2 );

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

			//First get the size of a portal.
			var portalSize = (this._portals.length > 0 ? this._portals[0].element.width() : 10 );
			var portalSpacing = 5;

			this.element.css( { width: "1000px", height: "1000px" });
			this.textfield.element.css( { width: "auto", "float": "left" });

			var th: number = this.textfield.element.height();
			var tw: number = this.textfield.element.width();

			var topPortals = (this._products.length > this._parameters.length ? this._products.length : this._parameters.length );
			var btmPortals = (this._inputs.length > this._outputs.length ? this._inputs.length : this._outputs.length );
			var totalPortalSpacing = portalSize + 5;
			var padding = 10;

			tw = tw + padding > totalPortalSpacing * topPortals ? tw + padding : totalPortalSpacing * topPortals;
			th = th + padding > totalPortalSpacing * btmPortals ? th + padding : totalPortalSpacing * btmPortals;

			//Round off to the nearest 10 and minus border. This is so that they line up nicely to the graph
			tw = Math.ceil( ( tw + 1 ) / 10 ) * 10;
			th = Math.ceil( ( th + 1 ) / 10 ) * 10;
			this.css( { width: tw + "px", height: th + "px" });
			this.textfield.element.css( { width: "100%", height: "auto", "float": "none" });

			var width = this.element.width();
			var height = this.element.height();

			//Position the portals
			for (var i = 0; i < this._parameters.length; i++ )
				this._parameters[i].element.css( { left: ( ( portalSize + portalSpacing ) * i ) + "px", top: -portalSize - 1 + "px" });
			for (var i = 0; i < this._outputs.length; i++ )
				this._outputs[i].element.css( { top: ( ( portalSize + portalSpacing ) * i ) + "px", left: width + "px" });
			for (var i = 0; i < this._inputs.length; i++ )
				this._inputs[i].element.css( { top: ( ( portalSize + portalSpacing ) * i ) + "px", left: -portalSize + "px" });
			for (var i = 0; i < this._products.length; i++ )
				this._products[i].element.css( { left: ( ( portalSize + portalSpacing ) * i ) + "px", top: height + "px" });

		}

		/**
		* sets the label text
		*/
		set text( value : string ) 
		{
			//Call super
			//this._originalName = value;
			this.textfield.element.text(value);
			this._requiresUpdated = true;

			if ( value !== undefined )
				this.updateDimensions();

			
		}

		/** Gets the text of the behaviour */
		get text(): string { return this.textfield.element.text(); }

		/**
		* Diposes and cleans up this component and all its child components
		*/
		dispose()
		{
			//The draggable functionality is added in the Canvas addChild function because we need to listen for the events. 
			//To make sure its properly removed however we put it here.
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

			//Call super
			Button.prototype.dispose.call( this );
		}

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