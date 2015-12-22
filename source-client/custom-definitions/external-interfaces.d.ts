declare module Animate
{
    /**
	* The IPlugin interface defines how a plugin interacts with app-engine
	*/
    export interface IPlugin
    {
		/**
		* This function is called by Animate to get an array of
		* behvaiour definitions. These definitions describe what kind
		* behvaiours a user can create in the scene.
		* @returns {Array<BehaviourDefinition>}
		*/
        getBehaviourDefinitions(): Array<BehaviourDefinition>;

		/**
		* This function is called when we need to create a preview for a file that is associated with a project
		* @param {File} file The file that needs to be previewed
		* @param {Component} previewComponent The component which will act as the parent div of the preview.
		* @returns {boolean} Return true if this is handled or false if not.
		*/
        onDisplayPreview(file: Engine.IFile, previewComponent: Component): boolean;
        
		/**
		* This function is called by Animate to get an array of TypeConverters. TypeConverter objects define if one type can be translated to another. They also define what the process of conversion will be.
		*/
        getTypeConverters(): Array<TypeConverter>;

		/**
		* This function is called by Animate to get an array of 
		* AssetsTemplate. The AssetsTemplate object is used to define what assets are available to the scene.
		* Assets are predefined tempaltes of data that can be instantiated. The best way to think of an asset
		* is to think of it as a predefined object that contains a number of variables. You could for example
		* create Assets like cats, dogs, animals or humans. Its really up you the plugin writer how they want
		* to define their assets. This function can return null if no Assets are required.
		* @returns <Array> Returns an array of <AssetTemplate> objects
		*/
        getAssetsTemplate(): Array<AssetTemplate>;
		
		/**
		* This function is called by Animate when its time to unload a plugin. This should be used
		* to cleanup all resources used by the plugin
		*/
        unload(): void;

		/**
		* Plugins can return an array of extensions that are allowed to be uploaded for Asset files. For example
		* your plugin might require images and so would allow png and jpg files.
		* Each extension must just be in the following format: ["png", "jpg" ..etc]
		* @param {Array<string>} extArray The array of allowed extensions that are so far allowed.
		* @returns {Array<string>} An array of allowed file extensions.
		*/
        getFileUploadExtensions(extArray: Array<string>): Array<string>;
    }

    /**
	* A basic wrapper for a Portal interface
	*/
    export class IPortal
    {
        name: string;
        type: number;
        custom: boolean;
        property: any;
    }

    /**
	* A basic wrapper for a CanvasItem interface
	*/
    export interface ICanvasItem
    {
        shallowId: number;
        type: number;
        left?: string;
        top?: string;
    }

    /**
	* A basic wrapper for a Link interface
	*/
    export interface ILinkItem extends ICanvasItem
    {
        frameDelay: number;
        startPortal: string;
        endPortal: string;
        startBehaviour: number;
        endBehaviour: number;
    }

    /**
	* A basic wrapper for a Behaviour interface
	*/
    export interface IBehaviour extends ICanvasItem
    {
        alias: string;
        text: string;
        portals: Array<IPortal>
    }

    /**
    * A basic wrapper for a BehaviourPortal interface
    */
    export interface IBehaviourPortal extends IBehaviour
    {
        portal: IPortal;
    }

    /**
	* A basic wrapper for a BehaviourScript interface
	*/
    export interface IBehaviourScript extends IBehaviour
    {
        scriptId: string;
    }

    /**
	* A basic wrapper for a BehaviourShortcut interface
	*/
    export interface IBehaviourShortcut extends IBehaviour
    {
        shallowId: number;
    }

    /**
	* A basic interface for a container object
	*/
    export interface IContainerToken
    {
        items: Array<ICanvasItem>;
        properties: any;
    }

    export interface IPreviewFactory
    {
        /**
        * This function generates an html node that is used to preview a file
        * @param {Engine.IFile} file The file we are looking to preview
        * @param {(file: Engine.IFile, image: HTMLCanvasElement | HTMLImageElement) => void} updatePreviewImg A function we can use to update the file's preview image
        * @returns {Node} If a node is returned, the factory is responsible for showing the preview. The node will be added to the DOM. If null is returned then the engine
        * will continue looking for a factory than can preview the file
        */
        generate(file: Engine.IFile, updatePreviewImg: (file: Engine.IFile, image: HTMLCanvasElement | HTMLImageElement) => void): Node;
    }

    export interface ISettingsPage extends IComponent
    {
        onShow(project: Project, user: User);
        name: string;
        onTab(): void;
    }
}