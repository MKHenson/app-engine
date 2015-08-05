var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Animate;
(function (Animate) {
    /**
    * A behaviour node that represents a Behaviour Container
    */
    var BehaviourInstance = (function (_super) {
        __extends(BehaviourInstance, _super);
        function BehaviourInstance(parent, behaviourContainer, createPotrals) {
            if (typeof createPotrals === "undefined") { createPotrals = true; }
            var text = (behaviourContainer.name !== undefined ? behaviourContainer.name : "Instance");

            this._behaviourContainer = behaviourContainer;

            // Call super-class constructor
            _super.call(this, parent, text);

            //this.element.removeClass("behaviour");
            this.element.addClass("behaviour-instance");

            if (createPotrals) {
                if (this._behaviourContainer.canvas) {
                    var children = this._behaviourContainer.canvas.children;
                    var ci = children.length;
                    while (ci--)
                        if (children[ci] instanceof Animate.BehaviourPortal) {
                            var portals = (children[ci]).portals;
                            var ii = portals.length;

                            while (ii--)
                                this.addPortal((children[ci]).portaltype, portals[ii].name, portals[ii].value, portals[ii].dataType);
                        }
                } else if (this._behaviourContainer.json != null && this._behaviourContainer.json != "") {
                    //Parse the saved object and get the portal data
                    var jsonObj = JSON.parse(this._behaviourContainer.json);

                    if (jsonObj && jsonObj.items) {
                        for (var i in jsonObj.items) {
                            var item = null;

                            if (jsonObj.items[i].type == "BehaviourPortal") {
                                this.addPortal(jsonObj.items[i].portalType, jsonObj.items[i].name, jsonObj.items[i].value, jsonObj.items[i].dataType);
                            }
                        }
                    }
                }
            }

            Animate.PluginManager.getSingleton().addEventListener(Animate.PluginPortalEvents.PORTAL_ADDED, this.onPortalChanged, this);
            Animate.PluginManager.getSingleton().addEventListener(Animate.PluginPortalEvents.PORTAL_REMOVED, this.onPortalChanged, this);
            Animate.PluginManager.getSingleton().addEventListener(Animate.PluginPortalEvents.PORTAL_EDITED, this.onPortalChanged, this);
            Animate.PluginManager.getSingleton().addEventListener(Animate.PluginContainerEvents.CONTAINER_DELETED, this.onContainerDeleted, this);
        }
        /**
        * Called when a behaviour is disposed
        */
        BehaviourInstance.prototype.onContainerDeleted = function (response, event) {
            if (event.container.name == this._behaviourContainer.name) {
                var parent = this.element.parent().data("component");
                if (parent && parent.removeItem)
                    parent.removeItem(this);
            }
        };

        /**
        * This is called when a Canvas reports a portal being added, removed or modified.
        */
        BehaviourInstance.prototype.onPortalChanged = function (response, event) {
            var curParent = this.element.parent();

            if (response == Animate.PluginPortalEvents.PORTAL_ADDED) {
                jQuery("body").append(this.element);
                var type = null;
                if (event.portal.type == Animate.PortalType.INPUT)
                    type = Animate.PortalType.OUTPUT;
else if (event.portal.type == Animate.PortalType.OUTPUT)
                    type = Animate.PortalType.INPUT;
else if (event.portal.type == Animate.PortalType.PARAMETER)
                    type = Animate.PortalType.PRODUCT;
else if (event.portal.type == Animate.PortalType.PRODUCT)
                    type = Animate.PortalType.PARAMETER;

                if (event.container.name == this._behaviourContainer.name)
                    this.addPortal(type, event.portal.name, event.portal.value, event.portal.dataType);
            } else if (response == Animate.PluginPortalEvents.PORTAL_REMOVED) {
                var i = this.portals.length;
                while (i--) {
                    if (this.portals[i].name == event.portal.name) {
                        this.removePortal(this.portals[i], true);
                        break;
                    }
                }
            } else if (response == Animate.PluginPortalEvents.PORTAL_EDITED) {
                var i = this.portals.length;
                while (i--) {
                    if (this.portals[i].name == event.oldName) {
                        var portal = this.portals[i];
                        portal.edit(event.portal.name, portal.type, event.portal.value, event.portal.dataType);
                        break;
                    }
                }
            }

            jQuery("body").append(this.element);
            this.updateDimensions();
            curParent.append(this.element);
        };

        /**
        * Diposes and cleans up this component and all its child Components
        */
        BehaviourInstance.prototype.dispose = function () {
            Animate.PluginManager.getSingleton().removeEventListener(Animate.PluginPortalEvents.PORTAL_ADDED, this.onPortalChanged, this);
            Animate.PluginManager.getSingleton().removeEventListener(Animate.PluginPortalEvents.PORTAL_REMOVED, this.onPortalChanged, this);
            Animate.PluginManager.getSingleton().removeEventListener(Animate.PluginPortalEvents.PORTAL_EDITED, this.onPortalChanged, this);
            Animate.PluginManager.getSingleton().removeEventListener(Animate.PluginContainerEvents.CONTAINER_DELETED, this.onContainerDeleted, this);

            this._behaviourContainer = null;

            //Call super
            _super.prototype.dispose.call(this);
        };

        Object.defineProperty(BehaviourInstance.prototype, "behaviourContainer", {
            get: function () {
                return this._behaviourContainer;
            },
            enumerable: true,
            configurable: true
        });
        return BehaviourInstance;
    })(Animate.Behaviour);
    Animate.BehaviourInstance = BehaviourInstance;
})(Animate || (Animate = {}));
//# sourceMappingURL=BehaviourInstance.js.map
