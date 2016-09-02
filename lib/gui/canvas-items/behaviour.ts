module Animate {

	/**
	 * Behaviours are the model data of BehaviourComponents and represent a behaviour/set of functionality
	 * that has been added to a container.
	 */
    export class Behaviour extends CanvasItem {
		public alias : string;
		public canGhost: boolean;
		public behaviourType: string;
		private _parameters: Array<Portal>;
		private _products: Array<Portal>;
		private _outputs: Array<Portal>;
		private _inputs: Array<Portal>;
        private _portals: Array<Portal>;
        private _properties: EditableSet;

		/**
		 * Creates an instance of the behaviour
		 */
        constructor(type: string = 'Behaviour') {
            super();

			this._parameters = [];
			this._products = [];
			this._outputs = [];
			this._inputs = [];
			this._portals = [];
			this.alias = type;
			this.behaviourType = type;
			this.canGhost = true;
            this._properties = new EditableSet(this);
		}

        /**
		 * Gets a portal by its name
		 * @param {string} name The portal name
		 * @returns {Portal}
		 */
        getPortal(name: string): Portal {
			let portals = this.portals
            for ( let portal of  portals )
                if (portal.property.name == name)
                    return portal;

            return null;
        }

		/**
		 * Adds a portal to this behaviour.
		 * @param {PortalType} type The type of portal we are adding. It can be either 'input', 'output', 'parameter' & 'product'
		 * @param {Prop<any>} property
		 * @returns {Portal}
		 */
        addPortal(type: PortalType, property: Prop<any> ): Portal {
            var portal = new Portal(this, type, property );

			// Add the arrays
            if (type == 'parameter')
                this._parameters.push(portal);
			else if (type == 'product' )
				this._products.push( portal );
			else if (type == 'output' )
				this._outputs.push( portal );
			else
				this._inputs.push( portal );

			this._portals.push( portal );
			portal.behaviour = this;
			this.invalidate();
			return portal;
		}

		/**
		* Removes a portal from this behaviour
		* @param {Portal} toRemove The portal object we are removing
		* @returns {Portal} The portal we have removed. This would be disposed if dispose was set to true.
		*/
		removePortal(toRemove: Portal): Portal {

            // Remove from arrays
            let index = this._parameters.indexOf(toRemove)
			if ( index != -1 ) {
                this._properties.removeVar(toRemove.property.name);
				this._parameters.splice( index, 1 );
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

			toRemove.dispose();
			this.invalidate();
			return toRemove;
		}

        /**
         * Serializes the data into a JSON.
		 * @param {number} id
         * @returns {IBehaviour}
         */
        serialize(id : number): IBehaviour {
            let toRet = <IBehaviour>super.serialize(id);
			let portals = this.portals;

            toRet.portals = <Array<IPortal>>[];

            for ( let portal of portals ) {
                toRet.portals.push(portal.serialize());
            }

			toRet.alias = this.alias;
			toRet.behaviourType = this.behaviourType;
            return toRet;
        }

        /**
         * De-Serializes data from a JSON.
         * @param {IBehaviour} data The data to import from
         */
        deSerialize(data: IBehaviour) {
            super.deSerialize( data );

			// Remove all existing portals
            while (this.portals.length > 0)
                this.portals.pop().dispose();

			this.alias = data.alias;
			this.behaviourType = data.behaviourType;

			for ( let portal of data.portals ) {
				let prop: Prop<any> = Utils.createProperty( portal.property.name, portal.property.type );
				prop.deTokenize( portal.property );

				let newPortal = this.addPortal( portal.type, prop);
				newPortal.custom = portal.custom;
			}
        }

		/**
		 * Diposes and cleans up this component and its portals
		 */
		dispose() {
			for (var i = 0; i < this._portals.length; i++ )
				this._portals[i].dispose();

			this._parameters = null;
			this._products = null;
			this._outputs = null;
			this._inputs = null;
			this._portals = null;

			// Call super
			super.dispose();
		}

        get properties(): EditableSet { return this._properties; }
		get parameters(): Array<Portal> { return this._parameters; }
		get products(): Array<Portal> { return this._products; }
		get outputs(): Array<Portal> { return this._outputs; }
		get inputs(): Array<Portal> { return this._inputs; }
		get portals(): Array<Portal> { return this._portals; }
	}
}