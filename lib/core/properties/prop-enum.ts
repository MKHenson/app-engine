namespace Animate {
    /**
    * Defines a property variable. These are variables wrapped in sugar code to help sanitize and differentiate different pieces of data
    */
    export class PropEnum extends Prop<string> {
        public choices: Array<string>;

        /**
        * Creates a new instance
        * @param {string} name The name of the property
        * @param {string} value The value of the property
        * @param {number} choices The choices to select from
        * @param {string} category [Optional] An optional category to describe this property's function
        * @param {any} options [Optional] Any optional data to be associated with the property
        */
        constructor( name: string, value: string, choices: Array<string>, category?: string, options?: any ) {
            super( name, value, category, options, PropertyType.ENUM );
            this.choices = choices;
        }

        /**
       * Tokenizes the data into a JSON.
       * @param {boolean} slim If true, only the core value is exported. If false, additional data is exported so that it can be re-created at a later stage.
       * @returns {any}
       */
        tokenize( slim: boolean = false ): any {
            if ( slim )
                return super.tokenize( slim );

            const token: PropEnum = super.tokenize( slim )
            token.choices = this.choices;
            return token;
        }

        /**
        * Attempts to clone the property
        * @returns {PropEnum}
        */
        clone( clone?: PropEnum ): PropEnum {
            return new PropEnum( this.name, this._value, this.choices, this.category, this.options );
        }

        /**
       * De-Tokenizes data from a JSON.
       * @param {any} data The data to import from
       */
        deTokenize( data: PropEnum ) {
            super.deTokenize( data );
            this.choices = data.choices;
        }
    }
}