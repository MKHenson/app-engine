module Animate
{
    export interface IVFormProps extends React.HTMLAttributes
    {
        onSubmitted: (e: React.FormEvent, json: any ) => void;
        onValidationError: (e : { name:string, error: string }[], form: VForm) => void;
        onValidationsResolved: (form: VForm) => void;
    }

    export class VForm extends React.Component<IVFormProps, { error? : boolean }>
    {
        private _proxyInputProblem: any;
        private _className: string;

        private _values: {
            [name:string]: {
                error: string,
                value : string | boolean | number
            }
        };

        constructor()
        {
            super();
            this._values = {};
            this.state = {
                error : false
            }
        }

        onSubmit(e: React.FormEvent)
        {
            e.preventDefault();
            let error = false;

            for (let i in this.refs)
                if ((this.refs[i] as VInput).state.error)
                {
                    (this.refs[i] as VInput).highlightError();
                    error = true;
                }
                else
                    (this.refs[i] as VInput).highlightError(false);

            if (error)
                return;


            this.props.onSubmitted( e, this._values );
        }

        componentWillMount()
        {
            this._className = this.props.className || '';
        }

        onChange(e : React.FormEvent)
        {
            let input = (e.target as HTMLInputElement);
            this._values[input.name] = { value: input.value, error : null };
        }

        onError(e : Error, target : VInput )
        {
            let wasError = this.state
            let errors: { name:string, error: string }[] = [];

            // Check if there was previously an error
            for (let i in this._values )
                if (this._values[i].error)
                {
                    wasError = true;
                    break;
                }

            // Check there are any subsequent errors
            this._values[target.props.name] = { value: target.state.value, error : ( e ? e.message : null ) };
            for (let i in this._values )
                if (this._values[i].error)
                    errors.push({ name : i, error: this._values[i].error });

            // Notify any events
            if ( this.props.onValidationError && errors.length > 0 )
                this.props.onValidationError( errors, this);
            else if ( wasError && errors.length == 0 && this.props.onValidationsResolved )
                this.props.onValidationsResolved(this);
        }

        render(): JSX.Element
        {
            // Remove the custom properties
            let props : IVFormProps  = Object.assign({}, this.props);
            delete props.onSubmitted;
            delete props.onValidationError;
            delete props.onValidationsResolved;

            return <form
                {...props}
                className={'v-form ' + this._className}
                onSubmit={(e)=>{ this.onSubmit(e); }}>
                {
                    React.Children.map( this.props.children, ( i : React.ReactElement<any>, index ) => {
                        if ( i.type == VInput )
                            return React.cloneElement( i, {
                                ref: index.toString(),
                                onChange : (e)=>{ this.onChange( e ); },
                                onValidationError : (e, input) => { this.onError( e, input ) },
                                onValidationResolved : (input) => { this.onError( null, input ) }
                            } as Animate.IVInputProps )
                        else
                            return i;
                    })
                }
                </form>;
        }
    }
}
