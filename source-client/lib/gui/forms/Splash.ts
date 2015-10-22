module Animate
{
	export class Splash2 extends Window
	{
		private static _singleton: Splash2;

		//private welcomeBackground: Component;
        private welcomeBackground: JQuery;

		//private newProjectBackground: Component;
        private newProjectBackground: JQuery;
        //private loginBackground: Component;
        private loginBackground: JQuery;
		private pluginsBackground: Component;
		private finalScreen: Component;
		//private projectError: Label;
		//private projectName: InputBox;
		private finalError: Label;
		//private projectBack: Button;
		//private projectNext: Button;
		private finalButton: Button;
		//private projectDesc: InputBox;
		//private loginBack: Component;
		//private loginUsername: InputBox;
		//private loginPassword: InputBox;
		//private loginRemembeMe: Checkbox;
		//private loginReset: Label;
		//private regUsername: InputBox;
		//private regEmail: InputBox;
		//private regPassword: InputBox;
		//private regPasswordCheck: InputBox;
		//private loginResend: Label;
		//private project :Component;
		//private news :Component;
		//private userBox :Component;
		//private closeButton :Component;
		private userImg :Component;
		//private userBoxDetails :Component;
		private response: string;
		private pluginLoader: ProjectLoader;
		private projectBrowser: ProjectBrowser;
		//private login :Button;
		//private register : Button;
		//private loginError: Label;		
		private pluginBrowser: PluginBrowser;
		private clickProxy: any;
		//private animateProxy: any;
		private initialized: boolean;
        //private slideTime: number;

        public names = [{name: "mathew", lastname: "henson"}, { name: "suzy", lastname: "miller" } ];

        // New changes
        private user: User;
        private $loginError: string;
        private $loginRed: boolean;
        private $loading: boolean;
        private $activePane: string;

        constructor()
        {
            super(800, 520);

            Splash2._singleton = this;
            this.user = User.get;
			this.element.addClass("splash-window");
            this.$loginError = "";
            this.$loginRed = true;
            this.$loading = false;
            this.$activePane = "welcome";
            
            //this.welcomeBackground = new Component("<div class='splash-outer-container splash-welcome'></div>", this.content);
            this.welcomeBackground = jQuery(".temp-splash-welcome").remove().clone();
            this.content.element.append(this.welcomeBackground);
            Compiler.build(this.welcomeBackground, this);

			//this.newProjectBackground = new Component("<div style='left:800px;' class='splash-outer-container splash-new-project'></div>", this.content);
            this.newProjectBackground = jQuery(".temp-splash-new-project").remove().clone();
            this.content.element.append(this.newProjectBackground);
            Compiler.build(this.newProjectBackground, this);

			//this.loginBackground = new Component("<div style='top:-520px;' class='splash-outer-container splash-login-user'></div>", this.content);
            this.loginBackground = jQuery(".temp-splash-login").remove().clone();
            this.content.element.append(this.loginBackground);
            Compiler.build(this.loginBackground, this);

            //this.pluginsBackground = new Component("<div style='left:800px;' class='splash-outer-container splash-plugins'></div>", this.content);
			//this.finalScreen = new Component("<div style='left:800px;' class='splash-outer-container splash-final-screen'></div>", this.content);
            this.pluginsBackground = new Component("<div style='left:800px;' class='splash-outer-container splash-plugins'></div>");
			this.finalScreen = new Component("<div style='left:800px;' class='splash-outer-container splash-final-screen'></div>");

			this.clickProxy = this.onButtonClick.bind( this);
			//this.animateProxy = this.enableButtons.bind(this);
			this.initialized = false;
			//his.slideTime = 500;

			this.modalBackdrop.css({ "z-index": "900" });
            this.element.css({ "z-index": "901" });

           
        }
        
        /**
		* Given a form element, we look at if it has an error and based on the expression. If there is we set 
        * the login error message
        * @param {EngineForm} The form to check.
        * @param {boolean} registerCheck Check register password and assign captcha
        * @param {boolean} True if there is an error
		*/
        reportError(form: EngineForm, registerCheck: boolean = false): boolean
        {
            if (!form.$error)
                this.$loginError = "";
            else
            {
                var name = form.$errorInput;
                name = name.charAt(0).toUpperCase() + name.slice(1);

                switch (form.$errorExpression)
                {
                    case "alpha-numeric":
                        this.$loginError = `${name} must only contain alphanumeric characters`;
                        break;
                    case "non-empty":
                        this.$loginError = `${name} cannot be empty`;
                        break;
                    case "email":
                        this.$loginError = `${name} must be a valid email`;
                        break;
                    case "alpha-numeric-plus":
                        this.$loginError = `${name} must only contain alphanumeric characters and '-', '!', or '_'`;
                        break;
                    default:
                        this.$loginError = "";
                        break;
                }
            }

            if (registerCheck)
            {
                (<any>this).$regCaptcha = jQuery("#recaptcha_response_field").val();
                (<any>this).$regChallenge = jQuery("#recaptcha_challenge_field").val();

                if ((<any>this).$regPassword != (<any>this).$regPasswordCheck)
                    this.$loginError = "Your passwords do not match";
            }

            if (this.$loginError == "")
            {
                this.$loginRed = false;
                return false;
            }
            else
            {
                this.$loginRed = true;
                return true;
            }
        }

        loginError(err: Error)
        {
            this.$loading = false;
            this.$loginRed = true;
            this.$loginError = err.message;
            Compiler.digest(this.loginBackground, this);
        }

        loginSuccess(data: UsersInterface.IResponse)
        {
            if (data.error)
                this.$loginRed = true;
            else
                this.$loginRed = false;

            this.$loading = false;
            this.$loginError = data.message;
            Compiler.digest(this.loginBackground, this);
            Compiler.digest(this.welcomeBackground, this);
        }

        /**
		* Attempts to log the user in
        * @param {string} user The username
        * @param {string} password The user password
        * @param {boolean} remember Should the user cookie be saved
		*/
        login(user: string, password: string, remember: boolean)
        {
            var that = this;
            that.$loading = true;
            this.user.login(user, password, remember)
                .then(function (data)
                {
                    if (data.error)
                        that.$loginRed = true;
                    else
                        that.$loginRed = false;

                    that.$loginError = data.message;
                    that.refreshProjects();
                    Compiler.digest(that.loginBackground, that);
                    Compiler.digest(that.welcomeBackground, that);
                })
                .fail(this.loginError.bind(that))
                .done(function ()
                {
                    jQuery(".close-but", that.loginBackground).trigger("click");
                    that.$loading = false;
                });
        }

        /**
		* Attempts to register a new user
        * @param {string} user The username of the user.
		* @param {string} password The password of the user.
		* @param {string} email The email of the user.
		* @param {string} captcha The captcha of the login screen
		* @param {string} captha_challenge The captha_challenge of the login screen
		*/
        register(user: string, password: string, email: string, captcha: string, challenge: string)
        {
            var that = this;
            that.$loading = true;
            this.user.register(user, password, email, captcha, challenge)
                .then(this.loginSuccess.bind(that))
                .fail(function (err: Error)
                {
                    that.$loginRed = true;
                    that.$loginError = err.message;
                    that.$loading = false;
                    Recaptcha.reload();
                    Compiler.digest(that.loginBackground, that);
                });
        }

       /**
       * Attempts to resend the activation code
       * @param {string} user The username or email of the user to resend the activation
       */
        resendActivation(user: string)
        {
            var that = this;
            
            if (!user)
            {
                this.$loginError = "Please specify a username or email to fetch";
                jQuery("form[name='register'] input[name='username'], form[name='register'] input[name='email']", this.loginBackground).each(function (index, elem) {
                    this.$error = true;
                });

                return Compiler.digest(that.loginBackground, that);
            }
            
            that.$loading = true;
            this.user.resendActivation(user)
                .then(this.loginSuccess.bind(that))
                .fail(this.loginError.bind(that));
        }

        /**
        * Attempts to reset the users password
        * @param {string} user The username or email of the user to resend the activation
        */
        resetPassword(user: string)
        {
            var that = this;

            if (!user)
            {
                this.$loginError = "Please specify a username or email to fetch";
                jQuery("form[name='register'] input[name='username'], form[name='register'] input[name='email']", this.loginBackground).each(function (index, elem)
                {
                    this.$error = true;
                });

                return Compiler.digest(that.loginBackground, that);
            }

            that.$loading = true;
            this.user.resetPassword(user)
                .then(this.loginSuccess.bind(that))
                .fail(this.loginError.bind(that));
        }

        /**
        * Attempts to resend the activation code
        * @param {string} user The username or email of the user to resend the activation
        */
        logout()
        {
            var that = this;
            that.$loading = true;
            this.user.logout().then(function ()
            {
                that.$loading = false;
                that.$loginError = "";
                Application.getInstance().projectReset();                
                that.projectBrowser.enabled = false;
                that.refreshProjects();

                Compiler.digest(that.welcomeBackground, that);
            })
            .fail(this.loginError.bind(that));
        }

        /**
		* Fills the project browser with projects from the server
		*/
        refreshProjects()
        {
            var that = this;
            if (that.user.isLoggedIn)
            {
                //this.user.getProjectList().then(function (respose)
                //{
                //    that.projectBrowser.fill(respose.data);

                //}).fail(function (err)
                //{
                //    MessageBox.show(err.message, ["Ok"], null, null);
                //});
            }
            else
                that.projectBrowser.clearItems();
        }

		/**
		* This function can be called to reset all the splash variables and states.absolute
		* This is called from Animate when we click the home button.
		* @returns {any} 
		*/
		reset()
		{
            //this.welcomeBackground.element.css({ "left": "0px", "top": "0px" });
            //this.welcomeBackground.css({ "left": "0px", "top": "0px" });
			//this.newProjectBackground.element.css({ "left": "800px" });
            //this.newProjectBackground.css({ "left": "800px" });
			//this.loginBackground.element.css({ "top": "-520px" });
            //this.loginBackground.css({ "top": "-520px" });
			//this.pluginsBackground.element.css({ "left": "800px" });
			//this.finalScreen.element.css({ "left": "800px" });

			//this.enableButtons(true);

			//this.projectError.element.hide();
			this.finalError.element.hide();
			//this.loginError.element.hide();

			//this.closeButton.element.show();

			//this.loginUsername.textfield.element.removeClass("red-border");
			//this.loginPassword.textfield.element.removeClass("red-border");
			//this.regUsername.textfield.element.removeClass("red-border");
			//this.regPassword.textfield.element.removeClass("red-border");
			//this.regPasswordCheck.textfield.element.removeClass("red-border");
			//this.regEmail.textfield.element.removeClass("red-border");

			//this.projectName.textfield.element.removeClass("red-border");
			//this.projectDesc.textfield.element.removeClass("red-border");

			//Refresh the projects
            //User.get.downloadProjects();
            this.refreshProjects()

            
            Compiler.digest(this.welcomeBackground, this);
            Compiler.digest(this.loginBackground, this);

			return;
		}

		///**
		//* Enables the buttons based on the value parameter
		//* @param <bool> value 
		//*/
		//enableButtons(value)
		//{
		//	if (typeof value !== "undefined")
		//	{
		//		this.projectBack.enabled = value;
		//		this.projectNext.enabled = value;
  //              this.finalButton.enabled = value;
  //              // TODO - button enabled
		//		//this.login.enabled = value;
		//		//this.loginBack.enabled = value;
		//		//this.register.enabled = value;
		//	}
		//	else
		//	{
		//		this.projectBack.enabled = true;
		//		this.projectNext.enabled = true;
  //              this.finalButton.enabled = true;
  //              // TODO - button enabled
		//		//this.login.enabled = true;
		//		//this.loginBack.enabled = true;
		//		//this.register.enabled = true;
		//	}
		//}

		/**
		* Creates the new project page on the splash screen
		*/
		createNewProjectPage()
		{
			//var heading = new Label("Create New Project", this.newProjectBackground)
			//heading.element.addClass("heading");

			//Create container div
			//var project = new Component("<div class='splash-new-project-sub'></div>", this.newProjectBackground);

			//Create inputs
			//new Label("Project Name", project);
			//this.projectName = new InputBox(project, "");
			//var sub = new Label("Please enter the name of your project.", project);
			//sub.textfield.element.addClass("instruction-text");

			//new Label("Project Description", project);
			//this.projectDesc = new InputBox(project, "", true);

			//sub = new Label("Optionally give a description of your project.", project);
			//sub.textfield.element.addClass("instruction-text");

			//Create continue Button
			//this.projectBack = new Button("Back", project);
			//this.projectNext = new Button("Next", project);
			//this.projectNext.css({ width: 100, height: 40 });
			//this.projectBack.css({ width: 100, height: 40 });

			//Error label
			//this.projectError = new Label("", project);
			//this.projectError.element.hide();
			//this.projectError.textfield.element.css({ color: "#ff0000", clear: "both" });

			//this.projectNext.element.click(this.clickProxy);
			//this.projectBack.element.click(this.clickProxy);
		}

		/**
		* Creates the new plugins page on the splash screen
		*/
		createPluginsPage()
		{
			//Add the explorer
			this.pluginBrowser = new PluginBrowser(this.pluginsBackground);
			this.pluginBrowser.on(PluginBrowserEvents.PLUGINS_IMPLEMENTED, this.onPluginResponse, this);
		}

		/**
		* Creates the final screen. 
		* This screen loads each of the plugins and allows the user to enter the application.
		*/
		createFinalScreen()
		{
			//Heading
			var heading = new Label("Setting up workspace", this.finalScreen);
			heading.element.addClass("heading");

			//Info
			var sub = new Label("Please wait while we load and initialise your behaviours.", this.finalScreen);
			sub.textfield.element.addClass("instruction-text");

			//Add the explorer
			this.pluginLoader = new ProjectLoader(this.finalScreen);

			//Error label
			this.finalError = new Label("ERROR", this.finalScreen);
			this.finalError.element.hide();
			this.finalError.textfield.element.css({ color: "#ff0000", "height": "35px", "float": "left", "width": "300px", "padding-top": "2px", "margin-left": "10px" });

			//Create continue Button
			this.finalButton = new Button("Loading", this.finalScreen);
			this.finalButton.css({ width: 100, height: 30 });
			this.finalButton.element.click(this.clickProxy);
			this.finalButton.enabled = false;

			this.pluginLoader.on(ProjectLoaderEvents.READY, this.onProjectLoaderResponse, this);
			this.pluginLoader.on(ProjectLoaderEvents.FAILED, this.onProjectLoaderResponse, this);
		}

		/**
		* @type public mfunc createLoginPage
		* Creates the login page on the Splash menu
		* @extends <Splash>
		*/
		createLoginPage()
		{
			//this.loginBack = new Component("<div class='close-but'>X</div>", this.loginBackground);
			//var heading = new Label("User Login", this.loginBackground);

			//heading.element.addClass("heading");
			//heading.textfield.element.prepend("<img src='media/blank-user.png' />");
			//heading.element.append("<div class='fix'></div>");

			//Create container div and main elements
			//var sub = new Component("<div></div>", this.loginBackground);
			//this.loginBackground.element.append("<div class='fix'></div>");
			//var login = new Component("<div class='splash-section'></div>", sub);
			//var register = new Component("<div class='splash-section splash-section-right'></div>", sub);

			//Create login form
			//new Label("Username:", login);
			//this.loginUsername = new InputBox(login, "");
			//new Label("Password:", login);
			//this.loginPassword = new InputBox(login, "", false, true);
			//this.loginRemembeMe = new Checkbox(login, "Remember me", true);

			//this.loginReset = new Label("Reset Password", login);
			//this.loginReset.element.addClass("hyperlink");
			//this.loginResend = new Label("Resend Activation Email", login);
			//this.loginResend.element.addClass("hyperlink");
			//this.loginResend.element.css({ "margin": "20px 0 0 0" });

			//Create register form
			//new Label("Username:", register);
			//this.regUsername = new InputBox(register, "");
			//new Label("Email:", register);
			//this.regEmail = new InputBox(register, "");
			//new Label("Password:", register);
			//this.regPassword = new InputBox(register, "", false, true);
			//new Label("Retype Password:", register);
			//this.regPasswordCheck = new InputBox(register, "", false, true);
			//register.element.append("<div id='animate-captcha'></div>");

			//jQuery('#animate-captcha').each(function ()
			//{
			//	if ( (<any>window).Recaptcha)
			//		Recaptcha.create("6LdiW-USAAAAAGxGfZnQEPP2gDW2NLZ3kSMu3EtT", this, { theme: "white" });
			//});

            Recaptcha.create("6LdiW-USAAAAAGxGfZnQEPP2gDW2NLZ3kSMu3EtT", <any>document.getElementById("animate-captcha"), { theme: "white" });


			//Create Buttons
			//this.login = new Button("Login", login);
			//this.register = new Button("Register", register);


			//this.login.css({ width: "", height: 40 });
			//this.register.css({ width: "", height: 40 });

			//Error label
			//this.loginError = new Label("", this.loginBackground);
			//this.loginError.element.hide();
			//this.loginError.textfield.element.css({ color: "#ff0000", clear: "both", "font-size": "14px", "text-align": "center", "margin-top": "0px", "font-weight": "bold" });

			//this.login.element.click(this.clickProxy);
			//this.register.element.click(this.clickProxy);
			//this.loginBack.element.click(this.clickProxy);
			//this.loginReset.element.click(this.clickProxy);
			//this.loginResend.element.click(this.clickProxy);
		}

		///**
		//* Checks each of the login fields based on which button was pressed.
		//* @param {any} button 
		//*/
  //      validateLogins(jComp: JQuery)
  //      {
  //          var toRet = true;
		//	//this.loginUsername.textfield.element.removeClass("red-border");
		//	//this.loginPassword.textfield.element.removeClass("red-border");
		//	//this.regUsername.textfield.element.removeClass("red-border");
		//	//this.regPassword.textfield.element.removeClass("red-border");
		//	//this.regPasswordCheck.textfield.element.removeClass("red-border");
		//	//this.regEmail.textfield.element.removeClass("red-border");

  //          if (jComp.is(".en-login-reset") || jComp.is(".en-login-resend"))
		//	{
  //              //Check username
  //              var message = jQuery.trim(jQuery("#en-login-username").val())
		//		if (message == "")
		//		{
		//			//this.loginError.element.show();
		//			//this.loginError.text = "Please enter your username or email";
  //                  this.$loginError = "Please enter your username or email";
		//			//this.loginUsername.textfield.element.addClass("red-border");
		//			//this.enableButtons(true);
  //                  toRet = false;
		//		}
		//	}
  //          else if (jComp.is(".en-login"))
		//	{
		//		//Check username
  //              var message: string = Utils.checkForSpecialChars(jQuery("#en-login-username").val())
		//		if (message)
		//		{
		//			//this.loginError.element.show();
		//			//this.loginError.text = message;
  //                  this.$loginError = message;
		//			//this.loginUsername.textfield.element.addClass("red-border");
		//			this.enableButtons(true);
  //                  toRet = false;
		//		}

		//		//Check password
  //              message = Utils.checkForSpecialChars(jQuery("#en-login-password").val())
		//		if (message)
		//		{
		//			//this.loginError.element.show();
  //                  //this.loginError.text = message;
  //                  this.$loginError = message;
		//			//this.loginPassword.textfield.element.addClass("red-border");
		//			this.enableButtons(true);
  //                  toRet = false;
		//		}
  //          }
  //          else if (jComp.is(".en-login-reset") == false && jComp.is(".en-login-resend") == false)
		//	{
		//		//Check username
  //              var message: string = Utils.checkForSpecialChars(jQuery("#en-reg-username").val())
		//		if (message)
		//		{
		//			//this.loginError.element.show();
  //                  //this.loginError.text = message;
  //                  this.$loginError = message;
		//			//this.regUsername.textfield.element.addClass("red-border");
		//			this.enableButtons(true);
  //                  toRet = false;
		//		}

		//		//Check email
  //              var emailValid: boolean = Utils.validateEmail(jQuery("#en-reg-email").val())
		//		if (!emailValid)
		//		{
		//			//this.loginError.element.show();
		//			//this.loginError.text = "Please enter a valid email address.";
  //                  this.$loginError = "Please enter a valid email address.";
		//			//this.regEmail.textfield.element.addClass("red-border");
		//			this.enableButtons(true);
  //                  toRet = false;
		//		}

		//		//Check password
  //              message = Utils.checkForSpecialChars(jQuery("#en-reg-password").val())
		//		if (message)
		//		{
		//			//this.loginError.element.show();
		//			//this.loginError.text = message;
  //                  this.$loginError = message;
		//			//this.regPassword.textfield.element.addClass("red-border");
		//			this.enableButtons(true);
		//			return false;
		//		}

		//		//Make sure passwords match
  //              if (jQuery("#en-reg-password").val() != jQuery("#en-reg-password-check").val())
		//		{
		//			//this.regPassword.textfield.element.addClass("red-border");
		//			//this.regPasswordCheck.textfield.element.addClass("red-border");
  //                  jQuery("#en-reg-password").addClass("red-border");
  //                  jQuery("#en-reg-password-check").addClass("red-border");
		//			//this.loginError.element.show();
		//			//this.loginError.text = "Your passwords do not match.";
  //                  this.$loginError = "Your passwords do not match.";
		//			this.enableButtons(true);
  //                  toRet = false;
		//		}
		//	}
            
  //          return toRet;
  //      }

		///**
		//* Checks each of the fields for creating a new project.
		//*/
		//validateNewProject()
		//{
		//	this.projectName.textfield.element.removeClass("red-border");
		//	this.projectDesc.textfield.element.removeClass("red-border");
		//	this.projectError.element.hide();

		//	//Check for errors
		//	var message = Utils.checkForSpecialChars(this.projectName.text);
		//	if (message != null)
		//	{
		//		this.projectError.text = message;
		//		this.projectError.element.show();
		//		this.projectName.textfield.element.addClass("red-border");
		//		//this.enableButtons(true);
		//		return;
		//	}

		//	return true;
		//}

		/**
		* Creates the first page on the splash screen
		*/
		createWelcomePage()
		{
            var user: User = User.get;

            //Compiler.build(this.welcomeBackground, this);

			//var sub = new Component("<div class='splash-container'></div>", this.welcomeBackground);
			//this.project = new Component("<div class='splash-section'></div>", sub);
			//this.news = new Component("<div class='splash-section'></div>", sub);

			//this.userBox = <Component>this.news.addChild("<div class='splash-user-box'></div>");
			//this.closeButton = new Component("<div class='close-but'>X</div>", this.userBox);
			//this.userImg = new Component("<div class='details'><img src='" + user.imgURL + "' /></div>", this.userBox);


			//this.news.addChild("<div class='welcome'>Welcome to Animate</div>");
			//var newsBox : Component = <Component>this.news.addChild("<div class='news'></div>");

			//Get ajax news
			//newsBox.element.html("Hello and welcome back to Animate. If you're new around these parts, let's get you up and running in just a few minutes. Click the below button to learn how to create your very first Animate project. <br /><a href=\"javascript:window.open('https://webinate.net/tutorials-popup/','Animate Tutorials','width=1000,height=800')\"><div class='getting-started'><img src='media/play-arrow.png'/>Tutorial Videos</div></div></a>");


			//login sections	
			//if ( user.isLoggedIn )
			//{
				//this.userBoxDetails = new Component("<div class='details'>" + user.username + "</div><div class='details'><div class='hyperlink logout-link'>Logout</div></div><div class='fix'></div>", this.userBox);
				//jQuery(".logout-link", this.userBoxDetails.element).click(this.clickProxy);
				//user.downloadProjects();
				//this.closeButton.element.show();
			//}
			//else
			//{
				//this.userBoxDetails = new Component("<div class='details'><span class='hyperlink login-link'>Login</span></div><div class='details'><span class='hyperlink register-link'>Register</span></div><div class='fix'></div>", this.userBox);
				//jQuery(".login-link", this.userBoxDetails.element).click(this.clickProxy);
				//jQuery(".register-link", this.userBoxDetails.element).click(this.clickProxy);
				//this.closeButton.element.hide();
			//}

            //this.projectBrowser = new ProjectBrowser(this.project);
            this.projectBrowser = new ProjectBrowser(null);
            jQuery(".double-column", this.welcomeBackground).first().append(this.projectBrowser.element);
			this.projectBrowser.on(ProjectBrowserEvents.COMBO, this.onProjectCombo, this);
			//this.closeButton.element.click(this.clickProxy);
		}


		/**
		* Shows the window by adding it to a parent.
		*/
		onProjectCombo( response: ProjectBrowserEvents, event: ProjectBrowserEvent)
		{
			var user: User = User.get;

			if ( !user.isLoggedIn )
				return MessageBox.show("Please log in", ["Ok"] );

			//WELCOME - Next
			if ( event.command == "Create New")
			{
				//If a project already exists - warn the user it will have to be closed.
				if (user.project)
				{
					this.response = "newProject";
					MessageBox.show("Are you sure you want to create a new project? Your open project will need to be closed.",
						["Yes", "No"], this.onProjectOpenMessageBox, this);
					return;
				}

				//this.welcomeBackground.element.animate({ left: '-=800' }, this.slideTime, this.animateProxy);
                //this.welcomeBackground.animate({ left: '-=800' }, this.slideTime);
                this.$activePane = "project";

                //this.newProjectBackground.element.animate({ left: '-=800' }, this.slideTime, this.animateProxy);
                //this.newProjectBackground.element.animate({ left: '-=800' }, this.slideTime);
                //this.newProjectBackground.animate({ left: '-=800' }, this.slideTime);
                //this.projectName.focus();
                jQuery(".temp-splash-new-project input[name='name']").focus();
			}
			//WELCOME - Open project
			else if ( event.command == "Open")
			{
				if (this.projectBrowser.selectedItem == null)
				{
					//this.enableButtons(true);
					return;
				}

				
				var user = User.get;
				if (user.project)
				{
					this.response = "open";
					MessageBox.show("Are you sure you want to create a new project? Your open project will need to be closed.",
						["Yes", "No"], this.onProjectOpenMessageBox, this);
					return;
				}

				//Set project
				//var project = new Project( this.projectBrowser.selectedName, "", "" );
				//user.project = project;
				//project.id = this.projectBrowser.selectedID;
				//user.project.addEventListener(ProjectEvents.OPENED, this.onProjectData, this );
				//project.open();
				user.on( UserEvents.PROJECT_OPENED, this.onProjectData, this );
				user.openProject( this.projectBrowser.selectedID );

			}
			//WELCOME - Delete project
			else if ( event.command == "Delete")
			{
				if (this.projectBrowser.selectedItem == null)
				{
					//this.enableButtons(true);
					return;
				}

				if (this.projectBrowser.selectedItem)
					MessageBox.show("Are you sure you want to delete '" + this.projectBrowser.selectedName + "'?",
						["Yes", "No"], this.onMessageBox, this);

			}
			//WELCOME - Delete project
			else if ( event.command == "Copy")
			{
				if (this.projectBrowser.selectedItem == null)
				{
					//this.enableButtons(true);
					return;
				}

				if (this.projectBrowser.selectedItem)
					MessageBox.show("Are you sure you want to duplicate '" + this.projectBrowser.selectedName + "'?",
						["Yes", "No"], this.onCopyMessageBox, this);
            }

            Compiler.digest(this.welcomeBackground, this);
            Compiler.digest(this.newProjectBackground, this);
		}
        
		/**
		* When we click a button
		* @param {any} e 
		*/
        onButtonClick(e: MouseEvent)
		{
			//this.enableButtons(false);

            var jComp = jQuery(e.currentTarget);
			var comp = jQuery(e.currentTarget).data("component");


			//WELCOME - Login
            if (jComp.is(".login-link") || jComp.is(".register-link"))
			{
				//this.loginError.element.hide();
                //this.loginPassword.text = "";
                this.$loginError = "";
                this.$activePane = "login";
                
                //this.welcomeBackground.element.animate({ top: '+=520' }, this.slideTime, this.animateProxy);
               // this.welcomeBackground.animate({ top: '+=520' }, this.slideTime);
				//this.loginBackground.element.animate({ top: '+=520' }, this.slideTime, this.animateProxy);
               // this.loginBackground.animate({ top: '+=520' }, this.slideTime);
			}
			////WELCOME - Logout
   //         else if (jComp.is(".logout-link"))
			//{
			//	User.get.logout();
			//	Application.getInstance().projectReset();
			//}
			//LOGIN - back
            else if (jComp.is(".temp-splash-login .close-but"))
			{
				//this.welcomeBackground.element.animate({ top: '-=520' }, this.slideTime, this.animateProxy);
                //this.welcomeBackground.animate({ top: '-=520' }, this.slideTime);
				//this.loginBackground.element.animate({ top: '-=520' }, this.slideTime, this.animateProxy);
                //this.loginBackground.animate({ top: '-=520' }, this.slideTime);
                this.$activePane = "welcome";
            }
            ////WELCOME - Close
            //else if (jComp.is(".close-but"))
            //{
            //    this.hide();

            //}
			//LOGIN - reset password
   //         else if (jComp.is(".en-login-reset"))
			//{
   //             //if (this.validateLogins(jComp))
   //             //    User.get.resetPassword(jQuery("#en-login-username").val());
			//}
			////LOGIN - resend activation
   //         else if (jComp.is(".en-login-resend"))
			//{
   //             //if (this.validateLogins(jComp))
   //             //    User.get.resendActivation(jQuery("#en-login-username").val());
			//}
			////LOGIN - login
   //         else if (jComp.is(".en-login"))
			//{
   //            // if (this.validateLogins(jComp))
   //            //     User.get.login(jQuery("#en-login-username").val(), jQuery("#en-login-password").val(), jQuery("#en-login-remember").val() );
			//}
			////LOGIN - register
   //         else if (jComp.is(".en-register"))
			//{
   //             //if (this.validateLogins(jComp))
   //             //    User.get.register(jQuery("#en-reg-username").val(),
   //             //        jQuery("#en-reg-password").val(),
   //             //        jQuery("#en-reg-email").val(),
   //             //        jQuery("#recaptcha_response_field").val(),
   //             //        jQuery("#recaptcha_challenge_field").val());
			//}
			//PROJECT SCREEN - back
            else if (jComp.is("#en-project-back"))
			{
                //this.welcomeBackground.element.animate({ left: '+=800' }, this.slideTime, this.animateProxy);
                //this.welcomeBackground.animate({ left: '+=800' }, this.slideTime);
                //this.newProjectBackground.element.animate({ left: '+=800' }, this.slideTime, this.animateProxy);
                //this.newProjectBackground.element.animate({ left: '+=800' }, this.slideTime);
               // this.newProjectBackground.animate({ left: '+=800' }, this.slideTime);
				//this.projectName.text = "";
    //            this.projectDesc.text = "";

                this.$activePane = "welcome";

                jQuery(".temp-splash-new-project input[name='name']").val("");
                jQuery(".temp-splash-new-project input[name='description']").val("");

				//refil the projects
				this.projectBrowser.clearItems();
				//User.get.downloadProjects();
			}
			////PROJECT SCREEN - Next
   //         else if (jComp.is("#en-project-next"))
			//{
			//	//if (this.validateNewProject())
			//	//{
			//	//	var user = User.get;
			//	//	user.addEventListener( UserEvents.PROJECT_CREATED, this.onProjectData, this );
			//	//	user.addEventListener( UserEvents.FAILED, this.onProjectData, this );
			//	//	user.createProject( this.projectName.text, this.projectDesc.text );
			//	//}
			//}
			//FINAL SCREEN - FINISHED
			else if (comp == this.finalButton)
			{
				if (this.pluginLoader.errorOccured)
					MessageBox.show("Not all your behviours loaded correctly. Do you want to continue anyway?",
						["Yes", "No"], this.onFinalMessageBox, this);
				else
					this.hide();
            }

            Compiler.digest(this.welcomeBackground, this);
            Compiler.digest(this.loginBackground, this);
        }

        newProject(name: string, description: string)
        {
            //this.user.newProject(name, description);
        }


		/**
		* This is called when we click a button on the message box.
		* @param {string} response 
		*/
		onProjectOpenMessageBox( response : string )
		{
			//this.enableButtons(true);
			if (response == "Yes")
			{
				var user = User.get;

				//If a project already exists - warn the user it will have to be closed.
				if (user.project)
				{
					user.off( UserEvents.PROJECT_CREATED, this.onProjectData, this );
					user.off( UserEvents.FAILED, this.onProjectData, this );
					user.off( UserEvents.PROJECT_OPENED, this.onProjectData, this );
				}

				//Notif of the reset
				Application.getInstance().projectReset();
			}
			else
				return;

			//Trigger the button click
			if (this.response == "newProject")
				this.onProjectCombo( null, new ProjectBrowserEvent( ProjectBrowserEvents.COMBO, "Create New" ));
			else
				this.onProjectCombo( null, new ProjectBrowserEvent( ProjectBrowserEvents.COMBO, "Open" ));
		}

		/**
		* This is called when we click a button on the message box.
		* @param {any} response 
		*/
		onCopyMessageBox(response)
		{
			//this.enableButtons(true);

			if (response == "Yes")
				User.get.copyProject(this.projectBrowser.selectedID);
		}

		/**
		* This is called when we click a button on the message box.
		* @param {any} response 
		*/
		onMessageBox(response)
		{
			//this.enableButtons(true);

			if (response == "Yes")
				User.get.deleteProject(this.projectBrowser.selectedID);
		}

		/**
		* This is called when we click a button on the message box.
		* @param {any} response 
		*/
		onFinalMessageBox(response)
		{
			//this.enableButtons(true);
			if (response == "Yes")
			{
				this.hide();
				Application.getInstance().projectReady();
			}
		}

		/**
		* This is called when we receive data from the projects.
		*/
		onProjectData(response : UserEvents, data : ProjectEvent, sender? : EventDispatcher )
		{
			var user : User = User.get;
			user.off( UserEvents.PROJECT_CREATED, this.onProjectData, this );
			user.off( UserEvents.FAILED, this.onProjectData, this );
			user.off( UserEvents.PROJECT_OPENED, this.onProjectData, this );

			if ( response == UserEvents.FAILED)
			{
				//this.projectError.text = data.message;
				//this.projectError.element.show();
				//this.enableButtons(true);
				return;
			}
			if ( response == UserEvents.PROJECT_OPENED )
			{
                //this.welcomeBackground.element.animate({ left: '-=800' }, this.slideTime, this.animateProxy);
                //this.welcomeBackground.animate({ left: '-=800' }, this.slideTime);
                //this.pluginsBackground.element.animate({ left: '-=800' }, this.slideTime, this.animateProxy);
                //this.pluginsBackground.element.animate({ left: '-=800' }, this.slideTime);
                //this.$activePane = "final";
				this.pluginBrowser.reset();
				//this.enableButtons(true);
			}
			else
			{
				//Project created - go to plugins screen!		
				//this.newProjectBackground.element.animate({ left: '-=800' }, this.slideTime, this.animateProxy);
                //this.pluginsBackground.element.animate({ left: '-=800' }, this.slideTime, this.animateProxy);
                //this.newProjectBackground.element.animate({ left: '-=800' }, this.slideTime);
                //this.newProjectBackground.animate({ left: '-=800' }, this.slideTime);
                //this.pluginsBackground.element.animate({ left: '-=800' }, this.slideTime);
                this.$activePane = "plugins";
				this.pluginBrowser.reset();
			}
		}

		/**
		* This is called when we receive data from the projects.
		* @param {any} response 
		* @param {any} data >
		*/
		onPluginResponse( response: PluginBrowserEvents, event: PluginBrowserEvent)
		{
			if ( response == PluginBrowserEvents.PLUGINS_IMPLEMENTED)
			{
				//Go to final screen
				this.pluginLoader.updateDependencies();
				//this.pluginsBackground.element.animate({ left: '-=800' }, this.slideTime, this.animateProxy);
                //this.finalScreen.element.animate({ left: '-=800' }, this.slideTime, this.animateProxy);
                //this.pluginsBackground.element.animate({ left: '-=800' }, this.slideTime);
                //this.finalScreen.element.animate({ left: '-=800' }, this.slideTime);
                this.$activePane = "final";
				this.pluginLoader.startLoading();
			}
			else
			{
				//this.pluginError.element.fadeIn();
				//this.pluginError.text = data.message;
				//this.enableButtons(true);
			}
		}

		/**
		* This is called when we receive data from the projects.
		* @param {ProjectLoaderEvents} response 
		* @param {ProjectLoaderEvent} data 
		*/
		onProjectLoaderResponse( response: ProjectLoaderEvents, event: ProjectLoaderEvent )
		{
			if ( response == ProjectLoaderEvents.READY)
			{
				//All loaded! Lets finally get into the app :)
				this.finalButton.enabled = true;
				this.finalButton.text = "Let's Go!";

				//No problems so just continue and start the app
				this.hide();
				Application.getInstance().projectReady();
			}
			else
			{
				this.finalError.element.fadeIn();
				this.finalError.text = event.message;
			}
		}

		/**
		* When we receive data from the server 
		*/
		//onUserData(response: UserEvents, event : UserEvent)
		//{
			//if ( ( response == UserEvents.FAILED || response == UserEvents.LOGGED_IN || response == UserEvents.REGISTERED ) && event.return_type != AnimateLoaderResponses.SUCCESS )
			//{
				//Recaptcha.reload();
				//MessageBox.show( event.message, ["Ok"], null, null );
			//}

			//LOG OUT
			//this.enableButtons(true);
			//if (response == UserEvents.LOGGED_OUT && event.return_type == AnimateLoaderResponses.SUCCESS)
			//{
				//this.projectBrowser.enabled = false;
				//this.projectBrowser.clearItems();

				//Remove links and create normal login section
				//jQuery(".logout-link", this.userBoxDetails.element).unbind();

				//this.closeButton.element.hide();

				//this.userBoxDetails.element.remove();
				//this.userBoxDetails = new Component("<div class='details'><span class='hyperlink login-link'>Login</span></div><div class='details'><span class='hyperlink register-link'>Register</span></div><div class='fix'></div>", this.userBox);
				//jQuery(".login-link", this.userBoxDetails.element).click(this.clickProxy);
				//jQuery(".register-link", this.userBoxDetails.element).click(this.clickProxy);



			//	return;
			//}
			//LOG IN
			//if (response == UserEvents.LOGGED_IN && event.return_type == AnimateLoaderResponses.SUCCESS)
			//{
			//	this.projectBrowser.enabled = true;

			//	//this.closeButton.element.show();

			//	//Remove links and create normal login section
			//	//jQuery(".login-link", this.userBoxDetails.element).unbind();
			//	//jQuery(".register-link", this.userBoxDetails.element).unbind();

   //             var user = User.get;
   //             Compiler.digest(this.welcomeBackground, this);
			//	//this.userBoxDetails.element.remove();
			//	//this.userBoxDetails = new Component("<div class='details'>" + user.username + "</div><div class='details'><div class='hyperlink logout-link'>Logout</div></div><div class='fix'></div>", this.userBox);
			//	//jQuery(".logout-link", this.userBoxDetails.element).click(this.clickProxy);

			//	//Fill project list
			//	user.downloadProjects();

			//	//Go back to main window
   //             //this.loginBack.element.trigger("click");
   //             jQuery(".splash-login-user .close-but").trigger("click");
			//	return;
			//}
			//if (response == UserEvents.PROJECT_DELETED)
			//{
			//	if (event.return_type == AnimateLoaderResponses.ERROR )
			//		MessageBox.show(event.message, ["Ok"], null, null );

				//Refresh the projects
			//	User.get.downloadProjects();
			//	return;
			//}
			//else if ( ( response == UserEvents.PROJECT_COPIED ) && event.return_type == AnimateLoaderResponses.SUCCESS )
			//	User.get.downloadProjects();
			//FILL PROJECTS LIST
			//else if ((response == UserEvents.PROJECTS_RECIEVED) && event.return_type == AnimateLoaderResponses.SUCCESS)
			//{
			//	this.projectBrowser.fill( event.tag )
			//}

			//this.loginError.element.show();
            //this.loginError.text = event.message;
            //this.$loginError = event.message;
            //Compiler.digest(this.welcomeBackground, this);
		//}

		onUserLoggedInCheck()
		{
			//User.get.removeEventListener( UserEvents.LOGGED_IN, this.onUserLoggedInCheck, this );
			//User.get.addEventListener( UserEvents.LOGGED_IN, this.onUserData, this );
			//User.get.addEventListener( UserEvents.LOGGED_OUT, this.onUserData, this );
			//User.get.addEventListener( UserEvents.FAILED, this.onUserData, this );
			//User.get.addEventListener( UserEvents.REGISTERED, this.onUserData, this );
			//User.get.addEventListener( UserEvents.PASSWORD_RESET, this.onUserData, this );
			//User.get.addEventListener( UserEvents.ACTIVATION_RESET, this.onUserData, this );
			//User.get.addEventListener( UserEvents.PROJECTS_RECIEVED, this.onUserData, this );
			//User.get.addEventListener( UserEvents.PROJECT_COPIED, this.onUserData, this );
			//User.get.addEventListener( UserEvents.PROJECT_DELETED, this.onUserData, this );

			this.initialized = true;
			this.createNewProjectPage();
			this.createWelcomePage();
			this.createLoginPage();
			this.createPluginsPage();
			this.createFinalScreen();
		}

		/**
		* Shows the window by adding it to a parent.
		*/
		show()
		{
			super.show(null, 0, 0, true);
			this.onWindowResized( null );
            
			if (this.initialized == false)
            {
                var that = this;
                User.get.authenticated().then(function (loggedIn: boolean)
                {
                    that.onUserLoggedInCheck();
                    that.refreshProjects();
                    Compiler.digest(that.welcomeBackground, that);

                }).fail(function(err: Error)
                {
                    MessageBox.show(err.message, ["Ok"], null, null);
                });
			}
            else
                jQuery("img", this.userImg.element).attr("src", User.get.meta.image);
        }

		/**
		* Gets the singleton reference of this class.
		* @returns {Splash}
		*/
		static get get() : Splash2
		{
			if (!Splash2._singleton)
				new Splash2();

			return Splash2._singleton;
		}
	}
}