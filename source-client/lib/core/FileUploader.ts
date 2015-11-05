module Animate
{
    export type ProgressCallback = (percent: number) => void;
    export type CompleteCallback = (err?: Error) => void;
     
    /*
    * A class that assembles data & files into a form and sends it as an XHR request to a server
    */
    export class FileUploader
    {
        private _dCount: number;
        private _downloads: Array<{ id: number; total: number; loaded: number; }>;
        public percent: number;
        
        private _onProg: ProgressCallback;
        private _onComplete: CompleteCallback;

        /*
        * Creates an instance of the class
        * @param {ProgressCallback} onProg Called when progress is made in the upload
        * @param {CompleteCallback} onComp Called when all uploads are complete
        */
        constructor(onProg?: ProgressCallback, onComp?: CompleteCallback )
        {
            this.percent = 0;
            this._dCount = 0;
            this._onProg = onProg;
            this._onComplete = onComp;
            this._downloads = [];
        }

        /*
        * Returns the number of active downloads
        * @returns {number}
        */
        get numDownloads(): number
        {
            return this._downloads.length;
        }

       /*
       * Uploads a file to the users storage api
       * @param {File} file The file we are uploading
       * @param {string} url The URL to use
       * @param {any} meta [Optional] Any additional meta to be associated with the upload
       */
        uploadFile(file: File, url: string, meta?: any)
        {
            var formData = new FormData();

            // Attaching meta
            if (meta)
                formData.append('meta', JSON.stringify(meta));

            //// Attaching text
            //var content = 'Some user defined text!';
            //var blob = new Blob([content], { type: "text/plain" });
            //formData.append('text-example', blob);

            //// Attaching array buffer
            //var ab = new ArrayBuffer(1024);
            //var v = new Uint8Array(ab);
            //for (var i = 0; i < 1024; i++)
            //    v[i] = 0x78;
            //var b = new Blob([ab], { type: "application/octet-stream" });
            //formData.append('buffer-example', b);

            formData.append(file.name, file);

            return this.upload(formData, url, file.name);
        }
        
        getBase64Image(img: HTMLImageElement): string
        {
            // Create an empty canvas element
            var canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;

            // Copy the image contents to the canvas
            var ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);

            // Get the data-URL formatted image
            // Firefox supports PNG and JPEG. You could check img.src to
            // guess the original format, but be aware the using "image/jpg"
            // will re-encode the image.
            var dataURL = canvas.toDataURL("image/png");

            var byteString = dataURL.replace(/^data:image\/(png|jpg);base64,/, "");

            // write the bytes of the string to an ArrayBuffer
            var ab = new ArrayBuffer(byteString.length);
            var ia = new Uint8Array(ab);
            for (var i = 0; i < byteString.length; i++)
                ia[i] = byteString.charCodeAt(i);

            // write the ArrayBuffer to a blob, and you're done
            var bb = new Blob([ab]);

            return byteString;
        }

        /*
       * Uploads a file to the users storage api
       * @param {ArrayBuffer} array The array we are uploading
       * @param {string} name The name to give it
       * @param {string} url The URL to use
       * @param {any} meta [Optional] Any additional meta to be associated with the upload
       */
        uploadArrayBuffer(array: ArrayBuffer, name : string, url: string, meta?: any)
        {
            var formData = new FormData();

            // Attaching meta
            if (meta)
                formData.append('meta', JSON.stringify(meta));
            
            formData.append(name, new Blob([array], { type: "application/octet-stream" }));
            return this.upload(formData, url, name);
        }

        /*
        * Uploads text and saves it as a file on the server
        * @param {string} text The text to upload
        * @param {string} name The name to give it
        * @param {string} url The URL to use
        * @param {any} meta [Optional] Any additional meta to be associated with the upload
        */
        uploadTextAsFile(text: string, name: string, url: string, meta?: any)
        {
            var formData = new FormData();

            // Attaching meta
            if (meta)
                formData.append('meta', JSON.stringify(meta));

            // Attaching text
            formData.append(name, new Blob([text], { type: "text/plain" }));
            return this.upload(formData, url, name);
        }

        /*
        * Uploads a file to the users storage api
        * @param {FormData} file The file we are uploading
        * @param {string} url The URL to use
        */
        upload(form: FormData, url: string, identifier: string)
        {
            var that = this;
            var xhr = new XMLHttpRequest();
            var id = that._dCount++;
            var cb = that._onProg;
            var comp = that._onComplete;
            var errorMsg: string = null;

            // Add the download token
            that._downloads.push( { id: id, loaded: 0, total: 0 } );
            
            var calcProgress = function()
            {
                if (!cb)
                    return;

                // Calculate the percentages
                var total = 0;
                var loaded = 0;

                for (var i = 0, l = that._downloads.length; i < l; i++)
                {
                    total += that._downloads[i].total;
                    loaded += that._downloads[i].loaded;
                }

                that.percent = Math.floor(loaded / total * 1000) / 10;
                cb(that.percent);
            }

            xhr.onerror = function (ev)
            {
                // Remove the download from the array
                for (var i = 0, l = that._downloads.length; i < l; i++)
                    if (that._downloads[i].id == id)
                    {
                        that._downloads.splice(i, 1);
                        break;
                    }
                
                errorMsg = `An error occurred while uploading the file '${identifier}' : `;
                calcProgress();
            };

            if (cb && xhr.upload)
            {
                xhr.upload.onprogress = function (e)
                {
                    for (var i = 0, l = that._downloads.length; i < l; i++)
                        if (that._downloads[i].id == id)
                        {
                            that._downloads[i].total = e.total;
                            that._downloads[i].loaded = e.loaded;
                            break;
                        }

                    calcProgress();
                };
            }

            xhr.onreadystatechange = function ()
            {
                // Every thing ok, file uploaded
                if (xhr.readyState == 4)
                {
                    // Remove the download from the array
                    for (var i = 0, l = that._downloads.length; i < l; i++)
                        if (that._downloads[i].id == id)
                        {
                            that._downloads.splice(i, 1);
                            break;
                        }

                    // Re-calc percentages
                    calcProgress();

                    if (xhr.status !== 200)
                        errorMsg = "XHR returned response code : " + xhr.status;
                    else
                    {
                        var data: UsersInterface.IResponse = JSON.parse(xhr.responseText);

                        if (data.error)
                            errorMsg = data.message;
                        else
                        {
                            if (that._downloads.length == 0)
                            {
                                if (comp)
                                {
                                    if (errorMsg)
                                        comp(new Error(errorMsg));
                                    else
                                        comp();
                                }
                            }
                        }
                    }
                }
            };
            
            xhr.withCredentials = true;
            xhr.open("post", url, true);
            xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
            //xhr.setRequestHeader("X-File-Name", encodeURIComponent(file.name));
            xhr.setRequestHeader("Cache-Control", "no-cache");
            //xhr.setRequestHeader("X-Mime-Type", file.type);
            xhr.send(form);
        }
    }
}