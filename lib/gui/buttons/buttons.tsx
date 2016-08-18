module Animate {

    /**
     * Describes the button style
     */
    export enum ButtonType {
        PRIMARY,
        ERROR,
        SUCCESS,
        RED_LINK
    }

    export interface IButtonProps extends React.HTMLAttributes {
        preventDefault? : boolean;
        buttonType?: ButtonType;
    }

    /**
     * A base class for all buttons
     */
    export class ReactButton extends React.Component<IButtonProps, any> {
        static defaultProps : IButtonProps = {
            preventDefault: true,
            buttonType: ButtonType.PRIMARY
        }

        /**
         * Creates an instance
         */
        constructor(props: IButtonProps) {
            super(props);
        }

        /**
         * Creates the component elements
         * @returns {JSX.Element}
         */
        render(): JSX.Element {
            const props : IButtonProps  = Object.assign({}, this.props);
            delete props.preventDefault;
            let className = this.props.className || '';
            let createWrapper = false;

            if (this.props.buttonType == ButtonType.SUCCESS)
                className += ' success';
            else if (this.props.buttonType == ButtonType.ERROR)
                className += ' error';
            else if (this.props.buttonType == ButtonType.RED_LINK) {
                className += ' red-link';
                createWrapper = true;
            }
            else
                className += ' primary';

            return (
                <button {...props} className={className}
                    onclick={ (e) => {
                        if (this.props.preventDefault)
                            e.preventDefault();

                        if (this.props.onClick)
                            this.props.onClick(e);
                    }}>
                    {(createWrapper ? <span className='wrapper'>{this.props.children}</span> : this.props.children)}
                </button>
            )
        }
    }

    /**
     * A wrapper for the base button class to style it as a primary button
     */
    export class ButtonPrimary extends ReactButton {
        static defaultProps : IButtonProps = {
            buttonType: ButtonType.PRIMARY
        }
    }

    /**
     * A wrapper for the base button class to style it as a success button
     */
    export class ButtonSuccess extends ReactButton {
        static defaultProps : IButtonProps = {
            buttonType: ButtonType.SUCCESS
        }
    }

    /**
     * A wrapper for the base button class to style it as an error button
     */
    export class ButtonError extends ReactButton {
        static defaultProps : IButtonProps = {
            buttonType: ButtonType.ERROR
        }
    }

    /**
     * A wrapper for the base button class to style it as a red link button
     */
    export class ButtonLink extends ReactButton {
        static defaultProps : IButtonProps = {
            buttonType: ButtonType.RED_LINK
        }
    }
}