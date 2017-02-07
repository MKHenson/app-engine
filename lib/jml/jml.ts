import { parsers } from './parsers';

/**
 * Make all properties in T optional as well as their base type
 */
export type PartialHTMLElement<T> = {
    [ P in keyof T ]?: Partial<T[ P ]>;
};

/**
 * Describes the types that can be added to calls to jml
 */
export type Children = ( HTMLElement | NodeList | string )[] | HTMLElement | string;

/**
 * Empties out an element of all its child nodes
 */
export function empty( element: Element ) {
    while ( element.firstChild )
        element.removeChild( element.firstChild );
}

/**
 * Empties out an element, and replaces it with a child element
 */
export function innerHtml( parent: Element, child: Element ) {
    while ( parent.firstChild )
        parent.removeChild( parent.firstChild );

    parent.appendChild( child );
}

export namespace JML {

    /**
     * Creates an element based on the type and attributes defined. If children are supplied they are added
     * to the newly created element.
     *
     * eg:
     *  elm('div', { className: 'important', style: { marginLeft: '5px' } } )
     *  elm('div', { className: 'important', style: { marginLeft: '5px' } }, 'Strings are converted to a text node' )
     *  elm('div', { className: 'important', style: { marginLeft: '5px' } }, new HTMLCanvasElement() )
     * @param type Can be a string or Element. If it's a string, it must be a registered element name
     * @param attrs [Optional] A list of attributes that are applied to the created element
     * @param children [Optional] Child elements that will be added to the created element, or the created elements target
     * @param target [Optional] The target selector, if specified, will be the child element within the created element to which the children are added
     */
    export function elm<T extends HTMLElement>( type: string | HTMLElement, attrs?: null | PartialHTMLElement<T>, children?: Children, target?: string ): T {
        let elm: T;

        // Create the element
        if ( typeof type === 'string' )
            elm = document.createElement( type ) as T;
        else
            elm = type as T;

        // Set the attributes if present
        if ( attrs ) {
            for ( let a in attrs )
                if ( parsers[ a ] )
                    elm[ a as string ] = parsers[ a ]( attrs[ a ] );
                else
                    elm[ a as string ] = attrs[ a ];
        }

        // Get the target element to which we add the children
        let targetParent: HTMLElement = elm;
        if ( target ) {
            const query = elm.querySelector( target ) as HTMLElement | null;
            if ( !query )
                throw new Error( `Could not find target element '${ target }'` )

            targetParent = query;
        }

        // Create a text element if the child is a string
        if ( typeof children === 'string' )
            targetParent.appendChild( document.createTextNode( children ) );
        else if ( Array.isArray( children ) ) {

            for ( const child of children )
                if ( typeof ( child ) === 'string' ) {
                    targetParent.appendChild( document.createTextNode( child ) );
                }
                else if ( child instanceof HTMLElement ) {
                    targetParent.appendChild( child );
                }
                else {
                    if ( !child )
                        continue;

                    for ( let i = 0, l = child.length; i < l; i++ ) {
                        const node = child[ i ];
                        targetParent.appendChild( node );
                    }
                }
        }
        else if ( children ) {
            targetParent.appendChild( children );
        }

        return elm;
    }

    export function a( attrs?: null | PartialHTMLElement<HTMLAnchorElement>, children?: Children ) { return elm( 'a', attrs, children ) as HTMLAnchorElement; }
    export function applet( attrs?: null | PartialHTMLElement<HTMLAppletElement>, children?: Children ) { return elm( 'applet', attrs, children ) as HTMLAppletElement; }
    export function area( attrs?: null | PartialHTMLElement<HTMLAreaElement>, children?: Children ) { return elm( 'area', attrs, children ) as HTMLAreaElement; }
    export function audio( attrs?: null | PartialHTMLElement<HTMLAudioElement>, children?: Children ) { return elm( 'audio', attrs, children ) as HTMLAudioElement; }
    export function base( attrs?: null | PartialHTMLElement<HTMLBaseElement>, children?: Children ) { return elm( 'base', attrs, children ) as HTMLBaseElement; }
    export function basefont( attrs?: null | PartialHTMLElement<HTMLBaseFontElement>, children?: Children ) { return elm( 'basefont', attrs, children ) as HTMLBaseFontElement; }
    export function blockquote( attrs?: null | PartialHTMLElement<HTMLQuoteElement>, children?: Children ) { return elm( 'blockquote', attrs, children ) as HTMLQuoteElement; }
    export function body( attrs?: null | PartialHTMLElement<HTMLBodyElement>, children?: Children ) { return elm( 'body', attrs, children ) as HTMLBodyElement; }
    export function br( attrs?: null | PartialHTMLElement<HTMLBRElement>, children?: Children ) { return elm( 'br', attrs, children ) as HTMLBRElement; }
    export function button( attrs?: null | PartialHTMLElement<HTMLButtonElement>, children?: Children ) { return elm( 'button', attrs, children ) as HTMLButtonElement; }
    export function canvas( attrs?: null | PartialHTMLElement<HTMLCanvasElement>, children?: Children ) { return elm( 'canvas', attrs, children ) as HTMLCanvasElement; }
    export function caption( attrs?: null | PartialHTMLElement<HTMLTableCaptionElement>, children?: Children ) { return elm( 'caption', attrs, children ) as HTMLTableCaptionElement; }
    export function col( attrs?: null | PartialHTMLElement<HTMLTableColElement>, children?: Children ) { return elm( 'col', attrs, children ) as HTMLTableColElement; }
    export function colgroup( attrs?: null | PartialHTMLElement<HTMLTableColElement>, children?: Children ) { return elm( 'colgroup', attrs, children ) as HTMLTableColElement; }
    export function datalist( attrs?: null | PartialHTMLElement<HTMLDataListElement>, children?: Children ) { return elm( 'datalist', attrs, children ) as HTMLDataListElement; }
    export function del( attrs?: null | PartialHTMLElement<HTMLModElement>, children?: Children ) { return elm( 'del', attrs, children ) as HTMLModElement; }
    export function dir( attrs?: null | PartialHTMLElement<HTMLDirectoryElement>, children?: Children ) { return elm( 'dir', attrs, children ) as HTMLDirectoryElement; }
    export function div( attrs?: null | PartialHTMLElement<HTMLDivElement>, children?: Children ) { return elm( 'div', attrs, children ) as HTMLDivElement; }
    export function dl( attrs?: null | PartialHTMLElement<HTMLDListElement>, children?: Children ) { return elm( 'dl', attrs, children ) as HTMLDListElement; }
    export function embed( attrs?: null | PartialHTMLElement<HTMLEmbedElement>, children?: Children ) { return elm( 'embed', attrs, children ) as HTMLEmbedElement; }
    export function fieldset( attrs?: null | PartialHTMLElement<HTMLFieldSetElement>, children?: Children ) { return elm( 'fieldset', attrs, children ) as HTMLFieldSetElement; }
    export function font( attrs?: null | PartialHTMLElement<HTMLFontElement>, children?: Children ) { return elm( 'font', attrs, children ) as HTMLFontElement; }
    export function form( attrs?: null | PartialHTMLElement<HTMLFormElement>, children?: Children ) { return elm( 'form', attrs, children ) as HTMLFormElement; }
    export function frame( attrs?: null | PartialHTMLElement<HTMLFrameElement>, children?: Children ) { return elm( 'frame', attrs, children ) as HTMLFrameElement; }
    export function frameset( attrs?: null | PartialHTMLElement<HTMLFrameSetElement>, children?: Children ) { return elm( 'frameset', attrs, children ) as HTMLFrameSetElement; }
    export function h1( attrs?: null | PartialHTMLElement<HTMLHeadingElement>, children?: Children ) { return elm( 'h1', attrs, children ) as HTMLHeadingElement; }
    export function h2( attrs?: null | PartialHTMLElement<HTMLHeadingElement>, children?: Children ) { return elm( 'h2', attrs, children ) as HTMLHeadingElement; }
    export function h3( attrs?: null | PartialHTMLElement<HTMLHeadingElement>, children?: Children ) { return elm( 'h3', attrs, children ) as HTMLHeadingElement; }
    export function h4( attrs?: null | PartialHTMLElement<HTMLHeadingElement>, children?: Children ) { return elm( 'h4', attrs, children ) as HTMLHeadingElement; }
    export function h5( attrs?: null | PartialHTMLElement<HTMLHeadingElement>, children?: Children ) { return elm( 'h5', attrs, children ) as HTMLHeadingElement; }
    export function h6( attrs?: null | PartialHTMLElement<HTMLHeadingElement>, children?: Children ) { return elm( 'h6', attrs, children ) as HTMLHeadingElement; }
    export function head( attrs?: null | PartialHTMLElement<HTMLHeadElement>, children?: Children ) { return elm( 'head', attrs, children ) as HTMLHeadElement; }
    export function hr( attrs?: null | PartialHTMLElement<HTMLHRElement>, children?: Children ) { return elm( 'hr', attrs, children ) as HTMLHRElement; }
    export function html( attrs?: null | PartialHTMLElement<HTMLHtmlElement>, children?: Children ) { return elm( 'html', attrs, children ) as HTMLHtmlElement; }
    export function iframe( attrs?: null | PartialHTMLElement<HTMLIFrameElement>, children?: Children ) { return elm( 'iframe', attrs, children ) as HTMLIFrameElement; }
    export function img( attrs?: null | PartialHTMLElement<HTMLImageElement>, children?: Children ) { return elm( 'img', attrs, children ) as HTMLImageElement; }
    export function input( attrs?: null | PartialHTMLElement<HTMLInputElement>, children?: Children ) { return elm( 'input', attrs, children ) as HTMLInputElement; }
    export function ins( attrs?: null | PartialHTMLElement<HTMLModElement>, children?: Children ) { return elm( 'ins', attrs, children ) as HTMLModElement; }
    export function isindex( attrs?: null | PartialHTMLElement<HTMLUnknownElement>, children?: Children ) { return elm( 'isindex', attrs, children ) as HTMLUnknownElement; }
    export function label( attrs?: null | PartialHTMLElement<HTMLLabelElement>, children?: Children ) { return elm( 'label', attrs, children ) as HTMLLabelElement; }
    export function legend( attrs?: null | PartialHTMLElement<HTMLLegendElement>, children?: Children ) { return elm( 'legend', attrs, children ) as HTMLLegendElement; }
    export function li( attrs?: null | PartialHTMLElement<HTMLLIElement>, children?: Children ) { return elm( 'li', attrs, children ) as HTMLLIElement; }
    export function link( attrs?: null | PartialHTMLElement<HTMLLinkElement>, children?: Children ) { return elm( 'link', attrs, children ) as HTMLLinkElement; }
    export function listing( attrs?: null | PartialHTMLElement<HTMLPreElement>, children?: Children ) { return elm( 'listing', attrs, children ) as HTMLPreElement; }
    export function map( attrs?: null | PartialHTMLElement<HTMLMapElement>, children?: Children ) { return elm( 'map', attrs, children ) as HTMLMapElement; }
    export function marquee( attrs?: null | PartialHTMLElement<HTMLMarqueeElement>, children?: Children ) { return elm( 'marquee', attrs, children ) as HTMLMarqueeElement; }
    export function menu( attrs?: null | PartialHTMLElement<HTMLMenuElement>, children?: Children ) { return elm( 'menu', attrs, children ) as HTMLMenuElement; }
    export function meta( attrs?: null | PartialHTMLElement<HTMLMetaElement>, children?: Children ) { return elm( 'meta', attrs, children ) as HTMLMetaElement; }
    export function meter( attrs?: null | PartialHTMLElement<HTMLMeterElement>, children?: Children ) { return elm( 'meteor', attrs, children ) as HTMLMeterElement; }
    export function nextid( attrs?: null | PartialHTMLElement<HTMLUnknownElement>, children?: Children ) { return elm( 'nextid', attrs, children ) as HTMLUnknownElement; }
    export function object( attrs?: null | PartialHTMLElement<HTMLObjectElement>, children?: Children ) { return elm( 'object', attrs, children ) as HTMLObjectElement; }
    export function ol( attrs?: null | PartialHTMLElement<HTMLOListElement>, children?: Children ) { return elm( 'ol', attrs, children ) as HTMLOListElement; }
    export function optgroup( attrs?: null | PartialHTMLElement<HTMLOptGroupElement>, children?: Children ) { return elm( 'optgroup', attrs, children ) as HTMLOptGroupElement; }
    export function option( attrs?: null | PartialHTMLElement<HTMLOptionElement>, children?: Children ) { return elm( 'option', attrs, children ) as HTMLOptionElement; }
    export function p( attrs?: null | PartialHTMLElement<HTMLParagraphElement>, children?: Children ) { return elm( 'p', attrs, children ) as HTMLParagraphElement; }
    export function param( attrs?: null | PartialHTMLElement<HTMLParamElement>, children?: Children ) { return elm( 'param', attrs, children ) as HTMLParamElement; }
    export function picture( attrs?: null | PartialHTMLElement<HTMLPictureElement>, children?: Children ) { return elm( 'picture', attrs, children ) as HTMLPictureElement; }
    export function pre( attrs?: null | PartialHTMLElement<HTMLPreElement>, children?: Children ) { return elm( 'pre', attrs, children ) as HTMLPreElement; }
    export function progress( attrs?: null | PartialHTMLElement<HTMLProgressElement>, children?: Children ) { return elm( 'progress', attrs, children ) as HTMLProgressElement; }
    export function q( attrs?: null | PartialHTMLElement<HTMLQuoteElement>, children?: Children ) { return elm( 'q', attrs, children ) as HTMLQuoteElement; }
    export function script( attrs?: null | PartialHTMLElement<HTMLScriptElement>, children?: Children ) { return elm( 'script', attrs, children ) as HTMLScriptElement; }
    export function select( attrs?: null | PartialHTMLElement<HTMLSelectElement>, children?: Children ) { return elm( 'select', attrs, children ) as HTMLSelectElement; }
    export function source( attrs?: null | PartialHTMLElement<HTMLSourceElement>, children?: Children ) { return elm( 'source', attrs, children ) as HTMLSourceElement; }
    export function span( attrs?: null | PartialHTMLElement<HTMLSpanElement>, children?: Children ) { return elm( 'span', attrs, children ) as HTMLSpanElement; }
    export function style( attrs?: null | PartialHTMLElement<HTMLStyleElement>, children?: Children ) { return elm( 'style', attrs, children ) as HTMLStyleElement; }
    export function slot( attrs?: null | PartialHTMLElement<HTMLSlotElement>, children?: Children ) { return elm( 'slot', attrs, children ) as HTMLSlotElement; }
    export function table( attrs?: null | PartialHTMLElement<HTMLTableElement>, children?: Children ) { return elm( 'table', attrs, children ) as HTMLTableElement; }
    export function tbody( attrs?: null | PartialHTMLElement<HTMLTableSectionElement>, children?: Children ) { return elm( 'tbody', attrs, children ) as HTMLTableSectionElement; }
    export function td( attrs?: null | PartialHTMLElement<HTMLTableDataCellElement>, children?: Children ) { return elm( 'td', attrs, children ) as HTMLTableDataCellElement; }
    export function template( attrs?: null | PartialHTMLElement<HTMLTemplateElement>, children?: Children ) { return elm( 'template', attrs, children ) as HTMLTemplateElement; }
    export function textarea( attrs?: null | PartialHTMLElement<HTMLTextAreaElement>, children?: Children ) { return elm( 'textarea', attrs, children ) as HTMLTextAreaElement; }
    export function tfoot( attrs?: null | PartialHTMLElement<HTMLTableSectionElement>, children?: Children ) { return elm( 'tfoot', attrs, children ) as HTMLTableSectionElement; }
    export function th( attrs?: null | PartialHTMLElement<HTMLTableHeaderCellElement>, children?: Children ) { return elm( 'th', attrs, children ) as HTMLTableHeaderCellElement; }
    export function thead( attrs?: null | PartialHTMLElement<HTMLTableSectionElement>, children?: Children ) { return elm( 'thead', attrs, children ) as HTMLTableSectionElement; }
    export function title( attrs?: null | PartialHTMLElement<HTMLTitleElement>, children?: Children ) { return elm( 'title', attrs, children ) as HTMLTitleElement; }
    export function tr( attrs?: null | PartialHTMLElement<HTMLTableRowElement>, children?: Children ) { return elm( 'tr', attrs, children ) as HTMLTableRowElement; }
    export function track( attrs?: null | PartialHTMLElement<HTMLTrackElement>, children?: Children ) { return elm( 'track', attrs, children ) as HTMLTrackElement; }
    export function ul( attrs?: null | PartialHTMLElement<HTMLUListElement>, children?: Children ) { return elm( 'ul', attrs, children ) as HTMLUListElement; }
    export function video( attrs?: null | PartialHTMLElement<HTMLVideoElement>, children?: Children ) { return elm( 'video', attrs, children ) as HTMLVideoElement; }
    export function xmp( attrs?: null | PartialHTMLElement<HTMLPreElement>, children?: Children ) { return elm( 'xmp', attrs, children ) as HTMLPreElement; }
    export function i( attrs?: null | PartialHTMLElement<HTMLElement>, children?: Children ) { return elm( 'i', attrs, children ) as HTMLElement; }
}