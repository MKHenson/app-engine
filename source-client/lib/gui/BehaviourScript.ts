module Animate
{
	/**
	* A behaviour node that acts as a script. Users can create custom JS within the body. These nodes are connected to 
	* database entries and so need to be cleaned up properly when modified by the user.
	*/
	export class BehaviourScript extends Behaviour
	{		
		public shallowId: number;
		public scriptTab: ScriptTab;
		

		constructor( parent: Component, shallowId: number, text : string = "Script", copied : boolean = false)
		{
			// Call super-class constructor
			super( parent, text );
			
			var behaviour: BehaviourScript = this;
			var element = this.element;
            var plan: UserPlan = User.get.userEntry.meta.plan;
			this.scriptTab = null;
			this.shallowId = shallowId;

			if ( plan.toString() != DB.PLAN_FREE )
				element.addClass( "behaviour-script" );
			else
			{
				element.addClass( "behaviour-bad" );
				this.tooltip = "Script will not be exported. You need to upgrade your account for this feature.";
			}


			//If this was copied we need to make a duplicate in the database and use that
			if ( shallowId !== 0 && copied )
			{
				var that = this;

				var behaviour: BehaviourScript = this;

				//try to create the database entry of this node
				var loader = new AnimateLoader();
				loader.addEventListener( LoaderEvents.COMPLETE, onServer );
				loader.addEventListener( LoaderEvents.FAILED, onServer );
                loader.load("/project/copy-script", { projectId: User.get.project.entry._id, originalId: shallowId, shallowId: behaviour.shallowId });

				//When we have copied the script
				function onServer( response: LoaderEvents, event: AnimateLoaderEvent )
				{
					loader = null;

					if ( response == LoaderEvents.COMPLETE )
					{
						if ( event.return_type == AnimateLoaderResponses.ERROR )
						{
							MessageBox.show( event.message, Array<string>( "Ok" ), null, null );
							return;
						}

						that.shallowId = event.data.shallowId;
					}
				}
			}
			else if ( shallowId === 0 )
				this.initializeDB();
		}


		/**
		* Called when the behaviour is renamed
		* @param <string> name The new name of the behaviour
		*/
		onRenamed( name ) 
		{
			if ( this.scriptTab )
				this.scriptTab.rename( name );
		}

		/**
		* Called when the behaviour is about to be deleted
		*/
		onDelete()
		{
			if ( this.scriptTab )
			{
				this.scriptTab.saved = true;
				CanvasTab.getSingleton().removeTab( this.scriptTab, true );
			}

			var behaviour = this;
			if ( this.shallowId === 0 )
				return;

			//try to create the database entry of this node
			var loader = new AnimateLoader();
			loader.addEventListener( LoaderEvents.COMPLETE, onServer );
			loader.addEventListener( LoaderEvents.FAILED, onServer );
            loader.load("/project/delete-scripts", { projectId: User.get.project.entry._id, ids: [this.shallowId] });
			
			//When we 
			function onServer( response: LoaderEvents, event : AnimateLoaderEvent)
			{
				loader = null;
				if ( response == LoaderEvents.COMPLETE )
				{
					if (event.return_type == AnimateLoaderResponses.ERROR )
					{
						MessageBox.show(event.message, Array<string>("Ok"), null, null );
						return;
					}
				}
			}
		}

		/**
		* this function is called when a container is getting saved. It basically initializes the node in the database.
		*/
		initializeDB( onComplete? : ( success : boolean ) =>  void )
		{
			var behaviour = this;
			if ( behaviour.shallowId !== 0 )
				return;

			var that = this;

			//try to create the database entry of this node
			var loader = new AnimateLoader();
			loader.addEventListener( LoaderEvents.COMPLETE, onServer );
			loader.addEventListener( LoaderEvents.FAILED, onServer );
            loader.load("/project/initialize-behaviour-script", { projectId: User.get.project.entry._id, containerId: (<Canvas>this.parent).behaviourContainer.shallowId, behaviourId: behaviour.id });
			
			//When we 
			function onServer( response: LoaderEvents, event : AnimateLoaderEvent, sender? : EventDispatcher )
			{
				loader = null;
				if ( response == LoaderEvents.COMPLETE )
				{
					if (event.return_type == AnimateLoaderResponses.ERROR )
					{
						MessageBox.show( event.message, Array<string>( "Ok" ), null, null );
						if ( onComplete )
							onComplete( false );
						return;
					}

					that.shallowId = event.data.shallowId;
					if ( onComplete )
						onComplete( true );
				}
			}
		}



		/**
		* This function will open a script tab
		*/
		edit()
		{
			if ( this.shallowId === 0 )
				this.initializeDB();

			var tabName : string = this.id + " - " + this.alias;
			if ( CanvasTab.getSingleton().getTab( tabName ) )
				return CanvasTab.getSingleton().selectTab( CanvasTab.getSingleton().getTab( tabName ) );
			if ( CanvasTab.getSingleton().getTab( "*" + tabName ) )
				return CanvasTab.getSingleton().selectTab( CanvasTab.getSingleton().getTab( "*" + tabName ) );

			this.scriptTab = <ScriptTab>CanvasTab.getSingleton().addSpecialTab( "", CanvasTabType.SCRIPT, this );
		}

		/**
		* Diposes and cleans up this component and all its child Components
		*/
		dispose()
		{
			this.scriptTab = null;

			//Call super
			super.dispose();
		}
	}
}