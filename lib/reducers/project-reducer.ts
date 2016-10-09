namespace Animate {

        export function projectReducer( state: any, action: IProjectAction ) {

            switch ( action.type ) {
                case 'NEW_PROJECT':
                    return Object.assign({}, { name: (action as any).value });
                case 'OPEN_PROJECT':
                    return Object.assign({}, { name: (action as any).value });
            }
        }
}