// import { ITabPaneProps } from './tab-pane';
import { Menu, PopupMenuItem } from '../menu/menu';
import { JML } from '../../jml/jml';

/**
 * A specialized element that is added to Tab elements
 */
export class TabPane extends HTMLElement {

    public label: string;
    public showCloseButton: boolean;

    constructor( label: string = 'New Tab' ) {
        super();

        this.label = label;
        this.showCloseButton = true;
    }

    async canSelect() {
        return true;
    }

    async canClose() {
        return true;
    }
}

/**
 * A Tab Component for organising pages of content into separate labelled tabs/components
 */
export class Tab extends HTMLElement {

    private _selectedIndex: number;
    private _panes: TabPane[];

    /**
     * Creates a new instance of the tab
     */
    constructor() {
        super();
        this._panes = [];
        this._selectedIndex = -1;

        this.classList.toggle( 'has-panes', false );

        super.appendChild( JML.div( { className: 'tab-labels' }, [
            JML.div( { classList: 'tab-drop-button', onclick: ( e ) => this.showContext( e ) }, [
                JML.i( { className: 'fa fa-arrow-circle-down' })
            ] )
        ] ) );

        super.appendChild( JML.div( { className: 'tab-panes' }) );
    }

    set selectedIndex( val ) {
        const labels = this.querySelector( '.tab-labels' ) !;
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
                panels.removeChild( this._panes[ previous ] );
                labels.children[ previous ].classList.toggle( 'selected', false );
            }

            this._selectedIndex = val;
            labels.children[ val ].classList.toggle( 'selected', true );
            panels.appendChild( pane );
        });
    }

    /**
     * Removes all panes from the tab
     */
    clear() {
        this._selectedIndex = -1;
        const labels = this.querySelector( '.tab-labels' ) !;
        const panels = this.querySelector( '.tab-panes' ) !;
        while ( this._panes.length > 0 ) {
            panels.removeChild( this._panes[ 0 ] );
            labels.children[ 0 ].classList.toggle( 'selected', false );
            this._panes.splice( 0, 1 );
        }

        this.classList.toggle( 'has-panes', false );
    }

    // /**
    //  * Check if the index changes so we can notify the onSelect event
    //  */
    // attributeChangedCallback( attributeName: string, oldValue: string, newValue: string ) {
    //     if (attributeName === 'selectedIndex' ) {

    //     }
    //     if ( prevState.selectedIndex !== this.state.selectedIndex )
    //         if ( this._panes[ this.state.selectedIndex ].props.onSelect )
    //             this._panes[ this.state.selectedIndex ].props.onSelect!( this.state.selectedIndex );
    // }

    /**
     * Removes a pane from from the tab
     * @param pane The pane to remove
     */
    private removePane( pane: TabPane ) {
        const index = this._panes.indexOf( pane );
        let canClose: Promise<boolean> | boolean;
        if ( pane.canClose )
            canClose = pane.canClose();
        else
            canClose = true;

        if ( typeof ( canClose ) === 'boolean' ) {
            if ( canClose )
                this.disposePane( index, pane );
        }
        else {
            canClose.then(( result ) => {
                if ( result )
                    this.disposePane( index, pane );
            });
        }
    }

    /**
     * Internal function that removes the pane reference, disposes it and sets a new index
     */
    private disposePane( index: number, pane: TabPane ) {
        this._panes.splice( index, 1 );
        pane.parentElement!.removeChild( pane );

        if ( this._panes.length === 0 )
            this.classList.toggle( 'has-panes', false );

        this.selectedIndex = this._selectedIndex === this._panes.length && index > 0 ? index - 1 : this._selectedIndex;
    }

    /**
     * Shows the context menu
     */
    showContext( e: MouseEvent ) {
        let panes = this._panes;
        const menu = new Menu();
        for ( let pane of panes )
            menu.addItem( new PopupMenuItem( pane.label ) );

        menu.show( e.pageX, e.pageY );
        menu.onItemClick = ( e, item ) => {
            for ( let i = 0, l = panes.length; i < l; i++ )
                if ( panes[ i ].label === item.text )
                    return this.selectedIndex = i;
        }
    }

    /**
     * Adds a pane to the tab
     */
    add( pane: TabPane ): TabPane {
        const labels = this.querySelector( '.tab-labels' ) !;
        this._panes.push( pane );

        this.classList.toggle( 'has-panes', true );

        labels.appendChild(
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
                ] ) );

        this.selectedIndex = this._panes.length - 1;
        return pane;
    }

    /**
     * Gets a tab's' props by its label
     * @param val The label text of the tab
     */
    getPaneByLabel( label: string ): TabPane | null {
        const panes = this._panes;
        for ( const pane of panes )
            if ( pane.label === label )
                return pane;

        return null;
    }

    /**
     * Gets an array of all the tab props
     */
    get panes(): TabPane[] {
        return this._panes;
    }
}