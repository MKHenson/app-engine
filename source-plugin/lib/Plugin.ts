declare var _plugins: Array<ModepressAdmin.IAdminPlugin>;
declare var appEngineURL: string;

module HatcheryPlugin
{
    export class AppEnginePlugin implements ModepressAdmin.IAdminPlugin
    {
        dashboardLinks: Array<ModepressAdmin.IDashLik>;

        constructor()
        {
            this.dashboardLinks = [{
                icon: "/admin/plugins/app-engine/resources/media/hatchery-icon.png",
                label: "Hatchery",
                state: "default.hatchery-users",
                children: [{
                    icon: "/admin/media/images/users.png",
                    label: "Users",
                    state: "default.hatchery-users"
                },
                {
                    icon: "/admin/plugins/app-engine/resources/media/hatchery-plugins.png",
                    label: "Plugins",
                    state: "default.hatchery-plugins"
                }]
            }];
        }
    
        /**
        * Called when the application module is being setup
        */
        onInit(mod: angular.IModule): void
        {
            mod.controller("pluginCtrl", PluginCtrl);
        }

        /**
        * Called when the states are being setup in config
        */
        onStatesInit(stateProvider: angular.ui.IStateProvider): void
        {
            stateProvider
                .state('default.hatchery-plugins', <ng.ui.IState>{
                    templateUrl: 'admin/plugins/app-engine/resources/templates/hatchery-plugins.html',
                    authenticate: true,
                    controller: "pluginCtrl",
                    controllerAs: "controller",
                    url: "/hatchery-plugins"
                });
        }
    }
}

_plugins.push(new HatcheryPlugin.AppEnginePlugin());