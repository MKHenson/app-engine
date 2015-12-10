module Animate
{
    /**
	* A Tab pair for the canvas tabs
	*/
	export class CanvasTabPair extends TabPair
	{
		private _canvas: Canvas;

		constructor( canvas: Canvas, name : string )
		{
			super( null, null, name );
            this._canvas = canvas;
            this._canvas.container.on("modified", this.onContainerModified, this);
            this._canvas.container.on("deleted", this.onContainerDeleted, this);
        }

        /**
        * Whenever the container deleted
        */
        onContainerDeleted(type: string, event: Event, sender: EventDispatcher)
        {
            this.tab.removeTab(this, true);
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