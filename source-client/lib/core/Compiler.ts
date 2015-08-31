module Animate
{
    type CompiledEval = (ctrl, event, elm, contexts) => any;

    export interface AppNode extends Node
    {
        // Bug in IE  means that blank text nodes are removed - we need them to stay
        // So parents of text nodes keep a reference of the node to stop it from being removed.
        $ieTextNodes: Array<AppNode>;

        // An optional expression associated with the node
        $expression: string;

        // The type of expression stored
        $expressionType: string;

        // When nodes are expanded, the object that describes the expansion is cloned. Any updates are then examined against this clone.
        // If the object is different to the clone, then the dyanmic nodes are re-created
        $clonedData: any;
        $clonedElements: Array<Element>;

        // True when the node is added by expansion attributes (eg: en-if / en-repeat)
        $dynamic: boolean;

        // Referene of origin node if cloned
        $originalNode: AppNode;

        // The compiled eval function of the engine attribute
        $compliledEval: { [name: number]: CompiledEval };

        // A context variable name. If nodes are dynamically created, any context variables are assign to the node. (eg en-repeate="plugins as plugin")
        $ctx: string; // "plugin"

        // A context variable value. If nodes are dynamically created, any context variables are assign to the node (eg en-repeate="plugins as plugin")
        $ctxValue: any; // The actual plugin objecy

        // A reference of all events attached with this node
        $events: Array< { name: string; tag: string; func: any; }>;
    }

    export interface RootNode extends AppNode
    {
        // The controller associated with the element. Assigned on a build
        $ctrl: any;

        // Stores an array of all nodes that are dynamic and can grow or shrink based on conditionality
        $dynamicNodes: Array<Node>
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

    /**
    * Defines a set of functions for compiling template commands and a controller object. 
    */
    export class Compiler
    {
        private static attrs: Array<Attr> = [];


        static validators = {
            "alpha-numeric": { regex: /^[a-z0-9]+$/i, name: "alpha-numeric", negate: false },
            "non-empty": { regex: /\S/, name: "non-empty", negate: false },
            "alpha-numeric-plus": { regex: /^[a-zA-Z0-9_\-!]+$/, name: "alpha-numeric-plus", negate: false },
            "email-plus": { regex: /^[a-zA-Z0-9_\-!@\.]+$/, name: "email-plus", negate: false },
            "email": { regex: /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i, name: "email", negate: false },
            "no-html": { regex: /(<([^>]+)>)/ig, name: "no-html", negate: true }
        };
        

        private static compileEval(script: string, elm: Element): CompiledEval
        {
            var contexts = {};
            var p: AppNode = <AppNode><Node>elm;
            while (p)
            {
                if (p.$ctx && p.$ctx != "" && p.$ctxValue)
                    contexts[p.$ctx] = p.$ctxValue;

                p = <AppNode>p.parentNode;
            }

            var ctx = "";
            for (var i in contexts)
                ctx += `var ${i} = contexts['${i}'];`;


            return <CompiledEval>new Function("ctrl", "event", "elm", "contexts", "'use strict'; " + ctx + " var __ret = " + script + "; return __ret;");   
        }

        /**
        * Evaluates and returns an expression 
        * @return {any}
        */
        private static parse(script: string, ctrl: any, event: any, elm: Element ): any
        {
            var contexts = {};
            var p: AppNode = <AppNode><Node>elm;
            var appNode = <AppNode><Node>elm;
            if (p.$ctx && p.$ctx != "")
            {
                if (p.$ctx && p.$ctx != "" && p.$ctxValue)
                    contexts[p.$ctx] = p.$ctxValue;

                p = <AppNode>p.parentNode;
            }

            if (!appNode.$compliledEval)
                appNode.$compliledEval = {};
            
            if (!appNode.$compliledEval[script])
                appNode.$compliledEval[script] = Compiler.compileEval(script, elm);
  
            return appNode.$compliledEval[script](ctrl, event, elm, contexts);
        }

        /**
        * Evaluates an expression and assigns new CSS styles based on the object returned
        */
        static digestCSS(elm: Element, controller: any, value: string)
        {
            var object = Compiler.parse(value, controller, null, elm);
            for (var i in object)
            {
                if (object[i])
                    elm.classList.add(i);
                else if (elm.classList.contains(i))
                    elm.classList.remove(i);
            }
        }

        /**
        * Clones an object and creates a new identical object. This does not return the same class - only a copy of each of its properties
        * @param {any} obj The object to clone
        * @returns {any}
        */
        static clone(obj) : any
        {
            var copy;

            // Handle the 3 simple types number, string, bool, null or undefined
            if (null == obj || "object" != typeof obj)
                return obj;

            // Handle Date
            if (obj instanceof Date)
            {
                copy = new Date();
                copy.setTime(obj.getTime());
                return copy;
            }

            // Handle Array
            if (obj instanceof Array)
            {
                copy = [];
                for (var i = 0, len = obj.length; i < len; i++)
                {
                    copy[i] = Compiler.clone(obj[i]);
                }
                return copy;
            }

            // Handle Object
            if (obj instanceof Object)
            {
                copy = {};
                for (var attr in obj)
                {
                    if (obj.hasOwnProperty(attr)) copy[attr] = Compiler.clone(obj[attr]);
                }
                return copy;
            }

            throw new Error("Unable to copy obj! Its type isn't supported.");
        }

        /**
        * Checks each  of the properties of an obejct to see if its the same as another
        * @param {any} a The first object to check
        * @param {any} b The target we are comparing against
        * @returns {boolean}
        */
        static isEquivalent(a: any, b: any): boolean
        {
            if ((null == a || "object" != typeof a) && (null == b || "object" != typeof b))
                return a == b;
            else if ((a == null && b == null) || (a == undefined && b == undefined))
                return true;
            else if (a == null || a == undefined)
                return false;
            else if (b == null || b == undefined)
                return false;

            // Create arrays of property names
            var aProps = Object.getOwnPropertyNames(a);
            var bProps = Object.getOwnPropertyNames(b);

            // If number of properties is different,
            // objects are not equivalent
            if (aProps.length != bProps.length)
                return false;

            for (var i = 0; i < aProps.length; i++)
            {
                var aPropName = aProps[i];
                var bPropName = bProps[i];

                if (aPropName != bPropName)
                    return false;

                var aVal = a[aPropName];
                var bVal = b[bPropName];

                if (null == aVal || "object" != typeof aVal)
                {
                    if (aVal !== b[bPropName])
                        return false;
                }
                else if (aVal instanceof Array)
                {
                    if (bVal instanceof Array == false)
                        return false;

                    for (var ai = 0, al = aVal.length; ai < al; ai++)
                        if (!Compiler.isEquivalent(aVal, bVal))
                            return false;
                }
                else if (aVal instanceof Date)
                {
                    if (bVal instanceof Date == false)
                        return false;

                    if (aVal.getTime() != bVal.getTime())
                        return false;
                }
                else
                {
                    if (!Compiler.isEquivalent(aProps[i], bProps[i]))
                        return false;
                }
            }

            // If we made it this far, objects
            // are considered equivalent
            return true;
        }

        /**
        * Evaluates an expression and assigns new CSS styles based on the object returned
        */
        static digestStyle(elm: HTMLElement, controller: any, value: string)
        {
            var object = Compiler.parse(value, controller, null, elm);
            for (var i in object)
                elm.style[i] = object[i];
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
        * Traverses an element down to its child nodes
        * @param {Node} elm The element to traverse
        * @param {Function} callback The callback is called for each child element
        */
        static traverse(elm: Node, callback: Function)
        {
            var cont = true;
            function search(e: Node)
            {
                cont = callback.call(e, e);
                if (cont !== false)
                    for (var c = e.childNodes, i = 0, l = c.length; i < l; i++)
                        search(c[i]);
            }

            

            search(elm);
        }

        /**
        * Called to remove and clean any dynamic nodes that were added to the node
        * @param {AppNode} sourceNode The parent node from which we are removing clones from
        */
        static removeClones(sourceNode: AppNode)
        {
            // Remove existing clones
            for (var i = 0, l = sourceNode.$clonedElements.length; i < l; i++)
            {
                var appNode: AppNode = <AppNode><Node>sourceNode.$clonedElements[i];
                appNode.$ctx = "";
                appNode.$ctxValue = null;
                appNode.$compliledEval = null;
                appNode.$ieTextNodes = null;

                // Go through each child and assign the context
                if (appNode.$ctx.trim() != "")
                {
                    Compiler.traverse(appNode, function (child: AppNode)
                    {
                        // If comment node do nothing
                        if (child.nodeType == 8)
                            return;

                        child.$ctx = "";
                        child.$ctxValue = null;
                    });
                };

                Compiler.removeEvents(<Element><Node>sourceNode);
                jQuery(sourceNode.$clonedElements[i]).remove();
            }

            sourceNode.$clonedElements.splice(0, sourceNode.$clonedElements.length);
        }

        /**
        * Explores and enflates the html nodes with enflatable expressions present (eg: en-repeat)
        * @param {RootNode} root The root element to explore
        * @param {any} ctrl The controller
        * @param {boolean} includeSubTemplates When traversing the template - should the compiler continue if it finds a child element with an associated controller
        */
        static expand(root: RootNode, ctrl: any, includeSubTemplates: boolean = false): Element
        {
            var toRemove: Array<Element> = [];
            var comments: Array<Node> = root.$dynamicNodes;
        
            // Go through each comment and expand it
            for (var i = 0, l = comments.length; i < l; i++)
            {
                var comment = jQuery(comments[i]);
                var commentElement: AppNode = <AppNode><Node>comments[i];
                
                if (commentElement.$expression)
                {
                    var $expression = commentElement.$expression;

                    if (commentElement.$expressionType == "en-repeat")
                    {
                        var e = $expression.split("as");
                        if (e.length > 1 && e[0].trim() != "" && e[1].trim() != "")
                        {
                            var loopExpression = e[0];
                            var ctx = e[1];

                            var expressionValue = Compiler.parse(loopExpression, ctrl, null, <Element><Node>commentElement);
                            if (Compiler.isEquivalent(expressionValue, commentElement.$clonedData ) == false)
                            {
                                // Remove any existing nodes
                                Compiler.removeClones(commentElement);

                                if (expressionValue)
                                {
                                    for (var t in expressionValue)
                                    {
                                        var clone = jQuery(commentElement.$originalNode).clone();
                                        var newNode: AppNode = <AppNode><Node>clone.get(0);
                                        newNode.$dynamic = true;
                                        newNode.$ctx = ctx;
                                        newNode.$ctxValue = expressionValue[t];

                                        // Go through each child and assign the context
                                        if (ctx.trim() != "")
                                        {
                                            Compiler.traverse(newNode, function (child: AppNode)
                                            {
                                                // If comment node do nothing
                                                if (child.nodeType == 8 )
                                                    return;

                                                child.$ctx = ctx;
                                                child.$ctxValue = expressionValue[t];
                                            });
                                        };

                                        clone.insertAfter(comment);

                                        commentElement.$clonedElements.push(<Element><Node>newNode);

                                    };
                                }

                                commentElement.$clonedData = Compiler.clone(expressionValue);
                            }
                        }
                    }
                    else if (commentElement.$expressionType == "en-if")
                    {
                        var expressionValue = Compiler.parse($expression, ctrl, null, <Element><Node>commentElement);
                        if (Compiler.isEquivalent(expressionValue, commentElement.$clonedData) == false)
                        {
                            // Remove any existing nodes
                            Compiler.removeClones(commentElement);
                            
                            if (expressionValue)
                            {
                                var clone = jQuery(commentElement.$originalNode).clone();
                                var newNode: AppNode = <AppNode><Node>clone.get(0);
                                if (<Element><Node>commentElement.$originalNode == <Element><Node>root)
                                    root = <RootNode><Node>clone.get(0);

                                newNode.$dynamic = true;
                                clone.insertAfter(comment);
                                commentElement.$clonedElements.push(<Element><Node>newNode);
                            }

                            commentElement.$clonedData = Compiler.clone(expressionValue);
                        }
                    }
                }
            }

            return <Element><Node>root;
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
        * @param {boolean} includeSubTemplates When traversing the template - should the compiler continue if it finds a child element with an associated controller
        * @returns {Element}
        */
        static digest(jElem: JQuery, controller: any, includeSubTemplates: boolean = false): Element
        {
            var elm: Element = jElem.get(0);
            var matches: RegExpMatchArray;
            var textNode: AppNode;
            var expanded;

            var rootNode: RootNode = <RootNode><Node>elm;
            if (rootNode.$dynamicNodes)
            {
                expanded = Compiler.expand(rootNode, controller, includeSubTemplates);
                if (expanded != elm)
                {
                    elm = expanded;
                    jElem = jQuery(elm);
                }
            }

            // Traverse each element
            Compiler.traverse(elm, function (elem)
            {
                if (!includeSubTemplates && (<RootNode><Node>elem).$ctrl && elm != elem)
                    return false;

                // Do nothing for comment nodes
                if (elem.nodeType == 8)
                    return;
                
                // If a text node
                if (elem.nodeType == 3)
                {
                    textNode = <AppNode><Node>elem;
                    var origText = "";
                    if (textNode.$expression)
                        origText = textNode.$expression;
                    else
                        origText = textNode.nodeValue;

                    var parsedText = origText.replace(/\{\{(.*?)\}\}/g, function (sub, val)
                    {
                        textNode.$expression = origText;
                        var t = sub.match(/[^{}]+/);
                        return Compiler.parse(val, controller, null, <Element><Node>textNode);
                    });

                    if (parsedText != origText)
                    {
                        textNode.nodeValue = parsedText;

                        if (textNode.$expression && textNode.nodeValue.trim() == "")
                        {
                            if (!(<AppNode>textNode.parentNode).$ieTextNodes)
                                (<AppNode>textNode.parentNode).$ieTextNodes = [];

                            if ((<AppNode>textNode.parentNode).$ieTextNodes.indexOf(textNode) == -1)
                                (<AppNode>textNode.parentNode).$ieTextNodes.push(textNode);
                        }
                    }
                    
                    return;
                }

                var appNode = <AppNode><Node>elem;
                var attrs: Array<Attr> = Compiler.attrs;
                attrs.splice(0, attrs.length);
                for (var i = 0; i < (<Element>elem).attributes.length; i++)
                    attrs.push( (<Element>elem).attributes[i] );

                // Go through each element's attributes
                jQuery.each(attrs, function (i, attrib)
                {
                    if (!attrib) return;
                    var name = attrib.name;
                    var value = attrib.value;

                    switch (name)
                    {
                        case "en-src":
                            var src = Compiler.parse(value, controller, null, elem);
                            if (src != (<any>elem).$prevSrc)
                            {
                                (<HTMLImageElement>elem).src = src;
                                (<any>elem).$prevSrc = src;
                            }
                            break;
                        case "en-show":
                            var disp = (Compiler.parse(value, controller, null, elem) ? "" : "none");
                            if (disp != (<HTMLImageElement>elem).style.display )
                                (<HTMLImageElement>elem).style.display = disp;
                            break;
                        case "en-class":
                            Compiler.digestCSS(elem, controller, value);
                            break;
                        case "en-style":
                            Compiler.digestStyle(elem, controller, value);
                            break;
                        case "en-model":
                            var ev = function (e)
                            {
                                Compiler.parse(`${value} = elm.value`, controller, e, elem);
                                Compiler.digest(jElem, controller, includeSubTemplates);
                            };

                            Compiler.parse(`${value} = elm.value`, controller, null, elem);
                            Compiler.registerFunc(appNode, "change", "en-model", ev);
                            break;
                        case "en-click":
                            var ev = function (e)
                            {
                                Compiler.parse(value, controller, e, elem);
                                Compiler.digest(jElem, controller, includeSubTemplates);
                            };

                            Compiler.registerFunc(appNode, "click", "en-click", ev);
                            break;
                        case "en-mouse-over":
                            var ev = function (e)
                            {
                                Compiler.parse(value, controller, e, elem);
                                Compiler.digest(jElem, controller, includeSubTemplates);
                            };

                            Compiler.registerFunc(appNode, "mouseover", "en-mouse-over", ev);
                            break;
                        case "en-dclick":
                            var ev = function (e)
                            {
                                Compiler.parse(value, controller, e, elem);
                                Compiler.digest(jElem, controller, includeSubTemplates);
                            };
                            
                            Compiler.registerFunc(appNode, "dblclick", "en-dclick", ev);
                            break;
                        case "en-change":

                            var ev = function (e)
                            {
                                Compiler.parse(value, controller, e, elem);
                                Compiler.digest(jElem, controller, includeSubTemplates);
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
                                    var err = Compiler.checkValidations(this.getAttribute("en-validate"), <HTMLInputElement>subElem);
                                    if (err)
                                    {
                                        form.$error = true;
                                        form.$pristine = false;
                                    }
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
                                Compiler.digest(jElem, controller, includeSubTemplates);
                            };

                            Compiler.registerFunc(appNode, "submit", "en-submit", ev);
                            break;
                        case "en-validate":
                            
                            // Set the parent form to be pristine
                            if ((<HTMLInputElement>elem).form)
                                (<EngineForm>(<HTMLInputElement>elem).form).$pristine = true;

                            var ev = function (e)
                            {
                                // IF it has a form - check other elements for errors
                                var form: EngineForm = <EngineForm>(<HTMLInputElement>elem).form;
                                if (form)
                                {
                                    form.$error = false;
                                    form.$errorInput = "";
                                }

                                Compiler.checkValidations(value, <HTMLInputElement>elem);

                                // IF it has a form - check other elements for errors
                                if (form)
                                {
                                    jQuery("[en-validate]", form).each(function (index, subElem)
                                    {
                                        if ((<EngineInput>subElem).$error)
                                        {
                                            form.$error = true;
                                            form.$errorInput = (<HTMLInputElement | HTMLTextAreaElement>subElem).name;
                                        }
                                    });
                                }

                                Compiler.digest(jElem, controller, includeSubTemplates);
                            };
                            
                            Compiler.registerFunc(appNode, "change", "en-validate", ev);
                            break;
                        case "en-auto-clear":
                            (<EngineForm | EngineInput>elem).$autoClear = true;
                            break;
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
        static checkValidations(value: string, elem: HTMLInputElement| HTMLTextAreaElement): boolean
        {
            var expressions: Array<{ name: string; regex: RegExp; negate: boolean;  }> = [];
            var form: EngineForm = <EngineForm>elem.form;

            for (var i = 0, values = value.split("|"), l = values.length; i < l; i++)
                if (Compiler.validators[values[i]])
                    expressions.push(Compiler.validators[values[i]]);

            (<EngineInput>elem).$error = false;
            for (var i = 0, l = expressions.length; i < l; i++)
            {
                var matches : any = elem.value.match(expressions[i].regex);

                if (expressions[i].negate)
                    if (matches)
                        matches = null;
                    else
                        matches = true;

                if (!matches)
                {
                    (<EngineInput>elem).$error = true;
                    if (form)
                    {
                        form.$errorExpression = expressions[i].name;
                        form.$errorInput = elem.name;
                    }

                    break;
                }
            }

            return (<EngineInput>elem).$error;
        }

        /**
        * Goes through an element and prepares it for the compiler. This usually involves adding event listeners
        * and manipulating the DOM. This should only really be called once per element. If you need to update the
        * element after compilation you can use the digest method
        * @param {JQuery} elm The element to traverse
        * @param {any} ctrl The controller associated with the element
        * @param {boolean} includeSubTemplates When traversing the template - should the compiler continue if it finds a child element with an associated controller
        * @returns {JQuery}
        */
        static build(elm: JQuery, ctrl: any, includeSubTemplates: boolean = false): JQuery
        {
            var rootNode = <RootNode><Node>elm.get(0);
            rootNode.$ctrl = ctrl;
            rootNode.$dynamicNodes = [];

            var potentials: Array<Element> = [];
                
            // First go through each of the nodes and find any elements that will potentially grow or shrink
            // Traverse each element
            Compiler.traverse(rootNode, function (elem: Element)
            {
                if (!includeSubTemplates && (<RootNode><Node>elem).$ctrl && (<RootNode><Node>elem).$ctrl != ctrl)
                    return false;
                
                // Only allow element nodes
                if (elem.nodeType != 1)
                    return;

                if ((<AppNode><Node>elem).$dynamic)
                    return;

                var attrs: Array<Attr> = Compiler.attrs;
                attrs.splice(0, attrs.length);
                for (var i = 0; i < (<Element>elem).attributes.length; i++)
                    attrs.push((<Element>elem).attributes[i]);

                // Go through each element's attributes
                jQuery.each(attrs, function (i, attrib)
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

            // Replace the potentials with comments that keep a reference to the original node
            for (var i = 0, l = potentials.length; i < l; i++)
            {
                var comment = jQuery(`<!-- ${(<AppNode><Node>potentials[i]).$expressionType} -->`);
                var commentElement: AppNode = <AppNode><Node>comment.get(0);

                commentElement.$clonedElements = [];
                commentElement.$originalNode = <AppNode><Node>potentials[i];
                commentElement.$expression = commentElement.$originalNode.$expression;
                commentElement.$expressionType = commentElement.$originalNode.$expressionType;

                jQuery(potentials[i]).replaceWith(comment);
                rootNode.$dynamicNodes.push(commentElement);
            }


            return jQuery(Compiler.digest(elm, ctrl, includeSubTemplates));
        }
    }
}