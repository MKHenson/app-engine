module Animate
{
    export enum ValidationType
    {
        EMAIL = 1,
        NUMBER = 2,
        ALPHANUMERIC = 4,
        NOT_EMPTY = 8,
        NO_HTML = 16,
        ALPHANUMERIC_PLUS = 32,
        ALPHA_EMAIL = 64
    }


    export interface IVInputProps extends React.HTMLAttributes
    {
        validator?: ValidationType;
        value: string;
        minCharacters?: number;
        maxCharacters?: number;
        onValidationError?: (e: Error, target: VInput) => void;
    }


    export class VInput extends React.Component<IVInputProps, { error? : boolean, value?: string }>
    {
        private static validators : { [type: number ] : { regex: RegExp, name : string, negate : boolean; message : string; } };
        private _originalClassName: string;

        constructor(parameters)
        {
            super();
            if (!VInput.validators)
            {
                VInput.validators = {};
                VInput.validators[ValidationType.ALPHANUMERIC] = { regex: /^[a-z0-9]+$/i, name: "alpha-numeric", negate: false, message: "Only alphanumeric characters accepted" };
                VInput.validators[ValidationType.NOT_EMPTY] = { regex: /\S/, name: "non-empty", negate: false, message: "Cannot be empty" };
                VInput.validators[ValidationType.ALPHANUMERIC_PLUS] = { regex: /^[a-zA-Z0-9_\-!]+$/, name: "alpha-numeric-plus", negate: false, message: "Only alphanumeric, '_', '-' and '!' characters accepted" };
                VInput.validators[ValidationType.EMAIL] = { regex: /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i, name: "email", negate: false, message: "Email format not accepted" };
                VInput.validators[ValidationType.NO_HTML] = { regex: /(<([^>]+)>)/ig, name: "no-html", negate: true, message: "HTML is not allowed" };
                VInput.validators[ValidationType.ALPHA_EMAIL] = { regex: /^[a-zA-Z0-9_\-!@\.]+$/, name: "email-plus", negate: false, message: "Only alphanumeric, '_', '-', '@' and '!' characters accepted" };
            }
        }

        componentWillMount(): void
        {
            this._originalClassName = this.props.className || '';
            var err = this.validate(this.props.value);

             // Call the optional error callback
            if ( err && this.props.onValidationError )
               this.props.onValidationError( new Error(err), this );

            this.setState({ value : this.props.value, error: (err? true: false) });
        }

        validate(val : string): string
        {
            let validators = VInput.validators;
            let validator = null;
            let error : boolean = false;
            let errorMsg: string = null;

            val = ( val !== undefined ? val : this.state.value );

            if (this.props.minCharacters !== undefined && val.length < this.props.minCharacters )
                errorMsg = `You have too few characters`;
            if (this.props.maxCharacters !== undefined && val.length > this.props.maxCharacters )
                errorMsg = `You have too many characters`;

            for ( let i in ValidationType )
            {
                if ( !isNaN(parseInt(i)) )
                    continue;

                if ( !error && ( this.props.validator & ValidationType[i as string] ) & ValidationType[i as string] )
                {
                    validator = validators[ ValidationType[i as string] ];
                    let match = val.match( validator.regex );

                    if ( validator.negate )
                    {
                        if (match)
                        {
                            errorMsg = validator.message;
                            break;
                        }
                    }

                    if ( !validator.negate )
                    {
                        if (!match)
                        {
                            errorMsg = validator.message;
                            break;
                        }
                    }
                }
            }

            return errorMsg;
        }

        private onChange(e: React.FormEvent)
        {
            var val = (e.target as HTMLInputElement).value;
            var err = this.validate(val)

            // Call the optional error callback
            if ( err && this.props.onValidationError )
               this.props.onValidationError( new Error(err), this );

            this.setState({ value: val, error: (err? true : false) });
            if (!err)
                this.props.onChange(e);
        }

        render(): JSX.Element
        {
            // Remove the custom properties
            const divProps : IVInputProps  = Object.assign({}, this.props);
            delete divProps.validator;
            delete divProps.minCharacters;
            delete divProps.maxCharacters;


            return <input
                {...divProps}
                className={(this.state.error ? 'bad-input ' + this._originalClassName : this._originalClassName)}
                value={this.state.value}
                onChange={(e)=>{ this.onChange(e); }}
            />;
        }
    }
}