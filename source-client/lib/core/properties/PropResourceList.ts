module Animate
{
    /**
    * Defines a property variable. These are variables wrapped in sugar code to help sanitize and differentiate different pieces of data
    */
    export class PropResourceList extends Prop<Array<ProjectResource<Engine.IResource>>>
    {
        public classNames: Array<string>;
      
        /**
        * Creates a new instance
        * @param {string} name The name of the property
        * @param {Array<ProjectResource<Engine.IResource>>} value An array of project resources
        * @param {Array<string>} classNames An array of class names we can pick this resource from
        * @param {string} category [Optional] An optional category to describe this property's function
        * @param {any} options Any optional data to be associated with the property
        */
        constructor(name: string, value: Array<ProjectResource<Engine.IResource>>, classNames: Array<string>, category?: string, options?: any)
        {
            super(name, value, category, options, PropertyType.ASSET_LIST);
            this.classNames = classNames;
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
            token.classNames = this.classNames; 
            return token;
        }

        /**
        * De-Tokenizes data from a JSON. 
        * @param {any} data The data to import from
        */
        deTokenize(data: PropResource)
        {
            super.deTokenize(data);
            this.classNames = data.classNames;
        }

        /** 
        * Attempts to clone the property
        * @returns {PropResourceList}
        */
        clone(clone?: PropResourceList): PropResourceList
        {
            return new PropResourceList(this.name, this._value, this.classNames, this.category, this.options);
        }
    }
}