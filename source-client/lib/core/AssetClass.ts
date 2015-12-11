module Animate
{
	/**
	* Describes an asset variable
	*/
	export class VariableTemplate
	{
		public name: string;
		public value: any;
		public type: ParameterType;
		public category: string;
		public options: any;

		
		constructor( name: string, value: string, type: ParameterType, category: string, options: any )
		constructor( name: string, value: boolean, type: ParameterType, category: string, options: any )
		constructor( name: string, value: { min?: number; max?: number; interval?: number; selected?: number; }, type: ParameterType, category: string, options: any )
		constructor( name: string, value: { color?: string; opacity?: number }, type: ParameterType, category: string, options: any )
		constructor(name: string, value: { className?: string; selected?: string; }, type: ParameterType, category: string, options: any)
		constructor(name: string, value: { classNames?: Array<string>; selected?: string; }, type: ParameterType, category: string, options: any)
		constructor( name: string, value: { className?: string; selectedAssets?: Array<number>; }, type: ParameterType, category: string, options: any )
		constructor( name: string, value: { choices: Array<string>; selected: string; }, type: ParameterType, category: string, options: any )
		constructor( name: string, value: { extensions?: Array<string>; path?: string; id?: string; selectedExtension?: string; }, type: ParameterType, category: string, options: any )
		constructor( name: string, value: any, type: ParameterType, category: string, options: any )
		{
			this.name = name;
			this.category = category;
			this.type = type;
			this.value = value;
			this.options = options;
		}

		dispose()
		{
			this.name = null;
			this.category = null;
			this.type = null;
			this.value = null;
			this.options = null;
		}
	}

	/**
	* This class describes a template. These templates are used when creating assets.
	*/
	export class AssetClass
	{
		private _abstractClass : boolean;
		private _name: string;
		public parentClass: AssetClass;
		private _imgURL: string;
		private _variables: Array<VariableTemplate>;
		public classes: Array<AssetClass>;

		constructor( name: string, parent: AssetClass, imgURL : string, abstractClass : boolean = false )
		{
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
		buildVariables(): EditableSet
		{
			var toRet: EditableSet = new EditableSet();

            var topClass: AssetClass = this;
			while ( topClass != null )
			{
				//Add all the variables to the object we are returning
				for ( var i = 0; i < topClass._variables.length; i++ )
				{
					var variable = topClass._variables[i];

					// If the variable is added by a child class - then do not add it from the parent
					// this essentially makes sure child class variables hold top priority
					if ( !toRet.getVar( variable.name ) )
						toRet.addVar( variable.name, variable.value, ParameterType.fromString( variable.type.toString() ), variable.category, variable.options );
				}

				topClass = topClass.parentClass;
			}

			return toRet;
		}

		/** 
		* Finds a class by its name. Returns null if nothing is found
		*/
		findClass( name : string )
		{
			if ( this._name == name )
				return this;

			var classes: Array<AssetClass> = this.classes;
			for ( var i = 0, l = classes.length; i < l; i++ )
			{
				var aClass: AssetClass = classes[i].findClass( name );
				if ( aClass )
					return aClass;
			}

			return null;
		}
		
		/**
		* Adds a variable to the class.
		* @param {string} name The name of the variable
		* @param {any} value The variables default value
		* @param {string} type A string that defines what type of variable it can be.
		* @param {string} category An optional category tag for this variable. This is used for organisational purposes.
		* @param {any} options Any options associated with this variable
		* @returns {AssetClass} A reference to this AssetClass
		*/
		addVar( name: string, value: string, type: ParameterType, category?: string, options?: any ): AssetClass
		addVar( name: string, value: boolean, type: ParameterType, category?: string, options?: any ): AssetClass
		addVar( name: string, value: { color?: string; opacity?: number }, type: ParameterType, category?: string, options?: any ): AssetClass
		addVar( name: string, value: { min?: number; max?: number; interval?: number; selected?: number; }, type: ParameterType, category?: string, options?: any ): AssetClass
		addVar(name: string, value: { className?: string; selected?: string; }, type: ParameterType, category?: string, options?: any): AssetClass
		addVar(name: string, value: { classNames?: string; selected?: string; }, type: ParameterType, category?: string, options?: any): AssetClass
		addVar( name: string, value: { className?: string; selectedAssets?: Array<number>; }, type: ParameterType, category?: string, options?: any ): AssetClass
		addVar( name: string, value: { choices: Array < string>; selected: string; }, type: ParameterType, category?: string, options?: any ): AssetClass
		addVar( name: string, value: { extensions?: Array<string>; path?: string; id?: string; selectedExtension?: string; }, type: ParameterType, category?: string, options?: any ): AssetClass
		addVar ( name: string, value: any, type: ParameterType, category?: string, options? : any ): AssetClass
		{
			category = (category == null || category === undefined ? "" : category);

			this._variables.push( new VariableTemplate( name, value, type, category, options ) );
			return this;
		}

		/**
		* This will clear and dispose of all the nodes
		*/
		dispose()
		{
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
		* @returns {VariableTemplate}
		*/
		getVariablesByName(name:string): VariableTemplate
		{
			for ( var i = 0, l = this._variables.length; i < l; i++ )
				if ( this._variables[i].name == name )
					return this._variables[i];

			return null;
		}


		get imgURL(): string { return this._imgURL; }
		get variables(): Array<VariableTemplate> { return this._variables; }

		/**
		* Adds a class
		* @param {string} name The name of the class
		* @param {string} img The optional image of the class
		* @param {boolean} abstractClass A boolean to define if this class is abstract or not. I.e. does this class allow for creating assets or is it just the base for others.
		* @returns {AssetClass}
		*/
		addClass( name: string, img: string, abstractClass: boolean ): AssetClass
		{
			var toAdd = new AssetClass( name, this, img, abstractClass );
			this.classes.push( toAdd );
			return toAdd;
		}

		/** Gets the name of the class */
		get name(): string { return this._name; }

		/** Gets if this class is abstract or not */
		get abstractClass(): boolean { return this._abstractClass; }
	}
}