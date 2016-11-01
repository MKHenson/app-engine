import { VInput } from '../v-input/v-input';
import { VForm } from '../v-form/v-form';
import { VTextarea } from '../v-textarea/v-textarea';
import { Attention } from '../attention/attention';
import { ButtonPrimary } from '../buttons/buttons';
import { PluginsWidget } from '../plugins-widget/plugins-widget';
import { ValidationType, AttentionType } from '../../setup/enums';
import { capitalize } from '../../core/utils';
import { ISplashScreen } from 'hatchery-editor';

export interface INewProjectProps {
    onCreateProject: ( options: HatcheryServer.IProject ) => void;
    splash: ISplashScreen;
    onCancel: () => void;
}

export interface INewProjectState {
    plugins?: HatcheryServer.IPlugin[];
    message?: string | null;
    error?: boolean;
}

/**
 * A Component for creating a new project
 */
export class NewProject extends React.Component<INewProjectProps, INewProjectState> {

    /**
     * Creates a new instance
     */
    constructor( props ) {
        super( props );

        this.state = {
            plugins: [],
            error: false,
            message: 'Please enter the project details and select any plugins you want to use'
        }
    }

    /**
     * Creates a new user project
     */
    newProject( json ) {
        const plugins = this.state.plugins!;
        const ids = plugins.map<string>( function( value ) { return value._id; });
        this.props.onCreateProject( { name: json.name, plugins: ids, description: json.description });
    }

    /**
     * Creates the component elements
     */
    render(): JSX.Element {
        const splash = this.props.splash;
        const error = splash.error ? true : this.state.error!;
        const message = splash.serverResponse ? splash.serverResponse! : this.state.message!;

        return (
            <div id="splash-new-project" className="new-project fade-in background">
                <div className="double-column form-info" style={{ width: '40%' }}>
                    <VForm name="new-project"
                        ref="newProjectForm"
                        onValidationError={( errors ) => {
                            this.setState( {
                                message: `${capitalize( errors[ 0 ].name )} : ${errors[ 0 ].error}`,
                                error: true
                            })
                        } }
                        onValidationsResolved={() => {
                            this.setState( { message: null })
                        } }
                        onSubmitted={( json ) => {
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
                        />
                </div>
                <div className="fix"></div>
                <div className="buttons">
                    {(
                        message || message !== '' ?
                            <Attention
                                allowClose={false}
                                showIcon={error}
                                mode={( error ? AttentionType.ERROR : AttentionType.WARNING )}>
                                {message}
                            </Attention>
                            : undefined
                    )}
                    <ButtonPrimary onClick={() => { this.props.onCancel() } }>
                        Back
                        </ButtonPrimary>
                    <ButtonPrimary disabled={splash.loading} onClick={() => { ( this.refs[ 'newProjectForm' ] as VForm ).initiateSubmit(); } }>
                        Next <span className="fa fa-chevron-right" />
                    </ButtonPrimary>
                </div>
            </div>
        )
    }
}