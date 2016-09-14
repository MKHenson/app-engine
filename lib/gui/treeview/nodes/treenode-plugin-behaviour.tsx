namespace Animate {

	/**
	 * This node represents a behaviour created by a plugin.
	 */
    export class TreeNodePluginBehaviour extends TreeNodeModel {
        private _template: BehaviourDefinition;

		/**
		 * Creates an instance of the node
		 */
        constructor( template: BehaviourDefinition ) {
            super( template.behaviourName, <i className="fa fa-square resource" aria-hidden="true"></i> );
            this._template = template;
            PluginManager.getSingleton().on<PluginManagerEvents, ITemplateEvent>( 'template-removed', this.onTemplateRemoved, this );

            this.canDrag = true;
            this.canDrop = false;
        }

		/**
         * Called whenever we start dragging. This is only called if canDrag is true.
         * Use it to set drag data, eg: e.dataTransfer.setData('text', 'some data');
         * @param {React.DragEvent} e
         * @returns {IDragDropToken} Return data to serialize
         */
        onDragStart( e: React.DragEvent ): IDragDropToken {
            return { type: 'template', id: this._template.behaviourName } as IDragDropToken;
        }

		/**
         * If a template is removed then remove its instance
         */
        onTemplateRemoved( type: PluginManagerEvents, event: ITemplateEvent ) {
            if ( this._template === event.template && this._parent )
                this._parent.removeNode( this );
        }

		/**
         * This will cleanup the component
         */
        dispose() {
            PluginManager.getSingleton().off<PluginManagerEvents, ITemplateEvent>( 'template-removed', this.onTemplateRemoved, this );
            this._template.dispose();
            this.template = null;
            super.dispose();
        }

        get template(): BehaviourDefinition {
            return this._template;
        }
    }
}