declare var _users: string;
declare var _cache: string;
var __plugins: { [name: string]: Array<Engine.IPlugin> } = {};

/**
* Goes through each of the plugins and returns the one with the matching ID
* @param {string} id The ID of the plugin to fetch
*/
function getPluginByID(id : string): Engine.IPlugin
{
    for (var pluginName in __plugins)
    {
        for (var i = 0, l = __plugins[pluginName].length; i < l; i++)
            if (__plugins[pluginName][i]._id == id)
                return __plugins[pluginName][i];
    }

    return null;
}

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
    for (var i = 0, l = plugins.length; i < l; i++)
    {
        if (!__plugins[plugins[i].name])
            __plugins[plugins[i].name] = [];
        else
            continue;

        var pluginArray = __plugins[plugins[i].name];
        
        for (var ii = 0; ii < l; ii++)
            if (plugins[ii].name == plugins[i].name)
                pluginArray.push(plugins[ii]);

        // Sort the plugins based on their versions
        pluginArray = pluginArray.sort(function compare(a, b)
        {
            if (a === b)
                return 0;

            var a_components = a.version.split(".");
            var b_components = b.version.split(".");

            var len = Math.min(a_components.length, b_components.length);

            // loop while the components are equal
            for (var i = 0; i < len; i++)
            {
                // A bigger than B
                if (parseInt(a_components[i]) > parseInt(b_components[i]))
                {
                    return 1;
                }

                // B bigger than A
                if (parseInt(a_components[i]) < parseInt(b_components[i]))
                {
                    return -1;
                }
            }

            // If one's a prefix of the other, the longer one is greater.
            if (a_components.length > b_components.length)
            {
                return 1;
            }

            if (a_components.length < b_components.length)
            {
                return -1;
            }

            // Otherwise they are the same.
            return 0;
        });
    }

	
    var app = new Animate.Application("#application");
    Animate.Splash.init(app);

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

   

	//var loader = new Animate.AnimateLoader();	
	//loader.addEventListener( Animate.LoaderEvents.COMPLETE, onPluginsLoaded );
	//loader.addEventListener( Animate.LoaderEvents.FAILED, onPluginsLoaded );
    //loader.load(`${Animate.DB.API}/plugins`, {}, 3, "GET");

    var that = this;
    Animate.LoaderBase.showLoader();
    jQuery.getJSON(`${Animate.DB.API}/plugins`).done(function (response: ModepressAddons.IGetProjects)
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