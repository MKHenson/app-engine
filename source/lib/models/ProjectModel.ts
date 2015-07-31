import mongodb = require( "mongodb" );

export enum PrivilegeType
{
	NONE,
	READ,
	WRITE,
	ADMIN,
}


/**
* A class that is used to describe the project model
*/
export class Project
{
	public name : string;
	public description: string;
	public image: string;
	public imagePath: string;
	public category: string;
	public sub_category: string;
	public website_category: string;
	public website_img: string;
	public visibility: string;
	public cur_file: string;
	public rating: number;
	public suspicious: number;
	public deleted: number;
	public user: mongodb.ObjectID;
	public type: number;
	public tags: Array<string>;
	public buildId: mongodb.ObjectID;
	public createdOn: number;
	public lastModified: number;

	/** Maps privilege types with user IDs */
	public read_privileges: Array<string>;
	public write_privileges: Array<string>;
	public admin_privileges: Array<string>;
	public plugins: Array<string>;
	public files: Array<string>;

	public _id: mongodb.ObjectID;

	/**
	* Creates an instance of a project
	*/
	constructor( userID : mongodb.ObjectID, buildID : mongodb.ObjectID )
	{
		this.user = userID;
		this.buildId = buildID;

		this.name = "";
		this.description = "";
		this.image = "";
		this.imagePath = "";
		this.category = "";
		this.sub_category = "";
		this.website_category = "";
		this.website_img = "";
		this.visibility = "";
		this.rating = 0;
		this.suspicious = 0;
		this.deleted = 0;		
		this.type = 0;
		this.tags = [];
		this.createdOn = Date.now();
		this.lastModified = Date.now();
		this.plugins = [];
		this.files = [];
		this.read_privileges = [];
		this.write_privileges = [];
		// Give the user who created the projct admin rights
		this.admin_privileges = [ userID.toString() ]; 
	}
}