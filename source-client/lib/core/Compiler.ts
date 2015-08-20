module Animate
{
    export interface AppNode extends Node
    {
        $expression: string;
        $expressionType: string;
        $dynamic: boolean;
        $originalNode: AppNode;
        $ctx: string;
        $ctxValue: any;
        $events: Array< { name: string; tag: string; func: any; } >;
    }

    export interface EngineInput extends HTMLInputElement
    {
        $error: boolean;
        $autoClear: boolean;
    }

    export interface EngineForm extends HTMLFormElement
    {
        $error: boolean;
        $errorExpression: string;
        $errorInput: string;
        $pristine: boolean;
        $autoClear: boolean;
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
        static getTextNodesIn(node: Element): Array<Node>
        {
            var textNodes: Array<Node> = [], nonWhitespaceMatcher = /\S/;

            function getTextNodes(node)
            {
                if (node.nodeType == 3 )
                {
                        textNodes.push(node);
                }
                else
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
        * Given an HTML Element, this function returns all comment nodes
        * @return {Array<Node>}
        */
        static getCommentNodesIn(node: Element): Array<Node>
        {
            var textNodes: Array<Node> = [], nonWhitespaceMatcher = /\S/;

            function getTextNodes(node)
            {
                if (node.nodeType == 8)
                {
                    textNodes.push(node);
                }
                else
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
            var contexts = {};
            var p: AppNode = <AppNode><Node>elm;
            while (p)
            {
                if (p.$ctx && p.$ctx != "" && p.$ctxValue )
                    contexts[p.$ctx] = p.$ctxValue;

                p = <AppNode>p.parentNode;
            }

            var ctx = "";
            for (var i in contexts)
                ctx += `var ${i} = contexts['${i}'];`;

            return eval("'use strict'; " + ctx + " var __ret = " + script + "; __ret;")
        }

        /**
        * Evaluates an expression and assigns new CSS styles based on the object returned
        */
        static digestCSS(elm: Element, controller: any, value: string)
        {
            var object = Compiler.parse(value, controller, null, elm);
            for (var i in object)
                if (object[i])
                    elm.classList.add(i);
                else if (elm.classList.contains(i))
                    elm.classList.remove(i);
        }

        /**
        * Removes all registered events from the node
        * @param {Element} elem The element to remove events from
        */
        static removeEvents(elem: Element)
        {
            var appNode = <AppNode><Node>elem;
            if (appNode.$events)
            {
                for (var i = 0, l = appNode.$events.length; i < l; i++)
                    appNode.removeEventListener(appNode.$events[i].name, appNode.$events[i].func);

                appNode.$events.splice(0, appNode.$events.length);
            }
        }

        /**
        * Explores and enflates the html nodes with enflatable expressions present (eg: en-repeat)
        * @param {Element} elm The root element to explore
        * @param {any} ctrl The controller
        */
        static expand(elm: Element, ctrl: any): Element
        {
            var potentials: Array<Element> = [];
            var toRemove: Array<Element> = [];

            // Traverse each element
            jQuery(elm).find("*").addBack().each(function (index, elem)
            {
                if ((<AppNode><Node>elem).$dynamic)
                    return toRemove.push(elem);

                // Go through each element's attributes
                jQuery.each(this.attributes, function (i, attrib)
                {
                    if (!attrib) return;
                    var name = attrib.name;
                    var value = attrib.value;

                    switch (name)
                    {
                        case "en-repeat":
                            (<AppNode><Node>elem).$expression = value;
                            (<AppNode><Node>elem).$expressionType = "en-repeat";
                            potentials.push(elem);
                            break;
                        case "en-if":
                            (<AppNode><Node>elem).$expression = value;
                            (<AppNode><Node>elem).$expressionType = "en-if";
                            potentials.push(elem);
                            break;
                    }
                });
            });

            // Get the comments
            var comments: Array<Node> = Compiler.getCommentNodesIn(elm)

            // Remove existing clones
            for (var i = 0, l = toRemove.length; i < l; i++)
            {
                var appNode: AppNode = <AppNode><Node>toRemove[i];
                appNode.$ctx = "";
                appNode.$ctxValue = null;
                jQuery(toRemove[i]).remove();
            }

            // Replace the potentials with comments that keep a reference to the original node
            for (var i = 0, l = potentials.length; i < l; i++)
            {
                var comment = jQuery(`<!-- ${(<AppNode><Node>potentials[i]).$expressionType} -->`);
                var commentElement: AppNode = <AppNode><Node>comment.get(0);
                
                
                commentElement.$originalNode = <AppNode><Node>potentials[i];
                commentElement.$expression = commentElement.$originalNode.$expression;
                commentElement.$expressionType = commentElement.$originalNode.$expressionType;
                
                jQuery(potentials[i]).replaceWith(comment);
                comments.push(commentElement);
            }

            // Go through each comment and expand it
            for (var i = 0, l = comments.length; i < l; i++)
            {
                var comment = jQuery(comments[i]);
                var appNode = (<AppNode><Node>comments[i]);
                
                if (appNode.$expression)
                {
                    var $expression = appNode.$expression;

                    if (appNode.$expressionType == "en-repeat")
                    {
                        var e = $expression.split("as");
                        if (e.length > 1 && e[0].trim() != "" && e[1].trim() != "")
                        {
                            var loopExpression = e[0];
                            var ctx = e[1];
                            eval(`'use strict';
                             for ( var i in ${loopExpression} ) {
                                var clone = jQuery(appNode.$originalNode).clone();
                                clone.get(0).$dynamic = true;
                                clone.get(0).$ctx = ctx;
                                clone.get(0).$ctxValue = ${loopExpression}[i];
                                clone.insertAfter(comment);
                            }`);
                        }
                    }
                    else if (appNode.$expressionType == "en-if")
                    {
                        if (Compiler.parse($expression, ctrl, null, <Element><Node>appNode))
                        {
                            var clone = jQuery(appNode.$originalNode).clone();

                            if (<Element><Node>appNode.$originalNode == elm)
                                elm = <Element><Node>clone.get(0);

                            (<AppNode><Node>clone.get(0)).$dynamic = true;
                            clone.insertAfter(comment);
                        }
                    }
                }
            }

            return elm;
        }

        /**
        * Registers an internal function reference for later cleanup
        * @param {AppNode} node The element we are attaching events to
        * @param {string} name The name of the event
        * @param {any} func The function to call
        */
        static registerFunc(node: AppNode, name: string, tag : string, func: any)
        {
            if (!node.$events)
                node.$events = [];

            // Do not re-add events if the node already has it
            for (var i = 0, l = node.$events.length; i < l; i++)
                if (node.$events[i].tag == tag)
                    return;

            (<HTMLElement><Node>node).addEventListener(name, func);
            node.$events.push({ name: name, func: func, tag: tag });
        }
        
        /**
        * Goes through any expressions in the element and updates them according to the expression result.
        * @param {JQuery} elm The element to traverse
        * @param {any} controller The controller associated with the element
        * @returns {Element}
        */
        static digest(jElem: JQuery, controller: any): Element
        {
            var elm: Element = jElem.get(0);
            var matches: RegExpMatchArray;
            var textNode: AppNode;
            var expanded = Compiler.expand(elm, controller);
            if (expanded != elm)
            {
                elm = expanded;
                jElem = jQuery(elm);

            }

            // Traverse each element
            jQuery(elm).find("*").addBack().each(function (index, elem)
            {
                var appNode = <AppNode><Node>elem;
                                
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
                            break;
                        case "en-show":
                            (<HTMLImageElement>elem).style.display = (Compiler.parse(value, controller, null, elem) ? "" : "none");
                            break;
                        case "en-class":
                            Compiler.digestCSS(elem, controller, value);
                            break;
                        case "en-model":
                            var ev = function (e)
                            {
                                Compiler.parse(`${value} = '${(<HTMLInputElement | HTMLTextAreaElement>elem).value}'`, controller, e, elem);
                                Compiler.digest(jElem, controller);
                            };
                            
                            Compiler.parse(`${value} = '${(<HTMLInputElement | HTMLTextAreaElement>elem).value}'`, controller, null, elem);
                            Compiler.registerFunc(appNode, "change", "en-model", ev);
                            break;
                        case "en-click":
                            var ev = function (e)
                            {
                                Compiler.parse(value, controller, e, elem);
                                Compiler.digest(jElem, controller);
                            };

                            Compiler.registerFunc(appNode, "click", "en-click", ev);
                            break;
                        case "en-dclick":
                            var ev = function (e)
                            {
                                Compiler.parse(value, controller, e, elem);
                                Compiler.digest(jElem, controller);
                            };
                            
                            Compiler.registerFunc(appNode, "dblclick", "en-dclick", ev);
                            break;
                        case "en-change":

                            var ev = function (e)
                            {
                                Compiler.parse(value, controller, e, elem);
                                Compiler.digest(jElem, controller);
                            };
                            
                            Compiler.registerFunc(appNode, "change", "en-model", ev);
                            break;
                        case "en-submit":

                            var ev = function (e)
                            {
                                var form: EngineForm = <EngineForm>elem;
                                e.preventDefault();
                                form.$error = false;
                                form.$errorExpression = "";
                                form.$errorInput = "";


                                jQuery("[en-validate]", elem).each(function (index, subElem)
                                {
                                    Compiler.checkValidations(this.getAttribute("en-validate"), <HTMLInputElement>subElem);
                                });

                                // If its an auto clear - then all the clear fields must be wiped
                                if (form.$autoClear)
                                {
                                    jQuery("[en-auto-clear]", elem).each(function (index, subElem)
                                    {
                                        (<HTMLInputElement|HTMLTextAreaElement>this).value = "";
                                    });
                                }

                                Compiler.parse(value, controller, e, elem);
                                Compiler.digest(jElem, controller);
                            };

                            Compiler.registerFunc(appNode, "submit", "en-submit", ev);
                            break;
                        case "en-validate":
                            
                            // Set the parent form to be pristine
                            if ((<HTMLInputElement>elem).form)
                                (<EngineForm>(<HTMLInputElement>elem).form).$pristine = true;

                            var ev = function (e)
                            {
                                Compiler.checkValidations(value, <HTMLInputElement>elem);
                                Compiler.digest(jElem, controller);
                            };
                            
                            Compiler.registerFunc(appNode, "change", "en-validate", ev);
                            break;
                        case "en-auto-clear":
                            (<EngineForm | EngineInput>elem).$autoClear = true;
                            break;
                    }
                });

                for (var i = 0, l = elem.childNodes.length; i < l; i++)
                    if (elem.childNodes[i].nodeType == 3)
                    {
                        textNode = <AppNode><Node>elem.childNodes[i];

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
            return jQuery( Compiler.digest(elm, controller) );
        }
    }
}