namespace Animate {

    export type ProjectActionType =
        'NEW_PROJECT' |
        'OPEN_PROJECT';

    export interface IProjectAction extends Redux.Action {
        type: ProjectActionType;
    };

    export function createProject( projectData ) {
        return ( dispatch: Redux.Dispatch<IProjectAction>, getState: () => IProjectAction ) => {
                Utils.post( 'new-project', projectData ).then((response) => {
                    const type = getState().type;
                    dispatch( { type: 'NEW_PROJECT' } );
                }).catch((error) => {

                });
            }
    }
}