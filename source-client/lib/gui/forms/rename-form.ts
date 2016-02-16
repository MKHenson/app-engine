module Animate
{
    export interface IRenameToken { newName: string; oldName: string; object: IRenamable; cancelled: boolean; };
    export interface IRenamable { name?: string; };

	/**
	* This form is used to rename objects
	*/
    export class RenameForm extends Window
	{
		private static _singleton: RenameForm;
        private object: IRenamable;
        public $errorMsg: string;
        private $loading: boolean;
        private $name: string;
        private _projectElm: JQuery;
        private _resourceId: string;
        private _type: ResourceType;
        private _fromOk: boolean;

		constructor()
		{
			RenameForm._singleton = this;

			// Call super-class constructor
            super(400, 250, false, true, "Please enter a name");
            this.element.addClass("rename-form");
            this.element.css("height", "");

            this.$name = "";
            this.$errorMsg = "";
            this.$loading = false;
            this._fromOk = false;

            // Fetch & compile the HTML
            this._projectElm = jQuery("#rename-content").remove().clone();
            this.content.element.append(this._projectElm);
            Compiler.build(this._projectElm, this, false);
			this.object = null;
        }

        /**
        * Hides the window from view
        */
        hide()
        {
            if (!this._fromOk)
                this.emit(new Event("cancelled"));

            this._fromOk = false;
            return super.hide();
        }

        /**
         * Shows the window by adding it to a parent.
         * @param {Component} parent The parent Component we are adding this window to
         * @param {number} x The x coordinate of the window
         * @param {number} y The y coordinate of the window
         * @param {boolean} isModal Does this window block all other user operations?
         * @param {boolean} isPopup If the window is popup it will close whenever anything outside the window is clicked
         */
        show(parent: Component = null, x: number = NaN, y: number = NaN, isModal: boolean = false, isPopup: boolean = false)
        {
            super.show();
            jQuery("input", this._projectElm).select();
        }

		/**
		* Attempts to rename an object
		* @param {IRenamable} object
		* @extends {RenameForm}
		*/
        renameObject(object: IRenamable, id: string, type: ResourceType): Promise<IRenameToken>
        {
            super.show(undefined, undefined, undefined, true);
            this.object = object;
            this.$name = object.name;
            this._resourceId = id;
            this._type = type;
            var that = this;

            jQuery("input", this._projectElm).select();
            Compiler.digest(this._projectElm, this);

            return new Promise<IRenameToken>(function (resolve, reject)
            {
                var onEvent = function (type, event: RenameFormEvent)
                {
                    if (type == "renamed")
                        resolve(<IRenameToken>{ newName: event.name, oldName: event.oldName, object: event.object, cancelled: false });
                    else
                        resolve(<IRenameToken>{ newName: object.name, oldName: object.name, object: event.object, cancelled: true });

                    that.off("renamed", onEvent);
                    that.off("cancelled", onEvent);
                }

                that.on("renamed", onEvent);
                that.on("cancelled", onEvent);
            });
		}

		/**
		* @type public mfunc OnButtonClick
		* Called when we click one of the buttons. This will dispatch the event OkCancelForm.CONFIRM
		* and pass the text either for the ok or cancel buttons.
		* @param {any} e
		* @extends {RenameForm}
		*/
		ok()
        {
            var name: string = this.$name;
            var that = this;
            var proj = User.get.project;
            var prevName = (this.object ? this.object.name : "");
            this._fromOk = true;

            if (name.trim() == "")
            {
                this.$errorMsg = "Name cannot be empty";
                Compiler.digest(this._projectElm, this);
                return;
            }

            var event: RenameFormEvent = new RenameFormEvent("renaming", name, prevName, this.object, this._type);
            this.$loading = true;
            this.$errorMsg = "";

            // Dispatch an event notifying listeners of the renaming object
			this.emit(event);
            if (event.cancel)
            {
                this.$errorMsg = event.reason;
                Compiler.digest(this._projectElm, this);
                return;
            }

            if (!this._resourceId || !this._type)
            {
                that.hide();
                return that.emit(new RenameFormEvent("renamed", name, prevName, that.object, that._type));
            }

            // Attempt to connect to the DB and update the object
            proj.editResource<Engine.IResource>(this._resourceId, { name: name }, this._type).then(function (resp)
            {
                that.emit(new RenameFormEvent("renamed", name, prevName, that.object, that._type ));
                that.hide();
                that.$loading = false;
                Compiler.digest(that._projectElm, that);

            }).catch(function (err: Error)
            {
                that.$errorMsg = err.message;
                that.$loading = false;
                Compiler.digest(that._projectElm, that);

            });
		}

		/**
		* Gets the singleton instance.
		* @returns {RenameForm}
		*/
		static get get() : RenameForm
		{
			if ( !RenameForm._singleton )
				new RenameForm();

			return RenameForm._singleton;
		}
	}
}