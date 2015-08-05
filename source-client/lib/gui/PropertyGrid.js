var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Animate;
(function (Animate) {
    var PropertyGridEvents = (function (_super) {
        __extends(PropertyGridEvents, _super);
        function PropertyGridEvents(v) {
            _super.call(this, v);
        }
        PropertyGridEvents.PROPERTY_EDITED = new PropertyGridEvents("property_grid_edited");
        return PropertyGridEvents;
    })(Animate.ENUM);
    Animate.PropertyGridEvents = PropertyGridEvents;

    /**
    * A specialised event class for the property grid
    */
    var PropertyGridEvent = (function (_super) {
        __extends(PropertyGridEvent, _super);
        function PropertyGridEvent(eventName, propName, id, value, type) {
            _super.call(this, eventName);

            this.propertyName = propName;
            this.id = id;
            this.propertyValue = value;
            this.propertyType = type;
        }
        return PropertyGridEvent;
    })(Animate.Event);
    Animate.PropertyGridEvent = PropertyGridEvent;

    /**
    * A small holder class for the property grid
    */
    var EditorElement = (function () {
        function EditorElement(html, name, originalValue, originalType, editor) {
            this.html = html;
            this.name = name;
            this.originalValue = originalValue;
            this.editor = editor;
        }
        return EditorElement;
    })();

    /**
    * Defines a property grid variable
    */
    var PropertyGridVariable = (function () {
        /**
        * Creates a {PropertyGridSet}
        */
        function PropertyGridVariable(name, value, type, category) {
            this.name = name;
            this.value = value;
            this.type = type;
            this.category = category;
        }
        return PropertyGridVariable;
    })();
    Animate.PropertyGridVariable = PropertyGridVariable;

    /**
    * Defines a set of variables to use in the property grid
    */
    var EditableSet = (function () {
        /**
        * Creates a {PropertyGridSet}
        */
        function EditableSet() {
            this._variables = [];
        }
        /** Adds a variable to the set */
        EditableSet.prototype.addVar = function (name, value, type, category) {
            this._variables.push(new PropertyGridVariable(name, value, type, category));
        };

        /** Gets a variable by name */
        EditableSet.prototype.getVar = function (name) {
            var items = this._variables;
            var i = items.length;
            while (i--)
                if (items[i].name == name)
                    return items[i];

            return null;
        };

        /** Removes a variable */
        EditableSet.prototype.removeVar = function (variable) {
            var items = this._variables;
            var i = items.length;
            while (i--)
                if (items[i] == variable)
                    items.splice(i, 1);

            return null;
        };

        /**Updates a variable with a new value */
        EditableSet.prototype.updateValue = function (name, value) {
            var len = this._variables.length;
            for (var i = 0; i < len; i++)
                if (this._variables[i].name == name) {
                    this._variables[i].value = value;
                    return;
                }
        };

        EditableSet.prototype.tokenize = function () {
            //val[i].name, val[i].value, ParameterType.fromString( val[i].type ), val[i].category
            var toRet = {};
            var items = this._variables;
            var len = items.length;
            for (var i = 0; i < len; i++) {
                toRet[i] = {};
                toRet[i].name = items[i].name;
                toRet[i].category = items[i].category;
                toRet[i].value = items[i].value;
                toRet[i].type = items[i].type.toString();
            }

            return toRet;
        };

        Object.defineProperty(EditableSet.prototype, "variables", {
            get: function () {
                return this._variables;
            },
            enumerable: true,
            configurable: true
        });
        return EditableSet;
    })();
    Animate.EditableSet = EditableSet;

    /**
    * A Component that you can use to edit objects. The Property grid will fill itself with Components you can use to edit a given object.
    * Each time the object is modified a <PropertyGrid.PROPERTY_EDITED> events are sent to listeners.
    */
    var PropertyGrid = (function (_super) {
        __extends(PropertyGrid, _super);
        function PropertyGrid(parent) {
            if (PropertyGrid._singleton != null)
                throw new Error("PropertyGrid is a singleton, you need to call the PropertyGrid.getSingleton() function to get its instance.");

            PropertyGrid._singleton = this;

            // Call super-class constructor
            _super.call(this, "<div class='property-grid'></div>", parent);

            this.header = jQuery("<div class='property-grid-header'>Select an Object</div>");
            this.element.append(this.header);

            //Private vars
            this.mEditors = [];
            this.mEditorElements = [];
            this.objID = null;
            this.mDocker = null;
            this.mGroups = [];

            this.addEditor(new Animate.PropTextbox(this));
            this.addEditor(new Animate.PropComboBool(this));
            this.addEditor(new Animate.PropComboEnum(this));
            this.addEditor(new Animate.PropComboGroup(this));
            this.addEditor(new Animate.PropComboAsset(this));
            this.addEditor(new Animate.PropColorPicker(this));
            this.addEditor(new Animate.PropFile(this));

            this.endDiv = jQuery("<div class='fix' style='height:1px' ></div>");
        }
        /**
        * This is called by a controlling ScreenManager class. An image string needs to be returned
        * which will act as a preview of the component that is being viewed or hidden.
        * @returns <string> The image url
        */
        PropertyGrid.prototype.getPreviewImage = function () {
            return "media/spanner.png";
        };

        /**
        * Each IDock item needs to implement this so that we can keep track of where it moves.
        */
        PropertyGrid.prototype.getDocker = function () {
            return this.mDocker;
        };

        /**
        * Each IDock item needs to implement this so that we can keep track of where it moves.
        * @param <object> val
        */
        PropertyGrid.prototype.setDocker = function (val) {
            this.mDocker = val;
        };

        /**
        * This is called by a controlling Docker class when the component needs to be shown.
        */
        PropertyGrid.prototype.onShow = function () {
        };

        /**
        * This is called by a controlling Docker class when the component needs to be hidden.
        */
        PropertyGrid.prototype.onHide = function () {
        };

        /**
        * When we scroll on either of the scroll panel's we do the same to the other.
        * @param <jQuery> e The jQuery event object
        */
        PropertyGrid.prototype.scroll = function (e) {
            this.targetPanel.scrollLeft(this.activePanel.scrollLeft());
            this.targetPanel.scrollTop(this.activePanel.scrollTop());
        };

        /**
        * This function is used to update a property value in the property grid.
        * @param {string} name The name of the property
        * @param {any} value The new value of the property
        */
        PropertyGrid.prototype.updateProperty = function (name, value) {
            var i = this.mEditorElements.length;
            while (i--) {
                if (this.mEditorElements[i].name == name) {
                    if (this.mEditorElements[i].editor.update)
                        this.mEditorElements[i].editor.update(value, this.mEditorElements[i].html);

                    return;
                }
            }
        };

        /**
        * Sets the object we are going to edit.
        * @param {EditableSet} object The object we are editing. You should ideally create a new object {}, and then
        * use the function pGridEditble to create valid property grid variables.
        * @param {string} name The name of the object we are editing
        * @param {string} id You can give an ID to help identify this item once its edited.
        * @param {string} img An optional image string
        * @returns {any} Returns the object we are currently editing
        */
        PropertyGrid.prototype.editableObject = function (object, name, id, img) {
            if (!this.enabled)
                return;

            if (object !== undefined && object != null) {
                this.objID = id;

                //this.headerPanel.caption( name );
                this.header.html((img && img != "" ? "<img src='" + img + "' />" : "") + name);

                //Remove all previous labels and HTML elements.
                var ie = this.mEditorElements.length;
                while (ie--)
                    jQuery(this.mEditorElements[ie].html).remove();

                this.mEditorElements.splice(0, this.mEditorElements.length);

                //Cleanup editors
                ie = this.mEditors.length;
                while (ie--)
                    this.mEditors[ie].cleanup();

                //Cleanup groups
                var ig = this.mGroups.length;
                while (ig--) {
                    this.removeChild(this.mGroups[ig]);
                    this.mGroups[ig].dispose();
                }

                this.mGroups = [];
                var sortable = [];

                //Set the editable
                this.mEditableObject = object;

                var variables = object.variables;
                var len = variables.length;
                for (var i = 0; i < len; i++) {
                    var editors = this.mEditors;
                    var editor = editors.length;
                    while (editor--) {
                        if (variables[i].type == Animate.ParameterType.HIDDEN)
                            continue;

                        var editorHTML = editors[editor].edit(variables[i].name, variables[i].value, variables[i].type);
                        if (editorHTML != null) {
                            if (variables[i].category == null || variables[i].category == "")
                                variables[i].category = "General Properties";

                            //First check if the group exists
                            var groupI = this.mGroups.length;
                            var groupComp = null;
                            while (groupI--)
                                if (this.mGroups[groupI].name == variables[i].category) {
                                    groupComp = this.mGroups[groupI];
                                    break;
                                }

                            if (groupComp == null) {
                                groupComp = new Animate.PropertyGridGroup(variables[i].category);
                                this.mGroups.push(groupComp);
                            }

                            sortable.push({ name: variables[i].name, group: groupComp, editor: editors[editor], divs: editorHTML, category: variables[i].category });

                            //editors[editor].grid = this;
                            //editors[editor].propUpdated = this.propUpdated;
                            var elm = new EditorElement(editorHTML, variables[i].name, variables[i].value, variables[i].type, editors[editor]);
                            this.mEditorElements.push(elm);

                            break;
                        }
                    }
                }

                //Sort by the groups first
                sortable.sort(function (a, b) {
                    var textA = a.group.name.toUpperCase();
                    var textB = b.group.name.toUpperCase();
                    return (textA > textB) ? -1 : (textA < textB) ? 1 : 0;
                });

                //Finall add the elements to the DOM
                var i = sortable.length;
                while (i--) {
                    if (sortable[i].group.parent == null)
                        this.addChild(sortable[i].group);
                }

                //Just add the fix after each group
                this.endDiv.detach();
                this.element.append(this.endDiv);

                //Now sort each of the sub properties
                sortable.sort(function (a, b) {
                    var textA = a.name.toUpperCase();
                    var textB = b.name.toUpperCase();
                    return (textA > textB) ? -1 : (textA < textB) ? 1 : 0;
                });

                //Finall add the sub elements to the DOM
                i = sortable.length;
                while (i--)
                    sortable[i].group.content.append(sortable[i].divs);

                //Finally notify all editors they have been added
                i = sortable.length;
                while (i--)
                    sortable[i].editor.onAddedToDom();
            } else {
                this.header.html("Please select an object.");

                //Remove all previous labels and HTML elements.
                var i = this.mEditorElements.length;
                while (i--) {
                    jQuery(this.mEditorElements[i].html).remove();
                }

                this.mEditorElements.splice(0, this.mEditorElements.length);

                //Cleanup editors
                i = this.mEditors.length;
                while (i--)
                    this.mEditors[i].cleanup();

                //Cleanup groups
                i = this.mGroups.length;
                while (i--) {
                    this.removeChild(this.mGroups[i]);
                    this.mGroups[i].dispose();
                }

                this.mGroups = [];

                //Set the editable
                this.mEditableObject = null;
            }

            return this.mEditableObject;
        };

        /**
        * Called when a property has been updated. This will inturn get the event <PropertyGrid.PROPERTY_EDITED> dispatched.
        * @param <string> name The name of the property
        * @param <object> value The new value of the property
        * @param <string> type The propert type
        */
        PropertyGrid.prototype.propUpdated = function (name, value, type) {
            /** Gets the singleton instance. */
            this.dispatchEvent(new PropertyGridEvent(PropertyGridEvents.PROPERTY_EDITED, name, this.objID, value, type));
        };

        /**
        * called when we reset the project
        * @returns <object>
        */
        PropertyGrid.prototype.projectReset = function () {
            this.editableObject(null, "", "", "");
        };

        /**
        * Add a new editor to the property grid.
        * @param {PropertyGridEditor} editor The PropertyGridEditor object to add
        * @returns {PropertyGridEditor}
        */
        PropertyGrid.prototype.addEditor = function (editor) {
            this.mEditors.push(editor);

            return editor;
        };

        /**
        * Removes an editor from the property grid.
        * @param {PropertyGridEditor} editor The PropertyGridEditor object to remove.
        * @returns {PropertyGridEditor} The editor or null
        */
        PropertyGrid.prototype.removeEditor = function (editor) {
            if (this.mEditors.indexOf(editor) != -1) {
                this.mEditors.splice(this.mEditors.indexOf(editor), 1);
                return editor;
            }

            return null;
        };

        /**
        * This will cleanup the component.
        */
        PropertyGrid.prototype.dispose = function () {
            this.mEditableObject = null;

            //Call super
            _super.prototype.dispose.call(this);
        };

        PropertyGrid.getSingleton = /**
        * Gets the singleton instance.
        * @returns <PropertyGrid>
        */
        function (parent) {
            if (!PropertyGrid._singleton)
                new PropertyGrid(parent);

            return PropertyGrid._singleton;
        };
        return PropertyGrid;
    })(Animate.Component);
    Animate.PropertyGrid = PropertyGrid;
})(Animate || (Animate = {}));
//# sourceMappingURL=PropertyGrid.js.map
