import { post, get } from '../core/utils';
import { DB } from '../setup/db';
import { EventDispatcher } from '../core/event-dispatcher';
import { Model } from './model';

export interface ICollectionOptions<T> {
    modelClass?: typeof Model;
    modelId?: string;
    models?: Model<T>[];
    parent?: Model<any>;
    host?: string;
}

export class Collection<T> extends EventDispatcher {
    public modelClass: typeof Model;
    public url: string;
    public modelId: string;
    public host: string;
    public models: Model<T>[];
    private _parent: Model<any> | null;


    constructor( url: string, options?: ICollectionOptions<T> ) {
        super();
        this.url = url;
        this.modelId = options && options.modelId || '_id';
        this.models = options && options.models || [];
        this._parent = options && options.parent || null;
        this.host = options && options.host || DB.HOST;
    }

    getNormalizedUrl() {
        if ( this._parent )
            this._parent.getNormalizedUrl() + this.url;

        return this.url;
    }

    /**
     * Generates the URL path of the model's REST endpoint
     */
    protected getRoutPath(): string {
        return this.host + '/' + this.getNormalizedUrl();
    }

    async fetch() {
        const response = await get<Modepress.IGetArrayResponse<T>>( this.getRoutPath() );
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

        this.models.push( new this.modelClass<T>( { id: response.data[ this.modelId ], collection: this, resource: response.data }) );
    }

    parse( databaseResponse: Modepress.IGetArrayResponse<T> ): T[] {
        return databaseResponse.data;
    }
}