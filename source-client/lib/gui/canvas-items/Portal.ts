module Animate
{
    export enum PortalType
    {
        PARAMETER,
        PRODUCT,
        INPUT,
        OUTPUT
    }

	//export class PortalType extends ENUM
	//{
	//	constructor(v: string) { super(v); }
	//	static PARAMETER: PortalType = new PortalType("parameter");
	//	static PRODUCT: PortalType = new PortalType("product");
	//	static INPUT: PortalType = new PortalType("input");
	//	static OUTPUT: PortalType = new PortalType("output");

	//	/**
	//	* Returns an enum reference by its name/value
	//	* @param {string} val
	//	* @returns {PortalType}
	//	*/
	//	static fromString(val: string): PortalType
	//	{
	//		switch (val)
	//		{
	//			case "parameter":
	//				return PortalType.PARAMETER;
	//			case "product":
	//				return PortalType.PRODUCT;
	//			case "input":
	//				return PortalType.INPUT;
	//			case "output":
	//				return PortalType.OUTPUT;
	//		}

	//		return null;
	//	}
	//}

	/**
	* A portal class for behaviours. There are 4 different types of portals - 
	* INPUT, OUTPUT, PARAMETER and PRODUCT. Each portal acts as a gate for a behaviour.
	*/
	export class Portal extends Component
	{
		private _links: Array<Link>;		
		private _customPortal: boolean;
        private _type: PortalType;
        private _property: Prop<any>;
		public behaviour: Behaviour;
		
		/**
		* @param {Behaviour} parent The parent component of the Portal
		* @param {PortalType} type The portal type. This can be either Portal.INPUT, Portal.OUTPUT, Portal.PARAMETER or Portal.PRODUCT
		* @param {Prop<any>} property The property associated with this portal
		*/
        constructor(parent: Behaviour, type: PortalType, property: Prop<any> )
		{
			// Call super-class constructor
            super(`<div class='portal ${type}'></div>`, parent );

            this._links = [];
            this._customPortal = true;
            this.behaviour = parent;
            this.edit(property);

            // Add events
			this.element.data( "dragEnabled", false );
			if ( type == PortalType.PRODUCT || type == PortalType.OUTPUT )
				this.element.on( "mousedown", jQuery.proxy( this.onPortalDown, this ) );
		}

		/**
		* Edits the portal variables
		* @param {Prop<any>} property The new value of the property
		*/
        edit(property: Prop<any>)
		{
            this._property = property;
            
			var typeName : string = "Parameter";
			if ( this._type == PortalType.INPUT )
				typeName = "Input";
            else if (this._type == PortalType.OUTPUT )
				typeName = "Output";
            else if (this._type == PortalType.PRODUCT )
				typeName = "Product";

			// Set the tooltip to be the same as the name
            this.tooltip = property.name + " : " + typeName + " - <b>" + property.toString() + "</b>";
		}

		/**
		* This function will check if the source portal is an acceptable match with the current portal.
		* @param source The source panel we are checking against
		*/
		checkPortalLink( source: Portal )
		{
			if ( source.type == PortalType.OUTPUT && this.type == PortalType.INPUT )
				return true;
			else if ( source.type == PortalType.PRODUCT && this.type == PortalType.PARAMETER )
            {
                if (this._property.type == null || this._property.type == PropertyType.OBJECT)
					return true;
                else if (this._property.type == this._property.type )
					return true;
                else if (PluginManager.getSingleton().getConverters(source._property.type, this._property.type ) == null )
					return false;
				else
					return true;
			}
			else
				return false;
		}

		/**
		* This function will check if the source portal is an acceptable match with the current portal.
		*/
		dispose()
		{
			var len = this._links.length;
			while ( len > 0 )
			{
				this._links[0].dispose();
				len = this._links.length;
			}

			this.element.data( "dragEnabled", null );
			this._links = null;
			this.behaviour = null;
			this._type = null;
            this._property = null;

			// Call super
			super.dispose();
		}

		/**
		* When the mouse is down on the portal.
		* @param {object} e The jQuery event object
		*/
		onPortalDown( e )
		{
			var newLink = new Link( this.parent.parent.element.data( "component" ) );
			newLink.start( this, e );
		}

		/**
		* Adds a link to the portal.
		* @param {Link} link The link we are adding
		*/
		addLink( link: Link )
		{
			if ( jQuery.inArray( link, this._links ) == -1 )
				this._links.push( link );

            if (this._links.length > 0)
                this.element.addClass("active");
            else
                this.element.removeClass("active");
			
		}

		/**
		* Removes a link from the portal.
		* @param {Link} link The link we are removing
		*/
		removeLink( link : Link ) : Link
		{
			if ( this._links.indexOf( link ) == -1 )
				return link;

			this._links.splice( this._links.indexOf( link ), 1 );

			if ( this._links.length == 0 )
                this.element.removeClass("active");

			return link;
		}

		/**
		* Makes sure the links are positioned correctly
		*/
		updateAllLinks()
		{
			var links = this._links;
            var i = links.length;

			// Get the extremes
			while ( i-- )
				links[i].updatePoints();
		}

		/**
		* Returns this portal's position on the canvas. 
		*/
		positionOnCanvas()
		{
			// Get the total parent scrolling
			var p : JQuery = this.parent.element;
			var p_: JQuery = p;
			var startX = 0;
			var startY = 0;
			var sL = 0;
			var sT = 0;
			while ( p.length != 0 )
			{
				sL = p.scrollLeft();
				sT = p.scrollTop();

				startX += sL;
				startY += sT;

				p = p.parent();
			}

			var position = this.element.position();
			var pPosition = p_.position();

			return {
				left: startX + position.left + pPosition.left,
				top: startY + position.top + pPosition.top
			};
		}

		
        get type(): PortalType { return this._type; }
        get property(): Prop<any> { return this._property; }
		get customPortal(): boolean { return this._customPortal; }
		get links(): Array<Link> { return this._links; }
	}
}