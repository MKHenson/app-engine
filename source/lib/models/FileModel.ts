import mongodb = require( "mongodb" );

/**
* A class that is used to describe the project model
*/
export class File
{
	public name: string;
	public user: mongodb.ObjectID;
	public size: number;
	public favourite: boolean;
	public tags: Array<string>;
	public url: string;
	public path: string;
	public previewUrl: string;
	public previewPath: string;
	public global: boolean;
	public createdOn: number;
	public lastModified: number;
	public _id: mongodb.ObjectID;

	/**
	* Creates an instance of a project
	*/
	constructor( user: mongodb.ObjectID )
	{
		this.name = "";
		this.user = user;
		this.size = 0;
		this.favourite = false;
		this.tags = [];
		this.url = "";
		this.path = "";
		this.previewUrl = "";
		this.previewPath = "";
		this.global = false;
		this.createdOn = Date.now();
		this.lastModified = Date.now();
	}
}