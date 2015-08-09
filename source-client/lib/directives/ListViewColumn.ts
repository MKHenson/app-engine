module Engine
{
    /**
    * Returns an interface that describes this directive
    * @returns {IDirective}
    */
    export function ListViewColumnDirective() : ng.IDirective
    {
        return {
            templateUrl: "templates/list-view-column.html", restrict: "E",
            require: "^enListView",
            controller: ListViewColumnController,
            controllerAs: "ctrl",
            link: function (scope, element, attrs, controller: ListViewColumnController) { controller.initialize(element); },
            scope: {
                title: "@"
            }
        }
    }

    /*
    * Controls the functionality of the list view directive
    */
    export class ListViewColumnController
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