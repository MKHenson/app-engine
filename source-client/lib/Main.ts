declare var _users: string;
declare var _cache: string;
var __plugins: Array<Engine.IPlugin> = [];

function onPluginsLoaded(plugins: Array<Engine.IPlugin>)// eventType: Animate.ENUM, event: Animate.AnimateLoaderEvent, sender?: Animate.AnimateLoader )
{
	//sender.removeEventListener( Animate.LoaderEvents.COMPLETE, onPluginsLoaded );
	//sender.removeEventListener( Animate.LoaderEvents.FAILED, onPluginsLoaded );

	//if ( !event.tag )
	//{
	//	Animate.MessageBox.show( "Could not connect to server", [], null, null );
	//	return;
	//}

	//__plugins = event.tag.plugins;
    __plugins = plugins;

	//Start Splash screen
	Animate.Splash.get.show();
}

function byteFilter()
{
    return function (bytes, precision)
    {
        if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) return '-';
        if (typeof precision === 'undefined') precision = 1;
        var units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'],
            number = Math.floor(Math.log(bytes) / Math.log(1024));
        return (bytes / Math.pow(1024, Math.floor(number))).toFixed(precision) + ' ' + units[number];
    }
}

jQuery(document).ready(function ()
{
    // Make sur we call ajax with credentials on
    jQuery.ajaxSetup({
        crossDomain: true,
        
        xhrFields: {
            withCredentials: true
        }
    });

	var app = new Animate.Application( "body" );

	//var loader = new Animate.AnimateLoader();	
	//loader.addEventListener( Animate.LoaderEvents.COMPLETE, onPluginsLoaded );
	//loader.addEventListener( Animate.LoaderEvents.FAILED, onPluginsLoaded );
    //loader.load(`${Animate.DB.API}/plugins`, {}, 3, "GET");

    var that = this;
    Animate.LoaderBase.showLoader();
    jQuery.getJSON(`${Animate.DB.API}/plugins`).done(function (response: ModepressEngine.IGetProjects)
    {
        onPluginsLoaded(response.data);

    }).fail(function (err: JQueryXHR)
    {
        Animate.MessageBox.show(`An error occurred while connecting to the server. ${err.status}: ${err.responseText}`, ["Ok"], null, null);

    }).always(function ()
    {
        Animate.LoaderBase.hideLoader();
    });

    //var stage = jQuery("#stage");
    //var splash = jQuery(jQuery("#en-splash").addBack().html());
    //stage.append(splash);
    //Animate.Compiler.build(splash, {
    //    name: "Mathew", buttonText: "Click Here",
    //    sayHello: function (e) { alert("Hello!") },
    //    sayHello2: function (e) { alert("You doubled me!") }
    //});
    
});

//angular.module("app-engine", ["ui.router", "ngAnimate", "ngSanitize", 'angular-loading-bar', "ngFileUpload"])
//    .constant("$usersUrl", _users + "/users")
//    .constant("mediaURL", _users + "/media")
//    .constant("apiURL", "./api")
//    .constant("capthaPublicKey", "6LdiW-USAAAAAGxGfZnQEPP2gDW2NLZ3kSMu3EtT")
//    .service("User", Animate.User)
//    .filter('bytes', byteFilter)
//    .config(Animate.Config)
//    .directive("enWindow", Engine.windowDirective)
//    .directive("enListView", Engine.ListViewDirective)
//    .directive("enListViewColumn", Engine.ListViewColumnDirective)
//    .run(["$rootScope", "$location", "$state", "User", function ($rootScope, $location, $state: ng.ui.IStateService, users: Animate.User)
//    {
//    }]);