module Animate {
	/**
	* This class describes a template. These templates are used when creating assets.
	*/
	export class AssetClass {
		private _abstractClass : boolean;
		private _name: string;
		public parentClass: AssetClass;
        private _imgURL: string;
        private _variables: Array<Prop<any>>;
		public classes: Array<AssetClass>;

		constructor( name: string, parent: AssetClass, imgURL : string, abstractClass : boolean = false ) {
			this._abstractClass = abstractClass;
			this._name = name;
			this.parentClass = parent;
			this._imgURL = imgURL;
			this._variables = [];
			this.classes = [];
		}

		/**
		* Creates an object of all the variables for an instance of this class.
		* @returns {EditableSet} The variables we are editing
		*/
		buildVariables(): EditableSet {
			var toRet: EditableSet = new EditableSet(null);
            var topClass: AssetClass = this;
			while ( topClass != null ) {
				//Add all the variables to the object we are returning
				for ( var i = 0; i < topClass._variables.length; i++ )  {
					var variable = topClass._variables[i];

					// If the variable is added by a child class - then do not add it from the parent
					// this essentially makes sure child class variables hold top priority
                    if (!toRet.getVar(variable.name))
                        toRet.addVar(variable);
				}

				topClass = topClass.parentClass;
			}

			return toRet;
		}

		/**
		* Finds a class by its name. Returns null if nothing is found
		*/
        findClass(name: string): AssetClass {
			if ( this._name == name )
				return this;

			var classes: Array<AssetClass> = this.classes;
			for ( var i = 0, l = classes.length; i < l; i++ ) {
				var aClass: AssetClass = classes[i].findClass( name );
				if ( aClass )
					return aClass;
			}

			return null;
		}

		/**
		* Adds a variable to the class.
		* @param { Prop<any>} prop The property to add
		* @returns {AssetClass} A reference to this AssetClass
		*/
        addVar(prop: Prop<any> ): AssetClass  {
            this._variables.push(prop);
			return this;
		}

		/**
		* This will clear and dispose of all the nodes
		*/
		dispose() {
			for ( var i = 0, l = this._variables.length; i < l; i++ )
				this._variables[i].dispose();

			for ( var i = 0, l = this.classes.length; i < l; i++ )
				this.classes[i].dispose();

			this._abstractClass = null;
			this._name = null;
			this.parentClass = null;
			this._variables = null;
			this._imgURL = null;
			this.classes = null;
		}

		/**
		* Gets a variable based on its name
		* @param {string} name The name of the class
		* @returns {Prop<T>}
		*/
        getVariablesByName<T>(name: string): Prop<T> {
			for ( var i = 0, l = this._variables.length; i < l; i++ )
				if ( this._variables[i].name == name )
					return this._variables[i];

			return null;
		}

        /**
		* Gets the image URL of this template
		* @returns {string}
		*/
        get imgURL(): string { return this._imgURL; }

        /**
		* Gets the variables associated with this template
		* @returns {Array<Prop<any>>}
		*/
        get variables(): Array<Prop<any>> { return this._variables; }

		/**
		* Adds a class
		* @param {string} name The name of the class
		* @param {string} img The optional image of the class
		* @param {boolean} abstractClass A boolean to define if this class is abstract or not. I.e. does this class allow for creating assets or is it just the base for others.
		* @returns {AssetClass}
		*/
		addClass( name: string, img: string, abstractClass: boolean ): AssetClass {
			var toAdd = new AssetClass( name, this, img, abstractClass );
			this.classes.push( toAdd );
			return toAdd;
		}

		/**
        * Gets the name of the class
        * @returns {string}
        */
		get name(): string { return this._name; }

		/**
        * Gets if this class is abstract or not
        * @returns {boolean}
        */
		get abstractClass(): boolean { return this._abstractClass; }
	}
}