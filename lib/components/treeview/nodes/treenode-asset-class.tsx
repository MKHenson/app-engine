import { AssetClass } from '../../../core/asset-class';
import { Project } from '../../../core/project';
import { Asset } from '../../../core/project-resources/asset';
import { ProjectEvents, IResourceEvent } from '../../../setup/events';
import { TreeNodeModel } from '../treenode-model';
import { TreeNodeAssetInstance } from './treenode-asset-instance';

/**
 * A node that represents an Asset Class
 */
export class TreeNodeAssetClass extends TreeNodeModel {
    public assetClass: AssetClass | null;
    private _project: Project | null;

    /**
     * Creates an instance of node
     */
    constructor( assetClass: AssetClass, project: Project ) {
        super( assetClass.name, <i className="fa fa-leaf" aria-hidden="true"></i> );

        this.selectable( false );
        this.assetClass = assetClass;

        // Add the sub-class nodes
        for ( let ii = 0; ii < assetClass.classes.length; ii++ ) {
            const c = assetClass.classes[ ii ];
            const toRet = new TreeNodeAssetClass( c, project );
            this.addNode( toRet );
        }

        this._project = project;
        this._project.on<ProjectEvents, IResourceEvent>( "resource-created", this.onResourceCreated, this );
    }

    /**
     * Clean up
     */
    dispose() {
        this._project!.off<ProjectEvents, IResourceEvent>( "resource-created", this.onResourceCreated, this );
        this._project = null;
        this.assetClass = null;
        super.dispose();
    }

    /**
     * If a container is created, then add its node representation
     */
    onResourceCreated( type: ProjectEvents, event: IResourceEvent ) {
        type; // Supresses unused param error

        let r = event.resource;
        if ( r instanceof Asset ) {

            if ( r.class === this.assetClass )
                return;

            const instanceNode = new TreeNodeAssetInstance( this.assetClass!, r );
            this.addNode( instanceNode );
        }
    }

    /**
     * This will get all instance nodes of a particular class name(s)
     * @param classNames The class name of the asset, or an array of class names
     */
    getInstances( classNames: string | string[] | null ): TreeNodeAssetInstance[] {
        let toRet: TreeNodeAssetInstance[] = [];
        let children = this.children;
        let names: string[];

        if ( !classNames )
            names = [];
        else if ( typeof ( classNames ) === 'string' )
            names = [ classNames as string ];
        else
            names = classNames as string[];


        for ( let name of names ) {

            // If name matches this classs
            if ( name === null || name === this.assetClass!.name || name === '' ) {
                for ( let node of children ) {
                    if ( node instanceof TreeNodeAssetInstance )
                        toRet.push( node );
                    else if ( node instanceof TreeNodeAssetClass ) {
                        let instances = node.getInstances( null );
                        for ( let instance of instances )
                            toRet.push( instance );
                    }
                }
            }
            else {
                // Name does not match - so search for deeper matches
                for ( let node of children ) {
                    if ( node instanceof TreeNodeAssetClass ) {
                        let instances = node.getInstances( names );
                        for ( let instance of instances )
                            if ( toRet.indexOf( instance ) === -1 )
                                toRet.push( instance );
                    }
                }
            }
        }

        return toRet;
    }
}