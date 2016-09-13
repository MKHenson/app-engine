namespace Animate {

    export interface IApplicationState {
        showSplash?: boolean;
    }

	/**
	* The main GUI component of the application.
	*/
    export class Application extends React.Component<React.HTMLAttributes, IApplicationState> {
        private static _singleton: Application;
        public static bodyComponent: Component;
        private _focusObj: Component;
        private _sceneStore: TreeViewScene;

        constructor( props: React.HTMLAttributes ) {
            super( props );

            Application._singleton = this;
            Utils.init();
            new LoggerStore();
            User.get;
            this._sceneStore = new TreeViewScene();
            this.state = {
                showSplash: true
            }
        }

        /**
         * Log the first welcome message
         */
        componentDidMount() {
            LoggerStore.logMessage( 'Welcome to the Hatchery!', null, LogType.MESSAGE );
        }

		/**
         * Creates the component elements
         * @returns {JSX.Element}
         */
        render(): JSX.Element {

            let store = new ContainerWorkspace( null );

            return <div id="application">
                {( this.state.showSplash ? <Animate.Splash onClose={() => this.setState( { showSplash: false }) } /> : null ) }
                <div id="main-view" style={{ display: this.state.showSplash ? 'none' : '' }}>
                    <div id="toolbar">
                        <Toolbar />
                    </div>
                    <div id="stage">
                        <SplitPanel ratio={0.7} left={
                            <SplitPanel
                                ratio={0.8}
                                orientation={SplitOrientation.HORIZONTAL}
                                top={<Workspace />}
                                bottom={<Logger store={LoggerStore.get} />} />
                        } right={
                            <SplitPanel
                                ratio={0.6}
                                orientation={SplitOrientation.HORIZONTAL}
                                top={<h2>Property editor goes here</h2>}
                                bottom={
                                    <TreeView nodeStore={this._sceneStore} />
                                } />
                        } />
                    </div>
                </div>
            </div>
        }

		/**
		* Deals with the focus changes
		* @param {object} e The jQuery event object
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
		* @param {Component} comp The component to focus on.
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
            TreeViewScene.getSingleton().projectReset( user.project );
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