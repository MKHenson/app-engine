import { Component } from '../../component';

/**
* The interface for all layout objects.
*/
export class ToolbarItem extends Component {
    public text: String;
    public img: String;

    /**
    * @param {string} img The image path.
    * @param {string} text The text to use in the item.
    */
    constructor( img: string, text: string, parent?: Component ) {
        super( '<div class=\'toolbar-button tooltip\'><div><img src=\'' + img + '\' /></div><div class=\'tooltip-text tooltip-text-bg\'>' + text + '</div></div>', parent );
        this.img = img;
        this.text = text;
    }
}



/**
*  A toolbar button for selection a list of options
*/
export class ToolbarDropDown extends Component {
    public items: Array<ToolbarItem>;
    private _popupContainer: Component;
    private _selectedItem: ToolbarItem | null;
    private _clickProxy: any;
    private _stageDownProxy: any;

    /**
    * @param {Component} parent The parent of this toolbar
    * @param {Array<ToolbarItem>} items An array of items to list e.g. [{img:'./img1.png', text:'option 1'}, {img:'./img2.png', text:'option 2'}]
    */
    constructor( parent: Component, items: Array<ToolbarItem> ) {
        super( '<div class=\'toolbar-button-drop-down tooltip\'></div>', parent );

        this.items = items;
        this._popupContainer = new Component( '<div class=\'tool-bar-dropdown background shadow-small\'></div>' );

        let i = items.length;
        while ( i-- )
            this._popupContainer.addChild( items[ i ] );

        if ( items.length > 0 )
            this._selectedItem = <ToolbarItem>this.addChild( items[ 0 ] );
        else
            this._selectedItem = null;


        this._stageDownProxy = this.onStageUp.bind( this );
        this._clickProxy = this.onClick.bind( this );

        this.element.on( 'click', this._clickProxy );
    }

    /**
    * Adds an item the drop down. The item must be an object with both img and text vars. eg: { img:'', text:'' }
    * @param {ToolbarItem} item The item to add.
    * @returns {Component}
    */
    addItem( item: ToolbarItem ) {
        const comp = this._popupContainer.addChild( item );
        this.items.push( item );
        return comp;
    }

    /**
    * Adds an item the drop down. The item must be an object with both img and text vars. eg: { img:'', text:'' }
    * @param {any} val This can be either the item object itself, its text or its component.
    * @param {boolean} dispose Set this to true if you want delete the item
    * @returns {Component} Returns the removed item component or null
    */
    removeItem( val: any, dispose: boolean = true ) {
        let i = this.items.length;
        const items: Array<any> = this.items;
        while ( i-- )
            if ( items[ i ] === val || items[ i ].text === val || items[ i ].comp === val ) {
                if ( dispose )
                    items[ i ].dispose()
                else
                    items[ i ].element.detach();

                items.splice( i, 1 );
                return items[ i ];
            }

        return null;
    }

    /**
    * Clears all the items
    * @param {boolean} dispose Set this to true if you want to delete all the items from memory
    */
    clear( dispose: boolean = true ): void {
        let i = this.items.length;
        const items: Array<any> = this.items;
        while ( i-- ) {
            if ( dispose )
                items[ i ].dispose()
            else
                items[ i ].element.detach();
        }

        this._selectedItem = null;
        items.splice( 0, items.length );
    }

    /**
    * Sets the selected item
    * @param {any} item
    */
    set selectedItem( item: ToolbarItem ) {
        if ( this._selectedItem === item )
            return;

        if ( this._selectedItem )
            this._popupContainer.addChild( this._selectedItem );

        this.addChild( item );
        this._selectedItem = item;
        // const e: ToolbarDropDownEvent = new ToolbarDropDownEvent( item, 'clicked' );
        // this.emit( e );
        // e.dispose();

        return;
    }

    /**
    * Gets the selected item
    * @returns {ToolbarItem}
    */
    get selectedItem(): ToolbarItem {
        return this._selectedItem!;
    }

    /**
    * Called when the mouse is down on the DOM
    * @param {any} e The jQuery event
    */
    onStageUp( e: any ) {
        const body = jQuery( 'body' );
        body.off( 'mousedown', this._stageDownProxy );

        const comp: Component = jQuery( e.target ).data( 'component' );
        this._popupContainer.element.detach();
        this.element.removeClass( 'active' );

        if ( comp ) {
            let i = this.items.length;
            while ( i-- ) {
                if ( comp === this.items[ i ] ) {
                    this.selectedItem = <ToolbarItem>comp;
                    return;
                }
            }
        }
    }

    /**
    * When we click the main button
    * @param {any} e The jQuery event oject
    */
    onClick() {
        //var comp = jQuery( e.target ).data( 'component' );
        const offset = this.element.offset();
        this.element.addClass( 'active' );

        const body = jQuery( 'body' );
        body.off( 'mousedown', this._stageDownProxy );
        body.on( 'mousedown', this._stageDownProxy );

        this._popupContainer.element.css( { top: offset.top + this.element.height(), left: offset.left });
        body.append( this._popupContainer.element );
    }

    /**
    * Cleans up the component
    */
    dispose(): void {
        let i = this.items.length;
        while ( i-- )
            this.items[ i ].dispose();

        this._popupContainer.dispose();
        this.element.off( 'click', this._clickProxy );
        this._clickProxy = null;
        this._selectedItem = null;

        //Call super
        super.dispose();
    }
}