var Animate;
(function (Animate) {
    /**
    * Defines a set of functions for compiling template commands and a controller object.
    */
    var Compiler = (function () {
        function Compiler() {
        }
        /**
        * Clones each of the nodes and their custom attributes
        * @param {Node} node The node to clone
        * @returns {Node}
        */
        Compiler.cloneNode = function (node) {
            var clone = node.cloneNode(false);
            // All custom properties are copied here
            clone.$compliledEval = node.$compliledEval;
            clone.$ctxValues = node.$ctxValues;
            clone.$dynamic = true;
            clone.$expression = node.$expression;
            clone.$expressionType = node.$expressionType;
            clone.$ieTextNodes = node.$ieTextNodes;
            // If a descriptor node
            if (node.hasOwnProperty("$originalNode")) {
                clone.$clonedElements = [];
                clone.$originalNode = node.$originalNode;
            }
            // Clone and add all children
            for (var i = 0, l = node.childNodes.length; i < l; i++)
                clone.appendChild(Compiler.cloneNode(node.childNodes[i]));
            return clone;
        };
        /**
        * Given a string, this function will compile it into machine code that can be stored and run
        * @param {string} script The script to compile
        * @param {AppNode} elm The element whose attributes require the compilation
        * @param {Array<any>} $ctxValues [Optional] Context values passed down from any dynamically generated HTML. The array consists
        * of key object pairs that are translated into variables for use in the script.
        * @returns {CompiledEval}
        */
        Compiler.compileEval = function (script, elm, $ctxValues) {
            var contexts = {};
            var ctxValues = $ctxValues || elm.$ctxValues;
            if (ctxValues) {
                for (var i in ctxValues)
                    contexts[ctxValues[i].name] = ctxValues[i].value;
            }
            var ctx = "";
            for (var i in contexts)
                ctx += "var " + i + " = contexts['" + i + "'];";
            return new Function("ctrl", "event", "elm", "contexts", "'use strict'; " + ctx + " var __ret = " + script + "; return __ret;");
        };
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
        Compiler.parse = function (script, ctrl, event, elm, $ctxValues) {
            var contexts = {};
            var ctxValues = $ctxValues || elm.$ctxValues;
            if (ctxValues) {
                for (var i in ctxValues)
                    contexts[ctxValues[i].name] = ctxValues[i].value;
            }
            if (!elm.$compliledEval)
                elm.$compliledEval = {};
            if (!elm.$compliledEval[script])
                elm.$compliledEval[script] = Compiler.compileEval(script, elm, $ctxValues);
            return elm.$compliledEval[script](ctrl, event, elm, contexts);
        };
        /**
        * Evaluates an expression and assigns new CSS styles based on the object returned
        */
        Compiler.digestCSS = function (elm, controller, value) {
            var object = Compiler.parse(value, controller, null, elm, null);
            var htmlElem = elm;
            for (var i in object) {
                if (object[i]) {
                    htmlElem.classList.add(i);
                    htmlElem.offsetWidth;
                }
                else if (htmlElem.classList.contains(i))
                    htmlElem.classList.remove(i);
            }
        };
        /**
        * Clones an object and creates a new identical object. This does not return the same class - only a copy of each of its properties
        * @param {any} obj The object to clone
        * @returns {any}
        */
        Compiler.clone = function (obj, deepCopy) {
            if (deepCopy === void 0) { deepCopy = true; }
            var copy;
            // Handle the 3 simple types number, string, bool, null or undefined
            if (null == obj || "object" != typeof obj)
                return obj;
            // Handle Date
            if (obj instanceof Date) {
                copy = new Date();
                copy.setTime(obj.getTime());
                return copy;
            }
            // Handle Array
            if (obj instanceof Array) {
                copy = [];
                for (var i = 0, len = obj.length; i < len; i++) {
                    copy[i] = Compiler.clone(obj[i]);
                }
                return copy;
            }
            // Handle Object
            if (obj instanceof Object) {
                copy = {};
                for (var attr in obj) {
                    if (deepCopy) {
                        if (obj.hasOwnProperty(attr))
                            copy[attr] = Compiler.clone(obj[attr], true);
                    }
                    else {
                        if (obj.hasOwnProperty(attr))
                            copy[attr] = obj[attr];
                    }
                }
                return copy;
            }
            throw new Error("Unable to copy obj! Its type isn't supported.");
        };
        /**
        * Checks each  of the properties of an obejct to see if its the same as another
        * @param {any} a The first object to check
        * @param {any} b The target we are comparing against
        * @returns {boolean}
        */
        Compiler.isEquivalent = function (a, b) {
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
            for (var i = 0; i < aProps.length; i++) {
                var aPropName = aProps[i];
                var bPropName = bProps[i];
                if (aPropName != bPropName)
                    return false;
                var aVal = a[aPropName];
                var bVal = b[bPropName];
                if (null == aVal || "object" != typeof aVal) {
                    if (aVal !== b[bPropName])
                        return false;
                }
                else if (aVal instanceof Array) {
                    if (bVal instanceof Array == false)
                        return false;
                    for (var ai = 0, al = aVal.length; ai < al; ai++)
                        if (!Compiler.isEquivalent(aVal, bVal))
                            return false;
                }
                else if (aVal instanceof Date) {
                    if (bVal instanceof Date == false)
                        return false;
                    if (aVal.getTime() != bVal.getTime())
                        return false;
                }
                else {
                    if (!Compiler.isEquivalent(aVal, bVal))
                        return false;
                }
            }
            // If we made it this far, objects
            // are considered equivalent
            return true;
        };
        /**
        * Evaluates an expression and assigns new CSS styles based on the object returned
        */
        Compiler.digestStyle = function (elm, controller, value) {
            var object = Compiler.parse(value, controller, null, elm, null);
            for (var i in object)
                elm.style[i] = object[i];
            elm.offsetWidth;
        };
        /**
        * Removes all registered events from the node
        * @param {Element} elem The element to remove events from
        */
        Compiler.removeEvents = function (elem) {
            var appNode = elem;
            if (appNode.$events) {
                for (var i = 0, l = appNode.$events.length; i < l; i++)
                    appNode.removeEventListener(appNode.$events[i].name, appNode.$events[i].func);
                appNode.$events.splice(0, appNode.$events.length);
            }
        };
        /**
        * Traverses an element down to its child nodes
        * @param {Node} elm The element to traverse
        * @param {Function} callback The callback is called for each child element
        */
        Compiler.traverse = function (elm, callback) {
            var cont = true;
            function search(e) {
                cont = callback.call(e, e);
                if (cont !== false) {
                    var prevL = e.childNodes.length;
                    for (var i = 0; i < e.childNodes.length; i++) {
                        prevL = e.childNodes.length;
                        search(e.childNodes[i]);
                        if (e.childNodes.length < prevL)
                            i = i - (e.childNodes.length - prevL);
                    }
                }
            }
            search(elm);
        };
        /**
        * Called to remove and clean any dynamic nodes that were added to the node
        * @param {DescriptorNode} sourceNode The parent node from which we are removing clones from
        */
        Compiler.cleanupNode = function (appNode) {
            appNode.$ctxValues = null;
            appNode.$compliledEval = null;
            appNode.$ieTextNodes = null;
            appNode.$clonedElements = null;
            appNode.$originalNode = null;
            appNode.$clonedData = null;
            Compiler.removeEvents(appNode);
            appNode.$events = null;
            // Cleanup kids
            Compiler.traverse(appNode, function (child) {
                if (appNode == child)
                    return;
                Compiler.cleanupNode(child);
            });
            // Remove from dom
            jQuery(appNode).remove();
        };
        /**
        * Explores and enflates the html nodes with enflatable expressions present (eg: en-repeat)
        * @param {RootNode} root The root element to explore
        * @param {any} ctrl The controller
        * @param {boolean} includeSubTemplates When traversing the template - should the compiler continue if it finds a child element with an associated controller
        */
        Compiler.expand = function (root, ctrl, includeSubTemplates) {
            if (includeSubTemplates === void 0) { includeSubTemplates = false; }
            var toRemove = [];
            var mostRecentRoot = root;
            var references = {};
            for (var i in root.$commentReferences)
                references[i] = root.$commentReferences[i];
            Compiler.traverse(root, function (child) {
                // Join any comment references
                if (child.$ctrl) {
                    var subRoot = child;
                    for (var i in subRoot.$commentReferences)
                        references[i] = subRoot.$commentReferences[i];
                }
                if (child.nodeType != 8)
                    return;
                var comment;
                var commentElement;
                var commentReferenceNumbers = child.nodeValue.match(/\d+/gi);
                // Get the comment reference number - and look it up in the root node registered comments
                if (child.nodeType == 8 && commentReferenceNumbers) {
                    var id = commentReferenceNumbers[0];
                    commentElement = references[id];
                    comment = jQuery(commentElement);
                }
                // If the comment matches a root node flagged comment
                if (commentElement && commentElement.$originalNode.$expression) {
                    var $expression = commentElement.$originalNode.$expression;
                    var $expressionType = commentElement.$originalNode.$expressionType;
                    if ($expressionType == "en-repeat") {
                        var e = $expression.split("as");
                        if (e.length > 1 && e[0].trim() != "" && e[1].trim() != "") {
                            var loopExpression = e[0];
                            var ctxParts = e[1].split(",");
                            var ctxValueName = ctxParts[0];
                            var ctxIndexName = ctxParts[1];
                            var expressionValue = Compiler.parse(loopExpression, ctrl, null, commentElement, child.$ctxValues);
                            if (Compiler.isEquivalent(expressionValue, child.$clonedData) == false) {
                                // Remove any existing nodes
                                for (var c = 0, k = child.$clonedElements.length; c < k; c++)
                                    Compiler.cleanupNode(child.$clonedElements[c]);
                                if (expressionValue) {
                                    for (var t in expressionValue) {
                                        var clone = jQuery(Compiler.cloneNode(commentElement.$originalNode));
                                        var newNode = clone.get(0);
                                        newNode.$ctxValues = [{ name: ctxValueName, value: expressionValue[t] }];
                                        if (ctxIndexName && ctxIndexName.trim() != "")
                                            newNode.$ctxValues.push({ name: ctxIndexName, value: t });
                                        // If the parent element has context values - then add those to the clone
                                        if (child.parentNode && child.parentNode.$ctxValues)
                                            newNode.$ctxValues = newNode.$ctxValues.concat(child.parentNode.$ctxValues);
                                        // Go through each child and assign the context
                                        if (newNode.$ctxValues.length > 0) {
                                            Compiler.traverse(newNode, function (c) {
                                                if (c == newNode)
                                                    return;
                                                if (c.$ctxValues)
                                                    c.$ctxValues.concat(newNode.$ctxValues.slice(0, newNode.$ctxValues.length));
                                                else
                                                    c.$ctxValues = newNode.$ctxValues.slice(0, newNode.$ctxValues.length);
                                            });
                                        }
                                        ;
                                        // Add the new elements after this child comment
                                        clone.insertAfter(jQuery(child));
                                        child.$clonedElements.push(newNode);
                                    }
                                    ;
                                }
                                child.$clonedData = Compiler.clone(expressionValue);
                            }
                        }
                    }
                    else if ($expressionType == "en-if") {
                        var expressionValue = Compiler.parse($expression, ctrl, null, commentElement, child.$ctxValues);
                        if (Compiler.isEquivalent(expressionValue, child.$clonedData) == false) {
                            // Remove any existing nodes
                            for (var c = 0, k = child.$clonedElements.length; c < k; c++)
                                Compiler.cleanupNode(child.$clonedElements[c]);
                            if (expressionValue) {
                                var clone = jQuery(Compiler.cloneNode(commentElement.$originalNode));
                                var newNode = clone.get(0);
                                if (commentElement.$originalNode == root)
                                    root = clone.get(0);
                                newNode.$ctxValues = [];
                                // If the parent element has context values - then add those to the clone
                                if (child.parentNode && child.parentNode.$ctxValues)
                                    newNode.$ctxValues = newNode.$ctxValues.concat(child.parentNode.$ctxValues);
                                // Go through each child and assign the context
                                if (newNode.$ctxValues.length > 0) {
                                    Compiler.traverse(newNode, function (c) {
                                        if (c == newNode)
                                            return;
                                        c.$ctxValues = newNode.$ctxValues.slice(0, newNode.$ctxValues.length);
                                    });
                                }
                                ;
                                clone.insertAfter(jQuery(child));
                                child.$clonedElements.push(newNode);
                            }
                            child.$clonedData = Compiler.clone(expressionValue);
                        }
                    }
                }
            });
            return root;
        };
        /**
        * Registers an internal function reference for later cleanup
        * @param {AppNode} node The element we are attaching events to
        * @param {string} name The name of the event
        * @param {any} func The function to call
        */
        Compiler.registerFunc = function (node, name, tag, func) {
            if (!node.$events)
                node.$events = [];
            // Do not re-add events if the node already has it
            for (var i = 0, l = node.$events.length; i < l; i++)
                if (node.$events[i].tag == tag)
                    return;
            node.addEventListener(name, func);
            node.$events.push({ name: name, func: func, tag: tag });
        };
        /**
        * Goes through any expressions in the element and updates them according to the expression result.
        * @param {JQuery} elm The element to traverse
        * @param {any} controller The controller associated with the element
        * @param {boolean} includeSubTemplates When traversing the template - should the compiler continue if it finds a child element with an associated controller
        * @returns {Element}
        */
        Compiler.digest = function (jElem, controller, includeSubTemplates) {
            if (includeSubTemplates === void 0) { includeSubTemplates = false; }
            var elm = jElem.get(0);
            var matches;
            var textNode;
            var expanded;
            var rootNode = elm;
            if (rootNode.$commentReferences) {
                expanded = Compiler.expand(rootNode, controller, includeSubTemplates);
                if (expanded != elm) {
                    elm = expanded;
                    jElem = jQuery(elm);
                }
            }
            // Traverse each element
            Compiler.traverse(elm, function (elem) {
                if (!includeSubTemplates && elem.$ctrl && elm != elem)
                    return false;
                // Do nothing for comment nodes
                if (elem.nodeType == 8)
                    return;
                var jElemWrapper = jQuery(elem);
                // If a text node
                if (elem.nodeType == 3) {
                    textNode = elem;
                    var origText = "";
                    var dataExpression = textNode.$expression;
                    if (dataExpression)
                        origText = dataExpression;
                    else
                        origText = textNode.nodeValue;
                    var parsedText = origText.replace(/\{\{(.*?)\}\}/g, function (sub, val) {
                        textNode.$expression = origText;
                        return Compiler.parse(val, controller, null, textNode, null);
                    });
                    if (parsedText != origText) {
                        textNode.nodeValue = parsedText;
                        if (textNode.$expression && textNode.nodeValue.trim() == "") {
                            if (!textNode.parentNode.$ieTextNodes)
                                textNode.parentNode.$ieTextNodes = [];
                            if (textNode.parentNode.$ieTextNodes.indexOf(textNode) == -1)
                                textNode.parentNode.$ieTextNodes.push(textNode);
                        }
                    }
                    return;
                }
                var appNode = elem;
                var attrs = Compiler.attrs;
                attrs.splice(0, attrs.length);
                for (var i = 0; i < elem.attributes.length; i++)
                    attrs.push(elem.attributes[i]);
                // Go through each element's attributes
                jQuery.each(attrs, function (i, attrib) {
                    if (!attrib)
                        return;
                    var name = attrib.name;
                    var value = attrib.value;
                    switch (name) {
                        case "en-src":
                            var src = Compiler.parse(value, controller, null, elem, null);
                            if (src != elem.$prevSrc) {
                                elem.src = src;
                                elem.$prevSrc = src;
                            }
                            break;
                        case "en-show":
                            var disp = (Compiler.parse(value, controller, null, elem, null) ? "" : "none");
                            if (disp != elem.style.display) {
                                elem.style.display = disp;
                                elem.offsetWidth;
                            }
                            break;
                        case "en-html":
                            var html = Compiler.parse(value, controller, null, elem, null);
                            elem.innerHTML = html;
                            break;
                        case "en-init":
                            Compiler.parse(value, controller, null, elem, null);
                            break;
                        case "en-value":
                            var val = Compiler.parse(value, controller, null, elem, null);
                            elem.value = val;
                            break;
                        case "en-selected":
                            var val = Compiler.parse(value, controller, null, elem, null);
                            if (val)
                                elem.setAttribute("selected", "selected");
                            else
                                elem.removeAttribute("selected");
                            break;
                        case "en-class":
                            Compiler.digestCSS(elem, controller, value);
                            break;
                        case "en-style":
                            Compiler.digestStyle(elem, controller, value);
                            break;
                        case "en-model":
                            var ev = function (e) {
                                Compiler.parse(value + " = elm.value", controller, e, elem, null);
                                Compiler.transform("" + value, elem, controller);
                                Compiler.digest(jElem, controller, includeSubTemplates);
                            };
                            Compiler.parse(value + " = elm.value", controller, null, elem, null);
                            Compiler.transform("" + value, elem, controller);
                            Compiler.registerFunc(appNode, "change", "en-model", ev);
                            break;
                        case "en-click":
                            var ev = function (e) {
                                Compiler.parse(value, controller, e, elem, null);
                                Compiler.digest(jElem, controller, includeSubTemplates);
                            };
                            Compiler.registerFunc(appNode, "click", "en-click", ev);
                            break;
                        case "en-mouse-over":
                            var ev = function (e) {
                                Compiler.parse(value, controller, e, elem, null);
                                Compiler.digest(jElem, controller, includeSubTemplates);
                            };
                            Compiler.registerFunc(appNode, "mouseover", "en-mouse-over", ev);
                            break;
                        case "en-dclick":
                            var ev = function (e) {
                                Compiler.parse(value, controller, e, elem, null);
                                Compiler.digest(jElem, controller, includeSubTemplates);
                            };
                            Compiler.registerFunc(appNode, "dblclick", "en-dclick", ev);
                            break;
                        case "en-change":
                            var ev = function (e) {
                                Compiler.parse(value, controller, e, elem, null);
                                Compiler.digest(jElem, controller, includeSubTemplates);
                            };
                            Compiler.registerFunc(appNode, "change", "en-change", ev);
                            break;
                        case "en-submit":
                            var ev = function (e) {
                                var form = elem;
                                e.preventDefault();
                                form.$error = false;
                                form.$errorExpression = "";
                                form.$errorInput = "";
                                jQuery("[en-validate]", elem).each(function (index, subElem) {
                                    var err = Compiler.checkValidations(this.getAttribute("en-validate"), subElem);
                                    if (err) {
                                        form.$error = true;
                                        form.$pristine = false;
                                    }
                                });
                                // If its an auto clear - then all the clear fields must be wiped
                                if (form.$autoClear) {
                                    jQuery("[en-auto-clear]", elem).each(function (index, subElem) {
                                        this.value = "";
                                    });
                                }
                                Compiler.parse(value, controller, e, elem, null);
                                Compiler.digest(jElem, controller, includeSubTemplates);
                            };
                            Compiler.registerFunc(appNode, "submit", "en-submit", ev);
                            break;
                        case "en-validate":
                            // Set the parent form to be pristine
                            if (elem.form)
                                elem.form.$pristine = true;
                            var ev = function (e) {
                                // IF it has a form - check other elements for errors
                                var form = elem.form;
                                if (form) {
                                    form.$error = false;
                                    form.$errorInput = "";
                                }
                                Compiler.checkValidations(value, elem);
                                // IF it has a form - check other elements for errors
                                if (form) {
                                    jQuery("[en-validate]", form).each(function (index, subElem) {
                                        if (subElem.$error) {
                                            form.$error = true;
                                            form.$errorInput = subElem.name;
                                        }
                                    });
                                }
                                Compiler.digest(jElem, controller, includeSubTemplates);
                            };
                            Compiler.registerFunc(appNode, "change", "en-validate", ev);
                            break;
                        case "en-auto-clear":
                            elem.$autoClear = true;
                            break;
                    }
                });
            });
            return elm;
        };
        /**
        * Checks each of the validation expressions on an input element. Used to set form and input states like form.$error
        * @param {string} value The list of expression names separated by |
        * @param {HTMLInputElement| HTMLTextAreaElement} elem The element to traverse
        */
        Compiler.checkValidations = function (value, elem) {
            var expressions = [];
            var form = elem.form;
            for (var i = 0, values = value.split("|"), l = values.length; i < l; i++)
                if (Compiler.validators[values[i]])
                    expressions.push(Compiler.validators[values[i]]);
            elem.$error = false;
            for (var i = 0, l = expressions.length; i < l; i++) {
                var matches = elem.value.match(expressions[i].regex);
                if (expressions[i].negate)
                    if (matches)
                        matches = null;
                    else
                        matches = true;
                if (!matches) {
                    elem.$error = true;
                    if (form) {
                        form.$errorExpression = expressions[i].name;
                        form.$errorInput = elem.name;
                    }
                    break;
                }
            }
            return elem.$error;
        };
        /**
        * Given an model directive, any transform commands will change the model's object into something else
        * @param {string} value The list of expression names separated by |
        * @param {HTMLInputElement| HTMLTextAreaElement} elem The element to traverse
        */
        Compiler.transform = function (script, elem, controller) {
            var expressions = [];
            var form = elem.form;
            for (var i = 0, l = elem.attributes.length; i < l; i++) {
                if (elem.attributes[i].name == "en-transform")
                    return Compiler.parse(script + " = " + elem.attributes[i].value, controller, null, elem, null);
            }
        };
        /**
        * Goes through an element and prepares it for the compiler. This usually involves adding event listeners
        * and manipulating the DOM. This should only really be called once per element. If you need to update the
        * element after compilation you can use the digest method
        * @param {JQuery} elm The element to traverse
        * @param {any} ctrl The controller associated with the element
        * @param {boolean} includeSubTemplates When traversing the template - should the compiler continue if it finds a child element with an associated controller
        * @returns {JQuery}
        */
        Compiler.build = function (elm, ctrl, includeSubTemplates) {
            if (includeSubTemplates === void 0) { includeSubTemplates = false; }
            var rootNode = elm.get(0);
            rootNode.$ctrl = ctrl;
            rootNode.$commentReferences = {};
            var potentials = [];
            // First go through each of the nodes and find any elements that will potentially grow or shrink
            // Traverse each element
            Compiler.traverse(rootNode, function (elem) {
                if (!includeSubTemplates && elem.$ctrl && elem.$ctrl != ctrl)
                    return false;
                // Only allow element nodes
                if (elem.nodeType != 1)
                    return;
                if (elem.$dynamic || elem.$clonedElements)
                    return;
                var attrs = Compiler.attrs;
                attrs.splice(0, attrs.length);
                for (var i = 0; i < elem.attributes.length; i++)
                    attrs.push(elem.attributes[i]);
                // Go through each element's attributes
                jQuery.each(attrs, function (i, attrib) {
                    if (!attrib)
                        return;
                    var name = attrib.name;
                    var value = attrib.value;
                    switch (name) {
                        case "en-repeat":
                            elem.$expression = value;
                            elem.$expressionType = "en-repeat";
                            potentials.push(elem);
                            break;
                        case "en-if":
                            elem.$expression = value;
                            elem.$expressionType = "en-if";
                            potentials.push(elem);
                            break;
                    }
                });
            });
            // Replace the potentials with comments that keep a reference to the original node
            for (var i = 0, l = potentials.length; i < l; i++) {
                Compiler.$commentRefIDCounter++;
                var comment = jQuery("<!-- " + potentials[i].$expressionType + "[" + Compiler.$commentRefIDCounter + "] -->");
                var commentElement = comment.get(0);
                commentElement.$clonedElements = [];
                commentElement.$originalNode = potentials[i];
                commentElement.$expression = commentElement.$originalNode.$expression;
                commentElement.$expressionType = commentElement.$originalNode.$expressionType;
                jQuery(potentials[i]).replaceWith(comment);
                rootNode.$commentReferences[Compiler.$commentRefIDCounter.toString()] = commentElement;
            }
            return jQuery(Compiler.digest(elm, ctrl, includeSubTemplates));
        };
        Compiler.attrs = [];
        Compiler.$commentRefIDCounter = 0;
        Compiler.validators = {
            "alpha-numeric": { regex: /^[a-z0-9]+$/i, name: "alpha-numeric", negate: false },
            "non-empty": { regex: /\S/, name: "non-empty", negate: false },
            "alpha-numeric-plus": { regex: /^[a-zA-Z0-9_\-!]+$/, name: "alpha-numeric-plus", negate: false },
            "email-plus": { regex: /^[a-zA-Z0-9_\-!@\.]+$/, name: "email-plus", negate: false },
            "email": { regex: /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i, name: "email", negate: false },
            "no-html": { regex: /(<([^>]+)>)/ig, name: "no-html", negate: true }
        };
        return Compiler;
    })();
    Animate.Compiler = Compiler;
})(Animate || (Animate = {}));
var Animate;
(function (Animate) {
    /**
    * Describes the type of access users have to a project
    */
    (function (PrivilegeType) {
        PrivilegeType[PrivilegeType["NONE"] = 0] = "NONE";
        PrivilegeType[PrivilegeType["READ"] = 1] = "READ";
        PrivilegeType[PrivilegeType["WRITE"] = 2] = "WRITE";
        PrivilegeType[PrivilegeType["ADMIN"] = 3] = "ADMIN";
    })(Animate.PrivilegeType || (Animate.PrivilegeType = {}));
    var PrivilegeType = Animate.PrivilegeType;
    /**
    * Describes the category of a project
    */
    (function (Category) {
        Category[Category["Other"] = 1] = "Other";
        Category[Category["Artistic"] = 2] = "Artistic";
        Category[Category["Gaming"] = 3] = "Gaming";
        Category[Category["Informative"] = 4] = "Informative";
        Category[Category["Musical"] = 5] = "Musical";
        Category[Category["Technical"] = 6] = "Technical";
        Category[Category["Promotional"] = 7] = "Promotional";
    })(Animate.Category || (Animate.Category = {}));
    var Category = Animate.Category;
})(Animate || (Animate = {}));
var Animate;
(function (Animate) {
    /**
    * Base class for all custom enums
    */
    var ENUM = (function () {
        function ENUM(v) {
            this.value = v;
        }
        ENUM.prototype.toString = function () { return this.value; };
        return ENUM;
    })();
    Animate.ENUM = ENUM;
    /**
    * Internal class only used internally by the {EventDispatcher}
    */
    var EventListener = (function () {
        function EventListener(eventType, func, context) {
            this.eventType = eventType;
            this.func = func;
            this.context = context;
        }
        return EventListener;
    })();
    Animate.EventListener = EventListener;
    /**
    * The base class for all events dispatched by the {EventDispatcher}
    */
    var Event = (function () {
        /**
        * Creates a new event object
        * @param {EventType} eventType The type event
        */
        function Event(eventType, tag) {
            this._eventType = eventType;
            this.tag = tag;
        }
        Object.defineProperty(Event.prototype, "eventType", {
            /**
            * Gets the event type
            */
            get: function () { return this._eventType; },
            enumerable: true,
            configurable: true
        });
        return Event;
    })();
    Animate.Event = Event;
    /**
    * A simple class that allows the adding, removing and dispatching of events.
    */
    var EventDispatcher = (function () {
        function EventDispatcher() {
            this._listeners = [];
            this.disposed = false;
        }
        Object.defineProperty(EventDispatcher.prototype, "listeners", {
            /**
            * Returns the list of {EventListener} that are currently attached to this dispatcher.
            */
            get: function () {
                return this._listeners;
            },
            enumerable: true,
            configurable: true
        });
        /**
        * Adds a new listener to the dispatcher class.
        */
        EventDispatcher.prototype.on = function (eventType, func, context) {
            if (!func)
                throw new Error("You cannot have an undefined function.");
            this._listeners.push(new EventListener(eventType, func, context));
        };
        /**
        * Adds a new listener to the dispatcher class.
        */
        EventDispatcher.prototype.off = function (eventType, func, context) {
            var listeners = this.listeners;
            if (!listeners)
                return;
            if (!func)
                throw new Error("You cannot have an undefined function.");
            for (var i = 0, li = listeners.length; i < li; i++) {
                var l = listeners[i];
                if (l.eventType == eventType && l.func == func && l.context == context) {
                    listeners.splice(i, 1);
                    return;
                }
            }
        };
        /**
        * Sends a message to all listeners based on the eventType provided.
        * @param {String} The trigger message
        * @param {Event} event The event to dispatch
        * @returns {any}
        */
        EventDispatcher.prototype.dispatchEvent = function (event, tag) {
            var e = null;
            if (event instanceof ENUM)
                e = new Event(event, tag);
            else if (event instanceof Event)
                e = event;
            if (this._listeners.length == 0)
                return null;
            //Slice will clone the array
            var listeners = this._listeners.slice(0);
            if (!listeners)
                return null;
            var toRet = null;
            for (var i = 0, li = listeners.length; i < li; i++) {
                var l = listeners[i];
                if (l.eventType == e.eventType) {
                    if (!l.func)
                        throw new Error("A listener was added for " + e.eventType + ", but the function is not defined.");
                    toRet = l.func.call(l.context || this, l.eventType, e, this);
                }
            }
            return toRet;
        };
        /**
        * This will cleanup the component by nullifying all its variables and clearing up all memory.
        */
        EventDispatcher.prototype.dispose = function () {
            this._listeners = null;
            this.disposed = true;
        };
        return EventDispatcher;
    })();
    Animate.EventDispatcher = EventDispatcher;
})(Animate || (Animate = {}));
var Animate;
(function (Animate) {
    /*
    * The payment type of the user
    */
    (function (UserPlan) {
        UserPlan[UserPlan["Free"] = 1] = "Free";
        UserPlan[UserPlan["Bronze"] = 2] = "Bronze";
        UserPlan[UserPlan["Silver"] = 3] = "Silver";
        UserPlan[UserPlan["Gold"] = 4] = "Gold";
        UserPlan[UserPlan["Platinum"] = 5] = "Platinum";
        UserPlan[UserPlan["Custom"] = 6] = "Custom";
    })(Animate.UserPlan || (Animate.UserPlan = {}));
    var UserPlan = Animate.UserPlan;
})(Animate || (Animate = {}));
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Animate;
(function (Animate) {
    var EditorEvents = (function (_super) {
        __extends(EditorEvents, _super);
        function EditorEvents(v) {
            _super.call(this, v);
        }
        /**
        * This is called when the project is exporting the data object to the server.
        * The token object passed to this function contains all the information needed to run the project in an Animate runtime.
        * Associate event type is {EditorExportingEvent}
        */
        EditorEvents.EDITOR_PROJECT_EXPORTING = new EditorEvents("editor_project_exporting");
        /**
        * This function is called by Animate when everything has been loaded and the user is able to begin their session. Associate event type is {Event}
        */
        EditorEvents.EDITOR_READY = new EditorEvents("editor_ready");
        /**
        * This function is called by Animate when the run button is pushed.
        */
        EditorEvents.EDITOR_RUN = new EditorEvents("editor_run");
        EditorEvents.PORTAL_ADDED = new EditorEvents("portal_added");
        EditorEvents.PORTAL_REMOVED = new EditorEvents("portal_removed");
        EditorEvents.PORTAL_EDITED = new EditorEvents("portal_edited");
        /**
        * This is called by Animate when we a container is created. Associate event type is {ContainerEvent}
        */
        EditorEvents.CONTAINER_CREATED = new EditorEvents("plugin_container_created");
        /**
        * This is called by Animate when we a container is deleted. Associate event type is {ContainerEvent}
        */
        EditorEvents.CONTAINER_DELETED = new EditorEvents("plugin_container_deleted");
        /**
        * This is called by Animate when we select a container. Associate event type is {ContainerEvent}
        */
        EditorEvents.CONTAINER_SELECTED = new EditorEvents("plugin_container_selected");
        /**
        * This is called by Animate when we are exporting a container. The token that gets passed should be used to store any optional
        * data with a container. Associate event type is {ContainerDataEvent}
        */
        EditorEvents.CONTAINER_EXPORTING = new EditorEvents("plugin_container_exporting");
        /**
        * This is called by Animate when we are saving a container. The token that gets passed should be used to store any optional
        * data with a container.This can be later, re - associated with the container when onOpenContainer is called. Associate event type is {ContainerDataEvent}
        */
        EditorEvents.CONTAINER_SAVING = new EditorEvents("plugin_container_saving");
        /**
        * This is called by Animate when we are opening a container. The token that gets passed is filled with optional
        * data when onSaveContainer is called. Associate event type is {ContainerDataEvent}
        */
        EditorEvents.CONTAINER_OPENING = new EditorEvents("plugin_container_opening");
        /**
        * Called when an asset is renamed. Associate event type is {AssetRenamedEvent}
        */
        EditorEvents.ASSET_RENAMED = new EditorEvents("plugin_asset_renamed");
        /**
        * Called when an asset is selected in the editor. Associate event type is {AssetEvent}
        */
        EditorEvents.ASSET_SELECTED = new EditorEvents("plugin_asset_selected");
        /**
        * Called when an asset property is edited by the property grid. Associate event type is {AssetEditedEvent}
        */
        EditorEvents.ASSET_EDITED = new EditorEvents("plugin_asset_edited");
        /**
        * Called when an asset is added to a container. Associate event type is {AssetContainerEvent}
        */
        EditorEvents.ASSET_ADDED_TO_CONTAINER = new EditorEvents("plugin_asset_added_to_container");
        /**
        * Called when an asset is removed from a container. Associate event type is {AssetContainerEvent}
        */
        EditorEvents.ASSET_REMOVED_FROM_CONTAINER = new EditorEvents("plugin_asset_removed_from_container");
        /**
        * Called when an asset is created. Associate event type is {AssetCreatedEvent}
        */
        EditorEvents.ASSET_CREATED = new EditorEvents("plugin_asset_created");
        /**
        * Called just before an asset is saved to the server. Associate event type is {AssetEvent}
        */
        EditorEvents.ASSET_SAVING = new EditorEvents("plugin_asset_saving");
        /**
        * Called when an asset is loaded from the database. Associate event type is {AssetEvent}
        */
        EditorEvents.ASSET_LOADED = new EditorEvents("plugin_asset_loaded");
        /**
        * Called when an asset is disposed off. Associate event type is {AssetEvent}
        */
        EditorEvents.ASSET_DESTROYED = new EditorEvents("plugin_asset_destroyed");
        /**
        * Called when an asset is copied in the editor. Associate event type is {AssetCopiedEvent}
        */
        EditorEvents.ASSET_COPIED = new EditorEvents("plugin_asset_copied");
        return EditorEvents;
    })(Animate.ENUM);
    Animate.EditorEvents = EditorEvents;
    /**
    * Called when an editor is being exported
    */
    var EditorExportingEvent = (function (_super) {
        __extends(EditorExportingEvent, _super);
        function EditorExportingEvent(token) {
            _super.call(this, EditorEvents.EDITOR_PROJECT_EXPORTING, null);
            this.token = token;
        }
        return EditorExportingEvent;
    })(Animate.Event);
    Animate.EditorExportingEvent = EditorExportingEvent;
    /**
    * BehaviourContainer associated events
    */
    var ContainerEvent = (function (_super) {
        __extends(ContainerEvent, _super);
        function ContainerEvent(eventName, container) {
            _super.call(this, eventName, null);
            this.container = container;
        }
        return ContainerEvent;
    })(Animate.Event);
    Animate.ContainerEvent = ContainerEvent;
    /**
    * Events associated with BehaviourContainers and either reading from, or writing to, a data token
    */
    var ContainerDataEvent = (function (_super) {
        __extends(ContainerDataEvent, _super);
        function ContainerDataEvent(eventName, container, token, sceneReferences) {
            _super.call(this, eventName, null);
            this.container = container;
            this.token = token;
            this.sceneReferences = sceneReferences;
        }
        return ContainerDataEvent;
    })(Animate.Event);
    Animate.ContainerDataEvent = ContainerDataEvent;
    /**
    * Asset associated events
    */
    var AssetEvent = (function (_super) {
        __extends(AssetEvent, _super);
        function AssetEvent(eventName, asset) {
            _super.call(this, eventName, null);
            this.asset = asset;
        }
        return AssetEvent;
    })(Animate.Event);
    Animate.AssetEvent = AssetEvent;
    /**
    * Called when an asset property is edited by the property grid
    */
    var AssetEditedEvent = (function (_super) {
        __extends(AssetEditedEvent, _super);
        function AssetEditedEvent(eventName, asset, propertyName, newValue, oldValue, type) {
            _super.call(this, eventName, asset);
            this.propertyName = propertyName;
            this.newValue = newValue;
            this.oldValue = oldValue;
            this.type = type;
        }
        return AssetEditedEvent;
    })(AssetEvent);
    Animate.AssetEditedEvent = AssetEditedEvent;
    /**
    * Called when an asset is created
    */
    var AssetCreatedEvent = (function (_super) {
        __extends(AssetCreatedEvent, _super);
        function AssetCreatedEvent(asset, name) {
            _super.call(this, EditorEvents.ASSET_CREATED, asset);
            this.name = name;
        }
        return AssetCreatedEvent;
    })(AssetEvent);
    Animate.AssetCreatedEvent = AssetCreatedEvent;
    /**
    * Called when an asset is renamed
    */
    var AssetRenamedEvent = (function (_super) {
        __extends(AssetRenamedEvent, _super);
        function AssetRenamedEvent(asset, oldName) {
            _super.call(this, EditorEvents.ASSET_RENAMED, asset);
            this.oldName = oldName;
        }
        return AssetRenamedEvent;
    })(AssetEvent);
    Animate.AssetRenamedEvent = AssetRenamedEvent;
    /**
    * Events assocaited with Assets in relation to BehaviourContainers
    */
    var AssetContainerEvent = (function (_super) {
        __extends(AssetContainerEvent, _super);
        function AssetContainerEvent(eventName, asset, container) {
            _super.call(this, eventName, asset);
            this.container = container;
        }
        return AssetContainerEvent;
    })(AssetEvent);
    Animate.AssetContainerEvent = AssetContainerEvent;
    /**
    * Portal associated events
    */
    var PluginPortalEvent = (function (_super) {
        __extends(PluginPortalEvent, _super);
        function PluginPortalEvent(eventName, oldName, container, portal, canvas) {
            _super.call(this, eventName, null);
            this.oldName = oldName;
            this.container = container;
            this.portal = portal;
            this.canvas = canvas;
        }
        return PluginPortalEvent;
    })(Animate.Event);
    Animate.PluginPortalEvent = PluginPortalEvent;
})(Animate || (Animate = {}));
var Animate;
(function (Animate) {
    /**
    * Describes an asset variable
    */
    var VariableTemplate = (function () {
        function VariableTemplate(name, value, type, category, options) {
            this.name = name;
            this.category = category;
            this.type = type;
            this.value = value;
            this.options = options;
        }
        VariableTemplate.prototype.dispose = function () {
            this.name = null;
            this.category = null;
            this.type = null;
            this.value = null;
            this.options = null;
        };
        return VariableTemplate;
    })();
    Animate.VariableTemplate = VariableTemplate;
    /**
    * This class describes a template. These templates are used when creating assets.
    */
    var AssetClass = (function () {
        function AssetClass(name, parent, imgURL, abstractClass) {
            if (abstractClass === void 0) { abstractClass = false; }
            this._abstractClass = abstractClass;
            this._name = name;
            this.parentClass = parent;
            this._imgURL = imgURL;
            this._variables = [];
            this.classes = [];
        }
        /**
        * Creates an object of all the variables for an instance of this class.
        * @returns {EditableSet} The variables we are editing
        */
        AssetClass.prototype.buildVariables = function () {
            var toRet = new Animate.EditableSet();
            var topClass = this;
            while (topClass != null) {
                //Add all the variables to the object we are returning
                for (var i = 0; i < topClass._variables.length; i++) {
                    var variable = topClass._variables[i];
                    // If the variable is added by a child class - then do not add it from the parent
                    // this essentially makes sure child class variables hold top priority
                    if (!toRet.getVar(variable.name))
                        toRet.addVar(variable.name, variable.value, Animate.ParameterType.fromString(variable.type.toString()), variable.category, variable.options);
                }
                topClass = topClass.parentClass;
            }
            return toRet;
        };
        /**
        * Finds a class by its name. Returns null if nothing is found
        */
        AssetClass.prototype.findClass = function (name) {
            if (this._name == name)
                return this;
            var classes = this.classes;
            for (var i = 0, l = classes.length; i < l; i++) {
                var aClass = classes[i].findClass(name);
                if (aClass)
                    return aClass;
            }
            return null;
        };
        AssetClass.prototype.addVar = function (name, value, type, category, options) {
            category = (category == null || category === undefined ? "" : category);
            this._variables.push(new VariableTemplate(name, value, type, category, options));
            return this;
        };
        /**
        * This will clear and dispose of all the nodes
        */
        AssetClass.prototype.dispose = function () {
            for (var i = 0, l = this._variables.length; i < l; i++)
                this._variables[i].dispose();
            for (var i = 0, l = this.classes.length; i < l; i++)
                this.classes[i].dispose();
            this._abstractClass = null;
            this._name = null;
            this.parentClass = null;
            this._variables = null;
            this._imgURL = null;
            this.classes = null;
        };
        /**
        * Gets a variable based on its name
        * @param {string} name The name of the class
        * @returns {VariableTemplate}
        */
        AssetClass.prototype.getVariablesByName = function (name) {
            for (var i = 0, l = this._variables.length; i < l; i++)
                if (this._variables[i].name == name)
                    return this._variables[i];
            return null;
        };
        Object.defineProperty(AssetClass.prototype, "imgURL", {
            get: function () { return this._imgURL; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AssetClass.prototype, "variables", {
            get: function () { return this._variables; },
            enumerable: true,
            configurable: true
        });
        /**
        * Adds a class
        * @param {string} name The name of the class
        * @param {string} img The optional image of the class
        * @param {boolean} abstractClass A boolean to define if this class is abstract or not. I.e. does this class allow for creating assets or is it just the base for others.
        * @returns {AssetClass}
        */
        AssetClass.prototype.addClass = function (name, img, abstractClass) {
            var toAdd = new AssetClass(name, this, img, abstractClass);
            this.classes.push(toAdd);
            return toAdd;
        };
        Object.defineProperty(AssetClass.prototype, "name", {
            /** Gets the name of the class */
            get: function () { return this._name; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(AssetClass.prototype, "abstractClass", {
            /** Gets if this class is abstract or not */
            get: function () { return this._abstractClass; },
            enumerable: true,
            configurable: true
        });
        return AssetClass;
    })();
    Animate.AssetClass = AssetClass;
})(Animate || (Animate = {}));
var Animate;
(function (Animate) {
    var Utils = (function () {
        function Utils() {
        }
        /*Gets the local mouse position of an event on a given dom element.*/
        Utils.getMousePos = function (evt, id) {
            // get canvas position
            var obj = document.getElementById(id);
            var top = 0;
            var left = 0;
            while (obj && obj.tagName != 'BODY') {
                top += obj.offsetTop;
                left += obj.offsetLeft;
                obj = obj.offsetParent;
            }
            var p = jQuery("#" + id).parent().parent();
            var scrollX = p.scrollLeft();
            var scrollY = p.scrollTop();
            // return relative mouse position
            var mouseX = evt.clientX - left + scrollX; // window.pageXOffset;
            var mouseY = evt.clientY - top + scrollY; //window.pageYOffset;
            return { y: mouseY, x: mouseX };
        };
        /**
        * Use this function to check if a value contains characters that break things.
        * @param {string} text The text to check
        * @param {boolean} allowSpace If this is true, empty space will be allowed
        * @returns {string} Returns null or string. If it returns null then everything is fine. Otherwise a message is returned with what's wrong.
        */
        Utils.checkForSpecialChars = function (text, allowSpace) {
            if (allowSpace === void 0) { allowSpace = false; }
            if (allowSpace === false && jQuery.trim(text) === "")
                return "Text cannot be an empty string";
            var boxText = text;
            var origLength = boxText.length;
            var boxText = boxText.replace(/[^a-zA-Z 0-9'!£$&+-=_]+/g, '');
            if (boxText.length != origLength)
                return "Please enter safe characters. We do not allow for HTML type characters.";
            return null;
        };
        /**
        Tells us if a string is a valid email address
        */
        Utils.validateEmail = function (email) {
            var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(email);
        };
        /* Returns the class name of the argument or undefined if
        *  it's not a valid JavaScript object. */
        Utils.getObjectClass = function (obj) {
            if (obj && obj.constructor && obj.constructor.toString) {
                var arr = obj.constructor.toString().match(/function\s*(\w+)/);
                if (arr && arr.length == 2)
                    return arr[1];
            }
            return undefined;
        };
        return Utils;
    })();
    Animate.Utils = Utils;
})(Animate || (Animate = {}));
var Animate;
(function (Animate) {
    var BehaviourManagerEvents = (function (_super) {
        __extends(BehaviourManagerEvents, _super);
        function BehaviourManagerEvents(v) {
            _super.call(this, v);
        }
        BehaviourManagerEvents.CONTAINER_SAVED = new BehaviourManagerEvents("behaviour_manager_container_saved");
        BehaviourManagerEvents.SUCCESS = new BehaviourManagerEvents("behaviour_manager_success");
        return BehaviourManagerEvents;
    })(Animate.ENUM);
    Animate.BehaviourManagerEvents = BehaviourManagerEvents;
    var BehaviourManagerEvent = (function (_super) {
        __extends(BehaviourManagerEvent, _super);
        function BehaviourManagerEvent(eventName, name) {
            _super.call(this, eventName, name);
            this.name = name;
        }
        return BehaviourManagerEvent;
    })(Animate.Event);
    Animate.BehaviourManagerEvent = BehaviourManagerEvent;
    var BehaviourManager = (function (_super) {
        __extends(BehaviourManager, _super);
        function BehaviourManager() {
            if (BehaviourManager._singleton != null)
                throw new Error("The BehaviourManager class is a singleton. You need to call the BehaviourManager.getSingleton() function.");
            BehaviourManager._singleton = this;
            // Call super-class constructor
            _super.call(this);
        }
        /**
        * Gets the singleton instance.
        */
        BehaviourManager.getSingleton = function () {
            if (!BehaviourManager._singleton)
                new BehaviourManager();
            return BehaviourManager._singleton;
        };
        return BehaviourManager;
    })(Animate.EventDispatcher);
    Animate.BehaviourManager = BehaviourManager;
})(Animate || (Animate = {}));
var Animate;
(function (Animate) {
    /**
    * The plugin manager is used to load and manage external Animate plugins.
    */
    var PluginManager = (function (_super) {
        __extends(PluginManager, _super);
        function PluginManager() {
            // Call super-class constructor
            _super.call(this);
            if (PluginManager._singleton != null)
                throw new Error("PluginManager is singleton, you must call the getSingleton() property to get its instance. ");
            // Set this singleton
            PluginManager._singleton = this;
            this._plugins = new Array();
            this.behaviourTemplates = new Array();
            this._assetTemplates = new Array();
            this._converters = new Array();
            this._dataTypes = new Array("asset", "number", "group", "file", "string", "object", "bool", "int", "color", "enum");
            //Create some standard templates	
            this.behaviourTemplates.push(new Animate.BehaviourDefinition("Asset", false, false, false, false, [
                new Animate.PortalTemplate("Asset In", Animate.PortalType.PARAMETER, Animate.ParameterType.ASSET, ":"),
                new Animate.PortalTemplate("Asset Out", Animate.PortalType.PRODUCT, Animate.ParameterType.ASSET, ":")
            ], null));
            //Script nodes
            this.scriptTemplate = new Animate.BehaviourDefinition("Script", true, true, true, true, [
                new Animate.PortalTemplate("Execute", Animate.PortalType.INPUT, Animate.ParameterType.BOOL, false),
                new Animate.PortalTemplate("Exit", Animate.PortalType.OUTPUT, Animate.ParameterType.BOOL, false)
            ], null);
            this.behaviourTemplates.push(this.scriptTemplate);
            //Instance nodes
            this.behaviourTemplates.push(new Animate.BehaviourDefinition("Instance", true, true, true, true, [], null));
            this._loadedPlugins = [];
            Animate.BehaviourPicker.getSingleton().list.addItem("Asset");
            Animate.BehaviourPicker.getSingleton().list.addItem("Script");
        }
        /**
        * Updates an assets value as well as any components displaying the asset.
        * For example the property grid or scene view.
        * @param {Asset} asset The asset we are editing
        * @param {string} propName The name of the asset's property
        * @param {any} propValue The new value
        * @param {boolean} notifyEditor If true, the manager will send out a notify event of the new value
        */
        PluginManager.prototype.updateAssetValue = function (asset, propName, propValue, notifyEditor) {
            if (notifyEditor === void 0) { notifyEditor = false; }
            var pGrid = Animate.PropertyGrid.getSingleton();
            var pVar = asset.properties.getVar(propName);
            var oldVal = pVar.value;
            asset.properties.updateValue(propName, propValue);
            if (pGrid.idObject == asset || (pGrid.idObject && pGrid.idObject.asset == asset))
                pGrid.updateProperty(propName, propValue);
            var node = Animate.TreeViewScene.getSingleton().findNode("asset", asset);
            node.save(false);
            if (notifyEditor)
                this.assetEdited(asset, propName, propValue, oldVal, pVar.type);
        };
        /**
        * Attempts to download a plugin by its URL and insert it onto the page.
        * Each plugin should then register itself with the plugin manager by setting the __newPlugin variable
        * @param {IPlugin} pluginDefinition The plugin to load
        * @returns {JQueryPromise<Engine.IPlugin>}
        */
        PluginManager.prototype.loadPlugin = function (pluginDefinition) {
            var d = jQuery.Deferred();
            if (pluginDefinition.$loaded)
                return d.resolve();
            jQuery.ajax({ dataType: "script", url: pluginDefinition.url }).done(function () {
                pluginDefinition.$loaded = true;
                pluginDefinition.$instance = __newPlugin;
                return d.resolve(pluginDefinition);
            }).fail(function (err) {
                pluginDefinition.$loaded = false;
                d.reject(new Error("An error occurred while downloading a plugin. " + err.status + ": " + err.responseText));
            });
            return d.promise();
        };
        /**
        * This funtcion is used to load a plugin.
        * @param {IPlugin} pluginDefinition The IPlugin constructor that is to be created
        * @param {boolean} createPluginReference Should we keep this constructor in memory? The default is true
        */
        PluginManager.prototype.preparePlugin = function (pluginDefinition, createPluginReference) {
            if (createPluginReference === void 0) { createPluginReference = true; }
            var plugin = pluginDefinition.$instance;
            this._plugins.push(plugin);
            //Get behaviour definitions
            var btemplates = plugin.getBehaviourDefinitions();
            if (btemplates) {
                var len = btemplates.length;
                for (var i = 0; i < len; i++) {
                    this.behaviourTemplates.push(btemplates[i]);
                    Animate.BehaviourPicker.getSingleton().list.addItem(btemplates[i].behaviourName);
                    Animate.TreeViewScene.getSingleton().addPluginBehaviour(btemplates[i]);
                }
            }
            //Get converters
            var converters = plugin.getTypeConverters();
            if (converters) {
                var i = converters.length;
                while (i--)
                    this._converters.push(converters[i]);
            }
            //Get asset templates
            var atemplates = plugin.getAssetsTemplate();
            if (atemplates) {
                var i = atemplates.length;
                while (i--)
                    this._assetTemplates.push(atemplates[i]);
            }
            return;
        };
        /**
        * Call this function to unload all the plugins.
        */
        PluginManager.prototype.unloadAll = function () {
            //Cleanup all the previous plugins
            for (var i = 0; i < this._plugins.length; i++)
                this.unloadPlugin(this._plugins[i]);
            this._plugins.splice(0, this._plugins.length);
            this._loadedPlugins.splice(0, this._loadedPlugins.length);
        };
        /**
        * Call this function to unload a plugin
        * @param {IPlugin} plugin The IPlugin object that is to be loaded
        */
        PluginManager.prototype.unloadPlugin = function (plugin) {
            //Get converters
            var toRemove = new Array();
            var i = this.behaviourTemplates.length;
            while (i--)
                if (this.behaviourTemplates[i].plugin == plugin)
                    toRemove.push(this.behaviourTemplates[i]);
            //Get behaviour definitions
            var i = toRemove.length;
            while (i--) {
                Animate.BehaviourPicker.getSingleton().list.removeItem(toRemove[i].behaviourName);
                Animate.TreeViewScene.getSingleton().removePluginBehaviour(toRemove[i].behaviourName);
                this.behaviourTemplates.splice(this.behaviourTemplates.indexOf(toRemove[i]), 1);
            }
            //Get converters
            var toRemove2 = [];
            var i = this._converters.length;
            while (i--)
                if (this._converters[i].plugin == plugin)
                    toRemove2.push(this._converters[i]);
            var i = toRemove2.length;
            while (i--)
                this._converters.splice(jQuery.inArray(toRemove2[i], this._converters), 1);
            this._assetTemplates.splice(0, this._assetTemplates.length);
            plugin.unload();
        };
        /**
        * Loops through each of the converters to see if a conversion is possible. If it is
        * it will return an array of conversion options, if not it returns false.
        * @param {any} typeA The first type to check
        * @param {any} typeB The second type to check
        */
        PluginManager.prototype.getConverters = function (typeA, typeB) {
            var toRet = null;
            var i = this._converters.length;
            while (i--) {
                if (this._converters[i].canConvert(typeA, typeB)) {
                    if (toRet == null)
                        toRet = [];
                    var ii = this._converters[i].conversionOptions.length;
                    while (ii--)
                        toRet.push(this._converters[i].conversionOptions[ii]);
                }
            }
            return toRet;
        };
        /**
        * Gets a behaviour template by its name.
        * @param {string} behaviorName The name of the behaviour template
        */
        PluginManager.prototype.getTemplate = function (behaviorName) {
            var len = this.behaviourTemplates.length;
            while (len--)
                if (this.behaviourTemplates[len].behaviourName == behaviorName)
                    return this.behaviourTemplates[len];
            return null;
        };
        /**
        * Use this function to select an asset in the tree view and property grid
        * @param {Asset} asset The Asset object we need to select
        * @param {boolean} panToNode When set to true, the treeview will bring the node into view
        * @param {boolean} multiSelect When set to true, the treeview not clear any previous selections
        */
        PluginManager.prototype.selectAsset = function (asset, panToNode, multiSelect) {
            if (panToNode === void 0) { panToNode = true; }
            if (multiSelect === void 0) { multiSelect = false; }
            Animate.TreeViewScene.getSingleton().selectNode(Animate.TreeViewScene.getSingleton().findNode("asset", asset), panToNode, multiSelect);
        };
        /**
        * Gets the currently selected asset from the PropertyGrid
        * @returns {Asset} asset The Asset object we need to select
        */
        PluginManager.prototype.getSelectedAsset = function () {
            var pgrid = Animate.PropertyGrid.getSingleton();
            if (pgrid.idObject && pgrid.idObject instanceof Animate.TreeNodeAssetInstance)
                return pgrid.idObject.asset;
            return null;
        };
        /**
        * This is called when the scene is built. The object passed to this function represents
        * the scene as an object.
        * @param {Asset} asset The asset that was edited
        * @param {string} propertyNam The name of the property that was edited
        * @param {any} newValue The new value of the property
        * @param {any} oldValue The old value of the property
        * @param {ParameterType} propertyType The type of property
        */
        PluginManager.prototype.assetEdited = function (asset, propertyNam, newValue, oldValue, propertyType) {
            var project = Animate.User.get.project;
            if (propertyType == Animate.ParameterType.NUMBER)
                newValue = newValue.selected;
            else if (propertyType == Animate.ParameterType.ASSET)
                newValue = project.getAssetByShallowId(Animate.ImportExport.getExportValue(Animate.ParameterType.ASSET, newValue));
            else if (propertyType == Animate.ParameterType.FILE)
                newValue = newValue.path || null;
            else if (propertyType == Animate.ParameterType.ENUM)
                newValue = newValue.selected;
            else if (propertyType == Animate.ParameterType.ASSET_LIST) {
                var assets = [];
                if (newValue && newValue.selectedAssets)
                    for (var i = 0, l = newValue.selectedAssets.length; i < l; i++) {
                        var a = project.getAssetByShallowId(newValue.selectedAssets[i]);
                        if (a)
                            assets.push(a);
                    }
                newValue = assets;
            }
            // Send event
            this.dispatchEvent(new Animate.AssetEditedEvent(Animate.EditorEvents.ASSET_EDITED, asset, propertyNam, newValue, oldValue, propertyType));
        };
        /**
        * Gets an asset by its ID
        * @param {string} id The id of the asset
        * @returns {Asset}
        */
        PluginManager.prototype.getAssetById = function (id) {
            var toRet = null;
            toRet = Animate.User.get.project.getAssetByID(id);
            return toRet;
        };
        /**
        * Gets an asset by its local ID
        * @param {string} id The local id of the asset
        * @returns {Asset}
        */
        PluginManager.prototype.getAssetByShallowId = function (id) {
            var toRet = null;
            toRet = Animate.User.get.project.getAssetByShallowId(id);
            return toRet;
        };
        /**
        * Gets an asset class by its name
        * @param {string} name The name of the asset class
        * @param {AssetClass}
        */
        PluginManager.prototype.getAssetClass = function (name) {
            // Assign any of the options / missing variables for classes that are updated in code but not in the DB
            var assetTemplates = this._assetTemplates;
            var classFound = false;
            for (var i = 0, l = assetTemplates.length; i < l; i++) {
                var assetClass = assetTemplates[i].findClass(name);
                if (assetClass)
                    return assetClass;
            }
            return null;
        };
        /**
        * When an asset is created this function will notify all plugins of its existance
        * @param {string} name The name of the asset
        * @param {Asset} asset The asset itself
        */
        PluginManager.prototype.assetCreated = function (name, asset) {
            var template = null;
            // Assign any of the options / missing variables for classes that are updated in code but not in the DB
            var aClass = this.getAssetClass(asset.className);
            // Get all the variables for this class
            var topClass = aClass;
            var variables = new Array();
            while (topClass != null) {
                //Add all the variables to the object we are returning
                for (var i = 0; i < topClass.variables.length; i++)
                    variables.push(topClass.variables[i]);
                topClass = topClass.parentClass;
            }
            // Go through all the variables and make sure that the asset has the variable (THey can get lost as new ones are added over time)
            // Also re-assign the options as they 
            for (var vi = 0, vl = variables.length; vi < vl; vi++) {
                var variable = variables[vi];
                if (!asset.properties.getVar(variable.name))
                    asset.properties.addVar(variable.name, variable.value, Animate.ParameterType.fromString(variable.type.toString()), variable.category, variable.options);
                else
                    asset.properties.getVar(variable.name).options = variable.options;
            }
            this.dispatchEvent(new Animate.AssetCreatedEvent(asset, name));
        };
        /**
        * This function is called by Animate when everything has been loaded and the user is able to begin their session.
        */
        PluginManager.prototype.callReady = function () {
            this.dispatchEvent(new Animate.Event(Animate.EditorEvents.EDITOR_READY, null));
            // TODO: Determine what to do with user plans
            if (Animate.User.get.meta.plan == Animate.UserPlan.Free) {
                if (this.behaviourTemplates.indexOf(this.scriptTemplate) != -1) {
                    this.behaviourTemplates.splice(this.behaviourTemplates.indexOf(this.scriptTemplate), 1);
                    Animate.BehaviourPicker.getSingleton().list.removeItem(this.scriptTemplate.behaviourName);
                }
            }
            else {
                if (this.behaviourTemplates.indexOf(this.scriptTemplate) == -1) {
                    this.behaviourTemplates.push(this.scriptTemplate);
                    Animate.BehaviourPicker.getSingleton().list.addItem(this.scriptTemplate.behaviourName);
                }
            }
        };
        /**
        * This function is called when we need to create a preview for a file that is associated with a project
        * @param {File} file The file that needs to be previewed
        * @param {Component} previewComponent The component which will act as the parent div of the preview.
        */
        PluginManager.prototype.displayPreview = function (file, previewComponent) {
            var firstChild = previewComponent.element.children(":first");
            var firstComp = firstChild.data("component");
            if (firstComp)
                firstComp.dispose();
            previewComponent.element.empty();
            previewComponent.element.css({ "min-width": "" });
            var w = previewComponent.element.width();
            if (file) {
                var i = this._plugins.length;
                while (i--) {
                    var handled = this._plugins[i].onDisplayPreview(file, previewComponent);
                    if (handled) {
                        var childW = firstChild.outerWidth(true);
                        previewComponent.element.css({ "min-width": (childW > w ? childW.toString() : "") + "px" });
                        break;
                    }
                }
            }
        };
        Object.defineProperty(PluginManager.prototype, "dataTypes", {
            get: function () { return this._dataTypes; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PluginManager.prototype, "assetTemplates", {
            get: function () { return this._assetTemplates; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PluginManager.prototype, "loadedPlugins", {
            get: function () { return this._loadedPlugins; },
            enumerable: true,
            configurable: true
        });
        /**
        * Gets the singleton instance.
        */
        PluginManager.getSingleton = function () {
            if (!PluginManager._singleton)
                new PluginManager();
            return PluginManager._singleton;
        };
        return PluginManager;
    })(Animate.EventDispatcher);
    Animate.PluginManager = PluginManager;
})(Animate || (Animate = {}));
var Animate;
(function (Animate) {
    var ImportExportEvents = (function (_super) {
        __extends(ImportExportEvents, _super);
        function ImportExportEvents(v) {
            _super.call(this, v);
        }
        ImportExportEvents.COMPLETE = new ImportExportEvents("import_export_complete");
        return ImportExportEvents;
    })(Animate.ENUM);
    Animate.ImportExportEvents = ImportExportEvents;
    var ImportExportEvent = (function (_super) {
        __extends(ImportExportEvent, _super);
        function ImportExportEvent(eventName, live_link) {
            _super.call(this, eventName, live_link);
            this.live_link = live_link;
        }
        return ImportExportEvent;
    })(Animate.Event);
    Animate.ImportExportEvent = ImportExportEvent;
    /**
    * A class to help with importing and exporting a project
    */
    var ImportExport = (function (_super) {
        __extends(ImportExport, _super);
        function ImportExport() {
            // Call super-class constructor
            _super.call(this);
            if (ImportExport._singleton != null)
                throw new Error("The ImportExport class is a singleton. You need to call the ImportExport.getSingleton() function.");
            ImportExport._singleton = this;
            this.mRequest = null;
            this.runWhenDone = false;
        }
        /**
        * @type public mfunc run
        * This function will first export the scene and then attempt to create a window that runs the application.
        * @extends <ImportExport>
        */
        ImportExport.prototype.run = function () {
            this.exportScene();
            this.runWhenDone = true;
        };
        /**
        * @type public mfunc exportScene
        * This function is used to exort the Animae scene. This function creates an object which is exported as a string. Plugins
        * can hook into this process and change the output to suit the plugin needs.
        * @extends <ImportExport>
        */
        ImportExport.prototype.exportScene = function () {
            this.runWhenDone = false;
            var project = Animate.User.get.project;
            var data = {};
            data["category"] = "builds";
            data["command"] = "build";
            data["projectID"] = project.entry._id;
            var dataToken = {};
            dataToken.assets = [];
            dataToken.groups = [];
            dataToken.containers = [];
            dataToken.converters = {};
            dataToken.data = {};
            var canvasToken = null;
            //Get all the behaviours and build them into the export object
            var i = project.behaviours.length;
            while (i--) {
                var behaviour = project.behaviours[i];
                if (behaviour.json === null)
                    continue;
                canvasToken = behaviour.json;
                //Check if we have valid json and items saved
                if (canvasToken && canvasToken.items) {
                    var containerToken = {};
                    dataToken.containers.push(containerToken);
                    containerToken.name = behaviour.name;
                    containerToken.id = behaviour.shallowId;
                    containerToken.behaviours = [];
                    containerToken.links = [];
                    containerToken.assets = [];
                    containerToken.groups = [];
                    containerToken.properties = {};
                    //Set each of the properties
                    var props = behaviour.properties.tokenize();
                    for (var pi in props) {
                        var propType = Animate.ParameterType.fromString(props[pi].type);
                        var propVal = props[pi].value;
                        containerToken.properties[props[pi].name] = ImportExport.getExportValue(propType, propVal);
                    }
                    //Let the plugins export their data
                    containerToken.plugins = canvasToken.plugins;
                    Animate.PluginManager.getSingleton().dispatchEvent(new Animate.ContainerDataEvent(Animate.EditorEvents.CONTAINER_EXPORTING, behaviour, containerToken.plugins));
                    //Create tokens and fill each with data. First create either a behaviour
                    //or link objct
                    for (var cti = 0, ctl = canvasToken.items.length; cti < ctl; cti++) {
                        var canvasTokenItem = canvasToken.items[cti];
                        if (canvasTokenItem.type == "BehaviourAsset" ||
                            canvasTokenItem.type == "BehaviourScript" ||
                            canvasTokenItem.type == "BehaviourPortal" ||
                            canvasTokenItem.type == "Behaviour" ||
                            canvasTokenItem.type == "BehaviourInstance") {
                            var behaviourToken = {};
                            containerToken.behaviours.push(behaviourToken);
                            behaviourToken.id = canvasTokenItem.id;
                            behaviourToken.name = canvasTokenItem.name;
                            behaviourToken.type = canvasTokenItem.type;
                            //Check the type and fill in the sub properties
                            if (canvasTokenItem.type == "BehaviourPortal") {
                                behaviourToken.portalType = canvasTokenItem.portalType.toString();
                                behaviourToken.dataType = canvasTokenItem.dataType.toString();
                                behaviourToken.value = ImportExport.getExportValue(canvasTokenItem.dataType, canvasTokenItem.value);
                            }
                            else {
                                if (canvasTokenItem.type == "BehaviourInstance")
                                    behaviourToken.originalContainerID = canvasTokenItem.containerId;
                                if (canvasTokenItem.type == "BehaviourScript")
                                    behaviourToken.shallowId = canvasTokenItem.shallowId;
                                // Create each of the portals 
                                behaviourToken.portals = [];
                                for (var ci = 0, cl = canvasTokenItem.portals.length; ci < cl; ci++) {
                                    var portalToken = {};
                                    behaviourToken.portals.push(portalToken);
                                    portalToken.name = canvasTokenItem.portals[ci].name;
                                    portalToken.type = canvasTokenItem.portals[ci].type.toString();
                                    portalToken.dataType = canvasTokenItem.portals[ci].dataType.toString();
                                    portalToken.value = ImportExport.getExportValue(canvasTokenItem.portals[ci].dataType, canvasTokenItem.portals[ci].value);
                                    //Check for assets, and if so, add the asset to the assets 
                                    if (canvasTokenItem.portals[ci].dataType == Animate.ParameterType.ASSET) {
                                        if (portalToken.value != null && portalToken.value != "") {
                                            var assetID = portalToken.value;
                                            if (!isNaN(assetID) && assetID != 0 && containerToken.assets.indexOf(assetID) == -1) {
                                                containerToken.assets.push(assetID);
                                                //It can also the be case that assets reference other assets. In those
                                                //situations you will want the container to keep adding to all the assets
                                                this.referenceCheckAsset(project.getAssetByShallowId(assetID), containerToken);
                                            }
                                        }
                                    }
                                    else if (canvasTokenItem.portals[ci].dataType == Animate.ParameterType.ASSET_LIST) {
                                        if (portalToken.value != null && portalToken.value.selectedAssets.length != 0) {
                                            for (var a = 0, al = portalToken.value.selectedAssets.length; a < al; a++) {
                                                var assetID = portalToken.value.selectedAssets[a];
                                                if (!isNaN(assetID) && assetID != 0 && containerToken.assets.indexOf(assetID) == -1) {
                                                    containerToken.assets.push(assetID);
                                                    //It can also the be case that assets reference other assets. In those
                                                    //situations you will want the container to keep adding to all the assets
                                                    this.referenceCheckAsset(project.getAssetByShallowId(assetID), containerToken);
                                                }
                                            }
                                        }
                                    }
                                    else if (canvasTokenItem.portals[ci].dataType == Animate.ParameterType.GROUP) {
                                        if (portalToken.value != null && portalToken.value != "") {
                                            var groupID = ImportExport.getExportValue(Animate.ParameterType.GROUP, portalToken.value);
                                            if (groupID != null && groupID != "") {
                                                //It can also the be case that groups reference other groups. In those
                                                //situations you will want the container to keep adding to all the groups
                                                this.referenceCheckGroup(Animate.TreeViewScene.getSingleton().findNode("groupID", groupID), containerToken);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                        else if (canvasTokenItem.type == "Link") {
                            var linkToken = {};
                            containerToken.links.push(linkToken);
                            //fill in the sub properties
                            linkToken.id = canvasTokenItem.id;
                            linkToken.type = canvasTokenItem.type;
                            linkToken.startPortal = canvasTokenItem.startPortal;
                            linkToken.endPortal = canvasTokenItem.endPortal;
                            linkToken.startBehaviour = canvasTokenItem.targetStartBehaviour;
                            linkToken.endBehaviour = canvasTokenItem.targetEndBehaviour;
                            linkToken.frameDelay = canvasTokenItem.frameDelay;
                        }
                    }
                }
            }
            //Get all the assets and build them into the export object			
            for (var i = 0, l = project.assets.length; i < l; i++) {
                var asset = project.assets[i];
                //Check if we have valid json and items saved
                if (canvasToken) {
                    var assetToken = {};
                    dataToken.assets.push(assetToken);
                    assetToken.name = asset.name;
                    assetToken.id = asset.shallowId;
                    assetToken.properties = {};
                    assetToken.className = asset.className;
                    var aprops = asset.properties.tokenize();
                    for (var assetPropName in aprops) {
                        var propType = Animate.ParameterType.fromString(aprops[assetPropName].type.toString());
                        var propVal = aprops[assetPropName].value;
                        assetToken.properties[aprops[assetPropName].name] = ImportExport.getExportValue(propType, propVal);
                    }
                }
            }
            //Get all the groups and build them into the export object
            var groups = Animate.TreeViewScene.getSingleton().getGroups();
            for (var i = 0, l = groups.length; i < l; i++) {
                var group = groups[i];
                //Check if we have valid json and items saved
                if (group) {
                    var groupToken = {};
                    dataToken.groups.push(groupToken);
                    groupToken.name = group.text;
                    groupToken.id = group.groupID;
                    groupToken.items = [];
                    for (var ii = 0; ii < group.children.length; ii++)
                        groupToken.items.push(group.children[ii].instanceID);
                }
            }
            //Send the object to the plugins
            Animate.PluginManager.getSingleton().dispatchEvent(new Animate.EditorExportingEvent(dataToken));
            var sceneStr = JSON.stringify(dataToken);
            var loader = new Animate.AnimateLoader();
            loader.on(Animate.LoaderEvents.COMPLETE, this.onServer, this);
            loader.on(Animate.LoaderEvents.FAILED, this.onServer, this);
            loader.load("/export/compile", { projectId: project.entry._id, json: sceneStr });
        };
        /**
        * Adds asset references to a container token during the export.
        * @param {Asset} asset the asset object to check
        * @param {ContainerToken} container The container to add refernces on
        * @returns {any}
        */
        ImportExport.prototype.referenceCheckAsset = function (asset, container) {
            if (asset == null)
                return;
            var assetVars = asset.properties.variables;
            var project = Animate.User.get.project;
            //Check all the assets properties. If it contains another assest, then we need to make sure its added to the container
            for (var i = 0, l = assetVars.length; i < l; i++) {
                if (assetVars[i].type == Animate.ParameterType.ASSET) {
                    var assetID = ImportExport.getExportValue(assetVars[i].type, assetVars[i].value);
                    if (!isNaN(assetID) && assetID != 0 && container.assets.indexOf(assetID) == -1) {
                        container.assets.push(assetID);
                        //It can also the be case that assets reference other assets. In those
                        //situations you will want the container to keep adding to all the assets							
                        this.referenceCheckAsset(project.getAssetByShallowId(assetID), container);
                    }
                }
                else if (assetVars[i].type == Animate.ParameterType.ASSET_LIST) {
                    if (assetVars[i].value.selectedAssets) {
                        for (var a = 0, al = assetVars[i].value.selectedAssets.length; a < al; a++) {
                            var assetID = assetVars[i].value.selectedAssets[a];
                            if (!isNaN(assetID) && assetID != 0 && container.assets.indexOf(assetID) == -1) {
                                container.assets.push(assetID);
                                //It can also the be case that assets reference other assets. In those
                                //situations you will want the container to keep adding to all the assets							
                                this.referenceCheckAsset(project.getAssetByShallowId(assetID), container);
                            }
                        }
                    }
                }
                else if (assetVars[i].type == Animate.ParameterType.GROUP) {
                    var groupID = ImportExport.getExportValue(assetVars[i].type, assetVars[i].value);
                    if (groupID != null && groupID != "") {
                        var groupNode = Animate.TreeViewScene.getSingleton().findNode("groupID", groupID);
                        this.referenceCheckGroup(groupNode, container);
                    }
                }
            }
        };
        /**
        * Adds group references to a container token during the export.
        * @param {TreeNodeGroup} group the group object to check
        * @param {ContainerToken} container The container to add refernces on
        * @returns {any}
        */
        ImportExport.prototype.referenceCheckGroup = function (group, container) {
            if (group == null)
                return;
            var project = Animate.User.get.project;
            // Add the group
            if (container.groups.indexOf(group.groupID) == -1)
                container.groups.push(group.groupID);
            //Check all the group properties. If it contains another group, then we need to make sure its added to the container		
            for (var ii = 0; ii < group.children.length; ii++)
                if (group.children[ii].instanceID) {
                    var assetID = group.children[ii].instanceID;
                    //Check if the asset was added to the container
                    if (container.assets.indexOf(assetID) == -1) {
                        container.assets.push(assetID);
                        //It can also the be case that assets reference other assets. In those
                        //situations you will want the container to keep adding to all the assets
                        this.referenceCheckAsset(project.getAssetByShallowId(assetID), container);
                    }
                }
        };
        /**
        * Gets the value of an object without any of the additional data associated with it.
        * @param {ParameterType} propType the object type
        * @param {any} value Its current value
        * @returns {any}
        */
        ImportExport.getExportValue = function (propType, value) {
            if (propType == Animate.ParameterType.NUMBER)
                return value.selected || (isNaN(parseFloat(value)) ? 0 : parseFloat(value));
            else if (propType == Animate.ParameterType.STRING || propType == Animate.ParameterType.BOOL || propType == Animate.ParameterType.INT)
                return value;
            else if (propType == Animate.ParameterType.ASSET) {
                var shallowId = 0;
                shallowId = parseInt(value.selected);
                if (isNaN(shallowId))
                    shallowId = 0;
                return shallowId;
            }
            else if (propType == Animate.ParameterType.ASSET_LIST) {
                return value.selectedAssets || [];
            }
            else if (propType == Animate.ParameterType.GROUP)
                return value;
            else if (propType == Animate.ParameterType.FILE) {
                var path = value.path;
                var urlParts = path.split("/");
                return "{{url}}uploads/" + urlParts[urlParts.length - 1];
            }
            else if (propType == Animate.ParameterType.HIDDEN_FILE) {
                var file = Animate.User.get.project.getFile(value);
                if (file) {
                    var urlParts = file.path.split("/");
                    return "{{url}}uploads/" + urlParts[urlParts.length - 1];
                }
                return "";
            }
            else if (propType == Animate.ParameterType.ENUM)
                return value.selected;
            else if (propType == Animate.ParameterType.COLOR)
                return value.color;
            else if (propType == Animate.ParameterType.OBJECT) {
                var test = parseFloat(value);
                if (isNaN(test) == false)
                    return test;
                test = parseInt(value);
                if (isNaN(test) == false)
                    return test;
                return value.toString();
            }
            else if (propType == Animate.ParameterType.HIDDEN)
                return value.toString();
        };
        /**
        * This is the resonse from the server
        */
        ImportExport.prototype.onServer = function (response, event, sender) {
            var loader = sender;
            if (response == Animate.LoaderEvents.COMPLETE) {
                if (event.return_type == Animate.AnimateLoaderResponses.SUCCESS) {
                    if (loader.url == "/export/compile") {
                        Animate.Logger.getSingleton().clearItems();
                        var now = new Date();
                        Animate.Logger.getSingleton().logMessage("Build complete at " + new Date(Date.now()).toDateString(), null, Animate.LogType.MESSAGE);
                        Animate.Logger.getSingleton().logMessage("External link: " + event.tag.liveLink, null, Animate.LogType.MESSAGE);
                        if (this.runWhenDone)
                            window.open(event.tag.liveLink, 'Webinate Live!', 'width=900,height=860'); //'width=900,height=860,menubar=1,resizable=1,scrollbars=1,status=1,titlebar=1,toolbar=1'
                        this.dispatchEvent(new ImportExportEvent(ImportExportEvents.COMPLETE, event.tag.liveLink));
                    }
                }
                else {
                    Animate.MessageBox.show(event.message, Array("Ok"), null, null);
                    this.dispatchEvent(new Animate.ProjectEvent(Animate.ProjectEvents.FAILED, event.message, Animate.AnimateLoaderResponses.ERROR, event.tag));
                }
            }
            else
                this.dispatchEvent(new Animate.ProjectEvent(Animate.ProjectEvents.FAILED, event.message, Animate.AnimateLoaderResponses.ERROR, event.tag));
        };
        /**
        * Gets the singleton instance.
        * @extends <ImportExport>
        */
        ImportExport.getSingleton = function () {
            if (!ImportExport._singleton)
                new ImportExport();
            return ImportExport._singleton;
        };
        return ImportExport;
    })(Animate.EventDispatcher);
    Animate.ImportExport = ImportExport;
})(Animate || (Animate = {}));
var Animate;
(function (Animate) {
    var EditorContainer = (function () {
        function EditorContainer(editor, name, value) {
            this.editor = editor;
            this.propertyName = name;
            this.propertyValue = value;
        }
        return EditorContainer;
    })();
    /**
    * A simple interface for property grid editors
    */
    var PropertyGridEditor = (function () {
        function PropertyGridEditor(grid) {
            this._grid = grid;
            this.mEditors = [];
        }
        /**
        * Called when a property grid is editing an object. The property name, value and type are passed.
        * If this editor can edit the property it returns a valid JQuery object which is responsible for editing
        * the object. The property grid makes no effort to maintain this. It is up to the Editor to watch the JQuery through
        * events to see when its been interacted with. Once its been edited, the editor must notify the grid - to do this
        * call the notify method.
        * @param {string} propertyName The name of the property we are creating an HTML element for
        * @param {any} propertyValue The current value of that property
        * @param {ParameterType} objectType The type of property we need to create
        * @param {any} options Any options associated with the parameter
        * @returns {JQuery} A valid jQuery object or null if this editor does not support this property.
        */
        PropertyGridEditor.prototype.edit = function (propertyName, propertyValue, objectType, options) {
            return null;
        };
        /**
        * Use this function to create a nice wrapper for any HTML you want to use as an editor. This will surround the html and css that makes
        * it fit in with the other property editors already available.
        */
        PropertyGridEditor.prototype.createEditorJQuery = function (propertyName, html, value) {
            var editor = jQuery("<div class='property-grid-label'>" + propertyName + "</div>" +
                "<div class='property-grid-value'>" + html + "</div >" +
                "<div class='fix' ></div > ");
            this.mEditors.push(new EditorContainer(editor, propertyName, value));
            return editor;
        };
        /**
        * Call this function to tell the grid that a property has been edited.
        */
        PropertyGridEditor.prototype.notify = function (propertyName, propertyValue, objectType) {
            this._grid.propUpdated(propertyName, propertyValue, objectType);
        };
        /* Cleans up the editor */
        PropertyGridEditor.prototype.dispose = function () {
            this.mEditors = null;
            this._grid = null;
        };
        /* This function is called when the grid is cleaning up all the editors. */
        PropertyGridEditor.prototype.cleanup = function () {
            var items = this.mEditors;
            var i = items.length;
            while (i--) {
                items[i].editor.off();
                items[i].editor.remove();
            }
            items.splice(0, items.length);
        };
        /**
        * Updates the value of the editor object  because a value was edited externally.
        * @param {any} newValue The new value
        * @param {JQuery} editHTML The JQuery that was generated by this editor that needs to be updated because something has updated the value externally.
        */
        PropertyGridEditor.prototype.update = function (newValue, editHTML) {
            throw Error("All PropertyGridEditors must implement the update function.");
        };
        /**
        * Called when the editor is being added to the DOM
        */
        PropertyGridEditor.prototype.onAddedToDom = function () {
        };
        return PropertyGridEditor;
    })();
    Animate.PropertyGridEditor = PropertyGridEditor;
})(Animate || (Animate = {}));
var Animate;
(function (Animate) {
    var Asset = (function (_super) {
        __extends(Asset, _super);
        /**
        * @param {string} name The name of the asset
        * @param {string} className The name of the "class" or "template" that this asset belongs to
        * @param {any} json The JSON with all the asset properties
        * @param {string} id The id of this asset
        */
        function Asset(name, className, json, id, shallowId) {
            if (name === void 0) { name = ""; }
            if (className === void 0) { className = ""; }
            if (json === void 0) { json = {}; }
            if (id === void 0) { id = ""; }
            if (shallowId === void 0) { shallowId = 0; }
            // Call super-class constructor
            _super.call(this);
            // Make sure the ID is always really high - i.e. dont allow for duplicates
            if (shallowId !== 0 && shallowId > Asset.shallowIds)
                Asset.shallowIds = shallowId + 1;
            this._options = {};
            this.id = id;
            this.shallowId = shallowId;
            this.name = name;
            this.saved = true;
            this._properties = new Animate.EditableSet();
            if (json)
                this.properties = json;
            this._className = className;
        }
        Asset.getNewLocalId = function () {
            Asset.shallowIds++;
            return Asset.shallowIds;
        };
        /** Writes this assset to a readable string */
        Asset.prototype.toString = function () {
            return this.name + "(" + this.shallowId + ")";
        };
        /**
        * Use this function to reset the asset properties
        * @param {string} name The name of the asset
        * @param {string} className The "class" or "template" name of the asset
        * @param {any} json The JSON data of the asset.
        */
        Asset.prototype.update = function (name, className, json) {
            if (json === void 0) { json = {}; }
            this.name = name;
            this.saved = true;
            this.properties = json;
            this._className = className;
        };
        /**
        * Disposes and cleans up the data of this asset
        */
        Asset.prototype.dispose = function () {
            //Call super
            _super.prototype.dispose.call(this);
            this.id = null;
            this.name = null;
            this._properties = null;
            this._className = null;
            this._options = null;
        };
        /** Creates an option which is associated with this asset. The name of the option must be unique. Use this to add your own custom data */
        Asset.prototype.createOption = function (name, val) { this._options[name] = val; };
        /** Destroys an option */
        Asset.prototype.removeOption = function (name) { delete this._options[name]; };
        /**  Update the value of an option */
        Asset.prototype.updateOption = function (name, val) { this._options[name] = val; };
        /** Returns the value of an option */
        Asset.prototype.getOption = function (name) { return this._options[name]; };
        Object.defineProperty(Asset.prototype, "className", {
            get: function () { return this._className; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Asset.prototype, "properties", {
            get: function () { return this._properties; },
            set: function (val) {
                for (var vi = 0, l = this._properties.variables.length; vi < l; vi++)
                    this._properties.variables[vi].dispose();
                this._properties.variables.splice(0, this._properties.variables.length);
                if (val instanceof Animate.EditableSet)
                    this._properties = val;
                else {
                    for (var i in val)
                        this._properties.addVar(val[i].name, val[i].value, Animate.ParameterType.fromString(val[i].type), val[i].category, val[i].options);
                }
            },
            enumerable: true,
            configurable: true
        });
        Asset.shallowIds = 0;
        return Asset;
    })(Animate.EventDispatcher);
    Animate.Asset = Asset;
})(Animate || (Animate = {}));
var Animate;
(function (Animate) {
    /**
    * The AssetTemplate object is used to define what assets are available to the scene.
    * Assets are predefined tempaltes of data that can be instantiated. The best way to think of an asset
    * is to think of it as a predefined object that contains a number of variables. You could for example
    * create Assets like cats, dogs, animals or humans. Its really up you the plugin writer how they want
    * to define their assets. This function can return null if no Assets are required.
    */
    var AssetTemplate = (function () {
        /**
        * @param {IPlugin} plugin The plugin who created this template
        */
        function AssetTemplate(plugin) {
            this.plugin = plugin;
            this.classes = [];
        }
        /**
        * Adds a class to this template
        * @param {string} name The name of the class
        * @param {string} img The optional image
        * @param {boolean} abstractClass A boolean to define if this class is abstract or not.
        * @returns {AssetClass}
        */
        AssetTemplate.prototype.addClass = function (name, img, abstractClass) {
            var toAdd = new Animate.AssetClass(name, null, img, abstractClass);
            this.classes.push(toAdd);
            return toAdd;
        };
        /**
        * Removes a class by name
        * @param {string} name The name of the class to remove
        */
        AssetTemplate.prototype.removeClass = function (name) {
            for (var i = 0, l = this.classes.length; i < l; i++)
                if (this.classes[i].name == name) {
                    this.classes[i].dispose();
                    this.classes.splice(i, 1);
                    return;
                }
        };
        /**
        * Finds a class by its name. Returns null if nothing is found
        */
        AssetTemplate.prototype.findClass = function (name) {
            var classes = this.classes;
            for (var i = 0, l = classes.length; i < l; i++) {
                var aClass = classes[i].findClass(name);
                if (aClass)
                    return aClass;
            }
            return null;
        };
        return AssetTemplate;
    })();
    Animate.AssetTemplate = AssetTemplate;
})(Animate || (Animate = {}));
var Animate;
(function (Animate) {
    /**
    * Each project has a list of behaviours. These are saved into the
    * database and retrieved when we work with Animate. A behaviour is
    * essentially a piece of code that executes script logic.
    */
    var BehaviourContainer = (function (_super) {
        __extends(BehaviourContainer, _super);
        /**
        * {string} name The name of the container
        */
        function BehaviourContainer(name, id, shallowId) {
            // Call super-class constructor
            _super.call(this);
            // Make sure the ID is always really high - i.e. dont allow for duplicates
            if (shallowId !== 0 && shallowId > BehaviourContainer.shallowIds)
                BehaviourContainer.shallowIds = shallowId + 1;
            this._id = id;
            this.shallowId = shallowId;
            this._options = {};
            this._name = name;
            this.json = null;
            this.canvas = null;
            this.saved = true;
            this._properties = new Animate.EditableSet();
            this._properties.addVar("Start On Load", true, Animate.ParameterType.BOOL, "Container Properties", null);
            this._properties.addVar("Unload On Exit", true, Animate.ParameterType.BOOL, "Container Properties", null);
        }
        BehaviourContainer.getNewLocalId = function () {
            BehaviourContainer.shallowIds++;
            return BehaviourContainer.shallowIds;
        };
        /**
        * This will download and update all data of the asset.
        * @param {string} name The name of the behaviour
        * @param {CanvasToken} json Its data object
        */
        BehaviourContainer.prototype.update = function (name, json) {
            this._name = name;
            this.saved = true;
            this.json = json;
        };
        /**
        * This will cleanup the behaviour.
        */
        BehaviourContainer.prototype.dispose = function () {
            Animate.PluginManager.getSingleton().dispatchEvent(new Animate.ContainerEvent(Animate.EditorEvents.CONTAINER_DELETED, this));
            //Call super
            _super.prototype.dispose.call(this);
            this._properties = null;
            this._id = null;
            this._name = null;
            this.json = null;
            this.canvas = null;
            this.saved = null;
            this._options = null;
        };
        Object.defineProperty(BehaviourContainer.prototype, "id", {
            get: function () { return this._id; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BehaviourContainer.prototype, "name", {
            get: function () { return this._name; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BehaviourContainer.prototype, "properties", {
            get: function () { return this._properties; },
            enumerable: true,
            configurable: true
        });
        BehaviourContainer.prototype.setProperties = function (val) {
            if (val instanceof Animate.EditableSet)
                this._properties = val;
            else {
                for (var i = 0, l = this._properties.variables.length; i < l; i++)
                    this._properties.variables[i].dispose();
                this._properties.variables.splice(0, this._properties.variables.length);
                var arr = val;
                for (var i = 0, len = arr.length; i < len; i++)
                    this._properties.addVar(arr[i].name, arr[i].value, Animate.ParameterType.fromString(arr[i].type), arr[i].category, arr[i].options);
            }
            this.json.properties = this._properties.tokenize();
        };
        /** Creates an option which is associated with this asset. The name of the option must be unique. Use this to add your own custom data */
        BehaviourContainer.prototype.createOption = function (name, val) { this._options[name] = val; };
        /**  Update the value of an option */
        BehaviourContainer.prototype.updateOption = function (name, val) { this._options[name] = val; };
        /** Returns the value of an option */
        BehaviourContainer.prototype.getOption = function (name) { return this._options[name]; };
        BehaviourContainer.shallowIds = 0;
        return BehaviourContainer;
    })(Animate.EventDispatcher);
    Animate.BehaviourContainer = BehaviourContainer;
})(Animate || (Animate = {}));
var Animate;
(function (Animate) {
    /**
    *  A simple class to define the behavior of a behaviour object.
    */
    var BehaviourDefinition = (function () {
        /**
        * @param <string> behaviourName The name of the behaviour
        * @param <bool> canBuildInput
        * @param <bool> canBuildOutput
        * @param <bool> canBuildParameter
        * @param <bool> canBuildProduct
        * @param <array> portalTemplates
        * @param <IPlugin> plugin The plugin this is associated with
        */
        function BehaviourDefinition(behaviourName, canBuildInput, canBuildOutput, canBuildParameter, canBuildProduct, portalTemplates, plugin) {
            if (canBuildInput === void 0) { canBuildInput = true; }
            if (canBuildOutput === void 0) { canBuildOutput = true; }
            if (canBuildParameter === void 0) { canBuildParameter = true; }
            if (canBuildProduct === void 0) { canBuildProduct = true; }
            if (portalTemplates === void 0) { portalTemplates = null; }
            if (plugin === void 0) { plugin = null; }
            this._behaviourName = behaviourName;
            this._canBuildOutput = canBuildOutput;
            this._canBuildInput = canBuildInput;
            this._canBuildParameter = canBuildParameter;
            this._canBuildProduct = canBuildProduct;
            this._portalTemplates = portalTemplates;
            this._plugin = plugin;
        }
        /* This function is called by Animate to get an array of
        TypeConverters. TypeConverter objects define if one type can be translated to another. They
        also define what the process of conversion will be. */
        BehaviourDefinition.prototype.dispose = function () {
            this._behaviourName = null;
            this._canBuildOutput = null;
            this._canBuildInput = null;
            this._canBuildParameter = null;
            this._canBuildProduct = null;
            this._portalTemplates = null;
            this._plugin = null;
        };
        /* This function is called by Animate to see if a behaviour can build output portals.
        @return {boolean} Return true if you want Animate to allow for building outputs.*/
        BehaviourDefinition.prototype.canBuildOutput = function (behaviour) { return this._canBuildOutput; };
        /* This function is called by Animate to see if a behaviour can build input portals.
        @return {boolean} Return true if you want Animate to allow for building inputs.*/
        BehaviourDefinition.prototype.canBuildInput = function (behaviour) { return this._canBuildInput; };
        /* This function is called by Animate to see if a behaviour can build product portals.
        @return {boolean} Return true if you want Animate to allow for building products.*/
        BehaviourDefinition.prototype.canBuildProduct = function (behaviour) { return this._canBuildProduct; };
        /* This function is called by Animate to see if a behaviour can build parameter portals.
        @return {boolean} Return true if you want Animate to allow for building parameters.*/
        BehaviourDefinition.prototype.canBuildParameter = function (behaviour) { return this._canBuildParameter; };
        /* This function is called by Animate When a new behaviour is being created. The definition
        has to provide the behaviour with an array of PortalTemplates.
        @return {boolean} Return an array of PortalTemplates objects.*/
        BehaviourDefinition.prototype.createPortalsTemplates = function () { return this._portalTemplates; };
        Object.defineProperty(BehaviourDefinition.prototype, "behaviourName", {
            get: function () { return this._behaviourName; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BehaviourDefinition.prototype, "plugin", {
            get: function () { return this._plugin; },
            enumerable: true,
            configurable: true
        });
        return BehaviourDefinition;
    })();
    Animate.BehaviourDefinition = BehaviourDefinition;
})(Animate || (Animate = {}));
var Animate;
(function (Animate) {
    var DataToken = (function () {
        function DataToken() {
        }
        return DataToken;
    })();
    Animate.DataToken = DataToken;
})(Animate || (Animate = {}));
var Animate;
(function (Animate) {
    var CanvasTokenPortal = (function () {
        function CanvasTokenPortal(token) {
            this.name = "";
            this.value = "";
            this.type = Animate.PortalType.INPUT;
            this.dataType = null;
            this.customPortal = false;
            if (token) {
                this.name = token.name;
                this.value = token.value;
                this.type = Animate.PortalType.fromString(token.type.value);
                this.dataType = Animate.ParameterType.fromString(token.dataType.value);
                this.customPortal = token.customPortal;
            }
        }
        return CanvasTokenPortal;
    })();
    Animate.CanvasTokenPortal = CanvasTokenPortal;
    var CanvasTokenItem = (function () {
        function CanvasTokenItem(token) {
            this.id = "";
            this.type = "";
            this.left = "";
            this.top = "";
            this.zIndex = "";
            this.position = "";
            this.text = "";
            this.name = "";
            this.alias = "";
            // Asset items
            this.assetID = 0;
            // Script items
            this.shallowId = 0;
            this.containerId = 0;
            // Portal Items
            this.portalType = Animate.PortalType.PARAMETER;
            this.dataType = Animate.ParameterType.OBJECT;
            this.portals = new Array();
            if (token) {
                this.id = token.id;
                this.type = token.type;
                this.left = token.left;
                this.top = token.top;
                this.zIndex = token.zIndex;
                this.position = token.position;
                this.text = token.text;
                this.name = token.name;
                this.alias = token.alias;
                // Asset items
                this.assetID = token.assetID;
                // Script items
                this.shallowId = token.shallowId;
                this.containerId = token.containerId;
                this.behaviourID = token.behaviourID;
                // Portal Items
                this.portalType = Animate.PortalType.fromString(token.portalType.value);
                this.dataType = Animate.ParameterType.fromString(token.dataType.value);
                this.value = token.value;
                for (var i = 0, len = token.portals.length; i < len; i++)
                    this.portals.push(new CanvasTokenPortal(token.portals[i]));
                // Links
                this.frameDelay = token.frameDelay;
                this.startPortal = token.startPortal;
                this.endPortal = token.endPortal;
                this.startBehaviour = token.startBehaviour;
                this.endBehaviour = token.endBehaviour;
                // Additional data for shortcuts
                this.targetStartBehaviour = token.targetStartBehaviour;
                this.targetEndBehaviour = token.targetEndBehaviour;
            }
        }
        return CanvasTokenItem;
    })();
    Animate.CanvasTokenItem = CanvasTokenItem;
    var CanvasToken = (function () {
        function CanvasToken(id) {
            this.items = new Array();
            this.properties = new Array();
            this.plugins = {};
            this.id = id;
        }
        CanvasToken.prototype.toString = function () {
            return JSON.stringify(this);
        };
        CanvasToken.prototype.fromDatabase = function (json) {
            var obj = json;
            this.name = obj.name;
            if (obj.items) {
                for (var i = 0, len = obj.items.length; i < len; i++)
                    this.items.push(new CanvasTokenItem(obj.items[i]));
            }
            if (obj.plugins)
                this.plugins = obj.plugins;
            if (obj.properties)
                this.plugins = obj.properties;
            return this;
        };
        CanvasToken.fromDatabase = function (json, id) {
            var toRet = new CanvasToken(id);
            return toRet.fromDatabase(json);
        };
        return CanvasToken;
    })();
    Animate.CanvasToken = CanvasToken;
})(Animate || (Animate = {}));
var Animate;
(function (Animate) {
    //This class holds the DB information.
    var DB = (function () {
        function DB() {
        }
        DB.USERS = "http://webinate-test.net:8000";
        DB.HOST = "http://animate.webinate-test.net";
        DB.API = "http://animate.webinate-test.net/app-engine";
        DB.PLAN_FREE = "animate-free";
        DB.PLAN_BRONZE = "animate-bronze";
        DB.PLAN_SILVER = "animate-silver";
        DB.PLAN_GOLD = "animate-gold";
        DB.PLAN_PLATINUM = "animate-platinum";
        return DB;
    })();
    Animate.DB = DB;
})(Animate || (Animate = {}));
var Animate;
(function (Animate) {
    /**
    * A small object that represents a file that is associated with a project.
    */
    var File = (function () {
        /**
        * @param {string} name The name of the file
        * @param {string} path The path of the file on the server
        * @param {Array<string>} tags Keywords associated with the file to help search for it.This is a string
        * with values separated by commas
        * @param {number} createdOn The date this file was created on
        * @param {number} lastModified The date this file was last modified
        * @param {string} id The id of the file
        * @param {number} size The size of the file
        * @param {boolean} favourite Is this file a favourite
        * @param {string} preview_path The path of the file thumbnail on the server
        * @param {boolean} global Is this file globally accessible
        */
        function File(name, path, tags, id, createdOn, lastModified, size, favourite, preview_path, global) {
            this.id = id;
            this.name = name;
            this.path = path;
            this.global = global;
            this.preview_path = preview_path;
            this.tags = tags;
            this.extension = "";
            var splitData = path.split(".");
            if (splitData.length > 0)
                this.extension = splitData[splitData.length - 1].toLowerCase();
            else
                this.extension = "";
            this.size = (isNaN(size) ? 0 : size);
            this.createdOn = createdOn;
            this.lastModified = lastModified;
            this.favourite = favourite;
        }
        /**
        * Disposes and cleans the object
        */
        File.prototype.dispose = function () {
            this.id = null;
            this.name = null;
            this.path = null;
            this.path = null;
            this.global = null;
            this.preview_path = null;
            this.extension = null;
            this.tags = null;
        };
        return File;
    })();
    Animate.File = File;
})(Animate || (Animate = {}));
var Animate;
(function (Animate) {
    /**
    * Basic set of loader events shared by all loaders
    */
    var LoaderEvents = (function (_super) {
        __extends(LoaderEvents, _super);
        function LoaderEvents(v) {
            _super.call(this, v);
        }
        /**
        * Returns an enum reference by its name/value
        * @param {string} val
        * @returns {LoaderEvents}
        */
        LoaderEvents.fromString = function (val) {
            switch (val) {
                case "complete":
                    return LoaderEvents.COMPLETE;
                case "failed":
                    return LoaderEvents.FAILED;
            }
            return null;
        };
        LoaderEvents.COMPLETE = new LoaderEvents("complete");
        LoaderEvents.FAILED = new LoaderEvents("failed");
        return LoaderEvents;
    })(Animate.ENUM);
    Animate.LoaderEvents = LoaderEvents;
    /**
    * Abstract base loader class. This should not be instantiated, instead use the sub class loaders. Keeps track of loading
    * variables as well as functions for showing or hiding the loading dialogue
    */
    var LoaderBase = (function (_super) {
        __extends(LoaderBase, _super);
        /**
        * Creates an instance of the Loader
        * @param {string} domain [Optional] Specify the base domain of this call. By default it uses DB.HOST.
        */
        function LoaderBase(domain) {
            // Call super-class constructor
            _super.call(this);
            if (!LoaderBase.loaderBackdrop)
                LoaderBase.loaderBackdrop = LoaderBase.createLoaderModal();
            this.domain = (domain !== undefined ? domain : Animate.DB.HOST);
            this.url = null;
            this.data = null;
            this.numTries = null;
            this._getQuery = "";
            this.getVariables = null;
            this.dataType = "json";
            this.contentType = "application/x-www-form-urlencoded; charset=UTF-8";
            this.processData = true;
        }
        /**
        * Starts the loading process
        * @param {string} url The URL we want to load
        * @param {any} data The data associated with this load
        * @param {number} numTries The number of attempts allowed to make this load
        */
        LoaderBase.prototype.load = function (url, data, numTries) {
            if (numTries === void 0) { numTries = 3; }
            this.url = url;
            this.data = data;
            this.numTries = numTries;
            if (this.getVariables) {
                this._getQuery = "?";
                for (var i in this.getVariables)
                    this._getQuery += (this._getQuery.length != 1 ? "&" : "") + i + "=" + this.getVariables[i];
            }
        };
        /**
        * Call this function to create a jQuery object that acts as a loader modal window (the window with the spinning cog)
        * @returns {JQuery}
        */
        LoaderBase.createLoaderModal = function () {
            if (!LoaderBase.loaderBackdrop) {
                var str = "<div class='modal-backdrop dark-modal'><div class='logo-container'>" +
                    "<div class='logo-1 animated-logo loader-cog-slow'><img src='media/logo-1.png'/></div>" +
                    "<div class='logo-2 animated-logo loader-cog'><img src='media/logo-2.png'/></div>" +
                    "<div class='logo-3 animated-logo loader-cog-slow'><img src='media/logo-3.png'/></div>" +
                    "<div class='logo-4 animated-logo'><img src='media/logo-4.png'/></div>" +
                    "<div class='logo-5 animated-logo'><span class='loader-text'>LOADING</span></div>" +
                    "</div></div>";
                //return jQuery("<div style='background-color:#FFF' class='modal-backdrop dark-modal'><img class='loader-cog' style='margin-left:30%; margin-top:30%;' src='media/cog.png' /></div>");
                LoaderBase.loaderBackdrop = jQuery(str);
            }
            return LoaderBase.loaderBackdrop;
        };
        /**
        * Shows the loader backdrop which prevents the user from interacting with the application. Each time this is called a counter
        * is incremented. To hide it call the hideLoader function. It will only hide the loader if the hideLoader is called the same
        * number of times as the showLoader function. I.e. if you call showLoader 5 times and call hideLoader 4 times, it will not hide
        * the loader. If you call hideLoader one more time - it will.
        */
        LoaderBase.showLoader = function () {
            if (!LoaderBase.loaderBackdrop)
                LoaderBase.createLoaderModal();
            LoaderBase.loaderBackdrop.show();
            jQuery("body").append(LoaderBase.loaderBackdrop);
            LoaderBase.showCount++;
            jQuery(".loader-text", LoaderBase.loaderBackdrop).text("LOADING: " + LoaderBase.showCount + "%...");
        };
        /**
        * see showLoader for information on the hideLoader
        */
        LoaderBase.hideLoader = function () {
            LoaderBase.showCount--;
            jQuery(".loader-text", LoaderBase.loaderBackdrop).text("LOADING: " + LoaderBase.showCount + "%...");
            if (LoaderBase.showCount == 0)
                LoaderBase.loaderBackdrop.remove();
        };
        /**
       * Cleans up the object
       */
        LoaderBase.prototype.dispose = function () {
            //Call super
            _super.prototype.dispose.call(this);
            this.data = null;
        };
        LoaderBase.showCount = 0;
        return LoaderBase;
    })(Animate.EventDispatcher);
    Animate.LoaderBase = LoaderBase;
})(Animate || (Animate = {}));
var Animate;
(function (Animate) {
    /**
    * Valid response codes for requests made to the Animate server
    */
    var AnimateLoaderResponses = (function (_super) {
        __extends(AnimateLoaderResponses, _super);
        function AnimateLoaderResponses(v) {
            _super.call(this, v);
        }
        AnimateLoaderResponses.fromString = function (val) {
            switch (val) {
                case AnimateLoaderResponses.ERROR.toString():
                    return AnimateLoaderResponses.ERROR;
                    break;
                case AnimateLoaderResponses.SUCCESS.toString():
                default:
                    return AnimateLoaderResponses.SUCCESS;
                    break;
            }
            return null;
        };
        AnimateLoaderResponses.SUCCESS = new AnimateLoaderResponses("success");
        AnimateLoaderResponses.ERROR = new AnimateLoaderResponses("error");
        return AnimateLoaderResponses;
    })(Animate.ENUM);
    Animate.AnimateLoaderResponses = AnimateLoaderResponses;
    /**
    * Events associated with requests made to the animate servers
    */
    var AnimateLoaderEvent = (function (_super) {
        __extends(AnimateLoaderEvent, _super);
        function AnimateLoaderEvent(eventName, message, return_type, data) {
            _super.call(this, eventName, data);
            this.message = message;
            this.return_type = return_type;
            this.data = data;
        }
        return AnimateLoaderEvent;
    })(Animate.Event);
    Animate.AnimateLoaderEvent = AnimateLoaderEvent;
    /**
    * This class acts as an interface loader for the animate server.
    */
    var AnimateLoader = (function (_super) {
        __extends(AnimateLoader, _super);
        /**
        * Creates an instance of the Loader
        * @param {string} domain [Optional] Specify the base domain of this call. By default it uses DB.HOST.
        */
        function AnimateLoader(domain) {
            // Call super-class constructor
            _super.call(this, domain);
            this._curCall = null;
        }
        /**
        * This function will make a POST request to the animate server
        * @param {string} url The URL we want to load
        * @param {any} data The post variables to send off to the server
        * @param {number} numTries The number of attempts allowed to make this load
        */
        AnimateLoader.prototype.load = function (url, data, numTries, type) {
            if (numTries === void 0) { numTries = 3; }
            if (type === void 0) { type = "POST"; }
            _super.prototype.load.call(this, url, data, numTries);
            Animate.LoaderBase.showLoader();
            if (url.match(/http/g))
                var fullURL = url;
            else
                var fullURL = this.domain + this.url + this._getQuery;
            this._curCall = jQuery.ajax({
                url: fullURL,
                type: type,
                dataType: this.dataType,
                crossDomain: true,
                cache: true,
                processData: this.processData,
                contentType: this.contentType,
                accepts: 'text/plain',
                data: data,
                success: this.onData.bind(this),
                error: this.onError.bind(this),
                xhrFields: {
                    withCredentials: true
                }
            });
        };
        /**
        * Called when we the ajax response has an error.
        * @param {any} e
        * @param {string} textStatus
        * @param {any} errorThrown
        */
        AnimateLoader.prototype.onError = function (e, textStatus, errorThrown) {
            if (this.numTries > 0) {
                if (this.numTries > 0)
                    this.numTries--;
                var fullURL = this.domain + this.url + this._getQuery;
                this._curCall = jQuery.ajax({
                    url: fullURL,
                    type: 'POST',
                    dataType: this.dataType,
                    crossDomain: true,
                    cache: true,
                    processData: this.processData,
                    contentType: this.contentType,
                    accepts: 'text/plain',
                    data: this.data,
                    success: this.onData.bind(this),
                    error: this.onError.bind(this),
                    xhrFields: {
                        withCredentials: true
                    }
                });
            }
            else {
                Animate.LoaderBase.hideLoader();
                this.dispatchEvent(new AnimateLoaderEvent(Animate.LoaderEvents.FAILED, errorThrown.message, AnimateLoaderResponses.ERROR, null));
                this.dispose();
            }
        };
        /**
        * Called when we get an ajax response.
        * @param {any} data
        * @param {any} textStatus
        * @param {any} jqXHR
        */
        AnimateLoader.prototype.onData = function (data, textStatus, jqXHR) {
            Animate.LoaderBase.hideLoader();
            var e = null;
            if (this.dataType == "text")
                e = new AnimateLoaderEvent(Animate.LoaderEvents.COMPLETE, "Script Loaded", AnimateLoaderResponses.SUCCESS, null);
            else if (this.dataType == "json")
                e = new AnimateLoaderEvent(Animate.LoaderEvents.COMPLETE, data.message, AnimateLoaderResponses.fromString(data.return_type), data);
            else
                e = new AnimateLoaderEvent(Animate.LoaderEvents.COMPLETE, "Loaded", AnimateLoaderResponses.SUCCESS, data);
            this.dispatchEvent(e);
            this.dispose();
        };
        /**
        * Cleans up the object
        */
        AnimateLoader.prototype.dispose = function () {
            //Call super
            _super.prototype.dispose.call(this);
            this._curCall = null;
        };
        return AnimateLoader;
    })(Animate.LoaderBase);
    Animate.AnimateLoader = AnimateLoader;
})(Animate || (Animate = {}));
var Animate;
(function (Animate) {
    /**
    * Valid response codes for xhr binary requests
    */
    var BinaryLoaderResponses = (function (_super) {
        __extends(BinaryLoaderResponses, _super);
        function BinaryLoaderResponses(v) {
            _super.call(this, v);
        }
        BinaryLoaderResponses.SUCCESS = new BinaryLoaderResponses("binary_success");
        BinaryLoaderResponses.ERROR = new BinaryLoaderResponses("binary_error");
        return BinaryLoaderResponses;
    })(Animate.ENUM);
    Animate.BinaryLoaderResponses = BinaryLoaderResponses;
    /**
    * Events associated with xhr binary requests
    */
    var BinaryLoaderEvent = (function (_super) {
        __extends(BinaryLoaderEvent, _super);
        function BinaryLoaderEvent(binaryResponse, buffer, message) {
            if (message === void 0) { message = ""; }
            _super.call(this, binaryResponse, buffer);
            this.buffer = buffer;
            this.message = message;
        }
        return BinaryLoaderEvent;
    })(Animate.Event);
    Animate.BinaryLoaderEvent = BinaryLoaderEvent;
    /**
    * Class used to download contents from a server into an ArrayBuffer
    */
    var BinaryLoader = (function (_super) {
        __extends(BinaryLoader, _super);
        /**
        * Creates an instance of the Loader
        * @param {string} domain [Optional] Specify the base domain of this call. By default it uses DB.HOST.
        */
        function BinaryLoader(domain) {
            _super.call(this, domain);
            this._xhr = null;
            this._onBuffers = this.onBuffersLoaded.bind(this);
            this._onError = this.onError.bind(this);
        }
        /**
        * This function will make a GET request and attempt to download a file into binary data
        * @param {string} url The URL we want to load
        * @param {number} numTries The number of attempts allowed to make this load
        */
        BinaryLoader.prototype.load = function (url, numTries) {
            if (numTries === void 0) { numTries = 3; }
            _super.prototype.load.call(this, url, null, numTries);
            Animate.LoaderBase.showLoader();
            this._xhr = new XMLHttpRequest();
            this._xhr.addEventListener('load', this._onBuffers, false);
            this._xhr.addEventListener('error', this._onError, false);
            this._xhr.withCredentials = true;
            if (this._xhr.overrideMimeType)
                this._xhr.overrideMimeType("text/plain; charset=x-user-defined");
            var fullURL = this.domain + this.url + this._getQuery;
            this._xhr.open("GET", fullURL, true);
            // Must be called after open
            this._xhr.responseType = "arraybuffer";
            this._xhr.send(null);
        };
        /**
        * If an error occurs
        */
        BinaryLoader.prototype.onError = function (event) {
            if (this.numTries > 0) {
                if (this.numTries > 0)
                    this.numTries--;
                var fullURL = this.domain + this.url + this._getQuery;
                this._xhr.open("GET", fullURL, true);
                this._xhr.send(null);
            }
            else {
                Animate.LoaderBase.hideLoader();
                this.dispatchEvent(new BinaryLoaderEvent(BinaryLoaderResponses.ERROR, null, "Could not download data from '" + fullURL + "'"));
                this.dispose();
            }
        };
        /**
        * Cleans up and removes references for GC
        */
        BinaryLoader.prototype.dispose = function () {
            this._xhr.removeEventListener('load', this._onBuffers, false);
            this._xhr.removeEventListener('error', this._onError, false);
            this._xhr = null;
            _super.prototype.dispose.call(this);
        };
        /**
        * Called when the buffers have been loaded
        */
        BinaryLoader.prototype.onBuffersLoaded = function () {
            var xhr = this._xhr;
            var buffer = xhr.response;
            // IEWEBGL needs this
            if (buffer === undefined)
                buffer = (new Uint8Array(xhr.responseBody)).buffer;
            // Buffer not loaded, so manually fill it by converting the string data to bytes
            if (buffer.byteLength == 0) {
                // iOS and other XMLHttpRequest level 1
                buffer = new ArrayBuffer(xhr.responseText.length);
                var bufView = new Uint8Array(buffer);
                for (var i = 0, l = xhr.responseText.length; i < l; i++)
                    bufView[i] = xhr.responseText.charCodeAt(i) & 0xff;
            }
            // Array buffer now filled
            Animate.LoaderBase.hideLoader();
            var e = new BinaryLoaderEvent(BinaryLoaderResponses.SUCCESS, buffer);
            this.dispatchEvent(e);
            this.dispose();
        };
        return BinaryLoader;
    })(Animate.LoaderBase);
    Animate.BinaryLoader = BinaryLoader;
})(Animate || (Animate = {}));
var Animate;
(function (Animate) {
    /**
    * A simple class to define portal behaviour.
    */
    var PortalTemplate = (function () {
        function PortalTemplate(name, type, dataType, value) {
            if (!dataType)
                dataType = Animate.ParameterType.OBJECT;
            if (!value)
                value = "";
            this.name = name;
            this.type = type;
            this.dataType = dataType;
            this.value = value;
        }
        return PortalTemplate;
    })();
    Animate.PortalTemplate = PortalTemplate;
})(Animate || (Animate = {}));
var Animate;
(function (Animate) {
    var ProjectAssetTypes = (function (_super) {
        __extends(ProjectAssetTypes, _super);
        function ProjectAssetTypes(v) {
            _super.call(this, v);
        }
        /**
        * Returns an enum reference by its name/value
        * @param {string} val
        * @returns ENUM
        */
        ProjectAssetTypes.fromString = function (val) {
            switch (val) {
                case "behaviour":
                    return ProjectAssetTypes.BEHAVIOUR;
                case "asset":
                    return ProjectAssetTypes.ASSET;
                case "group":
                    return ProjectAssetTypes.GROUP;
            }
            return null;
        };
        ProjectAssetTypes.BEHAVIOUR = new ProjectAssetTypes("behaviour");
        ProjectAssetTypes.ASSET = new ProjectAssetTypes("asset");
        ProjectAssetTypes.GROUP = new ProjectAssetTypes("group");
        return ProjectAssetTypes;
    })(Animate.ENUM);
    Animate.ProjectAssetTypes = ProjectAssetTypes;
    var ProjectEvents = (function () {
        function ProjectEvents(v) {
            this.value = v;
        }
        ProjectEvents.prototype.toString = function () { return this.value; };
        ProjectEvents.SAVED = new ProjectEvents("saved");
        ProjectEvents.SAVED_ALL = new ProjectEvents("saved_all");
        //static OPENED: ProjectEvents = new ProjectEvents("opened");
        ProjectEvents.FAILED = new ProjectEvents("failed");
        ProjectEvents.BUILD_SELECTED = new ProjectEvents("build_selected");
        ProjectEvents.HTML_SAVED = new ProjectEvents("html_saved");
        ProjectEvents.CSS_SAVED = new ProjectEvents("css_saved");
        ProjectEvents.BUILD_SAVED = new ProjectEvents("build_saved");
        ProjectEvents.BEHAVIOUR_DELETING = new ProjectEvents("behaviour_deleting");
        ProjectEvents.BEHAVIOURS_LOADED = new ProjectEvents("behaviours_loaded");
        ProjectEvents.BEHAVIOUR_CREATED = new ProjectEvents("behaviour_created");
        ProjectEvents.BEHAVIOUR_UPDATED = new ProjectEvents("behaviour_updated");
        ProjectEvents.BEHAVIOURS_UPDATED = new ProjectEvents("behaviours_updated");
        ProjectEvents.BEHAVIOURS_SAVED = new ProjectEvents("behaviours_saved");
        ProjectEvents.BEHAVIOUR_SAVED = new ProjectEvents("behaviour_saved");
        ProjectEvents.ASSET_CREATED = new ProjectEvents("asset_created");
        ProjectEvents.ASSET_SAVED = new ProjectEvents("asset_saved");
        ProjectEvents.ASSET_UPDATED = new ProjectEvents("asset_updated");
        ProjectEvents.ASSETS_UPDATED = new ProjectEvents("assets_updated");
        ProjectEvents.ASSET_DELETING = new ProjectEvents("asset_deleting");
        ProjectEvents.ASSETS_LOADED = new ProjectEvents("assets_deleted");
        ProjectEvents.GROUP_UPDATED = new ProjectEvents("group_updated");
        ProjectEvents.GROUPS_UPDATED = new ProjectEvents("groups_updated");
        ProjectEvents.GROUP_SAVED = new ProjectEvents("group_saved");
        ProjectEvents.GROUPS_SAVED = new ProjectEvents("groups_saved");
        ProjectEvents.GROUP_DELETING = new ProjectEvents("group_deleting");
        ProjectEvents.GROUP_CREATED = new ProjectEvents("group_created");
        ProjectEvents.GROUPS_LOADED = new ProjectEvents("groups_loaded");
        ProjectEvents.FILE_CREATED = new ProjectEvents("file_created");
        ProjectEvents.FILE_IMPORTED = new ProjectEvents("file_imported");
        ProjectEvents.FILE_DELETED = new ProjectEvents("file_deleted");
        ProjectEvents.FILES_DELETED = new ProjectEvents("files_deleted");
        ProjectEvents.FILES_CREATED = new ProjectEvents("files_created");
        ProjectEvents.FILE_UPDATED = new ProjectEvents("file_updated");
        ProjectEvents.FILE_IMAGE_UPDATED = new ProjectEvents("file_image_updated");
        ProjectEvents.FILES_LOADED = new ProjectEvents("files_loaded");
        //static FILES_FETCHED: ProjectEvents = new ProjectEvents("files_fetched");
        ProjectEvents.OBJECT_RENAMED = new ProjectEvents("object_renamed");
        return ProjectEvents;
    })();
    Animate.ProjectEvents = ProjectEvents;
    var ProjectEvent = (function (_super) {
        __extends(ProjectEvent, _super);
        function ProjectEvent(eventName, message, return_type, data) {
            _super.call(this, eventName, message, return_type, data);
        }
        return ProjectEvent;
    })(Animate.AnimateLoaderEvent);
    Animate.ProjectEvent = ProjectEvent;
    /**
    * A project class is an object that is owned by a user.
    * The project has functions which are useful for comunicating data to the server when
    * loading and saving data in the scene.
    */
    var Project = (function (_super) {
        __extends(Project, _super);
        /**
        * @param{string} id The database id of this project
        */
        function Project() {
            // Call super-class constructor
            _super.call(this);
            //this._id = id;
            //this.buildId = "";
            this.mSaved = true;
            //this.mName = name;
            //this.mDescription = "";
            //this.mTags = "";
            //this.mRequest = "";
            //this.mCurBuild = build;
            //this._plugins = [];
            //this.created = Date.now();
            //this.lastModified = Date.now();
            //this.mCategory = "";
            //this.mSubCategory = "";
            //this.mRating = 0;
            //this.mImgPath = "";
            //this.mVisibility = "";
            this._behaviours = [];
            this._assets = [];
            this._files = [];
        }
        /**
        * Gets an asset by its ID
        * @param {string} id The ID of the asset id
        * @returns {Asset} The asset whose id matches the id parameter or null
        */
        Project.prototype.getAssetByID = function (id) {
            for (var i = 0; i < this._assets.length; i++)
                if (this._assets[i].id == id)
                    return this._assets[i];
            return null;
        };
        /**
        * Gets an asset by its shallow ID
        * @param {string} id The shallow ID of the asset id
        * @returns {Asset} The asset whose id matches the id parameter or null
        */
        Project.prototype.getAssetByShallowId = function (id) {
            for (var i = 0; i < this._assets.length; i++)
                if (this._assets[i].shallowId == id)
                    return this._assets[i];
            return null;
        };
        /**
        * Gets a file by its ID
        * @param {string} id The ID of the file
        * @returns {File} The file whose id matches the id parameter or null
        */
        Project.prototype.getFile = function (id) {
            for (var i = 0; i < this._files.length; i++)
                if (this._files[i].id == id)
                    return this._files[i];
            return null;
        };
        /**
        * Gets a {BehaviourContainer} by its ID
        * @param {string} id The ID of the BehaviourContainer
        * @returns {BehaviourContainer} The BehaviourContainer whose id matches the id parameter or null
        */
        Project.prototype.getBehaviourById = function (id) {
            for (var i = 0; i < this._behaviours.length; i++)
                if (this._behaviours[i].id == id)
                    return this._behaviours[i];
            return null;
        };
        /**
        * Gets a {BehaviourContainer} by its shallow or local ID
        * @param {string} id The local ID of the BehaviourContainer
        * @returns {BehaviourContainer} The BehaviourContainer whose id matches the id parameter or null
        */
        Project.prototype.getBehaviourByShallowId = function (id) {
            for (var i = 0; i < this._behaviours.length; i++)
                if (this._behaviours[i].shallowId == id)
                    return this._behaviours[i];
            return null;
        };
        //      /**
        //* Attempts to load all assets and resources into the project
        //      * @returns {JQueryPromise<UsersInterface.IResponse>}
        //*/
        //      load(): JQueryPromise<UsersInterface.IResponse>
        //      {
        //          var d = jQuery.Deferred<UsersInterface.IResponse>();
        //          // TODO: Load all things when opening a project
        //          jQuery.getJSON(`${DB.USERS}/users/resend-activation/${user}`).done(function (data: UsersInterface.IResponse)
        //          {
        //              if (data.error)
        //                  return d.reject(new Error(data.message));
        //              return d.resolve(data);
        //          }).fail(function (err: JQueryXHR)
        //          {
        //              d.reject(new Error(`An error occurred while connecting to the server. ${err.status}: ${err.responseText}`));
        //          })
        //          return d.promise();
        //      }
        /**
        * Attempts to update the project details base on the token provided
        * @returns {Engine.IProject} The project token
        * @returns {JQueryPromise<UsersInterface.IResponse>}
        */
        Project.prototype.updateDetails = function (token) {
            var d = jQuery.Deferred();
            // Attempts to update the model
            jQuery.ajax(Animate.DB.API + "/projects/" + this.entry.user + "/" + this.entry._id, {
                type: "put",
                contentType: 'application/json;charset=UTF-8',
                dataType: "json",
                data: JSON.stringify(token)
            }).done(function (data) {
                if (data.error)
                    return d.reject(new Error(data.message));
                return d.resolve(data);
            }).fail(function (err) {
                d.reject(new Error("An error occurred while connecting to the server. " + err.status + ": " + err.responseText));
            });
            return d.promise();
        };
        /**
        * Use this to rename a behaviour, group or asset.
        * @param {string} name The new name of the object
        * @param {string} id The id of the asset or behaviour.
        * @param {ProjectAssetTypes} type The type of object we are renaming. this can be either 'group', 'asset' or 'behaviour'
        */
        Project.prototype.renameObject = function (name, id, type) {
            var loader = new Animate.AnimateLoader();
            loader.on(Animate.LoaderEvents.COMPLETE, this.onServer, this);
            loader.on(Animate.LoaderEvents.FAILED, this.onServer, this);
            loader.load("/project/rename-object", {
                projectId: this.entry._id,
                name: name,
                objectId: id,
                type: type.toString()
            });
        };
        /**
        * This function is used to create an entry for this project on the DB.
        */
        Project.prototype.selectBuild = function (major, mid, minor) {
            var loader = new Animate.AnimateLoader();
            loader.on(Animate.LoaderEvents.COMPLETE, this.onServer, this);
            loader.on(Animate.LoaderEvents.FAILED, this.onServer, this);
            loader.load("/project/select-build", { projectId: this.entry._id, major: major, mid: mid, minor: minor });
        };
        /**
        * This function is used to update the current build data
        */
        Project.prototype.saveBuild = function (notes, visibility, html, css) {
            var loader = new Animate.AnimateLoader();
            loader.on(Animate.LoaderEvents.COMPLETE, this.onServer, this);
            loader.on(Animate.LoaderEvents.FAILED, this.onServer, this);
            loader.load("/project/save-build", { projectId: this.entry._id, buildId: this.entry.build, notes: notes, visibility: visibility, html: html, css: css });
        };
        /**
        * This function is used to save an array of behaviors to the DB
        * @param { Array<string>} behavioursIds This is the array behaviour ids we are saving.
        */
        Project.prototype.saveBehaviours = function (behavioursIds) {
            if (behavioursIds.length == 0)
                return;
            var ids = [];
            var jsons = [];
            var behaviours = this._behaviours;
            // Create a multidimension array and pass each of the behaviours
            for (var i = 0, l = behavioursIds.length; i < l; i++)
                for (var ii = 0, l = behaviours.length; ii < l; ii++)
                    if (behavioursIds[i] == behaviours[ii].id) {
                        var json = null;
                        var canvas = Animate.CanvasTab.getSingleton().getTabCanvas(behavioursIds[i]);
                        if (canvas)
                            json = canvas.buildDataObject();
                        else {
                            json = behaviours[ii].json;
                            json.properties = behaviours[ii]._properties.tokenize();
                        }
                        var jsonStr = json.toString();
                        ids.push(behaviours[ii].id);
                        jsons.push(jsonStr);
                    }
            var loader = new Animate.AnimateLoader();
            loader.on(Animate.LoaderEvents.COMPLETE, this.onServer, this);
            loader.on(Animate.LoaderEvents.FAILED, this.onServer, this);
            loader.load("/project/save-behaviours", { projectId: this.entry._id, ids: ids, data: jsons });
        };
        /**
        * This function is used to save the behaviors, groups and _assets or the DB
        */
        Project.prototype.saveAll = function () {
            // Behaviours
            var ids = [];
            var behaviours = this._behaviours;
            for (var i = 0, l = behaviours.length; i < l; i++)
                if (!behaviours[i].saved)
                    ids.push(behaviours[i].id);
            this.saveBehaviours(ids);
            // Assets
            ids.splice(0, ids.length);
            var assets = this._assets;
            for (var i = 0, l = assets.length; i < l; i++)
                if (!assets[i].saved)
                    ids.push(assets[i].id);
            this.saveAssets(ids);
            // Groups
            ids.splice(0, ids.length);
            var groups = Animate.TreeViewScene.getSingleton().getGroups();
            for (var i = 0, l = groups.length; i < l; i++)
                if (!groups[i].saved)
                    ids.push(groups[i].groupID);
            this.saveGroups(ids);
            Animate.CanvasTab.getSingleton().saveAll();
            this.saveHTML();
            this.saveCSS();
        };
        /**
        * This function is used to create a new behaviour. This will make
        * a call the server. If the server sends a fail message no new behaviour
        * will be created. You can use the event BEHAVIOUR_CREATED to hook into
        * @param {string} name The proposed name of the behaviour.
        */
        Project.prototype.createBehaviour = function (name) {
            for (var i = 0; i < this._behaviours.length; i++)
                if (this._behaviours[i].name == name) {
                    this.dispatchEvent(new ProjectEvent(ProjectEvents.FAILED, "A behaviour with that name already exists.", Animate.LoaderEvents.FAILED));
                    return;
                }
            var loader = new Animate.AnimateLoader();
            loader.on(Animate.LoaderEvents.COMPLETE, this.onServer, this);
            loader.on(Animate.LoaderEvents.FAILED, this.onServer, this);
            loader.load("/project/create-behaviour", { projectId: this.entry._id, name: name, shallowId: Animate.BehaviourContainer.getNewLocalId() });
        };
        /**
        * Saves the HTML from the HTML tab to the server
        */
        Project.prototype.saveHTML = function () {
            var html = (Animate.HTMLTab.singleton ? Animate.HTMLTab.singleton.editor.getValue() : this.mCurBuild.html);
            var loader = new Animate.AnimateLoader();
            this.mCurBuild.html = html;
            loader.on(Animate.LoaderEvents.COMPLETE, this.onServer, this);
            loader.on(Animate.LoaderEvents.FAILED, this.onServer, this);
            loader.load("/project/save-html", { projectId: this.entry._id, html: html });
        };
        /**
        * Saves the HTML from the HTML tab to the server
        */
        Project.prototype.saveCSS = function () {
            var css = (Animate.CSSTab.singleton ? Animate.CSSTab.singleton.editor.getValue() : this.mCurBuild.css);
            var loader = new Animate.AnimateLoader();
            this.mCurBuild.css = css;
            loader.on(Animate.LoaderEvents.COMPLETE, this.onServer, this);
            loader.on(Animate.LoaderEvents.FAILED, this.onServer, this);
            loader.load("/project/save-css", { projectId: this.entry._id, css: css });
        };
        /**
        * This function is used to delete behaviours.
        * @param {Array<string>} behavioursIds The behaviour Ids we need to delete
        */
        Project.prototype.deleteBehaviours = function (behavioursIds) {
            var ids = [];
            //Create a multidimension array and pass each of the _behaviours
            for (var i = 0, l = behavioursIds.length; i < l; i++)
                ids.push(behavioursIds[i]);
            var loader = new Animate.AnimateLoader();
            loader.on(Animate.LoaderEvents.COMPLETE, this.onServer, this);
            loader.on(Animate.LoaderEvents.FAILED, this.onServer, this);
            loader.load("/project/delete-behaviours", { projectId: this.entry._id, ids: ids });
        };
        /**
        * This function is used to fetch the _files associated with a project.
        * @param {string} mode Which files to fetch - this can be either 'global', 'project' or 'user'
        */
        Project.prototype.loadFiles = function (mode) {
            if (mode === void 0) { mode = "project"; }
            var loader = new Animate.AnimateLoader();
            loader.on(Animate.LoaderEvents.COMPLETE, this.onServer, this);
            loader.on(Animate.LoaderEvents.FAILED, this.onServer, this);
            loader.load("/project/get-files", { projectId: this.entry._id, mode: mode });
        };
        /**
        * This function is used to import a user's file from another project or from the global _assets base
        */
        Project.prototype.importFile = function (ids) {
            var loader = new Animate.AnimateLoader();
            loader.on(Animate.LoaderEvents.COMPLETE, this.onServer, this);
            loader.on(Animate.LoaderEvents.FAILED, this.onServer, this);
            loader.load("/project/import-files", { projectId: this.entry._id, ids: ids, });
        };
        /**
        * This function is used to delete files from a project and the database. The file asset will
        * not be deleted if another project has a reference to it. The reference of this project to the file will be
        * removed either way.
        * @param {Array<string>} ids An array of file IDs to delete
        */
        Project.prototype.deleteFiles = function (ids) {
            var loader = new Animate.AnimateLoader();
            loader.on(Animate.LoaderEvents.COMPLETE, this.onServer, this);
            loader.on(Animate.LoaderEvents.FAILED, this.onServer, this);
            loader.load("/project/delete-files", { projectId: this.entry._id, ids: ids, });
        };
        /**
        * Use this function to create an empty data file for the user
        * @param {string} name The name of file we are creating. Please note this is not a file name.
        */
        Project.prototype.createEmptyFile = function (name) {
            var loader = new Animate.AnimateLoader();
            loader.on(Animate.LoaderEvents.COMPLETE, this.onServer, this);
            loader.on(Animate.LoaderEvents.FAILED, this.onServer, this);
            loader.load("/file/create-empty-file", { projectId: this.entry._id, name: name });
        };
        /**
        * Fills a data file with the contents of an XHR request
        * See https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest/Sending_and_Receiving_Binary_Data
        * @param {string} id The id of the file we are
        * @param {ArrayBufferView} view The data to fill the file with
        */
        Project.prototype.fillFile = function (id, view) {
            var loader = new Animate.AnimateLoader();
            loader.on(Animate.LoaderEvents.COMPLETE, this.onServer, this);
            loader.on(Animate.LoaderEvents.FAILED, this.onServer, this);
            loader.contentType = "application/octet-stream";
            loader.processData = false;
            loader.getVariables = { id: id, projectId: this.entry._id };
            loader.load("/file/fill-file", view);
        };
        /**
        * Use this function to update file properties
        * @param {string} fileId The file we are updating
        * @param {string} name The new name of the file.
        * @param {Array<string>} tags The new comma separated tags of the file.
        * @param {bool} favourite If this file is a favourite
        * @param {bool} global True or false if this file is shared globally
        */
        Project.prototype.saveFile = function (fileId, name, tags, favourite, global) {
            var loader = new Animate.AnimateLoader();
            loader.on(Animate.LoaderEvents.COMPLETE, this.onServer, this);
            loader.on(Animate.LoaderEvents.FAILED, this.onServer, this);
            loader.load("/project/save-file", { projectId: this.entry._id, fileId: fileId, name: name, tags: tags, favourite: favourite, global: global });
        };
        /**
        * This function is used to fetch the beaviours of a project.
        */
        Project.prototype.loadBehaviours = function () {
            var loader = new Animate.AnimateLoader();
            loader.on(Animate.LoaderEvents.COMPLETE, this.onServer, this);
            loader.on(Animate.LoaderEvents.FAILED, this.onServer, this);
            loader.load("/project/get-behaviours", { projectId: this.entry._id });
        };
        /**
        * This function is used to create a new group. This will make
        * a call the server. If the server sends a fail message then no new group
        * will be created. You can use the event GROUP_CREATED to hook into
        * a successful DB entry created.
        * @param {string} name The proposed name of the group.
        */
        Project.prototype.createGroup = function (name) {
            var loader = new Animate.AnimateLoader();
            loader.on(Animate.LoaderEvents.COMPLETE, this.onServer, this);
            loader.on(Animate.LoaderEvents.FAILED, this.onServer, this);
            loader.load("/project/create-group", { projectId: this.entry._id, name: name });
        };
        /**
        * This function is used to fetch the groups of a project.
        */
        Project.prototype.loadGroups = function () {
            var loader = new Animate.AnimateLoader();
            loader.on(Animate.LoaderEvents.COMPLETE, this.onServer, this);
            loader.on(Animate.LoaderEvents.FAILED, this.onServer, this);
            loader.load("/project/get-groups", { projectId: this.entry._id });
        };
        /**
        * This will save the current state of the groups to the server
        * @param {Array<string>} groupIds The array of group ID's we are trying to save.
        */
        Project.prototype.saveGroups = function (groupIds) {
            if (groupIds.length == 0)
                return;
            var group = null;
            var ids = [];
            var jsons = [];
            for (var i = 0, l = groupIds.length; i < l; i++) {
                group = Animate.TreeViewScene.getSingleton().getGroupByID(groupIds[i]);
                jsons.push(JSON.stringify(group.json));
                ids.push(group.groupID);
            }
            var loader = new Animate.AnimateLoader();
            loader.on(Animate.LoaderEvents.COMPLETE, this.onServer, this);
            loader.on(Animate.LoaderEvents.FAILED, this.onServer, this);
            loader.load("/project/save-groups", { projectId: this.entry._id, ids: ids, data: jsons });
        };
        /**
        * Deletes groups from the project
        * @param {Array<string>} groupIds The array of group IDs to delete
        */
        Project.prototype.deleteGroups = function (groupIds) {
            var loader = new Animate.AnimateLoader();
            loader.on(Animate.LoaderEvents.COMPLETE, this.onServer, this);
            loader.on(Animate.LoaderEvents.FAILED, this.onServer, this);
            loader.load("/project/delete-groups", { projectId: this.entry._id, ids: groupIds });
        };
        /**
        * This will download all group variables from the server. If successful, the function will also get
        * the asset treeview to update its contents
        * @param {Array<string>} groupIds  groupIds The array of group IDs to update
        */
        Project.prototype.updateGroups = function (groupIds) {
            var loader = new Animate.AnimateLoader();
            loader.on(Animate.LoaderEvents.COMPLETE, this.onServer, this);
            loader.on(Animate.LoaderEvents.FAILED, this.onServer, this);
            loader.load("/project/update-groups", { projectId: this.entry._id, ids: groupIds });
        };
        /**
        * This function is used to create a new asset on the server.
        * If the server sends a fail message then no new asset
        * will be created. You can use the event <Project.ASSET_CREATED> to hook into
        * a successful DB entry created.
        * @param {string} name The proposed name of the asset.
        * @param {string} className The class of the asset.
        */
        Project.prototype.createAsset = function (name, className) {
            var loader = new Animate.AnimateLoader();
            loader.on(Animate.LoaderEvents.COMPLETE, this.onServer, this);
            loader.on(Animate.LoaderEvents.FAILED, this.onServer, this);
            loader.load("/project/create-asset", { projectId: this.entry._id, name: name, className: className, shallowId: Animate.Asset.getNewLocalId() });
        };
        /**
        * This will save a group of asset's variables to the server in JSON.
        * @param {Array<string>} assetIds An array of asset ids of the assets we want to save
        */
        Project.prototype.saveAssets = function (assetIds) {
            if (assetIds.length == 0)
                return;
            var pm = Animate.PluginManager.getSingleton();
            var ev = new Animate.AssetEvent(Animate.EditorEvents.ASSET_SAVING, null);
            var asset = null;
            var ids = [];
            var shallowIds = [];
            var jsons = [];
            for (var i = 0, l = assetIds.length; i < l; i++) {
                asset = this.getAssetByID(assetIds[i]);
                // Tell plugins about asset saving
                ev.asset = asset;
                pm.dispatchEvent(ev);
                jsons.push(JSON.stringify(asset.properties.tokenize()));
                ids.push(asset.id);
                shallowIds.push(asset.shallowId);
            }
            var loader = new Animate.AnimateLoader();
            loader.on(Animate.LoaderEvents.COMPLETE, this.onServer, this);
            loader.on(Animate.LoaderEvents.FAILED, this.onServer, this);
            loader.load("/project/save-assets", { projectId: this.entry._id, ids: ids, data: jsons });
        };
        /**
        * This will download an asset's variables from the server.
        * @param {Array<string>} assetIds An array of assets we are updating
        */
        Project.prototype.updateAssets = function (assetIds) {
            var loader = new Animate.AnimateLoader();
            loader.on(Animate.LoaderEvents.COMPLETE, this.onServer, this);
            loader.on(Animate.LoaderEvents.FAILED, this.onServer, this);
            loader.load("/project/update-assets", { projectId: this.entry._id, ids: assetIds });
        };
        /**
        * This will download all asset variables from the server.
        * @param {Array<string>} behaviourIDs An array of behaviour ID's that need to be updated
        */
        Project.prototype.updateBehaviours = function (behaviourIDs) {
            var loader = new Animate.AnimateLoader();
            loader.on(Animate.LoaderEvents.COMPLETE, this.onServer, this);
            loader.on(Animate.LoaderEvents.FAILED, this.onServer, this);
            loader.load("/project/update-behaviours", { projectId: this.entry._id, ids: behaviourIDs });
        };
        /**
        * This function is used to copy an asset.
        * @param {string} assetId The asset object we are trying to copy
        */
        Project.prototype.copyAsset = function (assetId) {
            var loader = new Animate.AnimateLoader();
            loader.on(Animate.LoaderEvents.COMPLETE, this.onServer, this);
            loader.on(Animate.LoaderEvents.FAILED, this.onServer, this);
            loader.load("/project/copy-asset", { projectId: this.entry._id, assetId: assetId, shallowId: Animate.Asset.getNewLocalId() });
        };
        /**
        * This function is used to delete assets.
        * @param {Array<string>} assetIDs The asset objects we are trying to delete
        */
        Project.prototype.deleteAssets = function (assetIDs) {
            var loader = new Animate.AnimateLoader();
            loader.on(Animate.LoaderEvents.COMPLETE, this.onServer, this);
            loader.on(Animate.LoaderEvents.FAILED, this.onServer, this);
            loader.load("/project/delete-assets", { projectId: this.entry._id, ids: assetIDs });
        };
        /**
        * This function is used to fetch the _assets of a project.
        */
        Project.prototype.loadAssets = function () {
            var loader = new Animate.AnimateLoader();
            loader.on(Animate.LoaderEvents.COMPLETE, this.onServer, this);
            loader.on(Animate.LoaderEvents.FAILED, this.onServer, this);
            loader.load("/project/get-assets", { projectId: this.entry._id });
        };
        /**
        * Loads the project from data sent from the server
        * @param {any} data The data sent from the server
        */
        Project.prototype.loadFromData = function (data) {
            this.mSaved = true;
            //this.buildId = data.project.buildId;
            //this.created = data.project.createdOn;
            //this.lastModified = data.project.lastModified;
            //this.mName = data.project.name;
            //this.mRating = data.project.rating;
            //this.mCategory = data.project.category;
            //this.mSubCategory = data.project.sub_category;
            //this.mImgPath = data.project.image;
            //this.mVisibility = data.project.visibility;
            //var pluginIds = data.project.plugins;
            //if ( !pluginIds )
            //	this._plugins = [];
            //else
            //{
            //             this._plugins = [];
            //             for (var i = 0, l = pluginIds.length; i < l; i++)
            //                 this._plugins.push(getPluginByID[pluginIds[i]]);
            //	//var i = __plugins.length;
            //	//while ( i-- )
            //	//{
            //	//	var ii: number = pluginIds.length;
            //	//	while ( ii-- )
            //	//		if ( pluginIds[ii] == __plugins[i]._id )
            //	//		{
            //	//			this._plugins.push( __plugins[i] );
            //	//			break;
            //	//		}
            //	//}
            //}
            this.mCurBuild = data.build;
            //this.mDescription = data.project.description;
            //this.mTags = data.project.tags;
        };
        /**
        * This function is called whenever we get a resonse from the server
        */
        Project.prototype.onServer = function (response, event, sender) {
            var data = event.tag;
            var pManager = Animate.PluginManager.getSingleton();
            var dispatchEvent;
            var loader = sender;
            if (response == Animate.LoaderEvents.COMPLETE) {
                if (event.return_type == Animate.AnimateLoaderResponses.SUCCESS) {
                    //Sets the current build
                    if (loader.url == "/project/select-build") {
                        this.mCurBuild = data.build;
                        this.dispatchEvent(new ProjectEvent(ProjectEvents.BUILD_SELECTED, data.message, Animate.LoaderEvents.fromString(data.return_type), this.mCurBuild));
                    }
                    else if (loader.url == "/project/save-build") {
                        //this.mCurBuild = data.build;
                        this.dispatchEvent(new ProjectEvent(ProjectEvents.BUILD_SAVED, "Build saved", Animate.LoaderEvents.fromString(data.return_type), this.mCurBuild));
                    }
                    else if (loader.url == "/project/delete-behaviours") {
                        //Update behaviours ids which we fetched from the DB.
                        for (var i = 0, l = data.length; i < l; i++) {
                            var len = this._behaviours.length;
                            for (var ii = 0; ii < len; ii++)
                                if (this._behaviours[ii].id == data[i]) {
                                    var behaviour = this._behaviours[ii];
                                    behaviour.dispose();
                                    this._behaviours.splice(ii, 1);
                                    this.dispatchEvent(new ProjectEvent(ProjectEvents.BEHAVIOUR_DELETING, "Deleting Behaviour", Animate.LoaderEvents.COMPLETE, behaviour));
                                    break;
                                }
                        }
                    }
                    else if (loader.url == "/project/create-behaviour") {
                        var behaviour = new Animate.BehaviourContainer(data.name, data.id, data.shallowId);
                        this._behaviours.push(behaviour);
                        //Create the GUI elements
                        var node = Animate.TreeViewScene.getSingleton().addContainer(behaviour);
                        node.save(false);
                        var tabPair = Animate.CanvasTab.getSingleton().addSpecialTab(behaviour.name, Animate.CanvasTabType.CANVAS, behaviour);
                        jQuery(".text", tabPair.tabSelector.element).text(node.element.text());
                        tabPair.name = node.element.text();
                        this.dispatchEvent(new ProjectEvent(ProjectEvents.BEHAVIOUR_CREATED, "Behaviour created", Animate.LoaderEvents.COMPLETE, behaviour));
                    }
                    else if (loader.url == "/project/get-behaviours") {
                        //Cleanup behaviourssaveAll
                        for (var i = 0; i < this._behaviours.length; i++)
                            this._behaviours[i].dispose();
                        this._behaviours.splice(0, this._behaviours.length);
                        //Create new behaviours which we fetched from the DB.
                        for (var i = 0, l = data.length; i < l; i++) {
                            var dbEntry = data[i];
                            var b = new Animate.BehaviourContainer(dbEntry["name"], dbEntry["_id"], dbEntry["shallowId"]);
                            b.json = Animate.CanvasToken.fromDatabase(dbEntry["json"], dbEntry["_id"]);
                            b.setProperties(dbEntry.json.properties);
                            this._behaviours.push(b);
                            //Create the GUI elements
                            Animate.TreeViewScene.getSingleton().addContainer(b);
                            //Update the GUI elements
                            Animate.TreeViewScene.getSingleton().updateBehaviour(b);
                            this.dispatchEvent(new ProjectEvent(ProjectEvents.BEHAVIOUR_UPDATED, "Behaviour updated", Animate.LoaderEvents.COMPLETE, b));
                        }
                        this.dispatchEvent(new ProjectEvent(ProjectEvents.BEHAVIOURS_LOADED, "Behaviours loaded", Animate.LoaderEvents.COMPLETE, null));
                    }
                    else if (loader.url == "/project/save-behaviours") {
                        for (var i = 0; i < this._behaviours.length; i++)
                            for (ii = 0, l = data.length; ii < l; ii++)
                                if (this._behaviours[i].id == data[ii]) {
                                    // Make sure the JSON is updated in the behaviour
                                    var canvas = Animate.CanvasTab.getSingleton().getTabCanvas(data[ii]);
                                    if (canvas)
                                        this._behaviours[i].json = canvas.buildDataObject();
                                    this.dispatchEvent(new ProjectEvent(ProjectEvents.BEHAVIOUR_SAVED, "Behaviour saved", Animate.LoaderEvents.COMPLETE, this._behaviours[i]));
                                    break;
                                }
                        this.dispatchEvent(new ProjectEvent(ProjectEvents.BEHAVIOURS_SAVED, "Behaviours saved", Animate.LoaderEvents.COMPLETE, null));
                    }
                    else if (loader.url == "/project/save-html") {
                        this.dispatchEvent(new ProjectEvent(ProjectEvents.HTML_SAVED, "HTML saved", Animate.LoaderEvents.fromString(data.return_type), this.mCurBuild));
                        if (Animate.HTMLTab.singleton)
                            Animate.HTMLTab.singleton.save();
                    }
                    else if (loader.url == "/project/save-css") {
                        this.dispatchEvent(new ProjectEvent(ProjectEvents.CSS_SAVED, "CSS saved", Animate.LoaderEvents.fromString(data.return_type), this.mCurBuild));
                        if (Animate.CSSTab.singleton)
                            Animate.CSSTab.singleton.save();
                    }
                    else if (loader.url == "/project/delete-assets") {
                        dispatchEvent = new Animate.AssetEvent(Animate.EditorEvents.ASSET_DESTROYED, null);
                        var ev = new Animate.AssetEvent(ProjectEvents.ASSET_DELETING, null);
                        for (var i = 0, l = data.length; i < l; i++) {
                            var len = this._assets.length;
                            for (var ii = 0; ii < len; ii++)
                                if (this._assets[ii].id == data[i]) {
                                    ev.asset = this._assets[ii];
                                    this.dispatchEvent(ev);
                                    //Notify the destruction of an asset
                                    dispatchEvent.asset = this._assets[ii];
                                    pManager.dispatchEvent(dispatchEvent);
                                    this._assets[ii].dispose();
                                    this._assets.splice(ii, 1);
                                    break;
                                }
                        }
                    }
                    else if (loader.url == "/project/get-files") {
                        var i = this._files.length;
                        while (i--)
                            this._files[i].dispose();
                        this._files.splice(0, this._files.length);
                        //Create each of the files
                        for (var i = 0, l = data.length; i < l; i++) {
                            var dbEntry = data[i];
                            var file = new Animate.File(dbEntry["name"], dbEntry["url"], dbEntry["tags"], dbEntry["_id"], dbEntry["createdOn"], dbEntry["lastModified"], dbEntry["size"], dbEntry["favourite"], dbEntry["previewUrl"], dbEntry["global"]);
                            this._files.push(file);
                            this.dispatchEvent(new ProjectEvent(ProjectEvents.FILE_CREATED, "File created", Animate.LoaderEvents.COMPLETE, file));
                        }
                        this.dispatchEvent(new ProjectEvent(ProjectEvents.FILES_CREATED, "Files created", Animate.LoaderEvents.COMPLETE, this));
                        this.dispatchEvent(new ProjectEvent(ProjectEvents.FILES_LOADED, "Files loaded", Animate.LoaderEvents.COMPLETE, this));
                    }
                    else if (loader.url == "/project/import-files") {
                        //Create new _assets which we fetched from the DB.
                        this.dispatchEvent(new ProjectEvent(ProjectEvents.FILE_CREATED, event.message, Animate.LoaderEvents.COMPLETE, file));
                        this.dispatchEvent(new ProjectEvent(ProjectEvents.FILE_IMPORTED, event.message, Animate.LoaderEvents.COMPLETE, file));
                    }
                    else if (loader.url == "/project/delete-files") {
                        for (var ii = 0, l = data.length; ii < l; ii++)
                            for (var i = 0, len = this._files.length; i < len; i++)
                                if (this._files[i].id == data[ii]) {
                                    this._files[i].dispose();
                                    this.dispatchEvent(new ProjectEvent(ProjectEvents.FILE_DELETED, "File deleted", Animate.LoaderEvents.COMPLETE, this._files[i]));
                                    this._files.splice(i, 1);
                                    break;
                                }
                        this.dispatchEvent(new ProjectEvent(ProjectEvents.FILES_DELETED, "Files deleted", Animate.LoaderEvents.COMPLETE, data));
                    }
                    else if (loader.url == "/file/create-empty-file") {
                        var file = new Animate.File(data["name"], data["url"], [], data["_id"], data["createdOn"], data["lastModified"], 0, false, data["previewUrl"], false);
                        this.dispatchEvent(new ProjectEvent(ProjectEvents.FILE_CREATED, "File created", Animate.LoaderEvents.COMPLETE, file));
                    }
                    else if (loader.url == "/file/fill-file") {
                        for (var i = 0, len = this._files.length; i < len; i++)
                            if (this._files[i].id == data.id) {
                                this.dispatchEvent(new ProjectEvent(ProjectEvents.FILE_UPDATED, "File updated", Animate.LoaderEvents.COMPLETE, this._files[i]));
                                return;
                            }
                    }
                    else if (loader.url == "/project/save-file") {
                        for (var i = 0, len = this._files.length; i < len; i++)
                            if (this._files[i].id == data._id) {
                                this._files[i].name = data.name;
                                this._files[i].tags = data.tags;
                                this._files[i].lastModified = data.lastModified;
                                this._files[i].favourite = data.favourite;
                                this._files[i].global = data.global;
                                if (loader.url == "/project/save-file")
                                    this.dispatchEvent(new ProjectEvent(ProjectEvents.FILE_UPDATED, "File updated", Animate.LoaderEvents.COMPLETE, this._files[i]));
                                else
                                    this.dispatchEvent(new ProjectEvent(ProjectEvents.FILE_IMAGE_UPDATED, "File image updated", Animate.LoaderEvents.COMPLETE, this._files[i]));
                                return;
                            }
                    }
                    else if (loader.url == "/project/create-group")
                        this.dispatchEvent(new ProjectEvent(ProjectEvents.GROUP_CREATED, "Group created", Animate.LoaderEvents.COMPLETE, { id: data._id, name: data.name, json: data.json }));
                    else if (loader.url == "/project/get-groups") {
                        //Create new _assets which we fetched from the DB.
                        for (var i = 0, l = data.length; i < l; i++) {
                            var dbEntry = data[i];
                            this.dispatchEvent(new ProjectEvent(ProjectEvents.GROUP_CREATED, "Group created", Animate.LoaderEvents.COMPLETE, { id: dbEntry["_id"], name: dbEntry["name"], json: dbEntry["json"] }));
                        }
                        this.dispatchEvent(new ProjectEvent(ProjectEvents.GROUPS_LOADED, "Groups loaded", Animate.LoaderEvents.COMPLETE, this));
                    }
                    else if (loader.url == "/project/delete-groups") {
                        for (var i = 0, l = data.length; i < l; i++) {
                            var grpID = data[i];
                            this.dispatchEvent(new ProjectEvent(ProjectEvents.GROUP_DELETING, "Group deleting", Animate.LoaderEvents.COMPLETE, grpID));
                        }
                    }
                    else if (loader.url == "/project/update-groups") {
                        //Update _assets which we fetched from the DB.
                        for (var i = 0, l = data.length; i < l; i++) {
                            var grp = data[i];
                            this.dispatchEvent(new ProjectEvent(ProjectEvents.GROUP_UPDATED, "Group updated", Animate.LoaderEvents.COMPLETE, grp));
                        }
                        this.dispatchEvent(new ProjectEvent(ProjectEvents.GROUPS_UPDATED, "Groups updated", null));
                    }
                    else if (loader.url == "/project/save-groups") {
                        for (var i = 0, l = data.length; i < l; i++)
                            this.dispatchEvent(new ProjectEvent(ProjectEvents.GROUP_SAVED, "Group saved", Animate.LoaderEvents.COMPLETE, data[i]));
                        this.dispatchEvent(new ProjectEvent(ProjectEvents.GROUPS_SAVED, "Groups saved", Animate.LoaderEvents.COMPLETE, null));
                    }
                    else if (loader.url == "/project/create-asset" || loader.url == "/project/copy-asset") {
                        var asset = new Animate.Asset(data.name, data.className, data.json, data._id, data.shallowId);
                        this._assets.push(asset);
                        //Create the GUI elements
                        Animate.TreeViewScene.getSingleton().addAssetInstance(asset, false);
                        //Notify the creation of an asset
                        pManager.assetCreated(asset.name, asset);
                        //Now that the asset is loaded we notify the plugins of each of its variables incase they need to initialize / set something.						
                        var eSet = asset.properties;
                        var variables = eSet.variables;
                        for (var ii = 0, len = variables.length; ii < len; ii++)
                            pManager.assetEdited(asset, variables[ii].name, variables[ii].value, variables[ii].value, variables[ii].type);
                        //pManager.assetLoaded( asset );
                        pManager.dispatchEvent(new Animate.AssetEvent(Animate.EditorEvents.ASSET_LOADED, asset));
                        this.dispatchEvent(new ProjectEvent(ProjectEvents.ASSET_CREATED, "Asset created", Animate.LoaderEvents.COMPLETE, asset));
                    }
                    else if (loader.url == "/project/save-assets") {
                        for (var ii = 0; ii < data.length; ii++)
                            for (var i = 0; i < this._assets.length; i++)
                                if (this._assets[i].id == data[ii])
                                    this.dispatchEvent(new Animate.AssetEvent(ProjectEvents.ASSET_SAVED, this._assets[i]));
                        this.dispatchEvent(new ProjectEvent(ProjectEvents.ASSET_SAVED, "Asset saved", Animate.LoaderEvents.COMPLETE, null));
                    }
                    else if (loader.url == "/project/update-assets") {
                        for (var ii = 0; ii < data.length; ii++)
                            for (var i = 0; i < this._assets.length; i++)
                                if (this._assets[i].id == data[ii]._id) {
                                    this._assets[i].update(data[ii].name, data[ii].className, data[ii].json);
                                    this.dispatchEvent(new Animate.AssetEvent(ProjectEvents.ASSET_UPDATED, this._assets[i]));
                                }
                        this.dispatchEvent(new ProjectEvent(ProjectEvents.ASSET_SAVED, "Asset saved", Animate.LoaderEvents.COMPLETE, null));
                    }
                    else if (loader.url == "/project/update-behaviours") {
                        //Update behaviours which we fetched from the DB.
                        for (var ii = 0, l = data.length; ii < l; ii++) {
                            for (var i = 0, len = this._behaviours.length; i < len; i++)
                                if (this._behaviours[i].id == data[ii]._id) {
                                    this._behaviours[i].update(data[ii].name, Animate.CanvasToken.fromDatabase(data[ii].json, data[ii]._id));
                                    //Update the GUI elements
                                    Animate.TreeViewScene.getSingleton().updateBehaviour(this._behaviours[i]);
                                    this.dispatchEvent(new ProjectEvent(ProjectEvents.BEHAVIOUR_UPDATED, "Behaviour updated", Animate.LoaderEvents.COMPLETE, this._behaviours[i]));
                                    break;
                                }
                        }
                        this.dispatchEvent(new ProjectEvent(ProjectEvents.BEHAVIOURS_UPDATED, "Behaviours updated", Animate.LoaderEvents.COMPLETE, null));
                    }
                    else if (loader.url == "/project/get-assets") {
                        //Cleanup _assets
                        for (var i = 0; i < this._assets.length; i++)
                            this._assets[i].dispose();
                        this._assets.splice(0, this._assets.length);
                        //Create new _assets which we fetched from the DB.
                        for (var i = 0, l = data.length; i < l; i++) {
                            var dbEntry = data[i];
                            var asset = new Animate.Asset(dbEntry["name"], dbEntry["className"], dbEntry["json"], dbEntry["_id"], dbEntry["shallowId"]);
                            //Create the GUI elements
                            if (Animate.TreeViewScene.getSingleton().addAssetInstance(asset))
                                this._assets.push(asset);
                            else
                                asset.dispose();
                        }
                        //Notify the creation of an asset
                        var len = this._assets.length;
                        for (var i = 0; i < len; i++)
                            pManager.assetCreated(this._assets[i].name, this._assets[i]);
                        //Now that the asset is loaded we notify the plugins of each of its variables incase they need to initialize / set something.
                        for (var i = 0; i < len; i++) {
                            var eSet = this._assets[i].properties;
                            var variables = eSet.variables;
                            for (var ii = 0, len2 = variables.length; ii < len2; ii++)
                                pManager.assetEdited(this._assets[i], variables[ii].name, variables[ii].value, variables[ii].value, variables[ii].type);
                        }
                        var eventCreated = new Animate.AssetEvent(Animate.EditorEvents.ASSET_CREATED, null);
                        for (var i = 0; i < len; i++) {
                            //pManager.assetLoaded( this._assets[i] );
                            eventCreated.asset = this._assets[i];
                            pManager.dispatchEvent(eventCreated);
                        }
                        this.dispatchEvent(new ProjectEvent(ProjectEvents.ASSETS_LOADED, "Assets loaded", Animate.LoaderEvents.COMPLETE, this));
                    }
                    else if (loader.url == "/project/rename-object") {
                        var obj = null;
                        var dataType = ProjectAssetTypes.fromString(data.type);
                        if (dataType.toString() == ProjectAssetTypes.BEHAVIOUR.toString()) {
                            var len = this._behaviours.length;
                            for (var i = 0; i < len; i++)
                                if (data.id == this._behaviours[i].id) {
                                    obj = this._behaviours[i];
                                    break;
                                }
                        }
                        else if (dataType.toString() == ProjectAssetTypes.ASSET.toString()) {
                            var len = this._assets.length;
                            for (var i = 0; i < len; i++)
                                if (data.id == this._assets[i].id) {
                                    obj = this._assets[i];
                                    break;
                                }
                        }
                        else
                            obj = Animate.TreeViewScene.getSingleton().getGroupByID(data.id);
                        //Send event
                        this.dispatchEvent(new ProjectEvent(ProjectEvents.OBJECT_RENAMED, "Object Renamed", Animate.LoaderEvents.COMPLETE, { object: obj, type: data.type, name: data.name, id: data.id }));
                    }
                }
                else {
                    Animate.MessageBox.show(event.message, Array("Ok"), null, null);
                    this.dispatchEvent(new ProjectEvent(ProjectEvents.FAILED, event.message, data));
                }
            }
            else
                this.dispatchEvent(new ProjectEvent(ProjectEvents.FAILED, "Could not connec to the server.", Animate.LoaderEvents.FAILED, null));
        };
        Object.defineProperty(Project.prototype, "behaviours", {
            get: function () { return this._behaviours; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Project.prototype, "files", {
            get: function () { return this._files; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Project.prototype, "assets", {
            get: function () { return this._assets; },
            enumerable: true,
            configurable: true
        });
        /**
        * This will cleanup the project and remove all data associated with it.
        */
        Project.prototype.reset = function () {
            this.entry = null;
            var pManager = Animate.PluginManager.getSingleton();
            var event;
            //Cleanup behaviours
            var i = this._behaviours.length;
            while (i--) {
                this.dispatchEvent(new ProjectEvent(ProjectEvents.BEHAVIOUR_DELETING, "Behaviour deleting", Animate.LoaderEvents.COMPLETE, this._behaviours[i]));
                this._behaviours[i].dispose();
            }
            i = this._assets.length;
            event = new Animate.AssetEvent(Animate.EditorEvents.ASSET_DESTROYED, null);
            while (i--) {
                event.asset = this._assets[i];
                //Notify the destruction of an asset
                pManager.dispatchEvent(event);
                this._assets[i].dispose();
            }
            i = this._files.length;
            while (i--)
                this._files[i].dispose();
            //this._plugins = null;
            //this.created = null;
            //this.lastModified = null;
            //this._id = null;
            this.mSaved = true;
            //this.mName = null;
            //this.mDescription = null;
            this._behaviours = [];
            this._assets = [];
            //this.buildId = null;
            this._files = [];
        };
        Object.defineProperty(Project.prototype, "plugins", {
            get: function () { return this.entry.$plugins; },
            enumerable: true,
            configurable: true
        });
        return Project;
    })(Animate.EventDispatcher);
    Animate.Project = Project;
})(Animate || (Animate = {}));
var Animate;
(function (Animate) {
    var TypeConverter = (function () {
        function TypeConverter(typeA, typeB, conversionOptions, plugin) {
            this.typeA = typeA;
            this.typeB = typeB;
            this.conversionOptions = conversionOptions;
            this.plugin = plugin;
        }
        /** Checks if this converter supports a conversion. */
        TypeConverter.prototype.canConvert = function (typeA, typeB) {
            if (this.typeA == typeA && this.typeB == typeB)
                return true;
            else
                return false;
        };
        /** Cleans up the object. */
        TypeConverter.prototype.dispose = function () {
            this.typeA = null;
            this.typeB = null;
            this.conversionOptions = null;
            this.plugin = null;
        };
        return TypeConverter;
    })();
    Animate.TypeConverter = TypeConverter;
})(Animate || (Animate = {}));
var Animate;
(function (Animate) {
    var UserEvents = (function (_super) {
        __extends(UserEvents, _super);
        function UserEvents(v) {
            _super.call(this, v);
        }
        //static LOGGED_IN: UserEvents = new UserEvents( "user_logged_in" );
        UserEvents.FAILED = new UserEvents("user_failed");
        //static REGISTERED: UserEvents = new UserEvents( "user_registered" );
        //static LOGGED_OUT: UserEvents = new UserEvents( "user_logged_out" );
        //static PASSWORD_RESET: UserEvents = new UserEvents( "user_password_reset" );
        //static ACTIVATION_RESET: UserEvents = new UserEvents( "user_activation_reset" );
        UserEvents.PROJECT_CREATED = new UserEvents("user_project_created");
        UserEvents.PROJECT_OPENED = new UserEvents("user_project_opened");
        //static PROJECTS_RECIEVED: UserEvents = new UserEvents( "user_projects_recieved" );
        //static PROJECT_DELETED: UserEvents = new UserEvents( "user_project_deleted" );
        //static PROJECT_COPIED: UserEvents = new UserEvents( "user_project_copied" );
        //static PROJECT_RENAMED: UserEvents = new UserEvents( "user_project_rename" );
        UserEvents.DETAILS_SAVED = new UserEvents("user_details_saved");
        return UserEvents;
    })(Animate.ENUM);
    Animate.UserEvents = UserEvents;
    var UserEvent = (function (_super) {
        __extends(UserEvent, _super);
        function UserEvent(eventName, message, return_type, data) {
            _super.call(this, eventName, message, return_type, data);
        }
        return UserEvent;
    })(Animate.AnimateLoaderEvent);
    Animate.UserEvent = UserEvent;
    /**
    * This class is used to represent the user who is logged into Animate.
    */
    var User = (function (_super) {
        __extends(User, _super);
        function User() {
            _super.call(this);
            User._singleton = this;
            // Call super-class constructor
            Animate.EventDispatcher.call(this);
            // Create the default entry
            this.userEntry = { username: "" };
            this.resetMeta();
            this.project = new Animate.Project();
            this._isLoggedIn = false;
        }
        /**
        * Resets the meta data
        */
        User.prototype.resetMeta = function () {
            this.meta = {
                bio: "",
                plan: Animate.UserPlan.Free,
                imgURL: "media/blank-user.png",
                maxNumProjects: 0
            };
        };
        /**
        * Checks if a user is logged in or not. This checks the server using
        * cookie and session data from the browser.
        * @returns {JQueryPromise<boolean>}
        */
        User.prototype.authenticated = function () {
            var d = jQuery.Deferred();
            var that = this;
            var response;
            that._isLoggedIn = false;
            jQuery.getJSON(Animate.DB.USERS + "/users/authenticated").then(function (data) {
                response = data;
                if (data.error)
                    return d.reject(new Error(data.message));
                if (data.authenticated) {
                    that.userEntry = data.user;
                    that._isLoggedIn = true;
                    return jQuery.getJSON(Animate.DB.API + "/user-details/" + data.user.username);
                }
                else {
                    that._isLoggedIn = false;
                    that.resetMeta();
                    return d.resolve(false);
                }
                return d.resolve(data.authenticated);
            }).then(function (data) {
                if (data.error)
                    return d.reject(new Error(data.message));
                that.meta = data.data;
                return d.resolve(true);
            }).fail(function (err) {
                d.reject(new Error("An error occurred while connecting to the server. " + err.status + ": " + err.responseText));
            });
            return d.promise();
        };
        /**
        * Tries to log the user in asynchronously.
        * @param {string} user The username of the user.
        * @param {string} password The password of the user.
        * @param {boolean} rememberMe Set this to true if we want to set a login cookie and keep us signed in.
        * @returns {JQueryPromise<UsersInterface.IAuthenticationResponse>}
        */
        User.prototype.login = function (user, password, rememberMe) {
            var d = jQuery.Deferred(), that = this, token = {
                username: user,
                password: password,
                rememberMe: rememberMe
            }, response;
            jQuery.post(Animate.DB.USERS + "/users/login", token).then(function (data) {
                response = data;
                if (data.error)
                    return d.reject(new Error(data.message));
                if (data.authenticated) {
                    that._isLoggedIn = true;
                    that.userEntry = data.user;
                    return jQuery.getJSON(Animate.DB.API + "/user-details/" + data.user.username);
                }
                else {
                    that._isLoggedIn = false;
                    that.resetMeta();
                    return d.resolve(response);
                }
            }).then(function (data) {
                if (data.error)
                    return d.reject(new Error(data.message));
                that.meta = data.data;
                return d.resolve(response);
            }).fail(function (err) {
                that._isLoggedIn = false;
                d.reject(new Error("An error occurred while connecting to the server. " + err.status + ": " + err.responseText));
            });
            return d.promise();
        };
        /**
        * Tries to register a new user.
        * @param {string} user The username of the user.
        * @param {string} password The password of the user.
        * @param {string} email The email of the user.
        * @param {string} captcha The captcha of the login screen
        * @param {string} captha_challenge The captha_challenge of the login screen
        * @returns {JQueryPromise<UsersInterface.IAuthenticationResponse>}
        */
        User.prototype.register = function (user, password, email, captcha, captha_challenge) {
            var d = jQuery.Deferred(), that = this, token = {
                username: user,
                password: password,
                email: email,
                captcha: captcha,
                challenge: captha_challenge
            };
            jQuery.post(Animate.DB.USERS + "/users/register", token).done(function (data) {
                if (data.error)
                    return d.reject(new Error(data.message));
                if (data.authenticated) {
                    that._isLoggedIn = false;
                    that.userEntry = data.user;
                }
                else
                    that._isLoggedIn = false;
                return d.resolve(data);
            }).fail(function (err) {
                d.reject(new Error("An error occurred while connecting to the server. " + err.status + ": " + err.responseText));
            });
            return d.promise();
        };
        /**
        * This function is used to resend a user's activation code
        * @param {string} user
        * @returns {JQueryPromise<UsersInterface.IResponse>}
        */
        User.prototype.resendActivation = function (user) {
            var d = jQuery.Deferred(), that = this;
            jQuery.getJSON(Animate.DB.USERS + "/users/resend-activation/" + user).done(function (data) {
                if (data.error)
                    return d.reject(new Error(data.message));
                return d.resolve(data);
            }).fail(function (err) {
                d.reject(new Error("An error occurred while connecting to the server. " + err.status + ": " + err.responseText));
            });
            return d.promise();
        };
        /**
        * This function is used to reset a user's password.
        * @param {string} user
        * @returns {JQueryPromise<UsersInterface.IResponse>}
        */
        User.prototype.resetPassword = function (user) {
            var d = jQuery.Deferred(), that = this;
            jQuery.getJSON(Animate.DB.USERS + "/users/request-password-reset/" + user).done(function (data) {
                if (data.error)
                    return d.reject(new Error(data.message));
                return d.resolve(data);
            }).fail(function (err) {
                d.reject(new Error("An error occurred while connecting to the server. " + err.status + ": " + err.responseText));
            });
            return d.promise();
        };
        /**
        * Attempts to log the user out
        * @return {JQueryPromise<UsersInterface.IResponse>}
        */
        User.prototype.logout = function () {
            var d = jQuery.Deferred(), that = this;
            jQuery.getJSON(Animate.DB.USERS + "/users/logout").done(function (data) {
                if (data.error)
                    return d.reject(new Error(data.message));
                that.userEntry = { username: "" };
                that.meta = {
                    bio: "",
                    plan: Animate.UserPlan.Free,
                    imgURL: "media/blank-user.png",
                    maxNumProjects: 0
                };
                that._isLoggedIn = false;
                return d.resolve(data);
            }).fail(function (err) {
                d.reject(new Error("An error occurred while connecting to the server. " + err.status + ": " + err.responseText));
            });
            return d.promise();
        };
        /**
        * Fetches all the projects of a user. This only works if the user if logged in. If not
        * it will return null.
        * @param {number} index The index to  fetching projects for
        * @param {number} limit The limit of how many items to fetch
        * @return {JQueryPromise<ModepressAddons.IGetProjects>}
        */
        User.prototype.getProjectList = function (index, limit) {
            var d = jQuery.Deferred(), that = this;
            jQuery.getJSON(Animate.DB.API + "/projects/" + this.userEntry.username + "?verbose=true&index=" + index + "&limit=" + limit).done(function (data) {
                if (data.error)
                    return d.reject(new Error(data.message));
                // Assign the actual plugins
                for (var i = 0, l = data.data.length; i < l; i++) {
                    var project = data.data[i];
                    var plugins = [];
                    for (var ii = 0, il = project.plugins.length; ii < il; ii++)
                        plugins.push(getPluginByID(project.plugins[ii]));
                    project.$plugins = plugins;
                }
                return d.resolve(data);
            }).fail(function (err) {
                d.reject(new Error("An error occurred while connecting to the server. " + err.status + ": " + err.responseText));
            });
            return d.promise();
        };
        /**
        * Creates a new user projects
        * @param {string} name The name of the project
        * @param {Array<string>} plugins An array of plugin IDs to identify which plugins to use
        * @param {string} description [Optional] A short description
        * @return {JQueryPromise<ModepressAddons.ICreateProject>}
        */
        User.prototype.newProject = function (name, plugins, description) {
            if (description === void 0) { description = ""; }
            var d = jQuery.Deferred(), that = this, token = {
                name: name,
                description: description,
                plugins: plugins
            };
            jQuery.post(Animate.DB.API + "/projects/create", token).done(function (data) {
                if (data.error)
                    return d.reject(new Error(data.message));
                // Assign the actual plugins
                var project = data.data;
                var plugins = [];
                for (var ii = 0, il = project.plugins.length; ii < il; ii++)
                    plugins.push(getPluginByID(project.plugins[ii]));
                project.$plugins = plugins;
                return d.resolve(data);
            }).fail(function (err) {
                d.reject(new Error("An error occurred while connecting to the server. " + err.status + ": " + err.responseText));
            });
            return d.promise();
        };
        /**
        * Removes a project by its id
        * @param {string} pid The id of the project to remove
        * @return {JQueryPromise<Modepress.IResponse>}
        */
        User.prototype.removeProject = function (pid) {
            var d = jQuery.Deferred(), that = this;
            jQuery.ajax({ url: Animate.DB.API + "/projects/" + that.userEntry.username + "/" + pid, type: 'DELETE', dataType: "json" }).done(function (data) {
                if (data.error)
                    return d.reject(new Error(data.message));
                return d.resolve(data);
            }).fail(function (err) {
                d.reject(new Error("An error occurred while connecting to the server. " + err.status + ": " + err.responseText));
            });
            return d.promise();
        };
        /**
        * Attempts to update the user's details base on the token provided
        * @returns {Engine.IProject} The project token
        * @returns {JQueryPromise<UsersInterface.IResponse>}
        */
        User.prototype.updateDetails = function (token) {
            var d = jQuery.Deferred();
            var meta = this.meta;
            // Attempts to update the model
            jQuery.ajax(Animate.DB.API + "/user-details/" + this.userEntry.username, {
                type: "put",
                contentType: 'application/json;charset=UTF-8',
                dataType: "json",
                data: JSON.stringify(token)
            }).done(function (data) {
                if (data.error)
                    return d.reject(new Error(data.message));
                else {
                    for (var i in token)
                        if (meta.hasOwnProperty(i))
                            meta[i] = token[i];
                }
                return d.resolve(data);
            }).fail(function (err) {
                d.reject(new Error("An error occurred while connecting to the server. " + err.status + ": " + err.responseText));
            });
            return d.promise();
        };
        ///**
        //* Use this function to rename a project
        //* @param {number} id The project ID we are copying
        //* @param {string} name The new name of the project
        //* @param {string} description The new description of the project
        //* @param {Array<string>} tags The new tags of the project
        //* @param {string} category The new category of the project
        //* @param {string} subCat The new subCat of the project
        //* @param {string} visibility The new visibility of the project. Either public or private
        //*/
        //renameProject( id: string, name: string, description: string, tags: Array<string>, category: string, subCat: string, visibility: string )
        //{
        //	var loader = new AnimateLoader();
        //	loader.addEventListener( LoaderEvents.COMPLETE, this.onServer, this );
        //	loader.addEventListener( LoaderEvents.FAILED, this.onServer, this );
        //	loader.load( "/project/rename", {
        //		projectId: id,
        //		name: name,
        //		description: description,
        //		tags: tags,
        //		cat: category,
        //		subCat: subCat,
        //		visibility: visibility
        //	} );
        //}
        ///**
        //* @type public mfunc updateDetails
        //* Use this function to update user details
        //* @param {string} bio The bio of the user
        //* @extends {User} 
        //*/
        //updateDetails( bio )
        //{
        //	var loader = new AnimateLoader();
        //	loader.addEventListener( LoaderEvents.COMPLETE, this.onServer, this );
        //	loader.addEventListener( LoaderEvents.FAILED, this.onServer, this );
        //	loader.load( "/user/update-details", { bio: bio } );
        //}
        /**
        * @type public mfunc copyProject
        * Use this function to duplicate a project
        * @param {number} id The project ID we are copying
        * @extends {User}
        */
        User.prototype.copyProject = function (id) {
            var loader = new Animate.AnimateLoader();
            loader.on(Animate.LoaderEvents.COMPLETE, this.onServer, this);
            loader.on(Animate.LoaderEvents.FAILED, this.onServer, this);
            loader.load("/project/copy", { id: id });
        };
        ///**
        //* This function is used to create a new project.
        //*/
        //createProject( name : string, description : string )
        //{
        //	if ( this._isLoggedIn )
        //	{
        //		var loader = new AnimateLoader();
        //		loader.addEventListener( LoaderEvents.COMPLETE, this.onServer, this );
        //		loader.addEventListener( LoaderEvents.FAILED, this.onServer, this );
        //		loader.load( "/project/create", { name: name, description: description } );
        //	}
        //}
        /**
        * This function is used to open an existing project.
        */
        User.prototype.openProject = function (id) {
            if (this._isLoggedIn) {
                var loader = new Animate.AnimateLoader();
                loader.on(Animate.LoaderEvents.COMPLETE, this.onServer, this);
                loader.on(Animate.LoaderEvents.FAILED, this.onServer, this);
                loader.load("/project/open", { id: id });
            }
        };
        /**
        * This will delete a project from the database as well as remove it from the user.
        * @param {string} id The id of the project we are removing.
        */
        User.prototype.deleteProject = function (id) {
            if (this._isLoggedIn) {
                //if ( this.project != null )
                //{
                //	this.project.dispose();
                //	this.project = null;
                //}
                this.project.entry = null;
                var loader = new Animate.AnimateLoader();
                loader.on(Animate.LoaderEvents.COMPLETE, this.onServer, this);
                loader.on(Animate.LoaderEvents.FAILED, this.onServer, this);
                loader.load("/project/delete", { id: id });
            }
            else
                return null;
        };
        /**
        * This is the resonse from the server
        * @param {LoaderEvents} response The response from the server. The response will be either Loader.COMPLETE or Loader.FAILED
        * @param {Event} data The data sent from the server.
        */
        User.prototype.onServer = function (response, event, sender) {
            var data = event.tag;
            var loader = sender;
            if (response == Animate.LoaderEvents.COMPLETE) {
                if (event.return_type == Animate.AnimateLoaderResponses.ERROR) {
                    //MessageBox.show(event.message, Array<string>("Ok"), null, null );
                    this.dispatchEvent(new UserEvent(UserEvents.FAILED, event.message, event.return_type, event.data));
                    return;
                }
                if (loader.url == "/user/log-in") {
                    //this.userEntry.meta.bio = data.bio;
                    //this.userEntry.meta.plan = data.plan;
                    //this.userEntry.meta.maxNumProjects = data.maxProjects;
                    //this.userEntry.meta.createdOn = data.createdOn;
                    //this.userEntry.meta.imgURL = data.image;
                    //this.planLevel = 0;
                    //if ( data.plan == DB.PLAN_SILVER || data.plan == DB.PLAN_BRONZE )
                    //	this.planLevel = 1;
                    //else if ( data.plan == DB.PLAN_GOLD )
                    //	this.planLevel = 2;
                    //else
                    //	this.planLevel = 3;
                    this._isLoggedIn = true;
                }
                else if (loader.url == "/user/log-out") {
                    this.userEntry.username = "";
                    this._isLoggedIn = false;
                }
                else if (loader.url == "/user/update-details")
                    this.dispatchEvent(new UserEvent(UserEvents.DETAILS_SAVED, event.message, event.return_type, data));
                else if (loader.url == "/project/create") {
                    //this.project = new Project(data.project.entry._id, data.project.name, data.build );
                    this.dispatchEvent(new Animate.ProjectEvent(UserEvents.PROJECT_CREATED, event.message, data));
                }
                else if (loader.url == "/project/open") {
                    //this.project = new Project(data.project.entry._id, data.project.name, null );
                    this.project.loadFromData(data);
                    this.dispatchEvent(new Animate.ProjectEvent(UserEvents.PROJECT_OPENED, event.message, data));
                }
                else if (loader.url == "/project/rename") {
                }
                else if (loader.url.match(/authenticated/)) {
                    if (data.loggedIn) {
                        this.userEntry.username = data.username;
                        this.userEntry.meta.bio = data.bio;
                        this.userEntry.meta.plan = data.plan;
                        this.userEntry.meta.maxNumProjects = data.maxProjects;
                        this.userEntry.meta.imgURL = (data.image == "" || data.image == null ? "media/blank-user.png" : data.image);
                        this.userEntry.meta.createdOn = data.createdOn;
                        this._isLoggedIn = true;
                    }
                }
                else
                    this.dispatchEvent(new UserEvent(UserEvents.FAILED, event.message, event.return_type, data));
            }
            else
                this.dispatchEvent(new UserEvent(UserEvents.FAILED, event.message, event.return_type, data));
        };
        Object.defineProperty(User.prototype, "isLoggedIn", {
            //get project(): Project { return this._project; }
            //set project( val: Project ) { this._project = val; }
            get: function () { return this._isLoggedIn; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(User, "get", {
            /**
            * Gets the singleton instance.
            * @returns {User}
            */
            get: function () {
                if (!User._singleton)
                    new User();
                return User._singleton;
            },
            enumerable: true,
            configurable: true
        });
        User._singleton = null;
        return User;
    })(Animate.EventDispatcher);
    Animate.User = User;
})(Animate || (Animate = {}));
var Animate;
(function (Animate) {
    /**
    * Abstract class downloading content by pages
    */
    var PageLoader = (function () {
        function PageLoader(updateFunction) {
            this.updateFunc = updateFunction;
            this.index = 0;
            this.limit = 10;
            this.last = 1;
            this.searchTerm = "";
        }
        /**
        * Calls the update function
        */
        PageLoader.prototype.invalidate = function () {
            this.updateFunc(this.index, this.limit);
        };
        /**
        * Gets the current page number
        * @returns {number}
        */
        PageLoader.prototype.getPageNum = function () {
            return (this.index / this.limit) + 1;
        };
        /**
        * Gets the total number of pages
        * @returns {number}
        */
        PageLoader.prototype.getTotalPages = function () {
            return Math.ceil(this.last / this.limit);
        };
        /**
        * Sets the page search back to index = 0
        */
        PageLoader.prototype.goFirst = function () {
            this.index = 0;
            this.updateFunc(this.index, this.limit);
        };
        /**
        * Gets the last set of users
        */
        PageLoader.prototype.goLast = function () {
            this.index = this.last - this.limit;
            if (this.index < 0)
                this.index = 0;
            this.updateFunc(this.index, this.limit);
        };
        /**
        * Sets the page search back to index = 0
        */
        PageLoader.prototype.goNext = function () {
            this.index += this.limit;
            this.updateFunc(this.index, this.limit);
        };
        /**
        * Sets the page search back to index = 0
        */
        PageLoader.prototype.goPrev = function () {
            this.index -= this.limit;
            if (this.index < 0)
                this.index = 0;
            this.updateFunc(this.index, this.limit);
        };
        return PageLoader;
    })();
    Animate.PageLoader = PageLoader;
})(Animate || (Animate = {}));
var Animate;
(function (Animate) {
    /**
    * A simple Percentile layout. Changes a component's dimensions to be a
    * percentage of its parent width and height.
    */
    var Percentile = (function () {
        function Percentile(widthPercent, heightPercent) {
            if (widthPercent === void 0) { widthPercent = 1; }
            if (heightPercent === void 0) { heightPercent = 1; }
            this.widthPercent = widthPercent;
            this.heightPercent = heightPercent;
        }
        /**
        * Sets the component width and height to its parent.
        * @param {Component} component The {Component} we are setting dimensions for.
        */
        Percentile.prototype.update = function (component) {
            var e = component.element;
            var parent = e.parent();
            if (parent != null && parent.length != 0) {
                var parentOverflow = parent.css("overflow");
                parent.css("overflow", "hidden");
                var w = parent.width();
                var h = parent.height();
                e.css({
                    width: (this.widthPercent * w) + "px",
                    height: (this.heightPercent * h) + "px"
                });
                parent.css("overflow", parentOverflow);
            }
        };
        return Percentile;
    })();
    Animate.Percentile = Percentile;
})(Animate || (Animate = {}));
var Animate;
(function (Animate) {
    /**
    * A simple fill layout. Fills a component to its parent width and height. Optional
    * offsets can be used to tweak the fill.
    */
    var Fill = (function () {
        function Fill(offsetX, offsetY, offsetWidth, offsetHeight, resrtictHorizontal, resrtictVertical) {
            if (offsetX === void 0) { offsetX = 0; }
            if (offsetY === void 0) { offsetY = 0; }
            if (offsetWidth === void 0) { offsetWidth = 0; }
            if (offsetHeight === void 0) { offsetHeight = 0; }
            if (resrtictHorizontal === void 0) { resrtictHorizontal = false; }
            if (resrtictVertical === void 0) { resrtictVertical = false; }
            this.offsetX = offsetX;
            this.offsetY = offsetY;
            this.offsetWidth = offsetWidth;
            this.offsetHeight = offsetHeight;
            this.resrtictHorizontal = resrtictHorizontal;
            this.resrtictVertical = resrtictVertical;
        }
        /**
        * Sets the component width and height to its parent.
        * @param {Component} component The {Component} we are setting dimensions for.
        */
        Fill.prototype.update = function (component) {
            var e = component.element;
            var parent = e.parent();
            if (parent != null && parent.length != 0) {
                var parentOverflow = parent.css("overflow");
                parent.css("overflow", "hidden");
                var w = parent.width();
                var h = parent.height();
                e.css({
                    width: (this.resrtictHorizontal === false ? (w + this.offsetWidth).toString() : ""),
                    height: (this.resrtictVertical === false ? (h + this.offsetHeight).toString() : ""),
                    left: this.offsetX,
                    top: this.offsetY
                });
                parent.css("overflow", parentOverflow);
            }
        };
        return Fill;
    })();
    Animate.Fill = Fill;
})(Animate || (Animate = {}));
var Animate;
(function (Animate) {
    /**
    * A singleton class that manages displaying the tooltips of various components.
    */
    var TooltipManager = (function () {
        function TooltipManager() {
            /**
            * @description Called when we hover over an element.
            * @param {any} e The JQUery event object
            */
            this.onMove = function (e) {
                var comp = jQuery(e.target).data("component");
                if (!comp)
                    return;
                var label = this.label;
                var tt = comp.tooltip;
                var elm = label.element;
                if (tt && tt != "") {
                    label.text = tt;
                    var h = label.element.height();
                    var w = label.element.width();
                    elm.show();
                    var y = (e.clientY - h - 20 < 0 ? 0 : e.clientY - h - 20 - 20);
                    var x = (e.clientX + w + 20 < jQuery("body").width() ? e.clientX + 20 : jQuery("body").width() - w);
                    elm.css({ left: x + "px", top: y + "px" });
                }
                else
                    elm.hide();
            };
            if (TooltipManager._singleton != null)
                throw new Error("The TooltipManager class is a singleton. You need to call the TooltipManager.getSingleton() function.");
            TooltipManager._singleton = this;
            this.label = new Animate.Label("tooltip", Animate.Application.getInstance(), "<div class='label tooltip shadow-small'></div>");
            this.label.element.hide();
            jQuery("body").on("mousemove", this.onMove.bind(this));
        }
        /**
        * Gets the singleton instance
        */
        TooltipManager.create = function () {
            if (TooltipManager._singleton === undefined)
                TooltipManager._singleton = new TooltipManager();
            return TooltipManager._singleton;
        };
        return TooltipManager;
    })();
    Animate.TooltipManager = TooltipManager;
})(Animate || (Animate = {}));
var Animate;
(function (Animate) {
    var ComponentEvents = (function (_super) {
        __extends(ComponentEvents, _super);
        function ComponentEvents(v) {
            _super.call(this, v);
        }
        ComponentEvents.UPDATED = new ComponentEvents("component_updated");
        return ComponentEvents;
    })(Animate.ENUM);
    Animate.ComponentEvents = ComponentEvents;
    /**
    * The base class for all visual elements in the application. The {Component} class
    * contains a reference of a jQuery object that points to the {Component}'s DOM representation.
    */
    var Component = (function (_super) {
        __extends(Component, _super);
        function Component(html, parent) {
            if (parent === void 0) { parent = null; }
            _super.call(this);
            //This is used in the saving process. Leave alone.
            //private _savedID : string = null;
            this._tooltip = null;
            this._enabled = true;
            if (!html)
                this._element = jQuery("<div class='Component'><div>");
            else if (typeof html == "string")
                this._element = jQuery(html);
            else
                this._element = html;
            // Increment the ID's
            Component.idCounter++;
            // Create the jQuery wrapper
            this._children = [];
            this._layouts = [];
            this.savedID = null;
            this._tooltip = null;
            this._enabled = true;
            this.tag = null;
            this._parent = parent;
            // Associate the id and component
            if (!this._element.attr("id")) {
                this._id = "i" + Component.idCounter;
                this._element.attr("id", this._id);
            }
            this._element.data("component", this);
            if (parent)
                parent.addChild(this);
        }
        /**
        * Diposes and cleans up this component and all its child {Component}s
        */
        Component.prototype.dispose = function () {
            if (this.disposed)
                return;
            this._tooltip = null;
            var children = this._children;
            // Dispose method will remove child from parent and also the array
            while (children.length != 0)
                children[0].dispose();
            this._layouts = null;
            this.tag = null;
            this._children = null;
            this.savedID = null;
            if (this._parent != null)
                this._parent.removeChild(this);
            this.element
                .data("id", null)
                .data("component", null)
                .remove();
            this.element = null;
            // Call super
            Animate.EventDispatcher.prototype.dispose.call(this);
        };
        /**
        * This function is called to update this component and its children.
        * Typically used in sizing operations.
        * @param {boolean} updateChildren Set this to true if you want the update to proliferate to all the children components.
        */
        Component.prototype.update = function (updateChildren) {
            if (updateChildren === void 0) { updateChildren = true; }
            var layouts = this._layouts;
            var i = layouts.length;
            while (i--)
                layouts[i].update(this);
            if (updateChildren) {
                var children = this._children;
                i = children.length;
                while (i--)
                    children[i].update();
            }
            _super.prototype.dispatchEvent.call(this, new Animate.Event(ComponentEvents.UPDATED));
        };
        /**
        * Add layout algorithms to the {Component}.
        * @param {ILayout} layout The layout object we want to add
        * @returns {ILayout} The layout that was added
        */
        Component.prototype.addLayout = function (layout) {
            this._layouts.push(layout);
            return layout;
        };
        /**
        * Removes a layout from this {Component}
        * @param {ILayout} layout The layout to remove
        * @returns {ILayout} The layout that was removed
        */
        Component.prototype.removeLayout = function (layout) {
            if (jQuery.inArray(layout, this._layouts) == -1)
                return null;
            this._layouts.splice(jQuery.inArray(layout, this._layouts), 1);
            return layout;
        };
        Object.defineProperty(Component.prototype, "layouts", {
            /**
            * Gets the ILayouts for this component
            * {returns} Array<ILayout>
            */
            get: function () { return this._layouts; },
            enumerable: true,
            configurable: true
        });
        /**
        * Use this function to add a child to this component.
        * This has the same effect of adding some HTML as a child of another piece of HTML.
        * It uses the jQuery append function to achieve this functionality.
        * @param {string | IComponent | JQuery} child The child component we want to add
        * @returns {IComponent} The added component
        */
        Component.prototype.addChild = function (child) {
            // Remove from previous parent
            var parent;
            var toAdd = null;
            if (child instanceof Component) {
                toAdd = child;
                parent = child.parent;
            }
            else {
                if (typeof child === "string")
                    toAdd = new Component(child);
                else if (child.length != 0) {
                    var jq = child;
                    if (jq.parent() && jq.parent().data("component"))
                        parent = jq.parent().data("component");
                    toAdd = new Component(child);
                }
                else
                    throw new Error("You can only add HTML strings or Component classes");
            }
            // If already in this component then do nothing
            if (jQuery.inArray(child, this._children) != -1)
                return child;
            // If it had an existing parent - then remove it
            if (parent)
                parent.removeChild(toAdd);
            toAdd._parent = this;
            this._children.push(toAdd);
            this._element.append(toAdd._element);
            return toAdd;
        };
        /**
        * Use this function to remove a child from this component.
        * It uses the {JQuery} detach function to achieve this functionality.
        * @param {IComponent} child The {IComponent} to remove from this {IComponent}'s children
        * @returns {IComponent} The {IComponent} we have removed
        */
        Component.prototype.removeChild = function (child) {
            //Determine if the child is pure html or a component
            if (jQuery.inArray(child, this._children) == -1)
                return child;
            child._parent = null;
            child.element.detach();
            this._children.splice(jQuery.inArray(child, this._children), 1);
            return child;
        };
        /**
        * Removes all child nodes
        */
        Component.prototype.clear = function () {
            var children = this._children;
            var i = children.length;
            while (i--)
                children[i].dispose();
        };
        Component.prototype.onDelete = function () { };
        Object.defineProperty(Component.prototype, "children", {
            /**
            * Returns the array of Child {Component}s
            * @returns {Array{IComponent}} An array of child {IComponent} objects
            */
            get: function () { return this._children; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Component.prototype, "element", {
            /**
            * Gets the jQuery wrapper
            */
            get: function () { return this._element; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Component.prototype, "parent", {
            /**
            * Gets the jQuery parent
            */
            get: function () { return this._parent; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Component.prototype, "tooltip", {
            /**
            * Gets the tooltip for this {Component}
            */
            get: function () { return this._tooltip; },
            /**
            * Sets the tooltip for this {Component}
            */
            set: function (val) { this._tooltip = val; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Component.prototype, "enabled", {
            /**
            * Get or Set if the component is enabled and recieves mouse events
            */
            get: function () { return this._enabled; },
            /**
            * Get or Set if the component is enabled and recieves mouse events
            */
            set: function (val) {
                if (this._enabled == val)
                    return;
                if (!val)
                    this.element.addClass("disabled");
                else
                    this.element.removeClass("disabled");
                this._enabled = val;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Component.prototype, "id", {
            /**
            * Gets the ID of thi component
            */
            get: function () { return this._id; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Component.prototype, "selected", {
            /**
            * Get or Set if the component is selected. When set to true a css class of 'selected' is added to the {Component}
            */
            get: function () {
                if (this._element.hasClass("selected"))
                    return true;
                else
                    return false;
            },
            /**
            * Get or Set if the component is selected. When set to true a css class of 'selected' is added to the {Component}
            */
            set: function (val) {
                if (val)
                    this._element.addClass("selected");
                else
                    this._element.removeClass("selected");
            },
            enumerable: true,
            configurable: true
        });
        Component.idCounter = 0;
        return Component;
    })(Animate.EventDispatcher);
    Animate.Component = Component;
})(Animate || (Animate = {}));
var Animate;
(function (Animate) {
    var MenuListEvents = (function (_super) {
        __extends(MenuListEvents, _super);
        function MenuListEvents(v) {
            _super.call(this, v);
        }
        MenuListEvents.ITEM_CLICKED = new MenuListEvents("menu_list_item_clicked");
        return MenuListEvents;
    })(Animate.ENUM);
    Animate.MenuListEvents = MenuListEvents;
    /**
    * A specially designed type of list
    */
    var MenuList = (function (_super) {
        __extends(MenuList, _super);
        function MenuList(parent) {
            // Call super-class constructor
            _super.call(this, "<div class='menu-list'></div>", parent);
            this._items = [];
            this.element.on("click", jQuery.proxy(this.onClick, this));
            this.selectedItem = null;
        }
        /**
        * Adds an HTML item
        * @returns {JQuery} A jQuery object containing the HTML.
        */
        MenuList.prototype.addItem = function (img, val) {
            var toRet = jQuery("<div class='menu-list-item light-hover'>" + (img ? "<img src='" + img + "' />" : "") + "<span class='menu-list-text'>" + val + "</span></div>");
            this._items.push(toRet);
            this.element.append(toRet);
            return toRet;
        };
        /**
        * Removes an  item from this list
        * @param {JQuery} item The jQuery object we are removing
        */
        MenuList.prototype.removeItem = function (item) {
            if (item == this.selectedItem)
                this.dispatchEvent(MenuListEvents.ITEM_CLICKED, "");
            this._items.splice(jQuery.inArray(item, this.items), 1);
            item.remove();
        };
        /**
        * Clears all the items added to this list
        */
        MenuList.prototype.clearItems = function () {
            var len = this.items.length;
            for (var i = 0; i < len; i++) {
                this._items[i].off();
                this._items[i].detach();
            }
            this._items.splice(0, len);
        };
        /**
        * Checks if we selected an item - if so it closes the context and dispatches the ITEM_CLICKED event.
        * @param {any} e The jQuery event object
        */
        MenuList.prototype.onClick = function (e) {
            if (this.selectedItem)
                this.selectedItem.removeClass("selected");
            this.selectedItem = null;
            var targ = jQuery(e.target);
            if (targ.is(jQuery(".menu-list-item"))) {
                this.selectedItem = targ;
                this.selectedItem.addClass("selected");
                this.dispatchEvent(MenuListEvents.ITEM_CLICKED, targ.text());
                e.preventDefault();
                return;
            }
            else
                this.dispatchEvent(MenuListEvents.ITEM_CLICKED, "");
        };
        Object.defineProperty(MenuList.prototype, "items", {
            get: function () { return this._items; },
            enumerable: true,
            configurable: true
        });
        return MenuList;
    })(Animate.Component);
    Animate.MenuList = MenuList;
})(Animate || (Animate = {}));
/// <reference path="MenuList.ts" />
var Animate;
(function (Animate) {
    var LogType = (function (_super) {
        __extends(LogType, _super);
        function LogType(v) {
            _super.call(this, v);
        }
        LogType.MESSAGE = new LogType("message");
        LogType.WARNING = new LogType("warning");
        LogType.ERROR = new LogType("error");
        return LogType;
    })(Animate.ENUM);
    Animate.LogType = LogType;
    /**
    * The Logger is a singleton class used to write message's to Animate's log window.
    */
    var Logger = (function (_super) {
        __extends(Logger, _super);
        function Logger(parent) {
            if (Logger._singleton != null)
                throw new Error("The Logger class is a singleton. You need to call the Logger.getSingleton() function.");
            Logger._singleton = this;
            // Call super-class constructor
            _super.call(this, parent);
            this.element.addClass("logger");
            this.context = new Animate.ContextMenu(150);
            this.context.addItem(new Animate.ContextMenuItem("media/cross.png", "Clear"));
            this.mDocker = null;
            this.warningFlagger = jQuery("<img class='logger-warning fade-animation' src='media/warning-button.png' />");
            //Add listeners
            this.mContextProxy = this.onContext.bind(this);
            jQuery(document).on("contextmenu", this.mContextProxy);
            this.context.on(Animate.ContextMenuEvents.ITEM_CLICKED, this.onContextSelect, this);
            //this.element.disableSelection( true );
            this.warningFlagger.on("click", jQuery.proxy(this.onIconClick, this));
        }
        /**
        * @type public mfunc onIconClick
        * When we click the error warning
        * @extends <Logger>
        */
        Logger.prototype.onIconClick = function () {
            this.mDocker.setActiveComponent(this, true);
            this.warningFlagger.detach();
        };
        /**
        * @type public mfunc getPreviewImage
        * This is called by a controlling ScreenManager class. An image string needs to be returned
        * which will act as a preview of the component that is being viewed or hidden.
        * @extends <Logger>
        * @returns <string>
        */
        Logger.prototype.getPreviewImage = function () {
            return "media/logger.png";
        };
        /**
        * This is called by a controlling Docker class when the component needs to be shown.
        */
        Logger.prototype.onShow = function () {
            this.warningFlagger.detach();
            this.element.data("preview").removeClass("fade-animation");
        };
        /**
        * This is called by a controlling Docker class when the component needs to be hidden.
        */
        Logger.prototype.onHide = function () { };
        /**
        * Each IDock item needs to implement this so that we can keep track of where it moves.
        * @returns {Docker}
        */
        Logger.prototype.getDocker = function () { return this.mDocker; };
        /**
        * Each IDock item needs to implement this so that we can keep track of where it moves.
        * @param {Docker} val
        */
        Logger.prototype.setDocker = function (val) { this.mDocker = val; };
        /**
        * Called when the context menu is about to open
        */
        Logger.prototype.onContextSelect = function (response, event, sender) {
            if (event.item.text == "Clear") {
                //Unselect all other items
                this.clearItems();
            }
        };
        /**
        * Called when the context menu is about to open
        */
        Logger.prototype.onContext = function (e) {
            //Now hook the context events
            var targ = jQuery(e.target);
            if (targ.is(jQuery(".menu-list-item")) || targ.is(jQuery(".menu-list"))) {
                if (targ.is(jQuery(".menu-list-item")) && targ.parent().data("component") != this)
                    return;
                else if (targ.is(jQuery(".menu-list")) && targ.data("component") != this)
                    return;
                e.preventDefault();
                this.context.show(Animate.Application.getInstance(), e.pageX, e.pageY, false, true);
            }
        };
        /**
        * Adds an item to the Logger
        * @param {string} val The text to show on the logger.
        * @param {any} tag An optional tag to associate with the log.
        * @param {string} type The type of icon to associate with the log. By default its Logger.MESSAGE
        */
        Logger.prototype.logMessage = function (val, tag, type) {
            if (type === void 0) { type = LogType.MESSAGE; }
            var img = null;
            if (type == LogType.MESSAGE)
                img = "media/tick.png";
            else if (type == LogType.ERROR)
                img = "media/cross.png";
            else
                img = "media/warning-20.png";
            //Add a border glow to the messages dock items
            if (type != LogType.MESSAGE && this.element.data("preview") != this.mDocker.activePreview) {
                var offset = this.mDocker.element.offset();
                jQuery("body").append(this.warningFlagger);
                this.warningFlagger.css({ left: offset.left, top: offset.top - this.warningFlagger.height() });
                this.element.data("preview").addClass("fade-animation");
            }
            val = ("<span class='date'>" + new Date(Date.now()).toLocaleDateString() + "</span>") + val;
            var toAdd = this.addItem(img, val);
            toAdd.data("tag", tag);
            return toAdd;
        };
        /**
        * Clears all the log messages
        */
        Logger.prototype.clearItems = function () {
            this.warningFlagger.detach();
            this.element.data("preview").removeClass("fade-animation");
            var len = this.items.length;
            for (var i = 0; i < len; i++)
                this.items[i].data("tag", null);
            _super.prototype.clearItems.call(this);
        };
        /**
        * Gets the singleton instance.
        * @param {Component} parent
        * @returns {Logger}
        */
        Logger.getSingleton = function (parent) {
            if (!Logger._singleton)
                new Logger(parent);
            return Logger._singleton;
        };
        return Logger;
    })(Animate.MenuList);
    Animate.Logger = Logger;
})(Animate || (Animate = {}));
/// <reference path="Logger.ts" />
var Animate;
(function (Animate) {
    /**
    * A Docker is used in Animate so that we can divide up screen real estate. A box is added to a parent component
    * which, when hovered or dragged, will enabled the user to move components around or explore hidden sections
    * of the application.
    */
    var Docker = (function (_super) {
        __extends(Docker, _super);
        function Docker(parent) {
            // Call super-class constructor
            _super.call(this, "<div class='screen-manager light-gradient shadow-small curve-small'></div>", parent);
            this.activeComponent = null;
            this._activePreview = null;
            this.rollout = jQuery("<div class='roll-out animate-all light-gradient shadow-small curve-small'></div>");
            this.mComponents = [];
            this.mPreviews = [];
            this.element.on("mouseenter", jQuery.proxy(this.onEnter, this));
            this.element.on("mouseleave", jQuery.proxy(this.onOut, this));
            this.startProxy = this.onStart.bind(this);
            this.stopProxy = this.onStop.bind(this);
            this.clickPreview = this.onClick.bind(this);
            this.dropProxy = this.onObjectDropped.bind(this);
            this.element.droppable({ drop: this.dropProxy, hoverClass: "hover-over" });
        }
        /** When we click on a preview.*/
        Docker.prototype.onClick = function (e) {
            var comp = jQuery(e.target).data("component");
            if (comp) {
                this.removeComponent(comp);
                this.addComponent(comp, true);
            }
        };
        /** When we start draggin.*/
        Docker.prototype.onStart = function (e) {
            var managers = jQuery(".screen-manager");
            managers.removeClass("light-gradient");
            managers.addClass("drag-targets");
            managers.css({ opacity: 1 });
        };
        /** When we stop draggin.*/
        Docker.prototype.onStop = function (e) {
            var managers = jQuery(".screen-manager");
            managers.addClass("light-gradient");
            managers.removeClass("drag-targets");
            managers.css({ opacity: "" });
        };
        /** Called when the mouse is over this element.*/
        Docker.prototype.onEnter = function (e) {
            if (this.mComponents.length > 1)
                this.element.append(this.rollout);
            this.rollout.css({ left: -(this.rollout.width() + 5) + "px" });
            this.rollout.stop();
            this.rollout.show();
            this.rollout.css("opacity", 1);
        };
        /** Called when the mouse leaves this element.*/
        Docker.prototype.onOut = function (e) {
            this.rollout.stop();
            this.rollout.fadeOut();
        };
        /**Called when a draggable object is dropped onto the canvas.*/
        Docker.prototype.onObjectDropped = function (event, ui) {
            var comp = jQuery(ui.draggable).data("component");
            var manager = jQuery(ui.draggable).data("Docker");
            if (comp && manager) {
                var parent = this.parent;
                manager.removeComponent(comp);
                this.addComponent(comp, true);
                Animate.Application.getInstance().update();
            }
        };
        /** Call this function to update the manager.*/
        Docker.prototype.update = function () {
            //Call super
            Animate.Component.prototype.update.call(this, false);
            var parent = this.parent.element;
            if (parent.length != 0) {
                var w = parent.width();
                var h = parent.height();
                this.element.css({ left: (w - this.element.width() - 15) + "px", top: 6 + "px" });
            }
        };
        /** Gets the singleton instance. */
        Docker.prototype.setActiveComponent = function (comp, attach) {
            if (attach === void 0) { attach = false; }
            if (this.activeComponent) {
                var parent = this.activeComponent.parent;
                if (parent)
                    parent.removeChild(this.activeComponent);
            }
            if (this._activePreview) {
                this._activePreview.detach();
                this.rollout.append(this._activePreview);
            }
            this.activeComponent = comp;
            this._activePreview = comp.element.data("preview");
            if (attach) {
                this.parent.addChild(comp);
                comp.onShow();
            }
            this.element.append(this._activePreview);
        };
        /** Removes an IDockItem from the manager */
        Docker.prototype.removeComponent = function (comp, completeRemoval) {
            if (completeRemoval === void 0) { completeRemoval = false; }
            comp.setDocker(null);
            var preview = comp.element.data("preview");
            this.mComponents.splice(jQuery.inArray(comp, this.mComponents), 1);
            this.mPreviews.splice(jQuery.inArray(preview, this.mPreviews), 1);
            if (completeRemoval)
                preview.remove();
            else
                preview.detach();
            comp.onHide();
            if (this._activePreview == comp.element.data("preview"))
                this._activePreview = null;
            if (comp == this.activeComponent && this.mComponents.length > 0)
                this.setActiveComponent(this.mComponents[0]);
            else if (comp == this.activeComponent)
                this.activeComponent = null;
        };
        /** Adds a IDockItem to the manager */
        Docker.prototype.addComponent = function (comp, attach) {
            if (jQuery.inArray(comp, this.mComponents) != -1)
                return;
            this.mComponents.push(comp);
            comp.setDocker(this);
            //Create the preview jquery object
            var toAdd = null;
            if (!comp.element.data("preview")) {
                toAdd = jQuery("<div class='screen-manager-preview'><img src='" + comp.getPreviewImage() + "'></div>");
                toAdd.draggable({ start: this.startProxy, stop: this.stopProxy, opacity: 0.7, cursor: "move", helper: "clone", revert: "invalid", appendTo: "body", containment: "body", zIndex: 9999 });
            }
            else
                toAdd = comp.element.data("preview");
            comp.element.data("preview", toAdd);
            toAdd.data("component", comp);
            toAdd.data("Docker", this);
            //Attach the click event
            toAdd.off("click");
            toAdd.on("click", this.clickPreview);
            this.mPreviews.push(toAdd);
            this.setActiveComponent(comp, attach);
        };
        Object.defineProperty(Docker.prototype, "activePreview", {
            get: function () { return this._activePreview; },
            enumerable: true,
            configurable: true
        });
        return Docker;
    })(Animate.Component);
    Animate.Docker = Docker;
})(Animate || (Animate = {}));
var Animate;
(function (Animate) {
    var SplitOrientation = (function (_super) {
        __extends(SplitOrientation, _super);
        function SplitOrientation(v) {
            _super.call(this, v);
        }
        SplitOrientation.VERTICAL = new SplitOrientation("vertical");
        SplitOrientation.HORIZONTAL = new SplitOrientation("horizontal");
        return SplitOrientation;
    })(Animate.ENUM);
    Animate.SplitOrientation = SplitOrientation;
    /**
    * A Component that holds 2 sub Components and a splitter to split between them.
    */
    var SplitPanel = (function (_super) {
        __extends(SplitPanel, _super);
        /**
        * @param {Component} parent The parent to which this component is attached
        * @param {SplitOrientation} orientation The orientation of the slitter. It can be either SplitOrientation.VERTICAL or SplitOrientation.HORIZONTAL
        * @param {number} ratio The ratio of how far up or down, top or bottom the splitter will be. This is between 0 and 1.
        * @param {number} dividerSize The size of the split divider.
        */
        function SplitPanel(parent, orientation, ratio, dividerSize) {
            if (orientation === void 0) { orientation = SplitOrientation.VERTICAL; }
            if (ratio === void 0) { ratio = 0.5; }
            if (dividerSize === void 0) { dividerSize = 6; }
            _super.call(this, "<div class='split-panel' style='width:100px; height:100px;'></div>", parent);
            this.offsetLeft = 0;
            this.offsetTop = 0;
            //Private vars	
            this.mPercent = ratio;
            this.mDividerSize = dividerSize;
            this.mPanel1 = this.addChild("<div class='panel1'></div>");
            this.mDivider = this.addChild("<div class='split-panel-divider background-dark' style='width:" + this.mDividerSize + "px;'></div>");
            this.mDividerDragging = new Animate.Component("<div class='split-panel-divider-dragging' style='width:" + this.mDividerSize + "px;'></div>");
            this.mPanel2 = this.addChild("<div class='panel2'></div>");
            this.addChild("<div class='fix'></div>");
            this.orientation = orientation;
            this.mPanelOverlay1 = jQuery("<div class='panel-input'></div>");
            this.mPanelOverlay2 = jQuery("<div class='panel-input'></div>");
            //Proxies
            this.mMouseDownProxy = this.onDividerMouseDown.bind(this);
            this.mMouseUpProxy = this.onStageMouseUp.bind(this);
            this.mMouseMoveProxy = this.onStageMouseMove.bind(this);
            //Hook the resize event
            this.mDivider.element.on('mousedown', this.mMouseDownProxy);
        }
        /**
        * This function is called when the mouse is down on the divider
        * @param {any} e The jQuery event object
        */
        SplitPanel.prototype.onDividerMouseDown = function (e) {
            //reset orientation
            this.orientation = this.orientation;
            //Add the dragger and move it to the same place.
            this.addChild(this.mDividerDragging);
            this.mDividerDragging.element.css({
                width: this.mDivider.element.css("width"),
                height: this.mDivider.element.css("height"),
                left: this.mDivider.element.css("left"),
                top: this.mDivider.element.css("top")
            });
            this.mPanel1.element.prepend(this.mPanelOverlay1);
            this.mPanel2.element.prepend(this.mPanelOverlay2);
            jQuery("body").on('mouseup', this.mMouseUpProxy);
            jQuery("body").on('mousemove', this.mMouseMoveProxy);
            e.preventDefault();
        };
        /**
        * This function is called when the mouse is up from the body of stage.
        * @param {any} e The jQuery event object
        */
        SplitPanel.prototype.onStageMouseUp = function (e) {
            this.mPanelOverlay1.remove();
            this.mPanelOverlay2.remove();
            jQuery("body").off('mouseup', this.mMouseUpProxy);
            jQuery("body").off('mousemove', this.mMouseMoveProxy);
            //Remove the dragger.
            this.removeChild(this.mDividerDragging);
            //jQuery("body").disableSelection( false );
            //Get the new ratio
            var left = parseFloat(this.mDividerDragging.element.css("left").split("px")[0]);
            var top = parseFloat(this.mDividerDragging.element.css("top").split("px")[0]);
            var w = this.element.width();
            var h = this.element.height();
            var ratio = 0;
            if (this.mOrientation == SplitOrientation.VERTICAL)
                ratio = left / w;
            else
                ratio = top / h;
            this.ratio = ratio;
            var prevOverdlow1 = this.mPanel1.element.css("overflow");
            var prevOverdlow2 = this.mPanel2.element.css("overflow");
            this.mPanel1.element.css("overflow", "hidden");
            this.mPanel2.element.css("overflow", "hidden");
            var children = this.mPanel1.children;
            for (var i = 0; i < children.length; i++)
                children[i].update();
            var children = this.mPanel2.children;
            for (var i = 0; i < children.length; i++)
                children[i].update();
            this.mPanel1.element.css("overflow", prevOverdlow1);
            this.mPanel2.element.css("overflow", prevOverdlow2);
            //jQuery(window).trigger( 'resize' );
            //jQuery(window).trigger( 'resize' );
        };
        /**
        * Call this function to update the panel.
        */
        SplitPanel.prototype.update = function () {
            //Call super
            _super.prototype.update.call(this, false);
            var prevOverdlow1 = this.mPanel1.element.css("overflow");
            var prevOverdlow2 = this.mPanel2.element.css("overflow");
            this.mPanel1.element.css("overflow", "hidden");
            this.mPanel2.element.css("overflow", "hidden");
            //Reset orientation
            this.orientation = this.orientation;
            var children = this.mPanel1.children;
            if (children.length > 0)
                for (var i = 0; i < children.length; i++)
                    children[i].update();
            children = this.mPanel2.children;
            if (children.length > 0) {
                for (var i = 0; i < children.length; i++)
                    children[i].update();
            }
            this.mPanel1.element.css("overflow", prevOverdlow1);
            this.mPanel2.element.css("overflow", prevOverdlow2);
        };
        /**
        * This function is called when the mouse is up from the body of stage.
        * @param {any} e The jQuery event object
        */
        SplitPanel.prototype.onStageMouseMove = function (e) {
            var position = this.mDividerDragging.parent.element.offset();
            //Remove the dragger.
            if (this.mOrientation == SplitOrientation.VERTICAL) {
                var w = this.element.width();
                var dist = e.clientX - position.left;
                if (dist < this.mDividerSize)
                    dist = this.mDividerSize;
                if (dist > w - this.mDividerSize)
                    dist = w - this.mDividerSize;
                this.mDividerDragging.element.css({
                    left: dist + "px"
                });
            }
            else {
                var h = this.element.height();
                var dist = e.clientY - position.top;
                if (dist < this.mDividerSize)
                    dist = this.mDividerSize;
                if (dist > h - this.mDividerSize)
                    dist = h - this.mDividerSize;
                this.mDividerDragging.element.css({
                    top: dist + "px"
                });
            }
            e.preventDefault();
            return false;
        };
        Object.defineProperty(SplitPanel.prototype, "ratio", {
            /**
            * Call this function to get the ratio of the panel. Values are from 0 to 1.
            */
            get: function () {
                return this.mPercent;
            },
            /**
            * Call this function to set the ratio of the panel. Values are from 0 to 1.
            * @param {number} val The ratio from 0 to 1 of where the divider should be
            */
            set: function (val) {
                if (val > 1)
                    val = 1;
                else if (val < 0)
                    val = 0;
                this.mPercent = val;
                //Resets the orientation
                this.orientation = this.orientation;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SplitPanel.prototype, "orientation", {
            /**
            * gets the orientation of this split panel
            */
            get: function () {
                return this.mOrientation;
            },
            /**
            * Use this function to change the split panel from horizontal to vertcal orientation.
            * @param val The orientation of the split. This can be either SplitPanel.VERTICAL or SplitPanel.HORIZONTAL
            */
            set: function (val) {
                if (val == SplitOrientation.VERTICAL || val == SplitOrientation.HORIZONTAL) {
                    this.mOrientation = val;
                    var w = this.element.width();
                    var h = this.element.height();
                    if (val == SplitOrientation.VERTICAL) {
                        this.mPanel1.element.css({
                            width: this.mPercent * w - this.mDividerSize * 0.5,
                            top: "0px",
                            left: "0px",
                            height: h + "px"
                        });
                        this.mDivider.element.css({
                            width: this.mDividerSize + "px",
                            left: this.mPanel1.element.width() + "px",
                            top: "0px",
                            height: h + "px"
                        });
                        this.mPanel2.element.css({
                            width: (1 - this.mPercent) * w - (this.mDividerSize * 0.5),
                            left: ((this.mPercent * w) + (this.mDividerSize / 2)) + "px",
                            top: "0px",
                            height: h + "px"
                        });
                    }
                    else {
                        this.mPanel1.element.css({
                            height: this.mPercent * h - this.mDividerSize * 0.5,
                            left: "0px",
                            top: "0px",
                            width: w + "px"
                        });
                        this.mDivider.element.css({
                            height: this.mDividerSize + "px",
                            top: this.mPanel1.element.height() + "px",
                            left: "0px",
                            width: w + "px"
                        });
                        this.mPanel2.element.css({
                            height: (1 - this.mPercent) * h - (this.mDividerSize * 0.5),
                            top: ((this.mPercent * h) + (this.mDividerSize / 2)) + "px",
                            left: "px",
                            width: w + "px"
                        });
                    }
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SplitPanel.prototype, "top", {
            /**
            * Gets the top panel.
            */
            get: function () { return this.mPanel1; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SplitPanel.prototype, "bottom", {
            /**
            * Gets the bottom panel.
            */
            get: function () { return this.mPanel2; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SplitPanel.prototype, "left", {
            /**
            * Gets the left panel.
            */
            get: function () { return this.mPanel1; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(SplitPanel.prototype, "right", {
            /**
            * Gets the right panel.
            */
            get: function () { return this.mPanel2; },
            enumerable: true,
            configurable: true
        });
        /**
        * This will cleanup the component.
        */
        SplitPanel.prototype.dispose = function () {
            this.mOrientation = null;
            this.mDivider.element.off('mousedown', this.mMouseDownProxy);
            jQuery("body").off('mouseup', this.mMouseUpProxy);
            jQuery("body").off('mousemove', this.mMouseMoveProxy);
            this.mMouseDownProxy = null;
            //Call super
            _super.prototype.dispose.call(this);
        };
        return SplitPanel;
    })(Animate.Component);
    Animate.SplitPanel = SplitPanel;
})(Animate || (Animate = {}));
var Animate;
(function (Animate) {
    var WindowEvents = (function (_super) {
        __extends(WindowEvents, _super);
        function WindowEvents(v) {
            _super.call(this, v);
        }
        WindowEvents.HIDDEN = new WindowEvents("window_hidden");
        WindowEvents.SHOWN = new WindowEvents("window_shown");
        return WindowEvents;
    })(Animate.ENUM);
    Animate.WindowEvents = WindowEvents;
    var WindowEvent = (function (_super) {
        __extends(WindowEvent, _super);
        function WindowEvent(eventName, window) {
            _super.call(this, eventName, window);
            this.window = window;
        }
        return WindowEvent;
    })(Animate.Event);
    Animate.WindowEvent = WindowEvent;
    /**
    * This class is the base class for all windows in Animate
    */
    var Window = (function (_super) {
        __extends(Window, _super);
        /**
        * @param {number} width The width of the window in pixels
        * @param {number} height The height of the window in pixels
        * @param {boolean} autoCenter Should this window center itself on a resize event
        * @param {boolean} controlBox Does this window have a draggable title bar and close button
        * @param {string} title The text for window heading.Only applicable if we are using a control box.
        */
        function Window(width, height, autoCenter, controlBox, title) {
            if (autoCenter === void 0) { autoCenter = true; }
            if (controlBox === void 0) { controlBox = false; }
            if (title === void 0) { title = ""; }
            // Call super-class constructor
            _super.call(this, "<div class='window shadow-med background' style='width:" + width + "px; height:" + height + "px;'></div>", null);
            this._autoCenter = autoCenter;
            this._controlBox = controlBox;
            //If we have a control box we add the title and close button
            if (this._controlBox) {
                this._header = this.addChild("<div class='window-control-box background-haze'></div>");
                this._headerText = this._header.addChild("<div class='window-header'>" + title + "</div>");
                this._headerCloseBut = this._header.addChild("<div class='close-but'>X</div>");
                this.addChild("<div class='fix'></div>");
                this._content = this.addChild("<div class='window-content'></div>");
            }
            else
                this._content = this.addChild("<div class='window-content no-control'></div>");
            this._modalBackdrop = jQuery("<div class='modal-backdrop dark-modal'></div>");
            //Proxies	
            this._externalClickProxy = this.onStageClick.bind(this);
            this._isVisible = false;
            //Hook the resize event
            if (this._autoCenter) {
                this._resizeProxy = this.onWindowResized.bind(this);
                jQuery(window).on('resize', this._resizeProxy);
            }
            if (this._controlBox) {
                this._closeProxy = this.onCloseClicked.bind(this);
                this._headerCloseBut.element.on('click', this._closeProxy);
            }
            this._modalBackdrop.on('click', this.onModalClicked.bind(this));
        }
        /**
        * When we click on the close button
        * @param {any} e The jQuery event object
        */
        Window.prototype.onCloseClicked = function (e) {
            this.hide();
        };
        /**
        * When the stage move event is called
        * @param {any} e The jQuery event object
        */
        Window.prototype.onStageMove = function (e) {
            this.element.css({ left: (e.pageX - e.offsetX) + "px", top: (e.pageY - e.offsetY) + "px" });
        };
        /**
        * Removes the window and modal from the DOM.
        */
        Window.prototype.hide = function () {
            if (this._isVisible == false)
                return;
            this._isVisible = false;
            jQuery("body").off("click", this._externalClickProxy);
            this._modalBackdrop.detach();
            if (this.element.parent().length != 0)
                this.element.parent().data("component").removeChild(this);
            if (this._controlBox)
                this.element.draggable("destroy");
            this.dispatchEvent(new WindowEvent(WindowEvents.HIDDEN, this));
        };
        /**
        * Centers the window into the middle of the screen. This only works if the elements are added to the DOM first
        */
        Window.prototype.center = function () {
            this.element.css({
                left: (jQuery("body").width() / 2 - this.element.width() / 2),
                top: (jQuery("body").height() / 2 - this.element.height() / 2)
            });
        };
        /**
        * Shows the window by adding it to a parent.
        * @param {Component} parent The parent Component we are adding this window to
        * @param {number} x The x coordinate of the window
        * @param {number} y The y coordinate of the window
        * @param {boolean} isModal Does this window block all other user operations?
        * @param {boolean} isPopup If the window is popup it will close whenever anything outside the window is clicked
        */
        Window.prototype.show = function (parent, x, y, isModal, isPopup) {
            if (parent === void 0) { parent = null; }
            if (x === void 0) { x = NaN; }
            if (y === void 0) { y = NaN; }
            if (isModal === void 0) { isModal = false; }
            if (isPopup === void 0) { isPopup = false; }
            this._isVisible = true;
            parent = (parent === undefined || parent == null ? Animate.Application.getInstance() : parent);
            if (isModal) {
                parent.element.append(this._modalBackdrop);
                var bod = jQuery("body");
                this._modalBackdrop.css({ width: bod.width() + "px", height: bod.height() + "px" });
            }
            parent.addChild(this);
            if (isNaN(x) || x === undefined) {
                this.element.css({
                    left: (jQuery("body").width() / 2 - this.element.width() / 2),
                    top: (jQuery("body").height() / 2 - this.element.height() / 2)
                });
            }
            else
                this.element.css({ left: x + "px", top: y + "px" });
            if (isPopup) {
                jQuery("body").off("click", this._externalClickProxy);
                jQuery("body").on("click", this._externalClickProxy);
            }
            this.dispatchEvent(new WindowEvent(WindowEvents.SHOWN, this));
            if (this._controlBox)
                this.element.draggable({ handle: ".window-control-box", containment: "parent" });
        };
        /**
        * When we click the modal window we flash the window
        * @param {object} e The jQuery event object
        */
        Window.prototype.onModalClicked = function (e) {
            var prevParent = this.element.parent();
            this.element.detach();
            this.element.addClass("anim-shadow-focus");
            prevParent.append(this.element);
        };
        /**
        * Updates the dimensions if autoCenter is true.
        * @param {object} val
        */
        Window.prototype.onWindowResized = function (val) {
            // Do not update everything if the event is from JQ UI
            if (val && $(val.target).hasClass('ui-resizable'))
                return;
            var bod = jQuery("body");
            if (this._isVisible) {
                this._modalBackdrop.css({ width: bod.width() + "px", height: bod.height() + "px" });
                this.element.css({
                    left: (jQuery("body").width() / 2 - this.element.width() / 2),
                    top: (jQuery("body").height() / 2 - this.element.height() / 2)
                });
            }
        };
        /**
        * Hides the window if its show property is set to true
        * @param {any} e The jQuery event object
        */
        Window.prototype.onStageClick = function (e) {
            var parent = jQuery(e.target).parent();
            //Make sure the click off of the window
            while (typeof (parent) !== "undefined" && parent.length != 0) {
                var comp = parent.data("component");
                if (comp == this || jQuery(e.target).is(this._modalBackdrop))
                    return;
                parent = parent.parent();
            }
            this.hide();
        };
        Object.defineProperty(Window.prototype, "content", {
            /** Gets the content component */
            get: function () { return this._content; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Window.prototype, "visible", {
            get: function () { return this._isVisible; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Window.prototype, "headerText", {
            get: function () { return this._headerText.element.text(); },
            set: function (value) { this._headerText.element.text(value); },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Window.prototype, "modalBackdrop", {
            get: function () { return this._modalBackdrop; },
            enumerable: true,
            configurable: true
        });
        /**
        * This will cleanup the component.
        */
        Window.prototype.dispose = function () {
            if (this._closeProxy) {
                this._headerCloseBut.element.off('click', this._closeProxy);
                this._closeProxy = null;
            }
            this._externalClickProxy = null;
            jQuery(window).off('resize', this._resizeProxy);
            this._modalBackdrop.off();
            this._modalBackdrop.detach();
            this._resizeProxy = null;
            this._modalBackdrop = null;
            this._headerText = null;
            this._headerCloseBut = null;
            this._header = null;
            //Call super
            _super.prototype.dispose.call(this);
        };
        return Window;
    })(Animate.Component);
    Animate.Window = Window;
})(Animate || (Animate = {}));
var Animate;
(function (Animate) {
    var ContextMenuItem = (function (_super) {
        __extends(ContextMenuItem, _super);
        /**
        * Creates an instance of the item
        * @param {string} text The text of the item
        * @param {string} imgURL An optional image URL
        */
        function ContextMenuItem(text, imgURL, parent) {
            _super.call(this, "<div class='context-item'>" + (imgURL && imgURL != "" ? "<img src='" + imgURL + "'/>" : "") + "<div class='text'></div></div>", parent);
            this.text = text;
            this.imageURL = imgURL;
        }
        Object.defineProperty(ContextMenuItem.prototype, "text", {
            /** Gets the text of the item */
            get: function () { return this._text; },
            /** Sets the text of the item */
            set: function (val) {
                this._text = val;
                jQuery(".text", this.element).text(val);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ContextMenuItem.prototype, "imageURL", {
            /** Gets the image src of the item */
            get: function () { return this._imgURL; },
            /** Sets the image src of the item */
            set: function (val) {
                this._imgURL = val;
                jQuery("img", this.element).attr("src", val);
            },
            enumerable: true,
            configurable: true
        });
        return ContextMenuItem;
    })(Animate.Component);
    Animate.ContextMenuItem = ContextMenuItem;
    var ContextMenuEvents = (function (_super) {
        __extends(ContextMenuEvents, _super);
        function ContextMenuEvents(v) {
            _super.call(this, v);
        }
        ContextMenuEvents.ITEM_CLICKED = new ContextMenuEvents("context_munu_item_clicked");
        return ContextMenuEvents;
    })(Animate.ENUM);
    Animate.ContextMenuEvents = ContextMenuEvents;
    var ContextMenuEvent = (function (_super) {
        __extends(ContextMenuEvent, _super);
        function ContextMenuEvent(item, eventName) {
            _super.call(this, eventName, item);
            this.item = item;
        }
        return ContextMenuEvent;
    })(Animate.Event);
    Animate.ContextMenuEvent = ContextMenuEvent;
    /**
    * A ContextMenu is a popup window which displays a list of items that can be selected.
    */
    var ContextMenu = (function (_super) {
        __extends(ContextMenu, _super);
        /**
        * @param {number} The width of the menu.
        */
        function ContextMenu(width) {
            // Call super-class constructor
            _super.call(this, width, 100);
            this.element.addClass("context-menu");
            this.element.addClass("reg-gradient");
            this.element.addClass("curve-small");
            this.element.css("height", "");
            this.items = [];
            this.selectedItem = null;
            this.content.element.css({ width: "" });
        }
        /**
        * Cleans up the context menu
        */
        ContextMenu.prototype.dispose = function () {
            this.items = null;
            this.selectedItem = null;
            Animate.Window.prototype.dispose.call(this);
        };
        /**
        * Shows the window by adding it to a parent.
        * @param {Component} parent The parent Component we are adding this window to
        * @param {number} x The x coordinate of the window
        * @param {number} y The y coordinate of the window
        * @param {boolean} isModal Does this window block all other user operations?
        * @param {boolean} isPopup If the window is popup it will close whenever anything outside the window is clicked
        */
        ContextMenu.prototype.show = function (parent, x, y, isModal, isPopup) {
            if (parent === void 0) { parent = null; }
            if (x === void 0) { x = NaN; }
            if (y === void 0) { y = NaN; }
            if (isModal === void 0) { isModal = false; }
            if (isPopup === void 0) { isPopup = false; }
            var height = jQuery(window).height();
            var width = jQuery(window).width();
            if (ContextMenu.currentContext)
                ContextMenu.currentContext.hide();
            ContextMenu.currentContext = this;
            Animate.Window.prototype.show.call(this, parent, x, y, isModal, isPopup);
            if (x + this.element.width() > width)
                this.element.css("left", width - this.element.width());
            if (y + this.element.height() > width)
                this.element.css("top", height - this.element.height());
            this.element.css("width", "");
            //Check if nothing is visible - if so then hide it.
            var somethingVisible = false;
            var i = this.items.length;
            while (i--) {
                if (this.items[i].element.is(":visible")) {
                    somethingVisible = true;
                    break;
                }
            }
            if (!somethingVisible)
                this.hide();
        };
        /**
        * Adds an item to the ContextMenu
        * @param {ContextMenuItem} val The item we are adding
        * @returns {ContextMenuItem}
        */
        ContextMenu.prototype.addItem = function (val) {
            this.items.push(val);
            this.content.addChild(val);
            return val;
        };
        /**
        * Removes an item from the ContextMenu
        * @param {ContextMenuItem} val The item we are removing
        * @returns {ContextMenuItem}
        */
        ContextMenu.prototype.removeItem = function (val) {
            var len = this.items.length;
            for (var i = 0; i < len; i++) {
                var v = this.items[i];
                if (v == val) {
                    v = this.items[i];
                    this.items.splice(i, 1);
                    this.content.removeChild(val);
                    return v;
                }
            }
            return null;
        };
        /**
        * Checks if we selected an item - if so it closes the context and dispatches the ITEM_CLICKED event.
        */
        ContextMenu.prototype.onStageClick = function (e) {
            var targ = jQuery(e.target);
            if (targ.is(jQuery(".context-item"))) {
                var item = targ.data("component");
                this.onItemClicked(item, targ);
                this.dispatchEvent(new ContextMenuEvent(item, ContextMenuEvents.ITEM_CLICKED));
                this.hide();
                e.preventDefault();
                return;
            }
            _super.prototype.onStageClick.call(this, e);
        };
        /**
        * @description Called when we click an item
        * @param {ContextMenuItem} item The selected item
        * @param {JQuery} jqueryItem The jquery item
        */
        ContextMenu.prototype.onItemClicked = function (item, jqueryItem) {
        };
        Object.defineProperty(ContextMenu.prototype, "numItems", {
            /**
            * Gets the number of items
            * @returns {number}
            */
            get: function () { return this.items.length; },
            enumerable: true,
            configurable: true
        });
        /**
        * Gets an item from the menu
        * @param {string} val The text of the item we need to get
        * @returns {ContextMenuItem}
        */
        ContextMenu.prototype.getItem = function (val) {
            var len = this.items.length;
            for (var i = 0; i < len; i++) {
                var v = this.items[i].text;
                if (v == val)
                    return this.items[i];
            }
            return null;
        };
        /**
        * Removes all items
        */
        ContextMenu.prototype.clear = function () {
            while (this.content.children.length > 0)
                this.content.children[0].dispose();
            this.items.splice(0, this.items.length);
        };
        return ContextMenu;
    })(Animate.Window);
    Animate.ContextMenu = ContextMenu;
})(Animate || (Animate = {}));
var Animate;
(function (Animate) {
    var PortalType = (function (_super) {
        __extends(PortalType, _super);
        function PortalType(v) {
            _super.call(this, v);
        }
        /**
        * Returns an enum reference by its name/value
        * @param {string} val
        * @returns {PortalType}
        */
        PortalType.fromString = function (val) {
            switch (val) {
                case "parameter":
                    return PortalType.PARAMETER;
                case "product":
                    return PortalType.PRODUCT;
                case "input":
                    return PortalType.INPUT;
                case "output":
                    return PortalType.OUTPUT;
            }
            return null;
        };
        PortalType.PARAMETER = new PortalType("parameter");
        PortalType.PRODUCT = new PortalType("product");
        PortalType.INPUT = new PortalType("input");
        PortalType.OUTPUT = new PortalType("output");
        return PortalType;
    })(Animate.ENUM);
    Animate.PortalType = PortalType;
    var ParameterType = (function (_super) {
        __extends(ParameterType, _super);
        function ParameterType(v) {
            _super.call(this, v);
        }
        /**
        * Returns an enum reference by its name/value
        * @param {string} val
        * @returns {ParameterType}
        */
        ParameterType.fromString = function (val) {
            switch (val) {
                case "asset":
                    return ParameterType.ASSET;
                case "asset_list":
                    return ParameterType.ASSET_LIST;
                case "number":
                    return ParameterType.NUMBER;
                case "group":
                    return ParameterType.GROUP;
                case "file":
                    return ParameterType.FILE;
                case "string":
                    return ParameterType.STRING;
                case "object":
                    return ParameterType.OBJECT;
                case "bool":
                    return ParameterType.BOOL;
                case "int":
                    return ParameterType.INT;
                case "color":
                    return ParameterType.COLOR;
                case "enum":
                    return ParameterType.ENUM;
                case "hidden":
                    return ParameterType.HIDDEN;
                case "hidden_file":
                    return ParameterType.HIDDEN_FILE;
                case "options":
                    return ParameterType.OPTIONS;
            }
            return null;
        };
        ParameterType.ASSET = new ParameterType("asset");
        ParameterType.ASSET_LIST = new ParameterType("asset_list");
        ParameterType.NUMBER = new ParameterType("number");
        ParameterType.GROUP = new ParameterType("group");
        ParameterType.FILE = new ParameterType("file");
        ParameterType.STRING = new ParameterType("string");
        ParameterType.OBJECT = new ParameterType("object");
        ParameterType.BOOL = new ParameterType("bool");
        ParameterType.INT = new ParameterType("int");
        ParameterType.COLOR = new ParameterType("color");
        ParameterType.ENUM = new ParameterType("enum");
        ParameterType.HIDDEN = new ParameterType("hidden");
        ParameterType.HIDDEN_FILE = new ParameterType("hidden_file");
        ParameterType.OPTIONS = new ParameterType("options");
        return ParameterType;
    })(Animate.ENUM);
    Animate.ParameterType = ParameterType;
    /**
    * A portal class for behaviours. There are 4 different types of portals -
    * INPUT, OUTPUT, PARAMETER and PRODUCT. Each portal acts as a gate for a behaviour.
    */
    var Portal = (function (_super) {
        __extends(Portal, _super);
        /**
        * @param {Behaviour} parent The parent component of the Portal
        * @param {string} name The name of the portal
        * @param {PortalType} type The portal type. This can be either Portal.INPUT, Portal.OUTPUT, Portal.PARAMETER or Portal.PRODUCT
        * @param {any} value The default value of the portal
        * @param {ParameterType} dataType The type of value this portal represents - eg: asset, string, number, file...etc
        */
        function Portal(parent, name, type, value, dataType) {
            if (type === void 0) { type = PortalType.PARAMETER; }
            if (value === void 0) { value = null; }
            if (dataType === void 0) { dataType = ParameterType.OBJECT; }
            // Call super-class constructor
            _super.call(this, "<div class='portal " + type + "'></div>", parent);
            this.edit(name, type, value, dataType);
            this.element.data("dragEnabled", false);
            this._links = [];
            this.behaviour = parent;
            this._customPortal = true;
            if (type == PortalType.PRODUCT || type == PortalType.OUTPUT)
                this.element.on("mousedown", jQuery.proxy(this.onPortalDown, this));
        }
        /**
        * Edits the portal variables
        * @param {string} name The name of the portal
        * @param {PortalType} type The portal type. This can be either Portal.INPUT, Portal.OUTPUT, Portal.PARAMETER or Portal.PRODUCT
        * @param {any} value The default value of the portal
        * @param {ParameterType} dataType The type of value this portal represents - eg: asset, string, number, file...etc
        * @extends <Portal>
        */
        Portal.prototype.edit = function (name, type, value, dataType) {
            this._name = name;
            this.value = value;
            this._type = type;
            this._dataType = dataType;
            var valText = "";
            if (type == PortalType.INPUT || type == PortalType.OUTPUT)
                this._dataType = dataType = ParameterType.BOOL;
            else
                valText = Animate.ImportExport.getExportValue(dataType, value);
            var typeName = "Parameter";
            if (type == PortalType.INPUT)
                typeName = "Input";
            else if (type == PortalType.OUTPUT)
                typeName = "Output";
            else if (type == PortalType.PRODUCT)
                typeName = "Product";
            //Set the tooltip to be the same as the name
            this.tooltip = name + " : " + typeName + " - <b>" + valText + "</b>";
        };
        /**
        * This function will check if the source portal is an acceptable match with the current portal.
        * @param source The source panel we are checking against
        */
        Portal.prototype.checkPortalLink = function (source) {
            if (source.type == PortalType.OUTPUT && this.type == PortalType.INPUT)
                return true;
            else if (source.type == PortalType.PRODUCT && this.type == PortalType.PARAMETER) {
                if (this._dataType == null || this._dataType == ParameterType.OBJECT)
                    return true;
                else if (this._dataType == this._dataType)
                    return true;
                else if (Animate.PluginManager.getSingleton().getConverters(source._dataType, this._dataType) == null)
                    return false;
                else
                    return true;
            }
            else
                return false;
        };
        /**
        * This function will check if the source portal is an acceptable match with the current portal.
        */
        Portal.prototype.dispose = function () {
            var len = this._links.length;
            while (len > 0) {
                this._links[0].dispose();
                len = this._links.length;
            }
            this.element.data("dragEnabled", null);
            this._links = null;
            this.value = null;
            this.behaviour = null;
            this._type = null;
            this._dataType = null;
            this._name = null;
            //Call super
            _super.prototype.dispose.call(this);
        };
        /**
        * When the mouse is down on the portal.
        * @param {object} e The jQuery event object
        */
        Portal.prototype.onPortalDown = function (e) {
            var newLink = new Animate.Link(this.parent.parent.element.data("component"));
            newLink.start(this, e);
        };
        /**
        * Adds a link to the portal.
        * @param {Link} link The link we are adding
        */
        Portal.prototype.addLink = function (link) {
            if (jQuery.inArray(link, this._links) == -1)
                this._links.push(link);
            if (this.type == PortalType.PARAMETER || this.type == PortalType.PRODUCT)
                this.element.css("background-color", "#E2B31F");
            else
                this.element.css("background-color", "#A41CC9");
        };
        /**
        * Removes a link from the portal.
        * @param {Link} link The link we are removing
        */
        Portal.prototype.removeLink = function (link) {
            if (this._links.indexOf(link) == -1)
                return link;
            this._links.splice(this._links.indexOf(link), 1);
            if (this._links.length == 0)
                this.element.css("background-color", "");
            return link;
        };
        /**
        * Makes sure the links are positioned correctly
        */
        Portal.prototype.updateAllLinks = function () {
            var links = this._links;
            var i = links.length;
            //get the extremes
            while (i--)
                links[i].updatePoints();
        };
        /**
        * Returns this portal's position on the canvas.
        */
        Portal.prototype.positionOnCanvas = function () {
            //Get the total parent scrolling
            var p = this.parent.element;
            var p_ = p;
            //var offset = p.offset();
            var startX = 0;
            var startY = 0;
            var sL = 0;
            var sT = 0;
            while (p.length != 0) {
                sL = p.scrollLeft();
                sT = p.scrollTop();
                startX += sL;
                startY += sT;
                p = p.parent();
            }
            var position = this.element.position();
            var pPosition = p_.position();
            return {
                left: startX + position.left + pPosition.left,
                top: startY + position.top + pPosition.top
            };
        };
        Object.defineProperty(Portal.prototype, "type", {
            //get behaviour() { return this._behaviour; }
            get: function () { return this._type; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Portal.prototype, "name", {
            get: function () { return this._name; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Portal.prototype, "dataType", {
            get: function () { return this._dataType; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Portal.prototype, "customPortal", {
            get: function () { return this._customPortal; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Portal.prototype, "links", {
            get: function () { return this._links; },
            enumerable: true,
            configurable: true
        });
        return Portal;
    })(Animate.Component);
    Animate.Portal = Portal;
})(Animate || (Animate = {}));
var Animate;
(function (Animate) {
    var TabEvents = (function (_super) {
        __extends(TabEvents, _super);
        function TabEvents(v) {
            _super.call(this, v);
        }
        TabEvents.SELECTED = new TabEvents("tab_selected");
        TabEvents.REMOVED = new TabEvents("tab_removed");
        return TabEvents;
    })(Animate.ENUM);
    Animate.TabEvents = TabEvents;
    var TabEvent = (function (_super) {
        __extends(TabEvent, _super);
        function TabEvent(eventName, pair) {
            _super.call(this, eventName, pair);
            this.cancel = false;
            this._pair = pair;
        }
        Object.defineProperty(TabEvent.prototype, "pair", {
            get: function () { return this._pair; },
            enumerable: true,
            configurable: true
        });
        return TabEvent;
    })(Animate.Event);
    Animate.TabEvent = TabEvent;
    /**
    * The Tab component will create a series of selectable tabs which open specific tab pages.
    */
    var Tab = (function (_super) {
        __extends(Tab, _super);
        function Tab(parent) {
            // Call super-class constructor
            _super.call(this, "<div class='tab background-view'></div>", parent);
            this._tabsDiv = new Animate.Component("<div class='tabs-div'></div>", this);
            this.pagesDiv = new Animate.Component("<div class='pages-div'></div>", this);
            this.pagesDiv.addLayout(new Animate.Fill(0, 0, 0, -25));
            this._tabs = [];
            this.selectedTab = null;
            this.element.on("click", jQuery.proxy(this.onClick, this));
            this.dropButton = new Animate.Component("<div class='tabs-drop-button'>&#x21E3;</div>", this._tabsDiv);
            if (!Tab.contextMenu)
                Tab.contextMenu = new Animate.ContextMenu(100);
            //this.element.disableSelection( true );
            Tab.contextMenu.on(Animate.ContextMenuEvents.ITEM_CLICKED, this.onContext.bind(this));
            this.addLayout(new Animate.Fill());
        }
        /**
        * When we click the tab
        * @param {TabPair} tab The tab pair object containing both the label and page <Comonent>s
        */
        Tab.prototype.onTabSelected = function (tab) {
            var event = new TabEvent(TabEvents.SELECTED, tab);
            this.dispatchEvent(event);
            if (event.cancel === false)
                tab.onSelected();
        };
        /**
        * @description When the context menu is clicked.
        */
        Tab.prototype.onContext = function (response, event) {
            var len = this._tabs.length;
            for (var i = 0; i < len; i++)
                if (this._tabs[i].name == event.item.text) {
                    var p = this._tabs[i].tabSelector.element.parent();
                    this._tabs[i].tabSelector.element.detach();
                    p.prepend(this._tabs[i].tabSelector.element);
                    this.selectTab(this._tabs[i]);
                    return;
                }
        };
        /**
        * Get the tab to select a tab page
        * @param {TabPair} tab
        */
        Tab.prototype.selectTab = function (tab) {
            var len = this._tabs.length;
            for (var i = 0; i < len; i++) {
                if (tab == this._tabs[i] || this._tabs[i].name == tab.name) {
                    if (this.selectedTab != null) {
                        this.selectedTab.tabSelector.element.removeClass("tab-selected");
                        this.selectedTab.page.element.detach();
                    }
                    this.selectedTab = this._tabs[i];
                    this.selectedTab.tabSelector.element.addClass("tab-selected");
                    this.pagesDiv.element.append(this.selectedTab.page.element);
                    this.onTabSelected(this.selectedTab);
                    return this.selectedTab;
                }
            }
            return null;
        };
        /**
        * Called just before a tab is closed. If you return false it will cancel the operation.
        * @param {TabPair} tabPair
        * @returns {boolean}
        */
        Tab.prototype.onTabPairClosing = function (tabPair) { return true; };
        /**
        * When we click the tab
        * @param {any} e
        */
        Tab.prototype.onClick = function (e) {
            var targ = jQuery(e.target);
            if (targ.is(jQuery(".tab-close"))) {
                var text = targ.parent().text();
                text = text.substring(0, text.length - 1);
                var tabPair = this.getTab(text);
                if (this.onTabPairClosing(tabPair))
                    this.removeTab(tabPair, true);
                return;
            }
            else if (targ.is(jQuery(".tabs-drop-button"))) {
                Tab.contextMenu.clear();
                var len = this._tabs.length;
                for (var i = 0; i < len; i++)
                    Tab.contextMenu.addItem(new Animate.ContextMenuItem(this._tabs[i].name, null));
                e.preventDefault();
                Tab.contextMenu.show(Animate.Application.getInstance(), e.pageX, e.pageY, false, true);
                return false;
            }
            else if (targ.is(jQuery(".tab-selector"))) {
                var len = this._tabs.length;
                for (var i = 0; i < len; i++) {
                    var text = "";
                    if (targ.data("canClose")) {
                        text = targ.text();
                        text = text.substring(0, text.length - 1);
                    }
                    else
                        text = targ.text();
                    //text = text.substring(0, text.length - 1);
                    if (this._tabs[i].name == text) {
                        if (this.selectedTab != null) {
                            this.selectedTab.tabSelector.element.removeClass("tab-selected");
                            this.selectedTab.page.element.detach();
                        }
                        this.selectedTab = this._tabs[i];
                        this.selectedTab.tabSelector.element.addClass("tab-selected");
                        this.pagesDiv.element.append(this.selectedTab.page.element);
                        this.onTabSelected(this.selectedTab);
                        return;
                    }
                }
            }
        };
        /**
        * When we update the tab - we move the dop button to the right of its extremities.
        */
        Tab.prototype.update = function () {
            this.element.css("overflow", "hidden");
            Animate.Component.prototype.update.call(this);
            this.dropButton.element.css({
                left: (this.dropButton.element.parent().width() - this.dropButton.element.width()) + "px", top: "0px"
            });
            var tabs = this._tabs;
            var len = tabs.length;
            for (var i = 0; i < len; i++)
                tabs[i].onResize();
        };
        Tab.prototype.addTab = function (val, canClose) {
            canClose = (canClose === undefined ? true : canClose);
            if (this.selectedTab != null) {
                this.selectedTab.tabSelector.element.removeClass("tab-selected");
                this.selectedTab.page.element.detach();
            }
            var page = new Animate.Component("<div class='tab-page background'></div>", this.pagesDiv);
            var tab = new Animate.Component("<div class='tab-selector background-dark tab-selected'><div class='text'>" + (val instanceof Animate.TabPair ? val.name : val) + "</div></div>", this._tabsDiv);
            if (canClose) {
                new Animate.Component("<div class='tab-close'>X</div>", tab);
                tab.element.data("canClose", true);
            }
            var toAdd = null;
            if (val instanceof Animate.TabPair) {
                toAdd = val;
                toAdd.tabSelector = tab;
                toAdd.page = page;
            }
            else
                toAdd = new Animate.TabPair(tab, page, val);
            this.selectedTab = toAdd;
            this._tabs.push(toAdd);
            this.onTabSelected(this.selectedTab);
            tab.element.trigger("click");
            toAdd.onAdded();
            return toAdd;
        };
        /**
        * Gets a tab pair by name.
        * @param {string} val The label text of the tab
        * @returns {TabPair} The tab pair containing both the label and page {Component}s
        */
        Tab.prototype.getTab = function (val) {
            var i = this._tabs.length;
            while (i--)
                if (this._tabs[i].name == val)
                    return this._tabs[i];
            return null;
        };
        /**
        * This will cleanup the component.
        */
        Tab.prototype.dispose = function () {
            this._tabsDiv = null;
            this.pagesDiv = null;
            var len = this._tabs.length;
            for (var i = 0; i < len; i++)
                this._tabs[i].dispose();
            this.pagesDiv = null;
            this._tabs = null;
            this.selectedTab = null;
            //Call super
            _super.prototype.dispose.call(this);
        };
        /**
        * Removes all items from the tab. This will call dispose on all components.
        */
        Tab.prototype.clear = function () {
            while (this._tabs.length > 0)
                this.removeTab(this._tabs[0], true);
        };
        Tab.prototype.removeTab = function (val, dispose) {
            dispose = (dispose === undefined ? true : dispose);
            var len = this._tabs.length;
            for (var i = 0; i < len; i++) {
                if (this._tabs[i] == val || this._tabs[i].name == val) {
                    var event = new TabEvent(TabEvents.REMOVED, this._tabs[i]);
                    this._tabs[i].onRemove(event);
                    if (event.cancel)
                        return;
                    var v = this._tabs[i];
                    this._tabs.splice(i, 1);
                    this.onTabPairClosing(v);
                    this._tabsDiv.removeChild(v.tabSelector);
                    this.pagesDiv.removeChild(v.page);
                    if (dispose)
                        v.dispose();
                    //Select another tab
                    if (this.selectedTab == v) {
                        this.selectedTab = null;
                        if (len > 1)
                            this._tabs[0].tabSelector.element.trigger("click");
                    }
                    return v;
                }
            }
            return null;
        };
        Object.defineProperty(Tab.prototype, "tabs", {
            get: function () { return this._tabs; },
            enumerable: true,
            configurable: true
        });
        return Tab;
    })(Animate.Component);
    Animate.Tab = Tab;
})(Animate || (Animate = {}));
var Animate;
(function (Animate) {
    /**
    * A simple label wrapper. This creates a div that has a textfield sub div. the
    * subdiv is the DOM element that actually contains the text.
    */
    var Label = (function (_super) {
        __extends(Label, _super);
        function Label(text, parent, html) {
            if (html === void 0) { html = "<div class='label'></div>"; }
            _super.call(this, html, parent);
            this._text = text;
            this.textfield = this.addChild("<div class='textfield'>" + text + "</div>");
        }
        Object.defineProperty(Label.prototype, "text", {
            /**
            * Gets the text of the label
            */
            get: function () { return this._text; },
            /**
            * Sets the text of the label
            */
            set: function (val) { this._text = val; this.textfield.element.html(val); },
            enumerable: true,
            configurable: true
        });
        /**
        * This will cleanup the {Label}
        */
        Label.prototype.dispose = function () {
            this.textfield = null;
            //Call super
            _super.prototype.dispose.call(this);
        };
        Object.defineProperty(Label.prototype, "textHeight", {
            /**
            * Returns the text height, in pixels, of this label. Use this function sparingly as it adds a clone
            * of the element to the body, measures the text then removes the clone. This is so that we get the text even if
            * the <Component> is not on the DOM
            * @extends <Label>
            * @returns <number>
            */
            get: function () {
                var clone = this.textfield.element.clone();
                clone.css({ width: this.element.width() });
                jQuery("body").append(clone);
                var h = clone.height();
                clone.remove();
                return h;
            },
            enumerable: true,
            configurable: true
        });
        return Label;
    })(Animate.Component);
    Animate.Label = Label;
})(Animate || (Animate = {}));
var Animate;
(function (Animate) {
    /**
    * A simple button class
    */
    var Button = (function (_super) {
        __extends(Button, _super);
        /**
        * @param {string} The button text
        * @param {Component} parent The parent of the button
        * @param {number} width The width of the button (optional)
        * @param {number} height The height of the button (optional)
        */
        function Button(text, parent, html, width, height) {
            if (html === void 0) { html = "<div class='button reg-gradient curve-small'></div>"; }
            if (width === void 0) { width = 70; }
            if (height === void 0) { height = 30; }
            _super.call(this, text, parent, html);
            var h = this.element.height();
            var th = this.textfield.element.height();
            this.textfield.element.css("top", h / 2 - th / 2);
            //this.element.disableSelection( true );
            this.element.css({ width: width + "px", height: height + "px", margin: "3px" });
        }
        /**
        * A shortcut for jQuery's css property.
        */
        Button.prototype.css = function (propertyName, value) {
            //Call super
            var toRet = this.element.css(propertyName, value);
            var h = this.element.height();
            var th = this.textHeight;
            this.textfield.element.css("top", h / 2 - th / 2);
            return toRet;
        };
        /**This will cleanup the component.*/
        Button.prototype.dispose = function () {
            //Call super
            Animate.Label.prototype.dispose.call(this);
            this.textfield = null;
        };
        Object.defineProperty(Button.prototype, "selected", {
            /**
            * Get or Set if the component is selected. When set to true a css class of 'selected' is added to the {Component}
            */
            get: function () {
                if (this.element.hasClass("button-selected"))
                    return true;
                else
                    return false;
            },
            /**
            * Get or Set if the component is selected. When set to true a css class of 'selected' is added to the {Component}
            */
            set: function (val) {
                if (val)
                    this.element.addClass("button-selected");
                else
                    this.element.removeClass("button-selected");
            },
            enumerable: true,
            configurable: true
        });
        return Button;
    })(Animate.Label);
    Animate.Button = Button;
})(Animate || (Animate = {}));
var Animate;
(function (Animate) {
    /**
    * A simple {Component} that you can use to get user input by using the text function
    */
    var InputBox = (function (_super) {
        __extends(InputBox, _super);
        /**
        * @param {Component} parent The parent <Component> to which we add this box
        * @param {string} text The text of the input box
        * @param {boolean} isTextArea True if this is a text area (for larger text)
        * @param {boolean} isPassword True if this needs to be obscured for passwords
        * @param {string} html
        */
        function InputBox(parent, text, isTextArea, isPassword, html) {
            if (isTextArea === void 0) { isTextArea = false; }
            if (isPassword === void 0) { isPassword = false; }
            if (html === void 0) { html = "<div class='input-box'></div>"; }
            // Call super-class constructor
            _super.call(this, html, parent);
            if (isTextArea)
                this._textfield = this.addChild("<textarea></textarea>");
            else if (isPassword)
                this._textfield = this.addChild("<input type='password' />");
            else
                this._textfield = this.addChild("<input type='text' />");
            this.text = text;
            return this._limit = null;
        }
        /**
        * Called when the text property is changed. This function will only fire if a limit has been
        * set with the limitCharacters(val) function.
        * @param {any} e
        */
        InputBox.prototype.onTextChange = function (e) {
            var text = this._textfield.element.val();
            if (text.length > this._limit)
                this._textfield.element.val(text.substring(0, this._limit));
        };
        Object.defineProperty(InputBox.prototype, "limitCharacters", {
            /**
            * Use this function to get a limit on how many characters can be entered in this input
            * @returns {number} val The integer limit of characters
            */
            get: function () {
                return this._limit;
            },
            /**
            * Use this function to set a limit on how many characters can be entered in this input
            * @param {number} val The integer limit of characters
            */
            set: function (val) {
                this._limit = val;
                if (isNaN(this._limit) || this._limit == 0 || this._limit == null)
                    this._textfield.element.off();
                else
                    this._textfield.element.on("input", jQuery.proxy(this.onTextChange, this));
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(InputBox.prototype, "text", {
            /**
            * @returns {string}
            */
            get: function () {
                return this._textfield.element.val();
            },
            /**
            * @param {string} val
            */
            set: function (val) {
                this._textfield.element.val(val);
            },
            enumerable: true,
            configurable: true
        });
        /**
        * Highlights and focuses the text of this input
        * @param {boolean} focusInView If set to true the input will be scrolled to as well as selected. This is not
        * always desireable because the input  might be off screen on purpose.
        */
        InputBox.prototype.focus = function (focusInView) {
            if (focusInView === void 0) { focusInView = false; }
            if (focusInView)
                this._textfield.element.focus();
            this._textfield.element.select();
            Animate.Application.getInstance().focusObj = this;
        };
        /**
        * This will cleanup the component.
        */
        InputBox.prototype.dispose = function () {
            this._textfield = null;
            //Call super
            _super.prototype.dispose.call(this);
        };
        Object.defineProperty(InputBox.prototype, "textfield", {
            get: function () { return this._textfield; },
            enumerable: true,
            configurable: true
        });
        return InputBox;
    })(Animate.Component);
    Animate.InputBox = InputBox;
})(Animate || (Animate = {}));
var Animate;
(function (Animate) {
    /**
    * A small holder div that emulates C# style grids. Use the content variable instead of the group directly
    */
    var Group = (function (_super) {
        __extends(Group, _super);
        function Group(text, parent) {
            _super.call(this, "<div class='group'><div class='group-header background'></div><div class='group-content'></div></div>", parent);
            this.heading = new Animate.Label(text, this);
            this.heading.element.addClass("group-header");
            this.heading.element.addClass("background");
            this.content = this.addChild("<div class='group-content'></div>");
        }
        /**
        * Gets or sets the label text
        * @param {string} val The text for this label
        * @returns {string} The text for this label
        */
        Group.prototype.text = function (val) { return this.heading.element.text(val); };
        /**
        * This will cleanup the <Group>.
        */
        Group.prototype.dispose = function () {
            this.heading = null;
            this.content = null;
            //Call super
            _super.prototype.dispose.call(this);
        };
        return Group;
    })(Animate.Component);
    Animate.Group = Group;
})(Animate || (Animate = {}));
var Animate;
(function (Animate) {
    /**
    * A wrapper class for checkboxes
    */
    var Checkbox = (function (_super) {
        __extends(Checkbox, _super);
        /**
        * A wrapper class for checkboxes
        */
        function Checkbox(parent, text, checked, html) {
            if (html === void 0) { html = "<div class='checkbox'></div>"; }
            // Call super-class constructor
            _super.call(this, html, parent);
            this.checkbox = this.addChild("<input type='checkbox'></input>");
            this.textfield = this.addChild("<div class='text'>" + text + "</div>");
            if (checked)
                this.checkbox.element.prop("checked", checked);
        }
        Object.defineProperty(Checkbox.prototype, "checked", {
            /**Gets if the checkbox is checked.*/
            get: function () {
                return this.checkbox.element.prop("checked");
            },
            /**Sets if the checkbox is checked.*/
            set: function (val) {
                this.checkbox.element.prop("checked", val);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Checkbox.prototype, "text", {
            /**Gets the checkbox label text*/
            get: function () {
                return this.textfield.element.val();
            },
            /**Sets the checkbox label text*/
            set: function (val) {
                this.textfield.element.val(val);
            },
            enumerable: true,
            configurable: true
        });
        /**This will cleanup the component.*/
        Checkbox.prototype.dispose = function () {
            this.textfield = null;
            this.checkbox = null;
            //Call super
            _super.prototype.dispose.call(this);
        };
        return Checkbox;
    })(Animate.Component);
    Animate.Checkbox = Checkbox;
})(Animate || (Animate = {}));
var Animate;
(function (Animate) {
    /**
    * A small component that represents a text - value pair
    */
    var LabelVal = (function (_super) {
        __extends(LabelVal, _super);
        /**
        * @param {Component} parent The parent component
        * @param {string} text The label text
        * @param {Component} val The component we are pairing with the label
        * @param {any} css An optional css object to apply to the val component
        */
        function LabelVal(parent, text, val, css) {
            if (css === void 0) { css = null; }
            // Call super-class constructor
            _super.call(this, "<div class='label-val'></div>", parent);
            this.label = new Animate.Label(text, this);
            this._val = val;
            this.element.append(this._val.element);
            this.element.append("<div class='fix'></div>");
            if (css)
                this._val.element.css(css);
        }
        /**This will cleanup the component.*/
        LabelVal.prototype.dispose = function () {
            this.label.dispose();
            this.val.dispose();
            this.label = null;
            this._val = null;
            //Call super
            _super.prototype.dispose.call(this);
        };
        Object.defineProperty(LabelVal.prototype, "val", {
            get: function () { return this._val; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(LabelVal.prototype, "text", {
            /**Gets the label text*/
            get: function () { return this.label.text; },
            enumerable: true,
            configurable: true
        });
        return LabelVal;
    })(Animate.Component);
    Animate.LabelVal = LabelVal;
})(Animate || (Animate = {}));
var Animate;
(function (Animate) {
    /**
    * The ListViewItem class is used in the ListView class. These represent the items you can select.
    */
    var ListViewItem = (function () {
        /**
        * @param {Array<string>} fields An array of strings. These strings will be evenly distributed between columns of a list view.
        * @param {string} smallImg The URL of an image to use that can represent the small image of this item when in Image mode of the list view
        * @param {string} largeIMG The URL of an image to use that can represent the large image of this item when in Image mode of the list view
        */
        function ListViewItem(fields, smallImg, largeIMG) {
            if (smallImg === void 0) { smallImg = ""; }
            if (largeIMG === void 0) { largeIMG = ""; }
            this._fields = fields;
            this._smallImg = smallImg;
            this._largeIMG = largeIMG;
            this._rowNum = 0;
            this.tag = null;
            this._components = [];
        }
        /**
        * This function clears the field's components
        */
        ListViewItem.prototype.clearComponents = function () {
            var i = this._components.length;
            while (i--)
                this._components[i].dispose();
            this._components = [];
        };
        /**
        * This function is used to cleanup the object before its removed from memory.
        */
        ListViewItem.prototype.dispose = function () {
            var i = this._components.length;
            while (i--)
                this._components[i].dispose();
            this._fields = null;
            this._smallImg = null;
            this._largeIMG = null;
            this._rowNum = null;
            this._components = null;
            this.tag = null;
        };
        /**
        * Creates a preview component for the list view.
        * @param {string} text Text to show under the preview
        * @param {number} imgSize The size of the image
        * @returns <Component>
        */
        ListViewItem.prototype.preview = function (text, imgSize) {
            var toRet = new Animate.Component("<div class='list-view-preview' style='width:" + (imgSize) + "px; height:" + (imgSize + 30) + "px;'><div class='image' style='width:" + imgSize + "px; height:" + imgSize + "px;'><img src='" + this.largeIMG + "' /></div><div class='info'>" + text + "</div></div>", null);
            this.components.push(toRet);
            toRet.element.data("item", this);
            return toRet;
        };
        /**
        * Creates a field component
        * @param string content The text to show inside of the field
        * @returns {Component}
        */
        ListViewItem.prototype.field = function (content) {
            var toRet = new Animate.Component("<div class='list-view-field unselectable'>" + content + "</div>", null);
            this.components.push(toRet);
            toRet.element.data("item", this);
            return toRet;
        };
        Object.defineProperty(ListViewItem.prototype, "components", {
            get: function () { return this._components; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ListViewItem.prototype, "fields", {
            get: function () { return this._fields; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ListViewItem.prototype, "smallImg", {
            get: function () { return this._smallImg; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ListViewItem.prototype, "largeIMG", {
            get: function () { return this._largeIMG; },
            enumerable: true,
            configurable: true
        });
        return ListViewItem;
    })();
    Animate.ListViewItem = ListViewItem;
})(Animate || (Animate = {}));
var Animate;
(function (Animate) {
    /**
    * The ListViewHeader class is used in the ListView class. It acts as the first selectable item row in the list view.
    */
    var ListViewHeader = (function (_super) {
        __extends(ListViewHeader, _super);
        /**
        * @param {string} text The text of the header
        * @param {string} image The optional image of the header
        */
        function ListViewHeader(text, image) {
            // Call super-class constructor
            _super.call(this, "<div class='list-view-header light-gradient'><span class='inner'>" + (image && image != "" ? "<img src='" + image + "'/>" : "") + text + "</span><div class='dragger light-gradient'></div></div>", null);
            this.text = text;
        }
        return ListViewHeader;
    })(Animate.Component);
    Animate.ListViewHeader = ListViewHeader;
})(Animate || (Animate = {}));
var Animate;
(function (Animate) {
    var ListViewEvents = (function (_super) {
        __extends(ListViewEvents, _super);
        function ListViewEvents(v) {
            _super.call(this, v);
        }
        ListViewEvents.ITEM_CLICKED = new ListViewEvents("list_view_item_clicked");
        ListViewEvents.ITEM_DOUBLE_CLICKED = new ListViewEvents("list_view_item_double_clicked");
        return ListViewEvents;
    })(Animate.ENUM);
    Animate.ListViewEvents = ListViewEvents;
    var ColumnItem = (function () {
        function ColumnItem(text, image) {
            if (image === void 0) { image = ""; }
            this.text = text;
            this.image = image;
        }
        return ColumnItem;
    })();
    Animate.ColumnItem = ColumnItem;
    var ListViewType = (function () {
        function ListViewType(v) {
            this.value = v;
        }
        ListViewType.prototype.toString = function () { return this.value; };
        ListViewType.DETAILS = new ListViewType("details");
        ListViewType.IMAGES = new ListViewType("images");
        return ListViewType;
    })();
    Animate.ListViewType = ListViewType;
    var ListViewEvent = (function (_super) {
        __extends(ListViewEvent, _super);
        function ListViewEvent(eventType, item) {
            _super.call(this, eventType);
            this.item = item;
        }
        return ListViewEvent;
    })(Animate.Event);
    Animate.ListViewEvent = ListViewEvent;
    /**
    * The ListView class is used to display a series of {ListViewItem}s. Each item can
    * organised by a series of columns
    */
    var ListView = (function (_super) {
        __extends(ListView, _super);
        function ListView(parent) {
            // Call super-class constructor
            _super.call(this, "<div class='list-view'></div>", parent);
            this._mode = ListViewType.DETAILS;
            this._selectedItem = null;
            this._lists = [];
            this._items = [];
            this._columns = [];
            this._sortableColumn = 0;
            this._multiSelect = false;
            this._fix = this.addChild("<div class='fix'></div>");
            this._divider = this.addChild("<div class='divider'></div>");
            this._divider.element.detach();
            this._selectedColumn = null;
            this._imgSize = 100;
            //Events
            this._dClickProxy = this.onDoubleClick.bind(this);
            this._clickProxy = this.onClick.bind(this);
            this._downProxy = this.onDown.bind(this);
            this._upProxy = this.onUp.bind(this);
            this._moveProxy = this.onMove.bind(this);
            this.element.on("dblclick", this._dClickProxy);
            this.element.on("click", this._clickProxy);
            this.element.on("mousedown", this._downProxy);
        }
        Object.defineProperty(ListView.prototype, "displayMode", {
            /**
            * @returns {ListViewType} Either ListViewType.DETAILS or ListViewType.IMAGES
            */
            get: function () {
                return this._mode;
            },
            /**
            * Toggle between the different modes
            * @param {ListViewType} mode Either DETAILS or IMAGES mode
            */
            set: function (mode) {
                if (mode === undefined)
                    return;
                for (var i = 0; i < this._items.length; i++) {
                    for (var ii = 0; ii < this._items[i].components.length; ii++)
                        this._items[i].components[ii].dispose();
                    this._items[i].components.splice(0, this._items[i].components.length);
                }
                this._mode = mode;
                this.updateItems();
                return;
            },
            enumerable: true,
            configurable: true
        });
        /**
        * Called when we hold down on this component
        * @param {any} e The jQuery event object
        */
        ListView.prototype.onDown = function (e) {
            var target = jQuery(e.target);
            if (target.hasClass("dragger")) {
                this._selectedColumn = target.parent().parent();
                if (this._selectedColumn.length > 0) {
                    e.preventDefault();
                    this.element.append(this._divider.element);
                    jQuery(document).on("mousemove", this._moveProxy);
                    jQuery(document).on("mouseup", this._upProxy);
                    this._divider.element.css({
                        left: (target.position().left + (target.width() / 2)) + "px"
                    });
                    return false;
                }
            }
        };
        /**
        * Called when we move over this componeny
        * @param {any} e The jQuery event object
        */
        ListView.prototype.onMove = function (e) {
            var position = this.element.offset();
            var dividerSize = 5;
            var w = this.element.width();
            var dist = e.clientX - position.left;
            if (dist < dividerSize)
                dist = 0;
            if (dist > w - dividerSize)
                dist = w - dividerSize;
            this._divider.element.css({
                left: dist + "px"
            });
        };
        /**
        * Called when the mouse up event is fired
        * @param {any} e The jQuery event object
        */
        ListView.prototype.onUp = function (e) {
            var position = this._selectedColumn.offset();
            //var dividerSize = 5;
            var dist = e.clientX - position.left;
            this._selectedColumn.css({ width: dist + "px" });
            var newWidth = 0;
            var i = this._lists.length;
            while (i--)
                newWidth += this._lists[i].element.outerWidth();
            this.element.css({ "min-width": newWidth + "px" });
            this._divider.element.detach();
            jQuery(document).off("mousemove", this._moveProxy);
            jQuery(document).off("mouseup", this._upProxy);
        };
        ListView.prototype.onDoubleClick = function (e) {
            var listViewItem = jQuery(e.target).data("item");
            if (listViewItem) {
                //Select all components of the item we clicked on
                var i = listViewItem.components.length;
                while (i--) {
                    var comp = listViewItem.components[i];
                    comp.element.removeClass("selected");
                }
                i = listViewItem.components.length;
                while (i--) {
                    var comp = listViewItem.components[i];
                    comp.element.addClass("selected");
                }
                this.dispatchEvent(new ListViewEvent(ListViewEvents.ITEM_DOUBLE_CLICKED, listViewItem));
            }
            e.preventDefault();
            return false;
        };
        /**
        * Called when we click this component
        * @param {any} e The jQuery event object
        */
        ListView.prototype.onClick = function (e) {
            var comp = jQuery(e.target).data("component");
            //Check if we clicked a header
            if (comp instanceof Animate.ListViewHeader) {
                var i = this._lists.length;
                while (i--)
                    if (this._lists[i].children[0] == comp) {
                        this._sortableColumn = i;
                        this.updateItems();
                        return;
                    }
            }
            else {
                //Check if we selected an item. If we did we need to make all the items on that row selected.
                var listViewItem = jQuery(e.target).data("item");
                if (listViewItem) {
                    if (!e.ctrlKey && jQuery(e.target).hasClass("selected")) {
                        //Select all components of the item we clicked on
                        i = listViewItem.components.length;
                        while (i--) {
                            var comp = listViewItem.components[i];
                            comp.element.removeClass("selected");
                        }
                        this.dispatchEvent(new ListViewEvent(ListViewEvents.ITEM_CLICKED, null));
                        return;
                    }
                    //Remove previous selection
                    if (this._multiSelect == false || !e.ctrlKey) {
                        var selectedItems = jQuery(".selected", this.element);
                        selectedItems.each(function () {
                            jQuery(this).removeClass("selected");
                        });
                    }
                    //If the item is already selected, then unselect it
                    if (jQuery(e.target).hasClass("selected")) {
                        //Select all components of the item we clicked on
                        i = listViewItem.components.length;
                        while (i--) {
                            var comp = listViewItem.components[i];
                            comp.element.removeClass("selected");
                            this.dispatchEvent(new ListViewEvent(ListViewEvents.ITEM_CLICKED, null));
                        }
                    }
                    else {
                        //Select all components of the item we clicked on
                        i = listViewItem.components.length;
                        while (i--) {
                            var comp = listViewItem.components[i];
                            comp.element.addClass("selected");
                        }
                        this.dispatchEvent(new ListViewEvent(ListViewEvents.ITEM_CLICKED, listViewItem));
                    }
                }
            }
        };
        /**
        * Gets all the items that are selected
        * @returns {Array<ListViewItem>}
        */
        ListView.prototype.getSelectedItems = function () {
            var items = [];
            var selectedItems = jQuery(".selected", this.element);
            selectedItems.each(function () {
                var listViewItem = jQuery(this).data("item");
                if (items.indexOf(listViewItem) == -1)
                    items.push(listViewItem);
            });
            return items;
        };
        /**
        * Sets which items must be selected. If you specify null then no items will be selected.
        */
        ListView.prototype.setSelectedItems = function (items) {
            if (items == null) {
                var selectedItems = jQuery(".selected", this.element);
                selectedItems.each(function () {
                    jQuery(this).removeClass("selected");
                });
            }
        };
        /**
        * This function is used to clean up the list
        */
        ListView.prototype.dispose = function () {
            this._selectedColumn = null;
            var i = this._lists.length;
            while (i--)
                this._lists[i].dispose();
            i = this._items.length;
            while (i--)
                this._items[i].dispose();
            this.element.off("dblclick", this._dClickProxy);
            this.element.off("click", this._clickProxy);
            jQuery(document).off("mousemove", this._moveProxy);
            jQuery(document).off("mouseup", this._upProxy);
            this._selectedItem = null;
            this._items = null;
            this._columns = null;
            this._lists = null;
            this._dClickProxy = null;
        };
        /**
        * Redraws the list with the items correctly synced with the column names
        * @returns {any}
        */
        ListView.prototype.updateItems = function () {
            this._fix.element.detach();
            var widths = [];
            //Clean up the fields
            i = this._items.length;
            while (i--)
                this._items[i].clearComponents();
            for (var i = 0; i < this._lists.length; i++) {
                widths.push(this._lists[i].element.width());
                this._lists[i].dispose();
            }
            this._lists = [];
            if (this._mode == ListViewType.DETAILS) {
                var sortableColumn = this._sortableColumn;
                var totalW = 0;
                for (var i = 0; i < this._columns.length; i++) {
                    var list = this.addChild("<div class='list' " + (widths.length > 0 ? "style='width:" + widths[i] + "px;'" : "") + "></div>");
                    this._lists.push(list);
                    ////Add closing border
                    //if (i == this._columns.length - 1)
                    //	list.element.css({ "border-right": "1px solid #ccc" });
                    var header = new Animate.ListViewHeader(this._columns[i].text + (i == sortableColumn ? "   ▼" : ""), this._columns[i].image);
                    list.addChild(header);
                    var w = 0;
                    //If the list is not on the DOM we need to add to get its real width
                    var clone = header.element.clone();
                    clone.css({ "float": "left" });
                    jQuery("body").append(clone);
                    w = clone.width() + 10;
                    clone.remove();
                    if (widths.length > 0 && widths[i] > w)
                        w = widths[i];
                    totalW += w;
                    list.element.css({ "min-width": (w) + "px", "width": (w) + "px" });
                }
                this.element.append(this._fix.element);
                this.element.css({ "min-width": (totalW) + "px" });
                //Sort the items based on the sortable column
                this._items.sort(function (a, b) {
                    if (sortableColumn < a.fields.length && sortableColumn < a.fields.length) {
                        var fieldA = a.fields[sortableColumn].toString().toLowerCase();
                        var fieldB = b.fields[sortableColumn].toString().toLowerCase();
                        if (fieldA < fieldB)
                            return -1;
                        else if (fieldB < fieldA)
                            return 1;
                        else
                            return 0;
                    }
                    else
                        return 1;
                });
                //Now do each of the items
                for (var i = 0; i < this._items.length; i++)
                    for (var ii = 0; ii < this._items[i].fields.length; ii++)
                        if (ii < this._lists.length) {
                            var comp = this._items[i].field(this._items[i].fields[ii]);
                            this._lists[ii].addChild(comp);
                        }
            }
            else {
                this.element.css({ "min-width": "" });
                //Now do each of the items
                for (var i = 0; i < this._items.length; i++) {
                    var comp = this._items[i].preview(this._items[i].fields[1], this._imgSize);
                    this.addChild(comp);
                }
            }
        };
        /**
        * Adds a column
        * @param {string} name The name of the new column
        * @param {string} image The image of the column
        */
        ListView.prototype.addColumn = function (name, image) {
            if (image === void 0) { image = ""; }
            this._columns.push(new ColumnItem(name, image));
            this.updateItems();
        };
        /**
        * Removes a column
        * @param {string} name The name of the column to remove
        */
        ListView.prototype.removeColumn = function (name) {
            if (this._columns.indexOf(name) != -1)
                this._columns.splice(this._columns.indexOf(name, 1));
            this.updateItems();
        };
        /**
        * Adds a {ListViewItem} to this list
        * @param {ListViewItem} item The item we are adding to the list
        * @returns {ListViewItem}
        */
        ListView.prototype.addItem = function (item) {
            var toRet = item;
            this._items.push(toRet);
            item.rowNum = this._items.length;
            if (this._mode == ListViewType.DETAILS) {
                for (var i = 0; i < item.fields.length; i++)
                    if (i < this._lists.length) {
                        var comp = item.field(item.fields[i]);
                        this._lists[i].addChild(comp);
                    }
            }
            else {
                var comp = item.preview(item.fields[1], this._imgSize);
                this.addChild(comp);
            }
            return toRet;
        };
        /**
        * Sets the length of a column by its index
        * @param <int> columnIndex The index of the column
        * @param {string} width A CSS width property. This can be either % or px
        * @returns {ListViewItem}
        */
        ListView.prototype.setColumnWidth = function (columnIndex, width) {
            if (this._lists.length > columnIndex)
                this._lists[columnIndex].element.css("width", width);
            this.updateItems();
        };
        /**
        * Removes a {ListViewItem} from this list
        * @param {ListViewItem} item The {ListViewItem} to remove.
        * @param {boolean} dispose If set to true the item will be disposed
        * @returns {ListViewItem}
        */
        ListView.prototype.removeItem = function (item, dispose) {
            if (dispose === void 0) { dispose = true; }
            this._items.splice(this._items.indexOf(item), 1);
            if (dispose)
                item.dispose();
            return item;
        };
        /**
        * This function is used to remove all items from the list.
        * @param {boolean} dispose If set to true the item will be disposed
        */
        ListView.prototype.clearItems = function (dispose) {
            if (dispose === void 0) { dispose = true; }
            var i = this._items.length;
            while (i--)
                if (dispose)
                    this._items[i].dispose();
            this._items.splice(0, this._items.length);
        };
        Object.defineProperty(ListView.prototype, "items", {
            get: function () { return this._items; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ListView.prototype, "lists", {
            get: function () { return this._lists; },
            enumerable: true,
            configurable: true
        });
        return ListView;
    })(Animate.Component);
    Animate.ListView = ListView;
})(Animate || (Animate = {}));
var Animate;
(function (Animate) {
    var ListEvents = (function (_super) {
        __extends(ListEvents, _super);
        function ListEvents(v) {
            _super.call(this, v);
        }
        ListEvents.ITEM_SELECTED = new ListEvents("list_item_selected");
        return ListEvents;
    })(Animate.ENUM);
    Animate.ListEvents = ListEvents;
    var ListEvent = (function (_super) {
        __extends(ListEvent, _super);
        function ListEvent(eventName, item) {
            _super.call(this, eventName, item);
            this.item = item;
        }
        return ListEvent;
    })(Animate.Event);
    Animate.ListEvent = ListEvent;
    /**
    * Use this class to create a select list.
    */
    var List = (function (_super) {
        __extends(List, _super);
        /**
        * @param {Component} parent The parent component of this list
        * @param {string} html An optional set of HTML to use. The default is <div class='list-box'></div>
        * @param {string} selectHTML
        * @param {boolean} isDropDown
        */
        function List(parent, html, selectHTML, isDropDown) {
            if (html === void 0) { html = "<div class='list-box'></div>"; }
            if (selectHTML === void 0) { selectHTML = "<select class='list' size='6'></select>"; }
            if (isDropDown === void 0) { isDropDown = false; }
            if (isDropDown)
                selectHTML = "<select></select>";
            // Call super-class constructor
            _super.call(this, html, parent);
            this.selectBox = this.addChild(selectHTML);
            this.selectProxy = this.onSelection.bind(this);
            this.selectBox.element.on("change", this.selectProxy);
            this.items = [];
        }
        /**
        * Called when a selection is made
        * @param <object> val Called when we make a selection
        */
        List.prototype.onSelection = function (val) {
            this.dispatchEvent(new ListEvent(ListEvents.ITEM_SELECTED, this.selectedItem));
        };
        /**
        * Adds an item to the list
        * @param {string} val The text of the item
        * @returns {JQuery} The jQuery object created
        */
        List.prototype.addItem = function (val) {
            var toAdd = jQuery("<option value='" + this.items.length + "'>" + val + "</option>");
            this.items.push(toAdd);
            this.selectBox.element.append(toAdd);
            return toAdd;
        };
        /**
        * Sorts  the  list alphabetically
        */
        List.prototype.sort = function () {
            var items = this.items;
            var i = items.length;
            while (i--)
                items[i].detach();
            //jQuery( "option", this.element ).each( function ()
            //{
            //	jQuery( this ).detach();
            //	items.push( jQuery( this ) );
            //});
            //items.sort( function ( a, b )
            //{
            //	var textA = a.text().toUpperCase();
            //	var textB = b.text().toUpperCase();
            //	return ( textA < textB ) ? -1 : ( textA > textB ) ? 1 : 0;
            //});
            this.items = items.sort(function (a, b) {
                var textA = a.text().toUpperCase();
                var textB = b.text().toUpperCase();
                return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
            });
            var len = items.length;
            for (var i = 0; i < len; i++)
                this.selectBox.element.append(items[i]);
        };
        /**
        * Removes an item from the list
        * @param <object> val The text of the item to remove
        * @returns <object> The jQuery object
        */
        List.prototype.removeItem = function (val) {
            var len = this.items.length;
            for (var i = 0; i < len; i++) {
                var text = this.items[i].text();
                if (text == val) {
                    var item = this.items[i];
                    this.items.splice(i, 1);
                    item.detach();
                    return item;
                }
            }
            return null;
        };
        /**
        * Gets the number of list items
        * @returns {number} The number of items
        */
        List.prototype.numItems = function () { return this.items.length; };
        Object.defineProperty(List.prototype, "selectedItem", {
            /**
            * Gets thee selected item from the list.
            * @returns {JQuery} The selected jQuery object
            */
            get: function () {
                //Return selected list item
                var len = this.items.length;
                for (var i = 0; i < len; i++)
                    if (this.items[i].prop("selected"))
                        return this.items[i].text();
                return null;
            },
            /**
            * Sets thee selected item from the list.
            * @param {string} val The text of the item
            */
            set: function (val) {
                jQuery("select option", this.element).filter(function () {
                    //may want to use $.trim in here
                    return jQuery(this).text() == val;
                }).prop('selected', true);
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(List.prototype, "selectedIndex", {
            /**
            * Gets the selected item index from the list by its
            * index.
            * @returns {number} The selected index or -1 if nothing was found.
            */
            get: function () {
                //Return selected list item by index
                var len = this.items.length;
                for (var i = 0; i < len; i++)
                    if (this.items[i].prop("selected") === true)
                        return i;
                return -1;
            },
            /**
            * Sets the selected item index from the list by its index.
            * @param {number} val The text of the item
            */
            set: function (val) {
                if (typeof (val) !== "undefined") {
                    //Remove any previously selected items
                    var len = this.items.length;
                    for (var i = 0; i < len; i++)
                        this.items[i].prop("selected", false);
                    this.items[val].prop("selected", true);
                }
            },
            enumerable: true,
            configurable: true
        });
        /**
        * Gets item from the list by its value
        * @param {string} val The text of the item
        * @returns {JQuery} The jQuery object
        */
        List.prototype.getItem = function (val) {
            var len = this.items.length;
            for (var i = 0; i < len; i++) {
                var v = this.items[i].text();
                if (v == val)
                    return this.items[i];
            }
            return null;
        };
        /**
        * Removes all items
        */
        List.prototype.clearItems = function () {
            var len = this.items.length;
            for (var i = 0; i < len; i++)
                this.items[i].remove();
            this.items.splice(0, len);
        };
        /**
        * Diposes and cleans up this component and all its child <Component>s
        */
        List.prototype.dispose = function () {
            this.selectProxy = null;
            this.selectBox.element.off();
            this.items = null;
            this.selectBox = null;
            //Call super
            _super.prototype.dispose.call(this);
        };
        return List;
    })(Animate.Component);
    Animate.List = List;
})(Animate || (Animate = {}));
var Animate;
(function (Animate) {
    /**
    * Use this class to create a drop down box of items.
    */
    var ComboBox = (function (_super) {
        __extends(ComboBox, _super);
        function ComboBox(parent) {
            if (parent === void 0) { parent = null; }
            _super.call(this, parent, "<div class='combo-box'></div>", "<select class='combo'></select>");
        }
        return ComboBox;
    })(Animate.List);
    Animate.ComboBox = ComboBox;
})(Animate || (Animate = {}));
var Animate;
(function (Animate) {
    /**
    * The main GUI component of the application.
    */
    var Application = (function (_super) {
        __extends(Application, _super);
        function Application(domElement) {
            _super.call(this, domElement, null);
            if (Application._singleton != null)
                throw new Error("The Application class is a singleton. You need to call the Application.getSingleton() function.");
            // Creates a common body element
            Application.bodyComponent = new Animate.Component("body");
            Application._singleton = this;
            this._canvasContext = new Animate.CanvasContext(200);
            this._focusObj = null;
            //Start the tooltip manager
            Animate.TooltipManager.create();
            Animate.User.get;
            this._resizeProxy = this.onWindowResized.bind(this);
            this._downProxy = this.onMouseDown.bind(this);
            //var comp = jQuery( document.activeElement ).data( "component" );
            //Create each of the main components for the application.
            var stage = new Animate.Component("#stage");
            var toolbar = Animate.Toolbar.getSingleton(new Animate.Component("#toolbar"));
            this.addChild(toolbar);
            this.addChild(stage);
            //Create each of the main split panels
            var mainSplit = new Animate.SplitPanel(stage, Animate.SplitOrientation.VERTICAL, 0.75);
            mainSplit.element.css({ width: "100%", height: "100%" });
            var leftSplit = new Animate.SplitPanel(mainSplit.left, Animate.SplitOrientation.HORIZONTAL, 0.85);
            var rightSplit = new Animate.SplitPanel(mainSplit.right, Animate.SplitOrientation.HORIZONTAL, 0.5);
            leftSplit.element.css({ width: "100%", height: "100%" });
            rightSplit.element.css({ width: "100%", height: "100%" });
            var grid = new Animate.PropertyGrid(rightSplit.top);
            var scenetab = Animate.SceneTab.getSingleton(rightSplit.bottom);
            var canvastab = Animate.CanvasTab.getSingleton(leftSplit.top);
            var logger = Animate.Logger.getSingleton(leftSplit.bottom);
            logger.logMessage("let's get animated!", null, Animate.LogType.MESSAGE);
            //now set up the dockers
            this._dockerlefttop = new Animate.Docker(leftSplit.top);
            this._dockerlefttop.addComponent(canvastab, false);
            this._dockerleftbottom = new Animate.Docker(leftSplit.bottom);
            this._dockerleftbottom.addComponent(logger, false);
            this._dockerrightbottom = new Animate.Docker(rightSplit.bottom);
            this._dockerrightbottom.addComponent(scenetab, false);
            this._dockerrighttop = new Animate.Docker(rightSplit.top);
            this._dockerrighttop.addComponent(grid, false);
            this.update();
            //Hook the resize event
            jQuery(window).on('resize', this._resizeProxy);
            jQuery(document).on('mousedown', this._downProxy);
        }
        /**
        * Deals with the focus changes
        * @param {object} e The jQuery event object
        */
        Application.prototype.onMouseDown = function (e) {
            var elem = jQuery(e.target);
            var comp = elem.data("component");
            while (!comp && elem.length != 0) {
                elem = jQuery(elem).parent();
                comp = elem.data("component");
            }
            this.setFocus(comp);
        };
        /**
        * Sets a component to be focused.
        * @param {Component} comp The component to focus on.
        */
        Application.prototype.setFocus = function (comp) {
            if (this._focusObj)
                this._focusObj.element.data("focus", false);
            if (comp != null) {
                comp.element.data("focus", true);
                this._focusObj = comp;
            }
        };
        /**
        * Updates the dimensions of the application
        * @param {object} val The jQuery event object
        */
        Application.prototype.onWindowResized = function (val) {
            // Do not update everything if the event is from JQ UI
            if (val && $(val.target).hasClass('ui-resizable'))
                return;
            _super.prototype.update.call(this);
        };
        /**
        * This will cleanup the component.
        */
        Application.prototype.dispose = function () {
            jQuery(window).off('resize', this._resizeProxy);
            jQuery(document).off('mousedown', this._downProxy);
            this._resizeProxy = null;
            this._downProxy = null;
            //Call super
            _super.prototype.dispose.call(this);
        };
        /**
        *  This is called when a project is unloaded and we need to reset the GUI.
        */
        Application.prototype.projectReset = function () {
            Animate.PropertyGrid.getSingleton().projectReset();
            Animate.Logger.getSingleton().clearItems();
            Animate.TreeViewScene.getSingleton().projectReset();
            Animate.CanvasTab.getSingleton().projectReset();
            //Must be called after reset
            var user = Animate.User.get;
            if (user.project) {
                user.project.reset();
            }
            //Unload all the plugins
            Animate.PluginManager.getSingleton().unloadAll();
        };
        /**
        * This is called when a project is created. This is used
        * so we can orgaise all the elements that need to be populated.
        */
        Application.prototype.projectReady = function () {
            Animate.Toolbar.getSingleton().newProject();
            Animate.CanvasTab.getSingleton().projectReady();
            var project = Animate.User.get.project;
            project.on(Animate.ProjectEvents.BEHAVIOURS_LOADED, this.onBehavioursLoaded, this);
            project.loadBehaviours();
            //Create the page title
            document.title = 'Animate: p' + project.entry._id + " - " + project.entry.name;
            Animate.TreeViewScene.getSingleton().projectReady();
        };
        /**
        * This is called when a project has loaded all its behaviours.
        */
        Application.prototype.onBehavioursLoaded = function (response, event, sender) {
            var project = Animate.User.get.project;
            project.off(Animate.ProjectEvents.BEHAVIOURS_LOADED, this.onBehavioursLoaded, this);
            project.on(Animate.ProjectEvents.FILES_LOADED, this.onFilesLoaded, this);
            project.loadFiles();
        };
        /**
        * This is called when a project has loaded all its assets.
        */
        Application.prototype.onAssetsLoaded = function (response, event, sender) {
            var project = Animate.User.get.project;
            project.off(Animate.ProjectEvents.ASSETS_LOADED, this.onAssetsLoaded, this);
            project.on(Animate.ProjectEvents.GROUPS_LOADED, this.onGroupsLoaded, this);
            project.loadGroups();
        };
        /**
        * This is called when a project has loaded all its files.
        */
        Application.prototype.onFilesLoaded = function (response, event, sender) {
            var project = Animate.User.get.project;
            project.off(Animate.ProjectEvents.FILES_LOADED, this.onFilesLoaded, this);
            project.on(Animate.ProjectEvents.ASSETS_LOADED, this.onAssetsLoaded, this);
            project.loadAssets();
        };
        /**
        * This is called when a project has loaded all its groups.
        */
        Application.prototype.onGroupsLoaded = function (response, event, sender) {
            var project = Animate.User.get.project;
            project.off(Animate.ProjectEvents.GROUPS_LOADED, this.onGroupsLoaded, this);
            project.off(Animate.ProjectEvents.SAVED_ALL, this.onSaveAll, this);
            project.on(Animate.ProjectEvents.SAVED_ALL, this.onSaveAll, this);
            Animate.PluginManager.getSingleton().callReady();
        };
        /**
        * When the project data is all saved to the DB
        */
        Application.prototype.onSaveAll = function (event, data) {
            Animate.CanvasTab.getSingleton().saveAll();
        };
        /**
        * Gets the singleton instance
        */
        Application.getInstance = function (domElement) {
            if (Application._singleton === undefined)
                Application._singleton = new Application(domElement);
            return Application._singleton;
        };
        Object.defineProperty(Application.prototype, "focusObj", {
            get: function () { return this._focusObj; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Application.prototype, "canvasContext", {
            get: function () { return this._canvasContext; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Application.prototype, "dockerLeftTop", {
            get: function () { return this._dockerlefttop; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Application.prototype, "dockerLeftBottom", {
            get: function () { return this._dockerleftbottom; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Application.prototype, "dockerRightTop", {
            get: function () { return this._dockerrighttop; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Application.prototype, "dockerRightBottom", {
            get: function () { return this._dockerrightbottom; },
            enumerable: true,
            configurable: true
        });
        return Application;
    })(Animate.Component);
    Animate.Application = Application;
})(Animate || (Animate = {}));
var Animate;
(function (Animate) {
    /**
    * Behaviours are the base class for all nodes placed on a <Canvas>
    */
    var Behaviour = (function (_super) {
        __extends(Behaviour, _super);
        function Behaviour(parent, text, html) {
            if (html === void 0) { html = "<div class='behaviour reg-gradient'></div>"; }
            // Call super-class constructor
            _super.call(this, text, parent, html);
            var th = this.textfield.element.height();
            var tw = this.textfield.element.width();
            this.element.css({ width: (tw + 20) + "px", height: (th + 20) + "px", margin: "" });
            this._originalName = text;
            this._alias = text;
            this._canGhost = true;
            this._parameters = [];
            this._products = [];
            this._outputs = [];
            this._inputs = [];
            this._portals = [];
            this._requiresUpdated = true;
        }
        /**
        * Adds a portal to this behaviour.
        * @param {PortalType} type The type of portal we are adding. It can be either Portal.INPUT, Portal.OUTPUT, Portal.PARAMETER & Portal.PRODUCT
        * @param {string} name The unique name of the <Portal>
        * @param {any} value The default value of the <Portal>
        * @param {ParameterType} dataType The data type that the portal represents. See the default data types.
        * @returns {Portal} The portal that was added to this node
        */
        Behaviour.prototype.addPortal = function (type, name, value, dataType, update) {
            var portal = new Animate.Portal(this, name, type, value, dataType);
            this._requiresUpdated = true;
            //Add the arrays
            if (type == Animate.PortalType.PARAMETER)
                this._parameters.push(portal);
            else if (type == Animate.PortalType.PRODUCT)
                this._products.push(portal);
            else if (type == Animate.PortalType.OUTPUT)
                this._outputs.push(portal);
            else
                this._inputs.push(portal);
            this._portals.push(portal);
            var portalSize = portal.element.width();
            portal.behaviour = this;
            //Update the dimensions
            if (update)
                this.updateDimensions();
            return portal;
        };
        /**
        * Removes a portal from this behaviour
        * @param {Portal} toRemove The portal object we are removing
        * @param {any} dispose Should the portal be disposed. The default is true.
        * @returns {Portal} The portal we have removed. This would be disposed if dispose was set to true.
        */
        Behaviour.prototype.removePortal = function (toRemove, dispose) {
            if (dispose === void 0) { dispose = true; }
            this._requiresUpdated = true;
            this.removeChild(toRemove);
            //Remove from arrays
            var index = jQuery.inArray(toRemove, this._parameters);
            if (index != -1) {
                this._parameters.splice(index, 1);
                toRemove.behaviour = null;
            }
            index = jQuery.inArray(toRemove, this._products);
            if (index != -1)
                this._products.splice(index, 1);
            index = jQuery.inArray(toRemove, this._outputs);
            if (index != -1)
                this._outputs.splice(index, 1);
            index = jQuery.inArray(toRemove, this._inputs);
            if (index != -1)
                this._inputs.splice(index, 1);
            index = jQuery.inArray(toRemove, this._portals);
            if (index != -1)
                this._portals.splice(index, 1);
            if (dispose)
                toRemove.dispose();
            //Update the dimensions
            this.updateDimensions();
            return toRemove;
        };
        /**
        * Called when the behaviour is renamed
        * @param {string} name The new name of the behaviour
        */
        Behaviour.prototype.onRenamed = function (name) { };
        /**
        * A shortcut for jQuery's css property.
        */
        Behaviour.prototype.css = function (propertyName, value) {
            //Call super
            var toRet = this.element.css(propertyName, value);
            var h = this.element.height();
            var th = this.textfield.element.height();
            this._requiresUpdated = true;
            this.textfield.element.css("top", h / 2 - th / 2);
            return toRet;
        };
        /**
        * Updates the behavior width and height and organises the portals
        */
        Behaviour.prototype.updateDimensions = function () {
            if (this._requiresUpdated == false)
                return;
            this._requiresUpdated = false;
            //First get the size of a portal.
            var portalSize = (this._portals.length > 0 ? this._portals[0].element.width() : 10);
            var portalSpacing = 5;
            this.element.css({ width: "1000px", height: "1000px" });
            this.textfield.element.css({ width: "auto", "float": "left" });
            var th = this.textfield.element.height();
            var tw = this.textfield.element.width();
            var topPortals = (this._products.length > this._parameters.length ? this._products.length : this._parameters.length);
            var btmPortals = (this._inputs.length > this._outputs.length ? this._inputs.length : this._outputs.length);
            var totalPortalSpacing = portalSize + 5;
            var padding = 10;
            tw = tw + padding > totalPortalSpacing * topPortals ? tw + padding : totalPortalSpacing * topPortals;
            th = th + padding > totalPortalSpacing * btmPortals ? th + padding : totalPortalSpacing * btmPortals;
            //Round off to the nearest 10 and minus border. This is so that they line up nicely to the graph
            tw = Math.ceil((tw + 1) / 10) * 10;
            th = Math.ceil((th + 1) / 10) * 10;
            this.css({ width: tw + "px", height: th + "px" });
            this.textfield.element.css({ width: "100%", height: "auto", "float": "none" });
            var width = this.element.width();
            var height = this.element.height();
            //Position the portals
            for (var i = 0; i < this._parameters.length; i++)
                this._parameters[i].element.css({ left: ((portalSize + portalSpacing) * i) + "px", top: -portalSize - 1 + "px" });
            for (var i = 0; i < this._outputs.length; i++)
                this._outputs[i].element.css({ top: ((portalSize + portalSpacing) * i) + "px", left: width + "px" });
            for (var i = 0; i < this._inputs.length; i++)
                this._inputs[i].element.css({ top: ((portalSize + portalSpacing) * i) + "px", left: -portalSize + "px" });
            for (var i = 0; i < this._products.length; i++)
                this._products[i].element.css({ left: ((portalSize + portalSpacing) * i) + "px", top: height + "px" });
        };
        Object.defineProperty(Behaviour.prototype, "text", {
            /** Gets the text of the behaviour */
            get: function () { return this.textfield.element.text(); },
            /**
            * sets the label text
            */
            set: function (value) {
                //Call super
                //this._originalName = value;
                this.textfield.element.text(value);
                this._requiresUpdated = true;
                if (value !== undefined)
                    this.updateDimensions();
            },
            enumerable: true,
            configurable: true
        });
        /**
        * Diposes and cleans up this component and all its child components
        */
        Behaviour.prototype.dispose = function () {
            //The draggable functionality is added in the Canvas addChild function because we need to listen for the events. 
            //To make sure its properly removed however we put it here.
            this.element.draggable("destroy");
            for (var i = 0; i < this._parameters.length; i++)
                this._parameters[i].dispose();
            for (var i = 0; i < this._products.length; i++)
                this._products[i].dispose();
            for (var i = 0; i < this._outputs.length; i++)
                this._outputs[i].dispose();
            for (var i = 0; i < this._inputs.length; i++)
                this._inputs[i].dispose();
            this._parameters = null;
            this._products = null;
            this._outputs = null;
            this._inputs = null;
            this._portals = null;
            this._alias = null;
            //Call super
            Animate.Button.prototype.dispose.call(this);
        };
        Object.defineProperty(Behaviour.prototype, "originalName", {
            get: function () { return this._originalName; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Behaviour.prototype, "alias", {
            get: function () { return this._alias; },
            set: function (val) { this._alias = val; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Behaviour.prototype, "canGhost", {
            get: function () { return this._canGhost; },
            set: function (val) { this._canGhost = val; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Behaviour.prototype, "requiresUpdated", {
            get: function () { return this._requiresUpdated; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Behaviour.prototype, "parameters", {
            get: function () { return this._parameters; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Behaviour.prototype, "products", {
            get: function () { return this._products; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Behaviour.prototype, "outputs", {
            get: function () { return this._outputs; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Behaviour.prototype, "inputs", {
            get: function () { return this._inputs; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Behaviour.prototype, "portals", {
            get: function () { return this._portals; },
            enumerable: true,
            configurable: true
        });
        return Behaviour;
    })(Animate.Button);
    Animate.Behaviour = Behaviour;
})(Animate || (Animate = {}));
var Animate;
(function (Animate) {
    var BehaviourPortal = (function (_super) {
        __extends(BehaviourPortal, _super);
        function BehaviourPortal(parent, text, portalType, dataType, value) {
            if (portalType === void 0) { portalType = Animate.PortalType.INPUT; }
            if (dataType === void 0) { dataType = Animate.ParameterType.BOOL; }
            if (value === void 0) { value = false; }
            this._portalType = portalType;
            this._dataType = dataType;
            this._value = value;
            // Call super-class constructor
            _super.call(this, parent, text);
            //this.element.removeClass("behaviour");
            this.element.addClass("behaviour-portal");
            if (this._portalType == Animate.PortalType.OUTPUT)
                this.addPortal(Animate.PortalType.INPUT, text, this._value, this._dataType, true);
            else if (this._portalType == Animate.PortalType.INPUT)
                this.addPortal(Animate.PortalType.OUTPUT, text, this._value, this._dataType, true);
            else if (this._portalType == Animate.PortalType.PARAMETER)
                this.addPortal(Animate.PortalType.PRODUCT, text, this._value, this._dataType, true);
            else
                this.addPortal(Animate.PortalType.PARAMETER, text, this._value, this._dataType, true);
        }
        /**This will cleanup the component.*/
        BehaviourPortal.prototype.dispose = function () {
            this._portalType = null;
            this._dataType = null;
            this._value = null;
            //Call super
            _super.prototype.dispose.call(this);
        };
        Object.defineProperty(BehaviourPortal.prototype, "portaltype", {
            get: function () { return this._portalType; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BehaviourPortal.prototype, "dataType", {
            get: function () { return this._dataType; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BehaviourPortal.prototype, "value", {
            get: function () { return this._value; },
            enumerable: true,
            configurable: true
        });
        return BehaviourPortal;
    })(Animate.Behaviour);
    Animate.BehaviourPortal = BehaviourPortal;
})(Animate || (Animate = {}));
var Animate;
(function (Animate) {
    /**
    * A node used to ghost - or act as a shortcut - for an existing node. This node is created when you hold shift and
    * move a node on the canvas. The ghost can then be as if it were the original node.
    */
    var BehaviourShortcut = (function (_super) {
        __extends(BehaviourShortcut, _super);
        /**
        * @param {Canvas} parent The parent canvas
        * @param {Behaviour} originalNode The original node we are copying from
        */
        function BehaviourShortcut(parent, originalNode, text) {
            // Call super-class constructor
            _super.call(this, parent, text);
            this.element.addClass("behaviour-shortcut");
            this._originalNode = originalNode;
            if (originalNode)
                this.setOriginalNode(originalNode, true);
        }
        BehaviourShortcut.prototype.setOriginalNode = function (originalNode, buildPortals) {
            this._originalNode = originalNode;
            if (originalNode instanceof Animate.BehaviourAsset)
                this.element.addClass("behaviour-asset");
            else if (originalNode instanceof Animate.BehaviourPortal)
                this.element.addClass("behaviour-portal");
            //Copy each of the portals 
            if (buildPortals) {
                for (var i = 0, l = originalNode.portals.length; i < l; i++)
                    this.addPortal(originalNode.portals[i].type, originalNode.portals[i].name, originalNode.portals[i].value, originalNode.portals[i].dataType, false);
            }
            this.updateDimensions();
        };
        /**
        * This will cleanup the component.
        */
        BehaviourShortcut.prototype.dispose = function () {
            this._originalNode = null;
            //Call super
            Animate.Behaviour.prototype.dispose.call(this);
        };
        Object.defineProperty(BehaviourShortcut.prototype, "originalNode", {
            get: function () { return this._originalNode; },
            enumerable: true,
            configurable: true
        });
        return BehaviourShortcut;
    })(Animate.Behaviour);
    Animate.BehaviourShortcut = BehaviourShortcut;
})(Animate || (Animate = {}));
var Animate;
(function (Animate) {
    var BehaviourAsset = (function (_super) {
        __extends(BehaviourAsset, _super);
        function BehaviourAsset(parent, text) {
            if (text === void 0) { text = "Asset"; }
            // Call super-class constructor
            _super.call(this, parent, text);
            //this.element.removeClass("behaviour");
            this.element.addClass("behaviour-asset");
            this._asset = null;
        }
        /**
        * Diposes and cleans up this component and all its child <Component>s
        */
        BehaviourAsset.prototype.dispose = function () {
            this._asset = null;
            //Call super
            _super.prototype.dispose.call(this);
        };
        /**
        * Adds a portal to this behaviour.
        * @param {PortalType} type The type of portal we are adding. It can be either PortalType.INPUT, PortalType.OUTPUT, Portal.PARAMETER & PortalType.PRODUCT
        * @param {string} name The unique name of the Portal
        * @param {any} value The default value of the Portal
        * @param {ParameterType} dataType The data type that the portal represents. See the default data types.
        * @returns {Portal} The portal that was added to this node
        */
        BehaviourAsset.prototype.addPortal = function (type, name, value, dataType) {
            var portal = Animate.Behaviour.prototype.addPortal.call(this, type, name, value, dataType);
            if (type == Animate.PortalType.PARAMETER) {
                var id = parseInt(value.selected);
                this._asset = Animate.User.get.project.getAssetByShallowId(id);
            }
            return portal;
        };
        Object.defineProperty(BehaviourAsset.prototype, "asset", {
            get: function () { return this._asset; },
            set: function (val) { this._asset = val; },
            enumerable: true,
            configurable: true
        });
        return BehaviourAsset;
    })(Animate.Behaviour);
    Animate.BehaviourAsset = BehaviourAsset;
})(Animate || (Animate = {}));
var Animate;
(function (Animate) {
    /**
    * A node for displaying comments
    */
    var BehaviourComment = (function (_super) {
        __extends(BehaviourComment, _super);
        function BehaviourComment(parent, text) {
            // Call super-class constructor
            _super.call(this, parent, text);
            this.canGhost = false;
            this.element
                .removeClass("reg-gradient")
                .addClass("behaviour-comment")
                .addClass("comment")
                .addClass("shadow-small");
            this.isInInputMode = false;
            this.stageClickProxy = jQuery.proxy(this.onStageClick, this);
            this.input = jQuery("<textarea rows='10' cols='30'></textarea>");
            this.textfield.element.css({ width: "95%", height: "95%", left: 0, top: 0 });
            this.textfield.element.text(text);
            this.element.on("mousedown", jQuery.proxy(this.onResizeStart, this));
            this.mStartX = null;
            this.mStartY = null;
            this.element.resizable({
                minHeight: 50,
                minWidth: 50,
                helper: "ui-resizable-helper",
                resize: jQuery.proxy(this.onResizeUpdate, this),
                stop: jQuery.proxy(this.onResizeStop, this)
            });
        }
        /** Does nothing...*/
        BehaviourComment.prototype.updateDimensions = function () {
            return;
        };
        /** When the mouse enters the behaviour*/
        BehaviourComment.prototype.onIn = function (e) {
            this.element.css("opacity", 1);
        };
        /**
        * A shortcut for jQuery's css property.
        */
        BehaviourComment.prototype.css = function (propertyName, value) {
            //Call super
            var toRet = _super.prototype.css.call(this, propertyName, value);
            return toRet;
        };
        /** When the mouse enters the behaviour*/
        BehaviourComment.prototype.onOut = function (e) {
            this.element.css("opacity", 0.3);
        };
        /** When the resize starts.*/
        BehaviourComment.prototype.onResizeStart = function (event, ui) {
            this.mStartX = this.element.css("left");
            this.mStartY = this.element.css("top");
            this.mOffsetX = this.element.offset().left;
            this.mOffsetY = this.element.offset().top;
        };
        /** When the resize updates.*/
        BehaviourComment.prototype.onResizeUpdate = function (event, ui) {
            this.element.css({ left: this.mStartX, top: this.mStartY });
            var helper = jQuery(ui.helper);
            helper.css({ left: this.mOffsetX, top: this.mOffsetY });
        };
        /** When the resize stops.*/
        BehaviourComment.prototype.onResizeStop = function (event, ui) {
            this.onStageClick(null);
            this.element.css({ left: this.mStartX, top: this.mStartY });
        };
        /** Call this to allow for text editing in the comment.*/
        BehaviourComment.prototype.enterText = function () {
            if (this.isInInputMode)
                return false;
            this.input.data("dragEnabled", false);
            jQuery("body").on("click", this.stageClickProxy);
            this.isInInputMode = true;
            this.input.css({ width: this.textfield.element.width(), height: this.textfield.element.height() });
            jQuery("body").append(this.input);
            this.input.css({
                position: "absolute", left: this.element.offset().left + "px",
                top: this.element.offset().top + "px", width: this.element.width() + "px",
                height: this.element.height() + "px", "z-index": 9999
            });
            this.textfield.element.detach();
            this.input.val(this.textfield.element.text());
            this.input.focus();
            this.input.select();
        };
        /** When we click on the stage we go out of edit mode.*/
        BehaviourComment.prototype.onStageClick = function (e) {
            if (this.isInInputMode == false)
                return;
            if (e != null && jQuery(e.target).is(this.input))
                return;
            this.isInInputMode = false;
            jQuery("body").off("click", this.stageClickProxy);
            this.element.css({ width: this.input.width() + "px", height: this.input.height() + "px" });
            this.input.detach();
            this.element.append(this.textfield.element);
            this.input.data("dragEnabled", true);
            this.text = this.input.val();
            //this.textfield.element.text( this.input.val() );
            this.textfield.element.css({ width: "95%", height: "95%", top: 0, left: 0 });
        };
        /**This will cleanup the component.*/
        BehaviourComment.prototype.dispose = function () {
            jQuery("body").off("click", this.stageClickProxy);
            this.input.remove();
            this.stageClickProxy = null;
            this.isInInputMode = null;
            //Call super
            _super.prototype.dispose.call(this);
        };
        return BehaviourComment;
    })(Animate.Behaviour);
    Animate.BehaviourComment = BehaviourComment;
})(Animate || (Animate = {}));
var Animate;
(function (Animate) {
    var BehaviourPickerEvents = (function (_super) {
        __extends(BehaviourPickerEvents, _super);
        function BehaviourPickerEvents(v) {
            _super.call(this, v);
        }
        BehaviourPickerEvents.BEHAVIOUR_PICKED = new BehaviourPickerEvents("behaviour_picker_picked");
        return BehaviourPickerEvents;
    })(Animate.ENUM);
    Animate.BehaviourPickerEvents = BehaviourPickerEvents;
    var BehaviourPickerEvent = (function (_super) {
        __extends(BehaviourPickerEvent, _super);
        function BehaviourPickerEvent(eventName, behaviourName) {
            _super.call(this, eventName, behaviourName);
            this.behaviourName = behaviourName;
        }
        return BehaviourPickerEvent;
    })(Animate.Event);
    Animate.BehaviourPickerEvent = BehaviourPickerEvent;
    var BehaviourPicker = (function (_super) {
        __extends(BehaviourPicker, _super);
        function BehaviourPicker() {
            if (BehaviourPicker._singleton != null)
                throw new Error("The BehaviourPicker class is a singleton. You need to call the BehaviourPicker.get() function.");
            BehaviourPicker._singleton = this;
            // Call super-class constructor
            _super.call(this, 200, 250);
            this.element.addClass("reg-gradient");
            this.element.addClass("behaviour-picker");
            this._input = new Animate.InputBox(this, "Behaviour Name");
            this._list = new Animate.List(this);
            this._X = 0;
            this._Y = 0;
            //Hook listeners
            this._list.selectBox.element.on("click", this.onListClick.bind(this));
            this._list.selectBox.element.on("dblclick", this.onListDClick.bind(this));
            this._input.textfield.element.on("keyup", this.onKeyDown.bind(this));
        }
        /**
        * Shows the window by adding it to a parent.
        * @param {Component} parent The parent Component we are adding this window to
        * @param {number} x The x coordinate of the window
        * @param {number} y The y coordinate of the window
        * @param {boolean} isModal Does this window block all other user operations?
        * @param {boolean} isPopup If the window is popup it will close whenever anything outside the window is clicked
        */
        BehaviourPicker.prototype.show = function (parent, x, y, isModal, isPopup) {
            if (parent === void 0) { parent = null; }
            if (x === void 0) { x = 0; }
            if (y === void 0) { y = 0; }
            if (isModal === void 0) { isModal = false; }
            if (isPopup === void 0) { isPopup = false; }
            this._list.sort();
            if (y + this.element.height() > jQuery("body").height())
                y = jQuery("body").height() - this.element.height();
            if (x + this.element.width() > jQuery("body").width())
                x = jQuery("body").width() - this.element.width();
            _super.prototype.show.call(this, parent, x, y, isModal, isPopup);
            this._input.focus(true);
        };
        /**
        * Called when we click the list.
        * @param {any} e
        * @returns {any}
        */
        BehaviourPicker.prototype.onListClick = function (e) {
            this._input.text = this._list.selectedItem;
        };
        /**
        * Called when we double click the list.
        * @param {any} e
        * @returns {any}
        */
        BehaviourPicker.prototype.onListDClick = function (e) {
            this.dispatchEvent(new BehaviourPickerEvent(BehaviourPickerEvents.BEHAVIOUR_PICKED, this._list.selectedItem));
            this.hide();
        };
        /**
        * When the input text changes we go through each list item
        * and select it.
        * @param {any} e
        * @returns {any}
        */
        BehaviourPicker.prototype.onKeyDown = function (e) {
            //Check for up and down keys
            if (e.keyCode == 38 || e.keyCode == 40) {
                e.preventDefault();
                //Get the selected item and move it up and down
                var selected = this._list.selectedIndex;
                if (selected != -1) {
                    var items = this._list.numItems();
                    //If up
                    if (e.keyCode == 38) {
                        if (selected - 1 < 0)
                            this._list.selectedIndex = items - 1;
                        else
                            this._list.selectedIndex = selected - 1;
                    }
                    else {
                        if (selected + 1 < items)
                            this._list.selectedIndex = selected + 1;
                        else
                            this._list.selectedIndex = 0;
                    }
                    this._input.text = this._list.selectedItem;
                }
                return;
            }
            //If enter is pressed we select the current item
            if (e.keyCode == 13) {
                this.dispatchEvent(new BehaviourPickerEvent(BehaviourPickerEvents.BEHAVIOUR_PICKED, this._list.selectedItem));
                this.hide();
            }
            var len = this._list.items.length;
            for (var i = 0; i < len; i++) {
                var v1 = this._list.items[i].text().toLowerCase();
                var v2 = this._input.text.toLowerCase();
                if (v1.indexOf(v2) != -1) {
                    this._list.selectedItem = this._list.items[i].text();
                    return;
                }
            }
        };
        /**
        * Gets the singleton instance.
        * @returns {BehaviourPicker}
        */
        BehaviourPicker.getSingleton = function () {
            if (!BehaviourPicker._singleton)
                new BehaviourPicker();
            return BehaviourPicker._singleton;
        };
        Object.defineProperty(BehaviourPicker.prototype, "list", {
            get: function () { return this._list; },
            enumerable: true,
            configurable: true
        });
        return BehaviourPicker;
    })(Animate.Window);
    Animate.BehaviourPicker = BehaviourPicker;
})(Animate || (Animate = {}));
var Animate;
(function (Animate) {
    /**
    * A behaviour node that represents a Behaviour Container
    */
    var BehaviourInstance = (function (_super) {
        __extends(BehaviourInstance, _super);
        function BehaviourInstance(parent, behaviourContainer, createPotrals) {
            if (createPotrals === void 0) { createPotrals = true; }
            var text = (behaviourContainer.name !== undefined ? behaviourContainer.name : "Instance");
            this._behaviourContainer = behaviourContainer;
            // Call super-class constructor
            _super.call(this, parent, text);
            this.element.addClass("behaviour-instance");
            if (createPotrals) {
                //Now that its created we need to create the starting portals. If the canvas exists we use that as a 
                //reference, otherwise we use the json
                if (this._behaviourContainer.canvas) {
                    var children = this._behaviourContainer.canvas.children;
                    var ci = children.length;
                    while (ci--)
                        if (children[ci] instanceof Animate.BehaviourPortal) {
                            var portals = children[ci].portals;
                            var ii = portals.length;
                            while (ii--)
                                this.addPortal(children[ci].portaltype, portals[ii].name, portals[ii].value, portals[ii].dataType, false);
                        }
                }
                else if (this._behaviourContainer.json != null) {
                    //Parse the saved object and get the portal data
                    var jsonObj = this._behaviourContainer.json;
                    if (jsonObj && jsonObj.items) {
                        for (var i in jsonObj.items) {
                            var item = null;
                            //Create the portals only if its a Behaviour portal
                            if (jsonObj.items[i].type == "BehaviourPortal") {
                                this.addPortal(jsonObj.items[i].portalType, jsonObj.items[i].name, jsonObj.items[i].value, jsonObj.items[i].dataType, false);
                            }
                        }
                    }
                }
            }
            this.updateDimensions();
            Animate.PluginManager.getSingleton().on(Animate.EditorEvents.PORTAL_ADDED, this.onPortalChanged, this);
            Animate.PluginManager.getSingleton().on(Animate.EditorEvents.PORTAL_REMOVED, this.onPortalChanged, this);
            Animate.PluginManager.getSingleton().on(Animate.EditorEvents.PORTAL_EDITED, this.onPortalChanged, this);
            Animate.PluginManager.getSingleton().on(Animate.EditorEvents.CONTAINER_DELETED, this.onContainerDeleted, this);
        }
        /**
        * Called when a behaviour is disposed
        */
        BehaviourInstance.prototype.onContainerDeleted = function (response, event) {
            if (event.container.name == this._behaviourContainer.name) {
                var parent = this.element.parent().data("component");
                if (parent && parent.removeItem)
                    parent.removeItem(this);
            }
        };
        /**
        * This is called when a Canvas reports a portal being added, removed or modified.
        */
        BehaviourInstance.prototype.onPortalChanged = function (response, event) {
            var curParent = this.element.parent();
            if (response == Animate.EditorEvents.PORTAL_ADDED) {
                jQuery("body").append(this.element); //We need this for size calculations
                var type = null;
                if (event.portal.type == Animate.PortalType.INPUT)
                    type = Animate.PortalType.OUTPUT;
                else if (event.portal.type == Animate.PortalType.OUTPUT)
                    type = Animate.PortalType.INPUT;
                else if (event.portal.type == Animate.PortalType.PARAMETER)
                    type = Animate.PortalType.PRODUCT;
                else if (event.portal.type == Animate.PortalType.PRODUCT)
                    type = Animate.PortalType.PARAMETER;
                if (event.container.name == this._behaviourContainer.name)
                    this.addPortal(type, event.portal.name, event.portal.value, event.portal.dataType, true);
            }
            else if (response == Animate.EditorEvents.PORTAL_REMOVED) {
                var i = this.portals.length;
                while (i--) {
                    if (this.portals[i].name == event.portal.name) {
                        this.removePortal(this.portals[i], true);
                        break;
                    }
                }
            }
            else if (response == Animate.EditorEvents.PORTAL_EDITED) {
                var i = this.portals.length;
                while (i--) {
                    if (this.portals[i].name == event.oldName) {
                        var portal = this.portals[i];
                        portal.edit(event.portal.name, portal.type, event.portal.value, event.portal.dataType);
                        break;
                    }
                }
            }
            jQuery("body").append(this.element); //We need this for size calculations	
            this.updateDimensions();
            curParent.append(this.element);
        };
        /**
        * Diposes and cleans up this component and all its child Components
        */
        BehaviourInstance.prototype.dispose = function () {
            Animate.PluginManager.getSingleton().off(Animate.EditorEvents.PORTAL_ADDED, this.onPortalChanged, this);
            Animate.PluginManager.getSingleton().off(Animate.EditorEvents.PORTAL_REMOVED, this.onPortalChanged, this);
            Animate.PluginManager.getSingleton().off(Animate.EditorEvents.PORTAL_EDITED, this.onPortalChanged, this);
            Animate.PluginManager.getSingleton().off(Animate.EditorEvents.CONTAINER_DELETED, this.onContainerDeleted, this);
            this._behaviourContainer = null;
            //Call super
            _super.prototype.dispose.call(this);
        };
        Object.defineProperty(BehaviourInstance.prototype, "behaviourContainer", {
            get: function () { return this._behaviourContainer; },
            enumerable: true,
            configurable: true
        });
        return BehaviourInstance;
    })(Animate.Behaviour);
    Animate.BehaviourInstance = BehaviourInstance;
})(Animate || (Animate = {}));
var Animate;
(function (Animate) {
    /**
    * A behaviour node that acts as a script. Users can create custom JS within the body. These nodes are connected to
    * database entries and so need to be cleaned up properly when modified by the user.
    */
    var BehaviourScript = (function (_super) {
        __extends(BehaviourScript, _super);
        function BehaviourScript(parent, shallowId, text, copied) {
            if (text === void 0) { text = "Script"; }
            if (copied === void 0) { copied = false; }
            // Call super-class constructor
            _super.call(this, parent, text);
            var behaviour = this;
            var element = this.element;
            var plan = Animate.User.get.meta.plan;
            this.scriptTab = null;
            this.shallowId = shallowId;
            if (plan.toString() != Animate.DB.PLAN_FREE)
                element.addClass("behaviour-script");
            else {
                element.addClass("behaviour-bad");
                this.tooltip = "Script will not be exported. You need to upgrade your account for this feature.";
            }
            //If this was copied we need to make a duplicate in the database and use that
            if (shallowId !== 0 && copied) {
                var that = this;
                var behaviour = this;
                //try to create the database entry of this node
                var loader = new Animate.AnimateLoader();
                loader.on(Animate.LoaderEvents.COMPLETE, onServer);
                loader.on(Animate.LoaderEvents.FAILED, onServer);
                loader.load("/project/copy-script", { projectId: Animate.User.get.project.entry._id, originalId: shallowId, shallowId: behaviour.shallowId });
                //When we have copied the script
                function onServer(response, event) {
                    loader = null;
                    if (response == Animate.LoaderEvents.COMPLETE) {
                        if (event.return_type == Animate.AnimateLoaderResponses.ERROR) {
                            Animate.MessageBox.show(event.message, Array("Ok"), null, null);
                            return;
                        }
                        that.shallowId = event.data.shallowId;
                    }
                }
            }
            else if (shallowId === 0)
                this.initializeDB();
        }
        /**
        * Called when the behaviour is renamed
        * @param <string> name The new name of the behaviour
        */
        BehaviourScript.prototype.onRenamed = function (name) {
            if (this.scriptTab)
                this.scriptTab.rename(name);
        };
        /**
        * Called when the behaviour is about to be deleted
        */
        BehaviourScript.prototype.onDelete = function () {
            if (this.scriptTab) {
                this.scriptTab.saved = true;
                Animate.CanvasTab.getSingleton().removeTab(this.scriptTab, true);
            }
            var behaviour = this;
            if (this.shallowId === 0)
                return;
            //try to create the database entry of this node
            var loader = new Animate.AnimateLoader();
            loader.on(Animate.LoaderEvents.COMPLETE, onServer);
            loader.on(Animate.LoaderEvents.FAILED, onServer);
            loader.load("/project/delete-scripts", { projectId: Animate.User.get.project.entry._id, ids: [this.shallowId] });
            //When we 
            function onServer(response, event) {
                loader = null;
                if (response == Animate.LoaderEvents.COMPLETE) {
                    if (event.return_type == Animate.AnimateLoaderResponses.ERROR) {
                        Animate.MessageBox.show(event.message, Array("Ok"), null, null);
                        return;
                    }
                }
            }
        };
        /**
        * this function is called when a container is getting saved. It basically initializes the node in the database.
        */
        BehaviourScript.prototype.initializeDB = function (onComplete) {
            var behaviour = this;
            if (behaviour.shallowId !== 0)
                return;
            var that = this;
            //try to create the database entry of this node
            var loader = new Animate.AnimateLoader();
            loader.on(Animate.LoaderEvents.COMPLETE, onServer);
            loader.on(Animate.LoaderEvents.FAILED, onServer);
            loader.load("/project/initialize-behaviour-script", { projectId: Animate.User.get.project.entry._id, containerId: this.parent.behaviourContainer.shallowId, behaviourId: behaviour.id });
            //When we 
            function onServer(response, event, sender) {
                loader = null;
                if (response == Animate.LoaderEvents.COMPLETE) {
                    if (event.return_type == Animate.AnimateLoaderResponses.ERROR) {
                        Animate.MessageBox.show(event.message, Array("Ok"), null, null);
                        if (onComplete)
                            onComplete(false);
                        return;
                    }
                    that.shallowId = event.data.shallowId;
                    if (onComplete)
                        onComplete(true);
                }
            }
        };
        /**
        * This function will open a script tab
        */
        BehaviourScript.prototype.edit = function () {
            if (this.shallowId === 0)
                this.initializeDB();
            var tabName = this.id + " - " + this.alias;
            if (Animate.CanvasTab.getSingleton().getTab(tabName))
                return Animate.CanvasTab.getSingleton().selectTab(Animate.CanvasTab.getSingleton().getTab(tabName));
            if (Animate.CanvasTab.getSingleton().getTab("*" + tabName))
                return Animate.CanvasTab.getSingleton().selectTab(Animate.CanvasTab.getSingleton().getTab("*" + tabName));
            this.scriptTab = Animate.CanvasTab.getSingleton().addSpecialTab("", Animate.CanvasTabType.SCRIPT, this);
        };
        /**
        * Diposes and cleans up this component and all its child Components
        */
        BehaviourScript.prototype.dispose = function () {
            this.scriptTab = null;
            //Call super
            _super.prototype.dispose.call(this);
        };
        return BehaviourScript;
    })(Animate.Behaviour);
    Animate.BehaviourScript = BehaviourScript;
})(Animate || (Animate = {}));
var Animate;
(function (Animate) {
    /**
    * Use this form to set the project meta and update build versions.
    */
    var UserPreferences = (function (_super) {
        __extends(UserPreferences, _super);
        function UserPreferences(name) {
            _super.call(this, null, null);
            this._name = name;
            var group = new Animate.Group("Details", this);
            this.username = new Animate.LabelVal(group.content, "Username: ", new Animate.Label("", null));
            this.username.val.textfield.element.css({ "text-align": "left" });
            this.joined = new Animate.LabelVal(group.content, "Joined On: ", new Animate.Label("", null));
            this.joined.val.textfield.element.css({ "text-align": "left" });
            //Image
            group = new Animate.Group("Avatar", this);
            this.imgPreview = group.content.addChild("<div class='preview'></div>");
            this.userImgButton = group.content.addChild("<div class='tool-bar-group'><div class='toolbar-button tooltip'><div><img src='media/add-asset.png' /></div><div class='tooltip-text'>Add</div></div></div>");
            group.content.addChild("<div class='fix'></div>");
            var info = new Animate.Label("Use this button to upload your avatar picture.", group.content);
            info.element.addClass("info");
            //Notes
            group = new Animate.Group("User information", this);
            this.bio = new Animate.LabelVal(group.content, "Bio", new Animate.InputBox(null, "Bio", true));
            this.bio.val.textfield.element.css({ height: "80px" });
            info = new Animate.Label("Use the above pad to write about yourself. This will show up on Webinate next to your projects.", group.content);
            info.element.addClass("info");
            this.bio.val.limitCharacters = 2048;
            //save button
            this.saveDetails = new Animate.Button("Save", group.content);
            this.saveDetails.css("height", "30px");
            this.avatarUploader = null;
            this.submitProxy = this.onSubmit.bind(this);
            this.progressProxy = this.onProgress.bind(this);
            this.completeProxy = this.onUploadComplete.bind(this);
            this.errorProxy = this.onError.bind(this);
            this.saveDetails.element.on("click", jQuery.proxy(this.onClick, this));
        }
        /**
        * When we click a button
        */
        UserPreferences.prototype.onClick = function (e) {
            var comp = jQuery(e.currentTarget).data("component");
            var user = Animate.User.get;
            if (comp == this.saveDetails) {
                //Check for special chars
                this.bio.val.textfield.element.removeClass("red-border");
                var message = Animate.Utils.checkForSpecialChars(this.bio.val.text);
                if (message != null) {
                    this.bio.val.textfield.element.addClass("red-border");
                    //BuildOptionsForm.getSingleton().message( message, true );
                    return;
                }
                user.on(Animate.UserEvents.DETAILS_SAVED, this.onServer, this);
                user.on(Animate.UserEvents.FAILED, this.onServer, this);
                user.updateDetails(this.bio.val.text);
            }
        };
        /**
        * When we receive a server command
        */
        UserPreferences.prototype.onServer = function (event, e) {
            var user = Animate.User.get;
            user.off(Animate.UserEvents.FAILED, this.onServer, this);
            if (e.return_type == Animate.AnimateLoaderResponses.ERROR) {
                //BuildOptionsForm.getSingleton().message( e.tag.message, true );
                return;
            }
            if (event == Animate.UserEvents.DETAILS_SAVED) {
                user.off(Animate.UserEvents.DETAILS_SAVED, this.onServer, this);
                //BuildOptionsForm.getSingleton().message(e.tag.message, false);
                user.meta.bio = e.tag.bio;
            }
            //else
            //BuildOptionsForm.getSingleton().message( e.tag.message, true );
        };
        /**
        * Called when the tab page is clicked
        */
        UserPreferences.prototype.onTab = function () {
            if (!this.parent)
                return;
            if (!this.avatarUploader) {
                this.avatarUploader = new qq.FileUploaderBasic({
                    button: document.getElementById(this.userImgButton.id),
                    action: Animate.DB.HOST + "/file/upload-user-avatar",
                    onSubmit: this.submitProxy,
                    onComplete: this.completeProxy,
                    onProgress: this.progressProxy,
                    onError: this.errorProxy,
                    demoMode: false
                });
                this.avatarUploader._options.allowedExtensions.push("jpg", "png", "jpeg");
            }
        };
        /**
        * When the settings page is shown.
        * @param <Project> project The project of this session
        * @param <User> user The user of this session
        */
        UserPreferences.prototype.onShow = function (project, user) {
            this.bio.val.textfield.element.removeClass("red-border");
            this.username.val.text = user.username;
            this.joined.val.text = new Date(user.createdOn).toDateString();
            this.bio.val.text = user.bio;
            this.imgPreview.element.html((user.imgURL != "" ? "<img src='" + user.imgURL + "'/>" : ""));
        };
        /**
        * Fired when the upload is complete
        */
        UserPreferences.prototype.onUploadComplete = function (id, fileName, response) {
            if (Animate.AnimateLoaderResponses.fromString(response.return_type) == Animate.AnimateLoaderResponses.SUCCESS) {
                this.userImgButton.enabled = true;
                //BuildOptionsForm.getSingleton().message( response.message, false );
                Animate.User.get.meta.image = response.imageUrl;
                this.imgPreview.element.html((response.imageUrl != "" ? "<img src='" + response.imageUrl + "'/>" : ""));
            }
            else {
                //BuildOptionsForm.getSingleton().message( response.message, true );
                this.userImgButton.enabled = true;
            }
        };
        /**
        * Fired when the upload is cancelled due to an error
        */
        UserPreferences.prototype.onError = function (id, fileName, reason) {
            //BuildOptionsForm.getSingleton().message( "Error Uploading File.", true );
            this.userImgButton.enabled = true;
        };
        /**
        * When we receive a progress event
        */
        UserPreferences.prototype.onProgress = function (id, fileName, loaded, total) {
            //BuildOptionsForm.getSingleton().message( 'Uploading...' + ( ( loaded / total ) * 100 ), false );
        };
        /**
        * When we click submit on the upload button
        */
        UserPreferences.prototype.onSubmit = function (file, ext) {
            var fExt = ext.split(".");
            fExt = fExt[fExt.length - 1];
            fExt.toLowerCase();
            if (fExt != "png" && fExt != "jpeg" && fExt != "jpg") {
                // check for valid file extension
                //BuildOptionsForm.getSingleton().message( 'Only png, jpg and jpeg files are allowed', true );
                return false;
            }
            //BuildOptionsForm.getSingleton().message( 'Uploading...', false );
            this.userImgButton.enabled = false;
        };
        Object.defineProperty(UserPreferences.prototype, "name", {
            get: function () { return this._name; },
            set: function (value) { this._name = value; },
            enumerable: true,
            configurable: true
        });
        return UserPreferences;
    })(Animate.Component);
    Animate.UserPreferences = UserPreferences;
})(Animate || (Animate = {}));
var Animate;
(function (Animate) {
    var PluginBrowserEvents = (function (_super) {
        __extends(PluginBrowserEvents, _super);
        function PluginBrowserEvents(v) {
            _super.call(this, v);
        }
        PluginBrowserEvents.UPDATED = new PluginBrowserEvents("plugin_browser_updated");
        PluginBrowserEvents.PLUGINS_IMPLEMENTED = new PluginBrowserEvents("plugin_browser_implemented");
        PluginBrowserEvents.FAILED = new PluginBrowserEvents("plugin_browser_failed");
        return PluginBrowserEvents;
    })(Animate.ENUM);
    Animate.PluginBrowserEvents = PluginBrowserEvents;
    var PluginBrowserEvent = (function (_super) {
        __extends(PluginBrowserEvent, _super);
        function PluginBrowserEvent(eventName, message, data) {
            _super.call(this, eventName, data);
            this.message = message;
            this.data = data;
        }
        return PluginBrowserEvent;
    })(Animate.Event);
    Animate.PluginBrowserEvent = PluginBrowserEvent;
    /**
    * A small class for browsing the available plugins
    */
    var PluginBrowser = (function (_super) {
        __extends(PluginBrowser, _super);
        /**
        * @param {Component} parent The parent of the button
        */
        function PluginBrowser(parent) {
            // Call super-class constructor
            _super.call(this, "<div class='project-explorer'></div>", parent);
            //Create left and right panels
            var leftComp = this.addChild("<div class='project-explorer-section project-explorer-left'></div>");
            var rightComp = this.addChild("<div class='project-explorer-section project-explorer-right'></div>");
            this.element.append("<div class='fix'></div>");
            this.leftTop = leftComp.addChild("<div></div>");
            this.pluginList = leftComp.addChild("<div class='plugin-list'></div>");
            var pluginHelp = leftComp.addChild("<div class='plugin-help'></div>");
            var comp = new Animate.Label("Plugin Description", pluginHelp);
            comp.element.addClass("heading");
            this.help = pluginHelp.addChild("<div class='info-clock'></div>");
            //Heading - right
            var comp = new Animate.Label("Add Plugins", rightComp);
            comp.element.addClass("heading");
            comp.textfield.element.prepend("<img src='media/add-behaviour.png' />");
            this.projectNext = new Animate.Button("Done", rightComp);
            this.projectNext.css({ width: 120, height: 40, "float": "right", position: "absolute", left: "265px", top: "4px" });
            this.projectNext.element.on("click", jQuery.proxy(this.onNextClick, this));
            var newPlugs = rightComp.addChild("<div class='new-plugins'></div>");
            var newPlugsHeader = newPlugs.addChild("<div class='new-plugins-header'></div>");
            this.newPlugsLower = newPlugs.addChild("<div class='new-plugins-lower'></div>");
            //newPlugsHeader.element.disableSelection( true );
            newPlugsHeader.addChild("<div class='filter-item' style='pointer-events:none;'>Filters</div>");
            this.selectedFilter = newPlugsHeader.addChild("<div class='filter-item filter-item-selected'>Name</div>").element;
            newPlugsHeader.addChild("<div class='filter-item'>version</div>");
            newPlugsHeader.addChild("<div class='filter-item'>Author</div>");
            newPlugsHeader.element.on("click", jQuery.proxy(this.onFilterClick, this));
            //Server related
            //this.mServerProxy = this.onServer.bind( this );
            this.mRequest = "";
        }
        /**
        * When we click a filter button
        * @param {any} e The jQuery event object
        */
        PluginBrowser.prototype.onFilterClick = function (e) {
            var t = jQuery(e.target);
            if (!t.hasClass("filter-item"))
                return;
            if (this.selectedFilter != null)
                this.selectedFilter.removeClass("filter-item-selected");
            this.selectedFilter = t;
            this.selectedFilter.addClass("filter-item-selected");
            //Now create each of the plugin items for the actual plugins we can load.
            this.resetAvailablePlugins();
        };
        /**
        * Resets the component and its data
        */
        PluginBrowser.prototype.reset = function () {
            this.leftTop.clear();
            this.leftTop.addChild("<div><div class='proj-info-left'><img src='media/project-item.png'/></div>" +
                "<div class='proj-info-right'>" +
                "<div class='name'>Name: " + Animate.User.get.project.entry.name + "</div>" +
                "<div class='owner'>User: " + Animate.User.get.userEntry.username + "</div>" +
                "<div class='created-by'>Last Updated: " + new Date(Animate.User.get.project.entry.lastModified).toDateString() + "</div>" +
                "</div></div><div class='fix'></div>");
            this.pluginList.clear();
            var comp = new Animate.Label("Project Plugins", this.pluginList);
            comp.element.addClass("heading");
            comp.element.css({ "pointer-events": "none" });
            var plugins = Animate.User.get.project.plugins;
            var user = Animate.User.get;
            //Create each of the plugin items that the user has set
            for (var i = 0, l = plugins.length; i < l; i++) {
                if (plugins[i].plan <= user.meta.plan)
                    this.addProjectPluginComp(plugins[i]);
            }
            //Now create each of the plugin items for the actual plugins we can load.
            this.resetAvailablePlugins();
        };
        /**
        * Adds a plugin component
        * @param {IPlugin} plugin
        */
        PluginBrowser.prototype.addProjectPluginComp = function (plugin) {
            var item = this.pluginList.addChild("<div class='plugin-item'><div class='inner'><img src='" + plugin.image + "'>" + plugin.name + "</div><div class='close-but'>X</div><div class='fix'></div></div>");
            item.element.insertAfter(jQuery(".heading", this.pluginList.element));
            item.element.on("mouseover", jQuery.proxy(this.onOverProject, this));
            item.element.data("plugin", plugin);
            //item.element.disableSelection( true );
            jQuery(".close-but", item.element).click(jQuery.proxy(this.onRemoveProject, this));
            var alreadyHasPlugin = false;
            //Remove any duplicates
            var userPlugins = Animate.User.get.project.plugins;
            if (userPlugins.indexOf(plugin) == -1)
                Animate.User.get.project.plugins.push(plugin);
            return item;
        };
        /**
        * Resets the component and fills it with user plugin data
        */
        PluginBrowser.prototype.resetAvailablePlugins = function () {
            var userPlugins = Animate.User.get.project.plugins;
            this.projectNext.enabled = true;
            this.newPlugsLower.clear();
            var selectedFilter = this.selectedFilter;
            // TODO : Figure out if we're keeping this
            ////Sort based on the filter
            //         __plugins.sort(function (a: Engine.IPlugin, b: Engine.IPlugin )
            //{
            //	var nameA = a.name.toLowerCase();
            //	var nameB = b.name.toLowerCase();
            //	if ( selectedFilter.text() == "Name" )
            //	{
            //		nameA = a.name.toLowerCase();
            //		nameB = b.name.toLowerCase();
            //	}
            //	else if ( selectedFilter.text() == "Version" )
            //	{
            //		nameA = a.version.toLowerCase();
            //		nameB = b.version.toLowerCase();
            //	}
            //	else if ( selectedFilter.text() == "Author" )
            //	{
            //		nameA = a.author.toLowerCase();
            //		nameB = b.author.toLowerCase();
            //	}
            //	if ( nameA < nameB ) //sort string ascending
            //		return -1;
            //	if ( nameA > nameB )
            //		return 1;
            //	return 0; 
            //});
            //         var userPlan: UserPlan = User.get.meta.plan;
            //var len : number = __plugins.length;
            //for ( var i = 0; i < len; i++ )
            //{
            //             //Only allow plugins based on your plan.
            //             // TODO: Only show plugins that are allowed
            //             //if (userPlan != UserPlan.Gold && userPlan != UserPlan.Platinum && __plugins[i].plan == userPlan )
            //	//	continue;
            //	var alreadyAdded : boolean = false;
            //	var ii : number = ( userPlugins ? userPlugins.length : 0 );
            //	while ( ii-- )
            //		if ( userPlugins[ii].name == __plugins[i].name )
            //		{
            //			alreadyAdded = true;
            //			break;
            //		}
            //	if ( alreadyAdded )
            //		continue;
            //var item : Component = <Component>this.newPlugsLower.addChild( "<div class='plugin-item'>" +
            //	"<div class='inner'><div class='left'><img src='" + __plugins[i].image + "' /></div>" +
            //	"<div class='right'>" +
            //	"<div class='name'>" + __plugins[i].name + "</div>" +
            //	"<div class='owner'>Created by " + __plugins[i].author + "</div>" +
            //	"<div class='created-by'>Version: " + __plugins[i].version + "</div>" +
            //                //"<div class='desc'>" + __plugins[i].shortDescription + "</div>" +
            //                "<div class='desc'>" + __plugins[i].description + "</div>" +
            //	"</div>" +
            //	"<div class='fix'></div></div><div class='fix'></div>" );
            // item.element.on( "mouseover", jQuery.proxy( this.onOverProject, this ) );
            // item.element.on( "click", jQuery.proxy( this.onClickProject, this ) );
            // item.element.data( "plugin", __plugins[i] );
            //item.element.disableSelection( true );
            // }
        };
        /**
        * When we hover over a project
        * @param {any} e The jQuery event object
        */
        PluginBrowser.prototype.onOverProject = function (e) {
            var plugin = jQuery(e.currentTarget).data("plugin");
            if (plugin)
                this.help.element.html(plugin.description);
        };
        /**
        * When we click the X on a project's plugin
        * @param {any} e The jQuery event object
        */
        PluginBrowser.prototype.onRemoveProject = function (e) {
            var comp = jQuery(e.currentTarget).parent().data("component");
            var parent = this.pluginList;
            var plugin = comp.element.data("plugin");
            var userPlugins = Animate.User.get.project.plugins;
            var i = userPlugins.length;
            while (i--)
                if (userPlugins[i].name == plugin.name) {
                    userPlugins.splice(i, 1);
                    break;
                }
            //Remove left item
            comp.element.fadeOut("slow", function () {
                parent.removeChild(comp);
                comp.dispose();
            });
            //Reset the available plugins
            var browser = this;
            this.newPlugsLower.element.fadeOut("slow", function () {
                browser.resetAvailablePlugins();
                browser.newPlugsLower.element.fadeIn("slow");
            });
        };
        /**
        * When we click on a projects plugin
        * @param {any} e The jQuery event object
        */
        PluginBrowser.prototype.onClickProject = function (e) {
            var parent = this.newPlugsLower;
            var comp = jQuery(e.currentTarget).data("component");
            var plugin = jQuery(e.currentTarget).data("plugin");
            if (plugin) {
                var addedComp = this.addProjectPluginComp(plugin);
                addedComp.element.hide();
                addedComp.element.fadeIn("slow");
                comp.element.css("pointer-events", "none");
                comp.element.fadeOut("slow", function () { parent.removeChild(comp).dispose(); });
            }
        };
        /**
        * When we click the next button
        * @param {any} e The jQuery event object
        */
        PluginBrowser.prototype.onNextClick = function (e) {
            var userPlugins = Animate.User.get.project.plugins;
            if (userPlugins.length == 0) {
                Animate.MessageBox.show("You must select at least 1 plugin before you can continue.", ["Ok"], null, null);
                return;
            }
            this.projectNext.enabled = false;
            //Implement changes into DB
            var projectStr = "";
            var data = {};
            data["projectId"] = Animate.User.get.project.entry._id;
            var plugins = [];
            //Create a multidimension array and pass each of the plugins in
            for (var i = 0, l = userPlugins.length; i < l; i++)
                plugins[i] = userPlugins[i]._id;
            data["plugins"] = plugins;
            var loader = new Animate.AnimateLoader();
            loader.on(Animate.LoaderEvents.COMPLETE, this.onServer, this);
            loader.on(Animate.LoaderEvents.FAILED, this.onServer, this);
            loader.load("/project/implement-plugins", data);
        };
        /**
        * This is the resonse from the server
        */
        PluginBrowser.prototype.onServer = function (response, event, sender) {
            var loader = sender;
            if (response == Animate.LoaderEvents.COMPLETE) {
                if (loader.url == "/project/implement-plugins") {
                    if (event.return_type == Animate.AnimateLoaderResponses.ERROR) {
                        this.dispatchEvent(new PluginBrowserEvent(PluginBrowserEvents.FAILED, event.message, event.tag));
                        Animate.MessageBox.show(event.message, ["Ok"], null, null);
                        this.projectNext.enabled = true;
                    }
                    else {
                        //Say we're good to go!
                        this.dispatchEvent(new PluginBrowserEvent(PluginBrowserEvents.PLUGINS_IMPLEMENTED, event.message, event.tag));
                    }
                }
            }
            else {
                //Failed - so we don't show anything
                this.dispatchEvent(new PluginBrowserEvent(PluginBrowserEvents.FAILED, event.message, event.tag));
                this.projectNext.enabled = true;
            }
        };
        return PluginBrowser;
    })(Animate.Component);
    Animate.PluginBrowser = PluginBrowser;
})(Animate || (Animate = {}));
var Animate;
(function (Animate) {
    var ProjectLoaderEvents = (function (_super) {
        __extends(ProjectLoaderEvents, _super);
        function ProjectLoaderEvents(v) {
            _super.call(this, v);
        }
        ProjectLoaderEvents.READY = new ProjectLoaderEvents("project_loader_ready");
        ProjectLoaderEvents.FAILED = new ProjectLoaderEvents("project_loader_failed");
        return ProjectLoaderEvents;
    })(Animate.ENUM);
    Animate.ProjectLoaderEvents = ProjectLoaderEvents;
    var ProjectLoaderEvent = (function (_super) {
        __extends(ProjectLoaderEvent, _super);
        function ProjectLoaderEvent(eventType, message) {
            _super.call(this, eventType, message);
            this.message = message;
        }
        ProjectLoaderEvent.READY = new ProjectLoaderEvents("ready");
        ProjectLoaderEvent.FAILED = new ProjectLoaderEvents("failed");
        return ProjectLoaderEvent;
    })(Animate.Event);
    Animate.ProjectLoaderEvent = ProjectLoaderEvent;
    /**
    * The Project loader is a small component that is used to show the downloading and loading
    * of projects/plugins into the current workspace.
    */
    var ProjectLoader = (function (_super) {
        __extends(ProjectLoader, _super);
        /**
        * @param {Component} parent The parent of the button
        */
        function ProjectLoader(parent) {
            _super.call(this, "<div class='project-loader'></div>", parent);
            this._buildEntries = [];
            //this._loaderProxy = jQuery.proxy(this.onData, this);
            this._reloadProxy = jQuery.proxy(this.onButtonClick, this);
            this._loadedCount = 0;
            this._errorOccured = false;
        }
        /** Use this function to get a list of the dependencies the project has associated with itself.*/
        ProjectLoader.prototype.updateDependencies = function () {
            //Add new entries
            var componentCounter = 0;
            var children = this.children;
            var i = children.length;
            while (i--) {
                children[i].element.off("click", this._reloadProxy);
                children[i].dispose();
            }
            var plugins = Animate.User.get.project.plugins;
            //Add the localally installed plugins
            for (var i = 0; i < plugins.length; i++) {
                var comp = new Animate.Component("<div class='build-entry'><img class='loader-cog-slow' src='media/cog-small-tiny.png' />" + plugins[i].name + "<span class='loading fade-animation'> - loading...</span></div>", this);
                this._buildEntries[componentCounter] = comp;
                // TODO: Figure out how to load a plugin?
                // comp.element.data("url", plugins[i].path);
                //comp.element.data( "css", plugins[i].css );
                var reloadButton = new Animate.Button("Reload", comp);
                reloadButton.css({ "margin": "5px 10px 0 0", "width": "50px", "height": "18px", "float": "right" });
                reloadButton.element.hide();
                reloadButton.element.on("click", this._reloadProxy);
                comp.element.data("button", reloadButton);
                componentCounter++;
            }
        };
        /** When we click a reload button we reload the build. */
        ProjectLoader.prototype.onButtonClick = function (e) {
            var comp = jQuery(e.currentTarget).data("component");
            var url = comp.element.parent().data("url");
            var loader = new Animate.AnimateLoader("");
            loader.on(Animate.LoaderEvents.COMPLETE, this.onData, this);
            loader.on(Animate.LoaderEvents.FAILED, this.onData, this);
            loader.dataType = "text";
            comp.element.parent().data("loader", loader);
            comp.enabled(false);
            jQuery(".loading", comp.element.parent()).show();
            loader.load(url, null, 1);
        };
        /** Gets the loader to load the individual projects. */
        ProjectLoader.prototype.startLoading = function () {
            this._loadedCount = 0;
            this._errorOccured = false;
            var manager = Animate.PluginManager.getSingleton();
            for (var i = 0; i < this._buildEntries.length; i++) {
                var url = this._buildEntries[i].element.data("url");
                var loader = new Animate.AnimateLoader("");
                this._buildEntries[i].element.data("loader", loader);
                //Check if we have already loaded this script before
                var ii = manager.loadedPlugins.length;
                var loadedScript = null;
                //while ( ii-- )
                //	if ( manager.loadedPlugins[ii].url == url )
                //	{
                //		loadedScript = manager.loadedPlugins[ii];
                //		break;
                //	}
                //If already loaded - just re-instanciate the plugin
                if (loadedScript) {
                    var button = this._buildEntries[i].element.data("button");
                    // Remove the loading text
                    jQuery(".loading", this._buildEntries[i].element).hide();
                    button.element.fadeOut();
                    //Make the row image a tick
                    jQuery("img", this._buildEntries[i].element).attr("src", "media/tick-20.png");
                    jQuery("img", this._buildEntries[i].element).removeClass("loader-cog-slow");
                    manager.preparePlugin(loadedScript.plugin, false);
                    this._loadedCount++;
                    if (this._loadedCount >= this._buildEntries.length)
                        this.dispatchEvent(new ProjectLoaderEvent(ProjectLoaderEvents.READY, "Plugins loaded."));
                }
                else if (jQuery.trim(url) != "") {
                    loader.dataType = "script";
                    loader.on(Animate.LoaderEvents.COMPLETE, this.onData, this);
                    loader.on(Animate.LoaderEvents.FAILED, this.onData, this);
                    loader.load(url, null, 1);
                    var css = this._buildEntries[i].element.data("css");
                    if (css && css != "") {
                        var cssLink = $("<link rel='stylesheet' type='text/css' href='" + css + "'>");
                        jQuery("head").append(cssLink);
                    }
                }
                else
                    this.onData(Animate.LoaderEvents.COMPLETE, null, loader);
            }
        };
        /** When one of the loaders returns from its request.*/
        ProjectLoader.prototype.onData = function (response, event, sender) {
            this._loadedCount++;
            if (response == Animate.LoaderEvents.COMPLETE) {
                for (var i = 0; i < this._buildEntries.length; i++) {
                    var loader = this._buildEntries[i].element.data("loader");
                    var button = this._buildEntries[i].element.data("button");
                    if (sender == loader || loader == null) {
                        // Remove the loading text
                        jQuery(".loading", this._buildEntries[i].element).hide();
                        button.element.fadeOut();
                        //Make the row image a tick
                        jQuery("img", this._buildEntries[i].element).attr("src", "media/tick-20.png");
                        jQuery("img", this._buildEntries[i].element).removeClass("loader-cog-slow");
                        var manager = Animate.PluginManager.getSingleton();
                    }
                }
            }
            else {
                this._errorOccured = true;
                //Get the buttons and loaders
                for (var i = 0; i < this._buildEntries.length; i++) {
                    var loader = this._buildEntries[i].element.data("loader");
                    var button = this._buildEntries[i].element.data("button");
                    button.enabled(true);
                    if (sender == loader) {
                        jQuery("img", this._buildEntries[i].element).attr("src", "media/cross-20.png");
                        jQuery("img", this._buildEntries[i].element).removeClass("loader-cog-slow");
                        jQuery(".loading", this._buildEntries[i].element).hide();
                        button.element.fadeIn();
                        break;
                    }
                }
            }
            if (this._loadedCount >= this._buildEntries.length)
                this.dispatchEvent(new ProjectLoaderEvent(ProjectLoaderEvents.READY, "Plugins loaded."));
        };
        Object.defineProperty(ProjectLoader.prototype, "errorOccured", {
            get: function () { return this._errorOccured; },
            enumerable: true,
            configurable: true
        });
        return ProjectLoader;
    })(Animate.Component);
    Animate.ProjectLoader = ProjectLoader;
})(Animate || (Animate = {}));
var Animate;
(function (Animate) {
    var ProjectBrowserEvents = (function (_super) {
        __extends(ProjectBrowserEvents, _super);
        function ProjectBrowserEvents(v) {
            _super.call(this, v);
        }
        ProjectBrowserEvents.COMBO = new ProjectBrowserEvents("project_browser_combo");
        return ProjectBrowserEvents;
    })(Animate.ENUM);
    Animate.ProjectBrowserEvents = ProjectBrowserEvents;
    var ProjectBrowserEvent = (function (_super) {
        __extends(ProjectBrowserEvent, _super);
        function ProjectBrowserEvent(eventName, command) {
            _super.call(this, eventName, command);
            this.command = command;
        }
        return ProjectBrowserEvent;
    })(Animate.Event);
    Animate.ProjectBrowserEvent = ProjectBrowserEvent;
    /**
    * This class is used to do administrative tasks on projects
    */
    var ProjectBrowser = (function (_super) {
        __extends(ProjectBrowser, _super);
        /**
        * @param {Component} parent The parent of the button
        */
        function ProjectBrowser(parent) {
            _super.call(this, "<div class='project-browser'></div>", parent);
            var top = this.addChild("<div></div>");
            this.element.append("<div class='fix'></div>");
            var bottom = this.addChild("<div class='project-browser-bottom'></div>");
            this._list = new Animate.ListView(bottom);
            this._list.addColumn("Name");
            this._list.addColumn("Description");
            this._list.addColumn("Tags");
            this._list.addColumn("Created On");
            this._list.addColumn("Last Modified");
            this._list.addColumn("ID");
            this._select = new Animate.ComboBox(top);
            this._select.element.addClass("light-gradient");
            this._select.addItem("Start");
            this._select.addItem("Copy");
            this._select.addItem("Create New");
            this._select.addItem("Delete");
            this._select.addItem("Open");
            this._list.setColumnWidth(1, "90px");
            this._search = top.addChild("<div class='project-browser-search'><input type='text'></input><img src='media/search.png' /><div>");
            this._selectedItem = null;
            this._selectedName = null;
            this._selectedID = null;
            this._list.on(Animate.ListViewEvents.ITEM_CLICKED, this.onItemClick, this);
            this._list.on(Animate.ListViewEvents.ITEM_DOUBLE_CLICKED, this.onDblClick, this);
            this._select.on(Animate.ListEvents.ITEM_SELECTED, this.onSelectClick, this);
        }
        /**
        * When we double click a project item
        */
        ProjectBrowser.prototype.onDblClick = function (response, event) {
            this._selectedItem = event.item;
            if (event.item) {
                this._selectedName = event.item.fields[0];
                this._selectedID = event.item.fields[5];
                this.dispatchEvent(new ProjectBrowserEvent(ProjectBrowserEvents.COMBO, "Open"));
                this._select.selectedItem = "Start";
            }
        };
        /**
        * when we select an option from the combo
        */
        ProjectBrowser.prototype.onSelectClick = function (response, event, sender) {
            if (event.item != "Start") {
                this.dispatchEvent(new ProjectBrowserEvent(ProjectBrowserEvents.COMBO, event.item));
                this._select.selectedItem = "Start";
            }
        };
        /**
        * Clears all the projects
        */
        ProjectBrowser.prototype.clearItems = function () {
            this._list.clearItems();
        };
        /**
        * When we click on one of the project items
        * @param {JQuery} e The jQuery event object
        * @param {any} item The ListViewItem that was selected.
        */
        ProjectBrowser.prototype.onItemClick = function (response, event, sender) {
            this._selectedItem = event.item;
            if (event.item) {
                this._selectedName = event.item.fields[0];
                this._selectedID = event.item.fields[5];
            }
        };
        /**
        * Fills the browser with project items
        * @param {any} data The data object sent from the server
        */
        ProjectBrowser.prototype.fill = function (data) {
            this._selectedItem = null;
            this._list.clearItems();
            for (var i = 0, l = data.length; i < l; i++) {
                var item = new Animate.ListViewItem([data[i].name, data[i].description, data[i].tags, new Date(data[i].createdOn).toString(), new Date(data[i].lastModified).toString(), data[i]._id], 'media/project-item.png', 'media/project-item.png');
                this._list.addItem(item);
            }
        };
        Object.defineProperty(ProjectBrowser.prototype, "selectedItem", {
            get: function () { return this._selectedItem; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProjectBrowser.prototype, "selectedName", {
            get: function () { return this._selectedName; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ProjectBrowser.prototype, "selectedID", {
            get: function () { return this._selectedID; },
            enumerable: true,
            configurable: true
        });
        return ProjectBrowser;
    })(Animate.Component);
    Animate.ProjectBrowser = ProjectBrowser;
})(Animate || (Animate = {}));
var Animate;
(function (Animate) {
    /**
    * This class is used to create tree view items.
    */
    var TreeView = (function (_super) {
        __extends(TreeView, _super);
        function TreeView(parent) {
            // Call super-class constructor
            _super.call(this, "<div class='tree'></div>", parent);
            this._selectedNode = null;
            this._selectedNodes = [];
            this.element.on("click", jQuery.proxy(this.onClick, this));
            this.element.disableSelection(true);
            this.fixDiv = jQuery("<div class='fix'></div>");
            this.element.append(this.fixDiv);
        }
        /**
        * When we click the view
        * @param {any} e
        */
        TreeView.prototype.onClick = function (e) {
            if (jQuery(e.target).hasClass("first-selectable")) {
                jQuery(".tree-node-button", e.target).trigger("click");
                return;
            }
            if (jQuery(e.target).hasClass("tree-node-button")) {
                var node = jQuery(e.target).parent().parent().data("component");
                if (node.expanded)
                    node.collapse();
                else
                    node.expand();
                return;
            }
            var comp = jQuery(e.target).parent().data("component");
            if (comp != null && comp instanceof Animate.TreeNode) {
                //CTRL KEY OPERATIONS
                if (e.ctrlKey)
                    this.selectNode(comp, false, e.ctrlKey);
                else if (e.shiftKey) {
                    if (this._selectedNodes.length == 1) {
                        if (comp.element.parent().data("component") == this._selectedNodes[0].element.parent().data("component")) {
                            var parent = comp.element.parent();
                            //var selectedNodeIndex = parent.index( comp.element );
                            //var prevNodeIndex = parent.index( this._selectedNodes[0].element );
                            //if ( selectedNodeIndex > prevNodeIndex )
                            //{
                            var startSelecting = false;
                            var pNode = parent.data("component");
                            for (var i = 0; pNode.mChildren.length; i++) {
                                if (!startSelecting && pNode.mChildren[i] == comp) {
                                    this.selectNode(null);
                                    return;
                                }
                                if (startSelecting || pNode.mChildren[i] == this._selectedNodes[0]) {
                                    startSelecting = true;
                                    this.selectNode(pNode.mChildren[i], false, true);
                                    if (pNode.mChildren[i] == comp)
                                        return;
                                }
                            }
                            //}
                            //else 
                            //	this.selectNode( null );
                            if (!startSelecting)
                                this.selectNode(null);
                        }
                    }
                    else
                        this.selectNode(null);
                }
                else
                    this.selectNode(comp, false);
            }
            else
                this.selectNode(null);
        };
        /**
        * Selects a node.
        * @param {TreeNode} node The node to select
        * @param {boolean} expandToNode A bool to say if we need to traverse the tree down until we get to the node
        * and expand all parent nodes
        * @param {boolean} multiSelect If true then multiple nodes are selected
        */
        TreeView.prototype.selectNode = function (node, expandToNode, multiSelect) {
            if (expandToNode === void 0) { expandToNode = false; }
            if (multiSelect === void 0) { multiSelect = false; }
            if (!this.enabled)
                return;
            if (this._selectedNode && multiSelect == false) {
                var i = this._selectedNodes.length;
                while (i--)
                    this._selectedNodes[i].selected = false;
                //this.selectedNode.selected( false );
                this._selectedNodes.splice(0, this._selectedNodes.length);
            }
            this._selectedNode = node;
            if (node) {
                if (this._selectedNodes.indexOf(node) == -1) {
                    if (expandToNode) {
                        //Make sure the tree node is expanded
                        var p = node.parent;
                        var scroll = 0;
                        while (p && p instanceof Animate.TreeNode) {
                            if (!p.expanded)
                                p.expand();
                            p = p.parent;
                        }
                    }
                    this._selectedNodes.push(node);
                    node.selected = true;
                    node.onSelect();
                    if (expandToNode)
                        this.parent.element.scrollTo('#' + node.id, 500);
                }
            }
        };
        /**
        * This will add a node to the treeview
        * @param {TreeNode} node The node to add
        * @returns {TreeNode}
        */
        TreeView.prototype.addNode = function (node) {
            node.treeview = this;
            node.element.addClass("tree-node-top");
            jQuery(".selectable", node.element).addClass("first-selectable");
            var toRet = Animate.Component.prototype.addChild.call(this, node);
            this.fixDiv.remove();
            this.element.append(this.fixDiv);
            return toRet;
        };
        /** @returns {Array<TreeNode>} The nodes of this treeview.*/
        TreeView.prototype.nodes = function () { return this.children; };
        /**
        * This will clear and dispose of all the nodes
        * @returns Array<TreeNode> The nodes of this tree
        */
        TreeView.prototype.clear = function () {
            var children = this.children;
            while (children.length > 0) {
                if (this._selectedNodes.indexOf(children[0]) != -1)
                    this._selectedNodes.splice(this._selectedNodes.indexOf(children[0]), 1);
                children[0].dispose();
            }
        };
        /**
        * This removes a node from the treeview
        * @param {TreeNode} node The node to remove
        * @returns {TreeNode}
        */
        TreeView.prototype.removeNode = function (node) {
            node.treeview = null;
            var toRet = Animate.Component.prototype.removeChild.call(this, node);
            this.fixDiv.remove();
            this.element.append(this.fixDiv);
            if (this._selectedNodes.indexOf(node) != -1)
                this._selectedNodes.splice(this._selectedNodes.indexOf(node), 1);
            return toRet;
        };
        /**
        * This will recursively look through each of the nodes to find a node with
        * the specified name.
        * @param {string} property The name property we are evaluating
        * @param {any} value The object we should be comparing against
        * @returns {TreeNode}
        */
        TreeView.prototype.findNode = function (property, value) {
            var children = this.children;
            var len = children.length;
            for (var i = 0; i < len; i++) {
                if (children[i] instanceof Animate.TreeNode == false)
                    continue;
                var n = children[i].findNode(property, value);
                if (n != null)
                    return n;
            }
        };
        Object.defineProperty(TreeView.prototype, "selectedNode", {
            get: function () { return this._selectedNode; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TreeView.prototype, "selectedNodes", {
            get: function () { return this._selectedNodes; },
            enumerable: true,
            configurable: true
        });
        return TreeView;
    })(Animate.Component);
    Animate.TreeView = TreeView;
})(Animate || (Animate = {}));
var Animate;
(function (Animate) {
    /**
    * This is the base class for all tree node classes
    */
    var TreeNode = (function (_super) {
        __extends(TreeNode, _super);
        /**
        * @param {string} text The text to use for this node
        * @param {string} img An optional image to use (image src text)
        * @param {boolean} hasExpandButton A bool to tell the node if it should use the expand button
        */
        function TreeNode(text, img, hasExpandButton) {
            if (img === void 0) { img = null; }
            if (hasExpandButton === void 0) { hasExpandButton = true; }
            if (img != null && img != "")
                img = "<img src='" + img + "' />";
            else
                img = "";
            this.mText = text;
            this.img = img;
            this._expanded = false;
            this.hasExpandButton = hasExpandButton;
            // Call super-class constructor
            _super.call(this, "<div class='tree-node'><div class='selectable'>" + (this.hasExpandButton ? "<div class='tree-node-button'>+</div>" : "") + this.img + "<span class='text'>" + this.mText + "</span><div class='fix'></div></div></div>", null);
            this.element.disableSelection(true);
            jQuery(".tree-node-button", this.element).first().css("visibility", "hidden");
            this.treeview = null;
            this.canDelete = false;
            this.canFocus = true;
        }
        /**
        * @type public mfunc dispose
        * This will cleanup the component.
        * @extends {TreeNode}
        */
        TreeNode.prototype.dispose = function () {
            if (this.treeview) {
                if (this.treeview.selectedNodes.indexOf(this) != -1)
                    this.treeview.selectedNodes.splice(this.treeview.selectedNodes.indexOf(this), 1);
                if (this.treeview.selectedNode == this)
                    this.treeview.selectedNode = null;
            }
            this.mText = null;
            this.img = null;
            this._expanded = null;
            this.hasExpandButton = null;
            this.treeview = null;
            this.canDelete = null;
            //Call super
            _super.prototype.dispose.call(this);
        };
        /**
        * Called when the node is selected
        */
        TreeNode.prototype.onSelect = function () { };
        /**
        * This function will rturn an array of all its child nodes
        * @param {Function} type This is an optional type object. You can pass a function or class and it will only return nodes of that type.
        * @param Array<TreeNode> array This is the array where data will be stored in. This can be left as null and one will be created
        * @returns Array<TreeNode>
        */
        TreeNode.prototype.getAllNodes = function (type, array) {
            if (array === void 0) { array = null; }
            var toRet = null;
            if (array)
                toRet = array;
            else
                toRet = [];
            var children = this.children;
            var len = children.length;
            for (var i = 0; i < len; i++) {
                children[i].getAllNodes(type, toRet);
                if (type == null)
                    toRet.push(children[i]);
                else if (children[i] instanceof type)
                    toRet.push(children[i]);
            }
            return toRet;
        };
        /**
        * This function will expand this node and show its children.
        */
        TreeNode.prototype.expand = function () {
            if (this.hasExpandButton == false)
                return;
            var children = this.children;
            var len = children.length;
            for (var i = 0; i < len; i++)
                children[i].element.show();
            jQuery(".tree-node-button", this.element).first().text("-");
            this._expanded = true;
        };
        /**
        * This function will collapse this node and hide its children.
        */
        TreeNode.prototype.collapse = function () {
            if (this.hasExpandButton == false)
                return;
            var children = this.children;
            var len = children.length;
            for (var i = 0; i < len; i++)
                children[i].element.hide();
            jQuery(".tree-node-button", this.element).first().text("+");
            this._expanded = false;
        };
        /**
        * This will recursively look through each of the nodes to find a node with
        * the specified name.
        * @param {string} property The Javascript property on the node that we are evaluating
        * @param {any} value The value of the property we are comparing.
        * @returns {TreeNode}
        */
        TreeNode.prototype.findNode = function (property, value) {
            if (this[property] == value)
                return this;
            var children = this.children;
            var len = children.length;
            for (var i = 0; i < len; i++) {
                if (children[i] instanceof TreeNode == false)
                    continue;
                var n = children[i].findNode(property, value);
                if (n != null)
                    return n;
            }
        };
        /**
        * This will clear and dispose of all the nodes
        */
        TreeNode.prototype.clear = function () {
            var children = this.children;
            while (children.length > 0) {
                if (children[0].treeview && children[0].treeview.selectedNodes.indexOf(children[0]) != -1)
                    children[0].treeview.selectedNodes.splice(children[0].treeview.selectedNodes.indexOf(children[0]), 1);
                children[0].dispose();
            }
        };
        Object.defineProperty(TreeNode.prototype, "selected", {
            /**
            * Get if the component is selected
            * @returns {boolean} If the component is selected or not.
            */
            get: function () {
                if (this.element.hasClass("tree-node-selected"))
                    return true;
                else
                    return false;
            },
            /**
            * Set if the component is selected
            * @param {boolean} val Pass a true or false value to select the component.
            */
            set: function (val) {
                //Check if setting the variable
                if (val)
                    jQuery(" > .selectable", this.element).addClass("tree-node-selected").addClass("tree-node-selected");
                else
                    jQuery(" > .selectable", this.element).removeClass("tree-node-selected").removeClass("tree-node-selected");
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TreeNode.prototype, "text", {
            /**
            * Gets the text of the node
            * @returns {string} The text of the node
            */
            get: function () {
                return this.mText;
            },
            /**
            * Sets the text of the node
            * @param {string} val The text to set
            */
            set: function (val) {
                this.mText = val;
                jQuery(".text:first", this.element).text(this.mText);
            },
            enumerable: true,
            configurable: true
        });
        /**
        * This will add a node to the treeview
        * @param {TreeNode} node The node to add
        * @param {boolean} collapse True if you want to make this node collapse while adding the new node. The default is true
        * @returns {TreeNode}
        */
        TreeNode.prototype.addNode = function (node, collapse) {
            if (collapse === void 0) { collapse = true; }
            node.treeview = this.treeview;
            var toRet = Animate.Component.prototype.addChild.call(this, node);
            if (collapse)
                this.collapse();
            else
                this.expand();
            jQuery(".tree-node-button", this.element).first().css("visibility", "");
            return toRet;
        };
        Object.defineProperty(TreeNode.prototype, "nodes", {
            /**
            * The nodes of this treeview.
            * @returns {Array<TreeNode>}
            */
            get: function () { return this.children; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TreeNode.prototype, "expanded", {
            /**
            * Gets if this treenode is expanded or not
            * @returns {boolean}
            */
            get: function () { return this._expanded; },
            enumerable: true,
            configurable: true
        });
        /**
        * This removes a node from the treeview
        * @param {TreeNode} node The node to remove
        * @returns {TreeNode}
        */
        TreeNode.prototype.removeNode = function (node) {
            if (this.treeview.selectedNodes.indexOf(node) != -1)
                this.treeview.selectedNodes.splice(this.treeview.selectedNodes.indexOf(node), 1);
            if (this.treeview.selectedNode == node)
                this.treeview.selectedNode = null;
            node.treeview = null;
            var toRet = Animate.Component.prototype.removeChild.call(this, node);
            if (this.nodes.length == 0)
                jQuery(".tree-node-button", this.element).first().css("visibility", "hidden");
            return toRet;
        };
        Object.defineProperty(TreeNode.prototype, "originalText", {
            get: function () { return this.mText; },
            set: function (val) { this.mText = val; },
            enumerable: true,
            configurable: true
        });
        return TreeNode;
    })(Animate.Component);
    Animate.TreeNode = TreeNode;
})(Animate || (Animate = {}));
var Animate;
(function (Animate) {
    /**
    * Treenodes are added to the treeview class. This treenode contains a reference to the
    * AssetClass object defined by plugins.
    */
    var TreeNodeAssetClass = (function (_super) {
        __extends(TreeNodeAssetClass, _super);
        /**
        * @param {AssetClas} assetClass The asset class this node represents
        * @param {TreeView} treeview The treeview to which this is added
        */
        function TreeNodeAssetClass(assetClass, treeview) {
            // Call super-class constructor
            _super.call(this, assetClass.name, assetClass.imgURL, true);
            this.canDelete = false;
            this.assetClass = assetClass;
            this.treeview = treeview;
            this.className = assetClass.name;
            this.canUpdate = true;
            //Add the sub - class nodes
            for (var ii = 0; ii < assetClass.classes.length; ii++) {
                var c = assetClass.classes[ii];
                var toRet = new TreeNodeAssetClass(c, treeview);
                this.addNode(toRet);
            }
        }
        /**
        * This will get all TreeNodeAssetInstance nodes of a particular class name
        * @param {string|Array<string>} classNames The class name of the asset, or an array of class names
        * @returns Array<TreeNodeAssetInstance>
        */
        TreeNodeAssetClass.prototype.getInstances = function (classNames) {
            var toRet = null;
            var children = this.children;
            var names;
            if (!classNames)
                names = [null];
            else if (typeof (classNames) == "string")
                names = [classNames];
            else
                names = classNames;
            toRet = [];
            for (var i = 0, l = names.length; i < l; i++) {
                if (names[i] == null || names[i] == this.assetClass.name || names[i] == "") {
                    //Add the sub - class nodes
                    var len = children.length;
                    for (var i = 0; i < len; i++) {
                        if (children[i] instanceof Animate.TreeNodeAssetInstance)
                            toRet.push(children[i]);
                        else if (children[i] instanceof TreeNodeAssetClass) {
                            var instances = children[i].getInstances(null);
                            if (instances != null) {
                                for (var ii = 0; ii < instances.length; ii++)
                                    toRet.push(instances[ii]);
                            }
                        }
                    }
                }
                else {
                    //Add the sub - class nodes
                    var len = children.length;
                    for (var ii = 0; ii < len; ii++) {
                        if (children[ii] instanceof TreeNodeAssetClass) {
                            var instances = children[ii].getInstances(names);
                            if (instances != null)
                                for (var iii = 0, liii = instances.length; iii < liii; iii++)
                                    if (toRet.indexOf(instances[iii]) == -1)
                                        toRet.push(instances[iii]);
                        }
                    }
                }
            }
            return toRet;
        };
        /**
        * This will get all sub TreeNodeAssetClass nodes
        * @returns Array<AssetClass>
        */
        TreeNodeAssetClass.prototype.getClasses = function () {
            var toRet = [];
            var children = this.children;
            //Add the sub - class nodes
            var len = this.children.length;
            for (var i = 0; i < len; i++) {
                if (children[i] instanceof TreeNodeAssetClass) {
                    toRet.push((children[i].assetClass));
                    var instances = children[i].getClasses();
                    if (instances != null)
                        for (var ii = 0; ii < instances.length; ii++)
                            toRet.push(instances[ii]);
                }
            }
            return toRet;
        };
        /**
        * This will cleanup the component.
        */
        TreeNodeAssetClass.prototype.dispose = function () {
            this.canDelete = null;
            this.assetClass = null;
            this.treeview = null;
            this.className = null;
            //Call super
            _super.prototype.dispose.call(this);
        };
        return TreeNodeAssetClass;
    })(Animate.TreeNode);
    Animate.TreeNodeAssetClass = TreeNodeAssetClass;
})(Animate || (Animate = {}));
var Animate;
(function (Animate) {
    /**
    * Treenodes are added to the treeview class. This treenode contains a reference to the
    * AssetClass object defined by plugins.
    */
    var TreeNodeAssetInstance = (function (_super) {
        __extends(TreeNodeAssetInstance, _super);
        /**
        * @param {AssetClass} assetClass The name of the asset's template
        * @param {Asset} asset The asset itself
        */
        function TreeNodeAssetInstance(assetClass, asset) {
            // Call super-class constructor
            _super.call(this, (jQuery.trim(asset.name) == "" ? "New " + assetClass.name : asset.name), "media/variable.png", false);
            this.asset = asset;
            this.canDelete = true;
            this.canCopy = true;
            this.saved = true;
            this.canUpdate = true;
            this.assetClass = assetClass;
            this.element.draggable({ opacity: 0.7, helper: "clone", appendTo: "body", containment: "body" });
            this.element.addClass("behaviour-to-canvas");
            this.element.addClass("tree-node-asset");
            if (this.asset.properties == null || this.asset.properties.variables.length == 0)
                this.asset.properties = assetClass.buildVariables();
            Animate.PropertyGrid.getSingleton().on(Animate.PropertyGridEvents.PROPERTY_EDITED, this.onPropertyGridEdited, this);
        }
        /**
        * Called when the node is selected
        */
        TreeNodeAssetInstance.prototype.onSelect = function () {
            Animate.PropertyGrid.getSingleton().editableObject(this.asset.properties, this.text + "  [" + this.asset.shallowId + "]", this, "media/variable.png");
            Animate.PluginManager.getSingleton().dispatchEvent(new Animate.AssetEvent(Animate.EditorEvents.ASSET_SELECTED, this.asset));
        };
        /**
        * When we click ok on the portal form
        * @param <object> response
        * @param <object> data
        */
        TreeNodeAssetInstance.prototype.onPropertyGridEdited = function (response, data, sender) {
            if (data.id == this) {
                this.asset.saved = false;
                this.saved = this.asset.saved;
                var oldValue = this.asset.properties.getVar(data.propertyName).value;
                this.asset.properties.updateValue(data.propertyName, data.propertyValue);
                Animate.PluginManager.getSingleton().assetEdited(this.asset, data.propertyName, data.propertyValue, oldValue, data.propertyType);
                this.text = this.text;
            }
        };
        Object.defineProperty(TreeNodeAssetInstance.prototype, "text", {
            /**
            * Gets the text of the node
            * @returns {string} The text of the node
            */
            get: function () {
                return this.originalText;
            },
            /**
            * Sets the text of the node
            * @param {string} val The text to set
            */
            set: function (val) {
                this.originalText = val;
                jQuery(".text:first", this.element).text((this.asset.saved ? "" : "*") + this.originalText);
            },
            enumerable: true,
            configurable: true
        });
        /**
        * When we click ok on the portal form
        */
        TreeNodeAssetInstance.prototype.save = function (val) {
            if (val === void 0) { val = true; }
            if (!val) {
                this.saved = val;
                this.asset.saved = val;
                this.text = this.text;
                return;
            }
            if (this.saved)
                return;
            this.asset.saved = true;
            this.saved = this.asset.saved;
            this.text = this.text;
            if (this.asset.properties == null)
                this.asset.properties = this.assetClass.buildVariables();
        };
        /**
        * This will cleanup the component.
        */
        TreeNodeAssetInstance.prototype.dispose = function () {
            this.element.draggable("destroy");
            Animate.PropertyGrid.getSingleton().off(Animate.PropertyGridEvents.PROPERTY_EDITED, this.onPropertyGridEdited, this);
            this.asset = null;
            this.saved = null;
            this.assetClass = null;
            //Call super
            _super.prototype.dispose.call(this);
        };
        return TreeNodeAssetInstance;
    })(Animate.TreeNode);
    Animate.TreeNodeAssetInstance = TreeNodeAssetInstance;
})(Animate || (Animate = {}));
var Animate;
(function (Animate) {
    /**
    *  A tree node class for behaviour container objects.
    */
    var TreeNodeBehaviour = (function (_super) {
        __extends(TreeNodeBehaviour, _super);
        /**
        * @param {BehaviourContainer} behaviour The container we are associating with this node
        */
        function TreeNodeBehaviour(behaviour) {
            // Call super-class constructor
            _super.call(this, behaviour.name, "media/variable.png", false);
            this.element.addClass("behaviour-to-canvas");
            this.canDelete = true;
            this.canUpdate = true;
            this.saved = true;
            this.behaviour = behaviour;
            this.element.draggable({ opacity: 0.7, helper: "clone", appendTo: "body", containment: "body" });
            Animate.PropertyGrid.getSingleton().on(Animate.PropertyGridEvents.PROPERTY_EDITED, this.onPropertyGridEdited, this);
        }
        /**
        * Called when the node is selected
        */
        TreeNodeBehaviour.prototype.onSelect = function () {
            Animate.PropertyGrid.getSingleton().editableObject(this.behaviour.properties, this.text, this, "media/variable.png");
        };
        /**
        * When we click ok on the portal form
        */
        TreeNodeBehaviour.prototype.onPropertyGridEdited = function (response, event, sender) {
            if (event.id == this) {
                this.save(false);
                this.behaviour.properties.updateValue(event.propertyName, event.propertyValue);
            }
        };
        /** Notifies if this node is saved or unsaved. */
        TreeNodeBehaviour.prototype.save = function (val) {
            this.saved = val;
            this.behaviour.saved = val;
            this.text = this.originalText;
        };
        Object.defineProperty(TreeNodeBehaviour.prototype, "text", {
            /**
            * Gets the text of the node
            * @returns {string} The text of the node
            */
            get: function () {
                return this.originalText;
            },
            /**
            * Sets the text of the node
            * @param {string} val The text to set
            */
            set: function (val) {
                //First we try and get the tab
                var tabPair = Animate.CanvasTab.getSingleton().getTab(this.originalText);
                //Tab was not found - check if its because its unsaved
                if (tabPair == null)
                    tabPair = Animate.CanvasTab.getSingleton().getTab("*" + this.originalText);
                //If we have a tab then rename it to the same as the node
                if (tabPair) {
                    this.originalText = val;
                    jQuery(".text:first", this.element).text((this.behaviour.saved ? "" : "*") + this.originalText);
                    jQuery(".text", tabPair.tabSelector.element).text((this.behaviour.saved ? "" : "*") + this.originalText);
                    tabPair.name = (this.behaviour.saved ? "" : "*") + this.originalText;
                }
                else {
                    this.originalText = val;
                    jQuery(".text:first", this.element).text((this.behaviour.saved ? "" : "*") + this.originalText);
                }
                this.behaviour.name = this.originalText;
            },
            enumerable: true,
            configurable: true
        });
        /**This will cleanup the component.*/
        TreeNodeBehaviour.prototype.dispose = function () {
            if (this.element.hasClass("draggable"))
                this.element.draggable("destroy");
            Animate.PropertyGrid.getSingleton().off(Animate.PropertyGridEvents.PROPERTY_EDITED, this.onPropertyGridEdited, this);
            this.behaviour = null;
            //Call super
            _super.prototype.dispose.call(this);
        };
        return TreeNodeBehaviour;
    })(Animate.TreeNode);
    Animate.TreeNodeBehaviour = TreeNodeBehaviour;
})(Animate || (Animate = {}));
var Animate;
(function (Animate) {
    /**
    * This node represents a group asset. Goups are collections of objects - think of them as arrays.
    */
    var TreeNodeGroup = (function (_super) {
        __extends(TreeNodeGroup, _super);
        function TreeNodeGroup(id, name, json, treeview) {
            // Call super-class constructor
            _super.call(this, name, "media/array.png", true);
            this.groupID = id;
            this.canDelete = true;
            this.saved = true;
            this.canUpdate = true;
            this.json = null;
            this.treeview = treeview;
            this.element.addClass("tree-node-group");
            //Add each of the node references
            var project = Animate.User.get.project;
            this.json = json;
            for (var i in this.json.assets)
                this.addNode(new Animate.TreeNodeGroupInstance(this.json.assets[i].id, this.json.assets[i].name));
            this.dropProxy = this.onObjectDropped.bind(this);
            this.element.draggable({ opacity: 0.7, helper: "clone", appendTo: "body", containment: "body" });
            this.element.droppable({ drop: this.dropProxy, accept: ".tree-node-asset,.tree-node-group" });
        }
        /**
        * This is called when we update the group with new data from the server.
        */
        TreeNodeGroup.prototype.updateGroup = function (name, json) {
            //Remove all current nodes
            while (this.children.length > 0)
                this.children[0].dispose();
            var project = Animate.User.get.project;
            this.saved = true;
            this.text = this.originalText;
            this.name = name;
            this.json = json;
            for (var i in this.json.assets)
                this.addNode(new Animate.TreeNodeGroupInstance(this.json.assets[i].id, this.json.assets[i].name));
        };
        /**
        * This function is called when a child node is removed. We have to update
        * the json object and make its no longer part of the data.
        * @param id The ID of the object we need to remove.
        */
        TreeNodeGroup.prototype.removeInstance = function (id) {
            for (var i = 0; i < this.json.assets.length; i++)
                if (this.json.assets[i].id == id) {
                    this.json.assets.splice(i, 1);
                    this.save(false);
                    return;
                }
        };
        Object.defineProperty(TreeNodeGroup.prototype, "text", {
            /**
            * Gets the text of the node
            * @returns {string} The text of the node
            */
            get: function () {
                return this.originalText;
            },
            /**
            * Sets the text of the node
            * @param {string} val The text to set
            */
            set: function (val) {
                this.originalText = val;
                jQuery(".text:first", this.element).text((this.saved ? "" : "*") + this.originalText);
            },
            enumerable: true,
            configurable: true
        });
        /**
        * Notifies if this node is saved or unsaved.
        */
        TreeNodeGroup.prototype.save = function (val) {
            this.saved = val;
            this.text = this.text;
        };
        /**
        * Called when a draggable object is dropped onto the canvas.
        */
        TreeNodeGroup.prototype.onObjectDropped = function (event, ui) {
            var comp = jQuery(ui.draggable).data("component");
            if (comp instanceof Animate.TreeNodeAssetInstance || comp instanceof TreeNodeGroup) {
                var added = null;
                if (comp instanceof Animate.TreeNodeAssetInstance)
                    added = this.addNode(new Animate.TreeNodeGroupInstance(comp.asset.shallowId, comp.asset.name));
                else
                    added = this.addNode(new Animate.TreeNodeGroupInstance(comp.groupID, comp.text));
                this.expand();
                this.treeview.selectNode(added);
                this.save(false);
                var identifier = this.json.assets.length;
                this.json.assets[identifier] = { id: added.instanceID, name: (comp instanceof Animate.TreeNodeAssetInstance ? comp.asset.name : comp.text) };
            }
        };
        /**
        * This will cleanup the component.
        */
        TreeNodeGroup.prototype.dispose = function () {
            this.element.droppable("destroy");
            //Call super - must be called here in this case
            _super.prototype.dispose.call(this);
            this.treeview = null;
            this.dropProxy = null;
            this.groupID = null;
            this.canDelete = null;
            this.saved = null;
            this.canUpdate = null;
            this.json = null;
        };
        return TreeNodeGroup;
    })(Animate.TreeNode);
    Animate.TreeNodeGroup = TreeNodeGroup;
})(Animate || (Animate = {}));
var Animate;
(function (Animate) {
    /**
    * This node represents a group instance. Goups are collections of objects - think of them as arrays.
    */
    var TreeNodeGroupInstance = (function (_super) {
        __extends(TreeNodeGroupInstance, _super);
        function TreeNodeGroupInstance(instanceID, name) {
            // Call super-class constructor
            _super.call(this, name, "media/instance_ref.png", false);
            this._instanceID = instanceID;
            this.canDelete = true;
        }
        /**This will cleanup the component.*/
        TreeNodeGroupInstance.prototype.dispose = function () {
            var parentGroupNode = this.parent;
            if (parentGroupNode)
                parentGroupNode.removeInstance(this.instanceID);
            this._instanceID = null;
            //Call super
            _super.prototype.dispose.call(this);
        };
        Object.defineProperty(TreeNodeGroupInstance.prototype, "instanceID", {
            get: function () { return this._instanceID; },
            enumerable: true,
            configurable: true
        });
        return TreeNodeGroupInstance;
    })(Animate.TreeNode);
    Animate.TreeNodeGroupInstance = TreeNodeGroupInstance;
})(Animate || (Animate = {}));
var Animate;
(function (Animate) {
    /**
    * This node represents a behaviour created by a plugin.
    */
    var TreeNodePluginBehaviour = (function (_super) {
        __extends(TreeNodePluginBehaviour, _super);
        function TreeNodePluginBehaviour(template) {
            // Call super-class constructor
            _super.call(this, template.behaviourName, "media/variable.png", false);
            this._template = template;
            this.canDelete = false;
            this.element.addClass("behaviour-to-canvas");
            this.element.draggable({ opacity: 0.7, helper: "clone", appendTo: "body", containment: "body" });
        }
        /**This will cleanup the component.*/
        TreeNodePluginBehaviour.prototype.dispose = function () {
            this._template.dispose();
            this.template = null;
            this.canDelete = null;
            //Call super
            _super.prototype.dispose.call(this);
        };
        Object.defineProperty(TreeNodePluginBehaviour.prototype, "template", {
            get: function () { return this._template; },
            enumerable: true,
            configurable: true
        });
        return TreeNodePluginBehaviour;
    })(Animate.TreeNode);
    Animate.TreeNodePluginBehaviour = TreeNodePluginBehaviour;
})(Animate || (Animate = {}));
var Animate;
(function (Animate) {
    var ShortCutHelper = (function () {
        function ShortCutHelper(item, datum) {
            this.item = item;
            this.datum = datum;
        }
        return ShortCutHelper;
    })();
    var CanvasEvents = (function (_super) {
        __extends(CanvasEvents, _super);
        function CanvasEvents(v) {
            _super.call(this, v);
        }
        CanvasEvents.MODIFIED = new CanvasEvents("canvas_modified");
        return CanvasEvents;
    })(Animate.ENUM);
    Animate.CanvasEvents = CanvasEvents;
    var CanvasEvent = (function (_super) {
        __extends(CanvasEvent, _super);
        function CanvasEvent(eventName, canvas) {
            this.canvas = canvas;
            _super.call(this, eventName, canvas);
        }
        return CanvasEvent;
    })(Animate.Event);
    Animate.CanvasEvent = CanvasEvent;
    /**
    * The canvas is used to create diagrammatic representations of behaviours and how they interact in the scene.
    */
    var Canvas = (function (_super) {
        __extends(Canvas, _super);
        /**
        * @param {Component} parent The parent component to add this canvas to
        * @param {BehaviourContainer} behaviourContainer Each canvas represents a behaviour.This container is the representation of the canvas as a behaviour.
        */
        function Canvas(parent, behaviourContainer) {
            // Call super-class constructor
            _super.call(this, "<div class='canvas' tabindex='0'></div>", parent);
            this._proxyMoving = this.onChildMoving.bind(this);
            this._proxyStartDrag = this.onStartingDrag.bind(this);
            this._proxyStopDrag = this.onChildDropped.bind(this);
            this.mDownProxy = this.onMouseDown.bind(this);
            this.mUpProxy = this.onMouseUp.bind(this);
            this.element.on("mousedown", this.mDownProxy);
            this.element.on("dblclick", jQuery.proxy(this.onDoubleClick, this));
            this.mX = 0;
            this.mY = 0;
            this.name = behaviourContainer.name;
            this._behaviourContainer = behaviourContainer;
            behaviourContainer.canvas = this;
            //Define proxies
            this.mContextProxy = this.onContext.bind(this);
            this.keyProxy = this.onKeyDown.bind(this);
            this.mContextNode = null;
            //Hook listeners
            jQuery("body").on("keydown", this.keyProxy);
            jQuery(document).on("contextmenu", this.mContextProxy);
            Animate.BehaviourPicker.getSingleton().on(Animate.BehaviourPickerEvents.BEHAVIOUR_PICKED, this.onBehaviourPicked, this);
            Animate.PortalForm.getSingleton().on(Animate.OkCancelFormEvents.CONFIRM, this.OnPortalConfirm, this);
            new Animate.BehaviourPortal(this, "Start");
            Animate.PropertyGrid.getSingleton().on(Animate.PropertyGridEvents.PROPERTY_EDITED, this.onPropertyGridEdited, this);
            this.element.droppable({ drop: this.onObjectDropped.bind(this), accept: ".behaviour-to-canvas" });
            this._containerReferences = { groups: [], assets: [] };
            Animate.PluginManager.getSingleton().on(Animate.EditorEvents.ASSET_EDITED, this.onAssetEdited, this);
        }
        //onStartingDrag(response : DragManagerEvents, event: DragEvent )
        Canvas.prototype.onStartingDrag = function (e, ui) {
            var target = jQuery(e.currentTarget).data("component");
            //Shift key pressed - so lets create a shortcut
            if (e.shiftKey) {
                if (!(target.canGhost))
                    return;
                var left = target.element.css("left");
                var top = target.element.css("top");
                var shortcut = null;
                // If the target is a short cut, then use the targets origin
                if (target instanceof Animate.BehaviourShortcut)
                    shortcut = new Animate.BehaviourShortcut(this, target.originalNode, target.originalNode.alias);
                else
                    shortcut = new Animate.BehaviourShortcut(this, target, target.alias);
                shortcut.element.css({ left: left, top: top, position: "absolute" });
                jQuery.ui.ddmanager.current.helper = shortcut.element;
                jQuery.ui.ddmanager.current.cancelHelperRemoval = true;
            }
            jQuery.ui.ddmanager.current.options.grid = (Canvas.snapping ? [10, 10] : undefined);
        };
        /**
        * When an item is finished being dragged
        */
        Canvas.prototype.onChildDropped = function (e, ui) {
            var target = ui.helper.data("component");
            var left = parseFloat(target.element.css("left").split("px")[0]);
            var top = parseFloat(target.element.css("top").split("px")[0]);
            if (Canvas.snapping) {
                left = parseInt(left.toString());
                top = parseInt(top.toString());
                left = left - left % 10;
                top = top - top % 10;
            }
            if (left < 0)
                left = 0;
            if (top < 0)
                top = 0;
            target.element.css({ top: top + "px", left: left + "px" });
            //Upadte the links
            for (var i = 0, l = target.portals.length; i < l; i++)
                target.portals[i].updateAllLinks();
            //Notify of change
            this.dispatchEvent(new CanvasEvent(CanvasEvents.MODIFIED, this));
        };
        /**
        * Called when a draggable object is dropped onto the canvas.
        * @param {any} event The jQuery UI event
        * @param {any} ui The event object sent from jQuery UI
        */
        Canvas.prototype.onObjectDropped = function (event, ui) {
            var comp = jQuery(ui.draggable).data("component");
            if (comp instanceof Animate.TreeNode) {
                var p = this.parent.element;
                var offset = this.element.offset();
                var scrollX = p.scrollLeft();
                var scrollY = p.scrollTop();
                var mouse = { x: event.pageX - offset.left - scrollX, y: event.pageY - offset.top - scrollY };
                this.mX = mouse.x + scrollX;
                this.mY = mouse.y + scrollY;
                if (comp instanceof Animate.TreeNodeAssetInstance)
                    this.addAssetAtLocation(comp.asset, this.mX, this.mY);
                else if (comp instanceof Animate.TreeNodePluginBehaviour)
                    this.createNode(comp.template, this.mX, this.mY);
                else if (comp instanceof Animate.TreeNodeBehaviour)
                    this.createNode(Animate.PluginManager.getSingleton().getTemplate("Instance"), this.mX, this.mY, comp.behaviour);
            }
        };
        /**
        * Create an asset node at a location
        * @param {Asset} asset
        * @param {number} x
        * @param {number} y
        */
        Canvas.prototype.addAssetAtLocation = function (asset, x, y) {
            var node = this.createNode(Animate.PluginManager.getSingleton().getTemplate("Asset"), x, y);
            node.asset = asset;
            node.parameters[0].value = { selected: asset.shallowId, classname: "" };
            //Add a reference to this canvas's scene assets
            if (asset) {
                node.text = asset.name;
                node.alias = asset.name;
            }
            this.buildSceneReferences();
        };
        /**
        * This function is used to cleanup the object before its removed from memory.
        */
        Canvas.prototype.dispose = function () {
            this.element.droppable("destroy");
            Animate.PluginManager.getSingleton().off(Animate.EditorEvents.ASSET_EDITED, this.onAssetEdited, this);
            Animate.BehaviourPicker.getSingleton().off(Animate.BehaviourPickerEvents.BEHAVIOUR_PICKED, this.onBehaviourPicked, this);
            Animate.PortalForm.getSingleton().off(Animate.OkCancelFormEvents.CONFIRM, this.OnPortalConfirm, this);
            jQuery("body").off("keydown", this.keyProxy);
            jQuery(document).off("contextmenu", this.mContextProxy);
            Animate.PropertyGrid.getSingleton().off(Animate.PropertyGridEvents.PROPERTY_EDITED, this.onPropertyGridEdited, this);
            this.element.off("mousedown", this.mDownProxy);
            this._proxyMoving = null;
            this._proxyStartDrag = null;
            this._proxyStopDrag = null;
            this.mX = null;
            this.mY = null;
            this.name = null;
            this._behaviourContainer = null;
            this.keyProxy = null;
            this.mContextProxy = null;
            this.mContextNode = null;
            this._containerReferences = null;
            //Call super
            _super.prototype.dispose.call(this);
        };
        /**
        * This function will remove all references of an asset in the behaviour nodes
        * @param {Asset} asset The asset reference
        */
        Canvas.prototype.removeAsset = function (asset) {
            var pManager = Animate.PluginManager.getSingleton();
            var contEvent = new Animate.AssetContainerEvent(Animate.EditorEvents.ASSET_REMOVED_FROM_CONTAINER, null, this._behaviourContainer);
            var project = Animate.User.get.project;
            for (var i = 0, l = this.children.length; i < l; i++) {
                var item = this.children[i];
                //If it contains any assests - then we make sure they are removed from this canvas
                if (item instanceof Animate.Behaviour) {
                    for (var ii = 0, il = item.parameters.length; ii < il; ii++) {
                        var portal = item.parameters[ii];
                        if (portal.dataType == Animate.ParameterType.ASSET && portal.value != null) {
                            var assetID = parseInt(portal.value.selected);
                            if (project.getAssetByShallowId(assetID) == asset) {
                                portal.value = { className: portal.value.className, selected: null };
                                if (item instanceof Animate.BehaviourAsset)
                                    item.asset = null;
                            }
                        }
                        else if (portal.dataType == Animate.ParameterType.ASSET_LIST && portal.value != null && portal.value.selectedAssets.length > 0) {
                            for (var a, al = portal.value.selectedAssets.length; a < al; a++) {
                                var assetID = portal.value.selectedAssets[a];
                                if (project.getAssetByShallowId(assetID) == asset) {
                                    portal.value = { className: portal.value.className, selected: null };
                                }
                            }
                        }
                    }
                }
            }
            this.buildSceneReferences();
        };
        /**
        * Call this to remove an item from the canvas
        * @param {Component} item The component we are removing from the canvas
        * @extends <Canvas>
        */
        Canvas.prototype.removeItem = function (item) {
            var toRemove = [];
            for (var i = 0; i < this.children.length; i++)
                toRemove.push(this.children[i]);
            //Remove any shortcuts first
            for (var i = 0; i < toRemove.length; i++)
                if (typeof (toRemove[i]) !== "undefined")
                    if (toRemove[i] instanceof Animate.BehaviourShortcut && toRemove[i].originalNode == item)
                        this.removeItem(toRemove[i]);
            for (var i = 0; i < toRemove.length; i++)
                if (typeof (toRemove[i]) !== "undefined")
                    if (toRemove[i] == item) {
                        //Notify of change
                        this.dispatchEvent(new CanvasEvent(CanvasEvents.MODIFIED, this));
                        //Notify of change
                        if (toRemove[i] instanceof Animate.BehaviourPortal)
                            Animate.PluginManager.getSingleton().dispatchEvent(new Animate.PluginPortalEvent(Animate.EditorEvents.PORTAL_REMOVED, "", this._behaviourContainer, toRemove[i].portals[0], this));
                        toRemove[i].dispose();
                        this.buildSceneReferences();
                    }
            toRemove = null;
        };
        /**
        * Removes all selected items
        */
        Canvas.prototype.removeItems = function () {
            //Remove all selected
            var toRemove = [];
            var i = this.children.length;
            while (i--)
                toRemove.push(this.children[i]);
            var i = toRemove.length;
            while (i--)
                if (typeof (toRemove[i]) !== "undefined")
                    if (toRemove[i].disposed != null && toRemove[i].selected)
                        this.removeItem(toRemove[i]);
        };
        /**
        * Called when the canvas context menu is closed and an item clicked.
        */
        Canvas.prototype.onContextSelect = function (e, event) {
            if (event.item.text == "Delete") {
                //Delete portal
                if (this.mContextNode instanceof Animate.Portal) {
                    var behaviour = this.mContextNode.behaviour;
                    behaviour.removePortal(this.mContextNode);
                    var toEdit = new Animate.EditableSet();
                    var i = behaviour.parameters.length;
                    while (i--)
                        if (behaviour.parameters[i].links.length <= 0)
                            toEdit.addVar(behaviour.parameters[i].name, behaviour.parameters[i].value, Animate.ParameterType.fromString(behaviour.parameters[i].dataType.toString()), behaviour.element.text(), null);
                    Animate.PropertyGrid.getSingleton().editableObject(toEdit, behaviour.text + " - " + behaviour.id, behaviour.id, null);
                    return;
                }
                else
                    Animate.Toolbar.getSingleton().onDelete();
            }
            else if (event.item.text == "Remove Empty Assets") {
                //Remove all selected
                var toRemove = [];
                var i = this.children.length;
                while (i--)
                    toRemove.push(this.children[i]);
                var i = toRemove.length;
                while (i--)
                    if (typeof (toRemove[i]) !== "undefined")
                        if (toRemove[i] instanceof Animate.BehaviourAsset && toRemove[i].parameters[0].value == ":")
                            this.removeItem(toRemove[i]);
            }
            else if (event.item.text == "Edit Portal") {
                Animate.PortalForm.getSingleton().showForm(this.mContextNode, null, null);
            }
            else if (event.item.text == "Create Behaviour") {
                var context = Animate.Application.getInstance().canvasContext;
                Animate.BehaviourPicker.getSingleton().show(Animate.Application.getInstance(), context.element.offset().left, context.element.offset().top, false, true);
            }
            else if (event.item.text == "Create Comment") {
                var context = Animate.Application.getInstance().canvasContext;
                var comment = new Animate.BehaviourComment(this, "Comment");
                comment.element.addClass("scale-in-animation");
                comment.css({ left: this.mX + "px", top: this.mY + "px", width: "100px", height: "60px" });
            }
            else if (event.item.text == "Create Input" || event.item.text == "Create Output"
                || event.item.text == "Create Parameter" || event.item.text == "Create Product") {
                //Define the type of portal
                var type = Animate.PortalType.INPUT;
                if (event.item.text == "Create Output")
                    type = Animate.PortalType.OUTPUT;
                else if (event.item.text == "Create Parameter")
                    type = Animate.PortalType.PARAMETER;
                if (event.item.text == "Create Product")
                    type = Animate.PortalType.PRODUCT;
                if (this.mContextNode)
                    Animate.PortalForm.getSingleton().showForm(this.mContextNode, type, null);
                else
                    Animate.PortalForm.getSingleton().showForm(this, type, event.item.text);
            }
            this.onContextHide(Animate.WindowEvents.HIDDEN, null);
        };
        /*
        * Recurssively creates a list of assets used in this scene
        */
        Canvas.prototype.getAssetList = function (asset, assetMap) {
            if (!asset)
                return;
            if (assetMap.indexOf(asset.shallowId) == -1)
                assetMap.push(asset.shallowId);
            var project = Animate.User.get.project;
            var properties = asset.properties.variables;
            for (var i = 0, l = properties.length; i < l; i++)
                if (properties[i].type == Animate.ParameterType.ASSET)
                    this.getAssetList(project.getAssetByShallowId(parseInt(properties[i].value.selected)), assetMap);
                else if (properties[i].type == Animate.ParameterType.ASSET_LIST)
                    this.getAssetList(project.getAssetByShallowId(parseInt(properties[i].value.selected)), assetMap);
        };
        Canvas.prototype.onAssetEdited = function (e, event, sender) {
            // Build the scene references in case some assets were added and not accounted for
            this.buildSceneReferences();
        };
        /*
        * Creates the asset and group arrays associated with this container
        */
        Canvas.prototype.buildSceneReferences = function () {
            var curAssets = [];
            var curGroups = [];
            var children = this.children;
            var project = Animate.User.get.project;
            for (var i = 0; i < children.length; i++) {
                if (children[i] instanceof Animate.Behaviour) {
                    var behaviour = children[i];
                    var portals = behaviour.portals;
                    //Check all behaviours and their portals
                    for (var ii = 0; ii < portals.length; ii++) {
                        //If there is an asset previously and its being removed
                        if (portals[ii].dataType == Animate.ParameterType.ASSET && portals[ii].value != null && portals[ii].value.selected) {
                            var asset = project.getAssetByShallowId(parseInt(portals[ii].value.selected));
                            if (asset)
                                this.getAssetList(asset, curAssets);
                        }
                        else if (portals[ii].dataType == Animate.ParameterType.GROUP && portals[ii].value != null && portals[ii].value != "") {
                            var group = Animate.TreeViewScene.getSingleton().findNode("groupID", portals[ii].value);
                            if (group)
                                curGroups.push(group.groupID);
                        }
                        else if (portals[ii].dataType == Animate.ParameterType.ASSET_LIST && portals[ii].value != null && portals[ii].value.selectedAssets.length > 0) {
                            for (var a, al = portals[ii].value.selectedAssets.length; a < al; a++) {
                                var asset = project.getAssetByShallowId(portals[ii].value.selectedAssets[a]);
                                if (asset)
                                    this.getAssetList(asset, curAssets);
                            }
                        }
                    }
                }
            }
            var pManager = Animate.PluginManager.getSingleton();
            var addEvent = new Animate.AssetContainerEvent(Animate.EditorEvents.ASSET_ADDED_TO_CONTAINER, null, this._behaviourContainer);
            var removeEvent = new Animate.AssetContainerEvent(Animate.EditorEvents.ASSET_REMOVED_FROM_CONTAINER, null, this._behaviourContainer);
            // Notify of asset removals
            for (var i = 0, l = this._containerReferences.assets.length; i < l; i++)
                if (curAssets.indexOf(this._containerReferences.assets[i]) == -1) {
                    removeEvent.asset = project.getAssetByShallowId(this._containerReferences.assets[i]);
                    pManager.dispatchEvent(removeEvent);
                }
            // Notify of asset additions			
            for (var i = 0, l = curAssets.length; i < l; i++)
                if (this._containerReferences.assets.indexOf(curAssets[i]) == -1) {
                    addEvent.asset = project.getAssetByShallowId(curAssets[i]);
                    pManager.dispatchEvent(addEvent);
                }
            this._containerReferences.assets = curAssets;
            this._containerReferences.groups = curGroups;
        };
        /**
        * Called when the property grid fires an edited event.
        * @param {PropertyGridEvents} response
        * @param {PropertyGridEvent} event
        */
        Canvas.prototype.onPropertyGridEdited = function (response, event) {
            for (var i = 0; i < this.children.length; i++) {
                if (event.id == this.children[i]) {
                    if (this.children[i] instanceof Animate.BehaviourComment) {
                        var comment = this.children[i];
                        comment.text = event.propertyValue;
                    }
                    else if (this.children[i] instanceof Animate.Link) {
                        var link = this.children[i];
                        var num = event.propertyValue.selected;
                        num = parseInt(num);
                        if (isNaN(num))
                            num = 1;
                        link.frameDelay = num;
                        link.draw();
                    }
                    else {
                        var portals = this.children[i].portals;
                        //Check all behaviours and their portals
                        for (var ii = 0; ii < portals.length; ii++) {
                            var item = this.children[i];
                            //If the portal name is the same as the one that is being edited
                            if (portals[ii].name == event.propertyName) {
                                if (item instanceof Animate.BehaviourAsset)
                                    item.asset = event.propertyValue;
                                item.portals[ii].value = event.propertyValue;
                                //Notify of change
                                this.dispatchEvent(new CanvasEvent(CanvasEvents.MODIFIED, this));
                                this.buildSceneReferences();
                                return;
                            }
                        }
                    }
                }
            }
        };
        /**
        * When we click ok on the portal form
        */
        Canvas.prototype.OnPortalConfirm = function (response, e) {
            if (this.element.is(':visible') == false)
                return;
            if (e.text == "Ok") {
                //If we are editing a portal
                if (this.mContextNode instanceof Animate.Portal) {
                    var portal = this.mContextNode;
                    var oldName = portal.name;
                    portal.edit(Animate.PortalForm.getSingleton().name, Animate.PortalForm.getSingleton().portalType, Animate.PortalForm.getSingleton().value, Animate.PortalForm.getSingleton().parameterType);
                    var p = portal.parent;
                    if (p instanceof Animate.BehaviourPortal)
                        p.text = portal.name;
                    //Show in prop editor
                    var behaviour = portal.behaviour;
                    var toEdit = new Animate.EditableSet();
                    var i = behaviour.parameters.length;
                    while (i--)
                        if (behaviour.parameters[i].links.length <= 0)
                            toEdit.addVar(behaviour.parameters[i].name, behaviour.parameters[i].value, behaviour.parameters[i].dataType, behaviour.element.text(), null);
                    Animate.PropertyGrid.getSingleton().editableObject(toEdit, behaviour.text + " - " + behaviour.id, behaviour, "");
                    //Notify of change
                    Animate.PluginManager.getSingleton().dispatchEvent(new Animate.PluginPortalEvent(Animate.EditorEvents.PORTAL_EDITED, oldName, this._behaviourContainer, portal, this));
                    return;
                }
                else if (this.mContextNode instanceof Animate.Behaviour) {
                    //Create a portal on a Behaviour
                    var portal = this.mContextNode.addPortal(Animate.PortalForm.getSingleton().portalType, Animate.PortalForm.getSingleton().name, Animate.PortalForm.getSingleton().value, Animate.PortalForm.getSingleton().parameterType, true);
                    portal.customPortal = true;
                }
                else {
                    //Create a canvas portal
                    var newNode = new Animate.BehaviourPortal(this, Animate.PortalForm.getSingleton().name, Animate.PortalForm.getSingleton().portalType, Animate.PortalForm.getSingleton().parameterType, Animate.PortalForm.getSingleton().value);
                    newNode.css({ "left": this.mX + "px", "top": this.mY + "px", "position": "absolute" });
                    //Notify of change
                    Animate.PluginManager.getSingleton().dispatchEvent(new Animate.PluginPortalEvent(Animate.EditorEvents.PORTAL_ADDED, "", this._behaviourContainer, newNode.portals[0], this));
                }
                //Notify of change
                this.dispatchEvent(new CanvasEvent(CanvasEvents.MODIFIED, this));
            }
        };
        /**
        * When the context is hidden we remove the event listeners.
        */
        Canvas.prototype.onContextHide = function (response, e) {
            var context = Animate.Application.getInstance().canvasContext;
            context.off(Animate.WindowEvents.HIDDEN, this.onContextHide, this);
            context.off(Animate.ContextMenuEvents.ITEM_CLICKED, this.onContextSelect, this);
        };
        /**
        * Called when the context menu is about to open
        * @param {any} e The jQuery event object
        */
        Canvas.prototype.onContext = function (e) {
            if (this.element.is(':visible') == false)
                return;
            //First get the x and y cords
            var p = this.parent.element;
            var offset = this.element.offset();
            var scrollX = p.scrollLeft();
            var scrollY = p.scrollTop();
            var mouse = { x: e.pageX - offset.left - scrollX, y: e.pageY - offset.top - scrollY };
            this.mX = mouse.x + scrollX;
            this.mY = mouse.y + scrollY;
            //Now hook the context events
            var targ = jQuery(e.target);
            var targetComp = targ.data("component");
            var context = Animate.Application.getInstance().canvasContext;
            this.mContextNode = targ.data("component");
            //If the canvas
            if (targetComp instanceof Canvas) {
                this.mContextNode = null;
                e.preventDefault();
                context.showContext(e.pageX, e.pageY, null);
                context.element.css({ "width": "+=20px" });
                context.on(Animate.WindowEvents.HIDDEN, this.onContextHide, this);
                context.on(Animate.ContextMenuEvents.ITEM_CLICKED, this.onContextSelect, this);
            }
            else if (targetComp instanceof Animate.Portal) {
                e.preventDefault();
                context.showContext(e.pageX, e.pageY, this.mContextNode);
                context.element.css({ "width": "+=20px" });
                context.on(Animate.WindowEvents.HIDDEN, this.onContextHide, this);
                context.on(Animate.ContextMenuEvents.ITEM_CLICKED, this.onContextSelect, this);
            }
            else if (targetComp instanceof Animate.Link) {
                e.preventDefault();
                var link = targ.data("component");
                var hit = link.hitTestPoint(e);
                if (hit) {
                    context.showContext(e.pageX, e.pageY, link);
                    context.element.css({ "width": "+=20px" });
                    context.on(Animate.WindowEvents.HIDDEN, this.onContextHide, this);
                    context.on(Animate.ContextMenuEvents.ITEM_CLICKED, this.onContextSelect, this);
                }
            }
            else if (targetComp instanceof Animate.BehaviourInstance || targetComp instanceof Animate.BehaviourAsset || targetComp instanceof Animate.BehaviourPortal) {
                e.preventDefault();
                context.showContext(e.pageX, e.pageY, this.mContextNode);
                context.element.css({ "width": "+=20px" });
                context.on(Animate.WindowEvents.HIDDEN, this.onContextHide, this);
                context.on(Animate.ContextMenuEvents.ITEM_CLICKED, this.onContextSelect, this);
            }
            else if (targetComp instanceof Animate.BehaviourComment)
                e.preventDefault();
            else if (targetComp instanceof Animate.Behaviour) {
                e.preventDefault();
                context.showContext(e.pageX, e.pageY, this.mContextNode);
                context.element.css({ "width": "+=20px" });
                context.on(Animate.WindowEvents.HIDDEN, this.onContextHide, this);
                context.on(Animate.ContextMenuEvents.ITEM_CLICKED, this.onContextSelect, this);
            }
            else
                context.hide();
        };
        /**
        * When we have chosen a behaviour
        */
        Canvas.prototype.onBehaviourPicked = function (response, event) {
            if (this.element.is(':visible') == false)
                return;
            //Check if this is the selected Canvas
            if (this.element.parent().parent().length == 0)
                return;
            var template = Animate.PluginManager.getSingleton().getTemplate(event.behaviourName);
            if (template) {
                this.createNode(template, this.mX, this.mY);
            }
        };
        /**
        * Iteratively goes through each container to check if its pointing to this behaviour
        */
        Canvas.prototype.isCyclicDependency = function (container, ref) {
            var project = Animate.User.get.project;
            var thisContainer = this._behaviourContainer;
            var json = null;
            var canvas = null;
            // If this container is the same as the one we are testing
            // then return true
            if (container == thisContainer)
                return true;
            // Get the most updated JSON
            canvas = Animate.CanvasTab.getSingleton().getTabCanvas(container.id);
            if (canvas && !canvas._behaviourContainer.saved)
                json = canvas.buildDataObject();
            else
                json = container.json;
            if (!container.json)
                return false;
            // Go through each of the items to see if got any instance that might refer to this container
            var items = json.items;
            for (var i = 0, l = items.length; i < l; i++)
                if (items[i].type == "BehaviourInstance") {
                    var childContainer = project.getBehaviourByShallowId(items[i].containerId);
                    if (childContainer && this.isCyclicDependency(childContainer, ref)) {
                        ref = childContainer.name;
                        return true;
                    }
                }
            return false;
        };
        /**
        * This will create a canvas node based on the template given
        * @param {BehaviourDefinition} template The definition of the node
        * @param {number} x The x position of where the node shoule be placed
        * @param {number} y The y position of where the node shoule be placed
        * @param {BehaviourContainer} container This is only applicable if we are dropping a node that represents another behaviour container. This last parameter
        * is the actual behaviour container
        * @returns {Behaviour}
        */
        Canvas.prototype.createNode = function (template, x, y, container) {
            var toAdd = null;
            if (template.behaviourName == "Instance") {
                var nameOfBehaviour = "";
                var cyclic = this.isCyclicDependency(container, nameOfBehaviour);
                if (cyclic) {
                    Animate.MessageBox.show("You have a cylic dependency with the behaviour '" + nameOfBehaviour + "'", ["Ok"], null, null);
                    return null;
                }
                toAdd = new Animate.BehaviourInstance(this, container);
            }
            else if (template.behaviourName == "Asset")
                toAdd = new Animate.BehaviourAsset(this, template.behaviourName);
            else if (template.behaviourName == "Script")
                toAdd = new Animate.BehaviourScript(this, 0, template.behaviourName);
            else
                toAdd = new Animate.Behaviour(this, template.behaviourName);
            if (template.behaviourName != "Instance")
                toAdd.text = template.behaviourName;
            var portalTemplates = null;
            if (template.createPortalsTemplates)
                portalTemplates = template.createPortalsTemplates();
            //Check for name duplicates
            if (portalTemplates) {
                for (var i = 0; i < portalTemplates.length; i++)
                    for (var ii = 0; ii < portalTemplates.length; ii++)
                        if (ii != i && portalTemplates[i].name == portalTemplates[ii].name) {
                            Animate.MessageBox.show("One of the portals " + portalTemplates[ii].name + " has the same name as another.", Array("Ok"), null, null);
                            toAdd.dispose();
                            toAdd = null;
                            return;
                        }
                //Create each of the portals
                for (var i = 0; i < portalTemplates.length; i++) {
                    var portal = toAdd.addPortal(portalTemplates[i].type, portalTemplates[i].name, portalTemplates[i].value, portalTemplates[i].dataType, false);
                    if (toAdd instanceof Animate.BehaviourScript == false)
                        portal.customPortal = false;
                }
            }
            x = parseInt(x.toString());
            y = parseInt(y.toString());
            x = x - x % 10;
            y = y - y % 10;
            toAdd.element.css({ left: x + "px", top: y + "px" });
            toAdd.element.addClass("scale-in-animation");
            toAdd.updateDimensions();
            //Notify of change
            this.dispatchEvent(new CanvasEvent(CanvasEvents.MODIFIED, this));
            return toAdd;
        };
        /**
        * Called when a behaviour is renamed
        */
        Canvas.prototype.onBehaviourRename = function (e, event) {
            Animate.RenameForm.getSingleton().off(Animate.RenameFormEvents.OBJECT_RENAMED, this.onBehaviourRename, this);
            var toEdit = null;
            if (event.object instanceof Animate.BehaviourShortcut)
                toEdit = event.object.originalNode;
            else
                toEdit = event.object;
            toEdit.text = event.name;
            toEdit.alias = event.name;
            //Check if there are any shortcuts and make sure they are renamed
            var i = this.children.length;
            while (i--)
                if (this.children[i] instanceof Animate.BehaviourShortcut && this.children[i].originalNode == toEdit) {
                    this.children[i].text = event.name;
                    this.children[i].alias = event.name;
                }
        };
        /**
        * Catch the key down events.
        * @param {any} e The jQuery event object
        */
        Canvas.prototype.onKeyDown = function (e) {
            if (this.element.is(':visible') == false)
                return;
            if (jQuery(e.target).is("input"))
                return;
            var focusObj = Animate.Application.getInstance().focusObj;
            if (Animate.Application.getInstance().focusObj != null) {
                //If F2 pressed
                if (e.keyCode == 113) {
                    if (focusObj instanceof Animate.BehaviourComment) {
                        focusObj.enterText();
                        return;
                    }
                    else if (focusObj instanceof Animate.BehaviourPortal)
                        return;
                    else if (Animate.Application.getInstance().focusObj instanceof Animate.Behaviour) {
                        Animate.RenameForm.getSingleton().on(Animate.RenameFormEvents.OBJECT_RENAMED, this.onBehaviourRename, this);
                        Animate.RenameForm.getSingleton().showForm(Animate.Application.getInstance().focusObj, Animate.Application.getInstance().focusObj.element.text());
                        return;
                    }
                }
                else if (e.keyCode == 67) {
                    if (e.ctrlKey)
                        return;
                    //If a shortcut go to the original
                    if (focusObj instanceof Animate.BehaviourShortcut) {
                        this.selectItem(null);
                        focusObj.selected = false;
                        this.selectItem(focusObj.originalNode);
                        this.element.parent().scrollTo('#' + focusObj.originalNode.id, 500);
                        return;
                    }
                }
                else if (e.keyCode == 46) {
                    //Remove all selected
                    Animate.Toolbar.getSingleton().onDelete();
                }
            }
        };
        /**
        * When we double click the canvas we show the behaviour picker.
        * @param {any} e The jQuery event object
        */
        Canvas.prototype.onDoubleClick = function (e) {
            if (jQuery(e.target).is("textarea"))
                return;
            var comp = jQuery(e.target).data("component");
            //If a comment edit it
            if (comp instanceof Animate.BehaviourComment) {
                comp.enterText();
                return;
            }
            else if (comp instanceof Animate.BehaviourInstance) {
                var tree = Animate.TreeViewScene.getSingleton();
                var node = tree.findNode("behaviour", comp._behaviourContainer);
                tree.selectNode(node);
                tree.onDblClick(null);
                return;
            }
            else if (comp instanceof Animate.BehaviourScript) {
                comp.edit();
                return;
            }
            var p = this.parent.element;
            var offset = this.element.offset();
            var scrollX = p.scrollLeft();
            var scrollY = p.scrollTop();
            var mouse = { x: e.pageX - offset.left - scrollX, y: e.pageY - offset.top - scrollY };
            this.mX = mouse.x + scrollX;
            this.mY = mouse.y + scrollY;
            Animate.BehaviourPicker.getSingleton().show(Animate.Application.getInstance(), e.pageX, e.pageY, false, true);
            e.preventDefault();
        };
        /**
        * This is called to set the selected canvas item.
        * @param {Component} comp The component to select
        */
        Canvas.prototype.selectItem = function (comp) {
            if (comp == null) {
                //Remove all glows
                var children = this.children;
                for (var i = 0, l = children.length; i < l; i++) {
                    children[i].element.removeClass("green-glow-strong");
                    if (children[i].selected)
                        children[i].selected = false;
                }
                //Set the selected item
                Canvas.lastSelectedItem = null;
                Animate.PropertyGrid.getSingleton().editableObject(null, "", null, "");
                Animate.Toolbar.getSingleton().itemSelected(null);
                return;
            }
            if (comp.selected) {
                comp.element.removeClass("green-glow-strong");
                comp.selected = false;
                Canvas.lastSelectedItem = null;
                Animate.PropertyGrid.getSingleton().editableObject(null, "", null, "");
                Animate.Toolbar.getSingleton().itemSelected(null);
                return;
            }
            comp.selected = true;
            //Set the selected item
            Canvas.lastSelectedItem = comp;
            if (comp instanceof Animate.Behaviour) {
                comp.element.removeClass("scale-in-animation");
                var toEdit = new Animate.EditableSet();
                //Hand the item to the editor
                if (comp instanceof Animate.BehaviourComment) {
                    toEdit.addVar("text", comp.text, Animate.ParameterType.STRING, null, null);
                    Animate.PropertyGrid.getSingleton().editableObject(toEdit, "Comment", comp, "");
                }
                else if (comp instanceof Animate.BehaviourShortcut == false) {
                    var len = comp.parameters.length;
                    for (var i = 0; i < len; i++)
                        if (comp.parameters[i].links.length <= 0)
                            toEdit.addVar(comp.parameters[i].name, comp.parameters[i].value, comp.parameters[i].dataType, comp.element.text(), null);
                    Animate.PropertyGrid.getSingleton().editableObject(toEdit, comp.text + " - " + comp.id, comp, "");
                }
                //Highlight all shortcuts
                var children = this.children;
                var i = children.length;
                while (i--)
                    if (typeof (children[i]) !== "undefined")
                        if (children[i] instanceof Animate.BehaviourShortcut && children[i].originalNode == comp)
                            children[i].element.addClass("green-glow-strong");
                        else
                            children[i].element.removeClass("green-glow-strong");
            }
            else if (comp instanceof Animate.Link && comp.startPortal.type == Animate.PortalType.OUTPUT) {
                var toEdit = new Animate.EditableSet();
                toEdit.addVar("Frame delay", comp.frameDelay, Animate.ParameterType.NUMBER, "Link Properties", null);
                Animate.PropertyGrid.getSingleton().editableObject(toEdit, "Link - " + comp.id, comp, "");
            }
            Animate.Toolbar.getSingleton().itemSelected(comp);
        };
        /**
        * Called when we click down on the canvas
        * @param {any} e The jQuery event object
        */
        Canvas.prototype.onMouseDown = function (e) {
            // Stops the text select when we drag
            e.preventDefault();
            // If we click the canvas - it counts as a deselect
            var comp = jQuery(e.currentTarget).data("component");
            if (comp instanceof Canvas && !e.ctrlKey) {
                this.selectItem(null);
                return;
            }
        };
        /**
        * Called when we click up on the canvas
        * @param {any} e The jQuery event object
        */
        Canvas.prototype.onMouseUp = function (e) {
            //if ( e.which != 1 )
            //	return;
            var comp = jQuery(e.currentTarget).data("component");
            //Unselect all other items
            if (!e.ctrlKey)
                for (var i = 0; i < this.children.length; i++)
                    this.children[i].selected = false;
            if (comp instanceof Animate.Behaviour) {
                comp.element.removeClass("scale-in-animation");
                this.selectItem(comp);
                return;
            }
            //Not a behaviour so lets see if its a link	
            //Make sure we actually hit a link
            var len = this.children.length;
            for (var i = 0; i < len; i++) {
                comp = this.children[i];
                if (comp instanceof Animate.Link) {
                    var hit = comp.hitTestPoint(e);
                    if (hit) {
                        this.selectItem(comp);
                        return;
                    }
                }
            }
        };
        /**
        * This is called externally when the canvas has been selected. We use this
        * function to remove any animated elements
        */
        Canvas.prototype.onSelected = function () {
            var len = this.children.length;
            for (var i = 0; i < len; i++)
                this.children[i].element.removeClass("scale-in-animation");
        };
        /**
        * Use this function to add a child to this component. This has the same effect of adding some HTML as a child of another piece of HTML.
        * It uses the jQuery append function to achieve this functionality.
        * @param {any} child The child to add. Valid parameters are valid HTML code or other Components.
        * @returns {Component} The child as a Component.
        */
        Canvas.prototype.addChild = function (child) {
            //call super
            var toRet = Animate.Component.prototype.addChild.call(this, child);
            //if ( toRet )
            //	DragManager.getSingleton().setDraggable( toRet, true, this, null );
            if (toRet instanceof Animate.Behaviour)
                toRet.element.draggable({ drag: this._proxyMoving, start: this._proxyStartDrag, stop: this._proxyStopDrag, cancel: ".portal", scroll: true, scrollSensitivity: 10 });
            toRet.element.on("mouseup", this.mUpProxy);
            return toRet;
        };
        /**
        * Use this function to remove a child from this component. It uses the jQuery detach function to achieve this functionality.
        * @param {Component} child The child to remove. Valid parameters are valid Components.
        * @returns {Component} The child as a Component.
        */
        Canvas.prototype.removeChild = function (child) {
            //call super
            var toRet = Animate.Component.prototype.removeChild.call(this, child);
            if (toRet)
                toRet.element.off("mouseup", this.mUpProxy);
            return toRet;
        };
        /**
        * Called when an item is moving
        */
        Canvas.prototype.onChildMoving = function (e, ui) {
            //var canvasParent : JQuery = this.element;
            var target = jQuery(e.target).data("component");
            //Upadte the links
            var i = target.portals.length;
            while (i--)
                target.portals[i].updateAllLinks();
            this.checkDimensions();
        };
        /**
        * This function is called when animate is reading in saved data from the server.
        * @param {any} data
        */
        Canvas.prototype.open = function (data) {
        };
        /**
        * This function is called when animate is writing data to the database.
        * @param {any} items The items we need to build
        * @returns {CanvasToken}
        */
        Canvas.prototype.buildDataObject = function (items) {
            if (items === void 0) { items = null; }
            var data = new Animate.CanvasToken(this.behaviourContainer.shallowId);
            data.name = this._behaviourContainer.name;
            data.properties = this._behaviourContainer.properties.tokenize();
            if (items == null)
                items = this.children;
            //Let the plugins save their data			
            Animate.PluginManager.getSingleton().dispatchEvent(new Animate.ContainerDataEvent(Animate.EditorEvents.CONTAINER_SAVING, this._behaviourContainer, data.plugins, this._containerReferences));
            //Create a multidimension array and pass each of the project dependencies
            var len = items.length;
            for (var i = 0; i < len; i++) {
                //First export all the standard item data
                data.items[i] = new Animate.CanvasTokenItem();
                data.items[i].id = items[i].id;
                data.items[i].type = items[i].constructor.name;
                data.items[i].left = items[i].element.css("left");
                data.items[i].top = items[i].element.css("top");
                data.items[i].zIndex = items[i].element.css("z-index");
                data.items[i].position = items[i].element.css("position");
                //Now do all portals if its a behaviour
                if (items[i] instanceof Animate.Behaviour) {
                    if (items[i] instanceof Animate.BehaviourComment)
                        data.items[i].text = items[i].text;
                    else {
                        data.items[i].name = items[i].originalName;
                        data.items[i].alias = (items[i].alias ? items[i].alias : "");
                    }
                    if (items[i] instanceof Animate.BehaviourAsset)
                        data.items[i].assetID = (items[i].asset ? items[i].asset.shallowId : 0);
                    else if (items[i] instanceof Animate.BehaviourScript) {
                        //First initialize the script node to make sure we have a DB entry
                        items[i].initializeDB();
                        if (items[i].shallowId === 0)
                            continue;
                        data.items[i].shallowId = items[i].shallowId;
                    }
                    else if (items[i] instanceof Animate.BehaviourShortcut) {
                        data.items[i].behaviourID = (items[i].originalNode ? items[i].originalNode.id : "");
                    }
                    else if (items[i] instanceof Animate.BehaviourInstance)
                        data.items[i].containerId = (items[i].behaviourContainer ? items[i].behaviourContainer.shallowId : 0);
                    if (items[i] instanceof Animate.BehaviourPortal) {
                        data.items[i].portalType = items[i].portaltype;
                        data.items[i].dataType = items[i].dataType;
                        data.items[i].value = items[i].value;
                    }
                    else {
                        data.items[i].portals = new Array();
                        var portalsArr = data.items[i].portals;
                        var len2 = items[i].portals.length;
                        for (var ii = 0; ii < len2; ii++) {
                            portalsArr[ii] = new Animate.CanvasTokenPortal();
                            portalsArr[ii].name = items[i].portals[ii].name;
                            portalsArr[ii].value = items[i].portals[ii].value;
                            portalsArr[ii].type = items[i].portals[ii].type;
                            portalsArr[ii].dataType = items[i].portals[ii].dataType;
                            portalsArr[ii].customPortal = items[i].portals[ii].customPortal;
                        }
                    }
                }
                else if (items[i] instanceof Animate.Link) {
                    var sbehaviour = items[i].startPortal.parent;
                    var ebehaviour = items[i].endPortal.parent;
                    data.items[i].frameDelay = items[i].frameDelay;
                    data.items[i].startPortal = items[i].startPortal.name;
                    data.items[i].endPortal = items[i].endPortal.name;
                    data.items[i].startBehaviour = sbehaviour.id;
                    data.items[i].endBehaviour = ebehaviour.id;
                    //Create additional data for shortcuts
                    data.items[i].targetStartBehaviour = (sbehaviour instanceof Animate.BehaviourShortcut ? sbehaviour.originalNode.id : sbehaviour.id);
                    data.items[i].targetEndBehaviour = (ebehaviour instanceof Animate.BehaviourShortcut ? ebehaviour.originalNode.id : ebehaviour.id);
                }
            }
            return data;
        };
        /**
        * This function is called when a behaviour is double clicked,
        * a canvas is created and we try and load the behavious contents.
        * @param {CanvasToken} dataToken You can optionally pass in an data token object. These objects must contain information on each of the items we are adding to the canvas.
        * @param {boolean} clearItems If this is set to true the function will clear all items already on the Canvas.
        * @returns {any}
        */
        Canvas.prototype.openFromDataObject = function (dataToken, clearItems, addSceneAssets) {
            if (clearItems === void 0) { clearItems = true; }
            if (addSceneAssets === void 0) { addSceneAssets = false; }
            //Create the data object from the JSON
            var jsonObj = null;
            var pManager = Animate.PluginManager.getSingleton();
            if (dataToken)
                jsonObj = dataToken;
            else if (this._behaviourContainer.json !== null)
                jsonObj = this._behaviourContainer.json;
            //Cleanup the 
            if (clearItems)
                while (this.children.length > 0)
                    this.children[0].dispose();
            var links = [];
            var shortcuts = [];
            if (jsonObj && jsonObj.items) {
                for (var i in jsonObj.items) {
                    var item = null;
                    //Create the GUI element
                    if (jsonObj.items[i].type == "BehaviourPortal") {
                        //Check if there is already a portal with that name. if it does then it
                        //is ignored.
                        var nameInUse = false;
                        var len = this.children.length;
                        for (var ii = 0; ii < len; ii++)
                            if (this.children[ii] instanceof Animate.BehaviourPortal &&
                                this.children[ii].element.text() == jsonObj.items[i].name) {
                                nameInUse = true;
                                Animate.Logger.getSingleton().logMessage("A portal with the name '" + jsonObj.items[i].name +
                                    "' already exists on the Canvas.", null, Animate.LogType.ERROR);
                                break;
                            }
                        if (nameInUse == false) {
                            item = new Animate.BehaviourPortal(this, jsonObj.items[i].name, jsonObj.items[i].portalType, jsonObj.items[i].dataType, jsonObj.items[i].value);
                            item.requiresUpdated = true;
                        }
                    }
                    else if (jsonObj.items[i].type == "BehaviourAsset")
                        item = new Animate.BehaviourAsset(this, jsonObj.items[i].name);
                    else if (jsonObj.items[i].type == "BehaviourScript")
                        item = new Animate.BehaviourScript(this, jsonObj.items[i].shallowId, jsonObj.items[i].name, !clearItems);
                    else if (jsonObj.items[i].type == "BehaviourInstance") {
                        var project = Animate.User.get.project;
                        var container = project.getBehaviourByShallowId(jsonObj.items[i].containerId);
                        if (!container)
                            continue;
                        item = new Animate.BehaviourInstance(this, container, false);
                    }
                    else if (jsonObj.items[i].type == "BehaviourShortcut") {
                        item = new Animate.BehaviourShortcut(this, null, jsonObj.items[i].name);
                        shortcuts.push(new ShortCutHelper(item, jsonObj.items[i]));
                    }
                    else if (jsonObj.items[i].type == "BehaviourComment")
                        item = new Animate.BehaviourComment(this, jsonObj.items[i].text);
                    else if (jsonObj.items[i].type == "Behaviour")
                        item = new Animate.Behaviour(this, jsonObj.items[i].name);
                    else if (jsonObj.items[i].type == "Link") {
                        var l = new Animate.Link(this);
                        item = l;
                        //Links we treat differerntly. They need all the behaviours 
                        //loaded first. So we do that, and keep each link in an array
                        //to load after the behaviours
                        links.push(l);
                        l.frameDelay = (jsonObj.items[i].frameDelay !== undefined ? jsonObj.items[i].frameDelay : 1);
                        //Store some temp data on the tag
                        l.tag = {};
                        l.tag.startPortalName = jsonObj.items[i].startPortal;
                        l.tag.endPortalName = jsonObj.items[i].endPortal;
                        l.tag.startBehaviourID = jsonObj.items[i].startBehaviour;
                        l.tag.endBehaviourID = jsonObj.items[i].endBehaviour;
                        l.tag.startBehaviour = null;
                        l.tag.endBehaviour = null;
                    }
                    //Check if it was created ok
                    if (item != null) {
                        item.savedID = jsonObj.items[i].id;
                        //Set the positioning etc...
                        item.element.css({
                            "left": jsonObj.items[i].left,
                            "top": jsonObj.items[i].top,
                            "z-index": jsonObj.items[i].zIndex,
                            "position": jsonObj.items[i].position
                        });
                        //Add the portals if they exist
                        if (jsonObj.items[i].portals) {
                            for (var iii = 0; iii < jsonObj.items[i].portals.length; iii++) {
                                var portal = item.addPortal(jsonObj.items[i].portals[iii].type, jsonObj.items[i].portals[iii].name, jsonObj.items[i].portals[iii].value, jsonObj.items[i].portals[iii].dataType, false);
                                portal.customPortal = jsonObj.items[i].portals[iii].customPortal;
                                if (portal.customPortal === undefined || portal.customPortal == null)
                                    portal.customPortal = false;
                            }
                            //Set the alias text if it exists
                            if (jsonObj.items[i].alias && jsonObj.items[i].alias != "" && jsonObj.items[i].alias != null) {
                                item.text = jsonObj.items[i].alias;
                                item.alias = jsonObj.items[i].alias;
                            }
                        }
                        if (item instanceof Animate.Behaviour)
                            item.updateDimensions();
                    }
                }
            }
            //Link any shortcut nodes
            for (var li = 0, lil = this.children.length; li < lil; li++) {
                for (var ii = 0, lii = shortcuts.length; ii < lii; ii++)
                    if (this.children[li].savedID == shortcuts[ii].datum.behaviourID) {
                        shortcuts[ii].item.setOriginalNode(this.children[li], false);
                    }
            }
            //Now do each of the links
            for (var li = 0, llen = links.length; li < llen; li++) {
                var link = links[li];
                //We need to find the nodes first
                var len = this.children.length;
                for (var ii = 0; ii < len; ii++) {
                    if (link.tag.startBehaviourID == this.children[ii].savedID) {
                        var behaviour = this.children[ii];
                        link.tag.startBehaviour = behaviour;
                        //Now that the nodes have been set - we have to set the portals
                        for (var iii = 0; iii < behaviour.portals.length; iii++) {
                            var portal = behaviour.portals[iii];
                            if (link.tag.startPortalName == portal.name) {
                                link.startPortal = portal;
                                link.tag.startBehaviour = null;
                                portal.addLink(link);
                                break;
                            }
                        }
                    }
                    if (link.tag.endBehaviourID == this.children[ii].savedID) {
                        var behaviour = this.children[ii];
                        link.tag.endBehaviour = behaviour;
                        //Now that the nodes have been set - we have to set the portals
                        for (var iii = 0; iii < behaviour.portals.length; iii++) {
                            var portal = behaviour.portals[iii];
                            if (link.tag.endPortalName == portal.name) {
                                link.endPortal = portal;
                                link.tag.endBehaviour = null;
                                portal.addLink(link);
                                break;
                            }
                        }
                    }
                }
                if (link.startPortal == null)
                    link.dispose();
                else {
                    if (!link.endPortal || !link.startPortal || typeof link.startPortal == "string" || typeof link.endPortal == "string" || !link.endPortal.behaviour || !link.startPortal.behaviour) {
                        link.dispose();
                    }
                    else {
                        link.updatePoints();
                        link.element.css("pointer-events", "");
                    }
                }
                //Clear the temp tag
                link.tag = null;
            }
            for (var c = 0, cl = this.children.length; c < cl; c++)
                this.children[c].savedID = null;
            //Let the plugins open their data
            if (jsonObj && jsonObj.plugins)
                pManager.dispatchEvent(new Animate.ContainerDataEvent(Animate.EditorEvents.CONTAINER_OPENING, this._behaviourContainer, jsonObj.plugins));
            this.checkDimensions();
            this.buildSceneReferences();
        };
        /**
        * This function is called to make sure the canvas min width and min height variables are set
        */
        Canvas.prototype.checkDimensions = function () {
            //Make sure that the canvas is sized correctly
            var w = 0;
            var h = 0;
            var i = this.children.length;
            var child = null;
            while (i--) {
                child = this.children[i];
                var w2 = child.element.css("left");
                var w2a = w2.split("px");
                var w2n = parseFloat(w2a[0]) + child.element.width() + 5;
                var h2 = child.element.css("top");
                var h2a = h2.split("px");
                var h2n = parseFloat(h2a[0]) + child.element.height() + 5;
                if (w2n > w)
                    w = w2n;
                if (h2n > h)
                    h = h2n;
            }
            var minW = this.element.css("min-width");
            var minT = minW.split("px");
            var minWi = parseFloat(minT[0]);
            var minH = this.element.css("min-height");
            var minHT = minH.split("px");
            var minHi = parseFloat(minHT[0]);
            this.element.css({
                "min-width": (w > minWi ? w : minWi).toString() + "px",
                "min-height": (h > minHi ? h : minHi).toString() + "px"
            });
        };
        Object.defineProperty(Canvas.prototype, "behaviourContainer", {
            get: function () { return this._behaviourContainer; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Canvas.prototype, "containerReferences", {
            get: function () { return this._containerReferences; },
            enumerable: true,
            configurable: true
        });
        Canvas.lastSelectedItem = null;
        Canvas.snapping = false;
        return Canvas;
    })(Animate.Component);
    Animate.Canvas = Canvas;
})(Animate || (Animate = {}));
var Animate;
(function (Animate) {
    /**
    * The link class are the lines drawn from behavior portals
    */
    var Link = (function (_super) {
        __extends(Link, _super);
        /**
        * @param {Canvas} parent The parent {Canvas} of the link
        */
        function Link(parent) {
            // Call super-class constructor
            _super.call(this, "<canvas class='link' style='pointer-events:none'></canvas>", parent);
            this.element.data("dragEnabled", false);
            this.startPortal = null;
            this.endPortal = null;
            this.mMouseMoveProxy = this.onMouseMove.bind(this);
            this.mMouseUpProxy = this.onMouseUpAnchor.bind(this);
            this.mMouseUpAnchorProxy = this.onMouseUpAnchor.bind(this);
            this.mPrevPortal = null;
            this.frameDelay = 1;
            this.canvas = document.getElementById(this.id);
            this.graphics = this.canvas.getContext("2d");
            this.graphics.font = "14px arial";
            this.linePoints = [];
            this._selected = false;
        }
        /**
        * This is called when we need a link to start drawing. This will
        * follow the mouse and draw a link from the original mouse co-ordinates to an
        * end portal.
        * @param {Portal} startPortal
        * @param {any} e
        */
        Link.prototype.start = function (startPortal, e) {
            this.startPortal = startPortal;
            //Attach events
            this.parent.element.on("mousemove", this.mMouseMoveProxy);
            this.parent.element.on("mouseup", this.mMouseUpProxy);
            jQuery(".portal", this.parent.element).on("mouseup", this.mMouseUpAnchorProxy);
            //Get the start coords
            var positionOnCanvas = startPortal.positionOnCanvas();
            this.mStartClientX = e.clientX;
            this.mStartClientY = e.clientY;
            this.delta = (startPortal.element.width() / 2);
            this.mStartX = positionOnCanvas.left + this.delta;
            this.mStartY = positionOnCanvas.top + this.delta;
            this.element.css({
                left: this.mStartX + "px",
                top: this.mStartY + "px"
            });
            //Add glow
            if (this.startPortal.type == Animate.PortalType.PRODUCT)
                jQuery(".parameter").addClass("green-glow");
            else if (this.startPortal.type == Animate.PortalType.OUTPUT)
                jQuery(".input").addClass("green-glow");
            this.onMouseMove(e);
        };
        /**
        * Check if a point is actually selecting the link
        * @param {any} e
        */
        Link.prototype.hitTestPoint = function (e) {
            var mouse = Animate.Utils.getMousePos(e, this.id); // this.getMousePos( e );
            // get image data at the mouse x,y pixel
            var imageData = this.graphics.getImageData(mouse.x - 4, mouse.y - 4, 8, 8);
            var index = (mouse.x + mouse.y * imageData.width) * 4;
            // if the mouse pixel exists, select and break
            for (var i = 0; i < imageData.data.length; i++)
                if (imageData.data[i] > 0)
                    return true;
            return false;
        };
        Object.defineProperty(Link.prototype, "selected", {
            /**
            * Get or Set if the component is selected. When set to true a css class of 'selected' is added to the {Component}
            */
            get: function () { return this._selected; },
            /**
            * Get or Set if the component is selected. When set to true a css class of 'selected' is added to the {Component}
            */
            set: function (val) {
                // If we are not changing the selected state, then do nothing
                if (this._selected === val)
                    return;
                if (val)
                    this.element.data("selected", true);
                else
                    this.element.data("selected", false);
                this._selected = val;
                this.updatePoints();
            },
            enumerable: true,
            configurable: true
        });
        /**
        * Builds the dimensions of link based on the line points
        */
        Link.prototype.buildDimensions = function () {
            var linePoints = this.linePoints;
            var canvas = this.canvas;
            var length = linePoints.length;
            var left = 99999;
            var top = 99999;
            var right = 0;
            var bottom = 0;
            //get the extremes
            for (var i = 0; i < length; i++) {
                var x = linePoints[i].x;
                var y = linePoints[i].y;
                if (x < left)
                    left = x;
                else if (x > right)
                    right = x;
                if (y < top)
                    top = y;
                else if (y > bottom)
                    bottom = y;
            }
            var w = (right - left) + 4 + 20;
            var h = (bottom - top) + 4 + 20;
            if (w <= 4)
                w = 4 + 20;
            if (h <= 4)
                h = 4 + 20;
            canvas.width = w;
            canvas.height = h;
            //Set the element size and location
            this.element.css({
                left: (left - 5) + "px",
                top: (top - 5) + "px",
                width: w + "px",
                height: h + "px"
            });
            //Now reset the points so that they are relative
            for (var i = 0; i < length; i++) {
                var lp = linePoints[i];
                lp.x = (lp.x - left) + 5;
                lp.y = (lp.y - top) + 5;
            }
        };
        /**
        * Use this function to build the line points that define the link
        */
        Link.prototype.buildLinePoints = function (e) {
            var linePoints = this.linePoints;
            //We create a list of array points that define the link
            //Clear all points
            linePoints.splice(0, linePoints.length);
            //Get the start coords
            var positionOnCanvas = this.startPortal.positionOnCanvas();
            this.delta = (this.startPortal.element.width() / 2);
            var delta = this.delta;
            this.mStartX = positionOnCanvas.left + this.delta;
            this.mStartY = positionOnCanvas.top + this.delta;
            var pPosition = this.parent.element.offset();
            var startX = this.mStartX;
            var startY = this.mStartY;
            var endX = 0;
            var endY = 0;
            if (this.endPortal != null) {
                var endPositionOnCanvas = this.endPortal.positionOnCanvas();
                endX = endPositionOnCanvas.left + delta;
                endY = endPositionOnCanvas.top + delta;
            }
            else {
                if (e == null)
                    return;
                endX = startX + e.clientX - this.mStartClientX + delta;
                endY = startY + e.clientY - this.mStartClientY + delta;
            }
            //Now the end coords
            if (this.endPortal != null) {
                //If this loops on itself then we need to make it look nice.
                if (this.startPortal.behaviour == this.endPortal.behaviour &&
                    this.startPortal != this.endPortal) {
                    //First the start points
                    linePoints.push({ x: startX, y: startY });
                    if (this.startPortal.type == Animate.PortalType.OUTPUT)
                        linePoints.push({ x: startX + 10, y: startY });
                    else
                        linePoints.push({ x: startX, y: startY + 20 });
                    var behaviourLeft = parseFloat((this.endPortal.behaviour.element.css("left").split("px"))[0]);
                    var behaviourTop = parseFloat((this.endPortal.behaviour.element.css("top").split("px"))[0]);
                    var behaviourWidth = this.endPortal.behaviour.element.width();
                    var behaviourHeight = this.endPortal.behaviour.element.height();
                    if (this.startPortal.type == Animate.PortalType.PRODUCT)
                        linePoints.push({ x: behaviourLeft + behaviourWidth + 20, y: startY + 20 });
                    linePoints.push({ x: behaviourLeft + behaviourWidth + 20, y: startY });
                    linePoints.push({ x: behaviourLeft + behaviourWidth + 20, y: behaviourTop - 20 });
                    if (this.endPortal.type == Animate.PortalType.INPUT) {
                        linePoints.push({ x: behaviourLeft - 20, y: behaviourTop - 20 });
                        linePoints.push({ x: behaviourLeft - 20, y: endY });
                    }
                    if (this.endPortal.type == Animate.PortalType.PARAMETER || this.endPortal.type == Animate.PortalType.INPUT) {
                        //Set the 'just before end' point
                        if (this.endPortal.type == Animate.PortalType.INPUT)
                            linePoints.push({ x: endX - 10, y: endY });
                        else
                            linePoints.push({ x: endX, y: endY - 10 });
                    }
                }
                else if (this.endPortal.type == Animate.PortalType.PARAMETER || this.endPortal.type == Animate.PortalType.INPUT) {
                    //First the start points
                    linePoints.push({ x: startX, y: startY });
                    if (this.startPortal.type == Animate.PortalType.OUTPUT)
                        linePoints.push({ x: startX + 20, y: startY });
                    else
                        linePoints.push({ x: startX, y: startY + 30 });
                    //Set the 'just before end' point
                    if (this.endPortal.type == Animate.PortalType.INPUT)
                        linePoints.push({ x: endX - 20, y: endY });
                    else
                        linePoints.push({ x: endX, y: endY - 20 });
                }
            }
            else {
                //First the start points
                linePoints.push({ x: startX, y: startY });
                if (this.startPortal.type == Animate.PortalType.OUTPUT)
                    linePoints.push({ x: startX + 20, y: startY });
                else
                    linePoints.push({ x: startX, y: startY + 30 });
                linePoints.push({ x: endX - 20, y: endY });
            }
            //Finally set the end point
            linePoints.push({ x: endX, y: endY });
        };
        /**
        * Updates the link points (should they have been moved).
        */
        Link.prototype.updatePoints = function () {
            //First build the points
            this.buildLinePoints(null);
            //Set the dimensions
            this.buildDimensions();
            var graphics = this.graphics;
            //graphics.beginPath();
            graphics.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.draw();
        };
        /**
        * When the mouse moves we resize the stage.
        * @param {any} e
        */
        Link.prototype.onMouseMove = function (e) {
            var curTarget = this.mCurTarget;
            //Check if a portal
            if (curTarget != null)
                curTarget.element.css("cursor", "");
            var target = jQuery(e.target);
            this.endPortal = null;
            if (target.hasClass("portal")) {
                this.mCurTarget = target.data("component");
                curTarget = this.mCurTarget;
                this.endPortal = curTarget;
                if (curTarget.checkPortalLink(this.startPortal))
                    curTarget.element.css("cursor", "");
                else
                    curTarget.element.css("cursor", "no-drop");
            }
            else {
                target.css("cursor", "crosshair");
                this.mCurTarget = target.data("component");
            }
            //First build the points
            this.buildLinePoints(e);
            //Set the dimensions
            this.buildDimensions();
            var graphics = this.graphics;
            //graphics.beginPath();
            graphics.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.draw();
        };
        /**
       * Draws a series of lines
       */
        Link.prototype.draw = function () {
            var points = this.linePoints;
            var len = points.length;
            if (len == 0)
                return;
            var prevMidpt = null;
            var pt1 = null;
            var pt2 = null;
            var graphics = this.graphics;
            var element = this.element;
            var startPortal = this.startPortal;
            var endPortal = this.endPortal;
            var startPortalBehaviour = startPortal.behaviour;
            var endPortalBehaviour = (endPortal ? endPortal.behaviour : null);
            var loops = false;
            graphics.lineCap = 'round';
            graphics.lineJoin = 'round';
            if (startPortal.type != Animate.PortalType.OUTPUT) {
                //Set dashed lines (only some browsers support this)
                if (graphics.setLineDash !== undefined)
                    graphics.setLineDash([5]);
            }
            graphics.beginPath();
            //If this loops on itself then we need to make it look nice.
            if (endPortal && startPortalBehaviour == endPortalBehaviour && startPortal != endPortal)
                loops = true;
            for (var i = 1; i < len; i++) {
                pt1 = { x: points[i - 1].x, y: points[i - 1].y };
                pt2 = { x: points[i].x, y: points[i].y };
                var midpt = { x: pt1.x + (pt2.x - pt1.x) * 0.5, y: pt1.y + (pt2.y - pt1.y) / 2 };
                // draw the curves:
                if (!loops) {
                    if (prevMidpt) {
                        graphics.moveTo(prevMidpt.x, prevMidpt.y);
                        if (!loops)
                            graphics.quadraticCurveTo(pt1.x, pt1.y, midpt.x, midpt.y);
                        else
                            graphics.lineTo(pt1.x, pt1.y);
                    }
                    else {
                        // draw start segment:
                        graphics.moveTo(pt1.x, pt1.y);
                        graphics.lineTo(midpt.x, midpt.y);
                    }
                }
                else {
                    // draw start segment:
                    graphics.moveTo(pt1.x, pt1.y);
                    graphics.lineTo(pt2.x, pt2.y);
                }
                prevMidpt = midpt;
            }
            // draw end segment:
            if (pt2)
                graphics.lineTo(pt2.x, pt2.y - 1);
            if (startPortal.type == Animate.PortalType.OUTPUT) {
                //Draw pipe lines
                //graphics.lineWidth = 5;
                //graphics.strokeStyle="#333333";		
                //graphics.stroke();
                graphics.lineWidth = 3;
                if (element.data("selected"))
                    graphics.strokeStyle = "#84FF00";
                else
                    graphics.strokeStyle = "#A41CC9";
                graphics.stroke();
                //Now draw the line text
                var canvas = this.canvas;
                var frameDelay = this.frameDelay;
                var canvasW = canvas.width * 0.5 - 5;
                var canvasH = canvas.height * 0.5 + 3;
                graphics.lineWidth = 5;
                graphics.strokeStyle = "#ffffff";
                graphics.strokeText(frameDelay.toString(), canvasW, canvasH);
                graphics.fillText(frameDelay.toString(), canvasW, canvasH);
            }
            else {
                //Draw pipe lines
                graphics.lineWidth = 2;
                if (element.data("selected"))
                    graphics.strokeStyle = "#84FF00";
                else
                    graphics.strokeStyle = "#E2B31F";
                graphics.stroke();
            }
        };
        /**
        * Remove listeners.
        * @param {any} e
        */
        Link.prototype.onMouseUpAnchor = function (e) {
            if (this.mCurTarget)
                this.mCurTarget.element.css("cursor", "");
            this.parent.element.css("cursor", "");
            this.startPortal.element.css("cursor", "");
            //Add remove glow
            if (this.startPortal.type == Animate.PortalType.PRODUCT)
                jQuery(".parameter").removeClass("green-glow");
            else if (this.startPortal.type == Animate.PortalType.OUTPUT)
                jQuery(".input").removeClass("green-glow");
            var elm = jQuery(e.target);
            if (elm.hasClass("portal")) {
                this.mCurTarget = elm.data("component");
                if (this.mCurTarget.type == Animate.PortalType.PRODUCT || this.mCurTarget.type == Animate.PortalType.OUTPUT)
                    this.dispose();
                else {
                    if ((this.startPortal.type == Animate.PortalType.OUTPUT && this.mCurTarget.type == Animate.PortalType.INPUT) ||
                        (this.startPortal.type == Animate.PortalType.PRODUCT && this.mCurTarget.type == Animate.PortalType.PARAMETER)) {
                        if (this.mCurTarget.checkPortalLink(this.startPortal)) {
                            //Drop is ok
                            this.parent.element.off("mousemove", this.mMouseMoveProxy);
                            this.parent.element.off("mouseup");
                            jQuery(".portal", this.parent.element).off("mouseup", this.mMouseUpAnchorProxy);
                            this.endPortal = this.mCurTarget;
                            this.startPortal.addLink(this);
                            this.endPortal.addLink(this);
                            this.element.css("pointer-events", "");
                            //Notify of change
                            this.parent.element.data("component").dispatchEvent(new Animate.CanvasEvent(Animate.CanvasEvents.MODIFIED, this.parent));
                        }
                        this.mCurTarget.element.css("cursor", "");
                    }
                    else
                        this.dispose();
                }
            }
            else {
                this.dispose();
            }
            this.mCurTarget = null;
        };
        /**
        * Cleanup the link
        */
        Link.prototype.dispose = function () {
            if (this.startPortal && this.startPortal instanceof Animate.Portal)
                this.startPortal.removeLink(this);
            if (this.endPortal && this.endPortal instanceof Animate.Portal)
                this.endPortal.removeLink(this);
            //Unbind
            this.parent.element.off("mousemove", this.mMouseMoveProxy);
            this.parent.element.off("mouseup");
            jQuery(".portal", this.parent.element).off("mouseup", this.mMouseUpAnchorProxy);
            this.element.off();
            this.element.data("dragEnabled", null);
            //Nullify
            this.startPortal = null;
            this.endPortal = null;
            this.mMouseMoveProxy = null;
            this.mMouseUpProxy = null;
            this.mMouseUpAnchorProxy = null;
            this.mPrevPortal = null;
            this.canvas = null;
            this.graphics = null;
            this.linePoints = null;
            this.mCurTarget = null;
            this.frameDelay = null;
            //Call parent
            _super.prototype.dispose.call(this);
        };
        return Link;
    })(Animate.Component);
    Animate.Link = Link;
})(Animate || (Animate = {}));
var Animate;
(function (Animate) {
    /**
    * This class is a small container class that is used by the Tab class. It creates TabPairs
    * each time a tab is created with the addTab function. This creates a TabPair object that keeps a reference to the
    * label and page as well as a few other things.
    */
    var TabPair = (function () {
        function TabPair(tab, page, name) {
            this.tabSelector = tab;
            this.page = page;
            this.name = name;
        }
        /**
        * Called when the editor is resized
        */
        TabPair.prototype.onResize = function () { };
        /**
        * Called by the tab class when the pair is to be removed.
        * @param {TabEvent} data An object that can be used to cancel the operation. Simply call data.cancel = true to cancel the closure.
        */
        TabPair.prototype.onRemove = function (data) { };
        /**
        * Called by the tab when the save all button is clicked
        */
        TabPair.prototype.onSaveAll = function () { };
        /**
        * Called when the pair has been added to the tab
        */
        TabPair.prototype.onAdded = function () { };
        /**
        * Called when the pair has been selected
        */
        TabPair.prototype.onSelected = function () { };
        Object.defineProperty(TabPair.prototype, "text", {
            /**
            * Gets the label text of the pair
            */
            get: function () { return jQuery(".text", this.tabSelector.element).text(); },
            /**
            * Sets the label text of the pair
            */
            set: function (text) { jQuery(".text", this.tabSelector.element).text(text); },
            enumerable: true,
            configurable: true
        });
        /**
        * Cleans up the references
        */
        TabPair.prototype.dispose = function () {
            this.tabSelector.dispose();
            this.page.dispose();
            this.tabSelector = null;
            this.page = null;
            this.name = null;
        };
        return TabPair;
    })();
    Animate.TabPair = TabPair;
})(Animate || (Animate = {}));
var Animate;
(function (Animate) {
    var CanvasTabPair = (function (_super) {
        __extends(CanvasTabPair, _super);
        function CanvasTabPair(canvas, name) {
            _super.call(this, null, null, name);
            this.canvas = canvas;
        }
        CanvasTabPair.prototype.dispose = function () {
            this.canvas = null;
            _super.prototype.dispose.call(this);
        };
        return CanvasTabPair;
    })(Animate.TabPair);
    Animate.CanvasTabPair = CanvasTabPair;
})(Animate || (Animate = {}));
var Animate;
(function (Animate) {
    /**
    * A tab pair that manages the build HTML
    */
    var HTMLTab = (function (_super) {
        __extends(HTMLTab, _super);
        /**
        * @param {string} name The name of the tab
        * @param {Label} tab The label of the pair
        * @param {Component} page The page of the pair
        */
        function HTMLTab(name) {
            // Call super-class constructor
            _super.call(this, null, null, name);
            this.originalName = name;
            this.proxyChange = jQuery.proxy(this.onChange, this);
            this.proxyMessageBox = jQuery.proxy(this.onMessage, this);
            this.saved = true;
            this.close = false;
            this._editor = null;
        }
        /**
        * When the server responds after a save.
        * @param {ProjectEvents} response
        * @param {ProjectEvent} event
        */
        HTMLTab.prototype.onServer = function (response, event) {
            Animate.User.get.project.off(Animate.ProjectEvents.FAILED, this.onServer, this);
            Animate.User.get.project.off(Animate.ProjectEvents.HTML_SAVED, this.onServer, this);
            if (response == Animate.ProjectEvents.FAILED) {
                this.saved = false;
                Animate.MessageBox.show("Problem saving the data, server responded with:'" + event.message + "'", Array("Ok"), null, null);
            }
            else {
                this.save();
                if (this.close)
                    Animate.CanvasTab.getSingleton().removeTab(this, true);
            }
        };
        /**
        * When we acknowledge the message box.
        * @param {string} val
        */
        HTMLTab.prototype.onMessage = function (val) {
            if (val == "Yes") {
                this.close = true;
                Animate.User.get.project.on(Animate.ProjectEvents.FAILED, this.onServer, this);
                Animate.User.get.project.on(Animate.ProjectEvents.HTML_SAVED, this.onServer, this);
                Animate.User.get.project.saveHTML();
            }
            else {
                this.saved = true;
                Animate.CanvasTab.getSingleton().removeTab(this, true);
            }
        };
        /**
        * Called when the editor changes
        * @param {any} e
        */
        HTMLTab.prototype.onChange = function (e) {
            this.saved = false;
            this.name = "*" + this.originalName;
            this.text = this.name;
        };
        /**
        * Called by the tab class when the pair is to be removed.
        * @param {any} data An object that can be used to cancel the operation. Simply call data.cancel = true to cancel the closure.
        */
        HTMLTab.prototype.onRemove = function (data) {
            if (!this.saved) {
                data.cancel = true;
                Animate.MessageBox.show("Document not saved, would you like to save it now?", ["Yes", "No"], this.proxyMessageBox, this);
                return;
            }
            this._editor.off("change", this.proxyChange);
            this._editor.destroy();
            this._editor = null;
            this.proxyChange = null;
            this.proxyMessageBox = null;
            HTMLTab.singleton = null;
            this._editor = null;
        };
        /**
        * Called when the editor is resized
        */
        HTMLTab.prototype.onResize = function () {
            this._editor.resize();
        };
        /**
        * A helper function to save the script
        * @returns {any}
        */
        HTMLTab.prototype.save = function () {
            this.name = this.originalName;
            jQuery(".text", this.tabSelector.element).text(this.name);
            this.saved = true;
        };
        /**
        * Called when the pair has been added to the tab
        */
        HTMLTab.prototype.onAdded = function () {
            HTMLTab.singleton = this;
            var comp = new Animate.Component("<pre style='position:absolute; margin: 0; top: 0; bottom: 0; left: 0; right: 0;'></pre>", this.page);
            var editor = ace.edit(comp.id);
            editor.setTheme("ace/theme/chrome");
            editor.getSession().setMode("ace/mode/html");
            this._editor = editor;
            editor.setValue(Animate.User.get.project.mCurBuild.html);
            this._editor.selection.moveCursorFileStart();
            // Ctrl + S
            this._editor.commands.addCommand({
                name: "save",
                bindKey: {
                    win: "Ctrl-S",
                    mac: "Command-S",
                    sender: "editor|cli"
                },
                exec: function () { Animate.User.get.project.saveAll(); }
            });
            editor.on("change", this.proxyChange);
        };
        Object.defineProperty(HTMLTab.prototype, "editor", {
            get: function () { return this._editor; },
            enumerable: true,
            configurable: true
        });
        return HTMLTab;
    })(Animate.TabPair);
    Animate.HTMLTab = HTMLTab;
})(Animate || (Animate = {}));
var Animate;
(function (Animate) {
    /**
    * A tab pair that manages the build CSS
    */
    var CSSTab = (function (_super) {
        __extends(CSSTab, _super);
        /**
        * @param {string} name The name of the tab
        */
        function CSSTab(name) {
            // Call super-class constructor
            _super.call(this, null, null, name);
            this.originalName = name;
            this.proxyChange = jQuery.proxy(this.onChange, this);
            this.proxyMessageBox = jQuery.proxy(this.onMessage, this);
            this.saved = true;
            this.close = false;
            this._editor = null;
        }
        /**
        * When the server responds after a save.
        * @param {ProjectEvents} response
        * @param {ProjectEvent} event
        */
        CSSTab.prototype.onServer = function (response, event) {
            Animate.User.get.project.off(Animate.ProjectEvents.FAILED, this.onServer, this);
            Animate.User.get.project.off(Animate.ProjectEvents.CSS_SAVED, this.onServer, this);
            if (response == Animate.ProjectEvents.FAILED) {
                this.saved = false;
                Animate.MessageBox.show("Problem saving the data, server responded with:'" + event.message + "'", Array("Ok"), null, null);
            }
            else {
                this.save();
                if (this.close)
                    Animate.CanvasTab.getSingleton().removeTab(this, true);
            }
        };
        /**
        * When we acknowledge the message box.
        * @param {string} val
        */
        CSSTab.prototype.onMessage = function (val) {
            if (val == "Yes") {
                this.close = true;
                Animate.User.get.project.on(Animate.ProjectEvents.FAILED, this.onServer, this);
                Animate.User.get.project.on(Animate.ProjectEvents.CSS_SAVED, this.onServer, this);
                Animate.User.get.project.saveCSS();
            }
            else {
                this.saved = true;
                Animate.CanvasTab.getSingleton().removeTab(this, true);
            }
        };
        /**
        * Called when the editor changes
        * @param {any} e
        */
        CSSTab.prototype.onChange = function (e) {
            this.saved = false;
            this.name = "*" + this.originalName;
            this.text = this.name;
        };
        /**
        * Called by the tab class when the pair is to be removed.
        * @param {any} data An object that can be used to cancel the operation. Simply call data.cancel = true to cancel the closure.
        */
        CSSTab.prototype.onRemove = function (data) {
            if (!this.saved) {
                data.cancel = true;
                Animate.MessageBox.show("Document not saved, would you like to save it now?", ["Yes", "No"], this.proxyMessageBox, this);
                return;
            }
            this._editor.off("change", this.proxyChange);
            this._editor.destroy();
            this._editor = null;
            this.proxyChange = null;
            this.proxyMessageBox = null;
            CSSTab.singleton = null;
            this._editor = null;
        };
        /**
        * Called when the editor is resized
        */
        CSSTab.prototype.onResize = function () {
            this._editor.resize();
        };
        /**
        * A helper function to save the script
        * @returns {any}
        */
        CSSTab.prototype.save = function () {
            this.name = this.originalName;
            jQuery(".text", this.tabSelector.element).text(this.name);
            this.saved = true;
        };
        /**
        * Called when the pair has been added to the tab
        */
        CSSTab.prototype.onAdded = function () {
            CSSTab.singleton = this;
            var comp = new Animate.Component("<pre style='position:absolute; margin: 0; top: 0; bottom: 0; left: 0; right: 0;'></pre>", this.page);
            var editor = ace.edit(comp.id);
            editor.setTheme("ace/theme/chrome");
            editor.getSession().setMode("ace/mode/css");
            this._editor = editor;
            editor.setValue(Animate.User.get.project.mCurBuild.css);
            this._editor.selection.moveCursorFileStart();
            // Ctrl + S
            this._editor.commands.addCommand({
                name: "save",
                bindKey: {
                    win: "Ctrl-S",
                    mac: "Command-S",
                    sender: "editor|cli"
                },
                exec: function () { Animate.User.get.project.saveAll(); }
            });
            editor.on("change", this.proxyChange);
        };
        Object.defineProperty(CSSTab.prototype, "editor", {
            get: function () { return this._editor; },
            enumerable: true,
            configurable: true
        });
        return CSSTab;
    })(Animate.TabPair);
    Animate.CSSTab = CSSTab;
})(Animate || (Animate = {}));
var Animate;
(function (Animate) {
    /**
    * A tab pair that creates a javascript node
    */
    var ScriptTab = (function (_super) {
        __extends(ScriptTab, _super);
        function ScriptTab(scriptNode) {
            // Call super-class constructor
            this.originalName = scriptNode.id + " - " + scriptNode.alias;
            _super.call(this, null, null, this.originalName);
            this.scriptNode = scriptNode;
            this.proxyFunctionClick = this.OnFunctionClick.bind(this);
            this.saved = true;
            this.close = false;
            this._editor = null;
            this.onEnter = null;
            this.onFrame = null;
            this.onInitialize = null;
            this.onDispose = null;
            this.curFunction = null;
            this.userDefinedChange = true;
            this.scripts = {};
        }
        /**
        * When we click on one of the function buttons
        * @param <object> e
        */
        ScriptTab.prototype.OnFunctionClick = function (e) {
            this.userDefinedChange = false;
            var f = jQuery(e.target).attr("function");
            jQuery(".function-button", this.right.element).removeClass("function-pushed");
            jQuery(e.target).addClass("function-pushed");
            this.curFunction = f;
            jQuery("#local-total").hide();
            jQuery("#local-delta").hide();
            jQuery("#local-name").hide();
            jQuery("#local-portal").hide();
            if (this.curFunction == "onInitialize")
                this._editor.setValue(this.onInitialize);
            else if (this.curFunction == "onEnter") {
                this._editor.setValue(this.onEnter);
                jQuery("#local-name").show();
                jQuery("#local-portal").show();
            }
            else if (this.curFunction == "onDispose")
                this._editor.setValue(this.onDispose);
            else if (this.curFunction == "onFrame") {
                this._editor.setValue(this.onFrame);
                jQuery("#local-total").show();
                jQuery("#local-delta").show();
            }
            this._editor.selection.moveCursorFileStart();
            this.userDefinedChange = true;
        };
        /**
        * Called when the editor is resized
        */
        ScriptTab.prototype.onResize = function () {
            this._editor.resize();
        };
        /**
        * When we rename the script, we need to update the text
        */
        ScriptTab.prototype.rename = function (newName) {
            this.originalName = this.scriptNode.id + " - " + newName;
            if (!this.saved)
                this.name = "*" + this.originalName;
            else
                this.name = this.originalName;
            this.text = this.name;
        };
        /**
        * Called when the pair has been added to the tab
        */
        ScriptTab.prototype.onAdded = function () {
            var left = new Animate.Component("<div class='script-content'></div>", this.page);
            var codeMenu = "<div class='script-menus'>" +
                "<div title='Called when the script is first initialized' class='function-button' function='onInitialize'>On Initialize</div>" +
                "<div title='Called each time the behaviour is entered from an input gate' class='function-button function-pushed' function='onEnter'>On Enter</div>" +
                "<div title='Called each frame as long as the script is active' class='function-button' function='onFrame'>On Frame</div>" +
                "<div title='Called when the script needs to be cleaned up and destroyed' class='function-button' function='onDispose'>On Dispose</div>" +
                "<div class='script-helpers'></div>" +
                "</div>";
            this.right = new Animate.Component(codeMenu, this.page);
            this.page.element.append("<div class='fix'></div>");
            //Create the right panel options
            jQuery(".function-button", this.right.element).on("click", this.proxyFunctionClick);
            this._editorComponent = new Animate.Component("<pre style='position:absolute; margin: 0; top: 0; bottom: 0; left: 0; right: 0;'></pre>", left);
            var editor = ace.edit(this._editorComponent.id);
            this._editor = editor;
            editor.setTheme("ace/theme/chrome");
            editor.getSession().setMode("ace/mode/javascript");
            this._editorComponent.on(Animate.ComponentEvents.UPDATED, this.onResize, this);
            // Ctrl + S
            editor.commands.addCommand({
                name: "save",
                bindKey: {
                    win: "Ctrl-S",
                    mac: "Command-S",
                    sender: "editor|cli"
                },
                exec: function () { Animate.User.get.project.saveAll(); }
            });
            var loader = new Animate.AnimateLoader();
            var shallowId = this.scriptNode.shallowId;
            var tab = this;
            //When we return from the server
            var onServer = function (response, event, sender) {
                //When we come back from the server
                if (response == Animate.LoaderEvents.COMPLETE) {
                    var data = event.tag.script;
                    if (!data)
                        data = {};
                    tab.userDefinedChange = false;
                    editor.setValue((data.onEnter ? data.onEnter : ""));
                    editor.selection.moveCursorFileStart();
                    tab.curFunction = "onEnter";
                    tab.onEnter = (data.onEnter ? data.onEnter : "");
                    tab.onInitialize = (data.onInitialize ? data.onInitialize : "");
                    tab.onDispose = (data.onDispose ? data.onDispose : "");
                    tab.onFrame = (data.onFrame ? data.onFrame : "");
                    tab.userDefinedChange = true;
                }
            };
            //When the text changes we save the data to the local function
            var onChange = function () {
                if (!tab.userDefinedChange)
                    return;
                tab.saved = false;
                tab.name = "*" + tab.originalName;
                tab.text = tab.name;
                tab[tab.curFunction] = tab._editor.getValue();
            };
            //Text change
            editor.on("change", onChange);
            //Get the current scripts
            loader.on(Animate.LoaderEvents.COMPLETE, onServer);
            loader.on(Animate.LoaderEvents.FAILED, onServer);
            loader.load("/project/get-behaviour-scripts", { projectId: Animate.User.get.project.entry._id, shallowId: shallowId });
            this.onSelected();
        };
        /**
        * When the server responds after a save.
        * @param <object> event
        * @param <object> data
        */
        ScriptTab.prototype.onServer = function (response, event) {
            if (response == Animate.ProjectEvents.FAILED) {
                this.saved = false;
                Animate.MessageBox.show("Problem saving the data, server responded with:'" + event.message + "'", Array("Ok"), null, null);
            }
            else {
                this.save();
                if (this.close)
                    Animate.CanvasTab.getSingleton().removeTab(this, true);
            }
        };
        /**
        * Called when the save all button is clicked
        */
        ScriptTab.prototype.onSaveAll = function () {
            this.save();
        };
        /**
        * Called when the pair has been selected
        */
        ScriptTab.prototype.onSelected = function () {
            if (!this.right)
                return;
            //Create the right panel options
            var helpers = jQuery(".script-helpers", this.right.element);
            helpers.empty();
            this.scripts = {};
            var scripts = this.scripts;
            scripts["portalName"] = "portalName";
            scripts["portal"] = "portal";
            scripts["totalTime"] = "totalTime";
            scripts["delta"] = "delta";
            var toAdd = "";
            //DEFAULTS
            toAdd += "<div id='local-name' style='display:block;' title='The local portal name variable' script='portalName' class='script-helper'><span class='identifier'>local</span> - <span class='name'>portalName</span> <span class='type'>(string)</span></div>";
            toAdd += "<div id='local-portal' style='display:block;' title='The portal that entered' script='portal' class='script-helper'><span class='identifier'>local</span> - <span class='name'>portal</span> <span class='type'>(Anim.Portal)</span></div>";
            toAdd += "<div id='local-total' style='display:none;' title='The total time that has elapsed in milliseconds' script='totalTime' class='script-helper'><span class='identifier'>local</span> - <span class='name'>totalTime</span> <span class='type'>(number)</span></div>";
            toAdd += "<div id='local-delta' style='display:none;' title='The delta time since the last on frame call' script='delta' class='script-helper'><span class='identifier'>local</span> - <span class='name'>delta</span> <span class='type'>(number)</span></div>";
            //INPUTS
            var portals = this.scriptNode.inputs;
            var len = portals.length;
            for (var i = 0; i < len; i++) {
                scripts[portals[i].name] = "if ( portalName == \"" + portals[i].name + "\" )\r{\r}";
                toAdd += "<div title='Inserts an input condition' script='" + portals[i].name + "' class='helper-onenter script-helper'><span class='identifier'>input</span> - <span class='name'>" + portals[i].name + "</span> <span class='type'>(bool)</span></div>";
            }
            //OUTPUTS
            portals = this.scriptNode.outputs;
            len = portals.length;
            for (var i = 0; i < len; i++) {
                scripts[portals[i].name] = "this.exit( \"" + portals[i].name + "\", false );";
                toAdd += "<div title='Inserts an exit snippet' script='" + portals[i].name + "' class='helper-onenter script-helper'><span class='identifier'>output</span> - <span class='name'>" + portals[i].name + "</span> <span class='type'>(bool)</span></div>";
            }
            //PARAMS
            portals = this.scriptNode.parameters;
            len = portals.length;
            for (var i = 0; i < len; i++) {
                scripts[portals[i].name] = "this.getParam(\"" + portals[i].name + "\")";
                toAdd += "<div title='Inserts a get parameter snippet' script='" + portals[i].name + "' class='helper-onenter script-helper'><span class='identifier'>parameters</span> - <span class='name'>" + portals[i].name + "</span> <span class='type'>(" + portals[i].dataType + ")</span></div>";
            }
            //PRODUCTS
            portals = this.scriptNode.products;
            len = portals.length;
            for (var i = 0; i < len; i++) {
                scripts[portals[i].name] = "this.setProduct( \"" + portals[i].name + "\", /*VALUE*/ );";
                toAdd += "<div title='Inserts a set product snippet' script='" + portals[i].name + "' class='helper-onenter script-helper'><span class='identifier'>products</span> - <span class='name'>" + portals[i].name + "</span> <span class='type'>(" + portals[i].dataType + ")</span></div>";
            }
            helpers.html(toAdd);
            var editor = this._editor;
            jQuery(".script-helper", helpers).on("click", function (e) {
                editor.insert(scripts[jQuery(e.currentTarget).attr("script")]);
                editor.focus();
            });
        };
        /**
        * Called by the tab class when the pair is to be removed.
        * @param <object> data An object that can be used to cancel the operation. Simply call data.cancel = true to cancel the closure.
        */
        ScriptTab.prototype.onRemove = function (data) {
            var tab = this;
            //When we get a user response from the message box.
            var onMessage = function (val) {
                if (val == "Yes") {
                    tab.close = true;
                    tab.save();
                }
                else {
                    tab.close = true;
                    tab.saved = true;
                    Animate.CanvasTab.getSingleton().removeTab(tab, true);
                }
            };
            //If not saved ask the user.
            if (!this.saved) {
                data.cancel = true;
                Animate.MessageBox.show("Script not saved, would you like to save it now?", ["Yes", "No"], onMessage, this);
                return;
            }
            this._editorComponent.off(Animate.ComponentEvents.UPDATED, this.onResize, this);
            jQuery(".function-button", this.right.element).off("click", this.proxyFunctionClick);
            this._editor.commands.removeCommand("save");
            this._editor.removeAllListeners("change");
            this._editor.destroy();
            this._editor = null;
            this.right = null;
            this.proxyFunctionClick = null;
            this._editor = null;
            this.onEnter = null;
            this.onInitialize = null;
            this.onDispose = null;
            this.onFrame = null;
            this._editorComponent = null;
            this.scriptNode = null;
            this.scripts = null;
        };
        /**
        * Call this function to save the script to the database
        * @returns <object>
        */
        ScriptTab.prototype.save = function () {
            if (this.saved)
                return;
            var tab = this;
            //When we return from the save
            var onSave = function (response, event, sender) {
                if (response == Animate.LoaderEvents.COMPLETE) {
                    if (event.return_type == Animate.AnimateLoaderResponses.ERROR) {
                        Animate.MessageBox.show("There was an error saving the script: '" + event.message + "'", Array("Ok"), null, null);
                        return;
                    }
                    tab.name = tab.originalName;
                    jQuery(".text", tab.tabSelector.element).text(tab.name);
                    tab.saved = true;
                    if (tab.close)
                        Animate.CanvasTab.getSingleton().removeTab(tab, true);
                }
            };
            //try to create the database entry of this node
            var loader = new Animate.AnimateLoader();
            loader.on(Animate.LoaderEvents.COMPLETE, onSave);
            loader.on(Animate.LoaderEvents.FAILED, onSave);
            loader.load("/project/save-behaviour-script", {
                projectId: Animate.User.get.project.entry._id,
                onEnter: this.onEnter,
                onInitialize: this.onInitialize,
                onDispose: this.onDispose,
                onFrame: this.onFrame,
                shallowId: this.scriptNode.shallowId
            });
        };
        return ScriptTab;
    })(Animate.TabPair);
    Animate.ScriptTab = ScriptTab;
})(Animate || (Animate = {}));
var Animate;
(function (Animate) {
    /**
    * This is an implementation of the tab class
    */
    var SceneTab = (function (_super) {
        __extends(SceneTab, _super);
        /**
        * @param {Component} parent The parent of the button
        */
        function SceneTab(parent) {
            _super.call(this, parent);
            if (SceneTab._singleton != null)
                throw new Error("The SceneTab class is a singleton. You need to call the SceneTab.get() function.");
            SceneTab._singleton = this;
            this.element.css({ width: "100%", height: "100%" });
            this.mDocker = null;
            //Add the main tabs
            this.assetPanel = this.addTab("Assets", false).page;
            new Animate.TreeViewScene(this.assetPanel);
        }
        /**This is called by a controlling ScreenManager class. An image string needs to be returned
        * which will act as a preview of the component that is being viewed or hidden.*/
        SceneTab.prototype.getPreviewImage = function () {
            return "media/world_48.png";
        };
        /*Each IDock item needs to implement this so that we can keep track of where it moves.*/
        SceneTab.prototype.getDocker = function () { return this.mDocker; };
        /*Each IDock item needs to implement this so that we can keep track of where it moves.*/
        SceneTab.prototype.setDocker = function (val) { this.mDocker = val; };
        /*This is called by a controlling Docker class when the component needs to be shown.*/
        SceneTab.prototype.onShow = function () { };
        /*This is called by a controlling Docker class when the component needs to be hidden.*/
        SceneTab.prototype.onHide = function () { };
        /** Gets the singleton instance. */
        SceneTab.getSingleton = function (parent) {
            if (!SceneTab._singleton)
                new SceneTab(parent);
            return SceneTab._singleton;
        };
        return SceneTab;
    })(Animate.Tab);
    Animate.SceneTab = SceneTab;
})(Animate || (Animate = {}));
var Animate;
(function (Animate) {
    /**
    * This small class is used to group property grid elements together
    */
    var PropertyGridGroup = (function (_super) {
        __extends(PropertyGridGroup, _super);
        function PropertyGridGroup(name) {
            // Call super-class constructor
            _super.call(this, "<div class='property-grid-group curve-small'></div>", null);
            this.name = name;
            this.element.append("<div class='property-grid-group-header'>" + name + "</div>");
            this.content = jQuery("<div class='content'></div>");
            this.element.append(this.content);
        }
        /**
        * This function is used to clean up the PropertyGridGroup
        */
        PropertyGridGroup.prototype.dispose = function () {
            this.name = null;
            this.content = null;
            //Call super
            _super.prototype.dispose.call(this);
        };
        return PropertyGridGroup;
    })(Animate.Component);
    Animate.PropertyGridGroup = PropertyGridGroup;
})(Animate || (Animate = {}));
var Animate;
(function (Animate) {
    /**
    * A property editor which edits objects and strings
    */
    var PropTextbox = (function (_super) {
        __extends(PropTextbox, _super);
        function PropTextbox(grid) {
            _super.call(this, grid);
        }
        /**
        * Called when a property grid is editing an object. The property name, value and type are passed.
        * If this editor can edit the property it returns a valid JQuery object which is responsible for editing
        * the object. The property grid makes no effort to maintain this. It is up to the Editor to watch the JQuery through
        * events to see when its been interacted with. Once its been edited, the editor must notify the grid - to do this
        * call the notify method.
        * @param {string} propertyName The name of the property we are creating an HTML element for
        * @param {any} propertyValue The current value of that property
        * @param {ParameterType} objectType The type of property we need to create
        * @param {any} options Any options associated with the parameter
        * @returns {JQuery} A valid jQuery object or null if this editor does not support this property.
        */
        PropTextbox.prototype.edit = function (propertyName, propertyValue, objectType, options) {
            if ((propertyValue == null && objectType == null ||
                objectType == Animate.ParameterType.STRING ||
                objectType == Animate.ParameterType.OBJECT) === false) {
                return null;
            }
            //Create HTML			
            if (propertyValue === undefined || propertyValue === null)
                propertyValue = "";
            var editor = this.createEditorJQuery(propertyName, "<input type='text' class='PropTextbox' value = '" + propertyValue.toString() + "' ></input>", propertyValue);
            var that = this;
            //Function to deal with user interactions with JQuery
            var valueEdited = function (e) {
                that.notify(propertyName, jQuery("input", editor).val(), objectType);
            };
            //Add listeners
            jQuery("input", editor).val(propertyValue.toString());
            jQuery("input", editor).on("keyup", valueEdited);
            //Finall return editor as HTML to be added to the page
            return editor;
        };
        /**
        * Updates the value of the editor object  because a value was edited externally.
        * @param {any} newValue The new value
        * @param {JQuery} editHTML The JQuery that was generated by this editor that needs to be updated because something has updated the value externally.
        */
        PropTextbox.prototype.update = function (newValue, editHTML) {
            jQuery("input", editHTML).val(newValue);
        };
        return PropTextbox;
    })(Animate.PropertyGridEditor);
    Animate.PropTextbox = PropTextbox;
})(Animate || (Animate = {}));
var Animate;
(function (Animate) {
    /**
    * A property editor which edits numbers
    */
    var PropNumber = (function (_super) {
        __extends(PropNumber, _super);
        function PropNumber(grid) {
            _super.call(this, grid);
        }
        /**
        * Called when a property grid is editing an object. The property name, value and type are passed.
        * If this editor can edit the property it returns a valid JQuery object which is responsible for editing
        * the object. The property grid makes no effort to maintain this. It is up to the Editor to watch the JQuery through
        * events to see when its been interacted with. Once its been edited, the editor must notify the grid - to do this
        * call the notify method.
        * @param {string} propertyName The name of the property we are creating an HTML element for
        * @param {any} propertyValue The current value of that property
        * @param {ParameterType} objectType The type of property we need to create
        * @param {any} options Any options associated with the parameter
        * @returns {JQuery} A valid jQuery object or null if this editor does not support this property.
        */
        PropNumber.prototype.edit = function (propertyName, propertyValue, objectType, options) {
            if (objectType != Animate.ParameterType.NUMBER)
                return null;
            //Create HTML
            var num = propertyValue.selected || (isNaN(parseFloat(propertyValue)) ? 0 : parseFloat(propertyValue));
            var min = propertyValue.min || -Infinity;
            var max = propertyValue.max || Infinity;
            var incrementAmount = propertyValue.interval || 1;
            if (!num)
                num = 0;
            if (!min)
                min = -9999;
            if (!max)
                max = 9999;
            if (!incrementAmount)
                incrementAmount = 1;
            var editor = this.createEditorJQuery(propertyName, "<input type='text' class='PropTextbox' value = '" + num + "' ></input>", propertyValue);
            var that = this;
            //Function to deal with user interactions with JQuery
            var valueEdited = function (e) {
                var val = parseFloat(jQuery("input", editor).val());
                if (isNaN(val))
                    val = 0;
                if (val < min)
                    val = min;
                if (val > max)
                    val = max;
                var num = val;
                that.notify(propertyName, { selected: val, min: min, max: max, interval: incrementAmount }, objectType);
            };
            //Add listeners
            jQuery("input", editor).val(num);
            jQuery("input", editor).on("keyup", valueEdited);
            //This is for when the users press the up and down buttons on chrome
            jQuery("input", editor).on("mouseup", valueEdited);
            jQuery("input", editor).jStepper({
                allowDecimals: true,
                maxValue: max,
                minValue: min,
                normalStep: incrementAmount,
                onStep: valueEdited
            });
            //Finall return editor as HTML to be added to the page
            return editor;
        };
        /**
        * Updates the value of the editor object  because a value was edited externally.
        * @param {any} newValue The new value
        * @param {JQuery} editHTML The JQuery that was generated by this editor that needs to be updated because something has updated the value externally.
        */
        PropNumber.prototype.update = function (newValue, editHTML) {
            jQuery("input", editHTML).val((newValue.selected !== undefined ? newValue.selected : newValue));
        };
        return PropNumber;
    })(Animate.PropertyGridEditor);
    Animate.PropNumber = PropNumber;
})(Animate || (Animate = {}));
var Animate;
(function (Animate) {
    /**
    * This represents a combo property for booleans that the user can select from a list.
    */
    var PropComboBool = (function (_super) {
        __extends(PropComboBool, _super);
        function PropComboBool(grid) {
            _super.call(this, grid);
        }
        /**
        * Called when a property grid is editing an object. The property name, value and type are passed.
        * If this editor can edit the property it returns a valid JQuery object which is responsible for editing
        * the object. The property grid makes no effort to maintain this. It is up to the Editor to watch the JQuery through
        * events to see when its been interacted with. Once its been edited, the editor must notify the grid - to do this
        * call the notify method.
        * @param {string} propertyName The name of the property we are creating an HTML element for
        * @param {any} propertyValue The current value of that property
        * @param {ParameterType} objectType The type of property we need to create
        * @param {any} options Any options associated with the parameter
        * @returns {JQuery} A valid jQuery object or null if this editor does not support this property.
        */
        PropComboBool.prototype.edit = function (propertyName, propertyValue, objectType, options) {
            if (objectType != Animate.ParameterType.BOOL)
                return null;
            //Create HTML	
            var editor = this.createEditorJQuery(propertyName, "<select class='prop-combo'></select>", propertyValue);
            var selector = jQuery("select", editor);
            //Boolean
            selector.append("<option value='true' " + (propertyValue ? "selected='selected'" : "") + ">True</option>");
            selector.append("<option value='false' " + (!propertyValue ? "selected='selected'" : "") + ">False</option>");
            var that = this;
            //Functions to deal with user interactions with JQuery
            var onSelect = function (e) {
                var val = selector.val();
                that.notify(propertyName, (val == "true" ? true : false), objectType);
            };
            //Add listeners
            selector.on("change", onSelect);
            //Finall return editor as HTML to be added to the page
            return editor;
        };
        /**
        * Updates the value of the editor object  because a value was edited externally.
        * @param {any} newValue The new value
        * @param {JQuery} editHTML The JQuery that was generated by this editor that needs to be updated because something has updated the value externally.
        */
        PropComboBool.prototype.update = function (newValue, editHTML) {
            var selector = jQuery("select", editHTML);
            var target = "false";
            if (newValue)
                target = "true";
            selector.val(target);
        };
        return PropComboBool;
    })(Animate.PropertyGridEditor);
    Animate.PropComboBool = PropComboBool;
})(Animate || (Animate = {}));
var Animate;
(function (Animate) {
    /**
    * This represents a combo property for enums that the user can select from a list.
    */
    var PropComboEnum = (function (_super) {
        __extends(PropComboEnum, _super);
        function PropComboEnum(grid) {
            _super.call(this, grid);
        }
        /**
        * Called when a property grid is editing an object. The property name, value and type are passed.
        * If this editor can edit the property it returns a valid JQuery object which is responsible for editing
        * the object. The property grid makes no effort to maintain this. It is up to the Editor to watch the JQuery through
        * events to see when its been interacted with. Once its been edited, the editor must notify the grid - to do this
        * call the notify method.
        * @param {string} propertyName The name of the property we are creating an HTML element for
        * @param {any} propertyValue The current value of that property
        * @param {ParameterType} objectType The type of property we need to create
        * @param {any} options Any options associated with the parameter
        * @returns {JQuery} A valid jQuery object or null if this editor does not support this property.
        */
        PropComboEnum.prototype.edit = function (propertyName, propertyValue, objectType, options) {
            if (objectType != Animate.ParameterType.ENUM)
                return null;
            //Create HTML	
            var editor = this.createEditorJQuery(propertyName, "<select class='prop-combo'></select>", propertyValue);
            var selector = jQuery("select", editor);
            //Enums
            var selectedValue = propertyValue.selected;
            var vars = propertyValue.choices;
            vars = vars.sort();
            var len = vars.length;
            for (var i = 0; i < len; i++)
                selector.append("<option value='" + vars[i] + "' " + (selectedValue == vars[i] ? "selected='selected'" : "") + ">" + vars[i] + "</option>");
            var that = this;
            //Functions to deal with user interactions with JQuery
            var onSelect = function (e) {
                var val = selector.val();
                that.notify(propertyName, { choices: vars, selected: val }, objectType);
            };
            //Add listeners
            selector.on("change", onSelect);
            //Finall return editor as HTML to be added to the page
            return editor;
        };
        return PropComboEnum;
    })(Animate.PropertyGridEditor);
    Animate.PropComboEnum = PropComboEnum;
})(Animate || (Animate = {}));
var Animate;
(function (Animate) {
    /**
    * An editor which allows a user to select files on the local server.
    */
    var PropFile = (function (_super) {
        __extends(PropFile, _super);
        function PropFile(grid) {
            _super.call(this, grid);
        }
        /**
        * Called when a property grid is editing an object. The property name, value and type are passed.
        * If this editor can edit the property it returns a valid JQuery object which is responsible for editing
        * the object. The property grid makes no effort to maintain this. It is up to the Editor to watch the JQuery through
        * events to see when its been interacted with. Once its been edited, the editor must notify the grid - to do this
        * call the notify method.
        * @param {string} propertyName The name of the property we are creating an HTML element for
        * @param {any} propertyValue The current value of that property
        * @param {ParameterType} objectType The type of property we need to create
        * @param {any} options Any options associated with the parameter
        * @returns {JQuery} A valid jQuery object or null if this editor does not support this property.
        */
        PropFile.prototype.edit = function (propertyName, propertyValue, objectType, options) {
            if (objectType != Animate.ParameterType.FILE)
                return null;
            //var parts = propertyValue.split("|");
            var fileID = propertyValue.id || "";
            var fileExtensions = propertyValue.extensions || [];
            var path = propertyValue.path || "";
            var project = Animate.User.get.project;
            var file = project.getFile(fileID);
            //Create HTML	
            var editor = this.createEditorJQuery(propertyName, "<div class='prop-file'><div class='file-name'>" + (file ? file.name : path) + "</div><div class='file-button reg-gradient'>...</div><div class='file-button-image'><img src='media/download-file.png'/></div></div>", propertyValue);
            var that = this;
            //Functions to deal with user interactions with JQuery
            var onFileChosen = function (response, event) {
                Animate.FileViewerForm.getSingleton().off(Animate.FileViewerFormEvents.CANCELLED, onFileChosen);
                Animate.FileViewerForm.getSingleton().off(Animate.FileViewerFormEvents.FILE_CHOSEN, onFileChosen);
                if (response == Animate.FileViewerFormEvents.CANCELLED)
                    return;
                var file = event.file;
                jQuery(".file-name", editor).text((file ? file.name : path));
                that.notify(propertyName, { extensions: fileExtensions, path: (file ? file.path : ""), id: (file ? file.id : ""), selectedExtension: (file ? file.extension : "") }, objectType);
            };
            var mouseUp = function (e) {
                if (jQuery(e.target).is(".file-button-image")) {
                    window.open(path, 'Download');
                    return;
                }
                //Remove any previous references
                Animate.FileViewerForm.getSingleton().off(Animate.FileViewerFormEvents.CANCELLED, onFileChosen);
                Animate.FileViewerForm.getSingleton().off(Animate.FileViewerFormEvents.FILE_CHOSEN, onFileChosen);
                Animate.FileViewerForm.getSingleton().on(Animate.FileViewerFormEvents.FILE_CHOSEN, onFileChosen);
                Animate.FileViewerForm.getSingleton().on(Animate.FileViewerFormEvents.CANCELLED, onFileChosen);
                Animate.FileViewerForm.getSingleton().showForm(fileID, fileExtensions);
            };
            //Add listeners
            editor.on("mouseup", mouseUp);
            //Finall return editor as HTML to be added to the page
            return editor;
        };
        /**
        * Updates the value of the editor object  because a value was edited externally.
        * @param {any} newValue The new value
        * @param {JQuery} editHTML The JQuery that was generated by this editor that needs to be updated because something has updated the value externally.
        */
        PropFile.prototype.update = function (newValue, editHTML) {
            jQuery("input", editHTML).val(newValue);
        };
        return PropFile;
    })(Animate.PropertyGridEditor);
    Animate.PropFile = PropFile;
})(Animate || (Animate = {}));
var Animate;
(function (Animate) {
    var ButtonOptions = (function () {
        function ButtonOptions(onWindowShow, onWindowClosing, getValue) {
            this.onWindowShow = onWindowShow;
            this.onWindowClosing = onWindowClosing;
            this.getValue = getValue;
        }
        return ButtonOptions;
    })();
    Animate.ButtonOptions = ButtonOptions;
    /**
    * An editor which allows a user to click a button, which will popup a window  filled with options
    */
    var PropOptionsWindow = (function (_super) {
        __extends(PropOptionsWindow, _super);
        function PropOptionsWindow(grid) {
            _super.call(this, grid);
        }
        /**
        * Called when a property grid is editing an object. The property name, value and type are passed.
        * If this editor can edit the property it returns a valid JQuery object which is responsible for editing
        * the object. The property grid makes no effort to maintain this. It is up to the Editor to watch the JQuery through
        * events to see when its been interacted with. Once its been edited, the editor must notify the grid - to do this
        * call the notify method.
        * @param {string} propertyName The name of the property we are creating an HTML element for
        * @param {any} propertyValue The current value of that property
        * @param {ParameterType} objectType The type of property we need to create
        * @param {any} options Any options associated with the parameter
        * @returns {JQuery} A valid jQuery object or null if this editor does not support this property.
        */
        PropOptionsWindow.prototype.edit = function (propertyName, propertyValue, objectType, options) {
            if (objectType != Animate.ParameterType.OPTIONS)
                return null;
            if (!PropOptionsWindow._window) {
                PropOptionsWindow._window = new Animate.OkCancelForm(200, 200, true, true, "Options", false);
                PropOptionsWindow._window.element.css({ width: "", height: "" });
                PropOptionsWindow._window.content.element.css({ width: "", height: "" });
                PropOptionsWindow._window.okCancelContent.element.addClass("prop-options-content");
            }
            var buttonOptions = options;
            //Create HTML	
            var editor = jQuery("<div class='options-button button'>" + propertyName + "</div><div class='fix' ></div >");
            var that = this;
            //Functions to deal with user interactions with JQuery
            var onOkFormConfirm = function (e, event, sender) {
                PropOptionsWindow._window.headerText = propertyName;
                if (buttonOptions.onWindowClosing)
                    buttonOptions.onWindowClosing(PropOptionsWindow._window.okCancelContent, event);
                if (event.cancel === false) {
                    PropOptionsWindow._window.off(Animate.OkCancelFormEvents.CONFIRM, onOkFormConfirm);
                    var newValue = propertyValue;
                    if (buttonOptions.getValue)
                        newValue = buttonOptions.getValue();
                    that.notify(propertyName, newValue, objectType);
                }
            };
            // Called when we click on the button
            var mouseUp = function (e) {
                //Remove any previous references
                PropOptionsWindow._window.off(Animate.OkCancelFormEvents.CONFIRM, onOkFormConfirm);
                PropOptionsWindow._window.on(Animate.OkCancelFormEvents.CONFIRM, onOkFormConfirm);
                PropOptionsWindow._window.show(Animate.Application.getInstance(), NaN, NaN, true);
                if (buttonOptions.onWindowShow)
                    buttonOptions.onWindowShow(PropOptionsWindow._window.okCancelContent);
                PropOptionsWindow._window.center();
            };
            //Add listeners
            editor.on("mouseup", mouseUp);
            //Finall return editor as HTML to be added to the page
            return editor;
        };
        /**
        * Updates the value of the editor object  because a value was edited externally.
        * @param {any} newValue The new value
        * @param {JQuery} editHTML The JQuery that was generated by this editor that needs to be updated because something has updated the value externally.
        */
        PropOptionsWindow.prototype.update = function (newValue, editHTML) {
            jQuery("input", editHTML).val(newValue);
        };
        return PropOptionsWindow;
    })(Animate.PropertyGridEditor);
    Animate.PropOptionsWindow = PropOptionsWindow;
})(Animate || (Animate = {}));
var Animate;
(function (Animate) {
    /**
    * This represents a combo property for assets that the user can select from a list.
    */
    var PropComboGroup = (function (_super) {
        __extends(PropComboGroup, _super);
        function PropComboGroup(grid) {
            _super.call(this, grid);
        }
        /**
        * Called when a property grid is editing an object. The property name, value and type are passed.
        * If this editor can edit the property it returns a valid JQuery object which is responsible for editing
        * the object. The property grid makes no effort to maintain this. It is up to the Editor to watch the JQuery through
        * events to see when its been interacted with. Once its been edited, the editor must notify the grid - to do this
        * call the notify method.
        * @param {string} propertyName The name of the property we are creating an HTML element for
        * @param {any} propertyValue The current value of that property
        * @param {ParameterType} objectType The type of property we need to create
        * @param {any} options Any options associated with the parameter
        * @returns {JQuery} A valid jQuery object or null if this editor does not support this property.
        */
        PropComboGroup.prototype.edit = function (propertyName, propertyValue, objectType, options) {
            if (objectType != Animate.ParameterType.GROUP)
                return null;
            //Create HTML	
            var editor = this.createEditorJQuery(propertyName, "<select class='prop-combo' style = 'width:90%;'></select><div class='eye-picker'><img src='media/eye.png'/></div>", propertyValue);
            var selector = jQuery("select", editor);
            var eye = jQuery(".eye-picker", editor);
            //var parts: Array<string> = propertyValue.split(":") ;
            var nodes = Animate.TreeViewScene.getSingleton().getGroups();
            //Sort alphabetically
            nodes = nodes.sort(function (a, b) {
                var textA = a.text;
                var textB = b.text;
                return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
            });
            //Create the blank
            selector.append("<option value='' " + (propertyValue == "" ? "selected='selected'" : "") + "></option>");
            for (var i = 0; i < nodes.length; i++)
                selector.append("<option title='" + nodes[i].groupID + "' value='" + nodes[i].groupID + "' " + (propertyValue == nodes[i].groupID ? "selected='selected'" : "") + ">" + nodes[i].text + "</option>");
            var that = this;
            //Functions to deal with user interactions with JQuery
            var onSelect = function (e) {
                var val = selector.val();
                that.notify(propertyName, val, objectType);
            };
            var onEye = function (e) {
                var val = selector.val();
                Animate.TreeViewScene.getSingleton().selectNode(Animate.TreeViewScene.getSingleton().findNode("groupID", val), true);
            };
            //Add listeners
            eye.on("mouseup", onEye);
            selector.on("change", onSelect);
            //Finall return editor as HTML to be added to the page
            return editor;
        };
        return PropComboGroup;
    })(Animate.PropertyGridEditor);
    Animate.PropComboGroup = PropComboGroup;
})(Animate || (Animate = {}));
var Animate;
(function (Animate) {
    /**
    * This represents a combo property for assets that the user can select from a list.
    */
    var PropComboAsset = (function (_super) {
        __extends(PropComboAsset, _super);
        function PropComboAsset(grid) {
            _super.call(this, grid);
        }
        /**
        * Called when a property grid is editing an object. The property name, value and type are passed.
        * If this editor can edit the property it returns a valid JQuery object which is responsible for editing
        * the object. The property grid makes no effort to maintain this. It is up to the Editor to watch the JQuery through
        * events to see when its been interacted with. Once its been edited, the editor must notify the grid - to do this
        * call the notify method.
        * @param {string} propertyName The name of the property we are creating an HTML element for
        * @param {any} propertyValue The current value of that property
        * @param {ParameterType} objectType The type of property we need to create
        * @param {any} options Any options associated with the parameter
        * @returns {JQuery} A valid jQuery object or null if this editor does not support this property.
        */
        PropComboAsset.prototype.edit = function (propertyName, propertyValue, objectType, options) {
            if (objectType != Animate.ParameterType.ASSET)
                return null;
            //Create HTML	
            var editor = this.createEditorJQuery(propertyName, "<select class='prop-combo' style = 'width:90%;'></select><div class='eye-picker'><img src='media/eye.png'/></div>", propertyValue);
            var selector = jQuery("select", editor);
            var eye = jQuery(".eye-picker", editor);
            var selectedID = parseInt(propertyValue.selected);
            var className = propertyValue.className;
            var classNames = propertyValue.classNames ? propertyValue.classNames : [];
            if (className && className != "")
                classNames.push(className);
            if (classNames.length == 0)
                classNames.push(null);
            var nodes = Animate.TreeViewScene.getSingleton().getAssets(classNames);
            //Create the blank options and select it if nothing else is chosen
            selector.append("<option value='' " + (selectedID == 0 || isNaN(selectedID) ? "selected='selected'" : "") + "></option>");
            //Sort alphabetically
            nodes = nodes.sort(function (a, b) {
                var textA = a.asset.name.toUpperCase();
                var textB = b.asset.name.toUpperCase();
                return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
            });
            var len = nodes.length;
            for (var i = 0; i < len; i++)
                selector.append("<option title='" + nodes[i].asset.shallowId + " : " + nodes[i].asset.className + "' value='" + nodes[i].asset.shallowId + "' " + (selectedID == nodes[i].asset.shallowId ? "selected='selected'" : "") + ">" + nodes[i].asset.name + "</option>");
            var that = this;
            //Functions to deal with user interactions with JQuery
            var onSelect = function (e) {
                var val = selector.val();
                that.notify(propertyName, { classNames: classNames, selected: val }, objectType);
            };
            var onEye = function (e) {
                var val = parseInt(selector.val());
                var asset = Animate.User.get.project.getAssetByShallowId(val);
                if (asset)
                    Animate.TreeViewScene.getSingleton().selectNode(Animate.TreeViewScene.getSingleton().findNode("asset", asset), true);
                else
                    Animate.TreeViewScene.getSingleton().selectNode(Animate.TreeViewScene.getSingleton().findNode("className", classNames[0]), true);
            };
            //Add listeners
            eye.on("mouseup", onEye);
            selector.on("change", onSelect);
            //Finall return editor as HTML to be added to the page
            return editor;
        };
        return PropComboAsset;
    })(Animate.PropertyGridEditor);
    Animate.PropComboAsset = PropComboAsset;
})(Animate || (Animate = {}));
var Animate;
(function (Animate) {
    /**
    * This represents a property for choosing a list of assets
    */
    var PropAssetList = (function (_super) {
        __extends(PropAssetList, _super);
        function PropAssetList(grid) {
            _super.call(this, grid);
        }
        /**
        * Called when a property grid is editing an object. The property name, value and type are passed.
        * If this editor can edit the property it returns a valid JQuery object which is responsible for editing
        * the object. The property grid makes no effort to maintain this. It is up to the Editor to watch the JQuery through
        * events to see when its been interacted with. Once its been edited, the editor must notify the grid - to do this
        * call the notify method.
        * @param {string} propertyName The name of the property we are creating an HTML element for
        * @param {any} propertyValue The current value of that property
        * @param {ParameterType} objectType The type of property we need to create
        * @param {any} options Any options associated with the parameter
        * @returns {JQuery} A valid jQuery object or null if this editor does not support this property.
        */
        PropAssetList.prototype.edit = function (propertyName, propertyValue, objectType, options) {
            if (objectType != Animate.ParameterType.ASSET_LIST)
                return null;
            //Create HTML	
            var editor = this.createEditorJQuery(propertyName, "<select class='prop-combo' style='width:90%;'></select><div class='eye-picker'><img src='media/eye.png'/></div><div class='asset-list'><select class='asset-list-select' size='4'></select><div class='add'>Add</div><div class='remove'>Remove</div></div>", propertyValue);
            var selector = jQuery("select.prop-combo", editor);
            var eye = jQuery(".eye-picker", editor);
            var items = jQuery("select.asset-list-select", editor);
            var add = jQuery(".add", editor);
            var remove = jQuery(".remove", editor);
            var that = this;
            var assetId;
            var asset;
            var selectedIDs = propertyValue.selectedAssets || [];
            var className = propertyValue.className;
            var nodes = Animate.TreeViewScene.getSingleton().getAssets(className);
            //Sort alphabetically
            nodes = nodes.sort(function (a, b) {
                var textA = a.asset.name.toUpperCase();
                var textB = b.asset.name.toUpperCase();
                return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
            });
            // Fill the select with assets
            for (var i = 0, l = nodes.length; i < l; i++) {
                if (i == 0) {
                    assetId = nodes[i].asset.shallowId;
                    asset = nodes[i].asset;
                }
                selector.append("<option title='" + nodes[i].asset.shallowId + " : " + nodes[i].asset.className + "' value='" + nodes[i].asset.shallowId + "' " + (i == 0 ? "selected='selected'" : "") + ">" + nodes[i].asset.name + "</option>");
            }
            // Fill the already selected items 
            for (var i = 0, l = selectedIDs.length; i < l; i++) {
                var selectedAsset = Animate.User.get.project.getAssetByShallowId(selectedIDs[i]);
                if (selectedAsset)
                    items.append("<option title='" + selectedIDs[i] + " : " + selectedAsset.className + "' value='" + selectedAsset.shallowId + "'>" + selectedAsset.name + "</option>");
            }
            // When we select an asset
            var onSelect = function (e) {
                assetId = parseInt(selector.val());
                asset = Animate.User.get.project.getAssetByShallowId(assetId);
            };
            // When we select an asset in the list, select that in the drop down
            var onItemSelect = function (e) {
                selector.val(items.val());
            };
            // When we click on the eye selector
            var onEye = function (e) {
                var val = parseInt(selector.val());
                asset = Animate.User.get.project.getAssetByShallowId(val);
                if (asset)
                    Animate.TreeViewScene.getSingleton().selectNode(Animate.TreeViewScene.getSingleton().findNode("asset", asset), true);
                else
                    Animate.TreeViewScene.getSingleton().selectNode(Animate.TreeViewScene.getSingleton().findNode("className", propertyValue.className), true);
            };
            // When we click on add button
            var onAdd = function (e) {
                if (asset && selectedIDs.indexOf(assetId) == -1) {
                    selectedIDs.push(assetId);
                    items.append("<option title='" + assetId + " : " + asset.className + "' value='" + asset.shallowId + "'>" + asset.name + "</option>");
                    that.notify(propertyName, { className: propertyValue.className, selectedAssets: selectedIDs }, objectType);
                }
            };
            // When we click on remove button
            var onRemove = function (e) {
                var toRemove = parseInt(items.val());
                if (selectedIDs.indexOf(toRemove) != -1) {
                    selectedIDs.splice(selectedIDs.indexOf(toRemove), 1);
                    jQuery('option:selected', items).remove();
                    that.notify(propertyName, { className: propertyValue.className, selectedAssets: selectedIDs }, objectType);
                }
            };
            //Add listeners
            eye.on("mouseup", onEye);
            selector.on("change", onSelect);
            items.on("change", onItemSelect);
            add.on("mouseup", onAdd);
            remove.on("mouseup", onRemove);
            //Finall return editor as HTML to be added to the page
            return editor;
        };
        return PropAssetList;
    })(Animate.PropertyGridEditor);
    Animate.PropAssetList = PropAssetList;
})(Animate || (Animate = {}));
var Animate;
(function (Animate) {
    var PropColorPair = (function () {
        function PropColorPair(id, color) {
            this.id = id;
            this.color = color;
        }
        return PropColorPair;
    })();
    /**
    * This editor is used to pick colours from a colour dialogue.
    */
    var PropColorPicker = (function (_super) {
        __extends(PropColorPicker, _super);
        function PropColorPicker(grid) {
            _super.call(this, grid);
            this.mIDs = [];
        }
        /**
        * Called when a property grid is editing an object. The property name, value and type are passed.
        * If this editor can edit the property it returns a valid JQuery object which is responsible for editing
        * the object. The property grid makes no effort to maintain this. It is up to the Editor to watch the JQuery through
        * events to see when its been interacted with. Once its been edited, the editor must notify the grid - to do this
        * call the notify method.
        * @param {string} propertyName The name of the property we are creating an HTML element for
        * @param {any} propertyValue The current value of that property
        * @param {ParameterType} objectType The type of property we need to create
        * @param {any} options Any options associated with the parameter
        * @returns {JQuery} A valid jQuery object or null if this editor does not support this property.
        */
        PropColorPicker.prototype.edit = function (propertyName, propertyValue, objectType, options) {
            if (objectType != Animate.ParameterType.COLOR)
                return null;
            //var parts = propertyValue.split( ":" );
            var color = propertyValue.color;
            var alpha = parseFloat(propertyValue.opacity);
            var _id1 = "c" + Animate.Component.idCounter;
            Animate.Component.idCounter++;
            var _id2 = "c" + Animate.Component.idCounter;
            Animate.Component.idCounter++;
            this.mIDs.push(new PropColorPair(_id1, color));
            //Create HTML	
            var editor = this.createEditorJQuery(propertyName, "<div style='width:100%; height:20px; background:url(media/map-opacity.png);' ><input style='width:80%; opacity:" + alpha + ";' class='color PropTextbox' id = '" + _id1 + "' value = '" + color + "' ></input><input id='" + _id2 + "' class='PropTextbox' style='width:20%;' value='" + alpha + "'></input></div>", propertyValue);
            var that = this;
            //Functions to deal with user interactions with JQuery
            var onValueEdited = function (e) {
                var col = jQuery("#" + _id1).val();
                var alpha = jQuery("#" + _id2).val();
                jQuery("#" + _id1).css("opacity", alpha);
                that.notify(propertyName, { color: col, opacity: alpha }, objectType);
            };
            //Add listeners
            var input = jQuery("#" + _id2, editor);
            input.on("keyup", onValueEdited);
            jQuery("#" + _id1, editor).on("change", onValueEdited);
            editor.on("mouseup", onValueEdited);
            //Finall return editor as HTML to be added to the page
            return editor;
        };
        /**
        * Called when the editor is being added to the DOM
        */
        PropColorPicker.prototype.onAddedToDom = function () {
            var i = this.mIDs.length;
            while (i--) {
                var color = (this.mIDs[i] && this.mIDs[i].color ? this.mIDs[i].color.toString() : "ffffff");
                var myPicker = new jscolor.color(document.getElementById(this.mIDs[i].id), {});
                myPicker.fromString(color); // now you can access API via 'myPicker' variable
            }
            this.mIDs.splice(0, this.mIDs.length);
        };
        return PropColorPicker;
    })(Animate.PropertyGridEditor);
    Animate.PropColorPicker = PropColorPicker;
})(Animate || (Animate = {}));
var Animate;
(function (Animate) {
    var PropertyGridEvents = (function (_super) {
        __extends(PropertyGridEvents, _super);
        function PropertyGridEvents(v) {
            _super.call(this, v);
        }
        PropertyGridEvents.PROPERTY_EDITED = new PropertyGridEvents("property_grid_edited");
        return PropertyGridEvents;
    })(Animate.ENUM);
    Animate.PropertyGridEvents = PropertyGridEvents;
    /**
    * A specialised event class for the property grid
    */
    var PropertyGridEvent = (function (_super) {
        __extends(PropertyGridEvent, _super);
        function PropertyGridEvent(eventName, propName, id, value, type) {
            _super.call(this, eventName);
            this.propertyName = propName;
            this.id = id;
            this.propertyValue = value;
            this.propertyType = type;
        }
        return PropertyGridEvent;
    })(Animate.Event);
    Animate.PropertyGridEvent = PropertyGridEvent;
    /**
    * A small holder class for the property grid
    */
    var EditorElement = (function () {
        function EditorElement(html, name, originalValue, originalType, editor) {
            this.html = html;
            this.name = name;
            this.originalValue = originalValue;
            this.editor = editor;
        }
        return EditorElement;
    })();
    var EditableSetToken = (function () {
        function EditableSetToken() {
            this.name = "";
            this.category = "";
            this.value = null;
            this.type = "";
            this.options = null;
        }
        return EditableSetToken;
    })();
    Animate.EditableSetToken = EditableSetToken;
    /**
    * Defines a property grid variable
    */
    var PropertyGridVariable = (function () {
        function PropertyGridVariable(name, value, type, category, options) {
            this.name = name;
            this.value = value;
            this.type = type;
            this.category = category;
            this.options = options;
        }
        /** Cleans up the class */
        PropertyGridVariable.prototype.dispose = function () {
            this.name = null;
            this.value = null;
            this.type = null;
            this.category = null;
            this.options = null;
        };
        return PropertyGridVariable;
    })();
    Animate.PropertyGridVariable = PropertyGridVariable;
    /**
    * Defines a set of variables to use in the property grid
    */
    var EditableSet = (function () {
        /**
        * Creates a {PropertyGridSet}
        */
        function EditableSet() {
            this._variables = [];
        }
        EditableSet.prototype.addVar = function (name, value, type, category, options) {
            this._variables.push(new PropertyGridVariable(name, value, type, category, options));
        };
        /** Gets a variable by name */
        EditableSet.prototype.getVar = function (name) {
            var items = this._variables;
            var i = items.length;
            while (i--)
                if (items[i].name == name)
                    return items[i];
            return null;
        };
        /** Removes a variable */
        EditableSet.prototype.removeVar = function (variable) {
            var items = this._variables;
            var i = items.length;
            while (i--)
                if (items[i] == variable) {
                    items[i].dispose();
                    items.splice(i, 1);
                }
            return null;
        };
        /**
        * Updates a variable with a new value
        *  @returns The value
        */
        EditableSet.prototype.updateValue = function (name, value) {
            var len = this._variables.length;
            for (var i = 0; i < len; i++)
                if (this._variables[i].name == name) {
                    this._variables[i].value = value;
                    return value;
                }
            return null;
        };
        EditableSet.prototype.tokenize = function () {
            var toRet = new Array();
            var items = this._variables;
            var len = items.length;
            for (var i = 0; i < len; i++) {
                toRet[i] = new EditableSetToken();
                toRet[i].name = items[i].name;
                toRet[i].category = items[i].category;
                toRet[i].value = items[i].value;
                toRet[i].type = items[i].type.toString();
                toRet[i].options = items[i].options;
            }
            return toRet;
        };
        Object.defineProperty(EditableSet.prototype, "variables", {
            get: function () { return this._variables; },
            enumerable: true,
            configurable: true
        });
        return EditableSet;
    })();
    Animate.EditableSet = EditableSet;
    /**
    * A Component that you can use to edit objects. The Property grid will fill itself with Components you can use to edit a given object.
    * Each time the object is modified a <PropertyGrid.PROPERTY_EDITED> events are sent to listeners.
    */
    var PropertyGrid = (function (_super) {
        __extends(PropertyGrid, _super);
        function PropertyGrid(parent) {
            if (PropertyGrid._singleton != null)
                throw new Error("PropertyGrid is a singleton, you need to call the PropertyGrid.getSingleton() function to get its instance.");
            PropertyGrid._singleton = this;
            // Call super-class constructor
            _super.call(this, "<div class='property-grid'></div>", parent);
            this._header = jQuery("<div class='property-grid-header background-dark'>Select an Object</div>");
            this.element.append(this._header);
            //Private vars
            this._editors = [];
            this._editorElements = [];
            this._idObject = null;
            this._docker = null;
            this._groups = [];
            this.addEditor(new Animate.PropTextbox(this));
            this.addEditor(new Animate.PropNumber(this));
            this.addEditor(new Animate.PropComboBool(this));
            this.addEditor(new Animate.PropComboEnum(this));
            this.addEditor(new Animate.PropComboGroup(this));
            this.addEditor(new Animate.PropComboAsset(this));
            this.addEditor(new Animate.PropColorPicker(this));
            this.addEditor(new Animate.PropFile(this));
            this.addEditor(new Animate.PropAssetList(this));
            this.addEditor(new Animate.PropOptionsWindow(this));
            this._endDiv = jQuery("<div class='fix' style='height:1px' ></div>");
        }
        /**
        * This is called by a controlling ScreenManager class. An image string needs to be returned
        * which will act as a preview of the component that is being viewed or hidden.
        * @returns <string> The image url
        */
        PropertyGrid.prototype.getPreviewImage = function () { return "media/spanner.png"; };
        /**
        * Each IDock item needs to implement this so that we can keep track of where it moves.
        */
        PropertyGrid.prototype.getDocker = function () { return this._docker; };
        /**
        * Each IDock item needs to implement this so that we can keep track of where it moves.
        * @param <object> val
        */
        PropertyGrid.prototype.setDocker = function (val) { this._docker = val; };
        /**
        * This is called by a controlling Docker class when the component needs to be shown.
        */
        PropertyGrid.prototype.onShow = function () { };
        /**
        * This is called by a controlling Docker class when the component needs to be hidden.
        */
        PropertyGrid.prototype.onHide = function () { };
        /**
        * When we scroll on either of the scroll panel's we do the same to the other.
        * @param <jQuery> e The jQuery event object
        */
        PropertyGrid.prototype.scroll = function (e) {
            this._targetPanel.scrollLeft(this._activePanel.scrollLeft());
            this._targetPanel.scrollTop(this._activePanel.scrollTop());
        };
        /**
        * This function is used to update a property value in the property grid.
        * @param {string} name The name of the property
        * @param {any} value The new value of the property
        */
        PropertyGrid.prototype.updateProperty = function (name, value) {
            var i = this._editorElements.length;
            while (i--) {
                if (this._editorElements[i].name == name) {
                    if (this._editorElements[i].editor.update)
                        this._editorElements[i].editor.update(value, this._editorElements[i].html);
                    return;
                }
            }
        };
        /**
        * Sets the object we are going to edit.
        * @param {EditableSet} object The object we are editing. You should ideally create a new object {}, and then
        * use the function pGridEditble to create valid property grid variables.
        * @param {string} name The name of the object we are editing
        * @param {string} id You can give an ID to help identify this item once its edited.
        * @param {string} img An optional image string
        * @returns {any} Returns the object we are currently editing
        */
        PropertyGrid.prototype.editableObject = function (object, name, id, img) {
            if (id === void 0) { id = object; }
            if (img === void 0) { img = ""; }
            if (!this.enabled)
                return;
            if (object !== undefined && object != null) {
                this._idObject = id;
                //this.headerPanel.caption( name );
                this._header.html((img && img != "" ? "<img src='" + img + "' />" : "") + name);
                //Remove all previous labels and HTML elements.
                var ie = this._editorElements.length;
                while (ie--)
                    jQuery(this._editorElements[ie].html).remove();
                this._editorElements.splice(0, this._editorElements.length);
                //Cleanup editors
                ie = this._editors.length;
                while (ie--)
                    this._editors[ie].cleanup();
                //Cleanup groups
                var ig = this._groups.length;
                while (ig--) {
                    this.removeChild(this._groups[ig]);
                    this._groups[ig].dispose();
                }
                this._groups = [];
                var sortable = [];
                //Set the editable
                this._editableObject = object;
                var variables = object.variables;
                var len = variables.length;
                for (var i = 0; i < len; i++) {
                    var editors = this._editors;
                    var editor = editors.length;
                    while (editor--) {
                        if (variables[i].type == Animate.ParameterType.HIDDEN || variables[i].type == Animate.ParameterType.HIDDEN_FILE)
                            continue;
                        var editorHTML = editors[editor].edit(variables[i].name, variables[i].value, variables[i].type, variables[i].options);
                        if (editorHTML != null) {
                            if (variables[i].category == null || variables[i].category == "")
                                variables[i].category = "General Properties";
                            //First check if the group exists
                            var groupI = this._groups.length;
                            var groupComp = null;
                            while (groupI--)
                                if (this._groups[groupI].name == variables[i].category) {
                                    groupComp = this._groups[groupI];
                                    break;
                                }
                            //If no group exists - then add it
                            if (groupComp == null) {
                                groupComp = new Animate.PropertyGridGroup(variables[i].category);
                                this._groups.push(groupComp);
                            }
                            sortable.push({ name: variables[i].name, group: groupComp, editor: editors[editor], divs: editorHTML, category: variables[i].category });
                            //editors[editor].grid = this;
                            //editors[editor].propUpdated = this.propUpdated;
                            var elm = new EditorElement(editorHTML, variables[i].name, variables[i].value, variables[i].type, editors[editor]);
                            this._editorElements.push(elm);
                            break;
                        }
                    }
                }
                //Sort by the groups first
                sortable.sort(function (a, b) {
                    var textA = a.group.name.toUpperCase();
                    var textB = b.group.name.toUpperCase();
                    return (textA > textB) ? -1 : (textA < textB) ? 1 : 0;
                });
                //Finall add the elements to the DOM
                var i = sortable.length;
                while (i--) {
                    if (sortable[i].group.parent == null)
                        this.addChild(sortable[i].group);
                }
                //Just add the fix after each group
                this._endDiv.detach();
                this.element.append(this._endDiv);
                //Now sort each of the sub properties
                sortable.sort(function (a, b) {
                    var textA = a.name.toUpperCase();
                    var textB = b.name.toUpperCase();
                    return (textA > textB) ? -1 : (textA < textB) ? 1 : 0;
                });
                //Finall add the sub elements to the DOM
                i = sortable.length;
                while (i--)
                    sortable[i].group.content.append(sortable[i].divs);
                //Finally notify all editors they have been added
                i = sortable.length;
                while (i--)
                    sortable[i].editor.onAddedToDom();
            }
            else {
                this._header.html("Please select an object.");
                //Remove all previous labels and HTML elements.
                var i = this._editorElements.length;
                while (i--) {
                    jQuery(this._editorElements[i].html).remove();
                }
                this._editorElements.splice(0, this._editorElements.length);
                //Cleanup editors
                i = this._editors.length;
                while (i--)
                    this._editors[i].cleanup();
                //Cleanup groups
                i = this._groups.length;
                while (i--) {
                    this.removeChild(this._groups[i]);
                    this._groups[i].dispose();
                }
                this._groups = [];
                //Set the editable
                this._editableObject = null;
            }
            return this._editableObject;
        };
        /**
        * Called when a property has been updated. This will inturn get the event <PropertyGrid.PROPERTY_EDITED> dispatched.
        * @param <string> name The name of the property
        * @param <object> value The new value of the property
        * @param <string> type The propert type
        */
        PropertyGrid.prototype.propUpdated = function (name, value, type) {
            //dispatches the grid event
            this.dispatchEvent(new PropertyGridEvent(PropertyGridEvents.PROPERTY_EDITED, name, this._idObject, value, type));
        };
        /**
        * called when we reset the project
        * @returns <object>
        */
        PropertyGrid.prototype.projectReset = function () {
            this.editableObject(null, "", "", "");
        };
        /**
        * Add a new editor to the property grid.
        * @param {PropertyGridEditor} editor The PropertyGridEditor object to add
        * @returns {PropertyGridEditor}
        */
        PropertyGrid.prototype.addEditor = function (editor) {
            this._editors.push(editor);
            return editor;
        };
        /**
        * Removes an editor from the property grid.
        * @param {PropertyGridEditor} editor The PropertyGridEditor object to remove.
        * @returns {PropertyGridEditor} The editor or null
        */
        PropertyGrid.prototype.removeEditor = function (editor) {
            if (this._editors.indexOf(editor) != -1) {
                this._editors.splice(this._editors.indexOf(editor), 1);
                return editor;
            }
            return null;
        };
        /**
        * This will cleanup the component.
        */
        PropertyGrid.prototype.dispose = function () {
            this._editableObject = null;
            //Call super
            _super.prototype.dispose.call(this);
        };
        /**
        * Gets the singleton instance.
        * @returns <PropertyGrid>
        */
        PropertyGrid.getSingleton = function (parent) {
            if (!PropertyGrid._singleton)
                new PropertyGrid(parent);
            return PropertyGrid._singleton;
        };
        Object.defineProperty(PropertyGrid.prototype, "currentObject", {
            get: function () { return this._editableObject; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PropertyGrid.prototype, "idObject", {
            get: function () { return this._idObject; },
            enumerable: true,
            configurable: true
        });
        return PropertyGrid;
    })(Animate.Component);
    Animate.PropertyGrid = PropertyGrid;
})(Animate || (Animate = {}));
var Animate;
(function (Animate) {
    /** A very simple class to represent tool bar buttons */
    var ToolBarButton = (function (_super) {
        __extends(ToolBarButton, _super);
        function ToolBarButton(text, image, pushButton, parent) {
            if (pushButton === void 0) { pushButton = false; }
            _super.call(this, "<div class='toolbar-button tooltip'><div><img src='" + image + "' /></div><div class='tooltip-text'>" + text + "</div></div>", parent);
            this._pushButton = pushButton;
            this._radioMode = false;
            this._proxyDown = this.onClick.bind(this);
            this.element.on("click", this._proxyDown);
        }
        /** Cleans up the button */
        ToolBarButton.prototype.dispose = function () {
            this.element.off("mousedown", this._proxyDown);
            this._proxyDown = null;
            _super.prototype.dispose.call(this);
        };
        ToolBarButton.prototype.onClick = function (e) {
            var element = this.element;
            if (this._pushButton) {
                if (!element.hasClass("selected"))
                    this.selected = true;
                else
                    this.selected = false;
            }
        };
        Object.defineProperty(ToolBarButton.prototype, "selected", {
            /**
            * Get if the component is selected. When set to true a css class of 'selected' is added to the {Component}
            */
            get: function () { return this.element.hasClass("selected"); },
            /**
            * Set if the component is selected. When set to true a css class of 'selected' is added to the {Component}
            */
            set: function (val) {
                if (val)
                    this.element.addClass("selected");
                else
                    this.element.removeClass("selected");
                if (this._radioMode && val && this.parent) {
                    var pChildren = this.parent.children;
                    for (var i = 0, len = pChildren.length; i < len; i++)
                        if (pChildren[i] != this && pChildren[i] instanceof ToolBarButton)
                            pChildren[i].selected = false;
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ToolBarButton.prototype, "radioMode", {
            get: function () { return this._radioMode; },
            /**
            * If true, the button will act like a radio button. It will deselect any other ToolBarButtons in its parent when its selected.
            */
            set: function (val) {
                this._radioMode = val;
            },
            enumerable: true,
            configurable: true
        });
        return ToolBarButton;
    })(Animate.Component);
    Animate.ToolBarButton = ToolBarButton;
})(Animate || (Animate = {}));
var Animate;
(function (Animate) {
    var ToolbarNumberEvents = (function (_super) {
        __extends(ToolbarNumberEvents, _super);
        function ToolbarNumberEvents(v) {
            _super.call(this, v);
        }
        ToolbarNumberEvents.CHANGED = new ToolbarNumberEvents("toolbar_number_changed");
        return ToolbarNumberEvents;
    })(Animate.ENUM);
    Animate.ToolbarNumberEvents = ToolbarNumberEvents;
    var ToolbarNumberEvent = (function (_super) {
        __extends(ToolbarNumberEvent, _super);
        function ToolbarNumberEvent(e, value) {
            this.value = value;
            _super.call(this, e, null);
        }
        return ToolbarNumberEvent;
    })(Animate.Event);
    Animate.ToolbarNumberEvent = ToolbarNumberEvent;
    /**
    *  A toolbar button for numbers
    */
    var ToolbarNumber = (function (_super) {
        __extends(ToolbarNumber, _super);
        /**
        * @param {Component} parent The parent of this toolbar
        */
        function ToolbarNumber(parent, text, defaultVal, minValue, maxValue, delta) {
            if (delta === void 0) { delta = 1; }
            _super.call(this, "<div class='toolbar-button tooltip scrolling-number'></div>", parent);
            var container = this.addChild("<div class='number-holder'></div>");
            this.addChild("<div class='tooltip-text'>" + text + "</div>");
            this.defaultVal = defaultVal;
            this.minValue = minValue;
            this.maxValue = maxValue;
            this.delta = delta;
            if (!ToolbarNumber.input) {
                ToolbarNumber.input = new Animate.InputBox(null, "");
                ToolbarNumber.input.element.css({ "pointer-events": "all" });
                ToolbarNumber.numInstances = 0;
            }
            this.label = container.addChild("<div class='number-label'>" + defaultVal + "</div>");
            var arrows = container.addChild("<div class='arrows'></div>");
            this.leftArrow = arrows.addChild("<div class='left'>←</div>");
            this.rightArrow = arrows.addChild("<div class='right'>→</div>");
            this.element.css("pointer-events", "all");
            this.startPos = 0;
            // TODO: Must find a way that ensures the mouse move events are not lost when we move over an iframe...
            //Events
            this.stageUpPoxy = jQuery.proxy(this.onStageUp, this);
            this.stageMovePoxy = jQuery.proxy(this.onStageMove, this);
            this.downProxy = jQuery.proxy(this.onDown, this);
            this.clickProxy = jQuery.proxy(this.onClick, this);
            this.wheelProxy = jQuery.proxy(this.onWheel, this);
            this.keyProxy = jQuery.proxy(this.onKeyDown, this);
            this.leftArrow.element.on("mousedown", this.downProxy);
            this.rightArrow.element.on("mousedown", this.downProxy);
            this.leftArrow.element.on("click", this.clickProxy);
            this.rightArrow.element.on("click", this.clickProxy);
            this.label.element.on("click", this.clickProxy);
            this.element.on("mousewheel", this.wheelProxy);
        }
        /**
        * Called when the mouse is down on the DOM
        * @param <object> e The jQuery event
        */
        ToolbarNumber.prototype.onStageUp = function (e) {
            var inputOnDOM = (ToolbarNumber.input.parent ? true : false);
            // Remove listeners
            var body = jQuery(window);
            body.off("mouseup", this.stageUpPoxy);
            body.off("mousemove", this.stageMovePoxy);
            jQuery(document).off('keydown', this.keyProxy);
            // If input present, then check what we are over
            if (inputOnDOM) {
                var targetComp = jQuery(e.target).data("component");
                if (!targetComp)
                    return;
                if (targetComp.parent == ToolbarNumber.input && !e.keyCode)
                    return;
                this.defaultVal = parseFloat(parseFloat(ToolbarNumber.input.text).toFixed(2));
                ToolbarNumber.input.parent.removeChild(ToolbarNumber.input);
                if (this.defaultVal < this.minValue)
                    this.defaultVal = this.minValue;
                if (this.defaultVal > this.maxValue)
                    this.defaultVal = this.maxValue;
                this.label.element.text(this.defaultVal.toString());
                this.dispatchEvent(new ToolbarNumberEvent(ToolbarNumberEvents.CHANGED, this.defaultVal));
            }
        };
        /**
        * Called when we move on the stage
        * @param <object> e The jQuery event
        */
        ToolbarNumber.prototype.onStageMove = function (e) {
            var delta = e.screenX - this.startPos;
            this.startPos = e.screenX;
            if (delta < 0)
                this.defaultVal -= this.delta;
            else
                this.defaultVal += this.delta;
            if (this.defaultVal < this.minValue)
                this.defaultVal = this.minValue;
            if (this.defaultVal > this.maxValue)
                this.defaultVal = this.maxValue;
            this.defaultVal = parseFloat(this.defaultVal.toFixed(2));
            this.label.element.text(this.defaultVal.toString());
            this.dispatchEvent(new ToolbarNumberEvent(ToolbarNumberEvents.CHANGED, this.defaultVal));
        };
        Object.defineProperty(ToolbarNumber.prototype, "value", {
            /**
            * Set or get the value
            * @param {number} val The value we are setting
            */
            get: function () { return this.defaultVal; },
            /**
            * Set or get the value
            * @param {number} val The value we are setting
            */
            set: function (val) {
                this.defaultVal = val;
                if (this.defaultVal < this.minValue)
                    this.defaultVal = this.minValue;
                if (this.defaultVal > this.maxValue)
                    this.defaultVal = this.maxValue;
                this.defaultVal = parseFloat(this.defaultVal.toFixed(2));
                this.label.element.text(this.defaultVal.toString());
            },
            enumerable: true,
            configurable: true
        });
        ToolbarNumber.prototype.onWheel = function (event, delta, deltaX, deltaY) {
            if (delta < 0)
                this.defaultVal -= this.delta;
            else
                this.defaultVal += this.delta;
            if (this.defaultVal < this.minValue)
                this.defaultVal = this.minValue;
            if (this.defaultVal > this.maxValue)
                this.defaultVal = this.maxValue;
            this.defaultVal = parseFloat(this.defaultVal.toFixed(2));
            this.label.element.text(this.defaultVal.toString());
            this.dispatchEvent(new ToolbarNumberEvent(ToolbarNumberEvents.CHANGED, this.defaultVal));
        };
        ToolbarNumber.prototype.onKeyDown = function (e) {
            //If enter
            if (e.keyCode == 13) {
                this.onStageUp(e);
            }
        };
        ToolbarNumber.prototype.onDown = function (e) {
            var body = jQuery(window);
            body.off("mouseup", this.stageUpPoxy);
            body.off("mousemove", this.stageMovePoxy);
            body.on("mouseup", this.stageUpPoxy);
            body.on("mousemove", this.stageMovePoxy);
            this.startPos = e.screenX;
            // Stops text selection
            e.preventDefault();
        };
        ToolbarNumber.prototype.onClick = function (e) {
            // Do nothing if the input box is present
            if (ToolbarNumber.input.parent)
                return;
            var target = jQuery(e.currentTarget).data("component");
            //If you click on the label, we replace it with an input box so you can enter data by typing
            if (target == this.label) {
                ToolbarNumber.input.text = target.element.text();
                target.element.text("");
                target.addChild(ToolbarNumber.input);
                jQuery("body").off("mouseup", this.stageUpPoxy);
                jQuery("body").on("mouseup", this.stageUpPoxy);
                jQuery(document).on('keydown', this.keyProxy);
                return;
            }
            if (target == this.leftArrow)
                this.defaultVal -= this.delta;
            else if (target == this.rightArrow)
                this.defaultVal += this.delta;
            if (this.defaultVal < this.minValue)
                this.defaultVal = this.minValue;
            if (this.defaultVal > this.maxValue)
                this.defaultVal = this.maxValue;
            this.defaultVal = parseFloat(this.defaultVal.toFixed(2));
            this.label.element.text(this.defaultVal.toString());
            this.dispatchEvent(new ToolbarNumberEvent(ToolbarNumberEvents.CHANGED, this.defaultVal));
        };
        /**
        * Cleans up the component
        */
        ToolbarNumber.prototype.dispose = function () {
            var body = jQuery(window);
            body.off("mouseup", this.stageUpPoxy);
            body.off("mousemove", this.stageMovePoxy);
            this.leftArrow.element.off("mousedown", this.downProxy);
            this.rightArrow.element.off("mousedown", this.downProxy);
            this.element.off("mousewheel", this.wheelProxy);
            this.leftArrow.element.off("click", this.clickProxy);
            this.rightArrow.element.off("click", this.clickProxy);
            this.label.element.off("click", this.clickProxy);
            this.downProxy = null;
            this.clickProxy = null;
            this.defaultVal = null;
            this.minValue = null;
            this.maxValue = null;
            this.delta = null;
            this.label = null;
            this.leftArrow = null;
            this.rightArrow = null;
            this.wheelProxy = null;
            this.stageUpPoxy = null;
            this.stageMovePoxy = null;
            this.startPos = null;
            ToolbarNumber.numInstances--;
            if (ToolbarNumber.numInstances <= 0) {
                ToolbarNumber.numInstances = 0;
                ToolbarNumber.input.dispose();
                ToolbarNumber.input = null;
            }
            //Call super
            _super.prototype.dispose.call(this);
        };
        ToolbarNumber.numInstances = 0;
        return ToolbarNumber;
    })(Animate.Component);
    Animate.ToolbarNumber = ToolbarNumber;
})(Animate || (Animate = {}));
var Animate;
(function (Animate) {
    /**
    *  Use this tool bar button to pick a colour.
    */
    var ToolbarColorPicker = (function (_super) {
        __extends(ToolbarColorPicker, _super);
        function ToolbarColorPicker(parent, text, color) {
            _super.call(this, "<div class='toolbar-button tooltip'></div>", parent);
            this.numberInput = this.addChild("<input class='toolbar-color' value='#ff0000'></input>");
            this.addChild("<div class='tooltip-text'>" + text + "</div>");
            this.picker = new jscolor.color(document.getElementById(this.numberInput.id));
            this.picker.fromString(color);
        }
        Object.defineProperty(ToolbarColorPicker.prototype, "color", {
            /**
            * Gets or sets the colour of the toolbar button
            */
            get: function () {
                return parseInt(this.numberInput.element.val(), 16);
            },
            /**
            * Gets or sets the colour of the toolbar button
            */
            set: function (color) {
                this.picker.fromString(color);
            },
            enumerable: true,
            configurable: true
        });
        /**
        * Disposes of and cleans up this button
        */
        ToolbarColorPicker.prototype.dispose = function () {
            this.picker = null;
            this.numberInput = null;
        };
        return ToolbarColorPicker;
    })(Animate.Component);
    Animate.ToolbarColorPicker = ToolbarColorPicker;
})(Animate || (Animate = {}));
var Animate;
(function (Animate) {
    /**
    * The interface for all layout objects.
    */
    var ToolbarItem = (function (_super) {
        __extends(ToolbarItem, _super);
        /**
        * @param {string} img The image path.
        * @param {string} text The text to use in the item.
        */
        function ToolbarItem(img, text, parent) {
            _super.call(this, "<div class='toolbar-button tooltip'><div><img src='" + img + "' /></div><div class='tooltip-text'>" + text + "</div></div>", parent);
            this.img = img;
            this.text = text;
        }
        return ToolbarItem;
    })(Animate.Component);
    Animate.ToolbarItem = ToolbarItem;
    var ToolbarDropDownEvent = (function (_super) {
        __extends(ToolbarDropDownEvent, _super);
        function ToolbarDropDownEvent(item, e) {
            this.item = item;
            _super.call(this, e, null);
        }
        ToolbarDropDownEvent.prototype.dispose = function () {
            this.item = null;
        };
        return ToolbarDropDownEvent;
    })(Animate.Event);
    Animate.ToolbarDropDownEvent = ToolbarDropDownEvent;
    /**
    *  A toolbar button for selection a list of options
    */
    var ToolbarDropDown = (function (_super) {
        __extends(ToolbarDropDown, _super);
        /**
        * @param {Component} parent The parent of this toolbar
        * @param {Array<ToolbarItem>} items An array of items to list e.g. [{img:"./img1.png", text:"option 1"}, {img:"./img2.png", text:"option 2"}]
        */
        function ToolbarDropDown(parent, items) {
            _super.call(this, "<div class='toolbar-button-drop-down tooltip'></div>", parent);
            this.items = items;
            this._popupContainer = new Animate.Component("<div class='tool-bar-dropdown background shadow-small'></div>");
            var i = items.length;
            while (i--)
                this._popupContainer.addChild(items[i]);
            if (items.length > 0)
                this._selectedItem = this.addChild(items[0]);
            else
                this._selectedItem = null;
            this._stageDownProxy = this.onStageUp.bind(this);
            this._clickProxy = this.onClick.bind(this);
            this.element.on("click", this._clickProxy);
        }
        /**
        * Adds an item the drop down. The item must be an object with both img and text vars. eg: { img:"", text:"" }
        * @param {ToolbarItem} item The item to add.
        * @returns {Component}
        */
        ToolbarDropDown.prototype.addItem = function (item) {
            var comp = this._popupContainer.addChild(item);
            this.items.push(item);
            return comp;
        };
        /**
        * Adds an item the drop down. The item must be an object with both img and text vars. eg: { img:"", text:"" }
        * @param {any} val This can be either the item object itself, its text or its component.
        * @param {boolean} dispose Set this to true if you want delete the item
        * @returns {Component} Returns the removed item component or null
        */
        ToolbarDropDown.prototype.removeItem = function (val, dispose) {
            if (dispose === void 0) { dispose = true; }
            var i = this.items.length;
            var items = this.items;
            while (i--)
                if (items[i] == val || items[i].text == val || items[i].comp == val) {
                    if (dispose)
                        items[i].dispose();
                    else
                        items[i].element.detach();
                    items.splice(i, 1);
                    return items[i];
                }
            return null;
        };
        /**
        * Clears all the items
        * @param {boolean} dispose Set this to true if you want to delete all the items from memory
        */
        ToolbarDropDown.prototype.clear = function (dispose) {
            if (dispose === void 0) { dispose = true; }
            var i = this.items.length;
            var items = this.items;
            while (i--) {
                if (dispose)
                    items[i].dispose();
                else
                    items[i].element.detach();
            }
            this._selectedItem = null;
            items.splice(0, items.length);
        };
        Object.defineProperty(ToolbarDropDown.prototype, "selectedItem", {
            /**
            * Gets the selected item
            * @returns {ToolbarItem}
            */
            get: function () {
                return this._selectedItem;
            },
            /**
            * Sets the selected item
            * @param {any} item
            */
            set: function (item) {
                if (this._selectedItem === item)
                    return;
                if (this._selectedItem)
                    this._popupContainer.addChild(this._selectedItem);
                this.addChild(item);
                var e = new ToolbarDropDownEvent(item, "clicked");
                this.dispatchEvent(e);
                e.dispose();
                this._selectedItem = item;
                return;
            },
            enumerable: true,
            configurable: true
        });
        /**
        * Called when the mouse is down on the DOM
        * @param {any} e The jQuery event
        */
        ToolbarDropDown.prototype.onStageUp = function (e) {
            var body = jQuery("body");
            body.off("mousedown", this._stageDownProxy);
            var comp = jQuery(e.target).data("component");
            this._popupContainer.element.detach();
            this.element.removeClass("active");
            if (comp) {
                var i = this.items.length;
                while (i--) {
                    if (comp == this.items[i]) {
                        this.selectedItem = comp;
                        return;
                    }
                }
            }
        };
        /**
        * When we click the main button
        * @param {any} e The jQuery event oject
        */
        ToolbarDropDown.prototype.onClick = function (e) {
            //var comp = jQuery( e.target ).data( "component" );
            var offset = this.element.offset();
            this.element.addClass("active");
            var body = jQuery("body");
            body.off("mousedown", this._stageDownProxy);
            body.on("mousedown", this._stageDownProxy);
            this._popupContainer.element.css({ top: offset.top + this.element.height(), left: offset.left });
            body.append(this._popupContainer.element);
        };
        /**
        * Cleans up the component
        */
        ToolbarDropDown.prototype.dispose = function () {
            var i = this.items.length;
            while (i--)
                this.items[i].dispose();
            this._popupContainer.dispose();
            this.element.off("click", this._clickProxy);
            this._clickProxy = null;
            this.items = null;
            this._popupContainer = null;
            this._selectedItem = null;
            //Call super
            _super.prototype.dispose.call(this);
        };
        return ToolbarDropDown;
    })(Animate.Component);
    Animate.ToolbarDropDown = ToolbarDropDown;
})(Animate || (Animate = {}));
var Animate;
(function (Animate) {
    var OkCancelFormEvents = (function (_super) {
        __extends(OkCancelFormEvents, _super);
        function OkCancelFormEvents(v) {
            _super.call(this, v);
        }
        OkCancelFormEvents.CONFIRM = new OkCancelFormEvents("ok_cancel_confirm");
        return OkCancelFormEvents;
    })(Animate.ENUM);
    Animate.OkCancelFormEvents = OkCancelFormEvents;
    var OkCancelFormEvent = (function (_super) {
        __extends(OkCancelFormEvent, _super);
        function OkCancelFormEvent(eventName, text) {
            _super.call(this, eventName, text);
            this.text = text;
            this.cancel = false;
        }
        return OkCancelFormEvent;
    })(Animate.Event);
    Animate.OkCancelFormEvent = OkCancelFormEvent;
    /**
    * A simple form which holds a heading, content and OK / Cancel buttons.
    */
    var OkCancelForm = (function (_super) {
        __extends(OkCancelForm, _super);
        /**
        * @param {number} width The width of the form
        * @param {number} height The height of the form
        * @param {boolean} autoCenter Should this window center itself on a resize event
        * @param {boolean} controlBox Does this window have a draggable title bar and close button
        * @param {string} title The text for window heading. Only applicable if we are using a control box.
        */
        function OkCancelForm(width, height, autoCenter, controlBox, title, hideCancel) {
            if (width === void 0) { width = 400; }
            if (height === void 0) { height = 400; }
            if (autoCenter === void 0) { autoCenter = true; }
            if (controlBox === void 0) { controlBox = false; }
            if (title === void 0) { title = ""; }
            if (hideCancel === void 0) { hideCancel = false; }
            // Call super-class constructor
            _super.call(this, width, height, autoCenter, controlBox, title);
            this.element.addClass("curve-med");
            this.element.css("height", "");
            //this.heading = new Label( this.content, "OkCancelForm" );
            this.okCancelContent = new Animate.Component("<div class='content'></div>", this.content);
            this.mButtonContainer = new Animate.Component("<div class='button-container'></div>", this.content);
            this.mOk = new Animate.Button("Ok", this.mButtonContainer);
            this.mCancel = new Animate.Button("Cancel", this.mButtonContainer);
            //Set button height and width
            this.mOk.css({ width: "70px", height: "30px", "margin-right": "3px" });
            this.mCancel.css({ width: "70px", height: "30px" });
            if (hideCancel)
                this.mCancel.element.hide();
            this.mOk.element.on("click", this.OnButtonClick.bind(this));
            this.mCancel.element.on("click", this.OnButtonClick.bind(this));
            this.keyProxy = this.onKeyDown.bind(this);
        }
        /**
        * When we click on the close button
        * @param {any} e The jQuery event object
        */
        OkCancelForm.prototype.onCloseClicked = function (e) {
            var event = new OkCancelFormEvent(OkCancelFormEvents.CONFIRM, "Cancel");
            this.dispatchEvent(event);
            if (event.cancel === false)
                this.hide();
        };
        /**
        * Called when we click one of the buttons. This will dispatch the event OkCancelForm.CONFIRM
        * and pass the text either for the ok or cancel buttons.
        * @param {any} e The jQuery event
        */
        OkCancelForm.prototype.OnButtonClick = function (e) {
            var event = new OkCancelFormEvent(OkCancelFormEvents.CONFIRM, jQuery(e.target).text());
            this.dispatchEvent(event);
            if (event.cancel === false)
                this.hide();
        };
        /**
        * Hides the window
        */
        OkCancelForm.prototype.hide = function () {
            _super.prototype.hide.call(this);
            jQuery("body").off("keydown", this.keyProxy);
        };
        /**
        * This function is used to cleanup the object before its removed from memory.
        */
        OkCancelForm.prototype.dispose = function () {
            this.mOk.element.off();
            this.mCancel.element.off();
            jQuery("body").off("keydown", this.keyProxy);
            this.content = null;
            this.mButtonContainer = null;
            this.mOk = null;
            this.mCancel = null;
            this.keyProxy = null;
            this.okCancelContent = null;
            //Call super
            _super.prototype.dispose.call(this);
        };
        /**
        * Shows the window by adding it to a parent.
        * @param {Component} parent The parent Component we are adding this window to
        * @param {number} x The x coordinate of the window
        * @param {number} y The y coordinate of the window
        * @param {boolean} isModal Does this window block all other user operations?
        * @param {boolean} isPopup If the window is popup it will close whenever anything outside the window is clicked
        */
        OkCancelForm.prototype.show = function (parent, x, y, isModal, isPopup) {
            //var x = jQuery( "body" ).width() / 2 - this.element.width() / 2;
            //var y = jQuery( "body" ).height() / 2 - this.element.height() / 2;
            if (parent === void 0) { parent = null; }
            if (x === void 0) { x = NaN; }
            if (y === void 0) { y = NaN; }
            if (isModal === void 0) { isModal = true; }
            if (isPopup === void 0) { isPopup = false; }
            //if ( y + this.element.height() > jQuery( "body" ).height() )
            //	y = jQuery( "body" ).height() - this.element.height();
            //if ( x + this.element.width() > jQuery( "body" ).width() )
            //	x = jQuery( "body" ).width() - this.element.width();
            _super.prototype.show.call(this, null, x, y, true, false);
            jQuery("body").on("keydown", this.keyProxy);
            this.onWindowResized(null);
        };
        /**
        * Catch the key down events.
        * @param {any} e The jQuery event object
        */
        OkCancelForm.prototype.onKeyDown = function (e) {
            //If delete pressed
            if (e.keyCode == 13)
                this.mOk.element.trigger("click");
        };
        return OkCancelForm;
    })(Animate.Window);
    Animate.OkCancelForm = OkCancelForm;
})(Animate || (Animate = {}));
var Animate;
(function (Animate) {
    /**
    * Use this form to set the project meta and update build versions.
    */
    var BuildOptionsForm = (function (_super) {
        __extends(BuildOptionsForm, _super);
        function BuildOptionsForm() {
            _super.call(this, 600, 500, true, true, "Settings");
            BuildOptionsForm._singleton = this;
            this.element.addClass("build-options-form");
            //this.okCancelContent.element.css( { height: "500px" });
            this._tab = new Animate.Tab(this.content);
            var tabPage = this._tab.addTab("Project", false).page;
            this._projectElm = jQuery("#options-project").remove().clone();
            this._buildElm = jQuery("#options-build").remove().clone();
            this._userElm = jQuery("#options-user").remove().clone();
            tabPage.element.append(this._projectElm);
            this.$user = Animate.User.get;
            this.$project = null;
            this.$errorMsg = "";
            this.$errorMsgImg = "";
            this.$loading = false;
            this.$projectToken = { tags: [] };
            this.$loadingPercent = "";
            // Compile the HTML
            Animate.Compiler.build(this._projectElm, this, false);
            //var projectGroup = new Group( "Project Options", tabPage );
            //var imgGroup = new Group( "Image", tabPage );
            //this._projectTab = tabPage;
            tabPage = this._tab.addTab("Build Options", false).page;
            tabPage.element.append(this._buildElm);
            //var buildGroup = new Group( "Build", null );
            //var notesGroup = new Group( "Properties", null );
            //Project fields
            //this._name = new LabelVal( projectGroup.content, "Name", new InputBox( null, "" ) );
            //this._tags = new LabelVal( projectGroup.content, "Tags", new InputBox( null, "" ) );
            //this._description = new LabelVal( projectGroup.content, "Description", new InputBox( null, "", true ) );
            //(<Label>this._description.val).textfield.element.css( { height: "180px" });
            //var combo : ComboBox = new ComboBox();
            //combo.addItem( "Private" );
            //combo.addItem( "Public" );
            //this._projVisibility = new LabelVal( projectGroup.content, "Visibility", combo );
            //info = new Label( "If public, your project will be searchable on the Webinate gallery.", projectGroup.content );
            //info.element.addClass( "info" );
            //combo = new ComboBox();
            //combo.addItem( "Other" );
            //combo.addItem( "Artistic" );
            //combo.addItem( "Gaming" );
            //combo.addItem( "Informative" );
            //combo.addItem( "Musical" );
            //combo.addItem( "Fun" );
            //combo.addItem( "Technical" );
            //this._category = new LabelVal( projectGroup.content, "Category", combo );
            //info = new Label( "Optionally provide a project category. The default is 'Other'", projectGroup.content );
            //info.element.addClass( "info" );
            //this._saveProject = new Button( "Save", projectGroup.content );
            //this._saveProject.css( { width: "85px" });
            //Image
            //this._imgPreview = <Component>imgGroup.content.addChild( "<div class='preview'></div>" );
            //var imgData : Component = <Component>imgGroup.content.addChild( "<div class='img-data'></div>" );
            //info = new Label( "Upload an image for the project; this image will show up in the Animate gallery for others to see. <br/><br/><span class='nb'>Your application must have an image in order to be shown in the gallery.</span></br><br/>Your project image should be either a .png, .jpg or .jpeg image that is 200 by 200 pixels.", imgData );
            //info.element.addClass( "info" );
            //this._addButton = <Component>imgData.addChild( "<div class='tool-bar-group'><div class='toolbar-button tooltip'><div><img src='media/add-asset.png' /></div><div class='tooltip-text'>Add</div></div></div>" );
            //imgGroup.content.addChild( "<div class='fix'></div>" );
            //Build options	
            //this._buildVerMaj = new LabelVal( buildGroup.content, "Major Version: ", new InputBox( null, "1" ), { width: "50px", "float": "left", "margin": "0 0 10px 10px" });
            //this._buildVerMid = new LabelVal( buildGroup.content, "Mid Version: ", new InputBox( null, "0" ), { width: "50px", "float": "left", "margin": "0 0 10px 10px" });
            //this._buildVerMin = new LabelVal( buildGroup.content, "Minor Version: ", new InputBox( null, "0" ), { width: "50px", "float": "left", "margin": "0 0 10px 10px" });
            //buildGroup.content.element.append( "<div class='fix'></div>" );
            //var info = new Label( "When you build a project it saves the data according to its version number. This helps you differenciate your builds and release incremental versions. You can switch between the different builds by specifying which version to use. Use the above fields to select, or if its not present create, a particular build.", buildGroup.content);
            //info.element.addClass( "info" );
            //this._selectBuild = new Button( "Select Build", buildGroup.content );
            //this._selectBuild.css( { width: "85px" });
            //this._buildVerMaj.element.css( { "width": "auto", "float": "left", "margin": "0 0 0 5px" });
            //this._buildVerMid.element.css( { "width": "auto", "float": "left", "margin": "0 0 0 5px" });
            //this._buildVerMin.element.css( { "width": "auto", "float": "left", "margin": "0 0 0 5px" });
            //Notes
            //this._notes = new LabelVal( notesGroup.content, "Notes", new InputBox( null, "Some notes", true ) );
            //(<Label>this._notes.val).textfield.element.css( { height: "80px" });
            //info = new Label("Use the above pad to store some build notes for the selected build.", notesGroup.content );
            //info.element.addClass( "info" );
            //var combo = new ComboBox();
            ///combo.addItem( "Private" );
            ////combo.addItem( "Public" );
            //this._visibility = new LabelVal( notesGroup.content, "Visibility", combo );
            //info = new Label( "by default all builds are public. If you want to make your project private, then please upgrade your account.", notesGroup.content );
            //info.element.addClass( "info" );
            //this._saveBuild = new Button( "Save", notesGroup.content );
            //this._saveBuild.css( { width: "85px" });
            //this._warning = new Label( "", this.content );
            //this._warning.element.addClass( "server-message" );
            //Create the proxies
            //this._renameProxy = jQuery.proxy( this.onRenamed, this );
            //this._buildProxy = jQuery.proxy( this.onBuildResponse, this );
            //this._submitProxy = jQuery.proxy( this.onSubmit, this );
            //this._progressProxy = jQuery.proxy( this.onProgress, this );
            //this._completeProxy = jQuery.proxy( this.onUploadComplete, this );
            //this._errorProxy = jQuery.proxy( this.onError, this );
            //this._clickProxy = jQuery.proxy( this.onClick, this );
            //this._saveProject.element.on( "click", this._clickProxy );
            //this._selectBuild.element.on( "click", this._clickProxy );
            //this._saveBuild.element.on( "click", this._clickProxy );
            this._settingPages = [];
            this._tab.on(Animate.TabEvents.SELECTED, this.onTab, this);
            //this.addSettingPage(new UserPreferences("User Options"));
            tabPage = this._tab.addTab("User Options", false).page;
            tabPage.element.append(this._userElm);
            // Make the form resizable
            var that = this;
            this.element.resizable({
                minHeight: 50,
                minWidth: 50,
                helper: "ui-resizable-helper",
                stop: function () {
                    that.update();
                }
            });
        }
        /**
        * Attempts to update the project
        */
        BuildOptionsForm.prototype.updateDetails = function (token) {
            var that = this, project = Animate.User.get.project;
            this.$loading = true;
            this.$errorMsg = "";
            project.updateDetails(token).fail(function (err) {
                that.$errorMsg = err.message;
            }).done(function () {
                // Update the project object
                for (var i in token)
                    project.entry[i] = token[i];
            }).always(function () {
                that.$loading = false;
                Animate.Compiler.digest(that._projectElm, that, false);
            });
        };
        /**
        * Given a form element, we look at if it has an error and based on the expression. If there is we set the error message
        * @param {EngineForm} The form to check.
        * @param {boolean} True if there is an error
        */
        BuildOptionsForm.prototype.reportError = function (form) {
            if (!form.$error)
                this.$errorMsg = "";
            else {
                var name = form.$errorInput;
                name = name.charAt(0).toUpperCase() + name.slice(1);
                switch (form.$errorExpression) {
                    case "alpha-numeric":
                        this.$errorMsg = name + " must only contain alphanumeric characters";
                        break;
                    case "email-plus":
                        this.$errorMsg = name + " must only contain alphanumeric characters or a valid email";
                        break;
                    case "non-empty":
                        this.$errorMsg = name + " cannot be empty";
                        break;
                    case "email":
                        this.$errorMsg = name + " must be a valid email";
                        break;
                    case "alpha-numeric-plus":
                        this.$errorMsg = name + " must only contain alphanumeric characters and '-', '!', or '_'";
                        break;
                    case "no-html":
                        this.$errorMsg = name + " must not contain any html";
                        break;
                    default:
                        this.$errorMsg = "";
                        break;
                }
            }
            if (this.$errorMsg == "")
                return false;
            else
                return true;
        };
        /**
        * Updates the user bio information
        * @param {string} bio The new bio data
        */
        BuildOptionsForm.prototype.updateBio = function (bio) {
            var that = this, user = this.$user;
            this.$loading = true;
            this.$errorMsg = "";
            user.updateDetails({ bio: bio }).fail(function (err) {
                that.$errorMsg = err.message;
            }).always(function () {
                that.$loading = false;
                Animate.Compiler.digest(that._userElm, that, false);
            });
        };
        /**
        * Called when we click on the settings tab
        * @param {any} event
        * @param {any} data
        */
        BuildOptionsForm.prototype.onTab = function (response, event, sender) {
            var i = this._settingPages.length;
            while (i--)
                if (this._settingPages[i].name == event.pair.text)
                    this._settingPages[i].onTab();
            Animate.Compiler.digest(this._projectElm, this, false);
            Animate.Compiler.digest(this._buildElm, this, false);
            Animate.Compiler.digest(this._userElm, this, false);
        };
        /**
        * Use this function to add a new settings page to the settings menu
        * @param {ISettingsPage} component The ISettingsPage component we're adding
        */
        BuildOptionsForm.prototype.addSettingPage = function (component) {
            this._settingPages.push(component);
            var tabPage = this._tab.addTab(component.name, false);
            tabPage.page.addChild(component);
        };
        /**
        * When we click one of the buttons
        * @param {any} e
        * @returns {any}
        */
        BuildOptionsForm.prototype.onClick = function (e) {
            var target = jQuery(e.currentTarget).data("component");
            if (target == null) {
            }
            else if (target == this._saveBuild) {
                //Check if the values are valid
                //(<Label>this._name.val).textfield.element.removeClass( "red-border" );
                //this._warning.textfield.element.css( "color", "" );
                //Check for special chars
                var message = Animate.Utils.checkForSpecialChars(this._notes.val.text, true);
                if (message != null) {
                    this._notes.val.textfield.element.addClass("red-border");
                    //this._warning.textfield.element.css( "color", "#FF0000" );
                    //this._warning.text = message;
                    return;
                }
                var user = Animate.User.get;
                var project = Animate.User.get.project;
                var build = project.mCurBuild;
                project.on(Animate.ProjectEvents.FAILED, this._buildProxy, this);
                project.on(Animate.ProjectEvents.BUILD_SAVED, this._buildProxy, this);
                project.saveBuild(this._notes.val.text, this._visibility.val.selectedItem, build.html, build.css);
            }
            else if (target == this._selectBuild) {
                ////Check if the values are valid
                ////(<Label>this._name.val).textfield.element.removeClass( "red-border" );
                //this._warning.textfield.element.css( "color", "" );
                ////Check for special chars
                //var number = parseInt( (<Label>this._buildVerMaj.val).text );
                //if ( isNaN( number ) )
                //{
                //	( <Label>this._buildVerMaj.val).textfield.element.addClass( "red-border" );
                //	this._warning.textfield.element.css( "color", "#FF0000" );
                //	this._warning.text = "Please only use numbers";
                //	return;
                //}
                //number = parseInt( (<Label>this._buildVerMid.val).text );
                //if ( isNaN( number ) )
                //{
                //	( <Label>this._buildVerMid.val).textfield.element.addClass( "red-border" );
                //	this._warning.textfield.element.css( "color", "#FF0000" );
                //	this._warning.text = "Please only use numbers";
                //	return;
                //}
                //            number = parseInt((<Label>this._buildVerMin.val).text );
                //if ( isNaN( number ) )
                //{
                //	( <Label>this._buildVerMin.val).textfield.element.addClass( "red-border" );
                //	this._warning.textfield.element.css( "color", "#FF0000" );
                //	this._warning.text = "Please only use numbers";
                //	return;
                //}
                var user = Animate.User.get;
                var project = Animate.User.get.project;
                project.on(Animate.ProjectEvents.FAILED, this._buildProxy, this);
                project.on(Animate.ProjectEvents.BUILD_SELECTED, this._buildProxy, this);
                project.selectBuild(this._buildVerMaj.val.text, this._buildVerMid.val.text, this._buildVerMin.val.text);
            }
        };
        /**
        * Catch the key down events.
        * @param {any} e The jQuery event object
        */
        BuildOptionsForm.prototype.onKeyDown = function (e) {
            //Do nothing	
        };
        /**
        * When we recieve the server call for build requests
        * @param {ProjectEvents} event
        * @param {Event} data
        */
        BuildOptionsForm.prototype.onBuildResponse = function (response, event) {
            var user = Animate.User.get;
            var project = Animate.User.get.project;
            project.off(Animate.ProjectEvents.FAILED, this._buildProxy, this);
            project.off(Animate.ProjectEvents.BUILD_SAVED, this._buildProxy, this);
            project.off(Animate.ProjectEvents.BUILD_SELECTED, this._buildProxy, this);
            if (event.return_type == Animate.AnimateLoaderResponses.ERROR) {
                //(<Label>this._notes.val).textfield.element.removeClass( "red-border" );
                //this._warning.textfield.element.css( "color", "#FF0000" );
                //            this._warning.text = event.message;
                return;
            }
            if (response == Animate.ProjectEvents.BUILD_SELECTED) {
                //Check if the values are valid
                this._buildVerMaj.val.textfield.element.removeClass("red-border");
                this._buildVerMid.val.textfield.element.removeClass("red-border");
                this._buildVerMin.val.textfield.element.removeClass("red-border");
                this._notes.val.textfield.element.removeClass("red-border");
                //this._warning.textfield.element.css( "color", "#5DB526" );
                //            this._warning.text = event.message;
                //Update fields
                this.updateFields(event.tag);
            }
            else if (response == Animate.ProjectEvents.BUILD_SAVED) {
                ////Check if the values are valid
                //            (<Label>this._notes.val).textfield.element.removeClass( "red-border" );
                //this._warning.textfield.element.css( "color", "#5DB526" );
                //this._warning.text = "Build saved";
                //Update fields
                this.updateFields(event.tag);
            }
            else {
            }
        };
        /**
        * Updates some of the version fields with data
        * @param {Build} data
        */
        BuildOptionsForm.prototype.updateFields = function (data) {
            var versionParts = data.version.split(".");
            this._buildVerMaj.val.text = versionParts[0];
            this._buildVerMid.val.text = versionParts[1];
            this._buildVerMin.val.text = versionParts[2];
            this._notes.val.text = data.build_notes;
            this._visibility.val.selectedItem = (data.visibility == "Public" ? "Public" : "Private");
            this.initializeLoader();
        };
        /**
        * When we recieve the server call for saving project data.
        * @param {UserEvents} event
        * @param {UserEvent} data
        */
        BuildOptionsForm.prototype.onRenamed = function (response, event) {
            var user = Animate.User.get;
            var project = Animate.User.get.project;
            if (event.return_type == Animate.AnimateLoaderResponses.ERROR) {
            }
            //if (response == UserEvents.PROJECT_RENAMED )
            //{
            //Check if the values are valid
            //(<Label>this._name.val).textfield.element.removeClass( "red-border" );                
            //(<Label>this._tags.val).textfield.element.removeClass( "red-border" );
            //this._warning.textfield.element.css( "color", "#5DB526" );
            //this._warning.text = "Project updated.";
            //}
            //else
            //{
            //this._warning.textfield.element.css( "color", "#FF0000" );
            // this._warning.text = event.message;
            //}
            //user.removeEventListener( UserEvents.FAILED, this._renameProxy );
            //user.removeEventListener( UserEvents.PROJECT_RENAMED, this._renameProxy );
        };
        /**
        * Shows the build options form
        * @returns {any}
        */
        BuildOptionsForm.prototype.show = function () {
            Animate.OkCancelForm.prototype.show.call(this);
            this._tab.selectTab(this._tab.getTab("Project"));
            var user = Animate.User.get;
            var project = user.project;
            var e = project.entry;
            //Start the image uploader
            this.initializeLoader();
            this.$project = project;
            this.$projectToken = { name: e.name, description: e.description, tags: e.tags, category: e.category, public: e.public };
            Animate.Compiler.digest(this._projectElm, this, false);
            Animate.Compiler.digest(this._buildElm, this, false);
            Animate.Compiler.digest(this._userElm, this, false);
            //this._warning.textfield.element.css( "color", "" );
            //         this._warning.text = "";
            //         //Set project vars
            //         (<Label>this._name.val).text = project.entry.name;
            //         (<Label>this._description.val).text = project.entry.description;
            //         (<Label>this._tags.val).text = project.entry.tags.join(", ");
            //(<Label>this._name.val).textfield.element.removeClass( "red-border" );
            //(<Label>this._description.val).textfield.element.removeClass( "red-border" );
            //(<Label>this._tags.val).textfield.element.removeClass( "red-border" );
            ////Set current build vars
            //var versionParts = project.mCurBuild.version.split( "." );
            //( <Label>this._buildVerMaj.val ).text = versionParts[0];
            //( <Label>this._buildVerMid.val ).text = versionParts[1];
            //( <Label>this._buildVerMin.val ).text = versionParts[2];
            //         (<Label>this._notes.val).text = project.mCurBuild.build_notes;
            //         this._imgPreview.element.html((project.entry.image != "" ? "<img src='" + project.entry.image + "'/>" : ""));
            //         (<ComboBox>this._visibility.val).selectedItem = (project.mCurBuild.visibility == "Public" ? "Public" : "Private");
            //         (<ComboBox>this._projVisibility.val).selectedItem = (project.entry.public ? "Public" : "Private");
            //         (<ComboBox>this._category.val).selectedItem = project.entry.category;
            //         (<Label>this._buildVerMaj.val).textfield.element.removeClass( "red-border" );
            //(<Label>this._buildVerMid.val).textfield.element.removeClass( "red-border" );
            //(<Label>this._buildVerMin.val).textfield.element.removeClass( "red-border" );
            //(<Label>this._notes.val).textfield.element.removeClass( "red-border" );
            //         (<Label>this._name.val).textfield.element.focus();
            //         (<Label>this._name.val).textfield.element.select();
            //var i = this._settingPages.length;
            //while ( i-- )
            //	this._settingPages[i].onShow( project, user );
            this.update();
        };
        /**
        * This is called to initialize the one click loader
        */
        BuildOptionsForm.prototype.initializeLoader = function () {
            var that = this;
            that.$loadingPercent = "";
            that.$errorMsgImg = "";
            if (!this._uploader) {
                this._uploader = new qq.FileUploaderBasic({
                    button: document.getElementById("upload-projet-img"),
                    action: Animate.DB.HOST + "/file/upload-project-image",
                    onSubmit: function (file, ext) {
                        ext = ext.split(".");
                        ext = ext[ext.length - 1];
                        ext.toLowerCase();
                        if (ext != "png" && ext != "jpeg" && ext != "jpg") {
                            that.$errorMsgImg = 'Only png, jpg and jpeg files are allowed';
                            Animate.Compiler.digest(that._projectElm, that, false);
                            return false;
                        }
                    },
                    onComplete: function (id, fileName, response) {
                        that.$project.entry.image = "";
                        that.$loadingPercent = "";
                        Animate.Compiler.digest(that._projectElm, that, false);
                    },
                    onProgress: function (id, fileName, loaded, total) {
                        that.$loadingPercent = ((loaded / total) * 100) + "%";
                        Animate.Compiler.digest(that._projectElm, that, false);
                    },
                    onError: function (id, fileName, reason) {
                        that.$errorMsgImg = "An Error occurred uploading the file: " + reason;
                        Animate.Compiler.digest(that._projectElm, that, false);
                    },
                    demoMode: false
                });
                this._uploader._options.allowedExtensions.push("jpg", "png", "jpeg");
            }
            this._uploader.setParams({ projectId: Animate.User.get.project.entry._id });
        };
        /**
        * Use this function to print a message on the settings screen.
        * @param {string} message The message to print
        * @param <bool> isError Should this be styled to an error or not
        */
        //message( message, isError )
        //{
        //if ( isError )
        //	this._warning.textfield.element.css( "color", "#FF0000" );
        //else
        //	this._warning.textfield.element.css( "color", "#5DB526" );
        //this._warning.text = message;
        //}
        ///**
        //* Fired when the upload is complete
        //*/
        //onUploadComplete( id, fileName, response )
        //{
        //	if ( response.message )
        //	{
        //		//this._warning.text = response.message;
        //              //this._addButton.enabled = true;
        //		if ( AnimateLoaderResponses.fromString( response.return_type ) == AnimateLoaderResponses.SUCCESS )
        //		{
        //			//this._warning.textfield.element.css( "color", "#5DB526" );
        //                  var project = User.get.project;
        //                  project.entry.image = response.imageUrl;
        //			//this._imgPreview.element.html( ( response.imageUrl != "" ? "<img src='" + response.imageUrl + "'/>" : "" ) );
        //		}
        //		else
        //		{
        //			//this._warning.textfield.element.css( "color", "#FF0000" );
        //                 // this._warning.text = response.message;
        //			return;
        //		}
        //	}
        //	else
        //	{
        //		//this._warning.textfield.element.css( "color", "#FF0000" );
        //		//this._warning.text = 'Error Uploading File.';
        //		//this._addButton.enabled = true;
        //	}
        //}
        ///**
        //* Fired when the upload is cancelled due to an error
        //*/
        //onError( id, fileName, reason )
        //{
        //	//this._warning.textfield.element.css( "color", "#FF0000" );
        //	//this._warning.text = 'Error Uploading File.';
        //	//this._addButton.enabled = true;
        //}
        ///**
        //* When we receive a progress event
        //*/
        //onProgress( id, fileName, loaded, total )
        //{
        //	//this._warning.text = 'Uploading...' + ( ( loaded / total ) * 100 );
        //}
        ///**
        //* When we click submit on the upload button
        //*/
        //onSubmit( file, ext )
        //{
        //	var fExt = ext.split( "." );
        //	fExt = fExt[fExt.length - 1];
        //	fExt.toLowerCase();
        //	if ( fExt != "png" && fExt != "jpeg" && fExt != "jpg" )
        //	{
        //		// check for valid file extension
        //		//this._warning.textfield.element.css( "color", "#FF0000" );
        //		//this._warning.text = 'Only png, jpg and jpeg files are allowed';
        //		return false;
        //	}
        //	//this._warning.textfield.element.css( "color", "" );
        //	//this._warning.text =  'Uploading...';
        //	//this._addButton.enabled = false;
        //}
        /**
        * Gets the singleton instance.
        * @returns {BuildOptionsForm}
        */
        BuildOptionsForm.getSingleton = function () {
            if (!BuildOptionsForm._singleton)
                new BuildOptionsForm();
            return BuildOptionsForm._singleton;
        };
        return BuildOptionsForm;
    })(Animate.Window);
    Animate.BuildOptionsForm = BuildOptionsForm;
})(Animate || (Animate = {}));
var Animate;
(function (Animate) {
    var FileViewerFormEvents = (function (_super) {
        __extends(FileViewerFormEvents, _super);
        function FileViewerFormEvents(v) {
            _super.call(this, v);
        }
        FileViewerFormEvents.OBJECT_RENAMED = new FileViewerFormEvents("file_viewer_object_renamed");
        FileViewerFormEvents.OBJECT_RENAMING = new FileViewerFormEvents("file_viewer_object_renaming");
        FileViewerFormEvents.FILE_CHOSEN = new FileViewerFormEvents("file_viewer_file_chosen");
        FileViewerFormEvents.CANCELLED = new FileViewerFormEvents("file_viewer_cancelled");
        return FileViewerFormEvents;
    })(Animate.ENUM);
    Animate.FileViewerFormEvents = FileViewerFormEvents;
    var FileViewerFormEvent = (function (_super) {
        __extends(FileViewerFormEvent, _super);
        function FileViewerFormEvent(eventType, file) {
            _super.call(this, eventType, file);
            this.file = file;
        }
        return FileViewerFormEvent;
    })(Animate.Event);
    Animate.FileViewerFormEvent = FileViewerFormEvent;
    (function (FileSearchType) {
        FileSearchType[FileSearchType["Global"] = 0] = "Global";
        FileSearchType[FileSearchType["User"] = 1] = "User";
        FileSearchType[FileSearchType["Project"] = 2] = "Project";
    })(Animate.FileSearchType || (Animate.FileSearchType = {}));
    var FileSearchType = Animate.FileSearchType;
    /**
    * This form is used to load and select assets.
    */
    var FileViewerForm = (function (_super) {
        __extends(FileViewerForm, _super);
        function FileViewerForm() {
            FileViewerForm._singleton = this;
            // Call super-class constructor
            _super.call(this, 1000, 600, true, true, "Asset Browser");
            this.element.attr("id", "file-viewer-window");
            this._browserElm = jQuery("#file-viewer").remove().clone();
            this.content.element.append(this._browserElm);
            this.$newFolder = false;
            this.$selectedFile = null;
            this.$errorMsg = "";
            this.$confirmDelete = false;
            this.$pager = new Animate.PageLoader(this.updateContent.bind(this));
            this.selectedEntities = [];
            this.selectedEntity = null;
            this.selectedFolder = null;
            this.$search = "";
            this.$entries = [];
            this.extensions = [];
            this.multiSelect = true;
            this.$numLoading = 0;
            this.$loadingPercent = 0;
            // Build the element with the compiler
            Animate.Compiler.build(this._browserElm, this);
            var that = this;
            // Creates the filter options drop down
            var searchOptions = new Animate.ToolbarDropDown(null, [
                new Animate.ToolbarItem("media/assets-project.png", "Filter by Project Files"),
                new Animate.ToolbarItem("media/assets-user.png", "Filter by My Files"),
                new Animate.ToolbarItem("media/assets-global.png", "Filter by Global Files")
            ]);
            // Add the drop down to dom
            jQuery("#file-search-mode", this._browserElm).append(searchOptions.element);
            // Set the mode when they are clicked
            searchOptions.on("clicked", function (e, event, sender) {
                if (sender.selectedItem.text == "Filter by Project Files")
                    that.selectMode(FileSearchType.Project);
                else if (sender.selectedItem.text == "Filter by My Files")
                    that.selectMode(FileSearchType.User);
                else
                    that.selectMode(FileSearchType.Global);
            });
            // Make the form resizable
            this.element.resizable({
                minHeight: 50,
                minWidth: 50,
                helper: "ui-resizable-helper"
            });
            //         //this.toolbar = <Component>this.content.addChild("<div class='viewer-toolbar'></div>");
            //         this.toolbar = new Component(null);
            //         this.selectedID = null;
            ////Create buttons and groups
            //var group : Component = this.createGroup();
            //this.modeGrid = this.createGroupButton( "Grid", "media/asset-grid.png", group );
            //this.modeList = this.createGroupButton( "List", "media/asset-list.png", group );
            //this.modeList.element.addClass( "selected" );
            //group = this.createGroup();
            //this.favouriteGroup = group;
            //this.favourite = this.createGroupButton( "Favourite", "media/star.png", group );
            //this.favourite.enabled = false;
            //group = this.createGroup();
            //this.addRemoveGroup = group;
            //this.addButton = this.createGroupButton( "Add", "media/add-asset.png", group );
            //this.removeButton = this.createGroupButton( "Remove", "media/remove-asset.png", group );
            //this.content.element.append( "<div class='fix'></div>" );
            //group = this.createGroup();
            //this.catProject = this.createGroupButton( "Project", "media/assets-project.png", group );
            //this.catUser = this.createGroupButton( "My Assets", "media/assets-user.png", group );
            //this.catGlobal = this.createGroupButton( "Global Assets", "media/assets-global.png", group );
            //this.catProject.element.addClass( "selected" );
            //group = this.createGroup();
            //this.search = <Component>group.addChild( "<div class='asset-search'><input type='text'></input><img src='media/search.png' /></div>" );
            //group.element.css( { "float": "right", "margin": "0 15px 0 0" });
            ////Bottom panels
            //var btmLeft : Component = <Component>this.content.addChild( "<div class='viewer-block'></div>" );
            //var btmRight: Component = <Component>this.content.addChild( "<div class='viewer-block'></div>" );
            //var listBlock : Component = <Component>btmLeft.addChild( "<div class='list-block'></div>" );
            //this.menu = new ListView( listBlock );
            //this.menu.addColumn( "ID" );
            //this.menu.addColumn( "Name" );
            //this.menu.addColumn( "Tags" );
            //this.menu.addColumn( "Size" );
            //this.menu.addColumn( "URL" );
            //this.menu.addColumn( "Favourite" );
            //this.menu.addColumn( "Created On" );
            //this.menu.addColumn( "Last Modified" );
            //this.menu.addColumn( "Extension" );
            //this.listInfo = <Component>btmLeft.addChild( "<div class='selection-info'><span class='selected-asset'>Selected: </span><span class='assets'>All your base!</span></div>" );
            ////Preview section
            //this.previewHeader = new Component( "<div class='file-preview-header'><div class='header-name'>Preview</div></div>", btmRight );
            //this.okButton = new Button( "Use this File", this.previewHeader );
            //this.okButton.css( { "float": "right", width: "100px", height: "25px", margin: "0 0 5px 0" });
            //this.previewHeader.element.append( "<div class='fix'></div>" );
            //this.preview = new Component( "<div class='file-preview'></div>", btmRight );
            ////Create info section
            //var infoSection : Component = new Component( "<div class='info-section'></div>", btmRight );
            //this.statusBar = new Component( "<div class='upload-status'><img src='media/close.png' /><span class='upload-text'>Uploading</span></div>", infoSection );
            //this.statusBar.element.hide();
            ////Name
            //group = new Component( "<div class='file-group'><div>", infoSection );
            //var label: Label = new Label( "Name: ", group );
            //label.element.css( { "text-align": "left", "float": "left", "padding-left": "5px" });
            //this.name = new InputBox( group, "" );
            //group.element.append( "<div class='fix'></div>" );
            ////Tags
            //group = new Component( "<div class='file-group'><div>", infoSection );
            //label = new Label( "Tags: ", group );
            //label.element.css( { "text-align": "left", "float": "left", "padding-left": "5px" });
            //this.tags = new InputBox( group, "" );
            //group.element.append( "<div class='fix'></div>" );
            ////Global
            //group = new Component( "<div class='file-group'><div>", infoSection );
            //label = new Label( "Share: ", group );
            //label.element.css( { "text-align": "left", "float": "left", "padding-left": "5px" });
            //this.global = new Checkbox( group, "Share your file with all Animate users", false );
            //group.element.append( "<div class='fix'></div>" );
            ////Thumbnail
            //group = new Component( "<div class='file-group'><div>", infoSection );
            //label = new Label( "Thumbnail: ", group );
            //label.element.css( { "text-align": "left", "float": "left", "padding-left": "5px" });
            //this.thumbnail = new InputBox( group, "" );
            //group.element.append( "<div class='info'>Click here to upload a thumbnail image (100px, 100px)</div><div class='fix'></div>" );
            ////Size
            //group = new Component( "<div class='file-group'><div>", infoSection );
            //label = new Label( "Filesize: ", group );
            //label.element.css( { "text-align": "left", "float": "left", "padding-left": "5px" });
            //this.size = new InputBox( group, "" );
            //group.element.append( "<div class='fix'></div>" );
            //group.enabled = false;
            ////Path
            //group = new Component( "<div class='file-group'><div>", infoSection );
            //label = new Label( "Path: ", group );
            //label.element.css( { "text-align": "left", "float": "left", "padding-left": "5px" });
            //this.path = new InputBox( group, "" );
            //group.element.append( "<div class='fix'></div>" );
            //group.enabled = false;
            ////Create the update button
            //this.updateButton = new Button( "Update", infoSection );
            //this.updateButton.css( { width: "70px", height: "20px", "margin": "5px 3px 0 0", "float": "right" });
            //infoSection.element.append( "<div class='fix'></div>" );
            //this.thumbUploader = null;
            this.uploader = null;
            ////Event Listeners
            //this.buttonProxy = jQuery.proxy( this.onButtonClick, this );
            //this.submitProxy = jQuery.proxy( this.onSubmit, this );
            //this.thumbSubmitProxy = jQuery.proxy( this.onThumbSubmit, this );
            //this.progressProxy = jQuery.proxy( this.onProgress, this );
            //this.cancelProxy = jQuery.proxy( this.onCancel, this );
            //this.completeProxy = jQuery.proxy( this.onUploadComplete, this );
            //this.errorProxy = jQuery.proxy( this.onError, this );
            //this.keyDownProxy = jQuery.proxy( this.onInputKey, this );			
            //jQuery( "input", this.search.element ).on( "keydown", this.keyDownProxy );
            //jQuery( "img", this.search.element ).on( "click", this.buttonProxy );
            //this.modeGrid.element.on( "click", this.buttonProxy );
            //this.modeList.element.on( "click", this.buttonProxy );
            //this.favourite.element.on( "click", this.buttonProxy );
            //this.updateButton.element.on( "click", this.buttonProxy );
            //this.removeButton.element.on( "click", this.buttonProxy );
            //this.okButton.element.on( "click", this.buttonProxy );
            //this.catProject.element.on( "click", this.buttonProxy  );
            //this.catUser.element.on( "click", this.buttonProxy );
            //this.catGlobal.element.on( "click", this.buttonProxy );
            //this.extensions = [];
            //jQuery( "img", this.statusBar.element ).on( "click", jQuery.proxy( this.onStatusCloseClick, this ) );
            //this.menu.addEventListener( ListViewEvents.ITEM_CLICKED, this.onItemClicked, this );
            jQuery(".file-items", this.element).on('dragexit', this.onDragLeave.bind(this));
            jQuery(".file-items", this.element).on('dragleave', this.onDragLeave.bind(this));
            jQuery(".file-items", this.element).on('dragover', this.onDragOver.bind(this));
            jQuery(".file-items", this.element).on('drop', this.onDrop.bind(this));
        }
        FileViewerForm.prototype.selectMode = function (type) {
        };
        /**
        * Attempts to open a folder
        */
        FileViewerForm.prototype.openFolder = function (folder) {
            this.$pager.index = 0;
            this.selectedFolder = folder;
            this.$confirmDelete = false;
            this.$errorMsg = "";
            this.$pager.invalidate();
        };
        /**
        * Creates a new folder
        */
        FileViewerForm.prototype.newFolder = function () {
            var that = this;
            var details = Animate.User.get.userEntry;
            var folderName = $("#new-folder-name").val();
            var mediaURL = Animate.DB.USERS + "/media";
            // Empty names not allowed
            if (folderName.trim() == "") {
                that.$errorMsg = "Please specify a valid folder name";
                return Animate.Compiler.digest(that._browserElm, that);
            }
            that.$errorMsg = "";
            that.$loading = true;
            jQuery.post(mediaURL + "/create-bucket/" + details.username + "/" + folderName, null).then(function (token) {
                if (token.error)
                    that.$errorMsg = token.message;
                else {
                    $("#new-folder-name").val("");
                    that.$newFolder = false;
                    that.$pager.invalidate();
                }
                that.$loading = false;
                Animate.Compiler.digest(that._browserElm, that);
            });
        };
        /**
        * Shows / Hides the delete buttons
        */
        FileViewerForm.prototype.confirmDelete = function () {
            this.$confirmDelete = !this.$confirmDelete;
            if (this.$confirmDelete)
                this.$errorMsg = "Are you sure you want to delete these " + (this.selectedFolder ? "file" : "folder") + "s";
            else
                this.$errorMsg = "";
        };
        /**
        * Sets the selected status of a file or folder
        */
        FileViewerForm.prototype.selectEntity = function (entity) {
            this.$errorMsg = "";
            this.$confirmDelete = false;
            entity.selected = !entity.selected;
            var ents = this.selectedEntities;
            if (entity.selected) {
                if (this.multiSelect == false) {
                    for (var i = 0, l = ents.length; i < l; i++)
                        ents[i].selected = false;
                    ents.splice(0, ents.length);
                }
                ents.push(entity);
            }
            else
                ents.splice(ents.indexOf(entity), 1);
            if (ents.length == 0)
                this.selectedEntity = null;
            else
                this.selectedEntity = ents[ents.length - 1];
        };
        /**
        * Removes the selected entities
        */
        FileViewerForm.prototype.removeEntities = function () {
            var that = this;
            that.$errorMsg = "";
            that.$loading = true;
            var mediaURL = Animate.DB.USERS + "/media";
            var command = (this.selectedFolder ? "remove-files" : "remove-buckets");
            var entities = "";
            if (this.selectedFolder) {
                for (var i = 0, l = this.selectedEntities.length; i < l; i++)
                    entities += this.selectedEntities[i].identifier + ",";
            }
            else {
                for (var i = 0, l = this.selectedEntities.length; i < l; i++)
                    entities += this.selectedEntities[i].name + ",";
            }
            entities = (entities.length > 0 ? entities.substr(0, entities.length - 1) : "");
            jQuery.ajax(mediaURL + "/" + command + "/" + entities, { type: "delete" }).then(function (token) {
                if (token.error)
                    that.$errorMsg = token.message;
                that.$loading = false;
                that.$confirmDelete = false;
                that.$pager.invalidate();
            });
        };
        /*
        * Fetches a list of user buckets and files
        * @param {number} index
        * @param {number} limit
        */
        FileViewerForm.prototype.updateContent = function (index, limit) {
            var that = this;
            var details = Animate.User.get.userEntry;
            var command = "";
            var mediaURL = Animate.DB.USERS + "/media";
            that.$loading = true;
            that.$errorMsg = "";
            that.$selectedFile = null;
            this.selectedEntities.splice(0, this.selectedEntities.length);
            this.selectedEntity = null;
            Animate.Compiler.digest(that._browserElm, that);
            if (this.selectedFolder)
                command = mediaURL + "/get-files/" + details.username + "/" + this.selectedFolder.name + "/?index=" + index + "&limit=" + limit + "&search=" + that.$search;
            else
                command = mediaURL + "/get-buckets/" + details.username + "/?index=" + index + "&limit=" + limit + "&search=" + that.$search;
            jQuery.getJSON(command).then(function (token) {
                if (token.error) {
                    that.$errorMsg = token.message;
                    that.$entries = [];
                    that.$pager.last = 1;
                }
                else {
                    that.$entries = token.data;
                    that.$pager.last = token.count;
                }
                that.$loading = false;
                return Animate.Compiler.digest(that._browserElm, that);
            });
        };
        FileViewerForm.prototype.uploadFile = function (file, url) {
            var that = this;
            that.$numLoading++;
            var xhr = new XMLHttpRequest();
            xhr.onerror = function (ev) {
                that.$numLoading--;
                that.$loadingPercent = 0;
                that.$errorMsg = "An error occurred while uploading the file '" + file.name + "' : ";
                Animate.Compiler.digest(that._browserElm, that);
            };
            if (xhr.upload) {
                xhr.upload.onprogress = function (e) {
                    that.$loadingPercent = Math.floor(e.loaded / e.total * 1000) / 10;
                    Animate.Compiler.digest(that._browserElm, that);
                };
            }
            xhr.onreadystatechange = function () {
                // Every thing ok, file uploaded
                if (xhr.readyState == 4) {
                    if (xhr.status !== 200)
                        that.$errorMsg = "XHR returned response code : " + xhr.status;
                    else {
                        that.$numLoading--;
                        that.$loadingPercent = 100;
                        var data = JSON.parse(xhr.responseText);
                        if (data.error)
                            that.$errorMsg = data.message;
                    }
                    Animate.Compiler.digest(that._browserElm, that);
                }
            };
            var formData = new FormData();
            formData.append(file.name, file);
            xhr.withCredentials = true;
            xhr.open("post", url, true);
            xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
            xhr.setRequestHeader("X-File-Name", encodeURIComponent(file.name));
            xhr.setRequestHeader("Cache-Control", "no-cache");
            xhr.setRequestHeader("X-Mime-Type", file.type);
            xhr.send(formData);
        };
        /**
        * Called when we are dragging over the item
        */
        FileViewerForm.prototype.onDragOver = function (e) {
            if (this.visible) {
                var items = e.originalEvent.dataTransfer.items;
                if (items.length > 0) {
                    if (!jQuery(".file-items", this.element).hasClass("drag-here"))
                        jQuery(".file-items", this.element).addClass("drag-here");
                }
                else if (jQuery(".file-items", this.element).hasClass("drag-here"))
                    jQuery(".file-items", this.element).removeClass("drag-here");
            }
            e.preventDefault();
            e.stopPropagation();
        };
        /**
        * Called when we are no longer dragging items.
        */
        FileViewerForm.prototype.onDragLeave = function (e) {
            if (this.visible) {
                if (jQuery(".file-items", this.element).hasClass("drag-here"))
                    jQuery(".file-items", this.element).removeClass("drag-here");
            }
        };
        /**
        * Called when we are no longer dragging items.
        */
        FileViewerForm.prototype.onDrop = function (e) {
            if (this.visible) {
                if (jQuery(".file-items", this.element).hasClass("drag-here"))
                    jQuery(".file-items", this.element).removeClass("drag-here");
                e.preventDefault();
                e.stopPropagation();
                var files = e.originalEvent.dataTransfer.files;
                if (files.length > 0) {
                    if (this.selectedID) {
                        var extStr = this.extensions.join("|");
                        var extAccepted = false;
                        var i = files.length;
                        while (i--) {
                            var fExt = files[i].name.split(".");
                            fExt = fExt[fExt.length - 1];
                            fExt.toLowerCase();
                            extAccepted = false;
                            var ii = this.extensions.length;
                            while (ii--)
                                if (fExt == this.extensions[ii].toLowerCase()) {
                                    extAccepted = true;
                                    break;
                                }
                            //The file was not supported!
                            if (!extAccepted) {
                                this.statusBar.element.fadeIn();
                                //jQuery( ".upload-text", this.statusBar.element ).text( 'Only ' + extStr + ' files are allowed' );
                                return false;
                            }
                        }
                    }
                    // check for valid file extension
                    //jQuery( ".upload-text", this.statusBar.element ).text( "" );
                    for (var i = 0, l = e.originalEvent.dataTransfer.files.length; i < l; i++)
                        this.uploadFile(e.originalEvent.dataTransfer.files[i], Animate.DB.USERS + "/media/upload/" + this.selectedFolder.name);
                    return false;
                }
            }
        };
        /**
        * This function is used to create a new group on the file viewer toolbar
        * @returns {Component} Returns the Component object representing the group
        */
        //createGroup(): Component { return <Component>this.toolbar.addChild( "<div class='tool-bar-group'></div>" ); }
        /**
        * Use this function to create a group button for the toolbar
        * @param {string} text The text for the button
        * @param {string} image An image URL for the button icon
        * @param {Component} group The Component object representing the group
        * @returns {Component} Returns the Component object representing the button
        */
        //createGroupButton( text: string, image : string, group : Component )  : Component
        //{
        //     return <Component>group.addChild( "<div class='toolbar-button tooltip'><div><img src='" + image + "' /></div><div class='tooltip-text'>" + text + "</div></div>" );
        //}
        /**
        * Shows the window.
        */
        FileViewerForm.prototype.showForm = function (id, extensions) {
            _super.prototype.show.call(this, null, undefined, undefined, true);
            this.$errorMsg = "";
            this.$confirmDelete = false;
            this.$loading = false;
            this.$newFolder = false;
            var that = this, details = Animate.User.get.userEntry, extensions = this.extensions, apiUrl = "";
            // Call update and redraw the elements
            this.$pager.invalidate();
            document.getElementById('upload-new-file').addEventListener('change', function () {
                if (that.selectedFolder)
                    apiUrl = Animate.DB.USERS + "/media/upload/" + that.selectedFolder.name;
                else
                    return;
                for (var i = 0; i < this.files.length; i++) {
                    var file = this.files[i];
                    // This code is only for demo ...
                    console.group("File " + i);
                    console.log("name : " + file.name);
                    console.log("size : " + file.size);
                    console.log("type : " + file.type);
                    console.log("date : " + file.lastModified);
                    console.groupEnd();
                    that.uploadFile(file, apiUrl);
                }
                this.value = "";
            }, false);
            //// Initialize the file uploader
            //if (!this.uploader)
            //{
            //    this.uploader = new qq.FileUploaderBasic({
            //        button: document.getElementById("upload-new-file"),
            //        action: `${apiUrl}/`,
            //        onSubmit: function (file, ext)
            //        {
            //            // Approve all extensions unless otherwise stated
            //            if (extensions.length > 0)
            //            {
            //                var extFound = false;
            //                for (var i = 0, l = extensions.length; i < l; i++)
            //                    if ("." + extensions[i] == ext)
            //                    {
            //                        extFound = true;
            //                        break;
            //                    }
            //                if (!extFound)
            //                {
            //                    that.$errorMsg = `${ext} files are not allowed`;
            //                    Compiler.digest(that._browserElm, that);
            //                    return false;
            //                }
            //            }
            //            that.$loadingPercent = 0;
            //            that.$numLoading++;
            //            return true;
            //        },
            //        onComplete: function (id, fileName, response)
            //        {
            //            that.$loadingPercent = 100;
            //            that.$numLoading--;
            //            Compiler.digest(that._browserElm, that);
            //        },
            //        onCancel: function (id, fileName)
            //        {
            //            that.$errorMsg = "";
            //            Compiler.digest(that._browserElm, that);
            //        },
            //        onProgress: function (id, fileName, loaded, total)
            //        {
            //            that.$loadingPercent = (loaded / total) * 100;
            //            Compiler.digest(that._browserElm, that);
            //        },
            //        onError: function (id, fileName, reason)
            //        {
            //            that.$loadingPercent = 0;
            //            that.$numLoading--;
            //            that.$errorMsg = `An error occurred while uploading the file '${fileName}': ${reason}`;
            //            Compiler.digest(that._browserElm, that);
            //        }
            //    });
            //};           
            //this.selectedID = id;
            //this.extensions = extensions;
            //this.initializeLoader();
            //this.update();
            //this.onItemClicked( null, null );
            ////Only show the OK button if we have an ID of an object 
            //if ( id != null )
            //	this.okButton.element.show();
            //else
            //	this.okButton.element.hide();
            //this.catUser.element.removeClass( "selected" );
            //this.catGlobal.element.removeClass( "selected" );
            //this.catProject.element.removeClass( "selected" );
            //this.catProject.element.addClass( "selected" ); //Must be on to begin with
            //this.catProject.element.trigger( "click" );
            //Compiler.digest(this._browserElm, this);
        };
        /**
        * Called when the files have been loaded
        * @param {ProjectEvents} response
        * @param {Event} data
        */
        FileViewerForm.prototype.onFilesLoaded = function (response, data) {
            var project = Animate.User.get.project;
            project.off(Animate.ProjectEvents.FILES_CREATED, this.onFilesLoaded, this);
            this.populateFiles(project.files);
        };
        /**
        * Gets the viewer to search using the terms in the search inut
        * @returns {any}
        */
        FileViewerForm.prototype.searchItems = function () {
            var items = this.menu.items;
            var i = items.length;
            while (i--) {
                var ii = items[i].components.length;
                var searchTerm = jQuery("input", this.search.element).val();
                var baseString = (items[i].fields[1] + items[i].fields[2]);
                var result = baseString.search(new RegExp(searchTerm, "i"));
                while (ii--)
                    if (result != -1)
                        items[i].components[ii].element.show();
                    else
                        items[i].components[ii].element.hide();
            }
        };
        /**
        * When we hit a key on the search box
        * @param {any} e The jQuery event
        */
        FileViewerForm.prototype.onInputKey = function (e) {
            if (e.keyCode == 13)
                this.searchItems();
        };
        /**
        * Called when a file is imported
        * @param {ProjectEvents} e
        * @param {File} file
        */
        FileViewerForm.prototype.onFileImported = function (e, event) {
            //Not a project file - so we have to import it.
            var project = Animate.User.get.project;
            project.off(Animate.ProjectEvents.FILE_IMPORTED, this.onFileImported, this);
            var items = this.menu.getSelectedItems();
            var file = null;
            if (items.length > 0)
                file = items[0].tag;
            this.dispatchEvent(new FileViewerFormEvent(FileViewerFormEvents.FILE_CHOSEN, file));
            this.clearItems();
            this.hide();
        };
        /**
        * Called when we click one of the buttons. This will dispatch the event OkCancelForm.CONFIRM
        and pass the text either for the ok or cancel buttons.
        * @param {any} e The jQuery event object
        */
        FileViewerForm.prototype.onButtonClick = function (e) {
            e.preventDefault();
            var target = jQuery(e.target);
            //If Search
            if (target.is(jQuery("img", this.search.element))) {
                this.searchItems();
            }
            else if (target.is(this.okButton.element)) {
                var file = null;
                var items = this.menu.getSelectedItems();
                if (items.length > 0)
                    file = items[0].tag;
                //If its a project file - then select the file
                if (this.catProject.element.hasClass("selected")) {
                    this.dispatchEvent(new FileViewerFormEvent(FileViewerFormEvents.FILE_CHOSEN, file));
                    this.clearItems();
                    this.hide();
                }
                else {
                    //Not a project file - so we have to import it.
                    var project = Animate.User.get.project;
                    project.importFile([file.id]);
                    project.off(Animate.ProjectEvents.FILE_IMPORTED, this.onFileImported, this);
                    project.on(Animate.ProjectEvents.FILE_IMPORTED, this.onFileImported, this);
                }
            }
            else if (target.is(this.modeGrid.element)) {
                this.modeList.element.removeClass("selected");
                this.modeGrid.element.addClass("selected");
                this.menu.displayMode = Animate.ListViewType.IMAGES;
            }
            else if (target.is(this.modeList.element)) {
                this.modeGrid.element.removeClass("selected");
                this.modeList.element.addClass("selected");
                this.menu.displayMode = Animate.ListViewType.DETAILS;
            }
            else if (target.is(this.catUser.element) || target.is(this.catGlobal.element) || target.is(this.catProject.element)) {
                this.catUser.element.removeClass("selected");
                this.catGlobal.element.removeClass("selected");
                this.catProject.element.removeClass("selected");
                target.addClass("selected");
                if (target.is(this.catProject.element)) {
                    this.addRemoveGroup.enabled = true;
                    this.favouriteGroup.enabled = true;
                    //Re-download project files
                    this.update();
                    this.onItemClicked(null, null);
                    var project = Animate.User.get.project;
                    project.loadFiles("project");
                    project.off(Animate.ProjectEvents.FILES_CREATED, this.onFilesLoaded, this);
                    project.on(Animate.ProjectEvents.FILES_CREATED, this.onFilesLoaded, this);
                    this.okButton.text = "Use this File";
                }
                else {
                    this.addRemoveGroup.enabled = false;
                    this.favouriteGroup.enabled = false;
                    //Either download user or global files
                    this.onItemClicked(null, null);
                    var project = Animate.User.get.project;
                    project.off(Animate.ProjectEvents.FILES_LOADED, this.onFilesLoaded, this);
                    project.on(Animate.ProjectEvents.FILES_LOADED, this.onFilesLoaded, this);
                    if (target.is(this.catUser.element))
                        project.loadFiles("user");
                    else
                        project.loadFiles("global");
                    this.okButton.text = "Import";
                }
            }
            else if (target.is(this.removeButton.element)) {
                var project = Animate.User.get.project;
                var items = this.menu.getSelectedItems();
                //Remove
                if (items.length > 0) {
                    var file = items[0].tag;
                    this.statusBar.element.fadeIn();
                    jQuery(".upload-text", this.statusBar.element).text('Deleting file...');
                    if (file) {
                        project.on(Animate.ProjectEvents.FAILED, this.onFileDeleted, this);
                        project.on(Animate.ProjectEvents.FILE_DELETED, this.onFileDeleted, this);
                        project.deleteFiles([file.id]);
                    }
                }
            }
            else if (target.is(this.updateButton.element)) {
                var project = Animate.User.get.project;
                project.on(Animate.ProjectEvents.FAILED, this.onFileDeleted, this);
                var items = this.menu.getSelectedItems();
                if (items.length > 0) {
                    var file = items[0].tag;
                    this.statusBar.element.fadeIn();
                    jQuery(".upload-text", this.statusBar.element).text('Updating file...');
                    if (file) {
                        project.on(Animate.ProjectEvents.FAILED, this.onFileDeleted, this);
                        project.on(Animate.ProjectEvents.FILE_UPDATED, this.onFileUpdated, this);
                        project.saveFile(file.id, this.name.text, this.tags.text.split(","), file.favourite, this.global.checked);
                    }
                }
            }
            else if (target.is(this.favourite.element)) {
                var items = this.menu.getSelectedItems();
                if (items.length > 0) {
                    var file = items[0].tag;
                    if (file) {
                        if (file.favourite == false)
                            file.favourite = true;
                        else
                            file.favourite = false;
                        this.updateButton.element.trigger("click");
                    }
                }
            }
            else
                this.dispatchEvent(new FileViewerFormEvent(FileViewerFormEvents.CANCELLED, null));
        };
        /**
        * Clears up the contents to free the memory
        */
        FileViewerForm.prototype.clearItems = function () {
            var i = this.preview.children.length;
            while (i--)
                this.preview.children[i].dispose();
        };
        /**
        * When we click the close button on the status note
        */
        FileViewerForm.prototype.onItemClicked = function (responce, event) {
            this.clearItems();
            if (event == null || event.item == null) {
                this.name.text = "";
                this.tags.text = "";
                this.size.text = "";
                this.path.text = "";
                this.removeButton.enabled = false;
                this.menu.setSelectedItems(null);
                this.updateButton.enabled = false;
                this.favourite.enabled = false;
                this.global.checked = false;
                this.favourite.element.removeClass("selected");
                jQuery(".selected-asset", this.listInfo.element).text("None Selected. ");
                jQuery(".header-name", this.previewHeader.element).text("Preview: ");
                //Get the plugin to display a preview
                Animate.PluginManager.getSingleton().displayPreview(null, this.preview);
                return;
            }
            this.updateButton.enabled = true;
            this.removeButton.enabled = true;
            this.favourite.enabled = true;
            var file = event.item.tag;
            this.name.text = file.name;
            this.tags.text = file.tags.join(",");
            this.size.text = ((parseInt(file.size.toString()) / (1024 * 1024))).toFixed(3) + "M";
            this.path.text = file.path;
            if (file.global)
                this.global.checked = true;
            else
                this.global.checked = false;
            this.thumbnail.text = file.preview_path;
            if (!file.favourite)
                this.favourite.element.removeClass("selected");
            else
                this.favourite.element.addClass("selected");
            jQuery(".selected-asset", this.listInfo.element).text("Selected: " + file.name);
            jQuery(".header-name", this.previewHeader.element).text("Preview: " + file.name);
            //Get the plugin to display a preview
            if (Animate.PluginManager.getSingleton().displayPreview(file, this.preview))
                return true;
            //Dee if we can handle this
            if (this.handleDefaultPreviews(file, this.preview))
                return;
        };
        ///**
        //* @type public enum hide
        //* Hide this form
        //* @extends <FileViewerForm>
        //*/
        //hide()
        //{
        //	super.hide();
        //	var i = this.preview.children.length;
        //	while ( i-- )
        //		if ( this.preview.children[i].dispose )
        //			this.preview.children[i].dispose();
        //}
        /**
        * @type public mfunc handleDefaultPreviews
        * This will attempt to handle simple file previews
        * @param {any} file The file to preview
        * @param {any} previewComponent The preview box
        * @extends <FileViewerForm>
        * @returns <bool> True if this is handled
        */
        FileViewerForm.prototype.handleDefaultPreviews = function (file, previewComponent) {
            if (file == null)
                return false;
            var ext = jQuery.trim(file.extension.toLowerCase());
            if (ext == "jpg" || ext == "jpeg" || ext == "png" || ext == "gif") {
                var jQ = jQuery("<img style='margin: 0px auto 0px auto; display:block;' src='" + file.path + "' />");
                jQ.hide();
                previewComponent.element.append(jQ);
                jQ.fadeIn("slow");
                return true;
            }
        };
        /**
        * When we click the close button on the status note
        */
        FileViewerForm.prototype.onStatusCloseClick = function (id, fileName, response) {
            this.statusBar.element.fadeOut();
        };
        /**
        * Use this function to populate the files uploaded for use in this project.
        */
        FileViewerForm.prototype.populateFiles = function (files) {
            this.menu.clearItems();
            var counter = 0;
            var i = files.length;
            while (i--) {
                var file = files[i];
                if (this.extensions == null || this.extensions === undefined || jQuery.inArray(file.extension, this.extensions) != -1) {
                    //If its an image, we use the image as a preview
                    var ext = jQuery.trim(file.extension.toLowerCase());
                    var imgPath = "media/page.png";
                    if (file.preview_path)
                        imgPath = file.preview_path;
                    else if (ext == "jpg" || ext == "jpeg" || ext == "png" || ext == "gif")
                        imgPath = file.path;
                    var item = new Animate.ListViewItem([
                        file.id,
                        (file.favourite ? "<img src='media/star-small.png' style='width:20px; height:20px; position:relative; top:-5px; vertical-align:middle; left:0px;' />" + file.name : file.name),
                        file.tags.join(","),
                        ((parseInt(file.size.toString()) / (1024 * 1024))).toFixed(3) + "M",
                        file.path,
                        file.favourite,
                        new Date(file.createdOn).toDateString(),
                        new Date(file.lastModified).toDateString(),
                        file.extension
                    ], imgPath, imgPath);
                    item.tag = file;
                    this.menu.addItem(item);
                    counter++;
                }
            }
            this.menu.updateItems();
            jQuery(".assets", this.listInfo.element).text((counter) + " assets listed");
        };
        /**
        * Fired when the upload is complete
        */
        FileViewerForm.prototype.onUploadComplete = function (id, fileName, response) {
            if (Animate.LoaderEvents.fromString(response.return_type.toString()) == Animate.AnimateLoaderResponses.SUCCESS) {
                jQuery(".upload-text", this.statusBar.element).text(response.message);
                this.addButton.enabled = true;
                var project = Animate.User.get.project;
                project.off(Animate.ProjectEvents.FILES_LOADED, this.onFilesLoaded, this);
                project.on(Animate.ProjectEvents.FILES_LOADED, this.onFilesLoaded, this);
                if (this.catUser.selected)
                    project.loadFiles("user");
                else if (this.catProject.selected)
                    project.loadFiles("project");
                else
                    project.loadFiles("global");
            }
            else {
                jQuery(".upload-text", this.statusBar.element).text(response.message);
                this.addButton.enabled = true;
            }
        };
        /**
        * Fired when the upload is cancelled due to an error
        */
        FileViewerForm.prototype.onError = function (id, fileName, reason) {
            jQuery(".upload-text", this.statusBar.element).text('Error Uploading File.');
            this.addButton.enabled = true;
        };
        /**
        * When we receive a progress event
        */
        FileViewerForm.prototype.onCancel = function (id, fileName) {
            jQuery(".upload-text", this.statusBar.element).text('Cancelled');
            this.addButton.enabled = true;
        };
        /**
        * When we receive a progress event
        */
        FileViewerForm.prototype.onProgress = function (id, fileName, loaded, total) {
            jQuery(".upload-text", this.statusBar.element).text('Uploading...' + ((loaded / total) * 100));
        };
        /**
        * When we click submit on the upload button
        */
        FileViewerForm.prototype.onSubmit = function (file, ext) {
            this.statusBar.element.fadeIn("slow");
            var extStr = this.extensions.join("|");
            var fExt = ext.split(".");
            fExt = fExt[fExt.length - 1];
            fExt.toLowerCase();
            var extAccepted = false;
            if (this.selectedID) {
                var i = this.extensions.length;
                while (i--)
                    if (fExt.toLowerCase() == this.extensions[i].toLowerCase()) {
                        extAccepted = true;
                        break;
                    }
                if (extAccepted == false) {
                    // check for valid file extension
                    jQuery(".upload-text", this.statusBar.element).text('Only ' + extStr + ' files are allowed');
                    return false;
                }
            }
            jQuery(".upload-text", this.statusBar.element).text('Uploading...');
            this.addButton.enabled = false;
        };
        /**
        * When we click submit on the preview upload button
        */
        FileViewerForm.prototype.onThumbSubmit = function (file, ext) {
            this.statusBar.element.fadeIn("slow");
            var imageExtensions = ["png", "jpg", "jpeg", "gif"];
            var extStr = imageExtensions.join("|");
            var fExt = ext.split(".");
            fExt = fExt[fExt.length - 1];
            fExt.toLowerCase();
            var extAccepted = false;
            var selectedItems = this.menu.getSelectedItems();
            if (selectedItems == null || selectedItems.length == 0) {
                jQuery(".upload-text", this.statusBar.element).text("No file selected.");
                return false;
            }
            var i = this.extensions.length;
            while (i--)
                if (fExt.toLowerCase() == imageExtensions[i].toLowerCase()) {
                    extAccepted = true;
                    break;
                }
            if (extAccepted == false) {
                // check for valid file extension
                jQuery(".upload-text", this.statusBar.element).text('Only ' + extStr + ' files are allowed');
                return false;
            }
            var f = selectedItems[0].tag;
            //Update the thumbuploader
            this.thumbUploader.setParams({ projectId: Animate.User.get.project.entry._id, "fileId": f.id });
            jQuery(".upload-text", this.statusBar.element).text('Uploading...');
            this.addButton.enabled = false;
        };
        /**
        * This is called to initialize the one click loader
        */
        FileViewerForm.prototype.initializeLoader = function () {
            if (!this.uploader) {
                this.uploader = new qq.FileUploaderBasic({
                    button: document.getElementById(this.addButton.id),
                    action: Animate.DB.HOST + "/file/upload-file",
                    onSubmit: this.submitProxy,
                    onComplete: this.completeProxy,
                    onCancel: this.cancelProxy,
                    onProgress: this.progressProxy,
                    onError: this.errorProxy
                });
            }
            if (!this.thumbUploader) {
                this.thumbUploader = new qq.FileUploaderBasic({
                    button: document.getElementById(this.thumbnail.id),
                    action: Animate.DB.HOST + "/file/upload-thumb",
                    onSubmit: this.thumbSubmitProxy,
                    onComplete: this.completeProxy,
                    onCancel: this.cancelProxy,
                    onProgress: this.progressProxy,
                    onError: this.errorProxy
                });
                this.thumbUploader._options.allowedExtensions.push("jpg", "png", "jpeg");
            }
            //this.uploader.setParams( { projectID: User.get.project._id, "category": "files", "command": "upload" });
            //this.thumbUploader.setParams( { projectID: User.get.project._id, "category": "files", "command": "uploadThumb", "file": "" });
            var projId = Animate.User.get.project.entry._id;
            this.uploader.setParams({ projectId: projId, });
            this.uploader.setParams;
            this.thumbUploader.setParams({ projectId: projId, fileId: "" });
            //Set the allowed extensions
            this.uploader._options.allowedExtensions.splice(0, this.uploader._options.allowedExtensions.length);
            if (this.extensions) {
                for (var i = 0; i < this.extensions.length; i++)
                    this.uploader._options.allowedExtensions.push(this.extensions[i]);
            }
        };
        /**
        * This is called when a file has been successfully deleted.
        */
        FileViewerForm.prototype.onFileUpdated = function (response, event) {
            var data = event.tag;
            var items = this.menu.getSelectedItems();
            var project = Animate.User.get.project;
            project.off(Animate.ProjectEvents.FILE_UPDATED, this.onFileUpdated, this);
            project.off(Animate.ProjectEvents.FILE_DELETED, this.onFileDeleted, this);
            project.off(Animate.ProjectEvents.FAILED, this.onFileDeleted, this);
            if (items.length > 0) {
                if (this.modeGrid.element.hasClass("selected")) {
                    jQuery(".info", items[0].components[0].element).html((data.favourite ? "<img src='media/star-small.png' style='width:20px; height:20px; position:relative; top:-5px; vertical-align:middle; left:0px;' />" + data.name : data.name));
                }
                else {
                    items[0].components[1].element.html((data.favourite ? "<img src='media/star-small.png' style='width:20px; height:20px; position:relative; top:-5px; vertical-align:middle; left:0px;' />" + data.name : data.name));
                    items[0].components[2].element.text(data.tags);
                    items[0].components[3].element.text(data.lastModified);
                    items[0].components[5].element.text(data.favourite);
                }
                items[0].fields[1] = (data.favourite ? "<img src='media/star-small.png' style='width:20px; height:20px; position:relative; top:-5px; vertical-align:middle; left:0px;' />" + data.name : data.name);
                items[0].fields[2] = data.tags;
                items[0].fields[7] = data.lastModified;
                items[0].fields[5] = data.favourite;
                if (data.favourite == "false")
                    this.favourite.element.removeClass("selected");
                else
                    this.favourite.element.addClass("selected");
                jQuery(".upload-text", this.statusBar.element).text('File updated');
            }
        };
        /**
        * This is called when a file has been successfully deleted.
        */
        FileViewerForm.prototype.onFileDeleted = function (response, event) {
            var project = Animate.User.get.project;
            if (response == Animate.ProjectEvents.FILE_DELETED) {
                var items = this.menu.getSelectedItems();
                if (items.length > 0)
                    this.menu.removeItem(items[0]);
                jQuery(".upload-text", this.statusBar.element).text('File deleted.');
                this.onItemClicked(Animate.ListEvents.ITEM_SELECTED, null);
            }
            else {
                this.statusBar.element.show();
                jQuery(".upload-text", this.statusBar.element).text(event.message);
            }
            project.off(Animate.ProjectEvents.FAILED, this.onFileDeleted, this);
            project.off(Animate.ProjectEvents.FILE_DELETED, this.onFileDeleted, this);
        };
        /**
        * This function is used to cleanup the object before its removed from memory.
        */
        FileViewerForm.prototype.dispose = function () {
            jQuery("img", this.search.element).off("click", this.buttonProxy);
            this.modeGrid.element.off("click", this.buttonProxy);
            this.modeList.element.off("click", this.buttonProxy);
            this.favourite.element.off("click", this.buttonProxy);
            jQuery("img", this.statusBar.element).off();
            //this.refresh.element.off("unclick", this.buttonProxy);
            this.okButton.element.off("click", this.buttonProxy);
            jQuery("input", this.search.element).off("keydown", this.keyDownProxy);
            this.updateButton.element.off();
            this.addButton.element.off();
            this.removeButton.element.off();
            this.addButton = null;
            this.updateButton = null;
            this.removeButton = null;
            this.buttonProxy = null;
            this.okButton = null;
            this.keyDownProxy = null;
            //Call super
            _super.prototype.dispose.call(this);
        };
        /** Gets the singleton instance. */
        FileViewerForm.getSingleton = function () {
            if (!FileViewerForm._singleton)
                new FileViewerForm();
            return FileViewerForm._singleton;
        };
        return FileViewerForm;
    })(Animate.Window);
    Animate.FileViewerForm = FileViewerForm;
})(Animate || (Animate = {}));
var Animate;
(function (Animate) {
    /**
    * A window to show a blocking window with a message to the user.
    */
    var MessageBox = (function (_super) {
        __extends(MessageBox, _super);
        function MessageBox() {
            _super.call(this, 400, 200, true, false, null);
            this.$message = "";
            this.$buttons = [];
            this._handle = Animate.Compiler.build(jQuery("#en-message-box").remove(), this);
            this.content.element.append(this._handle);
            this.element.addClass("message-box");
            this.element.css({ "width": "", "height": "" });
            //Hook events
            jQuery(window).on('resize', this.onResize.bind(this));
        }
        /**
        * Hide the window when ok is clicked.
        * @param {any} e The jQuery event object
        */
        MessageBox.prototype.onButtonClick = function (e, button) {
            this.hide();
            if (this._callback)
                this._callback.call(this._context ? this._context : this, button);
        };
        /**
        * When the window resizes we make sure the component is centered
        * @param {any} e The jQuery event object
        */
        MessageBox.prototype.onResize = function (e) {
            if (this.visible)
                this.center();
        };
        /**
        * Static function to show the message box
        * @param {string} caption The caption of the window
        * @param {Array<string>} buttons An array of strings which act as the forms buttons
        * @param { ( text : string ) => void} callback A function to call when a button is clicked
        * @param {any} context The function context (ie the caller object)
        */
        MessageBox.show = function (caption, buttons, callback, context) {
            var box = MessageBox.getSingleton();
            //box.mCaption.text = caption;
            box._callback = callback;
            box._context = context;
            //If no buttons specified - then add one
            if (!buttons)
                buttons = ["Ok"];
            box.$message = caption;
            box.$buttons = buttons;
            Animate.Compiler.digest(box._handle, box);
            //Center and show the box
            box.show(Animate.Application.bodyComponent, NaN, NaN, true);
        };
        /**
        * Gets the message box singleton
        * @returns {MessageBox}
        */
        MessageBox.getSingleton = function () {
            if (!MessageBox._singleton)
                MessageBox._singleton = new MessageBox();
            return MessageBox._singleton;
        };
        return MessageBox;
    })(Animate.Window);
    Animate.MessageBox = MessageBox;
})(Animate || (Animate = {}));
var Animate;
(function (Animate) {
    /**
    * This form is used to create or edit Portals.
    */
    var NewBehaviourForm = (function (_super) {
        __extends(NewBehaviourForm, _super);
        function NewBehaviourForm() {
            if (NewBehaviourForm._singleton != null)
                throw new Error("The NewBehaviourForm class is a singleton. You need to call the NewBehaviourForm.getSingleton() function.");
            NewBehaviourForm._singleton = this;
            // Call super-class constructor
            _super.call(this, 400, 250, false, true, "Please enter a name");
            this.element.addClass("new-behaviour-form");
            this.name = new Animate.LabelVal(this.okCancelContent, "Name", new Animate.InputBox(null, ""));
            this.warning = new Animate.Label("Please enter a behaviour name.", this.okCancelContent);
            //Create the proxies
            this.createProxy = this.onCreated.bind(this);
        }
        /** Shows the window. */
        NewBehaviourForm.prototype.show = function () {
            this.name.val.text = "";
            this.warning.textfield.element.css("color", "");
            this.warning.text = "Please enter a behaviour name.";
            this.name.val.textfield.element.removeClass("red-border");
            _super.prototype.show.call(this);
            this.name.val.textfield.element.focus();
        };
        /** Called when we click one of the buttons. This will dispatch the event OkCancelForm.CONFIRM
        and pass the text either for the ok or cancel buttons. */
        NewBehaviourForm.prototype.OnButtonClick = function (e) {
            if (jQuery(e.target).text() == "Ok") {
                //Check if the values are valid
                this.name.val.textfield.element.removeClass("red-border");
                this.warning.textfield.element.css("color", "");
                //Check for special chars
                var message = Animate.Utils.checkForSpecialChars(this.name.val.text);
                if (message != null) {
                    this.name.val.textfield.element.addClass("red-border");
                    this.warning.textfield.element.css("color", "#FF0000");
                    this.warning.text = message;
                    return;
                }
                //Create the Behaviour in the DB
                Animate.User.get.project.on(Animate.ProjectEvents.FAILED, this.createProxy);
                Animate.User.get.project.on(Animate.ProjectEvents.BEHAVIOUR_CREATED, this.createProxy);
                Animate.User.get.project.createBehaviour(this.name.val.text);
                return;
            }
            _super.prototype.OnButtonClick.call(this, e);
        };
        /** Called when we create a behaviour.*/
        NewBehaviourForm.prototype.onCreated = function (response, event) {
            Animate.User.get.project.off(Animate.ProjectEvents.FAILED, this.createProxy);
            Animate.User.get.project.off(Animate.ProjectEvents.BEHAVIOUR_CREATED, this.createProxy);
            if (response == Animate.ProjectEvents.FAILED) {
                this.warning.textfield.element.css("color", "#FF0000");
                this.warning.text = event.message;
                return;
            }
            this.hide();
        };
        /** Gets the singleton instance. */
        NewBehaviourForm.getSingleton = function () {
            if (!NewBehaviourForm._singleton)
                new NewBehaviourForm();
            return NewBehaviourForm._singleton;
        };
        return NewBehaviourForm;
    })(Animate.OkCancelForm);
    Animate.NewBehaviourForm = NewBehaviourForm;
})(Animate || (Animate = {}));
var Animate;
(function (Animate) {
    /**
    * This form is used to create or edit Portals.
    */
    var PortalForm = (function (_super) {
        __extends(PortalForm, _super);
        function PortalForm() {
            if (PortalForm._singleton != null)
                throw new Error("The PortalForm class is a singleton. You need to call the PortalForm.getSingleton() function.");
            PortalForm._singleton = this;
            // Call super-class constructor
            _super.call(this, 400, 250, true, true, "Window");
            this.element.addClass("portal-form");
            this._typeCombo = new Animate.ComboBox();
            this._assetClassCombo = new Animate.ComboBox();
            this._name = new Animate.LabelVal(this.okCancelContent, "Name", new Animate.InputBox(null, ""));
            this._type = new Animate.LabelVal(this.okCancelContent, "Type", this._typeCombo);
            this._assetType = new Animate.LabelVal(this.okCancelContent, "Class", this._assetClassCombo);
            this._assetType.element.hide();
            this._portalType = null;
            this._item = null;
            this._value = null;
            this._warning = new Animate.Label("Please enter a behaviour name.", this.okCancelContent);
            this._typeCombo.on(Animate.ListEvents.ITEM_SELECTED, this.onTypeSelect.bind(this));
            this.onTypeSelect(Animate.ListEvents.ITEM_SELECTED, new Animate.ListEvent(Animate.ListEvents.ITEM_SELECTED, "asset"));
        }
        /** When the type combo is selected*/
        PortalForm.prototype.onTypeSelect = function (responce, event) {
            if (event.item == "asset") {
                this._assetClassCombo.clearItems();
                var classes = Animate.TreeViewScene.getSingleton().getAssetClasses();
                classes = classes.sort(function (a, b) {
                    var textA = a.name.toUpperCase();
                    var textB = b.name.toUpperCase();
                    return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
                });
                for (var i = 0; i < classes.length; i++)
                    this._assetClassCombo.addItem(classes[i].name);
                this._assetType.element.show();
                this._assetType.element.fadeIn("fast");
            }
            else {
                this._assetType.element.hide();
            }
        };
        PortalForm.prototype.showForm = function (item, type, caption) {
            var types = Animate.PluginManager.getSingleton().dataTypes;
            if (item instanceof Animate.Portal) {
                type = item.type;
                caption = "Edit " + item.name;
            }
            this._portalType = type;
            this._name.val.text = (item instanceof Animate.Portal ? item.name : "");
            this._item = item;
            this._warning.textfield.element.css("color", "");
            this._warning.text = "";
            //Fill types
            this._type.val.clearItems();
            for (var i = 0; i < types.length; i++)
                this._type.val.addItem(types[i]);
            this._name.val.textfield.element.removeClass("red-border");
            this._type.val.selectBox.element.removeClass("red-border");
            if (type == Animate.PortalType.OUTPUT || type == Animate.PortalType.INPUT) {
                this._type.element.hide();
                this._assetType.element.hide();
                this._value = true;
            }
            else {
                this._type.element.show();
                if (item instanceof Animate.Portal)
                    this._typeCombo.selectedItem = (item.dataType).toString();
                this.onTypeSelect(Animate.ListEvents.ITEM_SELECTED, new Animate.ListEvent(Animate.ListEvents.ITEM_SELECTED, this._type.val.selectedItem));
            }
            if (item instanceof Animate.Portal)
                this.headerText = caption;
            else if (item instanceof Animate.Behaviour)
                this.headerText = item.text;
            else if (item instanceof Animate.Canvas)
                this.headerText = caption;
            else
                this.headerText = item.toString();
            _super.prototype.show.call(this);
            this._name.val.textfield.element.focus();
        };
        /**Called when we click one of the buttons. This will dispatch the event OkCancelForm.CONFIRM
        and pass the text either for the ok or cancel buttons. */
        PortalForm.prototype.OnButtonClick = function (e) {
            if (jQuery(e.target).text() == "Ok") {
                //Check if the values are valid
                this._name.val.textfield.element.removeClass("red-border");
                this._type.val.selectBox.element.removeClass("red-border");
                var newName = jQuery.trim(this._name.val.text);
                //Check if the portal name already exists in the item if its a behaviour
                if (this._item instanceof Animate.Behaviour || this._item instanceof Animate.Portal) {
                    var behaviour = this._item;
                    if (this._item instanceof Animate.Portal)
                        behaviour = this._item.behaviour;
                    for (var i = 0; i < behaviour.portals.length; i++) {
                        if (behaviour.portals[i].name == newName && (this._item instanceof Animate.Portal && this._item.name != behaviour.portals[i].name)) {
                            this._name.val.textfield.element.addClass("red-border");
                            this._warning.textfield.element.css("color", "#FF0000");
                            this._warning.text = "A portal with the name " + this._name.val.text + " is already being used on this behaviour. Portal names must be unique.";
                            return;
                        }
                    }
                }
                else if (this._item instanceof Animate.Canvas) {
                    for (var i = 0; i < this._item.children.length; i++) {
                        if (this._item.children[i] instanceof Animate.BehaviourPortal) {
                            var portal = this._item.children[i];
                            if (portal.text == newName) {
                                this._name.val.textfield.element.addClass("red-border");
                                this._warning.textfield.element.css("color", "#FF0000");
                                this._warning.text = "A portal with the name " + this._name.val.text + " is already being used on the canvas. Portal names must be unique.";
                                return;
                            }
                        }
                    }
                }
                //Check for special chars
                var message = Animate.Utils.checkForSpecialChars(this._name.val.text);
                if (message != null) {
                    this._name.val.textfield.element.addClass("red-border");
                    this._warning.textfield.element.css("color", "#FF0000");
                    this._warning.text = message;
                    return;
                }
                //Check combo
                if ((this._portalType != Animate.PortalType.OUTPUT && this._portalType != Animate.PortalType.INPUT) && jQuery.trim(this._type.val.selectedItem) == "") {
                    this._type.val.element.addClass("red-border");
                    return;
                }
            }
            //Set the default value based on the type
            var type = jQuery.trim(this._type.val.selectedItem);
            if (type == "")
                this._value = "";
            else if (type == "number")
                this._value = 0;
            else if (type == "boolean")
                this._value = true;
            else if (type == "asset")
                this._value = ":" + jQuery.trim(this._assetType.val.selectedItem);
            else if (type == "object")
                this._value = "";
            else if (type == "color")
                this._value = "ffffff:1";
            else if (type == "object")
                this._value = "";
            _super.prototype.OnButtonClick.call(this, e);
        };
        Object.defineProperty(PortalForm.prototype, "name", {
            get: function () { return this._name.val.text; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PortalForm.prototype, "portalType", {
            get: function () { return this._portalType; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PortalForm.prototype, "value", {
            get: function () { return this._value; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PortalForm.prototype, "parameterType", {
            get: function () {
                if (this._typeCombo.selectedItem)
                    return Animate.ParameterType.fromString(this._typeCombo.selectedItem);
                else
                    return Animate.ParameterType.BOOL;
            },
            enumerable: true,
            configurable: true
        });
        /** Gets the singleton instance. */
        PortalForm.getSingleton = function () {
            if (!PortalForm._singleton)
                new PortalForm();
            return PortalForm._singleton;
        };
        return PortalForm;
    })(Animate.OkCancelForm);
    Animate.PortalForm = PortalForm;
})(Animate || (Animate = {}));
var Animate;
(function (Animate) {
    var RenameFormEvents = (function (_super) {
        __extends(RenameFormEvents, _super);
        function RenameFormEvents(v) {
            _super.call(this, v);
        }
        RenameFormEvents.OBJECT_RENAMED = new RenameFormEvents("rename_form_object_renamed");
        RenameFormEvents.OBJECT_RENAMING = new RenameFormEvents("rename_form_object_renaming");
        return RenameFormEvents;
    })(Animate.ENUM);
    Animate.RenameFormEvents = RenameFormEvents;
    var RenameFormEvent = (function (_super) {
        __extends(RenameFormEvent, _super);
        function RenameFormEvent(eventName, name, object) {
            _super.call(this, eventName, name);
            this.cancel = false;
            this.name = name;
            this.object = object;
        }
        return RenameFormEvent;
    })(Animate.Event);
    Animate.RenameFormEvent = RenameFormEvent;
    /**
    * This form is used to rename objects
    */
    var RenameForm = (function (_super) {
        __extends(RenameForm, _super);
        function RenameForm() {
            if (RenameForm._singleton != null)
                throw new Error("The RenameForm class is a singleton. You need to call the RenameForm.getSingleton() function.");
            RenameForm._singleton = this;
            // Call super-class constructor
            _super.call(this, 400, 250, false, true, "Please enter a name");
            this.element.addClass("rename-form");
            this.name = new Animate.LabelVal(this.okCancelContent, "Name", new Animate.InputBox(null, ""));
            //this.heading.text("Please enter a name");
            this.object = null;
            this.warning = new Animate.Label("Please enter a name and click Ok.", this.okCancelContent);
        }
        /**
        * @type public mfunc show
        * Shows the window.
        * @param {any} object
        * @param {string} curName
        * @extends {RenameForm}
        */
        RenameForm.prototype.showForm = function (object, curName) {
            this.object = object;
            this.name.val.text = curName;
            this.warning.textfield.element.css("color", "");
            this.warning.text = "Please enter a name and click Ok.";
            this.name.val.textfield.element.removeClass("red-border");
            _super.prototype.show.call(this);
            this.name.val.focus();
        };
        /**
        * @type public mfunc OnButtonClick
        * Called when we click one of the buttons. This will dispatch the event OkCancelForm.CONFIRM
        * and pass the text either for the ok or cancel buttons.
        * @param {any} e
        * @extends {RenameForm}
        */
        RenameForm.prototype.OnButtonClick = function (e) {
            if (jQuery(e.target).text() == "Ok") {
                //Check if the values are valid
                this.name.val.textfield.element.removeClass("red-border");
                this.warning.textfield.element.css("color", "");
                //Check for special chars
                var message = Animate.Utils.checkForSpecialChars(this.name.val.text);
                if (message != null) {
                    this.name.val.textfield.element.addClass("red-border");
                    this.warning.textfield.element.css("color", "#FF0000");
                    this.warning.text = message;
                    return;
                }
                var name = this.name.val.text;
                //Dispatch an event notifying listeners of the renamed object
                var event = new RenameFormEvent(RenameFormEvents.OBJECT_RENAMING, name, this.object);
                this.dispatchEvent(event);
                if (event.cancel)
                    return;
                if (this.object instanceof Animate.Behaviour) {
                    Animate.OkCancelForm.prototype.OnButtonClick.call(this, e);
                    this.object.onRenamed(name);
                    //Dispatch an event notifying listeners of the renamed object
                    this.dispatchEvent(new RenameFormEvent(RenameFormEvents.OBJECT_RENAMED, name, this.object));
                    this.object = null;
                    return;
                }
                var user = Animate.User.get;
                //Create the Behaviour in the DB
                if (user.project) {
                    user.project.on(Animate.ProjectEvents.FAILED, this.onRenamed, this);
                    user.project.on(Animate.ProjectEvents.OBJECT_RENAMED, this.onRenamed, this);
                    if (this.object instanceof Animate.TreeNodeGroup)
                        user.project.renameObject(name, this.object.groupID, Animate.ProjectAssetTypes.GROUP);
                    else if (this.object instanceof Animate.Asset)
                        user.project.renameObject(name, this.object.id, Animate.ProjectAssetTypes.ASSET);
                    else if (this.object instanceof Animate.BehaviourContainer)
                        user.project.renameObject(name, this.object.id, Animate.ProjectAssetTypes.BEHAVIOUR);
                }
                return;
            }
            _super.prototype.OnButtonClick.call(this, e);
        };
        /**
        * Called when we create a behaviour.
        * @param {any} response
        * @param {any} data
        */
        RenameForm.prototype.onRenamed = function (response, data) {
            var user = Animate.User.get;
            //user.removeEventListener( UserEvents.PROJECT_RENAMED, this.onRenamed, this );
            if (user.project) {
                user.project.off(Animate.ProjectEvents.FAILED, this.onRenamed, this);
                user.project.off(Animate.ProjectEvents.OBJECT_RENAMED, this.onRenamed, this);
            }
            if (response == Animate.ProjectEvents.FAILED) {
                this.warning.textfield.element.css("color", "#FF0000");
                this.warning.text = data.message;
                return;
            }
            //Dispatch an event notifying listeners of the renamed object
            var name = this.name.val.text;
            this.dispatchEvent(new RenameFormEvent(RenameFormEvents.OBJECT_RENAMED, name, this.object));
            this.object = null;
            this.hide();
        };
        /**
        * Gets the singleton instance.
        * @returns {RenameForm}
        */
        RenameForm.getSingleton = function () {
            if (!RenameForm._singleton)
                new RenameForm();
            return RenameForm._singleton;
        };
        return RenameForm;
    })(Animate.OkCancelForm);
    Animate.RenameForm = RenameForm;
})(Animate || (Animate = {}));
var Animate;
(function (Animate) {
    var UserPrivilegesForm = (function (_super) {
        __extends(UserPrivilegesForm, _super);
        function UserPrivilegesForm() {
            if (UserPrivilegesForm._singleton != null)
                throw new Error("The UserPrivilegesForm class is a singleton. You need to call the UserPrivilegesForm.get() function.");
            UserPrivilegesForm._singleton = this;
            // Call super-class constructor
            _super.call(this, 450, 600, true, true, "User Privileges");
            this.content.element.addClass("user-privileges-content");
            var top = this.content.addChild("<div class='top'></div>");
            var bottom = this.content.addChild("<div class='bottom'></div>");
            this.mSave = new Animate.Button("Save", bottom);
            this.mSave.element.width(80);
            this.mSave.element.height(30);
            this.mSave.element.css({ "margin": "0px 3px 3px 3px", "line-height": "30px" });
            this.search = bottom.addChild("<div class='asset-search'><input type='text'></input><img src='media/search.png' /></div>");
            this.mMenu = new Animate.ListView(top);
            this.mMenu.addColumn("Username");
            this.mMenu.addColumn("Access Rights");
            var width = this.element.width();
            this.mMenu.setColumnWidth(0, 185);
            this.mMenu.setColumnWidth(1, 255);
            this.mMenu.addItem(new Animate.ListViewItem(["Mat", "<select><option value='hidden'>Hidden</option><option value='read'>Read</option><option value='write'>Write</option><option value='admin'>Administrate</option></select>"]));
            this.mMenu.addItem(new Animate.ListViewItem(["Mat2", "<select><option value='hidden'>Hidden</option><option value='read'>Read</option><option value='write'>Write</option><option value='admin'>Administrate</option></select>"]));
            this.mMenu.addItem(new Animate.ListViewItem(["Anna", "<select><option value='hidden'>Hidden</option><option value='read'>Read</option><option value='write'>Write</option><option value='admin'>Administrate</option></select>"]));
            this.mMenu.addItem(new Animate.ListViewItem(["Steve", "<select><option value='hidden'>Hidden</option><option value='read'>Read</option><option value='write'>Write</option><option value='admin'>Administrate</option></select>"]));
            this.mMenu.addItem(new Animate.ListViewItem(["Ilka", "<select><option value='hidden'>Hidden</option><option value='read'>Read</option><option value='write'>Write</option><option value='admin'>Administrate</option></select>"]));
            //EVENTS AND LISTENERS	
            this.keyDownProxy = this.onInputKey.bind(this);
            this.buttonProxy = this.onButtonClick.bind(this);
            jQuery("input", this.search.element).on("keydown", this.keyDownProxy);
            jQuery("img", this.search.element).on("click", this.buttonProxy);
            this.mSave.element.on("click", this.buttonProxy);
        }
        /**
        * This function is called whenever we get a resonse from the server
        */
        UserPrivilegesForm.prototype.onServer = function (response, event, sender) {
            if (response == Animate.LoaderEvents.COMPLETE) {
                if (event.return_type == Animate.AnimateLoaderResponses.SUCCESS) {
                    var loader = sender;
                    if (loader.url == "/project/get-user-privileges") {
                        var data = event.tag;
                        for (var i = 0, l = data.length; i < l; i++) {
                            var item = new Animate.ListViewItem([
                                data[i].username,
                                "<select>" +
                                    "<option value='" + Animate.PrivilegeType.NONE + "' " + (data[i].privilege == Animate.PrivilegeType.NONE ? "selected='selected'" : "") + ">Hidden</option>" +
                                    "<option value='" + Animate.PrivilegeType.READ + "' " + (data[i].privilege == Animate.PrivilegeType.READ ? "selected='selected'" : "") + ">Read</option>" +
                                    "<option value='" + Animate.PrivilegeType.WRITE + "' " + (data[i].privilege == Animate.PrivilegeType.WRITE ? "selected='selected'" : "") + ">Write</option>" +
                                    "<option value='" + Animate.PrivilegeType.ADMIN + "' " + (data[i].privilege == Animate.PrivilegeType.ADMIN ? "selected='selected'" : "") + ">Administrate</option>" +
                                    "</select>"
                            ]);
                            item.tag = data[i].userId;
                            this.mMenu.addItem(item);
                        }
                    }
                }
                else if (event.message)
                    Animate.MessageBox.show(event.message, ["Ok"], null, null);
            }
        };
        /**
        * Gets the viewer to search using the terms in the search inut
        */
        UserPrivilegesForm.prototype.searchItems = function () {
            var items = this.mMenu.items;
            var i = items.length;
            while (i--) {
                var ii = items[i].components.length;
                var searchTerm = jQuery("input", this.search.element).val();
                var baseString = (items[i].fields[0] + items[i].fields[1]);
                var result = baseString.search(new RegExp(searchTerm, "i"));
                while (ii--)
                    if (result != -1)
                        items[i].components[ii].element.show();
                    else
                        items[i].components[ii].element.hide();
            }
        };
        /**
        * When we click a button on the form
        * @param {any} e The jQuery event object
        */
        UserPrivilegesForm.prototype.onButtonClick = function (e) {
            e.preventDefault();
            //If Search
            if (jQuery(e.target).is(jQuery("img", this.search.element))) {
                this.searchItems();
            }
            else {
                //Get all the updated users
                var project = Animate.User.get.project;
                var ids = [];
                var access = [];
                //Create a multidimension array and pass each of the user dependencies
                for (var i = 0; i < this.mMenu.items.length; i++) {
                    ids.push(this.mMenu.items[i].tag);
                    access.push(jQuery(this.mMenu.items[i].components[1].element.find("select")).val());
                }
                var loader = new Animate.AnimateLoader();
                loader.on(Animate.LoaderEvents.COMPLETE, this.onServer, this);
                loader.on(Animate.LoaderEvents.FAILED, this.onServer, this);
                loader.load("/project/set-users-access", { projectId: project.entry._id, ids: ids, access: access });
            }
        };
        /**
        * When we hit a key on the search box
        * @param {any} e The jQuery event
        */
        UserPrivilegesForm.prototype.onInputKey = function (e) {
            if (e.keyCode == 13)
                this.searchItems();
        };
        /**
        * Shows the window by adding it to a Application route.
        */
        UserPrivilegesForm.prototype.show = function () {
            _super.prototype.show.call(this, null, NaN, NaN, true);
            var project = Animate.User.get.project;
            this.mMenu.clearItems();
            var loader = new Animate.AnimateLoader();
            loader.on(Animate.LoaderEvents.COMPLETE, this.onServer, this);
            loader.on(Animate.LoaderEvents.FAILED, this.onServer, this);
            loader.load("/project/get-user-privileges", { projectId: project.entry._id, index: 0, limit: 20 });
        };
        /**
        * Gets the singleton reference of this class.
        * @returns {UserPrivilegesForm}
        */
        UserPrivilegesForm.getSingleton = function () {
            if (!UserPrivilegesForm._singleton)
                new UserPrivilegesForm();
            return UserPrivilegesForm._singleton;
        };
        return UserPrivilegesForm;
    })(Animate.Window);
    Animate.UserPrivilegesForm = UserPrivilegesForm;
})(Animate || (Animate = {}));
var Animate;
(function (Animate) {
    var CanvasTabType = (function (_super) {
        __extends(CanvasTabType, _super);
        function CanvasTabType(v) {
            _super.call(this, v);
        }
        CanvasTabType.CANVAS = new CanvasTabType("canvas");
        CanvasTabType.HTML = new CanvasTabType("html");
        CanvasTabType.CSS = new CanvasTabType("css");
        CanvasTabType.SCRIPT = new CanvasTabType("script");
        CanvasTabType.BLANK = new CanvasTabType("blank");
        return CanvasTabType;
    })(Animate.ENUM);
    Animate.CanvasTabType = CanvasTabType;
    /**
    * This is an implementation of the tab class that deals with the canvas
    */
    var CanvasTab = (function (_super) {
        __extends(CanvasTab, _super);
        function CanvasTab(parent) {
            _super.call(this, parent);
            if (CanvasTab._singleton != null)
                throw new Error("The CanvasTab class is a singleton. You need to call the CanvasTab.getSingleton() function.");
            CanvasTab._singleton = this;
            this.element.css({ width: "100%", height: "100%" });
            this._currentCanvas = null;
            this.welcomeTab = null;
            this.closingTabPair = null;
            this.mDocker = null;
            //Add the main tab
            Animate.BehaviourManager.getSingleton().on(Animate.BehaviourManagerEvents.CONTAINER_SAVED, this.removeTabConfirmed, this);
        }
        /**
        * This is called by a controlling ScreenManager class. An image string needs to be returned
        * which will act as a preview of the component that is being viewed or hidden.
        * @return {string}
        */
        CanvasTab.prototype.getPreviewImage = function () {
            return "media/canvas.png";
        };
        /**
        * Each IDock item needs to implement this so that we can keep track of where it moves.
        * @returns {Docker}
        */
        CanvasTab.prototype.getDocker = function () { return this.mDocker; };
        /**
        * Each IDock item needs to implement this so that we can keep track of where it moves.
        * @param {Docker} val
        */
        CanvasTab.prototype.setDocker = function (val) { this.mDocker = val; };
        /**
        * This is called by a controlling Docker class when the component needs to be shown.
        */
        CanvasTab.prototype.onShow = function () { };
        /**
        * Called when sall all is returned from the DB
        */
        CanvasTab.prototype.saveAll = function () {
            var i = this.tabs.length;
            while (i--)
                this.tabs[i].onSaveAll();
        };
        /**
        * This is called by a controlling Docker class when the component needs to be hidden.
        */
        CanvasTab.prototype.onHide = function () { };
        /**
        * Called just before a tab is closed. If you return false it will cancel the operation.
        * @param {TabPair} tabPair An object that contains both the page and label of the tab
        * @returns {boolean} Returns false if the tab needs to be saved. Otherwise true.
        */
        CanvasTab.prototype.onTabPairClosing = function (tabPair) {
            var canvas = tabPair.page.children[0];
            if (canvas instanceof Animate.Canvas) {
                var node = Animate.TreeViewScene.getSingleton().sceneNode.findNode("behaviour", canvas.behaviourContainer);
                //Set the context node to be this node
                Animate.TreeViewScene.getSingleton().contextNode = node;
                if (node && node.saved == false && !canvas.behaviourContainer.disposed) {
                    this.closingTabPair = tabPair;
                    Animate.MessageBox.show("Do you want to save this node before you close it?", ["Yes", "No"], this.onMessage, this);
                    return false;
                }
                else {
                    //We tell the plugins we've selected a behaviour container
                    //PluginManager.getSingleton().containerSelected( null );
                    Animate.PluginManager.getSingleton().dispatchEvent(new Animate.ContainerEvent(Animate.EditorEvents.CONTAINER_SELECTED, null));
                }
            }
            return true;
        };
        /**
        *  The response of the message box.
        * @param {string} choice The choice of the message box. It can be either Yes or No
        */
        CanvasTab.prototype.onMessage = function (choice) {
            var canvas = this.closingTabPair.canvas;
            //Save the canvas
            if (choice == "Yes") {
                //We need to build an array of the canvas objects we are trying to save.
                var saveDataObj = canvas.buildDataObject();
                //Now get the project to save it.
                Animate.User.get.project.on(Animate.ProjectEvents.BEHAVIOUR_SAVED, this.onBehaviourSaved, this);
                Animate.User.get.project.saveBehaviours([canvas.behaviourContainer.id]);
            }
            else {
                var node = Animate.TreeViewScene.getSingleton().sceneNode.findNode("behaviour", canvas.behaviourContainer);
                node.save(true);
                this.removeTab(this.closingTabPair, true);
                this.closingTabPair = null;
            }
        };
        /**
        * We use this function to remove any assets from the tabs
        * @param {Asset} asset The asset we are removing
        */
        CanvasTab.prototype.removeAsset = function (asset) {
            var i = this.tabs.length;
            while (i--)
                if (this.tabs[i].page.children.length > 0) {
                    var canvas = this.tabs[i].page.children[0];
                    if (canvas instanceof Animate.Canvas)
                        canvas.removeAsset(asset);
                }
        };
        /**
        * When the behaviour was saved on request of the message box - we close the tab that represents it.
        * @param <string> response
        * @param <object> behaviour
        */
        CanvasTab.prototype.onBehaviourSaved = function (response, event, sender) {
            Animate.User.get.project.off(Animate.ProjectEvents.BEHAVIOUR_SAVED, this.onBehaviourSaved, this);
            if (response == Animate.ProjectEvents.BEHAVIOUR_SAVED) {
                var canvas = this.closingTabPair.canvas;
                if (canvas.behaviourContainer == event.tag) {
                    var node = Animate.TreeViewScene.getSingleton().sceneNode.findNode("behaviour", canvas.behaviourContainer);
                    if (node)
                        node.save(true);
                    this.removeTab(this.closingTabPair, true);
                    this.closingTabPair = null;
                }
            }
        };
        /**
        * You can use this function to fetch a tab's canvas by a behaviour local ID
        * @param {number} behaviourID The local id of the container
        * @returns {Canvas} The returned tab's canvas or null
        */
        CanvasTab.prototype.getTabCanvas = function (behaviourID) {
            var tabs = this.tabs;
            for (var i = 0, l = tabs.length; i < l; i++)
                if (tabs[i].page.children.length > 0 && tabs[i].page.children[0] instanceof Animate.Canvas && tabs[i].page.children[0].behaviourContainer.id == behaviourID) {
                    var canvas = tabs[i].page.children[0];
                    return canvas;
                }
            return null;
        };
        /**
        * When we click the tab
        * @param {TabPair} tab The tab pair object which contains both the label and page components
        */
        CanvasTab.prototype.onTabSelected = function (tab) {
            var pManager = Animate.PluginManager.getSingleton();
            var project = Animate.User.get.project;
            //Remove prev we need to notify the plugins of added or removed assets
            if (this._currentCanvas && !this._currentCanvas.disposed) {
                var contEvent = new Animate.AssetContainerEvent(Animate.EditorEvents.ASSET_REMOVED_FROM_CONTAINER, null, this._currentCanvas.behaviourContainer);
                //Tell the plugins to remove the current assets
                var references = this._currentCanvas.containerReferences;
                for (var i = 0, l = references.assets.length; i < l; i++) {
                    var asset = project.getAssetByShallowId(references.assets[i]);
                    contEvent.asset = asset;
                    pManager.dispatchEvent(contEvent);
                }
            }
            if (tab.page.children[0] instanceof Animate.Canvas)
                this._currentCanvas = tab.page.children[0];
            else
                this._currentCanvas = null;
            if (this._currentCanvas != null && this._currentCanvas.element.data("component") instanceof Animate.Canvas) {
                var canvas = this._currentCanvas.element.data("component");
                canvas.onSelected();
                var node = Animate.TreeViewScene.getSingleton().sceneNode.findNode("behaviour", canvas.behaviourContainer);
                if (node)
                    Animate.TreeViewScene.getSingleton().selectNode(node);
                //Now we need to notify the plugins of added assets
                var contEvent = new Animate.AssetContainerEvent(Animate.EditorEvents.ASSET_ADDED_TO_CONTAINER, null, this._currentCanvas.behaviourContainer);
                //Tell the plugins to remove the current assets
                var references = canvas.containerReferences;
                for (var i = 0, l = references.assets.length; i < l; i++) {
                    var asset = project.getAssetByShallowId(references.assets[i]);
                    contEvent.asset = asset;
                    pManager.dispatchEvent(contEvent);
                }
                //We tell the plugins we've selected a behaviour container
                pManager.dispatchEvent(new Animate.ContainerEvent(Animate.EditorEvents.CONTAINER_SELECTED, canvas.behaviourContainer));
            }
            else
                //We tell the plugins we've selected a behaviour container
                pManager.dispatchEvent(new Animate.ContainerEvent(Animate.EditorEvents.CONTAINER_SELECTED, null));
            Animate.Tab.prototype.onTabSelected.call(this, tab);
        };
        /**
        * @type public mfunc projectReady
        * When we start a new project we load the welcome page.
        * @extends <CanvasTab>
        */
        CanvasTab.prototype.projectReady = function () {
            var loader = new Animate.AnimateLoader();
            loader.on(Animate.LoaderEvents.COMPLETE, this.onNewsLoaded, this);
            loader.on(Animate.LoaderEvents.FAILED, this.onNewsLoaded, this);
            loader.load("/misc/get-news-tab", {});
        };
        /**
        * @type public mfunc projectReset
        * Called when the project is reset by either creating a new one or opening an older one.
        * @extends <CanvasTab>
        */
        CanvasTab.prototype.projectReset = function () {
            this._currentCanvas = null;
            this.welcomeTab = null;
            this.clear();
        };
        /**
        * @type public mfunc onNewsLoaded
        * When the news has been loaded from webinate.
        */
        CanvasTab.prototype.onNewsLoaded = function (response, event, sender) {
            if (response == Animate.LoaderEvents.COMPLETE) {
                if (event.return_type == Animate.AnimateLoaderResponses.SUCCESS) {
                    if (this.welcomeTab)
                        this.removeTab(this.welcomeTab.name, true);
                    this.welcomeTab = this.addSpecialTab("Welcome to Animate!", CanvasTabType.BLANK);
                    var comp = new Animate.Component(event.tag.html, this.welcomeTab.page);
                    comp.element.css({ width: "100%", height: "100%" });
                    comp.addLayout(new Animate.Fill());
                }
            }
        };
        /**
        * Gets the singleton instance.
        * @param {Component} parent The parent component of this tab
        * @returns {CanvasTab}
        */
        CanvasTab.getSingleton = function (parent) {
            if (!CanvasTab._singleton)
                new CanvasTab(parent);
            return CanvasTab._singleton;
        };
        /**
        * Renames a tab and its container
        * @param {string} oldName The old name of the tab
        * @param {string} newName The new name of the tab
        * @returns {TabPair} Returns the tab pair
        */
        CanvasTab.prototype.renameTab = function (oldName, newName) {
            var toRet = this.getTab(oldName);
            toRet.tabSelector.element.text(newName);
            toRet.canvas.name = newName;
            return toRet;
        };
        CanvasTab.prototype.removeTab = function (val, dispose) {
            var canvas = null;
            if (val instanceof Animate.CanvasTabPair)
                canvas = val.canvas;
            //else
            //canvas = this.getTabCanvas( val );
            if (canvas) {
                var pManager = Animate.PluginManager.getSingleton();
                var contEvent = new Animate.AssetContainerEvent(Animate.EditorEvents.ASSET_REMOVED_FROM_CONTAINER, null, canvas.behaviourContainer);
                //Remove prev we need to notify the plugins of added or removed assets		
                var project = Animate.User.get.project;
                //Tell the plugins to remove the current assets
                var references = canvas.containerReferences;
                for (var i = 0, l = references.assets.length; i < l; i++) {
                    var asset = project.getAssetByShallowId(references.assets[i]);
                    contEvent.asset = asset;
                    pManager.dispatchEvent(contEvent);
                }
                canvas.behaviourContainer.canvas = null;
                canvas.off(Animate.CanvasEvents.MODIFIED, this.onCanvasModified, this);
            }
            return _super.prototype.removeTab.call(this, val, dispose);
        };
        /**
        * When a canvas is modified we change the tab name, canvas name and un-save its tree node.
        */
        CanvasTab.prototype.onCanvasModified = function (response, event, sender) {
            var node = Animate.TreeViewScene.getSingleton().sceneNode.findNode("behaviour", event.canvas.behaviourContainer);
            if (node)
                node.save(false);
        };
        /**
        * Removes an item from the tab
        */
        CanvasTab.prototype.removeTabConfirmed = function (response, event) {
            //Add the main tab
            if (event.tag.result == Animate.BehaviourManagerEvents.SUCCESS) {
                _super.prototype.removeTab.call(this, event.name, true);
            }
        };
        /**
        * Adds an item to the tab
        * @param {string} text The text of the new tab
        * @param {CanvasTabType} type The type of tab to create
        * @param {any} tabContent Data associated with the tab
        * @returns {TabPair} The tab pair object
        */
        CanvasTab.prototype.addSpecialTab = function (text, type, tabContent) {
            if (type === void 0) { type = CanvasTabType.CANVAS; }
            if (tabContent === void 0) { tabContent = null; }
            var pManager = Animate.PluginManager.getSingleton();
            var toRet = null;
            if (type == CanvasTabType.CANVAS) {
                toRet = _super.prototype.addTab.call(this, new Animate.CanvasTabPair(new Animate.Canvas(null, tabContent), text), true);
                var canvas = toRet.canvas;
                tabContent.canvas = canvas;
                toRet.page.addChild(canvas);
                canvas.on(Animate.CanvasEvents.MODIFIED, this.onCanvasModified, this);
                this._currentCanvas = canvas;
                canvas.children[0].updateDimensions();
                //PluginManager.getSingleton().containerCreated( tabContent );
                pManager.dispatchEvent(new Animate.ContainerEvent(Animate.EditorEvents.CONTAINER_CREATED, tabContent));
                //PluginManager.getSingleton().containerSelected( tabContent );
                Animate.PluginManager.getSingleton().dispatchEvent(new Animate.ContainerEvent(Animate.EditorEvents.CONTAINER_SELECTED, tabContent));
                return toRet;
            }
            else if (type == CanvasTabType.BLANK) {
                toRet = _super.prototype.addTab.call(this, text, true);
                return toRet;
            }
            else {
                if (type == CanvasTabType.HTML) {
                    if (!Animate.HTMLTab.singleton)
                        toRet = _super.prototype.addTab.call(this, new Animate.HTMLTab("HTML"), true);
                    else
                        toRet = this.selectTab(Animate.HTMLTab.singleton);
                }
                else if (type == CanvasTabType.CSS) {
                    if (!Animate.CSSTab.singleton)
                        toRet = _super.prototype.addTab.call(this, new Animate.CSSTab("CSS"), true);
                    else
                        toRet = this.selectTab(Animate.CSSTab.singleton);
                }
                else if (type == CanvasTabType.SCRIPT) {
                    toRet = Animate.Tab.prototype.addTab.call(this, new Animate.ScriptTab(tabContent));
                }
                return toRet;
            }
        };
        Object.defineProperty(CanvasTab.prototype, "currentCanvas", {
            get: function () { return this._currentCanvas; },
            enumerable: true,
            configurable: true
        });
        return CanvasTab;
    })(Animate.Tab);
    Animate.CanvasTab = CanvasTab;
})(Animate || (Animate = {}));
var Animate;
(function (Animate) {
    /**
    * This is the implementation of the context menu on the canvas.
    */
    var CanvasContext = (function (_super) {
        __extends(CanvasContext, _super);
        function CanvasContext(width) {
            // Call super-class constructor
            _super.call(this, width);
            //Add the items
            this.mDel = this.addItem(new Animate.ContextMenuItem("Delete", "media/cross.png"));
            this.mCreate = this.addItem(new Animate.ContextMenuItem("Create Behaviour", "media/behavior_20.png"));
            this.mCreateComment = this.addItem(new Animate.ContextMenuItem("Create Comment", "media/comment.png"));
            this.mCreateInput = this.addItem(new Animate.ContextMenuItem("Create Input", "media/portal.png"));
            this.mCreateOutput = this.addItem(new Animate.ContextMenuItem("Create Output", "media/portal.png"));
            this.mCreateParam = this.addItem(new Animate.ContextMenuItem("Create Parameter", "media/portal.png"));
            this.mCreateProduct = this.addItem(new Animate.ContextMenuItem("Create Product", "media/portal.png"));
            this.mEditPortal = this.addItem(new Animate.ContextMenuItem("Edit Portal", "media/portal.png"));
            this.mDelEmpty = this.addItem(new Animate.ContextMenuItem("Remove Empty Assets", "media/cross.png"));
        }
        /**
        * Shows the window by adding it to a parent.
        */
        CanvasContext.prototype.showContext = function (x, y, item) {
            this.mCreateInput.element.show();
            this.mCreateOutput.element.show();
            this.mCreateParam.element.show();
            this.mCreateProduct.element.show();
            this.mEditPortal.element.hide();
            this.mDelEmpty.element.hide();
            //If there is nothing selected
            if (item == null) {
                this.mDel.element.hide();
                this.mCreate.element.show();
                this.mCreateComment.element.show();
                this.mDelEmpty.element.show();
            }
            else if (item instanceof Animate.Portal) {
                this.mCreateInput.element.hide();
                this.mCreateOutput.element.hide();
                this.mCreateParam.element.hide();
                this.mCreateProduct.element.hide();
                this.mDel.element.hide();
                if (item.customPortal) {
                    this.mEditPortal.element.show();
                    this.mDel.element.show();
                    this.mCreate.element.hide();
                    this.mCreateComment.element.hide();
                }
                else
                    return;
            }
            else if (item instanceof Animate.Behaviour || item instanceof Animate.BehaviourPortal) {
                this.mDel.element.show();
                this.mCreate.element.hide();
                this.mCreateComment.element.hide();
                this.mCreateInput.element.hide();
                this.mCreateOutput.element.hide();
                this.mCreateParam.element.hide();
                this.mCreateProduct.element.hide();
                if (item instanceof Animate.BehaviourPortal == false) {
                    var template = Animate.PluginManager.getSingleton().getTemplate(item.originalName);
                    if (template) {
                        if (template.canBuildOutput(item))
                            this.mCreateOutput.element.show();
                        if (template.canBuildInput(item))
                            this.mCreateInput.element.show();
                        if (template.canBuildParameter(item))
                            this.mCreateParam.element.show();
                        if (template.canBuildProduct(item))
                            this.mCreateProduct.element.show();
                    }
                }
            }
            _super.prototype.show.call(this, null, x, y, false, true);
        };
        return CanvasContext;
    })(Animate.ContextMenu);
    Animate.CanvasContext = CanvasContext;
})(Animate || (Animate = {}));
var Animate;
(function (Animate) {
    /**
    * The main toolbar that sits at the top of the application
    */
    var Toolbar = (function (_super) {
        __extends(Toolbar, _super);
        function Toolbar(parent) {
            _super.call(this, "<div class='toolbar'></div>", parent);
            Toolbar._singleton = this;
            this._topMenu = this.addChild("<div class='tool-bar-top background-haze'></div>");
            this._bottomMenu = this.addChild("<div class='tool-bar-bottom'></div>");
            // Create main tab
            this._tabHomeContainer = this.createTab("Animate", true);
            this._mainElm = jQuery("#toolbar-main").remove().clone();
            this._tabHomeContainer.element.append(this._mainElm);
            Animate.Compiler.build(this._mainElm, this);
            // Set a few defaults
            this.$itemSelected = false;
            this._copyPasteToken = null;
            this._currentContainer = this._tabHomeContainer;
            this._currentTab = this._tabHomeContainer.element.data("tab").element.data("component");
            // Set events
            // This plugin does not yet work with 'on' so we have to still use bind
            jQuery(document).bind('keydown', 'Ctrl+s', this.onKeyDown.bind(this));
            jQuery(document).bind('keydown', 'Ctrl+c', this.onKeyDown.bind(this));
            jQuery(document).bind('keydown', 'Ctrl+x', this.onKeyDown.bind(this));
            jQuery(document).bind('keydown', 'Ctrl+v', this.onKeyDown.bind(this));
            this._topMenu.element.on("click", jQuery.proxy(this.onMajorTab, this));
        }
        /**
        * This is called when an item on the canvas has been selected
        * @param {Component} item
        */
        Toolbar.prototype.itemSelected = function (item) {
            if (item instanceof Animate.Behaviour || item instanceof Animate.Link)
                this.$itemSelected = true;
            else
                this.$itemSelected = false;
            Animate.Compiler.digest(this._mainElm, this);
        };
        /**
        * This is called when we have loaded and initialized a new project.
        */
        Toolbar.prototype.newProject = function () {
            this.$itemSelected = false;
            this._copyPasteToken = null;
            Animate.Compiler.digest(this._mainElm, this);
        };
        /**
        * Called when we click one of the top toolbar tabs.
        * @param {any} e
        */
        Toolbar.prototype.onMajorTab = function (e) {
            var container = jQuery(e.target).data("container");
            if (container != null && container != this._currentContainer) {
                this._currentContainer.element.slideUp("fast", function () {
                    jQuery(this).hide();
                    jQuery(this).css({ left: "0px", top: "0px" });
                    var parent = jQuery(this).parent();
                    jQuery(this).detach();
                    parent.append(jQuery(this));
                });
                this._currentContainer = container;
                this._currentContainer.element.show();
                this._currentContainer.element.css({ left: "0px", top: "0px" });
                this._currentTab.element.removeClass("toolbar-tab-selected");
                jQuery(e.target).addClass("toolbar-tab-selected");
                this._currentTab = jQuery(e.target).data("component");
            }
        };
        /**
        * Opens the splash window
        */
        Toolbar.prototype.onHome = function () {
            Animate.Splash.get.reset();
            Animate.Splash.get.show();
        };
        /**
        * Opens the user privileges window
        */
        Toolbar.prototype.onShowPrivileges = function () {
            Animate.Splash.get.reset();
            Animate.Splash.get.show();
        };
        /**
        * Notifys the app that its about to launch a test run
        */
        Toolbar.prototype.onRun = function () {
            Animate.PluginManager.getSingleton().dispatchEvent(new Animate.Event(Animate.EditorEvents.EDITOR_RUN, null));
            Animate.ImportExport.getSingleton().run();
        };
        /**
        * When we click the paste button
        */
        Toolbar.prototype.onPaste = function () {
            if (Animate.CanvasTab.getSingleton().currentCanvas instanceof Animate.Canvas == false)
                return;
            if (this._copyPasteToken) {
                var canvas = Animate.CanvasTab.getSingleton().currentCanvas;
                canvas.openFromDataObject(this._copyPasteToken, false, true);
                canvas.dispatchEvent(new Animate.CanvasEvent(Animate.CanvasEvents.MODIFIED, canvas));
            }
        };
        /**
        * When we click the copy button
        */
        Toolbar.prototype.onDuplicate = function (cut) {
            if (cut === void 0) { cut = false; }
            if (Animate.CanvasTab.getSingleton().currentCanvas instanceof Animate.Canvas == false)
                return;
            if (!Animate.Canvas.lastSelectedItem)
                return;
            var canvas = Animate.CanvasTab.getSingleton().currentCanvas;
            var toCopy = [];
            var i = canvas.children.length;
            while (i--)
                if (canvas.children[i].selected)
                    toCopy.push(canvas.children[i]);
            this._copyPasteToken = canvas.buildDataObject(toCopy);
            // If a cut operation then remove the selected item
            if (cut)
                Animate.Canvas.lastSelectedItem.dispose();
            canvas.dispatchEvent(Animate.CanvasEvents.MODIFIED, canvas);
        };
        /**
        * When we click the delete button
        */
        Toolbar.prototype.onDelete = function () {
            if (Animate.CanvasTab.getSingleton().currentCanvas instanceof Animate.Canvas == false)
                return;
            var canvas = Animate.CanvasTab.getSingleton().currentCanvas;
            var i = canvas.children.length;
            while (i--)
                if (canvas.children[i].disposed != null && canvas.children[i].selected)
                    canvas.children[i].onDelete();
            canvas.removeItems();
        };
        /**
        * This function is used to create a new group on the toolbar
        * @param {string} text The text of the new tab
        * @param {boolean} text The text of the new tab
        * @returns {Component} Returns the {Component} object representing the tab
        */
        Toolbar.prototype.createTab = function (text, isSelected) {
            if (isSelected === void 0) { isSelected = false; }
            var topTab = this._topMenu.addChild("<div class='toolbar-tab " + (isSelected ? "toolbar-tab-selected" : "") + "'>" + text + "</div>");
            var btmContainer = this._bottomMenu.addChild("<div class='tab-container'></div>");
            if (!isSelected)
                btmContainer.element.hide();
            topTab.element.data("container", btmContainer);
            btmContainer.element.data("tab", topTab);
            return btmContainer;
        };
        /**
        * Called when the key is pushed down
        * @param {any} event
        */
        Toolbar.prototype.onKeyDown = function (event) {
            if (event.data == 'Ctrl+s')
                Animate.User.get.project.saveAll();
            else if (event.data == 'Ctrl+c')
                this.onDuplicate(false);
            if (event.data == 'Ctrl+x')
                this.onDuplicate(true);
            if (event.data == 'Ctrl+v')
                this.onPaste();
            return false;
        };
        /**
        * Removes a tab by its name
        * @param {string} text The name of the tab
        */
        Toolbar.prototype.removeTab = function (text) {
            var children = this._topMenu.children;
            var i = children.length;
            while (i--)
                if (children[i].element.text() == text) {
                    children[i].element.data("container").dispose();
                    children[i].dispose();
                    return;
                }
        };
        /**
        * This function is used to create a new group on the toolbar
        * @param {Component} tab The {Component} tab object which represents the parent of this group.
        * @returns {Component} Returns the {Component} object representing the group
        */
        Toolbar.prototype.createGroup = function (tab) { return tab.addChild("<div class='tool-bar-group background-view-light'></div>"); };
        /**
        * Use this function to create a group button for the toolbar
        * @param {string} text The text for the button
        * @param {number} min The minimum limit
        * @param {number} max The maximum limit
        * @param {number} delta The incremental difference when scrolling
        * @param {Component} group The Component object representing the group
        * @returns {ToolbarNumber}
        */
        Toolbar.prototype.createGroupNumber = function (text, defaultVal, min, max, delta, group) {
            if (min === void 0) { min = Infinity; }
            if (max === void 0) { max = Infinity; }
            if (delta === void 0) { delta = 0.1; }
            if (group === void 0) { group = null; }
            var toRet = new Animate.ToolbarNumber(group, text, defaultVal, min, max, delta);
            group.addChild(toRet);
            return toRet;
        };
        /**
        * Use this function to create a group button for the toolbar
        * @param {string} text The text for the button
        * @param {string} image An image URL for the button icon
        * @param {Component} group The Component object representing the group
        * @param {boolean} isPushButton If true, the button will remain selected when clicked.
        * @returns {Component} Returns the Component object representing the button
        */
        Toolbar.prototype.createGroupButton = function (text, image, group, isPushButton) {
            if (image === void 0) { image = null; }
            if (group === void 0) { group = null; }
            if (isPushButton === void 0) { isPushButton = false; }
            var toRet = new Animate.ToolBarButton(text, image, isPushButton, group);
            group.addChild(toRet);
            return toRet;
        };
        /**
        * Use this function to create a group button for the toolbar
        * @param {Component} parent The parent that will contain the drop down
        * @param {Array<ToolbarItem>} items An array of items to list
        * @returns {ToolbarDropDown} Returns the Component object representing the button
        */
        Toolbar.prototype.createDropDownButton = function (parent, items) {
            var toRet = new Animate.ToolbarDropDown(parent, items);
            return toRet;
        };
        /**
        * Use this function to create a group button for the toolbar
        * @param {Component} parent The parent that will contain the drop down
        * @param {string} text The under the button
        * @param {string} color The hex colour as a string
        * @returns {ToolbarColorPicker} Returns the ToolbarColorPicker object representing the button
        */
        Toolbar.prototype.createColorButton = function (parent, text, color) {
            var toRet = new Animate.ToolbarColorPicker(parent, text, color);
            return toRet;
        };
        /**
        * Gets the singleton instance
        */
        Toolbar.getSingleton = function (parent) {
            if (Toolbar._singleton === undefined)
                Toolbar._singleton = new Toolbar(parent);
            return Toolbar._singleton;
        };
        return Toolbar;
    })(Animate.Component);
    Animate.Toolbar = Toolbar;
})(Animate || (Animate = {}));
var Animate;
(function (Animate) {
    /**
    * An implementation of the tree view for the scene.
    */
    var TreeViewScene = (function (_super) {
        __extends(TreeViewScene, _super);
        function TreeViewScene(parent) {
            _super.call(this, parent);
            if (TreeViewScene._singleton != null)
                throw new Error("The TreeViewScene class is a singleton. You need to call the TreeViewScene.getSingleton() function.");
            TreeViewScene._singleton = this;
            this.element.addClass("treeview-scene");
            this._sceneNode = this.addNode(new Animate.TreeNode("Scene", "media/world_16.png"));
            this._assetsNode = this.addNode(new Animate.TreeNode("Assets", "media/wrench.png"));
            this._groupsNode = this.addNode(new Animate.TreeNode("Groups", "media/array.png"));
            this._pluginBehaviours = this.addNode(new Animate.TreeNode("Behaviours", "media/behavior_20.png"));
            this._sceneNode.canUpdate = true;
            this._groupsNode.canUpdate = true;
            //Create the context menu
            this._contextMenu = new Animate.ContextMenu(100);
            this._contextCopy = this._contextMenu.addItem(new Animate.ContextMenuItem("Copy", "media/copy-small.png"));
            this._contextDel = this._contextMenu.addItem(new Animate.ContextMenuItem("Delete", "media/cross.png"));
            this._contextAddInstance = this._contextMenu.addItem(new Animate.ContextMenuItem("Add Instance", "media/portal.png"));
            this._contextSave = this._contextMenu.addItem(new Animate.ContextMenuItem("Save", "media/save-20.png"));
            this._contextRefresh = this._contextMenu.addItem(new Animate.ContextMenuItem("Update", "media/refresh.png"));
            this._contextAddGroup = this._contextMenu.addItem(new Animate.ContextMenuItem("Add Group", 'media/array.png'));
            this._contextMenu.on(Animate.ContextMenuEvents.ITEM_CLICKED, this.onContextSelect, this);
            jQuery(document).on("contextmenu", this.onContext.bind(this));
            jQuery(".selectable .text", this._sceneNode.element).addClass("top-node");
            jQuery(".selectable .text", this._assetsNode.element).addClass("top-node");
            jQuery(".selectable .text", this._groupsNode.element).addClass("top-node");
            jQuery(".selectable .text", this._pluginBehaviours.element).addClass("top-node");
            this._quickAdd = new Animate.Component("<div class='quick-button'><img src='media/portal.png'/></div>", this);
            this._quickCopy = new Animate.Component("<div class='quick-button'><img src='media/copy-small.png'/></div>", this);
            this._quickAdd.tooltip = "Add new instance";
            this._quickCopy.tooltip = "Copy instance";
            this._contextNode = null;
            this._shortcutProxy = this.onShortcutClick.bind(this);
            this._curProj = null;
            jQuery("body").on("keydown", this.onKeyDown.bind(this));
            this.element.on("dblclick", this.onDblClick.bind(this));
            this.element.on("mousemove", this.onMouseMove.bind(this));
            this._quickAdd.element.detach();
            this._quickCopy.element.detach();
            Animate.RenameForm.getSingleton().on(Animate.RenameFormEvents.OBJECT_RENAMING, this.onRenameCheck, this);
        }
        TreeViewScene.prototype.onShortcutClick = function (e) {
            var comp = jQuery(e.currentTarget).data("component");
            var node = comp.element.parent().parent().parent().data("component");
            this.selectedNode = node;
            this._contextNode = node;
            if (comp == this._quickAdd)
                this.onContextSelect(Animate.ContextMenuEvents.ITEM_CLICKED, new Animate.ContextMenuEvent(this._contextAddInstance, Animate.ContextMenuEvents.ITEM_CLICKED));
            else
                this.onContextSelect(Animate.ContextMenuEvents.ITEM_CLICKED, new Animate.ContextMenuEvent(this._contextCopy, Animate.ContextMenuEvents.ITEM_CLICKED));
        };
        TreeViewScene.prototype.onMouseMove = function (e) {
            if (jQuery(e.target).hasClass("quick-button"))
                return;
            var node = jQuery(e.target).parent().data("component");
            this._quickAdd.element.off("click", this._shortcutProxy);
            this._quickCopy.element.off("click", this._shortcutProxy);
            this._quickAdd.element.detach();
            this._quickCopy.element.detach();
            if (node && node instanceof Animate.TreeNode) {
                if (node instanceof Animate.TreeNodeAssetInstance) {
                    jQuery(".text:first", node.element).append(this._quickCopy.element);
                    this._quickCopy.element.on("click", this._shortcutProxy);
                }
                else if (node instanceof Animate.TreeNodeAssetClass && !node.assetClass.abstractClass) {
                    jQuery(".text:first", node.element).append(this._quickAdd.element);
                    this._quickAdd.element.on("click", this._shortcutProxy);
                }
            }
        };
        /**
        * Called when the project is loaded and ready.
        */
        TreeViewScene.prototype.projectReady = function () {
            //Add all the asset nodes 
            var assetTemplates = Animate.PluginManager.getSingleton().assetTemplates;
            var assetClass;
            var len = assetTemplates.length;
            for (var i = 0; i < len; i++)
                for (var ii = 0; ii < assetTemplates[i].classes.length; ii++) {
                    assetClass = assetTemplates[i].classes[ii];
                    var toRet = new Animate.TreeNodeAssetClass(assetClass, this);
                    this._assetsNode.addNode(toRet);
                }
            this._curProj = Animate.User.get.project;
            this._curProj.on(Animate.ProjectEvents.BEHAVIOUR_SAVED, this.onBehaviourResponse, this);
            this._curProj.on(Animate.ProjectEvents.ASSET_SAVED, this.onAssetResponse, this);
            this._curProj.on(Animate.ProjectEvents.ASSET_UPDATED, this.onAssetResponse, this);
            this._curProj.on(Animate.ProjectEvents.BEHAVIOUR_DELETING, this.onProjectResponse, this);
            this._curProj.on(Animate.ProjectEvents.ASSET_DELETING, this.onAssetResponse, this);
            this._curProj.on(Animate.ProjectEvents.GROUP_CREATED, this.onGroupResponse, this);
            this._curProj.on(Animate.ProjectEvents.GROUP_UPDATED, this.onGroupResponse, this);
            this._curProj.on(Animate.ProjectEvents.GROUP_SAVED, this.onGroupResponse, this);
            this._curProj.on(Animate.ProjectEvents.GROUP_DELETING, this.onGroupResponse, this);
            this._curProj.on(Animate.ProjectEvents.OBJECT_RENAMED, this.onObjectRenamed, this);
        };
        /**
        * Called when the project is reset by either creating a new one or opening an older one.
        */
        TreeViewScene.prototype.projectReset = function () {
            if (this._curProj) {
                this._curProj.off(Animate.ProjectEvents.BEHAVIOUR_SAVED, this.onBehaviourResponse, this);
                this._curProj.off(Animate.ProjectEvents.ASSET_SAVED, this.onAssetResponse, this);
                this._curProj.off(Animate.ProjectEvents.ASSET_UPDATED, this.onAssetResponse, this);
                this._curProj.off(Animate.ProjectEvents.BEHAVIOUR_DELETING, this.onProjectResponse, this);
                this._curProj.off(Animate.ProjectEvents.ASSET_DELETING, this.onAssetResponse, this);
                this._curProj.off(Animate.ProjectEvents.GROUP_CREATED, this.onGroupResponse, this);
                this._curProj.off(Animate.ProjectEvents.GROUP_UPDATED, this.onGroupResponse, this);
                this._curProj.off(Animate.ProjectEvents.GROUP_SAVED, this.onGroupResponse, this);
                this._curProj.off(Animate.ProjectEvents.GROUP_DELETING, this.onGroupResponse, this);
                this._curProj.off(Animate.ProjectEvents.OBJECT_RENAMED, this.onObjectRenamed, this);
            }
            this.children[0].clear();
            this.children[1].clear();
            this._groupsNode.clear();
        };
        /**
        * Catch the key down events.
        * @param e The event passed by jQuery
        */
        TreeViewScene.prototype.onKeyDown = function (e) {
            if (Animate.Application.getInstance().focusObj != null && Animate.Application.getInstance().focusObj instanceof Animate.TreeNode) {
                //If f2 pressed
                if (jQuery(e.target).is("input") == false && e.keyCode == 113) {
                    //Unselect all other items
                    if (this.selectedNode != null)
                        if (this.selectedNode instanceof Animate.TreeNodeGroup)
                            Animate.RenameForm.getSingleton().showForm(this.selectedNode, this.selectedNode.text);
                        else if (this.selectedNode instanceof Animate.TreeNodeBehaviour)
                            Animate.RenameForm.getSingleton().showForm(this.selectedNode.behaviour, this.selectedNode.text);
                        else if (this.selectedNode instanceof Animate.TreeNodeAssetInstance)
                            Animate.RenameForm.getSingleton().showForm(this.selectedNode.asset, this.selectedNode.text);
                }
            }
        };
        /**
        * Creates an asset node for the tree
        * @param {Asset} asset The asset to associate with the node
        */
        TreeViewScene.prototype.addAssetInstance = function (asset, collapse) {
            if (collapse === void 0) { collapse = true; }
            //Add all the asset nodes 
            var classNode = this.findNode("className", asset.className);
            if (classNode != null) {
                var instanceNode = new Animate.TreeNodeAssetInstance(classNode.assetClass, asset);
                classNode.addNode(instanceNode, collapse);
                instanceNode.element.draggable({ opacity: 0.7, helper: "clone", appendTo: "body", containment: "body" });
                return true;
            }
            return false;
        };
        /**
        * Update the asset node so that its saved.
        * @param {Asset} asset The asset to associate with the node
        */
        TreeViewScene.prototype.updateAssetInstance = function (asset) {
            var node = this.findNode("asset", asset);
            if (node != null)
                node.save();
        };
        /**
        * Update the behaviour node so that its saved and if any tabs are open they need to re-loaded.
        * @param {BehaviourContainer} behaviour The hehaviour object we need to update
        */
        TreeViewScene.prototype.updateBehaviour = function (behaviour) {
            var node = this.findNode("behaviour", behaviour);
            node.behaviour = behaviour;
            if (node != null) {
                //First we try and get the tab
                var tabPair = Animate.CanvasTab.getSingleton().getTab(behaviour.name);
                //Tab was not found - check if its because its unsaved
                if (tabPair == null)
                    tabPair = Animate.CanvasTab.getSingleton().getTab("*" + behaviour.name);
                //If we have a tab then rename it to the same as the node
                if (tabPair) {
                    tabPair.tabSelector.element.trigger("click");
                    var canvas = tabPair.canvas;
                    canvas.behaviourContainer = behaviour;
                    Animate.CanvasTab.getSingleton().selectTab(tabPair);
                    canvas.openFromDataObject();
                    canvas.checkDimensions();
                }
                node.save(true);
            }
        };
        /**
        * Called when we select a menu item.
        */
        TreeViewScene.prototype.onContextSelect = function (response, event, sender) {
            //DELETE
            if (this._contextNode && event.item.text == "Delete") {
                this._quickAdd.element.off("click", this._shortcutProxy);
                this._quickCopy.element.off("click", this._shortcutProxy);
                this._quickAdd.element.detach();
                this._quickCopy.element.detach();
                if (this._contextNode instanceof Animate.TreeNodeBehaviour) {
                    var selectedNodes = [];
                    var i = this.selectedNodes.length;
                    while (i--)
                        selectedNodes.push(this.selectedNodes[i]);
                    var behaviours = [];
                    i = selectedNodes.length;
                    while (i--)
                        behaviours.push(selectedNodes[i].behaviour.id);
                    Animate.User.get.project.deleteBehaviours(behaviours);
                }
                else if (this._contextNode instanceof Animate.TreeNodeAssetInstance) {
                    var selectedNodes = [];
                    var i = this.selectedNodes.length;
                    while (i--)
                        selectedNodes.push(this.selectedNodes[i]);
                    var assets = [];
                    i = selectedNodes.length;
                    while (i--)
                        assets.push(selectedNodes[i].asset.id);
                    Animate.User.get.project.deleteAssets(assets);
                }
                else if (this._contextNode instanceof Animate.TreeNodeGroup) {
                    var selectedNodes = [];
                    var i = this.selectedNodes.length;
                    while (i--)
                        selectedNodes.push(this.selectedNodes[i]);
                    var groups = [];
                    i = selectedNodes.length;
                    while (i--)
                        groups.push(selectedNodes[i].groupID);
                    Animate.User.get.project.deleteGroups(groups);
                }
                else if (this._contextNode instanceof Animate.TreeNodeGroupInstance)
                    this._contextNode.dispose();
            }
            //COPY
            if (this._contextNode && event.item == this._contextCopy) {
                if (this._contextNode instanceof Animate.TreeNodeAssetInstance)
                    Animate.User.get.project.copyAsset(this._contextNode.asset.id);
            }
            else if (this._contextNode && event.item == this._contextAddInstance)
                Animate.User.get.project.createAsset("New " + this._contextNode.assetClass.name, this._contextNode.assetClass.name);
            else if (this._contextNode && event.item.text == "Save") {
                if (this._contextNode instanceof Animate.TreeNodeAssetInstance)
                    Animate.User.get.project.saveAssets([this._contextNode.asset.id]);
                if (this._contextNode instanceof Animate.TreeNodeGroup)
                    Animate.User.get.project.saveGroups([this._contextNode.groupID]);
                else if (this._contextNode instanceof Animate.TreeNodeBehaviour)
                    Animate.User.get.project.saveBehaviours([this._contextNode.behaviour.id]);
            }
            else if (this._contextNode && event.item.text == "Add Group")
                Animate.User.get.project.createGroup("New Group");
            else if (this._contextNode && event.item.text == "Update") {
                if (this._contextNode instanceof Animate.TreeNodeAssetInstance) {
                    Animate.User.get.project.updateAssets([this._contextNode.asset.id]);
                }
                else if (this._contextNode == this._groupsNode) {
                    while (this._groupsNode.children.length > 0)
                        this._groupsNode.children[0].dispose();
                    Animate.User.get.project.loadGroups();
                }
                else if (this._contextNode == this._sceneNode) {
                    while (this._sceneNode.children.length > 0)
                        this._sceneNode.children[0].dispose();
                    Animate.User.get.project.loadBehaviours();
                }
                else if (this._contextNode instanceof Animate.TreeNodeGroup) {
                    Animate.User.get.project.updateGroups([this._contextNode.groupID]);
                }
                else if (this._contextNode instanceof Animate.TreeNodeAssetClass) {
                    var nodes = this._contextNode.getAllNodes(Animate.TreeNodeAssetInstance);
                    var ids = [];
                    for (var i = 0, l = nodes.length; i < l; i++)
                        if (nodes[i] instanceof Animate.TreeNodeAssetInstance)
                            ids.push(nodes[i].asset.id);
                    Animate.User.get.project.updateAssets(ids);
                }
                else if (this._contextNode instanceof Animate.TreeNodeBehaviour) {
                    Animate.User.get.project.updateBehaviours([this._contextNode.behaviour.id]);
                }
            }
        };
        /**
        * When we double click the tree
        * @param <object> e The jQuery event object
        */
        TreeViewScene.prototype.onDblClick = function (e) {
            if (this.selectedNode instanceof Animate.TreeNodeBehaviour) {
                var tabPair = Animate.CanvasTab.getSingleton().getTab(this.selectedNode.text);
                if (tabPair == null)
                    tabPair = Animate.CanvasTab.getSingleton().getTab("*" + this.selectedNode.text);
                if (tabPair)
                    Animate.CanvasTab.getSingleton().selectTab(tabPair);
                else {
                    var tabPair = Animate.CanvasTab.getSingleton().addSpecialTab(this.selectedNode.text, Animate.CanvasTabType.CANVAS, this.selectedNode.behaviour);
                    var canvas = tabPair.canvas;
                    canvas.openFromDataObject();
                    canvas.checkDimensions();
                    Animate.CanvasTab.getSingleton().selectTab(tabPair);
                }
            }
        };
        /**
        * Use this function to get an array of the groups in the scene.
        * @returns {Array<TreeNodeGroup>} The array of group nodes
        */
        TreeViewScene.prototype.getGroups = function () {
            var toRet = [];
            for (var i = 0; i < this._groupsNode.children.length; i++)
                toRet.push(this._groupsNode.children[i]);
            return toRet;
        };
        /**
        * Use this function to get a group by its ID
        * @param {string} id The ID of the group
        * @returns {TreeNodeGroup}
        */
        TreeViewScene.prototype.getGroupByID = function (id) {
            for (var i = 0; i < this._groupsNode.children.length; i++)
                if (id == this._groupsNode.children[i].groupID)
                    return this._groupsNode.children[i];
            return null;
        };
        /**
        * When the database returns from its command.
        * @param {ProjectEvents} response The loader response
        * @param {ProjectEvent} data The data sent from the server
        */
        TreeViewScene.prototype.onGroupResponse = function (response, event) {
            var data = event.tag;
            if (response == Animate.ProjectEvents.GROUP_CREATED)
                this._groupsNode.addNode(new Animate.TreeNodeGroup(data.id, data.name, data.json, this));
            else if (response == Animate.ProjectEvents.GROUP_UPDATED) {
                var node = this._groupsNode.findNode("groupID", data._id);
                if (node)
                    node.updateGroup(data.name, data.json);
            }
            else if (response == Animate.ProjectEvents.GROUP_SAVED) {
                var node = this._groupsNode.findNode("groupID", data);
                if (node)
                    node.save(true);
            }
            else if (response == Animate.ProjectEvents.GROUP_DELETING) {
                var node = this._groupsNode.findNode("groupID", data);
                if (node)
                    node.dispose();
            }
        };
        /** When the rename form is about to proceed. We can cancel it by externally checking
        * if against the data.object and data.name variables.
        */
        TreeViewScene.prototype.onRenameCheck = function (response, event, sender) {
            //if (event.tag.object.type == "project" )
            //	return;
            var project = Animate.User.get.project;
            var len = project.behaviours.length;
            if (event.object instanceof Animate.BehaviourContainer)
                for (var i = 0; i < len; i++)
                    if (project.behaviours[i].name == event.name) {
                        Animate.RenameForm.getSingleton().name.val.textfield.element.addClass("red-border");
                        Animate.RenameForm.getSingleton().warning.textfield.element.css("color", "#FF0000");
                        Animate.RenameForm.getSingleton().warning.text = "A behaviour with the name '" + event.name + "' already exists, please choose another.";
                        event.cancel = true;
                        return;
                    }
            event.cancel = false;
        };
        /**
        * When the database returns from its command to rename an object.
        * @param {ProjectEvents} response The loader response
        * @param {ProjectEvent} data The data sent from the server
        */
        TreeViewScene.prototype.onObjectRenamed = function (response, event) {
            var data = event.tag;
            if (response == Animate.ProjectEvents.OBJECT_RENAMED) {
                if (data.object != null) {
                    var prevName = data.object.name;
                    data.object.name = data.name;
                    var node = null;
                    if (data.object instanceof Animate.BehaviourContainer)
                        node = this._sceneNode.findNode("behaviour", data.object);
                    else if (data.object instanceof Animate.Asset)
                        node = this._assetsNode.findNode("asset", data.object);
                    else if (data.object instanceof Animate.TreeNodeGroup)
                        node = data.object;
                    if (node != null) {
                        node.text = data.name;
                        if (data.object instanceof Animate.Asset)
                            //PluginManager.getSingleton().assetRenamed( data.object, prevName );
                            Animate.PluginManager.getSingleton().dispatchEvent(new Animate.AssetRenamedEvent(data.object, prevName));
                    }
                }
            }
        };
        /**
        * When the database returns from its command.
        * @param {ProjectEvents} response The loader response
        * @param {Event} data The data sent from the server
        */
        TreeViewScene.prototype.onBehaviourResponse = function (response, event) {
            var proj = Animate.User.get.project;
            //SAVE
            if (response == Animate.ProjectEvents.BEHAVIOUR_SAVED) {
                //If we have the behaviour
                if (event.tag) {
                    var node = this.findNode("behaviour", event.tag);
                    node.save(true);
                }
            }
        };
        /**
        * When the database returns from its command.
        * @param {ProjectEvents} response The type of event
        * @param {AssetEvent} event The data sent from the server
        */
        TreeViewScene.prototype.onAssetResponse = function (response, event) {
            var data = event.asset;
            var proj = Animate.User.get.project;
            if (response == Animate.ProjectEvents.ASSET_DELETING) {
                Animate.CanvasTab.getSingleton().removeAsset(data);
                var selectedNodes = [];
                var i = this.selectedNodes.length;
                while (i--)
                    selectedNodes.push(this.selectedNodes[i]);
                i = selectedNodes.length;
                while (i--) {
                    if (selectedNodes[i].asset.id == data.id)
                        selectedNodes[i].dispose();
                }
                this._contextNode = null;
            }
            else if (response == Animate.ProjectEvents.ASSET_SAVED) {
                //If we have the asset
                if (data) {
                    var node = this.findNode("asset", data);
                    if (node)
                        node.save();
                }
            }
            else if (response == Animate.ProjectEvents.ASSET_UPDATED) {
                //If we have the asset
                if (data) {
                    var node = this.findNode("asset", data);
                    if (node && node.selected) {
                        node.save();
                        node.onSelect();
                    }
                }
            }
        };
        /**
        * When the database returns from its command.
        * @param {ProjectEvents} response The loader response
        * @param {Event} data The data sent from the server
        */
        TreeViewScene.prototype.onProjectResponse = function (response, event) {
            if (response == Animate.ProjectEvents.BEHAVIOUR_DELETING) {
                var selectedNodes = [];
                var i = this.selectedNodes.length;
                while (i--)
                    selectedNodes.push(this.selectedNodes[i]);
                i = selectedNodes.length;
                while (i--) {
                    if (selectedNodes[i] instanceof Animate.TreeNodeBehaviour &&
                        selectedNodes[i].behaviour == event.tag) {
                        var tabPair = Animate.CanvasTab.getSingleton().getTab(selectedNodes[i].text);
                        if (tabPair)
                            Animate.CanvasTab.getSingleton().removeTab(tabPair, true);
                        else {
                            tabPair = Animate.CanvasTab.getSingleton().getTab("*" + selectedNodes[i].text);
                            if (tabPair)
                                Animate.CanvasTab.getSingleton().removeTab(tabPair, true);
                        }
                        //this.selectedNodes[i].parent().data("component").removeNode( this.selectedNodes[i] );
                        selectedNodes[i].dispose();
                        if (this._contextNode == selectedNodes[i])
                            this._contextNode = null;
                    }
                }
            }
        };
        /**
        * This function will get a list of asset instances based on their class name.
        * @param {string|Array<string>} classNames The class name of the asset, or an array of class names
        * @returns Array<TreeNodeAssetInstance>
        */
        TreeViewScene.prototype.getAssets = function (classNames) {
            var i = this._assetsNode.children.length;
            var toRet = new Array();
            while (i--) {
                if (this._assetsNode.children[i] instanceof Animate.TreeNodeAssetClass) {
                    var nodes = this._assetsNode.children[i].getInstances(classNames);
                    if (nodes != null) {
                        for (var ii = 0; ii < nodes.length; ii++)
                            toRet.push(nodes[ii]);
                    }
                }
            }
            return toRet;
        };
        /**
        * This function will get a list of asset classes.
        * returns {Array<TreeNodeAssetClass>}
        */
        TreeViewScene.prototype.getAssetClasses = function () {
            var len = this._assetsNode.children.length;
            var toRet = new Array();
            for (var i = 0; i < len; i++) {
                if (this._assetsNode.children[i] instanceof Animate.TreeNodeAssetClass) {
                    toRet.push(this._assetsNode.children[i].assetClass);
                    var classes = this._assetsNode.children[i].getClasses();
                    if (classes != null) {
                        for (var ii = 0; ii < classes.length; ii++)
                            toRet.push(classes[ii]);
                    }
                }
            }
            return toRet;
        };
        /**
        * Called when the context menu is about to open.
        * @param <jQuery> e The jQuery event object
        */
        TreeViewScene.prototype.onContext = function (e) {
            //Now hook the context events
            var targ = jQuery(e.target).parent();
            if (targ == null)
                return;
            var component = targ.data("component");
            //If the canvas
            if (component instanceof Animate.TreeNode) {
                //Show / hide delete context item
                if (component.canDelete)
                    this._contextDel.element.show();
                else
                    this._contextDel.element.hide();
                //Show / hide the copy context 
                if (component.canCopy && this.selectedNodes.length == 1)
                    this._contextCopy.element.show();
                else
                    this._contextCopy.element.hide();
                //Show / hide the update option
                if (component.canUpdate)
                    this._contextRefresh.element.show();
                else
                    this._contextRefresh.element.hide();
                //Show / hide the save option
                if (typeof (component.saved) !== "undefined" && !component.saved && this.selectedNodes.length == 1)
                    this._contextSave.element.show();
                else
                    this._contextSave.element.hide();
                //Check if the groups node
                if (component == this._groupsNode)
                    this._contextAddGroup.element.show();
                else
                    this._contextAddGroup.element.hide();
                //Show / hide add instance context item
                if (component instanceof Animate.TreeNodeAssetClass && component.assetClass.abstractClass == false)
                    this._contextAddInstance.element.show();
                else
                    this._contextAddInstance.element.hide();
                //this.selectNode( component );
                this._contextNode = component;
                e.preventDefault();
                this._contextMenu.show(Animate.Application.getInstance(), e.pageX, e.pageY, false, true);
                this._contextMenu.element.css({ "width": "+=20px" });
            }
        };
        /**
        * Selects a node.
        * @param {TreeNode} node The node to select
        * @param {boolean} expandToNode A bool to say if we need to traverse the tree down until we get to the node
        * and expand all parent nodes
        * @param {boolean} multiSelect Do we allow nodes to be multiply selected
        */
        TreeViewScene.prototype.selectNode = function (node, expandToNode, multiSelect) {
            if (expandToNode === void 0) { expandToNode = false; }
            if (multiSelect === void 0) { multiSelect = false; }
            if (!this.enabled)
                return;
            var multipleNodesSelected = false;
            if (multiSelect) {
                var selectedNodes = [];
                var i = this.selectedNodes.length;
                while (i--)
                    selectedNodes.push(this.selectedNodes[i]);
                selectedNodes.push(node);
                i = selectedNodes.length;
                while (i--) {
                    var ii = selectedNodes.length;
                    while (ii--) {
                        if (selectedNodes[i].constructor.name != selectedNodes[ii].constructor.name && selectedNodes[i] != selectedNodes[ii]) {
                            multipleNodesSelected = true;
                            break;
                        }
                    }
                    if (multipleNodesSelected)
                        break;
                }
                if (multipleNodesSelected)
                    multiSelect = false;
            }
            _super.prototype.selectNode.call(this, node, expandToNode, multiSelect);
            if (node == null)
                Animate.PluginManager.getSingleton().dispatchEvent(new Animate.AssetEvent(Animate.EditorEvents.ASSET_SELECTED, null));
            //PluginManager.getSingleton().assetSelected( null );
        };
        /**
        * Gets the singleton instance.
        * @returns <TreeViewScene> The singleton instance
        */
        TreeViewScene.getSingleton = function () {
            if (!TreeViewScene._singleton)
                new TreeViewScene();
            return TreeViewScene._singleton;
        };
        /**
        * This will add a node to the treeview to represent the containers.
        * @param {BehaviourContainer} behaviour The behaviour we are associating with the node
        * @returns {TreeNodeBehaviour}
        */
        TreeViewScene.prototype.addContainer = function (behaviour) {
            var toRet = new Animate.TreeNodeBehaviour(behaviour);
            this._sceneNode.addNode(toRet);
            return toRet;
        };
        /**
        * This will add a node to the treeview to represent the behaviours available to developers
        * @param {BehaviourDefinition} template
        * @returns {TreeNodePluginBehaviour}
        */
        TreeViewScene.prototype.addPluginBehaviour = function (template) {
            var toRet = new Animate.TreeNodePluginBehaviour(template);
            this._pluginBehaviours.addNode(toRet);
            return toRet;
        };
        /**
        * This will remove a node from the treeview that represents the behaviours available to developers.
        * @param  {string} name The name if the plugin behaviour
        * @returns {TreeNode}
        */
        TreeViewScene.prototype.removePluginBehaviour = function (name, dispose) {
            if (dispose === void 0) { dispose = true; }
            var node = this._pluginBehaviours.findNode("mText", name);
            if (node != null) {
                this._pluginBehaviours.removeNode(node);
                if (dispose)
                    node.dispose();
            }
            return node;
        };
        Object.defineProperty(TreeViewScene.prototype, "sceneNode", {
            get: function () { return this._sceneNode; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TreeViewScene.prototype, "assetsNode", {
            get: function () { return this._assetsNode; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TreeViewScene.prototype, "groupsNode", {
            get: function () { return this._groupsNode; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TreeViewScene.prototype, "pluginBehaviours", {
            get: function () { return this._pluginBehaviours; },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(TreeViewScene.prototype, "contextNode", {
            get: function () { return this._contextNode; },
            set: function (val) { this._contextNode = val; },
            enumerable: true,
            configurable: true
        });
        return TreeViewScene;
    })(Animate.TreeView);
    Animate.TreeViewScene = TreeViewScene;
})(Animate || (Animate = {}));
var Animate;
(function (Animate) {
    var Splash2 = (function (_super) {
        __extends(Splash2, _super);
        function Splash2() {
            _super.call(this, 800, 520);
            //private slideTime: number;
            this.names = [{ name: "mathew", lastname: "henson" }, { name: "suzy", lastname: "miller" }];
            Splash2._singleton = this;
            this.user = Animate.User.get;
            this.element.addClass("splash-window");
            this.$loginError = "";
            this.$loginRed = true;
            this.$loading = false;
            this.$activePane = "welcome";
            //this.welcomeBackground = new Component("<div class='splash-outer-container splash-welcome'></div>", this.content);
            this.welcomeBackground = jQuery(".temp-splash-welcome").remove().clone();
            this.content.element.append(this.welcomeBackground);
            Animate.Compiler.build(this.welcomeBackground, this);
            //this.newProjectBackground = new Component("<div style='left:800px;' class='splash-outer-container splash-new-project'></div>", this.content);
            this.newProjectBackground = jQuery(".temp-splash-new-project").remove().clone();
            this.content.element.append(this.newProjectBackground);
            Animate.Compiler.build(this.newProjectBackground, this);
            //this.loginBackground = new Component("<div style='top:-520px;' class='splash-outer-container splash-login-user'></div>", this.content);
            this.loginBackground = jQuery(".temp-splash-login").remove().clone();
            this.content.element.append(this.loginBackground);
            Animate.Compiler.build(this.loginBackground, this);
            //this.pluginsBackground = new Component("<div style='left:800px;' class='splash-outer-container splash-plugins'></div>", this.content);
            //this.finalScreen = new Component("<div style='left:800px;' class='splash-outer-container splash-final-screen'></div>", this.content);
            this.pluginsBackground = new Animate.Component("<div style='left:800px;' class='splash-outer-container splash-plugins'></div>");
            this.finalScreen = new Animate.Component("<div style='left:800px;' class='splash-outer-container splash-final-screen'></div>");
            this.clickProxy = this.onButtonClick.bind(this);
            //this.animateProxy = this.enableButtons.bind(this);
            this.initialized = false;
            //his.slideTime = 500;
            this.modalBackdrop.css({ "z-index": "900" });
            this.element.css({ "z-index": "901" });
        }
        /**
        * Given a form element, we look at if it has an error and based on the expression. If there is we set
        * the login error message
        * @param {EngineForm} The form to check.
        * @param {boolean} registerCheck Check register password and assign captcha
        * @param {boolean} True if there is an error
        */
        Splash2.prototype.reportError = function (form, registerCheck) {
            if (registerCheck === void 0) { registerCheck = false; }
            if (!form.$error)
                this.$loginError = "";
            else {
                var name = form.$errorInput;
                name = name.charAt(0).toUpperCase() + name.slice(1);
                switch (form.$errorExpression) {
                    case "alpha-numeric":
                        this.$loginError = name + " must only contain alphanumeric characters";
                        break;
                    case "non-empty":
                        this.$loginError = name + " cannot be empty";
                        break;
                    case "email":
                        this.$loginError = name + " must be a valid email";
                        break;
                    case "alpha-numeric-plus":
                        this.$loginError = name + " must only contain alphanumeric characters and '-', '!', or '_'";
                        break;
                    default:
                        this.$loginError = "";
                        break;
                }
            }
            if (registerCheck) {
                this.$regCaptcha = jQuery("#recaptcha_response_field").val();
                this.$regChallenge = jQuery("#recaptcha_challenge_field").val();
                if (this.$regPassword != this.$regPasswordCheck)
                    this.$loginError = "Your passwords do not match";
            }
            if (this.$loginError == "") {
                this.$loginRed = false;
                return false;
            }
            else {
                this.$loginRed = true;
                return true;
            }
        };
        Splash2.prototype.loginError = function (err) {
            this.$loading = false;
            this.$loginRed = true;
            this.$loginError = err.message;
            Animate.Compiler.digest(this.loginBackground, this);
        };
        Splash2.prototype.loginSuccess = function (data) {
            if (data.error)
                this.$loginRed = true;
            else
                this.$loginRed = false;
            this.$loading = false;
            this.$loginError = data.message;
            Animate.Compiler.digest(this.loginBackground, this);
            Animate.Compiler.digest(this.welcomeBackground, this);
        };
        /**
        * Attempts to log the user in
        * @param {string} user The username
        * @param {string} password The user password
        * @param {boolean} remember Should the user cookie be saved
        */
        Splash2.prototype.login = function (user, password, remember) {
            var that = this;
            that.$loading = true;
            this.user.login(user, password, remember)
                .then(function (data) {
                if (data.error)
                    that.$loginRed = true;
                else
                    that.$loginRed = false;
                that.$loginError = data.message;
                that.refreshProjects();
                Animate.Compiler.digest(that.loginBackground, that);
                Animate.Compiler.digest(that.welcomeBackground, that);
            })
                .fail(this.loginError.bind(that))
                .done(function () {
                jQuery(".close-but", that.loginBackground).trigger("click");
                that.$loading = false;
            });
        };
        /**
        * Attempts to register a new user
        * @param {string} user The username of the user.
        * @param {string} password The password of the user.
        * @param {string} email The email of the user.
        * @param {string} captcha The captcha of the login screen
        * @param {string} captha_challenge The captha_challenge of the login screen
        */
        Splash2.prototype.register = function (user, password, email, captcha, challenge) {
            var that = this;
            that.$loading = true;
            this.user.register(user, password, email, captcha, challenge)
                .then(this.loginSuccess.bind(that))
                .fail(function (err) {
                that.$loginRed = true;
                that.$loginError = err.message;
                that.$loading = false;
                Recaptcha.reload();
                Animate.Compiler.digest(that.loginBackground, that);
            });
        };
        /**
        * Attempts to resend the activation code
        * @param {string} user The username or email of the user to resend the activation
        */
        Splash2.prototype.resendActivation = function (user) {
            var that = this;
            if (!user) {
                this.$loginError = "Please specify a username or email to fetch";
                jQuery("form[name='register'] input[name='username'], form[name='register'] input[name='email']", this.loginBackground).each(function (index, elem) {
                    this.$error = true;
                });
                return Animate.Compiler.digest(that.loginBackground, that);
            }
            that.$loading = true;
            this.user.resendActivation(user)
                .then(this.loginSuccess.bind(that))
                .fail(this.loginError.bind(that));
        };
        /**
        * Attempts to reset the users password
        * @param {string} user The username or email of the user to resend the activation
        */
        Splash2.prototype.resetPassword = function (user) {
            var that = this;
            if (!user) {
                this.$loginError = "Please specify a username or email to fetch";
                jQuery("form[name='register'] input[name='username'], form[name='register'] input[name='email']", this.loginBackground).each(function (index, elem) {
                    this.$error = true;
                });
                return Animate.Compiler.digest(that.loginBackground, that);
            }
            that.$loading = true;
            this.user.resetPassword(user)
                .then(this.loginSuccess.bind(that))
                .fail(this.loginError.bind(that));
        };
        /**
        * Attempts to resend the activation code
        * @param {string} user The username or email of the user to resend the activation
        */
        Splash2.prototype.logout = function () {
            var that = this;
            that.$loading = true;
            this.user.logout().then(function () {
                that.$loading = false;
                that.$loginError = "";
                Animate.Application.getInstance().projectReset();
                that.projectBrowser.enabled = false;
                that.refreshProjects();
                Animate.Compiler.digest(that.welcomeBackground, that);
            })
                .fail(this.loginError.bind(that));
        };
        /**
        * Fills the project browser with projects from the server
        */
        Splash2.prototype.refreshProjects = function () {
            var that = this;
            if (that.user.isLoggedIn) {
            }
            else
                that.projectBrowser.clearItems();
        };
        /**
        * This function can be called to reset all the splash variables and states.absolute
        * This is called from Animate when we click the home button.
        * @returns {any}
        */
        Splash2.prototype.reset = function () {
            //this.welcomeBackground.element.css({ "left": "0px", "top": "0px" });
            //this.welcomeBackground.css({ "left": "0px", "top": "0px" });
            //this.newProjectBackground.element.css({ "left": "800px" });
            //this.newProjectBackground.css({ "left": "800px" });
            //this.loginBackground.element.css({ "top": "-520px" });
            //this.loginBackground.css({ "top": "-520px" });
            //this.pluginsBackground.element.css({ "left": "800px" });
            //this.finalScreen.element.css({ "left": "800px" });
            //this.enableButtons(true);
            //this.projectError.element.hide();
            this.finalError.element.hide();
            //this.loginError.element.hide();
            //this.closeButton.element.show();
            //this.loginUsername.textfield.element.removeClass("red-border");
            //this.loginPassword.textfield.element.removeClass("red-border");
            //this.regUsername.textfield.element.removeClass("red-border");
            //this.regPassword.textfield.element.removeClass("red-border");
            //this.regPasswordCheck.textfield.element.removeClass("red-border");
            //this.regEmail.textfield.element.removeClass("red-border");
            //this.projectName.textfield.element.removeClass("red-border");
            //this.projectDesc.textfield.element.removeClass("red-border");
            //Refresh the projects
            //User.get.downloadProjects();
            this.refreshProjects();
            Animate.Compiler.digest(this.welcomeBackground, this);
            Animate.Compiler.digest(this.loginBackground, this);
            return;
        };
        ///**
        //* Enables the buttons based on the value parameter
        //* @param <bool> value 
        //*/
        //enableButtons(value)
        //{
        //	if (typeof value !== "undefined")
        //	{
        //		this.projectBack.enabled = value;
        //		this.projectNext.enabled = value;
        //              this.finalButton.enabled = value;
        //              // TODO - button enabled
        //		//this.login.enabled = value;
        //		//this.loginBack.enabled = value;
        //		//this.register.enabled = value;
        //	}
        //	else
        //	{
        //		this.projectBack.enabled = true;
        //		this.projectNext.enabled = true;
        //              this.finalButton.enabled = true;
        //              // TODO - button enabled
        //		//this.login.enabled = true;
        //		//this.loginBack.enabled = true;
        //		//this.register.enabled = true;
        //	}
        //}
        /**
        * Creates the new project page on the splash screen
        */
        Splash2.prototype.createNewProjectPage = function () {
            //var heading = new Label("Create New Project", this.newProjectBackground)
            //heading.element.addClass("heading");
            //Create container div
            //var project = new Component("<div class='splash-new-project-sub'></div>", this.newProjectBackground);
            //Create inputs
            //new Label("Project Name", project);
            //this.projectName = new InputBox(project, "");
            //var sub = new Label("Please enter the name of your project.", project);
            //sub.textfield.element.addClass("instruction-text");
            //new Label("Project Description", project);
            //this.projectDesc = new InputBox(project, "", true);
            //sub = new Label("Optionally give a description of your project.", project);
            //sub.textfield.element.addClass("instruction-text");
            //Create continue Button
            //this.projectBack = new Button("Back", project);
            //this.projectNext = new Button("Next", project);
            //this.projectNext.css({ width: 100, height: 40 });
            //this.projectBack.css({ width: 100, height: 40 });
            //Error label
            //this.projectError = new Label("", project);
            //this.projectError.element.hide();
            //this.projectError.textfield.element.css({ color: "#ff0000", clear: "both" });
            //this.projectNext.element.click(this.clickProxy);
            //this.projectBack.element.click(this.clickProxy);
        };
        /**
        * Creates the new plugins page on the splash screen
        */
        Splash2.prototype.createPluginsPage = function () {
            //Add the explorer
            this.pluginBrowser = new Animate.PluginBrowser(this.pluginsBackground);
            this.pluginBrowser.on(Animate.PluginBrowserEvents.PLUGINS_IMPLEMENTED, this.onPluginResponse, this);
        };
        /**
        * Creates the final screen.
        * This screen loads each of the plugins and allows the user to enter the application.
        */
        Splash2.prototype.createFinalScreen = function () {
            //Heading
            var heading = new Animate.Label("Setting up workspace", this.finalScreen);
            heading.element.addClass("heading");
            //Info
            var sub = new Animate.Label("Please wait while we load and initialise your behaviours.", this.finalScreen);
            sub.textfield.element.addClass("instruction-text");
            //Add the explorer
            this.pluginLoader = new Animate.ProjectLoader(this.finalScreen);
            //Error label
            this.finalError = new Animate.Label("ERROR", this.finalScreen);
            this.finalError.element.hide();
            this.finalError.textfield.element.css({ color: "#ff0000", "height": "35px", "float": "left", "width": "300px", "padding-top": "2px", "margin-left": "10px" });
            //Create continue Button
            this.finalButton = new Animate.Button("Loading", this.finalScreen);
            this.finalButton.css({ width: 100, height: 30 });
            this.finalButton.element.click(this.clickProxy);
            this.finalButton.enabled = false;
            this.pluginLoader.on(Animate.ProjectLoaderEvents.READY, this.onProjectLoaderResponse, this);
            this.pluginLoader.on(Animate.ProjectLoaderEvents.FAILED, this.onProjectLoaderResponse, this);
        };
        /**
        * @type public mfunc createLoginPage
        * Creates the login page on the Splash menu
        * @extends <Splash>
        */
        Splash2.prototype.createLoginPage = function () {
            //this.loginBack = new Component("<div class='close-but'>X</div>", this.loginBackground);
            //var heading = new Label("User Login", this.loginBackground);
            //heading.element.addClass("heading");
            //heading.textfield.element.prepend("<img src='media/blank-user.png' />");
            //heading.element.append("<div class='fix'></div>");
            //Create container div and main elements
            //var sub = new Component("<div></div>", this.loginBackground);
            //this.loginBackground.element.append("<div class='fix'></div>");
            //var login = new Component("<div class='splash-section'></div>", sub);
            //var register = new Component("<div class='splash-section splash-section-right'></div>", sub);
            //Create login form
            //new Label("Username:", login);
            //this.loginUsername = new InputBox(login, "");
            //new Label("Password:", login);
            //this.loginPassword = new InputBox(login, "", false, true);
            //this.loginRemembeMe = new Checkbox(login, "Remember me", true);
            //this.loginReset = new Label("Reset Password", login);
            //this.loginReset.element.addClass("hyperlink");
            //this.loginResend = new Label("Resend Activation Email", login);
            //this.loginResend.element.addClass("hyperlink");
            //this.loginResend.element.css({ "margin": "20px 0 0 0" });
            //Create register form
            //new Label("Username:", register);
            //this.regUsername = new InputBox(register, "");
            //new Label("Email:", register);
            //this.regEmail = new InputBox(register, "");
            //new Label("Password:", register);
            //this.regPassword = new InputBox(register, "", false, true);
            //new Label("Retype Password:", register);
            //this.regPasswordCheck = new InputBox(register, "", false, true);
            //register.element.append("<div id='animate-captcha'></div>");
            //jQuery('#animate-captcha').each(function ()
            //{
            //	if ( (<any>window).Recaptcha)
            //		Recaptcha.create("6LdiW-USAAAAAGxGfZnQEPP2gDW2NLZ3kSMu3EtT", this, { theme: "white" });
            //});
            Recaptcha.create("6LdiW-USAAAAAGxGfZnQEPP2gDW2NLZ3kSMu3EtT", document.getElementById("animate-captcha"), { theme: "white" });
            //Create Buttons
            //this.login = new Button("Login", login);
            //this.register = new Button("Register", register);
            //this.login.css({ width: "", height: 40 });
            //this.register.css({ width: "", height: 40 });
            //Error label
            //this.loginError = new Label("", this.loginBackground);
            //this.loginError.element.hide();
            //this.loginError.textfield.element.css({ color: "#ff0000", clear: "both", "font-size": "14px", "text-align": "center", "margin-top": "0px", "font-weight": "bold" });
            //this.login.element.click(this.clickProxy);
            //this.register.element.click(this.clickProxy);
            //this.loginBack.element.click(this.clickProxy);
            //this.loginReset.element.click(this.clickProxy);
            //this.loginResend.element.click(this.clickProxy);
        };
        ///**
        //* Checks each of the login fields based on which button was pressed.
        //* @param {any} button 
        //*/
        //      validateLogins(jComp: JQuery)
        //      {
        //          var toRet = true;
        //	//this.loginUsername.textfield.element.removeClass("red-border");
        //	//this.loginPassword.textfield.element.removeClass("red-border");
        //	//this.regUsername.textfield.element.removeClass("red-border");
        //	//this.regPassword.textfield.element.removeClass("red-border");
        //	//this.regPasswordCheck.textfield.element.removeClass("red-border");
        //	//this.regEmail.textfield.element.removeClass("red-border");
        //          if (jComp.is(".en-login-reset") || jComp.is(".en-login-resend"))
        //	{
        //              //Check username
        //              var message = jQuery.trim(jQuery("#en-login-username").val())
        //		if (message == "")
        //		{
        //			//this.loginError.element.show();
        //			//this.loginError.text = "Please enter your username or email";
        //                  this.$loginError = "Please enter your username or email";
        //			//this.loginUsername.textfield.element.addClass("red-border");
        //			//this.enableButtons(true);
        //                  toRet = false;
        //		}
        //	}
        //          else if (jComp.is(".en-login"))
        //	{
        //		//Check username
        //              var message: string = Utils.checkForSpecialChars(jQuery("#en-login-username").val())
        //		if (message)
        //		{
        //			//this.loginError.element.show();
        //			//this.loginError.text = message;
        //                  this.$loginError = message;
        //			//this.loginUsername.textfield.element.addClass("red-border");
        //			this.enableButtons(true);
        //                  toRet = false;
        //		}
        //		//Check password
        //              message = Utils.checkForSpecialChars(jQuery("#en-login-password").val())
        //		if (message)
        //		{
        //			//this.loginError.element.show();
        //                  //this.loginError.text = message;
        //                  this.$loginError = message;
        //			//this.loginPassword.textfield.element.addClass("red-border");
        //			this.enableButtons(true);
        //                  toRet = false;
        //		}
        //          }
        //          else if (jComp.is(".en-login-reset") == false && jComp.is(".en-login-resend") == false)
        //	{
        //		//Check username
        //              var message: string = Utils.checkForSpecialChars(jQuery("#en-reg-username").val())
        //		if (message)
        //		{
        //			//this.loginError.element.show();
        //                  //this.loginError.text = message;
        //                  this.$loginError = message;
        //			//this.regUsername.textfield.element.addClass("red-border");
        //			this.enableButtons(true);
        //                  toRet = false;
        //		}
        //		//Check email
        //              var emailValid: boolean = Utils.validateEmail(jQuery("#en-reg-email").val())
        //		if (!emailValid)
        //		{
        //			//this.loginError.element.show();
        //			//this.loginError.text = "Please enter a valid email address.";
        //                  this.$loginError = "Please enter a valid email address.";
        //			//this.regEmail.textfield.element.addClass("red-border");
        //			this.enableButtons(true);
        //                  toRet = false;
        //		}
        //		//Check password
        //              message = Utils.checkForSpecialChars(jQuery("#en-reg-password").val())
        //		if (message)
        //		{
        //			//this.loginError.element.show();
        //			//this.loginError.text = message;
        //                  this.$loginError = message;
        //			//this.regPassword.textfield.element.addClass("red-border");
        //			this.enableButtons(true);
        //			return false;
        //		}
        //		//Make sure passwords match
        //              if (jQuery("#en-reg-password").val() != jQuery("#en-reg-password-check").val())
        //		{
        //			//this.regPassword.textfield.element.addClass("red-border");
        //			//this.regPasswordCheck.textfield.element.addClass("red-border");
        //                  jQuery("#en-reg-password").addClass("red-border");
        //                  jQuery("#en-reg-password-check").addClass("red-border");
        //			//this.loginError.element.show();
        //			//this.loginError.text = "Your passwords do not match.";
        //                  this.$loginError = "Your passwords do not match.";
        //			this.enableButtons(true);
        //                  toRet = false;
        //		}
        //	}
        //          return toRet;
        //      }
        ///**
        //* Checks each of the fields for creating a new project.
        //*/
        //validateNewProject()
        //{
        //	this.projectName.textfield.element.removeClass("red-border");
        //	this.projectDesc.textfield.element.removeClass("red-border");
        //	this.projectError.element.hide();
        //	//Check for errors
        //	var message = Utils.checkForSpecialChars(this.projectName.text);
        //	if (message != null)
        //	{
        //		this.projectError.text = message;
        //		this.projectError.element.show();
        //		this.projectName.textfield.element.addClass("red-border");
        //		//this.enableButtons(true);
        //		return;
        //	}
        //	return true;
        //}
        /**
        * Creates the first page on the splash screen
        */
        Splash2.prototype.createWelcomePage = function () {
            var user = Animate.User.get;
            //Compiler.build(this.welcomeBackground, this);
            //var sub = new Component("<div class='splash-container'></div>", this.welcomeBackground);
            //this.project = new Component("<div class='splash-section'></div>", sub);
            //this.news = new Component("<div class='splash-section'></div>", sub);
            //this.userBox = <Component>this.news.addChild("<div class='splash-user-box'></div>");
            //this.closeButton = new Component("<div class='close-but'>X</div>", this.userBox);
            //this.userImg = new Component("<div class='details'><img src='" + user.imgURL + "' /></div>", this.userBox);
            //this.news.addChild("<div class='welcome'>Welcome to Animate</div>");
            //var newsBox : Component = <Component>this.news.addChild("<div class='news'></div>");
            //Get ajax news
            //newsBox.element.html("Hello and welcome back to Animate. If you're new around these parts, let's get you up and running in just a few minutes. Click the below button to learn how to create your very first Animate project. <br /><a href=\"javascript:window.open('https://webinate.net/tutorials-popup/','Animate Tutorials','width=1000,height=800')\"><div class='getting-started'><img src='media/play-arrow.png'/>Tutorial Videos</div></div></a>");
            //login sections	
            //if ( user.isLoggedIn )
            //{
            //this.userBoxDetails = new Component("<div class='details'>" + user.username + "</div><div class='details'><div class='hyperlink logout-link'>Logout</div></div><div class='fix'></div>", this.userBox);
            //jQuery(".logout-link", this.userBoxDetails.element).click(this.clickProxy);
            //user.downloadProjects();
            //this.closeButton.element.show();
            //}
            //else
            //{
            //this.userBoxDetails = new Component("<div class='details'><span class='hyperlink login-link'>Login</span></div><div class='details'><span class='hyperlink register-link'>Register</span></div><div class='fix'></div>", this.userBox);
            //jQuery(".login-link", this.userBoxDetails.element).click(this.clickProxy);
            //jQuery(".register-link", this.userBoxDetails.element).click(this.clickProxy);
            //this.closeButton.element.hide();
            //}
            //this.projectBrowser = new ProjectBrowser(this.project);
            this.projectBrowser = new Animate.ProjectBrowser(null);
            jQuery(".double-column", this.welcomeBackground).first().append(this.projectBrowser.element);
            this.projectBrowser.on(Animate.ProjectBrowserEvents.COMBO, this.onProjectCombo, this);
            //this.closeButton.element.click(this.clickProxy);
        };
        /**
        * Shows the window by adding it to a parent.
        */
        Splash2.prototype.onProjectCombo = function (response, event) {
            var user = Animate.User.get;
            if (!user.isLoggedIn)
                return Animate.MessageBox.show("Please log in", ["Ok"]);
            //WELCOME - Next
            if (event.command == "Create New") {
                //If a project already exists - warn the user it will have to be closed.
                if (user.project) {
                    this.response = "newProject";
                    Animate.MessageBox.show("Are you sure you want to create a new project? Your open project will need to be closed.", ["Yes", "No"], this.onProjectOpenMessageBox, this);
                    return;
                }
                //this.welcomeBackground.element.animate({ left: '-=800' }, this.slideTime, this.animateProxy);
                //this.welcomeBackground.animate({ left: '-=800' }, this.slideTime);
                this.$activePane = "project";
                //this.newProjectBackground.element.animate({ left: '-=800' }, this.slideTime, this.animateProxy);
                //this.newProjectBackground.element.animate({ left: '-=800' }, this.slideTime);
                //this.newProjectBackground.animate({ left: '-=800' }, this.slideTime);
                //this.projectName.focus();
                jQuery(".temp-splash-new-project input[name='name']").focus();
            }
            else if (event.command == "Open") {
                if (this.projectBrowser.selectedItem == null) {
                    //this.enableButtons(true);
                    return;
                }
                var user = Animate.User.get;
                if (user.project) {
                    this.response = "open";
                    Animate.MessageBox.show("Are you sure you want to create a new project? Your open project will need to be closed.", ["Yes", "No"], this.onProjectOpenMessageBox, this);
                    return;
                }
                //Set project
                //var project = new Project( this.projectBrowser.selectedName, "", "" );
                //user.project = project;
                //project.id = this.projectBrowser.selectedID;
                //user.project.addEventListener(ProjectEvents.OPENED, this.onProjectData, this );
                //project.open();
                user.on(Animate.UserEvents.PROJECT_OPENED, this.onProjectData, this);
                user.openProject(this.projectBrowser.selectedID);
            }
            else if (event.command == "Delete") {
                if (this.projectBrowser.selectedItem == null) {
                    //this.enableButtons(true);
                    return;
                }
                if (this.projectBrowser.selectedItem)
                    Animate.MessageBox.show("Are you sure you want to delete '" + this.projectBrowser.selectedName + "'?", ["Yes", "No"], this.onMessageBox, this);
            }
            else if (event.command == "Copy") {
                if (this.projectBrowser.selectedItem == null) {
                    //this.enableButtons(true);
                    return;
                }
                if (this.projectBrowser.selectedItem)
                    Animate.MessageBox.show("Are you sure you want to duplicate '" + this.projectBrowser.selectedName + "'?", ["Yes", "No"], this.onCopyMessageBox, this);
            }
            Animate.Compiler.digest(this.welcomeBackground, this);
            Animate.Compiler.digest(this.newProjectBackground, this);
        };
        /**
        * When we click a button
        * @param {any} e
        */
        Splash2.prototype.onButtonClick = function (e) {
            //this.enableButtons(false);
            var jComp = jQuery(e.currentTarget);
            var comp = jQuery(e.currentTarget).data("component");
            //WELCOME - Login
            if (jComp.is(".login-link") || jComp.is(".register-link")) {
                //this.loginError.element.hide();
                //this.loginPassword.text = "";
                this.$loginError = "";
                this.$activePane = "login";
            }
            else if (jComp.is(".temp-splash-login .close-but")) {
                //this.welcomeBackground.element.animate({ top: '-=520' }, this.slideTime, this.animateProxy);
                //this.welcomeBackground.animate({ top: '-=520' }, this.slideTime);
                //this.loginBackground.element.animate({ top: '-=520' }, this.slideTime, this.animateProxy);
                //this.loginBackground.animate({ top: '-=520' }, this.slideTime);
                this.$activePane = "welcome";
            }
            else if (jComp.is("#en-project-back")) {
                //this.welcomeBackground.element.animate({ left: '+=800' }, this.slideTime, this.animateProxy);
                //this.welcomeBackground.animate({ left: '+=800' }, this.slideTime);
                //this.newProjectBackground.element.animate({ left: '+=800' }, this.slideTime, this.animateProxy);
                //this.newProjectBackground.element.animate({ left: '+=800' }, this.slideTime);
                // this.newProjectBackground.animate({ left: '+=800' }, this.slideTime);
                //this.projectName.text = "";
                //            this.projectDesc.text = "";
                this.$activePane = "welcome";
                jQuery(".temp-splash-new-project input[name='name']").val("");
                jQuery(".temp-splash-new-project input[name='description']").val("");
                //refil the projects
                this.projectBrowser.clearItems();
            }
            else if (comp == this.finalButton) {
                if (this.pluginLoader.errorOccured)
                    Animate.MessageBox.show("Not all your behviours loaded correctly. Do you want to continue anyway?", ["Yes", "No"], this.onFinalMessageBox, this);
                else
                    this.hide();
            }
            Animate.Compiler.digest(this.welcomeBackground, this);
            Animate.Compiler.digest(this.loginBackground, this);
        };
        Splash2.prototype.newProject = function (name, description) {
            //this.user.newProject(name, description);
        };
        /**
        * This is called when we click a button on the message box.
        * @param {string} response
        */
        Splash2.prototype.onProjectOpenMessageBox = function (response) {
            //this.enableButtons(true);
            if (response == "Yes") {
                var user = Animate.User.get;
                //If a project already exists - warn the user it will have to be closed.
                if (user.project) {
                    user.off(Animate.UserEvents.PROJECT_CREATED, this.onProjectData, this);
                    user.off(Animate.UserEvents.FAILED, this.onProjectData, this);
                    user.off(Animate.UserEvents.PROJECT_OPENED, this.onProjectData, this);
                }
                //Notif of the reset
                Animate.Application.getInstance().projectReset();
            }
            else
                return;
            //Trigger the button click
            if (this.response == "newProject")
                this.onProjectCombo(null, new Animate.ProjectBrowserEvent(Animate.ProjectBrowserEvents.COMBO, "Create New"));
            else
                this.onProjectCombo(null, new Animate.ProjectBrowserEvent(Animate.ProjectBrowserEvents.COMBO, "Open"));
        };
        /**
        * This is called when we click a button on the message box.
        * @param {any} response
        */
        Splash2.prototype.onCopyMessageBox = function (response) {
            //this.enableButtons(true);
            if (response == "Yes")
                Animate.User.get.copyProject(this.projectBrowser.selectedID);
        };
        /**
        * This is called when we click a button on the message box.
        * @param {any} response
        */
        Splash2.prototype.onMessageBox = function (response) {
            //this.enableButtons(true);
            if (response == "Yes")
                Animate.User.get.deleteProject(this.projectBrowser.selectedID);
        };
        /**
        * This is called when we click a button on the message box.
        * @param {any} response
        */
        Splash2.prototype.onFinalMessageBox = function (response) {
            //this.enableButtons(true);
            if (response == "Yes") {
                this.hide();
                Animate.Application.getInstance().projectReady();
            }
        };
        /**
        * This is called when we receive data from the projects.
        */
        Splash2.prototype.onProjectData = function (response, data, sender) {
            var user = Animate.User.get;
            user.off(Animate.UserEvents.PROJECT_CREATED, this.onProjectData, this);
            user.off(Animate.UserEvents.FAILED, this.onProjectData, this);
            user.off(Animate.UserEvents.PROJECT_OPENED, this.onProjectData, this);
            if (response == Animate.UserEvents.FAILED) {
                //this.projectError.text = data.message;
                //this.projectError.element.show();
                //this.enableButtons(true);
                return;
            }
            if (response == Animate.UserEvents.PROJECT_OPENED) {
                //this.welcomeBackground.element.animate({ left: '-=800' }, this.slideTime, this.animateProxy);
                //this.welcomeBackground.animate({ left: '-=800' }, this.slideTime);
                //this.pluginsBackground.element.animate({ left: '-=800' }, this.slideTime, this.animateProxy);
                //this.pluginsBackground.element.animate({ left: '-=800' }, this.slideTime);
                //this.$activePane = "final";
                this.pluginBrowser.reset();
            }
            else {
                //Project created - go to plugins screen!		
                //this.newProjectBackground.element.animate({ left: '-=800' }, this.slideTime, this.animateProxy);
                //this.pluginsBackground.element.animate({ left: '-=800' }, this.slideTime, this.animateProxy);
                //this.newProjectBackground.element.animate({ left: '-=800' }, this.slideTime);
                //this.newProjectBackground.animate({ left: '-=800' }, this.slideTime);
                //this.pluginsBackground.element.animate({ left: '-=800' }, this.slideTime);
                this.$activePane = "plugins";
                this.pluginBrowser.reset();
            }
        };
        /**
        * This is called when we receive data from the projects.
        * @param {any} response
        * @param {any} data >
        */
        Splash2.prototype.onPluginResponse = function (response, event) {
            if (response == Animate.PluginBrowserEvents.PLUGINS_IMPLEMENTED) {
                //Go to final screen
                this.pluginLoader.updateDependencies();
                //this.pluginsBackground.element.animate({ left: '-=800' }, this.slideTime, this.animateProxy);
                //this.finalScreen.element.animate({ left: '-=800' }, this.slideTime, this.animateProxy);
                //this.pluginsBackground.element.animate({ left: '-=800' }, this.slideTime);
                //this.finalScreen.element.animate({ left: '-=800' }, this.slideTime);
                this.$activePane = "final";
                this.pluginLoader.startLoading();
            }
            else {
            }
        };
        /**
        * This is called when we receive data from the projects.
        * @param {ProjectLoaderEvents} response
        * @param {ProjectLoaderEvent} data
        */
        Splash2.prototype.onProjectLoaderResponse = function (response, event) {
            if (response == Animate.ProjectLoaderEvents.READY) {
                //All loaded! Lets finally get into the app :)
                this.finalButton.enabled = true;
                this.finalButton.text = "Let's Go!";
                //No problems so just continue and start the app
                this.hide();
                Animate.Application.getInstance().projectReady();
            }
            else {
                this.finalError.element.fadeIn();
                this.finalError.text = event.message;
            }
        };
        /**
        * When we receive data from the server
        */
        //onUserData(response: UserEvents, event : UserEvent)
        //{
        //if ( ( response == UserEvents.FAILED || response == UserEvents.LOGGED_IN || response == UserEvents.REGISTERED ) && event.return_type != AnimateLoaderResponses.SUCCESS )
        //{
        //Recaptcha.reload();
        //MessageBox.show( event.message, ["Ok"], null, null );
        //}
        //LOG OUT
        //this.enableButtons(true);
        //if (response == UserEvents.LOGGED_OUT && event.return_type == AnimateLoaderResponses.SUCCESS)
        //{
        //this.projectBrowser.enabled = false;
        //this.projectBrowser.clearItems();
        //Remove links and create normal login section
        //jQuery(".logout-link", this.userBoxDetails.element).unbind();
        //this.closeButton.element.hide();
        //this.userBoxDetails.element.remove();
        //this.userBoxDetails = new Component("<div class='details'><span class='hyperlink login-link'>Login</span></div><div class='details'><span class='hyperlink register-link'>Register</span></div><div class='fix'></div>", this.userBox);
        //jQuery(".login-link", this.userBoxDetails.element).click(this.clickProxy);
        //jQuery(".register-link", this.userBoxDetails.element).click(this.clickProxy);
        //	return;
        //}
        //LOG IN
        //if (response == UserEvents.LOGGED_IN && event.return_type == AnimateLoaderResponses.SUCCESS)
        //{
        //	this.projectBrowser.enabled = true;
        //	//this.closeButton.element.show();
        //	//Remove links and create normal login section
        //	//jQuery(".login-link", this.userBoxDetails.element).unbind();
        //	//jQuery(".register-link", this.userBoxDetails.element).unbind();
        //             var user = User.get;
        //             Compiler.digest(this.welcomeBackground, this);
        //	//this.userBoxDetails.element.remove();
        //	//this.userBoxDetails = new Component("<div class='details'>" + user.username + "</div><div class='details'><div class='hyperlink logout-link'>Logout</div></div><div class='fix'></div>", this.userBox);
        //	//jQuery(".logout-link", this.userBoxDetails.element).click(this.clickProxy);
        //	//Fill project list
        //	user.downloadProjects();
        //	//Go back to main window
        //             //this.loginBack.element.trigger("click");
        //             jQuery(".splash-login-user .close-but").trigger("click");
        //	return;
        //}
        //if (response == UserEvents.PROJECT_DELETED)
        //{
        //	if (event.return_type == AnimateLoaderResponses.ERROR )
        //		MessageBox.show(event.message, ["Ok"], null, null );
        //Refresh the projects
        //	User.get.downloadProjects();
        //	return;
        //}
        //else if ( ( response == UserEvents.PROJECT_COPIED ) && event.return_type == AnimateLoaderResponses.SUCCESS )
        //	User.get.downloadProjects();
        //FILL PROJECTS LIST
        //else if ((response == UserEvents.PROJECTS_RECIEVED) && event.return_type == AnimateLoaderResponses.SUCCESS)
        //{
        //	this.projectBrowser.fill( event.tag )
        //}
        //this.loginError.element.show();
        //this.loginError.text = event.message;
        //this.$loginError = event.message;
        //Compiler.digest(this.welcomeBackground, this);
        //}
        Splash2.prototype.onUserLoggedInCheck = function () {
            //User.get.removeEventListener( UserEvents.LOGGED_IN, this.onUserLoggedInCheck, this );
            //User.get.addEventListener( UserEvents.LOGGED_IN, this.onUserData, this );
            //User.get.addEventListener( UserEvents.LOGGED_OUT, this.onUserData, this );
            //User.get.addEventListener( UserEvents.FAILED, this.onUserData, this );
            //User.get.addEventListener( UserEvents.REGISTERED, this.onUserData, this );
            //User.get.addEventListener( UserEvents.PASSWORD_RESET, this.onUserData, this );
            //User.get.addEventListener( UserEvents.ACTIVATION_RESET, this.onUserData, this );
            //User.get.addEventListener( UserEvents.PROJECTS_RECIEVED, this.onUserData, this );
            //User.get.addEventListener( UserEvents.PROJECT_COPIED, this.onUserData, this );
            //User.get.addEventListener( UserEvents.PROJECT_DELETED, this.onUserData, this );
            this.initialized = true;
            this.createNewProjectPage();
            this.createWelcomePage();
            this.createLoginPage();
            this.createPluginsPage();
            this.createFinalScreen();
        };
        /**
        * Shows the window by adding it to a parent.
        */
        Splash2.prototype.show = function () {
            _super.prototype.show.call(this, null, 0, 0, true);
            this.onWindowResized(null);
            if (this.initialized == false) {
                var that = this;
                Animate.User.get.authenticated().then(function (loggedIn) {
                    that.onUserLoggedInCheck();
                    that.refreshProjects();
                    Animate.Compiler.digest(that.welcomeBackground, that);
                }).fail(function (err) {
                    Animate.MessageBox.show(err.message, ["Ok"], null, null);
                });
            }
            else
                jQuery("img", this.userImg.element).attr("src", Animate.User.get.meta.image);
        };
        Object.defineProperty(Splash2, "get", {
            /**
            * Gets the singleton reference of this class.
            * @returns {Splash}
            */
            get: function () {
                if (!Splash2._singleton)
                    new Splash2();
                return Splash2._singleton;
            },
            enumerable: true,
            configurable: true
        });
        return Splash2;
    })(Animate.Window);
    Animate.Splash2 = Splash2;
})(Animate || (Animate = {}));
var Animate;
(function (Animate) {
    /**
    * The splash screen when starting the app
    */
    var Splash = (function () {
        /**
        * Creates an instance of the splash screen
        */
        function Splash(app) {
            this._app = app;
            this._captureInitialized = false;
            this._splashElm = jQuery("#splash").remove().clone();
            this._loginElm = jQuery("#log-reg").remove().clone();
            this._welcomeElm = jQuery("#splash-welcome").remove().clone();
            this._newProject = jQuery("#splash-new-project").remove().clone();
            this._loadingProject = jQuery("#splash-loading-project").remove().clone();
            this.$user = Animate.User.get;
            this.$activePane = "loading";
            this.$errorMsg = "";
            this.$errorRed = true;
            this.$loading = false;
            this.$projects = [];
            this.$plugins = __plugins;
            this.$selectedPlugins = [];
            this.$selectedProject = null;
            this.$pager = new Animate.PageLoader(this.fetchProjects.bind(this));
            // Create a random theme for the splash screen
            if (Math.random() < 0.4)
                this.$theme = { "welcome-blue": true };
            else
                this.$theme = { "welcome-pink": true };
            // Add the elements
            jQuery("#splash-view", this._splashElm).prepend(this._loginElm);
            jQuery("#splash-view", this._splashElm).prepend(this._welcomeElm);
            jQuery("#splash-view", this._splashElm).prepend(this._newProject);
            jQuery("#splash-view", this._splashElm).prepend(this._loadingProject);
        }
        /*
        * Shows the splash screen
        */
        Splash.prototype.show = function () {
            var that = this;
            that._app.element.detach();
            jQuery("body").append(that._splashElm);
            jQuery("#en-login-username", that._loginElm).val("");
            that.$loading = true;
            if (!that._captureInitialized) {
                that._captureInitialized = true;
                // Build each of the templates
                Animate.Compiler.build(this._loginElm, this);
                Animate.Compiler.build(this._welcomeElm, this);
                Animate.Compiler.build(this._newProject, this);
                Animate.Compiler.build(this._loadingProject, this);
                Animate.Compiler.build(this._splashElm, this);
                Recaptcha.create("6LdiW-USAAAAAGxGfZnQEPP2gDW2NLZ3kSMu3EtT", document.getElementById("animate-captcha"), { theme: "white" });
            }
            else {
                Animate.Compiler.digest(this._splashElm, that, true);
                Recaptcha.reload();
            }
            that.$user.authenticated().done(function (val) {
                that.$loading = false;
                if (!val)
                    that.goState("login", true);
                else
                    that.goState("welcome", true);
            }).fail(function (err) {
                that.$loading = false;
                that.goState("login", true);
            });
        };
        /*
        * Gets the dimensions of the splash screen based on the active pane
        */
        Splash.prototype.splashDimensions = function () {
            if (this.$activePane == "login" || this.$activePane == "register" || this.$activePane == "loading-project")
                return { "compact": true, "wide": false };
            else
                return { "compact": false, "wide": true };
        };
        /*
        * Goes to pane state
        * @param {string} state The name of the state
        * @param {boolean} digest If true, the page will revalidate
        */
        Splash.prototype.goState = function (state, digest) {
            if (digest === void 0) { digest = false; }
            var that = this;
            that.$activePane = state;
            that.$errorMsg = "";
            if (state == "welcome")
                this.fetchProjects(this.$pager.index, this.$pager.limit);
            else if (state == "new-project") {
                this.$errorMsg = "Give your project a name and select the plugins you woud like to use";
                this.$errorRed = false;
            }
            if (digest)
                Animate.Compiler.digest(that._splashElm, that, true);
        };
        /*
        * Removes the selected project if confirmed by the user
        * @param {string} messageBoxAnswer The messagebox confirmation/denial from the user
        */
        Splash.prototype.removeProject = function (messageBoxAnswer) {
            if (messageBoxAnswer == "No")
                return;
            var that = this;
            this.$user.removeProject(this.$selectedProject._id).done(function () {
                that.$projects.splice(that.$projects.indexOf(that.$selectedProject), 1);
                that.$selectedProject = null;
                Animate.Compiler.digest(that._welcomeElm, that);
            }).fail(function (err) {
                Animate.MessageBox.show(err.message);
            });
        };
        /*
        * Loads the selected project
        * @param {IProject} project The project to load
        */
        Splash.prototype.openProject = function (project) {
            var that = this;
            var numLoaded = 0;
            that.$loading = true;
            //Notif of the reset
            Animate.Application.getInstance().projectReset();
            // Start Loading the plugins            
            that.goState("loading-project", true);
            // Go through each plugin and load it
            for (var i = 0, l = project.$plugins.length; i < l; i++)
                Animate.PluginManager.getSingleton().loadPlugin(project.$plugins[i]).fail(function (err) {
                    that.$errorMsg = err.message;
                }).always(function () {
                    Animate.Compiler.digest(that._splashElm, that, true);
                    // Check if all plugins are loaded
                    numLoaded++;
                    if (numLoaded >= project.$plugins.length) {
                        // Everything loaded - so prepare the plugins
                        for (var t = 0, tl = project.$plugins.length; t < tl; t++)
                            Animate.PluginManager.getSingleton().preparePlugin(project.$plugins[t]);
                        // Load the scene in and get everything ready
                        that.loadScene();
                    }
                });
        };
        Splash.prototype.loadScene = function () {
            var project = this.$user.project;
            project.entry = this.$selectedProject;
            Animate.Toolbar.getSingleton().newProject();
            Animate.CanvasTab.getSingleton().projectReady();
            Animate.TreeViewScene.getSingleton().projectReady();
            //project.load();
            // Make sure the title tells us which project is open
            document.title = 'Animate: p' + project.entry._id + " - " + project.entry.name;
            Animate.Logger.getSingleton().logMessage("Project '" + this.$selectedProject.name + "' has been opened", null, Animate.LogType.MESSAGE);
            // Attach the DOM
            this._splashElm.detach();
            Animate.Application.bodyComponent.addChild(Animate.Application.getInstance());
        };
        /*
        * Fetches a list of user projects
        * @param {number} index
        * @param {number} limit
        */
        Splash.prototype.fetchProjects = function (index, limit) {
            var that = this;
            that.$loading = true;
            that.$errorMsg = "";
            that.$selectedProject = null;
            Animate.Compiler.digest(that._splashElm, that);
            that.$user.getProjectList(that.$pager.index, that.$pager.limit).then(function (projects) {
                that.$pager.last = projects.count || 1;
                that.$projects = projects.data;
            }).fail(function (err) {
                that.$errorMsg = err.message;
            }).done(function () {
                that.$loading = false;
                Animate.Compiler.digest(that._splashElm, that);
                Animate.Compiler.digest(that._welcomeElm, that);
            });
        };
        /*
        * Called when we select a project
        * @param {IProject} The project to select
        */
        Splash.prototype.selectProject = function (project) {
            if (this.$selectedProject)
                this.$selectedProject.selected = false;
            project.selected = true;
            if (this.$selectedProject != project)
                this.$selectedProject = project;
            else {
                this.$selectedProject.selected = false;
                this.$selectedProject = null;
            }
        };
        /*
        * Called when we select a project
        * @param {IPlugin} The plugin to select
        */
        Splash.prototype.selectPlugin = function (plugin) {
            // If this plugin is not selected
            if (this.$selectedPlugins.indexOf(plugin) == -1) {
                // Make sure if another version is selected, that its de-selected
                for (var i = 0, l = this.$selectedPlugins.length; i < l; i++)
                    if (this.$selectedPlugins[i].name == plugin.name) {
                        this.$selectedPlugins.splice(i, 1);
                        break;
                    }
                this.$selectedPlugins.push(plugin);
            }
            else
                this.$selectedPlugins.splice(this.$selectedPlugins.indexOf(plugin), 1);
            // Set the active selected plugin
            if (this.$selectedPlugins.length > 0)
                this.$selectedPlugin = this.$selectedPlugins[this.$selectedPlugins.length - 1];
            else
                this.$selectedPlugin = null;
        };
        /*
        * Toggles if a plugin should show all its versions or not
        * @param {IPlugin} The plugin to toggle
        */
        Splash.prototype.showVersions = function (plugin) {
            for (var n in this.$plugins)
                for (var i = 0, l = this.$plugins[n].length; i < l; i++) {
                    if (this.$plugins[n][i].name == plugin.name) {
                        this.$plugins[n][i].$showVersions = !this.$plugins[n][i].$showVersions;
                    }
                }
        };
        /*
        * Checks if a plugin is selected
        * @param {IPlugin} The plugin to check
        */
        Splash.prototype.isPluginSelected = function (plugin) {
            if (this.$selectedPlugins.indexOf(plugin) != -1)
                return true;
            else
                return false;
        };
        /*
        * Called by the app when everything needs to be reset
        */
        Splash.prototype.reset = function () {
        };
        /**
        * Given a form element, we look at if it has an error and based on the expression. If there is we set
        * the login error message
        * @param {EngineForm} The form to check.
        * @param {boolean} True if there is an error
        */
        Splash.prototype.reportError = function (form) {
            if (!form.$error)
                this.$errorMsg = "";
            else {
                var name = form.$errorInput;
                name = name.charAt(0).toUpperCase() + name.slice(1);
                switch (form.$errorExpression) {
                    case "alpha-numeric":
                        this.$errorMsg = name + " must only contain alphanumeric characters";
                        break;
                    case "email-plus":
                        this.$errorMsg = name + " must only contain alphanumeric characters or a valid email";
                        break;
                    case "non-empty":
                        this.$errorMsg = name + " cannot be empty";
                        break;
                    case "email":
                        this.$errorMsg = name + " must be a valid email";
                        break;
                    case "alpha-numeric-plus":
                        this.$errorMsg = name + " must only contain alphanumeric characters and '-', '!', or '_'";
                        break;
                    case "no-html":
                        this.$errorMsg = name + " must not contain any html";
                        break;
                    default:
                        this.$errorMsg = "";
                        break;
                }
            }
            if (this.$activePane == "new-project" && this.$selectedPlugins.length == 0)
                this.$errorMsg = "Please choose at least 1 plugin to work with";
            if (this.$activePane == "register") {
                this.$regCaptcha = jQuery("#recaptcha_response_field").val();
                this.$regChallenge = jQuery("#recaptcha_challenge_field").val();
                if (this.$regCaptcha == "")
                    this.$errorMsg = "Please enter the capture code";
            }
            if (this.$errorMsg == "") {
                this.$errorRed = false;
                return false;
            }
            else {
                this.$errorRed = true;
                return true;
            }
        };
        /**
        * Creates a new user project
        * @param {EngineForm} The form to check.
        * @param {boolean} True if there is an error
        */
        Splash.prototype.newProject = function (name, description, plugins) {
            var that = this;
            that.$loading = true;
            that.$errorRed = false;
            that.$errorMsg = "Just a moment while we hatch your appling...";
            Animate.Compiler.digest(this._splashElm, this, false);
            var ids = plugins.map(function (value) { return value._id; });
            this.$user.newProject(name, ids, description).then(function (data) {
                that.$loading = false;
                that.$errorRed = false;
                that.$errorMsg = "";
                that.$selectedProject = data.data;
                that.$projects.push(data.data);
                // Start Loading the plugins
                that.openProject(that.$selectedProject);
            }).fail(function (err) {
                that.$errorRed = true;
                that.$errorMsg = err.message;
                that.$loading = false;
                Animate.Compiler.digest(that._splashElm, that, true);
            });
        };
        /*
        * General error handler
        */
        Splash.prototype.loginError = function (err) {
            this.$loading = false;
            this.$errorRed = true;
            this.$errorMsg = err.message;
            Animate.Compiler.digest(this._loginElm, this);
            Animate.Compiler.digest(this._splashElm, this);
        };
        /*
        * General success handler
        */
        Splash.prototype.loginSuccess = function (data) {
            if (data.error)
                this.$errorRed = true;
            else
                this.$errorRed = false;
            this.$loading = false;
            this.$errorMsg = data.message;
            Animate.Compiler.digest(this._splashElm, this, true);
        };
        /**
        * Attempts to log the user in
        * @param {string} user The username
        * @param {string} password The user password
        * @param {boolean} remember Should the user cookie be saved
        */
        Splash.prototype.login = function (user, password, remember) {
            var that = this;
            that.$loading = true;
            this.$user.login(user, password, remember)
                .then(function (data) {
                if (data.error)
                    that.$errorRed = true;
                else
                    that.$errorRed = false;
                that.$errorMsg = data.message;
            })
                .fail(this.loginError.bind(that))
                .done(function () {
                that.$loading = false;
                if (that.$user.isLoggedIn)
                    that.goState("welcome", true);
                else
                    Animate.Compiler.digest(that._splashElm, that, true);
            });
        };
        /**
        * Attempts to register a new user
        * @param {string} user The username of the user.
        * @param {string} password The password of the user.
        * @param {string} email The email of the user.
        * @param {string} captcha The captcha of the login screen
        * @param {string} captha_challenge The captha_challenge of the login screen
        */
        Splash.prototype.register = function (user, password, email, captcha, challenge) {
            var that = this;
            that.$loading = true;
            this.$user.register(user, password, email, captcha, challenge)
                .then(this.loginSuccess.bind(that))
                .fail(function (err) {
                that.$errorRed = true;
                that.$errorMsg = err.message;
                that.$loading = false;
                Recaptcha.reload();
                Animate.Compiler.digest(that._loginElm, that);
                Animate.Compiler.digest(that._splashElm, that);
            });
        };
        /**
        * Attempts to resend the activation code
        * @param {string} user The username or email of the user to resend the activation
        */
        Splash.prototype.resendActivation = function (user) {
            var that = this;
            if (!user) {
                this.$errorMsg = "Please specify a username or email to fetch";
                jQuery("form[name='register'] input[name='username'], form[name='register'] input[name='email']", this._loginElm).each(function (index, elem) {
                    this.$error = true;
                });
                Animate.Compiler.digest(that._loginElm, that);
                Animate.Compiler.digest(that._splashElm, that);
                return;
            }
            that.$loading = true;
            this.$user.resendActivation(user)
                .then(this.loginSuccess.bind(that))
                .fail(this.loginError.bind(that));
        };
        /**
        * Attempts to reset the users password
        * @param {string} user The username or email of the user to resend the activation
        */
        Splash.prototype.resetPassword = function (user) {
            var that = this;
            if (!user) {
                this.$errorMsg = "Please specify a username or email to fetch";
                jQuery("form[name='register'] input[name='username'], form[name='register'] input[name='email']", this._loginElm).each(function (index, elem) {
                    this.$error = true;
                });
                Animate.Compiler.digest(that._loginElm, that);
                Animate.Compiler.digest(that._splashElm, that);
                return;
            }
            that.$loading = true;
            this.$user.resetPassword(user)
                .then(this.loginSuccess.bind(that))
                .fail(this.loginError.bind(that));
        };
        /**
        * Attempts to resend the activation code
        */
        Splash.prototype.logout = function () {
            var that = this;
            that.$loading = true;
            this.$user.logout().then(function () {
                that.$loading = false;
                that.$errorMsg = "";
            })
                .fail(this.loginError.bind(that))
                .always(function () {
                Animate.Application.getInstance().projectReset();
                that.$loading = false;
                that.goState("login", true);
            });
        };
        /**
        * Initializes the spash screen
        * @returns {Splash}
        */
        Splash.init = function (app) {
            Splash._singleton = new Splash(app);
            return Splash._singleton;
        };
        Object.defineProperty(Splash, "get", {
            /**
            * Gets the singleton reference of this class.
            * @returns {Splash}
            */
            get: function () {
                return Splash._singleton;
            },
            enumerable: true,
            configurable: true
        });
        return Splash;
    })();
    Animate.Splash = Splash;
})(Animate || (Animate = {}));
var __plugins = {};
var __newPlugin = null;
/**
* Goes through each of the plugins and returns the one with the matching ID
* @param {string} id The ID of the plugin to fetch
*/
function getPluginByID(id) {
    for (var pluginName in __plugins) {
        for (var i = 0, l = __plugins[pluginName].length; i < l; i++)
            if (__plugins[pluginName][i]._id == id)
                return __plugins[pluginName][i];
    }
    return null;
}
/**
* Once the plugins are loaded from the DB
* @param {Array<Engine.IPlugin>} plugins
*/
function onPluginsLoaded(plugins) {
    for (var i = 0, l = plugins.length; i < l; i++) {
        if (!__plugins[plugins[i].name])
            __plugins[plugins[i].name] = [];
        else
            continue;
        var pluginArray = __plugins[plugins[i].name];
        for (var ii = 0; ii < l; ii++)
            if (plugins[ii].name == plugins[i].name)
                pluginArray.push(plugins[ii]);
        // Sort the plugins based on their versions
        pluginArray = pluginArray.sort(function compare(a, b) {
            if (a === b)
                return 0;
            var a_components = a.version.split(".");
            var b_components = b.version.split(".");
            var len = Math.min(a_components.length, b_components.length);
            // loop while the components are equal
            for (var i = 0; i < len; i++) {
                // A bigger than B
                if (parseInt(a_components[i]) > parseInt(b_components[i]))
                    return 1;
                // B bigger than A
                if (parseInt(a_components[i]) < parseInt(b_components[i]))
                    return -1;
            }
            // If one's a prefix of the other, the longer one is greater.
            if (a_components.length > b_components.length)
                return 1;
            if (a_components.length < b_components.length)
                return -1;
            // Otherwise they are the same.
            return 0;
        });
    }
    // Create the application element
    var app = new Animate.Application("#application");
    // Initialize the splash instance
    Animate.Splash.init(app);
    // Show Splash screen
    Animate.Splash.get.show();
}
/**
* Returns a formatted byte string
* @returns {string}
*/
function byteFilter(bytes, precision) {
    if (isNaN(parseFloat(bytes)) || !isFinite(bytes))
        return '-';
    if (typeof precision === 'undefined')
        precision = 1;
    var units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'], number = Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, Math.floor(number))).toFixed(precision) + ' ' + units[number];
}
// Once the document is ready we begin
jQuery(document).ready(function () {
    // Make sure we call ajax with credentials on
    jQuery.ajaxSetup({
        crossDomain: true,
        xhrFields: { withCredentials: true }
    });
    var that = this;
    // Show the loading animation
    Animate.LoaderBase.showLoader();
    // Donwload the plugins available to this user
    jQuery.getJSON(Animate.DB.API + "/plugins").done(function (response) {
        onPluginsLoaded(response.data);
    }).fail(function (err) {
        Animate.MessageBox.show("An error occurred while connecting to the server. " + err.status + ": " + err.responseText, ["Ok"], null, null);
    }).always(function () {
        Animate.LoaderBase.hideLoader();
    });
});
/// <reference path="./definitions/node.d.ts" />
/// <reference path="./definitions/express.d.ts" />
/// <reference path="./definitions/jquery.d.ts" />
/// <reference path="./definitions/jqueryui.d.ts" />
/// <reference path="./definitions/jquery.scrollTo.d.ts" />
/// <reference path="./definitions/JSColor.d.ts" />
/// <reference path="./definitions/AceEditor.d.ts" />
/// <reference path="./definitions/es6-promise.d.ts" />
/// <reference path="./definitions/FileUploader.d.ts" />
/// <reference path="./definitions/Recaptcha.d.ts" />
/// <reference path="./definitions/ExportToken.d.ts" />
/// <reference path="./definitions/es6-promise.d.ts" />
/// <reference path="../source-server/definitions/webinate-users.d.ts" />
/// <reference path="../source-server/definitions/modepress-api.d.ts" />
/// <reference path="../source-server/custom-definitions/app-engine.d.ts" />
/// <reference path="lib/core/Compiler.ts" />
/// <reference path="lib/core/Enums.ts" />
/// <reference path="lib/core/EventDispatcher.ts" />
/// <reference path="lib/core/UserPlan.ts" />
/// <reference path="lib/core/EditorEvents.ts" />
/// <reference path="lib/core/AssetClass.ts" />
/// <reference path="lib/core/Utils.ts" />
/// <reference path="lib/core/BehaviourManager.ts" />
/// <reference path="lib/core/PluginManager.ts" />
/// <reference path="lib/core/ImportExport.ts" />
/// <reference path="lib/core/PropertyGridEditor.ts" />
/// <reference path="lib/core/Asset.ts" />
/// <reference path="lib/core/AssetClass.ts" />
/// <reference path="lib/core/AssetTemplate.ts" />
/// <reference path="lib/core/BehaviourContainer.ts" />
/// <reference path="lib/core/BehaviourDefinition.ts" />
/// <reference path="lib/core/DataToken.ts" />
/// <reference path="lib/core/CanvasToken.ts" />
/// <reference path="lib/core/DB.ts" />
/// <reference path="lib/core/File.ts" />
/// <reference path="lib/core/interfaces/IComponent.ts" />
/// <reference path="lib/core/interfaces/IPlugin.ts" />
/// <reference path="lib/core/interfaces/ICanvasItem.ts" />
/// <reference path="lib/core/interfaces/IComponent.ts" />
/// <reference path="lib/core/interfaces/IDockItem.ts" />
/// <reference path="lib/core/interfaces/ISettingsPage.ts" />
/// <reference path="lib/core/loaders/LoaderBase.ts" />
/// <reference path="lib/core/loaders/AnimateLoader.ts" />
/// <reference path="lib/core/loaders/BinaryLoader.ts" />
/// <reference path="lib/core/PropertyGridEditor.ts" />
/// <reference path="lib/core/PortalTemplate.ts" />
/// <reference path="lib/core/Project.ts" />
/// <reference path="lib/core/TypeConverter.ts" />
/// <reference path="lib/core/Utils.ts" />
/// <reference path="lib/core/User.ts" />
/// <reference path="lib/core/PageLoader.ts" />
/// <reference path="lib/gui/layouts/ILayout.ts" />
/// <reference path="lib/gui/layouts/Percentile.ts" />
/// <reference path="lib/gui/layouts/Fill.ts" />
/// <reference path="lib/gui/TooltipManager.ts" />
/// <reference path="lib/gui/Component.ts" />
/// <reference path="lib/gui/Docker.ts" />
/// <reference path="lib/gui/SplitPanel.ts" />
/// <reference path="lib/gui/Window.ts" />
/// <reference path="lib/gui/ContextMenu.ts" />
/// <reference path="lib/gui/Portal.ts" />
/// <reference path="lib/gui/Tab.ts" />
/// <reference path="lib/gui/Label.ts" />
/// <reference path="lib/gui/Button.ts" />
/// <reference path="lib/gui/InputBox.ts" />
/// <reference path="lib/gui/Group.ts" />
/// <reference path="lib/gui/Checkbox.ts" />
/// <reference path="lib/gui/LabelVal.ts" />
/// <reference path="lib/gui/InputBox.ts" />
/// <reference path="lib/gui/ListViewItem.ts" />
/// <reference path="lib/gui/ListViewHeader.ts" />
/// <reference path="lib/gui/ListView.ts" />
/// <reference path="lib/gui/List.ts" />
/// <reference path="lib/gui/ComboBox.ts" />
/// <reference path="lib/gui/MenuList.ts" />
/// <reference path="lib/gui/Application.ts" />
/// <reference path="lib/gui/Behaviour.ts" />
/// <reference path="lib/gui/BehaviourPortal.ts" />
/// <reference path="lib/gui/BehaviourShortcut.ts" />
/// <reference path="lib/gui/BehaviourAsset.ts" />
/// <reference path="lib/gui/BehaviourComment.ts" />
/// <reference path="lib/gui/BehaviourPicker.ts" />
/// <reference path="lib/gui/BehaviourInstance.ts" />
/// <reference path="lib/gui/BehaviourScript.ts" />
/// <reference path="lib/gui/UserPreferences.ts" />
/// <reference path="lib/gui/PluginBrowser.ts" />
/// <reference path="lib/gui/ProjectLoader.ts" />
/// <reference path="lib/gui/ProjectBrowser.ts" />
/// <reference path="lib/gui/TreeView.ts" />
/// <reference path="lib/gui/TreeNode.ts" />
/// <reference path="lib/gui/TreeNodeAssetClass.ts" />
/// <reference path="lib/gui/TreeNodeAssetInstance.ts" />
/// <reference path="lib/gui/TreeNodeBehaviour.ts" />
/// <reference path="lib/gui/TreeNodeGroup.ts" />
/// <reference path="lib/gui/TreeNodeGroupInstance.ts" />
/// <reference path="lib/gui/TreeNodePluginBehaviour.ts" />
/// <reference path="lib/gui/Canvas.ts" />
/// <reference path="lib/gui/Link.ts" />
/// <reference path="lib/gui/TabPair.ts" />
/// <reference path="lib/gui/CanvasTabPair.ts" />
/// <reference path="lib/gui/HTMLTab.ts" />
/// <reference path="lib/gui/CSSTab.ts" />
/// <reference path="lib/gui/ScriptTab.ts" />
/// <reference path="lib/gui/SceneTab.ts" />
/// <reference path="lib/gui/PropertyGridGroup.ts" />
/// <reference path="lib/gui/property-editors/PropTextbox.ts" />
/// <reference path="lib/gui/property-editors/PropNumber.ts" />
/// <reference path="lib/gui/property-editors/PropComboBool.ts" />
/// <reference path="lib/gui/property-editors/PropComboEnum.ts" />
/// <reference path="lib/gui/property-editors/PropFile.ts" />
/// <reference path="lib/gui/property-editors/PropOptionsWindow.ts" />
/// <reference path="lib/gui/property-editors/PropComboGroup.ts" />
/// <reference path="lib/gui/property-editors/PropComboAsset.ts" />
/// <reference path="lib/gui/property-editors/PropAssetList.ts" />
/// <reference path="lib/gui/property-editors/PropColorPicker.ts" />
/// <reference path="lib/gui/PropertyGrid.ts" />
/// <reference path="lib/gui/toolbar-buttons/ToolBarButton.ts" />
/// <reference path="lib/gui/toolbar-buttons/ToolbarNumber.ts" />
/// <reference path="lib/gui/toolbar-buttons/ToolbarColorPicker.ts" />
/// <reference path="lib/gui/toolbar-buttons/ToolbarDropDown.ts" />
/// <reference path="lib/gui/forms/OkCancelForm.ts" />
/// <reference path="lib/gui/forms/BuildOptionsForm.ts" />
/// <reference path="lib/gui/forms/FileViewerForm.ts" />
/// <reference path="lib/gui/forms/MessageBox.ts" />
/// <reference path="lib/gui/forms/NewBehaviourForm.ts" />
/// <reference path="lib/gui/forms/PortalForm.ts" />
/// <reference path="lib/gui/forms/RenameForm.ts" />
/// <reference path="lib/gui/forms/UserPrivilegesForm.ts" />
/// <reference path="lib/gui/CanvasTab.ts" />
/// <reference path="lib/gui/CanvasContext.ts" />
/// <reference path="lib/gui/Logger.ts" />
/// <reference path="lib/gui/ToolBar.ts" />
/// <reference path="lib/gui/TreeViewScene.ts" />
/// <reference path="lib/gui/forms/Splash.ts" />
/// <reference path="lib/gui/splash/Splash.ts" />
/// <reference path="lib/gui/Application.ts" />
/// <reference path="lib/Main.ts" /> 
