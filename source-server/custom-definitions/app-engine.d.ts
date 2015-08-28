declare module UsersInterface
{
    /*
    * An interface to describe the data stored in the database for users
    */
    export interface IEngineUser extends IUserEntry
    {
        meta?: {
            bio: string;
            plan: number;
            maxNumProjects: number;
            createdOn: number;
            imgURL: string;
        };
    }
}

declare module Engine
{
    /**
    * An interface that is used to describe the assets model
    */
    export interface IAsset
    {
        name?: string;
        shallowId?: number;
        className?: string;
        project_id?: string;
        createdBy?: string;
        json?: Array<{ name: string; category: string; value: any; type: string; }>;
        created_on?: number;
        last_modified?: number;
        _id?: any;
    }

    /**
    * An interface that is used to describe the plugin model
    */
    export interface IPlugin
    {
        name?: string;
        folderName?: string;
        description?: string;
        shortDescription?: string;
        plan?: number;
        path?: string;
        header?: string;
        body?: string;
        deployables?: Array<string>;
        css?: string;	
        image?: string;
        author?: string;
        version?: string;
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
        user?: any;
        build?: any;
        type?: number;
        tags?: Array<string>;
        readPrivileges?: Array<string>;
        writePrivileges?: Array<string>;
        adminPrivileges?: Array<string>;
        plugins?: Array<string>;
        files?: Array<string>;
        createdOn?: number;
        lastModified?: number;
        _id?: any;  
    }
}

declare module ModepressEngine
{
    export interface IGetAssets extends Modepress.IGetArrayResponse<Engine.IAsset> { }
    export interface IGetPlugins extends Modepress.IGetArrayResponse<Engine.IPlugin> { }
    export interface IGetProjects extends Modepress.IGetArrayResponse<Engine.IProject> { }
    export interface ICreateProject extends Modepress.IGetResponse<Engine.IProject> { }
}

declare module "engine" {
    export = Engine;
}

declare module "modepress-engine"
{
    export = ModepressEngine;
}