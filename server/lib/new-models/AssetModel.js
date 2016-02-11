var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var modepress_api_1 = require("modepress-api");
/**
* A class that is used to describe the assets model
*/
var AssetModel = (function (_super) {
    __extends(AssetModel, _super);
    /**
    * Creates an instance of the model
    */
    function AssetModel() {
        _super.call(this, "en-assets");
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.text("name", "", 1));
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.num("shallowId", -1, -1, Number.MAX_VALUE, modepress_api_1.NumberType.Integer));
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.text("className", "", 1));
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.id("projectId", "", true));
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.text("user", "", 1));
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.json("json", {}, true));
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.date("createdOn")).setIndexable(true);
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.date("lastModified", undefined, false, true)).setIndexable(true);
    }
    return AssetModel;
})(modepress_api_1.Model);
exports.AssetModel = AssetModel;
