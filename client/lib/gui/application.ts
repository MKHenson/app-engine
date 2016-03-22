module Animate
{
	/**
	* The main GUI component of the application.
	*/
	export class Application extends Component
	{
        private static _singleton: Application;
        public static bodyComponent: Component;
		private _focusObj: Component;

		private _resizeProxy: any;
		private _downProxy: any;
		private _dockerlefttop: Docker;
		private _dockerleftbottom: Docker;
		private _dockerrighttop: Docker;
		private _dockerrightbottom: Docker;
		private _canvasContext: CanvasContext;

		constructor( domElement?: string )
		{
			super(domElement, null);

            if (Application._singleton != null)
				throw new Error("The Application class is a singleton. You need to call the Application.getSingleton() function.");

            // Creates a common body element
            Application.bodyComponent = new Component("body");

			Application._singleton = this;
			this._canvasContext = new CanvasContext();
			this._focusObj = null;

			//Start the tooltip manager
            TooltipManager.create();
            User.get;

			this._resizeProxy = this.onWindowResized.bind( this );
			this._downProxy = this.onMouseDown.bind( this );

			//var comp = jQuery( document.activeElement ).data( "component" );

			//Create each of the main components for the application.
			var stage: Component = new Component( "#stage" );
			var toolbar: Toolbar = Toolbar.getSingleton( new Component( "#toolbar" ) );

			this.addChild( toolbar );
			this.addChild( stage );

			//Create each of the main split panels
			var mainSplit: SplitPanel = new SplitPanel( stage, SplitOrientation.VERTICAL, 0.75 );
			mainSplit.element.css( { width: "100%", height: "100%" });

			var leftSplit : SplitPanel = new SplitPanel( mainSplit.left, SplitOrientation.HORIZONTAL, 0.85 );
			var rightSplit : SplitPanel = new SplitPanel( mainSplit.right, SplitOrientation.HORIZONTAL, 0.5 );
			leftSplit.element.css( { width: "100%", height: "100%" });
			rightSplit.element.css( { width: "100%", height: "100%" });
			var grid: PropertyGrid = new PropertyGrid( rightSplit.top );

			var scenetab = SceneTab.getSingleton( rightSplit.bottom );
			var canvastab: CanvasTab = CanvasTab.getSingleton( leftSplit.top );
			Logger.getSingleton( leftSplit.bottom );
            Logger.logMessage( "let's get animated!", null, LogType.MESSAGE );

			//now set up the dockers
			this._dockerlefttop = new Docker( leftSplit.top );
			this._dockerlefttop.addComponent( canvastab, false );
            this._dockerleftbottom = new Docker(leftSplit.bottom);
            this._dockerleftbottom.addComponent(Logger.getSingleton(), false);
			this._dockerrightbottom = new Docker( rightSplit.bottom );
			this._dockerrightbottom.addComponent( scenetab, false );
			this._dockerrighttop = new Docker( rightSplit.top );
			this._dockerrighttop.addComponent( grid, false );



			this.update();

			//Hook the resize event
			jQuery( window ).on( 'resize', this._resizeProxy );
			jQuery( document ).on( 'mousedown', this._downProxy );
		}

		/**
		* Deals with the focus changes
		* @param {object} e The jQuery event object
		*/
		onMouseDown( e ) : void
		{
			var elem : JQuery = jQuery( e.target );
            var comp: Component = <Component>elem.data( "component" );

			while ( !comp && elem.length != 0 )
			{
				elem = jQuery( elem ).parent();
				comp = elem.data( "component" );
			}

			this.setFocus( comp );
		}

		/**
		* Sets a component to be focused.
		* @param {Component} comp The component to focus on.
		*/
		setFocus( comp : Component ) : void
		{
			if ( this._focusObj )
				this._focusObj.element.data( "focus", false );

			if ( comp != null )
			{
				comp.element.data( "focus", true );
				this._focusObj = comp;
			}
		}

		/**
		* Updates the dimensions of the application
		* @param {object} val The jQuery event object
		*/
		onWindowResized( val ) : void
        {
            // Do not update everything if the event is from JQ UI
            if (val && $(val.target).hasClass('ui-resizable'))
                return;

			super.update();
		}

		/**
		* This will cleanup the component.
		*/
		dispose()
		{
			jQuery( window ).off( 'resize', this._resizeProxy );
			jQuery( document ).off( 'mousedown', this._downProxy );

			this._resizeProxy = null;
			this._downProxy = null;

			//Call super
			super.dispose();
		}

		/**
		*  This is called when a project is unloaded and we need to reset the GUI.
		*/
		projectReset()
        {
            var user = User.get;

			PropertyGrid.getSingleton().projectReset();
			Logger.getSingleton().clearItems();
            TreeViewScene.getSingleton().projectReset(user.project);
            CanvasTab.getSingleton().projectReset();


			//Must be called after reset
            var user = User.get;
			if ( user.project )
			{
                user.project.reset();
				//user.project = null;
			}

			//Unload all the plugins
            PluginManager.getSingleton().projectReset(user.project);
		}

		///**
		//* This is called when a project is created. This is used
		//* so we can orgaise all the elements that need to be populated.
		//*/
		//projectReady()
		//{
  //          var project: Project = User.get.project;
		//	//project.on( ProjectEvents.BEHAVIOURS_LOADED, this.onBehavioursLoaded, this );
		//	//project.loadBehaviours();

  //          // load each of the different resources
  //          var project: Project = User.get.project;
  //          project.loadResources()
  //          project.off(ProjectEvents.SAVED_ALL, this.onSaveAll, this);
  //          project.on(ProjectEvents.SAVED_ALL, this.onSaveAll, this);
  //          //Create the page title
  //          document.title = 'Animate: p' + project.entry._id + " - " + project.entry.name;
  //          Toolbar.getSingleton().newProject(project);
  //          CanvasTab.getSingleton().projectReady(project);
  //          TreeViewScene.getSingleton().projectReady(project);
  //          PluginManager.getSingleton().projectReady(project);
		//}

		///**
		//* This is called when a project has loaded all its behaviours.
		//*/
  //      onBehavioursLoaded(response: ProjectEvents, event: ProjectEvent, sender?: EventDispatcher): void
  //      {
  //          var that = this;
  //          var project: Project = User.get.project;
		//	project.off( ProjectEvents.BEHAVIOURS_LOADED, this.onBehavioursLoaded, this );

  //          //project.on( ProjectEvents.FILES_LOADED, this.onFilesLoaded, this );
  //          project.loadFiles().then(function ()
  //          {
  //              that.onFilesLoaded(null, null, null);
  //          });
		//}

		///**
		//* This is called when a project has loaded all its assets.
		//*/
  //      onAssetsLoaded(response: ProjectEvents, event: ProjectEvent, sender?: EventDispatcher): void
		//{
  //          var project: Project = User.get.project;
		//	project.off( ProjectEvents.ASSETS_LOADED, this.onAssetsLoaded, this );

		//	project.on( ProjectEvents.GROUPS_LOADED, this.onGroupsLoaded, this );
		//	project.loadGroups();
		//}

		///**
		//* This is called when a project has loaded all its files.
		//*/
  //      onFilesLoaded(response: ProjectEvents, event: ProjectEvent, sender?: EventDispatcher): void
		//{
  //          var project: Project = User.get.project;
		//	//project.off( ProjectEvents.FILES_LOADED, this.onFilesLoaded, this );

		//	project.on( ProjectEvents.ASSETS_LOADED, this.onAssetsLoaded, this );
		//	project.loadAssets();
		//}

		///**
		//* This is called when a project has loaded all its groups.
		//*/
  //      onGroupsLoaded(response: ProjectEvents, event: ProjectEvent, sender?: EventDispatcher): void
		//{
  //          var project = User.get.project;
		//	project.off( ProjectEvents.GROUPS_LOADED, this.onGroupsLoaded, this );

		//	project.off( ProjectEvents.SAVED_ALL, this.onSaveAll, this );
		//	project.on( ProjectEvents.SAVED_ALL, this.onSaveAll, this );

  //          PluginManager.getSingleton().projectReady(project);
		//}

		///**
		//* When the project data is all saved to the DB
		//*/
		//onSaveAll( event, data ) : void
		//{
		//	CanvasTab.getSingleton().saveAll();
		//}

		/**
		* Gets the singleton instance
		*/
		public static getInstance( domElement? : string ): Application
		{
            if (Application._singleton === undefined)
				Application._singleton = new Application(domElement);

			return Application._singleton;
		}

		get focusObj(): Component { return this._focusObj; }
		get canvasContext(): CanvasContext { return this._canvasContext; }
		get dockerLeftTop(): Docker { return this._dockerlefttop; }
		get dockerLeftBottom(): Docker { return this._dockerleftbottom; }
		get dockerRightTop(): Docker { return this._dockerrighttop; }
		get dockerRightBottom(): Docker { return this._dockerrightbottom; }
    }
}