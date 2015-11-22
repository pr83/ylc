var jsep = require('jsep'),
    errorUtil = require('./errorUtil'),
    sanityCheck = require('./sanityCheck');

jsep.addBinaryOp("|||", 10);
jsep.addBinaryOp("#", 10);
jsep.addBinaryOp("@", 10);

module.exports = {};

module.exports.newContext = function newContext(model, controller, controllerMethods, loopVariables, loopStatuses) {

    var my = {
            model: model,
            controller: controller,
            controllerMethods: controllerMethods,
            loopVariables: loopVariables || {},
            loopStatuses: loopStatuses || {}
        },
        that = {};

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
                    throw errorUtil.createError("Invalid model variable: " + strName);
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

        if (my.controllerMethods[functionName]) {
            parentObject = my.controller;
            fn = my.controllerMethods[functionName].code;

        } else if (my.model[functionName] instanceof Function) {
            parentObject = my.model;
            fn = my.model[functionName];

        } else {
            throw errorUtil.createError("Function not found: " + functionName);
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

                sanityCheck.checkArraySanity(objectValue);

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
                sanityCheck.checkArraySanity(objectValue);
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
                    throw errorUtil.createError(
                        "The '@' operator can only be used on arrays, null and undefined."
                    );

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
                    throw errorUtil.createError(
                        "The '@' operator can only be used on arrays, null and undefined."
                    );
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

                sanityCheck.checkObjectSanity(objectValue);

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
                    throw errorUtil.createError(
                        "Left hand side of the '.' operator must be an object."
                    );
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
                    throw errorUtil.createError(
                        "Left hand side of the '#' operator must be an object, null or undefined."
                    );

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
                    throw errorUtil.createError(
                        "Left hand side of the '#' operator must be an object, null or undefined."
                    );
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
            throw errorUtil.createError("Invalid expression." );
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
            throw errorUtil.createError("Loop variable '" + strLoopVariableName + "' is already used.");
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
                throw errorUtil.createError(
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

    that.getLoopVariablesSnapshot = function () {
        return $.extend(true, {}, my.loopVariables);
    };

    that.getLoopStatusesSnapshot = function () {
        return $.extend(true, {}, my.loopStatuses);
    };

    that.newWithOverriddenLoops = function (loopVariables, loopStatuses) {
        return module.exports.newContext(
            my.model,
            my.controller,
            my.controllerMethods,
            loopVariables,
            loopStatuses
        );
    };

    return that;

};