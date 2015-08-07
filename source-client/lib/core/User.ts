module Animate
{
	export class UserPlanType extends ENUM
	{
		constructor( v: string ) { super( v ); }
		static PLAN_FREE: UserPlanType = new UserPlanType( "animate-free" );
		static PLAN_BRONZE: UserPlanType = new UserPlanType( "animate-bronze" );
		static PLAN_SILVER: UserPlanType = new UserPlanType( "animate-silver" );
		static PLAN_GOLD: UserPlanType = new UserPlanType( "animate-gold" );
		static PLAN_PLATINUM: UserPlanType = new UserPlanType( "animate-platinum" );
	}

	export class UserEvents extends ENUM
	{
		constructor( v: string ) { super( v ); }
		static LOGGED_IN: UserEvents = new UserEvents( "user_logged_in" );
		static FAILED: UserEvents = new UserEvents( "user_failed" );
		static REGISTERED: UserEvents = new UserEvents( "user_registered" );
		static LOGGED_OUT: UserEvents = new UserEvents( "user_logged_out" );
		static PASSWORD_RESET: UserEvents = new UserEvents( "user_password_reset" );
		static ACTIVATION_RESET: UserEvents = new UserEvents( "user_activation_reset" );
		static PROJECT_CREATED: UserEvents = new UserEvents( "user_project_created" );
		static PROJECT_OPENED: UserEvents = new UserEvents( "user_project_opened" );
		static PROJECTS_RECIEVED: UserEvents = new UserEvents( "user_projects_recieved" );
		static PROJECT_DELETED: UserEvents = new UserEvents( "user_project_deleted" );
		static PROJECT_COPIED: UserEvents = new UserEvents( "user_project_copied" );
		static PROJECT_RENAMED: UserEvents = new UserEvents( "user_project_rename" );
		static DETAILS_SAVED: UserEvents = new UserEvents( "user_details_saved" );
	}

	export class UserEvent extends AnimateLoaderEvent
	{
		constructor(eventName: UserEvents, message: string, return_type: LoaderEvents, data: any)
		{
			super(eventName, message, return_type, data);
		}
	}

    
	/**
	* This class is used to represent the user who is logged into Animate.
	*/
    export class User extends EventDispatcher implements ng.IServiceProvider 
	{
		private static _singleton = null;

		public username: string;
		public bio: string;
		public createdOn: string;		
		public plan: UserPlanType;
		public maxNumProjects: number;
		public planLevel: number;
		public imgURL: string;

		private _project: Project;
		private _isLoggedIn: boolean;

        private _http: angular.IHttpService;
        private _url: string;
        private _q: ng.IQService;

        public static $inject = [ "$http", "$usersUrl", "$q" ];
        constructor($httpProvider: angular.IHttpService, $usersUrl: string, $q: ng.IQService)
		{
            super();

            this._http = $httpProvider;
            this._url = $usersUrl;
            this._q = $q;
            User._singleton = this;

			// Call super-class constructor
			EventDispatcher.call( this );

			this.username = "";
			this.bio = "";
			this.createdOn = "";
			//this.mRequest = "";
			this.plan = UserPlanType.PLAN_FREE;
			this._isLoggedIn = false;
			this.imgURL = "media/blank-user.png";
			this._project = null;
			this.planLevel = -1;
			this.maxNumProjects = 0;
        }


        public $get(): User
        {
            return this;
        }
        

		/**
		* Checks if a user is logged in or not. This checks the animate server using 
		* cookie and session data from the browser. The call is made synchronously.
		* @extends {User} 
		*/
        updatedLoggedIn()
        {
			this._isLoggedIn = false;
			var loader = new AnimateLoader();
			loader.addEventListener( LoaderEvents.COMPLETE, this.onServer, this );
            loader.addEventListener(LoaderEvents.FAILED, this.onServer, this);
            loader.load(`${DB.USERS}/users/authenticated`, {}, 3, "GET");
        }

        /**
		* Queries the server to see if the user is currently logged in or not
		* @extends {User} 
		*/
        authenticated(): ng.IPromise<boolean>
        {
            var that = this;
            return new this._q(function (resolve, reject)
            {
                that._http.get<UsersInterface.IAuthenticationResponse>(this._url).then(function (response)
                {
                    if (response.data.error)
                        return reject(new Error(response.data.message));
                    else
                        return resolve(response.data.authenticated);
                });
            });
        }


		/**
		* Fetches all the projects of a user. This only works if the user if logged in. If not
		* it will return null.
		*/
		downloadProjects()
		{
			if ( this._isLoggedIn )
			{
				var loader = new AnimateLoader();
				loader.addEventListener( LoaderEvents.COMPLETE, this.onServer, this );
				loader.addEventListener( LoaderEvents.FAILED, this.onServer, this );
				loader.load( "/project/get-user-projects", {} );
			}
			else
				return null;
		}

		/**
		* Use this function to rename a project
		* @param {number} id The project ID we are copying
		* @param {string} name The new name of the project
		* @param {string} description The new description of the project
		* @param {Array<string>} tags The new tags of the project
		* @param {string} category The new category of the project
		* @param {string} subCat The new subCat of the project
		* @param {string} visibility The new visibility of the project. Either public or private
		*/
		renameProject( id: string, name: string, description: string, tags: Array<string>, category: string, subCat: string, visibility: string )
		{
			var loader = new AnimateLoader();
			loader.addEventListener( LoaderEvents.COMPLETE, this.onServer, this );
			loader.addEventListener( LoaderEvents.FAILED, this.onServer, this );
			loader.load( "/project/rename", {
				projectId: id,
				name: name,
				description: description,
				tags: tags,
				cat: category,
				subCat: subCat,
				visibility: visibility
			} );
		}

		/**
		* @type public mfunc updateDetails
		* Use this function to update user details
		* @param {string} bio The bio of the user
		* @extends {User} 
		*/
		updateDetails( bio )
		{
			var loader = new AnimateLoader();
			loader.addEventListener( LoaderEvents.COMPLETE, this.onServer, this );
			loader.addEventListener( LoaderEvents.FAILED, this.onServer, this );
			loader.load( "/user/update-details", { bio: bio } );
		}

		/**
		* @type public mfunc copyProject
		* Use this function to duplicate a project
		* @param {number} id The project ID we are copying
		* @extends {User} 
		*/
		copyProject( id : string )
		{
			var loader = new AnimateLoader();
			loader.addEventListener( LoaderEvents.COMPLETE, this.onServer, this );
			loader.addEventListener( LoaderEvents.FAILED, this.onServer, this );
			loader.load( "/project/copy", { id: id });
		}


		/**
		* This function is used to create a new project.
		*/
		createProject( name : string, description : string )
		{
			if ( this._isLoggedIn )
			{
				var loader = new AnimateLoader();
				loader.addEventListener( LoaderEvents.COMPLETE, this.onServer, this );
				loader.addEventListener( LoaderEvents.FAILED, this.onServer, this );
				loader.load( "/project/create", { name: name, description: description } );
			}
		}


		/**
		* This function is used to open an existing project.
		*/
		openProject( id: string )
		{
			if ( this._isLoggedIn )
			{
				var loader = new AnimateLoader();
				loader.addEventListener( LoaderEvents.COMPLETE, this.onServer, this );
				loader.addEventListener( LoaderEvents.FAILED, this.onServer, this );
				loader.load( "/project/open", { id: id } );
			}
		}


		/**
		* This will delete a project from the database as well as remove it from the user.
		* @param {string} id The id of the project we are removing.
		*/
		deleteProject( id : string )
		{
			if ( this._isLoggedIn )
			{
				if ( this.project != null )
				{
					this.project.dispose();
					this.project = null;
				}

				var loader = new AnimateLoader();
				loader.addEventListener( LoaderEvents.COMPLETE, this.onServer, this );
				loader.addEventListener( LoaderEvents.FAILED, this.onServer, this );
				loader.load( "/project/delete", { id: id } );
			}
			else
				return null;
		}

		/**
		* This function is used to log a user out. 
		*/
		logout()
		{
			var loader = new AnimateLoader();
			loader.addEventListener( LoaderEvents.COMPLETE, this.onServer, this );
			loader.addEventListener( LoaderEvents.FAILED, this.onServer, this );
			loader.load( "/user/log-out", {} );
		}

		/**
		* This function is used to reset a user's password.
		* @param {string} user 
		*/
		resetPassword( user :string  )
		{
			var loader = new AnimateLoader();
			loader.addEventListener( LoaderEvents.COMPLETE, this.onServer, this );
			loader.addEventListener( LoaderEvents.FAILED, this.onServer, this );
			loader.load( "/user/reset-password", { user: user } );
		}

		/**
		* This function is used to resend a user's activation code
		* @param {string} user 
		*/
		resendActivation( user: string )
		{
			var loader = new AnimateLoader();
			loader.addEventListener( LoaderEvents.COMPLETE, this.onServer, this );
			loader.addEventListener( LoaderEvents.FAILED, this.onServer, this );
			loader.load( "/user/resend-activation", { user: user } );
		}

		/**
		* Tries to log the user in asynchronously. Disptaches the UserEvents.LOGGED_IN when complete
		* @param {string} user The username of the user.
		* @param {string} password The password of the user.
		* @param {boolean} rememberMe Set this to true if we want to set a login cookie and keep us signed in.
		*/
		login( user: string, password: string, rememberMe: boolean )
		{
			if ( this._isLoggedIn )
			{
				this.dispatchEvent( new UserEvent( UserEvents.LOGGED_IN, "You are already logged in.", LoaderEvents.COMPLETE, null ) );
				return;
			}

			this.username = user;
			var loader = new AnimateLoader();
			loader.addEventListener( LoaderEvents.COMPLETE, this.onServer, this );
			loader.addEventListener( LoaderEvents.FAILED, this.onServer, this );
			loader.load( "/user/log-in",
				{
					user: user,
					password: password,
					rememberMe: rememberMe
				} );
		}

		/**
		* Tries to register a new user. 
		* @param {string} user The username of the user.
		* @param {string} password The password of the user.
		* @param {string} email The email of the user.
		* @param {string} captcha The captcha of the login screen
		* @param {string} captha_challenge The captha_challenge of the login screen
		*/
		register( user: string, password: string, email: string, captcha: string, captha_challenge: string )
		{
			if ( this._isLoggedIn )
			{
				this.dispatchEvent(new UserEvent(UserEvents.FAILED, "You are already logged in.", LoaderEvents.COMPLETE, null ));
				return;
			}

			this.username = user;

			var loader = new AnimateLoader();
			loader.addEventListener( LoaderEvents.COMPLETE, this.onServer, this );
			loader.addEventListener( LoaderEvents.FAILED, this.onServer, this );
			loader.load( "/user/register",
				{
					user: user,
					password: password,
					email: email,
					captcha: captcha,
					captha_challenge: captha_challenge
				} );
		}

		/**
		* This is the resonse from the server
		* @param {LoaderEvents} response The response from the server. The response will be either Loader.COMPLETE or Loader.FAILED
		* @param {Event} data The data sent from the server.
		*/
		onServer( response: LoaderEvents, event: AnimateLoaderEvent, sender? : EventDispatcher )
		{
			var data = event.tag;

			var loader: AnimateLoader = <AnimateLoader>sender;

			if ( response == LoaderEvents.COMPLETE )
			{
				if ( event.return_type == AnimateLoaderResponses.ERROR )
				{
					//MessageBox.show(event.message, Array<string>("Ok"), null, null );
					this.dispatchEvent(new UserEvent(UserEvents.FAILED, event.message, event.return_type, event.data ) );
					return;
				}

                if (loader.url == "/user/log-in")
				{
					this.bio = data.bio;
					this.plan = data.plan;
					this.maxNumProjects = data.maxProjects;
					this.createdOn = data.createdOn;
					this.imgURL = data.image;

					this.planLevel = 0;
					if ( data.plan == DB.PLAN_SILVER || data.plan == DB.PLAN_BRONZE )
						this.planLevel = 1;
					else if ( data.plan == DB.PLAN_GOLD )
						this.planLevel = 2;
					else
						this.planLevel = 3;

					this._isLoggedIn = true;

					this.dispatchEvent(new UserEvent(UserEvents.LOGGED_IN, event.message, event.return_type, data));
				}
				else if ( loader.url == "/user/log-out" )
				{
					this.username = "";
					this._isLoggedIn = false;
					this.dispatchEvent( new UserEvent( UserEvents.LOGGED_OUT, event.message, event.return_type, data ) );
				}
				else if ( loader.url == "/user/register" )
					this.dispatchEvent( new UserEvent( UserEvents.REGISTERED, event.message, event.return_type, data ) );
				else if ( loader.url == "/user/reset-password" )
					this.dispatchEvent( new UserEvent( UserEvents.PASSWORD_RESET, event.message, event.return_type, data ) );
				else if ( loader.url == "/user/resend-activation" )
					this.dispatchEvent( new UserEvent( UserEvents.ACTIVATION_RESET, event.message, event.return_type, data ) );
				else if ( loader.url == "/user/update-details" )
					this.dispatchEvent(new UserEvent(UserEvents.DETAILS_SAVED, event.message, event.return_type, data));
				else if ( loader.url == "/project/get-user-projects" )
					this.dispatchEvent( new UserEvent( UserEvents.PROJECTS_RECIEVED, "", event.return_type, data ) );
				else if ( loader.url == "/project/create" )
				{
					this.project = new Project( data.project._id, data.project.name, data.build );
					this.dispatchEvent( new ProjectEvent( UserEvents.PROJECT_CREATED, event.message, data ) );
				}
				else if ( loader.url == "/project/open" )
				{
					this.project = new Project( data.project._id, data.project.name, null );
					this.project.loadFromData( data );
					this.dispatchEvent( new ProjectEvent( UserEvents.PROJECT_OPENED, event.message, data ) );
				}
				else if ( loader.url == "/project/delete" )
					this.dispatchEvent( new UserEvent( UserEvents.PROJECT_DELETED, event.message, event.return_type, data ) );
				else if ( loader.url == "/project/copy" )
					this.dispatchEvent(new UserEvent(UserEvents.PROJECT_COPIED, event.message, event.return_type, data));
				else if ( loader.url == "/project/rename" )
				{
					this.project.mName = data.name;
					this.project.mDescription = data.description;
					this.project.mTags = data.tags;
					this.project.mRating = data.rating;
					this.project.mCategory = data.category;
					this.project.mImgPath = data.image;
					this.project.mVisibility = data.visibility;
					this.project.mSubCategory = data.sub_category;

					this.dispatchEvent(new UserEvent(UserEvents.PROJECT_RENAMED, event.message, event.return_type, data));
				}				
                else if (loader.url.match(/authenticated/) )
				{
					if ( data.loggedIn )
					{
						this.username = data.username;
						this.bio = data.bio;
						this.plan = data.plan;
						this.maxNumProjects = data.maxProjects;
						this.imgURL = ( data.image == "" || data.image == null ? "media/blank-user.png" : data.image );
						this.createdOn = data.createdOn;
						this._isLoggedIn = true;

						this.planLevel = 0;
						if ( data.plan == DB.PLAN_SILVER || data.plan == DB.PLAN_BRONZE )
							this.planLevel = 1;
						else if ( data.plan == DB.PLAN_GOLD )
							this.planLevel = 2;
						else
							this.planLevel = 3;
					}

					this.dispatchEvent( new UserEvent( UserEvents.LOGGED_IN, event.message, event.return_type, data.loggedIn ) );
				}				
								
				else
					this.dispatchEvent(new UserEvent(UserEvents.FAILED, event.message, event.return_type, data));
			}
			else
				this.dispatchEvent(new UserEvent(UserEvents.FAILED, event.message, event.return_type, data));
		}

		get project(): Project { return this._project; }
		set project( val: Project ) { this._project = val; }

		get isLoggedIn(): boolean { return this._isLoggedIn; }

		/**
		* Gets the singleton instance.
		* @returns {User}
		*/
		static getSingleton() : User
		{
			return User._singleton;
		}
    }
}