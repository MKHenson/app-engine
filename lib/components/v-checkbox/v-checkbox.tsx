namespace Animate {

    export interface IVCheckboxProps extends React.HTMLAttributes {
        onChecked?: ( e: React.FormEvent, checked: boolean, input: HTMLInputElement ) => void;
        noInteractions?: boolean;
    }

    export class VCheckbox extends React.Component<IVCheckboxProps, { checked?: boolean, pristine?: boolean; }> {
        static defaultProps: IVCheckboxProps = {
            noInteractions: false
        }

        /**
         * Creates an instance
         */
        constructor( props: IVCheckboxProps ) {
            super( props );
            this.state = {
                checked: props.checked || false,
                pristine: true
            }
        }

        /**
         * Called whenever the checkbox input changes
         */
        onChange( e: React.FormEvent ) {
            let input = e.target as HTMLInputElement;

            this.setState( {
                checked: input.checked,
                pristine: false
            });
            if ( this.props.onChange )
                this.props.onChange( e );
            if ( this.props.onChecked )
                this.props.onChecked( e, input.checked, input );
        }

        /**
         * Called when the props are updated
         */
        componentWillReceiveProps( nextProps: IVCheckboxProps ) {
            if ( nextProps.checked !== this.props.checked )
                this.setState( { checked: nextProps.checked });
        }

        /**
         * Gets the current checked state of the input
         */
        get checked(): boolean { return this.state.checked!; }

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
            delete props.onChecked;
            delete props.noInteractions;

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
                    checked={this.state.checked} />
                <label
                    onClick={( e ) => {
                        if ( this.props.noInteractions )
                            return;

                        if ( !this.props.id ) {
                            let checked = !this.state.checked;
                            this.setState( { checked: checked });
                            if ( this.props.onChange )
                                this.props.onChange( e );
                            if ( this.props.onChecked ) {
                                let input = this.refs[ 'check' ] as HTMLInputElement;
                                this.props.onChecked( e, checked, input );
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
}