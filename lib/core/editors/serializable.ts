namespace Animate {

    export class Serializable<T> {

        public immutable: Immutable.Map<any, any>;

        constructor( data? : T ) {
            this.immutable = Immutable.Map( data || {});
        }

        update( data: T ){
            this.immutable = this.immutable.mergeDeep(data);
        }

        get( name: string ) {
            return this.immutable.get(name);
        }

        toObject() : T {
            return this.immutable.toJS()
        }
    }
}