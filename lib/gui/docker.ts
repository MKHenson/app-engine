module Animate {
	/**
	* A Docker is used in Animate so that we can divide up screen real estate. A box is added to a parent component
	* which, when hovered or dragged, will enabled the user to move components around or explore hidden sections
	* of the application.
	*/
	export class Docker extends Component {
		private activeComponent: IDockItem;
		private _activePreview: JQuery;
		private rollout: JQuery;
		private mComponents: Array<IDockItem>;
		private mPreviews: Array<JQuery>;

		private startProxy: any;
		private stopProxy: any;
		private clickPreview: any;
		private dropProxy: any;

		constructor( parent : Component ) {
			// Call super-class constructor
			super( "<div class='screen-manager light-gradient shadow-small curve-small'></div>", parent );

			this.activeComponent = null;
			this._activePreview = null;

			this.rollout = jQuery( "<div class='roll-out animate-all light-gradient shadow-small curve-small'></div>" );

			this.mComponents = [];
			this.mPreviews = [];

			this.element.on( "mouseenter", jQuery.proxy( this.onEnter, this ) );
			this.element.on( "mouseleave", jQuery.proxy( this.onOut, this ) );

			this.startProxy = this.onStart.bind( this );
			this.stopProxy = this.onStop.bind( this );
			this.clickPreview = this.onClick.bind( this );
			this.dropProxy = this.onObjectDropped.bind( this );

            this.element.droppable(<JQueryUI.DroppableOptions>{ drop: this.dropProxy, hoverClass: "hover-over" });
		}

		/** When we click on a preview.*/
		onClick( e : any ) : void {
			var comp: IDockItem = jQuery( e.target ).data( "component" );
			if ( comp )	{
				this.removeComponent( comp );
				this.addComponent( comp, true );
			}
		}

		/** When we start draggin.*/
		onStart( e: any ): void {
			var managers = jQuery( ".screen-manager" );
			managers.removeClass( "light-gradient" );
			managers.addClass( "drag-targets" );
			managers.css( { opacity: 1 });
		}

		/** When we stop draggin.*/
		onStop( e: any): void {
			var managers = jQuery( ".screen-manager" );
			managers.addClass( "light-gradient" );
			managers.removeClass( "drag-targets" );
			managers.css( { opacity: "" });
		}

		/** Called when the mouse is over this element.*/
		onEnter( e: any ): void {
			if ( this.mComponents.length > 1 )
				this.element.append( this.rollout );

			this.rollout.css( { left: -( this.rollout.width() + 5 ) + "px" });

			this.rollout.stop();
			this.rollout.show();
			this.rollout.css( "opacity", 1 );
		}

		/** Called when the mouse leaves this element.*/
		onOut( e: any ): void {
			this.rollout.stop();
			this.rollout.fadeOut();
		}

		/**Called when a draggable object is dropped onto the canvas.*/
		onObjectDropped( event: any, ui: any ): void {
			var comp : Component = jQuery( ui.draggable ).data( "component" );
			var manager = jQuery( ui.draggable ).data( "Docker" );
			if ( comp && manager ) {
				var parent = this.parent;

				manager.removeComponent( comp );
				this.addComponent( comp, true );

				Application.getInstance().update();

				//this.onEnter(null);
			}
		}

		/** Call this function to update the manager.*/
		update(): void {
			//Call super
			Component.prototype.update.call( this, false );

			var parent = this.parent.element;
			if ( parent.length != 0 ) {
				var w = parent.width();
				var h = parent.height();

				this.element.css( { left: ( w - this.element.width() - 15 ) + "px", top: 6 + "px" });
			}
		}

		/** Gets the singleton instance. */
		setActiveComponent( comp: IDockItem, attach : boolean = false ): void {
			if ( this.activeComponent ) {
				var parent = this.activeComponent.parent;

				if ( parent )
					parent.removeChild( this.activeComponent );
			}
			if ( this._activePreview ) {
				this._activePreview.detach();
				this.rollout.append( this._activePreview );
			}
			this.activeComponent = comp;
			this._activePreview = comp.element.data( "preview" );

			if ( attach ) {
				this.parent.addChild( comp );
				comp.onShow();
			}

			this.element.append( this._activePreview );
		}

		/** Removes an IDockItem from the manager */
		removeComponent( comp : IDockItem, completeRemoval : boolean = false ): void {
			comp.setDocker( null );
			var preview = comp.element.data( "preview" );
			this.mComponents.splice( jQuery.inArray( comp, this.mComponents ), 1 );
			this.mPreviews.splice( jQuery.inArray( preview, this.mPreviews ), 1 );

			if ( completeRemoval )
				preview.remove();
			else
				preview.detach();

			comp.onHide();

			if ( this._activePreview == comp.element.data( "preview" ) )
				this._activePreview = null;

			if ( comp == this.activeComponent && this.mComponents.length > 0 )
				this.setActiveComponent( this.mComponents[0] );
			else if ( comp == this.activeComponent )
				this.activeComponent = null;


		}

		/** Adds a IDockItem to the manager */
		addComponent( comp, attach ): void {
			if ( jQuery.inArray( comp, this.mComponents ) != -1 )
				return;

			this.mComponents.push( comp );

			comp.setDocker( this );

			//Create the preview jquery object
			var toAdd = null;
			if ( !comp.element.data( "preview" ) ) {
				toAdd = jQuery( "<div class='screen-manager-preview'><img src='" + comp.getPreviewImage() + "'></div>" );
				toAdd.draggable( { start: this.startProxy, stop: this.stopProxy, opacity: 0.7, cursor: "move", helper: "clone", revert: "invalid", appendTo: "body", containment: "body", zIndex: 9999 });
			}
			else
				toAdd = comp.element.data( "preview" );

			comp.element.data( "preview", toAdd );
			toAdd.data( "component", comp );
			toAdd.data( "Docker", this );

			//Attach the click event
			toAdd.off( "click" );
			toAdd.on( "click", this.clickPreview );


			this.mPreviews.push( toAdd );

			this.setActiveComponent( comp, attach );
		}

		get activePreview(): JQuery { return this._activePreview; }
	}
}