namespace Animate {
        export namespace Actions {
        /**
         * The base class for all editor actions
         */
        export abstract class EditorAction {

            /**
             * Undo the last history action
             */
            abstract undo( editor : Animate.Editor );

            /**
             * Redo the next action
             */
            abstract redo( editor : Animate.Editor );
        }
    }
}