module Animate
{
	/**
	* This form is used to create or edit Portals.
	*/
	export class NewBehaviourForm extends OkCancelForm
	{
		public static _singleton: NewBehaviourForm;

		private name: LabelVal;
		private warning: Label;
		private createProxy: any;

		constructor()
		{
			if ( NewBehaviourForm._singleton != null )
				throw new Error( "The NewBehaviourForm class is a singleton. You need to call the NewBehaviourForm.getSingleton() function." );

			NewBehaviourForm._singleton = this;

			// Call super-class constructor
			super( 400, 250, false, true, "Please enter a name" );

			this.element.addClass( "new-behaviour-form" );
			this.name = new LabelVal( this.okCancelContent, "Name", new InputBox( null, "" ) );
			this.warning = new Label( "Please enter a behaviour name.", this.okCancelContent );

			//Create the proxies
			this.createProxy = this.onCreated.bind( this );
		}

		/** Shows the window. */
		show()
		{
			( <Label>this.name.val ).text = "";
			this.warning.textfield.element.css( "color", "" );
			this.warning.text = "Please enter a behaviour name.";
			( <Label>this.name.val).textfield.element.removeClass( "red-border" );
			super.show();

			( <Label>this.name.val).textfield.element.focus();
		}

		/** Called when we click one of the buttons. This will dispatch the event OkCancelForm.CONFIRM
		and pass the text either for the ok or cancel buttons. */
		OnButtonClick( e )
		{
			if ( jQuery( e.target ).text() == "Ok" )
			{
				//Check if the values are valid
				( <Label>this.name.val).textfield.element.removeClass( "red-border" );
				this.warning.textfield.element.css( "color", "" );

				//Check for special chars
				var message = Utils.checkForSpecialChars( ( <Label>this.name.val).text );
				if ( message != null )
				{
					(<Label>this.name.val).textfield.element.addClass( "red-border" );
					this.warning.textfield.element.css( "color", "#FF0000" );
					this.warning.text = message;
					return;
				}

				//Create the Behaviour in the DB
                User.get.project.addEventListener( ProjectEvents.FAILED, this.createProxy );
				User.get.project.addEventListener( ProjectEvents.BEHAVIOUR_CREATED, this.createProxy );
				User.get.project.createBehaviour( ( <Label>this.name.val).text );
				return;
			}

			super.OnButtonClick( e );
		}

		/** Called when we create a behaviour.*/
		onCreated( response: ProjectEvents, event : ProjectEvent )
		{
			User.get.project.removeEventListener( ProjectEvents.FAILED, this.createProxy );
			User.get.project.removeEventListener( ProjectEvents.BEHAVIOUR_CREATED, this.createProxy );

			if ( response == ProjectEvents.FAILED )
			{
				this.warning.textfield.element.css( "color", "#FF0000" );
				this.warning.text = event.message;
				return;
			}

			this.hide();
		}

		/** Gets the singleton instance. */
		static getSingleton()
		{
			if ( !NewBehaviourForm._singleton )
				new NewBehaviourForm();

			return NewBehaviourForm._singleton;
		}
	}
}