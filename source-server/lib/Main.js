/// <reference path="node.d.ts" />
/// <reference path="mongodb.d.ts" />
/// <reference path="Project.ts" />
/// <reference path="Server.ts" />
define(["require", "exports", "http"], function(require, exports, http) {
    // Create the http server
    http.createServer(function (req, res) {
        res.writeHead(200, { "content-type": "text/plain" });
        res.end("hello world\n");
    }).listen(1337, "127.0.0.1");

    console.log("Server running at http://127.0.0.1:1337/");
});
