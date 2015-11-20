module Animate
{
	/**
	* Each project has a list of behaviours. These are saved into the 
	* database and retrieved when we work with Animate. A behaviour is
	* essentially a piece of code that executes script logic.
	*/
	export class BehaviourContainer extends EventDispatcher
	{
		private static shallowIds: number = 0;

		private _id: string;
		public shallowId: number;
		private _name: string;
		public canvas: Canvas;

		public json: CanvasToken;
		public saved: boolean;
		public _properties: EditableSet;
		private _options: { [s: string]: any; };

		/**
		* {string} name The name of the container
		*/
		constructor( name: string, id: string, shallowId : number )
		{
			// Call super-class constructor
			super();

			// Make sure the ID is always really high - i.e. dont allow for duplicates
			if ( shallowId !== 0 && shallowId > BehaviourContainer.shallowIds )
				BehaviourContainer.shallowIds = shallowId + 1;

			this._id = id;
			this.shallowId = shallowId;
			this._options = {};
			this._name = name;
			this.json = null;
			this.canvas = null;
			this.saved = true;

			this._properties = new EditableSet();
			this._properties.addVar( "Start On Load", true, ParameterType.BOOL, "Container Properties", null );
			this._properties.addVar( "Unload On Exit", true, ParameterType.BOOL, "Container Properties", null );
		}

		static getNewLocalId(): number
		{
			BehaviourContainer.shallowIds++;
			return BehaviourContainer.shallowIds;
		}

		/**
		* This will download and update all data of the asset.
		* @param {string} name The name of the behaviour
		* @param {CanvasToken} json Its data object
		*/
		update( name: string, json: CanvasToken)
		{
			this._name = name;
			this.saved = true;
			this.json = json;
		}

		/**
		* This will cleanup the behaviour.
		*/
		dispose()
		{
			PluginManager.getSingleton().emit( new ContainerEvent( EditorEvents.CONTAINER_DELETED, this ) );

			//Call super
			super.dispose();

			this._properties = null;
			this._id = null;
			this._name = null;
			this.json = null;
			this.canvas = null;
			this.saved = null;
			this._options = null;
		}

		get id(): string { return this._id; }
		get name(): string { return this._name; }

		get properties(): EditableSet { return this._properties; }

		setProperties( val: Array<EditableSetToken> )
		setProperties( val: EditableSet )
		setProperties( val: any )
		{
			if (val instanceof EditableSet)
				this._properties = val;
			else
			{
				for ( var i = 0, l = this._properties.variables.length; i < l; i++ )
					this._properties.variables[i].dispose();

				this._properties.variables.splice( 0, this._properties.variables.length );

				var arr: Array<EditableSetToken> = val;
				for ( var i = 0, len = arr.length; i < len; i++ )
					this._properties.addVar( arr[i].name, arr[i].value, ParameterType.fromString( arr[i].type ), arr[i].category, arr[i].options );
			}

			this.json.properties = this._properties.tokenize();
		}

		/** Creates an option which is associated with this asset. The name of the option must be unique. Use this to add your own custom data */
		createOption(name: string, val: any) { this._options[name] = val; }

		/**  Update the value of an option */
		updateOption(name: string, val: any) { this._options[name] = val; }

		/** Returns the value of an option */
		getOption(name: string): any { return this._options[name]; }
	}
}