namespace Animate {

	/**
	 * The base class for all editors. Editors are simple wrappers for resources that can be edited
     * by a GUI Component. The component will use functions described in this class to interact with
     * the base resource.
	 */
    export abstract class Editor extends EventDispatcher {

        public resource: ProjectResource<Engine.IResource>;

        /**
         * Creates an instance of the editor
         */
        constructor( resource: ProjectResource<Engine.IResource> ) {
            super();
            this.resource = resource;
        }

        /**
         * Called when the editor is closed and the contents need to be updated on the server.
         * The returned value of this function is what's sent in the body of the PUT request.
         */
        abstract buildEditToken(): Engine.IResource;

        /**
         * Closes the editor and optionally saves the edits to the database
         * @param updateDatabase If true, the editor will provide edits that must be saved to the datavase
         */
        collapse( updateDatabase: boolean = false ) {
            const project = User.get.project;
            project.removeEditor(this);
            if ( updateDatabase )
                project.editResource(this.resource.entry._id, this.buildEditToken() );

            // Cleanup
            this.dispose();
        }
    }
}