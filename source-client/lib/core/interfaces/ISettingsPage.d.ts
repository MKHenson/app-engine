declare module Animate
{
	export interface ISettingsPage extends IComponent
	{
		onShow(project: Project, user: User);
		name: string;
		onTab(): void;
	}
}