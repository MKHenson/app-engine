var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Animate;
(function (Animate) {
    /**
    * A behaviour node that acts as a script. Users can create custom JS within the body. These nodes are connected to
    * database entries and so need to be cleaned up properly when modified by the user.
    */
    var BehaviourScript = (function (_super) {
        __extends(BehaviourScript, _super);
        function BehaviourScript(parent, text, databaseID, copied) {
            if (typeof text === "undefined") { text = "Script"; }
            if (typeof databaseID === "undefined") { databaseID = null; }
            if (typeof copied === "undefined") { copied = false; }
            // Call super-class constructor
            _super.call(this, parent, text);

            var behaviour = this;
            var element = this.element;
            var plan = Animate.User.getSingleton().plan;
            this.scriptTab = null;

            if (plan.toString() != Animate.DB.PLAN_FREE)
                element.addClass("behaviour-script");
else {
                element.addClass("behaviour-bad");
                this.tooltip = "Script will not be exported. You need to upgrade your account for this feature.";
            }

            this.databaseID = databaseID;

            if (databaseID && copied) {
                var behaviour = this;

                //try to create the database entry of this node
                var loader = new Animate.Loader();
                loader.addEventListener(Animate.LoaderEvents.COMPLETE, onServer);
                loader.addEventListener(Animate.LoaderEvents.FAILED, onServer);
                loader.load(Animate.DB.HOST, {
                    category: "script",
                    command: "copyScript",
                    projectID: Animate.User.getSingleton().project.id,
                    originalID: behaviour.databaseID
                }, true);

                //When we have copied the script
                function onServer(response, event) {
                    loader = null;

                    if (response == Animate.LoaderEvents.COMPLETE) {
                        if (event.return_type == Animate.ServerResponses.ERROR) {
                            Animate.MessageBox.show(event.message, Array("Ok"), null, null);
                            return;
                        }

                        behaviour.databaseID = event.data.id;
                    }
                }
            }
        }
        /**
        * Called when the behaviour is renamed
        * @param <string> name The new name of the behaviour
        */
        BehaviourScript.prototype.onRenamed = function (name) {
            if (this.scriptTab)
                this.scriptTab.rename(name);
        };

        /**
        * Called when the behaviour is about to be deleted
        */
        BehaviourScript.prototype.onDelete = function () {
            if (this.scriptTab) {
                this.scriptTab.saved = true;
                Animate.CanvasTab.getSingleton().removeTab(this.scriptTab, true);
            }

            var behaviour = this;
            if (!behaviour.databaseID)
                return;

            //try to create the database entry of this node
            var loader = new Animate.Loader();
            loader.addEventListener(Animate.LoaderEvents.COMPLETE, onServer);
            loader.addEventListener(Animate.LoaderEvents.FAILED, onServer);
            loader.load(Animate.DB.HOST, {
                category: "script",
                command: "deleteScript",
                projectID: Animate.User.getSingleton().project.id,
                databaseID: behaviour.databaseID
            }, true);

            //When we
            function onServer(response, event) {
                loader = null;
                if (response == Animate.LoaderEvents.COMPLETE) {
                    if (event.return_type == Animate.ServerResponses.ERROR) {
                        Animate.MessageBox.show(event.message, Array("Ok"), null, null);
                        return;
                    }
                }
            }
        };

        /**
        * this function is called when a container is getting saved. It basically initializes the node in the database.
        */
        BehaviourScript.prototype.initializeDB = function () {
            var behaviour = this;
            if (behaviour.databaseID)
                return;

            //try to create the database entry of this node
            var loader = new Animate.Loader();
            loader.addEventListener(Animate.LoaderEvents.COMPLETE, onServer);
            loader.addEventListener(Animate.LoaderEvents.FAILED, onServer);
            loader.load(Animate.DB.HOST, {
                category: "script",
                command: "initializeScript",
                projectID: Animate.User.getSingleton().project.id,
                scriptID: behaviour.id
            }, false);

            //When we
            function onServer(response, event, sender) {
                loader = null;
                if (response == Animate.LoaderEvents.COMPLETE) {
                    if (event.return_type == Animate.ServerResponses.ERROR) {
                        Animate.MessageBox.show(event.message, Array("Ok"), null, null);
                        return;
                    }

                    behaviour.databaseID = event.tag.id;
                }
            }
        };

        /**
        * This function will open a script tab
        */
        BehaviourScript.prototype.edit = function () {
            if (!this.databaseID)
                this.initializeDB();

            var tabName = this.id + " - " + this.alias;
            if (Animate.CanvasTab.getSingleton().getTab(tabName)) {
                Animate.CanvasTab.getSingleton().selectTab(Animate.CanvasTab.getSingleton().getTab(tabName));
                return;
            }
            if (Animate.CanvasTab.getSingleton().getTab("*" + tabName)) {
                Animate.CanvasTab.getSingleton().selectTab(Animate.CanvasTab.getSingleton().getTab("*" + tabName));
                return;
            }

            this.scriptTab = Animate.CanvasTab.getSingleton().addSpecialTab("", Animate.CanvasTabType.SCRIPT, this);
        };

        /**
        * Diposes and cleans up this component and all its child Components
        */
        BehaviourScript.prototype.dispose = function () {
            this.databaseID = null;
            this.scriptTab = null;

            //Call super
            _super.prototype.dispose.call(this);
        };
        return BehaviourScript;
    })(Animate.Behaviour);
    Animate.BehaviourScript = BehaviourScript;
})(Animate || (Animate = {}));
//# sourceMappingURL=BehaviourScript.js.map
