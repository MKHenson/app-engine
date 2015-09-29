﻿import {Model, SchemaFactory, NumberType} from "modepress-api";

/**
* A class that is used to describe the assets model
*/
export class FileModel extends Model
{
	/**
	* Creates an instance of the model
	*/
    constructor()
    {
        super("en-files");
        
        this.defaultSchema.add(new SchemaFactory.text("name", "", 1));
        this.defaultSchema.add(new SchemaFactory.num("shallowId", -1, -1, Infinity, NumberType.Integer, 0, true));
        this.defaultSchema.add(new SchemaFactory.num("size", 0, 0, Infinity, NumberType.Integer));
        this.defaultSchema.add(new SchemaFactory.bool("favourite", false, true));
        this.defaultSchema.add(new SchemaFactory.bool("global", false));
        this.defaultSchema.add(new SchemaFactory.id("projectId", "", true));
        this.defaultSchema.add(new SchemaFactory.text("user", "", 1));
        this.defaultSchema.add(new SchemaFactory.text("url", "", 1, Infinity, true));
        this.defaultSchema.add(new SchemaFactory.textArray("tags", [], 0, Infinity, 0, Infinity, true));
        this.defaultSchema.add(new SchemaFactory.text("previewPath", "", 1, Infinity, true));
        this.defaultSchema.add(new SchemaFactory.text("previewUrl", "", 1, Infinity, true));
        this.defaultSchema.add(new SchemaFactory.date("createdOn")).setIndexable(true);
        this.defaultSchema.add(new SchemaFactory.date("lastModified", undefined, false, true)).setIndexable(true);
    }
}