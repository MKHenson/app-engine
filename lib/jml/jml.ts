import { HTMLAttributes } from './attributes';
import { parsers } from './parsers';

/**
 * Describes the types that can be added to calls to jml
 */
export type Children = ( HTMLElement | NodeList )[] | HTMLElement | string;

/**
 * Creates an element based on the type and attributes defined. If children are supplied they are added
 * to the newly created element.
 *
 * eg:
 *  elm('div', { className: 'important', style: { marginLeft: '5px' } } )
 *  elm('div', { className: 'important', style: { marginLeft: '5px' } }, 'Strings are converted to a text node' )
 *  elm('div', { className: 'important', style: { marginLeft: '5px' } }, new HTMLCanvasElement() )
 */
export function elm( type: string | HTMLElement, attrs?: null | HTMLAttributes, children?: Children ): HTMLElement {
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
            if ( child instanceof HTMLElement ) {
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

export function a( attrs?: null | HTMLAttributes, children?: Children ) { return elm( 'a', attrs, children ) as HTMLAnchorElement; }
export function applet( attrs?: null | HTMLAttributes, children?: Children ) { return elm( 'applet', attrs, children ) as HTMLAppletElement; }
export function area( attrs?: null | HTMLAttributes, children?: Children ) { return elm( 'area', attrs, children ) as HTMLAreaElement; }
export function audio( attrs?: null | HTMLAttributes, children?: Children ) { return elm( 'audio', attrs, children ) as HTMLAudioElement; }
export function base( attrs?: null | HTMLAttributes, children?: Children ) { return elm( 'base', attrs, children ) as HTMLBaseElement; }
export function basefont( attrs?: null | HTMLAttributes, children?: Children ) { return elm( 'basefont', attrs, children ) as HTMLBaseFontElement; }
export function blockquote( attrs?: null | HTMLAttributes, children?: Children ) { return elm( 'blockquote', attrs, children ) as HTMLQuoteElement; }
export function body( attrs?: null | HTMLAttributes, children?: Children ) { return elm( 'body', attrs, children ) as HTMLBodyElement; }
export function br( attrs?: null | HTMLAttributes, children?: Children ) { return elm( 'br', attrs, children ) as HTMLBRElement; }
export function button( attrs?: null | HTMLAttributes, children?: Children ) { return elm( 'button', attrs, children ) as HTMLButtonElement; }
export function canvas( attrs?: null | HTMLAttributes, children?: Children ) { return elm( 'canvas', attrs, children ) as HTMLCanvasElement; }
export function caption( attrs?: null | HTMLAttributes, children?: Children ) { return elm( 'caption', attrs, children ) as HTMLTableCaptionElement; }
export function col( attrs?: null | HTMLAttributes, children?: Children ) { return elm( 'col', attrs, children ) as HTMLTableColElement; }
export function colgroup( attrs?: null | HTMLAttributes, children?: Children ) { return elm( 'colgroup', attrs, children ) as HTMLTableColElement; }
export function datalist( attrs?: null | HTMLAttributes, children?: Children ) { return elm( 'datalist', attrs, children ) as HTMLDataListElement; }
export function del( attrs?: null | HTMLAttributes, children?: Children ) { return elm( 'del', attrs, children ) as HTMLModElement; }
export function dir( attrs?: null | HTMLAttributes, children?: Children ) { return elm( 'dir', attrs, children ) as HTMLDirectoryElement; }
export function div( attrs?: null | HTMLAttributes, children?: Children ) { return elm( 'div', attrs, children ) as HTMLDivElement; }
export function dl( attrs?: null | HTMLAttributes, children?: Children ) { return elm( 'dl', attrs, children ) as HTMLDListElement; }
export function embed( attrs?: null | HTMLAttributes, children?: Children ) { return elm( 'embed', attrs, children ) as HTMLEmbedElement; }
export function fieldset( attrs?: null | HTMLAttributes, children?: Children ) { return elm( 'fieldset', attrs, children ) as HTMLFieldSetElement; }
export function font( attrs?: null | HTMLAttributes, children?: Children ) { return elm( 'font', attrs, children ) as HTMLFontElement; }
export function form( attrs?: null | HTMLAttributes, children?: Children ) { return elm( 'form', attrs, children ) as HTMLFormElement; }
export function frame( attrs?: null | HTMLAttributes, children?: Children ) { return elm( 'frame', attrs, children ) as HTMLFrameElement; }
export function frameset( attrs?: null | HTMLAttributes, children?: Children ) { return elm( 'frameset', attrs, children ) as HTMLFrameSetElement; }
export function h1( attrs?: null | HTMLAttributes, children?: Children ) { return elm( 'h1', attrs, children ) as HTMLHeadingElement; }
export function h2( attrs?: null | HTMLAttributes, children?: Children ) { return elm( 'h2', attrs, children ) as HTMLHeadingElement; }
export function h3( attrs?: null | HTMLAttributes, children?: Children ) { return elm( 'h3', attrs, children ) as HTMLHeadingElement; }
export function h4( attrs?: null | HTMLAttributes, children?: Children ) { return elm( 'h4', attrs, children ) as HTMLHeadingElement; }
export function h5( attrs?: null | HTMLAttributes, children?: Children ) { return elm( 'h5', attrs, children ) as HTMLHeadingElement; }
export function h6( attrs?: null | HTMLAttributes, children?: Children ) { return elm( 'h6', attrs, children ) as HTMLHeadingElement; }
export function head( attrs?: null | HTMLAttributes, children?: Children ) { return elm( 'head', attrs, children ) as HTMLHeadElement; }
export function hr( attrs?: null | HTMLAttributes, children?: Children ) { return elm( 'hr', attrs, children ) as HTMLHRElement; }
export function html( attrs?: null | HTMLAttributes, children?: Children ) { return elm( 'html', attrs, children ) as HTMLHtmlElement; }
export function iframe( attrs?: null | HTMLAttributes, children?: Children ) { return elm( 'iframe', attrs, children ) as HTMLIFrameElement; }
export function img( attrs?: null | HTMLAttributes, children?: Children ) { return elm( 'img', attrs, children ) as HTMLImageElement; }
export function input( attrs?: null | HTMLAttributes, children?: Children ) { return elm( 'input', attrs, children ) as HTMLInputElement; }
export function ins( attrs?: null | HTMLAttributes, children?: Children ) { return elm( 'ins', attrs, children ) as HTMLModElement; }
export function isindex( attrs?: null | HTMLAttributes, children?: Children ) { return elm( 'isindex', attrs, children ) as HTMLUnknownElement; }
export function label( attrs?: null | HTMLAttributes, children?: Children ) { return elm( 'label', attrs, children ) as HTMLLabelElement; }
export function legend( attrs?: null | HTMLAttributes, children?: Children ) { return elm( 'legend', attrs, children ) as HTMLLegendElement; }
export function li( attrs?: null | HTMLAttributes, children?: Children ) { return elm( 'li', attrs, children ) as HTMLLIElement; }
export function link( attrs?: null | HTMLAttributes, children?: Children ) { return elm( 'link', attrs, children ) as HTMLLinkElement; }
export function listing( attrs?: null | HTMLAttributes, children?: Children ) { return elm( 'listing', attrs, children ) as HTMLPreElement; }
export function map( attrs?: null | HTMLAttributes, children?: Children ) { return elm( 'map', attrs, children ) as HTMLMapElement; }
export function marquee( attrs?: null | HTMLAttributes, children?: Children ) { return elm( 'marquee', attrs, children ) as HTMLMarqueeElement; }
export function menu( attrs?: null | HTMLAttributes, children?: Children ) { return elm( 'menu', attrs, children ) as HTMLMenuElement; }
export function meta( attrs?: null | HTMLAttributes, children?: Children ) { return elm( 'meta', attrs, children ) as HTMLMetaElement; }
export function meter( attrs?: null | HTMLAttributes, children?: Children ) { return elm( 'meteor', attrs, children ) as HTMLMeterElement; }
export function nextid( attrs?: null | HTMLAttributes, children?: Children ) { return elm( 'nextid', attrs, children ) as HTMLUnknownElement; }
export function object( attrs?: null | HTMLAttributes, children?: Children ) { return elm( 'object', attrs, children ) as HTMLObjectElement; }
export function ol( attrs?: null | HTMLAttributes, children?: Children ) { return elm( 'ol', attrs, children ) as HTMLOListElement; }
export function optgroup( attrs?: null | HTMLAttributes, children?: Children ) { return elm( 'optgroup', attrs, children ) as HTMLOptGroupElement; }
export function option( attrs?: null | HTMLAttributes, children?: Children ) { return elm( 'option', attrs, children ) as HTMLOptionElement; }
export function p( attrs?: null | HTMLAttributes, children?: Children ) { return elm( 'p', attrs, children ) as HTMLParagraphElement; }
export function param( attrs?: null | HTMLAttributes, children?: Children ) { return elm( 'param', attrs, children ) as HTMLParamElement; }
export function picture( attrs?: null | HTMLAttributes, children?: Children ) { return elm( 'picture', attrs, children ) as HTMLPictureElement; }
export function pre( attrs?: null | HTMLAttributes, children?: Children ) { return elm( 'pre', attrs, children ) as HTMLPreElement; }
export function progress( attrs?: null | HTMLAttributes, children?: Children ) { return elm( 'progress', attrs, children ) as HTMLProgressElement; }
export function q( attrs?: null | HTMLAttributes, children?: Children ) { return elm( 'q', attrs, children ) as HTMLQuoteElement; }
export function script( attrs?: null | HTMLAttributes, children?: Children ) { return elm( 'script', attrs, children ) as HTMLScriptElement; }
export function select( attrs?: null | HTMLAttributes, children?: Children ) { return elm( 'select', attrs, children ) as HTMLSelectElement; }
export function source( attrs?: null | HTMLAttributes, children?: Children ) { return elm( 'source', attrs, children ) as HTMLSourceElement; }
export function span( attrs?: null | HTMLAttributes, children?: Children ) { return elm( 'span', attrs, children ) as HTMLSpanElement; }
export function style( attrs?: null | HTMLAttributes, children?: Children ) { return elm( 'style', attrs, children ) as HTMLStyleElement; }
export function table( attrs?: null | HTMLAttributes, children?: Children ) { return elm( 'table', attrs, children ) as HTMLTableElement; }
export function tbody( attrs?: null | HTMLAttributes, children?: Children ) { return elm( 'tbody', attrs, children ) as HTMLTableSectionElement; }
export function td( attrs?: null | HTMLAttributes, children?: Children ) { return elm( 'td', attrs, children ) as HTMLTableDataCellElement; }
export function template( attrs?: null | HTMLAttributes, children?: Children ) { return elm( 'template', attrs, children ) as HTMLTemplateElement; }
export function textarea( attrs?: null | HTMLAttributes, children?: Children ) { return elm( 'textarea', attrs, children ) as HTMLTextAreaElement; }
export function tfoot( attrs?: null | HTMLAttributes, children?: Children ) { return elm( 'tfoot', attrs, children ) as HTMLTableSectionElement; }
export function th( attrs?: null | HTMLAttributes, children?: Children ) { return elm( 'th', attrs, children ) as HTMLTableHeaderCellElement; }
export function thead( attrs?: null | HTMLAttributes, children?: Children ) { return elm( 'thead', attrs, children ) as HTMLTableSectionElement; }
export function title( attrs?: null | HTMLAttributes, children?: Children ) { return elm( 'title', attrs, children ) as HTMLTitleElement; }
export function tr( attrs?: null | HTMLAttributes, children?: Children ) { return elm( 'tr', attrs, children ) as HTMLTableRowElement; }
export function track( attrs?: null | HTMLAttributes, children?: Children ) { return elm( 'track', attrs, children ) as HTMLTrackElement; }
export function ul( attrs?: null | HTMLAttributes, children?: Children ) { return elm( 'ul', attrs, children ) as HTMLUListElement; }
export function video( attrs?: null | HTMLAttributes, children?: Children ) { return elm( 'video', attrs, children ) as HTMLVideoElement; }
export function xmp( attrs?: null | HTMLAttributes, children?: Children ) { return elm( 'xmp', attrs, children ) as HTMLPreElement; }
export function i( attrs?: null | HTMLAttributes, children?: Children ) { return elm( 'i', attrs, children ) as HTMLElement; }