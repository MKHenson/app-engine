import { Project } from '../../../core/project';
import { TreeNodeAssetClass } from './treenode-asset-class';
import { PluginManager } from '../../../core/plugin-manager';
import { TreeNodeModel } from '../treenode-model';

/**
 * A root node that contains the visual representations of project assets
 */
export class TreeViewNodeAssets extends TreeNodeModel {

    /**
     * Creates an instance of the node
     */
    constructor( project: Project ) {
        super( 'Assets', <i className="fa fa-leaf" aria-hidden="true"></i> );

        // Add all the asset nodes
        let assetTemplates = PluginManager.getSingleton().assetTemplates;

        for ( let template of assetTemplates )
            for ( let assetClass of template.classes )
                this.addNode( new TreeNodeAssetClass( assetClass, project ) );
    }

    /**
     * Called whenever the node receives a context event
     */
    onContext( e: React.MouseEvent ) {
        e.preventDefault();
        e.stopPropagation();
    }
}