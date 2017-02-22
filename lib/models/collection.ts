import { post, get } from '../core/utils';
import { DB } from '../setup/db';
import { EventDispatcher } from '../core/event-dispatcher';
import { Model } from './model';

export interface ICollectionOptions<T> {
    modelClass?: Function;
    modelId?: string;
    models?: Model<T>[];
    parent?: Model<any>;
    host?: string;
    url?: string;
    baseUrl?: string;
}

export class Collection<T> extends EventDispatcher {
    public modelClass: typeof Model;
    public url: string;
    public baseUrl: string | null;
    public modelId: string;
    public host: string;
    public models: Model<T>[];
    private _parent: Model<any> | null;


    constructor( options?: ICollectionOptions<T> ) {
        super();
        this.url = options && options.url || '';
        this.modelId = options && options.modelId || '_id';
        this.models = options && options.models || [];
        this._parent = options && options.parent || null;
        this.host = options && options.host || DB.HOST;
        this.baseUrl = options && options.baseUrl || null;
    }

    getNormalizedUrl() {
        if ( this.baseUrl )
            return this.baseUrl;

        if ( this._parent )
            return this._parent.getNormalizedUrl() + this.url;

        return this.url;
    }

    /**
     * Generates the URL path of the model's REST endpoint
     */
    protected getRoutPath(): string {
        return this.host + '/' + this.getNormalizedUrl();
    }

    async fetch( queryParams?: any ) {
        const response = await get<Modepress.IGetArrayResponse<T>>( this.getRoutPath(), queryParams );
        if ( response.error )
            throw new Error( response.message );

        this.models.splice( 0, this.models.length );
        const models = this.parse( response );
        for ( const model of models )
            this.models.push( new this.modelClass<T>( { id: model[ this.modelId ], collection: this, resource: model }) );
    }

    async create( data: T, options?: any ) {
        const response = await post<Modepress.IGetResponse<T>>( this.getRoutPath(), data );

        if ( response.error )
            throw new Error( response.message );

        const model = new this.modelClass<T>( { id: response.data[ this.modelId ], collection: this, resource: response.data });
        this.models.push( model );
        return model;
    }

    parse( databaseResponse: Modepress.IGetArrayResponse<T> ): T[] {
        return databaseResponse.data;
    }
}