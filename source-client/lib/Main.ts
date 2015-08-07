declare var _users: string;
declare var _cache: string;
var __plugins: Array<Engine.IPlugin> = [];

function onPluginsLoaded( eventType: Animate.ENUM, event: Animate.AnimateLoaderEvent, sender?: Animate.AnimateLoader )
{
	sender.removeEventListener( Animate.LoaderEvents.COMPLETE, onPluginsLoaded );
	sender.removeEventListener( Animate.LoaderEvents.FAILED, onPluginsLoaded );

	if ( !event.tag )
	{
		Animate.MessageBox.show( "Could not connect to server", [], null, null );
		return;
	}

	__plugins = event.tag.plugins;

	//Start Splash screen
	Animate.Splash.getSingleton().show();
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
	var app = new Animate.Application( "body" );

	var loader = new Animate.AnimateLoader();	
	loader.addEventListener( Animate.LoaderEvents.COMPLETE, onPluginsLoaded );
	loader.addEventListener( Animate.LoaderEvents.FAILED, onPluginsLoaded );
    loader.load("/plugins", {}, 3, "GET" );

    
});

angular.module("app-engine", ["ui.router", "ngAnimate", "ngSanitize", 'angular-loading-bar', "ngFileUpload"])
    .constant("$usersUrl", _users + "/users")
    .constant("mediaURL", _users + "/media")
    .constant("apiURL", "./api")
    .constant("capthaPublicKey", "6LdiW-USAAAAAGxGfZnQEPP2gDW2NLZ3kSMu3EtT")
    .service("User", Animate.User)
    .filter('bytes', byteFilter)
    .config(Animate.Config)
    .directive("enWindow", function ()
    {
        return {
            templateUrl: "templates/window.html", restrict: "E",
            transclude: true,
            controller: function($scope)
            {
                $scope.close = function ()
                {
                    $scope.$destroy();
                    $($scope.elem).remove();
                    $scope.elem = null;
                }

                $scope.close

            },
            link: function (scope, element, attrs)
            {
                (<any>scope).elem = element;

                jQuery(element).draggable({ handle: ".window-control-box", containment: "parent" });
            },
            scope: {
                title: "@enTitle"
            } } })
    .run(["$rootScope", "$location", "$state", "User", function ($rootScope, $location, $state: ng.ui.IStateService, users: Animate.User)
    {
    }]);