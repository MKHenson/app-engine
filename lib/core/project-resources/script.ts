namespace Animate {

    export namespace Resources {

		/**
		* A wrapper for DB script instances
		*/
        export class Script extends ProjectResource<HatcheryServer.IScript> {

			/**
			* @param entry The DB entry of this script
			*/
            constructor( entry: HatcheryServer.IScript ) {
                super( entry );
            }
        }

    }
}