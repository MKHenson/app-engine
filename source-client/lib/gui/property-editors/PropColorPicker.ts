module Animate
{
	class PropColorPair
	{
		public id: string;
		public color: string;

		constructor( id : string, color:string )
		{
			this.id = id;
			this.color = color;
		}
	}

	/**
	* This editor is used to pick colours from a colour dialogue.
	*/
	export class PropColorPicker extends PropertyGridEditor
	{
		private mIDs: Array<PropColorPair>;

		constructor( grid: PropertyGrid )
		{
			super( grid );
			this.mIDs = [];
		}

		/**
		* Called when a property grid is editing an object. The property name, value and type are passed.
		* If this editor can edit the property it returns a valid JQuery object which is responsible for editing
		* the object. The property grid makes no effort to maintain this. It is up to the Editor to watch the JQuery through
		* events to see when its been interacted with. Once its been edited, the editor must notify the grid - to do this
		* call the notify method.
		* @param {string} propertyName The name of the property we are creating an HTML element for
		* @param {any} propertyValue The current value of that property
		* @param {ParameterType} objectType The type of property we need to create
		* @param {any} options Any options associated with the parameter
		* @returns {JQuery} A valid jQuery object or null if this editor does not support this property.
		*/
		edit( propertyName: string, propertyValue: any, objectType: ParameterType, options: any ): JQuery
		{
			if ( objectType != ParameterType.COLOR )
				return null;


			//var parts = propertyValue.split( ":" );
			var color = propertyValue.color;
			var alpha = parseFloat( propertyValue.opacity );

			var _id1 = "c" + Component.idCounter;
			Component.idCounter++;
			var _id2 = "c" + Component.idCounter;
			Component.idCounter++;

			this.mIDs.push( new PropColorPair( _id1, color ));
			
			//Create HTML	
			var editor: JQuery =
				this.createEditorJQuery( propertyName, "<div style='width:100%; height:20px; background:url(media/map-opacity.png);' ><input style='width:80%; opacity:"+ alpha +";' class='color PropTextbox' id = '"+ _id1 +"' value = '"+color+"' ></input><input id='"+ _id2 +"' class='PropTextbox' style='width:20%;' value='"+ alpha +"'></input></div>", propertyValue );


			var that = this;

			//Functions to deal with user interactions with JQuery
            var onValueEdited = function (e: JQueryEventObject ) 
			{
				var col = jQuery( "#" + _id1 ).val();
				var alpha = jQuery( "#" + _id2 ).val();
				jQuery( "#" + _id1 ).css( "opacity", alpha );
				that.notify( propertyName, { color: col, opacity : alpha }, objectType );
			};
			
			//Add listeners
            var input: JQuery = jQuery("#" + _id2, editor);
            input.on("keyup", onValueEdited);
			jQuery( "#" + _id1, editor ).on( "change", onValueEdited );
			editor.on( "mouseup", onValueEdited );

			//Finall return editor as HTML to be added to the page
			return editor;
		}

		/**
		* Called when the editor is being added to the DOM
		*/
		onAddedToDom()
		{
			var i = this.mIDs.length;
			while ( i-- )
			{
				var color = ( this.mIDs[i] && this.mIDs[i].color ? this.mIDs[i].color.toString() : "ffffff" );
				var myPicker: JSColor = new jscolor.color( document.getElementById( this.mIDs[i].id ), {})
				myPicker.fromString( color )  // now you can access API via 'myPicker' variable
			}

			this.mIDs.splice( 0, this.mIDs.length );
		}
	}
}