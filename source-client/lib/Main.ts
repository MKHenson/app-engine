interface IPluginDefinition
{
	name: string;
	description: string;
	shortDescription: string;
	plan: string;
	path: string;
	css: string;
	image: string;
	author: string;
	version: string;
	_id: any;
}

var __plugins: Array<IPluginDefinition> = [];

function onPluginsLoaded( eventType: Animate.ENUM, event: Animate.AnimateLoaderEvent, sender?: Animate.AnimateLoader )
{
	sender.removeEventListener( Animate.LoaderEvents.COMPLETE, onPluginsLoaded );
	sender.removeEventListener( Animate.LoaderEvents.FAILED, onPluginsLoaded );

	if ( !event.tag )
	{
		Animate.MessageBox.show( "Could not connect to server", [], null, null );
		return;
	}

	__plugins = event.tag.plugins;

	//Start Splash screen
	Animate.Splash.getSingleton().show();
}

jQuery(document).ready(function ()
{
	var app = new Animate.Application( "body" );

	var loader = new Animate.AnimateLoader();	
	loader.addEventListener( Animate.LoaderEvents.COMPLETE, onPluginsLoaded );
	loader.addEventListener( Animate.LoaderEvents.FAILED, onPluginsLoaded );
	loader.load( "/plugin/get-plugins", {} );	
});