import { AttentionType } from '../../setup/enums';
import { JML } from '../../jml/jml';

/**
 * A simple component for displaying a styled message to the user.
 *
 * eg:
 * const box = new Attention();
 * box.canClose = true; // Show the close button
 * box.showIcon = true; // Shows the message icon
 * box.text = "Hello world";
 * box.mode = AttentionType.WARNING;
 */
export class Attention extends HTMLElement {

    private _mode: AttentionType;

    static get observedAttributes() {
        return [
            'text',
            'mode',
            'show-icon',
            'can-close'
        ];
    }

    /**
     * Creates an instance of the Attention box
     */
    constructor() {
        super();
        this._mode = AttentionType.SUCCESS;
        this.classList.toggle( 'success', true );
        this.classList.toggle( 'with-icon', true );

        this.appendChild(
            JML.div( { className: 'icon' },
                [
                    JML.span( { className: 'fa fa-check' })
                ] )
        );
        this.appendChild(
            JML.div( { className: 'message' })
        );
    }

    /**
     * If the attributes change we update the internal state
     */
    attributeChangedCallback( name: string, oldValue: string, newValue: string ) {
        switch ( name ) {
            case 'text':
                this[ name ] = newValue;
                break;
            case 'show-icon':
                this.showIcon = newValue === 'true' ? true : false;
                break;
            case 'can-close':
                this.canClose = newValue === 'true' ? true : false;
                break;
            case 'mode':
                this.mode = AttentionType[ newValue ];
                break;
        }
    }

    /**
     * Gets if the attention box enables the close button that removes the element when clicked
     */
    get canClose(): boolean {
        return this.classList.contains( 'with-icon' );
    }

    /**
     * Sets if the attention box enables the close button that removes the element when clicked
     */
    set canClose( val: boolean ) {
        const closeButton = this.querySelector( '.close' );
        if ( val && !closeButton ) {
            this.appendChild( JML.span( {
                className: 'close fa fa-times', onclick: () => {
                    this.classList.toggle( 'fade-out', true )
                    setTimeout(() => this.remove(), 500 )
                }
            }) );
        }
        else if ( !val && closeButton ) {
            closeButton.remove();
        }
    }

    /**
     * Gets if the attention box icon is shown
     */
    get showIcon(): boolean {
        return this.classList.contains( 'with-icon' );
    }

    /**
     * Sets if the attention box icon is shown
     */
    set showIcon( val: boolean ) {
        this.classList.toggle( 'with-icon', val );
    }

    /**
     * Gets the attention box message text
     */
    get text(): string {
        const span = this.querySelector( '.message' ) as HTMLSpanElement;
        return span.innerText;
    }

    /**
     * Sets the attention box message text
     */
    set text( val: string ) {
        const span = this.querySelector( '.message' ) as HTMLSpanElement;
        span.innerText = val;
    }

    /**
     * Gets the attention box mode, which describes the style of message
     */
    get mode(): AttentionType {
        return this._mode;
    }

    /**
     * Sets the attention box mode, which describes the style of message
     */
    set mode( val: AttentionType ) {
        const span = this.querySelector( 'span' ) as HTMLSpanElement;
        span.classList.toggle( 'fa-exclamation-triangle', val === AttentionType.ERROR ? true : false );
        span.classList.toggle( 'fa-exclamation-circle', val === AttentionType.WARNING ? true : false );
        span.classList.toggle( 'fa-check', val === AttentionType.SUCCESS ? true : false );
        this.classList.toggle( 'error', val === AttentionType.ERROR ? true : false );
        this.classList.toggle( 'warning', val === AttentionType.WARNING ? true : false );
        this.classList.toggle( 'success', val === AttentionType.SUCCESS ? true : false );
        this._mode = val;
    }
}