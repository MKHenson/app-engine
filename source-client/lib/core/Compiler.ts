module Animate
{
    export interface AppNode extends Node
    {
        $expression: string;
    }

    export interface EngineInput extends HTMLInputElement
    {
        $error: boolean;
    }

    export interface EngineForm extends HTMLFormElement
    {
        $error: boolean;
        $errorExpression: string;
        $errorInput: string;
        $pristine: boolean;
    }

    export class Compiler
    {
        static validators = {
            "alpha-numeric": { regex: /^[a-z0-9]+$/i, name: "alpha-numeric" },
            "non-empty": { regex: /\S/, name: "non-empty" },
            "alpha-numeric-plus": { regex: /^[a-zA-Z0-9_\-!]+$/, name: "alpha-numeric-plus" },
            "email": { regex: /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i, name: "email" }
        };

        /**
        * Given an HTML Element, this function returns all TextNodes
        * @return {Array<Node>}
        */
        static getTextNodesIn(node: Element, includeWhitespaceNodes: boolean): Array<Node>
        {
            var textNodes: Array<Node> = [], nonWhitespaceMatcher = /\S/;

            function getTextNodes(node)
            {
                if (node.nodeType == 3)
                {
                    if (includeWhitespaceNodes || nonWhitespaceMatcher.test(node.nodeValue))
                    {
                        textNodes.push(node);
                    }
                } else
                {
                    for (var i = 0, len = node.childNodes.length; i < len; ++i)
                    {
                        getTextNodes(node.childNodes[i]);
                    }
                }
            }

            getTextNodes(node);
            return textNodes;
        }

        /**
        * Evaluates and returns an expression 
        * @return {any}
        */
        private static parse(script: string, ctrl: any, e: any, elm: Element): any
        {
            return eval("'use strict'; var __ret = " + script + "; __ret;")
        }

        /**
        * Evaluates an expression and assigns new CSS styles based on the object returned
        */
        static digestCSS(elm: Element, controller: any, value: string)
        {
            var object = Compiler.parse(value, controller, null, elm );
            for (var i in object)
                if (object[i])
                    elm.classList.add(i);
                else if (elm.classList.contains(i))
                    elm.classList.remove(i);
        }

        /**
        * Goes through any expressions in the element and updates them according to the expression result.
        * @param {JQuery} elm The element to traverse
        * @param {any} controller The controller associated with the element
        * @returns {JQuery}
        */
        static digest(elm: JQuery, controller: any): JQuery
        {
            // Gets each of the text nodes and does a search replace on any double moustace characters
            var tnodes: Array<AppNode> = <Array<AppNode>>Compiler.getTextNodesIn(elm.get(0), true);
            var matches: RegExpMatchArray;
            var textNode: AppNode;
            for (var i = 0, l = tnodes.length; i < l; i++)
            {
                textNode = tnodes[i];
                
                if (!textNode.$expression)
                    textNode.nodeValue.replace(/\{\{(.*?)\}\}/, function (sub, val)
                    {
                        var t = sub.match(/[^{}]+/);
                        textNode.$expression = t[0];
                        return t[0];
                    })
                
                if (textNode.$expression)
                    textNode.nodeValue = Compiler.parse(textNode.$expression, controller, null, <Element><Node>textNode);
            }

            // Traverse each element
            elm.find("*").addBack().each(function (index, elem)
            {
                // Go through each element's attributes
                jQuery.each(this.attributes, function (i, attrib)
                {
                    if (!attrib) return;
                    var name = attrib.name;
                    var value = attrib.value;

                    switch (name)
                    {
                        case "en-src":
                            (<HTMLImageElement>elem).src = Compiler.parse(value, controller, null, elem);
                        case "en-show":
                            (<HTMLImageElement>elem).style.display = (Compiler.parse(value, controller, null, elem) ? "" : "none");
                        case "en-class":
                            Compiler.digestCSS(elem, controller, value);
                    }
                });
            });

            return elm;
        }

        /**
        * Checks each of the validation expressions on an input element. Used to set form and input states like form.$error
        * @param {string} value The list of expression names separated by |
        * @param {HTMLInputElement| HTMLTextAreaElement} elem The element to traverse
        */
        static checkValidations(value: string, elem: HTMLInputElement| HTMLTextAreaElement)
        {
            var expressions: Array<{ name: string; regex: RegExp; }> = [];
            var form: EngineForm = <EngineForm>elem.form;

            for (var i = 0, values = value.split("|"), l = values.length; i < l; i++)
                if (Compiler.validators[values[i]])
                    expressions.push(Compiler.validators[values[i]]);

            (<EngineInput>elem).$error = false;
            for (var i = 0, l = expressions.length; i < l; i++)
                if (!(elem.value.match(expressions[i].regex)))
                {
                    (<any>elem).$error = true;
                    if (form)
                    {
                        form.$errorExpression = expressions[i].name;
                        form.$errorInput = elem.name;
                    }

                    break;
                }

            if (form)
            {
                form.$error = (<any>elem).$error;
                form.$pristine = false;
            }
        }

        /**
        * Goes through an element and prepares it for the compiler. This usually involves adding event listeners
        * and manipulating the DOM. This should only really be called once per element. If you need to update the
        * element after compilation you can use the digest method
        * @param {JQuery} elm The element to traverse
        * @param {any} controller The controller associated with the element
        * @returns {JQuery}
        */
        static build(elm: JQuery, controller: any): JQuery
        {
            // Traverse each element
            elm.find("*").addBack().each(function (index, elem)
            {
                // Go through each element's attributes
                jQuery.each(this.attributes, function (i, attrib)
                {
                    if (!attrib) return;
                    var name: string = attrib.name;
                    var value: string = attrib.value;
                    
                    switch (name)
                    {
                        case "en-model":
                            (<HTMLElement>elem).addEventListener("change", function(e)
                            {
                                Compiler.parse(`${value} = '${(<HTMLInputElement | HTMLTextAreaElement>elem).value}'`, controller, e, elem);
                                Compiler.digest(elm, controller);
                            });
                            break;
                        case "en-click":
                            (<HTMLElement>elem).addEventListener("click", function (e)
                            {
                                Compiler.parse(value, controller, e, elem);
                                Compiler.digest(elm, controller);
                            });
                            break;
                        case "en-dclick":
                            (<HTMLElement>elem).addEventListener( "dblclick", function (e)
                            {
                                Compiler.parse(value, controller, e, elem);
                                Compiler.digest(elm, controller);
                            });
                            break;
                        case "en-change":
                            (<HTMLInputElement>elem).addEventListener("change", function (e)
                            {
                                Compiler.parse(value, controller, e, elem);
                                Compiler.digest(elm, controller);
                            });
                            break;
                        case "en-submit":
                            (<HTMLFormElement>elem).addEventListener( "submit", function (e)
                            {
                                e.preventDefault();
                                (<EngineForm>elem).$error = false;
                                (<EngineForm>elem).$errorExpression = "";
                                (<EngineForm>elem).$errorInput = "";

                                var validations = jQuery("[en-validate]", elem);
                                validations.each(function (index, subElem)
                                {
                                    Compiler.checkValidations(validations[index].getAttribute("en-validate"), <HTMLInputElement>subElem);
                                });
                                
                                Compiler.parse(value, controller, e, elem);
                                Compiler.digest(elm, controller);
                            });
                            break;
                        case "en-validate":

                            // Set the parent form to be pristine
                            if ((<HTMLInputElement>elem).form)
                                (<EngineForm>(<HTMLInputElement>elem).form).$pristine = true;

                            (<HTMLInputElement>elem).addEventListener("change", function (e)
                            {
                                Compiler.checkValidations(value, <HTMLInputElement>elem);
                                Compiler.digest(elm, controller);
                            });
                            break;
                    }
                });
            });



            return Compiler.digest(elm, controller);
        }
    }
}