///<reference path='./express.d.ts' />

declare module UsersInterface
{
    export class User
    {
        dbEntry: IUserEntry;
    }

    export module SocketEvents
    {
        /*
        * The base interface for all socket events
        */
        export interface IEvent
        {
            eventType: number;
        }

        /*
        * The socket user event
        */
        export interface IUserEvent extends IEvent
        {
            eventType: number;
            username: string;
        }

        /*
        * Interface for file added events
        */
        export interface IFilesAddedEvent extends IEvent
        {
            username: string;
            files: Array<IFileEntry>;
        }

        /*
        * Interface for file removed events
        */
        export interface IFilesRemovedEvent extends IEvent
        {
            files: Array<IFileEntry>;
        }

        /*
        * Interface for a bucket being added
        */
        export interface IBucketAddedEvent extends IEvent
        {
            username: string;
            bucket: IBucketEntry
        }

        /*
        * Interface for a bucket being removed
        */
        export interface IBucketRemovedEvent extends IEvent
        {
            bucket: IBucketEntry
        }
    }

    /*
    * An interface to describe the data stored in the database for users
    */
    export interface IUserEntry
    {
        _id?: any;
        username?: string;
        email?: string;
        password?: string;
        registerKey?: string;
        sessionId?: string;
        createdOn?: number;
        lastLoggedIn?: number;
        privileges?: number;
        passwordTag?: string;
        meta?: any;
    }

    /**
    * The interface for describing each user's bucket
    */
    export interface IBucketEntry
    {
        _id?: any;
        name?: string;
        identifier?: string;
        user?: string;
        created?: number;
        memoryUsed?: number;
    }

    /**
    * The interface for describing each user's bucket
    */
    export interface IStorageStats
    {
        user?: string;
        memoryUsed?: number;
        memoryAllocated?: number;
        apiCallsUsed?: number;
        apiCallsAllocated?: number;
    }

    /**
    * The interface for describing each user's file
    */
    export interface IFileEntry
    {
        _id?: any;
        name?: string;
        user?: string;
        identifier?: string;
        bucketId?: string;
        bucketName?: string;
        publicURL?: string;
        created?: number;
        size?: number;
        mimeType?: string;
        isPublic?: boolean;
        numDownloads?: number;
        parentFile?: string;
        meta?: any;
    }

    /**
    * Adds a logged in user to the request object
    */
    export interface AuthRequest extends Express.Request
    {
        _user: User;
        _target: User;
        params: any;
        body: any;
        query: any;
    }

    /*
    * An interface to describe the data stored in the database from the sessions
    */
    export interface ISessionEntry
    {
        _id: any;
        sessionId: string;
        data: any;
        expiration: number;
    }


    /*
    * Describes the type of client listening communicating to the web sockets
    */
    export interface IWebsocketClient
    {
        /*Where is the client origin expected from*/
        origin: string;
    }

    /*
    * Users stores data on an external cloud bucket with Google
    */
    export interface IWebsocket
    {
        /**
        * The port number to use for web socket communication. You can use this port to send and receive events or messages
        * to the server.
        * e.g. 8080
        */
        port: number;

    
        /**
        * An array of expected clients
        * [
        *   { origin: "webinate.net", eventListeners: [1,4,5,6] }
        * ]
        */
        clients: Array<IWebsocketClient>;
    }

    /*
    * Users stores data on an external cloud bucket with Google
    */
    export interface IGoogleStorage
    {
        /*
        * Path to the key file
        */
        keyFile: string;

        /*
        * Project ID
        */
        projectId: string;

        /**
        * The name of the mongodb collection for storing bucket details
        * eg: "buckets"
        */
        bucketsCollection: string;

        /**
        * The name of the mongodb collection for storing file details
        * eg: "files"
        */
        filesCollection: string;

        /**
        * The name of the mongodb collection for storing user stats
        * eg: "storageAPI"
        */
        statsCollection: string;
    
        /**
        * The length of time the assets should be cached on a user's browser. 
        * eg:  2592000000 or 30 days
        */
        cacheLifetime: number;
    }

    /*
    * The default response  format
    */
    export interface IResponse
    {
        message: string;
        error: boolean;
    }

    /*
    * A GET request that returns the status of a user's authentication
    */
    export interface IAuthenticationResponse extends IResponse
    {
        authenticated: boolean;
        user: IUserEntry;
    }

    /*
    * Token used to describe how the upload went
    */
    export interface IUploadToken
    {
        file: string;
        field: string;
        filename: string;
        error: boolean;
        errorMsg: string;
        url: string;
    }

    /*
    * A POST request that returns the details of a multipart form upload
    */
    export interface IUploadResponse extends IResponse
    {
        tokens: Array<IUploadToken>
    }

    /*
    * A GET request that returns an array of data items
    */
    export interface IGetArrayResponse<T> extends IResponse
    {
        data: Array<T>;
        count: number;
    }

    /*
    * A GET request that returns a single data item
    */
    export interface IGetResponse<T> extends IResponse
    {
        data: T;
    }

    /*
    * The token used for logging in
    */
    export interface ILoginToken
    {
        username: string;
        password: string;
        rememberMe: boolean;
    }

    /*
    * The token used for registration
    */
    export interface IRegisterToken
    {
        username: string;
        password: string;
        email: string;
        captcha?: string;
        challenge?: string;
        meta?: any;
        privileges?: number;
    }

    /*
    * Represents the details of the admin user
    */
    export interface IAdminUser
    {
        username: string;
        email: string;
        password: string;
    }

    /*
    * Options for configuring the API
    */
    export interface IConfig
    {
        /**
        * The domain or host of the site. 
        * eg: "127.0.0.1" or "webinate.net"
        */
        host: string;

        /**
        * The RESTful path of this service. 
        * eg: If "/api", then the API url would be 127.0.0.1:80/api (or rather host:port/restURL)
        */
        restURL: string;

        /**
        * The RESTful path of the media API
        * eg: If "/media", then the API url would be 127.0.0.1:80/media (or rather host:port/restURL)
        */
        mediaURL: string;

        /**
        * A secret string to identify authenticated servers
        */
        secret: string;
    
        /**
        * The URL to redirect to after the user attempts to activate their account. 
        * User's can activate their account via the "/activate-account" URL, and after its validation the server will redirect to this URL
        * adding a query ?message=You%20have%20activated%20your%20account&status=success. 
        * The status can be either 'success' or 'error'
        *
        * eg: "http://localhost/notify-user"
        */
        accountRedirectURL: string;

        /**
        * The URL sent to users emails for when their password is reset. This URL should
        * resolve to a page with a form that allows users to reset their password. (MORE TO COME ON THIS)
        *
        * eg: "http://localhost/reset-password"
        */
        passwordResetURL: string;
        
        /**
        * An array of approved domains that can access this API. 
        * e.g. ["webinate\\.net", "127.0.0.1:80", "http:\/\/127.0.0.1"] etc...
        */
        approvedDomains: Array<string>;

        /**
        * The port number to use for regular HTTP requests.
        * e.g. 80
        */
        portHTTP: number;

        /**
        * The port number to use for SSL requests
        * e.g. 443
        */
        portHTTPS: number;

        /**
        * Information regarding the websocket communication. Used for events and IPC
        */
        websocket: IWebsocket;
	
        /**
        * The name of the mongo database name
        */
        databaseName: string;

        /**
        * The name of the mongodb collection for storing user details
        * eg: "users"
        */
        userCollection: string;

        /**
        * The name of the mongodb collection for storing session details
        * eg: "sessions"
        */
        sessionCollection: string;
    
        /**
        * The host the DB is listening on
        * e.g. "127.0.0.1"
        */
        databaseHost: string;

        /**
        * The port number mongodb is listening on
        * e.g. 27017
        */
        databasePort: number;

        /**
        * If true, the API will try to secure its communications
        * e.g. false/true
        */
        ssl: boolean;

        /**
        * The path to the SSL private key 
        */
        sslKey: string;

        /**
        * The path to the SSL certificate authority root file
        */
        sslRoot: string;

        /**
        * The path to the SSL certificate authority intermediate file
        */
        sslIntermediate: string;

        /**
        * The path to the SSL certificate file path
        */
        sslCert: string;

        /**
        * The SSL pass phrase (if in use)
        */
        sslPassPhrase: string;

        /*
        * If set, the session will be restricted to URLs underneath the given path.
        * By default the path is "/", which means that the same sessions will be shared across the entire domain.
        * e.g: "/"
        */
        sessionPath?: string;

        /**  
        * If present, the cookie (and hence the session) will apply to the given domain, including any subdomains.
        * For example, on a request from foo.example.org, if the domain is set to '.example.org', then this session will persist across any subdomain of example.org.
        * By default, the domain is not set, and the session will only be visible to other requests that exactly match the domain.
        * Default is blank ""
        */
        sessionDomain?: string;

        /**
        * A persistent connection is one that will last after the user closes the window and visits the site again (true).
        * A non-persistent that will forget the user once the window is closed (false)
        * e.g: true/false. Default is true
        */
        sessionPersistent?: boolean;
	
        /**
        * The default length of user sessions in seconds
        * e.g 1800
        */
        sessionLifetime?: number;

        /**
        * The private key to use for Google captcha 
        * Get your key from the captcha admin: https://www.google.com/recaptcha/intro/index.html
        */
        captchaPrivateKey: string;

        /**
        * The public key to use for Google captcha 
        * Get your key from the captcha admin: https://www.google.com/recaptcha/intro/index.html
        */
        captchaPublicKey: string;
	
        /**
        * The 'from' email when they receive an email for the server
        * eg: support@host.com
        */
        emailFrom: string;

        /**
        * Email service we are using to send mail. For example 'Gmail'
        * eg: "Gmail"
        */
        emailService: string;

        /**
        * The email address / username of the service
        * e.g: "provider@gmail.com"
        */
        emailServiceUser: string;

        /**
        * The password of the email service
        * e.g: "provider_password"
        */
        emailServicePassword: string;

        /**
        * The administrative user. This is the root user that will have access to the information in the database.
        * This can be anything you like, but try to use passwords that are hard to guess
        * eg: 
    
        "adminUser": {
                "username": "root",
                "email": "root_email@host.com",
                "password": "CHANGE_THIS_PASSWORD"
            }
        */
        adminUser: IAdminUser;

        /**
        * Information relating to the Google storage platform
        *
        "bucket": {
                "keyFile": "",
                "projectId": "",
                "bucketsCollection": "buckets",
                "filesCollection": "files"
            }
        */
        bucket: IGoogleStorage;
    }

    export interface IGetUser extends IGetResponse<IUserEntry> { }
    export interface IGetUserStorageData extends IGetResponse<IStorageStats> { }
    export interface IGetUsers extends IGetArrayResponse<IUserEntry> { count: number; }
    export interface IGetSessions extends IGetArrayResponse<ISessionEntry> { }
    export interface IGetBuckets extends IGetArrayResponse<IBucketEntry> { }
    export interface IGetFile extends IGetResponse<IFileEntry> { }
    export interface IGetFiles extends IGetArrayResponse<IFileEntry> { }
    export interface IRemoveFiles extends IGetArrayResponse<string> { }
}

declare module "webinate-users"
{
    export = UsersInterface;
}
declare module ModepressAdmin
{
    /*
    * Describes a dashboard link
    */
    export interface IDashLik
    {
        label: string;
        icon: string;
        state: string;
        children?: Array<IDashLik>;
    }

    /*
    * The interface to describe the modepress admin plugins
    */
    export interface IAdminPlugin
    {
        dashboardLinks: Array<IDashLik>;

        /**
        * Called when the application module is being setup
        */
        onInit: (mod: any) => void;

        /**
        * Called when the states are being setup in config
        */
        onStatesInit: (stateProvider: any) => void;
    }
}

declare module Modepress
{
    /*
    * Base interface for all models
    */
    export interface IModelEntry
    {
        _id?: any;
    }

    /*
    * Describes the post model
    */
    export interface IPost extends IModelEntry
    {
        author?: string;
        title?: string;
        slug?: string;
        brief?: string;
        public?: boolean;
        content?: string;
        featuredImage?: string;
        categories?: Array<string>;
        tags?: Array<string>;
        createdOn?: number;
        lastUpdated?: number;
    }

    /*
    * Describes the category model
    */
    export interface ICategory extends IModelEntry
    {
        title?: string;
        slug?: string;
        parent?: string;
        description?: string;
    }

    /*
    * The most basic response from the server. The base type of all responses.
    */
    export interface IResponse
    {
        message: string;
        error: boolean;
    }

    /*
    * A response for when bulk items are deleted
    */
    export interface IRemoveResponse extends IResponse
    {
        itemsRemoved: Array<{ id: string; error: boolean; errorMsg: string; }>;
    }

    export interface UpdateToken<T> { error: string | boolean; instance: ModelInstance<T> }

    /*
    * Describes a token returned from updating instances
    */
    export interface UpdateRequest<T> { error: boolean; tokens: Array<UpdateToken<T>> }

    /*
    * Describes the cache renders model
    */
    export interface IRender extends IModelEntry
    {
        url?: string;
        createdOn?: number;
        updateDate?: number;
        html?: string;
    }

    /*
    * A GET request that returns a data item
    */
    export interface IGetResponse<T> extends IResponse
    {
        data: T;
    }

    /*
    * A GET request that returns an array of data items
    */
    export interface IGetArrayResponse<T> extends IResponse
    {
        count: number;
        data: Array<T>;
    }

    export interface IMessage
    {
        name: string;
        email: string;
        message: string;
        phone?: string;
        website?: string;
    }

    export interface IGetRenders extends IGetArrayResponse<IRender> { }
    export interface IGetPosts extends IGetArrayResponse<IPost> { }
    export interface IGetPost extends IGetResponse<IPost> { }
    export interface IGetCategory extends IGetResponse<ICategory> { }
    export interface IGetCategories extends IGetArrayResponse<ICategory> { }

    /**
    * Describes the controller structure of plugins in the config file
    */
    export interface IControllerPlugin
    {
        path: string;
    }

    /**
    * Defines routes and the paths of a host / port
    */
    export interface IServer
    {
        /**
       * The host we listening for
       */
        host: string;

        /**
        * The length of time the assets should be cached on a user's browser. The default is 30 days.
        */
        cacheLifetime: number;

        /**
        * The port number of the host
        */
        portHTTP: number;

        /**
        * An array of domains that are CORS approved
        */
        approvedDomains: Array<string>;

        /**
        * An array of folder paths that can be used to fetch static content
        */
        staticFilesFolder: Array<string>;

        /**
        * Set to true if you want SSL turned on
        */
        ssl: boolean;

        /**
        * The port number to use for SSL. Only applicable if ssl is true.
        */
        portHTTPS: number;

        /**
        * The path of the SSL private key. Only applicable if ssl is true.
        */
        sslKey: string;

        /**
        * The path of the SSL certificate file (usually provided by a third vendor). Only applicable if ssl is true.
        */
        sslCert: string;

        /**
        * The path of the SSL root file (usually provided by a third vendor). Only applicable if ssl is true.
        */
        sslRoot: string;

        /**
        * The path of the SSL intermediate/link file (usually provided by a third vendor). Only applicable if ssl is true.
        */
        sslIntermediate: string;

        /**
        * The password to use for the SSL (optional). Only applicable if ssl is true.
        */
        sslPassPhrase: string;

        /**
        * An array of IPath objects that define routes and where they go to
        */
        paths: Array<IPath>

        /**
        * An array of controllers associated with this server
        */
        controllers: Array<IControllerPlugin>
    }

    /**
    * Defines routes and the paths they take
    */
    export interface IPath
    {
        /**
        * The name of this path
        */
        name: string;

        /**
        * The express route to use. E.g. "*" or "/some-route"
        */
        path: string;

        /**
        * The path of where to find jade templates for this route. E.g. "/templates"
        */
        templatePath: string;

        /**
        * The path or name of the template file to use. If a template path is set then the route resolves to
        * templatePath + index if the file exists. If it does then the express render function is used to send that jade file.
        * If not then the index is considered a static file and sent with the sendFile function.
        * e.g. "index"
        */
        index: string;

        /**
        * An array of javascript file paths for modepress plugins
        * e.g. ["./plugins/my-plugin/index.js"]
        */
        plugins: Array<string>;
    }

    /**
    * A server configuration
    */
    export interface IConfig
    {
        /**
        * The length of time the assets should be cached on a user's browser. The default is 30 days.
        */
        cacheLifetime: number;

        /**
        * [Optional] If set, modepress will communicate with this URL to serve SEO/social friendly renders of your site
        * e.g. "127.0.0.1:3000"
        */
        modepressRenderURL: string;

        /**
        * The name of the mongo database to use
        */
        databaseName: string;

        /**
        * The database host we are listening on
        */
        databaseHost: string;

        /**
        * The port number the mongo database is listening on
        */
        databasePort: number;

        /**
        * The URL of the webinate-users api
        */
        usersURL: string;

        /**
        * A secret token to identify this server to the Users service
        */
        usersSecret: string;

        /**
        * The path to use for accessing the admin panel
        */
        adminURL: string;

        /**
        * An array of admin javascript plugin paths
        */
        adminPlugins: Array<string>;

        /**
        * An array of javascript variables that will be inserted on the page
        */
        adminPluginVariables: { [name: string]: string };

        /**
        * An array of servers for each host / route that modepress is supporting
        */
        servers: Array<IServer>;

        /**
        * The URL to listen for events from a webinate users socket
        * eg: 'ws://www.webinate.net:123'
        */
        usersSocketURL: string;

        /**
        * Specifies the header 'origin' when connecting to the user socket. This origin must be whitelisted on the users API config file.
        * eg: 'webinate.net'
        */
        usersSocketOrigin: string;
    }

    /**
    * A definition of each item in the model
    */
    class SchemaItem<T>
    {
        public name: string;
        public value: T;
        public sensitive: boolean;

        constructor(name: string, value: T, sensitive: boolean);

        /**
        * Creates a clone of this item
        * @returns {SchemaItem} copy A sub class of the copy
        * @returns {SchemaItem}
        */
        public clone(copy?: SchemaItem<T>): SchemaItem<T>;

        /**
        * Gets if this item is sensitive
        * @returns {boolean}
        */
        public getSensitive(): boolean;

        /**
        * Sets if this item is sensitive
        * @returns {SchemaItem<T>}
        */
        public setSensitive(val: boolean);

        /**
        * Gets if this item is indexable by mongodb
        * @returns {boolean}
        */
        public getIndexable(): boolean;

        /**
        * Gets if this item represents a unique value in the database. An example might be a username
        * @returns {boolean}
        */
        public getUnique(): boolean;

        /**
        * Sets if this item is indexable by mongodb
        * @returns {SchemaItem}
        */
        public setIndexable(val?: boolean): SchemaItem<T>;

        /**
        * Sets if this item represents a unique value in the database. An example might be a username
        * @returns {SchemaItem}
        */
        public setUnique(val?: boolean): SchemaItem<T>;

        /**
        * Checks the value stored to see if its correct in its current form
        * @returns {boolean | string} Returns true if successful or an error message string if unsuccessful
        */
        public validate(): boolean | string;

        /**
        * Gets the value of this item
        * @param {boolean} sanitize If true, the item has to sanitize the data before sending it
        * @returns {SchemaValue}
        */
        public getValue(sanitize: boolean): T;

        /**
        * Gets if this item must be indexed when searching for uniqueness. For example, an item 'name' might be set as unique. But
        * we might not be checking uniqueness for all items where name is the same. It might be where name is the same, but only in
        * a given project. In this case the project item is set as a uniqueIndexer
        * @returns {boolean}
        */
        public getUniqueIndexer(): boolean;

        /**
        * Sets if this item must be indexed when searching for uniqueness. For example, an item 'name' might be set as unique. But
        * we might not be checking uniqueness for all items where name is the same. It might be where name is the same, but only in
        * a given project. In this case the project item is set as a uniqueIndexer
        * @returns {SchemaItem}
        */
        public setUniqueIndexer(val?: boolean): SchemaItem<T>;
    }

    /**
    * Gives an overall description of each property in a model
    */
    class Schema
    {
        public items: Array<SchemaItem<any>>;
        public error: string;

        constructor();

        /**
        * Creates a copy of the schema
        * @returns {Schema}
        */
        public clone(): Schema;

        /**
        * Sets a schema value by name
        * @param {string} name The name of the schema item
        * @param {any} val The new value of the item
        */
        set(name: string, val: any);

        /**
        * De-serializes the schema items from the mongodb data entry
        * @param {any} data
        */
        public deserialize(data: any): any;

        /**
        * Serializes the schema items into the JSON format for mongodb
        * @returns {any}
        */
        public serialize(): any;

        /**
        * Serializes the schema items into the JSON format for mongodb
        * @param {boolean} sanitize If true, the item has to sanitize the data before sending it
        * @param {any} id The db ID of the instance to clean
        * @returns {any}
        */
        public generateCleanData(sanitize: boolean, id: any): any;

        /**
        * Checks the value stored to see if its correct in its current form
        * @returns {boolean} Returns true if successful
        */
        public validate(): boolean;

        /**
        * Gets a schema item from this schema by name
        * @param {string} val The name of the item
        * @param {SchemaItem}
        */
        public getByName(val: string): SchemaItem<any>;

        /**
        * Adds a schema item to this schema
        * @param {SchemaItem} val The new item to add
        * @returns {SchemaItem}
        */
        public add(val: SchemaItem<any>): SchemaItem<any>;

        /**
        * Removes a schema item from this schema
        * @param {SchemaItem|string} val The name of the item or the item itself
        */
        public remove(val: SchemaItem<any> | string);
    }

    /**
    * An instance of a model with its own unique schema and ID. The initial schema is a clone
    * the parent model's
    */
    class ModelInstance<T>
    {
        public model: Model;
        public schema: Schema;
        public dbEntry: T;
        public _id: any;

        /**
        * Creates a model instance
        */
        constructor(model: Model, dbEntry: T);
    }

    /**
    * Models map data in the application/client to data in the database
    */
    export class Model
    {
        public collection: any;
        public defaultSchema: Schema;

        /**
        * Creates an instance of a Model
        * @param {string} collection The collection name associated with this model
        */
        constructor(collection: string);

        /**
        * Gets the name of the collection associated with this model
        * @returns {string}
        */
        collectionName: string;

        /**
        * Initializes the model by setting up the database collections
        * @param {mongodb.Db} db The database used to create this model
        * @returns {Promise<mongodb.Db>}
        */
        initialize(db: any): Promise<Model>;

        /**
        * Gets the number of DB entries based on the selector
        * @param {any} selector The mongodb selector
        * @returns {Promise<Array<ModelInstance>>}
        */
        count(selector: any): Promise<number>;

        /**
        * Gets an arrray of instances based on the selector search criteria
        * @param {any} selector The mongodb selector
        * @param {any} sort Specify an array of items to sort.
        * Each item key represents a field, and its associated number can be either 1 or -1 (asc / desc)
        * @param {number} startIndex The start index of where to select from
        * @param {number} limit The number of results to fetch
        * @param {any} projection See http://docs.mongodb.org/manual/reference/method/db.collection.find/#projections
        * @returns {Promise<Array<ModelInstance>>}
        */
        findInstances<T>(selector: any, sort?: any, startIndex?: number, limit?: number, projection?: any): Promise<Array<ModelInstance<T>>>;

        /**
        * Gets a model instance based on the selector criteria
        * @param {any} selector The mongodb selector
        * @param {any} projection See http://docs.mongodb.org/manual/reference/method/db.collection.find/#projections
        * @returns {Promise<ModelInstance<T>>}
        */
        findOne<T>(selector: any, projection?: any): Promise<ModelInstance<T>>;

        /**
        * Deletes a number of instances based on the selector. The promise reports how many items were deleted
        * @returns {Promise<number>}
        */
        deleteInstances(selector: any): Promise<number>;

        /**
        * Updates a selection of instances. The update process will fetch all instances, validate the new data and check that
        * unique fields are still being respected. An array is returned of each instance along with an error string if anything went wrong
        * with updating the specific instance.
        * @param {any} selector The selector for updating instances
        * @param {any} data The data object that will attempt to set the instance's schema variables
        * @returns {Promise<UpdateRequest<T>>} An array of objects that contains the field error and instance. Error is false if nothing
        * went wrong when updating the specific instance, and a string message if something did in fact go wrong
        */
        update<T>(selector: any, data: T): Promise<UpdateRequest<T>>

        /**
        * Creates a new model instance. The default schema is saved in the database and an instance is returned on success.
        * @param {any} data [Optional] You can pass a data object that will attempt to set the instance's schema variables
        * by parsing the data object and setting each schema item's value by the name/value in the data object.
        * @returns {Promise<boolean>}
        */
        checkUniqueness<T>(instance: ModelInstance<T>): Promise<boolean>;

        /**
        * Creates a new model instance. The default schema is saved in the database and an instance is returned on success.
        * @param {any} data [Optional] You can pass a data object that will attempt to set the instance's schema variables
        * by parsing the data object and setting each schema item's value by the name/value in the data object.
        * @returns {Promise<ModelInstance>}
        */
        createInstance<T>(data?: any): Promise<ModelInstance<T>>;

        /**
        * Attempts to insert an array of instances of this model into the database.
        * @param {Promise<Array<ModelInstance>>} instances An array of instances to save
        * @returns {Promise<Array<ModelInstance>>}
        */
        insert<T>(instances: Array<ModelInstance<T>>): Promise<Array<ModelInstance<T>>>;

    }

    export class Controller
    {
        constructor(models: Array<Model>);

        /**
        * Called to initialize this controller and its related database objects
        * @param {mongodb.Db} db The mongo database to use
        * @returns {Promise<Controller>}
        */
        initialize(db: any): Promise<Controller>;

        /**
        * Gets a model by its collection name
        * returns {models.Model}
        */
        getModel(collectionName: string): Model;

        /**
        * Transforms an array of model instances to its data ready state that can be sent to the client
        * @param {ModelInstance} instances The instances to transform
        * @param {boolean} instances If true, sensitive data will not be sanitized
        * @returns {Array<T>}
        */
        getSanitizedData<T>(instances: Array<ModelInstance<T>>, verbose?: boolean): Array<T>;
    }

    /**
    * Singleton service for communicating with a webinate-users server
    */
    export class UsersService
    {
        public static usersURL: string;

        /**
        * Creates an instance of the service
        * @param {string} usersURL The URL of the user management service
        */
        constructor(usersURL: string);

        /**
        * Sends an email to the admin account
        * @param {string} message The message to send
        * @returns {Promise<any>}
        */
        sendAdminEmail(message: string): Promise<any>;

        /**
        * Sets a meta value by name for the specified user
        * @param {string} name The name of the meta value
        * @param {any} val The value to set
        * @param {string} user The username of the target user
        * @param {Request} req
        * @param {Response} res
        * @returns {Promise<UsersInterface.IResponse>}
        */
        setMetaValue(name: string, val: any, user: string, req, res): Promise<UsersInterface.IResponse>;

        /**
        * Checks if a user is logged in and authenticated
        * @param {express.Request} req
        * @param {express.Request} res
        * @returns {Promise<UsersInterface.IAuthenticationResponse>}
        */
        authenticated(req: any, res: any): Promise<UsersInterface.IAuthenticationResponse>;

        /**
        * Checks a user has the desired permission
        * @param {UsersInterface.IUserEntry} user The user we are checking
        * @param {UsersInterface.UserPrivileges} level The level we are checking against
        * @param {string} existingUser [Optional] If specified this also checks if the authenticated user is the user making the request
        * @returns {boolean}
        */
        hasPermission(user: UsersInterface.IUserEntry, level: number, existingUser?: string): boolean;

        /**
	    * Attempts to log a user in
        * @param {string} user The email or username
        * @param {string} password The users password
        * @param {boolean} remember
	    * @returns {Promise<UsersInterface.IAuthenticationResponse>}
	    */
        login(user: string, password: string, remember: boolean): Promise<UsersInterface.IAuthenticationResponse>;

        /**
        * Attempts to get a user by username or email
        * @param {string} user The username or email
        * @param {Request} req
        */
        getUser(user: string, req: Express.Request): Promise<UsersInterface.IGetUser>;

        /**
        * Gets the user singleton
        * @returns {UsersService}
        */
        public static getSingleton(usersURL?: string): UsersService;
    }

    /**
    * Describes the type of number to store
    */
    enum NumberType
    {
        Integer,
        Float
    }

    /**
    * A numeric schema item for use in Models
    */
    class SchemaNumber extends SchemaItem<number>
    {
        /**
        * Creates a new schema item
        * @param {string} name The name of this item
        * @param {number} val The default value of this item
        * @param {number} min [Optional] The minimum value the value can be
        * @param {number} max [Optional] The maximum value the value can be
        * @param {NumberType} type [Optional] The type of number the schema represents
        * @param {number} decimalPlaces [Optional] The number of decimal places to use if the type is a Float
        * @param {boolean} sensitive [Optional] If true, this item is treated sensitively and only authorised people can view it
        */
        constructor(name: string, val: number, min?: number, max?: number, type?: NumberType, decimalPlaces?: number, sensitive?: boolean)
    }

    /**
    * A text scheme item for use in Models
    */
    class SchemaText extends SchemaItem<string>
    {
        /**
        * Creates a new schema item
        * @param {string} name The name of this item
        * @param {string} val The text of this item
        * @param {number} minCharacters [Optional] Specify the minimum number of characters for use with this text item
        * @param {number} maxCharacters [Optional] Specify the maximum number of characters for use with this text item
        * @param {boolean} sensitive [Optional] If true, this item is treated sensitively and only authorised people can view it
        */
        constructor(name: string, val: string, minCharacters?: number, maxCharacters?: number, sensitive?: boolean);
    }

    /**
    * A n ID array scheme item for use in Models
    */
    export class SchemaIdArray extends SchemaItem<Array<any>>
    {
        /**
        * Creates a new schema item that holds an array of id items
        * @param {string} name The name of this item
        * @param {Array<string|ObjectID>} val The array of ids for this schema item
        * @param {number} minItems [Optional] Specify the minimum number of items that can be allowed
        * @param {number} maxItems [Optional] Specify the maximum number of items that can be allowed
        * @param {boolean} sensitive [Optional] If true, this item is treated sensitively and only authorised people can view it
        */
        constructor(name: string, val: Array<string>, minItems?: number, maxItems?: number, sensitive?: boolean);
    }

    /**
    * A number array scheme item for use in Models
    */
    export class SchemaNumArray extends SchemaItem<Array<number>>
    {
        /**
        * Creates a new schema item that holds an array of number items
        * @param {string} name The name of this item
        * @param {Array<number>} val The number array of this schema item
        * @param {number} minItems [Optional] Specify the minimum number of items that can be allowed
        * @param {number} maxItems [Optional] Specify the maximum number of items that can be allowed
        * @param {number} min [Optional] Specify the minimum a number can be
        * @param {number} max [Optional] Specify the maximum a number can be
        * @param {NumberType} type [Optional] What type of numbers to expect
        * @param {number} decimalPlaces [Optional] The number of decimal places to use if the type is a Float
        * @param {boolean} sensitive [Optional] If true, this item is treated sensitively and only authorised people can view it
        */
        constructor(name: string, val: Array<number>, minItems?: number, maxItems?: number, min?: number, max?: number, type?: NumberType, decimalPlaces?, sensitive?: boolean)
    }

    /**
    * A text scheme item for use in Models
    */
    class SchemaTextArray extends SchemaItem<Array<string>>
    {
        /**
        * Creates a new schema item that holds an array of text items
        * @param {string} name The name of this item
        * @param {Array<string>} val The text array of this schema item
        * @param {number} minItems [Optional] Specify the minimum number of items that can be allowed
        * @param {number} maxItems [Optional] Specify the maximum number of items that can be allowed
        * @param {number} minCharacters [Optional] Specify the minimum number of characters for each text item
        * @param {number} maxCharacters [Optional] Specify the maximum number of characters for each text item
        * @param {boolean} sensitive [Optional] If true, this item is treated sensitively and only authorised people can view it
        */
        constructor(name: string, val: Array<string>, minItems?: number, maxItems?: number, minCharacters?: number, maxCharacters?: number, sensitive?: boolean);
    }

    /**
    * A bool scheme item for use in Models
    */
    class SchemaBool extends SchemaItem<boolean>
    {
        /**
        * Creates a new schema item
        * @param {string} name The name of this item
        * @param {boolean} val The value of this item
        * @param {boolean} sensitive [Optional] If true, this item is treated sensitively and only authorised people can view it
        */
        constructor(name: string, val: boolean, sensitive?: boolean);
    }

    /**
    * A json scheme item for use in Models
    */
    class SchemaJSON extends SchemaItem<any>
    {
        /**
        * Creates a new schema item
        * @param {string} name The name of this item
        * @param {any} val The text of this item
        * @param {boolean} sensitive [Optional] If true, this item is treated sensitively and only authorised people can view it
        */
        constructor(name: string, val: any, sensitive: boolean);
    }

    /**
    * A date scheme item for use in Models
    */
    class SchemaDate extends SchemaItem<number>
    {
        public useNow: boolean;

        /**
        * Creates a new schema item
        * @param {string} name The name of this item
        * @param {number} val The date of this item. If none is specified the Date.now() number is used.
        * @param {boolean} sensitive [Optional] If true, this item is treated sensitively and only authorised people can view it
        * @param {boolean} useNow [Optional] If true, the date will always be updated to use the current date
        */
        constructor(name: string, val?: number, sensitive?: boolean, useNow?: boolean);
    }

    /**
    * A mongodb ObjectID scheme item for use in Models
    */
    export class SchemaId extends SchemaItem<any>
    {
        private _str: string;

        /**
        * Creates a new schema item
        * @param {string} name The name of this item
        * @param {string} val The string representation of the object ID
        * @param {boolean} sensitive [Optional] If true, this item is treated sensitively and only authorised people can view it
        */
        constructor(name: string, val: string, sensitive?: boolean);
    }

    /**
    * An html scheme item for use in Models
    */
    export class SchemaHtml extends SchemaItem<string>
    {
        /**
        * The default tags allowed
        */
        public static defaultTags: Array<string>;

        /**
        * The default allowed attributes for each tag
        */
        public static defaultAllowedAttributes: { [name: string]: Array<string> };

        /**
        * Creates a new schema item
        * @param {string} name The name of this item
        * @param {string} val The text of this item
        * @param {Array<string>} allowedTags The tags allowed by the html parser
        * @param {[name: string] : Array<string>} allowedAttributes The attributes allowed by each attribute
        * @param {boolean} errorBadHTML If true, the server will disallow a save or insert value with banned html. If false, the value will be transformed silently for you
        * @param {number} minCharacters [Optional] Specify the minimum number of characters for use with this text item
        * @param {number} maxCharacters [Optional] Specify the maximum number of characters for use with this text item
        * @param {boolean} sensitive [Optional] If true, this item is treated sensitively and only authorised people can view it
        */
        constructor(name: string, val: string, allowedTags?: Array<string>,
            allowedAttributes?: { [name: string]: Array<string> },
            errorBadHTML?: boolean, minCharacters?: number, maxCharacters?: number, sensitive?: boolean);
    }

    /**
    * A list of helper functions for creating schema items
    */
    export module SchemaFactory
    {
        export var num: typeof SchemaNumber;
        export var text: typeof SchemaText;
        export var textArray: typeof SchemaTextArray;
        export var json: typeof SchemaJSON;
        export var numArray: typeof SchemaNumArray;
        export var idArray: typeof SchemaIdArray;
        export var date: typeof SchemaDate;
        export var bool: typeof SchemaBool;
        export var id: typeof SchemaId;
        export var html: typeof SchemaHtml;
    }

    /**
    * The type of user event
    */
    export enum UserEventType
    {
        Login,
        Logout,
        Activated,
        Removed,
        FilesUploaded,
        FilesRemoved
    }

    /**
    * Describes the user event sent to plugins
    */
    export interface UserEvent
    {
        username: string;
        eventType: UserEventType;
    }

    /**
    * A class for handling events sent from a webinate user server
    */
    export class EventManager implements NodeJS.EventEmitter
    {
        static singleton: EventManager;

        addListener(event: string, listener: Function): NodeJS.EventEmitter;
        on(event: string, listener: Function): NodeJS.EventEmitter;
        once(event: string, listener: Function): NodeJS.EventEmitter;
        removeListener(event: string, listener: Function): NodeJS.EventEmitter;
        removeAllListeners(event?: string): NodeJS.EventEmitter;
        setMaxListeners(n: number): void;
        listeners(event: string): Function[];
        emit(event: string, ...args: any[]): boolean;
    }

    export interface IAuthReq extends Express.Request
    {
        _isAdmin: boolean;
        _verbose: boolean;
        _user: UsersInterface.IUserEntry;
        body: any;
        headers: any;
        params: any;
        query: any;
    }

    /**
    * This funciton checks if user is logged in
    * @param {express.Request} req
    * @param {express.Response} res
    * @param {Function} next
    */
    export function isAdmin(req: IAuthReq, res: Express.Response, next: Function);

    /**
    * This funciton checks if the logged in user can make changes to a target 'user'  defined in the express.params
    * @param {express.Request} req
    * @param {express.Response} res
    * @param {Function} next
    */
    export function canEdit(req: IAuthReq, res: Express.Response, next: Function);

    /**
    * This funciton checks if user is logged in
    * @param {express.Request} req
    * @param {express.Response} res
    * @param {Function} next
    */
    export function getUser(req: IAuthReq, res: Express.Response, next: Function);

    /**
    * This funciton checks the logged in user is an admin. If not an error is thrown
    * @param {express.Request} req
    * @param {express.Response} res
    * @param {Function} next
    */
    export function isAuthenticated(req: IAuthReq, res: Express.Response, next: Function);

    /**
    * Checks a string to see if its a valid mongo id
    * @param {string} str
    * @returns {boolean} True if the string is valid
    */
    export function isValidID(str: string): boolean;
}

declare module "modepress-api"
{
    export = Modepress;
}
declare module Engine
{
    export interface IResource
    {
        name?: string;
        projectId?: any;
        user?: string;
        shallowId?: number;
        createdOn?: number;
        lastModified?: number;
        _id?: any;
    }

    /**
    * The interface for working with scripts
    */
    export interface IScript extends IResource
    {
        onEnter?: string;
        onInitialize?: string;
        onDispose?: string;
        onFrame?: string;
    }

    /**
    * An interface that is used to describe the assets model
    */
    export interface IAsset extends IResource
    {
        className?: string;
        json?: Array<{ name: string; category: string; value: any; type: string; }>;
    }

    /**
    * An interface that is used to describe project behaviours
    */
    export interface IContainer extends IResource
    {
        json?: string | any;
    }

    /**
    * An interface that is used to describe project groups
    */
    export interface IGroup extends IResource
    {
        items?: Array<number>;
    }

    /**
    * An interface that is used to describe the plugin model
    */
    export interface IPlugin
    {
        name?: string;
        description?: string;
        url?: string;
        plan?: number;
        deployables?: Array<string>;
        image?: string;
        author?: string;
        version?: string;
        createdOn?: number;
        lastModified?: number;
        isPublic?: boolean;
        _id?: any;
    }

    /**
    * An interface that is used to describe the project model
    */
    export interface IProject
    {
        name?: string;
        description?: string;
        image?: string;
        category?: string;
        subCategory?: string;
        public?: boolean;
        curFile?: string;
        rating?: number;
        suspicious?: boolean;
        deleted?: boolean;
        numRaters?: number;
        user?: string;
        build?: any;
        type?: number;
        tags?: Array<string>;
        readPrivileges?: Array<string>;
        writePrivileges?: Array<string>;
        adminPrivileges?: Array<string>;
        plugins?: Array<any>;
        files?: Array<string>;
        createdOn?: number;
        lastModified?: number;
        _id?: any;  
    }
    
    /**
    * An interface that is used to describe the user's engine details
    */
    export interface IUserMeta
    {
        user?: string;
        bio?: string;
        image?: any;
        plan?: number;
        website?: string;
        customerId?: string;
        maxProjects?: number;
        _id?: any;
    }

    /**
    * An interface that is used to describe a project build
    */
    export interface IBuild
    {
        name?: string;
        projectId?: any;
        user?: string;
        _id?: any;
        notes?: string;
        version?: string;
        public?: boolean;
        html?: string;
        css?: string;
        liveHTML?: string;
        liveLink?: string;
        liveToken?: string;
        totalVotes?: number;
        totalVoters?: number;
        createdOn?: number;
        lastModified?: number;
    }

  

    /**
    * An interface that is used to describe users files
    */
    export interface IFile extends IResource
    {
        url?: string;
        tags ?: Array<string>;
        extension?: string;
        previewUrl ?: string;
        global ?: boolean;
        favourite?: boolean;
        browsable?: boolean;
        size ?: number;
        bucketId?: string;
        bucketName?: string;
        identifier?: string;
    }

    /**
    * An interface to describe the meta data we react to with file uploads
    */
    export interface IFileMeta extends IResource
    {
        browsable: boolean;
    }
}

declare module ModepressAddons
{
    export interface ICreateProject extends Modepress.IGetResponse<Engine.IProject> { }
    export interface ICreateResource<T> extends Modepress.IGetResponse<T> { }
    export interface ICreateAsset extends Modepress.IGetResponse<Engine.IAsset> { }
    export interface ICreateBehaviour extends Modepress.IGetResponse<Engine.IContainer> { }
    export interface ICreateFile extends Modepress.IGetResponse<Engine.IFile> { }
    export interface ICreateGroup extends Modepress.IGetResponse<Engine.IGroup> { }
    export interface ICreatePlugin extends Modepress.IGetResponse<Engine.IPlugin> { }
    export interface ICreateBuild extends Modepress.IGetResponse<Engine.IBuild> { }

    export interface IGetBuilds extends Modepress.IGetArrayResponse<Engine.IBuild> { }
    export interface IGetProjects extends Modepress.IGetArrayResponse<Engine.IProject> { }
    export interface IGetDetails extends Modepress.IGetResponse<Engine.IUserMeta> { }
    export interface IGetBehaviours extends Modepress.IGetArrayResponse<Engine.IContainer> { }
    export interface IGetFiles extends Modepress.IGetArrayResponse<Engine.IFile> { }
    export interface IGetGroups extends Modepress.IGetArrayResponse<Engine.IGroup> { }
    export interface IGetAssets extends Modepress.IGetArrayResponse<Engine.IAsset> { }
    export interface IGetPlugins extends Modepress.IGetArrayResponse<Engine.IPlugin> { }
    export interface IGetResources extends Modepress.IGetArrayResponse<Engine.IResource> { }
}

declare module "engine" {
    export = Engine;
}

declare module "modepress-addons"
{
    export = ModepressAddons;
}
declare module Engine
{
    // Extends the IProject interface to include additional data
    export interface IProject
    {
        $plugins?: Array<IPlugin>;
    }

    // Extends the IPlugin interface to include additional data
    export interface IPlugin
    {
        $loaded?: boolean;
        $instance?: Animate.IPlugin;
    }
}
declare module Animate
{
    /**
    * A simple interface for any component
    */
    export interface IComponent
    {
        element: JQuery;
        parent: IComponent;
        dispose(): void;
        addChild(child: string): IComponent;
        addChild(child: IComponent): IComponent;
        addChild(child: any): IComponent;
        removeChild(child: IComponent): IComponent
        update(): void;
        selected: boolean;
        savedID: string;
        id: string;
        children: Array<IComponent>;
        clear(): void;
        disposed: boolean;
        onDelete(): void;
    }

    /**
	* A simple interface for any compent that needs to act as a Docker parent.
	*/
    export interface IDockItem extends IComponent
    {
		/*This is called by a controlling Docker class. An image string needs to be returned
		* which will act as a preview of the component that is being viewed or hidden.*/
        getPreviewImage(): string;

        /*This is called by a controlling Docker class when the component needs to be shown.*/
        onShow(): void;

        /*Each IDock item needs to implement this so that we can keep track of where it moves.*/
        getDocker(): Docker;

        /*Each IDock item needs to implement this so that we can keep track of where it moves.*/
        setDocker(dockItem: Docker);

        /*This is called by a controlling Docker class when the component needs to be hidden.*/
        onHide(): void;
    }

    /**
	* The IPlugin interface defines how a plugin interacts with app-engine
	*/
    export interface IPlugin
    {
		/**
		* This function is called by Animate to get an array of
		* behvaiour definitions. These definitions describe what kind
		* behvaiours a user can create in the scene.
		* @returns {Array<BehaviourDefinition>}
		*/
        getBehaviourDefinitions(): Array<BehaviourDefinition>;

		/**
		* This function is called when we need to create a preview for a file that is associated with a project
		* @param {File} file The file that needs to be previewed
		* @param {Component} previewComponent The component which will act as the parent div of the preview.
		* @returns {boolean} Return true if this is handled or false if not.
		*/
        onDisplayPreview(file: Engine.IFile, previewComponent: Component): boolean;

		/**
		* This function is called by Animate to get an array of TypeConverters. TypeConverter objects define if one type can be translated to another. They also define what the process of conversion will be.
		*/
        getTypeConverters(): Array<TypeConverter>;

		/**
		* This function is called by Animate to get an array of
		* AssetsTemplate. The AssetsTemplate object is used to define what assets are available to the scene.
		* Assets are predefined tempaltes of data that can be instantiated. The best way to think of an asset
		* is to think of it as a predefined object that contains a number of variables. You could for example
		* create Assets like cats, dogs, animals or humans. Its really up you the plugin writer how they want
		* to define their assets. This function can return null if no Assets are required.
		* @returns <Array> Returns an array of <AssetTemplate> objects
		*/
        getAssetsTemplate(): Array<AssetTemplate>;

		/**
		* This function is called by Animate when its time to unload a plugin. This should be used
		* to cleanup all resources used by the plugin
		*/
        unload(): void;

		/**
		* Plugins can return an array of extensions that are allowed to be uploaded for Asset files. For example
		* your plugin might require images and so would allow png and jpg files.
		* Each extension must just be in the following format: ["png", "jpg" ..etc]
		* @param {Array<string>} extArray The array of allowed extensions that are so far allowed.
		* @returns {Array<string>} An array of allowed file extensions.
		*/
        getFileUploadExtensions(extArray: Array<string>): Array<string>;
    }

    /**
	* A basic wrapper for a Portal interface
	*/
    export class IPortal
    {
        name: string;
        type: number;
        custom: boolean;
        property: any;
    }

    /**
	* A basic wrapper for a CanvasItem interface
	*/
    export interface ICanvasItem
    {
        shallowId: number;
        type: number;
        left?: string;
        top?: string;
    }

    /**
	* A basic wrapper for a Link interface
	*/
    export interface ILinkItem extends ICanvasItem
    {
        frameDelay: number;
        startPortal: string;
        endPortal: string;
        startBehaviour: number;
        endBehaviour: number;
    }

    /**
	* A basic wrapper for a Behaviour interface
	*/
    export interface IBehaviour extends ICanvasItem
    {
        alias: string;
        text: string;
        portals: Array<IPortal>
    }

    /**
    * A basic wrapper for a BehaviourPortal interface
    */
    export interface IBehaviourPortal extends IBehaviour
    {
        portal: IPortal;
    }

    /**
    * A basic wrapper for a BehaviourComment interface
    */
    export interface IBehaviourComment extends IBehaviour
    {
        width: number;
        height: number;
    }

    /**
	* A basic wrapper for a BehaviourScript interface
	*/
    export interface IBehaviourScript extends IBehaviour
    {
        scriptId: string;
    }

    /**
	* A basic wrapper for a BehaviourShortcut interface
	*/
    export interface IBehaviourShortcut extends IBehaviour
    {
        originalId: number;
    }

    /**
	* A basic interface for a container object
	*/
    export interface IContainerToken
    {
        items: Array<ICanvasItem>;
        properties: any;
    }

    export interface IPreviewFactory
    {
        /**
        * This function generates an html node that is used to preview a file
        * @param {Engine.IFile} file The file we are looking to preview
        * @param {(file: Engine.IFile, image: HTMLCanvasElement | HTMLImageElement) => void} updatePreviewImg A function we can use to update the file's preview image
        * @returns {Node} If a node is returned, the factory is responsible for showing the preview. The node will be added to the DOM. If null is returned then the engine
        * will continue looking for a factory than can preview the file
        */
        generate(file: Engine.IFile, updatePreviewImg: (file: Engine.IFile, image: HTMLCanvasElement | HTMLImageElement) => void): Node;
    }

    export interface ISettingsPage extends IComponent
    {
        onShow(project: Project, user: User);
        name: string;
        onTab(): void;
    }
}
declare var config: {
    "version": string;
    "userServiceUrl": string;
    "host": string;
};
declare module Animate {
    type CompiledEval = (ctrl, event, elm, contexts) => any;
    interface IDirective {
        expand(expression: string, ctrl: any, desc: DescriptorNode, instance: InstanceNode): Array<AppNode>;
    }
    interface AppNode extends Node {
        $ieTextNodes: Array<AppNode>;
        $expression: string;
        $expressionType: string;
        $compliledEval: {
            [name: number]: CompiledEval;
        };
        $ctxValues: Array<{
            name: string;
            value: any;
        }>;
        $events: Array<{
            name: string;
            tag: string;
            func: any;
        }>;
        $dynamic: boolean;
        $clonedData: any;
    }
    interface InstanceNode extends AppNode {
        $clonedElements: Array<AppNode>;
    }
    interface DescriptorNode extends InstanceNode {
        $originalNode: AppNode;
    }
    interface RootNode extends AppNode {
        $ctrl: any;
        $commentReferences: {
            [id: string]: DescriptorNode;
        };
    }
    interface NodeInput extends HTMLInputElement {
        $error: boolean;
        $autoClear: boolean;
        $validate: boolean;
        $value: string;
    }
    interface NodeForm extends HTMLFormElement {
        $error: boolean;
        $errorExpression: string;
        $errorInput: string;
        $pristine: boolean;
        $autoClear: boolean;
    }
    /**
    * Defines a set of functions for compiling template commands and a controller object.
    */
    class Compiler {
        static directives: {
            [name: string]: IDirective;
        };
        private static attrs;
        private static $commentRefIDCounter;
        static validators: {
            "alpha-numeric": {
                regex: RegExp;
                name: string;
                negate: boolean;
            };
            "non-empty": {
                regex: RegExp;
                name: string;
                negate: boolean;
            };
            "alpha-numeric-plus": {
                regex: RegExp;
                name: string;
                negate: boolean;
            };
            "email-plus": {
                regex: RegExp;
                name: string;
                negate: boolean;
            };
            "email": {
                regex: RegExp;
                name: string;
                negate: boolean;
            };
            "no-html": {
                regex: RegExp;
                name: string;
                negate: boolean;
            };
        };
        /**
        * Clones each of the nodes and their custom attributes
        * @param {Node} node The node to clone
        * @returns {Node}
        */
        static cloneNode(node: AppNode): Node;
        /**
        * Given a string, this function will compile it into machine code that can be stored and run
        * @param {string} script The script to compile
        * @param {AppNode} elm The element whose attributes require the compilation
        * @param {Array<any>} $ctxValues [Optional] Context values passed down from any dynamically generated HTML. The array consists
        * of key object pairs that are translated into variables for use in the script.
        * @returns {CompiledEval}
        */
        private static compileEval(script, elm, $ctxValues?);
        /**
        * Compilers and runs a script which then should return a value
        * @param {string} script The script to compile
        * @param {any} ctrl The controller associated with the compile evaluation
        * @param {AppNode} elm The element whose attributes require the compilation
        * @param {Array<any>} $ctxValues [Optional] Context values passed down from any dynamically generated HTML. The array consists
        * of key object pairs that are translated into variables for use in the script.
        * @returns {CompiledEval}
        * @return {any}
        */
        static parse(script: string, ctrl: any, event: any, elm: AppNode, $ctxValues?: Array<any>): any;
        /**
        * Evaluates an expression and assigns new CSS styles based on the object returned
        */
        static digestCSS(elm: AppNode, controller: any, value: string): void;
        /**
        * Clones an object and creates a new identical object. This does not return the same class - only a copy of each of its properties
        * @param {any} obj The object to clone
        * @returns {any}
        */
        static clone(obj: any, deepCopy?: boolean): any;
        /**
        * Checks each  of the properties of an obejct to see if its the same as another
        * @param {any} a The first object to check
        * @param {any} b The target we are comparing against
        * @returns {boolean}
        */
        static isEquivalent(a: any, b: any): boolean;
        /**
        * Evaluates an expression and assigns new CSS styles based on the object returned
        */
        static digestStyle(elm: AppNode, controller: any, value: string): void;
        /**
        * Removes all registered events from the node
        * @param {Element} elem The element to remove events from
        */
        static removeEvents(elem: Element): void;
        /**
        * Traverses an element down to its child nodes
        * @param {Node} elm The element to traverse
        * @param {Function} callback The callback is called for each child element
        */
        static traverse(elm: Node, callback: Function): void;
        /**
        * Called to remove and clean any dynamic nodes that were added to the node
        * @param {DescriptorNode} sourceNode The parent node from which we are removing clones from
        */
        static cleanupNode(appNode: AppNode): void;
        /**
        * Explores and enflates the html nodes with enflatable expressions present (eg: en-repeat)
        * @param {RootNode} root The root element to explore
        * @param {any} ctrl The controller
        * @param {boolean} includeSubTemplates When traversing the template - should the compiler continue if it finds a child element with an associated controller
        */
        static expand(root: RootNode, ctrl: any, includeSubTemplates?: boolean): Element;
        /**
        * Registers an internal function reference for later cleanup
        * @param {AppNode} node The element we are attaching events to
        * @param {string} name The name of the event
        * @param {any} func The function to call
        */
        static registerFunc(node: AppNode, name: string, tag: string, func: any): void;
        /**
        * Goes through any expressions in the element and updates them according to the expression result.
        * @param {JQuery} elm The element to traverse
        * @param {any} controller The controller associated with the element
        * @param {boolean} includeSubTemplates When traversing the template - should the compiler continue if it finds a child element with an associated controller
        * @returns {Element}
        */
        static digest(jElem: JQuery, controller: any, includeSubTemplates?: boolean): Element;
        static validateNode(elem: NodeInput): void;
        /**
        * Checks each of the validation expressions on an input element. Used to set form and input states like form.$error
        * @param {string} value The list of expression names separated by |
        * @param {HTMLInputElement| HTMLTextAreaElement} elem The element to traverse
        */
        static checkValidations(value: string, elem: HTMLInputElement | HTMLTextAreaElement): boolean;
        /**
        * Given an model directive, any transform commands will change the model's object into something else
        * @param {string} value The list of expression names separated by |
        * @param {HTMLInputElement| HTMLTextAreaElement} elem The element to traverse
        */
        static transform(script: string, elem: HTMLInputElement | HTMLTextAreaElement, controller: any): any;
        /**
        * Goes through an element and prepares it for the compiler. This usually involves adding event listeners
        * and manipulating the DOM. This should only really be called once per element. If you need to update the
        * element after compilation you can use the digest method
        * @param {JQuery} elm The element to traverse
        * @param {any} ctrl The controller associated with the element
        * @param {boolean} includeSubTemplates When traversing the template - should the compiler continue if it finds a child element with an associated controller
        * @returns {JQuery}
        */
        static build(elm: JQuery, ctrl: any, includeSubTemplates?: boolean): JQuery;
    }
}
declare module Animate {
    class Repeater implements IDirective {
        private _returnVal;
        constructor();
        expand(expression: string, ctrl: any, desc: DescriptorNode, instance: InstanceNode): Array<AppNode>;
    }
}
declare module Animate {
    class If implements IDirective {
        private _returnVal;
        constructor();
        expand(expression: string, ctrl: any, desc: DescriptorNode, instance: InstanceNode): Array<AppNode>;
    }
}
declare module Animate {
    module EventTypes {
        const PORTAL_ADDED: string;
        const PORTAL_REMOVED: string;
        const PORTAL_EDITED: string;
        const CONTAINER_DELETED: string;
        const CONTAINER_SELECTED: string;
        const CONTAINER_CREATED: string;
    }
    /**
    * Defines which types of files to search through
    */
    enum FileSearchType {
        Global = 0,
        User = 1,
        Project = 2,
    }
    enum PortalType {
        PARAMETER = 0,
        PRODUCT = 1,
        INPUT = 2,
        OUTPUT = 3,
    }
    enum UserPlan {
        Free = 1,
        Bronze = 2,
        Silver = 3,
        Gold = 4,
        Platinum = 5,
        Custom = 6,
    }
    enum ResourceType {
        GROUP = 1,
        ASSET = 2,
        CONTAINER = 3,
        FILE = 4,
        SCRIPT = 5,
    }
    /**
    * Describes the type of access users have to a project
    */
    enum PrivilegeType {
        NONE = 0,
        READ = 1,
        WRITE = 2,
        ADMIN = 3,
    }
    /**
    * Describes the category of a project
    */
    enum Category {
        Other = 1,
        Artistic = 2,
        Gaming = 3,
        Informative = 4,
        Musical = 5,
        Technical = 6,
        Promotional = 7,
    }
    /**
    * Describes a property type
    */
    enum PropertyType {
        ASSET = 0,
        ASSET_LIST = 1,
        NUMBER = 2,
        COLOR = 3,
        GROUP = 4,
        FILE = 5,
        STRING = 6,
        OBJECT = 7,
        BOOL = 8,
        ENUM = 9,
        HIDDEN = 10,
        HIDDEN_FILE = 11,
        OPTIONS = 12,
    }
    /**
    * Describes the type of canvas item to create
    */
    enum CanvasItemType {
        Link = 0,
        Behaviour = 1,
        BehaviourAsset = 2,
        BehaviourShortcut = 3,
        BehaviourPortal = 4,
        BehaviourScript = 5,
        BehaviourComment = 6,
        BehaviourInstance = 7,
    }
}
declare module Animate {
    /**
    * Base class for all custom enums
    */
    class ENUM {
        private static allEnums;
        value: string;
        constructor(v: string);
        toString(): string;
    }
    type EventType = ENUM | string;
    type EventCallback = (type: EventType, event: Event, sender?: EventDispatcher) => void;
    /**
    * Internal class only used internally by the {EventDispatcher}
    */
    class EventListener {
        type: EventType;
        func: EventCallback;
        context: any;
        constructor(type: EventType, func: EventCallback, context?: any);
    }
    /**
    * The base class for all events dispatched by the {EventDispatcher}
    */
    class Event {
        type: EventType;
        tag: any;
        /**
        * Creates a new event object
        * @param {EventType} eventType The type event
        */
        constructor(type: EventType, tag?: any);
    }
    /**
    * A simple class that allows the adding, removing and dispatching of events.
    */
    class EventDispatcher {
        private _listeners;
        disposed: boolean;
        constructor();
        /**
        * Returns the list of {EventListener} that are currently attached to this dispatcher.
        */
        listeners: Array<EventListener>;
        /**
        * Adds a new listener to the dispatcher class.
        */
        on(type: EventType, func: EventCallback, context?: any): void;
        /**
        * Adds a new listener to the dispatcher class.
        */
        off(type: EventType, func: EventCallback, context?: any): void;
        /**
        * Sends a message to all listeners based on the eventType provided.
        * @param {String} The trigger message
        * @param {Event} event The event to dispatch
        * @returns {any}
        */
        emit(event: Event | ENUM, tag?: any): any;
        /**
        * This will cleanup the component by nullifying all its variables and clearing up all memory.
        */
        dispose(): void;
    }
}
declare module Animate {
    /**
    * A base class for all project resources
    */
    class ProjectResource<T extends Engine.IResource> extends EventDispatcher {
        entry: T;
        private _saved;
        protected _properties: EditableSet;
        protected _options: {
            [s: string]: any;
        };
        constructor(entry: T);
        /**
        * Use this function to initialize the resource. This called just after the resource is created and its entry set.
        */
        initialize(): void;
        /**
        * This function is called just before the entry is saved to the database.
        */
        onSaving(): any;
        /**
        * Gets the properties of this resource
        */
        /**
        * Sets the properties of this resource
        */
        properties: EditableSet;
        /**
        * Gets if this resource is saved
        * @returns {boolean}
        */
        /**
        * Sets if this resource is saved
        * @param {boolean} val
        */
        saved: boolean;
        dispose(): void;
        /**
        * Creates an option which is associated with this asset. The name of the option must be unique. Use this to add your own custom data
        */
        createOption(name: string, val: any): void;
        /**
        * Destroys an option
        */
        removeOption(name: string): void;
        /**
        * Update the value of an option
        */
        updateOption(name: string, val: any): void;
        /**
        * Returns the value of an option
        */
        getOption(name: string): any;
    }
}
declare module Animate {
    class EditorEvents extends ENUM {
        constructor(v: string);
        /**
        * This is called when the project is exporting the data object to the server.
        * The token object passed to this function contains all the information needed to run the project in an Animate runtime.
        * Associate event type is {EditorExportingEvent}
        */
        static EDITOR_PROJECT_EXPORTING: EditorEvents;
        /**
        * This function is called by Animate when everything has been loaded and the user is able to begin their session. Associate event type is {Event}
        */
        static EDITOR_READY: EditorEvents;
        /**
        * This function is called by Animate when the run button is pushed.
        */
        static EDITOR_RUN: EditorEvents;
        /**
        * This is called by Animate when we a container is created. Associate event type is {ContainerEvent}
        */
        /**
        * This is called by Animate when we a container is deleted. Associate event type is {ContainerEvent}
        */
        /**
        * This is called by Animate when we select a container. Associate event type is {ContainerEvent}
        */
        /**
        * This is called by Animate when we are exporting a container. The token that gets passed should be used to store any optional
        * data with a container. Associate event type is {ContainerDataEvent}
        */
        static CONTAINER_EXPORTING: EditorEvents;
        /**
        * This is called by Animate when we are saving a container. The token that gets passed should be used to store any optional
        * data with a container.This can be later, re - associated with the container when onOpenContainer is called. Associate event type is {ContainerDataEvent}
        */
        static CONTAINER_SAVING: EditorEvents;
        /**
        * This is called by Animate when we are opening a container. The token that gets passed is filled with optional
        * data when onSaveContainer is called. Associate event type is {ContainerDataEvent}
        */
        static CONTAINER_OPENING: EditorEvents;
        /**
        * Called when an asset is renamed. Associate event type is {AssetRenamedEvent}
        */
        static ASSET_RENAMED: EditorEvents;
        /**
        * Called when an asset is selected in the editor. Associate event type is {AssetEvent}
        */
        static ASSET_SELECTED: EditorEvents;
        /**
        * Called when an asset property is edited by the property grid. Associate event type is {AssetEditedEvent}
        */
        static ASSET_EDITED: EditorEvents;
        /**
        * Called when an asset is added to a container. Associate event type is {AssetContainerEvent}
        */
        static ASSET_ADDED_TO_CONTAINER: EditorEvents;
        /**
        * Called when an asset is removed from a container. Associate event type is {AssetContainerEvent}
        */
        static ASSET_REMOVED_FROM_CONTAINER: EditorEvents;
        /**
        * Called when an asset is created. Associate event type is {AssetCreatedEvent}
        */
        /**
        * Called just before an asset is saved to the server. Associate event type is {AssetEvent}
        */
        static ASSET_SAVING: EditorEvents;
        /**
        * Called when an asset is loaded from the database. Associate event type is {AssetEvent}
        */
        static ASSET_LOADED: EditorEvents;
        /**
        * Called when an asset is disposed off. Associate event type is {AssetEvent}
        */
        static ASSET_DESTROYED: EditorEvents;
        /**
        * Called when an asset is copied in the editor. Associate event type is {AssetCopiedEvent}
        */
        static ASSET_COPIED: EditorEvents;
    }
    /**
    * Event used to describe re-naming of objects. Listen for either
    * 'renaming' or 'renamed' event types
    */
    class RenameFormEvent extends Event {
        cancel: boolean;
        name: string;
        oldName: string;
        object: IRenamable;
        reason: string;
        resourceType: ResourceType;
        constructor(type: string, name: string, oldName: string, object: IRenamable, rt: ResourceType);
    }
    class OkCancelFormEvent extends Event {
        text: string;
        cancel: boolean;
        constructor(eventName: OkCancelFormEvents, text: string);
    }
    class ContainerEvent extends Event {
        container: Container;
        constructor(type: string, container: Container);
    }
    class BehaviourPickerEvent extends Event {
        behaviourName: string;
        constructor(eventName: BehaviourPickerEvents, behaviourName: string);
    }
    class ContextMenuEvent extends Event {
        item: ContextMenuItem;
        constructor(item: ContextMenuItem, eventName: any);
    }
    class UserEvent extends Event {
        constructor(type: string, data: any);
    }
    class ImportExportEvent extends Event {
        live_link: any;
        constructor(eventName: ImportExportEvents, live_link: any);
    }
    /**
    * Called when an editor is being exported
    */
    class EditorExportingEvent extends Event {
        /**
        * @param {any} token The token object passed to this function contains all the information needed to run the project in an Animate runtime.
        */
        token: any;
        constructor(token: any);
    }
    /**
    * Events associated with Containers and either reading from, or writing to, a data token
    */
    class ContainerDataEvent extends Event {
        /**
        * {Container} container The container associated with this event
        */
        container: Container;
        /**
        * {any} token The data being read or written to
        */
        token: any;
        /**
        * {{ groups: Array<string>; assets: Array<number> }} sceneReferences [Optional] An array of scene asset ID's associated with this container
        */
        sceneReferences: {
            groups: Array<number>;
            assets: Array<number>;
        };
        constructor(eventName: EditorEvents, container: Container, token: any, sceneReferences?: {
            groups: Array<number>;
            assets: Array<number>;
        });
    }
    /**
    * Asset associated events
    */
    class AssetEvent extends Event {
        /**
        * {Asset} asset The asset associated with this event
        */
        asset: Asset;
        constructor(eventName: EditorEvents, asset: Asset);
    }
    /**
    * Called when an asset is renamed
    */
    class AssetRenamedEvent extends AssetEvent {
        /**
        * {string} oldName The old name of the asset
        */
        oldName: string;
        constructor(asset: Asset, oldName: string);
    }
    /**
    * Events assocaited with Assets in relation to Containers
    */
    class AssetContainerEvent extends AssetEvent {
        /**
        * {Container} container The container assocaited with this event
        */
        container: Container;
        constructor(eventName: EditorEvents, asset: Asset, container: Container);
    }
    /**
    * Portal associated events
    */
    class PortalEvent extends Event {
        container: Container;
        portal: Portal;
        oldName: string;
        constructor(type: string, oldName: string, container: Container, portal: Portal);
    }
    class WindowEvent extends Event {
        window: Window;
        constructor(eventName: WindowEvents, window: Window);
    }
    class ToolbarNumberEvent extends Event {
        value: number;
        constructor(e: ToolbarNumberEvents, value: number);
    }
    class ToolbarDropDownEvent extends Event {
        item: ToolbarItem;
        constructor(item: ToolbarItem, e: EventType);
        dispose(): void;
    }
    class EditEvent extends Event {
        property: Prop<any>;
        set: EditableSet;
        constructor(property: Prop<any>, set: EditableSet);
    }
    class TabEvent extends Event {
        private _pair;
        cancel: boolean;
        constructor(eventName: any, pair: TabPair);
        pair: TabPair;
    }
    class CanvasEvent extends Event {
        canvas: Canvas;
        constructor(eventName: CanvasEvents, canvas: Canvas);
    }
    class ListViewEvent extends Event {
        item: ListViewItem;
        constructor(eventType: ListViewEvents, item: ListViewItem);
    }
    class ListEvent extends Event {
        item: string;
        constructor(eventName: ListEvents, item: string);
    }
    /**
    * A simple project event. Always related to a project resource (null if not)
    */
    class ProjectEvent<T extends ProjectResource<Engine.IResource>> extends Event {
        resource: T;
        constructor(type: string, resource: T);
    }
    /**
    * An event to deal with file viewer events
    * The event type can be 'cancelled' or 'change'
    */
    class FileViewerEvent extends Event {
        file: Engine.IFile;
        constructor(type: string, file: Engine.IFile);
    }
}
declare module Animate {
    /**
    * This class describes a template. These templates are used when creating assets.
    */
    class AssetClass {
        private _abstractClass;
        private _name;
        parentClass: AssetClass;
        private _imgURL;
        private _variables;
        classes: Array<AssetClass>;
        constructor(name: string, parent: AssetClass, imgURL: string, abstractClass?: boolean);
        /**
        * Creates an object of all the variables for an instance of this class.
        * @returns {EditableSet} The variables we are editing
        */
        buildVariables(): EditableSet;
        /**
        * Finds a class by its name. Returns null if nothing is found
        */
        findClass(name: string): AssetClass;
        /**
        * Adds a variable to the class.
        * @param { Prop<any>} prop The property to add
        * @returns {AssetClass} A reference to this AssetClass
        */
        addVar(prop: Prop<any>): AssetClass;
        /**
        * This will clear and dispose of all the nodes
        */
        dispose(): void;
        /**
        * Gets a variable based on its name
        * @param {string} name The name of the class
        * @returns {Prop<T>}
        */
        getVariablesByName<T>(name: string): Prop<T>;
        /**
        * Gets the image URL of this template
        * @returns {string}
        */
        imgURL: string;
        /**
        * Gets the variables associated with this template
        * @returns {Array<Prop<any>>}
        */
        variables: Array<Prop<any>>;
        /**
        * Adds a class
        * @param {string} name The name of the class
        * @param {string} img The optional image of the class
        * @param {boolean} abstractClass A boolean to define if this class is abstract or not. I.e. does this class allow for creating assets or is it just the base for others.
        * @returns {AssetClass}
        */
        addClass(name: string, img: string, abstractClass: boolean): AssetClass;
        /**
        * Gets the name of the class
        * @returns {string}
        */
        name: string;
        /**
        * Gets if this class is abstract or not
        * @returns {boolean}
        */
        abstractClass: boolean;
    }
}
declare module Animate {
    interface IAjaxError {
        message: string;
        status: number;
    }
    class Utils {
        private static _withCredentials;
        private static shallowIds;
        /**
        * Generates a new shallow Id - an id that is unique only to this local session
        * @param {number} reference Pass a reference id to make sure the one generated is still valid. Any ID that's imported can potentially offset this counter.
        * @returns {number}
        */
        static generateLocalId(reference?: number): number;
        /**
        * A predefined shorthand method for calling put methods that use JSON communication
        */
        static post<T>(url: string, data: any): Promise<T>;
        /**
        * A predefined shorthand method for calling put methods that use JSON communication
        */
        static get<T>(url: string): Promise<T>;
        /**
        * A predefined shorthand method for calling put methods that use JSON communication
        */
        static put<T>(url: string, data: any): Promise<T>;
        /**
        * A predefined shorthand method for calling deleta methods that use JSON communication
        */
        static delete<T>(url: string, data?: any): Promise<T>;
        /**
        * Creates a new canvas item based on the dataset provided
        * @param {Canvas} parent The parent component this item must be added to
        * @param {any} data The data, usually created from a tokenize function
        * @returns {CanvasItem}
        */
        static createItem(parent: Canvas, data: ICanvasItem): CanvasItem;
        /**
        * Creates a new property based on the dataset provided
        * @param {PropertyType} type The type of property to create
        */
        static createProperty(name: string, type: PropertyType): Prop<any>;
        /**
        * Gets the local mouse position of an event on a given dom element.
        */
        static getMousePos(evt: any, id: any): any;
        /**
        * Use this function to check if a value contains characters that break things.
        * @param {string} text The text to check
        * @param {boolean} allowSpace If this is true, empty space will be allowed
        * @returns {string} Returns null or string. If it returns null then everything is fine. Otherwise a message is returned with what's wrong.
        */
        static checkForSpecialChars(text: string, allowSpace?: boolean): string;
        /**
        Tells us if a string is a valid email address
        */
        static validateEmail(email: string): boolean;
        static getObjectClass(obj: any): any;
    }
}
declare module Animate {
    /**
    * The plugin manager is used to load and manage external Animate plugins.
    */
    class PluginManager extends EventDispatcher {
        private static _singleton;
        private _plugins;
        private _loadedPlugins;
        private behaviourTemplates;
        private _assetTemplates;
        private _converters;
        private _previewVisualizers;
        constructor();
        /**
        * Attempts to download a plugin by its URL and insert it onto the page.
        * Each plugin should then register itself with the plugin manager by setting the __newPlugin variable. This variable is set in the plugin that's downloaded.
        * Once downloaded - the __newPlugin will be set as the plugin and is assigned to the plugin definition.
        * @param {IPlugin} pluginDefinition The plugin to load
        * @returns {Promise<Engine.IPlugin>}
        */
        loadPlugin(pluginDefinition: Engine.IPlugin): Promise<Engine.IPlugin>;
        /**
        * This funtcion is used to load a plugin.
        * @param {IPlugin} pluginDefinition The IPlugin constructor that is to be created
        * @param {boolean} createPluginReference Should we keep this constructor in memory? The default is true
        */
        preparePlugin(pluginDefinition: Engine.IPlugin, createPluginReference?: boolean): void;
        /**
        * Call this function to unload a plugin
        * @param {IPlugin} plugin The IPlugin object that is to be loaded
        */
        unloadPlugin(plugin: IPlugin): void;
        /**
        * Loops through each of the converters to see if a conversion is possible. If it is
        * it will return an array of conversion options, if not it returns false.
        * @param {any} typeA The first type to check
        * @param {any} typeB The second type to check
        */
        getConverters(typeA: any, typeB: any): any;
        /**
        * Gets a behaviour template by its name.
        * @param {string} behaviorName The name of the behaviour template
        */
        getTemplate(behaviorName: string): BehaviourDefinition;
        /**
        * Use this function to select an asset in the tree view and property grid
        * @param {Asset} asset The Asset object we need to select
        * @param {boolean} panToNode When set to true, the treeview will bring the node into view
        * @param {boolean} multiSelect When set to true, the treeview not clear any previous selections
        */
        selectAsset(asset: Asset, panToNode?: boolean, multiSelect?: boolean): void;
        /**
        * Gets an asset class by its name
        * @param {string} name The name of the asset class
        * @param {AssetClass}
        */
        getAssetClass(name: string): AssetClass;
        /**
        * When an asset is created this function will notify all plugins of its existance
        * @param {string} name The name of the asset
        * @param {Asset} asset The asset itself
        */
        /**
        * Called when the project is reset by either creating a new one or opening an older one.
        */
        projectReset(project: Project): void;
        /**
        * This function is called by Animate when everything has been loaded and the user is able to begin their session.
        */
        projectReady(project: Project): void;
        /**
        * This function generates an html node that is used to preview a file
        * @param {Engine.IFile} file The file we are looking to preview
        * @param {(file: Engine.IFile, image: HTMLCanvasElement | HTMLImageElement) => void} updatePreviewImg A function we can use to update the file's preview image
        * @returns {Node} If a node is returned, the factory is responsible for showing the preview. The node will be added to the DOM. If null is returned then the engine
        * will continue looking for a factory than can preview the file
        */
        displayPreview(file: Engine.IFile, updatePreviewImg: (file: Engine.IFile, image: HTMLCanvasElement | HTMLImageElement) => void): Node;
        assetTemplates: Array<AssetTemplate>;
        loadedPlugins: Array<IPlugin>;
        /**
        * Gets the singleton instance.
        */
        static getSingleton(): PluginManager;
    }
}
declare module Animate {
    class ImportExportEvents extends ENUM {
        constructor(v: string);
        static COMPLETE: ImportExportEvents;
    }
    /**
    * A class to help with importing and exporting a project
    */
    class ImportExport extends EventDispatcher {
        private static _singleton;
        private runWhenDone;
        private mRequest;
        constructor();
        /**
        * @type public mfunc run
        * This function will first export the scene and then attempt to create a window that runs the application.
        * @extends <ImportExport>
        */
        run(): void;
        /**
        * @type public mfunc exportScene
        * This function is used to exort the Animae scene. This function creates an object which is exported as a string. Plugins
        * can hook into this process and change the output to suit the plugin needs.
        * @extends <ImportExport>
        */
        exportScene(): void;
        /**
        * Adds asset references to a container token during the export.
        * @param {Asset} asset the asset object to check
        * @param {ContainerToken} container The container to add refernces on
        * @returns {any}
        */
        referenceCheckAsset(asset: Asset, container: ContainerToken): void;
        /**
        * Adds group references to a container token during the export.
        * @param {TreeNodeGroup} group the group object to check
        * @param {ContainerToken} container The container to add refernces on
        * @returns {any}
        */
        referenceCheckGroup(group: TreeNodeGroup, container: ContainerToken): void;
        /**
        * This is the resonse from the server
        */
        onServer(response: LoaderEvents, event: AnimateLoaderEvent, sender?: EventDispatcher): void;
        /**
        * Gets the singleton instance.
        * @extends <ImportExport>
        */
        static getSingleton(): ImportExport;
    }
}
declare module Animate {
    /**
    * A simple interface for property grid editors
    */
    abstract class PropertyGridEditor {
        constructor(grid: PropertyGrid);
        /**
        * Checks a property to see if it can edit it
        * @param {Prop<any>} prop The property being edited
        * @returns {boolean}
        */
        abstract canEdit(prop: Prop<any>): boolean;
        /**
        * Given a property, the grid editor must produce HTML that can be used to edit the property
        * @param {Prop<any>} prop The property being edited
        * @param {Component} container The container acting as this editors parent
        */
        edit(prop: Prop<any>, container: Component): any;
        cleanup(): void;
    }
}
declare module Animate {
    /**
    * Assets are resources with a list of editable properties. Typically assets are made from templates defined in plugins.
    * They define the objects you can interact with in an application. For example, a cat plugin might define an asset template
    * called Cat which allows you to create a cat asset in the application. The properties of the cat asset would be defined by
    * the plugin.
    */
    class Asset extends ProjectResource<Engine.IAsset> {
        class: AssetClass;
        /**
        * @param {AssetClass} assetClass The name of the "class" or "template" that this asset belongs to
        * @param {IAsset} entry [Optional] The asset database entry
        */
        constructor(assetClass: AssetClass, entry?: Engine.IAsset);
        /**
        * Writes this assset to a readable string
        * @returns {string}
        */
        toString(): string;
        /**
        * Use this function to reset the asset properties
        * @param {string} name The name of the asset
        * @param {string} className The "class" or "template" name of the asset
        * @param {any} json The JSON data of the asset.
        */
        update(name: string, className: string, json?: any): void;
        /**
        * Disposes and cleans up the data of this asset
        */
        dispose(): void;
    }
}
declare module Animate {
    /**
    * Each project has a list of containers. These are saved into the database and retrieved when we work with Animate. A container is
    * essentially a piece of code that executes behaviour nodes and plugin logic when activated. It acts as a 'container' for logic.
    */
    class Container extends ProjectResource<Engine.IContainer> {
        canvas: Canvas;
        /**
        * {string} name The name of the container
        */
        constructor(entry?: Engine.IContainer);
        /**
        * This function is called just before the entry is saved to the database.
        */
        onSaving(): any;
        /**
         * Use this function to initialize the resource. This called just after the resource is created and its entry set.
         */
        initialize(): void;
        /**
        * This will cleanup the behaviour.
        */
        dispose(): void;
    }
}
declare module Animate {
    /**
    * A simple array resource for referencing groups, or arrays, of other objects. Similar to arrays in Javascript.
    */
    class GroupArray extends ProjectResource<Engine.IGroup> {
        /**
        * @param {IGroup} entry [Optional] The database entry of the resource
        */
        constructor(entry?: Engine.IGroup);
        /**
        * Adds a new reference to the group
        * @param {number} shallowId
        */
        addReference(shallowId: number): void;
        /**
        * Removes a reference from the group
        * @param {number} shallowId
        */
        removeReference(shallowId: number): void;
        /**
        * Disposes and cleans up the data of this asset
        */
        dispose(): void;
    }
}
declare module Animate {
    /**
    * A wrapper for DB file instances
    * @events deleted, refreshed
    */
    class FileResource extends ProjectResource<Engine.IFile> {
        /**
        * @param {IFile} entry The DB entry of this file
        */
        constructor(entry: Engine.IFile);
    }
}
declare module Animate {
    /**
    * A wrapper for DB script instances
    */
    class ScriptResource extends ProjectResource<Engine.IScript> {
        /**
        * @param {IScript} entry The DB entry of this script
        */
        constructor(entry: Engine.IScript);
    }
}
declare module Animate {
    /**
    * The AssetTemplate object is used to define what assets are available to the scene.
    * Assets are predefined tempaltes of data that can be instantiated. The best way to think of an asset
    * is to think of it as a predefined object that contains a number of variables. You could for example
    * create Assets like cats, dogs, animals or humans. Its really up you the plugin writer how they want
    * to define their assets. This function can return null if no Assets are required.
    */
    class AssetTemplate {
        private plugin;
        classes: Array<AssetClass>;
        /**
        * @param {IPlugin} plugin The plugin who created this template
        */
        constructor(plugin: any);
        /**
        * Adds a class to this template
        * @param {string} name The name of the class
        * @param {string} img The optional image
        * @param {boolean} abstractClass A boolean to define if this class is abstract or not.
        * @returns {AssetClass}
        */
        addClass(name: string, img: string, abstractClass: boolean): AssetClass;
        /**
        * Removes a class by name
        * @param {string} name The name of the class to remove
        */
        removeClass(name: string): void;
        /**
        * Finds a class by its name. Returns null if nothing is found
        */
        findClass(name: string): AssetClass;
    }
}
declare module Animate {
    /**
    *  A simple class to define the behavior of a behaviour object.
    */
    class BehaviourDefinition {
        private _behaviourName;
        private _canBuildOutput;
        private _canBuildInput;
        private _canBuildParameter;
        private _canBuildProduct;
        private _portalTemplates;
        private _plugin;
        /**
        * @param {string} behaviourName The name of the behaviour
        * @param {Array<PortalTemplate>} portalTemplates
        * @param {IPlugin} plugin The plugin this is associated with
        * @param {boolean} canBuildInput
        * @param {boolean} canBuildOutput
        * @param {boolean} canBuildParameter
        * @param {boolean} canBuildProduct
        */
        constructor(behaviourName: string, portalTemplates: Array<PortalTemplate>, plugin: IPlugin, canBuildInput?: boolean, canBuildOutput?: boolean, canBuildParameter?: boolean, canBuildProduct?: boolean);
        dispose(): void;
        canBuildOutput(behaviour: Behaviour): boolean;
        canBuildInput(behaviour: Behaviour): boolean;
        canBuildProduct(behaviour: Behaviour): boolean;
        canBuildParameter(behaviour: Behaviour): boolean;
        portalsTemplates(): Array<PortalTemplate>;
        behaviourName: string;
        plugin: IPlugin;
    }
}
declare module Animate {
    class DataToken {
        category: string;
        command: string;
        projectID: string;
    }
}
declare module Animate {
    class DB {
        static USERS: string;
        static HOST: string;
        static API: string;
        static PLAN_FREE: string;
        static PLAN_BRONZE: string;
        static PLAN_SILVER: string;
        static PLAN_GOLD: string;
        static PLAN_PLATINUM: string;
    }
}
declare module Animate {
    /**
    * Basic set of loader events shared by all loaders
    */
    class LoaderEvents extends ENUM {
        constructor(v: string);
        static COMPLETE: LoaderEvents;
        static FAILED: LoaderEvents;
        /**
        * Returns an enum reference by its name/value
        * @param {string} val
        * @returns {LoaderEvents}
        */
        static fromString(val: string): LoaderEvents;
    }
    /**
    * Abstract base loader class. This should not be instantiated, instead use the sub class loaders. Keeps track of loading
    * variables as well as functions for showing or hiding the loading dialogue
    */
    class LoaderBase extends EventDispatcher {
        private static loaderBackdrop;
        private static showCount;
        url: string;
        numTries: number;
        data: any;
        dataType: string;
        domain: string;
        contentType: any;
        processData: boolean;
        getVariables: any;
        _getQuery: string;
        /**
        * Creates an instance of the Loader
        * @param {string} domain [Optional] Specify the base domain of this call. By default it uses DB.HOST.
        */
        constructor(domain?: string);
        /**
        * Starts the loading process
        * @param {string} url The URL we want to load
        * @param {any} data The data associated with this load
        * @param {number} numTries The number of attempts allowed to make this load
        */
        load(url: string, data: any, numTries?: number): void;
        /**
        * Call this function to create a jQuery object that acts as a loader modal window (the window with the spinning cog)
        * @returns {JQuery}
        */
        static createLoaderModal(): JQuery;
        /**
        * Shows the loader backdrop which prevents the user from interacting with the application. Each time this is called a counter
        * is incremented. To hide it call the hideLoader function. It will only hide the loader if the hideLoader is called the same
        * number of times as the showLoader function. I.e. if you call showLoader 5 times and call hideLoader 4 times, it will not hide
        * the loader. If you call hideLoader one more time - it will.
        */
        static showLoader(): void;
        /**
        * see showLoader for information on the hideLoader
        */
        static hideLoader(): void;
        /**
       * Cleans up the object
       */
        dispose(): void;
    }
}
declare module Animate {
    /**
    * Valid response codes for requests made to the Animate server
    */
    class AnimateLoaderResponses extends ENUM {
        constructor(v: string);
        static SUCCESS: AnimateLoaderResponses;
        static ERROR: AnimateLoaderResponses;
        static fromString(val: string): ENUM;
    }
    /**
    * Events associated with requests made to the animate servers
    */
    class AnimateLoaderEvent extends Event {
        message: string;
        return_type: AnimateLoaderResponses;
        data: any;
        constructor(eventName: LoaderEvents, message: string, return_type: AnimateLoaderResponses, data?: any);
    }
    /**
    * This class acts as an interface loader for the animate server.
    */
    class AnimateLoader extends LoaderBase {
        private _curCall;
        /**
        * Creates an instance of the Loader
        * @param {string} domain [Optional] Specify the base domain of this call. By default it uses DB.HOST.
        */
        constructor(domain?: string);
        /**
        * This function will make a POST request to the animate server
        * @param {string} url The URL we want to load
        * @param {any} data The post variables to send off to the server
        * @param {number} numTries The number of attempts allowed to make this load
        */
        load(url: string, data: any, numTries?: number, type?: string): void;
        /**
        * Called when we the ajax response has an error.
        * @param {any} e
        * @param {string} textStatus
        * @param {any} errorThrown
        */
        onError(e: any, textStatus: any, errorThrown: any): void;
        /**
        * Called when we get an ajax response.
        * @param {any} data
        * @param {any} textStatus
        * @param {any} jqXHR
        */
        onData(data: any, textStatus: any, jqXHR: any): void;
        /**
        * Cleans up the object
        */
        dispose(): void;
    }
}
declare module Animate {
    /**
    * Valid response codes for xhr binary requests
    */
    class BinaryLoaderResponses extends ENUM {
        constructor(v: string);
        static SUCCESS: BinaryLoaderResponses;
        static ERROR: BinaryLoaderResponses;
    }
    /**
    * Events associated with xhr binary requests
    */
    class BinaryLoaderEvent extends Event {
        buffer: ArrayBuffer;
        message: string;
        constructor(binaryResponse: BinaryLoaderResponses, buffer: ArrayBuffer, message?: string);
    }
    /**
    * Class used to download contents from a server into an ArrayBuffer
    */
    class BinaryLoader extends LoaderBase {
        private _xhr;
        private _onBuffers;
        private _onError;
        /**
        * Creates an instance of the Loader
        * @param {string} domain [Optional] Specify the base domain of this call. By default it uses DB.HOST.
        */
        constructor(domain?: string);
        /**
        * This function will make a GET request and attempt to download a file into binary data
        * @param {string} url The URL we want to load
        * @param {number} numTries The number of attempts allowed to make this load
        */
        load(url: string, numTries?: number): void;
        /**
        * If an error occurs
        */
        onError(event: any): void;
        /**
        * Cleans up and removes references for GC
        */
        dispose(): void;
        /**
        * Called when the buffers have been loaded
        */
        onBuffersLoaded(): void;
    }
}
declare module Animate {
    /**
    * A simple class to define portal behaviour.
    */
    class PortalTemplate {
        type: PortalType;
        property: Prop<any>;
        /**
        * @param {Prop<any>} property The property associated with this portal
        * @param {PortalType} type The type of portal this represents
        */
        constructor(property: Prop<any>, type: PortalType);
    }
}
declare module Animate {
    class ProjectEvents {
        value: string;
        constructor(v: string);
        toString(): string;
        static SAVED: ProjectEvents;
        static SAVED_ALL: ProjectEvents;
        static FAILED: ProjectEvents;
        static BUILD_SELECTED: ProjectEvents;
        static BUILD_SAVED: ProjectEvents;
    }
    /**
    * A wrapper for project builds
    */
    class Build {
        entry: Engine.IBuild;
        /**
        * Creates an intance of the build
        * @param {Engine.IBuild} entry The entry token from the DB
        */
        constructor(entry: Engine.IBuild);
        /**
        * Attempts to update the build with new data
        * @param {Engine.IBuild} token The update token data
        */
        update(token: Engine.IBuild): Promise<boolean>;
    }
    /**
    * A project class is an object that is owned by a user.
    * The project has functions which are useful for comunicating data to the server when
    * loading and saving data in the scene.
    */
    class Project extends EventDispatcher {
        entry: Engine.IProject;
        saved: boolean;
        curBuild: Build;
        private _containers;
        private _assets;
        private _files;
        private _scripts;
        private _groups;
        private _restPaths;
        /**
        * @param{string} id The database id of this project
        */
        constructor();
        /**
        * Gets a resource by its ID
        * @param {string} id The ID of the resource
        * @returns {ProjectResource<Engine.IResource>} The resource whose id matches the id parameter or null
        */
        getResourceByID<T extends ProjectResource<Engine.IResource>>(id: string, type?: ResourceType): {
            resource: T;
            type: ResourceType;
        };
        /**
        * Gets a resource by its shallow ID
        * @param {string} id The shallow ID of the resource
        * @returns {ProjectResource<Engine.IResource>} The resource whose shallow id matches the id parameter or null
        */
        getResourceByShallowID<T extends ProjectResource<Engine.IResource>>(id: number, type?: ResourceType): T;
        /**
        * Attempts to update the project details base on the token provided
        * @returns {Engine.IProject} The project token
        * @returns {Promise<UsersInterface.IResponse>}
        */
        updateDetails(token: Engine.IProject): Promise<UsersInterface.IResponse>;
        /**
        * Loads a previously selected build, or creates one if none are selected
        * @returns {Promise<Build>}
        */
        loadBuild(): Promise<Build>;
        /**
        * Internal function to create a resource wrapper
        * @param {T} entry The database entry
        * @param {ResourceType} type The type of resource to create
        * @returns {ProjectResource<T>}
        */
        private createResourceInstance<T>(entry, type?);
        /**
        * This function is used to fetch the project resources associated with a project.
        * @param {ResourceType} type [Optional] You can specify to load only a subset of the resources (Useful for updating if someone else is editing)
        * @returns {Promise<Array<ProjectResource<any>>}
        */
        loadResources(type?: ResourceType): Promise<Array<ProjectResource<any>>>;
        /**
        * This function is used to fetch a project resource by Id
        * @param {string} id the Id of the resource to update
        * @param {ResourceType} type You can specify to load only a subset of the resources (Useful for updating if someone else is editing)
        * @returns {Promise<T>}
        */
        refreshResource<T extends ProjectResource<Engine.IResource>>(id: string, type?: ResourceType): Promise<T>;
        /**
        * Use this to edit the properties of a resource
        * @param {string} id The id of the object we are editing.
        * @param {T} data The new data for the resource
        * @param {ResourceType} type The type of resource we are editing
        * @returns {Promise<Modepress.IResponse>}
        */
        editResource<T>(id: string, data: T, type: ResourceType): Promise<Modepress.IResponse>;
        /**
        * Use this to save the properties of a resource
        * @param {string} id The id of the object we are saving.
        * @param {ResourceType} type [Optional] The type of resource we are saving
        * @returns {Promise<boolean>}
        */
        saveResource(id: string, type?: ResourceType): Promise<boolean>;
        /**
        * Use this to edit the properties of a resource
        * @param {ResourceType} type The type of resource we are saving
        * @returns {Promise<boolean>}
        */
        saveResources(type: ResourceType): Promise<boolean>;
        /**
        * Use this to delete a resource by its Id
        * @param {string} id The id of the object we are deleting
        * @param {ResourceType} type The type of resource we are renaming
        * @returns {Promise<boolean>}
        */
        deleteResource(id: string, type: ResourceType): Promise<boolean>;
        /**
        * Copies an existing resource and assigns a new ID to the cloned item
        * @param {string} id The id of the resource we are cloning from
        * @param {ResourceType} type [Optional] The type of resource to clone
        * @returns {Promise<ProjectResource<T>>}
        */
        copyResource<T extends Engine.IResource>(id: string, type?: ResourceType): Promise<ProjectResource<T>>;
        /**
        * Deletes several resources in 1 function call
        * @param {Array<string>} ids The ids An array of resource Ids
        * @returns {Promise<boolean>}
        */
        deleteResources(ids: Array<string>): Promise<boolean>;
        /**
        * This function is used to all project resources
        */
        saveAll(): Promise<boolean>;
        /**
        * Creates a new project resource.
        * @param {ResourceType} type The type of resource we are renaming
        * @returns { Promise<ProjectResource<any>>}
        */
        createResource<T>(type: ResourceType, data: T): Promise<ProjectResource<T>>;
        /**
        * This function is used to create an entry for this project on the DB.
        */
        selectBuild(major: string, mid: string, minor: string): void;
        /**
        * This function is used to update the current build data
        */
        saveBuild(notes: string, visibility: string, html: string, css: string): void;
        /**
        * This function is called whenever we get a resonse from the server
        */
        onServer(response: LoaderEvents, event: AnimateLoaderEvent, sender?: EventDispatcher): void;
        containers: Array<Container>;
        files: Array<FileResource>;
        scripts: Array<ScriptResource>;
        assets: Array<Asset>;
        groups: Array<GroupArray>;
        /**
        * This will cleanup the project and remove all data associated with it.
        */
        reset(): void;
        plugins: Array<Engine.IPlugin>;
    }
}
declare module Animate {
    class TypeConverter {
        plugin: IPlugin;
        typeA: string;
        typeB: string;
        conversionOptions: Array<string>;
        constructor(typeA: string, typeB: string, conversionOptions: Array<string>, plugin: IPlugin);
        /** Checks if this converter supports a conversion. */
        canConvert(typeA: any, typeB: any): boolean;
        /** Cleans up the object. */
        dispose(): void;
    }
}
declare module Animate {
    /**
    * This class is used to represent the user who is logged into Animate.
    */
    class User extends EventDispatcher {
        private static _singleton;
        entry: UsersInterface.IUserEntry;
        meta: Engine.IUserMeta;
        project: Project;
        private _isLoggedIn;
        constructor();
        /**
        * Resets the meta data
        */
        resetMeta(): void;
        /**
        * Checks if a user is logged in or not. This checks the server using
        * cookie and session data from the browser.
        * @returns {Promise<boolean>}
        */
        authenticated(): Promise<boolean>;
        /**
        * Tries to log the user in asynchronously.
        * @param {string} user The username of the user.
        * @param {string} password The password of the user.
        * @param {boolean} rememberMe Set this to true if we want to set a login cookie and keep us signed in.
        * @returns {Promise<UsersInterface.IAuthenticationResponse>}
        */
        login(user: string, password: string, rememberMe: boolean): Promise<UsersInterface.IAuthenticationResponse>;
        /**
        * Tries to register a new user.
        * @param {string} user The username of the user.
        * @param {string} password The password of the user.
        * @param {string} email The email of the user.
        * @param {string} captcha The captcha of the login screen
        * @param {string} captha_challenge The captha_challenge of the login screen
        * @returns {Promise<UsersInterface.IAuthenticationResponse>}
        */
        register(user: string, password: string, email: string, captcha: string, captha_challenge: string): Promise<UsersInterface.IAuthenticationResponse>;
        /**
        * This function is used to resend a user's activation code
        * @param {string} user
        * @returns {Promise<UsersInterface.IResponse>}
        */
        resendActivation(user: string): Promise<UsersInterface.IResponse>;
        /**
        * This function is used to reset a user's password.
        * @param {string} user
        * @returns {Promise<UsersInterface.IResponse>}
        */
        resetPassword(user: string): Promise<UsersInterface.IResponse>;
        /**
        * Attempts to log the user out
        * @return {Promise<UsersInterface.IResponse>}
        */
        logout(): Promise<UsersInterface.IResponse>;
        /**
        * Fetches all the projects of a user. This only works if the user if logged in. If not
        * it will return null.
        * @param {number} index The index to  fetching projects for
        * @param {number} limit The limit of how many items to fetch
        * @return {Promise<ModepressAddons.IGetProjects>}
        */
        getProjectList(index: number, limit: number): Promise<ModepressAddons.IGetProjects>;
        /**
        * Creates a new user projects
        * @param {string} name The name of the project
        * @param {Array<string>} plugins An array of plugin IDs to identify which plugins to use
        * @param {string} description [Optional] A short description
        * @return {Promise<ModepressAddons.ICreateProject>}
        */
        newProject(name: string, plugins: Array<string>, description?: string): Promise<ModepressAddons.ICreateProject>;
        /**
        * Removes a project by its id
        * @param {string} pid The id of the project to remove
        * @return {Promise<Modepress.IResponse>}
        */
        removeProject(pid: string): Promise<Modepress.IResponse>;
        /**
        * Attempts to update the user's details base on the token provided
        * @returns {Engine.IUserMeta} The user details token
        * @returns {Promise<UsersInterface.IResponse>}
        */
        updateDetails(token: Engine.IUserMeta): Promise<UsersInterface.IResponse>;
        /**
        * @type public mfunc copyProject
        * Use this function to duplicate a project
        * @param {number} id The project ID we are copying
        * @extends {User}
        */
        copyProject(id: string): void;
        /**
        * This function is used to open an existing project.
        */
        openProject(id: string): void;
        /**
        * This will delete a project from the database as well as remove it from the user.
        * @param {string} id The id of the project we are removing.
        */
        deleteProject(id: string): any;
        /**
        * This is the resonse from the server
        * @param {LoaderEvents} response The response from the server. The response will be either Loader.COMPLETE or Loader.FAILED
        * @param {Event} data The data sent from the server.
        */
        onServer(response: LoaderEvents, event: AnimateLoaderEvent, sender?: EventDispatcher): void;
        isLoggedIn: boolean;
        /**
        * Gets the singleton instance.
        * @returns {User}
        */
        static get: User;
    }
}
declare module Animate {
    /**
    * Abstract class downloading content by pages
    */
    class PageLoader {
        updateFunc: (index: number, limit: number) => void;
        index: number;
        limit: number;
        last: number;
        protected searchTerm: string;
        constructor(updateFunction: (index: number, limit: number) => void);
        /**
        * Calls the update function
        */
        invalidate(): void;
        /**
        * Gets the current page number
        * @returns {number}
        */
        getPageNum(): number;
        /**
        * Gets the total number of pages
        * @returns {number}
        */
        getTotalPages(): number;
        /**
        * Sets the page search back to index = 0
        */
        goFirst(): void;
        /**
        * Gets the last set of users
        */
        goLast(): void;
        /**
        * Sets the page search back to index = 0
        */
        goNext(): void;
        /**
        * Sets the page search back to index = 0
        */
        goPrev(): void;
    }
}
declare module Animate {
    class ImageVisualizer implements IPreviewFactory {
        private _maxPreviewSize;
        constructor();
        /**
        * This function generates an html node that is used to preview a file
        * @param {Engine.IFile} file The file we are looking to preview
        * @param {(file: Engine.IFile, image: HTMLCanvasElement | HTMLImageElement) => void} updatePreviewImg A function we can use to update the file's preview image
        * @returns {Node} If a node is returned, the factory is responsible for showing the preview. The node will be added to the DOM. If null is returned then the engine
        * will continue looking for a factory than can preview the file
        */
        generate(file: Engine.IFile, updatePreviewImg: (file: Engine.IFile, image: HTMLCanvasElement | HTMLImageElement) => void): Node;
    }
}
declare module Animate {
    type ProgressCallback = (percent: number) => void;
    type CompleteCallback = (err?: Error, files?: Array<UsersInterface.IUploadToken>) => void;
    class FileUploader {
        private _dCount;
        private _downloads;
        percent: number;
        private _onProg;
        private _onComplete;
        constructor(onProg?: ProgressCallback, onComp?: CompleteCallback);
        numDownloads: number;
        uploadFile(file: File, meta?: any, parentFile?: string): void;
        upload2DElement(img: HTMLImageElement | HTMLCanvasElement, name: string, meta?: Engine.IFileMeta, parentFile?: string): void;
        uploadArrayBuffer(array: ArrayBuffer, name: string, meta?: any, parentFile?: string): void;
        uploadTextAsFile(text: string, name: string, meta?: any, parentFile?: string): void;
        upload(form: FormData, url: string, identifier: string, parentFile?: string): void;
    }
}
declare module Animate {
    /**
    * Defines a set of variables. The set is typically owned by an object that can be edited by users. The set can be passed to editors like the
    * PropertyGrid to expose the variables to the user.
    */
    class EditableSet {
        private _variables;
        parent: EventDispatcher;
        /**
        * Creates an instance
        * @param {EventDispatcher} parent The owner of this set. Can be null. If not null, the parent will receive events when the properties are edited.
        */
        constructor(parent: EventDispatcher);
        /**
        * Adds a variable to the set
        * @param {Prop<any>} prop
        */
        addVar(prop: Prop<any>): void;
        /**
        * Gets a variable by name
        * @param {string} name
        * @returns {Prop<T>}
        */
        getVar<T>(name: string): Prop<T>;
        /**
        * Removes a variable
        * @param {string} prop
        */
        removeVar(name: string): void;
        /**
        * Broadcasts an "edited" event to the owner of the set
        */
        notifyEdit(prop: Prop<any>): void;
        /**
        * Updates a variable with a new value
        * @returns {T}
        */
        updateValue<T>(name: string, value: T): T;
        /**
        * Tokenizes the data into a JSON.
        * @param {boolean} slim If true, only the core value is exported. If false, additional data is exported so that it can be re-created at a later stage
        */
        tokenize(slim?: boolean): any;
        /**
        * De-Tokenizes data from a JSON.
        * @param {any} data The data to import from
        */
        deTokenize(data: any): void;
        /**
       * Tokenizes the data into a JSON.
       * @returns {Array<Prop<any>>}
       */
        variables: Array<Prop<any>>;
        /**
         * Cleans up and removes the references
         */
        dispose(): void;
    }
}
declare module Animate {
    /**
    * Defines a property variable. These are variables wrapped in sugar code to help sanitize and differentiate different pieces of data.
    * Each property is typically owner by an EditableSet.
    */
    class Prop<T> {
        name: string;
        protected _value: T;
        category: string;
        options: any;
        set: EditableSet;
        type: PropertyType;
        /**
        * Creates a new instance
        * @param {string} name The name of the property
        * @param {T} value The value of the property
        * @param {string} category [Optional] An optional category to describe this property's function
        * @param {any} options [Optional] Any optional data to be associated with the property
        * @param {PropertyType} type [Optional] Define the type of property
        */
        constructor(name: string, value: T, category?: string, options?: any, type?: PropertyType);
        /**
        * Attempts to clone the property
        * @returns {Prop<T>}
        */
        clone(clone?: Prop<T>): Prop<T>;
        /**
        * Attempts to fetch the value of this property
        * @returns {T}
        */
        getVal(): T;
        /**
        * Tokenizes the data into a JSON.
        * @param {boolean} slim If true, only the core value is exported. If false, additional data is exported so that it can be re-created at a later stage.
        * @returns {any}
        */
        tokenize(slim?: boolean): any;
        /**
        * De-Tokenizes data from a JSON.
        * @param {any} data The data to import from
        */
        deTokenize(data: any): void;
        /**
        * Attempts to set the value of this property
        * @param {T} val
        */
        setVal(val: T): void;
        /**
        * Cleans up the class
        */
        dispose(): void;
        /**
        * Writes this portal out to a string
        */
        toString(): string;
    }
    class PropBool extends Prop<boolean> {
        /**
        * Creates a new instance
        * @param {string} name The name of the property
        * @param {boolean} value The value of the property
        * @param {string} category [Optional] An optional category to describe this property's function
        * @param {any} options [Optional] Any optional data to be associated with the property
        */
        constructor(name: string, value: boolean, category?: string, options?: any);
        /**
        * Attempts to clone the property
        * @returns PropBool}
        */
        clone(clone?: PropBool): PropBool;
    }
    class PropText extends Prop<string> {
        /**
        * Creates a new instance
        * @param {string} name The name of the property
        * @param {string} value The value of the property
        * @param {string} category [Optional] An optional category to describe this property's function
        * @param {any} options [Optional] Any optional data to be associated with the property
        */
        constructor(name: string, value: string, category?: string, options?: any);
        /**
        * Attempts to clone the property
        * @returns PropText}
        */
        clone(clone?: PropText): PropText;
    }
}
declare module Animate {
    /**
    * Defines a property variable. These are variables wrapped in sugar code to help sanitize and differentiate different pieces of data
    */
    class PropEnum extends Prop<string> {
        choices: Array<string>;
        /**
        * Creates a new instance
        * @param {string} name The name of the property
        * @param {string} value The value of the property
        * @param {number} choices The choices to select from
        * @param {string} category [Optional] An optional category to describe this property's function
        * @param {any} options [Optional] Any optional data to be associated with the property
        */
        constructor(name: string, value: string, choices: Array<string>, category?: string, options?: any);
        /**
       * Tokenizes the data into a JSON.
       * @param {boolean} slim If true, only the core value is exported. If false, additional data is exported so that it can be re-created at a later stage.
       * @returns {any}
       */
        tokenize(slim?: boolean): any;
        /**
        * Attempts to clone the property
        * @returns {PropEnum}
        */
        clone(clone?: PropEnum): PropEnum;
        /**
       * De-Tokenizes data from a JSON.
       * @param {any} data The data to import from
       */
        deTokenize(data: PropEnum): void;
    }
}
declare module Animate {
    /**
    * Defines a property variable. These are variables wrapped in sugar code to help sanitize and differentiate different pieces of data
    */
    class PropFileResource extends Prop<FileResource> {
        extensions: Array<string>;
        /**
        * Creates a new instance
        * @param {string} name The name of the property
        * @param {string} value The value of the property
        * @param {number} extensions The valid extends to use eg: ["bmp", "jpeg"]
        * @param {string} category [Optional] An optional category to describe this property's function
        * @param {any} options [Optional] Any optional data to be associated with the property
        */
        constructor(name: string, value: FileResource, extensions: Array<string>, category?: string, options?: any);
        /**
        * Attempts to clone the property
        * @returns {PropFileResource}
        */
        clone(clone?: PropFileResource): PropFileResource;
        /**
       * Tokenizes the data into a JSON.
       * @param {boolean} slim If true, only the core value is exported. If false, additional data is exported so that it can be re-created at a later stage.
       * @returns {any}
       */
        tokenize(slim?: boolean): any;
        /**
       * De-Tokenizes data from a JSON.
       * @param {any} data The data to import from
       */
        deTokenize(data: PropFileResource): void;
    }
}
declare module Animate {
    /**
    * Defines a property variable. These are variables wrapped in sugar code to help sanitize and differentiate different pieces of data
    */
    class PropNum extends Prop<number> {
        min: number;
        max: number;
        decimals: number;
        interval: number;
        /**
        * Creates a new instance
        * @param {string} name The name of the property
        * @param {number} value The value of the property
        * @param {number} min The minimum value this property can be
        * @param {number} max The maximum value this property can be
        * @param {number} decimals The number of decimals allowed
        * @param {number} interval The increment/decrement values of this number
        * @param {string} category [Optional] An optional category to describe this property's function
        * @param {any} options [Optional] Any optional data to be associated with the property
        */
        constructor(name: string, value: number, min?: number, max?: number, decimals?: number, interval?: number, category?: string, options?: any);
        /**
        * Attempts to fetch the value of this property
        * @returns {number}
        */
        getVal(): number;
        /**
        * Tokenizes the data into a JSON.
        * @param {boolean} slim If true, only the core value is exported. If false, additional data is exported so that it can be re-created at a later stage.
        * @returns {any}
        */
        tokenize(slim?: boolean): any;
        /**
        * De-Tokenizes data from a JSON.
        * @param {any} data The data to import from
        */
        deTokenize(data: PropNum): void;
        /**
        * Attempts to clone the property
        * @returns {PropNum}
        */
        clone(clone?: PropNum): PropNum;
    }
}
declare module Animate {
    /**
    * Defines an any property variable.
    */
    class PropObject extends Prop<any> {
        /**
        * Creates a new instance
        * @param {string} name The name of the property
        * @param {any} value The value of the property
        * @param {string} category [Optional] An optional category to describe this property's function
        * @param {any} options [Optional] Any optional data to be associated with the property
        */
        constructor(name: string, value: any, category?: string, options?: any);
        /**
        * Attempts to clone the property
        * @returns {PropObject}
        */
        clone(clone?: PropObject): PropObject;
    }
}
declare module Animate {
    /**
    * Defines a property variable. These are variables wrapped in sugar code to help sanitize and differentiate different pieces of data
    */
    class PropAsset extends Prop<ProjectResource<Engine.IResource>> {
        classNames: Array<string>;
        /**
        * Creates a new instance
        * @param {string} name The name of the property
        * @param {number} value The value of the property
        * @param {Array<string>} classNames An array of class names we can pick this resource from
        * @param {string} category [Optional] An optional category to describe this property's function
        * @param {any} options Any optional data to be associated with the property
        */
        constructor(name: string, value: ProjectResource<Engine.IResource>, classNames?: Array<string>, category?: string, options?: any);
        /**
        * Tokenizes the data into a JSON.
        * @param {boolean} slim If true, only the core value is exported. If false, additional data is exported so that it can be re-created at a later stage.
        * @returns {any}
        */
        tokenize(slim?: boolean): any;
        /**
        * De-Tokenizes data from a JSON.
        * @param {any} data The data to import from
        */
        deTokenize(data: any): void;
        /**
        * Attempts to clone the property
        * @returns {PropResource}
        */
        clone(clone?: PropAsset): PropAsset;
    }
}
declare module Animate {
    /**
    * Defines a property variable. These are variables wrapped in sugar code to help sanitize and differentiate different pieces of data
    */
    class PropGroup extends Prop<GroupArray> {
        /**
        * Creates a new instance
        * @param {string} name The name of the property
        * @param {GroupArray} value The value of the property
        * @param {string} category [Optional] An optional category to describe this property's function
        * @param {any} options Any optional data to be associated with the property
        */
        constructor(name: string, value: GroupArray, category?: string, options?: any);
        /**
        * Tokenizes the data into a JSON.
        * @param {boolean} slim If true, only the core value is exported. If false, additional data is exported so that it can be re-created at a later stage.
        * @returns {any}
        */
        tokenize(slim?: boolean): any;
        /**
        * De-Tokenizes data from a JSON.
        * @param {any} data The data to import from
        */
        deTokenize(data: any): void;
        /**
        * Attempts to clone the property
        * @returns {PropGroup}
        */
        clone(clone?: PropGroup): PropGroup;
    }
}
declare module Animate {
    /**
    * Defines a property variable. These are variables wrapped in sugar code to help sanitize and differentiate different pieces of data
    */
    class PropAssetList extends Prop<Array<ProjectResource<Engine.IResource>>> {
        classNames: Array<string>;
        /**
        * Creates a new instance
        * @param {string} name The name of the property
        * @param {Array<ProjectResource<Engine.IResource>>} value An array of project resources
        * @param {Array<string>} classNames An array of class names we can pick this resource from
        * @param {string} category [Optional] An optional category to describe this property's function
        * @param {any} options Any optional data to be associated with the property
        */
        constructor(name: string, value: Array<ProjectResource<Engine.IResource>>, classNames: Array<string>, category?: string, options?: any);
        /**
        * Tokenizes the data into a JSON.
        * @param {boolean} slim If true, only the core value is exported. If false, additional data is exported so that it can be re-created at a later stage.
        * @returns {any}
        */
        tokenize(slim?: boolean): any;
        /**
        * De-Tokenizes data from a JSON.
        * @param {any} data The data to import from
        */
        deTokenize(data: PropAsset): void;
        /**
        * Attempts to clone the property
        * @returns {PropResourceList}
        */
        clone(clone?: PropAssetList): PropAssetList;
    }
}
declare module Animate {
    /**
    * A small wrapper for colors
    */
    class Color {
        color: number;
        alpha: number;
        constructor(color?: number, alpha?: number);
        toString(): string;
    }
    /**
    * Defines a property variable. These are variables wrapped in sugar code to help sanitize and differentiate different pieces of data
    */
    class PropColor extends Prop<Color> {
        /**
        * Creates a new instance
        * @param {string} name The name of the property
        * @param {number} color The colour hex
        * @param {number} alpha The alpha value (0 to 1)
        * @param {string} category [Optional] An optional category to describe this property's function
        * @param {any} options [Optional] Any optional data to be associated with the property
        */
        constructor(name: string, color: number, alpha?: number, category?: string, options?: any);
        /**
        * Tokenizes the data into a JSON.
        * @param {boolean} slim If true, only the core value is exported. If false, additional data is exported so that it can be re-created at a later stage.
        * @returns {any}
        */
        tokenize(slim?: boolean): any;
        /**
        * Attempts to clone the property
        * @returns {PropColor}
        */
        clone(clone?: PropColor): PropColor;
        /**
        * De-Tokenizes data from a JSON.
        * @param {any} data The data to import from
        */
        deTokenize(data: Color): void;
    }
}
declare module Animate {
    /**
    * The interface for all layout objects.
    */
    interface ILayout {
        /**
        * Sets the component offsets based the layout algorithm
        * @param {Component} component The {Component} we are setting dimensions for.
        */
        update(component: Component): void;
    }
}
declare module Animate {
    /**
    * A simple Percentile layout. Changes a component's dimensions to be a
    * percentage of its parent width and height.
    */
    class Percentile implements ILayout {
        widthPercent: number;
        heightPercent: number;
        constructor(widthPercent?: number, heightPercent?: number);
        /**
        * Sets the component width and height to its parent.
        * @param {Component} component The {Component} we are setting dimensions for.
        */
        update(component: Component): void;
    }
}
declare module Animate {
    /**
    * A simple fill layout. Fills a component to its parent width and height. Optional
    * offsets can be used to tweak the fill.
    */
    class Fill implements ILayout {
        offsetX: number;
        offsetY: number;
        offsetWidth: number;
        offsetHeight: number;
        resrtictHorizontal: boolean;
        resrtictVertical: boolean;
        constructor(offsetX?: number, offsetY?: number, offsetWidth?: number, offsetHeight?: number, resrtictHorizontal?: boolean, resrtictVertical?: boolean);
        /**
        * Sets the component width and height to its parent.
        * @param {Component} component The {Component} we are setting dimensions for.
        */
        update(component: Component): void;
    }
}
declare module Animate {
    /**
    * A singleton class that manages displaying the tooltips of various components.
    */
    class TooltipManager {
        private static _singleton;
        private label;
        constructor();
        /**
        * @description Called when we hover over an element.
        * @param {any} e The JQUery event object
        */
        onMove: (e: any) => void;
        /**
        * Gets the singleton instance
        */
        static create(): TooltipManager;
    }
}
declare module Animate {
    class ComponentEvents extends ENUM {
        constructor(v: string);
        static UPDATED: ComponentEvents;
    }
    /**
    * The base class for all visual elements in the application. The {Component} class
    * contains a reference of a jQuery object that points to the {Component}'s DOM representation.
    */
    class Component extends EventDispatcher implements IComponent {
        static idCounter: number;
        private _element;
        private _children;
        private _layouts;
        private _id;
        private _parent;
        private _tooltip;
        private _enabled;
        tag: any;
        savedID: string;
        constructor(html: string | JQuery, parent?: Component);
        /**
        * Diposes and cleans up this component and all its child {Component}s
        */
        dispose(): void;
        /**
        * This function is called to update this component and its children.
        * Typically used in sizing operations.
        * @param {boolean} updateChildren Set this to true if you want the update to proliferate to all the children components.
        */
        update(updateChildren?: boolean): void;
        /**
        * Add layout algorithms to the {Component}.
        * @param {ILayout} layout The layout object we want to add
        * @returns {ILayout} The layout that was added
        */
        addLayout(layout: ILayout): ILayout;
        /**
        * Removes a layout from this {Component}
        * @param {ILayout} layout The layout to remove
        * @returns {ILayout} The layout that was removed
        */
        removeLayout(layout: ILayout): ILayout;
        /**
        * Gets the ILayouts for this component
        * {returns} Array<ILayout>
        */
        layouts: Array<ILayout>;
        /**
        * Use this function to add a child to this component.
        * This has the same effect of adding some HTML as a child of another piece of HTML.
        * It uses the jQuery append function to achieve this functionality.
        * @param {string | IComponent | JQuery} child The child component we want to add
        * @returns {IComponent} The added component
        */
        addChild(child: string | IComponent | JQuery): IComponent;
        /**
        * Checks to see if a component is a child of this one
        * @param {IComponent} child The {IComponent} to check
        * @returns {boolean} true if the component is a child
        */
        contains(child: IComponent): boolean;
        /**
        * Use this function to remove a child from this component.
        * It uses the {JQuery} detach function to achieve this functionality.
        * @param {IComponent} child The {IComponent} to remove from this {IComponent}'s children
        * @returns {IComponent} The {IComponent} we have removed
        */
        removeChild(child: IComponent): IComponent;
        /**
        * Removes all child nodes
        */
        clear(): void;
        onDelete(): void;
        /**
        * Returns the array of Child {Component}s
        * @returns {Array{IComponent}} An array of child {IComponent} objects
        */
        children: Array<IComponent>;
        /**
        * Gets the jQuery wrapper
        */
        element: JQuery;
        /**
        * Gets the jQuery parent
        */
        parent: Component;
        /**
        * Gets the tooltip for this {Component}
        */
        /**
        * Sets the tooltip for this {Component}
        */
        tooltip: string;
        /**
        * Get or Set if the component is enabled and recieves mouse events
        */
        /**
        * Get or Set if the component is enabled and recieves mouse events
        */
        enabled: boolean;
        /**
        * Gets the ID of thi component
        */
        id: string;
        /**
        * Get or Set if the component is selected. When set to true a css class of 'selected' is added to the {Component}
        */
        /**
        * Get or Set if the component is selected. When set to true a css class of 'selected' is added to the {Component}
        */
        selected: boolean;
    }
}
declare module Animate {
    class LogType extends ENUM {
        constructor(v: string);
        static MESSAGE: LogType;
        static WARNING: LogType;
        static ERROR: LogType;
    }
    /**
    * The Logger is a singleton class used to write message's to Animate's log window.
    */
    class Logger extends MenuList {
        private static _singleton;
        private context;
        private mDocker;
        private warningFlagger;
        private mContextProxy;
        constructor(parent: Component);
        /**
        * @type public mfunc onIconClick
        * When we click the error warning
        * @extends <Logger>
        */
        onIconClick(): void;
        /**
        * @type public mfunc getPreviewImage
        * This is called by a controlling ScreenManager class. An image string needs to be returned
        * which will act as a preview of the component that is being viewed or hidden.
        * @extends <Logger>
        * @returns <string>
        */
        getPreviewImage(): string;
        /**
        * This is called by a controlling Docker class when the component needs to be shown.
        */
        onShow(): void;
        /**
        * This is called by a controlling Docker class when the component needs to be hidden.
        */
        onHide(): void;
        /**
        * Each IDock item needs to implement this so that we can keep track of where it moves.
        * @returns {Docker}
        */
        getDocker(): Docker;
        /**
        * Each IDock item needs to implement this so that we can keep track of where it moves.
        * @param {Docker} val
        */
        setDocker(val: Docker): void;
        /**
        * Called when the context menu is about to open
        */
        onContextSelect(response: ContextMenuEvents, event: ContextMenuEvent, sender?: EventDispatcher): void;
        /**
        * Called when the context menu is about to open
        */
        onContext(e: any): void;
        /**
        * Adds an item to the Logger
        * @param {string} val The text to show on the logger.
        * @param {any} tag An optional tag to associate with the log.
        * @param {string} type The type of icon to associate with the log. By default its Logger.MESSAGE
        */
        static logMessage(val: string, tag: any, type?: LogType): JQuery;
        /**
        * Clears all the log messages
        */
        clearItems(): void;
        /**
        * Gets the singleton instance.
        * @param {Component} parent
        * @returns {Logger}
        */
        static getSingleton(parent?: Component): Logger;
    }
}
declare module Animate {
    /**
    * A Docker is used in Animate so that we can divide up screen real estate. A box is added to a parent component
    * which, when hovered or dragged, will enabled the user to move components around or explore hidden sections
    * of the application.
    */
    class Docker extends Component {
        private activeComponent;
        private _activePreview;
        private rollout;
        private mComponents;
        private mPreviews;
        private startProxy;
        private stopProxy;
        private clickPreview;
        private dropProxy;
        constructor(parent: Component);
        /** When we click on a preview.*/
        onClick(e: any): void;
        /** When we start draggin.*/
        onStart(e: any): void;
        /** When we stop draggin.*/
        onStop(e: any): void;
        /** Called when the mouse is over this element.*/
        onEnter(e: any): void;
        /** Called when the mouse leaves this element.*/
        onOut(e: any): void;
        /**Called when a draggable object is dropped onto the canvas.*/
        onObjectDropped(event: any, ui: any): void;
        /** Call this function to update the manager.*/
        update(): void;
        /** Gets the singleton instance. */
        setActiveComponent(comp: IDockItem, attach?: boolean): void;
        /** Removes an IDockItem from the manager */
        removeComponent(comp: IDockItem, completeRemoval?: boolean): void;
        /** Adds a IDockItem to the manager */
        addComponent(comp: any, attach: any): void;
        activePreview: JQuery;
    }
}
declare module Animate {
    class SplitOrientation extends ENUM {
        constructor(v: string);
        static VERTICAL: SplitOrientation;
        static HORIZONTAL: SplitOrientation;
    }
    /**
    * A Component that holds 2 sub Components and a splitter to split between them.
    */
    class SplitPanel extends Component {
        private offsetLeft;
        private offsetTop;
        private mPercent;
        private mDividerSize;
        private mPanel1;
        private mPanel2;
        private mDivider;
        private mDividerDragging;
        private mOrientation;
        private mPanelOverlay1;
        private mPanelOverlay2;
        private mMouseDownProxy;
        private mMouseUpProxy;
        private mMouseMoveProxy;
        /**
        * @param {Component} parent The parent to which this component is attached
        * @param {SplitOrientation} orientation The orientation of the slitter. It can be either SplitOrientation.VERTICAL or SplitOrientation.HORIZONTAL
        * @param {number} ratio The ratio of how far up or down, top or bottom the splitter will be. This is between 0 and 1.
        * @param {number} dividerSize The size of the split divider.
        */
        constructor(parent: Component, orientation?: SplitOrientation, ratio?: number, dividerSize?: number);
        /**
        * This function is called when the mouse is down on the divider
        * @param {any} e The jQuery event object
        */
        onDividerMouseDown(e: any): void;
        /**
        * This function is called when the mouse is up from the body of stage.
        * @param {any} e The jQuery event object
        */
        onStageMouseUp(e: any): void;
        /**
        * Call this function to update the panel.
        */
        update(): void;
        /**
        * This function is called when the mouse is up from the body of stage.
        * @param {any} e The jQuery event object
        */
        onStageMouseMove(e: any): boolean;
        /**
        * Call this function to get the ratio of the panel. Values are from 0 to 1.
        */
        /**
        * Call this function to set the ratio of the panel. Values are from 0 to 1.
        * @param {number} val The ratio from 0 to 1 of where the divider should be
        */
        ratio: number;
        /**
        * gets the orientation of this split panel
        */
        /**
        * Use this function to change the split panel from horizontal to vertcal orientation.
        * @param val The orientation of the split. This can be either SplitPanel.VERTICAL or SplitPanel.HORIZONTAL
        */
        orientation: SplitOrientation;
        /**
        * Gets the top panel.
        */
        top: Component;
        /**
        * Gets the bottom panel.
        */
        bottom: Component;
        /**
        * Gets the left panel.
        */
        left: Component;
        /**
        * Gets the right panel.
        */
        right: Component;
        /**
        * This will cleanup the component.
        */
        dispose(): void;
    }
}
declare module Animate {
    class WindowEvents extends ENUM {
        constructor(v: string);
        static HIDDEN: WindowEvents;
        static SHOWN: WindowEvents;
    }
    /**
    * This class is the base class for all windows in Animate
    */
    class Window extends Component {
        private _autoCenter;
        private _controlBox;
        private _header;
        private _headerText;
        private _headerCloseBut;
        private _content;
        private _modalBackdrop;
        private _isVisible;
        private _externalClickProxy;
        private _closeProxy;
        private _resizeProxy;
        /**
        * @param {number} width The width of the window in pixels
        * @param {number} height The height of the window in pixels
        * @param {boolean} autoCenter Should this window center itself on a resize event
        * @param {boolean} controlBox Does this window have a draggable title bar and close button
        * @param {string} title The text for window heading.Only applicable if we are using a control box.
        */
        constructor(width: number, height: number, autoCenter?: boolean, controlBox?: boolean, title?: string);
        /**
        * When we click on the close button
        * @param {any} e The jQuery event object
        */
        onCloseClicked(e: any): void;
        /**
        * When the stage move event is called
        * @param {any} e The jQuery event object
        */
        onStageMove(e: any): void;
        /**
        * Removes the window and modal from the DOM.
        */
        hide(): void;
        /**
        * Centers the window into the middle of the screen. This only works if the elements are added to the DOM first
        */
        center(): void;
        /**
        * Shows the window by adding it to a parent.
        * @param {Component} parent The parent Component we are adding this window to
        * @param {number} x The x coordinate of the window
        * @param {number} y The y coordinate of the window
        * @param {boolean} isModal Does this window block all other user operations?
        * @param {boolean} isPopup If the window is popup it will close whenever anything outside the window is clicked
        */
        show(parent?: Component, x?: number, y?: number, isModal?: boolean, isPopup?: boolean): void;
        /**
        * When we click the modal window we flash the window
        * @param {object} e The jQuery event object
        */
        onModalClicked(e: any): void;
        /**
        * Updates the dimensions if autoCenter is true.
        * @param {object} val
        */
        onWindowResized(val: any): void;
        /**
        * Hides the window if its show property is set to true
        * @param {any} e The jQuery event object
        */
        onStageClick(e: any): void;
        /** Gets the content component */
        content: Component;
        visible: boolean;
        headerText: string;
        modalBackdrop: JQuery;
        /**
        * This will cleanup the component.
        */
        dispose(): void;
    }
}
declare module Animate {
    class ContextMenuItem extends Component {
        private _text;
        private _imgURL;
        /**
        * Creates an instance of the item
        * @param {string} text The text of the item
        * @param {string} imgURL An optional image URL
        */
        constructor(text: string, imgURL: string, parent?: Component);
        /** Gets the text of the item */
        /** Sets the text of the item */
        text: string;
        /** Gets the image src of the item */
        /** Sets the image src of the item */
        imageURL: string;
    }
    class ContextMenuEvents extends ENUM {
        constructor(v: string);
        static ITEM_CLICKED: ContextMenuEvents;
    }
    /**
    * A ContextMenu is a popup window which displays a list of items that can be selected.
    */
    class ContextMenu extends Window {
        static currentContext: ContextMenu;
        private items;
        private selectedItem;
        /**
        */
        constructor();
        /**
        * Cleans up the context menu
        */
        dispose(): void;
        /**
        * Shows the window by adding it to a parent.
        * @param {Component} parent The parent Component we are adding this window to
        * @param {number} x The x coordinate of the window
        * @param {number} y The y coordinate of the window
        * @param {boolean} isModal Does this window block all other user operations?
        * @param {boolean} isPopup If the window is popup it will close whenever anything outside the window is clicked
        */
        show(parent?: Component, x?: number, y?: number, isModal?: boolean, isPopup?: boolean): void;
        /**
        * Adds an item to the ContextMenu
        * @param {ContextMenuItem} val The item we are adding
        * @returns {ContextMenuItem}
        */
        addItem(val: ContextMenuItem): ContextMenuItem;
        /**
        * Removes an item from the ContextMenu
        * @param {ContextMenuItem} val The item we are removing
        * @returns {ContextMenuItem}
        */
        removeItem(val: ContextMenuItem): ContextMenuItem;
        /**
        * Checks if we selected an item - if so it closes the context and dispatches the ITEM_CLICKED event.
        */
        onStageClick(e: any): void;
        /**
        * @description Called when we click an item
        * @param {ContextMenuItem} item The selected item
        * @param {JQuery} jqueryItem The jquery item
        */
        onItemClicked(item: ContextMenuItem, jqueryItem: JQuery): void;
        /**
        * Gets the number of items
        * @returns {number}
        */
        numItems: number;
        /**
        * Gets an item from the menu
        * @param {string} val The text of the item we need to get
        * @returns {ContextMenuItem}
        */
        getItem(val: string): ContextMenuItem;
        /**
        * Removes all items
        */
        clear(): void;
    }
}
declare module Animate {
    /**
    * This class is used to create tree view items.
    */
    class TreeView extends Component {
        private _selectedNode;
        private fixDiv;
        private _selectedNodes;
        constructor(parent: Component);
        /**
        * When we click the view
        * @param {any} e
        */
        onClick(e: any): void;
        /**
        * Selects a node.
        * @param {TreeNode} node The node to select
        * @param {boolean} expandToNode A bool to say if we need to traverse the tree down until we get to the node
        * and expand all parent nodes
        * @param {boolean} multiSelect If true then multiple nodes are selected
        */
        selectNode(node: TreeNode, expandToNode?: boolean, multiSelect?: boolean): void;
        /**
        * This will add a node to the treeview
        * @param {TreeNode} node The node to add
        * @returns {TreeNode}
        */
        addNode(node: TreeNode): TreeNode;
        /** @returns {Array<TreeNode>} The nodes of this treeview.*/
        nodes(): Array<TreeNode>;
        /**
        * This will clear and dispose of all the nodes
        * @returns Array<TreeNode> The nodes of this tree
        */
        clear(): void;
        /**
        * This removes a node from the treeview
        * @param {TreeNode} node The node to remove
        * @returns {TreeNode}
        */
        removeNode(node: any): TreeNode;
        /**
        * This will recursively look through each of the nodes to find a node with
        * the specified name.
        * @param {string} property The name property we are evaluating
        * @param {any} value The object we should be comparing against
        * @returns {TreeNode}
        */
        findNode(property: string, value: any): TreeNode;
        selectedNode: TreeNode;
        selectedNodes: Array<TreeNode>;
    }
}
declare module Animate {
    class TabEvents extends ENUM {
        constructor(v: string);
        static SELECTED: TabEvents;
        static REMOVED: TabEvents;
    }
    /**
    * The Tab component will create a series of selectable tabs which open specific tab pages.
    */
    class Tab extends Component {
        static contextMenu: ContextMenu;
        private _tabSelectorsDiv;
        private _pagesDiv;
        private _tabPairs;
        private _selectedPair;
        private _dropButton;
        constructor(parent: Component);
        /**
        * When we click the tab
        * @param {TabPair} tab The tab pair object containing both the label and page <Comonent>s
        */
        onTabSelected(tab: TabPair): void;
        /**
        * @description When the context menu is clicked.
        */
        onContext(response: ContextMenuEvents, event: ContextMenuEvent): void;
        /**
        * Get the tab to select a tab page
        * @param {TabPair} tab
        */
        selectTab(tab: TabPair): TabPair;
        /**
        * Called just before a tab is closed. If you return false it will cancel the operation.
        * @param {TabPair} tabPair
        * @returns {boolean}
        */
        onTabPairClosing(tabPair: TabPair): boolean;
        /**
        * When we click the tab
        * @param {any} e
        */
        onClick(e: any): boolean;
        /**
        * When we update the tab - we move the dop button to the right of its extremities.
        */
        update(): void;
        /**
        * Adds an item to the tab
        * @param {string} val The label text of the tab or a {TabPair} object
        * @param {boolean} canClose
        * @returns {TabPair} The tab pair containing both the label and page <Component>s
        */
        addTab(val: string, canClose: boolean): TabPair;
        addTab(val: TabPair, canClose: boolean): TabPair;
        /**
        * Gets a tab pair by name.
        * @param {string} val The label text of the tab
        * @returns {TabPair} The tab pair containing both the label and page {Component}s
        */
        getTab(val: string): TabPair;
        /**
        * This will cleanup the component.
        */
        dispose(): void;
        /**
        * Removes all items from the tab. This will call dispose on all components.
        */
        clear(): void;
        /**
        * Removes an item from the tab
        * @param val The label text of the tab
        * @param {boolean} dispose Set this to true to clean up the tab
        * @returns {TabPair} The tab pair containing both the label and page <Component>s
        */
        removeTab(val: string, dispose: boolean): any;
        removeTab(val: TabPair, dispose: boolean): any;
        tabs: Array<TabPair>;
    }
}
declare module Animate {
    /**
    * This class is a small container class that is used by the Tab class. It creates TabPairs
    * each time a tab is created with the addTab function. This creates a TabPair object that keeps a reference to the
    * label and page as well as a few other things.
    */
    class TabPair {
        tab: Tab;
        tabSelector: Component;
        page: Component;
        name: string;
        private _savedSpan;
        private _modified;
        constructor(selector: Component, page: Component, name: string);
        /**
        * Gets if this tab pair has been modified or not
        * @returns {boolean}
        */
        /**
        * Sets if this tab pair has been modified or not
        * @param {boolean} val
        */
        modified: boolean;
        /**
        * Called when the editor is resized
        */
        onResize(): void;
        /**
        * Called by the tab class when the pair is to be removed.
        * @param {TabEvent} data An object that can be used to cancel the operation. Simply call data.cancel = true to cancel the closure.
        */
        onRemove(data: TabEvent): void;
        /**
        * Called by the tab when the save all button is clicked
        */
        onSaveAll(): void;
        /**
        * Called when the pair has been added to the tab
        */
        onAdded(): void;
        /**
        * Called when the pair has been selected
        */
        onSelected(): void;
        /**
        * Gets the label text of the pair
        */
        /**
        * Sets the label text of the pair
        */
        text: string;
        /**
        * Cleans up the references
        */
        dispose(): void;
    }
}
declare module Animate {
    /**
    * A simple label wrapper. This creates a div that has a textfield sub div. the
    * subdiv is the DOM element that actually contains the text.
    */
    class Label extends Component {
        private _text;
        textfield: Component;
        constructor(text: string, parent: Component, html?: string);
        /**
        * Gets the text of the label
        */
        /**
        * Sets the text of the label
        */
        text: string;
        /**
        * This will cleanup the {Label}
        */
        dispose(): void;
        /**
        * Returns the text height, in pixels, of this label. Use this function sparingly as it adds a clone
        * of the element to the body, measures the text then removes the clone. This is so that we get the text even if
        * the <Component> is not on the DOM
        * @extends <Label>
        * @returns <number>
        */
        textHeight: number;
    }
}
declare module Animate {
    /**
    * A simple button class
    */
    class Button extends Label {
        /**
        * @param {string} The button text
        * @param {Component} parent The parent of the button
        * @param {number} width The width of the button (optional)
        * @param {number} height The height of the button (optional)
        */
        constructor(text: string, parent: Component, html?: string, width?: number, height?: number);
        /**
        * A shortcut for jQuery's css property.
        */
        css(propertyName: any, value?: any): any;
        /**This will cleanup the component.*/
        dispose(): void;
        /**
        * Get or Set if the component is selected. When set to true a css class of 'selected' is added to the {Component}
        */
        /**
        * Get or Set if the component is selected. When set to true a css class of 'selected' is added to the {Component}
        */
        selected: boolean;
    }
}
declare module Animate {
    /**
    * A simple {Component} that you can use to get user input by using the text function
    */
    class InputBox extends Component {
        private _limit;
        private _textfield;
        /**
        * @param {Component} parent The parent <Component> to which we add this box
        * @param {string} text The text of the input box
        * @param {boolean} isTextArea True if this is a text area (for larger text)
        * @param {boolean} isPassword True if this needs to be obscured for passwords
        * @param {string} html
        */
        constructor(parent: Component, text: string, isTextArea?: boolean, isPassword?: boolean, html?: string);
        /**
        * Called when the text property is changed. This function will only fire if a limit has been
        * set with the limitCharacters(val) function.
        * @param {any} e
        */
        onTextChange(e: any): void;
        /**
        * Use this function to get a limit on how many characters can be entered in this input
        * @returns {number} val The integer limit of characters
        */
        /**
        * Use this function to set a limit on how many characters can be entered in this input
        * @param {number} val The integer limit of characters
        */
        limitCharacters: number;
        /**
        * @returns {string}
        */
        /**
        * @param {string} val
        */
        text: string;
        /**
        * Highlights and focuses the text of this input
        * @param {boolean} focusInView If set to true the input will be scrolled to as well as selected. This is not
        * always desireable because the input  might be off screen on purpose.
        */
        focus(focusInView?: boolean): void;
        /**
        * This will cleanup the component.
        */
        dispose(): void;
        textfield: Component;
    }
}
declare module Animate {
    /**
    * A small holder div that emulates C# style grids. Use the content variable instead of the group directly
    */
    class Group extends Component {
        private heading;
        content: Component;
        constructor(text: any, parent: any);
        /**
        * Gets or sets the label text
        * @param {string} val The text for this label
        * @returns {string} The text for this label
        */
        text(val: any): JQuery;
        /**
        * This will cleanup the <Group>.
        */
        dispose(): void;
    }
}
declare module Animate {
    /**
    * A wrapper class for checkboxes
    */
    class Checkbox extends Component {
        private checkbox;
        private textfield;
        /**
        * A wrapper class for checkboxes
        */
        constructor(parent: Component, text: string, checked: boolean, html?: string);
        /**Gets if the checkbox is checked.*/
        /**Sets if the checkbox is checked.*/
        checked: boolean;
        /**Gets the checkbox label text*/
        /**Sets the checkbox label text*/
        text: string;
        /**This will cleanup the component.*/
        dispose(): void;
    }
}
declare module Animate {
    /**
    * A small component that represents a text - value pair
    */
    class LabelVal extends Component {
        private label;
        private _val;
        /**
        * @param {Component} parent The parent component
        * @param {string} text The label text
        * @param {Component} val The component we are pairing with the label
        * @param {any} css An optional css object to apply to the val component
        */
        constructor(parent: Component, text: string, val: Component, css?: any);
        /**This will cleanup the component.*/
        dispose(): void;
        val: Component;
        /**Gets the label text*/
        text: string;
    }
}
declare module Animate {
    /**
    * The ListViewItem class is used in the ListView class. These represent the items you can select.
    */
    class ListViewItem {
        private _fields;
        private _components;
        private _smallImg;
        private _largeIMG;
        private _rowNum;
        tag: any;
        /**
        * @param {Array<string>} fields An array of strings. These strings will be evenly distributed between columns of a list view.
        * @param {string} smallImg The URL of an image to use that can represent the small image of this item when in Image mode of the list view
        * @param {string} largeIMG The URL of an image to use that can represent the large image of this item when in Image mode of the list view
        */
        constructor(fields: Array<string>, smallImg?: string, largeIMG?: string);
        /**
        * This function clears the field's components
        */
        clearComponents(): void;
        /**
        * This function is used to cleanup the object before its removed from memory.
        */
        dispose(): void;
        /**
        * Creates a preview component for the list view.
        * @param {string} text Text to show under the preview
        * @param {number} imgSize The size of the image
        * @returns <Component>
        */
        preview(text: string, imgSize: number): Component;
        /**
        * Creates a field component
        * @param string content The text to show inside of the field
        * @returns {Component}
        */
        field(content: string): Component;
        components: Array<Component>;
        fields: Array<string>;
        smallImg: string;
        largeIMG: string;
    }
}
declare module Animate {
    /**
    * The ListViewHeader class is used in the ListView class. It acts as the first selectable item row in the list view.
    */
    class ListViewHeader extends Component {
        text: string;
        /**
        * @param {string} text The text of the header
        * @param {string} image The optional image of the header
        */
        constructor(text: string, image: string);
    }
}
declare module Animate {
    class ListViewEvents extends ENUM {
        constructor(v: string);
        static ITEM_CLICKED: ListViewEvents;
        static ITEM_DOUBLE_CLICKED: ListViewEvents;
    }
    class ColumnItem {
        text: string;
        image: string;
        constructor(text: string, image?: string);
    }
    class ListViewType {
        value: string;
        constructor(v: string);
        toString(): string;
        static DETAILS: ListViewType;
        static IMAGES: ListViewType;
    }
    /**
    * The ListView class is used to display a series of {ListViewItem}s. Each item can
    * organised by a series of columns
    */
    class ListView extends Component {
        private _mode;
        private _selectedItem;
        private _lists;
        private _items;
        private _columns;
        private _sortableColumn;
        private _imgSize;
        private _multiSelect;
        private _fix;
        private _divider;
        private _selectedColumn;
        private _dClickProxy;
        private _clickProxy;
        private _downProxy;
        private _upProxy;
        private _moveProxy;
        constructor(parent: Component);
        /**
        * @returns {ListViewType} Either ListViewType.DETAILS or ListViewType.IMAGES
        */
        /**
        * Toggle between the different modes
        * @param {ListViewType} mode Either DETAILS or IMAGES mode
        */
        displayMode: ListViewType;
        /**
        * Called when we hold down on this component
        * @param {any} e The jQuery event object
        */
        onDown(e: any): boolean;
        /**
        * Called when we move over this componeny
        * @param {any} e The jQuery event object
        */
        onMove(e: any): void;
        /**
        * Called when the mouse up event is fired
        * @param {any} e The jQuery event object
        */
        onUp(e: any): void;
        onDoubleClick(e: any): boolean;
        /**
        * Called when we click this component
        * @param {any} e The jQuery event object
        */
        onClick(e: any): void;
        /**
        * Gets all the items that are selected
        * @returns {Array<ListViewItem>}
        */
        getSelectedItems(): Array<ListViewItem>;
        /**
        * Sets which items must be selected. If you specify null then no items will be selected.
        */
        setSelectedItems(items: any): void;
        /**
        * This function is used to clean up the list
        */
        dispose(): void;
        /**
        * Redraws the list with the items correctly synced with the column names
        * @returns {any}
        */
        updateItems(): void;
        /**
        * Adds a column
        * @param {string} name The name of the new column
        * @param {string} image The image of the column
        */
        addColumn(name: string, image?: string): void;
        /**
        * Removes a column
        * @param {string} name The name of the column to remove
        */
        removeColumn(name: any): void;
        /**
        * Adds a {ListViewItem} to this list
        * @param {ListViewItem} item The item we are adding to the list
        * @returns {ListViewItem}
        */
        addItem(item: any): any;
        /**
        * Sets the length of a column by its index
        * @param <int> columnIndex The index of the column
        * @param {string} width A CSS width property. This can be either % or px
        * @returns {ListViewItem}
        */
        setColumnWidth(columnIndex: any, width: any): void;
        /**
        * Removes a {ListViewItem} from this list
        * @param {ListViewItem} item The {ListViewItem} to remove.
        * @param {boolean} dispose If set to true the item will be disposed
        * @returns {ListViewItem}
        */
        removeItem(item: ListViewItem, dispose?: boolean): ListViewItem;
        /**
        * This function is used to remove all items from the list.
        * @param {boolean} dispose If set to true the item will be disposed
        */
        clearItems(dispose?: boolean): void;
        items: Array<ListViewItem>;
        lists: Array<Component>;
    }
}
declare module Animate {
    class ListEvents extends ENUM {
        constructor(v: string);
        static ITEM_SELECTED: ListEvents;
    }
    /**
    * Use this class to create a select list.
    */
    class List extends Component {
        selectBox: Component;
        private selectProxy;
        items: Array<JQuery>;
        /**
        * @param {Component} parent The parent component of this list
        * @param {string} html An optional set of HTML to use. The default is <div class='list-box'></div>
        * @param {string} selectHTML
        * @param {boolean} isDropDown
        */
        constructor(parent: Component, html?: string, selectHTML?: string, isDropDown?: boolean);
        /**
        * Called when a selection is made
        * @param <object> val Called when we make a selection
        */
        onSelection(val: any): void;
        /**
        * Adds an item to the list
        * @param {string} val The text of the item
        * @returns {JQuery} The jQuery object created
        */
        addItem(val: string): JQuery;
        /**
        * Sorts  the  list alphabetically
        */
        sort(): void;
        /**
        * Removes an item from the list
        * @param <object> val The text of the item to remove
        * @returns <object> The jQuery object
        */
        removeItem(val: any): JQuery;
        /**
        * Gets the number of list items
        * @returns {number} The number of items
        */
        numItems(): number;
        /**
        * Gets thee selected item from the list.
        * @returns {JQuery} The selected jQuery object
        */
        /**
        * Sets thee selected item from the list.
        * @param {string} val The text of the item
        */
        selectedItem: string;
        /**
        * Gets the selected item index from the list by its
        * index.
        * @returns {number} The selected index or -1 if nothing was found.
        */
        /**
        * Sets the selected item index from the list by its index.
        * @param {number} val The text of the item
        */
        selectedIndex: number;
        /**
        * Gets item from the list by its value
        * @param {string} val The text of the item
        * @returns {JQuery} The jQuery object
        */
        getItem(val: string): JQuery;
        /**
        * Removes all items
        */
        clearItems(): void;
        /**
        * Diposes and cleans up this component and all its child <Component>s
        */
        dispose(): void;
    }
}
declare module Animate {
    /**
    * Use this class to create a drop down box of items.
    */
    class ComboBox extends List {
        constructor(parent?: Component);
    }
}
declare module Animate {
    class MenuListEvents extends ENUM {
        constructor(v: string);
        static ITEM_CLICKED: MenuListEvents;
    }
    /**
    * A specially designed type of list
    */
    class MenuList extends Component {
        private _items;
        private selectedItem;
        constructor(parent: Component);
        /**
        * Adds an HTML item
        * @returns {string} img The URL of the image
        * @returns {string} val The text of the item
        * @returns {boolean} prepend True if you want to prepend as opposed to append
        */
        addItem(img: string, val: string, prepend?: boolean): JQuery;
        /**
        * Removes an  item from this list
        * @param {JQuery} item The jQuery object we are removing
        */
        removeItem(item: JQuery): void;
        /**
        * Clears all the items added to this list
        */
        clearItems(): void;
        /**
        * Checks if we selected an item - if so it closes the context and dispatches the ITEM_CLICKED event.
        * @param {any} e The jQuery event object
        */
        onClick(e: any): void;
        items: Array<JQuery>;
    }
}
declare module Animate {
    /**
    * The main GUI component of the application.
    */
    class Application extends Component {
        private static _singleton;
        static bodyComponent: Component;
        private _focusObj;
        private _resizeProxy;
        private _downProxy;
        private _dockerlefttop;
        private _dockerleftbottom;
        private _dockerrighttop;
        private _dockerrightbottom;
        private _canvasContext;
        constructor(domElement?: string);
        /**
        * Deals with the focus changes
        * @param {object} e The jQuery event object
        */
        onMouseDown(e: any): void;
        /**
        * Sets a component to be focused.
        * @param {Component} comp The component to focus on.
        */
        setFocus(comp: Component): void;
        /**
        * Updates the dimensions of the application
        * @param {object} val The jQuery event object
        */
        onWindowResized(val: any): void;
        /**
        * This will cleanup the component.
        */
        dispose(): void;
        /**
        *  This is called when a project is unloaded and we need to reset the GUI.
        */
        projectReset(): void;
        /**
        * Gets the singleton instance
        */
        static getInstance(domElement?: string): Application;
        focusObj: Component;
        canvasContext: CanvasContext;
        dockerLeftTop: Docker;
        dockerLeftBottom: Docker;
        dockerRightTop: Docker;
        dockerRightBottom: Docker;
    }
}
declare module Animate {
    type LinkMap = {
        [shallowId: number]: {
            item: CanvasItem;
            token: ICanvasItem;
        };
    };
    /**
    * The base class for all canvas items
    */
    class CanvasItem extends Component {
        shallowId: number;
        /**
        * Creates an instance
        */
        constructor(html: string, parent: Component);
        /**
        * A shortcut for jQuery's css property.
        */
        css(propertyName: any, value?: any): any;
        /**
        * Tokenizes the data into a JSON.
        * @param {boolean} slim If true, only the core value is exported. If false, additional data is exported so that it can be re-created at a later stage
        * @returns {ICanvasItem}
        */
        tokenize(slim?: boolean): ICanvasItem;
        /**
        * De-Tokenizes data from a JSON.
        * @param {ICanvasItem} data The data to import from
        */
        deTokenize(data: ICanvasItem): void;
        /**
        * Called after de-tokenization. This is so that the items can link up to any other items that might have been created in the process.
        * @param {number} originalId The original shallow ID of the item when it was tokenized.
        * @param {LinkMap} items The items loaded from the detokenization process. To get this item you can do the following: items[originalId].item
        * or to get the token you can use items[originalId].token
        */
        link(originalId: number, items: LinkMap): void;
    }
}
declare module Animate {
    /**
    * Behaviours are the base class for all nodes placed on a <Canvas>
    */
    class Behaviour extends CanvasItem implements IRenamable {
        private _originalName;
        private _alias;
        private _canGhost;
        private _requiresUpdated;
        private _parameters;
        private _products;
        private _outputs;
        private _inputs;
        private _portals;
        private _fontSize;
        private _properties;
        constructor(parent: Component, text: string, html?: string);
        /**
        * Gets a portal by its name
        * @param {string} name The portal name
        * @returns {Portal}
        */
        getPortal(name: string): Portal;
        /**
        * Adds a portal to this behaviour.
        * @param {PortalType} type The type of portal we are adding. It can be either Portal.INPUT, Portal.OUTPUT, Portal.PARAMETER & Portal.PRODUCT
        * @param {Prop<any>} property
        * @returns {Portal}
        */
        addPortal(type: PortalType, property: Prop<any>, update: boolean, custom?: boolean): Portal;
        /**
        * Removes a portal from this behaviour
        * @param {Portal} toRemove The portal object we are removing
        * @param {any} dispose Should the portal be disposed. The default is true.
        * @returns {Portal} The portal we have removed. This would be disposed if dispose was set to true.
        */
        removePortal(toRemove: Portal, dispose?: boolean): Portal;
        /**
        * Called when the behaviour is renamed
        * @param {string} name The new name of the behaviour
        */
        onRenamed(name: string): void;
        /**
        * A shortcut for jQuery's css property.
        */
        css(propertyName: any, value?: any): any;
        /**
        * Updates the behavior width and height and organises the portals
        */
        updateDimensions(): void;
        /**
        * Gets the text of the behaviour
        */
        /**
        * sets the label text
        */
        text: string;
        /**
        * Get or Set if the component is selected. When set to true a css class of 'selected' is added to the {Component}
        */
        /**
        * Get or Set if the component is selected. When set to true a css class of 'selected' is added to the {Component}
        */
        selected: boolean;
        /**
        * Tokenizes the data into a JSON.
        * @param {boolean} slim If true, only the core value is exported. If false, additional data is exported so that it can be re-created at a later stage
        * @returns {IBehaviour}
        */
        tokenize(slim?: boolean): IBehaviour;
        /**
        * De-Tokenizes data from a JSON.
        * @param {IBehaviour} data The data to import from
        */
        deTokenize(data: IBehaviour): void;
        /**
        * Diposes and cleans up this component and all its child components
        */
        dispose(): void;
        name: string;
        properties: EditableSet;
        originalName: string;
        alias: string;
        canGhost: boolean;
        requiresUpdated: boolean;
        parameters: Array<Portal>;
        products: Array<Portal>;
        outputs: Array<Portal>;
        inputs: Array<Portal>;
        portals: Array<Portal>;
    }
}
declare module Animate {
    class BehaviourPortal extends Behaviour {
        private _portalType;
        private _property;
        constructor(parent: Component, property: Prop<any>, portalType?: PortalType);
        /**
        * Tokenizes the data into a JSON.
        * @param {boolean} slim If true, only the core value is exported. If false, additional data is exported so that it can be re-created at a later stage
        * @returns {IBehaviourPortal}
        */
        tokenize(slim?: boolean): IBehaviourPortal;
        /**
        * De-Tokenizes data from a JSON.
        * @param {IBehaviourPortal} data The data to import from
        */
        deTokenize(data: IBehaviourPortal): void;
        /**
        * This will cleanup the component.
        */
        dispose(): void;
        portaltype: PortalType;
        property: Prop<any>;
    }
}
declare module Animate {
    /**
    * A node used to ghost - or act as a shortcut - for an existing node. This node is created when you hold shift and
    * move a node on the canvas. The ghost can then be as if it were the original node.
    */
    class BehaviourShortcut extends Behaviour {
        private _originalNode;
        private _savedResource;
        /**
        * @param {Canvas} parent The parent canvas
        * @param {Behaviour} originalNode The original node we are copying from
        */
        constructor(parent: Canvas, originalNode: Behaviour, text: string);
        /**
        * Tokenizes the data into a JSON.
        * @param {boolean} slim If true, only the core value is exported. If false, additional data is exported so that it can be re-created at a later stage
        * @returns {IBehaviourResource}
        */
        tokenize(slim?: boolean): IBehaviourShortcut;
        /**
        * De-Tokenizes data from a JSON.
        * @param {IBehaviourResource} data The data to import from
        */
        deTokenize(data: IBehaviourShortcut): void;
        /**
        * Called after de-tokenization. This is so that the items can link up to any other items that might have been created in the process.
        * @param {number} originalId The original shallow ID of the item when it was tokenized.
        * @param {LinkMap} items The items loaded from the detokenization process. To get this item you can do the following: items[originalId].item
        * or to get the token you can use items[originalId].token
        */
        link(originalId: number, items: LinkMap): void;
        setOriginalNode(originalNode: Behaviour, buildPortals: boolean): void;
        /**
        * This will cleanup the component.
        */
        dispose(): void;
        originalNode: Behaviour;
    }
}
declare module Animate {
    class BehaviourAsset extends Behaviour {
        private _asset;
        constructor(parent: Canvas, text?: string);
        /**
        * Diposes and cleans up this component and all its child <Component>s
        */
        dispose(): void;
        /**
        * Tokenizes the data into a JSON.
        * @param {boolean} slim If true, only the core value is exported. If false, additional data is exported so that it can be re-created at a later stage
        * @returns {IBehaviour}
        */
        tokenize(slim?: boolean): IBehaviour;
        /**
        * Adds a portal to this behaviour.
        * @param {PortalType} type The type of portal we are adding. It can be either Portal.INPUT, Portal.OUTPUT, Portal.PARAMETER & Portal.PRODUCT
        * @param {Prop<any>} property
        * @returns {Portal}
        */
        addPortal(type: PortalType, property: Prop<any>, update: boolean): Portal;
        asset: Asset;
    }
}
declare module Animate {
    /**
    * A node for displaying comments
    */
    class BehaviourComment extends Behaviour {
        private isInInputMode;
        private input;
        private stageClickProxy;
        private mStartX;
        private mStartY;
        private mOffsetX;
        private mOffsetY;
        constructor(parent: Component, text: string);
        /**
       * Tokenizes the data into a JSON.
       * @param {boolean} slim If true, only the core value is exported. If false, additional data is exported so that it can be re-created at a later stage
       * @returns {IBehaviour}
       */
        tokenize(slim?: boolean): IBehaviour;
        /**
       * De-Tokenizes data from a JSON.
       * @param {IBehaviourComment} data The data to import from
       */
        deTokenize(data: IBehaviourComment): void;
        /**
        * When the text property is edited
        */
        onEdit(type: string, event: EditEvent, sender?: EventDispatcher): void;
        /**
        * Does nothing...
        */
        updateDimensions(): void;
        /**
        * When the mouse enters the behaviour
        */
        onIn(e: any): void;
        /**
        * A shortcut for jQuery's css property.
        */
        css(propertyName: any, value?: any): any;
        /**
        * When the mouse enters the behaviour
        */
        onOut(e: any): void;
        /**
        * When the resize starts.
        */
        onResizeStart(event: any, ui: any): void;
        /**
        * When the resize updates.
        */
        onResizeUpdate(event: any, ui: any): void;
        /**
        * When the resize stops.
        */
        onResizeStop(event: any, ui: any): void;
        /**
        * Call this to allow for text editing in the comment.
        */
        enterText(): boolean;
        /**
        * When we click on the stage we go out of edit mode.
        */
        onStageClick(e: any): void;
        /**
        * This will cleanup the component.
        */
        dispose(): void;
    }
}
declare module Animate {
    /**
    * A portal class for behaviours. There are 4 different types of portals -
    * INPUT, OUTPUT, PARAMETER and PRODUCT. Each portal acts as a gate for a behaviour.
    */
    class Portal extends Component {
        private _links;
        private _customPortal;
        private _type;
        private _property;
        behaviour: Behaviour;
        /**
        * @param {Behaviour} parent The parent component of the Portal
        * @param {PortalType} type The portal type. This can be either Portal.INPUT, Portal.OUTPUT, Portal.PARAMETER or Portal.PRODUCT
        * @param {Prop<any>} property The property associated with this portal
        */
        constructor(parent: Behaviour, type: PortalType, property: Prop<any>, custom?: boolean);
        /**
        * Edits the portal variables
        * @param {Prop<any>} property The new value of the property
        */
        edit(property: Prop<any>): void;
        /**
        * This function will check if the source portal is an acceptable match with the current portal.
        * @param source The source panel we are checking against
        */
        checkPortalLink(source: Portal): boolean;
        /**
        * This function will check if the source portal is an acceptable match with the current portal.
        */
        dispose(): void;
        /**
        * When the mouse is down on the portal.
        * @param {object} e The jQuery event object
        */
        onPortalDown(e: any): void;
        /**
        * Adds a link to the portal.
        * @param {Link} link The link we are adding
        */
        addLink(link: Link): void;
        /**
        * Removes a link from the portal.
        * @param {Link} link The link we are removing
        */
        removeLink(link: Link): Link;
        /**
        * Makes sure the links are positioned correctly
        */
        updateAllLinks(): void;
        /**
        * Returns this portal's position on the canvas.
        */
        positionOnCanvas(): {
            left: number;
            top: number;
        };
        type: PortalType;
        property: Prop<any>;
        customPortal: boolean;
        links: Array<Link>;
    }
}
declare module Animate {
    /**
    * A behaviour node that represents a Behaviour Container
    */
    class BehaviourInstance extends Behaviour {
        private _container;
        constructor(parent: Component, container: Container);
        /**
        * Tokenizes the data into a JSON.
        * @param {boolean} slim If true, only the core value is exported. If false, additional data is exported so that it can be re-created at a later stage
        * @returns {IBehaviourResource}
        */
        tokenize(slim?: boolean): IBehaviourShortcut;
        /**
        * De-Tokenizes data from a JSON.
        * @param {IBehaviourResource} data The data to import from
        */
        deTokenize(data: IBehaviourShortcut): void;
        /**
        * Called when a behaviour is disposed
        */
        onContainerDeleted(type: string, event: ContainerEvent, sender?: EventDispatcher): void;
        /**
        * This is called when a Canvas reports a portal being added, removed or modified.
        */
        onPortalChanged(type: string, event: PortalEvent, sender?: EventDispatcher): void;
        /**
        * Diposes and cleans up this component and all its child Components
        */
        dispose(): void;
        /**
        * Gets the container this instance represents
        * @returns {Container}
        */
        /**
        * Sets the container this instance represents
        * @param {Container} val
        */
        container: Container;
    }
}
declare module Animate {
    /**
    * A behaviour node that acts as a script. Users can create custom JS within the body. These nodes are connected to
    * database entries and so need to be cleaned up properly when modified by the user.
    */
    class BehaviourScript extends Behaviour {
        scriptId: string;
        scriptTab: ScriptTab;
        private _loading;
        constructor(parent: Component, scriptId: string, text: string, copied?: boolean);
        /**
        * Called when the behaviour is renamed
        * @param <string> name The new name of the behaviour
        */
        onRenamed(name: any): void;
        /**
        * This function will open a script tab
        */
        edit(): void;
        /**
        * Tokenizes the data into a JSON.
        * @param {boolean} slim If true, only the core value is exported. If false, additional data is exported so that it can be re-created at a later stage
        * @returns {IBehaviourScript}
        */
        tokenize(slim?: boolean): IBehaviourScript;
        /**
        * De-Tokenizes data from a JSON.
        * @param {IBehaviourScript} data The data to import from
        */
        deTokenize(data: IBehaviourScript): void;
        /**
        * Diposes and cleans up this component and all its child Components
        */
        dispose(): void;
    }
}
declare module Animate {
    class CanvasEvents extends ENUM {
        constructor(v: string);
        static MODIFIED: CanvasEvents;
    }
    /**
    * The canvas is used to create diagrammatic representations of behaviours and how they interact in the scene.
    */
    class Canvas extends Component {
        static lastSelectedItem: any;
        static snapping: boolean;
        name: string;
        private _upProxy;
        private _downProxy;
        private _contextProxy;
        private _keyProxy;
        private _contextNode;
        private _x;
        private _y;
        private _container;
        private _containerReferences;
        private _proxyMoving;
        private _proxyStartDrag;
        private _proxyStopDrag;
        private _loadingScene;
        /**
        * @param {Component} parent The parent component to add this canvas to
        * @param {Container} cntainer Each canvas represents a behaviour.This container is the representation of the canvas as a behaviour.
        */
        constructor(parent: Component, container: Container);
        /**
         * Event fired when we start dragging a behaviour
         * @param e
         * @param ui
         */
        onStartingDrag(e: JQueryEventObject, ui: JQueryUI.DraggableEvent): void;
        /**
        * When an item is finished being dragged
        */
        onChildDropped(e: any, ui: any): void;
        /**
        * Called when a draggable object is dropped onto the canvas.
        * @param {any} event The jQuery UI event
        * @param {any} ui The event object sent from jQuery UI
        */
        onObjectDropped(event: any, ui: any): void;
        /**
        * Create an asset node at a location
        * @param {Asset} asset
        * @param {number} x
        * @param {number} y
        */
        addAssetAtLocation(asset: Asset, x: number, y: number): void;
        /**
        * This function is used to cleanup the object before its removed from memory.
        */
        dispose(): void;
        /**
        * This function will remove all references of an asset in the behaviour nodes
        * @param {Asset} asset The asset reference
        */
        removeAsset(asset: Asset): void;
        /**
        * Call this to remove an item from the canvas
        * @param {Component} item The component we are removing from the canvas
        */
        removeItem(item: Component): void;
        /**
        * Removes all selected items
        */
        removeItems(): void;
        /**
        * Called when the canvas context menu is closed and an item clicked.
        */
        onContextSelect(e: ContextMenuEvents, event: ContextMenuEvent): void;
        getAssetList(asset: Asset, assetMap: Array<number>): void;
        onAssetEdited(e: ENUM, event: Event, sender?: EventDispatcher): void;
        buildSceneReferences(): void;
        /**
        * Whenever an item is edited
        */
        onItemEdited(type: string, event: EditEvent, sender?: EventDispatcher): void;
        /**
        * When we click ok on the portal form
        */
        OnPortalConfirm(response: OkCancelFormEvents, e: OkCancelFormEvent): void;
        /**
        * When the context is hidden we remove the event listeners.
        */
        onContextHide(response: WindowEvents, e: WindowEvent): void;
        /**
        * Called when the context menu is about to open
        * @param {any} e The jQuery event object
        */
        onContext(e: any): void;
        /**
        * When we have chosen a behaviour
        */
        onBehaviourPicked(response: BehaviourPickerEvents, event: BehaviourPickerEvent): void;
        /**
        * Iteratively goes through each container to check if its pointing to this behaviour
        */
        private isCyclicDependency(container, ref);
        /**
        * This will create a canvas node based on the template given
        * @param {BehaviourDefinition} template The definition of the node
        * @param {number} x The x position of where the node shoule be placed
        * @param {number} y The y position of where the node shoule be placed
        * @param {Container} container This is only applicable if we are dropping a node that represents another behaviour container. This last parameter
        * is the actual behaviour container
        * @param {string} name The name of the node
        * @returns {Behaviour}
        */
        createNode(template: BehaviourDefinition, x: number, y: number, container?: Container, name?: string): Behaviour;
        /**
        * Catch the key down events.
        * @param {any} e The jQuery event object
        */
        onKeyDown(e: any): boolean;
        /**
        * When we double click the canvas we show the behaviour picker.
        * @param {any} e The jQuery event object
        */
        onDoubleClick(e: any): void;
        /**
        * This is called to set the selected canvas item.
        * @param {Component} comp The component to select
        */
        selectItem(comp: Component): void;
        /**
        * Called when we click down on the canvas
        * @param {any} e The jQuery event object
        */
        onMouseDown(e: any): void;
        /**
        * Called when we click up on the canvas
        * @param {any} e The jQuery event object
        */
        onMouseUp(e: any): void;
        /**
        * This is called externally when the canvas has been selected. We use this
        * function to remove any animated elements
        */
        onSelected(): void;
        /**
        * Use this function to add a child to this component. This has the same effect of adding some HTML as a child of another piece of HTML.
        * It uses the jQuery append function to achieve this functionality.
        * @param {IComponent} child The child to add. Valid parameters are valid HTML code or other Components.
        * @returns {IComponent} The child as a Component.
        */
        addChild(child: IComponent): IComponent;
        /**
        * Use this function to remove a child from this component. It uses the jQuery detach function to achieve this functionality.
        * @param {IComponent} child The child to remove. Valid parameters are valid Components.
        * @returns {IComponent} The child as a Component.
        */
        removeChild(child: IComponent): IComponent;
        /**
        * Called when an item is moving
        */
        onChildMoving(e: any, ui: any): void;
        /**
        * This function is called when animate is reading in saved data from the server.
        * @param {any} data
        */
        open(data: any): void;
        /**
        * Tokenizes the canvas and all its items into a JSON object that can be serialized into a DB
        * @param {boolean} slim If true, only the core value is exported. If false, additional data is exported so that it can be re-created at a later stage
        * @param {Array<CanvasItem>} items The items
        * @returns {IContainerToken}
        */
        tokenize(slim: boolean, items?: Array<CanvasItem>): IContainerToken;
        /**
        * De-serializes token data and adds them to the canvas
        * @param {boolean} Data
        * @param {Array<CanvasItem>} items The items
        * @returns {IContainerToken}
        */
        deTokenize(data?: IContainerToken, clearItems?: boolean): void;
        /**
        * This function is called to make sure the canvas min width and min height variables are set
        */
        checkDimensions(): void;
        container: Container;
        containerReferences: {
            groups: Array<number>;
            assets: Array<number>;
        };
    }
}
declare module Animate {
    /**
    * The link class are the lines drawn from behavior portals
    */
    class Link extends CanvasItem {
        startPortal: Portal;
        endPortal: Portal;
        delta: number;
        private _startBehaviour;
        private _endBehaviour;
        private _mouseMoveProxy;
        private _mouseUpProxy;
        private _mouseUpAnchorProxy;
        private _prevPortal;
        private _startClientX;
        private _startClientY;
        private _startX;
        private _startY;
        private _curTarget;
        private _canvas;
        private _graphics;
        private _linePoints;
        private _selected;
        private _properties;
        /**
        * @param {Canvas} parent The parent {Canvas} of the link
        */
        constructor(parent: Component);
        /**
        * Tokenizes the data into a JSON.
        * @param {boolean} slim If true, only the core value is exported. If false, additional data is exported so that it can be re-created at a later stage
        * @returns {ILinkItem}
        */
        tokenize(slim?: boolean): ILinkItem;
        /**
        * De-Tokenizes data from a JSON.
        * @param {ILinkItem} data The data to import from
        */
        deTokenize(data: ILinkItem): void;
        /**
        * Called after de-tokenization. This is so that the items can link up to any other items that might have been created in the process.
        * @param {number} originalId The original shallow ID of the item when it was tokenized.
        * @param {LinkMap} items The items loaded from the detokenization process. To get this item you can do the following: items[originalId].item
        * or to get the token you can use items[originalId].token
        */
        link(originalId: number, items: LinkMap): void;
        /**
        * This is called when we need a link to start drawing. This will
        * follow the mouse and draw a link from the original mouse co-ordinates to an
        * end portal.
        * @param {Portal} startPortal
        * @param {any} e
        */
        start(startPortal: Portal, e: any): void;
        /**
        * Check if a point is actually selecting the link
        * @param {any} e
        */
        hitTestPoint(e: any): boolean;
        /**
        * Get or Set if the component is selected. When set to true a css class of 'selected' is added to the {Component}
        */
        /**
        * Get or Set if the component is selected. When set to true a css class of 'selected' is added to the {Component}
        */
        selected: boolean;
        /**
        * Builds the dimensions of link based on the line points
        */
        buildDimensions(): void;
        /**
        * Use this function to build the line points that define the link
        */
        buildLinePoints(e: any): void;
        /**
        * Updates the link points (should they have been moved).
        */
        updatePoints(): void;
        /**
        * When the mouse moves we resize the stage.
        * @param {any} e
        */
        onMouseMove(e: any): void;
        /**
       * Draws a series of lines
       */
        draw(): void;
        /**
        * Remove listeners.
        * @param {any} e
        */
        onMouseUpAnchor(e: any): void;
        /**
        * When the link properties are edited
        */
        onEdit(type: string, event: EditEvent, sender?: EventDispatcher): void;
        /**
        * Gets the properties of this link
        * @returns {EditableSet}
        */
        properties: EditableSet;
        /**
        * Cleanup the link
        */
        dispose(): void;
    }
}
declare module Animate {
    /**
    * This is the implementation of the context menu on the canvas.
    */
    class CanvasContext extends ContextMenu {
        private mCreateInput;
        private mCreateOutput;
        private mCreateParam;
        private mCreateProduct;
        private mEditPortal;
        private mDel;
        private mCreate;
        private mCreateComment;
        private mDelEmpty;
        constructor();
        /**
        * Shows the window by adding it to a parent.
        */
        showContext(x: number, y: number, item: Component): void;
    }
}
declare module Animate {
    /**
    * An implementation of the tree view for the scene.
    */
    class TreeViewScene extends TreeView {
        private static _singleton;
        private _sceneNode;
        private _assetsNode;
        private _groupsNode;
        private _pluginBehaviours;
        private _contextMenu;
        private _contextCopy;
        private _contextDel;
        private _contextAddInstance;
        private _contextSave;
        private _contextRefresh;
        private _contextAddGroup;
        private _quickCopy;
        private _quickAdd;
        private _contextNode;
        private _shortcutProxy;
        constructor(parent?: Component);
        onShortcutClick(e: any): void;
        onMouseMove(e: any): void;
        /**
        * Called when the project is loaded and ready.
        */
        projectReady(project: Project): void;
        /**
        * TODO: This is currently hooked on when a resource is created using the createResource call in project. Ideally this should be called whenever
        * any form of resource is created. I.e. try to get rid of addAssetInstance
        * Called whenever a project resource is created
        */
        onResourceCreated(type: string, event: ProjectEvent<ProjectResource<Engine.IResource>>): void;
        /**
        * Called when the project is reset by either creating a new one or opening an older one.
        */
        projectReset(project: Project): void;
        /**
        * Catch the key down events.
        * @param e The event passed by jQuery
        */
        onKeyDown(e: any): void;
        /**
        * Creates an asset node for the tree
        * @param {Asset} asset The asset to associate with the node
        */
        addAssetInstance(asset: Asset, collapse?: boolean): boolean;
        /**
        * Called when we select a menu item.
        */
        onContextSelect(response: ContextMenuEvents, event: ContextMenuEvent, sender?: EventDispatcher): void;
        /**
        * When we double click the tree
        * @param <object> e The jQuery event object
        */
        onDblClick(e: any): void;
        /**
        * When the database returns from its command.
        * @param {ProjectEvents} response The loader response
        * @param {ProjectEvent} data The data sent from the server
        */
        /** When the rename form is about to proceed. We can cancel it by externally checking
        * if against the data.object and data.name variables.
        */
        onRenameCheck(response: string, event: RenameFormEvent, sender?: EventDispatcher): void;
        /**
        * This function will get a list of asset instances based on their class name.
        * @param {string|Array<string>} classNames The class name of the asset, or an array of class names
        * @returns Array<TreeNodeAssetInstance>
        */
        getAssets(classNames: string | Array<string>): Array<TreeNodeAssetInstance>;
        /**
        * This function will get a list of asset classes.
        * returns {Array<TreeNodeAssetClass>}
        */
        getAssetClasses(): Array<AssetClass>;
        /**
        * Called when the context menu is about to open.
        * @param <jQuery> e The jQuery event object
        */
        onContext(e: any): void;
        /**
        * Selects a node.
        * @param {TreeNode} node The node to select
        * @param {boolean} expandToNode A bool to say if we need to traverse the tree down until we get to the node
        * and expand all parent nodes
        * @param {boolean} multiSelect Do we allow nodes to be multiply selected
        */
        selectNode(node: TreeNode, expandToNode?: boolean, multiSelect?: boolean): void;
        /**
        * Gets the singleton instance.
        * @returns <TreeViewScene> The singleton instance
        */
        static getSingleton(): TreeViewScene;
        /**
        * This will add a node to the treeview to represent the behaviours available to developers
        * @param {BehaviourDefinition} template
        * @returns {TreeNodePluginBehaviour}
        */
        addPluginBehaviour(template: BehaviourDefinition): TreeNodePluginBehaviour;
        /**
        * This will remove a node from the treeview that represents the behaviours available to developers.
        * @param  {string} name The name if the plugin behaviour
        * @returns {TreeNode}
        */
        removePluginBehaviour(name: string, dispose?: boolean): TreeNode;
        sceneNode: TreeNode;
        assetsNode: TreeNode;
        groupsNode: TreeNode;
        pluginBehaviours: TreeNode;
        contextNode: TreeNode;
    }
}
declare module Animate {
    /**
    * This is the base class for all tree node classes
    */
    class TreeNode extends Component implements IRenamable {
        protected mText: string;
        private _expanded;
        private hasExpandButton;
        canDelete: boolean;
        canFocus: boolean;
        canUpdate: boolean;
        canCopy: boolean;
        treeview: TreeView;
        private _modified;
        private _loading;
        private _modifiedStar;
        /**
        * @param {string} text The text to use for this node
        * @param {string} img An optional image to use (image src text)
        * @param {boolean} hasExpandButton A bool to tell the node if it should use the expand button
        */
        constructor(text: any, img?: string, hasExpandButton?: boolean);
        /**
        * Gets if this tree node is in a modified state
        * @returns {boolean}
        */
        /**
        * Sets if this tree node is in a modified state
        * @param {boolean} val
        */
        modified: boolean;
        /**
        * Gets if this tree node is busy with a loading operation
        * @returns {boolean}
        */
        /**
        * Sets if this tree node is busy with a loading operation
        * @param {boolean} val
        */
        loading: boolean;
        /**
        * This will cleanup the component.
        */
        dispose(): void;
        /**
        * Called when the node is selected
        */
        onSelect(): void;
        /**
        * This function will rturn an array of all its child nodes
        * @param {Function} type This is an optional type object. You can pass a function or class and it will only return nodes of that type.
        * @param Array<TreeNode> array This is the array where data will be stored in. This can be left as null and one will be created
        * @returns Array<TreeNode>
        */
        getAllNodes(type: Function, array?: Array<TreeNode>): Array<TreeNode>;
        /**
        * This function will expand this node and show its children.
        */
        expand(): void;
        /**
        * This function will collapse this node and hide its children.
        */
        collapse(): void;
        /**
        * This will recursively look through each of the nodes to find a node with
        * the specified name.
        * @param {string} property The Javascript property on the node that we are evaluating
        * @param {any} value The value of the property we are comparing.
        * @returns {TreeNode}
        */
        findNode(property: string, value: any): TreeNode;
        /**
        * This will clear and dispose of all the nodes
        */
        clear(): void;
        /**
        * Get if the component is selected
        * @returns {boolean} If the component is selected or not.
        */
        /**
        * Set if the component is selected
        * @param {boolean} val Pass a true or false value to select the component.
        */
        selected: boolean;
        /**
        * Gets the text of the node
        * @returns {string} The text of the node
        */
        /**
        * Sets the text of the node
        * @param {string} val The text to set
        */
        text: string;
        /**
        * This will add a node to the treeview
        * @param {TreeNode} node The node to add
        * @param {boolean} collapse True if you want to make this node collapse while adding the new node
        * @returns {TreeNode}
        */
        addNode(node: TreeNode, collapse?: boolean): TreeNode;
        /**
        * The nodes of this treeview.
        * @returns {Array<TreeNode>}
        */
        nodes: Array<TreeNode>;
        /**
        * Gets if this treenode is expanded or not
        * @returns {boolean}
        */
        expanded: boolean;
        /**
        * Use this function to remove a child from this component.
        * It uses the {JQuery} detach function to achieve this functionality.
        * @param {IComponent} child The {IComponent} to remove from this {IComponent}'s children
        * @returns {IComponent} The {IComponent} we have removed
        */
        removeChild(child: IComponent): IComponent;
        /**
        * This removes a node from the treeview
        * @param {TreeNode} node The node to remove
        * @returns {TreeNode}
        */
        removeNode(node: TreeNode): TreeNode;
        name: string;
    }
}
declare module Animate {
    /**
    * This node represents a project resource
    */
    class TreeNodeResource<T extends ProjectResource<Engine.IResource>> extends TreeNode {
        resource: T;
        private _dropProxy;
        constructor(resource: T, text: string, img: string, hasExpand: boolean);
        /**
        * Called whenever the resource is re-downloaded
        */
        protected onRefreshed(type: string, event: Event, sender: EventDispatcher): void;
        /**
        * Called whenever the resource is modified
        */
        protected onDeleted(type: string, event: Event, sender: EventDispatcher): void;
        /**
        * Called whenever the resource is modified
        */
        protected onModified(type: string, event: Event, sender: EventDispatcher): void;
        /**
        * Called when a draggable object is dropped onto the node
        */
        protected onDropped(event: any, ui: any): void;
        /**
        * This will cleanup the component.
        */
        dispose(): void;
    }
}
declare module Animate {
    /**
    * Treenodes are added to the treeview class. This treenode contains a reference to the
    * AssetClass object defined by plugins.
    */
    class TreeNodeAssetClass extends TreeNode {
        assetClass: AssetClass;
        className: string;
        /**
        * @param {AssetClas} assetClass The asset class this node represents
        * @param {TreeView} treeview The treeview to which this is added
        */
        constructor(assetClass: AssetClass, treeview: TreeView);
        /**
        * This will get all TreeNodeAssetInstance nodes of a particular class name
        * @param {string|Array<string>} classNames The class name of the asset, or an array of class names
        * @returns Array<TreeNodeAssetInstance>
        */
        getInstances(classNames: string | Array<string>): Array<TreeNodeAssetInstance>;
        /**
        * This will get all sub TreeNodeAssetClass nodes
        * @returns Array<AssetClass>
        */
        getClasses(): Array<AssetClass>;
        /**
        * This will cleanup the component.
        */
        dispose(): void;
    }
}
declare module Animate {
    /**
    * Treenodes are added to the treeview class. This treenode contains a reference to the
    * AssetClass object defined by plugins.
    */
    class TreeNodeAssetInstance extends TreeNodeResource<Asset> {
        assetClass: AssetClass;
        /**
        * @param {AssetClass} assetClass The name of the asset's template
        * @param {Asset} asset The asset itself
        */
        constructor(assetClass: AssetClass, asset: Asset);
        /**
        * Called when the node is selected
        */
        onSelect(): void;
        /**
        * When we click ok on the portal form
        * @param {string} type
        * @param {EditEvent} data
        */
        onAssetEdited(type: string, data: EditEvent, sender?: EventDispatcher): void;
        /**
        * This will cleanup the component.
        */
        dispose(): void;
    }
}
declare module Animate {
    /**
    *  A tree node class for behaviour container objects.
    */
    class TreeNodeBehaviour extends TreeNodeResource<Container> {
        /**
        * @param {Container} behaviour The container we are associating with this node
        */
        constructor(container: Container);
        /**
        * Called when the node is selected
        */
        onSelect(): void;
        /**
        * Whenever a container property is changed by the editor
        */
        onPropertyGridEdited(type: string, event: EditEvent, sender?: EventDispatcher): void;
        /**
        * This will cleanup the component
        */
        dispose(): void;
    }
}
declare module Animate {
    /**
    * This node represents a group asset. Goups are collections of objects - think of them as arrays.
    */
    class TreeNodeGroup extends TreeNodeResource<GroupArray> {
        constructor(group: GroupArray);
        /**
        * Called whenever the resource is re-downloaded
        */
        protected onRefreshed(type: string, event: Event, sender: EventDispatcher): void;
        /**
        * Called when a draggable object is dropped onto the canvas.
        */
        protected onDropped(event: any, ui: any): void;
    }
}
declare module Animate {
    /**
    * This node represents a group instance. Goups are collections of objects - think of them as arrays.
    */
    class TreeNodeGroupInstance extends TreeNode {
        private _instanceID;
        private _group;
        constructor(instanceID: number, name: string, group: GroupArray);
        /**
        * This will cleanup the component
        */
        dispose(): void;
        shallowId: number;
    }
}
declare module Animate {
    /**
    * This node represents a behaviour created by a plugin.
    */
    class TreeNodePluginBehaviour extends TreeNode {
        private _template;
        constructor(template: BehaviourDefinition);
        /**
        * This will cleanup the component
        */
        dispose(): void;
        template: BehaviourDefinition;
    }
}
declare module Animate {
    /**
    * A Tab pair for the canvas tabs
    */
    class CanvasTabPair extends TabPair {
        private _canvas;
        forceClose: boolean;
        constructor(canvas: Canvas, name: string);
        /**
        * Called whenever the container is refreshed
        */
        onRefreshed(type: string, event: Event, sender: Container): void;
        /**
        * Whenever the container deleted
        */
        onContainerDeleted(type: string, event: Event, sender: EventDispatcher): void;
        /**
        * Whenever the container is modified, we show this with a *
        */
        onContainerModified(type: string, event: Event, sender: EventDispatcher): void;
        /**
        * Cleans up the pair
        */
        dispose(): void;
        /**
        * @returns {Canvas}
        */
        canvas: Canvas;
    }
}
declare module Animate {
    /**
    * A tab pair that uses the ace editor
    */
    abstract class EditorPair extends TabPair {
        private _originalName;
        private _proxyChange;
        private _proxyMessageBox;
        protected _close: boolean;
        private _editor;
        private _loadingGif;
        /**
        * @param {string} name The name of the tab
        */
        constructor(name: string);
        /**
        * When we acknowledge the message box.
        * @param {string} val
        */
        onMessage(val: string): void;
        /**
        * Sets if this tab pair is busy loading
        * @param {boolean} val
        */
        protected loading(val: boolean): void;
        /**
        * Called when the editor changes
        * @param {any} e
        */
        onChange(e: any): void;
        /**
        * Called by the tab class when the pair is to be removed.
        * @param {TabEvent} event An object that can be used to cancel the operation. Simply call data.cancel = true to cancel the closure.
        */
        onRemove(event: TabEvent): void;
        /**
        * Called when the tab is resized
        */
        onResize(): void;
        /**
        * Saves the content of the editor
        */
        abstract save(): any;
        /**
        * Gets the script content once added to the stage
        */
        abstract initialize(): {
            content: string;
            contentType: string;
        };
        /**
        * Called when the pair has been added to the tab. The ace editor is added and initialized
        */
        onAdded(): void;
        /**
        * Gets the ace editor
        * @returns {AceAjax.Editor}
        */
        editor: AceAjax.Editor;
    }
}
declare module Animate {
    /**
    * A tab pair that manages the build HTML
    */
    class HTMLTab extends EditorPair {
        static singleton: HTMLTab;
        /**
        * @param {string} name The name of the tab
        */
        constructor(name: string);
        /**
        * Called when the editor needs to save its content
        */
        save(): void;
        /**
         * Gets the script initial values
         */
        initialize(): {
            content: string;
            contentType: string;
        };
        /**
        * Called when the pair has been added to the tab. The ace editor is added and initialized
        */
        onAdded(): void;
        /**
        * Called by the tab class when the pair is to be removed.
        * @param {TabEvent} event An object that can be used to cancel the operation. Simply call data.cancel = true to cancel the closure.
        */
        onRemove(event: TabEvent): void;
    }
}
declare module Animate {
    /**
    * A tab pair that manages the build CSS
    */
    class CSSTab extends EditorPair {
        static singleton: CSSTab;
        /**
        * @param {string} name The name of the tab
        */
        constructor(name: string);
        /**
        * Called when the editor needs to save its content
        */
        save(): void;
        /**
        * Gets the script initial values
        */
        initialize(): {
            content: string;
            contentType: string;
        };
        /**
        * Called when the pair has been added to the tab. The ace editor is added and initialized
        */
        onAdded(): void;
        /**
        * Called by the tab class when the pair is to be removed.
        * @param {TabEvent} event An object that can be used to cancel the operation. Simply call data.cancel = true to cancel the closure.
        */
        onRemove(event: TabEvent): void;
    }
}
declare module Animate {
    /**
    * A tab pair that creates a javascript node
    */
    class ScriptTab extends TabPair {
        static singleton: HTMLTab;
        private originalName;
        private proxyFunctionClick;
        private scriptNode;
        saved: boolean;
        private close;
        private userDefinedChange;
        private _editor;
        private curFunction;
        private scripts;
        private right;
        private _editorComponent;
        private onEnter;
        private onFrame;
        private onInitialize;
        private onDispose;
        constructor(scriptNode: BehaviourScript);
        /**
        * When we click on one of the function buttons
        * @param <object> e
        */
        OnFunctionClick(e: any): void;
        /**
        * Called when the editor is resized
        */
        onResize(): void;
        /**
        * When we rename the script, we need to update the text
        */
        rename(newName: string): void;
        /**
        * Called when the pair has been added to the tab
        */
        onAdded(): void;
        /**
        * When the server responds after a save.
        * @param <object> event
        * @param <object> data
        */
        onServer(response: ProjectEvents, event: ProjectEvent<ProjectResource<Engine.IResource>>): void;
        /**
        * Called when the save all button is clicked
        */
        onSaveAll(): void;
        /**
        * Called when the pair has been selected
        */
        onSelected(): void;
        /**
        * Called by the tab class when the pair is to be removed.
        * @param <object> data An object that can be used to cancel the operation. Simply call data.cancel = true to cancel the closure.
        */
        onRemove(data: any): void;
        /**
        * Call this function to save the script to the database
        * @returns <object>
        */
        save(): void;
    }
}
declare module Animate {
    /**
    * This is an implementation of the tab class
    */
    class SceneTab extends Tab {
        private static _singleton;
        private mDocker;
        assetPanel: Component;
        /**
        * @param {Component} parent The parent of the button
        */
        constructor(parent: Component);
        /**This is called by a controlling ScreenManager class. An image string needs to be returned
        * which will act as a preview of the component that is being viewed or hidden.*/
        getPreviewImage(): string;
        getDocker(): Docker;
        setDocker(val: any): void;
        onShow(): void;
        onHide(): void;
        /** Gets the singleton instance. */
        static getSingleton(parent?: Component): SceneTab;
    }
}
declare module Animate {
    class CanvasTabType extends ENUM {
        constructor(v: string);
        static CANVAS: CanvasTabType;
        static HTML: CanvasTabType;
        static CSS: CanvasTabType;
        static SCRIPT: CanvasTabType;
        static BLANK: CanvasTabType;
    }
    /**
    * This is an implementation of the tab class that deals with the canvas
    */
    class CanvasTab extends Tab {
        private static _singleton;
        private _currentCanvas;
        private welcomeTab;
        private closingTabPair;
        private mDocker;
        constructor(parent: Component);
        /**
        * This is called by a controlling ScreenManager class. An image string needs to be returned
        * which will act as a preview of the component that is being viewed or hidden.
        * @return {string}
        */
        getPreviewImage(): string;
        /**
        * Each IDock item needs to implement this so that we can keep track of where it moves.
        * @returns {Docker}
        */
        getDocker(): Docker;
        /**
        * Each IDock item needs to implement this so that we can keep track of where it moves.
        * @param {Docker} val
        */
        setDocker(val: Docker): void;
        /**
        * This is called by a controlling Docker class when the component needs to be shown.
        */
        onShow(): void;
        /**
        * Called when sall all is returned from the DB
        */
        saveAll(): void;
        /**
        * This is called by a controlling Docker class when the component needs to be hidden.
        */
        onHide(): void;
        /**
        * Called just before a tab is closed. If you return false it will cancel the operation.
        * @param {TabPair} tabPair An object that contains both the page and label of the tab
        * @returns {boolean} Returns false if the tab needs to be saved. Otherwise true.
        */
        onTabPairClosing(tabPair: TabPair): boolean;
        /**
        * After being asked if we want to save changes to a container
        * @param {string} choice The choice of the message box. It can be either Yes or No
        */
        onMessage(choice: string): void;
        /**
        * We use this function to remove any assets from the tabs
        * @param {Asset} asset The asset we are removing
        */
        removeAsset(asset: Asset): void;
        /**
        * You can use this function to fetch a tab's canvas by a behaviour local ID
        * @param {number} behaviourID The local id of the container
        * @returns {Canvas} The returned tab's canvas or null
        */
        getTabCanvas(behaviourID: string): Canvas;
        /**
        * When we click the tab
        * @param {TabPair} tab The tab pair object which contains both the label and page components
        */
        onTabSelected(tab: TabPair): void;
        /**
        * When we start a new project we load the welcome page.
        * @param {Project} project
        */
        projectReady(project: Project): void;
        /**
        * Called when the project is reset by either creating a new one or opening an older one.
        */
        projectReset(): void;
        /**
        * When the news has been loaded from webinate.
        */
        onNewsLoaded(response: LoaderEvents, event: AnimateLoaderEvent, sender?: EventDispatcher): void;
        /**
        * Gets the singleton instance.
        * @param {Component} parent The parent component of this tab
        * @returns {CanvasTab}
        */
        static getSingleton(parent?: Component): CanvasTab;
        /**
        * Renames a tab and its container
        * @param {string} oldName The old name of the tab
        * @param {string} newName The new name of the tab
        * @returns {TabPair} Returns the tab pair
        */
        renameTab(oldName: string, newName: string): TabPair;
        /**
        * Removes an item from the tab
        * @param val The label text of the tab
        * @param {boolean} dispose Set this to true to clean up the tab
        * @returns {TabPair} The tab pair containing both the label and page <Component>s
        */
        removeTab(val: string, dispose: boolean): TabPair;
        removeTab(val: TabPair, dispose: boolean): TabPair;
        /**
        * When a canvas is modified we change the tab name, canvas name and un-save its tree node.
        */
        onCanvasModified(response: CanvasEvents, event: CanvasEvent, sender?: EventDispatcher): void;
        /**
        * Adds an item to the tab
        * @param {string} text The text of the new tab
        * @param {CanvasTabType} type The type of tab to create
        * @param {any} tabContent Data associated with the tab
        * @returns {TabPair} The tab pair object
        */
        addSpecialTab(text: string, type?: CanvasTabType, tabContent?: any): TabPair;
        currentCanvas: Canvas;
    }
}
declare module Animate {
    /**
    * This small class is used to group property grid elements together
    */
    class PropertyGridGroup extends Component {
        name: string;
        content: JQuery;
        constructor(name: string);
        /**
        * This function is used to clean up the PropertyGridGroup
        */
        dispose(): void;
    }
}
declare module Animate {
    /**
    * A property editor which edits objects and strings
    */
    class PGTextbox extends PropertyGridEditor {
        constructor(grid: PropertyGrid);
        /**
        * Checks a property to see if it can edit it
        * @param {Prop<any>} prop The property being edited
        * @returns {boolean}
        */
        canEdit(prop: Prop<any>): boolean;
        /**
        * Given a property, the grid editor must produce HTML that can be used to edit the property
        * @param {Prop<any>} prop The property being edited
        * @param {Component} container The container acting as this editors parent
        */
        edit(prop: Prop<any>, container: Component): void;
    }
}
declare module Animate {
    /**
    * A property editor which edits numbers
    */
    class PGNumber extends PropertyGridEditor {
        constructor(grid: PropertyGrid);
        /**
        * Checks a property to see if it can edit it
        * @param {Prop<any>} prop The property being edited
        * @returns {boolean}
        */
        canEdit(prop: Prop<any>): boolean;
        /**
        * Given a property, the grid editor must produce HTML that can be used to edit the property
        * @param {Prop<any>} prop The property being edited
        * @param {Component} container The container acting as this editors parent
        */
        edit(prop: Prop<any>, container: Component): void;
    }
}
declare module Animate {
    /**
    * This represents a combo property for booleans that the user can select from a list.
    */
    class PGComboBool extends PropertyGridEditor {
        constructor(grid: PropertyGrid);
        /**
        * Checks a property to see if it can edit it
        * @param {Prop<any>} prop The property being edited
        * @returns {boolean}
        */
        canEdit(prop: Prop<any>): boolean;
        /**
        * Given a property, the grid editor must produce HTML that can be used to edit the property
        * @param {Prop<any>} prop The property being edited
        * @param {Component} container The container acting as this editors parent
        */
        edit(prop: Prop<any>, container: Component): JQuery;
    }
}
declare module Animate {
    /**
    * This represents a combo property for enums that the user can select from a list.
    */
    class PGComboEnum extends PropertyGridEditor {
        constructor(grid: PropertyGrid);
        /**
        * Checks a property to see if it can edit it
        * @param {Prop<any>} prop The property being edited
        * @returns {boolean}
        */
        canEdit(prop: Prop<any>): boolean;
        /**
        * Given a property, the grid editor must produce HTML that can be used to edit the property
        * @param {Prop<any>} prop The property being edited
        * @param {Component} container The container acting as this editors parent
        */
        edit(prop: Prop<any>, container: Component): void;
    }
}
declare module Animate {
    /**
    * An editor which allows a user to select files on the local server.
    */
    class PGFile extends PropertyGridEditor {
        constructor(grid: PropertyGrid);
        /**
        * Checks a property to see if it can edit it
        * @param {Prop<any>} prop The property being edited
        * @returns {boolean}
        */
        canEdit(prop: Prop<any>): boolean;
        /**
        * Given a property, the grid editor must produce HTML that can be used to edit the property
        * @param {Prop<any>} prop The property being edited
        * @param {Component} container The container acting as this editors parent
        */
        edit(prop: Prop<any>, container: Component): void;
    }
}
declare module Animate {
    /**
    * This represents a combo property for assets that the user can select from a list.
    */
    class PGComboGroup extends PropertyGridEditor {
        constructor(grid: PropertyGrid);
        /**
        * Checks a property to see if it can edit it
        * @param {Prop<any>} prop The property being edited
        * @returns {boolean}
        */
        canEdit(prop: Prop<any>): boolean;
        /**
        * Given a property, the grid editor must produce HTML that can be used to edit the property
        * @param {Prop<any>} prop The property being edited
        * @param {Component} container The container acting as this editors parent
        */
        edit(prop: Prop<any>, container: Component): void;
    }
}
declare module Animate {
    /**
    * This represents a combo property for assets that the user can select from a list.
    */
    class PGComboAsset extends PropertyGridEditor {
        constructor(grid: PropertyGrid);
        /**
        * Checks a property to see if it can edit it
        * @param {Prop<any>} prop The property being edited
        * @returns {boolean}
        */
        canEdit(prop: Prop<any>): boolean;
        /**
        * Given a property, the grid editor must produce HTML that can be used to edit the property
        * @param {Prop<any>} prop The property being edited
        * @param {Component} container The container acting as this editors parent
        */
        edit(prop: Prop<any>, container: Component): void;
    }
}
declare module Animate {
    /**
    * This represents a property for choosing a list of assets
    */
    class PGAssetList extends PropertyGridEditor {
        constructor(grid: PropertyGrid);
        /**
        * Checks a property to see if it can edit it
        * @param {Prop<any>} prop The property being edited
        * @returns {boolean}
        */
        canEdit(prop: Prop<any>): boolean;
        /**
        * Given a property, the grid editor must produce HTML that can be used to edit the property
        * @param {Prop<any>} prop The property being edited
        * @param {Component} container The container acting as this editors parent
        */
        edit(prop: Prop<any>, container: Component): void;
    }
}
declare module Animate {
    /**
    * This editor is used to pick colours from a colour dialogue.
    */
    class PGColorPicker extends PropertyGridEditor {
        constructor(grid: PropertyGrid);
        /**
        * Checks a property to see if it can edit it
        * @param {Prop<any>} prop The property being edited
        * @returns {boolean}
        */
        canEdit(prop: Prop<any>): boolean;
        /**
        * Given a property, the grid editor must produce HTML that can be used to edit the property
        * @param {Prop<any>} prop The property being edited
        * @param {Component} container The container acting as this editors parent
        */
        edit(prop: Prop<any>, container: Component): void;
    }
}
declare module Animate {
    /**
    * A Component that you can use to edit objects. The Property grid will fill itself with Components you can use to edit a given object.
    * Each time the object is modified a <PropertyGrid.PROPERTY_EDITED> events are sent to listeners.
    */
    class PropertyGrid extends Component implements IDockItem {
        private static _singleton;
        private _header;
        private _editors;
        private _docker;
        private _groups;
        private _object;
        constructor(parent: Component);
        /**
        * This is called by a controlling ScreenManager class. An image string needs to be returned
        * which will act as a preview of the component that is being viewed or hidden.
        * @returns <string> The image url
        */
        getPreviewImage(): string;
        /**
        * Each IDock item needs to implement this so that we can keep track of where it moves.
        */
        getDocker(): Docker;
        /**
        * Each IDock item needs to implement this so that we can keep track of where it moves.
        * @param <object> val
        */
        setDocker(val: Docker): void;
        /**
        * This is called by a controlling Docker class when the component needs to be shown.
        */
        onShow(): void;
        /**
        * This is called by a controlling Docker class when the component needs to be hidden.
        */
        onHide(): void;
        /**
        * Cleans up the groups and editors
        */
        cleanup(): void;
        /**
        * Sets the object we are going to edit.
        * @param {EditableSet} object The object we are editing. You should ideally create a new object {}, and then
        * use the function pGridEditble to create valid property grid variables.
        * @param {string} name The name of the object we are editing
        * @param {string} img An optional image string
        * @returns {any} Returns the object we are currently editing
        */
        editableObject(object: EditableSet, name: string, img?: string): EditableSet;
        /**
        * called when we reset the project
        * @returns <object>
        */
        projectReset(): void;
        /**
        * Add a new editor to the property grid.
        * @param {PropertyGridEditor} editor The PropertyGridEditor object to add
        * @returns {PropertyGridEditor}
        */
        addEditor(editor: PropertyGridEditor): PropertyGridEditor;
        /**
        * Removes an editor from the property grid.
        * @param {PropertyGridEditor} editor The PropertyGridEditor object to remove.
        * @returns {PropertyGridEditor} The editor or null
        */
        removeEditor(editor: PropertyGridEditor): PropertyGridEditor;
        /**
        * This will cleanup the component.
        */
        dispose(): void;
        /**
        * Gets the singleton instance.
        * @returns <PropertyGrid>
        */
        static getSingleton(parent?: Component): PropertyGrid;
        currentObject: any;
    }
}
declare module Animate {
    /** A very simple class to represent tool bar buttons */
    class ToolBarButton extends Component {
        private _radioMode;
        private _pushButton;
        private _proxyDown;
        constructor(text: string, image: string, pushButton?: boolean, parent?: Component);
        /** Cleans up the button */
        dispose(): void;
        onClick(e: any): void;
        /**
        * Get if the component is selected. When set to true a css class of 'selected' is added to the {Component}
        */
        /**
        * Set if the component is selected. When set to true a css class of 'selected' is added to the {Component}
        */
        selected: boolean;
        /**
        * If true, the button will act like a radio button. It will deselect any other ToolBarButtons in its parent when its selected.
        */
        radioMode: boolean;
    }
}
declare module Animate {
    class ToolbarNumberEvents extends ENUM {
        constructor(v: string);
        static CHANGED: ToolbarNumberEvents;
    }
    /**
    *  A toolbar button for numbers
    */
    class ToolbarNumber extends Component {
        private static input;
        private static numInstances;
        private defaultVal;
        private minValue;
        private maxValue;
        private delta;
        private startPos;
        private label;
        private leftArrow;
        private rightArrow;
        private stageUpPoxy;
        private stageMovePoxy;
        private downProxy;
        private clickProxy;
        private wheelProxy;
        private keyProxy;
        /**
        * @param {Component} parent The parent of this toolbar
        */
        constructor(parent: Component, text: string, defaultVal: number, minValue: number, maxValue: number, delta?: number);
        /**
        * Called when the mouse is down on the DOM
        * @param <object> e The jQuery event
        */
        onStageUp(e: any): void;
        /**
        * Called when we move on the stage
        * @param <object> e The jQuery event
        */
        onStageMove(e: any): void;
        /**
        * Set or get the value
        * @param {number} val The value we are setting
        */
        /**
        * Set or get the value
        * @param {number} val The value we are setting
        */
        value: number;
        onWheel(event: any, delta: any, deltaX: any, deltaY: any): void;
        onKeyDown(e: any): void;
        onDown(e: any): void;
        onClick(e: any): void;
        /**
        * Cleans up the component
        */
        dispose(): void;
    }
}
declare module Animate {
    /**
    *  Use this tool bar button to pick a colour.
    */
    class ToolbarColorPicker extends Component {
        private numberInput;
        private picker;
        constructor(parent: Component, text: string, color: string);
        /**
        * Gets or sets the colour of the toolbar button
        */
        /**
        * Gets or sets the colour of the toolbar button
        */
        color: number;
        /**
        * Disposes of and cleans up this button
        */
        dispose(): void;
    }
}
declare module Animate {
    /**
    * The interface for all layout objects.
    */
    class ToolbarItem extends Component {
        text: String;
        img: String;
        /**
        * @param {string} img The image path.
        * @param {string} text The text to use in the item.
        */
        constructor(img: string, text: string, parent?: Component);
    }
    /**
    *  A toolbar button for selection a list of options
    */
    class ToolbarDropDown extends Component {
        items: Array<ToolbarItem>;
        private _popupContainer;
        private _selectedItem;
        private _clickProxy;
        private _stageDownProxy;
        /**
        * @param {Component} parent The parent of this toolbar
        * @param {Array<ToolbarItem>} items An array of items to list e.g. [{img:"./img1.png", text:"option 1"}, {img:"./img2.png", text:"option 2"}]
        */
        constructor(parent: Component, items: Array<ToolbarItem>);
        /**
        * Adds an item the drop down. The item must be an object with both img and text vars. eg: { img:"", text:"" }
        * @param {ToolbarItem} item The item to add.
        * @returns {Component}
        */
        addItem(item: ToolbarItem): IComponent;
        /**
        * Adds an item the drop down. The item must be an object with both img and text vars. eg: { img:"", text:"" }
        * @param {any} val This can be either the item object itself, its text or its component.
        * @param {boolean} dispose Set this to true if you want delete the item
        * @returns {Component} Returns the removed item component or null
        */
        removeItem(val: any, dispose?: boolean): any;
        /**
        * Clears all the items
        * @param {boolean} dispose Set this to true if you want to delete all the items from memory
        */
        clear(dispose?: boolean): void;
        /**
        * Gets the selected item
        * @returns {ToolbarItem}
        */
        /**
        * Sets the selected item
        * @param {any} item
        */
        selectedItem: ToolbarItem;
        /**
        * Called when the mouse is down on the DOM
        * @param {any} e The jQuery event
        */
        onStageUp(e: any): void;
        /**
        * When we click the main button
        * @param {any} e The jQuery event oject
        */
        onClick(e: any): void;
        /**
        * Cleans up the component
        */
        dispose(): void;
    }
}
declare module Animate {
    class OkCancelFormEvents extends ENUM {
        constructor(v: string);
        static CONFIRM: OkCancelFormEvents;
    }
    /**
    * A simple form which holds a heading, content and OK / Cancel buttons.
    */
    class OkCancelForm extends Window {
        okCancelContent: Component;
        private mButtonContainer;
        private mOk;
        private mCancel;
        private keyProxy;
        /**
        * @param {number} width The width of the form
        * @param {number} height The height of the form
        * @param {boolean} autoCenter Should this window center itself on a resize event
        * @param {boolean} controlBox Does this window have a draggable title bar and close button
        * @param {string} title The text for window heading. Only applicable if we are using a control box.
        */
        constructor(width?: number, height?: number, autoCenter?: boolean, controlBox?: boolean, title?: string, hideCancel?: boolean);
        /**
        * When we click on the close button
        * @param {any} e The jQuery event object
        */
        onCloseClicked(e: any): void;
        /**
        * Called when we click one of the buttons. This will dispatch the event OkCancelForm.CONFIRM
        * and pass the text either for the ok or cancel buttons.
        * @param {any} e The jQuery event
        */
        OnButtonClick(e: any): void;
        /**
        * Hides the window
        */
        hide(): void;
        /**
        * This function is used to cleanup the object before its removed from memory.
        */
        dispose(): void;
        /**
        * Shows the window by adding it to a parent.
        * @param {Component} parent The parent Component we are adding this window to
        * @param {number} x The x coordinate of the window
        * @param {number} y The y coordinate of the window
        * @param {boolean} isModal Does this window block all other user operations?
        * @param {boolean} isPopup If the window is popup it will close whenever anything outside the window is clicked
        */
        show(parent?: Component, x?: number, y?: number, isModal?: boolean, isPopup?: boolean): void;
        /**
        * Catch the key down events.
        * @param {any} e The jQuery event object
        */
        onKeyDown(e: any): void;
    }
}
declare module Animate {
    /**
    * Use this form to set the project meta and update build versions.
    */
    class BuildOptionsForm extends Window {
        static _singleton: BuildOptionsForm;
        private _projectElm;
        private _buildElm;
        private _userElm;
        private $user;
        private $project;
        private $projectToken;
        private $errorMsg;
        private $errorMsgImg;
        private $loading;
        private $loadingPercent;
        private _tab;
        private _buildVerMaj;
        private _buildVerMid;
        private _buildVerMin;
        private _visibility;
        private _notes;
        private _selectBuild;
        private _saveBuild;
        private _buildProxy;
        private _settingPages;
        constructor();
        /**
        * Opens the file viewer and lets the user pick an image for their avatar
        */
        pickAvatar(): void;
        /**
        * Opens the file viewer and lets the user pick an image for their project
        */
        pickProjectPick(): void;
        /**
        * Attempts to update the project
        */
        updateDetails(token: Engine.IPlugin): void;
        /**
        * Given a form element, we look at if it has an error and based on the expression. If there is we set the error message
        * @param {EngineForm} The form to check.
        * @param {boolean} True if there is an error
        */
        reportError(form: NodeForm): boolean;
        /**
        * Updates the user bio information
        * @param {string} bio The new bio data
        */
        updateBio(bio: string): void;
        /**
        * Called when we click on the settings tab
        * @param {any} event
        * @param {any} data
        */
        onTab(response: TabEvents, event: TabEvent, sender?: EventDispatcher): void;
        /**
        * Use this function to add a new settings page to the settings menu
        * @param {ISettingsPage} component The ISettingsPage component we're adding
        */
        addSettingPage(component: ISettingsPage): void;
        /**
        * When we recieve the server call for saving project data.
        * @param {UserEvents} event
        * @param {UserEvent} data
        */
        /**
        * Shows the build options form
        * @returns {any}
        */
        show(): void;
        /**
        * Use this function to print a message on the settings screen.
        * @param {string} message The message to print
        * @param <bool> isError Should this be styled to an error or not
        */
        /**
        * Gets the singleton instance.
        * @returns {BuildOptionsForm}
        */
        static getSingleton(): BuildOptionsForm;
    }
}
declare module Animate {
    /**
    * This form is used to load and select assets.
    */
    class FileViewer extends Window {
        private static _singleton;
        private _browserElm;
        private _searchType;
        private _shiftkey;
        private _cancelled;
        private $pager;
        private $selectedFile;
        private $loading;
        private $errorMsg;
        private $search;
        private $entries;
        private $folders;
        private $confirmDelete;
        private $newFolder;
        private $editMode;
        private $fileToken;
        private $uploader;
        private $onlyFavourites;
        extensions: Array<string>;
        selectedEntities: Array<UsersInterface.IFileEntry>;
        selectedEntity: Engine.IFile;
        selectedFolder: string;
        multiSelect: boolean;
        /**
        * Creates an instance of the file uploader form
        */
        constructor();
        /**
        * Returns a URL of a file preview image
        * @returns {string}
        */
        getThumbnail(file: Engine.IFile): string;
        /**
        * Specifies the type of file search
        */
        selectMode(type: FileSearchType): void;
        /**
        * Attempts to open a folder
        */
        openFolder(folder: string): void;
        /**
        * Creates a new folder
        */
        newFolder(): Element;
        /**
        * Shows / Hides the delete buttons
        */
        confirmDelete(): void;
        /**
        * Called in the HTML once a file is clicked and we need to get a preview of it
        * @param {IFile} file The file to preview
        */
        getPreview(file: Engine.IFile): void;
        /**
        * Sets the selected status of a file or folder
        */
        selectEntity(entity: any): void;
        /**
        * Removes the window and modal from the DOM.
        */
        hide(): void;
        /**
        * Called whenever we select a file
        */
        fileChosen(file: Engine.IFile): void;
        /**
        * Removes the selected entities
        */
        removeEntities(): void;
        updateContent(index: number, limit: number): void;
        /**
        * Called when we are dragging over the item
        */
        onDragOver(e: any): void;
        /**
        * Called when we are no longer dragging items.
        */
        onDragLeave(e: any): void;
        /**
        * Checks if a file list has approved extensions
        * @return {boolean}
        */
        checkIfAllowed(files: FileList): boolean;
        /**
        * Makes sure we only view the file types specified in the exension array
        */
        filterByExtensions(): Array<Engine.IFile>;
        /**
        * Called when we are no longer dragging items.
        */
        onDrop(e: JQueryEventObject): boolean;
        /**
        * Attempts to upload an image or canvas to the users asset directory and set the upload as a file's preview
        * @param {Engine.IFile} file The target file we are setting the preview for
        * @param {HTMLCanvasElement | HTMLImageElement} preview The image we are using as a preview
        */
        uploadPreview(file: Engine.IFile, preview: HTMLCanvasElement | HTMLImageElement): void;
        /**
        * Shows the window by adding it to a parent.
        * @param {Component} parent The parent Component we are adding this window to
        * @param {number} x The x coordinate of the window
        * @param {number} y The y coordinate of the window
        * @param {boolean} isModal Does this window block all other user operations?
        * @param {boolean} isPopup If the window is popup it will close whenever anything outside the window is clicked
        */
        show(parent?: Component, x?: number, y?: number, isModal?: boolean, isPopup?: boolean): void;
        /**
        * Use this function to show the file viewer and listen for when the user has selected a file
        */
        choose(extensions: string | Array<string>): JQueryPromise<Engine.IFile>;
        /**
        * Attempts to update the selected file
        * @param {IFile} token The file token to update with
        */
        updateFile(token: Engine.IFile): void;
        /**
        * Gets the singleton instance.
        * @returns {FileViewer}
        */
        static get: FileViewer;
    }
}
declare module Animate {
    /**
    * A window to show a blocking window with a message to the user.
    */
    class MessageBox extends Window {
        private static _singleton;
        private $message;
        private $buttons;
        private _handle;
        private _callback;
        private _context;
        constructor();
        /**
        * Hide the window when ok is clicked.
        * @param {any} e The jQuery event object
        */
        onButtonClick(e: MouseEvent, button: string): void;
        /**
        * When the window resizes we make sure the component is centered
        * @param {any} e The jQuery event object
        */
        onResize(e: any): void;
        /**
        * Static function to show the message box
        * @param {string} caption The caption of the window
        * @param {Array<string>} buttons An array of strings which act as the forms buttons
        * @param { ( text : string ) => void} callback A function to call when a button is clicked
        * @param {any} context The function context (ie the caller object)
        */
        static show(caption: string, buttons?: Array<string>, callback?: (text: string) => void, context?: any): void;
        /**
        * Gets the message box singleton
        * @returns {MessageBox}
        */
        static getSingleton(): MessageBox;
    }
}
declare module Animate {
    /**
    * This form is used to create or edit Portals.
    */
    class PortalForm extends Window {
        private static _singleton;
        private _typeCombo;
        private _assetClassCombo;
        private _portalType;
        private _value;
        private _fromOk;
        private _newProperty;
        private _formElm;
        private _nameVerifier;
        private $name;
        private $class;
        private $errorMsg;
        constructor();
        /**
        * Generates all the available classes to select for asset property types
        */
        generateClasses(): void;
        /**
        * When the type combo is selected
        */
        onTypeSelect(responce: ListEvents, event: ListEvent): void;
        /**
        * Creates a new property from the data chosen
        * @param {Prop<any>}
        */
        getProperty(): Prop<any>;
        /**
        * Shows the window by adding it to a parent.
        * @param {Component} item The item we are editing
        * @param {PortalType} type The items current portal type
        * @param {string} caption The caption of the form
        */
        editPortal(property: Prop<any>, type: PortalType, nameVerifier: (name: string) => boolean): Promise<{
            prop: Prop<any>;
            cancel: boolean;
        }>;
        /**
        * Hides the window from view
        */
        hide(): void;
        /**
        * Called when we click one of the buttons. This will dispatch the event OkCancelForm.CONFIRM
        * and pass the text either for the ok or cancel buttons.
        */
        ok(): Element;
        name: string;
        portalType: PortalType;
        value: any;
        parameterType: PropertyType;
        /**
        * Gets the singleton instance.
        * @returns {PortalForm}
        */
        static getSingleton(): PortalForm;
    }
}
declare module Animate {
    interface IRenameToken {
        newName: string;
        oldName: string;
        object: IRenamable;
        cancelled: boolean;
    }
    interface IRenamable {
        name?: string;
    }
    /**
    * This form is used to rename objects
    */
    class RenameForm extends Window {
        private static _singleton;
        private object;
        $errorMsg: string;
        private $loading;
        private $name;
        private _projectElm;
        private _resourceId;
        private _type;
        private _fromOk;
        constructor();
        /**
        * Hides the window from view
        */
        hide(): void;
        /**
         * Shows the window by adding it to a parent.
         * @param {Component} parent The parent Component we are adding this window to
         * @param {number} x The x coordinate of the window
         * @param {number} y The y coordinate of the window
         * @param {boolean} isModal Does this window block all other user operations?
         * @param {boolean} isPopup If the window is popup it will close whenever anything outside the window is clicked
         */
        show(parent?: Component, x?: number, y?: number, isModal?: boolean, isPopup?: boolean): void;
        /**
        * Attempts to rename an object
        * @param {IRenamable} object
        * @extends {RenameForm}
        */
        renameObject(object: IRenamable, id: string, type: ResourceType): Promise<IRenameToken>;
        /**
        * @type public mfunc OnButtonClick
        * Called when we click one of the buttons. This will dispatch the event OkCancelForm.CONFIRM
        * and pass the text either for the ok or cancel buttons.
        * @param {any} e
        * @extends {RenameForm}
        */
        ok(): any;
        /**
        * Gets the singleton instance.
        * @returns {RenameForm}
        */
        static get: RenameForm;
    }
}
declare module Animate {
    class UserPrivilegesForm extends Window {
        private static _singleton;
        private mSave;
        private search;
        private mMenu;
        private keyDownProxy;
        private buttonProxy;
        constructor();
        /**
        * This function is called whenever we get a resonse from the server
        */
        onServer(response: LoaderEvents, event: AnimateLoaderEvent, sender?: EventDispatcher): void;
        /**
        * Gets the viewer to search using the terms in the search inut
        */
        searchItems(): void;
        /**
        * When we click a button on the form
        * @param {any} e The jQuery event object
        */
        onButtonClick(e: any): void;
        /**
        * When we hit a key on the search box
        * @param {any} e The jQuery event
        */
        onInputKey(e: any): void;
        /**
        * Shows the window by adding it to a Application route.
        */
        show(): void;
        /**
        * Gets the singleton reference of this class.
        * @returns {UserPrivilegesForm}
        */
        static getSingleton(): UserPrivilegesForm;
    }
}
declare module Animate {
    class BehaviourPickerEvents extends ENUM {
        constructor(v: string);
        static BEHAVIOUR_PICKED: BehaviourPickerEvents;
    }
    class BehaviourPicker extends Window {
        private static _singleton;
        private _input;
        private _list;
        private _X;
        private _Y;
        constructor();
        /**
        * Shows the window by adding it to a parent.
        * @param {Component} parent The parent Component we are adding this window to
        * @param {number} x The x coordinate of the window
        * @param {number} y The y coordinate of the window
        * @param {boolean} isModal Does this window block all other user operations?
        * @param {boolean} isPopup If the window is popup it will close whenever anything outside the window is clicked
        */
        show(parent?: Component, x?: number, y?: number, isModal?: boolean, isPopup?: boolean): void;
        /**
        * Called when we click the list.
        * @param {any} e
        * @returns {any}
        */
        onListClick(e: any): void;
        /**
        * Called when we double click the list.
        * @param {any} e
        * @returns {any}
        */
        onListDClick(e: any): void;
        /**
        * When the input text changes we go through each list item
        * and select it.
        * @param {any} e
        * @returns {any}
        */
        onKeyDown(e: any): void;
        /**
        * Gets the singleton instance.
        * @returns {BehaviourPicker}
        */
        static getSingleton(): BehaviourPicker;
        list: List;
    }
}
declare module Animate {
    /**
    * The main toolbar that sits at the top of the application
    */
    class Toolbar extends Component {
        private static _singleton;
        private _mainElm;
        private $itemSelected;
        private _topMenu;
        private _bottomMenu;
        private _tabHomeContainer;
        private _currentContainer;
        private _currentTab;
        private _copyPasteToken;
        constructor(parent?: Component);
        /**
        * This is called when an item on the canvas has been selected
        * @param {Component} item
        */
        itemSelected(item: Component): void;
        /**
        * This is called when we have loaded and initialized a new project.
        */
        newProject(project: Project): void;
        /**
        * Called when we click one of the top toolbar tabs.
        * @param {any} e
        */
        onMajorTab(e: any): void;
        /**
        * Opens the splash window
        */
        onHome(): void;
        /**
        * Opens the user privileges window
        */
        onShowPrivileges(): void;
        /**
        * Notifys the app that its about to launch a test run
        */
        onRun(): void;
        /**
        * When we click the paste button
        */
        onPaste(): void;
        /**
        * When we click the copy button
        */
        onDuplicate(cut?: boolean): void;
        /**
        * Shows the rename form - and creates a new behaviour if valid
        */
        newContainer(): void;
        /**
        * When we click the delete button
        */
        onDelete(): void;
        /**
        * This function is used to create a new group on the toolbar
        * @param {string} text The text of the new tab
        * @param {boolean} text The text of the new tab
        * @returns {Component} Returns the {Component} object representing the tab
        */
        createTab(text: string, isSelected?: boolean): Component;
        saveAll(): void;
        /**
        * Called when the key is pushed down
        * @param {any} event
        */
        onKeyDown(event: any): boolean;
        /**
        * Removes a tab by its name
        * @param {string} text The name of the tab
        */
        removeTab(text: string): void;
        /**
        * This function is used to create a new group on the toolbar
        * @param {Component} tab The {Component} tab object which represents the parent of this group.
        * @returns {Component} Returns the {Component} object representing the group
        */
        createGroup(tab: Component): Component;
        /**
        * Use this function to create a group button for the toolbar
        * @param {string} text The text for the button
        * @param {number} min The minimum limit
        * @param {number} max The maximum limit
        * @param {number} delta The incremental difference when scrolling
        * @param {Component} group The Component object representing the group
        * @returns {ToolbarNumber}
        */
        createGroupNumber(text: string, defaultVal: number, min?: number, max?: number, delta?: number, group?: Component): ToolbarNumber;
        /**
        * Use this function to create a group button for the toolbar
        * @param {string} text The text for the button
        * @param {string} image An image URL for the button icon
        * @param {Component} group The Component object representing the group
        * @param {boolean} isPushButton If true, the button will remain selected when clicked.
        * @returns {Component} Returns the Component object representing the button
        */
        createGroupButton(text: string, image?: string, group?: Component, isPushButton?: boolean): ToolBarButton;
        /**
        * Use this function to create a group button for the toolbar
        * @param {Component} parent The parent that will contain the drop down
        * @param {Array<ToolbarItem>} items An array of items to list
        * @returns {ToolbarDropDown} Returns the Component object representing the button
        */
        createDropDownButton(parent: Component, items: Array<ToolbarItem>): ToolbarDropDown;
        /**
        * Use this function to create a group button for the toolbar
        * @param {Component} parent The parent that will contain the drop down
        * @param {string} text The under the button
        * @param {string} color The hex colour as a string
        * @returns {ToolbarColorPicker} Returns the ToolbarColorPicker object representing the button
        */
        createColorButton(parent: Component, text: string, color: string): ToolbarColorPicker;
        /**
        * Gets the singleton instance
        */
        static getSingleton(parent?: Component): Toolbar;
    }
}
declare module Animate {
    /**
    * The splash screen when starting the app
    */
    class Splash {
        private static _singleton;
        private _splashElm;
        private _loginElm;
        private _welcomeElm;
        private _newProject;
        private _loadingProject;
        private _app;
        private _captureInitialized;
        private $user;
        private $theme;
        private $activePane;
        private $errorMsg;
        private $errorRed;
        private $loading;
        private $projects;
        private $plugins;
        private $selectedPlugins;
        private $selectedProject;
        private $selectedPlugin;
        private $pager;
        /**
        * Creates an instance of the splash screen
        */
        constructor(app: Application);
        show(): void;
        splashDimensions(): any;
        goState(state: string, digest?: boolean): void;
        removeProject(messageBoxAnswer: string): void;
        openProject(project: Engine.IProject): void;
        /**
        * Attempts to load the project and setup the scene
        */
        loadScene(): void;
        fetchProjects(index: number, limit: number): void;
        selectProject(project: Engine.IProject): void;
        selectPlugin(plugin: Engine.IPlugin): void;
        showVersions(plugin: Engine.IPlugin): void;
        isPluginSelected(plugin: any): boolean;
        reset(): void;
        /**
        * Given a form element, we look at if it has an error and based on the expression. If there is we set
        * the login error message
        * @param {EngineForm} The form to check.
        * @param {boolean} True if there is an error
        */
        reportError(form: NodeForm): boolean;
        /**
        * Creates a new user project
        * @param {EngineForm} The form to check.
        * @param {boolean} True if there is an error
        */
        newProject(name: string, description: string, plugins: Array<Engine.IPlugin>): void;
        loginError(err: Error): void;
        loginSuccess(data: UsersInterface.IResponse): void;
        /**
        * Attempts to log the user in
        * @param {string} user The username
        * @param {string} password The user password
        * @param {boolean} remember Should the user cookie be saved
        */
        login(user: string, password: string, remember: boolean): void;
        /**
        * Attempts to register a new user
        * @param {string} user The username of the user.
        * @param {string} password The password of the user.
        * @param {string} email The email of the user.
        * @param {string} captcha The captcha of the login screen
        * @param {string} captha_challenge The captha_challenge of the login screen
        */
        register(user: string, password: string, email: string, captcha: string, challenge: string): void;
        /**
        * Attempts to resend the activation code
        * @param {string} user The username or email of the user to resend the activation
        */
        resendActivation(user: string): void;
        /**
        * Attempts to reset the users password
        * @param {string} user The username or email of the user to resend the activation
        */
        resetPassword(user: string): void;
        /**
        * Attempts to resend the activation code
        */
        logout(): void;
        /**
      * Initializes the spash screen
      * @returns {Splash}
      */
        static init(app: Application): Splash;
        /**
      * Gets the singleton reference of this class.
      * @returns {Splash}
      */
        static get: Splash;
    }
}
declare var _cache: string;
declare var __plugins: {
    [name: string]: Array<Engine.IPlugin>;
};
declare var __newPlugin: Animate.IPlugin;
/**
* Goes through each of the plugins and returns the one with the matching ID
* @param {string} id The ID of the plugin to fetch
*/
declare function getPluginByID(id: string): Engine.IPlugin;
/**
* Once the plugins are loaded from the DB
* @param {Array<Engine.IPlugin>} plugins
*/
declare function onPluginsLoaded(plugins: Array<Engine.IPlugin>): void;
/**
* Returns a formatted byte string
* @returns {string}
*/
declare function byteFilter(bytes: any, precision?: number): string;
