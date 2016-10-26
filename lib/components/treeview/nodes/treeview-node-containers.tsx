import { ProjectEvents, IResourceEvent } from '../../../setup/events';
import { TreeNodeContainerInstance } from './treenode-container-instance';
import { Container } from '../../../core/project-resources/container';
import { Project } from '../../../core/project';
import { TreeNodeModel } from '../treenode-model';
import { ReactContextMenu, IReactContextMenuItem } from '../../context-menu/context-menu';
import * as React from 'react';

/**
 * A root node that contains the visual representations of project containers
 */
export class TreeViewNodeContainers extends TreeNodeModel {

    private _context: IReactContextMenuItem[];
    private _project: Project;

    /**
     * Creates an instance of the node
     */
    constructor( project: Project ) {
        super( 'Containers', <i className="fa fa-cubes" aria-hidden="true"></i> );
        this._context = [
            { label: 'New Container', prefix: <i className="fa fa-cube" aria-hidden="true"></i> }
        ];

        this._project = project;
        this._project.on<ProjectEvents, IResourceEvent>( 'resource-created', this.onResourceCreated, this );
    }

    /**
     * Clean up
     */
    dispose() {
        super.dispose();
        this._project.off<ProjectEvents, IResourceEvent>( 'resource-created', this.onResourceCreated, this );
    }

    /**
     * Show context menu items
     */
    onContext( e: React.MouseEvent ) {
        e.preventDefault();
        ReactContextMenu.show( { x: e.pageX, y: e.pageY, items: this._context });
    }

    /**
     * If a container is created, then add its node representation
     */
    onResourceCreated( type: ProjectEvents, event: IResourceEvent ) {
        type; // Supresses unused param error
        let r = event.resource;
        if ( r instanceof Container )
            this.addNode( new TreeNodeContainerInstance( r, this._project ) );
    }
}