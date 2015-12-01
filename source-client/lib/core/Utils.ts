module Animate
{
    export interface IAjaxError { message: string; status: number; };
    export class Utils
    {
        private static _withCredentials: boolean = true;

        /**
        * A predefined shorthand method for calling put methods that use JSON communication
        */
        static post<T>(url: string, data: any): Promise<T>
        {
            return new Promise(function(resolve, reject)
            {
                var xhttp = new XMLHttpRequest();
                xhttp.onreadystatechange = function ()
                {
                    if (xhttp.readyState == 4)
                    {
                        if (xhttp.status == 200)
                        {
                            var json = JSON.parse(xhttp.responseText);
                            return resolve(json);
                        }
                        else
                            return reject(<IAjaxError>{ message: xhttp.statusText, status: xhttp.status });
                    }
                };
                
                xhttp.open("POST", url, true);

                var str;
                if (data)
                {
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
        static get<T>(url: string): Promise<T>
        {
            return new Promise(function (resolve, reject)
            {
                var xhttp = new XMLHttpRequest();
                xhttp.onreadystatechange = function ()
                {
                    if (xhttp.readyState == 4)
                    {
                        if (xhttp.status == 200)
                        {
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
        static put<T>(url: string, data: any): Promise<T>
        {
            return new Promise(function (resolve, reject)
            {
                var xhttp = new XMLHttpRequest();
                xhttp.onreadystatechange = function ()
                {
                    if (xhttp.readyState == 4)
                    {
                        if (xhttp.status == 200)
                        {
                            var json = JSON.parse(xhttp.responseText);
                            return resolve(json);
                        }
                        else
                            return reject(<IAjaxError>{ message: xhttp.statusText, status: xhttp.status });
                    }
                };


                xhttp.open("PUT", url, true);

                var str;
                if (data)
                {
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
        static delete<T>(url: string, data?: any): Promise<T>
        {
            return new Promise(function (resolve, reject)
            {
                var xhttp = new XMLHttpRequest();
                xhttp.onreadystatechange = function ()
                {
                    if (xhttp.readyState == 4)
                    {
                        if (xhttp.status == 200)
                        {
                            var json = JSON.parse(xhttp.responseText);
                            return resolve(json);
                        }
                        else
                            return reject(<IAjaxError>{ message: xhttp.statusText, status: xhttp.status });
                    }
                };

                xhttp.open("DELETE", url, true);

                var str;
                if (data)
                {
                    str = JSON.stringify(data);
                    xhttp.setRequestHeader('Content-type', 'application/json; charset=utf-8');
                }

                xhttp.withCredentials = Utils._withCredentials;
                xhttp.send(str);

            });

            // Associate the uploaded preview with the file
            //return jQuery.ajax(url, { type: "delete", data: JSON.stringify(data), contentType: 'application/json;charset=UTF-8', dataType: "json" });
        }

		/*Gets the local mouse position of an event on a given dom element.*/
		static getMousePos( evt, id ): any
		{
			// get canvas position
			var obj: any = document.getElementById( id );
			var top: number = 0;
			var left: number = 0;

			while ( obj && obj.tagName != 'BODY' )
			{
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
		static checkForSpecialChars( text: string, allowSpace: boolean = false ): string
		{
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
		static validateEmail( email: string ): boolean
		{
			var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
			return re.test( email );
		}


		/* Returns the class name of the argument or undefined if
		*  it's not a valid JavaScript object. */
		static getObjectClass( obj ): any
		{
			if ( obj && obj.constructor && obj.constructor.toString )
			{
				var arr = obj.constructor.toString().match( /function\s*(\w+)/ );
				if (arr && arr.length == 2)
					return arr[1];
			}

			return undefined;
		}
	}
}