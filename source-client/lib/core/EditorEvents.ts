module Animate
{
	export class EditorEvents extends ENUM
	{
		constructor( v: string ) { super( v ); }

		/**
		* This is called when the project is exporting the data object to the server. 
		* The token object passed to this function contains all the information needed to run the project in an Animate runtime.
		* Associate event type is {EditorExportingEvent}
		*/
		static EDITOR_PROJECT_EXPORTING: EditorEvents = new EditorEvents( "editor_project_exporting" );

		/**
		* This function is called by Animate when everything has been loaded and the user is able to begin their session. Associate event type is {Event}
		*/
		static EDITOR_READY: EditorEvents = new EditorEvents( "editor_ready" );

		/**
		* This function is called by Animate when the run button is pushed.
		*/
		static EDITOR_RUN: EditorEvents = new EditorEvents( "editor_run" );

		static PORTAL_ADDED: EditorEvents = new EditorEvents( "portal_added" );
		static PORTAL_REMOVED: EditorEvents = new EditorEvents( "portal_removed" );
		static PORTAL_EDITED: EditorEvents = new EditorEvents( "portal_edited" );

		
		/**
		* This is called by Animate when we a container is created. Associate event type is {ContainerEvent}
		*/
		static CONTAINER_CREATED: EditorEvents = new EditorEvents( "plugin_container_created" );

		/**
		* This is called by Animate when we a container is deleted. Associate event type is {ContainerEvent}
		*/
		static CONTAINER_DELETED: EditorEvents = new EditorEvents( "plugin_container_deleted" );

		
		/**
		* This is called by Animate when we select a container. Associate event type is {ContainerEvent}
		*/
		static CONTAINER_SELECTED: EditorEvents = new EditorEvents( "plugin_container_selected" );

		/**
		* This is called by Animate when we are exporting a container. The token that gets passed should be used to store any optional
		* data with a container. Associate event type is {ContainerDataEvent}
		*/
		static CONTAINER_EXPORTING: EditorEvents = new EditorEvents( "plugin_container_exporting" );

		/**
		* This is called by Animate when we are saving a container. The token that gets passed should be used to store any optional
		* data with a container.This can be later, re - associated with the container when onOpenContainer is called. Associate event type is {ContainerDataEvent}
		*/
		static CONTAINER_SAVING: EditorEvents = new EditorEvents( "plugin_container_saving" );
				
		/**
		* This is called by Animate when we are opening a container. The token that gets passed is filled with optional
		* data when onSaveContainer is called. Associate event type is {ContainerDataEvent}
		*/
		static CONTAINER_OPENING: EditorEvents = new EditorEvents( "plugin_container_opening" );

		/**
		* Called when an asset is renamed. Associate event type is {AssetRenamedEvent}
		*/
		static ASSET_RENAMED: EditorEvents = new EditorEvents( "plugin_asset_renamed" );

		/**
		* Called when an asset is selected in the editor. Associate event type is {AssetEvent}
		*/
		static ASSET_SELECTED: EditorEvents = new EditorEvents( "plugin_asset_selected" );

		/**
		* Called when an asset property is edited by the property grid. Associate event type is {AssetEditedEvent}
		*/
		static ASSET_EDITED: EditorEvents = new EditorEvents( "plugin_asset_edited" );

		/**
		* Called when an asset is added to a container. Associate event type is {AssetContainerEvent}
		*/
		static ASSET_ADDED_TO_CONTAINER: EditorEvents = new EditorEvents( "plugin_asset_added_to_container" );

		/**
		* Called when an asset is removed from a container. Associate event type is {AssetContainerEvent}
		*/
		static ASSET_REMOVED_FROM_CONTAINER: EditorEvents = new EditorEvents( "plugin_asset_removed_from_container" );

		/**
		* Called when an asset is created. Associate event type is {AssetCreatedEvent}
		*/
		static ASSET_CREATED: EditorEvents = new EditorEvents( "plugin_asset_created" );

		/**
		* Called just before an asset is saved to the server. Associate event type is {AssetEvent}
		*/
		static ASSET_SAVING: EditorEvents = new EditorEvents( "plugin_asset_saving" );

		/**
		* Called when an asset is loaded from the database. Associate event type is {AssetEvent}
		*/
		static ASSET_LOADED: EditorEvents = new EditorEvents( "plugin_asset_loaded" );

		/**
		* Called when an asset is disposed off. Associate event type is {AssetEvent}
		*/
		static ASSET_DESTROYED: EditorEvents = new EditorEvents( "plugin_asset_destroyed" );

		/**
		* Called when an asset is copied in the editor. Associate event type is {AssetCopiedEvent}
		*/
		static ASSET_COPIED: EditorEvents = new EditorEvents( "plugin_asset_copied" );
	}

	

	/**
	* Called when an editor is being exported
	*/
	export class EditorExportingEvent extends Event
	{
		/**
		* @param {any} token The token object passed to this function contains all the information needed to run the project in an Animate runtime.
		*/
		public token: any;

		constructor( token: any )
		{
			super( EditorEvents.EDITOR_PROJECT_EXPORTING, null );
			this.token = token;
		}
	}

	/**
	* BehaviourContainer associated events
	*/
	export class ContainerEvent extends Event
	{
		/**
		* {BehaviourContainer} container The container associated with this event
		*/
		public container: Container;

		constructor( eventName: EditorEvents, container: Container )
		{
			super( eventName, null );
			this.container = container;
		}
	}

	
	/**
	* Events associated with BehaviourContainers and either reading from, or writing to, a data token
	*/
	export class ContainerDataEvent extends Event
	{
		/**
		* {BehaviourContainer} container The container associated with this event
		*/
		public container: Container;

		/**
		* {any} token The data being read or written to
		*/
		public token: any;

		/**
		* {{ groups: Array<string>; assets: Array<number> }} sceneReferences [Optional] An array of scene asset ID's associated with this container
		*/
		public sceneReferences: { groups: Array<string>; assets: Array<number> };

		constructor( eventName: EditorEvents, container: Container, token: any, sceneReferences?: { groups: Array<string>; assets: Array<number> } )
		{
			super( eventName, null );
			this.container = container;
			this.token = token;
			this.sceneReferences = sceneReferences;
		}
	}

	/**
	* Asset associated events
	*/
	export class AssetEvent extends Event
	{
		/**
		* {Asset} asset The asset associated with this event
		*/
		public asset: Asset;

		constructor( eventName: EditorEvents, asset: Asset )
		{
			super( eventName, null );
			this.asset = asset;
		}
	}

	/**
	* Called when an asset property is edited by the property grid
	*/
	export class AssetEditedEvent extends AssetEvent
	{
		/**
		* {string} propertyName The name of the property that was edited
		*/
		public propertyName: string;

		/**
		* {any} newValue The updated value
		*/
		public newValue: any;

		/**
		* {any} oldValue The previous value
		*/
		public oldValue: any;

		/**
		* {ParameterType} type The parameter type of property
		*/
		public type: ParameterType;

		constructor( eventName: EditorEvents, asset: Asset, propertyName, newValue : any, oldValue : any, type : ParameterType )
		{
			super( eventName, asset );
			this.propertyName = propertyName;
			this.newValue = newValue;
			this.oldValue = oldValue;
			this.type = type;
		}
	}

	/**
	* Called when an asset is created
	*/
	export class AssetCreatedEvent extends AssetEvent
	{
		/**
		* {string} name The name of the asset
		*/
		public name: string;

		constructor( asset: Asset, name: string )
		{
			super( EditorEvents.ASSET_CREATED, asset );
			this.name = name;
		}
	}

	/**
	* Called when an asset is renamed
	*/
	export class AssetRenamedEvent extends AssetEvent
	{
		/**
		* {string} oldName The old name of the asset
		*/
		public oldName: string;

		constructor( asset: Asset, oldName: string )
		{
			super( EditorEvents.ASSET_RENAMED, asset );
			this.oldName = oldName;
		}
	}
	

	/**
	* Events assocaited with Assets in relation to BehaviourContainers
	*/
	export class AssetContainerEvent extends AssetEvent
	{
		/**
		* {BehaviourContainer} container The container assocaited with this event
		*/
		public container: Container;

		constructor( eventName: EditorEvents, asset: Asset, container: Container )
		{
			super( eventName, asset );
			this.container = container;
		}
	}


	/**
	* Portal associated events
	*/
	export class PluginPortalEvent extends Event
	{
		public oldName: string;
		public container: Container;
		public portal: Portal;
		public canvas: Canvas;

		constructor( eventName: EditorEvents, oldName: string, container: Container, portal: Portal, canvas: Canvas )
		{
			super( eventName, null );
			this.oldName = oldName;
			this.container = container;
			this.portal = portal;
			this.canvas = canvas;
		}
	}
}