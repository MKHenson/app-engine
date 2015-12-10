module Animate
{
    /**
    * A simple array resource for wrapping ids
    */
    export class GroupArray extends ProjectResource<Engine.IGroup>
    {
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
        }

        /**
		* Adds a new reference to the group
        * @param {number} shallowId
		*/
        addReference(shallowId: number)    
        {
            this.entry.items.push(shallowId);
            this.saved = false;
        }

        /**
		* Removes a reference from the group
        * @param {number} shallowId
		*/
        removeReference(shallowId: number)    
        {
            if (this.entry.items.indexOf(shallowId) != -1)
                this.entry.items.splice(this.entry.items.indexOf(shallowId), 1);

            this.saved = false;
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