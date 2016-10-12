namespace Animate {

    export interface IOptionsUserProps {
    }

    export interface IOptionsUserStats {
        bioUpdateErr?: string | null;
        imageUploadErr?: string | null;
        loading?: boolean;
    }

	/**
	 * A component for editing the user properties
	 */
    export class OptionsUser extends React.Component<IOptionsUserProps, IOptionsUserStats> {
        static defaultProps: IOptionsUserProps = {
        }

        /**
         * Creates a new instance
         */
        constructor( props: IOptionsUserProps ) {
            super( props );
            this.state = {
                imageUploadErr: null,
                bioUpdateErr: null,
                loading: false
            };
        }

        /**
		 * Updates the user bio information
		 * @param bio The new bio data
		 */
        updateBio( bio: string ) {
            this.setState( {
                loading: true,
                bioUpdateErr: null
            });

            User.get.updateDetails( { bio: bio } as HatcheryServer.IUserMeta ).catch(( err: Error ) => {
                this.setState( {
                    bioUpdateErr: err.message
                });
            }).then(() => {
                this.setState( {
                    loading: false
                });
            });
        }

        /**
         * Sets the user's avatar image
         */
        setAvatarUrl( file ) {

            this.setState( {
                loading: true,
                imageUploadErr: null
            });

            User.get.updateDetails( { image: ( file ? file.url : null ) }).then(() => {
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
         * Draws the options JSX
         */
        render(): JSX.Element {
            let user = User.get.entry;
            let meta = User.get.meta;
            let loadingSymbol: JSX.Element | undefined;

            if ( this.state.loading )
                loadingSymbol = <i className="fa fa-cog fa-spin fa-3x fa-fw"></i>;

            return <div id="options-user">
                <Group label="Details">
                    <div className="tr">
                        <div className="td">Username: </div>
                        <div className="td">{user.username}</div>
                    </div>
                    <div className="tr">
                        <div className="td">Email: </div>
                        <div className="td">{user.email}</div>
                    </div>
                    <div className="tr">
                        <div className="td">Joined On: </div>
                        <div className="td">{new Date( user.createdOn! ).toLocaleDateString()} {new Date( user.createdOn! ).toLocaleTimeString()}</div>
                    </div>
                    <div className="tr">
                        <div className="td">Last Logged In: </div>
                        <div className="td">{new Date( user.lastLoggedIn! ).toLocaleDateString()} {new Date( user.lastLoggedIn! ).toLocaleTimeString()}</div>
                    </div>
                </Group>
                <Group label="Avatar">
                    <ImageUploader label="Upload Image" src={meta ? meta.image! : undefined} onImage={( f ) => { this.setAvatarUrl( f ); } } />
                    <div className="img-data">
                        <div className="info">Your avatar is the image others see you as.Use the upload button to change your profile picture.</div>
                        {( this.state.imageUploadErr ? <Attention allowClose={false} mode={AttentionType.ERROR}>{this.state.imageUploadErr}</Attention> : null )}
                    </div>
                    <div className="fix"></div>
                </Group>
                <Group label="User Information">
                    <h3>Bio</h3>
                    <VTextarea ref="bio" className="background-view-light" value={meta ? meta.bio! : undefined} />
                    <div className="info">Use the above pad to write about yourself.This will show up on Webinate next to your projects.</div>

                    {( this.state.bioUpdateErr ? <Attention mode={AttentionType.ERROR} allowClose={false}>{this.state.bioUpdateErr}</Attention> : null )}

                    <ButtonPrimary disabled={this.state.loading} onClick={( e ) => { this.updateBio(( this.refs[ 'bio' ] as VTextarea ).value ); } }>
                        Update Information
                    </ButtonPrimary>

                    {loadingSymbol}
                    <div className="fix" />
                </Group>
            </div>
        }
    }
}