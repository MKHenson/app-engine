import {Model, SchemaFactory, NumberType} from "modepress-api";

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
        super("en-plugins");

        this.defaultSchema.add(new SchemaFactory.text("name", "", 1));
        this.defaultSchema.add(new SchemaFactory.text("description", ""));
        this.defaultSchema.add(new SchemaFactory.text("plan", "basic", 1));
        this.defaultSchema.add(new SchemaFactory.text("path", "", 1));
        this.defaultSchema.add(new SchemaFactory.textArray("deployables", []));
        this.defaultSchema.add(new SchemaFactory.text("image", ""));
        this.defaultSchema.add(new SchemaFactory.text("author", "", 1));
        this.defaultSchema.add(new SchemaFactory.text("version", "0.0.1", 1));
        this.defaultSchema.add(new SchemaFactory.date("createdOn")).setIndexable(true);
        this.defaultSchema.add(new SchemaFactory.date("lastModified", undefined, false, true)).setIndexable(true);
    }
}