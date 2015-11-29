var errorUtil = require('./errorUtil');

module.exports = (function () {

    return {

        processAnnotations: function(controller, arrAnnotationListeners) {

            function processTreeRecursively(
                    controllerSubtree,
                    arrAnnotationListeners,
                    result,
                    keysFromRootToHere
            ) {
                var subtreePropertyName,
                    subtreePropertyValue,
                    metadata,
                    strFunctionName;

                for (subtreePropertyName in controllerSubtree) {
                    if (controllerSubtree.hasOwnProperty(subtreePropertyName)) {

                        subtreePropertyValue = controllerSubtree[subtreePropertyName];

                        keysFromRootToHere.push(subtreePropertyName);

                        if ($.isPlainObject(subtreePropertyValue)) {
                            processTreeRecursively(
                                subtreePropertyValue,
                                arrAnnotationListeners,
                                result,
                                keysFromRootToHere
                            );

                        } else if ($.isFunction(subtreePropertyValue)) {
                            metadata = {};
                            strFunctionName = undefined;
                            $.each(
                                keysFromRootToHere,
                                function(idxAnnotation, key) {
                                    var keyTrimmed = $.trim(key),
                                        annotation;
                                    if (keyTrimmed.charAt(0) === '@') {
                                        annotation = keyTrimmed;
                                        $.each(
                                            arrAnnotationListeners,
                                            function (idxListener, listener) {
                                                listener(
                                                    annotation,
                                                    subtreePropertyValue,
                                                    metadata
                                                );
                                            }
                                        );
                                    } else {
                                        if (strFunctionName) {
                                            throw errorUtil.createError(
                                                "Function name already specified; " +
                                                    "unexpected key: '" + strFunctionName + "'."
                                            );
                                        }
                                        strFunctionName = keyTrimmed;
                                    }
                                }
                            );

                            if (!strFunctionName) {
                                throw errorUtil.createError(
                                    "Function name not specified for: " + subtreePropertyValue
                                );
                            }

                            result[strFunctionName] = {
                                metadata: metadata,
                                code: subtreePropertyValue
                            };
                        }

                        keysFromRootToHere.pop();

                    }
                }
            }

            var result = {};
            processTreeRecursively(controller, arrAnnotationListeners, result, []);
            return result;

    }

    };

}());