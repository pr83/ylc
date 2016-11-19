var domTemplates = require("../domTemplates"),
    stringUtil = require("../stringUtil"),
    ylcBindParser = require("../parser/ylcBind"),
    errorUtil = require("../errorUtil"),
    virtualNodes = require("../virtualNodes");

function createV2m(currentYlcBinding) {

    return function (domElement, context) {

        var jqElement = $(domElement),
            value,
            fnGetter,
            forceSet =
                currentYlcBinding.strMappingOperator === ylcBindParser.MAPPING_V2M_ONLY_FORCED;

        if (stringUtil.isEmpty(currentYlcBinding.strPropertyName)) {
            value = jqElement.get();

        } else {
            fnGetter = jqElement[currentYlcBinding.strPropertyName];

            if (!fnGetter instanceof Function) {
                throw errorUtil.createError(
                    "Cannot find jQuery getter/setter called '" +
                    currentYlcBinding.strPropertyName + "'.",
                    jqElement.get()
                );
            }

            if (currentYlcBinding.strSubpropertyName === undefined) {
                value = fnGetter.call(jqElement);
            } else {
                value = fnGetter.call(jqElement, currentYlcBinding.strSubpropertyName);
            }
        }

        try {
            context.setValue(currentYlcBinding.astBindingExpression, value, forceSet);

        } catch (err) {
            throw errorUtil.elementToError(err, domElement);
        }

    }
}

module.exports = {

    "@DomPreprocessorFactory": function() {

        return {
            nodeStart: function(jqNode, metadata) {

                metadata.v2m = metadata.v2m || [];

                var arrYlcBind = metadata.ylcBind,
                    idxYlcBind,
                    currentYlcBinding,
                    bHasV2m = false;

                for (idxYlcBind = 0; idxYlcBind < arrYlcBind.length; idxYlcBind += 1) {
                    currentYlcBinding = arrYlcBind[idxYlcBind];

                    if (currentYlcBinding.strMappingOperator !== ylcBindParser.MAPPING_BIDIRECTIONAL &&
                        currentYlcBinding.strMappingOperator !== ylcBindParser.MAPPING_V2M_ONLY &&
                        currentYlcBinding.strMappingOperator !== ylcBindParser.MAPPING_V2M_ONLY_FORCED) {
                        continue;
                    }

                    metadata.v2m.push(createV2m(currentYlcBinding));
                    bHasV2m = true;

                }

                return {
                    bMakeVirtual: false,
                    bHasV2m: bHasV2m,
                    bHasM2v: false
                };

            },

            nodeEnd: function() {
                return false;
            }
        };
    }

};