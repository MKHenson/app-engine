declare namespace Animate {

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
        openEditors?: Editor[];
        activeEditor?: Editor | null;
        curBuild?: Build | null;
        restPaths?: { [ type: number ]: { url: string; array: Array<ProjectResource<HatcheryServer.IResource>> }; }
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
    }
}