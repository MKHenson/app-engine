module Animate
{
	//export class UserEvents extends ENUM
	//{
		//constructor( v: string ) { super( v ); }
		//static LOGGED_IN: UserEvents = new UserEvents( "user_logged_in" );
		//static FAILED: UserEvents = new UserEvents( "user_failed" );
		//static REGISTERED: UserEvents = new UserEvents( "user_registered" );
		//static LOGGED_OUT: UserEvents = new UserEvents( "user_logged_out" );
		//static PASSWORD_RESET: UserEvents = new UserEvents( "user_password_reset" );
		//static ACTIVATION_RESET: UserEvents = new UserEvents( "user_activation_reset" );
		//static PROJECT_CREATED: UserEvents = new UserEvents( "user_project_created" );
		//static PROJECT_OPENED: UserEvents = new UserEvents( "user_project_opened" );
		//static PROJECTS_RECIEVED: UserEvents = new UserEvents( "user_projects_recieved" );
		//static PROJECT_DELETED: UserEvents = new UserEvents( "user_project_deleted" );
		//static PROJECT_COPIED: UserEvents = new UserEvents( "user_project_copied" );
		//static PROJECT_RENAMED: UserEvents = new UserEvents( "user_project_rename" );
		//static DETAILS_SAVED: UserEvents = new UserEvents( "user_details_saved" );
	//}







	/**
	* This class is used to represent the user who is logged into Animate.
	*/
    export class User extends EventDispatcher
	{
        private static _singleton = null;
        public entry: UsersInterface.IUserEntry;
        public meta: Engine.IUserMeta;
        public project: Project;
		private _isLoggedIn: boolean;

        constructor()
		{
            super();
            User._singleton = this;

			// Call super-class constructor
            EventDispatcher.call(this);

            // Create the default entry
            this.entry = { username : "" };
            this.resetMeta();

            this.project = new Project();
            this._isLoggedIn = false;

        }

        /**
		* Resets the meta data
		*/
        resetMeta()
        {
            this.meta = <Engine.IUserMeta>{
                bio: "",
                plan: UserPlan.Free,
                imgURL: "media/blank-user.png",
                maxNumProjects: 0
            };
        }

        /**
		* Checks if a user is logged in or not. This checks the server using
		* cookie and session data from the browser.
		* @returns {Promise<boolean>}
		*/
        authenticated(): Promise<boolean>
        {
            this._isLoggedIn = false;

            var that = this;
            return new Promise<boolean>(function (resolve, reject)
            {
                Utils.get<UsersInterface.IAuthenticationResponse>(`${DB.USERS}/authenticated`).then(function (data)
                {
                    if (data.error)
                        return reject(new Error(data.message));

                    if (data.authenticated)
                    {
                        that.entry = <UsersInterface.IUserEntry>data.user;
                        that._isLoggedIn = true;
                        return jQuery.getJSON(`${DB.API}/user-details/${data.user.username}`);
                    }
                    else
                    {
                        that._isLoggedIn = false;
                        that.resetMeta();
                        return resolve(false);
                    }

                }).then(function (data: ModepressAddons.IGetDetails)
                {
                    if (data.error)
                        return reject(new Error(data.message));

                    that.meta = data.data;
                    return resolve(true);

                }).catch(function (err: IAjaxError)
                {
                    return reject(new Error(`An error occurred while connecting to the server. ${err.status}: ${err.message}`));
                });
            });

        }

        /**
		* Tries to log the user in asynchronously.
		* @param {string} user The username of the user.
		* @param {string} password The password of the user.
		* @param {boolean} rememberMe Set this to true if we want to set a login cookie and keep us signed in.
        * @returns {Promise<UsersInterface.IAuthenticationResponse>}
		*/
        login(user: string, password: string, rememberMe: boolean): Promise<UsersInterface.IAuthenticationResponse>
        {
            var  token: UsersInterface.ILoginToken = {
                    username: user,
                    password: password,
                    rememberMe: rememberMe
                },
                response: UsersInterface.IAuthenticationResponse;

            var that = this;
            return new Promise<UsersInterface.IAuthenticationResponse>(function (resolve, reject)
            {
                Utils.post<UsersInterface.IAuthenticationResponse>(`${DB.USERS}/users/login`, token).then(function (data)
                {
                    response = data;
                    if (data.error)
                        return reject(new Error(data.message));

                    if (data.authenticated)
                    {
                        that._isLoggedIn = true;
                        that.entry = <UsersInterface.IUserEntry>data.user;
                        return jQuery.getJSON(`${DB.API}/user-details/${data.user.username}`);
                    }
                    else
                    {
                        that._isLoggedIn = false;
                        that.resetMeta();
                        return resolve(data);
                    }

                }).then(function (data: ModepressAddons.IGetDetails)
                {
                    if (data.error)
                        return reject(new Error(data.message));

                    that.meta = data.data;
                    return resolve(response);

                }).catch(function (err: IAjaxError)
                {
                    that._isLoggedIn = false;
                    return reject(new Error(`An error occurred while connecting to the server. ${err.status}: ${err.message}`));
                })
            });
        }

        /**
		* Tries to register a new user.
		* @param {string} user The username of the user.
		* @param {string} password The password of the user.
		* @param {string} email The email of the user.
		* @param {string} captcha The captcha of the login screen
		* @param {string} captha_challenge The captha_challenge of the login screen
        * @returns {Promise<UsersInterface.IAuthenticationResponse>}
		*/
        register(user: string, password: string, email: string, captcha: string, captha_challenge: string): Promise<UsersInterface.IAuthenticationResponse>
        {
            var that = this,
                token: UsersInterface.IRegisterToken = {
                    username: user,
                    password: password,
                    email: email,
                    captcha: captcha,
                    challenge: captha_challenge
                };


            return new Promise<UsersInterface.IAuthenticationResponse>(function (resolve, reject)
            {
                Utils.post<UsersInterface.IAuthenticationResponse>(`${DB.USERS}/users/register`, token).then(function (data)
                {
                    if (data.error)
                        return reject(new Error(data.message));

                    if (data.authenticated)
                    {
                        that._isLoggedIn = false;
                        that.entry = <UsersInterface.IUserEntry>data.user;
                    }
                    else
                        that._isLoggedIn = false;

                    return resolve(data);

                }).catch(function (err: IAjaxError)
                {
                    return reject(new Error(`An error occurred while connecting to the server. ${err.status}: ${err.message}`));
                });
            });
        }

        /**
		* This function is used to resend a user's activation code
		* @param {string} user
        * @returns {Promise<UsersInterface.IResponse>}
		*/
        resendActivation(user: string): Promise<UsersInterface.IResponse>
        {
            var that = this;

            return new Promise<UsersInterface.IResponse>(function (resolve, reject)
            {
                Utils.get<UsersInterface.IResponse>(`${DB.USERS}/users/${user}/resend-activation`).then(function (data)
                {
                    if (data.error)
                        return reject(new Error(data.message));

                    return resolve(data);

                }).catch(function (err: IAjaxError)
                {
                    return reject(new Error(`An error occurred while connecting to the server. ${err.status}: ${err.message}`));
                })
            });
        }

        /**
		* This function is used to reset a user's password.
		* @param {string} user
        * @returns {Promise<UsersInterface.IResponse>}
		*/
        resetPassword(user: string): Promise<UsersInterface.IResponse>
        {
            var  that = this;

            return new Promise<UsersInterface.IResponse>(function (resolve, reject)
            {
                Utils.get<UsersInterface.IResponse>(`${DB.USERS}/users/${user}/request-password-reset`).then(function (data)
                {
                    if (data.error)
                        return reject(new Error(data.message));

                    return resolve(data);

                }).catch(function (err: IAjaxError)
                {
                    return reject(new Error(`An error occurred while connecting to the server. ${err.status}: ${err.message}`));
                })
            });
        }

        /**
		* Attempts to log the user out
        * @return {Promise<UsersInterface.IResponse>}
		*/
        logout(): Promise<UsersInterface.IResponse>
        {
            var that = this;

            return new Promise<UsersInterface.IResponse>(function (resolve, reject)
            {
                Utils.get<UsersInterface.IResponse>(`${DB.USERS}/logout`).then(function (data)
                {
                    if (data.error)
                        return reject(new Error(data.message));

                    that.entry = { username: "" };
                    that.meta = <Engine.IUserMeta>{
                        bio: "",
                        plan: UserPlan.Free,
                        imgURL: "media/blank-user.png",
                        maxNumProjects: 0
                    };

                    that._isLoggedIn = false;
                    return resolve(data);

                }).catch(function (err: IAjaxError)
                {
                    return reject(new Error(`An error occurred while connecting to the server. ${err.status}: ${err.message}`));
                })
            });
        }

		/**
		* Fetches all the projects of a user. This only works if the user if logged in. If not
		* it will return null.
        * @param {number} index The index to  fetching projects for
        * @param {number} limit The limit of how many items to fetch
        * @return {Promise<ModepressAddons.IGetProjects>}
		*/
        getProjectList(index: number, limit: number): Promise<ModepressAddons.IGetProjects>
        {
            var that = this;

            return new Promise<ModepressAddons.IGetProjects>(function (resolve, reject)
            {
                Utils.get<ModepressAddons.IGetProjects>(`${DB.API}/users/${that.entry.username}/projects?verbose=true&index=${index}&limit=${limit}`).then(function (data)
                {
                    if (data.error)
                        return reject(new Error(data.message));

                    // Assign the actual plugins
                    for (var i = 0, l = data.data.length; i < l; i++)
                    {
                        var project = data.data[i];
                        var plugins: Array<Engine.IPlugin> = [];
                        for (var ii = 0, il = project.plugins.length; ii < il; ii++)
                            plugins.push(getPluginByID(project.plugins[ii]));

                        project.$plugins = plugins;
                    }

                    return resolve(data);

                }).catch(function (err: IAjaxError)
                {
                    return reject(new Error(`An error occurred while connecting to the server. ${err.status}: ${err.message}`));
                })
            });
        }

        /**
		* Creates a new user projects
        * @param {string} name The name of the project
        * @param {Array<string>} plugins An array of plugin IDs to identify which plugins to use
        * @param {string} description [Optional] A short description
        * @return {Promise<ModepressAddons.ICreateProject>}
		*/
        newProject(name: string, plugins: Array<string>, description: string = ""): Promise<ModepressAddons.ICreateProject>
        {
            var  that = this,
                token: Engine.IProject  = {
                    name: name,
                    description: description,
                    plugins: plugins
                };

            return new Promise<ModepressAddons.ICreateProject>(function (resolve, reject)
            {
                Utils.post<ModepressAddons.ICreateProject>(`${DB.API}/projects`, token).then(function (data)
                {
                    if (data.error)
                        return reject(new Error(data.message));

                    // Assign the actual plugins
                    var project = data.data;
                    var plugins: Array<Engine.IPlugin> = [];
                    for (var ii = 0, il = project.plugins.length; ii < il; ii++)
                        plugins.push(getPluginByID(project.plugins[ii]));

                    project.$plugins = plugins;

                    return resolve(data);

                }).catch(function (err: IAjaxError)
                {
                    reject(new Error(`An error occurred while connecting to the server. ${err.status}: ${err.message}`));
                })
            });
        }

        /**
		* Removes a project by its id
        * @param {string} pid The id of the project to remove
        * @return {Promise<Modepress.IResponse>}
		*/
        removeProject(pid: string): Promise<Modepress.IResponse>
        {
            var that = this;

            return new Promise<Modepress.IResponse>(function (resolve, reject)
            {
                Utils.delete<Modepress.IResponse>(`${DB.API}/users/${that.entry.username}/projects/${pid}`).then(function (data)
                {
                    if (data.error)
                        return reject(new Error(data.message));

                    return resolve(data);

                }).catch(function (err: IAjaxError)
                {
                    return reject(new Error(`An error occurred while connecting to the server. ${err.status}: ${err.message}`));
                });
            });

        }

        /**
		* Attempts to update the user's details base on the token provided
        * @returns {Engine.IUserMeta} The user details token
        * @returns {Promise<UsersInterface.IResponse>}
		*/
        updateDetails(token: Engine.IUserMeta): Promise<UsersInterface.IResponse>
        {
            var meta = this.meta;
            var that = this;

            return new Promise<Modepress.IResponse>(function (resolve, reject)
            {
                Utils.put(`${DB.API}/user-details/${that.entry.username}`, token).then(function (data: UsersInterface.IResponse)
                {
                    if (data.error)
                        return reject(new Error(data.message));
                    else
                    {
                        for (var i in token)
                            if (meta.hasOwnProperty(i))
                                meta[i] = token[i];
                    }

                    return resolve(data);

                }).catch(function (err: IAjaxError)
                {
                    return reject(new Error(`An error occurred while connecting to the server. ${err.status}: ${err.message}`));
                });
            });
        }























		///**
		//* Use this function to rename a project
		//* @param {number} id The project ID we are copying
		//* @param {string} name The new name of the project
		//* @param {string} description The new description of the project
		//* @param {Array<string>} tags The new tags of the project
		//* @param {string} category The new category of the project
		//* @param {string} subCat The new subCat of the project
		//* @param {string} visibility The new visibility of the project. Either public or private
		//*/
		//renameProject( id: string, name: string, description: string, tags: Array<string>, category: string, subCat: string, visibility: string )
		//{
		//	var loader = new AnimateLoader();
		//	loader.addEventListener( LoaderEvents.COMPLETE, this.onServer, this );
		//	loader.addEventListener( LoaderEvents.FAILED, this.onServer, this );
		//	loader.load( "/project/rename", {
		//		projectId: id,
		//		name: name,
		//		description: description,
		//		tags: tags,
		//		cat: category,
		//		subCat: subCat,
		//		visibility: visibility
		//	} );
		//}

		///**
		//* @type public mfunc updateDetails
		//* Use this function to update user details
		//* @param {string} bio The bio of the user
		//* @extends {User}
		//*/
		//updateDetails( bio )
		//{
		//	var loader = new AnimateLoader();
		//	loader.addEventListener( LoaderEvents.COMPLETE, this.onServer, this );
		//	loader.addEventListener( LoaderEvents.FAILED, this.onServer, this );
		//	loader.load( "/user/update-details", { bio: bio } );
		//}

		/**
		* @type public mfunc copyProject
		* Use this function to duplicate a project
		* @param {number} id The project ID we are copying
		* @extends {User}
		*/
		copyProject( id : string )
		{
			var loader = new AnimateLoader();
			loader.on( LoaderEvents.COMPLETE, this.onServer, this );
			loader.on( LoaderEvents.FAILED, this.onServer, this );
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
				loader.on( LoaderEvents.COMPLETE, this.onServer, this );
				loader.on( LoaderEvents.FAILED, this.onServer, this );
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
				loader.on( LoaderEvents.COMPLETE, this.onServer, this );
				loader.on( LoaderEvents.FAILED, this.onServer, this );
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
					//this.emit(new UserEvent(UserEvents.FAILED, event.message, event.return_type, event.data ) );
					return;
				}

                if (loader.url == "/user/log-in")
				{
                    //this.userEntry.meta.bio = data.bio;
                    //this.userEntry.meta.plan = data.plan;
                    //this.userEntry.meta.maxNumProjects = data.maxProjects;
                    //this.userEntry.meta.createdOn = data.createdOn;
                    //this.userEntry.meta.imgURL = data.image;

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
                    this.entry.username = "";
					this._isLoggedIn = false;
					//this.dispatchEvent( new UserEvent( UserEvents.LOGGED_OUT, event.message, event.return_type, data ) );
				}
				//else if ( loader.url == "/user/register" )
				//	this.dispatchEvent( new UserEvent( UserEvents.REGISTERED, event.message, event.return_type, data ) );
				//else if ( loader.url == "/user/reset-password" )
				//	this.dispatchEvent( new UserEvent( UserEvents.PASSWORD_RESET, event.message, event.return_type, data ) );
				//else if ( loader.url == "/user/resend-activation" )
				//	this.dispatchEvent( new UserEvent( UserEvents.ACTIVATION_RESET, event.message, event.return_type, data ) );
				//else if ( loader.url == "/user/update-details" )
				//	this.emit(new UserEvent(UserEvents.DETAILS_SAVED, event.message, event.return_type, data));
				//else if ( loader.url == "/project/get-user-projects" )
				//	this.dispatchEvent( new UserEvent( UserEvents.PROJECTS_RECIEVED, "", event.return_type, data ) );
				else if ( loader.url == "/project/create" )
				{
                    //this.project = new Project(data.project.entry._id, data.project.name, data.build );
					//this.emit( new ProjectEvent( UserEvents.PROJECT_CREATED, event.message, data ) );
				}
				//else if ( loader.url == "/project/open" )
				//{
                    //this.project = new Project(data.project.entry._id, data.project.name, null );
					//this.project.loadFromData( data );
					//this.emit( new ProjectEvent( UserEvents.PROJECT_OPENED, event.message, data ) );
				//}
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

					//this.dispatchEvent(new UserEvent(UserEvents.PROJECT_RENAMED, event.message, event.return_type, data));
				}
                else if (loader.url.match(/authenticated/) )
				{
					if ( data.loggedIn )
					{
                        this.entry.username = data.username;
                        this.entry.meta.bio = data.bio;
                        this.entry.meta.plan = data.plan;
                        this.entry.meta.maxNumProjects = data.maxProjects;
                        this.entry.meta.imgURL = ( data.image == "" || data.image == null ? "media/blank-user.png" : data.image );
                        this.entry.meta.createdOn = data.createdOn;
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

				//else
				//	this.emit(new UserEvent(UserEvents.FAILED, event.message, event.return_type, data));
			}
			//else
			//	this.emit(new UserEvent(UserEvents.FAILED, event.message, event.return_type, data));
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