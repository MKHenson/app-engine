module Animate {



    export interface IPluginPlus extends Engine.IPlugin {
        $showVersions?: boolean;
    }

    export interface INewProjectProps {
        onCancel : () => void;
        onProjectCreated: (project : Engine.IProject) => void;
    }

    export interface INewProjectState {
        $plugins?: { [name: string]: IPluginPlus[] };
        $selectedPlugins?: Array<Engine.IProject>;
        $selectedPlugin? :IPluginPlus;
        $activePlugin? :IPluginPlus;
        $errorMsg?: string;
        $error?: boolean;
        $loading?: boolean;
    }

    /**
     * A Component for creating a new project
     */
    export class NewProject extends React.Component<INewProjectProps, INewProjectState> {
        private _user : User;

        /**
         * Creates a new instance
         */
        constructor(props) {
            super(props);
            this._user = User.get;

            this.state = {
                $plugins : {},
                $selectedPlugins : [],
                $selectedPlugin: null,
                $activePlugin: null,
                $errorMsg: null,
                $error: false,
                $loading: false
            }
        }

        /*
        * Called when we select a plugin
        * @param {IPlugin} The plugin to select
        */
        selectPlugin(plugin: IPluginPlus) {

            // If this plugin is not selected
            if (this.state.$selectedPlugins.indexOf(plugin) == -1) {
                // Make sure if another version is selected, that its de-selected
                for (var i = 0, l = this.state.$selectedPlugins.length; i < l; i++)
                    if (this.state.$selectedPlugins[i].name == plugin.name) {
                        this.state.$selectedPlugins.splice(i, 1);
                        break;
                    }

                this.state.$selectedPlugins.push(plugin);
            }
            else
                this.state.$selectedPlugins.splice(this.state.$selectedPlugins.indexOf(plugin), 1);

            // Set the active selected plugin
            if (this.state.$selectedPlugins.length > 0)
                this.setState({ $selectedPlugin : this.state.$selectedPlugins[this.state.$selectedPlugins.length - 1] });
            else
                this.setState({ $selectedPlugin : null });
        }

        /*
        * Checks if a plugin is selected
        * @param {IPlugin} The plugin to check
        */
        isPluginSelected(plugin): boolean {
            if (this.state.$selectedPlugins.indexOf(plugin) != -1)
                return true;
            else
                return false;
        }

        /*
        * Toggles if a plugin should show all its versions or not
        * @param {IPlugin} The plugin to toggle
        */
        showVersions(plugin: Engine.IPlugin) {
            for ( var n in this.state.$plugins )
                for ( var i = 0, l = this.state.$plugins[n].length; i < l; i++ ) {
                    if ( this.state.$plugins[n][i].name == plugin.name ) {
                        this.state.$plugins[n][i].$showVersions = !this.state.$plugins[n][i].$showVersions;
                    }
                }

            this.setState({$plugins : this.state.$plugins});
        }



        componentWillMount() {

            this.setState({
                $loading: true,
                $error: false,
                $errorMsg: null,
                $plugins: __plugins
            });
        }

        flattenPluginsByName() :JSX.Element[] {
            var pluginArray = this.state.$plugins;
            var arr: {name: string; array: IPluginPlus[] }[] = [];
            for ( var i in pluginArray )
                arr.push({ name : i, array: pluginArray[i] });

            return arr.map( ( pluginGrp, groupIndex ) => {
                return <div key={pluginGrp.name}>
                    {
                        pluginGrp.array.map( ( plugin, index ) => {

                            var isLastItem : boolean = index == (pluginGrp.array.length - 1);

                            return <div
                                key={plugin._id}
                                className={ 'plugin unselectable' + ( this.state.$activePlugin == plugin ? ' background-view-light' : '' ) }
                                onMouseEnter={()=> {
                                    this.setState({ $activePlugin : plugin });
                                }}>
                                <div
                                    className="more animate-all"
                                    style={{ display : ( pluginGrp.array.length > 1 && isLastItem ? '' : 'none' ) }}
                                    onClick={() => { this.showVersions(plugin); }}>
                                        <div className={plugin.$showVersions ? 'minus' : 'cross' }></div>
                                </div>
                                <VCheckbox
                                    onChange={(e)=>{
                                        this.selectPlugin(plugin);
                                    }}
                                    id={`cb-${plugin._id}`}
                                    checked={this.isPluginSelected(plugin)}
                                    style={{display: ( plugin.$showVersions || isLastItem ? '' : 'none' ) }}
                                    label={( isLastItem ? `${pluginGrp.name} ${plugin.version}` : plugin.version )}>
                                    {( isLastItem ? <img src={plugin.image} style={{display: ( isLastItem ? '' : 'none' ) }} /> : <span className="fa fa-caret-right" /> )}
                                </VCheckbox>
                            </div>
                        })
                    }
                </div>
            })
        }

        /**
         * Creates a new user project
         * @param {any} json
         */
        newProject(json) {

            var plugins = this.state.$selectedPlugins;
            var ids = plugins.map<string>(function (value) { return value._id; });
            this.setState({
                $loading: true,
                $error: false,
                $errorMsg: "Just a moment while we hatch your appling...",
            });

            this._user.newProject(json.name, ids, json.description).then(function (data) {
                this.setState({
                    $loading: false,
                    $errorMsg:null,
                });

                this.props.onProjectCreated(data.data);
            }).catch(function (err: Error) {
                this.setState({
                    $loading: true,
                    $error: false,
                    $errorMsg: err.message
                });
            });

        }

         /**
         * Creates the component elements
         * @returns {JSX.Element}
         */
        render() : JSX.Element {
            return <div id="splash-new-project" className='new-project fade-in'>
                <VForm name="new-project"
                    autoComplete="off"
                    onValidationError={(errors, form)=> {
                        this.setState({
                            $errorMsg: `${Utils.capitalize(errors[0].name)} : ${errors[0].error}`,
                            $error : true
                            })
                    }}
                    onValidationsResolved={(form)=> {
                        this.setState({ $errorMsg: null })
                    }}
                    onSubmitted={(e, json, form) => {
                        this.newProject(json);
                    }}>
                    <div className="double-column form-info" style={{width:'40%'}}>
                        <p>
                            <VInput
                                name="name"
                                type="text"
                                placeholder="Project Name"
                                validator={ValidationType.ALPHANUMERIC_PLUS | ValidationType.NOT_EMPTY}
                                />
                        </p>
                        <p>
                            <VTextarea
                                name="description"
                                placeholder="Project Description"
                                />
                        </p>
                    </div>
                    <div className="double-column" style={{width:'60%'}}>
                        <div className="double-column">
                            <div className="header">Choose Plugins</div>
                            <div className="plugins">
                                { this.flattenPluginsByName() }
                            </div>
                        </div>
                        <div className="double-column">
                            <div className="plugin-info background-view-light" style={{display : ( this.state.$activePlugin ? '' : 'none' ) }}>
                                <div className="header">
                                    {(this.state.$activePlugin ? this.state.$activePlugin.name : '')}
                                </div>
                                {(this.state.$activePlugin ? this.state.$activePlugin.description : '')}
                            </div>
                        </div>
                    </div>
                    <div className="fix"></div>
                    <div className="buttons">
                        <span className={ 'info' + ( this.state.$error ? 'error' : '' )}>{this.state.$errorMsg}</span>
                        <button className='button reg-gradient curve-small' onClick={() => { this.props.onCancel() }}>Back</button>
                        <button type='submit' className={ 'button reg-gradient curve-small animate-all' + (this.state.$loading ? ' disabled' : '' ) }>Next</button>
                    </div>
                </VForm>
            </div>
        }
    }
}