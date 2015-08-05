var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Animate;
(function (Animate) {
    var ShortCutHelper = (function () {
        function ShortCutHelper(item, datum) {
            this.item = item;
            this.datum = datum;
        }
        return ShortCutHelper;
    })();

    var CanvasEvents = (function (_super) {
        __extends(CanvasEvents, _super);
        function CanvasEvents(v) {
            _super.call(this, v);
        }
        CanvasEvents.MODIFIED = new CanvasEvents("canvas_modified");
        return CanvasEvents;
    })(Animate.ENUM);
    Animate.CanvasEvents = CanvasEvents;

    var CanvasEvent = (function (_super) {
        __extends(CanvasEvent, _super);
        function CanvasEvent(eventName, canvas) {
            this.canvas = canvas;
            _super.call(this, eventName, canvas);
        }
        return CanvasEvent;
    })(Animate.Event);
    Animate.CanvasEvent = CanvasEvent;

    /**
    * The canvas is used to create diagrammatic representations of behaviours and how they interact in the scene.
    */
    var Canvas = (function (_super) {
        __extends(Canvas, _super);
        /**
        * @param {Component} parent The parent component to add this canvas to
        * @param {BehaviourContainer} behaviourContainer Each canvas represents a behaviour.This container is the representation of the canvas as a behaviour.
        */
        function Canvas(parent, behaviourContainer) {
            // Call super-class constructor
            _super.call(this, "<div class='canvas' tabindex='0'></div>", parent);

            this._proxyMoving = this.onChildMoving.bind(this);
            this._proxyStartDrag = this.onStartingDrag.bind(this);
            this._proxyStopDrag = this.onChildDropped.bind(this);

            //DragManager.getSingleton().addEventListener( DragManagerEvents.DRAGGING, this.onChildMoving, this );
            //DragManager.getSingleton().addEventListener( DragManagerEvents.DROPPED, this.onChildDropped, this );
            //DragManager.getSingleton().addEventListener( DragManagerEvents.STARTING_DRAG, this.onStartingDrag, this );
            this.mUpProxy = this.onMouseUp.bind(this);
            this.element.on("mousedown", jQuery.proxy(this.onMouseUp, this));
            this.element.on("dblclick", jQuery.proxy(this.onDoubleClick, this));
            this.mX = 0;
            this.mY = 0;
            this.name = behaviourContainer.name;
            this._behaviourContainer = behaviourContainer;
            behaviourContainer.canvas = this;

            //Define proxies
            this.mContextProxy = this.onContext.bind(this);
            this.keyProxy = this.onKeyDown.bind(this);
            this.mContextNode = null;

            //Hook listeners
            jQuery("body").on("keydown", this.keyProxy);
            jQuery(document).on("contextmenu", this.mContextProxy);

            Animate.BehaviourPicker.getSingleton().addEventListener(Animate.BehaviourPickerEvents.BEHAVIOUR_PICKED, this.onBehaviourPicked, this);
            Animate.PortalForm.getSingleton().addEventListener(Animate.OkCancelFormEvents.CONFIRM, this.OnPortalConfirm, this);

            new Animate.BehaviourPortal(this, "Start");
            Animate.PropertyGrid.getSingleton().addEventListener(Animate.PropertyGridEvents.PROPERTY_EDITED, this.onPropertyGridEdited, this);
            this.element.droppable({ drop: this.onObjectDropped.bind(this), accept: ".behaviour-to-canvas" });
            this._sceneAssets = {};
        }
        //onStartingDrag(response : DragManagerEvents, event: DragEvent )
        Canvas.prototype.onStartingDrag = function (e, ui) {
            var target = jQuery(e.currentTarget).data("component");

            if (e.shiftKey) {
                if (!(target.canGhost))
                    return;

                var left = target.element.css("left");
                var top = target.element.css("top");

                var shortcut = new Animate.BehaviourShortcut(this, target, target.alias);
                shortcut.element.css({ left: left, top: top, position: "absolute" });

                (jQuery).ui.ddmanager.current.helper = shortcut.element;
                (jQuery).ui.ddmanager.current.cancelHelperRemoval = true;
            }
        };

        /**
        * Called when a draggable object is dropped onto the canvas.
        * @param {any} event The jQuery UI event
        * @param {any} ui The event object sent from jQuery UI
        */
        Canvas.prototype.onObjectDropped = function (event, ui) {
            var comp = jQuery(ui.draggable).data("component");
            if (comp instanceof Animate.TreeNode) {
                var p = this.parent.element;
                var offset = this.element.offset();
                var scrollX = p.scrollLeft();
                var scrollY = p.scrollTop();
                var mouse = { x: event.pageX - offset.left - scrollX, y: event.pageY - offset.top - scrollY };
                this.mX = mouse.x + scrollX;
                this.mY = mouse.y + scrollY;

                if (comp instanceof Animate.TreeNodeAssetInstance) {
                    this.addAssetAtLocation((comp).asset, this.mX, this.mY);
                } else if (comp instanceof Animate.TreeNodePluginBehaviour) {
                    this.createNode((comp).template, this.mX, this.mY);
                } else if (comp instanceof Animate.TreeNodeBehaviour) {
                    this.createNode(Animate.PluginManager.getSingleton().getTemplate("Instance"), this.mX, this.mY, (comp).behaviour);
                }
            }
        };

        /**
        * Create an asset node at a location
        * @param {Asset} asset
        * @param {number} x
        * @param {number} y
        */
        Canvas.prototype.addAssetAtLocation = function (asset, x, y) {
            var node = this.createNode(Animate.PluginManager.getSingleton().getTemplate("Asset"), x, y);
            node.asset = asset;
            node.parameters[0].value = asset.id + ":";

            if (asset) {
                if (this._sceneAssets[asset.id])
                    this._sceneAssets[asset.id] = this._sceneAssets[asset.id] + 1;
else {
                    this._sceneAssets[asset.id] = 1;

                    //Notify the plugin manager
                    Animate.PluginManager.getSingleton().assetAddedToContainer(asset, this._behaviourContainer);
                }

                node.text = asset.name;
                node.alias = asset.name;
            }
        };

        /**
        * This function is used to cleanup the object before its removed from memory.
        */
        Canvas.prototype.dispose = function () {
            this.element.droppable("destroy");

            Animate.BehaviourPicker.getSingleton().removeEventListener(Animate.BehaviourPickerEvents.BEHAVIOUR_PICKED, this.onBehaviourPicked, this);
            Animate.PortalForm.getSingleton().removeEventListener(Animate.OkCancelFormEvents.CONFIRM, this.OnPortalConfirm, this);
            jQuery("body").off("keydown", this.keyProxy);
            jQuery(document).off("contextmenu", this.mContextProxy);
            Animate.PropertyGrid.getSingleton().removeEventListener(Animate.PropertyGridEvents.PROPERTY_EDITED, this.onPropertyGridEdited, this);

            this._proxyMoving = null;
            this._proxyStartDrag = null;
            this._proxyStopDrag = null;
            this.mX = null;
            this.mY = null;
            this.name = null;
            this._behaviourContainer = null;
            this.keyProxy = null;
            this.mContextProxy = null;
            this.mContextNode = null;
            this._sceneAssets = null;

            //Call super
            _super.prototype.dispose.call(this);
        };

        /**
        * This function will remove all references of an asset in the behaviour nodes
        * @param {Asset} asset The asset reference
        */
        Canvas.prototype.removeAsset = function (asset) {
            var i = this.children.length;
            while (i--) {
                var item = this.children[i];

                if (item instanceof Animate.Behaviour) {
                    var ii = item.parameters.length;
                    while (ii--)
                        if (item.parameters[ii].dataType == Animate.ParameterType.ASSET && item.parameters[ii].value != null) {
                            var assetID = item.parameters[ii].value.split(":")[0];
                            if (Animate.User.getSingleton().project.getAsset(assetID) == asset) {
                                item.parameters[ii].value = ":" + item.parameters[ii].value.split(":")[1];

                                if (item instanceof Animate.BehaviourAsset)
                                    (item).asset = null;

                                if (this._sceneAssets[assetID] != null) {
                                    this._sceneAssets[assetID] = this._sceneAssets[assetID] - 1;
                                    if (this._sceneAssets[assetID] <= 0) {
                                        Animate.PluginManager.getSingleton().assetRemovedFromContainer(asset, this._behaviourContainer);
                                        delete this._sceneAssets[asset.id];
                                    }
                                }
                            }
                        }
                }
            }
        };

        /**
        * Call this to remove an item from the canvas
        * @param {Component} item The component we are removing from the canvas
        * @extends <Canvas>
        */
        Canvas.prototype.removeItem = function (item) {
            var toRemove = [];
            for (var i = 0; i < this.children.length; i++)
                toRemove.push(this.children[i]);

            for (var i = 0; i < toRemove.length; i++)
                if (typeof (toRemove[i]) !== "undefined")
                    if (toRemove[i] instanceof Animate.BehaviourShortcut && toRemove[i].originalNode == item)
                        this.removeItem(toRemove[i]);

            for (var i = 0; i < toRemove.length; i++)
                if (typeof (toRemove[i]) !== "undefined")
                    if (toRemove[i] == item) {
                        if (toRemove[i] instanceof Animate.Behaviour) {
                            var ii = item.parameters.length;
                            while (ii--)
                                if (item.parameters[ii].dataType == "asset" && item.parameters[ii].value != null) {
                                    var assetID = item.parameters[ii].value.split(":")[0];
                                    if (this._sceneAssets[assetID] != null) {
                                        this._sceneAssets[assetID] = this._sceneAssets[assetID] - 1;
                                        if (this._sceneAssets[assetID] <= 0) {
                                            var asset = Animate.User.getSingleton().project.getAsset(assetID);
                                            Animate.PluginManager.getSingleton().assetRemovedFromContainer(asset, this._behaviourContainer);
                                            delete this._sceneAssets[asset.id];
                                            break;
                                        }
                                    }
                                }
                        }

                        //Notify of change
                        this.dispatchEvent(new CanvasEvent(CanvasEvents.MODIFIED, this));

                        if (toRemove[i] instanceof Animate.BehaviourPortal)
                            Animate.PluginManager.getSingleton().dispatchEvent(new Animate.PluginPortalEvent(Animate.PluginPortalEvents.PORTAL_REMOVED, "", this._behaviourContainer, (toRemove[i]).portals[0], this));

                        toRemove[i].dispose();
                    }

            toRemove = null;
        };

        /**
        * Removes all selected items
        */
        Canvas.prototype.removeItems = function () {
            //Remove all selected
            var toRemove = [];
            var i = this.children.length;
            while (i--)
                toRemove.push(this.children[i]);

            var i = toRemove.length;
            while (i--)
                if (typeof (toRemove[i]) !== "undefined")
                    if (toRemove[i].disposed != null && toRemove[i].selected)
                        this.removeItem(toRemove[i]);
        };

        /**
        * Called when the canvas context menu is closed and an item clicked.
        */
        Canvas.prototype.onContextSelect = function (e, event) {
            if (event.text == "Delete") {
                if (this.mContextNode instanceof Animate.Portal) {
                    var behaviour = (this.mContextNode).behaviour;
                    behaviour.removePortal(this.mContextNode);

                    var toEdit = new Animate.EditableSet();
                    var i = behaviour.parameters.length;
                    while (i--)
                        if (behaviour.parameters[i].links.length <= 0)
                            toEdit.addVar(behaviour.parameters[i].name, behaviour.parameters[i].value, Animate.ENUM.fromString(behaviour.parameters[i].dataType.toString()), behaviour.element.text());

                    Animate.PropertyGrid.getSingleton().editableObject(toEdit, behaviour.text + " - " + behaviour.id, behaviour.id, null);
                    return;
                } else
                    Animate.Toolbar.getSingleton().deleteBut.element.trigger("click");
            } else if (event.text == "Remove Empty Assets") {
                //Remove all selected
                var toRemove = [];
                var i = this.children.length;
                while (i--)
                    toRemove.push(this.children[i]);

                var i = toRemove.length;
                while (i--)
                    if (typeof (toRemove[i]) !== "undefined")
                        if (toRemove[i] instanceof Animate.BehaviourAsset && toRemove[i].parameters[0].value == ":")
                            this.removeItem(toRemove[i]);
            } else if (event.text == "Edit Portal") {
                Animate.PortalForm.getSingleton().showForm(this.mContextNode, null, null);
            } else if (event.text == "Create Behaviour") {
                var context = Animate.Application.getInstance().canvasContext;
                Animate.BehaviourPicker.getSingleton().show(Animate.Application.getInstance(), context.element.offset().left, context.element.offset().top, false, true);
            } else if (event.text == "Create Comment") {
                var context = Animate.Application.getInstance().canvasContext;
                var comment = new Animate.BehaviourComment(this, "Comment");
                comment.element.addClass("scale-in-animation");
                comment.css({ left: this.mX + "px", top: this.mY + "px", width: "100px", height: "60px" });
            } else if (event.text == "Create Input" || event.text == "Create Output" || event.text == "Create Parameter" || event.text == "Create Product") {
                //Define the type of portal
                var type = Animate.PortalType.INPUT;
                if (event.text == "Create Output")
                    type = Animate.PortalType.OUTPUT;
else if (event.text == "Create Parameter")
                    type = Animate.PortalType.PARAMETER;
                if (event.text == "Create Product")
                    type = Animate.PortalType.PRODUCT;

                if (this.mContextNode)
                    Animate.PortalForm.getSingleton().showForm(this.mContextNode, type, null);
else
                    Animate.PortalForm.getSingleton().showForm(this, type, event.text);
            }

            this.onContextHide(Animate.WindowEvents.HIDDEN, null);
        };

        /**
        * This is called externally when we need to rebuild the array of container assets
        */
        Canvas.prototype.buildSceneAssets = function () {
            this._sceneAssets = {};
            var project = Animate.User.getSingleton().project;
            var i = this.children.length;
            while (i--) {
                var child = this.children[i];

                if (!(child instanceof Animate.BehaviourComment) && child instanceof Animate.Behaviour) {
                    for (var ii = 0; ii < child.portals.length; ii++) {
                        var item = child;

                        if (item.portals[ii].type == Animate.PortalType.PARAMETER && item.portals[ii].dataType == Animate.ParameterType.ASSET && item.portals[ii].value != null && item.portals[ii].value != "") {
                            var asset = project.getAsset(item.portals[ii].value.split(":")[0]);

                            if (asset) {
                                if (this._sceneAssets[asset.id])
                                    this._sceneAssets[asset.id] = this._sceneAssets[asset.id] + 1;
else
                                    this._sceneAssets[asset.id] = 1;
                            }
                        }
                    }
                }
            }

            for (var id in this._sceneAssets) {
                var asset = project.getAsset(id);
                Animate.PluginManager.getSingleton().assetAddedToContainer(asset, this._behaviourContainer);
            }
        };

        /**
        * Called when the property grid fires an edited event.
        * @param {string} response
        * @param {any} data The data object sent from the property grid.
        */
        Canvas.prototype.onPropertyGridEdited = function (response, event) {
            for (var i = 0; i < this.children.length; i++) {
                if (event.id == this.children[i]) {
                    if (this.children[i] instanceof Animate.BehaviourComment) {
                        var comment = this.children[i];
                        comment.text = event.propertyValue;
                    } else if (this.children[i] instanceof Animate.Link) {
                        var link = this.children[i];
                        var num = event.propertyValue.toString().split(":");
                        num = parseInt(num);
                        if (isNaN(num))
                            num = 1;

                        link.frameDelay = num;
                        link.draw();
                    } else {
                        var portals = (this.children[i]).portals;

                        for (var ii = 0; ii < portals.length; ii++) {
                            var item = this.children[i];

                            if (portals[ii].name == event.propertyName) {
                                if (item instanceof Animate.BehaviourAsset)
                                    (item).asset = event.propertyValue;

                                if (portals[ii].dataType == Animate.ParameterType.ASSET && portals[ii].value != null && portals[ii].value != "") {
                                    var asset = Animate.User.getSingleton().project.getAsset(portals[ii].value.split(":")[0]);

                                    if (asset) {
                                        this._sceneAssets[asset.id] = this._sceneAssets[asset.id] - 1;

                                        if (this._sceneAssets[asset.id] <= 0) {
                                            Animate.PluginManager.getSingleton().assetRemovedFromContainer(asset, this._behaviourContainer);
                                            delete this._sceneAssets[asset.id];
                                        }
                                    }
                                }

                                if (event.propertyType == Animate.ParameterType.ASSET) {
                                    var assetID = event.propertyValue.toString().split(":")[0];

                                    if (assetID != "") {
                                        var asset = Animate.User.getSingleton().project.getAsset(assetID);

                                        if (!this._sceneAssets[assetID]) {
                                            this._sceneAssets[assetID] = 1;
                                            Animate.PluginManager.getSingleton().assetAddedToContainer(asset, this._behaviourContainer);
                                        } else
                                            this._sceneAssets[assetID] = this._sceneAssets[assetID] + 1;
                                    }
                                }

                                item.portals[ii].value = event.propertyValue;

                                //Notify of change
                                this.dispatchEvent(new CanvasEvent(CanvasEvents.MODIFIED, this));

                                return;
                            }
                        }
                    }
                }
            }
        };

        /**
        * When we click ok on the portal form
        */
        Canvas.prototype.OnPortalConfirm = function (response, e) {
            if (this.element.is(':visible') == false)
                return;

            if (e.text == "Ok") {
                if (this.mContextNode instanceof Animate.Portal) {
                    var portal = this.mContextNode;
                    var oldName = portal.name;
                    portal.edit(Animate.PortalForm.getSingleton().name, Animate.PortalForm.getSingleton().portalType, Animate.PortalForm.getSingleton().value, Animate.PortalForm.getSingleton().parameterType);

                    var p = portal.parent;
                    if (p instanceof Animate.BehaviourPortal)
                        (p).text = portal.name;

                    //Show in prop editor
                    var behaviour = portal.behaviour;
                    var toEdit = new Animate.EditableSet();
                    var i = behaviour.parameters.length;
                    while (i--)
                        if (behaviour.parameters[i].links.length <= 0)
                            toEdit.addVar(behaviour.parameters[i].name, behaviour.parameters[i].value, behaviour.parameters[i].dataType, behaviour.element.text());

                    Animate.PropertyGrid.getSingleton().editableObject(toEdit, behaviour.text + " - " + behaviour.id, behaviour, "");

                    //Notify of change
                    Animate.PluginManager.getSingleton().dispatchEvent(new Animate.PluginPortalEvent(Animate.PluginPortalEvents.PORTAL_EDITED, oldName, this._behaviourContainer, portal, this));

                    return;
                } else if (this.mContextNode instanceof Animate.Behaviour) {
                    //Create a portal on a Behaviour
                    var portal = (this.mContextNode).addPortal(Animate.PortalForm.getSingleton().portalType, Animate.PortalForm.getSingleton().name, Animate.PortalForm.getSingleton().value, Animate.PortalForm.getSingleton().parameterType);

                    portal.customPortal = true;
                } else {
                    //Create a canvas portal
                    var newNode = new Animate.BehaviourPortal(this, Animate.PortalForm.getSingleton().name, Animate.PortalForm.getSingleton().portalType, Animate.PortalForm.getSingleton().parameterType, Animate.PortalForm.getSingleton().value);

                    newNode.css({ "left": this.mX + "px", "top": this.mY + "px", "position": "absolute" });

                    //Notify of change
                    Animate.PluginManager.getSingleton().dispatchEvent(new Animate.PluginPortalEvent(Animate.PluginPortalEvents.PORTAL_ADDED, "", this._behaviourContainer, newNode.portals[0], this));
                }

                //Notify of change
                this.dispatchEvent(new CanvasEvent(CanvasEvents.MODIFIED, this));
            }
        };

        /**
        * When the context is hidden we remove the event listeners.
        */
        Canvas.prototype.onContextHide = function (response, e) {
            var context = Animate.Application.getInstance().canvasContext;
            context.removeEventListener(Animate.WindowEvents.HIDDEN, this.onContextHide, this);
            context.removeEventListener(Animate.ContextMenuEvents.ITEM_CLICKED, this.onContextSelect, this);
        };

        /**
        * Called when the context menu is about to open
        * @param {any} e The jQuery event object
        */
        Canvas.prototype.onContext = function (e) {
            if (this.element.is(':visible') == false)
                return;

            //First get the x and y cords
            var p = this.parent.element;
            var offset = this.element.offset();
            var scrollX = p.scrollLeft();
            var scrollY = p.scrollTop();
            var mouse = { x: e.pageX - offset.left - scrollX, y: e.pageY - offset.top - scrollY };
            this.mX = mouse.x + scrollX;
            this.mY = mouse.y + scrollY;

            //Now hook the context events
            var targ = jQuery(e.target);
            var targetComp = targ.data("component");
            var context = Animate.Application.getInstance().canvasContext;
            this.mContextNode = targ.data("component");

            if (targetComp instanceof Canvas) {
                this.mContextNode = null;
                e.preventDefault();
                context.showContext(e.pageX, e.pageY, null);
                context.element.css({ "width": "+=20px" });
                context.addEventListener(Animate.WindowEvents.HIDDEN, this.onContextHide, this);
                context.addEventListener(Animate.ContextMenuEvents.ITEM_CLICKED, this.onContextSelect, this);
            } else if (targetComp instanceof Animate.Portal) {
                e.preventDefault();
                context.showContext(e.pageX, e.pageY, this.mContextNode);
                context.element.css({ "width": "+=20px" });
                context.addEventListener(Animate.WindowEvents.HIDDEN, this.onContextHide, this);
                context.addEventListener(Animate.ContextMenuEvents.ITEM_CLICKED, this.onContextSelect, this);
            } else if (targetComp instanceof Animate.Link) {
                e.preventDefault();
                var link = targ.data("component");
                var hit = link.hitTestPoint(e);
                if (hit) {
                    context.showContext(e.pageX, e.pageY, link);
                    context.element.css({ "width": "+=20px" });
                    context.addEventListener(Animate.WindowEvents.HIDDEN, this.onContextHide, this);
                    context.addEventListener(Animate.ContextMenuEvents.ITEM_CLICKED, this.onContextSelect, this);
                }
            } else if (targetComp instanceof Animate.BehaviourInstance || targetComp instanceof Animate.BehaviourAsset || targetComp instanceof Animate.BehaviourPortal) {
                e.preventDefault();
                context.showContext(e.pageX, e.pageY, this.mContextNode);
                context.element.css({ "width": "+=20px" });
                context.addEventListener(Animate.WindowEvents.HIDDEN, this.onContextHide, this);
                context.addEventListener(Animate.ContextMenuEvents.ITEM_CLICKED, this.onContextSelect, this);
            } else if (targetComp instanceof Animate.BehaviourComment)
                e.preventDefault();
else if (targetComp instanceof Animate.Behaviour) {
                e.preventDefault();
                context.showContext(e.pageX, e.pageY, this.mContextNode);
                context.element.css({ "width": "+=20px" });
                context.addEventListener(Animate.WindowEvents.HIDDEN, this.onContextHide, this);
                context.addEventListener(Animate.ContextMenuEvents.ITEM_CLICKED, this.onContextSelect, this);
            } else
                context.hide();
        };

        /**
        * When we have chosen a behaviour
        */
        Canvas.prototype.onBehaviourPicked = function (response, event) {
            if (this.element.is(':visible') == false)
                return;

            if (this.element.parent().parent().length == 0)
                return;

            var template = Animate.PluginManager.getSingleton().getTemplate(event.behaviourName);

            if (template) {
                this.createNode(template, this.mX, this.mY);
            }
        };

        /**
        * This will create a canvas node based on the template given
        * @param {BehaviourDefinition} template The definition of the node
        * @param {number} x The x position of where the node shoule be placed
        * @param {number} y The y position of where the node shoule be placed
        * @param {BehaviourContainer} container This is only applicable if we are dropping a node that represents another behaviour container. This last parameter
        * is the actual behaviour container
        * @returns {Behaviour}
        */
        Canvas.prototype.createNode = function (template, x, y, container) {
            var toAdd = null;

            if (template.behaviourName == "Instance")
                toAdd = new Animate.BehaviourInstance(this, container);
else if (template.behaviourName == "Asset")
                toAdd = new Animate.BehaviourAsset(this, template.behaviourName);
else if (template.behaviourName == "Script")
                toAdd = new Animate.BehaviourScript(this, template.behaviourName);
else
                toAdd = new Animate.Behaviour(this, template.behaviourName);

            if (template.behaviourName != "Instance")
                toAdd.text = template.behaviourName;

            var portalTemplates = null;

            if (template.createPortalsTemplates)
                portalTemplates = template.createPortalsTemplates();

            if (portalTemplates) {
                for (var i = 0; i < portalTemplates.length; i++)
                    for (var ii = 0; ii < portalTemplates.length; ii++)
                        if (ii != i && portalTemplates[i].name == portalTemplates[ii].name) {
                            Animate.MessageBox.show("One of the portals " + portalTemplates[ii].name + " has the same name as another.", Array("Ok"), null, null);
                            toAdd.dispose();
                            toAdd = null;
                            return;
                        }

                for (var i = 0; i < portalTemplates.length; i++) {
                    var portal = toAdd.addPortal(portalTemplates[i].type, portalTemplates[i].name, portalTemplates[i].value, portalTemplates[i].dataType);

                    if (toAdd instanceof Animate.BehaviourScript == false)
                        portal.customPortal = false;
                }
            }

            toAdd.element.css({ left: x + "px", top: y + "px" });
            toAdd.element.addClass("scale-in-animation");

            //Notify of change
            this.dispatchEvent(new CanvasEvent(CanvasEvents.MODIFIED, this));

            return toAdd;
        };

        /**
        * Called when a behaviour is renamed
        */
        Canvas.prototype.onBehaviourRename = function (e, event) {
            Animate.RenameForm.getSingleton().removeEventListener(Animate.RenameFormEvents.OBJECT_RENAMED, this.onBehaviourRename, this);

            var toEdit = null;
            if (event.object instanceof Animate.BehaviourShortcut)
                toEdit = event.object.originalNode;
else
                toEdit = event.object;

            toEdit.text = event.name;
            toEdit.alias = event.name;

            //Check if there are any shortcuts and make sure they are renamed
            var i = this.children.length;
            while (i--)
                if (this.children[i] instanceof Animate.BehaviourShortcut && (this.children[i]).originalNode == toEdit) {
                    (this.children[i]).text = event.name;
                    (this.children[i]).alias = event.name;
                }
        };

        /**
        * Catch the key down events.
        * @param {any} e The jQuery event object
        */
        Canvas.prototype.onKeyDown = function (e) {
            if (this.element.is(':visible') == false)
                return;

            if (jQuery(e.target).is("input"))
                return;

            var focusObj = Animate.Application.getInstance().focusObj;

            if (Animate.Application.getInstance().focusObj != null) {
                if (e.keyCode == 113) {
                    if (focusObj instanceof Animate.BehaviourComment) {
                        (focusObj).enterText();
                        return;
                    } else if (focusObj instanceof Animate.BehaviourPortal)
                        return;
else if (Animate.Application.getInstance().focusObj instanceof Animate.Behaviour) {
                        Animate.RenameForm.getSingleton().addEventListener(Animate.RenameFormEvents.OBJECT_RENAMED, this.onBehaviourRename, this);
                        Animate.RenameForm.getSingleton().showForm(Animate.Application.getInstance().focusObj, Animate.Application.getInstance().focusObj.element.text());
                        return;
                    }
                } else if (e.keyCode == 67) {
                    if (e.ctrlKey)
                        return;

                    if (focusObj instanceof Animate.BehaviourShortcut) {
                        this.selectItem(null);
                        (focusObj).selected = false;
                        this.selectItem((focusObj).originalNode);
                        this.element.parent().scrollTo('#' + (focusObj).originalNode.id, 500);
                        return;
                    }
                } else if (e.keyCode == 46) {
                    //Remove all selected
                    Animate.Toolbar.getSingleton().deleteBut.element.trigger("click");
                }
            }
        };

        /**
        * When we double click the canvas we show the behaviour picker.
        * @param {any} e The jQuery event object
        */
        Canvas.prototype.onDoubleClick = function (e) {
            if (jQuery(e.target).is("textarea"))
                return;

            var comp = jQuery(e.target).data("component");

            if (comp instanceof Animate.BehaviourComment) {
                comp.enterText();
                return;
            } else if (comp instanceof Animate.BehaviourInstance) {
                var tree = Animate.TreeViewScene.getSingleton();
                var node = tree.findNode("behaviour", comp._behaviourContainer);
                tree.selectNode(node);
                (tree).onDblClick(null);
                return;
            } else if (comp instanceof Animate.BehaviourScript) {
                comp.edit();
                return;
            }

            var p = this.parent.element;

            var offset = this.element.offset();
            var scrollX = p.scrollLeft();
            var scrollY = p.scrollTop();

            var mouse = { x: e.pageX - offset.left - scrollX, y: e.pageY - offset.top - scrollY };

            this.mX = mouse.x + scrollX;
            this.mY = mouse.y + scrollY;
            Animate.BehaviourPicker.getSingleton().show(Animate.Application.getInstance(), e.pageX, e.pageY, false, true);
            e.preventDefault();
        };

        /**
        * This is called to set the selected canvas item.
        * @param {Component} comp The component to select
        */
        Canvas.prototype.selectItem = function (comp) {
            if (comp == null) {
                //Remove all glows
                var children = this.children;
                var i = children.length;
                while (i--) {
                    if (typeof (children[i]) !== "undefined")
                        children[i].element.removeClass("green-glow-strong");

                    if (children[i].selected)
                        children[i].selected = false;
                }

                //Set the selected item
                Canvas.lastSelectedItem = null;
                Animate.PropertyGrid.getSingleton().editableObject(null, "", null, "");
                Animate.Toolbar.getSingleton().itemSelected(null);
                return;
            }

            if (comp.selected) {
                this.selectItem(null);
                return;
            }

            comp.selected = true;

            //Set the selected item
            Canvas.lastSelectedItem = comp;

            if (comp instanceof Animate.Behaviour) {
                comp.element.removeClass("scale-in-animation");

                var toEdit = new Animate.EditableSet();

                if (comp instanceof Animate.BehaviourComment) {
                    toEdit.addVar("text", (comp).text, Animate.ParameterType.STRING, null);
                    Animate.PropertyGrid.getSingleton().editableObject(toEdit, "Comment", comp, "");
                } else if (comp instanceof Animate.BehaviourShortcut == false) {
                    var len = (comp).parameters.length;
                    for (var i = 0; i < len; i++)
                        if ((comp).parameters[i].links.length <= 0)
                            toEdit.addVar((comp).parameters[i].name, (comp).parameters[i].value, (comp).parameters[i].dataType, (comp).element.text());

                    Animate.PropertyGrid.getSingleton().editableObject(toEdit, (comp).text + " - " + comp.id, comp, "");
                }

                //Highlight all shortcuts
                var children = this.children;
                var i = children.length;
                while (i--)
                    if (typeof (children[i]) !== "undefined")
                        if (children[i] instanceof Animate.BehaviourShortcut && (children[i]).originalNode == comp)
                            children[i].element.addClass("green-glow-strong");
else
                            children[i].element.removeClass("green-glow-strong");
            } else if (comp instanceof Animate.Link && (comp).startPortal.type == Animate.PortalType.OUTPUT) {
                var toEdit = new Animate.EditableSet();
                toEdit.addVar("Frame delay", (comp).frameDelay, Animate.ParameterType.NUMBER, "Link Properties");
                Animate.PropertyGrid.getSingleton().editableObject(toEdit, "Link - " + (comp).id, comp, "");
            }

            Animate.Toolbar.getSingleton().itemSelected(comp);
        };

        /**
        * Called when we click on a diagram item.
        * @param {any} e The jQuery event object
        */
        Canvas.prototype.onMouseUp = function (e) {
            if (e.which != 1)
                return;

            //Keep track of the current scroll because when we focus it seems to lose it
            var sLeft = this.parent.element.scrollLeft();
            var sTop = this.parent.element.scrollTop();
            this.element.focus();

            this.parent.element.scrollLeft(sLeft);
            this.parent.element.scrollTop(sTop);

            var comp = jQuery(e.currentTarget).data("component");
            if (comp instanceof Canvas)
                comp = null;

            if (comp == null && !e.ctrlKey) {
                this.selectItem(comp);
                return;
            }

            if (!e.ctrlKey)
                for (var i = 0; i < this.children.length; i++)
                    this.children[i].selected = false;

            if (comp instanceof Animate.Behaviour) {
                comp.element.removeClass("scale-in-animation");
                this.selectItem(comp);
                return;
            }

            //Not a behaviour so lets see if its a link
            //Make sure we actually hit a link
            var len = this.children.length;
            for (var i = 0; i < len; i++) {
                comp = this.children[i];
                if (comp instanceof Animate.Link) {
                    var hit = comp.hitTestPoint(e);
                    if (hit) {
                        this.selectItem(comp);
                        return;
                    }
                }
            }
            e.preventDefault();
        };

        /**
        * This is called externally when the canvas has been selected. We use this
        * function to remove any animated elements
        */
        Canvas.prototype.onSelected = function () {
            var len = this.children.length;
            for (var i = 0; i < len; i++)
                this.children[i].element.removeClass("scale-in-animation");
        };

        /**
        * Use this function to add a child to this component. This has the same effect of adding some HTML as a child of another piece of HTML.
        * It uses the jQuery append function to achieve this functionality.
        * @param {any} child The child to add. Valid parameters are valid HTML code or other Components.
        * @returns {Component} The child as a Component.
        */
        Canvas.prototype.addChild = function (child) {
            //call super
            var toRet = Animate.Component.prototype.addChild.call(this, child);

            if (toRet instanceof Animate.Behaviour)
                toRet.element.draggable({ drag: this._proxyMoving, start: this._proxyStartDrag, stop: this._proxyStopDrag, cancel: ".portal" });

            toRet.element.on("mouseup", this.mUpProxy);

            return toRet;
        };

        /**
        * Use this function to remove a child from this component. It uses the jQuery detach function to achieve this functionality.
        * @param {Component} child The child to remove. Valid parameters are valid Components.
        * @returns {Component} The child as a Component.
        */
        Canvas.prototype.removeChild = function (child) {
            //call super
            var toRet = Animate.Component.prototype.removeChild.call(this, child);

            if (toRet) {
                //DragManager.getSingleton().setDraggable( toRet,false, this, null );
                toRet.element.off("mouseup", this.mUpProxy);
            }

            return toRet;
        };

        /**
        * When an item is finished being dragged
        */
        Canvas.prototype.onChildDropped = function (e, ui) {
            //var p = event.target.parent.element.is( this.element );
            //if ( !p )
            //	return;
            //Notify of change
            this.dispatchEvent(new CanvasEvent(CanvasEvents.MODIFIED, this));
        };

        /**
        * Called when an item is moving
        */
        //onChildMoving( response : DragManagerEvents, event: DragEvent )
        Canvas.prototype.onChildMoving = function (e, ui) {
            //var p = event.target.parent.element.is( this.element );
            //if ( !p )
            //	return;
            //var canvasParent : JQuery = this.parent.element;
            //var target : Component = event.target;
            var canvasParent = this.element;
            var target = jQuery(e.target).data("component");

            var targetElem = target.element;
            var panelOffset = canvasParent.offset();
            var panelDimensionsW = canvasParent.width();
            var panelDimensionsH = canvasParent.height();
            var scrollAmount = 10;

            var w = targetElem.css("left");
            w = w.substr(0, w.length - 2);
            var wi = parseFloat(w) + target.element.width() + 5;

            var h = targetElem.css("top");
            h = h.substr(0, h.length - 2);
            var hi = parseFloat(h) + target.element.height() + 5;

            var minW = this.element.css("min-width");
            var minWa = minW.split("px");
            var minWi = parseFloat(minWa[0]);

            var minH = this.element.css("min-height");
            var minHa = minH.split("px");
            var minHi = parseFloat(minHa[0]);

            this.element.css({
                "min-width": (wi > minWi ? wi : minWi) + "px",
                "min-height": (hi > minHi ? hi : minHi) + "px"
            });

            ////Scroll the panel if the dragging is on the corners
            //if ( event.event.clientX - panelOffset.left < 20 )
            //{
            //	event.startX -= scrollAmount;
            //	canvasParent.scrollLeft( canvasParent.scrollLeft() - scrollAmount );
            //	target.element.css( "left", "-=" + scrollAmount + "px" );
            //}
            //else if ( event.event.clientX > panelDimensionsW + panelOffset.left )
            //{
            //	event.startX += scrollAmount;
            //	canvasParent.scrollLeft( canvasParent.scrollLeft() + scrollAmount );
            //	target.element.css( "left", "+=" + scrollAmount + "px" );
            //}
            //if ( event.event.clientY - panelOffset.top < 20 )
            //{
            //	event.startY -= scrollAmount;
            //	canvasParent.scrollTop( canvasParent.scrollTop() - scrollAmount );
            //	target.element.css( "top", "-=" + scrollAmount + "px" );
            //}
            //else if ( event.event.clientY > panelDimensionsH + panelOffset.top )
            //{
            //	event.startY += scrollAmount;
            //	canvasParent.scrollTop( canvasParent.scrollTop() + scrollAmount );
            //	target.element.css( "top", "+=" + scrollAmount + "px" );
            //}
            //Upadte the links
            var i = (target).portals.length;
            while (i--)
                (target).portals[i].updateAllLinks();

            this.checkDimensions();
        };

        /**
        * This function is called when animate is reading in saved data from the server.
        * @param {any} data
        */
        Canvas.prototype.open = function (data) {
        };

        /**
        * This function is called when a behaviour is double clicked,
        * a canvas is created and we try and load the behavious contents.
        * @param {boolean} dataToken You can optionally pass in an data token object. These objects must contain information on each of the items we are adding to the canvas.
        * @param {boolean} clearItems If this is set to true the function will clear all items already on the Canvas.
        * @returns {any}
        */
        Canvas.prototype.openFromDataObject = function (dataToken, clearItems, addSceneAssets) {
            if (typeof clearItems === "undefined") { clearItems = true; }
            if (typeof addSceneAssets === "undefined") { addSceneAssets = false; }
            //Create the data object from the JSON
            var jsonObj = null;

            if (dataToken)
                jsonObj = dataToken;
else if (jQuery.trim(this._behaviourContainer.json) != "")
                jsonObj = JSON.parse(this._behaviourContainer.json);

            if (clearItems)
                while (this.children.length > 0)
                    this.children[0].dispose();

            var links = [];
            var shortcuts = [];

            if (jsonObj && jsonObj.items) {
                for (var i in jsonObj.items) {
                    var item = null;

                    if (jsonObj.items[i].type == "BehaviourPortal") {
                        //Check if there is already a portal with that name. if it does then it
                        //is ignored.
                        var nameInUse = false;
                        var len = this.children.length;
                        for (var ii = 0; ii < len; ii++)
                            if (this.children[ii] instanceof Animate.BehaviourPortal && this.children[ii].element.text() == jsonObj.items[i].name) {
                                nameInUse = true;
                                Animate.Logger.getSingleton().logMessage("A portal with the name '" + jsonObj.items[i].name + "' already exists on the Canvas.", null, Animate.LogType.ERROR);
                                break;
                            }

                        if (nameInUse == false) {
                            item = new Animate.BehaviourPortal(this, jsonObj.items[i].name, Animate.PortalType.fromString(jsonObj.items[i].portalType), Animate.ParameterType.fromString(jsonObj.items[i].dataType), jsonObj.items[i].value);

                            (item).requiresUpdated = true;
                        }
                    } else if (jsonObj.items[i].type == "BehaviourAsset")
                        item = new Animate.BehaviourAsset(this, jsonObj.items[i].text);
else if (jsonObj.items[i].type == "BehaviourScript")
                        item = new Animate.BehaviourScript(this, jsonObj.items[i].text, jsonObj.items[i].databaseID, !clearItems);
else if (jsonObj.items[i].type == "BehaviourInstance") {
                        var project = Animate.User.getSingleton().project;
                        var container = project.getBehaviour(jsonObj.items[i].behaviourID);
                        if (!container)
                            continue;

                        item = new Animate.BehaviourInstance(this, container, false);
                    } else if (jsonObj.items[i].type == "BehaviourShortcut") {
                        item = new Animate.BehaviourShortcut(this, null, jsonObj.items[i].name);
                        shortcuts.push(new ShortCutHelper(item, jsonObj.items[i]));
                    } else if (jsonObj.items[i].type == "BehaviourComment")
                        item = new Animate.BehaviourComment(this, jsonObj.items[i].text);
else if (jsonObj.items[i].type == "Behaviour")
                        item = new Animate.Behaviour(this, jsonObj.items[i].name);
else if (jsonObj.items[i].type == "Link") {
                        var l = new Animate.Link(this);
                        item = l;

                        //Links we treat differerntly. They need all the behaviours
                        //loaded first. So we do that, and keep each link in an array
                        //to load after the behaviours
                        links.push(l);
                        l.frameDelay = (jsonObj.items[i].frameDelay !== undefined ? jsonObj.items[i].frameDelay : 1);

                        //Store some temp data on the tag
                        l.tag = {};
                        l.tag.startPortalName = jsonObj.items[i].startPortal;
                        l.tag.endPortalName = jsonObj.items[i].endPortal;
                        l.tag.startBehaviourID = jsonObj.items[i].startBehaviour;
                        l.tag.endBehaviourID = jsonObj.items[i].endBehaviour;
                        l.tag.startBehaviour = null;
                        l.tag.endBehaviour = null;
                    }

                    if (item != null) {
                        item.savedID = jsonObj.items[i].id;

                        //Set the positioning etc...
                        item.element.css({
                            "left": jsonObj.items[i].left,
                            "top": jsonObj.items[i].top,
                            //"width": jsonObj.items[i].width,
                            //"height": jsonObj.items[i].height,
                            "z-index": jsonObj.items[i].zIndex,
                            "position": jsonObj.items[i].position
                        });

                        if (jsonObj.items[i].portals) {
                            for (var iii = 0; iii < jsonObj.items[i].portals.length; iii++) {
                                var portal = (item).addPortal(Animate.ENUM.fromString(jsonObj.items[i].portals[iii].type.toString()), jsonObj.items[i].portals[iii].name, jsonObj.items[i].portals[iii].value, Animate.ENUM.fromString(jsonObj.items[i].portals[iii].dataType));

                                portal.customPortal = jsonObj.items[i].portals[iii].customPortal;
                                if (portal.customPortal === undefined || portal.customPortal == null)
                                    portal.customPortal = false;
                            }

                            if (jsonObj.items[i].alias && jsonObj.items[i].alias != "" && jsonObj.items[i].alias != null) {
                                (item).text = jsonObj.items[i].alias;
                                (item).alias = jsonObj.items[i].alias;
                            }

                            if (addSceneAssets) {
                                var project = Animate.User.getSingleton().project;
                                var ii = (item).portals.length;
                                while (ii--) {
                                    if ((item).portals[ii].type == Animate.PortalType.PARAMETER && (item).portals[ii].dataType == Animate.ParameterType.ASSET && (item).portals[ii].value != null && (item).portals[ii].value != "") {
                                        var asset = project.getAsset((item).portals[ii].value.split(":")[0]);

                                        if (asset) {
                                            if (this._sceneAssets[asset.id])
                                                this._sceneAssets[asset.id] = this._sceneAssets[asset.id] + 1;
else {
                                                this._sceneAssets[asset.id] = 1;
                                                Animate.PluginManager.getSingleton().assetAddedToContainer(asset, this._behaviourContainer);
                                            }
                                        }
                                    }
                                }
                            }
                        }

                        if (item instanceof Animate.Behaviour)
                            (item).updateDimensions();
                    }
                }
            }

            //Link any shortcut nodes
            var li = this.children.length;
            while (li--) {
                var ii = shortcuts.length;
                while (ii--)
                    if (this.children[li].savedID == shortcuts[ii].datum.behaviourID) {
                        shortcuts[ii].item.setOriginalNode(this.children[li], false);
                    }
            }

            //Now do each of the links
            var llen = links.length;
            for (var li = 0; li < llen; li++) {
                var link = links[li];

                //We need to find the nodes first
                var len = this.children.length;
                for (var ii = 0; ii < len; ii++) {
                    if (link.tag.startBehaviourID == (this.children[ii]).savedID) {
                        var behaviour = (this.children[ii]);
                        link.tag.startBehaviour = behaviour;

                        for (var iii = 0; iii < behaviour.portals.length; iii++) {
                            var portal = behaviour.portals[iii];
                            if (link.tag.startPortalName == portal.name) {
                                link.startPortal = portal;
                                link.tag.startBehaviour = null;
                                portal.addLink(link);

                                break;
                            }
                        }
                    }

                    if (link.tag.endBehaviourID == this.children[ii].savedID) {
                        var behaviour = (this.children[ii]);
                        link.tag.endBehaviour = behaviour;

                        for (var iii = 0; iii < behaviour.portals.length; iii++) {
                            var portal = behaviour.portals[iii];
                            if (link.tag.endPortalName == portal.name) {
                                link.endPortal = portal;
                                link.tag.endBehaviour = null;
                                portal.addLink(link);
                                break;
                            }
                        }
                    }
                }

                if (link.startPortal == null)
                    link.dispose();
else {
                    if (typeof link.startPortal == "string" || typeof link.endPortal == "string") {
                        link.dispose();
                    } else {
                        link.updatePoints();
                        link.element.css("pointer-events", "");
                    }
                }

                //Clear the temp tag
                link.tag = null;
            }

            if (jsonObj && jsonObj.plugins)
                Animate.PluginManager.getSingleton().openContainer(jsonObj.plugins, this._behaviourContainer);

            this.checkDimensions();
        };

        /**
        * This function is called to make sure the canvas min width and min height variables are set
        */
        Canvas.prototype.checkDimensions = function () {
            //Make sure that the canvas is sized correctly
            var w = 0;
            var h = 0;
            var i = this.children.length;
            var child = null;
            while (i--) {
                child = this.children[i];

                var w2 = child.element.css("left");
                var w2a = w2.split("px");
                var w2n = parseFloat(w2a[0]) + child.element.width() + 5;

                var h2 = child.element.css("top");
                var h2a = h2.split("px");
                var h2n = parseFloat(h2a[0]) + child.element.height() + 5;

                if (w2n > w)
                    w = w2n;
                if (h2n > h)
                    h = h2n;
            }

            var minW = this.element.css("min-width");
            var minT = minW.split("px");
            var minWi = parseFloat(minT[0]);

            var minH = this.element.css("min-height");
            var minHT = minH.split("px");
            var minHi = parseFloat(minHT[0]);

            this.element.css({
                "min-width": (w > minWi ? w : minWi).toString() + "px",
                "min-height": (h > minHi ? h : minHi).toString() + "px"
            });
        };

        /**
        * This function is called when animate is writing data to the database.
        * @param {any} items The items we need to build
        */
        Canvas.prototype.buildDataObject = function (items) {
            if (typeof items === "undefined") { items = null; }
            var data = {};
            data.name = this._behaviourContainer.name;
            data.items = {};
            data.properties = this._behaviourContainer.properties.tokenize();

            if (items == null)
                items = this.children;

            //Let the plugins save their data
            data.plugins = {};
            Animate.PluginManager.getSingleton().saveContainer(data.plugins, this._behaviourContainer, this._sceneAssets);

            //Create a multidimension array and pass each of the project dependencies
            var len = items.length;
            for (var i = 0; i < len; i++) {
                //First export all the standard item data
                data.items[i] = {};
                data.items[i].id = items[i].id;
                data.items[i].type = (items[i]).constructor.name;
                data.items[i].left = items[i].element.css("left");
                data.items[i].top = items[i].element.css("top");

                //data.items[i].width = items[i].element.css( "width" );
                //data.items[i].height = items[i].element.css( "height" );
                data.items[i].zIndex = items[i].element.css("z-index");
                data.items[i].position = items[i].element.css("position");

                if (items[i] instanceof Animate.Behaviour) {
                    if (items[i] instanceof Animate.BehaviourComment)
                        data.items[i].text = (items[i]).text;
else {
                        data.items[i].name = (items[i]).text;
                        data.items[i].alias = ((items[i]).alias ? (items[i]).alias : "");
                    }

                    if (items[i] instanceof Animate.BehaviourAsset)
                        data.items[i].assetID = ((items[i]).asset ? (items[i]).asset.id : "");
else if (items[i] instanceof Animate.BehaviourScript) {
                        //First initialize the script node to make sure we have a DB entry
                        (items[i]).initializeDB();
                        if ((items[i]).databaseID == null)
                            continue;
                        data.items[i].databaseID = (items[i]).databaseID;
                    } else if (items[i] instanceof Animate.BehaviourShortcut) {
                        data.items[i].behaviourID = ((items[i]).originalNode ? (items[i]).originalNode.id : "");
                    } else if (items[i] instanceof Animate.BehaviourInstance)
                        data.items[i].behaviourID = ((items[i]).behaviourContainer ? (items[i]).behaviourContainer.id : "");

                    if (items[i] instanceof Animate.BehaviourPortal) {
                        data.items[i].portalType = (items[i]).portaltype.toString();
                        data.items[i].dataType = (items[i]).dataType.toString();
                        data.items[i].value = (items[i]).value;
                    } else {
                        data.items[i].portals = new Array();
                        var portalsArr = data.items[i].portals;

                        var len2 = (items[i]).portals.length;
                        for (var ii = 0; ii < len2; ii++) {
                            portalsArr[ii] = {};

                            portalsArr[ii]["name"] = (items[i]).portals[ii].name;
                            portalsArr[ii]["value"] = (items[i]).portals[ii].value;
                            portalsArr[ii]["type"] = (items[i]).portals[ii].type.toString();
                            portalsArr[ii]["dataType"] = (items[i]).portals[ii].dataType.toString();
                            portalsArr[ii]["customPortal"] = (items[i]).portals[ii].customPortal;
                        }
                    }
                } else if (items[i] instanceof Animate.Link) {
                    var sbehaviour = (items[i]).startPortal.parent;
                    var ebehaviour = (items[i]).endPortal.parent;

                    data.items[i].frameDelay = (items[i]).frameDelay;
                    data.items[i].startPortal = (items[i]).startPortal.name;
                    data.items[i].endPortal = (items[i]).endPortal.name;
                    data.items[i].startBehaviour = sbehaviour.id;
                    data.items[i].endBehaviour = ebehaviour.id;

                    //Create additional data for shortcuts
                    data.items[i].targetStartBehaviour = (sbehaviour instanceof Animate.BehaviourShortcut ? (sbehaviour).originalNode.id : sbehaviour.id);
                    data.items[i].targetEndBehaviour = (ebehaviour instanceof Animate.BehaviourShortcut ? (ebehaviour).originalNode.id : ebehaviour.id);
                }
            }

            return data;
        };

        Object.defineProperty(Canvas.prototype, "behaviourContainer", {
            get: function () {
                return this._behaviourContainer;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Canvas.prototype, "sceneAssets", {
            get: function () {
                return this._sceneAssets;
            },
            enumerable: true,
            configurable: true
        });
        Canvas.lastSelectedItem = null;
        Canvas.snapping = false;
        return Canvas;
    })(Animate.Component);
    Animate.Canvas = Canvas;
})(Animate || (Animate = {}));
//# sourceMappingURL=Canvas.js.map
