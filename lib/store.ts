function createThunkMiddleware(extraArgument?) : any {
    return ({ dispatch, getState }) => next => action => {
        if (typeof action === 'function') {
        return action(dispatch, getState, extraArgument);
        }

        return next(action);
    };
}

const thunk = createThunkMiddleware();
thunk.withExtraArgument = createThunkMiddleware;

const store = Redux.createStore( reducers, thunk );
store.subscribe(() => {
    console.log( "store changed", store.getState() )
});

// store.dispatch(
//     (dispatch, getState) => {
//         const todos: string[] = getState().todos;
//         dispatch({type: 'ADD_TODO'})
//     }
// )