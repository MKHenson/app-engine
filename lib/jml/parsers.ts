


/**
 * Converts a string from camel case to dash notation
 */
function camelCaseToDash( myStr: string ): string {
    return myStr.replace( /([a-z])([A-Z])/g, '$1-$2' ).toLowerCase();
}

/**
 * Describes custom attribute parsers
 */
export const parsers: { [ name: string ]: ( val: any ) => any } = {

    'style': ( val ) => {

        let toRet = '';
        for ( let i in val )
            toRet += camelCaseToDash( i ) + ':' + val[ i ] + ';';

        return toRet;
    }
};