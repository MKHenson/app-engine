import { ProjectResource } from './project-resource';


/**
* A simple array resource for referencing groups, or arrays, of other objects. Similar to arrays in Javascript.
*/
export class GroupArray extends ProjectResource<HatcheryServer.IGroup> {

    /**
    * @param entry [Optional] The database entry of the resource
    */
    constructor( entry: HatcheryServer.IGroup ) {
        super( entry );
    }

    /**
    * Adds a new reference to the group
    * @param shallowId
    */
    addReference( shallowId: number ) {
        this.resource.items!.push( shallowId );
        this.saved = false;
    }

    /**
    * Removes a reference from the group
    * @param shallowId
    */
    removeReference( shallowId: number ) {
        if ( this.resource.items!.indexOf( shallowId ) !== -1 )
            this.resource.items!.splice( this.resource.items!.indexOf( shallowId ), 1 );

        this.saved = false;
    }

    /**
    * Disposes and cleans up the data of this asset
    */
    dispose() {
        super.dispose();
    }
}