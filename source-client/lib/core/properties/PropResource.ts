module Animate
{
    /**
    * Defines a property variable. These are variables wrapped in sugar code to help sanitize and differentiate different pieces of data
    */
    export class PropResource extends Prop<ProjectResource<Engine.IResource>>
    {
        public className: string;
      
        /**
        * Creates a new instance
        * @param {string} name The name of the property
        * @param {number} value The value of the property
        * @param {string} className The value of the property
        * @param {string} category [Optional] An optional category to describe this property's function
        * @param {any} options Any optional data to be associated with the property
        */
        constructor(name: string, value: ProjectResource<Engine.IResource>, className: string, category?: string, options?: any)
        {
            super(name, value, category, options);
            this.className = className;
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

            var token: PropResource = super.tokenize(slim)
            token.className = this.className; 
            return token;
        }

        /**
        * De-Tokenizes data from a JSON. 
        * @param {any} data The data to import from
        * @param {boolean} slim If true, only the core value is exported. If false, additional data is exported so that it can be re-created at a later stage
        */
        deTokenize(data: PropResource, slim: boolean = false)
        {
            if (slim)
                return super.deTokenize(data, slim);

            super.deTokenize(data, slim);
            this.className = data.className;
        }
    }
}