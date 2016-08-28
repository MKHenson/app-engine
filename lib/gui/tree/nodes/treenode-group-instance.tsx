module Animate {

	/**
	 * This node represents a group instance
	 */
	export class TreeNodeGroupInstance extends TreeNodeModel {
        private _instanceID: number;
        private _group: GroupArray;

		/**
		 * Creates an instance of the node
		 */
        constructor(instanceID: number, name: string, group: GroupArray) {
            super( name,  <i className="fa fa-square resource" aria-hidden="true"></i> );
            this._group = group;
			this._instanceID = instanceID;
		}

		/**
         * Show a context menu of resource options
         */
        onContext(e: React.MouseEvent) {
            e.preventDefault();
            ReactContextMenu.show({ x: e.pageX, y : e.pageY, items : [
                {
					label: 'Delete',
					prefix: <i className="fa fa-times" aria-hidden="true"></i>,
					onSelect: (e) => {
						this.parent.removeNode(this);
					}
				}
            ]});
        }

		/**
         * This will cleanup the component
         */
		dispose() {
			this._group.removeReference(this._instanceID);
            this._instanceID = null;
            this._group = null;
			super.dispose();
		}

        get shallowId(): number { return this._instanceID; }
	}
}