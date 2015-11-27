module Animate
{
    export class Asset extends ProjectResource<Engine.IAsset>
	{
		

		//public id: string;
		//public shallowId: number;
		//public name: string;
		//private _className: string;
		
		/**
		* @param {string} name The name of the asset
		* @param {string} className The name of the "class" or "template" that this asset belongs to
		* @param {any} json The JSON with all the asset properties
		* @param {string} id The id of this asset
		*/
        constructor(entry?: Engine.IAsset)
		{
			// Call super-class constructor
			super(entry);
			
			//this._options = {};
			//this.id = id;
			//this.shallowId = shallowId;
			//this.name = name;
			//this.saved = true;
			//this._properties = new EditableSet();

            if ( entry.json )
                this.setProperties(<Array<EditableSetToken>>entry.json);

            //this._className = entry.className;
		}

		//static getNewLocalId(): number
		//{
		//	Asset.shallowIds++;
		//	return Asset.shallowIds;
		//}

		/** Writes this assset to a readable string */
		toString()
        {
            return this.entry.name + "(" + this.entry.shallowId + ")";
		}

		/**
		* Use this function to reset the asset properties
		* @param {string} name The name of the asset
		* @param {string} className The "class" or "template" name of the asset
		* @param {any} json The JSON data of the asset.
		*/
		update( name: string, className : string, json: any = {} )
		{
            this.entry.name = name;
			this.saved = true;
            this.properties = json;
            this.entry.className = className;
		}
		
		/**
		* Disposes and cleans up the data of this asset
		*/
		dispose()
		{
			//Call super
			super.dispose();

			//this.id = null;
			//this.name = null;
			//this._properties = null;
			//this._className = null;
			//this._options = null;
		}
        
		//get className(): string { return this._className; }
		
	}
}