import {Model, SchemaFactory, NumberType} from "modepress-api";

/**
* A class that is used to describe the user details of each user
*/
export class UserDetailsModel extends Model
{
	/**
	* Creates an instance of the model
	*/
    constructor()
    {
        super("en-user-details");
        
        this.defaultSchema.add(new SchemaFactory.text("user", "", 1)).indexable(true);
        this.defaultSchema.add(new SchemaFactory.text("bio", ""));
        this.defaultSchema.add(new SchemaFactory.id("image", "", true));
        this.defaultSchema.add(new SchemaFactory.text("plan", "", undefined, undefined, true));
        this.defaultSchema.add(new SchemaFactory.text("website", ""));
        this.defaultSchema.add(new SchemaFactory.text("customerId", "", undefined, undefined, true));
        this.defaultSchema.add(new SchemaFactory.num("maxProjects", 5, 0, 10000, 0, 0, true));
    }
}