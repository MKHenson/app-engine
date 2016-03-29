module Animate
{
    /**
	* A Tab pair for the canvas tabs
	*/
	export class CanvasTabPair extends TabPair
	{
        private _canvas: Canvas;
        public forceClose: boolean;

		constructor( canvas: Canvas, name : string )
		{
			super( null, null, name );
            this._canvas = canvas;
            this.forceClose = false;
            this._canvas.container.on("refreshed", this.onRefreshed, this);
            this._canvas.container.on("modified", this.onContainerModified, this);
            this._canvas.container.on("deleted", this.onContainerDeleted, this);
        }

        /**
        * Called whenever the container is refreshed
        */
        onRefreshed(type: string, event: Event, sender: Container)
        {
            this.text = sender.entry.name;
        }

        /**
        * Whenever the container deleted
        */
        onContainerDeleted(type: string, event: Event, sender: EventDispatcher)
        {
            this.forceClose = true;
            this.tab.removeTab(this, true);
            this.forceClose = false;
        }

        /**
		* Whenever the container is modified, we show this with a *
		*/
        onContainerModified(type: string, event: Event, sender: EventDispatcher)
        {
            this.modified = !this._canvas.container.saved;
        }

        /**
		* Cleans up the pair
		*/
		dispose()
        {
            this._canvas.container.off("refreshed", this.onRefreshed, this);
            this._canvas.container.off("modified", this.onContainerModified, this);
            this._canvas.container.off("deleted", this.onContainerDeleted, this);
            this._canvas = null;
			super.dispose();
        }

        /**
        * @returns {Canvas}
        */
        get canvas(): Canvas { return this._canvas; }
	}
}