var errorUtil = require('./errorUtil'),
    stringUtil = require('./stringUtil'),
    parseUtil = require('./parseUtil'),
    domTemplates = require('./domTemplates'),
    domAnnotator = require('./domAnnotator'),
    contextFactory = require('./contextFactory'),
    annotationProcessor = require('./annotationProcessor'),
    virtualNodes = require('./virtualNodes'),
    micVirtualize = require('./mixin/virtualizeTemplates'),
    micProcessBindingParameters = require('./mixin/processBindingParameters'),
    processEventParameters = require('./mixin/processEventParameters'),
    micM2v = require('./mixin/m2v'),
    micV2m = require('./mixin/v2m'),
    processMoustacheBindings = require('./mixin/processMoustacheBindings'),
    metadata = require('./metadata'),
    expressionParser = require('./expressionParser');

module.exports = {};

module.exports.setupTraversal = function(pModel, pDomView, pController, pMixins) {

    var EMPTY_FUNCTION = function () {},
        my = {};

    function m2vOnlyAnnotationListener(annotation, code, metadata) {
        if (annotation === "@M2vOnly") {
            metadata.m2vOnly = true;
        }
    }

    function publicAnnotationListener(annotation, code, metadata) {
        if (annotation === "@Public") {
            metadata.public = true;
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

    function extractControllerMethods(mixins, controller) {

        var methodsForMixin,
            result = {},
            annotationListeners =
                [
                    publicAnnotationListener,
                    m2vOnlyAnnotationListener,
                    beforeAfterEventAnnotationListener,
                    domPreprocessAnnotationListener
                ];

        $.each(
            mixins,
            function(idx, mixin) {
                methodsForMixin =
                    annotationProcessor.processAnnotations(
                        mixin,
                        annotationListeners
                    );
                $.extend(result, methodsForMixin);
            }
        );

        methodsForMixin =
            annotationProcessor.processAnnotations(
                controller,
                annotationListeners
            );
        $.extend(result, methodsForMixin);

        return result;
    }

    function v2mSetValues(domElement) {

        var jqElement = $(domElement);

        $.each(
            metadata.of(jqElement).v2m,
            function (idx, v2m) {
                v2m(domElement, my.context);
            }
        );

    }

    function getGeneratedElements(jqTemplate) {
        var domarrResult = [],
            jqCurrentSibling;

        jqCurrentSibling = jqTemplate;

        while (true) {
            jqCurrentSibling = jqCurrentSibling.next();

            if (jqCurrentSibling.length === 0 || !domTemplates.isDynamicallyGenerated(jqCurrentSibling.get())) {
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

        var metadataObj = metadata.of(virtualNodes.getOriginal(jqTemplate));

        if (metadataObj.ylcLoop) {
            return v2mProcessDynamicLoopElements(jqTemplate);
        }

        if (metadataObj.astYlcIf) {
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
            ylcLoop = metadata.of(virtualNodes.getOriginal(jqTemplate)).ylcLoop,
            arrCollection = my.context.getValue(ylcLoop.astCollection),
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
        var jqElement = $(domElement);

        $.each(
            metadata.of(jqElement).m2v,
            function (idx, m2v) {
                m2v(domElement, my.context);
            }
        );

    }

    function processCommonElements(
        ylcLoop,
        domarrCurrentGeneratedElements,
        arrCollection,
        commonLength,
        bUnderlyingCollectionChanged
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
                    false,
                    bUnderlyingCollectionChanged
                );

            my.context.exitIteration(ylcLoop.strLoopVariable, ylcLoop.strStatusVariable);
        }
    }

    function getHandler(strEventName, strMethodName) {

        var annotatedControllerFunction,
            fnHandler;

        if (strMethodName.length === 0) {
            fnHandler = EMPTY_FUNCTION;

        } else {
            annotatedControllerFunction = my.controllerMethods[strMethodName];
            if (annotatedControllerFunction) {
                fnHandler = annotatedControllerFunction.code;
            }
        }

        if (!(fnHandler instanceof Function)) {
            throw errorUtil.createError(
                "Event handler '" + strMethodName + "', " +
                "specified for event '" + strEventName + "', " +
                "is not a function."
            );
        }

        return fnHandler;

    }

    function isM2vOnly(strMethodName) {
        var annotatedControllerFunction = my.controllerMethods[strMethodName];
        if (annotatedControllerFunction) {
            return annotatedControllerFunction.metadata.m2vOnly;
        }

        return false;
    }

    function onElementInit(domElement) {
        var jqElement = $(domElement),
            listeners = metadata.of(jqElement).listeners,
            publicContext = createPublicContext(domElement);

        if (listeners.ylcLifecycle.elementInitialized) {
            var immediateCallArguments = [my.model, publicContext];
            if (listeners.ylcLifecycle.elementInitialized.arrArgumentsAsts) {
                Array.prototype.push.apply(
                    immediateCallArguments,
                    evaluateArguments(
                        listeners.ylcLifecycle.elementInitialized.arrArgumentsAsts,
                        my.context.getLoopContextMemento()
                    )
                );
            }
            getHandler(
                "element initialized",
                listeners.ylcLifecycle.elementInitialized.strMethodName
            ).apply(my.controller, immediateCallArguments);
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
                m2vProcessElement(jqNewDynamicElement.get(), true, true);
            errorUtil.assert(
                elementsProcessed === 1,
                "If an element is dynamically generated, it can't be a template."
            );

            my.context.exitIteration(ylcLoop.strLoopVariable, ylcLoop.strStatusVariable);

            jqLastElement.after(jqNewDynamicElement);
            jqLastElement = jqNewDynamicElement;

        }
    }

    function m2vProcessDynamicLoopElements(jqTemplate, ylcLoop) {

        var domarrCurrentGeneratedElements = getGeneratedElements(jqTemplate),
            arrCollection = my.context.getValue(ylcLoop.astCollection),
            bUnderlyingCollectionChanged =
                (metadata.localOf(jqTemplate).loopCollection !== arrCollection),
            commonLength,
            idxFirstToDelete,
            index;

        checkIterable(arrCollection);

        if (bUnderlyingCollectionChanged) {
            metadata.localOf(jqTemplate).loopCollection = arrCollection;
        }

        commonLength =
            Math.min(arrCollection.length, domarrCurrentGeneratedElements.length);

        processCommonElements(
            ylcLoop,
            domarrCurrentGeneratedElements,
            arrCollection,
            commonLength,
            bUnderlyingCollectionChanged
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

    function m2vProcessDynamicIfElements(jqTemplate, astYlcIf) {
        var ifExpressionValue = my.context.getValue(astYlcIf),
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
                m2vProcessElement(jqNewDynamicElement.get(), true, true);
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

        var metadataObj = metadata.of(virtualNodes.getOriginal(jqTemplate));

        if (metadataObj.ylcLoop) {
            return m2vProcessDynamicLoopElements(jqTemplate, metadataObj.ylcLoop);
        }

        if (metadataObj.astYlcIf) {
            return m2vProcessDynamicIfElements(jqTemplate, metadataObj.astYlcIf);
        }

        errorUtil.assert(false);
    }

    function m2vProcessChildren(domElement, bFirstVisit, bBindEvents) {

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
                        bFirstVisit,
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

    function evaluateArguments(arrArgumentAsts, loopContextMemento) {

        var context = my.context.newWithLoopContext(loopContextMemento),
            idxArgument,
            arrEvaluatedExpressions = [];

        if (arrArgumentAsts === null || arrArgumentAsts === undefined) {
            return arrArgumentAsts;
        }

        for (idxArgument = 0; idxArgument < arrArgumentAsts.length; idxArgument += 1) {
            arrEvaluatedExpressions.push(context.getValue(arrArgumentAsts[idxArgument]));
        }

        return arrEvaluatedExpressions;

    }

    function callModelUpdatingMethod(
            publicContext,
            fnUpdateMethod,
            m2vOnly,
            arrArgumentAsts,
            loopContextMemento
    ) {

        var idxArgument,
            argumentValues = [my.model, publicContext],
            returnValue;

        if (arrArgumentAsts) {

            Array.prototype.push.apply(
                argumentValues,
                evaluateArguments(arrArgumentAsts, loopContextMemento)
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
                false,
                false
            );

            callFunctions(my.callbacks.afterEvent);

        } catch (error) {
            errorUtil.printAndRethrow(error);
        }

        return returnValue;

    }

    function createHandler(publicContext, fnHandler, m2vOnly, arrArgumentAsts, loopContextMemento) {
        return function (eventObject) {
            publicContext.eventObject = eventObject;
            return callModelUpdatingMethod(
                publicContext,
                fnHandler,
                m2vOnly,
                arrArgumentAsts,
                loopContextMemento
            );
        };
    }

    function m2vBindEvents(domElement) {

        var jqElement = $(domElement),
            listeners = metadata.of(jqElement).listeners,
            publicContext = createPublicContext(domElement);

        $.each(
            listeners.jsEvents,
            function(strEventName, objEventDescriptor) {
                jqElement.unbind(strEventName);
                jqElement.bind(
                    strEventName,
                    createHandler(
                        publicContext,
                        getHandler(strEventName, objEventDescriptor.strMethodName),
                        isM2vOnly(objEventDescriptor.strMethodName),
                        objEventDescriptor.arrArgumentsAsts,
                        my.context.getLoopContextMemento()
                    )
                );
            }
        );

        /*
        if (listeners.ylcLifecycle.elementInitialized) {
            var immediateCallArguments = [my.model, publicContext];
            if (listeners.ylcLifecycle.elementInitialized.arrArgumentsAsts) {
                Array.prototype.push.apply(
                    immediateCallArguments,
                    evaluateArguments(
                        listeners.ylcLifecycle.elementInitialized.arrArgumentsAsts,
                        my.context.getLoopContextMemento()
                    )
                );
            }
            getHandler(
                "element initialized",
                listeners.ylcLifecycle.elementInitialized.strMethodName).
            apply(my.controller, immediateCallArguments);
        }
        */

    }

    function createPublicContext(domElement) {
        var publicContext = {};

        publicContext.PREFIELD = micM2v.PREFIELD;

        publicContext.domElement = domElement;
        publicContext.loopStatuses = my.context.getLoopStatusesSnapshot();
        publicContext.updateModel = function (fnUpdateMethod) {
            return callModelUpdatingMethod(publicContext, fnUpdateMethod);
        };

        return publicContext;
    }

    function m2vProcessElement(domElement, bFirstVisit, bBindEvents) {

        var nElementsProcessed;

        if (domTemplates.isTemplate(domElement)) {
            nElementsProcessed = m2vProcessDynamicElements($(domElement));

        } else if (domElement !== my.domView && domAnnotator.isViewRoot($(domElement))) {
            nElementsProcessed = 1;

        } else {
            if (bFirstVisit) {
                onElementInit(domElement);
            }

            if (bBindEvents) {
                m2vBindEvents(domElement);
            }

            m2vSetValues(domElement);
            m2vProcessChildren(domElement, bFirstVisit, bBindEvents);

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

    function createAdapter(domView, controller, includePrivate) {

        var adapter = {},
            controllerMethodNames = getProperties(my.controllerMethods),
            adapterMethodArguments;

        $.each(controllerMethodNames, function (idxProperty, currentMethodName) {

            var currentControllerMethod = my.controllerMethods[currentMethodName];

            if (currentControllerMethod.metadata && (currentControllerMethod.metadata.public || includePrivate)) {
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

                    returnValue = currentControllerMethod.code.apply(controller, adapterMethodArguments);

                    m2vProcessElement(
                        domView,
                        false,
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
            communicationObject.result = createAdapter(domView, controller, true);

        } else if (communicationObject.eventName === "getPublicApi") {
            communicationObject.result = createAdapter(domView, controller, false);
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

    function preOrderTraversal(jqNode, listeners) {

        var metadataObj = metadata.of(jqNode),
            bMakeVirtual = false,
            jqVirtualNode;

        $.each(
            listeners,
            function (idx, listener) {
                bMakeVirtual |= listener.nodeStart(jqNode, metadataObj);
            }
        );

        if (bMakeVirtual) {
            jqVirtualNode = virtualNodes.makeVirtual(jqNode);
        }

        jqNode.children().each(
            function() {
                preOrderTraversal($(this), listeners);
            }
        );

        $.each(
            listeners,
            function (idx, listener) {
                listener.nodeEnd(jqNode, metadataObj);
            }
        );

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
            true,
            true
        );

        registerYlcExternalEvent(my.domView, my.controller);

    }

    my.model = pModel;
    my.controller = pController;
    my.mixins = pMixins || [];

    my.callbacks = {
        beforeEvent: [],
        afterEvent: [],
        domPreprocessors: []
    };

    my.controllerMethods =
        extractControllerMethods(
            [micProcessBindingParameters, processEventParameters, processMoustacheBindings, micVirtualize, micM2v, micV2m].concat(my.mixins),
            my.controller
        );

    my.context = contextFactory.newContext(my.model, my.controller, my.controllerMethods);

    if (my.callbacks.domPreprocessors.length > 0) {
        my.domView = preOrderTraversal(pDomView, my.callbacks.domPreprocessors);
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