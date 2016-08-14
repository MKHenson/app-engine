module Animate {

    export interface IReactWindowProps {
        open: boolean;
        title: string;
        modal?: boolean;
        popup?: boolean;
        controlBox? : boolean;
    }

    export interface IReactWindowState {
        open: boolean;
        centered? : boolean;
    }

    export class ReactWindow extends React.Component<IReactWindowProps, IReactWindowState> {
        static defaultProps: IReactWindowProps = {
            open: true,
            modal: true,
            popup: false,
            controlBox: true,
            title: null
        };
        private static _windowView: HTMLElement;

        /**
         * Creates an instance of the react window
         */
        constructor(props: IReactWindowProps) {
            super(props);

            if (!ReactWindow._windowView) {
                ReactWindow._windowView = document.createElement("div");
                ReactWindow._windowView.className = "window-view";
            }

            this.state = {
                open : props.open,
                centered: true
            };
        }

        // private createWindow() {
        //     let view = ReactWindow._windowView;

        //     // Add the tooltip to the dom
        //     document.body.appendChild( view );
        //     ReactDOM.render( , view );
        // }

        // private removeWindow() {
        //     ReactDOM.unmountComponentAtNode( ReactWindow._windowView );
        // }

         /**
         * Creates the component elements
         * @returns {JSX.Element}
         */
        render(): JSX.Element {

            return <div>
                <div className='modal-backdrop dark-modal'></div>
                <div className='window shadow-med background'>
                    <div className='window-control-box background-haze'>
                        <div className='close-but black-tint'>X</div>
                        <div className='window-header'>{this.props.title}</div>
                        <div className='fix'></div>
                    </div>
                    <div className={'window-content' + (this.props.controlBox ? ' no-control' : '')}></div>
                </div>
            </div>;
        }

        show( x: number, y: number ) {
            this.setState({
                open: true
            });
        }

        hide() {
            this.setState({
                open: false
            });
        }
    }
}