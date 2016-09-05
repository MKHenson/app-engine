module Animate {

    export interface IReactWindowProps {
        autoCenter? :boolean;
        title?: string;
        modal?: boolean;
        popup?: boolean;
        controlBox? : boolean;
        showCloseButton? : boolean;
        canResize? : boolean;
        className?: string;
        _id?: number;
        _closing?: () => void;
        x?: number;
        y?: number;
    }

    export interface IReactWindowState {
        centered? : boolean;
    }

    /**
     * The base class for all windows in the application. Most windows will be derived from this class.
     * You can display/hide the window by using the static Window.show and Window.hide methods.
     */
    export class ReactWindow<T extends IReactWindowProps, S extends IReactWindowState> extends React.Component<T, S> {
        private static _openWindows: number = 0;
        private static _windows : { [id: number]: {
            window : HTMLElement,
            jsx : JSX.Element
        }} = {};

        static defaultProps: IReactWindowProps = {
            modal: true,
            popup: false,
            controlBox: true,
            showCloseButton: true,
            title: null,
            autoCenter: true,
            canResize: true
        };

        private _resizeProxy: any;
        private _mouseMoveProxy: any;
        private _mouseUpProxy: any;
        private _mouseDeltaX: number;
        private _mouseDeltaY: number;

        /**
         * Creates an instance of the react window
         */
        constructor(props: T) {
            super(props);

            this._resizeProxy = this.onResize.bind(this);
            this._mouseMoveProxy = this.onMouseMove.bind(this);
            this._mouseUpProxy = this.onMouseUp.bind(this);
            this._mouseDeltaX = 0;
            this._mouseDeltaY = 0;
            this.state = ({
                centered: true
            } as IReactWindowState) as S;
        }

        /**
         * Shows a React window component to the user
         * @param {React.ComponentClass<IReactWindowProps>} windowType The Class of Window to render.
         * @param {IReactWindowProps} props The properties to use for the window component
         */
        static show(windowType : React.ComponentClass<IReactWindowProps>, props : IReactWindowProps = {}) {
            let id = ReactWindow._openWindows + 1;
            let windowView = document.createElement("div");
            windowView.className = "window-view";
            ReactWindow._openWindows = id;

            props._closing = () => {
                ReactWindow._windows[id].window.remove();
                ReactDOM.unmountComponentAtNode( ReactWindow._windows[id].window );
                ReactWindow._windows[id] = null;
            };

            let component = React.createElement<IReactWindowProps>(windowType, props);
            ReactWindow._windows[id] = {
                jsx: component,
                window : windowView
            };

            // Add the tooltip to the dom
            document.body.appendChild( windowView );
            ReactDOM.render( component, windowView );
            return ReactWindow._openWindows;
        }

        /**
         * Hides/Removes a window component by id
         * @param {number} id
         */
        static hide(id : number) {
            ReactDOM.unmountComponentAtNode( ReactWindow._windows[id].window );
            ReactWindow._windows[id] = null;
        }

        /**
         * When the user clicks the the header bar we initiate its dragging
         */
        onHeaderDown(e: React.MouseEvent) {
            e.preventDefault();
            let w = this.refs['resizable'] as ReactWindow<T, S>;
            let elm = ReactDOM.findDOMNode(w) as HTMLElement;
            let bounds = elm.getBoundingClientRect();

            this._mouseDeltaX = e.pageX - bounds.left;
            this._mouseDeltaY = e.pageY - bounds.top;

            window.addEventListener('mouseup', this._mouseUpProxy);
            document.body.addEventListener('mousemove', this._mouseMoveProxy);
        }

        /**
         * Called when the window is resized
         */
        onResize(e) {

            // When the component is mounted, check if it needs to be centered
            if ( this.props.autoCenter ) {
                let w = this.refs['resizable'] as ReactWindow<T,S>;
                let elm = ReactDOM.findDOMNode(w) as HTMLElement;
                elm.style.left = (( document.body.offsetWidth * 0.5 ) - ( elm.offsetWidth * 0.5 )) + 'px';
                elm.style.top = (( document.body.offsetHeight * 0.5 ) - ( elm.offsetHeight * 0.5 )) + 'px';
            }
        }

        /**
         * When the mouse moves and we are dragging the header bar we move the window
         */
        onMouseMove(e: MouseEvent) {
            let w = this.refs['resizable'] as ReactWindow<T, S>;
            let elm = ReactDOM.findDOMNode(w) as HTMLElement;
            let x = e.pageX -  this._mouseDeltaX;
            let y = e.pageY -  this._mouseDeltaY;
            elm.style.left = x + 'px';
            elm.style.top = y + 'px';
        }

        /**
         * When the mouse is up we remove the dragging event listeners
         */
        onMouseUp(e: MouseEvent) {
            window.removeEventListener('mouseup', this._mouseUpProxy);
            document.body.removeEventListener('mousemove', this._mouseMoveProxy);
        }

        /**
         * When the component is mounted
         */
        componentDidMount() {

            window.addEventListener('resize', this._resizeProxy);

            let w = this.refs['resizable'] as ReactWindow<T, S>;
            let elm = ReactDOM.findDOMNode(w) as HTMLElement;

            // When the component is mounted, check if it needs to be centered
            if ( this.props.autoCenter ) {
                elm.style.left = (( document.body.offsetWidth * 0.5 ) - ( elm.offsetWidth * 0.5 )) + 'px';
                elm.style.top = (( document.body.offsetHeight * 0.5 ) - ( elm.offsetHeight * 0.5 )) + 'px';
            }
            else {
                elm.style.left = (this.props.x || 0) + 'px';
                elm.style.top = (this.props.y || 0) + 'px';
            }
        }

        /**
         * Called when the window is to be removed
         */
        componentWillUnmount() {
            window.removeEventListener('resize', this._resizeProxy);
            window.removeEventListener('mouseup', this._mouseUpProxy);
            document.body.removeEventListener('mousemove', this._mouseMoveProxy);
        }

        /**
         * When we click the modal we highlight the window
         */
        onModalClick() {
            let elm = ReactDOM.findDOMNode(this.refs['window']) as HTMLElement;
            let className = 'window' + ( this.props.className ? ' ' + this.props.className : '' );

            elm.className = className;
            setTimeout(function() {
                elm.className = className + ' anim-shadow-focus';
            }, 30);
        }

        /**
         * When we click the close button
         */
        onClose() {
            this.props._closing();
        }

        /**
         * Gets the content JSX for the window. Typically this is the props.children, but can be overriden
         * in derived classes
         */
        getContent() : React.ReactNode {
            return this.props.children;
        }

        /**
         * Creates the component elements
         * @returns {JSX.Element}
         */
        render(): JSX.Element {
            let controlBox : JSX.Element;

            if (this.props.controlBox) {
                controlBox = <div className='window-control-box' onMouseDown={(e) =>{this.onHeaderDown(e) }}>
                    { this.props.showCloseButton ?
                        <div  onClick={() => { this.onClose(); }} className='close-but'>X</div> : null }
                    <div className='window-header'>{this.props.title}</div>
                    <div className='fix'></div>
                </div>
            }
            return <div>
                {(this.props.modal ? <div className='modal-backdrop' onClick={()=>{ this.onModalClick(); }}></div> : null)}
                <Resizable ref="resizable" enabled={this.props.canResize}>
                    <div className={'window' + ( this.props.className ? ' ' + this.props.className : '' )} ref="window">
                        {controlBox}
                        <div className={'window-content' + (!this.props.controlBox ? ' no-control' : '')}>
                            {this.getContent()}
                        </div>
                    </div>
                </Resizable>
            </div>;
        }
    }
}