import { User } from '../../../core/user';
import { Project } from '../../../core/project';
import { GroupArray } from '../../../core/project-resources/group-array';
import { ProjectResource } from '../../../core/project-resources/project-resource';
import { TreeViewNodeResource } from './treeview-node-resource';
import { TreeNodeGroupInstance } from './treenode-group-instance';

/**
 * This node represents a group asset.
 * Other resource nodes can be dropped on these which will append the object (if valid) into the group
 */
export class TreeNodeGroup extends TreeViewNodeResource<GroupArray> {

    /**
     * Creates an instance of the node
     */
    constructor( group: GroupArray ) {
        super( group );
        this.canDrop = true;
        this.icon( <i className="fa fa-object-group" aria-hidden="true" /> );
        this.onRefreshed();
        this.expanded( false );
    }

    /**
     * Called whenever the resource is re-downloaded
     */
    protected onRefreshed() {

        // Remove all current nodes
        let children = this.children;
        for ( let node of children )
            this.removeNode( node );

        const project: Project = User.get.project!;
        const group = this.resource;

        // Add each of the node references
        for ( let item of group.entry.items! ) {
            let resource = project.getResourceByShallowID<ProjectResource<HatcheryServer.IResource>>( item );
            if ( !resource )
                throw new Error( `Could not find resource ${item}` )
            this.addNode( new TreeNodeGroupInstance( resource, group ) );
        }
    }

    /**
     * Called whenever we drop an item on this element. This is only called if canDrop is true.
     * Use it to set drag data, eg: e.dataTransfer.getData("text");
     * @param e
     * @param json The unserialized data
     */
    onDragDrop( e: React.DragEvent, json: HatcheryEditor.IDragDropToken ) {
        e; // Supresses unused param error

        if ( json.type === 'resource' ) {
            let resource = User.get.project!.getResourceByShallowID( json.id as number );
            if ( !resource )
                throw new Error( `Could not find resource ${json.id}` )

            let entry = resource.entry;
            this.addNode( new TreeNodeGroupInstance( resource, this.resource ) );
            this.expanded();
            this.resource.addReference( entry.shallowId! );
        }
    }
}