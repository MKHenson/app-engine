module Animate
{
    export type CompiledEval = (ctrl, event, elm, contexts) => any;
    
    /* 
    * Directives are classes that define rules for expanding compiler blocks (eg en-repeat)
    */
    export interface IDirective
    {
        /* 
        * Expands the html directive
        * @param {string} expression The JS expression in the HTML value attribute
        * @param {any} ctrl The controller
        * @param {DescriptorNode} The reference descriptor comment node
        * @param {InstanceNode} The current instance
        * @return A null return signifies that nothing should be done - an array returned will reformat the HTML
        */
        expand(expression: string, ctrl: any, desc: DescriptorNode, instance: InstanceNode): Array<AppNode>;
    }

    /* 
    * A custom node interface for compiler nodes
    */
    export interface AppNode extends Node
    {
        /* Bug in IE  means that blank text nodes are removed - we need them to stay
        * So parents of text nodes keep a reference of the node to stop it from being removed.*/
        $ieTextNodes: Array<AppNode>;

        /* An optional expression associated with the node */
        $expression: string;

        /* The type of expression stored */
        $expressionType: string;
        
        /* The compiled eval function of the engine attribute */
        $compliledEval: { [name: number]: CompiledEval };
        
        /* A context variable value. If nodes are dynamically created, any context variables are assign to the node (eg en-repeate="plugins as plugin") */
        $ctxValues: Array<{ name: string; value: any;}>

        /* A reference of all events attached with this node */
        $events: Array< { name: string; tag: string; func: any; }>;

        /* A tag to help identify nodes already compiled */
        $dynamic: boolean;

        /* When nodes are expanded, the object that describes the expansion is cloned. Any updates are then examined against this clone.
         If the object is different to the clone, then the dyanmic nodes are re-created */
        $clonedData: any;
    }
    
    export interface InstanceNode extends AppNode
    {
        $clonedElements: Array<AppNode>;
    }

    export interface DescriptorNode extends InstanceNode
    {
        /* Referene of origin node if cloned */
        $originalNode: AppNode;
    }

    export interface RootNode extends AppNode
    {
        // The controller associated with the element. Assigned on a build
        $ctrl: any;
        
        /* Each root node holds a list of references that are used in expansions with attributes like en-repeat */
        $commentReferences: { [id: string]: DescriptorNode };
    }

    export interface NodeInput extends HTMLInputElement
    {
        $error: boolean;
        $autoClear: boolean;
    }

    export interface NodeForm extends HTMLFormElement
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
        public static directives: { [name: string]: IDirective; } = {};
        private static attrs: Array<Attr> = [];
        private static $commentRefIDCounter: number = 0;

        static validators = {
            "alpha-numeric": { regex: /^[a-z0-9]+$/i, name: "alpha-numeric", negate: false },
            "non-empty": { regex: /\S/, name: "non-empty", negate: false },
            "alpha-numeric-plus": { regex: /^[a-zA-Z0-9_\-!]+$/, name: "alpha-numeric-plus", negate: false },
            "email-plus": { regex: /^[a-zA-Z0-9_\-!@\.]+$/, name: "email-plus", negate: false },
            "email": { regex: /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i, name: "email", negate: false },
            "no-html": { regex: /(<([^>]+)>)/ig, name: "no-html", negate: true }
        };
        
        /**
        * Clones each of the nodes and their custom attributes
        * @param {Node} node The node to clone
        * @returns {Node}
        */
        public static cloneNode(node: AppNode): Node
        {
            var clone: AppNode = <AppNode>node.cloneNode(false);

            // All custom properties are copied here
            clone.$compliledEval = node.$compliledEval;
            clone.$ctxValues = node.$ctxValues;
            clone.$dynamic = true;
            clone.$expression = node.$expression;
            clone.$expressionType = node.$expressionType;
            clone.$ieTextNodes = node.$ieTextNodes;
            
            // If a descriptor node
            if (node.hasOwnProperty("$originalNode"))
            {
                (<DescriptorNode>clone).$clonedElements = [];
                (<DescriptorNode>clone).$originalNode = (<DescriptorNode>node).$originalNode;
            }

            // Clone and add all children
            for (var i = 0, l = node.childNodes.length; i < l; i++)
                clone.appendChild(Compiler.cloneNode(<AppNode>node.childNodes[i]));

            return clone;
        }

        /**
        * Given a string, this function will compile it into machine code that can be stored and run
        * @param {string} script The script to compile
        * @param {AppNode} elm The element whose attributes require the compilation
        * @param {Array<any>} $ctxValues [Optional] Context values passed down from any dynamically generated HTML. The array consists
        * of key object pairs that are translated into variables for use in the script.
        * @returns {CompiledEval}
        */
        private static compileEval(script: string, elm: AppNode, $ctxValues?: Array<any>): CompiledEval
        {
            var contexts = {};
            var ctxValues = $ctxValues || elm.$ctxValues;
            if (ctxValues)
            {
                for (var i in ctxValues)
                    contexts[ctxValues[i].name] = ctxValues[i].value;
            }
            
            var ctx = "";
            for (var i in contexts)
                ctx += `var ${i} = contexts['${i}'];`;


            return <CompiledEval>new Function("ctrl", "event", "elm", "contexts", "'use strict'; " + ctx + " var __ret = " + script + "; return __ret;");   
        }

        /**
        * Compilers and runs a script which then should return a value
        * @param {string} script The script to compile
        * @param {any} ctrl The controller associated with the compile evaluation
        * @param {AppNode} elm The element whose attributes require the compilation
        * @param {Array<any>} $ctxValues [Optional] Context values passed down from any dynamically generated HTML. The array consists
        * of key object pairs that are translated into variables for use in the script.
        * @returns {CompiledEval}
        * @return {any}
        */
        public static parse(script: string, ctrl: any, event: any, elm: AppNode, $ctxValues?: Array<any>): any
        {
            var contexts = {};
            var ctxValues = $ctxValues || elm.$ctxValues;
            if (ctxValues)
            {
                for (var i in ctxValues)
                    contexts[ctxValues[i].name] = ctxValues[i].value;
            }
            
            if (!elm.$compliledEval)
                elm.$compliledEval = {};
            
            if (!elm.$compliledEval[script])
                elm.$compliledEval[script] = Compiler.compileEval(script, elm, $ctxValues);
  
            return elm.$compliledEval[script](ctrl, event, elm, contexts);
        }

        /**
        * Evaluates an expression and assigns new CSS styles based on the object returned
        */
        static digestCSS(elm: AppNode, controller: any, value: string)
        {
            var object = Compiler.parse(value, controller, null, elm, null);
            var htmlElem = <HTMLElement><Node>elm;
            for (var i in object)
            {
                if (object[i])
                {
                    htmlElem.classList.add(i);
                    htmlElem.offsetWidth;
                }
                else if (htmlElem.classList.contains(i))
                    htmlElem.classList.remove(i);
            }
        }

        /**
        * Clones an object and creates a new identical object. This does not return the same class - only a copy of each of its properties
        * @param {any} obj The object to clone
        * @returns {any}
        */
        static clone(obj, deepCopy: boolean = true): any
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
                    if (deepCopy)
                    {
                        if (obj.hasOwnProperty(attr)) copy[attr] = Compiler.clone(obj[attr], true);
                    }
                    else
                    {
                        if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
                    }
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
                    if (!Compiler.isEquivalent(aVal, bVal))
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
        static digestStyle(elm: AppNode, controller: any, value: string)
        {
            var object = Compiler.parse(value, controller, null, elm, null);
            for (var i in object)
                (<HTMLElement><Node>elm).style[i] = object[i];

            (<HTMLElement><Node>elm).offsetWidth;
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
                {
                    var prevL = e.childNodes.length;
                    for (var i = 0; i < e.childNodes.length; i++)
                    {
                        prevL = e.childNodes.length; 
                        search(e.childNodes[i]); 
                       
                        if (e.childNodes.length < prevL)
                            i = i - (e.childNodes.length - prevL);
                    }
                }
            }

            search(elm);
        }

        /**
        * Called to remove and clean any dynamic nodes that were added to the node
        * @param {DescriptorNode} sourceNode The parent node from which we are removing clones from
        */
        static cleanupNode(appNode: AppNode)
        {
            appNode.$ctxValues = null;
            appNode.$compliledEval = null;
            appNode.$ieTextNodes = null;
            (<InstanceNode>appNode).$clonedElements = null;
            (<DescriptorNode>appNode).$originalNode = null;
            appNode.$clonedData = null;
            Compiler.removeEvents(<Element><Node>appNode);
            appNode.$events = null;

            // Cleanup kids
            Compiler.traverse(appNode, function (child: AppNode)
            {
                if (appNode == child)
                    return;

                Compiler.cleanupNode(child);
            });

            // Remove from dom
            jQuery(appNode).remove();
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
            var mostRecentRoot: RootNode = root;

            var references = {};
            for (var i in root.$commentReferences)
                references[i] = root.$commentReferences[i];

            Compiler.traverse(root, function (child: Node)
            {
                // Join any comment references
                if ((<RootNode><Node>child).$ctrl)
                {
                    var subRoot = <RootNode><Node>child;
                    for (var i in subRoot.$commentReferences)
                        references[i] = subRoot.$commentReferences[i];
                }

                if (child.nodeType != 8)
                    return;


                var comment: JQuery;
                var commentElement: DescriptorNode; 
                var commentReferenceNumbers = child.nodeValue.match(/\d+/gi);

                // Get the comment reference number - and look it up in the root node registered comments
                if (child.nodeType == 8 && commentReferenceNumbers)
                {
                    var id = commentReferenceNumbers[0];
                    commentElement = references[id];
                    comment = jQuery(commentElement);
                }
                
                // If the comment matches a root node flagged comment
                if (commentElement && commentElement.$originalNode.$expression)
                {
                    var $expression = commentElement.$originalNode.$expression;
                    var $expressionType = commentElement.$originalNode.$expressionType;

                    // Check to see if the directive exists
                    if (Compiler.directives[$expressionType])
                    {
                        // Processes the value and returns nodes to added or null if nothing must be done
                        var results = Compiler.directives[$expressionType].expand($expression, ctrl, commentElement, <InstanceNode>child);
                        var newNode: AppNode;

                        // Do nothing
                        if (!results)
                            return;

                        // Remove any existing nodes
                        for (var c = 0, k = (<InstanceNode>child).$clonedElements.length; c < k; c++)
                            Compiler.cleanupNode((<InstanceNode>child).$clonedElements[c]);

                        (<InstanceNode>child).$clonedElements.splice(0, (<InstanceNode>child).$clonedElements.length);

                        // Go through each node that was created
                        for (var k = 0, lk = results.length; k < lk; k++)
                        {
                            newNode = results[k];

                            // Make sure the node has context variables
                            if (!newNode.$ctxValues)
                                newNode.$ctxValues = [];

                            // If the parent element has context values - then add those to the clone
                            if (child.parentNode && (<AppNode><Node>child.parentNode).$ctxValues)
                                newNode.$ctxValues = newNode.$ctxValues.concat((<AppNode><Node>child.parentNode).$ctxValues);

                            // Go through each child node and assign the context variables
                            if (newNode.$ctxValues.length > 0)
                            {
                                Compiler.traverse(newNode, function (c: AppNode)
                                {
                                    if (c == newNode)
                                        return;

                                    if (c.$ctxValues)
                                        c.$ctxValues.concat(newNode.$ctxValues.slice(0, newNode.$ctxValues.length));
                                    else
                                        c.$ctxValues = newNode.$ctxValues.slice(0, newNode.$ctxValues.length);
                                });
                            };

                            // Add the new elements after this child comment
                            var jq = jQuery(newNode);
                            jq.insertAfter(jQuery(child));
                            (<InstanceNode>child).$clonedElements.push(newNode);
                        }
                    }
                }
            });

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
            if (rootNode.$commentReferences)
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

                var jElemWrapper = jQuery(elem);
                
                // If a text node
                if (elem.nodeType == 3)
                {
                    textNode = <AppNode><Node>elem;
                    var origText = "";
                    var dataExpression = textNode.$expression;

                    if (dataExpression)
                        origText = dataExpression;
                    else
                        origText = textNode.nodeValue;

                    var parsedText = origText.replace(/\{\{(.*?)\}\}/g, function (sub, val)
                    {
                        textNode.$expression = origText;
                        return Compiler.parse(val, controller, null, textNode, null);
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
                            var src = Compiler.parse(value, controller, null, elem, null);
                            if (src != (<any>elem).$prevSrc)
                            {
                                (<HTMLImageElement>elem).src = src;
                                (<any>elem).$prevSrc = src;
                            }
                            break;
                        case "en-show":
                            var disp = (Compiler.parse(value, controller, null, elem, null) ? "" : "none");
                            if (disp != (<HTMLImageElement>elem).style.display)
                            {
                                (<HTMLElement>elem).style.display = disp;
                                (<HTMLElement>elem).offsetWidth;
                            }
                            break;
                        case "en-html":
                            var html = Compiler.parse(value, controller, null, elem, null);
                            (<HTMLElement>elem).innerHTML = html;
                            break;
                        case "en-init":
                            Compiler.parse(value, controller, null, elem, null);
                            break;
                        case "en-value":
                            var val = Compiler.parse(value, controller, null, elem, null);
                            (<HTMLInputElement>elem).value = val;
                            break;
                        case "en-selected":
                            var val = Compiler.parse(value, controller, null, elem, null);
                            if (val )
                                (<HTMLOptionElement>elem).setAttribute("selected","selected");
                            else
                                (<HTMLOptionElement>elem).removeAttribute("selected");
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
                                Compiler.parse(`${value} = elm.value`, controller, e, elem, null);
                                Compiler.transform(`${value}`, elem, controller);
                                Compiler.digest(jElem, controller, includeSubTemplates);
                            };

                            Compiler.parse(`${value} = elm.value`, controller, null, elem, null);
                            Compiler.transform(`${value}`, elem, controller);
                            Compiler.registerFunc(appNode, "change", "en-model", ev);
                            break;
                        case "en-click":
                            var ev = function (e)
                            {
                                Compiler.parse(value, controller, e, elem, null);
                                Compiler.digest(jElem, controller, includeSubTemplates);
                            };

                            Compiler.registerFunc(appNode, "click", "en-click", ev);
                            break;
                        case "en-mouse-over":
                            var ev = function (e)
                            {
                                Compiler.parse(value, controller, e, elem, null);
                                Compiler.digest(jElem, controller, includeSubTemplates);
                            };

                            Compiler.registerFunc(appNode, "mouseover", "en-mouse-over", ev);
                            break;
                        case "en-dclick":
                            var ev = function (e)
                            {
                                Compiler.parse(value, controller, e, elem, null);
                                Compiler.digest(jElem, controller, includeSubTemplates);
                            };
                            
                            Compiler.registerFunc(appNode, "dblclick", "en-dclick", ev);
                            break;
                        case "en-change":

                            var ev = function (e)
                            {
                                Compiler.parse(value, controller, e, elem, null);
                                Compiler.digest(jElem, controller, includeSubTemplates);
                            };
                            
                            Compiler.registerFunc(appNode, "change", "en-change", ev);
                            break;
                        case "en-submit":

                            var ev = function (e)
                            {
                                var form: NodeForm = <NodeForm>elem;
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

                                Compiler.parse(value, controller, e, elem, null);
                                Compiler.digest(jElem, controller, includeSubTemplates);
                            };

                            Compiler.registerFunc(appNode, "submit", "en-submit", ev);
                            break;
                        case "en-validate":
                            
                            // Set the parent form to be pristine
                            if ((<HTMLInputElement>elem).form)
                                (<NodeForm>(<HTMLInputElement>elem).form).$pristine = true;

                            var ev = function (e)
                            {
                                // IF it has a form - check other elements for errors
                                var form: NodeForm = <NodeForm>(<HTMLInputElement>elem).form;
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
                                        if ((<NodeInput>subElem).$error)
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
                            (<NodeForm | NodeInput>elem).$autoClear = true;
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
            var form: NodeForm = <NodeForm>elem.form;

            for (var i = 0, values = value.split("|"), l = values.length; i < l; i++)
                if (Compiler.validators[values[i]])
                    expressions.push(Compiler.validators[values[i]]);

            (<NodeInput>elem).$error = false;
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
                    (<NodeInput>elem).$error = true;
                    if (form)
                    {
                        form.$errorExpression = expressions[i].name;
                        form.$errorInput = elem.name;
                    }

                    break;
                }
            }

            return (<NodeInput>elem).$error;
        }

        /**
        * Given an model directive, any transform commands will change the model's object into something else
        * @param {string} value The list of expression names separated by |
        * @param {HTMLInputElement| HTMLTextAreaElement} elem The element to traverse
        */
        static transform(script: string, elem: HTMLInputElement | HTMLTextAreaElement, controller: any)
        {
            var expressions: Array<{ name: string; regex: RegExp; negate: boolean; }> = [];
            var form: NodeForm = <NodeForm>elem.form;

            for (var i = 0, l = elem.attributes.length; i < l; i++)
            {
                if (elem.attributes[i].name == "en-transform")
                    return Compiler.parse(`${script} = ${elem.attributes[i].value}`, controller, null, <AppNode><Node>elem, null);
            }
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
            
            rootNode.$commentReferences = {};

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

                if ((<AppNode><Node>elem).$dynamic || (<InstanceNode><Node>elem).$clonedElements)
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
                Compiler.$commentRefIDCounter++;
                var comment = jQuery(`<!-- ${(<AppNode><Node>potentials[i]).$expressionType}[${Compiler.$commentRefIDCounter}] -->`);
                var commentElement: DescriptorNode = <DescriptorNode><Node>comment.get(0);

                commentElement.$clonedElements = [];
                commentElement.$originalNode = <AppNode><Node>potentials[i];
                commentElement.$expression = commentElement.$originalNode.$expression;
                commentElement.$expressionType = commentElement.$originalNode.$expressionType;
           
                jQuery(potentials[i]).replaceWith(comment);
                rootNode.$commentReferences[Compiler.$commentRefIDCounter.toString()] = commentElement;
            }


            return jQuery(Compiler.digest(elm, ctrl, includeSubTemplates));
        }
    }
}