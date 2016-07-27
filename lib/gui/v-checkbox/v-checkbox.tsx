module Animate
{
    export class VCheckbox extends React.Component<React.HTMLAttributes, {checked?: boolean, className?: string }>
    {
        /**
         * Creates an instance
         */
        constructor(props: React.HTMLAttributes)
        {
            super();
            this.state = {
                checked : props.checked || false,
                className : "v-checkbox fa " + ( props.className || '' )
            }
        }

        /**
         * Called whenever the checkbox input changes
         * @param {React.FormEvent} e
         */
        private onChange(e : React.FormEvent)
        {
            this.setState( {checked: (e.target as HTMLInputElement).checked } );
            if (this.props.onChange)
                this.props.onChange(e)
        }

         /**
         * Creates the component elements
         * @returns {JSX.Element}
         */
        render(): JSX.Element
        {
            let props : IVInputProps  = Object.assign({}, this.props);
            delete props.id;
            delete props.name;
            delete props.checked;
            delete props.label;

            return <span {...props} className={this.state.className}>
                <input onChange={(e)=>{
                        this.onChange(e)
                    }}
                    id={(this.props.id ? this.props.id : null)}
                    name="radio-group"
                    type="checkbox"
                    checked={this.state.checked} value={this.state.checked} />
                <label
                    onClick={(e)=>{
                        this.setState({ checked: !this.state.checked });
                        if (this.props.onChange)
                            this.props.onChange(e);
                    }}
                    className="unselectable"
                    htmlFor={(this.props.id ? this.props.id : null)}>
                    {this.props.label}
                </label>
            </span>
        }
    }
}