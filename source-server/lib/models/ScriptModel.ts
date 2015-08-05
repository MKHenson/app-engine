import mongodb = require( "mongodb" );

/**
* A class that is used to describe the project model
*/
export class Script
{
	public project_id: mongodb.ObjectID;
	public shallowId: number;
	public container_id: number;
	public behaviour_id: string;
	public createdBy: mongodb.ObjectID;
	public onEnter: string;
	public onInitialize: string;
	public onDispose: string;
	public onFrame: string;
	public created_on: number;
	public last_modified: number;
	public _id: mongodb.ObjectID;

	/**
	* Creates an instance of a project
	*/
	constructor( shallowId : number, container: number, behaviour: string, projectID: mongodb.ObjectID, createdBy: mongodb.ObjectID )
	{
		this.shallowId = shallowId;
		this.container_id = container;
		this.behaviour_id = behaviour;
		this.project_id = projectID;
		this.createdBy = createdBy;
		this.onEnter = "";
		this.onInitialize = "";
		this.onDispose = "";
		this.onFrame = "";
		this.created_on = Date.now();
		this.last_modified = Date.now();
	}
}