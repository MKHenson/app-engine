namespace Animate {

    /**
     * Describes all the different types of editor events
     */
    export type EditorEventType =
        'change' |
        'focus-node' |

        'editor_project_exporting' |
        'editor_ready' |
        'editor_run' |
        'plugin_container_exporting' |
        'plugin_container_saving' |
        'plugin_container_opening' |
        'plugin_asset_renamed' |
        'plugin_asset_selected' |
        'plugin_asset_edited' |
        'plugin_asset_added_to_container' |
        'plugin_asset_removed_from_container' |
        'plugin_asset_saving' |
        'plugin_asset_loaded' |
        'plugin_asset_destroyed' |
        'plugin_asset_copied';

    export type SocketEvents = 'Error' | UsersInterface.SocketTokens.ClientInstructionType;

    export type ResourceEvents =
        'created' |
        'edited' |
        'refreshed' |
        'modified' |
        'disposed';

    export type WorkspaceEvents =
        'change';

    export type PluginManagerEvents =
        'template-created' |
        'template-removed' |
        'editor-ready';

    /**
     * Events dispatched by a treeview
     */
    export type TreeviewEvents =
        'change' |
        'focus-node';

    export interface ITemplateEvent {
        template: BehaviourDefinition;
    }

    export interface IResourceEvent {
        resource: ProjectResource<Engine.IResource>;
    }

    /**
	 * Valid response codes for requests made to the Animate server
	 */
    export type AnimateLoaderResponses =
        'success' |
        'error';

    /**
	* Valid response codes for xhr binary requests
	*/
    export type BinaryLoaderResponses =
        'binary_success' |
        'binary_error';

    /**
	 * Valid response codes for requests made to the Animate server
	 */
    export type LoggerEvents =
        'change';

    /**
	 * Basic set of loader events shared by all loaders
	 */
    export type LoaderEvents  =
        'complete' |
        'failed';

    export type ComponentEvents =
        'component_updated';

    export type OkCancelFormEvents =
        'ok_cancel_confirm';

    /**
	 * Events associated with xhr binary requests
	 */
    export interface INodeEvent {
        node: TreeNodeModel;
    }

    export interface ISocketEvent {
        error?: Error;
        json?: UsersInterface.SocketTokens.IToken;
    }

    /**
	 * Events associated with xhr binary requests
	 */
    export interface BinaryLoaderEvent {
        buffer: ArrayBuffer;
        message: string;
    }

    /**
	 * Events associated with requests made to the animate servers
	 */
    export interface AnimateLoaderEvent {
        message: string;
        return_type: AnimateLoaderResponses;
        data: any;
        tag: any;
    }

    export interface OkCancelFormEvent {
        text: string;
        cancel: boolean;
    }

    export interface ContainerEvent {
        container: Resources.Container;
    }

    export interface ImportExportEvent {
        live_link: any;
    }

	/**
	* Called when an editor is being exported
	*/
    export interface EditorExportingEvent  {
         token: any;
    }

	/**
	* Events associated with Containers and either reading from, or writing to, a data token
	*/
    export interface ContainerDataEvent {
		/**
		* {Container} container The container associated with this event
		*/
        container: Resources.Container;

		/**
		* {any} token The data being read or written to
		*/
        token: any;

		/**
		* {{ groups: Array<string>; assets: Array<number> }} sceneReferences [Optional] An array of scene asset ID's associated with this container
		*/
        sceneReferences: { groups: Array<number>; assets: Array<number> };
    }

	/**
	* Asset associated events
	*/
    export interface AssetEvent {
		/**
		* {Asset} asset The asset associated with this event
		*/
        asset: Resources.Asset;
    }

	/**
	* Called when an asset is renamed
	*/
    export interface AssetRenamedEvent {
		/**
		* {string} oldName The old name of the asset
		*/
        oldName: string;
    }


	/**
	* Events assocaited with Assets in relation to Containers
	*/
    export interface AssetContainerEvent {
		/**
		* {Container} container The container assocaited with this event
		*/
        container: Resources.Container;
    }


	/**
	* Portal associated events
	*/
    export interface PortalEvent {
        container: Resources.Container;
        portal: Portal;
        oldName: string;
    }

    export interface WindowEvent {
        window: Window;
    }

    export interface ToolbarNumberEvent {
        value: number;
    }

    export interface ToolbarDropDownEvent {
        item: ToolbarItem;
    }

    export interface EditEvent {
        property: Prop<any>;
        set: EditableSet;
    }

    export interface TabEvent {
        cancel: boolean;
        pair: TabPair;
    }

    export interface CanvasEvent {
        canvas: Canvas;
    }

    /**
	* A simple project event. Always related to a project resource (null if not)
	*/
    export class ProjectEvent<T extends ProjectResource<Engine.IResource>> {
        resource: T;
    }

    /**
	* An event to deal with file viewer events
    * The event type can be 'cancelled' or 'change'
	*/
    export interface FileViewerEvent {
        file: Engine.IFile;
    }
}