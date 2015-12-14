module Animate
{
    /**
    * Defines a property variable. These are variables wrapped in sugar code to help sanitize and differentiate different pieces of data
    */
    export class PropFileResource extends Prop<FileResource>
    {
        public extensions: Array<string>;
      
        /**
        * Creates a new instance
        * @param {string} name The name of the property
        * @param {string} value The value of the property
        * @param {number} extensions The valid extends to use eg: ["bmp", "jpeg"]
        * @param {string} category [Optional] An optional category to describe this property's function
        * @param {any} options [Optional] Any optional data to be associated with the property
        */
        constructor(name: string, value: FileResource, extensions: Array<string>, category?: string, options?: any)
        {
            super(name, value, category, options);
            this.extensions = extensions;
        }

        /**
       * Tokenizes the data into a JSON. 
       * @param {boolean} slim If true, only the core value is exported. If false, additional data is exported so that it can be re-created at a later stage.
       * @returns {any}
       */
        tokenize(slim: boolean = false): any
        {
            if (slim)
                return super.tokenize(slim);

            var token: PropFileResource = super.tokenize(slim)
            token.extensions = this.extensions;
            return token;
        }
    }
}