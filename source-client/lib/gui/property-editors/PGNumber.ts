module Animate
{
	/**
	* A property editor which edits numbers
	*/
    export class PGNumber extends PropertyGridEditor
	{
		constructor( grid: PropertyGrid )
		{
			super( grid );
        }

        /**
        * Checks a property to see if it can edit it
        * @param {Prop<any>} prop The property being edited
        * @returns {boolean}
        */
        canEdit(prop: Prop<any>): boolean
        {
            if (prop instanceof PropNum)
                return true;
            else
                return false;
        }

		/**
		* Given a property, the grid editor must produce HTML that can be used to edit the property
		* @param {Prop<any>} prop The property being edited
		* @param {Component} container The container acting as this editors parent
		*/
        edit(prop: Prop<any>, container: Component)
        {
            var p = <PropNum>prop;

            //Create HTML
            var num = p.getVal();
            var min = p.min;
            var max = p.max;
            var incrementAmount = p.interval;

            // Create HTML
            var editor: JQuery = jQuery(`<div class='property-grid-label'>${p.name}</div><div class='property-grid-value'><input type='text' class='PropTextbox' value = '${num}' /></div><div class='fix'></div>` );

            // Add to DOM
            container.element.append(editor);

			var that = this;

			// Function to deal with user interactions with JQuery
            var valueEdited = function (e: JQueryEventObject )
			{
				var val: number = parseFloat( jQuery( "input", editor ).val() );
				if ( isNaN( val ) )
					val = 0;

				if ( val < min )
					val = min;
				if ( val > max )
					val = max;

                var num: number = val;
                p.setVal(num);
			};

            // Add listeners
            jQuery("input", editor).val(num.toString());
            jQuery("input", editor).on("keyup", valueEdited);


			// This is for when the users press the up and down buttons on chrome
			jQuery( "input", editor ).on( "mouseup", valueEdited );
			(<any>jQuery( "input", editor )).jStepper( {
				allowDecimals: true,
				maxValue: max,
				minValue: min,
				normalStep: incrementAmount,
				onStep: valueEdited
			});
		}
	}
}