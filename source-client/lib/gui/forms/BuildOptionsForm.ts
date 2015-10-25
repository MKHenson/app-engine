module Animate
{
	/**
	* Use this form to set the project meta and update build versions.
	*/
    export class BuildOptionsForm extends Window
	{
		public static _singleton: BuildOptionsForm;

        private _projectElm: JQuery;
        private _buildElm: JQuery;
        private _userElm: JQuery;
        private $user: User;
        private $project: Project;
        private $projectToken: Engine.IProject;
        private $errorMsg: string;
        private $errorMsgImg: string;
        private $loading: boolean;
        private $loadingPercent;

		private _tab: Tab;
		private _buildVerMaj: LabelVal;
		private _buildVerMid: LabelVal;
		private _buildVerMin: LabelVal;
		private _visibility: LabelVal;
		private _notes: LabelVal;
		private _selectBuild: Button;
        private _saveBuild: Button;
        private _uploader: FileUploaderBasic;
		private _buildProxy: any;
		private _clickProxy: any;
		private _settingPages: Array<ISettingsPage>;

		constructor()
		{
			super(600, 500, true, true, "Settings");
			BuildOptionsForm._singleton = this;
			
			this.element.addClass( "build-options-form" );

            this._tab = new Tab(this.content);
            var tabPage = this._tab.addTab("Project", false).page;

            this._projectElm = jQuery("#options-project").remove().clone();
            this._buildElm = jQuery("#options-build").remove().clone();
            this._userElm = jQuery("#options-user").remove().clone();

            tabPage.element.append(this._projectElm);

            
            this.$user = User.get;
            this.$project = null;
            this.$errorMsg = "";
            this.$errorMsgImg = "";
            this.$loading = false;
            this.$projectToken = { tags: [] };
            this.$loadingPercent = "";

            // Compile the HTML
            Compiler.build(this._projectElm, this, false); 
            

            tabPage = this._tab.addTab("Build Options", false).page;
            tabPage.element.append(this._buildElm);

			this._settingPages = [];
            this._tab.addEventListener(TabEvents.SELECTED, this.onTab, this);
            tabPage = this._tab.addTab("User Options", false).page;
            tabPage.element.append(this._userElm);
		}

        /** 
        * Attempts to update the project
        */
        updateDetails(token: Engine.IPlugin)
        {
            var that = this,
                project = User.get.project;
            this.$loading = true;
            this.$errorMsg = "";
            
            project.updateDetails(token).fail(function (err: Error)
            {
                that.$errorMsg = err.message;

            }).done(function ()
            {
                // Update the project object
                for (var i in token)
                    project.entry[i] = token[i];

            }).always(function ()
            {
                that.$loading = false;
                Compiler.digest(that._projectElm, that, false);
            });
        }

        /**
		* Given a form element, we look at if it has an error and based on the expression. If there is we set the error message
        * @param {EngineForm} The form to check.
        * @param {boolean} True if there is an error
		*/
        reportError(form: EngineForm): boolean
        {
            if (!form.$error)
                this.$errorMsg = "";
            else
            {
                var name = form.$errorInput;
                name = name.charAt(0).toUpperCase() + name.slice(1);

                switch (form.$errorExpression)
                {
                    case "alpha-numeric":
                        this.$errorMsg = `${name} must only contain alphanumeric characters`;
                        break;
                    case "email-plus":
                        this.$errorMsg = `${name} must only contain alphanumeric characters or a valid email`;
                        break;
                    case "non-empty":
                        this.$errorMsg = `${name} cannot be empty`;
                        break;
                    case "email":
                        this.$errorMsg = `${name} must be a valid email`;
                        break;
                    case "alpha-numeric-plus":
                        this.$errorMsg = `${name} must only contain alphanumeric characters and '-', '!', or '_'`;
                        break;
                    case "no-html":
                        this.$errorMsg = `${name} must not contain any html`;
                        break;
                    default:
                        this.$errorMsg = "";
                        break;
                }
            }

            if (this.$errorMsg == "")
                return false;
            else
                return true;
        }

        /**
		* Updates the user bio information
		* @param {string} bio The new bio data
		*/
        updateBio(bio:string)
        {
            var that = this,
                user = this.$user;
            this.$loading = true;
            this.$errorMsg = "";

            user.updateDetails(<Engine.IUserMeta>{ bio : bio }).fail(function (err: Error)
            {
                that.$errorMsg = err.message;

            }).always(function ()
            {
                that.$loading = false;
                Compiler.digest(that._userElm, that, false);
            });
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

            Compiler.digest(this._projectElm, this, false);
            Compiler.digest(this._buildElm, this, false);
            Compiler.digest(this._userElm, this, false);
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

			if ( target == this._saveBuild )
			{
				//Check for special chars
				var message : string = Utils.checkForSpecialChars( (<Label>this._notes.val).text, true );
				if ( message != null )
				{
					(<Label>this._notes.val).textfield.element.addClass( "red-border" );
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
				////Check if the values are valid
				////(<Label>this._name.val).textfield.element.removeClass( "red-border" );
				//this._warning.textfield.element.css( "color", "" );

				////Check for special chars
				//var number = parseInt( (<Label>this._buildVerMaj.val).text );
				//if ( isNaN( number ) )
				//{
				//	( <Label>this._buildVerMaj.val).textfield.element.addClass( "red-border" );
				//	this._warning.textfield.element.css( "color", "#FF0000" );
				//	this._warning.text = "Please only use numbers";
				//	return;
				//}

				//number = parseInt( (<Label>this._buildVerMid.val).text );
				//if ( isNaN( number ) )
				//{
				//	( <Label>this._buildVerMid.val).textfield.element.addClass( "red-border" );
				//	this._warning.textfield.element.css( "color", "#FF0000" );
				//	this._warning.text = "Please only use numbers";
				//	return;
				//}

    //            number = parseInt((<Label>this._buildVerMin.val).text );
				//if ( isNaN( number ) )
				//{
				//	( <Label>this._buildVerMin.val).textfield.element.addClass( "red-border" );
				//	this._warning.textfield.element.css( "color", "#FF0000" );
				//	this._warning.text = "Please only use numbers";
				//	return;
				//}


				var user : User = User.get;
				var project : Project = User.get.project;
				project.addEventListener( ProjectEvents.FAILED, this._buildProxy, this );
				project.addEventListener( ProjectEvents.BUILD_SELECTED, this._buildProxy, this );
				project.selectBuild( (<Label>this._buildVerMaj.val).text, (<Label>this._buildVerMid.val).text, (<Label>this._buildVerMin.val).text );
			}

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
				return;

            if (response == ProjectEvents.BUILD_SELECTED )
			{
				//Check if the values are valid
				(<Label>this._buildVerMaj.val).textfield.element.removeClass( "red-border" );
                (<Label>this._buildVerMid.val).textfield.element.removeClass( "red-border" );
                (<Label>this._buildVerMin.val).textfield.element.removeClass( "red-border" );
				(<Label>this._notes.val).textfield.element.removeClass( "red-border" );
                
				//Update fields
				this.updateFields( event.tag );
			}
            else if (response == ProjectEvents.BUILD_SAVED )
			{
				//Update fields
                this.updateFields( event.tag );
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
		* Shows the build options form
		* @returns {any} 
		*/
		show()
		{
			OkCancelForm.prototype.show.call( this );
            this._tab.selectTab( this._tab.getTab( "Project" ) );

			var user = User.get;
            var project = user.project;
            var e = project.entry;

			//Start the image uploader
            this.initializeLoader();
            this.$project = project;
            this.$projectToken = { name: e.name, description: e.description, tags: e.tags, category: e.category, public: e.public };

            Compiler.digest(this._projectElm, this, false);
            Compiler.digest(this._buildElm, this, false);
            Compiler.digest(this._userElm, this, false);
            
			this.update();
		}

		/**
		* This is called to initialize the one click loader
		*/
		initializeLoader()
        {
            var that = this;
            that.$loadingPercent = "";
            that.$errorMsgImg = "";

			if ( !this._uploader )
			{
				this._uploader = new qq.FileUploaderBasic( {
                    button: document.getElementById( "upload-projet-img" ),
					action: DB.HOST + "/file/upload-project-image",

                    onSubmit: function (file, ext )
                    {
                        ext = ext.split(".");
                        ext = ext[ext.length - 1];
                        ext.toLowerCase();

                        if (ext != "png" && ext != "jpeg" && ext != "jpg")
                        {
                            that.$errorMsgImg = 'Only png, jpg and jpeg files are allowed';
                            Compiler.digest(that._projectElm, that, false);
                            return false;
                        }
                    },
                    onComplete: function( id, fileName, response )
                    {
                        that.$project.entry.image = "";
                        that.$loadingPercent = "";
                        Compiler.digest(that._projectElm, that, false);
                    },
                    onProgress: function (id, fileName, loaded, total)
                    {
                        that.$loadingPercent = `${((loaded / total) * 100) }%`;
                        Compiler.digest(that._projectElm, that, false);
                    },
                    onError: function (id, fileName, reason)
                    {
                        that.$errorMsgImg = "An Error occurred uploading the file: " + reason;
                        Compiler.digest(that._projectElm, that, false);
                    },
					demoMode: false
				});

				this._uploader._options.allowedExtensions.push( "jpg", "png", "jpeg" );
			}

            this._uploader.setParams({ projectId: User.get.project.entry._id });
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