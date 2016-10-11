namespace Animate {

	/**
	 * The base class for all editors. Editors are simple wrappers for resources that can be edited
     * by a GUI Component. The component will use functions described in this class to interact with
     * the base resource.
	 */
    export abstract class Editor extends EventDispatcher {

        public active: boolean;
        public resource: ProjectResource<HatcheryServer.IResource>;
        public pastActions: Actions.EditorAction[];
        public currentAction: Actions.EditorAction | null;
        public futureActions: Actions.EditorAction[];
        private _actionHistoryLength: number;
        private _project: Project;

        /**
         * Creates an instance of the editor
         */
        constructor( resource: ProjectResource<HatcheryServer.IResource>, project: Project ) {
            super();
            this.active = false;
            this.resource = resource;
            this.pastActions = [];
            this.currentAction = null;
            this.futureActions = [];
            this._actionHistoryLength = 20;
            this._project = project;
        }

        /**
         * Gets if this editor has actions to undo
         */
        get hasUndos(): boolean {
            return this.currentAction ? true : false;
        }

        /**
         * Gets if this editor has actions to redo
         */
        get hasRedos(): boolean {
            return this.futureActions.length === 0 ? false : true;
        }

        /**
         * Adds a new action to the editor and resets the undo history
         */
        doAction( action: Actions.EditorAction ) {
            if ( this.currentAction )
                this.pastActions.push( this.currentAction );

            this.futureActions.splice( 0, this.futureActions.length );
            this.currentAction = action;
            action.redo( this );

            if ( this.pastActions.length > this._actionHistoryLength )
                this.pastActions.splice( 0, 1 );

            this.invalidate();
        }

        /**
         * Undo the last history action
         */
        undo() {
            if ( this.currentAction ) {
                this.currentAction.undo( this );
                this.futureActions.splice( 0, 0, this.currentAction );
                this.currentAction = this.pastActions.pop() || null;
                this.invalidate();
            }
        }

        /**
         * Redo the last un-done action
         */
        redo() {
            if ( this.futureActions.length === 0 )
                return;

            if ( this.currentAction )
                this.pastActions.push( this.currentAction );

            this.currentAction = this.futureActions[ 0 ];
            this.futureActions.splice( 0, 1 );
            this.currentAction.redo( this );
            this.invalidate();
        }

        /**
         * De-serializes the workspace from its JSON format
         * @param scene The schema scene we are loading from
         */
        abstract deserialize<T>( scene: T );

        /**
         * Serializes the workspace into its JSON format
         */
        abstract serialize<T>(): T;

        /**
		 * Triggers a change in the tree structure
		 */
        invalidate() {
            this.emit<EditorEvents, void>( 'change' );
            this._project.invalidate();
        }

        /**
         * Closes the editor and optionally saves the edits to the database
         * @param updateDatabase If true, the editor will provide edits that must be saved to the datavase
         */
        collapse( updateDatabase: boolean = false ) {
            this._project.removeEditor( this );
            if ( updateDatabase )
                this._project.editResource( this.resource.entry._id, this.serialize() );

            // Cleanup
            this.dispose();
        }
    }
}