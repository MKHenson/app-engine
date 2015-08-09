module Engine
{
    /**
    * Returns an interface that describes this directive
    * @returns {IDirective}
    */
    export function ListViewDirective() : ng.IDirective
    {
        return {
            template: "<div class='list-view' ng-transclude></div>", 
            restrict: "E",
            controller: ListViewController,
            controllerAs: "ctrl",
            transclude: true,
            link: function (scope, element, attrs, controller: ListViewController) { controller.initialize(element); },
            scope: {
            }
        }
    }

    /*
    * Controls the functionality of the list view directive
    */
    export class ListViewController
    {
        public scope: any;
        public elem: ng.IAugmentedJQuery

        public static $inject = ["$scope"];
        constructor($scope : any)
        {
            this.scope = $scope;
            for (var i = 0, l = $scope.items.length; i < l; i++)
                $scope. $scope.items[i]
        }

        /*
        * Called via the link function in the directive description
        */
        initialize(elem: ng.IAugmentedJQuery)
        {
            this.elem = elem;
            
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