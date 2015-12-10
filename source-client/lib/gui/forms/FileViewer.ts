module Animate
{
    /**
	* An event to deal with file viewer events 
    * The event type can be 'cancelled' or 'change'
	*/
	export class FileViewerEvent extends Event
	{
        public file: Engine.IFile;
        constructor(type: string, file: Engine.IFile )
		{
			super( type, file );
			this.file = file;
		}
    }

    /**
	* Defines which types of files to search through 
	*/
    export enum FileSearchType
    {
        Global,
        User,
        Project
    }
    
	/**
	* This form is used to load and select assets.
	*/
    export class FileViewer extends Window
    {
        private static _singleton: FileViewer;
        
        // New variables
        private _browserElm: JQuery;
        private _searchType: FileSearchType;
        private _shiftkey: boolean;
        private _cancelled: boolean;

        private $pager: PageLoader;
        private $selectedFile: Engine.IFile;
        private $loading: boolean;
        private $errorMsg: string;
        private $search: string;
        private $entries: Array<Engine.IFile>;
        private $folders: Array<string>;
        private $confirmDelete: boolean;
        private $newFolder: boolean;
        private $editMode: boolean;
        private $fileToken: Engine.IFile;
        private $uploader: FileUploader;
        private $onlyFavourites: boolean;
        
        public extensions: Array<string>;
        public selectedEntities: Array<UsersInterface.IFileEntry>;
        public selectedEntity: Engine.IFile;
        public selectedFolder: string;
        public multiSelect: boolean;
        
        
        /**
        * Creates an instance of the file uploader form
        */
        constructor()
        {
            FileViewer._singleton = this;
            var that = this;

            // Call super-class constructor
            super(1000, 600, true, true, "Asset Browser");
            this.element.attr("id", "file-viewer-window");

            this._browserElm = jQuery("#file-viewer").remove().clone();
            this.content.element.append(this._browserElm);
            this.$newFolder = false;
            this.$selectedFile = null;
            this.$errorMsg = "";
            this.$confirmDelete = false;
            this._cancelled = true;
            this.$pager = new PageLoader(this.updateContent.bind(this));
            this.$pager.limit = 15;
            this.selectedEntities = [];
            this.selectedEntity = null;
            this.selectedFolder = null;
            this.$search = "";
            this.$onlyFavourites = false;
            this.$entries = [];
            this.$folders = [];
            this.extensions = [];
            this.multiSelect = true;
            this._shiftkey = false;
            this.$editMode = false;
            this._searchType = FileSearchType.User;
            this.$fileToken = { tags: [] };

            // Create the file uploader
            this.$uploader = new FileUploader(
                function (loaded: number)
                {
                    Compiler.digest(that._browserElm, that);
                },
                function (err: Error)
                {
                    if (err)
                    {
                        that.$errorMsg = err.message;
                        Compiler.digest(that._browserElm, that);
                    }
                    else
                        that.$pager.invalidate();
                }
            );

            // Build the element with the compiler
            Compiler.build(this._browserElm, this);
            
            // Creates the filter options drop down
            var searchOptions: ToolbarDropDown = new ToolbarDropDown(null, [
                new ToolbarItem("media/assets-user.png", "Filter by My Files"),
                new ToolbarItem("media/assets-project.png", "Filter by Project Files"),
                new ToolbarItem("media/assets-global.png", "Filter by Global Files")
            ]);

            // Add the drop down to dom
            jQuery("#file-search-mode", this._browserElm).append(searchOptions.element);
            $(document).on('keyup keydown', function (e) { that._shiftkey = e.shiftKey });

            // Set the mode when they are clicked
            searchOptions.on("clicked", function (e: EventType, event: Event, sender: ToolbarDropDown)
            {
                if (sender.selectedItem.text == "Filter by Project Files")
                    that.selectMode(FileSearchType.Project);
                else if (sender.selectedItem.text == "Filter by My Files")
                    that.selectMode(FileSearchType.User);
                else
                    that.selectMode(FileSearchType.Global);
            });
            
            // Make the form resizable
            this.element.resizable(<JQueryUI.ResizableOptions>{
                minHeight: 50,
                minWidth: 50,
                helper: "ui-resizable-helper"
            });

            jQuery(".file-items", this.element).on('dragexit', this.onDragLeave.bind(this));
            jQuery(".file-items", this.element).on('dragleave', this.onDragLeave.bind(this));
            jQuery(".file-items", this.element).on('dragover', this.onDragOver.bind(this));
            jQuery(".file-items", this.element).on('drop', this.onDrop.bind(this));
        }

        /**
        * Returns a URL of a file preview image
        * @returns {string}
        */
        getThumbnail(file: Engine.IFile): string
        {
            if (file.previewUrl)
                return file.previewUrl;
            else
                return "./media/appling.png";
        }

        /**
        * Specifies the type of file search
        */
        selectMode(type: FileSearchType)
        {
            this._searchType = type;
            this.$pager.invalidate();
        }

        /**
        * Attempts to open a folder
        */
        openFolder(folder: string)
        {
            this.$pager.index = 0;
            this.selectedFolder = folder;
            this.$confirmDelete = false;
            this.$newFolder = false;
            this.$errorMsg = "";
            this.$search = "";
            this.$pager.invalidate();
        }

        /**
        * Creates a new folder 
        */
        newFolder()
        {
            var that = this;
            var details = User.get.entry;
            var folderName: string = $("#new-folder-name").val();
            var mediaURL = DB.USERS + "/media";

            // Empty names not allowed
            if (folderName.trim() == "")
            {
                that.$errorMsg = "Please specify a valid folder name";
                return Animate.Compiler.digest(that._browserElm, that);
            }

            that.$errorMsg = "";
            that.$loading = true;

            jQuery.post(`${mediaURL}/create-bucket/${details.username}/${folderName}`, null).then(function (token: UsersInterface.IResponse)
            {
                if (token.error)
                    that.$errorMsg = token.message;
                else
                {
                    $("#new-folder-name").val("");
                    that.$newFolder = false;
                    that.$pager.invalidate();
                }

                that.$loading = false;
                Animate.Compiler.digest(that._browserElm, that);
            });
        }

        /**
        * Shows / Hides the delete buttons
        */
        confirmDelete()
        {
            this.$confirmDelete = !this.$confirmDelete;
            if (this.$confirmDelete)
            {
                //var fileType = (this.selectedFolder ? "file" : "folder");
                var fileType = "file";
                this.$errorMsg = `Are you sure you want to delete ${(this.selectedEntities.length > 1 ? `these [${this.selectedEntities.length}]` : "the ") } ${fileType}${(this.selectedEntities.length > 1 ? "s" : " '" + this.selectedEntities[0].name + "'") }`;
            }
            else
                this.$errorMsg = "";
        }

        /**
        * Called in the HTML once a file is clicked and we need to get a preview of it
        * @param {IFile} file The file to preview
        */
        getPreview(file: Engine.IFile)
        {
            var preview = <HTMLDivElement>this._browserElm[0].querySelector("#file-preview");
            var child = PluginManager.getSingleton().displayPreview(file, this.uploadPreview);
            var curChild = (preview.childNodes.length > 0 ? preview.childNodes[0] : null);

            if (curChild && child != curChild)
                preview.removeChild(preview.childNodes[0]);

            if (child && curChild != child)
                preview.appendChild(child);
        }

        /**
        * Sets the selected status of a file or folder
        */
        selectEntity(entity)
        {
            this.$errorMsg = "";
            this.$confirmDelete = false;

            entity.selected = !entity.selected;
            var ents = this.selectedEntities;

            if (entity.selected)
            {
                if (this.multiSelect && this._shiftkey == false)
                {
                    for (var i = 0, l = ents.length; i < l; i++)
                        (<any>ents[i]).selected = false;

                    ents.splice(0, ents.length);
                }

                ents.push(entity);
            }
            else
                ents.splice(ents.indexOf(entity), 1);

            if (ents.length == 0)
                this.selectedEntity = null;
            else
                this.selectedEntity = ents[ents.length - 1];

            // Set the selected file
            //if (this.selectedFolder)
            //{
            var f = this.$selectedFile = <Engine.IFile>this.selectedEntity;
            if (f)
                this.$fileToken = { name: f.name, tags: f.tags.slice(), favourite: f.favourite, global: f.global, _id: f._id };
            ///}
            //else
            //    this.$selectedFile = null;
        }

        /**
		* Removes the window and modal from the DOM.
		*/
        hide()
        {
            this.emit(new FileViewerEvent("selected", (this._cancelled ? null : this.selectedEntity)));
            super.hide();
            this.extensions.splice(0, this.extensions.length);
        }

        /**
        * Called whenever we select a file
        */
        fileChosen(file: Engine.IFile)
        {
            this._cancelled = false;
            this.hide();
            this._cancelled = true;
        }

        /**
        * Removes the selected entities
        */
        removeEntities()
        {
            var that = this;
            that.$errorMsg = "";
            that.$editMode = false;
            that.$loading = true;
            var mediaURL = DB.USERS + "/media";
            //var command = (this.selectedFolder ? "remove-files" : "remove-buckets");
            var command = "remove-files";
            var entities = "";

            //if (this.selectedFolder)
            for (var i = 0, l = this.selectedEntities.length; i < l; i++)
                entities += (<UsersInterface.IFileEntry>this.selectedEntities[i]).identifier + ",";
            //else
            //    for (var i = 0, l = this.selectedEntities.length; i < l; i++)
            //        entities += (<UsersInterface.IBucketEntry>this.selectedEntities[i]).name + ",";

            entities = (entities.length > 0 ? entities.substr(0, entities.length - 1) : "");
            Utils.delete(`${mediaURL}/${command}/${entities}`).then(function (token: UsersInterface.IResponse)
            {
                if (token.error)
                    that.$errorMsg = token.message;
                that.$loading = false;
                that.$confirmDelete = false;
                that.$pager.invalidate();
            });
        }

        /*
        * Fetches a list of user buckets and files
        * @param {number} index 
        * @param {number} limit
        */
        updateContent(index: number, limit: number)
        {
            var that = this;
            var details = User.get.entry;
            var project = User.get.project;
            var command = "";
            that.$loading = true;
            that.$errorMsg = "";
            that.$selectedFile = null;
            this.selectedEntities.splice(0, this.selectedEntities.length);
            this.selectedEntity = null;

            Animate.Compiler.digest(that._browserElm, that);
            
            //if (this.selectedFolder)
            //{
            if (this._searchType == FileSearchType.Project)
                command = `${DB.API}/files/${details.username}/${project.entry._id}/?index=${index}&limit=${limit}&favourite=${this.$onlyFavourites}&search=${that.$search}&bucket=${details.username}-bucket`
            else
                command = `${DB.API}/files/${details.username}/?index=${index}&limit=${limit}&favourite=${this.$onlyFavourites}&search=${that.$search}&bucket=${details.username}-bucket`
            //}
            //else
            //    command = `${DB.USERS}/media/get-buckets/${details.username}/?index=${index}&limit=${limit}&search=${that.$search}`

            jQuery.getJSON(command).then(function (token: UsersInterface.IGetFiles)
            {
                if (token.error)
                {
                    that.$errorMsg = token.message;
                    that.$entries = [];
                    that.$pager.last = 1;
                }
                else
                {
                    that.$entries = token.data;
                    that.$entries = that.filterByExtensions();
                    that.$pager.last = token.count;
                }

                that.$loading = false;
                return Animate.Compiler.digest(that._browserElm, that);
            });
        }      

		/**
		* Called when we are dragging over the item
		*/
        onDragOver(e)
        {
            if (this.visible)
            {
                var items = e.originalEvent.dataTransfer.items;
                if (items.length > 0)
                {
                    if (!jQuery(".file-items", this.element).hasClass("drag-here"))
                        jQuery(".file-items", this.element).addClass("drag-here");
                }
                else if (jQuery(".file-items", this.element).hasClass("drag-here"))
                    jQuery(".file-items", this.element).removeClass("drag-here");

            }

            e.preventDefault();
            e.stopPropagation();
        }
        
		/**
		* Called when we are no longer dragging items.
		*/
        onDragLeave(e)
        {
            if (this.visible)
            {
                if (jQuery(".file-items", this.element).hasClass("drag-here"))
                    jQuery(".file-items", this.element).removeClass("drag-here");
            }
        }

        /**
        * Checks if a file list has approved extensions
        * @return {boolean}
        */
        checkIfAllowed(files: FileList): boolean
        {
            var extensions = this.extensions;

            // Approve all extensions unless otherwise stated
            if (extensions.length > 0)
            {
                for (var f = 0, fl = files.length; f < fl; f++)
                {
                    var split = files[f].name.split("."),
                        ext = split[split.length - 1].toLowerCase(),
                        extFound = false;

                    for (var i = 0, l = extensions.length; i < l; i++)
                        if (extensions[i] == ext)
                        {
                            extFound = true;
                            break;
                        }

                    if (!extFound)
                        return false;
                }
            }

            return true;
        }

        /**
		* Makes sure we only view the file types specified in the exension array
		*/
        filterByExtensions(): Array<Engine.IFile>
        {
            var extensions = this.extensions,
                files = this.$entries,
                ext = "",
                hasExtension = false;

            if (extensions.length == 0)
                return this.$entries;

            var filtered = [];
                

            for (var i = 0, l = files.length; i < l; i++)
            {
                ext = files[i].extension.split(/\\|\//).pop().trim();
                hasExtension = false;

                for (var ii = 0, li = extensions.length; ii < li; ii++)
                {
                    if (ext == extensions[ii])
                    {
                        hasExtension = true;
                        break;
                    }
                }

                if (hasExtension)
                    filtered.push(files[i]);
            }

            return filtered;
        }

		/**
		* Called when we are no longer dragging items.
		*/
        onDrop(e: JQueryEventObject)
        {
            var details = User.get.entry;

            if (this.visible)
            {
                if (jQuery(".file-items", this.element).hasClass("drag-here"))
                    jQuery(".file-items", this.element).removeClass("drag-here");

                e.preventDefault();
                e.stopPropagation();

                var files = (<DragEvent>e.originalEvent).dataTransfer.files;
                if (files.length > 0)
                {
                    // Make sure the file types are allowed
                    if (!this.checkIfAllowed(files))
                    {
                        this.$errorMsg = `Only ${this.extensions.join(', ') } file types are allowed`;
                        Compiler.digest(this._browserElm, this);
                        return false;
                    }

                    // Now upload each file
                    for (var i: number = 0, l = files.length; i < l; i++)
                        this.$uploader.uploadFile(files[i], { browsable: true });

                    return false;
                }
            }
        }

        /**
		* Attempts to upload an image or canvas to the users asset directory and set the upload as a file's preview
        * @param {Engine.IFile} file The target file we are setting the preview for
        * @param {HTMLCanvasElement | HTMLImageElement} preview The image we are using as a preview
		*/
        uploadPreview(file: Engine.IFile, preview: HTMLCanvasElement | HTMLImageElement)
        {
            var that = FileViewer._singleton;
            var details = User.get.entry;
            var loaderDiv = jQuery(".preview-loader", that._browserElm);
            loaderDiv.css({ "width": "0%", "height": "1px" });

            // Create the uploader
            var fu = new FileUploader(function (p)
            {
                // Update the loading bar
                loaderDiv.css({ "width": p + "%", "height": "1px"} );

            }, function (err: Error, tokens: Array<UsersInterface.IUploadToken>)
            {
                // Remove loading bar
                loaderDiv.css({ "width": "", "height" : "" });
                if (err)
                {
                    Logger.logMessage(err.message, null, LogType.ERROR);
                    return;
                }
                else
                {
                    // Associate the uploaded preview with the file
                    Utils.put(`${DB.API}/files/${details.username}/${file._id}`, <Engine.IFile>{ previewUrl: tokens[1].url }).then(function (token: UsersInterface.IResponse)
                    {
                        if (token.error)
                            Logger.logMessage(err.message, null, LogType.ERROR);

                        file.previewUrl = tokens[1].url;

                    }).catch(function (err: IAjaxError)
                    {
                        Logger.logMessage(`An error occurred while connecting to the server. ${err.status}: ${err.message}`, null, LogType.ERROR);
                    });                    
                }
            });

            // Starts the upload process
            fu.upload2DElement(preview, file.name + "-preview", { browsable: false }, file.identifier);
        }

        /**
		* Shows the window by adding it to a parent.
		* @param {Component} parent The parent Component we are adding this window to
		* @param {number} x The x coordinate of the window
		* @param {number} y The y coordinate of the window
		* @param {boolean} isModal Does this window block all other user operations?
		* @param {boolean} isPopup If the window is popup it will close whenever anything outside the window is clicked
		*/
        show(parent: Component = null, x: number = NaN, y: number = NaN, isModal: boolean = false, isPopup: boolean = false)
        {
            super.show(null, undefined, undefined, true);
            
            this.$errorMsg = "";
            this.$confirmDelete = false;
            this.$loading = false;
            this.$newFolder = false;
            this.selectedEntity = null;
            var that = this,
                details = User.get.entry,
                extensions = this.extensions,
                apiUrl = "";

            // Call update and redraw the elements
            this.$pager.invalidate();

            var onChanged = function ()
            {
                var input = <HTMLInputElement>this;

                //if (that.selectedFolder)
                //  apiUrl = `${DB.USERS}/media/upload/${details.username}-bucket`;
                //else
                //    return;

                // Make sure the file types are allowed
                if (!that.checkIfAllowed(input.files))
                {
                    that.$errorMsg = `Only ${that.extensions.join(', ') } file types are allowed`;
                    Compiler.digest(that._browserElm, that);

                    // Reset the value
                    (<HTMLInputElement>this).value = "";

                    return false;
                }

                // Upload each file
                for (var i = 0; i < input.files.length; i++)
                {
                    var file = input.files[i];
                    that.$uploader.uploadFile(file, { browsable: true });
                }

                // Reset the value
                (<HTMLInputElement>this).value = "";
            }

            var elm = document.getElementById('upload-new-file');

            // If we already added a function handler - then remove it
            if ((<any>elm)._func)
                elm.removeEventListener('change', (<any>elm)._func, false);

            elm.addEventListener('change', onChanged, false);
            (<any>elm)._func = onChanged;
        }

		/**
		* Use this function to show the file viewer and listen for when the user has selected a file
		*/
        choose(extensions: string | Array<string>): JQueryPromise<Engine.IFile>
        {
            // Show the form
            this.show(); 

            var d = jQuery.Deferred<Engine.IFile>(),
                that = this
            if (extensions == "img")
                this.extensions = ['jpg', 'jpeg', 'png', 'gif'];
            else
                this.extensions = <Array<string>>extensions;
            
            // When the file is chosen - return
            var fileChosen = function(type, event: FileViewerEvent, sender)
            {
                that.off("selected", fileChosen);
                d.resolve(event.file);
            }

            this.on("selected", fileChosen);
            return d.promise();
        }

        /**
		* Attempts to update the selected file
        * @param {IFile} token The file token to update with
		*/
        updateFile(token: Engine.IFile)
        {
            var that = this,
                details = User.get.entry;

            that.$loading = true;
            that.$errorMsg = "";
            that.$confirmDelete = false;
            Compiler.digest(that._browserElm, that);

            Utils.put(`${DB.API}/files/${details.username}/${token._id}`, token).then(function (response: UsersInterface.IResponse)
            {
                that.$loading = false;
                if (response.error)
                    that.$errorMsg = response.message;
                else
                {
                    that.$editMode = false;
                    for (var i in token)
                        if (that.$selectedFile.hasOwnProperty(i))
                            that.$selectedFile[i] = token[i];
                }

                Compiler.digest(that._browserElm, that);

            }).catch(function (err: IAjaxError)
            {
                that.$errorMsg = `An error occurred while connecting to the server. ${err.status}: ${err.message}`;
                Compiler.digest(that._browserElm, that);
            });
        }
        
		/** 
        * Gets the singleton instance. 
        * @returns {FileViewer}
        */
		static get get(): FileViewer
		{
			if ( !FileViewer._singleton )
				new FileViewer();

			return FileViewer._singleton;
		}
	}
}