module Animate
{
	export class Splash extends Window
	{
		private static _singleton: Splash;

		private welcomeBackground: Component;
		private newProjectBackground: Component;
		private loginBackground: Component;
		private pluginsBackground: Component;
		private finalScreen: Component;
		private projectError: Label;
		private projectName: InputBox;
		private finalError: Label;
		private projectBack: Button;
		private projectNext: Button;
		private finalButton: Button;
		private projectDesc: InputBox;
		private loginBack: Component;
		private loginUsername: InputBox;
		private loginPassword: InputBox;
		private loginRemembeMe: Checkbox;
		private loginReset: Label;
		private regUsername: InputBox;
		private regEmail: InputBox;
		private regPassword: InputBox;
		private regPasswordCheck: InputBox;
		private loginResend: Label;
		private project :Component;
		private news :Component;
		private userBox :Component;
		private closeButton :Component;
		private userImg :Component;
		private userBoxDetails :Component;
		private response: string;
		private pluginLoader: ProjectLoader;
		private projectBrowser: ProjectBrowser;
		private login :Button;
		private register : Button;
		private loginError: Label;		
		private pluginBrowser: PluginBrowser;
		private clickProxy: any;
		private animateProxy: any;
		private initialized: boolean;
		private slideTime: number;

		constructor()
		{
			super(800, 520);

			if (Splash._singleton != null)
				throw new Error("The Splash class is a singleton. You need to call the Splash.get() function.");

			Splash._singleton = this;

			
			this.element.addClass("splash-window");

			this.welcomeBackground = new Component("<div class='splash-outer-container splash-welcome'></div>", this.content);
			this.newProjectBackground = new Component("<div style='left:800px;' class='splash-outer-container splash-new-project'></div>", this.content);
			this.loginBackground = new Component("<div style='top:-520px;' class='splash-outer-container splash-login-user'></div>", this.content);
			this.pluginsBackground = new Component("<div style='left:800px;' class='splash-outer-container splash-plugins'></div>", this.content);
			this.finalScreen = new Component("<div style='left:800px;' class='splash-outer-container splash-final-screen'></div>", this.content);

			this.clickProxy = this.onButtonClick.bind( this);
			this.animateProxy = this.enableButtons.bind(this);
			this.initialized = false;
			this.slideTime = 500;

			this.modalBackdrop.css({ "z-index": "900" });
			this.element.css({ "z-index": "901" });			
		}

		/**
		* This function can be called to reset all the splash variables and states.absolute
		* This is called from Animate when we click the home button.
		* @returns {any} 
		*/
		reset()
		{
			this.welcomeBackground.element.css({ "left": "0px", "top": "0px" });
			this.newProjectBackground.element.css({ "left": "800px" });
			this.loginBackground.element.css({ "top": "-520px" });
			this.pluginsBackground.element.css({ "left": "800px" });
			this.finalScreen.element.css({ "left": "800px" });

			this.enableButtons(true);

			this.projectError.element.hide();
			this.finalError.element.hide();
			this.loginError.element.hide();

			this.closeButton.element.show();

			this.loginUsername.textfield.element.removeClass("red-border");
			this.loginPassword.textfield.element.removeClass("red-border");
			this.regUsername.textfield.element.removeClass("red-border");
			this.regPassword.textfield.element.removeClass("red-border");
			this.regPasswordCheck.textfield.element.removeClass("red-border");
			this.regEmail.textfield.element.removeClass("red-border");

			this.projectName.textfield.element.removeClass("red-border");
			this.projectDesc.textfield.element.removeClass("red-border");

			//Refresh the projects
			User.getSingleton().downloadProjects();
			return;
		}

		/**
		* Enables the buttons based on the value parameter
		* @param <bool> value 
		*/
		enableButtons(value)
		{
			if (typeof value !== "undefined")
			{
				this.projectBack.enabled = value;
				this.projectNext.enabled = value;
				this.finalButton.enabled = value;
				this.login.enabled = value;
				this.loginBack.enabled = value;
				this.register.enabled = value;
			}
			else
			{
				this.projectBack.enabled = true;
				this.projectNext.enabled = true;
				this.finalButton.enabled = true;
				this.login.enabled = true;
				this.loginBack.enabled = true;
				this.register.enabled = true;
			}
		}

		/**
		* Creates the new project page on the splash screen
		*/
		createNewProjectPage()
		{
			var heading = new Label("Create New Project", this.newProjectBackground)
			heading.element.addClass("heading");

			//Create container div
			var project = new Component("<div class='splash-new-project-sub'></div>", this.newProjectBackground);

			//Create inputs
			new Label("Project Name", project);
			this.projectName = new InputBox(project, "");
			var sub = new Label("Please enter the name of your project.", project);
			sub.textfield.element.addClass("instruction-text");

			new Label("Project Description", project);
			this.projectDesc = new InputBox(project, "", true);

			sub = new Label("Optionally give a description of your project.", project);
			sub.textfield.element.addClass("instruction-text");

			//Create continue Button
			this.projectBack = new Button("Back", project);
			this.projectNext = new Button("Next", project);
			this.projectNext.css({ width: 100, height: 40 });
			this.projectBack.css({ width: 100, height: 40 });

			//Error label
			this.projectError = new Label("", project);
			this.projectError.element.hide();
			this.projectError.textfield.element.css({ color: "#ff0000", clear: "both" });

			this.projectNext.element.click(this.clickProxy);
			this.projectBack.element.click(this.clickProxy);
		}

		/**
		* Creates the new plugins page on the splash screen
		*/
		createPluginsPage()
		{
			//Add the explorer
			this.pluginBrowser = new PluginBrowser(this.pluginsBackground);
			this.pluginBrowser.addEventListener(PluginBrowserEvents.PLUGINS_IMPLEMENTED, this.onPluginResponse, this);
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

			this.pluginLoader.addEventListener(ProjectLoaderEvents.READY, this.onProjectLoaderResponse, this);
			this.pluginLoader.addEventListener(ProjectLoaderEvents.FAILED, this.onProjectLoaderResponse, this);
		}

		/**
		* @type public mfunc createLoginPage
		* Creates the login page on the Splash menu
		* @extends <Splash>
		*/
		createLoginPage()
		{
			this.loginBack = new Component("<div class='close-but'>X</div>", this.loginBackground);
			var heading = new Label("User Login", this.loginBackground);

			heading.element.addClass("heading");
			heading.textfield.element.prepend("<img src='media/blank-user.png' />");
			heading.element.append("<div class='fix'></div>");

			//Create container div and main elements
			var sub = new Component("<div></div>", this.loginBackground);
			this.loginBackground.element.append("<div class='fix'></div>");
			var login = new Component("<div class='splash-section'></div>", sub);
			var register = new Component("<div class='splash-section splash-section-right'></div>", sub);

			//Create login form
			new Label("Username:", login);
			this.loginUsername = new InputBox(login, "");
			new Label("Password:", login);
			this.loginPassword = new InputBox(login, "", false, true);
			this.loginRemembeMe = new Checkbox(login, "Remember me", true);

			this.loginReset = new Label("Reset Password", login);
			this.loginReset.element.addClass("hyperlink");
			this.loginResend = new Label("Resend Activation Email", login);
			this.loginResend.element.addClass("hyperlink");
			this.loginResend.element.css({ "margin": "20px 0 0 0" });

			//Create register form
			new Label("Username:", register);
			this.regUsername = new InputBox(register, "");
			new Label("Email:", register);
			this.regEmail = new InputBox(register, "");
			new Label("Password:", register);
			this.regPassword = new InputBox(register, "", false, true);
			new Label("Retype Password:", register);
			this.regPasswordCheck = new InputBox(register, "", false, true);
			register.element.append("<div id='animate-captcha'></div>");

			jQuery('#animate-captcha').each(function ()
			{
				if ( (<any>window).Recaptcha)
					Recaptcha.create("6LdiW-USAAAAAGxGfZnQEPP2gDW2NLZ3kSMu3EtT", this, { theme: "white" });
			});


			//Create Buttons
			this.login = new Button("Login", login);
			this.register = new Button("Register", register);


			this.login.css({ width: "", height: 40 });
			this.register.css({ width: "", height: 40 });

			//Error label
			this.loginError = new Label("", this.loginBackground);
			this.loginError.element.hide();
			this.loginError.textfield.element.css({ color: "#ff0000", clear: "both", "font-size": "14px", "text-align": "center", "margin-top": "0px", "font-weight": "bold" });

			this.login.element.click(this.clickProxy);
			this.register.element.click(this.clickProxy);
			this.loginBack.element.click(this.clickProxy);
			this.loginReset.element.click(this.clickProxy);
			this.loginResend.element.click(this.clickProxy);
		}

		/**
		* Checks each of the login fields based on which button was pressed.
		* @param {any} button 
		*/
		validateLogins(button)
		{
			this.loginUsername.textfield.element.removeClass("red-border");
			this.loginPassword.textfield.element.removeClass("red-border");
			this.regUsername.textfield.element.removeClass("red-border");
			this.regPassword.textfield.element.removeClass("red-border");
			this.regPasswordCheck.textfield.element.removeClass("red-border");
			this.regEmail.textfield.element.removeClass("red-border");

			if (this.loginReset == button || this.loginResend == button)
			{
				//Check username
				var message = jQuery.trim(this.loginUsername.text)
				if (message == "")
				{
					this.loginError.element.show();
					this.loginError.text = "Please enter your username or email";
					this.loginUsername.textfield.element.addClass("red-border");
					this.enableButtons(true);
					return false;
				}
			}
			if (this.login == button)
			{
				//Check username
				var message: string = Utils.checkForSpecialChars(this.loginUsername.text)
				if (message)
				{
					this.loginError.element.show();
					this.loginError.text = message;
					this.loginUsername.textfield.element.addClass("red-border");
					this.enableButtons(true);
					return false;
				}

				//Check password
				message = Utils.checkForSpecialChars(this.loginPassword.text)
				if (message)
				{
					this.loginError.element.show();
					this.loginError.text = message;
					this.loginPassword.textfield.element.addClass("red-border");
					this.enableButtons(true);
					return false;
				}
			}
			else if (this.loginReset != button && this.loginResend != button)
			{
				//Check username
				var message: string = Utils.checkForSpecialChars(this.regUsername.text)
				if (message)
				{
					this.loginError.element.show();
					this.loginError.text = message;
					this.regUsername.textfield.element.addClass("red-border");
					this.enableButtons(true);
					return false;
				}

				//Check email
				var emailValid: boolean = Utils.validateEmail(this.regEmail.text)
				if (!emailValid)
				{
					this.loginError.element.show();
					this.loginError.text = "Please enter a valid email address.";
					this.regEmail.textfield.element.addClass("red-border");
					this.enableButtons(true);
					return false;
				}

				//Check password
				message = Utils.checkForSpecialChars(this.regPassword.text)
				if (message)
				{
					this.loginError.element.show();
					this.loginError.text = message;
					this.regPassword.textfield.element.addClass("red-border");
					this.enableButtons(true);
					return false;
				}

				//Make sure passwords match
				if (this.regPassword.text != this.regPasswordCheck.text)
				{
					this.regPassword.textfield.element.addClass("red-border");
					this.regPasswordCheck.textfield.element.addClass("red-border");
					this.loginError.element.show();
					this.loginError.text = "Your passwords do not match.";
					this.enableButtons(true);
					return false;
				}
			}

			return true;
		}
		/**
		* Checks each of the fields for creating a new project.
		*/
		validateNewProject()
		{
			this.projectName.textfield.element.removeClass("red-border");
			this.projectDesc.textfield.element.removeClass("red-border");
			this.projectError.element.hide();

			//Check for errors
			var message = Utils.checkForSpecialChars(this.projectName.text);
			if (message != null)
			{
				this.projectError.text = message;
				this.projectError.element.show();
				this.projectName.textfield.element.addClass("red-border");
				this.enableButtons(true);
				return;
			}

			return true;
		}

		/**
		* Creates the first page on the splash screen
		*/
		createWelcomePage()
		{
			var user : User = User.getSingleton();

			var sub = new Component("<div class='splash-container'></div>", this.welcomeBackground);
			this.project = new Component("<div class='splash-section'></div>", sub);
			this.news = new Component("<div class='splash-section'></div>", sub);

			this.userBox = <Component>this.news.addChild("<div class='splash-user-box'></div>");
			this.closeButton = new Component("<div class='close-but'>X</div>", this.userBox);
			this.userImg = new Component("<div class='details'><img src='" + user.imgURL + "' /></div>", this.userBox);


			this.news.addChild("<div class='welcome'>Welcome to Animate</div>");
			var newsBox : Component = <Component>this.news.addChild("<div class='news'></div>");

			//Get ajax news
			newsBox.element.html("Hello and welcome back to Animate. If you're new around these parts, let's get you up and running in just a few minutes. Click the below button to learn how to create your very first Animate project. <br /><a href=\"javascript:window.open('https://webinate.net/tutorials-popup/','Animate Tutorials','width=1000,height=800')\"><div class='getting-started'><img src='media/play-arrow.png'/>Tutorial Videos</div></div></a>");


			//login sections	
			if ( user.isLoggedIn )
			{
				this.userBoxDetails = new Component("<div class='details'>" + user.username + "</div><div class='details'><div class='hyperlink logout-link'>Logout</div></div><div class='fix'></div>", this.userBox);
				jQuery(".logout-link", this.userBoxDetails.element).click(this.clickProxy);
				user.downloadProjects();
				this.closeButton.element.show();
			}
			else
			{
				this.userBoxDetails = new Component("<div class='details'><span class='hyperlink login-link'>Login</span></div><div class='details'><span class='hyperlink register-link'>Register</span></div><div class='fix'></div>", this.userBox);
				jQuery(".login-link", this.userBoxDetails.element).click(this.clickProxy);
				jQuery(".register-link", this.userBoxDetails.element).click(this.clickProxy);
				this.closeButton.element.hide();
			}

			this.projectBrowser = new ProjectBrowser(this.project);
			this.projectBrowser.addEventListener(ProjectBrowserEvents.COMBO, this.onProjectCombo, this);
			this.closeButton.element.click(this.clickProxy);
		}


		/**
		* Shows the window by adding it to a parent.
		*/
		onProjectCombo( response: ProjectBrowserEvents, event: ProjectBrowserEvent)
		{
			var user: User = User.getSingleton();

			if ( !user.isLoggedIn )
				return MessageBox.show("Please log in", ["Ok"], null, null );

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

				this.welcomeBackground.element.animate({ left: '-=800' }, this.slideTime, this.animateProxy);
				this.newProjectBackground.element.animate( { left: '-=800' }, this.slideTime, this.animateProxy );
				this.projectName.focus();
			}
			//WELCOME - Open project
			else if ( event.command == "Open")
			{
				if (this.projectBrowser.selectedItem == null)
				{
					this.enableButtons(true);
					return;
				}

				
				var user = User.getSingleton();
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
				user.addEventListener( UserEvents.PROJECT_OPENED, this.onProjectData, this );
				user.openProject( this.projectBrowser.selectedID );

			}
			//WELCOME - Delete project
			else if ( event.command == "Delete")
			{
				if (this.projectBrowser.selectedItem == null)
				{
					this.enableButtons(true);
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
					this.enableButtons(true);
					return;
				}

				if (this.projectBrowser.selectedItem)
					MessageBox.show("Are you sure you want to duplicate '" + this.projectBrowser.selectedName + "'?",
						["Yes", "No"], this.onCopyMessageBox, this);

			}
		}


		/**
		* When we click a button
		* @param {any} e 
		*/
		onButtonClick(e)
		{
			this.enableButtons(false);

			var comp = jQuery(e.currentTarget).data("component");


			//WELCOME - Login
			if (jQuery(e.currentTarget).is(".login-link") || jQuery(e.currentTarget).is(".register-link"))
			{
				this.loginError.element.hide();
				this.loginPassword.text = "";
				this.welcomeBackground.element.animate({ top: '+=520' }, this.slideTime, this.animateProxy);
				this.loginBackground.element.animate({ top: '+=520' }, this.slideTime, this.animateProxy);
			}
			//WELCOME - Logout
			else if (jQuery(e.currentTarget).is(".logout-link"))
			{
				User.getSingleton().logout();
				Application.getInstance().projectReset();
			}
			//WELCOME - Close
			else if (comp == this.closeButton)
			{
				this.hide();

			}
			//LOGIN - back
			else if (comp == this.loginBack)
			{
				this.welcomeBackground.element.animate({ top: '-=520' }, this.slideTime, this.animateProxy);
				this.loginBackground.element.animate({ top: '-=520' }, this.slideTime, this.animateProxy);
			}
			//LOGIN - reset password
			else if (comp == this.loginReset)
			{
				if (this.validateLogins(this.loginReset))
					User.getSingleton().resetPassword(this.loginUsername.text);
			}
			//LOGIN - resend activation
			else if (comp == this.loginResend)
			{
				if (this.validateLogins(this.loginResend))
					User.getSingleton().resendActivation(this.loginUsername.text);
			}
			//LOGIN - login
			else if (comp == this.login)
			{
				if (this.validateLogins(this.login))
					User.getSingleton().login(this.loginUsername.text, this.loginPassword.text, this.loginRemembeMe.checked );
			}
			//LOGIN - register
			else if (comp == this.register)
			{
				if (this.validateLogins(this.register))
					User.getSingleton().register(this.regUsername.text, this.regPassword.text, this.regEmail.text, jQuery("#recaptcha_response_field").val(), jQuery("#recaptcha_challenge_field").val() );
			}
			//PROJECT SCREEN - back
			else if (comp == this.projectBack)
			{
				this.welcomeBackground.element.animate({ left: '+=800' }, this.slideTime, this.animateProxy);
				this.newProjectBackground.element.animate( { left: '+=800' }, this.slideTime, this.animateProxy );
				this.projectName.text = "";
				this.projectDesc.text = "";

				//refil the projects
				this.projectBrowser.clearItems();
				User.getSingleton().downloadProjects();
			}
			//PROJECT SCREEN - Next
			else if (comp == this.projectNext)
			{
				if (this.validateNewProject())
				{
					var user = User.getSingleton();
					user.addEventListener( UserEvents.PROJECT_CREATED, this.onProjectData, this );
					user.addEventListener( UserEvents.FAILED, this.onProjectData, this );
					user.createProject( this.projectName.text, this.projectDesc.text );
				}
			}
			//FINAL SCREEN - FINISHED
			else if (comp == this.finalButton)
			{
				if (this.pluginLoader.errorOccured)
					MessageBox.show("Not all your behviours loaded correctly. Do you want to continue anyway?",
						["Yes", "No"], this.onFinalMessageBox, this);
				else
					this.hide();
			}
		}


		/**
		* This is called when we click a button on the message box.
		* @param {string} response 
		*/
		onProjectOpenMessageBox( response : string )
		{
			this.enableButtons(true);
			if (response == "Yes")
			{
				var user = User.getSingleton();

				//If a project already exists - warn the user it will have to be closed.
				if (user.project)
				{
					user.removeEventListener( UserEvents.PROJECT_CREATED, this.onProjectData, this );
					user.removeEventListener( UserEvents.FAILED, this.onProjectData, this );
					user.removeEventListener( UserEvents.PROJECT_OPENED, this.onProjectData, this );
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
			this.enableButtons(true);

			if (response == "Yes")
				User.getSingleton().copyProject(this.projectBrowser.selectedID);
		}

		/**
		* This is called when we click a button on the message box.
		* @param {any} response 
		*/
		onMessageBox(response)
		{
			this.enableButtons(true);

			if (response == "Yes")
				User.getSingleton().deleteProject(this.projectBrowser.selectedID);
		}

		/**
		* This is called when we click a button on the message box.
		* @param {any} response 
		*/
		onFinalMessageBox(response)
		{
			this.enableButtons(true);
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
			var user : User = User.getSingleton();
			user.removeEventListener( UserEvents.PROJECT_CREATED, this.onProjectData, this );
			user.removeEventListener( UserEvents.FAILED, this.onProjectData, this );
			user.removeEventListener( UserEvents.PROJECT_OPENED, this.onProjectData, this );

			if ( response == UserEvents.FAILED)
			{
				this.projectError.text = data.message;
				this.projectError.element.show();
				this.enableButtons(true);
				return;
			}
			if ( response == UserEvents.PROJECT_OPENED )
			{
				this.welcomeBackground.element.animate({ left: '-=800' }, this.slideTime, this.animateProxy);
				this.pluginsBackground.element.animate({ left: '-=800' }, this.slideTime, this.animateProxy);
				this.pluginBrowser.reset();
				this.enableButtons(true);
			}
			else
			{
				//Project created - go to plugins screen!		
				this.newProjectBackground.element.animate({ left: '-=800' }, this.slideTime, this.animateProxy);
				this.pluginsBackground.element.animate({ left: '-=800' }, this.slideTime, this.animateProxy);
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
				this.pluginsBackground.element.animate({ left: '-=800' }, this.slideTime, this.animateProxy);
				this.finalScreen.element.animate({ left: '-=800' }, this.slideTime, this.animateProxy);
				this.pluginLoader.startLoading();
			}
			else
			{
				//this.pluginError.element.fadeIn();
				//this.pluginError.text = data.message;
				this.enableButtons(true);
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
		onUserData(response: UserEvents, event : UserEvent)
		{
			if ( ( response == UserEvents.FAILED || response == UserEvents.LOGGED_IN || response == UserEvents.REGISTERED ) && event.return_type != AnimateLoaderResponses.SUCCESS )
			{
				Recaptcha.reload();
				MessageBox.show( event.message, ["Ok"], null, null );
			}

			//LOG OUT
			this.enableButtons(true);
			if (response == UserEvents.LOGGED_OUT && event.return_type == AnimateLoaderResponses.SUCCESS)
			{
				this.projectBrowser.enabled = false;
				this.projectBrowser.clearItems();

				//Remove links and create normal login section
				jQuery(".logout-link", this.userBoxDetails.element).unbind();

				this.closeButton.element.hide();

				this.userBoxDetails.element.remove();
				this.userBoxDetails = new Component("<div class='details'><span class='hyperlink login-link'>Login</span></div><div class='details'><span class='hyperlink register-link'>Register</span></div><div class='fix'></div>", this.userBox);
				jQuery(".login-link", this.userBoxDetails.element).click(this.clickProxy);
				jQuery(".register-link", this.userBoxDetails.element).click(this.clickProxy);



				return;
			}
			//LOG IN
			else if (response == UserEvents.LOGGED_IN && event.return_type == AnimateLoaderResponses.SUCCESS)
			{
				this.projectBrowser.enabled = true;

				this.closeButton.element.show();

				//Remove links and create normal login section
				jQuery(".login-link", this.userBoxDetails.element).unbind();
				jQuery(".register-link", this.userBoxDetails.element).unbind();

				var user = User.getSingleton();
				this.userBoxDetails.element.remove();
				this.userBoxDetails = new Component("<div class='details'>" + user.username + "</div><div class='details'><div class='hyperlink logout-link'>Logout</div></div><div class='fix'></div>", this.userBox);
				jQuery(".logout-link", this.userBoxDetails.element).click(this.clickProxy);

				//Fill project list
				user.downloadProjects();

				//Go back to main window
				this.loginBack.element.trigger("click");
				return;
			}
			else if (response == UserEvents.PROJECT_DELETED)
			{
				if (event.return_type == AnimateLoaderResponses.ERROR )
					MessageBox.show(event.message, ["Ok"], null, null );

				//Refresh the projects
				User.getSingleton().downloadProjects();
				return;
			}
			else if ( ( response == UserEvents.PROJECT_COPIED ) && event.return_type == AnimateLoaderResponses.SUCCESS )
				User.getSingleton().downloadProjects();
			//FILL PROJECTS LIST
			else if ((response == UserEvents.PROJECTS_RECIEVED) && event.return_type == AnimateLoaderResponses.SUCCESS)
			{
				this.projectBrowser.fill( event.tag )
			}

			this.loginError.element.show();
			this.loginError.text = event.message;
		}

		onUserLoggedInCheck( response: UserEvents, event: UserEvent, sender?: EventDispatcher )
		{
			User.getSingleton().removeEventListener( UserEvents.LOGGED_IN, this.onUserLoggedInCheck, this );

			User.getSingleton().addEventListener( UserEvents.LOGGED_IN, this.onUserData, this );
			User.getSingleton().addEventListener( UserEvents.LOGGED_OUT, this.onUserData, this );
			User.getSingleton().addEventListener( UserEvents.FAILED, this.onUserData, this );
			User.getSingleton().addEventListener( UserEvents.REGISTERED, this.onUserData, this );
			User.getSingleton().addEventListener( UserEvents.PASSWORD_RESET, this.onUserData, this );
			User.getSingleton().addEventListener( UserEvents.ACTIVATION_RESET, this.onUserData, this );
			User.getSingleton().addEventListener( UserEvents.PROJECTS_RECIEVED, this.onUserData, this );
			User.getSingleton().addEventListener( UserEvents.PROJECT_COPIED, this.onUserData, this );
			User.getSingleton().addEventListener( UserEvents.PROJECT_DELETED, this.onUserData, this );

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
				User.getSingleton().addEventListener( UserEvents.LOGGED_IN, this.onUserLoggedInCheck, this );
                User.getSingleton().updatedLoggedIn();
                User.getSingleton().authenticated().then(function (val)
                {
                })
			}
			else
				jQuery( "img", this.userImg.element ).attr("src", User.getSingleton().imgURL );
		}


		/**
		* Gets the singleton reference of this class.
		* @returns {Splash}
		*/
		static getSingleton() : Splash
		{
			if (!Splash._singleton)
				new Splash();

			return Splash._singleton;
		}
	}
}