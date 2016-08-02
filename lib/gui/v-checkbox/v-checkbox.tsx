module Animate {
    export class VCheckbox extends React.Component<React.HTMLAttributes, {checked?: boolean, className?: string; pristine? : boolean; }> {
        /**
         * Creates an instance
         */
        constructor(props: React.HTMLAttributes) {
            super(props);
            this.state = {
                checked : props.checked || false,
                className : "v-checkbox fa " + ( props.className || '' ),
                pristine: true
            }
        }

        /**
         * Called whenever the checkbox input changes
         * @param {React.FormEvent} e
         */
        private onChange(e : React.FormEvent) {
            this.setState( {
                checked: (e.target as HTMLInputElement).checked,
                pristine: false
            } );
            if (this.props.onChange)
                this.props.onChange(e)
        }

        /**
         * Gets if this input has not been touched by the user. False is returned if it has been
         * @returns {boolean}
         */
        get pristine() : boolean {
            return this.state.pristine;
        }

         /**
         * Creates the component elements
         * @returns {JSX.Element}
         */
        render(): JSX.Element {
            let props : IVInputProps  = Object.assign({}, this.props);
            delete props.id;
            delete props.name;
            delete props.checked;
            delete props.label;

            var className = this.state.className;
            if (!this.state.pristine)
                className += ' dirty';

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