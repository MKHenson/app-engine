import { ReactWindow, IReactWindowProps, IReactWindowState } from '../../window/react-window';
import { VForm } from '../../v-form/v-form';
import { VInput } from '../../v-input/v-input';
import { Attention } from '../../attention/attention';
import { ButtonLink, ButtonSuccess } from '../../buttons/buttons';
import { ValidationType, AttentionType } from '../../../setup/enums';
import { capitalize } from '../../../core/utils';

export interface IRenameFormProps extends IReactWindowProps {
    name?: string;
    onRenaming?: ( newName: string, prevName: string ) => Error;
    onCancel?: () => void;
    onOk?: ( newName: string ) => void;
}

export interface IRenameFormState extends IReactWindowState {
    $errorMsg?: string | null;
}

/**
 * This form is used to rename objects
 */
export class RenameForm extends ReactWindow<IRenameFormProps, IRenameFormState> {

    static defaultProps: IRenameFormProps = {
        controlBox: true,
        showCloseButton: false,
        canResize: false,
        autoCenter: true,
        title: 'Please Enter a Name',
        modal: true,
        className: 'rename-form'
    }

    /**
     * Creates a new instance
     */
    constructor( props: IRenameFormProps ) {
        super( props );
        this.state = {
            $errorMsg: null
        };
    }

    /**
     * Hides the form
     */
    onCancel() {
        if ( this.props.onCancel )
            this.props.onCancel();

        this.onClose();
    }

    /**
     * Gets the content JSX for the window.
     */
    getContent(): React.ReactNode {
        return (
            <VForm onSubmitted={( json ) => { this.ok( json.name ); } }
                onValidationError={( errors ) => { this.setState( { $errorMsg: `${capitalize( errors[ 0 ].name )} : ${errors[ 0 ].error}` }) } }
                onValidationsResolved={() => { this.setState( { $errorMsg: null }) } }>
                <VInput type="text" name="name" placeholder="Please enter a name"
                    validator={ValidationType.NOT_EMPTY | ValidationType.NO_HTML}
                    value={this.props.name}
                    />
                {this.state.$errorMsg ? <Attention allowClose={false} mode={AttentionType.ERROR}>{this.state.$errorMsg}</Attention> : null}
                <div className="buttons-container">
                    <ButtonLink type="button" onClick={( e ) => { e.preventDefault(); this.onCancel(); } }>
                        CANCEL
                    </ButtonLink>
                    <ButtonSuccess type="submit">
                        <i className="fa fa-check" aria-hidden="true"></i> OK
                    </ButtonSuccess>
                </div>
            </VForm>
        )
    }

    /**
     * Called when the form is submitted
     */
    ok( name: string ) {
        let curName: string = name;
        let prevName = ( this.props.name ? this.props.name : '' );
        let error: Error | null = null;

        if ( this.props.onRenaming )
            error = this.props.onRenaming( curName, prevName );

        if ( error )
            return this.setState( { $errorMsg: error.message });

        if ( this.props.onOk )
            this.props.onOk( name );

        this.onClose();
    }
}