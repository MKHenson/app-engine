var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var modepress_api_1 = require("modepress-api");
/*
* The payment type of the user
*/
(function (Plan) {
    Plan[Plan["Free"] = 1] = "Free";
    Plan[Plan["Bronze"] = 2] = "Bronze";
    Plan[Plan["Silver"] = 3] = "Silver";
    Plan[Plan["Gold"] = 4] = "Gold";
    Plan[Plan["Platinum"] = 5] = "Platinum";
    Plan[Plan["Custom"] = 6] = "Custom";
})(exports.Plan || (exports.Plan = {}));
var Plan = exports.Plan;
/**
* A class that is used to describe the user details of each user
*/
var UserDetailsModel = (function (_super) {
    __extends(UserDetailsModel, _super);
    /**
    * Creates an instance of the model
    */
    function UserDetailsModel() {
        _super.call(this, "en-user-details");
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.text("user", "", 1)).setIndexable(true).setUnique(true);
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.text("bio", ""));
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.text("image", ""));
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.num("plan", Plan.Free, undefined, undefined, undefined, undefined, true)).setIndexable(true);
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.text("website", ""));
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.text("customerId", "", undefined, undefined, true)).setIndexable(true);
        this.defaultSchema.add(new modepress_api_1.SchemaFactory.num("maxProjects", 5, 0, 10000, 0, 0, true));
    }
    return UserDetailsModel;
})(modepress_api_1.Model);
exports.UserDetailsModel = UserDetailsModel;
