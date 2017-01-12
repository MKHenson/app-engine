import { JML } from '../../jml/jml';

/**
 * A group is a container with a title
 * eg:
 * const group = new Group();
 * group.label = "hello world";
 * group.content.append( / * add some html elements * / );
 */
export class Group extends HTMLElement {

    static get observedAttributes() {
        return [
            'label'
        ];
    }

    /**
     * Creates an instance of the group
     */
    constructor() {
        super();

        this.className = 'group';
        this.appendChild( JML.div( { className: 'group-header' }, 'Group' ) );
        this.appendChild( JML.div( { className: 'group-content' }) );
    }

    /**
     * If the attributes change we update the internal state
     */
    attributeChangedCallback( name: string, oldValue: string, newValue: string ) {
        switch ( name ) {
            case 'label':
                this[ name ] = newValue;
                break;
        }
    }

    /**
     * Sets the text of the label heading
     */
    set label( val: string ) {
        this.children[ 0 ].textContent = val;
    }

    /**
     * Gets the text of the label heading
     */
    get label(): string {
        return this.children[ 0 ].textContent!;
    }

    /**
     * Gets the content element
     */
    get content(): HTMLElement {
        return this.children[ 1 ] as HTMLElement;
    }
}