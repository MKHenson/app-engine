//module Animate
//{
//	//export class BehaviourManagerEvents extends ENUM
//	//{
//	//	constructor( v: string ) { super( v ); }

//	//	static CONTAINER_SAVED: BehaviourManagerEvents = new BehaviourManagerEvents( "behaviour_manager_container_saved" );
//	//	static SUCCESS: BehaviourManagerEvents = new BehaviourManagerEvents( "behaviour_manager_success" );
//	//}

//	export class BehaviourManagerEvent extends Event
//	{
//		public name: string;

//		constructor(type: string, name : string )
//		{
//            super(type, name);
//			this.name = name;
//		}
//	}

//	export class BehaviourManager extends EventDispatcher
//	{
//		private static _singleton: BehaviourManager;

//		constructor()
//		{
//			if ( BehaviourManager._singleton != null )
//				throw new Error( "The BehaviourManager class is a singleton. You need to call the BehaviourManager.getSingleton() function." );

//			BehaviourManager._singleton = this;

//			// Call super-class constructor
//			super();
//		}

//		/**
//		* Gets the singleton instance.
//		*/
//		static getSingleton(): BehaviourManager
//		{
//			if ( !BehaviourManager._singleton )
//				new BehaviourManager();

//			return BehaviourManager._singleton;
//		}
//	}
//}