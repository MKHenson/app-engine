module Animate
{
    /**
    * A simple array resource for wrapping ids
    */
    export class GroupArray extends ProjectResource<Engine.IGroup>
    {
        public items: Array<number>;
		
		/**
		* @param {string} name The name of the asset
		* @param {string} className The name of the "class" or "template" that this asset belongs to
		* @param {any} json The JSON with all the asset properties
		* @param {string} id The id of this asset
		*/
        constructor(entry?: Engine.IGroup)
        {
            // Call super-class constructor
            super(entry);
            this.items = [];
            if (entry.items)
                this.items = entry.items;
        }        
		
		/**
		* Disposes and cleans up the data of this asset
		*/
        dispose()
        {
            //Call super
            super.dispose();
        }
    }
}