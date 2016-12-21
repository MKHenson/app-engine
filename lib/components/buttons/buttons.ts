import { innerHtml, JML } from '../../jml/jml';

/**
 * Primary styled HTML button element
 */
export class ButtonPrimary extends HTMLButtonElement {
    constructor() {
        super();
        this.className = 'primary';
        this.type = 'button';
    }
}

/**
 * Success styled HTML button element
 */
export class ButtonSuccess extends HTMLButtonElement {
    constructor() {
        super();
        this.className = 'success';
        this.type = 'button';
    }
}

/**
 * Error styled HTML button element
 */
export class ButtonError extends HTMLButtonElement {
    constructor() {
        super();
        this.className = 'error';
        this.type = 'button';
    }
}

/**
 * A button styled as an anchor
 */
export class ButtonLink extends HTMLButtonElement {
    constructor() {
        super();
        this.className = 'red-link';
        this.type = 'button';
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