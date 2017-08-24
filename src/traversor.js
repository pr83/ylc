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

    function initAnnotationListener(annotation, code, metadata) {
        if (annotation === "@Init") {
            my.callbacks.init.push(code);
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
                    initAnnotationListener,
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

        var jqElement = $(domElement),
            v2m = metadata.of(jqElement).v2m;

        if (v2m) {
            $.each(
                v2m,
                function (idx, v2m) {
                    v2m(domElement, my.context);
                }
            );
        }

    }

    function getGeneratedElements(jqTemplate) {
        var domarrResult = [],
            jqCurrentSibling;

        jqCurrentSibling = jqTemplate;

        while (true) {
            jqCurrentSibling = jqCurrentSibling.next();

            if (jqCurrentSibling.length === 0 || !domTemplates.isDynamicallyGenerated(jqCurrentSibling.get(0))) {
                break;
            }

            domarrResult.push(jqCurrentSibling.get(0));
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

        } else if (metadata.of($(domElement)).bHasV2m === 0) {
            nElementsProcessed = 1;

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
            ylcLoop,
            arrCollection,
            domarrGeneratedElements = getGeneratedElements(jqTemplate),
            domDynamicallyGeneratedElement,
            dynamicElementsPerArrayItem = getDynamicElementsPerArrayItem(jqTemplate),
            nProcessed;

        if (metadata.of(virtualNodes.getOriginal(jqTemplate)).bHasV2m === 0) {
            return domarrGeneratedElements.length + 1;
        }

        ylcLoop = metadata.of(virtualNodes.getOriginal(jqTemplate)).ylcLoop;
        arrCollection = my.context.getValue(ylcLoop.astCollection);
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
                Math.floor(idxWithinDynamicallyGenerated / dynamicElementsPerArrayItem)
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
            $.each(
                domarrCurrentGeneratedElements,
                function(idx, domCurrentGeneratedElement) {
                    v2mProcessElement(domCurrentGeneratedElement);
                }
            );
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
            m2v = metadata.of(jqElement).m2v;

        if (m2v) {
            $.each(
                m2v,
                function (idx, m2v) {
                    if (m2v(domElement, my.context)) {
                        domMutated();
                    }
                }
            );
        }
    }

    function processCommonElements(
        ylcLoop,
        domarrCurrentGeneratedElements,
        arrCollection,
        commonLength,
        bUnderlyingCollectionChanged,
        dynamicElementsPerArrayItem
    ) {
        var index = 0,
            domGeneratedElement;

        while (index < commonLength) {
            domGeneratedElement = domarrCurrentGeneratedElements[index];

            my.context.enterIteration(
                ylcLoop.strLoopVariable,
                arrCollection,
                ylcLoop.strStatusVariable,
                Math.floor(index / dynamicElementsPerArrayItem)
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
            listeners = metadata.of(jqElement).listeners;

        if (listeners && listeners.ylcLifecycle.elementInitialized) {
            callLifecycleHandler(
                listeners.ylcLifecycle.elementInitialized.strMethodName,
                listeners.ylcLifecycle.elementInitialized.arrArgumentsAsts,
                createPublicContext(domElement),
                "element initialized"
            );
        }
    }

    function onDomChanged(domElement) {
        var jqElement = $(domElement),
            listeners = metadata.of(jqElement).listeners;

        if (listeners && listeners.ylcLifecycle.domChanged) {
            callLifecycleHandler(
                listeners.ylcLifecycle.domChanged.strMethodName,
                listeners.ylcLifecycle.domChanged.arrArgumentsAsts,
                createPublicContext(domElement),
                "DOM changed"
            );
        }
    }
    
    function callLifecycleHandler(strMethodName, arrArgumentsAsts, publicContext, strHandlerDescription) {
        var immediateCallArguments = [my.model, publicContext];
        if (arrArgumentsAsts) {
            Array.prototype.push.apply(
                immediateCallArguments,
                evaluateArguments(arrArgumentsAsts, my.context.getLoopContextMemento())
            );
        }
        getHandler(strHandlerDescription, strMethodName).apply(my.controller, immediateCallArguments);
    }

    function addExtraElements(
        ylcLoop,
        jqTemplate,
        domarrCurrentGeneratedElements,
        arrCollection,
        commonLength,
        dynamicElementsPerArrayItem
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

        for (index = commonLength / dynamicElementsPerArrayItem; index < arrCollection.length; index += 1) {

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
                m2vProcessElement(jqNewDynamicElement.get(0), true, true);
            errorUtil.assert(
                elementsProcessed === 1,
                "If an element is dynamically generated, it can't be a template."
            );

            my.context.exitIteration(ylcLoop.strLoopVariable, ylcLoop.strStatusVariable);

            if (metadata.of(virtualNodes.getOriginal(jqTemplate)).bRemoveTag) {
                jqNewDynamicElement.children().each(function() {
                    afterElementAddElement(jqLastElement, $(this));
                    jqLastElement = $(this);
                });
            } else {
                afterElementAddElement(jqLastElement, jqNewDynamicElement);
                jqLastElement = jqNewDynamicElement;
            }

        }
    }

    function getDynamicElementsPerArrayItem(jqTemplate) {
        if (!metadata.of(virtualNodes.getOriginal(jqTemplate)).bRemoveTag) {
            return 1;
            
        } else {
            return virtualNodes.getOriginal(jqTemplate).children().length;
        }
    }
    
    function m2vProcessDynamicLoopElements(jqTemplate, ylcLoop, bRebindEvents) {

        var domarrCurrentGeneratedElements = getGeneratedElements(jqTemplate),
            arrCollection = my.context.getValue(ylcLoop.astCollection),
            bUnderlyingCollectionChanged =
                (metadata.localOf(jqTemplate).loopCollection !== arrCollection),
            commonLength,
            dynamicElementsPerArrayItem = getDynamicElementsPerArrayItem(jqTemplate),
            idxFirstToDelete,
            index;
        
        if (metadata.localOf(jqTemplate).loopCollectionLength) {
            dynamicElementsPerArrayItem = domarrCurrentGeneratedElements.length / metadata.localOf(jqTemplate).loopCollectionLength; 
        }
        
        checkIterable(arrCollection);

        if (bUnderlyingCollectionChanged) {
            metadata.localOf(jqTemplate).loopCollection = arrCollection;
        }
        metadata.localOf(jqTemplate).loopCollectionLength = arrCollection.length;

        commonLength =
            Math.min(arrCollection.length * dynamicElementsPerArrayItem, domarrCurrentGeneratedElements.length);

        processCommonElements(
            ylcLoop,
            domarrCurrentGeneratedElements,
            arrCollection,
            commonLength,
            bRebindEvents || bUnderlyingCollectionChanged,
            dynamicElementsPerArrayItem
        );

        if (arrCollection.length * dynamicElementsPerArrayItem > commonLength) {
            addExtraElements(
                ylcLoop,
                jqTemplate,
                domarrCurrentGeneratedElements,
                arrCollection,
                commonLength,
                dynamicElementsPerArrayItem
            );
        }

        if (domarrCurrentGeneratedElements.length > commonLength) {
            idxFirstToDelete = arrCollection.length * dynamicElementsPerArrayItem;
            for (index = idxFirstToDelete;
                 index < domarrCurrentGeneratedElements.length;
                 index += 1) {
                removeElement($(domarrCurrentGeneratedElements[index]));
            }
        }

        return domarrCurrentGeneratedElements.length + 1;
    }

    function m2vProcessDynamicIfElements(jqTemplate, astYlcIf, bRebindEvents) {

        var ifExpressionValue = my.context.getValue(astYlcIf),
            domarrCurrentGeneratedElements = getGeneratedElements(jqTemplate),
            jqNewDynamicElement,
            jqLastElement;

        if (ifExpressionValue && domarrCurrentGeneratedElements.length === 0) {

            jqNewDynamicElement =
                domTemplates.jqCreateElementFromTemplate(
                    virtualNodes.getOriginal(jqTemplate),
                    false,
                    "_ylcId"
                );

            m2vProcessElement(jqNewDynamicElement.get(0), true, true);

            if (metadata.of(virtualNodes.getOriginal(jqTemplate)).bRemoveTag) {
                jqLastElement = jqTemplate;
                jqNewDynamicElement.children().each(function() {
                    afterElementAddElement(jqLastElement, $(this));
                    jqLastElement = $(this);
                });
            } else {
                afterElementAddElement(jqTemplate, jqNewDynamicElement);
            }

        } else if (domarrCurrentGeneratedElements.length > 0) {

            if (ifExpressionValue) {
                $.each(
                    domarrCurrentGeneratedElements,
                    function(idx, domCurrentGeneratedElement) {
                        m2vProcessElement(domCurrentGeneratedElement, false, bRebindEvents);
                    }
                );

            } else {
                $.each(
                    domarrCurrentGeneratedElements,
                    function(idx, domCurrentGeneratedElement) {
                        removeElement($(domCurrentGeneratedElement));
                    }
                );
            }

        }

        return domarrCurrentGeneratedElements.length + 1;

    }

    function m2vProcessDynamicElements(jqTemplate, bRebindEvents) {

        var metadataObj = metadata.of(virtualNodes.getOriginal(jqTemplate));

        if (metadataObj.ylcLoop) {
            return m2vProcessDynamicLoopElements(jqTemplate, metadataObj.ylcLoop, bRebindEvents);
        }

        if (metadataObj.astYlcIf) {
            return m2vProcessDynamicIfElements(jqTemplate, metadataObj.astYlcIf, bRebindEvents);
        }

        errorUtil.assert(false);
    }

    function m2vProcessChildren(domElement, bFirstVisit, bBindEvents) {

        var jqElement = $(domElement),
            jqsetChildren = jqElement.children(),

            index,
            domChild;

        index = 0;

        var nMutations = 0;
        pushDomMutationCallback(
            function() {
                nMutations += 1;
            }
        );

        try {

            while (index < jqsetChildren.length) {
                domChild = jqsetChildren[index];

                try {

                    index +=
                        m2vProcessElement(
                            domChild,
                            bFirstVisit,
                            bBindEvents
                        );

                }
                catch (err) {
                    throw errorUtil.elementToError(err, domChild);
                }
            }

            if (nMutations > 0) {
                onDomChanged(domElement);
            }

        } finally {
            popDomMutationCallback();
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

        if (listeners) {
            $.each(
                listeners.jsEvents,
                function (strEventName, objEventDescriptor) {
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
        }

    }

    function createPublicContext(domElement) {
        var publicContext = {};

        publicContext.PREFIELD = micM2v.PREFIELD;

        publicContext.domElement = domElement;
        publicContext.loopStatuses = my.context.getLoopStatusesSnapshot();
        publicContext.updateModel = function (fnUpdateMethod) {
            return callModelUpdatingMethod(publicContext, fnUpdateMethod);
        };

        publicContext.controllerMethods = {};
            $.each(
                my.controllerMethods,
                function(name, method) {
                    publicContext.controllerMethods[name] = method.code;
                }
            );

        return publicContext;
    }

    function m2vProcessElement(domElement, bFirstVisit, bBindEvents) {

        var nElementsProcessed;

        if (domTemplates.isTemplate(domElement)) {
            nElementsProcessed = m2vProcessDynamicElements($(domElement), bBindEvents);

        } else if (domElement !== my.domView && domAnnotator.isViewRoot($(domElement))) {
            nElementsProcessed = 1;

        } else if ((metadata.of($(domElement)).bHasM2v === 0) && !bFirstVisit && !bBindEvents) {
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
    
    function afterElementAddElement(jqAfterWhat, jqWhat) {
        jqAfterWhat.after(jqWhat);
        domMutated();
    }
    
    function removeElement(jqElement) {
        jqElement.remove();
        domMutated();
    }

    function domMutated() {
        $.each(
            my.domMutationCallbacks,
            function(index, fnCallback) {
                fnCallback();
            }
        );
    }
    
    function pushDomMutationCallback(fnCallback) {
        my.domMutationCallbacks.push(fnCallback);
    }
    
    function popDomMutationCallback() {
        my.domMutationCallbacks.pop();
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

                    v2mProcessElement(my.domView);
                    
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

    function preOrderTraversal(jqNode, listeners, level) {

        var metadataObj = metadata.of(jqNode),
            childMetadata,
            realChildMetadata,
            preprocessingResult,
            bMakeVirtual = false,
            bHasV2m = false,
            bHasM2v = false,
            jqVirtualNode;

        $.each(
            listeners,
            function (idx, listener) {
                try {
                    preprocessingResult = listener.nodeStart(jqNode, metadataObj);
                } catch (error) {
                    throw errorUtil.elementToError(error, jqNode.get(0));
                }
                if ($.isPlainObject(preprocessingResult)) {
                    bMakeVirtual |= preprocessingResult.bMakeVirtual;
                    bHasV2m |= preprocessingResult.bHasV2m;
                    bHasM2v |= preprocessingResult.bHasM2v;
                } else {
                    bMakeVirtual |= preprocessingResult;
                }
            }
        );

        metadata.of(jqNode).level = level;
        
        if (bMakeVirtual) {
            jqVirtualNode = virtualNodes.makeVirtual(jqNode);
        }

        jqNode.children().each(
            function() {
                preOrderTraversal($(this), listeners, level + 1);
                childMetadata = metadata.of($(this));
                realChildMetadata = metadata.of(virtualNodes.getOriginal($(this)));
                bHasV2m |= (childMetadata.bHasV2m || realChildMetadata.bHasV2m);
                bHasM2v |= (childMetadata.bHasM2v || realChildMetadata.bHasM2v);
            }
        );

        $.each(
            listeners,
            function (idx, listener) {
                listener.nodeEnd(jqNode, metadataObj);
            }
        );

        metadataObj.bHasV2m = bHasV2m;
        metadataObj.bHasM2v = bHasM2v;

        return jqVirtualNode ? jqVirtualNode : jqNode;

    }

    function setupViewForYlcTraversal() {

        var publicContext = createPublicContext(my.domView);

        domAnnotator.markViewRoot($(my.domView));

        if (my.controller.init instanceof Function) {
            my.callbacks.init.push(my.controller.init);
        }

        $.each(
            my.callbacks.init,
            function(idx, callback) {
                callback.call(my.controller, my.model, publicContext);
            }
        );

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
        init: [],
        beforeEvent: [],
        afterEvent: [],
        domPreprocessors: []
    };
    
    my.domMutationCallbacks = [];

    my.controllerMethods =
        extractControllerMethods(
            [micProcessBindingParameters, processEventParameters, processMoustacheBindings, micVirtualize, micM2v, micV2m].concat(my.mixins),
            my.controller
        );

    my.context = contextFactory.newContext(my.model, my.controller, my.controllerMethods);

    if (my.callbacks.domPreprocessors.length > 0) {
        my.domView = preOrderTraversal(pDomView, my.callbacks.domPreprocessors, 0).get(0);
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