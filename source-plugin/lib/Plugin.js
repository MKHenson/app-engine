define(["require", "exports"], function (require, exports) {
    var AppEnginePlugin = (function () {
        function AppEnginePlugin() {
            alert("HELLO!");
        }
        return AppEnginePlugin;
    })();
    exports.AppEnginePlugin = AppEnginePlugin;
    var i = 0;
    i++;
    _plugins.push(new AppEnginePlugin());
});
