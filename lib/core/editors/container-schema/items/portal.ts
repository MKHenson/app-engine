namespace Animate {
	/**
	* A portal class for behaviours. There are 4 different types of portals -
	* INPUT, OUTPUT, PARAMETER and PRODUCT. Each portal acts as a gate for a behaviour.
	*/
    export class Portal extends EventDispatcher {
        // TODO: Canvas TSX changes
        public links: Link[];
        public custom: boolean;
        public type: HatcheryRuntime.PortalType;
        public property: Prop<any>;
        public behaviour: Behaviour;

        public top: number;
        public left: number;
        public size: number;

		/**
		* @param parent The parent component of the Portal
		* @param type The portal type. This can be either Portal.INPUT, Portal.OUTPUT, Portal.PARAMETER or Portal.PRODUCT
		* @param property The property associated with this portal
		*/
        constructor( parent: Behaviour, type: HatcheryRuntime.PortalType, property: Prop<any> ) {
            super();

            this.links = [];
            this.custom = false;
            this.type = type;
            this.behaviour = parent;
            this.edit( property );
            this.custom = false;
            this.size = 10;
        }

        calculatePosition( index: number ) {
            const size = this.size;
            const spacing = 10;

            if ( this.type === 'parameter' ) {
                this.left = ( ( size + spacing ) * index );
                this.top = -size;
            }
            else if ( this.type === 'product' ) {
                this.left = ( ( size + spacing ) * index );
                this.top = this.behaviour.height;
            }
            else if ( this.type === 'input' ) {
                this.top = ( ( size + spacing ) * index );
                this.left = -size;
            }
            else if ( this.type === 'output' ) {
                this.top = ( ( size + spacing ) * index );
                this.left = this.behaviour.width;
            }

            for (const link of this.links)
                link.calculateDimensions();
        }

        /**
         * Clones the canvas item
         */
        clone() : Portal {
            const clone = new Portal( this.behaviour, this.type, this.property.clone() );
            clone.custom = this.custom;
            return clone;
        }

        serialize(): Engine.Editor.IPortal {
            return {
                name: this.property.name,
                custom: this.custom,
                property: this.property.tokenize(),
                type: this.type,
                links: [],
                behaviour: this.behaviour.id,
                top: this.top,
                left: this.left,
                size: this.size
            };
        }

		/**
		* Edits the portal variables
		* @param property The new value of the property
		*/
        edit( property: Prop<any> ) {

            if ( this.type === 'parameter' && this.behaviour ) {
                this.behaviour.properties.removeVar( property.name );
                this.behaviour.properties.addVar( property );
            }

            this.property = property;

            // // Set the tooltip to be the same as the name
            // this.tooltip = property.toString();
        }

		/**
		 * This function will check if the source portal is an acceptable match with the current portal.
		 * @param source The source panel we are checking against
		 */
        checkPortalLink( source: Portal ) {
            if ( source.type === 'output' && this.type === 'input' )
                return true;
            else if ( source.type === 'product' && this.type === 'parameter' ) {
                if ( this.property.type === null || this.property.type === PropertyType.OBJECT )
                    return true;
                else if ( this.property.type === this.property.type )
                    return true;
                else if ( PluginManager.getSingleton().getConverters( source.property.type, this.property.type ) === null )
                    return false;
                else
                    return true;
            }
            else
                return false;
        }

		/**
		 * Clean up
		 */
        dispose() {

            for ( let link of this.links )
                link.dispose();

            this.links = null;
            this.behaviour = null;
            this.property = null;
            super.dispose();
        }

        // /**
        // * When the mouse is down on the portal.
        // * @param {object} e The jQuery event object
        // */
        // onPortalDown( e ) {
        // 	var newLink = new Link( this.parent.parent.element.data( "component" ) );
        // 	newLink.start( this, e );
        // }

		/**
		 * Adds a link to the portal.
		 * @param link The link we are adding
		 */
        // TODO: Canvas TSX changes
        addLink( link: any ) {// Link ) {

            if ( this.links.indexOf( link ) === -1 )
                this.links.push( link );
        }

		/**
		 * Removes a link from the portal.
		 * @param link The link we are removing
		 */
        // TODO: Canvas TSX changes
        removeLink( link: any ): any { // Link ) : Link {
            if ( this.links.indexOf( link ) === -1 )
                return link;

            this.links.splice( this.links.indexOf( link ), 1 );
            return link;
        }

        // /**
        //  * Makes sure the links are positioned correctly
        //  */
        // updateAllLinks() {
        // 	var links = this.links;
        //     var i = links.length;

        // 	// Get the extremes
        // 	while ( i-- )
        // 		links[i].updatePoints();
        // }

        // /**
        // * Returns this portal's position on the canvas.
        // */
        // positionOnCanvas() {
        // 	// Get the total parent scrolling
        // 	var p : JQuery = this.parent.element;
        // 	var p_: JQuery = p;
        // 	var startX = 0;
        // 	var startY = 0;
        // 	var sL = 0;
        // 	var sT = 0;
        // 	while ( p.length !== 0 ) {
        // 		sL = p.scrollLeft();
        // 		sT = p.scrollTop();

        // 		startX += sL;
        // 		startY += sT;

        // 		p = p.parent();
        // 	}

        // 	var position = this.element.position();
        // 	var pPosition = p_.position();

        // 	return {
        // 		left: startX + position.left + pPosition.left,
        // 		top: startY + position.top + pPosition.top
        // 	};
        // }
    }
}