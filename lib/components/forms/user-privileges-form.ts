namespace Animate {
    export class UserPrivilegesForm extends Window {
        private static _singleton: UserPrivilegesForm;

        private mSave: any;//Button;
        private search: Component;
        private mMenu: any;// ListView;
        //private mServerProxy: any;
        private keyDownProxy: any;
        private buttonProxy: any;

        constructor() {
            // Call super-class constructor
            super( 450, 600, true, true, "User Privileges" );

            UserPrivilegesForm._singleton = this;

            this.content.element.addClass( "user-privileges-content" );
            const top: Component = <Component>this.content.addChild( "<div class='top'></div>" );
            const bottom: Component = <Component>this.content.addChild( "<div class='bottom'></div>" );

            //this.mSave = new Button( "Save", bottom );
            this.mSave.element.width( 80 );
            this.mSave.element.height( 30 );
            this.mSave.element.css( { "margin": "0px 3px 3px 3px", "line-height": "30px" });

            this.search = <Component>bottom.addChild( "<div class='asset-search'><input type='text'></input><img src='media/search.png' /></div>" );

            //this.mMenu = new ListView(top);
            this.mMenu.addColumn( "Username" );
            this.mMenu.addColumn( "Access Rights" );

            const width = this.element.width();
            this.mMenu.setColumnWidth( 0, 185 );
            this.mMenu.setColumnWidth( 1, 255 );

            // this.mMenu.addItem(new ListViewItem(["Mat", "<select><option value='hidden'>Hidden</option><option value='read'>Read</option><option value='write'>Write</option><option value='admin'>Administrate</option></select>"]));
            // this.mMenu.addItem(new ListViewItem(["Mat2", "<select><option value='hidden'>Hidden</option><option value='read'>Read</option><option value='write'>Write</option><option value='admin'>Administrate</option></select>"]));
            // this.mMenu.addItem(new ListViewItem(["Anna", "<select><option value='hidden'>Hidden</option><option value='read'>Read</option><option value='write'>Write</option><option value='admin'>Administrate</option></select>"]));
            // this.mMenu.addItem(new ListViewItem(["Steve", "<select><option value='hidden'>Hidden</option><option value='read'>Read</option><option value='write'>Write</option><option value='admin'>Administrate</option></select>"]));
            // this.mMenu.addItem(new ListViewItem(["Ilka", "<select><option value='hidden'>Hidden</option><option value='read'>Read</option><option value='write'>Write</option><option value='admin'>Administrate</option></select>"]));


            //EVENTS AND LISTENERS
            this.keyDownProxy = this.onInputKey.bind( this );
            this.buttonProxy = this.onButtonClick.bind( this );

            jQuery( "input", this.search.element ).on( "keydown", this.keyDownProxy );
            jQuery( "img", this.search.element ).on( "click", this.buttonProxy );
            this.mSave.element.on( "click", this.buttonProxy );
        }

		/**
		* This function is called whenever we get a resonse from the server
		*/
        onServer( response: LoaderEvents, event: AnimateLoaderEvent, sender?: EventDispatcher ) {
            if ( response === 'complete' ) {
                if ( event.return_type === 'success' ) {
                    const loader: AnimateLoader = <AnimateLoader>sender;

                    if ( loader.url === "/project/get-user-privileges" ) {
                        const data: Array<{ userId: string; username: string; privilege: PrivilegeType; }> = event.tag;

                        for ( let i = 0, l = data.length; i < l; i++ ) {
                            let item;
                            //  = new ListViewItem(
                            // 	[
                            // 		data[i].username,
                            // 		"<select>" +
                            // 		"<option value='" + PrivilegeType.NONE + "' " + ( data[i].privilege === PrivilegeType.NONE ? "selected='selected'" : "" ) + ">Hidden</option>" +
                            // 		"<option value='" + PrivilegeType.READ + "' " + ( data[i].privilege === PrivilegeType.READ ? "selected='selected'" : "" ) + ">Read</option>" +
                            // 		"<option value='" + PrivilegeType.WRITE + "' " + ( data[i].privilege === PrivilegeType.WRITE ? "selected='selected'" : "" ) + ">Write</option>" +
                            // 		"<option value='" + PrivilegeType.ADMIN + "' " + ( data[i].privilege === PrivilegeType.ADMIN ? "selected='selected'" : "" ) + ">Administrate</option>" +
                            // 		"</select>"
                            // 	]
                            // 	);

                            item.tag = data[ i ].userId;

                            this.mMenu.addItem( item );
                        }
                    }
                }
                else if ( event.message )
                    ReactWindow.show( MessageBox, { message: event.message } as IMessageBoxProps );
            }
        }

		/**
		* Gets the viewer to search using the terms in the search inut
		*/
        searchItems() {
            const items = this.mMenu.items;
            let i = items.length;
            while ( i-- ) {
                let ii = items[ i ].components.length;

                const searchTerm = jQuery( "input", this.search.element ).val();
                const baseString = ( items[ i ].fields[ 0 ] + items[ i ].fields[ 1 ] );
                const result = baseString.search( new RegExp( searchTerm, "i" ) );

                while ( ii-- )
                    if ( result !== -1 )
                        items[ i ].components[ ii ].element.show();
                    else
                        items[ i ].components[ ii ].element.hide();
            }
        }

		/**
		* When we click a button on the form
		* @param {any} e The jQuery event object
		*/
        onButtonClick( e ) {
            e.preventDefault();

            //If Search
            if ( jQuery( e.target ).is( jQuery( "img", this.search.element ) ) ) {
                this.searchItems();
            }
            else {
                //Get all the updated users
                const project = User.get.project;
                const ids = [];
                const access = [];

                //Create a multidimension array and pass each of the user dependencies
                for ( let i = 0; i < this.mMenu.items.length; i++ ) {
                    ids.push( this.mMenu.items[ i ].tag );
                    access.push( jQuery( this.mMenu.items[ i ].components[ 1 ].element.find( "select" ) ).val() );
                }

                const loader = new AnimateLoader();
                loader.on( 'complete', this.onServer, this );
                loader.on( 'failed', this.onServer, this );
                loader.load( "/project/set-users-access", { projectId: project.entry._id, ids: ids, access: access });
            }
        }

		/**
		* When we hit a key on the search box
		* @param {any} e The jQuery event
		*/
        onInputKey( e ) {
            if ( e.keyCode === 13 )
                this.searchItems();
        }

		/**
		* Shows the window by adding it to a Application route.
		*/
        show() {
            super.show( null, NaN, NaN, true );

            const project = User.get.project;
            this.mMenu.clearItems();

            const loader = new AnimateLoader();
            loader.on( 'complete', this.onServer, this );
            loader.on( 'failed', this.onServer, this );
            loader.load( "/project/get-user-privileges", { projectId: project.entry._id, index: 0, limit: 20 });
        }

		/**
		* Gets the singleton reference of this class.
		* @returns {UserPrivilegesForm}
		*/
        static getSingleton(): UserPrivilegesForm {
            if ( !UserPrivilegesForm._singleton )
                new UserPrivilegesForm();

            return UserPrivilegesForm._singleton;
        }
    }
}