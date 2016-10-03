namespace Animate {

    export interface ISchemaProps {
        editor: ContainerSchema
    }


    export class Schema extends React.Component<ISchemaProps, { workspace: Engine.Editor.IContainerWorkspace }> {

        // We keep a list of all open canvases
        private static _openCanvases = [];

        constructor( props: ISchemaProps ) {
            super( props );

            this.state = {
                workspace: props.editor.serialize() || { items: [] } as Engine.Editor.IContainerWorkspace
            }

            props.editor.on<EditorEvents, void>( 'change', this.invalidate, this );
        }

        componentWillReceiveProps( nextProps: ISchemaProps ) {
            this.props.editor.off<EditorEvents, void>( 'change', this.invalidate, this );
            nextProps.editor.on<EditorEvents, void>( 'change', this.invalidate, this );
        }

        /**
         * Clean up any listeners
         */
        componentWillUnmount() {
            this.props.editor.off<EditorEvents, void>( 'change', this.invalidate, this );
        }

        /**
         * When the store changes, we update the state
         */
        invalidate() {
            this.setState( { workspace: this.props.editor.serialize() });
        }

        /**
		 * Called when a draggable object is dropped onto the canvas.
		 * @param {React.MouseEvent} e
         * @param {IDragDropToken} json
		 */
        onObjectDropped( e: React.MouseEvent, json: IDragDropToken ) {
            const elm = this.refs[ 'canvas' ] as HTMLElement;
            const mouse = Utils.getRelativePos( e, elm );

            if ( json.type === 'resource' ) {
                const resource = User.get.project.getResourceByShallowID( json.id as number );
                if ( resource instanceof Resources.Container )
                    this.addBehaviour( PluginManager.getSingleton().getTemplate( 'Instance' ), mouse, resource );
                else if ( resource instanceof Resources.Asset || resource instanceof Resources.GroupArray )
                    this.addBehaviour( PluginManager.getSingleton().getTemplate( 'Asset' ), mouse, resource );
            }
            else if ( json.type === 'template' )
                this.addBehaviour( PluginManager.getSingleton().getTemplate( json.id as string ), mouse );

        }

        /**
		* This will create a new behaviour based on the template given
		* @param template The definition of the behaviour we're creating
		* @param pos The x and y position of where the node shoule be placed
		* @param resource Some behehaviours are wrappers for resources, these resources can optionally be provided
        * @param name The alias of the behaviour
		*/
        addBehaviour( template: BehaviourDefinition, pos: Point, resource?: ProjectResource<Engine.IResource>, name?: string ) {
            pos.x = pos.x - pos.x % 10;
            pos.y = pos.y - pos.y % 10;

            this.props.editor.doAction( new Actions.BehaviourCreated( template, { left : pos.x, top: pos.y }, resource ) );
        }

        // /**
        //  * Iteratively goes through each container to check if its pointing to this behaviour
        //  */
        // private isCyclicDependency( container : Container ) : boolean {
        //     var project = User.get.project;
        //     var thisContainer = this.props.store.container;
        //     var json: IContainerToken = null;
        // 	var canvas: Canvas = null;

        // 	// If this container is the same as the one we are testing
        // 	// then return true
        // 	if ( container === thisContainer )
        // 		return true;

        // 	// Get the most updated JSON
        //     canvas = CanvasTab.getSingleton().getTabCanvas( container.entry._id );
        //     if (canvas && !canvas._container.saved)
        //         json = canvas.tokenize(false);
        // 	else
        //         json = container.entry.json;

        //     if (!container.entry.json )
        // 		return false;

        // 	// Go through each of the items to see if got any instance that might refer to this container
        //     for (let item of json.items ) {
        //         if ( item.type === 'instance' ) {
        //             var childContainer = project.getResourceByShallowID<Container>( item.shallowId, ResourceType.CONTAINER );
        // 			if ( childContainer && this.isCyclicDependency( childContainer ) )
        // 				return true;
        // 		}
        //     }
        // 	return false;
        // }

        createPortal( type: HatcheryRuntime.PortalType, pos: Point ) {
            // Show the rename form
            ReactWindow.show( RenameForm, {
                name: '',
                onOk: ( newName ) => {
                    this.props.editor.doAction( new Actions.PortalCreated( new Portal( null, type, new PropBool( newName, false ) ), null, pos.x, pos.y )  );
                },
                onRenaming: ( newName, prevName ): Error => {
                    // Do not allow for duplicate portal names
                    const items = this.props.editor.getItems();
                    for ( const item of items )
                        if ( item instanceof BehaviourPortal )
                            if ( item.portals[0].property.name == newName )
                                return new Error(`A portal with the name '${newName}' already exists`);

                    return null;
                }
            } as IRenameFormProps );
        }

        /**
         * Opens the canvas context menu
         * @param {React.MouseEvent} e
         */
        onContext( e: React.MouseEvent ) {

            const elm = this.refs[ 'canvas' ] as HTMLElement;
            const mouse = Utils.getRelativePos( e, elm );

            mouse.x = mouse.x - mouse.x % 10;
            mouse.y = mouse.y - mouse.y % 10;

            const selection = this.props.editor.getSelection();
            const items: IReactContextMenuItem[] = [
                {
                    label: 'Add Comment', prefix: <i className="fa fa-comment-o" aria-hidden="true" />, onSelect: ( e ) => {
                        this.props.editor.doAction( new Actions.CommentCreated(mouse.x, mouse.y));
                    }
                },
                {
                    label: 'Portals', prefix: <i className="fa fa-caret-right" aria-hidden="true" />, items: [ {
                            label: 'Create Input',
                            prefix: <i className="fa fa-plus" aria-hidden="true" />,
                            onSelect: ( e ) => { this.createPortal( 'input', mouse ); }
                        },
                        {
                            label: 'Create Output',
                            prefix: <i className="fa fa-plus" aria-hidden="true" />,
                            onSelect: ( e ) => { this.createPortal( 'output', mouse ); }
                        },
                        {
                            label: 'Create Parameter',
                            prefix: <i className="fa fa-plus" aria-hidden="true" />,
                            onSelect: ( e ) => { this.createPortal( 'parameter', mouse ); }
                        },
                        {
                            label: 'Create Product',
                            prefix: <i className="fa fa-plus" aria-hidden="true" />,
                            onSelect: ( e ) => { this.createPortal( 'product', mouse ); }
                        }
                    ]
                }
            ];

            if ( selection.length > 0 )
                items.push( {
                    label: 'Delete', prefix: <i className="fa fa-times" aria-hidden="true" />, onSelect: ( e ) => {
                        this.props.editor.doAction( new Actions.BehavioursRemoved( selection ) );
                    }
                });

            ReactContextMenu.show( { x: e.pageX, y: e.pageY, items: items });
            e.preventDefault();
        }

        getPortal( target : HTMLElement) : Engine.Editor.IPortal {
            let elm: HTMLElement;
            let ref: React.Component<any, any> | Element;
            let portal: Engine.Editor.IPortal;

            for ( let i in this.refs ) {
                ref = this.refs[i];
                if ( ref instanceof BehaviourComponent ) {
                    portal = ref.getPortalFromTarget(target)
                    if (portal)
                        return portal;
                }
            }

            return null;
        }

        /**
         * Creates the component elements
         * @returns {JSX.Element}
         */
        render(): JSX.Element {
            let itemJson: Engine.Editor.ICanvasItem;

            return (
                <div
                    onContextMenu={( e ) => { this.onContext( e ); } }
                    ref="canvas"
                    className="canvas"
                    onClick={( e ) => this.props.editor.onNodeSelected( null, false ) }
                    onDragOver={( e ) => e.preventDefault() }
                    onDoubleClick={( e ) => {
                        e.preventDefault();
                        const elm = this.refs[ 'canvas' ] as HTMLElement;
                        const mouse = Utils.getRelativePos( e, elm );

                        ReactWindow.show( BehaviourPicker, {
                            x: e.pageX,
                            y: e.pageY,
                            onTemplateSelected: ( template ) => {
                                this.addBehaviour( template, mouse );
                            }
                        } as IBehaviourPickerProps )
                    } }
                    onDrop={( e ) => {
                        e.preventDefault();
                        e.stopPropagation();
                        try {
                            let json: IDragDropToken;
                            const data = e.dataTransfer.getData( 'text' );
                            if ( data && data !== '' )
                                json = JSON.parse( data );

                            this.onObjectDropped( e, json );
                        }
                        catch ( e ) {
                            LoggerStore.error( e.message );
                        }
                    } }
                    >
                    {
                        this.props.editor.activeLink ? <LinkComponent
                            isRouting={true}
                            getPortal={(target) => { return this.getPortal( target ) }}
                            editor={this.props.editor}
                            link={this.props.editor.activeLink.serializer}  /> : undefined
                    }
                    {this.state.workspace.items.map(( item, index ) => {
                        const type = item.get('type') as string;
                        if ( type === 'behaviour' || type === 'asset' || type === 'portal' )
                            return <BehaviourComponent
                                key={'item-' + index} ref={'behaviour-' + index}
                                editor={this.props.editor}
                                behaviour={item} />;
                        else if ( itemJson.type === 'link' )
                            return <LinkComponent
                                key={'item-' + index}
                                editor={this.props.editor}
                                isRouting={false}
                                getPortal={null}
                                link={item} />;
                        else if ( itemJson.type === 'comment' )
                            return <CommentComponent
                                key={'item-' + index}
                                editor={this.props.editor}
                                comment={item} />;

                        return null;
                    }) }
                </div>
            );
        }
    }
}