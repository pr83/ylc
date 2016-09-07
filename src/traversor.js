var errorUtil = require('./errorUtil'),
    stringUtil = require('./stringUtil'),
    parseUtil = require('./parseUtil'),
    ylcBindParser = require('./parser/ylcBind'),
    domTemplates = require('./domTemplates'),
    ylcEventsParser = require('./parser/ylcEvents'),
    ylcLoopParser = require('./parser/ylcLoop'),
    domAnnotator = require('./domAnnotator'),
    contextFactory = require('./contextFactory'),
    annotationProcessor = require('./annotationProcessor'),
    virtualNodes = require('./virtualNodes'),
    micVirtualize = require('./mic/virtualizeTemplates');

module.exports = {};

module.exports.setupTraversal = function(pModel, pDomView, pController) {

    var EMPTY_FUNCTION = function () {},
        PREFIELD = {},
        my = {};

    function m2vOnlyAnnotationListener(annotation, code, metadata) {
        if (annotation === "@M2vOnly") {
            metadata.m2vOnly = true;
        }
    }

    function beforeAfterEventAnnotationListener(annotation, code, metadata) {
        if (annotation === "@BeforeEvent") {
            my.callbacks.beforeEvent.push(code);

        } else if (annotation === "@AfterEvent") {
            my.callbacks.afterEvent.push(code);
        }
    }

    function domPreprocessAnnotationListener(annotation, code, metadata) {
        if (annotation === "@DomPreprocessorFactory") {
            my.callbacks.domPreprocessors.push(code());
        }
    }

    function extractControllerMethods(mixin, controller) {

        annotationProcessor.processAnnotations(
            mixin,
            [
                m2vOnlyAnnotationListener,
                beforeAfterEventAnnotationListener,
                domPreprocessAnnotationListener
            ]
        );

        return annotationProcessor.processAnnotations(
            controller,
            [
                m2vOnlyAnnotationListener,
                beforeAfterEventAnnotationListener,
                domPreprocessAnnotationListener
            ]
        );
    }

    function v2mSetValues(domElement) {

        var jqElement = $(domElement),
            strYlcBind = stringUtil.strGetData(jqElement, "ylcBind"),
            arrYlcBind = ylcBindParser.parseYlcBind(strYlcBind),
            idxYlcBind,
            currentYlcBinding,
            fnGetter,
            value,
            forceSet;

        for (idxYlcBind = 0; idxYlcBind < arrYlcBind.length; idxYlcBind += 1) {
            currentYlcBinding = arrYlcBind[idxYlcBind];

            if (currentYlcBinding.strMappingOperator !== ylcBindParser.MAPPING_BIDIRECTIONAL &&
                currentYlcBinding.strMappingOperator !== ylcBindParser.MAPPING_V2M_ONLY &&
                currentYlcBinding.strMappingOperator !== ylcBindParser.MAPPING_V2M_ONLY_FORCED) {
                continue;
            }

            forceSet = currentYlcBinding.strMappingOperator === ylcBindParser.MAPPING_V2M_ONLY_FORCED;

            if (stringUtil.isEmpty(currentYlcBinding.strPropertyName)) {
                value = jqElement.get();

            } else {
                fnGetter = jqElement[currentYlcBinding.strPropertyName];

                if (!fnGetter instanceof Function) {
                    throw errorUtil.createError(
                        "Cannot find jQuery getter/setter called '" +
                        currentYlcBinding.strPropertyName + "'.",
                        my.domView
                    );
                }

                if (currentYlcBinding.strSubpropertyName === undefined) {
                    value = fnGetter.call(jqElement);
                } else {
                    value = fnGetter.call(jqElement, currentYlcBinding.strSubpropertyName);
                }
            }

            try {
                my.context.setValue(currentYlcBinding.strBindingExpression, value, forceSet);

            } catch (err) {
                throw errorUtil.elementToError(err, domElement);
            }
        }
    }

    function getGeneratedElements(jqTemplate) {
        var domarrResult = [],
            jqCurrentSibling;

        jqCurrentSibling = jqTemplate;

        while (true) {
            jqCurrentSibling = jqCurrentSibling.next();

            if (jqCurrentSibling.get() === undefined || !domTemplates.isDynamicallyGenerated(jqCurrentSibling)) {
                break;
            }

            domarrResult.push(jqCurrentSibling.get());
        }

        return domarrResult;
    }

    function checkIterable(arrCollection) {
        if (!(arrCollection instanceof Array)) {
            throw errorUtil.createError(
                "Attempt to iterate through a non-array value: " +
                arrCollection
            );
        }
    }

    function v2mProcessDynamicElements(jqTemplate) {

        var strYlcLoop = stringUtil.strGetData(virtualNodes.getOriginal(jqTemplate), "ylcLoop"),
            strYlcIf = stringUtil.strGetData(virtualNodes.getOriginal(jqTemplate), "ylcIf");

        if (strYlcLoop && strYlcIf) {
            throw errorUtil.createError(
                "An element contains both data-ylcLoop and data-ylcIf.",
                jqTemplate.get()
            );
        }

        if (strYlcLoop) {
            return v2mProcessDynamicLoopElements(jqTemplate);
        }

        if (strYlcIf) {
            return v2mProcessDynamicIfElements(jqTemplate);
        }

        errorUtil.assert(false);

    }

    function v2mProcessElement(domElement) {
        var nElementsProcessed;

        if (domTemplates.isTemplate(domElement)) {
            nElementsProcessed = v2mProcessDynamicElements($(domElement), my.controller);

        } else if (domElement !== my.domView && domAnnotator.isViewRoot($(domElement))) {
            nElementsProcessed = 1;

        } else {
            v2mSetValues(domElement);
            v2mProcessChildren(domElement);
            nElementsProcessed = 1;
        }

        return nElementsProcessed;
    }

    function v2mProcessDynamicLoopElements(jqTemplate) {
        var idxWithinDynamicallyGenerated,
            ylcLoop = ylcLoopParser.parseYlcLoop(stringUtil.strGetData(virtualNodes.getOriginal(jqTemplate), "ylcLoop")),
            arrCollection = my.context.getValue(ylcLoop.strCollectionName),
            domarrGeneratedElements = getGeneratedElements(jqTemplate),
            domDynamicallyGeneratedElement,
            nProcessed;

        checkIterable(arrCollection);

        for (idxWithinDynamicallyGenerated = 0;
             idxWithinDynamicallyGenerated < domarrGeneratedElements.length;
             idxWithinDynamicallyGenerated += 1) {

            domDynamicallyGeneratedElement =
                domarrGeneratedElements[idxWithinDynamicallyGenerated];

            my.context.enterIteration(
                ylcLoop.strLoopVariable,
                arrCollection,
                ylcLoop.strStatusVariable,
                idxWithinDynamicallyGenerated
            );

            nProcessed = v2mProcessElement(domDynamicallyGeneratedElement);
            errorUtil.assert(
                nProcessed === 1,
                "A template can't be a dynamically generated element."
            );

            my.context.exitIteration(
                ylcLoop.strLoopVariable,
                ylcLoop.strStatusVariable
            );
        }

        return domarrGeneratedElements.length + 1;
    }

    function v2mProcessDynamicIfElements(jqTemplate) {
        var domarrCurrentGeneratedElements = getGeneratedElements(jqTemplate);

        if (domarrCurrentGeneratedElements.length > 0) {
            errorUtil.assert(domarrCurrentGeneratedElements.length === 1);
            v2mProcessElement(domarrCurrentGeneratedElements[0]);
        }

        return domarrCurrentGeneratedElements.length + 1;
    }

    function v2mProcessChildren(domElement) {
        var jqDomElement = $(domElement),
            jqsetChildren = jqDomElement.children(),
            index = 0,
            domChild;

        while (index < jqsetChildren.length) {
            domChild = jqsetChildren[index];
            index += v2mProcessElement(domChild);
        }
    }


    // propagating changes of model into view

    function m2vSetValues(domElement) {
        var jqElement = $(domElement),
            strYlcBind = stringUtil.strGetData(jqElement, "ylcBind"),
            arrYlcBind = ylcBindParser.parseYlcBind(strYlcBind),

            index,
            currentYlcBinding,
            fnGetterSetter,
            value,
            existingValue;

        for (index = 0; index < arrYlcBind.length; index += 1) {
            currentYlcBinding = arrYlcBind[index];

            if (currentYlcBinding.strMappingOperator !== ylcBindParser.MAPPING_BIDIRECTIONAL &&
                currentYlcBinding.strMappingOperator !== ylcBindParser.MAPPING_M2V_ONLY) {
                continue;
            }

            // an empty property maps straight to the DOM element, which is read only
            if (stringUtil.isEmpty(currentYlcBinding.strPropertyName)) {
                continue;
            }

            fnGetterSetter = jqElement[currentYlcBinding.strPropertyName];
            if (!(fnGetterSetter instanceof Function)) {
                throw errorUtil.createError(
                    "Cannot find jQuery getter/setter called '" +
                    currentYlcBinding.strPropertyName + "'.",
                    domElement
                );
            }

            try {
                value = my.context.getValue(currentYlcBinding.strBindingExpression);

            } catch (err) {
                throw errorUtil.elementToError(err, domElement);
            }

            if (value !== PREFIELD) {

                if (currentYlcBinding.strSubpropertyName === undefined) {
                    existingValue = fnGetterSetter.call(jqElement);

                } else {
                    existingValue =
                        fnGetterSetter.call(jqElement, currentYlcBinding.strSubpropertyName);
                }

                if (value !== existingValue) {
                    if (currentYlcBinding.strSubpropertyName === undefined) {
                        fnGetterSetter.call(jqElement, value);

                    } else {
                        fnGetterSetter.call(
                            jqElement,
                            currentYlcBinding.strSubpropertyName,
                            value
                        );
                    }
                }
            }

        }

    }

    function processCommonElements(
        ylcLoop,
        domarrCurrentGeneratedElements,
        arrCollection,
        commonLength
    ) {
        var index = 0,
            domGeneratedElement;

        while (index < commonLength) {
            domGeneratedElement = domarrCurrentGeneratedElements[index];

            my.context.enterIteration(
                ylcLoop.strLoopVariable,
                arrCollection,
                ylcLoop.strStatusVariable,
                index
            );

            index +=
                m2vProcessElement(
                    domGeneratedElement,
                    false
                );

            my.context.exitIteration(ylcLoop.strLoopVariable, ylcLoop.strStatusVariable);
        }
    }

    function addExtraElements(
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

            jqNewDynamicElement =
                domTemplates.jqCreateElementFromTemplate(
                    virtualNodes.getOriginal(jqTemplate),
                    true
                );

            my.context.enterIteration(
                ylcLoop.strLoopVariable,
                arrCollection,
                ylcLoop.strStatusVariable,
                index
            );

            elementsProcessed =
                m2vProcessElement(jqNewDynamicElement.get(), true);
            errorUtil.assert(
                elementsProcessed === 1,
                "If an element is dynamically generated, it can't be a template."
            );

            my.context.exitIteration(ylcLoop.strLoopVariable, ylcLoop.strStatusVariable);

            jqLastElement.after(jqNewDynamicElement);
            jqLastElement = jqNewDynamicElement;

        }
    }

    function m2vProcessDynamicLoopElements(jqTemplate, strYlcLoop) {

        var ylcLoop = ylcLoopParser.parseYlcLoop(strYlcLoop),
            domarrCurrentGeneratedElements =
                getGeneratedElements(jqTemplate),
            arrCollection = my.context.getValue(ylcLoop.strCollectionName),
            commonLength,
            idxFirstToDelete,
            index;

        checkIterable(arrCollection);

        commonLength =
            Math.min(arrCollection.length, domarrCurrentGeneratedElements.length);

        processCommonElements(
            ylcLoop,
            domarrCurrentGeneratedElements,
            arrCollection,
            commonLength
        );

        if (arrCollection.length > commonLength) {
            addExtraElements(
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

    function m2vProcessDynamicIfElements(jqTemplate, strYlcIf) {
        var ifExpressionValue = my.context.getValue(parseUtil.normalizeWhitespace(strYlcIf)),
            domarrCurrentGeneratedElements = getGeneratedElements(jqTemplate),
            jqNewDynamicElement,
            nElementsProcessed;

        if (ifExpressionValue && domarrCurrentGeneratedElements.length === 0) {
            jqNewDynamicElement =
                domTemplates.jqCreateElementFromTemplate(
                    virtualNodes.getOriginal(jqTemplate),
                    false,
                    "_ylcId"
                );

            nElementsProcessed =
                m2vProcessElement(jqNewDynamicElement.get(), true);
            errorUtil.assert(
                nElementsProcessed === 1,
                "If an element is dynamically generated, it can't be a template."
            );

            jqTemplate.after(jqNewDynamicElement);

        } else if (domarrCurrentGeneratedElements.length > 0) {
            if (ifExpressionValue) {
                nElementsProcessed =
                    m2vProcessElement(
                        domarrCurrentGeneratedElements[0],
                        false
                    );

            } else {
                errorUtil.assert(domarrCurrentGeneratedElements.length === 1);
                $(domarrCurrentGeneratedElements[0]).remove();
            }

        }

        return domarrCurrentGeneratedElements.length + 1;

    }

    function m2vProcessDynamicElements(jqTemplate) {

        var strYlcLoop = stringUtil.strGetData(virtualNodes.getOriginal(jqTemplate), "ylcLoop"),
            strYlcIf = stringUtil.strGetData(virtualNodes.getOriginal(jqTemplate), "ylcIf");

        if (strYlcLoop && strYlcIf) {
            throw errorUtil.createError(
                "An element can't contain both data-ylcLoop and data-ylcIf. " +
                "Please use an embedded DIV.",
                virtualNodes.getOriginal(jqTemplate)
            );
        }

        if (strYlcLoop) {
            return m2vProcessDynamicLoopElements(jqTemplate, strYlcLoop);
        }

        if (strYlcIf) {
            return m2vProcessDynamicIfElements(jqTemplate, strYlcIf);
        }

        errorUtil.assert(false);
    }

    function m2vProcessChildren(domElement, bBindEvents) {

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
                        domChild,
                        bBindEvents
                    );

            } catch (err) {
                throw errorUtil.elementToError(err, domChild);
            }
        }

    }

    function callFunctions(arrCallbacks) {
        $.each(
            arrCallbacks,
            function (idx, fn) {
                fn.call(my.controller);
            }
        )
    }

    function evaluateArguments(arrArgumentExpressions, loopContextMemento) {

        var context = my.context.newWithLoopContext(loopContextMemento),
            idxArgument,
            arrEvaluatedExpressions = [];

        if (arrArgumentExpressions === null || arrArgumentExpressions === undefined) {
            return arrArgumentExpressions;
        }

        for (idxArgument = 0; idxArgument < arrArgumentExpressions.length; idxArgument += 1) {
            arrEvaluatedExpressions.push(context.getValue(arrArgumentExpressions[idxArgument]));
        }

        return arrEvaluatedExpressions;

    }

    function callModelUpdatingMethod(
            publicContext,
            fnUpdateMethod,
            m2vOnly,
            arrArgumentExpressions,
            loopContextMemento
    ) {

        var idxArgument,
            argumentValues = [my.model, publicContext],
            returnValue;

        if (arrArgumentExpressions) {

            Array.prototype.push.apply(
                argumentValues,
                evaluateArguments(arrArgumentExpressions, loopContextMemento)
            );

        }

        try {

            callFunctions(my.callbacks.beforeEvent);

            if (!m2vOnly) {
                v2mProcessElement(my.domView);
            }

            returnValue = fnUpdateMethod.apply(my.controller, argumentValues);

            m2vProcessElement(
                my.domView,
                false
            );

            callFunctions(my.callbacks.afterEvent);

        } catch (error) {
            errorUtil.printAndRethrow(error);
        }

        return returnValue;

    }

    function createHandler(publicContext, fnHandler, m2vOnly, arrArgumentExpressions, loopContextMemento) {
        return function (eventObject) {
            publicContext.eventObject = eventObject;
            return callModelUpdatingMethod(
                publicContext,
                fnHandler,
                m2vOnly,
                arrArgumentExpressions,
                loopContextMemento
            );
        };
    }

    function m2vBindEvents(domElement) {
        var jqElement = $(domElement),
            strYlcEvents = stringUtil.strGetData(jqElement, "ylcEvents"),
            arrYlcEvents = ylcEventsParser.parseYlcEvents(strYlcEvents),

            index,
            currentYlcEvent,
            fnHandler,
            publicContext,
            annotatedControllerFunction,

            m2vOnly,
            immediateCallArguments;

        for (index = 0; index < arrYlcEvents.length; index += 1) {
            currentYlcEvent = arrYlcEvents[index];
            m2vOnly = false;

            if (currentYlcEvent.strMethodName.length === 0) {
                fnHandler = EMPTY_FUNCTION;

            } else {
                annotatedControllerFunction = my.controllerMethods[currentYlcEvent.strMethodName];
                if (annotatedControllerFunction) {
                    fnHandler = annotatedControllerFunction.code;
                    if (annotatedControllerFunction.metadata.m2vOnly) {
                        m2vOnly = true;
                    }
                }
            }

            if (!(fnHandler instanceof Function)) {
                throw errorUtil.createError(
                    "Event handler '" + currentYlcEvent.strMethodName + "', " +
                    "specified for event '" + currentYlcEvent.strEventName + "', " +
                    "is not a function.",
                    domElement
                );
            }

            publicContext = createPublicContext(domElement);

            if (currentYlcEvent.strEventName === "ylcElementInitialized") {
                immediateCallArguments = [my.model, publicContext];
                if (currentYlcEvent.arrArgumentExpressions) {
                    Array.prototype.push.apply(
                        immediateCallArguments,
                        evaluateArguments(
                            currentYlcEvent.arrArgumentExpressions,
                            my.context.getLoopContextMemento()
                        )
                    );
                }
                fnHandler.apply(my.controller, immediateCallArguments);
            }

            jqElement.bind(
                currentYlcEvent.strEventName,
                createHandler(
                    publicContext,
                    fnHandler,
                    m2vOnly,
                    currentYlcEvent.arrArgumentExpressions,
                    my.context.getLoopContextMemento()
                )
            );
        }

    }

    function createPublicContext(domElement) {
        var publicContext = {};

        publicContext.PREFIELD = PREFIELD;

        publicContext.domElement = domElement;
        publicContext.loopStatuses = my.context.getLoopStatusesSnapshot();
        publicContext.updateModel = function (fnUpdateMethod) {
            return callModelUpdatingMethod(publicContext, fnUpdateMethod);
        };

        return publicContext;
    }

    function m2vProcessElement(domElement, bBindEvents) {

        var nElementsProcessed;

        if (domTemplates.isTemplate(domElement)) {
            nElementsProcessed = m2vProcessDynamicElements($(domElement));

        } else if (domElement !== my.domView && domAnnotator.isViewRoot($(domElement))) {
            nElementsProcessed = 1;

        } else {
            if (bBindEvents) {
                m2vBindEvents(domElement);
            }
            m2vSetValues(domElement);
            $(domElement).removeClass("ylcInvisibleTemplate");
            m2vProcessChildren(domElement, bBindEvents);

            nElementsProcessed = 1;
        }

        return nElementsProcessed;
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

    function createAdapter(domView, controller) {

        var adapter = {},
            controllerMethodNames = getProperties(controller),
            adapterMethodArguments;

        $.each(controllerMethodNames, function (idxProperty, currentMethodName) {
            var currentControllerMethod = controller[currentMethodName];

            if (currentControllerMethod instanceof Function) {
                adapter[currentMethodName] = function () {

                    var returnValue;

                    adapterMethodArguments =
                        [
                            my.model,
                            createPublicContext(null)
                        ];
                    $.each(arguments, function (index, argument) {
                        adapterMethodArguments.push(argument);
                    });

                    returnValue = currentControllerMethod.apply(controller, adapterMethodArguments);

                    m2vProcessElement(
                        domView,
                        false
                    );

                    return returnValue;
                };
            }

        });

        return adapter;
    }

    function processExternalEvent(domView, controller, communicationObject) {
        if (communicationObject.eventName === "getAdapter") {
            communicationObject.result = createAdapter(domView, controller);
        }
    }

    function registerYlcExternalEvent(domView, controller) {
        $(domView).bind(
            "_ylcExternalEvent",
            function (event, communicationObject) {
                processExternalEvent(domView, controller, communicationObject);
                return false;
            }
        );
    }

    function inOrderTraversal(jqNode, listeners) {

        var metadata = {},
            bMakeVirtual = false,
            jqVirtualNode;

        $.each(
            listeners,
            function (idx, listener) {
                bMakeVirtual |= listener.nodeStart(jqNode, metadata);
            }
        );

        if (bMakeVirtual) {
            jqVirtualNode = virtualNodes.makeVirtual(jqNode);
        }

        jqNode.children().each(
            function() {
                inOrderTraversal($(this), listeners);
            }
        );

        $.each(
            listeners,
            function (idx, listener) {
                listener.nodeEnd(jqNode, metadata);
            }
        );

        jqNode.data("_ylcMetadata", metadata);

        return jqVirtualNode ? jqVirtualNode : jqNode;

    }

    function setupViewForYlcTraversal() {

        domAnnotator.markViewRoot($(my.domView));

        if (my.controller.init instanceof Function) {
            my.controller.init.call(
                my.controller,
                my.model,
                createPublicContext(my.domView)
            );
        }

        m2vProcessElement(
            my.domView,
            true
        );

        registerYlcExternalEvent(my.domView, my.controller);

    }

    my.model = pModel;
    my.controller = pController;

    my.callbacks = {
        beforeEvent: [],
        afterEvent: [],
        domPreprocessors: []
    };

    my.controllerMethods = extractControllerMethods(micVirtualize, my.controller);

    my.context = contextFactory.newContext(my.model, my.controller, my.controllerMethods);

    if (my.callbacks.domPreprocessors.length > 0) {
        my.domView = inOrderTraversal(pDomView, my.callbacks.domPreprocessors);
    }

    setupViewForYlcTraversal();

};

module.exports.triggerExternalEvent = function(domView, eventName, parameter) {

    var communicationObject = {
        eventName: eventName,
        parameter: parameter,
        result: undefined
    };

    $(domView).trigger("_ylcExternalEvent", communicationObject);

    return communicationObject.result;
};