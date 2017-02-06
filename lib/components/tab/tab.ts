import { Menu, PopupMenuItem } from '../menu/menu';
import { JML } from '../../jml/jml';

/**
 * A specialized element that is added to Tab elements. You can sub class panes
 * and create your own custom elements that can be added to Tab components.
 *
 * eg:
 * const tab = new Tab();
 * tab.addPane( new TabPane( 'New Pane' ) )
 *     .innerHTML = 'This is the first tab';
 */
export class TabPane extends HTMLElement {

    public label: string;
    public closeButton: boolean;

    constructor( label: string = 'New Tab', closeButton: boolean = true ) {
        super();

        this.label = label;
        this.closeButton = closeButton;
    }

    /**
     * Overridable function to determine if we can select the tab pane
     */
    async canSelect() {
        return true;
    }

    /**
     * Overridable function to determine if we can close the pane
     */
    async canClose() {
        return true;
    }
}

/**
 * A Tab Component for organising an array of panes. Only one pane can be active at any time,
 * and each can be activated by a label managed in the tab.
 *
 * eg:
 * const tab = new Tab();
 * tab.addPane( new TabPane( 'Tab 1' ) )
 *     .innerHTML = 'This is the first tab';
 *
 * tab.addPane( new TabPane( 'Tab 2' ) )
 *     .innerHTML = 'This is the second tab';
 *
 * document.body.appendChild( tab );
 */
export class Tab extends HTMLElement {

    static get observedAttributes() {
        return [
            'selected-index'
        ];
    }

    private _selectedIndex: number;
    private _panes: TabPane[];
    private _labels: HTMLDivElement[];

    /**
     * Creates a new instance of the tab
     */
    constructor() {
        super();
        this._panes = [];
        this._labels = [];
        this._selectedIndex = -1;

        this.classList.toggle( 'has-panes', false );

        super.appendChild( JML.div( { className: 'tab-labels' }, [
            JML.div( { classList: 'tab-drop-button', onclick: ( e ) => this.showContext( e ) }, [
                JML.i( { className: 'fa fa-arrow-circle-down' })
            ] )
        ] ) );

        super.appendChild( JML.div( { className: 'tab-panes' }) );
    }

    /**
     * If the attributes change we update the internal state
     */
    attributeChangedCallback( name: string, oldValue: string, newValue: string ) {
        switch ( name ) {
            case 'selected-index':
                this.selectedIndex = parseInt( newValue );
                break;
        }
    }

    /**
     * Gets the selected tab index
     */
    get selectedIndex(): number {
        return this._selectedIndex;
    }

    /**
     * Sets the selected tab index
     */
    set selectedIndex( val: number ) {
        if ( val === this._selectedIndex )
            return;

        const panels = this.querySelector( '.tab-panes' ) !;
        let canSelect: Promise<boolean>;

        if ( val === -1 ) {
            return;
        }

        if ( val >= this._panes.length )
            throw new Error( 'Index out of range' );

        // Get the pane
        const pane = this._panes[ val ];

        // Check if we can select the pane
        if ( pane.canSelect ) {
            let query = pane.canSelect();
            if ( typeof ( query ) === 'boolean' )
                canSelect = Promise.resolve( query );
            else
                canSelect = query as Promise<boolean>;
        }
        else
            canSelect = Promise.resolve( true );

        canSelect.then(( result ) => {
            if ( !result )
                return;

            const previous = this._selectedIndex;

            if ( previous !== -1 ) {
                if ( this._panes[ previous ].parentElement )
                    this._panes[ previous ].parentElement!.removeChild( this._panes[ previous ] );

                this._labels[ previous ].classList.toggle( 'selected', false );
            }

            this._selectedIndex = val;
            this._labels[ val ].classList.toggle( 'selected', true );
            panels.appendChild( pane );
        });
    }

    /**
     * Removes all panes from the tab
     */
    clear() {
        this._selectedIndex = -1;

        while ( this._panes.length > 0 ) {
            if ( this._panes[ 0 ].parentElement )
                this._panes[ 0 ].parentElement!.removeChild( this._panes[ 0 ] );

            this._labels[ 0 ].classList.toggle( 'selected', false );
            this._panes.splice( 0, 1 );
        }

        this.classList.toggle( 'has-panes', false );
    }

    /**
     * Adds a pane to the tab
     */
    addPane( pane: TabPane ): TabPane {
        const labels = this.querySelector( '.tab-labels' ) !;
        this._panes.push( pane );

        this.classList.toggle( 'has-panes', true );


        const newLabel =
            JML.div( {
                className: 'tab-label', onclick: () => {
                    const index = this._panes.indexOf( pane );
                    this.selectedIndex = index;
                }
            }, [
                    JML.div( { classList: 'text' }, [
                        JML.span( { className: 'content' }, pane.label )
                    ] ),
                    JML.div( {
                        classList: 'tab-close', onclick: ( e: MouseEvent ) => {
                            e.stopPropagation();
                            this.removePane( pane );
                        }
                    }, 'X' )
                ] );

        this._labels.push( newLabel );
        labels.appendChild( newLabel );

        this.selectedIndex = this._panes.length - 1;
        return pane;
    }

    /**
     * Removes a pane from the tab
     * @param pane The pane to remove
     */
    removePane( pane: TabPane ) {
        const index = this._panes.indexOf( pane );
        let canClose: Promise<boolean> | boolean;
        if ( pane.canClose )
            canClose = pane.canClose();
        else
            canClose = true;

        if ( typeof ( canClose ) === 'boolean' ) {
            if ( canClose )
                this.disposePane( index );
        }
        else {
            canClose.then(( result ) => {
                if ( result )
                    this.disposePane( index );
            });
        }
    }

    /**
     * Internal function that removes the pane reference, disposes it and sets a new index
     */
    private disposePane( index: number ) {

        if ( this._panes[ index ].parentElement )
            this._panes[ index ].parentElement!.removeChild( this._panes[ index ] );
        if ( this._labels[ index ].parentElement! )
            this._labels[ index ].parentElement!.removeChild( this._labels[ index ] );

        if ( this._panes.length === 0 )
            this.classList.toggle( 'has-panes', false );

        this._panes.splice( index, 1 );
        this._labels.splice( index, 1 );

        if ( this._selectedIndex === index ) {
            if ( index > 0 ) {
                this._selectedIndex = -1;
                this.selectedIndex = index - 1;
            }
            else if ( this._panes.length > 0 ) {
                this._selectedIndex = -1;
                this.selectedIndex = 0;
            }
        }
        else if ( this._panes.length === 0 ) {
            this._selectedIndex = -1;
        }
    }

    /**
     * Shows the context menu
     */
    showContext( e: MouseEvent ) {
        e.preventDefault();
        e.stopPropagation();

        let panes = this._panes;
        const menu = new Menu();
        for ( let pane of panes )
            menu.addItem( new PopupMenuItem( pane.label ) );

        menu.show( e.pageX, e.pageY );
        menu.onItemClick = ( e, item, index ) => this.selectedIndex = index;
    }

    /**
     * Gets a tab's' props by either its label or index
     * @param selector The label or index of the tab pane to return
     */
    get( selector: number | string ): TabPane | null {
        const panes = this._panes;

        if ( typeof ( selector ) === 'string' ) {
            for ( const pane of panes )
                if ( pane.label === selector )
                    return pane;
        }
        else
            return panes[ selector ] || null;

        return null;
    }


    /**
     * Gets an array of all the tab props
     */
    get panes(): TabPane[] {
        return this._panes;
    }
}