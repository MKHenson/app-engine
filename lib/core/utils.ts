module Animate {
    export interface IAjaxError { message: string; status: number; };

    export class Utils {
        private static _withCredentials: boolean = true;
        private static shallowIds: number = 0;

        /**
        * Generates a new shallow Id - an id that is unique only to this local session
        * @param {number} reference Pass a reference id to make sure the one generated is still valid. Any ID that's imported can potentially offset this counter.
        * @returns {number}
        */
        static generateLocalId(reference?: number): number {
            // Make sure the ID is always really high - i.e. dont allow for duplicates
            if (reference !== undefined && reference > Utils.shallowIds) {
                Utils.shallowIds = reference + 1;
                return reference;
            }

            Utils.shallowIds++;
            return Utils.shallowIds;
        }

        /**
         * Capitalizes the first character of a string
         * @param {string} str
         * @returns {string}
         */
        static capitalize( str : string ): string {
            return str.charAt(0).toUpperCase() + str.slice(1);
        }

        /**
        * A predefined shorthand method for calling put methods that use JSON communication
        */
        static post<T>(url: string, data: any): Promise<T> {
            return new Promise(function(resolve, reject) {
                var xhttp = new XMLHttpRequest();
                xhttp.onreadystatechange = function () {
                    if (xhttp.readyState == 4) {
                        if (xhttp.status == 200) {
                            var json = JSON.parse(xhttp.responseText);
                            return resolve(json);
                        }
                        else
                            return reject(<IAjaxError>{ message: xhttp.statusText, status: xhttp.status });
                    }
                };

                xhttp.open("POST", url, true);

                var str;
                if (data) {
                    str = JSON.stringify(data);
                    xhttp.setRequestHeader('Content-type', 'application/json; charset=utf-8');
                }

                xhttp.withCredentials = Utils._withCredentials;
                xhttp.send(str);

            });

            // Associate the uploaded preview with the file
            //return jQuery.ajax(url, { type: "post", data: JSON.stringify(data), contentType: 'application/json;charset=UTF-8', dataType: "json" });
        }

        /**
        * A predefined shorthand method for calling put methods that use JSON communication
        */
        static get<T>(url: string): Promise<T> {
            return new Promise(function (resolve, reject) {
                var xhttp = new XMLHttpRequest();
                xhttp.onreadystatechange = function () {
                    if (xhttp.readyState == 4) {
                        if (xhttp.status == 200) {
                            var json = JSON.parse(xhttp.responseText);
                            return resolve(json);
                        }
                        else
                            return reject(<IAjaxError>{ message: xhttp.statusText, status: xhttp.status });
                    }
                };

                xhttp.open("GET", url, true);
                xhttp.withCredentials = Utils._withCredentials;
                xhttp.send();
            });
        }

        /**
        * A predefined shorthand method for calling put methods that use JSON communication
        */
        static put<T>(url: string, data: any): Promise<T> {
            return new Promise(function (resolve, reject) {
                var xhttp = new XMLHttpRequest();
                xhttp.onreadystatechange = function () {
                    if (xhttp.readyState == 4) {
                        if (xhttp.status == 200) {
                            var json = JSON.parse(xhttp.responseText);
                            return resolve(json);
                        }
                        else
                            return reject(<IAjaxError>{ message: xhttp.statusText, status: xhttp.status });
                    }
                };


                xhttp.open("PUT", url, true);

                var str;
                if (data) {
                    str = JSON.stringify(data);
                    xhttp.setRequestHeader('Content-type', 'application/json; charset=utf-8');
                }

                xhttp.withCredentials = Utils._withCredentials;
                xhttp.send(str);

            });

            // Associate the uploaded preview with the file
            //return jQuery.ajax(url, { type: "put", data: JSON.stringify(data), contentType: 'application/json;charset=UTF-8', dataType: "json" });
        }

        /**
        * A predefined shorthand method for calling deleta methods that use JSON communication
        */
        static delete<T>(url: string, data?: any): Promise<T> {
            return new Promise(function (resolve, reject) {
                var xhttp = new XMLHttpRequest();
                xhttp.onreadystatechange = function () {
                    if (xhttp.readyState == 4) {
                        if (xhttp.status == 200) {
                            var json = JSON.parse(xhttp.responseText);
                            return resolve(json);
                        }
                        else
                            return reject(<IAjaxError>{ message: xhttp.statusText, status: xhttp.status });
                    }
                };

                xhttp.open("DELETE", url, true);

                var str;
                if (data) {
                    str = JSON.stringify(data);
                    xhttp.setRequestHeader('Content-type', 'application/json; charset=utf-8');
                }

                xhttp.withCredentials = Utils._withCredentials;
                xhttp.send(str);

            });

            // Associate the uploaded preview with the file
            //return jQuery.ajax(url, { type: "delete", data: JSON.stringify(data), contentType: 'application/json;charset=UTF-8', dataType: "json" });
        }

        /**
        * Creates a new canvas item based on the dataset provided
        * @param {Canvas} parent The parent component this item must be added to
        * @param {any} data The data, usually created from a tokenize function
        * @returns {CanvasItem}
        */
        static createItem(parent : Canvas, data: ICanvasItem): CanvasItem {
            switch (data.type) {
                case CanvasItemType.Link:
                    return new Link(parent);
                case CanvasItemType.BehaviourAsset:
                    return new BehaviourAsset(parent);
                case CanvasItemType.BehaviourComment:
                    return new BehaviourComment(parent, "");
                case CanvasItemType.BehaviourInstance:
                    return new BehaviourInstance(parent, null);
                case CanvasItemType.BehaviourPortal:
                    return new BehaviourPortal(parent, null, PortalType.INPUT);
                case CanvasItemType.BehaviourScript:
                    return new BehaviourScript(parent, (<IBehaviourScript>data).scriptId, (<IBehaviourScript>data).text, false);
                case CanvasItemType.BehaviourShortcut:
                    return new BehaviourShortcut(parent, null, "");
                case CanvasItemType.Behaviour:
                    return new Behaviour(parent, "");
            }
        }

        /**
        * Creates a new property based on the dataset provided
        * @param {PropertyType} type The type of property to create
        */
        static createProperty(name : string, type: PropertyType): Prop<any> {
            var prop: Prop<any>;
            switch (type) {
                case PropertyType.ASSET:
                    prop = new PropAsset(name, null);
                    break;
                case PropertyType.ASSET_LIST:
                    prop = new PropAssetList(name, null, []);
                    break;
                case PropertyType.BOOL:
                    prop = new PropBool(name, false);
                    break;
                case PropertyType.ENUM:
                    prop = new PropEnum(name, "", []);
                    break;
                case PropertyType.FILE:
                    prop = new PropFileResource(name, null, null);
                    break;
                case PropertyType.COLOR:
                    prop = new PropColor(name, 0xffffff, 1);
                    break;
                case PropertyType.GROUP:
                    prop = new PropGroup(name, null);
                    break;
                //TODO: We dont have hidden props yet
                case PropertyType.HIDDEN:
                    break;
                //TODO: We dont have hidden props yet
                case PropertyType.HIDDEN_FILE:
                    break;
                case PropertyType.NUMBER:
                    prop = new PropNum(name, 0);
                    break;
                case PropertyType.OBJECT:
                    prop = new PropObject(name, null);
                    break;
                //TODO: We dont have objecy props yet
                case PropertyType.OPTIONS:
                    break;
                case PropertyType.STRING:
                    prop = new PropText(name, "");
                    break;
            }

            return prop;
        }

		/**
        * Gets the local mouse position of an event on a given dom element.
        */
		static getMousePos( evt, id ): any {
			// get canvas position
			var obj: any = document.getElementById( id );
			var top: number = 0;
			var left: number = 0;

			while ( obj && obj.tagName != 'BODY' ) {
				top += obj.offsetTop;
				left += obj.offsetLeft;
				obj = obj.offsetParent;
			}

			var p = jQuery( "#" + id ).parent().parent();
			var scrollX = p.scrollLeft();
			var scrollY = p.scrollTop();

			// return relative mouse position
			var mouseX = evt.clientX - left + scrollX;// window.pageXOffset;
			var mouseY = evt.clientY - top + scrollY;//window.pageYOffset;

			return { y: mouseY, x: mouseX };
		}

		/**
		* Use this function to check if a value contains characters that break things.
		* @param {string} text The text to check
		* @param {boolean} allowSpace If this is true, empty space will be allowed
		* @returns {string} Returns null or string. If it returns null then everything is fine. Otherwise a message is returned with what's wrong.
		*/
		static checkForSpecialChars( text: string, allowSpace: boolean = false ): string {
			if ( allowSpace === false && jQuery.trim( text ) === "" )
				return "Text cannot be an empty string";

			var boxText: string = text;
			var origLength: number = boxText.length;
			var boxText = boxText.replace(/[^a-zA-Z 0-9'!£$&+-=_]+/g, '');
			if (boxText.length != origLength)
				return "Please enter safe characters. We do not allow for HTML type characters.";

			return null;
		}

		/**
		Tells us if a string is a valid email address
		*/
		static validateEmail( email: string ): boolean {
			var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
			return re.test( email );
		}


		/* Returns the class name of the argument or undefined if
		*  it's not a valid JavaScript object. */
		static getObjectClass( obj ): any {
			if ( obj && obj.constructor && obj.constructor.toString ) {
				var arr = obj.constructor.toString().match( /function\s*(\w+)/ );
				if (arr && arr.length == 2)
					return arr[1];
			}

			return undefined;
		}
	}
}