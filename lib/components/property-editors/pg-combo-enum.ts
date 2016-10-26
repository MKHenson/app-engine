import { Component } from '../component';
import { Prop } from '../../core/properties/prop';
import { PropEnum } from '../../core/properties/prop-enum';
import { PropertyGridEditor } from '../../core/property-grid-editor';
import { PropertyGrid } from '../property-grid';

/**
* This represents a combo property for enums that the user can select from a list.
*/
export class PGComboEnum extends PropertyGridEditor {
    constructor( grid: PropertyGrid ) {
        super( grid );
    }

    /**
    * Checks a property to see if it can edit it
    * @param {Prop<any>} prop The property being edited
    * @returns {boolean}
    */
    canEdit( prop: Prop<any> ): boolean {
        if ( prop instanceof PropEnum )
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
        const p = <PropEnum>prop;

        // Create HTML
        const editor: JQuery = jQuery( `<div class='property-grid-label'>${p.name}</div><div class='property-grid-value'><select class='prop-combo'></select></div><div class='fix'></div>` );
        const selector: JQuery = jQuery( 'select', editor );

        // Add to DOM
        container.element.append( editor );

        // Enums
        const selectedValue: string = p.getVal() !;
        let vars = p.choices;
        vars = vars.sort();

        const len: number = vars.length;
        for ( let i: number = 0; i < len; i++ )
            selector.append( `<option value='${vars[ i ]}' ${( selectedValue === vars[ i ] ? 'selected=\'selected\'' : '' )}>${vars[ i ]}</option>` );

        // Functions to deal with user interactions with JQuery
        const onSelect = function() {
            const val = selector.val();
            p.setVal( val );
        };

        // Add listeners
        selector.on( 'change', onSelect );
    }
}