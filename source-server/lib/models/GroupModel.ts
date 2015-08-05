import mongodb = require( "mongodb" );

/**
* A class that is used to describe the project model
*/
export class Group
{
	public name: string;
	public project_id: mongodb.ObjectID;
	public createdBy: mongodb.ObjectID;
	public json: { assets: Array<{ name: string; id: string; }>; };
	public created_on: number;
	public last_modified: number;
	public _id: mongodb.ObjectID;

	/**
	* Creates an instance of a project
	*/
	constructor( name : string, projectID: mongodb.ObjectID, createdBy: mongodb.ObjectID )
	{
		this.name = name;
		this.project_id = projectID;
		this.createdBy = createdBy;
		this.json = {
			assets: []
		};
		this.created_on = Date.now();
		this.last_modified = Date.now();
	}
}