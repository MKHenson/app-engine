namespace Animate {

    export interface IReactContextMenuItem {
        onSelect?: ( item: IReactContextMenuItem ) => void;
        tag?: any;
        label: string;
        prefix?: JSX.Element;
        image?: string;
        items?: IReactContextMenuItem[];
    }

    export interface IReactContextMenuProps {
        x: number;
        y: number;
        className?: string;
        onChange?: ( item: IReactContextMenuItem ) => void;
        items?: IReactContextMenuItem[];
        _closing?: () => void;
    }

    /**
     * A React component for showing a context menu.
     * Simply call ReactContextMenu.show and provide the IReactContextMenuItem items to show
     */
    export class ReactContextMenu extends React.Component<IReactContextMenuProps, any> {
        private static _menuCount: number = 0;
        private static _menus: {
            [ id: number ]: {
                menu: HTMLElement,
                jsx: JSX.Element
            }
        } = {};

        static defaultProps: IReactContextMenuProps = {
            items: [],
            x: 0,
            y: 0
        };

        private _mouseUpProxy: any;

        /**
         * Creates a context menu instance
         */
        constructor( props: IReactContextMenuProps ) {
            super( props );

            this._mouseUpProxy = this.onMouseUp.bind( this );
        }

        /**
         * When we click on a menu item
         */
        private onMouseDown( e: React.MouseEvent, item: IReactContextMenuItem ) {
            e.preventDefault();
            e.stopPropagation();

            if ( this.props.onChange )
                this.props.onChange( item );

            item.onSelect && item.onSelect( item );
            this.props._closing();
        }

        /**
         * Draws each of the submenu items
         */
        private drawMenuItems( item: IReactContextMenuItem, level: number, index: number ): JSX.Element {
            let children: JSX.Element | undefined;
            let prefix: JSX.Element | undefined;

            if ( item.items ) {
                children = <div className="sub-menu">
                    {
                        item.items.map(( item, index ) => {
                            return this.drawMenuItems( item, level + 1, index );
                        })
                    }
                </div>
            }

            if ( item.prefix )
                prefix = item.prefix;
            else if ( item.image )
                prefix = <img src={item.image} />;

            return <div
                onMouseDown={( e ) => { this.onMouseDown( e, item ); } }
                key={`menu-item-${level}-${index}`}
                className={'menu-item' + ( prefix ? ' has-prefix' : '' )}>
                <div className="menu-item-button">{prefix} {item.label}</div>
                {children}
            </div>
        }

        /**
         * Creates the component elements
         */
        render(): JSX.Element {
            return <div ref="context" className={'context-menu ' + ( this.props.className || '' )}>
                {
                    this.props.items!.map(( item, index ) => {
                        return this.drawMenuItems( item, 0, index );
                    })
                }
            </div>;
        }

        /**
         * When the mouse is up we remove the dragging event listeners
         */
        private onMouseUp( e: MouseEvent ) {
            this.props._closing();
            window.removeEventListener( 'mouseup', this._mouseUpProxy );
        }

        /**
         * When the component is mounted
         */
        componentDidMount() {
            window.addEventListener( 'mouseup', this._mouseUpProxy );
            let elm = ReactDOM.findDOMNode( this.refs[ 'context' ] ) as HTMLElement;
            let x = this.props.x;
            let y = this.props.y;

            x = ( elm.offsetWidth + x > document.body.offsetWidth ? x - elm.offsetWidth : x );
            y = ( elm.offsetHeight + y > document.body.offsetHeight ? document.body.offsetHeight - elm.offsetHeight : y );

            elm.style.left = x + 'px';
            elm.style.top = y + 'px';
        }

        /**
         * Called when the component is to be removed
         */
        componentWillUnmount() {
            window.removeEventListener( 'mouseup', this._mouseUpProxy );
        }

        /**
         * Shows a React context menu component to the user
         * @param props The properties to use for the context menu component
         */
        static show( props: IReactContextMenuProps ) {
            let id = ReactContextMenu._menuCount + 1;
            let contextView = document.createElement( 'div' );
            contextView.className = 'context-view';
            ReactContextMenu._menuCount = id;

            props._closing = () => {
                ReactContextMenu._menus[ id ].menu.remove();
                ReactDOM.unmountComponentAtNode( ReactContextMenu._menus[ id ].menu );
                ReactContextMenu._menus[ id ] = null;
            };

            let component = React.createElement<IReactContextMenuProps>( ReactContextMenu, props );
            ReactContextMenu._menus[ id ] = {
                jsx: component,
                menu: contextView
            };

            // Add the tooltip to the dom
            document.body.appendChild( contextView );
            ReactDOM.render( component, contextView );
            return ReactContextMenu._menuCount;
        }

        /**
         * Hides/Removes a context menu component by id
         */
        static hide( id: number ) {
            ReactDOM.unmountComponentAtNode( ReactContextMenu._menus[ id ].menu );
            ReactContextMenu._menus[ id ] = null;
        }
    }
}