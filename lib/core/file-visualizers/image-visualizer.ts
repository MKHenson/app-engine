module Animate {
    export class ImageVisualizer implements IPreviewFactory {
        private _maxPreviewSize: number;

        constructor() {
            this._maxPreviewSize = 200;
        }

        /**
        * This function generates an html node that is used to preview a file
        * @param {Engine.IFile} file The file we are looking to preview
        * @param {(file: Engine.IFile, image: HTMLCanvasElement | HTMLImageElement) => void} updatePreviewImg A function we can use to update the file's preview image
        * @returns {Node} If a node is returned, the factory is responsible for showing the preview. The node will be added to the DOM. If null is returned then the engine
        * will continue looking for a factory than can preview the file
        */
        generate(file: Engine.IFile, updatePreviewImg: (file: Engine.IFile, image: HTMLCanvasElement | HTMLImageElement) => void): Node {
            if (file.extension == "image/jpeg" || file.extension == "image/png" || file.extension == "image/gif" || file.extension == "image/bmp" || file.extension == "image/jpg") {
                var size = this._maxPreviewSize;
                var k = document.createDocumentFragment();
                var d = <HTMLDivElement>k.appendChild(document.createElement("div"));
                d.innerHTML = `<div class="img-preview"><div class="preview-child background-tiles"><div class="inner"><img class="vert-align" src="${file.url}" /><div class="div-center"></div></div></div></div>`;

                // If no preview exists, lets create one
                if (!file.previewUrl || file.previewUrl.toString().trim() == "") {
                    var img = <HTMLImageElement>d.querySelector("img");
                    img.crossOrigin = "Anonymous";
                    img.onload = function(e) {
                        // Resize the image
                        var canvas = document.createElement('canvas'),
                            width = img.naturalWidth,
                            height = img.naturalHeight;

                        if (width > height) {
                            if (width > size) {
                                height *= size / width;
                                width = size;
                            }
                        }
                        else {
                            if (height > size) {
                                width *= size / height;
                                height = size;
                            }
                        }

                        canvas.width = width;
                        canvas.height = height;
                        canvas.getContext('2d').drawImage(img, 0, 0, width, height);

                        // Once the image is loaded - we upload a preview of the image
                        updatePreviewImg(file, canvas);
                    };
                }

                return k.firstChild;
            }

            return null;
        }
    }
}