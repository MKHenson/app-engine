namespace Animate {
    /**
    * A small wrapper for colors
    */
    export class Color {
        public color: number;
        public alpha: number;

        constructor( color: number = 0xffffff, alpha: number = 1 ) {
            this.color = color;
            this.alpha = alpha;
        }

        toString(): string {
            return `#${this.color.toString( 16 )}:${this.alpha}`;
        }
    }

    /**
    * Defines a property variable. These are variables wrapped in sugar code to help sanitize and differentiate different pieces of data
    */
    export class PropColor extends Prop<Color> {
        /**
        * Creates a new instance
        * @param {string} name The name of the property
        * @param {number} color The colour hex
        * @param {number} alpha The alpha value (0 to 1)
        * @param {string} category [Optional] An optional category to describe this property's function
        * @param {any} options [Optional] Any optional data to be associated with the property
        */
        constructor( name: string, color: number, alpha: number = 1, category?: string, options?: any ) {
            super( name, new Color( color, alpha ), category, options, PropertyType.COLOR );
        }

        /**
        * Tokenizes the data into a JSON.
        * @param {boolean} slim If true, only the core value is exported. If false, additional data is exported so that it can be re-created at a later stage.
        * @returns {any}
        */
        tokenize( slim: boolean = false ): any {
            if ( slim )
                return { color: this._value.color, alpha: this._value.alpha };
            else {
                const token = super.tokenize( slim );
                token.color = this._value.color;
                token.alpha = this._value.alpha;
                return token;
            }
        }

        /**
        * Attempts to clone the property
        * @returns {PropColor}
        */
        clone( clone?: PropColor ): PropColor {
            return new PropColor( this.name, this._value.color, this._value.alpha, this.category, this.options );
        }

        /**
        * De-Tokenizes data from a JSON.
        * @param {any} data The data to import from
        */
        deTokenize( data: Color ) {
            super.deTokenize( data );
            this._value = new Color( data.color, data.alpha );
        }
    }
}