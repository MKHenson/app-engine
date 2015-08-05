var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Animate;
(function (Animate) {
    var UserPlanType = (function (_super) {
        __extends(UserPlanType, _super);
        function UserPlanType(v) {
            _super.call(this, v);
        }
        UserPlanType.PLAN_FREE = new UserPlanType("animate-free");
        UserPlanType.PLAN_BRONZE = new UserPlanType("animate-bronze");
        UserPlanType.PLAN_SILVER = new UserPlanType("animate-silver");
        UserPlanType.PLAN_GOLD = new UserPlanType("animate-gold");
        UserPlanType.PLAN_PLATINUM = new UserPlanType("animate-platinum");
        return UserPlanType;
    })(Animate.ENUM);
    Animate.UserPlanType = UserPlanType;

    var UserEvents = (function (_super) {
        __extends(UserEvents, _super);
        function UserEvents(v) {
            _super.call(this, v);
        }
        UserEvents.LOGGED_IN = new UserEvents("user_logged_in");
        UserEvents.FAILED = new UserEvents("user_failed");
        UserEvents.REGISTERED = new UserEvents("user_registered");
        UserEvents.LOGGED_OUT = new UserEvents("user_logged_out");
        UserEvents.PASSWORD_RESET = new UserEvents("user_password_reset");
        UserEvents.ACTIVATION_RESET = new UserEvents("user_activation_reset");
        UserEvents.PROJECTS_RECIEVED = new UserEvents("user_projects_recieved");
        UserEvents.PROJECT_DELETED = new UserEvents("user_project_deleted");
        UserEvents.PROJECT_COPIED = new UserEvents("user_project_copied");
        UserEvents.PROJECT_RENAMED = new UserEvents("user_project_rename");
        UserEvents.DETAILS_SAVED = new UserEvents("user_details_saved");
        return UserEvents;
    })(Animate.ENUM);
    Animate.UserEvents = UserEvents;

    var UserEvent = (function (_super) {
        __extends(UserEvent, _super);
        function UserEvent(eventName, message, return_type, data) {
            _super.call(this, eventName, message, return_type, data);
        }
        return UserEvent;
    })(Animate.AnimateServerEvent);
    Animate.UserEvent = UserEvent;

    /**
    * This class is used to represent the user who is logged into Animate.
    */
    var User = (function (_super) {
        __extends(User, _super);
        function User(username) {
            if (typeof username === "undefined") { username = ""; }
            _super.call(this);

            if (User._singleton != null)
                throw new Error("The User class is a singleton. You need to call the User.getSingleton() function.");

            User._singleton = this;

            // Call super-class constructor
            Animate.EventDispatcher.call(this);

            this.username = username;
            this.bio = "";
            this.created_on = "";
            this.mRequest = "";
            this.plan = UserPlanType.PLAN_FREE;
            this.mIsLoggedIn = false;
            this.imgURL = "media/blank-user.png";
            this._project = null;
            this.planLevel = -1;
            this.maxNumProjects = 0;

            //this.mServerProxy = this.onServer.bind( this );
            //See if the user is logged in and get all the details
            this.updatedLoggedIn();
        }
        /**
        * Checks if a user is logged in or not.
        * @extends {User}
        */
        User.prototype.updatedLoggedIn = function () {
            this.mRequest = "isLoggedIn";
            var loader = new Animate.Loader();
            loader.addEventListener(Animate.LoaderEvents.COMPLETE, this.onServer, this);
            loader.addEventListener(Animate.LoaderEvents.FAILED, this.onServer, this);
            loader.load(Animate.DB.HOST, { category: "user", command: "isLoggedIn", user: "" }, false);
        };

        /**
        * Fetches all the projects of a user. This only works if the user if logged in. If not
        * it will return null.
        */
        User.prototype.getProjects = function () {
            if (this.mIsLoggedIn) {
                this.mRequest = "projectsReceived";
                var loader = new Animate.Loader();
                loader.addEventListener(Animate.LoaderEvents.COMPLETE, this.onServer, this);
                loader.addEventListener(Animate.LoaderEvents.FAILED, this.onServer, this);
                loader.load(Animate.DB.HOST, { category: "project", command: "getProjects" });
            } else
                return null;
        };

        /**
        * Use this function to rename a project
        * @param {number} id The project ID we are copying
        * @param {string} name The new name of the project
        * @param {string} description The new description of the project
        * @param {string} tags The new tags of the project
        * @param {string} category The new category of the project
        * @param {string} subCat The new subCat of the project
        * @param {string} visibility The new visibility of the project. Either public or private
        */
        User.prototype.renameProject = function (id, name, description, tags, category, subCat, visibility) {
            this.mRequest = "renameProject";
            var loader = new Animate.Loader();
            loader.addEventListener(Animate.LoaderEvents.COMPLETE, this.onServer, this);
            loader.addEventListener(Animate.LoaderEvents.FAILED, this.onServer, this);
            loader.load(Animate.DB.HOST, {
                category: "project",
                command: this.mRequest,
                projectID: id,
                name: name,
                description: description,
                tags: tags,
                cat: category,
                subCat: subCat,
                visibility: visibility
            }, true);
        };

        /**
        * @type public mfunc updateDetails
        * Use this function to update user details
        * @param {string} bio The bio of the user
        * @extends {User}
        */
        User.prototype.updateDetails = function (bio) {
            this.mRequest = "updateDetails";
            var loader = new Animate.Loader();
            loader.addEventListener(Animate.LoaderEvents.COMPLETE, this.onServer, this);
            loader.addEventListener(Animate.LoaderEvents.FAILED, this.onServer, this);
            loader.load(Animate.DB.HOST, {
                category: "user",
                command: this.mRequest,
                bio: bio
            }, true);
        };

        /**
        * @type public mfunc copyProject
        * Use this function to duplicate a project
        * @param {number} id The project ID we are copying
        * @extends {User}
        */
        User.prototype.copyProject = function (id) {
            this.mRequest = "copyProject";
            var loader = new Animate.Loader();
            loader.addEventListener(Animate.LoaderEvents.COMPLETE, this.onServer, this);
            loader.addEventListener(Animate.LoaderEvents.FAILED, this.onServer, this);
            loader.load(Animate.DB.HOST, {
                category: "project",
                command: this.mRequest,
                projectID: id
            }, true);
        };

        /**
        * This will delete a project from the database as well as remove it from the user.
        * @param {string} id The id of the project we are removing.
        */
        User.prototype.deleteProject = function (id) {
            if (this.mIsLoggedIn) {
                if (this.project != null) {
                    this.project.dispose();
                    this.project = null;
                }

                this.mRequest = "projectDeleted";
                var loader = new Animate.Loader();
                loader.addEventListener(Animate.LoaderEvents.COMPLETE, this.onServer, this);
                loader.addEventListener(Animate.LoaderEvents.FAILED, this.onServer, this);
                loader.load(Animate.DB.HOST, { category: "project", command: "deleteProject", projectID: id }, true);
            } else
                return null;
        };

        /**
        * This function is used to log a user out.
        */
        User.prototype.logout = function () {
            this.mRequest = "logout";
            var loader = new Animate.Loader();
            loader.addEventListener(Animate.LoaderEvents.COMPLETE, this.onServer, this);
            loader.addEventListener(Animate.LoaderEvents.FAILED, this.onServer, this);
            loader.load(Animate.DB.HOST, { category: "user", command: "logout" }, true);
        };

        /**
        * This function is used to reset a user's password.
        * @param {string} user
        */
        User.prototype.resetPassword = function (user) {
            this.mRequest = "resetPassword";
            var loader = new Animate.Loader();
            loader.addEventListener(Animate.LoaderEvents.COMPLETE, this.onServer, this);
            loader.addEventListener(Animate.LoaderEvents.FAILED, this.onServer, this);
            loader.load(Animate.DB.HOST, { category: "user", command: "resetPassword", user: user }, true);
        };

        /**
        * This function is used to resend a user's activation code
        * @param {string} user
        */
        User.prototype.resendActivation = function (user) {
            this.mRequest = "resendActivation";
            var loader = new Animate.Loader();
            loader.addEventListener(Animate.LoaderEvents.COMPLETE, this.onServer, this);
            loader.addEventListener(Animate.LoaderEvents.FAILED, this.onServer, this);
            loader.load(Animate.DB.HOST, { category: "user", command: "resendActivation", user: user }, true);
        };

        /**
        * Tries to log the user in.
        * @param {string} user The username of the user.
        * @param {string} password The password of the user.
        * @param {boolean} rememberMe Set this to true if we want to set a login cookie and keep us signed in.
        */
        User.prototype.login = function (user, password, rememberMe) {
            if (this.mIsLoggedIn = false) {
                this.dispatchEvent(new UserEvent(UserEvents.LOGGED_IN, "You are already logged in.", Animate.LoaderEvents.COMPLETE, null));
                return;
            }

            this.username = user;

            this.mRequest = "login";
            var loader = new Animate.Loader();
            loader.addEventListener(Animate.LoaderEvents.COMPLETE, this.onServer, this);
            loader.addEventListener(Animate.LoaderEvents.FAILED, this.onServer, this);
            loader.load(Animate.DB.HOST, { category: "user", command: "login", user: this.username, rememberMe: rememberMe, password: password }, true);
        };

        /**
        * Tries to register a new user.
        * @param {string} user The username of the user.
        * @param {string} password The password of the user.
        * @param {string} email The email of the user.
        * @param {string} captcha The captcha of the login screen
        * @param {string} captha_challenge The captha_challenge of the login screen
        */
        User.prototype.register = function (user, password, email, captcha, captha_challenge) {
            if (this.mIsLoggedIn = false) {
                this.dispatchEvent(new UserEvent(UserEvents.FAILED, "You are already logged in.", Animate.LoaderEvents.COMPLETE, null));
                return;
            }

            this.username = user;

            this.mRequest = "register";
            var loader = new Animate.Loader();
            loader.addEventListener(Animate.LoaderEvents.COMPLETE, this.onServer, this);
            loader.addEventListener(Animate.LoaderEvents.FAILED, this.onServer, this);
            loader.load(Animate.DB.HOST, {
                category: "user",
                command: "register",
                user: this.username,
                password: password,
                email: email,
                captcha: captcha,
                captha_challenge: captha_challenge
            }, true);
        };

        /**
        * This is the resonse from the server
        * @param {LoaderEvents} response The response from the server. The response will be either Loader.COMPLETE or Loader.FAILED
        * @param {Event} data The data sent from the server.
        */
        User.prototype.onServer = function (response, event, sender) {
            var data = event.tag;

            if (response == Animate.LoaderEvents.COMPLETE) {
                if (event.return_type == Animate.ServerResponses.ERROR) {
                    Animate.MessageBox.show(event.message, Array("Ok"), null, null);
                    this.dispatchEvent(new UserEvent(UserEvents.FAILED, event.message, event.return_type, event.data));
                    return;
                }

                if (this.mRequest == "login") {
                    this.bio = data.bio;
                    this.plan = data.plan;
                    this.maxNumProjects = data.max_projects;
                    this.created_on = data.created_on;
                    this.imgURL = (data.image == "" || data.image == null ? "media/blank-user.png" : data.image);

                    this.planLevel = 0;
                    if (data.plan == Animate.DB.PLAN_SILVER || data.plan == Animate.DB.PLAN_BRONZE)
                        this.planLevel = 1;
else if (data.plan == Animate.DB.PLAN_GOLD)
                        this.planLevel = 2;
else
                        this.planLevel = 3;

                    if (event.return_type == Animate.ServerResponses.SUCCESS)
                        this.mIsLoggedIn = true;

                    this.dispatchEvent(new UserEvent(UserEvents.LOGGED_IN, event.message, event.return_type, data));
                } else if (this.mRequest == "register")
                    this.dispatchEvent(new UserEvent(UserEvents.REGISTERED, event.message, event.return_type, data));
else if (this.mRequest == "updateDetails")
                    this.dispatchEvent(new UserEvent(UserEvents.DETAILS_SAVED, event.message, event.return_type, data));
else if (this.mRequest == "projectsReceived")
                    this.dispatchEvent(new UserEvent(UserEvents.PROJECTS_RECIEVED, event.message, event.return_type, data));
else if (this.mRequest == "copyProject")
                    this.dispatchEvent(new UserEvent(UserEvents.PROJECT_COPIED, event.message, event.return_type, data));
else if (this.mRequest == "renameProject") {
                    this.project.mName = data.name;
                    this.project.mDescription = data.description;
                    this.project.mTags = data.tags;
                    this.project.mRating = data.rating;
                    this.project.mCategory = data.category;
                    this.project.mImgPath = data.image;
                    this.project.mVisibility = data.visibility;
                    this.project.mSubCategory = data.sub_category;

                    this.dispatchEvent(new UserEvent(UserEvents.PROJECT_RENAMED, event.message, event.return_type, data));
                } else if (this.mRequest == "projectDeleted") {
                    this.dispatchEvent(new UserEvent(UserEvents.PROJECT_DELETED, event.message, event.return_type, data));
                } else if (this.mRequest == "isLoggedIn") {
                    if (data.loggedIn == "true") {
                        this.username = data.username;
                        this.bio = data.bio;
                        this.plan = data.plan;
                        this.maxNumProjects = data.max_projects;
                        this.imgURL = (data.image == "" || data.image == null ? "media/blank-user.png" : data.image);
                        this.created_on = data.created_on;
                        this.mIsLoggedIn = true;

                        this.planLevel = 0;
                        if (data.plan == Animate.DB.PLAN_SILVER || data.plan == Animate.DB.PLAN_BRONZE)
                            this.planLevel = 1;
else if (data.plan == Animate.DB.PLAN_GOLD)
                            this.planLevel = 2;
else
                            this.planLevel = 3;
                    }
                } else if (this.mRequest == "resetPassword") {
                    if (event.return_type == Animate.ServerResponses.SUCCESS)
                        this.dispatchEvent(new UserEvent(UserEvents.PASSWORD_RESET, event.message, event.return_type, data));
else
                        this.dispatchEvent(new UserEvent(UserEvents.FAILED, event.message, event.return_type, data));
                } else if (this.mRequest == "resendActivation") {
                    if (event.return_type == Animate.ServerResponses.SUCCESS)
                        this.dispatchEvent(new UserEvent(UserEvents.ACTIVATION_RESET, event.message, event.return_type, data));
else
                        this.dispatchEvent(new UserEvent(UserEvents.FAILED, event.message, event.return_type, data));
                } else if (this.mRequest == "logout") {
                    if (event.return_type == Animate.ServerResponses.SUCCESS) {
                        this.username = "";
                        this.mIsLoggedIn = false;
                        this.dispatchEvent(new UserEvent(UserEvents.LOGGED_OUT, event.message, event.return_type, data));
                    }
                } else
                    this.dispatchEvent(new UserEvent(UserEvents.FAILED, event.message, event.return_type, data));
            } else
                this.dispatchEvent(new UserEvent(UserEvents.FAILED, event.message, event.return_type, data));
        };

        Object.defineProperty(User.prototype, "project", {
            get: function () {
                return this._project;
            },
            set: function (val) {
                this._project = val;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(User.prototype, "isLoggedIn", {
            get: function () {
                return this.mIsLoggedIn;
            },
            enumerable: true,
            configurable: true
        });

        User.getSingleton = /**
        * Gets the singleton instance.
        * @returns {User}
        */
        function () {
            if (!User._singleton)
                new User();

            return User._singleton;
        };
        User._singleton = null;
        return User;
    })(Animate.EventDispatcher);
    Animate.User = User;
})(Animate || (Animate = {}));
//# sourceMappingURL=User.js.map
