const userReducer: Redux.Reducer<any> = ( state = { name: '', age: 0 }, action: Redux.Action ) => {
    if ( action.type === "CHANGE_NAME" )
        return Object.assign({}, { name: (action as any).value });
    else if ( action.type === "CHANGE_AGE" )
        return Object.assign({}, { age: (action as any).value });

    return state;
}

const tweetReducer: Redux.Reducer<any> = ( state = [], action: Redux.Action ) => {
    if ( action.type === "ADD_TWEET" )
        return state.concat( (action as any).value );

    return state;
}

const reducers = Redux.combineReducers({
    user: userReducer,
    tweets: tweetReducer
})