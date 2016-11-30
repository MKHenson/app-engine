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

// const ConnectedApp = ReactRedux.connect<IApplicationState, any, any>(( state: HatcheryEditor.IStore ) => {
//     return {
//         splash: state.splash,
//         user: state.user
//     }
// })( Application );

// export { ConnectedApp as Application };

export type Children = HTMLElement[] | HTMLElement | string;

export function html( type: string | HTMLElement, attrs: React.HTMLAttributes, children?: Children ): HTMLElement {
    let elm : HTMLElement;

    if ( typeof type === 'string')
        elm = document.createElement( type );
    else
        elm = type;

    for ( var a in attrs )
        elm[ a ] = attrs[ a ];

    if ( typeof children === 'string' )
        elm.textContent = children;
    else if ( Array.isArray( children ) ) {
        for ( const child of children )
            if ( Array.isArray( child ) ) {
                for ( const childElm of child )
                    elm.appendChild( childElm );
            }
            else
                elm.appendChild( child );
    }
    else if ( children ) {
        elm.appendChild( children );
    }

    return elm;
}

export function div( atts: any, children?: Children ): HTMLElement { return html( 'div', atts, children ); }
export function h2( atts: any, children?: Children ): HTMLElement { return html( 'h2', atts, children ); }
export function a( atts: any, children?: Children ): HTMLElement { return html( 'a', atts, children ); }
export function i( atts: any, children?: Children ): HTMLElement { return html( 'i', atts, children ); }


export class Taco extends HTMLElement {
    constructor() {
        super();
        this.appendChild( div( null, 'This is TACO' ) );
    }
}


/**
 * The main GUI component of the application.
 */
export class Application extends HTMLElement {

    static get observedAttributes() {
        return [ 'loading', 'id' ];
    }

    private _loadingElm: HTMLElement;

    constructor() {
        super();
        // this._loadingElm = document.createElement( 'div' );
        // this._loadingElm.innerHTML = `
        //     <div className="loading-screen">
        //         <div className="loading-message fade-in">
        //             <h2>Loading Hatchery Editor...</h2>
        //             <i className="fa fa-cog fa-spin fa-3x fa-fw"></i>
        //         </div>
        //     </div>`;

        this.setAttribute( 'id', 'application' );

        this._loadingElm =
            div( { class: 'loading-screen' }, [
                div( { class: 'loading-message fade-in' }, [
                    h2( {  onclick: () => {  alert( 'Hello world!' );  } }, 'Loading Hatchery Editor...' ),
                    i( { class: "fa fa-cog fa-spin fa-3x fa-fw" }),
                    <i class="fa fa-cog fa-spin fa-3x fa-fw"></i>
                ] )
            ] );

        this.appendChild(
            div( { class: "splash-view" }, [
                new Taco(),
                Array.prototype.slice.call( this.childNodes )
            ])
        );
    }

    set loading( val: boolean ) {
        if ( val )
            this.insertBefore( this._loadingElm, null );
        else
            this._loadingElm.remove();
    }

    attributeChangedCallback( name, oldValue, newValue ) {
        switch ( name ) {
            case 'loading':
                this.loading = newValue === 'true' ? true : false;
                break;
        }
    }
}

// define it specifying what's extending
customElements.define( 'x-application', Application );
customElements.define( 'x-taco', Taco );