import { loadProject } from '../../actions/project-actions';
import { message } from '../../actions/logger-actions';
import { Toolbar } from '../../components/toolbar/toolbar';
import { Workspace } from '../../components/workspace/workspace';
import { TreeViewScene } from '../../components/treeview/treeview-scene';
import { Logger } from '../../containers/logger/logger';
import { SplitPanel, SplitOrientation } from '../../components/split-panel/split-panel';
import { OpenProject } from '../../components/open-project/open-project';

export interface IDashboardProps extends HatcheryEditor.HatcheryProps {
    project?: HatcheryEditor.IProject;
    projectId?: string;
    user?: HatcheryEditor.IUser;
}

/**
 * The main GUI interface that users interact with once logged in and past the splash screen
 */
class Dashboard extends React.Component<IDashboardProps, void> {
    constructor( props: IDashboardProps ) {
        super( props );
    }

    /**
     * When the dashboard is added, load the project and all its dependencies
     */
    componentDidMount() {
        this.props.dispatch!( loadProject( this.props.projectId!, this.props.user!.entry!.username! ) );
        this.props.dispatch!( message( `Loading project '${this.props.projectId!}'...` ) );
    }

    /**
     * Creates the component elements
     */
    render(): JSX.Element {
        const project = this.props.project!;


        return (
            <div id="main-view">
                <div id="toolbar">
                    <Toolbar project={project} />
                </div>
                <div id="stage">
                    <SplitPanel ratio={0.7} left={
                        <SplitPanel
                            ratio={0.8}
                            orientation={SplitOrientation.HORIZONTAL}
                            top={<Workspace project={project} />}
                            bottom={<Logger />} />
                    } right={
                        <SplitPanel
                            ratio={0.6}
                            orientation={SplitOrientation.HORIZONTAL}
                            top={<h2>Property editor goes here</h2>}
                            bottom={
                                <TreeViewScene project={project} />
                            } />
                    } />
                </div>
                <OpenProject project={project} onCancel={() => { } } />
            </div>
        )
    }
}

// Connects th splash screen with its store properties
const ConnectedDashboard = ReactRedux.connect<IDashboardProps, any, any>(( state: HatcheryEditor.IStore, ownProps ) => {
    return {
        project: state.project,
        user: state.user,
        projectId: ownProps.routeParams.projectId
    }
})( Dashboard )

export { ConnectedDashboard as Dashboard };