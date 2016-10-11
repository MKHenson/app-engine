namespace Animate {
    /*
    * Directive for expanding HTML based on a boolean test
    * Eg usage en-if='ctrl.value'
    */
    export class If implements IDirective {
        private _returnVal: Array<AppNode>;

        constructor() {
            this._returnVal = [];
        }

        /*
        * Expands the html directive
        * @param {string} expression The JS expression in the HTML value attribute
        * @param {any} ctrl The controller
        * @param {DescriptorNode} The reference descriptor comment node
        * @param {InstanceNode} The current instance
        * @return A null return signifies that nothing should be done - an array returned will reformat the HTML
        */
        expand( expression: string, ctrl: any, desc: DescriptorNode, instance: InstanceNode ): Array<AppNode> | null {
            let mustRebuild = false;
            const parsedExp = Compiler.parse( expression, ctrl, null, desc, instance.$ctxValues );
            this._returnVal.splice( 0, this._returnVal.length );

            if ( !instance.$clonedData )
                mustRebuild = true;
            else {
                const prevValue = instance.$clonedData;
                if ( Compiler.isEquivalent( prevValue, parsedExp ) === false )
                    mustRebuild = true;
            }

            if ( mustRebuild ) {
                if ( parsedExp ) {
                    const clone: AppNode = <AppNode>Compiler.cloneNode( desc.$originalNode );
                    this._returnVal.push( clone );
                }

                instance.$clonedData = parsedExp;
            }
            else
                return null;

            return this._returnVal;
        }
    }

    Compiler.directives[ 'en-if' ] = new If();
}