module Animate {

    /**
     * Wraps an input box with HTML that makes it look like a search bar.
     * Add a listener for the onChange event and it will be triggered either when the input
     * changes, or the search button is pressed.
     */
    export class SearchBox extends React.Component<React.HTMLAttributes, any> {

        /**
         * Creates an instance of the search box
         */
        constructor(props: React.HTMLAttributes) {
            super(props);
        }

        /**
         * Creates the component elements
         * @returns {JSX.Element}
         */
        render(): JSX.Element {
            let props : IVFormProps  = Object.assign({}, this.props);
            delete props.id;
            delete props.name;
            delete props.placeholder;

            return <div {...props} className={'search-box ' + (props.className ? props.className : '' )}>
                <input
                    onChange={(e) =>{
                        if (this.props.onChange)
                            this.props.onChange(e);
                    }}
                    type="text"
                    id={this.props.id}
                    placeholder={this.props.placeholder}
                    name={this.props.name}
                />
                <label
                    onClick={(e)=>{
                        if ( this.props.id )
                            return;

                        if (this.props.onChange)
                            this.props.onChange(e);
                    }}
                    htmlFor={this.props.id || undefined}><span className="fa fa-search" /></label>
            </div>
        }
    }
}