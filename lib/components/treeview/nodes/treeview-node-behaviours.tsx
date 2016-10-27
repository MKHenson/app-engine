import { PluginManagerEvents, ITemplateEvent } from '../../../setup/events';
import { TreeNodePluginBehaviour } from './treenode-plugin-behaviour';
import { PluginManager } from '../../../core/plugin-manager';
import { TreeNodeModel } from '../treenode-model';


/**
 * A root node that contains the visual representations of project containers
 */
export class TreeViewNodeBehaviours extends TreeNodeModel {

    /**
     * Creates an instance of the node
     */
    constructor() {
        super( 'Behaviours', <i className="fa fa-plug" aria-hidden="true"></i> );
        PluginManager.getSingleton().on<PluginManagerEvents, ITemplateEvent>( 'template-created', this.onTemplateCreated, this );
        this.expanded( false );
    }

    /**
     * Clean up
     */
    dispose() {
        super.dispose();
        PluginManager.getSingleton().off<PluginManagerEvents, ITemplateEvent>( 'template-created', this.onTemplateCreated, this );

    }

    /**
     * Show context menu items
     */
    onContext( e: React.MouseEvent ) {
        e.preventDefault();
    }

    /**
     * If a template is created, then add its node representation
     */
    onTemplateCreated( type: PluginManagerEvents, event: ITemplateEvent ) {
        type; // Supresses unused param error
        this.addNode( new TreeNodePluginBehaviour( event.template ) );
    }
}