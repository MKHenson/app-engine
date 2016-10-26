import { Project } from '../../core/project';
import { IEditorState } from 'hatchery-editor';
import { Toolbar } from '../toolbar/toolbar';
import { Workspace } from '../workspace/workspace';
import { TreeViewScene } from '../treeview/treeview-scene';
import { Logger } from '../../containers/logger/logger';
import { SplitPanel, SplitOrientation } from '../split-panel/split-panel';

export interface IDashboardProps {
    editorState?: IEditorState;
    project?: Project;
}

/**
 * The main GUI interface that users interact with once logged in and past the splash screen
 */
export class Dashboard extends React.Component<IDashboardProps, void> {
    constructor( props: IDashboardProps ) {
        super( props );
    }

    /**
     * Creates the component elements
     */
    render(): JSX.Element {
        const editorState = this.props.editorState!;
        const project = this.props.project!;

        return (
            <div id="main-view" style={{ display: editorState.showSplash ? 'none' : '' }}>
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
            </div>
        )
    }
}