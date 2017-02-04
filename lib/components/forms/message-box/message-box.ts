import { Window } from '../../window/window';
import { ButtonPrimary, ButtonSuccess, ButtonError } from '../../buttons/buttons';
import { JML } from '../../../jml/jml';

enum MessageBoxType {
    REGULAR,
    SUCCESS,
    ERROR
}

/**
 * A specialized modal window used for showing messages to the user. Typically accessed
 * via its static methods. The modals can be chained allowing you to bring multiple issues
 * to the user.
 *
 * eg:
 * MessageBox.show('Do you think this is correct?', ['Yes', 'No'] ).then( ( answer ) => {
 *  if (answer === 'Yes' )
 *      return MessageBox.success('Which do you prefer?', ['A', 'B'] )
 * })
 */
export class MessageBox extends Window {

    public onChange: ( button: string ) => void;

    /**
     * Creates a new instance of the message box
     */
    private constructor( message: string, buttons: string[], type: MessageBoxType ) {
        super();

        this.classList.toggle( 'message-box', true );
        this.modal = true;
        this.controlBox = false;
        this.resizable = false;
        this.content.appendChild( JML.p( { className: 'message' }, message ) );
        this.content.appendChild( JML.div( { className: 'buttons' }, buttons.map(( btnText ) => {
            let button: HTMLButtonElement;
            if ( type === MessageBoxType.SUCCESS )
                button = new ButtonSuccess();
            else if ( type === MessageBoxType.ERROR )
                button = new ButtonError();
            else
                button = new ButtonPrimary();

            button.innerHTML = btnText;
            button.onclick = ( e ) => this.onButtonClick( e, btnText );
            return button;
        }) ) );
    }

    /**
     * Hide the window when a button is clicked.
     */
    onButtonClick( e: MouseEvent, button: string ) {
        if ( this.onChange )
            this.onChange( button );

        this.hide();
    }

    /**
     * A helper function for showing an success modal box
     * @param message The message to display
     * @param buttons An array of strings that represent the button choices for the modal
     * @param callback An optional callback function for when a button is clicked
     */
    static success( message: string, buttons: string[] = [ 'Ok' ], callback?: ( button ) => void ) {
        return new Promise<string>( function( resolve ) {
            let mBox = new MessageBox( message, buttons, MessageBoxType.SUCCESS );
            mBox.onChange = ( button ) => {
                if ( callback )
                    callback( button );
                return resolve( button );
            }

            mBox.show();
        });
    }

    /**
     * A helper function for showing a regular modal box
     * @param message The message to display
     * @param buttons An array of strings that represent the button choices for the modal
     * @param callback An optional callback function for when a button is clicked
     */
    static show( message: string, buttons: string[] = [ 'Ok' ], callback?: ( button ) => void ) {
        return new Promise<string>( function( resolve ) {
            let mBox = new MessageBox( message, buttons, MessageBoxType.REGULAR );
            mBox.onChange = ( button ) => {
                if ( callback )
                    callback( button );
                return resolve( button );
            }

            mBox.show();
        });
    }

    /**
     * A helper function for showing an error modal box
     * @param message The message to display
     * @param buttons An array of strings that represent the button choices for the modal
     * @param callback An optional callback function for when a button is clicked
     */
    static async error( message: string, buttons: string[] = [ 'Ok' ], callback?: ( button ) => void ): Promise<string> {
        return new Promise<string>( function( resolve ) {
            let mBox = new MessageBox( message, buttons, MessageBoxType.ERROR );
            mBox.onChange = ( button ) => {
                if ( callback )
                    callback( button );
                return resolve( button );
            }

            mBox.show();
        });
    }
}