import { Collection } from './collection';

export class Projects extends Collection<HatcheryServer.IProject> {
    constructor() {
        super( 'projects', {});
    }

}