var EngineShared;
(function (EngineShared) {
    /*
    * The payment type of the user
    */
    (function (UserPlan) {
        UserPlan[UserPlan["Free"] = 0] = "Free";
        UserPlan[UserPlan["Bronze"] = 1] = "Bronze";
        UserPlan[UserPlan["Silver"] = 2] = "Silver";
        UserPlan[UserPlan["Gold"] = 3] = "Gold";
        UserPlan[UserPlan["Platinum"] = 4] = "Platinum";
        UserPlan[UserPlan["Custom"] = 5] = "Custom";
    })(EngineShared.UserPlan || (EngineShared.UserPlan = {}));
    var UserPlan = EngineShared.UserPlan;
})(EngineShared || (EngineShared = {}));
