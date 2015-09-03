var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var modepress_api_1 = require("modepress-api");
/**
* A class that is used to describe the project model
*/
var ProjectModel = (function (_super) {
    __extends(ProjectModel, _super);
    /**
    * Creates an instance of the model
    */
    function ProjectModel() {
        _super.call(this, "en-projects");
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.text("name", "", 1)).setIndexable(true);
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.text("description", ""));
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.id("image", "", true));
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.text("category", "")).setIndexable(true);
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.text("subCategory", "basic")).setIndexable(true);
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.bool("public", false)).setIndexable(true);
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.id("curFile", "", true));
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.num("rating", 0)).setIndexable(true);
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.num("score", 0));
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.num("numRaters", 0));
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.bool("suspicious", false));
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.bool("deleted", false));
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.id("user", "", true)).setIndexable(true);
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.id("build", "", true));
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.num("type", 0));
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.textArray("tags", []));
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.textArray("readPrivileges", []));
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.textArray("writePrivileges", []));
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.textArray("adminPrivileges", []));
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.textArray("plugins", []));
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.textArray("files", []));
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.date("createdOn")).setIndexable(true);
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.date("lastModified")).setIndexable(true);
    }
    return ProjectModel;
})(modepress_api_1.Model);
exports.ProjectModel = ProjectModel;
