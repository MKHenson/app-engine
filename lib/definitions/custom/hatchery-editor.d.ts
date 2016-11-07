declare namespace Animate {

    export interface Point { x: number; y: number; }

    export interface IPortalTemplate {
        type: HatcheryRuntime.PortalType;
        property: any; // TODO: This is of type Prop<any>
    }

    export interface IBehaviourDefinition {
        behaviourName: string;
        canBuildOutput: boolean;
        canBuildInput: boolean;
        canBuildParameter: boolean;
        canBuildProduct: boolean;
        portalTemplates: IPortalTemplate[];
        plugin: string;
    }

    export interface ITypeConverter {
        plugin: string;
        typeA: string;
        typeB: string;
        conversionOptions: string[];
    }

    /**
    * A basic wrapper for a Portal interface
    */
    export interface IPortal {
        name: string;
        type: HatcheryRuntime.PortalType;
        custom: boolean;
        property: any;
        left?: number;
        top?: number;
        size?: number;
        behaviour?: number;
        links?: ILinkItem[]
    }

    /**
     * A basic wrapper for a CanvasItem interface
     */
    export interface ICanvasItem {
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
    export interface ILinkItem extends ICanvasItem {
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
    export interface IBehaviour extends ICanvasItem {
        alias?: string;
        behaviourType?: string;
        portals?: IPortal[];
    }

    /**
    * A basic wrapper for a Comment interface
    */
    export interface IComment extends ICanvasItem {
        label: string;
    }

    /**
    * A basic wrapper for a BehaviourPortal interface
    */
    export interface IBehaviourPortal extends IBehaviour {
        portal: IPortal;
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
        targetId: number;
    }

    /**
	 * Describes the type of log message
	 */
    export type LogType =
        'message' |
        'warning' |
        'error';

    /**
     * Describes the base type used in drag and drop communication
     */
    export interface IDragDropToken {
        type: 'resource' | 'template' | 'container' | 'other';
        id?: string | number;
    }

    /**
     * Describes the log messages that are displayed in the logger component
     */
    export interface ILogMessage {
        type: LogType;
        message: string;
        tag: any;
    }

    /**
     * Describes the state of the editor
     */
    export interface IBaseStoreState {
        loading?: boolean;
        error?: Error | null;
        serverResponse?: string | null;
    }

    /**
     * The base interface for Hatchery props
     */
    export interface HatcheryProps {
        dispatch?: Redux.Dispatch<any>;
    }

    /**
     * Describes the state of the editor
     */
    export interface IEditorState {
        showSplash?: boolean;
        loginState?: 'login' | 'register';
    }

    /**
     * Describes the store Project
     */
    export interface IProject extends IBaseStoreState {
        openEditors?: any[];
        activeEditor?: any | null;
        curBuild?: any | null;
        restPaths?: { [ type: number ]: { url: string; array: any[] }; }
        entry?: HatcheryServer.IProject | null;
    }

    /**
     * Describes the store User
     */
    export interface IUser extends IBaseStoreState {
        entry?: UsersInterface.IUserEntry | null;
        meta?: HatcheryServer.IUserMeta;
        isLoggedIn?: boolean;
    }

    /**
     * Describes the splash screen
     */
    export interface ISplashScreen extends IBaseStoreState {
        projects?: HatcheryServer.IProject[];
        numProjects?: number;
        selectedProject?: HatcheryServer.IProject | null;
        screen?: 'welcome' | 'new-project' | 'opening-project';
    }

    /**
     * Describes the plugins available to the editor
     */
    export interface IPlugins extends IBaseStoreState {
        plugins?: HatcheryServer.IPlugin[];
        map?: { [ name: string ]: HatcheryServer.IPlugin[] };
    }

    /**
     * The root interface for the application store
     */
    export interface IStore {
        splash: ISplashScreen;
        editorState: IEditorState;
        project: IProject;
        user: IUser;
        logs: ILogMessage[];
        plugins: IPlugins;
    }
}

declare module 'hatchery-editor' {
    export = Animate;
}