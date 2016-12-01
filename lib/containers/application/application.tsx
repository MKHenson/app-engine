import * as el from '../../jml/jml';
// export interface IApplicationState extends HatcheryEditor.HatcheryProps {
//     splash?: HatcheryEditor.ISplashScreen;
//     user?: HatcheryEditor.IUser;
// }

// /**
//  * The main GUI component of the application.
//  */
// class Application extends React.Component<IApplicationState, void> {

//     constructor( props: IApplicationState ) {
//         super( props );
//     }

//     /**
//      * Creates the component elements
//      */
//     render(): JSX.Element {
//         const isLoading = this.props.user!.loading!;
//         let mainView: JSX.Element | React.ReactNode;

//         if ( isLoading )
//             mainView = <div className="loading-screen">
//                 <div className="loading-message fade-in">
//                     <h2>Loading Hatchery Editor...</h2>
//                     <i className="fa fa-cog fa-spin fa-3x fa-fw"></i>
//                 </div>
//             </div>;

//         return <div id="application">
//             <div className="splash-view">
//                 {this.props.children}
//             </div>
//         </div>;
//     }
// }

/**
 * The main GUI component of the application.
 */
export class Application extends HTMLElement {

    static get observedAttributes() {
        return [ 'loading', 'heading' ];
    }

    private _loadingElm: HTMLElement;

    constructor() {
        super();

        this._loadingElm =
            el.div( { className: 'loading-screen' }, [
                el.div( { className: 'loading-message fade-in' }, [
                    el.h2( null, 'Loading Hatchery Editor...' ),
                    el.i( { className: "fa fa-cog fa-spin fa-3x fa-fw" })
                ] )
            ] );

        super.setAttribute( 'id', 'application' );
        super.appendChild(
            el.div( { className: "splash-view" }, [
                el.div( { style: { color: 'red', marginTop: '20px' } }, 'I am mister Red' ),
                Array.prototype.slice.call( this.childNodes )
            ] )
        );
    }

    set loading( val: string ) {
        if ( val === 'true' )
            this.insertBefore( this._loadingElm, this.childNodes[ 0 ] );
        else
            this._loadingElm.remove();
    }

    set heading( val: string ) { this.querySelector( 'h2' ).textContent = val; }
    get heading(): string { return this.querySelector( 'h2' ).textContent || ''; }

    attributeChangedCallback( name, oldValue, newValue ) {
        this[ name ] = newValue;
    }
}

// define it specifying what's extending
customElements.define( 'x-application', Application );