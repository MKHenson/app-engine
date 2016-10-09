namespace Animate {
	/**
	* A tab pair that manages the build HTML
	*/
    export class HTMLTab extends EditorPair {
        public static singleton: HTMLTab;

		/**
		* @param {string} name The name of the tab
		*/
        constructor( name: string ) {
            // Call super-class constructor
            super( name );
        }

		/**
		* Called when the editor needs to save its content
		*/
        save() {
            const that = this;
            const editor = that.editor;
            this.loading( true );

            // Update the build html
            User.get.project.curBuild.update( { html: editor.getValue() }).then( function () {
                that.loading( false );
                that.modified = false;

                // TODO: Commented out due to update to TSX
                // if (that._close)
                //     CanvasTab.getSingleton().removeTab(that, true);

            }).catch( function ( err: Error ) {
                that.loading( false );
                LoggerStore.error( `Could not update the build HTML: '${err.message}'` );
            });
        }

        /**
         * Gets the script initial values
         */
        initialize() { return { content: User.get.project.curBuild.entry.html, contentType: 'ace/mode/html' }; }

        /**
		* Called when the pair has been added to the tab. The ace editor is added and initialized
		*/
        onAdded() {
            HTMLTab.singleton = this;
            super.onAdded();
        }

        /**
		* Called by the tab class when the pair is to be removed.
		* @param {TabEvent} event An object that can be used to cancel the operation. Simply call data.cancel = true to cancel the closure.
		*/
        onRemove( event: any ) {
            super.onRemove( event );

            if ( !event.cancel )
                HTMLTab.singleton = null;
        }
    }
}