namespace Animate {
    /**
    * Defines a property variable. These are variables wrapped in sugar code to help sanitize and differentiate different pieces of data
    */
    export class PropFileResource extends Prop<Resources.File | null> {
        public extensions: Array<string> | null;

        /**
        * Creates a new instance
        * @param {string} name The name of the property
        * @param {string} value The value of the property
        * @param {number} extensions The valid extends to use eg: ['bmp', 'jpeg']
        * @param {string} category [Optional] An optional category to describe this property's function
        * @param {any} options [Optional] Any optional data to be associated with the property
        */
        constructor( name: string, value: Resources.File | null, extensions: Array<string> | null, category?: string, options?: any ) {
            super( name, value, category, options, PropertyType.FILE );
            this.extensions = extensions;
        }

        /**
        * Attempts to clone the property
        * @returns {PropFileResource}
        */
        clone( clone?: PropFileResource ): PropFileResource {
            return new PropFileResource( this.name, this._value, this.extensions, this.category, this.options );
        }

        /**
       * Tokenizes the data into a JSON.
       * @param {boolean} slim If true, only the core value is exported. If false, additional data is exported so that it can be re-created at a later stage.
       * @returns {any}
       */
        tokenize( slim: boolean = false ): any {
            if ( slim )
                return super.tokenize( slim );

            const token: PropFileResource = super.tokenize( slim )
            token.extensions = this.extensions;
            return token;
        }

        /**
       * De-Tokenizes data from a JSON.
       * @param {any} data The data to import from
       */
        deTokenize( data: PropFileResource ) {
            super.deTokenize( data );
            this.extensions = data.extensions;
        }
    }
}