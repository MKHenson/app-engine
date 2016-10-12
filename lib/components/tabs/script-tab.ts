namespace Animate {
	/**
	* A tab pair that creates a javascript node
	*/
    export class ScriptTab extends TabPair {
        public static singleton: HTMLTab;

        private originalName: string;
        private proxyFunctionClick: any;
        // TODO: Canvas TSX changes
        private scriptNode: any;// BehaviourScript;
        public saved: boolean;
        private close: boolean;
        private userDefinedChange: boolean;
        private _editor: AceAjax.Editor;
        private curFunction: string;
        private scripts: any;
        private right: Component;
        private _editorComponent: Component;

        private onEnter: string;
        private onFrame: string;
        private onInitialize: string;
        private onDispose: string;

        // TODO: Canvas TSX changes
        constructor( scriptNode: any ) { // BehaviourScript ) {
            const originalName = scriptNode.id + ' - ' + scriptNode.alias;
            super( null, null, originalName );

            // Call super-class constructor
            this.originalName = originalName;
            this.scriptNode = scriptNode;
            this.proxyFunctionClick = this.OnFunctionClick.bind( this );

            this.saved = true;
            this.close = false;
            this.userDefinedChange = true;
            this.scripts = {};
        }

		/**
		* When we click on one of the function buttons
		* @param <object> e
		*/
        OnFunctionClick( e ) {
            this.userDefinedChange = false;

            const f = jQuery( e.target ).attr( 'function' );
            jQuery( '.function-button', this.right.element ).removeClass( 'function-pushed' );
            jQuery( e.target ).addClass( 'function-pushed' );

            this.curFunction = f;

            jQuery( '#local-total' ).hide();
            jQuery( '#local-delta' ).hide();
            jQuery( '#local-name' ).hide();
            jQuery( '#local-portal' ).hide();

            if ( this.curFunction === 'onInitialize' )
                this._editor.setValue( this.onInitialize );
            else if ( this.curFunction === 'onEnter' ) {
                this._editor.setValue( this.onEnter );
                jQuery( '#local-name' ).show();
                jQuery( '#local-portal' ).show();
            }
            else if ( this.curFunction === 'onDispose' )
                this._editor.setValue( this.onDispose );
            else if ( this.curFunction === 'onFrame' ) {
                this._editor.setValue( this.onFrame );
                jQuery( '#local-total' ).show();
                jQuery( '#local-delta' ).show();


            }

            this._editor.selection.moveCursorFileStart();

            this.userDefinedChange = true;
        }

		/**
		* Called when the editor is resized
		*/
        onResize() {
            this._editor.resize();
        }

		/**
		* When we rename the script, we need to update the text
		*/
        rename( newName: string ) {
            this.originalName = this.scriptNode.id + ' - ' + newName;
            if ( !this.saved )
                this.name = '*' + this.originalName;
            else
                this.name = this.originalName;

            this.text = this.name;
        }

		/**
		* Called when the pair has been added to the tab
		*/
        onAdded() {
            const left = new Component( '<div class="script-content"></div>', this.page );

            const codeMenu =
                '<div class="script-menus">' +
                '<div title="Called when the script is first initialized" class="function-button" function="onInitialize">On Initialize</div>' +
                '<div title="Called each time the behaviour is entered from an input gate" class="function-button function-pushed" function="onEnter">On Enter</div>' +
                '<div title="Called each frame as long as the script is active" class="function-button" function="onFrame">On Frame</div>' +
                '<div title="Called when the script needs to be cleaned up and destroyed" class="function-button" function="onDispose">On Dispose</div>' +
                '<div class="script-helpers"></div>' +
                '</div>';

            this.right = new Component( codeMenu, this.page );

            this.page.element.append( '<div class="fix"></div>' );

            //Create the right panel options
            jQuery( '.function-button', this.right.element ).on( 'click', this.proxyFunctionClick );


            this._editorComponent = new Component( '<pre style="position:absolute; margin: 0; top: 0; bottom: 0; left: 0; right: 0;"></pre>', left );
            const editor = ace.edit( this._editorComponent.id );
            this._editor = editor;

            editor.setTheme( 'ace/theme/chrome' );
            editor.getSession().setMode( 'ace/mode/javascript' );
            //this._editorComponent.on( ComponentEvents.UPDATED, this.onResize, this );

            // Ctrl + S
            editor.commands.addCommand( {
                name: 'save',
                bindKey: {
                    win: 'Ctrl-S',
                    mac: 'Command-S',
                    sender: 'editor|cli'
                },
                exec: function() { Toolbar.getSingleton().saveAll() }
            });


            const loader = new AnimateLoader();
            const scriptId: string = this.scriptNode.scriptId;
            const tab: ScriptTab = this;

            //When we return from the server
            const onServer = function( response: LoaderEvents, event: AnimateLoaderEvent, sender?: EventDispatcher ) {
                //When we come back from the server
                if ( response === 'complete' ) {
                    let data: any = event.tag.script;
                    if ( !data )
                        data = {};

                    tab.userDefinedChange = false;
                    editor.setValue(( data.onEnter ? data.onEnter : '' ) );
                    editor.selection.moveCursorFileStart();

                    tab.curFunction = 'onEnter';
                    tab.onEnter = ( data.onEnter ? data.onEnter : '' );
                    tab.onInitialize = ( data.onInitialize ? data.onInitialize : '' );
                    tab.onDispose = ( data.onDispose ? data.onDispose : '' );
                    tab.onFrame = ( data.onFrame ? data.onFrame : '' );
                    tab.userDefinedChange = true;
                }
            };

            //When the text changes we save the data to the local function
            const onChange = function() {
                if ( !tab.userDefinedChange )
                    return;

                tab.saved = false;
                tab.name = '*' + tab.originalName;
                tab.text = tab.name;
                tab[ tab.curFunction ] = tab._editor.getValue();
            };

            //Text change
            editor.addEventListener( 'change', onChange );

            //Get the current scripts
            loader.on( 'complete', onServer );
            loader.on( 'failed', onServer );
            loader.load( '/project/get-behaviour-scripts', { projectId: User.get.project.entry._id, _id: scriptId });

            this.onSelected();
        }

		/**
		* When the server responds after a save.
		* @param <object> event
		* @param <object> data
		*/
        onServer( response: ProjectEvents, event: any ) {
            if ( response === 'failed' ) {
                this.saved = false;
                //MessageBox.show('Problem saving the data, server responded with:'' + event.message + ''', Array<string>('Ok'), null, null );
            }
            else {
                this.save();

                // TODO: Commented out due to update to TSX
                // if ( this.close )
                // 	CanvasTab.getSingleton().removeTab( this, true );
            }
        }

		/**
		* Called when the save all button is clicked
		*/
        onSaveAll() {
            this.save();
        }

		/**
		* Called when the pair has been selected
		*/
        onSelected() {
            if ( !this.right )
                return;

            // Create the right panel options
            const helpers = jQuery( '.script-helpers', this.right.element );
            helpers.empty();

            this.scripts = {};
            const scripts = this.scripts;

            scripts[ 'portalName' ] = 'portalName';
            scripts[ 'portal' ] = 'portal';
            scripts[ 'totalTime' ] = 'totalTime';
            scripts[ 'delta' ] = 'delta';

            let toAdd = '';

            // DEFAULTS
            toAdd += `<div id='local-name' style='display:block;' title='The local portal name variable' script='portalName' class='script-helper'><span class='identifier'>local</span> - <span class='name'>portalName</span> <span class='type'>(string)</span></div>`;
            toAdd += `<div id='local-portal' style='display:block;' title='The portal that entered' script='portal' class='script-helper'><span class='identifier'>local</span> - <span class='name'>portal</span> <span class='type'>(Anim.Portal)</span></div>`;
            toAdd += `<div id='local-total' style='display:none;' title='The total time that has elapsed in milliseconds' script='totalTime' class='script-helper'><span class='identifier'>local</span> - <span class='name'>totalTime</span> <span class='type'>(number)</span></div>`;
            toAdd += `<div id='local-delta' style='display:none;' title='The delta time since the last on frame call' script='delta' class='script-helper'><span class='identifier'>local</span> - <span class='name'>delta</span> <span class='type'>(number)</span></div>`;

            // INPUTS
            let portals = this.scriptNode.inputs;
            let len = portals.length;
            for ( let i = 0; i < len; i++ ) {
                scripts[ portals[ i ].property.name ] = `if ( portalName === ' + portals[ i ].property.name + ' )\r{\r}`;
                toAdd += `<div title='Inserts an input condition' script='" + portals[ i ].property.name + "' class='helper-onenter script-helper'><span class='identifier'>input</span> - <span class='name'>" + portals[ i ].property.name + "</span> <span class='type'>(bool)</span></div>`;
            }

            // OUTPUTS
            portals = this.scriptNode.outputs;
            len = portals.length;
            for ( let i = 0; i < len; i++ ) {
                scripts[ portals[ i ].property.name ] = `this.exit( ' + portals[ i ].property.name + ', false );`;
                toAdd += `<div title='Inserts an exit snippet' script='" + portals[ i ].property.name + "' class='helper-onenter script-helper'><span class='identifier'>output</span> - <span class='name'>" + portals[ i ].property.name + "</span> <span class='type'>(bool)</span></div>`;
            }

            // PARAMS
            portals = this.scriptNode.parameters;
            len = portals.length;
            for ( let i = 0; i < len; i++ ) {
                scripts[ portals[ i ].property.name ] = `this.getParam(' + portals[ i ].property.name + ')`;
                toAdd += `<div title='Inserts a get parameter snippet' script='` + portals[ i ].property.name + `' class='helper-onenter script-helper'><span class='identifier'>parameters</span> - <span class='name'>` + portals[ i ].property.name + `</span></div>`;
            }

            // PRODUCTS
            portals = this.scriptNode.products;
            len = portals.length;
            for ( let i = 0; i < len; i++ ) {
                scripts[ portals[ i ].property.name ] = `this.setProduct( ' + portals[ i ].property.name + ', /*VALUE*/ );`;
                toAdd += `<div title='Inserts a set product snippet' script='` + portals[ i ].property.name + `' class='helper-onenter script-helper'><span class='identifier'>products</span> - <span class='name'>` + portals[ i ].property.name + `</span></div>`;

            }

            helpers.html( toAdd );

            const editor: AceAjax.Editor = this._editor;
            jQuery( '.script-helper', helpers ).on( 'click', function( e ) {
                editor.insert( scripts[ jQuery( e.currentTarget ).attr( 'script' ) ] );
                editor.focus();
            });
        }


		/**
		* Called by the tab class when the pair is to be removed.
		* @param <object> data An object that can be used to cancel the operation. Simply call data.cancel = true to cancel the closure.
		*/
        onRemove( data ) {
            const tab = this;

            // If not saved ask the user.
            if ( !this.saved ) {
                data.cancel = true;
                MessageBox.warn(
                    'You have unsaved work are you sure you want to refresh?',
                    [ 'Yes', 'No' ],
                    ( button ) => {
                        if ( button === 'Yes' ) {
                            tab.close = true;
                            tab.save();
                        }
                        else {
                            tab.close = true;
                            tab.saved = true;

                            // TODO: Commented out due to update to TSX
                            // CanvasTab.getSingleton().removeTab( tab, true );
                        }
                    }
                );
                return;
            }

            this._editorComponent.off( 'ComponentEvents.UPDATED', this.onResize, this );
            jQuery( '.function-button', this.right.element ).off( 'click', this.proxyFunctionClick );

            this._editor.commands.removeCommand( 'save' );
            this._editor.removeAllListeners( 'change' );

            this._editor.destroy();
            this.proxyFunctionClick = null;
            this.scriptNode = null;
            this.scripts = null;
        }


		/**
		* Call this function to save the script to the database
		* @returns <object>
		*/
        save() {
            if ( this.saved )
                return;

            const tab = this;

            // When we return from the save
            const onSave = function( response: LoaderEvents, event: AnimateLoaderEvent, sender?: EventDispatcher ) {
                if ( response === 'complete' ) {
                    if ( event.return_type === 'error' ) {
                        MessageBox.error( `There was an error saving the script: '${event.message}'` );
                        return;
                    }

                    tab.name = tab.originalName;
                    jQuery( '.text', tab.tabSelector.element ).text( tab.name );
                    tab.saved = true;

                    // TODO: Commented out due to update to TSX
                    // if ( tab.close )
                    // 	CanvasTab.getSingleton().removeTab( tab, true );
                }
            };

            // Try to create the database entry of this node
            const loader = new AnimateLoader();
            loader.on( 'complete', onSave );
            loader.on( 'failed', onSave );
            loader.load( '/project/save-behaviour-script', {
                projectId: User.get.project.entry._id,
                onEnter: this.onEnter,
                onInitialize: this.onInitialize,
                onDispose: this.onDispose,
                onFrame: this.onFrame,
                _id: this.scriptNode.scriptId
            });
        }
    }
}