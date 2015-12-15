module Animate
{
    /**
    * Defines a property variable. These are variables wrapped in sugar code to help sanitize and differentiate different pieces of data
    */
    export class PropNum extends Prop<number>
    {
        public min: number;
        public max: number;
        public decimals: number;
        public interval: number;
      
        /**
        * Creates a new instance
        * @param {string} name The name of the property
        * @param {number} value The value of the property
        * @param {number} min The minimum value this property can be
        * @param {number} max The maximum value this property can be
        * @param {number} decimals The number of decimals allowed
        * @param {number} interval The increment/decrement values of this number
        * @param {string} category [Optional] An optional category to describe this property's function
        * @param {any} options [Optional] Any optional data to be associated with the property
        */
        constructor(name: string, value: number, min: number = Infinity, max: number = Infinity, decimals: number = 0, interval: number = 1, category?: string, options?: any)
        {
            super(name, value, category, options);
            this.min = min;
            this.max = max;
            this.decimals = decimals;
            this.interval = interval;
        }

        /** 
        * Attempts to fetch the value of this property
        * @returns {number}
        */
        getVal(): number
        {
            if (this._value < this.min)
                return this.min;
            if (this._value > this.max)
                return this.max;
            
            return parseInt(this._value.toFixed(this.decimals));
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

            var token: PropNum = super.tokenize(slim)
            token.min = this.min;
            token.max = this.max;
            token.decimals = this.decimals;
            token.interval = this.interval;

            return token;
        }

        /**
        * De-Tokenizes data from a JSON. 
        * @param {any} data The data to import from
        * @param {boolean} slim If true, only the core value is exported. If false, additional data is exported so that it can be re-created at a later stage
        */
        deTokenize(data: PropNum, slim: boolean = false)
        {
            if (slim)
                return super.deTokenize(data, slim);

            super.deTokenize(data, slim);
            this.min = data.min;
            this.max = data.max;
            this.decimals = data.decimals;
            this.interval = data.interval;
        }
    }
}