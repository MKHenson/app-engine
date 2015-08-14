import mongodb = require( "mongodb" );
import {Model, SchemaFactory, NumberType} from "modepress-api";

/**
* A class that is used to describe the project model
*/
export class Plugin
{
	public name: string;
	public folderName: string;
	public description: string;
	public shortDescription: string;
	public plan: string;
	public path: string;
	public header: string;
	public body: string;
	public deployables: Array<string>;
	public css: string;	
	public image: string;
	public author: string;
	public version: string;
	public _id: mongodb.ObjectID;

	/**
	* Creates an instance of a project
	*/
	constructor()
	{
		this.name = "";
		this.folderName = "";
		this.description = "";
		this.shortDescription = "";
		this.plan = "basic";
		this.path = "";
		this.header = "";
		this.body = "";
		this.deployables = [];
		this.css = "";
		this.image = "";
		this.author = "Webinate Ltd";
		this.version = "0.0.1";
	}
}