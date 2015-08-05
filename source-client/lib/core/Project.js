var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Animate;
(function (Animate) {
    var ProjectAssetTypes = (function (_super) {
        __extends(ProjectAssetTypes, _super);
        function ProjectAssetTypes(v) {
            _super.call(this, v);
        }
        ProjectAssetTypes.BEHAVIOUR = new ProjectAssetTypes("behaviour");
        ProjectAssetTypes.ASSET = new ProjectAssetTypes("asset");
        ProjectAssetTypes.GROUP = new ProjectAssetTypes("group");
        return ProjectAssetTypes;
    })(Animate.ENUM);
    Animate.ProjectAssetTypes = ProjectAssetTypes;

    var ProjectEvents = (function () {
        function ProjectEvents(v) {
            this.value = v;
        }
        ProjectEvents.prototype.toString = function () {
            return this.value;
        };

        ProjectEvents.SAVED = new ProjectEvents("saved");
        ProjectEvents.SAVED_ALL = new ProjectEvents("saved_all");
        ProjectEvents.OPENED = new ProjectEvents("opened");
        ProjectEvents.FAILED = new ProjectEvents("failed");
        ProjectEvents.BUILD_SELECTED = new ProjectEvents("build_selected");
        ProjectEvents.BUILD_SAVED = new ProjectEvents("build_saved");
        ProjectEvents.BEHAVIOUR_DELETING = new ProjectEvents("behaviour_deleting");
        ProjectEvents.BEHAVIOURS_LOADED = new ProjectEvents("behaviours_loaded");
        ProjectEvents.BEHAVIOUR_CREATED = new ProjectEvents("behaviour_created");
        ProjectEvents.BEHAVIOUR_UPDATED = new ProjectEvents("behaviour_updated");
        ProjectEvents.BEHAVIOURS_UPDATED = new ProjectEvents("behaviours_updated");
        ProjectEvents.BEHAVIOURS_SAVED = new ProjectEvents("behaviours_saved");
        ProjectEvents.BEHAVIOUR_SAVED = new ProjectEvents("behaviour_saved");
        ProjectEvents.ASSET_CREATED = new ProjectEvents("asset_created");
        ProjectEvents.ASSET_SAVED = new ProjectEvents("asset_saved");
        ProjectEvents.ASSET_UPDATED = new ProjectEvents("asset_updated");
        ProjectEvents.ASSETS_UPDATED = new ProjectEvents("assets_updated");
        ProjectEvents.ASSET_DELETING = new ProjectEvents("asset_deleting");
        ProjectEvents.ASSETS_LOADED = new ProjectEvents("assets_deleted");
        ProjectEvents.GROUP_UPDATED = new ProjectEvents("group_updated");
        ProjectEvents.GROUPS_UPDATED = new ProjectEvents("groups_updated");
        ProjectEvents.GROUP_SAVED = new ProjectEvents("group_saved");
        ProjectEvents.GROUPS_SAVED = new ProjectEvents("groups_saved");
        ProjectEvents.GROUP_DELETING = new ProjectEvents("group_deleting");
        ProjectEvents.GROUP_CREATED = new ProjectEvents("group_created");
        ProjectEvents.GROUPS_LOADED = new ProjectEvents("groups_loaded");
        ProjectEvents.FILE_CREATED = new ProjectEvents("file_created");
        ProjectEvents.FILE_IMPORTED = new ProjectEvents("file_imported");
        ProjectEvents.FILE_DELETED = new ProjectEvents("file_deleted");
        ProjectEvents.FILES_DELETED = new ProjectEvents("files_deleted");
        ProjectEvents.FILES_CREATED = new ProjectEvents("files_created");
        ProjectEvents.FILE_UPDATED = new ProjectEvents("file_updated");
        ProjectEvents.FILE_IMAGE_UPDATED = new ProjectEvents("file_image_updated");
        ProjectEvents.FILES_LOADED = new ProjectEvents("files_loaded");
        ProjectEvents.FILES_FETCHED = new ProjectEvents("files_fetched");
        ProjectEvents.OBJECT_RENAMED = new ProjectEvents("object_renamed");
        return ProjectEvents;
    })();
    Animate.ProjectEvents = ProjectEvents;

    var ProjectEvent = (function (_super) {
        __extends(ProjectEvent, _super);
        function ProjectEvent(eventName, message, return_type, data) {
            _super.call(this, eventName, message, return_type, data);
        }
        return ProjectEvent;
    })(Animate.AnimateServerEvent);
    Animate.ProjectEvent = ProjectEvent;

    /**
    * A project class is an object that is owned by a user.
    * The project has functions which are useful for comunicating data to the server when
    * loading and saving data in the scene.
    */
    var Project = (function (_super) {
        __extends(Project, _super);
        /**
        * @param{string} name The name of the project we are creating.
        * @param{string} description A short description of what the project is and what it does.
        * @param{string} tags Comma delimited keywords to describe this project
        */
        function Project(name, description, tags) {
            if (typeof name === "undefined") { name = ""; }
            if (typeof description === "undefined") { description = ""; }
            if (typeof tags === "undefined") { tags = ""; }
            // Call super-class constructor
            _super.call(this);

            this.id = null;
            this.buildID = null;
            this.mSaved = false;
            this.mName = name;
            this.mDescription = description;
            this.mTags = tags;
            this.mRequest = "";

            //this.mServerProxy = this.onServer.bind( this );
            this.mCurBuild = null;
            this._plugins = [];
            this.created = "";
            this.lastModified = "";
            this.mCategory = "";
            this.mSubCategory = "";
            this.mRating = 0;
            this.mImgPath = "";
            this.mVisibility = "";
            this._behaviours = [];
            this._assets = [];
            this._files = [];
        }
        /**
        * Gets an asset by its ID
        * @param {string} id The ID of the asset
        * @returns {Asset} The asset whose id matches the id parameter or null
        */
        Project.prototype.getAsset = function (id) {
            for (var i = 0; i < this._assets.length; i++)
                if (this._assets[i].id == id)
                    return this._assets[i];

            return null;
        };

        /**
        * Gets a file by its ID
        * @param {string} id The ID of the file
        * @returns {File} The file whose id matches the id parameter or null
        */
        Project.prototype.getFile = function (id) {
            for (var i = 0; i < this._files.length; i++)
                if (this._files[i].id == id)
                    return this._files[i];

            return null;
        };

        /**
        * Gets a {BehaviourContainer} by its ID
        * @param {string} id The ID of the BehaviourContainer
        * @returns {BehaviourContainer} The BehaviourContainer whose id matches the id parameter or null
        */
        Project.prototype.getBehaviour = function (id) {
            for (var i = 0; i < this._behaviours.length; i++)
                if (this._behaviours[i].id == id)
                    return this._behaviours[i];

            return null;
        };

        /**
        * Use this to rename a behaviour, group or asset.
        * @param {string} name The new name of the object
        * @param {string} id The id of the asset or behaviour.
        * @param {ProjectAssetTypes} type The type of object we are renaming. this can be either 'group', 'asset' or 'behaviour'
        */
        Project.prototype.renameObject = function (name, id, type) {
            if (type == ProjectAssetTypes.ASSET)
                id = id.toString().replace("a", "");

            this.mRequest = "renameObject";
            var loader = new Animate.Loader();
            loader.addEventListener(Animate.LoaderEvents.COMPLETE, this.onServer, this);
            loader.addEventListener(Animate.LoaderEvents.FAILED, this.onServer, this);
            loader.load(Animate.DB.HOST, {
                category: "project",
                command: this.mRequest,
                projectID: this.id,
                name: name,
                id: id,
                type: type.toString()
            }, true);
        };

        /**
        * This function is used to create an entry for this project on the DB.
        */
        Project.prototype.open = function () {
            this.mRequest = "openProject";
            var loader = new Animate.Loader();
            loader.addEventListener(Animate.LoaderEvents.COMPLETE, this.onServer, this);
            loader.addEventListener(Animate.LoaderEvents.FAILED, this.onServer, this);
            loader.load(Animate.DB.HOST, {
                category: "project",
                command: this.mRequest,
                projectID: this.id
            }, true);
        };

        /**
        * This function is used to create an entry for this project on the DB.
        */
        Project.prototype.selectBuild = function (versionMajor, versionMid, versionMinor) {
            this.mRequest = "selectBuild";
            var loader = new Animate.Loader();
            loader.addEventListener(Animate.LoaderEvents.COMPLETE, this.onServer, this);
            loader.addEventListener(Animate.LoaderEvents.FAILED, this.onServer, this);
            loader.load(Animate.DB.HOST, {
                category: "project",
                command: this.mRequest,
                projectID: this.id,
                versionMajor: versionMajor,
                versionMid: versionMid,
                versionMinor: versionMinor
            }, true);
        };

        /**
        * This function is used to update the current build data
        */
        Project.prototype.saveBuild = function (notes, visibility, html, css) {
            this.mRequest = "saveBuild";
            var loader = new Animate.Loader();
            loader.addEventListener(Animate.LoaderEvents.COMPLETE, this.onServer, this);
            loader.addEventListener(Animate.LoaderEvents.FAILED, this.onServer, this);
            loader.load(Animate.DB.HOST, {
                category: "project",
                command: this.mRequest,
                projectID: this.id,
                buildID: this.mCurBuild.id,
                notes: notes,
                visibility: visibility,
                html: html,
                css: css
            }, true);
        };

        /**
        * This function is used to create an entry for this project on the DB.
        */
        Project.prototype.createDBEntry = function () {
            this.mRequest = "create";
            var loader = new Animate.Loader();
            loader.addEventListener(Animate.LoaderEvents.COMPLETE, this.onServer, this);
            loader.addEventListener(Animate.LoaderEvents.FAILED, this.onServer, this);
            loader.load(Animate.DB.HOST, {
                category: "project",
                command: "create",
                name: this.mName,
                description: this.mDescription
            }, true);
        };

        /**
        * This function is used to save an array of behaviors to the DB
        * @param {any} behaviours This is the array of array objects we are saving.
        * Each array item is separated in two parts. The first is
        * the id of the behaviour and the second is actual data object.
        */
        Project.prototype.saveBehaviours = function (behaviours) {
            var data = {};
            data.category = "project";
            data.command = "saveBehaviours";
            data.projectID = this.id;

            //Create a multidimension array and pass each of the _behaviours
            var counter = 0;
            for (var id in behaviours) {
                var behaviour = behaviours[id];
                var jsonStr = "";

                if (typeof (behaviour) == "string")
                    jsonStr = behaviour;
else
                    jsonStr = JSON.stringify(behaviour, null);

                var propStr = JSON.stringify((behaviour).properties.tokenize(), null);

                data["behaviours[" + counter + "][json]"] = jsonStr;
                data["behaviours[" + counter + "][properties]"] = propStr;
                data["behaviours[" + counter + "][id]"] = id;
                counter++;
            }

            this.mRequest = "saveBehaviours";
            var loader = new Animate.Loader();
            loader.addEventListener(Animate.LoaderEvents.COMPLETE, this.onServer, this);
            loader.addEventListener(Animate.LoaderEvents.FAILED, this.onServer, this);
            loader.load(Animate.DB.HOST, data, true);
        };

        /**
        * This function is used to save the behaviors, groups and _assets or the DB
        */
        Project.prototype.saveAll = function () {
            var data = {};
            data["category"] = "project";
            data["command"] = "saveAll";
            data["projectID"] = this.id;

            data["build_html"] = (Animate.HTMLTab.singleton ? Animate.HTMLTab.singleton.editor.getValue() : this.mCurBuild.html);
            data["build_css"] = (Animate.CSSTab.singleton ? Animate.CSSTab.singleton.editor.getValue() : this.mCurBuild.css);

            //Create a multidimension array and pass each of the behaviours
            var counter = 0;
            for (var id in this._behaviours) {
                var behaviour = this._behaviours[id];

                //Fist check if any canvases are open - if so we will need to get the latest json
                var canvas = Animate.CanvasTab.getSingleton().getTabCanvas((behaviour.saved ? behaviour.name : "*" + behaviour.name));

                var jsonStr = "";
                if (canvas)
                    jsonStr = JSON.stringify(canvas.buildDataObject());
else
                    jsonStr = behaviour.json;

                var propStr = JSON.stringify(behaviour.properties.tokenize(), null);

                data["behaviours[" + counter + "][json]"] = jsonStr;
                data["behaviours[" + counter + "][properties]"] = propStr;
                data["behaviours[" + counter + "][id]"] = behaviour.id;
                counter++;
            }

            //Now pass each of the _assets
            counter = 0;
            for (var id in this._assets) {
                var asset = this._assets[id];

                data["assets[" + counter + "][json]"] = (asset.properties ? JSON.stringify(asset.properties.tokenize(), null) : "");
                data["assets[" + counter + "][id]"] = asset.id.replace("a", "");

                counter++;
            }

            //Create a multidimension array and pass each of the groups
            var groups = Animate.TreeViewScene.getSingleton().getGroups();
            counter = 0;
            for (id in groups) {
                var group = groups[id];
                var jsonStr = JSON.stringify((group.json ? group.json : ""), null);

                data["groups[" + counter + "][json]"] = jsonStr;
                data["groups[" + counter + "][id]"] = group.groupID;
                counter++;
            }

            this.mRequest = "saveAll";
            var loader = new Animate.Loader();
            loader.addEventListener(Animate.LoaderEvents.COMPLETE, this.onServer, this);
            loader.addEventListener(Animate.LoaderEvents.FAILED, this.onServer, this);
            loader.load(Animate.DB.HOST, data, true);
        };

        /**
        * This function is used to create a new behaviour. This will make
        * a call the server. If the server sends a fail message no new behaviour
        * will be created. You can use the event BEHAVIOUR_CREATED to hook into
        * @param {string} name The proposed name of the behaviour.
        */
        Project.prototype.createBehaviour = function (name) {
            for (var i = 0; i < this._behaviours.length; i++)
                if (this._behaviours[i].name == name) {
                    this.dispatchEvent(new ProjectEvent(ProjectEvents.FAILED, "A behaviour with that name already exists.", Animate.LoaderEvents.FAILED));
                    return;
                }

            this.mRequest = "createBehaviour";
            var loader = new Animate.Loader();
            loader.addEventListener(Animate.LoaderEvents.COMPLETE, this.onServer, this);
            loader.addEventListener(Animate.LoaderEvents.FAILED, this.onServer, this);
            loader.load(Animate.DB.HOST, {
                category: "project",
                command: this.mRequest,
                name: name,
                projectID: this.id
            }, true);
        };

        /**
        * This function is used to delete _behaviours.
        * @param {Array<string>} behaviour The behaviour we need to delete
        */
        Project.prototype.deleteBehaviours = function (_behaviours) {
            var data = {};
            data["category"] = "project";
            data["command"] = "deleteBehaviours";
            data["projectID"] = this.id;

            //Create a multidimension array and pass each of the groups
            var counter = 0;
            for (var id in _behaviours) {
                var behaviourID = _behaviours[id];
                data["behaviourIDs[" + counter + "][id]"] = behaviourID;
                counter++;
            }

            this.mRequest = "deleteBehaviours";
            var loader = new Animate.Loader();
            loader.addEventListener(Animate.LoaderEvents.COMPLETE, this.onServer, this);
            loader.addEventListener(Animate.LoaderEvents.FAILED, this.onServer, this);
            loader.load(Animate.DB.HOST, data, true);
        };

        /**
        * This function is used to fetch the _files associated with a project.
        */
        Project.prototype.loadFiles = function () {
            this.mRequest = "getProjectFiles";
            var loader = new Animate.Loader();
            loader.addEventListener(Animate.LoaderEvents.COMPLETE, this.onServer, this);
            loader.addEventListener(Animate.LoaderEvents.FAILED, this.onServer, this);
            loader.load(Animate.DB.HOST, {
                category: "files",
                command: this.mRequest,
                projectID: this.id
            }, true);
        };

        /**
        * This function is used to import a user's file from another project or from the global _assets base
        */
        Project.prototype.importFile = function (file) {
            this.mRequest = "importFile";
            var loader = new Animate.Loader();
            loader.addEventListener(Animate.LoaderEvents.COMPLETE, this.onServer, this);
            loader.addEventListener(Animate.LoaderEvents.FAILED, this.onServer, this);
            loader.load(Animate.DB.HOST, {
                category: "files",
                command: this.mRequest,
                projectID: this.id,
                fileID: file.id
            }, true);
        };

        /**
        * This function is used to fetch the _files associated with a user or globally. These
        * _files can then be imported into another project.
        * @param {string} mode Can be either "user" or "global". User gets only user _files.
        */
        Project.prototype.fetchFiles = function (mode) {
            this.mRequest = "fetchFiles";
            var loader = new Animate.Loader();
            loader.addEventListener(Animate.LoaderEvents.COMPLETE, this.onServer, this);
            loader.addEventListener(Animate.LoaderEvents.FAILED, this.onServer, this);
            loader.load(Animate.DB.HOST, {
                category: "files",
                command: this.mRequest,
                projectID: this.id,
                mode: mode
            }, true);
        };

        /**
        * This function is used to delete a file from a project and the database. The file asset will
        * not be deleted if another project has a reference to it. The reference of this project to the file will be
        * removed either way.
        * @param {File} file The file we are deleting from this project.
        */
        Project.prototype.deleteFile = function (file) {
            this.mRequest = "deleteFile";
            var loader = new Animate.Loader();
            loader.addEventListener(Animate.LoaderEvents.COMPLETE, this.onServer, this);
            loader.addEventListener(Animate.LoaderEvents.FAILED, this.onServer, this);
            loader.load(Animate.DB.HOST, {
                category: "files",
                command: this.mRequest,
                projectID: this.id,
                fileID: file.id
            }, true);
        };

        /**
        * Use this function to update file properties
        * @param {File} file The file we are updating
        * @param {string} name The new name of the file.
        * @param {string} tags The new comma separated tags of the file.
        * @param {string} favourite If this file is a favourite
        * @param <bool> global True or false if this file is shared globally
        */
        Project.prototype.updateFile = function (file, name, tags, favourite, global) {
            this.mRequest = "updateFile";
            var loader = new Animate.Loader();
            loader.addEventListener(Animate.LoaderEvents.COMPLETE, this.onServer, this);
            loader.addEventListener(Animate.LoaderEvents.FAILED, this.onServer, this);
            loader.load(Animate.DB.HOST, {
                category: "files",
                command: this.mRequest,
                fileID: file.id,
                name: name,
                tags: tags,
                favourite: favourite,
                global: (global ? 1 : 0),
                projectID: this.id
            }, true);
        };

        /**
        * Use this function to update a file's image contents
        * @param {string} fileID The file we are updating
        * @param {string} data The base64 image data
        */
        Project.prototype.updateImageContent = function (fileID, data) {
            this.mRequest = "updateImageContent";
            var loader = new Animate.Loader();
            loader.addEventListener(Animate.LoaderEvents.COMPLETE, this.onServer, this);
            loader.addEventListener(Animate.LoaderEvents.FAILED, this.onServer, this);
            loader.load(Animate.DB.HOST, {
                category: "files",
                command: this.mRequest,
                fileID: fileID,
                data: data,
                projectID: this.id
            }, true);
        };

        /**
        * This function is used to fetch the beaviours of a project.
        */
        Project.prototype.loadBehaviours = function () {
            this.mRequest = "getProjectBehavious";
            var loader = new Animate.Loader();
            loader.addEventListener(Animate.LoaderEvents.COMPLETE, this.onServer, this);
            loader.addEventListener(Animate.LoaderEvents.FAILED, this.onServer, this);
            loader.load(Animate.DB.HOST, {
                category: "project",
                command: this.mRequest,
                projectID: this.id
            }, true);
        };

        /**
        * This function is used to create a new group. This will make
        * a call the server. If the server sends a fail message then no new group
        * will be created. You can use the event GROUP_CREATED to hook into
        * a successful DB entry created.
        * @param {string} name The proposed name of the group.
        */
        Project.prototype.createGroup = function (name) {
            this.mRequest = "createGroup";
            var loader = new Animate.Loader();
            loader.addEventListener(Animate.LoaderEvents.COMPLETE, this.onServer, this);
            loader.addEventListener(Animate.LoaderEvents.FAILED, this.onServer, this);
            loader.load(Animate.DB.HOST, {
                category: "project",
                command: this.mRequest,
                name: name,
                projectID: this.id
            }, true);
        };

        /**
        * This function is used to fetch the groups of a project.
        */
        Project.prototype.loadGroups = function () {
            this.mRequest = "getProjectGroups";
            var loader = new Animate.Loader();
            loader.addEventListener(Animate.LoaderEvents.COMPLETE, this.onServer, this);
            loader.addEventListener(Animate.LoaderEvents.FAILED, this.onServer, this);
            loader.load(Animate.DB.HOST, {
                category: "project",
                command: this.mRequest,
                projectID: this.id
            }, true);
        };

        /**
        * This will save an array of groups to the server.
        * @param {Array<TreeNodeGroup>} groups The array of TreeNodeGroups we are trying to save.
        */
        Project.prototype.saveGroups = function (groups) {
            var data = {};
            data["category"] = "project";
            data["command"] = "saveGroups";
            data["projectID"] = this.id;

            //Create a multidimension array and pass each of the groups
            var counter = 0;
            for (var id in groups) {
                var group = groups[id];
                var jsonStr = JSON.stringify(group.json, null);

                data["groups[" + counter + "][json]"] = jsonStr;
                data["groups[" + counter + "][name]"] = group.name;
                data["groups[" + counter + "][id]"] = group.groupID;
                counter++;
            }

            this.mRequest = "saveGroups";
            var loader = new Animate.Loader();
            loader.addEventListener(Animate.LoaderEvents.COMPLETE, this.onServer, this);
            loader.addEventListener(Animate.LoaderEvents.FAILED, this.onServer, this);
            loader.load(Animate.DB.HOST, data, true);
        };

        /**
        * Deletes groups from the project
        * @param {Array<string>} groups The group of IDs to delete
        */
        Project.prototype.deleteGroups = function (groups) {
            var data = {};
            data["category"] = "project";
            data["command"] = "deleteGroups";
            data["projectID"] = this.id;

            for (var i = 0; i < groups.length; i++)
                data["groupIDs[" + i + "][id]"] = groups[i];

            this.mRequest = "deleteGroups";
            var loader = new Animate.Loader();
            loader.addEventListener(Animate.LoaderEvents.COMPLETE, this.onServer, this);
            loader.addEventListener(Animate.LoaderEvents.FAILED, this.onServer, this);
            loader.load(Animate.DB.HOST, data, true);
        };

        /**
        * This will download all group variables from the server. If successful, the function will also get
        * the asset treeview to update its contents
        * @param {Array<TreeNodeGroup>} groups The array of <TreeNodeGroupInstance>s we are trying to save.
        */
        Project.prototype.updateGroups = function (groups) {
            var data = {};
            data["category"] = "project";
            data["command"] = "updateGroups";
            data["projectID"] = this.id;

            for (var i = 0; i < groups.length; i++)
                data["groups[" + i + "][id]"] = groups[i].groupID;

            this.mRequest = "updateGroups";
            var loader = new Animate.Loader();
            loader.addEventListener(Animate.LoaderEvents.COMPLETE, this.onServer, this);
            loader.addEventListener(Animate.LoaderEvents.FAILED, this.onServer, this);
            loader.load(Animate.DB.HOST, data, true);
        };

        /**
        * This function is used to create a new asset on the server.
        * If the server sends a fail message then no new asset
        * will be created. You can use the event <Project.ASSET_CREATED> to hook into
        * a successful DB entry created.
        * @param {string} name The proposed name of the asset.
        * @param {string} className The class of the asset.
        */
        Project.prototype.createAsset = function (name, className) {
            this.mRequest = "createAsset";
            var loader = new Animate.Loader();
            loader.addEventListener(Animate.LoaderEvents.COMPLETE, this.onServer, this);
            loader.addEventListener(Animate.LoaderEvents.FAILED, this.onServer, this);
            loader.load(Animate.DB.HOST, {
                category: "project",
                command: this.mRequest,
                name: name,
                className: className,
                projectID: this.id
            }, true);
        };

        /**
        * This will save an asset's variables to the server in JSON.
        * @param {Asset} asset The {Asset} we are trying to save in the DB.
        */
        Project.prototype.saveAsset = function (asset) {
            this.mRequest = "saveAsset";
            var loader = new Animate.Loader();
            loader.addEventListener(Animate.LoaderEvents.COMPLETE, this.onServer, this);
            loader.addEventListener(Animate.LoaderEvents.FAILED, this.onServer, this);
            loader.load(Animate.DB.HOST, {
                category: "project",
                command: this.mRequest,
                assetID: asset.id.replace("a", ""),
                assetJSON: (asset.properties ? JSON.stringify(asset.properties.tokenize(), null) : ""),
                projectID: this.id
            }, true);
        };

        /**
        * This will download an asset's variables from the server.
        * @param {Asset} asset The {Asset} we are trying to update.
        */
        Project.prototype.updateAsset = function (asset) {
            this.mRequest = "updateAsset";
            var loader = new Animate.Loader();
            loader.addEventListener(Animate.LoaderEvents.COMPLETE, this.onServer, this);
            loader.addEventListener(Animate.LoaderEvents.FAILED, this.onServer, this);
            loader.load(Animate.DB.HOST, {
                category: "project",
                command: this.mRequest,
                assetID: asset.id.replace("a", ""),
                projectID: this.id
            }, true);
        };

        /**
        * This will download all asset variables from the server.
        * @param {Array<string>} classNames An array of strings for each of the asset class names we are trying to update.
        */
        Project.prototype.updateAssets = function (classNames) {
            var data = {};
            data["category"] = "project";
            data["command"] = "updateAssets";
            data["projectID"] = this.id;

            for (var i = 0; i < classNames.length; i++)
                data["classNames[" + i + "][name]"] = classNames[i];

            this.mRequest = "updateAssets";
            var loader = new Animate.Loader();
            loader.addEventListener(Animate.LoaderEvents.COMPLETE, this.onServer, this);
            loader.addEventListener(Animate.LoaderEvents.FAILED, this.onServer, this);
            loader.load(Animate.DB.HOST, data, true);
        };

        /**
        * This will download all asset variables from the server.
        * @param {Array<string>} behaviourIDs An array of behaviour ID's that need to be updated
        */
        Project.prototype.updateBehaviours = function (behaviourIDs) {
            var data = {};
            data["category"] = "project";
            data["command"] = "updateBehaviours";
            data["projectID"] = this.id;

            //Create a multidimension array and pass each of the project dependencies
            var len = behaviourIDs.length;
            for (var i = 0; i < len; i++) {
                data["behaviourIDs[" + i + "][id]"] = behaviourIDs[i];
            }

            this.mRequest = "updateBehaviours";
            var loader = new Animate.Loader();
            loader.addEventListener(Animate.LoaderEvents.COMPLETE, this.onServer, this);
            loader.addEventListener(Animate.LoaderEvents.FAILED, this.onServer, this);
            loader.load(Animate.DB.HOST, data, true);
        };

        /**
        * This function is used to copy an asset.
        * @param {Asset} asset The asset object we are trying to copy
        */
        Project.prototype.copyAsset = function (asset) {
            this.mRequest = "copyAsset";
            var loader = new Animate.Loader();
            loader.addEventListener(Animate.LoaderEvents.COMPLETE, this.onServer, this);
            loader.addEventListener(Animate.LoaderEvents.FAILED, this.onServer, this);
            loader.load(Animate.DB.HOST, {
                category: "project",
                command: this.mRequest,
                assetID: asset.id.replace("a", ""),
                projectID: this.id
            }, true);
        };

        /**
        * This function is used to delete an asset.
        * @param {Array<string>} assetIDs The asset object we are trying to delete
        */
        Project.prototype.deleteAssets = function (assetIDs) {
            var data = {};
            data["category"] = "project";
            data["command"] = "deleteAssets";
            data["projectID"] = this.id;

            for (var i = 0; i < assetIDs.length; i++)
                data["assetIDs[" + i + "][id]"] = assetIDs[i].replace("a", "");

            this.mRequest = "deleteAssets";
            var loader = new Animate.Loader();
            loader.addEventListener(Animate.LoaderEvents.COMPLETE, this.onServer, this);
            loader.addEventListener(Animate.LoaderEvents.FAILED, this.onServer, this);
            loader.load(Animate.DB.HOST, data, true);
        };

        /**
        * This function is used to fetch the _assets of a project.
        */
        Project.prototype.loadAssets = function () {
            this.mRequest = "getProjectAssets";
            var loader = new Animate.Loader();
            loader.addEventListener(Animate.LoaderEvents.COMPLETE, this.onServer, this);
            loader.addEventListener(Animate.LoaderEvents.FAILED, this.onServer, this);
            loader.load(Animate.DB.HOST, {
                category: "project",
                command: this.mRequest,
                projectID: this.id
            }, true);
        };

        /**
        * This function is called whenever we get a resonse from the server
        */
        Project.prototype.onServer = function (response, event, sender) {
            var data = event.tag;

            if (response == Animate.LoaderEvents.COMPLETE) {
                if (event.return_type == Animate.ServerResponses.SUCCESS) {
                    if (this.mRequest == "create") {
                        this.mSaved = true;
                        this.id = data.id;
                        this.buildID = data.current_build;
                        this.mCurBuild = data.build;
                        this.dispatchEvent(new ProjectEvent(ProjectEvents.SAVED, event.message, data));
                    } else if (this.mRequest == "openProject") {
                        this.mSaved = true;
                        this.id = data.id;
                        this.buildID = data.current_build;
                        this.created = data.created_on;
                        this.lastModified = data.last_modified;

                        this.mRating = data.rating;
                        this.mCategory = data.category;
                        this.mSubCategory = data.sub_category;
                        this.mImgPath = data.image;
                        this.mVisibility = data.visibility;

                        var plugins = data.plugins;

                        if (!plugins)
                            this._plugins = [];
else {
                            this._plugins = [];
                            var i = __plugins.length;
                            while (i--) {
                                var ii = plugins.length;
                                while (ii--)
                                    if (plugins[ii].name == __plugins[i].name) {
                                        this._plugins.push(__plugins[i]);
                                        break;
                                    }
                            }
                        }

                        this.mCurBuild = data.build;

                        this.mDescription = data.description;
                        this.mTags = data.tags;
                        this.dispatchEvent(new ProjectEvent(ProjectEvents.OPENED, event.message, data));
                    } else if (this.mRequest == "selectBuild") {
                        this.mCurBuild = data.build;
                        this.dispatchEvent(new ProjectEvent(ProjectEvents.BUILD_SELECTED, "Build Selected", this.mCurBuild));
                    } else if (this.mRequest == "saveBuild") {
                        this.mCurBuild = data.build;
                        this.dispatchEvent(new ProjectEvent(ProjectEvents.BUILD_SAVED, "Build saved", this.mCurBuild));
                    } else if (this.mRequest == "deleteBehaviours") {
                        //Update _assets which we fetched from the DB.
                        var counter = 0;
                        var toRemove = [];
                        while (data[counter.toString()] != null) {
                            var dbEntry = data[counter.toString()];
                            var len = this._behaviours.length;
                            for (var i = 0; i < len; i++)
                                if (this._behaviours[i].id == dbEntry["id"]) {
                                    this.dispatchEvent(new ProjectEvent(ProjectEvents.BEHAVIOUR_DELETING, "Deleting Behaviour", Animate.LoaderEvents.COMPLETE, this._behaviours[i]));
                                    this._behaviours[i].dispose();
                                    toRemove.push(this._behaviours[i]);
                                }

                            counter++;
                        }

                        var i = toRemove.length;
                        while (i--)
                            this._behaviours.splice(this._behaviours.indexOf(toRemove[i]), 1);
                    } else if (this.mRequest == "createBehaviour") {
                        var behaviour = new Animate.BehaviourContainer(data.name, data.id);
                        this._behaviours.push(behaviour);

                        //Create the GUI elements
                        var node = Animate.TreeViewScene.getSingleton().addContainer(behaviour);
                        node.save(false);
                        var tabPair = Animate.CanvasTab.getSingleton().addSpecialTab(behaviour.name, Animate.CanvasTabType.CANVAS, behaviour);
                        jQuery(".text", tabPair.tabSelector.element).text(node.element.text());
                        tabPair.name = node.element.text();

                        this.dispatchEvent(new ProjectEvent(ProjectEvents.BEHAVIOUR_CREATED, "Behaviour created", Animate.LoaderEvents.COMPLETE, behaviour));
                    } else if (this.mRequest == "getProjectBehavious") {
                        for (var i = 0; i < this._behaviours.length; i++)
                            this._behaviours[i].dispose();

                        this._behaviours.splice(0, this._behaviours.length);

                        //Create new behaviours which we fetched from the DB.
                        var counter = 0;
                        while (data[counter.toString()] != null) {
                            var dbEntry = data[counter.toString()];
                            var b = new Animate.BehaviourContainer(dbEntry["name"], dbEntry["id"]);
                            b.json = dbEntry["json"];

                            if (dbEntry["properties"] != null && jQuery.trim(dbEntry["properties"]) != "")
                                b.properties = JSON.parse(dbEntry["properties"]);

                            this._behaviours.push(b);
                            counter++;

                            //Create the GUI elements
                            Animate.TreeViewScene.getSingleton().addContainer(b);

                            //Update the GUI elements
                            Animate.TreeViewScene.getSingleton().updateBehaviour(b);
                            this.dispatchEvent(new ProjectEvent(ProjectEvents.BEHAVIOUR_UPDATED, "Behaviour updated", Animate.LoaderEvents.COMPLETE, b));
                        }
                        this.dispatchEvent(new ProjectEvent(ProjectEvents.BEHAVIOURS_LOADED, "Behaviours loaded", Animate.LoaderEvents.COMPLETE, null));
                    } else if (this.mRequest == "saveBehaviours") {
                        for (var i = 0; i < this._behaviours.length; i++) {
                            var counter = 0;
                            while (data[counter.toString()] != null) {
                                if (this._behaviours[i].id == data[counter.toString()].id) {
                                    this._behaviours[i].json = data[counter.toString()].json;

                                    if (data[counter.toString()].properties != null && data[counter.toString()].properties != "")
                                        this._behaviours[i].properties = JSON.parse(data[counter.toString()].properties);
                                    this.dispatchEvent(new ProjectEvent(ProjectEvents.BEHAVIOUR_SAVED, "Behaviour saved", Animate.LoaderEvents.COMPLETE, this._behaviours[i]));
                                    break;
                                }

                                counter++;
                            }
                        }

                        this.dispatchEvent(new ProjectEvent(ProjectEvents.BEHAVIOURS_SAVED, "Behaviours saved", Animate.LoaderEvents.COMPLETE, null));
                    } else if (this.mRequest == "saveAll") {
                        this.mCurBuild = data.build;

                        for (var i = 0; i < this._behaviours.length; i++) {
                            var counter = 0;
                            while (data.behaviours[counter.toString()] != null) {
                                if (this._behaviours[i].id == data.behaviours[counter.toString()].id) {
                                    this._behaviours[i].json = data.behaviours[counter.toString()].json;
                                    if (data.behaviours[counter.toString()].properties != null && data.behaviours[counter.toString()].properties != "")
                                        this._behaviours[i].properties = JSON.parse(data.behaviours[counter.toString()].properties);
                                    this.dispatchEvent(new ProjectEvent(ProjectEvents.BEHAVIOUR_SAVED, "Behaviour saved", Animate.LoaderEvents.COMPLETE, this._behaviours[i]));
                                    break;
                                }

                                counter++;
                            }
                        }

                        for (var i = 0; i < this._assets.length; i++) {
                            var counter = 0;
                            while (data.assets[counter.toString()] != null) {
                                if (this._assets[i].id == "a" + data.assets[counter.toString()].id) {
                                    this._assets[i].properties = JSON.parse(data.assets[counter.toString()].json);
                                    this.dispatchEvent(new ProjectEvent(ProjectEvents.ASSET_SAVED, "Asset saved", Animate.LoaderEvents.COMPLETE, this._assets[i]));
                                    break;
                                }

                                counter++;
                            }
                        }

                        //Now groups
                        var counter = 0;
                        while (data.groups[counter.toString()] != null) {
                            this.dispatchEvent(new ProjectEvent(ProjectEvents.GROUP_SAVED, "Group saved", Animate.LoaderEvents.COMPLETE, data.groups[counter.toString()]));
                            counter++;
                        }

                        this.dispatchEvent(new ProjectEvent(ProjectEvents.SAVED_ALL, "Saved all", Animate.LoaderEvents.COMPLETE, data));
                    } else if (this.mRequest == "deleteAssets") {
                        //Update _assets which we fetched from the DB.
                        var counter = 0;
                        var toRemove = [];
                        while (data[counter.toString()] != null) {
                            var dbEntry = data[counter.toString()];
                            var len = this._assets.length;
                            for (var i = 0; i < len; i++)
                                if (this._assets[i].id == "a" + dbEntry["id"]) {
                                    this.dispatchEvent(new ProjectEvent(ProjectEvents.ASSET_DELETING, "Asset Deleting", Animate.LoaderEvents.COMPLETE, this._assets[i]));

                                    //Notify the destruction of an asset
                                    Animate.PluginManager.getSingleton().assetDestroyed(this._assets[i]);

                                    this._assets[i].dispose();
                                    toRemove.push(this._assets[i]);

                                    break;
                                }

                            counter++;
                        }

                        var i = toRemove.length;
                        while (i--)
                            this._assets.splice(this._assets.indexOf(toRemove[i]), 1);
                    } else if (this.mRequest == "copyAsset") {
                        for (var i = 0; i < this._assets.length; i++)
                            if (this._assets[i].id == "a" + data.original_id) {
                                var asset = new Animate.Asset(data.name, data.className, data.json);
                                asset.id = "a" + data.id;

                                this._assets.push(asset);

                                //Create the GUI elements
                                Animate.TreeViewScene.getSingleton().addAssetInstance(asset, false);

                                //Notify the creation of an asset
                                Animate.PluginManager.getSingleton().assetCreated(asset.name, asset);

                                this.dispatchEvent(new ProjectEvent(ProjectEvents.ASSET_CREATED, "Asset created", Animate.LoaderEvents.COMPLETE, asset));

                                //Notify the copying of an asset
                                Animate.PluginManager.getSingleton().assetCopied(this._assets[i], asset);
                                return;
                            }
                    } else if (this.mRequest == "getProjectFiles") {
                        var i = this._files.length;
                        while (i--)
                            this._files[i].dispose();

                        this._files.splice(0, this._files.length);

                        //Create new _assets which we fetched from the DB.
                        var counter = 0;
                        while (data[counter.toString()] != null) {
                            var dbEntry = data[counter.toString()];
                            var file = new Animate.File(dbEntry["name"], dbEntry["path"], dbEntry["tags"], dbEntry["id"], dbEntry["created_on"], dbEntry["last_modified"], parseInt(dbEntry["size"]), dbEntry["favourite"], dbEntry["preview_path"], parseInt(dbEntry["global"]));

                            this._files.push(file);

                            this.dispatchEvent(new ProjectEvent(ProjectEvents.FILE_CREATED, "File created", Animate.LoaderEvents.COMPLETE, file));
                            counter++;
                        }
                        this.dispatchEvent(new ProjectEvent(ProjectEvents.FILES_CREATED, "Files created", Animate.LoaderEvents.COMPLETE, this));
                        this.dispatchEvent(new ProjectEvent(ProjectEvents.FILES_LOADED, "Files loaded", Animate.LoaderEvents.COMPLETE, this));
                    } else if (this.mRequest == "importFile") {
                        //Create new _assets which we fetched from the DB.
                        var file = new Animate.File(data["name"], data["path"], data["tags"], data["id"], data["created_on"], data["last_modified"], parseInt(data["size"]), data["favourite"], data["preview_path"], parseInt(data["global"]));
                        this._files.push(file);

                        this.dispatchEvent(new ProjectEvent(ProjectEvents.FILE_CREATED, "File created", Animate.LoaderEvents.COMPLETE, file));
                        this.dispatchEvent(new ProjectEvent(ProjectEvents.FILE_IMPORTED, "File imported", Animate.LoaderEvents.COMPLETE, file));
                    } else if (this.mRequest == "fetchFiles") {
                        var _files = [];

                        //Create new _assets which we fetched from the DB.
                        var counter = 0;
                        while (data[counter.toString()] != null) {
                            var dbEntry = data[counter.toString()];
                            var file = new Animate.File(dbEntry["name"], dbEntry["path"], dbEntry["tags"], dbEntry["id"], dbEntry["created_on"], dbEntry["last_modified"], parseInt(dbEntry["size"]), dbEntry["favourite"], dbEntry["preview_path"], parseInt(dbEntry["global"]));
                            _files.push(file);
                            counter++;
                        }

                        this.dispatchEvent(new ProjectEvent(ProjectEvents.FILES_FETCHED, "Files fetched", Animate.LoaderEvents.COMPLETE, _files));
                    } else if (this.mRequest == "deleteFile") {
                        var i = this._files.length;
                        while (i--)
                            if (this._files[i].id == data.id) {
                                this.dispatchEvent(new ProjectEvent(ProjectEvents.FILE_DELETED, "File deleted", Animate.LoaderEvents.COMPLETE, this._files[i]));
                                this._files.splice(i, 1);
                                return;
                            }

                        this.dispatchEvent(new ProjectEvent(ProjectEvents.FILES_DELETED, "Files deleted", Animate.LoaderEvents.COMPLETE, data));
                    } else if (this.mRequest == "updateFile" || this.mRequest == "updateImageContent") {
                        var i = this._files.length;
                        while (i--)
                            if (this._files[i].id == data.id) {
                                this._files[i].name = data.name;
                                this._files[i].tags = data.tags.split(",");
                                this._files[i].lastModified = data.last_modified;
                                this._files[i].favourite = data.favourite;
                                this._files[i].global = parseInt(data.global);

                                if (this.mRequest == "updateFile")
                                    this.dispatchEvent(new ProjectEvent(ProjectEvents.FILE_UPDATED, "File updated", Animate.LoaderEvents.COMPLETE, this._files[i]));
else
                                    this.dispatchEvent(new ProjectEvent(ProjectEvents.FILE_IMAGE_UPDATED, "File image updated", Animate.LoaderEvents.COMPLETE, this._files[i]));

                                return;
                            }
                    } else if (this.mRequest == "createGroup") {
                        this.dispatchEvent(new ProjectEvent(ProjectEvents.GROUP_CREATED, "Group created", Animate.LoaderEvents.COMPLETE, { id: data.id, name: data.name }));
                    } else if (this.mRequest == "getProjectGroups") {
                        //Create new _assets which we fetched from the DB.
                        var counter = 0;
                        while (data[counter.toString()] != null) {
                            var dbEntry = data[counter.toString()];
                            this.dispatchEvent(new ProjectEvent(ProjectEvents.GROUP_CREATED, "Group created", Animate.LoaderEvents.COMPLETE, { id: dbEntry["id"], name: dbEntry["name"], json: dbEntry["json"] }));
                            counter++;
                        }
                        this.dispatchEvent(new ProjectEvent(ProjectEvents.GROUPS_LOADED, "Groups loaded", Animate.LoaderEvents.COMPLETE, this));
                    } else if (this.mRequest == "deleteGroups") {
                        var counter = 0;
                        while (data[counter.toString()] != null) {
                            var dbEntry = data[counter.toString()];
                            this.dispatchEvent(new ProjectEvent(ProjectEvents.GROUP_DELETING, "Group deleting", Animate.LoaderEvents.COMPLETE, dbEntry.id));
                            counter++;
                        }
                    } else if (this.mRequest == "updateGroups") {
                        //Update _assets which we fetched from the DB.
                        var counter = 0;
                        while (data[counter.toString()] != null) {
                            var dbEntry = data[counter.toString()];
                            this.dispatchEvent(new ProjectEvent(ProjectEvents.GROUP_UPDATED, "Group updated", Animate.LoaderEvents.COMPLETE, dbEntry));
                            counter++;
                        }

                        this.dispatchEvent(new ProjectEvent(ProjectEvents.GROUPS_UPDATED, "Groups updated", null));
                    } else if (this.mRequest == "saveGroups") {
                        var counter = 0;
                        while (data[counter.toString()] != null) {
                            this.dispatchEvent(new ProjectEvent(ProjectEvents.GROUP_SAVED, "Group saved", Animate.LoaderEvents.COMPLETE, data[counter.toString()]));
                            counter++;
                        }

                        this.dispatchEvent(new ProjectEvent(ProjectEvents.GROUPS_SAVED, "Groups saved", Animate.LoaderEvents.COMPLETE, null));
                    } else if (this.mRequest == "createAsset") {
                        var asset = new Animate.Asset(data.name, data.className, data.json);
                        asset.id = "a" + data.id;
                        this._assets.push(asset);

                        //Create the GUI elements
                        Animate.TreeViewScene.getSingleton().addAssetInstance(asset, false);

                        //Notify the creation of an asset
                        Animate.PluginManager.getSingleton().assetCreated(asset.name, asset);

                        this.dispatchEvent(new ProjectEvent(ProjectEvents.ASSET_CREATED, "Asset created", Animate.LoaderEvents.COMPLETE, asset));
                    } else if (this.mRequest == "saveAsset") {
                        for (var i = 0; i < this._assets.length; i++)
                            if (this._assets[i].id == "a" + data.id) {
                                this.dispatchEvent(new ProjectEvent(ProjectEvents.ASSET_SAVED, "Asset saved", Animate.LoaderEvents.COMPLETE, this._assets[i]));
                                return;
                            }

                        this.dispatchEvent(new ProjectEvent(ProjectEvents.ASSET_SAVED, "Asset saved", Animate.LoaderEvents.COMPLETE, null));
                    } else if (this.mRequest == "updateAsset") {
                        for (var i = 0; i < this._assets.length; i++)
                            if (this._assets[i].id == "a" + data.id) {
                                this._assets[i].update(data.name, data.className, data.json);
                                this.dispatchEvent(new ProjectEvent(ProjectEvents.ASSET_UPDATED, "Asset updated", Animate.LoaderEvents.COMPLETE, this._assets[i]));
                                return;
                            }

                        this.dispatchEvent(new ProjectEvent(ProjectEvents.ASSET_SAVED, "Asset saved", Animate.LoaderEvents.COMPLETE, null));
                    } else if (this.mRequest == "updateAssets") {
                        //Update _assets which we fetched from the DB.
                        var counter = 0;
                        while (data[counter.toString()] != null) {
                            var dbEntry = data[counter.toString()];
                            var len = this._assets.length;
                            for (var i = 0; i < len; i++)
                                if (this._assets[i].id == "a" + dbEntry["id"]) {
                                    this._assets[i].update(dbEntry["name"], dbEntry["className"], dbEntry["json"]);

                                    //Update the GUI elements
                                    Animate.TreeViewScene.getSingleton().updateAssetInstance(this._assets[i]);
                                    break;
                                }

                            counter++;
                        }

                        this.dispatchEvent(new ProjectEvent(ProjectEvents.ASSETS_UPDATED, "Assets updated", Animate.LoaderEvents.COMPLETE, null));
                    } else if (this.mRequest == "updateBehaviours") {
                        //Update _behaviours which we fetched from the DB.
                        var counter = 0;
                        while (data[counter.toString()] != null) {
                            var dbEntry = data[counter.toString()];
                            var len = this._behaviours.length;
                            for (var i = 0; i < len; i++)
                                if (this._behaviours[i].id == dbEntry["id"]) {
                                    this._behaviours[i].update(dbEntry["name"], dbEntry["json"]);

                                    //Update the GUI elements
                                    Animate.TreeViewScene.getSingleton().updateBehaviour(this._behaviours[i]);
                                    this.dispatchEvent(new ProjectEvent(ProjectEvents.BEHAVIOUR_UPDATED, "Behaviour updated", Animate.LoaderEvents.COMPLETE, this._behaviours[i]));
                                    break;
                                }

                            counter++;
                        }

                        this.dispatchEvent(new ProjectEvent(ProjectEvents.BEHAVIOURS_UPDATED, "Behaviours updated", Animate.LoaderEvents.COMPLETE, null));
                    } else if (this.mRequest == "getProjectAssets") {
                        for (var i = 0; i < this._assets.length; i++)
                            this._assets[i].dispose();

                        this._assets.splice(0, this._assets.length);

                        //Create new _assets which we fetched from the DB.
                        var counter = 0;
                        while (data[counter.toString()] != null) {
                            var dbEntry = data[counter.toString()];
                            var asset = new Animate.Asset(dbEntry["name"], dbEntry["className"], dbEntry["json"]);
                            asset.id = "a" + dbEntry["id"];

                            if (Animate.TreeViewScene.getSingleton().addAssetInstance(asset))
                                this._assets.push(asset);
else
                                asset.dispose();

                            counter++;
                        }

                        //Sort the asset array for loading.
                        var pMan = Animate.PluginManager.getSingleton();
                        pMan.sortAssets(this._assets);

                        //Notify the creation of an asset
                        var len = this._assets.length;
                        for (var i = 0; i < len; i++)
                            pMan.assetCreated(this._assets[i].name, this._assets[i]);

                        this.dispatchEvent(new ProjectEvent(ProjectEvents.ASSETS_LOADED, "Assets loaded", Animate.LoaderEvents.COMPLETE, this));
                    } else if (this.mRequest == "renameObject") {
                        var obj = null;
                        var dataType = ProjectAssetTypes.fromString(data.type);
                        if (dataType.toString() == ProjectAssetTypes.BEHAVIOUR.toString()) {
                            var len = this._behaviours.length;
                            for (var i = 0; i < len; i++)
                                if (data.id == this._behaviours[i].id) {
                                    obj = this._behaviours[i];
                                    break;
                                }
                        } else if (dataType.toString() == ProjectAssetTypes.ASSET.toString()) {
                            data.id = "a" + data.id;

                            var len = this._assets.length;
                            for (var i = 0; i < len; i++)
                                if (data.id == this._assets[i].id) {
                                    obj = this._assets[i];
                                    break;
                                }
                        } else
                            obj = Animate.TreeViewScene.getSingleton().getGroupByID(data.id);

                        //Send event
                        this.dispatchEvent(new ProjectEvent(ProjectEvents.OBJECT_RENAMED, "Object Renamed", Animate.LoaderEvents.COMPLETE, { object: obj, type: data.type, name: data.name, id: data.id }));
                    }
                } else {
                    Animate.MessageBox.show(event.message, Array("Ok"), null, null);
                    this.dispatchEvent(new ProjectEvent(ProjectEvents.FAILED, event.message, data));
                }
            } else
                this.dispatchEvent(new ProjectEvent(ProjectEvents.FAILED, "Could not connec to the server.", Animate.LoaderEvents.FAILED, null));
        };

        Object.defineProperty(Project.prototype, "behaviours", {
            get: function () {
                return this._behaviours;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Project.prototype, "files", {
            get: function () {
                return this._files;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Project.prototype, "assets", {
            get: function () {
                return this._assets;
            },
            enumerable: true,
            configurable: true
        });

        /**
        * This will cleanup the project and remove all data associated with it.
        */
        Project.prototype.dispose = function () {
            //Cleanup behaviours
            var i = this._behaviours.length;
            while (i--) {
                this.dispatchEvent(new ProjectEvent(ProjectEvents.BEHAVIOUR_DELETING, "Behaviour deleting", Animate.LoaderEvents.COMPLETE, this._behaviours[i]));
                this._behaviours[i].dispose();
            }

            i = this._assets.length;
            while (i--) {
                //Notify the destruction of an asset
                Animate.PluginManager.getSingleton().assetDestroyed(this._assets[i]);
                this._assets[i].dispose();
            }

            i = this._files.length;
            while (i--)
                this._files[i].dispose();

            this._plugins = null;
            this.created = null;
            this.lastModified = null;
            this.id = null;
            this.mSaved = null;
            this.mName = null;
            this.mDescription = null;
            this.mRequest = null;
            this.builds = null;
            this._behaviours = null;
            this._assets = null;
            this.buildID = null;
            this._files = null;

            //Call super
            _super.prototype.dispose.call(this);
        };

        Object.defineProperty(Project.prototype, "plugins", {
            get: function () {
                return this._plugins;
            },
            enumerable: true,
            configurable: true
        });
        return Project;
    })(Animate.EventDispatcher);
    Animate.Project = Project;
})(Animate || (Animate = {}));
//# sourceMappingURL=Project.js.map
