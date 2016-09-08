namespace Animate {

	/**
	 * A user comment
	 */
    export class Comment extends CanvasItem {
        public label: string;
        public width: number;
        public height: number;

		/**
		 * Creates an instance
		 */
        constructor( label: string ) {
            super();
            this.label = label;
            this.width = 150;
            this.height = 50;
        }

        /**
         * Serializes the data into a JSON.
		 * @param {number} id
         * @returns {IComment}
         */
        serialize( id: number ): IComment {
            let toRet = <IComment>super.serialize( id );
            toRet.label = this.label;
            toRet.width = this.width;
            toRet.height = this.height;
            return toRet;
        }

        /**
         * De-Serializes data from a JSON.
         * @param {IComment} data The data to import from
         */
        deSerialize( data: IComment ) {
            super.deSerialize( data );
            this.width = data.width;
            this.height = data.height;
            this.label = data.label;
        }
    }
}