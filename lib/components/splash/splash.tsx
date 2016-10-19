namespace Animate {
    export enum SplashMode {
        WELCOME,
        NEW_PROJECT,
        OPENING
    }

    export interface ISplashProps {
        onClose: () => void;
        user: IUser;
    }

    export interface ISplashStats {
        mode?: SplashMode
        loading?: boolean;
        project?: HatcheryServer.IProject;
    }

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
            let mainView: JSX.Element | undefined;

            if ( !user.isLoggedIn )
                mainView = <LoginWidget
                    onLogin={() => {
                        this.setState( { mode: SplashMode.WELCOME });
                    } } />;
            else if ( this.state.mode === SplashMode.WELCOME )
                mainView = <ProjectsOverview
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
                        this.props.onClose();
                    } }
                    onCancel={() => {
                        this.setState( { mode: SplashMode.WELCOME });
                    } }
                    />;

            return <div id="splash">
                <div className="logo">
                    {( User.get.isLoggedIn ? <div className="logout background-a"><a onClick={() => this.logout()}><i className="fa fa-sign-out" aria-hidden="true"></i> Logout</a></div> : null )}
                    <h2>Hatchery</h2>
                </div>
                <div
                    id="splash-view"
                    className={this.splashDimensions() + ' background fade-in'}>
                    {mainView}
                </div>
            </div>
        }

        // /*
        //  * Shows the splash screen
        //  */
        // show() {
        //     User.get.authenticated().then(( val ) => {
        //         this.setState( {
        //             loading: false,
        //             mode: ( !val ? SplashMode.LOGIN : SplashMode.WELCOME )
        //         });

        //     }).catch(() => {
        //         this.setState( {
        //             loading: false,
        //             mode: SplashMode.LOGIN
        //         });
        //     });

        //     this.setState( {
        //         loading: true
        //     });
        // }

        /*
        * Gets the dimensions of the splash screen based on the active pane
        */
        splashDimensions(): string {
            if ( !this.props.user!.isLoggedIn || this.state.mode === SplashMode.OPENING )
                return 'compact';
            else
                return 'wide';
        }

        /*
        * Called by the app when everything needs to be reset
        */
        reset() {
        }

        /**
        * Attempts to resend the activation code
        */
        logout() {
            this.setState( { loading: true });
            User.get.logout().then(() => {
                Application.getInstance().projectReset();
                this.setState( {
                    loading: false,
                    mode: SplashMode.WELCOME
                });
            })
                .catch(() => {
                    this.setState( {
                        loading: false
                    });
                });
        }

        /**
        * Gets the singleton reference of this class.
        */
        static get get(): Splash {
            return Splash._singleton;
        }
    }
}