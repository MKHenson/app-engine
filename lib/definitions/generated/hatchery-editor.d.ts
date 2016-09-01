declare module Engine {
    // Extends the IProject interface to include additional data
    export interface IProject {
        $plugins?: Array<IPlugin>;
    }

    // Extends the IPlugin interface to include additional data
    export interface IPlugin {
        $loaded?: boolean;
        $error?: string;
        $instance?: Animate.IPlugin;
    }
}
declare module Animate {
    /**
    * A simple interface for any component
    */
    export interface IComponent {
        element: JQuery;
        parent: IComponent;
        dispose(): void;
        addChild(child: string): IComponent;
        addChild(child: IComponent): IComponent;
        addChild(child: any): IComponent;
        removeChild(child: IComponent): IComponent
        update(): void;
        selected: boolean;
        savedID: string;
        id: string;
        children: Array<IComponent>;
        clear(): void;
        disposed: boolean;
        onDelete(): void;
    }

    /**
     * Describes the base type used in drag and drop communication
     */
    export interface IDragDropToken {
        type: 'resource' | 'template' | 'container' | 'other';
        id? : string | number;
    }

    /**
	* The IPlugin interface defines how a plugin interacts with app-engine
	*/
    export interface IPlugin {
		/**
		* This function is called by Animate to get an array of
		* behvaiour definitions. These definitions describe what kind
		* behvaiours a user can create in the scene.
		* @returns {Array<BehaviourDefinition>}
		*/
        getBehaviourDefinitions(): Array<BehaviourDefinition>;

		/**
		* This function is called when we need to create a preview for a file that is associated with a project
		* @param {File} file The file that needs to be previewed
		* @param {Component} previewComponent The component which will act as the parent div of the preview.
		* @returns {boolean} Return true if this is handled or false if not.
		*/
        onDisplayPreview(file: Engine.IFile, previewComponent: Component): boolean;

		/**
		* This function is called by Animate to get an array of TypeConverters. TypeConverter objects define if one type can be translated to another. They also define what the process of conversion will be.
		*/
        getTypeConverters(): Array<TypeConverter>;

		/**
		* This function is called by Animate to get an array of
		* AssetsTemplate. The AssetsTemplate object is used to define what assets are available to the scene.
		* Assets are predefined tempaltes of data that can be instantiated. The best way to think of an asset
		* is to think of it as a predefined object that contains a number of variables. You could for example
		* create Assets like cats, dogs, animals or humans. Its really up you the plugin writer how they want
		* to define their assets. This function can return null if no Assets are required.
		* @returns <Array> Returns an array of <AssetTemplate> objects
		*/
        getAssetsTemplate(): Array<AssetTemplate>;

		/**
		* This function is called by Animate when its time to unload a plugin. This should be used
		* to cleanup all resources used by the plugin
		*/
        unload(): void;

		/**
		* Plugins can return an array of extensions that are allowed to be uploaded for Asset files. For example
		* your plugin might require images and so would allow png and jpg files.
		* Each extension must just be in the following format: ["png", "jpg" ..etc]
		* @param {Array<string>} extArray The array of allowed extensions that are so far allowed.
		* @returns {Array<string>} An array of allowed file extensions.
		*/
        getFileUploadExtensions(extArray: Array<string>): Array<string>;
    }

    export type PortalType = 'input' | 'output' | 'parameter' | 'product';
    export type CanvasItemType = 'behaviour' | 'link' | 'asset' | 'shortcut' | 'portal' | 'script' | 'comment' | 'instance';

    /**
	* A basic wrapper for a Portal interface
	*/
    export class IPortal {
        name: string;
        type: PortalType;
        custom: boolean;
        property: any;
    }
    /**
	 * A basic wrapper for a CanvasItem interface
	 */
    export interface ICanvasItem {
        id?: number;
        type?: CanvasItemType;
        left?: number;
        top?: number;
    }

    /**
	* A basic wrapper for a Link interface
	*/
    export interface ILinkItem extends ICanvasItem {
        frameDelay: number;
        startPortal: string;
        endPortal: string;
        startBehaviour: number;
        endBehaviour: number;
    }

    /**
	* A basic wrapper for a Behaviour interface
	*/
    export interface IBehaviour extends ICanvasItem {
        alias: string;
        behaviourType: string;
        portals: Array<IPortal>;
    }

    /**
    * A basic wrapper for a BehaviourPortal interface
    */
    export interface IBehaviourPortal extends IBehaviour {
        portal: IPortal;
    }

    /**
    * A basic wrapper for a BehaviourComment interface
    */
    export interface IBehaviourComment extends IBehaviour {
        width: number;
        height: number;
    }

    /**
	* A basic wrapper for a BehaviourScript interface
	*/
    export interface IBehaviourScript extends IBehaviour {
        scriptId: string;
    }

    /**
	* A basic wrapper for a BehaviourShortcut interface
	*/
    export interface IBehaviourShortcut extends IBehaviour {
        originalId: number;
    }

    /**
	* A basic interface for a container object
	*/
    export interface IContainerToken {
        items: Array<ICanvasItem>;
        properties: any;
    }

    export interface IPreviewFactory {
        /**
        * This function generates a React Element that is used to preview a file
        * @param {Engine.IFile} file The file we are looking to preview
        * @returns {JSX.Element} If a React Element is returned is added in the File viewer preview
        */
        generate(file: Engine.IFile): JSX.Element;

         /**
         * Creates a thumbnail preview of the file
         * @param {Engine.IFile} file
         * @returns {Promise<HTMLCanvasElement>}
         */
        thumbnail(file: Engine.IFile): Promise<HTMLCanvasElement>;
    }

    export interface ISettingsPage extends IComponent {
        onShow(project: Project, user: User);
        name: string;
        onTab(): void;
    }
}
declare module Animate {
	export interface PortalToken {
		name: string;
		type: string;
		dataType: string;
		value: any;
	}

	export interface LinkToken {
		id: string;
		type: string;
		startPortal: string;
		endPortal: string;
		startBehaviour: string;
		endBehaviour: string;
		frameDelay: number;
	}

	export interface BehaviourToken {
		id: string;
		name: string;
		type: string;

		portals: Array<PortalToken>;

		// Portal behaviours
		portalType: string;
		dataType: string;
		value: any;

		// Behaviour Instances
		originalContainerID: number;

		// Behaviour Script
		shallowId: number;
	}

	export interface ContainerToken	{
		name: string;
		id: any;
		behaviours: Array<BehaviourToken>;
		links: Array<LinkToken>;
		assets: Array<number>;
		groups: Array<string>;
		properties: {};
		plugins: {};
	}

	export interface GroupToken {
		name: string;
        id: string;
        items: Array<number>
	}

	export interface AssetToken {
		name: string;
		id: number;
		properties: { [name: string]: any };
		className: string;
		assets: Array<number>;
	}

	export interface ExportToken {
		assets: Array<AssetToken>;
		groups: Array<GroupToken>;
		containers: Array<ContainerToken>;
		converters: {};
		data: {};
	}
}
declare var config: {
    "version": string;
    "userServiceUrl": string;
    "host": string;
};
declare module Animate {
    type CompiledEval = (ctrl, event, elm, contexts) => any;
    interface IDirective {
        expand(expression: string, ctrl: any, desc: DescriptorNode, instance: InstanceNode): Array<AppNode>;
    }
    interface AppNode extends Node {
        $ieTextNodes: Array<AppNode>;
        $expression: string;
        $expressionType: string;
        $compliledEval: {
            [name: number]: CompiledEval;
        };
        $ctxValues: Array<{
            name: string;
            value: any;
        }>;
        $events: Array<{
            name: string;
            tag: string;
            func: any;
        }>;
        $dynamic: boolean;
        $clonedData: any;
    }
    interface InstanceNode extends AppNode {
        $clonedElements: Array<AppNode>;
    }
    interface DescriptorNode extends InstanceNode {
        $originalNode: AppNode;
    }
    interface RootNode extends AppNode {
        $ctrl: any;
        $commentReferences: {
            [id: string]: DescriptorNode;
        };
    }
    interface NodeInput extends HTMLInputElement {
        $error: boolean;
        $autoClear: boolean;
        $validate: boolean;
        $value: string;
    }
    interface NodeForm extends HTMLFormElement {
        $error: boolean;
        $errorExpression: string;
        $errorInput: string;
        $pristine: boolean;
        $autoClear: boolean;
    }
    /**
    * Defines a set of functions for compiling template commands and a controller object.
    */
    class Compiler {
        static directives: {
            [name: string]: IDirective;
        };
        private static attrs;
        private static $commentRefIDCounter;
        static validators: {
            "alpha-numeric": {
                regex: RegExp;
                name: string;
                negate: boolean;
            };
            "non-empty": {
                regex: RegExp;
                name: string;
                negate: boolean;
            };
            "alpha-numeric-plus": {
                regex: RegExp;
                name: string;
                negate: boolean;
            };
            "email-plus": {
                regex: RegExp;
                name: string;
                negate: boolean;
            };
            "email": {
                regex: RegExp;
                name: string;
                negate: boolean;
            };
            "no-html": {
                regex: RegExp;
                name: string;
                negate: boolean;
            };
        };
        /**
        * Clones each of the nodes and their custom attributes
        * @param {Node} node The node to clone
        * @returns {Node}
        */
        static cloneNode(node: AppNode): Node;
        /**
        * Given a string, this function will compile it into machine code that can be stored and run
        * @param {string} script The script to compile
        * @param {AppNode} elm The element whose attributes require the compilation
        * @param {Array<any>} $ctxValues [Optional] Context values passed down from any dynamically generated HTML. The array consists
        * of key object pairs that are translated into variables for use in the script.
        * @returns {CompiledEval}
        */
        private static compileEval(script, elm, $ctxValues?);
        /**
        * Compilers and runs a script which then should return a value
        * @param {string} script The script to compile
        * @param {any} ctrl The controller associated with the compile evaluation
        * @param {AppNode} elm The element whose attributes require the compilation
        * @param {Array<any>} $ctxValues [Optional] Context values passed down from any dynamically generated HTML. The array consists
        * of key object pairs that are translated into variables for use in the script.
        * @returns {CompiledEval}
        * @return {any}
        */
        static parse(script: string, ctrl: any, event: any, elm: AppNode, $ctxValues?: Array<any>): any;
        /**
        * Evaluates an expression and assigns new CSS styles based on the object returned
        */
        static digestCSS(elm: AppNode, controller: any, value: string): void;
        /**
        * Clones an object and creates a new identical object. This does not return the same class - only a copy of each of its properties
        * @param {any} obj The object to clone
        * @returns {any}
        */
        static clone(obj: any, deepCopy?: boolean): any;
        /**
        * Checks each  of the properties of an obejct to see if its the same as another
        * @param {any} a The first object to check
        * @param {any} b The target we are comparing against
        * @returns {boolean}
        */
        static isEquivalent(a: any, b: any): boolean;
        /**
        * Evaluates an expression and assigns new CSS styles based on the object returned
        */
        static digestStyle(elm: AppNode, controller: any, value: string): void;
        /**
        * Removes all registered events from the node
        * @param {Element} elem The element to remove events from
        */
        static removeEvents(elem: Element): void;
        /**
        * Traverses an element down to its child nodes
        * @param {Node} elm The element to traverse
        * @param {Function} callback The callback is called for each child element
        */
        static traverse(elm: Node, callback: Function): void;
        /**
        * Called to remove and clean any dynamic nodes that were added to the node
        * @param {DescriptorNode} sourceNode The parent node from which we are removing clones from
        */
        static cleanupNode(appNode: AppNode): void;
        /**
        * Explores and enflates the html nodes with enflatable expressions present (eg: en-repeat)
        * @param {RootNode} root The root element to explore
        * @param {any} ctrl The controller
        * @param {boolean} includeSubTemplates When traversing the template - should the compiler continue if it finds a child element with an associated controller
        */
        static expand(root: RootNode, ctrl: any, includeSubTemplates?: boolean): Element;
        /**
        * Registers an internal function reference for later cleanup
        * @param {AppNode} node The element we are attaching events to
        * @param {string} name The name of the event
        * @param {any} func The function to call
        */
        static registerFunc(node: AppNode, name: string, tag: string, func: any): void;
        /**
        * Goes through any expressions in the element and updates them according to the expression result.
        * @param {JQuery} elm The element to traverse
        * @param {any} controller The controller associated with the element
        * @param {boolean} includeSubTemplates When traversing the template - should the compiler continue if it finds a child element with an associated controller
        * @returns {Element}
        */
        static digest(jElem: JQuery, controller: any, includeSubTemplates?: boolean): Element;
        static validateNode(elem: NodeInput): void;
        /**
        * Checks each of the validation expressions on an input element. Used to set form and input states like form.$error
        * @param {string} value The list of expression names separated by |
        * @param {HTMLInputElement| HTMLTextAreaElement} elem The element to traverse
        */
        static checkValidations(value: string, elem: HTMLInputElement | HTMLTextAreaElement): boolean;
        /**
        * Given an model directive, any transform commands will change the model's object into something else
        * @param {string} value The list of expression names separated by |
        * @param {HTMLInputElement| HTMLTextAreaElement} elem The element to traverse
        */
        static transform(script: string, elem: HTMLInputElement | HTMLTextAreaElement, controller: any): any;
        /**
        * Goes through an element and prepares it for the compiler. This usually involves adding event listeners
        * and manipulating the DOM. This should only really be called once per element. If you need to update the
        * element after compilation you can use the digest method
        * @param {JQuery} elm The element to traverse
        * @param {any} ctrl The controller associated with the element
        * @param {boolean} includeSubTemplates When traversing the template - should the compiler continue if it finds a child element with an associated controller
        * @returns {JQuery}
        */
        static build(elm: JQuery, ctrl: any, includeSubTemplates?: boolean): JQuery;
    }
}
declare module Animate {
    class Repeater implements IDirective {
        private _returnVal;
        constructor();
        expand(expression: string, ctrl: any, desc: DescriptorNode, instance: InstanceNode): Array<AppNode>;
    }
}
declare module Animate {
    class If implements IDirective {
        private _returnVal;
        constructor();
        expand(expression: string, ctrl: any, desc: DescriptorNode, instance: InstanceNode): Array<AppNode>;
    }
}
declare module Animate {
    module EventTypes {
        const PORTAL_ADDED: string;
        const PORTAL_REMOVED: string;
        const PORTAL_EDITED: string;
        const CONTAINER_DELETED: string;
        const CONTAINER_SELECTED: string;
        const CONTAINER_CREATED: string;
    }
    /**
     * The type of attention message to display
     */
    enum AttentionType {
        WARNING = 0,
        SUCCESS = 1,
        ERROR = 2,
    }
    /**
     * An enum to describe the different types of validation
     * */
    enum ValidationType {
        /** The value must be a valid email format */
        EMAIL = 1,
        /** The value must be a number */
        NUMBER = 2,
        /** The value must only have alphanumeric characters */
        ALPHANUMERIC = 4,
        /** The value must not be empty */
        NOT_EMPTY = 8,
        /** The value cannot contain html */
        NO_HTML = 16,
        /** The value must only alphanumeric characters as well as '_', '-' and '!' */
        ALPHANUMERIC_PLUS = 32,
        /** The value must be alphanumeric characters as well as '_', '-' and '@' */
        ALPHA_EMAIL = 64,
    }
    /**
    * Defines which types of files to search through
    */
    enum FileSearchType {
        Global = 0,
        User = 1,
        Project = 2,
    }
    enum UserPlan {
        Free = 1,
        Bronze = 2,
        Silver = 3,
        Gold = 4,
        Platinum = 5,
        Custom = 6,
    }
    enum ResourceType {
        GROUP = 1,
        ASSET = 2,
        CONTAINER = 3,
        FILE = 4,
        SCRIPT = 5,
    }
    /**
    * Describes the type of access users have to a project
    */
    enum PrivilegeType {
        NONE = 0,
        READ = 1,
        WRITE = 2,
        ADMIN = 3,
    }
    /**
    * Describes the category of a project
    */
    enum Category {
        Other = 1,
        Artistic = 2,
        Gaming = 3,
        Informative = 4,
        Musical = 5,
        Technical = 6,
        Promotional = 7,
    }
    /**
    * Describes a property type
    */
    enum PropertyType {
        ASSET = 0,
        ASSET_LIST = 1,
        NUMBER = 2,
        COLOR = 3,
        GROUP = 4,
        FILE = 5,
        STRING = 6,
        OBJECT = 7,
        BOOL = 8,
        ENUM = 9,
        HIDDEN = 10,
        HIDDEN_FILE = 11,
        OPTIONS = 12,
    }
}
declare module Animate {
    /**
    * Base class for all custom enums
    */
    class ENUM {
        private static allEnums;
        value: string;
        constructor(v: string);
        toString(): string;
    }
    type EventType = ENUM | string;
    type EventCallback = (type: EventType, event: Event, sender?: EventDispatcher) => void;
    type TypedCallback<T> = (type: T, event: Event, sender?: EventDispatcher) => void;
    /**
    * Internal class only used internally by the {EventDispatcher}
    */
    class EventListener {
        type: EventType;
        func: EventCallback;
        context: any;
        constructor(type: EventType, func: EventCallback, context?: any);
    }
    /**
    * The base class for all events dispatched by the {EventDispatcher}
    */
    class Event {
        type: EventType;
        tag: any;
        /**
        * Creates a new event object
        * @param {EventType} eventType The type event
        */
        constructor(type: EventType, tag?: any);
    }
    /**
    * A simple class that allows the adding, removing and dispatching of events.
    */
    class EventDispatcher {
        private _listeners;
        disposed: boolean;
        constructor();
        /**
        * Returns the list of {EventListener} that are currently attached to this dispatcher.
        */
        listeners: Array<EventListener>;
        /**
        * Adds a new listener to the dispatcher class.
        */
        on<T>(type: T, func: TypedCallback<T>, context?: any): any;
        /**
        * Adds a new listener to the dispatcher class.
        */
        off<T>(type: T, func: TypedCallback<T>, context?: any): any;
        /**
        * Sends a message to all listeners based on the eventType provided.
        * @param {String} The trigger message
        * @param {Event} event The event to dispatch
        * @returns {any}
        */
        emit(event: Event | ENUM, tag?: any): any;
        /**
        * This will cleanup the component by nullifying all its variables and clearing up all memory.
        */
        dispose(): void;
    }
}
declare module Animate {
    /**
    * A base class for all project resources
    */
    class ProjectResource<T extends Engine.IResource> extends EventDispatcher {
        entry: T;
        private _saved;
        protected _properties: EditableSet;
        protected _options: {
            [s: string]: any;
        };
        constructor(entry: T);
        /**
        * Use this function to initialize the resource. This called just after the resource is created and its entry set.
        */
        initialize(): void;
        /**
        * This function is called just before the entry is saved to the database.
        */
        onSaving(): any;
        /**
        * Gets the properties of this resource
        */
        /**
        * Sets the properties of this resource
        */
        properties: EditableSet;
        /**
        * Gets if this resource is saved
        * @returns {boolean}
        */
        /**
        * Sets if this resource is saved
        * @param {boolean} val
        */
        saved: boolean;
        dispose(): void;
        /**
        * Creates an option which is associated with this asset. The name of the option must be unique. Use this to add your own custom data
        */
        createOption(name: string, val: any): void;
        /**
        * Destroys an option
        */
        removeOption(name: string): void;
        /**
        * Update the value of an option
        */
        updateOption(name: string, val: any): void;
        /**
        * Returns the value of an option
        */
        getOption(name: string): any;
    }
}
declare module Animate {
    /**
     * Describes all the different types of editor events
     */
    type EditorEventType = 'change' | 'focus-node';
    class EditorEvents extends ENUM {
        constructor(v: string);
        /**
        * This is called when the project is exporting the data object to the server.
        * The token object passed to this function contains all the information needed to run the project in an Animate runtime.
        * Associate event type is {EditorExportingEvent}
        */
        static EDITOR_PROJECT_EXPORTING: EditorEvents;
        /**
        * This function is called by Animate when everything has been loaded and the user is able to begin their session. Associate event type is {Event}
        */
        static EDITOR_READY: EditorEvents;
        /**
        * This function is called by Animate when the run button is pushed.
        */
        static EDITOR_RUN: EditorEvents;
        /**
        * This is called by Animate when we a container is created. Associate event type is {ContainerEvent}
        */
        /**
        * This is called by Animate when we a container is deleted. Associate event type is {ContainerEvent}
        */
        /**
        * This is called by Animate when we select a container. Associate event type is {ContainerEvent}
        */
        /**
        * This is called by Animate when we are exporting a container. The token that gets passed should be used to store any optional
        * data with a container. Associate event type is {ContainerDataEvent}
        */
        static CONTAINER_EXPORTING: EditorEvents;
        /**
        * This is called by Animate when we are saving a container. The token that gets passed should be used to store any optional
        * data with a container.This can be later, re - associated with the container when onOpenContainer is called. Associate event type is {ContainerDataEvent}
        */
        static CONTAINER_SAVING: EditorEvents;
        /**
        * This is called by Animate when we are opening a container. The token that gets passed is filled with optional
        * data when onSaveContainer is called. Associate event type is {ContainerDataEvent}
        */
        static CONTAINER_OPENING: EditorEvents;
        /**
        * Called when an asset is renamed. Associate event type is {AssetRenamedEvent}
        */
        static ASSET_RENAMED: EditorEvents;
        /**
        * Called when an asset is selected in the editor. Associate event type is {AssetEvent}
        */
        static ASSET_SELECTED: EditorEvents;
        /**
        * Called when an asset property is edited by the property grid. Associate event type is {AssetEditedEvent}
        */
        static ASSET_EDITED: EditorEvents;
        /**
        * Called when an asset is added to a container. Associate event type is {AssetContainerEvent}
        */
        static ASSET_ADDED_TO_CONTAINER: EditorEvents;
        /**
        * Called when an asset is removed from a container. Associate event type is {AssetContainerEvent}
        */
        static ASSET_REMOVED_FROM_CONTAINER: EditorEvents;
        /**
        * Called when an asset is created. Associate event type is {AssetCreatedEvent}
        */
        /**
        * Called just before an asset is saved to the server. Associate event type is {AssetEvent}
        */
        static ASSET_SAVING: EditorEvents;
        /**
        * Called when an asset is loaded from the database. Associate event type is {AssetEvent}
        */
        static ASSET_LOADED: EditorEvents;
        /**
        * Called when an asset is disposed off. Associate event type is {AssetEvent}
        */
        static ASSET_DESTROYED: EditorEvents;
        /**
        * Called when an asset is copied in the editor. Associate event type is {AssetCopiedEvent}
        */
        static ASSET_COPIED: EditorEvents;
    }
    class OkCancelFormEvent extends Event {
        text: string;
        cancel: boolean;
        constructor(eventName: OkCancelFormEvents, text: string);
    }
    class ContainerEvent extends Event {
        container: Container;
        constructor(type: string, container: Container);
    }
    class UserEvent extends Event {
        constructor(type: string, data: any);
    }
    class ImportExportEvent extends Event {
        live_link: any;
        constructor(eventName: ImportExportEvents, live_link: any);
    }
    /**
    * Called when an editor is being exported
    */
    class EditorExportingEvent extends Event {
        /**
        * @param {any} token The token object passed to this function contains all the information needed to run the project in an Animate runtime.
        */
        token: any;
        constructor(token: any);
    }
    /**
    * Events associated with Containers and either reading from, or writing to, a data token
    */
    class ContainerDataEvent extends Event {
        /**
        * {Container} container The container associated with this event
        */
        container: Container;
        /**
        * {any} token The data being read or written to
        */
        token: any;
        /**
        * {{ groups: Array<string>; assets: Array<number> }} sceneReferences [Optional] An array of scene asset ID's associated with this container
        */
        sceneReferences: {
            groups: Array<number>;
            assets: Array<number>;
        };
        constructor(eventName: EditorEvents, container: Container, token: any, sceneReferences?: {
            groups: Array<number>;
            assets: Array<number>;
        });
    }
    /**
    * Asset associated events
    */
    class AssetEvent extends Event {
        /**
        * {Asset} asset The asset associated with this event
        */
        asset: Asset;
        constructor(eventName: EditorEvents, asset: Asset);
    }
    /**
    * Called when an asset is renamed
    */
    class AssetRenamedEvent extends AssetEvent {
        /**
        * {string} oldName The old name of the asset
        */
        oldName: string;
        constructor(asset: Asset, oldName: string);
    }
    /**
    * Events assocaited with Assets in relation to Containers
    */
    class AssetContainerEvent extends AssetEvent {
        /**
        * {Container} container The container assocaited with this event
        */
        container: Container;
        constructor(eventName: EditorEvents, asset: Asset, container: Container);
    }
    /**
    * Portal associated events
    */
    class PortalEvent extends Event {
        container: Container;
        portal: Portal;
        oldName: string;
        constructor(type: string, oldName: string, container: Container, portal: Portal);
    }
    class WindowEvent extends Event {
        window: Window;
        constructor(eventName: WindowEvents, window: Window);
    }
    class ToolbarNumberEvent extends Event {
        value: number;
        constructor(e: ToolbarNumberEvents, value: number);
    }
    class ToolbarDropDownEvent extends Event {
        item: ToolbarItem;
        constructor(item: ToolbarItem, e: EventType);
        dispose(): void;
    }
    class EditEvent extends Event {
        property: Prop<any>;
        set: EditableSet;
        constructor(property: Prop<any>, set: EditableSet);
    }
    class TabEvent extends Event {
        private _pair;
        cancel: boolean;
        constructor(eventName: any, pair: TabPair);
        pair: TabPair;
    }
    class CanvasEvent extends Event {
        canvas: Canvas;
        constructor(eventName: CanvasEvents, canvas: Canvas);
    }
    /**
    * A simple project event. Always related to a project resource (null if not)
    */
    class ProjectEvent<T extends ProjectResource<Engine.IResource>> extends Event {
        resource: T;
        constructor(type: string, resource: T);
    }
    /**
    * An event to deal with file viewer events
    * The event type can be 'cancelled' or 'change'
    */
    class FileViewerEvent extends Event {
        file: Engine.IFile;
        constructor(type: string, file: Engine.IFile);
    }
}
declare module Animate {
    /**
     * This class describes a template. These templates are used when creating assets.
     */
    class AssetClass {
        private _abstractClass;
        private _name;
        parentClass: AssetClass;
        private _imgURL;
        private _variables;
        classes: Array<AssetClass>;
        constructor(name: string, parent: AssetClass, imgURL: string, abstractClass?: boolean);
        /**
         * Gets an array of all classes that are possible from this
         * @returns {AssetClass[]}
         */
        getClasses(): AssetClass[];
        /**
        * Creates an object of all the variables for an instance of this class.
        * @returns {EditableSet} The variables we are editing
        */
        buildVariables(): EditableSet;
        /**
        * Finds a class by its name. Returns null if nothing is found
        */
        findClass(name: string): AssetClass;
        /**
        * Adds a variable to the class.
        * @param { Prop<any>} prop The property to add
        * @returns {AssetClass} A reference to this AssetClass
        */
        addVar(prop: Prop<any>): AssetClass;
        /**
        * This will clear and dispose of all the nodes
        */
        dispose(): void;
        /**
        * Gets a variable based on its name
        * @param {string} name The name of the class
        * @returns {Prop<T>}
        */
        getVariablesByName<T>(name: string): Prop<T>;
        /**
        * Gets the image URL of this template
        * @returns {string}
        */
        imgURL: string;
        /**
        * Gets the variables associated with this template
        * @returns {Array<Prop<any>>}
        */
        variables: Array<Prop<any>>;
        /**
        * Adds a class
        * @param {string} name The name of the class
        * @param {string} img The optional image of the class
        * @param {boolean} abstractClass A boolean to define if this class is abstract or not. I.e. does this class allow for creating assets or is it just the base for others.
        * @returns {AssetClass}
        */
        addClass(name: string, img: string, abstractClass: boolean): AssetClass;
        /**
        * Gets the name of the class
        * @returns {string}
        */
        name: string;
        /**
        * Gets if this class is abstract or not
        * @returns {boolean}
        */
        abstractClass: boolean;
    }
}
declare module Animate {
    interface IAjaxError {
        message: string;
        status: number;
    }
    class Utils {
        private static _withCredentials;
        private static shallowIds;
        static validators: {
            [type: number]: {
                regex: RegExp;
                name: string;
                negate: boolean;
                message: string;
            };
        };
        /**
         * Initializes the utils static variables
         */
        static init(): void;
        /**
         * Checks a string to see if there is a validation error
         * @param {string} val The string to check
         * @param {ValidationType} validator The type of validations to check
         */
        static checkValidation(val: string, validator: ValidationType): string;
        /**
        * Generates a new shallow Id - an id that is unique only to this local session
        * @param {number} reference Pass a reference id to make sure the one generated is still valid. Any ID that's imported can potentially offset this counter.
        * @returns {number}
        */
        static generateLocalId(reference?: number): number;
        /**
         * Capitalizes the first character of a string
         * @param {string} str
         * @returns {string}
         */
        static capitalize(str: string): string;
        /**
        * A predefined shorthand method for calling put methods that use JSON communication
        */
        static post<T>(url: string, data: any): Promise<T>;
        /**
        * A predefined shorthand method for calling put methods that use JSON communication
        */
        static get<T>(url: string): Promise<T>;
        /**
        * A predefined shorthand method for calling put methods that use JSON communication
        */
        static put<T>(url: string, data: any): Promise<T>;
        /**
        * A predefined shorthand method for calling deleta methods that use JSON communication
        */
        static delete<T>(url: string, data?: any): Promise<T>;
        /**
        * Creates a new property based on the dataset provided
        * @param {PropertyType} type The type of property to create
        */
        static createProperty(name: string, type: PropertyType): Prop<any>;
        /**
         * Gets the relative position of the mouse to the given element
         * @param {React.MouseEvent} e
         * @param {HTMLElement} elm The target element
         * @returns {{ x: number, y : number }}
         */
        static getRelativePos(e: React.MouseEvent, elm: HTMLElement): {
            x: number;
            y: number;
        };
        /**
         * Gets a quadratically eased in/out value
         * @param {number} startValue The initial value
         * @param {number} delta The difference between the start value and its target
         * @param {number} curTime Between 0 and duration
         * @param {number} duration The total time
         * @returns {number}
         */
        static quadInOut(startValue: any, delta: any, curTime: any, duration: any): number;
        /**
         * Scrolls an element to the destination x and y for a given duration
         * @param {{ x: number, y : number }} dest The target X & Y coordinates
         * @param {HTMLElement} elm The element to scroll
         * @param {number} duration The total amount of time to take to scroll
         * @return {number} Returns setInterval
         */
        static scrollTo(dest: {
            x: number;
            y: number;
        }, elm: HTMLElement, duration: number): number;
        /**
        * Use this function to check if a value contains characters that break things.
        * @param {string} text The text to check
        * @param {boolean} allowSpace If this is true, empty space will be allowed
        * @returns {string} Returns null or string. If it returns null then everything is fine. Otherwise a message is returned with what's wrong.
        */
        static checkForSpecialChars(text: string, allowSpace?: boolean): string;
        /**
        Tells us if a string is a valid email address
        */
        static validateEmail(email: string): boolean;
        static getObjectClass(obj: any): any;
    }
}
declare module Animate {
    /**
    * The plugin manager is used to load and manage external Animate plugins.
    */
    class PluginManager extends EventDispatcher {
        private static _singleton;
        private _plugins;
        private _loadedPlugins;
        private _behaviourTemplates;
        private _assetTemplates;
        private _converters;
        private _previewVisualizers;
        constructor();
        /**
        * Attempts to download a plugin by its URL and insert it onto the page.
        * Each plugin should then register itself with the plugin manager by setting the __newPlugin variable. This variable is set in the plugin that's downloaded.
        * Once downloaded - the __newPlugin will be set as the plugin and is assigned to the plugin definition.
        * @param {IPlugin} pluginDefinition The plugin to load
        * @returns {Promise<Engine.IPlugin>}
        */
        loadPlugin(pluginDefinition: Engine.IPlugin): Promise<Engine.IPlugin>;
        /**
        * This funtcion is used to load a plugin.
        * @param {IPlugin} pluginDefinition The IPlugin constructor that is to be created
        * @param {boolean} createPluginReference Should we keep this constructor in memory? The default is true
        */
        preparePlugin(pluginDefinition: Engine.IPlugin, createPluginReference?: boolean): void;
        /**
        * Call this function to unload a plugin
        * @param {IPlugin} plugin The IPlugin object that is to be loaded
        */
        unloadPlugin(plugin: IPlugin): void;
        /**
        * Loops through each of the converters to see if a conversion is possible. If it is
        * it will return an array of conversion options, if not it returns false.
        * @param {any} typeA The first type to check
        * @param {any} typeB The second type to check
        */
        getConverters(typeA: any, typeB: any): any;
        /**
        * Gets a behaviour template by its name.
        * @param {string} behaviorName The name of the behaviour template
        */
        getTemplate(behaviorName: string): BehaviourDefinition;
        /**
        * Use this function to select an asset in the tree view and property grid
        * @param {Asset} asset The Asset object we need to select
        * @param {boolean} panToNode When set to true, the treeview will bring the node into view
        * @param {boolean} multiSelect When set to true, the treeview not clear any previous selections
        */
        selectAsset(asset: Asset, panToNode?: boolean, multiSelect?: boolean): void;
        /**
        * Gets an asset class by its name
        * @param {string} name The name of the asset class
        * @param {AssetClass}
        */
        getAssetClass(name: string): AssetClass;
        /**
        * When an asset is created this function will notify all plugins of its existance
        * @param {string} name The name of the asset
        * @param {Asset} asset The asset itself
        */
        /**
        * Called when the project is reset by either creating a new one or opening an older one.
        */
        projectReset(project: Project): void;
        /**
        * This function is called by Animate when everything has been loaded and the user is able to begin their session.
        */
        projectReady(project: Project): void;
        /**
        * Creates a thumbnail preview of the file
        * @param {Engine.IFile} file
        * @returns {Promise<HTMLCanvasElement>}
        */
        thumbnail(file: Engine.IFile): Promise<HTMLCanvasElement>;
        /**
        * This function generates a React Element that is used to preview a file
        * @param {Engine.IFile} file The file we are looking to preview
        * @returns {JSX.Element} If a React Element is returned is added in the File viewer preview
        */
        displayPreview(file: Engine.IFile): JSX.Element;
        assetTemplates: AssetTemplate[];
        loadedPlugins: IPlugin[];
        behaviourTemplates: BehaviourDefinition[];
        /**
        * Gets the singleton instance.
        */
        static getSingleton(): PluginManager;
    }
}
declare module Animate {
    class ImportExportEvents extends ENUM {
        constructor(v: string);
        static COMPLETE: ImportExportEvents;
    }
    /**
    * A class to help with importing and exporting a project
    */
    class ImportExport extends EventDispatcher {
        private static _singleton;
        private runWhenDone;
        private mRequest;
        constructor();
        /**
        * @type public mfunc run
        * This function will first export the scene and then attempt to create a window that runs the application.
        * @extends <ImportExport>
        */
        run(): void;
        /**
        * @type public mfunc exportScene
        * This function is used to exort the Animae scene. This function creates an object which is exported as a string. Plugins
        * can hook into this process and change the output to suit the plugin needs.
        * @extends <ImportExport>
        */
        exportScene(): void;
        /**
        * Adds asset references to a container token during the export.
        * @param {Asset} asset the asset object to check
        * @param {ContainerToken} container The container to add refernces on
        * @returns {any}
        */
        referenceCheckAsset(asset: Asset, container: ContainerToken): void;
        /**
        * Adds group references to a container token during the export.
        * @param {TreeNodeGroup} group the group object to check
        * @param {ContainerToken} container The container to add refernces on
        * @returns {any}
        */
        referenceCheckGroup(group: TreeNodeGroup, container: ContainerToken): void;
        /**
        * This is the resonse from the server
        */
        onServer(response: LoaderEvents, event: AnimateLoaderEvent, sender?: EventDispatcher): void;
        /**
        * Gets the singleton instance.
        * @extends <ImportExport>
        */
        static getSingleton(): ImportExport;
    }
}
declare module Animate {
    /**
    * A simple interface for property grid editors
    */
    abstract class PropertyGridEditor {
        constructor(grid: PropertyGrid);
        /**
        * Checks a property to see if it can edit it
        * @param {Prop<any>} prop The property being edited
        * @returns {boolean}
        */
        abstract canEdit(prop: Prop<any>): boolean;
        /**
        * Given a property, the grid editor must produce HTML that can be used to edit the property
        * @param {Prop<any>} prop The property being edited
        * @param {Component} container The container acting as this editors parent
        */
        edit(prop: Prop<any>, container: Component): any;
        cleanup(): void;
    }
}
declare module Animate {
    /**
    * Assets are resources with a list of editable properties. Typically assets are made from templates defined in plugins.
    * They define the objects you can interact with in an application. For example, a cat plugin might define an asset template
    * called Cat which allows you to create a cat asset in the application. The properties of the cat asset would be defined by
    * the plugin.
    */
    class Asset extends ProjectResource<Engine.IAsset> {
        class: AssetClass;
        /**
        * @param {AssetClass} assetClass The name of the "class" or "template" that this asset belongs to
        * @param {IAsset} entry [Optional] The asset database entry
        */
        constructor(assetClass: AssetClass, entry?: Engine.IAsset);
        /**
        * Writes this assset to a readable string
        * @returns {string}
        */
        toString(): string;
        /**
        * Use this function to reset the asset properties
        * @param {string} name The name of the asset
        * @param {string} className The "class" or "template" name of the asset
        * @param {any} json The JSON data of the asset.
        */
        update(name: string, className: string, json?: any): void;
        /**
        * Disposes and cleans up the data of this asset
        */
        dispose(): void;
    }
}
declare module Animate {
    /**
    * Each project has a list of containers. These are saved into the database and retrieved when we work with Animate. A container is
    * essentially a piece of code that executes behaviour nodes and plugin logic when activated. It acts as a 'container' for logic.
    */
    class Container extends ProjectResource<Engine.IContainer> {
        canvas: Canvas;
        /**
        * {string} name The name of the container
        */
        constructor(entry?: Engine.IContainer);
        /**
        * This function is called just before the entry is saved to the database.
        */
        onSaving(): any;
        /**
         * Use this function to initialize the resource. This called just after the resource is created and its entry set.
         */
        initialize(): void;
        /**
        * This will cleanup the behaviour.
        */
        dispose(): void;
    }
}
declare module Animate {
    /**
    * A simple array resource for referencing groups, or arrays, of other objects. Similar to arrays in Javascript.
    */
    class GroupArray extends ProjectResource<Engine.IGroup> {
        /**
        * @param {IGroup} entry [Optional] The database entry of the resource
        */
        constructor(entry?: Engine.IGroup);
        /**
        * Adds a new reference to the group
        * @param {number} shallowId
        */
        addReference(shallowId: number): void;
        /**
        * Removes a reference from the group
        * @param {number} shallowId
        */
        removeReference(shallowId: number): void;
        /**
        * Disposes and cleans up the data of this asset
        */
        dispose(): void;
    }
}
declare module Animate {
    /**
    * A wrapper for DB file instances
    * @events deleted, refreshed
    */
    class FileResource extends ProjectResource<Engine.IFile> {
        /**
        * @param {IFile} entry The DB entry of this file
        */
        constructor(entry: Engine.IFile);
    }
}
declare module Animate {
    /**
    * A wrapper for DB script instances
    */
    class ScriptResource extends ProjectResource<Engine.IScript> {
        /**
        * @param {IScript} entry The DB entry of this script
        */
        constructor(entry: Engine.IScript);
    }
}
declare module Animate {
    /**
    * The AssetTemplate object is used to define what assets are available to the scene.
    * Assets are predefined tempaltes of data that can be instantiated. The best way to think of an asset
    * is to think of it as a predefined object that contains a number of variables. You could for example
    * create Assets like cats, dogs, animals or humans. Its really up you the plugin writer how they want
    * to define their assets. This function can return null if no Assets are required.
    */
    class AssetTemplate {
        private plugin;
        classes: Array<AssetClass>;
        /**
        * @param {IPlugin} plugin The plugin who created this template
        */
        constructor(plugin: any);
        /**
        * Adds a class to this template
        * @param {string} name The name of the class
        * @param {string} img The optional image
        * @param {boolean} abstractClass A boolean to define if this class is abstract or not.
        * @returns {AssetClass}
        */
        addClass(name: string, img: string, abstractClass: boolean): AssetClass;
        /**
        * Removes a class by name
        * @param {string} name The name of the class to remove
        */
        removeClass(name: string): void;
        /**
        * Finds a class by its name. Returns null if nothing is found
        */
        findClass(name: string): AssetClass;
    }
}
declare module Animate {
    /**
    *  A simple class to define the behavior of a behaviour object.
    */
    class BehaviourDefinition {
        private _behaviourName;
        private _canBuildOutput;
        private _canBuildInput;
        private _canBuildParameter;
        private _canBuildProduct;
        private _portalTemplates;
        private _plugin;
        /**
        * @param {string} behaviourName The name of the behaviour
        * @param {Array<PortalTemplate>} portalTemplates
        * @param {IPlugin} plugin The plugin this is associated with
        * @param {boolean} canBuildInput
        * @param {boolean} canBuildOutput
        * @param {boolean} canBuildParameter
        * @param {boolean} canBuildProduct
        */
        constructor(behaviourName: string, portalTemplates: Array<PortalTemplate>, plugin: IPlugin, canBuildInput?: boolean, canBuildOutput?: boolean, canBuildParameter?: boolean, canBuildProduct?: boolean);
        dispose(): void;
        canBuildOutput(behaviour: Behaviour): boolean;
        canBuildInput(behaviour: Behaviour): boolean;
        canBuildProduct(behaviour: Behaviour): boolean;
        canBuildParameter(behaviour: Behaviour): boolean;
        portalsTemplates(): Array<PortalTemplate>;
        behaviourName: string;
        plugin: IPlugin;
    }
}
declare module Animate {
    class DataToken {
        category: string;
        command: string;
        projectID: string;
    }
}
declare module Animate {
    class DB {
        static USERS: string;
        static USERS_SOCKET: string;
        static HOST: string;
        static API: string;
        static PLAN_FREE: string;
        static PLAN_BRONZE: string;
        static PLAN_SILVER: string;
        static PLAN_GOLD: string;
        static PLAN_PLATINUM: string;
    }
}
declare module Animate {
    /**
    * Basic set of loader events shared by all loaders
    */
    class LoaderEvents extends ENUM {
        constructor(v: string);
        static COMPLETE: LoaderEvents;
        static FAILED: LoaderEvents;
        /**
        * Returns an enum reference by its name/value
        * @param {string} val
        * @returns {LoaderEvents}
        */
        static fromString(val: string): LoaderEvents;
    }
    /**
    * Abstract base loader class. This should not be instantiated, instead use the sub class loaders. Keeps track of loading
    * variables as well as functions for showing or hiding the loading dialogue
    */
    class LoaderBase extends EventDispatcher {
        private static loaderBackdrop;
        private static showCount;
        url: string;
        numTries: number;
        data: any;
        dataType: string;
        domain: string;
        contentType: any;
        processData: boolean;
        getVariables: any;
        _getQuery: string;
        /**
        * Creates an instance of the Loader
        * @param {string} domain [Optional] Specify the base domain of this call. By default it uses DB.HOST.
        */
        constructor(domain?: string);
        /**
        * Starts the loading process
        * @param {string} url The URL we want to load
        * @param {any} data The data associated with this load
        * @param {number} numTries The number of attempts allowed to make this load
        */
        load(url: string, data: any, numTries?: number): void;
        /**
        * Call this function to create a jQuery object that acts as a loader modal window (the window with the spinning cog)
        * @returns {JQuery}
        */
        static createLoaderModal(): JQuery;
        /**
        * Shows the loader backdrop which prevents the user from interacting with the application. Each time this is called a counter
        * is incremented. To hide it call the hideLoader function. It will only hide the loader if the hideLoader is called the same
        * number of times as the showLoader function. I.e. if you call showLoader 5 times and call hideLoader 4 times, it will not hide
        * the loader. If you call hideLoader one more time - it will.
        */
        static showLoader(): void;
        /**
        * see showLoader for information on the hideLoader
        */
        static hideLoader(): void;
        /**
       * Cleans up the object
       */
        dispose(): void;
    }
}
declare module Animate {
    /**
    * Valid response codes for requests made to the Animate server
    */
    class AnimateLoaderResponses extends ENUM {
        constructor(v: string);
        static SUCCESS: AnimateLoaderResponses;
        static ERROR: AnimateLoaderResponses;
        static fromString(val: string): ENUM;
    }
    /**
    * Events associated with requests made to the animate servers
    */
    class AnimateLoaderEvent extends Event {
        message: string;
        return_type: AnimateLoaderResponses;
        data: any;
        constructor(eventName: LoaderEvents, message: string, return_type: AnimateLoaderResponses, data?: any);
    }
    /**
    * This class acts as an interface loader for the animate server.
    */
    class AnimateLoader extends LoaderBase {
        private _curCall;
        /**
        * Creates an instance of the Loader
        * @param {string} domain [Optional] Specify the base domain of this call. By default it uses DB.HOST.
        */
        constructor(domain?: string);
        /**
        * This function will make a POST request to the animate server
        * @param {string} url The URL we want to load
        * @param {any} data The post variables to send off to the server
        * @param {number} numTries The number of attempts allowed to make this load
        */
        load(url: string, data: any, numTries?: number, type?: string): void;
        /**
        * Called when we the ajax response has an error.
        * @param {any} e
        * @param {string} textStatus
        * @param {any} errorThrown
        */
        onError(e: any, textStatus: any, errorThrown: any): void;
        /**
        * Called when we get an ajax response.
        * @param {any} data
        * @param {any} textStatus
        * @param {any} jqXHR
        */
        onData(data: any, textStatus: any, jqXHR: any): void;
        /**
        * Cleans up the object
        */
        dispose(): void;
    }
}
declare module Animate {
    /**
    * Valid response codes for xhr binary requests
    */
    class BinaryLoaderResponses extends ENUM {
        constructor(v: string);
        static SUCCESS: BinaryLoaderResponses;
        static ERROR: BinaryLoaderResponses;
    }
    /**
    * Events associated with xhr binary requests
    */
    class BinaryLoaderEvent extends Event {
        buffer: ArrayBuffer;
        message: string;
        constructor(binaryResponse: BinaryLoaderResponses, buffer: ArrayBuffer, message?: string);
    }
    /**
    * Class used to download contents from a server into an ArrayBuffer
    */
    class BinaryLoader extends LoaderBase {
        private _xhr;
        private _onBuffers;
        private _onError;
        /**
        * Creates an instance of the Loader
        * @param {string} domain [Optional] Specify the base domain of this call. By default it uses DB.HOST.
        */
        constructor(domain?: string);
        /**
        * This function will make a GET request and attempt to download a file into binary data
        * @param {string} url The URL we want to load
        * @param {number} numTries The number of attempts allowed to make this load
        */
        load(url: string, numTries?: number): void;
        /**
        * If an error occurs
        */
        onError(event: any): void;
        /**
        * Cleans up and removes references for GC
        */
        dispose(): void;
        /**
        * Called when the buffers have been loaded
        */
        onBuffersLoaded(): void;
    }
}
declare module Animate {
    /**
    * A simple class to define portal behaviour.
    */
    class PortalTemplate {
        type: PortalType;
        property: Prop<any>;
        /**
        * @param {Prop<any>} property The property associated with this portal
        * @param {PortalType} type The type of portal this represents
        */
        constructor(property: Prop<any>, type: PortalType);
    }
}
declare module Animate {
    class ProjectEvents {
        value: string;
        constructor(v: string);
        toString(): string;
        static SAVED: ProjectEvents;
        static SAVED_ALL: ProjectEvents;
        static FAILED: ProjectEvents;
        static BUILD_SELECTED: ProjectEvents;
        static BUILD_SAVED: ProjectEvents;
    }
    /**
    * A wrapper for project builds
    */
    class Build {
        entry: Engine.IBuild;
        /**
        * Creates an intance of the build
        * @param {Engine.IBuild} entry The entry token from the DB
        */
        constructor(entry: Engine.IBuild);
        /**
        * Attempts to update the build with new data
        * @param {Engine.IBuild} token The update token data
        */
        update(token: Engine.IBuild): Promise<boolean>;
    }
    /**
    * A project class is an object that is owned by a user.
    * The project has functions which are useful for comunicating data to the server when
    * loading and saving data in the scene.
    */
    class Project extends EventDispatcher {
        private _entry;
        saved: boolean;
        curBuild: Build;
        private _containers;
        private _assets;
        private _files;
        private _scripts;
        private _groups;
        private _restPaths;
        /**
        * @param{string} id The database id of this project
        */
        constructor();
        /**
         * Gets the DB entry associated with this project
         * @returns {Engine.IProject}
         */
        /**
         * Sets the DB entry associated with this project
         * @param {Engine.IProject}
         */
        entry: Engine.IProject;
        /**
        * Gets a resource by its ID
        * @param {string} id The ID of the resource
        * @returns {ProjectResource<Engine.IResource>} The resource whose id matches the id parameter or null
        */
        getResourceByID<T extends ProjectResource<Engine.IResource>>(id: string, type?: ResourceType): {
            resource: T;
            type: ResourceType;
        };
        /**
        * Gets a resource by its shallow ID
        * @param {string} id The shallow ID of the resource
        * @returns {ProjectResource<Engine.IResource>} The resource whose shallow id matches the id parameter or null
        */
        getResourceByShallowID<T extends ProjectResource<Engine.IResource>>(id: number, type?: ResourceType): T;
        /**
        * Attempts to update the project details base on the token provided
        * @returns {Engine.IProject} The project token
        * @returns {Promise<UsersInterface.IResponse>}
        */
        updateDetails(token: Engine.IProject): Promise<UsersInterface.IResponse>;
        /**
        * Loads a previously selected build, or creates one if none are selected
        * @returns {Promise<Build>}
        */
        loadBuild(): Promise<Build>;
        /**
        * Internal function to create a resource wrapper
        * @param {T} entry The database entry
        * @param {ResourceType} type The type of resource to create
        * @returns {ProjectResource<T>}
        */
        private createResourceInstance<T>(entry, type?);
        /**
        * This function is used to fetch the project resources associated with a project.
        * @param {ResourceType} type [Optional] You can specify to load only a subset of the resources (Useful for updating if someone else is editing)
        * @returns {Promise<Array<ProjectResource<Engine.IResource>>}
        */
        loadResources(type?: ResourceType): Promise<Array<ProjectResource<Engine.IResource>>>;
        /**
        * This function is used to fetch a project resource by Id
        * @param {string} id the Id of the resource to update
        * @param {ResourceType} type You can specify to load only a subset of the resources (Useful for updating if someone else is editing)
        * @returns {Promise<T | Error>}
        */
        refreshResource<T extends ProjectResource<Engine.IResource>>(id: string, type?: ResourceType): Promise<T | Error>;
        /**
        * Use this to edit the properties of a resource
        * @param {string} id The id of the object we are editing.
        * @param {T} data The new data for the resource
        * @param {ResourceType} type The type of resource we are editing
        * @returns {Promise<Modepress.IResponse | Error>}
        */
        editResource<T>(id: string, data: T, type: ResourceType): Promise<Modepress.IResponse | Error>;
        /**
        * Use this to save the properties of a resource
        * @param {string} id The id of the object we are saving.
        * @param {ResourceType} type [Optional] The type of resource we are saving
        * @returns {Promise<boolean>}
        */
        saveResource(id: string, type?: ResourceType): Promise<boolean>;
        /**
        * Use this to edit the properties of a resource
        * @param {ResourceType} type The type of resource we are saving
        * @returns {Promise<boolean>}
        */
        saveResources(type: ResourceType): Promise<boolean>;
        /**
        * Use this to delete a resource by its Id
        * @param {string} id The id of the object we are deleting
        * @param {ResourceType} type The type of resource we are renaming
        * @returns {Promise<boolean | Error>}
        */
        deleteResource(id: string, type: ResourceType): Promise<boolean | Error>;
        /**
        * Copies an existing resource and assigns a new ID to the cloned item
        * @param {string} id The id of the resource we are cloning from
        * @param {ResourceType} type [Optional] The type of resource to clone
        * @returns {Promise<ProjectResource<T>>}
        */
        copyResource<T extends Engine.IResource>(id: string, type?: ResourceType): Promise<ProjectResource<T>>;
        /**
        * Deletes several resources in 1 function call
        * @param {Array<string>} ids The ids An array of resource Ids
        * @returns {Promise<boolean>}
        */
        deleteResources(ids: Array<string>): Promise<boolean>;
        /**
        * This function is used to all project resources
        */
        saveAll(): Promise<boolean>;
        /**
        * Creates a new project resource.
        * @param {ResourceType} type The type of resource we are renaming
        * @returns { Promise<ProjectResource<any>>}
        */
        createResource<T extends Engine.IResource>(type: ResourceType, data: T): Promise<ProjectResource<T>>;
        /**
        * This function is used to create an entry for this project on the DB.
        */
        selectBuild(major: string, mid: string, minor: string): void;
        /**
        * This function is used to update the current build data
        */
        saveBuild(notes: string, visibility: string, html: string, css: string): void;
        /**
        * This function is called whenever we get a resonse from the server
        */
        onServer(response: LoaderEvents, event: AnimateLoaderEvent, sender?: EventDispatcher): void;
        containers: Array<Container>;
        files: Array<FileResource>;
        scripts: Array<ScriptResource>;
        assets: Array<Asset>;
        groups: Array<GroupArray>;
        /**
        * This will cleanup the project and remove all data associated with it.
        */
        reset(): void;
        plugins: Array<Engine.IPlugin>;
    }
}
declare module Animate {
    class TypeConverter {
        plugin: IPlugin;
        typeA: string;
        typeB: string;
        conversionOptions: Array<string>;
        constructor(typeA: string, typeB: string, conversionOptions: Array<string>, plugin: IPlugin);
        /** Checks if this converter supports a conversion. */
        canConvert(typeA: any, typeB: any): boolean;
        /** Cleans up the object. */
        dispose(): void;
    }
}
declare module Animate {
    /**
    * This class is used to represent the user who is logged into Animate.
    */
    class User extends EventDispatcher {
        private static _singleton;
        entry: UsersInterface.IUserEntry;
        meta: Engine.IUserMeta;
        project: Project;
        private _isLoggedIn;
        constructor();
        /**
        * Resets the meta data
        */
        resetMeta(): void;
        /**
        * Checks if a user is logged in or not. This checks the server using
        * cookie and session data from the browser.
        * @returns {Promise<boolean>}
        */
        authenticated(): Promise<boolean>;
        /**
        * Tries to log the user in asynchronously.
        * @param {string} user The username of the user.
        * @param {string} password The password of the user.
        * @param {boolean} rememberMe Set this to true if we want to set a login cookie and keep us signed in.
        * @returns {Promise<UsersInterface.IAuthenticationResponse>}
        */
        login(user: string, password: string, rememberMe: boolean): Promise<UsersInterface.IAuthenticationResponse>;
        /**
        * Tries to register a new user.
        * @param {string} user The username of the user.
        * @param {string} password The password of the user.
        * @param {string} email The email of the user.
        * @param {string} captcha The captcha of the login screen
        * @returns {Promise<UsersInterface.IAuthenticationResponse>}
        */
        register(user: string, password: string, email: string, captcha: string): Promise<UsersInterface.IAuthenticationResponse>;
        /**
        * This function is used to resend a user's activation code
        * @param {string} user
        * @returns {Promise<UsersInterface.IResponse>}
        */
        resendActivation(user: string): Promise<UsersInterface.IResponse>;
        /**
        * This function is used to reset a user's password.
        * @param {string} user
        * @returns {Promise<UsersInterface.IResponse>}
        */
        resetPassword(user: string): Promise<UsersInterface.IResponse>;
        /**
        * Attempts to log the user out
        * @return {Promise<UsersInterface.IResponse>}
        */
        logout(): Promise<UsersInterface.IResponse>;
        /**
        * Fetches all the projects of a user. This only works if the user if logged in. If not
        * it will return null.
        * @param {number} index The index to  fetching projects for
        * @param {number} limit The limit of how many items to fetch
        * @param {string} search Optional search text
        * @return {Promise<ModepressAddons.IGetProjects>}
        */
        getProjectList(index: number, limit: number, search?: string): Promise<ModepressAddons.IGetProjects>;
        /**
        * Creates a new user projects
        * @param {string} name The name of the project
        * @param {Array<string>} plugins An array of plugin IDs to identify which plugins to use
        * @param {string} description [Optional] A short description
        * @return {Promise<ModepressAddons.ICreateProject>}
        */
        newProject(name: string, plugins: Array<string>, description?: string): Promise<ModepressAddons.ICreateProject>;
        /**
        * Removes a project by its id
        * @param {string} pid The id of the project to remove
        * @return {Promise<Modepress.IResponse>}
        */
        removeProject(pid: string): Promise<Modepress.IResponse>;
        /**
        * Attempts to update the user's details base on the token provided
        * @returns {Engine.IUserMeta} The user details token
        * @returns {Promise<UsersInterface.IResponse>}
        */
        updateDetails(token: Engine.IUserMeta): Promise<UsersInterface.IResponse>;
        /**
        * @type public mfunc copyProject
        * Use this function to duplicate a project
        * @param {number} id The project ID we are copying
        * @extends {User}
        */
        copyProject(id: string): void;
        /**
        * This function is used to open an existing project.
        */
        openProject(id: string): void;
        /**
        * This will delete a project from the database as well as remove it from the user.
        * @param {string} id The id of the project we are removing.
        */
        deleteProject(id: string): any;
        /**
        * This is the resonse from the server
        * @param {LoaderEvents} response The response from the server. The response will be either Loader.COMPLETE or Loader.FAILED
        * @param {Event} data The data sent from the server.
        */
        onServer(response: LoaderEvents, event: AnimateLoaderEvent, sender?: EventDispatcher): void;
        isLoggedIn: boolean;
        /**
        * Gets the singleton instance.
        * @returns {User}
        */
        static get: User;
    }
}
declare module Animate {
    type SocketEvents = 'error' | UsersInterface.SocketTokens.ClientInstructionType;
    /**
     * A singleton class that deals with comminication between the client frontend
     * and the socket backends.
     */
    class SocketManager extends EventDispatcher {
        private static _singleton;
        private _usersSocket;
        /**
         * Creates the singleton
         */
        constructor();
        /**
         * Attempts to reconnect when the socket loses its connection
         */
        private _reConnect(e);
        /**
         * Called whenever we get a message from the users socket API
         * @param {MessageEvent} e
         */
        onMessage(e: MessageEvent): void;
        /**
         * Called whenever an error occurs
         * @param {Error} e
         */
        onError(e: Error): void;
        /**
         * Attempts to connect to the user's socket api
         */
        connect(): void;
        /**
         * Gets the singleton
         * @returns {SocketManager}
         */
        static get: SocketManager;
    }
}
declare module Animate {
    /**
    * Abstract class downloading content by pages
    */
    class PageLoader {
        updateFunc: (index: number, limit: number) => void;
        index: number;
        limit: number;
        last: number;
        protected searchTerm: string;
        constructor(updateFunction: (index: number, limit: number) => void);
        /**
        * Calls the update function
        */
        invalidate(): void;
        /**
        * Gets the current page number
        * @returns {number}
        */
        getPageNum(): number;
        /**
        * Gets the total number of pages
        * @returns {number}
        */
        getTotalPages(): number;
        /**
        * Sets the page search back to index = 0
        */
        goFirst(): void;
        /**
        * Gets the last set of users
        */
        goLast(): void;
        /**
        * Sets the page search back to index = 0
        */
        goNext(): void;
        /**
        * Sets the page search back to index = 0
        */
        goPrev(): void;
    }
}
declare module Animate {
    class ImageVisualizer implements IPreviewFactory {
        private _maxPreviewSize;
        constructor();
        /**
         * Creates a thumbnail preview of the file
         * @param {Engine.IFile} file
         * @returns {Promise<HTMLCanvasElement>}
         */
        thumbnail(file: Engine.IFile): Promise<HTMLCanvasElement>;
        /**
         * This function generates a React Element that is used to preview a file
         * @param {Engine.IFile} file The file we are looking to preview
         * @returns {JSX.Element} If a React Element is returned is added in the File viewer preview
         */
        generate(file: Engine.IFile): JSX.Element;
    }
}
declare module Animate {
    type ProgressCallback = (percent: number) => void;
    type CompleteCallback = (err?: Error, files?: Array<UsersInterface.IUploadToken>) => void;
    class FileUploader {
        private _dCount;
        private _downloads;
        percent: number;
        private _onProg;
        private _onComplete;
        constructor(onComp?: CompleteCallback, onProg?: ProgressCallback);
        numDownloads: number;
        uploadFile(files: File[], meta?: any, parentFile?: string): void;
        upload2DElement(img: HTMLImageElement | HTMLCanvasElement, name: string, meta?: Engine.IFileMeta, parentFile?: string): void;
        uploadArrayBuffer(array: ArrayBuffer, name: string, meta?: any, parentFile?: string): void;
        uploadTextAsFile(text: string, name: string, meta?: any, parentFile?: string): void;
        upload(form: FormData, url: string, parentFile?: string): void;
    }
}
declare module Animate {
    /**
    * Defines a set of variables. The set is typically owned by an object that can be edited by users. The set can be passed to editors like the
    * PropertyGrid to expose the variables to the user.
    */
    class EditableSet {
        private _variables;
        parent: EventDispatcher;
        /**
        * Creates an instance
        * @param {EventDispatcher} parent The owner of this set. Can be null. If not null, the parent will receive events when the properties are edited.
        */
        constructor(parent: EventDispatcher);
        /**
        * Adds a variable to the set
        * @param {Prop<any>} prop
        */
        addVar(prop: Prop<any>): void;
        /**
        * Gets a variable by name
        * @param {string} name
        * @returns {Prop<T>}
        */
        getVar<T>(name: string): Prop<T>;
        /**
        * Removes a variable
        * @param {string} prop
        */
        removeVar(name: string): void;
        /**
         * Broadcasts an "edited" event to the owner of the set
         */
        notifyEdit(prop: Prop<any>): void;
        /**
        * Updates a variable with a new value
        * @returns {T}
        */
        updateValue<T>(name: string, value: T): T;
        /**
        * Tokenizes the data into a JSON.
        * @param {boolean} slim If true, only the core value is exported. If false, additional data is exported so that it can be re-created at a later stage
        */
        tokenize(slim?: boolean): any;
        /**
        * De-Tokenizes data from a JSON.
        * @param {any} data The data to import from
        */
        deTokenize(data: any): void;
        /**
       * Tokenizes the data into a JSON.
       * @returns {Array<Prop<any>>}
       */
        variables: Array<Prop<any>>;
        /**
         * Cleans up and removes the references
         */
        dispose(): void;
    }
}
declare module Animate {
    /**
    * Defines a property variable. These are variables wrapped in sugar code to help sanitize and differentiate different pieces of data.
    * Each property is typically owner by an EditableSet.
    */
    class Prop<T> {
        name: string;
        protected _value: T;
        category: string;
        options: any;
        set: EditableSet;
        type: PropertyType;
        /**
        * Creates a new instance
        * @param {string} name The name of the property
        * @param {T} value The value of the property
        * @param {string} category [Optional] An optional category to describe this property's function
        * @param {any} options [Optional] Any optional data to be associated with the property
        * @param {PropertyType} type [Optional] Define the type of property
        */
        constructor(name: string, value: T, category?: string, options?: any, type?: PropertyType);
        /**
        * Attempts to clone the property
        * @returns {Prop<T>}
        */
        clone(clone?: Prop<T>): Prop<T>;
        /**
        * Attempts to fetch the value of this property
        * @returns {T}
        */
        getVal(): T;
        /**
        * Tokenizes the data into a JSON.
        * @param {boolean} slim If true, only the core value is exported. If false, additional data is exported so that it can be re-created at a later stage.
        * @returns {any}
        */
        tokenize(slim?: boolean): any;
        /**
        * De-Tokenizes data from a JSON.
        * @param {any} data The data to import from
        */
        deTokenize(data: any): void;
        /**
        * Attempts to set the value of this property
        * @param {T} val
        */
        setVal(val: T): void;
        /**
        * Cleans up the class
        */
        dispose(): void;
        /**
        * Writes this portal out to a string
        */
        toString(): string;
    }
    class PropBool extends Prop<boolean> {
        /**
        * Creates a new instance
        * @param {string} name The name of the property
        * @param {boolean} value The value of the property
        * @param {string} category [Optional] An optional category to describe this property's function
        * @param {any} options [Optional] Any optional data to be associated with the property
        */
        constructor(name: string, value: boolean, category?: string, options?: any);
        /**
        * Attempts to clone the property
        * @returns PropBool}
        */
        clone(clone?: PropBool): PropBool;
    }
    class PropText extends Prop<string> {
        /**
        * Creates a new instance
        * @param {string} name The name of the property
        * @param {string} value The value of the property
        * @param {string} category [Optional] An optional category to describe this property's function
        * @param {any} options [Optional] Any optional data to be associated with the property
        */
        constructor(name: string, value: string, category?: string, options?: any);
        /**
        * Attempts to clone the property
        * @returns PropText}
        */
        clone(clone?: PropText): PropText;
    }
}
declare module Animate {
    /**
    * Defines a property variable. These are variables wrapped in sugar code to help sanitize and differentiate different pieces of data
    */
    class PropEnum extends Prop<string> {
        choices: Array<string>;
        /**
        * Creates a new instance
        * @param {string} name The name of the property
        * @param {string} value The value of the property
        * @param {number} choices The choices to select from
        * @param {string} category [Optional] An optional category to describe this property's function
        * @param {any} options [Optional] Any optional data to be associated with the property
        */
        constructor(name: string, value: string, choices: Array<string>, category?: string, options?: any);
        /**
       * Tokenizes the data into a JSON.
       * @param {boolean} slim If true, only the core value is exported. If false, additional data is exported so that it can be re-created at a later stage.
       * @returns {any}
       */
        tokenize(slim?: boolean): any;
        /**
        * Attempts to clone the property
        * @returns {PropEnum}
        */
        clone(clone?: PropEnum): PropEnum;
        /**
       * De-Tokenizes data from a JSON.
       * @param {any} data The data to import from
       */
        deTokenize(data: PropEnum): void;
    }
}
declare module Animate {
    /**
    * Defines a property variable. These are variables wrapped in sugar code to help sanitize and differentiate different pieces of data
    */
    class PropFileResource extends Prop<FileResource> {
        extensions: Array<string>;
        /**
        * Creates a new instance
        * @param {string} name The name of the property
        * @param {string} value The value of the property
        * @param {number} extensions The valid extends to use eg: ["bmp", "jpeg"]
        * @param {string} category [Optional] An optional category to describe this property's function
        * @param {any} options [Optional] Any optional data to be associated with the property
        */
        constructor(name: string, value: FileResource, extensions: Array<string>, category?: string, options?: any);
        /**
        * Attempts to clone the property
        * @returns {PropFileResource}
        */
        clone(clone?: PropFileResource): PropFileResource;
        /**
       * Tokenizes the data into a JSON.
       * @param {boolean} slim If true, only the core value is exported. If false, additional data is exported so that it can be re-created at a later stage.
       * @returns {any}
       */
        tokenize(slim?: boolean): any;
        /**
       * De-Tokenizes data from a JSON.
       * @param {any} data The data to import from
       */
        deTokenize(data: PropFileResource): void;
    }
}
declare module Animate {
    /**
    * Defines a property variable. These are variables wrapped in sugar code to help sanitize and differentiate different pieces of data
    */
    class PropNum extends Prop<number> {
        min: number;
        max: number;
        decimals: number;
        interval: number;
        /**
        * Creates a new instance
        * @param {string} name The name of the property
        * @param {number} value The value of the property
        * @param {number} min The minimum value this property can be
        * @param {number} max The maximum value this property can be
        * @param {number} decimals The number of decimals allowed
        * @param {number} interval The increment/decrement values of this number
        * @param {string} category [Optional] An optional category to describe this property's function
        * @param {any} options [Optional] Any optional data to be associated with the property
        */
        constructor(name: string, value: number, min?: number, max?: number, decimals?: number, interval?: number, category?: string, options?: any);
        /**
        * Attempts to fetch the value of this property
        * @returns {number}
        */
        getVal(): number;
        /**
        * Tokenizes the data into a JSON.
        * @param {boolean} slim If true, only the core value is exported. If false, additional data is exported so that it can be re-created at a later stage.
        * @returns {any}
        */
        tokenize(slim?: boolean): any;
        /**
        * De-Tokenizes data from a JSON.
        * @param {any} data The data to import from
        */
        deTokenize(data: PropNum): void;
        /**
        * Attempts to clone the property
        * @returns {PropNum}
        */
        clone(clone?: PropNum): PropNum;
    }
}
declare module Animate {
    /**
    * Defines an any property variable.
    */
    class PropObject extends Prop<any> {
        /**
        * Creates a new instance
        * @param {string} name The name of the property
        * @param {any} value The value of the property
        * @param {string} category [Optional] An optional category to describe this property's function
        * @param {any} options [Optional] Any optional data to be associated with the property
        */
        constructor(name: string, value: any, category?: string, options?: any);
        /**
        * Attempts to clone the property
        * @returns {PropObject}
        */
        clone(clone?: PropObject): PropObject;
    }
}
declare module Animate {
    /**
    * Defines a property variable. These are variables wrapped in sugar code to help sanitize and differentiate different pieces of data
    */
    class PropAsset extends Prop<ProjectResource<Engine.IResource>> {
        classNames: Array<string>;
        /**
        * Creates a new instance
        * @param {string} name The name of the property
        * @param {number} value The value of the property
        * @param {Array<string>} classNames An array of class names we can pick this resource from
        * @param {string} category [Optional] An optional category to describe this property's function
        * @param {any} options Any optional data to be associated with the property
        */
        constructor(name: string, value: ProjectResource<Engine.IResource>, classNames?: Array<string>, category?: string, options?: any);
        /**
        * Tokenizes the data into a JSON.
        * @param {boolean} slim If true, only the core value is exported. If false, additional data is exported so that it can be re-created at a later stage.
        * @returns {any}
        */
        tokenize(slim?: boolean): any;
        /**
        * De-Tokenizes data from a JSON.
        * @param {any} data The data to import from
        */
        deTokenize(data: any): void;
        /**
        * Attempts to clone the property
        * @returns {PropResource}
        */
        clone(clone?: PropAsset): PropAsset;
    }
}
declare module Animate {
    /**
    * Defines a property variable. These are variables wrapped in sugar code to help sanitize and differentiate different pieces of data
    */
    class PropGroup extends Prop<GroupArray> {
        /**
        * Creates a new instance
        * @param {string} name The name of the property
        * @param {GroupArray} value The value of the property
        * @param {string} category [Optional] An optional category to describe this property's function
        * @param {any} options Any optional data to be associated with the property
        */
        constructor(name: string, value: GroupArray, category?: string, options?: any);
        /**
        * Tokenizes the data into a JSON.
        * @param {boolean} slim If true, only the core value is exported. If false, additional data is exported so that it can be re-created at a later stage.
        * @returns {any}
        */
        tokenize(slim?: boolean): any;
        /**
        * De-Tokenizes data from a JSON.
        * @param {any} data The data to import from
        */
        deTokenize(data: any): void;
        /**
        * Attempts to clone the property
        * @returns {PropGroup}
        */
        clone(clone?: PropGroup): PropGroup;
    }
}
declare module Animate {
    /**
    * Defines a property variable. These are variables wrapped in sugar code to help sanitize and differentiate different pieces of data
    */
    class PropAssetList extends Prop<Array<ProjectResource<Engine.IResource>>> {
        classNames: Array<string>;
        /**
        * Creates a new instance
        * @param {string} name The name of the property
        * @param {Array<ProjectResource<Engine.IResource>>} value An array of project resources
        * @param {Array<string>} classNames An array of class names we can pick this resource from
        * @param {string} category [Optional] An optional category to describe this property's function
        * @param {any} options Any optional data to be associated with the property
        */
        constructor(name: string, value: Array<ProjectResource<Engine.IResource>>, classNames: Array<string>, category?: string, options?: any);
        /**
        * Tokenizes the data into a JSON.
        * @param {boolean} slim If true, only the core value is exported. If false, additional data is exported so that it can be re-created at a later stage.
        * @returns {any}
        */
        tokenize(slim?: boolean): any;
        /**
        * De-Tokenizes data from a JSON.
        * @param {any} data The data to import from
        */
        deTokenize(data: PropAsset): void;
        /**
        * Attempts to clone the property
        * @returns {PropResourceList}
        */
        clone(clone?: PropAssetList): PropAssetList;
    }
}
declare module Animate {
    /**
    * A small wrapper for colors
    */
    class Color {
        color: number;
        alpha: number;
        constructor(color?: number, alpha?: number);
        toString(): string;
    }
    /**
    * Defines a property variable. These are variables wrapped in sugar code to help sanitize and differentiate different pieces of data
    */
    class PropColor extends Prop<Color> {
        /**
        * Creates a new instance
        * @param {string} name The name of the property
        * @param {number} color The colour hex
        * @param {number} alpha The alpha value (0 to 1)
        * @param {string} category [Optional] An optional category to describe this property's function
        * @param {any} options [Optional] Any optional data to be associated with the property
        */
        constructor(name: string, color: number, alpha?: number, category?: string, options?: any);
        /**
        * Tokenizes the data into a JSON.
        * @param {boolean} slim If true, only the core value is exported. If false, additional data is exported so that it can be re-created at a later stage.
        * @returns {any}
        */
        tokenize(slim?: boolean): any;
        /**
        * Attempts to clone the property
        * @returns {PropColor}
        */
        clone(clone?: PropColor): PropColor;
        /**
        * De-Tokenizes data from a JSON.
        * @param {any} data The data to import from
        */
        deTokenize(data: Color): void;
    }
}
declare module Animate {
    /**
    * The interface for all layout objects.
    */
    interface ILayout {
        /**
        * Sets the component offsets based the layout algorithm
        * @param {Component} component The {Component} we are setting dimensions for.
        */
        update(component: Component): void;
    }
}
declare module Animate {
    /**
    * A simple Percentile layout. Changes a component's dimensions to be a
    * percentage of its parent width and height.
    */
    class Percentile implements ILayout {
        widthPercent: number;
        heightPercent: number;
        constructor(widthPercent?: number, heightPercent?: number);
        /**
        * Sets the component width and height to its parent.
        * @param {Component} component The {Component} we are setting dimensions for.
        */
        update(component: Component): void;
    }
}
declare module Animate {
    /**
    * A simple fill layout. Fills a component to its parent width and height. Optional
    * offsets can be used to tweak the fill.
    */
    class Fill implements ILayout {
        offsetX: number;
        offsetY: number;
        offsetWidth: number;
        offsetHeight: number;
        resrtictHorizontal: boolean;
        resrtictVertical: boolean;
        constructor(offsetX?: number, offsetY?: number, offsetWidth?: number, offsetHeight?: number, resrtictHorizontal?: boolean, resrtictVertical?: boolean);
        /**
        * Sets the component width and height to its parent.
        * @param {Component} component The {Component} we are setting dimensions for.
        */
        update(component: Component): void;
    }
}
declare module Animate {
    class ComponentEvents extends ENUM {
        constructor(v: string);
        static UPDATED: ComponentEvents;
    }
    /**
    * The base class for all visual elements in the application. The {Component} class
    * contains a reference of a jQuery object that points to the {Component}'s DOM representation.
    */
    class Component extends EventDispatcher implements IComponent {
        static idCounter: number;
        private _element;
        private _children;
        private _layouts;
        private _id;
        private _parent;
        private _tooltip;
        private _enabled;
        tag: any;
        savedID: string;
        constructor(html: string | JQuery, parent?: Component);
        /**
        * Diposes and cleans up this component and all its child {Component}s
        */
        dispose(): void;
        /**
        * This function is called to update this component and its children.
        * Typically used in sizing operations.
        * @param {boolean} updateChildren Set this to true if you want the update to proliferate to all the children components.
        */
        update(updateChildren?: boolean): void;
        /**
        * Add layout algorithms to the {Component}.
        * @param {ILayout} layout The layout object we want to add
        * @returns {ILayout} The layout that was added
        */
        addLayout(layout: ILayout): ILayout;
        /**
        * Removes a layout from this {Component}
        * @param {ILayout} layout The layout to remove
        * @returns {ILayout} The layout that was removed
        */
        removeLayout(layout: ILayout): ILayout;
        /**
        * Gets the ILayouts for this component
        * {returns} Array<ILayout>
        */
        layouts: Array<ILayout>;
        /**
        * Use this function to add a child to this component.
        * This has the same effect of adding some HTML as a child of another piece of HTML.
        * It uses the jQuery append function to achieve this functionality.
        * @param {string | IComponent | JQuery} child The child component we want to add
        * @returns {IComponent} The added component
        */
        addChild(child: string | IComponent | JQuery): IComponent;
        /**
        * Checks to see if a component is a child of this one
        * @param {IComponent} child The {IComponent} to check
        * @returns {boolean} true if the component is a child
        */
        contains(child: IComponent): boolean;
        /**
        * Use this function to remove a child from this component.
        * It uses the {JQuery} detach function to achieve this functionality.
        * @param {IComponent} child The {IComponent} to remove from this {IComponent}'s children
        * @returns {IComponent} The {IComponent} we have removed
        */
        removeChild(child: IComponent): IComponent;
        /**
        * Removes all child nodes
        */
        clear(): void;
        onDelete(): void;
        /**
        * Returns the array of Child {Component}s
        * @returns {Array{IComponent}} An array of child {IComponent} objects
        */
        children: Array<IComponent>;
        /**
        * Gets the jQuery wrapper
        */
        element: JQuery;
        /**
        * Gets the jQuery parent
        */
        parent: Component;
        /**
        * Gets the tooltip for this {Component}
        */
        /**
        * Sets the tooltip for this {Component}
        */
        tooltip: string;
        /**
        * Get or Set if the component is enabled and recieves mouse events
        */
        /**
        * Get or Set if the component is enabled and recieves mouse events
        */
        enabled: boolean;
        /**
        * Gets the ID of thi component
        */
        id: string;
        /**
        * Get or Set if the component is selected. When set to true a css class of 'selected' is added to the {Component}
        */
        /**
        * Get or Set if the component is selected. When set to true a css class of 'selected' is added to the {Component}
        */
        selected: boolean;
    }
}
declare module Animate {
    enum SplitOrientation {
        VERTICAL = 0,
        HORIZONTAL = 1,
    }
    interface ISplitPanelProps {
        left?: JSX.Element;
        right?: JSX.Element;
        top?: JSX.Element;
        bottom?: JSX.Element;
        orientation?: SplitOrientation;
        ratio?: number;
        dividerSize?: number;
        onRatioChanged?: (ratio: number) => void;
    }
    interface ISplitPanelState {
        ratio?: number;
        dragging?: boolean;
    }
    /**
     * A Component that holds 2 sub Components and a splitter to split between them.
     */
    class SplitPanel extends React.Component<ISplitPanelProps, ISplitPanelState> {
        static defaultProps: ISplitPanelProps;
        private mMouseUpProxy;
        private mMouseMoveProxy;
        /**
         * Creates a new instance
         */
        constructor(props: ISplitPanelProps);
        /**
         * Called when the props are updated
         */
        componentWillReceiveProps(nextProps: ISplitPanelProps): void;
        /**
         * Creates the component elements
         * @returns {JSX.Element}
         */
        render(): JSX.Element;
        /**
          * This function is called when the mouse is down on the divider
          * @param {React.MouseEvent} e
          */
        onDividerMouseDown(e: React.MouseEvent): void;
        /**
         * Recalculate the ratios on mouse up
         * @param {MouseEvent} e
         */
        onStageMouseUp(e: MouseEvent): void;
        /**
         * This function is called when the mouse is up from the body of stage.
         * @param {any} e The jQuery event object
         */
        onStageMouseMove(e: MouseEvent): void;
        /**
         * Call this function to get the ratio of the panel. Values are from 0 to 1.
         * @returns {number}
         */
        /**
         * Call this function to set the ratio of the panel. Values are from 0 to 1.
         * @param {number} val The ratio from 0 to 1 of where the divider should be
         */
        ratio: number;
    }
}
declare module Animate {
    class WindowEvents extends ENUM {
        constructor(v: string);
        static HIDDEN: WindowEvents;
        static SHOWN: WindowEvents;
    }
    /**
    * This class is the base class for all windows in Animate
    */
    class Window extends Component {
        private _autoCenter;
        private _controlBox;
        private _header;
        private _headerText;
        private _headerCloseBut;
        private _content;
        private _modalBackdrop;
        private _isVisible;
        private _externalClickProxy;
        private _closeProxy;
        private _resizeProxy;
        /**
        * @param {number} width The width of the window in pixels
        * @param {number} height The height of the window in pixels
        * @param {boolean} autoCenter Should this window center itself on a resize event
        * @param {boolean} controlBox Does this window have a draggable title bar and close button
        * @param {string} title The text for window heading.Only applicable if we are using a control box.
        */
        constructor(width: number, height: number, autoCenter?: boolean, controlBox?: boolean, title?: string);
        /**
        * When we click on the close button
        * @param {any} e The jQuery event object
        */
        onCloseClicked(e: any): void;
        /**
        * When the stage move event is called
        * @param {any} e The jQuery event object
        */
        onStageMove(e: any): void;
        /**
        * Removes the window and modal from the DOM.
        */
        hide(): void;
        /**
        * Centers the window into the middle of the screen. This only works if the elements are added to the DOM first
        */
        center(): void;
        /**
        * Shows the window by adding it to a parent.
        * @param {Component} parent The parent Component we are adding this window to
        * @param {number} x The x coordinate of the window
        * @param {number} y The y coordinate of the window
        * @param {boolean} isModal Does this window block all other user operations?
        * @param {boolean} isPopup If the window is popup it will close whenever anything outside the window is clicked
        */
        show(parent?: Component, x?: number, y?: number, isModal?: boolean, isPopup?: boolean): void;
        /**
        * When we click the modal window we flash the window
        * @param {object} e The jQuery event object
        */
        onModalClicked(e: any): void;
        /**
        * Updates the dimensions if autoCenter is true.
        * @param {object} val
        */
        onWindowResized(val: any): void;
        /**
        * Hides the window if its show property is set to true
        * @param {any} e The jQuery event object
        */
        onStageClick(e: any): void;
        /** Gets the content component */
        content: Component;
        visible: boolean;
        headerText: string;
        modalBackdrop: JQuery;
        /**
        * This will cleanup the component.
        */
        dispose(): void;
    }
}
declare module Animate {
    interface IReactWindowProps {
        autoCenter?: boolean;
        title?: string;
        modal?: boolean;
        popup?: boolean;
        controlBox?: boolean;
        showCloseButton?: boolean;
        canResize?: boolean;
        className?: string;
        _id?: number;
        _closing?: () => void;
        x?: number;
        y?: number;
    }
    interface IReactWindowState {
        centered?: boolean;
    }
    /**
     * The base class for all windows in the application. Most windows will be derived from this class.
     * You can display/hide the window by using the static Window.show and Window.hide methods.
     */
    class ReactWindow<T extends IReactWindowProps, S extends IReactWindowState> extends React.Component<T, S> {
        private static _openWindows;
        private static _windows;
        static defaultProps: IReactWindowProps;
        private _resizeProxy;
        private _mouseMoveProxy;
        private _mouseUpProxy;
        private _mouseDeltaX;
        private _mouseDeltaY;
        /**
         * Creates an instance of the react window
         */
        constructor(props: T);
        /**
         * Shows a React window component to the user
         * @param {React.ComponentClass<IReactWindowProps>} windowType The Class of Window to render.
         * @param {IReactWindowProps} props The properties to use for the window component
         */
        static show(windowType: React.ComponentClass<IReactWindowProps>, props?: IReactWindowProps): number;
        /**
         * Hides/Removes a window component by id
         * @param {number} id
         */
        static hide(id: number): void;
        /**
         * When the user clicks the the header bar we initiate its dragging
         */
        onHeaderDown(e: React.MouseEvent): void;
        /**
         * Called when the window is resized
         */
        onResize(e: any): void;
        /**
         * When the mouse moves and we are dragging the header bar we move the window
         */
        onMouseMove(e: MouseEvent): void;
        /**
         * When the mouse is up we remove the dragging event listeners
         */
        onMouseUp(e: MouseEvent): void;
        /**
         * When the component is mounted
         */
        componentDidMount(): void;
        /**
         * Called when the window is to be removed
         */
        componentWillUnmount(): void;
        /**
         * When we click the modal we highlight the window
         */
        onModalClick(): void;
        /**
         * When we click the close button
         */
        onClose(): void;
        /**
         * Gets the content JSX for the window. Typically this is the props.children, but can be overriden
         * in derived classes
         */
        getContent(): React.ReactNode;
        /**
         * Creates the component elements
         * @returns {JSX.Element}
         */
        render(): JSX.Element;
    }
}
declare module Animate {
    interface IReactContextMenuItem {
        onSelect?: (item: IReactContextMenuItem) => void;
        tag?: any;
        label: string;
        prefix?: JSX.Element;
        image?: string;
        items?: IReactContextMenuItem[];
    }
    interface IReactContextMenuProps {
        x: number;
        y: number;
        className?: string;
        onChange?: (item: IReactContextMenuItem) => void;
        items?: IReactContextMenuItem[];
        _closing?: () => void;
    }
    /**
     * A React component for showing a context menu.
     * Simply call ReactContextMenu.show and provide the IReactContextMenuItem items to show
     */
    class ReactContextMenu extends React.Component<IReactContextMenuProps, any> {
        private static _menuCount;
        private static _menus;
        static defaultProps: IReactContextMenuProps;
        private _mouseUpProxy;
        /**
         * Creates a context menu instance
         */
        constructor(props: IReactContextMenuProps);
        /**
         * When we click on a menu item
         */
        private onMouseDown(e, item);
        /**
         * Draws each of the submenu items
         */
        private drawMenuItems(item, level, index);
        /**
         * Creates the component elements
         * @returns {JSX.Element}
         */
        render(): JSX.Element;
        /**
         * When the mouse is up we remove the dragging event listeners
         */
        private onMouseUp(e);
        /**
         * When the component is mounted
         */
        componentDidMount(): void;
        /**
         * Called when the component is to be removed
         */
        componentWillUnmount(): void;
        /**
         * Shows a React context menu component to the user
         * @param {IReactContextMenuProps} props The properties to use for the context menu component
         */
        static show(props: IReactContextMenuProps): number;
        /**
         * Hides/Removes a context menu component by id
         * @param {number} id
         */
        static hide(id: number): void;
    }
}
declare module Animate {
    interface ITabProps {
        panes: React.ReactElement<ITabPaneProps>[];
    }
    interface ITabState {
        selectedIndex: number;
    }
    /**
     * A Tab Component for organising pages of content into separate labelled tabs/folders
     */
    class Tab extends React.Component<ITabProps, ITabState> {
        private _panes;
        /**
         * Creates a new instance of the tab
         */
        constructor(props: ITabProps);
        /**
         * When the props are reset we remove all the existing panes and create the new ones
         */
        componentWillReceiveProps(nextProps: ITabProps): void;
        /**
         * Removes a pane from from the tab
         * @param {number} index The index of the selected tab
         * @param {ITabPaneProps} props props of the selected tab
         */
        removePane(index: number, prop: ITabPaneProps): void;
        /**
         * Creates the component elements
         * @returns {JSX.Element}
         */
        render(): JSX.Element;
        /**
         * When we select a tab
         * @param {number} index The index of the selected tab
         * @param {ITabPaneProps} props props of the selected tab
         */
        onTabSelected(index: number, props: ITabPaneProps): void;
        /**
         * Select a panel by index
         * @param {number} index
         */
        selectByIndex(index: number): ITabPaneProps;
        /**
         * Select a panel by its label
         * @param {string} label
         */
        selectByLabel(label: string): ITabPaneProps;
        /**
         * Select a panel by its property object
         * @param {ITabPaneProps} props
         */
        selectByProps(props: ITabPaneProps): ITabPaneProps;
        /**
         * Shows the context menu
         */
        showContext(e: React.MouseEvent): void;
        /**
         * Adds a dynamic pane to the tab
         */
        addTab(pane: React.ReactElement<ITabPaneProps>): void;
        /**
         * Gets a tab's' props by its label
         * @param {string} val The label text of the tab
         * @returns {TabPair} The tab pair containing both the label and page {Component}s
         */
        getPaneByLabel(label: string): ITabPaneProps;
        /**
         * Called when the component is unmounted
         */
        componentwillunmount(): void;
        /**
         * Removes all panes from the tab
         */
        clear(): void;
        /**
         * Gets an array of all the tab props
         * @returns {ITabPaneProps[]}
         */
        panes: ITabPaneProps[];
    }
}
declare module Animate {
    interface ITabPaneProps {
        label: string;
        showCloseButton?: boolean;
        onDispose?: (paneIndex: number, prop: ITabPaneProps) => void;
        canSelect?: (paneIndex: number, prop: ITabPaneProps) => boolean | Promise<boolean>;
        canClose?: (paneIndex: number, prop: ITabPaneProps) => boolean | Promise<boolean>;
    }
    /**
     * A single page/pane/folder pair for use in a Tab
     */
    class TabPane extends React.Component<ITabPaneProps, any> {
        static defaultProps: ITabPaneProps;
        /**
         * Creates a new pane instance
         */
        constructor(props: ITabPaneProps);
        /**
         * Creates the component elements
         * @returns {JSX.Element}
         */
        render(): JSX.Element;
    }
}
declare module Animate {
    /**
    * This class is a small container class that is used by the Tab class. It creates TabPairs
    * each time a tab is created with the addTab function. This creates a TabPair object that keeps a reference to the
    * label and page as well as a few other things.
    */
    class TabPair {
        tab: Tab;
        tabSelector: Component;
        page: Component;
        name: string;
        private _savedSpan;
        private _modified;
        constructor(selector: Component, page: Component, name: string);
        /**
        * Gets if this tab pair has been modified or not
        * @returns {boolean}
        */
        /**
        * Sets if this tab pair has been modified or not
        * @param {boolean} val
        */
        modified: boolean;
        /**
        * Called when the editor is resized
        */
        onResize(): void;
        /**
        * Called by the tab class when the pair is to be removed.
        * @param {TabEvent} data An object that can be used to cancel the operation. Simply call data.cancel = true to cancel the closure.
        */
        onRemove(data: TabEvent): void;
        /**
        * Called by the tab when the save all button is clicked
        */
        onSaveAll(): void;
        /**
        * Called when the pair has been added to the tab
        */
        onAdded(): void;
        /**
        * Called when the pair has been selected
        */
        onSelected(): void;
        /**
        * Gets the label text of the pair
        */
        /**
        * Sets the label text of the pair
        */
        text: string;
        /**
        * Cleans up the references
        */
        dispose(): void;
    }
}
declare module Animate {
    interface IListItem {
        label: string;
        icon?: string;
        prefix?: JSX.Element;
    }
    interface IListProps {
        items: IListItem[];
        onSelected?: (item: IListItem, index: number) => void;
        onDSelected?: (item: IListItem, index: number) => void;
        selectedIndex?: number;
        canDeselect?: boolean;
    }
    interface IListState {
        selected?: IListItem;
        selectedIndex?: number;
    }
    /**
     * A list of items, with optional tooltips & icons
     */
    class List extends React.Component<IListProps, IListState> {
        static defaultProps: IListProps;
        private _prevItems;
        /**
         * Creates an instance
         */
        constructor(props: IListProps);
        /**
         * Called when the props are updated
         */
        componentWillReceiveProps(nextProps: IListProps): void;
        /**
         * Creates the component elements
         * @returns {JSX.Element}
         */
        render(): JSX.Element;
        componentDidUpdate(prevProps: IListProps): void;
        /**
         * Called whenever a list item is selected
         */
        onItemSelected(e: React.MouseEvent, item: IListItem, index: number, doubleClick: boolean): void;
    }
}
declare module Animate {
    type LinkMap = {
        [shallowId: number]: {
            item: CanvasItem;
            token: ICanvasItem;
        };
    };
    /**
     * The base class for all canvas items
     */
    class CanvasItem extends EventDispatcher {
        top: number;
        left: number;
        className: string;
        store: CanvasStore;
        id: number;
        private _selected;
        /**
         * Creates an instance
         */
        constructor();
        /**
         * Called when we activate the context menu on the behaviour
         */
        onContext(e: React.MouseEvent): void;
        /**
         * Gets or sets if the item is selected
         * @param {boolean} val
         * @returns {boolean}
         */
        selected(val?: boolean): boolean;
        /**
         * Serializes the data into a JSON.
         * @param {number} id
         * @returns {ICanvasItem}
         */
        serialize(id: number): ICanvasItem;
        /**
         * De-serialize data from a JSON.
         * @param {ICanvasItem} data The data to import from
         */
        deSerialize(data: ICanvasItem): void;
        /**
         * Called after de-tokenization. This is so that the items can link up to any other items that might have been created in the process.
         * @param {number} originalId The original shallow ID of the item when it was tokenized.
         * @param {LinkMap} items The items loaded from the detokenization process. To get this item you can do the following: items[originalId].item
         * or to get the token you can use items[originalId].token
         */
        link(originalId: number, items: LinkMap): void;
        /**
         * Causes the store to refresh its state
         */
        invalidate(): void;
        /**
         * Clean up
         */
        dispose(): void;
    }
}
declare module Animate {
    /**
     * Behaviours are the model data of BehaviourComponents and represent a behaviour/set of functionality
     * that has been added to a container.
     */
    class Behaviour extends CanvasItem {
        alias: string;
        canGhost: boolean;
        behaviourType: string;
        private _parameters;
        private _products;
        private _outputs;
        private _inputs;
        private _portals;
        private _properties;
        /**
         * Creates an instance of the behaviour
         */
        constructor();
        /**
         * Gets a portal by its name
         * @param {string} name The portal name
         * @returns {Portal}
         */
        getPortal(name: string): Portal;
        /**
         * Adds a portal to this behaviour.
         * @param {PortalType} type The type of portal we are adding. It can be either 'input', 'output', 'parameter' & 'product'
         * @param {Prop<any>} property
         * @param {boolean} custom Declares if this portal is a custom one added by the user
         * @returns {Portal}
         */
        addPortal(type: PortalType, property: Prop<any>, custom?: boolean): Portal;
        /**
        * Removes a portal from this behaviour
        * @param {Portal} toRemove The portal object we are removing
        * @returns {Portal} The portal we have removed. This would be disposed if dispose was set to true.
        */
        removePortal(toRemove: Portal): Portal;
        /**
         * Serializes the data into a JSON.
         * @param {number} id
         * @returns {IBehaviour}
         */
        serialize(id: number): IBehaviour;
        /**
         * De-Serializes data from a JSON.
         * @param {IBehaviour} data The data to import from
         */
        deSerialize(data: IBehaviour): void;
        /**
         * Diposes and cleans up this component and its portals
         */
        dispose(): void;
        properties: EditableSet;
        parameters: Array<Portal>;
        products: Array<Portal>;
        outputs: Array<Portal>;
        inputs: Array<Portal>;
        portals: Array<Portal>;
    }
}
declare module Animate {
    /**
     * A behaviour for representing container portals
     */
    class BehaviourPortal extends Behaviour {
        private _portalType;
        private _property;
        /**
         * Creates an instance
         */
        constructor(property: Prop<any>, portalType?: PortalType);
        /**
         * Serializes the data into a JSON.
         * @param {number} id
         * @returns {IBehaviourPortal}
         */
        serialize(id: number): IBehaviourPortal;
        /**
         * De-Serializes data from a JSON.
         * @param {IBehaviourPortal} data The data to import from
         */
        deSerialize(data: IBehaviourPortal): void;
        /**
         * This will cleanup the component.
         */
        dispose(): void;
        portaltype: PortalType;
        property: Prop<any>;
    }
}
declare module Animate {
    /**
    * A portal class for behaviours. There are 4 different types of portals -
    * INPUT, OUTPUT, PARAMETER and PRODUCT. Each portal acts as a gate for a behaviour.
    */
    class Portal extends EventDispatcher {
        links: Array<any>;
        custom: boolean;
        type: PortalType;
        property: Prop<any>;
        behaviour: Behaviour;
        /**
        * @param {Behaviour} parent The parent component of the Portal
        * @param {PortalType} type The portal type. This can be either Portal.INPUT, Portal.OUTPUT, Portal.PARAMETER or Portal.PRODUCT
        * @param {Prop<any>} property The property associated with this portal
        */
        constructor(parent: Behaviour, type: PortalType, property: Prop<any>, custom?: boolean);
        serialize(): IPortal;
        /**
        * Edits the portal variables
        * @param {Prop<any>} property The new value of the property
        */
        edit(property: Prop<any>): void;
        /**
         * This function will check if the source portal is an acceptable match with the current portal.
         * @param {Portal} source The source panel we are checking against
         */
        checkPortalLink(source: Portal): boolean;
        /**
         * Clean up
         */
        dispose(): void;
        /**
         * Adds a link to the portal.
         * @param {Link} link The link we are adding
         */
        addLink(link: any): void;
        /**
         * Removes a link from the portal.
         * @param {Link} link The link we are removing
         */
        removeLink(link: any): any;
    }
}
declare module Animate {
    class CanvasEvents extends ENUM {
        constructor(v: string);
        static MODIFIED: CanvasEvents;
    }
    /**
    * The canvas is used to create diagrammatic representations of behaviours and how they interact in the scene.
    */
    class Canvas extends Component {
        static lastSelectedItem: any;
        static snapping: boolean;
        name: string;
        private _upProxy;
        private _downProxy;
        private _contextProxy;
        private _keyProxy;
        private _contextNode;
        private _x;
        private _y;
        private _container;
        private _containerReferences;
        private _proxyMoving;
        private _proxyStartDrag;
        private _proxyStopDrag;
        private _loadingScene;
        /**
        * @param {Component} parent The parent component to add this canvas to
        * @param {Container} cntainer Each canvas represents a behaviour.This container is the representation of the canvas as a behaviour.
        */
        constructor(parent: Component, container: Container);
        container: Container;
        containerReferences: {
            groups: Array<number>;
            assets: Array<number>;
        };
    }
}
declare module Animate {
    interface IReactCanvasProps {
        store: CanvasStore;
    }
    class ReactCanvas extends React.Component<IReactCanvasProps, {
        items: CanvasItem[];
    }> {
        private static _openCanvases;
        constructor(props: IReactCanvasProps);
        componentWillReceiveProps(nextProps: IReactCanvasProps): void;
        /**
         * Clean up any listeners
         */
        componentWillUnmount(): void;
        /**
         * When the store changes, we update the state
         */
        invalidate(): void;
        renderBehaviour(behaviour: Behaviour, index: number): JSX.Element;
        /**
         * Called when a draggable object is dropped onto the canvas.
         * @param {React.MouseEvent} e
         * @param {IDragDropToken} json
         */
        onObjectDropped(e: React.MouseEvent, json: IDragDropToken): void;
        /**
        * This will create a canvas node based on the template given
        * @param {BehaviourDefinition} template The definition of the node
        * @param {number} x The x position of where the node shoule be placed
        * @param {number} y The y position of where the node shoule be placed
        * @param {Container} container This is only applicable if we are dropping a node that represents another behaviour container. This last parameter
        * is the actual behaviour container
        * @param {string} name The name of the node
        * @returns {Behaviour}
        */
        createNode(template: BehaviourDefinition, x: number, y: number, container?: Container, name?: string): Behaviour;
        onContext(e: React.MouseEvent): void;
        /**
         * Creates the component elements
         * @returns {JSX.Element}
         */
        render(): JSX.Element;
    }
}
declare module Animate {
    /**
     * A store of various diagram items
     */
    class CanvasStore extends EventDispatcher {
        protected _items: CanvasItem[];
        protected _selection: CanvasItem[];
        /**
         * Creates an instance of the canvas store
         */
        constructor(items?: CanvasItem[]);
        getItems(): CanvasItem[];
        /**
         * Called whenever an item is clicked.
         * @param {CanvasItem} node
         * @param {boolean} shiftDown
         */
        onNodeSelected(node: CanvasItem, shiftDown: boolean, toggleSelectedState?: boolean): void;
        /**
         * Called whenever the selection has changed
         * @param {CanvasItem[]} selection
         */
        onSelectionChange(selection: CanvasItem[]): void;
        /**
         * Adds a canvas item to the canvas
         * @param {CanvasItem} item
         * @returns {CanvasItem}
         */
        addItem(item: CanvasItem): CanvasItem;
        /**
         * Removes a canvas item from the canvas
         * @param {CanvasItem} item
         */
        removeItem(item: CanvasItem): void;
        /**
         * Gets all the canvas items in a serialized array
         * @returns {ICanvasItem[]}
         */
        serialize(): ICanvasItem[];
        /**
         * Triggers a change in the tree structure
         */
        invalidate(): void;
    }
}
declare module Animate {
    interface IBehaviourComponentProps {
        behaviour: Behaviour;
    }
    /**
     * A visual representation of a Behaviour
     */
    class BehaviourComponent extends React.Component<IBehaviourComponentProps, any> {
        private _upProxy;
        private _moveProxy;
        private _mouseDelta;
        private _scrollInterval;
        /**
         * Creates an instance of the component
         */
        constructor(props: IBehaviourComponentProps);
        /**
         * When unmounting, we remove any listeners
         */
        componentWillUnmount(): void;
        onLinkStart(e: React.MouseEvent): void;
        /**
         * When the mouse is down on the behaviour, we add the drag listeners
         * @param {React.MouseEvent} e
         */
        onMouseDown(e: React.MouseEvent): void;
        /**
         * When the mouses moves we drag the behaviour
         * @param {React.MouseEvent} e
         */
        onMouseMove(e: React.MouseEvent): void;
        /**
         * When the mouse is up we remove the events
         * @param {React.MouseEvent} e
         */
        onMouseUp(e: React.MouseEvent): void;
        /**
         * Creates the component elements
         * @returns {JSX.Element}
         */
        render(): JSX.Element;
    }
}
declare module Animate {
    interface ITreeViewProps {
        nodeStore: TreeNodeStore;
    }
    interface ITreeViewState {
        nodes?: TreeNodeModel[];
        focussedNode?: TreeNodeModel;
    }
    /**
     * A component visually represents a TreeNodeStore and its nodes
     */
    class TreeView extends React.Component<ITreeViewProps, ITreeViewState> {
        /**
         * Creates a new instance of the treenode
         */
        constructor(props: ITreeViewProps);
        /**
         * Called whenever a node is focussed
         */
        onFocusNodeChange(type: EditorEventType, e: Event): void;
        /**
         * Called whenever we need to re-create the prop tree. Usually after the structure of the nodes has changed
         */
        onChange(type: EditorEventType): void;
        /**
         * When the component is updated, we check for any focussed nodes so we can scroll to them
         */
        componentDidUpdate(): void;
        /**
         * Make sure that any new node store has the appropriate event handlers
         */
        componentWillReceiveProps(nextProps: ITreeViewProps): void;
        /**
         * Cleans up the component
         */
        componentWillUnmount(): void;
        /**
         * Creates the component elements
         * @returns {JSX.Element}
         */
        render(): JSX.Element;
    }
}
declare module Animate {
    interface ITreeNodeProps {
        node: TreeNodeModel;
    }
    /**
     * This visual representation of a TreeNodeModel
     */
    class TreeNode extends React.Component<ITreeNodeProps, any> {
        private _dropProxy;
        /**
         * Creates an instance
         */
        constructor(props: ITreeNodeProps);
        /**
         * Creates the component elements
         * @returns {JSX.Element}
         */
        render(): JSX.Element;
    }
}
declare module Animate {
    /**
     * This class is used to create tree view items.
     */
    class TreeNodeStore extends EventDispatcher {
        protected _children: TreeNodeModel[];
        protected _selectedNodes: TreeNodeModel[];
        protected _multiSelect: boolean;
        protected _onlySimilarNodeSelection: boolean;
        /**
         * Creates a treenode store
         */
        constructor(children?: TreeNodeModel[]);
        /**
         * Adds a child node
         * @param {TreeNodeModel} node
         * @returns {TreeNodeModel}
         */
        addNode(node: TreeNodeModel): TreeNodeModel;
        /**
         * Removes a child node
         * @param {TreeNodeModel} node
         */
        removeNode(node: TreeNodeModel): void;
        /**
         * Removes all nodes from the store
         */
        clear(): void;
        /**
         * Triggers a change in the tree structure
         */
        invalidate(): void;
        /**
         * Called whenever the selection has changed
         * @param {TreeNodeModel[]} selection
         */
        onSelectionChange(selection: TreeNodeModel[]): void;
        /**
         * Called whenever a node is selectable and clicked.
         * @param {TreeNodeModel} node
         * @param {boolean} shiftDown
         */
        onNodeSelected(node: TreeNodeModel, shiftDown: boolean, toggleSelectedState?: boolean): void;
        /**
         * Sets the store of the node and all its children to be this store
         */
        setStore(node: TreeNodeModel): void;
        private unFocus(node);
        /**
         * Called whenever the node receives a context event
         * @param {React.MouseEvent} e
         * @param {TreeNodeModel} node
         */
        onContext(e: React.MouseEvent, node: TreeNodeModel): void;
        /**
         * This will recursively look through each of the nodes to find a node with
         * the specified name.
         * @param {string} property The name property we are evaluating
         * @param {any} value The object we should be comparing against
         * @returns {TreeNodeModel}
         */
        findNode(property: string, value: any): TreeNodeModel;
        /**
         * Selects a node manually. This will also bring the focus into node
         */
        selectNode(node: TreeNodeModel): void;
        /**
         * Gets the nodes associated with this store
         * @returns {TreeNodeModel[]}
         */
        getNodes(): TreeNodeModel[];
        /**
         * Gets the currently selected nodes
         * @returns {TreeNodeModel[]}
         */
        getSelectedNodes(): TreeNodeModel[];
    }
}
declare module Animate {
    class TreeNodeModel {
        private _icon;
        private _label;
        private _selected;
        private _expanded;
        private _disabled;
        private _selectable;
        children: TreeNodeModel[];
        protected _parent: TreeNodeModel;
        store: TreeNodeStore;
        focussed: boolean;
        canDrag: boolean;
        canDrop: boolean;
        /**
         * Creates an instance of the node
         */
        constructor(label: string, icon?: JSX.Element, children?: TreeNodeModel[]);
        /**
         * Gets the parent node
         * @returns {TreeNodeModel}
         */
        parent: TreeNodeModel;
        /**
         * Gets or sets the label of the node
         * @param {string} val
         * @returns {string}
         */
        label(val?: string): string;
        /**
         * Called whenever we start dragging. This is only called if canDrag is true.
         * Use it to set drag data, eg: e.dataTransfer.setData("text", 'some data');
         * @param {React.DragEvent} e
         * @returns {IDragDropToken} Return data to serialize
         */
        onDragStart(e: React.DragEvent): IDragDropToken;
        /**
         * Called whenever we drop an item on this element. This is only called if canDrop is true.
         * Use it to set drag data, eg: e.dataTransfer.getData("text");
         * @param {React.DragEvent} e
         * @param {IDragDropToken} json The unserialized data
         */
        onDragDrop(e: React.DragEvent, json: IDragDropToken): void;
        /**
         * Gets or sets if the node is selected
         * @param {boolean} val
         * @returns {boolean}
         */
        selected(val?: boolean): boolean;
        /**
         * Gets or sets if the node is disabled
         * @param {boolean} val
         * @returns {boolean}
         */
        disabled(val?: boolean): boolean;
        /**
         * Gets or sets if the node is selectable
         * @param {boolean} val
         * @returns {boolean}
         */
        selectable(val?: boolean): boolean;
        /**
         * Gets or sets if the node is expanded
         * @param {boolean} val
         * @returns {boolean}
         */
        expanded(val?: boolean): boolean;
        /**
         * Gets or sets the icon of the node
         * @param {JSX.Element} val
         * @returns {JSX.Element}
         */
        icon(val?: JSX.Element): JSX.Element;
        /**
         * Attempts to trigger a change event on the store
         */
        protected invalidate(): void;
        /**
         * Adds a child node
         * @param {TreeNodeModel} node
         * @returns {TreeNodeModel}
         */
        addNode(node: TreeNodeModel): TreeNodeModel;
        /**
         * Removes a child node
         * @param {TreeNodeModel} node
         */
        removeNode(node: TreeNodeModel): void;
        /**
         * Called whenever the node receives a context event
         * @param {React.MouseEvent} e
         */
        onContext(e: React.MouseEvent): void;
        /**
         * This will recursively look through each of the nodes to find one with
         * the specified name and value.
         * @param {string} property The Javascript property on the node that we are evaluating
         * @param {any} value The value of the property we are comparing.
         * @returns {TreeNodeModel}
         */
        findNode(property: string, value: any): TreeNodeModel;
        /**
         * This will cleanup the model
         */
        dispose(): void;
    }
}
declare module Animate {
    /**
    * An implementation of the tree view for the scene.
    */
    class TreeViewScene extends TreeNodeStore {
        private static _singleton;
        private _quickCopy;
        private _quickAdd;
        private _shortcutProxy;
        constructor();
        onShortcutClick(e: any): void;
        onMouseMove(e: any): void;
        /**
        * Called when the project is loaded and ready.
        */
        projectReady(project: Project): void;
        /**
        * TODO: This is currently hooked on when a resource is created using the createResource call in project. Ideally this should be called whenever
        * any form of resource is created. I.e. try to get rid of addAssetInstance
        * Called whenever a project resource is created
        */
        onResourceCreated(type: string, event: ProjectEvent<ProjectResource<Engine.IResource>>): void;
        /**
        * Called when the project is reset by either creating a new one or opening an older one.
        */
        projectReset(project: Project): void;
        /**
        * Catch the key down events.
        * @param e The event passed by jQuery
        */
        onKeyDown(e: any): void;
        /**
        * Called when we select a menu item.
        */
        onContextSelect(response: Event, event: Event, sender?: EventDispatcher): void;
        /**
        * When we double click the tree
        * @param <object> e The jQuery event object
        */
        onDblClick(e: any): void;
        /**
        * When the database returns from its command.
        * @param {ProjectEvents} response The loader response
        * @param {ProjectEvent} data The data sent from the server
        */
        /**
        * This function will get a list of asset instances based on their class name.
        * @param {string|Array<string>} classNames The class name of the asset, or an array of class names
        * @returns Array<TreeNodeAssetInstance>
        */
        getAssets(classNames: string | Array<string>): Array<TreeNodeAssetInstance>;
        /**
        * This function will get a list of asset classes.
        * returns {Array<TreeNodeAssetClass>}
        */
        getAssetClasses(): Array<AssetClass>;
        /**
        * Called when the context menu is about to open.
        * @param <jQuery> e The jQuery event object
        */
        onContext2(e: any): void;
        /**
         * Called whenever the selection has changed
         * @param {TreeNodeModel[]} selection
         */
        onSelectionChange(selection: TreeNodeModel[]): void;
        /**
        * Gets the singleton instance.
        * @returns <TreeViewScene> The singleton instance
        */
        static getSingleton(): TreeViewScene;
    }
}
declare module Animate {
    /**
     * A model for referencing a project resource
     */
    class TreeViewNodeResource<T extends ProjectResource<Engine.IResource>> extends TreeNodeModel {
        resource: T;
        private _loading;
        /**
         * Creates an instance of the node
         */
        constructor(resource: T);
        /**
         * Called whenever we start dragging. This is only called if canDrag is true.
         * Use it to set drag data, eg: e.dataTransfer.setData("text", 'some data');
         * @param {React.DragEvent} e
         * @returns {IDragDropToken} Return data to serialize
         */
        onDragStart(e: React.DragEvent): IDragDropToken;
        /**
         * Show a context menu of resource options
         */
        onContext(e: React.MouseEvent): void;
        /**
         * Gets or sets if this node is in a loading/busy state
         * @param {boolean} val
         * @returns {boolean}
         */
        loading(val?: boolean): boolean;
        /**
         * Gets or sets the label of the node
         * @param {string} val
         * @returns {string}
         */
        label(val?: string): string;
        /**
         * Gets or sets the icon of the node
         * @param {JSX.Element} val
         * @returns {JSX.Element}
         */
        icon(val?: JSX.Element): JSX.Element;
        /**
         * This will cleanup the model
         */
        dispose(): void;
        /**
         * Called whenever the resource is modified
         */
        protected onDeleted(): void;
        /**
         * Called whenever the resource is modified
         */
        protected onModified(): void;
        /**
         * Called whenever the resource is edited
         */
        protected onEdited(): void;
        /**
         * Called when the rename context item is clicked
         */
        onRenameClick(): void;
        /**
         * Called when the delete context item is clicked
         */
        private onDeleteClick();
        /**
         * Called when the delete context item is clicked
         */
        private onSaveClick();
        /**
         * Called when the refresh context item is clicked
         */
        private onRefreshClick();
        /**
         * Called whenever the resource is re-downloaded
         */
        protected onRefreshed(): void;
        /**
         * Handles the completion of project requests
         */
        private handleNodePromise(promise, node);
    }
}
declare module Animate {
    /**
     * A root node that contains the visual representations of project containers
     */
    class TreeViewNodeContainers extends TreeNodeModel {
        private _context;
        /**
         * Creates an instance of the node
         */
        constructor();
        /**
         * Clean up
         */
        dispose(): void;
        /**
         * Show context menu items
         */
        onContext(e: React.MouseEvent): void;
        /**
         * If a container is created, then add its node representation
         */
        onResourceCreated(type: string, event: ProjectEvent<ProjectResource<Engine.IResource>>): void;
    }
}
declare module Animate {
    /**
     * A root node that contains the visual representations of project groups
     */
    class TreeViewNodeGroups extends TreeNodeModel {
        private _loading;
        /**
         * Creates an instance of the node
         */
        constructor();
        /**
         * Gets or sets the icon of the node
         * @param {JSX.Element} val
         * @returns {JSX.Element}
         */
        icon(val?: JSX.Element): JSX.Element;
        /**
         * Clean up
         */
        dispose(): void;
        /**
         * Show context menu items
         */
        onContext(e: React.MouseEvent): void;
        /**
         * If a container is created, then add its node representation
         */
        onResourceCreated(type: string, event: ProjectEvent<ProjectResource<Engine.IResource>>): void;
    }
}
declare module Animate {
    /**
     * A root node that contains the visual representations of project assets
     */
    class TreeViewNodeAssets extends TreeNodeModel {
        /**
         * Creates an instance of the node
         */
        constructor();
        /**
         * Called whenever the node receives a context event
         * @param {React.MouseEvent} e
         */
        onContext(e: React.MouseEvent): void;
    }
}
declare module Animate {
    /**
     * A root node that contains the visual representations of project containers
     */
    class TreeViewNodeBehaviours extends TreeNodeModel {
        /**
         * Creates an instance of the node
         */
        constructor();
        /**
         * Clean up
         */
        dispose(): void;
        /**
         * Show context menu items
         */
        onContext(e: React.MouseEvent): void;
        /**
         * If a template is created, then add its node representation
         */
        onTemplateCreated(type: string, event: Event): void;
    }
}
declare module Animate {
    /**
     * A node that represents an Asset Class
     */
    class TreeNodeAssetClass extends TreeNodeModel {
        assetClass: AssetClass;
        /**
         * Creates an instance of node
         */
        constructor(assetClass: AssetClass);
        /**
         * Clean up
         */
        dispose(): void;
        /**
         * If a container is created, then add its node representation
         */
        onResourceCreated(type: string, event: ProjectEvent<ProjectResource<Engine.IResource>>): void;
        /**
         * This will get all instance nodes of a particular class name(s)
         * @param {string | string[]} classNames The class name of the asset, or an array of class names
         * @returns {TreeNodeAssetInstance[]}
         */
        getInstances(classNames: string | string[]): TreeNodeAssetInstance[];
    }
}
declare module Animate {
    /**
     * Treenode that contains a reference to an asset
     */
    class TreeNodeAssetInstance extends TreeViewNodeResource<Asset> {
        assetClass: AssetClass;
        /**
         * Creates an instance of the node
         */
        constructor(assetClass: AssetClass, asset: Asset);
        /**
         * When we click ok on the portal form
         * @param {string} type
         * @param {EditEvent} data
         */
        onAssetEdited(type: string, data: EditEvent, sender?: EventDispatcher): void;
        /**
         * This will cleanup the component.
         */
        dispose(): void;
    }
}
declare module Animate {
    /**
     * This node represents a group asset.
     * Other resource nodes can be dropped on these which will append the object (if valid) into the group
     */
    class TreeNodeGroup extends TreeViewNodeResource<GroupArray> {
        /**
         * Creates an instance of the node
         */
        constructor(group: GroupArray);
        /**
         * Called whenever the resource is re-downloaded
         */
        protected onRefreshed(): void;
        /**
         * Called whenever we drop an item on this element. This is only called if canDrop is true.
         * Use it to set drag data, eg: e.dataTransfer.getData("text");
         * @param {React.DragEvent} e
         * @param {IDragDropToken} json The unserialized data
         */
        onDragDrop(e: React.DragEvent, json: IDragDropToken): void;
    }
}
declare module Animate {
    /**
     * This node represents a group instance
     */
    class TreeNodeGroupInstance extends TreeNodeModel {
        private _resource;
        private _group;
        /**
         * Creates an instance of the node
         */
        constructor(resource: ProjectResource<Engine.IResource>, group: GroupArray);
        /**
         * Show a context menu of resource options
         */
        onContext(e: React.MouseEvent): void;
        /**
         * Gets or sets the label of the node
         * @param {string} val
         * @returns {string}
         */
        label(val?: string): string;
        /**
         * This will cleanup the component
         */
        dispose(): void;
        shallowId: number;
    }
}
declare module Animate {
    /**
     * This node represents a behaviour created by a plugin.
     */
    class TreeNodePluginBehaviour extends TreeNodeModel {
        private _template;
        /**
         * Creates an instance of the node
         */
        constructor(template: BehaviourDefinition);
        /**
         * Called whenever we start dragging. This is only called if canDrag is true.
         * Use it to set drag data, eg: e.dataTransfer.setData("text", 'some data');
         * @param {React.DragEvent} e
         * @returns {IDragDropToken} Return data to serialize
         */
        onDragStart(e: React.DragEvent): IDragDropToken;
        /**
         * If a template is removed then remove its instance
         */
        onTemplateRemoved(type: string, event: Event): void;
        /**
         * This will cleanup the component
         */
        dispose(): void;
        template: BehaviourDefinition;
    }
}
declare module Animate {
    /**
    * A Tab pair for the canvas tabs
    */
    class CanvasTabPair extends TabPair {
        private _canvas;
        forceClose: boolean;
        constructor(canvas: Canvas, name: string);
        /**
        * Called whenever the container is refreshed
        */
        onRefreshed(type: string, event: Event, sender: Container): void;
        /**
        * Whenever the container deleted
        */
        onContainerDeleted(type: string, event: Event, sender: EventDispatcher): void;
        /**
        * Whenever the container is modified, we show this with a *
        */
        onContainerModified(type: string, event: Event, sender: EventDispatcher): void;
        /**
        * Cleans up the pair
        */
        dispose(): void;
        /**
        * @returns {Canvas}
        */
        canvas: Canvas;
    }
}
declare module Animate {
    /**
    * A tab pair that uses the ace editor
    */
    abstract class EditorPair extends TabPair {
        private _originalName;
        private _proxyChange;
        private _proxyMessageBox;
        protected _close: boolean;
        private _editor;
        private _loadingGif;
        /**
        * @param {string} name The name of the tab
        */
        constructor(name: string);
        /**
        * When we acknowledge the message box.
        * @param {string} val
        */
        onMessage(val: string): void;
        /**
        * Sets if this tab pair is busy loading
        * @param {boolean} val
        */
        protected loading(val: boolean): void;
        /**
        * Called when the editor changes
        * @param {any} e
        */
        onChange(e: any): void;
        /**
        * Called by the tab class when the pair is to be removed.
        * @param {TabEvent} event An object that can be used to cancel the operation. Simply call data.cancel = true to cancel the closure.
        */
        onRemove(event: TabEvent): void;
        /**
        * Called when the tab is resized
        */
        onResize(): void;
        /**
        * Saves the content of the editor
        */
        abstract save(): any;
        /**
        * Gets the script content once added to the stage
        */
        abstract initialize(): {
            content: string;
            contentType: string;
        };
        /**
        * Called when the pair has been added to the tab. The ace editor is added and initialized
        */
        onAdded(): void;
        /**
        * Gets the ace editor
        * @returns {AceAjax.Editor}
        */
        editor: AceAjax.Editor;
    }
}
declare module Animate {
    /**
    * A tab pair that manages the build HTML
    */
    class HTMLTab extends EditorPair {
        static singleton: HTMLTab;
        /**
        * @param {string} name The name of the tab
        */
        constructor(name: string);
        /**
        * Called when the editor needs to save its content
        */
        save(): void;
        /**
         * Gets the script initial values
         */
        initialize(): {
            content: string;
            contentType: string;
        };
        /**
        * Called when the pair has been added to the tab. The ace editor is added and initialized
        */
        onAdded(): void;
        /**
        * Called by the tab class when the pair is to be removed.
        * @param {TabEvent} event An object that can be used to cancel the operation. Simply call data.cancel = true to cancel the closure.
        */
        onRemove(event: TabEvent): void;
    }
}
declare module Animate {
    /**
    * A tab pair that manages the build CSS
    */
    class CSSTab extends EditorPair {
        static singleton: CSSTab;
        /**
        * @param {string} name The name of the tab
        */
        constructor(name: string);
        /**
        * Called when the editor needs to save its content
        */
        save(): void;
        /**
        * Gets the script initial values
        */
        initialize(): {
            content: string;
            contentType: string;
        };
        /**
        * Called when the pair has been added to the tab. The ace editor is added and initialized
        */
        onAdded(): void;
        /**
        * Called by the tab class when the pair is to be removed.
        * @param {TabEvent} event An object that can be used to cancel the operation. Simply call data.cancel = true to cancel the closure.
        */
        onRemove(event: TabEvent): void;
    }
}
declare module Animate {
    /**
    * A tab pair that creates a javascript node
    */
    class ScriptTab extends TabPair {
        static singleton: HTMLTab;
        private originalName;
        private proxyFunctionClick;
        private scriptNode;
        saved: boolean;
        private close;
        private userDefinedChange;
        private _editor;
        private curFunction;
        private scripts;
        private right;
        private _editorComponent;
        private onEnter;
        private onFrame;
        private onInitialize;
        private onDispose;
        constructor(scriptNode: any);
        /**
        * When we click on one of the function buttons
        * @param <object> e
        */
        OnFunctionClick(e: any): void;
        /**
        * Called when the editor is resized
        */
        onResize(): void;
        /**
        * When we rename the script, we need to update the text
        */
        rename(newName: string): void;
        /**
        * Called when the pair has been added to the tab
        */
        onAdded(): void;
        /**
        * When the server responds after a save.
        * @param <object> event
        * @param <object> data
        */
        onServer(response: ProjectEvents, event: ProjectEvent<ProjectResource<Engine.IResource>>): void;
        /**
        * Called when the save all button is clicked
        */
        onSaveAll(): void;
        /**
        * Called when the pair has been selected
        */
        onSelected(): void;
        /**
        * Called by the tab class when the pair is to be removed.
        * @param <object> data An object that can be used to cancel the operation. Simply call data.cancel = true to cancel the closure.
        */
        onRemove(data: any): void;
        /**
        * Call this function to save the script to the database
        * @returns <object>
        */
        save(): void;
    }
}
declare module Animate {
    /**
    * This is an implementation of the tab class
    */
    class SceneTab extends Tab {
        private static _singleton;
        assetPanel: Component;
        /**
        * @param {Component} parent The parent of the button
        */
        constructor(parent: Component);
        /**This is called by a controlling ScreenManager class. An image string needs to be returned
        * which will act as a preview of the component that is being viewed or hidden.*/
        getPreviewImage(): string;
        onShow(): void;
        onHide(): void;
        /** Gets the singleton instance. */
        static getSingleton(parent?: Component): SceneTab;
    }
}
declare module Animate {
    class CanvasTabType extends ENUM {
        constructor(v: string);
        static CANVAS: CanvasTabType;
        static HTML: CanvasTabType;
        static CSS: CanvasTabType;
        static SCRIPT: CanvasTabType;
        static BLANK: CanvasTabType;
    }
    /**
    * This is an implementation of the tab class that deals with the canvas
    */
    class CanvasTab extends Tab {
        private static _singleton;
        private _currentCanvas;
        private welcomeTab;
        private closingTabPair;
        constructor(parent: Component);
        /**
        * This is called by a controlling ScreenManager class. An image string needs to be returned
        * which will act as a preview of the component that is being viewed or hidden.
        * @return {string}
        */
        getPreviewImage(): string;
        /**
        * This is called by a controlling Docker class when the component needs to be shown.
        */
        onShow(): void;
        /**
        * Called when sall all is returned from the DB
        */
        saveAll(): void;
        /**
        * This is called by a controlling Docker class when the component needs to be hidden.
        */
        onHide(): void;
        /**
        * Called just before a tab is closed. If you return false it will cancel the operation.
        * @param {TabPair} tabPair An object that contains both the page and label of the tab
        * @returns {boolean} Returns false if the tab needs to be saved. Otherwise true.
        */
        onTabPairClosing(tabPair: TabPair): boolean;
        /**
        * After being asked if we want to save changes to a container
        * @param {string} choice The choice of the message box. It can be either Yes or No
        */
        onMessage(choice: string): void;
        /**
        * We use this function to remove any assets from the tabs
        * @param {Asset} asset The asset we are removing
        */
        removeAsset(asset: Asset): void;
        /**
        * You can use this function to fetch a tab's canvas by a behaviour local ID
        * @param {number} behaviourID The local id of the container
        * @returns {Canvas} The returned tab's canvas or null
        */
        getTabCanvas(behaviourID: string): Canvas;
        /**
         * When we select a tab
         * @param {number} index The index of the selected tab
         * @param {ITabPaneProps} props props of the selected tab
         */
        onTabSelected(index: number, props: ITabPaneProps): void;
        /**
        * When we start a new project we load the welcome page.
        * @param {Project} project
        */
        projectReady(project: Project): void;
        /**
        * Called when the project is reset by either creating a new one or opening an older one.
        */
        projectReset(): void;
        /**
        * When the news has been loaded from webinate.
        */
        onNewsLoaded(response: LoaderEvents, event: AnimateLoaderEvent, sender?: EventDispatcher): void;
        /**
        * Gets the singleton instance.
        * @param {Component} parent The parent component of this tab
        * @returns {CanvasTab}
        */
        static getSingleton(parent?: Component): CanvasTab;
        /**
        * Renames a tab and its container
        * @param {string} oldName The old name of the tab
        * @param {string} newName The new name of the tab
        * @returns {TabPair} Returns the tab pair
        */
        renameTab(oldName: string, newName: string): TabPair;
        removeTab(index: number, prop: ITabPaneProps): void;
        /**
        * When a canvas is modified we change the tab name, canvas name and un-save its tree node.
        */
        onCanvasModified(response: CanvasEvents, event: CanvasEvent, sender?: EventDispatcher): void;
        /**
        * Adds an item to the tab
        * @param {string} text The text of the new tab
        * @param {CanvasTabType} type The type of tab to create
        * @param {any} tabContent Data associated with the tab
        * @returns {TabPair} The tab pair object
        */
        addSpecialTab(text: string, type?: CanvasTabType, tabContent?: any): TabPair;
        currentCanvas: Canvas;
    }
}
declare module Animate {
    interface IGroupProps extends React.HTMLAttributes {
        label: string;
    }
    /**
     * A simple wrapper for a group Component
     */
    class Group extends React.Component<IGroupProps, any> {
        /**
         * Creates an instance of the group
         */
        constructor(props: IGroupProps);
        /**
         * Creates the component elements
         * @returns {JSX.Element}
         */
        render(): JSX.Element;
    }
}
declare module Animate {
    /**
    * This small class is used to group property grid elements together
    */
    class PropertyGridGroup extends Component {
        name: string;
        content: JQuery;
        constructor(name: string);
        /**
        * This function is used to clean up the PropertyGridGroup
        */
        dispose(): void;
    }
}
declare module Animate {
    /**
    * A property editor which edits objects and strings
    */
    class PGTextbox extends PropertyGridEditor {
        constructor(grid: PropertyGrid);
        /**
        * Checks a property to see if it can edit it
        * @param {Prop<any>} prop The property being edited
        * @returns {boolean}
        */
        canEdit(prop: Prop<any>): boolean;
        /**
        * Given a property, the grid editor must produce HTML that can be used to edit the property
        * @param {Prop<any>} prop The property being edited
        * @param {Component} container The container acting as this editors parent
        */
        edit(prop: Prop<any>, container: Component): void;
    }
}
declare module Animate {
    /**
    * A property editor which edits numbers
    */
    class PGNumber extends PropertyGridEditor {
        constructor(grid: PropertyGrid);
        /**
        * Checks a property to see if it can edit it
        * @param {Prop<any>} prop The property being edited
        * @returns {boolean}
        */
        canEdit(prop: Prop<any>): boolean;
        /**
        * Given a property, the grid editor must produce HTML that can be used to edit the property
        * @param {Prop<any>} prop The property being edited
        * @param {Component} container The container acting as this editors parent
        */
        edit(prop: Prop<any>, container: Component): void;
    }
}
declare module Animate {
    /**
    * This represents a combo property for booleans that the user can select from a list.
    */
    class PGComboBool extends PropertyGridEditor {
        constructor(grid: PropertyGrid);
        /**
        * Checks a property to see if it can edit it
        * @param {Prop<any>} prop The property being edited
        * @returns {boolean}
        */
        canEdit(prop: Prop<any>): boolean;
        /**
        * Given a property, the grid editor must produce HTML that can be used to edit the property
        * @param {Prop<any>} prop The property being edited
        * @param {Component} container The container acting as this editors parent
        */
        edit(prop: Prop<any>, container: Component): JQuery;
    }
}
declare module Animate {
    /**
    * This represents a combo property for enums that the user can select from a list.
    */
    class PGComboEnum extends PropertyGridEditor {
        constructor(grid: PropertyGrid);
        /**
        * Checks a property to see if it can edit it
        * @param {Prop<any>} prop The property being edited
        * @returns {boolean}
        */
        canEdit(prop: Prop<any>): boolean;
        /**
        * Given a property, the grid editor must produce HTML that can be used to edit the property
        * @param {Prop<any>} prop The property being edited
        * @param {Component} container The container acting as this editors parent
        */
        edit(prop: Prop<any>, container: Component): void;
    }
}
declare module Animate {
    /**
    * An editor which allows a user to select files on the local server.
    */
    class PGFile extends PropertyGridEditor {
        constructor(grid: PropertyGrid);
        /**
        * Checks a property to see if it can edit it
        * @param {Prop<any>} prop The property being edited
        * @returns {boolean}
        */
        canEdit(prop: Prop<any>): boolean;
        /**
        * Given a property, the grid editor must produce HTML that can be used to edit the property
        * @param {Prop<any>} prop The property being edited
        * @param {Component} container The container acting as this editors parent
        */
        edit(prop: Prop<any>, container: Component): void;
    }
}
declare module Animate {
    /**
    * This represents a combo property for assets that the user can select from a list.
    */
    class PGComboGroup extends PropertyGridEditor {
        constructor(grid: PropertyGrid);
        /**
        * Checks a property to see if it can edit it
        * @param {Prop<any>} prop The property being edited
        * @returns {boolean}
        */
        canEdit(prop: Prop<any>): boolean;
        /**
        * Given a property, the grid editor must produce HTML that can be used to edit the property
        * @param {Prop<any>} prop The property being edited
        * @param {Component} container The container acting as this editors parent
        */
        edit(prop: Prop<any>, container: Component): void;
    }
}
declare module Animate {
    /**
    * This represents a combo property for assets that the user can select from a list.
    */
    class PGComboAsset extends PropertyGridEditor {
        constructor(grid: PropertyGrid);
        /**
        * Checks a property to see if it can edit it
        * @param {Prop<any>} prop The property being edited
        * @returns {boolean}
        */
        canEdit(prop: Prop<any>): boolean;
        /**
        * Given a property, the grid editor must produce HTML that can be used to edit the property
        * @param {Prop<any>} prop The property being edited
        * @param {Component} container The container acting as this editors parent
        */
        edit(prop: Prop<any>, container: Component): void;
    }
}
declare module Animate {
    /**
    * This represents a property for choosing a list of assets
    */
    class PGAssetList extends PropertyGridEditor {
        constructor(grid: PropertyGrid);
        /**
        * Checks a property to see if it can edit it
        * @param {Prop<any>} prop The property being edited
        * @returns {boolean}
        */
        canEdit(prop: Prop<any>): boolean;
        /**
        * Given a property, the grid editor must produce HTML that can be used to edit the property
        * @param {Prop<any>} prop The property being edited
        * @param {Component} container The container acting as this editors parent
        */
        edit(prop: Prop<any>, container: Component): void;
    }
}
declare module Animate {
    /**
    * This editor is used to pick colours from a colour dialogue.
    */
    class PGColorPicker extends PropertyGridEditor {
        constructor(grid: PropertyGrid);
        /**
        * Checks a property to see if it can edit it
        * @param {Prop<any>} prop The property being edited
        * @returns {boolean}
        */
        canEdit(prop: Prop<any>): boolean;
        /**
        * Given a property, the grid editor must produce HTML that can be used to edit the property
        * @param {Prop<any>} prop The property being edited
        * @param {Component} container The container acting as this editors parent
        */
        edit(prop: Prop<any>, container: Component): void;
    }
}
declare module Animate {
    /**
    * A Component that you can use to edit objects. The Property grid will fill itself with Components you can use to edit a given object.
    * Each time the object is modified a <PropertyGrid.PROPERTY_EDITED> events are sent to listeners.
    */
    class PropertyGrid extends Component {
        private static _singleton;
        private _header;
        private _editors;
        private _groups;
        private _object;
        constructor(parent: Component);
        /**
        * This is called by a controlling ScreenManager class. An image string needs to be returned
        * which will act as a preview of the component that is being viewed or hidden.
        * @returns <string> The image url
        */
        getPreviewImage(): string;
        /**
        * This is called by a controlling Docker class when the component needs to be shown.
        */
        onShow(): void;
        /**
        * This is called by a controlling Docker class when the component needs to be hidden.
        */
        onHide(): void;
        /**
        * Cleans up the groups and editors
        */
        cleanup(): void;
        /**
        * Sets the object we are going to edit.
        * @param {EditableSet} object The object we are editing. You should ideally create a new object {}, and then
        * use the function pGridEditble to create valid property grid variables.
        * @param {string} name The name of the object we are editing
        * @param {string} img An optional image string
        * @returns {any} Returns the object we are currently editing
        */
        editableObject(object: EditableSet, name: string, img?: string): EditableSet;
        /**
        * called when we reset the project
        * @returns <object>
        */
        projectReset(): void;
        /**
        * Add a new editor to the property grid.
        * @param {PropertyGridEditor} editor The PropertyGridEditor object to add
        * @returns {PropertyGridEditor}
        */
        addEditor(editor: PropertyGridEditor): PropertyGridEditor;
        /**
        * Removes an editor from the property grid.
        * @param {PropertyGridEditor} editor The PropertyGridEditor object to remove.
        * @returns {PropertyGridEditor} The editor or null
        */
        removeEditor(editor: PropertyGridEditor): PropertyGridEditor;
        /**
        * This will cleanup the component.
        */
        dispose(): void;
        /**
        * Gets the singleton instance.
        * @returns <PropertyGrid>
        */
        static getSingleton(parent?: Component): PropertyGrid;
        currentObject: any;
    }
}
declare module Animate {
    /**
     * Describes the button style
     */
    enum ButtonType {
        PRIMARY = 0,
        ERROR = 1,
        SUCCESS = 2,
        RED_LINK = 3,
    }
    interface IButtonProps extends React.HTMLAttributes {
        preventDefault?: boolean;
        buttonType?: ButtonType;
    }
    /**
     * A base class for all buttons
     */
    class ReactButton extends React.Component<IButtonProps, any> {
        static defaultProps: IButtonProps;
        /**
         * Creates an instance
         */
        constructor(props: IButtonProps);
        /**
         * Creates the component elements
         * @returns {JSX.Element}
         */
        render(): JSX.Element;
    }
    /**
     * A wrapper for the base button class to style it as a primary button
     */
    class ButtonPrimary extends ReactButton {
        static defaultProps: IButtonProps;
    }
    /**
     * A wrapper for the base button class to style it as a success button
     */
    class ButtonSuccess extends ReactButton {
        static defaultProps: IButtonProps;
    }
    /**
     * A wrapper for the base button class to style it as an error button
     */
    class ButtonError extends ReactButton {
        static defaultProps: IButtonProps;
    }
    /**
     * A wrapper for the base button class to style it as a red link button
     */
    class ButtonLink extends ReactButton {
        static defaultProps: IButtonProps;
    }
}
declare module Animate {
    interface IImagePreviewProps extends React.HTMLAttributes {
        src: string;
        defaultSrc?: string;
        label: string;
        labelIcon?: React.ReactDOM;
        className?: string;
        selected?: boolean;
        onLabelClick?: (e: React.MouseEvent) => void;
        showLoadingIcon?: boolean;
    }
    /**
     * Shows an image in a against transparent backdrop that is vertically centered and scaled into its container
     */
    class ImagePreview extends React.Component<IImagePreviewProps, {
        loading: boolean;
    }> {
        static defaultProps: IImagePreviewProps;
        private _imgLoader;
        private _mounted;
        /**
         * Creates an instance
         */
        constructor(props: IImagePreviewProps);
        componentWillUnmount(): void;
        /**
         * When the preview is added we start the loading process
         */
        componentDidMount(): void;
        /**
         * If the src or default props change, we reload the new image
         */
        componentWillReceiveProps(nextProps: IImagePreviewProps): void;
        /**
         * Creates the component elements
         * @returns {JSX.Element}
         */
        render(): JSX.Element;
    }
}
declare module Animate {
    interface IImageUploaderProps {
        onImage?: (file: Engine.IFile) => void;
        src: string;
        label: string;
        onError?: (e: Error) => void;
    }
    interface IImageUploaderState {
        src: string;
    }
    /**
     * A small utility class for uploading and previewing an image
     */
    class ImageUploader extends React.Component<IImageUploaderProps, IImageUploaderState> {
        /**
         * Creates an instance
         */
        constructor(props: IImageUploaderProps);
        /**
         * Called when the props are updated
         */
        componentWillReceiveProps(nextProps: IImageUploaderProps): void;
        /**
         * Opens the file viewer and lets the user pick an image for their project
         */
        pickProjectPick(): void;
        /**
         * Creates the component elements
         * @returns {JSX.Element}
         */
        render(): JSX.Element;
    }
}
declare module Animate {
    interface IToolbarButtonProps {
        onChange: (val: boolean) => void;
        pushButton?: boolean;
        selected?: boolean;
        label: string;
        imgUrl?: string;
        prefix?: JSX.Element;
        disabled?: boolean;
    }
    interface IToolbarButtonState {
        selected: boolean;
    }
    /**
     * A very simple wrapper for a toolbar button
     */
    class ToolbarButton extends React.Component<IToolbarButtonProps, IToolbarButtonState> {
        static defaultProps: IToolbarButtonProps;
        constructor(props: IToolbarButtonProps);
        /**
         * Creates the component elements
         * @returns {JSX.Element}
         */
        render(): JSX.Element;
        /**
        * Called when the props are updated
        */
        componentWillReceiveProps(nextProps: IVCheckboxProps): void;
        onClick(e: any): void;
        /**
         * Get if the component is selected
         * @return {boolean}
         */
        /**
         * Set if the component is selected
         * @param {boolean}
         */
        selected: boolean;
    }
}
declare module Animate {
    class ToolbarNumberEvents extends ENUM {
        constructor(v: string);
        static CHANGED: ToolbarNumberEvents;
    }
    /**
    *  A toolbar button for numbers
    */
    class ToolbarNumber extends Component {
        private static input;
        private static numInstances;
        private defaultVal;
        private minValue;
        private maxValue;
        private delta;
        private startPos;
        private label;
        private leftArrow;
        private rightArrow;
        private stageUpPoxy;
        private stageMovePoxy;
        private downProxy;
        private clickProxy;
        private wheelProxy;
        private keyProxy;
        /**
        * @param {Component} parent The parent of this toolbar
        */
        constructor(parent: Component, text: string, defaultVal: number, minValue: number, maxValue: number, delta?: number);
        /**
        * Called when the mouse is down on the DOM
        * @param <object> e The jQuery event
        */
        onStageUp(e: any): void;
        /**
        * Called when we move on the stage
        * @param <object> e The jQuery event
        */
        onStageMove(e: any): void;
        /**
        * Set or get the value
        * @param {number} val The value we are setting
        */
        /**
        * Set or get the value
        * @param {number} val The value we are setting
        */
        value: number;
        onWheel(event: any, delta: any, deltaX: any, deltaY: any): void;
        onKeyDown(e: any): void;
        onDown(e: any): void;
        onClick(e: any): void;
        /**
        * Cleans up the component
        */
        dispose(): void;
    }
}
declare module Animate {
    /**
    *  Use this tool bar button to pick a colour.
    */
    class ToolbarColorPicker extends Component {
        private numberInput;
        private picker;
        constructor(parent: Component, text: string, color: string);
        /**
        * Gets or sets the colour of the toolbar button
        */
        /**
        * Gets or sets the colour of the toolbar button
        */
        color: number;
        /**
        * Disposes of and cleans up this button
        */
        dispose(): void;
    }
}
declare module Animate {
    /**
    * The interface for all layout objects.
    */
    class ToolbarItem extends Component {
        text: String;
        img: String;
        /**
        * @param {string} img The image path.
        * @param {string} text The text to use in the item.
        */
        constructor(img: string, text: string, parent?: Component);
    }
    /**
    *  A toolbar button for selection a list of options
    */
    class ToolbarDropDown extends Component {
        items: Array<ToolbarItem>;
        private _popupContainer;
        private _selectedItem;
        private _clickProxy;
        private _stageDownProxy;
        /**
        * @param {Component} parent The parent of this toolbar
        * @param {Array<ToolbarItem>} items An array of items to list e.g. [{img:"./img1.png", text:"option 1"}, {img:"./img2.png", text:"option 2"}]
        */
        constructor(parent: Component, items: Array<ToolbarItem>);
        /**
        * Adds an item the drop down. The item must be an object with both img and text vars. eg: { img:"", text:"" }
        * @param {ToolbarItem} item The item to add.
        * @returns {Component}
        */
        addItem(item: ToolbarItem): IComponent;
        /**
        * Adds an item the drop down. The item must be an object with both img and text vars. eg: { img:"", text:"" }
        * @param {any} val This can be either the item object itself, its text or its component.
        * @param {boolean} dispose Set this to true if you want delete the item
        * @returns {Component} Returns the removed item component or null
        */
        removeItem(val: any, dispose?: boolean): any;
        /**
        * Clears all the items
        * @param {boolean} dispose Set this to true if you want to delete all the items from memory
        */
        clear(dispose?: boolean): void;
        /**
        * Gets the selected item
        * @returns {ToolbarItem}
        */
        /**
        * Sets the selected item
        * @param {any} item
        */
        selectedItem: ToolbarItem;
        /**
        * Called when the mouse is down on the DOM
        * @param {any} e The jQuery event
        */
        onStageUp(e: any): void;
        /**
        * When we click the main button
        * @param {any} e The jQuery event oject
        */
        onClick(e: any): void;
        /**
        * Cleans up the component
        */
        dispose(): void;
    }
}
declare module Animate {
    class OkCancelFormEvents extends ENUM {
        constructor(v: string);
        static CONFIRM: OkCancelFormEvents;
    }
    /**
    * A simple form which holds a heading, content and OK / Cancel buttons.
    */
    class OkCancelForm extends Window {
        okCancelContent: Component;
        private mButtonContainer;
        private mOk;
        private mCancel;
        private keyProxy;
        /**
        * @param {number} width The width of the form
        * @param {number} height The height of the form
        * @param {boolean} autoCenter Should this window center itself on a resize event
        * @param {boolean} controlBox Does this window have a draggable title bar and close button
        * @param {string} title The text for window heading. Only applicable if we are using a control box.
        */
        constructor(width?: number, height?: number, autoCenter?: boolean, controlBox?: boolean, title?: string, hideCancel?: boolean);
        /**
        * When we click on the close button
        * @param {any} e The jQuery event object
        */
        onCloseClicked(e: any): void;
        /**
        * Called when we click one of the buttons. This will dispatch the event OkCancelForm.CONFIRM
        * and pass the text either for the ok or cancel buttons.
        * @param {any} e The jQuery event
        */
        OnButtonClick(e: any): void;
        /**
        * Hides the window
        */
        hide(): void;
        /**
        * This function is used to cleanup the object before its removed from memory.
        */
        dispose(): void;
        /**
        * Shows the window by adding it to a parent.
        * @param {Component} parent The parent Component we are adding this window to
        * @param {number} x The x coordinate of the window
        * @param {number} y The y coordinate of the window
        * @param {boolean} isModal Does this window block all other user operations?
        * @param {boolean} isPopup If the window is popup it will close whenever anything outside the window is clicked
        */
        show(parent?: Component, x?: number, y?: number, isModal?: boolean, isPopup?: boolean): void;
        /**
        * Catch the key down events.
        * @param {any} e The jQuery event object
        */
        onKeyDown(e: any): void;
    }
}
declare module Animate {
    interface IOptionsBuildState {
    }
    interface IOptionsBuildProps extends IReactWindowProps {
    }
    /**
     * A component for editing the build properties
     */
    class OptionsBuild extends React.Component<IOptionsBuildProps, any> {
        static defaultProps: IOptionsBuildProps;
        /**
         * Creates a new instance
         */
        constructor(props: IOptionsBuildProps);
        /**
         * Draws the options JSX
         * @returns {JSX.Element}
         */
        render(): JSX.Element;
    }
}
declare module Animate {
    interface IOptionsUserProps {
    }
    interface IOptionsUserStats {
        bioUpdateErr?: string;
        imageUploadErr?: string;
        loading?: boolean;
    }
    /**
     * A component for editing the user properties
     */
    class OptionsUser extends React.Component<IOptionsUserProps, IOptionsUserStats> {
        static defaultProps: IOptionsUserProps;
        /**
         * Creates a new instance
         */
        constructor(props: IOptionsUserProps);
        /**
         * Updates the user bio information
         * @param {string} bio The new bio data
         */
        updateBio(bio: string): void;
        /**
         * Sets the user's avatar image
         */
        setAvatarUrl(file: any): void;
        /**
         * Draws the options JSX
         * @returns {JSX.Element}
         */
        render(): JSX.Element;
    }
}
declare module Animate {
    interface IOptionsProjectProps extends IReactWindowProps {
    }
    interface IOptionsProjectState {
        infoServerMsg?: string;
        imageUploadErr?: string;
        loading?: boolean;
        error?: boolean;
    }
    /**
     * A component for editing the project properties
     */
    class OptionsProject extends React.Component<IOptionsProjectProps, IOptionsProjectState> {
        static defaultProps: IOptionsProjectProps;
        /**
         * Creates a new instance
         */
        constructor(props: IOptionsProjectProps);
        /**
         * Sets the project image url
         * @param {Engine.IFile} file
         */
        setProjectImageUrl(file: Engine.IFile): void;
        /**
         * Attempts to update the project
         * @param {any} project details
         */
        updateDetails(json: any): void;
        /**
         * Draws the options JSX
         * @returns {JSX.Element}
         */
        render(): JSX.Element;
    }
}
declare module Animate {
    interface IOptionsForm extends IReactWindowProps {
    }
    /**
     * A form for editing various project/user options
     */
    class OptionsForm extends ReactWindow<IOptionsForm, IReactWindowState> {
        static defaultProps: IOptionsForm;
        /**
         * Creates a new instance
         */
        constructor(props: IOptionsForm);
        /**
         * Gets the content JSX for the window.
         */
        getContent(): React.ReactNode;
    }
}
declare module Animate {
    /**
    * Use this form to set the project meta and update build versions.
    */
    class BuildOptionsForm extends Window {
        static _singleton: BuildOptionsForm;
        private _projectElm;
        private _buildElm;
        private _userElm;
        private $user;
        private $project;
        private $projectToken;
        private $errorMsg;
        private $errorMsgImg;
        private $loading;
        private $loadingPercent;
        private _tab;
        private _buildProxy;
        private _settingPages;
        constructor();
        /**
        * Opens the file viewer and lets the user pick an image for their avatar
        */
        pickAvatar(): void;
        /**
        * Opens the file viewer and lets the user pick an image for their project
        */
        pickProjectPick(): void;
        /**
        * Attempts to update the project
        */
        updateDetails(token: Engine.IPlugin): void;
        /**
        * Given a form element, we look at if it has an error and based on the expression. If there is we set the error message
        * @param {EngineForm} The form to check.
        * @param {boolean} True if there is an error
        */
        reportError(form: NodeForm): boolean;
        /**
        * Updates the user bio information
        * @param {string} bio The new bio data
        */
        updateBio(bio: string): void;
        /**
        * Use this function to add a new settings page to the settings menu
        * @param {ISettingsPage} component The ISettingsPage component we're adding
        */
        addSettingPage(component: ISettingsPage): void;
        /**
        * When we recieve the server call for saving project data.
        * @param {UserEvents} event
        * @param {UserEvent} data
        */
        /**
        * Shows the build options form
        * @returns {any}
        */
        show(): void;
        /**
        * Use this function to print a message on the settings screen.
        * @param {string} message The message to print
        * @param <bool> isError Should this be styled to an error or not
        */
        /**
        * Gets the singleton instance.
        * @returns {BuildOptionsForm}
        */
        static getSingleton(): BuildOptionsForm;
    }
}
declare module Animate {
    interface IViewerFile extends Engine.IFile {
        selected?: boolean;
        loadingPreview?: boolean;
    }
    interface IFileViewerProps {
        multiSelect: boolean;
        extensions: Array<string>;
        onFilesSelected?: (files: Engine.IFile[]) => void;
        onClose?: () => void;
        readOnly?: boolean;
    }
    interface IFileViewerState {
        selectedEntity?: IViewerFile;
        errorMsg?: string;
        loading?: boolean;
        editMode?: boolean;
        highlightDropZone?: boolean;
        percent?: number;
        fileToken?: IViewerFile;
    }
    /**
     * A component for viewing the files and folders of the user's asset directory
     */
    class FileViewer extends React.Component<IFileViewerProps, IFileViewerState> {
        static defaultProps: IFileViewerProps;
        private _searchType;
        private _entries;
        private _uploader;
        private _isMounted;
        private _search;
        private _onlyFavourites;
        private _onlyGlobal;
        private _selectedEntities;
        /**
         * Creates an instance of the file viewer
         */
        constructor(props: IFileViewerProps);
        onFileUploaded(err: Error, files: UsersInterface.IUploadToken[]): void;
        /**
         * When the scope changes we update the viewable contents
         * @param {SelectValue} option
         */
        onScopeChange(option: SelectValue): void;
        getFileDetails(selectedFile: IViewerFile, editMode: boolean): JSX.Element;
        /**
         * Shows a message box that the user must confirm or deny if the selected files must be removed
         */
        confirmDelete(): void;
        renderPanelButtons(editMode: boolean): JSX.Element;
        /**
         * Forces the pager to update its contents
         */
        invalidate(): void;
        /**
        * Creates the component elements
        * @returns {JSX.Element}
        */
        render(): JSX.Element;
        /**
         * Specifies the type of file search
         */
        selectMode(type: FileSearchType): void;
        /**
         * Sets the selected status of a file or folder
         * @param {React.MouseEvent} e
         * @param {IViewerFile} entity
         */
        selectEntity(e: React.MouseEvent, entity: IViewerFile): void;
        /**
         * Removes the selected entities
         */
        removeEntities(): void;
        updateContent(index: number, limit: number): Promise<number>;
        /**
         * Whenever the file input changes we check the file is valid and then attempt to upload it
         */
        onFileChange(e: React.FormEvent): boolean;
        /**
         * Checks if a file list is one of the approved props extensions
         * @return {boolean}
         */
        checkIfAllowed(files: FileList): boolean;
        /**
         * Perform any cleanup if neccessary
         */
        componentWillUnmount(): void;
        /**
         * Makes sure we only view the file types specified in the props exensions array
         * @param {IViewerFile[]} files The file array we are filtering
         * @returns {IViewerFile[]}
         */
        filterByExtensions(files: IViewerFile[]): IViewerFile[];
        /**
         * Called when we are dragging assets over the file items div
         */
        onDragOver(e: React.DragEvent): void;
        /**
         * Called when we are no longer dragging items.
         */
        onDragLeave(e: React.DragEvent): void;
        /**
         * Called when we drop an asset on the file items div.
         * Checks if the file is allow, and if so, it uploads the file
         */
        onDrop(e: React.DragEvent): void;
        /**
         * Attempts to upload an image or canvas to the users asset directory and set the upload as a file's preview
         * @param {IViewerFile} file The target file we are setting the preview for
         * @param {HTMLCanvasElement | HTMLImageElement} preview The image we are using as a preview
         */
        uploadPreview(file: IViewerFile, preview: HTMLCanvasElement | HTMLImageElement): void;
        /**
         * Attempts to update the selected file
         * @param {IFile} token The file token to update with
         */
        updateFile(token: Engine.IFile): void;
    }
}
declare module Animate {
    interface IFileDialogueProps extends IReactWindowProps {
        extensions?: string[];
        multiselect?: boolean;
        readOnly?: boolean;
        onFilesSelected?: (file: Engine.IFile[]) => void;
    }
    /**
     * A form uploading and selecting files
     */
    class FileDialogue extends ReactWindow<IFileDialogueProps, IReactWindowState> {
        static defaultProps: IFileDialogueProps;
        /**
         * Creates a new instance
         */
        constructor(props: IOptionsForm);
        /**
         * Gets the content JSX for the window.
         */
        getContent(): React.ReactNode;
    }
}
declare module Animate {
    interface IMessageBoxProps extends IReactWindowProps {
        message?: string;
        onChange?: (button: string) => void;
        buttons?: string[];
        type?: AttentionType;
    }
    /**
     * A window to show a blocking window with a message to the user.
     */
    class MessageBox extends ReactWindow<IMessageBoxProps, IReactWindowState> {
        static defaultProps: IMessageBoxProps;
        /**
         * Creates a new instance of the message box
         */
        constructor(props: IMessageBoxProps);
        /**
         * Gets the content JSX for the window. Typically this is the props.children, but can be overriden
         * in derived classes
         */
        getContent(): React.ReactNode;
        /**
         * Hide the window when ok is clicked.
         * @param {any} e The jQuery event object
         */
        onButtonClick(e: React.MouseEvent, button: string): void;
    }
}
declare module Animate {
    /**
    * This form is used to create or edit Portals.
    */
    class PortalForm extends Window {
        private static _singleton;
        private _portalType;
        private _value;
        private _fromOk;
        private _newProperty;
        private _formElm;
        private _nameVerifier;
        private $name;
        private $class;
        private $errorMsg;
        constructor();
        /**
        * Generates all the available classes to select for asset property types
        */
        generateClasses(): void;
        /**
        * Creates a new property from the data chosen
        * @param {Prop<any>}
        */
        getProperty(): Prop<any>;
        /**
        * Shows the window by adding it to a parent.
        * @param {Component} item The item we are editing
        * @param {PortalType} type The items current portal type
        * @param {string} caption The caption of the form
        */
        editPortal(property: Prop<any>, type: PortalType, nameVerifier: (name: string) => boolean): Promise<{
            prop: Prop<any>;
            cancel: boolean;
        }>;
        /**
        * Hides the window from view
        */
        hide(): void;
        /**
        * Called when we click one of the buttons. This will dispatch the event OkCancelForm.CONFIRM
        * and pass the text either for the ok or cancel buttons.
        */
        ok(): Element;
        name: string;
        portalType: PortalType;
        value: any;
        parameterType: PropertyType;
        /**
        * Gets the singleton instance.
        * @returns {PortalForm}
        */
        static getSingleton(): PortalForm;
    }
}
declare module Animate {
    interface IRenameFormProps extends IReactWindowProps {
        name?: string;
        onRenaming?: (newName: string, prevName: string) => Error;
        onCancel?: () => void;
        onOk: (newName: string) => void;
    }
    interface IRenameFormState extends IReactWindowState {
        $errorMsg?: string;
    }
    /**
     * This form is used to rename objects
     */
    class RenameForm extends ReactWindow<IRenameFormProps, IRenameFormState> {
        static defaultProps: IRenameFormProps;
        /**
         * Creates a new instance
         */
        constructor(props: IRenameFormProps);
        /**
         * Hides the form
         */
        onCancel(): void;
        /**
         * Gets the content JSX for the window.
         */
        getContent(): React.ReactNode;
        /**
         * Called when the form is submitted
         */
        ok(name: string): void;
    }
}
declare module Animate {
    class UserPrivilegesForm extends Window {
        private static _singleton;
        private mSave;
        private search;
        private mMenu;
        private keyDownProxy;
        private buttonProxy;
        constructor();
        /**
        * This function is called whenever we get a resonse from the server
        */
        onServer(response: LoaderEvents, event: AnimateLoaderEvent, sender?: EventDispatcher): void;
        /**
        * Gets the viewer to search using the terms in the search inut
        */
        searchItems(): void;
        /**
        * When we click a button on the form
        * @param {any} e The jQuery event object
        */
        onButtonClick(e: any): void;
        /**
        * When we hit a key on the search box
        * @param {any} e The jQuery event
        */
        onInputKey(e: any): void;
        /**
        * Shows the window by adding it to a Application route.
        */
        show(): void;
        /**
        * Gets the singleton reference of this class.
        * @returns {UserPrivilegesForm}
        */
        static getSingleton(): UserPrivilegesForm;
    }
}
declare module Animate {
    interface IBehaviourPickerProps extends IReactWindowProps {
        onTemplateSelected?: (template: BehaviourDefinition) => void;
    }
    interface IBehaviourPickerState extends IReactWindowState {
        items?: IListItem[];
        selectedIndex?: number;
        search?: string;
        selectedText?: string;
    }
    /**
     * A popup form for quick selection of loaded behaviours
     */
    class BehaviourPicker extends ReactWindow<IBehaviourPickerProps, IBehaviourPickerState> {
        static defaultProps: IBehaviourPickerProps;
        private _onUpProxy;
        /**
         * Creates an instance of the picker
         */
        constructor(props: IBehaviourPickerProps);
        /**
         * Close the window if we click anywhere but the window
         */
        onUp(e: React.MouseEvent): void;
        /**
         * Remove any listeners
         */
        componentWillUnmount(): void;
        /**
         * Get all behaviour template names
         */
        componentDidMount(): void;
        /**
         * Gets the content JSX for the window. Typically this is the props.children, but can be overriden
         * in derived classes
         */
        getContent(): React.ReactNode;
        /**
         * When the input text changes we go through each list item and select the one that is the closest match
         * @param {React.KeyboardEvent} e
         */
        onKeyUp(e: React.KeyboardEvent): void;
    }
}
declare module Animate {
    /**
     * Describes the type of log message
     */
    enum LogType {
        MESSAGE = 0,
        WARNING = 1,
        ERROR = 2,
    }
    interface ILogMessage {
        type: LogType;
        message: string;
        tag: any;
    }
    class LoggerStore extends EventDispatcher {
        private static _singleton;
        private _logs;
        /**
         * Creates an instance of the logger store
         */
        constructor();
        /**
         * Gests all currently logged messages
         * @returns {ILogMessage[]}
         */
        getLogs(): ILogMessage[];
        /**
         * Gets global logger store instance
         * @returns {LoggerStore}
         */
        static get: LoggerStore;
        /**
         * Logs an error message
         * @param {string} msg
         */
        static error(msg: string): void;
        /**
         * Logs a warning message
         * @param {string} msg
         */
        static warn(msg: string): void;
        /**
         * Logs a success message
         * @param {string} msg
         */
        static success(msg: string): void;
        /**
         * Adds a new log item
         */
        add(message: string, type: LogType, tag: any): void;
        /**
         * Removes all logs
         */
        clear(): void;
        /**
         * Logs a message to the logger
         * @param {string} val The text to show on the logger.
         * @param {any} tag An optional tag to associate with the log.
         * @param {string} type The type of icon to associate with the log. By default its Logger.MESSAGE
         */
        static logMessage(val: string, tag: any, type?: LogType): void;
    }
}
declare module Animate {
    interface ILoggerProps {
        store: LoggerStore;
    }
    /**
     * The Logger is a singleton class used to write message's to Animate's log window.
     */
    class Logger extends React.Component<ILoggerProps, {
        items: ILogMessage[];
    }> {
        /**
         * Creates an instance of the logger
         */
        constructor(props: ILoggerProps);
        componentWillMount(): void;
        componentWillUnmount(): void;
        onLogsChanged(type: EditorEventType): void;
        /**
         * Creates the component elements
         * @returns {JSX.Element}
         */
        render(): JSX.Element;
    }
}
declare module Animate {
    enum TooltipPosition {
        TOP = 0,
        BOTTOM = 1,
    }
    interface ITooltipProps {
        tooltip?: JSX.Element | string;
        position?: TooltipPosition;
        offset?: number;
        disabled?: boolean;
    }
    interface ITooltipState {
        showTooltip: boolean;
    }
    /**
     * Creates a new tooltip react Component. The content of this Component
     * is wrapped in a div which listens for mouse enter and leave events.
     * When entered the tooltip property is displayed.
     */
    class Tooltip extends React.Component<ITooltipProps, ITooltipState> {
        private static _tooltip;
        static defaultProps: ITooltipProps;
        /**
         * Creates an instance
         */
        constructor(props: ITooltipProps);
        /**
         * When the mouse enters over the element we add the tooltip to the body
         */
        onMouseEnter(e: React.MouseEvent): void;
        /**
         * When the element is unmounted we remove the tooltip if its added
         */
        componentWillUnmount(): void;
        /**
         * When the mouse leaves we remove the tooltip
         */
        onMouseleave(e: React.MouseEvent): void;
        /**
        * Creates the component elements
        * @returns {JSX.Element}
        */
        render(): JSX.Element;
    }
}
declare module Animate {
    interface IToolbarProps {
    }
    interface IToolbarState {
    }
    /**
    * The main toolbar that sits at the top of the application
    */
    class Toolbar extends React.Component<IToolbarProps, IToolbarState> {
        private static _singleton;
        private $itemSelected;
        private _copyPasteToken;
        constructor(props?: IToolbarProps);
        /**
         * Creates the component elements
         * @returns {JSX.Element}
         */
        render(): JSX.Element;
        /**
        * This is called when an item on the canvas has been selected
        * @param {Component} item
        */
        itemSelected(item: Component): void;
        /**
        * This is called when we have loaded and initialized a new project.
        */
        newProject(project: Project): void;
        /**
        * Opens the splash window
        */
        onHome(): void;
        /**
        * Opens the user privileges window
        */
        onShowPrivileges(): void;
        /**
        * Notifys the app that its about to launch a test run
        */
        onRun(): void;
        /**
        * When we click the paste button
        */
        onPaste(): void;
        /**
        * When we click the copy button
        */
        onDuplicate(cut?: boolean): void;
        /**
        * Shows the rename form - and creates a new behaviour if valid
        */
        newContainer(): void;
        /**
        * When we click the delete button
        */
        onDelete(): void;
        /**
        * This function is used to create a new group on the toolbar
        * @param {string} text The text of the new tab
        * @param {boolean} text The text of the new tab
        * @returns {Component} Returns the {Component} object representing the tab
        */
        createTab(text: string, isSelected?: boolean): Component;
        saveAll(): void;
        /**
        * Called when the key is pushed down
        * @param {any} event
        */
        onKeyDown(event: any): void;
        /**
        * Removes a tab by its name
        * @param {string} text The name of the tab
        */
        removeTab(text: string): void;
        /**
        * This function is used to create a new group on the toolbar
        * @param {Component} tab The {Component} tab object which represents the parent of this group.
        * @returns {Component} Returns the {Component} object representing the group
        */
        createGroup(tab: Component): Component;
        /**
        * Use this function to create a group button for the toolbar
        * @param {string} text The text for the button
        * @param {number} min The minimum limit
        * @param {number} max The maximum limit
        * @param {number} delta The incremental difference when scrolling
        * @param {Component} group The Component object representing the group
        * @returns {ToolbarNumber}
        */
        createGroupNumber(text: string, defaultVal: number, min?: number, max?: number, delta?: number, group?: Component): ToolbarNumber;
        /**
        * Use this function to create a group button for the toolbar
        * @param {string} text The text for the button
        * @param {string} image An image URL for the button icon
        * @param {Component} group The Component object representing the group
        * @param {boolean} isPushButton If true, the button will remain selected when clicked.
        * @returns {Component} Returns the Component object representing the button
        */
        createGroupButton(text: string, image?: string, group?: Component, isPushButton?: boolean): ToolbarButton;
        /**
        * Use this function to create a group button for the toolbar
        * @param {Component} parent The parent that will contain the drop down
        * @param {Array<ToolbarItem>} items An array of items to list
        * @returns {ToolbarDropDown} Returns the Component object representing the button
        */
        createDropDownButton(parent: Component, items: Array<ToolbarItem>): ToolbarDropDown;
        /**
        * Use this function to create a group button for the toolbar
        * @param {Component} parent The parent that will contain the drop down
        * @param {string} text The under the button
        * @param {string} color The hex colour as a string
        * @returns {ToolbarColorPicker} Returns the ToolbarColorPicker object representing the button
        */
        createColorButton(parent: Component, text: string, color: string): ToolbarColorPicker;
        /**
        * Gets the singleton instance
        */
        static getSingleton(parent?: Component): Toolbar;
    }
}
declare module Animate {
    interface IPagerProps extends React.HTMLAttributes {
        onUpdate: (index: number, limit: number) => Promise<number>;
        limit?: number;
    }
    interface IPagerState {
        index?: number;
        limit?: number;
        last?: number;
    }
    /**
     * A class for handling paged content. You can use the pager like you would a div element. The content
     * of which will be displayed in a sub panel with a footer that allows the user to navigate between the content that's inserted.
     * Use the IPagerProps events to hook for each of the navigation requests and fill the content accordingly.
     */
    class Pager extends React.Component<IPagerProps, IPagerState> {
        static defaultProps: IPagerProps;
        /**
         * Creates an instance of the pager
         */
        constructor(props: IPagerProps);
        /**
         * When the component is mounted - load the projects
         */
        componentWillMount(): void;
        /**
        * Calls the update function
        */
        invalidate(): void;
        /**
        * Gets the current page number
        * @returns {number}
        */
        getPageNum(): number;
        /**
        * Gets the total number of pages
        * @returns {number}
        */
        getTotalPages(): number;
        /**
        * Sets the page search back to index = 0
        */
        goFirst(): void;
        /**
        * Gets the last set of users
        */
        goLast(): void;
        /**
        * Sets the page search back to index = 0
        */
        goNext(): void;
        /**
        * Sets the page search back to index = 0
        */
        goPrev(): void;
        /**
         * Creates the component elements
         * @returns {JSX.Element}
         */
        render(): JSX.Element;
    }
}
declare module Animate {
    interface ISearchBoxProps extends React.HTMLAttributes {
        onSearch(e: React.FormEvent, searchText: string): any;
        /**
         * Only call onSearch when the input loses focus
         */
        triggerOnBlur?: boolean;
    }
    /**
     * Wraps an input box with HTML that makes it look like a search bar.
     * Add a listener for the onChange event and it will be triggered either when the input
     * changes, or the search button is pressed.
     */
    class SearchBox extends React.Component<ISearchBoxProps, {
        value: string;
    }> {
        static defaultProps: ISearchBoxProps;
        /**
         * Creates an instance of the search box
         */
        constructor(props: ISearchBoxProps);
        /**
         * Called when the props are updated
         */
        componentWillReceiveProps(nextProps: IVCheckboxProps): void;
        /**
         * Called whenever the input changes
         */
        onChange(e: React.FormEvent): void;
        /**
         * Called whenever the input loses focus
         */
        onBlur(e: React.FormEvent): void;
        /**
         * Creates the component elements
         * @returns {JSX.Element}
         */
        render(): JSX.Element;
    }
}
declare module Animate {
    interface IAttentionProps extends React.HTMLAttributes {
        mode?: AttentionType;
        showIcon?: boolean;
        allowClose?: boolean;
    }
    /**
     * A simple component for displaying a styled message to the user
     */
    class Attention extends React.Component<IAttentionProps, {
        isClosed: boolean;
    }> {
        static defaultProps: IAttentionProps;
        /**
         * Creates an a new intance
         */
        constructor(props: IAttentionProps);
        /**
         * Called when the props are updated
         */
        componentWillReceiveProps(nextProps: IAttentionProps): void;
        /**
         * Creates the component elements
         * @returns {JSX.Element}
         */
        render(): JSX.Element;
    }
}
declare module Animate {
    type SelectValue = {
        label: string;
        value: string | number;
        selected: boolean;
    };
    interface IVSelectProps extends React.HTMLAttributes {
        /**
         * Called whenever an option is selected
         * @param {SelectValue} option
         * @param {HTMLSelectElement} element
         */
        onOptionSelected?: (option: SelectValue, element: HTMLSelectElement) => void;
        /**
         * An array of options to use with the select
         */
        options?: SelectValue[];
        /**
         * If true, then an empty option will be added
         */
        createEmptyOption?: boolean;
        /**
         * If true, then validation will pass when nothing is selected
         */
        allowEmptySelection?: boolean;
        /**
         * Called whenever the input fails a validation test
         */
        onValidationError?: (e: Error, target: VSelect) => void;
        /**
         * Called whenever the input passes a previously failed validation test
         */
        onValidationResolved?: (target: VSelect) => void;
        /**
         * An optional error message to use to describe when a problem occurs. If for example you have validation against
         * not having white space - when the error passed to onValidationError is 'Cannot be empty'. If however errorMsg is
         * provided, then that is used instead (for example 'Please specify a value for X')
         */
        errorMsg?: string;
    }
    /**
     * A verified select box is an one that can optionally have its value verified. The select must be used in conjunction
     * with the VForm.
     */
    class VSelect extends React.Component<IVSelectProps, {
        error?: string;
        selected?: SelectValue;
        highlightError?: boolean;
    }> {
        private _pristine;
        /**
         * Creates a new instance
         */
        constructor(props: IVSelectProps);
        /**
         * Gets the current selected option
         * @returns {SelectValue}
         */
        value: SelectValue;
        /**
         * Called when the component is about to be mounted.
         */
        componentWillMount(): void;
        /**
         * Sets the highlight error state. This state adds a 'highlight-error' class which
         * can be used to bring attention to the component
         */
        highlightError: boolean;
        /**
         * Checks the selected option
         * @returns {string} An error string or null if there are no errors
         */
        validate(val: string | number): string;
        /**
         * Called whenever the value changes
         * @param {React.FormEvent} e
         */
        private onChange(e);
        /**
         * Gets if this input has not been touched by the user. False is returned if it has been
         * @returns {boolean}
         */
        pristine: boolean;
        /**
         * Creates the component elements
         * @returns {JSX.Element}
         */
        render(): JSX.Element;
    }
}
declare module Animate {
    interface IVCheckboxProps extends React.HTMLAttributes {
        onChecked?: (e: React.FormEvent, checked: boolean, input: HTMLInputElement) => void;
        noInteractions?: boolean;
    }
    class VCheckbox extends React.Component<IVCheckboxProps, {
        checked?: boolean;
        pristine?: boolean;
    }> {
        static defaultProps: IVCheckboxProps;
        /**
         * Creates an instance
         */
        constructor(props: IVCheckboxProps);
        /**
         * Called whenever the checkbox input changes
         * @param {React.FormEvent} e
         */
        onChange(e: React.FormEvent): void;
        /**
         * Called when the props are updated
         */
        componentWillReceiveProps(nextProps: IVCheckboxProps): void;
        /**
         * Gets the current checked state of the input
         * @returns {boolean}
         */
        checked: boolean;
        /**
         * Gets if this input has not been touched by the user. False is returned if it has been
         * @returns {boolean}
         */
        pristine: boolean;
        /**
        * Creates the component elements
        * @returns {JSX.Element}
        */
        render(): JSX.Element;
    }
}
declare module Animate {
    interface IVInputProps extends React.HTMLAttributes {
        /**
         * The type of validation to perform on the input. This can be treated as enum flags and use multiple validations. For example
         * validator = ValidationType.NOT_EMPTY | ValidationType.EMAIL
         */
        validator?: ValidationType;
        value?: string;
        /**
         * If specified, the hint will help users type out a word
         */
        hint?: string;
        /**
         * The minimum number of characters allowed
         */
        minCharacters?: number;
        /**
         * The maximum number of characters allowed
         */
        maxCharacters?: number;
        /**
         * Called whenever the input fails a validation test
         */
        onValidationError?: (e: Error, target: VInput) => void;
        /**
         * Called whenever the input passes a previously failed validation test
         */
        onValidationResolved?: (target: VInput) => void;
        /**
         * An optional error message to use to describe when a problem occurs. If for example you have validation against
         * not having white space - when the error passed to onValidationError is 'Cannot be empty'. If however errorMsg is
         * provided, then that is used instead (for example 'Please specify a value for X')
         */
        errorMsg?: string;
        /**
         * If true, then the input will select everything when clicked
         */
        selectOnClick?: boolean;
    }
    /**
     * A verified input is an input that can optionally have its value verified. The input must be used in conjunction
     * with the VForm.
     */
    class VInput extends React.Component<IVInputProps, {
        error?: string;
        value?: string;
        highlightError?: boolean;
    }> {
        static defaultProps: IVInputProps;
        private _pristine;
        private _hintStart;
        private _hintEnd;
        /**
         * Creates a new instance
         */
        constructor(props: any);
        /**
         * Gets the current value of the input
         * @returns {string}
         */
        value: string;
        /**
         * Called when the component is about to be mounted.
         */
        componentWillMount(): void;
        /**
         * Called when the props are updated
         */
        componentWillReceiveProps(nextProps: IVCheckboxProps): void;
        /**
         * Sets the highlight error state. This state adds a 'highlight-error' class which
         * can be used to bring attention to the component
         */
        highlightError: boolean;
        /**
         * Checks the string against all validators.
         * @returns {string} An error string or null if there are no errors
         */
        getValidationErrorMsg(val: string): string;
        componentDidUpdate(nextProps: any): void;
        /**
         * Only called when we have hints enabled
         */
        onKeyUp(e: React.KeyboardEvent): void;
        /**
         * Called whenever the value changes
         * @param {React.FormEvent} e
         */
        private onChange(e);
        /**
         * Gets if this input has not been touched by the user. False is returned if it has been
         * @returns {boolean}
         */
        pristine: boolean;
        /**
         * Creates the component elements
         * @returns {JSX.Element}
         */
        render(): JSX.Element;
    }
}
declare module Animate {
    interface IVTextareaProps extends React.HTMLAttributes {
        /**
         * The type of validation to perform on the input. This can be treated as enum flags and use multiple validations. For example
         * validator = ValidationType.NOT_EMPTY | ValidationType.EMAIL
         */
        validator?: ValidationType;
        value?: string;
        /**
         * The minimum number of characters allowed
         */
        minCharacters?: number;
        /**
         * The maximum number of characters allowed
         */
        maxCharacters?: number;
        /**
         * Called whenever the input fails a validation test
         */
        onValidationError?: (e: Error, target: VTextarea) => void;
        /**
         * Called whenever the input passes a previously failed validation test
         */
        onValidationResolved?: (target: VTextarea) => void;
        /**
         * An optional error message to use to describe when a problem occurs. If for example you have validation against
         * not having white space - when the error passed to onValidationError is 'Cannot be empty'. If however errorMsg is
         * provided, then that is used instead (for example 'Please specify a value for X')
         */
        errorMsg?: string;
    }
    /**
     * A verified textarea is an input that can optionally have its value verified. The textarea must be used in conjunction
     * with the VForm.
     */
    class VTextarea extends React.Component<IVTextareaProps, {
        error?: string;
        value?: string;
        highlightError?: boolean;
        className?: string;
    }> {
        private _pristine;
        /**
         * Creates a new instance
         */
        constructor(props: any);
        /**
         * Called when the component is about to be mounted.
         */
        componentWillMount(): void;
        /**
         * Called when the props are updated
         */
        componentWillReceiveProps(nextProps: IVCheckboxProps): void;
        /**
         * Gets the current value of the input
         * @returns {string}
         */
        value: string;
        /**
         * Sets the highlight error state. This state adds a 'highlight-error' class which
         * can be used to bring attention to the component
         */
        highlightError: boolean;
        /**
         * Checks the string against all validators.
         * @returns {string} An error string or null if there are no errors
         */
        getValidationErrorMsg(val: string): string;
        /**
         * Called whenever the value changes
         * @param {React.FormEvent} e
         */
        private onChange(e);
        /**
         * Gets if this input has not been touched by the user. False is returned if it has been
         * @returns {boolean}
         */
        pristine: boolean;
        /**
         * Creates the component elements
         * @returns {JSX.Element}
         */
        render(): JSX.Element;
    }
}
declare module Animate {
    type ValidationError = {
        name: string;
        error: string;
    };
    type VGeneric = VInput | VTextarea | VCheckbox | VSelect;
    interface IVFormProps extends React.HTMLAttributes {
        /**
         * If true, prevents the form being automatically submitted
         */
        preventDefault?: boolean;
        /**
         * A callback for when submit is called and there are no validation errors
         */
        onSubmitted: (json: any, form: VForm) => void;
        /**
         * A callback for when a validation error has occurred
         */
        onValidationError: (e: ValidationError[], form: VForm) => void;
        /**
         * A callback for when a previously invalid form is validated
         */
        onValidationsResolved: (form: VForm) => void;
    }
    /**
     * A validated form is one which checks its children inputs for validation errors
     * before allowing the form to be submitted. If there are errors the submit is not allowed.
     * Only validated inputs are checked by the form (eg VInput). When the form is submitted
     * via the onSubmitted callback, it sends a json object with the name and values of each of
     * the validated inputs. The name is taken from the name of the input name attribute and the
     * value from its value.
     */
    class VForm extends React.Component<IVFormProps, {
        error?: boolean;
        pristine?: boolean;
    }> {
        static defaultProps: IVFormProps;
        private _proxyInputProblem;
        private _className;
        private _values;
        /**
         * Creates a new instance
         */
        constructor(props: IVFormProps);
        /**
         * Focus on the name element once its mounted
         */
        componentDidMount(): void;
        /**
         * Called when the form is submitted. VForms automatically cancel the request with preventDefault.
         * This can be disabled with the preventDefault property.
         * @param {React.FormEvent} e
         */
        onSubmit(e: React.FormEvent): void;
        /**
         * Goes through the validations and calls submit if everything passes
         */
        initiateSubmit(): void;
        /**
         * Called whenever any of the inputs fire a change event
         * @param {React.FormEvent} e
         */
        onChange(e: React.FormEvent): void;
        /**
         * Called if any of the validated inputs reported or resolved an error
         * @param {Error} e The error that occurred
         * @param {VGeneric} target The input that triggered the error
         */
        onError(e: Error, target: VGeneric): void;
        /**
         * Gets if this form has not been touched by the user. False is returned if it has been,
         * @returns {boolean}
         */
        pristine: boolean;
        /**
         * Creates the component elements
         * @returns {JSX.Element}
         */
        render(): JSX.Element;
    }
}
declare module Animate {
    type PluginMap = {
        [name: string]: IPluginPlus[];
    };
    interface IPluginPlus extends Engine.IPlugin {
        expanded?: boolean;
    }
    interface IPluginsWidgetProps {
        onChange(selectedPlugins: IPluginPlus[]): any;
        onError(error: Error): any;
    }
    interface IPluginsWidgetState {
        loading?: boolean;
        plugins?: PluginMap;
        selectedPlugin?: IPluginPlus;
        activePlugin?: IPluginPlus;
        selectedPlugins?: IPluginPlus[];
    }
    /**
     * A class for displaying a list of available plugins that can be used with a project.
     */
    class PluginsWidget extends React.Component<IPluginsWidgetProps, IPluginsWidgetState> {
        /**
         * Creates an instance
         */
        constructor(props: IPluginsWidgetProps);
        /**
         * When the component is mounted, we download the latest plugins
         */
        componentWillMount(): void;
        /**
         * Gets the currently selected plugins
         * @returns {IPluginPlus[]}
         */
        selectedPlugins: IPluginPlus[];
        selectPlugin(plugin: IPluginPlus): void;
        mustShowPluginTick(plugin: any, index: number): boolean;
        showVersions(plugin: Engine.IPlugin): void;
        /**
         * Once the plugins are loaded from the DB
         * @param {Array<Engine.IPlugin>} plugins
         * @returns {PluginMap}
         */
        onPluginsLoaded(plugins: Array<Engine.IPlugin>): PluginMap;
        /**
         * Generates the React code for displaying the plugins
         */
        createPluginHierarchy(): JSX.Element[];
        /**
         * Creates the component elements
         * @returns {JSX.Element}
         */
        render(): JSX.Element;
    }
}
declare module Animate {
    /**
     *  Extends the project with a selected attribute
     */
    interface IInteractiveProject extends Engine.IProject {
        selected?: boolean;
    }
    interface IProjectListProps extends React.HTMLAttributes {
        onProjectSelected?: (project: IInteractiveProject) => void;
        onProjectDClicked?: (project: IInteractiveProject) => void;
        noProjectMessage?: string;
    }
    interface IProjectListState {
        loading?: boolean;
        searchText?: string;
        selectedProject?: IInteractiveProject;
        errorMsg?: string;
        projects?: IInteractiveProject[];
    }
    /**
     * A list that displays projects
     */
    class ProjectList extends React.Component<IProjectListProps, IProjectListState> {
        static defaultProps: IProjectListProps;
        private _user;
        /**
         * Creates a new instance
         */
        constructor(props: any);
        /**
         * Removes a project from the list
         * @param {IInteractiveProject} p The project to remove
         */
        removeProject(p: IInteractiveProject): void;
        selectProject(project: IInteractiveProject, doubleClick: boolean): void;
        fetchProjects(index: number, limit: number): Promise<number>;
        /**
         * Creates the component elements
         * @returns {JSX.Element}
         */
        render(): JSX.Element;
    }
}
declare module Animate {
    interface IOpenProjectProps {
        onCancel: () => void;
        onComplete: () => void;
        project: Engine.IProject;
    }
    interface IOpenProjectState {
        selectedProject?: Engine.IProject;
        message?: string;
        mode?: AttentionType;
        loading?: boolean;
    }
    class OpenProject extends React.Component<IOpenProjectProps, IOpenProjectState> {
        /**
         * Creates a new instance
         */
        constructor(props: IOpenProjectProps);
        /**
        * Attempts to load the project and setup the scene
        */
        loadScene(): void;
        componentWillMount(): void;
        /**
         * Creates the component elements
         * @returns {JSX.Element}
         */
        render(): JSX.Element;
    }
}
declare module Animate {
    interface ILoginFormProps {
        onLogin: () => void;
        onLoadingChange?: (loading: boolean) => void;
        switchMode: () => void;
    }
    interface ILoginFormState {
        loading?: boolean;
        username?: string;
        errorMsg?: string;
        error?: boolean;
    }
    class LoginForm extends React.Component<ILoginFormProps, ILoginFormState> {
        private _user;
        /**
         * Creates a new instance
         */
        constructor();
        /**
         * When the component is mounted we check if the user is logged in
         */
        componentWillMount(): void;
        loginError(err: Error): void;
        loginSuccess(data: UsersInterface.IResponse): void;
        /**
         * Attempts to reset the users password
         */
        resetPassword(): void;
        /**
         * Attempts to resend the activation code
         */
        resendActivation(): void;
        /**
        * Attempts to log the user in
        */
        login(json: any): void;
        /**
         * Creates the component elements
         * @returns {JSX.Element}
         */
        render(): JSX.Element;
    }
}
declare module Animate {
    interface IRegisterFormProps {
        onLogin?: () => void;
        onLoadingChange?: (loading: boolean) => void;
        switchMode: () => void;
    }
    interface IRegisterFormState {
        loading?: boolean;
        errorMsg?: string;
        error?: boolean;
    }
    class RegisterForm extends React.Component<IRegisterFormProps, IRegisterFormState> {
        private _user;
        private _captchaId;
        /**
         * Creates a new instance
         */
        constructor();
        /**
        * Attempts to register a new user
        */
        register(json: any): void;
        /**
         * Called when the captcha div has been mounted and is ready
         * to be rendered
         * @param {HTMLDivElement} div The div being rendered
         */
        mountCaptcha(div: HTMLDivElement): void;
        /**
         * Called when the component is unmounted
         */
        componentWillUnmount(): void;
        /**
         * Creates the component elements
         * @returns {JSX.Element}
         */
        render(): JSX.Element;
    }
}
declare module Animate {
    enum LoginMode {
        LOGIN = 0,
        REGISTER = 1,
    }
    interface ILoginWidgetState {
        mode?: LoginMode;
        loading?: boolean;
    }
    class LoginWidget extends React.Component<{
        onLogin: () => void;
    }, ILoginWidgetState> {
        private _user;
        /**
         * Creates a new instance
         */
        constructor();
        switchState(): void;
        /**
         * Creates the component elements
         * @returns {JSX.Element}
         */
        render(): JSX.Element;
    }
}
declare module Animate {
    enum SplashMode {
        WELCOME = 0,
        LOGIN = 1,
        NEW_PROJECT = 2,
        OPENING = 3,
    }
    interface ISplashProps {
        onClose: () => void;
    }
    interface ISplashStats {
        mode?: SplashMode;
        loading?: boolean;
        project?: Engine.IProject;
        theme?: string;
    }
    /**
    * The splash screen when starting the app
    */
    class Splash extends React.Component<ISplashProps, ISplashStats> {
        private static _singleton;
        /**
        * Creates an instance of the splash screen
        */
        constructor(props: ISplashProps);
        /**
         * Creates the component elements
         * @returns {JSX.Element}
         */
        render(): JSX.Element;
        show(): void;
        splashDimensions(): string;
        reset(): void;
        /**
        * Attempts to resend the activation code
        */
        logout(): void;
        /**
        * Gets the singleton reference of this class.
        * @returns {Splash}
        */
        static get: Splash;
    }
}
declare module Animate {
    interface INewProjectProps {
        onCancel: () => void;
        onProjectCreated: (project: Engine.IProject) => void;
    }
    interface INewProjectState {
        plugins?: IPluginPlus[];
        errorMsg?: string;
        error?: boolean;
        loading?: boolean;
    }
    /**
     * A Component for creating a new project
     */
    class NewProject extends React.Component<INewProjectProps, INewProjectState> {
        private _user;
        /**
         * Creates a new instance
         */
        constructor(props: any);
        /**
         * Creates a new user project
         * @param {any} json
         */
        newProject(json: any): void;
        /**
        * Creates the component elements
        * @returns {JSX.Element}
        */
        render(): JSX.Element;
    }
}
declare module Animate {
    interface IProjectsOverviewProps extends React.HTMLAttributes {
        onCreateProject: () => void;
        onOpenProject: (project: Engine.IProject) => void;
    }
    interface IProjectsOverviewState {
        loading?: boolean;
        selectedProject?: IInteractiveProject;
        errorMsg?: string;
    }
    /**
     * A component for viewing projects, displaying their stats, removing, adding or opening them.
     */
    class ProjectsOverview extends React.Component<IProjectsOverviewProps, IProjectsOverviewState> {
        private _user;
        private _list;
        /**
         * Creates an instance of the projects overview
         */
        constructor(props: IProjectsOverviewProps);
        removeProject(messageBoxAnswer: string): void;
        /**
        * Creates the component elements
        * @returns {JSX.Element}
        */
        render(): JSX.Element;
    }
}
declare module Animate {
    interface IApplicationState {
        showSplash?: boolean;
    }
    /**
    * The main GUI component of the application.
    */
    class Application extends React.Component<React.HTMLAttributes, IApplicationState> {
        private static _singleton;
        static bodyComponent: Component;
        private _focusObj;
        private _resizeProxy;
        private _downProxy;
        private _sceneStore;
        constructor(props: React.HTMLAttributes);
        componentDidMount(): void;
        /**
         * Creates the component elements
         * @returns {JSX.Element}
         */
        render(): JSX.Element;
        /**
        * Deals with the focus changes
        * @param {object} e The jQuery event object
        */
        onMouseDown(e: any): void;
        /**
        * Sets a component to be focused.
        * @param {Component} comp The component to focus on.
        */
        setFocus(comp: Component): void;
        /**
        *  This is called when a project is unloaded and we need to reset the GUI.
        */
        projectReset(): void;
        /**
        * Gets the singleton instance
        */
        static getInstance(domElement?: string): Application;
        focusObj: Component;
    }
}
declare var _cache: string;
declare var __plugins: {
    [name: string]: Array<Engine.IPlugin>;
};
declare var __newPlugin: Animate.IPlugin;
/**
* Goes through each of the plugins and returns the one with the matching ID
* @param {string} id The ID of the plugin to fetch
*/
declare function getPluginByID(id: string): Engine.IPlugin;
/**
* Once the plugins are loaded from the DB
* @param {Array<Engine.IPlugin>} plugins
*/
declare function onPluginsLoaded(plugins: Array<Engine.IPlugin>): void;
/**
* Returns a formatted byte string
* @returns {string}
*/
declare function byteFilter(bytes: any, precision?: number): string;
