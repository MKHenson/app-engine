var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Animate;
(function (Animate) {
    var RenameFormEvents = (function (_super) {
        __extends(RenameFormEvents, _super);
        function RenameFormEvents(v) {
            _super.call(this, v);
        }
        RenameFormEvents.OBJECT_RENAMED = new RenameFormEvents("rename_form_object_renamed");
        RenameFormEvents.OBJECT_RENAMING = new RenameFormEvents("rename_form_object_renaming");
        return RenameFormEvents;
    })(Animate.ENUM);
    Animate.RenameFormEvents = RenameFormEvents;

    var RenameFormEvent = (function (_super) {
        __extends(RenameFormEvent, _super);
        function RenameFormEvent(eventName, name, object) {
            _super.call(this, eventName, name);
            this.cancel = false;
            this.name = name;
            this.object = object;
        }
        return RenameFormEvent;
    })(Animate.Event);
    Animate.RenameFormEvent = RenameFormEvent;

    /**
    * This form is used to rename objects
    */
    var RenameForm = (function (_super) {
        __extends(RenameForm, _super);
        function RenameForm() {
            if (RenameForm._singleton != null)
                throw new Error("The RenameForm class is a singleton. You need to call the RenameForm.getSingleton() function.");

            RenameForm._singleton = this;

            // Call super-class constructor
            _super.call(this, 400, 250, false, true, "Please enter a name");

            this.element.addClass("rename-form");
            this.name = new Animate.LabelVal(this.okCancelContent, "Name", new Animate.InputBox(null, ""));

            //this.heading.text("Please enter a name");
            this.object = null;

            this.warning = new Animate.Label("Please enter a name and click Ok.", this.okCancelContent);
        }
        /**
        * @type public mfunc show
        * Shows the window.
        * @param {any} object
        * @param {string} curName
        * @extends {RenameForm}
        */
        RenameForm.prototype.showForm = function (object, curName) {
            this.object = object;

            (this.name.val).text = curName;

            this.warning.textfield.element.css("color", "");
            this.warning.text = "Please enter a name and click Ok.";
            (this.name.val).textfield.element.removeClass("red-border");
            _super.prototype.show.call(this);

            (this.name.val).focus();
        };

        /**
        * @type public mfunc OnButtonClick
        * Called when we click one of the buttons. This will dispatch the event OkCancelForm.CONFIRM
        * and pass the text either for the ok or cancel buttons.
        * @param {any} e
        * @extends {RenameForm}
        */
        RenameForm.prototype.OnButtonClick = function (e) {
            if (jQuery(e.target).text() == "Ok") {
                //Check if the values are valid
                (this.name.val).textfield.element.removeClass("red-border");
                this.warning.textfield.element.css("color", "");

                //Check for special chars
                var message = Animate.Utils.checkForSpecialChars((this.name.val).text);
                if (message != null) {
                    (this.name.val).textfield.element.addClass("red-border");
                    this.warning.textfield.element.css("color", "#FF0000");
                    this.warning.text = message;
                    return;
                }

                var name = (this.name.val).text;

                //Dispatch an event notifying listeners of the renamed object
                var event = new RenameFormEvent(RenameFormEvents.OBJECT_RENAMING, name, this.object);
                this.dispatchEvent(event);
                if (event.cancel)
                    return;

                if (this.object instanceof Animate.Behaviour) {
                    Animate.OkCancelForm.prototype.OnButtonClick.call(this, e);
                    (this.object).onRenamed(name);

                    //Dispatch an event notifying listeners of the renamed object
                    this.dispatchEvent(new RenameFormEvent(RenameFormEvents.OBJECT_RENAMED, name, this.object));
                    this.object = null;
                    return;
                }

                var user = Animate.User.getSingleton();

                if (user.project) {
                    user.project.addEventListener(Animate.ProjectEvents.FAILED, this.onRenamed, this);
                    user.project.addEventListener(Animate.ProjectEvents.OBJECT_RENAMED, this.onRenamed, this);

                    if (this.object instanceof Animate.TreeNodeGroup)
                        user.project.renameObject(name, (this.object).groupID, Animate.ProjectAssetTypes.GROUP);
else if (this.object instanceof Animate.Asset)
                        user.project.renameObject(name, this.object.id, Animate.ProjectAssetTypes.ASSET);
else if (this.object instanceof Animate.BehaviourContainer)
                        user.project.renameObject(name, this.object.id, Animate.ProjectAssetTypes.BEHAVIOUR);
                }
                return;
            }

            _super.prototype.OnButtonClick.call(this, e);
        };

        /**
        * Called when we create a behaviour.
        * @param {any} response
        * @param {any} data
        */
        RenameForm.prototype.onRenamed = function (response, data) {
            var user = Animate.User.getSingleton();

            user.removeEventListener(Animate.UserEvents.PROJECT_RENAMED, this.onRenamed, this);

            if (user.project) {
                user.project.removeEventListener(Animate.ProjectEvents.FAILED, this.onRenamed, this);
                user.project.removeEventListener(Animate.ProjectEvents.OBJECT_RENAMED, this.onRenamed, this);
            }

            if (response == Animate.ProjectEvents.FAILED) {
                this.warning.textfield.element.css("color", "#FF0000");
                this.warning.text = data.tag.message;
                return;
            }

            //Dispatch an event notifying listeners of the renamed object
            var name = (this.name.val).text;
            this.dispatchEvent(new RenameFormEvent(RenameFormEvents.OBJECT_RENAMED, name, this.object));
            this.object = null;

            this.hide();
        };

        RenameForm.getSingleton = /**
        * Gets the singleton instance.
        * @returns {RenameForm}
        */
        function () {
            if (!RenameForm._singleton)
                new RenameForm();

            return RenameForm._singleton;
        };
        return RenameForm;
    })(Animate.OkCancelForm);
    Animate.RenameForm = RenameForm;
})(Animate || (Animate = {}));
//# sourceMappingURL=RenameForm.js.map
