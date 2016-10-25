
/**
 * Events related to the web socket communication API
 */
export type SocketEvents =
    'Error' |
    UsersInterface.SocketTokens.ClientInstructionType;

// TODO: Can probably be refactored
export type ProjectEvents =
    'change' |
    'editor-created' |
    'editor-removed' |
    'resource-created' |
    'resource-removed' |
    'saved' |
    'saved_all' |
    'failed' |
    'build_selected' |
    'build_saved';

/**
 * Events related to project resources
 */
export type ResourceEvents =
    'edited' |
    'refreshed' |
    'modified';

/**
 * Events related to the resource editors
 */
export type EditorEvents =
    'change';

/**
 * Events related to the plugin manager
 */
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

/**
 * An event object dispatched by the PluginManager for template related events
 */
export interface ITemplateEvent {
    template: BehaviourDefinition;
}

/**
 * An event token for events dispatched by changes to or from resources
 */
export interface IResourceEvent {
    resource: ProjectResource<HatcheryServer.IResource>;
}

/**
 * An event token for events dispatched by changes to or from project containers
 */
export interface IContainerEvent {
    container: Resources.Container;
}

/**
 * An event token for events dispatched by changes to or from project editors
 */
export interface IEditorEvent {
    editor: Editor;
}

/**
 * TODO: Can probably be removed
 * Valid response codes for requests made to the Animate server
 */
export type AnimateLoaderResponses =
    'success' |
    'error';

/**
 * TODO: Can probably be removed
 * Valid response codes for xhr binary requests
 */
export type BinaryLoaderResponses =
    'binary_success' |
    'binary_error';

/**
 * Event types for logger based events
 */
export type LoggerEvents =
    'change';

/**
 * Basic set of loader events shared by all loaders
 * TODO: Can probably be removed
 */
export type LoaderEvents =
    'complete' |
    'failed';

/**
 * An event token for TreeNodeModel related events
 */
export interface INodeEvent {
    node: TreeNodeModel;
}

/**
 * An event token for socket API related events
 */
export interface ISocketEvent {
    error?: Error;
    json?: UsersInterface.SocketTokens.IToken;
}

/**
 * TODO: Can probably be removed
 * Events associated with xhr binary requests
 */
export interface BinaryLoaderEvent {
    buffer: ArrayBuffer | null;
    message: string;
}

/**
 * TODO: Can probably be removed
 * Events associated with requests made to the animate servers
 */
export interface AnimateLoaderEvent {
    message: string;
    return_type: AnimateLoaderResponses;
    data: any;
    tag: any;
}