//module Animate
//{
//	export class PluginBrowserEvents extends ENUM
//	{
//		constructor( v: string ) { super( v ); }

//		static UPDATED: PluginBrowserEvents = new PluginBrowserEvents( "plugin_browser_updated" );
//		static PLUGINS_IMPLEMENTED: PluginBrowserEvents = new PluginBrowserEvents( "plugin_browser_implemented" );
//		static FAILED: PluginBrowserEvents = new PluginBrowserEvents( "plugin_browser_failed" );
//	}

//	export class PluginBrowserEvent extends Event
//	{
//		public message: string;
//		public data: any;

//		constructor( eventName: PluginBrowserEvents, message:string, data: any )
//		{
//			super( eventName, data );
//			this.message = message;
//			this.data = data;
//		}
//	}

//	/**
//	* A small class for browsing the available plugins
//	*/
//	export class PluginBrowser extends Component
//	{
//		private pluginList: Component;
//		private help: Component;
//		private projectNext: Button;
//		private newPlugsLower: Component;
//		private selectedFilter: JQuery;
//		private leftTop: Component;
//		//private mServerProxy: any;
//		private mRequest: string;

//		/**
//		* @param {Component} parent The parent of the button
//		*/
//		constructor( parent: Component )
//		{
//			// Call super-class constructor
//			super( "<div class='project-explorer'></div>", parent );

//			//Create left and right panels
//			var leftComp : Component = <Component>this.addChild( "<div class='project-explorer-section project-explorer-left'></div>" );
//			var rightComp: Component = <Component>this.addChild( "<div class='project-explorer-section project-explorer-right'></div>" );
//			this.element.append( "<div class='fix'></div>" );

//			this.leftTop = <Component>leftComp.addChild( "<div></div>" );

//			this.pluginList = <Component>leftComp.addChild( "<div class='plugin-list'></div>" );
//			var pluginHelp : Component = <Component>leftComp.addChild( "<div class='plugin-help'></div>" );
//			var comp = new Label( "Plugin Description", pluginHelp )
//			comp.element.addClass( "heading" );
//			this.help = <Component>pluginHelp.addChild( "<div class='info-clock'></div>" );

//			//Heading - right
//			var comp = new Label( "Add Plugins", rightComp );
//			comp.element.addClass( "heading" );
//			comp.textfield.element.prepend( "<img src='media/add-behaviour.png' />" );

//			this.projectNext = new Button( "Done", rightComp );
//			this.projectNext.css( { width: 120, height: 40, "float": "right", position: "absolute", left: "265px", top: "4px" });
//			this.projectNext.element.on( "click", jQuery.proxy( this.onNextClick, this ) );

//			var newPlugs : Component = <Component>rightComp.addChild( "<div class='new-plugins'></div>" );
//			var newPlugsHeader: Component = <Component>newPlugs.addChild( "<div class='new-plugins-header'></div>" );
//			this.newPlugsLower = <Component>newPlugs.addChild( "<div class='new-plugins-lower'></div>" );

//			//newPlugsHeader.element.disableSelection( true );
//			newPlugsHeader.addChild( "<div class='filter-item' style='pointer-events:none;'>Filters</div>" );
//			this.selectedFilter = newPlugsHeader.addChild( "<div class='filter-item filter-item-selected'>Name</div>" ).element;
//			newPlugsHeader.addChild( "<div class='filter-item'>version</div>" );
//			newPlugsHeader.addChild( "<div class='filter-item'>Author</div>" );

//			newPlugsHeader.element.on( "click", jQuery.proxy( this.onFilterClick, this ) );

//			//Server related
//			//this.mServerProxy = this.onServer.bind( this );
//			this.mRequest = "";
//		}

//		/**
//		* When we click a filter button
//		* @param {any} e The jQuery event object
//		*/
//		onFilterClick( e )
//		{
//			var t : JQuery = jQuery( e.target );

//			if ( !t.hasClass( "filter-item" ) )
//				return;

//			if ( this.selectedFilter != null )
//				this.selectedFilter.removeClass( "filter-item-selected" );

//			this.selectedFilter = t;
//			this.selectedFilter.addClass( "filter-item-selected" );

//			//Now create each of the plugin items for the actual plugins we can load.
//			this.resetAvailablePlugins();
//		}

//		/**
//		* Resets the component and its data
//		*/
//		reset()
//		{
//			this.leftTop.clear();
//			this.leftTop.addChild( "<div><div class='proj-info-left'><img src='media/project-item.png'/></div>" +
//				"<div class='proj-info-right'>" +
//                "<div class='name'>Name: " + User.get.project.entry.name + "</div>" +
//                "<div class='owner'>User: " + User.get.userEntry.username + "</div>" +
//                "<div class='created-by'>Last Updated: " + new Date(User.get.project.entry.lastModified ).toDateString() + "</div>" +
//				"</div></div><div class='fix'></div>" );

//			this.pluginList.clear();

//			var comp = new Label( "Project Plugins", this.pluginList )
//			comp.element.addClass( "heading" );
//			comp.element.css( { "pointer-events": "none" });


//            var plugins: Array<Engine.IPlugin> = User.get.project.plugins;			
//			var user : User = User.get;

//			//Create each of the plugin items that the user has set
//			for ( var i = 0, l = plugins.length; i < l; i++ )
//            {
//                if (plugins[i].plan <= user.meta.plan)
//					this.addProjectPluginComp( plugins[i] );
//            }

//			//Now create each of the plugin items for the actual plugins we can load.
//			this.resetAvailablePlugins();

//		}

//		/**
//		* Adds a plugin component
//		* @param {IPlugin} plugin 
//		*/
//        addProjectPluginComp(plugin: Engine.IPlugin )
//		{
//			var item = this.pluginList.addChild( "<div class='plugin-item'><div class='inner'><img src='" + plugin.image + "'>" + plugin.name + "</div><div class='close-but'>X</div><div class='fix'></div></div>" );

//			item.element.insertAfter( jQuery( ".heading", this.pluginList.element ) );
//			item.element.on( "mouseover", jQuery.proxy( this.onOverProject, this ) );
//			item.element.data( "plugin", plugin );
//			//item.element.disableSelection( true );

//			jQuery( ".close-but", item.element ).click( jQuery.proxy( this.onRemoveProject, this ) );
//			var alreadyHasPlugin: boolean = false;

//			//Remove any duplicates
//			var userPlugins = User.get.project.plugins;
//			if ( userPlugins.indexOf( plugin ) == -1 )
//				User.get.project.plugins.push( plugin );

//			return item;
//		}

//		/**
//		* Resets the component and fills it with user plugin data
//		*/
//		resetAvailablePlugins()
//		{
//			var userPlugins = User.get.project.plugins;
//			this.projectNext.enabled = true;

//			this.newPlugsLower.clear();
//			var selectedFilter : JQuery = this.selectedFilter;

//            // TODO : Figure out if we're keeping this



//			////Sort based on the filter
//   //         __plugins.sort(function (a: Engine.IPlugin, b: Engine.IPlugin )
//			//{
//			//	var nameA = a.name.toLowerCase();
//			//	var nameB = b.name.toLowerCase();

//			//	if ( selectedFilter.text() == "Name" )
//			//	{
//			//		nameA = a.name.toLowerCase();
//			//		nameB = b.name.toLowerCase();
//			//	}
//			//	else if ( selectedFilter.text() == "Version" )
//			//	{
//			//		nameA = a.version.toLowerCase();
//			//		nameB = b.version.toLowerCase();
//			//	}
//			//	else if ( selectedFilter.text() == "Author" )
//			//	{
//			//		nameA = a.author.toLowerCase();
//			//		nameB = b.author.toLowerCase();
//			//	}

//			//	if ( nameA < nameB ) //sort string ascending
//			//		return -1;

//			//	if ( nameA > nameB )
//			//		return 1;

//			//	return 0; 
//			//});

//   //         var userPlan: UserPlan = User.get.meta.plan;
            
//			//var len : number = __plugins.length;
//			//for ( var i = 0; i < len; i++ )
//			//{
//   //             //Only allow plugins based on your plan.
//   //             //if (userPlan != UserPlan.Gold && userPlan != UserPlan.Platinum && __plugins[i].plan == userPlan )
//			//	//	continue;

//			//	var alreadyAdded : boolean = false;
//			//	var ii : number = ( userPlugins ? userPlugins.length : 0 );
//			//	while ( ii-- )
//			//		if ( userPlugins[ii].name == __plugins[i].name )
//			//		{
//			//			alreadyAdded = true;
//			//			break;
//			//		}

//			//	if ( alreadyAdded )
//			//		continue;

  
//				//var item : Component = <Component>this.newPlugsLower.addChild( "<div class='plugin-item'>" +
//				//	"<div class='inner'><div class='left'><img src='" + __plugins[i].image + "' /></div>" +
//				//	"<div class='right'>" +
//				//	"<div class='name'>" + __plugins[i].name + "</div>" +
//				//	"<div class='owner'>Created by " + __plugins[i].author + "</div>" +
//				//	"<div class='created-by'>Version: " + __plugins[i].version + "</div>" +
//    //                //"<div class='desc'>" + __plugins[i].shortDescription + "</div>" +
//    //                "<div class='desc'>" + __plugins[i].description + "</div>" +
//				//	"</div>" +
//				//	"<div class='fix'></div></div><div class='fix'></div>" );

//				// item.element.on( "mouseover", jQuery.proxy( this.onOverProject, this ) );
//				// item.element.on( "click", jQuery.proxy( this.onClickProject, this ) );
//				// item.element.data( "plugin", __plugins[i] );
//				//item.element.disableSelection( true );
//			// }
//		}

//		/**
//		* When we hover over a project
//		* @param {any} e The jQuery event object
//		*/
//		onOverProject( e : any )
//		{
//            var plugin: Engine.IPlugin = jQuery( e.currentTarget ).data( "plugin" );
//			if ( plugin )
//				this.help.element.html( plugin.description );
//		}

//		/**
//		* When we click the X on a project's plugin
//		* @param {any} e The jQuery event object
//		*/
//		onRemoveProject( e: any )
//		{
//			var comp = jQuery( e.currentTarget ).parent().data( "component" );
//			var parent = this.pluginList;

//            var plugin: Engine.IPlugin = comp.element.data( "plugin" );
//			var userPlugins = User.get.project.plugins;
//			var i = userPlugins.length;
//			while ( i-- )
//				if ( userPlugins[i].name == plugin.name )
//				{
//					userPlugins.splice( i, 1 );
//					break;
//				}

//			//Remove left item
//			comp.element.fadeOut( "slow", function ()
//			{
//				parent.removeChild( comp );
//				comp.dispose();
//			});

//			//Reset the available plugins
//			var browser = this;
//			this.newPlugsLower.element.fadeOut( "slow",
//				function ()
//				{
//					browser.resetAvailablePlugins();
//					browser.newPlugsLower.element.fadeIn( "slow" );
//				});
//		}

//		/**
//		* When we click on a projects plugin
//		* @param {any} e The jQuery event object
//		*/
//		onClickProject( e: any )
//		{
//			var parent : Component = this.newPlugsLower;
//			var comp : Component = jQuery( e.currentTarget ).data( "component" );
//            var plugin: Engine.IPlugin = jQuery( e.currentTarget ).data( "plugin" );
//			if ( plugin )
//			{
//				var addedComp = this.addProjectPluginComp( plugin );

//				addedComp.element.hide();
//				addedComp.element.fadeIn( "slow" );
//				comp.element.css( "pointer-events", "none" );
//				comp.element.fadeOut( "slow", function () { parent.removeChild( comp ).dispose(); });
//			}
//		}

//		/**
//		* When we click the next button
//		* @param {any} e The jQuery event object
//		*/
//		onNextClick( e: any )
//		{
//			var userPlugins = User.get.project.plugins;

//			if( userPlugins.length == 0 )
//			{
//				MessageBox.show("You must select at least 1 plugin before you can continue.", ["Ok"], null, null );
//				return;
//			}

//			this.projectNext.enabled = false;

//			//Implement changes into DB
//			var projectStr = "";
//			var data = {};
//            data["projectId"] = User.get.project.entry._id;

//			var plugins = [];

//			//Create a multidimension array and pass each of the plugins in
//			for ( var i = 0, l = userPlugins.length; i < l; i++ )
//				plugins[i] = userPlugins[i]._id;

//			data["plugins"] = plugins;

//			var loader = new AnimateLoader();
//			loader.on( LoaderEvents.COMPLETE, this.onServer, this );
//			loader.on( LoaderEvents.FAILED, this.onServer, this );
//			loader.load( "/project/implement-plugins", data );
//		}

//		/** 
//		* This is the resonse from the server
//		*/
//		onServer( response: LoaderEvents, event: AnimateLoaderEvent, sender? : EventDispatcher )
//		{
//			var loader: AnimateLoader = <AnimateLoader>sender;

//			if ( response == LoaderEvents.COMPLETE )
//			{
//				if ( loader.url == "/project/implement-plugins" )
//				{
//					if (event.return_type == AnimateLoaderResponses.ERROR )
//					{
//						this.emit( new PluginBrowserEvent( PluginBrowserEvents.FAILED, event.message, event.tag ) );
//						MessageBox.show(event.message, ["Ok"], null, null );
//						this.projectNext.enabled = true;
//					}
//					else
//					{
//						//Say we're good to go!
//						this.emit( new PluginBrowserEvent( PluginBrowserEvents.PLUGINS_IMPLEMENTED, event.message, event.tag ) );
//					}
//				}
//			}
//			else 
//			{
//				//Failed - so we don't show anything
//				this.emit( new PluginBrowserEvent( PluginBrowserEvents.FAILED, event.message, event.tag ) );
//				this.projectNext.enabled = true;
//			}
//		}
//	}
//}