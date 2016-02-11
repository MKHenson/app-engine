module Animate
{
    /**
    * A simple array resource for referencing groups, or arrays, of other objects. Similar to arrays in Javascript.
    */
    export class GroupArray extends ProjectResource<Engine.IGroup>
    {
		/**
		* @param {IGroup} entry [Optional] The database entry of the resource
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