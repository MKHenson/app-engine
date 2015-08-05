var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Animate;
(function (Animate) {
    /**
    * A tab pair that manages the build HTML
    */
    var HTMLTab = (function (_super) {
        __extends(HTMLTab, _super);
        /**
        * @param {string} name The name of the tab
        * @param {Label} tab The label of the pair
        * @param {Component} page The page of the pair
        */
        function HTMLTab(name) {
            // Call super-class constructor
            _super.call(this, null, null, name);

            this.originalName = name;
            this.proxyChange = jQuery.proxy(this.onChange, this);
            this.proxyMessageBox = jQuery.proxy(this.onMessage, this);
            this.saved = true;
            this.close = false;
            this._editor = null;
        }
        /**
        * When the server responds after a save.
        * @param {ProjectEvents} response
        * @param {ProjectEvent} event
        */
        HTMLTab.prototype.onServer = function (response, event) {
            Animate.User.getSingleton().project.removeEventListener(Animate.ProjectEvents.FAILED, this.onServer, this);
            Animate.User.getSingleton().project.removeEventListener(Animate.ProjectEvents.BUILD_SAVED, this.onServer, this);

            if (response == Animate.ProjectEvents.FAILED) {
                this.saved = false;
                Animate.MessageBox.show("Problem saving the data, server responded with:'" + event.message + "'", Array("Ok"), null, null);
            } else {
                this.save();
                if (this.close)
                    Animate.CanvasTab.getSingleton().removeTab(this, true);
            }
        };

        /**
        * Called when the save all button is clicked
        */
        HTMLTab.prototype.onSaveAll = function () {
            this._editor.setValue(Animate.User.getSingleton().project.mCurBuild.html);
            this._editor.selection.moveCursorFileStart();
            this.save();
        };

        /**
        * When we acknowledge the message box.
        * @param {string} val
        */
        HTMLTab.prototype.onMessage = function (val) {
            if (val == "Yes") {
                this.close = true;
                Animate.User.getSingleton().project.addEventListener(Animate.ProjectEvents.FAILED, this.onServer, this);
                Animate.User.getSingleton().project.addEventListener(Animate.ProjectEvents.BUILD_SAVED, this.onServer, this);

                var build = Animate.User.getSingleton().project.mCurBuild;
                Animate.User.getSingleton().project.saveBuild(build.build_notes, build.visibility, this._editor.getValue(), (Animate.CSSTab.singleton ? Animate.CSSTab.singleton.editor.getValue() : build.css));
            } else {
                this.saved = true;
                Animate.CanvasTab.getSingleton().removeTab(this, true);
            }
        };

        /**
        * Called when the editor changes
        * @param {any} e
        */
        HTMLTab.prototype.onChange = function (e) {
            this.saved = false;
            this.name = "*" + this.originalName;
            this.text = this.name;
        };

        /**
        * Called by the tab class when the pair is to be removed.
        * @param {any} data An object that can be used to cancel the operation. Simply call data.cancel = true to cancel the closure.
        */
        HTMLTab.prototype.onRemove = function (data) {
            if (!this.saved) {
                data.cancel = true;
                Animate.MessageBox.show("Document not saved, would you like to save it now?", ["Yes", "No"], this.proxyMessageBox, this);
                return;
            }

            this._editor.off("change", this.proxyChange);
            this._editor.destroy();
            this._editor = null;
            this.proxyChange = null;
            this.proxyMessageBox = null;
            HTMLTab.singleton = null;
            this._editor = null;
        };

        /**
        * Called when the editor is resized
        */
        HTMLTab.prototype.onResize = function () {
            this._editor.resize();
        };

        /**
        * A helper function to save the script
        * @returns {any}
        */
        HTMLTab.prototype.save = function () {
            this.name = this.originalName;
            jQuery(".text", this.tabSelector.element).text(this.name);
            this.saved = true;
        };

        /**
        * Called when the pair has been added to the tab
        */
        HTMLTab.prototype.onAdded = function () {
            HTMLTab.singleton = this;

            var comp = new Animate.Component("<pre style='position:absolute; margin: 0; top: 0; bottom: 0; left: 0; right: 0;'></pre>", this.page);
            var editor = ace.edit(comp.id);
            editor.setTheme("ace/theme/chrome");
            editor.getSession().setMode("ace/mode/html");
            this._editor = editor;

            editor.setValue(Animate.User.getSingleton().project.mCurBuild.html);
            this._editor.selection.moveCursorFileStart();

            // Ctrl + S
            this._editor.commands.addCommand({
                name: "save",
                bindKey: {
                    win: "Ctrl-S",
                    mac: "Command-S",
                    sender: "editor|cli"
                },
                exec: function () {
                    Animate.Toolbar.getSingleton().save.element.trigger("click");
                }
            });

            editor.on("change", this.proxyChange);
        };

        Object.defineProperty(HTMLTab.prototype, "editor", {
            get: function () {
                return this._editor;
            },
            enumerable: true,
            configurable: true
        });
        return HTMLTab;
    })(Animate.TabPair);
    Animate.HTMLTab = HTMLTab;
})(Animate || (Animate = {}));
//# sourceMappingURL=HTMLTab.js.map
