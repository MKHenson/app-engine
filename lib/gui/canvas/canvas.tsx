module Animate {

    export interface IReactCanvasProps {
        store: CanvasStore
    }


    export class ReactCanvas extends React.Component<IReactCanvasProps, { items : CanvasItem[] }> {

        // We keep a list of all open canvases
        private static _openCanvases = [];

        constructor(props : IReactCanvasProps) {
            super(props);

            this.state = {
                items : props.store.getItems() || []
            }

            props.store.on('change', this.invalidate, this );
        }

        componentWillReceiveProps(nextProps) {
            this.props.store.off('change', this.invalidate, this );
            nextProps.store.on('change', this.invalidate, this );
        }

        /**
         * Clean up any listeners
         */
        componentWillUnmount() {
            this.props.store.off('change', this.invalidate, this );
        }

        /**
         * When the store changes, we update the state
         */
        invalidate() {
            this.setState({ items : this.props.store.getItems() || [] });
        }

        renderBehaviour( behaviour : Behaviour, index: number ) : JSX.Element {
            return <BehaviourComponent behaviour={behaviour} key={'item-' + index} />
        }

        /**
		 * Called when a draggable object is dropped onto the canvas.
		 * @param {React.MouseEvent} e
         * @param {IDragDropToken} json
		 */
		onObjectDropped( e: React.MouseEvent, json : IDragDropToken ) {

            let elm = this.refs['canvas'] as HTMLElement;
            let offsetX = elm.parentElement.offsetLeft;
            let offsetY = elm.parentElement.offsetTop;
            let ref = elm.offsetParent as HTMLElement;

            while ( ref ) {
                offsetX += ref.offsetLeft;
                offsetY += ref.offsetTop;
                ref = ref.offsetParent as HTMLElement;
            }

            let scrollX = elm.scrollLeft;
            let scrollY = elm.scrollTop;
            let mouse = { x: e.pageX - offsetX, y: e.pageY - offsetY };
            let x = mouse.x + scrollX;
            let y = mouse.y + scrollY;

            if ( json.type == 'resource' ) {
                let resource = User.get.project.getResourceByShallowID(json.id as number);

                if (resource instanceof Asset) {
                    //this.addAssetAtLocation(resource, x, y);
                }
                else if (resource instanceof Container)
                    this.createNode( PluginManager.getSingleton().getTemplate("Instance"), x, y, resource);

            }
            else ( json.type == 'template' )
                this.createNode( PluginManager.getSingleton().getTemplate( json.id as string ), x, y );

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
		createNode( template: BehaviourDefinition, x: number, y: number, container?: Container, name ?: string ): Behaviour {
            x = x - x % 10;
			y = y - y % 10;

			var toAdd: Behaviour = null;

			// if ( template.behaviourName == "Instance" ) {
			// 	var nameOfBehaviour: string = "";
			// 	var cyclic: boolean = this.isCyclicDependency( container, nameOfBehaviour );
			// 	if ( cyclic ) {
			// 		ReactWindow.show(MessageBox, { message : `You have a cylic dependency with the behaviour '${nameOfBehaviour}'` } as IMessageBoxProps);
			// 		return null;
			// 	}
			// 	toAdd = new BehaviourInstance( this, container );
			// }
			// else if ( template.behaviourName == "Asset" )
			// 	toAdd = new BehaviourAsset( this, template.behaviourName );
            // else if (template.behaviourName == "Script")
            //     toAdd = new BehaviourScript(this, null, name );
			// else
				toAdd = new Behaviour();

            toAdd.deSerialize({ behaviourType: template.behaviourName, alias: template.behaviourName, portals: [], left: x, top: y });

            // if (template.behaviourName != "Instance" && template.behaviourName != "Script" )
			// 	toAdd.text = template.behaviourName;

			var portalTemplates = template.portalsTemplates();

			// Check for name duplicates
			if ( portalTemplates ) {
				// Create each of the portals
				for ( let pTemplate of portalTemplates ) {
                    var portal = toAdd.addPortal( pTemplate.type, pTemplate.property.clone(), false );
					// if ( toAdd instanceof BehaviourScript == false )
					// 	portal.customPortal = false;
				}
			}

            this.props.store.addItem(toAdd);
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
		// 	if ( container == thisContainer )
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
        //         if ( item.type == 'instance' ) {
        //             var childContainer = project.getResourceByShallowID<Container>( item.shallowId, ResourceType.CONTAINER );
		// 			if ( childContainer && this.isCyclicDependency( childContainer ) )
		// 				return true;
		// 		}
        //     }
		// 	return false;
		// }

        /**
         * Creates the component elements
         * @returns {JSX.Element}
         */
        render() : JSX.Element {
            return (
                <div
                    ref='canvas'
                    className='canvas'
                    onClick={(e) => this.props.store.onNodeSelected(null, false)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        try {
                            let json : IDragDropToken;
                            let data = e.dataTransfer.getData('text');
                            if (data && data != '')
                                json = JSON.parse(data);

                            this.onObjectDropped(e, json);
                        }
                        catch(e) {
                            Logger.error(e.message);
                        }
                    }}
                >
                    {this.state.items.map( (item, index) => {
                        if (item instanceof Behaviour)
                            return this.renderBehaviour(item, index);

                        return null;
                    })}
                </div>
            );
        }
    }
}