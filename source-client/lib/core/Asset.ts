module Animate
{
	export class Asset extends EventDispatcher
	{
		private static shallowIds: number = 0;

		public id: string;
		public shallowId: number;
		public name: string;
		private _className: string;
		public saved: boolean;

		private _properties: EditableSet;
		private _options: { [s: string]: any; };

		/**
		* @param {string} name The name of the asset
		* @param {string} className The name of the "class" or "template" that this asset belongs to
		* @param {any} json The JSON with all the asset properties
		* @param {string} id The id of this asset
		*/
		constructor( name: string = "", className: string = "", json: any = {}, id: string = "", shallowId: number = 0 )
		{
			// Call super-class constructor
			super();
			
			// Make sure the ID is always really high - i.e. dont allow for duplicates
			if ( shallowId !== 0 && shallowId > Asset.shallowIds )
				Asset.shallowIds = shallowId + 1;

			this._options = {};
			this.id = id;
			this.shallowId = shallowId;
			this.name = name;
			this.saved = true;
			this._properties = new EditableSet();

			if ( json )
				this.properties = json;

			this._className = className;
		}

		static getNewLocalId(): number
		{
			Asset.shallowIds++;
			return Asset.shallowIds;
		}

		/** Writes this assset to a readable string */
		toString()
		{
			return this.name + "(" + this.shallowId + ")";
		}

		/**
		* Use this function to reset the asset properties
		* @param {string} name The name of the asset
		* @param {string} className The "class" or "template" name of the asset
		* @param {any} json The JSON data of the asset.
		*/
		update( name: string, className : string, json: any = {} )
		{
			this.name = name;
			this.saved = true;
			this.properties = json;
			this._className = className;
		}
		
		/**
		* Disposes and cleans up the data of this asset
		*/
		dispose()
		{
			//Call super
			super.dispose();

			this.id = null;
			this.name = null;
			this._properties = null;
			this._className = null;
			this._options = null;
		}

		/** Creates an option which is associated with this asset. The name of the option must be unique. Use this to add your own custom data */
		createOption( name: string, val: any ) { this._options[name] = val; }

		/** Destroys an option */
		removeOption( name: string ) { delete this._options[name];  }

		/**  Update the value of an option */
		updateOption( name: string, val: any ) { this._options[name] = val; }

		/** Returns the value of an option */
		getOption( name: string ) : any { return this._options[name]; }

		get className(): string { return this._className; }
		get properties(): EditableSet { return this._properties; }
		set properties( val: EditableSet )
		{
			for ( var vi = 0, l = this._properties.variables.length; vi < l; vi++ )
				this._properties.variables[vi].dispose();

			this._properties.variables.splice(0, this._properties.variables.length);

			if ( val instanceof EditableSet )
				this._properties = val;
			else
			{
				for ( var i in val )
					this._properties.addVar( val[i].name, val[i].value, ParameterType.fromString( val[i].type ), val[i].category, val[i].options );
			}
		}
	}
}