namespace Animate {
	/**
	* This represents a combo property for assets that the user can select from a list.
	*/
    export class PGComboGroup extends PropertyGridEditor {
        constructor( grid: PropertyGrid ) {
            super( grid );
        }

        /**
        * Checks a property to see if it can edit it
        * @param {Prop<any>} prop The property being edited
        * @returns {boolean}
        */
        canEdit( prop: Prop<any> ): boolean {
            if ( prop instanceof PropGroup )
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
            const p = <PropGroup>prop;
            const group = <Resources.GroupArray>p.getVal();
            const groupId = ( group ? p.getVal().entry.shallowId : '' );

            //Create HTML
            const editor: JQuery = jQuery( `<div class='property-grid-label'>${p.name}</div><div class='property-grid-value'><select class='prop-combo' style = 'width:90%;'></select><div class='eye-picker'><img src='media/eye.png' /></div></div><div class='fix'></div>` );
            const selector: JQuery = jQuery( 'select', editor );
            const eye: JQuery = jQuery( '.eye-picker', editor );

            // Add to DOM
            container.element.append( editor );

            const project = User.get.project;
            let groups = project.groups.slice( 0, project.groups.length );

            //Sort alphabetically
            groups = groups.sort( function( a: Resources.GroupArray, b: Resources.GroupArray ) {
                const textA = a.entry.name;
                const textB = b.entry.name;
                return ( textA < textB ) ? -1 : ( textA > textB ) ? 1 : 0;
            });

            //Create the blank
            selector.append( `<option value='' ${( !p.getVal() ? 'selected=\'selected\'' : '' )}></option>` );

            for ( let i = 0; i < groups.length; i++ )
                selector.append( `<option title='${groups[ i ].entry.shallowId}' value='${groups[ i ].entry.shallowId}' ${( groupId === groups[ i ].entry.shallowId ? 'selected=\'selected\'' : '' )}>${groups[ i ].entry.name}</option>` );

            // Functions to deal with user interactions with JQuery
            const onSelect = function( e: JQueryEventObject ) {
                const val = parseFloat( selector.val() );
                const group = <Resources.GroupArray>project.getResourceByShallowID( val, ResourceType.GROUP );
                p.setVal( group );
            };

            const onEye = function( e: JQueryEventObject ) {
                // const val = parseFloat( selector.val() );
                // const group = project.getResourceByShallowID( val, ResourceType.GROUP );
                // TODO: This needs to be checked with update to TSX
                // TreeViewScene.getSingleton().selectNode( TreeViewScene.getSingleton().findNode( 'resource', group ) );
            };

            //Add listeners
            eye.on( 'mouseup', onEye );
            selector.on( 'change', onSelect );
        }
    }
}