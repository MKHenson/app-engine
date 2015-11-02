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
        private static _dCount: number;
        private static _downloads: { [id: number]: { total: number; loaded: number; }; };

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
        private $numLoading: number;
        private $loadingPercent: number;
        private _searchType: FileSearchType;

        public extensions: Array<string>;
        public selectedEntities: Array<UsersInterface.IBucketEntry | UsersInterface.IFileEntry>;
        public selectedEntity: UsersInterface.IBucketEntry | UsersInterface.IFileEntry;
        public selectedFolder: UsersInterface.IBucketEntry;
        private multiSelect: boolean;

		//private toolbar: Component;
		//private selectedID: string;
		//private modeGrid: Component;
		//private modeList: Component;		
		//private addRemoveGroup: Component;
		//private favouriteGroup: Component;
		//private favourite: Component;
		//private addButton: Component;
		//private removeButton: Component;
		//private catProject: Component;
		//private catUser: Component;
		//private catGlobal: Component;
		//private search: Component;
		//private menu: ListView;
		//private listInfo: Component;
		//private previewHeader: Component;
		//private okButton: Button;
		//private preview: Component;
		//private statusBar: Component;
		//private global: Checkbox;
		//private size: InputBox;
		//private name: InputBox;
		//private tags: InputBox;
		//private thumbnail: InputBox;
		//private path: InputBox;
		//private uploader: FileUploaderBasic;
		//private updateButton: Button;
		
		//private submitProxy: any;
		//private thumbUploader: any;
		//private thumbSubmitProxy: any;
		//private progressProxy: any;
		//private cancelProxy: any;
		//private completeProxy: any;
		//private errorProxy: any;
		//private keyDownProxy: any;
		//private buttonProxy: any;
		
		constructor()
		{
			FileViewerForm._singleton = this;

			// Call super-class constructor
            super(1000, 600, true, true, "Asset Browser");
            this.element.attr("id", "file-viewer-window");

            FileViewerForm._dCount = 0;
            FileViewerForm._downloads = {};
            
            this._browserElm = jQuery("#file-viewer").remove().clone();
            this.content.element.append(this._browserElm);
            this.$newFolder = false;
            this.$selectedFile = null;
            this.$errorMsg = "";
            this.$confirmDelete = false;
            this.$pager = new PageLoader(this.updateContent.bind(this));
            this.selectedEntities = [];
            this.selectedEntity = null;
            this.selectedFolder = null;
            this.$search = "";
            this.$entries = [];
            this.extensions = [];
            this.multiSelect = true;
            this.$numLoading = 0;
            this.$loadingPercent = 0;
            this._searchType = FileSearchType.Project;

            // Build the element with the compiler
            Compiler.build(this._browserElm, this);
            
            
            var that = this;

            // Creates the filter options drop down
            var searchOptions: ToolbarDropDown = new ToolbarDropDown(null, [
                new ToolbarItem("media/assets-project.png", "Filter by Project Files"),
                new ToolbarItem("media/assets-user.png", "Filter by My Files"),
                new ToolbarItem("media/assets-global.png", "Filter by Global Files")
            ]);

            // Add the drop down to dom
            jQuery("#file-search-mode", this._browserElm).append(searchOptions.element);

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

   //         //this.toolbar = <Component>this.content.addChild("<div class='viewer-toolbar'></div>");
   //         this.toolbar = new Component(null);

   //         this.selectedID = null;

			////Create buttons and groups
			//var group : Component = this.createGroup();
			//this.modeGrid = this.createGroupButton( "Grid", "media/asset-grid.png", group );
			//this.modeList = this.createGroupButton( "List", "media/asset-list.png", group );
			//this.modeList.element.addClass( "selected" );

			//group = this.createGroup();
			//this.favouriteGroup = group;
			//this.favourite = this.createGroupButton( "Favourite", "media/star.png", group );
			//this.favourite.enabled = false;

			//group = this.createGroup();
			//this.addRemoveGroup = group;
			//this.addButton = this.createGroupButton( "Add", "media/add-asset.png", group );
			//this.removeButton = this.createGroupButton( "Remove", "media/remove-asset.png", group );
			//this.content.element.append( "<div class='fix'></div>" );

			//group = this.createGroup();
			//this.catProject = this.createGroupButton( "Project", "media/assets-project.png", group );
			//this.catUser = this.createGroupButton( "My Assets", "media/assets-user.png", group );
			//this.catGlobal = this.createGroupButton( "Global Assets", "media/assets-global.png", group );
			//this.catProject.element.addClass( "selected" );

			//group = this.createGroup();
			//this.search = <Component>group.addChild( "<div class='asset-search'><input type='text'></input><img src='media/search.png' /></div>" );
			//group.element.css( { "float": "right", "margin": "0 15px 0 0" });



			////Bottom panels
			//var btmLeft : Component = <Component>this.content.addChild( "<div class='viewer-block'></div>" );
			//var btmRight: Component = <Component>this.content.addChild( "<div class='viewer-block'></div>" );

			//var listBlock : Component = <Component>btmLeft.addChild( "<div class='list-block'></div>" );
			//this.menu = new ListView( listBlock );
			//this.menu.addColumn( "ID" );
			//this.menu.addColumn( "Name" );
			//this.menu.addColumn( "Tags" );
			//this.menu.addColumn( "Size" );
			//this.menu.addColumn( "URL" );
			//this.menu.addColumn( "Favourite" );
			//this.menu.addColumn( "Created On" );
			//this.menu.addColumn( "Last Modified" );
			//this.menu.addColumn( "Extension" );

			//this.listInfo = <Component>btmLeft.addChild( "<div class='selection-info'><span class='selected-asset'>Selected: </span><span class='assets'>All your base!</span></div>" );

			////Preview section
			//this.previewHeader = new Component( "<div class='file-preview-header'><div class='header-name'>Preview</div></div>", btmRight );
			//this.okButton = new Button( "Use this File", this.previewHeader );
			//this.okButton.css( { "float": "right", width: "100px", height: "25px", margin: "0 0 5px 0" });
			//this.previewHeader.element.append( "<div class='fix'></div>" );


			//this.preview = new Component( "<div class='file-preview'></div>", btmRight );

			////Create info section
			//var infoSection : Component = new Component( "<div class='info-section'></div>", btmRight );

			//this.statusBar = new Component( "<div class='upload-status'><img src='media/close.png' /><span class='upload-text'>Uploading</span></div>", infoSection );
			//this.statusBar.element.hide();

			////Name
			//group = new Component( "<div class='file-group'><div>", infoSection );
			//var label: Label = new Label( "Name: ", group );
			//label.element.css( { "text-align": "left", "float": "left", "padding-left": "5px" });
			//this.name = new InputBox( group, "" );
			//group.element.append( "<div class='fix'></div>" );

			////Tags
			//group = new Component( "<div class='file-group'><div>", infoSection );
			//label = new Label( "Tags: ", group );
			//label.element.css( { "text-align": "left", "float": "left", "padding-left": "5px" });
			//this.tags = new InputBox( group, "" );
			//group.element.append( "<div class='fix'></div>" );

			////Global
			//group = new Component( "<div class='file-group'><div>", infoSection );
			//label = new Label( "Share: ", group );
			//label.element.css( { "text-align": "left", "float": "left", "padding-left": "5px" });
			//this.global = new Checkbox( group, "Share your file with all Animate users", false );
			//group.element.append( "<div class='fix'></div>" );

			////Thumbnail
			//group = new Component( "<div class='file-group'><div>", infoSection );
			//label = new Label( "Thumbnail: ", group );
			//label.element.css( { "text-align": "left", "float": "left", "padding-left": "5px" });
			//this.thumbnail = new InputBox( group, "" );
			//group.element.append( "<div class='info'>Click here to upload a thumbnail image (100px, 100px)</div><div class='fix'></div>" );

			////Size
			//group = new Component( "<div class='file-group'><div>", infoSection );
			//label = new Label( "Filesize: ", group );
			//label.element.css( { "text-align": "left", "float": "left", "padding-left": "5px" });
			//this.size = new InputBox( group, "" );
			//group.element.append( "<div class='fix'></div>" );
			//group.enabled = false;

			////Path
			//group = new Component( "<div class='file-group'><div>", infoSection );
			//label = new Label( "Path: ", group );
			//label.element.css( { "text-align": "left", "float": "left", "padding-left": "5px" });
			//this.path = new InputBox( group, "" );
			//group.element.append( "<div class='fix'></div>" );
			//group.enabled = false;

			////Create the update button
			//this.updateButton = new Button( "Update", infoSection );
			//this.updateButton.css( { width: "70px", height: "20px", "margin": "5px 3px 0 0", "float": "right" });
			//infoSection.element.append( "<div class='fix'></div>" );

			//this.thumbUploader = null;
			//this.uploader = null;

			////Event Listeners
			//this.buttonProxy = jQuery.proxy( this.onButtonClick, this );
			//this.submitProxy = jQuery.proxy( this.onSubmit, this );
			//this.thumbSubmitProxy = jQuery.proxy( this.onThumbSubmit, this );
			//this.progressProxy = jQuery.proxy( this.onProgress, this );
			//this.cancelProxy = jQuery.proxy( this.onCancel, this );
			//this.completeProxy = jQuery.proxy( this.onUploadComplete, this );
			//this.errorProxy = jQuery.proxy( this.onError, this );
			//this.keyDownProxy = jQuery.proxy( this.onInputKey, this );			

			//jQuery( "input", this.search.element ).on( "keydown", this.keyDownProxy );
			//jQuery( "img", this.search.element ).on( "click", this.buttonProxy );
			//this.modeGrid.element.on( "click", this.buttonProxy );
			//this.modeList.element.on( "click", this.buttonProxy );
			//this.favourite.element.on( "click", this.buttonProxy );
			//this.updateButton.element.on( "click", this.buttonProxy );
			//this.removeButton.element.on( "click", this.buttonProxy );
			//this.okButton.element.on( "click", this.buttonProxy );
			//this.catProject.element.on( "click", this.buttonProxy  );
			//this.catUser.element.on( "click", this.buttonProxy );
			//this.catGlobal.element.on( "click", this.buttonProxy );

			//this.extensions = [];
			//jQuery( "img", this.statusBar.element ).on( "click", jQuery.proxy( this.onStatusCloseClick, this ) );

			//this.menu.addEventListener( ListViewEvents.ITEM_CLICKED, this.onItemClicked, this );

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
                this.$errorMsg = `Are you sure you want to delete these ${this.selectedFolder ? "file" : "folder" }s`;
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
                if (this.multiSelect == false)
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
        }

        /**
        * Removes the selected entities
        */
        removeEntities()
        {
            var that = this;
            that.$errorMsg = "";
            that.$loading = true;
            var mediaURL = DB.USERS + "/media";
            var command = (this.selectedFolder ? "remove-files" : "remove-buckets");
            var entities = "";

            if (this.selectedFolder)
            {
                for (var i = 0, l = this.selectedEntities.length; i < l; i++)
                    entities += (<UsersInterface.IFileEntry>this.selectedEntities[i]).identifier + ",";
            }
            else
            {
                for (var i = 0, l = this.selectedEntities.length; i < l; i++)
                    entities += (<UsersInterface.IBucketEntry>this.selectedEntities[i]).name + ",";
            }

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
                    command = `${DB.API}/files/${details.username}/?index=${index}&limit=${limit}&search=${that.$search}&bucket=${this.selectedFolder.identifier}`
                else
                    command = `${DB.API}/files/${details.username}/?index=${index}&limit=${limit}&search=${that.$search}&bucket=${this.selectedFolder.identifier}`
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

        /*
        * Uploads a file to the users storage api
        * @param {File} file The file we are uploading
        * @param {string} url The URL to use
        */
        uploadFile(file: File, url: string)
        {
            var that = this;
            that.$numLoading++;

            var xhr = new XMLHttpRequest();

            var id = FileViewerForm._dCount++;
            FileViewerForm._downloads[id] = { loaded: 0, total: 0 };

            var calcLoaded = function()
            {
                var total = 0;
                var loaded = 0;
                for (var i in FileViewerForm._downloads)
                {
                    total += FileViewerForm._downloads[i].total;
                    loaded += FileViewerForm._downloads[i].loaded;
                }

                that.$loadingPercent = Math.floor(loaded / total * 1000) / 10;
                Compiler.digest(that._browserElm, that);
            }

            xhr.onerror = function (ev)
            {
                delete FileViewerForm._downloads[id];
                that.$numLoading--;
                that.$errorMsg = `An error occurred while uploading the file '${file.name}' : `;
                calcLoaded();                
            };
            
            if (xhr.upload)
            {
                xhr.upload.onprogress = function (e)
                {
                    FileViewerForm._downloads[id] = { total: e.total, loaded: e.loaded };
                    calcLoaded();
                };
            }

            xhr.onreadystatechange = function ()
            {
                // Every thing ok, file uploaded
                if (xhr.readyState == 4)
                {
                    if (xhr.status !== 200)
                        that.$errorMsg = "XHR returned response code : " + xhr.status;
                    else
                    {
                        that.$numLoading--;
                        that.$loadingPercent = 100;
                        var data: UsersInterface.IUploadResponse = JSON.parse(xhr.responseText);

                        if (data.error)
                            that.$errorMsg = data.message;
                    }

                    Compiler.digest(that._browserElm, that);
                }               
            };

            var formData = new FormData();
            formData.append(file.name, file);
            xhr.withCredentials = true;
            xhr.open("post", url, true);   
            xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");  
            xhr.setRequestHeader("X-File-Name", encodeURIComponent(file.name));
            xhr.setRequestHeader("Cache-Control", "no-cache");
            xhr.setRequestHeader("X-Mime-Type", file.type);
            xhr.send(formData);
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
                        this.uploadFile(files[i], `${DB.USERS}/media/upload/${this.selectedFolder.name}`);

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
            this.$confirmDelete = false;
            this.$loading = false;
            this.$newFolder = false;
            var that = this,
                details = User.get.userEntry,
                extensions = this.extensions,
                apiUrl = ""; 

            // Call update and redraw the elements
            this.$pager.invalidate();

            
            document.getElementById('upload-new-file').addEventListener('change', function ()
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
                    that.uploadFile(file, apiUrl);
                }

                // Reset the value
                (<HTMLInputElement>this).value = "";
            }, false);
		}

		///**
		//* Called when the files have been loaded
		//* @param {ProjectEvents} response 
		//* @param {Event} data 
		//*/
		//onFilesLoaded( response: ProjectEvents, data : ProjectEvent )
		//{
		//	var project = User.get.project;
		//	project.off( ProjectEvents.FILES_CREATED, this.onFilesLoaded, this );
		//	this.populateFiles( project.files );
		//}

		///**
		//* Gets the viewer to search using the terms in the search inut
		//* @returns {any} 
		//*/
		//searchItems()
		//{
		//	var items = this.menu.items;
		//	var i = items.length;
		//	while ( i-- )
		//	{
		//		var ii = items[i].components.length;

		//		var searchTerm = jQuery( "input", this.search.element ).val();
		//		var baseString = ( items[i].fields[1] + items[i].fields[2] );
		//		var result = baseString.search( new RegExp( searchTerm, "i" ) );

		//		while ( ii-- )
		//			if ( result != -1 )
		//				items[i].components[ii].element.show();
		//			else
		//				items[i].components[ii].element.hide();
		//	}
		//}

		///**
		//* When we hit a key on the search box
		//* @param {any} e The jQuery event
		//*/
		//onInputKey( e : any )
		//{
		//	if ( e.keyCode == 13 )
		//		this.searchItems();
		//}

		///**
		//* Called when a file is imported
		//* @param {ProjectEvents} e 
		//* @param {File} file 
		//*/
		//onFileImported( e: ProjectEvents, event : ProjectEvent )
		//{
		//	//Not a project file - so we have to import it.
		//	var project : Project = User.get.project;
		//	project.off( ProjectEvents.FILE_IMPORTED, this.onFileImported, this );

		//	var items: Array<ListViewItem> = this.menu.getSelectedItems();
		//	var file: File = null;
		//	if ( items.length > 0 )
		//		file = <File>items[0].tag;

		//	this.dispatchEvent( new FileViewerFormEvent( FileViewerFormEvents.FILE_CHOSEN, file ) );
		//	this.clearItems();
		//	this.hide();
		//}

		///**
		//* Called when we click one of the buttons. This will dispatch the event OkCancelForm.CONFIRM
		//and pass the text either for the ok or cancel buttons.
		//* @param {any} e The jQuery event object
		//*/
		//onButtonClick( e : any )
		//{
		//	e.preventDefault();

		//	var target = jQuery( e.target );

		//	//If Search
		//	if ( target.is( jQuery( "img", this.search.element ) ) )
		//	{
		//		this.searchItems();
		//	}
		//	//Select Ok 
		//	else if ( target.is( this.okButton.element ) )
		//	{
		//		var file : File = null;
		//		var items: Array<ListViewItem> = this.menu.getSelectedItems();
		//		if ( items.length > 0 )
		//			file = <File>items[0].tag;

		//		//If its a project file - then select the file
		//		if ( this.catProject.element.hasClass( "selected" ) )
		//		{
		//			this.dispatchEvent( new FileViewerFormEvent( FileViewerFormEvents.FILE_CHOSEN, file ) );
		//			this.clearItems();
		//			this.hide();
		//		}
		//		else
		//		{
		//			//Not a project file - so we have to import it.
		//			var project = User.get.project;
		//			project.importFile( [file.id] );
		//			project.off( ProjectEvents.FILE_IMPORTED, this.onFileImported, this );
		//			project.on( ProjectEvents.FILE_IMPORTED, this.onFileImported, this );
		//		}
		//	}
		//	//Select Grid 
		//	else if ( target.is( this.modeGrid.element ) )
		//	{
		//		this.modeList.element.removeClass( "selected" );
		//		this.modeGrid.element.addClass( "selected" );
		//		this.menu.displayMode = ListViewType.IMAGES;
		//	}
		//	//Select List 
		//	else if ( target.is( this.modeList.element ) )
		//	{
		//		this.modeGrid.element.removeClass( "selected" );
		//		this.modeList.element.addClass( "selected" );
		//		this.menu.displayMode = ListViewType.DETAILS;
		//	}
		//	//Select assets list
		//	else if ( target.is( this.catUser.element ) || target.is( this.catGlobal.element ) || target.is( this.catProject.element ) )
		//	{
		//		this.catUser.element.removeClass( "selected" );
		//		this.catGlobal.element.removeClass( "selected" );
		//		this.catProject.element.removeClass( "selected" );

		//		target.addClass( "selected" );

		//		if ( target.is( this.catProject.element ) )
		//		{
		//			this.addRemoveGroup.enabled = true;
		//			this.favouriteGroup.enabled = true;

		//			//Re-download project files
		//			this.update();
		//			this.onItemClicked( null, null );
  //                  var project: Project = User.get.project;
		//			project.loadFiles( "project" );
		//			project.off( ProjectEvents.FILES_CREATED, this.onFilesLoaded, this );
		//			project.on( ProjectEvents.FILES_CREATED, this.onFilesLoaded, this );

		//			this.okButton.text = "Use this File";
		//		}
		//		else
		//		{
		//			this.addRemoveGroup.enabled = false;
		//			this.favouriteGroup.enabled = false;

		//			//Either download user or global files
		//			this.onItemClicked( null, null );
  //                  var project: Project = User.get.project;
					

		//			project.off( ProjectEvents.FILES_LOADED, this.onFilesLoaded, this );
		//			project.on( ProjectEvents.FILES_LOADED, this.onFilesLoaded, this );

		//			if ( target.is( this.catUser.element ) )
		//				project.loadFiles( "user" );
		//			else
		//				project.loadFiles( "global" );

		//			this.okButton.text = "Import";
		//		}
		//	}
		//	//Delete
		//	else if ( target.is( this.removeButton.element ) )
		//	{
		//		var project : Project = User.get.project;
		//		var items: Array<ListViewItem> = this.menu.getSelectedItems();

		//		//Remove
		//		if ( items.length > 0 )
		//		{
		//			var file : File = <File>items[0].tag;

		//			this.statusBar.element.fadeIn();
		//			jQuery( ".upload-text", this.statusBar.element ).text( 'Deleting file...' );

		//			if ( file )
		//			{
		//				project.on( ProjectEvents.FAILED, this.onFileDeleted, this );
		//				project.on( ProjectEvents.FILE_DELETED, this.onFileDeleted, this );
		//				project.deleteFiles( [file.id] );
		//			}
		//		}
		//	}
		//	//Update
		//	else if ( target.is( this.updateButton.element ) )
		//	{
		//		var project : Project = User.get.project;
		//		project.on( ProjectEvents.FAILED, this.onFileDeleted, this );
		//		var items: Array<ListViewItem> = this.menu.getSelectedItems();
		//		if ( items.length > 0 )
		//		{
		//			var file : File = <File>items[0].tag;

		//			this.statusBar.element.fadeIn();
		//			jQuery( ".upload-text", this.statusBar.element ).text( 'Updating file...' );

		//			if ( file )
		//			{
		//				project.on( ProjectEvents.FAILED, this.onFileDeleted, this );
		//				project.on( ProjectEvents.FILE_UPDATED, this.onFileUpdated, this );
		//				project.saveFile( file.id, this.name.text, this.tags.text.split(","), file.favourite, this.global.checked );
		//			}
		//		}
		//	}
		//	//FAVOURITE
		//	else if ( target.is( this.favourite.element ) )
		//	{
		//		var items: Array<ListViewItem> = this.menu.getSelectedItems();
		//		if ( items.length > 0 )
		//		{
		//			var file : File = <File>items[0].tag;
		//			if ( file )
		//			{
		//				if ( file.favourite == false )
		//					file.favourite = true;
		//				else
		//					file.favourite = false;

		//				this.updateButton.element.trigger( "click" );
		//			}
		//		}
		//	}
		//	else
		//		this.dispatchEvent( new FileViewerFormEvent( FileViewerFormEvents.CANCELLED, null ) );
		//}


		///**
		//* Clears up the contents to free the memory
		//*/
		//clearItems()
		//{
		//	var i = this.preview.children.length;
		//	while ( i-- )
		//		this.preview.children[i].dispose();
		//}

		///**
		//* When we click the close button on the status note
		//*/
		//onItemClicked( responce: ListEvents, event: ListViewEvent )
		//{
		//	this.clearItems();

		//	if (event == null || event.item == null )
		//	{
		//		this.name.text = "";
		//		this.tags.text = "";
		//		this.size.text = "";
		//		this.path.text = "";
		//		this.removeButton.enabled = false;
		//		this.menu.setSelectedItems( null );
		//		this.updateButton.enabled = false;
		//		this.favourite.enabled = false;
		//		this.global.checked = false;
		//		this.favourite.element.removeClass( "selected" );
		//		jQuery( ".selected-asset", this.listInfo.element ).text( "None Selected. " );
		//		jQuery( ".header-name", this.previewHeader.element ).text( "Preview: " );

		//		//Get the plugin to display a preview
		//		PluginManager.getSingleton().displayPreview( null, this.preview );
		//		return;
		//	}

		//	this.updateButton.enabled = true;
		//	this.removeButton.enabled = true;
		//	this.favourite.enabled = true;

		//	var file: File = <File>event.item.tag;
		//	this.name.text = file.name;
		//	this.tags.text = file.tags.join( "," );
		//	this.size.text = ( ( parseInt( file.size.toString() ) / ( 1024 * 1024 ) ) ).toFixed( 3 ) + "M";
		//	this.path.text = file.path;

		//	if ( file.global )
		//		this.global.checked = true;
		//	else
		//		this.global.checked = false;

		//	this.thumbnail.text = file.preview_path;

		//	if ( !file.favourite )
		//		this.favourite.element.removeClass( "selected" );
		//	else
		//		this.favourite.element.addClass( "selected" );


		//	jQuery( ".selected-asset", this.listInfo.element ).text( "Selected: " + file.name );

		//	jQuery( ".header-name", this.previewHeader.element ).text( "Preview: " + file.name );

		//	//Get the plugin to display a preview
		//	if ( PluginManager.getSingleton().displayPreview( file, this.preview ) )
		//		return true;

		//	//Dee if we can handle this
		//	if ( this.handleDefaultPreviews( file, this.preview ) )
		//		return;
		//}

		///**
		//* @type public enum hide
		//* Hide this form
		//* @extends <FileViewerForm>
		//*/
		//hide()
		//{
		//	super.hide();

		//	var i = this.preview.children.length;
		//	while ( i-- )
		//		if ( this.preview.children[i].dispose )
		//			this.preview.children[i].dispose();
		//}

		/**
		* @type public mfunc handleDefaultPreviews
		* This will attempt to handle simple file previews
		* @param {any} file The file to preview
		* @param {any} previewComponent The preview box
		* @extends <FileViewerForm>
		* @returns <bool> True if this is handled
		*/
		handleDefaultPreviews( file, previewComponent )
		{
			if ( file == null )
				return false;

			var ext = jQuery.trim( file.extension.toLowerCase() );
			if ( ext == "jpg" || ext == "jpeg" || ext == "png" || ext == "gif" )
			{
				var jQ = jQuery( "<img style='margin: 0px auto 0px auto; display:block;' src='" + file.path + "' />" );
				jQ.hide()
				previewComponent.element.append( jQ );
				jQ.fadeIn( "slow" );
				return true;
			}
		}

		///**
		//* When we click the close button on the status note
		//*/
		//onStatusCloseClick( id, fileName, response )
		//{
		//	this.statusBar.element.fadeOut();
		//}

		///**
		//* Use this function to populate the files uploaded for use in this project.
		//*/
		//populateFiles( files : Array<File> )
		//{
		//	this.menu.clearItems();
		//	var counter = 0;
		//	var i = files.length;
		//	while ( i-- )
		//	{
		//		var file : File = files[i];

		//		if ( this.extensions == null || this.extensions === undefined || jQuery.inArray( file.extension, this.extensions ) != -1 )
		//		{
		//			//If its an image, we use the image as a preview
		//			var ext = jQuery.trim( file.extension.toLowerCase() );
		//			var imgPath : string = "media/page.png";
		//			if ( file.preview_path )
		//				imgPath = file.preview_path;
		//			else if ( ext == "jpg" || ext == "jpeg" || ext == "png" || ext == "gif" )
		//				imgPath = file.path;

		//			var item = new ListViewItem(
		//				<Array<string>>[
		//					file.id,
		//					( file.favourite ? "<img src='media/star-small.png' style='width:20px; height:20px; position:relative; top:-5px; vertical-align:middle; left:0px;' />" + file.name : file.name ),
		//					file.tags.join(","),
		//					( ( parseInt( file.size.toString() ) / ( 1024 * 1024 ) ) ).toFixed( 3 ) + "M",
		//					file.path,
		//					file.favourite,
		//					new Date( file.createdOn ).toDateString(),
		//					new Date( file.lastModified ).toDateString(),
		//					file.extension
		//				], imgPath, imgPath );

		//			item.tag = file;
		//			this.menu.addItem( item );
		//			counter++;
		//		}
		//	}

		//	this.menu.updateItems();
		//	jQuery( ".assets", this.listInfo.element ).text( ( counter ) + " assets listed" );
		//}

		///**
		//* Fired when the upload is complete
		//*/
		//onUploadComplete( id, fileName, response )
		//{
		//	if ( LoaderEvents.fromString( response.return_type.toString() ) == AnimateLoaderResponses.SUCCESS )
		//	{
		//		jQuery( ".upload-text", this.statusBar.element ).text( response.message );
		//		this.addButton.enabled = true;
		//		var project: Project = User.get.project;
		//		project.off( ProjectEvents.FILES_LOADED, this.onFilesLoaded, this );
		//		project.on( ProjectEvents.FILES_LOADED, this.onFilesLoaded, this );

		//		if ( this.catUser.selected )
		//			project.loadFiles( "user" );
		//		else if ( this.catProject.selected )
		//			project.loadFiles( "project" );
		//		else
		//			project.loadFiles( "global" );
		//	}
		//	else
		//	{
		//		jQuery( ".upload-text", this.statusBar.element ).text( response.message );
		//		this.addButton.enabled = true;
		//	}
		//}

		///**
		//* Fired when the upload is cancelled due to an error
		//*/
		//onError( id, fileName, reason )
		//{
		//	jQuery( ".upload-text", this.statusBar.element ).text( 'Error Uploading File.' );
		//	this.addButton.enabled = true;
		//}

		///**
		//* When we receive a progress event
		//*/
		//onCancel( id, fileName )
		//{
		//	jQuery( ".upload-text", this.statusBar.element ).text( 'Cancelled' );
		//	this.addButton.enabled = true;
		//}

		///**
		//* When we receive a progress event
		//*/
		//onProgress( id, fileName, loaded, total )
		//{
		//	jQuery( ".upload-text", this.statusBar.element ).text( 'Uploading...' + ( ( loaded / total ) * 100 ) );
		//}

		///**
		//* When we click submit on the upload button
		//*/
		//onSubmit( file, ext )
		//{
		//	this.statusBar.element.fadeIn( "slow" );
		//	var extStr = this.extensions.join( "|" );

		//	var fExt = ext.split( "." );
		//	fExt = fExt[fExt.length - 1];
		//	fExt.toLowerCase();
		//	var extAccepted = false;

		//	if ( this.selectedID )
		//	{
		//		var i = this.extensions.length;
		//		while ( i-- )
		//			if ( fExt.toLowerCase() == this.extensions[i].toLowerCase() )
		//			{
		//				extAccepted = true;
		//				break;
		//			}

		//		if ( extAccepted == false )
		//		{
		//			// check for valid file extension
		//			jQuery( ".upload-text", this.statusBar.element ).text( 'Only ' + extStr + ' files are allowed' );
		//			return false;
		//		}
		//	}

		//	jQuery( ".upload-text", this.statusBar.element ).text( 'Uploading...' );
		//	this.addButton.enabled = false;
		//}

		///**
		//* When we click submit on the preview upload button
		//*/
		//onThumbSubmit( file, ext )
		//{
		//	this.statusBar.element.fadeIn( "slow" );
		//	var imageExtensions = ["png", "jpg", "jpeg", "gif"];
		//	var extStr = imageExtensions.join( "|" );

		//	var fExt = ext.split( "." );
		//	fExt = fExt[fExt.length - 1];
		//	fExt.toLowerCase();
		//	var extAccepted : boolean = false;

		//	var selectedItems: Array<ListViewItem> = this.menu.getSelectedItems();
		//	if ( selectedItems == null || selectedItems.length == 0 )
		//	{
		//		jQuery( ".upload-text", this.statusBar.element ).text( "No file selected." );
		//		return false;
		//	}

		//	var i = this.extensions.length;
		//	while ( i-- )
		//		if ( fExt.toLowerCase() == imageExtensions[i].toLowerCase() )
		//		{
		//			extAccepted = true;
		//			break;
		//		}

		//	if ( extAccepted == false )
		//	{
		//		// check for valid file extension
		//		jQuery( ".upload-text", this.statusBar.element ).text( 'Only ' + extStr + ' files are allowed' );
		//		return false;
		//	}

		//	var f : File = <File>selectedItems[0].tag;

		//	//Update the thumbuploader
  //          this.thumbUploader.setParams({ projectId: User.get.project.entry._id, "fileId": f.id });

		//	jQuery( ".upload-text", this.statusBar.element ).text( 'Uploading...' );
		//	this.addButton.enabled = false;

		//}

		///**
		//* This is called to initialize the one click loader
		//*/
		//initializeLoader()
		//{
		//	if ( !this.uploader )
		//	{
		//		this.uploader = new qq.FileUploaderBasic( {
		//			button: document.getElementById( this.addButton.id ),
		//			action: DB.HOST + "/file/upload-file",

		//			onSubmit: this.submitProxy,
		//			onComplete: this.completeProxy,
		//			onCancel: this.cancelProxy,
		//			onProgress: this.progressProxy,
		//			onError: this.errorProxy
		//		});
		//	}

		//	if ( !this.thumbUploader )
		//	{
		//		this.thumbUploader = new qq.FileUploaderBasic( {
		//			button: document.getElementById( this.thumbnail.id ),
		//			action: DB.HOST + "/file/upload-thumb",

		//			onSubmit: this.thumbSubmitProxy,
		//			onComplete: this.completeProxy,
		//			onCancel: this.cancelProxy,
		//			onProgress: this.progressProxy,
		//			onError: this.errorProxy
		//		});

		//		this.thumbUploader._options.allowedExtensions.push( "jpg", "png", "jpeg" );
		//	}

		//	//this.uploader.setParams( { projectID: User.get.project._id, "category": "files", "command": "upload" });
		//	//this.thumbUploader.setParams( { projectID: User.get.project._id, "category": "files", "command": "uploadThumb", "file": "" });

  //          var projId: string = User.get.project.entry._id;
  //          this.uploader.setParams({ projectId: projId, });
  //          this.uploader.setParams
		//	this.thumbUploader.setParams( { projectId: projId, fileId: "" });

		//	//Set the allowed extensions
		//	this.uploader._options.allowedExtensions.splice( 0, this.uploader._options.allowedExtensions.length );
		//	if ( this.extensions )
		//	{
		//		for ( var i = 0; i < this.extensions.length; i++ )
		//			this.uploader._options.allowedExtensions.push( this.extensions[i] );
		//	}
		//}


		///**
		//* This is called when a file has been successfully deleted.
		//*/
		//onFileUpdated( response: ProjectEvents, event : ProjectEvent )
		//{
		//	var data = event.tag;
		//	var items: Array<ListViewItem> = this.menu.getSelectedItems();
		//	var project : Project = User.get.project;
		//	project.off( ProjectEvents.FILE_UPDATED, this.onFileUpdated, this );
		//	project.off( ProjectEvents.FILE_DELETED, this.onFileDeleted, this );
		//	project.off( ProjectEvents.FAILED, this.onFileDeleted, this );

		//	if ( items.length > 0 )
		//	{
		//		if ( this.modeGrid.element.hasClass( "selected" ) )
		//		{
		//			jQuery( ".info", items[0].components[0].element ).html( ( data.favourite ? "<img src='media/star-small.png' style='width:20px; height:20px; position:relative; top:-5px; vertical-align:middle; left:0px;' />" + data.name : data.name ) );
		//		}
		//		else
		//		{
		//			items[0].components[1].element.html( ( data.favourite ? "<img src='media/star-small.png' style='width:20px; height:20px; position:relative; top:-5px; vertical-align:middle; left:0px;' />" + data.name : data.name ) );
		//			items[0].components[2].element.text( data.tags );
		//			items[0].components[3].element.text( data.lastModified );
		//			items[0].components[5].element.text( data.favourite );
		//		}

		//		items[0].fields[1] = ( data.favourite ? "<img src='media/star-small.png' style='width:20px; height:20px; position:relative; top:-5px; vertical-align:middle; left:0px;' />" + data.name : data.name );
		//		items[0].fields[2] = data.tags;
		//		items[0].fields[7] = data.lastModified;
		//		items[0].fields[5] = data.favourite;

		//		if ( data.favourite == "false" )
		//			this.favourite.element.removeClass( "selected" );
		//		else
		//			this.favourite.element.addClass( "selected" );

		//		jQuery( ".upload-text", this.statusBar.element ).text( 'File updated' );
		//	}
		//}

		///**
		//* This is called when a file has been successfully deleted.
		//*/
		//onFileDeleted( response : ProjectEvents, event : ProjectEvent )
		//{
		//	var project : Project = User.get.project;

		//	if ( response == ProjectEvents.FILE_DELETED )
		//	{
		//		var items: Array<ListViewItem> = this.menu.getSelectedItems();
		//		if ( items.length > 0 )
		//			this.menu.removeItem( items[0] );


		//		jQuery( ".upload-text", this.statusBar.element ).text( 'File deleted.' );

		//		this.onItemClicked( ListEvents.ITEM_SELECTED, null );
		//	}
		//	else
		//	{
		//		this.statusBar.element.show();
		//		jQuery( ".upload-text", this.statusBar.element ).text( event.message );
		//	}

		//	project.off( ProjectEvents.FAILED, this.onFileDeleted, this );
		//	project.off( ProjectEvents.FILE_DELETED, this.onFileDeleted, this );
		//}

		/**
		* This function is used to cleanup the object before its removed from memory.
		*/
		dispose()
		{
			//jQuery( "img", this.search.element ).off( "click", this.buttonProxy );
			//this.modeGrid.element.off( "click", this.buttonProxy );
			//this.modeList.element.off( "click", this.buttonProxy );
			//this.favourite.element.off( "click", this.buttonProxy );
			//jQuery( "img", this.statusBar.element ).off();
			////this.refresh.element.off("unclick", this.buttonProxy);
			//this.okButton.element.off( "click", this.buttonProxy );
			//jQuery( "input", this.search.element ).off( "keydown", this.keyDownProxy );

			//this.updateButton.element.off();
			//this.addButton.element.off();
			//this.removeButton.element.off();
			//this.addButton = null;
			//this.updateButton = null;
			//this.removeButton = null;
			//this.buttonProxy = null;
			//this.okButton = null;
			//this.keyDownProxy = null;

			//Call super
			super.dispose();
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