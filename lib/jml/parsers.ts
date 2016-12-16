/**
 * Converts a string from camel case to dash notation
 */
function camelCaseToDash( myStr: string ): string {
    return myStr.replace( /([a-z])([A-Z])/g, '$1-$2' ).toLowerCase();
}

/**
 * A map of parser objects. These parsers are used within the JML.elm calls
 * as a way to map a custom property to a regular HTML attribute. The key of
 * of this object is the html attribute name and its value is a function which
 * is called to parse the custom attribute.
 */
export const parsers: { [ name: string ]: ( val: any ) => any } = {

    'style': ( val ) => {

        let toRet = '';
        for ( let i in val )
            toRet += camelCaseToDash( i ) + ':' + val[ i ] + ';';

        return toRet;
    }
};