module HatcheryPlugin
{
    type PagerFunction = (index: number, limit: number) => ng.IHttpPromise<Modepress.IGetArrayResponse<any>>;

	/**
	* Class for keeping track of
	*/
    export class Pager
    {
        protected index: number;
        protected limit: number;
        protected last: number;
        protected searchTerm: string;
        protected loader: PagerFunction;
        protected _proxyResolve: any;
        protected _proxyReject: any;

        constructor(loader: PagerFunction)
        {
            this.loader = loader;
            this.index = 0;
            this.limit = 10;
            this.last = 1;
            this.searchTerm = "";
            this._proxyReject = this.onReject.bind(this);
            this._proxyResolve = this.onResolve.bind(this);
        }

        private onResolve(response: ng.IHttpPromiseCallbackArg<Modepress.IGetArrayResponse<any>>)
        {
            this.last = response.data.count;
            if (this.last == 0)
                this.last = 1;
        }

        private onReject(err: Error)
        {
            this.last = 1;
        }

        public canNext(): boolean
        {
            return ( this.index + this.limit < this.last )
        }

        public canLast(): boolean
        {
            return (this.index < this.last - this.limit)
        }

        /**
        * Gets the current page number
        * @returns {number}
        */
        getPageNum(): number
        {
            return (this.index / this.limit) + 1;
        }

        /**
		* Gets the total number of pages
        * @returns {number}
		*/
        getTotalPages()
        {
            return Math.ceil(this.last / this.limit);
        }

        /**
		* Sets the page search back to index = 0
		*/
        goFirst()
        {
            var that = this;
            this.index = 0;
            this.loader(this.index, this.limit).then(this._proxyResolve).catch(this._proxyReject);
        }

        /**
		* Gets the last set of users
		*/
        goLast()
        {
            var that = this;
            this.index = this.last - (this.last % this.limit);
            this.loader(this.index, this.limit).then(this._proxyResolve).catch(this._proxyReject);
        }

        /**
        * Sets the page search back to index = 0
        */
        goNext()
        {
            var that = this;
            this.index += this.limit;
            this.loader(this.index, this.limit).then(this._proxyResolve).catch(this._proxyReject);
        }

        /**
        * Sets the page search back to index = 0
        */
        goPrev()
        {
            var that = this;
            this.index -= this.limit;
            if (this.index < 0)
                this.index = 0;

            this.loader(this.index, this.limit).then(this._proxyResolve).catch(this._proxyReject);
        }

        /**
        * Called when the controller is being destroyed
        */
        onDispose()
        {
        }
    }
}