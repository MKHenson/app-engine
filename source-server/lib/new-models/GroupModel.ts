import {Model, SchemaFactory, NumberType} from "modepress-api";

/**
* A class that is used to describe the assets model
*/
export class GroupModel extends Model
{
	/**
	* Creates an instance of the model
	*/
    constructor()
    {
        super("en-groups");
        
        this.defaultSchema.add(new SchemaFactory.text("name", "", 1));
        this.defaultSchema.add(new SchemaFactory.num("shallowId", -1, -1, Infinity, NumberType.Integer));
        this.defaultSchema.add(new SchemaFactory.id("projectId", "", true));
        this.defaultSchema.add(new SchemaFactory.numArray("items", [], -Infinity, Infinity, -Infinity, Infinity, 1, 0, true));
        this.defaultSchema.add(new SchemaFactory.text("user", "", 1));
        this.defaultSchema.add(new SchemaFactory.date("createdOn")).setIndexable(true);
        this.defaultSchema.add(new SchemaFactory.date("lastModified", undefined, false, true)).setIndexable(true);
    }
}