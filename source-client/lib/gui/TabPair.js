var Animate;
(function (Animate) {
    /**
    * This class is a small container class that is used by the Tab class. It creates TabPairs
    * each time a tab is created with the addTab function. This creates a TabPair object that keeps a reference to the
    * label and page as well as a few other things.
    */
    var TabPair = (function () {
        function TabPair(tab, page, name) {
            this.tabSelector = tab;
            this.page = page;
            this.name = name;
        }
        /**
        * Called when the editor is resized
        */
        TabPair.prototype.onResize = function () {
        };

        /**
        * Called by the tab class when the pair is to be removed.
        * @param {TabEvent} data An object that can be used to cancel the operation. Simply call data.cancel = true to cancel the closure.
        */
        TabPair.prototype.onRemove = function (data) {
        };

        /**
        * Called by the tab when the save all button is clicked
        */
        TabPair.prototype.onSaveAll = function () {
        };

        /**
        * Called when the pair has been added to the tab
        */
        TabPair.prototype.onAdded = function () {
        };

        /**
        * Called when the pair has been selected
        */
        TabPair.prototype.onSelected = function () {
        };


        Object.defineProperty(TabPair.prototype, "text", {
            get: /**
            * Gets the label text of the pair
            */
            function () {
                return jQuery(".text", this.tabSelector.element).text();
            },
            set: /**
            * Sets the label text of the pair
            */
            function (text) {
                jQuery(".text", this.tabSelector.element).text(text);
            },
            enumerable: true,
            configurable: true
        });

        /**
        * Cleans up the references
        */
        TabPair.prototype.dispose = function () {
            this.tabSelector.dispose();
            this.page.dispose();

            this.tabSelector = null;
            this.page = null;
            this.name = null;
        };
        return TabPair;
    })();
    Animate.TabPair = TabPair;
})(Animate || (Animate = {}));
//# sourceMappingURL=TabPair.js.map
