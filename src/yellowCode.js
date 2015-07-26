(function ($) {

    "use strict";

    var domAnnotator = require('./domAnnotator'),
        errorUtil = require('./errorUtil'),
        stringUtil = require('./stringUtil'),
        domTemplates = require('./domTemplates'),
        traversor = require('./traversor');

    $.fn.yellowCode = function (parameter1, parameter2, parameter3) {

        var domView = this,
            controller,
            objectToReturn,
            model;

        try {

            if (parameter1 instanceof Object) {
                model = {};
                controller = parameter1;

                traversor.setupTraversal(model, domView, controller);

                if (typeof parameter2 === "string") {
                    objectToReturn = traversor.triggerExternalEvent(domView, parameter2, parameter3);

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
                objectToReturn = traversor.triggerExternalEvent(domView, parameter1, parameter2);
            }

            return objectToReturn;

        } catch (error) {
            errorUtil.printAndRethrow(error);
        }
    };

}(jQuery));
