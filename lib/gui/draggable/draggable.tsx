module Animate {

    export interface IDraggableProps {
        enabled? : boolean;
        x: number;
        y: number;
        onMove?: (x: number, y: number) => void;
    }

    export class Draggable extends React.Component<IDraggableProps, any> {
        static defaultProps : IDraggableProps = {
            enabled: true,
            x: 0,
            y: 0,
            onMove: null
        };

        private _upProxy;
        private _moveProxy;
        private _mouseDelta: {x: number, y: number};
        private _scrollInterval: number;

        constructor(props: IDraggableProps) {
            super(props);

            this._upProxy = this.onMouseUp.bind(this);
            this._moveProxy = this.onMouseMove.bind(this);
            this._mouseDelta = null;
            this.state = {
                x: props.x,
                y: props.y
            };
        }

        /**
         * When unmounting, we remove any listeners
         */
        componentWillUnmount() {;
            window.removeEventListener('mouseup', this._upProxy);
            window.removeEventListener('mousemove', this._moveProxy);
        }

        /**
         * When the mouse is down on the behaviour, we add the drag listeners
         * @param {React.MouseEvent} e
         */
        onMouseDown(e: React.MouseEvent) {
            if (!this.props.enabled)
                return;

            this._mouseDelta = Utils.getRelativePos(e, this.refs['draggable'] as HTMLElement );
            e.preventDefault();
            window.addEventListener('mouseup', this._upProxy);
            window.addEventListener('mousemove', this._moveProxy);
        }

        /**
         * When the mouse is up we remove the events
         * @param {React.MouseEvent} e
         */
        onMouseUp(e: React.MouseEvent) {
            window.removeEventListener('mouseup', this._upProxy);
            window.removeEventListener('mousemove', this._moveProxy);
        }

        /**
         * When the mouses moves we drag the behaviour
         * @param {React.MouseEvent} e
         */
        onMouseMove(e: React.MouseEvent) {
            const elm = this.refs['draggable'] as HTMLElement;
            const pos = Utils.getRelativePos( e, elm.parentElement );
            const xBuffer = 10;
            const yBuffer = 10;
            let targetScrollX = elm.parentElement.scrollLeft;
            let targetScrollY = elm.parentElement.scrollTop;

            pos.x -=  this._mouseDelta.x;
            pos.y -= this._mouseDelta.y;

            elm.style.left = pos.x + 'px';
            elm.style.top = pos.y + 'px';
            this.props.onMove(pos.x, pos.y);

            const bounds = elm.getBoundingClientRect();

            if ( pos.x + (bounds.width + xBuffer) > elm.parentElement.offsetWidth + elm.parentElement.scrollLeft )
                targetScrollX = ( pos.x - elm.parentElement.offsetWidth ) + (bounds.width + xBuffer);
            else if ( pos.x  - xBuffer < elm.parentElement.scrollLeft )
                targetScrollX = ( pos.x ) - (bounds.width + xBuffer);

            if ( pos.y + (bounds.height + yBuffer) > elm.parentElement.offsetHeight + elm.parentElement.scrollTop )
               targetScrollY = ( pos.y - elm.parentElement.offsetHeight ) + (bounds.height + yBuffer);
            else if ( pos.y - yBuffer < elm.parentElement.scrollTop )
               targetScrollY = ( pos.y ) - ( bounds.height + yBuffer );

            if ( targetScrollX != elm.parentElement.scrollLeft || targetScrollY != elm.parentElement.scrollTop ) {
                window.clearInterval( this._scrollInterval );
                this._scrollInterval = Utils.scrollTo( { x: targetScrollX, y : targetScrollY }, elm.parentElement, 250 );
            }


        }

        /**
         * Creates the component elements
         * @returns {JSX.Element}
         */
        render() : JSX.Element {
            return <div ref="draggable"
                style={{left: this.props.x + 'px', top: this.props.y + 'px'}}
                onMouseDown={(e) => { this.onMouseDown(e) }}
                className="draggable">
                    {this.props.children}
            </div>
        }
    }
}