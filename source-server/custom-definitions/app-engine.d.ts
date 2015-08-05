declare module "app-engine"
{
    /**
    * A class that is used to describe the assets model
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
    * A class that is used to describe the plugin model
    */
    export interface IPlugin
    {
        name?: string;
        folderName?: string;
        description?: string;
        shortDescription?: string;
        plan?: string;
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
}

declare module "modepress-api"
{
    import {IAsset, IPlugin} from "app-engine";

    export interface IGetAssets extends IGetArrayResponse<IAsset> { }
    export interface IGetPlugins extends IGetArrayResponse<IPlugin> { }
}