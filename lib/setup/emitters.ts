// /**
//  * typescript@1.8.10
//  * these TS helpers are taken from tsc.js#26682
//  * function emitFiles(resolver, host, targetSourceFile) { ... }
//  *
//  * This file should be imported as the first file.
//  * It should only be included if --noEmitHelpers is set to true.
//  * These functions would be included in each subsequent file if noEmitHelpers was false.
//  * When true, they do not exist and so have to be added manually.
//  */

// declare const WorkerGlobalScope: any;
// declare const Reflect: any;

// function __assignFn( t ) {
//     for ( let s, i = 1, n = arguments.length; i < n; i++ ) {
//         s = arguments[ i ];
//         for ( const p in s ) if ( Object.prototype.hasOwnProperty.call( s, p ) )
//             t[ p ] = s[ p ];
//     }
//     return t;
// }

// function __extendsFn( d, b ) {
//     for ( const p in b ) if ( b.hasOwnProperty( p ) ) d[ p ] = b[ p ];
//     function __() { this.constructor = d; }
//     d.prototype = b === null ? Object.create( b ) : ( __.prototype = b.prototype, new __() );
// }

// function __decorateFn( decorators, target, key, desc ) {
//     let c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor( target, key ) : desc, d;
//     if ( typeof Reflect === 'object' && typeof Reflect.decorate === 'function' ) r = Reflect.decorate( decorators, target, key, desc );
//     else for ( let i = decorators.length - 1; i >= 0; i-- ) if ( d = decorators[ i ] ) r = ( c < 3 ? d( r ) : c > 3 ? d( target, key, r ) : d( target, key ) ) || r;
//     return c > 3 && r && Object.defineProperty( target, key, r ), r;
// }

// function __metadataFn( k, v ) {
//     if ( typeof Reflect === 'object' && typeof Reflect.metadata === 'function' ) return Reflect.metadata( k, v );
// }
// function __paramFn( paramIndex, decorator ) {
//     return function( target, key ) { decorator( target, key, paramIndex ); }
// }
// function __awaiterFn( thisArg, _arguments, P, generator ) {
//     return new ( P || ( P = Promise ) )( function( resolve, reject ) {
//         function fulfilled( value ) { try { step( generator.next( value ) ); } catch ( e ) { reject( e ); } }
//         function rejected( value ) { try { step( generator.throw( value ) ); } catch ( e ) { reject( e ); } }
//         function step( result ) { result.done ? resolve( result.value ) : new P( function( resolve ) { resolve( result.value ); }).then( fulfilled, rejected ); }
//         step(( generator = generator.apply( thisArg, _arguments ) ).next() );
//     });
// }

// // hook global helpers
// ( function( __global: any ) {

//     __global.__assign = ( __global && __global.__assign ) || Object.assign || __assignFn;
//     __global.__extends = ( __global && __global.__extends ) || __extendsFn;
//     __global.__decorate = ( __global && __global.__decorate ) || __decorateFn;
//     __global.__metadata = ( __global && __global.__metadata ) || __metadataFn;
//     __global.__param = ( __global && __global.__param ) || __paramFn;
//     __global.__awaiter = ( __global && __global.__awaiter ) || __awaiterFn;

// })(
//     typeof window !== 'undefined' ? window :
//         typeof WorkerGlobalScope !== 'undefined' ? self :
//             typeof global !== 'undefined' ? global :
//                 Function( 'return this;' )() );