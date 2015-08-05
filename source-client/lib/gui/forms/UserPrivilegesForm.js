var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Animate;
(function (Animate) {
    var UserPrivilegesForm = (function (_super) {
        __extends(UserPrivilegesForm, _super);
        function UserPrivilegesForm() {
            if (UserPrivilegesForm._singleton != null)
                throw new Error("The UserPrivilegesForm class is a singleton. You need to call the UserPrivilegesForm.get() function.");

            UserPrivilegesForm._singleton = this;

            // Call super-class constructor
            _super.call(this, 450, 600, true, true, "User Privileges");

            var top = this.content.addChild("<div class='top'></div>");
            var bottom = this.content.addChild("<div class='bottom'></div>");

            this.mSave = new Animate.Button("Save", bottom);
            this.mSave.element.width(80);
            this.mSave.element.height(20);
            this.mSave.css("margin: 0 3px 3px 3px; line-height:8px;");

            this.search = bottom.addChild("<div class='asset-search'><input type='text'></input><img src='media/search.png' /></div>");

            this.mMenu = new Animate.ListView(top);
            this.mMenu.addColumn("Username");
            this.mMenu.addColumn("Access Rights");

            this.mMenu.lists[0].element.css("width", "50%");
            this.mMenu.lists[1].element.css("width", "49%");

            this.mMenu.addItem(new Animate.ListViewItem(["Mat", "<select><option value='hidden'>Hidden</option><option value='read'>Read</option><option value='write'>Write</option><option value='admin'>Administrate</option></select>"]));
            this.mMenu.addItem(new Animate.ListViewItem(["Mat2", "<select><option value='hidden'>Hidden</option><option value='read'>Read</option><option value='write'>Write</option><option value='admin'>Administrate</option></select>"]));
            this.mMenu.addItem(new Animate.ListViewItem(["Anna", "<select><option value='hidden'>Hidden</option><option value='read'>Read</option><option value='write'>Write</option><option value='admin'>Administrate</option></select>"]));
            this.mMenu.addItem(new Animate.ListViewItem(["Steve", "<select><option value='hidden'>Hidden</option><option value='read'>Read</option><option value='write'>Write</option><option value='admin'>Administrate</option></select>"]));
            this.mMenu.addItem(new Animate.ListViewItem(["Ilka", "<select><option value='hidden'>Hidden</option><option value='read'>Read</option><option value='write'>Write</option><option value='admin'>Administrate</option></select>"]));

            //EVENTS AND LISTENERS
            //this.mServerProxy = this.onServer.bind( this);
            this.keyDownProxy = this.onInputKey.bind(this);
            this.buttonProxy = this.onButtonClick.bind(this);

            jQuery("input", this.search.element).on("keydown", this.keyDownProxy);
            jQuery("img", this.search.element).on("click", this.buttonProxy);
            this.mSave.element.on("click", this.buttonProxy);
        }
        /**
        * This function is called whenever we get a resonse from the server
        */
        UserPrivilegesForm.prototype.onServer = function (response, event, sender) {
            if (response == Animate.LoaderEvents.COMPLETE) {
                if (event.return_type == Animate.ServerResponses.SUCCESS) {
                    var counter = 0;
                    var data = event.tag;
                    while (data[counter]) {
                        var item = new Animate.ListViewItem([
                            data[counter].username,
                            "<select>" + "<option value='hidden' " + (data[counter].access_type == "hidden" ? "selected='selected'" : "") + ">Hidden</option>" + "<option value='read' " + (data[counter].access_type == "read" ? "selected='selected'" : "") + ">Read</option>" + "<option value='write' " + (data[counter].access_type == "write" ? "selected='selected'" : "") + ">Write</option>" + "<option value='admin' " + (data[counter].access_type == "admin" ? "selected='selected'" : "") + ">Administrate</option>" + "</select>"
                        ]);

                        item.tag = data[counter].userID;

                        this.mMenu.addItem(item);

                        counter++;
                    }
                }

                if (event.message)
                    Animate.MessageBox.show(data.message, ["Ok"], null, null);
            }
        };

        /**
        * Gets the viewer to search using the terms in the search inut
        */
        UserPrivilegesForm.prototype.searchItems = function () {
            var items = this.mMenu.items;
            var i = items.length;
            while (i--) {
                var ii = items[i].components.length;

                var searchTerm = jQuery("input", this.search.element).val();
                var baseString = (items[i].fields[0] + items[i].fields[1]);
                var result = baseString.search(new RegExp(searchTerm, "i"));

                while (ii--)
                    if (result != -1)
                        items[i].components[ii].element.show();
else
                        items[i].components[ii].element.hide();
            }
        };

        /**
        * When we click a button on the form
        * @param {any} e The jQuery event object
        */
        UserPrivilegesForm.prototype.onButtonClick = function (e) {
            e.preventDefault();

            if (jQuery(e.target).is(jQuery("img", this.search.element))) {
                this.searchItems();
            } else {
                //Get all the updated users
                var project = Animate.User.getSingleton().project;
                var data = {};
                data["category"] = "user";
                data["command"] = "setUserPriviledges";
                data["projectID"] = project.id;

                for (var i = 0; i < this.mMenu.items.length; i++) {
                    data["userData[" + i + "][userID]"] = this.mMenu.items[i].tag;
                    data["userData[" + i + "][access_type]"] = jQuery(this.mMenu.items[i].components[1].element.find("select")).val();
                }

                //Clear items
                this.mMenu.clearItems();

                var loader = new Animate.Loader();
                loader.addEventListener(Animate.LoaderEvents.COMPLETE, this.onServer, this);
                loader.addEventListener(Animate.LoaderEvents.FAILED, this.onServer, this);

                loader.load(Animate.DB.HOST, data, true);
            }
        };

        /**
        * When we hit a key on the search box
        * @param {any} e The jQuery event
        */
        UserPrivilegesForm.prototype.onInputKey = function (e) {
            if (e.keyCode == 13)
                this.searchItems();
        };

        /**
        * Shows the window by adding it to a Application route.
        */
        UserPrivilegesForm.prototype.show = function () {
            _super.prototype.show.call(this);

            var project = Animate.User.getSingleton().project;
            this.mMenu.clearItems();

            //Load the user priviledges
            var loader = new Animate.Loader();
            loader.addEventListener(Animate.LoaderEvents.COMPLETE, this.onServer, this);
            loader.addEventListener(Animate.LoaderEvents.FAILED, this.onServer, this);
            loader.load(Animate.DB.HOST, {
                category: "user",
                command: "getUserPriviledges",
                projectID: project.id
            }, true);
        };

        UserPrivilegesForm.getSingleton = /**
        * Gets the singleton reference of this class.
        * @returns {UserPrivilegesForm}
        */
        function () {
            if (!UserPrivilegesForm._singleton)
                new UserPrivilegesForm();

            return UserPrivilegesForm._singleton;
        };
        return UserPrivilegesForm;
    })(Animate.Window);
    Animate.UserPrivilegesForm = UserPrivilegesForm;
})(Animate || (Animate = {}));
//# sourceMappingURL=UserPrivilegesForm.js.map
