module Animate {

    /**
     * A model for referencing a project resource
     */
    export class TreeViewNodeResource<T extends ProjectResource<Engine.IResource>> extends TreeNodeModel {
        public resource: T;
        private _loading: boolean;

        /**
         * Creates an instance of the node
         */
        constructor(resource : T) {
            super(resource.entry.name, <i className="fa fa-square resource" aria-hidden="true"></i> );
            this.resource = resource;
            this._loading = false;

            this.canDrag = true;
            this.canDrop = false;

            resource.on("modified", this.onModified, this);
            resource.on("edited", this.onEdited, this);
            resource.on("deleted", this.onDeleted, this);
            resource.on("refreshed", this.onRefreshed, this);
        }

        /**
         * Called whenever we start dragging. This is only called if canDrag is true.
         * Use it to set drag data, eg: e.dataTransfer.setData("text", 'some data');
         * @param {React.DragEvent} e
         * @returns {IDragDropToken} Return data to serialize
         */
        onDragStart(e: React.DragEvent) : IDragDropToken {
            return { type : 'resource', id: this.resource.entry.shallowId } as IDragDropToken;
        }

        /**
         * Show a context menu of resource options
         */
        onContext(e: React.MouseEvent) {

            // Check if we need to add the save button
            let resourcesSaved = this.resource.saved;
            let showRename = this.store.getSelectedNodes().length > 1 ? false : true;

            // Check other nodes need saving
            let otherNodes = this.store.getSelectedNodes();
            for ( let node of otherNodes )
                if ( !(node as TreeViewNodeResource<T>).resource.saved ) {
                    resourcesSaved = false;
                    break;
                }


            let menuItems = [
                { label: 'Delete', prefix: <i className="fa fa-times" aria-hidden="true"></i>, onSelect: (e) => { this.onDeleteClick() } },
                { label: 'Refresh', prefix: <i className="fa fa-refresh" aria-hidden="true"></i>, onSelect: (e) => { this.onRefreshClick() } }
            ];

            if (!resourcesSaved)
                menuItems.push({
                    label: 'Save', prefix: <i className="fa fa-save" aria-hidden="true"></i>, onSelect: (e) => { this.onSaveClick() }
                });

            if (showRename)
                menuItems.push({
                label: 'Rename', prefix: <i className="fa fa-pencil" aria-hidden="true"></i>, onSelect: (e) => { this.onRenameClick() }
            });

            e.preventDefault();
            ReactContextMenu.show({ x: e.pageX, y : e.pageY, items: menuItems });
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
         * Gets or sets the label of the node
         * @param {string} val
         * @returns {string}
         */
        label(val?: string): string {
            if (val === undefined ) {
                if ( !this.resource.saved)
                    return '* ' + this.resource.entry.name;
                else
                    return this.resource.entry.name;
            }


            return super.label(val);
        }

        /**
         * Gets or sets the icon of the node
         * @param {JSX.Element} val
         * @returns {JSX.Element}
         */
        icon(val?: JSX.Element): JSX.Element {
            if ( val === undefined ) {
                if (this._loading)
                    return <i className="fa fa-cog fa-spin fa-fw"></i>;
                else
                    return super.icon();
            }
            return super.icon(val);
        }

        /**
		 * This will cleanup the model
		 */
		dispose() {
            let resource = this.resource;
            resource.on("modified", this.onModified, this);
            resource.on("deleted", this.onDeleted, this);
            resource.on("refreshed", this.onModified, this);
            this.resource = null;

            super.dispose();
        }

        /**
         * Called whenever the resource is modified
         */
        protected onDeleted() {
            if ( this._parent )
                this._parent.removeNode(this);
        }

        /**
		 * Called whenever the resource is modified
		 */
        protected onModified() {
            this.invalidate();
        }

        /**
		 * Called whenever the resource is edited
		 */
        protected onEdited() {
            this.resource.saved = false;
            this.invalidate();
        }

        /**
         * Called when the rename context item is clicked
         */
        onRenameClick() {
            let resource = this.resource;
            let p = User.get.project;

            let onOk = ( type: ResourceType, newName: string ) => {
                this.handleNodePromise( p.editResource( resource.entry._id, { name : newName }, type ), this );
            };

            if (resource instanceof Resources.GroupArray) {
                ReactWindow.show( RenameForm, { name: resource.entry.name, onOk: (newName) => { onOk(ResourceType.GROUP, newName) } } as IRenameFormProps);
            }
            else if (resource instanceof Resources.Container) {

                // Show the rename form
                ReactWindow.show( RenameForm, {
                    name: resource.entry.name,
                    onOk: (newName) => { onOk(ResourceType.CONTAINER, newName) },
                    onRenaming: (newName, prevName) : Error => {

                        // Make sure no other container exists with the same name
                        let containers = User.get.project.containers;
                        for (let container of containers)
                            if (container.entry.name == newName && container.entry.name != prevName)
                                return new Error(`A container with the name '${newName}' already exists`);

                        return null;
                    }
                } as IRenameFormProps);
            }
            else if (resource instanceof Resources.Asset)
                ReactWindow.show( RenameForm, { name: resource.entry.name, onOk: (newName) => { onOk(ResourceType.ASSET, newName) } } as IRenameFormProps);
        }

        /**
		 * Called when the delete context item is clicked
		 */
		private onDeleteClick() {
            let project = User.get.project;
            let selection = this.store.getSelectedNodes() as TreeViewNodeResource<ProjectResource<Engine.IResource>>[];
            if (selection.length == 0)
                selection.push(this);

			for ( let node of selection )
                this.handleNodePromise(project.deleteResources([node.resource.entry._id]), node);
		}

        /**
		 * Called when the delete context item is clicked
		 */
		private onSaveClick() {
            let project = User.get.project;
            let selection = this.store.getSelectedNodes() as TreeViewNodeResource<ProjectResource<Engine.IResource>>[];
            if (selection.length == 0)
                selection.push(this);

			for ( let node of selection )
                this.handleNodePromise( project.saveResource( node.resource.entry._id ), node );
		}

        /**
         * Called when the refresh context item is clicked
         */
        private onRefreshClick() {
            let selection = this.store.getSelectedNodes() as TreeViewNodeResource<ProjectResource<Engine.IResource>>[];
            let message = false;
            let project = User.get.project;

            if (selection.length == 0)
                selection.push(this);

            for ( let node of selection ) {
                if ( !node.resource.saved ) {
                    message = true;
                    ReactWindow.show(MessageBox, {
                        message :"You have unsaved work are you sure you want to refresh?",
                        buttons: ["Yes", "No"],
                        onChange: function(button) {
                            if ( button == "Yes" ) {
                                for ( let node of selection )
                                    this.handleNodePromise( project.refreshResource(node.resource.entry._id), node);
                            }
                        }
                    } as IMessageBoxProps);
                    break;
                }
            }

            if (!message) {
                for ( let node of selection )
                    this.handleNodePromise( project.refreshResource(node.resource.entry._id), node);
            }
        }

        /**
         * Called whenever the resource is re-downloaded
         */
        protected onRefreshed() {
        }

        /**
         * Handles the completion of project requests
         */
		private handleNodePromise(promise: Promise<any>, node: TreeViewNodeResource<ProjectResource<Engine.IResource>> ) {
            node.loading(true);

			promise.then( () => {
				node.loading(false);
			}).catch( (err: Error) => {
				node.loading(false);
				LoggerStore.error(err.message);
			});
		}
    }
}