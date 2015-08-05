var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports"], function (require, exports) {
    var Animate;
    (function (Animate) {
        var ProjectAssetTypes = (function (_super) {
            __extends(ProjectAssetTypes, _super);
            function ProjectAssetTypes(v) {
                _super.call(this, v);
            }
            /**
            * Returns an enum reference by its name/value
            * @param {string} val
            * @returns ENUM
            */
            ProjectAssetTypes.fromString = function (val) {
                switch (val) {
                    case "behaviour":
                        return ProjectAssetTypes.BEHAVIOUR;
                    case "asset":
                        return ProjectAssetTypes.ASSET;
                    case "group":
                        return ProjectAssetTypes.GROUP;
                }
                return null;
            };
            ProjectAssetTypes.BEHAVIOUR = new ProjectAssetTypes("behaviour");
            ProjectAssetTypes.ASSET = new ProjectAssetTypes("asset");
            ProjectAssetTypes.GROUP = new ProjectAssetTypes("group");
            return ProjectAssetTypes;
        })(ENUM);
        Animate.ProjectAssetTypes = ProjectAssetTypes;
        var ProjectEvents = (function () {
            function ProjectEvents(v) {
                this.value = v;
            }
            ProjectEvents.prototype.toString = function () { return this.value; };
            ProjectEvents.SAVED = new ProjectEvents("saved");
            ProjectEvents.SAVED_ALL = new ProjectEvents("saved_all");
            ProjectEvents.OPENED = new ProjectEvents("opened");
            ProjectEvents.FAILED = new ProjectEvents("failed");
            ProjectEvents.BUILD_SELECTED = new ProjectEvents("build_selected");
            ProjectEvents.HTML_SAVED = new ProjectEvents("html_saved");
            ProjectEvents.CSS_SAVED = new ProjectEvents("css_saved");
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
            //static FILES_FETCHED: ProjectEvents = new ProjectEvents("files_fetched");
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
        })(AnimateLoaderEvent);
        Animate.ProjectEvent = ProjectEvent;
        (function (PrivilegeType) {
            PrivilegeType[PrivilegeType["NONE"] = 0] = "NONE";
            PrivilegeType[PrivilegeType["READ"] = 1] = "READ";
            PrivilegeType[PrivilegeType["WRITE"] = 2] = "WRITE";
            PrivilegeType[PrivilegeType["ADMIN"] = 3] = "ADMIN";
        })(Animate.PrivilegeType || (Animate.PrivilegeType = {}));
        var PrivilegeType = Animate.PrivilegeType;
        /**
        * A project class is an object that is owned by a user.
        * The project has functions which are useful for comunicating data to the server when
        * loading and saving data in the scene.
        */
        var Project = (function (_super) {
            __extends(Project, _super);
            /**
            * @param{string} id The database id of this project
            */
            function Project(id, name, build) {
                // Call super-class constructor
                _super.call(this);
                this._id = id;
                this.buildId = "";
                this.mSaved = true;
                this.mName = name;
                this.mDescription = "";
                this.mTags = "";
                //this.mRequest = "";
                this.mCurBuild = build;
                this._plugins = [];
                this.created = Date.now();
                this.lastModified = Date.now();
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
            * @param {string} id The ID of the asset id
            * @returns {Asset} The asset whose id matches the id parameter or null
            */
            Project.prototype.getAssetByID = function (id) {
                for (var i = 0; i < this._assets.length; i++)
                    if (this._assets[i].id == id)
                        return this._assets[i];
                return null;
            };
            /**
            * Gets an asset by its shallow ID
            * @param {string} id The shallow ID of the asset id
            * @returns {Asset} The asset whose id matches the id parameter or null
            */
            Project.prototype.getAssetByShallowId = function (id) {
                for (var i = 0; i < this._assets.length; i++)
                    if (this._assets[i].shallowId == id)
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
            Project.prototype.getBehaviourById = function (id) {
                for (var i = 0; i < this._behaviours.length; i++)
                    if (this._behaviours[i].id == id)
                        return this._behaviours[i];
                return null;
            };
            /**
            * Gets a {BehaviourContainer} by its shallow or local ID
            * @param {string} id The local ID of the BehaviourContainer
            * @returns {BehaviourContainer} The BehaviourContainer whose id matches the id parameter or null
            */
            Project.prototype.getBehaviourByShallowId = function (id) {
                for (var i = 0; i < this._behaviours.length; i++)
                    if (this._behaviours[i].shallowId == id)
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
                var loader = new AnimateLoader();
                loader.addEventListener(LoaderEvents.COMPLETE, this.onServer, this);
                loader.addEventListener(LoaderEvents.FAILED, this.onServer, this);
                loader.load("/project/rename-object", {
                    projectId: this._id,
                    name: name,
                    objectId: id,
                    type: type.toString()
                });
            };
            /**
            * This function is used to create an entry for this project on the DB.
            */
            Project.prototype.selectBuild = function (major, mid, minor) {
                var loader = new AnimateLoader();
                loader.addEventListener(LoaderEvents.COMPLETE, this.onServer, this);
                loader.addEventListener(LoaderEvents.FAILED, this.onServer, this);
                loader.load("/project/select-build", { projectId: this._id, major: major, mid: mid, minor: minor });
            };
            /**
            * This function is used to update the current build data
            */
            Project.prototype.saveBuild = function (notes, visibility, html, css) {
                var loader = new AnimateLoader();
                loader.addEventListener(LoaderEvents.COMPLETE, this.onServer, this);
                loader.addEventListener(LoaderEvents.FAILED, this.onServer, this);
                loader.load("/project/save-build", { projectId: this._id, buildId: this.mCurBuild._id, notes: notes, visibility: visibility, html: html, css: css });
            };
            /**
            * This function is used to save an array of behaviors to the DB
            * @param { Array<string>} behavioursIds This is the array behaviour ids we are saving.
            */
            Project.prototype.saveBehaviours = function (behavioursIds) {
                if (behavioursIds.length == 0)
                    return;
                var ids = [];
                var jsons = [];
                var behaviours = this._behaviours;
                // Create a multidimension array and pass each of the behaviours
                for (var i = 0, l = behavioursIds.length; i < l; i++)
                    for (var ii = 0, l = behaviours.length; ii < l; ii++)
                        if (behavioursIds[i] == behaviours[ii].id) {
                            var json = null;
                            var canvas = CanvasTab.getSingleton().getTabCanvas(behavioursIds[i]);
                            if (canvas)
                                json = canvas.buildDataObject();
                            else {
                                json = behaviours[ii].json;
                                json.properties = behaviours[ii]._properties.tokenize();
                            }
                            var jsonStr = json.toString();
                            ids.push(behaviours[ii].id);
                            jsons.push(jsonStr);
                        }
                var loader = new AnimateLoader();
                loader.addEventListener(LoaderEvents.COMPLETE, this.onServer, this);
                loader.addEventListener(LoaderEvents.FAILED, this.onServer, this);
                loader.load("/project/save-behaviours", { projectId: this._id, ids: ids, data: jsons });
            };
            /**
            * This function is used to save the behaviors, groups and _assets or the DB
            */
            Project.prototype.saveAll = function () {
                // Behaviours
                var ids = [];
                var behaviours = this._behaviours;
                for (var i = 0, l = behaviours.length; i < l; i++)
                    if (!behaviours[i].saved)
                        ids.push(behaviours[i].id);
                this.saveBehaviours(ids);
                // Assets
                ids.splice(0, ids.length);
                var assets = this._assets;
                for (var i = 0, l = assets.length; i < l; i++)
                    if (!assets[i].saved)
                        ids.push(assets[i].id);
                this.saveAssets(ids);
                // Groups
                ids.splice(0, ids.length);
                var groups = TreeViewScene.getSingleton().getGroups();
                for (var i = 0, l = groups.length; i < l; i++)
                    if (!groups[i].saved)
                        ids.push(groups[i].groupID);
                this.saveGroups(ids);
                // TODO - save 
                Animate.CanvasTab.getSingleton().saveAll();
                this.saveHTML();
                this.saveCSS();
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
                        this.dispatchEvent(new ProjectEvent(ProjectEvents.FAILED, "A behaviour with that name already exists.", LoaderEvents.FAILED));
                        return;
                    }
                var loader = new AnimateLoader();
                loader.addEventListener(LoaderEvents.COMPLETE, this.onServer, this);
                loader.addEventListener(LoaderEvents.FAILED, this.onServer, this);
                loader.load("/project/create-behaviour", { projectId: this._id, name: name, shallowId: BehaviourContainer.getNewLocalId() });
            };
            /**
            * Saves the HTML from the HTML tab to the server
            */
            Project.prototype.saveHTML = function () {
                var html = (HTMLTab.singleton ? HTMLTab.singleton.editor.getValue() : this.mCurBuild.html);
                var loader = new AnimateLoader();
                this.mCurBuild.html = html;
                loader.addEventListener(LoaderEvents.COMPLETE, this.onServer, this);
                loader.addEventListener(LoaderEvents.FAILED, this.onServer, this);
                loader.load("/project/save-html", { projectId: this._id, html: html });
            };
            /**
            * Saves the HTML from the HTML tab to the server
            */
            Project.prototype.saveCSS = function () {
                var css = (CSSTab.singleton ? CSSTab.singleton.editor.getValue() : this.mCurBuild.css);
                var loader = new AnimateLoader();
                this.mCurBuild.css = css;
                loader.addEventListener(LoaderEvents.COMPLETE, this.onServer, this);
                loader.addEventListener(LoaderEvents.FAILED, this.onServer, this);
                loader.load("/project/save-css", { projectId: this._id, css: css });
            };
            /**
            * This function is used to delete behaviours.
            * @param {Array<string>} behavioursIds The behaviour Ids we need to delete
            */
            Project.prototype.deleteBehaviours = function (behavioursIds) {
                var ids = [];
                //Create a multidimension array and pass each of the _behaviours
                for (var i = 0, l = behavioursIds.length; i < l; i++)
                    ids.push(behavioursIds[i]);
                var loader = new AnimateLoader();
                loader.addEventListener(LoaderEvents.COMPLETE, this.onServer, this);
                loader.addEventListener(LoaderEvents.FAILED, this.onServer, this);
                loader.load("/project/delete-behaviours", { projectId: this._id, ids: ids });
            };
            /**
            * This function is used to fetch the _files associated with a project.
            * @param {string} mode Which files to fetch - this can be either 'global', 'project' or 'user'
            */
            Project.prototype.loadFiles = function (mode) {
                if (mode === void 0) { mode = "project"; }
                var loader = new AnimateLoader();
                loader.addEventListener(LoaderEvents.COMPLETE, this.onServer, this);
                loader.addEventListener(LoaderEvents.FAILED, this.onServer, this);
                loader.load("/project/get-files", { projectId: this._id, mode: mode });
            };
            /**
            * This function is used to import a user's file from another project or from the global _assets base
            */
            Project.prototype.importFile = function (ids) {
                var loader = new AnimateLoader();
                loader.addEventListener(LoaderEvents.COMPLETE, this.onServer, this);
                loader.addEventListener(LoaderEvents.FAILED, this.onServer, this);
                loader.load("/project/import-files", { projectId: this._id, ids: ids, });
            };
            /**
            * This function is used to delete files from a project and the database. The file asset will
            * not be deleted if another project has a reference to it. The reference of this project to the file will be
            * removed either way.
            * @param {Array<string>} ids An array of file IDs to delete
            */
            Project.prototype.deleteFiles = function (ids) {
                var loader = new AnimateLoader();
                loader.addEventListener(LoaderEvents.COMPLETE, this.onServer, this);
                loader.addEventListener(LoaderEvents.FAILED, this.onServer, this);
                loader.load("/project/delete-files", { projectId: this._id, ids: ids, });
            };
            /**
            * Use this function to create an empty data file for the user
            * @param {string} name The name of file we are creating. Please note this is not a file name.
            */
            Project.prototype.createEmptyFile = function (name) {
                var loader = new AnimateLoader();
                loader.addEventListener(LoaderEvents.COMPLETE, this.onServer, this);
                loader.addEventListener(LoaderEvents.FAILED, this.onServer, this);
                loader.load("/file/create-empty-file", { projectId: this._id, name: name });
            };
            /**
            * Fills a data file with the contents of an XHR request
            * See https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Sending_and_Receiving_Binary_Data
            * @param {string} id The id of the file we are
            * @param {ArrayBufferView} view The data to fill the file with
            */
            Project.prototype.fillFile = function (id, view) {
                var loader = new AnimateLoader();
                loader.addEventListener(LoaderEvents.COMPLETE, this.onServer, this);
                loader.addEventListener(LoaderEvents.FAILED, this.onServer, this);
                loader.contentType = "application/octet-stream";
                loader.processData = false;
                loader.getVariables = { id: id, projectId: this._id };
                loader.load("/file/fill-file", view);
            };
            /**
            * Use this function to update file properties
            * @param {string} fileId The file we are updating
            * @param {string} name The new name of the file.
            * @param {Array<string>} tags The new comma separated tags of the file.
            * @param {bool} favourite If this file is a favourite
            * @param {bool} global True or false if this file is shared globally
            */
            Project.prototype.saveFile = function (fileId, name, tags, favourite, global) {
                var loader = new AnimateLoader();
                loader.addEventListener(LoaderEvents.COMPLETE, this.onServer, this);
                loader.addEventListener(LoaderEvents.FAILED, this.onServer, this);
                loader.load("/project/save-file", { projectId: this._id, fileId: fileId, name: name, tags: tags, favourite: favourite, global: global });
            };
            /**
            * This function is used to fetch the beaviours of a project.
            */
            Project.prototype.loadBehaviours = function () {
                var loader = new AnimateLoader();
                loader.addEventListener(LoaderEvents.COMPLETE, this.onServer, this);
                loader.addEventListener(LoaderEvents.FAILED, this.onServer, this);
                loader.load("/project/get-behaviours", { projectId: this._id });
            };
            /**
            * This function is used to create a new group. This will make
            * a call the server. If the server sends a fail message then no new group
            * will be created. You can use the event GROUP_CREATED to hook into
            * a successful DB entry created.
            * @param {string} name The proposed name of the group.
            */
            Project.prototype.createGroup = function (name) {
                var loader = new AnimateLoader();
                loader.addEventListener(LoaderEvents.COMPLETE, this.onServer, this);
                loader.addEventListener(LoaderEvents.FAILED, this.onServer, this);
                loader.load("/project/create-group", { projectId: this._id, name: name });
            };
            /**
            * This function is used to fetch the groups of a project.
            */
            Project.prototype.loadGroups = function () {
                var loader = new AnimateLoader();
                loader.addEventListener(LoaderEvents.COMPLETE, this.onServer, this);
                loader.addEventListener(LoaderEvents.FAILED, this.onServer, this);
                loader.load("/project/get-groups", { projectId: this._id });
            };
            /**
            * This will save the current state of the groups to the server
            * @param {Array<string>} groupIds The array of group ID's we are trying to save.
            */
            Project.prototype.saveGroups = function (groupIds) {
                if (groupIds.length == 0)
                    return;
                var group = null;
                var ids = [];
                var jsons = [];
                for (var i = 0, l = groupIds.length; i < l; i++) {
                    group = TreeViewScene.getSingleton().getGroupByID(groupIds[i]);
                    jsons.push(JSON.stringify(group.json));
                    ids.push(group.groupID);
                }
                var loader = new AnimateLoader();
                loader.addEventListener(LoaderEvents.COMPLETE, this.onServer, this);
                loader.addEventListener(LoaderEvents.FAILED, this.onServer, this);
                loader.load("/project/save-groups", { projectId: this._id, ids: ids, data: jsons });
            };
            /**
            * Deletes groups from the project
            * @param {Array<string>} groupIds The array of group IDs to delete
            */
            Project.prototype.deleteGroups = function (groupIds) {
                var loader = new AnimateLoader();
                loader.addEventListener(LoaderEvents.COMPLETE, this.onServer, this);
                loader.addEventListener(LoaderEvents.FAILED, this.onServer, this);
                loader.load("/project/delete-groups", { projectId: this._id, ids: groupIds });
            };
            /**
            * This will download all group variables from the server. If successful, the function will also get
            * the asset treeview to update its contents
            * @param {Array<string>} groupIds  groupIds The array of group IDs to update
            */
            Project.prototype.updateGroups = function (groupIds) {
                var loader = new AnimateLoader();
                loader.addEventListener(LoaderEvents.COMPLETE, this.onServer, this);
                loader.addEventListener(LoaderEvents.FAILED, this.onServer, this);
                loader.load("/project/update-groups", { projectId: this._id, ids: groupIds });
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
                var loader = new AnimateLoader();
                loader.addEventListener(LoaderEvents.COMPLETE, this.onServer, this);
                loader.addEventListener(LoaderEvents.FAILED, this.onServer, this);
                loader.load("/project/create-asset", { projectId: this._id, name: name, className: className, shallowId: Asset.getNewLocalId() });
            };
            /**
            * This will save a group of asset's variables to the server in JSON.
            * @param {Array<string>} assetIds An array of asset ids of the assets we want to save
            */
            Project.prototype.saveAssets = function (assetIds) {
                if (assetIds.length == 0)
                    return;
                var pm = PluginManager.getSingleton();
                var ev = new AssetEvent(EditorEvents.ASSET_SAVING, null);
                var asset = null;
                var ids = [];
                var shallowIds = [];
                var jsons = [];
                for (var i = 0, l = assetIds.length; i < l; i++) {
                    asset = this.getAssetByID(assetIds[i]);
                    // Tell plugins about asset saving
                    ev.asset = asset;
                    pm.dispatchEvent(ev);
                    jsons.push(JSON.stringify(asset.properties.tokenize()));
                    ids.push(asset.id);
                    shallowIds.push(asset.shallowId);
                }
                var loader = new AnimateLoader();
                loader.addEventListener(LoaderEvents.COMPLETE, this.onServer, this);
                loader.addEventListener(LoaderEvents.FAILED, this.onServer, this);
                loader.load("/project/save-assets", { projectId: this._id, ids: ids, data: jsons });
            };
            /**
            * This will download an asset's variables from the server.
            * @param {Array<string>} assetIds An array of assets we are updating
            */
            Project.prototype.updateAssets = function (assetIds) {
                var loader = new AnimateLoader();
                loader.addEventListener(LoaderEvents.COMPLETE, this.onServer, this);
                loader.addEventListener(LoaderEvents.FAILED, this.onServer, this);
                loader.load("/project/update-assets", { projectId: this._id, ids: assetIds });
            };
            /**
            * This will download all asset variables from the server.
            * @param {Array<string>} behaviourIDs An array of behaviour ID's that need to be updated
            */
            Project.prototype.updateBehaviours = function (behaviourIDs) {
                var loader = new AnimateLoader();
                loader.addEventListener(LoaderEvents.COMPLETE, this.onServer, this);
                loader.addEventListener(LoaderEvents.FAILED, this.onServer, this);
                loader.load("/project/update-behaviours", { projectId: this._id, ids: behaviourIDs });
            };
            /**
            * This function is used to copy an asset.
            * @param {string} assetId The asset object we are trying to copy
            */
            Project.prototype.copyAsset = function (assetId) {
                var loader = new AnimateLoader();
                loader.addEventListener(LoaderEvents.COMPLETE, this.onServer, this);
                loader.addEventListener(LoaderEvents.FAILED, this.onServer, this);
                loader.load("/project/copy-asset", { projectId: this._id, assetId: assetId, shallowId: Asset.getNewLocalId() });
            };
            /**
            * This function is used to delete assets.
            * @param {Array<string>} assetIDs The asset objects we are trying to delete
            */
            Project.prototype.deleteAssets = function (assetIDs) {
                var loader = new AnimateLoader();
                loader.addEventListener(LoaderEvents.COMPLETE, this.onServer, this);
                loader.addEventListener(LoaderEvents.FAILED, this.onServer, this);
                loader.load("/project/delete-assets", { projectId: this._id, ids: assetIDs });
            };
            /**
            * This function is used to fetch the _assets of a project.
            */
            Project.prototype.loadAssets = function () {
                var loader = new AnimateLoader();
                loader.addEventListener(LoaderEvents.COMPLETE, this.onServer, this);
                loader.addEventListener(LoaderEvents.FAILED, this.onServer, this);
                loader.load("/project/get-assets", { projectId: this._id });
            };
            /**
            * Loads the project from data sent from the server
            * @param {any} data The data sent from the server
            */
            Project.prototype.loadFromData = function (data) {
                this.mSaved = true;
                this.buildId = data.project.buildId;
                this.created = data.project.createdOn;
                this.lastModified = data.project.lastModified;
                this.mName = data.project.name;
                this.mRating = data.project.rating;
                this.mCategory = data.project.category;
                this.mSubCategory = data.project.sub_category;
                this.mImgPath = data.project.image;
                this.mVisibility = data.project.visibility;
                var pluginIds = data.project.plugins;
                if (!pluginIds)
                    this._plugins = [];
                else {
                    this._plugins = [];
                    var i = __plugins.length;
                    while (i--) {
                        var ii = pluginIds.length;
                        while (ii--)
                            if (pluginIds[ii] == __plugins[i]._id) {
                                this._plugins.push(__plugins[i]);
                                break;
                            }
                    }
                }
                this.mCurBuild = data.build;
                this.mDescription = data.project.description;
                this.mTags = data.project.tags;
            };
            /**
            * This function is called whenever we get a resonse from the server
            */
            Project.prototype.onServer = function (response, event, sender) {
                var data = event.tag;
                var pManager = PluginManager.getSingleton();
                var dispatchEvent;
                var loader = sender;
                if (response == LoaderEvents.COMPLETE) {
                    if (event.return_type == AnimateLoaderResponses.SUCCESS) {
                        //Sets the current build
                        if (loader.url == "/project/select-build") {
                            this.mCurBuild = data.build;
                            this.dispatchEvent(new ProjectEvent(ProjectEvents.BUILD_SELECTED, data.message, LoaderEvents.fromString(data.return_type), this.mCurBuild));
                        }
                        else if (loader.url == "/project/save-build") {
                            //this.mCurBuild = data.build;
                            this.dispatchEvent(new ProjectEvent(ProjectEvents.BUILD_SAVED, "Build saved", LoaderEvents.fromString(data.return_type), this.mCurBuild));
                        }
                        else if (loader.url == "/project/delete-behaviours") {
                            //Update behaviours ids which we fetched from the DB.
                            for (var i = 0, l = data.length; i < l; i++) {
                                var len = this._behaviours.length;
                                for (var ii = 0; ii < len; ii++)
                                    if (this._behaviours[ii].id == data[i]) {
                                        var behaviour = this._behaviours[ii];
                                        behaviour.dispose();
                                        this._behaviours.splice(ii, 1);
                                        this.dispatchEvent(new ProjectEvent(ProjectEvents.BEHAVIOUR_DELETING, "Deleting Behaviour", LoaderEvents.COMPLETE, behaviour));
                                        break;
                                    }
                            }
                        }
                        else if (loader.url == "/project/create-behaviour") {
                            var behaviour = new BehaviourContainer(data.name, data.id, data.shallowId);
                            this._behaviours.push(behaviour);
                            //Create the GUI elements
                            var node = TreeViewScene.getSingleton().addContainer(behaviour);
                            node.save(false);
                            var tabPair = CanvasTab.getSingleton().addSpecialTab(behaviour.name, CanvasTabType.CANVAS, behaviour);
                            jQuery(".text", tabPair.tabSelector.element).text(node.element.text());
                            tabPair.name = node.element.text();
                            this.dispatchEvent(new ProjectEvent(ProjectEvents.BEHAVIOUR_CREATED, "Behaviour created", LoaderEvents.COMPLETE, behaviour));
                        }
                        else if (loader.url == "/project/get-behaviours") {
                            //Cleanup behaviourssaveAll
                            for (var i = 0; i < this._behaviours.length; i++)
                                this._behaviours[i].dispose();
                            this._behaviours.splice(0, this._behaviours.length);
                            //Create new behaviours which we fetched from the DB.
                            for (var i = 0, l = data.length; i < l; i++) {
                                var dbEntry = data[i];
                                var b = new BehaviourContainer(dbEntry["name"], dbEntry["_id"], dbEntry["shallowId"]);
                                b.json = CanvasToken.fromDatabase(dbEntry["json"], dbEntry["_id"]);
                                b.setProperties(dbEntry.json.properties);
                                this._behaviours.push(b);
                                //Create the GUI elements
                                TreeViewScene.getSingleton().addContainer(b);
                                //Update the GUI elements
                                TreeViewScene.getSingleton().updateBehaviour(b);
                                this.dispatchEvent(new ProjectEvent(ProjectEvents.BEHAVIOUR_UPDATED, "Behaviour updated", LoaderEvents.COMPLETE, b));
                            }
                            this.dispatchEvent(new ProjectEvent(ProjectEvents.BEHAVIOURS_LOADED, "Behaviours loaded", LoaderEvents.COMPLETE, null));
                        }
                        else if (loader.url == "/project/save-behaviours") {
                            for (var i = 0; i < this._behaviours.length; i++)
                                for (ii = 0, l = data.length; ii < l; ii++)
                                    if (this._behaviours[i].id == data[ii]) {
                                        // Make sure the JSON is updated in the behaviour
                                        var canvas = CanvasTab.getSingleton().getTabCanvas(data[ii]);
                                        if (canvas)
                                            this._behaviours[i].json = canvas.buildDataObject();
                                        this.dispatchEvent(new ProjectEvent(ProjectEvents.BEHAVIOUR_SAVED, "Behaviour saved", LoaderEvents.COMPLETE, this._behaviours[i]));
                                        break;
                                    }
                            this.dispatchEvent(new ProjectEvent(ProjectEvents.BEHAVIOURS_SAVED, "Behaviours saved", LoaderEvents.COMPLETE, null));
                        }
                        else if (loader.url == "/project/save-html") {
                            this.dispatchEvent(new ProjectEvent(ProjectEvents.HTML_SAVED, "HTML saved", LoaderEvents.fromString(data.return_type), this.mCurBuild));
                            if (HTMLTab.singleton)
                                HTMLTab.singleton.save();
                        }
                        else if (loader.url == "/project/save-css") {
                            this.dispatchEvent(new ProjectEvent(ProjectEvents.CSS_SAVED, "CSS saved", LoaderEvents.fromString(data.return_type), this.mCurBuild));
                            if (CSSTab.singleton)
                                CSSTab.singleton.save();
                        }
                        else if (loader.url == "/project/delete-assets") {
                            dispatchEvent = new AssetEvent(EditorEvents.ASSET_DESTROYED, null);
                            var ev = new AssetEvent(ProjectEvents.ASSET_DELETING, null);
                            for (var i = 0, l = data.length; i < l; i++) {
                                var len = this._assets.length;
                                for (var ii = 0; ii < len; ii++)
                                    if (this._assets[ii].id == data[i]) {
                                        ev.asset = this._assets[ii];
                                        this.dispatchEvent(ev);
                                        //Notify the destruction of an asset
                                        dispatchEvent.asset = this._assets[ii];
                                        pManager.dispatchEvent(dispatchEvent);
                                        this._assets[ii].dispose();
                                        this._assets.splice(ii, 1);
                                        break;
                                    }
                            }
                        }
                        else if (loader.url == "/project/get-files") {
                            var i = this._files.length;
                            while (i--)
                                this._files[i].dispose();
                            this._files.splice(0, this._files.length);
                            //Create each of the files
                            for (var i = 0, l = data.length; i < l; i++) {
                                var dbEntry = data[i];
                                var file = new File(dbEntry["name"], dbEntry["url"], dbEntry["tags"], dbEntry["_id"], dbEntry["createdOn"], dbEntry["lastModified"], dbEntry["size"], dbEntry["favourite"], dbEntry["previewUrl"], dbEntry["global"]);
                                this._files.push(file);
                                this.dispatchEvent(new ProjectEvent(ProjectEvents.FILE_CREATED, "File created", LoaderEvents.COMPLETE, file));
                            }
                            this.dispatchEvent(new ProjectEvent(ProjectEvents.FILES_CREATED, "Files created", LoaderEvents.COMPLETE, this));
                            this.dispatchEvent(new ProjectEvent(ProjectEvents.FILES_LOADED, "Files loaded", LoaderEvents.COMPLETE, this));
                        }
                        else if (loader.url == "/project/import-files") {
                            //Create new _assets which we fetched from the DB.
                            this.dispatchEvent(new ProjectEvent(ProjectEvents.FILE_CREATED, event.message, LoaderEvents.COMPLETE, file));
                            this.dispatchEvent(new ProjectEvent(ProjectEvents.FILE_IMPORTED, event.message, LoaderEvents.COMPLETE, file));
                        }
                        else if (loader.url == "/project/delete-files") {
                            for (var ii = 0, l = data.length; ii < l; ii++)
                                for (var i = 0, len = this._files.length; i < len; i++)
                                    if (this._files[i].id == data[ii]) {
                                        this._files[i].dispose();
                                        this.dispatchEvent(new ProjectEvent(ProjectEvents.FILE_DELETED, "File deleted", LoaderEvents.COMPLETE, this._files[i]));
                                        this._files.splice(i, 1);
                                        break;
                                    }
                            this.dispatchEvent(new ProjectEvent(ProjectEvents.FILES_DELETED, "Files deleted", LoaderEvents.COMPLETE, data));
                        }
                        else if (loader.url == "/file/create-empty-file") {
                            var file = new File(data["name"], data["url"], [], data["_id"], data["createdOn"], data["lastModified"], 0, false, data["previewUrl"], false);
                            this.dispatchEvent(new ProjectEvent(ProjectEvents.FILE_CREATED, "File created", LoaderEvents.COMPLETE, file));
                        }
                        else if (loader.url == "/file/fill-file") {
                            for (var i = 0, len = this._files.length; i < len; i++)
                                if (this._files[i].id == data.id) {
                                    this.dispatchEvent(new ProjectEvent(ProjectEvents.FILE_UPDATED, "File updated", LoaderEvents.COMPLETE, this._files[i]));
                                    return;
                                }
                        }
                        else if (loader.url == "/project/save-file") {
                            for (var i = 0, len = this._files.length; i < len; i++)
                                if (this._files[i].id == data._id) {
                                    this._files[i].name = data.name;
                                    this._files[i].tags = data.tags;
                                    this._files[i].lastModified = data.lastModified;
                                    this._files[i].favourite = data.favourite;
                                    this._files[i].global = data.global;
                                    if (loader.url == "/project/save-file")
                                        this.dispatchEvent(new ProjectEvent(ProjectEvents.FILE_UPDATED, "File updated", LoaderEvents.COMPLETE, this._files[i]));
                                    else
                                        this.dispatchEvent(new ProjectEvent(ProjectEvents.FILE_IMAGE_UPDATED, "File image updated", LoaderEvents.COMPLETE, this._files[i]));
                                    return;
                                }
                        }
                        else if (loader.url == "/project/create-group")
                            this.dispatchEvent(new ProjectEvent(ProjectEvents.GROUP_CREATED, "Group created", LoaderEvents.COMPLETE, { id: data._id, name: data.name, json: data.json }));
                        else if (loader.url == "/project/get-groups") {
                            //Create new _assets which we fetched from the DB.
                            for (var i = 0, l = data.length; i < l; i++) {
                                var dbEntry = data[i];
                                this.dispatchEvent(new ProjectEvent(ProjectEvents.GROUP_CREATED, "Group created", LoaderEvents.COMPLETE, { id: dbEntry["_id"], name: dbEntry["name"], json: dbEntry["json"] }));
                            }
                            this.dispatchEvent(new ProjectEvent(ProjectEvents.GROUPS_LOADED, "Groups loaded", LoaderEvents.COMPLETE, this));
                        }
                        else if (loader.url == "/project/delete-groups") {
                            for (var i = 0, l = data.length; i < l; i++) {
                                var grpID = data[i];
                                this.dispatchEvent(new ProjectEvent(ProjectEvents.GROUP_DELETING, "Group deleting", LoaderEvents.COMPLETE, grpID));
                            }
                        }
                        else if (loader.url == "/project/update-groups") {
                            //Update _assets which we fetched from the DB.
                            for (var i = 0, l = data.length; i < l; i++) {
                                var grp = data[i];
                                this.dispatchEvent(new ProjectEvent(ProjectEvents.GROUP_UPDATED, "Group updated", LoaderEvents.COMPLETE, grp));
                            }
                            this.dispatchEvent(new ProjectEvent(ProjectEvents.GROUPS_UPDATED, "Groups updated", null));
                        }
                        else if (loader.url == "/project/save-groups") {
                            for (var i = 0, l = data.length; i < l; i++)
                                this.dispatchEvent(new ProjectEvent(ProjectEvents.GROUP_SAVED, "Group saved", LoaderEvents.COMPLETE, data[i]));
                            this.dispatchEvent(new ProjectEvent(ProjectEvents.GROUPS_SAVED, "Groups saved", LoaderEvents.COMPLETE, null));
                        }
                        else if (loader.url == "/project/create-asset" || loader.url == "/project/copy-asset") {
                            var asset = new Asset(data.name, data.className, data.json, data._id, data.shallowId);
                            this._assets.push(asset);
                            //Create the GUI elements
                            TreeViewScene.getSingleton().addAssetInstance(asset, false);
                            //Notify the creation of an asset
                            pManager.assetCreated(asset.name, asset);
                            //Now that the asset is loaded we notify the plugins of each of its variables incase they need to initialize / set something.						
                            var eSet = asset.properties;
                            var variables = eSet.variables;
                            for (var ii = 0, len = variables.length; ii < len; ii++)
                                pManager.assetEdited(asset, variables[ii].name, variables[ii].value, variables[ii].value, variables[ii].type);
                            //pManager.assetLoaded( asset );
                            pManager.dispatchEvent(new AssetEvent(EditorEvents.ASSET_LOADED, asset));
                            this.dispatchEvent(new ProjectEvent(ProjectEvents.ASSET_CREATED, "Asset created", LoaderEvents.COMPLETE, asset));
                        }
                        else if (loader.url == "/project/save-assets") {
                            for (var ii = 0; ii < data.length; ii++)
                                for (var i = 0; i < this._assets.length; i++)
                                    if (this._assets[i].id == data[ii])
                                        this.dispatchEvent(new AssetEvent(ProjectEvents.ASSET_SAVED, this._assets[i]));
                            this.dispatchEvent(new ProjectEvent(ProjectEvents.ASSET_SAVED, "Asset saved", LoaderEvents.COMPLETE, null));
                        }
                        else if (loader.url == "/project/update-assets") {
                            for (var ii = 0; ii < data.length; ii++)
                                for (var i = 0; i < this._assets.length; i++)
                                    if (this._assets[i].id == data[ii]._id) {
                                        this._assets[i].update(data[ii].name, data[ii].className, data[ii].json);
                                        this.dispatchEvent(new AssetEvent(ProjectEvents.ASSET_UPDATED, this._assets[i]));
                                    }
                            this.dispatchEvent(new ProjectEvent(ProjectEvents.ASSET_SAVED, "Asset saved", LoaderEvents.COMPLETE, null));
                        }
                        else if (loader.url == "/project/update-behaviours") {
                            //Update behaviours which we fetched from the DB.
                            for (var ii = 0, l = data.length; ii < l; ii++) {
                                for (var i = 0, len = this._behaviours.length; i < len; i++)
                                    if (this._behaviours[i].id == data[ii]._id) {
                                        this._behaviours[i].update(data[ii].name, CanvasToken.fromDatabase(data[ii].json, data[ii]._id));
                                        //Update the GUI elements
                                        TreeViewScene.getSingleton().updateBehaviour(this._behaviours[i]);
                                        this.dispatchEvent(new ProjectEvent(ProjectEvents.BEHAVIOUR_UPDATED, "Behaviour updated", LoaderEvents.COMPLETE, this._behaviours[i]));
                                        break;
                                    }
                            }
                            this.dispatchEvent(new ProjectEvent(ProjectEvents.BEHAVIOURS_UPDATED, "Behaviours updated", LoaderEvents.COMPLETE, null));
                        }
                        else if (loader.url == "/project/get-assets") {
                            //Cleanup _assets
                            for (var i = 0; i < this._assets.length; i++)
                                this._assets[i].dispose();
                            this._assets.splice(0, this._assets.length);
                            //Create new _assets which we fetched from the DB.
                            for (var i = 0, l = data.length; i < l; i++) {
                                var dbEntry = data[i];
                                var asset = new Asset(dbEntry["name"], dbEntry["className"], dbEntry["json"], dbEntry["_id"], dbEntry["shallowId"]);
                                //Create the GUI elements
                                if (TreeViewScene.getSingleton().addAssetInstance(asset))
                                    this._assets.push(asset);
                                else
                                    asset.dispose();
                            }
                            //Notify the creation of an asset
                            var len = this._assets.length;
                            for (var i = 0; i < len; i++)
                                pManager.assetCreated(this._assets[i].name, this._assets[i]);
                            //Now that the asset is loaded we notify the plugins of each of its variables incase they need to initialize / set something.
                            for (var i = 0; i < len; i++) {
                                var eSet = this._assets[i].properties;
                                var variables = eSet.variables;
                                for (var ii = 0, len2 = variables.length; ii < len2; ii++)
                                    pManager.assetEdited(this._assets[i], variables[ii].name, variables[ii].value, variables[ii].value, variables[ii].type);
                            }
                            var eventCreated = new AssetEvent(EditorEvents.ASSET_CREATED, null);
                            for (var i = 0; i < len; i++) {
                                //pManager.assetLoaded( this._assets[i] );
                                eventCreated.asset = this._assets[i];
                                pManager.dispatchEvent(eventCreated);
                            }
                            this.dispatchEvent(new ProjectEvent(ProjectEvents.ASSETS_LOADED, "Assets loaded", LoaderEvents.COMPLETE, this));
                        }
                        else if (loader.url == "/project/rename-object") {
                            var obj = null;
                            var dataType = ProjectAssetTypes.fromString(data.type);
                            if (dataType.toString() == ProjectAssetTypes.BEHAVIOUR.toString()) {
                                var len = this._behaviours.length;
                                for (var i = 0; i < len; i++)
                                    if (data.id == this._behaviours[i].id) {
                                        obj = this._behaviours[i];
                                        break;
                                    }
                            }
                            else if (dataType.toString() == ProjectAssetTypes.ASSET.toString()) {
                                var len = this._assets.length;
                                for (var i = 0; i < len; i++)
                                    if (data.id == this._assets[i].id) {
                                        obj = this._assets[i];
                                        break;
                                    }
                            }
                            else
                                obj = TreeViewScene.getSingleton().getGroupByID(data.id);
                            //Send event
                            this.dispatchEvent(new ProjectEvent(ProjectEvents.OBJECT_RENAMED, "Object Renamed", LoaderEvents.COMPLETE, { object: obj, type: data.type, name: data.name, id: data.id }));
                        }
                    }
                    else {
                        MessageBox.show(event.message, Array("Ok"), null, null);
                        this.dispatchEvent(new ProjectEvent(ProjectEvents.FAILED, event.message, data));
                    }
                }
                else
                    this.dispatchEvent(new ProjectEvent(ProjectEvents.FAILED, "Could not connec to the server.", LoaderEvents.FAILED, null));
            };
            Object.defineProperty(Project.prototype, "behaviours", {
                get: function () { return this._behaviours; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Project.prototype, "files", {
                get: function () { return this._files; },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Project.prototype, "assets", {
                get: function () { return this._assets; },
                enumerable: true,
                configurable: true
            });
            /**
            * This will cleanup the project and remove all data associated with it.
            */
            Project.prototype.dispose = function () {
                var pManager = PluginManager.getSingleton();
                var event;
                //Cleanup behaviours
                var i = this._behaviours.length;
                while (i--) {
                    this.dispatchEvent(new ProjectEvent(ProjectEvents.BEHAVIOUR_DELETING, "Behaviour deleting", LoaderEvents.COMPLETE, this._behaviours[i]));
                    this._behaviours[i].dispose();
                }
                i = this._assets.length;
                event = new AssetEvent(EditorEvents.ASSET_DESTROYED, null);
                while (i--) {
                    event.asset = this._assets[i];
                    //Notify the destruction of an asset
                    pManager.dispatchEvent(event);
                    this._assets[i].dispose();
                }
                i = this._files.length;
                while (i--)
                    this._files[i].dispose();
                this._plugins = null;
                this.created = null;
                this.lastModified = null;
                this._id = null;
                this.mSaved = null;
                this.mName = null;
                this.mDescription = null;
                this._behaviours = null;
                this._assets = null;
                this.buildId = null;
                this._files = null;
                //Call super
                _super.dispose.call(this);
            };
            Object.defineProperty(Project.prototype, "plugins", {
                get: function () { return this._plugins; },
                enumerable: true,
                configurable: true
            });
            return Project;
        })(EventDispatcher);
        Animate.Project = Project;
    })(Animate || (Animate = {}));
});
