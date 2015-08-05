import mongodb = require( "mongodb" );

/**
* A class that is used to describe the project model
*/
export class Behaviour
{
	public name: string;
	public shallowId: number;
	public project_id: mongodb.ObjectID;
	public createdBy: mongodb.ObjectID;
	public json: any;
	public created_on: number;
	public last_modified: number;
	public _id: mongodb.ObjectID;

	/**
	* Creates an instance of a project
	*/
	constructor( name: string, shallowId: number, projectID: mongodb.ObjectID, createdBy: mongodb.ObjectID )
	{
		this.name = name;
		this.shallowId = shallowId;
		this.project_id = projectID;
		this.createdBy = createdBy;
		this.json = {};
		this.created_on = Date.now();
		this.last_modified = Date.now();
	}
}