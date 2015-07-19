module.exports = (function () {

    return {

        processAnnotations: function(controller, arrAnnotationListeners) {

            function processAnnotationsRecursively(
                controllerSubtree,
                arrAnnotationListeners,
                result,
                annotationsFromRootToHere
            ) {
                var subtreePropertyName,
                    subtreePropertyValue,
                    metadata;

                for (subtreePropertyName in controllerSubtree) {
                    if (controllerSubtree.hasOwnProperty(subtreePropertyName)) {

                        subtreePropertyValue = controllerSubtree[subtreePropertyName];

                        if ($.isPlainObject(subtreePropertyValue)) {
                            annotationsFromRootToHere.push(subtreePropertyName);
                            processAnnotationsRecursively(
                                subtreePropertyValue,
                                arrAnnotationListeners,
                                result,
                                annotationsFromRootToHere
                            );
                            annotationsFromRootToHere.pop();

                        } else if ($.isFunction(subtreePropertyValue)) {
                            metadata = {};
                            $.each(
                                annotationsFromRootToHere,
                                function(idxAnnotation, annotation) {
                                    $.each(
                                        arrAnnotationListeners,
                                        function(idxListener, listener) {
                                            listener(annotation, subtreePropertyValue, metadata);
                                        }
                                    );
                                }
                            );
                            result[subtreePropertyName] = {
                                metadata: metadata,
                                code: subtreePropertyValue
                            };
                        }

                    }
                }
            }

            var result = {};
            processAnnotationsRecursively(controller, arrAnnotationListeners, result, []);
            return result;

    }

    };

}());