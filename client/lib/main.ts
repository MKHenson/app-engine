declare var _cache: string;
var __plugins: { [name: string]: Array<Engine.IPlugin> } = {};
var __newPlugin: Animate.IPlugin = null;

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

/**
* Once the plugins are loaded from the DB
* @param {Array<Engine.IPlugin>} plugins
*/
function onPluginsLoaded(plugins: Array<Engine.IPlugin>)
{
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
                    return 1;

                // B bigger than A
                if (parseInt(a_components[i]) < parseInt(b_components[i]))
                    return -1;
            }

            // If one's a prefix of the other, the longer one is greater.
            if (a_components.length > b_components.length)
                return 1;

            if (a_components.length < b_components.length)
                return -1;

            // Otherwise they are the same.
            return 0;
        });
    }

    // Create the application element
    var app = new Animate.Application("#application");

    // Initialize the splash instance
    Animate.Splash.init(app);

    // Show Splash screen
	Animate.Splash.get.show();
}

/**
* Returns a formatted byte string
* @returns {string}
*/
function byteFilter(bytes, precision: number = 1) : string
{
    if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) return '-';
    var units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'],
        number = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, Math.floor(number))).toFixed(precision) + ' ' + units[number];
}

// Once the document is ready we begin
jQuery(document).ready(function ()
{
    // Make sure we call ajax with credentials on
    jQuery.ajaxSetup({
        crossDomain: true,
        xhrFields: { withCredentials: true },
        //contentType: 'application/json;charset=UTF-8',
        //dataType: "json"
    });

    var that = this;

    // Show the loading animation
    Animate.LoaderBase.showLoader();

    // Donwload the plugins available to this user
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
});