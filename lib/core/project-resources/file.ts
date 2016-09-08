namespace Animate {

    export namespace Resources {

		/**
		* A wrapper for DB file instances
		* @events deleted, refreshed
		*/
        export class File extends ProjectResource<Engine.IFile> {
			/**
			* @param {IFile} entry The DB entry of this file
			*/
            constructor( entry: Engine.IFile ) {
                super( entry );
            }
        }

    }
}