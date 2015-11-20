module Animate
{
	export class ProjectLoaderEvents extends ENUM
	{
		constructor( v: string ) { super( v ); }

		static READY: ProjectLoaderEvents = new ProjectLoaderEvents( "project_loader_ready" );
		static FAILED: ProjectLoaderEvents = new ProjectLoaderEvents( "project_loader_failed" );
	}

	export class ProjectLoaderEvent extends Event
	{
		public message: string;

		constructor( eventType: ProjectLoaderEvents, message : string )
		{
			super( eventType, message );
			this.message = message;
		}

		static READY: ProjectLoaderEvents = new ProjectLoaderEvents( "ready" );
		static FAILED: ProjectLoaderEvents = new ProjectLoaderEvents( "failed" );
	}

	/**
	* The Project loader is a small component that is used to show the downloading and loading
	* of projects/plugins into the current workspace.
	*/
    export class ProjectLoader extends Component
	{
		private _buildEntries: Array<any>;
		private _loadedCount: number;
		private _errorOccured: boolean;
		//private _loaderProxy: any;
		private _reloadProxy: any;

		/**
		* @param {Component} parent The parent of the button
		*/
		constructor(  parent: Component )
		{
            super("<div class='project-loader'></div>", parent );
            
            this._buildEntries = [];
            //this._loaderProxy = jQuery.proxy(this.onData, this);
            this._reloadProxy = jQuery.proxy(this.onButtonClick, this);
            this._loadedCount = 0;
            this._errorOccured = false;
		}

        /** Use this function to get a list of the dependencies the project has associated with itself.*/
       updateDependencies()
		{
			//Add new entries
			var componentCounter = 0;

			var children = this.children;
			var i = children.length;
			while ( i-- )
			{
				children[i].element.off( "click", this._reloadProxy );
				children[i].dispose();
			}

			var plugins = User.get.project.plugins;

			//Add the localally installed plugins
			for ( var i = 0; i < plugins.length; i++ ) 
			{
				var comp : Component = new Component( "<div class='build-entry'><img class='loader-cog-slow' src='media/cog-small-tiny.png' />" + plugins[i].name + "<span class='loading fade-animation'> - loading...</span></div>", this );
				this._buildEntries[componentCounter] = comp;

                // TODO: Figure out how to load a plugin?
                // comp.element.data("url", plugins[i].path);
				//comp.element.data( "css", plugins[i].css );


				var reloadButton = new Button( "Reload", comp );
				reloadButton.css( { "margin": "5px 10px 0 0", "width": "50px", "height": "18px", "float": "right" });
				reloadButton.element.hide();

				reloadButton.element.on( "click", this._reloadProxy );

				comp.element.data( "button", reloadButton );

				componentCounter++;
			}
		}

        /** When we click a reload button we reload the build. */
       onButtonClick( e )
		{
			var comp = jQuery( e.currentTarget ).data( "component" );
			var url = comp.element.parent().data( "url" );
		   var loader = new AnimateLoader( "" )
			loader.on( LoaderEvents.COMPLETE, this.onData, this );
			loader.on( LoaderEvents.FAILED, this.onData, this );

			loader.dataType = "text";
			comp.element.parent().data( "loader", loader );
			comp.enabled( false );
			jQuery( ".loading", comp.element.parent() ).show();
			loader.load( url, null, 1 );
		}

        /** Gets the loader to load the individual projects. */
       startLoading()
		{
			this._loadedCount = 0;
			this._errorOccured = false;
			var manager: PluginManager = PluginManager.getSingleton();

			for ( var i = 0; i < this._buildEntries.length; i++ )
			{
				var url = this._buildEntries[i].element.data( "url" );
				
				var loader = new AnimateLoader("");
				this._buildEntries[i].element.data( "loader", loader );

				//Check if we have already loaded this script before
				var ii = manager.loadedPlugins.length;
				var loadedScript = null;
				//while ( ii-- )
				//	if ( manager.loadedPlugins[ii].url == url )
				//	{
				//		loadedScript = manager.loadedPlugins[ii];
				//		break;
				//	}

				//If already loaded - just re-instanciate the plugin
				if ( loadedScript )
				{
					var button = this._buildEntries[i].element.data( "button" );

					// Remove the loading text
					jQuery( ".loading", this._buildEntries[i].element ).hide();
					button.element.fadeOut();

					//Make the row image a tick
					jQuery( "img", this._buildEntries[i].element ).attr( "src", "media/tick-20.png" );
					jQuery( "img", this._buildEntries[i].element ).removeClass( "loader-cog-slow" );

					manager.preparePlugin( loadedScript.plugin, false );

					this._loadedCount++;
					if ( this._loadedCount >= this._buildEntries.length )
						this.emit( new ProjectLoaderEvent( ProjectLoaderEvents.READY, "Plugins loaded." ) ); 

				}
				else if ( jQuery.trim( url ) != "" )
				{
					loader.dataType = "script";
					loader.on( LoaderEvents.COMPLETE, this.onData, this );
					loader.on( LoaderEvents.FAILED, this.onData, this );
					loader.load( url, null, 1 );

					var css = this._buildEntries[i].element.data( "css" );
					if ( css && css != "" )
					{
						var cssLink = $( "<link rel='stylesheet' type='text/css' href='" + css + "'>" );
						jQuery( "head" ).append( cssLink );
					}					
				}
				else
					this.onData( LoaderEvents.COMPLETE, null, loader );
			}
		}

        /** When one of the loaders returns from its request.*/
       onData( response : LoaderEvents, event : AnimateLoaderEvent, sender? : EventDispatcher )
		{
			this._loadedCount++;


			if ( response == LoaderEvents.COMPLETE )
			{
				for ( var i = 0; i < this._buildEntries.length; i++ )
				{
					var loader = this._buildEntries[i].element.data( "loader" );
					var button = this._buildEntries[i].element.data( "button" );
					if ( sender == loader || loader == null )
					{
						// Remove the loading text
						jQuery( ".loading", this._buildEntries[i].element ).hide();
						button.element.fadeOut();

						//Make the row image a tick
						jQuery( "img", this._buildEntries[i].element ).attr( "src", "media/tick-20.png" );
						jQuery( "img", this._buildEntries[i].element ).removeClass( "loader-cog-slow" );


						var manager: PluginManager = PluginManager.getSingleton();
						//manager.loadedPlugins[manager.loadedPlugins.length - 1].url = ( <AnimateLoader>sender).url;

						////Now we have some text loaded - lets add it to the DOM and run it.
						//jQuery( "body" ).append( "<script type='text/javascript'>" + event.tag + "</script>" )

	        }
				}
			}
			else
			{
				this._errorOccured = true;

				//Get the buttons and loaders
				for ( var i = 0; i < this._buildEntries.length; i++ )
				{
					var loader = this._buildEntries[i].element.data( "loader" );
					var button = this._buildEntries[i].element.data( "button" );

					button.enabled( true );
					if ( sender == loader )
					{
						jQuery( "img", this._buildEntries[i].element ).attr( "src", "media/cross-20.png" );
						jQuery( "img", this._buildEntries[i].element ).removeClass( "loader-cog-slow" );
						jQuery( ".loading", this._buildEntries[i].element ).hide();
						button.element.fadeIn();
						break;
					}
				}
			}

			if ( this._loadedCount >= this._buildEntries.length )
				this.emit( new ProjectLoaderEvent( ProjectLoaderEvents.READY, "Plugins loaded." ) );
	   }

		get errorOccured(): boolean { return this._errorOccured; }
	}
}