declare module Animate
{
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
}