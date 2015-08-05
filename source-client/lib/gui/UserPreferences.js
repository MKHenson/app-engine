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
    var UserPreferences = (function (_super) {
        __extends(UserPreferences, _super);
        function UserPreferences(name) {
            _super.call(this, null, null);

            this._name = name;
            var group = new Animate.Group("Details", this);

            this.username = new Animate.LabelVal(group.content, "Username: ", new Animate.Label("", null));
            (this.username.val).textfield.element.css({ "text-align": "left" });

            this.joined = new Animate.LabelVal(group.content, "Joined On: ", new Animate.Label("", null));
            (this.joined.val).textfield.element.css({ "text-align": "left" });

            //Image
            group = new Animate.Group("Avatar", this);
            this.imgPreview = group.content.addChild("<div class='preview'></div>");
            this.userImgButton = group.content.addChild("<div class='tool-bar-group'><div class='tab-button'><div><img src='media/add-asset.png' /></div><div class='tool-bar-text'>Add</div></div></div>");
            group.content.addChild("<div class='fix'></div>");

            var info = new Animate.Label("Use this button to upload your avatar picture.", group.content);
            info.element.addClass("info");

            //Notes
            group = new Animate.Group("User information", this);
            this.bio = new Animate.LabelVal(group.content, "Bio", new Animate.InputBox(null, "Bio", true));
            (this.bio.val).textfield.element.css({ height: "80px" });
            info = new Animate.Label("Use the above pad to write about yourself. This will show up on Webinate next to your projects.", group.content);
            info.element.addClass("info");
            (this.bio.val).limitCharacters = 2048;

            //save button
            this.saveDetails = new Animate.Button("Save", group.content);

            this.avatarUploader = null;

            this.submitProxy = this.onSubmit.bind(this);
            this.progressProxy = this.onProgress.bind(this);
            this.completeProxy = this.onUploadComplete.bind(this);
            this.errorProxy = this.onError.bind(this);

            this.saveDetails.element.on("click", jQuery.proxy(this.onClick, this));
        }
        /**
        * When we click a button
        */
        UserPreferences.prototype.onClick = function (e) {
            var comp = jQuery(e.currentTarget).data("component");
            var user = Animate.User.getSingleton();

            if (comp == this.saveDetails) {
                //Check for special chars
                (this.bio.val).textfield.element.removeClass("red-border");
                var message = Animate.Utils.checkForSpecialChars((this.bio.val).text);
                if (message != null) {
                    (this.bio.val).textfield.element.addClass("red-border");
                    Animate.BuildOptionsForm.getSingleton().message(message, true);
                    return;
                }

                user.addEventListener(Animate.UserEvents.DETAILS_SAVED, this.onServer, this);
                user.addEventListener(Animate.UserEvents.FAILED, this.onServer, this);
                user.updateDetails((this.bio.val).text);
            }
        };

        /**
        * When we receive a server command
        */
        UserPreferences.prototype.onServer = function (event, e) {
            var user = Animate.User.getSingleton();
            user.removeEventListener(Animate.UserEvents.FAILED, this.onServer, this);

            if (e.return_type == Animate.ServerResponses.ERROR) {
                Animate.BuildOptionsForm.getSingleton().message(e.tag.message, true);
                return;
            }

            if (event == Animate.UserEvents.DETAILS_SAVED) {
                user.removeEventListener(Animate.UserEvents.DETAILS_SAVED, this.onServer, this);
                Animate.BuildOptionsForm.getSingleton().message(e.tag.message, false);
                user.bio = e.tag.bio;
            } else
                Animate.BuildOptionsForm.getSingleton().message(e.tag.message, true);
        };

        /**
        * Called when the tab page is clicked
        */
        UserPreferences.prototype.onTab = function () {
            if (!this.avatarUploader) {
                this.avatarUploader = new qq.FileUploaderBasic({
                    button: document.getElementById(this.userImgButton.id),
                    action: Animate.DB.HOST,
                    onSubmit: this.submitProxy,
                    onComplete: this.completeProxy,
                    onProgress: this.progressProxy,
                    onError: this.errorProxy,
                    demoMode: false
                });
            }

            this.avatarUploader.setParams({ "category": "files", "command": "uploadUserImage" });
        };

        /**
        * When the settings page is shown.
        * @param <Project> project The project of this session
        * @param <User> user The user of this session
        */
        UserPreferences.prototype.onShow = function (project, user) {
            (this.bio.val).textfield.element.removeClass("red-border");
            (this.username.val).text = user.username;
            (this.joined.val).text = user.created_on;
            (this.bio.val).text = user.bio;
            this.imgPreview.element.html((user.imgURL != "" ? "<img src='" + user.imgURL + "'/>" : ""));

            if (this.avatarUploader)
                this.onTab();
        };

        /**
        * Fired when the upload is complete
        */
        UserPreferences.prototype.onUploadComplete = function (id, fileName, response) {
            if (response.message) {
                this.userImgButton.enabled = true;

                if (response.return_type == Animate.ServerResponses.SUCCESS) {
                    Animate.BuildOptionsForm.getSingleton().message(response.message, false);
                    Animate.User.getSingleton().imgURL = response.image;
                    this.imgPreview.element.html((response.image != "" ? "<img src='" + response.image + "'/>" : ""));
                }
            } else {
                Animate.BuildOptionsForm.getSingleton().message("Error Uploading File.", true);
                this.userImgButton.enabled = true;
            }
        };

        /**
        * Fired when the upload is cancelled due to an error
        */
        UserPreferences.prototype.onError = function (id, fileName, reason) {
            Animate.BuildOptionsForm.getSingleton().message("Error Uploading File.", true);
            this.userImgButton.enabled = true;
        };

        /**
        * When we receive a progress event
        */
        UserPreferences.prototype.onProgress = function (id, fileName, loaded, total) {
            Animate.BuildOptionsForm.getSingleton().message('Uploading...' + ((loaded / total) * 100), false);
        };

        /**
        * When we click submit on the upload button
        */
        UserPreferences.prototype.onSubmit = function (file, ext) {
            var fExt = ext.split(".");
            fExt = fExt[fExt.length - 1];
            fExt.toLowerCase();

            if (fExt != "png" && fExt != "jpeg" && fExt != "jpg") {
                // check for valid file extension
                Animate.BuildOptionsForm.getSingleton().message('Only png, jpg and jpeg files are allowed', true);
                return false;
            }

            Animate.BuildOptionsForm.getSingleton().message('Uploading...', false);
            this.userImgButton.enabled = false;
        };

        Object.defineProperty(UserPreferences.prototype, "name", {
            get: function () {
                return this._name;
            },
            set: function (value) {
                this._name = value;
            },
            enumerable: true,
            configurable: true
        });
        return UserPreferences;
    })(Animate.Component);
    Animate.UserPreferences = UserPreferences;
})(Animate || (Animate = {}));
//# sourceMappingURL=UserPreferences.js.map
