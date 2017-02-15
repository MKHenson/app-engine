import { del, put, get } from '../core/utils';
import { DB } from '../setup/db';
import { Collection } from './collection';
import { EventDispatcher } from '../core/event-dispatcher';

export interface IModelOptions<R> {
    collection?: Collection<R>;
    id?: string;
    idAttribute?: string;
    urlRoot?: string;
    url?: string;
    resource?: any;
    host?: string;
}

/**
 * Events dispatched by Model instances
 */
export type ModelEvents =
    'updated' |
    'destroyed' |
    'fetched';


export class Model<R> extends EventDispatcher {
    private _id: string;
    public collection: Collection<R> | null;
    public idAttribute: string;
    public urlRoot: string | null;
    public url: string | null;
    private _resource: R | null;
    public host: string;

    constructor( options?: IModelOptions<R> ) {
        super();
        this._id = options && options.id || '';
        this.idAttribute = options && options.idAttribute || '_id';
        this.url = options && options.url || '';
        this.collection = options && options.collection || null;
        this.host = options && options.host || DB.API;

        this._resource = null;
        if ( options && options.resource ) {
            this._resource = this.parse( options.resource );
            this._id = this._resource[ this.idAttribute ];
        }
    }

    getNormalizedUrl() {
        if ( this.urlRoot )
            return this.urlRoot;

        if ( this.collection )
            return this.collection.getNormalizedUrl() + this.url + this._id;

        return this.url + this._id;
    }

    /**
     * Generates the URL path of the model's REST endpoint
     */
    protected getRoutPath(): string {
        return `${this.host}/${this.getNormalizedUrl()}`;
    }

    get id(): string {
        return this._id;
    }

    get resource(): R {
        return this.resource;
    }

    set resource( val: R ) {
        this._resource = val;
        this._id = val ? val[ this.idAttribute ] : '';
    }

    async update( options?: any ) {
        const data = this.sync( options );
        const response = await put<Modepress.IResponse>( this.getRoutPath(), data );

        if ( response.error )
            throw new Error( response.message );

        // TODO: Updates should actually send data, and have the same data sent back by the server
        // as confirmation of its setting. A parse then needs to called to clean the data.
        this.emit<ModelEvents, void>( 'updated' );
    }

    async destroy( options?: any ) {
        let response = await del<Modepress.IResponse>( this.getRoutPath(), options );
        if ( response.error )
            throw new Error( response.message );

        this.emit<ModelEvents, void>( 'destroyed' );
        return response;
    }

    async fetch() {
        const response = await get<Modepress.IGetResponse<R>>( this.getRoutPath() );
        if ( response.error )
            throw new Error( response.message );

        this._resource = this.parse( response.data );
        this._id = this._resource[ this.idAttribute ];
        this.emit<ModelEvents, void>( 'fetched' );
    }

    parse( dbModel: R ): R { return dbModel; }
    sync( options: any ): any { return this._resource; }
}