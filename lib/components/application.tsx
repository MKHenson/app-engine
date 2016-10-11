namespace Animate {

    export interface IApplicationState extends HatcheryProps {
        editorState?: IEditorState;
        project?: IProject;
        user?: IUser;
    }

    @ReactRedux.connect<IStore, IApplicationState>(( state ) => {
        return {
            editorState: state.editorState,
            project: state.project,
            user: state.user
        }
    })

    /**
	 * The main GUI component of the application.
	 */
    export class Application extends React.Component<IApplicationState, void> {
        private static _singleton: Application;
        public static bodyComponent: Component;
        private _focusObj: Component;

        constructor( props: IApplicationState ) {
            super( props );

            Application._singleton = this;
            Utils.init();
            new LoggerStore();
            User.get;
        }

        /**
         * Log the first welcome message
         */
        componentDidMount() {
            LoggerStore.logMessage( 'Welcome to the Hatchery!', null, LogType.MESSAGE );
        }

		/**
         * Creates the component elements
         */
        render(): JSX.Element {

            let project = User.get.project;
            const editorState = this.props.editorState!;

            return <div id="application">
                {( editorState.showSplash ? <Animate.Splash onClose={() => this.props.dispatch!( toggleSplash( false ) )} /> : null )}
                <div id="main-view" style={{ display: editorState.showSplash ? 'none' : '' }}>
                    <div id="toolbar">
                        <Toolbar project={project} />
                    </div>
                    <div id="stage">
                        <SplitPanel ratio={0.7} left={
                            <SplitPanel
                                ratio={0.8}
                                orientation={SplitOrientation.HORIZONTAL}
                                top={<Workspace project={project} />}
                                bottom={<Logger store={LoggerStore.get} />} />
                        } right={
                            <SplitPanel
                                ratio={0.6}
                                orientation={SplitOrientation.HORIZONTAL}
                                top={<h2>Property editor goes here</h2>}
                                bottom={
                                    <TreeViewScene project={project} />
                                } />
                        } />
                    </div>
                </div>
            </div>
        }

		/**
		* Deals with the focus changes
		*/
        onMouseDown( e ): void {
            let elem: JQuery = jQuery( e.target );
            let comp: Component = elem.data( 'component' ) as Component;

            while ( !comp && elem.length !== 0 ) {
                elem = jQuery( elem ).parent();
                comp = elem.data( 'component' );
            }

            this.setFocus( comp );
        }

		/**
		* Sets a component to be focused.
		* @param comp The component to focus on.
		*/
        setFocus( comp: Component ): void {
            if ( this._focusObj )
                this._focusObj.element.data( 'focus', false );

            if ( comp !== null ) {
                comp.element.data( 'focus', true );
                this._focusObj = comp;
            }
        }

		/**
		*  This is called when a project is unloaded and we need to reset the GUI.
		*/
        projectReset() {
            const user = User.get;

            // TODO: Figure out what to do with resets?
            PropertyGrid.getSingleton().projectReset();
            LoggerStore.get.clear();
            // TreeViewScene.getSingleton().projectReset( user.project );
            // CanvasTab.getSingleton().projectReset();

            // Must be called after reset
            if ( user.project )
                user.project.reset();

            // Unload all the plugins
            PluginManager.getSingleton().projectReset( user.project );
        }

		/**
		 * Gets the singleton instance
         * @returns {Application}
		 */
        public static getInstance( domElement?: string ): Application {
            return Application._singleton;
        }

        get focusObj(): Component { return this._focusObj; }
    }
}