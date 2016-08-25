module Animate {

    export class TreeViewNodeContainers extends TreeNodeModel {

        private _context : IReactContextMenuItem[];

        constructor() {
            super('Containers', <i className="fa fa-cube" aria-hidden="true"></i> );
            this._context = [
                { label: 'New Container', prefix: <i className="fa fa-cube" aria-hidden="true"></i> }
            ];
        }

        onContext(e: React.MouseEvent) : boolean {
            e.preventDefault();
            ReactContextMenu.show({ x: e.pageX, y : e.pageY, items : this._context });
            return false;
        }
    }
}