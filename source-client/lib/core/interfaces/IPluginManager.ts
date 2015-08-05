module Animate
{
	export interface IPluginManager
	{
		/**
		* This funtcion is used to load a plugin.
		* @param {IPlugin} plugin The IPlugin constructor that is to be created
		* @param {boolean} createPluginReference Should we keep this constructor in memory? The default is true
		*/
		loadPlugin(plugin: IPlugin, createPluginReference: boolean);
	}
}