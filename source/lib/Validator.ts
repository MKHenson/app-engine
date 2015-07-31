// Based on https://github.com/chriso/validator.js/blob/master/validator.js

'use strict';

var email : RegExp = /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i;

var creditCard : RegExp = /^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6(?:011|5[0-9][0-9])[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\d{3})\d{11})$/;

var isbn10Maybe : RegExp = /^(?:[0-9]{9}X|[0-9]{10})$/
	, isbn13Maybe = /^(?:[0-9]{13})$/;

var ipv4Maybe: RegExp = /^(\d?\d?\d)\.(\d?\d?\d)\.(\d?\d?\d)\.(\d?\d?\d)$/
	, ipv6 = /^::|^::1|^([a-fA-F0-9]{1,4}::?){1,7}([a-fA-F0-9]{1,4})$/;

var uuid = {
	'3': /^[0-9A-F]{8}-[0-9A-F]{4}-3[0-9A-F]{3}-[0-9A-F]{4}-[0-9A-F]{12}$/i
	, '4': /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i
	, '5': /^[0-9A-F]{8}-[0-9A-F]{4}-5[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i
	, all: /^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/i
};

var alpha: RegExp = /^[a-zA-Z]+$/
	, alphanumeric: RegExp = /^[a-zA-Z0-9]+$/
	, safeCharacters: RegExp = /^[a-zA-Z0-9_!@£$ ]+$/
	, numeric: RegExp = /^-?[0-9]+$/
	, int: RegExp = /^(?:-?(?:0|[1-9][0-9]*))$/
	, float: RegExp = /^(?:-?(?:[0-9]+))?(?:\.[0-9]*)?(?:[eE][\+\-]?(?:[0-9]+))?$/
	, hexadecimal: RegExp = /^[0-9a-fA-F]+$/
	, hexcolor: RegExp = /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

var ascii: RegExp = /^[\x00-\x7F]+$/
	, multibyte: RegExp= /[^\x00-\x7F]/
	, fullWidth: RegExp = /[^\u0020-\u007E\uFF61-\uFF9F\uFFA0-\uFFDC\uFFE8-\uFFEE0-9a-zA-Z]/
	, halfWidth: RegExp= /[\u0020-\u007E\uFF61-\uFF9F\uFFA0-\uFFDC\uFFE8-\uFFEE0-9a-zA-Z]/;

var surrogatePair: RegExp = /[\uD800-\uDBFF][\uDC00-\uDFFF]/;

export function toString( input : any )
{
	if ( typeof input === 'object' && input !== null && input.toString )
	{
		input = input.toString();
	} else if ( input === null || typeof input === 'undefined' || ( isNaN( input ) && !input.length ) )
	{
		input = '';
	} else if ( typeof input !== 'string' )
	{
		input += '';
	}
	return input;
};

export function toDate( date : any ) : Date
{
	if ( Object.prototype.toString.call( date ) === '[object Date]' )
	{
		return date;
	}

	date = Date.parse( date );
	return !isNaN( date ) ? new Date( date ) : null;
};

export function toFloat( str: string ) : number
{
	return parseFloat( str );
};

export function toInt( str: string, radix?: number ): number
{
	return parseInt( str, radix || 10 );
};

export function toBoolean( str: string, strict: boolean ): boolean
{
	if ( strict )
	{
		return str === '1' || str === 'true';
	}
	return str !== '0' && str !== 'false' && str !== '';
};

export function equals( str: string, comparison : any ): boolean
{
	return str === toString( comparison );
};

export function contains( str: string, elem: any ): boolean
{
	return str.indexOf( toString( elem ) ) >= 0;
};

export function matches( str : any, pattern: any, modifiers : string ): boolean
{
	if ( Object.prototype.toString.call( pattern ) !== '[object RegExp]' )
	{
		pattern = new RegExp( pattern, modifiers );
	}
	return pattern.test( str );
};

export function isEmail( str: string ): boolean
{
	return email.test( str );
};

var default_url_options = {
	protocols: ['http', 'https', 'ftp']
	, require_tld: true
	, require_protocol: false
};

export function isURL( str: string, options: any ): boolean
{
	if ( !str || str.length >= 2083 )
	{
		return false;
	}
	options = merge( options, default_url_options );
	var url = new RegExp( '^(?!mailto:)(?:(?:' + options.protocols.join( '|' ) + ')://)' + ( options.require_protocol ? '' : '?' ) + '(?:\\S+(?::\\S*)?@)?(?:(?:(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}(?:\\.(?:[0-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))|(?:(?:www.)?xn--)?(?:(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)(?:\\.(?:[a-z\\u00a1-\\uffff0-9]+-?)*[a-z\\u00a1-\\uffff0-9]+)*(?:\\.(?:[a-z\\u00a1-\\uffff]{2,}))' + ( options.require_tld ? '' : '?' ) + ')|localhost)(?::(\\d{1,5}))?(?:(?:/|\\?|#)[^\\s]*)?$', 'i' );
	var match = str.match( url )
		, port = match ? parseInt( match[1] ) : 0;
	return match && ( !port || ( port > 0 && port <= 65535 ) );
};

export function isIP( str: string, version: number ): boolean
{
	version = toString( version );
	if ( !version )
	{
		return isIP( str, 4 ) || isIP( str, 6 );
	}
	else if ( version === 4 )
	{
		if ( !ipv4Maybe.test( str ) )
		{
			return false;
		}
		var parts = str.split( '.' ).sort();
		return parseInt( parts[3]) <= 255;
	}
	return version === 6 && ipv6.test( str );
};

export function isAlpha( str: string ): boolean
{
	return alpha.test( str );
};

export function isAlphanumeric( str: string ): boolean
{
	return alphanumeric.test( str );
};

export function isSafeCharacters( str: string ): boolean
{
	return safeCharacters.test( str );
};

export function isNumeric( str: string ): boolean
{
	return numeric.test( str );
};

export function isHexadecimal( str: string ): boolean
{
	return hexadecimal.test( str );
};

export function isHexColor( str: string ): boolean
{
	return hexcolor.test( str );
};

export function isLowercase( str: string ): boolean
{
	return str === str.toLowerCase();
};

export function isUppercase( str: string ): boolean
{
	return str === str.toUpperCase();
};

export function isInt( str: string ): boolean
{
	return int.test( str );
};

export function isFloat( str: string ): boolean
{
	return str !== '' && float.test( str );
};

export function isDivisibleBy( str: string, num: number ): boolean
{
	return toFloat( str ) %  num === 0;
};

export function isNull( str: string ): boolean
{
	return str.length === 0;
};

export function isLength( str: string, min: number, max: number ): boolean
{
	var surrogatePairs = str.match( /[\uD800-\uDBFF][\uDC00-\uDFFF]/g ) || [];
	var len = str.length - surrogatePairs.length;
	return len >= min && ( typeof max === 'undefined' || len <= max );
};

export function isValidObjectID( str : string ) : boolean
{
	// coerce to string so the function can be generically used to test both strings and native objectIds created by the driver
	str = str.trim() + '';
	var len = str.length, valid = false;
	if ( len == 12 || len == 24 )
	{
		valid = /^[0-9a-fA-F]+$/.test( str );
	}



	return valid;
}

export function isByteLength( str: string, min: number, max: number ): boolean
{
	return str.length >= min && ( typeof max === 'undefined' || str.length <= max );
};

export function isUUID( str: string, version: string ): boolean
{
	var pattern = uuid[version ? version : 'all'];
	return pattern && pattern.test( str );
};

export function isDate( str: string ): boolean
{
	return !isNaN( Date.parse( str ) );
};

export function isAfter( str: string, date : any ): boolean
{
	var comparison = toDate( date || new Date() )
		, original = toDate( str );
	return original && comparison && original > comparison;
};

export function isBefore( str: string, date : any ): boolean
{
	var comparison = toDate( date || new Date() )
		, original = toDate( str );
	return original && comparison && original < comparison;
};

export function isIn( str: string, options: any ): boolean
{
	if ( !options || typeof options.indexOf !== 'function' )
	{
		return false;
	}
	if ( Object.prototype.toString.call( options ) === '[object Array]' )
	{
		var array = [];
		for ( var i = 0, len = options.length; i < len; i++ )
		{
			array[i] = toString( options[i] );
		}
		options = array;
	}
	return options.indexOf( str ) >= 0;
};

export function isCreditCard( str: any ): boolean
{
	var sanitized = str.replace( /[^0-9]+/g, '' );
	if ( !creditCard.test( sanitized ) )
	{
		return false;
	}
	var sum = 0, digit, tmpNum, shouldDouble;
	for ( var i = sanitized.length - 1; i >= 0; i-- )
	{
		digit = sanitized.substring( i, ( i + 1 ) );
		tmpNum = parseInt( digit, 10 );
		if ( shouldDouble )
		{
			tmpNum *= 2;
			if ( tmpNum >= 10 )
			{
				sum += ( ( tmpNum % 10 ) + 1 );
			} else
			{
				sum += tmpNum;
			}
		} else
		{
			sum += tmpNum;
		}
		shouldDouble = !shouldDouble;
	}
	return ( sum % 10 ) === 0 ? sanitized : false;
};

export function isISBN( str: any, version: any ): boolean
{
	version = toString( version );
	if ( !version )
	{
		return isISBN( str, 10 ) || isISBN( str, 13 );
	}
	var sanitized = str.replace( /[\s-]+/g, '' )
		, checksum = 0, i;
	if ( version === '10' )
	{
		if ( !isbn10Maybe.test( sanitized ) )
		{
			return false;
		}
		for ( i = 0; i < 9; i++ )
		{
			checksum += ( i + 1 ) * sanitized.charAt( i );
		}
		if ( sanitized.charAt( 9 ) === 'X' )
		{
			checksum += 10 * 10;
		} else
		{
			checksum += 10 * sanitized.charAt( 9 );
		}
		if ( ( checksum % 11 ) === 0 )
		{
			return sanitized;
		}
	} else if ( version === '13' )
	{
		if ( !isbn13Maybe.test( sanitized ) )
		{
			return false;
		}
		var factor = [1, 3];
		for ( i = 0; i < 12; i++ )
		{
			checksum += factor[i % 2] * sanitized.charAt( i );
		}
		if ( sanitized.charAt( 12 ) - ( ( 10 - ( checksum % 10 ) ) % 10 ) === 0 )
		{
			return sanitized;
		}
	}
	return false;
};

export function isJSON( str: string ): boolean
{
	try
	{
		JSON.parse( str );
	} catch ( e )
	{
		return false;
	}
	return true;
};

export function isMultibyte( str: string): boolean
{
	return multibyte.test( str );
};

export function isAscii( str: string ): boolean
{
	return ascii.test( str );
};

export function isFullWidth( str: string): boolean
{
	return fullWidth.test( str );
};

export function isHalfWidth( str: string ): boolean
{
	return halfWidth.test( str );
};

export function isVariableWidth( str: string ): boolean
{
	return fullWidth.test( str ) && halfWidth.test( str );
};

export function isSurrogatePair( str: string ): boolean
{
	return surrogatePair.test( str );
};

export function ltrim( str: string, chars? : RegExp ): string
{
	var pattern = chars ? new RegExp( '^[' + chars + ']+', 'g' ) : /^\s+/g;
	return str.replace( pattern, '' );
};

export function rtrim( str: string, chars?: RegExp ): string
{
	var pattern = chars ? new RegExp( '[' + chars + ']+$', 'g' ) : /\s+$/g;
	return str.replace( pattern, '' );
};

export function trim( str: string, chars?: RegExp ): string
{
	var pattern = chars ? new RegExp( '^[' + chars + ']+|[' + chars + ']+$', 'g' ) : /^\s+|\s+$/g;
	return str.replace( pattern, '' );
};

export function escape( str: string ): string
{
	return ( str.replace( /&/g, '&amp;' )
		.replace( /"/g, '&quot;' )
		.replace( /</g, '&lt;' )
		.replace( />/g, '&gt;' ) );
};

export function stripLow( str: string, keep_new_lines: boolean): string
{
	var chars = keep_new_lines ? '\x00-\x09\x0B\x0C\x0E-\x1F\x7F' : '\x00-\x1F\x7F';
	return blacklist( str, chars );
};

export function whitelist( str: string, chars: string ): string
{
	return str.replace( new RegExp( '[^' + chars + ']+', 'g' ), '' );
};

export function blacklist( str: string, chars: string ): string
{
	return str.replace( new RegExp( '[' + chars + ']+', 'g' ), '' );
};

function merge( obj : any, defaults : any ):any 
{
	obj = obj || {};
	for ( var key in defaults )
	{
		if ( typeof obj[key] === 'undefined' )
		{
			obj[key] = defaults[key];
		}
	}
	return obj;
}