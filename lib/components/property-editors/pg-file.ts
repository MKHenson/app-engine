namespace Animate {
	/**
	* An editor which allows a user to select files on the local server.
	*/
    export class PGFile extends PropertyGridEditor {
        constructor( grid: PropertyGrid ) {
            super( grid );
        }

        /**
        * Checks a property to see if it can edit it
        * @param {Prop<any>} prop The property being edited
        * @returns {boolean}
        */
        canEdit( prop: Prop<any> ): boolean {
            if ( prop instanceof PropFileResource )
                return true;
            else
                return false;
        }

		/**
		* Given a property, the grid editor must produce HTML that can be used to edit the property
		* @param {Prop<any>} prop The property being edited
		* @param {Component} container The container acting as this editors parent
		*/
        edit( prop: Prop<any>, container: Component ) {
            const p = <PropFileResource>prop;
            const fileResource = p.getVal();
            const fileID: string = fileResource || fileResource.entry._id || '';
            const fileExtensions = p.extensions;
            const project: Project = User.get.project;

            // Create HTML
            const editor: JQuery = jQuery( `<div class='property-grid-label'>${p.name}</div><div class='property-grid-value'><div class='prop-file'><div class='file-name'>${( fileResource ? fileResource.entry.name : '' )}</div><div class='file-button reg-gradient'>...</div><div class='file-button-image'><img src='media/download-file.png'/></div></div></div><div class='fix'></div>` );
            const that = this;

            // TODO: Verify that this file picker works
            // =====================================================================
            // // Functions to deal with user interactions with JQuery
            // var onFileChosen = function( file: Engine.IFile ) {
            //     FileViewer.get.off( 'cancelled', onFileChosen );
            //     FileViewer.get.off( 'change', onFileChosen );

            //     if (response === 'cancelled' )
            // 		return;

            //     var file: Engine.IFile = event.file;
            //     jQuery('.file-name', editor).text((file ? file.name : ''));

            //     fileResource.entry = file;
            //     p.setVal(fileResource);
            // };

            const mouseUp = function ( e: JQueryEventObject ) {

                ReactWindow.show( FileDialogue, {
                    extensions: fileExtensions,
                    onFileSelected: function ( file ) {

                        jQuery( '.file-name', editor ).text(( file ? file.name : '' ) );
                        fileResource.entry = file;
                        p.setVal( fileResource );
                    }
                } as IFileDialogueProps );

                // // Remove any previous references
                // FileViewer.get.off('cancelled', onFileChosen );
                // FileViewer.get.off('change', onFileChosen );
                // FileViewer.get.on('change', onFileChosen );
                // FileViewer.get.on('cancelled', onFileChosen);
                // FileViewer.get.choose(fileExtensions);
            };

            // =====================================================================

            // Add listeners
            editor.on( 'mouseup', mouseUp );
        }
    }
}