module Animate {
	/**
	* This editor is used to pick colours from a colour dialogue.
	*/
    export class PGColorPicker extends PropertyGridEditor {
		constructor( grid: PropertyGrid ) {
			super( grid );
		}

        /**
        * Checks a property to see if it can edit it
        * @param {Prop<any>} prop The property being edited
        * @returns {boolean}
        */
        canEdit(prop: Prop<any>): boolean {
            if (prop instanceof PropColor)
                return true;
            else
                return false;
        }

		/**
		* Given a property, the grid editor must produce HTML that can be used to edit the property
		* @param {Prop<any>} prop The property being edited
		* @param {Component} container The container acting as this editors parent
		*/
        edit(prop: Prop<any>, container: Component) {
            var p = <PropColor>prop;

            var color = p.getVal().color;
            var alpha = p.getVal().alpha;

			var _id1 = "c" + Component.idCounter++;
            var _id2 = "c" + Component.idCounter++;

            //<div class='property-grid-label'>${p.name}</div><div class='property-grid-value'></div><div class='fix'></div>

           	var editor = jQuery(`<div class='property-grid-label'>${p.name}</div><div class='property-grid-value'><div style='width:100%; height:20px; background:url(media/map-opacity.png);' ><input style='width:80%; opacity:${alpha};' class='color PropTextbox' id = '${_id1}' value = '" + color + "' ></input><input id='${_id2}' class='PropTextbox' style='width:20%;' value='${alpha}'></input></div></div ><div class='fix' ></div >`);
            container.element.append(editor);

            var myPicker: JSColor = new jscolor.color(document.getElementById(_id1), {})
            myPicker.fromString(color.toString())

			var that = this;

			//Functions to deal with user interactions with JQuery
            var onValueEdited = function (e: JQueryEventObject ) {
                var col = parseFloat(jQuery(`#${_id1}`).val() );
                var alpha = parseFloat(jQuery(`#${_id2}`).val());
                jQuery(`#${_id1}`).css("opacity", alpha);

                prop.setVal(new Color(col, alpha));
			};

			//Add listeners
            jQuery(`#${_id2}`, editor).on("keyup", onValueEdited);
            jQuery(`#${_id1}`, editor).on("change", onValueEdited);
			editor.on( "mouseup", onValueEdited );
		}
	}
}