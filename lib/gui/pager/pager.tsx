namespace Animate {

    export interface IPagerProps extends React.HTMLAttributes {
        onUpdate: ( index: number, limit: number ) => Promise<number>;
        limit?: number;
    }

    export interface IPagerState {
        index?: number,
        limit?: number,
        last?: number
    }

    /**
     * A class for handling paged content. You can use the pager like you would a div element. The content
     * of which will be displayed in a sub panel with a footer that allows the user to navigate between the content that's inserted.
     * Use the IPagerProps events to hook for each of the navigation requests and fill the content accordingly.
     */
    export class Pager extends React.Component<IPagerProps, IPagerState>{
        static defaultProps: IPagerProps = {
            limit: 10,
            onUpdate: null
        };

        /**
         * Creates an instance of the pager
         */
        constructor( props: IPagerProps ) {
            super( props );
            this.state = {
                index: 0,
                limit: props.limit,
                last: 1
            };
        }

        /**
         * When the component is mounted - load the projects
         */
        componentWillMount() {
            this.props.onUpdate( this.state.index, this.state.limit ).then(( last ) => {
                this.setState( { last: last });
            });
        }

        /**
        * Calls the update function
        */
        invalidate() {
            this.props.onUpdate( this.state.index, this.state.limit ).then(( last ) => {
                this.setState( { last: last });
            });
        }

        /**
        * Gets the current page number
        * @returns {number}
        */
        getPageNum(): number {
            return ( this.state.index / this.state.limit ) + 1;
        }

        /**
		* Gets the total number of pages
        * @returns {number}
		*/
        getTotalPages() {
            return Math.ceil( this.state.last / this.state.limit );
        }

        /**
		* Sets the page search back to index = 0
		*/
        goFirst() {
            this.setState( { index: 0 });
            this.props.onUpdate( 0, this.state.limit ).then(( last ) => {
                this.setState( { last: last });
            })
        }

        /**
		* Gets the last set of users
		*/
        goLast() {
            let index = 0;

            if ( this.state.limit !== 1 )
                index = this.state.last - ( this.state.last - this.state.limit ) % this.state.limit;
            else
                index = this.state.last - ( this.state.last - this.state.limit );

            if ( index < 0 )
                index = 0;

            this.setState( { index: index });
            this.props.onUpdate( index, this.state.limit ).then(( last ) => {
                this.setState( { last: last });
            });
        }

        /**
        * Sets the page search back to index = 0
        */
        goNext() {
            let index = this.state.index + this.state.limit;
            this.setState( { index: index });

            this.props.onUpdate( index, this.state.limit ).then(( last ) => {
                this.setState( { last: last });
            });
        }

        /**
        * Sets the page search back to index = 0
        */
        goPrev() {
            let index = this.state.index - this.state.limit;
            if ( index < 0 )
                index = 0;

            this.setState( { index: index });
            this.props.onUpdate( index, this.state.limit ).then(( last ) => {
                this.setState( { last: last });
            });
        }

        /**
         * Creates the component elements
         * @returns {JSX.Element}
         */
        render(): JSX.Element {
            const props: IPagerProps = Object.assign( {}, this.props );
            delete props.onUpdate;
            delete props.limit;
            let navbar: JSX.Element;
            let needsNavigation = this.state.last === 1 || this.state.last === 0 ? false : true;

            if ( needsNavigation )
                navbar = (
                    <div className="navigation background">
                        <div className="navigation-column back">
                            <a style={{ display: ( this.state.index ? '' : 'none' ) }} onClick={() => { this.goFirst() } }>First {'<<'} </a>
                            <a style={{ display: ( this.state.index ? '' : 'none' ) }} onClick={() => { this.goPrev() } }>Prev {'<'}</a>
                        </div>
                        <div className="navigation-column index">
                            {this.getPageNum() } of {this.getTotalPages() }
                        </div>
                        <div className="navigation-column next">
                            <a style={{ display: ( this.state.index + this.state.limit < this.state.last ? '' : 'none' ) }} onClick={() => { this.goNext() } }>{'>'} Next</a>
                            <a style={{ display: ( this.state.index < this.state.last - this.state.limit ? '' : 'none' ) }} onClick={() => { this.goLast() } }>{'>>'} Last</a>
                        </div>
                    </div>
                )

            return <div
                {...props}
                className={'pager ' + ( needsNavigation ? ' with-navigator' : '' ) + ( this.props.className || '' ) }>
                <div className="content">
                    {this.props.children}
                </div>
                {navbar}
            </div>
        }
    }
}