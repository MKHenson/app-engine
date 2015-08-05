var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Animate;
(function (Animate) {
    var LoaderEvents = (function (_super) {
        __extends(LoaderEvents, _super);
        function LoaderEvents(v) {
            _super.call(this, v);
        }
        LoaderEvents.COMPLETE = new LoaderEvents("complete");
        LoaderEvents.FAILED = new LoaderEvents("failed");
        return LoaderEvents;
    })(Animate.ENUM);
    Animate.LoaderEvents = LoaderEvents;

    var ServerResponses = (function (_super) {
        __extends(ServerResponses, _super);
        function ServerResponses(v) {
            _super.call(this, v);
        }
        ServerResponses.SUCCESS = new ServerResponses("success");
        ServerResponses.ERROR = new ServerResponses("error");
        return ServerResponses;
    })(Animate.ENUM);
    Animate.ServerResponses = ServerResponses;

    var AnimateServerEvent = (function (_super) {
        __extends(AnimateServerEvent, _super);
        function AnimateServerEvent(eventName, message, return_type, data) {
            _super.call(this, eventName, data);
            this.message = message;
            this.return_type = return_type;
        }
        return AnimateServerEvent;
    })(Animate.Event);
    Animate.AnimateServerEvent = AnimateServerEvent;

    /**
    * This class acts as an interface to our server. It also helps with displaying a mouse blocking loader.
    */
    var Loader = (function (_super) {
        __extends(Loader, _super);
        function Loader() {
            // Call super-class constructor
            _super.call(this);

            if (!Loader.loaderBackdrop)
                Loader.loaderBackdrop = Loader.createLoaderModal();

            this.url = null;
            this.postVars = null;
            this.numTries = null;
            this.async = true;
            this.curCall = null;
            this.dataType = "json";
        }
        Loader.createLoaderModal = /**
        * Call this function to create a jQuery object that acts as a loader modal window (the window with the spinning cog)
        * @returns {JQuery}
        */
        function () {
            if (!Loader.loaderBackdrop) {
                var str = "<div class='modal-backdrop dark-color'><div class='logo-container'>" + "<div class='logo-1 animated-logo loader-cog-slow'><img src='media/logo-1.png'/></div>" + "<div class='logo-2 animated-logo loader-cog'><img src='media/logo-2.png'/></div>" + "<div class='logo-3 animated-logo loader-cog-slow'><img src='media/logo-3.png'/></div>" + "<div class='logo-4 animated-logo'><img src='media/logo-4.png'/></div>" + "<div class='logo-5 animated-logo'><span class='loader-text'>LOADING</span></div>" + "</div></div>";

                //return jQuery("<div style='background-color:#FFF' class='modal-backdrop dark-color'><img class='loader-cog' style='margin-left:30%; margin-top:30%;' src='media/cog.png' /></div>");
                Loader.loaderBackdrop = jQuery(str);
            }

            return Loader.loaderBackdrop;
        };

        Loader.showLoader = /**
        * Shows the loader backdrop which prevents the user from interacting with the application. Each time this is called a counter
        * is incremented. To hide it call the hideLoader function. It will only hide the loader if the hideLoader is called the same
        * number of times as the showLoader function. I.e. if you call showLoader 5 times and call hideLoader 4 times, it will not hide
        * the loader. If you call hideLoader one more time - it will.
        */
        function () {
            if (!Loader.loaderBackdrop)
                Loader.createLoaderModal();

            Loader.loaderBackdrop.show();
            jQuery("body").append(Loader.loaderBackdrop);
            Loader.showCount++;

            jQuery(".loader-text", Loader.loaderBackdrop).text("LOADING: " + Loader.showCount + "%...");
        };

        Loader.hideLoader = /**
        * see showLoader for information on the hideLoader
        */
        function () {
            Loader.showCount--;

            jQuery(".loader-text", Loader.loaderBackdrop).text("LOADING: " + Loader.showCount + "%...");

            if (Loader.showCount == 0)
                Loader.loaderBackdrop.remove();
        };

        /**
        * This function will call a post URL
        * @param {string} url The URL we want to load
        * @param {any} postVars The object post variables
        * @param {boolean} async Bool to set this to synchronous or not
        * @param {number} numTries The number of attempts allowed to make this load
        */
        Loader.prototype.load = function (url, postVars, async, numTries) {
            if (typeof async === "undefined") { async = true; }
            if (typeof numTries === "undefined") { numTries = 3; }
            this.async = async;
            this.url = url;
            this.postVars = postVars;
            this.numTries = numTries;

            Loader.loaderBackdrop.show();
            Animate.Application.getInstance().element.append(Loader.loaderBackdrop);

            this.curCall = jQuery.ajax({
                url: this.url,
                async: this.async,
                type: 'POST',
                dataType: this.dataType,
                crossDomain: true,
                cache: true,
                accepts: 'text/plain',
                data: this.postVars,
                success: this.onData.bind(this),
                error: this.onError.bind(this)
            });
        };

        /**
        * Called when we the ajax response has an error.
        * @param {any} e
        * @param {string} textStatus
        * @param {any} errorThrown
        */
        Loader.prototype.onError = function (e, textStatus, errorThrown) {
            if (this.numTries > 0) {
                if (this.numTries > 0)
                    this.numTries--;

                this.curCall = $.ajax({
                    url: this.url,
                    async: this.async,
                    type: 'POST',
                    dataType: this.dataType,
                    crossDomain: true,
                    cache: true,
                    accepts: 'text/plain',
                    data: this.postVars,
                    success: this.onData.bind(this),
                    error: this.onError.bind(this)
                });
            } else {
                if (Loader.showCount == 0)
                    Loader.loaderBackdrop.remove();

                this.url = null;
                this.postVars = null;
                this.numTries = null;
                this.curCall = null;
                var e = new AnimateServerEvent(LoaderEvents.FAILED, errorThrown.message, ServerResponses.ERROR, null);
                this.dispatchEvent(e);
                this.dispose();
            }
        };

        /**
        * Called when we get an ajax response.
        * @param {any} data
        * @param {any} textStatus
        * @param {any} jqXHR
        */
        Loader.prototype.onData = function (data, textStatus, jqXHR) {
            if (Loader.showCount == 0)
                Loader.loaderBackdrop.remove();

            var e = null;
            if (this.dataType == "text")
                e = new AnimateServerEvent(LoaderEvents.COMPLETE, "Script Loaded", ServerResponses.SUCCESS, null);
else if (this.dataType == "json")
                e = new AnimateServerEvent(LoaderEvents.COMPLETE, data.message, Animate.ENUM.fromString(data.return_type), data);
else
                e = new AnimateServerEvent(LoaderEvents.COMPLETE, "Loaded", ServerResponses.SUCCESS, data);

            this.dispatchEvent(e);

            this.url = null;
            this.postVars = null;
            this.numTries = null;
            this.curCall = null;
            this.dispose();
        };

        /**
        * Cleans up the object
        */
        Loader.prototype.dispose = function () {
            //Call super
            _super.prototype.dispose.call(this);

            this.url = null;
            this.postVars = null;
            this.numTries = null;
            this.async = true;
            this.curCall = null;
            this.dataType = null;
        };
        Loader.showCount = 0;
        return Loader;
    })(Animate.EventDispatcher);
    Animate.Loader = Loader;
})(Animate || (Animate = {}));
//# sourceMappingURL=Loader.js.map
