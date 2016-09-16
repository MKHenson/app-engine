namespace Animate {

    export interface INewProjectProps {
        onCancel: () => void;
        onProjectCreated: ( project: Engine.IProject ) => void;
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
        private _user: User;

        /**
         * Creates a new instance
         */
        constructor( props ) {
            super( props );
            this._user = User.get;

            this.state = {
                plugins: [],
                error: false,
                errorMsg: 'Please enter the project details and select any plugins you want to use',
                loading: false
            }
        }

        /**
         * Creates a new user project
         */
        newProject( json ) {

            const plugins = this.state.plugins;
            const ids = plugins.map<string>( function ( value ) { return value._id; });
            this.setState( {
                loading: true,
                error: false,
                errorMsg: null
            });

            this._user.newProject( json.name, ids, json.description ).then(( data ) => {
                this.setState( {
                    loading: false
                });

                this.props.onProjectCreated( data.data );
            }).catch(( err: Error ) => {
                this.setState( {
                    loading: false,
                    error: true,
                    errorMsg: err.message
                });
            });

        }

        /**
        * Creates the component elements
        */
        render(): JSX.Element {
            return <div id="splash-new-project" className="new-project fade-in">

                <div className="double-column form-info" style={{ width: '40%' }}>
                    <VForm name="new-project"
                        ref="newProjectForm"
                        autoComplete="off"
                        onValidationError={( errors, form ) => {
                            this.setState( {
                                errorMsg: `${Utils.capitalize( errors[ 0 ].name )} : ${errors[ 0 ].error}`,
                                error: true
                            })
                        } }
                        onValidationsResolved={( form ) => {
                            this.setState( { errorMsg: null })
                        } }
                        onSubmitted={( json, form ) => {
                            this.newProject( json );
                        } }>

                        <VInput name="name"
                            type="text"
                            placeholder="Project Name"
                            validator={ValidationType.NO_HTML | ValidationType.NOT_EMPTY}
                            />

                        <VTextarea name="description"
                            placeholder="Project Description"
                            />
                    </VForm>
                </div>
                <div className="double-column" style={{ width: '60%' }}>
                    <PluginsWidget
                        onChange={( plugins ) => { this.setState( { plugins: plugins }) } }
                        onError={( err ) => { this.setState( { error: true, errorMsg: err.message }) } }
                        />
                </div>
                <div className="fix"></div>
                <div className="buttons">
                    {(
                        this.state.errorMsg ?
                            <Attention
                                showIcon={this.state.error}
                                mode={( this.state.error ? AttentionType.ERROR : AttentionType.WARNING ) }>
                                {this.state.errorMsg}
                            </Attention>
                            : null
                    ) }
                    <ButtonPrimary onClick={( e ) => { this.props.onCancel() } }>
                        Back
                    </ButtonPrimary>
                    <ButtonPrimary disabled={this.state.loading}  onClick={() => { ( this.refs[ 'newProjectForm' ] as VForm ).initiateSubmit(); } }>
                        Next <span className="fa fa-chevron-right"/>
                    </ButtonPrimary>
                </div>

            </div>
        }
    }
}