module Animate
{
	/**
	* A tab pair that manages the build HTML
	*/
	export class HTMLTab extends TabPair
	{
		public static singleton: HTMLTab;

		private _originalName: string;
		private _proxyChange: any;
		private _proxyMessageBox: any;
		private _saved: boolean;
        private _close: boolean;
        private _editor: AceAjax.Editor;

		/**
		* @param {string} name The name of the tab
		* @param {Label} tab The label of the pair
		* @param {Component} page The page of the pair
		*/
		constructor(name: string )
		{
			// Call super-class constructor
			super(null, null, name);

			this._originalName = name;
			this._proxyChange = jQuery.proxy(this.onChange, this);
			this._proxyMessageBox = jQuery.proxy(this.onMessage, this);
			this._saved = true;
			this._close = false;
			this._editor = null;
		}

		///**
		//* When the server responds after a save.
		//* @param {ProjectEvents} response 
		//* @param {ProjectEvent} event 
		//*/
		//onServer(response: ProjectEvents, event: ProjectEvent)
		//{
		//	User.get.project.off(ProjectEvents.FAILED, this.onServer, this);
		//	User.get.project.off(ProjectEvents.HTML_SAVED, this.onServer, this);

		//	if (response == ProjectEvents.FAILED)
		//	{
		//		this._saved = false;
		//		//MessageBox.show("Problem saving the data, server responded with:'" + event.message + "'", Array<string>("Ok"), null, null);
		//	}
		//	else
		//	{
		//		this.save();
		//		if (this._close)
		//			CanvasTab.getSingleton().removeTab(this, true);
		//	}
		//}

		/**
		* When we acknowledge the message box.
		* @param {string} val 
		*/
		onMessage(val)
		{
			if (val == "Yes")
            {
                var that = this;
                var editor = that.editor;
                that._close = true;
                
                // Update the build html
                User.get.project.curBuild.update({ html: editor.getValue() }).then(function ()
                {
                    that.name = that._originalName;
                    jQuery(".text", that.tabSelector.element).text(that.name);
                    that._saved = true;

                    if (that._close)
                        CanvasTab.getSingleton().removeTab(that, true);

                }).catch(function (err: Error)
                {
                    Logger.getSingleton().logMessage(`Could not update the build HTML: '${err.message}'`, null, LogType.ERROR);
                });
			}
			else
			{
				this._saved = true;
				CanvasTab.getSingleton().removeTab(this, true);
			}
		}

		/**
		* Called when the editor changes
		* @param {any} e 
		*/
		onChange(e)
		{
			this._saved = false;
			this.name = "*" + this._originalName;
			this.text = this.name;
		}

		/**
		* Called by the tab class when the pair is to be removed. 
		* @param {any} data An object that can be used to cancel the operation. Simply call data.cancel = true to cancel the closure.
		*/
		onRemove(data)
		{
			if (!this._saved)
			{
				data.cancel = true;
				MessageBox.show("Document not saved, would you like to save it now?", ["Yes", "No"], this._proxyMessageBox, this );
				return;
			}

			this._editor.off("change", this._proxyChange);
			this._editor.destroy();
			this._editor = null;
			this._proxyChange = null;
			this._proxyMessageBox = null;
			HTMLTab.singleton = null;
			this._editor = null;
		}

		/**
		* Called when the editor is resized
		*/
		onResize()
		{
			this._editor.resize();
		}

		///**
		//* A helper function to save the script
		//* @returns {any} 
		//*/
		//save()
		//{
		//	this.name = this._originalName;
		//	jQuery(".text", this.tabSelector.element).text(this.name);
		//	this._saved = true;
		//}

		/**
		* Called when the pair has been added to the tab
		*/
		onAdded()
		{
			HTMLTab.singleton = this;

			var comp = new Component( "<pre style='position:absolute; margin: 0; top: 0; bottom: 0; left: 0; right: 0;'></pre>", this.page );
			
            var editor: AceAjax.Editor = ace.edit(comp.id);
			editor.setTheme("ace/theme/chrome");
			editor.getSession().setMode("ace/mode/html");
			this._editor = editor;

            editor.setValue(User.get.project.curBuild.entry.html);
            editor.selection.moveCursorFileStart();

			// Ctrl + S
            editor.commands.addCommand({
				name: "save",
				bindKey: {
					win: "Ctrl-S",
					mac: "Command-S",
					sender: "editor|cli"
				},
                exec: function () { Animate.User.get.project.saveAll() }
			});

			editor.on("change", this._proxyChange);
		}

        get editor(): AceAjax.Editor { return this._editor; }
	}
}