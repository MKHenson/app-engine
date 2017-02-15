import { IModelOptions } from './model';
import { ProjectResource } from './project-resource';
import { AssetClass, getClass } from '../core/asset-class';

/**
 * Assets are resources with a list of editable properties that a user can interact with.
 * The asset properties are decorated by templates called AssetClass. AssetClass's are
 * usually defined by plugins.
 */
export class Asset extends ProjectResource<HatcheryServer.IAsset> {
    public class: AssetClass;

    /**
     * Creates an asset instance
     */
    constructor( options?: IModelOptions<HatcheryServer.IAsset> ) {
        super( options );
    }

    /**
     * Initializes the asset once its loaded from the server
     */
    parse( dbModel: HatcheryServer.IAsset ): HatcheryServer.IAsset {

        const assetClass = getClass( dbModel.className! );
        if ( !assetClass )
            throw new Error( `The asset class '${dbModel.className!}' could not be found` );

        this.class = assetClass;

        // Build the properties from the asset class
        this.properties = assetClass.buildVariables();

        return super.parse( dbModel );
    }

    /**
     * Writes this assset to a readable string
     */
    toString() {
        return this.resource.name + '(' + this.resource.shallowId + ')';
    }
}