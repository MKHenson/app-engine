namespace Animate {

	/**
	 * This node represents a group instance
	 */
    export class TreeNodeGroupInstance extends TreeNodeModel {
        private _resource: ProjectResource<HatcheryServer.IResource>;
        private _group: Resources.GroupArray;

		/**
		 * Creates an instance of the node
		 */
        constructor( resource: ProjectResource<HatcheryServer.IResource>, group: Resources.GroupArray ) {
            super( name, <i className="fa fa-square resource" aria-hidden="true"></i> );
            this._resource = resource;
            this._group = group;
        }

		/**
         * Show a context menu of resource options
         */
        onContext( e: React.MouseEvent ) {
            e.preventDefault();
            ReactContextMenu.show( {
                x: e.pageX, y: e.pageY, items: [
                    {
                        label: 'Delete',
                        prefix: <i className="fa fa-times" aria-hidden="true"></i>,
                        onSelect: () => {
                            this.parent!.removeNode( this );
                        }
                    }
                ]
            });
        }

		/**
         * Gets or sets the label of the node
         */
        label( val?: string ): string {
            if ( val === undefined ) {
                if ( !this._resource.saved )
                    return '* ' + this._resource.entry.name;
                else
                    return this._resource.entry.name!;
            }


            return super.label( val );
        }

		/**
         * This will cleanup the component
         */
        dispose() {
            this._group.removeReference( this._resource.entry.shallowId! );
            super.dispose();
        }

        get shallowId(): number { return this._resource.entry.shallowId!; }
    }
}