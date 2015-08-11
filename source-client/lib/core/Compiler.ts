module Animate
{
    export class Compiler
    {
        static validators = {
            "alpha-numeric": /^[a-z0-9]+$/i,
            "non-empty": /\S/,
            "alpha-numeric-plus": /^[a-zA-Z0-9 -]+$/,
            "email": /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i
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

        private static parse(script, ctrl, e, elm: Element): any
        {
            return eval("'use strict'; var __ret = " + script + "; __ret;")
        }

        static digestCSS(elm: Element, controller: any, value: string)
        {
            var object = Compiler.parse(value, controller, null, elm );
            for (var i in object)
                if (object[i])
                    elm.classList.add(i);
                else if (elm.classList.contains(i))
                    elm.classList.remove(i);
        }


        static digest(elm: JQuery, controller: any): JQuery
        {
            // Gets each of the text nodes and does a search replace on any double moustace characters
            var tnodes: Array<Node> = Compiler.getTextNodesIn(elm.get(0), false);
            var matches: RegExpMatchArray;
            var textNode: Node;
            for (var i = 0, l = tnodes.length; i < l; i++)
            {
                textNode = tnodes[i];
                textNode.nodeValue = textNode.nodeValue.replace(/{{\s*[\w\.]+\s*}}/g, function (sub, val)
                {
                    var t = sub.match(/[\w\.]+/);
                    return Compiler.parse(t, controller, null, <Element>textNode);
                })
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
                        case "en-click":
                            (<HTMLElement>elem).onclick = function (e)
                            {
                                Compiler.parse(value, controller, e, elem);
                                Compiler.digest(elm, controller);
                            };
                            break;
                        case "en-dclick":
                            (<HTMLElement>elem).ondblclick = function (e)
                            {
                                Compiler.parse(value, controller, e, elem);
                                Compiler.digest(elm, controller);
                            };
                            break;
                        case "en-change":
                            (<HTMLInputElement>elem).onchange = function (e)
                            {
                                Compiler.parse(value, controller, e, elem);
                                Compiler.digest(elm, controller);
                            };
                            break;
                        case "en-validate":
                            (<HTMLInputElement>elem).onchange = function (e)
                            {
                                var expressions = [];
                                for (var i = 0, values = value.split("|"), l = values.length; i < l; i++)
                                    if (Compiler.validators[values[i]])
                                        expressions.push(Compiler.validators[values[i]]);

                                (<any>elem).$error = false;
                                for (var i = 0, l = expressions.length; i < l; i++)
                                    if (!(<HTMLInputElement>elem).value.match(expressions[i]))
                                    {
                                        (<any>elem).$error = true;
                                        break;
                                    }

                                Compiler.digest(elm, controller);
                            };
                            break;
                    }
                });
            });



            return Compiler.digest(elm, controller);
        }
    }
}