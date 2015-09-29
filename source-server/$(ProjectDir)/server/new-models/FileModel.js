var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
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
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.num("shallowId", -1, -1, Infinity, modepress_api_1.NumberType.Integer, 0, true));
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.num("size", 0, 0, Infinity, modepress_api_1.NumberType.Integer));
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.bool("favourite", false, true));
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.bool("global", false));
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.id("projectId", "", true));
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.text("user", "", 1));
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.text("url", "", 1, Infinity, true));
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.textArray("tags", [], 0, Infinity, 0, Infinity, true));
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.text("previewPath", "", 1, Infinity, true));
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.text("previewUrl", "", 1, Infinity, true));
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.date("createdOn")).setIndexable(true);
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.date("lastModified", undefined, false, true)).setIndexable(true);
    }
    return FileModel;
})(modepress_api_1.Model);
exports.FileModel = FileModel;
