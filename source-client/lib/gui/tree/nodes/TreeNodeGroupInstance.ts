module Animate
{
	/** 
	* This node represents a group instance. Goups are collections of objects - think of them as arrays.
	*/
	export class TreeNodeGroupInstance extends TreeNode
	{
		private _instanceID: any;
		public canDelete: boolean;

		constructor( instanceID: any , name : string )
		{
			// Call super-class constructor
			super( name, "media/instance_ref.png", false );

			this._instanceID = instanceID;
			this.canDelete = true;
		}

		/**
        * This will cleanup the component
        */
		dispose()
		{
			var parentGroupNode: TreeNodeGroup = <TreeNodeGroup>this.parent;
			if ( parentGroupNode )
				parentGroupNode.removeInstance( this.instanceID );

			this._instanceID = null;

			//Call super
			super.dispose();
		}

		get instanceID(): any { return this._instanceID; }
	}
}