namespace Animate {

    export interface IOptionsProjectProps extends IReactWindowProps {
    }

    export interface IOptionsProjectState {
        infoServerMsg?: string;
        imageUploadErr?: string;
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
         * @param {Engine.IFile} file
         */
        setProjectImageUrl( file: Engine.IFile ) {

            const project = User.get.project;
            this.setState( {
                loading: true,
                imageUploadErr: null
            });

            project.updateDetails( { image: ( file ? file.url : null ) }).then(() => {
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
         * @param {any} project details
         */
        updateDetails( json: any ) {
            this.setState( {
                loading: true,
                infoServerMsg: null,
                error: false
            });

            let project = User.get.project;

            // Turn the tags into an array
            json.tags = json.tags.split( ',' );

            project.updateDetails( json ).then(() => {
                this.setState( {
                    loading: false,
                    infoServerMsg: "Project details updated"
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
         * @returns {JSX.Element}
         */
        render(): JSX.Element {
            let project = User.get.project.entry;
            let loadingSymbol: JSX.Element;

            if ( this.state.loading )
                loadingSymbol = <i className="fa fa-cog fa-spin fa-3x fa-fw"></i>;

            return <div id='options-project'>
                <Group label="Details">
                    <VForm
                        onValidationError={( e ) => { this.setState( { infoServerMsg: `${Utils.capitalize( e[ 0 ].name )} : ${e[ 0 ].error}`, error: true }) } }
                        onValidationsResolved={( form ) => { this.setState( { infoServerMsg: '' }) } }
                        onSubmitted={( json, form ) => { this.updateDetails( json ); } }>

                        <h4>Project Name: </h4>
                        <VInput value={project.name} name="name" type="text" placeholder="My Project" validator={ValidationType.NOT_EMPTY | ValidationType.NO_HTML} />

                        <h4>Tags: </h4>
                        <VInput value={project.tags.join( ', ' ) } name="tags" type="text" placeholder="Keywords to describe the project"/>

                        <h4>Description: </h4>
                        <VTextarea value={project.description} name="description" placeholder="A project description"></VTextarea>

                        <h4>Visibility: </h4>
                        <VCheckbox name="public" label='Public' checked={project.public} />
                        <p className="info"><i>If public , your project will be searchable on the Webinate gallery.</i></p>

                        <h4>Category: </h4>
                        <VSelect name="category" allowEmptySelection={false} options={[
                            { label: 'Other', value: 1, selected: project.category === 1 },
                            { label: 'Artistic', value: 2, selected: project.category === 2 },
                            { label: 'Gaming', value: 3, selected: project.category === 3 },
                            { label: 'Informative', value: 4, selected: project.category === 4 },
                            { label: 'Musical', value: 5, selected: project.category === 5 },
                            { label: 'Technical', value: 6, selected: project.category === 6 },
                            { label: 'Promotional', value: 7, selected: project.category === 7 },
                        ]}/>
                        <p className="info"><i>Optionally provide a project category.The default is 'Other'</i></p>

                        {( this.state.infoServerMsg ?
                            <Attention mode={this.state.error ? AttentionType.ERROR : AttentionType.SUCCESS} allowClose={false}>{this.state.infoServerMsg}</Attention> : null ) }

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
                            <br/><br/><span className="nb">Your application must have an image in order to be shown in the gallery.</span><br/><br/>
                            Your project image should be either a.png or.jpg image that is 200 by 200 pixels.
                        </div>
                        {( this.state.imageUploadErr ? <Attention allowClose={false} mode={AttentionType.ERROR}>{this.state.imageUploadErr}</Attention> : null ) }
                    </div>
                    <ImageUploader label="Upload Image" src={project.image} onImage={( f ) => { this.setProjectImageUrl( f ); } } />
                    <div className="fix"></div>
                </Group>
            </div>
        }
    }
}