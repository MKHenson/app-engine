module Animate
{
	/**
	* Each project has a list of containers. These are saved into the database and retrieved when we work with Animate. A container is
	* essentially a piece of code that executes behaviour nodes and plugin logic when activated. 
	*/
    export class Container extends ProjectResource<Engine.IContainer>
	{
		//private _id: string;
		//public shallowId: number;
		//private _name: string;
		public canvas: Canvas;

		//public json: CanvasToken;
		

		/**
		* {string} name The name of the container
		*/
        constructor(entry?: Engine.IContainer)
		{
			// Call super-class constructor
            super(entry);
            
			//this._id = id;
			//this.shallowId = shallowId;
			
			//this._name = name;
			//this.json = null;
            this.canvas = null;
            this._properties.addVar(new PropBool("Start On Load", true, "Container Properties"));
            this._properties.addVar(new PropBool("Unload On Exit", true, "Container Properties"));
        }

        /**
         * Use this function to initialize the resource. This called just after the resource is created and its entry set.
         */
        initialize()
        {
            try
            {
                this.entry.json = JSON.parse(<string>this.entry.json);
            }
            catch (err)
            {
                this.entry.json = {};
            }

            var containerToken: IContainerToken = this.entry.json;
            containerToken.items = containerToken.items || [];
            containerToken.properties = containerToken.properties || this._properties.tokenize(false);
        }

		///**
		//* This will download and update all data of the asset.
		//* @param {string} name The name of the behaviour
		//* @param {CanvasToken} json Its data object
		//*/
		//update( name: string, json: CanvasToken)
  //      {
  //          this.entry.name = name;
  //          this.entry.json = json;
		//	//this._name = name;
		//	this.saved = true;
		//	//this.json = json;
		//}

		/**
		* This will cleanup the behaviour.
		*/
		dispose()
        {
            this.emit(new ContainerEvent(EventTypes.CONTAINER_DELETED, this));

			//Call super
			super.dispose();

			//this._properties = null;
			//this._id = null;
			//this._name = null;
			//this.json = null;
			this.canvas = null;
			//this.saved = null;
			//this._options = null;
		}

		//get id(): string { return this._id; }
		//get name(): string { return this._name; }

		

		
	}
}