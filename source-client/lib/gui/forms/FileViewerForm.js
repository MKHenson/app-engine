var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Animate;
(function (Animate) {
    var FileViewerFormEvents = (function (_super) {
        __extends(FileViewerFormEvents, _super);
        function FileViewerFormEvents(v) {
            _super.call(this, v);
        }
        FileViewerFormEvents.OBJECT_RENAMED = new FileViewerFormEvents("file_viewer_object_renamed");
        FileViewerFormEvents.OBJECT_RENAMING = new FileViewerFormEvents("file_viewer_object_renaming");
        FileViewerFormEvents.FILE_CHOSEN = new FileViewerFormEvents("file_viewer_file_chosen");
        FileViewerFormEvents.CANCELLED = new FileViewerFormEvents("file_viewer_cancelled");
        return FileViewerFormEvents;
    })(Animate.ENUM);
    Animate.FileViewerFormEvents = FileViewerFormEvents;

    var FileViewerFormEvent = (function (_super) {
        __extends(FileViewerFormEvent, _super);
        function FileViewerFormEvent(eventType, file) {
            _super.call(this, eventType, file);
            this.file = file;
        }
        return FileViewerFormEvent;
    })(Animate.Event);
    Animate.FileViewerFormEvent = FileViewerFormEvent;

    /**
    * This form is used to load and select assets.
    */
    var FileViewerForm = (function (_super) {
        __extends(FileViewerForm, _super);
        function FileViewerForm() {
            if (FileViewerForm._singleton != null)
                throw new Error("The FileViewerForm class is a singleton. You need to call the FileViewerForm.getSingleton() function.");

            FileViewerForm._singleton = this;

            // Call super-class constructor
            _super.call(this, 1000, 600, true, true, "Asset Browser");

            this.toolbar = this.content.addChild("<div class='viewer-toolbar'></div>");

            this.selectedID = null;

            //Create buttons and groups
            var group = this.createGroup();
            this.modeGrid = this.createGroupButton("Grid", "media/asset-grid.png", group);
            this.modeList = this.createGroupButton("List", "media/asset-list.png", group);
            this.modeList.element.addClass("selected");

            group = this.createGroup();
            this.favouriteGroup = group;
            this.favourite = this.createGroupButton("Favourite", "media/star.png", group);
            this.favourite.enabled = false;

            group = this.createGroup();
            this.addRemoveGroup = group;
            this.addButton = this.createGroupButton("Add", "media/add-asset.png", group);
            this.removeButton = this.createGroupButton("Remove", "media/remove-asset.png", group);
            this.content.element.append("<div class='fix'></div>");

            group = this.createGroup();
            this.catProject = this.createGroupButton("Project", "media/assets-project.png", group);
            this.catUser = this.createGroupButton("My Assets", "media/assets-user.png", group);
            this.catGlobal = this.createGroupButton("Global Assets", "media/assets-global.png", group);
            this.catProject.element.addClass("selected");

            group = this.createGroup();
            this.search = group.addChild("<div class='asset-search'><input type='text'></input><img src='media/search.png' /></div>");
            group.element.css({ "float": "right", "margin": "0 15px 0 0" });

            //Bottom panels
            var btmLeft = this.content.addChild("<div class='viewer-block'></div>");
            var btmRight = this.content.addChild("<div class='viewer-block'></div>");

            var listBlock = btmLeft.addChild("<div class='list-block'></div>");
            this.menu = new Animate.ListView(listBlock);
            this.menu.addColumn("ID");
            this.menu.addColumn("Name");
            this.menu.addColumn("Tags");
            this.menu.addColumn("Size");
            this.menu.addColumn("Path");
            this.menu.addColumn("Favourite");
            this.menu.addColumn("Created On");
            this.menu.addColumn("Last Modified");
            this.menu.addColumn("Extension");

            this.listInfo = btmLeft.addChild("<div class='selection-info'><span class='selected-asset'>Selected: </span><span class='assets'>All your base!</span></div>");

            //Preview section
            this.previewHeader = new Animate.Component("<div class='file-preview-header'><div class='header-name'>Preview</div></div>", btmRight);
            this.okButton = new Animate.Button("Use this File", this.previewHeader);
            this.okButton.css({ "float": "right", width: "100px", height: "25px", margin: "0 0 5px 0" });
            this.previewHeader.element.append("<div class='fix'></div>");

            this.preview = new Animate.Component("<div class='file-preview'></div>", btmRight);

            //Create info section
            var infoSection = new Animate.Component("<div class='info-section'></div>", btmRight);

            this.statusBar = new Animate.Component("<div class='upload-status'><img src='media/close.png' /><span class='upload-text'>Uploading</span></div>", infoSection);
            this.statusBar.element.hide();

            //Name
            group = new Animate.Component("<div class='file-group'><div>", infoSection);
            var label = new Animate.Label("Name:, group ", null);
            label.element.css({ "text-align": "left", "float": "left", "padding-left": "5px" });
            this.name = new Animate.InputBox(group, "");
            group.element.append("<div class='fix'></div>");

            //Tags
            group = new Animate.Component("<div class='file-group'><div>", infoSection);
            label = new Animate.Label("Tags: ", group);
            label.element.css({ "text-align": "left", "float": "left", "padding-left": "5px" });
            this.tags = new Animate.InputBox(group, "");
            group.element.append("<div class='fix'></div>");

            //Global
            group = new Animate.Component("<div class='file-group'><div>", infoSection);
            label = new Animate.Label("Share: ", group);
            label.element.css({ "text-align": "left", "float": "left", "padding-left": "5px" });
            this.global = new Animate.Checkbox(group, "Share your file with all Animate users", false);
            group.element.append("<div class='fix'></div>");

            //Thumbnail
            group = new Animate.Component("<div class='file-group'><div>", infoSection);
            label = new Animate.Label("Thumbnail: ", group);
            label.element.css({ "text-align": "left", "float": "left", "padding-left": "5px" });
            this.thumbnail = new Animate.InputBox(group, "");
            group.element.append("<div class='info'>Click here to upload a thumbnail image (100px, 100px)</div><div class='fix'></div>");

            //Size
            group = new Animate.Component("<div class='file-group'><div>", infoSection);
            label = new Animate.Label("Filesize: ", group);
            label.element.css({ "text-align": "left", "float": "left", "padding-left": "5px" });
            this.size = new Animate.InputBox(group, "");
            group.element.append("<div class='fix'></div>");
            group.enabled = false;

            //Path
            group = new Animate.Component("<div class='file-group'><div>", infoSection);
            label = new Animate.Label("Path: ", group);
            label.element.css({ "text-align": "left", "float": "left", "padding-left": "5px" });
            this.path = new Animate.InputBox(group, "");
            group.element.append("<div class='fix'></div>");
            group.enabled = false;

            //Create the update button
            this.updateButton = new Animate.Button("Update", infoSection);
            this.updateButton.css({ width: "70px", height: "20px", "margin": "5px 3px 0 0", "float": "right" });
            infoSection.element.append("<div class='fix'></div>");

            this.thumbUploader = null;
            this.uploader = null;

            //Event Listeners
            this.buttonProxy = jQuery.proxy(this.onButtonClick, this);
            this.submitProxy = jQuery.proxy(this.onSubmit, this);
            this.thumbSubmitProxy = jQuery.proxy(this.onThumbSubmit, this);
            this.progressProxy = jQuery.proxy(this.onProgress, this);
            this.cancelProxy = jQuery.proxy(this.onCancel, this);
            this.completeProxy = jQuery.proxy(this.onUploadComplete, this);
            this.errorProxy = jQuery.proxy(this.onError, this);
            this.keyDownProxy = jQuery.proxy(this.onInputKey, this);

            //this.itemClicked = jQuery.proxy( this.onItemClicked, this );
            //this.fileDeleted = jQuery.proxy( this.onFileDeleted, this );
            //this.fileUpdated = jQuery.proxy( this.onFileUpdated, this );
            jQuery("input", this.search.element).on("keydown", this.keyDownProxy);
            jQuery("img", this.search.element).on("click", this.buttonProxy);
            this.modeGrid.element.on("click", this.buttonProxy);
            this.modeList.element.on("click", this.buttonProxy);
            this.favourite.element.on("click", this.buttonProxy);
            this.updateButton.element.on("click", this.buttonProxy);
            this.removeButton.element.on("click", this.buttonProxy);
            this.okButton.element.on("click", this.buttonProxy);
            this.catProject.element.on("click", this.buttonProxy);
            this.catUser.element.on("click", this.buttonProxy);
            this.catGlobal.element.on("click", this.buttonProxy);

            this.extensions = [];
            jQuery("img", this.statusBar.element).on("click", jQuery.proxy(this.onStatusCloseClick, this));

            this.menu.addEventListener(Animate.ListViewEvents.ITEM_CLICKED, this.onItemClicked, this);

            jQuery(this.element).on('dragexit', this.onDragLeave.bind(this));
            jQuery(this.element).on('dragleave', this.onDragLeave.bind(this));
            jQuery(this.element).on('dragover', this.onDragOver.bind(this));
            jQuery(this.element).on('drop', this.onDrop.bind(this));
        }
        FileViewerForm.prototype.onDragOver = function (e) {
            if (this.visible) {
                var items = e.originalEvent.dataTransfer.items;
                if (items.length > 0) {
                    if (!jQuery(".list-block", this.element).hasClass("drag-here"))
                        jQuery(".list-block", this.element).addClass("drag-here");
                } else if (jQuery(".list-block", this.element).hasClass("drag-here"))
                    jQuery(".list-block", this.element).removeClass("drag-here");
            }

            e.preventDefault();
            e.stopPropagation();
        };

        /**
        * Called when we are no longer dragging items.
        */
        FileViewerForm.prototype.onDragLeave = function (e) {
            if (this.visible) {
                if (jQuery(".list-block", this.element).hasClass("drag-here"))
                    jQuery(".list-block", this.element).removeClass("drag-here");
            }
        };

        /**
        * Called when we are no longer dragging items.
        */
        FileViewerForm.prototype.onDrop = function (e) {
            if (this.visible) {
                if (jQuery(".list-block", this.element).hasClass("drag-here"))
                    jQuery(".list-block", this.element).removeClass("drag-here");

                e.preventDefault();
                e.stopPropagation();

                var files = e.originalEvent.dataTransfer.files;
                if (files.length > 0) {
                    if (this.selectedID) {
                        var extStr = this.extensions.join("|");
                        var extAccepted = false;
                        var i = files.length;
                        while (i--) {
                            var fExt = files[i].name.split(".");
                            fExt = fExt[fExt.length - 1];
                            fExt.toLowerCase();

                            extAccepted = false;
                            var ii = this.extensions.length;
                            while (ii--)
                                if (fExt == this.extensions[ii].toLowerCase()) {
                                    extAccepted = true;
                                    break;
                                }

                            if (!extAccepted) {
                                this.statusBar.element.fadeIn();
                                jQuery(".upload-text", this.statusBar.element).text('Only ' + extStr + ' files are allowed');
                                return false;
                            }
                        }
                    }

                    // check for valid file extension
                    jQuery(".upload-text", this.statusBar.element).text("");

                    this.uploader.uploadFileList(e.originalEvent.dataTransfer.files);
                    return false;
                }
            }
        };

        /**
        * This function is used to create a new group on the file viewer toolbar
        * @returns {Component} Returns the Component object representing the group
        */
        FileViewerForm.prototype.createGroup = function () {
            return this.toolbar.addChild("<div class='tool-bar-group'></div>");
        };

        /**
        * Use this function to create a group button for the toolbar
        * @param {string} text The text for the button
        * @param {string} image An image URL for the button icon
        * @param {Component} group The Component object representing the group
        * @returns {Component} Returns the Component object representing the button
        */
        FileViewerForm.prototype.createGroupButton = function (text, image, group) {
            return group.addChild("<div class='tab-button'><div><img src='" + image + "' /></div><div class='tool-bar-text'>" + text + "</div></div>");
        };

        /**
        * Shows the window.
        */
        FileViewerForm.prototype.showForm = function (id, extensions) {
            _super.prototype.show.call(this, null, undefined, undefined, true);

            this.selectedID = id;
            this.extensions = extensions;
            this.initializeLoader();
            this.update();

            this.onItemClicked(null, null);

            if (id != null)
                this.okButton.element.show();
else
                this.okButton.element.hide();

            this.catUser.element.removeClass("selected");
            this.catGlobal.element.removeClass("selected");
            this.catProject.element.removeClass("selected");
            this.catProject.element.addClass("selected");

            var project = Animate.User.getSingleton().project;
            project.loadFiles();
            project.removeEventListener(Animate.ProjectEvents.FILES_CREATED, this.onFilesLoaded, this);
            project.addEventListener(Animate.ProjectEvents.FILES_CREATED, this.onFilesLoaded, this);
        };

        /**
        * Called when the files have been loaded
        * @param {ProjectEvents} response
        * @param {Event} data
        */
        FileViewerForm.prototype.onFilesLoaded = function (response, data) {
            var project = Animate.User.getSingleton().project;
            project.removeEventListener(Animate.ProjectEvents.FILES_CREATED, this.onFilesLoaded, this);
            this.populateFiles(project.files);
        };

        /**
        * Called when the files have been loaded
        * @param {ProjectEvents} response
        * @param {Event} data
        */
        FileViewerForm.prototype.onFilesFetched = function (response, data) {
            var project = Animate.User.getSingleton().project;
            project.removeEventListener(Animate.ProjectEvents.FILES_FETCHED, this.onFilesFetched, this);
            this.populateFiles(project.files);
        };

        /**
        * Gets the viewer to search using the terms in the search inut
        * @returns {any}
        */
        FileViewerForm.prototype.searchItems = function () {
            var items = this.menu.items;
            var i = items.length;
            while (i--) {
                var ii = items[i].components.length;

                var searchTerm = jQuery("input", this.search.element).val();
                var baseString = (items[i].fields[1] + items[i].fields[2]);
                var result = baseString.search(new RegExp(searchTerm, "i"));

                while (ii--)
                    if (result != -1)
                        items[i].components[ii].element.show();
else
                        items[i].components[ii].element.hide();
            }
        };

        /**
        * When we hit a key on the search box
        * @param {any} e The jQuery event
        */
        FileViewerForm.prototype.onInputKey = function (e) {
            if (e.keyCode == 13)
                this.searchItems();
        };

        /**
        * Called when a file is imported
        * @param {ProjectEvents} e
        * @param {File} file
        */
        FileViewerForm.prototype.onFileImported = function (e, event) {
            //Not a project file - so we have to import it.
            var project = Animate.User.getSingleton().project;
            project.removeEventListener(Animate.ProjectEvents.FILE_IMPORTED, this.onFileImported, this);

            this.dispatchEvent(new FileViewerFormEvent(FileViewerFormEvents.FILE_CHOSEN, event.tag));
            this.clearItems();
            this.hide();
        };

        /**
        * Called when we click one of the buttons. This will dispatch the event OkCancelForm.CONFIRM
        and pass the text either for the ok or cancel buttons.
        * @param {any} e The jQuery event object
        */
        FileViewerForm.prototype.onButtonClick = function (e) {
            e.preventDefault();

            var target = jQuery(e.target);

            if (target.is(jQuery("img", this.search.element))) {
                this.searchItems();
            } else if (target.is(this.okButton.element)) {
                var file = null;
                var items = this.menu.getSelectedItems();
                if (items.length > 0)
                    file = items[0].tag;

                if (this.catProject.element.hasClass("selected")) {
                    this.dispatchEvent(new FileViewerFormEvent(FileViewerFormEvents.FILE_CHOSEN, file));
                    this.clearItems();
                    this.hide();
                } else {
                    //Not a project file - so we have to import it.
                    var project = Animate.User.getSingleton().project;
                    project.importFile(file);
                    project.removeEventListener(Animate.ProjectEvents.FILE_IMPORTED, this.onFileImported, this);
                    project.addEventListener(Animate.ProjectEvents.FILE_IMPORTED, this.onFileImported, this);
                }
            } else if (target.is(this.modeGrid.element)) {
                this.modeList.element.removeClass("selected");
                this.modeGrid.element.addClass("selected");
                this.menu.displayMode = Animate.ListViewType.IMAGES;
            } else if (target.is(this.modeList.element)) {
                this.modeGrid.element.removeClass("selected");
                this.modeList.element.addClass("selected");
                this.menu.displayMode = Animate.ListViewType.DETAILS;
            } else if (target.is(this.catUser.element) || target.is(this.catGlobal.element) || target.is(this.catProject.element)) {
                this.catUser.element.removeClass("selected");
                this.catGlobal.element.removeClass("selected");
                this.catProject.element.removeClass("selected");

                target.addClass("selected");

                if (target.is(this.catProject.element)) {
                    this.addRemoveGroup.enabled = true;
                    this.favouriteGroup.enabled = true;

                    //Re-download project files
                    this.update();
                    this.onItemClicked(null, null);
                    var project = Animate.User.getSingleton().project;
                    project.loadFiles();
                    project.removeEventListener(Animate.ProjectEvents.FILES_CREATED, this.onFilesLoaded, this);
                    project.addEventListener(Animate.ProjectEvents.FILES_CREATED, this.onFilesLoaded, this);

                    this.okButton.text = "Use this File";
                } else {
                    this.addRemoveGroup.enabled = false;
                    this.favouriteGroup.enabled = false;

                    //Either download user or global files
                    this.onItemClicked(null, null);
                    var project = Animate.User.getSingleton().project;
                    if (target.is(this.catUser.element))
                        project.fetchFiles("user");
else
                        project.fetchFiles("global");
                    project.removeEventListener(Animate.ProjectEvents.FILES_FETCHED, this.onFilesFetched, this);
                    project.addEventListener(Animate.ProjectEvents.FILES_FETCHED, this.onFilesFetched, this);

                    this.okButton.text = "Import";
                }
            } else if (target.is(this.removeButton.element)) {
                var project = Animate.User.getSingleton().project;
                var items = this.menu.getSelectedItems();

                if (items.length > 0) {
                    var file = items[0].tag;

                    this.statusBar.element.fadeIn();
                    jQuery(".upload-text", this.statusBar.element).text('Deleting file...');

                    if (file) {
                        project.addEventListener(Animate.ProjectEvents.FAILED, this.onFileDeleted, this);
                        project.addEventListener(Animate.ProjectEvents.FILE_DELETED, this.onFileDeleted, this);
                        project.deleteFile(file);
                    }
                }
            } else if (target.is(this.updateButton.element)) {
                var project = Animate.User.getSingleton().project;
                project.addEventListener(Animate.ProjectEvents.FAILED, this.onFileDeleted, this);
                var items = this.menu.getSelectedItems();
                if (items.length > 0) {
                    var file = items[0].tag;

                    this.statusBar.element.fadeIn();
                    jQuery(".upload-text", this.statusBar.element).text('Updating file...');

                    if (file) {
                        project.addEventListener(Animate.ProjectEvents.FAILED, this.onFileDeleted, this);
                        project.addEventListener(Animate.ProjectEvents.FILE_UPDATED, this.onFileUpdated, this);
                        project.updateFile(file, this.name.text, this.tags.text, file.favourite, this.global.checked);
                    }
                }
            } else if (target.is(this.favourite.element)) {
                var items = this.menu.getSelectedItems();
                if (items.length > 0) {
                    var file = items[0].tag;
                    if (file) {
                        if (file.favourite == "false")
                            file.favourite = "true";
else
                            file.favourite = "false";

                        this.updateButton.element.trigger("click");
                    }
                }
            } else
                this.dispatchEvent(new FileViewerFormEvent(FileViewerFormEvents.CANCELLED, null));
        };

        /**
        * Clears up the contents to free the memory
        */
        FileViewerForm.prototype.clearItems = function () {
            var i = this.preview.children.length;
            while (i--)
                this.preview.children[i].dispose();
        };

        /**
        * When we click the close button on the status note
        */
        FileViewerForm.prototype.onItemClicked = function (responce, event) {
            this.clearItems();

            if (event == null || event.item == null) {
                this.name.text = "";
                this.tags.text = "";
                this.size.text = "";
                this.path.text = "";
                this.removeButton.enabled = false;
                this.menu.setSelectedItems(null);
                this.updateButton.enabled = false;
                this.favourite.enabled = false;
                this.global.checked = false;
                this.favourite.element.removeClass("selected");
                jQuery(".selected-asset", this.listInfo.element).text("None Selected. ");
                jQuery(".header-name", this.previewHeader.element).text("Preview: ");

                //Get the plugin to display a preview
                Animate.PluginManager.getSingleton().displayPreview(null, this.preview);
                return;
            }

            this.updateButton.enabled = true;
            this.removeButton.enabled = true;
            this.favourite.enabled = true;

            var file = event.item.tag;
            this.name.text = file.name;
            this.tags.text = file.tags.join(",");
            this.size.text = ((parseInt(file.size.toString()) / (1024 * 1024))).toFixed(3) + "M";
            this.path.text = file.path;

            if (file.global)
                this.global.checked = true;
else
                this.global.checked = false;

            this.thumbnail.text = file.preview_path;

            if (file.favourite == "false")
                this.favourite.element.removeClass("selected");
else
                this.favourite.element.addClass("selected");

            jQuery(".selected-asset", this.listInfo.element).text("Selected: " + file.name);

            jQuery(".header-name", this.previewHeader.element).text("Preview: " + file.name);

            if (Animate.PluginManager.getSingleton().displayPreview(file, this.preview))
                return true;

            if (this.handleDefaultPreviews(file, this.preview))
                return;
        };

        /**
        * @type public enum hide
        * Hide this form
        * @extends <FileViewerForm>
        */
        FileViewerForm.prototype.hide = function () {
            _super.prototype.hide.call(this);

            var i = this.preview.children.length;
            while (i--)
                if (this.preview.children[i].dispose)
                    this.preview.children[i].dispose();
        };

        /**
        * @type public mfunc handleDefaultPreviews
        * This will attempt to handle simple file previews
        * @param {any} file The file to preview
        * @param {any} previewComponent The preview box
        * @extends <FileViewerForm>
        * @returns <bool> True if this is handled
        */
        FileViewerForm.prototype.handleDefaultPreviews = function (file, previewComponent) {
            if (file == null)
                return false;

            var ext = jQuery.trim(file.extension.toLowerCase());
            if (ext == "jpg" || ext == "jpeg" || ext == "png" || ext == "gif") {
                var jQ = jQuery("<img style='margin: 0px auto 0px auto; display:block;' src='" + file.path + "' />");
                jQ.hide();
                previewComponent.element.append(jQ);
                jQ.fadeIn("slow");
                return true;
            }
        };

        /**
        * When we click the close button on the status note
        */
        FileViewerForm.prototype.onStatusCloseClick = function (id, fileName, response) {
            this.statusBar.element.fadeOut();
        };

        /**
        * Use this function to populate the files uploaded for use in this project.
        */
        FileViewerForm.prototype.populateFiles = function (files) {
            this.menu.clearItems();
            var counter = 0;
            var i = files.length;
            while (i--) {
                var file = files[i];

                if (this.extensions == null || this.extensions === undefined || jQuery.inArray(file.extension, this.extensions) != -1) {
                    //If its an image, we use the image as a preview
                    var ext = jQuery.trim(file.extension.toLowerCase());
                    var imgPath = "media/page.png";
                    if (file.preview_path)
                        imgPath = file.preview_path;
else if (ext == "jpg" || ext == "jpeg" || ext == "png" || ext == "gif")
                        imgPath = file.path;

                    var item = new Animate.ListViewItem([
                        file.id,
                        (file.favourite == "true" ? "<img src='media/star-small.png' style='width:20px; height:20px; position:relative; top:-5px; vertical-align:middle; left:0px;' />" + file.name : file.name),
                        file.tags.join(","),
                        ((parseInt(file.size.toString()) / (1024 * 1024))).toFixed(3) + "M",
                        file.path,
                        file.favourite,
                        file.createdOn,
                        file.lastModified,
                        file.extension
                    ], imgPath, imgPath);

                    item.tag = file;
                    this.menu.addItem(item);
                    counter++;
                }
            }

            this.menu.updateItems();
            jQuery(".assets", this.listInfo.element).text((counter) + " assets listed");
        };

        /**
        * Fired when the upload is complete
        */
        FileViewerForm.prototype.onUploadComplete = function (id, fileName, response) {
            if (response.message) {
                jQuery(".upload-text", this.statusBar.element).text(response.message);
                this.addButton.enabled = true;

                if (Animate.LoaderEvents.fromString(response.return_type.toString()) == Animate.ServerResponses.SUCCESS) {
                    var project = Animate.User.getSingleton().project;
                    project.mRequest = "getProjectFiles";
                    project.onServer(Animate.LoaderEvents.COMPLETE, new Animate.AnimateServerEvent(Animate.LoaderEvents.COMPLETE, response.message, Animate.ServerResponses.SUCCESS, response), this);

                    this.populateFiles(project.files);

                    this.catUser.element.removeClass("selected");
                    this.catGlobal.element.removeClass("selected");
                    this.catProject.element.removeClass("selected");
                    this.catProject.element.addClass("selected");
                }
            } else {
                jQuery(".upload-text", this.statusBar.element).text('Error Uploading File.');
                this.addButton.enabled = true;
            }
        };

        /**
        * Fired when the upload is cancelled due to an error
        */
        FileViewerForm.prototype.onError = function (id, fileName, reason) {
            jQuery(".upload-text", this.statusBar.element).text('Error Uploading File.');
            this.addButton.enabled = true;
        };

        /**
        * When we receive a progress event
        */
        FileViewerForm.prototype.onCancel = function (id, fileName) {
            jQuery(".upload-text", this.statusBar.element).text('Cancelled');
            this.addButton.enabled = true;
        };

        /**
        * When we receive a progress event
        */
        FileViewerForm.prototype.onProgress = function (id, fileName, loaded, total) {
            jQuery(".upload-text", this.statusBar.element).text('Uploading...' + ((loaded / total) * 100));
        };

        /**
        * When we click submit on the upload button
        */
        FileViewerForm.prototype.onSubmit = function (file, ext) {
            this.statusBar.element.fadeIn("slow");
            var extStr = this.extensions.join("|");

            var fExt = ext.split(".");
            fExt = fExt[fExt.length - 1];
            fExt.toLowerCase();
            var extAccepted = false;

            if (this.selectedID) {
                var i = this.extensions.length;
                while (i--)
                    if (fExt.toLowerCase() == this.extensions[i].toLowerCase()) {
                        extAccepted = true;
                        break;
                    }

                if (extAccepted == false) {
                    // check for valid file extension
                    jQuery(".upload-text", this.statusBar.element).text('Only ' + extStr + ' files are allowed');
                    return false;
                }
            }

            jQuery(".upload-text", this.statusBar.element).text('Uploading...');
            this.addButton.enabled = false;
        };

        /**
        * When we click submit on the preview upload button
        */
        FileViewerForm.prototype.onThumbSubmit = function (file, ext) {
            this.statusBar.element.fadeIn("slow");
            var imageExtensions = ["png", "jpg", "jpeg", "gif"];
            var extStr = imageExtensions.join("|");

            var fExt = ext.split(".");
            fExt = fExt[fExt.length - 1];
            fExt.toLowerCase();
            var extAccepted = false;

            var selectedItems = this.menu.getSelectedItems();
            if (selectedItems == null || selectedItems.length == 0) {
                jQuery(".upload-text", this.statusBar.element).text("No file selected.");
                return false;
            }

            var i = this.extensions.length;
            while (i--)
                if (fExt.toLowerCase() == imageExtensions[i].toLowerCase()) {
                    extAccepted = true;
                    break;
                }

            if (extAccepted == false) {
                // check for valid file extension
                jQuery(".upload-text", this.statusBar.element).text('Only ' + extStr + ' files are allowed');
                return false;
            }

            var file = selectedItems[0].tag;

            //Update the thumbuploader
            this.thumbUploader.setParams({ projectID: Animate.User.getSingleton().project.id, "category": "files", "command": "uploadThumb", "fileID": file.id });

            jQuery(".upload-text", this.statusBar.element).text('Uploading...');
            this.addButton.enabled = false;
        };

        /**
        * This is called to initialize the one click loader
        */
        FileViewerForm.prototype.initializeLoader = function () {
            if (!this.uploader) {
                this.uploader = new qq.FileUploaderBasic({
                    button: document.getElementById(this.addButton.id),
                    action: Animate.DB.HOST,
                    onSubmit: this.submitProxy,
                    onComplete: this.completeProxy,
                    onCancel: this.cancelProxy,
                    onProgress: this.progressProxy,
                    onError: this.errorProxy
                });
            }

            if (!this.thumbUploader) {
                this.thumbUploader = new qq.FileUploaderBasic({
                    button: document.getElementById(this.thumbnail.id),
                    action: Animate.DB.HOST,
                    onSubmit: this.thumbSubmitProxy,
                    onComplete: this.completeProxy,
                    onCancel: this.cancelProxy,
                    onProgress: this.progressProxy,
                    onError: this.errorProxy
                });

                this.thumbUploader._options.allowedExtensions.push("jpg", "png", "jpeg");
            }

            this.uploader.setParams({ projectID: Animate.User.getSingleton().project.id, "category": "files", "command": "upload" });
            this.thumbUploader.setParams({ projectID: Animate.User.getSingleton().project.id, "category": "files", "command": "uploadThumb", "file": "" });

            //Set the allowed extensions
            this.uploader._options.allowedExtensions.splice(0, this.uploader._options.allowedExtensions.length);
            if (this.extensions) {
                for (var i = 0; i < this.extensions.length; i++)
                    this.uploader._options.allowedExtensions.push(this.extensions[i]);
            }
        };

        /**
        * This is called when a file has been successfully deleted.
        */
        FileViewerForm.prototype.onFileUpdated = function (response, event) {
            var data = event.tag;
            var items = this.menu.getSelectedItems();
            var project = Animate.User.getSingleton().project;
            project.removeEventListener(Animate.ProjectEvents.FILE_UPDATED, this.onFileUpdated, this);
            project.removeEventListener(Animate.ProjectEvents.FILE_DELETED, this.onFileDeleted, this);
            project.removeEventListener(Animate.ProjectEvents.FAILED, this.onFileDeleted, this);

            if (items.length > 0) {
                if (this.modeGrid.element.hasClass("selected")) {
                    jQuery(".info", items[0].components[0].element).html((data.favourite == "true" ? "<img src='media/star-small.png' style='width:20px; height:20px; position:relative; top:-5px; vertical-align:middle; left:0px;' />" + data.name : data.name));
                } else {
                    items[0].components[1].element.html((data.favourite == "true" ? "<img src='media/star-small.png' style='width:20px; height:20px; position:relative; top:-5px; vertical-align:middle; left:0px;' />" + data.name : data.name));
                    items[0].components[2].element.text(data.tags);
                    items[0].components[3].element.text(data.lastModified);
                    items[0].components[5].element.text(data.favourite);
                }

                items[0].fields[1] = (data.favourite == "true" ? "<img src='media/star-small.png' style='width:20px; height:20px; position:relative; top:-5px; vertical-align:middle; left:0px;' />" + data.name : data.name);
                items[0].fields[2] = data.tags;
                items[0].fields[7] = data.lastModified;
                items[0].fields[5] = data.favourite;

                if (data.favourite == "false")
                    this.favourite.element.removeClass("selected");
else
                    this.favourite.element.addClass("selected");

                jQuery(".upload-text", this.statusBar.element).text('File updated');
            }
        };

        /**
        * This is called when a file has been successfully deleted.
        */
        FileViewerForm.prototype.onFileDeleted = function (response, event) {
            var project = Animate.User.getSingleton().project;

            if (response == Animate.ProjectEvents.FILE_DELETED) {
                var items = this.menu.getSelectedItems();
                if (items.length > 0)
                    this.menu.removeItem(items[0]);

                jQuery(".upload-text", this.statusBar.element).text('File deleted.');

                this.onItemClicked(Animate.ListEvents.ITEM_SELECTED, null);
            } else {
                this.statusBar.element.show();
                jQuery(".upload-text", this.statusBar.element).text(event.message);
            }

            project.removeEventListener(Animate.ProjectEvents.FAILED, this.onFileDeleted, this);
            project.removeEventListener(Animate.ProjectEvents.FILE_DELETED, this.onFileDeleted, this);
        };

        /**
        * This function is used to cleanup the object before its removed from memory.
        */
        FileViewerForm.prototype.dispose = function () {
            jQuery("img", this.search.element).off("click", this.buttonProxy);
            this.modeGrid.element.off("click", this.buttonProxy);
            this.modeList.element.off("click", this.buttonProxy);
            this.favourite.element.off("click", this.buttonProxy);
            jQuery("img", this.statusBar.element).off();

            //this.refresh.element.off("unclick", this.buttonProxy);
            this.okButton.element.off("click", this.buttonProxy);
            jQuery("input", this.search.element).off("keydown", this.keyDownProxy);

            this.updateButton.element.off();
            this.addButton.element.off();
            this.removeButton.element.off();
            this.addButton = null;
            this.updateButton = null;
            this.removeButton = null;
            this.buttonProxy = null;
            this.okButton = null;
            this.keyDownProxy = null;

            //Call super
            _super.prototype.dispose.call(this);
        };

        FileViewerForm.getSingleton = /** Gets the singleton instance. */
        function () {
            if (!FileViewerForm._singleton)
                new FileViewerForm();

            return FileViewerForm._singleton;
        };
        return FileViewerForm;
    })(Animate.Window);
    Animate.FileViewerForm = FileViewerForm;
})(Animate || (Animate = {}));
//# sourceMappingURL=FileViewerForm.js.map
