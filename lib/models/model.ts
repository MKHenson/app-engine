import { IAjaxError, post, put, get } from '../core/utils';
import { DB } from '../setup/db';

export class Model<R> {
    public idAttribute: string;
    public baseUrl: string;
    public resource: R;

    constructor() {
        this.idAttribute = '_id';
        this.baseUrl = '';
    }

    parse() { }
    sync() { }
}