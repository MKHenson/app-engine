var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var modepress_api_1 = require("modepress-api");
/**
* A class that is used to describe the assets model
*/
var FileModel = (function (_super) {
    __extends(FileModel, _super);
    /**
    * Creates an instance of the model
    */
    function FileModel() {
        _super.call(this, "en-files");
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.text("name", "", 1));
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.text("bucketId", "", 1, 30));
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.text("bucketName", "", 1, 100));
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.num("size", 0, 0, Infinity, modepress_api_1.NumberType.Integer));
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.bool("favourite", false, true));
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.bool("global", false));
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.bool("browsable", true));
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.text("user", "", 1));
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.text("identifier", "", 1, 50));
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.text("extension", "", 1));
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.text("url", "", 1, 1024, true));
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.textArray("tags", [], 0, 20, 0, 50, true));
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.text("previewUrl", "", 0, 1024, true));
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.date("createdOn")).setIndexable(true);
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.date("lastModified", undefined, false, true)).setIndexable(true);
    }
    return FileModel;
})(modepress_api_1.Model);
exports.FileModel = FileModel;
