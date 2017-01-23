import { Popup } from '../popup/popup';
import { JML } from '../../jml/jml';

export class PopupMenuItem {
    constructor( public text: string, public icon?: string, public tag?: any ) { }
}

/**
 * A popup window that is usually added to the body, that contains
 * a list of menu items that can be selected.
 * eg:
 */
export class PopupMenu extends Popup {

    public onItemClick: ( e: MouseEvent, item: PopupMenuItem ) => void;

    private _items: PopupMenuItem[];

    /**
     * Creates an instance of the popup
     */
    constructor() {
        super();

        this.classList.toggle( 'popup-menu', true );
        this._items = [];
    }

    private onItemHtmlClick( e: MouseEvent, item: PopupMenuItem ) {
        e.preventDefault();
        e.stopPropagation();
        if ( this.onItemClick )
            this.onItemClick( e, item );

        this.hide( true );
    }

    /**
     * Adds a popup menu item
     */
    addItem( item: PopupMenuItem ) {
        this._items.push( item );

        const html = this.appendChild( JML.div( {
            className: 'popup-item',
            onclick: ( e ) => this.onItemHtmlClick( e, item )
        }, item.text ) );

        if ( item.icon )
            html.insertBefore( JML.div( {
                className: 'fa ' + item.icon
            }), html.firstChild );
    }

    /**
     * Removes a popup menu item
     */
    removeItem( item: PopupMenuItem ) {
        const index = this._items.indexOf( item );
        if ( index === -1 )
            throw 'Item is not added to this menu';

        this._items.splice( 0, 1 );
        this.removeChild( this.children[ index ] )
    }

    /**
     * Removes all menu items from the menu
     */
    clear() {
        while ( this._items.length > 0 ) {
            this.removeChild( this.children[ 0 ] );
            this._items.pop();
        }
    }
}