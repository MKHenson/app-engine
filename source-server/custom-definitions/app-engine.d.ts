declare module "app-engine"
{
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
}

declare module "modepress-api"
{
    import {IAsset} from "app-engine";

    export interface IGetAssets extends IGetArrayResponse<IAsset> { }
}