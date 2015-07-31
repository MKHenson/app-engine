import mongodb = require( "mongodb" );

/**
* Describes the current developmental state of a build
*/
export class BUILD_STATE
{
	public static DEVELOPMENT: string = "development";
};

/**
* Describes the different levels of visibility of a build
*/
export class BUILD_VISIBILITY
{
	public static PUBLIC: string = "Public";
	public static PRIVATE: string = "Private";
};

/**
* A class that is used to describe the build model
*/
export class Build
{
	public name : string;
	public projectId: mongodb.ObjectID;
	public state: string;
	public html: string;
	public css: string;	
	public visibility: string;
	public rating: number;
	public build_notes: string;
	public version: string;
	public createdOn: number;
	public lastModified: number;
	public _id: mongodb.ObjectID;

	// The following variables are used when running the build
	public liveHTML: string;
	public liveLink: string;
	public liveToken: string;

	/**
	* Creates an instance of a build
	*/
	constructor( projectId: mongodb.ObjectID = undefined, version: string = "0.0.1" )
	{
		this.name = "";
		this.projectId = projectId;
		this.state = BUILD_STATE.DEVELOPMENT;
		this.html = "";
		this.css = "";		
		this.liveHTML = "";
		this.liveLink = "";
		this.liveToken = Build.generateToken(7);
		this.visibility = BUILD_VISIBILITY.PRIVATE;
		this.rating = 0;
		this.build_notes = "";
		this.version = version;
		this.createdOn = Date.now();
		this.lastModified = Date.now();
	}

	/**
	* Use this function to generate a random token string
	* @param {number} length The length of the password. 
	* @returns {string}
	*/
	static generateToken( length: number ): string
	{
		var text = "";
		var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

		for ( var i = 0; i < length; i++ )
			text += possible.charAt( Math.floor( Math.random() * possible.length ) );

		return text;
	}
}