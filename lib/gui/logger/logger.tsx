namespace Animate {

    export interface ILoggerProps {
        store: LoggerStore;
    }

	/**
	 * The Logger is a singleton class used to write message's to Animate's log window.
	 */
    export class Logger extends React.Component<ILoggerProps, { items: ILogMessage[] }> {

		/**
		 * Creates an instance of the logger
		 */
        constructor( props: ILoggerProps ) {
            super( props );
            this.state = {
                items: props.store.getLogs()
            }
        }

        componentWillMount() {
            this.props.store.on<LoggerEvents, void>( 'change', this.onLogsChanged, this );
        }

        componentWillUnmount() {
            this.props.store.off<LoggerEvents, void>( 'change', this.onLogsChanged, this );
        }

        onLogsChanged( type: LoggerEvents ) {
            this.setState( {
                items: this.props.store.getLogs()
            });
        }

		/**
         * Creates the component elements
         * @returns {JSX.Element}
         */
        render(): JSX.Element {

            return (
                <div onContextMenu={( e ) => {
                    e.preventDefault();
                    ReactContextMenu.show( {
                        x: e.pageX, y: e.pageY, items: [ {
                            label: 'Clear',
                            prefix: <i className="fa fa-times" aria-hidden="true"></i>,
                            onSelect: ( item ) => { this.props.store.clear(); }
                        }]
                    });
                } }
                    className="logger"
                    >
                    <List items={this.state.items.map( function ( m ) {
                        let icon: JSX.Element;
                        let iconClass: string;

                        if ( m.type === LogType.MESSAGE ) {
                            icon = <span className="success"><i className="fa fa-check" aria-hidden="true"></i></span>;
                            iconClass = 'success';
                        }
                        else if ( m.type === LogType.ERROR ) {
                            icon = <span className="error"><i className="fa fa-exclamation-circle" aria-hidden="true"></i></span>;
                            iconClass = 'error';
                        }
                        else {
                            icon = <span className="warning"><i className="fa fa-exclamation-triangle" aria-hidden="true"></i></span>;
                            iconClass = 'warning';
                        }

                        let prefix = (
                            <span>
                                {icon}<span className="date">{new Date( Date.now() ).toLocaleDateString() } {new Date( Date.now() ).toLocaleTimeString() }</span>
                            </span>
                        );

                        return { prefix: prefix, label: m.message };
                    }) } />
                </div>
            )
        }
    }
}