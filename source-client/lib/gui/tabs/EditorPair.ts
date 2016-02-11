module Animate
{
	/**
	* A tab pair that uses the ace editor
	*/
    export abstract class EditorPair extends TabPair
    {
        private _originalName: string;
        private _proxyChange: any;
        private _proxyMessageBox: any;
        protected _close: boolean;
        private _editor: AceAjax.Editor;
        private _loadingGif: JQuery;

		/**
		* @param {string} name The name of the tab
		*/
        constructor(name: string)
        {
            // Call super-class constructor
            super(null, null, name);

            this._originalName = name;
            this._proxyChange = jQuery.proxy(this.onChange, this);
            this._proxyMessageBox = jQuery.proxy(this.onMessage, this);
            this._loadingGif = jQuery("<img src='media/buffering-gray.png' class='rotate-360' />");


            this._close = false;
            this._editor = null;
        }

		/**
		* When we acknowledge the message box.
		* @param {string} val
		*/
        onMessage(val: string)
        {
            if (val == "Yes")
            {
                this._close = true;
                this.save();
            }
            else
            {
                this.modified = false;
                CanvasTab.getSingleton().removeTab(this, true);
            }
        }

        /**
		* Sets if this tab pair is busy loading
		* @param {boolean} val
		*/
        protected loading(val: boolean)
        {
            if (val)
                jQuery(".text", this.tabSelector.element).prepend(this._loadingGif);
            else
                this._loadingGif.detach();
        }

		/**
		* Called when the editor changes
		* @param {any} e
		*/
        onChange(e)
        {
            this.modified = true;
        }

		/**
		* Called by the tab class when the pair is to be removed.
		* @param {TabEvent} event An object that can be used to cancel the operation. Simply call data.cancel = true to cancel the closure.
		*/
        onRemove(event: TabEvent)
        {
            if (this.modified)
            {
                event.cancel = true;
                MessageBox.show("Document not saved, would you like to save it now?", ["Yes", "No"], this._proxyMessageBox, this);
                return;
            }

            this._editor.off("change", this._proxyChange);
            this._editor.destroy();
            this._editor = null;
            this._proxyChange = null;
            this._proxyMessageBox = null;
            this._editor = null;
        }

		/**
		* Called when the tab is resized
		*/
        onResize()
        {
            this._editor.resize();
        }

		/**
		* Saves the content of the editor
		*/
        abstract save();

        /**
		* Gets the script content once added to the stage
		*/
        abstract initialize(): { content: string; contentType: string; };

		/**
		* Called when the pair has been added to the tab. The ace editor is added and initialized
		*/
        onAdded()
        {
            var comp = new Component("<pre style='position:absolute; margin: 0; top: 0; bottom: 0; left: 0; right: 0;'></pre>", this.page);
            var that = this;
            var editor: AceAjax.Editor = ace.edit(comp.id);
            var options = this.initialize();
            this._editor = editor;
            editor.setTheme("ace/theme/chrome");
            editor.getSession().setMode(options.contentType);
            editor.setValue(options.content);
            editor.selection.moveCursorFileStart();

            // Ctrl + S
            editor.commands.addCommand({
                name: "save",
                bindKey: {
                    win: "Ctrl-S",
                    mac: "Command-S",
                    sender: "editor|cli"
                },
                exec: function () { that.save(); }
            });

            editor.on("change", this._proxyChange);
        }

        /**
		* Gets the ace editor
        * @returns {AceAjax.Editor}
		*/
        get editor(): AceAjax.Editor { return this._editor; }
    }
}