import { innerHtml, JML } from '../../jml/jml';

// /**
//  * Describes the button style
//  */
// export enum ButtonType {
//     PRIMARY,
//     ERROR,
//     SUCCESS,
//     RED_LINK
// }

// export interface IButtonProps extends React.HTMLAttributes {
//     preventDefault?: boolean;
//     buttonType?: ButtonType;
// }

// /**
//  * A base class for all buttons
//  */
// export class ReactButton extends React.Component<IButtonProps, any> {
//     static defaultProps: IButtonProps = {
//         preventDefault: true,
//         buttonType: ButtonType.PRIMARY
//     }

//     /**
//      * Creates an instance
//      */
//     constructor( props: IButtonProps ) {
//         super( props );
//     }

//     /**
//      * Creates the component elements
//      */
//     render(): JSX.Element {
//         const props: IButtonProps = Object.assign( {}, this.props );
//         delete props.preventDefault;
//         delete props.buttonType;
//         let className = this.props.className || '';
//         let createWrapper = false;

//         if ( this.props.buttonType === ButtonType.SUCCESS )
//             className += ' success';
//         else if ( this.props.buttonType === ButtonType.ERROR )
//             className += ' error';
//         else if ( this.props.buttonType === ButtonType.RED_LINK ) {
//             className += ' red-link';
//             createWrapper = true;
//         }
//         else
//             className += ' primary';

//         return (
//             <button {...props} className={className}
//                 onClick={( e ) => {
//                     if ( this.props.preventDefault )
//                         e.preventDefault();

//                     if ( this.props.onClick )
//                         this.props.onClick( e );
//                 } }>
//                 {( createWrapper ? <span className="wrapper">{this.props.children}</span> : this.props.children )}
//             </button>
//         )
//     }
// }

/**
 * Primary styled HTML button element
 */
export class ButtonPrimary extends HTMLButtonElement {
    constructor() {
        super();
        this.className = 'primary';
    }
}

/**
 * Success styled HTML button element
 */
export class ButtonSuccess extends HTMLButtonElement {
    constructor() {
        super();
        this.className = 'success';
    }
}

/**
 * Error styled HTML button element
 */
export class ButtonError extends HTMLButtonElement {
    constructor() {
        super();
        this.className = 'error';
    }
}

/**
 * A button styled as an anchor
 */
export class ButtonLink extends HTMLButtonElement {
    constructor() {
        super();
        this.className = 'red-link';
        innerHtml( this, JML.span( { className: 'wrapper' }, [ this.childNodes ] ) );
    }

    /**
     * Gets the text of the button
     */
    get text(): string {
        return this.children[ 0 ].textContent || '';
    }

    /**
     * Sets the text of the button
     */
    set text( val: string ) {
        this.children[ 0 ].textContent = val;
    }
}

// /**
//  * A wrapper for the base button class to style it as a primary button
//  */
// export class ButtonPrimary extends ReactButton {
//     static defaultProps: IButtonProps = {
//         buttonType: ButtonType.PRIMARY
//     }
// }

// /**
//  * A wrapper for the base button class to style it as a success button
//  */
// export class ButtonSuccess extends ReactButton {
//     static defaultProps: IButtonProps = {
//         buttonType: ButtonType.SUCCESS
//     }
// }

// /**
//  * A wrapper for the base button class to style it as an error button
//  */
// export class ButtonError extends ReactButton {
//     static defaultProps: IButtonProps = {
//         buttonType: ButtonType.ERROR
//     }
// }

// /**
//  * A wrapper for the base button class to style it as a red link button
//  */
// export class ButtonLink extends ReactButton {
//     static defaultProps: IButtonProps = {
//         buttonType: ButtonType.RED_LINK
//     }
// }