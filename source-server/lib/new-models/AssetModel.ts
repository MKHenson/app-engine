import {Model, SchemaFactory, NumberType} from "modepress-api";

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
        super("en-assets");

        this.defaultSchema.add(new SchemaFactory.text("name", "", 1));
        this.defaultSchema.add(new SchemaFactory.num("shallowId", -1, -1, Infinity, NumberType.Integer));
        this.defaultSchema.add(new SchemaFactory.text("className", "", 1));
        this.defaultSchema.add(new SchemaFactory.id("project_id", "", true));
        this.defaultSchema.add(new SchemaFactory.id("createdBy", "", true));
        this.defaultSchema.add(new SchemaFactory.text("json", "", 1));
        this.defaultSchema.add(new SchemaFactory.date("created_on")).indexable(true);
        this.defaultSchema.add(new SchemaFactory.date("last_modified")).indexable(true);
    }
}