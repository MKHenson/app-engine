module Animate
{
    'use strict';

	/**
	* Configures the Angular application
	*/
    export class Config
    {
        // $inject annotation.
        public static $inject = [
            "$urlRouterProvider",
            "$stateProvider",
            "$locationProvider",
            "$httpProvider",
            "cfpLoadingBarProvider"
        ];

		/**
		* Creates an instance of the configurator
		*/
        constructor(routeProvider: angular.ui.IUrlRouterProvider, stateProvider: angular.ui.IStateProvider, $locationProvider: angular.ILocationProvider, $httpProvider: angular.IHttpProvider, cfpLoadingBarProvider)
        {
            $locationProvider.html5Mode(true);
                        
            // Turn off the loading bar spinner
            cfpLoadingBarProvider.includeSpinner = false;
        
            // Allows us to use CORS with angular
            $httpProvider.defaults.withCredentials = true;

            // Setup the different states
            stateProvider
                .state("main",
                    {
                        views: {
                            "main-view": {
                                templateUrl: "templates/splash.html",
                                controller: ["$scope", function (scope)
                                {
                                    scope.items = [["hello", "world"], ["lovely", "day"]];
                                }]
                            }
                        },
                        url: "/",
                        authenticate: true
                    })
        }
    }
}