module Animate {
    export interface IAjaxError { message: string; status: number; };

    export class Utils {
        private static _withCredentials: boolean = true;
        private static shallowIds: number = 0;
        public static validators : { [type: number ] : { regex: RegExp, name : string, negate : boolean; message : string; } };

        /**
         * Initializes the utils static variables
         */
        static init() {
            Utils.validators = {};
            Utils.validators[ValidationType.ALPHANUMERIC] = { regex: /^[a-z0-9]+$/i, name: "alpha-numeric", negate: false, message: "Only alphanumeric characters accepted" };
            Utils.validators[ValidationType.NOT_EMPTY] = { regex: /\S/, name: "non-empty", negate: false, message: "Cannot be empty" };
            Utils.validators[ValidationType.ALPHANUMERIC_PLUS] = { regex: /^[a-zA-Z0-9_\-!]+$/, name: "alpha-numeric-plus", negate: false, message: "Only alphanumeric, '_', '-' and '!' characters accepted" };
            Utils.validators[ValidationType.EMAIL] = { regex: /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i, name: "email", negate: false, message: "Email format not accepted" };
            Utils.validators[ValidationType.NO_HTML] = { regex: /(<([^>]+)>)/ig, name: "no-html", negate: true, message: "HTML is not allowed" };
            Utils.validators[ValidationType.ALPHA_EMAIL] = { regex: /^[a-zA-Z0-9_\-!@\.]+$/, name: "email-plus", negate: false, message: "Only alphanumeric, '_', '-', '@' and '!' characters accepted" };
        }

        /**
         * Checks a string to see if there is a validation error
         * @param {string} val The string to check
         * @param {ValidationType} validator The type of validations to check
         */
        static checkValidation(val: string, validator : ValidationType) {

            var validators = Utils.validators;
            var v : { regex: RegExp, name : string, negate : boolean; message : string; };

            for ( let i in ValidationType ) {
                if ( !isNaN(parseInt(i)) )
                    continue;

                if ( ( validator & ValidationType[i as string] ) & ValidationType[i as string] ) {
                    v = validators[ ValidationType[i as string] ];
                    let match = val.match( v.regex );

                    if ( v.negate ) {
                        if (match) {
                            return v.message;
                        }
                    }

                    if ( !v.negate ) {
                        if (!match) {
                            return v.message;
                        }
                    }
                }
            }

            return null;
        }

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
            else if (reference !== undefined)
                return reference;

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

        // TODO: This can probably be removed with new canvas tsx
        // ======================================================
        // /**
        // * Creates a new canvas item based on the dataset provided
        // * @param {Canvas} parent The parent component this item must be added to
        // * @param {any} data The data, usually created from a tokenize function
        // * @returns {CanvasItem}
        // */
        // static createItem(parent : Canvas, data: ICanvasItem): CanvasItem {
        //     switch (data.type) {
        //         case 'link':
        //             return new Link(parent);
        //         case 'asset':
        //             return new BehaviourAsset(parent);
        //         case 'comment':
        //             return new BehaviourComment(parent, "");
        //         case 'instance':
        //             return new BehaviourInstance(parent, null);
        //         case 'portal':
        //             return new BehaviourPortal(parent, null, PortalType.INPUT);
        //         case 'script':
        //             return new BehaviourScript(parent, (<IBehaviourScript>data).scriptId, (<IBehaviourScript>data).text, false);
        //         case 'shortcut':
        //             return new BehaviourShortcut(parent, null, "");
        //         case 'behaviour':
        //             return new Behaviour(parent, "");
        //     }
        // }
        // ======================================================

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
         * Gets the relative position of the mouse to the given element
         * @param {React.MouseEvent} e
         * @param {HTMLElement} elm The target element
         * @returns {{ x: number, y : number }}
         */
        static getRelativePos( e: React.MouseEvent, elm: HTMLElement ) : { x: number, y : number } {
            let offsetX = elm.offsetLeft;
            let offsetY = elm.offsetTop;
            let scrollX = elm.scrollLeft;
            let scrollY = elm.scrollTop;
            let ref = elm.offsetParent as HTMLElement;

            while ( ref ) {
                offsetX += ref.offsetLeft;
                offsetY += ref.offsetTop;
                scrollX += ref.scrollLeft;
                scrollY += ref.scrollTop;
                ref = ref.offsetParent as HTMLElement;
            }

            const mouse = { x: e.pageX - offsetX, y: e.pageY - offsetY };
            const x = mouse.x + scrollX;
            const y = mouse.y + scrollY;
            return { x: x, y: y };
        }

        /**
         * Gets a quadratically eased in/out value
         * @param {number} startValue The initial value
         * @param {number} delta The difference between the start value and its target
         * @param {number} curTime Between 0 and duration
         * @param {number} duration The total time
         * @returns {number}
         */
        static quadInOut( startValue, delta, curTime, duration ) : number {
            curTime /= duration/2;
            if (curTime < 1) return delta/2*curTime*curTime + startValue;
            curTime--;
            return -delta/2 * (curTime*(curTime-2) - 1) + startValue;
        };

        /**
         * Scrolls an element to the destination x and y for a given duration
         * @param {{ x: number, y : number }} dest The target X & Y coordinates
         * @param {HTMLElement} elm The element to scroll
         * @param {number} duration The total amount of time to take to scroll
         * @return {number} Returns setInterval
         */
        static scrollTo( dest : { x: number, y : number }, elm: HTMLElement, duration : number ) : number {
            let curTime = 0;
            let left = 0;
            let top = 0;
            const tick = 15;
            const startX = elm.scrollLeft;
            const startY = elm.scrollTop;
            const deltaX = dest.x - elm.scrollLeft;
            const deltaY = dest.y - elm.scrollTop;
            let scrollInterval = window.setInterval( () => {
                curTime += tick;
                left = this.quadInOut(startX, deltaX, curTime, duration);
                top = this.quadInOut(startY, deltaY, curTime, duration);
                if (curTime > duration)
                    clearInterval( scrollInterval );

                elm.scrollLeft = left;
                elm.scrollTop = top;
            }, tick);

            return scrollInterval;
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