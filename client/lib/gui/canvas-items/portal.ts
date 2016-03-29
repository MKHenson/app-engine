module Animate
{
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
        constructor(parent: Behaviour, type: PortalType, property: Prop<any>, custom: boolean = false)
		{
            // Call super-class constructor
            super(`<div class='portal ${PortalType[type].toLowerCase()}'></div>`, parent);

            this._links = [];
            this._customPortal = false;
            this._type = type;
            this.behaviour = parent;
            this.edit(property);
            this._customPortal = custom;

            // Add events
			if ( type == PortalType.PRODUCT || type == PortalType.OUTPUT )
				this.element.on( "mousedown", jQuery.proxy( this.onPortalDown, this ) );
		}

		/**
		* Edits the portal variables
		* @param {Prop<any>} property The new value of the property
		*/
        edit(property: Prop<any>)
        {
            var svgSize = 10;
            var svgSizeHalf = svgSize * 0.5;
            var svgBlockS = svgSize * 0.65;
            var svgTriS = svgSize * 0.3;

            this.element.html("");

            // Create the SVG
            if (this._type == PortalType.PARAMETER)
                this.element.append(`<svg height="${svgSize}" width="${svgSize}"><polygon points="0,0 ${svgSizeHalf},${svgSize - svgBlockS} ${svgSize},0 ${svgSize},${svgSize} 0,${svgSize}" /></svg>`);
            else if (this._type == PortalType.OUTPUT)
                this.element.append(`<svg height="${svgSize}" width="${svgSize}"><polygon points="0,0 ${svgBlockS},0 ${svgSize},${svgSizeHalf} ${svgBlockS},${svgSize} 0,${svgSize}" /></svg>`);
            else if (this._type == PortalType.INPUT)
                this.element.append(`<svg height="${svgSize}" width="${svgSize}"><polygon points="0,0 ${svgSize},0 ${svgSize},${svgSize} 0,${svgSize} ${svgSize - svgBlockS},${svgSizeHalf}" /></svg>`);
            else if (this._type == PortalType.PRODUCT)
                this.element.append(`<svg height="${svgSize}" width="${svgSize}"><polygon points="0,0 ${svgSize},0 ${svgSize},${svgBlockS} ${svgSizeHalf},${svgSize} 0,${svgBlockS}" /></svg>`);

            if (this._type == PortalType.PARAMETER)
            {
                this.behaviour.properties.removeVar(property.name);
                this.behaviour.properties.addVar(property);
            }

            this._property = property;

            // Set the tooltip to be the same as the name
            this.tooltip = property.toString();
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
        set customPortal(val: boolean ){ this._customPortal = val; }
		get links(): Array<Link> { return this._links; }
	}
}