module Animate
{
	/**
	* A tab pair that manages the build HTML
	*/
	export class HTMLTab extends TabPair
	{
		public static singleton: HTMLTab;

		private originalName: string;
		private proxyChange: any;
		private proxyMessageBox: any;
		private saved: boolean;
		private close: boolean;
		private _editor: AceEditor;

		/**
		* @param {string} name The name of the tab
		* @param {Label} tab The label of the pair
		* @param {Component} page The page of the pair
		*/
		constructor(name: string )
		{
			// Call super-class constructor
			super(null, null, name);

			this.originalName = name;
			this.proxyChange = jQuery.proxy(this.onChange, this);
			this.proxyMessageBox = jQuery.proxy(this.onMessage, this);
			this.saved = true;
			this.close = false;
			this._editor = null;
		}

		/**
		* When the server responds after a save.
		* @param {ProjectEvents} response 
		* @param {ProjectEvent} event 
		*/
		onServer(response: ProjectEvents, event: ProjectEvent)
		{
			User.get.project.off(ProjectEvents.FAILED, this.onServer, this);
			User.get.project.off(ProjectEvents.HTML_SAVED, this.onServer, this);

			if (response == ProjectEvents.FAILED)
			{
				this.saved = false;
				MessageBox.show("Problem saving the data, server responded with:'" + event.message + "'", Array<string>("Ok"), null, null);
			}
			else
			{
				this.save();
				if (this.close)
					CanvasTab.getSingleton().removeTab(this, true);
			}
		}


		/**
		* When we acknowledge the message box.
		* @param {string} val 
		*/
		onMessage(val)
		{
			if (val == "Yes")
			{
				this.close = true;
				User.get.project.on( ProjectEvents.FAILED, this.onServer, this );
				User.get.project.on( ProjectEvents.HTML_SAVED, this.onServer, this );
				User.get.project.saveHTML();
			}
			else
			{
				this.saved = true;
				CanvasTab.getSingleton().removeTab(this, true);
			}
		}

		/**
		* Called when the editor changes
		* @param {any} e 
		*/
		onChange(e)
		{
			this.saved = false;
			this.name = "*" + this.originalName;
			this.text = this.name;
		}

		/**
		* Called by the tab class when the pair is to be removed. 
		* @param {any} data An object that can be used to cancel the operation. Simply call data.cancel = true to cancel the closure.
		*/
		onRemove(data)
		{
			if (!this.saved)
			{
				data.cancel = true;
				MessageBox.show("Document not saved, would you like to save it now?", ["Yes", "No"], this.proxyMessageBox, this );
				return;
			}

			this._editor.off("change", this.proxyChange);
			this._editor.destroy();
			this._editor = null;
			this.proxyChange = null;
			this.proxyMessageBox = null;
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

		/**
		* A helper function to save the script
		* @returns {any} 
		*/
		save()
		{
			this.name = this.originalName;
			jQuery(".text", this.tabSelector.element).text(this.name);
			this.saved = true;
		}

		/**
		* Called when the pair has been added to the tab
		*/
		onAdded()
		{
			HTMLTab.singleton = this;

			var comp = new Component( "<pre style='position:absolute; margin: 0; top: 0; bottom: 0; left: 0; right: 0;'></pre>", this.page );
			
			var editor: AceEditor = ace.edit(comp.id);
			editor.setTheme("ace/theme/chrome");
			editor.getSession().setMode("ace/mode/html");
			this._editor = editor;

			editor.setValue( User.get.project.mCurBuild.html);
			this._editor.selection.moveCursorFileStart();

			// Ctrl + S
			this._editor.commands.addCommand({
				name: "save",
				bindKey: {
					win: "Ctrl-S",
					mac: "Command-S",
					sender: "editor|cli"
				},
                exec: function () { Animate.User.get.project.saveAll() }
			});

			editor.on("change", this.proxyChange);
		}

		get editor(): AceEditor { return this._editor; }
	}
}