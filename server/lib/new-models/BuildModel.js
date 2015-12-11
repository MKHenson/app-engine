var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var modepress_api_1 = require("modepress-api");
/**
* A class that is used to describe the builds model
*/
var BuildModel = (function (_super) {
    __extends(BuildModel, _super);
    /**
    * Creates an instance of the model
    */
    function BuildModel() {
        _super.call(this, "en-builds");
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.text("name", "New Build", 1));
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.text("user", "", 1));
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.id("projectId", "", true));
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.text("notes", ""));
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.text("version", "0.0.1"));
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.html("html", "", modepress_api_1.SchemaFactory.html.defaultTags.concat("h1", "h2", "h3", "h4", "img"), modepress_api_1.SchemaFactory.html.defaultAllowedAttributes));
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.bool("public", false));
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.text("css", ""));
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.text("liveHTML", ""));
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.text("liveLink", ""));
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.text("liveToken", ""));
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.num("totalVotes", 0));
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.num("totalVoters", 0));
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.date("createdOn")).setIndexable(true);
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.date("lastModified", undefined, false, true)).setIndexable(true);
    }
    return BuildModel;
})(modepress_api_1.Model);
exports.BuildModel = BuildModel;
