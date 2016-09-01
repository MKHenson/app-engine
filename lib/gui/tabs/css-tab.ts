module Animate {
	/**
	* A tab pair that manages the build CSS
	*/
    export class CSSTab extends EditorPair {
		public static singleton: CSSTab;

		/**
		* @param {string} name The name of the tab
		*/
        constructor(name: string) {
            // Call super-class constructor
            super(name);
        }

		/**
		* Called when the editor needs to save its content
		*/
        save() {
            var that = this;
            var editor = that.editor;
            this.loading(true);

            // Update the build css
            User.get.project.curBuild.update({ css: editor.getValue() }).then(function() {
                that.loading(false);
                that.modified = false;

                // TODO: Commented out due to update to TSX
                // if (that._close)
                //     CanvasTab.getSingleton().removeTab(that, true);

            }).catch(function (err: Error) {
                that.loading(false);
                LoggerStore.error(`Could not update the build CSS: '${err.message}'`);
            });
        }

        /**
        * Gets the script initial values
        */
        initialize() { return { content: User.get.project.curBuild.entry.css, contentType: "ace/mode/css" }; }

        /**
		* Called when the pair has been added to the tab. The ace editor is added and initialized
		*/
        onAdded() {
            CSSTab.singleton = this;
            super.onAdded();
        }

        /**
        * Called by the tab class when the pair is to be removed.
        * @param {TabEvent} event An object that can be used to cancel the operation. Simply call data.cancel = true to cancel the closure.
        */
        onRemove(event: TabEvent) {
            super.onRemove(event);

            if (!event.cancel)
                CSSTab.singleton = null;
        }
	}
}