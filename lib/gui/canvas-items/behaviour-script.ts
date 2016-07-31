module Animate {
	/**
	* A behaviour node that acts as a script. Users can create custom JS within the body. These nodes are connected to
	* database entries and so need to be cleaned up properly when modified by the user.
	*/
	export class BehaviourScript extends Behaviour {
        public scriptId: string;
        public scriptTab: ScriptTab;
        private _loading: JQuery;

        constructor(parent: Component, scriptId: string, text: string, copied: boolean = false) {
			// Call super-class constructor
            super(parent, "Script");

            // TODO: What do we do about shallow IDs?
            Utils.generateLocalId()

            this.scriptTab = null;
            this.scriptId = scriptId;
            this._loading = jQuery("<img src='media/buffering-white.png' class='rotate-360' />");
            var element = this.element,
                that = this,
                project = User.get.project,
                promise: Promise<ProjectResource<Engine.IScript>>;

            this.alias = text;

            element.addClass("behaviour-script");
            this._loading.insertBefore(jQuery(".text", element));

            if (scriptId && copied)
                // TODO: Copy the behaviour instead of create
                promise = project.createResource<Engine.IScript>(ResourceType.SCRIPT, { name: text });
            else
                promise = project.createResource<Engine.IScript>(ResourceType.SCRIPT, { name: text, projectId: project.entry._id  });


            promise.then(function (data: ScriptResource) {
                Logger.logMessage(`Created behaviour script '${text}'`, null, LogType.MESSAGE);
                that._loading.detach();
                that.scriptId = data.entry._id;

            }).catch(function (err: Error) {
                Logger.logMessage(err.message, null, LogType.ERROR);
            });

			////If this was copied we need to make a duplicate in the database and use that
			//if ( shallowId !== 0 && copied )
			//{
			//	var that = this;

			//	//try to create the database entry of this node
			//	var loader = new AnimateLoader();
			//	loader.on( LoaderEvents.COMPLETE, onServer );
			//	loader.on( LoaderEvents.FAILED, onServer );
   //             loader.load("/project/copy-script", { projectId: User.get.project.entry._id, originalId: shallowId, shallowId: that.shallowId });

			//	//When we have copied the script
			//	function onServer( response: LoaderEvents, event: AnimateLoaderEvent )
			//	{
			//		loader = null;

			//		if ( response == LoaderEvents.COMPLETE )
			//		{
			//			if ( event.return_type == AnimateLoaderResponses.ERROR )
			//			{
			//				MessageBox.show( event.message, Array<string>( "Ok" ), null, null );
			//				return;
			//			}

			//			that.shallowId = event.data.shallowId;
			//		}
			//	}
			//}
			//else if ( shallowId === 0 )
			//	this.initializeDB();
		}


		/**
		* Called when the behaviour is renamed
		* @param <string> name The new name of the behaviour
		*/
		onRenamed( name ) {
			if ( this.scriptTab )
				this.scriptTab.rename( name );
		}

		///**
		//* Called when the behaviour is about to be deleted
		//*/
		//onDelete()
		//{
		//	if ( this.scriptTab )
		//	{
		//		this.scriptTab.saved = true;
		//		CanvasTab.getSingleton().removeTab( this.scriptTab, true );
		//	}

			//var behaviour = this;
			//if ( this.shallowId === 0 )
			//	return;

			////try to create the database entry of this node
			//var loader = new AnimateLoader();
			//loader.on( LoaderEvents.COMPLETE, onServer );
			//loader.on( LoaderEvents.FAILED, onServer );
   //         loader.load("/project/delete-scripts", { projectId: User.get.project.entry._id, ids: [this.shallowId] });

			////When we
			//function onServer( response: LoaderEvents, event : AnimateLoaderEvent)
			//{
			//	loader = null;
			//	if ( response == LoaderEvents.COMPLETE )
			//	{
			//		if (event.return_type == AnimateLoaderResponses.ERROR )
			//		{
			//			MessageBox.show(event.message, Array<string>("Ok"), null, null );
			//			return;
			//		}
			//	}
			//}
		//}

		///**
		//* this function is called when a container is getting saved. It basically initializes the node in the database.
		//*/
		//initializeDB( onComplete? : ( success : boolean ) =>  void )
		//{
		//	var behaviour = this;
		//	if ( behaviour.shallowId !== 0 )
		//		return;

		//	var that = this;

		//	//try to create the database entry of this node
		//	var loader = new AnimateLoader();
		//	loader.on( LoaderEvents.COMPLETE, onServer );
		//	loader.on( LoaderEvents.FAILED, onServer );
  //          loader.load("/project/initialize-behaviour-script", { projectId: User.get.project.entry._id, containerId: (<Canvas>this.parent).container.entry.shallowId, behaviourId: behaviour.id });

		//	//When we
		//	function onServer( response: LoaderEvents, event : AnimateLoaderEvent, sender? : EventDispatcher )
		//	{
		//		loader = null;
		//		if ( response == LoaderEvents.COMPLETE )
		//		{
		//			if (event.return_type == AnimateLoaderResponses.ERROR )
		//			{
		//				MessageBox.show( event.message, Array<string>( "Ok" ), null, null );
		//				if ( onComplete )
		//					onComplete( false );
		//				return;
		//			}

		//			that.shallowId = event.data.shallowId;
		//			if ( onComplete )
		//				onComplete( true );
		//		}
		//	}
		//}



		/**
		* This function will open a script tab
		*/
		edit() {
			//if ( this.shallowId === 0 )
			//	this.initializeDB();

            if (this.scriptTab)
                CanvasTab.getSingleton().selectTab(this.scriptTab);
            else
                this.scriptTab = <ScriptTab>CanvasTab.getSingleton().addSpecialTab("", CanvasTabType.SCRIPT, this);

			//var tabName : string = this.id + " - " + this.alias;
			//if ( CanvasTab.getSingleton().getTab( tabName ) )
			//	return CanvasTab.getSingleton().selectTab( CanvasTab.getSingleton().getTab( tabName ) );
			//if ( CanvasTab.getSingleton().getTab( "*" + tabName ) )
			//	return CanvasTab.getSingleton().selectTab( CanvasTab.getSingleton().getTab( "*" + tabName ) );

			//this.scriptTab = <ScriptTab>CanvasTab.getSingleton().addSpecialTab( "", CanvasTabType.SCRIPT, this );
        }

        /**
        * Tokenizes the data into a JSON.
        * @param {boolean} slim If true, only the core value is exported. If false, additional data is exported so that it can be re-created at a later stage
        * @returns {IBehaviourScript}
        */
        tokenize(slim: boolean = false): IBehaviourScript {
            var toRet = <IBehaviourScript>super.tokenize(slim);
            toRet.scriptId = this.scriptId;
            toRet.type = CanvasItemType.BehaviourScript;
            return toRet;
        }

        /**
        * De-Tokenizes data from a JSON.
        * @param {IBehaviourScript} data The data to import from
        */
        deTokenize(data: IBehaviourScript) {
            super.deTokenize(data);
            this.scriptId = this.scriptId;
        }

		/**
		* Diposes and cleans up this component and all its child Components
		*/
		dispose() {
			this.scriptTab = null;

			//Call super
			super.dispose();
		}
	}
}