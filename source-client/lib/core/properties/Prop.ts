module Animate
{
    /**
    * Defines a property variable. These are variables wrapped in sugar code to help sanitize and differentiate different pieces of data
    */
    export class Prop<T>
    {
        public name: string;
        protected _value: T;
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
            this._value = value;
            this.category = category;
            this.options = options;
        }

        /** 
        * Attempts to fetch the value of this property
        * @returns {T}
        */
        getVal(): T
        {
            return this._value;
        }

        /**
        * Tokenizes the data into a JSON. 
        * @param {boolean} slim If true, only the core value is exported. If false, additional data is exported so that it can be re-created at a later stage.
        * @returns {any}
        */
        tokenize(slim: boolean = false): any
        {
            if (slim)
                return this._value;
            else
                return { value: this._value, category: this.category, options: this.options };
        }

        /**
        * De-Tokenizes data from a JSON. 
        * @param {any} data The data to import from
        * @param {boolean} slim If true, only the core value is exported. If false, additional data is exported so that it can be re-created at a later stage
        */
        deTokenize(data: any, slim: boolean = false)
        {
            if (slim)
                this._value = data;
            else
            {
                this._value = data.value;
                this.category = data.category;
                this.options = data.options;
            };
        }

        /** 
        * Attempts to set the value of this property
        * @param {T} val
        */
        setVal(val: T)
        {
            this._value = val;
        }

        /** 
        * Cleans up the class 
        */
        dispose()
        {
            this.name = null;
            this._value = null;
            this.category = null;
            this.options = null;
        }
    }

    export class PropBool extends Prop<boolean> { }
    export class PropText extends Prop<string> { }
}