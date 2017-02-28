import { ProjectResource } from './project-resource';
import { IModelOptions } from './model';

/**
* A wrapper for DB script instances
*/
export class Script extends ProjectResource<HatcheryServer.IScript> {

    /**
    * @param entry The DB entry of this script
    */
    constructor( options?: IModelOptions<HatcheryServer.IScript> ) {
        super( options );
    }
}