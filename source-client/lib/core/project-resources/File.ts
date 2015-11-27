//module Animate
//{
//	/**
//	* A small object that represents a file that is associated with a project.
//	*/
//	export class File
//	{
//		public id: string;
//		public name: string;
//		public path: string;
//		public global: boolean;
//		public preview_path: string;
//		public tags: Array<string>;
//		public extension: string;
//		public size: number;
//		public createdOn: number;
//		public lastModified: number;
//		public favourite: boolean;

//		/**
//		* @param {string} name The name of the file
//		* @param {string} path The path of the file on the server
//		* @param {Array<string>} tags Keywords associated with the file to help search for it.This is a string 
//		* with values separated by commas
//		* @param {number} createdOn The date this file was created on
//		* @param {number} lastModified The date this file was last modified
//		* @param {string} id The id of the file
//		* @param {number} size The size of the file
//		* @param {boolean} favourite Is this file a favourite
//		* @param {string} preview_path The path of the file thumbnail on the server
//		* @param {boolean} global Is this file globally accessible
//		*/
//		constructor( name: string, path: string, tags: Array<string>, id: string, createdOn: number, lastModified: number, size: number, favourite: boolean, preview_path: string, global: boolean )
//		{
//			this.id = id;
//			this.name = name;
//			this.path = path;
//			this.global = global;
//			this.preview_path = preview_path;
//			this.tags = tags;
//			this.extension = "";

//			var splitData = path.split( "." );
//			if ( splitData.length > 0 )
//				this.extension = splitData[splitData.length - 1].toLowerCase();
//			else
//				this.extension = "";

			
//			this.size = ( isNaN( size ) ? 0 : size );
//			this.createdOn = createdOn;
//			this.lastModified = lastModified;
//			this.favourite = favourite;
//		}


//		/**
//		* Disposes and cleans the object
//		*/
//		dispose()
//		{
//			this.id = null;
//			this.name = null;
//			this.path = null;
//			this.path = null;
//			this.global = null;
//			this.preview_path = null;
//			this.extension = null;
//			this.tags = null;
//		}
//	}
//}