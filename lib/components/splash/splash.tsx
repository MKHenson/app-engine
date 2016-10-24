namespace Animate {
    export enum SplashMode {
        WELCOME,
        NEW_PROJECT,
        OPENING
    }

    export interface ISplashProps extends HatcheryProps {
        user?: IUser;
        splash?: ISplashScreen;
    }

    export interface ISplashStats {
        mode?: SplashMode
        loading?: boolean;
        project?: HatcheryServer.IProject;
    }

    // Connects th splash screen with its store properties
    @ReactRedux.connect<IStore, ISplashProps>(( state ) => {
        return {
            user: state.user,
            splash: state.splash
        }
    })

    /**
     * The splash screen when starting the app
     */
    export class Splash extends React.Component<ISplashProps, ISplashStats> {
        private static _singleton: Splash;

        /**
         * Creates an instance of the splash screen
         */
        constructor( props: ISplashProps ) {
            super( props );
            this.state = {
                mode: SplashMode.WELCOME,
                loading: true
            };
        }

        /**
         * Creates the component elements
         */
        render(): JSX.Element {
            const user = this.props.user!;
            const username = user.entry!.username!;
            const splash = this.props.splash!;
            const dispatch = this.props.dispatch!;

            let mainView: JSX.Element | undefined;

            if ( !user.isLoggedIn )
                mainView = <LoginWidget
                    onLogin={() => {
                        this.setState( { mode: SplashMode.WELCOME });
                    } } />;
            else if ( this.state.mode === SplashMode.WELCOME )
                mainView = <ProjectsOverview
                    splash={splash}
                    username={username}
                    onProjectDelete={( project ) => dispatch( removeProject( username, project._id ) )}
                    onProjectsRefresh={( index, limit, searchterm ) => dispatch( getProjectList( username, index, limit, searchterm ) )}
                    onCreateProject={() => {
                        this.setState( { mode: SplashMode.NEW_PROJECT });
                    } }
                    onOpenProject={( project ) => {
                        if ( !project )
                            return;

                        this.setState( {
                            mode: SplashMode.OPENING,
                            project: project
                        });
                    } }
                    />;
            else if ( this.state.mode === SplashMode.NEW_PROJECT )
                mainView = <NewProject
                    onCancel={() => {
                        this.setState( { mode: SplashMode.WELCOME });
                    } }
                    onProjectCreated={( project ) => {
                        this.setState( {
                            mode: SplashMode.OPENING,
                            project: project
                        });
                    } }
                    />;
            else if ( this.state.mode === SplashMode.OPENING )
                mainView = <OpenProject
                    project={this.state.project!}
                    onComplete={() => {
                        throw new Error( 'Not implemented' );
                    } }
                    onCancel={() => {
                        this.setState( { mode: SplashMode.WELCOME });
                    } }
                    />;

            return <div id="splash">
                <div className="logo">
                    {( user.isLoggedIn ? (
                        <div className="logout background-a">
                            <a onClick={() => { throw new Error( 'Not implemented' ) } }>
                                <i className="fa fa-sign-out" aria-hidden="true"></i> Logout
                            </a>
                        </div> ) : null )}
                    <h2>Hatchery</h2>
                </div>
                <div
                    id="splash-view"
                    className={this.splashDimensions() + ' background fade-in'}>
                    {mainView}
                </div>
            </div>
        }

        /*
         * Gets the dimensions of the splash screen based on the active pane
         */
        splashDimensions(): string {
            if ( !this.props.user!.isLoggedIn || this.state.mode === SplashMode.OPENING )
                return 'compact';
            else
                return 'wide';
        }

        /**
        * Gets the singleton reference of this class.
        */
        static get get(): Splash {
            return Splash._singleton;
        }
    }
}