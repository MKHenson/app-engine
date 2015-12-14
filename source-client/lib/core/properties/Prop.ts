module Animate
{
    /**
    * Defines a property variable. These are variables wrapped in sugar code to help sanitize and differentiate different pieces of data
    */
    export class Prop<T>
    {
        public name: string;
        public value: T;
        public category: string;
        public options: any;
		
        /**
        * Creates a new instance
        * @param {string} name The name of the property
        * @param {T} value The value of the property
        * @param {string} category [Optional] An optional category to describe this property's function
        * @param {any} options [Optional] Any optional data to be associated with the property
        */
        constructor(name: string, value: T, category?: string, options?: any)
        {
            this.name = name;
            this.value = value;
            this.category = category;
            this.options = options;
        }

        /** 
        * Attempts to fetch the value of this property
        * @returns {T}
        */
        getVal(): T
        {
            return this.value;
        }

        /**
        * Tokenizes the data into a JSON. 
        * @param {boolean} slim If true, only the core value is exported. If false, additional data is exported so that it can be re-created at a later stage.
        * @returns {any}
        */
        tokenize(slim: boolean = false): any
        {
            if (slim)
                return this.value;
            else
                return { value: this.value, category: this.category, options: this.options };
        }

        /** 
        * Attempts to set the value of this property
        * @param {T} val
        */
        setVal(val: T)
        {
            this.value = val;
        }

        /** 
        * Cleans up the class 
        */
        dispose()
        {
            this.name = null;
            this.value = null;
            this.category = null;
            this.options = null;
        }
    }

    export class PropBool extends Prop<boolean> { }
    export class PropText extends Prop<string> { }
}