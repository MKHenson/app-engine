module Animate
{
	/**
	* A simple interface for any component
	*/
	export interface IComponent
	{
		element: JQuery;
		parent: IComponent;
		dispose(): void;
		addChild(child: string): IComponent;
		addChild(child: IComponent): IComponent;
		addChild(child: any): IComponent;
		removeChild(child: IComponent): IComponent
		update(): void;
		selected: boolean;
		savedID: string;
		id: string;
		children: Array<IComponent>;
		clear(): void;
		disposed: boolean;
		onDelete(): void;
	}
}