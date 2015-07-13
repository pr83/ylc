(function ($) {

    "use strict";

    var domAnnotator = require('./domAnnotator'),
        contextFactory = require('./contextFactory'),
        errorUtil = require('./errorUtil'),
        stringUtil = require('./stringUtil'),
        domTemplates = require('./domTemplates'),
        traversal = require('./traversal');


    function init(domView, controller) {
        var model = {},
            context = contextFactory.newContext(model, controller);

        if (controller.init instanceof Function) {
            controller.init.call(
                controller,
                model,
                traversal.createPublicContext(context, domView, domView, controller)
            );
        }

        $(domView).find(":not([data-ylcIf=''])").addClass("ylcInvisibleTemplate");
        $(domView).find(":not([data-ylcLoop=''])").addClass("ylcInvisibleTemplate");
        domAnnotator.markViewRoot($(domView));

        traversal.m2vProcessElement(
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

                    adapterMethodArguments =
                        [
                            context.getModel(),
                            traversal.createPublicContext(context, domView, null, controller)
                        ];
                    $.each(arguments, function (index, argument) {
                        adapterMethodArguments.push(argument);
                    });

                    returnValue = currentControllerMethod.apply(controller, adapterMethodArguments);

                    traversal.m2vProcessElement(
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
                if (!domAnnotator.isViewRoot($(domView))) {
                    throw errorUtil.createError(
                        "Cannot get an adapter. This element is not a YLC view root. " +
                        "Make sure Yellow Code has been properly initialized with this " +
                        "element as a view root.",
                        domView
                    );
                }
                objectToReturn = triggerExternalEvent(domView, parameter1, parameter2);
            }

            return objectToReturn;

        } catch (error) {
            errorUtil.printAndRethrow(error);
        }
    };

}(jQuery));
