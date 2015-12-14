module Animate
{
	//export class PropertyGridEvents extends ENUM
	//{
	//	constructor(v: string) { super(v); }

	//	static PROPERTY_EDITED: PropertyGridEvents = new PropertyGridEvents("property_grid_edited");
	//}

	/**
	* A specialised event class for the property grid
	*/
	export class PropertyGridEvent extends Event
	{
		public prop: Prop<any>;
        public id: any;

		constructor( eventName: string, id: any, prop: any)
		{
			super( eventName );

            this.prop = prop;
			this.id = id;
		}
	}

	/**
	* A small holder class for the property grid
	*/
	class EditorElement
	{
		public html: JQuery;
		public name: string;
		public originalValue: any;
		public originalType: ParameterType;
		public editor: PropertyGridEditor;

		constructor( html: JQuery, name: string, originalValue: any, originalType: ParameterType, editor: PropertyGridEditor )
		{
			this.html = html;
			this.name = name;
			this.originalValue = originalValue;
			this.editor = editor;
		}
	}

	

	

	/**
	* A Component that you can use to edit objects. The Property grid will fill itself with Components you can use to edit a given object.
	* Each time the object is modified a <PropertyGrid.PROPERTY_EDITED> events are sent to listeners.
	*/
	export class PropertyGrid extends Component implements IDockItem
	{
		private static _singleton: PropertyGrid;

		private _header: JQuery;
		private _editors: Array<PropertyGridEditor>;
		private _editorElements: Array<EditorElement>;
		private _idObject: string;
		private _docker: Docker;
		private _groups: Array<PropertyGridGroup>;
		private _endDiv: JQuery;
		private _editableObject: EditableSet;
		private _targetPanel: JQuery;
		private _activePanel: JQuery;

		constructor( parent : Component )
		{
			if ( PropertyGrid._singleton != null )
				throw new Error( "PropertyGrid is a singleton, you need to call the PropertyGrid.getSingleton() function to get its instance." );

			PropertyGrid._singleton = this;

			// Call super-class constructor
			super( "<div class='property-grid'></div>", parent );

            this._header = jQuery( "<div class='property-grid-header background-dark'>Select an Object</div>" );
			this.element.append( this._header );

			//Private vars
			this._editors = [];
			this._editorElements = [];
			this._idObject = null;
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
			this.addEditor( new PropOptionsWindow( this ) );

			this._endDiv = jQuery( "<div class='fix' style='height:1px' ></div>" );
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
		scroll( e )
		{
			this._targetPanel.scrollLeft( this._activePanel.scrollLeft() );
			this._targetPanel.scrollTop( this._activePanel.scrollTop() );
		}

		/**
		* This function is used to update a property value in the property grid.
		* @param {string} name The name of the property
		* @param {any} value The new value of the property
		*/
		updateProperty( name : string, value : any )
		{
			var i = this._editorElements.length;
			while ( i-- )
			{
				if ( this._editorElements[i].name == name )
				{
					if ( this._editorElements[i].editor.update )
						this._editorElements[i].editor.update( value, this._editorElements[i].html );

					return;
				}
			}
		}

		/**
		* Sets the object we are going to edit.
		* @param {EditableSet} object The object we are editing. You should ideally create a new object {}, and then 
		* use the function pGridEditble to create valid property grid variables.
		* @param {string} name The name of the object we are editing
		* @param {string} id You can give an ID to help identify this item once its edited.
		* @param {string} img An optional image string
		* @returns {any} Returns the object we are currently editing
		*/
		editableObject( object: EditableSet, name: string, id: any = object, img : string = "" )
		{
			if ( !this.enabled )
				return;

			if (object !== undefined && object != null )
			{
				this._idObject = id;
				this._header.html( ( img && img != "" ? "<img src='" + img + "' />" : "" ) + name );

				//Remove all previous labels and HTML elements.
				var ie = this._editorElements.length;
				while ( ie-- )
					jQuery( this._editorElements[ie].html ).remove();

				this._editorElements.splice( 0, this._editorElements.length );

				//Cleanup editors
				ie = this._editors.length;
				while ( ie-- )
					this._editors[ie].cleanup();

				//Cleanup groups
				var ig = this._groups.length;
				while ( ig-- )
				{
					this.removeChild( this._groups[ig] );
					this._groups[ig].dispose();
				}

				this._groups = [];
				var sortable: Array<{ name: string; group: PropertyGridGroup; editor: PropertyGridEditor; divs: JQuery; category: string; }> = [];

				//Set the editable
				this._editableObject = object;

				var variables:Array<Prop> = object.variables;
				var len = variables.length;
				for ( var i = 0; i < len; i++ )
				{
					var editors :Array<PropertyGridEditor> = this._editors;
					var editor = editors.length;
					while ( editor-- )
					{
						if ( variables[i].type == ParameterType.HIDDEN || variables[i].type == ParameterType.HIDDEN_FILE )
							continue;

						var editorHTML: JQuery = editors[editor].edit( variables[i].name, variables[i].value, variables[i].type, variables[i].options );
						if ( editorHTML != null )
						{
							if ( variables[i].category == null || variables[i].category == "" )
								variables[i].category = "General Properties";

							//First check if the group exists
							var groupI = this._groups.length;
							var groupComp: PropertyGridGroup = null;
							while ( groupI-- )
								if ( this._groups[groupI].name == variables[i].category )
								{
									groupComp = this._groups[groupI];
									break;
								}

							//If no group exists - then add it
							if ( groupComp == null )
							{
								groupComp = new PropertyGridGroup( variables[i].category );
								this._groups.push( groupComp );
							}

							sortable.push({ name: variables[i].name, group: groupComp, editor: editors[editor], divs: editorHTML, category: variables[i].category });

							//editors[editor].grid = this;
							//editors[editor].propUpdated = this.propUpdated;
							var elm: EditorElement = new EditorElement(editorHTML, variables[i].name, variables[i].value, variables[i].type, editors[editor]);
							this._editorElements.push(elm);

							break;
						}
					}
				}

				//Sort by the groups first
				sortable.sort( function ( a, b )
				{
					var textA = a.group.name.toUpperCase();
					var textB = b.group.name.toUpperCase();
					return ( textA > textB ) ? -1 : ( textA < textB ) ? 1 : 0;
				});

				//Finall add the elements to the DOM
				var i = sortable.length;
				while ( i-- )
				{
					if ( sortable[i].group.parent == null )
						this.addChild( sortable[i].group );
				}

				//Just add the fix after each group
				this._endDiv.detach();
				this.element.append( this._endDiv );

				//Now sort each of the sub properties
				sortable.sort( function ( a, b )
				{
					var textA = a.name.toUpperCase();
					var textB = b.name.toUpperCase();
					return ( textA > textB ) ? -1 : ( textA < textB ) ? 1 : 0;
				});

				//Finall add the sub elements to the DOM
				i = sortable.length;
				while ( i-- )
					sortable[i].group.content.append( sortable[i].divs );

				//Finally notify all editors they have been added
				i = sortable.length;
				while ( i-- )
					sortable[i].editor.onAddedToDom();
			}
			else
			{
				this._header.html( "Please select an object." );

				//Remove all previous labels and HTML elements.
				var i = this._editorElements.length;
				while ( i-- )
				{
					jQuery( this._editorElements[i].html ).remove();
				}

				this._editorElements.splice( 0, this._editorElements.length );

				//Cleanup editors
				i = this._editors.length;
				while ( i-- )
					this._editors[i].cleanup();

				//Cleanup groups
				i = this._groups.length;
				while ( i-- )
				{
					this.removeChild( this._groups[i] );
					this._groups[i].dispose();
				}

				this._groups = [];

				//Set the editable
				this._editableObject = null;
			}

			return this._editableObject;
		}

		/**
		* Called when a property has been updated. This will inturn get the event <PropertyGrid.PROPERTY_EDITED> dispatched.
		* @param <string> name The name of the property
		* @param <object> value The new value of the property
		* @param <string> type The propert type
		*/
		propUpdated( name : string, value : any, type : ParameterType )
		{
			//dispatches the grid event
			this.emit( new PropertyGridEvent( PropertyGridEvents.PROPERTY_EDITED, name, this._idObject, value, type ));
		}

		/**
		* called when we reset the project
		* @returns <object> 
		*/
		projectReset()
		{
			this.editableObject( null, "", "", "" );
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
			this._editableObject = null;

			//Call super
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


		get currentObject(): any { return this._editableObject; }
		get idObject(): any { return this._idObject; }
	}
}