module Animate
{
	export class BehaviourPickerEvents extends ENUM
	{
		constructor( v: string ) { super( v ); }

		static BEHAVIOUR_PICKED: BehaviourPickerEvents = new BehaviourPickerEvents("behaviour_picker_picked");
	}

	export class BehaviourPickerEvent extends Event
	{
		public behaviourName: string;

		constructor( eventName: BehaviourPickerEvents, behaviourName: string )
		{
			super( eventName, behaviourName );
			this.behaviourName = behaviourName;
		}
	}

	export class BehaviourPicker extends Window
	{
		private static _singleton: BehaviourPicker;

		private _input: InputBox;
		private _list: List;
		private _X: number;
		private _Y: number;

		constructor()
		{
			if ( BehaviourPicker._singleton != null )
				throw new Error( "The BehaviourPicker class is a singleton. You need to call the BehaviourPicker.get() function." );

			BehaviourPicker._singleton = this;

			// Call super-class constructor
			super( 200, 250 );

            this.element.addClass( "tooltip-text-bg" );
			this.element.addClass( "behaviour-picker" );

            this._input = new InputBox(this.content, "Behaviour Name");
            this._list = new List(this.content );
			this._X = 0;
			this._Y = 0;

			//Hook listeners
			this._list.selectBox.element.on( "click", this.onListClick.bind( this ) );
			this._list.selectBox.element.on( "dblclick", this.onListDClick.bind( this ) );
			this._input.textfield.element.on( "keyup", this.onKeyDown.bind( this ) );
		}

		/**
		* Shows the window by adding it to a parent.
		* @param {Component} parent The parent Component we are adding this window to
		* @param {number} x The x coordinate of the window
		* @param {number} y The y coordinate of the window
		* @param {boolean} isModal Does this window block all other user operations?
		* @param {boolean} isPopup If the window is popup it will close whenever anything outside the window is clicked
		*/
		show( parent: Component = null, x: number = 0, y: number = 0, isModal: boolean = false, isPopup: boolean = false )
		{
			this._list.sort();

			if ( y + this.element.height() > jQuery( "body" ).height() )
				y = jQuery( "body" ).height() - this.element.height();
			if ( x + this.element.width() > jQuery( "body" ).width() )
				x = jQuery( "body" ).width() - this.element.width();

			super.show( parent, x, y, isModal, isPopup );

			this._input.focus(true);
		}

		/**
		* Called when we click the list.
		* @param {any} e 
		* @returns {any} 
		*/
		onListClick( e )
		{
			this._input.text = this._list.selectedItem;
		}

		/**
		* Called when we double click the list.
		* @param {any} e 
		* @returns {any} 
		*/
		onListDClick( e ) 
		{
			this.emit( new BehaviourPickerEvent( BehaviourPickerEvents.BEHAVIOUR_PICKED, this._list.selectedItem ) );
			this.hide();
		}

		/**
		* When the input text changes we go through each list item
		* and select it.
		* @param {any} e 
		* @returns {any} 
		*/
		onKeyDown( e )
		{
			//Check for up and down keys
			if ( e.keyCode == 38 || e.keyCode == 40 )
			{
				e.preventDefault();

				//Get the selected item and move it up and down
				var selected = this._list.selectedIndex;
				if ( selected != -1 )
				{
					var items: number = this._list.numItems();
					//If up
					if ( e.keyCode == 38 )
					{
						if ( selected - 1 < 0 )
							this._list.selectedIndex = items - 1;
						else
							this._list.selectedIndex = selected - 1;
					}
					//If down
					else
					{
						if ( selected + 1 < items )
							this._list.selectedIndex = selected + 1;
						else
							this._list.selectedIndex = 0;
					}

					this._input.text = this._list.selectedItem;
				}

				return;
			}

			//If enter is pressed we select the current item
			if ( e.keyCode == 13 )
			{
				this.emit( new BehaviourPickerEvent( BehaviourPickerEvents.BEHAVIOUR_PICKED, this._list.selectedItem ) );
				this.hide();
			}

			var len = this._list.items.length;
			for ( var i = 0; i < len; i++ )
			{
				var v1 = this._list.items[i].text().toLowerCase();
				var v2 = this._input.text.toLowerCase();
				if ( v1.indexOf( v2 ) != -1 )
				{
					this._list.selectedItem = this._list.items[i].text();
					return;
				}
			}
		}

		/**
		* Gets the singleton instance.
		* @returns {BehaviourPicker} 
		*/
		static getSingleton(): BehaviourPicker
		{
			if ( !BehaviourPicker._singleton )
				new BehaviourPicker();

			return BehaviourPicker._singleton;
		}

		get list(): List { return this._list; }
	}
}