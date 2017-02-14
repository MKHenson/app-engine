import { Collection, ICollectionOptions } from './collection';
import { Project } from './project';

export class Projects extends Collection<HatcheryServer.IProject> {
    constructor( options?: ICollectionOptions<HatcheryServer.IProject> ) {
        super( Object.assign<ICollectionOptions<HatcheryServer.IProject>>( options, {
            url: 'projects/',
            modelClass: Project
        }) );
    }
}