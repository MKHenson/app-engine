import { ValidationType, ValidationErrorType, PropertyType } from '../setup/enums';
import { Prop } from './properties/prop';
import { PropAsset } from './properties/prop-asset';
import { PropGroup } from './properties/prop-group';
import { PropNum } from './properties/prop-num';
import { PropObject } from './properties/prop-object';
import { PropAssetList } from './properties/prop-asset-list';
import { PropColor } from './properties/prop-color';
import { PropEnum } from './properties/prop-enum';
import { PropFileResource } from './properties/prop-file-resource';
import { PropBool, PropText } from './properties/prop';

export interface IAjaxError { message: string; status: number; };

const _withCredentials: boolean = true;
let shallowIds: number = 0;

/**
 * Initializes the utils static variables
 */
export type Validator = { regex: RegExp, name: string, negate: boolean; message: string; type: ValidationType; };
export let validators: { [ type: number ]: Validator } = {};
validators[ ValidationType.ALPHANUMERIC ] = { regex: /^[a-z0-9]+$/i, name: 'alpha-numeric', negate: false, message: 'Only alphanumeric characters accepted', type: ValidationType.ALPHANUMERIC };
validators[ ValidationType.NOT_EMPTY ] = { regex: /\S/, name: 'non-empty', negate: false, message: 'Cannot be empty', type: ValidationType.NOT_EMPTY };
validators[ ValidationType.ALPHANUMERIC_PLUS ] = { regex: /^[a-zA-Z0-9_\-!]+$/, name: 'alpha-numeric-plus', negate: false, message: 'Only alphanumeric, \'_\', \'-\' and \'!\' characters accepted', type: ValidationType.ALPHANUMERIC_PLUS };
validators[ ValidationType.EMAIL ] = { regex: /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i, name: 'email', negate: false, message: 'Email format not accepted', type: ValidationType.EMAIL };
validators[ ValidationType.NO_HTML ] = { regex: /(<([^>]+)>)/ig, name: 'no-html', negate: true, message: 'HTML is not allowed', type: ValidationType.NO_HTML };
validators[ ValidationType.ALPHA_EMAIL ] = { regex: /^[a-zA-Z0-9_\-!@\.]+$/, name: 'email-plus', negate: false, message: 'Only alphanumeric, \'_\', \'-\', \'@\' and \'!\' characters accepted', type: ValidationType.ALPHA_EMAIL };

/**
 * An error for use when there is a validation problem
 */
export class ValidationError extends Error {
    public code: ValidationErrorType;
    constructor( message: string, code: ValidationErrorType ) {
        super( message );
        this.code = code;
    }
}

/**
 * Checks a string to see if there is a validation error
 * @param val The string to check
 * @param validator The type of validations to check
 */
export function checkValidation( val: string, validator: ValidationType ): Validator | null {
    let v: Validator;

    for ( let i in ValidationType ) {
        if ( !isNaN( parseInt( i ) ) )
            continue;

        if ( ( validator & ValidationType[ i as string ] ) & ValidationType[ i as string ] ) {
            v = validators[ ValidationType[ i as string ] ];
            let match = val.match( v.regex );

            if ( v.negate ) {
                if ( match ) {
                    return v;
                }
            }

            if ( !v.negate ) {
                if ( !match ) {
                    return v;
                }
            }
        }
    }

    return null;
}

/**
 * Returns a formatted byte string
 */
export function byteFilter( bytes: number | string, precision: number = 1 ): string {
    if ( isNaN( parseFloat( bytes as string ) ) || !isFinite( bytes as number ) ) return '-';
    const units = [ 'bytes', 'kB', 'MB', 'GB', 'TB', 'PB' ],
        num = Math.floor( Math.log( bytes as number ) / Math.log( 1024 ) );
    return ( bytes as number / Math.pow( 1024, Math.floor( num ) ) ).toFixed( precision ) + ' ' + units[ num ];
}

/**
* Generates a new shallow Id - an id that is unique only to this local session
* @param reference Pass a reference id to make sure the one generated is still valid. Any ID that's imported can potentially offset this counter.
*/
export function generateLocalId( reference?: number ): number {
    // Make sure the ID is always really high - i.e. dont allow for duplicates
    if ( reference !== undefined && reference > shallowIds ) {
        shallowIds = reference + 1;
        return reference;
    }
    else if ( reference !== undefined )
        return reference;

    shallowIds++;
    return shallowIds;
}

/**
 * Capitalizes the first character of a string
 */
export function capitalize( str: string ): string {
    return str.charAt( 0 ).toUpperCase() + str.slice( 1 );
}

/**
* A predefined shorthand method for calling put methods that use JSON communication
*/
export function post<T>( url: string, data: any ): Promise<T> {
    return new Promise<T>( function( resolve, reject ) {
        const xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if ( xhttp.readyState === 4 ) {
                if ( xhttp.status === 200 ) {
                    const json = JSON.parse( xhttp.responseText );
                    return resolve( json );
                }
                else
                    return reject( <IAjaxError>{ message: xhttp.statusText, status: xhttp.status });
            }
        };

        xhttp.open( 'POST', url, true );

        let str;
        if ( data ) {
            str = JSON.stringify( data );
            xhttp.setRequestHeader( 'Content-type', 'application/json; charset=utf-8' );
        }

        xhttp.withCredentials = _withCredentials;
        xhttp.send( str );

    });
}

/**
* A predefined shorthand method for calling put methods that use JSON communication
*/
export function get<T>( url: string ): Promise<T> {
    return new Promise<T>( function( resolve, reject ) {
        const xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if ( xhttp.readyState === 4 ) {
                if ( xhttp.status === 200 ) {
                    const json = JSON.parse( xhttp.responseText );
                    return resolve( json );
                }
                else
                    return reject( <IAjaxError>{ message: xhttp.statusText, status: xhttp.status });
            }
        };

        xhttp.open( 'GET', url, true );
        xhttp.withCredentials = _withCredentials;
        xhttp.send();
    });
}

/**
* A predefined shorthand method for calling put methods that use JSON communication
*/
export function put<T>( url: string, data: any ): Promise<T> {
    return new Promise<T>( function( resolve, reject ) {
        const xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if ( xhttp.readyState === 4 ) {
                if ( xhttp.status === 200 ) {
                    const json = JSON.parse( xhttp.responseText );
                    return resolve( json );
                }
                else
                    return reject( <IAjaxError>{ message: xhttp.statusText, status: xhttp.status });
            }
        };


        xhttp.open( 'PUT', url, true );

        let str;
        if ( data ) {
            str = JSON.stringify( data );
            xhttp.setRequestHeader( 'Content-type', 'application/json; charset=utf-8' );
        }

        xhttp.withCredentials = _withCredentials;
        xhttp.send( str );

    });
}

/**
* A predefined shorthand method for calling deleta methods that use JSON communication
*/
export function del<T>( url: string, data?: any ): Promise<T> {
    return new Promise<T>( function( resolve, reject ) {
        const xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if ( xhttp.readyState === 4 ) {
                if ( xhttp.status === 200 ) {
                    const json = JSON.parse( xhttp.responseText );
                    return resolve( json );
                }
                else
                    return reject( <IAjaxError>{ message: xhttp.statusText, status: xhttp.status });
            }
        };

        xhttp.open( 'DELETE', url, true );

        let str;
        if ( data ) {
            str = JSON.stringify( data );
            xhttp.setRequestHeader( 'Content-type', 'application/json; charset=utf-8' );
        }

        xhttp.withCredentials = _withCredentials;
        xhttp.send( str );

    });
}

/**
* Creates a new property based on the dataset provided
* @param type The type of property to create
*/
export function createProperty( name: string, type: PropertyType ): Prop<any> | null {
    let prop: Prop<any> | null = null;
    switch ( type ) {
        case PropertyType.ASSET:
            prop = new PropAsset( name, null );
            break;
        case PropertyType.ASSET_LIST:
            prop = new PropAssetList( name, null, [] );
            break;
        case PropertyType.BOOL:
            prop = new PropBool( name, false );
            break;
        case PropertyType.ENUM:
            prop = new PropEnum( name, '', [] );
            break;
        case PropertyType.FILE:
            prop = new PropFileResource( name, null, null );
            break;
        case PropertyType.COLOR:
            prop = new PropColor( name, 0xffffff, 1 );
            break;
        case PropertyType.GROUP:
            prop = new PropGroup( name, null );
            break;
        // TODO: We dont have hidden props yet
        case PropertyType.HIDDEN:
            break;
        // TODO: We dont have hidden props yet
        case PropertyType.HIDDEN_FILE:
            break;
        case PropertyType.NUMBER:
            prop = new PropNum( name, 0 );
            break;
        case PropertyType.OBJECT:
            prop = new PropObject( name, null );
            break;
        // TODO: We dont have objecy props yet
        case PropertyType.OPTIONS:
            break;
        case PropertyType.STRING:
            prop = new PropText( name, '' );
            break;
    }

    return prop;
}

/**
 * Gets the relative position of the mouse to the given element
 * @param e
 * @param elm The target element
 */
export function getRelativePos( e: React.MouseEvent | MouseEvent, elm: HTMLElement ): HatcheryEditor.Point {
    let offsetX = elm.offsetLeft;
    let offsetY = elm.offsetTop;
    let scrollX = elm.scrollLeft;
    let scrollY = elm.scrollTop;
    let ref = elm.offsetParent as HTMLElement;

    while ( ref ) {
        offsetX += ref.offsetLeft;
        offsetY += ref.offsetTop;
        scrollX += ref.scrollLeft;
        scrollY += ref.scrollTop;
        ref = ref.offsetParent as HTMLElement;
    }

    const mouse = { x: e.pageX - offsetX, y: e.pageY - offsetY };
    const x = mouse.x + scrollX;
    const y = mouse.y + scrollY;
    return { x: x, y: y };
}

/**
 * Gets a quadratically eased in/out value
 * @param startValue The initial value
 * @param delta The difference between the start value and its target
 * @param curTime Between 0 and duration
 * @param duration The total time
 */
export function quadInOut( startValue, delta, curTime, duration ): number {
    curTime /= duration / 2;
    if ( curTime < 1 ) return delta / 2 * curTime * curTime + startValue;
    curTime--;
    return -delta / 2 * ( curTime * ( curTime - 2 ) - 1 ) + startValue;
};

/**
 * Scrolls an element to the destination x and y for a given duration
 * @param dest The target X & Y coordinates
 * @param elm The element to scroll
 * @param duration The total amount of time to take to scroll
 * @return Returns setInterval
 */
export function scrollTo( dest: HatcheryEditor.Point, elm: HTMLElement, duration: number ): number {
    let curTime = 0;
    let left = 0;
    let top = 0;
    const tick = 15;
    const startX = elm.scrollLeft;
    const startY = elm.scrollTop;
    const deltaX = dest.x - elm.scrollLeft;
    const deltaY = dest.y - elm.scrollTop;
    let scrollInterval = window.setInterval(() => {
        curTime += tick;
        left = this.quadInOut( startX, deltaX, curTime, duration );
        top = this.quadInOut( startY, deltaY, curTime, duration );
        if ( curTime > duration )
            clearInterval( scrollInterval );

        elm.scrollLeft = left;
        elm.scrollTop = top;
    }, tick );

    return scrollInterval;
}

/**
* Use this function to check if a value contains characters that break things.
* @param text The text to check
* @param allowSpace If this is true, empty space will be allowed
* @returns Returns null or string. If it returns null then everything is fine. Otherwise a message is returned with what's wrong.
*/
export function checkForSpecialChars( text: string, allowSpace: boolean = false ): string | null {
    if ( allowSpace === false && jQuery.trim( text ) === '' )
        return 'Text cannot be an empty string';

    let boxText: string = text;
    const origLength: number = boxText.length;
    boxText = boxText.replace( /[^a-zA-Z 0-9'!£$&+-=_]+/g, '' );
    if ( boxText.length !== origLength )
        return 'Please enter safe characters. We do not allow for HTML type characters.';

    return null;
}

/**
 * Tells us if a string is a valid email address
 */
export function validateEmail( email: string ): boolean {
    const re = /^(([^<>()[\]\\.,;:\s@\']+(\.[^<>()[\]\\.,;:\s@\']+)*)|(\'.+\'))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test( email );
}


/**
 * Returns the class name of the argument or undefined if
 * it's not a valid JavaScript object.
 */
export function getObjectClass( obj ): any {
    if ( obj && obj.constructor && obj.constructor.toString ) {
        const arr = obj.constructor.toString().match( /function\s*(\w+)/ );
        if ( arr && arr.length === 2 )
            return arr[ 1 ];
    }

    return undefined;
}

/**
 * A helper function that processes all promises with an optional callback for when each returns a result
 */
export function all<Y>( promises: Promise<Y>[], progress: ( item: Y, progress: number ) => void ): Promise<Y[]> {
    return new Promise<Y[]>( function( resolve, reject ) {
        const total = promises.length;
        let numLoaded = 0;
        let failed = false;
        const results: Y[] = [];

        promises.forEach(( promise, index ) => {

            if ( failed )
                return;

            promise.then(( item ) => {
                numLoaded++;
                results[ index ] = item;
                progress( item, ( numLoaded / total ) * 100 );

                if ( numLoaded === total )
                    resolve( results );

            }).catch(( error ) => {
                failed = true;
                reject( error );
            });
        });
    });
}