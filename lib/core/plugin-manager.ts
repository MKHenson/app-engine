import { EventDispatcher } from './event-dispatcher';
import { BehaviourDefinition } from './behaviour-definition';
import { AssetTemplate } from './asset-template';
import { TypeConverter } from './type-converter';
import { PortalTemplate } from './portal-template';
import { PropAsset } from './properties/prop-asset';
import { PropBool } from './properties/prop';
import { PluginManagerEvents, ITemplateEvent } from '../setup/events';
import { IPlugin, IPreviewFactory } from 'hatchery-editor-plugins';
import { AssetClass } from './asset-class';
import { ImageVisualizer } from './file-visualizers/image-visualizer';

declare var __newPlugin: IPlugin | null;

/**
 * The plugin manager is used to load and manage external Animate plugins.
 */
export class PluginManager extends EventDispatcher {
    private static _singleton: PluginManager;

    private _plugins: Array<IPlugin>;
    private _loadedPlugins: Array<IPlugin>;
    private _behaviourTemplates: Array<BehaviourDefinition>;
    private _assetTemplates: Array<AssetTemplate>;
    private _converters: Array<TypeConverter>;
    private _previewVisualizers: Array<IPreviewFactory>;


    private _allPlugins: { [ name: string ]: Array<HatcheryServer.IPlugin> };




    constructor() {
        super();

        // Set this singleton
        PluginManager._singleton = this;

        this._plugins = new Array<IPlugin>();
        this._allPlugins = {};
        this._behaviourTemplates = new Array<BehaviourDefinition>();
        this._assetTemplates = new Array<AssetTemplate>();
        this._converters = new Array<TypeConverter>();

        // Create some standard templates
        this._behaviourTemplates.push( new BehaviourDefinition( 'Asset',
            [
                new PortalTemplate( new PropAsset( 'Asset In', null ), 'parameter' ),
                new PortalTemplate( new PropAsset( 'Asset Out', null ), 'product' )
            ], null, false, false, false, false ) );

        this._behaviourTemplates.push( new BehaviourDefinition( 'Script',
            [
                new PortalTemplate( new PropBool( 'Execute', false ), 'input' ),
                new PortalTemplate( new PropBool( 'Exit', false ), 'output' )
            ], null, true, true, true, true ) );

        this._behaviourTemplates.push( new BehaviourDefinition( 'Portal', [], null, false, false, false, false ) );
        this._behaviourTemplates.push( new BehaviourDefinition( 'Instance', [], null, true, true, true, true ) );
        this._loadedPlugins = [];
        // TODO: This must be refactored from updates to TSX
        // ==================================================
        // BehaviourPicker.getSingleton().list.addItem( 'Asset' );
        // BehaviourPicker.getSingleton().list.addItem('Script');
        // ==================================================
        this._previewVisualizers = [ new ImageVisualizer() ];
    }

    /**
     * Attempts to download a plugin by its URL and insert it onto the page.
     * Each plugin should then register itself with the plugin manager by setting the __newPlugin variable. This variable is set in the plugin that's downloaded.
     * Once downloaded - the __newPlugin will be set as the plugin and is assigned to the plugin definition.
     * @param pluginDefinition The plugin to load
     */
    loadPlugin( pluginDefinition: HatcheryServer.IPlugin ): Promise<HatcheryServer.IPlugin> {
        if ( pluginDefinition.$loaded )
            return Promise.resolve();

        return new Promise<HatcheryServer.IPlugin>( function( resolve, reject ) {
            const script = document.createElement( 'script' );
            script.onerror = function() {
                pluginDefinition.$loaded = false;
                return reject( new Error( `'${pluginDefinition.name}' could not be downloaded` ) );
            }
            script.onload = function() {

                // TODO: The __newPlugin way of doing things is terrible - we need something better

                if ( !__newPlugin )
                    return reject( new Error( `'${pluginDefinition.name}' could not be downloaded or __newPlugin not set` ) );

                pluginDefinition.$loaded = true;
                pluginDefinition.$instance = __newPlugin;
                __newPlugin = null;
                return resolve( pluginDefinition );
            }

            script.async = true;
            script.src = pluginDefinition.url!;
            document.head.appendChild( script );
        });
    }

    /**
     * Goes through each of the plugins and returns the one with the matching ID
     * @param id The ID of the plugin to fetch
     */
    getPluginByID( id: string ): HatcheryServer.IPlugin | null {
        for ( const pluginName in this._allPlugins ) {
            for ( let i = 0, l = this._allPlugins[ pluginName ].length; i < l; i++ )
                if ( this._allPlugins[ pluginName ][ i ]._id === id )
                    return this._allPlugins[ pluginName ][ i ];
        }

        return null;
    }



    /**
     * Sorts the plugins based on their versions
     */
    sortPlugins( plugins: HatcheryServer.IPlugin[] ) {
        for ( let i = 0, l = plugins.length; i < l; i++ ) {
            if ( !this._allPlugins[ plugins[ i ].name! ] )
                this._allPlugins[ plugins[ i ].name! ] = [];
            else
                continue;

            let pluginArray = this._allPlugins[ plugins[ i ].name! ];

            for ( let ii = 0; ii < l; ii++ )
                if ( plugins[ ii ].name === plugins[ i ].name )
                    pluginArray.push( plugins[ ii ] );

            // Sort the plugins based on their versions
            pluginArray = pluginArray.sort( function compare( a, b ) {
                if ( a === b )
                    return 0;

                const a_components = a.version!.split( '.' );
                const b_components = b.version!.split( '.' );

                const len = Math.min( a_components.length, b_components.length );

                // loop while the components are equal
                for ( let i = 0; i < len; i++ ) {
                    // A bigger than B
                    if ( parseInt( a_components[ i ] ) > parseInt( b_components[ i ] ) )
                        return 1;

                    // B bigger than A
                    if ( parseInt( a_components[ i ] ) < parseInt( b_components[ i ] ) )
                        return -1;
                }

                // If one's a prefix of the other, the longer one is greater.
                if ( a_components.length > b_components.length )
                    return 1;

                if ( a_components.length < b_components.length )
                    return -1;

                // Otherwise they are the same.
                return 0;
            });
        }
    }

    /**
     * This funtcion is used to load a plugin.
     * @param pluginDefinition The IPlugin constructor that is to be created
     * @param createPluginReference Should we keep this constructor in memory? The default is true
     */
    preparePlugin( pluginDefinition: any ) {
        const plugin: IPlugin = pluginDefinition.$instance!;
        this._plugins.push( plugin );

        // Get behaviour definitions
        const btemplates: Array<BehaviourDefinition> = plugin.getBehaviourDefinitions();
        if ( btemplates ) {

            // TODO: This must be refactored from updates to TSX
            // ==================================================
            for ( let template of btemplates ) {
                this._behaviourTemplates.push( template );
                // 	BehaviourPicker.getSingleton().list.addItem( btemplates[i].behaviourName );
                // 	TreeViewScene.getSingleton().addPluginBehaviour( btemplates[i] );
                this.emit<PluginManagerEvents, ITemplateEvent>( 'template-created', { template: template });
            }
            // ===================================================
        }

        // Get converters
        let converters: Array<TypeConverter> = plugin.getTypeConverters();
        if ( converters ) {
            let i = converters.length;
            while ( i-- )
                this._converters.push( converters[ i ] );
        }

        // Get asset templates
        let atemplates: Array<AssetTemplate> = plugin.getAssetsTemplate();
        if ( atemplates ) {
            let i = atemplates.length;
            while ( i-- )
                this._assetTemplates.push( atemplates[ i ] );
        }

        return;
    }

    /**
     * Call this function to unload a plugin
     * @param plugin The IPlugin object that is to be loaded
     */
    unloadPlugin( plugin: IPlugin ) {
        // Get converters
        const toRemove: Array<BehaviourDefinition> = new Array();
        let i = this._behaviourTemplates.length;
        while ( i-- )
            if ( this._behaviourTemplates[ i ].plugin === plugin )
                toRemove.push( this._behaviourTemplates[ i ] );

        // Get behaviour definitions
        i = toRemove.length;
        // TODO: This must be refactored from updates to TSX
        // ==================================================
        while ( i-- ) {
            // 	BehaviourPicker.getSingleton().list.removeItem( toRemove[i].behaviourName );
            // 	TreeViewScene.getSingleton().removePluginBehaviour( toRemove[i].behaviourName );

            this._behaviourTemplates.splice( this._behaviourTemplates.indexOf( toRemove[ i ] ), 1 );
            this.emit<PluginManagerEvents, ITemplateEvent>( 'template-removed', { template: toRemove[ i ] });
        }
        // ==================================================

        // Get converters
        const toRemove2: Array<TypeConverter> = [];
        i = this._converters.length;
        while ( i-- )
            if ( this._converters[ i ].plugin === plugin )
                toRemove2.push( this._converters[ i ] );

        i = toRemove2.length;
        while ( i-- )
            this._converters.splice( jQuery.inArray( toRemove2[ i ], this._converters ), 1 );

        this._assetTemplates.splice( 0, this._assetTemplates.length );

        plugin.unload();
    }

    /**
     * Loops through each of the converters to see if a conversion is possible. If it is
     * it will return an array of conversion options, if not it returns false.
     * @param typeA The first type to check
     * @param typeB The second type to check
     */
    getConverters( typeA: any, typeB: any ): string[] | null {
        let toRet: string[] | null = null;

        let i = this._converters.length;
        while ( i-- ) {
            if ( this._converters[ i ].canConvert( typeA, typeB ) ) {
                if ( toRet === null )
                    toRet = [];

                let ii = this._converters[ i ].conversionOptions.length;
                while ( ii-- )
                    toRet.push( this._converters[ i ].conversionOptions[ ii ] );
            }
        }

        return toRet;
    }

    /**
     * Gets a behaviour template by its name.
     * @param behaviorName The name of the behaviour template
     */
    getTemplate( behaviorName: string ) {
        let len = this._behaviourTemplates.length;
        while ( len-- )
            if ( this._behaviourTemplates[ len ].behaviourName === behaviorName )
                return this._behaviourTemplates[ len ];

        return null;
    }

    /**
     * Use this function to select an asset in the tree view and property grid
     * @param asset The Asset object we need to select
     * @param panToNode When set to true, the treeview will bring the node into view
     * @param multiSelect When set to true, the treeview not clear any previous selections
     */
    selectAsset() {
        // TODO: This needs to be checked with update to TSX
        // ================================================
        // Animate.TreeViewScene.getSingleton().selectNode(
        //     Animate.TreeViewScene.getSingleton().findNode( 'resource', asset ) );
        // ================================================
    }

    /**
     * Gets an asset class by its name
     * @param name The name of the asset class
     */
    getAssetClass( name: string ): AssetClass | null {
        // Assign any of the options / missing variables for classes that are updated in code but not in the DB
        const assetTemplates: Array<AssetTemplate> = this._assetTemplates;
        for ( let i = 0, l = assetTemplates.length; i < l; i++ ) {
            const assetClass: AssetClass | null = assetTemplates[ i ].findClass( name );
            if ( assetClass )
                return assetClass;
        }

        return null;
    }

    /**
     * Called when the project is reset by either creating a new one or opening an older one.
     */
    projectReset() {
        // Cleanup all the previous plugins
        for ( let i = 0; i < this._plugins.length; i++ )
            this.unloadPlugin( this._plugins[ i ] );

        this._plugins.splice( 0, this._plugins.length );
        this._loadedPlugins.splice( 0, this._loadedPlugins.length );
    }

    /**
     * This function is called by Animate when everything has been loaded and the user is able to begin their session.
     */
    projectReady() {
        this.emit<PluginManagerEvents, void>( 'editor-ready' );
    }

    /**
     * Creates a thumbnail preview of the file
     */
    thumbnail( file: HatcheryServer.IFile ): Promise<HTMLCanvasElement> | null {
        let toRet;
        const factories = this._previewVisualizers;
        for ( let i = 0, l = factories.length; i < l; i++ ) {
            toRet = factories[ i ].thumbnail( file );
            if ( toRet )
                return toRet;
        }

        return null;
    }


    /**
     * This function generates a React Element that is used to preview a file
     * @param file The file we are looking to preview
     * @returns If a React Element is returned is added in the File viewer preview
     */
    displayPreview( file: HatcheryServer.IFile ): JSX.Element | null {
        let toRet;
        const factories = this._previewVisualizers;
        for ( let i = 0, l = factories.length; i < l; i++ ) {
            toRet = factories[ i ].generate( file );
            if ( toRet )
                return toRet;
        }

        return null;
    }

    get assetTemplates(): AssetTemplate[] { return this._assetTemplates; }
    get loadedPlugins(): IPlugin[] { return this._loadedPlugins; }
    get behaviourTemplates(): BehaviourDefinition[] { return this._behaviourTemplates; }

    /**
     * Gets the singleton instance.
     */
    static getSingleton() {
        if ( !PluginManager._singleton )
            new PluginManager();

        return PluginManager._singleton;
    }
}