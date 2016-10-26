import { AssetClass } from '../../../core/asset-class';
import { Asset } from '../../../core/project-resources/asset';
import { IResourceEvent, ResourceEvents } from '../../../setup/events';
import { TreeViewNodeResource } from './treeview-node-resource';


/**
 * Treenode that contains a reference to an asset
 */
export class TreeNodeAssetInstance extends TreeViewNodeResource<Asset> {
    public assetClass: AssetClass;

    /**
     * Creates an instance of the node
     */
    constructor( assetClass: AssetClass, asset: Asset ) {
        super( asset );
        this.assetClass = assetClass;
        this.canDrag = true;
        this.canDrop = false;

        // if (this.resource.properties === null || this.resource.properties.variables.length === 0 )
        //    this.resource.properties = assetClass.buildVariables();
        asset.on<ResourceEvents, IResourceEvent>( 'edited', this.onAssetEdited, this );
    }

    /**
     * When we click ok on the portal form
     */
    onAssetEdited() {
        this.resource.saved = false;
    }

    /**
     * This will cleanup the component.
     */
    dispose() {
        this.resource.off<ResourceEvents, IResourceEvent>( 'edited', this.onAssetEdited, this );
        super.dispose();
    }
}