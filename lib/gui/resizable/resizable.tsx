namespace Animate {

    export interface IResizableProps {
        enabled?: boolean;
        target?: HTMLElement;
        onDragStart?( e: React.MouseEvent ): boolean;
        onResized?( size: { width: number; height: number; } ): void;
    }

    /**
     * A wrapper Component that adds handles to allow for resizing of its first child component.
     */
    export class Resizable extends React.Component<IResizableProps, any> {
        static defaultProps: IResizableProps = {
            enabled: true
        };

        private _upProxy;
        private _moveProxy;
        private _allowMouseX: boolean;
        private _allowMouseY: boolean;
        private _originRect: ClientRect;
        private _ghost: HTMLElement;

        /**
         * Creates an instance of the resizer
         */
        constructor( props: IResizableProps ) {
            super( props );

            this._upProxy = this.onMouseUp.bind( this );
            this._moveProxy = this.onMouseMove.bind( this );
            this._allowMouseX = false;
            this._allowMouseY = false;
            this._originRect = null;
            this._ghost = document.createElement( 'div' );
            this._ghost.className = 'resizable ghost';
        }

        /**
         * When unmounting, we remove any listeners that may still remain
         */
        componentWillUnmount() {
            ;
            window.removeEventListener( 'mouseup', this._upProxy );
            window.removeEventListener( 'mousemove', this._moveProxy );
            if ( document.body.contains( this._ghost ) )
                document.body.removeChild( this._ghost );
        }

        /**
         * When the mouse is down on the component, we add the move and up listeners
         */
        onMouseDown( e: React.MouseEvent, allowMouseX: boolean, allowMouseY: boolean ) {
            if ( !this.props.enabled )
                return;

            if ( this.props.onDragStart && this.props.onDragStart( e ) === false )
                return;

            let elm = this.refs[ 'resizable' ] as HTMLElement;

            this._originRect = elm.getBoundingClientRect();
            this._allowMouseX = allowMouseX;
            this._allowMouseY = allowMouseY;

            this._ghost.style.left = this._originRect.left + 'px';
            this._ghost.style.top = this._originRect.top + 'px';
            this._ghost.style.width = this._originRect.width + 'px';
            this._ghost.style.height = this._originRect.height + 'px';

            e.preventDefault();
            window.addEventListener( 'mouseup', this._upProxy );
            window.addEventListener( 'mousemove', this._moveProxy );

            if ( !document.body.contains( this._ghost ) )
                document.body.appendChild( this._ghost );
        }

        /**
         * When the mouse is up we remove the events
         */
        onMouseUp( e: React.MouseEvent ) {
            window.removeEventListener( 'mouseup', this._upProxy );
            window.removeEventListener( 'mousemove', this._moveProxy );
            document.body.removeChild( this._ghost );

            let elm: HTMLElement;

            if ( this.props.target )
                elm = this.props.target;
            else
                elm = ( this.refs[ 'resizable' ] as HTMLElement ).firstElementChild as HTMLElement;

            elm.style.width = this._ghost.style.width;
            elm.style.height = this._ghost.style.height;
        }

        /**
         * When the mouses moves we resize the component
         */
        onMouseMove( e: React.MouseEvent ) {
            const elm = this.refs[ 'resizable' ] as HTMLElement;
            const bounds = elm.getBoundingClientRect();
            const h = this._allowMouseY ? ( e.pageY - this._originRect.top ) : this._originRect.height;
            const w = this._allowMouseX ? ( e.pageX - this._originRect.left ) : this._originRect.width
            this._ghost.style.width = ( w ) + 'px';
            this._ghost.style.height = ( h ) + 'px';

            if ( this.props.onResized )
                this.props.onResized({ width: w, height: h });
        }

        /**
         * Creates the component elements
         */
        render(): JSX.Element {
            return <div ref="resizable"
                className="resizable">
                {this.props.children}
                <div className="east handle" onMouseDown={( e ) => { this.onMouseDown( e, true, false ) } } />
                <div className="south handle" onMouseDown={( e ) => { this.onMouseDown( e, false, true ) } } />
                <div className="south-east handle" onMouseDown={( e ) => { this.onMouseDown( e, true, true ) } } />
            </div>
        }
    }
}