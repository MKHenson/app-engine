

export interface IVCheckboxProps extends React.HTMLAttributes {
    onChange?: ( e: React.FormEvent, checked?: boolean, input?: HTMLInputElement ) => void;
    noInteractions?: boolean;
}

export class VCheckbox extends React.Component<IVCheckboxProps, { pristine?: boolean; }> {
    static defaultProps: IVCheckboxProps = {
        noInteractions: false
    }

    /**
     * Creates an instance
     */
    constructor( props: IVCheckboxProps ) {
        super( props );
        this.state = {
            pristine: true
        }
    }

    /**
     * Called whenever the checkbox input changes
     */
    onChange( e: React.FormEvent ) {
        const input = e.target as HTMLInputElement;

        this.setState( {
            pristine: false
        });

        if ( this.props.onChange )
            this.props.onChange( e, input.checked, input );
    }

    /**
     * Gets if this input has not been touched by the user. False is returned if it has been
     */
    get pristine(): boolean {
        return this.state.pristine!;
    }

    /**
    * Creates the component elements
    */
    render(): JSX.Element {
        let props: IVCheckboxProps = Object.assign( {}, this.props );
        delete props.id;
        delete props.name;
        delete props.checked;
        delete props.label;
        delete props.noInteractions;
        delete props.onChange;

        let className = 'v-checkbox fa ' + ( this.props.className || '' ) + ( this.props.noInteractions ? ' no-interaction' : '' );
        if ( !this.state.pristine )
            className += ' dirty';

        return <span {...props} className={className}>
            <input onChange={( e ) => {
                this.onChange( e )
            } }
                id={( this.props.id ? this.props.id : undefined )}
                name={( this.props.name ? this.props.name : undefined )}
                type="checkbox"
                ref="check"
                checked={this.props.checked || false} />
            <label
                onClick={( e ) => {
                    if ( this.props.noInteractions )
                        return;

                    if ( !this.props.id ) {
                        if ( this.props.onChange ) {
                            let input = this.refs[ 'check' ] as HTMLInputElement;
                            this.props.onChange( e, !input.checked, input );
                        }
                    }
                } }
                className="unselectable"
                htmlFor={( this.props.id ? this.props.id : undefined )}>
                {this.props.children}
                {this.props.label}
            </label>
        </span>
    }
}