module Animate
{
    /**
    * Defines an any property variable.
    */
    export class PropObject extends Prop<any>
    {      
        /**
        * Creates a new instance
        * @param {string} name The name of the property
        * @param {any} value The value of the property
        * @param {string} category [Optional] An optional category to describe this property's function
        * @param {any} options [Optional] Any optional data to be associated with the property
        */
        constructor(name: string, value: any, category?: string, options?: any)
        {
            super(name, value, category, options, PropertyType.OBJECT);
        }
        
        /** 
        * Attempts to clone the property
        * @returns {PropObject}
        */
        clone(clone?: PropObject): PropObject
        {
            return new PropObject(this.name, this._value, this.category, this.options);
        }
    }
}