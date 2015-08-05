module Animate
{
	/**
	* A simple interface for any compent that needs to act as a Docker parent.
	*/
	export interface IDockItem extends IComponent
	{
		/*This is called by a controlling Docker class. An image string needs to be returned
		* which will act as a preview of the component that is being viewed or hidden.*/
		getPreviewImage() : string;

		/*This is called by a controlling Docker class when the component needs to be shown.*/
		onShow() : void;

		/*Each IDock item needs to implement this so that we can keep track of where it moves.*/
		getDocker(): Docker;

		/*Each IDock item needs to implement this so that we can keep track of where it moves.*/
		setDocker( dockItem: Docker );

		/*This is called by a controlling Docker class when the component needs to be hidden.*/
		onHide() : void;
	}
}