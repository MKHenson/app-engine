import mongodb = require( "mongodb" );

/**
* Describes the different types of users
*/
export class UserType
{
	public static ADMIN: string = "admin";
	public static REGULAR: string = "regular";
};

/**
* Describes the different plans available to users
*/
export class PlanType
{
	public static PLATINUM: string = "animate-platinum";
	public static GOLD: string = "animate-gold";
	public static SILVER: string = "animate-silver";
	public static BRONZE: string = "animate-bronze";
	public static FREE: string = "animate-free";
};

/**
* A class that is used to describe the user model
*/
export class User
{
	static adminId: mongodb.ObjectID = new mongodb.ObjectID( "000000000000000000000000" );

	public username : string;
	public password: string;
	public email: string;
	public bio: string;
	public image: string;
	public imagePath: string;
	public tag: string;
	public userType: string;
	public plan: string;
	public registerKey: string;
	public website: string;
	public customerId: string;
	public curSubscription: string;
	public maxProjects: number;
	public createdOn: number;
	public lastModified: number;
	public _id: mongodb.ObjectID;

	/**
	* Creates an instance of the user class
	*/
	constructor( isAdmin : boolean = false )
	{
		this.username = "";
		this.password = "";
		this.email = "";
		this.bio = "";
		this.image = "media/blank-user.png";
		this.imagePath = "";
		this.tag = "";
		this.userType = UserType.REGULAR;
		this.plan = PlanType.FREE;
		this.registerKey = "";
		this.website = "";
		this.customerId = "";
		this.curSubscription = "";
		this.maxProjects = 1;
		this.createdOn = Date.now();
		this.lastModified = Date.now();

		if ( isAdmin )
			this._id = User.adminId;
	}
}