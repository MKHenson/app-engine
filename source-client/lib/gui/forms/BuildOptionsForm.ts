module Animate
{
	/**
	* Use this form to set the project meta and update build versions.
	*/
	export class BuildOptionsForm extends OkCancelForm
	{
		public static _singleton: BuildOptionsForm;

		private _tab: Tab;
		private _projectTab: Component;
		private _name: LabelVal;
		private _tags: LabelVal;
		private _description: LabelVal;
		private _projVisibility: LabelVal;
		private _category: LabelVal;
		private _buildVerMaj: LabelVal;
		private _buildVerMid: LabelVal;
		private _buildVerMin: LabelVal;		
		private _warning: Label;
		private _visibility: LabelVal;
		private _notes: LabelVal;
		private _imgPreview: Component;
		private _addButton: Component;
		private _saveProject: Button;
		private _selectBuild: Button;
        private _saveBuild: Button;
        private _uploader: FileUploaderBasic;

		private _renameProxy: any;
		private _buildProxy: any;
		private _submitProxy: any;
		private _progressProxy: any;
		private _completeProxy: any;
		private _errorProxy: any;
		private _clickProxy: any;
		private _settingPages: Array<ISettingsPage>;

		constructor()
		{
			super(600, 500, true, true, "Settings", true);

			if ( BuildOptionsForm._singleton != null )
				throw new Error( "The BuildOptionsForm class is a singleton. You need to call the BuildOptionsForm.getSingleton() function." );

			BuildOptionsForm._singleton = this;
			
			this.element.addClass( "build-options-form" );
			this.okCancelContent.element.css( { height: "500px" });

			this._tab = new Tab( this.okCancelContent );
			var tabPage = this._tab.addTab( "Project", false ).page;
			var projectGroup = new Group( "Project Options", tabPage );
			var imgGroup = new Group( "Image", tabPage );
			this._projectTab = tabPage;

			tabPage = this._tab.addTab( "Build Options", false ).page;
			var buildGroup = new Group( "Build", tabPage );
			var notesGroup = new Group( "Properties", tabPage );

			//Project fields
			this._name = new LabelVal( projectGroup.content, "Name", new InputBox( null, "" ) );
			this._tags = new LabelVal( projectGroup.content, "Tags", new InputBox( null, "" ) );
			this._description = new LabelVal( projectGroup.content, "Description", new InputBox( null, "", true ) );
			(<Label>this._description.val).textfield.element.css( { height: "180px" });


			var combo : ComboBox = new ComboBox();
			combo.addItem( "Private" );
			combo.addItem( "Public" );
			this._projVisibility = new LabelVal( projectGroup.content, "Visibility", combo );
			info = new Label( "If public, your project will be searchable on the Webinate gallery.", projectGroup.content );
			info.element.addClass( "info" );

			combo = new ComboBox();
			combo.addItem( "Other" );
			combo.addItem( "Artistic" );
			combo.addItem( "Gaming" );
			combo.addItem( "Informative" );
			combo.addItem( "Musical" );
			combo.addItem( "Fun" );
			combo.addItem( "Technical" );
			this._category = new LabelVal( projectGroup.content, "Category", combo );
			info = new Label( "Optionally provide a project category. The default is 'Other'", projectGroup.content );
			info.element.addClass( "info" );

			this._saveProject = new Button( "Save", projectGroup.content );
			this._saveProject.css( { width: "85px" });

			//Image
			this._imgPreview = <Component>imgGroup.content.addChild( "<div class='preview'></div>" );
			var imgData : Component = <Component>imgGroup.content.addChild( "<div class='img-data'></div>" );
			info = new Label( "Upload an image for the project; this image will show up in the Animate gallery for others to see. <br/><br/><span class='nb'>Your application must have an image in order to be shown in the gallery.</span></br><br/>Your project image should be either a .png, .jpg or .jpeg image that is 200 by 200 pixels.", imgData );
			info.element.addClass( "info" );

			this._addButton = <Component>imgData.addChild( "<div class='tool-bar-group'><div class='tab-button'><div><img src='media/add-asset.png' /></div><div class='tool-bar-text'>Add</div></div></div>" );
			imgGroup.content.addChild( "<div class='fix'></div>" );

			//Build options	
			this._buildVerMaj = new LabelVal( buildGroup.content, "Major Version: ", new InputBox( null, "1" ), { width: "50px", "float": "left", "margin": "0 0 10px 10px" });
			this._buildVerMid = new LabelVal( buildGroup.content, "Mid Version: ", new InputBox( null, "0" ), { width: "50px", "float": "left", "margin": "0 0 10px 10px" });
			this._buildVerMin = new LabelVal( buildGroup.content, "Minor Version: ", new InputBox( null, "0" ), { width: "50px", "float": "left", "margin": "0 0 10px 10px" });

			buildGroup.content.element.append( "<div class='fix'></div>" );
			var info = new Label( "When you build a project it saves the data according to its version number. This helps you differenciate your builds and release incremental versions. You can switch between the different builds by specifying which version to use. Use the above fields to select, or if its not present create, a particular build.", buildGroup.content);
			info.element.addClass( "info" );


			this._selectBuild = new Button( "Select Build", buildGroup.content );
			this._selectBuild.css( { width: "85px" });
			this._buildVerMaj.element.css( { "width": "auto", "float": "left", "margin": "0 0 0 5px" });
			this._buildVerMid.element.css( { "width": "auto", "float": "left", "margin": "0 0 0 5px" });
			this._buildVerMin.element.css( { "width": "auto", "float": "left", "margin": "0 0 0 5px" });

			//Notes
			this._notes = new LabelVal( notesGroup.content, "Notes", new InputBox( null, "Some notes", true ) );
			(<Label>this._notes.val).textfield.element.css( { height: "80px" });
			info = new Label("Use the above pad to store some build notes for the selected build.", notesGroup.content );
			info.element.addClass( "info" );

			combo = new ComboBox();
			combo.addItem( "Private" );
			combo.addItem( "Public" );
			this._visibility = new LabelVal( notesGroup.content, "Visibility", combo );
			info = new Label( "by default all builds are public. If you want to make your project private, then please upgrade your account.", notesGroup.content );
			info.element.addClass( "info" );

			this._saveBuild = new Button( "Save", notesGroup.content );
			this._saveBuild.css( { width: "85px" });

			this._warning = new Label( "", this.content );
			this._warning.element.addClass( "server-message" );

			//Create the proxies
			this._renameProxy = jQuery.proxy( this.onRenamed, this );
			this._buildProxy = jQuery.proxy( this.onBuildResponse, this );
			this._submitProxy = jQuery.proxy( this.onSubmit, this );
			this._progressProxy = jQuery.proxy( this.onProgress, this );
			this._completeProxy = jQuery.proxy( this.onUploadComplete, this );
			this._errorProxy = jQuery.proxy( this.onError, this );
			this._clickProxy = jQuery.proxy( this.onClick, this );

			this._saveProject.element.on( "click", this._clickProxy );
			this._selectBuild.element.on( "click", this._clickProxy );
			this._saveBuild.element.on( "click", this._clickProxy );

			this._settingPages = [];

			this._tab.addEventListener( TabEvents.SELECTED, this.onTab, this );
		}

		/**
		* Called when we click on the settings tab
		* @param {any} event 
		* @param {any} data 
		*/
		onTab( response : TabEvents, event : TabEvent, sender? :EventDispatcher )
		{
			var i = this._settingPages.length;
			while ( i-- )
				if ( this._settingPages[i].name == event.pair.text )
					this._settingPages[i].onTab();
		}

		/**
		* Use this function to add a new settings page to the settings menu
		* @param {ISettingsPage} component The ISettingsPage component we're adding
		*/
		addSettingPage( component: ISettingsPage )
		{
			this._settingPages.push( component );
			var tabPage: TabPair = this._tab.addTab( component.name, false );
			tabPage.page.addChild( component );
		}

		/**
		* When we click one of the buttons
		* @param {any} e 
		* @returns {any} 
		*/
		onClick( e )
		{
			var target : Component = jQuery( e.currentTarget ).data( "component" );

			if ( target == this._saveProject )
			{
				//Check if the values are valid
				(<Label>this._name.val).textfield.element.removeClass( "red-border" );
				this._warning.textfield.element.css( "color", "" );

				//Check for special chars
				var message: string = Utils.checkForSpecialChars( ( <Label>this._name.val).text );
				if ( message != null )
				{
					( <Label>this._name.val ).textfield.element.addClass( "red-border" );
					this._warning.textfield.element.css( "color", "#FF0000" );
					this._warning.text = message;
					return;
				}

				//Check for special chars
				message = Utils.checkForSpecialChars( (<Label>this._tags.val).text, true );
				if ( message != null )
				{
					( <Label>this._tags.val).textfield.element.addClass( "red-border" );
					this._warning.textfield.element.css( "color", "#FF0000" );
                    this._warning.text = message;
					return;
				}

				var name = ( <Label>this._name.val ).text;
				var description = ( <Label>this._description.val ).text;
				var tags = ( <Label>this._tags.val ).text;
				var user = User.get;
				var project : Project = User.get.project;

				user.addEventListener( UserEvents.FAILED, this._renameProxy );
				user.addEventListener( UserEvents.PROJECT_RENAMED, this._renameProxy );
				user.renameProject( project._id, name, description, tags.split(","), (<ComboBox>this._category.val).selectedItem, "", (<ComboBox>this._projVisibility.val).selectedItem );
			}
			else if ( target == this._saveBuild )
			{
				//Check if the values are valid
				(<Label>this._name.val).textfield.element.removeClass( "red-border" );
				this._warning.textfield.element.css( "color", "" );

				//Check for special chars
				var message : string = Utils.checkForSpecialChars( (<Label>this._notes.val).text, true );
				if ( message != null )
				{
					(<Label>this._notes.val).textfield.element.addClass( "red-border" );
					this._warning.textfield.element.css( "color", "#FF0000" );
					this._warning.text = message;
					return;
				}

                var user: User = User.get;
                var project: Project = User.get.project;
				var build = project.mCurBuild;

				project.addEventListener( ProjectEvents.FAILED, this._buildProxy, this );
				project.addEventListener( ProjectEvents.BUILD_SAVED, this._buildProxy, this );
				project.saveBuild( (<Label>this._notes.val).text, (<ComboBox>this._visibility.val).selectedItem, build.html, build.css );
			}
			else if ( target == this._selectBuild )
			{
				//Check if the values are valid
				(<Label>this._name.val).textfield.element.removeClass( "red-border" );
				this._warning.textfield.element.css( "color", "" );

				//Check for special chars
				var number = parseInt( (<Label>this._buildVerMaj.val).text );
				if ( isNaN( number ) )
				{
					( <Label>this._buildVerMaj.val).textfield.element.addClass( "red-border" );
					this._warning.textfield.element.css( "color", "#FF0000" );
					this._warning.text = "Please only use numbers";
					return;
				}

				number = parseInt( (<Label>this._buildVerMid.val).text );
				if ( isNaN( number ) )
				{
					( <Label>this._buildVerMid.val).textfield.element.addClass( "red-border" );
					this._warning.textfield.element.css( "color", "#FF0000" );
					this._warning.text = "Please only use numbers";
					return;
				}

                number = parseInt((<Label>this._buildVerMin.val).text );
				if ( isNaN( number ) )
				{
					( <Label>this._buildVerMin.val).textfield.element.addClass( "red-border" );
					this._warning.textfield.element.css( "color", "#FF0000" );
					this._warning.text = "Please only use numbers";
					return;
				}


				var user : User = User.get;
				var project : Project = User.get.project;
				project.addEventListener( ProjectEvents.FAILED, this._buildProxy, this );
				project.addEventListener( ProjectEvents.BUILD_SELECTED, this._buildProxy, this );
				project.selectBuild( (<Label>this._buildVerMaj.val).text, (<Label>this._buildVerMid.val).text, (<Label>this._buildVerMin.val).text );
			}

		}

		/**
		* Catch the key down events.
		* @param {any} e The jQuery event object
		*/
		onKeyDown( e )
		{
			//Do nothing	
		}

		/**
		* When we recieve the server call for build requests
		* @param {ProjectEvents} event 
		* @param {Event} data 
		*/
        onBuildResponse(response: ProjectEvents, event : ProjectEvent )
		{
			var user = User.get;
			var project = User.get.project;

            project.removeEventListener(ProjectEvents.FAILED, this._buildProxy, this );
            project.removeEventListener(ProjectEvents.BUILD_SAVED, this._buildProxy, this );
            project.removeEventListener(ProjectEvents.BUILD_SELECTED, this._buildProxy, this );

			if (event.return_type == AnimateLoaderResponses.ERROR )
			{
				(<Label>this._notes.val).textfield.element.removeClass( "red-border" );
				this._warning.textfield.element.css( "color", "#FF0000" );
                this._warning.text = event.message;
				return;
			}

            if (response == ProjectEvents.BUILD_SELECTED )
			{
				//Check if the values are valid
				(<Label>this._buildVerMaj.val).textfield.element.removeClass( "red-border" );
                (<Label>this._buildVerMid.val).textfield.element.removeClass( "red-border" );
                (<Label>this._buildVerMin.val).textfield.element.removeClass( "red-border" );
				(<Label>this._notes.val).textfield.element.removeClass( "red-border" );

				this._warning.textfield.element.css( "color", "#5DB526" );
                this._warning.text = event.message;

				//Update fields
				this.updateFields( event.tag );
			}
            else if (response == ProjectEvents.BUILD_SAVED )
			{
				//Check if the values are valid
                (<Label>this._notes.val).textfield.element.removeClass( "red-border" );
				this._warning.textfield.element.css( "color", "#5DB526" );
				this._warning.text = "Build saved";

				//Update fields
                this.updateFields( event.tag );
			}
			else
			{
				this._warning.textfield.element.css( "color", "#FF0000" );
                this._warning.text = event.message;
			}
		}

		/**
		* Updates some of the version fields with data
		* @param {Build} data 
		*/
		updateFields( data: Build )
		{
			var versionParts = data.version.split(".");

			( <Label>this._buildVerMaj.val ).text = versionParts[0];
			( <Label>this._buildVerMid.val ).text = versionParts[1];
			( <Label>this._buildVerMin.val ).text = versionParts[2];
			(<Label>this._notes.val).text = data.build_notes;
            (<ComboBox>this._visibility.val).selectedItem = ( data.visibility == "Public" ? "Public" : "Private" );
			this.initializeLoader();
		}

		/**
		* When we recieve the server call for saving project data.
		* @param {UserEvents} event 
		* @param {UserEvent} data 
		*/
        onRenamed( response: UserEvents, event: UserEvent )
		{
			var user : User = User.get;
			var project = User.get.project;

			if ( event.return_type == AnimateLoaderResponses.ERROR )
			{
				this._warning.textfield.element.css( "color", "#FF0000" );
				this._warning.text = event.message;
				return;
			}

            if (response == UserEvents.PROJECT_RENAMED )
			{
				//Check if the values are valid
                (<Label>this._name.val).textfield.element.removeClass( "red-border" );                
				(<Label>this._tags.val).textfield.element.removeClass( "red-border" );
				this._warning.textfield.element.css( "color", "#5DB526" );
				this._warning.text = "Project updated.";
			}
			else
			{
				this._warning.textfield.element.css( "color", "#FF0000" );
                this._warning.text = event.message;
			}

			user.removeEventListener( UserEvents.FAILED, this._renameProxy );
            user.removeEventListener( UserEvents.PROJECT_RENAMED, this._renameProxy );
		}

		/**
		* Shows the build options form
		* @returns {any} 
		*/
		show()
		{
			OkCancelForm.prototype.show.call( this );
            this._tab.selectTab( this._tab.getTab( "Project" ) );

			var user = User.get;
			var project = user.project;

			//Start the image uploader
			this.initializeLoader();


			this._warning.textfield.element.css( "color", "" );
            this._warning.text = "";

            //Set project vars
            (<Label>this._name.val).text = project.mName;
            (<Label>this._description.val).text = project.mDescription;
            (<Label>this._tags.val).text = project.mTags;

			(<Label>this._name.val).textfield.element.removeClass( "red-border" );
			(<Label>this._description.val).textfield.element.removeClass( "red-border" );
			(<Label>this._tags.val).textfield.element.removeClass( "red-border" );

			//Set current build vars
			var versionParts = project.mCurBuild.version.split( "." );
			( <Label>this._buildVerMaj.val ).text = versionParts[0];
			( <Label>this._buildVerMid.val ).text = versionParts[1];
			( <Label>this._buildVerMin.val ).text = versionParts[2];
            (<Label>this._notes.val).text = project.mCurBuild.build_notes;
			this._imgPreview.element.html( ( project.mImgPath != "" ? "<img src='" + project.mImgPath + "'/>" : "" ) );

			(<ComboBox>this._visibility.val).selectedItem = ( project.mCurBuild.visibility == "Public" ? "Public" : "Private" );
			(<ComboBox>this._projVisibility.val).selectedItem = ( project.mVisibility == "Public" ? "Public" : "Private" );
			(<ComboBox>this._category.val).selectedItem = project.mCategory;

            (<Label>this._buildVerMaj.val).textfield.element.removeClass( "red-border" );
			(<Label>this._buildVerMid.val).textfield.element.removeClass( "red-border" );
			(<Label>this._buildVerMin.val).textfield.element.removeClass( "red-border" );
			(<Label>this._notes.val).textfield.element.removeClass( "red-border" );

            (<Label>this._name.val).textfield.element.focus();
            (<Label>this._name.val).textfield.element.select();

			var i = this._settingPages.length;
			while ( i-- )
				this._settingPages[i].onShow( project, user );

			this.update();
		}

		/**
		* This is called to initialize the one click loader
		*/
		initializeLoader()
		{
			if ( !this._uploader )
			{
				this._uploader = new qq.FileUploaderBasic( {
					button: document.getElementById( this._addButton.id ),
					action: DB.HOST + "/file/upload-project-image",

					onSubmit: this._submitProxy,
					onComplete: this._completeProxy,
					onProgress: this._progressProxy,
					onError: this._errorProxy,
					demoMode: false
				});

				this._uploader._options.allowedExtensions.push( "jpg", "png", "jpeg" );
			}

			this._uploader.setParams( { projectId: User.get.project._id });
		}

		/**
		* Use this function to print a message on the settings screen. 
		* @param {string} message The message to print
		* @param <bool> isError Should this be styled to an error or not
		*/
		message( message, isError )
		{
			if ( isError )
				this._warning.textfield.element.css( "color", "#FF0000" );
			else
				this._warning.textfield.element.css( "color", "#5DB526" );

			this._warning.text = message;
		}

		/**
		* Fired when the upload is complete
		*/
		onUploadComplete( id, fileName, response )
		{
			if ( response.message )
			{
				this._warning.text = response.message;
                this._addButton.enabled = true;

				if ( AnimateLoaderResponses.fromString( response.return_type ) == AnimateLoaderResponses.SUCCESS )
				{
					this._warning.textfield.element.css( "color", "#5DB526" );
					var project = User.get.project;
					project.mImgPath = response.imageUrl;
					this._imgPreview.element.html( ( response.imageUrl != "" ? "<img src='" + response.imageUrl + "'/>" : "" ) );
				}
				else
				{
					this._warning.textfield.element.css( "color", "#FF0000" );
                    this._warning.text = response.message;
					return;
				}
			}
			else
			{
				this._warning.textfield.element.css( "color", "#FF0000" );
				this._warning.text = 'Error Uploading File.';
				this._addButton.enabled = true;
			}
		}

		/**
		* Fired when the upload is cancelled due to an error
		*/
		onError( id, fileName, reason )
		{
			this._warning.textfield.element.css( "color", "#FF0000" );
			this._warning.text = 'Error Uploading File.';
			this._addButton.enabled = true;
		}


		/**
		* When we receive a progress event
		*/
		onProgress( id, fileName, loaded, total )
		{
			this._warning.text = 'Uploading...' + ( ( loaded / total ) * 100 );
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
				this._warning.textfield.element.css( "color", "#FF0000" );
				this._warning.text = 'Only png, jpg and jpeg files are allowed';
				return false;
			}

			this._warning.textfield.element.css( "color", "" );
			this._warning.text =  'Uploading...';
			this._addButton.enabled = false;

		}


		/**
		* Gets the singleton instance.
		* @returns {BuildOptionsForm} 
		*/
		static getSingleton() : BuildOptionsForm
		{
			if ( !BuildOptionsForm._singleton )
				new BuildOptionsForm();

			return BuildOptionsForm._singleton;
		}
	}
}