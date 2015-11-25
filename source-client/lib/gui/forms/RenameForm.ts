module Animate
{
    export interface IRenameToken { newName: string; oldName: string; object: IRenamable; };
    export interface IRenamable { name: string; };

    /**
    * Event used to describe re-naming of objects. Listen for either
    * 'renaming' or 'renamed' event types
    */
	export class RenameFormEvent extends Event
	{
		cancel: boolean;
		name: string;
        object: IRenamable;
        reason: string;
        resourceType: ResourceType;

        constructor(type: string, name: string, object: IRenamable, rt : ResourceType )
		{
            super(type, name);
			this.cancel = false;
			this.name = name;
            this.object = object;
            this.resourceType = rt;
		}
	}

	/**
	* This form is used to rename objects
	*/
    export class RenameForm extends Window
	{
		private static _singleton: RenameForm;
		//public name: LabelVal;
		//public warning: Label;
        private object: IRenamable;
        private $errorMsg: string;
        private $loading: boolean;
        private $name: string;
        private _projectElm: JQuery;
        private _deferred: JQueryDeferred<IRenameToken>;
        private _resourceId: string;
        private _type: ResourceType;

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
            this._deferred = null;

            // Fetch & compile the HTML
            this._projectElm = jQuery("#rename-content").remove().clone();
            this.content.element.append(this._projectElm);
            Compiler.build(this._projectElm, this, false); 
            
			//this.name = new LabelVal( this.okCancelContent, "Name", new InputBox( null, "" ) );
			this.object = null;
			//this.warning = new Label( "Please enter a name and click Ok.", this.okCancelContent );
        }

        hide()
        {
            super.hide();
            this._deferred = null;
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
		* @param {string} curName 
		* @extends {RenameForm}
		*/
        renameObject(object: IRenamable, curName: string, id: string, type: ResourceType): JQueryPromise<IRenameToken>
        {
            var d = jQuery.Deferred<IRenameToken>();
			this.object = object;

			//(<Label>this.name.val).text = curName;

			//this.warning.textfield.element.css( "color", "" );
			//this.warning.text = "Please enter a name and click Ok.";
            //( <Label>this.name.val ).textfield.element.removeClass( "red-border" );
            super.show(undefined, undefined, undefined, true);
            Compiler.digest(this._projectElm, this);
            
			//( <InputBox>this.name.val ).focus();
            this._resourceId = id;
            this._type = type;
            this._deferred = d;
            return d.promise();
		}

		/**
		* @type public mfunc OnButtonClick
		* Called when we click one of the buttons. This will dispatch the event OkCancelForm.CONFIRM
		* and pass the text either for the ok or cancel buttons.
		* @param {any} e 
		* @extends {RenameForm}
		*/
		ok( e : any )
        {
            var name: string = this.$name;
            var that = this;
            var proj = User.get.project;
            var event: RenameFormEvent = new RenameFormEvent("renaming", name, this.object, this._type)
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

            if (!this._resourceId)
                return that._deferred.resolve({ newName: name, oldName: this.object.name, object: this.object });
            
            // Attempt to connect to the DB and update the object
            proj.renameObject(name, this._resourceId, this._type).then(function (resp)
            {
                that._deferred.resolve({ newName: name, oldName: this.object.name, object: this.object });
                that.hide();

            }).fail(function (err: Error)
            {
                that.$errorMsg = err.message;

            }).always(function ()
            {
                that.$loading = false;
                Compiler.digest(that._projectElm, that);
            });
            
			//if ( jQuery( e.target ).text() == "Ok" )
			//{
			//	//Check if the values are valid
			//	(<Label>this.name.val).textfield.element.removeClass( "red-border" );
			//	this.warning.textfield.element.css( "color", "" );

			//	//Check for special chars
			//	var message = Utils.checkForSpecialChars( (<Label>this.name.val).text );
			//	if ( message != null )
			//	{
			//		( <Label>this.name.val ).textfield.element.addClass( "red-border" );
			//		this.warning.textfield.element.css( "color", "#FF0000" );
			//		this.warning.text = message;
			//		return;
			//	}

			//	var name : string = ( <Label>this.name.val ).text;

			//	//Dispatch an event notifying listeners of the renamed object
			//	var event: RenameFormEvent  = new RenameFormEvent("renaming", name, this.object)
			//	this.emit(event );
   //             if (event.cancel)
   //             {
   //                 event.reason;
   //                 return;
   //             }

			//	if ( this.object instanceof Behaviour )
			//	{
			//		OkCancelForm.prototype.OnButtonClick.call( this, e );
   //                 (<Behaviour>this.object).onRenamed(name);

			//		//Dispatch an event notifying listeners of the renamed object
   //                 this.emit(new RenameFormEvent("renamed", name, this.object));
			//		this.object = null;
			//		return;
			//	}

			//	var user = User.get;

			//	//Create the Behaviour in the DB
			//	if ( user.project )
			//	{
			//		user.project.on(ProjectEvents.FAILED, this.onRenamed, this );
			//		user.project.on(ProjectEvents.OBJECT_RENAMED, this.onRenamed, this );

			//		if ( this.object instanceof TreeNodeGroup )
			//			user.project.renameObject(name, (<TreeNodeGroup>this.object).groupID, ProjectAssetTypes.GROUP );
			//		else if ( this.object instanceof Asset )
			//			user.project.renameObject( name, this.object.id, ProjectAssetTypes.ASSET );
			//		else if ( this.object instanceof BehaviourContainer )
			//			user.project.renameObject( name, this.object.id, ProjectAssetTypes.BEHAVIOUR );
			//	}
			//	return;
			//}


			//super.OnButtonClick( e );
		}

		///**
		//* Called when we create a behaviour.
		//* @param {any} response 
		//* @param {any} data 
		//*/
		//onRenamed(response: ProjectEvents, data: ProjectEvent )
		//{
		//	var user : User = User.get;
            
		//	if ( user.project )
		//	{
		//		user.project.off(ProjectEvents.FAILED, this.onRenamed, this );
		//		user.project.off(ProjectEvents.OBJECT_RENAMED, this.onRenamed, this );
		//	}

		//	//if ( response == ProjectEvents.FAILED )
		//	//{
		//	//	this.warning.textfield.element.css( "color", "#FF0000" );
		//	//	this.warning.text = data.message;
		//	//	return;
		//	//}

		//	//Dispatch an event notifying listeners of the renamed object
		//	//var name = ( <Label>this.name.val ).text;
  //          this.emit(new RenameFormEvent("renamed", name, this.object)  );
		//	this.object = null;

		//	this.hide();
		//}

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