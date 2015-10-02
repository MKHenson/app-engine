module Animate
{
	export class RenameFormEvents extends ENUM
	{
		constructor(v: string) { super(v); }

		static OBJECT_RENAMED: RenameFormEvents = new RenameFormEvents("rename_form_object_renamed");
		static OBJECT_RENAMING: RenameFormEvents = new RenameFormEvents("rename_form_object_renaming");
	}

	export class RenameFormEvent extends Event
	{
		cancel: boolean;
		name: string;
		object: any;

		constructor(eventName: RenameFormEvents, name: string, object:any )
		{
			super(eventName, name);
			this.cancel = false;
			this.name = name;
			this.object = object;
		}
	}

	/**
	* This form is used to rename objects
	*/
	export class RenameForm extends OkCancelForm
	{
		private static _singleton: RenameForm;
		public name: LabelVal;
		public warning: Label;
		private object: Component;

		constructor()
		{
			if ( RenameForm._singleton != null )
				throw new Error( "The RenameForm class is a singleton. You need to call the RenameForm.getSingleton() function." );

			RenameForm._singleton = this;

			// Call super-class constructor
			super( 400, 250, false, true, "Please enter a name" );

			this.element.addClass( "rename-form" );
			this.name = new LabelVal( this.okCancelContent, "Name", new InputBox( null, "" ) );
			//this.heading.text("Please enter a name");

			this.object = null;

			this.warning = new Label( "Please enter a name and click Ok.", this.okCancelContent );
		}

		/**
		* @type public mfunc show
		* Shows the window.
		* @param {any} object 
		* @param {string} curName 
		* @extends {RenameForm}
		*/
		showForm( object : any, curName : string )
		{
			this.object = object;

			(<Label>this.name.val).text = curName;

			this.warning.textfield.element.css( "color", "" );
			this.warning.text = "Please enter a name and click Ok.";
			( <Label>this.name.val ).textfield.element.removeClass( "red-border" );
			super.show();

			( <InputBox>this.name.val ).focus();
		}

		/**
		* @type public mfunc OnButtonClick
		* Called when we click one of the buttons. This will dispatch the event OkCancelForm.CONFIRM
		* and pass the text either for the ok or cancel buttons.
		* @param {any} e 
		* @extends {RenameForm}
		*/
		OnButtonClick( e : any )
		{
			if ( jQuery( e.target ).text() == "Ok" )
			{
				//Check if the values are valid
				(<Label>this.name.val).textfield.element.removeClass( "red-border" );
				this.warning.textfield.element.css( "color", "" );

				//Check for special chars
				var message = Utils.checkForSpecialChars( (<Label>this.name.val).text );
				if ( message != null )
				{
					( <Label>this.name.val ).textfield.element.addClass( "red-border" );
					this.warning.textfield.element.css( "color", "#FF0000" );
					this.warning.text = message;
					return;
				}

				var name : string = ( <Label>this.name.val ).text;

				//Dispatch an event notifying listeners of the renamed object
				var event: RenameFormEvent  = new RenameFormEvent(RenameFormEvents.OBJECT_RENAMING, name, this.object)
				this.dispatchEvent(event );
				if ( event.cancel )
					return;

				if ( this.object instanceof Behaviour )
				{
					OkCancelForm.prototype.OnButtonClick.call( this, e );
					(<Behaviour>this.object).onRenamed( name );
					//Dispatch an event notifying listeners of the renamed object
					this.dispatchEvent(new RenameFormEvent(RenameFormEvents.OBJECT_RENAMED, name, this.object));
					this.object = null;
					return;
				}

				var user = User.get;

				//Create the Behaviour in the DB
				if ( user.project )
				{
					user.project.addEventListener(ProjectEvents.FAILED, this.onRenamed, this );
					user.project.addEventListener(ProjectEvents.OBJECT_RENAMED, this.onRenamed, this );

					if ( this.object instanceof TreeNodeGroup )
						user.project.renameObject(name, (<TreeNodeGroup>this.object).groupID, ProjectAssetTypes.GROUP );
					else if ( this.object instanceof Asset )
						user.project.renameObject( name, this.object.id, ProjectAssetTypes.ASSET );
					else if ( this.object instanceof BehaviourContainer )
						user.project.renameObject( name, this.object.id, ProjectAssetTypes.BEHAVIOUR );
				}
				return;
			}


			super.OnButtonClick( e );
		}

		/**
		* Called when we create a behaviour.
		* @param {any} response 
		* @param {any} data 
		*/
		onRenamed(response: ProjectEvents, data: ProjectEvent )
		{
			var user : User = User.get;

			//user.removeEventListener( UserEvents.PROJECT_RENAMED, this.onRenamed, this );

			if ( user.project )
			{
				user.project.removeEventListener(ProjectEvents.FAILED, this.onRenamed, this );
				user.project.removeEventListener(ProjectEvents.OBJECT_RENAMED, this.onRenamed, this );
			}

			if ( response == ProjectEvents.FAILED )
			{
				this.warning.textfield.element.css( "color", "#FF0000" );
				this.warning.text = data.message;
				return;
			}

			//Dispatch an event notifying listeners of the renamed object
			var name = ( <Label>this.name.val ).text;
			this.dispatchEvent(new RenameFormEvent(RenameFormEvents.OBJECT_RENAMED, name, this.object)  );
			this.object = null;

			this.hide();
		}

		/**
		* Gets the singleton instance.
		* @returns {RenameForm} 
		*/
		static getSingleton() : RenameForm
		{
			if ( !RenameForm._singleton )
				new RenameForm();

			return RenameForm._singleton;
		}
	}
}