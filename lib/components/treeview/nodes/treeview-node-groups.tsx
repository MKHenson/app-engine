import { User } from '../../../core/user';
import { ResourceType } from '../../../setup/enums';
import { Project } from '../../../core/project';
import { GroupArray } from '../../../core/project-resources/group-array';
import { ProjectEvents, IResourceEvent } from '../../../setup/events';
import { TreeNodeModel } from '../treenode-model';
import { ReactContextMenu } from '../../context-menu/context-menu';
import { TreeNodeGroup } from './treenode-group';

/**
 * A root node that contains the visual representations of project groups
 */
export class TreeViewNodeGroups extends TreeNodeModel {

    private _loading: boolean;
    private _project: Project;

    /**
     * Creates an instance of the node
     */
    constructor( project: Project ) {
        super( 'Groups', <i className="fa fa-th" aria-hidden="true"></i> );
        this._loading = false;
        this._project = project;
        this._project.on<ProjectEvents, IResourceEvent>( 'resource-created', this.onResourceCreated, this );
    }

    /**
     * Gets or sets the icon of the node
     */
    icon( val?: JSX.Element ): JSX.Element | undefined {
        if ( val === undefined ) {
            if ( this._loading )
                return <i className="fa fa-cog fa-spin fa-fw"></i>;
            else
                return super.icon();
        }
        return super.icon( val );
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
        let project = User.get.project;

        e.preventDefault();
        ReactContextMenu.show( {
            x: e.pageX, y: e.pageY, items: [ {
                label: 'New Group',
                prefix: <i className="fa fa-th" aria-hidden="true"></i>,
                onSelect: () => {
                    this.disabled( true );
                    this._loading = true;

                    project.createResource<HatcheryServer.IGroup>( ResourceType.GROUP, { name: 'New Group' }).then(() => {
                        this._loading = false;
                        this.disabled( false );
                    }).catch(() => {
                        this._loading = false;
                        this.disabled( false );
                        // TODO: Log message?
                        // store.dispatch( LogActions.error( err.message ) );
                    })
                }
            }]
        });
    }

    /**
     * If a container is created, then add its node representation
     */
    onResourceCreated( type: ProjectEvents, event: IResourceEvent ) {
        type; // Supresses unused param error
        let r = event.resource;
        if ( r instanceof GroupArray )
            this.addNode( new TreeNodeGroup( r ) );

        this.store.setStore( this );
    }
}