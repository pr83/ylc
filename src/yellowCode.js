/*jslint browser: true, devel: true, continue: true */
/*global jsep: false */

(function ($) {

    "use strict";

    var MAPPING_BIDIRECTIONAL = ":",
        MAPPING_V2M_ONLY = "->",
        MAPPING_V2M_ONLY_FORCED = "=>",
        MAPPING_M2V_ONLY = "<-";

    var PREFIELD = {},
        jsep = require('jsep');

    // ad hoc operators
    jsep.addBinaryOp("|||", 10);
    jsep.addBinaryOp("#", 10);
    jsep.addBinaryOp("@", 10);


    function createError(message, element) {
        var errorObject = new Error(message);
        errorObject.element = element;
        return errorObject;
    }

    function elementToError(error, element) {
        error.element = element;
        return error;
    }

    function printError(error) {
        if (typeof console === 'object') {
            console.error(error);
            if (error.element !== undefined) {
                console.log(error.element);
            }
            console.log("\n");
        }
    }

    function assert(condition, message) {
        if (!condition) {
            throw createError("Assertion failed: " + message);
        }
    }

    function isEmpty(string) {
        return $.trim(string).length === 0;
    }

    /*
     * "Context" class.
     */
    function newContext(model, controller) {

        var my = {
                model: model,
                controller: controller,
                loopVariables: {},
                loopStatuses: {}
            },
            that = {
            };

        /*
         * PRIVATE FUNCTIONS:
         */

        function hasValue(value) {
            return (value !== undefined) && (value !== null);
        }

        function gsVariable(strName, valueToSet, adHocValue, forceSet) {

            var valueToReturn,
                arrCollection,
                index;

            if (my.loopVariables[strName] !== undefined) {
                arrCollection = my.loopVariables[strName].underlyingCollection;
                index = my.loopVariables[strName].index;

                if (valueToSet === undefined) {
                    valueToReturn = arrCollection[index];

                } else {
                    arrCollection[index] = valueToSet;
                }

            } else if (my.loopStatuses[strName] !== undefined) {
                if (valueToSet === undefined) {
                    valueToReturn =  my.loopStatuses[strName];
                }

            } else if (hasValue(my.model[strName])) {
                if (valueToSet === undefined) {
                    valueToReturn = my.model[strName];
                } else {
                    my.model[strName] = valueToSet;
                }

            } else {
                if (adHocValue !== undefined) {
                    return (my.model[strName] = adHocValue);

                } else if (valueToSet !== undefined) {
                    if (forceSet) {
                        my.model[strName] = valueToSet;
                    } else {
                        throw createError("Invalid model variable: " + strName);
                    }
                }
            }

            return valueToReturn;

        }

        function calculateBinary(leftValue, operator, rightValue) {

            switch (operator) {
            case "+":
                return leftValue + rightValue;

            case "-":
                return leftValue - rightValue;

            case "*":
                return leftValue * rightValue;

            case "/":
                return leftValue / rightValue;

            case "%":
                return leftValue % rightValue;

            case "<":
                return leftValue < rightValue;

            case "<=":
                return leftValue <= rightValue;

            case ">":
                return leftValue > rightValue;

            case ">=":
                return leftValue >= rightValue;

            case "===":
                return leftValue === rightValue;

            case "==":
                return leftValue === rightValue;

            case "!==":
                return leftValue !== rightValue;

            case "!=":
                return leftValue !== rightValue;

            case "&&":
                return leftValue && rightValue;

            case "||":
                return leftValue || rightValue;

            }
        }

        function calculateUnary(operator, argument) {

            switch (operator) {

            case "+":
                return argument;

            case "-":
                return -argument;

            case "!":
                return !argument;

            }
        }

        function callFunction(functionName, functionArguments) {
            var parentObject,
                fn,
                evaluatedArguments = [],
                idxArgument;

            if (my.controller[functionName] instanceof Function) {
                parentObject = my.controller;
                fn = my.controller[functionName];

            } else if (my.model[functionName] instanceof Function) {
                parentObject = my.model;
                fn = my.model[functionName];

            } else {
                throw createError("Function not found: " + functionName);
            }

            for (idxArgument = 0; idxArgument < functionArguments.length; idxArgument += 1) {
                evaluatedArguments.push(gsAstValue(functionArguments[idxArgument]));
            }

            return fn.apply(parentObject, evaluatedArguments);
        }

        var AST_EVALUATORS = [

            // literal
            {
                condition: function(ast) {
                    return ast.type === "Literal";
                },

                getter: function (ast) {
                    return ast.value;
                }
            },

            // variable name
            {
                condition: function(ast) {
                    return ast.type === "Identifier";
                },

                getter: function(ast, adHocValue) {
                    return gsVariable(ast.name, undefined, adHocValue);
                },

                setter: function(ast, value, forceSet) {
                    gsVariable(ast.name, value, undefined, forceSet);
                }
            },

            // referring to an array member, e.g. "myArray[x + 3]"
            {
                condition: function(ast) {
                    return ast.type === "MemberExpression" && ast.computed;
                },

                getter: function (ast, adHocValue) {
                    var objectValue = gsAstValue(ast.object),
                        indexValue = gsAstValue(ast.property);

                    if (!$.isArray(objectValue)) {
                        throw createError("The [] operator can only be used on arrays.");
                    }

                    if (hasValue(objectValue[indexValue])) {
                        return objectValue[indexValue];

                    } else if (adHocValue !== undefined) {
                        return (objectValue[indexValue] = adHocValue);

                    } else {
                        return undefined;
                    }
                },

                setter: function(ast, value, forceSet) {
                    var objectValue = gsAstValue(ast.object, undefined, forceSet ? [] : undefined),
                        indexValue = gsAstValue(ast.property);

                    if (!$.isArray(objectValue)) {
                        throw createError("The [] operator can only be used on arrays.");
                    }

                    objectValue[indexValue] = value;
                }
            },

            // referring to an array member using and ad hoc operator, e.g. "myArray@(x + 3)"
            {
                condition: function(ast) {
                    return ast.type === "BinaryExpression" && ast.operator === "@";
                },

                getter: function (ast, adHocValue) {
                    var array =
                            gsAstValue(
                                ast.left,
                                undefined,
                                adHocValue !== undefined ? [] : undefined
                            ),
                        indexValue = gsAstValue(ast.right);

                    if (array === undefined) {
                        return undefined;

                    } else if (array === null) {
                        return null;

                    } else if (!$.isArray(array)) {
                        throw createError("The '@' operator can only be used on arrays, null and undefined.");

                    } else {

                        if (!hasValue(array[indexValue]) && (adHocValue !== undefined)) {
                            array[indexValue] = adHocValue;
                        }

                        return array[indexValue];

                    }
                },

                setter: function(ast, value) {
                    var array = gsAstValue(ast.left, undefined, []);
                    if (!$.isArray(array)) {
                        throw createError("The '@' operator can only be used on arrays, null and undefined.");
                    }
                    array[gsAstValue(ast.right)] = value;
                }
            },

            // referring to an object member, e.g. "myObj.x"
            {
                condition: function(ast) {
                    return ast.type === "MemberExpression" && !(ast.computed);
                },

                getter: function (ast, adHocValue) {
                    var objectValue = gsAstValue(ast.object),
                        propertyName = ast.property.name;

                    if (!$.isPlainObject(objectValue)) {
                        throw createError("Left hand side of the '.' operator must be an object.");
                    }

                    if (hasValue(objectValue[ast.property.name])) {
                        return objectValue[propertyName];

                    } else if (adHocValue !== undefined) {
                        return (objectValue[propertyName] = adHocValue);

                    } else {
                        return undefined;
                    }
                },

                setter: function(ast, value, forceSet) {
                    var objectValue = gsAstValue(ast.object, undefined, forceSet ? {} : undefined),
                        propertyName = ast.property.name;

                    if (!(objectValue instanceof Object)) {
                        throw createError("Left hand side of the '.' operator must be an object.");
                    }

                    objectValue[propertyName] = value;
                }
            },

            // referring to an object member where the object can be null, e.g. "myObj#x"
            {
                condition: function(ast) {
                    return ast.type === "BinaryExpression" &&
                        ast.operator === "#" &&
                        ast.right &&
                        ast.right.type === "Identifier";
                },

                getter: function (ast, adHocValue) {

                    var objectValue =
                            gsAstValue(
                                ast.left,
                                undefined,
                                adHocValue !== undefined ? {} : undefined
                            ),
                        propertyName = ast.right.name;

                    if (objectValue === undefined) {
                        return undefined;

                    } else if (objectValue === null) {
                        return null;

                    } else if (!$.isPlainObject(objectValue)) {
                        throw createError("Left hand side of the '#' operator must be an object, null or undefined.");

                    } else {
                        if (!hasValue(objectValue[propertyName]) && (adHocValue !== undefined)) {
                            objectValue[propertyName] = adHocValue;
                        }

                        return objectValue[propertyName];
                    }
                },

                setter: function(ast, value) {
                    var objectValue = gsAstValue(ast.left, undefined, {});
                    if (!$.isPlainObject(objectValue)) {
                        throw createError("Left hand side of the '#' operator must be an object, null or undefined.");
                    }
                    objectValue[ast.right.name] = value;
                }
            },

            // coalescence operator, e.g. "astCanBeNull ||| 'N/A'"
            {
                condition: function(ast) {
                    return ast.type === "BinaryExpression" && ast.operator === "|||";
                },
                getter: function(ast, adHocValue) {
                    var leftValue;

                    if (adHocValue === undefined) {
                        leftValue = gsAstValue(ast.left);
                        return hasValue(leftValue) ? leftValue : gsAstValue(ast.right);

                    } else {
                        return gsAstValue(ast.left, undefined, gsAstValue(ast.right));

                    }
                },
                setter: function(ast, value) {
                    gsAstValue(ast.left, value, undefined, true);
                }
            },

            // binary expression, including logical operators, e.g. "num + 1" or "a || b"
            {
                condition: function(ast) {
                    return ast.type === "BinaryExpression" || ast.type === "LogicalExpression";
                },
                getter: function(ast) {
                    return calculateBinary(
                        gsAstValue(ast.left),
                        ast.operator,
                        gsAstValue(ast.right)
                    );
                }
            },

            // unary expression, e.g. "-x"
            {
                condition: function(ast) {
                    return ast.type === "UnaryExpression";
                },
                getter: function(ast) {
                    return calculateUnary(
                        ast.operator,
                        gsAstValue(ast.argument)
                    );
                }
            },

            // ternary operator, e.g. "(a === 1) ? b : c"
            {
                condition: function(ast) {
                    return ast.type === "ConditionalExpression";
                },
                getter: function(ast) {
                    return gsAstValue(ast.test) ?
                        gsAstValue(ast.consequent) : gsAstValue(ast.alternate);
                }
            },

            // calling a function, e.g. "myFn(a, b, 2, 3)"
            {
                condition: function(ast) {
                    return ast.type === "CallExpression";
                },
                getter: function(ast) {
                    return callFunction(ast.callee.name, ast.arguments);
                }
            }
        ];

        function gsAstValue(ast, valueToSet, adHocValue, forceSet) {

            var evaluatorIndex,
                currentEvaluator,
                matchingEvaluator,
                valueToReturn;

            for (evaluatorIndex = 0; evaluatorIndex < AST_EVALUATORS.length; evaluatorIndex += 1) {
                currentEvaluator = AST_EVALUATORS[evaluatorIndex];
                if (currentEvaluator.condition.call(currentEvaluator, ast)) {
                    matchingEvaluator = currentEvaluator;
                    break;
                }
            }

            if (!matchingEvaluator) {
                throw createError("Invalid expression." );
            }

            if (valueToSet === undefined) {
                return matchingEvaluator.getter.call(currentEvaluator, ast, adHocValue);

            } else if (matchingEvaluator.setter) {
                matchingEvaluator.setter.call(currentEvaluator, ast, valueToSet, forceSet);
            }

            /*
             * If the setter doesn't exist for the given expression type, don't do anything.
             * It means the expression is not a L-value, so we just ignore the write.
             */

        }

        function gsExpressionValue(strExpression, value, forceSet) {
            var ast = jsep(strExpression);
            return gsAstValue(ast, value, undefined, forceSet);
        }

        /*
         * PUBLIC FUNCTIONS:
         */

        /*
         * enterIteration:
         */
        that.enterIteration = function (
            strLoopVariableName,
            arrCollection,
            strStatusVariableName,
            intIndex
        ) {

            var bLoopVariableUsed,
                bStatusVariableUsed;

            // setting loop variable

            bLoopVariableUsed =
                my.loopVariables[strLoopVariableName] !== undefined ||
                my.loopStatuses[strLoopVariableName] !== undefined;

            if (bLoopVariableUsed) {
                throw createError("Loop variable '" + strLoopVariableName + "' is already used.");
            }

            my.loopVariables[strLoopVariableName] = {
                underlyingCollection: arrCollection,
                index: intIndex
            };


            // setting status variable

            if (strStatusVariableName !== undefined) {

                bStatusVariableUsed =
                    my.loopStatuses[strStatusVariableName] !== undefined ||
                    my.loopVariables[strStatusVariableName] !== undefined;

                if (bStatusVariableUsed) {
                    throw createError(
                        "Loop status variable '" + strStatusVariableName + "' is already used."
                    );
                }

                my.loopStatuses[strStatusVariableName] = {index: intIndex};
            }
        };


        /*
         * exitIteration:
         */
        that.exitIteration = function (
            strLoopVariableName,
            strStatusVariableName
        ) {
            my.loopVariables[strLoopVariableName] = undefined;
            if (strStatusVariableName !== undefined) {
                my.loopStatuses[strStatusVariableName] = undefined;
            }
        };

        /*
         * getValue:
         */
        that.getValue = function (strExpression) {
            return gsExpressionValue(strExpression);
        };

        /*
         * setValue:
         */
        that.setValue = function (strExpression, value, forceSet) {
            gsExpressionValue(strExpression, value, forceSet);
        };

        that.newWithEmptyLoopVariables = function () {
            return newContext(my.model, my.controller);
        };

        that.getModel = function () {
            return my.model;
        };

        that.getLoopStatusesSnapshot = function () {
            return $.extend(true, {}, my.loopStatuses);
        };

        return that;

    }


    // utility functions

    function strGetData(jqElement, strDataParameterName) {
        return jqElement.attr("data-" + strDataParameterName);
    }


    // parameter parsers

    function poke(strSearchIn, intSearchAt, arrSearchFor) {
        var strSearchFor,
            idxSearchFor;

        for (idxSearchFor = 0; idxSearchFor < arrSearchFor.length; idxSearchFor += 1) {
            strSearchFor = arrSearchFor[idxSearchFor];
            if (strSearchIn.substr(intSearchAt, strSearchFor.length) === strSearchFor) {
                return strSearchFor;
            }
        }

        return "";

    }

    function pokeMappingOperator(strYlcBind, index) {
        return poke(
            strYlcBind,
            index,
            [
                MAPPING_BIDIRECTIONAL,
                MAPPING_V2M_ONLY,
                MAPPING_V2M_ONLY_FORCED,
                MAPPING_M2V_ONLY
            ]
        );
    }

    function readPropertyAndSubproperty(strYlcBind, index, sbPropertyAndSubproperty) {

        while (index < strYlcBind.length && pokeMappingOperator(strYlcBind, index) === "") {

            if (strYlcBind[index] === "\\" && index + 1 < strYlcBind.length) {
                sbPropertyAndSubproperty.push(strYlcBind[index + 1]);
                index += 2;

            } else {
                sbPropertyAndSubproperty.push(strYlcBind[index]);
                index += 1;
            }

        }

        if (index === strYlcBind.length) {
            throw createError("Premature end of binding expression: " + strYlcBind);
        }

        return index;
    }

    function readExpression(strYlcBind, index, sbExpression) {
        var bInsideQuotes = false,
            bInsideDoubleQuotes = false,
            char;

        while (index < strYlcBind.length &&
                (strYlcBind[index] !== ";" || bInsideQuotes || bInsideDoubleQuotes)) {

            char = strYlcBind[index];

            if (!bInsideQuotes && !bInsideDoubleQuotes && /\s/.test(char)) {
                sbExpression.push(" ");
            } else {
                sbExpression.push(char);
            }

            if (char === "'" && !bInsideDoubleQuotes) {
                bInsideQuotes = !bInsideQuotes;
            } else if (char === "\"" && !bInsideQuotes) {
                bInsideDoubleQuotes = !bInsideDoubleQuotes;
            }

            index += 1;
        }

        return index;
    }

    function pushBinding(sbPropertyAndSubproperty, sbExpression, strMappingOperator, result) {

        var strPropertyAndSubproperty = $.trim(sbPropertyAndSubproperty.join("")),
            strPropertyName,
            strSubpropertyName;

        if (strPropertyAndSubproperty.indexOf(".") < 0) {
            strPropertyName = strPropertyAndSubproperty;
            strSubpropertyName = undefined;

        } else {
            strPropertyName = $.trim(strPropertyAndSubproperty.split(".")[0]);
            strSubpropertyName = $.trim(strPropertyAndSubproperty.split(".")[1]);
        }

        result.push({
            strPropertyName: strPropertyName,
            strSubpropertyName: strSubpropertyName,
            strMappingOperator: strMappingOperator,
            strBindingExpression: $.trim(sbExpression.join(""))
        });

    }

    function parseYlcBind(strYlcBind) {

        if (!strYlcBind) {
            return [];
        }

        var result = [],
            index = 0,
            sbPropertyAndSubproperty,
            strMappingOperator,
            sbExpression;

        while (index < strYlcBind.length) {

            sbPropertyAndSubproperty = [];
            index = readPropertyAndSubproperty(strYlcBind, index, sbPropertyAndSubproperty);

            strMappingOperator = pokeMappingOperator(strYlcBind, index);
            index += strMappingOperator.length;

            sbExpression = [];
            index = readExpression(strYlcBind, index, sbExpression);

            pushBinding(sbPropertyAndSubproperty, sbExpression, strMappingOperator, result);

            if (strYlcBind[index] === ";") {
                index += 1;
            }

            // skip trailing white space
            while (index < strYlcBind.length && /\s/.test(strYlcBind[index])) {
                index += 1;
            }

        }

        return result;

    }

    function parseYlcLoop(strYlcLoop) {

        var throwException = function () {
                throw createError(
                    "Invalid format of the data-ylcLoop parameter: " + strYlcLoop
                );
            },
            arrParts = strYlcLoop.split(":"),
            strLoopAndStatusVariables,
            strCollectionName,
            strLoopVariable,
            strStatusVariable,
            arrLoopAndStatusParts;

        if (arrParts.length !== 2) {
            throwException();
        }

        strLoopAndStatusVariables = $.trim(arrParts[0]);
        strCollectionName = $.trim(arrParts[1]);

        if (!strLoopAndStatusVariables || !strCollectionName) {
            throwException();
        }

        if (strLoopAndStatusVariables.indexOf(",") < 0) {
            strLoopVariable = strLoopAndStatusVariables;

        } else {
            arrLoopAndStatusParts = strLoopAndStatusVariables.split(",");
            if (arrLoopAndStatusParts.length !== 2) {
                throwException();
            }
            strLoopVariable = $.trim(arrLoopAndStatusParts[0]);
            strStatusVariable = $.trim(arrLoopAndStatusParts[1]);
        }

        return {
            strLoopVariable: strLoopVariable,
            strStatusVariable: strStatusVariable,
            strCollectionName: strCollectionName
        };
    }

    function parseYlcEvents(strYlcEvents) {
        if (!strYlcEvents) {
            return [];
        }

        var result = [],
            arrEvents = strYlcEvents.split(";"),
            index,

            strEvent,
            arrParts,
            strEventName,
            strMethodName;

        for (index = 0; index < arrEvents.length; index += 1) {
            strEvent = $.trim(arrEvents[index]);

            if (strEvent) {
                arrParts = strEvent.split(":");
                if (arrParts.length !== 2) {
                    throw createError(
                        "Invalid format of the data-ylcEvents parameter: " + strYlcEvents
                    );
                }

                strEventName = $.trim(arrParts[0]);
                strMethodName = $.trim(arrParts[1]);

                result.push({
                    strEventName: strEventName,
                    strMethodName: strMethodName
                });

            }
        }

        return result;
    }


    // manipulating YLC special elements properties

    function isDynamicallyGenerated(domElement) {
        var jqElement = $(domElement);
        return jqElement.hasClass("_ylcDynamicallyGenerated") ||
            jqElement.attr("data-_ylcDynamicallyGenerated") === "true";
    }

    function isTemplate(domElement) {
        var jqElement = $(domElement),
            strYlcLoop = strGetData(jqElement, "ylcLoop"),
            strIf = strGetData(jqElement, "ylcIf");

        return (strYlcLoop || strIf) ?
                !isDynamicallyGenerated(domElement) :
                false;
    }

    function jqCreateElementFromTemplate(jqTemplate) {
        var jqClone = jqTemplate.clone();
        jqClone.addClass("_ylcDynamicallyGenerated");
        jqClone.removeAttr("data-_ylcViewRoot");
        jqClone.attr("data-_ylcDynamicallyGenerated", "true");

        return jqClone;
    }


    // propagating changes of view into model

    function v2mSetValues(context, domView, domElement) {

        var jqElement = $(domElement),
            strYlcBind = strGetData(jqElement, "ylcBind"),
            arrYlcBind = parseYlcBind(strYlcBind),
            idxYlcBind,
            currentYlcBinding,
            fnGetter,
            value,
            forceSet;

        for (idxYlcBind = 0; idxYlcBind < arrYlcBind.length; idxYlcBind += 1) {
            currentYlcBinding = arrYlcBind[idxYlcBind];

            if (currentYlcBinding.strMappingOperator !== MAPPING_BIDIRECTIONAL &&
                    currentYlcBinding.strMappingOperator !== MAPPING_V2M_ONLY &&
                    currentYlcBinding.strMappingOperator !== MAPPING_V2M_ONLY_FORCED) {
                continue;
            }

            forceSet = currentYlcBinding.strMappingOperator === MAPPING_V2M_ONLY_FORCED;

            if (isEmpty(currentYlcBinding.strPropertyName)) {
                value = jqElement.get();

            } else {
                fnGetter = jqElement[currentYlcBinding.strPropertyName];

                if (!fnGetter instanceof Function) {
                    throw createError(
                        "Cannot find jQuery getter/setter called '" +
                            currentYlcBinding.strPropertyName + "'.",
                        domView
                    );
                }

                if (currentYlcBinding.strSubpropertyName === undefined) {
                    value = fnGetter.call(jqElement);
                } else {
                    value = fnGetter.call(jqElement, currentYlcBinding.strSubpropertyName);
                }
            }

            try {
                context.setValue(currentYlcBinding.strBindingExpression, value, forceSet);

            } catch (err) {
                throw elementToError(err, domElement);
            }
        }
    }

    function getGeneratedElements(jqTemplate) {
        var domarrResult = [],
            jqCurrentSibling;

        jqCurrentSibling = jqTemplate;

        while (true) {
            jqCurrentSibling = jqCurrentSibling.next();

            if (jqCurrentSibling.get() === undefined || !isDynamicallyGenerated(jqCurrentSibling)) {
                break;
            }

            domarrResult.push(jqCurrentSibling.get());
        }

        return domarrResult;
    }

    function checkIterable(arrCollection) {
        if (!(arrCollection instanceof Array)) {
            throw createError(
                "Attempt to iterate through a non-array value: " +
                    arrCollection
            );
        }
    }

    function v2mProcessDynamicElements(
        context,
        domView,
        jqTemplate,
        controller
    ) {

        var strYlcLoop = strGetData(jqTemplate, "ylcLoop"),
            strYlcIf = strGetData(jqTemplate, "ylcIf");

        if (strYlcLoop && strYlcIf) {
            throw createError(
                "An element contains both data-ylcLoop and data-ylcIf.",
                jqTemplate.get()
            );
        }

        if (strYlcLoop) {
            return v2mProcessDynamicLoopElements(
                context,
                domView,
                jqTemplate,
                controller
            );
        }

        if (strYlcIf) {
            return v2mProcessDynamicIfElements(
                context,
                domView,
                jqTemplate,
                controller
            );
        }

        assert(false);

    }

    function v2mProcessElement(context, domView, domElement, controller) {
        var nElementsProcessed;

        if (isTemplate(domElement)) {
            nElementsProcessed = v2mProcessDynamicElements(
                context,
                domView,
                $(domElement),
                controller
            );

        } else if (domElement !== domView && $(domElement).attr("data-_ylcViewRoot") === "true") {
            nElementsProcessed = 1;

        } else {
            v2mSetValues(context, domView, domElement);
            v2mProcessChildren(context, domView, domElement, controller);
            nElementsProcessed = 1;
        }

        return nElementsProcessed;
    }

    function v2mProcessDynamicLoopElements(
        context,
        domView,
        jqTemplate,
        controller
    ) {
        var idxWithinDynamicallyGenerated,
            ylcLoop = parseYlcLoop(strGetData(jqTemplate, "ylcLoop")),
            arrCollection = context.getValue(ylcLoop.strCollectionName),
            domarrGeneratedElements = getGeneratedElements(jqTemplate),
            domDynamicallyGeneratedElement,
            nProcessed;

        checkIterable(arrCollection);

        for (idxWithinDynamicallyGenerated = 0;
                idxWithinDynamicallyGenerated < domarrGeneratedElements.length;
                idxWithinDynamicallyGenerated += 1) {

            domDynamicallyGeneratedElement =
                domarrGeneratedElements[idxWithinDynamicallyGenerated];

            context.enterIteration(
                ylcLoop.strLoopVariable,
                arrCollection,
                ylcLoop.strStatusVariable,
                idxWithinDynamicallyGenerated
            );

            nProcessed =
                v2mProcessElement(
                    context,
                    domView,
                    domDynamicallyGeneratedElement,
                    controller
                );
            assert(
                nProcessed === 1,
                "A template can't be a dynamically generated element."
            );

            context.exitIteration(
                ylcLoop.strLoopVariable,
                ylcLoop.strStatusVariable
            );
        }

        return domarrGeneratedElements.length + 1;
    }

    function v2mProcessDynamicIfElements(
        context,
        domView,
        jqTemplate,
        controller
    ) {
        var domarrCurrentGeneratedElements = getGeneratedElements(jqTemplate);

        if (domarrCurrentGeneratedElements.length > 0) {
            assert(domarrCurrentGeneratedElements.length === 1);
            v2mProcessElement(
                context,
                domView,
                domarrCurrentGeneratedElements[0],
                controller
            );
        }

        return domarrCurrentGeneratedElements.length + 1;
    }

    function v2mProcessChildren(context, domView, domElement, controller) {
        var jqDomElement = $(domElement),
            jqsetChildren = jqDomElement.children(),
            index = 0,
            domChild;

        while (index < jqsetChildren.length) {
            domChild = jqsetChildren[index];
            index += v2mProcessElement(context, domView, domChild, controller);
        }
    }


    // propagating changes of model into view

    function m2vSetValues(context, domElement) {
        var jqElement = $(domElement),
            strYlcBind = strGetData(jqElement, "ylcBind"),
            arrYlcBind = parseYlcBind(strYlcBind),

            index,
            currentYlcBinding,
            fnSetter,
            value;

        for (index = 0; index < arrYlcBind.length; index += 1) {
            currentYlcBinding = arrYlcBind[index];

            if (currentYlcBinding.strMappingOperator !== MAPPING_BIDIRECTIONAL &&
                    currentYlcBinding.strMappingOperator !== MAPPING_M2V_ONLY) {
                continue;
            }

            // an empty property maps straight to the DOM element, which is read only
            if (isEmpty(currentYlcBinding.strPropertyName)) {
                continue;
            }

            fnSetter = jqElement[currentYlcBinding.strPropertyName];
            if (!(fnSetter instanceof Function)) {
                throw createError(
                    "Cannot find jQuery getter/setter called '" +
                        currentYlcBinding.strPropertyName + "'.",
                    domElement
                );
            }

            try {
                value = context.getValue(currentYlcBinding.strBindingExpression);

            } catch (err) {
                throw elementToError(err, domElement);
            }

            if (value !== PREFIELD) {
                if (currentYlcBinding.strSubpropertyName === undefined) {
                    fnSetter.call(jqElement, value);

                } else {
                    fnSetter.call(jqElement, currentYlcBinding.strSubpropertyName, value);
                }
            }

        }

    }

    function processCommonElements(
        context,
        domView,
        controller,
        ylcLoop,
        domarrCurrentGeneratedElements,
        arrCollection,
        commonLength
    ) {
        var index = 0,
            domGeneratedElement;

        while (index < commonLength) {
            domGeneratedElement = domarrCurrentGeneratedElements[index];

            context.enterIteration(
                ylcLoop.strLoopVariable,
                arrCollection,
                ylcLoop.strStatusVariable,
                index
            );

            index +=
                m2vProcessElement(
                    context,
                    domView,
                    domGeneratedElement,
                    controller,
                    false
                );

            context.exitIteration(ylcLoop.strLoopVariable, ylcLoop.strStatusVariable);
        }
    }

    function addExtraElements(
        context,
        domView,
        controller,
        ylcLoop,
        jqTemplate,
        domarrCurrentGeneratedElements,
        arrCollection,
        commonLength
    ) {

        var jqLastCommonElement,
            jqLastElement,

            index,
            jqNewDynamicElement,
            elementsProcessed;

        if (commonLength === 0) {
            jqLastCommonElement = jqTemplate;
        } else {
            jqLastCommonElement = $(domarrCurrentGeneratedElements[commonLength - 1]);
        }

        jqLastElement = jqLastCommonElement;
        for (index = commonLength; index < arrCollection.length; index += 1) {

            jqNewDynamicElement = jqCreateElementFromTemplate(jqTemplate);

            context.enterIteration(
                ylcLoop.strLoopVariable,
                arrCollection,
                ylcLoop.strStatusVariable,
                index
            );

            elementsProcessed =
                m2vProcessElement(context, domView, jqNewDynamicElement.get(), controller, true);
            assert(
                elementsProcessed === 1,
                "If an element is dynamically generated, it can't be a template."
            );

            context.exitIteration(ylcLoop.strLoopVariable, ylcLoop.strStatusVariable);

            jqLastElement.after(jqNewDynamicElement);
            jqLastElement = jqNewDynamicElement;

        }
    }

    function m2vProcessDynamicLoopElements(
        context,
        domView,
        jqTemplate,
        controller,
        strYlcLoop
    ) {

        var ylcLoop = parseYlcLoop(strYlcLoop),
            domarrCurrentGeneratedElements =
                getGeneratedElements(jqTemplate),
            arrCollection = context.getValue(ylcLoop.strCollectionName),
            commonLength,
            idxFirstToDelete,
            index;

        checkIterable(arrCollection);

        commonLength =
            Math.min(arrCollection.length, domarrCurrentGeneratedElements.length);

        processCommonElements(
            context,
            domView,
            controller,
            ylcLoop,
            domarrCurrentGeneratedElements,
            arrCollection,
            commonLength
        );

        if (arrCollection.length > commonLength) {
            addExtraElements(
                context,
                domView,
                controller,
                ylcLoop,
                jqTemplate,
                domarrCurrentGeneratedElements,
                arrCollection,
                commonLength
            );
        }

        if (domarrCurrentGeneratedElements.length > commonLength) {
            idxFirstToDelete = arrCollection.length;
            for (index = idxFirstToDelete;
                    index < domarrCurrentGeneratedElements.length;
                    index += 1) {
                $(domarrCurrentGeneratedElements[index]).remove();
            }
        }

        return domarrCurrentGeneratedElements.length + 1;
    }

    function m2vProcessDynamicIfElements(
        context,
        domView,
        jqTemplate,
        controller,
        strYlcIf
    ) {
        var ifExpressionValue = context.getValue(strYlcIf),
            domarrCurrentGeneratedElements = getGeneratedElements(jqTemplate),
            jqNewDynamicElement,
            nElementsProcessed;

        if (ifExpressionValue && domarrCurrentGeneratedElements.length === 0) {
            jqNewDynamicElement = jqCreateElementFromTemplate(jqTemplate);


            nElementsProcessed =
                m2vProcessElement(context, domView, jqNewDynamicElement.get(), controller, true);
            assert(
                nElementsProcessed === 1,
                "If an element is dynamically generated, it can't be a template."
            );

            jqTemplate.after(jqNewDynamicElement);

        } else if (domarrCurrentGeneratedElements.length > 0) {
            if (ifExpressionValue) {
                nElementsProcessed =
                    m2vProcessElement(
                        context,
                        domView,
                        domarrCurrentGeneratedElements[0],
                        controller,
                        false
                    );

            } else {
                assert(domarrCurrentGeneratedElements.length === 1);
                $(domarrCurrentGeneratedElements[0]).remove();
            }

        }

        return domarrCurrentGeneratedElements.length + 1;

    }

    function m2vProcessDynamicElements(
        context,
        domView,
        jqTemplate,
        controller
    ) {

        var strYlcLoop = strGetData(jqTemplate, "ylcLoop"),
            strYlcIf = strGetData(jqTemplate, "ylcIf");

        if (strYlcLoop && strYlcIf) {
            throw createError(
                "An element can't contain both data-ylcLoop and data-ylcIf. " +
                    "Please use an embedded DIV.",
                jqTemplate.get()
            );
        }

        if (strYlcLoop) {
            return m2vProcessDynamicLoopElements(
                context,
                domView,
                jqTemplate,
                controller,
                strYlcLoop
            );
        }

        if (strYlcIf) {
            return m2vProcessDynamicIfElements(
                context,
                domView,
                jqTemplate,
                controller,
                strYlcIf
            );
        }

        assert(false);
    }

    function m2vProcessChildren(
        context,
        domView,
        domElement,
        controller,
        bBindEvents
    ) {

        var jqElement = $(domElement),
            jqsetChildren = jqElement.children(),

            index,
            domChild;

        index = 0;

        while (index < jqsetChildren.length) {
            domChild = jqsetChildren[index];

            try {

                index +=
                    m2vProcessElement(
                        context,
                        domView,
                        domChild,
                        controller,
                        bBindEvents
                    );

            } catch (err) {
                throw elementToError(err, domChild);
            }
        }

    }

    function callModelUpdatingMethod(
        context,
        publicContext,
        domView,
        controller,
        fnUpdateMethod
    ) {

        var returnValue;

        try {

            v2mProcessElement(
                context.newWithEmptyLoopVariables(),
                domView,
                domView,
                controller
            );

            returnValue = fnUpdateMethod.call(controller, context.getModel(), publicContext);

            m2vProcessElement(
                context.newWithEmptyLoopVariables(),
                domView,
                domView,
                controller,
                false
            );

        } catch (error) {
            printError(error);
        }

        return returnValue;

    }

    function createPublicContext(context, domView, domElement, controller) {
        var publicContext = {};

        publicContext.PREFIELD = PREFIELD;

        publicContext.domElement = domElement;
        publicContext.loopStatuses = context.getLoopStatusesSnapshot();
        publicContext.updateModel = function (fnUpdateMethod) {
            return callModelUpdatingMethod(
                context,
                publicContext,
                domView,
                controller,
                fnUpdateMethod
            );
        };

        return publicContext;
    }

    function createHandler(context, publicContext, domView, controller, fnHandler) {
        return function (eventObject) {
            publicContext.eventObject = eventObject;
            return callModelUpdatingMethod(
                context,
                publicContext,
                domView,
                controller,
                fnHandler
            );
        };
    }

    function m2vBindEvents(context, domView, domElement, controller) {
        var jqElement = $(domElement),
            strYlcEvents = strGetData(jqElement, "ylcEvents"),
            arrYlcEvents = parseYlcEvents(strYlcEvents),

            index,
            currentYlcEvent,
            fnHandler,
            publicContext;

        for (index = 0; index < arrYlcEvents.length; index += 1) {
            currentYlcEvent = arrYlcEvents[index];
            fnHandler = controller[currentYlcEvent.strMethodName];

            if (!(fnHandler instanceof Function)) {
                throw createError(
                    "Event handler '" + currentYlcEvent.strMethodName + "', " +
                        "specified for event '" + currentYlcEvent.strEventName + "', " +
                        "is not a function.",
                    domElement
                );
            }

            publicContext =
                createPublicContext(context, domView, domElement, controller);

            if (currentYlcEvent.strEventName === "ylcElementInitialized") {
                fnHandler.call(controller, context.getModel(), publicContext);
            }

            jqElement.bind(
                currentYlcEvent.strEventName,
                createHandler(context, publicContext, domView, controller, fnHandler)
            );
        }

    }

    function m2vProcessElement(context, domView, domElement, controller, bBindEvents) {
        var nElementsProcessed;


        if (isTemplate(domElement)) {
            nElementsProcessed = m2vProcessDynamicElements(
                context,
                domView,
                $(domElement),
                controller
            );

        } else if (domElement !== domView && $(domElement).attr("data-_ylcViewRoot") === "true") {
            nElementsProcessed = 1;

        } else {
            if (bBindEvents) {
                m2vBindEvents(context, domView, domElement, controller);
            }
            m2vSetValues(context, domElement);
            $(domElement).removeClass("ylcInvisibleTemplate");
            m2vProcessChildren(context, domView, domElement, controller, bBindEvents);

            nElementsProcessed = 1;
        }



        return nElementsProcessed;
    }

    function init(domView, controller) {
        var model = {},
            context = newContext(model, controller);

        if (controller.init instanceof Function) {
            controller.init.call(
                controller,
                model,
                createPublicContext(context, domView, domView, controller)
            );
        }

        $(domView).find(":not([data-ylcIf=''])").addClass("ylcInvisibleTemplate");
        $(domView).find(":not([data-ylcLoop=''])").addClass("ylcInvisibleTemplate");
        $(domView).attr("data-_ylcViewRoot", "true");

        m2vProcessElement(
            context,
            domView,
            domView,
            controller,
            true
        );

        return context;

    }

    function getProperties(object) {
        var result = [],
            property;

        for (property in object) {
            if (object.hasOwnProperty(property)) {
                result.push(property);
            }
        }

        return result;
    }

    function createAdapter(context, domView, controller) {

        var adapter = {},
            controllerMethodNames = getProperties(controller),
            adapterMethodArguments;

        $.each(controllerMethodNames, function (idxProperty, currentMethodName) {
            var currentControllerMethod = controller[currentMethodName];

            if (currentControllerMethod instanceof Function) {
                adapter[currentMethodName] = function () {

                    var returnValue;

                    adapterMethodArguments = [context.getModel(), context];
                    $.each(arguments, function (index, argument) {
                        adapterMethodArguments.push(argument);
                    });

                    returnValue = currentControllerMethod.apply(controller, adapterMethodArguments);

                    m2vProcessElement(
                        context.newWithEmptyLoopVariables(),
                        domView,
                        domView,
                        controller,
                        false
                    );

                    return returnValue;
                };
            }

        });

        return adapter;
    }

    function processExternalEvent(context, domView, controller, communicationObject) {
        if (communicationObject.eventName === "getAdapter") {
            communicationObject.result = createAdapter(context, domView, controller);
        }
    }

    function registerYlcExternalEvent(context, domView, controller) {
        $(domView).bind(
            "_ylcExternalEvent",
            function (event, communicationObject) {
                processExternalEvent(context, domView, controller, communicationObject);
                return false;
            }
        );
    }

    function triggerExternalEvent(domView, eventName, parameter) {

        var communicationObject = {
            eventName: eventName,
            parameter: parameter,
            result: undefined
        };

        $(domView).trigger("_ylcExternalEvent", communicationObject);

        return communicationObject.result;
    }

    $.fn.yellowCode = function (parameter1, parameter2, parameter3) {

        var domView = this,
            controller,
            context,
            objectToReturn;

        try {

            if (parameter1 instanceof Object) {
                controller = parameter1;
                context = init(this, controller);
                registerYlcExternalEvent(context, domView, controller);

                if (typeof parameter2 === "string") {
                    objectToReturn = triggerExternalEvent(domView, parameter2, parameter3);

                } else {
                    objectToReturn = this;
                }

            } else if (typeof parameter1 === "string") {
                objectToReturn = triggerExternalEvent(domView, parameter1, parameter2);
            }

            return objectToReturn;

        } catch (error) {
            printError(error);
        }
    };

}(jQuery));
