import mongodb = require( "mongodb" );
import utils = require( "../Utils" );
import util = require( "util" );
import Emitter = require( "../Emitter" );
import events = require( "events" );
import logger = require( "../Logger" );

class Model extends events.EventEmitter
{
	private static _singleton: Model;
	private _collections: { [name:string] : mongodb.Collection };

	private _db: mongodb.Db;


	/**
	* Creates an instance of the Model class
	*/
	constructor( db?: mongodb.Db )
	{
		super();
		this._db = db;
		this._collections = {};
	}

	collection( name: string ): mongodb.Collection
	{
		return this._db.collection( name );
	}

	/**
	* Creates the collections for this database
	*/
	initializeCollections()
	{
		var that: Model = this;		
		var db: mongodb.Db = this._db;
		var totalCollections: number = 0;
		var loaded: number = 0;
		var collections: any =
			{
				users: { index: "email" },
				sessions: { index: null },
				projects: { index: null },
				builds: { index: null },
				behaviours: { index: null },
				plugins: { index: null },
				groups: { index: null },
				assets: { index: null },
				files: { index: null },
				logs: { index: null },
				scripts: { index : null }
			}

		for ( var i in collections )
			totalCollections++;

		// Called a collection is loaded
		var onLoaded = function( collectionName : string )
		{
			loaded++;
			logger.log( "'" + collectionName + "' loaded [" + loaded.toString() + "/" + totalCollections.toString() + "]" + "..." );
			if ( loaded >= totalCollections )
			{
				logger.log( "Collections loaded..." );
				that.emit( "ready" );
			}
		};

		// Try to load each of the collections
		var collectionReceived = function ( err: Error, collection: mongodb.Collection )
		{
			if ( err || !collection )
			{
				that.emit( "error", "Error creating collection: " + err.message );
				return;
			}

			var collectionName: string = ( <any>collection ).collectionName;

			that._collections[collectionName] = collection;

			// If the collection has an index, then set it			
			var index: string = collections[collectionName].index;
			if ( index )
			{
				logger.log( "Settings index '" + index + "' for collection '" + collectionName + "'" );

				var fieldOrSpec: any = {};
				fieldOrSpec[index] = 1;

				collection.ensureIndex( fieldOrSpec, { unique: true }, function ( err: Error, indexName: string )
				{
					if ( err )
					{
						that.emit( "error", "Error setting collection index for '" + collectionName + "': " + err.message );
						return;
					}
					else
					{
						logger.log( "Index '" + index + "' set for collection '" + collectionName + "'", logger.LogType.SUCCESS );
						onLoaded( collectionName );
						return;
					}
				});
			}
			else
				onLoaded( collectionName );
		};


		logger.log( "Loading collections..." );
		for ( var i in collections )
		{
			// Projects
			if ( !db.collection( i ) )
				db.createCollection( i, collectionReceived );
			else
				db.collection( i, collectionReceived );
		}
	}


	/**
	* Gets the model singleton
	*/
	public static getSingleton( db?: mongodb.Db ): Model
	{
		if ( !Model._singleton && db )
		{
			Model._singleton = new Model( db );
			return Model._singleton;
		}
		else if ( Model._singleton )
			return Model._singleton;
		else
			return null;
	}

	/**
	* Gets the collections singleton
	*/
	public static collections( name: string ): mongodb.Collection
	{
		if ( !Model._singleton )
			throw( new Error("Model not yet initialized") );

		return Model.getSingleton()._collections[name];
	}
}

export = Model;