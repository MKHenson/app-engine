module Animate
{
	export class PortalType extends ENUM
	{
		constructor(v: string) { super(v); }
		static PARAMETER: PortalType = new PortalType("parameter");
		static PRODUCT: PortalType = new PortalType("product");
		static INPUT: PortalType = new PortalType("input");
		static OUTPUT: PortalType = new PortalType("output");

		/**
		* Returns an enum reference by its name/value
		* @param {string} val
		* @returns {PortalType}
		*/
		static fromString(val: string): PortalType
		{
			switch (val)
			{
				case "parameter":
					return PortalType.PARAMETER;
				case "product":
					return PortalType.PRODUCT;
				case "input":
					return PortalType.INPUT;
				case "output":
					return PortalType.OUTPUT;
			}

			return null;
		}
	}

	export class ParameterType extends ENUM
	{
		constructor(v: string) { super(v); }
		static ASSET: ParameterType = new ParameterType( "asset" );
		static ASSET_LIST: ParameterType = new ParameterType( "asset_list" );
		static NUMBER: ParameterType = new ParameterType("number");
		static GROUP: ParameterType = new ParameterType("group");
		static FILE: ParameterType = new ParameterType("file");
		static STRING: ParameterType = new ParameterType("string");
		static OBJECT: ParameterType = new ParameterType("object");
		static BOOL: ParameterType = new ParameterType("bool");
		static INT: ParameterType = new ParameterType("int");
		static COLOR: ParameterType = new ParameterType("color");
		static ENUM: ParameterType = new ParameterType("enum");
		static HIDDEN: ParameterType = new ParameterType( "hidden" );
		static HIDDEN_FILE: ParameterType = new ParameterType( "hidden_file" );
		static OPTIONS: ParameterType = new ParameterType("options");

		/**
		* Returns an enum reference by its name/value
		* @param {string} val
		* @returns {ParameterType}
		*/
		static fromString(val: string): ParameterType
		{
			switch (val)
			{
				case "asset":
					return ParameterType.ASSET;
				case "asset_list":
					return ParameterType.ASSET_LIST;
				case "number":
					return ParameterType.NUMBER;
				case "group":
					return ParameterType.GROUP;
				case "file":
					return ParameterType.FILE;
				case "string":
					return ParameterType.STRING;
				case "object":
					return ParameterType.OBJECT;
				case "bool":
					return ParameterType.BOOL;
				case "int":
					return ParameterType.INT;
				case "color":
					return ParameterType.COLOR;
				case "enum":
					return ParameterType.ENUM;
				case "hidden":
					return ParameterType.HIDDEN;
				case "hidden_file":
					return ParameterType.HIDDEN_FILE;
				case "options":
					return ParameterType.OPTIONS;
			}

			return null;
		}
	}

	/**
	* A portal class for behaviours. There are 4 different types of portals - 
	* INPUT, OUTPUT, PARAMETER and PRODUCT. Each portal acts as a gate for a behaviour.
	*/
	export class Portal extends Component
	{
		private _links: Array<Link>;		
		private _customPortal: boolean;
		private _name: string;		
		private _type: PortalType;
		private _dataType: ParameterType;

		public value: any;
		public behaviour: Behaviour;
		
		/**
		* @param {Behaviour} parent The parent component of the Portal
		* @param {string} name The name of the portal
		* @param {PortalType} type The portal type. This can be either Portal.INPUT, Portal.OUTPUT, Portal.PARAMETER or Portal.PRODUCT
		* @param {any} value The default value of the portal
		* @param {ParameterType} dataType The type of value this portal represents - eg: asset, string, number, file...etc
		*/
		constructor( parent: Behaviour, name: string, type: PortalType = PortalType.PARAMETER, value: any = null, dataType: ParameterType = ParameterType.OBJECT )
		{
			// Call super-class constructor
			super("<div class='portal " + type + "'></div>", parent );

			this.edit( name, type, value, dataType );

			this.element.data( "dragEnabled", false );
			this._links = [];
			this.behaviour = parent;
			this._customPortal = true;

			if ( type == PortalType.PRODUCT || type == PortalType.OUTPUT )
				this.element.on( "mousedown", jQuery.proxy( this.onPortalDown, this ) );
		}

		/**
		* Edits the portal variables
		* @param {string} name The name of the portal
		* @param {PortalType} type The portal type. This can be either Portal.INPUT, Portal.OUTPUT, Portal.PARAMETER or Portal.PRODUCT
		* @param {any} value The default value of the portal
		* @param {ParameterType} dataType The type of value this portal represents - eg: asset, string, number, file...etc
		* @extends <Portal>
		*/
		edit( name : string, type: PortalType, value: any, dataType: ParameterType )
		{
			this._name = name;
			this.value = value;
			this._type = type;
			this._dataType = dataType;

			var valText = "";
			if ( type == PortalType.INPUT || type == PortalType.OUTPUT )
				this._dataType = dataType = ParameterType.BOOL;
			else
				valText = ImportExport.getExportValue( dataType, value );

			var typeName : string = "Parameter";
			if ( type == PortalType.INPUT )
				typeName = "Input";
			else if ( type == PortalType.OUTPUT )
				typeName = "Output";
			else if ( type == PortalType.PRODUCT )
				typeName = "Product";

			//Set the tooltip to be the same as the name
			this.tooltip = name + " : " + typeName + " - <b>" + valText + "</b>";
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
				if ( this._dataType == null || this._dataType == ParameterType.OBJECT )
					return true;
				else if ( this._dataType == this._dataType )
					return true;
				else if ( PluginManager.getSingleton().getConverters( source._dataType, this._dataType ) == null )
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
			this.value = null;
			this.behaviour = null;
			this._type = null;
			this._dataType = null;
			this._name = null;

			//Call super
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
			//get the extremes
			while ( i-- )
				links[i].updatePoints();
		}




		/**
		* Returns this portal's position on the canvas. 
		*/
		positionOnCanvas()
		{
			//Get the total parent scrolling
			var p : JQuery = this.parent.element;
			var p_: JQuery = p;

			//var offset = p.offset();
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

		//get behaviour() { return this._behaviour; }
		get type(): PortalType { return this._type; }
		get name(): string { return this._name; }
		get dataType(): ParameterType { return this._dataType; }
		get customPortal(): boolean { return this._customPortal; }
		get links(): Array<Link> { return this._links; }
	}
}