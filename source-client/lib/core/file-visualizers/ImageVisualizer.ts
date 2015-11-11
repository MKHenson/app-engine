module Animate
{
    export class ImageVisualizer
    {
        private _maxPreviewSize: number;

        constructor()
        {
            this._maxPreviewSize = 200;
        }

        /**
        * This function generates some an html node that is used to preview a file
        */
        generate(file: Engine.IFile): Node
        {
            if (file.extension == "image/jpeg" || file.extension == "image/png" || file.extension == "image/gif" || file.extension == "image/bmp" || file.extension == "image/jpg")
            {
                var size = this._maxPreviewSize;
                var k = document.createDocumentFragment();
                var d = <HTMLDivElement>k.appendChild(document.createElement("div"));
                d.innerHTML = `<div class="img-preview"><div class="preview-child background-tiles"><div class="inner"><img class="vert-align" src="${file.url}" /><div class="div-center"></div></div></div></div>`;

                // If no preview exists, lets create one
                if (!file.previewUrl || file.previewUrl.toString().trim() == "")
                {
                    var img = <HTMLImageElement>d.querySelector("img");
                    img.crossOrigin = "Anonymous";
                    img.onload = function(e)
                    {
                        // Resize the image
                        var canvas = document.createElement('canvas'),
                            width = img.width,
                            height = img.height;

                        if (width > height)
                        {
                            if (width > size)
                            {
                                height *= size / width;
                                width = size;
                            }
                        }
                        else
                        {
                            if (height > size)
                            {
                                width *= size / height;
                                height = size;
                            }
                        }

                        canvas.width = width;
                        canvas.height = height;
                        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
                        FileViewerForm.getSingleton().uploadPreview(canvas, file);
                    };
                }

                return k.firstChild;
            }

            return null;
        }
    }
}