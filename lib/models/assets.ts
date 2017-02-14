import { Collection, ICollectionOptions } from './collection';
import { Asset } from './asset';

export class Assets extends Collection<HatcheryServer.IAsset> {
    constructor( options?: ICollectionOptions<HatcheryServer.IProject> ) {
        super( Object.assign<ICollectionOptions<HatcheryServer.IProject>>( options, {
            url: 'assets/',
            modelClass: Asset
        }) );
    }
}