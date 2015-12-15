module Animate
{
	/**
	* A base class for all project resources
	*/
    export class ProjectResource<T extends Engine.IResource> extends EventDispatcher
    {
        private static shallowIds: number = 0;
        public entry: T;
        private _saved: boolean;
        protected _properties: EditableSet;
        protected _options: { [s: string]: any; };

        constructor(entry: T)
        {
            super();

            this.entry = entry;
            var resource: Engine.IResource = <Engine.IResource>entry;

            // Make sure the ID is always really high - i.e. dont allow for duplicates
            if (resource.shallowId && resource.shallowId > ProjectResource.shallowIds)
                ProjectResource.shallowIds = resource.shallowId + 1;

            this._saved = true;
            this._options = {};
            this._properties = new EditableSet();
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

        static generateLocalId(): number
		{
			Asset.shallowIds++;
			return Asset.shallowIds;
		}

        dispose()
        {
            super.dispose();
            this._properties.addVar
            this._properties = null;
            this._options = null;
        }

        /** Creates an option which is associated with this asset. The name of the option must be unique. Use this to add your own custom data */
        createOption(name: string, val: any) { this._options[name] = val; }

        /** Destroys an option */
        removeOption(name: string) { delete this._options[name]; }

        /**  Update the value of an option */
        updateOption(name: string, val: any) { this._options[name] = val; }

        /** Returns the value of an option */
        getOption(name: string): any { return this._options[name]; }

        //get properties(): EditableSet { return this._properties; }
        //set properties(val: EditableSet)
        //{
        //    for (var vi = 0, l = this._properties.variables.length; vi < l; vi++)
        //        this._properties.variables[vi].dispose();

        //    this._properties.variables.splice(0, this._properties.variables.length);

        //    if (val instanceof EditableSet)
        //        this._properties = val;
        //    else
        //    {
        //        for (var i in val)
        //            this._properties.addVar(val[i].name, val[i].value, ParameterType.fromString(val[i].type), val[i].category, val[i].options);
        //    }
        //}

        get properties(): EditableSet { return this._properties; }

        setProperties(val: Array<EditableSetToken>)
        setProperties(val: EditableSet)
        setProperties(val: any)
        {
            for (var i = 0, l = this._properties.variables.length; i < l; i++)
                this._properties.variables[i].dispose();

            this._properties.variables.splice(0, this._properties.variables.length);

            if (val instanceof EditableSet)
                this._properties = val;
            else
            {
                var arr: Array<EditableSetToken> = val;
                for (var i = 0, len = arr.length; i < len; i++)
                    this._properties.addVar(arr[i].name, arr[i].value, ParameterType.fromString(arr[i].type), arr[i].category, arr[i].options);
            }

            // TODO: I think the resources need a way of storing custom data
            // this.entry.json.properties = this._properties.tokenize();
        }
    }
}