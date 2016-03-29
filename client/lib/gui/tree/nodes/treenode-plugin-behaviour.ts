module Animate
{
	/**
	* This node represents a behaviour created by a plugin.
	*/
	export class TreeNodePluginBehaviour extends TreeNode
	{
		private _template: BehaviourDefinition;

		constructor(template: BehaviourDefinition )
		{
			// Call super-class constructor
			super( template.behaviourName, "media/variable.png", false);

			this._template = template;
			this.canDelete = false;
			this.element.addClass("behaviour-to-canvas");
			this.element.draggable({ opacity: 0.7, helper: "clone", appendTo: "body", containment: "body" });
		}

		/**
        * This will cleanup the component
        */
		dispose()
		{
			this._template.dispose();
			this.template = null;
			this.canDelete = null;

			//Call super
			super.dispose();
		}

		get template(): BehaviourDefinition { return this._template; }
	}
}