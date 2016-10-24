declare let config: {
    'version': string;
    'userServiceUrl': string;
    'host': string;
};
declare namespace Animate {
    namespace EventTypes {
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
declare namespace Animate {
    /**
    * A basic wrapper for a Portal interface
    */
    interface IPortal {
        name: string;
        type: HatcheryRuntime.PortalType;
        custom: boolean;
        property: any;
        left?: number;
        top?: number;
        size?: number;
        behaviour?: number;
        links?: ILinkItem[];
    }
    /**
     * A basic wrapper for a CanvasItem interface
     */
    interface ICanvasItem {
        id?: number;
        type?: HatcheryRuntime.ItemType | 'comment' | 'shortcut';
        left?: number;
        top?: number;
        selected?: boolean;
        width?: number;
        height?: number;
    }
    /**
    * A basic wrapper for a Link interface
    */
    interface ILinkItem extends ICanvasItem {
        frameDelay?: number;
        startPortal?: string;
        endPortal?: string;
        startBehaviour?: number;
        endBehaviour?: number;
        points?: Point[];
    }
    /**
    * A basic wrapper for a Behaviour interface
    */
    interface IBehaviour extends ICanvasItem {
        alias?: string;
        behaviourType?: string;
        portals?: IPortal[];
    }
    /**
    * A basic wrapper for a Comment interface
    */
    interface IComment extends ICanvasItem {
        label: string;
    }
    /**
    * A basic wrapper for a BehaviourPortal interface
    */
    interface IBehaviourPortal extends IBehaviour {
        portal: IPortal;
    }
    /**
    * A basic wrapper for a BehaviourScript interface
    */
    interface IBehaviourScript extends IBehaviour {
        scriptId: string;
    }
    /**
    * A basic wrapper for a BehaviourShortcut interface
    */
    interface IBehaviourShortcut extends IBehaviour {
        targetId: number;
    }
}
declare namespace Animate {
    /**
     * Events related to the web socket communication API
     */
    type SocketEvents = 'Error' | UsersInterface.SocketTokens.ClientInstructionType;
    type ProjectEvents = 'change' | 'editor-created' | 'editor-removed' | 'resource-created' | 'resource-removed' | 'saved' | 'saved_all' | 'failed' | 'build_selected' | 'build_saved';
    /**
     * Events related to project resources
     */
    type ResourceEvents = 'edited' | 'refreshed' | 'modified';
    /**
     * Events related to the resource editors
     */
    type EditorEvents = 'change';
    /**
     * Events related to the plugin manager
     */
    type PluginManagerEvents = 'template-created' | 'template-removed' | 'editor-ready';
    /**
     * Events dispatched by a treeview
     */
    type TreeviewEvents = 'change' | 'focus-node';
    /**
     * An event object dispatched by the PluginManager for template related events
     */
    interface ITemplateEvent {
        template: BehaviourDefinition;
    }
    /**
     * An event token for events dispatched by changes to or from resources
     */
    interface IResourceEvent {
        resource: ProjectResource<HatcheryServer.IResource>;
    }
    /**
     * An event token for events dispatched by changes to or from project containers
     */
    interface IContainerEvent {
        container: Resources.Container;
    }
    /**
     * An event token for events dispatched by changes to or from project editors
     */
    interface IEditorEvent {
        editor: Editor;
    }
    /**
     * TODO: Can probably be removed
     * Valid response codes for requests made to the Animate server
     */
    type AnimateLoaderResponses = 'success' | 'error';
    /**
     * TODO: Can probably be removed
     * Valid response codes for xhr binary requests
     */
    type BinaryLoaderResponses = 'binary_success' | 'binary_error';
    /**
     * Event types for logger based events
     */
    type LoggerEvents = 'change';
    /**
     * Basic set of loader events shared by all loaders
     * TODO: Can probably be removed
     */
    type LoaderEvents = 'complete' | 'failed';
    /**
     * An event token for TreeNodeModel related events
     */
    interface INodeEvent {
        node: TreeNodeModel;
    }
    /**
     * An event token for socket API related events
     */
    interface ISocketEvent {
        error?: Error;
        json?: UsersInterface.SocketTokens.IToken;
    }
    /**
     * TODO: Can probably be removed
     * Events associated with xhr binary requests
     */
    interface BinaryLoaderEvent {
        buffer: ArrayBuffer | null;
        message: string;
    }
    /**
     * TODO: Can probably be removed
     * Events associated with requests made to the animate servers
     */
    interface AnimateLoaderEvent {
        message: string;
        return_type: AnimateLoaderResponses;
        data: any;
        tag: any;
    }
}
declare namespace Animate {
    class DataToken {
        category: string;
        command: string;
        projectID: string;
    }
}
declare namespace Animate {
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
declare namespace Animate {
    type CompiledEval = (ctrl, event, elm, contexts) => any;
    interface IDirective {
        expand(expression: string, ctrl: any, desc: DescriptorNode, instance: InstanceNode): Array<AppNode> | null;
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
            'alpha-numeric': {
                regex: RegExp;
                name: string;
                negate: boolean;
            };
            'non-empty': {
                regex: RegExp;
                name: string;
                negate: boolean;
            };
            'alpha-numeric-plus': {
                regex: RegExp;
                name: string;
                negate: boolean;
            };
            'email-plus': {
                regex: RegExp;
                name: string;
                negate: boolean;
            };
            'email': {
                regex: RegExp;
                name: string;
                negate: boolean;
            };
            'no-html': {
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
        static parse(script: string, ctrl: any, event: any, elm: AppNode, $ctxValues?: Array<any> | null): any;
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
        static expand(root: RootNode, ctrl: any): Element;
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
        static digest(jElem: JQuery): Element;
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
declare namespace Animate {
    class Repeater implements IDirective {
        private _returnVal;
        constructor();
        expand(expression: string, ctrl: any, desc: DescriptorNode, instance: InstanceNode): Array<AppNode> | null;
    }
}
declare namespace Animate {
    class If implements IDirective {
        private _returnVal;
        constructor();
        expand(expression: string, ctrl: any, desc: DescriptorNode, instance: InstanceNode): Array<AppNode> | null;
    }
}
declare namespace Animate {
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
        edit(prop: Prop<any>, container: Component): void | null;
        cleanup(): void;
    }
}
declare namespace Animate {
    /**
     * Base class for all custom enums
     */
    class ENUM {
        value: string;
        constructor(v: string);
        toString(): string;
    }
    type TypedCallback<T extends string, Y> = (type: T, event: Y, sender?: EventDispatcher) => void;
    /**
     * Internal class only used internally by the {EventDispatcher}
     */
    class EventListener<T extends string, Y> {
        type: T;
        func: TypedCallback<T, Y>;
        context: any;
        constructor(type: T, func: TypedCallback<T, Y>, context?: any);
    }
    /**
     * A simple class that allows for the adding, removing and dispatching of events.
     */
    class EventDispatcher {
        private _listeners;
        disposed: boolean;
        constructor();
        /**
         * Returns the list of event listeners that are currently attached to this dispatcher.
         */
        readonly listeners: Array<EventListener<string, any>>;
        /**
         * Adds a new listener to the dispatcher class.
         * @param type The event type we are sending
         * @param func The callback function
         * @param context [Optional] The context to call with
         */
        on<T extends string, Y>(type: T, func: TypedCallback<T, Y>, context?: any): void;
        /**
         * Adds a new listener to the dispatcher class.
         * @param type The event type we are sending
         * @param func The callback function
         * @param context [Optional] The context to call with
         */
        off<T extends string, Y>(type: T, func: TypedCallback<T, Y>, context?: any): void;
        /**
         * Sends a message to all listeners based on the eventType provided.
         * @param type The event type we are sending
         * @param data [Optional] The data to send with the emission
         */
        emit<T extends string, Y>(type: T, data?: Y | null): any;
        /**
         * This will cleanup the component by nullifying all its variables and clearing up all memory.
         */
        dispose(): void;
    }
}
declare namespace Animate {
    /**
     * This class describes a template. These templates are used when creating assets.
     */
    class AssetClass {
        private _abstractClass;
        private _name;
        parentClass: AssetClass | null;
        private _imgURL;
        private _variables;
        classes: Array<AssetClass>;
        constructor(name: string, parent: AssetClass | null, imgURL: string, abstractClass?: boolean);
        /**
         * Gets an array of all classes that are possible from this
         */
        getClasses(): AssetClass[];
        /**
        * Creates an object of all the variables for an instance of this class.
        * @returns The variables we are editing
        */
        buildVariables(): EditableSet;
        /**
        * Finds a class by its name. Returns null if nothing is found
        */
        findClass(name: string): AssetClass | null;
        /**
        * Adds a variable to the class.
        * @param prop The property to add
        * @returns A reference to this AssetClass
        */
        addVar(prop: Prop<any>): AssetClass;
        /**
        * This will clear and dispose of all the nodes
        */
        dispose(): void;
        /**
        * Gets a variable based on its name
        * @param name The name of the class
        */
        getVariablesByName<T>(name: string): Prop<T> | null;
        /**
        * Gets the image URL of this template
        */
        readonly imgURL: string;
        /**
        * Gets the variables associated with this template
        */
        readonly variables: Array<Prop<any>>;
        /**
        * Adds a class
        * @param name The name of the class
        * @param img The optional image of the class
        * @param abstractClass A boolean to define if this class is abstract or not. I.e. does this class allow for creating assets or is it just the base for others.
        */
        addClass(name: string, img: string, abstractClass: boolean): AssetClass;
        /**
        * Gets the name of the class
        */
        readonly name: string;
        /**
        * Gets if this class is abstract or not
        */
        readonly abstractClass: boolean;
    }
}
declare namespace Animate {
    interface IAjaxError {
        message: string;
        status: number;
    }
    interface Point {
        x: number;
        y: number;
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
         * @param val The string to check
         * @param validator The type of validations to check
         */
        static checkValidation(val: string, validator: ValidationType): string | null;
        /**
        * Generates a new shallow Id - an id that is unique only to this local session
        * @param reference Pass a reference id to make sure the one generated is still valid. Any ID that's imported can potentially offset this counter.
        */
        static generateLocalId(reference?: number): number;
        /**
         * Capitalizes the first character of a string
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
        * @param type The type of property to create
        */
        static createProperty(name: string, type: PropertyType): Prop<any> | null;
        /**
         * Gets the relative position of the mouse to the given element
         * @param e
         * @param elm The target element
         */
        static getRelativePos(e: React.MouseEvent | MouseEvent, elm: HTMLElement): Point;
        /**
         * Gets a quadratically eased in/out value
         * @param startValue The initial value
         * @param delta The difference between the start value and its target
         * @param curTime Between 0 and duration
         * @param duration The total time
         */
        static quadInOut(startValue: any, delta: any, curTime: any, duration: any): number;
        /**
         * Scrolls an element to the destination x and y for a given duration
         * @param dest The target X & Y coordinates
         * @param elm The element to scroll
         * @param duration The total amount of time to take to scroll
         * @return Returns setInterval
         */
        static scrollTo(dest: Point, elm: HTMLElement, duration: number): number;
        /**
        * Use this function to check if a value contains characters that break things.
        * @param text The text to check
        * @param allowSpace If this is true, empty space will be allowed
        * @returns Returns null or string. If it returns null then everything is fine. Otherwise a message is returned with what's wrong.
        */
        static checkForSpecialChars(text: string, allowSpace?: boolean): string | null;
        /**
         * Tells us if a string is a valid email address
         */
        static validateEmail(email: string): boolean;
        /**
         * Returns the class name of the argument or undefined if
         * it's not a valid JavaScript object.
         */
        static getObjectClass(obj: any): any;
    }
}
declare namespace Animate {
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
         * @param pluginDefinition The plugin to load
         */
        loadPlugin(pluginDefinition: HatcheryServer.IPlugin): Promise<HatcheryServer.IPlugin>;
        /**
         * This funtcion is used to load a plugin.
         * @param pluginDefinition The IPlugin constructor that is to be created
         * @param createPluginReference Should we keep this constructor in memory? The default is true
         */
        preparePlugin(pluginDefinition: HatcheryServer.IPlugin): void;
        /**
         * Call this function to unload a plugin
         * @param plugin The IPlugin object that is to be loaded
         */
        unloadPlugin(plugin: IPlugin): void;
        /**
         * Loops through each of the converters to see if a conversion is possible. If it is
         * it will return an array of conversion options, if not it returns false.
         * @param typeA The first type to check
         * @param typeB The second type to check
         */
        getConverters(typeA: any, typeB: any): string[] | null;
        /**
         * Gets a behaviour template by its name.
         * @param behaviorName The name of the behaviour template
         */
        getTemplate(behaviorName: string): BehaviourDefinition | null;
        /**
         * Use this function to select an asset in the tree view and property grid
         * @param asset The Asset object we need to select
         * @param panToNode When set to true, the treeview will bring the node into view
         * @param multiSelect When set to true, the treeview not clear any previous selections
         */
        selectAsset(): void;
        /**
         * Gets an asset class by its name
         * @param name The name of the asset class
         */
        getAssetClass(name: string): AssetClass | null;
        /**
         * Called when the project is reset by either creating a new one or opening an older one.
         */
        projectReset(): void;
        /**
         * This function is called by Animate when everything has been loaded and the user is able to begin their session.
         */
        projectReady(): void;
        /**
         * Creates a thumbnail preview of the file
         */
        thumbnail(file: HatcheryServer.IFile): Promise<HTMLCanvasElement> | null;
        /**
         * This function generates a React Element that is used to preview a file
         * @param file The file we are looking to preview
         * @returns If a React Element is returned is added in the File viewer preview
         */
        displayPreview(file: HatcheryServer.IFile): JSX.Element | null;
        readonly assetTemplates: AssetTemplate[];
        readonly loadedPlugins: IPlugin[];
        readonly behaviourTemplates: BehaviourDefinition[];
        /**
         * Gets the singleton instance.
         */
        static getSingleton(): PluginManager;
    }
}
declare namespace Animate {
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
        * @param {Resources.Asset} asset the asset object to check
        * @param {ContainerToken} container The container to add refernces on
        * @returns {any}
        */
        referenceCheckAsset(asset: Resources.Asset, container: any): void;
        /**
        * Adds group references to a container token during the export.
        * @param {TreeNodeGroup} group the group object to check
        * @param {ContainerToken} container The container to add refernces on
        * @returns {any}
        */
        referenceCheckGroup(group: TreeNodeGroup, container: any): void;
        /**
        * This is the resonse from the server
        */
        onServer(): void;
        /**
        * Gets the singleton instance.
        * @extends <ImportExport>
        */
        static getSingleton(): ImportExport;
    }
}
declare namespace Animate {
    /**
    * A base class for all project resources
    */
    abstract class ProjectResource<T extends HatcheryServer.IResource> extends EventDispatcher {
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
        */
        /**
        * Sets if this resource is saved
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
declare namespace Animate {
    namespace Resources {
        /**
        * Assets are resources with a list of editable properties. Typically assets are made from templates defined in plugins.
        * They define the objects you can interact with in an application. For example, a cat plugin might define an asset template
        * called Cat which allows you to create a cat asset in the application. The properties of the cat asset would be defined by
        * the plugin.
        */
        class Asset extends ProjectResource<HatcheryServer.IAsset> {
            class: AssetClass;
            /**
            * @param assetClass The name of the 'class' or 'template' that this asset belongs to
            * @param entry [Optional] The asset database entry
            */
            constructor(assetClass: AssetClass, entry: HatcheryServer.IAsset);
            /**
            * Writes this assset to a readable string
            */
            toString(): string;
            /**
            * Use this function to reset the asset properties
            * @param name The name of the asset
            * @param className The 'class' or 'template' name of the asset
            * @param json The JSON data of the asset.
            */
            update(name: string, className: string, json?: any): void;
            /**
            * Disposes and cleans up the data of this asset
            */
            dispose(): void;
        }
    }
}
declare namespace Animate {
    namespace Resources {
        /**
         * Each project has a list of containers. These are saved into the database and retrieved when we work with Animate. A container is
         * essentially a piece of code that executes behaviour nodes and plugin logic when activated. It acts as a 'container' for logic.
         */
        class Container extends ProjectResource<HatcheryServer.IContainer> {
            canvas: Canvas;
            /**
             * @param entry The data associated with this container resource
             */
            constructor(entry: HatcheryServer.IContainer);
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
}
declare namespace Animate {
    namespace Resources {
        /**
        * A simple array resource for referencing groups, or arrays, of other objects. Similar to arrays in Javascript.
        */
        class GroupArray extends ProjectResource<HatcheryServer.IGroup> {
            /**
            * @param entry [Optional] The database entry of the resource
            */
            constructor(entry: HatcheryServer.IGroup);
            /**
            * Adds a new reference to the group
            * @param shallowId
            */
            addReference(shallowId: number): void;
            /**
            * Removes a reference from the group
            * @param shallowId
            */
            removeReference(shallowId: number): void;
            /**
            * Disposes and cleans up the data of this asset
            */
            dispose(): void;
        }
    }
}
declare namespace Animate {
    namespace Resources {
        /**
        * A wrapper for DB file instances
        * @events deleted, refreshed
        */
        class File extends ProjectResource<HatcheryServer.IFile> {
            /**
            * @param entry The DB entry of this file
            */
            constructor(entry: HatcheryServer.IFile);
        }
    }
}
declare namespace Animate {
    namespace Resources {
        /**
        * A wrapper for DB script instances
        */
        class Script extends ProjectResource<HatcheryServer.IScript> {
            /**
            * @param entry The DB entry of this script
            */
            constructor(entry: HatcheryServer.IScript);
        }
    }
}
declare namespace Animate {
    /**
     * The base class for all editors. Editors are simple wrappers for resources that can be edited
     * by a GUI Component. The component will use functions described in this class to interact with
     * the base resource.
     */
    abstract class Editor extends EventDispatcher {
        active: boolean;
        resource: ProjectResource<HatcheryServer.IResource>;
        pastActions: Actions.EditorAction[];
        currentAction: Actions.EditorAction | null;
        futureActions: Actions.EditorAction[];
        private _actionHistoryLength;
        private _project;
        /**
         * Creates an instance of the editor
         */
        constructor(resource: ProjectResource<HatcheryServer.IResource>, project: Project);
        /**
         * Gets if this editor has actions to undo
         */
        readonly hasUndos: boolean;
        /**
         * Gets if this editor has actions to redo
         */
        readonly hasRedos: boolean;
        /**
         * Adds a new action to the editor and resets the undo history
         */
        doAction(action: Actions.EditorAction): void;
        /**
         * Undo the last history action
         */
        undo(): void;
        /**
         * Redo the last un-done action
         */
        redo(): void;
        /**
         * De-serializes the workspace from its JSON format
         * @param scene The schema scene we are loading from
         */
        abstract deserialize<T>(scene: T): any;
        /**
         * Serializes the workspace into its JSON format
         */
        abstract serialize<T>(): T;
        /**
         * Triggers a change in the tree structure
         */
        invalidate(): void;
        /**
         * Closes the editor and optionally saves the edits to the database
         * @param updateDatabase If true, the editor will provide edits that must be saved to the datavase
         */
        collapse(updateDatabase?: boolean): void;
    }
}
declare namespace Animate {
    namespace Actions {
        /**
         * The base class for all editor actions
         */
        abstract class EditorAction {
            /**
             * Undo the last history action
             */
            abstract undo(editor: Animate.Editor): any;
            /**
             * Redo the next action
             */
            abstract redo(editor: Animate.Editor): any;
        }
    }
}
declare namespace Animate {
    namespace Actions {
        /**
         * An action for the creation of behaviours within a container
         */
        class BehaviourCreated extends EditorAction {
            definition: BehaviourDefinition;
            instance: Behaviour | null;
            options: IBehaviour;
            resource: ProjectResource<HatcheryServer.IResource> | null;
            constructor(definition: BehaviourDefinition, options: IBehaviour, resource?: ProjectResource<HatcheryServer.IResource>);
            /**
             * Undo the last history action
             */
            undo(editor: Animate.ContainerSchema): void;
            /**
             * Redo the next action
             */
            redo(editor: Animate.ContainerSchema): void;
        }
    }
}
declare namespace Animate {
    namespace Actions {
        /**
         * An action for the creation of links within a container
         */
        class LinkCreated extends EditorAction {
            instance: Link | null;
            options: ILinkItem;
            constructor(options: ILinkItem);
            /**
             * Undo the last history action
             */
            undo(editor: Animate.ContainerSchema): void;
            /**
             * Redo the next action
             */
            redo(editor: Animate.ContainerSchema): void;
        }
    }
}
declare namespace Animate {
    namespace Actions {
        /**
         * An action for the creation of portals
         */
        class PortalCreated extends EditorAction {
            target: Behaviour | null;
            instance: BehaviourPortal;
            portal: Portal;
            left: number;
            top: number;
            constructor(portal: Portal, target: Behaviour | null, left: number, top: number);
            /**
             * Undo the last history action
             */
            undo(editor: Animate.ContainerSchema): void;
            /**
             * Redo the next action
             */
            redo(editor: Animate.ContainerSchema): void;
        }
    }
}
declare namespace Animate {
    namespace Actions {
        /**
         * An action for removing behaviours from a container
         */
        class BehavioursRemoved extends EditorAction {
            instances: CanvasItem[];
            clones: CanvasItem[];
            constructor(instances: CanvasItem[]);
            /**
             * Undo the last history action
             */
            undo(editor: Animate.ContainerSchema): void;
            /**
             * Redo the next action
             */
            redo(editor: Animate.ContainerSchema): void;
        }
    }
}
declare namespace Animate {
    namespace Actions {
        /**
         * An action for when the selection changes on a container schema
         */
        class SelectionChanged extends EditorAction {
            selectionIds: number[];
            previousSelection: number[];
            constructor(selectionIds: number[]);
            /**
             * Undo the last history action
             */
            undo(editor: Animate.ContainerSchema): void;
            /**
             * Redo the next action
             */
            redo(editor: Animate.ContainerSchema): void;
        }
    }
}
declare namespace Animate {
    namespace Actions {
        /**
         * An action for when a selection is moved in a container schema
         */
        class SelectionMoved extends EditorAction {
            positions: {
                index: number;
                x: number;
                y: number;
            }[];
            previousPositions: {
                index: number;
                x: number;
                y: number;
            }[];
            constructor(positions: {
                index: number;
                x: number;
                y: number;
            }[]);
            /**
             * Undo the last history action
             */
            undo(editor: Animate.ContainerSchema): void;
            /**
             * Redo the next action
             */
            redo(editor: Animate.ContainerSchema): void;
        }
    }
}
declare namespace Animate {
    namespace Actions {
        /**
         * An action for the creation of a user comment in a container schema
         */
        class CommentCreated extends EditorAction {
            instance: Comment;
            left: number;
            top: number;
            constructor(left: number, top: number);
            /**
             * Undo the last history action
             */
            undo(editor: Animate.ContainerSchema): void;
            /**
             * Redo the next action
             */
            redo(editor: Animate.ContainerSchema): void;
        }
    }
}
declare namespace Animate {
    namespace Actions {
        /**
         * An action for when comments are resized in a container schema
         */
        class CommentResized extends EditorAction {
            index: number;
            width: number;
            height: number;
            prevWidth: number;
            prevHeight: number;
            constructor(index: number, width: number, height: number);
            /**
             * Undo the last history action
             */
            undo(editor: Animate.ContainerSchema): void;
            /**
             * Redo the next action
             */
            redo(editor: Animate.ContainerSchema): void;
        }
    }
}
declare namespace Animate {
    namespace Actions {
        /**
         * An action for when comment text is editted
         */
        class CommentEditted extends EditorAction {
            index: number;
            prevLabel: string;
            label: string;
            constructor(index: number, label: string);
            /**
             * Undo the last history action
             */
            undo(editor: Animate.ContainerSchema): void;
            /**
             * Redo the next action
             */
            redo(editor: Animate.ContainerSchema): void;
        }
    }
}
declare namespace Animate {
    /**
     * An editor that represents the data of a container's inner behaviours and their relationships with eachother.
     * This editor is visualised through a schema component.
     */
    class ContainerSchema extends Editor {
        opened: boolean;
        protected _activeLink: Link | null;
        protected _items: CanvasItem[];
        protected _selection: CanvasItem[];
        /**
         * Creates an instance of the canvas store
         */
        constructor(container: Resources.Container, project: Project);
        /**
         * Begins the process of creating a link between behaviours.
         * This should be followed by a call to endLinkRouting when
         * the process is completed
         */
        beginLinkRouting(portal: IPortal, pos: Point): void;
        /**
         * Completes the process of linking two behaviours together
         */
        endLinkRouting(options: ILinkItem | null): void;
        readonly activeLink: Link | null;
        /**
         * Returns all items of this store
         */
        getItems(): CanvasItem[];
        /**
         * Returns the currrently selected items
         */
        getSelection(): CanvasItem[];
        /**
         * Called whenever an item is clicked.
         */
        onNodeSelected(item: ICanvasItem | null, shiftDown: boolean, toggleSelectedState?: boolean): void;
        /**
         * Whenever we receive a context event on an item
         */
        onContext(item: ICanvasItem, e: React.MouseEvent): void;
        /**
         * Adds a canvas item to the canvas
         * @param item The item to add
         */
        addItem(item: CanvasItem): CanvasItem;
        /**
         * Removes a canvas item from the canvas
         * @param item The item to remove
         */
        removeItem(item: CanvasItem): void;
        /**
         * De-serializes the workspace from its JSON format
         * @param scene The schema scene we are loading from
         */
        deserialize(scene: HatcheryServer.IContainerWorkspace): void;
        /**
         * Serializes the workspace into its JSON format
         */
        serialize(): HatcheryServer.IContainerWorkspace;
    }
}
declare namespace Animate {
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
        width: number;
        height: number;
        store: ContainerSchema | null;
        id: number;
        selected: boolean;
        /**
         * Creates an instance
         */
        constructor();
        /**
         * Clones the canvas item
         */
        clone(clone?: CanvasItem): CanvasItem;
        /**
         * Called when we activate the context menu on the behaviour
         */
        onContext(e: React.MouseEvent): void;
        /**
         * Serializes the data into a JSON.
         */
        serialize(id: number): ICanvasItem;
        /**
         * De-serialize data from a JSON.
         * @param data The data to import from
         */
        deSerialize(data: ICanvasItem): void;
        /**
         * Called after de-tokenization. This is so that the items can link up to any other items that might have been created in the process.
         * @param originalId The original shallow ID of the item when it was tokenized.
         * @param items The items loaded from the detokenization process. To get this item you can do the following: items[originalId].item
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
declare namespace Animate {
    /**
     * Behaviours are the model data of BehaviourComponents and represent a behaviour/set of functionality
     * that has been added to a container.
     */
    class Behaviour extends CanvasItem {
        alias: string;
        canGhost: boolean;
        behaviourType: string;
        parameters: Portal[];
        products: Portal[];
        outputs: Portal[];
        inputs: Portal[];
        portals: Portal[];
        properties: EditableSet;
        template: BehaviourDefinition;
        /**
         * Creates an instance of the behaviour
         */
        constructor(template: BehaviourDefinition);
        move(x: number, y: number): void;
        calculateSize(): void;
        /**
         * Clones the canvas item
         */
        clone(clone?: Behaviour): Behaviour;
        /**
         * Gets a portal by its name
         * @param name The portal name
         */
        getPortal(name: string): Portal | null;
        /**
         * Adds a portal to this behaviour.
         * @param type The type of portal we are adding. It can be either 'input', 'output', 'parameter' & 'product'
         * @param property
         */
        addPortal(type: HatcheryRuntime.PortalType, property: Prop<any>): Portal;
        /**
        * Removes a portal from this behaviour
        * @param toRemove The portal object we are removing
        */
        removePortal(toRemove: Portal): Portal;
        /**
         * Serializes the data into a JSON.
         */
        serialize(id: number): IBehaviour;
        /**
         * De-Serializes data from a JSON.
         * @param data The data to import from
         */
        deSerialize(data: IBehaviour): void;
        /**
         * Diposes and cleans up this component and its portals
         */
        dispose(): void;
    }
}
declare namespace Animate {
    /**
     * A behaviour for representing container portals
     */
    class BehaviourPortal extends Behaviour {
        portalType: HatcheryRuntime.PortalType;
        private _property;
        /**
         * Creates an instance
         */
        constructor(property: Prop<any>, portalType: HatcheryRuntime.PortalType);
        /**
         * Clones the canvas item
         */
        clone(clone?: BehaviourPortal): BehaviourPortal;
        /**
         * Serializes the data into a JSON.
         */
        serialize(id: number): IBehaviourPortal;
        /**
         * De-Serializes data from a JSON.
         * @param data The data to import from
         */
        deSerialize(data: IBehaviourPortal): void;
        /**
         * This will cleanup the component.
         */
        dispose(): void;
        readonly property: Prop<any>;
    }
}
declare namespace Animate {
    /**
     * A behaviour that contains an asset/resource reference
     */
    class BehaviourAsset extends Behaviour {
        asset: ProjectResource<HatcheryServer.IResource> | null;
        /**
         * Creates an instance of the behaviour
         */
        constructor(asset: ProjectResource<HatcheryServer.IResource> | null);
        /**
         * Clones the canvas item
         */
        clone(clone?: BehaviourAsset): BehaviourAsset;
        /**
         * Clean up
         */
        dispose(): void;
        /**
         * Serializes the data into a JSON.
         */
        serialize(id: number): IBehaviour;
        /**
         * Adds a portal to this behaviour.
         * @param type The type of portal we are adding. It can be either 'input', 'output', 'parameter' & 'product'
         * @param property
         */
        addPortal(type: HatcheryRuntime.PortalType, property: Prop<any>): Portal;
    }
}
declare namespace Animate {
    /**
     * A user comment within the workspace
     */
    class Comment extends CanvasItem {
        label: string;
        width: number;
        height: number;
        /**
         * Creates an instance
         */
        constructor(label?: string);
        /**
         * Clones the canvas item
         */
        clone(clone?: Comment): Comment;
        /**
         * Serializes the data into a JSON.
         */
        serialize(id: number): IComment;
        /**
         * De-Serializes data from a JSON.
         * @param data The data to import from
         */
        deSerialize(data: IComment): void;
    }
}
declare namespace Animate {
    /**
    * A portal class for behaviours. There are 4 different types of portals -
    * INPUT, OUTPUT, PARAMETER and PRODUCT. Each portal acts as a gate for a behaviour.
    */
    class Portal extends EventDispatcher {
        links: Link[];
        custom: boolean;
        type: HatcheryRuntime.PortalType;
        property: Prop<any>;
        behaviour: Behaviour | null;
        top: number;
        left: number;
        size: number;
        /**
        * @param parent The parent component of the Portal
        * @param type The portal type. This can be either Portal.INPUT, Portal.OUTPUT, Portal.PARAMETER or Portal.PRODUCT
        * @param property The property associated with this portal
        */
        constructor(parent: Behaviour | null, type: HatcheryRuntime.PortalType, property: Prop<any>);
        calculatePosition(index: number): void;
        /**
         * Clones the canvas item
         */
        clone(): Portal;
        serialize(): IPortal;
        /**
        * Edits the portal variables
        * @param property The new value of the property
        */
        edit(property: Prop<any>): void;
        /**
         * This function will check if the source portal is an acceptable match with the current portal.
         * @param source The source panel we are checking against
         */
        checkPortalLink(source: Portal): boolean;
        /**
         * Clean up
         */
        dispose(): void;
        /**
         * Adds a link to the portal.
         * @param link The link we are adding
         */
        addLink(link: any): void;
        /**
         * Removes a link from the portal.
         * @param link The link we are removing
         */
        removeLink(link: any): any;
    }
}
declare namespace Animate {
    /**
     * Links connect 2 behaviours to one another. Each link is connected by a start and end portal on both the origin
     * and destination behaviours. Links are drawn on the schema as an SVG line.
     */
    class Link extends CanvasItem {
        startPortal: string;
        endPortal: string;
        width: number;
        height: number;
        selected: boolean;
        startBehaviour: number;
        endBehaviour: number;
        points: Point[];
        private _properties;
        /**
         * Creates a new instance of a link
         */
        constructor();
        /**
         * Serializes the data into a JSON.
         */
        serialize(id: number): ILinkItem;
        /**
         * De-Serializes data from a JSON.
         * @param data The data to import from
         */
        deSerialize(data: ILinkItem): void;
        calculateDimensions(): void;
        /**
        * Gets the properties of this link
        * @returns {EditableSet}
        */
        readonly properties: EditableSet;
        /**
        * Cleanup the link
        */
        dispose(): void;
    }
}
declare namespace Animate {
    class CanvasEvents extends ENUM {
        constructor(v: string);
        static MODIFIED: CanvasEvents;
    }
    /**
    * The canvas is used to create diagrammatic representations of behaviours and how they interact in the scene.
    */
    class Canvas {
        static lastSelectedItem: null;
        static snapping: boolean;
        name: string;
        private _container;
        private _containerReferences;
        /**
        * @param {Component} parent The parent component to add this canvas to
        * @param {Container} cntainer Each canvas represents a behaviour.This container is the representation of the canvas as a behaviour.
        */
        constructor(parent: Component, container: Resources.Container);
        readonly container: Resources.Container;
        readonly containerReferences: {
            groups: Array<number>;
            assets: Array<number>;
        };
    }
}
declare namespace Animate {
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
        * @param plugin The plugin who created this template
        */
        constructor(plugin: any);
        /**
        * Adds a class to this template
        * @param name The name of the class
        * @param img The optional image
        * @param abstractClass A boolean to define if this class is abstract or not
        */
        addClass(name: string, img: string, abstractClass: boolean): AssetClass;
        /**
        * Removes a class by name
        * @param name The name of the class to remove
        */
        removeClass(name: string): void;
        /**
        * Finds a class by its name. Returns null if nothing is found
        */
        findClass(name: string): AssetClass | null;
    }
}
declare namespace Animate {
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
        * @param  behaviourName The name of the behaviour
        * @param portalTemplates
        * @param plugin The plugin this is associated with
        * @param canBuildInput
        * @param canBuildOutput
        * @param canBuildParameter
        * @param canBuildProduct
        */
        constructor(behaviourName: string, portalTemplates: Array<PortalTemplate>, plugin: IPlugin | null, canBuildInput?: boolean, canBuildOutput?: boolean, canBuildParameter?: boolean, canBuildProduct?: boolean);
        dispose(): void;
        canBuildOutput(behaviour: Behaviour): boolean;
        canBuildInput(behaviour: Behaviour): boolean;
        canBuildProduct(behaviour: Behaviour): boolean;
        canBuildParameter(behaviour: Behaviour): boolean;
        portalsTemplates(): Array<PortalTemplate>;
        readonly behaviourName: string;
        readonly plugin: IPlugin;
    }
}
declare namespace Animate {
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
declare namespace Animate {
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
        onError(): void;
        /**
        * Called when we get an ajax response.
        * @param {any} data
        * @param {any} textStatus
        * @param {any} jqXHR
        */
        onData(): void;
        /**
        * Cleans up the object
        */
        dispose(): void;
    }
}
declare namespace Animate {
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
        onError(): void;
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
declare namespace Animate {
    /**
    * A simple class to define portal behaviour.
    */
    class PortalTemplate {
        type: HatcheryRuntime.PortalType;
        property: Prop<any>;
        /**
        * @param property The property associated with this portal
        * @param type The type of portal this represents
        */
        constructor(property: Prop<any>, type: HatcheryRuntime.PortalType);
    }
}
declare namespace Animate {
    /**
    * A wrapper for project builds
    */
    class Build {
        entry: HatcheryServer.IBuild;
        /**
        * Creates an intance of the build
        * @param entry The entry token from the DB
        */
        constructor(entry: HatcheryServer.IBuild);
        /**
        * Attempts to update the build with new data
        * @param token The update token data
        */
        update(token: HatcheryServer.IBuild): Promise<boolean>;
    }
}
declare namespace Animate {
    /**
     * A project is the logical container of all resources and functions related
     * to a user's hatchery editor project.
     */
    class Project extends EventDispatcher {
        openEditors: Editor[];
        activeEditor: Editor | null;
        curBuild: Build;
        private _restPaths;
        private _entry;
        /**
         * @param id The database id of this project
         */
        constructor();
        activateEditor(editor: Editor): void;
        /**
         * Gets the DB entry associated with this project
         */
        /**
         * Sets the DB entry associated with this project
         */
        entry: HatcheryServer.IProject;
        /**
         * Gets a resource by its ID
         * @param id The ID of the resource
         * @returns The resource whose id matches the id parameter or null
         */
        getResourceByID<T extends ProjectResource<HatcheryServer.IResource>>(id: string, type?: ResourceType): {
            resource: T;
            type: ResourceType;
        } | null;
        /**
         * Gets a resource by its shallow ID
         * @param id The shallow ID of the resource
         * @returns The resource whose shallow id matches the id parameter or null
         */
        getResourceByShallowID<T extends ProjectResource<HatcheryServer.IResource>>(id: number, type?: ResourceType): T | null;
        /**
         * Attempts to update the project details base on the token provided
         * @returns The project token
         */
        updateDetails(token: HatcheryServer.IProject): Promise<UsersInterface.IResponse>;
        /**
         * Loads a previously selected build, or creates one if none are selected
         */
        loadBuild(): Promise<Build>;
        /**
         * Internal function to create a resource wrapper
         * @param entry The database entry
         * @param type The type of resource to create
         */
        private createResourceInstance<T>(entry, type?);
        /**
         * This function is used to fetch the project resources associated with a project.
         * @param type [Optional] You can specify to load only a subset of the resources (Useful for updating if someone else is editing)
         */
        loadResources(type?: ResourceType): Promise<Array<ProjectResource<HatcheryServer.IResource>>>;
        /**
         * This function is used to fetch a project resource by Id
         * @param id the Id of the resource to update
         * @param type You can specify to load only a subset of the resources (Useful for updating if someone else is editing)
         */
        refreshResource<T extends ProjectResource<HatcheryServer.IResource>>(id: string, type?: ResourceType): Promise<T | Error>;
        /**
         * Use this to edit the properties of a resource
         * @param id The id of the object we are editing.
         * @param data The new data for the resource
         */
        editResource<T>(id: string, data: T): Promise<Modepress.IResponse | Error>;
        /**
         * Use this to save the properties of a resource
         * @param id The id of the object we are saving.
         * @param type [Optional] The type of resource we are saving
         */
        saveResource(id: string, type?: ResourceType): Promise<boolean>;
        /**
         * Use this to edit the properties of a resource
         * @param type The type of resource we are saving
         */
        saveResources(type: ResourceType): Promise<boolean>;
        /**
         * Use this to delete a resource by its Id
         * @param id The id of the object we are deleting
         * @param type The type of resource we are renaming
         */
        deleteResource(id: string, type: ResourceType): Promise<boolean | Error>;
        /**
         * Copies an existing resource and assigns a new ID to the cloned item
         * @param id The id of the resource we are cloning from
         * @param type [Optional] The type of resource to clone
         */
        copyResource<T extends HatcheryServer.IResource>(id: string, type: ResourceType): Promise<ProjectResource<T>>;
        /**
         * Deletes several resources in 1 function call
         * @param ids The ids An array of resource Ids
         */
        deleteResources(ids: Array<string>): Promise<boolean>;
        /**
         * This function is used to all project resources
         */
        saveAll(): Promise<boolean>;
        /**
         * Creates a new project resource.
         * @param type The type of resource we are renaming
         */
        createResource<T extends HatcheryServer.IResource>(type: ResourceType, data: T): Promise<ProjectResource<T>>;
        /**
         * This function is used to assign a new editor to a project resource. Editors are used by
         * GUI components to interact with the resource the editor wraps.
         * @param resource The resource we are creating an editor for
         */
        assignEditor(resource: ProjectResource<HatcheryServer.IResource>): Editor | null;
        /**
         * Gets an editor by its resource
         */
        getEditorByResource(resource: ProjectResource<HatcheryServer.IResource>): Editor | null;
        /**
         * Removes an editor from the active editor array
         */
        removeEditor(editor: Editor): void;
        /**
         * Triggers a change event
         */
        invalidate(): void;
        readonly containers: Resources.Container[];
        readonly files: Resources.File[];
        readonly scripts: Resources.Script[];
        readonly assets: Resources.Asset[];
        readonly groups: Resources.GroupArray[];
        /**
         * This will cleanup the project and remove all data associated with it.
         */
        reset(): void;
        readonly plugins: Array<HatcheryServer.IPlugin>;
    }
}
declare namespace Animate {
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
declare namespace Animate {
    /**
    * This class is used to represent the user who is logged into Animate.
    */
    class User extends EventDispatcher {
        private static _singleton;
        entry: UsersInterface.IUserEntry;
        meta: HatcheryServer.IUserMeta | null;
        project: Project;
        private _isLoggedIn;
        constructor();
        /**
        * Resets the meta data
        */
        resetMeta(): void;
        /**
        * Creates a new user projects
        * @param name The name of the project
        * @param plugins An array of plugin IDs to identify which plugins to use
        * @param description [Optional] A short description
        */
        newProject(name: string, plugins: Array<string>, description?: string): Promise<ModepressAddons.ICreateProject>;
        /**
        * Attempts to update the user's details base on the token provided
        * @returns The user details token
        */
        updateDetails(token: HatcheryServer.IUserMeta): Promise<UsersInterface.IResponse>;
        /**
        * Use this function to duplicate a project
        * @param id The project ID we are copying
        */
        copyProject(id: string): void;
        /**
        * This function is used to open an existing project.
        */
        openProject(id: string): void;
        /**
        * This will delete a project from the database as well as remove it from the user.
        * @param id The id of the project we are removing.
        */
        deleteProject(id: string): void;
        readonly isLoggedIn: boolean;
        /**
        * Gets the singleton instance.
        */
        static readonly get: User;
    }
}
declare namespace Animate {
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
        private _reConnect();
        /**
         * Called whenever we get a message from the users socket API
         */
        onMessage(e: MessageEvent): void;
        /**
         * Called whenever an error occurs
         */
        onError(): void;
        /**
         * Attempts to connect to the user's socket api
         */
        connect(): void;
        /**
         * Gets the singleton
         */
        static readonly get: SocketManager;
    }
}
declare namespace Animate {
    class ImageVisualizer implements IPreviewFactory {
        private _maxPreviewSize;
        constructor();
        /**
         * Creates a thumbnail preview of the file
         * @param file
         */
        thumbnail(file: HatcheryServer.IFile): Promise<HTMLCanvasElement> | null;
        /**
         * This function generates a React Element that is used to preview a file
         * @param file The file we are looking to preview
         * @returns If a React Element is returned is added in the File viewer preview
         */
        generate(file: HatcheryServer.IFile): JSX.Element | null;
    }
}
declare namespace Animate {
    type ProgressCallback = (percent: number) => void;
    type CompleteCallback = (err?: Error | null, files?: Array<UsersInterface.IUploadToken> | null) => void;
    class FileUploader {
        private _dCount;
        private _downloads;
        percent: number;
        private _onProg;
        private _onComplete;
        constructor(onComp?: CompleteCallback, onProg?: ProgressCallback);
        readonly numDownloads: number;
        uploadFile(files: File[], meta?: any, parentFile?: string): void;
        upload2DElement(img: HTMLImageElement | HTMLCanvasElement, name: string, meta?: HatcheryServer.IFileMeta, parentFile?: string): void;
        uploadArrayBuffer(array: ArrayBuffer, name: string, meta?: any, parentFile?: string): void;
        uploadTextAsFile(text: string, name: string, meta?: any, parentFile?: string): void;
        upload(form: FormData, url: string | null, parentFile?: string): void;
    }
}
declare namespace Animate {
    /**
    * Defines a set of variables. The set is typically owned by an object that can be edited by users. The set can be passed to editors like the
    * PropertyGrid to expose the variables to the user.
    */
    class EditableSet {
        private _variables;
        parent: EventDispatcher | null;
        /**
        * Creates an instance
        * @param {EventDispatcher} parent The owner of this set. Can be null. If not null, the parent will receive events when the properties are edited.
        */
        constructor(parent: EventDispatcher | null);
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
        getVar<T>(name: string): Prop<T> | null;
        /**
        * Removes a variable
        * @param {string} prop
        */
        removeVar(name: string): void;
        /**
         * Broadcasts an 'edited' event to the owner of the set
         */
        notifyEdit(): void;
        /**
        * Updates a variable with a new value
        * @returns {T}
        */
        updateValue<T>(name: string, value: T): T | null;
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
        readonly variables: Array<Prop<any>>;
    }
}
declare namespace Animate {
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
        clone(): Prop<T>;
        /**
        * Attempts to fetch the value of this property
        * @returns {T}
        */
        getVal(): T | null;
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
        clone(): PropBool;
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
        clone(): PropText;
    }
}
declare namespace Animate {
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
        clone(): PropEnum;
        /**
       * De-Tokenizes data from a JSON.
       * @param {any} data The data to import from
       */
        deTokenize(data: PropEnum): void;
    }
}
declare namespace Animate {
    /**
    * Defines a property variable. These are variables wrapped in sugar code to help sanitize and differentiate different pieces of data
    */
    class PropFileResource extends Prop<Resources.File | null> {
        extensions: Array<string> | null;
        /**
        * Creates a new instance
        * @param {string} name The name of the property
        * @param {string} value The value of the property
        * @param {number} extensions The valid extends to use eg: ['bmp', 'jpeg']
        * @param {string} category [Optional] An optional category to describe this property's function
        * @param {any} options [Optional] Any optional data to be associated with the property
        */
        constructor(name: string, value: Resources.File | null, extensions: Array<string> | null, category?: string, options?: any);
        /**
        * Attempts to clone the property
        * @returns {PropFileResource}
        */
        clone(): PropFileResource;
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
declare namespace Animate {
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
        clone(): PropNum;
    }
}
declare namespace Animate {
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
        clone(): PropObject;
    }
}
declare namespace Animate {
    /**
    * Defines a property variable. These are variables wrapped in sugar code to help sanitize and differentiate different pieces of data
    */
    class PropAsset extends Prop<ProjectResource<HatcheryServer.IResource> | null> {
        classNames: Array<string>;
        /**
        * Creates a new instance
        * @param {string} name The name of the property
        * @param {number} value The value of the property
        * @param {Array<string>} classNames An array of class names we can pick this resource from
        * @param {string} category [Optional] An optional category to describe this property's function
        * @param {any} options Any optional data to be associated with the property
        */
        constructor(name: string, value: ProjectResource<HatcheryServer.IResource> | null, classNames?: Array<string>, category?: string, options?: any);
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
        clone(): PropAsset;
    }
}
declare namespace Animate {
    /**
    * Defines a property variable. These are variables wrapped in sugar code to help sanitize and differentiate different pieces of data
    */
    class PropGroup extends Prop<Resources.GroupArray | null> {
        /**
        * Creates a new instance
        * @param {string} name The name of the property
        * @param {GroupArray} value The value of the property
        * @param {string} category [Optional] An optional category to describe this property's function
        * @param {any} options Any optional data to be associated with the property
        */
        constructor(name: string, value: Resources.GroupArray | null, category?: string, options?: any);
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
        clone(): PropGroup;
    }
}
declare namespace Animate {
    /**
    * Defines a property variable. These are variables wrapped in sugar code to help sanitize and differentiate different pieces of data
    */
    class PropAssetList extends Prop<Array<ProjectResource<HatcheryServer.IResource>> | null> {
        classNames: Array<string>;
        /**
        * Creates a new instance
        * @param {string} name The name of the property
        * @param {Array<ProjectResource<Engine.IResource>>} value An array of project resources
        * @param {Array<string>} classNames An array of class names we can pick this resource from
        * @param {string} category [Optional] An optional category to describe this property's function
        * @param {any} options Any optional data to be associated with the property
        */
        constructor(name: string, value: Array<ProjectResource<HatcheryServer.IResource>> | null, classNames: Array<string>, category?: string, options?: any);
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
        clone(): PropAssetList;
    }
}
declare namespace Animate {
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
        clone(): PropColor;
        /**
        * De-Tokenizes data from a JSON.
        * @param {any} data The data to import from
        */
        deTokenize(data: Color): void;
    }
}
declare namespace Animate {
    interface IDraggableProps {
        enabled?: boolean;
        x: number;
        y: number;
        onMove?: (x: number, y: number) => void;
        onDragComplete?: (start: Point, end: Point) => void;
    }
    class Draggable extends React.Component<IDraggableProps, any> {
        static defaultProps: IDraggableProps;
        private _upProxy;
        private _moveProxy;
        private _mouseDelta;
        private _startPos;
        private _scrollInterval;
        constructor(props: IDraggableProps);
        /**
         * When unmounting, we remove any listeners
         */
        componentWillUnmount(): void;
        /**
         * When the mouse is down on the behaviour, we add the drag listeners
         */
        onMouseDown(e: React.MouseEvent): void;
        /**
         * When the mouse is up we remove the events
         */
        onMouseUp(e: React.MouseEvent): void;
        private getPosition(e);
        /**
         * When the mouses moves we drag the behaviour
         */
        onMouseMove(e: React.MouseEvent): void;
        /**
         * Creates the component elements
         */
        render(): JSX.Element;
    }
}
declare namespace Animate {
    interface IResizableProps {
        enabled?: boolean;
        target?: HTMLElement;
        onDragStart?(e: React.MouseEvent): boolean;
        onResized?(size: {
            width: number;
            height: number;
        }): void;
        className?: string;
    }
    /**
     * A wrapper Component that adds handles to allow for resizing of its first child component.
     */
    class Resizable extends React.Component<IResizableProps, any> {
        static defaultProps: IResizableProps;
        private _upProxy;
        private _moveProxy;
        private _allowMouseX;
        private _allowMouseY;
        private _originRect;
        private _ghost;
        /**
         * Creates an instance of the resizer
         */
        constructor(props: IResizableProps);
        /**
         * When unmounting, we remove any listeners that may still remain
         */
        componentWillUnmount(): void;
        /**
         * When the mouse is down on the component, we add the move and up listeners
         */
        onMouseDown(e: React.MouseEvent, allowMouseX: boolean, allowMouseY: boolean): void;
        /**
         * When the mouse is up we remove the events
         */
        onMouseUp(e: React.MouseEvent): void;
        /**
         * When the mouses moves we resize the component
         */
        onMouseMove(e: React.MouseEvent): void;
        /**
         * Creates the component elements
         */
        render(): JSX.Element;
    }
}
declare namespace Animate {
    /**
    * The base class for all visual elements in the application. The {Component} class
    * contains a reference of a jQuery object that points to the {Component}'s DOM representation.
    */
    class Component extends EventDispatcher {
        static idCounter: number;
        private _element;
        private _children;
        private _layouts;
        private _id;
        private _parent;
        private _tooltip;
        private _enabled;
        tag: any;
        savedID: string | null;
        constructor(html: string | JQuery, parent?: Component | null);
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
        addLayout(layout: any): any;
        /**
        * Removes a layout from this {Component}
        * @param {ILayout} layout The layout to remove
        * @returns {ILayout} The layout that was removed
        */
        removeLayout(layout: any): any;
        /**
        * Gets the ILayouts for this component
        * {returns} Array<ILayout>
        */
        readonly layouts: Array<any> | null;
        /**
        * Use this function to add a child to this component.
        * This has the same effect of adding some HTML as a child of another piece of HTML.
        * It uses the jQuery append function to achieve this functionality.
        * @param {string | Component | JQuery} child The child component we want to add
        * @returns {Component} The added component
        */
        addChild(child: string | Component | JQuery): Component;
        /**
        * Checks to see if a component is a child of this one
        * @param {Component} child The {Component} to check
        * @returns {boolean} true if the component is a child
        */
        contains(child: Component): boolean;
        /**
        * Use this function to remove a child from this component.
        * It uses the {JQuery} detach function to achieve this functionality.
        * @param {Component} child The {Component} to remove from this {Component}'s children
        * @returns {Component} The {Component} we have removed
        */
        removeChild(child: Component): Component;
        /**
        * Removes all child nodes
        */
        clear(): void;
        onDelete(): void;
        /**
        * Returns the array of Child {Component}s
        * @returns {Array{Component}} An array of child {Component} objects
        */
        readonly children: Array<Component> | null;
        /**
        * Gets the jQuery wrapper
        */
        readonly element: JQuery;
        /**
        * Gets the jQuery parent
        */
        readonly parent: Component | null;
        /**
        * Gets the tooltip for this {Component}
        */
        /**
        * Sets the tooltip for this {Component}
        */
        tooltip: string | null;
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
        readonly id: string;
        /**
        * Get or Set if the component is selected. When set to true a css class of 'selected' is added to the {Component}
        */
        /**
        * Get or Set if the component is selected. When set to true a css class of 'selected' is added to the {Component}
        */
        selected: boolean;
    }
}
declare namespace Animate {
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
         */
        render(): JSX.Element;
        /**
          * This function is called when the mouse is down on the divider
          */
        onDividerMouseDown(e: React.MouseEvent): void;
        /**
         * Recalculate the ratios on mouse up
         */
        onStageMouseUp(): void;
        /**
         * This function is called when the mouse is up from the body of stage.
         */
        onStageMouseMove(e: MouseEvent): void;
        /**
         * Call this function to get the ratio of the panel. Values are from 0 to 1
         */
        /**
         * Call this function to set the ratio of the panel. Values are from 0 to 1.
         * @param val The ratio from 0 to 1 of where the divider should be
         */
        ratio: number;
    }
}
declare namespace Animate {
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
        onCloseClicked(): void;
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
        show(parent?: Component | null, x?: number, y?: number, isModal?: boolean, isPopup?: boolean): void;
        /**
        * When we click the modal window we flash the window
        * @param {object} e The jQuery event object
        */
        onModalClicked(): void;
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
        readonly content: Component;
        readonly visible: boolean;
        headerText: string;
        readonly modalBackdrop: JQuery;
        /**
        * This will cleanup the component.
        */
        dispose(): void;
    }
}
declare namespace Animate {
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
        animated?: boolean;
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
         * @param windowType The Class of Window to render.
         * @param props The properties to use for the window component
         */
        static show(windowType: React.ComponentClass<IReactWindowProps>, props?: IReactWindowProps): number;
        /**
         * Hides/Removes a window component by id
         */
        static hide(id: number): void;
        /**
         * When the user clicks the the header bar we initiate its dragging
         */
        onHeaderDown(e: React.MouseEvent): void;
        /**
         * Called when the window is resized
         */
        onResize(): void;
        /**
         * When the mouse moves and we are dragging the header bar we move the window
         */
        onMouseMove(e: MouseEvent): void;
        /**
         * When the mouse is up we remove the dragging event listeners
         */
        onMouseUp(): void;
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
        getContent(): {} | undefined;
        /**
         * Creates the component elements
         */
        render(): JSX.Element;
    }
}
declare namespace Animate {
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
         */
        render(): JSX.Element;
        /**
         * When the mouse is up we remove the dragging event listeners
         */
        private onMouseUp();
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
         * @param props The properties to use for the context menu component
         */
        static show(props: IReactContextMenuProps): number;
        /**
         * Hides/Removes a context menu component by id
         */
        static hide(id: number): void;
    }
}
declare namespace Animate {
    interface ITabProps {
        panes?: React.ReactElement<ITabPaneProps>[];
        className?: string;
    }
    interface ITabState {
        selectedIndex: number;
    }
    /**
     * A Tab Component for organising pages of content into separate labelled tabs/components
     */
    class Tab<T extends ITabProps, Y extends ITabState> extends React.Component<T, Y> {
        private _panes;
        private _disposed;
        private _waitingOnPromise;
        /**
         * Creates a new instance of the tab
         */
        constructor(props: T);
        /**
         * When the props are reset we remove all the existing panes and create the new ones
         */
        componentWillReceiveProps(nextProps: ITabProps): void;
        /**
         * Check if we need to notify the onSelect event
         */
        componentDidMount(): void;
        componentWillUnmount(): void;
        /**
         * Check if the index changes so we can notify the onSelect event
         */
        componentDidUpdate(prevProps: T, prevState: Y): void;
        /**
         * Removes a pane from from the tab
         * @param index The index of the selected tab
         * @param props props of the selected tab
         */
        private removePane(index, prop);
        /**
         * Internal function that removes the pane reference, disposes it and sets a new index
         */
        private disposePane(index, prop);
        /**
         * Creates the component elements
         */
        render(): JSX.Element;
        /**
         * When we select a tab
         * @param index The index of the selected tab
         * @param props props of the selected tab
         */
        onTabSelected(index: number, props: ITabPaneProps): void;
        /**
         * Select a panel by index
         * @param index
         */
        selectByIndex(index: number): ITabPaneProps;
        /**
         * Select a panel by its label
         * @param label
         */
        selectByLabel(label: string): ITabPaneProps;
        /**
         * Select a panel by its property object
         * @param props
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
        removeTabByLabel(label: string): void;
        /**
         * Gets a tab's' props by its label
         * @param val The label text of the tab
         * @returns The tab pair containing both the label and page {Component}s
         */
        getPaneByLabel(label: string): ITabPaneProps | null;
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
         */
        readonly panes: ITabPaneProps[];
    }
}
declare namespace Animate {
    interface ITabPaneProps {
        label: string | null;
        showCloseButton?: boolean;
        onDispose?: (paneIndex: number, prop: ITabPaneProps) => void;
        canSelect?: (paneIndex: number, prop: ITabPaneProps) => boolean | Promise<boolean>;
        canClose?: (paneIndex: number, prop: ITabPaneProps) => boolean | Promise<boolean>;
        onSelect?: (paneIndex: number) => void;
    }
    /**
     * A single page/pane/folder pane for use in a Tab
     */
    class TabPane extends React.Component<ITabPaneProps, any> {
        static defaultProps: ITabPaneProps;
        /**
         * Creates a new pane instance
         */
        constructor(props: ITabPaneProps);
        /**
         * Creates the component elements
         */
        render(): JSX.Element;
    }
}
declare namespace Animate {
    /**
    * This class is a small container class that is used by the Tab class. It creates TabPairs
    * each time a tab is created with the addTab function. This creates a TabPair object that keeps a reference to the
    * label and page as well as a few other things.
    */
    class TabPair {
        tab: Tab<any, any>;
        tabSelector: Component;
        page: Component;
        name: string;
        private _savedSpan;
        private _modified;
        constructor(selector: Component | null, page: Component | null, name: string);
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
        onRemove(data: any): void;
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
declare namespace Animate {
    interface IListItem {
        label: string;
        icon?: string;
        prefix?: JSX.Element;
    }
    interface IListProps {
        items: IListItem[] | null;
        onSelected?: (item: IListItem, index: number) => void;
        onDSelected?: (item: IListItem, index: number) => void;
        selectedIndex?: number;
        canDeselect?: boolean;
    }
    interface IListState {
        selected?: IListItem | null;
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
         */
        render(): JSX.Element;
        componentDidUpdate(prevProps: IListProps): void;
        /**
         * Called whenever a list item is selected
         */
        onItemSelected(e: React.MouseEvent, item: IListItem, index: number, doubleClick: boolean): void;
    }
}
declare namespace Animate {
    interface ISchemaProps {
        editor: ContainerSchema;
    }
    class Schema extends React.Component<ISchemaProps, {
        workspace: HatcheryServer.IContainerWorkspace;
    }> {
        constructor(props: ISchemaProps);
        componentWillReceiveProps(nextProps: ISchemaProps): void;
        /**
         * Clean up any listeners
         */
        componentWillUnmount(): void;
        /**
         * When the store changes, we update the state
         */
        invalidate(): void;
        /**
         * Called when a draggable object is dropped onto the canvas.
         * @param {React.MouseEvent} e
         * @param {IDragDropToken} json
         */
        onObjectDropped(e: React.MouseEvent, json: IDragDropToken | null): void;
        /**
        * This will create a new behaviour based on the template given
        * @param template The definition of the behaviour we're creating
        * @param pos The x and y position of where the node shoule be placed
        * @param resource Some behehaviours are wrappers for resources, these resources can optionally be provided
        */
        addBehaviour(template: BehaviourDefinition, pos: Point, resource?: ProjectResource<HatcheryServer.IResource>): void;
        createPortal(type: HatcheryRuntime.PortalType, pos: Point): void;
        /**
         * Opens the canvas context menu
         * @param {React.MouseEvent} e
         */
        onContext(e: React.MouseEvent): void;
        getPortal(target: HTMLElement): IPortal | null;
        /**
         * Creates the component elements
         * @returns {JSX.Element}
         */
        render(): JSX.Element;
    }
}
declare namespace Animate {
    interface IBehaviourComponentProps {
        editor: ContainerSchema;
        behaviour: IBehaviour;
    }
    /**
     * A visual representation of a Behaviour
     */
    class BehaviourComponent extends React.Component<IBehaviourComponentProps, any> {
        /**
         * Creates an instance of the component
         */
        constructor(props: IBehaviourComponentProps);
        onLinkStart(e: React.MouseEvent, portal: IPortal): void;
        getPortalFromTarget(target: HTMLElement): IPortal | null;
        /**
         * Creates the component elements
         */
        render(): JSX.Element;
    }
}
declare namespace Animate {
    interface ICommentComponentProps {
        comment: IComment;
        editor: ContainerSchema;
    }
    interface ICommentComponentState {
        editMode?: boolean;
        newLabel?: string;
    }
    /**
     * A visual representation of a Behaviour
     */
    class CommentComponent extends React.Component<ICommentComponentProps, ICommentComponentState> {
        private _onUp;
        private _wasDownOnInput;
        /**
         * Creates an instance of the component
         */
        constructor(props: ICommentComponentProps);
        /**
         * Remove any remaining listeners
         */
        componentWillUnmount(): void;
        /**
         * When we switch edit mode, we add/remove listeners and/or focus on the editable textarea
         */
        componentDidUpdate(prevProps: ICommentComponentProps, prevState: ICommentComponentState): void;
        /**
         * When the mouse is up, we remove the listeners and set the label
         */
        onUp(e: React.MouseEvent): void;
        /**
         * Creates the component elements
         */
        render(): JSX.Element;
    }
}
declare namespace Animate {
    interface ILinkComponentProps {
        editor: ContainerSchema;
        link: ILinkItem;
        isRouting: boolean;
        getPortal: ((target: HTMLElement) => IPortal | null) | null;
    }
    /**
     * A visual representation of a Link. Represented on a schema as an SVG line between two behaviours
     */
    class LinkComponent extends React.Component<ILinkComponentProps, any> {
        private _moveProxy;
        private _upProxy;
        /**
         * Creates an instance of the component
         */
        constructor(props: ILinkComponentProps);
        calculateRect(pos: Point): {
            left: number;
            top: number;
            height: number;
            width: number;
        };
        onMouseMove(e: MouseEvent): void;
        /**
         * Remove event listeners
         */
        onMouseUp(e: MouseEvent): void;
        /**
         * If this link is routing, we attach listeners for mouse up so we can detect when to stop routing
         */
        componentDidMount(): void;
        /**
         * Creates the component elements
         */
        render(): JSX.Element;
    }
}
declare namespace Animate {
    interface IPortalComponentProps {
        portal: IPortal;
        onPortalDown?: (e: React.MouseEvent) => void;
    }
    /**
     * A visual representation of a Behaviour's portal
     */
    class PortalComponent extends React.Component<IPortalComponentProps, any> {
        /**
         * Creates an instance of the component
         */
        constructor(props: IPortalComponentProps);
        /**
         * Creates the component elements
         */
        render(): JSX.Element;
    }
}
declare namespace Animate {
    interface ITreeViewProps {
        nodeStore?: TreeNodeStore;
    }
    interface ITreeViewState {
        nodes?: TreeNodeModel[];
        focussedNode?: TreeNodeModel | null;
    }
    /**
     * A component visually represents a TreeNodeStore and its nodes
     */
    class TreeView<T extends ITreeViewProps> extends React.Component<T, ITreeViewState> {
        private _isMounted;
        /**
         * Creates a new instance of the treenode
         */
        constructor(props: T);
        /**
         * Called whenever a node is focussed
         */
        onFocusNodeChange(type: TreeviewEvents, e: INodeEvent): void;
        /**
         * Called whenever we need to re-create the prop tree. Usually after the structure of the nodes has changed
         */
        onChange(type: TreeviewEvents): void;
        /**
         * When the component is updated, we check for any focussed nodes so we can scroll to them
         */
        componentDidUpdate(): void;
        /**
         * Make sure that any new node store has the appropriate event handlers
         */
        componentWillReceiveProps(nextProps: ITreeViewProps): void;
        /**
         * Set the mounted variable so we dont get warnings
         */
        componentDidMount(): void;
        /**
         * Cleans up the component
         */
        componentWillUnmount(): void;
        /**
         * Creates the component elements
         */
        render(): JSX.Element;
    }
}
declare namespace Animate {
    interface ITreeNodeProps {
        node: TreeNodeModel;
    }
    /**
     * This visual representation of a TreeNodeModel
     */
    class TreeNode extends React.Component<ITreeNodeProps, any> {
        /**
         * Creates an instance
         */
        constructor(props: ITreeNodeProps);
        /**
         * Creates the component elements
         */
        render(): JSX.Element;
    }
}
declare namespace Animate {
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
         * @param node
         */
        addNode(node: TreeNodeModel): TreeNodeModel;
        /**
         * Removes a child node
         * @param node
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
         * @param selection
         */
        onSelectionChange(selection: TreeNodeModel[]): void;
        /**
         * Called whenever a node is selectable and clicked.
         * @param node
         * @param shiftDown
         */
        onNodeSelected(node: TreeNodeModel | null, shiftDown: boolean, toggleSelectedState?: boolean): void;
        /**
         * Sets the store of the node and all its children to be this store
         */
        setStore(node: TreeNodeModel): void;
        private unFocus(node);
        /**
         * Called whenever the node receives a context event
         * @param e
         * @param node
         */
        onContext(e: React.MouseEvent, node: TreeNodeModel): void;
        /**
         * This will recursively look through each of the nodes to find a node with
         * the specified name.
         * @param property The name property we are evaluating
         * @param value The object we should be comparing against
         */
        findNode(property: string, value: any): TreeNodeModel | null;
        /**
         * Selects a node manually. This will also bring the focus into node
         */
        selectNode(node: TreeNodeModel): void;
        /**
         * Gets the nodes associated with this store
         */
        getNodes(): TreeNodeModel[];
        /**
         * Gets the currently selected nodes
         */
        getSelectedNodes(): TreeNodeModel[];
    }
}
declare namespace Animate {
    class TreeNodeModel {
        private _icon;
        private _label;
        private _selected;
        private _expanded;
        private _disabled;
        private _selectable;
        children: TreeNodeModel[];
        protected _parent: TreeNodeModel | null;
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
         * @returns
         */
        readonly parent: TreeNodeModel | null;
        /**
         * Gets or sets the label of the node
         * @param val
         */
        label(val?: string): string;
        /**
         * Called whenever we start dragging. This is only called if canDrag is true.
         * Use it to set drag data, eg: e.dataTransfer.setData("text", 'some data');
         * @param e
         * @returns Return data to serialize
         */
        onDragStart(e: React.DragEvent): IDragDropToken | null;
        /**
         * Called whenever we drop an item on this element. This is only called if canDrop is true.
         * Use it to set drag data, eg: e.dataTransfer.getData("text");
         * @param e
         * @param json The unserialized data
         */
        onDragDrop(e: React.DragEvent, json: IDragDropToken | null): void;
        /**
         * Gets or sets if the node is selected
         * @param val
         */
        selected(val?: boolean): boolean;
        /**
         * Gets or sets if the node is disabled
         * @param val
         */
        disabled(val?: boolean): boolean;
        /**
         * Gets or sets if the node is selectable
         * @param val
         */
        selectable(val?: boolean): boolean;
        /**
         * Gets or sets if the node is expanded
         * @param val
         */
        expanded(val?: boolean): boolean;
        /**
         * Gets or sets the icon of the node
         * @param val
         */
        icon(val?: JSX.Element): JSX.Element | undefined;
        /**
         * Attempts to trigger a change event on the store
         */
        protected invalidate(): void;
        /**
         * Adds a child node
         * @param node
         */
        addNode(node: TreeNodeModel): TreeNodeModel;
        /**
         * Removes a child node
         * @param node
         */
        removeNode(node: TreeNodeModel): void;
        /**
         * Called whenever the node receives a context event
         * @param e
         */
        onContext(e: React.MouseEvent): void;
        /**
         * Called whenever the node is double clicked
         */
        onDoubleClick(e: React.MouseEvent): void;
        /**
         * This will recursively look through each of the nodes to find one with
         * the specified name and value.
         * @param property The Javascript property on the node that we are evaluating
         * @param value The value of the property we are comparing.
         */
        findNode(property: string, value: any): TreeNodeModel | null;
        /**
         * This will cleanup the model
         */
        dispose(): void;
    }
}
declare namespace Animate {
    interface ITreeViewSceneProps extends ITreeViewProps {
        project: Project | null;
    }
    /**
     * An implementation of the tree view for the scene.
     */
    class TreeViewScene extends TreeView<ITreeViewSceneProps> {
        static defaultProps: ITreeViewSceneProps;
        private static _singleton;
        constructor(props: ITreeViewSceneProps);
        /**
         * Bind any project related events
         */
        componentWillMount(): void;
        /**
         * Unbind any project related events
         */
        componentWillUnmount(): void;
        /**
         * Update the workspace
         */
        onProjectChanged(type: ProjectEvents): void;
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
        onResourceCreated(): void;
        /**
        * Called when the project is reset by either creating a new one or opening an older one.
        */
        projectReset(): void;
        /**
        * Catch the key down events.
        * @param e The event passed by jQuery
        */
        onKeyDown(): void;
        /**
        * Called when we select a menu item.
        */
        onContextSelect(): void;
        /**
        * When we double click the tree
        * @param <object> e The jQuery event object
        */
        onDblClick(): void;
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
        onContext2(): void;
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
declare namespace Animate {
    /**
     * A model for referencing a project resource
     */
    class TreeViewNodeResource<T extends ProjectResource<HatcheryServer.IResource>> extends TreeNodeModel {
        resource: T;
        private _loading;
        /**
         * Creates an instance of the node
         */
        constructor(resource: T);
        /**
         * Called whenever we start dragging. This is only called if canDrag is true.
         * Use it to set drag data, eg: e.dataTransfer.setData('text', 'some data');
         * @param {React.DragEvent} e
         * @returns {IDragDropToken} Return data to serialize
         */
        onDragStart(): IDragDropToken;
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
        icon(val?: JSX.Element): JSX.Element | undefined;
        /**
         * This will cleanup the model
         */
        dispose(): void;
        /**
         * Called whenever the resource is modified
         */
        protected onDeleted(type: ProjectEvents, event: IResourceEvent): void;
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
declare namespace Animate {
    /**
     * A root node that contains the visual representations of project containers
     */
    class TreeViewNodeContainers extends TreeNodeModel {
        private _context;
        private _project;
        /**
         * Creates an instance of the node
         */
        constructor(project: Project);
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
        onResourceCreated(type: ProjectEvents, event: IResourceEvent): void;
    }
}
declare namespace Animate {
    /**
     * A root node that contains the visual representations of project groups
     */
    class TreeViewNodeGroups extends TreeNodeModel {
        private _loading;
        private _project;
        /**
         * Creates an instance of the node
         */
        constructor(project: Project);
        /**
         * Gets or sets the icon of the node
         */
        icon(val?: JSX.Element): JSX.Element | undefined;
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
        onResourceCreated(type: ProjectEvents, event: IResourceEvent): void;
    }
}
declare namespace Animate {
    /**
     * A root node that contains the visual representations of project assets
     */
    class TreeViewNodeAssets extends TreeNodeModel {
        /**
         * Creates an instance of the node
         */
        constructor(project: Project);
        /**
         * Called whenever the node receives a context event
         */
        onContext(e: React.MouseEvent): void;
    }
}
declare namespace Animate {
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
        onTemplateCreated(type: PluginManagerEvents, event: ITemplateEvent): void;
    }
}
declare namespace Animate {
    /**
     * A node that represents an Asset Class
     */
    class TreeNodeAssetClass extends TreeNodeModel {
        assetClass: AssetClass | null;
        private _project;
        /**
         * Creates an instance of node
         */
        constructor(assetClass: AssetClass, project: Project);
        /**
         * Clean up
         */
        dispose(): void;
        /**
         * If a container is created, then add its node representation
         */
        onResourceCreated(type: ProjectEvents, event: IResourceEvent): void;
        /**
         * This will get all instance nodes of a particular class name(s)
         * @param classNames The class name of the asset, or an array of class names
         */
        getInstances(classNames: string | string[] | null): TreeNodeAssetInstance[];
    }
}
declare namespace Animate {
    /**
     * Treenode that contains a reference to an asset
     */
    class TreeNodeAssetInstance extends TreeViewNodeResource<Resources.Asset> {
        assetClass: AssetClass;
        /**
         * Creates an instance of the node
         */
        constructor(assetClass: AssetClass, asset: Resources.Asset);
        /**
         * When we click ok on the portal form
         */
        onAssetEdited(): void;
        /**
         * This will cleanup the component.
         */
        dispose(): void;
    }
}
declare namespace Animate {
    /**
     * Treenode that contains a reference to an asset
     */
    class TreeNodeContainerInstance extends TreeViewNodeResource<Resources.Container> {
        private _project;
        /**
         * Creates an instance of the node
         */
        constructor(container: Resources.Container, project: Project);
        /**
         * Gets or sets the label of the node
         * @param {string} val
         * @returns {string}
         */
        label(val?: string): string;
        /**
         * Called whenever the node is double clicked
         */
        onDoubleClick(): void;
        dispose(): void;
    }
}
declare namespace Animate {
    /**
     * This node represents a group asset.
     * Other resource nodes can be dropped on these which will append the object (if valid) into the group
     */
    class TreeNodeGroup extends TreeViewNodeResource<Resources.GroupArray> {
        /**
         * Creates an instance of the node
         */
        constructor(group: Resources.GroupArray);
        /**
         * Called whenever the resource is re-downloaded
         */
        protected onRefreshed(): void;
        /**
         * Called whenever we drop an item on this element. This is only called if canDrop is true.
         * Use it to set drag data, eg: e.dataTransfer.getData("text");
         * @param e
         * @param json The unserialized data
         */
        onDragDrop(e: React.DragEvent, json: IDragDropToken): void;
    }
}
declare namespace Animate {
    /**
     * This node represents a group instance
     */
    class TreeNodeGroupInstance extends TreeNodeModel {
        private _resource;
        private _group;
        /**
         * Creates an instance of the node
         */
        constructor(resource: ProjectResource<HatcheryServer.IResource>, group: Resources.GroupArray);
        /**
         * Show a context menu of resource options
         */
        onContext(e: React.MouseEvent): void;
        /**
         * Gets or sets the label of the node
         */
        label(val?: string): string;
        /**
         * This will cleanup the component
         */
        dispose(): void;
        readonly shallowId: number;
    }
}
declare namespace Animate {
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
         * Use it to set drag data, eg: e.dataTransfer.setData('text', 'some data');
         */
        onDragStart(): IDragDropToken;
        /**
         * If a template is removed then remove its instance
         */
        onTemplateRemoved(type: PluginManagerEvents, event: ITemplateEvent): void;
        /**
         * This will cleanup the component
         */
        dispose(): void;
        readonly template: BehaviourDefinition;
    }
}
declare namespace Animate {
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
        onRefreshed(type: string, event: Event, sender: Resources.Container): void;
        /**
        * Whenever the container deleted
        */
        onContainerDeleted(): void;
        /**
        * Whenever the container is modified, we show this with a *
        */
        onContainerModified(): void;
        /**
        * Cleans up the pair
        */
        dispose(): void;
        /**
        * @returns {Canvas}
        */
        readonly canvas: Canvas;
    }
}
declare namespace Animate {
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
        onChange(): void;
        /**
        * Called by the tab class when the pair is to be removed.
        * @param {TabEvent} event An object that can be used to cancel the operation. Simply call data.cancel = true to cancel the closure.
        */
        onRemove(event: any): void;
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
        readonly editor: AceAjax.Editor;
    }
}
declare namespace Animate {
    /**
    * A tab pair that manages the build HTML
    */
    class HTMLTab extends EditorPair {
        static singleton: HTMLTab | null;
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
        onRemove(event: any): void;
    }
}
declare namespace Animate {
    /**
    * A tab pair that manages the build CSS
    */
    class CSSTab extends EditorPair {
        static singleton: CSSTab | null;
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
        onRemove(event: any): void;
    }
}
declare namespace Animate {
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
        onServer(response: ProjectEvents): void;
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
declare namespace Animate {
    /**
    * This is an implementation of the tab class
    */
    class SceneTab extends Tab<any, any> {
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
declare namespace Animate {
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
    class CanvasTab extends Tab<any, any> {
        private static _singleton;
        private _currentCanvas;
        private closingTabPair;
        constructor();
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
        * @param {Resources.Asset} asset The asset we are removing
        */
        removeAsset(asset: Resources.Asset): void;
        /**
        * You can use this function to fetch a tab's canvas by a behaviour local ID
        * @param {number} behaviourID The local id of the container
        * @returns {Canvas} The returned tab's canvas or null
        */
        getTabCanvas(behaviourID: string): Canvas | null;
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
        onNewsLoaded(): void;
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
        renameTab(oldName: string, newName: string): TabPair | null;
        removeTab(index: number, prop: ITabPaneProps): void;
        /**
        * When a canvas is modified we change the tab name, canvas name and un-save its tree node.
        */
        onCanvasModified(): void;
        /**
        * Adds an item to the tab
        * @param {string} text The text of the new tab
        * @param {CanvasTabType} type The type of tab to create
        * @param {any} tabContent Data associated with the tab
        * @returns {TabPair} The tab pair object
        */
        addSpecialTab(text: string, type?: CanvasTabType, tabContent?: any): TabPair | null;
        readonly currentCanvas: Canvas;
    }
}
declare namespace Animate {
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
         */
        render(): JSX.Element;
    }
}
declare namespace Animate {
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
declare namespace Animate {
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
declare namespace Animate {
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
declare namespace Animate {
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
        edit(prop: Prop<any>, container: Component): void;
    }
}
declare namespace Animate {
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
declare namespace Animate {
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
declare namespace Animate {
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
declare namespace Animate {
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
declare namespace Animate {
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
        */
        edit(prop: Prop<any>): void;
    }
}
declare namespace Animate {
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
declare namespace Animate {
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
        editableObject(object: EditableSet | null, name: string, img?: string): EditableSet | null | undefined;
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
        removeEditor(editor: PropertyGridEditor): PropertyGridEditor | null;
        /**
        * This will cleanup the component.
        */
        dispose(): void;
        /**
        * Gets the singleton instance.
        * @returns <PropertyGrid>
        */
        static getSingleton(parent?: Component): PropertyGrid;
        readonly currentObject: any;
    }
}
declare namespace Animate {
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
declare namespace Animate {
    interface IImagePreviewProps extends React.HTMLAttributes {
        src: string | undefined;
        defaultSrc?: string;
        label?: string;
        labelIcon?: JSX.Element;
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
         */
        render(): JSX.Element;
    }
}
declare namespace Animate {
    interface IImageUploaderProps {
        onImage?: (file: HatcheryServer.IFile) => void;
        src: string | undefined;
        label: string;
        onError?: (e: Error) => void;
    }
    interface IImageUploaderState {
        src: string | undefined;
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
         */
        render(): JSX.Element;
    }
}
declare namespace Animate {
    interface IToolbarButtonProps {
        onChange?: (val: boolean) => void | null;
        pushButton?: boolean;
        selected?: boolean;
        label: string | null;
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
         */
        render(): JSX.Element;
        /**
        * Called when the props are updated
        */
        componentWillReceiveProps(nextProps: IVCheckboxProps): void;
        onClick(): void;
        /**
         * Get if the component is selected
         */
        /**
         * Set if the component is selected
         */
        selected: boolean;
    }
}
declare namespace Animate {
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
        onWheel(event: any, delta: any): void;
        onKeyDown(e: any): void;
        onDown(e: any): void;
        onClick(e: any): void;
        /**
        * Cleans up the component
        */
        dispose(): void;
    }
}
declare namespace Animate {
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
declare namespace Animate {
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
        * @param {Array<ToolbarItem>} items An array of items to list e.g. [{img:'./img1.png', text:'option 1'}, {img:'./img2.png', text:'option 2'}]
        */
        constructor(parent: Component, items: Array<ToolbarItem>);
        /**
        * Adds an item the drop down. The item must be an object with both img and text vars. eg: { img:'', text:'' }
        * @param {ToolbarItem} item The item to add.
        * @returns {Component}
        */
        addItem(item: ToolbarItem): Component;
        /**
        * Adds an item the drop down. The item must be an object with both img and text vars. eg: { img:'', text:'' }
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
        onClick(): void;
        /**
        * Cleans up the component
        */
        dispose(): void;
    }
}
declare namespace Animate {
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
        onCloseClicked(): void;
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
        show(parent?: Component | null, x?: number, y?: number, isModal?: boolean, isPopup?: boolean): void;
        /**
        * Catch the key down events.
        * @param {any} e The jQuery event object
        */
        onKeyDown(e: any): void;
    }
}
declare namespace Animate {
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
         */
        render(): JSX.Element;
    }
}
declare namespace Animate {
    interface IOptionsUserProps {
    }
    interface IOptionsUserStats {
        bioUpdateErr?: string | null;
        imageUploadErr?: string | null;
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
         * @param bio The new bio data
         */
        updateBio(bio: string): void;
        /**
         * Sets the user's avatar image
         */
        setAvatarUrl(file: any): void;
        /**
         * Draws the options JSX
         */
        render(): JSX.Element;
    }
}
declare namespace Animate {
    interface IOptionsProjectProps extends IReactWindowProps {
    }
    interface IOptionsProjectState {
        infoServerMsg?: string | null;
        imageUploadErr?: string | null;
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
         */
        setProjectImageUrl(file: HatcheryServer.IFile): void;
        /**
         * Attempts to update the project
         * @param project details
         */
        updateDetails(json: any): void;
        /**
         * Draws the options JSX
         */
        render(): JSX.Element;
    }
}
declare namespace Animate {
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
declare namespace Animate {
    interface IViewerFile extends HatcheryServer.IFile {
        selected?: boolean;
        loadingPreview?: boolean;
    }
    interface IFileViewerProps {
        multiSelect: boolean;
        extensions: Array<string>;
        onFilesSelected?: (files: HatcheryServer.IFile[]) => void;
        onClose?: () => void;
        readOnly?: boolean;
    }
    interface IFileViewerState {
        selectedEntity?: IViewerFile | null;
        errorMsg?: string | null;
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
        onFileUploaded(err: Error): void;
        /**
         * When the scope changes we update the viewable contents
         */
        onScopeChange(option: SelectValue | null): void;
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
        */
        render(): JSX.Element;
        /**
         * Specifies the type of file search
         */
        selectMode(type: FileSearchType): void;
        /**
         * Sets the selected status of a file or folder
         */
        selectEntity(e: React.MouseEvent, entity: IViewerFile | null): void;
        /**
         * Removes the selected entities
         */
        removeEntities(): void;
        updateContent(index: number, limit: number): Promise<number>;
        /**
         * Whenever the file input changes we check the file is valid and then attempt to upload it
         */
        onFileChange(e: React.FormEvent): boolean | undefined;
        /**
         * Checks if a file list is one of the approved props extensions
         */
        checkIfAllowed(files: FileList): boolean;
        /**
         * Perform any cleanup if neccessary
         */
        componentWillUnmount(): void;
        /**
         * Makes sure we only view the file types specified in the props exensions array
         * @param files The file array we are filtering
         */
        filterByExtensions(files: IViewerFile[]): IViewerFile[];
        /**
         * Called when we are dragging assets over the file items div
         */
        onDragOver(e: React.DragEvent): void;
        /**
         * Called when we are no longer dragging items.
         */
        onDragLeave(): void;
        /**
         * Called when we drop an asset on the file items div.
         * Checks if the file is allow, and if so, it uploads the file
         */
        onDrop(e: React.DragEvent): void;
        /**
         * Attempts to upload an image or canvas to the users asset directory and set the upload as a file's preview
         * @param file The target file we are setting the preview for
         * @param preview The image we are using as a preview
         */
        uploadPreview(file: IViewerFile, preview: HTMLCanvasElement | HTMLImageElement): void;
        /**
         * Attempts to update the selected file
         * @param token The file token to update with
         */
        updateFile(token: HatcheryServer.IFile): void;
    }
}
declare namespace Animate {
    interface IFileDialogueProps extends IReactWindowProps {
        extensions?: string[];
        multiselect?: boolean;
        readOnly?: boolean;
        onFilesSelected?: (file: HatcheryServer.IFile[]) => void;
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
declare namespace Animate {
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
         */
        onButtonClick(e: React.MouseEvent, button: string): void;
        /**
         * A helper function for showing an success modal box
         * @param message The message to display
         * @param buttons An array of strings that represent the button choices for the modal
         * @param callback An optional callback function for when a button is clicked
         */
        static success(message: string, buttons?: string[], callback?: (button) => void): void;
        /**
         * A helper function for showing a warning modal box
         * @param message The message to display
         * @param buttons An array of strings that represent the button choices for the modal
         * @param callback An optional callback function for when a button is clicked
         */
        static warn(message: string, buttons?: string[], callback?: (button) => void): void;
        /**
         * A helper function for showing an error modal box
         * @param message The message to display
         * @param buttons An array of strings that represent the button choices for the modal
         * @param callback An optional callback function for when a button is clicked
         */
        static error(message: string, buttons?: string[], callback?: (button) => void): void;
    }
}
declare namespace Animate {
    interface IPortalFormProps extends IReactWindowProps {
        onCancel?: () => void;
    }
    interface IPortalFormStats extends IReactWindowState {
        errorMsg?: string | null;
        portal: Portal | null;
    }
    /**
     * This form is used to create or edit Portals.
     */
    class PortalForm extends ReactWindow<IPortalFormProps, IPortalFormStats> {
        static defaultProps: IPortalFormProps;
        private _portalType;
        private _newProperty;
        private $name;
        constructor(props: IPortalFormProps);
        /**
         * Gets the content JSX for the window.
         */
        getContent(): React.ReactNode;
        /**
        * Creates a new property from the data chosen
        * @param {Prop<any>}
        */
        getProperty(): Prop<any> | null;
        /**
        * Shows the window by adding it to a parent.
        * @param {Component} item The item we are editing
        * @param {PortalType} type The items current portal type
        * @param {string} caption The caption of the form
        */
        editPortal(property: Prop<any>, type: HatcheryRuntime.PortalType, nameVerifier: (name: string) => boolean): void;
        /**
        * Hides the window from view
        */
        hide(): void;
        /**
        * Called when we click one of the buttons. This will dispatch the event OkCancelForm.CONFIRM
        * and pass the text either for the ok or cancel buttons.
        */
        ok(json: any): void;
        readonly name: string;
        readonly portalType: HatcheryRuntime.PortalType;
        readonly value: any;
        readonly parameterType: PropertyType | undefined;
    }
}
declare namespace Animate {
    interface IRenameFormProps extends IReactWindowProps {
        name?: string;
        onRenaming?: (newName: string, prevName: string) => Error;
        onCancel?: () => void;
        onOk?: (newName: string) => void;
    }
    interface IRenameFormState extends IReactWindowState {
        $errorMsg?: string | null;
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
declare namespace Animate {
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
declare namespace Animate {
    interface IBehaviourPickerProps extends IReactWindowProps {
        onTemplateSelected?: (template: BehaviourDefinition | null) => void;
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
         */
        onKeyUp(e: React.KeyboardEvent): void;
    }
}
declare namespace Animate {
    interface ILoggerProps extends HatcheryProps {
        messages?: ILogMessage[];
    }
    class Logger extends React.Component<ILoggerProps, any> {
        /**
         * Creates an instance of the logger
         */
        constructor(props: ILoggerProps);
        /**
         * Creates the component elements
         */
        render(): JSX.Element;
    }
}
declare namespace Animate {
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
        onMouseleave(): void;
        /**
        * Creates the component elements
        */
        render(): JSX.Element;
    }
}
declare namespace Animate {
    interface IToolbarProps {
        project: Project;
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
        componentWillMount(): void;
        componentWillUnmount(): void;
        onProjectUpdated(): void;
        /**
         * Creates the component elements
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
        newProject(): void;
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
        * @param text The text of the new tab
        * @param text The text of the new tab
        * @returns Returns the {Component} object representing the tab
        */
        createTab(text: string, isSelected?: boolean): Component | null;
        saveAll(): void;
        /**
        * Called when the key is pushed down
        */
        onKeyDown(event: any): void;
        /**
        * Removes a tab by its name
        * @param text The name of the tab
        */
        removeTab(text: string): void;
        /**
        * This function is used to create a new group on the toolbar
        * @param tab The {Component} tab object which represents the parent of this group.
        * @returns Returns the {Component} object representing the group
        */
        createGroup(tab: Component): Component | null;
        /**
        * Use this function to create a group button for the toolbar
        * @param {string} text The text for the button
        * @param {number} min The minimum limit
        * @param {number} max The maximum limit
        * @param {number} delta The incremental difference when scrolling
        * @param {Component} group The Component object representing the group
        * @returns {ToolbarNumber}
        */
        createGroupNumber(text: string, defaultVal: number, min?: number, max?: number, delta?: number, group?: Component | null): ToolbarNumber | null;
        /**
        * Use this function to create a group button for the toolbar
        * @param {string} text The text for the button
        * @param {string} image An image URL for the button icon
        * @param {Component} group The Component object representing the group
        * @param {boolean} isPushButton If true, the button will remain selected when clicked.
        * @returns {Component} Returns the Component object representing the button
        */
        createGroupButton(text: string, image?: string | null, group?: Component | null, isPushButton?: boolean): ToolbarButton | null;
        /**
        * Use this function to create a group button for the toolbar
        * @param {Component} parent The parent that will contain the drop down
        * @param {Array<ToolbarItem>} items An array of items to list
        * @returns {ToolbarDropDown} Returns the Component object representing the button
        */
        createDropDownButton(parent: Component, items: Array<ToolbarItem>): ToolbarDropDown | null;
        /**
        * Use this function to create a group button for the toolbar
        * @param {Component} parent The parent that will contain the drop down
        * @param {string} text The under the button
        * @param {string} color The hex colour as a string
        * @returns {ToolbarColorPicker} Returns the ToolbarColorPicker object representing the button
        */
        createColorButton(parent: Component, text: string, color: string): ToolbarColorPicker | null;
        /**
        * Gets the singleton instance
        */
        static getSingleton(parent?: Component): Toolbar;
    }
}
declare namespace Animate {
    interface IPagerProps extends React.HTMLAttributes {
        onUpdate: (index: number, limit: number) => void;
        count: number;
        limit?: number;
    }
    interface IPagerState {
        index?: number;
        limit?: number;
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
         */
        getPageNum(): number;
        /**
         * Gets the total number of pages
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
         */
        render(): JSX.Element;
    }
}
declare namespace Animate {
    interface ISearchBoxProps extends React.HTMLAttributes {
        onSearch: (e: React.FormEvent, searchText: string) => void;
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
         */
        render(): JSX.Element;
    }
}
declare namespace Animate {
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
        componentWillReceiveProps(): void;
        /**
         * Creates the component elements
         */
        render(): JSX.Element;
    }
}
declare namespace Animate {
    type SelectValue = {
        label: string;
        value: string | number;
        selected?: boolean;
    };
    interface IVSelectProps extends React.HTMLAttributes {
        /**
         * Called whenever an option is selected
         * @param {SelectValue} option
         * @param {HTMLSelectElement} element
         */
        onOptionSelected?: (option: SelectValue | null, element: HTMLSelectElement) => void;
        /**
         * An array of options to use with the select
         */
        options: SelectValue[];
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
        error?: string | null;
        selected?: SelectValue | null;
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
        readonly value: SelectValue | null;
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
         * @returns An error string or null if there are no errors
         */
        validate(val: string | number): string;
        /**
         * Called whenever the value changes
         */
        private onChange(e);
        /**
         * Gets if this input has not been touched by the user. False is returned if it has been
         */
        readonly pristine: boolean;
        /**
         * Creates the component elements
         */
        render(): JSX.Element;
    }
}
declare namespace Animate {
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
         */
        onChange(e: React.FormEvent): void;
        /**
         * Called when the props are updated
         */
        componentWillReceiveProps(nextProps: IVCheckboxProps): void;
        /**
         * Gets the current checked state of the input
         */
        readonly checked: boolean;
        /**
         * Gets if this input has not been touched by the user. False is returned if it has been
         */
        readonly pristine: boolean;
        /**
        * Creates the component elements
        */
        render(): JSX.Element;
    }
}
declare namespace Animate {
    interface IVInputProps {
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
        onValidationError?: (e: Error, target: VInput, value: string) => void;
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
        onChange?(e: React.FormEvent, newString: string): void;
        onKeyUp?(e: React.KeyboardEvent): void;
        autoFocus?: boolean;
        readOnly?: boolean;
        autoComplete?: string;
        name?: string;
        type?: string;
        placeholder?: string;
        className?: string;
    }
    /**
     * A verified input is an input that can optionally have its value verified. The input must be used in conjunction
     * with the VForm.
     */
    class VInput extends React.Component<IVInputProps, {
        error?: string | null;
        value?: string;
        highlightError?: boolean;
        focussed?: boolean;
    }> {
        static defaultProps: IVInputProps;
        private _pristine;
        private _hintStart;
        private _hintEnd;
        private _allowHint;
        /**
         * Creates a new instance
         */
        constructor(props: any);
        /**
         * Gets the current value of the input
         */
        readonly value: string;
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
         * @returns An error string or null if there are no errors
         */
        getValidationErrorMsg(val: string): string;
        /**
         * Check if we need to highlight the next
         */
        componentDidUpdate(nextProps: any): void;
        /**
         * Only called when we have hints enabled
         */
        onKeyUp(e: React.KeyboardEvent): void;
        /**
         * Makes sure that the key is printable and therefore if we have to show the hint or not
         */
        private onKeyDown(e);
        /**
         * Called whenever the value changes
         */
        private onChange(e);
        /**
         * Gets if this input has not been touched by the user. False is returned if it has been
         */
        readonly pristine: boolean;
        /**
         * Creates the component elements
         */
        render(): JSX.Element;
    }
}
declare namespace Animate {
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
        onValidationError?: (e: Error, target: VTextarea, value: string) => void;
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
        error?: string | null;
        value?: string;
        highlightError?: boolean;
        className?: string;
        focussed?: boolean;
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
         */
        readonly value: string;
        /**
         * Sets the highlight error state. This state adds a 'highlight-error' class which
         * can be used to bring attention to the component
         */
        highlightError: boolean;
        /**
         * Checks the string against all validators.
         * @returns An error string or null if there are no errors
         */
        getValidationErrorMsg(val: string): string;
        /**
         * Called whenever the value changes
         */
        private onChange(e);
        /**
         * Gets if this input has not been touched by the user. False is returned if it has been
         */
        readonly pristine: boolean;
        /**
         * Creates the component elements
         */
        render(): JSX.Element;
    }
}
declare namespace Animate {
    type ValidationError = {
        name: string;
        error: string;
    };
    type VGeneric = VInput | VTextarea | VCheckbox | VSelect;
    interface IVFormProps {
        id?: string;
        className?: string;
        name?: string;
        /**
         * If true, prevents the form being automatically submitted
         */
        preventDefault?: boolean;
        /**
         * A callback for when an input has been changed and the json updated
         */
        onChange?: (json: any, form: VForm) => void;
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
         */
        onSubmit(e: React.FormEvent): void;
        /**
         * Goes through the validations and calls submit if everything passes
         */
        initiateSubmit(): void;
        /**
         * Called whenever any of the inputs fire a change event
         */
        onChange(e: React.FormEvent): void;
        /**
         * Called if any of the validated inputs reported or resolved an error
         * @param e The error that occurred
         * @param target The input that triggered the error
         */
        onError(e: Error | null, target: VGeneric, value?: string | boolean): void;
        /**
         * Gets if this form has not been touched by the user. False is returned if it has been,
         */
        readonly pristine: boolean;
        /**
         * Creates the component elements
         */
        render(): JSX.Element;
    }
}
declare namespace Animate {
    type PluginMap = {
        [name: string]: IPluginPlus[];
    };
    interface IPluginPlus extends HatcheryServer.IPlugin {
        expanded?: boolean;
    }
    interface IPluginsWidgetProps {
        onChange(selectedPlugins: IPluginPlus[]): any;
        onError(error: Error): any;
    }
    interface IPluginsWidgetState {
        loading?: boolean;
        plugins?: PluginMap;
        selectedPlugin?: IPluginPlus | null;
        activePlugin?: IPluginPlus | null;
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
         */
        readonly selectedPlugins: IPluginPlus[];
        selectPlugin(plugin: IPluginPlus): void;
        mustShowPluginTick(plugin: any, index: number): boolean;
        showVersions(plugin: HatcheryServer.IPlugin): void;
        /**
         * Once the plugins are loaded from the DB
         */
        onPluginsLoaded(plugins: Array<HatcheryServer.IPlugin>): PluginMap;
        /**
         * Generates the React code for displaying the plugins
         */
        createPluginHierarchy(): JSX.Element[];
        /**
         * Creates the component elements
         */
        render(): JSX.Element;
    }
}
declare namespace Animate {
    interface IProjectListProps extends React.HTMLAttributes {
        onProjectSelected?: (project: HatcheryServer.IProject) => void;
        onProjectDClicked?: (project: HatcheryServer.IProject) => void;
        noProjectMessage?: string;
        projects?: HatcheryServer.IProject[];
        numProjects?: number;
        onProjectsRequested?: (index: number, limit: number, keywords: string) => void;
    }
    interface IProjectListState {
        loading?: boolean;
        searchText?: string;
        selectedProject?: HatcheryServer.IProject | null;
        errorMsg?: string | null;
        projects?: HatcheryServer.IProject[];
    }
    /**
     * A list that displays projects in a paginated container.
     */
    class ProjectList extends React.Component<IProjectListProps, IProjectListState> {
        static defaultProps: IProjectListProps;
        /**
         * Creates a new instance
         */
        constructor(props: any);
        selectProject(project: HatcheryServer.IProject | null, doubleClick: boolean): void;
        /**
         * Creates the component elements
         */
        render(): JSX.Element;
    }
}
declare namespace Animate {
    interface IOpenProjectProps {
        onCancel: () => void;
        onComplete: () => void;
        project: HatcheryServer.IProject;
    }
    interface IOpenProjectState {
        message?: string | null;
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
         */
        render(): JSX.Element;
    }
}
declare namespace Animate {
    /**
     * An interface for describing the login form properties
     */
    interface ILoginFormProps {
        onLoginRequested: (token: UsersInterface.ILoginToken) => void;
        onResetPasswordRequest: (username: string) => void;
        onResendActivationRequest: (username: string) => void;
        onRegisterRequested: () => void;
        isLoading?: boolean;
        error?: boolean;
        message?: string;
    }
    /**
     * An interface for describing the login state
     */
    interface ILoginFormState {
        username?: string;
        error?: boolean;
        message?: string;
    }
    /**
     * A simple login form
     */
    class LoginForm extends React.Component<ILoginFormProps, ILoginFormState> {
        /**
         * Creates a new instance
         */
        constructor(props: ILoginFormProps);
        /**
         * Creates the component elements
         */
        render(): JSX.Element;
    }
}
declare namespace Animate {
    interface IRegisterFormProps {
        onRegisterRequested?: (token: UsersInterface.IRegisterToken) => void;
        onLoginRequested?: () => void;
        isLoading?: boolean;
        error?: boolean;
        message?: string;
    }
    interface IRegisterFormState {
        message?: string;
        error?: boolean;
    }
    /**
     * A simple register form
     */
    class RegisterForm extends React.Component<IRegisterFormProps, IRegisterFormState> {
        private _user;
        private _captchaId;
        /**
         * Creates a new instance
         */
        constructor();
        /**
         * Called when the captcha div has been mounted and is ready
         * to be rendered
         * @param div The div being rendered
         */
        mountCaptcha(div: HTMLDivElement): void;
        /**
         * Called when the component is unmounted
         */
        componentWillUnmount(): void;
        /**
         * Creates the component elements
         */
        render(): JSX.Element;
    }
}
declare namespace Animate {
    enum LoginMode {
        LOGIN = 0,
        REGISTER = 1,
    }
    interface ILoginWidgetProps extends HatcheryProps {
        onLogin?: () => void;
        user?: IUser;
        editorState?: IEditorState;
    }
    class LoginWidget extends React.Component<ILoginWidgetProps, any> {
        /**
         * Creates a new instance
         */
        constructor(props: ILoginWidgetProps);
        /**
         * Creates the component elements
         */
        render(): JSX.Element;
    }
}
declare namespace Animate {
    enum SplashMode {
        WELCOME = 0,
        NEW_PROJECT = 1,
        OPENING = 2,
    }
    interface ISplashProps {
        onClose: () => void;
        onLogout: () => void;
        user: IUser;
    }
    interface ISplashStats {
        mode?: SplashMode;
        loading?: boolean;
        project?: HatcheryServer.IProject;
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
         */
        render(): JSX.Element;
        splashDimensions(): string;
        /**
        * Gets the singleton reference of this class.
        */
        static readonly get: Splash;
    }
}
declare namespace Animate {
    interface INewProjectProps {
        onCancel: () => void;
        onProjectCreated: (project: HatcheryServer.IProject) => void;
    }
    interface INewProjectState {
        plugins?: IPluginPlus[];
        errorMsg?: string | null;
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
         */
        newProject(json: any): void;
        /**
        * Creates the component elements
        */
        render(): JSX.Element;
    }
}
declare namespace Animate {
    interface IProjectsOverviewProps extends HatcheryProps {
        user?: IUser;
        onCreateProject?: () => void;
        onOpenProject?: (project: HatcheryServer.IProject) => void;
    }
    interface IProjectsOverviewState {
        selectedProject?: HatcheryServer.IProject | null;
    }
    class ProjectsOverview extends React.Component<IProjectsOverviewProps, IProjectsOverviewState> {
        private _user;
        private _list;
        /**
         * Creates an instance of the projects overview
         */
        constructor(props: IProjectsOverviewProps);
        /**
        * Creates the component elements
        */
        render(): JSX.Element;
    }
}
declare namespace Animate {
    interface IWorkspaceProps extends ITabProps {
        project: Project;
    }
    /**
     * The main workspace area of the application.
     */
    class Workspace extends React.Component<IWorkspaceProps, any> {
        /**
         * Creates an instance of the workspace
         */
        constructor(props: IWorkspaceProps);
        /**
         * Bind any project related events
         */
        componentWillMount(): void;
        /**
         * Unbind any project related events
         */
        componentWillUnmount(): void;
        /**
         * Update the workspace
         */
        onProjectChanged(type: ProjectEvents): void;
        canContainerClose(editor: Editor): boolean | Promise<boolean>;
        /**
         * Creates the component elements
         */
        render(): JSX.Element;
    }
}
declare namespace Animate {
    interface IApplicationState extends HatcheryProps {
        editorState?: IEditorState;
        project?: IProject;
        user?: IUser;
    }
    class Application extends React.Component<IApplicationState, void> {
        private static _singleton;
        static bodyComponent: Component;
        private _focusObj;
        constructor(props: IApplicationState);
        componentWillMount(): void;
        /**
         * Log the first welcome message
         */
        componentDidMount(): void;
        /**
         * Creates the component elements
         */
        render(): JSX.Element;
        /**
        * Deals with the focus changes
        */
        onMouseDown(e: any): void;
        /**
        * Sets a component to be focused.
        * @param comp The component to focus on.
        */
        setFocus(comp: Component): void;
        /**
        *  This is called when a project is unloaded and we need to reset the GUI.
        */
        projectReset(): void;
        /**
         * Gets the singleton instance
         * @returns {Application}
         */
        static getInstance(): Application;
        readonly focusObj: Component;
    }
}
declare namespace Animate {
    /**
     * Describes each of the project action types
     */
    type ProjectActionType = 'PROJECT_REQUEST_PENDING' | 'PROJECT_REQUEST_REJECTED' | 'PROJECT_CREATED' | 'PROJECT_OPENED';
    /**
     * A base interface for describing project related actions
     */
    interface IProjectAction extends Redux.Action {
        type: ProjectActionType;
        project: IProject;
    }
    /**
     * Creates a new project for the authenticated user
     * @param options An object of projet defaults
     */
    function createProject(options: HatcheryServer.IProject): (dispatch: Redux.Dispatch<IProjectAction>) => void;
}
declare namespace Animate {
    /**
     * Describes the different types of editor action types
     */
    type EditorActionType = 'EA_TOGGLE_SPLASH' | 'EA_TOGGLE_LOGIN_STATE';
    /**
     * An interface for describing  editor actions
     */
    interface IEditorAction extends Redux.Action, IEditorState {
        type: EditorActionType;
        editorState: IEditorState;
    }
    /**
     * Creates an action that toggles the splash screen visiblility
     */
    function toggleSplash(visible: boolean): IEditorAction;
    /**
     * Creates an action that toggles the splash screen visiblility
     */
    function toggleLoginState(state: 'login' | 'register'): IEditorAction;
}
declare namespace Animate {
    /**
     * Describes each of the project action types
     */
    type LoggerActionType = 'LOGGER_ADD_ITEM' | 'LOGGER_CLEAR_ITEMS';
    /**
     * A base interface for describing logger related actions
     */
    interface ILoggerAction extends Redux.Action {
        type: LoggerActionType;
        item?: ILogMessage;
    }
    namespace LogActions {
        /**
         * Creates an action to clear all log items
         */
        function clear(): ILoggerAction;
        /**
         * Creates an action for adding a log message in the log window
         */
        function message(message: string): ILoggerAction;
        /**
         * Creates an action for adding a warning log message in the log window
         */
        function warning(message: string): ILoggerAction;
        /**
         * Creates an action for adding an error log message in the log window
         */
        function error(message: string): ILoggerAction;
    }
}
declare namespace Animate {
    /**
     * Describes each of the user action types
     */
    type UserActionType = 'USER_REQUEST_PENDING' | 'USER_REQUEST_REJECTED' | 'USER_REQUEST_FULFILLED' | 'USER_AUTHENTICATED' | 'USER_LOGGED_IN' | 'USER_REGISTRATION_SENT' | 'USER_GET_PROJECTS' | 'USER_LOGIN_FAILED' | 'USER_PASSWORD_RESET' | 'USER_ACTIVATION_RESENT' | 'USER_REMOVED_PROJECT' | 'USER_LOGGED_OUT';
    /**
     * A base interface for describing user related actions
     */
    interface IUserAction extends Redux.Action {
        type: UserActionType;
        userData?: IUser;
    }
    /**
     * Describes the action for removing projects
     */
    interface IUserProjectRemovedAction extends Redux.Action {
        type: UserActionType;
        username?: string;
        project?: string;
    }
    /**
     * Fetches all the projects of a given user. This only works if the user is logged in and has access rights
     * @param user The username of the user we are fetching a project list for
     * @param index The index to  fetching projects for
     * @param limit The limit of how many items to fetch
     * @param search Optional search text
     */
    function getProjectList(user: string, index: number, limit: number, search?: string): (dispatch: Redux.Dispatch<IUserAction>) => void;
    /**
     * Sends a server request to check if a user is logged in
     */
    function authenticated(): (dispatch: Redux.Dispatch<IUserAction>) => void;
    /**
     * Attempts to log the user out
     */
    function logout(): (dispatch: Redux.Dispatch<IUserAction>) => void;
    /**
     * Sends an instruction to the server to start the user password reset procedure
     */
    function resetPassword(user: string): (dispatch: Redux.Dispatch<IUserAction>) => void;
    /**
     * Sends an instruction to the server to resend the user account activation link
     */
    function resendActivation(user: string): (dispatch: Redux.Dispatch<IUserAction>) => void;
    /**
     * Removes a user's project by its id
     * @param username The username of the user we are removing a project for
     * @param pid The id of the project to remove
     */
    function removeProject(username: string, pid: string): (dispatch: Redux.Dispatch<IUserAction>) => void;
    /**
     * Attempts to log the user in using the token provided
     */
    function login(token: UsersInterface.ILoginToken): (dispatch: Redux.Dispatch<IUserAction>) => void;
    /**
     * Attempts to register the user with the provided token
     */
    function register(token: UsersInterface.IRegisterToken): (dispatch: Redux.Dispatch<IUserAction>) => void;
}
declare namespace Animate {
    /**
     * A reducer for processing project actions
     */
    function projectReducer(state: IProject, action: IProjectAction): IProject;
}
declare namespace Animate {
    /**
     * A reducer that processes state changes of the editor
     */
    function loggerReducer(state: ILogMessage[], action: ILoggerAction): ILogMessage[];
}
declare namespace Animate {
    /**
     * A reducer that processes state changes of the editor
     */
    function editorReducer(state: IEditorState, action: IEditorAction): IEditorState;
}
declare namespace Animate {
    /**
     * A reducer for processing project actions
     */
    function userReducer(state: IUser, action: IUserAction): IUser;
}
declare namespace Animate {
    var store: Redux.Store<any>;
}
declare let _cache: string;
declare const __plugins: {
    [name: string]: Array<HatcheryServer.IPlugin>;
};
declare let __newPlugin: Animate.IPlugin | null;
/**
 * Goes through each of the plugins and returns the one with the matching ID
 * @param id The ID of the plugin to fetch
 */
declare function getPluginByID(id: string): HatcheryServer.IPlugin | null;
/**
 * Returns a formatted byte string
 */
declare function byteFilter(bytes: any, precision?: number): string;
/**
 * Sorts the plugins based on their versions
 */
declare function sortPlugins(plugins: HatcheryServer.IPlugin[]): void;
/**
 * Creates the redux store for the application
 */
declare function createStore(): Redux.Store<any>;
/**
 * Once the plugins are loaded from the DB
 */
declare function onPluginsLoaded(plugins: HatcheryServer.IPlugin[]): void;
