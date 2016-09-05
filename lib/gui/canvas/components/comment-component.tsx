module Animate {

    export interface ICommentComponentProps {
        comment: Animate.Comment;
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

        /**
         * Creates an instance of the component
         */
        constructor(props: ICommentComponentProps) {
            super(props);
            this._onUp = this.onUp.bind(this);
            this.state = {
                editMode: false,
                newLabel: props.comment.label
            };
        }

        /**
         * Remove any remaining listeners
         */
        componentWillUnmount() {
            window.removeEventListener('mouseup', this._onUp);
        }

        /**
         * When we switch edit mode, we add/remove listeners and/or focus on the editable textarea
         */
        componentDidUpdate(prevProps: ICommentComponentProps, prevState: ICommentComponentState) {

            if ( !prevState.editMode && this.state.editMode ) {
                const input = this.refs['input'] as HTMLTextAreaElement;
                const comment = this.refs['comment'] as HTMLElement;
                window.removeEventListener('mouseup', this._onUp);
                window.addEventListener('mouseup', this._onUp);
                input.focus();
            }
            else if ( prevState.editMode && !this.state.editMode ) {
                window.removeEventListener('mouseup', this._onUp);
            }
        }

        /**
         * When the mouse is up, we remove the listeners and set the label
         */
        onUp(e: React.MouseEvent) {
            const comment = this.props.comment;
            const input = this.refs['input'] as HTMLTextAreaElement;
            let ref = e.target as HTMLElement;

            while (ref)
                if (ref == input)
                    return;
                else
                    ref = ref.parentElement;

            window.removeEventListener('mouseup', this._onUp);
            comment.label = input.value;
            this.setState({ editMode: false });
        }

        /**
         * Creates the component elements
         * @returns {JSX.Element}
         */
        render() : JSX.Element {
            const comment = this.props.comment;

            return (
                <Draggable
                    x={this.props.comment.left}
                    y={this.props.comment.top}
                    enabled={(!this.state.editMode)}
                    onMove={(x, y) => {
                        comment.left = x;
                        comment.top = y;
                    }}>
                    <Resizable onDragStart={(e) => { e.preventDefault(); e.stopPropagation(); return true; }}>
                        <div
                            onKeyUp={(e) => {
                                // F2
                                if (e.keyCode == 113) {
                                    this.setState({ editMode: true, newLabel: comment.label });
                                }
                            }}
                            onDoubleClick={(e) => {
                                this.setState({ editMode: true });
                                e.preventDefault();
                                e.stopPropagation();
                            }}
                            ref="comment"
                            style={{width: comment.width + 'px', height: comment.height + 'px'}}
                            className={'scale-in-animation comment' +
                                ( !this.state.editMode ? ' unselectable' : '' ) +
                                ( !this.state.editMode && this.props.comment.selected() ? ' selected' : '' ) +
                                ( this.props.comment.className ? ' ' + this.props.comment.className : '' )}
                            onContextMenu={(e) => {
                                comment.store.onNodeSelected(comment, comment.selected() ? true : false, false );
                                comment.onContext(e);
                            }}
                            onClick={(e) => {
                                if (this.state.editMode)
                                    return;

                                e.stopPropagation();
                                this.props.comment.store.onNodeSelected(this.props.comment, e.shiftKey )}}
                        >
                            { this.state.editMode ?
                                <textarea ref="input"
                                    onKeyDown={(e) => {
                                        // Esc
                                        if ( e.keyCode == 27 )
                                            this.setState({editMode : false, newLabel : comment.label });

                                        // Enter
                                        if ( e.keyCode == 13 ) {
                                            this.setState({editMode : false });
                                            comment.label = (e.target as HTMLTextAreaElement).value;
                                        }
                                    }}
                                    value={this.state.newLabel}
                                    onChange={(e) =>{
                                        this.setState({newLabel : (e.target as HTMLTextAreaElement).value });
                                    }}/>
                                : comment.label
                            }
                        </div>
                    </Resizable>
                </Draggable>
            )
        }
    }
}