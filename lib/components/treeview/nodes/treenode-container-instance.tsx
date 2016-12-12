import { User } from '../../../core/user';
import { Project } from '../../../core/project';
import { Container } from '../../../core/project-resources/container';
import { TreeViewNodeResource } from './treeview-node-resource';

/**
 * Treenode that contains a reference to an asset
 */
export class TreeNodeContainerInstance extends TreeViewNodeResource<Container> {
    private _project: Project;

    /**
     * Creates an instance of the node
     */
    constructor( container: Container, project: Project ) {
        super( container );
        this._project = project;
    }

    /**
     * Gets or sets the label of the node
     * @param {string} val
     * @returns {string}
     */
    label( val?: string ): string {
        if ( val === undefined ) {
            let hasChanges = false;

            for ( const editor of this._project.openEditors )
                if ( editor.resource == this.resource && editor.hasUndos ) {
                    hasChanges = true;
                    break;
                }

            if ( !this.resource.saved || hasChanges )
                return '* ' + this.resource.entry.name;
            else
                return this.resource.entry.name!;
        }

        return super.label( val );
    }

    /**
     * Called whenever the node is double clicked
     */
    onDoubleClick() {
        User.get.project!.assignEditor( this.resource );
    }

    dispose() {
        super.dispose();
    }
}