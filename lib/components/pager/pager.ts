import { JML } from '../../jml/jml';

/**
 * A class for handling paged content. You can use the pager like you would a div element. The content
 * of which will be displayed in a sub panel with a footer that allows the user to navigate between the content that's inserted.
 * As a consumer of this component, you must implement the remote callback to return the paged content when the user presses one
 * of the navigation buttons.
 */
export class Pager extends HTMLElement {
    public limit: number;
    public remote: ( index: number, limit: number ) => number;

    public _count: number;
    private _index: number;
    private _limit: number;

    /**
     * Creates an instance of the pager
     */
    constructor( limit: number = 10 ) {
        super();
        this._index = 0;
        this._limit = limit;
        this._count = 0;
        this.remote = null!;

        super.appendChild( JML.div( { className: 'content' }) );
        super.appendChild( JML.div( { className: 'navigation background' }, [
            JML.div( { className: 'navigation-column back' }, [
                JML.a( { onclick: () => this.goFirst() }, 'First <<' ),
                JML.a( { onclick: () => this.goPrev() }, 'Prev <' )
            ] ),
            JML.div( { className: 'navigation-column index' }, '' ),
            JML.div( { className: 'navigation-column next' }, [
                JML.a( { onclick: () => this.goNext() }, '> Next' ),
                JML.a( { onclick: () => this.goLast() }, '>> Last' )
            ] )
        ] ) );
    }

    appendChild( node: Node ) {
        return ( super.querySelector( '.content' ) as HTMLDivElement ) !.appendChild( node );
    }

    removeChild( node: Node ) {
        return ( super.querySelector( '.content' ) as HTMLDivElement ) !.removeChild( node )
    }

    private update() {
        this.classList.toggle( 'has-content', this._count > 0 ? true : false );
        const back = super.querySelector( '.back' ) !;
        const index = super.querySelector( '.index' ) !;
        const next = super.querySelector( '.next' ) !;
        const pageNum = ( this._index / this.limit ) + 1;
        const totalPageNumbers = Math.ceil( this._count / this.limit );

        ( back.children[ 0 ] as HTMLElement ).style.display = this._index ? '' : 'none';
        ( back.children[ 1 ] as HTMLElement ).style.display = this._index ? '' : 'none';
        index.innerHTML = `${pageNum} of ${totalPageNumbers}`;
        ( next.children[ 0 ] as HTMLElement ).style.display = this._index + this.limit < this._count ? '' : 'none';
        ( next.children[ 1 ] as HTMLElement ).style.display = this._index < this._count - this.limit ? '' : 'none';
    }

    /**
     * When the component is mounted - load the projects
     */
    connectedCallback() {
        this._count = this.remote( this._index, this.limit );
        this.update();
    }

    /**
     * Calls the update function
     */
    invalidate() {
        this._count = this.remote( this._index, this.limit );
        this.update();
    }

    /**
     * Sets the page search back to index = 0
     */
    goFirst() {
        this._index = 0;
        this._count = this.remote( 0, this.limit );
        this.update();
    }

    /**
     * Gets the last set of users
     */
    goLast() {
        let index = 0;

        if ( this.limit !== 1 )
            index = this._count - ( this._count - this.limit ) % this.limit;
        else
            index = this._count - ( this._count - this.limit );

        if ( index < 0 )
            index = 0;

        this._index = index;
        this._count = this.remote( index, this.limit );
        this.update();
    }

    /**
     * Sets the page search back to index = 0
     */
    goNext() {
        let index = this._index + this.limit;
        this._index = index;
        this._count = this.remote( index, this.limit );
        this.update();
    }

    /**
     * Sets the page search back to index = 0
     */
    goPrev() {
        let index = this._index - this.limit;
        if ( index < 0 )
            index = 0;

        this._index = index;
        this._count = this.remote( index, this.limit );
        this.update();
    }
}