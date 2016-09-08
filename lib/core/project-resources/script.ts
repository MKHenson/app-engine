namespace Animate {

    export namespace Resources {

		/**
		* A wrapper for DB script instances
		*/
        export class Script extends ProjectResource<Engine.IScript> {

			/**
			* @param {IScript} entry The DB entry of this script
			*/
            constructor( entry: Engine.IScript ) {
                super( entry );
            }
        }

    }
}