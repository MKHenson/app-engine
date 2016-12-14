import { HTMLAttributes } from './attributes';
import { parsers } from './parsers';

/**
 * Describes the types that can be added to calls to jml
 */
export type Children = ( HTMLElement | NodeList | string )[] | HTMLElement | string;

export namespace JML {

/**
 * Creates an element based on the type and attributes defined. If children are supplied they are added
 * to the newly created element.
 *
 * eg:
 *  elm<HTMLAttributes>('div', { className: 'important', style: { marginLeft: '5px' } } )
 *  elm<HTMLAttributes>('div', { className: 'important', style: { marginLeft: '5px' } }, 'Strings are converted to a text node' )
 *  elm<HTMLAttributes>('div', { className: 'important', style: { marginLeft: '5px' } }, new HTMLCanvasElement() )
 */
export function elm<T>( type: string | HTMLElement, attrs?: null | T, children?: Children ): HTMLElement {
    let elm: HTMLElement;

    // Create the element
    if ( typeof type === 'string' )
        elm = document.createElement( type );
    else
        elm = type;

    // Set the attributes if present
    if ( attrs ) {
        for ( let a in attrs )
            if ( parsers[ a ] )
                elm[ a ] = parsers[ a ]( attrs[ a ] );
            else
                elm[ a ] = attrs[ a ];
    }

    // Create a text element if the child is a string
    if ( typeof children === 'string' )
        elm.textContent = children;
    else if ( Array.isArray( children ) ) {

        for ( const child of children )
            if ( typeof( child ) === 'string' ) {
                elm.appendChild( document.createTextNode( child ) );
            }
            else if ( child instanceof HTMLElement ) {
                elm.appendChild( child );
            }
            else {
                for ( const node of child )
                    elm.appendChild( node );
            }
    }
    else if ( children ) {
        elm.appendChild( children );
    }

    return elm;
}

export function a( attrs?: null | HTMLAttributes, children?: Children ) { return elm<HTMLAttributes>( 'a', attrs, children ) as HTMLAnchorElement; }
export function applet( attrs?: null | HTMLAttributes, children?: Children ) { return elm<HTMLAttributes>( 'applet', attrs, children ) as HTMLAppletElement; }
export function area( attrs?: null | HTMLAttributes, children?: Children ) { return elm<HTMLAttributes>( 'area', attrs, children ) as HTMLAreaElement; }
export function audio( attrs?: null | HTMLAttributes, children?: Children ) { return elm<HTMLAttributes>( 'audio', attrs, children ) as HTMLAudioElement; }
export function base( attrs?: null | HTMLAttributes, children?: Children ) { return elm<HTMLAttributes>( 'base', attrs, children ) as HTMLBaseElement; }
export function basefont( attrs?: null | HTMLAttributes, children?: Children ) { return elm<HTMLAttributes>( 'basefont', attrs, children ) as HTMLBaseFontElement; }
export function blockquote( attrs?: null | HTMLAttributes, children?: Children ) { return elm<HTMLAttributes>( 'blockquote', attrs, children ) as HTMLQuoteElement; }
export function body( attrs?: null | HTMLAttributes, children?: Children ) { return elm<HTMLAttributes>( 'body', attrs, children ) as HTMLBodyElement; }
export function br( attrs?: null | HTMLAttributes, children?: Children ) { return elm<HTMLAttributes>( 'br', attrs, children ) as HTMLBRElement; }
export function button( attrs?: null | HTMLAttributes, children?: Children ) { return elm<HTMLAttributes>( 'button', attrs, children ) as HTMLButtonElement; }
export function canvas( attrs?: null | HTMLAttributes, children?: Children ) { return elm<HTMLAttributes>( 'canvas', attrs, children ) as HTMLCanvasElement; }
export function caption( attrs?: null | HTMLAttributes, children?: Children ) { return elm<HTMLAttributes>( 'caption', attrs, children ) as HTMLTableCaptionElement; }
export function col( attrs?: null | HTMLAttributes, children?: Children ) { return elm<HTMLAttributes>( 'col', attrs, children ) as HTMLTableColElement; }
export function colgroup( attrs?: null | HTMLAttributes, children?: Children ) { return elm<HTMLAttributes>( 'colgroup', attrs, children ) as HTMLTableColElement; }
export function datalist( attrs?: null | HTMLAttributes, children?: Children ) { return elm<HTMLAttributes>( 'datalist', attrs, children ) as HTMLDataListElement; }
export function del( attrs?: null | HTMLAttributes, children?: Children ) { return elm<HTMLAttributes>( 'del', attrs, children ) as HTMLModElement; }
export function dir( attrs?: null | HTMLAttributes, children?: Children ) { return elm<HTMLAttributes>( 'dir', attrs, children ) as HTMLDirectoryElement; }
export function div( attrs?: null | HTMLAttributes, children?: Children ) { return elm<HTMLAttributes>( 'div', attrs, children ) as HTMLDivElement; }
export function dl( attrs?: null | HTMLAttributes, children?: Children ) { return elm<HTMLAttributes>( 'dl', attrs, children ) as HTMLDListElement; }
export function embed( attrs?: null | HTMLAttributes, children?: Children ) { return elm<HTMLAttributes>( 'embed', attrs, children ) as HTMLEmbedElement; }
export function fieldset( attrs?: null | HTMLAttributes, children?: Children ) { return elm<HTMLAttributes>( 'fieldset', attrs, children ) as HTMLFieldSetElement; }
export function font( attrs?: null | HTMLAttributes, children?: Children ) { return elm<HTMLAttributes>( 'font', attrs, children ) as HTMLFontElement; }
export function form( attrs?: null | HTMLAttributes, children?: Children ) { return elm<HTMLAttributes>( 'form', attrs, children ) as HTMLFormElement; }
export function frame( attrs?: null | HTMLAttributes, children?: Children ) { return elm<HTMLAttributes>( 'frame', attrs, children ) as HTMLFrameElement; }
export function frameset( attrs?: null | HTMLAttributes, children?: Children ) { return elm<HTMLAttributes>( 'frameset', attrs, children ) as HTMLFrameSetElement; }
export function h1( attrs?: null | HTMLAttributes, children?: Children ) { return elm<HTMLAttributes>( 'h1', attrs, children ) as HTMLHeadingElement; }
export function h2( attrs?: null | HTMLAttributes, children?: Children ) { return elm<HTMLAttributes>( 'h2', attrs, children ) as HTMLHeadingElement; }
export function h3( attrs?: null | HTMLAttributes, children?: Children ) { return elm<HTMLAttributes>( 'h3', attrs, children ) as HTMLHeadingElement; }
export function h4( attrs?: null | HTMLAttributes, children?: Children ) { return elm<HTMLAttributes>( 'h4', attrs, children ) as HTMLHeadingElement; }
export function h5( attrs?: null | HTMLAttributes, children?: Children ) { return elm<HTMLAttributes>( 'h5', attrs, children ) as HTMLHeadingElement; }
export function h6( attrs?: null | HTMLAttributes, children?: Children ) { return elm<HTMLAttributes>( 'h6', attrs, children ) as HTMLHeadingElement; }
export function head( attrs?: null | HTMLAttributes, children?: Children ) { return elm<HTMLAttributes>( 'head', attrs, children ) as HTMLHeadElement; }
export function hr( attrs?: null | HTMLAttributes, children?: Children ) { return elm<HTMLAttributes>( 'hr', attrs, children ) as HTMLHRElement; }
export function html( attrs?: null | HTMLAttributes, children?: Children ) { return elm<HTMLAttributes>( 'html', attrs, children ) as HTMLHtmlElement; }
export function iframe( attrs?: null | HTMLAttributes, children?: Children ) { return elm<HTMLAttributes>( 'iframe', attrs, children ) as HTMLIFrameElement; }
export function img( attrs?: null | HTMLAttributes, children?: Children ) { return elm<HTMLAttributes>( 'img', attrs, children ) as HTMLImageElement; }
export function input( attrs?: null | HTMLAttributes, children?: Children ) { return elm<HTMLAttributes>( 'input', attrs, children ) as HTMLInputElement; }
export function ins( attrs?: null | HTMLAttributes, children?: Children ) { return elm<HTMLAttributes>( 'ins', attrs, children ) as HTMLModElement; }
export function isindex( attrs?: null | HTMLAttributes, children?: Children ) { return elm<HTMLAttributes>( 'isindex', attrs, children ) as HTMLUnknownElement; }
export function label( attrs?: null | HTMLAttributes, children?: Children ) { return elm<HTMLAttributes>( 'label', attrs, children ) as HTMLLabelElement; }
export function legend( attrs?: null | HTMLAttributes, children?: Children ) { return elm<HTMLAttributes>( 'legend', attrs, children ) as HTMLLegendElement; }
export function li( attrs?: null | HTMLAttributes, children?: Children ) { return elm<HTMLAttributes>( 'li', attrs, children ) as HTMLLIElement; }
export function link( attrs?: null | HTMLAttributes, children?: Children ) { return elm<HTMLAttributes>( 'link', attrs, children ) as HTMLLinkElement; }
export function listing( attrs?: null | HTMLAttributes, children?: Children ) { return elm<HTMLAttributes>( 'listing', attrs, children ) as HTMLPreElement; }
export function map( attrs?: null | HTMLAttributes, children?: Children ) { return elm<HTMLAttributes>( 'map', attrs, children ) as HTMLMapElement; }
export function marquee( attrs?: null | HTMLAttributes, children?: Children ) { return elm<HTMLAttributes>( 'marquee', attrs, children ) as HTMLMarqueeElement; }
export function menu( attrs?: null | HTMLAttributes, children?: Children ) { return elm<HTMLAttributes>( 'menu', attrs, children ) as HTMLMenuElement; }
export function meta( attrs?: null | HTMLAttributes, children?: Children ) { return elm<HTMLAttributes>( 'meta', attrs, children ) as HTMLMetaElement; }
export function meter( attrs?: null | HTMLAttributes, children?: Children ) { return elm<HTMLAttributes>( 'meteor', attrs, children ) as HTMLMeterElement; }
export function nextid( attrs?: null | HTMLAttributes, children?: Children ) { return elm<HTMLAttributes>( 'nextid', attrs, children ) as HTMLUnknownElement; }
export function object( attrs?: null | HTMLAttributes, children?: Children ) { return elm<HTMLAttributes>( 'object', attrs, children ) as HTMLObjectElement; }
export function ol( attrs?: null | HTMLAttributes, children?: Children ) { return elm<HTMLAttributes>( 'ol', attrs, children ) as HTMLOListElement; }
export function optgroup( attrs?: null | HTMLAttributes, children?: Children ) { return elm<HTMLAttributes>( 'optgroup', attrs, children ) as HTMLOptGroupElement; }
export function option( attrs?: null | HTMLAttributes, children?: Children ) { return elm<HTMLAttributes>( 'option', attrs, children ) as HTMLOptionElement; }
export function p( attrs?: null | HTMLAttributes, children?: Children ) { return elm<HTMLAttributes>( 'p', attrs, children ) as HTMLParagraphElement; }
export function param( attrs?: null | HTMLAttributes, children?: Children ) { return elm<HTMLAttributes>( 'param', attrs, children ) as HTMLParamElement; }
export function picture( attrs?: null | HTMLAttributes, children?: Children ) { return elm<HTMLAttributes>( 'picture', attrs, children ) as HTMLPictureElement; }
export function pre( attrs?: null | HTMLAttributes, children?: Children ) { return elm<HTMLAttributes>( 'pre', attrs, children ) as HTMLPreElement; }
export function progress( attrs?: null | HTMLAttributes, children?: Children ) { return elm<HTMLAttributes>( 'progress', attrs, children ) as HTMLProgressElement; }
export function q( attrs?: null | HTMLAttributes, children?: Children ) { return elm<HTMLAttributes>( 'q', attrs, children ) as HTMLQuoteElement; }
export function script( attrs?: null | HTMLAttributes, children?: Children ) { return elm<HTMLAttributes>( 'script', attrs, children ) as HTMLScriptElement; }
export function select( attrs?: null | HTMLAttributes, children?: Children ) { return elm<HTMLAttributes>( 'select', attrs, children ) as HTMLSelectElement; }
export function source( attrs?: null | HTMLAttributes, children?: Children ) { return elm<HTMLAttributes>( 'source', attrs, children ) as HTMLSourceElement; }
export function span( attrs?: null | HTMLAttributes, children?: Children ) { return elm<HTMLAttributes>( 'span', attrs, children ) as HTMLSpanElement; }
export function style( attrs?: null | HTMLAttributes, children?: Children ) { return elm<HTMLAttributes>( 'style', attrs, children ) as HTMLStyleElement; }
export function table( attrs?: null | HTMLAttributes, children?: Children ) { return elm<HTMLAttributes>( 'table', attrs, children ) as HTMLTableElement; }
export function tbody( attrs?: null | HTMLAttributes, children?: Children ) { return elm<HTMLAttributes>( 'tbody', attrs, children ) as HTMLTableSectionElement; }
export function td( attrs?: null | HTMLAttributes, children?: Children ) { return elm<HTMLAttributes>( 'td', attrs, children ) as HTMLTableDataCellElement; }
export function template( attrs?: null | HTMLAttributes, children?: Children ) { return elm<HTMLAttributes>( 'template', attrs, children ) as HTMLTemplateElement; }
export function textarea( attrs?: null | HTMLAttributes, children?: Children ) { return elm<HTMLAttributes>( 'textarea', attrs, children ) as HTMLTextAreaElement; }
export function tfoot( attrs?: null | HTMLAttributes, children?: Children ) { return elm<HTMLAttributes>( 'tfoot', attrs, children ) as HTMLTableSectionElement; }
export function th( attrs?: null | HTMLAttributes, children?: Children ) { return elm<HTMLAttributes>( 'th', attrs, children ) as HTMLTableHeaderCellElement; }
export function thead( attrs?: null | HTMLAttributes, children?: Children ) { return elm<HTMLAttributes>( 'thead', attrs, children ) as HTMLTableSectionElement; }
export function title( attrs?: null | HTMLAttributes, children?: Children ) { return elm<HTMLAttributes>( 'title', attrs, children ) as HTMLTitleElement; }
export function tr( attrs?: null | HTMLAttributes, children?: Children ) { return elm<HTMLAttributes>( 'tr', attrs, children ) as HTMLTableRowElement; }
export function track( attrs?: null | HTMLAttributes, children?: Children ) { return elm<HTMLAttributes>( 'track', attrs, children ) as HTMLTrackElement; }
export function ul( attrs?: null | HTMLAttributes, children?: Children ) { return elm<HTMLAttributes>( 'ul', attrs, children ) as HTMLUListElement; }
export function video( attrs?: null | HTMLAttributes, children?: Children ) { return elm<HTMLAttributes>( 'video', attrs, children ) as HTMLVideoElement; }
export function xmp( attrs?: null | HTMLAttributes, children?: Children ) { return elm<HTMLAttributes>( 'xmp', attrs, children ) as HTMLPreElement; }
export function i( attrs?: null | HTMLAttributes, children?: Children ) { return elm<HTMLAttributes>( 'i', attrs, children ) as HTMLElement; }
}