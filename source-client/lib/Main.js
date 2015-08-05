/// <reference path="../../common_interface/JQuery.d.ts" />
/// <reference path="../../common_interface/JSColor.d.ts" />
/// <reference path="../../common_interface/AceEditor.d.ts" />
/// <reference path="../../common_interface/FileUploader.d.ts" />
/// <reference path="../../common_interface/Recaptcha.d.ts" />
jQuery(document).ready(function () {
    var app = new Animate.Application("body");
    app.tooltip = "hello world";

    //Start Splash screen
    Animate.Splash.getSingleton().show();
});
//# sourceMappingURL=Main.js.map
