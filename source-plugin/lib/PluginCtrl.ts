module HatcheryPlugin
{
    /**
    * A Class for managing the plugins screen
    */
    export class PluginCtrl
    {
        public plugins: Array<Engine.IPlugin>;
        public error: boolean;
        public errorMsg: string;
        public loading: boolean;
        public pluginToken: Engine.IPlugin;
        public showNewPluginForm: boolean;
        public editMode: boolean;
        public scope: any;
        public successMessage: string;
        public pager: Pager;
        public http: ng.IHttpService;
        public showMediaBrowser: boolean;
        public targetImgReciever: string;
        public searchKeyword: string;

        public static $inject = ["$scope", "$http"];
        constructor(scope, http: ng.IHttpService)
        {
            this.plugins = [];
            this.error = false;
            this.errorMsg = "";
            this.loading = false;
            this.http = http;
            this.scope = scope;
            this.successMessage = "";
            this.searchKeyword = "";
            this.editMode = false;
            this.pluginToken = {};
            this.pager = new Pager(this.fetchPlugins.bind(this));
            this.pager.goFirst();

            scope.planEnum = Animate.UserPlan;
            scope.plans = [];
            for (var i in Animate.UserPlan)
                if (!isNaN(parseInt(i)))
                    scope.plans.push({ value: parseInt(i), name: Animate.UserPlan[i], selected : false });
                else
                    break;
        }

        editPluginMode(plugin: Engine.IPlugin)
        {
            this.newPluginMode();
            this.editMode = true;
            this.loading = true;
            this.showNewPluginForm = true;

            var that = this;
            that.http.get<ModepressAddons.IGetPlugins>(`${appEngineURL}/app-engine/plugins/${plugin._id}`).then(function (response)
            {
                that.pluginToken = response.data.data[0];
                that.loading = false;
            });
        }

        /**
        * Gets a list of plugins
        */
        fetchPlugins(index: number, limit: number): ng.IHttpPromise<ModepressAddons.IGetPlugins>
        {
            var that = this;
            that.loading = true;
            that.error = false;
            that.errorMsg = "";

            

            var toRet = this.http.get<ModepressAddons.IGetPlugins>(`${appEngineURL}/app-engine/plugins?index=${index}&limit=${limit}&search=${that.searchKeyword}`);
            toRet.then(function (response)
            {
                that.plugins = response.data.data;

            }).catch(function (err: Error)
            {
                that.error = true;
                that.errorMsg = err.message;
                
            }).finally(function ()
            {
                that.loading = false
            });

            return toRet;
        }

        /**
        * Creates a new plugin
        */
        createPlugin()
        {
            this.scope.newPluginForm.$setSubmitted();

            if (this.scope.newPluginForm.$valid == false)
                return;

            var that = this;
            this.error = false;
            this.errorMsg = "";
            this.loading = true;
            var pluginToken = this.pluginToken;

            if (this.editMode)
            {
                that.http.put<Modepress.IGetPost>(`${appEngineURL}/app-engine/plugins/update/${pluginToken._id}`, pluginToken).then(function (token)
                {
                    if (token.data.error)
                    {
                        that.error = true;
                        that.errorMsg = token.data.message;
                    }
                    else
                    {
                        that.successMessage = token.data.message;
                        for (var i = 0, l = that.plugins.length; i < l; i++)
                            if (that.plugins[i]._id == that.pluginToken._id)
                            {
                                that.plugins.splice(i, 1, that.pluginToken);
                                break;
                            }
                        pluginToken.lastModified = Date.now();
                    }

                    that.loading = false;
                });
            }
            else
            {
                that.http.post<ModepressAddons.ICreatePlugin>(`${appEngineURL}/app-engine/plugins/create`, pluginToken).then(function (response)
                {
                    if (response.data.error)
                    {
                        that.error = true;
                        that.errorMsg = response.data.message;
                    }
                    else
                    {
                        that.plugins.push(response.data.data);
                        that.showNewPluginForm = false;
                    }

                    that.loading = false;
                });
            }
        }

        /**
        * Opens the media browser
        */
        openMediaBrowser()
        {
            this.showMediaBrowser = true;
        }

        /**
        * Closes the media browser
        */
        closeMediaBrowser()
        {
            this.showMediaBrowser = false;
        }

        /**
        * Selects a file from the media browser
        */
        selectFile(file: UsersInterface.IFileEntry)
        {
            this.showMediaBrowser = false;
            this.pluginToken.image = file.publicURL;
        }

        /**
        * Sets the page into post mode
        */
        newPluginMode()
        {
            this.scope.newPluginForm.$setUntouched();
            this.scope.newPluginForm.$setPristine();
            this.pluginToken = {
                name: "",
                description: "",
                plan: Animate.UserPlan.Free,
                deployables: [],                
                image: "",
                author: "Mathew Henson",
                version: "0.0.1"
            };

            this.editMode = false;
            this.successMessage = "";
            this.showNewPluginForm = !this.showNewPluginForm
        }
    }
}