import { IReactWindowProps } from '../../window/react-window';
import { OptionsProject } from './options-project';
import { OptionsUser } from './options-user';
import { OptionsBuild } from './options-build';
import { Tab } from '../../tab/tab';
import { TabPane } from '../../tab/tab-pane';
import { ReactWindow, IReactWindowState } from '../../window/react-window';


export interface IOptionsForm extends IReactWindowProps {
}

/**
 * A form for editing various project/user options
 */
export class OptionsForm extends ReactWindow<IOptionsForm, IReactWindowState> {
    static defaultProps: IOptionsForm = {
        controlBox: true,
        canResize: true,
        showCloseButton: true,
        autoCenter: true,
        title: 'Options Form',
        modal: true,
        className: 'build-options-form'
    }

    /**
     * Creates a new instance
     */
    constructor( props: IOptionsForm ) {
        super( props )
    }

    /**
     * Gets the content JSX for the window.
     */
    getContent(): React.ReactNode {
        return <Tab panes={[
            <TabPane label="Project" showCloseButton={false}>
                <OptionsProject />
            </TabPane>,
            <TabPane label="User" showCloseButton={false}>
                <OptionsUser />
            </TabPane>,
            <TabPane label="Build" showCloseButton={false}>
                <OptionsBuild />
            </TabPane>
        ]}
            />
    }
}