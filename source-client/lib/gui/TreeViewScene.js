var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Animate;
(function (Animate) {
    /**
    * An implementation of the tree view for the scene.
    */
    var TreeViewScene = (function (_super) {
        __extends(TreeViewScene, _super);
        function TreeViewScene(parent) {
            _super.call(this, parent);

            if (TreeViewScene._singleton != null)
                throw new Error("The TreeViewScene class is a singleton. You need to call the TreeViewScene.getSingleton() function.");

            TreeViewScene._singleton = this;

            this.element.addClass("treeview-scene");

            this._sceneNode = this.addNode(new Animate.TreeNode("Scene", "media/world_16.png"));
            this._assetsNode = this.addNode(new Animate.TreeNode("Assets", "media/wrench.png"));
            this._groupsNode = this.addNode(new Animate.TreeNode("Groups", "media/array.png"));
            this._pluginBehaviours = this.addNode(new Animate.TreeNode("Behaviours", "media/behavior_20.png"));

            this._sceneNode.canUpdate = true;
            this._groupsNode.canUpdate = true;

            //Create the context menu
            this._contextMenu = new Animate.ContextMenu(100);
            this._contextCopy = this._contextMenu.addItem("<img src='media/copy-small.png' />Copy<div class='fix'></div>");
            this._contextDel = this._contextMenu.addItem("<img src='media/cross.png' />Delete<div class='fix'></div>");
            this._contextAddInstance = this._contextMenu.addItem("<img src='media/portal.png' />Add Instance<div class='fix'></div>");
            this._contextSave = this._contextMenu.addItem("<img src='media/save-20.png' />Save<div class='fix'></div>");
            this._contextRefresh = this._contextMenu.addItem("<img src='media/refresh.png' />Update<div class='fix'></div>");
            this._contextAddGroup = this._contextMenu.addItem("<img src='media/array.png' />Add Group<div class='fix'></div>");

            this._contextMenu.addEventListener(Animate.ContextMenuEvents.ITEM_CLICKED, this.onContextSelect, this);

            jQuery(document).on("contextmenu", this.onContext.bind(this));
            jQuery(".selectable .text", this._sceneNode.element).addClass("top-node");
            jQuery(".selectable .text", this._assetsNode.element).addClass("top-node");
            jQuery(".selectable .text", this._groupsNode.element).addClass("top-node");
            jQuery(".selectable .text", this._pluginBehaviours.element).addClass("top-node");

            this._quickAdd = new Animate.Component("<div class='quick-button'><img src='media/portal.png'/></div>", this);
            this._quickCopy = new Animate.Component("<div class='quick-button'><img src='media/copy-small.png'/></div>", this);

            this._quickAdd.tooltip = "Add new instance";
            this._quickCopy.tooltip = "Copy instance";

            this._contextNode = null;
            this._shortcutProxy = this.onShortcutClick.bind(this);
            this._curProj = null;

            jQuery("body").on("keydown", this.onKeyDown.bind(this));
            this.element.on("dblclick", this.onDblClick.bind(this));
            this.element.on("mousemove", this.onMouseMove.bind(this));

            this._quickAdd.element.on("click", this._shortcutProxy);
            this._quickCopy.element.on("click", this._shortcutProxy);
            this._quickAdd.element.detach();
            this._quickCopy.element.detach();

            Animate.RenameForm.getSingleton().addEventListener(Animate.RenameFormEvents.OBJECT_RENAMING, this.onRenameCheck, this);
        }
        TreeViewScene.prototype.onShortcutClick = function (e) {
            var comp = jQuery(e.currentTarget).data("component");

            var node = comp.element.parent().parent().parent().data("component");
            this.selectedNode = node;
            this._contextNode = node;

            if (comp == this._quickAdd)
                this.onContextSelect(Animate.ContextMenuEvents.ITEM_CLICKED, new Animate.ContextMenuEvent(Animate.ContextMenuEvents.ITEM_CLICKED, "Add Instance"));
else
                this.onContextSelect(Animate.ContextMenuEvents.ITEM_CLICKED, new Animate.ContextMenuEvent(Animate.ContextMenuEvents.ITEM_CLICKED, "Copy"));
        };

        TreeViewScene.prototype.onMouseMove = function (e) {
            if (jQuery(e.target).hasClass("quick-button"))
                return;

            var node = jQuery(e.target).parent().data("component");
            this._quickAdd.element.detach();
            this._quickCopy.element.detach();

            if (node && node instanceof Animate.TreeNode) {
                if (node instanceof Animate.TreeNodeAssetInstance)
                    jQuery(".text:first", node.element).append(this._quickCopy.element);
else if (node instanceof Animate.TreeNodeAssetClass && !(node).assetClass.abstractClass)
                    jQuery(".text:first", node.element).append(this._quickAdd.element);
            }
        };

        /**
        * Called when the project is loaded and ready.
        */
        TreeViewScene.prototype.projectReady = function () {
            //Add all the asset nodes
            var assetTemplates = Animate.PluginManager.getSingleton().assetTemplates;
            var assetClass;

            var len = assetTemplates.length;
            for (var i = 0; i < len; i++)
                for (var ii = 0; ii < assetTemplates[i].classes.length; ii++) {
                    assetClass = assetTemplates[i].classes[ii];
                    var toRet = new Animate.TreeNodeAssetClass(assetClass, this);
                    this._assetsNode.addNode(toRet);
                }

            //this._projectDataProxy = this.onProjectResponse.bind( this );
            //this._assetDataProxy = this.onAssetResponse.bind( this );
            //this._behaviourDataProxy = this.onBehaviourResponse.bind( this );
            //this._groupDataProxy = this.onGroupResponse.bind( this );
            //this._renameDataProxy = this.onObjectRenamed.bind( this );
            this._curProj = Animate.User.getSingleton().project;
            this._curProj.addEventListener(Animate.ProjectEvents.BEHAVIOUR_SAVED, this.onBehaviourResponse, this);
            this._curProj.addEventListener(Animate.ProjectEvents.ASSET_SAVED, this.onAssetResponse, this);
            this._curProj.addEventListener(Animate.ProjectEvents.ASSET_UPDATED, this.onAssetResponse, this);
            this._curProj.addEventListener(Animate.ProjectEvents.BEHAVIOUR_DELETING, this.onProjectResponse, this);
            this._curProj.addEventListener(Animate.ProjectEvents.ASSET_DELETING, this.onAssetResponse, this);
            this._curProj.addEventListener(Animate.ProjectEvents.GROUP_CREATED, this.onGroupResponse, this);
            this._curProj.addEventListener(Animate.ProjectEvents.GROUP_UPDATED, this.onGroupResponse, this);
            this._curProj.addEventListener(Animate.ProjectEvents.GROUP_SAVED, this.onGroupResponse, this);
            this._curProj.addEventListener(Animate.ProjectEvents.GROUP_DELETING, this.onGroupResponse, this);
            this._curProj.addEventListener(Animate.ProjectEvents.OBJECT_RENAMED, this.onObjectRenamed, this);
        };

        /**
        * Called when the project is reset by either creating a new one or opening an older one.
        */
        TreeViewScene.prototype.projectReset = function () {
            if (this._curProj) {
                this._curProj.removeEventListener(Animate.ProjectEvents.BEHAVIOUR_SAVED, this.onBehaviourResponse, this);
                this._curProj.removeEventListener(Animate.ProjectEvents.ASSET_SAVED, this.onAssetResponse, this);
                this._curProj.removeEventListener(Animate.ProjectEvents.ASSET_UPDATED, this.onAssetResponse, this);
                this._curProj.removeEventListener(Animate.ProjectEvents.BEHAVIOUR_DELETING, this.onProjectResponse, this);
                this._curProj.removeEventListener(Animate.ProjectEvents.ASSET_DELETING, this.onAssetResponse, this);
                this._curProj.removeEventListener(Animate.ProjectEvents.GROUP_CREATED, this.onGroupResponse, this);
                this._curProj.removeEventListener(Animate.ProjectEvents.GROUP_UPDATED, this.onGroupResponse, this);
                this._curProj.removeEventListener(Animate.ProjectEvents.GROUP_SAVED, this.onGroupResponse, this);
                this._curProj.removeEventListener(Animate.ProjectEvents.GROUP_DELETING, this.onGroupResponse, this);
                this._curProj.removeEventListener(Animate.ProjectEvents.OBJECT_RENAMED, this.onObjectRenamed, this);
            }

            this.children[0].clear();
            this.children[1].clear();

            this._groupsNode.clear();
        };

        /**
        * Catch the key down events.
        * @param e The event passed by jQuery
        */
        TreeViewScene.prototype.onKeyDown = function (e) {
            if (Animate.Application.getInstance().focusObj != null && Animate.Application.getInstance().focusObj instanceof Animate.TreeNode) {
                if (jQuery(e.target).is("input") == false && e.keyCode == 113) {
                    if (this.selectedNode != null)
                        if (this.selectedNode instanceof Animate.TreeNodeGroup)
                            Animate.RenameForm.getSingleton().showForm(this.selectedNode, this.selectedNode.text);
else if (this.selectedNode instanceof Animate.TreeNodeBehaviour)
                            Animate.RenameForm.getSingleton().showForm((this.selectedNode).behaviour, this.selectedNode.text);
else if (this.selectedNode instanceof Animate.TreeNodeAssetInstance)
                            Animate.RenameForm.getSingleton().showForm((this.selectedNode).asset, this.selectedNode.text);
                }
            }
        };

        /**
        * Creates an asset node for the tree
        * @param {Asset} asset The asset to associate with the node
        */
        TreeViewScene.prototype.addAssetInstance = function (asset, collapse) {
            if (typeof collapse === "undefined") { collapse = true; }
            //Add all the asset nodes
            var classNode = this.findNode("className", asset.className);

            if (classNode != null) {
                var instanceNode = new Animate.TreeNodeAssetInstance(classNode.assetClass, asset);
                classNode.addNode(instanceNode, collapse);

                instanceNode.element.draggable({ opacity: 0.7, helper: "clone", appendTo: "body", containment: "body" });

                return true;
            }

            return false;
        };

        /**
        * Update the asset node so that its saved.
        * @param {Asset} asset The asset to associate with the node
        */
        TreeViewScene.prototype.updateAssetInstance = function (asset) {
            var node = this.findNode("asset", asset);
            if (node != null)
                node.save();
        };

        /**
        * Update the behaviour node so that its saved and if any tabs are open they need to re-loaded.
        * @param {BehaviourContainer} behaviour The hehaviour object we need to update
        */
        TreeViewScene.prototype.updateBehaviour = function (behaviour) {
            var node = this.findNode("behaviour", behaviour);
            node.behaviour = behaviour;
            if (node != null) {
                //First we try and get the tab
                var tabPair = Animate.CanvasTab.getSingleton().getTab(behaviour.name);

                if (tabPair == null)
                    tabPair = Animate.CanvasTab.getSingleton().getTab("*" + behaviour.name);

                if (tabPair) {
                    tabPair.tabSelector.element.trigger("click");
                    var canvas = (tabPair).canvas;
                    canvas.behaviourContainer = behaviour;
                    Animate.CanvasTab.getSingleton().selectTab(tabPair);
                    canvas.openFromDataObject();
                    canvas.checkDimensions();
                }

                node.save(true);
            }
        };

        /**
        * Called when we select a menu item.
        */
        TreeViewScene.prototype.onContextSelect = function (response, event, sender) {
            if (this._contextNode && event.text == "Delete") {
                this._quickAdd.element.detach();
                this._quickCopy.element.detach();

                if (this._contextNode instanceof Animate.TreeNodeBehaviour) {
                    var selectedNodes = [];
                    var i = this.selectedNodes.length;
                    while (i--)
                        selectedNodes.push(this.selectedNodes[i]);

                    var behaviours = [];
                    i = selectedNodes.length;
                    while (i--)
                        behaviours.push(selectedNodes[i].behaviour.id);

                    Animate.User.getSingleton().project.deleteBehaviours(behaviours);
                } else if (this._contextNode instanceof Animate.TreeNodeAssetInstance) {
                    var selectedNodes = [];
                    var i = this.selectedNodes.length;
                    while (i--)
                        selectedNodes.push(this.selectedNodes[i]);

                    var assets = [];
                    i = selectedNodes.length;
                    while (i--)
                        assets.push(selectedNodes[i].asset.id);

                    Animate.User.getSingleton().project.deleteAssets(assets);
                } else if (this._contextNode instanceof Animate.TreeNodeGroup) {
                    var selectedNodes = [];
                    var i = this.selectedNodes.length;
                    while (i--)
                        selectedNodes.push(this.selectedNodes[i]);

                    var groups = [];
                    i = selectedNodes.length;
                    while (i--)
                        groups.push(selectedNodes[i].groupID);

                    Animate.User.getSingleton().project.deleteGroups(groups);
                } else if (this._contextNode instanceof Animate.TreeNodeGroupInstance)
                    this._contextNode.dispose();
            }

            if (this._contextNode && event.text == "Copy") {
                if (this._contextNode instanceof Animate.TreeNodeAssetInstance)
                    Animate.User.getSingleton().project.copyAsset((this._contextNode).asset);
            } else if (this._contextNode && event.text == "Add Instance")
                Animate.User.getSingleton().project.createAsset("New " + (this._contextNode).assetClass.name, (this._contextNode).assetClass.name);
else if (this._contextNode && event.text == "Save") {
                if (this._contextNode instanceof Animate.TreeNodeAssetInstance)
                    Animate.User.getSingleton().project.saveAsset((this._contextNode).asset);
                if (this._contextNode instanceof Animate.TreeNodeGroup)
                    Animate.User.getSingleton().project.saveGroups([this._contextNode]);
else if (this._contextNode instanceof Animate.TreeNodeBehaviour) {
                    //We need to build an array of the canvas objects we are trying to save.
                    var nodeText = this._contextNode.element.text();
                    var canvas = Animate.CanvasTab.getSingleton().getTabCanvas(nodeText);

                    var saveToken = {};
                    if (canvas) {
                        var saveDataObj = canvas.buildDataObject();
                        saveToken[(this._contextNode).behaviour.id] = saveDataObj;
                    } else
                        saveToken[(this._contextNode).behaviour.id] = (this._contextNode).behaviour.json;

                    //Now get the project to save it.
                    Animate.User.getSingleton().project.saveBehaviours(saveToken);
                }
            } else if (this._contextNode && event.text == "Add Group")
                Animate.User.getSingleton().project.createGroup("New Group");
else if (this._contextNode && event.text == "Update") {
                if (this._contextNode instanceof Animate.TreeNodeAssetInstance) {
                    Animate.User.getSingleton().project.updateAsset((this._contextNode).asset);
                } else if (this._contextNode == this._groupsNode) {
                    while (this._groupsNode.children.length > 0)
                        this._groupsNode.children[0].dispose();

                    Animate.User.getSingleton().project.loadGroups();
                } else if (this._contextNode == this._sceneNode) {
                    while (this._sceneNode.children.length > 0)
                        this._sceneNode.children[0].dispose();
                    Animate.User.getSingleton().project.loadBehaviours();
                } else if (this._contextNode instanceof Animate.TreeNodeGroup)
                    Animate.User.getSingleton().project.updateGroups([(this._contextNode)]);
else if (this._contextNode instanceof Animate.TreeNodeAssetClass) {
                    var nodes = this._contextNode.getAllNodes(Animate.TreeNodeAssetClass);
                    var classes = [];
                    var len = nodes.length;
                    ;
                    for (var i = 0; i < len; i++)
                        classes.push((nodes[i]).assetClass.name);

                    Animate.User.getSingleton().project.updateAssets(classes);
                } else if (this._contextNode instanceof Animate.TreeNodeBehaviour) {
                    Animate.User.getSingleton().project.updateBehaviours([(this._contextNode).behaviour.id]);
                }
            }
        };

        /**
        * When we double click the tree
        * @param <object> e The jQuery event object
        */
        TreeViewScene.prototype.onDblClick = function (e) {
            if (this.selectedNode instanceof Animate.TreeNodeBehaviour) {
                var tabPair = Animate.CanvasTab.getSingleton().getTab(this.selectedNode.text);

                if (tabPair == null)
                    tabPair = Animate.CanvasTab.getSingleton().getTab("*" + this.selectedNode.text);

                if (tabPair)
                    Animate.CanvasTab.getSingleton().selectTab(tabPair);
else {
                    var tabPair = Animate.CanvasTab.getSingleton().addSpecialTab(this.selectedNode.text, Animate.CanvasTabType.CANVAS, (this.selectedNode).behaviour);
                    var canvas = (tabPair).canvas;
                    canvas.openFromDataObject();
                    canvas.checkDimensions();
                    Animate.CanvasTab.getSingleton().selectTab(tabPair);
                }
            }
        };

        /**
        * Use this function to get an array of the groups in the scene.
        * @returns {Array<TreeNodeGroup>} The array of group nodes
        */
        TreeViewScene.prototype.getGroups = function () {
            var toRet = [];

            for (var i = 0; i < this._groupsNode.children.length; i++)
                toRet.push(this._groupsNode.children[i]);

            return toRet;
        };

        /**
        * Use this function to get a group by its ID
        * @param {string} id The ID of the group
        * @returns {TreeNodeGroup}
        */
        TreeViewScene.prototype.getGroupByID = function (id) {
            for (var i = 0; i < this._groupsNode.children.length; i++)
                if (id == (this._groupsNode.children[i]).groupID)
                    return (this._groupsNode.children[i]);

            return null;
        };

        /**
        * When the database returns from its command.
        * @param {ProjectEvents} response The loader response
        * @param {ProjectEvent} data The data sent from the server
        */
        TreeViewScene.prototype.onGroupResponse = function (response, event) {
            var data = event.tag;

            if (response == Animate.ProjectEvents.GROUP_CREATED)
                this._groupsNode.addNode(new Animate.TreeNodeGroup(data.id, data.name, data.json, this));
else if (response == Animate.ProjectEvents.GROUP_SAVED || response == Animate.ProjectEvents.GROUP_UPDATED) {
                var node = this._groupsNode.findNode("groupID", data.id);
                if (node)
                    node.updateGroup(data.name, data.json);
            } else if (response == Animate.ProjectEvents.GROUP_DELETING) {
                var node = this._groupsNode.findNode("groupID", data);
                if (node)
                    node.dispose();
            }
        };

        /** When the rename form is about to proceed. We can cancel it by externally checking
        * if against the data.object and data.name variables.
        */
        TreeViewScene.prototype.onRenameCheck = function (response, event, sender) {
            //if (event.tag.object.type == "project" )
            //	return;
            var project = Animate.User.getSingleton().project;
            var len = project.behaviours.length;
            if (event.object instanceof Animate.BehaviourContainer)
                for (var i = 0; i < len; i++)
                    if (project.behaviours[i].name == event.name) {
                        (Animate.RenameForm.getSingleton().name.val).textfield.element.addClass("red-border");
                        Animate.RenameForm.getSingleton().warning.textfield.element.css("color", "#FF0000");
                        Animate.RenameForm.getSingleton().warning.text = "A behaviour with the name '" + event.name + "' already exists, please choose another.";
                        event.cancel = true;
                        return;
                    }

            event.cancel = false;
        };

        /**
        * When the database returns from its command to rename an object.
        * @param {ProjectEvents} response The loader response
        * @param {ProjectEvent} data The data sent from the server
        */
        TreeViewScene.prototype.onObjectRenamed = function (response, event) {
            var data = event.tag;

            if (response == Animate.ProjectEvents.OBJECT_RENAMED) {
                if (data.object != null) {
                    var prevName = data.object.name;
                    data.object.name = data.name;

                    var node = null;
                    if (data.object instanceof Animate.BehaviourContainer)
                        node = this._sceneNode.findNode("behaviour", data.object);
else if (data.object instanceof Animate.Asset)
                        node = this._assetsNode.findNode("asset", data.object);
else if (data.object instanceof Animate.TreeNodeGroup)
                        node = data.object;

                    if (node != null) {
                        node.text = data.name;

                        if (data.object instanceof Animate.Asset)
                            Animate.PluginManager.getSingleton().assetRenamed(data.object, prevName);
                    }
                }
            }
        };

        /**
        * When the database returns from its command.
        * @param {ProjectEvents} response The loader response
        * @param {Event} data The data sent from the server
        */
        TreeViewScene.prototype.onBehaviourResponse = function (response, event) {
            var proj = Animate.User.getSingleton().project;

            if (response == Animate.ProjectEvents.BEHAVIOUR_SAVED) {
                if (event.tag) {
                    var node = this.findNode("behaviour", event.tag);
                    node.save(true);
                }
            }
        };

        /**
        * When the database returns from its command.
        * @param {ProjectEvents} response The loader response
        * @param {ProjectEvent} data The data sent from the server
        */
        TreeViewScene.prototype.onAssetResponse = function (response, event) {
            var data = event.tag;
            var proj = Animate.User.getSingleton().project;
            if (response == Animate.ProjectEvents.ASSET_DELETING) {
                Animate.CanvasTab.getSingleton().removeAsset(data);

                var selectedNodes = [];
                var i = this.selectedNodes.length;
                while (i--)
                    selectedNodes.push(this.selectedNodes[i]);

                i = selectedNodes.length;
                while (i--) {
                    if (selectedNodes[i].asset.id == data.id)
                        selectedNodes[i].dispose();
                }
                this._contextNode = null;
            } else if (response == Animate.ProjectEvents.ASSET_SAVED) {
                if (data) {
                    var node = this.findNode("asset", data);
                    if (node)
                        node.save();
                }
            } else if (response == Animate.ProjectEvents.ASSET_UPDATED) {
                if (data) {
                    var node = this.findNode("asset", data);
                    if (node) {
                        node.save();
                        node.onSelect();
                    }
                }
            }
        };

        /**
        * When the database returns from its command.
        * @param {ProjectEvents} response The loader response
        * @param {Event} data The data sent from the server
        */
        TreeViewScene.prototype.onProjectResponse = function (response, event) {
            if (response == Animate.ProjectEvents.BEHAVIOUR_DELETING) {
                var selectedNodes = [];

                var i = this.selectedNodes.length;
                while (i--)
                    selectedNodes.push(this.selectedNodes[i]);

                i = selectedNodes.length;
                while (i--) {
                    if (selectedNodes[i] instanceof Animate.TreeNodeBehaviour && (selectedNodes[i]).behaviour == event.tag) {
                        var tabPair = Animate.CanvasTab.getSingleton().getTab(selectedNodes[i].text);
                        if (tabPair)
                            Animate.CanvasTab.getSingleton().removeTab(tabPair, true);
else {
                            tabPair = Animate.CanvasTab.getSingleton().getTab("*" + selectedNodes[i].text);
                            if (tabPair)
                                Animate.CanvasTab.getSingleton().removeTab(tabPair, true);
                        }

                        //this.selectedNodes[i].parent().data("component").removeNode( this.selectedNodes[i] );
                        selectedNodes[i].dispose();

                        if (this._contextNode == selectedNodes[i])
                            this._contextNode = null;
                    }
                }
            }
        };

        /**
        * This function will get a list of asset instances based on their class name.
        * @param {string} className The class name of the asset
        * @returns Array<TreeNodeAssetInstance>
        */
        TreeViewScene.prototype.getAssets = function (className) {
            var i = this._assetsNode.children.length;
            var toRet = new Array();
            while (i--) {
                if (this._assetsNode.children[i] instanceof Animate.TreeNodeAssetClass) {
                    var nodes = (this._assetsNode.children[i]).getInstances(className);
                    if (nodes != null) {
                        for (var ii = 0; ii < nodes.length; ii++)
                            toRet.push(nodes[ii]);
                    }
                }
            }

            return toRet;
        };

        /**
        * This function will get a list of asset classes.
        * returns {Array<TreeNodeAssetClass>}
        */
        TreeViewScene.prototype.getAssetClasses = function () {
            var len = this._assetsNode.children.length;
            var toRet = new Array();
            for (var i = 0; i < len; i++) {
                if (this._assetsNode.children[i] instanceof Animate.TreeNodeAssetClass) {
                    toRet.push((this._assetsNode.children[i]).assetClass);

                    var classes = (this._assetsNode.children[i]).getClasses();
                    if (classes != null) {
                        for (var ii = 0; ii < classes.length; ii++)
                            toRet.push(classes[ii]);
                    }
                }
            }

            return toRet;
        };

        /**
        * Called when the context menu is about to open.
        * @param <jQuery> e The jQuery event object
        */
        TreeViewScene.prototype.onContext = function (e) {
            //Now hook the context events
            var targ = jQuery(e.target).parent();
            if (targ == null)
                return;

            var component = targ.data("component");

            if (component instanceof Animate.TreeNode) {
                if (component.canDelete)
                    this._contextDel.show();
else
                    this._contextDel.hide();

                if (component.canCopy && this.selectedNodes.length == 1)
                    this._contextCopy.show();
else
                    this._contextCopy.hide();

                if (component.canUpdate)
                    this._contextRefresh.show();
else
                    this._contextRefresh.hide();

                if (typeof (component.saved) !== "undefined" && !component.saved && this.selectedNodes.length == 1)
                    this._contextSave.show();
else
                    this._contextSave.hide();

                if (component == this._groupsNode)
                    this._contextAddGroup.show();
else
                    this._contextAddGroup.hide();

                if (component instanceof Animate.TreeNodeAssetClass && component.assetClass.abstractClass == false)
                    this._contextAddInstance.show();
else
                    this._contextAddInstance.hide();

                //this.selectNode( component );
                this._contextNode = component;
                e.preventDefault();
                this._contextMenu.show(Animate.Application.getInstance(), e.pageX, e.pageY, false, true);
                this._contextMenu.element.css({ "width": "+=20px" });
            }
        };

        /**
        * Selects a node.
        * @param {TreeNode} node The node to select
        * @param {boolean} expandToNode A bool to say if we need to traverse the tree down until we get to the node
        * and expand all parent nodes
        * @param {boolean} multiSelect Do we allow nodes to be multiply selected
        */
        TreeViewScene.prototype.selectNode = function (node, expandToNode, multiSelect) {
            if (typeof expandToNode === "undefined") { expandToNode = false; }
            if (typeof multiSelect === "undefined") { multiSelect = false; }
            if (!this.enabled)
                return;

            var multipleNodesSelected = false;
            if (multiSelect) {
                var selectedNodes = [];
                var i = this.selectedNodes.length;
                while (i--)
                    selectedNodes.push(this.selectedNodes[i]);
                selectedNodes.push(node);

                i = selectedNodes.length;
                while (i--) {
                    var ii = selectedNodes.length;
                    while (ii--) {
                        if (selectedNodes[i].constructor.name != selectedNodes[ii].constructor.name && selectedNodes[i] != selectedNodes[ii]) {
                            multipleNodesSelected = true;
                            break;
                        }
                    }

                    if (multipleNodesSelected)
                        break;
                }

                if (multipleNodesSelected)
                    multiSelect = false;
            }

            _super.prototype.selectNode.call(this, node, expandToNode, multiSelect);

            if (node == null)
                Animate.PluginManager.getSingleton().assetSelected(null);
        };

        TreeViewScene.getSingleton = /**
        * Gets the singleton instance.
        * @returns <TreeViewScene> The singleton instance
        */
        function () {
            if (!TreeViewScene._singleton)
                new TreeViewScene();

            return TreeViewScene._singleton;
        };

        /**
        * This will add a node to the treeview to represent the containers.
        * @param {BehaviourContainer} behaviour The behaviour we are associating with the node
        * @returns {TreeNodeBehaviour}
        */
        TreeViewScene.prototype.addContainer = function (behaviour) {
            var toRet = new Animate.TreeNodeBehaviour(behaviour);
            this._sceneNode.addNode(toRet);

            return toRet;
        };

        /**
        * This will add a node to the treeview to represent the behaviours available to developers
        * @param {BehaviourDefinition} template
        * @returns {TreeNodePluginBehaviour}
        */
        TreeViewScene.prototype.addPluginBehaviour = function (template) {
            var toRet = new Animate.TreeNodePluginBehaviour(template);
            this._pluginBehaviours.addNode(toRet);
            return toRet;
        };

        /**
        * This will remove a node from the treeview that represents the behaviours available to developers.
        * @param  {string} name The name if the plugin behaviour
        * @returns {TreeNode}
        */
        TreeViewScene.prototype.removePluginBehaviour = function (name, dispose) {
            if (typeof dispose === "undefined") { dispose = true; }
            var node = this._pluginBehaviours.findNode("mText", name);
            if (node != null) {
                this._pluginBehaviours.removeNode(node);

                if (dispose)
                    node.dispose();
            }

            return node;
        };

        Object.defineProperty(TreeViewScene.prototype, "sceneNode", {
            get: function () {
                return this._sceneNode;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TreeViewScene.prototype, "assetsNode", {
            get: function () {
                return this._assetsNode;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TreeViewScene.prototype, "groupsNode", {
            get: function () {
                return this._groupsNode;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TreeViewScene.prototype, "pluginBehaviours", {
            get: function () {
                return this._pluginBehaviours;
            },
            enumerable: true,
            configurable: true
        });

        Object.defineProperty(TreeViewScene.prototype, "contextNode", {
            get: function () {
                return this._contextNode;
            },
            set: function (val) {
                this._contextNode = val;
            },
            enumerable: true,
            configurable: true
        });
        return TreeViewScene;
    })(Animate.TreeView);
    Animate.TreeViewScene = TreeViewScene;
})(Animate || (Animate = {}));
//# sourceMappingURL=TreeViewScene.js.map
