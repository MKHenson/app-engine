module Animate {
    export type LinkMap = {
        [shallowId: number]: { item: CanvasItem; token: ICanvasItem; }
    };

    /**
    * The base class for all canvas items
    */
    export class CanvasItem extends Component {
        public shallowId: number;

        /**
        * Creates an instance
        */
        constructor(html: string, parent: Component) {
            super(html, parent);
            this.shallowId = Utils.generateLocalId();
        }

        /**
		* A shortcut for jQuery's css property.
		*/
        css(propertyName: any, value?: any): any {
            //Call super
            var toRet = this.element.css(propertyName, value);
            return toRet;
        }

        /**
        * Tokenizes the data into a JSON.
        * @param {boolean} slim If true, only the core value is exported. If false, additional data is exported so that it can be re-created at a later stage
        * @returns {ICanvasItem}
        */
        tokenize(slim: boolean = false): ICanvasItem {
            var toRet = <ICanvasItem>{};
            toRet.shallowId = this.shallowId;
            toRet.type = CanvasItemType.Behaviour;

            if (!slim) {
                toRet.left = this.element.css("left");
                toRet.top = this.element.css("top");
            }

            return toRet;
        }

        /**
        * De-Tokenizes data from a JSON.
        * @param {ICanvasItem} data The data to import from
        */
        deTokenize(data: ICanvasItem) {
            this.css({ left: data.left, top: data.top });
        }

        /**
        * Called after de-tokenization. This is so that the items can link up to any other items that might have been created in the process.
        * @param {number} originalId The original shallow ID of the item when it was tokenized.
        * @param {LinkMap} items The items loaded from the detokenization process. To get this item you can do the following: items[originalId].item
        * or to get the token you can use items[originalId].token
        */
        link(originalId: number, items: LinkMap) {
        }
    }
}