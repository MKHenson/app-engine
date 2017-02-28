import { User } from './user';
import { Collection, ICollectionOptions } from './collection';
import { post, get } from '../core/utils';
import { DB } from '../setup/db';

/**
* This class is used to represent the user who is logged into Animate.
*/
export class Users extends Collection<UsersInterface.IUserEntry> {

    constructor( options?: ICollectionOptions<UsersInterface.IUserEntry> ) {
        super( { ...options, host: DB.USERS, url: 'users', modelClass: User });
    }

    /**
     * Attempts to log the user out
     */
    async logout() {
        const response = await get<UsersInterface.IResponse>( `${this.getRoutPath()}/logout` );
        if ( response.error )
            throw new Error( response.message );

        return true;
    }

    /**
     * Sends a server request to check if a user is logged in
     */
    async authenticated() {
        const authResponse = await get<UsersInterface.IAuthenticationResponse>( `${this.getRoutPath()}/authenticated` );

        if ( authResponse.error )
            throw new Error( authResponse.message );

        if ( !authResponse.authenticated )
            return false;

        return true;
    }

    /**
     * Attempts to log the user in using the token provided
     */
    async login( token: UsersInterface.ILoginToken ) {
        const authResponse = await post<UsersInterface.IAuthenticationResponse>( `${this.getRoutPath()}/login`, token );

        if ( authResponse.error )
            throw new Error( authResponse.message );

        if ( !authResponse.authenticated )
            throw new Error( `User could not be authenticated: '${authResponse.message}'` );

        return this;
    }

    /**
     * Attempts to register the user with the provided token
     * @returns A promise with the return message from the server.
     */
    async register( token: UsersInterface.IRegisterToken ) {
        const response = await post<UsersInterface.IAuthenticationResponse>( `${this.getRoutPath()}/register`, token );

        if ( response.error )
            throw new Error( response.message );

        return response.message;
    }

    /**
     * Sends an instruction to the server to start the user password reset procedure.
     * @returns A promise with the return message from the server.
     */
    async resetPassword( user: string ) {

        const response = await get<UsersInterface.IResponse>( `${DB.USERS}/users/${user}/request-password-reset` );

        if ( response.error )
            throw new Error( response.message );

        return response.message;
    }

    /**
     * Sends an instruction to the server to resend the user account activation link.
     * @returns A promise with the return message from the server.
     */
    async resendActivation( user: string ) {
        const response = await get<UsersInterface.IResponse>( `${DB.USERS}/users/${user}/resend-activation` );
        if ( response.error )
            throw new Error( response.message );

        return response.message;
    }
}