module Engine
{
    /**
    * Returns an interface that describes this directive
    * @returns {IDirective}
    */
    export function windowDirective() : ng.IDirective
    {
        return {
            templateUrl: "templates/window.html", restrict: "E",
            transclude: true,
            controller: WindowController,
            controllerAs: "ctrl",
            link: function (scope, element, attrs, controller: WindowController) { controller.initialize(element); },
            scope: {
                title: "@enTitle",
                center: "@enCenter"
            }
        }
    }

    /*
    * Controls the functionality of the window
    */
    export class WindowController
    {
        public scope: any;
        public elem: ng.IAugmentedJQuery

        public static $inject = ["$scope"];
        constructor($scope : any)
        {
            this.scope = $scope;
        }

        /*
        * Called via the link function in the directive description
        */
        initialize(elem: ng.IAugmentedJQuery)
        {
            this.elem = elem;
            if (this.scope.center)
                this.center();
            jQuery(".window", elem).draggable({ handle: ".window-control-box", containment: "parent" });
        }

        /**
		* Centers the window into the middle of the screen. This only works if the elements are added to the DOM first
		*/
        center()
        {
            var window = jQuery(".window", this.elem);
     
            window.css({
                left: (jQuery("body").width() / 2 - window.width() / 2),
                top: (jQuery("body").height() / 2 - window.height() / 2)
            });
        }

        /*
        * Destroys the window and removes it from the DOM
        */
        close()
        {
            this.elem.remove();
            this.scope.$destroy();
        }
    }
}