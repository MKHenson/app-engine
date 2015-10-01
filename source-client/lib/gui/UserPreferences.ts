module Animate
{
	/**
	* Use this form to set the project meta and update build versions.
	*/
	export class UserPreferences extends Component implements ISettingsPage
	{
		private username: LabelVal;
		private joined: LabelVal;
		private bio: LabelVal;
		private info: Label;
		private imgPreview: Component;
		private userImgButton: Component;
		private saveDetails: Button;

		private submitProxy: any;
		private progressProxy: any;
		private completeProxy: any;
		private errorProxy: any;
		private avatarUploader: FileUploaderBasic;
		private _name: string;

		constructor( name? : string )
		{
			super(null, null);

			this._name = name;
			var group = new Group( "Details", this );

			this.username = new LabelVal( group.content, "Username: ", new Label( "", null ) );
			( <Label>this.username.val ).textfield.element.css( { "text-align": "left" });

			this.joined = new LabelVal( group.content, "Joined On: ", new Label( "", null ) );
			( <Label>this.joined.val ).textfield.element.css( { "text-align": "left" });

			//Image
			group = new Group( "Avatar", this );
			this.imgPreview = <Component>group.content.addChild( "<div class='preview'></div>" );
			this.userImgButton = <Component>group.content.addChild( "<div class='tool-bar-group'><div class='toolbar-button'><div><img src='media/add-asset.png' /></div><div class='tool-bar-text'>Add</div></div></div>" );
			group.content.addChild( "<div class='fix'></div>" );

			var info: Label = new Label( "Use this button to upload your avatar picture.", group.content );
			info.element.addClass( "info" );

			//Notes
			group = new Group( "User information", this );
			this.bio = new LabelVal( group.content, "Bio", new InputBox( null, "Bio", true ) );
			( <Label>this.bio.val ).textfield.element.css( { height: "80px" });
			info = new Label( "Use the above pad to write about yourself. This will show up on Webinate next to your projects.", group.content );
			info.element.addClass( "info" );
			( <InputBox>this.bio.val ).limitCharacters = 2048;

			//save button
			this.saveDetails = new Button( "Save", group.content );
			this.saveDetails.css( "height", "30px" );

			this.avatarUploader = null;

			this.submitProxy = this.onSubmit.bind( this );
			this.progressProxy = this.onProgress.bind( this );
			this.completeProxy = this.onUploadComplete.bind( this );
			this.errorProxy = this.onError.bind( this );

			this.saveDetails.element.on( "click", jQuery.proxy( this.onClick, this ) );
		}

		/**
		* When we click a button
		*/
		onClick( e : any )
		{
			var comp : Component = jQuery( e.currentTarget ).data( "component" );
			var user : User = User.get;

			if ( comp == this.saveDetails )
			{
				//Check for special chars
				( <InputBox>this.bio.val ).textfield.element.removeClass( "red-border" );
				var message: string = Utils.checkForSpecialChars( (<Label>this.bio.val).text );
				if ( message != null )
				{
					( <InputBox>this.bio.val ).textfield.element.addClass( "red-border" );
					BuildOptionsForm.getSingleton().message( message, true );
					return;
				}

				user.addEventListener( UserEvents.DETAILS_SAVED, this.onServer, this );
				user.addEventListener( UserEvents.FAILED, this.onServer, this );
				user.updateDetails( ( <InputBox>this.bio.val ).text );
			}
		}

		/**
		* When we receive a server command
		*/
		onServer( event: UserEvents, e : UserEvent )
		{
			var user : User = User.get;
			user.removeEventListener( UserEvents.FAILED, this.onServer, this );

			if ( e.return_type == AnimateLoaderResponses.ERROR )
			{
				BuildOptionsForm.getSingleton().message( e.tag.message, true );
				return;
			}

			if ( event == UserEvents.DETAILS_SAVED )
			{
				user.removeEventListener( UserEvents.DETAILS_SAVED, this.onServer, this );
                BuildOptionsForm.getSingleton().message(e.tag.message, false);
                user.userEntry.meta.bio = e.tag.bio;
			}
			else
				BuildOptionsForm.getSingleton().message( e.tag.message, true );
		}

		/**
		* Called when the tab page is clicked
		*/
		onTab()
		{
			if ( !this.parent )
				return;

			if ( !this.avatarUploader )
			{
				this.avatarUploader = new qq.FileUploaderBasic( {
					button: document.getElementById( this.userImgButton.id ),
					action: DB.HOST + "/file/upload-user-avatar",

					onSubmit: this.submitProxy,
					onComplete: this.completeProxy,
					onProgress: this.progressProxy,
					onError: this.errorProxy,
					demoMode: false
				});

				this.avatarUploader._options.allowedExtensions.push( "jpg", "png", "jpeg" );
			}
		}

		/**
		* When the settings page is shown.
		* @param <Project> project The project of this session
		* @param <User> user The user of this session
		*/
		onShow( project, user )
		{
			( <InputBox>this.bio.val ).textfield.element.removeClass( "red-border" );
			( <Label>this.username.val ).text = user.username;
			( <Label>this.joined.val ).text = new Date( user.createdOn ).toDateString();
			( <InputBox>this.bio.val ).text = user.bio;
			this.imgPreview.element.html( ( user.imgURL != "" ? "<img src='" + user.imgURL + "'/>" : "" ) );
		}

		/**
		* Fired when the upload is complete
		*/
		onUploadComplete( id, fileName, response )
		{
			if ( AnimateLoaderResponses.fromString( response.return_type ) == AnimateLoaderResponses.SUCCESS )
			{
				this.userImgButton.enabled = true;

				BuildOptionsForm.getSingleton().message( response.message, false );
                User.get.userEntry.meta.imgURL = response.imageUrl;
				this.imgPreview.element.html( ( response.imageUrl != "" ? "<img src='" + response.imageUrl + "'/>" : "" ) );				
			}
			else
			{
				BuildOptionsForm.getSingleton().message( response.message, true );
				this.userImgButton.enabled = true;
			}
		}

		/**
		* Fired when the upload is cancelled due to an error
		*/
		onError( id, fileName, reason )
		{
			BuildOptionsForm.getSingleton().message( "Error Uploading File.", true );
			this.userImgButton.enabled = true;
		}


		/**
		* When we receive a progress event
		*/
		onProgress( id, fileName, loaded, total )
		{
			BuildOptionsForm.getSingleton().message( 'Uploading...' + ( ( loaded / total ) * 100 ), false );
		}

		/**
		* When we click submit on the upload button
		*/
		onSubmit( file, ext )
		{
			var fExt = ext.split( "." );
			fExt = fExt[fExt.length - 1];
			fExt.toLowerCase();

			if ( fExt != "png" && fExt != "jpeg" && fExt != "jpg" )
			{
				// check for valid file extension
				BuildOptionsForm.getSingleton().message( 'Only png, jpg and jpeg files are allowed', true );
				return false;
			}

			BuildOptionsForm.getSingleton().message( 'Uploading...', false );
			this.userImgButton.enabled = false;
		}

		get name(): string { return this._name; }
		set name( value: string ) { this._name = value; }
	}
}