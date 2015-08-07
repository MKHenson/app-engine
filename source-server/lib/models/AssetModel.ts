import mongodb = require( "mongodb" );
import {Model, SchemaFactory, NumberType} from "modepress";

/**
* A class that is used to describe the project model
*/
export class Asset
{
	public name: string;
	public shallowId: number;
	public className: string;
	public project_id: mongodb.ObjectID;
	public createdBy: mongodb.ObjectID;
	public json: Array<{ name: string; category: string; value: any; type: string; }>;
	public created_on: number;
	public last_modified: number;
	public _id: mongodb.ObjectID;

	/**
	* Creates an instance of a project
	*/
	constructor( shallowId : number, name: string, className: string, projectID: mongodb.ObjectID, createdBy: mongodb.ObjectID, json: Array<any> = [] )
	{
		this.name = name;
		this.shallowId = shallowId;
		this.className = className;
		this.project_id = projectID;
		this.createdBy = createdBy;
		this.json = json;
		this.created_on = Date.now();
		this.last_modified = Date.now();
	}
}



/**
* A class that is used to describe the assets model
*/
export class AssetModel extends Model
{
	/**
	* Creates an instance of the model
	*/
    constructor()
    {
        super("assets");

        this.defaultSchema.add(new SchemaFactory.text("name", "", 1));
        this.defaultSchema.add(new SchemaFactory.num("shallowId", -1, -1, Infinity, NumberType.Integer));
        this.defaultSchema.add(new SchemaFactory.text("className", "", 1));
        this.defaultSchema.add(new SchemaFactory.id("project_id", null, true ));
        this.defaultSchema.add(new SchemaFactory.id("createdBy", null, true));
        this.defaultSchema.add(new SchemaFactory.text("json", "", 1));
        this.defaultSchema.add(new SchemaFactory.date("created_on")).indexable(true);
        this.defaultSchema.add(new SchemaFactory.date("last_modified")).indexable(true);
    }
}