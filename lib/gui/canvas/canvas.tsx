namespace Animate {

    export interface IReactCanvasProps {
        store: ContainerWorkspace
    }


    export class ReactCanvas extends React.Component<IReactCanvasProps, { items: CanvasItem[] }> {

        // We keep a list of all open canvases
        private static _openCanvases = [];

        constructor( props: IReactCanvasProps ) {
            super( props );

            this.state = {
                items: props.store.getItems() || []
            }

            props.store.on<WorkspaceEvents, void>( 'change', this.invalidate, this );
        }

        componentWillReceiveProps( nextProps: IReactCanvasProps ) {
            this.props.store.off<WorkspaceEvents, void>( 'change', this.invalidate, this );
            nextProps.store.on<WorkspaceEvents, void>( 'change', this.invalidate, this );
        }

        /**
         * Clean up any listeners
         */
        componentWillUnmount() {
            this.props.store.off<WorkspaceEvents, void>( 'change', this.invalidate, this );
        }

        /**
         * When the store changes, we update the state
         */
        invalidate() {
            this.setState( { items: this.props.store.getItems() || [] });
        }

        renderBehaviour( behaviour: Behaviour, index: number ): JSX.Element {
            return <BehaviourComponent behaviour={behaviour} key={'item-' + index} />
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
                    this.createNode( PluginManager.getSingleton().getTemplate( 'Instance' ), mouse.x, mouse.y, resource );
                else if ( resource instanceof Resources.Asset || resource instanceof Resources.GroupArray )
                    this.createNode( PluginManager.getSingleton().getTemplate( 'Asset' ), mouse.x, mouse.y, resource );
            }
            else if ( json.type === 'template' )
                this.createNode( PluginManager.getSingleton().getTemplate( json.id as string ), mouse.x, mouse.y );

        }

        /**
		* This will create a canvas node based on the template given
		* @param {BehaviourDefinition} template The definition of the node
		* @param {number} x The x position of where the node shoule be placed
		* @param {number} y The y position of where the node shoule be placed
		* @param {Container} container This is only applicable if we are dropping a node that represents another behaviour container. This last parameter
		* is the actual behaviour container
        * @param {string} name The name of the node
		* @returns {Behaviour}
		*/
        createNode( template: BehaviourDefinition, x: number, y: number, resource?: ProjectResource<Engine.IResource>, name?: string ): Behaviour {

            let toAdd: Behaviour = null;
            x = x - x % 10;
            y = y - y % 10;

            // if ( template.behaviourName === "Instance" ) {
            // 	var nameOfBehaviour: string = "";
            // 	var cyclic: boolean = this.isCyclicDependency( container, nameOfBehaviour );
            // 	if ( cyclic ) {
            // 		ReactWindow.show(MessageBox, { message : `You have a cylic dependency with the behaviour '${nameOfBehaviour}'` } as IMessageBoxProps);
            // 		return null;
            // 	}
            // 	toAdd = new BehaviourInstance( this, container );
            // }
            if ( template.behaviourName === 'Asset' )
                toAdd = new BehaviourAsset( resource );
            // else if (template.behaviourName === "Script")
            //     toAdd = new BehaviourScript(this, null, name );
            else
                toAdd = new Behaviour( template );

            toAdd.left = x;
            toAdd.top = y;
            this.props.store.addItem( toAdd );
            return toAdd;
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

        createPortal( type: HatcheryRuntime.PortalType ) {
            // Show the rename form
            ReactWindow.show( RenameForm, {
                name: '',
                onOk: ( newName ) => {

                },
                onRenaming: ( newName, prevName ): Error => {

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

            const selection = this.props.store.getSelection();
            const items: IReactContextMenuItem[] = [
                {
                    label: 'Add Comment', prefix: <i className="fa fa-comment-o" aria-hidden="true" />, onSelect: ( e ) => {
                        const comment = new Animate.Comment( 'Type a message' );
                        comment.left = mouse.x, comment.top = mouse.y;
                        this.props.store.addItem( comment );
                    }
                },
                {
                    label: 'Portals', prefix: <i className="fa fa-caret-right" aria-hidden="true" />, items: [
                        {
                            label: 'Create Input', prefix: <i className="fa fa-plus" aria-hidden="true" />,
                            onSelect: ( e ) => { this.createPortal( 'input' ); }
                        },
                        { label: 'Create Output', prefix: <i className="fa fa-plus" aria-hidden="true" /> },
                        { label: 'Create Parameter', prefix: <i className="fa fa-plus" aria-hidden="true" /> },
                        { label: 'Create Product', prefix: <i className="fa fa-plus" aria-hidden="true" /> }
                    ]
                }
            ];

            if ( selection.length > 0 )
                items.push( {
                    label: 'Delete', prefix: <i className="fa fa-times" aria-hidden="true" />, onSelect: ( e ) => {
                        for ( const item of selection )
                            this.props.store.removeItem( item );
                    }
                });

            ReactContextMenu.show( { x: e.pageX, y: e.pageY, items: items });
            e.preventDefault();
        }

        /**
         * Creates the component elements
         * @returns {JSX.Element}
         */
        render(): JSX.Element {
            return (
                <div
                    onContextMenu={( e ) => { this.onContext( e ); } }
                    ref="canvas"
                    className="canvas"
                    onClick={( e ) => this.props.store.onNodeSelected( null, false ) }
                    onDragOver={( e ) => e.preventDefault() }
                    onDoubleClick={( e ) => {
                        e.preventDefault();
                        const elm = this.refs[ 'canvas' ] as HTMLElement;
                        const mouse = Utils.getRelativePos( e, elm );

                        ReactWindow.show( BehaviourPicker, {
                            x: e.pageX,
                            y: e.pageY,
                            onTemplateSelected: ( template ) => {
                                this.createNode( template, mouse.x, mouse.y );
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
                    {this.state.items.map(( item, index ) => {
                        if ( item instanceof Behaviour )
                            return this.renderBehaviour( item, index );
                        else if ( item instanceof Animate.Comment )
                            return <CommentComponent comment={item} key={'item-' + index} />;

                        return null;
                    }) }
                </div>
            );
        }
    }
}