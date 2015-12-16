module Animate
{
	/**
	* A node used to ghost - or act as a shortcut - for an existing node. This node is created when you hold shift and 
	* move a node on the canvas. The ghost can then be as if it were the original node.
	*/
	export class BehaviourShortcut extends Behaviour
	{
		private _originalNode: Behaviour;

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

			if (originalNode)
				this.setOriginalNode(originalNode, true);
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