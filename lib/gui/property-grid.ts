module Animate {
	/**
	* A Component that you can use to edit objects. The Property grid will fill itself with Components you can use to edit a given object.
	* Each time the object is modified a <PropertyGrid.PROPERTY_EDITED> events are sent to listeners.
	*/
	export class PropertyGrid extends Component {
		private static _singleton: PropertyGrid;

		private _header: JQuery;
		private _editors: Array<PropertyGridEditor>;
		//private _docker: Docker;
		private _groups: Array<PropertyGridGroup>;
		private _object: EditableSet;

		constructor( parent : Component ) {
            // Call super-class constructor
			super( "<div class='property-grid'></div>", parent );

			PropertyGrid._singleton = this;

            this._header = jQuery( "<div class='property-grid-header background-dark'>Select an Object</div>" );
			this.element.append( this._header );
			this._editors = [];
			//this._docker = null;
			this._groups = [];

            this.addEditor(new PGTextbox( this ) );
            this.addEditor(new PGNumber( this ) );
            this.addEditor(new PGComboBool( this ) );
            this.addEditor(new PGComboEnum( this ) );
            this.addEditor(new PGComboGroup( this ) );
            this.addEditor(new PGColorPicker(this) );
            this.addEditor(new PGFile( this ) );
            this.addEditor(new PGAssetList( this ) );
			//this.addEditor( new PropOptionsWindow( this ) );
            this.addEditor(new PGComboAsset(this));
		}

		/**
		* This is called by a controlling ScreenManager class. An image string needs to be returned
		* which will act as a preview of the component that is being viewed or hidden.
		* @returns <string> The image url
		*/
		getPreviewImage() :string { return "media/spanner.png"; }

		// /**
		// * Each IDock item needs to implement this so that we can keep track of where it moves.
		// */
		// getDocker(): Docker { return this._docker; }

		// /**
		// * Each IDock item needs to implement this so that we can keep track of where it moves.
		// * @param <object> val
		// */
		// setDocker( val : Docker ) { this._docker = val; }

		/**
		* This is called by a controlling Docker class when the component needs to be shown.
		*/
		onShow() : void { }

		/**
		* This is called by a controlling Docker class when the component needs to be hidden.
		*/
		onHide(): void { }

        /**
        * Cleans up the groups and editors
        */
        cleanup() {
            // Cleanup editors
            for (var i = 0, l = this._editors.length; i < l; i++)
                this._editors[i].cleanup();

            // Cleanup groups
            for (var i = 0, l = this._groups.length; i < l; i++) {
                this.removeChild(this._groups[i]);
                this._groups[i].dispose();
            }

            this._groups = [];
        }

		/**
		* Sets the object we are going to edit.
		* @param {EditableSet} object The object we are editing. You should ideally create a new object {}, and then
		* use the function pGridEditble to create valid property grid variables.
		* @param {string} name The name of the object we are editing
		* @param {string} img An optional image string
		* @returns {any} Returns the object we are currently editing
		*/
		editableObject( object: EditableSet, name: string, img : string = "" ) {
			if ( !this.enabled )
                return;

            // Cleanup
            this.cleanup();

			if (object !== undefined && object != null ) {
                // Set the header
                this._header.html((img && img != "" ? "<img src='" + img + "' />" : "") + name);

                var sortable: Array<{ group: PropertyGridGroup; prop: Prop<any>; }> = [];

				// Set the editable
                this._object = object;
                var groups = this._groups;
                var variables: Array<Prop<any>> = object.variables;

                // Go through each of the variables and create the group containers
                for (var i = 0; i < variables.length; i++) {
                    var property = variables[i];

                    // Check if a group exists
                    var pGroup: PropertyGridGroup = null;
                    for (var gi = 0, gl = groups.length; gi < gl; gi++)
                        if (groups[gi].name == property.category) {
                            pGroup = groups[gi];
                            break;
                        }

                    // If no group exists - then add it
                    if (pGroup == null) {
                        pGroup = new PropertyGridGroup(property.category);
                        groups.push(pGroup);
                    }

                    sortable.push({ prop: property, group: pGroup });
                }

                // Sort by the groups by name
                sortable.sort(function (a, b) {
                    var textA = a.group.name.toUpperCase();
                    var textB = b.group.name.toUpperCase();
                    return (textA > textB) ? -1 : (textA < textB) ? 1 : 0;
                });

                // Add the groups to the DOM
                for (var i = 0; i < sortable.length; i++)
                    if (!sortable[i].group.parent)
                        this.addChild(sortable[i].group);

                // Now sort each of the variables by name
                sortable.sort(function (a, b) {
                    var textA = a.prop.name.toUpperCase();
                    var textB = b.prop.name.toUpperCase();
                    return (textA > textB) ? 1 : (textA < textB) ? -1 : 0;
                });

                for (var i = 0; i < sortable.length; i++) {
					var editors :Array<PropertyGridEditor> = this._editors;
                    for (var editor = 0, el = editors.length; editor < el; editor++ ) {
                        if (sortable[i].prop.type == PropertyType.HIDDEN || sortable[i].prop.type == PropertyType.HIDDEN_FILE)
                            continue;

                        if (!editors[editor].canEdit(sortable[i].prop))
                            continue;

                        var editorContainer = new Component("<div class='editor-container'></div>");
                        sortable[i].group.addChild(editorContainer);
                        editors[editor].edit(sortable[i].prop, editorContainer);
					}
				}
			}
			else {
				this._header.html( "Please select an object." );

				// Set the editable
				this._object = null;
			}

			return this._object;
		}

		///**
		//* Called when a property has been updated. This will inturn get the event <PropertyGrid.PROPERTY_EDITED> dispatched.
		//* @param {Prop<any>} prop
		//*/
  //      propUpdated(prop: Prop<any> )
		//{
		//	// dispatches the grid event
  //          var event = new PropertyGridEvent(this._object, prop);
  //          this._object.parent.emit(event);
  //          this.emit(event);
		//}

		/**
		* called when we reset the project
		* @returns <object>
		*/
		projectReset() {
			this.editableObject( null, "", "" );
		}

		/**
		* Add a new editor to the property grid.
		* @param {PropertyGridEditor} editor The PropertyGridEditor object to add
		* @returns {PropertyGridEditor}
		*/
		addEditor(editor: PropertyGridEditor) {
			this._editors.push( editor );

			return editor;
		}

		/**
		* Removes an editor from the property grid.
		* @param {PropertyGridEditor} editor The PropertyGridEditor object to remove.
		* @returns {PropertyGridEditor} The editor or null
		*/
		removeEditor(editor: PropertyGridEditor ) {
			if ( this._editors.indexOf( editor ) != -1 ) {
				this._editors.splice( this._editors.indexOf( editor ), 1 );
				return editor;
			}

			return null;
		}

		/**
		* This will cleanup the component.
		*/
		dispose() {
			this._object = null;

			// Call super
			super.dispose();
		}

		/**
		* Gets the singleton instance.
		* @returns <PropertyGrid>
		*/
		static getSingleton( parent? : Component ) : PropertyGrid {
			if ( !PropertyGrid._singleton )
				new PropertyGrid( parent );

			return PropertyGrid._singleton;
		}


		get currentObject(): any { return this._object; }
	}
}