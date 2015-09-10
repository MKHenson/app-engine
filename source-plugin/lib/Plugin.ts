declare var _plugins: Array<Modepress.IAdminPlugin>;

class AppEnginePlugin implements Modepress.IAdminPlugin
{
    dashboardLinks = ["Hatchery"];

    constructor()
    {
    }
}

_plugins.push(new AppEnginePlugin());