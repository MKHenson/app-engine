module Animate
{
	export class FileViewerFormEvents extends ENUM
	{
		constructor(v: string) { super(v); }

		static OBJECT_RENAMED: FileViewerFormEvents = new FileViewerFormEvents("file_viewer_object_renamed");
		static OBJECT_RENAMING: FileViewerFormEvents = new FileViewerFormEvents("file_viewer_object_renaming");
		static FILE_CHOSEN: FileViewerFormEvents = new FileViewerFormEvents("file_viewer_file_chosen");
		static CANCELLED: FileViewerFormEvents = new FileViewerFormEvents("file_viewer_cancelled");
	}

	export class FileViewerFormEvent extends Event
	{
		public file: File;
		constructor( eventType: FileViewerFormEvents, file: File )
		{
			super( eventType, file );
			this.file = file;
		}
    }

    export enum FileSearchType
    {
        Global,
        User,
        Project
    }

	/**
	* This form is used to load and select assets.
	*/
	export class FileViewerForm extends Window
	{
        private static _singleton: FileViewerForm;
        
        // New variables
        private _browserElm: JQuery;
        private $pager: PageLoader;
        private $selectedFile: Engine.IFile;
        private $loading: boolean;
        private $errorMsg: string;
        private $search: string;
        private $entries: Array<Engine.IFile>;
        private $confirmDelete: boolean;
        private $newFolder: boolean;
        private $editMode: boolean;
        private $fileToken: Engine.IFile;
        private $uploader: FileUploader;
        private $onlyFavourites: boolean;
        private _searchType: FileSearchType;
        private _shiftkey: boolean;

        public extensions: Array<string>;
        public selectedEntities: Array<UsersInterface.IBucketEntry | UsersInterface.IFileEntry>;
        public selectedEntity: UsersInterface.IBucketEntry | Engine.IFile;
        public selectedFolder: UsersInterface.IBucketEntry;
        public multiSelect: boolean;
        
        /**
        * Creates an instance of the file uploader form
        */
		constructor()
		{
			FileViewerForm._singleton = this;
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
            this.$pager = new PageLoader(this.updateContent.bind(this));
            //this.$pager.limit = 2;
            this.selectedEntities = [];
            this.selectedEntity = null;
            this.selectedFolder = null;
            this.$search = "";
            this.$onlyFavourites = false;
            this.$entries = [];
            this.extensions = [];
            this.multiSelect = true;
            this._shiftkey = false;
            this.$editMode = false;
            this._searchType = FileSearchType.Project;
            this.$fileToken = { tags: [] };

            // Create the file uploader
            this.$uploader = new FileUploader(
                function (loaded: number) {
                    Compiler.digest(that._browserElm, that);
                },
                function (err: Error) {
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
                new ToolbarItem("media/assets-project.png", "Filter by Project Files"),
                new ToolbarItem("media/assets-user.png", "Filter by My Files"),
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

            jQuery(".file-items", this.element).on( 'dragexit', this.onDragLeave.bind( this ) );
            jQuery(".file-items", this.element).on( 'dragleave', this.onDragLeave.bind( this ) );
            jQuery(".file-items", this.element).on( 'dragover', this.onDragOver.bind( this ) );
            jQuery(".file-items", this.element).on( 'drop', this.onDrop.bind( this ) );
        }

        /**
        * Returns a URL of a file preview image
        * @returns {string}
        */
        getThumbnail(file: Engine.IFile): string
        {
            if (file.extension == "jpg" || file.extension == "jpeg" || file.extension == "png" || file.extension == "gif")
                return file.url;

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
        openFolder(folder: UsersInterface.IBucketEntry)
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
            var details = User.get.userEntry;
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
                var fileType = (this.selectedFolder ? "file" : "folder");
                this.$errorMsg = `Are you sure you want to delete ${(this.selectedEntities.length > 1 ? `these [${this.selectedEntities.length}]` : "the ") } ${fileType}${(this.selectedEntities.length > 1 ? "s" : " '" + this.selectedEntities[0].name + "'")}`;
            }
            else
                this.$errorMsg = "";
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
                if (this.multiSelect && this._shiftkey == false )
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
            if (this.selectedFolder)
            {
                var f = this.$selectedFile = <Engine.IFile>this.selectedEntity;
                if (f)
                    this.$fileToken = { name: f.name, tags: f.tags.slice(), favourite: f.favourite, global: f.global, _id: f._id };
            }
            else
                this.$selectedFile = null;
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
            var command = (this.selectedFolder ? "remove-files" : "remove-buckets");
            var entities = "";

            if (this.selectedFolder)
                for (var i = 0, l = this.selectedEntities.length; i < l; i++)
                    entities += (<UsersInterface.IFileEntry>this.selectedEntities[i]).identifier + ",";
            else
                for (var i = 0, l = this.selectedEntities.length; i < l; i++)
                    entities += (<UsersInterface.IBucketEntry>this.selectedEntities[i]).name + ",";

            entities = (entities.length > 0 ? entities.substr(0, entities.length - 1) : "");
            jQuery.ajax(`${mediaURL}/${command}/${entities}`, { type: "delete"}).then(function (token: UsersInterface.IResponse)
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
            var details = User.get.userEntry;
            var command = "";
            that.$loading = true;
            that.$errorMsg = "";
            that.$selectedFile = null;
            this.selectedEntities.splice(0, this.selectedEntities.length);
            this.selectedEntity = null;

            Animate.Compiler.digest(that._browserElm, that);
            
            if (this.selectedFolder)
            {
                if (this._searchType == FileSearchType.Project)
                    command = `${DB.API}/files/${details.username}/?index=${index}&limit=${limit}&favourite=${this.$onlyFavourites}&search=${that.$search}&bucket=${this.selectedFolder.identifier}`
                else
                    command = `${DB.API}/files/${details.username}/?index=${index}&limit=${limit}&favourite=${this.$onlyFavourites}&search=${that.$search}&bucket=${this.selectedFolder.identifier}`
            }
            else
                command = `${DB.USERS}/media/get-buckets/${details.username}/?index=${index}&limit=${limit}&search=${that.$search}`

            jQuery.getJSON(command).then(function (token : UsersInterface.IGetFiles)
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
                    that.$pager.last = token.count;
                }

                that.$loading = false;
                return Animate.Compiler.digest(that._browserElm, that);
            });
        }      

		/**
		* Called when we are dragging over the item
		*/
		onDragOver( e )
		{
			if ( this.visible )
			{
				var items = e.originalEvent.dataTransfer.items;
				if ( items.length > 0 )
				{
                    if (!jQuery( ".file-items", this.element ).hasClass( "drag-here" ) )
                        jQuery( ".file-items", this.element ).addClass( "drag-here" );
				}
                else if (jQuery( ".file-items", this.element ).hasClass( "drag-here" ) )
                    jQuery( ".file-items", this.element ).removeClass( "drag-here" );

			}

			e.preventDefault();
			e.stopPropagation();
		}
        
		/**
		* Called when we are no longer dragging items.
		*/
		onDragLeave( e )
		{
			if ( this.visible )
			{
                if (jQuery( ".file-items", this.element ).hasClass( "drag-here" ) )
                    jQuery( ".file-items", this.element ).removeClass( "drag-here" );
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
                    var split = files[i].name.split("."),
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
		* Called when we are no longer dragging items.
		*/
        onDrop(e: JQueryEventObject )
		{
			if ( this.visible )
			{
                if (jQuery( ".file-items", this.element ).hasClass( "drag-here" ) )
                    jQuery( ".file-items", this.element ).removeClass( "drag-here" );

				e.preventDefault();
				e.stopPropagation();

                var files = (<DragEvent>e.originalEvent).dataTransfer.files;
				if ( files.length > 0 )
                {
                    // Make sure the file types are allowed
                    if (!this.checkIfAllowed(files))
                    {
                        this.$errorMsg = `Only ${this.extensions.join(', ')} file types are allowed`;
                        Compiler.digest(this._browserElm, this);
                        return false;
                    }

                    // Now upload each file
                    for (var i: number = 0, l = files.length; i < l; i++ )
                        //this.uploadFile(files[i], `${DB.USERS}/media/upload/${this.selectedFolder.name}`);
                        this.$uploader.uploadFile(files[i], `${DB.USERS}/media/upload/${this.selectedFolder.name}`);

					return false;
				}
			}
		}

		/**
		* Shows the window.
		*/
		showForm( id : string, extensions : Array<string> )
		{
            super.show(null, undefined, undefined, true);
            this.$errorMsg = "";
            //this.$numLoading = 0;
            this.$confirmDelete = false;
            this.$loading = false;
            this.$newFolder = false;
            var that = this,
                details = User.get.userEntry,
                extensions = this.extensions,
                apiUrl = ""; 

            // Call update and redraw the elements
            this.$pager.invalidate();

            var onChanged = function()
            {
                var input = <HTMLInputElement>this;

                if (that.selectedFolder)
                    apiUrl = `${DB.USERS}/media/upload/${that.selectedFolder.name}`;
                else
                    return;

                // Make sure the file types are allowed
                if (!that.checkIfAllowed(input.files))
                {
                    that.$errorMsg = `Only ${that.extensions.join(', ') } file types are allowed`;
                    Compiler.digest(that._browserElm, that);
                    return false;
                }

                // Upload each file
                for (var i = 0; i < input.files.length; i++)
                {
                    var file = input.files[i];
                    //that.uploadFile(file, apiUrl);
                    that.$uploader.uploadFile(file, apiUrl);
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
		* Attempts to update the selected entity
		*/
        update(token: Engine.IFile)
        {
            var that = this,
                details = User.get.userEntry;

            that.$loading = true;
            that.$errorMsg = "";
            that.$confirmDelete = false;
            Compiler.digest(that._browserElm, that);

            jQuery.ajax(`${DB.API}/files/${details.username}/${token._id}`, {
                type: "put",
                data: JSON.stringify(token),
                contentType: 'application/json;charset=UTF-8',
                dataType: "json"
            }).then(function (token: UsersInterface.IResponse)
            {
                that.$loading = false;
                if (token.error)
                {
                    that.$errorMsg = token.message;
                    Compiler.digest(that._browserElm, that);
                }
                else
                {
                    that.$editMode = false;
                    that.$pager.invalidate();
                }

            }).fail(function (err: JQueryXHR)
            {
                that.$errorMsg = `An error occurred while connecting to the server. ${err.status}: ${err.responseText}`;
                Compiler.digest(that._browserElm, that);
            });;
        }
        
		/** Gets the singleton instance. */
		static getSingleton(): FileViewerForm
		{
			if ( !FileViewerForm._singleton )
				new FileViewerForm();

			return FileViewerForm._singleton;
		}
	}
}