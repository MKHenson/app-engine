module Animate
{
    export class VForm extends React.Component<any, { error? : boolean }>
    {
        private _proxyInputProblem: any;

        constructor()
        {
            super();
            this._proxyInputProblem = this.onInputProblem.bind(this);
            this.state = {
                error : false
            }
        }

        onInputProblem( e : Error, input: VInput )
        {
            this.setState({error: true});
        }

        componentDidMount() {
            var children : [React.Component<any, any>];

            React.Children.map(this.props.children, (c: React.ReactElement<IVInputProps>) => {

                if ( c.type == VInput )
                    ( c.props ).onValidationError = this._proxyInputProblem;
            });
        }

        componentWillUnmount()
        {
            var children : [React.Component<any, any>];

            React.Children.map(this.props.children, (c: React.ReactElement<IVInputProps>) => {

                if ( c.type == VInput )
                    ( c.props ).onValidationError = null;
            })

            // if( Array.isArray( this.props.children ) )
            //     children = this.props.children;
            // else
            //     children = [this.props.children];

            // for (var i = 0, l = children.length; i < l; i++)
            //     if ( children[i] instanceof VInput )
            //         ( children[i] as VInput ).props.onValidationError = null;
        }

        onSubmit(e: React.FormEvent)
        {
            e.preventDefault();
            this.props.onSubmit(e);
        }

        render(): JSX.Element
        {
            // Remove the custom properties
            const props : IVInputProps  = Object.assign({}, this.props);
            return <form
                {...props}
                onSubmit={(e)=>{ this.onSubmit(e); }}>
                     {this.props.children}
                </form>;
        }
    }
}
