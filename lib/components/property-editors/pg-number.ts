namespace Animate {
	/**
	* A property editor which edits numbers
	*/
    export class PGNumber extends PropertyGridEditor {
        constructor( grid: PropertyGrid ) {
            super( grid );
        }

        /**
        * Checks a property to see if it can edit it
        * @param {Prop<any>} prop The property being edited
        * @returns {boolean}
        */
        canEdit( prop: Prop<any> ): boolean {
            if ( prop instanceof PropNum )
                return true;
            else
                return false;
        }

		/**
		* Given a property, the grid editor must produce HTML that can be used to edit the property
		* @param {Prop<any>} prop The property being edited
		* @param {Component} container The container acting as this editors parent
		*/
        edit( prop: Prop<any>, container: Component ) {
            const p = <PropNum>prop;

            //Create HTML
            const num = p.getVal();
            const min = p.min;
            const max = p.max;
            const incrementAmount = p.interval;

            // Create HTML
            const editor: JQuery = jQuery( `<div class='property-grid-label'>${p.name}</div><div class='property-grid-value'><input type='text' class='PropTextbox' value = '${num}' /></div><div class='fix'></div>` );

            // Add to DOM
            container.element.append( editor );

            // Function to deal with user interactions with JQuery
            const valueEdited = function( e: JQueryEventObject ) {
                let val: number = parseFloat( jQuery( 'input', editor ).val() );
                if ( isNaN( val ) )
                    val = 0;

                if ( val < min )
                    val = min;
                if ( val > max )
                    val = max;

                const num: number = val;
                p.setVal( num );
            };

            // Add listeners
            jQuery( 'input', editor ).val( num.toString() );
            jQuery( 'input', editor ).on( 'keyup', valueEdited );


            // This is for when the users press the up and down buttons on chrome
            jQuery( 'input', editor ).on( 'mouseup', valueEdited );
            ( <any>jQuery( 'input', editor ) ).jStepper( {
                allowDecimals: true,
                maxValue: max,
                minValue: min,
                normalStep: incrementAmount,
                onStep: valueEdited
            });
        }
    }
}