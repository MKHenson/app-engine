namespace Animate {

    export namespace Resources {

		/**
		* A wrapper for DB file instances
		* @events deleted, refreshed
		*/
        export class File extends ProjectResource<HatcheryServer.IFile> {
			/**
			* @param entry The DB entry of this file
			*/
            constructor( entry: HatcheryServer.IFile ) {
                super( entry );
            }
        }

    }
}