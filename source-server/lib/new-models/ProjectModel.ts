import {Model, SchemaFactory, NumberType} from "modepress-api";

/**
* A class that is used to describe the project model
*/
export class ProjectModel extends Model
{
	/**
	* Creates an instance of the model
	*/
    constructor()
    {
        super("en-projects");

        this.defaultSchema.add(new SchemaFactory.text("name", "", 1)).setIndexable(true);
        this.defaultSchema.add(new SchemaFactory.text("description", ""));
        this.defaultSchema.add(new SchemaFactory.id("image", "", true));
        this.defaultSchema.add(new SchemaFactory.text("category", "")).setIndexable(true);
        this.defaultSchema.add(new SchemaFactory.text("subCategory", "basic")).setIndexable(true);
        this.defaultSchema.add(new SchemaFactory.bool("public", false)).setIndexable(true);
        this.defaultSchema.add(new SchemaFactory.id("curFile", "", true));
        this.defaultSchema.add(new SchemaFactory.num("rating", 0)).setIndexable(true);
        this.defaultSchema.add(new SchemaFactory.num("score", 0));
        this.defaultSchema.add(new SchemaFactory.num("numRaters", 0));
        this.defaultSchema.add(new SchemaFactory.bool("suspicious", false));
        this.defaultSchema.add(new SchemaFactory.bool("deleted", false));
        this.defaultSchema.add(new SchemaFactory.id("user", "", true)).setIndexable(true);
        this.defaultSchema.add(new SchemaFactory.id("build", "", true));
        this.defaultSchema.add(new SchemaFactory.num("type", 0));
        this.defaultSchema.add(new SchemaFactory.textArray("tags", []));
        this.defaultSchema.add(new SchemaFactory.textArray("readPrivileges", []));
        this.defaultSchema.add(new SchemaFactory.textArray("writePrivileges", []));
        this.defaultSchema.add(new SchemaFactory.textArray("adminPrivileges", []));
        this.defaultSchema.add(new SchemaFactory.textArray("plugins", []));
        this.defaultSchema.add(new SchemaFactory.textArray("files", []));
        this.defaultSchema.add(new SchemaFactory.date("createdOn")).setIndexable(true);
        this.defaultSchema.add(new SchemaFactory.date("lastModified")).setIndexable(true);
    }
}