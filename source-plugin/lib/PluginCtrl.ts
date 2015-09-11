module HatcheryPlugin
{
    export class PluginCtrl
    {
        public plugins: Array<Engine.IPlugin>;
        public error: boolean;
        public errorMsg: string;
        public loading: boolean;
        public pluginToken: Engine.IPlugin;
        public showNewPluginForm: boolean;
        public editMode: boolean;
        public apiURL: string;
        public scope: any;
        public successMessage: string;
        public pager: Pager;
        public http: ng.IHttpService;

        public showMediaBrowser: boolean;
        public targetImgReciever: string;

        public static $inject = ["$scope", "$http", "apiURL"];
        constructor(scope, http: ng.IHttpService, apiUrl: string)
        {
            this.plugins = [];
            this.error = false;
            this.errorMsg = "";
            this.loading = false;
            this.http = http;
            this.scope = scope;
            this.apiURL = apiUrl;
            this.successMessage = "";
            this.editMode = false;
            this.pluginToken = {};
            this.pager = new Pager(this.fetchPlugins.bind(this));
            this.pager.goFirst();
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

            var toRet = this.http.get<ModepressAddons.IGetPlugins>(`${appEngineURL}/app-engine/plugins?index=${index}&limit=${limit}`);
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
                that.http.put<Modepress.IGetPost>(`${appEngineURL}/plugins/update/${pluginToken._id}`, pluginToken).then(function (token)
                {
                    if (token.data.error)
                    {
                        that.error = true;
                        that.errorMsg = token.data.message;
                    }
                    else
                    {
                        that.successMessage = token.data.message;
                        pluginToken.lastModified = Date.now();
                    }

                    that.loading = false;
                });
            }
            else
            {
                that.http.post<ModepressAddons.ICreatePlugin>(`${appEngineURL}/plugins/create`, pluginToken).then(function (response)
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
                plan: "Basic",
                path: "",
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