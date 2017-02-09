import { del, put, get } from '../core/utils';
import { DB } from '../setup/db';
import { Collection } from './collection';
import { EventDispatcher } from '../core/event-dispatcher';

export interface ModelOptions<R> {
    collection?: Collection<R>;
    id?: string;
    idAttribute?: string;
    urlRoot?: string;
    url?: string;
    resource?: any;
}

/**
 * Events dispatched by Model instances
 */
export type ModelEvents =
    'saved' |
    'destroyed' |
    'fetched';

/**
 * Events emitted by Model instances
 */
export interface ModelEvent<T> {
    serverResponse: T;
}

export class Model<R> extends EventDispatcher {
    private _id: string;
    public collection: Collection<R> | null;
    public idAttribute: string;
    public urlRoot: string | null;
    public url: string | null;
    private _resource: R | null;

    constructor( options?: ModelOptions<R> ) {
        super();
        this._id = options && options.id || '';
        this.idAttribute = options && options.idAttribute || '_id';
        this.url = options && options.url || '';
        this.collection = options && options.collection || null;

        this._resource = null;
        if ( options && options.resource ) {
            this._resource = this.parse( options.resource );
            this._id = this._resource[ this.idAttribute ];
        }
    }

    /**
     * Generates the URL path of the model's REST endpoint
     */
    protected getRoutPath(): string {
        if ( !this.collection || !this.urlRoot )
            throw new Error( 'You must specify a urlRoot or the model must be part of a collection before this action can be completed' );

        return DB.HOST + '/' + ( this.urlRoot || this.collection.url ) + this._id;
    }

    get resource(): R {
        return this.resource;
    }

    async update( options?: any ) {
        const data = this.sync( options );
        const response = await put<Modepress.IResponse>( this.getRoutPath(), data );

        if ( response.error )
            throw new Error( response.message );

        // TODO: Updates should actually send data, and have the same data sent back by the server
        // as confirmation of its setting. A parse then needs to called to clean the data.
    }

    async destroy( options?: any ) {
        let response = await del<Modepress.IResponse>( this.getRoutPath(), options );
        if ( response.error )
            throw new Error( response.message );

        this.emit<ModelEvents, void>( 'destroyed' );
        return response;
    }

    async fetch<T>() {
        const response = await get<Modepress.IGetResponse<T>>( this.getRoutPath() );
        if ( response.error )
            throw new Error( response.message );

        this._resource = this.parse<T>( response.data );
        this._id = this._resource[ this.idAttribute ];
    }

    parse<T>( dbModel: T | R ): R { return dbModel as R; }
    sync( options: any ): any { return this._resource; }
}