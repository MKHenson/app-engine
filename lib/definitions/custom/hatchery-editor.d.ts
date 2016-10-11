declare namespace Animate {
    /**
     * Describes the base type used in drag and drop communication
     */
    export interface IDragDropToken {
        type: 'resource' | 'template' | 'container' | 'other';
        id?: string | number;
    }

    /**
     * Describes the state of the editor
     */
    export interface IEditorState {
        showSplash?: boolean;
    }

    /**
     * Describes the store Project
     */
    export interface IProject {
        openEditors: Editor[];
        activeEditor: Editor;
        curBuild: Build;
        restPaths: { [ type: number ]: { url: string; array: Array<ProjectResource<HatcheryServer.IResource>> }; }
        entry: HatcheryServer.IProject;
    }

    /**
     * Describes the store User
     */
    export interface IUser {
        entry: UsersInterface.IUserEntry;
        meta: HatcheryServer.IUserMeta;
        project: Project;
        isLoggedIn: boolean;
    }

    /**
     * The root interface for the application store
     */
    export interface IStore {
        editorState: IEditorState;
        project: IProject;
        user: IUser;
    }
}