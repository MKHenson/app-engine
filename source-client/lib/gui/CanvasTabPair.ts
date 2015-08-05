module Animate
{
	export class CanvasTabPair extends TabPair
	{
		public canvas: Canvas;

		constructor( canvas: Canvas, name : string )
		{
			super( null, null, name );
			this.canvas = canvas;
		}

		dispose()
		{
			this.canvas = null;
			super.dispose();
		}
	}
}