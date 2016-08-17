module Animate {
	/**
	* A node for displaying comments
	*/
	export class BehaviourComment extends Behaviour {
		private isInInputMode: boolean;
		private input: JQuery;
		private stageClickProxy: any;
		private mStartX: string;
		private mStartY: string;
		private mOffsetX: number;
		private mOffsetY: number;

		constructor( parent : Component, text : string ) {
			// Call super-class constructor
			super( parent, text );

			this.canGhost = false;

			this.element
				.removeClass( "reg-gradient" )
				.addClass( "behaviour-comment" )
				.addClass( "comment" )
				.addClass( "shadow-small" );


			this.isInInputMode = false;
			this.stageClickProxy = jQuery.proxy( this.onStageClick, this );
			this.input = jQuery( "<textarea rows='10' cols='30'></textarea>" );

			this.element.on( "mousedown", jQuery.proxy( this.onResizeStart, this ) );
			this.mStartX = null;
            this.mStartY = null;
            this.element.resizable(<JQueryUI.ResizableOptions>{
				minHeight: 50,
				minWidth: 50,
				helper: "ui-resizable-helper",
				resize: jQuery.proxy( this.onResizeUpdate, this ),
				stop: jQuery.proxy( this.onResizeStop, this )
            });

            this.properties.addVar(new PropText("Comment", text ));
            this.on("edited", this.onEdit, this);
        }

        /**
       * Tokenizes the data into a JSON.
       * @param {boolean} slim If true, only the core value is exported. If false, additional data is exported so that it can be re-created at a later stage
       * @returns {IBehaviour}
       */
        tokenize(slim: boolean = false): IBehaviour {
            var toRet = <IBehaviourComment>super.tokenize(slim);
            toRet.type = CanvasItemType.BehaviourComment;
            toRet.width = this.element.width();
            toRet.height = this.element.height();
            return toRet;
        }

        /**
       * De-Tokenizes data from a JSON.
       * @param {IBehaviourComment} data The data to import from
       */
        deTokenize(data: IBehaviourComment) {
            super.deTokenize(data);
            this.element.css({ width: data.width + "px", height: data.height + "px" });
            this.properties.getVar("Comment").setVal(data.text);
        }

        /**
        * When the text property is edited
        */
        onEdit(type: string, event: EditEvent, sender?: EventDispatcher) {
            this.text = event.property.getVal();
        }

		/**
        * Does nothing...
        */
		updateDimensions() {
			return;
		}

		/**
        * When the mouse enters the behaviour
        */
		onIn( e ) {
			this.element.css( "opacity", 1 );
		}

		/**
		* A shortcut for jQuery's css property.
		*/
		css( propertyName: any, value?: any ): any {
			//Call super
			var toRet = super.css( propertyName, value );

			return toRet;
		}

		/**
        * When the mouse enters the behaviour
        */
		onOut( e ) {
			this.element.css( "opacity", 0.3 );
		}

		/**
        * When the resize starts.
        */
		onResizeStart( event, ui ) {
			this.mStartX = this.element.css( "left" );
			this.mStartY = this.element.css( "top" );

			this.mOffsetX = this.element.offset().left;
			this.mOffsetY = this.element.offset().top;
		}

		/**
        * When the resize updates.
        */
		onResizeUpdate( event, ui ) {
			this.element.css( { left: this.mStartX, top: this.mStartY });

			var helper = jQuery( ui.helper );
			helper.css( { left: this.mOffsetX, top: this.mOffsetY });
		}

		/**
        * When the resize stops.
        */
		onResizeStop( event, ui ) {
			this.onStageClick( null );
			this.element.css( { left: this.mStartX, top: this.mStartY });
		}

		/**
        * Call this to allow for text editing in the comment.
        */
		enterText() {
			if ( this.isInInputMode )
				return false;

			jQuery( "body" ).on( "click", this.stageClickProxy );
            jQuery("body").append(this.input);

            this.isInInputMode = true;
			this.input.css( {
				position: "absolute", left: this.element.offset().left + "px",
				top: this.element.offset().top + "px", width: this.element.outerWidth() + "px",
                height: this.element.outerHeight() + "px", "z-index": 2
			});

			this.element.hide();
			this.input.val( this.element.text() );
			this.input.focus();
			this.input.select();
		}

		/**
        * When we click on the stage we go out of edit mode.
        */
		onStageClick( e ) {
			if ( this.isInInputMode == false )
				return;

			if ( e != null && jQuery( e.target ).is( this.input ) )
				return;

            jQuery("body").off("click", this.stageClickProxy);
            this.isInInputMode = false;
			this.element.css( { width: this.input.width() + "px", height: this.input.height() + "px" });
			this.input.detach();
            this.element.show();

            // Set the comment
            this.properties.getVar("Comment").setVal(this.input.val());
		}

		/**
        * This will cleanup the component.
        */
		dispose() {
            this.off("edited", this.onEdit, this);
			jQuery( "body" ).off( "click", this.stageClickProxy );
			this.input.remove();

			//Call super
            super.dispose();

            this.stageClickProxy = null;
            this.isInInputMode = null;
            this.input = null;
		}
	}
}