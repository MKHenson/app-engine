module Animate
{
    /**
	* A Tab pair for the canvas tabs
	*/
	export class CanvasTabPair extends TabPair
	{
		public canvas: Canvas;

		constructor( canvas: Canvas, name : string )
		{
			super( null, null, name );
            this.canvas = canvas;
            this.canvas.container.on("modified", this.onContainerModified, this);
        }

        /**
		* Whenever the container is modified, we show this with a *
		*/
        onContainerModified(type: string, event: Event, sender: EventDispatcher)
        {
            this.modified = !this.canvas.container.saved;
        }

        /**
		* Cleans up the pair
		*/
		dispose()
        {
            this.canvas.container.off("modified", this.onContainerModified, this);
			this.canvas = null;
			super.dispose();
		}
	}
}