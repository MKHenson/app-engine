var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Animate;
(function (Animate) {
    var Splash = (function (_super) {
        __extends(Splash, _super);
        function Splash() {
            _super.call(this, 800, 520);

            if (Splash._singleton != null)
                throw new Error("The Splash class is a singleton. You need to call the Splash.get() function.");

            Splash._singleton = this;

            this.element.addClass("splash-window");

            this.welcomeBackground = new Animate.Component("<div class='splash-outer-container splash-welcome'></div>", this.content);
            this.newProjectBackground = new Animate.Component("<div style='left:800px;' class='splash-outer-container splash-new-project'></div>", this.content);
            this.loginBackground = new Animate.Component("<div style='top:-520px;' class='splash-outer-container splash-login-user'></div>", this.content);
            this.pluginsBackground = new Animate.Component("<div style='left:800px;' class='splash-outer-container splash-plugins'></div>", this.content);
            this.finalScreen = new Animate.Component("<div style='left:800px;' class='splash-outer-container splash-final-screen'></div>", this.content);

            this.clickProxy = this.onButtonClick.bind(this);

            //this.dataProxy = this.onProjectData.bind(this);
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
        Splash.prototype.reset = function () {
            this.welcomeBackground.element.css({ "left": "0px", "top": "0px" });
            this.newProjectBackground.element.css({ "left": "800px" });
            this.loginBackground.element.css({ "top": "-520px" });
            this.pluginsBackground.element.css({ "left": "800px" });
            this.finalScreen.element.css({ "left": "800px" });

            this.enableButtons(true);

            this.projectError.element.hide();

            //this.pluginError.element.hide();
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
            Animate.User.getSingleton().getProjects();
            return;
        };

        /**
        * Enables the buttons based on the value parameter
        * @param <bool> value
        */
        Splash.prototype.enableButtons = function (value) {
            if (typeof value !== "undefined") {
                this.projectBack.enabled = value;
                this.projectNext.enabled = value;
                this.finalButton.enabled = value;
                this.login.enabled = value;
                this.loginBack.enabled = value;
                this.register.enabled = value;
            } else {
                this.projectBack.enabled = true;
                this.projectNext.enabled = true;
                this.finalButton.enabled = true;
                this.login.enabled = true;
                this.loginBack.enabled = true;
                this.register.enabled = true;
            }
        };

        /**
        * Creates the new project page on the splash screen
        */
        Splash.prototype.createNewProjectPage = function () {
            var heading = new Animate.Label("Create New Project", this.newProjectBackground);
            heading.element.addClass("heading");

            //Create container div
            var project = new Animate.Component("<div class='splash-new-project-sub'></div>", this.newProjectBackground);

            //Create inputs
            new Animate.Label("Project Name", project);
            this.projectName = new Animate.InputBox(project, "");
            var sub = new Animate.Label("Please enter the name of your project.", project);
            sub.textfield.element.addClass("instruction-text");

            new Animate.Label("Project Description", project);
            this.projectDesc = new Animate.InputBox(project, "", true);

            sub = new Animate.Label("Optionally give a description of your project.", project);
            sub.textfield.element.addClass("instruction-text");

            //Create continue Button
            this.projectBack = new Animate.Button("Back", project);
            this.projectNext = new Animate.Button("Next", project);
            this.projectNext.css({ width: 100, height: 40 });
            this.projectBack.css({ width: 100, height: 40 });

            //Error label
            this.projectError = new Animate.Label("", project);
            this.projectError.element.hide();
            this.projectError.textfield.element.css({ color: "#ff0000", clear: "both" });

            this.projectNext.element.click(this.clickProxy);
            this.projectBack.element.click(this.clickProxy);
        };

        /**
        * Creates the new plugins page on the splash screen
        */
        Splash.prototype.createPluginsPage = function () {
            //Add the explorer
            this.pluginBrowser = new Animate.PluginBrowser(this.pluginsBackground);
            this.pluginBrowser.addEventListener(Animate.PluginBrowserEvents.PLUGINS_IMPLEMENTED, this.onPluginResponse, this);
        };

        /**
        * Creates the final screen.
        * This screen loads each of the plugins and allows the user to enter the application.
        */
        Splash.prototype.createFinalScreen = function () {
            //Heading
            var heading = new Animate.Label("Setting up workspace", this.finalScreen);
            heading.element.addClass("heading");

            //Info
            var sub = new Animate.Label("Please wait while we load and initialise your behaviours.", this.finalScreen);
            sub.textfield.element.addClass("instruction-text");

            //Add the explorer
            this.pluginLoader = new Animate.ProjectLoader(this.finalScreen);

            //Error label
            this.finalError = new Animate.Label("ERROR", this.finalScreen);
            this.finalError.element.hide();
            this.finalError.textfield.element.css({ color: "#ff0000", "height": "35px", "float": "left", "width": "300px", "padding-top": "2px", "margin-left": "10px" });

            //Create continue Button
            this.finalButton = new Animate.Button("Loading", this.finalScreen);
            this.finalButton.css({ width: 100, height: 30 });
            this.finalButton.element.click(this.clickProxy);
            this.finalButton.enabled = false;

            this.pluginLoader.addEventListener(Animate.ProjectLoaderEvents.READY, this.onProjectLoaderResponse, this);
            this.pluginLoader.addEventListener(Animate.ProjectLoaderEvents.FAILED, this.onProjectLoaderResponse, this);
        };

        /**
        * @type public mfunc createLoginPage
        * Creates the login page on the Splash menu
        * @extends <Splash>
        */
        Splash.prototype.createLoginPage = function () {
            this.loginBack = new Animate.Component("<div class='close-but'>X</div>", this.loginBackground);
            var heading = new Animate.Label("User Login", this.loginBackground);

            heading.element.addClass("heading");
            heading.textfield.element.prepend("<img src='media/blank-user.png' />");
            heading.element.append("<div class='fix'></div>");

            //Create container div and main elements
            var sub = new Animate.Component("<div></div>", this.loginBackground);
            this.loginBackground.element.append("<div class='fix'></div>");
            var login = new Animate.Component("<div class='splash-section'></div>", sub);
            var register = new Animate.Component("<div class='splash-section splash-section-right'></div>", sub);

            //Create login form
            new Animate.Label("Username:", login);
            this.loginUsername = new Animate.InputBox(login, "");
            new Animate.Label("Password:", login);
            this.loginPassword = new Animate.InputBox(login, "", false, true);
            this.loginRemembeMe = new Animate.Checkbox(login, "Remember me", true);

            this.loginReset = new Animate.Label("Reset Password", login);
            this.loginReset.element.addClass("hyperlink");
            this.loginResend = new Animate.Label("Resend Activation Email", login);
            this.loginResend.element.addClass("hyperlink");
            this.loginResend.element.css({ "margin": "20px 0 0 0" });

            //Create register form
            new Animate.Label("Username:", register);
            this.regUsername = new Animate.InputBox(register, "");
            new Animate.Label("Email:", register);
            this.regEmail = new Animate.InputBox(register, "");
            new Animate.Label("Password:", register);
            this.regPassword = new Animate.InputBox(register, "", false, true);
            new Animate.Label("Retype Password:", register);
            this.regPasswordCheck = new Animate.InputBox(register, "", false, true);
            register.element.append("<div id='animate-captcha'></div>");

            jQuery('#animate-captcha').each(function () {
                if ((window).Recaptcha)
                    Recaptcha.create("6LdiW-USAAAAAGxGfZnQEPP2gDW2NLZ3kSMu3EtT", this, { theme: "white" });
            });

            //Create Buttons
            this.login = new Animate.Button("Login", login);
            this.register = new Animate.Button("Register", register);

            this.login.css({ width: "", height: 40 });
            this.register.css({ width: "", height: 40 });

            //Error label
            this.loginError = new Animate.Label("", this.loginBackground);
            this.loginError.element.hide();
            this.loginError.textfield.element.css({ color: "#ff0000", clear: "both", "font-size": "14px", "text-align": "center", "margin-top": "0px", "font-weight": "bold" });

            this.login.element.click(this.clickProxy);
            this.register.element.click(this.clickProxy);
            this.loginBack.element.click(this.clickProxy);
            this.loginReset.element.click(this.clickProxy);
            this.loginResend.element.click(this.clickProxy);
        };

        /**
        * Checks each of the login fields based on which button was pressed.
        * @param {any} button
        */
        Splash.prototype.validateLogins = function (button) {
            this.loginUsername.textfield.element.removeClass("red-border");
            this.loginPassword.textfield.element.removeClass("red-border");
            this.regUsername.textfield.element.removeClass("red-border");
            this.regPassword.textfield.element.removeClass("red-border");
            this.regPasswordCheck.textfield.element.removeClass("red-border");
            this.regEmail.textfield.element.removeClass("red-border");

            if (this.loginReset == button || this.loginResend == button) {
                //Check username
                var message = jQuery.trim(this.loginUsername.text);
                if (message == "") {
                    this.loginError.element.show();
                    this.loginError.text = "Please enter your username or email";
                    this.loginUsername.textfield.element.addClass("red-border");
                    this.enableButtons(true);
                    return false;
                }
            }
            if (this.login == button) {
                //Check username
                var message = Animate.Utils.checkForSpecialChars(this.loginUsername.text);
                if (message) {
                    this.loginError.element.show();
                    this.loginError.text = message;
                    this.loginUsername.textfield.element.addClass("red-border");
                    this.enableButtons(true);
                    return false;
                }

                //Check password
                message = Animate.Utils.checkForSpecialChars(this.loginPassword.text);
                if (message) {
                    this.loginError.element.show();
                    this.loginError.text = message;
                    this.loginPassword.textfield.element.addClass("red-border");
                    this.enableButtons(true);
                    return false;
                }
            } else if (this.loginReset != button && this.loginResend != button) {
                //Check username
                var message = Animate.Utils.checkForSpecialChars(this.regUsername.text);
                if (message) {
                    this.loginError.element.show();
                    this.loginError.text = message;
                    this.regUsername.textfield.element.addClass("red-border");
                    this.enableButtons(true);
                    return false;
                }

                //Check email
                var emailValid = Animate.Utils.validateEmail(this.regEmail.text);
                if (!emailValid) {
                    this.loginError.element.show();
                    this.loginError.text = "Please enter a valid email address.";
                    this.regEmail.textfield.element.addClass("red-border");
                    this.enableButtons(true);
                    return false;
                }

                //Check password
                message = Animate.Utils.checkForSpecialChars(this.regPassword.text);
                if (message) {
                    this.loginError.element.show();
                    this.loginError.text = message;
                    this.regPassword.textfield.element.addClass("red-border");
                    this.enableButtons(true);
                    return false;
                }

                if (this.regPassword.text != this.regPasswordCheck.text) {
                    this.regPassword.textfield.element.addClass("red-border");
                    this.regPasswordCheck.textfield.element.addClass("red-border");
                    this.loginError.element.show();
                    this.loginError.text = "Your passwords do not match.";
                    this.enableButtons(true);
                    return false;
                }
            }

            return true;
        };

        /**
        * Checks each of the fields for creating a new project.
        */
        Splash.prototype.validateNewProject = function () {
            this.projectName.textfield.element.removeClass("red-border");
            this.projectDesc.textfield.element.removeClass("red-border");
            this.projectError.element.hide();

            //Check for errors
            var message = Animate.Utils.checkForSpecialChars(this.projectName.text);
            if (message != null) {
                this.projectError.text = message;
                this.projectError.element.show();
                this.projectName.textfield.element.addClass("red-border");
                this.enableButtons(true);
                return;
            }

            return true;
        };

        /**
        * Creates the first page on the splash screen
        */
        Splash.prototype.createWelcomePage = function () {
            var user = Animate.User.getSingleton();

            var sub = new Animate.Component("<div class='splash-container'></div>", this.welcomeBackground);
            this.project = new Animate.Component("<div class='splash-section'></div>", sub);
            this.news = new Animate.Component("<div class='splash-section'></div>", sub);

            this.userBox = this.news.addChild("<div class='splash-user-box'></div>");
            this.closeButton = new Animate.Component("<div class='close-but'>X</div>", this.userBox);
            this.userImg = new Animate.Component("<div class='details'><img src='" + user.imgURL + "' /></div>", this.userBox);

            this.news.addChild("<div class='welcome'>Welcome to Animate</div>");
            var newsBox = this.news.addChild("<div class='news'></div>");

            //Get ajax news
            newsBox.element.html("Hello and welcome back to Animate. If you're new around these parts, let's get you up and running in just a few minutes. Click the below button to learn how to create your very first Animate project. <br /><a href=\"javascript:window.open('https://webinate.net/tutorials-popup/','Animate Tutorials','width=1000,height=800')\"><div class='getting-started'><img src='media/play-arrow.png'/>Tutorial Videos</div></div></a>");

            if (user.isLoggedIn) {
                this.userBoxDetails = new Animate.Component("<div class='details'>" + user.username + "</div><div class='details'><div class='hyperlink logout-link'>Logout</div></div><div class='fix'></div>", this.userBox);
                jQuery(".logout-link", this.userBoxDetails.element).click(this.clickProxy);
                user.getProjects();
                this.closeButton.element.show();
            } else {
                this.userBoxDetails = new Animate.Component("<div class='details'><span class='hyperlink login-link'>Login</span></div><div class='details'><span class='hyperlink register-link'>Register</span></div><div class='fix'></div>", this.userBox);
                jQuery(".login-link", this.userBoxDetails.element).click(this.clickProxy);
                jQuery(".register-link", this.userBoxDetails.element).click(this.clickProxy);
                this.closeButton.element.hide();
            }

            this.projectBrowser = new Animate.ProjectBrowser(this.project);
            this.projectBrowser.addEventListener(Animate.ProjectBrowserEvents.COMBO, this.onProjectCombo, this);
            this.closeButton.element.click(this.clickProxy);
        };

        /**
        * Shows the window by adding it to a parent.
        */
        Splash.prototype.onProjectCombo = function (response, event) {
            if (event.command == "Create New") {
                var user = Animate.User.getSingleton();

                if (user.project) {
                    this.response = "newProject";
                    Animate.MessageBox.show("Are you sure you want to create a new project? Your open project will need to be closed.", ["Yes", "No"], this.onProjectOpenMessageBox, this);
                    return;
                }

                this.welcomeBackground.element.animate({ left: '-=800' }, this.slideTime, this.animateProxy);
                this.newProjectBackground.element.animate({ left: '-=800' }, this.slideTime, this.animateProxy);
                this.projectName.focus();
            } else if (event.command == "Open") {
                if (this.projectBrowser.selectedItem == null) {
                    this.enableButtons(true);
                    return;
                }

                var project = new Animate.Project(this.projectBrowser.selectedName, "", "");

                var user = Animate.User.getSingleton();
                if (user.project) {
                    this.response = "open";
                    Animate.MessageBox.show("Are you sure you want to create a new project? Your open project will need to be closed.", ["Yes", "No"], this.onProjectOpenMessageBox, this);
                    return;
                }

                //Set project
                user.project = project;
                project.id = this.projectBrowser.selectedID;
                user.project.addEventListener(Animate.ProjectEvents.OPENED, this.onProjectData, this);
                project.open();
            } else if (event.command == "Delete") {
                if (this.projectBrowser.selectedItem == null) {
                    this.enableButtons(true);
                    return;
                }

                if (this.projectBrowser.selectedItem)
                    Animate.MessageBox.show("Are you sure you want to delete '" + this.projectBrowser.selectedName + "'?", ["Yes", "No"], this.onMessageBox, this);
            } else if (event.command == "Copy") {
                if (this.projectBrowser.selectedItem == null) {
                    this.enableButtons(true);
                    return;
                }

                if (this.projectBrowser.selectedItem)
                    Animate.MessageBox.show("Are you sure you want to duplicate '" + this.projectBrowser.selectedName + "'?", ["Yes", "No"], this.onCopyMessageBox, this);
            }
        };

        /**
        * When we click a button
        * @param {any} e
        */
        Splash.prototype.onButtonClick = function (e) {
            this.enableButtons(false);

            var comp = jQuery(e.currentTarget).data("component");

            if (jQuery(e.currentTarget).is(".login-link") || jQuery(e.currentTarget).is(".register-link")) {
                this.loginError.element.hide();
                this.loginPassword.text = "";
                this.welcomeBackground.element.animate({ top: '+=520' }, this.slideTime, this.animateProxy);
                this.loginBackground.element.animate({ top: '+=520' }, this.slideTime, this.animateProxy);
            } else if (jQuery(e.currentTarget).is(".logout-link")) {
                Animate.User.getSingleton().logout();
                Animate.Application.getInstance().projectReset();
            } else if (comp == this.closeButton) {
                this.hide();
            } else if (comp == this.loginBack) {
                this.welcomeBackground.element.animate({ top: '-=520' }, this.slideTime, this.animateProxy);
                this.loginBackground.element.animate({ top: '-=520' }, this.slideTime, this.animateProxy);
            } else if (comp == this.loginReset) {
                if (this.validateLogins(this.loginReset))
                    Animate.User.getSingleton().resetPassword(this.loginUsername.text);
            } else if (comp == this.loginResend) {
                if (this.validateLogins(this.loginResend))
                    Animate.User.getSingleton().resendActivation(this.loginUsername.text);
            } else if (comp == this.login) {
                if (this.validateLogins(this.login))
                    Animate.User.getSingleton().login(this.loginUsername.text, this.loginPassword.text, this.loginRemembeMe.checked);
            } else if (comp == this.register) {
                if (this.validateLogins(this.register))
                    Animate.User.getSingleton().register(this.regUsername.text, this.regPassword.text, this.regEmail.text, jQuery("#recaptcha_response_field").val(), jQuery("#recaptcha_challenge_field").val());
            } else if (comp == this.projectBack) {
                this.welcomeBackground.element.animate({ left: '+=800' }, this.slideTime, this.animateProxy);
                this.newProjectBackground.element.animate({ left: '+=800' }, this.slideTime, this.animateProxy);
                this.projectName.text = "";
                this.projectDesc.text = "";

                //refil the projects
                this.projectBrowser.clearItems();
                Animate.User.getSingleton().getProjects();
            } else if (comp == this.projectNext) {
                if (this.validateNewProject()) {
                    var user = Animate.User.getSingleton();
                    var project = new Animate.Project(this.projectName.text, this.projectDesc.text);

                    //Set project
                    user.project = project;
                    user.project.addEventListener(Animate.ProjectEvents.SAVED, this.onProjectData, this);
                    user.project.addEventListener(Animate.ProjectEvents.FAILED, this.onProjectData, this);
                    project.createDBEntry();
                }
            } else if (comp == this.finalButton) {
                if (this.pluginLoader.errorOccured)
                    Animate.MessageBox.show("Not all your behviours loaded correctly. Do you want to continue anyway?", ["Yes", "No"], this.onFinalMessageBox, this);
else
                    this.hide();
            }
        };

        /**
        * This is called when we click a button on the message box.
        * @param {string} response
        */
        Splash.prototype.onProjectOpenMessageBox = function (response) {
            this.enableButtons(true);
            if (response == "Yes") {
                var user = Animate.User.getSingleton();

                if (user.project) {
                    user.project.removeEventListener(Animate.ProjectEvents.SAVED, this.onProjectData, this);
                    user.project.removeEventListener(Animate.ProjectEvents.FAILED, this.onProjectData, this);
                    user.project.removeEventListener(Animate.ProjectEvents.OPENED, this.onProjectData, this);
                }

                //Notif of the reset
                Animate.Application.getInstance().projectReset();
            } else
                return;

            if (this.response == "newProject")
                this.onProjectCombo(null, new Animate.ProjectBrowserEvent(Animate.ProjectBrowserEvents.COMBO, "Create New"));
else
                this.onProjectCombo(null, new Animate.ProjectBrowserEvent(Animate.ProjectBrowserEvents.COMBO, "Open"));
        };

        /**
        * This is called when we click a button on the message box.
        * @param {any} response
        */
        Splash.prototype.onCopyMessageBox = function (response) {
            this.enableButtons(true);

            if (response == "Yes")
                Animate.User.getSingleton().copyProject(this.projectBrowser.selectedID);
        };

        /**
        * This is called when we click a button on the message box.
        * @param {any} response
        */
        Splash.prototype.onMessageBox = function (response) {
            this.enableButtons(true);

            if (response == "Yes")
                Animate.User.getSingleton().deleteProject(this.projectBrowser.selectedID);
        };

        /**
        * This is called when we click a button on the message box.
        * @param {any} response
        */
        Splash.prototype.onFinalMessageBox = function (response) {
            this.enableButtons(true);
            if (response == "Yes") {
                this.hide();
                Animate.Application.getInstance().projectReady();
            }
        };

        /**
        * This is called when we receive data from the projects.
        */
        Splash.prototype.onProjectData = function (response, data) {
            if (response == Animate.ProjectEvents.FAILED) {
                this.projectError.text = data.message;
                this.projectError.element.show();
                this.enableButtons(true);
                return;
            }
            if (response == Animate.ProjectEvents.OPENED) {
                this.welcomeBackground.element.animate({ left: '-=800' }, this.slideTime, this.animateProxy);
                this.pluginsBackground.element.animate({ left: '-=800' }, this.slideTime, this.animateProxy);
                this.pluginBrowser.reset();
                this.enableButtons(true);
            } else {
                //Project Data saved - go to plugins screen!
                this.newProjectBackground.element.animate({ left: '-=800' }, this.slideTime, this.animateProxy);
                this.pluginsBackground.element.animate({ left: '-=800' }, this.slideTime, this.animateProxy);
                this.pluginBrowser.reset();
            }
        };

        /**
        * This is called when we receive data from the projects.
        * @param {any} response
        * @param {any} data >
        */
        Splash.prototype.onPluginResponse = function (response, event) {
            if (response == Animate.PluginBrowserEvents.PLUGINS_IMPLEMENTED) {
                //Go to final screen
                this.pluginLoader.updateDependencies();
                this.pluginsBackground.element.animate({ left: '-=800' }, this.slideTime, this.animateProxy);
                this.finalScreen.element.animate({ left: '-=800' }, this.slideTime, this.animateProxy);
                this.pluginLoader.startLoading();
            } else {
                //this.pluginError.element.fadeIn();
                //this.pluginError.text = data.message;
                this.enableButtons(true);
            }
        };

        /**
        * This is called when we receive data from the projects.
        * @param {ProjectLoaderEvents} response
        * @param {ProjectLoaderEvent} data
        */
        Splash.prototype.onProjectLoaderResponse = function (response, event) {
            if (response == Animate.ProjectLoaderEvents.READY) {
                //All loaded! Lets finally get into the app :)
                this.finalButton.enabled = true;
                this.finalButton.text = "Let's Go!";

                //No problems so just continue and start the app
                this.hide();
                Animate.Application.getInstance().projectReady();
            } else {
                this.finalError.element.fadeIn();
                this.finalError.text = event.message;
            }
        };

        /**
        * When we receive data from the server
        */
        Splash.prototype.onUserData = function (response, event) {
            if ((response == Animate.UserEvents.FAILED || response == Animate.UserEvents.LOGGED_IN || response == Animate.UserEvents.REGISTERED) && event.return_type != Animate.ServerResponses.SUCCESS)
                Recaptcha.reload();

            //LOG OUT
            this.enableButtons(true);
            if (response == Animate.UserEvents.LOGGED_OUT && event.return_type == Animate.ServerResponses.SUCCESS) {
                this.projectBrowser.enabled = false;
                this.projectBrowser.clearItems();

                //Remove links and create normal login section
                jQuery(".logout-link", this.userBoxDetails.element).unbind();

                this.closeButton.element.hide();

                this.userBoxDetails.element.remove();
                this.userBoxDetails = new Animate.Component("<div class='details'><span class='hyperlink login-link'>Login</span></div><div class='details'><span class='hyperlink register-link'>Register</span></div><div class='fix'></div>", this.userBox);
                jQuery(".login-link", this.userBoxDetails.element).click(this.clickProxy);
                jQuery(".register-link", this.userBoxDetails.element).click(this.clickProxy);

                return;
            } else if (response == Animate.UserEvents.LOGGED_IN && event.return_type == Animate.ServerResponses.SUCCESS) {
                this.projectBrowser.enabled = true;

                this.closeButton.element.show();

                //Remove links and create normal login section
                jQuery(".login-link", this.userBoxDetails.element).unbind();
                jQuery(".register-link", this.userBoxDetails.element).unbind();

                var user = Animate.User.getSingleton();
                this.userBoxDetails.element.remove();
                this.userBoxDetails = new Animate.Component("<div class='details'>" + user.username + "</div><div class='details'><div class='hyperlink logout-link'>Logout</div></div><div class='fix'></div>", this.userBox);
                jQuery(".logout-link", this.userBoxDetails.element).click(this.clickProxy);

                //Fill project list
                user.getProjects();

                //Go back to main window
                this.loginBack.element.trigger("click");
                return;
            } else if (response == Animate.UserEvents.PROJECT_DELETED) {
                if (event.return_type == Animate.ServerResponses.ERROR)
                    Animate.MessageBox.show(event.message, ["Ok"], null, null);

                //Refresh the projects
                Animate.User.getSingleton().getProjects();
                return;
            } else if ((response == Animate.UserEvents.PROJECTS_RECIEVED || response == Animate.UserEvents.PROJECT_COPIED) && event.return_type == Animate.ServerResponses.SUCCESS) {
                this.projectBrowser.fill(event.tag);
            }

            this.loginError.element.show();
            this.loginError.text = event.message;
        };

        /**
        * Shows the window by adding it to a parent.
        */
        Splash.prototype.show = function () {
            _super.prototype.show.call(this, null, 0, 0, true);
            this.onWindowResized(null);

            if (this.initialized == false) {
                this.initialized = true;
                this.createNewProjectPage();
                this.createWelcomePage();
                this.createLoginPage();
                this.createPluginsPage();
                this.createFinalScreen();

                Animate.User.getSingleton().addEventListener(Animate.UserEvents.LOGGED_IN, this.onUserData, this);
                Animate.User.getSingleton().addEventListener(Animate.UserEvents.LOGGED_OUT, this.onUserData, this);
                Animate.User.getSingleton().addEventListener(Animate.UserEvents.FAILED, this.onUserData, this);
                Animate.User.getSingleton().addEventListener(Animate.UserEvents.REGISTERED, this.onUserData, this);
                Animate.User.getSingleton().addEventListener(Animate.UserEvents.PASSWORD_RESET, this.onUserData, this);
                Animate.User.getSingleton().addEventListener(Animate.UserEvents.ACTIVATION_RESET, this.onUserData, this);
                Animate.User.getSingleton().addEventListener(Animate.UserEvents.PROJECTS_RECIEVED, this.onUserData, this);
                Animate.User.getSingleton().addEventListener(Animate.UserEvents.PROJECT_COPIED, this.onUserData, this);
                Animate.User.getSingleton().addEventListener(Animate.UserEvents.PROJECT_DELETED, this.onUserData, this);
            }
        };

        Splash.getSingleton = /**
        * Gets the singleton reference of this class.
        * @returns {Splash}
        */
        function () {
            if (!Splash._singleton)
                new Splash();

            return Splash._singleton;
        };
        return Splash;
    })(Animate.Window);
    Animate.Splash = Splash;
})(Animate || (Animate = {}));
//# sourceMappingURL=Splash.js.map
