module Animate
{
	export class UserEvents extends ENUM
	{
		constructor( v: string ) { super( v ); }
		//static LOGGED_IN: UserEvents = new UserEvents( "user_logged_in" );
		static FAILED: UserEvents = new UserEvents( "user_failed" );
		//static REGISTERED: UserEvents = new UserEvents( "user_registered" );
		//static LOGGED_OUT: UserEvents = new UserEvents( "user_logged_out" );
		//static PASSWORD_RESET: UserEvents = new UserEvents( "user_password_reset" );
		//static ACTIVATION_RESET: UserEvents = new UserEvents( "user_activation_reset" );
		static PROJECT_CREATED: UserEvents = new UserEvents( "user_project_created" );
		static PROJECT_OPENED: UserEvents = new UserEvents( "user_project_opened" );
		//static PROJECTS_RECIEVED: UserEvents = new UserEvents( "user_projects_recieved" );
		//static PROJECT_DELETED: UserEvents = new UserEvents( "user_project_deleted" );
		//static PROJECT_COPIED: UserEvents = new UserEvents( "user_project_copied" );
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
    export class User extends EventDispatcher
	{
        private static _singleton = null;
        public userEntry: UsersInterface.IEngineUser;
        public project: Project;
		private _isLoggedIn: boolean;
        
        constructor()
		{
            super();
            User._singleton = this;

			// Call super-class constructor
            EventDispatcher.call(this);

            // Create the default entry
            this.userEntry = this.createEmptyUer();
            this.project = new Project();
            this._isLoggedIn = false;
            
        }

        /**
		* Creates an empty user with default values
		* @returns {IEngineUser}
		*/
        private createEmptyUer(): UsersInterface.IEngineUser
        {
            return {
                username: "",
                meta: {
                    bio: "",
                    createdOn: 0,
                    plan: UserPlan.Free,
                    imgURL: "media/blank-user.png",
                    maxNumProjects: 0
                }
            };
        }
                
        /**
		* Checks if a user is logged in or not. This checks the server using 
		* cookie and session data from the browser.
		* @returns {JQueryPromise<boolean>}
		*/
        authenticated(): JQueryPromise<boolean>
        {
            var d = jQuery.Deferred<boolean>();
            var that = this;
            that._isLoggedIn = false;

            jQuery.getJSON(`${DB.USERS}/users/authenticated`).done(function (data: UsersInterface.IAuthenticationResponse)
            {
                if (data.error)
                    return d.reject(new Error(data.message));

                if (data.authenticated)
                {
                    that.userEntry = <UsersInterface.IEngineUser>data.user;
                    that._isLoggedIn = true;
                }
                else
                    that._isLoggedIn = false;

                return d.resolve(data.authenticated);

            }).fail(function (err: JQueryXHR)
            {
                d.reject(new Error(`An error occurred while connecting to the server. ${err.status}: ${err.responseText}`));
            })

            return d.promise(); 
        }

        /**
		* Tries to log the user in asynchronously. 
		* @param {string} user The username of the user.
		* @param {string} password The password of the user.
		* @param {boolean} rememberMe Set this to true if we want to set a login cookie and keep us signed in.
        * @returns {JQueryPromise<UsersInterface.IAuthenticationResponse>}
		*/
        login(user: string, password: string, rememberMe: boolean): JQueryPromise<UsersInterface.IAuthenticationResponse>
        {
            var d = jQuery.Deferred<UsersInterface.IAuthenticationResponse>(),
                that = this,
                token: UsersInterface.ILoginToken = {
                    username: user,
                    password: password,
                    rememberMe: rememberMe
                };

            jQuery.post(`${DB.USERS}/users/login`, token).done(function (data: UsersInterface.IAuthenticationResponse)
            {
                if (data.error)
                    return d.reject(new Error(data.message));

                if (data.authenticated)
                {
                    that._isLoggedIn = true;
                    that.userEntry = <UsersInterface.IEngineUser>data.user;
                }
                else
                    that._isLoggedIn = false;

                return d.resolve(data);

            }).fail(function (err: JQueryXHR)
            {
                d.reject(new Error(`An error occurred while connecting to the server. ${err.status}: ${err.responseText}`));
            })

            return d.promise();
        }

        /**
		* Tries to register a new user. 
		* @param {string} user The username of the user.
		* @param {string} password The password of the user.
		* @param {string} email The email of the user.
		* @param {string} captcha The captcha of the login screen
		* @param {string} captha_challenge The captha_challenge of the login screen
        * @returns {JQueryPromise<UsersInterface.IAuthenticationResponse>}
		*/
        register(user: string, password: string, email: string, captcha: string, captha_challenge: string): JQueryPromise<UsersInterface.IAuthenticationResponse>
        {
            var d = jQuery.Deferred<UsersInterface.IAuthenticationResponse>(),
                that = this,
                token: UsersInterface.IRegisterToken = {
                    username: user,
                    password: password,
                    email: email,
                    captcha: captcha,
                    challenge: captha_challenge
                };

            jQuery.post(`${DB.USERS}/users/register`, token).done(function (data: UsersInterface.IAuthenticationResponse)
            {
                if (data.error)
                    return d.reject(new Error(data.message));

                if (data.authenticated)
                {
                    that._isLoggedIn = false;
                    that.userEntry = <UsersInterface.IEngineUser>data.user;
                }
                else
                    that._isLoggedIn = false;

                return d.resolve(data);

            }).fail(function (err: JQueryXHR)
            {
                d.reject(new Error(`An error occurred while connecting to the server. ${err.status}: ${err.responseText}`));
            })

            return d.promise();
        }

        /**
		* This function is used to resend a user's activation code
		* @param {string} user 
        * @returns {JQueryPromise<UsersInterface.IResponse>}
		*/
        resendActivation(user: string): JQueryPromise<UsersInterface.IResponse>
        {
            var d = jQuery.Deferred<UsersInterface.IResponse>(),
                that = this;
            
            jQuery.getJSON(`${DB.USERS}/users/resend-activation/${user}`).done(function (data: UsersInterface.IResponse)
            {
                if (data.error)
                    return d.reject(new Error(data.message));
                
                return d.resolve(data);

            }).fail(function (err: JQueryXHR)
            {
                d.reject(new Error(`An error occurred while connecting to the server. ${err.status}: ${err.responseText}`));
            })

            return d.promise();
        }

        /**
		* This function is used to reset a user's password.
		* @param {string} user 
        * @returns {JQueryPromise<UsersInterface.IResponse>}
		*/
        resetPassword(user: string): JQueryPromise<UsersInterface.IResponse>
        {
            var d = jQuery.Deferred<UsersInterface.IResponse>(),
                that = this;

            jQuery.getJSON(`${DB.USERS}/users/request-password-reset/${user}`).done(function (data: UsersInterface.IResponse)
            {
                if (data.error)
                    return d.reject(new Error(data.message));

                return d.resolve(data);

            }).fail(function (err: JQueryXHR)
            {
                d.reject(new Error(`An error occurred while connecting to the server. ${err.status}: ${err.responseText}`));
            })

            return d.promise();
        }

        /**
		* Attempts to log the user out
        * @return {JQueryPromise<UsersInterface.IResponse>}
		*/
        logout(): JQueryPromise<UsersInterface.IResponse>
        {
            var d = jQuery.Deferred<UsersInterface.IResponse>(),
                that = this;

            jQuery.getJSON(`${DB.USERS}/users/logout`).done(function (data: UsersInterface.IResponse)
            {
                if (data.error)
                    return d.reject(new Error(data.message));

                that.userEntry = that.createEmptyUer();
                that._isLoggedIn = false;
                return d.resolve(data);

            }).fail(function (err: JQueryXHR)
            {
                d.reject(new Error(`An error occurred while connecting to the server. ${err.status}: ${err.responseText}`));
            })

            return d.promise();
        }

		/**
		* Fetches all the projects of a user. This only works if the user if logged in. If not
		* it will return null.
        * @param {number} index The index to  fetching projects for
        * @param {number} limit The limit of how many items to fetch
        * @return {JQueryPromise<ModepressAddons.IGetProjects>}
		*/
        getProjectList(index: number, limit: number): JQueryPromise<ModepressAddons.IGetProjects>
        {
            var d = jQuery.Deferred<ModepressAddons.IGetProjects>(),
                that = this;

            jQuery.getJSON(`${DB.API}/projects/${this.userEntry.username}?verbose=true&index=${index}&limit=${limit}`).done(function (data: ModepressAddons.IGetProjects)
            {
                if (data.error)
                    return d.reject(new Error(data.message));

                // Assign the actual plugins
                for (var i = 0, l = data.data.length; i < l; i++)
                {
                    var project = data.data[i];
                    var plugins: Array<Engine.IPlugin> = [];
                    for (var ii = 0, il = project.plugins.length; ii < il; ii++)
                        plugins.push(getPluginByID(project.plugins[ii]));

                    project.$plugins = plugins;
                }

                return d.resolve(data);

            }).fail(function (err: JQueryXHR)
            {
                d.reject(new Error(`An error occurred while connecting to the server. ${err.status}: ${err.responseText}`));
            })

            return d.promise();
        }

        /**
		* Creates a new user projects
        * @param {string} name The name of the project
        * @param {Array<string>} plugins An array of plugin IDs to identify which plugins to use
        * @param {string} description [Optional] A short description
        * @return {JQueryPromise<ModepressAddons.ICreateProject>}
		*/
        newProject(name: string, plugins: Array<string>, description: string = ""): JQueryPromise<ModepressAddons.ICreateProject>
        {
            var d = jQuery.Deferred<ModepressAddons.ICreateProject>(),
                that = this,
                token: Engine.IProject  = {
                    name: name,
                    description: description,
                    plugins: plugins
                };

            jQuery.post(`${DB.API}/projects/create`, token).done(function (data: ModepressAddons.ICreateProject)
            {
                if (data.error)
                    return d.reject(new Error(data.message));

                // Assign the actual plugins
                var project = data.data;
                var plugins: Array<Engine.IPlugin> = [];
                for (var ii = 0, il = project.plugins.length; ii < il; ii++)
                    plugins.push(getPluginByID(project.plugins[ii]));

                project.$plugins = plugins;
                
                return d.resolve(data);

            }).fail(function (err: JQueryXHR)
            {
                d.reject(new Error(`An error occurred while connecting to the server. ${err.status}: ${err.responseText}`));
            })

            return d.promise();
        }

        /**
		* Removes a project by its id
        * @param {string} pid The id of the project to remove
        * @return {JQueryPromise<Modepress.IResponse>}
		*/
        removeProject(pid: string): JQueryPromise<Modepress.IResponse>
        {
            var d = jQuery.Deferred<Modepress.IResponse>(),
                that = this;

            jQuery.ajax({ url: `${DB.API}/projects/${that.userEntry.username}/${pid}`, type: 'DELETE', dataType: "json" }).done(function (data: Modepress.IResponse)
            {
                if (data.error)
                    return d.reject(new Error(data.message));

                return d.resolve(data);

            }).fail(function (err: JQueryXHR)
            {
                d.reject(new Error(`An error occurred while connecting to the server. ${err.status}: ${err.responseText}`));
            });

            return d.promise();
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


		///**
		//* This function is used to create a new project.
		//*/
		//createProject( name : string, description : string )
		//{
		//	if ( this._isLoggedIn )
		//	{
		//		var loader = new AnimateLoader();
		//		loader.addEventListener( LoaderEvents.COMPLETE, this.onServer, this );
		//		loader.addEventListener( LoaderEvents.FAILED, this.onServer, this );
		//		loader.load( "/project/create", { name: name, description: description } );
		//	}
		//}


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
				//if ( this.project != null )
				//{
				//	this.project.dispose();
				//	this.project = null;
				//}

                this.project.entry = null;

				var loader = new AnimateLoader();
				loader.addEventListener( LoaderEvents.COMPLETE, this.onServer, this );
				loader.addEventListener( LoaderEvents.FAILED, this.onServer, this );
				loader.load( "/project/delete", { id: id } );
			}
			else
				return null;
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
                    this.userEntry.meta.bio = data.bio;
                    this.userEntry.meta.plan = data.plan;
                    this.userEntry.meta.maxNumProjects = data.maxProjects;
                    this.userEntry.meta.createdOn = data.createdOn;
                    this.userEntry.meta.imgURL = data.image;

					//this.planLevel = 0;
					//if ( data.plan == DB.PLAN_SILVER || data.plan == DB.PLAN_BRONZE )
					//	this.planLevel = 1;
					//else if ( data.plan == DB.PLAN_GOLD )
					//	this.planLevel = 2;
					//else
					//	this.planLevel = 3;

					this._isLoggedIn = true;

					//this.dispatchEvent(new UserEvent(UserEvents.LOGGED_IN, event.message, event.return_type, data));
				}
				else if ( loader.url == "/user/log-out" )
				{
                    this.userEntry.username = "";
					this._isLoggedIn = false;
					//this.dispatchEvent( new UserEvent( UserEvents.LOGGED_OUT, event.message, event.return_type, data ) );
				}
				//else if ( loader.url == "/user/register" )
				//	this.dispatchEvent( new UserEvent( UserEvents.REGISTERED, event.message, event.return_type, data ) );
				//else if ( loader.url == "/user/reset-password" )
				//	this.dispatchEvent( new UserEvent( UserEvents.PASSWORD_RESET, event.message, event.return_type, data ) );
				//else if ( loader.url == "/user/resend-activation" )
				//	this.dispatchEvent( new UserEvent( UserEvents.ACTIVATION_RESET, event.message, event.return_type, data ) );
				else if ( loader.url == "/user/update-details" )
					this.dispatchEvent(new UserEvent(UserEvents.DETAILS_SAVED, event.message, event.return_type, data));
				//else if ( loader.url == "/project/get-user-projects" )
				//	this.dispatchEvent( new UserEvent( UserEvents.PROJECTS_RECIEVED, "", event.return_type, data ) );
				else if ( loader.url == "/project/create" )
				{
                    //this.project = new Project(data.project.entry._id, data.project.name, data.build );
					this.dispatchEvent( new ProjectEvent( UserEvents.PROJECT_CREATED, event.message, data ) );
				}
				else if ( loader.url == "/project/open" )
				{
                    //this.project = new Project(data.project.entry._id, data.project.name, null );
					this.project.loadFromData( data );
					this.dispatchEvent( new ProjectEvent( UserEvents.PROJECT_OPENED, event.message, data ) );
				}
				//else if ( loader.url == "/project/delete" )
				//	this.dispatchEvent( new UserEvent( UserEvents.PROJECT_DELETED, event.message, event.return_type, data ) );
				//else if ( loader.url == "/project/copy" )
				//	this.dispatchEvent(new UserEvent(UserEvents.PROJECT_COPIED, event.message, event.return_type, data));
				else if ( loader.url == "/project/rename" )
				{
					//this.project.mName = data.name;
					//this.project.mDescription = data.description;
					//this.project.mTags = data.tags;
					//this.project.mRating = data.rating;
					//this.project.mCategory = data.category;
					//this.project.mImgPath = data.image;
					//this.project.mVisibility = data.visibility;
					//this.project.mSubCategory = data.sub_category;

					this.dispatchEvent(new UserEvent(UserEvents.PROJECT_RENAMED, event.message, event.return_type, data));
				}				
                else if (loader.url.match(/authenticated/) )
				{
					if ( data.loggedIn )
					{
                        this.userEntry.username = data.username;
                        this.userEntry.meta.bio = data.bio;
                        this.userEntry.meta.plan = data.plan;
                        this.userEntry.meta.maxNumProjects = data.maxProjects;
                        this.userEntry.meta.imgURL = ( data.image == "" || data.image == null ? "media/blank-user.png" : data.image );
                        this.userEntry.meta.createdOn = data.createdOn;
						this._isLoggedIn = true;

						//this.planLevel = 0;
						//if ( data.plan == DB.PLAN_SILVER || data.plan == DB.PLAN_BRONZE )
						//	this.planLevel = 1;
						//else if ( data.plan == DB.PLAN_GOLD )
						//	this.planLevel = 2;
						//else
						//	this.planLevel = 3;
					}

					//this.dispatchEvent( new UserEvent( UserEvents.LOGGED_IN, event.message, event.return_type, data.loggedIn ) );
				}				
								
				else
					this.dispatchEvent(new UserEvent(UserEvents.FAILED, event.message, event.return_type, data));
			}
			else
				this.dispatchEvent(new UserEvent(UserEvents.FAILED, event.message, event.return_type, data));
		}

		//get project(): Project { return this._project; }
		//set project( val: Project ) { this._project = val; }

		get isLoggedIn(): boolean { return this._isLoggedIn; }

		/**
		* Gets the singleton instance.
		* @returns {User}
		*/
		static get get() : User
        {
            if (!User._singleton)
                new User();

			return User._singleton;
		}
    }
}