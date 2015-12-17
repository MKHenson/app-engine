module Animate
{
	/**
	* A base class for all project resources
	*/
    export class ProjectResource<T extends Engine.IResource> extends EventDispatcher
    {
        public entry: T;
        private _saved: boolean;
        protected _properties: EditableSet;
        protected _options: { [s: string]: any; };

        constructor(entry: T)
        {
            super();

            this.entry = entry;
            var resource: Engine.IResource = <Engine.IResource>entry;
            resource.shallowId = Utils.generateLocalId(resource.shallowId);
            this._saved = true;
            this._options = {};
            this._properties = new EditableSet(this);
        }

        /** 
        * Gets the properties of this resource
        */
        get properties(): EditableSet
        {
            return this._properties;
        }

        /** 
        * Sets the properties of this resource
        */
        set properties(val: EditableSet)
        {
            this._properties = val;
            val.parent = this;
        }

        /**
        * Gets if this resource is saved
        * @returns {boolean}
        */
        get saved(): boolean
        {
            return this._saved
        }

        /**
        * Sets if this resource is saved
        * @param {boolean} val
        */
        set saved(val: boolean)
        {
            this._saved = val;
            this.emit(new Event("modified"));
        }

        

        dispose()
        {
            super.dispose();
            this._properties.dispose();
            this._properties = null;
            this._options = null;
        }

        /** 
        * Creates an option which is associated with this asset. The name of the option must be unique. Use this to add your own custom data 
        */
        createOption(name: string, val: any) { this._options[name] = val; }

        /** 
        * Destroys an option 
        */
        removeOption(name: string) { delete this._options[name]; }

        /** 
        * Update the value of an option 
        */
        updateOption(name: string, val: any) { this._options[name] = val; }

        /** 
        * Returns the value of an option 
        */
        getOption(name: string): any { return this._options[name]; }
    }
}