var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var modepress_api_1 = require("modepress-api");
/**
* A class that is used to describe the plugin model
*/
var PluginModel = (function (_super) {
    __extends(PluginModel, _super);
    /**
    * Creates an instance of the model
    */
    function PluginModel() {
        _super.call(this, "en-plugins");
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.text("name", "", 1));
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.text("description", ""));
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.text("plan", "basic", 1));
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.text("path", "", 1));
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.textArray("deployables", []));
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.text("image", ""));
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.text("author", "", 1));
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.text("version", "", 1));
    }
    return PluginModel;
})(modepress_api_1.Model);
exports.PluginModel = PluginModel;
