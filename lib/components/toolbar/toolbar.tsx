import * as React from 'react';
import { Project } from '../../core/project';
import { Component } from '../../components/component';
import { User } from '../../core/user';
import { ResourceType } from '../../setup/enums';
import { Tab } from '../tab/tab';
import { TabPane } from '../tab/tab-pane';
import { ToolbarButton } from './toolbar-button/toolbar-button';
import { ReactWindow } from '../window/react-window';
import { MessageBox } from '../forms/message-box/message-box';
import { RenameForm, IRenameFormProps } from '../forms/rename-form/rename-form';
import { FileDialogue, IFileDialogueProps } from '../forms/file-dialogue/file-dialogue';
import { OptionsForm, IOptionsForm } from '../forms/options-form/options-form';
import { ToolbarNumber } from '../toolbar/toolbar-buttons/toolbar-number';
import { ToolbarColorPicker } from '../toolbar/toolbar-buttons/toolbar-color-picker';
import { ToolbarDropDown, ToolbarItem } from '../toolbar/toolbar-buttons/toolbar-drop-down';
import { Canvas } from '../../core/editors/container-schema/items/canvas';
import { ProjectEvents, IEditorEvent } from '../../setup/events';

export interface IToolbarProps {
    project: Project;
}

export interface IToolbarState {

}

/**
* The main toolbar that sits at the top of the application
*/
export class Toolbar extends React.Component<IToolbarProps, IToolbarState> {

    private static _singleton: Toolbar;

    // private _mainElm: JQuery;
    private $itemSelected: boolean;
    // private _topMenu : Component;
    // private _bottomMenu: Component;
    // private _tabHomeContainer: Component;
    // private _currentContainer: Component;
    // private _currentTab: Component;
    private _copyPasteToken: HatcheryServer.IContainerWorkspace | null;

    constructor( props?: IToolbarProps ) {
        super( props );
        Toolbar._singleton = this;

        // this._topMenu = <Component>this.addChild( "<div className='tool-bar-top background-haze'></div>" );
        // this._bottomMenu = <Component>this.addChild( "<div className='tool-bar-bottom'></div>" );

        // // Create main tab
        // this._tabHomeContainer = this.createTab("Animate", true);
        // this._mainElm = jQuery("#toolbar-main").remove().clone();
        // this._tabHomeContainer.element.append(this._mainElm);
        // Compiler.build(this._mainElm, this);

        // Set a few defaults
        this.$itemSelected = false;
        // this._copyPasteToken = null;
        // this._currentContainer = this._tabHomeContainer;
        // this._currentTab = this._tabHomeContainer.element.data( "tab" ).element.data( "component" );

        // Set events
        // This plugin does not yet work with 'on' so we have to still use bind
        // jQuery( document ).bind( 'keydown', 'Ctrl+s', this.onKeyDown.bind( this ) );
        // jQuery( document ).bind( 'keydown', 'Ctrl+c', this.onKeyDown.bind( this ) );
        // jQuery( document ).bind( 'keydown', 'Ctrl+x', this.onKeyDown.bind( this ) );
        // jQuery(document).bind('keydown', 'Ctrl+v', this.onKeyDown.bind(this));
        // this._topMenu.element.on("click", jQuery.proxy(this.onMajorTab, this));
    }

    componentWillMount() {
        this.props.project.on<ProjectEvents, IEditorEvent>( 'change', this.onProjectUpdated, this );
    }

    componentWillUnmount() {
        this.props.project.off<ProjectEvents, IEditorEvent>( 'change', this.onProjectUpdated, this );
    }

    onProjectUpdated() {
        this.forceUpdate();
    }

    /**
     * Creates the component elements
     */
    render(): JSX.Element {
        const editor = this.props.project.activeEditor;

        return <div className="toolbar">
            <Tab
                panes={[
                    <TabPane label="Home" showCloseButton={false}>
                        <div className="tool-bar-group">
                            <ToolbarButton onChange={() => { this.onHome() } } label="Home" imgUrl="media/animate-home.png" />
                            <ToolbarButton onChange={() => { this.saveAll() } } label="Save" imgUrl="media/save.png" />
                        </div>
                        <div className="tool-bar-group">
                            <ToolbarButton onChange={() => { this.onDuplicate() } } label="Copy" imgUrl="media/copy.png" disabled={!this.$itemSelected} />
                            <ToolbarButton onChange={() => { this.onDuplicate() } } label="Cut" imgUrl="media/cut.png" disabled={!this.$itemSelected} />
                            <ToolbarButton onChange={() => { this.onPaste() } } label="Paste" imgUrl="media/paste.png" disabled={!this._copyPasteToken} />
                            <ToolbarButton onChange={() => { this.onDelete() } } label="Delete" imgUrl="media/delete.png" disabled={!this.$itemSelected} />
                            <ToolbarButton onChange={() => { editor!.undo() } } label="Undo" prefix={<i className="fa fa-undo" aria-hidden="true" />}
                                disabled={!editor || !editor.hasUndos} />
                            <ToolbarButton onChange={() => { editor!.redo() } } label="Redo" prefix={<i className="fa fa-repeat" aria-hidden="true" />}
                                disabled={!editor || !editor.hasRedos} />
                        </div>
                        <div className="tool-bar-group">
                            <ToolbarButton label="Snapping" imgUrl="media/snap.png" pushButton={true} selected={Canvas.snapping}
                                onChange={() => {
                                    Canvas.snapping = !Canvas.snapping
                                } }
                                />
                        </div>
                        <div className="tool-bar-group">
                            <ToolbarButton onChange={() => {
                                this.onRun()
                            } } label="Run" imgUrl="media/play.png" />
                            <ToolbarButton onChange={() => {
                                ReactWindow.show( OptionsForm, {} as IOptionsForm );
                            } } label="Settings" imgUrl="media/build.png" />
                            <ToolbarButton onChange={() => {
                                //CanvasTab.getSingleton().addSpecialTab( 'HTML', CanvasTabType.HTML )
                            } } label="HTML" imgUrl="media/html.png" />
                            <ToolbarButton onChange={() => {
                                //CanvasTab.getSingleton().addSpecialTab( 'CSS', CanvasTabType.CSS )
                            } } label="CSS" imgUrl="media/css.png" />
                        </div>
                        <div className="tool-bar-group">
                            <ToolbarButton onChange={() => { this.newContainer() } } label="New Behaviour" imgUrl="media/add-behaviour.png" />
                        </div>
                        <div className="tool-bar-group">
                            <ToolbarButton onChange={() => {
                                //UserPrivilegesForm.getSingleton().show()
                            } } label="Privileges" imgUrl="media/privaledges.png" />
                        </div>
                        <div className="tool-bar-group">
                            <ToolbarButton onChange={() => { ReactWindow.show( FileDialogue, { multiselect: true, readOnly: true } as IFileDialogueProps ); } } label="File Manager" imgUrl="media/plug-detailed.png" />
                        </div>
                    </TabPane>
                ]}
                />
        </div>
    }

    /**
    * This is called when an item on the canvas has been selected
    * @param {Component} item
    */
    itemSelected( item: Component ) {
        item; // Supresses unused param error
        // TODO: Canvas TSX changes
        // ==========================================
        // if (item instanceof Behaviour || item instanceof Link)
        //     this.$itemSelected = true;
        // else
        //     this.$itemSelected = false;

        // //Compiler.digest(this._mainElm, this);
        // =============================================
    }

    /**
    * This is called when we have loaded and initialized a new project.
    */
    newProject() {
        this.$itemSelected = false;
        this._copyPasteToken = null;
    }

    // /**
    // * Called when we click one of the top toolbar tabs.
    // * @param {any} e
    // */
    // onMajorTab( e ) {
    // 	var container = jQuery( e.target ).data( "container" );
    // 	if ( container !== null && container !== this._currentContainer ) {
    // 		this._currentContainer.element.slideUp( "fast", function () {
    // 			jQuery( this ).hide();
    // 			jQuery( this ).css( { left: "0px", top: "0px" });

    // 			var parent = jQuery( this ).parent();
    // 			jQuery( this ).detach();
    // 			parent.append( jQuery( this ) );
    // 		});

    // 		this._currentContainer = container;
    // 		this._currentContainer.element.show();
    // 		this._currentContainer.element.css( { left: "0px", top: "0px" });

    //         this._currentTab.element.removeClass( "toolbar-tab-selected" );
    //         jQuery(e.target).addClass( "toolbar-tab-selected" );
    // 		this._currentTab = jQuery( e.target ).data( "component" );
    // 	}
    // }

    /**
    * Opens the splash window
    */
    onHome() {
        // Splash.get.reset();
        // Splash.get.show();
    }

    /**
    * Opens the user privileges window
    */
    onShowPrivileges() {
        // Splash.get.reset();
        // Splash.get.show();
    }

    /**
    * Notifys the app that its about to launch a test run
    */
    onRun() {
        // PluginManager.getSingleton().emit(new Event(EditorEvents.EDITOR_RUN, null));
        // ImportExport.getSingleton().run();
    }

    /**
    * When we click the paste button
    */
    onPaste() {
        // if (CanvasTab.getSingleton().currentCanvas instanceof Canvas === false)
        //     return;

        // if (this._copyPasteToken) {
        //     var canvas = CanvasTab.getSingleton().currentCanvas;
        //     canvas.deTokenize(this._copyPasteToken, false);
        //     canvas.emit(new CanvasEvent(CanvasEvents.MODIFIED, canvas));
        // }
    }

    /**
    * When we click the copy button
    */
    onDuplicate( cut: boolean = false ) {
        cut; // Supresses unused param error
        // if (CanvasTab.getSingleton().currentCanvas instanceof Canvas === false)
        //     return;

        // if (!Canvas.lastSelectedItem)
        //     return;

        // var canvas = CanvasTab.getSingleton().currentCanvas;
        // var toCopy = [];

        // for (var i = 0, l = canvas.children.length; i < l; i++)
        //     if (canvas.children[i].selected)
        //         toCopy.push(canvas.children[i]);

        // // Creates a copy token
        // this._copyPasteToken = canvas.tokenize(false, toCopy);

        // // If a cut operation then remove the selected item
        // if (cut)
        //     Canvas.lastSelectedItem.dispose();

        // canvas.emit(CanvasEvents.MODIFIED, canvas);
    }

    /**
    * Shows the rename form - and creates a new behaviour if valid
    */
    newContainer() {

        // Show the rename form
        ReactWindow.show( RenameForm, {
            name: '',
            onOk: ( newName ) => {
                let project = User.get.project;

                project.createResource( ResourceType.CONTAINER, { name: newName }).then(( resource ) => {
                    resource; // Supresses unused param error
                    // TODO: This might be removed from update to TSX
                    // // The container is created - so lets open it up
                    // var tabPair = CanvasTab.getSingleton().addSpecialTab(resource.entry.name, CanvasTabType.CANVAS, resource);
                    // jQuery(".content", tabPair.tabSelector.element).text(resource.entry.name);
                    // tabPair.name = resource.entry.name;

                }).catch(( err: Error ) => {
                    // TODO: Log message?
                    // this.props.dispatch( LogActions.error( err.message ) );
                    MessageBox.error(
                        err.message,
                        [ 'Ok' ],
                        () => {

                            // Show the new behaviour form again
                            this.newContainer();
                        }
                    );
                });
            },
            onRenaming: ( newName, prevName ): Error | null => {

                // Make sure no other container exists with the same name
                let containers = User.get.project.containers;
                for ( let container of containers )
                    if ( container.entry.name === newName && container.entry.name !== prevName )
                        return new Error( `A container with the name '${newName}' already exists` );

                return null;
            }
        } as IRenameFormProps );
    }

    /**
    * When we click the delete button
    */
    onDelete() {
        // if (CanvasTab.getSingleton().currentCanvas instanceof Canvas === false)
        //     return;

        // var canvas = CanvasTab.getSingleton().currentCanvas;
        // var i = canvas.children.length;
        // while (i--)
        //     if (canvas.children[i].disposed !== null && canvas.children[i].selected)
        //         canvas.children[i].onDelete();

        // canvas.removeItems();
    }

    /**
    * This function is used to create a new group on the toolbar
    * @param text The text of the new tab
    * @param text The text of the new tab
    * @returns Returns the {Component} object representing the tab
    */
    createTab( text: string, isSelected: boolean = false ): Component | null {
        text; // Supresses unused param error
        isSelected;

        // var topTab = this._topMenu.addChild("<div className='toolbar-tab " + (isSelected ? "toolbar-tab-selected" : "" ) + "'>" + text + "</div>" );
        // var btmContainer: Component = <Component>this._bottomMenu.addChild( "<div className='tab-container'></div>" );

        // if ( !isSelected )
        // 	btmContainer.element.hide();

        // topTab.element.data( "container", btmContainer );
        // btmContainer.element.data( "tab", topTab );

        // return btmContainer;
        return null;
    }

    saveAll() {
        // Animate.CanvasTab.getSingleton().saveAll();
        // Animate.User.get.project.saveAll().catch(function (err: Error) {
        //     Logger.logMessage("Error while saving a resource: " + err.message, null, LogType.ERROR);
        // });
    }

    /**
    * Called when the key is pushed down
    */
    onKeyDown( event: any ) {
        event; // Supresses unused param error
        // if (event.data === 'Ctrl+s')
        //     this.saveAll();
        // else if (event.data === 'Ctrl+c')
        //     this.onDuplicate(false);
        // if ( event.data === 'Ctrl+x' )
        //     this.onDuplicate(true);
        // if (event.data === 'Ctrl+v')
        //     this.onPaste();

        // return false;
    }

    /**
    * Removes a tab by its name
    * @param text The name of the tab
    */
    removeTab( text: string ) {
        text; // Supresses unused param error
        // var children: Array<IComponent> = this._topMenu.children;
        // var i = children.length;

        // while ( i-- )
        // 	if ( children[i].element.text() === text ) {
        // 		children[i].element.data( "container" ).dispose();
        // 		children[i].dispose();
        // 		return;
        // 	}
    }

    /**
    * This function is used to create a new group on the toolbar
    * @param tab The {Component} tab object which represents the parent of this group.
    * @returns Returns the {Component} object representing the group
    */
    createGroup( tab: Component ): Component | null {
        tab; // Supresses unused param error
        // return <Component>tab.addChild( "<div className='tool-bar-group background-view-light'></div>" );
        return null;
    }

    /**
    * Use this function to create a group button for the toolbar
    * @param {string} text The text for the button
    * @param {number} min The minimum limit
    * @param {number} max The maximum limit
    * @param {number} delta The incremental difference when scrolling
    * @param {Component} group The Component object representing the group
    * @returns {ToolbarNumber}
    */
    createGroupNumber( text: string, defaultVal: number, min: number = Number.MAX_VALUE, max: number = Number.MAX_VALUE, delta: number = 0.1, group: Component | null = null ): ToolbarNumber | null {
        text; // Supresses unused param error
        defaultVal;
        min;
        max;
        delta;
        group;
        // var toRet: ToolbarNumber = new ToolbarNumber( group, text, defaultVal, min, max, delta );
        // group.addChild( <IComponent>toRet );
        // return toRet;
        return null;
    }

    /**
    * Use this function to create a group button for the toolbar
    * @param {string} text The text for the button
    * @param {string} image An image URL for the button icon
    * @param {Component} group The Component object representing the group
    * @param {boolean} isPushButton If true, the button will remain selected when clicked.
    * @returns {Component} Returns the Component object representing the button
    */
    createGroupButton( text: string, image: string | null = null, group: Component | null = null, isPushButton: boolean = false ): ToolbarButton | null {
        text; // Supresses unused param error
        image;
        group;
        isPushButton;
        // var toRet: ToolBarButton = new ToolBarButton( text, image, isPushButton, group )
        // group.addChild( <IComponent>toRet );
        // return toRet;
        return null;
    }

    /**
    * Use this function to create a group button for the toolbar
    * @param {Component} parent The parent that will contain the drop down
    * @param {Array<ToolbarItem>} items An array of items to list
    * @returns {ToolbarDropDown} Returns the Component object representing the button
    */
    createDropDownButton( parent: Component, items: Array<ToolbarItem> ): ToolbarDropDown | null {
        parent; // Supresses unused param error
        items;
        // var toRet = new ToolbarDropDown( parent, items )
        // return toRet;
        return null;
    }

    /**
    * Use this function to create a group button for the toolbar
    * @param {Component} parent The parent that will contain the drop down
    * @param {string} text The under the button
    * @param {string} color The hex colour as a string
    * @returns {ToolbarColorPicker} Returns the ToolbarColorPicker object representing the button
    */
    createColorButton( parent: Component, text: string, color: string ): ToolbarColorPicker | null {
        parent; // Supresses unused param error
        text;
        color;
        // var toRet = new ToolbarColorPicker( parent, text, color );
        // return toRet;
        return null;
    }

    /**
    * Gets the singleton instance
    */
    public static getSingleton( parent?: Component ): Toolbar {
        parent;
        // if ( Toolbar._singleton === undefined )
        // 	Toolbar._singleton = new Toolbar( parent );

        return Toolbar._singleton;
    }
}