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

/**
* A class that is used to describe the plugin model
*/
export class PluginModel extends Model
{
	/**
	* Creates an instance of the model
	*/
    constructor()
    {
        super("plugins");

        this.defaultSchema.add(new SchemaFactory.text("name", "", 1));
        this.defaultSchema.add(new SchemaFactory.text("folderName", ""));
        this.defaultSchema.add(new SchemaFactory.text("description", "" ));
        this.defaultSchema.add(new SchemaFactory.text("shortDescription", "" ));
        this.defaultSchema.add(new SchemaFactory.text("plan", "basic", 1));
        this.defaultSchema.add(new SchemaFactory.text("path", "", 1));
        this.defaultSchema.add(new SchemaFactory.text("header", ""));
        this.defaultSchema.add(new SchemaFactory.text("body", ""));
        this.defaultSchema.add(new SchemaFactory.textArray("deployables", []));
        this.defaultSchema.add(new SchemaFactory.text("css", ""));
        this.defaultSchema.add(new SchemaFactory.text("image", ""));
        this.defaultSchema.add(new SchemaFactory.text("author", "", 1));
        this.defaultSchema.add(new SchemaFactory.text("version", "", 1));
    }
}