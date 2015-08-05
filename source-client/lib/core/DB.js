var Animate;
(function (Animate) {
    //This class holds the DB information.
    var DB = (function () {
        function DB() {
        }
        DB.HOST = "../index.php";
        DB.PLAN_FREE = "animate-free";
        DB.PLAN_BRONZE = "animate-bronze";
        DB.PLAN_SILVER = "animate-silver";
        DB.PLAN_GOLD = "animate-gold";
        DB.PLAN_PLATINUM = "animate-platinum";
        return DB;
    })();
    Animate.DB = DB;
})(Animate || (Animate = {}));
//# sourceMappingURL=DB.js.map
