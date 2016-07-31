module Animate {
	/**
	* This node represents a group instance. Goups are collections of objects - think of them as arrays.
	*/
	export class TreeNodeGroupInstance extends TreeNode {
        private _instanceID: number;
        private _group: GroupArray;

        constructor(instanceID: number, name: string, group: GroupArray) {
			// Call super-class constructor
            super(name, "media/instance_ref.png", false);

            this._group = group;
			this._instanceID = instanceID;
			this.canDelete = true;
		}

		/**
        * This will cleanup the component
        */
		dispose() {
            this._group.removeReference(this._instanceID);
            this._instanceID = null;
            this._group = null;

			//Call super
			super.dispose();
		}

        get shallowId(): number { return this._instanceID; }
	}
}