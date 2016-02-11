module Animate
{
	/**
	* Abstract class downloading content by pages
	*/
    export class PageLoader
    {
        public updateFunc: (index: number, limit: number) => void;
        public index: number;
        public limit: number;
        public last: number;
        protected searchTerm: string;

        constructor(updateFunction: (index: number, limit: number) => void )
        {
            this.updateFunc = updateFunction;
            this.index = 0;
            this.limit = 10;
            this.last = 1;
            this.searchTerm = "";
        }

        /**
        * Calls the update function
        */
        invalidate()
        {
            this.updateFunc(this.index, this.limit);
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
            this.index = 0;
            this.updateFunc(this.index, this.limit);
        }

        /**
		* Gets the last set of users
		*/
        goLast()
        {
            this.index = this.last - (this.last - this.limit) % this.limit;
            if (this.index < 0)
                this.index = 0;

            this.updateFunc(this.index, this.limit);
        }

        /**
        * Sets the page search back to index = 0
        */
        goNext()
        {
            this.index += this.limit;
            this.updateFunc(this.index, this.limit);
        }

        /**
        * Sets the page search back to index = 0
        */
        goPrev()
        {
            this.index -= this.limit;
            if (this.index < 0)
                this.index = 0;

            this.updateFunc(this.index, this.limit);
        }
    }
}