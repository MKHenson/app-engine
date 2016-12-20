import { IReactWindowProps } from '../../window/react-window';
import { User } from '../../../core/user';
import { capitalize } from '../../../core/utils';
import { ValidationType, AttentionType } from '../../../setup/enums';
import { ImageUploader } from '../../image-uploader/image-uploader';
import { Attention } from '../../attention/attention';
import { JsonForm } from '../../json-form/json-form';
import { Group } from '../../group/group';
import { ButtonPrimary } from '../../buttons/buttons';

export interface IOptionsProjectProps extends IReactWindowProps {
}

export interface IOptionsProjectState {
    infoServerMsg?: string | null;
    imageUploadErr?: string | null;
    loading?: boolean;
    error?: boolean;
}

/**
 * A component for editing the project properties
 */
export class OptionsProject extends React.Component<IOptionsProjectProps, IOptionsProjectState> {
    static defaultProps: IOptionsProjectProps = {
    }

    /**
     * Creates a new instance
     */
    constructor( props: IOptionsProjectProps ) {
        super( props );
        this.state = {
            loading: false,
            error: false,
            infoServerMsg: null,
            imageUploadErr: null
        };
    }

    /**
     * Sets the project image url
     */
    setProjectImageUrl( file: HatcheryServer.IFile ) {

        const project = User.get.project!;
        this.setState( {
            loading: true,
            imageUploadErr: null
        });

        project.updateDetails( { image: ( file ? file.url : undefined ) }).then(() => {
            this.setState( {
                loading: false
            });

        }).catch(( err: Error ) => {
            this.setState( {
                loading: false,
                imageUploadErr: err.message
            });
        });
    }

    /**
     * Attempts to update the project
     * @param project details
     */
    updateDetails( json: any ) {
        this.setState( {
            loading: true,
            infoServerMsg: null,
            error: false
        });

        let project = User.get.project!;

        // Turn the tags into an array
        json.tags = json.tags.split( ',' );

        project.updateDetails( json ).then(() => {
            this.setState( {
                loading: false,
                infoServerMsg: 'Project details updated'
            });
        }).catch(( err: Error ) => {
            this.setState( {
                loading: false,
                error: true,
                infoServerMsg: err.message
            });
        });
    }

    /**
     * Draws the options JSX
     */
    render(): JSX.Element {
        let project = User.get.project!.entry!;
        let loadingSymbol: JSX.Element | undefined;

        if ( this.state.loading )
            loadingSymbol = <i className="fa fa-cog fa-spin fa-3x fa-fw"></i>;

        return <div id="options-project">
            <Group label="Details">
                <VForm
                    descriptor={{
                        items: [
                            {
                                name: 'name',
                                type: 'text',
                                value: project.name!,
                                placeholder: 'My Project',
                                validators: ValidationType.NOT_EMPTY | ValidationType.NO_HTML,
                                before: <h4>Project Name: </h4>
                            },
                            {
                                name: 'tags',
                                type: 'text',
                                value: project.tags!.join( ', ' ),
                                placeholder: 'Keywords to describe the project',
                                validators: ValidationType.NOT_EMPTY | ValidationType.NO_HTML,
                                before: <h4>Tags: </h4>
                            },
                            {
                                name: 'description',
                                type: 'textarea',
                                value: project.description,
                                placeholder: 'A project description',
                                validators: ValidationType.NOT_EMPTY | ValidationType.NO_HTML,
                                before: <h4>Description: </h4>
                            },
                            {
                                name: 'public',
                                type: 'checkbox',
                                label: 'Public',
                                value: project.public,
                                before: <h4>Visibility: </h4>,
                                after: <p className="info"><i>If public , your project will be searchable on the Webinate gallery.</i></p>
                            },
                            {
                                name: 'category',
                                type: 'select',
                                value: project.category,
                                options: [
                                    { label: 'Other', value: 1 },
                                    { label: 'Artistic', value: 2 },
                                    { label: 'Gaming', value: 3 },
                                    { label: 'Informative', value: 4 },
                                    { label: 'Musical', value: 5 },
                                    { label: 'Technical', value: 6 },
                                    { label: 'Promotional', value: 7 },
                                ],
                                before: <h4>Category: </h4>,
                                after: <p className="info"><i>Optionally provide a project category.The default is 'Other'</i></p>
                            }
                        ]
                    }}
                    onValidationError={( e ) => { this.setState( { infoServerMsg: `${capitalize( e[ 0 ].name )} : ${e[ 0 ].error}`, error: true }) } }
                    onValidationsResolved={() => { this.setState( { infoServerMsg: '' }) } }
                    onSubmitted={( json ) => { this.updateDetails( json ); } }>

                    {( this.state.infoServerMsg ?
                        <Attention mode={this.state.error ? AttentionType.ERROR : AttentionType.SUCCESS} allowClose={false}>{this.state.infoServerMsg}</Attention> : null )}

                    <div className="fix" />
                    <ButtonPrimary preventDefault={false} type="submit" disabled={this.state.loading}>
                        Update Project Details <i className="fa fa-pencil" aria-hidden="true"></i>
                    </ButtonPrimary>
                    {loadingSymbol}
                    <div className="fix" />
                </VForm>
            </Group>
            <Group label="Image">
                <div className="img-data">
                    <div className="info">
                        Upload an image for the project; this image will show up in the Animate gallery for others to see.
                            <br /><br /><span className="nb">Your application must have an image in order to be shown in the gallery.</span><br /><br />
                        Your project image should be either a.png or.jpg image that is 200 by 200 pixels.
                        </div>
                    {( this.state.imageUploadErr ? <Attention allowClose={false} mode={AttentionType.ERROR}>{this.state.imageUploadErr}</Attention> : null )}
                </div>
                <ImageUploader label="Upload Image" src={project.image!} onImage={( f ) => { this.setProjectImageUrl( f ); } } />
                <div className="fix"></div>
            </Group>
        </div>
    }
}