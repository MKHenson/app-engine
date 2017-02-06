import { Menu, PopupMenuItem } from '../menu/menu';

/**
 * An element which when clicked, shows a Menu component
 *
 * const pop = new IconMenu();
 * pop.show( 300, 500 );
 * pop.addItem( new PopupMenuItem( 'Option 1', 'fa-fire-extinguisher' ) );
 * pop.addItem( new PopupMenuItem( 'Option 2' ) );

 * document.body.addEventListener('contextmenu', function (e) {
 *      e.preventDefault();
 *      e.stopPropagation();
 *      pop.show( e.clientX, e.clientY );
 * });
 */
export class IconMenu extends HTMLElement {

    public onItemClick: ( e: MouseEvent, item: PopupMenuItem, index: number ) => void;

    private _menu: Menu;

    /**
     * Creates an instance of the popup
     */
    constructor() {
        super();

        this.classList.toggle( 'icon-menu', true );
        this._menu = new Menu();

        this.addEventListener( 'click', ( e ) => {
            e.preventDefault();
            e.stopPropagation();
            this._menu.show( e.clientX, e.clientY )
        });
        this._menu.onItemClick = ( e, item, index ) => {
            if ( this.onItemClick )
                this.onItemClick( e, item, index );
        }
    }

    /**
     * Gets the menu associated with the menu icon
     */
    get menu(): Menu {
        return this._menu;
    }
}