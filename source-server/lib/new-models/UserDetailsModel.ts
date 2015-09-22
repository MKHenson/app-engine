import {Model, SchemaFactory, NumberType} from "modepress-api";

/*
* The payment type of the user
*/
export enum Plan
{
    Free = 1,
    Bronze,
    Silver,
    Gold,
    Platinum,
    Custom
}

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
        
        this.defaultSchema.add(new SchemaFactory.text("user", "", 1)).setIndexable(true).setUnique(true);
        this.defaultSchema.add(new SchemaFactory.text("bio", ""));
        this.defaultSchema.add(new SchemaFactory.id("image", "", true));
        this.defaultSchema.add(new SchemaFactory.num("plan", Plan.Free, undefined, undefined, undefined, undefined, true)).setIndexable(true);
        this.defaultSchema.add(new SchemaFactory.text("website", ""));
        this.defaultSchema.add(new SchemaFactory.text("customerId", "", undefined, undefined, true)).setIndexable(true);
        this.defaultSchema.add(new SchemaFactory.num("maxProjects", 5, 0, 10000, 0, 0, true));
    }
}