module Animate
{
    /**
    * The base class for all canvas items
    */
    export class CanvasItem extends Component
    {
        public shallowId: number;
        
        // This is typically 0. But when imported from a token this is set to its shallowId in the token. This is so that 
        // later when we re-link everything, we can match the new items with the old.
        public savedShallowId: number;
        
        /**
        * Creates an instance
        */
        constructor(html: string, parent: Component)
        {
            super(html, parent);
            this.shallowId = Utils.generateLocalId();
            this.savedShallowId = 0;
        }

        /**
		* A shortcut for jQuery's css property. 
		*/
        css(propertyName: any, value?: any): any
        {
            //Call super
            var toRet = this.element.css(propertyName, value);
            return toRet;
        }

        /**
        * Tokenizes the data into a JSON. 
        * @param {boolean} slim If true, only the core value is exported. If false, additional data is exported so that it can be re-created at a later stage
        * @returns {ICanvasItem}
        */
        tokenize(slim: boolean = false): ICanvasItem
        {
            var toRet = <ICanvasItem>{};
            toRet.shallowId = this.shallowId;
            toRet.type = "CanvasItem";

            if (!slim)
            {
                toRet.left = this.element.css("left");
                toRet.top = this.element.css("left");   
            }

            return toRet;
        }

        /**
        * De-Tokenizes data from a JSON. 
        * @param {ICanvasItem} data The data to import from
        */
        deTokenize(data: ICanvasItem)
        {
            this.savedShallowId = data.shallowId;
            this.css({ left: data.left, top: data.top });
        }
    }
}