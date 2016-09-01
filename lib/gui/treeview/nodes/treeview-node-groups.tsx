module Animate {

    /**
     * A root node that contains the visual representations of project groups
     */
    export class TreeViewNodeGroups extends TreeNodeModel {

        private _loading : boolean;

        /**
         * Creates an instance of the node
         */
        constructor() {
            super('Groups', <i className="fa fa-th" aria-hidden="true"></i> );
            this._loading = false;
            User.get.project.on("resource-created", this.onResourceCreated, this);
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
         * Clean up
         */
        dispose() {
            super.dispose();
            User.get.project.off("resource-created", this.onResourceCreated, this);
        }

        /**
         * Show context menu items
         */
        onContext(e: React.MouseEvent) {
            let project = User.get.project;

            e.preventDefault();
            ReactContextMenu.show({ x: e.pageX, y : e.pageY, items : [{
                label: 'New Group',
                prefix: <i className="fa fa-th" aria-hidden="true"></i>,
                onSelect : () => {
                    this.disabled(true);
                    this._loading = true;

                    project.createResource<Engine.IGroup>(ResourceType.GROUP, { name: "New Group" }).then( () => {
                        this._loading = false;
                        this.disabled(false);
                    }).catch( (err: Error) => {
                        this._loading = false;
                        this.disabled(false);
                        LoggerStore.error(err.message);
                    })
                }
            }]});
        }

        /**
         * If a container is created, then add its node representation
         */
        onResourceCreated(type: string, event: ProjectEvent<ProjectResource<Engine.IResource>>) {
            let r = event.resource;
            if (r instanceof GroupArray)
                this.addNode(new TreeNodeGroup(r));

            this.store.setStore(this);
        }
    }
}