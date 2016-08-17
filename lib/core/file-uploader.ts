module Animate {
    export type ProgressCallback = (percent: number) => void;
    export type CompleteCallback = (err?: Error, files?: Array<UsersInterface.IUploadToken>) => void;

    /*
    * A class that assembles data & files into a form and sends it as an XHR request to a server
    */
    export class FileUploader {
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
        constructor(onProg?: ProgressCallback, onComp?: CompleteCallback ) {
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
        get numDownloads(): number {
            return this._downloads.length;
        }

       /*
       * Uploads a file to the users storage api
       * @param {File} file The file we are uploading
       * @param {string} url The URL to use
       * @param {any} meta [Optional] Any additional meta to be associated with the upload
       * @param {string} parentFile [Optional] Sets the parent file of the upload. If the parent file is deleted - then this file is deleted as well
       */
        uploadFile(file: File, meta?: any, parentFile?: string) {
            var formData = new FormData();

            // Attaching meta
            if (meta)
                formData.append('meta', JSON.stringify(meta));

            formData.append(file.name, file);
            this.upload(formData, null, file.name, parentFile);
        }

       /*
       * Uploads an image or canvas as a png or jpeg
       * @param {HTMLImageElement | HTMLCanvasElement} img The image or canvas to upload
       * @param {string} name The name to give it
       * @param {Engine.IFileMeta} meta [Optional] Any additional meta to be associated with the upload
       * @param {string} parentFile [Optional] Sets the parent file of the upload. If the parent file is deleted - then this file is deleted as well
       */
        upload2DElement(img: HTMLImageElement | HTMLCanvasElement, name: string, meta?: Engine.IFileMeta, parentFile?: string)  {
            var canvas: HTMLCanvasElement;

            if (img instanceof HTMLImageElement) {
                // Create an empty canvas element
                canvas = document.createElement("canvas");
                canvas.width = img.width;
                canvas.height = img.height;

                // Copy the image contents to the canvas
                var ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0);
            }
            else
                canvas = <HTMLCanvasElement>img;

            // Get the data-URL formatted image
            // Firefox supports PNG and JPEG. You could check img.src to
            // guess the original format, but be aware the using "image/jpg"
            // will re-encode the image.
            var dataURL = canvas.toDataURL();

            // Convert the dataURL to pure base 64
            //var byteString = dataURL.replace(/^data:image\/(png|jpg);base64,/, "");

            // convert base64 to raw binary data held in a string
            // doesn't handle URLEncoded DataURIs - see SO answer #6850276 for code that does this
            var byteString = atob(dataURL.split(',')[1]);

            // separate out the mime component
            var mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];

            // Write the bytes of the string to an ArrayBuffer
            var ab = new ArrayBuffer(byteString.length);
            var ia = new Uint8Array(ab);
            for (var i = 0; i < byteString.length; i++)
                ia[i] = byteString.charCodeAt(i);

            // Create the blob and set the buffer
            var blob: Blob;
            if (dataURL.indexOf("png"))
                blob = new Blob([ab], { type: mimeString });
            else
                blob = new Blob([ab], { type: mimeString });

            var formData = new FormData();

            // Attaching meta
            if (meta)
                formData.append('meta', JSON.stringify(meta));

            formData.append( name, blob );
            this.upload(formData, null, name, parentFile);
        }

        /*
       * Uploads a file to the users storage api
       * @param {ArrayBuffer} array The array we are uploading
       * @param {string} name The name to give it
       * @param {any} meta [Optional] Any additional meta to be associated with the upload
       * @param {string} parentFile [Optional] Sets the parent file of the upload. If the parent file is deleted - then this file is deleted as well
       */
        uploadArrayBuffer(array: ArrayBuffer, name: string, meta?: any, parentFile?: string ) {
            var formData = new FormData();

            // Attaching meta
            if (meta)
                formData.append('meta', JSON.stringify(meta));

            formData.append(name, new Blob([array], { type: "application/octet-stream" }));
            return this.upload(formData, null, name, parentFile);
        }

        /*
        * Uploads text and saves it as a file on the server
        * @param {string} text The text to upload
        * @param {string} name The name to give it
        * @param {any} meta [Optional] Any additional meta to be associated with the upload
        * @param {string} parentFile [Optional] Sets the parent file of the upload. If the parent file is deleted - then this file is deleted as well
        */
        uploadTextAsFile(text: string, name: string, meta?: any, parentFile?: string) {
            var formData = new FormData();

            // Attaching meta
            if (meta)
                formData.append('meta', JSON.stringify(meta));

            // Attaching text
            formData.append(name, new Blob([text], { type: "text/plain" }));
            return this.upload(formData, null, name, parentFile);
        }

        /*
        * Uploads a file to the users storage api
        * @param {FormData} file The file we are uploading
        * @param {string} url The URL to use
        * @param {string} identifier Helps identify the upload
        * @param {string} parentFile [Optional] Sets the parent file of the upload. If the parent file is deleted - then this file is deleted as well
        */
        upload(form: FormData, url: string, identifier: string, parentFile?: string) {
            if (!url) {
                var details = User.get.entry;
                url = `${DB.USERS}/buckets/${details.username}-bucket/upload` + (parentFile ? "/" + parentFile : "");
            }

            var that = this;
            var xhr = new XMLHttpRequest();
            var id = that._dCount++;
            var cb = that._onProg;
            var comp = that._onComplete;
            var errorMsg: string = null;

            // Add the download token
            that._downloads.push( { id: id, loaded: 0, total: 0 } );

            var calcProgress = function() {
                if (!cb)
                    return;

                // Calculate the percentages
                var total = 0;
                var loaded = 0;

                for (var i = 0, l = that._downloads.length; i < l; i++) {
                    total += that._downloads[i].total;
                    loaded += that._downloads[i].loaded;
                }

                if (total == 0)
                    that.percent = 100;
                else
                    that.percent = Math.floor(loaded / total * 1000) / 10;

                cb(that.percent);
            }

            xhr.onerror = function (ev) {
                // Remove the download from the array
                for (var i = 0, l = that._downloads.length; i < l; i++)
                    if (that._downloads[i].id == id) {
                        that._downloads.splice(i, 1);
                        break;
                    }

                errorMsg = `An error occurred while uploading the file '${identifier}' : `;
                calcProgress();
            };

            if (cb && xhr.upload) {
                xhr.upload.onprogress = function (e) {
                    for (var i = 0, l = that._downloads.length; i < l; i++)
                        if (that._downloads[i].id == id) {
                            that._downloads[i].total = e.total;
                            that._downloads[i].loaded = e.loaded;
                            break;
                        }

                    calcProgress();
                };
            }

            xhr.onreadystatechange = function () {
                // Every thing ok, file uploaded
                if (xhr.readyState == 4) {
                    // Remove the download from the array
                    for (var i = 0, l = that._downloads.length; i < l; i++)
                        if (that._downloads[i].id == id) {
                            that._downloads.splice(i, 1);
                            break;
                        }

                    // Re-calc percentages
                    calcProgress();

                    if (xhr.status !== 200) {
                        errorMsg = "XHR returned response code : " + xhr.status;

                        if (that._downloads.length == 0 && comp)
                            comp(new Error(errorMsg), null);
                    }
                    else {
                        var data: UsersInterface.IUploadResponse = JSON.parse(xhr.responseText);

                        if (data.error) {
                            errorMsg = data.message;
                            comp(new Error(errorMsg), null);
                        }
                        else {
                            if (that._downloads.length == 0) {
                                if (comp) {
                                    if (errorMsg)
                                        comp(new Error(errorMsg), null);
                                    else
                                        comp(null, data.tokens);
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