namespace Animate {

    export interface ISearchBoxProps extends React.HTMLAttributes {

        onSearch( e: React.FormEvent, searchText: string );

        /**
         * Only call onSearch when the input loses focus
         */
        triggerOnBlur?: boolean;
    }

    /**
     * Wraps an input box with HTML that makes it look like a search bar.
     * Add a listener for the onChange event and it will be triggered either when the input
     * changes, or the search button is pressed.
     */
    export class SearchBox extends React.Component<ISearchBoxProps, { value: string }> {
        static defaultProps: ISearchBoxProps = {
            onSearch: null,
            triggerOnBlur: true
        };

        /**
         * Creates an instance of the search box
         */
        constructor( props: ISearchBoxProps ) {
            super( props );
            this.state = { value: props.value as string };
        }

        /**
         * Called when the props are updated
         */
        componentWillReceiveProps( nextProps: IVCheckboxProps ) {
            this.setState( {
                value: ( nextProps.value as string !== undefined ? nextProps.value as string : this.state.value )
            });
        }

        /**
         * Called whenever the input changes
         */
        onChange( e: React.FormEvent ) {
            let text = ( e.target as HTMLInputElement ).value as string;
            this.setState( {
                value: text
            });

            if ( this.props.disabled )
                return;

            if ( this.props.triggerOnBlur )
                return;

            if ( this.props.onSearch )
                this.props.onSearch( e, text || '' );
        }

        /**
         * Called whenever the input loses focus
         */
        onBlur( e: React.FormEvent ) {

            let text = ( e.target as HTMLInputElement ).value as string;
            this.setState( {
                value: text
            });

            if ( this.props.disabled )
                return;

            if ( this.props.onSearch )
                this.props.onSearch( e, text || '' );
        }

        /**
         * Creates the component elements
         * @returns {JSX.Element}
         */
        render(): JSX.Element {
            let props: ISearchBoxProps = Object.assign( {}, this.props );
            let text = this.state.value;
            delete props.id;
            delete props.name;
            delete props.placeholder;
            delete props.triggerOnBlur;
            delete props.onSearch;

            return <div {...props} className={'search-box ' +
                ( props.className ? props.className : '' ) +
                ( props.disabled ? ' disabled' : '' ) }>
                <input
                    onKeyUp={( e ) => {
                        if ( e.keyCode === 13 && this.props.onSearch )
                            this.props.onSearch( e, this.state.value || '' );
                    } }
                    onBlur={( e ) => this.onBlur( e ) }
                    onChange={( e ) => this.onChange( e ) }
                    type='text'
                    id={this.props.id}
                    placeholder={this.props.placeholder}
                    name={this.props.name}
                    />
                <label
                    onClick={( e ) => {
                        if ( this.props.disabled )
                            return;

                        if ( this.props.onSearch )
                            this.props.onSearch( e, this.state.value || '' );
                    } }
                    htmlFor={this.props.id || undefined}><span className='fa fa-search' /></label>
            </div>
        }
    }
}