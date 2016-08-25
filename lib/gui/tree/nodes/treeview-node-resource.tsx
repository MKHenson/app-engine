module Animate {

    export class TreeViewNodeResource<T extends ProjectResource<Engine.IResource>> extends TreeNodeModel {
        public resource: T;
        private _loading: boolean;

        constructor(resource : T) {
            super(resource.entry.name, <i className="fa fa-cube" aria-hidden="true"></i> );
            this.resource = resource;
            this._loading = false;

            // resource.on("modified", this.onModified, this);
            // resource.on("deleted", this.onDeleted, this);
            // resource.on("refreshed", this.onRefreshed, this);
        }

        /**
         * Gets or sets if this node is in a loading/busy state
         * @param {boolean} val
         * @returns {boolean}
         */
        loading( val? : boolean ) : boolean {
            if ( val === undefined )
                return this._loading;

            this._loading = val;

            if (val)
                this.disabled(true);
            else
                this.disabled(false);

            return this._loading;
        }

        /**
         * Gets or sets the icon of the node
         * @param {JSX.Element} val
         * @returns {JSX.Element}
         */
        icon(val?: JSX.Element): JSX.Element {

            if ( val === undefined ) {
                if (this.loading)
                    return <i className="fa fa-cog fa-spin fa-3x fa-fw"></i>;
                else
                    return super.icon();
            }
            return super.icon(val);
        }

        // /**
        // * Called whenever the resource is re-downloaded
        // */
        // protected onRefreshed(type: string, event: Event, sender: EventDispatcher) {
        //     this.label( this.resource.entry.name );
        // }

        // /**
        // * Called whenever the resource is modified
        // */
        // protected onDeleted(type: string, event: Event, sender: EventDispatcher) {
        //     if ( this._parent )
        //         this._parent.removeNode(this);
        // }

        // /**
		// * Called whenever the resource is modified
		// */
        // protected onModified(type: string, event: Event, sender: EventDispatcher) {
        //     this.modified = !this.resource.saved;
        // }
    }
}