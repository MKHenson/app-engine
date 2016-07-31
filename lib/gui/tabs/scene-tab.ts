module Animate {
	/**
	* This is an implementation of the tab class
	*/
	export class SceneTab extends Tab {
		private static _singleton: SceneTab;
		private mDocker: Docker;
		public assetPanel: Component;

		/**
		* @param {Component} parent The parent of the button
		*/
		constructor( parent: Component ) {
			super( parent );

			if ( SceneTab._singleton != null )
				throw new Error( "The SceneTab class is a singleton. You need to call the SceneTab.get() function." );

			SceneTab._singleton = this;

			this.element.css( { width: "100%", height: "100%" });
			this.mDocker = null;

			//Add the main tabs
			this.assetPanel = <Component>this.addTab( "Assets", false ).page;

			new TreeViewScene( this.assetPanel );
		}

		/**This is called by a controlling ScreenManager class. An image string needs to be returned
		* which will act as a preview of the component that is being viewed or hidden.*/
		getPreviewImage() {
			return "media/world_48.png";
		}

		/*Each IDock item needs to implement this so that we can keep track of where it moves.*/
		getDocker() { return this.mDocker; }

		/*Each IDock item needs to implement this so that we can keep track of where it moves.*/
		setDocker( val ) { this.mDocker = val; }

		/*This is called by a controlling Docker class when the component needs to be shown.*/
		onShow() { }

		/*This is called by a controlling Docker class when the component needs to be hidden.*/
		onHide() { }

		/** Gets the singleton instance. */
		static getSingleton( parent? : Component ) : SceneTab {
			if ( !SceneTab._singleton )
				new SceneTab( parent );

			return SceneTab._singleton;
		}
	}
}