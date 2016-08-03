module Animate {

    export interface INewProjectProps {
        onCancel : () => void;
        onProjectCreated: (project : Engine.IProject) => void;
    }

    export interface INewProjectState {
        plugins?: IPluginPlus[];
        errorMsg?: string;
        error?: boolean;
        loading?: boolean;
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
                plugins : [],
                errorMsg: null,
                error: false,
                loading: false
            }
        }

        /**
         * Creates a new user project
         * @param {any} json
         */
        newProject(json) {

            var plugins = this.state.plugins;
            var ids = plugins.map<string>(function (value) { return value._id; });
            this.setState({
                loading: true,
                error: false,
                errorMsg: "Just a moment while we hatch your appling...",
            });

            this._user.newProject(json.name, ids, json.description).then( (data) => {
                this.setState({
                    loading: false,
                    errorMsg:null,
                });

                this.props.onProjectCreated(data.data);
            }).catch( (err: Error) => {
                this.setState({
                    loading: true,
                    error: true,
                    errorMsg: err.message
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
                            errorMsg: `${Utils.capitalize(errors[0].name)} : ${errors[0].error}`,
                            error : true
                            })
                    }}
                    onValidationsResolved={(form)=> {
                        this.setState({ errorMsg: null })
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
                        <PluginsWidget
                            onChange={(plugins) => { this.setState({ plugins : plugins } ) }}
                            onError={(err) => { this.setState({ error : true, errorMsg : err.message } ) }}
                            />
                    </div>
                    <div className="fix"></div>
                    <div className="buttons">
                        {(
                            this.state.errorMsg ?
                                <Attention mode={( this.state.error ? AttentionType.ERROR : AttentionType.SUCCESS )}>
                                    {this.state.errorMsg}
                                </Attention>
                            : null
                        )}
                        <button className='button reg-gradient curve-small' onClick={(e) => { e.preventDefault(); this.props.onCancel() }}>Back</button>
                        <button type='submit' className={ 'button reg-gradient curve-small animate-all' + (this.state.loading ? ' disabled' : '' ) }>Next</button>
                    </div>
                </VForm>
            </div>
        }
    }
}