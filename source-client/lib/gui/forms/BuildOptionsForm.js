var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Animate;
(function (Animate) {
    /**
    * Use this form to set the project meta and update build versions.
    */
    var BuildOptionsForm = (function (_super) {
        __extends(BuildOptionsForm, _super);
        function BuildOptionsForm() {
            _super.call(this, 600, 500, true, true, "Settings", true);

            if (BuildOptionsForm._singleton != null)
                throw new Error("The BuildOptionsForm class is a singleton. You need to call the BuildOptionsForm.getSingleton() function.");

            BuildOptionsForm._singleton = this;

            this.element.addClass("build-options-form");
            this.okCancelContent.element.css({ height: "500px" });

            this._tab = new Animate.Tab(this.okCancelContent);
            var tabPage = this._tab.addTab("Project", false).page;
            var projectGroup = new Animate.Group("Project Options", tabPage);
            var imgGroup = new Animate.Group("Image", tabPage);
            this._projectTab = tabPage;

            tabPage = this._tab.addTab("Build Options", false).page;
            var buildGroup = new Animate.Group("Build", tabPage);
            var notesGroup = new Animate.Group("Properties", tabPage);

            //Project fields
            this._name = new Animate.LabelVal(projectGroup.content, "Name", new Animate.InputBox(null, ""));
            this._tags = new Animate.LabelVal(projectGroup.content, "Tags", new Animate.InputBox(null, ""));
            this._description = new Animate.LabelVal(projectGroup.content, "Description", new Animate.InputBox(null, "", true));
            (this._description.val).textfield.element.css({ height: "180px" });

            var combo = new Animate.ComboBox();
            combo.addItem("Private");
            combo.addItem("Public");
            this._projVisibility = new Animate.LabelVal(projectGroup.content, "Visibility", combo);
            info = new Animate.Label("If public, your project will be searchable on the Webinate gallery.", projectGroup.content);
            info.element.addClass("info");

            combo = new Animate.ComboBox();
            combo.addItem("Other");
            combo.addItem("Artistic");
            combo.addItem("Gaming");
            combo.addItem("Informative");
            combo.addItem("Musical");
            combo.addItem("Fun");
            combo.addItem("Technical");
            this._category = new Animate.LabelVal(projectGroup.content, "Category", combo);
            info = new Animate.Label("Optionally provide a project category. The default is 'Other'", projectGroup.content);
            info.element.addClass("info");

            this._saveProject = new Animate.Button("Save", projectGroup.content);
            this._saveProject.css({ width: "85px" });

            //Image
            this._imgPreview = imgGroup.content.addChild("<div class='preview'></div>");
            var imgData = imgGroup.content.addChild("<div class='img-data'></div>");
            info = new Animate.Label("Upload an image for the project; this image will show up in the Animate gallery for others to see. <br/><br/><span class='nb'>Your application must have an image in order to be shown in the gallery.</span></br><br/>Your project image should be either a .png, .jpg or .jpeg image that is 200 by 200 pixels.", imgData);
            info.element.addClass("info");

            this._addButton = imgData.addChild("<div class='tool-bar-group'><div class='tab-button'><div><img src='media/add-asset.png' /></div><div class='tool-bar-text'>Add</div></div></div>");
            imgGroup.content.addChild("<div class='fix'></div>");

            //Build options
            this._buildVerMaj = new Animate.LabelVal(buildGroup.content, "Major Version: ", new Animate.InputBox(null, "1"), { width: "50px", "float": "left", "margin": "0 0 10px 10px" });
            this._buildVerMid = new Animate.LabelVal(buildGroup.content, "Mid Version: ", new Animate.InputBox(null, "0"), { width: "50px", "float": "left", "margin": "0 0 10px 10px" });
            this._buildVerMin = new Animate.LabelVal(buildGroup.content, "Minor Version: ", new Animate.InputBox(null, "0"), { width: "50px", "float": "left", "margin": "0 0 10px 10px" });

            buildGroup.content.element.append("<div class='fix'></div>");
            var info = new Animate.Label("When you build a project it saves the data according to its version number. This helps you differenciate your builds and release incremental versions. You can switch between the different builds by specifying which version to use. Use the above fields to select, or if its not present create, a particular build.", buildGroup.content);
            info.element.addClass("info");

            this._selectBuild = new Animate.Button("Select Build", buildGroup.content);
            this._selectBuild.css({ width: "85px" });
            this._buildVerMaj.element.css({ "width": "auto", "float": "left", "margin": "0 0 0 5px" });
            this._buildVerMid.element.css({ "width": "auto", "float": "left", "margin": "0 0 0 5px" });
            this._buildVerMin.element.css({ "width": "auto", "float": "left", "margin": "0 0 0 5px" });

            //Notes
            this._notes = new Animate.LabelVal(notesGroup.content, "Notes", new Animate.InputBox(null, "Some notes", true));
            (this._notes.val).textfield.element.css({ height: "80px" });
            info = new Animate.Label("Use the above pad to store some build notes for the selected build.", notesGroup.content);
            info.element.addClass("info");

            combo = new Animate.ComboBox();
            combo.addItem("Private");
            combo.addItem("Public");
            this._visibility = new Animate.LabelVal(notesGroup.content, "Visibility", combo);
            info = new Animate.Label("by default all builds are public. If you want to make your project private, then please upgrade your account.", notesGroup.content);
            info.element.addClass("info");

            this._saveBuild = new Animate.Button("Save", notesGroup.content);
            this._saveBuild.css({ width: "85px" });

            this._warning = new Animate.Label("", this.content);
            this._warning.element.addClass("server-message");

            //Create the proxies
            this._renameProxy = jQuery.proxy(this.onRenamed, this);
            this._buildProxy = jQuery.proxy(this.onBuildResponse, this);
            this._submitProxy = jQuery.proxy(this.onSubmit, this);
            this._progressProxy = jQuery.proxy(this.onProgress, this);
            this._completeProxy = jQuery.proxy(this.onUploadComplete, this);
            this._errorProxy = jQuery.proxy(this.onError, this);
            this._clickProxy = jQuery.proxy(this.onClick, this);

            this._saveProject.element.on("click", this._clickProxy);
            this._selectBuild.element.on("click", this._clickProxy);
            this._saveBuild.element.on("click", this._clickProxy);

            this._settingPages = [];

            this._tab.addEventListener(Animate.TabEvents.SELECTED, this.onTab, this);
        }
        /**
        * Called when we click on the settings tab
        * @param {any} event
        * @param {any} data
        */
        BuildOptionsForm.prototype.onTab = function (response, event, sender) {
            var i = this._settingPages.length;
            while (i--)
                if (this._settingPages[i].name == event.pair.text)
                    this._settingPages[i].onTab();
        };

        /**
        * Use this function to add a new settings page to the settings menu
        * @param {ISettingsPage} component The ISettingsPage component we're adding
        */
        BuildOptionsForm.prototype.addSettingPage = function (component) {
            this._settingPages.push(component);
            var tabPage = this._tab.addTab(component.name, false);
            tabPage.page.addChild(component);
        };

        /**
        * When we click one of the buttons
        * @param {any} e
        * @returns {any}
        */
        BuildOptionsForm.prototype.onClick = function (e) {
            var target = jQuery(e.currentTarget).data("component");

            if (target == this._saveProject) {
                //Check if the values are valid
                (this._name.val).textfield.element.removeClass("red-border");
                this._warning.textfield.element.css("color", "");

                //Check for special chars
                var message = Animate.Utils.checkForSpecialChars((this._name.val).text);
                if (message != null) {
                    (this._name.val).textfield.element.addClass("red-border");
                    this._warning.textfield.element.css("color", "#FF0000");
                    this._warning.text = message;
                    return;
                }

                //Check for special chars
                message = Animate.Utils.checkForSpecialChars((this._tags.val).text, true);
                if (message != null) {
                    (this._tags.val).textfield.element.addClass("red-border");
                    this._warning.textfield.element.css("color", "#FF0000");
                    this._warning.text = message;
                    return;
                }

                var name = (this._name.val).text;
                var description = (this._description.val).text;
                var tags = (this._tags.val).text;
                var user = Animate.User.getSingleton();
                var project = Animate.User.getSingleton().project;

                user.addEventListener(Animate.UserEvents.FAILED, this._renameProxy);
                user.addEventListener(Animate.UserEvents.PROJECT_RENAMED, this._renameProxy);
                user.renameProject(project.id, name, description, tags, (this._category.val).selectedItem, "", (this._projVisibility.val).selectedItem);
            } else if (target == this._saveBuild) {
                //Check if the values are valid
                (this._name.val).textfield.element.removeClass("red-border");
                this._warning.textfield.element.css("color", "");

                //Check for special chars
                var message = Animate.Utils.checkForSpecialChars((this._notes.val).text, true);
                if (message != null) {
                    (this._notes.val).textfield.element.addClass("red-border");
                    this._warning.textfield.element.css("color", "#FF0000");
                    this._warning.text = message;
                    return;
                }

                var user = Animate.User.getSingleton();
                var project = Animate.User.getSingleton().project;
                var build = project.mCurBuild;

                project.addEventListener(Animate.ProjectEvents.FAILED, this._buildProxy, this);
                project.addEventListener(Animate.ProjectEvents.BUILD_SAVED, this._buildProxy, this);
                project.saveBuild((this._notes.val).text, (this._visibility.val).selectedItem, build.html, build.css);
            } else if (target == this._selectBuild) {
                //Check if the values are valid
                (this._name.val).textfield.element.removeClass("red-border");
                this._warning.textfield.element.css("color", "");

                //Check for special chars
                var number = parseInt((this._buildVerMaj.val).text);
                if (isNaN(number)) {
                    (this._buildVerMaj.val).textfield.element.addClass("red-border");
                    this._warning.textfield.element.css("color", "#FF0000");
                    this._warning.text = "Please only use numbers";
                    return;
                }

                number = parseInt((this._buildVerMid.val).text);
                if (isNaN(number)) {
                    (this._buildVerMid.val).textfield.element.addClass("red-border");
                    this._warning.textfield.element.css("color", "#FF0000");
                    this._warning.text = "Please only use numbers";
                    return;
                }

                number = parseInt((this._buildVerMin.val).text);
                if (isNaN(number)) {
                    (this._buildVerMin.val).textfield.element.addClass("red-border");
                    this._warning.textfield.element.css("color", "#FF0000");
                    this._warning.text = "Please only use numbers";
                    return;
                }

                var user = Animate.User.getSingleton();
                var project = Animate.User.getSingleton().project;
                project.addEventListener(Animate.ProjectEvents.FAILED, this._buildProxy, this);
                project.addEventListener(Animate.ProjectEvents.BUILD_SELECTED, this._buildProxy, this);
                project.selectBuild((this._buildVerMaj.val).text, (this._buildVerMid.val).text, (this._buildVerMin.val).text);
            }
        };

        /**
        * Catch the key down events.
        * @param {any} e The jQuery event object
        */
        BuildOptionsForm.prototype.onKeyDown = function (e) {
            //Do nothing
        };

        /**
        * When we recieve the server call for build requests
        * @param {ProjectEvents} event
        * @param {Event} data
        */
        BuildOptionsForm.prototype.onBuildResponse = function (response, event) {
            var user = Animate.User.getSingleton();
            var project = Animate.User.getSingleton().project;

            project.removeEventListener(Animate.ProjectEvents.FAILED, this._buildProxy, this);
            project.removeEventListener(Animate.ProjectEvents.BUILD_SAVED, this._buildProxy, this);
            project.removeEventListener(Animate.ProjectEvents.BUILD_SELECTED, this._buildProxy, this);

            if (event.return_type == Animate.ServerResponses.ERROR) {
                (this._notes.val).textfield.element.removeClass("red-border");
                this._warning.textfield.element.css("color", "#FF0000");
                this._warning.text = event.message;
                return;
            }

            if (response == Animate.ProjectEvents.BUILD_SELECTED) {
                //Check if the values are valid
                (this._buildVerMaj.val).textfield.element.removeClass("red-border");
                (this._buildVerMid.val).textfield.element.removeClass("red-border");
                (this._buildVerMin.val).textfield.element.removeClass("red-border");
                (this._notes.val).textfield.element.removeClass("red-border");

                this._warning.textfield.element.css("color", "#5DB526");
                this._warning.text = "Build selected";

                //Update fields
                this.updateFields(event);
            } else if (response == Animate.ProjectEvents.BUILD_SAVED) {
                //Check if the values are valid
                (this._notes.val).textfield.element.removeClass("red-border");
                this._warning.textfield.element.css("color", "#5DB526");
                this._warning.text = "Build saved";

                //Update fields
                this.updateFields(event);
            } else {
                this._warning.textfield.element.css("color", "#FF0000");
                this._warning.text = event.message;
            }
        };

        /**
        * Updates some of the version fields with data
        * @param {any} data
        */
        BuildOptionsForm.prototype.updateFields = function (data) {
            (this._buildVerMaj.val).text = data.version_major;
            (this._buildVerMid.val).text = data.version_mid;
            (this._buildVerMin.val).text = data.version_minor;
            (this._notes.val).text = data.build_notes;
            (this._visibility.val).selectedItem = (data.visibility == "public" ? "Public" : "Private");
            this.initializeLoader();
        };

        /**
        * When we recieve the server call for saving project data.
        * @param {UserEvents} event
        * @param {UserEvent} data
        */
        BuildOptionsForm.prototype.onRenamed = function (response, event) {
            var user = Animate.User.getSingleton();
            var project = Animate.User.getSingleton().project;

            if (event.return_type == Animate.ServerResponses.ERROR) {
                this._warning.textfield.element.css("color", "#FF0000");
                this._warning.text = event.message;
                return;
            }

            if (response == Animate.UserEvents.PROJECT_RENAMED) {
                //Check if the values are valid
                (this._name.val).textfield.element.removeClass("red-border");
                (this._category.val).textfield.element.removeClass("red-border");
                (this._tags.val).textfield.element.removeClass("red-border");
                this._warning.textfield.element.css("color", "#5DB526");
                this._warning.text = "Project updated.";
            } else {
                this._warning.textfield.element.css("color", "#FF0000");
                this._warning.text = event.message;
            }

            user.removeEventListener(Animate.UserEvents.FAILED, this._renameProxy);
            user.removeEventListener(Animate.UserEvents.PROJECT_RENAMED, this._renameProxy);
        };

        /**
        * Shows the build options form
        * @returns {any}
        */
        BuildOptionsForm.prototype.show = function () {
            Animate.OkCancelForm.prototype.show.call(this);
            this._tab.selectTab(this._tab.getTab("Project"));

            var user = Animate.User.getSingleton();
            var project = user.project;

            //Start the image uploader
            this.initializeLoader();

            this._warning.textfield.element.css("color", "");
            this._warning.text = "";

            //Set project vars
            (this._name.val).text = project.mName;
            (this._description.val).text = project.mDescription;
            (this._tags.val).text = project.mTags;

            (this._name.val).textfield.element.removeClass("red-border");
            (this._description.val).textfield.element.removeClass("red-border");
            (this._tags.val).textfield.element.removeClass("red-border");

            //Set current build vars
            //this.buildGroup.text( "Build Options - " + project.mCurBuild.id + " version : " + project.mCurBuild.version_major + " - " + project.mCurBuild.version_mid + " - " + project.mCurBuild.version_minor );
            (this._buildVerMaj.val).text = project.mCurBuild.version_major;
            (this._buildVerMid.val).text = project.mCurBuild.version_mid;
            (this._buildVerMin.val).text = project.mCurBuild.version_minor;
            (this._notes.val).text = project.mCurBuild.build_notes;

            //this._category.val.text( project.mCategory );
            //this.subCat.val.text( project.mSubCategory );
            this._imgPreview.element.html((project.mImgPath != "" ? "<img src='" + project.mImgPath + "'/>" : ""));

            (this._visibility.val).selectedItem = (project.mCurBuild.visibility == "public" ? "Public" : "Private");
            (this._projVisibility.val).selectedItem = (project.mVisibility == "public" ? "Public" : "Private");
            (this._category.val).selectedItem = project.mCategory;

            (this._buildVerMaj.val).textfield.element.removeClass("red-border");
            (this._buildVerMid.val).textfield.element.removeClass("red-border");
            (this._buildVerMin.val).textfield.element.removeClass("red-border");
            (this._notes.val).textfield.element.removeClass("red-border");

            (this._name.val).textfield.element.focus();
            (this._name.val).textfield.element.select();

            var i = this._settingPages.length;
            while (i--)
                this._settingPages[i].onShow(project, user);

            this.update();
        };

        /**
        * This is called to initialize the one click loader
        */
        BuildOptionsForm.prototype.initializeLoader = function () {
            if (!this._uploader) {
                this._uploader = new qq.FileUploaderBasic({
                    button: document.getElementById(this._addButton.id),
                    action: Animate.DB.HOST,
                    onSubmit: this._submitProxy,
                    onComplete: this._completeProxy,
                    onProgress: this._progressProxy,
                    onError: this._errorProxy,
                    demoMode: false
                });
            }

            this._uploader.setParams({ projectID: Animate.User.getSingleton().project.id, "category": "files", "command": "uploadProjectImage" });
        };

        /**
        * Use this function to print a message on the settings screen.
        * @param {string} message The message to print
        * @param <bool> isError Should this be styled to an error or not
        */
        BuildOptionsForm.prototype.message = function (message, isError) {
            if (isError)
                this._warning.textfield.element.css("color", "#FF0000");
else
                this._warning.textfield.element.css("color", "#5DB526");

            this._warning.text = message;
        };

        /**
        * Fired when the upload is complete
        */
        BuildOptionsForm.prototype.onUploadComplete = function (id, fileName, response) {
            if (response.message) {
                this._warning.text = response.message;
                this._addButton.enabled = true;

                if (response.return_type == Animate.ServerResponses.SUCCESS) {
                    this._warning.textfield.element.css("color", "#5DB526");
                    var project = Animate.User.getSingleton().project;
                    project.mImgPath = response.image;
                    this._imgPreview.element.html((response.image != "" ? "<img src='" + response.image + "'/>" : ""));
                } else {
                    this._warning.textfield.element.css("color", "#FF0000");
                    this._warning.text = response.message;
                    return;
                }
            } else {
                this._warning.textfield.element.css("color", "#FF0000");
                this._warning.text = 'Error Uploading File.';
                this._addButton.enabled = true;
            }
        };

        /**
        * Fired when the upload is cancelled due to an error
        */
        BuildOptionsForm.prototype.onError = function (id, fileName, reason) {
            this._warning.textfield.element.css("color", "#FF0000");
            this._warning.text = 'Error Uploading File.';
            this._addButton.enabled = true;
        };

        /**
        * When we receive a progress event
        */
        BuildOptionsForm.prototype.onProgress = function (id, fileName, loaded, total) {
            this._warning.text = 'Uploading...' + ((loaded / total) * 100);
        };

        /**
        * When we click submit on the upload button
        */
        BuildOptionsForm.prototype.onSubmit = function (file, ext) {
            var fExt = ext.split(".");
            fExt = fExt[fExt.length - 1];
            fExt.toLowerCase();

            if (fExt != "png" && fExt != "jpeg" && fExt != "jpg") {
                // check for valid file extension
                this._warning.textfield.element.css("color", "#FF0000");
                this._warning.text = 'Only png, jpg and jpeg files are allowed';
                return false;
            }

            this._warning.textfield.element.css("color", "");
            this._warning.text = 'Uploading...';
            this._addButton.enabled = false;
        };

        BuildOptionsForm.getSingleton = /**
        * Gets the singleton instance.
        * @returns {BuildOptionsForm}
        */
        function () {
            if (!BuildOptionsForm._singleton)
                new BuildOptionsForm();

            return BuildOptionsForm._singleton;
        };
        return BuildOptionsForm;
    })(Animate.OkCancelForm);
    Animate.BuildOptionsForm = BuildOptionsForm;
})(Animate || (Animate = {}));
//# sourceMappingURL=BuildOptionsForm.js.map
