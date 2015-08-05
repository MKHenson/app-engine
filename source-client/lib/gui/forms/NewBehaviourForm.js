var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Animate;
(function (Animate) {
    /**
    * This form is used to create or edit Portals.
    */
    var NewBehaviourForm = (function (_super) {
        __extends(NewBehaviourForm, _super);
        function NewBehaviourForm() {
            if (NewBehaviourForm._singleton != null)
                throw new Error("The NewBehaviourForm class is a singleton. You need to call the NewBehaviourForm.getSingleton() function.");

            NewBehaviourForm._singleton = this;

            // Call super-class constructor
            _super.call(this, 400, 250, false, true, "Please enter a name");

            this.element.addClass("new-behaviour-form");
            this.name = new Animate.LabelVal(this.okCancelContent, "Name", new Animate.InputBox(null, ""));
            this.warning = new Animate.Label("Please enter a behaviour name.", this.okCancelContent);

            //Create the proxies
            this.createProxy = this.onCreated.bind(this);
        }
        /** Shows the window. */
        NewBehaviourForm.prototype.show = function () {
            (this.name.val).text = "";
            this.warning.textfield.element.css("color", "");
            this.warning.text = "Please enter a behaviour name.";
            (this.name.val).textfield.element.removeClass("red-border");
            _super.prototype.show.call(this);

            (this.name.val).textfield.element.focus();
        };

        /** Called when we click one of the buttons. This will dispatch the event OkCancelForm.CONFIRM
        and pass the text either for the ok or cancel buttons. */
        NewBehaviourForm.prototype.OnButtonClick = function (e) {
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

                //Create the Behaviour in the DB
                Animate.User.getSingleton().project.addEventListener(Animate.ProjectEvents.FAILED, this.createProxy);
                Animate.User.getSingleton().project.addEventListener(Animate.ProjectEvents.BEHAVIOUR_CREATED, this.createProxy);
                Animate.User.getSingleton().project.createBehaviour((this.name.val).text);
                return;
            }

            _super.prototype.OnButtonClick.call(this, e);
        };

        /** Called when we create a behaviour.*/
        NewBehaviourForm.prototype.onCreated = function (response, event) {
            Animate.User.getSingleton().project.removeEventListener(Animate.ProjectEvents.FAILED, this.createProxy);
            Animate.User.getSingleton().project.removeEventListener(Animate.ProjectEvents.BEHAVIOUR_CREATED, this.createProxy);

            if (response == Animate.ProjectEvents.FAILED) {
                this.warning.textfield.element.css("color", "#FF0000");
                this.warning.text = event.tag.message;
                return;
            }

            this.hide();
        };

        NewBehaviourForm.getSingleton = /** Gets the singleton instance. */
        function () {
            if (!NewBehaviourForm._singleton)
                new NewBehaviourForm();

            return NewBehaviourForm._singleton;
        };
        return NewBehaviourForm;
    })(Animate.OkCancelForm);
    Animate.NewBehaviourForm = NewBehaviourForm;
})(Animate || (Animate = {}));
//# sourceMappingURL=NewBehaviourForm.js.map
