

export interface IGroupProps extends React.HTMLAttributes {
    label: string;
}

/**
 * A simple wrapper for a group Component
 */
export class Group extends React.Component<IGroupProps, any> {

    /**
     * Creates an instance of the group
     */
    constructor( props: IGroupProps ) {
        super( props );
    }

    /**
     * Creates the component elements
     */
    render(): JSX.Element {
        const props: React.HTMLAttributes = Object.assign( {}, this.props );
        let className = 'group' + ( this.props.className ? ( ' ' + this.props.className ) : '' );
        return <div {...props} className={className}>
            <div className="group-header">{this.props.label}</div>
            <div className="group-content">
                {this.props.children}
            </div>
        </div>
    }
}