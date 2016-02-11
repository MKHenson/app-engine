module Animate
{
    /**
    * Defines a property variable. These are variables wrapped in sugar code to help sanitize and differentiate different pieces of data
    */
    export class PropGroup extends Prop<GroupArray>
    {      
        /**
        * Creates a new instance
        * @param {string} name The name of the property
        * @param {GroupArray} value The value of the property
        * @param {string} category [Optional] An optional category to describe this property's function
        * @param {any} options Any optional data to be associated with the property
        */
        constructor(name: string, value: GroupArray, category?: string, options?: any)
        {
            super(name, value, category, options, PropertyType.GROUP);
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

            var token = super.tokenize(slim);

            // Overrites the value as the resources shallow Id
            token.value = (this._value ? this._value.entry.shallowId : -1);

            return token;
        }

        /**
        * De-Tokenizes data from a JSON. 
        * @param {any} data The data to import from
        */
        deTokenize(data: any)
        {
            // Gets the actual resource from the saved shallowId
            data.value = User.get.project.getResourceByShallowID(data.value);

            super.deTokenize(data);
        }

        /** 
        * Attempts to clone the property
        * @returns {PropGroup}
        */
        clone(clone?: PropGroup): PropGroup
        {
            return new PropGroup(this.name, this._value, this.category, this.options);
        }
    }
}