namespace Animate {

    /**
     * Describes each of the project action types
     */
    export type ProjectActionType =
        'NEW_PROJECT' |
        'OPEN_PROJECT';

    /**
     * A base interface for describing project related actions
     */
    export interface IProjectAction extends Redux.Action {
        type: ProjectActionType;
    };

    /**
     * Creates a new project in the backend, and dispatches an event on its success or failure
     */
    export function createProject( projectData ) {
        return ( dispatch: Redux.Dispatch<IProjectAction>, getState: () => IProjectAction ) => {
            Utils.post( 'new-project', projectData ).then(( response ) => {
                const type = getState().type;
                dispatch( { type: 'NEW_PROJECT' });
            }).catch(( error ) => {

            });
        }
    }
}