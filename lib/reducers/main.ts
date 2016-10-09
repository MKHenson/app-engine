namespace Animate {

    const userReducer: Redux.Reducer<any> = ( state = { name: '', age: 0 }, action: Redux.Action ) => {
        if ( action.type === "CHANGE_NAME" )
            return Object.assign({}, { name: (action as any).value });
        else if ( action.type === "CHANGE_AGE" )
            return Object.assign({}, { age: (action as any).value });

        return state;
    }

    const reducers = Redux.combineReducers({
        user: userReducer,
        project: projectReducer
    })
}