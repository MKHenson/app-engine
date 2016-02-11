module Animate
{
	/**
	* A node used to ghost - or act as a shortcut - for an existing node. This node is created when you hold shift and 
	* move a node on the canvas. The ghost can then be as if it were the original node.
	*/
	export class BehaviourShortcut extends Behaviour
	{
        private _originalNode: Behaviour;
        private _savedResource: number;

		/**
		* @param {Canvas} parent The parent canvas
		* @param {Behaviour} originalNode The original node we are copying from
		*/
		constructor(parent: Canvas, originalNode : Behaviour, text : string)
		{
			// Call super-class constructor
			super(parent, text);

			this.element.addClass("behaviour-shortcut");
            this._originalNode = originalNode;
            this._savedResource = 0;

			if (originalNode)
                this.setOriginalNode(originalNode, true);

            this.tooltip = "Press C to focus on source";
        }

        /**
        * Tokenizes the data into a JSON. 
        * @param {boolean} slim If true, only the core value is exported. If false, additional data is exported so that it can be re-created at a later stage
        * @returns {IBehaviourResource}
        */
        tokenize(slim: boolean = false): IBehaviourShortcut
        {
            var toRet = <IBehaviourShortcut>super.tokenize(slim);
            toRet.originalId = this._originalNode.shallowId;
            toRet.type = CanvasItemType.BehaviourShortcut;
            return toRet;
        }

        /**
        * De-Tokenizes data from a JSON. 
        * @param {IBehaviourResource} data The data to import from
        */
        deTokenize(data: IBehaviourShortcut)
        {
            super.deTokenize(data);
            this._savedResource = data.originalId;
        }

        /**
        * Called after de-tokenization. This is so that the items can link up to any other items that might have been created in the process.
        * @param {number} originalId The original shallow ID of the item when it was tokenized. 
        * @param {LinkMap} items The items loaded from the detokenization process. To get this item you can do the following: items[originalId].item
        * or to get the token you can use items[originalId].token
        */
        link(originalId: number, items: LinkMap)
        {
            var exportedToken = <IBehaviourShortcut>items[originalId].token;

            // This link was probably copied - but not with both of the end behavours - so remove it
            if (!items[exportedToken.originalId])
            {
                this.text = "NOT FOUND";
                Logger.logMessage(`Could not find original node for shortcut ${originalId}`, null, LogType.ERROR);
                return;
            }

            this.setOriginalNode(<Behaviour>items[exportedToken.originalId].item, false);
        }

		setOriginalNode( originalNode : Behaviour, buildPortals : boolean )
		{
			this._originalNode = originalNode;
			if (originalNode instanceof BehaviourAsset)
				this.element.addClass("behaviour-asset");

			else if (originalNode instanceof BehaviourPortal)
				this.element.addClass("behaviour-portal");

			// Copy each of the portals 
			if ( buildPortals )
			{
                for (var i = 0, l = originalNode.portals.length; i < l; i++)
                    this.addPortal(originalNode.portals[i].type, originalNode.portals[i].property, false);
			}

			this.updateDimensions();
		}

		/**
		* This will cleanup the component.
		*/
		dispose()
		{
			this._originalNode = null;

			//Call super
			Behaviour.prototype.dispose.call(this);
		}

		get originalNode(): Behaviour { return this._originalNode; }
	}
}