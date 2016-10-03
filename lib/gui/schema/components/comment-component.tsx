namespace Animate {

    export interface ICommentComponentProps {
        comment: Serializable<Engine.Editor.IComment>;
        editor: ContainerSchema;
    }

    export interface ICommentComponentState {
        editMode?: boolean;
        newLabel?: string
    }

    /**
     * A visual representation of a Behaviour
     */
    export class CommentComponent extends React.Component<ICommentComponentProps, ICommentComponentState> {
        private _onUp: any;
        private _wasDownOnInput;

        /**
         * Creates an instance of the component
         */
        constructor( props: ICommentComponentProps ) {
            super( props );
            this._onUp = this.onUp.bind( this );
            this._wasDownOnInput = false;
            this.state = {
                editMode: false,
                newLabel: props.comment.get('label')
            };
        }

        /**
         * Remove any remaining listeners
         */
        componentWillUnmount() {
            window.removeEventListener( 'mouseup', this._onUp );
        }

        /**
         * When we switch edit mode, we add/remove listeners and/or focus on the editable textarea
         */
        componentDidUpdate( prevProps: ICommentComponentProps, prevState: ICommentComponentState ) {

            if ( !prevState.editMode && this.state.editMode ) {
                const input = this.refs[ 'input' ] as HTMLTextAreaElement;
                const comment = this.refs[ 'comment' ] as HTMLElement;
                window.removeEventListener( 'mouseup', this._onUp );
                window.addEventListener( 'mouseup', this._onUp );
                input.focus();
            }
            else if ( prevState.editMode && !this.state.editMode ) {
                window.removeEventListener( 'mouseup', this._onUp );
            }
        }

        /**
         * When the mouse is up, we remove the listeners and set the label
         */
        onUp( e: React.MouseEvent ) {
            const input = this.refs[ 'input' ] as HTMLTextAreaElement;

            if ( e.target !== input && this._wasDownOnInput) {
                e.preventDefault();
                this._wasDownOnInput = false;
                return;
            }

            const comment = this.props.comment;

            let ref = e.target as HTMLElement;

            while ( ref )
                if ( ref === input )
                    return;
                else
                    ref = ref.parentElement;

            window.removeEventListener( 'mouseup', this._onUp );
            this.props.editor.doAction( new Actions.CommentEditted( this.props.comment.get('id'), input.value ) );
            this.setState( { editMode: false });
        }

        /**
         * Creates the component elements
         */
        render(): JSX.Element {
            const comment = this.props.comment;
            const editor = this.props.editor;
            const json = comment.toObject() as Engine.Editor.IComment;

            return (
                <Draggable
                    x={json.left}
                    y={json.top}
                    enabled={( !this.state.editMode ) }
                    onDragComplete={( start, end ) => {
                        editor.doAction( new Actions.SelectionMoved( [ { index: json.id, x: end.x, y: end.y }] ) );
                    } }>
                    <Resizable
                        onResized={ ( size ) => { editor.doAction( new Actions.CommentResized( json.id, size.width, size.height ) ) } }
                        onDragStart={( e ) => { e.preventDefault(); e.stopPropagation(); return true; } }>
                        <div
                            onKeyUp={( e ) => {
                                // F2
                                if ( e.keyCode === 113 ) {
                                    this.setState( { editMode: true, newLabel: json.label });
                                }
                            } }
                            onDoubleClick={( e ) => {
                                this.setState( { editMode: true });
                                e.preventDefault();
                                e.stopPropagation();
                            } }
                            ref="comment"
                            style={{ width: json.width + 'px', height: json.height + 'px' }}
                            className={'scale-in-animation comment' +
                                ( !this.state.editMode ? ' unselectable' : '' ) +
                                ( !this.state.editMode && json.selected ? ' selected' : '' ) }
                            onContextMenu={( e ) => {
                                editor.onNodeSelected( comment, json.selected ? true : false, false );
                                editor.onContext( comment, e );
                            } }
                            onClick={( e ) => {
                                if ( this.state.editMode )
                                    return;

                                e.stopPropagation();
                                editor.onNodeSelected( json, e.shiftKey )
                            } }
                            >
                            { this.state.editMode ?
                                <textarea ref="input"
                                    onMouseDown={ () => this._wasDownOnInput = true }
                                    onKeyDown={( e ) => {
                                        // Esc
                                        if ( e.keyCode === 27 )
                                            this.setState( { editMode: false, newLabel: json.label });

                                        // Enter
                                        if ( e.keyCode === 13 ) {
                                            this.setState( { editMode: false });
                                            editor.doAction( new Actions.CommentEditted( json.id, ( e.target as HTMLTextAreaElement ).value ) );
                                        }
                                    } }
                                    value={this.state.newLabel}
                                    onChange={( e ) => {
                                        this.setState( { newLabel: ( e.target as HTMLTextAreaElement ).value });
                                    } }/>
                                : json.label
                            }
                        </div>
                    </Resizable>
                </Draggable>
            )
        }
    }
}