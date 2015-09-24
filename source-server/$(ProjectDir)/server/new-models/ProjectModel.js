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
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.html("description", ""));
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.id("image", ""));
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.text("category", "")).setIndexable(true);
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.text("subCategory", "")).setIndexable(true);
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.bool("public", false)).setIndexable(true);
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.id("curFile", "", true));
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.num("rating", 0)).setIndexable(true);
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.num("score", 0));
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.num("numRaters", 0));
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.bool("suspicious", false, true));
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.bool("deleted", false));
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.text("user", "", 1)).setIndexable(true);
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.id("build", "", true));
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.num("type", 0));
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.textArray("tags", []));
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.textArray("readPrivileges", [])).setSensitive(true);
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.textArray("writePrivileges", [])).setSensitive(true);
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.textArray("adminPrivileges", [])).setSensitive(true);
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.idArray("plugins", [], 1));
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.textArray("files", [])).setSensitive(true);
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.date("createdOn")).setIndexable(true);
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.date("lastModified", undefined, false, true)).setIndexable(true);
    }
    return ProjectModel;
})(modepress_api_1.Model);
exports.ProjectModel = ProjectModel;
