namespace Animate {
	/**
	* This represents a combo property for assets that the user can select from a list.
	*/
    export class PGComboAsset extends PropertyGridEditor {
        constructor( grid: PropertyGrid ) {
            super( grid );
        }

        /**
        * Checks a property to see if it can edit it
        * @param {Prop<any>} prop The property being edited
        * @returns {boolean}
        */
        canEdit( prop: Prop<any> ): boolean {
            if ( prop instanceof PropAsset && prop.type === PropertyType.ASSET )
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
            const p = <PropAsset>prop;

            // Create HTML
            const editor: JQuery = jQuery( `<div class='property-grid-label'>${p.name}</div><div class='property-grid-value'><select class='prop-combo' style = 'width:90%;'></select><div class='eye-picker'><img src='media/eye.png' /></div></div><div class='fix'></div>` );
            const selector: JQuery = jQuery( 'select', editor );
            const eye: JQuery = jQuery( '.eye-picker', editor );

            // Add to DOM
            container.element.append( editor );

            const resource = p.getVal();
            const selectedID = ( resource ? resource.entry._id : null );
            const classNames = p.classNames;
            let nodes = TreeViewScene.getSingleton().getAssets( classNames );

            // Create the blank options and select it if nothing else is chosen
            selector.append( `<option value='' ${( !selectedID ? 'selected=\'selected\'' : '' )}></option>` );

            // Sort alphabetically
            nodes = nodes.sort( function ( a: TreeNodeAssetInstance, b: TreeNodeAssetInstance ) {
                const textA = a.resource.entry.name.toUpperCase();
                const textB = b.resource.entry.name.toUpperCase();
                return ( textA < textB ) ? -1 : ( textA > textB ) ? 1 : 0;
            });

            const len: number = nodes.length;
            for ( let i = 0; i < len; i++ )
                selector.append( `<option title='${nodes[ i ].resource.entry.shallowId + ' : ' + nodes[ i ].resource.entry.className}' value='${nodes[ i ].resource.entry.shallowId}' ${( selectedID === nodes[ i ].resource.entry.shallowId ? 'selected=\'selected\'' : '' )}>${nodes[ i ].resource.entry.name}</option>` );

            const that = this;

            // When we select a new asset
            const onSelect = function ( e: JQueryEventObject ) {
                const val = parseFloat( selector.val() );
                const asset = User.get.project.getResourceByShallowID<Resources.Asset>( val, ResourceType.ASSET );
                p.setVal( asset );
            };

            // When we click on the target
            const onEye = function ( e: JQueryEventObject ) {
                const val = parseInt( selector.val() );
                const asset = User.get.project.getResourceByShallowID<Resources.Asset>( val, ResourceType.ASSET );

                // TODO: This needs to be checked with update to TSX
                // ================================================
                // if ( asset )
                //     TreeViewScene.getSingleton().selectNode( TreeViewScene.getSingleton().findNode( 'resource', asset ) );
                // else
                //     TreeViewScene.getSingleton().selectNode( TreeViewScene.getSingleton().findNode( 'className', classNames[ 0 ] ) );
                // =================================================
            };

            // Add listeners
            eye.on( 'mouseup', onEye );
            selector.on( 'change', onSelect );
        }
    }
}