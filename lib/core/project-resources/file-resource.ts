module Animate {
	/**
	* A wrapper for DB file instances
    * @events deleted, refreshed
	*/
    export class FileResource extends ProjectResource<Engine.IFile> {
		/**
		* @param {IFile} entry The DB entry of this file
		*/
        constructor(entry: Engine.IFile) {
            super(entry);
		}
	}
}