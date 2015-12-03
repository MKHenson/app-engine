module Animate
{
	/**
	* A wrapper for DB file instances
	*/
    export class FileResource extends ProjectResource<Engine.IFile>
	{
		/**
		* @param {IFile} entry The DB entry of this file
		*/
        constructor(entry: Engine.IFile)
        {
            super(entry);
		}
	}
}