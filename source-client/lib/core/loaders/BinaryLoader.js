var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
define(["require", "exports"], function(require, exports) {
    var BinaryLoader = (function (_super) {
        __extends(BinaryLoader, _super);
        function BinaryLoader() {
            _super.call(this);
        }
        BinaryLoader.prototype.downloadFile = function (url, view) {
            var xhr = new XMLHttpRequest();

            xhr.addEventListener('load', function (event) {
                var buffer = xhr.response;

                // IEWEBGL needs this
                if (buffer === undefined)
                    buffer = (new Uint8Array(xhr.responseBody)).buffer;

                // Buffer not loaded, so manually fill it by converting the string data to bytes
                if (buffer.byteLength == 0) {
                    // iOS and other XMLHttpRequest level 1
                    buffer = new ArrayBuffer(xhr.responseText.length);
                    var bufView = new Uint8Array(buffer);

                    for (var i = 0, l = xhr.responseText.length; i < l; i++)
                        bufView[i] = xhr.responseText.charCodeAt(i) & 0xff;
                }
                // Array buffer now filled
            }, false);

            if (callbackProgress !== undefined) {
                xhr.addEventListener('progress', function (event) {
                    if (event.lengthComputable) {
                        callbackProgress(event);
                    }
                }, false);
            }

            xhr.addEventListener('error', function (event) {
                console.error("THREE.BinaryLoader: Couldn't load [" + url + "] [" + xhr.status + "]");
            }, false);

            xhr.returnType = "arraybuffer";

            if (xhr.overrideMimeType)
                xhr.overrideMimeType("text/plain; charset=x-user-defined");

            xhr.send(null);
            xhr.open("GET", url, true);
        };
        return BinaryLoader;
    })(LoaderBase);
    exports.BinaryLoader = BinaryLoader;
});
//# sourceMappingURL=BinaryLoader.js.map
