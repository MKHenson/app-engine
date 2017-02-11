import { EventDispatcher } from './event-dispatcher';
import { Project } from './project';
import { IAjaxError, post, put, get } from './utils';
import { DB } from '../setup/db';

/**
* This class is used to represent the user who is logged into Animate.
*/
export class User extends EventDispatcher {
    private static _singleton: User;
    public entry: UsersInterface.IUserEntry | null;
    public meta: HatcheryServer.IUserMeta | null;
    public project: Project | null;

    constructor() {
        super();
        this.entry = null;
        this.meta = null;
        this.project = null;
    }

    /**
     * Attempts to log the user out
     */
    async logout() {
        const response = await get<UsersInterface.IResponse>( `${ DB.USERS }/logout` );
        if ( response.error )
            throw new Error( response.message );

        this.entry = null;
        this.meta = null;
        return true;
    }

    /**
     * Sends a server request to check if a user is logged in
     */
    async authenticated() {
        const authResponse = await get<UsersInterface.IAuthenticationResponse>( `${ DB.USERS }/authenticated` );

        if ( authResponse.error )
            throw new Error( authResponse.message );

        if ( !authResponse.authenticated )
            return false;

        const metaResponse = await get<ModepressAddons.IGetDetails>( `${ DB.API }/user-details/${ authResponse.user!.username }` );

        if ( metaResponse && metaResponse.error )
            throw new Error( metaResponse.message );

        this.entry = authResponse.user!;
        this.meta = metaResponse.data;
        return true;
    }

    /**
     * Attempts to log the user in using the token provided
     */
    async login( token: UsersInterface.ILoginToken ) {
        const authResponse = await post<UsersInterface.IAuthenticationResponse>( `${ DB.USERS }/users/login`, token );

        if ( authResponse.error )
            throw new Error( authResponse.message );

        if ( !authResponse.authenticated )
            throw new Error( `User could not be authenticated: '${ authResponse.message }'` );

        let entry = authResponse.user!;
        const metaResponse = await get<ModepressAddons.IGetDetails>( `${ DB.API }/user-details/${ authResponse.user!.username }` );

        if ( metaResponse.error )
            throw new Error( metaResponse.message );

        this.meta = metaResponse!.data;
        this.entry = entry;
        return this;
    }

    /**
     * Attempts to register the user with the provided token
     * @returns A promise with the return message from the server.
     */
    async register( token: UsersInterface.IRegisterToken ) {
        const response = await post<UsersInterface.IAuthenticationResponse>( `${ DB.USERS }/users/register`, token );

        if ( response.error )
            throw new Error( response.message );

        return response.message;
    }

    /**
     * Sends an instruction to the server to start the user password reset procedure.
     * @returns A promise with the return message from the server.
     */
    async resetPassword( user: string ) {

        const response = await get<UsersInterface.IResponse>( `${ DB.USERS }/users/${ user }/request-password-reset` );

        if ( response.error )
            throw new Error( response.message );

        return response.message;
    }

    /**
     * Sends an instruction to the server to resend the user account activation link.
     * @returns A promise with the return message from the server.
     */
    async resendActivation( user: string ) {
        const response = await get<UsersInterface.IResponse>( `${ DB.USERS }/users/${ user }/resend-activation` );
        if ( response.error )
            throw new Error( response.message );

        return response.message;
    }

    /**
    * Creates a new user projects
    * @param name The name of the project
    * @param plugins An array of plugin IDs to identify which plugins to use
    * @param description [Optional] A short description
    */
    newProject( name: string, plugins: Array<{ id: string; version: string; }>, description: string = '' ): Promise<ModepressAddons.ICreateProject> {
        const token: HatcheryServer.IProject = {
            name: name,
            description: description,
            versions: plugins
        };

        return new Promise<ModepressAddons.ICreateProject>( function( resolve, reject ) {
            post<ModepressAddons.ICreateProject>( `${ DB.API }/projects`, token ).then( function( data ) {
                if ( data.error )
                    return reject( new Error( data.message ) );

                // Assign the actual plugins
                // const project = data.data;
                // const plugins: Array<HatcheryServer.IPlugin> = [];
                // for ( let ii = 0, il = project.plugins!.length; ii < il; ii++ )
                //     plugins.push( PluginManager.getSingleton().getPluginByID( project.plugins![ ii ] ) ! );

                // project.$plugins = plugins;

                return resolve( data );

            }).catch( function( err: IAjaxError ) {
                reject( new Error( `An error occurred while connecting to the server. ${ err.status }: ${ err.message }` ) );
            })
        });
    }

    // /**
    // * Removes a project by its id
    // * @param pid The id of the project to remove
    // */
    // removeProject( pid: string ): Promise<Modepress.IResponse> {
    //     const that = this;

    //     return new Promise<Modepress.IResponse>( function( resolve, reject ) {
    //         Utils.delete<Modepress.IResponse>( `${DB.API}/users/${that.entry.username}/projects/${pid}` ).then( function( data ) {
    //             if ( data.error )
    //                 return reject( new Error( data.message ) );

    //             return resolve( data );

    //         }).catch( function( err: IAjaxError ) {
    //             return reject( new Error( `An error occurred while connecting to the server. ${err.status}: ${err.message}` ) );
    //         });
    //     });
    // }

    /**
    * Attempts to update the user's details base on the token provided
    * @returns The user details token
    */
    updateDetails( token: HatcheryServer.IUserMeta ): Promise<UsersInterface.IResponse> {
        const meta = this.meta!;
        const that = this;

        return new Promise<Modepress.IResponse>( function( resolve, reject ) {
            put( `${ DB.API }/user-details/${ that.entry!.username }`, token ).then( function( data: UsersInterface.IResponse ) {
                if ( data.error )
                    return reject( new Error( data.message ) );
                else {
                    for ( const i in token )
                        if ( meta.hasOwnProperty( i ) )
                            meta[ i ] = token[ i ];
                }

                return resolve( data );

            }).catch( function( err: IAjaxError ) {
                return reject( new Error( `An error occurred while connecting to the server. ${ err.status }: ${ err.message }` ) );
            });
        });
    }

    /**
    * Use this function to duplicate a project
    * @param id The project ID we are copying
    */
    copyProject( id: string ) {
        id; // Supresses unused param error
        throw new Error( 'not implemented' );
    }

    /**
    * This function is used to open an existing project.
    */
    openProject( id: string ) {
        id; // Supresses unused param error
        throw new Error( 'not implemented' );
    }

    /**
    * This will delete a project from the database as well as remove it from the user.
    * @param id The id of the project we are removing.
    */
    deleteProject( id: string ) {
        id; // Supresses unused param error
        throw new Error( 'not implemented' );
    }


    /**
     * Gets the singleton instance.
     */
    static get get(): User {
        if ( !User._singleton )
            User._singleton = new User();

        return User._singleton;
    }
}