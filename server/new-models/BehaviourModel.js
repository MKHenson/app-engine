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
var BehaviourModel = (function (_super) {
    __extends(BehaviourModel, _super);
    /**
    * Creates an instance of the model
    */
    function BehaviourModel() {
        _super.call(this, "en-behaviours");
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.text("name", "", 1));
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.num("shallowId", -1, -1, Infinity, modepress_api_1.NumberType.Integer));
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.id("projectId", "", true));
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.text("user", "", 1));
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.text("json", "", 1));
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.date("createdOn")).setIndexable(true);
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.date("lastModified", undefined, false, true)).setIndexable(true);
    }
    return BehaviourModel;
})(modepress_api_1.Model);
exports.BehaviourModel = BehaviourModel;
