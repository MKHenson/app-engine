module Animate
{
	//export class PropertyGridEvents extends ENUM
	//{
	//	constructor(v: string) { super(v); }

	//	static PROPERTY_EDITED: PropertyGridEvents = new PropertyGridEvents("property_grid_edited");
	//}

	///**
	//* A specialised event class for the property grid
	//*/
	//export class PropertyGridEvent 

	//{
 //       public prop: Prop<any>;
 //       public object: EditableSet;

 //       constructor(object: EditableSet, prop: Prop<any>)
	//	{
	//		super( "edited" );

 //           this.prop = prop;
 //           this.object = object;
	//	}
	//}

	///**
	//* A small holder class for the property grid
	//*/
	//class EditorElement
	//{
	//	public html: JQuery;
	//	public name: string;
	//	public originalValue: any;
	//	public editor: PropertyGridEditor;

	//	constructor( html: JQuery, name: string, originalValue: any, editor: PropertyGridEditor )
	//	{
	//		this.html = html;
	//		this.name = name;
	//		this.originalValue = originalValue;
	//		this.editor = editor;
	//	}
	//}

	

	

	/**
	* A Component that you can use to edit objects. The Property grid will fill itself with Components you can use to edit a given object.
	* Each time the object is modified a <PropertyGrid.PROPERTY_EDITED> events are sent to listeners.
	*/
	export class PropertyGrid extends Component implements IDockItem
	{
		private static _singleton: PropertyGrid;

		private _header: JQuery;
		private _editors: Array<PropertyGridEditor>;
		//private _editorElements: Array<EditorElement>;
		private _docker: Docker;
		private _groups: Array<PropertyGridGroup>;
		//private _endDiv: JQuery;
		private _object: EditableSet;
		//private _targetPanel: JQuery;
        //private _activePanel: JQuery;
        
		constructor( parent : Component )
		{
			if ( PropertyGrid._singleton != null )
				throw new Error( "PropertyGrid is a singleton, you need to call the PropertyGrid.getSingleton() function to get its instance." );

			PropertyGrid._singleton = this;

			// Call super-class constructor
			super( "<div class='property-grid'></div>", parent );

            this._header = jQuery( "<div class='property-grid-header background-dark'>Select an Object</div>" );
			this.element.append( this._header );

			// Private vars
			this._editors = [];
			//this._editorElements = [];
			this._docker = null;
			this._groups = [];

			this.addEditor( new PropTextbox( this ) );
			this.addEditor( new PropNumber( this ) );
			this.addEditor( new PropComboBool( this ) );
			this.addEditor( new PropComboEnum( this ) );
			this.addEditor( new PropComboGroup( this ) );
			this.addEditor( new PropComboAsset( this ) );			
			this.addEditor( new PropColorPicker(this) );
			this.addEditor( new PropFile( this ) );
			this.addEditor( new PropAssetList( this ) );
			//this.addEditor( new PropOptionsWindow( this ) );

			//this._endDiv = jQuery( "<div class='fix' style='height:1px' ></div>" );
		}

		/**
		* This is called by a controlling ScreenManager class. An image string needs to be returned
		* which will act as a preview of the component that is being viewed or hidden.
		* @returns <string> The image url
		*/
		getPreviewImage() :string { return "media/spanner.png"; }

		/**
		* Each IDock item needs to implement this so that we can keep track of where it moves.
		*/
		getDocker(): Docker { return this._docker; }

		/**
		* Each IDock item needs to implement this so that we can keep track of where it moves.
		* @param <object> val 
		*/
		setDocker( val : Docker ) { this._docker = val; }

		/**
		* This is called by a controlling Docker class when the component needs to be shown.
		*/
		onShow() : void { }

		/**
		* This is called by a controlling Docker class when the component needs to be hidden.
		*/
		onHide(): void { }

		/**
		* When we scroll on either of the scroll panel's we do the same to the other.
		* @param <jQuery> e The jQuery event object
		*/
		//scroll( e )
		//{
		//	this._targetPanel.scrollLeft( this._activePanel.scrollLeft() );
		//	this._targetPanel.scrollTop( this._activePanel.scrollTop() );
        //}

        /**
        * Cleans up the groups and editors 
        */
        cleanup()
        {
            // Cleanup editors
            for (var i = 0, l = this._editors.length; i < l; i++)
                this._editors[i].cleanup();

            // Cleanup groups
            for (var i = 0, l = this._groups.length; i < l; i++)
            {
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
		editableObject( object: EditableSet, name: string, img : string = "" )
		{
			if ( !this.enabled )
                return;


			if (object !== undefined && object != null )
			{
				this._header.html( ( img && img != "" ? "<img src='" + img + "' />" : "" ) + name );

				// Remove all previous labels and HTML elements.
				//var ie = this._editorElements.length;
				//while ( ie-- )
				//	jQuery( this._editorElements[ie].html ).remove();

				//this._editorElements.splice( 0, this._editorElements.length );

                this.cleanup();
                var sortable: Array<{ group: PropertyGridGroup; prop: Prop<any>; }> = [];

				// Set the editable
                this._object = object;
                
                var variables: Array<Prop<any>> = object.variables;

                // Go through each of the variables and create the group containers
                for (var i = 0; i < variables.length; i++)
                {
                    var property = variables[i];

                    // Check if a group exists
                    var groupComp: PropertyGridGroup = null;
                    for (var gi = 0, gl = this._groups.length; gi < gl; gi++)
                        if (this._groups[gi].name == property.category)
                        {
                            groupComp = this._groups[gi];
                            break;
                        }

                    // If no group exists - then add it
                    if (groupComp == null)
                    {
                        groupComp = new PropertyGridGroup(property.category);
                        this._groups.push(groupComp);
                    }

                    sortable.push({ prop: property, group: groupComp });
                }

                // Sort by the groups by name
                sortable.sort(function (a, b)
                {
                    var textA = a.group.name.toUpperCase();
                    var textB = b.group.name.toUpperCase();
                    return (textA > textB) ? -1 : (textA < textB) ? 1 : 0;
                });

                // Now sort each of the variables by name
                sortable.sort(function (a, b)
                {
                    var textA = a.prop.name.toUpperCase();
                    var textB = b.prop.name.toUpperCase();
                    return (textA > textB) ? -1 : (textA < textB) ? 1 : 0;
                });

                for (var i = 0; i < sortable.length; i++)
				{
					var editors :Array<PropertyGridEditor> = this._editors;
                    for (var editor = 0, el = editors.length; editor < el; el++ )
                    {
                        if (sortable[i].prop.type == PropertyType.HIDDEN || sortable[i].prop.type == PropertyType.HIDDEN_FILE)
							continue;

                        var editorContainer = new Component("<div class='editor-container'></div>");
                        sortable[i].group.addChild(editorContainer);
                        editors[editor].edit(sortable[i].prop, editorContainer);

						//if ( editorHTML != null )
						//{
						//	// First check if the group exists
						//	var groupComp: PropertyGridGroup = null;
      //                      for (var gi = 0, gl = this._groups.length; gi < gl; gi++ )
      //                          if (this._groups[gi].name == variables[i].category )
						//		{
      //                              groupComp = this._groups[gi];
						//			break;
						//		}

						//	// If no group exists - then add it
						//	if ( groupComp == null )
						//	{
						//		groupComp = new PropertyGridGroup( variables[i].category );
						//		this._groups.push( groupComp );
						//	}

						//	sortable.push({ name: variables[i].name, group: groupComp, editor: editors[editor], divs: editorHTML, category: variables[i].category });

      //                      var elm: EditorElement = new EditorElement(editorHTML, variables[i].name, variables[i].getVal(), editors[editor]);
						//	this._editorElements.push(elm);

						//	break;
						//}
					}
				}

				

				//// Finall add the elements to the DOM
				//var i = sortable.length;
				//while ( i-- )
				//{
				//	if ( sortable[i].group.parent == null )
				//		this.addChild( sortable[i].group );
				//}

				// Just add the fix after each group
				//this._endDiv.detach();
				//this.element.append( this._endDiv );

				

				//// Finall add the sub elements to the DOM
				//i = sortable.length;
				//while ( i-- )
				//	sortable[i].group.content.append( sortable[i].divs );

				//// Finally notify all editors they have been added
				//i = sortable.length;
				//while ( i-- )
				//	sortable[i].editor.onAddedToDom();
			}
			else
			{
				this._header.html( "Please select an object." );
                this.cleanup();

				//// Remove all previous labels and HTML elements.
				//var i = this._editorElements.length;
				//while ( i-- )
				//{
				//	jQuery( this._editorElements[i].html ).remove();
				//}

				//this._editorElements.splice( 0, this._editorElements.length );

				//// Cleanup editors
				//i = this._editors.length;
				//while ( i-- )
				//	this._editors[i].cleanup();

				//// Cleanup groups
				//i = this._groups.length;
				//while ( i-- )
				//{
				//	this.removeChild( this._groups[i] );
				//	this._groups[i].dispose();
				//}

				//this._groups = [];

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
		projectReset()
		{
			this.editableObject( null, "", "" );
		}

		/**
		* Add a new editor to the property grid. 
		* @param {PropertyGridEditor} editor The PropertyGridEditor object to add
		* @returns {PropertyGridEditor} 
		*/
		addEditor(editor: PropertyGridEditor)
		{
			this._editors.push( editor );

			return editor;
		}

		/**
		* Removes an editor from the property grid. 
		* @param {PropertyGridEditor} editor The PropertyGridEditor object to remove.
		* @returns {PropertyGridEditor} The editor or null
		*/
		removeEditor(editor: PropertyGridEditor )
		{
			if ( this._editors.indexOf( editor ) != -1 )
			{
				this._editors.splice( this._editors.indexOf( editor ), 1 );
				return editor;
			}

			return null;
		}

		/**
		* This will cleanup the component.
		*/
		dispose()
		{
			this._object = null;

			// Call super
			super.dispose();
		}

		/**
		* Gets the singleton instance. 
		* @returns <PropertyGrid> 
		*/
		static getSingleton( parent? : Component ) : PropertyGrid
		{
			if ( !PropertyGrid._singleton )
				new PropertyGrid( parent );

			return PropertyGrid._singleton;
		}


		get currentObject(): any { return this._object; }
	}
}