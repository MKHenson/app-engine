module Animate
{
    /**
    * Defines a property variable. These are variables wrapped in sugar code to help sanitize and differentiate different pieces of data.
    * Each property is typically owner by an EditableSet.
    */
    export class Prop<T>
    {
        public name: string;
        protected _value: T;
        public category: string;
        public options: any;
        public set: EditableSet;
        public type: PropertyType;

        /**
        * Creates a new instance
        * @param {string} name The name of the property
        * @param {T} value The value of the property
        * @param {string} category [Optional] An optional category to describe this property's function
        * @param {any} options [Optional] Any optional data to be associated with the property
        * @param {PropertyType} type [Optional] Define the type of property
        */
        constructor(name: string, value: T, category?: string, options?: any, type: PropertyType = PropertyType.OBJECT)
        {
            this.name = name;
            this._value = value;
            this.category = category || "General Properties";
            this.options = options;
            this.set = null;
            this.type = type;
        }

        /**
        * Attempts to clone the property
        * @returns {Prop<T>}
        */
        clone(clone?: Prop<T>) : Prop<T>
        {
            return new Prop<T>(this.name, this._value, this.category, this.options, this.type);
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
                return { value: this._value, name: this.name, type: this.type, category: this.category, options: this.options };
        }

        /**
        * De-Tokenizes data from a JSON.
        * @param {any} data The data to import from
        */
        deTokenize(data: any)
        {
            this._value = data.value;
            this.category = data.category;
            this.options = data.options;
            this.name = data.name;
            this.type = data.type;
        }

        /**
        * Attempts to set the value of this property
        * @param {T} val
        */
        setVal(val: T)
        {
            this._value = val;
            this.set.notifyEdit(this);
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

        /**
        * Writes this portal out to a string
        */
        toString(): string
        {
            var typeString = PropertyType[this.type].replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
            return `${this.name} : ${typeString} - ${(this._value !== undefined && this._value !== null ? this._value.toString() : "")}`;
        }
    }

    export class PropBool extends Prop<boolean> {

        /**
        * Creates a new instance
        * @param {string} name The name of the property
        * @param {boolean} value The value of the property
        * @param {string} category [Optional] An optional category to describe this property's function
        * @param {any} options [Optional] Any optional data to be associated with the property
        */
        constructor(name: string, value: boolean, category?: string, options?: any)
        {
            super(name, value, category, options, PropertyType.BOOL);
        }

        /**
        * Attempts to clone the property
        * @returns PropBool}
        */
        clone(clone?: PropBool): PropBool
        {
            return new PropBool(this.name, this._value, this.category, this.options);
        }
    }

    export class PropText extends Prop<string> {

        /**
        * Creates a new instance
        * @param {string} name The name of the property
        * @param {string} value The value of the property
        * @param {string} category [Optional] An optional category to describe this property's function
        * @param {any} options [Optional] Any optional data to be associated with the property
        */
        constructor(name: string, value: string, category?: string, options?: any)
        {
            super(name, value, category, options, PropertyType.STRING);
        }

        /**
        * Attempts to clone the property
        * @returns PropText}
        */
        clone(clone?: PropText): PropText
        {
            return new PropText(this.name, this._value, this.category, this.options);
        }
    }
}