import nodemailer = require("nodemailer");

/**
* Use this class to send emails using SMPT
*/
class Mailer
{
	private static _singleton: Mailer;

	private _smpt: Transport;

	constructor()
	{
		this._smpt = nodemailer.createTransport( "SMTP", {
			secureConnection: true,
			service: "Gmail",
			auth: {
				user: "mat@webinate.net",
				pass: "raptors123!"
			}
		});
	}

	/**
	* Sends an email using the mail transporter
	*/
	sendEmail( message : MailComposer, callback : (err : Error, response? : any )=> void )
	{
		this._smpt.sendMail( message,  callback);
	}

	/**
	* @returns {Mailer}
	*/
	public static getSingleton(): Mailer
	{
		if ( !Mailer._singleton )
			Mailer._singleton = new Mailer();

		return Mailer._singleton;
	}
}

export = Mailer;