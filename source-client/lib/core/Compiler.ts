module Animate
{
    export class Compiler
    {
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

        static parse(e, ctrl): any
        {
            return eval("'use strict'; " + e)
        }

        static build(elm: JQuery, controller: any): JQuery
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
                    return Compiler.parse(t, controller);
                })
            }

            // Traverse each element
            elm.find("*").addBack().each(function (index, elem)
            {
                // Go through each element's attributes
                jQuery.each(this.attributes, function (i, attrib)
                {
                    var name = attrib.name;
                    var value = attrib.value;
                    
                    switch (name)
                    {
                        case "en-click":
                            (<HTMLElement>elem).onclick = function (ev) { controller[value](ev); };
                            break;
                        case "en-dclick":
                            (<HTMLElement>elem).ondblclick = function (ev) { controller[value](ev); };
                            break;
                        case "en-src":
                            (<HTMLImageElement>elem).src = Compiler.parse(value, controller);
                        case "en-show":
                            (<HTMLImageElement>elem).style.display = (Compiler.parse(value, controller) ? "": "none" );
                    }
                });
            });

            return elm;
        }
    }
}