import { IStore, ILogMessage, HatcheryProps } from 'hatchery-editor';
import { LogActions } from '../../actions/logger-actions';
import { ReactContextMenu } from '../../components/context-menu/context-menu';
import { List } from '../../components/list/list';

export interface ILoggerProps extends HatcheryProps {
    messages?: ILogMessage[];
}



/**
 * The Logger is a singleton class used to write message's to Animate's log window.
 */
class Logger extends React.Component<ILoggerProps, any> {

    /**
     * Creates an instance of the logger
     */
    constructor( props: ILoggerProps ) {
        super( props );
    }

    /**
     * Creates the component elements
     */
    render(): JSX.Element {
        return (
            <div onContextMenu={( e ) => {
                e.preventDefault();
                ReactContextMenu.show( {
                    x: e.pageX, y: e.pageY, items: [ {
                        label: 'Clear',
                        prefix: <i className="fa fa-times" aria-hidden="true"></i>,
                        onSelect: () => { this.props.dispatch!( LogActions.clear() ) }
                    }]
                });
            } }
                className="logger"
                >
                <List items={this.props.messages!.map( function( m ) {
                    let icon: JSX.Element;
                    let iconClass: string;

                    if ( m.type === 'message' ) {
                        icon = <span className="success"><i className="fa fa-check" aria-hidden="true"></i></span>;
                        iconClass = 'success';
                    }
                    else if ( m.type === 'error' ) {
                        icon = <span className="error"><i className="fa fa-exclamation-circle" aria-hidden="true"></i></span>;
                        iconClass = 'error';
                    }
                    else {
                        icon = <span className="warning"><i className="fa fa-exclamation-triangle" aria-hidden="true"></i></span>;
                        iconClass = 'warning';
                    }

                    let prefix = (
                        <span>
                            {icon}<span className="date">{new Date( Date.now() ).toLocaleDateString()} {new Date( Date.now() ).toLocaleTimeString()}</span>
                        </span>
                    );

                    return { prefix: prefix, label: m.message };
                })} />
            </div>
        )
    }
}

const ConnectedLogger = ReactRedux.connect<ILoggerProps, any, any>(( state: IStore ) => {
    return {
        messages: state.logs!
    }
})( Logger )

export { ConnectedLogger as Logger };