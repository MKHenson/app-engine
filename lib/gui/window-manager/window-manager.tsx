module Animate {
    export class WindowManager extends React.Component<any, any> {
        private _window : ReactWindow;

        constructor(props) {
            super(props);
            this._window = new ReactWindow({open: true, title: 'Hello world'});
            let t = <ReactWindow open={true} title='Hello world' />;
            let r = React.createElement<IReactWindowProps>(ReactWindow, {open: true, title: 'Hello world'});
        }

        /**
         * Creates the component elements
         * @returns {JSX.Element}
         */
        render(): JSX.Element {
            return <div className="window-manager">
                {this._window}
            </div>
        }
    }
}