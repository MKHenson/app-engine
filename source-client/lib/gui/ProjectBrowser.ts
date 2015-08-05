module Animate
{
	export class ProjectBrowserEvents extends ENUM
	{
		constructor( v: string ) { super( v ); }

		static COMBO: ProjectBrowserEvents = new ProjectBrowserEvents( "project_browser_combo" );
	}

	export class ProjectBrowserEvent extends Event
	{
		public command: string;

		constructor( eventName: ProjectBrowserEvents, command: string )
		{
			super( eventName, command );
			this.command = command;
		}
	}

	/**
	* This class is used to do administrative tasks on projects
	*/
	export class ProjectBrowser extends Component
	{
		private _list: ListView;
		private _select: ComboBox;
		private _search: Component;
		private _selectedItem: ListViewItem;
		private _selectedName: string;
		private _selectedID: string;

		/**
		* @param {Component} parent The parent of the button
		*/
		constructor( parent: Component )
		{
			super( "<div class='project-browser'></div>", parent );

			var top : Component = <Component>this.addChild( "<div></div>" );
			this.element.append( "<div class='fix'></div>" );
			var bottom : Component = <Component>this.addChild( "<div class='project-browser-bottom'></div>" );

			this._list = new ListView( bottom );

			this._list.addColumn( "Name" );
			this._list.addColumn( "Description" );
			this._list.addColumn( "Tags" );
			this._list.addColumn( "Created On" );
			this._list.addColumn( "Last Modified" );
			this._list.addColumn( "ID" );

			this._select = new ComboBox( top );
			this._select.element.addClass( "light-gradient" );
			this._select.addItem( "Start" );
			this._select.addItem( "Copy" );
			this._select.addItem( "Create New" );
			this._select.addItem( "Delete" );
			this._select.addItem( "Open" );

			this._list.setColumnWidth( 1, "90px" );

			this._search = <Component>top.addChild( "<div class='project-browser-search'><input type='text'></input><img src='media/search.png' /><div>" );
			this._selectedItem = null;
			this._selectedName = null;
			this._selectedID = null;

			this._list.addEventListener( ListViewEvents.ITEM_CLICKED, this.onItemClick, this );
			this._list.addEventListener( ListViewEvents.ITEM_DOUBLE_CLICKED,  this.onDblClick, this );
			this._select.addEventListener( ListEvents.ITEM_SELECTED, this.onSelectClick, this );
		}

		/**
		* When we double click a project item
		*/
		onDblClick( response: ListViewEvents, event: ListViewEvent)
		{
			this._selectedItem = event.item;
			if (event.item)
			{
				this._selectedName = event.item.fields[0];
				this._selectedID = event.item.fields[5];

				this.dispatchEvent( new ProjectBrowserEvent( ProjectBrowserEvents.COMBO, "Open" ) );
				this._select.selectedItem = "Start";
			}
		}

		/**
		* when we select an option from the combo
		*/
		onSelectClick( response: ListEvents, event: ListEvent, sender?:EventDispatcher )
		{
			if ( event.item != "Start" )
			{
				this.dispatchEvent( new ProjectBrowserEvent( ProjectBrowserEvents.COMBO, event.item ) );
				this._select.selectedItem = "Start";
			}
		}

		/**
		* Clears all the projects
		*/
		clearItems()
		{
			this._list.clearItems();
		}

		/**
		* When we click on one of the project items
		* @param {JQuery} e The jQuery event object
		* @param {any} item The ListViewItem that was selected.
		*/
		onItemClick( response: ListViewEvents, event: ListViewEvent, sender? : EventDispatcher )
		{
			this._selectedItem = event.item;

			if ( event.item )
			{
				this._selectedName = event.item.fields[0];
				this._selectedID = event.item.fields[5];
			}
		}

		/**
		* Fills the browser with project items
		* @param {any} data The data object sent from the server
		*/
		fill( data : any )
		{
			this._selectedItem = null;

			this._list.clearItems();

			for ( var i = 0, l = data.length; i < l; i++ )
			{
				var item = new ListViewItem( [data[i].name, data[i].description, data[i].tags, new Date( data[i].createdOn ).toString(), new Date( data[i].lastModified ).toString(), data[i]._id ], 'media/project-item.png', 'media/project-item.png' );
				this._list.addItem( item );
			}
		}

		get selectedItem(): ListViewItem { return this._selectedItem; }
		get selectedName(): string { return this._selectedName; }
		get selectedID(): string { return this._selectedID; }
	}
}