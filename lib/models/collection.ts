import { IAjaxError, post, put, get } from '../core/utils';
import { DB } from '../setup/db';
import { Model } from './model';

export class Collection<T> {
    public baseUrl: string;
    public models: Model<T>[];

    constructor() {
        this.baseUrl = '';
        this.models = [];
    }

    parse() { }
    sync() { }
}