var Animate;
(function (Animate) {
    /**
    * A small object that represents a file that is associated with a project.
    */
    var File = (function () {
        /**
        * @param {string} name The name of the file
        * @param {string} path The path of the file on the server
        * @param {string} tags Keywords associated with the file to help search for it.This is a string
        * with values separated by commas
        * @param {string} createdOn The date this file was created on
        * @param {string} lastModified The date this file was last modified
        * @param {string} id The id of the file
        * @param {number} size The size of the file
        * @param {string} favourite Is this file a favourite
        * @param {string} preview_path The path of the file thumbnail on the server
        * @param {number} global Is this file globally accessible
        */
        function File(name, path, tags, id, createdOn, lastModified, size, favourite, preview_path, global) {
            this.id = id;
            this.name = name;
            this.path = path;
            this.global = global;
            this.preview_path = preview_path;
            this.tags = (tags == "" ? [] : tags.split(","));
            this.extension = "";

            var splitData = path.split(".");
            if (splitData.length > 0)
                this.extension = splitData[splitData.length - 1].toLowerCase();
else
                this.extension = "";

            this.size = (isNaN(size) ? 0 : size);
            this.createdOn = createdOn;
            this.lastModified = lastModified;
            this.favourite = (favourite == null || favourite == "" ? "false" : favourite);
        }
        /**
        * Disposes and cleans the object
        */
        File.prototype.dispose = function () {
            this.id = null;
            this.name = null;
            this.path = null;
            this.path = null;
            this.global = null;
            this.preview_path = null;
            this.extension = null;
        };
        return File;
    })();
    Animate.File = File;
})(Animate || (Animate = {}));
//# sourceMappingURL=File.js.map
